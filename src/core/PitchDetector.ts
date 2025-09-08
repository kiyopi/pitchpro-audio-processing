/**
 * PitchDetector - Framework-agnostic High-precision Pitch Detection Engine
 * 
 * @description Provides real-time pitch detection using the McLeod Pitch Method (Pitchy library)
 * with advanced features including harmonic correction, adaptive frame rate control,
 * noise filtering, and device-specific optimization for consistent cross-platform performance.
 * 
 * @example
 * ```typescript
 * const pitchDetector = new PitchDetector(audioManager, {
 *   fftSize: 4096,
 *   clarityThreshold: 0.4,
 *   minVolumeAbsolute: 0.003
 * });
 * 
 * await pitchDetector.initialize();
 * 
 * pitchDetector.setCallbacks({
 *   onPitchUpdate: (result) => {
 *     console.log(`Detected: ${result.note} (${result.frequency.toFixed(1)}Hz)`);
 *   }
 * });
 * 
 * pitchDetector.startDetection();
 * ```
 * 
 * @version 1.1.3
 * @since 1.0.0
 */

import { PitchDetector as PitchyDetector } from 'pitchy';
import type { 
  PitchDetectorConfig, 
  PitchDetectionResult, 
  PitchCallback,
  ErrorCallback,
  StateChangeCallback,
  DeviceSpecs,
  SilenceDetectionConfig
} from '../types';
import { AudioManager } from './AudioManager';
import { AdaptiveFrameRateLimiter } from '../utils/performance-optimized';
import { 
  PitchProError, 
  AudioContextError, 
  PitchDetectionError, 
  isRecoverableError,
  ErrorMessageBuilder,
  ErrorCode
} from '../utils/errors';

export class PitchDetector {
  /** @private AudioManager instance for resource management */
  private audioManager: AudioManager;
  
  /** @private Pitchy library detector instance for McLeod Pitch Method */
  private pitchDetector: PitchyDetector<Float32Array> | null = null;
  
  /** @private AnalyserNode with noise filtering applied */
  private analyser: AnalyserNode | null = null;
  
  /** @private Raw AnalyserNode for unfiltered volume measurement */
  private rawAnalyser: AnalyserNode | null = null;
  
  /** @private RequestAnimationFrame ID for detection loop */
  private animationFrame: number | null = null;
  
  /** @private Adaptive frame rate controller for optimal performance */
  private frameRateLimiter: AdaptiveFrameRateLimiter;
  
  /** @private Current component state for lifecycle management */
  private componentState: 'uninitialized' | 'initializing' | 'ready' | 'detecting' | 'error' = 'uninitialized';
  
  /** @private Initialization completion flag */
  private isInitialized = false;
  
  /** @private Detection active flag */
  private isDetecting = false;
  
  /** @private Last error encountered during operations */
  private lastError: Error | null = null;
  
  /** @private Array of analyser IDs for cleanup management */
  private analyserIds: string[] = [];
  
  /** @private Current processed volume level (0-100) */
  private currentVolume = 0;
  
  /** @private Raw volume level before processing (0-100) */
  private rawVolume = 0;
  
  /** @private Currently detected frequency in Hz */
  private currentFrequency = 0;
  
  /** @private Detected musical note name */
  private detectedNote = '--';
  
  /** @private Detected octave number */
  private detectedOctave: number | null = null;
  
  /** @private Pitch detection clarity/confidence (0-1) */
  private pitchClarity = 0;
  
  /** @private Circular buffer for volume stabilization */
  private volumeHistory: number[] = [0, 0, 0, 0, 0];
  
  /** @private Stabilized volume after filtering */
  private stableVolume = 0;
  
  /** @private Previous frequency for harmonic correction */
  private previousFrequency = 0;
  
  /** @private History buffer for harmonic analysis */
  private harmonicHistory: Array<{frequency: number, confidence: number, timestamp: number}> = [];
  
  /** @private PitchDetector configuration with defaults applied */
  private config: Required<Omit<PitchDetectorConfig, 'silenceDetection'>> & { 
    silenceDetection?: SilenceDetectionConfig 
  };
  
  /** @private Flag to disable harmonic correction */
  private disableHarmonicCorrection = false;
  
  /** @private Callback functions for events */
  private callbacks: {
    onPitchUpdate?: PitchCallback;
    onError?: ErrorCallback;
    onStateChange?: StateChangeCallback;
  } = {};
  
  /** @private Device-specific optimization parameters */
  private deviceSpecs: DeviceSpecs | null = null;
  
  /** @private Silence detection configuration */
  private silenceDetectionConfig: SilenceDetectionConfig;
  
