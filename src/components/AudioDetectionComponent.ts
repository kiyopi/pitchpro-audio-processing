/**
 * AudioDetectionComponent - Unified Audio Detection with Automatic UI Updates
 * 
 * @description High-level integration component that combines PitchDetector functionality
 * with automatic UI updates, device optimization, and comprehensive error handling.
 * Designed to simplify audio detection integration in relative pitch training applications.
 * 
 * @example
 * ```typescript
 * const audioDetector = new AudioDetectionComponent({
 *   volumeBarSelector: '#volume-bar',
 *   frequencySelector: '#frequency-display',
 *   clarityThreshold: 0.4,
 *   minVolumeAbsolute: 0.003
 * });
 * 
 * await audioDetector.initialize();
 * 
 * audioDetector.setCallbacks({
 *   onPitchUpdate: (result) => {
 *     console.log('音程検出:', result);
 *     // { frequency: 261.6, note: 'C4', volume: 45.2 }
 *   },
 *   onError: (error) => {
 *     console.error('検出エラー:', error);
 *   }
 * });
 * 
 * audioDetector.startDetection();
 * ```
 * 
 * @version 1.0.0
 * @since 1.0.0
 */

import { AudioManager } from '../core/AudioManager';
import { PitchDetector } from '../core/PitchDetector';
import { MicrophoneController } from '../core/MicrophoneController';
import { DeviceDetection } from '../utils/DeviceDetection';
import { FrequencyUtils } from '../utils/FrequencyUtils';
import { 
  PitchProError, 
  ErrorMessageBuilder, 
  AudioContextError,
  MicrophoneAccessError,
  ErrorCode
} from '../utils/errors';
import type { PitchDetectionResult, DeviceSpecs } from '../types';

/**
 * Configuration interface for AudioDetectionComponent
 */
export interface AudioDetectionConfig {
  // UI Element Selectors
  volumeBarSelector?: string;
  volumeTextSelector?: string;
  frequencySelector?: string;
  noteSelector?: string;
  
  // PitchDetector Settings
  clarityThreshold?: number;
  minVolumeAbsolute?: number;
  fftSize?: number;
  smoothing?: number;
  
  // Device Optimization
  deviceOptimization?: boolean;
  
  // UI Update Settings
  uiUpdateInterval?: number;
  autoUpdateUI?: boolean;
  
  // Debug Settings
  debug?: boolean;
  logPrefix?: string;
}

/**
 * Callback functions for AudioDetectionComponent events
 */
export interface AudioDetectionCallbacks {
  onPitchUpdate?: (result: PitchDetectionResult) => void;
  onVolumeUpdate?: (volume: number) => void;
  onStateChange?: (state: 'uninitialized' | 'initializing' | 'ready' | 'detecting' | 'stopped' | 'error') => void;
  onError?: (error: PitchProError) => void;
  onDeviceDetected?: (deviceSpecs: DeviceSpecs) => void;
}

/**
 * Device-specific optimization settings
 */
interface DeviceSettings {
  volumeMultiplier: number;
  sensitivityMultiplier: number;
  minVolumeAbsolute: number;
}

export class AudioDetectionComponent {
  /** @private Configuration with applied defaults */
  private config: Required<AudioDetectionConfig>;
  
  /** @private AudioManager instance for resource management */
  private audioManager: AudioManager;
  
  /** @private PitchDetector instance for pitch detection */
  private pitchDetector: PitchDetector | null = null;
  
  /** @private MicrophoneController for high-level microphone management */
  private micController: MicrophoneController | null = null;
  
  /** @private Current component state */
  private currentState: 'uninitialized' | 'initializing' | 'ready' | 'detecting' | 'stopped' | 'error' = 'uninitialized';
  
  /** @private Event callbacks */
  private callbacks: AudioDetectionCallbacks = {};
  
  /** @private Device specifications */
  private deviceSpecs: DeviceSpecs | null = null;
  
  /** @private Device-specific settings */
  private deviceSettings: DeviceSettings | null = null;
  
  /** @private UI update interval ID */
  private uiUpdateTimer: number | null = null;
  
  /** @private UI elements cache */
  private uiElements: {
    volumeBar?: HTMLElement;
    volumeText?: HTMLElement;
    frequency?: HTMLElement;
    note?: HTMLElement;
  } = {};
  
  /** @private Last error encountered */
  private lastError: PitchProError | null = null;
  
  /** @private Initialization state */
  private isInitialized = false;

