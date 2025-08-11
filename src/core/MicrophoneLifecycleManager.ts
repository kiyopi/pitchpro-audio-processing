/**
 * MicrophoneLifecycleManager - Page transition and idle detection microphone control
 * 
 * Manages microphone lifecycle across page transitions, idle periods, and redirects
 * Implements reference counting for safe resource management
 * Handles SSR compatibility and automatic recovery
 */

import type { 
  MediaStreamResources, 
  HealthStatus,
  LifecycleEvents,
  StateChangeCallback,
  ErrorCallback
} from '../types';
import { AudioManager } from './AudioManager';

export class MicrophoneLifecycleManager {
  private audioManager: AudioManager;
  private refCount = 0;
  private isActive = false;
  private lastHealthCheck: HealthStatus | null = null;
  
  // Monitoring intervals
  private healthCheckInterval: number | null = null;
  private idleCheckInterval: number | null = null;
  private visibilityCheckInterval: number | null = null;
  
  // State tracking
  private lastActivityTime = Date.now();
  private isPageVisible = true;
  private isUserActive = true;
  private autoRecoveryAttempts = 0;
  private maxAutoRecoveryAttempts = 3;
  
  // Event listeners storage for cleanup
  private eventListeners = new Map<string, EventListener>();
  
  // Configuration
  private config = {
    healthCheckIntervalMs: 5000,     // 5 seconds
    idleTimeoutMs: 300000,           // 5 minutes
    autoRecoveryDelayMs: 2000,       // 2 seconds
    maxIdleTimeBeforeRelease: 600000 // 10 minutes
  };
  
  // Callbacks
  private callbacks: {
    onStateChange?: StateChangeCallback;
    onError?: ErrorCallback;
  } = {};

  constructor(audioManager: AudioManager, config: Partial<typeof MicrophoneLifecycleManager.prototype.config> = {}) {
    this.audioManager = audioManager;
    this.config = { ...this.config, ...config };
    
    // SSR compatibility check
    if (typeof window === 'undefined') {
      console.log('🔇 [MicrophoneLifecycleManager] SSR environment detected - skipping initialization');
      return;
    }
    
    this.setupEventListeners();
  }

