/**
 * MicrophoneController - High-level Unified Microphone Management Interface
 * 
 * @description Provides a comprehensive, easy-to-use API that combines AudioManager,
 * MicrophoneLifecycleManager, and ErrorNotificationSystem into a single interface.
 * Handles device detection, permission management, sensitivity adjustment, and
 * automatic error recovery with user-friendly notifications.
 * 
 * @example
 * ```typescript
 * const micController = new MicrophoneController();
 * 
 * // Set up event callbacks
 * micController.setCallbacks({
 *   onStateChange: (state) => console.log('State:', state),
 *   onError: (error) => console.error('Error:', error.message),
 *   onDeviceChange: (specs) => console.log('Device:', specs.deviceType)
 * });
 * 
 * // Initialize and start
 * const resources = await micController.initialize();
 * console.log('Microphone ready:', resources.mediaStream.active);
 * ```
 * 
 * @version 1.1.3
 * @since 1.0.0
 */

import type { 
  DeviceSpecs,
  MediaStreamResources,
  MicrophoneControllerEvents,
  ErrorCallback,
  StateChangeCallback
} from '../types';
import { AudioManager } from './AudioManager';
import { MicrophoneLifecycleManager } from './MicrophoneLifecycleManager';
import { ErrorNotificationSystem } from './ErrorNotificationSystem';
import { 
  MicrophoneAccessError,
  AudioContextError,
  PitchProError,
  ErrorCode,
  ErrorMessageBuilder
} from '../utils/errors';
import type { LifecycleManagerConfig } from './MicrophoneLifecycleManager';
import { Logger, LogLevel } from '../utils/Logger';

export interface MicrophoneControllerConfig {
  /** Audio manager configuration */
  audioManager?: {
    sampleRate?: number;
    echoCancellation?: boolean;
    noiseSuppression?: boolean;
    autoGainControl?: boolean;
  };
  
  /** Lifecycle manager configuration */
  lifecycle?: LifecycleManagerConfig;
  
  /** Audio constraint defaults for permission checks */
  audioConstraints?: {
    echoCancellation?: boolean;
    noiseSuppression?: boolean; 
    autoGainControl?: boolean;
  };
  
  /** Error notification settings */
  notifications?: {
    enabled?: boolean;
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  };
  
  /** Logging configuration */
  logging?: {
    level?: LogLevel;
    prefix?: string;
  };
}

export class MicrophoneController {
  /** @readonly AudioManager instance for low-level audio resource management */
  public readonly audioManager: AudioManager;
  
  /** @private Lifecycle manager for safe resource handling */
  private lifecycleManager: MicrophoneLifecycleManager;
  
  /** @private Error notification system for user feedback */
  private errorSystem: ErrorNotificationSystem;
  
  /** @private Logger for structured logging */
  private logger: Logger;
  
  /** @private Configuration object with defaults */
  private config: Required<MicrophoneControllerConfig>;
  
  /** @private Current controller state */
  private currentState: 'uninitialized' | 'initializing' | 'ready' | 'active' | 'error' = 'uninitialized';
  
  /** @private Microphone permission granted flag */
  private isPermissionGranted = false;
  
  /** @private Last error encountered during operations */
  private lastError: Error | null = null;
  
  /** @private Event callback functions */
  private eventCallbacks: {
    onStateChange?: StateChangeCallback;
    onError?: ErrorCallback;
    onPermissionChange?: (granted: boolean) => void;
    onSensitivityChange?: (sensitivity: number) => void;
    onDeviceChange?: (specs: DeviceSpecs) => void;
  } = {};
  
  /** @private Device-specific optimization specifications */
  private deviceSpecs: DeviceSpecs | null = null;

