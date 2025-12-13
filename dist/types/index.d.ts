/**
 * TypeScript type definitions for PitchPro Audio Processing
 */
export interface AudioManagerConfig {
    sampleRate?: number;
    channelCount?: number;
    echoCancellation?: boolean;
    noiseSuppression?: boolean;
    autoGainControl?: boolean;
    latency?: number;
}
export interface PitchDetectorConfig {
    fftSize?: number;
    smoothing?: number;
    clarityThreshold?: number;
    minVolumeAbsolute?: number;
    deviceOptimization?: boolean;
    silenceDetection?: SilenceDetectionConfig;
    /** 検出対象の最低周波数 Hz (default: 30) */
    minFrequency?: number;
    /** 検出対象の最高周波数 Hz (default: 1200) */
    maxFrequency?: number;
}
export interface SilenceDetectionConfig {
    enabled?: boolean;
    warningThreshold?: number;
    timeoutThreshold?: number;
    minVolumeThreshold?: number;
    onSilenceWarning?: (duration: number) => void;
    onSilenceTimeout?: () => void;
    onSilenceRecovered?: () => void;
}
export interface PitchDetectionResult {
    frequency: number;
    note: string;
    octave?: number;
    clarity: number;
    volume: number;
    rawVolume?: number;
    cents?: number;
    timestamp?: number;
}
export interface NoiseFilterConfig {
    highpassFreq?: number;
    lowpassFreq?: number;
    notchFreq?: number;
    highpassQ?: number;
    lowpassQ?: number;
    notchQ?: number;
    useFilters?: boolean;
}
export interface HarmonicCorrectionResult {
    correctedFreq: number;
    confidence: number;
    correctionApplied: boolean;
}
export interface NotificationConfig {
    type: 'error' | 'warning' | 'success' | 'info';
    title: string;
    message: string;
    details?: string[];
    solution?: string;
    autoHide?: boolean;
    duration?: number;
    priority?: 'low' | 'medium' | 'high';
}
export interface NotificationElement extends HTMLElement {
    'data-notification-id': string;
}
export interface MusicalNote {
    name: string;
    octave: number;
    midi: number;
    frequency: number;
}
export interface MusicalInterval {
    name: string;
    semitones: number;
    cents: number;
    ratio: number;
}
export interface VoiceAnalysis {
    quality: VoiceQuality;
    stability: number;
    recommendations: string[];
}
export declare const VoiceQuality: {
    EXCELLENT: "excellent";
    GOOD: "good";
    FAIR: "fair";
    POOR: "poor";
};
export type VoiceQuality = typeof VoiceQuality[keyof typeof VoiceQuality];
export declare const AccuracyLevel: {
    PERFECT: "perfect";
    EXCELLENT: "excellent";
    GOOD: "good";
    FAIR: "fair";
    POOR: "poor";
};
export type AccuracyLevel = typeof AccuracyLevel[keyof typeof AccuracyLevel];
export interface AccuracyResult {
    accuracy: AccuracyLevel;
    centsOff: number;
    score: number;
}
export interface DeviceSpecs {
    deviceType: 'iPhone' | 'iPad' | 'Android' | 'PC';
    isIOS: boolean;
    sensitivity: number;
    noiseGate: number;
    divisor: number;
    gainCompensation: number;
    noiseThreshold: number;
    smoothingFactor: number;
    volumeMultiplier: number;
}
/**
 * アプリ側からのオーバーライド設定
 * DeviceDetectionの自動検出値を上書きする
 *
 * @description
 * - sensitivity, noiseGate, volumeMultiplier: デバイス固有値を上書き
 * - minFrequency, maxFrequency: 検出対象の周波数範囲を指定
 * - harmonicCorrectionEnabled: 倍音補正の初期状態（ランタイム変更はsetHarmonicCorrectionEnabled()を使用）
 *
 * ⚠️ clarityThreshold, minVolumeAbsolute はAudioDetectionConfigに既存のため除外
 */
export interface DeviceOverrides {
    /** マイク感度倍率 (0.5〜5.0) */
    sensitivity?: number;
    /** ノイズゲート閾値 (0.01〜0.20) */
    noiseGate?: number;
    /** 音量表示倍率 (1.0〜10.0) */
    volumeMultiplier?: number;
    /** 検出対象の最低周波数 Hz (30〜100) */
    minFrequency?: number;
    /** 検出対象の最高周波数 Hz (800〜2000) */
    maxFrequency?: number;
    /**
     * 倍音補正の初期状態 (default: true)
     * ランタイム変更はsetHarmonicCorrectionEnabled()を使用
     */
    harmonicCorrectionEnabled?: boolean;
}
/**
 * DeviceSpecsにオーバーライド結果を含めた拡張型
 */
export interface DeviceSpecsWithOverrides extends DeviceSpecs {
    minFrequency: number;
    maxFrequency: number;
    harmonicCorrectionEnabled: boolean;
}
export interface MediaStreamResources {
    audioContext: AudioContext;
    mediaStream: MediaStream;
    sourceNode: MediaStreamAudioSourceNode;
}
export interface HealthStatus {
    mediaStreamActive: boolean;
    audioContextState: string;
    trackStates: TrackState[];
    healthy: boolean;
    refCount?: number;
}
export interface TrackState {
    kind: string;
    enabled: boolean;
    readyState: MediaStreamTrackState;
    muted: boolean;
}
export interface MicrophoneControllerEvents {
    'pitchpro:microphoneGranted': CustomEvent<{
        stream: MediaStream;
    }>;
    'pitchpro:microphoneDenied': CustomEvent<{
        error: Error;
    }>;
    'pitchpro:microphoneStopped': CustomEvent;
    'pitchpro:microphoneMuted': CustomEvent<{
        timestamp: number;
        controllerState: string;
    }>;
    'pitchpro:microphoneUnmuted': CustomEvent<{
        timestamp: number;
        controllerState: string;
    }>;
    'pitchpro:sensitivityChanged': CustomEvent<{
        sensitivity: number;
    }>;
    'pitchpro:noiseGateChanged': CustomEvent<{
        threshold: number;
    }>;
    'pitchpro:deviceDetected': CustomEvent<{
        specs: DeviceSpecs;
    }>;
    'pitchpro:idleTimeout': CustomEvent<{
        reason: string;
        message: string;
    }>;
}
export interface LifecycleEvents {
    'pitchpro:lifecycle:trackEnded': CustomEvent<{
        track: MediaStreamTrack;
    }>;
    'pitchpro:lifecycle:trackMuted': CustomEvent<{
        track: MediaStreamTrack;
    }>;
    'pitchpro:lifecycle:trackUnmuted': CustomEvent<{
        track: MediaStreamTrack;
    }>;
    'pitchpro:lifecycle:autoRecoverySuccess': CustomEvent;
    'pitchpro:lifecycle:autoRecoveryFailed': CustomEvent<{
        error: Error;
    }>;
    'pitchpro:lifecycle:maxRecoveryAttemptsReached': CustomEvent<{
        attempts: number;
        lastHealthStatus: any;
    }>;
    'pitchpro:lifecycle:monitoringRestarted': CustomEvent<{
        reason: string;
        refCount: number;
    }>;
}
export type PitchCallback = (result: PitchDetectionResult) => void;
export type ErrorCallback = (error: Error) => void;
export type StateChangeCallback = (state: string) => void;
//# sourceMappingURL=index.d.ts.map