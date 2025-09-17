/**
 * PitchPro Audio Processing Library
 * High-precision pitch detection and audio processing for web applications
 * 
 * @version 1.2.1 (自動同期)
 * @author PitchPro Team
 * @license MIT
 */

// Core exports
export { AudioManager } from './core/AudioManager';
export { PitchDetector } from './core/PitchDetector';
export { NoiseFilter } from './core/NoiseFilter';
export { MicrophoneLifecycleManager } from './core/MicrophoneLifecycleManager';
export type { LifecycleManagerConfig } from './core/MicrophoneLifecycleManager';
export { MicrophoneController } from './core/MicrophoneController';
export type { MicrophoneControllerConfig } from './core/MicrophoneController';
export { ErrorNotificationSystem } from './core/ErrorNotificationSystem';

// Component exports
export { AudioDetectionComponent } from './components/AudioDetectionComponent';
export type { AudioDetectionConfig, AudioDetectionCallbacks } from './components/AudioDetectionComponent';

// Advanced exports
export { HarmonicCorrection } from './advanced/HarmonicCorrection';
export { VoiceAnalyzer } from './advanced/VoiceAnalyzer';
export { CalibrationSystem } from './advanced/CalibrationSystem';

// Utils exports
export { FrequencyUtils } from './utils/FrequencyUtils';
export { MusicTheory } from './utils/MusicTheory';
export { DeviceDetection } from './utils/DeviceDetection';
export { Logger, LogLevel, defaultLogger, debug, info, warn, error } from './utils/Logger';
export type { LogContext, LogEntry } from './utils/Logger';
export { MicrophoneHealthError } from './utils/errors';

// Type exports
export type {
  AudioManagerConfig,
  PitchDetectorConfig,
  PitchDetectionResult,
  NoiseFilterConfig,
  HarmonicCorrectionResult,
  NotificationConfig,
  MusicalNote,
  MusicalInterval,
  VoiceAnalysis,
  DeviceSpecs
} from './types';

// Constants (自動注入 - package.jsonと同期)
export const VERSION = process.env.npm_package_version || '1.2.1';
export const BUILD_DATE = new Date().toISOString();

// Default configurations
export const DEFAULT_CONFIG = {
  pitchDetector: {
    fftSize: 4096,
    smoothing: 0.1,
    clarityThreshold: 0.4,    // 現実的な値に修正
    minVolumeAbsolute: 0.020  // 🔧 環境適応ノイズゲート: 10%閾値でマイクノイズを確実にブロック
  },
  audioManager: {
    sampleRate: 44100,
    channelCount: 1,
    echoCancellation: false,
    noiseSuppression: false, // 独自フィルター優先（PitchPro 3段階フィルタリング使用）
    autoGainControl: false
  },
  noiseFilter: {
    highpassFreq: 50,  // 深い男性の声に対応（G1 49Hzまで）
    lowpassFreq: 800,
    notchFreq: 50,     // 🔧 日本の電源周波数50Hzに合わせて電源ハムノイズを除去
    highpassQ: 0.7,    // 個別に設定
    lowpassQ: 0.7,     // 個別に設定
    notchQ: 10.0       // ノッチフィルターは通常、より高いQ値を持つ
  }
} as const;;