  /**
   * Creates a new MicrophoneController with integrated management systems
   * 
   * @param audioManagerConfig - Configuration for AudioManager (optional)
   * @param audioManagerConfig.sampleRate - Audio sample rate (default: 44100)
   * @param audioManagerConfig.echoCancellation - Enable echo cancellation (default: false)
   * @param audioManagerConfig.autoGainControl - Enable auto gain control (default: false)
   * @param lifecycleConfig - Configuration for lifecycle management (optional)
   * @param lifecycleConfig.maxRetries - Maximum retry attempts (default: 3)
   * @param lifecycleConfig.retryDelayMs - Delay between retries (default: 1000)
   * @param showErrorNotifications - Enable visual error notifications (default: true)
   * 
   * @example
   * ```typescript
   * // Basic usage with defaults
   * const micController = new MicrophoneController();
   * 
   * // Custom configuration
   * const micController = new MicrophoneController(
   *   { sampleRate: 48000, echoCancellation: true },
   *   { maxRetries: 5, retryDelayMs: 2000 },
   *   false  // Disable error notifications
   * );
   * ```
   */
  constructor(config: MicrophoneControllerConfig = {}) {
    // Apply configuration with defaults
    this.config = {
      audioManager: {
        sampleRate: config.audioManager?.sampleRate ?? 44100,
        echoCancellation: config.audioManager?.echoCancellation ?? false,
        noiseSuppression: config.audioManager?.noiseSuppression ?? false,
        autoGainControl: config.audioManager?.autoGainControl ?? false
      },
      lifecycle: config.lifecycle ?? {},
      audioConstraints: {
        echoCancellation: config.audioConstraints?.echoCancellation ?? false,
        noiseSuppression: config.audioConstraints?.noiseSuppression ?? false,
        autoGainControl: config.audioConstraints?.autoGainControl ?? false
      },
      notifications: {
        enabled: config.notifications?.enabled ?? true,
        position: config.notifications?.position ?? 'top-right'
      },
      logging: {
        level: config.logging?.level ?? LogLevel.INFO,
        prefix: config.logging?.prefix ?? 'MicrophoneController'
      }
    };

    // Initialize logger first
    this.logger = new Logger(
      this.config.logging.level,
      this.config.logging.prefix,
      { component: 'MicrophoneController' }
    );

    this.logger.debug('Initializing MicrophoneController', { config: this.config });

    // Initialize components with proper configuration
    this.audioManager = new AudioManager(this.config.audioManager);
    this.lifecycleManager = new MicrophoneLifecycleManager(this.audioManager, this.config.lifecycle);
    this.errorSystem = this.config.notifications.enabled 
      ? new ErrorNotificationSystem() 
      : null as any;
    
    this.setupEventHandlers();
    this.detectDevice();
  }

  /**
   * Sets callback functions for microphone controller events
   * 
   * @param callbacks - Object containing event callback functions
   * @param callbacks.onStateChange - Called when controller state changes
   * @param callbacks.onError - Called when errors occur
   * @param callbacks.onPermissionChange - Called when microphone permission changes
   * @param callbacks.onSensitivityChange - Called when sensitivity is adjusted
   * @param callbacks.onDeviceChange - Called when device specifications are detected
   * 
   * @example
   * ```typescript
   * micController.setCallbacks({
   *   onStateChange: (state) => {
   *     console.log('Controller state:', state);
   *   },
   *   onError: (error) => {
   *     console.error('Microphone error:', error.message);
   *   },
   *   onDeviceChange: (specs) => {
   *     console.log(`Device: ${specs.deviceType}, Sensitivity: ${specs.sensitivity}x`);
   *   }
   * });
   * ```
   */
  setCallbacks(callbacks: {
    onStateChange?: StateChangeCallback;
    onError?: ErrorCallback;
    onPermissionChange?: (granted: boolean) => void;
    onSensitivityChange?: (sensitivity: number) => void;
    onDeviceChange?: (specs: DeviceSpecs) => void;
  }): void {
    this.eventCallbacks = { ...this.eventCallbacks, ...callbacks };
  }

