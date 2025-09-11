/**
 * PitchPro Audio Processing Library
 * High-precision pitch detection and audio processing for web applications
 *
 * @version 1.1.3
 * @author PitchPro Team
 * @license MIT
 */
export { AudioManager } from './core/AudioManager';
export { PitchDetector } from './core/PitchDetector';
export { NoiseFilter } from './core/NoiseFilter';
export { MicrophoneLifecycleManager } from './core/MicrophoneLifecycleManager';
export type { LifecycleManagerConfig } from './core/MicrophoneLifecycleManager';
export { MicrophoneController } from './core/MicrophoneController';
export type { MicrophoneControllerConfig } from './core/MicrophoneController';
export { ErrorNotificationSystem } from './core/ErrorNotificationSystem';
export { AudioDetectionComponent } from './components/AudioDetectionComponent';
export type { AudioDetectionConfig, AudioDetectionCallbacks } from './components/AudioDetectionComponent';
export { HarmonicCorrection } from './advanced/HarmonicCorrection';
export { VoiceAnalyzer } from './advanced/VoiceAnalyzer';
export { CalibrationSystem } from './advanced/CalibrationSystem';
export { FrequencyUtils } from './utils/FrequencyUtils';
export { MusicTheory } from './utils/MusicTheory';
export { DeviceDetection } from './utils/DeviceDetection';
export { Logger, LogLevel, defaultLogger, debug, info, warn, error } from './utils/Logger';
export type { LogContext, LogEntry } from './utils/Logger';
export { MicrophoneHealthError } from './utils/errors';
export type { AudioManagerConfig, PitchDetectorConfig, PitchDetectionResult, NoiseFilterConfig, HarmonicCorrectionResult, NotificationConfig, MusicalNote, MusicalInterval, VoiceAnalysis, DeviceSpecs } from './types';
export declare const VERSION = "1.1.8";
export declare const BUILD_DATE: string;
export declare const DEFAULT_CONFIG: {
    readonly pitchDetector: {
        readonly fftSize: 4096;
        readonly smoothing: 0.1;
        readonly clarityThreshold: 0.4;
        readonly minVolumeAbsolute: 0.003;
    };
    readonly audioManager: {
        readonly sampleRate: 44100;
        readonly channelCount: 1;
        readonly echoCancellation: false;
        readonly noiseSuppression: false;
        readonly autoGainControl: false;
    };
    readonly noiseFilter: {
        readonly highpassFreq: 80;
        readonly lowpassFreq: 800;
        readonly notchFreq: 60;
        readonly Q: 0.7;
    };
};
//# sourceMappingURL=index.d.ts.map