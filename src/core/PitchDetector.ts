/**
 * PitchDetector - Framework-agnostic High-precision Pitch Detection
 * 
 * Based on Pitchy library with McLeod Pitch Method
 * Includes harmonic correction, noise filtering, and device-specific optimization
 */

import { PitchDetector as PitchyDetector } from 'pitchy';
import type { 
  PitchDetectorConfig, 
  PitchDetectionResult, 
  PitchCallback,
  ErrorCallback,
  StateChangeCallback,
  DeviceSpecs
} from '../types';
import { AudioManager } from './AudioManager';

export class PitchDetector {
  // Core components
  private audioManager: AudioManager;
  private pitchDetector: PitchyDetector<Float32Array> | null = null;
  private analyser: AnalyserNode | null = null;
  private rawAnalyser: AnalyserNode | null = null;
  private animationFrame: number | null = null;
  
  // State management
  private componentState: 'uninitialized' | 'initializing' | 'ready' | 'detecting' | 'error' = 'uninitialized';
  private isInitialized = false;
  private isDetecting = false;
  private lastError: Error | null = null;
  
  // Analyser management
  private analyserIds: string[] = [];
  
  // Detection data
  private currentVolume = 0;
  private rawVolume = 0;
  private currentFrequency = 0;
  private detectedNote = '--';
  private detectedOctave: number | null = null;
  private pitchClarity = 0;
  
  // Stabilization buffers
  private volumeHistory: number[] = [];
  private stableVolume = 0;
  
  // Harmonic correction
  private previousFrequency = 0;
  private harmonicHistory: Array<{frequency: number, confidence: number, timestamp: number}> = [];
  
  // Configuration
  private config: Required<PitchDetectorConfig>;
  private disableHarmonicCorrection = false;
  
  // Callbacks
  private callbacks: {
    onPitchUpdate?: PitchCallback;
    onError?: ErrorCallback;
    onStateChange?: StateChangeCallback;
  } = {};
  
  // Device specifications
  private deviceSpecs: DeviceSpecs;

  constructor(audioManager: AudioManager, config: PitchDetectorConfig = {}) {
    this.audioManager = audioManager;
    this.config = {
      fftSize: 4096,
      smoothing: 0.1,
      clarityThreshold: 0.4,    // 0.8から0.4に現実的な値に変更
      minVolumeAbsolute: 0.003, // 0.01から0.003に現実的な値に変更
      ...config
    };
    
    this.deviceSpecs = this.audioManager.getPlatformSpecs();
  }

  /**
   * Set callback functions
   */
  setCallbacks(callbacks: {
    onPitchUpdate?: PitchCallback;
    onError?: ErrorCallback;
    onStateChange?: StateChangeCallback;
  }): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Initialize pitch detector with external AudioContext
   */
  async initialize(): Promise<void> {
    try {
      this.componentState = 'initializing';
      this.lastError = null;
      
      console.log('🎙️ [PitchDetector] Starting initialization via AudioManager');
      
      // Get shared resources from AudioManager
      await this.audioManager.initialize();
      
      console.log('✅ [PitchDetector] AudioManager resources acquired');
      
      // Create dedicated Analyser (with filters)
      const filteredAnalyserId = `pitch-detector-filtered-${Date.now()}`;
      this.analyser = this.audioManager.createAnalyser(filteredAnalyserId, {
        fftSize: this.config.fftSize,
        smoothingTimeConstant: this.config.smoothing,
        minDecibels: -90,
        maxDecibels: -10,
        useFilters: true
      });
      this.analyserIds.push(filteredAnalyserId);
      
      // Create raw signal Analyser (for comparison)
      const rawAnalyserId = `pitch-detector-raw-${Date.now()}`;
      this.rawAnalyser = this.audioManager.createAnalyser(rawAnalyserId, {
        fftSize: this.config.fftSize,
        smoothingTimeConstant: this.config.smoothing,
        minDecibels: -90,
        maxDecibels: -10,
        useFilters: false
      });
      this.analyserIds.push(rawAnalyserId);
      
      console.log('✅ [PitchDetector] Analysers created:', this.analyserIds);
      
      // Initialize PitchDetector
      this.pitchDetector = PitchyDetector.forFloat32Array(this.analyser.fftSize);
      
      // デバッグログ: Pitchyインスタンス確認
      console.log(`[Debug] Pitchyインスタンス作成: ${!!this.pitchDetector}, FFTサイズ: ${this.analyser.fftSize}`);
      
      // Initialization complete
      this.componentState = 'ready';
      this.isInitialized = true;
      
      // Notify state change
      this.callbacks.onStateChange?.(this.componentState);
      
      console.log('✅ [PitchDetector] Initialization complete');
      
    } catch (error) {
      console.error('❌ [PitchDetector] Initialization error:', error);
      this.componentState = 'error';
      this.lastError = error as Error;
      this.isInitialized = false;
      
      // Notify error
      this.callbacks.onError?.(error as Error);
      
      throw error;
    }
  }