  /** @private Timestamp when silence started */
  private silenceStartTime: number | null = null;
  
  /** @private Timer ID for silence warning */
  private silenceWarningTimer: number | null = null;
  
  /** @private Timer ID for silence timeout */
  private silenceTimeoutTimer: number | null = null;
  
  /** @private Current silence state flag */
  private isSilent = false;
  
  /** @private Silence warning already issued flag */
  private hasWarned = false;

  /**
   * Creates a new PitchDetector instance with optimized configuration
   * 
   * @param audioManager - AudioManager instance for resource management
   * @param config - Optional configuration to override defaults
   * @param config.fftSize - FFT size for frequency analysis (default: 4096)
   * @param config.smoothing - Smoothing factor for AnalyserNode (default: 0.1)
   * @param config.clarityThreshold - Minimum clarity for valid detection (default: 0.4)
   * @param config.minVolumeAbsolute - Minimum volume threshold (default: 0.003)
   * @param config.silenceDetection - Optional silence detection configuration
   * 
   * @example
   * ```typescript
   * // Basic usage
   * const pitchDetector = new PitchDetector(audioManager);
   * 
   * // Custom configuration
   * const pitchDetector = new PitchDetector(audioManager, {
   *   fftSize: 8192,
   *   clarityThreshold: 0.6,
   *   silenceDetection: {
   *     enabled: true,
   *     warningThreshold: 10000
   *   }
   * });
   * ```
   */
  constructor(audioManager: AudioManager, config: PitchDetectorConfig = {}) {
    this.audioManager = audioManager;
    this.config = {
      fftSize: 4096,
      smoothing: 0.1,
      clarityThreshold: 0.4,    // 0.8から0.4に現実的な値に変更
      minVolumeAbsolute: 0.003, // 0.01から0.003に現実的な値に変更
      ...config
    };
    
    // Initialize silence detection configuration
    this.silenceDetectionConfig = {
      enabled: false,
      warningThreshold: 15000,  // 15秒で警告
      timeoutThreshold: 30000,  // 30秒でタイムアウト
      minVolumeThreshold: 0.01, // 消音判定の音量閾値
      ...config.silenceDetection
    };
    
    // Note: getPlatformSpecs() will be called during initialize() to avoid timing issues
    
    // Initialize performance optimization
    this.frameRateLimiter = new AdaptiveFrameRateLimiter(45); // 45FPS optimal for music
  }

