/**
 * MicrophoneController - High-level Microphone Management Interface
 * 
 * Combines AudioManager, LifecycleManager, and ErrorNotificationSystem
 * Provides a simple, unified API for microphone control with error handling
 * Includes device detection, sensitivity management, and automatic recovery
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

export class MicrophoneController {
  private audioManager: AudioManager;
  private lifecycleManager: MicrophoneLifecycleManager;
  private errorSystem: ErrorNotificationSystem;
  
  // State management
  private currentState: 'uninitialized' | 'initializing' | 'ready' | 'active' | 'error' = 'uninitialized';
  private isPermissionGranted = false;
  private lastError: Error | null = null;
  
  // Event handling
  private eventCallbacks: {
    onStateChange?: StateChangeCallback;
    onError?: ErrorCallback;
    onPermissionChange?: (granted: boolean) => void;
    onSensitivityChange?: (sensitivity: number) => void;
    onDeviceChange?: (specs: DeviceSpecs) => void;
  } = {};
  
  // Device specifications
  private deviceSpecs: DeviceSpecs | null = null;

  constructor(
    audioManagerConfig = {},
    lifecycleConfig = {},
    showErrorNotifications = true
  ) {
    this.audioManager = new AudioManager(audioManagerConfig);
    this.lifecycleManager = new MicrophoneLifecycleManager(this.audioManager, lifecycleConfig);
    this.errorSystem = showErrorNotifications ? new ErrorNotificationSystem() : null as any;
    
    this.setupEventHandlers();
    this.detectDevice();
  }

  /**
   * Set callback functions for events
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
   * Initialize microphone access and permissions
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
      console.error('❌ [MicrophoneController] Initialization failed:', error);
      
      this.isPermissionGranted = false;
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
      // Fallback: try to access microphone with minimal constraints
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: { 
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
          } 
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
   * Force stop with complete cleanup
   */
  forceStop(): void {
    console.log('🚨 [MicrophoneController] Force stopping microphone');
    
    this.lifecycleManager.forceRelease();
    this.updateState('uninitialized');
    this.isPermissionGranted = false;
    
    console.log('✅ [MicrophoneController] Force stop complete');
  }

  /**
   * Set microphone sensitivity
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
   * Get current microphone sensitivity
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
   * Check if microphone is active
   */
  isActive(): boolean {
    return this.currentState === 'active';
  }

  /**
   * Check if microphone is ready (initialized but not active)
   */
  isReady(): boolean {
    return this.currentState === 'ready';
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
      console.error('❌ [MicrophoneController] Microphone test failed:', error);
      
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
    console.error(`❌ [MicrophoneController] Error in ${context}:`, error);
    
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
}