  /**
   * Set callback functions
   */
  setCallbacks(callbacks: {
    onStateChange?: StateChangeCallback;
    onError?: ErrorCallback;
  }): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Acquire microphone resources (with reference counting)
   */
  async acquire(): Promise<MediaStreamResources> {
    this.refCount++;
    
    console.log(`🎤 [MicrophoneLifecycleManager] Acquiring resources (refCount: ${this.refCount})`);
    
    try {
      // Initialize AudioManager if not already active
      if (!this.isActive) {
        const resources = await this.audioManager.initialize();
        this.isActive = true;
        this.lastActivityTime = Date.now();
        this.autoRecoveryAttempts = 0;
        
        // Start monitoring
        this.startHealthMonitoring();
        this.startIdleMonitoring();
        this.startVisibilityMonitoring();
        
        this.callbacks.onStateChange?.('active');
        
        console.log('🟢 [MicrophoneLifecycleManager] Microphone activated');
        return resources;
      }
      
      // Already active - just update activity and return existing resources
      this.updateActivity();
      const resources = await this.audioManager.initialize();
      return resources;
      
    } catch (error) {
      console.error('❌ [MicrophoneLifecycleManager] Failed to acquire resources:', error);
      this.refCount = Math.max(0, this.refCount - 1);
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Release microphone resources (with reference counting)
   */
  release(): void {
    this.refCount = Math.max(0, this.refCount - 1);
    
    console.log(`📉 [MicrophoneLifecycleManager] Releasing resources (refCount: ${this.refCount})`);
    
    // Only stop monitoring and cleanup when no references remain
    if (this.refCount <= 0) {
      this.stopAllMonitoring();
      this.audioManager.release();
      this.isActive = false;
      
      this.callbacks.onStateChange?.('inactive');
      
      console.log('🔴 [MicrophoneLifecycleManager] Microphone deactivated');
    }
  }

  /**
   * Force release all resources (emergency cleanup)
   */
  forceRelease(): void {
    console.log('🚨 [MicrophoneLifecycleManager] Force release - cleaning up all resources');
    
    this.refCount = 0;
    this.stopAllMonitoring();
    this.audioManager.forceCleanup();
    this.isActive = false;
    
    this.callbacks.onStateChange?.('inactive');
  }

  /**
   * Setup page lifecycle event listeners
   */
  private setupEventListeners(): void {
    // Page visibility change
    const visibilityChangeHandler = () => {
      this.isPageVisible = !document.hidden;
      this.handleVisibilityChange();
    };
    
    // User activity tracking
    const activityHandler = () => {
      this.updateActivity();
    };
    
    // Page unload / beforeunload
    const unloadHandler = () => {
      this.forceRelease();
    };
    
    // Page focus / blur
    const focusHandler = () => {
      this.isPageVisible = true;
      this.handleVisibilityChange();
    };
    
    const blurHandler = () => {
      this.isPageVisible = false;
      this.handleVisibilityChange();
    };
    
    // Add event listeners
    document.addEventListener('visibilitychange', visibilityChangeHandler);
    document.addEventListener('mousemove', activityHandler);
    document.addEventListener('keydown', activityHandler);
    document.addEventListener('click', activityHandler);
    document.addEventListener('scroll', activityHandler);
    document.addEventListener('touchstart', activityHandler);
    window.addEventListener('beforeunload', unloadHandler);
    window.addEventListener('unload', unloadHandler);
    window.addEventListener('focus', focusHandler);
    window.addEventListener('blur', blurHandler);
    
    // Store references for cleanup
    this.eventListeners.set('visibilitychange', visibilityChangeHandler);
    this.eventListeners.set('mousemove', activityHandler);
    this.eventListeners.set('keydown', activityHandler);
    this.eventListeners.set('click', activityHandler);
    this.eventListeners.set('scroll', activityHandler);
    this.eventListeners.set('touchstart', activityHandler);
    this.eventListeners.set('beforeunload', unloadHandler);
    this.eventListeners.set('unload', unloadHandler);
    this.eventListeners.set('focus', focusHandler);
    this.eventListeners.set('blur', blurHandler);
    
    console.log('👂 [MicrophoneLifecycleManager] Event listeners setup complete');
  }

  /**
   * Handle page visibility changes
   */
  private handleVisibilityChange(): void {
    if (!this.isActive) return;
    
    if (this.isPageVisible) {
      console.log('👁️ [MicrophoneLifecycleManager] Page became visible - resuming monitoring');
      this.updateActivity();
      
      // Check microphone health after page becomes visible
      setTimeout(() => {
        this.performHealthCheck();
      }, 1000);
      
    } else {
      console.log('🙈 [MicrophoneLifecycleManager] Page became hidden - reducing monitoring frequency');
      
      // Consider releasing resources if page stays hidden for too long
      setTimeout(() => {
        if (!this.isPageVisible && this.isActive) {
          const timeSinceActivity = Date.now() - this.lastActivityTime;
          if (timeSinceActivity > this.config.maxIdleTimeBeforeRelease) {
            console.log('⏰ [MicrophoneLifecycleManager] Long inactivity detected - releasing resources');
            this.forceRelease();
          }
        }
      }, this.config.maxIdleTimeBeforeRelease);
    }
  }

  /**
   * Update user activity timestamp
   */
  private updateActivity(): void {
    this.lastActivityTime = Date.now();
    this.isUserActive = true;
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    this.healthCheckInterval = window.setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckIntervalMs);
    
    console.log(`💓 [MicrophoneLifecycleManager] Health monitoring started (${this.config.healthCheckIntervalMs}ms interval)`);
  }

  /**
   * Start idle monitoring
   */
  private startIdleMonitoring(): void {
    if (this.idleCheckInterval) {
      clearInterval(this.idleCheckInterval);
    }
    
    this.idleCheckInterval = window.setInterval(() => {
      this.checkIdleTimeout();
    }, 30000); // Check every 30 seconds
    
    console.log('😴 [MicrophoneLifecycleManager] Idle monitoring started');
  }

  /**
   * Start visibility monitoring
   */
  private startVisibilityMonitoring(): void {
    if (this.visibilityCheckInterval) {
      clearInterval(this.visibilityCheckInterval);
    }
    
    this.visibilityCheckInterval = window.setInterval(() => {
      // Additional visibility-based health checks
      if (this.isPageVisible && this.isActive) {
        this.performHealthCheck();
      }
    }, 10000); // Check every 10 seconds when visible
    
    console.log('👁️ [MicrophoneLifecycleManager] Visibility monitoring started');
  }

  /**
   * Perform comprehensive health check
   */
  private async performHealthCheck(): Promise<void> {
    if (!this.isActive) return;
    
    try {
      const healthStatus = this.audioManager.checkMediaStreamHealth();
      this.lastHealthCheck = healthStatus;
      
      if (!healthStatus.healthy) {
        console.warn('⚠️ [MicrophoneLifecycleManager] Unhealthy microphone state detected:', healthStatus);
        
        // Attempt automatic recovery
        if (this.autoRecoveryAttempts < this.maxAutoRecoveryAttempts) {
          this.autoRecoveryAttempts++;
          
          console.log(`🔧 [MicrophoneLifecycleManager] Attempting automatic recovery (${this.autoRecoveryAttempts}/${this.maxAutoRecoveryAttempts})`);
          
          setTimeout(async () => {
            try {
              await this.audioManager.initialize(); // This will trigger re-initialization if needed
              console.log('✅ [MicrophoneLifecycleManager] Automatic recovery successful');
              
              // Dispatch success event
              this.dispatchCustomEvent('pitchpro:lifecycle:autoRecoverySuccess', {});
              
            } catch (error) {
              console.error('❌ [MicrophoneLifecycleManager] Automatic recovery failed:', error);
              this.callbacks.onError?.(error as Error);
              
              // Dispatch failure event
              this.dispatchCustomEvent('pitchpro:lifecycle:autoRecoveryFailed', { error });
            }
          }, this.config.autoRecoveryDelayMs);
          
        } else {
          console.error('❌ [MicrophoneLifecycleManager] Maximum recovery attempts reached - manual intervention required');
          this.callbacks.onError?.(new Error('Microphone health check failed - maximum recovery attempts exceeded'));
        }
      }
      
    } catch (error) {
      console.error('❌ [MicrophoneLifecycleManager] Health check failed:', error);
      this.callbacks.onError?.(error as Error);
    }
  }

  /**
   * Check for idle timeout
   */
  private checkIdleTimeout(): void {
    if (!this.isActive) return;
    
    const timeSinceActivity = Date.now() - this.lastActivityTime;
    const isIdle = timeSinceActivity > this.config.idleTimeoutMs;
    
    if (isIdle && this.isUserActive) {
      console.log('😴 [MicrophoneLifecycleManager] User idle detected');
      this.isUserActive = false;
      
      // Optionally reduce monitoring frequency during idle
      // But don't automatically release - let the application decide
    }
    
    // Check for extreme idle (auto-release)
    if (timeSinceActivity > this.config.maxIdleTimeBeforeRelease) {
      console.log('⏰ [MicrophoneLifecycleManager] Extreme idle detected - auto-releasing resources');
      this.forceRelease();
    }
  }

  /**
   * Stop all monitoring intervals
   */
  private stopAllMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    if (this.idleCheckInterval) {
      clearInterval(this.idleCheckInterval);
      this.idleCheckInterval = null;
    }
    
    if (this.visibilityCheckInterval) {
      clearInterval(this.visibilityCheckInterval);
      this.visibilityCheckInterval = null;
    }
    
    console.log('⏹️ [MicrophoneLifecycleManager] All monitoring stopped');
  }