  /**
   * Creates a new AudioDetectionComponent with automatic device optimization
   * 
   * @param config - Configuration options for the component
   * @param config.volumeBarSelector - CSS selector for volume bar element
   * @param config.volumeTextSelector - CSS selector for volume text element  
   * @param config.frequencySelector - CSS selector for frequency display element
   * @param config.noteSelector - CSS selector for note display element
   * @param config.clarityThreshold - Minimum clarity for pitch detection (0-1, default: 0.4)
   * @param config.minVolumeAbsolute - Minimum volume threshold (default: 0.003)
   * @param config.fftSize - FFT size for analysis (default: 4096)
   * @param config.smoothing - Smoothing factor (default: 0.1)
   * @param config.deviceOptimization - Enable automatic device optimization (default: true)
   * @param config.uiUpdateInterval - UI update interval in ms (default: 50)
   * @param config.autoUpdateUI - Enable automatic UI updates (default: true)
   * @param config.debug - Enable debug logging (default: false)
   * @param config.logPrefix - Prefix for log messages (default: '🎵 AudioDetection')
   * 
   * @example
   * ```typescript
   * // Basic usage with automatic device optimization
   * const audioDetector = new AudioDetectionComponent({
   *   volumeBarSelector: '#volume-bar',
   *   frequencySelector: '#frequency-display'
   * });
   * 
   * // Advanced configuration for range testing
   * const audioDetector = new AudioDetectionComponent({
   *   volumeBarSelector: '#range-test-volume-bar',
   *   volumeTextSelector: '#range-test-volume-text', 
   *   frequencySelector: '#range-test-frequency-value',
   *   clarityThreshold: 0.3,
   *   minVolumeAbsolute: 0.001,
   *   deviceOptimization: true,
   *   debug: true
   * });
   * ```
   */
  constructor(config: AudioDetectionConfig = {}) {
    // Apply default configuration
    this.config = {
      volumeBarSelector: config.volumeBarSelector || '#volume-bar',
      volumeTextSelector: config.volumeTextSelector || '#volume-text',
      frequencySelector: config.frequencySelector || '#frequency-display',
      noteSelector: config.noteSelector || '#note-display',
      
      clarityThreshold: config.clarityThreshold ?? 0.4,
      minVolumeAbsolute: config.minVolumeAbsolute ?? 0.003,
      fftSize: config.fftSize ?? 4096,
      smoothing: config.smoothing ?? 0.1,
      
      deviceOptimization: config.deviceOptimization ?? true,
      
      uiUpdateInterval: config.uiUpdateInterval ?? 50, // 20fps
      autoUpdateUI: config.autoUpdateUI ?? true,
      
      debug: config.debug ?? false,
      logPrefix: config.logPrefix ?? '🎵 AudioDetection'
    };

    // Initialize AudioManager
    this.audioManager = new AudioManager({
      sampleRate: 44100,
      channelCount: 1,
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false
    });

    // Detect device and apply optimization
    if (this.config.deviceOptimization) {
      this.detectAndOptimizeDevice();
    }

    this.debugLog('AudioDetectionComponent created with config:', this.config);
  }