  /**
   * Start pitch detection
   */
  startDetection(): boolean {
    if (this.componentState !== 'ready') {
      const error = new Error(`Cannot start detection: component state is ${this.componentState}`);
      this.callbacks.onError?.(error);
      return false;
    }
    
    if (!this.analyser || !this.pitchDetector) {
      const error = new Error('Required components not available');
      this.componentState = 'error';
      this.callbacks.onError?.(error);
      return false;
    }
    
    this.componentState = 'detecting';
    this.isDetecting = true;
    this.callbacks.onStateChange?.(this.componentState);
    this.detectPitch();
    return true;
  }

  /**
   * Stop pitch detection
   */
  stopDetection(): void {
    this.isDetecting = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    // Return state to ready (if initialized)
    if (this.componentState === 'detecting' && this.isInitialized) {
      this.componentState = 'ready';
      this.callbacks.onStateChange?.(this.componentState);
    }
  }

  /**
   * Real-time pitch detection loop
   */
  private detectPitch(): void {
    // デバッグログ: detectPitchメソッドの呼び出し確認
    console.log(`[Debug] detectPitch呼び出し: detecting=${this.isDetecting}, analyser=${!!this.analyser}, rawAnalyser=${!!this.rawAnalyser}, pitchDetector=${!!this.pitchDetector}`);
    
    // デバッグ: AudioManagerの状態確認
    const audioManagerStatus = this.audioManager.getStatus();
    console.log(`[Debug] AudioManager状態: context=${audioManagerStatus.audioContextState}, stream=${audioManagerStatus.mediaStreamActive}`);
    
    if (!this.isDetecting || !this.analyser || !this.rawAnalyser || !this.pitchDetector) return;
    
    const bufferLength = this.analyser.fftSize;
    const buffer = new Float32Array(bufferLength);
    const rawBuffer = new Float32Array(this.rawAnalyser.fftSize);
    
    this.analyser.getFloatTimeDomainData(buffer);
    this.rawAnalyser.getFloatTimeDomainData(rawBuffer);
    
    // デバッグ: バッファーの内容を確認（常に出力）
    const nonZeroCount = buffer.filter(val => Math.abs(val) > 0.0001).length;
    const maxValue = Math.max(...buffer.map(val => Math.abs(val)));
    console.log(`[Debug] バッファー分析: 非ゼロ値=${nonZeroCount}/${bufferLength}, 最大値=${maxValue.toFixed(6)}`);
    
    // Volume calculation (filtered)
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += Math.abs(buffer[i]);
    }
    const rms = Math.sqrt(sum / bufferLength);
    
    // デバッグ: RMS計算の詳細（常に出力）
    console.log(`[Debug] RMS計算: sum=${sum.toFixed(6)}, rms=${rms.toFixed(6)}`);
    
    // Platform-specific volume calculation
    const platformSpecs = this.deviceSpecs;
    const adjustedRms = rms * platformSpecs.gainCompensation;
    const volumePercent = Math.max(0, Math.min(100, 
      (adjustedRms * 100) / platformSpecs.divisor * 6 - platformSpecs.noiseThreshold
    ));
    
    // デバッグ: 音量計算の詳細（常に出力）
    console.log(`[Debug] 音量計算: rms=${rms.toFixed(6)}, adjustedRms=${adjustedRms.toFixed(6)}, volumePercent=${volumePercent.toFixed(2)}%`);
    console.log(`[Debug] プラットフォーム設定: gain=${platformSpecs.gainCompensation}, divisor=${platformSpecs.divisor}, noise=${platformSpecs.noiseThreshold}`);
    
    // Raw volume calculation (pre-filter)
    let rawSum = 0;
    for (let i = 0; i < rawBuffer.length; i++) {
      rawSum += Math.abs(rawBuffer[i]);
    }
    const rawRms = Math.sqrt(rawSum / rawBuffer.length);
    const rawVolumePercent = Math.max(0, Math.min(100, 
      (rawRms * platformSpecs.gainCompensation * 100) / platformSpecs.divisor * 6 - platformSpecs.noiseThreshold
    ));
    
    // Volume stabilization (5-frame moving average)
    this.volumeHistory.push(volumePercent);
    if (this.volumeHistory.length > 5) {
      this.volumeHistory.shift();
    }
    this.stableVolume = this.volumeHistory.reduce((sum, v) => sum + v, 0) / this.volumeHistory.length;
    this.currentVolume = this.stableVolume;
    this.rawVolume = rawVolumePercent;
    
