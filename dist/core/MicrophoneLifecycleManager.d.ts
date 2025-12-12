/**
 * MicrophoneLifecycleManager - Page transition and idle detection microphone control
 *
 * Manages microphone lifecycle across page transitions, idle periods, and redirects
 * Implements reference counting for safe resource management
 * Handles SSR compatibility and automatic recovery
 */
import type { MediaStreamResources, HealthStatus, StateChangeCallback, ErrorCallback } from '../types';
import { AudioManager } from './AudioManager';
import { LogLevel } from '../utils/Logger';
export interface LifecycleManagerConfig {
    healthCheckIntervalMs?: number;
    idleTimeoutMs?: number;
    autoRecoveryDelayMs?: number;
    maxIdleTimeBeforeRelease?: number;
    maxAutoRecoveryAttempts?: number;
    logLevel?: LogLevel;
    enableDetailedLogging?: boolean;
}
export declare class MicrophoneLifecycleManager {
    private audioManager;
    private refCount;
    private isActive;
    private lastHealthCheck;
    private logger;
    private healthCheckInterval;
    private idleCheckInterval;
    private visibilityCheckInterval;
    private lastActivityTime;
    private isPageVisible;
    private isUserActive;
    private autoRecoveryAttempts;
    private readonly initTime;
    private static readonly INIT_GUARD_MS;
    private eventListeners;
    private config;
    private callbacks;
    constructor(audioManager: AudioManager, userConfig?: LifecycleManagerConfig);
    /**
     * Set callback functions
     */
    setCallbacks(callbacks: {
        onStateChange?: StateChangeCallback;
        onError?: ErrorCallback;
    }): void;
    /**
     * Helper method to add event listener with automatic tracking for cleanup
     * Currently not used but available for future event listener management improvements
     */
    /**
     * Helper method to remove all tracked event listeners
     */
    private removeAllTrackedEventListeners;
    /**
     * Acquire microphone resources (with reference counting)
     */
    acquire(): Promise<MediaStreamResources>;
    /**
     * Release microphone resources (with reference counting)
     */
    release(): void;
    /**
     * Force release all resources (emergency cleanup)
     */
    forceRelease(): void;
    /**
     * Setup page lifecycle event listeners
     */
    private setupEventListeners;
    /**
     * Handle page visibility changes
     */
    private handleVisibilityChange;
    /**
     * Update user activity timestamp
     * Call this method when user activity is detected to prevent idle timeout
     */
    updateActivity(): void;
    /**
     * Start health monitoring
     */
    private startHealthMonitoring;
    /**
     * Start idle monitoring
     */
    private startIdleMonitoring;
    /**
     * Start visibility monitoring
     */
    private startVisibilityMonitoring;
    /**
     * Perform comprehensive health check
     */
    private performHealthCheck;
    /**
     * Check for idle timeout
     */
    private checkIdleTimeout;
    /**
     * Stop all monitoring intervals
     */
    private stopAllMonitoring;
    /**
     * Dispatch custom event
     */
    private dispatchCustomEvent;
    /**
     * Get current status
     */
    getStatus(): {
        refCount: number;
        isActive: boolean;
        isPageVisible: boolean;
        isUserActive: boolean;
        lastActivityTime: number;
        timeSinceActivity: number;
        autoRecoveryAttempts: number;
        lastHealthCheck: HealthStatus | null;
        audioManagerStatus: {
            isInitialized: boolean;
            refCount: number;
            audioContextState: string;
            mediaStreamActive: boolean;
            activeAnalysers: string[];
            activeFilters: string[];
            lastError: Error | null;
            currentSensitivity: number;
        };
    };
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<typeof this.config>): void;
    /**
     * Reset recovery attempts and restart monitoring if needed
     * This method provides manual intervention capability for max recovery attempts errors
     */
    resetRecoveryAttempts(): void;
    /**
     * Cleanup and destroy
     */
    destroy(): void;
}
//# sourceMappingURL=MicrophoneLifecycleManager.d.ts.map