  /**
   * Initializes the audio detection system with device optimization
   * 
   * @description Performs complete initialization including microphone permissions,
   * audio context setup, device detection, and UI element binding.
   * 
   * @returns Promise resolving when initialization is complete
   * @throws {AudioContextError} If audio system initialization fails
   * @throws {MicrophoneAccessError} If microphone permission is denied
   * 
   * @example
   * ```typescript
   * try {
   *   await audioDetector.initialize();
   *   console.log('Audio detection ready!');
   * } catch (error) {
   *   console.error('Initialization failed:', error.message);
   *   // Handle specific error types
   *   if (error instanceof MicrophoneAccessError) {
   *     // Show permission guidance
   *   }
   * }
   * ```
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      this.debugLog('Already initialized');
      return;
    }

    try {
      this.updateState('initializing');
      this.debugLog('Starting initialization...');

      // Initialize MicrophoneController
      this.micController = new MicrophoneController(
        {
          sampleRate: 44100,
          echoCancellation: false,
          autoGainControl: false
        },
        {
          maxRetries: 3,
          retryDelayMs: 1000
        },
        this.config.debug // Enable error notifications if debug is on
      );

      // Set up MicrophoneController callbacks
      this.micController.setCallbacks({
        onStateChange: (state) => {
          this.debugLog('MicrophoneController state:', state);
        },
        onError: (error) => {
          this.handleError(error, 'microphone_controller');
        },
        onDeviceChange: (specs) => {
          this.deviceSpecs = specs;
          this.callbacks.onDeviceDetected?.(specs);
        }
      });

      // Initialize microphone
      await this.micController.initialize();

      // Initialize PitchDetector
      this.pitchDetector = new PitchDetector(this.audioManager, {
        clarityThreshold: this.config.clarityThreshold,
        minVolumeAbsolute: this.config.minVolumeAbsolute,
        fftSize: this.config.fftSize,
        smoothing: this.config.smoothing
      });

      // Set up PitchDetector callbacks
      this.pitchDetector.setCallbacks({
        onPitchUpdate: (result) => {
          this.handlePitchUpdate(result);
        },
        onError: (error) => {
          this.handleError(error, 'pitch_detector');
        },
        onStateChange: (state) => {
          this.debugLog('PitchDetector state:', state);
        }
      });

      await this.pitchDetector.initialize();

      // Cache UI elements
      this.cacheUIElements();

      // Apply device-specific sensitivity
      if (this.deviceSettings && this.micController) {
        this.micController.setSensitivity(this.deviceSettings.sensitivityMultiplier);
        this.debugLog('Applied device-specific sensitivity:', this.deviceSettings.sensitivityMultiplier);
      }

      this.isInitialized = true;
      this.updateState('ready');
      this.debugLog('Initialization complete');

    } catch (error) {
      const structuredError = this.createStructuredError(error as Error, 'initialization');
      ErrorMessageBuilder.logError(structuredError, 'AudioDetectionComponent initialization');
      
      this.lastError = structuredError;
      this.updateState('error');
      
      throw structuredError;
    }
  }

  /**
   * Sets callback functions for audio detection events
   * 
   * @param callbacks - Object containing callback functions
   * @param callbacks.onPitchUpdate - Called when pitch is detected
   * @param callbacks.onVolumeUpdate - Called when volume changes
   * @param callbacks.onStateChange - Called when component state changes
   * @param callbacks.onError - Called when errors occur
   * @param callbacks.onDeviceDetected - Called when device is detected
   * 
   * @example
   * ```typescript
   * audioDetector.setCallbacks({
   *   onPitchUpdate: (result) => {
   *     console.log(`${result.note} - ${result.frequency.toFixed(1)}Hz`);
   *   },
   *   onVolumeUpdate: (volume) => {
   *     console.log(`Volume: ${volume.toFixed(1)}%`);
   *   },
   *   onError: (error) => {
   *     console.error('Detection error:', error.message);
   *   }
   * });
   * ```
   */
  setCallbacks(callbacks: AudioDetectionCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
    this.debugLog('Callbacks updated');
  }

  /**
   * Starts pitch detection and automatic UI updates
   * 
   * @returns True if detection started successfully, false otherwise
   * @throws {PitchProError} If component is not initialized or detection fails
   * 
   * @example
   * ```typescript
   * if (audioDetector.startDetection()) {
   *   console.log('Detection started successfully');
   * } else {
   *   console.log('Failed to start detection');
   * }
   * ```
   */
  startDetection(): boolean {
    if (!this.isInitialized || !this.pitchDetector) {
      const error = new PitchProError(
        'AudioDetectionComponentが初期化されていません。initialize()メソッドを先に呼び出してください。',
        ErrorCode.AUDIO_CONTEXT_ERROR,
        {
          operation: 'startDetection',
          isInitialized: this.isInitialized,
          hasPitchDetector: !!this.pitchDetector,
          currentState: this.currentState
        }
      );
      
      ErrorMessageBuilder.logError(error, 'AudioDetection start');
      this.handleError(error, 'start_detection');
      throw error;
    }

    try {
      const started = this.pitchDetector.startDetection();
      
      if (started) {
        this.updateState('detecting');
        
        // Start UI update timer
        if (this.config.autoUpdateUI) {
          this.startUIUpdates();
        }
        
        this.debugLog('Detection started successfully');
        return true;
      } else {
        this.debugLog('Failed to start detection');
        return false;
      }
    } catch (error) {
      const structuredError = this.createStructuredError(error as Error, 'start_detection');
      this.handleError(structuredError, 'start_detection');
      throw structuredError;
    }
  }

