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
 *   minVolumeAbsolute: 0.003  // ノイズゲート閾値（デバイス自動最適化される）
 * });
 *
 * await audioDetector.initialize();
 *
 * audioDetector.setCallbacks({
 *   onPitchUpdate: (result) => {
 *     console.log('音程検出:', result);
 *     // result.volume は既にデバイス固有補正済み（0-100%）
 *     // PC: 生音量 × 3.0, iPhone: 生音量 × 7.5, iPad: 生音量 × 20.0
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
 * @remarks
 * **音量調整について（v1.2.9）**:
 * - デフォルトでは音量値は自動的にデバイス最適化が適用されます
 * - PC/iPhone/iPad の違いを意識する必要はありません
 * - 最終的な音量値は常に 0-100% の範囲で統一されています
 *
 * **カスタム音量処理が必要な場合**:
 * ```typescript
 * // deviceOptimization: false で生の音量値を取得
 * const audioDetector = new AudioDetectionComponent({
 *   deviceOptimization: false,  // 自動補正を無効化
 *   volumeBarSelector: '#volume-bar'
 * });
 *
 * audioDetector.setCallbacks({
 *   onPitchUpdate: (result) => {
 *     // result.volume は生の値（通常5-15%）
 *     const customVolume = result.volume * yourCustomMultiplier;
 *   }
 * });
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
  /**
   * CSS selector for volume bar element.
   * @warning When this selector is used with autoUpdateUI=true, the UI will be updated automatically.
   * The value applied includes device-specific multipliers and may NOT be identical
   * to the `result.volume` in the onPitchUpdate callback. For direct control,
   * omit this selector and update the UI manually within the callback.
   * @example
   * // Manual control (recommended for precise values)
   * { autoUpdateUI: false } // Handle UI in onPitchUpdate callback
   * 
   * // Automatic control (convenient but may apply multipliers)
   * { autoUpdateUI: true, volumeBarSelector: '#volume' }
   */
  volumeBarSelector?: string;
  
  /**
   * CSS selector for volume text element.
   * @warning Same considerations as volumeBarSelector apply.
   */
  volumeTextSelector?: string;
  
  /**
   * CSS selector for frequency display element.
   * @warning Same considerations as volumeBarSelector apply.
   */
  frequencySelector?: string;
  
  /**
   * CSS selector for note display element.
   * @warning Same considerations as volumeBarSelector apply.
   */
  noteSelector?: string;
  
  // PitchDetector Settings
  clarityThreshold?: number;
  minVolumeAbsolute?: number;
  fftSize?: number;
  smoothing?: number;
  
  // Device Optimization
  /**
   * デバイス固有の音量最適化を有効にするかどうか
   *
   * @remarks
   * **デバイス最適化の効果**:
   * - `true` (推奨): デバイス別の音量補正が自動適用
   *   - PC: volumeMultiplier 3.0x
   *   - iPhone: volumeMultiplier 7.5x
   *   - iPad: volumeMultiplier 20.0x
   * - `false`: 音量補正なし（生の音量値をそのまま使用）
   *
   * **オフにする場合の用途**:
   * - 独自の音量処理を実装したい場合
   * - デバッグ時に生の音量値を確認したい場合
   * - 特定のデバイスで異なる動作を実装したい場合
   *
   * @default true
   * @since v1.2.0
   *
   * @example
   * ```typescript
   * // デバイス最適化を無効にして生の音量値を取得
   * const audioDetector = new AudioDetectionComponent({
   *   deviceOptimization: false,  // 音量補正を無効化
   *   volumeBarSelector: '#volume-bar'
   * });
   *
   * audioDetector.setCallbacks({
   *   onPitchUpdate: (result) => {
   *     // result.volume は生の値（通常5-15%程度）
   *     console.log(`生音量: ${result.volume}%`);
   *
   *     // 独自の音量処理
   *     const customVolume = result.volume * myCustomMultiplier;
   *     updateMyUI(customVolume);
   *   }
   * });
   * ```
   */
  deviceOptimization?: boolean;
  
  // UI Update Settings
  uiUpdateInterval?: number;
  
  /**
   * Controls automatic UI updates using provided selectors.
   * @default true (for backward compatibility)
   * @description When true, UI elements specified by selectors will be updated automatically
   * with device-specific multipliers applied. When false, no automatic updates occur
   * and you should handle UI updates manually in the onPitchUpdate callback.
   * @example
   * // Recommended: Manual control for precise values
   * const detector = new AudioDetectionComponent({
   *   autoUpdateUI: false,
   *   // Don't provide selectors when using manual mode
   * });
   * detector.setCallbacks({
   *   onPitchUpdate: (result) => {
   *     // Handle UI updates with exact result.volume values
   *     volumeBar.style.width = `${result.volume}%`;
   *   }
   * });
   * 
   * // Alternative: Automatic control (may apply multipliers)
   * const detector = new AudioDetectionComponent({
   *   autoUpdateUI: true,
   *   volumeBarSelector: '#volume-bar'
   * });
   */
  autoUpdateUI?: boolean;
  
  // Callback Settings (for convenience)
  /**
   * Callback function called on each pitch detection update.
   * @param result - The processed pitch detection result including rawVolume and clarity.
   */
  onPitchUpdate?: (result: PitchDetectionResult) => void;
  
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
  /** @private UI timing constants */
  private static readonly NOTE_RESET_DELAY_MS = 300;
  private static readonly SELECTOR_UPDATE_DELAY_MS = 50;
  private static readonly UI_RESTART_DELAY_MS = 200;

  /** @private Configuration with applied defaults */
  private config: Required<Omit<AudioDetectionConfig, 'volumeBarSelector' | 'volumeTextSelector' | 'frequencySelector' | 'noteSelector' | 'onPitchUpdate'>> & {
    volumeBarSelector?: string;
    volumeTextSelector?: string;
    frequencySelector?: string;
    noteSelector?: string;
    onPitchUpdate?: (result: PitchDetectionResult) => void;
  };
  
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
  
  /** @private Flag to prevent UI updates during selector changes */
  private isUpdatingSelectors: boolean = false;
  
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

  /** @private Note display persistence timer */
  private noteResetTimer: number | null = null;

  /** @private Helper method for creating delays */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

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
   * @param config.deviceOptimization - デバイス固有の音量最適化を有効にする (default: true)
   *   - true: 自動音量補正 (PC: 3.0x, iPhone: 7.5x, iPad: 20.0x)
   *   - false: 生音量値を使用（独自処理向け）
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
      volumeBarSelector: config.volumeBarSelector,
      volumeTextSelector: config.volumeTextSelector,
      frequencySelector: config.frequencySelector,
      noteSelector: config.noteSelector,
      
      clarityThreshold: config.clarityThreshold ?? 0.4,
      minVolumeAbsolute: config.minVolumeAbsolute ?? 0.020, // 🔧 環境適応ノイズゲート: 10%閾値でマイクノイズを確実にブロック
      fftSize: config.fftSize ?? 4096,
      smoothing: config.smoothing ?? 0.1,
      
      deviceOptimization: config.deviceOptimization ?? true,
      
      uiUpdateInterval: config.uiUpdateInterval ?? 50, // 20fps
      autoUpdateUI: config.autoUpdateUI ?? true,
      
      onPitchUpdate: config.onPitchUpdate, // コールバック関数はオプショナル
      
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

    // UI自動更新機能の警告メッセージ
    this.checkAutoUpdateUIWarnings();
    
    this.debugLog('AudioDetectionComponent created with config:', this.config);
  }

  /**
   * 自動UI更新機能に関する警告をチェックして表示
   */
  private checkAutoUpdateUIWarnings(): void {
    const hasUISelectors = !!(
      this.config.volumeBarSelector || 
      this.config.volumeTextSelector || 
      this.config.frequencySelector || 
      this.config.noteSelector
    );
    
    if (hasUISelectors && !this.config.autoUpdateUI) {
      console.warn(
        '⚠️ [PitchPro v1.1.9] UI selectors provided without autoUpdateUI=true. ' +
        'Set autoUpdateUI=true to enable automatic updates, ' +
        'or remove selectors for manual control in onPitchUpdate callback.'
      );
    }
    
    if (hasUISelectors && this.config.autoUpdateUI) {
      console.info(
        'ℹ️ [PitchPro] Automatic UI updates enabled. ' +
        'Note: Values applied may include device-specific multipliers and may differ from callback result.volume. ' +
        'For precise control, set autoUpdateUI=false and handle UI manually.'
      );
    }
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
      this.micController = new MicrophoneController({
        audioManager: {
          sampleRate: 44100,
          echoCancellation: false,
          autoGainControl: false
        },
        lifecycle: {
          maxAutoRecoveryAttempts: 3,
          healthCheckIntervalMs: 1000
        },
        notifications: {
          enabled: this.config.debug
        }
      });

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

      // Log DeviceDetection values when debug is enabled
      this.debugLog('DeviceDetection values:', {
        device: this.deviceSpecs?.deviceType,
        noiseGate: this.deviceSpecs?.noiseGate,
        volumeMultiplier: this.deviceSpecs?.volumeMultiplier,
        smoothingFactor: this.deviceSpecs?.smoothingFactor
      });

      // Initialize PitchDetector with DeviceDetection settings (NO custom calculations)
      const pitchDetectorConfig = {
        clarityThreshold: this.config.clarityThreshold,
        // ⬇️ DeviceDetectionから取得したnoiseGate値をそのまま渡す
        minVolumeAbsolute: this.deviceSpecs?.noiseGate ?? this.config.minVolumeAbsolute,
        fftSize: this.config.fftSize,
        smoothing: this.deviceSpecs?.smoothingFactor ?? this.config.smoothing,
        deviceOptimization: this.config.deviceOptimization
      };

      this.debugLog('PitchDetector config object:', pitchDetectorConfig);

      this.pitchDetector = new PitchDetector(this.audioManager, pitchDetectorConfig);

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
          // 🎯 Start UI updates when detection begins
          if (state === 'detecting' && this.config.autoUpdateUI) {
            this.debugLog('🔄 Starting UI updates (state: detecting)');
            this.startUIUpdates();
          } else if (state !== 'detecting' && this.uiUpdateTimer) {
            this.debugLog('⏹️ Stopping UI updates (state: ' + state + ')');
            clearInterval(this.uiUpdateTimer);
            this.uiUpdateTimer = null;
          }
        }
      });

      await this.pitchDetector.initialize();

      // Verify PitchDetector's actual status after initialization
      const pitchDetectorStatus = this.pitchDetector.getStatus();
      this.debugLog('After PitchDetector initialization:', {
        status: pitchDetectorStatus,
        componentState: pitchDetectorStatus.componentState,
        isInitialized: pitchDetectorStatus.isInitialized
      });

      // ⭐ Register PitchDetector and AudioDetectionComponent with MicrophoneController for unified management
      if (this.micController && this.pitchDetector) {
        this.micController.registerDetector(this.pitchDetector);
        this.micController.registerAudioDetectionComponent(this);
        this.debugLog('✅ PitchDetector and AudioDetectionComponent registered with MicrophoneController for unified management');
      }

      // Cache UI elements
      this.cacheUIElements();

      // Apply device-specific sensitivity from DeviceDetection
      if (this.deviceSpecs && this.micController) {
        this.micController.setSensitivity(this.deviceSpecs.sensitivity);
        this.debugLog('Applied DeviceDetection sensitivity:', this.deviceSpecs.sensitivity);
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
    // Skip UI updates if autoUpdateUI is disabled
    if (!this.config.autoUpdateUI) {
      return;
    }
    
    // Skip UI updates if selectors are being updated
    if (this.isUpdatingSelectors) {
      this.debugLog('UI update skipped - selectors are being updated');
      return;
    }
    
    try {
      // Update volume bar - verify element matches current selector to prevent cross-mode updates
      if (this.uiElements.volumeBar && this.config.volumeBarSelector) {
        const currentElement = document.querySelector(this.config.volumeBarSelector);
        if (currentElement && currentElement === this.uiElements.volumeBar) {
          // result.volume は既に補正済みの値（_getProcessedResultで処理済み）
          const volumePercent = Math.min(100, Math.max(0, result.volume));
          if (this.uiElements.volumeBar instanceof HTMLProgressElement) {
            this.uiElements.volumeBar.value = volumePercent;
          } else {
            // Assume it's a div with a width style
            (this.uiElements.volumeBar as HTMLElement).style.width = `${volumePercent}%`;
          }
        }
      }

      // Update volume text - verify element matches current selector to prevent cross-mode updates
      if (this.uiElements.volumeText && this.config.volumeTextSelector) {
        const currentElement = document.querySelector(this.config.volumeTextSelector);
        if (currentElement && currentElement === this.uiElements.volumeText) {
          // result.volume は既に補正済みの値（_getProcessedResultで処理済み）
          const volumePercent = Math.min(100, Math.max(0, result.volume));
          this.uiElements.volumeText.textContent = `${volumePercent.toFixed(1)}%`;
        }
      }

      // Update frequency display - verify element matches current selector to prevent cross-mode updates
      if (this.uiElements.frequency && this.config.frequencySelector) {
        const currentElement = document.querySelector(this.config.frequencySelector);
        if (currentElement && currentElement === this.uiElements.frequency) {
          if (result.frequency && result.frequency > 0) {
            this.uiElements.frequency.textContent = FrequencyUtils.formatFrequency(result.frequency);
          } else {
            // Reset frequency display when no pitch is detected
            this.uiElements.frequency.textContent = '0.0 Hz';
          }
        }
      }

      // Update note display with persistence - only if noteSelector is configured and matches current cached element
      if (this.uiElements.note && this.config.noteSelector && this.config.noteSelector !== '#note-display') {
        // Verify that cached element matches current selector to prevent cross-mode updates
        const currentElement = document.querySelector(this.config.noteSelector);
        if (currentElement && currentElement === this.uiElements.note) {
          if (result.frequency && result.frequency > 0) {
            // Clear any pending reset timer
            if (this.noteResetTimer) {
              clearTimeout(this.noteResetTimer);
              this.noteResetTimer = null;
            }
            
            const noteInfo = FrequencyUtils.frequencyToNote(result.frequency);
            this.debugLog(`Updating note display: ${this.uiElements.note.id || 'unknown-id'} with note: ${noteInfo.name} (selector: ${this.config.noteSelector})`);
            this.uiElements.note.textContent = noteInfo.name;
          } else {
            // Only reset after a short delay to avoid flickering
            if (!this.noteResetTimer) {
              this.noteResetTimer = window.setTimeout(() => {
                if (this.uiElements.note) {
                  this.debugLog(`Resetting note display: ${this.uiElements.note.id || 'unknown-id'} to "-" (delayed, selector: ${this.config.noteSelector})`);
                  this.uiElements.note.textContent = '-';
                }
                this.noteResetTimer = null;
              }, AudioDetectionComponent.NOTE_RESET_DELAY_MS);
            }
          }
        } else {
          this.debugLog(`Note element mismatch: cached element does not match current selector ${this.config.noteSelector} - skipping update to prevent cross-mode interference`);
        }
      } else {
        if (!this.config.noteSelector) {
          this.debugLog('Note updates skipped - no noteSelector configured');
        } else {
          this.debugLog('Note element not found in uiElements.note - check selector caching');
        }
      }
    } catch (error) {
      this.debugLog('UI update error:', error);
    }
  }

  /**
   * Updates UI element selectors and re-caches DOM elements
   * 
   * @param selectors - Object containing new selector strings
   * @param selectors.volumeBarSelector - New selector for volume bar element
   * @param selectors.volumeTextSelector - New selector for volume text element
   * @param selectors.frequencySelector - New selector for frequency display element
   * @param selectors.noteSelector - New selector for note display element (if not provided, will be cleared to prevent cross-mode interference)
   * 
   * @example
   * ```typescript
   * // Switch volume bar to different element (e.g., range test mode)
   * audioDetector.updateSelectors({
   *   volumeBarSelector: '#range-test-volume-bar',
   *   volumeTextSelector: '#range-test-volume-text',
   *   frequencySelector: '#range-test-frequency-value'
   * });
   * ```
   */
  async updateSelectors(selectors: Partial<Pick<AudioDetectionConfig, 
    'volumeBarSelector' | 'volumeTextSelector' | 'frequencySelector' | 'noteSelector'>>): Promise<void> {
    
    this.debugLog('Updating selectors:', selectors);
    
    // Set flag to prevent UI updates during selector changes
    this.isUpdatingSelectors = true;
    
    // Temporarily stop UI updates to prevent overwriting reset values
    const wasUIUpdating = this.uiUpdateTimer !== null;
    if (wasUIUpdating) {
      this.stopUIUpdates();
    }
    
    // Wait a moment to ensure any pending UI updates are processed
    await this.delay(AudioDetectionComponent.SELECTOR_UPDATE_DELAY_MS);
    
    // Reset all existing UI elements to initial state before switching
    this.resetAllUIElements();
    
    // Update configuration with new selectors
    if (selectors.volumeBarSelector !== undefined) {
      this.config.volumeBarSelector = selectors.volumeBarSelector;
    }
    if (selectors.volumeTextSelector !== undefined) {
      this.config.volumeTextSelector = selectors.volumeTextSelector;
    }
    if (selectors.frequencySelector !== undefined) {
      this.config.frequencySelector = selectors.frequencySelector;
    }
    
    // Handle noteSelector: if explicitly provided, use it; if not provided in a mode switch, clear it to prevent cross-mode interference
    if (selectors.noteSelector !== undefined) {
      this.config.noteSelector = selectors.noteSelector;
    } else {
      // When switching modes without specifying noteSelector, clear it to prevent old note elements from updating
      this.config.noteSelector = '';
      this.debugLog('noteSelector cleared automatically to prevent cross-mode interference');
    }
    
    // Re-cache UI elements with new selectors
    this.cacheUIElements();
    
    // Wait for DOM updates
    await this.delay(AudioDetectionComponent.SELECTOR_UPDATE_DELAY_MS);
    
    // Reset the new UI elements as well to ensure they start clean
    this.resetAllUIElements();
    
    // Clear the flag and resume UI updates if they were running
    this.isUpdatingSelectors = false;
    
    if (wasUIUpdating) {
      // Add longer delay to ensure reset values are visible
      await this.delay(AudioDetectionComponent.UI_RESTART_DELAY_MS);
      this.startUIUpdates();
    }
    
    this.debugLog('Selectors updated, all elements reset, and UI elements re-cached:', Object.keys(this.uiElements));
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
  
  /**
   * Reset recovery attempts and restart monitoring if needed
   * This method can be used to recover from "Maximum recovery attempts reached" errors
   */
  resetRecoveryAttempts(): void {
    this.debugLog('Resetting recovery attempts...');
    
    try {
      if (this.micController) {
        this.micController.resetRecoveryAttempts();
        this.debugLog('Recovery attempts reset successfully');
      } else {
        this.debugLog('No microphone controller available to reset');
      }
    } catch (error) {
      this.debugLog('Error resetting recovery attempts:', error);
      throw error;
    }
  }

  destroy(): void {
    this.debugLog('Destroying AudioDetectionComponent...');
    
    try {
      // Stop detection and UI updates
      this.stopUIUpdates();
      
      // Clear note reset timer
      if (this.noteResetTimer) {
        clearTimeout(this.noteResetTimer);
        this.noteResetTimer = null;
      }
      
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

  /**
   * Provides access to the MicrophoneController for unified system management
   * 
   * @description Exposes the MicrophoneController instance to enable external access
   * to unified reset operations, mute/unmute functionality, and centralized control
   * of the entire PitchPro system. This is the primary interface for system-wide operations.
   * 
   * @returns The MicrophoneController instance, or null if not initialized
   * 
   * @example
   * ```typescript
   * const micController = audioDetector.microphoneController;
   * if (micController) {
   *   // Perform unified system reset
   *   micController.reset(); // Stops detection, clears UI, mutes mic
   *   
   *   // Control microphone state
   *   micController.toggleMute();
   * }
   * ```
   */
  get microphoneController(): MicrophoneController | null {
    return this.micController;
  }

  // Private methods implementation continues...
  // (Will be implemented in the next part)

  /**
   * Detects device type and applies optimization settings
   * @private
   */
  private detectAndOptimizeDevice(): void {
    this.deviceSpecs = DeviceDetection.getDeviceSpecs();
    
    // ⬇️ 独自のdeviceSettingsMapを削除し、deviceSpecsを直接利用するように変更
    // DeviceDetection.ts が唯一の情報源となる
    
    this.debugLog('Using DeviceDetection values directly:', {
      device: this.deviceSpecs.deviceType,
      noiseGate: `${this.deviceSpecs.noiseGate} (${(this.deviceSpecs.noiseGate * 100).toFixed(2)}% threshold)`,
      volumeMultiplier: this.deviceSpecs.volumeMultiplier,
      sensitivity: this.deviceSpecs.sensitivity,
      smoothingFactor: this.deviceSpecs.smoothingFactor
    });
    
    this.debugLog('Device optimization applied:', {
      device: this.deviceSpecs.deviceType,
      settings: this.deviceSpecs // ⬅️ deviceSettingsではなくdeviceSpecsを参照
    });
  }    // ⬇️ 独自のdeviceSettingsMapを削除し、deviceSpecsを直接利用するように変更\n    // DeviceDetection.ts が唯一の情報源となる\n    \n    console.log(`🔧 [DeviceOptimization] Using DeviceDetection values directly:`);\n    console.log(`📱 Device: ${this.deviceSpecs.deviceType}`);\n    console.log(`🎯 noiseGate: ${this.deviceSpecs.noiseGate} (${(this.deviceSpecs.noiseGate * 100).toFixed(2)}% threshold)`);\n    console.log(`🔊 volumeMultiplier: ${this.deviceSpecs.volumeMultiplier}`);\n    console.log(`🎤 sensitivity: ${this.deviceSpecs.sensitivity}`);\n    console.log(`📊 smoothingFactor: ${this.deviceSpecs.smoothingFactor}`);\n    \n    this.debugLog('Device optimization applied:', {\n      device: this.deviceSpecs.deviceType,\n      settings: this.deviceSpecs // ⬅️ deviceSettingsではなくdeviceSpecsを参照\n    });\n  }

  /**
   * Caches UI elements for efficient updates
   * @private
   */
  private cacheUIElements(): void {
    // Only cache UI elements if autoUpdateUI is enabled
    if (!this.config.autoUpdateUI) {
      this.debugLog('UI element caching skipped - autoUpdateUI is disabled');
      return;
    }
    
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
      this.debugLog(`Note element cached: selector="${this.config.noteSelector}", found=${!!this.uiElements.note}, id="${this.uiElements.note?.id || 'no-id'}"`);
    }

    this.debugLog('UI elements cached:', Object.keys(this.uiElements));
  }

  /**
   * Publicly accessible method to reset all UI elements to their initial state
   * Provides external access to comprehensive UI reset functionality
   */
  public resetDisplayElements(): void {
    this.resetAllUIElements();
  }

  /**
   * Resets all UI elements to their initial state (0 values)
   * @private
   */
  private resetAllUIElements(): void {
    try {
      // Reset all possible UI elements by querying all selectors that might exist
      const allPossibleSelectors = [
        // Mic mode selectors (all possible variations)
        '#mic-volume-bar', '#mic-volume-text', '#mic-frequency', '#mic-frequency-display',
        // Range mode selectors (all possible variations)
        '#range-volume-bar', '#range-volume-text', '#range-frequency', '#range-frequency-value', '#range-frequency-display',
        // Practice mode selectors (always reset note display when switching modes)
        '#practice-volume-bar', '#practice-volume-text', '#practice-frequency', '#practice-note',
        // Add common frequency display patterns
        '#freq-1', '#freq-2', '#freq-3', '#freq-4', '#freq-5',
        '#frequency-1', '#frequency-2', '#frequency-3',
        '#pitch-1', '#pitch-2', '#pitch-3',
        // Also reset current configuration selectors
        this.config.volumeBarSelector,
        this.config.volumeTextSelector,
        this.config.frequencySelector,
        this.config.noteSelector
      ];
      
      // Additionally, try to find all elements with frequency-related IDs or classes
      // But be more selective to avoid breaking UI elements
      const frequencyElements = document.querySelectorAll('[id*="freq"]:not(.frequency-group):not(.frequency-box), [id*="frequency"]:not(.frequency-group):not(.frequency-box), [id*="pitch"]:not(.frequency-group):not(.frequency-box)');
      frequencyElements.forEach(element => {
        // Only reset if it looks like a frequency display (contains Hz or is a known pattern)
        const text = element.textContent || '';
        if (text.includes('Hz') || text.match(/^\d+\.?\d*$/)) {
          // Only update text content, don't change any other properties
          if (element.classList.contains('frequency-display') || element.id.includes('freq-')) {
            element.textContent = '0.0 Hz';
          }
        }
      });

      allPossibleSelectors.forEach(selector => {
        if (selector) {
          const element = document.querySelector(selector);
          if (element) {
            this.debugLog(`Processing selector: ${selector}, element found: ${!!element}`);
            if (selector.includes('volume-bar')) {
              // Reset volume bar (width style or progress value)
              if (element instanceof HTMLProgressElement) {
                element.value = 0;
              } else {
                (element as HTMLElement).style.width = '0%';
              }
            } else if (selector.includes('volume-text')) {
              // Reset volume text
              element.textContent = '0.0%';
            } else if (selector.includes('frequency')) {
              // Reset frequency display - use multiple approaches for reliability
              element.textContent = '0.0 Hz';
              (element as HTMLElement).innerHTML = '0.0 Hz';
              (element as HTMLElement).setAttribute('data-frequency', '0');
              // Force style refresh to ensure visual update (without breaking display property)
              const originalDisplay = (element as HTMLElement).style.display;
              if (originalDisplay !== 'none') {
                // Only force reflow, don't change display property
                (element as HTMLElement).style.opacity = '0.99';
                (element as HTMLElement).offsetHeight; // Force reflow
                (element as HTMLElement).style.opacity = '';
              }
            } else if (selector.includes('note')) {
              // Reset note display - use multiple approaches for reliability
              const currentText = element.textContent;
              const currentHTML = (element as HTMLElement).innerHTML;
              this.debugLog(`Resetting note element: ${selector}, textContent: "${currentText}", innerHTML: "${currentHTML}"`);
              element.textContent = '-';
              (element as HTMLElement).innerHTML = '-';
              // Force DOM refresh
              (element as HTMLElement).style.opacity = '0.99';
              (element as HTMLElement).offsetHeight; // Force reflow
              (element as HTMLElement).style.opacity = '';
              this.debugLog(`Note reset complete: ${selector}, new textContent: "${element.textContent}", new innerHTML: "${(element as HTMLElement).innerHTML}"`);
            }
          }
        }
      });

      this.debugLog('All UI elements reset to initial state');
    } catch (error) {
      this.debugLog('Error resetting UI elements:', error);
    }
  }

  /**
   * Handles pitch update events from PitchDetector
   * @private
   */
  private handlePitchUpdate(rawResult: PitchDetectionResult): void {
    // 生の結果にデバイス最適化を適用
    const processedResult = this._getProcessedResult(rawResult);
    
    if (processedResult) {
      // 加工後の結果をコールバックに渡す
      this.callbacks.onPitchUpdate?.(processedResult);
      this.callbacks.onVolumeUpdate?.(processedResult.volume);
    }
    
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
      // 🎯 修正: PitchDetectorの実際の状態をチェック
      if (this.pitchDetector && this.pitchDetector.getStatus().componentState === 'detecting') {
        // Get the latest pitch detection result
        const rawResult = this.pitchDetector.getLatestResult();
        
        // 生の結果にデバイス最適化を適用
        const processedResult = this._getProcessedResult(rawResult);
        
        if (processedResult) {
          // 🔥 自動UI更新が有効な場合のみupdateUIを呼び出し
          if (this.config.autoUpdateUI) {
            this.updateUI(processedResult);
          }
          
          // 🔥 コールバック関数が設定されている場合は常に呼び出し
          if (this.config.onPitchUpdate) {
            this.debugLog('Calling onPitchUpdate callback with result:', processedResult);
            this.config.onPitchUpdate(processedResult);
          } else {
            this.debugLog('onPitchUpdate callback not set - skipping callback execution');
          }
        } else {
          // When no result, ensure UI shows reset state
          const resetResult = {
            frequency: 0,
            note: '-',
            octave: 0,
            volume: 0,
            rawVolume: 0,
            clarity: 0
          };
          
          if (this.config.autoUpdateUI) {
            this.updateUI(resetResult);
          }
          
          if (this.config.onPitchUpdate) {
            this.config.onPitchUpdate(resetResult);
          }
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
   * 検出結果にデバイス最適化を適用し、最終的な値を生成します。
   * コールバック値とUI値の一貫性を保証するための一元管理メソッド。
   * @param rawResult PitchDetectorからの生の検出結果
   * @returns デバイス最適化が適用された処理済み結果、またはnull
   * @private
   */
  /**
   * 生の検出結果にデバイス固有の音量補正を適用します
   *
   * @remarks
   * このメソッドがPitchProの音量調整の核心部分です。以下の処理を行います：
   *
   * 1. **デバイス固有の音量補正**: volumeMultiplierによる音量調整
   *    - PC: 3.0x（v1.2.9確定）
   *    - iPhone: 7.5x（v1.2.9確定）
   *    - iPad: 20.0x（v1.2.9確定）
   *
   * 2. **範囲制限**: 最終音量を0-100%の範囲に制限
   *
   * 3. **デバッグログ**: モバイルデバイスでの音量調整過程を記録
   *
   * @param rawResult - PitchDetectorから取得した生の検出結果
   * @returns 音量補正が適用された最終的な検出結果
   *
   * @example
   * ```typescript
   * // PitchDetectorからの生結果
   * const rawResult = { frequency: 440, note: 'A4', volume: 15.2 };
   *
   * // iPhone (volumeMultiplier: 7.5) での処理
   * const processed = this._getProcessedResult(rawResult);
   * // → { frequency: 440, note: 'A4', volume: 100 } (15.2 * 7.5 = 114 → 100に制限)
   *
   * // PC (volumeMultiplier: 3.0) での処理
   * // → { frequency: 440, note: 'A4', volume: 45.6 } (15.2 * 3.0 = 45.6)
   * ```
   *
   * @since v1.2.0 デバイス固有音量調整システム導入
   * @see {@link detectAndOptimizeDevice} デバイス設定の決定方法
   */
  private _getProcessedResult(rawResult: PitchDetectionResult | null): PitchDetectionResult | null {
    if (!rawResult) return null;

    // 元のオブジェクトを変更しないようにコピーを作成
    const processedResult = { ...rawResult };

    // ⬇️ deviceSettingsではなくdeviceSpecsからvolumeMultiplierを取得
    const volumeMultiplier = this.deviceSpecs?.volumeMultiplier ?? 1.0;
    const finalVolume = rawResult.volume * volumeMultiplier;
    
    // 🎯 生音量（フィルター前）データを追加
    processedResult.rawVolume = rawResult.volume;
    
    // 🎯 明瞭度データを追加（元のPitchDetectionResultにあるclarity値を保持）
    processedResult.clarity = rawResult.clarity;
    
    // Log volume adjustment details when debug is enabled and volume is significant
    if (this.config.debug && rawResult.volume > 0.1) {
      this.debugLog('VolumeAdjustment:', {
        device: this.deviceSpecs?.deviceType,
        rawVolume: `${rawResult.volume.toFixed(2)}%`,
        multiplier: volumeMultiplier,
        finalVolume: `${Math.min(100, Math.max(0, finalVolume)).toFixed(2)}%`,
        clarity: `${((rawResult.clarity || 0) * 100).toFixed(1)}%`,
        details: {
          inputVolume: rawResult.volume,
          deviceType: this.deviceSpecs?.deviceType,
          volumeMultiplier: volumeMultiplier,
          calculatedFinal: finalVolume,
          clampedFinal: Math.min(100, Math.max(0, finalVolume)),
          rawClarity: rawResult.clarity
        }
      });
    }
    
    // 最終的な音量を0-100の範囲に丸めて、結果オブジェクトを更新
    processedResult.volume = Math.min(100, Math.max(0, finalVolume));

    return processedResult;
  }    // 元のオブジェクトを変更しないようにコピーを作成\n    const processedResult = { ...rawResult };\n\n    // ⬇️ deviceSettingsではなくdeviceSpecsからvolumeMultiplierを取得\n    const volumeMultiplier = this.deviceSpecs?.volumeMultiplier ?? 1.0;\n    const finalVolume = rawResult.volume * volumeMultiplier;\n    \n    // 🔍 v1.2.1.20: 全デバイスでvolumeMultiplier処理をログ出力\n    if (rawResult.volume > 0.1) {\n      console.log(`📊 [VolumeAdjustment] Device: ${this.deviceSpecs?.deviceType}, Raw: ${rawResult.volume.toFixed(2)}%, Multiplier: ${volumeMultiplier}, Final: ${Math.min(100, Math.max(0, finalVolume)).toFixed(2)}%`);\n      console.log(`🔍 [CRITICAL] _getProcessedResult details:`, {\n        inputVolume: rawResult.volume,\n        deviceType: this.deviceSpecs?.deviceType,\n        volumeMultiplier: volumeMultiplier,\n        calculatedFinal: finalVolume,\n        clampedFinal: Math.min(100, Math.max(0, finalVolume))\n      });\n    }\n    \n    // 最終的な音量を0-100の範囲に丸めて、結果オブジェクトを更新\n    processedResult.volume = Math.min(100, Math.max(0, finalVolume));\n\n    return processedResult;\n  }

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