  /**
   * Dispatch custom event
   */
  private dispatchCustomEvent(eventName: keyof LifecycleEvents, detail: any): void {
    if (typeof window === 'undefined') return;
    
    const event = new CustomEvent(eventName, { detail });
    window.dispatchEvent(event);
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      refCount: this.refCount,
      isActive: this.isActive,
      isPageVisible: this.isPageVisible,
      isUserActive: this.isUserActive,
      lastActivityTime: this.lastActivityTime,
      timeSinceActivity: Date.now() - this.lastActivityTime,
      autoRecoveryAttempts: this.autoRecoveryAttempts,
      lastHealthCheck: this.lastHealthCheck,
      audioManagerStatus: this.audioManager.getStatus()
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<typeof this.config>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart monitoring with new intervals if active
    if (this.isActive) {
      this.stopAllMonitoring();
      this.startHealthMonitoring();
      this.startIdleMonitoring();
      this.startVisibilityMonitoring();
    }
    
    console.log('🔧 [MicrophoneLifecycleManager] Configuration updated:', newConfig);
  }

  /**
   * Cleanup and destroy
   */
  destroy(): void {
    console.log('🗑️ [MicrophoneLifecycleManager] Destroying lifecycle manager');
    
    // Stop all monitoring
    this.stopAllMonitoring();
    
    // Force release resources
    this.forceRelease();
    
    // Remove event listeners
    this.eventListeners.forEach((listener, eventName) => {
      if (eventName.includes('window:')) {
        window.removeEventListener(eventName.replace('window:', ''), listener);
      } else {
        document.removeEventListener(eventName, listener);
      }
    });
    this.eventListeners.clear();
    
    console.log('✅ [MicrophoneLifecycleManager] Cleanup complete');
  }
}