    // Pitch detection (using PitchDetector)
    const sampleRate = 44100; // Fixed sample rate for now
    const [pitch, clarity] = this.pitchDetector.findPitch(buffer, sampleRate);
    
    // デバッグログ: Pitchyライブラリの結果（常時出力）
    console.log(`[Debug] Pitchy結果: pitch=${pitch?.toFixed(1) || 'null'}, clarity=${clarity?.toFixed(3) || 'null'}, volume=${this.currentVolume?.toFixed(1)}%, sampleRate=${sampleRate.toString()}`);
    console.log(`[Debug] Pitchyバッファー: 最初5要素=${Array.from(buffer.slice(0, 5)).map(v => v.toFixed(6)).join(', ')}`);
    
    // Human vocal range filtering (practical adjustment)
    // Optimized for actual human voice range:
    // - Low range: 65Hz and above (C2 and above, considering male lowest vocal range)  
    // - High range: 1200Hz and below (practical singing range)
    // - Exclude extreme low frequency noise (G-1, etc.) reliably
    const isValidVocalRange = pitch >= 65 && pitch <= 1200;
    
    // デバッグログ: 判定条件の詳細
    console.log(`[Debug] 判定条件: pitch=${!!pitch}, clarity=${clarity?.toFixed(3)}>${this.config.clarityThreshold}, volume=${this.currentVolume?.toFixed(1)}>0.4, range=${isValidVocalRange}`);
    
    if (pitch && clarity > this.config.clarityThreshold && this.currentVolume > 0.4 && isValidVocalRange) {
      let finalFreq = pitch;
      
      // Harmonic correction control (for 230Hz stuck issue debugging)
      if (!this.disableHarmonicCorrection) {
        // Apply unified harmonic correction system (pass volume information)
        const normalizedVolume = Math.min(this.currentVolume / 100, 1.0); // Normalize to 0-1
        finalFreq = this.correctHarmonic(pitch, normalizedVolume);
      }
      
      // Update frequency display
      this.currentFrequency = Math.round(finalFreq);
      const noteInfo = this.frequencyToNoteAndOctave(this.currentFrequency);
      this.detectedNote = noteInfo.note;
      this.detectedOctave = noteInfo.octave;
      this.pitchClarity = clarity;
      
    } else {
      // Clear harmonic correction history when signal is weak
      if (this.currentFrequency === 0) {
        this.resetHarmonicHistory();
      }
      
      // Clear frequency display
      this.currentFrequency = 0;
      this.detectedNote = '--';
      this.detectedOctave = null;
      this.pitchClarity = 0;
    }
    
    // Set VolumeBar to 0 when no pitch is detected (counter extreme low frequency noise)
    const displayVolume = this.currentFrequency > 0 ? this.rawVolume : 0;
    
    // Send data to callback
    const result: PitchDetectionResult = {
      frequency: this.currentFrequency,
      note: this.detectedNote,
      octave: this.detectedOctave || undefined,
      clarity: this.pitchClarity,
      volume: displayVolume,
      cents: this.currentFrequency > 0 ? this.frequencyToCents(this.currentFrequency) : undefined
    };
    
    this.callbacks.onPitchUpdate?.(result);
    