  /**
   * Stops pitch detection and UI updates
   * 
   * @example
   * ```typescript
   * audioDetector.stopDetection();
   * console.log('Detection stopped');
   * ```
   */
  stopDetection(): void {
    try {
      if (this.pitchDetector) {
        this.pitchDetector.stopDetection();
      }
      
      this.stopUIUpdates();
      this.updateState('stopped');
      this.debugLog('Detection stopped');
    } catch (error) {
      const structuredError = this.createStructuredError(error as Error, 'stop_detection');
      this.handleError(structuredError, 'stop_detection');
    }
  }

  /**
   * Manually updates UI elements with current audio data
   * 
   * @param result - Pitch detection result to display
   * 
   * @example
   * ```typescript
   * const result = {
   *   frequency: 440,
   *   note: 'A4',
   *   volume: 75.5,
   *   clarity: 0.8
   * };
   * audioDetector.updateUI(result);
   * ```
   */
  updateUI(result: PitchDetectionResult): void {
    try {
      // Update volume bar
      if (this.uiElements.volumeBar) {
        const volumePercent = Math.min(100, result.volume * (this.deviceSettings?.volumeMultiplier ?? 1.0));
        if (this.uiElements.volumeBar instanceof HTMLProgressElement) {
          this.uiElements.volumeBar.value = volumePercent;
        } else {
          // Assume it's a div with a width style
          (this.uiElements.volumeBar as HTMLElement).style.width = `${volumePercent}%`;
        }
      }

      // Update volume text
      if (this.uiElements.volumeText) {
        const volumePercent = Math.min(100, result.volume * (this.deviceSettings?.volumeMultiplier ?? 1.0));
        this.uiElements.volumeText.textContent = `${volumePercent.toFixed(1)}%`;
      }

      // Update frequency display
      if (this.uiElements.frequency) {
        this.uiElements.frequency.textContent = FrequencyUtils.formatFrequency(result.frequency);
      }

      // Update note display
      if (this.uiElements.note) {
        const noteInfo = FrequencyUtils.frequencyToNote(result.frequency);
        this.uiElements.note.textContent = noteInfo.name;
      }
    } catch (error) {
      this.debugLog('UI update error:', error);
    }
  }

  /**
   * Destroys the component and cleans up all resources
   * 
   * @example
   * ```typescript
   * // Clean up when component is no longer needed
   * audioDetector.destroy();
   * ```
   */
  destroy(): void {
    this.debugLog('Destroying AudioDetectionComponent...');
    
    try {
      // Stop detection and UI updates
      this.stopDetection();
      
      // Cleanup components
      if (this.pitchDetector) {
        this.pitchDetector.destroy();
        this.pitchDetector = null;
      }
      
      if (this.micController) {
        this.micController.destroy();
        this.micController = null;
      }
      
      // Clear UI elements cache
      this.uiElements = {};
      
      // Reset state
      this.isInitialized = false;
      this.currentState = 'uninitialized';
      this.callbacks = {};
      this.lastError = null;
      
      this.debugLog('AudioDetectionComponent destroyed');
    } catch (error) {
      console.error('Error during AudioDetectionComponent destruction:', error);
    }
  }

  /**
   * Gets current component status for debugging
   * 
   * @returns Status object with current state information
   */
  getStatus() {
    return {
      state: this.currentState,
      isInitialized: this.isInitialized,
      deviceSpecs: this.deviceSpecs,
      deviceSettings: this.deviceSettings,
      config: this.config,
      lastError: this.lastError,
      pitchDetectorStatus: this.pitchDetector?.getStatus(),
      micControllerStatus: this.micController?.getStatus()
    };
  }

  // Private methods implementation continues...
  // (Will be implemented in the next part)

  /**
   * Detects device type and applies optimization settings
   * @private
   */
  private detectAndOptimizeDevice(): void {
    this.deviceSpecs = DeviceDetection.getDeviceSpecs();
    
    // Define device-specific settings
    const deviceSettingsMap: Record<string, DeviceSettings> = {
      PC: {
        volumeMultiplier: 3.0,
        sensitivityMultiplier: 2.5,
        minVolumeAbsolute: 0.003
      },
      iPhone: {
        volumeMultiplier: 4.5,
        sensitivityMultiplier: 3.5,
        minVolumeAbsolute: 0.002
      },
      iPad: {
        volumeMultiplier: 7.0,
        sensitivityMultiplier: 5.0,
        minVolumeAbsolute: 0.001
      }
    };

    this.deviceSettings = deviceSettingsMap[this.deviceSpecs.deviceType] || deviceSettingsMap.PC;
    
    // Apply device-specific volume threshold
    this.config.minVolumeAbsolute = this.deviceSettings.minVolumeAbsolute;
    
    this.debugLog('Device optimization applied:', {
      device: this.deviceSpecs.deviceType,
      settings: this.deviceSettings
    });
  }

