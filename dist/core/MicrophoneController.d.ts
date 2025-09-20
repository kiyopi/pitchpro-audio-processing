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
import type { DeviceSpecs, MediaStreamResources, MicrophoneControllerEvents, ErrorCallback, StateChangeCallback } from '../types';
import { AudioManager } from './AudioManager';
import { PitchDetector } from './PitchDetector';
import type { LifecycleManagerConfig } from './MicrophoneLifecycleManager';
import { LogLevel } from '../utils/Logger';
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
export declare class MicrophoneController {
    /** @readonly AudioManager instance for low-level audio resource management */
    readonly audioManager: AudioManager;
    /** @private Lifecycle manager for safe resource handling */
    private lifecycleManager;
    /** @private Error notification system for user feedback */
    private errorSystem;
    /** @private Logger for structured logging */
    private logger;
    /** @private Configuration object with defaults */
    private config;
    /** @private Current controller state */
    private currentState;
    /** @private Microphone permission granted flag */
    private isPermissionGranted;
    /** @private Last error encountered during operations */
    private lastError;
    /** @private Event callback functions */
    private eventCallbacks;
    /** @private Device-specific optimization specifications */
    private deviceSpecs;
    /** @private PitchDetector instance management for unified control */
    private pitchDetector;
    /** @private AudioDetectionComponent instance management for UI control */
    private audioDetectionComponent;
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
    constructor(config?: MicrophoneControllerConfig);
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
    }): void;
    /**
     * Reset lifecycle manager recovery attempts
     * Provides safe access to lifecycle recovery reset without exposing internal state
     */
    resetRecoveryAttempts(): void;
    /**
     * Check if controller is in active state
     */
    isActive(): boolean;
    /**
     * Check if controller is ready for use
     */
    isReady(): boolean;
    /**
     * Check if controller is initialized
     */
    isInitialized(): boolean;
    /**
     * Setup internal event handlers
     */
    private setupEventHandlers;
    /**
     * Detect device specifications
     */
    private detectDevice;
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
    initialize(): Promise<MediaStreamResources>;
    /**
     * Request microphone permission (alias for initialize)
     */
    requestPermission(): Promise<boolean>;
    /**
     * Check if microphone permission is granted
     */
    checkPermissionStatus(): Promise<'granted' | 'denied' | 'prompt'>;
    /**
     * Stop microphone and release resources
     */
    stop(): void;
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
    forceStop(): void;
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
    setSensitivity(sensitivity: number): void;
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
    getSensitivity(): number;
    /**
     * Mutes the microphone by disabling audio tracks
     *
     * @description Provides instant mute functionality by disabling MediaStream
     * audio tracks without requiring resource reinitialization. Maintains stream
     * connection for quick unmute operations. Ideal for UI switching and temporary
     * audio interruptions.
     *
     * @example
     * ```typescript
     * micController.mute();
     * console.log('Microphone muted');
     * ```
     */
    mute(): void;
    /**
     * Unmutes the microphone by enabling audio tracks
     *
     * @description Re-enables audio input immediately without initialization delays.
     * Complements the mute() method for seamless audio control during UI operations.
     *
     * @example
     * ```typescript
     * micController.unmute();
     * console.log('Microphone unmuted');
     * ```
     */
    unmute(): void;
    /**
     * Toggles microphone mute state
     *
     * @description Convenience method that automatically mutes or unmutes based on
     * current state. Useful for implementing mute buttons and keyboard shortcuts.
     *
     * @returns The new mute state (true if now muted, false if now unmuted)
     *
     * @example
     * ```typescript
     * const isMuted = micController.toggleMute();
     * console.log(`Microphone is now ${isMuted ? 'muted' : 'unmuted'}`);
     * ```
     */
    toggleMute(): boolean;
    /**
     * Checks if microphone is currently muted
     *
     * @returns True if microphone is muted, false otherwise
     *
     * @example
     * ```typescript
     * if (micController.isMuted()) {
     *   console.log('Microphone is currently muted');
     * }
     * ```
     */
    isMuted(): boolean;
    /**
     * Registers an AudioDetectionComponent instance with this controller for UI management
     *
     * @description Enables the MicrophoneController to control AudioDetectionComponent UI
     * reset operations for complete system reset including comprehensive UI cleanup.
     *
     * @param component - The AudioDetectionComponent instance to register
     *
     * @example
     * ```typescript
     * const audioDetector = new AudioDetectionComponent();
     * const micController = audioDetector.microphoneController;
     *
     * // Register component for UI control
     * micController.registerAudioDetectionComponent(audioDetector);
     *
     * // Now reset() includes comprehensive UI reset
     * micController.reset(); // Includes AudioDetectionComponent UI reset
     * ```
     */
    registerAudioDetectionComponent(component: any): void;
    /**
     * Registers a PitchDetector instance with this controller for unified management
     *
     * @description Enables the MicrophoneController to act as the central coordinator
     * for the entire PitchPro library by managing PitchDetector instances. This allows
     * unified control over detection, display, and audio management operations.
     *
     * @param detector - The PitchDetector instance to register
     *
     * @example
     * ```typescript
     * const micController = new MicrophoneController();
     * const pitchDetector = new PitchDetector(micController.audioManager);
     *
     * // Register detector for unified control
     * micController.registerDetector(pitchDetector);
     *
     * // Now controller can manage both audio and detection
     * micController.reset(); // Stops detection, resets display, mutes mic
     * ```
     */
    registerDetector(detector: PitchDetector): void;
    /**
     * Starts microphone and pitch detection systems
     *
     * @description Unmutes the microphone and starts pitch detection if a PitchDetector
     * is registered. This method complements the reset() method for complete system
     * lifecycle management. Provides one-click start functionality for the entire
     * PitchPro library ecosystem.
     *
     * @returns True if both unmute and detection start succeeded, false otherwise
     *
     * @example
     * ```typescript
     * // Start system - unmutes mic and begins detection
     * const success = micController.start();
     * if (success) {
     *   console.log('System started successfully');
     * }
     *
     * // Typical usage pattern
     * micController.reset(); // Stop everything
     * micController.start(); // Resume everything
     * ```
     */
    start(): boolean;
    /**
     * Performs comprehensive system reset across all managed components
     *
     * @description Executes a complete system reset by stopping pitch detection,
     * clearing all UI display elements, muting the microphone, and resetting
     * internal states. Provides one-click reset functionality for the entire
     * PitchPro library ecosystem when used as the central coordinator.
     *
     * @example
     * ```typescript
     * // Complete system reset - stops everything and clears UI
     * micController.reset();
     * console.log('All systems reset and ready for next operation');
     *
     * // Ideal for UI reset buttons
     * function handleResetButtonClick() {
     *   micController.reset(); // One call handles everything
     * }
     * ```
     */
    reset(): void;
    /**
     * Get device specifications
     */
    getDeviceSpecs(): DeviceSpecs | null;
    /**
     * Get current state
     */
    getState(): string;
    /**
     * Check if permission is granted
     */
    hasPermission(): boolean;
    /**
     * Get comprehensive status
     */
    getStatus(): {
        state: "error" | "active" | "uninitialized" | "initializing" | "ready";
        isPermissionGranted: boolean;
        isActive: boolean;
        isReady: boolean;
        sensitivity: number;
        deviceSpecs: DeviceSpecs | null;
        lastError: Error | null;
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
        lifecycleStatus: {
            refCount: number;
            isActive: boolean;
            isPageVisible: boolean;
            isUserActive: boolean;
            lastActivityTime: number;
            timeSinceActivity: number;
            autoRecoveryAttempts: number;
            lastHealthCheck: import("../types").HealthStatus | null;
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
    };
    /**
     * Perform health check
     */
    checkHealth(): import("../types").HealthStatus;
    /**
     * Test microphone functionality
     */
    testMicrophone(durationMs?: number): Promise<{
        success: boolean;
        volume: number;
        frequency: number | null;
        duration: number;
        error?: Error;
    }>;
    /**
     * Update internal state and notify
     */
    private updateState;
    /**
     * Handle errors with notification system
     */
    private handleError;
    /**
     * Dispatch custom DOM event
     */
    private dispatchCustomEvent;
    /**
     * Add event listener for microphone events
     */
    addEventListener<K extends keyof MicrophoneControllerEvents>(type: K, listener: (event: MicrophoneControllerEvents[K]) => void): void;
    /**
     * Remove event listener for microphone events
     */
    removeEventListener<K extends keyof MicrophoneControllerEvents>(type: K, listener: (event: MicrophoneControllerEvents[K]) => void): void;
    /**
     * Cleanup and destroy all resources
     */
    destroy(): void;
    /**
     * Creates structured error with enhanced context information
     *
     * @private
     * @param error - Original error
     * @param operation - Operation that failed
     * @returns Structured PitchProError with context
     */
    private _createStructuredError;
}
//# sourceMappingURL=MicrophoneController.d.ts.map