  /**
   * Reset lifecycle manager recovery attempts
   * Provides safe access to lifecycle recovery reset without exposing internal state
   */
  resetRecoveryAttempts(): void {
    this.logger.info('Resetting recovery attempts via public API');
    
    try {
      this.lifecycleManager.resetRecoveryAttempts();
      this.logger.info('Recovery attempts reset successfully');
    } catch (error) {
      this.logger.error('Failed to reset recovery attempts', error as Error);
      throw error;
    }
  }

  /**
   * Check if controller is in active state
   */
  isActive(): boolean {
    return this.currentState === 'active';
  }

  /**
   * Check if controller is ready for use
   */
  isReady(): boolean {
    return this.currentState === 'ready' || this.currentState === 'active';
  }

  /**
   * Check if controller is initialized
   */
  isInitialized(): boolean {
    return this.currentState !== 'uninitialized';
  }

  /**
   * Setup internal event handlers
   */
  private setupEventHandlers(): void {
    // Lifecycle manager callbacks
    this.lifecycleManager.setCallbacks({
      onStateChange: (state) => {
        this.updateState(state === 'active' ? 'active' : 'ready');
      },
      onError: (error) => {
        this.handleError(error, 'lifecycle');
      }
    });
  }

  /**
   * Detect device specifications
   */
  private detectDevice(): void {
    this.deviceSpecs = this.audioManager.getPlatformSpecs();
    console.log('📱 [MicrophoneController] Device detected:', this.deviceSpecs);
    
    // Notify callback
    this.eventCallbacks.onDeviceChange?.(this.deviceSpecs);
    
    // Dispatch custom event
    this.dispatchCustomEvent('pitchpro:deviceDetected', { specs: this.deviceSpecs });
  }

  /**
   * Initializes microphone access with automatic device detection and permissions
   * 
   * @description Handles the complete initialization flow including device detection,
   * permission requests, resource acquisition, and error recovery. Automatically
   * applies device-specific optimizations and sets up monitoring systems.
   * 
   * @returns Promise resolving to audio resources (AudioContext, MediaStream, SourceNode)
   * @throws {Error} If microphone permission is denied or initialization fails
   * 
   * @example
   * ```typescript
   * try {
   *   const resources = await micController.initialize();
   *   console.log('Microphone ready:', resources.mediaStream.active);
   *   console.log('AudioContext state:', resources.audioContext.state);
   * } catch (error) {
   *   console.error('Failed to initialize microphone:', error.message);
   * }
   * ```
   */
  async initialize(): Promise<MediaStreamResources> {
    try {
      this.updateState('initializing');
      console.log('🎤 [MicrophoneController] Starting initialization');

      // Acquire resources through lifecycle manager
      const resources = await this.lifecycleManager.acquire();
      
      // Update state and permissions
      this.isPermissionGranted = true;
      this.updateState('ready');
      this.lastError = null;

      // Notify permission change
      this.eventCallbacks.onPermissionChange?.(true);
      this.dispatchCustomEvent('pitchpro:microphoneGranted', { stream: resources.mediaStream });

      console.log('✅ [MicrophoneController] Initialization complete');
      return resources;

    } catch (error) {
      this.logger.error('Initialization failed', error as Error, {
        operation: 'initialize',
        currentState: this.currentState
      });
      
      // Update internal state
      this.isPermissionGranted = false;
      
      // Handle error (this will update state, show notifications, and call callbacks)
      this.handleError(error as Error, 'initialization');
      
      // Notify permission denial
      this.eventCallbacks.onPermissionChange?.(false);
      this.dispatchCustomEvent('pitchpro:microphoneDenied', { error: error as Error });

      throw error;
    }
  }