  /**
   * Caches UI elements for efficient updates
   * @private
   */
  private cacheUIElements(): void {
    if (this.config.volumeBarSelector) {
      this.uiElements.volumeBar = document.querySelector(this.config.volumeBarSelector) || undefined;
    }
    if (this.config.volumeTextSelector) {
      this.uiElements.volumeText = document.querySelector(this.config.volumeTextSelector) || undefined;
    }
    if (this.config.frequencySelector) {
      this.uiElements.frequency = document.querySelector(this.config.frequencySelector) || undefined;
    }
    if (this.config.noteSelector) {
      this.uiElements.note = document.querySelector(this.config.noteSelector) || undefined;
    }

    this.debugLog('UI elements cached:', Object.keys(this.uiElements));
  }

  /**
   * Handles pitch update events from PitchDetector
   * @private
   */
  private handlePitchUpdate(result: PitchDetectionResult): void {
    // Notify callback
    this.callbacks.onPitchUpdate?.(result);
    
    // Notify volume callback
    this.callbacks.onVolumeUpdate?.(result.volume);
    
    // UI updates are handled by the timer for consistent frame rate
  }

  /**
   * Starts UI update timer
   * @private
   */
  private startUIUpdates(): void {
    if (this.uiUpdateTimer) {
      clearInterval(this.uiUpdateTimer);
    }
    
    this.uiUpdateTimer = window.setInterval(() => {
      if (this.pitchDetector && this.currentState === 'detecting') {
        // Get the latest pitch detection result
        const result = this.pitchDetector.getLatestResult();
        if (result) {
          this.updateUI(result);
        }
      }
    }, this.config.uiUpdateInterval);
  }

  /**
   * Stops UI update timer
   * @private
   */
  private stopUIUpdates(): void {
    if (this.uiUpdateTimer) {
      clearInterval(this.uiUpdateTimer);
      this.uiUpdateTimer = null;
    }
  }

  /**
   * Updates component state and notifies callbacks
   * @private
   */
  private updateState(newState: typeof this.currentState): void {
    if (this.currentState !== newState) {
      const oldState = this.currentState;
      this.currentState = newState;
      
      this.debugLog(`State changed: ${oldState} → ${newState}`);
      this.callbacks.onStateChange?.(newState);
    }
  }

  /**
   * Handles errors with proper logging and callback notification
   * @private
   */
  private handleError(error: Error | PitchProError, context: string): void {
    const structuredError = error instanceof PitchProError 
      ? error 
      : this.createStructuredError(error, context);

    this.lastError = structuredError;
    this.updateState('error');
    
    this.callbacks.onError?.(structuredError);
    this.debugLog('Error handled:', structuredError.toJSON());
  }

  /**
   * Creates structured error with context information
   * @private
   */
  private createStructuredError(error: Error, operation: string): PitchProError {
    if (error.message.includes('Permission denied') || 
        error.message.includes('NotAllowedError') ||
        error.message.includes('permission')) {
      return new MicrophoneAccessError(
        'マイクへのアクセス許可が拒否されました。ブラウザの設定でマイクアクセスを許可してください。',
        {
          operation,
          originalError: error.message,
          deviceSpecs: this.deviceSpecs,
          componentState: this.currentState
        }
      );
    }
    
    if (error.message.includes('AudioContext') || 
        error.message.includes('audio') ||
        error.message.includes('initialization')) {
      return new AudioContextError(
        'オーディオシステムの初期化に失敗しました。デバイスの音響設定を確認するか、ブラウザを再起動してください。',
        {
          operation,
          originalError: error.message,
          componentState: this.currentState,
          deviceSpecs: this.deviceSpecs
        }
      );
    }
    
    return new PitchProError(
      `${operation}中に予期しないエラーが発生しました: ${error.message}`,
      ErrorCode.PITCH_DETECTION_ERROR,
      {
        operation,
        originalError: error.message,
        stack: error.stack,
        componentState: this.currentState,
        isInitialized: this.isInitialized
      }
    );
  }

  /**
   * Debug logging utility
   * @private
   */
  private debugLog(message: string, ...args: any[]): void {
    if (this.config.debug) {
      console.log(`${this.config.logPrefix} ${message}`, ...args);
    }
  }
}