    this.animationFrame = requestAnimationFrame(() => this.detectPitch());
  }

  /**
   * Harmonic correction system
   */
  private correctHarmonic(frequency: number, volume: number): number {
    const now = Date.now();
    const confidenceThreshold = 0.7;
    const historyWindow = 1000; // 1 second
    
    // Clean old history
    this.harmonicHistory = this.harmonicHistory.filter(h => now - h.timestamp < historyWindow);
    
    // Calculate confidence based on volume and stability
    const volumeConfidence = Math.min(volume * 1.5, 1.0);
    const stabilityConfidence = this.previousFrequency > 0 ? 
      Math.max(0, 1 - Math.abs(frequency - this.previousFrequency) / this.previousFrequency) : 0.5;
    const confidence = (volumeConfidence + stabilityConfidence) / 2;
    
    // Add to history
    this.harmonicHistory.push({ frequency, confidence, timestamp: now });
    
    // Check for harmonic patterns
    if (this.harmonicHistory.length >= 3) {
      const recentHistory = this.harmonicHistory.slice(-5);
      const avgFrequency = recentHistory.reduce((sum, h) => sum + h.frequency, 0) / recentHistory.length;
      const avgConfidence = recentHistory.reduce((sum, h) => sum + h.confidence, 0) / recentHistory.length;
      
      // Check for 2x harmonic (octave up error)
      const halfFrequency = frequency / 2;
      if (Math.abs(halfFrequency - avgFrequency) / avgFrequency < 0.1 && avgConfidence > confidenceThreshold) {
        console.log(`🔧 [PitchDetector] Octave correction: ${frequency}Hz → ${halfFrequency}Hz`);
        this.previousFrequency = halfFrequency;
        return halfFrequency;
      }
      
      // Check for 1/2x harmonic (octave down error)
      const doubleFrequency = frequency * 2;
      if (Math.abs(doubleFrequency - avgFrequency) / avgFrequency < 0.1 && avgConfidence > confidenceThreshold) {
        console.log(`🔧 [PitchDetector] Octave up correction: ${frequency}Hz → ${doubleFrequency}Hz`);
        this.previousFrequency = doubleFrequency;
        return doubleFrequency;
      }
    }
    
    this.previousFrequency = frequency;
    return frequency;
  }

  /**
   * Reset harmonic correction history
   */
  private resetHarmonicHistory(): void {
    this.harmonicHistory = [];
    this.previousFrequency = 0;
  }

  /**
   * Convert frequency to note name and octave
   */
  private frequencyToNoteAndOctave(frequency: number): { note: string; octave: number | null } {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const A4 = 440;
    
    if (frequency <= 0) return { note: '--', octave: null };
    
    const semitonesFromA4 = Math.round(12 * Math.log2(frequency / A4));
    const noteIndex = (semitonesFromA4 + 9 + 120) % 12;
    const octave = Math.floor((semitonesFromA4 + 9) / 12) + 4;
    
    return { note: noteNames[noteIndex], octave };
  }
  

  /**
   * Convert frequency to cents deviation from nearest note
   */
  private frequencyToCents(frequency: number): number {
    const A4 = 440;
    const semitonesFromA4 = 12 * Math.log2(frequency / A4);
    const nearestSemitone = Math.round(semitonesFromA4);
    const centsDeviation = (semitonesFromA4 - nearestSemitone) * 100;
    return Math.round(centsDeviation);
  }

  /**
   * Reset display state
   */
  resetDisplayState(): void {
    this.currentVolume = 0;
    this.rawVolume = 0;
    this.currentFrequency = 0;
    this.detectedNote = '--';
    this.detectedOctave = null;
    this.pitchClarity = 0;
    this.stableVolume = 0;
    
    // Clear buffers
    this.volumeHistory = [];
    
    // Reset harmonic correction
    this.resetHarmonicHistory();
    
    console.log('🔄 [PitchDetector] Display state reset');
  }

  /**
   * Enable/disable harmonic correction
   */
  setHarmonicCorrectionEnabled(enabled: boolean): void {
    this.disableHarmonicCorrection = !enabled;
    if (!enabled) {
      this.resetHarmonicHistory();
    }
  }

  /**
   * Get initialization status
   */
  getIsInitialized(): boolean {
    return this.isInitialized && this.componentState === 'ready';
  }

  /**
   * Get current state
   */
  getState() {
    return {
      componentState: this.componentState,
      isInitialized: this.isInitialized,
      isDetecting: this.isDetecting,
      lastError: this.lastError,
      hasRequiredComponents: !!(this.analyser && this.pitchDetector)
    };
  }

  /**
   * Get current detection result
   */
  getCurrentResult(): PitchDetectionResult {
    return {
      frequency: this.currentFrequency,
      note: this.detectedNote,
      clarity: this.pitchClarity,
      volume: this.currentFrequency > 0 ? this.rawVolume : 0
    };
  }

  /**
   * Reinitialize detector
   */
  async reinitialize(): Promise<void> {
    console.log('🔄 [PitchDetector] Starting reinitialization');
    
    // Cleanup current state
    this.cleanup();
    
    // Short wait to ensure resource release
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Execute reinitialization
    await this.initialize();
    
    console.log('✅ [PitchDetector] Reinitialization complete');
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    console.log('🧹 [PitchDetector] Starting cleanup');
    
    this.stopDetection();
    
    // Notify AudioManager to release created Analysers
    if (this.analyserIds.length > 0) {
      this.audioManager.release(this.analyserIds);
      console.log('📤 [PitchDetector] Notified AudioManager of Analyser release:', this.analyserIds);
      this.analyserIds = [];
    }
    
    // Reset state
    this.componentState = 'uninitialized';
    this.isInitialized = false;
    this.lastError = null;
    
    // Clear references (actual resources managed by AudioManager)
    this.analyser = null;
    this.rawAnalyser = null;
    this.pitchDetector = null;
    
    // Clear history
    this.volumeHistory = [];
    this.resetHarmonicHistory();
    
    console.log('✅ [PitchDetector] Cleanup complete');
  }
}