  /**
   * Request microphone permission (alias for initialize)
   */
  async requestPermission(): Promise<boolean> {
    try {
      await this.initialize();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if microphone permission is granted
   */
  async checkPermissionStatus(): Promise<'granted' | 'denied' | 'prompt'> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      return 'denied';
    }

    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      return result.state as 'granted' | 'denied' | 'prompt';
    } catch {
      // Fallback: try to access microphone with configured constraints
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: this.config.audioConstraints
        });
        stream.getTracks().forEach(track => track.stop());
        return 'granted';
      } catch {
        return 'denied';
      }
    }
  }

  /**
   * Stop microphone and release resources
   */
  stop(): void {
    console.log('🛑 [MicrophoneController] Stopping microphone');
    
    this.lifecycleManager.release();
    this.updateState('ready');
    
    // Dispatch stop event
    this.dispatchCustomEvent('pitchpro:microphoneStopped', {});
    
    console.log('✅ [MicrophoneController] Microphone stopped');
  }

  /**
   * Forcefully stops microphone with complete resource cleanup
   * 
   * @description Performs immediate and complete cleanup of all microphone resources,
   * resets permission state, and returns controller to uninitialized state.
   * Use when normal stop() is not sufficient or emergency cleanup is needed.
   * 
   * @example
   * ```typescript
   * // Emergency cleanup
   * micController.forceStop();
   * console.log('All microphone resources cleaned up');
   * ```
   */
  forceStop(): void {
    console.log('🚨 [MicrophoneController] Force stopping microphone');
    
    this.lifecycleManager.forceRelease();
    this.updateState('uninitialized');
    this.isPermissionGranted = false;
    
    console.log('✅ [MicrophoneController] Force stop complete');
  }

  /**
   * Sets microphone sensitivity with automatic validation and event notification
   * 
   * @param sensitivity - Sensitivity multiplier (0.1 ~ 10.0)
   * - 0.1-1.0: Reduced sensitivity for loud environments
   * - 1.0: Standard PC sensitivity
   * - 3.0: iPhone optimized
   * - 7.0: iPad optimized  
   * - 10.0: Maximum sensitivity for quiet environments
   * 
   * @example
   * ```typescript
   * // Set device-optimized sensitivity
   * micController.setSensitivity(7.0);  // iPad optimization
   * 
   * // Adjust for environment
   * micController.setSensitivity(0.5);  // Reduce for loud room
   * ```
   */
  setSensitivity(sensitivity: number): void {
    const oldSensitivity = this.audioManager.getSensitivity();
    this.audioManager.setSensitivity(sensitivity);
    const newSensitivity = this.audioManager.getSensitivity();
    
    if (oldSensitivity !== newSensitivity) {
      console.log(`🔧 [MicrophoneController] Sensitivity changed: ${oldSensitivity}x → ${newSensitivity}x`);
      
      // Notify callbacks
      this.eventCallbacks.onSensitivityChange?.(newSensitivity);
      this.dispatchCustomEvent('pitchpro:sensitivityChanged', { sensitivity: newSensitivity });
    }
  }

  /**
   * Gets current microphone sensitivity multiplier
   * 
   * @returns Current sensitivity value (0.1 ~ 10.0)
   * 
   * @example
   * ```typescript
   * const currentSensitivity = micController.getSensitivity();
   * console.log(`Current sensitivity: ${currentSensitivity}x`);
   * ```
   */
  getSensitivity(): number {
    return this.audioManager.getSensitivity();
  }

  /**
   * Get device specifications
   */
  getDeviceSpecs(): DeviceSpecs | null {
    return this.deviceSpecs;
  }

  /**
   * Get current state
   */
  getState(): string {
    return this.currentState;
  }


  /**
   * Check if permission is granted
   */
  hasPermission(): boolean {
    return this.isPermissionGranted;
  }

  /**
   * Get comprehensive status
   */
  getStatus() {
    return {
      state: this.currentState,
      isPermissionGranted: this.isPermissionGranted,
      isActive: this.isActive(),
      isReady: this.isReady(),
      sensitivity: this.getSensitivity(),
      deviceSpecs: this.deviceSpecs,
      lastError: this.lastError,
      audioManagerStatus: this.audioManager.getStatus(),
      lifecycleStatus: this.lifecycleManager.getStatus()
    };
  }

  /**
   * Perform health check
   */
  checkHealth() {
    return this.audioManager.checkMediaStreamHealth();
  }

  /**
   * Test microphone functionality
   */
  async testMicrophone(durationMs = 2000): Promise<{
    success: boolean;
    volume: number;
    frequency: number | null;
    duration: number;
    error?: Error;
  }> {
    const startTime = Date.now();
    
    try {
      // Ensure we have resources
      if (!this.isReady() && !this.isActive()) {
        await this.initialize();
      }
      
      // Create temporary analyser for testing
      const analyser = this.audioManager.createAnalyser('microphone-test', {
        fftSize: 1024,
        smoothingTimeConstant: 0.8
      });
      
      // Collect audio data for specified duration
      let maxVolume = 0;
      let detectedFrequency: number | null = null as number | null;
      const endTime = startTime + durationMs;
      
      await new Promise<void>((resolve) => {
        const checkAudio = () => {
          if (Date.now() >= endTime) {
            resolve();
            return;
          }
          
          // Analyze current audio
          const bufferLength = analyser.fftSize;
          const dataArray = new Float32Array(bufferLength);
          analyser.getFloatTimeDomainData(dataArray);
          
          // Calculate RMS volume
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += Math.abs(dataArray[i]);
          }
          const rms = Math.sqrt(sum / bufferLength);
          const volume = rms * 100;
          
          if (volume > maxVolume) {
            maxVolume = volume;
          }
          
          // Simple peak detection for frequency
          if (volume > 5) { // Only check frequency if there's significant volume
            let maxIndex = 0;
            let maxValue = 0;
            for (let i = 1; i < bufferLength / 2; i++) {
              const value = Math.abs(dataArray[i]);
              if (value > maxValue) {
                maxValue = value;
                maxIndex = i;
              }
            }
            if (maxIndex > 0) {
              detectedFrequency = (maxIndex * 44100) / bufferLength;
            }
          }
          
          requestAnimationFrame(checkAudio);
        };
        
        checkAudio();
      });
      
      // Cleanup test analyser
      this.audioManager.removeAnalyser('microphone-test');
      
      const duration = Date.now() - startTime;
      const success = maxVolume > 1; // Consider success if we detected some audio
      
      const frequencyDisplay = detectedFrequency ? detectedFrequency.toFixed(0) : 'none';
      console.log(`🧪 [MicrophoneController] Microphone test complete: volume=${maxVolume.toFixed(2)}, frequency=${frequencyDisplay}, duration=${duration}ms`);
      
      return {
        success,
        volume: maxVolume,
        frequency: detectedFrequency,
        duration
      };
      
    } catch (error) {
      const duration = Date.now() - startTime;
      const testError = this._createStructuredError(error as Error, 'microphone_test');
      ErrorMessageBuilder.logError(testError, 'Microphone functionality test');
      console.error('❌ [MicrophoneController] Microphone test failed:', testError.toJSON());
      
      return {
        success: false,
        volume: 0,
        frequency: null,
        duration,
        error: error as Error
      };
    }
  }

  /**
   * Update internal state and notify
   */
  private updateState(newState: typeof this.currentState): void {
    if (this.currentState !== newState) {
      const oldState = this.currentState;
      this.currentState = newState;
      
      console.log(`🔄 [MicrophoneController] State changed: ${oldState} → ${newState}`);
      
      // Notify callback
      this.eventCallbacks.onStateChange?.(newState);
    }
  }

  /**
   * Handle errors with notification system
   */
  private handleError(error: Error, context: string): void {
    const structuredError = error instanceof PitchProError ? error : this._createStructuredError(error, context);
    ErrorMessageBuilder.logError(structuredError, `MicrophoneController ${context}`);
    console.error(`❌ [MicrophoneController] Error in ${context}:`, structuredError.toJSON());
    
    this.lastError = error;
    this.updateState('error');
    
    // Show error notification if system is available
    if (this.errorSystem) {
      if (context === 'initialization' || context === 'lifecycle') {
        this.errorSystem.showMicrophoneError(error, context);
      } else {
        this.errorSystem.showError(
          'マイクエラー',
          `${context}でエラーが発生しました: ${error.message}`,
          { priority: 'medium' }
        );
      }
    }
    
    // Notify error callback
    this.eventCallbacks.onError?.(error);
  }

  /**
   * Dispatch custom DOM event
   */
  private dispatchCustomEvent(eventName: keyof MicrophoneControllerEvents, detail: any): void {
    if (typeof window === 'undefined') return;
    
    const event = new CustomEvent(eventName, { detail });
    window.dispatchEvent(event);
  }

  /**
   * Add event listener for microphone events
   */
  addEventListener<K extends keyof MicrophoneControllerEvents>(
    type: K,
    listener: (event: MicrophoneControllerEvents[K]) => void
  ): void {
    if (typeof window === 'undefined') return;
    
    window.addEventListener(type, listener as EventListener);
  }

  /**
   * Remove event listener for microphone events
   */
  removeEventListener<K extends keyof MicrophoneControllerEvents>(
    type: K,
    listener: (event: MicrophoneControllerEvents[K]) => void
  ): void {
    if (typeof window === 'undefined') return;
    
    window.removeEventListener(type, listener as EventListener);
  }

  /**
   * Cleanup and destroy all resources
   */
  destroy(): void {
    console.log('🗑️ [MicrophoneController] Destroying controller');
    
    // Force stop to ensure cleanup
    this.forceStop();
    
    // Destroy managed components
    this.lifecycleManager.destroy();
    this.errorSystem?.destroy();
    
    // Clear callbacks
    this.eventCallbacks = {};
    
    // Reset state
    this.currentState = 'uninitialized';
    this.isPermissionGranted = false;
    this.lastError = null;
    this.deviceSpecs = null;
    
    console.log('✅ [MicrophoneController] Cleanup complete');
  }

  /**
   * Creates structured error with enhanced context information
   * 
   * @private
   * @param error - Original error
   * @param operation - Operation that failed
   * @returns Structured PitchProError with context
   */
  private _createStructuredError(error: Error, operation: string): PitchProError {
    // Determine error type based on error message patterns
    if (error.message.includes('Permission denied') || 
        error.message.includes('NotAllowedError') ||
        error.message.includes('permission') ||
        error.message.includes('denied')) {
      return new MicrophoneAccessError(
        'マイクへのアクセス許可が拒否されました。ブラウザの設定でマイクアクセスを許可してください。',
        {
          operation,
          originalError: error.message,
          deviceSpecs: this.deviceSpecs,
          permissionState: this.isPermissionGranted,
          controllerState: this.currentState,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown'
        }
      );
    }
    
    if (error.message.includes('AudioContext') || 
        error.message.includes('audio') ||
        error.message.includes('context') ||
        error.message.includes('initialization')) {
      return new AudioContextError(
        'オーディオシステムの初期化に失敗しました。デバイスの音響設定を確認するか、ブラウザを再起動してください。',
        {
          operation,
          originalError: error.message,
          controllerState: this.currentState,
          audioManagerStatus: this.audioManager.getStatus(),
          deviceSpecs: this.deviceSpecs
        }
      );
    }
    
    // Default to generic PitchPro error
    return new PitchProError(
      `${operation}中に予期しないエラーが発生しました: ${error.message}`,
      ErrorCode.MICROPHONE_ACCESS_DENIED,
      {
        operation,
        originalError: error.message,
        stack: error.stack,
        currentState: {
          controllerState: this.currentState,
          isPermissionGranted: this.isPermissionGranted,
          isActive: this.isActive(),
          isReady: this.isReady(),
          deviceSpecs: this.deviceSpecs
        }
      }
    );
  }
}