  /**
   * Sets callback functions for pitch detection events
   * 
   * @param callbacks - Object containing callback functions
   * @param callbacks.onPitchUpdate - Called when pitch is detected
   * @param callbacks.onError - Called when errors occur
   * @param callbacks.onStateChange - Called when component state changes
   * 
   * @example
   * ```typescript
   * pitchDetector.setCallbacks({
   *   onPitchUpdate: (result) => {
   *     console.log(`Pitch: ${result.frequency}Hz, Note: ${result.note}`);
   *   },
   *   onError: (error) => {
   *     console.error('Detection error:', error.message);
   *   },
   *   onStateChange: (state) => {
   *     console.log('State changed to:', state);
   *   }
   * });
   * ```
   */
  setCallbacks(callbacks: {
    onPitchUpdate?: PitchCallback;
    onError?: ErrorCallback;
    onStateChange?: StateChangeCallback;
  }): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

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
  async initialize(): Promise<void> {
    try {
      this.componentState = 'initializing';
      this.lastError = null;
      
      console.log('🎙️ [PitchDetector] Starting initialization via AudioManager');
      
      // Get shared resources from AudioManager
      await this.audioManager.initialize();
      
      // Initialize device specifications after AudioManager is ready
      this.deviceSpecs = this.audioManager.getPlatformSpecs();
      console.log('📱 [PitchDetector] Device specs initialized:', this.deviceSpecs.deviceType);
      
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
      // Convert to structured error
      const pitchError = error instanceof PitchProError 
        ? error 
        : new AudioContextError(
            'PitchDetector initialization failed',
            {
              originalError: error instanceof Error ? error.message : String(error),
              audioContextState: this.audioManager.getStatus().audioContextState,
              deviceSpecs: this.deviceSpecs
            }
          );
          
      console.error('❌ [PitchDetector] Initialization error:', pitchError.toJSON());
      this.componentState = 'error';
      this.lastError = pitchError;
      this.isInitialized = false;
      
      // Notify with structured error
      this.callbacks.onError?.(pitchError);
      
      throw error;
    }
  }

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
  startDetection(): boolean {
    if (this.componentState !== 'ready') {
      const error = new Error(`Cannot start detection: component state is ${this.componentState}`);
      this.callbacks.onError?.(error);
      return false;
    }
    
    if (!this.analyser || !this.pitchDetector) {
      const error = new PitchDetectionError(
        'ピッチ検出に必要なコンポーネントが初期化されていません。initialize()メソッドを先に呼び出してください。',
        {
          operation: 'startDetection',
          hasAnalyser: !!this.analyser,
          hasPitchDetector: !!this.pitchDetector,
          componentState: this.componentState,
          isInitialized: this.isInitialized
        }
      );
      
      ErrorMessageBuilder.logError(error, 'Pitch detection startup');
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
  stopDetection(): void {
    this.isDetecting = false;
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    // Reset frame rate limiter
    this.frameRateLimiter.reset();
    
    // Reset silence detection
    this.resetSilenceTracking();
    
    // Return state to ready (if initialized)
    if (this.componentState === 'detecting' && this.isInitialized) {
      this.componentState = 'ready';
      this.callbacks.onStateChange?.(this.componentState);
    }
  }

  /**
   * Real-time pitch detection loop with adaptive frame rate
   */
  private detectPitch(): void {
    // Check if we should process this frame based on adaptive FPS
    if (!this.frameRateLimiter.shouldProcess()) {
      // Skip this frame but schedule next
      this.animationFrame = requestAnimationFrame(() => this.detectPitch());
      return;
    }
    // デバッグログ: detectPitchメソッドの呼び出し確認
    console.log(`[Debug] detectPitch呼び出し: detecting=${this.isDetecting}, analyser=${!!this.analyser}, rawAnalyser=${!!this.rawAnalyser}, pitchDetector=${!!this.pitchDetector}`);
    
    // デバッグ: AudioManagerの状態確認
    const audioManagerStatus = this.audioManager.getStatus();
    console.log(`[Debug] AudioManager状態: context=${audioManagerStatus.audioContextState}, stream=${audioManagerStatus.mediaStreamActive}`);
    
    if (!this.isDetecting || !this.analyser || !this.rawAnalyser || !this.pitchDetector || !this.deviceSpecs) return;
    
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
    
    // Pitch detection (using PitchDetector) with error handling
    const sampleRate = 44100; // Fixed sample rate for now
    let pitch = 0;
    let clarity = 0;
    
    try {
      const result = this.pitchDetector.findPitch(buffer, sampleRate);
      pitch = result[0] || 0;
      clarity = result[1] || 0;
    } catch (error) {
      // Handle pitch detection errors gracefully
      const pitchError = new PitchDetectionError(
        'Pitch detection algorithm failed',
        {
          bufferLength: buffer.length,
          sampleRate,
          volume: this.currentVolume,
          originalError: error instanceof Error ? error.message : String(error)
        }
      );
      
      console.warn('⚠️ [PitchDetector] Pitch detection error (recoverable):', pitchError.toJSON());
      
      // For recoverable errors, continue with zero values
      if (isRecoverableError(pitchError)) {
        pitch = 0;
        clarity = 0;
      } else {
        // For non-recoverable errors, notify callback
        this.callbacks.onError?.(pitchError);
        return;
      }
    }
    
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
    
    // Process silence detection
    this.processSilenceDetection(this.currentVolume);
    
    // Send data to callback
    const result: PitchDetectionResult = {
      frequency: this.currentFrequency,
      note: this.detectedNote,
      octave: this.detectedOctave || undefined,
      clarity: this.pitchClarity,
      volume: displayVolume,
      cents: this.currentFrequency > 0 ? this.frequencyToCents(this.currentFrequency) : undefined
    };
    
    // Separate visual updates from audio processing
    this.processAudioData(result);
    this.updateVisuals(result);
    
    // Check performance and adjust frame rate if needed
    const stats = this.frameRateLimiter.getStats();
    if (stats.frameDrops === 0) {
      this.frameRateLimiter.recoverPerformance();
    }
    
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
   * Process silence detection logic
   */
  private processSilenceDetection(currentVolume: number): void {
    if (!this.silenceDetectionConfig.enabled) {
      return;
    }
    
    const now = Date.now();
    const volumeThreshold = this.silenceDetectionConfig.minVolumeThreshold || 0.01;
    const isCurrentlySilent = currentVolume < volumeThreshold;
    
    if (isCurrentlySilent) {
      // Start tracking silence if not already doing so
      if (!this.isSilent) {
        this.isSilent = true;
        this.silenceStartTime = now;
        this.hasWarned = false;
        
        console.log('🔇 [PitchDetector] Silence detected, starting timer');
        
        // Schedule warning
        if (this.silenceDetectionConfig.warningThreshold) {
          this.silenceWarningTimer = window.setTimeout(() => {
            this.handleSilenceWarning();
          }, this.silenceDetectionConfig.warningThreshold);
        }
        
        // Schedule timeout
        if (this.silenceDetectionConfig.timeoutThreshold) {
          this.silenceTimeoutTimer = window.setTimeout(() => {
            this.handleSilenceTimeout();
          }, this.silenceDetectionConfig.timeoutThreshold);
        }
      }
    } else {
      // Voice detected - reset silence tracking
      if (this.isSilent) {
        const silenceDuration = this.silenceStartTime ? now - this.silenceStartTime : 0;
        console.log(`🔊 [PitchDetector] Voice recovered after ${silenceDuration}ms of silence`);
        
        this.resetSilenceTracking();
        
        // Notify recovery
        if (this.silenceDetectionConfig.onSilenceRecovered) {
          this.silenceDetectionConfig.onSilenceRecovered();
        }
      }
    }
  }
  
  /**
   * Handle silence warning
   */
  private handleSilenceWarning(): void {
    if (!this.hasWarned && this.silenceStartTime) {
      const duration = Date.now() - this.silenceStartTime;
      this.hasWarned = true;
      
      console.log(`⚠️ [PitchDetector] Silence warning: ${duration}ms`);
      
      if (this.silenceDetectionConfig.onSilenceWarning) {
        this.silenceDetectionConfig.onSilenceWarning(duration);
      }
    }
  }
  
  /**
   * Handle silence timeout
   */
  private handleSilenceTimeout(): void {
    console.log('⏰ [PitchDetector] Silence timeout reached');
    
    if (this.silenceDetectionConfig.onSilenceTimeout) {
      this.silenceDetectionConfig.onSilenceTimeout();
    }
    
    // Optionally stop detection on timeout
    this.stopDetection();
    this.resetSilenceTracking();
  }
  
  /**
   * Reset silence tracking state
   */
  private resetSilenceTracking(): void {
    this.isSilent = false;
    this.silenceStartTime = null;
    this.hasWarned = false;
    
    // Clear timers
    if (this.silenceWarningTimer) {
      clearTimeout(this.silenceWarningTimer);
      this.silenceWarningTimer = null;
    }
    
    if (this.silenceTimeoutTimer) {
      clearTimeout(this.silenceTimeoutTimer);
      this.silenceTimeoutTimer = null;
    }
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
    this.volumeHistory = [0, 0, 0, 0, 0];  // Reset with initial zeros
    
    // Reset harmonic correction
    this.resetHarmonicHistory();
    
    // Reset silence detection
    this.resetSilenceTracking();
    
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
   * Update silence detection configuration
   */
  setSilenceDetectionConfig(config: Partial<SilenceDetectionConfig>): void {
    this.silenceDetectionConfig = {
      ...this.silenceDetectionConfig,
      ...config
    };
    
    // Reset tracking if disabled
    if (!this.silenceDetectionConfig.enabled) {
      this.resetSilenceTracking();
    }
    
    console.log('🔇 [PitchDetector] Silence detection config updated:', this.silenceDetectionConfig);
  }
  
  /**
   * Get current silence detection status
   */
  getSilenceStatus(): {
    isEnabled: boolean;
    isSilent: boolean;
    silenceDuration: number | null;
    hasWarned: boolean;
  } {
    const silenceDuration = this.silenceStartTime && this.isSilent 
      ? Date.now() - this.silenceStartTime 
      : null;
      
    return {
      isEnabled: this.silenceDetectionConfig.enabled || false,
      isSilent: this.isSilent,
      silenceDuration,
      hasWarned: this.hasWarned
    };
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
   * Process audio data (high priority, runs at full speed)
   */
  private processAudioData(result: PitchDetectionResult): void {
    // Critical audio processing that needs low latency
    // This runs at the full adaptive frame rate (30-60 FPS)
    
    // Callback for real-time audio processing
    this.callbacks.onPitchUpdate?.(result);
  }
  
  /**
   * Update visual elements (lower priority, can be throttled)
   */
  private updateVisuals(_result: PitchDetectionResult): void {
    // Visual updates can be throttled to 30 FPS
    // This is handled by the UI layer if needed
    
    // The callback can decide to throttle visual updates
    // For now, we pass through all updates
    // Note: result parameter prefixed with _ to indicate intentional non-use
  }
  
  /**
   * Get current performance statistics
   */
  getPerformanceStats(): {
    currentFPS: number;
    frameDrops: number;
    latency: number;
  } {
    return this.frameRateLimiter.getStats();
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
    this.volumeHistory = [0, 0, 0, 0, 0];  // Reset with initial zeros
    this.resetHarmonicHistory();
    
    console.log('✅ [PitchDetector] Cleanup complete');
  }
}