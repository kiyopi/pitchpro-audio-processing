/**
 * PitchDetector - Framework-agnostic High-precision Pitch Detection Engine
 *
 * @description Provides real-time pitch detection using the McLeod Pitch Method (Pitchy library)
 * with advanced features including configurable harmonic correction, adaptive frame rate control,
 * noise filtering, TypedArray-optimized volume history, and device-specific optimization for
 * consistent cross-platform performance. Supports development-mode debug logging and comprehensive
 * performance monitoring.
 *
 * @features
 * - **McLeod Pitch Method**: Industry-standard pitch detection algorithm
 * - **Harmonic Correction**: Configurable octave jump detection and correction
 * - **Adaptive Performance**: Dynamic frame rate adjustment (30-60 FPS)
 * - **TypedArray Optimization**: High-performance buffer operations
 * - **Device Optimization**: Platform-specific sensitivity adjustments
 * - **Silence Detection**: Configurable timeout and warning system
 * - **Development Debug**: Conditional debug logging for development builds
 *
 * @example
 * ```typescript
 * // Basic usage with default configuration
 * const pitchDetector = new PitchDetector(audioManager);
 *
 * // Advanced configuration with custom settings
 * const pitchDetector = new PitchDetector(audioManager, {
 *   fftSize: 4096,
 *   clarityThreshold: 0.4,
 *   minVolumeAbsolute: 0.003,
 *   harmonicCorrection: {
 *     enabled: true,
 *     confidenceThreshold: 0.7,
 *     historyWindow: 1000,
 *     frequencyThreshold: 0.1
 *   },
 *   volumeHistory: {
 *     historyLength: 5,
 *     useTypedArray: true
 *   },
 *   silenceDetection: {
 *     enabled: true,
 *     warningThreshold: 15000,
 *     timeoutThreshold: 30000
 *   }
 * });
 *
 * await pitchDetector.initialize();
 *
 * pitchDetector.setCallbacks({
 *   onPitchUpdate: (result) => {
 *     console.log(`Detected: ${result.note} (${result.frequency.toFixed(1)}Hz)`);
 *     console.log(`Clarity: ${(result.clarity * 100).toFixed(1)}%, Volume: ${result.volume.toFixed(1)}%`);
 *   },
 *   onError: (error) => {
 *     console.error('Detection error:', error.message);
 *   },
 *   onStateChange: (state) => {
 *     console.log('Detection state:', state);
 *   }
 * });
 *
 * pitchDetector.startDetection();
 * ```
 *
 * @version 1.1.3
 * @since 1.0.0
 */
import type { PitchDetectorConfig, PitchDetectionResult, PitchCallback, ErrorCallback, StateChangeCallback, DeviceSpecs, SilenceDetectionConfig } from '../types';
/**
 * Configuration for harmonic correction system
 * @interface HarmonicCorrectionConfig
 */
export interface HarmonicCorrectionConfig {
    /** @description Enable/disable harmonic correction (default: true) */
    enabled?: boolean;
    /** @description Confidence threshold for corrections (0-1, default: 0.7) */
    confidenceThreshold?: number;
    /** @description Time window for harmonic history in ms (default: 1000) */
    historyWindow?: number;
    /** @description Frequency difference threshold for octave detection (0-1, default: 0.1) */
    frequencyThreshold?: number;
}
/**
 * Configuration for volume history optimization
 * @interface VolumeHistoryConfig
 */
