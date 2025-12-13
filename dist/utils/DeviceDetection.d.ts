/**
 * DeviceDetection - Cross-platform device detection and optimization
 *
 * Detects device types, capabilities, and provides optimized settings
 * Handles iPadOS 13+ detection issues and provides device-specific configurations
 */
import type { DeviceSpecs, DeviceOverrides, DeviceSpecsWithOverrides } from '../types';
export declare class DeviceDetection {
    private static cachedSpecs;
    /**
     * Detect current device and return optimized specifications
     */
    static getDeviceSpecs(): DeviceSpecs;
    /**
     * デバイス検出値にアプリ側オーバーライドをマージ
     *
     * @description
     * DeviceDetectionの自動検出値をベースに、アプリ側からの上書き設定を適用。
     * 各パラメータは安全な範囲内にクランプされる。
     *
     * @param overrides アプリ側からの上書き設定
     * @returns マージ済みDeviceSpecs（minFrequency, maxFrequency, harmonicCorrectionEnabled含む）
     *
     * @example
     * ```typescript
     * const specs = DeviceDetection.getDeviceSpecsWithOverrides({
     *   sensitivity: 2.0,
     *   minFrequency: 50,
     *   harmonicCorrectionEnabled: false
     * });
     * ```
     */
    static getDeviceSpecsWithOverrides(overrides?: DeviceOverrides): DeviceSpecsWithOverrides;
    /**
     * Analyze user agent string and determine device specifications
     */
    private static analyzeUserAgent;
    /**
     * Detect iOS device type when specific detection fails
     */
    private static detectIOSDeviceType;
    /**
     * Get device-specific optimization parameters
     */
    private static getDeviceOptimizations;
    /**
     * Get default specifications for SSR or fallback
     */
    private static getDefaultSpecs;
    /**
     * Check if device supports Web Audio API
     */
    static supportsWebAudio(): boolean;
    /**
     * Check if device supports MediaDevices API
     */
    static supportsMediaDevices(): boolean;
    /**
     * Check if device supports MediaRecorder API
     */
    static supportsMediaRecorder(): boolean;
    /**
     * Get comprehensive device capabilities
     */
    static getDeviceCapabilities(): {
        deviceSpecs: DeviceSpecs;
        webAudioSupport: boolean;
        mediaDevicesSupport: boolean;
        mediaRecorderSupport: boolean;
        touchSupport: boolean;
        userAgent: string;
        screenSize: {
            width: number;
            height: number;
            pixelRatio: number;
        } | null;
        language: string;
        platform: any;
    };
    /**
     * Check if current device is mobile
     */
    static isMobile(): boolean;
    /**
     * Check if current device is tablet
     */
    static isTablet(): boolean;
    /**
     * Check if current device is desktop
     */
    static isDesktop(): boolean;
    /**
     * Get recommended audio constraints for current device
     */
    static getOptimalAudioConstraints(): MediaStreamConstraints;
    /**
     * Clear cached device specifications (for testing)
     */
    static clearCache(): void;
    /**
     * Get device-specific debugging information
     */
    static getDebugInfo(): {
        detectionMethods: {
            userAgentIPhone: boolean;
            userAgentIPad: boolean;
            userAgentMacintosh: boolean;
            touchSupport: boolean;
            navigatorPlatform: any;
            screenAspectRatio: string;
        };
        deviceSpecs: DeviceSpecs;
        webAudioSupport: boolean;
        mediaDevicesSupport: boolean;
        mediaRecorderSupport: boolean;
        touchSupport: boolean;
        userAgent: string;
        screenSize: {
            width: number;
            height: number;
            pixelRatio: number;
        } | null;
        language: string;
        platform: any;
    };
}
//# sourceMappingURL=DeviceDetection.d.ts.map