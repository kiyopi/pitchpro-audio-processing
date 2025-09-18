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
import { MicrophoneController } from '../core/MicrophoneController';
import { PitchProError } from '../utils/errors';
import type { PitchDetectionResult, DeviceSpecs } from '../types';
/**
 * Configuration interface for AudioDetectionComponent
 */
export interface AudioDetectionConfig {
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
    clarityThreshold?: number;
    minVolumeAbsolute?: number;
    fftSize?: number;
    smoothing?: number;
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
    /**
     * Callback function called on each pitch detection update.
     * @param result - The processed pitch detection result including rawVolume and clarity.
     */
    onPitchUpdate?: (result: PitchDetectionResult) => void;
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
export declare class AudioDetectionComponent {
    /** @private UI timing constants */
    private static readonly NOTE_RESET_DELAY_MS;
    private static readonly SELECTOR_UPDATE_DELAY_MS;
    private static readonly UI_RESTART_DELAY_MS;
    /** @private Configuration with applied defaults */
    private config;
    /** @private AudioManager instance for resource management */
    private audioManager;
    /** @private PitchDetector instance for pitch detection */
    private pitchDetector;
    /** @private MicrophoneController for high-level microphone management */
    private micController;
    /** @private Current component state */
    private currentState;
    /** @private Event callbacks */
    private callbacks;
    /** @private Device specifications */
    private deviceSpecs;
    /** @private Device-specific settings */
    private deviceSettings;
    /** @private UI update interval ID */
    private uiUpdateTimer;
    /** @private Flag to prevent UI updates during selector changes */
    private isUpdatingSelectors;
    /** @private UI elements cache */
    private uiElements;
    /** @private Last error encountered */
    private lastError;
    /** @private Initialization state */
    private isInitialized;
    /** @private Note display persistence timer */
    private noteResetTimer;
    /** @private Helper method for creating delays */
    private delay;
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
    constructor(config?: AudioDetectionConfig);
    /**
     * 自動UI更新機能に関する警告をチェックして表示
     */
    private checkAutoUpdateUIWarnings;
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
    initialize(): Promise<void>;
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
    updateUI(result: PitchDetectionResult): void;
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
    updateSelectors(selectors: Partial<Pick<AudioDetectionConfig, 'volumeBarSelector' | 'volumeTextSelector' | 'frequencySelector' | 'noteSelector'>>): Promise<void>;
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
    resetRecoveryAttempts(): void;
    destroy(): void;
    /**
     * Gets current component status for debugging
     *
     * @returns Status object with current state information
     */
    getStatus(): {
        state: "error" | "uninitialized" | "initializing" | "ready" | "detecting" | "stopped";
        isInitialized: boolean;
        deviceSpecs: DeviceSpecs | null;
        deviceSettings: DeviceSettings | null;
        config: Required<Omit<AudioDetectionConfig, "volumeBarSelector" | "volumeTextSelector" | "frequencySelector" | "noteSelector" | "onPitchUpdate">> & {
            volumeBarSelector?: string | undefined;
            volumeTextSelector?: string | undefined;
            frequencySelector?: string | undefined;
            noteSelector?: string | undefined;
            onPitchUpdate?: ((result: PitchDetectionResult) => void) | undefined;
        };
        lastError: PitchProError | null;
        pitchDetectorStatus: {
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
            harmonicConfig: Required<import("../core/PitchDetector").HarmonicCorrectionConfig>;
            volumeHistoryConfig: Required<import("../core/PitchDetector").VolumeHistoryConfig>;
        } | undefined;
        micControllerStatus: {
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
        } | undefined;
    };
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
    get microphoneController(): MicrophoneController | null;
    /**
     * Detects device type and applies optimization settings
     * @private
     */
    private detectAndOptimizeDevice;
    /**
     * Caches UI elements for efficient updates
     * @private
     */
    private cacheUIElements;
    /**
     * Publicly accessible method to reset all UI elements to their initial state
     * Provides external access to comprehensive UI reset functionality
     */
    resetDisplayElements(): void;
    /**
     * Resets all UI elements to their initial state (0 values)
     * @private
     */
    private resetAllUIElements;
    /**
     * Handles pitch update events from PitchDetector
     * @private
     */
    private handlePitchUpdate;
    /**
     * Starts UI update timer
     * @private
     */
    private startUIUpdates;
    /**
     * Stops UI update timer
     * @private
     */
    private stopUIUpdates;
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
    private _getProcessedResult;
    /**
     * Updates component state and notifies callbacks
     * @private
     */
    private updateState;
    /**
     * Handles errors with proper logging and callback notification
     * @private
     */
    private handleError;
    /**
     * Creates structured error with context information
     * @private
     */
    private createStructuredError;
    /**
     * Debug logging utility
     * @private
     */
    private debugLog;
}
export {};
//# sourceMappingURL=AudioDetectionComponent.d.ts.map