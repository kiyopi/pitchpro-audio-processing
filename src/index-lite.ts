/**
 * PitchPro Audio Processing Library - Lite Version
 * 軽量版：エラーループ原因機能を除外し、基本機能のみ提供
 * 
 * @version 1.0.0-lite
 * @author PitchPro Team
 * @license MIT
 */

// ✅ 使用する基本機能のみエクスポート
import { AudioManager } from './core/AudioManager';
import { PitchDetector } from './core/PitchDetector';
import { FrequencyUtils } from './utils/FrequencyUtils';
import { MusicTheory } from './utils/MusicTheory';
import { DeviceDetection } from './utils/DeviceDetection';
import type {
  AudioManagerConfig,
  PitchDetectorConfig,
  PitchDetectionResult,
  MusicalNote,
  MusicalInterval,
  DeviceSpecs
} from './types';

export { AudioManager, PitchDetector, FrequencyUtils, MusicTheory, DeviceDetection };
export type { AudioManagerConfig, PitchDetectorConfig, PitchDetectionResult, MusicalNote, MusicalInterval, DeviceSpecs };

// ❌ 以下の機能は除外（エラーループ・複雑性の原因）
// export { NoiseFilter } from './core/NoiseFilter';
// export { MicrophoneLifecycleManager } from './core/MicrophoneLifecycleManager';
// export { MicrophoneController } from './core/MicrophoneController';
// export { ErrorNotificationSystem } from './core/ErrorNotificationSystem';
// export { HarmonicCorrection } from './advanced/HarmonicCorrection';
// export { VoiceAnalyzer } from './advanced/VoiceAnalyzer';
// export { CalibrationSystem } from './advanced/CalibrationSystem';

// Constants
export const VERSION = '1.0.0-lite';
export const BUILD_DATE = new Date().toISOString();

// 軽量版設定
export const LITE_CONFIG = {
  pitchDetector: {
    fftSize: 4096,
    smoothing: 0.1,
    clarityThreshold: 0.8,
    minVolumeAbsolute: 0.01
  },
  audioManager: {
    sampleRate: 44100,
    channelCount: 1,
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl: false,
    // Chrome/Safari AGC完全無効化
    googAutoGainControl: false,
    googNoiseSuppression: false,
    googEchoCancellation: false,
    googHighpassFilter: false,
    mozAutoGainControl: false,
    mozNoiseSuppression: false
  }
} as const;

/**
 * 軽量版初期化ヘルパー関数
 * 基本的なマイク→音程検出の流れを簡素化
 */
export async function initializePitchProLite(config: {
  onPitchUpdate?: (result: PitchDetectionResult) => void;
  onError?: (error: Error) => void;
} = {}) {
  try {
    // AudioManager初期化（AGC完全無効化）
    const audioManager = new AudioManager(LITE_CONFIG.audioManager);
    await audioManager.initialize();
    
    // PitchDetector初期化
    const pitchDetector = new PitchDetector(audioManager, LITE_CONFIG.pitchDetector);
    await pitchDetector.initialize();
    
    // コールバック設定
    if (config.onPitchUpdate) {
      pitchDetector.setCallbacks({
        onPitchUpdate: config.onPitchUpdate,
        onError: config.onError
      });
    }
    
    console.log('✅ PitchPro Lite初期化完了');
    
    return {
      audioManager,
      pitchDetector,
      startDetection: () => pitchDetector.startDetection(),
      stopDetection: () => pitchDetector.stopDetection(),
      cleanup: () => {
        pitchDetector.cleanup();
      }
    };
    
  } catch (error) {
    console.error('❌ PitchPro Lite初期化エラー:', error);
    config.onError?.(error as Error);
    throw error;
  }
}