export interface VolumeHistoryConfig {
    /** @description Number of frames to keep in volume history (default: 5) */
    historyLength?: number;
    /** @description Use optimized TypedArray buffer (default: false) */
    useTypedArray?: boolean;
}
import { AudioManager } from './AudioManager';
export declare class PitchDetector {
    /** @private AudioManager instance for resource management */
    private audioManager;
    /** @private Pitchy library detector instance for McLeod Pitch Method */
    private pitchDetector;
    /** @private AnalyserNode with noise filtering applied */
    private analyser;
    /** @private Raw AnalyserNode for unfiltered volume measurement */
    private rawAnalyser;
    /** @private RequestAnimationFrame ID for detection loop */
    private animationFrame;
    /** @private Adaptive frame rate controller for optimal performance */
    private frameRateLimiter;
    /** @private Current component state for lifecycle management */
    private componentState;
    /** @private Initialization completion flag */
    private isInitialized;
    /** @private Detection active flag */
    private isDetecting;
    /** @private Last error encountered during operations */
    private lastError;
    /** @private Array of analyser IDs for cleanup management */
    private analyserIds;
    /** @private Current processed volume level (0-100) */
    private currentVolume;
    /** @private Raw volume level before processing (0-100) */
    private rawVolume;
    /** @private Currently detected frequency in Hz (preserves decimal precision) */
    private currentFrequency;
    /** @private Detected musical note name */
    private detectedNote;
    /** @private Detected octave number */
    private detectedOctave;
    /** @private Pitch detection clarity/confidence (0-1) */
    private pitchClarity;
    /** @private Previous frequency for harmonic correction */
    private previousFrequency;
    /** @private History buffer for harmonic analysis */
    private harmonicHistory;
    /** @private PitchDetector configuration with defaults applied */
    private config;
    /** @private Harmonic correction configuration */
    private harmonicConfig;
    /** @private Volume history configuration */
    private volumeHistoryConfig;
    /** @private Flag to disable harmonic correction */
    private disableHarmonicCorrection;
    /** @private Callback functions for events */
    private callbacks;
    /** @private Device-specific optimization parameters */
    private deviceSpecs;
    /** @private Silence detection configuration */
    private silenceDetectionConfig;
    /** @private Timestamp when silence started */
    private silenceStartTime;
    /** @private Timer ID for silence warning */
    private silenceWarningTimer;
    /** @private Timer ID for silence timeout */
    private silenceTimeoutTimer;
    /** @private Current silence state flag */
    private isSilent;
    /** @private Silence warning already issued flag */
    private hasWarned;
    /**
     * Creates a new PitchDetector instance with comprehensive configuration options
     *
     * @description Initializes a high-performance pitch detection engine with configurable
     * harmonic correction, optimized volume history buffers, and device-specific optimizations.
     * The constructor applies sensible defaults while allowing fine-grained control over all
     * detection parameters and performance characteristics.
     *
     * @param audioManager - AudioManager instance for resource management and audio context access
     * @param config - Optional configuration object to customize detection behavior
     * @param config.fftSize - FFT size for frequency analysis (default: 4096, recommended: 2048-8192)
     * @param config.smoothing - Smoothing factor for AnalyserNode (default: 0.1, range: 0-1)
     * @param config.clarityThreshold - Minimum clarity for valid detection (default: 0.4, range: 0-1)
     * @param config.minVolumeAbsolute - Minimum volume threshold (default: 0.003, range: 0.001-0.01)
     * @param config.harmonicCorrection - Harmonic correction configuration
     * @param config.harmonicCorrection.enabled - Enable octave jump correction (default: true)
     * @param config.harmonicCorrection.confidenceThreshold - Confidence required for correction (default: 0.7)
     * @param config.harmonicCorrection.historyWindow - Time window for harmonic analysis in ms (default: 1000)
     * @param config.harmonicCorrection.frequencyThreshold - Frequency difference threshold (default: 0.1)
     * @param config.volumeHistory - Volume history buffer configuration
     * @param config.volumeHistory.historyLength - Number of frames to average (default: 10)
     * @param config.volumeHistory.useTypedArray - Use TypedArray for better performance (default: true)
     * @param config.silenceDetection - Silence detection and timeout configuration
     * @param config.silenceDetection.enabled - Enable silence detection (default: false)
     * @param config.silenceDetection.warningThreshold - Warning timeout in ms (default: 15000)
     * @param config.silenceDetection.timeoutThreshold - Hard timeout in ms (default: 30000)
     *
     * @example
     * ```typescript
     * // Minimal configuration (uses optimized defaults)
     * const pitchDetector = new PitchDetector(audioManager);
     *
     * // Performance-optimized configuration for music applications
     * const pitchDetector = new PitchDetector(audioManager, {
     *   fftSize: 4096,           // Good balance of accuracy and performance
     *   clarityThreshold: 0.5,   // Higher threshold for cleaner detection
     *   minVolumeAbsolute: 0.002, // Sensitive to quiet sounds
     *   harmonicCorrection: {
     *     enabled: true,
     *     confidenceThreshold: 0.8, // Conservative octave correction
     *     historyWindow: 1500,       // Longer analysis window
     *     frequencyThreshold: 0.08   // Tighter frequency matching
     *   },
     *   volumeHistory: {
     *     historyLength: 7,      // More smoothing
     *     useTypedArray: true    // Maximum performance
     *   }
     * });
     *
     * // Educational/debugging configuration
     * const pitchDetector = new PitchDetector(audioManager, {
     *   fftSize: 8192,           // High resolution for analysis
     *   clarityThreshold: 0.3,   // Lower threshold to see more detections
     *   harmonicCorrection: {
     *     enabled: false         // Disable to see raw algorithm output
     *   },
     *   volumeHistory: {
     *     historyLength: 3,      // Less smoothing for immediate response
     *     useTypedArray: false   // Standard arrays for easier debugging
     *   },
     *   silenceDetection: {
     *     enabled: true,
     *     warningThreshold: 10000, // 10 second warning
     *     timeoutThreshold: 20000  // 20 second timeout
     *   }
     * });
     * ```
     */
    constructor(audioManager: AudioManager, config?: PitchDetectorConfig & {
        harmonicCorrection?: Partial<HarmonicCorrectionConfig>;
        volumeHistory?: Partial<VolumeHistoryConfig>;
    });
    /**
     * Sets callback functions for pitch detection events
     *
     * @description Configures event handlers for real-time pitch detection results,
     * errors, and state changes. Callbacks are called at the adaptive frame rate
     * (typically 30-60 FPS) during active detection.
     *
     * @param callbacks - Object containing callback functions
     * @param callbacks.onPitchUpdate - Called when valid pitch is detected with frequency, note, clarity, and volume data
     * @param callbacks.onError - Called when recoverable or non-recoverable errors occur during detection
     * @param callbacks.onStateChange - Called when component transitions between states (uninitialized/ready/detecting/error)
     *
     * @example
     * ```typescript
     * pitchDetector.setCallbacks({
     *   onPitchUpdate: (result) => {
     *     // Real-time pitch data (30-60 times per second)
     *     console.log(`Pitch: ${result.frequency.toFixed(2)}Hz`);
     *     console.log(`Note: ${result.note}, Octave: ${result.octave}`);
     *     console.log(`Clarity: ${(result.clarity * 100).toFixed(1)}%`);
     *     console.log(`Volume: ${result.volume.toFixed(1)}%`);
     *
     *     // Cents deviation from perfect tuning
     *     if (result.cents !== undefined) {
     *       console.log(`Tuning: ${result.cents > 0 ? '+' : ''}${result.cents} cents`);
     *     }
     *   },
     *   onError: (error) => {
     *     console.error('Detection error:', error.message);
     *
     *     // Handle specific error types
     *     if (error instanceof PitchDetectionError) {
     *       console.log('Pitch detection algorithm error - may be recoverable');
     *     } else if (error instanceof AudioContextError) {
     *       console.log('Audio system error - requires reinitialization');
     *     }
     *   },
     *   onStateChange: (state) => {
     *     console.log('Detection state changed to:', state);
     *
     *     // React to state changes
     *     switch (state) {
     *       case 'ready':
     *         console.log('PitchDetector initialized and ready');
     *         break;
     *       case 'detecting':
     *         console.log('Active pitch detection started');
     *         break;
     *       case 'error':
     *         console.log('Error state - check error callback for details');
     *         break;
     *     }
     *   }
     * });
     * ```
     */
    setCallbacks(callbacks: {
        onPitchUpdate?: PitchCallback;
        onError?: ErrorCallback;
        onStateChange?: StateChangeCallback;
    }): void;
    /**
     * Initializes the pitch detector with audio resources and Pitchy engine
     *
     * @description Sets up audio analysers, creates Pitchy detector instance, and initializes
     * device-specific configurations. Must be called before starting detection.
     *
     * @returns Promise that resolves when initialization is complete
     * @throws {AudioContextError} If AudioManager initialization fails
     * @throws {PitchDetectionError} If Pitchy detector creation fails
     *
     * @example
     * ```typescript
     * try {
     *   await pitchDetector.initialize();
     *   console.log('Pitch detector ready');
     * } catch (error) {
     *   console.error('Initialization failed:', error);
     * }
     * ```
     */
    initialize(): Promise<void>;
    /**
     * Starts real-time pitch detection with adaptive frame rate control
     *
     * @description Begins the pitch detection loop using requestAnimationFrame.
     * Automatically manages performance optimization and device-specific adjustments.
     *
     * @returns True if detection started successfully, false otherwise
     *
     * @example
     * ```typescript
     * if (pitchDetector.startDetection()) {
     *   console.log('Pitch detection started');
     * } else {
     *   console.error('Failed to start detection');
     * }
     * ```
     */
    startDetection(): boolean;
    /**
     * Stops pitch detection and cleans up detection loop
     *
     * @description Cancels the detection loop, resets frame rate limiter,
     * and clears silence detection timers. Safe to call multiple times.
     *
     * @example
     * ```typescript
     * pitchDetector.stopDetection();
     * console.log('Pitch detection stopped');
     * ```
     */
    stopDetection(): void;
    /**
     * Real-time pitch detection loop with adaptive frame rate
     * @private
     * @description Main detection loop optimized for performance with minimal
     * redundant calculations and efficient buffer operations
     */
    private detectPitch;
    /**
     * Harmonic correction system with configurable parameters
     *
     * @private
     * @description Analyzes frequency history to detect and correct harmonic errors
     * like octave jumping. Uses configurable confidence thresholds and time windows
     * to balance correction accuracy with responsiveness.
     *
     * @param frequency - The detected frequency to potentially correct
     * @param volume - The current volume level for confidence calculation
     * @returns The corrected frequency or original if no correction needed
     */
    private correctHarmonic;
    /**
     * Reset harmonic correction history and frequency tracking
     *
     * @private
     * @description Clears the frequency history buffer used for harmonic correction
     * and resets the previous frequency reference. Called when signal quality is poor
     * or when restarting detection to prevent incorrect corrections.
     */
    private resetHarmonicHistory;
    /**
     * Convert frequency to musical note name and octave number
     *
     * @private
     * @description Converts a frequency in Hz to standard musical notation using
     * equal temperament tuning (A4 = 440Hz). Calculates semitone distances
     * and maps to chromatic scale positions.
     *
     * @param frequency - Input frequency in Hz
     * @returns Object containing note name (C, C#, D, etc.) and octave number
     *
     * @example
     * ```typescript
     * frequencyToNoteAndOctave(440) // { note: 'A', octave: 4 }
     * frequencyToNoteAndOctave(261.63) // { note: 'C', octave: 4 }
     * ```
     */
    private frequencyToNoteAndOctave;
    /**
     * Convert frequency to cents deviation from the nearest semitone
     *
     * @private
     * @description Calculates the pitch deviation in cents (1/100th of a semitone)
     * from the nearest equal temperament note. Positive values indicate sharp,
     * negative values indicate flat.
     *
     * @param frequency - Input frequency in Hz
     * @returns Cents deviation (-50 to +50 cents from nearest note)
     *
     * @example
     * ```typescript
     * frequencyToCents(440) // 0 (exactly A4)
     * frequencyToCents(446) // ~25 cents sharp
     * frequencyToCents(435) // ~-20 cents flat
     * ```
     */
    private frequencyToCents;
    /**
     * Process silence detection logic and manage timeout handlers
     *
     * @private
     * @description Monitors volume levels to detect periods of silence and triggers
     * appropriate warnings and timeouts. Manages silence detection state and timers
     * to provide automatic recovery from idle states.
     *
     * @param currentVolume - Current volume level to evaluate for silence
     */
    private processSilenceDetection;
    /**
     * Handle silence warning
     */
    private handleSilenceWarning;
    /**
     * Handle silence timeout
     */
    private handleSilenceTimeout;
    /**
     * Reset silence tracking state
     */
    private resetSilenceTracking;
    /**
     * Reset display state and immediately update UI elements
     */
    resetDisplayState(): void;
    /**
     * Force UI update with current internal state (reset values)
     * @private
     */
    private forceUIUpdate;
    /**
     * Enable/disable harmonic correction
     */
    setHarmonicCorrectionEnabled(enabled: boolean): void;
    /**
     * Update silence detection configuration
     */
    setSilenceDetectionConfig(config: Partial<SilenceDetectionConfig>): void;
    /**
     * Get current silence detection status
     */
    getSilenceStatus(): {
        isEnabled: boolean;
        isSilent: boolean;
        silenceDuration: number | null;
        hasWarned: boolean;
    };
    /**
     * Get initialization status
     */
    getIsInitialized(): boolean;
    /**
     * Get current state
     */
    getState(): {
        componentState: "error" | "uninitialized" | "initializing" | "ready" | "detecting";
        isInitialized: boolean;
        isDetecting: boolean;
        lastError: Error | null;
        hasRequiredComponents: boolean;
    };
    /**
     * Get current detection result
     */
    getCurrentResult(): PitchDetectionResult;
    /**
     * Process audio data with high priority for real-time callback delivery
     *
     * @private
     * @description Handles critical audio processing that requires low latency.
     * Runs at the full adaptive frame rate (30-60 FPS) to ensure responsive
     * pitch detection callbacks for real-time applications.
     *
     * @param result - Complete pitch detection result to process
     */
    private processAudioData;
    /**
     * Update visual elements with lower priority rendering
     *
     * @private
     * @description Handles visual updates that can be throttled to maintain performance.
     * Visual rendering can be limited to 30 FPS without affecting audio processing quality.
     * The underscore prefix indicates intentional parameter non-use.
     *
     * @param _result - Pitch detection result (unused, handled by UI layer)
     */
    private updateVisuals;
    /**
     * Get current performance statistics
     */
    getPerformanceStats(): {
        currentFPS: number;
        frameDrops: number;
        latency: number;
    };
    /**
     * Reinitialize detector
     */
    reinitialize(): Promise<void>;
    /**
     * Cleanup resources
     */
    cleanup(): void;
    /**
     * Gets the latest pitch detection result without triggering new analysis
     *
     * @description Returns the most recent detection result from the ongoing analysis.
     * Useful for UI updates and external monitoring without affecting detection performance.
     *
     * @returns Latest pitch detection result or null if no detection is active
     *
     * @example
     * ```typescript
     * const result = pitchDetector.getLatestResult();
     * if (result) {
     *   console.log(`Latest: ${result.note} - ${result.frequency.toFixed(1)}Hz`);
     *   console.log(`Volume: ${result.volume.toFixed(1)}%, Clarity: ${result.clarity.toFixed(2)}`);
     * }
     * ```
     */
    getLatestResult(): PitchDetectionResult | null;
    /**
     * Destroys the PitchDetector and cleans up all resources
     *
     * @example
     * ```typescript
     * pitchDetector.destroy();
     * console.log('PitchDetector destroyed and resources cleaned up');
     * ```
     */
    destroy(): void;
    /**
     * Gets current PitchDetector status for debugging and monitoring
     *
     * @returns Status object with component state and performance metrics
     */
    getStatus(): {
        componentState: "error" | "uninitialized" | "initializing" | "ready" | "detecting";
        isInitialized: boolean;
        isDetecting: boolean;
        isRunning: boolean;
        currentVolume: number;
        rawVolume: number;
        currentFrequency: number;
        detectedNote: string;
        detectedOctave: number | null;
        currentClarity: number;
        lastError: Error | null;
        frameRateStatus: {
            currentFPS: number;
            frameDrops: number;
            latency: number;
        };
        deviceSpecs: DeviceSpecs | null;
        hasRequiredComponents: boolean;
        harmonicConfig: Required<HarmonicCorrectionConfig>;
        volumeHistoryConfig: Required<VolumeHistoryConfig>;
    };
    /**
     * Update harmonic correction configuration
     *
     * @param config - Partial harmonic correction configuration to update
     */
    updateHarmonicConfig(config: Partial<HarmonicCorrectionConfig>): void;
}
//# sourceMappingURL=PitchDetector.d.ts.map