/**
 * AudioManager - Framework-agnostic Global Audio Resource Management System
 * 
 * Purpose: Solve multiple AudioContext issues
 * - Share single AudioContext across entire application
 * - Reuse single MediaStream across all components
 * - Safe resource management and cleanup
 */

import type { 
  AudioManagerConfig, 
  MediaStreamResources, 
  HealthStatus, 
  TrackState,
  DeviceSpecs
} from '../types';
import { DeviceDetection } from '../utils/DeviceDetection';

export class AudioManager {
  // Global shared resources
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private gainNode: GainNode | null = null; // For microphone sensitivity adjustment
  
  // Analyser management
  private analysers = new Map<string, AnalyserNode>();
  private filters = new Map<string, { highpass: BiquadFilterNode; lowpass: BiquadFilterNode; notch: BiquadFilterNode }>();
  
  // Reference counting (for safe cleanup)
  private refCount = 0;
  private initPromise: Promise<MediaStreamResources> | null = null; // Prevent duplicate initialization
  
  // State management
  private isInitialized = false;
  private lastError: Error | null = null;
  
  // Sensitivity settings (iPad compatibility)
  private currentSensitivity: number; // Device-dependent default sensitivity
  
  // Configuration
  private config: AudioManagerConfig;

  constructor(config: AudioManagerConfig = {}) {
    this.config = {
      sampleRate: 44100,
      channelCount: 1,
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
      latency: 0.1,
      ...config
    };
    
    this.currentSensitivity = this._getDefaultSensitivity();
  }

  /**
   * Get device-dependent default sensitivity
   */
  private _getDefaultSensitivity(): number {
    const deviceSpecs = DeviceDetection.getDeviceSpecs();
    
    switch (deviceSpecs.deviceType) {
      case 'iPad':
        console.log('🔧 [AudioManager] iPad detected - setting default sensitivity 7.0x');
        return 7.0;
      case 'iPhone':
        console.log('🔧 [AudioManager] iPhone detected - setting default sensitivity 3.0x');
        return 3.0;
      default:
        console.log('🔧 [AudioManager] PC detected - setting default sensitivity 1.0x');
        return 1.0;
    }
  }

  /**
   * Initialize audio resources
   * Safe to call multiple times (singleton-like behavior)
   */
  async initialize(): Promise<MediaStreamResources> {
    // If already initializing, wait for completion
    if (this.initPromise) {
      return this.initPromise;
    }

    // If already initialized - perform MediaStream health check
    if (this.isInitialized && this.audioContext && this.mediaStream) {
      const healthCheck = this.checkMediaStreamHealth();
      
      if (healthCheck.healthy) {
        this.refCount++;
        return {
          audioContext: this.audioContext,
          mediaStream: this.mediaStream,
          sourceNode: this.sourceNode!
        };
      } else {
        // Force re-initialization if MediaStream is unhealthy
        console.warn('⚠️ [AudioManager] Unhealthy MediaStream detected - force re-initialization:', healthCheck);
        console.log('🔄 [AudioManager] Unhealthy MediaStream details:', {
          mediaStreamActive: this.mediaStream?.active,
          trackCount: this.mediaStream?.getTracks().length,
          trackStates: this.mediaStream?.getTracks().map(t => ({
            kind: t.kind,
            readyState: t.readyState,
            enabled: t.enabled,
            muted: t.muted
          }))
        });
        
        // Perform safe cleanup
        this._cleanup();
        this.isInitialized = false;
        this.refCount = 0;
        
        // Short wait to ensure resource release
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('🔄 [AudioManager] Cleanup complete - starting re-initialization');
        // Continue to next block for re-initialization
      }
    }

    // Execute initialization
    this.initPromise = this._doInitialize();
    
    try {
      const result = await this.initPromise;
      this.initPromise = null;
      return result;
    } catch (error) {
      this.initPromise = null;
      throw error;
    }
  }

  /**
   * Actual initialization process
   */
  private async _doInitialize(): Promise<MediaStreamResources> {
    try {
      console.log('🎤 [AudioManager] Starting initialization');

      // Create AudioContext (single instance)
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        console.log('✅ [AudioManager] AudioContext creation complete');
      }

      // Resume AudioContext if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
        console.log('✅ [AudioManager] AudioContext resume complete');
      }

      // Get MediaStream (single instance)
      if (!this.mediaStream) {
        const deviceSpecs = this.getPlatformSpecs();
        
        console.log(`🔍 [AudioManager] Device detection: ${deviceSpecs.deviceType}`, navigator.userAgent);
        console.log(`🔍 [AudioManager] Touch support: ${'ontouchend' in document}`);
        
        // Safari WebKit compatibility: Maximum compatibility audio settings
        const audioConstraints: MediaStreamConstraints = {
          audio: {
            // Basic settings: Safari WebKit stability focused
            echoCancellation: this.config.echoCancellation,
            noiseSuppression: this.config.noiseSuppression,
            autoGainControl: this.config.autoGainControl,
            
            // iOS specific: Ultra high sensitivity settings
            ...(deviceSpecs.isIOS && {
              googAutoGainControl: false,     // Google AGC complete disable
              googNoiseSuppression: false,    // Google noise suppression disable
              googEchoCancellation: false,    // Google echo cancellation disable
              googHighpassFilter: false,      // Google highpass filter disable
              googTypingNoiseDetection: false, // Typing noise detection disable
              googBeamforming: false,         // Beamforming disable
              mozAutoGainControl: false,      // Mozilla AGC disable
              mozNoiseSuppression: false,     // Mozilla noise suppression disable
            } as any),
            
            // Safari compatibility: Explicit quality settings
            sampleRate: this.config.sampleRate,
            channelCount: this.config.channelCount,
            sampleSize: 16,
            
            // Safari WebKit additional stabilization settings
            latency: this.config.latency,  // 100ms latency tolerance
            volume: 1.0,   // Volume normalization
            
            // Flexible device selection (Safari compatibility)
            deviceId: { ideal: 'default' }
          }
        };
        
        console.log('🎤 [AudioManager] Getting MediaStream with Safari-compatible settings:', audioConstraints);
        this.mediaStream = await navigator.mediaDevices.getUserMedia(audioConstraints);
        console.log('✅ [AudioManager] MediaStream acquisition complete');
      }

      // Create SourceNode (single instance)
      if (!this.sourceNode) {
        this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
        console.log('✅ [AudioManager] SourceNode creation complete');
        
        // MediaStream state check
        const tracks = this.mediaStream.getTracks();
        console.log('🎤 [AudioManager] MediaStream tracks:', tracks.map(t => ({
          kind: t.kind,
          label: t.label,
          enabled: t.enabled,
          readyState: t.readyState,
          muted: t.muted
        })));
      }

      // Create GainNode (for microphone sensitivity adjustment)
      if (!this.gainNode) {
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = this.currentSensitivity;
        
        // Connect SourceNode -> GainNode
        this.sourceNode.connect(this.gainNode);
        console.log(`✅ [AudioManager] GainNode creation complete (sensitivity: ${this.currentSensitivity}x)`);
      }

      this.isInitialized = true;
      this.refCount++;
      this.lastError = null;

      console.log(`🎤 [AudioManager] Initialization complete (refCount: ${this.refCount})`);

      return {
        audioContext: this.audioContext,
        mediaStream: this.mediaStream,
        sourceNode: this.sourceNode
      };

    } catch (error) {
      console.error('❌ [AudioManager] Initialization error:', error);
      this.lastError = error as Error;
      this.isInitialized = false;
      
      // Cleanup on error
      this._cleanup();
      
      throw error;
    }
  }

  /**
   * Create dedicated AnalyserNode
   * @param id - Analyser identifier
   * @param options - Option settings
   */
  createAnalyser(id: string, options: {
    fftSize?: number;
    smoothingTimeConstant?: number;
    minDecibels?: number;
    maxDecibels?: number;
    useFilters?: boolean;
  } = {}): AnalyserNode {
    if (!this.isInitialized || !this.audioContext || !this.sourceNode) {
      throw new Error('AudioManager not initialized. Call initialize() first.');
    }

    // Remove existing analyser if present
    this.removeAnalyser(id);

    const {
      fftSize = 2048,
      smoothingTimeConstant = 0.8,
      minDecibels = -90,
      maxDecibels = -10,
      useFilters = true
    } = options;

    // Create Analyser (Safari WebKit optimized)
    const analyser = this.audioContext.createAnalyser();
    
    // Safari load reduction settings
    analyser.fftSize = Math.min(fftSize, 2048); // Safari upper limit restriction
    analyser.smoothingTimeConstant = Math.max(smoothingTimeConstant, 0.7); // Safari stabilization
    analyser.minDecibels = Math.max(minDecibels, -80); // Safari range optimization
    analyser.maxDecibels = Math.min(maxDecibels, -10);

    let finalNode: AudioNode = this.gainNode || this.sourceNode;

    // Create filter chain (optional)
    if (useFilters) {
      const filterChain = this._createFilterChain();
      this.filters.set(id, filterChain);
      
      // Connect filter chain (starting from GainNode)
      finalNode.connect(filterChain.highpass);
      filterChain.highpass.connect(filterChain.lowpass);
      filterChain.lowpass.connect(filterChain.notch);
      filterChain.notch.connect(analyser);
      
      console.log(`🔧 [AudioManager] Filtered Analyser created: ${id}`);
    } else {
      // Direct connection (signal from GainNode)
      finalNode.connect(analyser);
      console.log(`🔧 [AudioManager] Raw signal Analyser created: ${id}`);
    }
    
    // Important: Analyser only passes audio through, don't connect to destination
    // (prevents microphone feedback)

    this.analysers.set(id, analyser);
    return analyser;
  }

  /**
   * Create 3-stage noise reduction filter chain
   */
  private _createFilterChain() {
    if (!this.audioContext) {
      throw new Error('AudioContext not available');
    }

    // 1. Highpass filter (remove low frequency noise: cut below 80Hz)
    const highpass = this.audioContext.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(80, this.audioContext.currentTime);
    highpass.Q.setValueAtTime(0.7, this.audioContext.currentTime);

    // 2. Lowpass filter (remove high frequency noise: cut above 800Hz)
    const lowpass = this.audioContext.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.setValueAtTime(800, this.audioContext.currentTime);
    lowpass.Q.setValueAtTime(0.7, this.audioContext.currentTime);

    // 3. Notch filter (remove power noise: 60Hz)
    const notch = this.audioContext.createBiquadFilter();
    notch.type = 'notch';
    notch.frequency.setValueAtTime(60, this.audioContext.currentTime);
    notch.Q.setValueAtTime(10, this.audioContext.currentTime);

    return { highpass, lowpass, notch };
  }

  /**
   * Remove specific analyser
   */
  removeAnalyser(id: string): void {
    if (this.analysers.has(id)) {
      const analyser = this.analysers.get(id)!;
      analyser.disconnect();
      this.analysers.delete(id);
      console.log(`🗑️ [AudioManager] Analyser removed: ${id}`);
    }

    if (this.filters.has(id)) {
      const filterChain = this.filters.get(id)!;
      filterChain.highpass.disconnect();
      filterChain.lowpass.disconnect();
      filterChain.notch.disconnect();
      this.filters.delete(id);
      console.log(`🗑️ [AudioManager] Filter chain removed: ${id}`);
    }
  }

  /**
   * Adjust microphone sensitivity
   * @param sensitivity - Sensitivity multiplier (0.1 ~ 10.0)
   */
  setSensitivity(sensitivity: number): void {
    // Range limit (extended to 10.0x for iPad real device support)
    const clampedSensitivity = Math.max(0.1, Math.min(10.0, sensitivity));
    
    if (this.gainNode) {
      this.gainNode.gain.value = clampedSensitivity;
      this.currentSensitivity = clampedSensitivity;
      console.log(`🎤 [AudioManager] Microphone sensitivity updated: ${clampedSensitivity.toFixed(1)}x`);
    } else {
      // If GainNode not initialized, save setting only
      this.currentSensitivity = clampedSensitivity;
      console.log(`🎤 [AudioManager] Microphone sensitivity set (awaiting initialization): ${clampedSensitivity.toFixed(1)}x`);
    }
  }

  /**
   * Get current microphone sensitivity
   */
  getSensitivity(): number {
    return this.currentSensitivity;
  }

  /**
   * Get platform-specific settings according to specification
   * Complies with MICROPHONE_PLATFORM_SPECIFICATIONS.md
   */
  getPlatformSpecs(): DeviceSpecs {
    // Use DeviceDetection utility for consistent device detection
    const deviceSpecs = DeviceDetection.getDeviceSpecs();
    
    // Add AudioManager-specific properties
    return {
      ...deviceSpecs,
      sensitivity: this.currentSensitivity || deviceSpecs.sensitivity
    };
  }

  /**
   * Decrement reference count and cleanup
   */
  release(analyserIds: string[] = []): void {
    // Remove specified analysers
    analyserIds.forEach(id => this.removeAnalyser(id));

    this.refCount = Math.max(0, this.refCount - 1);
    console.log(`📉 [AudioManager] Reference count decremented: ${this.refCount}`);

    // Full cleanup only when no one is using it
    if (this.refCount <= 0) {
      console.log('🧹 [AudioManager] Starting full resource cleanup');
      this._cleanup();
    }
  }

  /**
   * Force cleanup (for emergency use)
   */
  forceCleanup(): void {
    console.log('🚨 [AudioManager] Force cleanup executed');
    this._cleanup();
  }

  /**
   * Internal cleanup process
   */
  private _cleanup(): void {
    console.log('🧹 [AudioManager] Starting cleanup');
    
    // Remove all analysers
    for (const id of this.analysers.keys()) {
      this.removeAnalyser(id);
    }

    // Stop MediaStream (health check compatible)
    if (this.mediaStream) {
      const tracks = this.mediaStream.getTracks();
      console.log(`🛑 [AudioManager] Stopping MediaStream: ${tracks.length} tracks`);
      
      tracks.forEach((track, index) => {
        try {
          if (track.readyState !== 'ended') {
            track.stop();
            console.log(`🛑 [AudioManager] Track ${index} stop complete`);
          } else {
            console.log(`⚠️ [AudioManager] Track ${index} already ended`);
          }
        } catch (error) {
          console.warn(`⚠️ [AudioManager] Track ${index} stop error:`, error);
        }
      });
      
      this.mediaStream = null;
    }

    // Close AudioContext
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
        console.log('🛑 [AudioManager] AudioContext close complete');
      } catch (error) {
        console.warn('⚠️ [AudioManager] AudioContext close error:', error);
      }
      this.audioContext = null;
    }

    // Remove GainNode
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }

    // Remove SourceNode
    if (this.sourceNode) {
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }

    // Reset state
    this.isInitialized = false;
    this.refCount = 0;
    this.initPromise = null;
    this.currentSensitivity = this._getDefaultSensitivity(); // Reset to device-dependent default sensitivity

    console.log('✅ [AudioManager] Cleanup complete');
  }

  /**
   * Get current status (for debugging)
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      refCount: this.refCount,
      audioContextState: this.audioContext?.state || 'none',
      mediaStreamActive: this.mediaStream?.active || false,
      activeAnalysers: Array.from(this.analysers.keys()),
      activeFilters: Array.from(this.filters.keys()),
      lastError: this.lastError,
      currentSensitivity: this.currentSensitivity
    };
  }

  /**
   * MediaStream health status check
   */
  checkMediaStreamHealth(): HealthStatus {
    if (!this.mediaStream) {
      return { 
        mediaStreamActive: false,
        audioContextState: this.audioContext?.state || 'none',
        trackStates: [],
        healthy: false
      };
    }

    // MediaStream state check (Safari compatibility enhanced)
    if (!this.mediaStream.active) {
      return {
        mediaStreamActive: false,
        audioContextState: this.audioContext?.state || 'none',
        trackStates: [],
        healthy: false
      };
    }

    const tracks = this.mediaStream.getTracks();
    if (tracks.length === 0) {
      return {
        mediaStreamActive: this.mediaStream.active,
        audioContextState: this.audioContext?.state || 'none',
        trackStates: [],
        healthy: false
      };
    }

    const audioTrack = tracks.find(track => track.kind === 'audio');
    if (!audioTrack) {
      return {
        mediaStreamActive: this.mediaStream.active,
        audioContextState: this.audioContext?.state || 'none',
        trackStates: tracks.map(track => ({
          kind: track.kind,
          enabled: track.enabled,
          readyState: track.readyState,
          muted: track.muted
        })),
        healthy: false
      };
    }

    const trackStates: TrackState[] = tracks.map(track => ({
      kind: track.kind,
      enabled: track.enabled,
      readyState: track.readyState,
      muted: track.muted
    }));

    // AudioTrack detailed state check (Safari WebKit compatibility)
    if (audioTrack.readyState === 'ended') {
      return {
        mediaStreamActive: this.mediaStream.active,
        audioContextState: this.audioContext?.state || 'none',
        trackStates,
        healthy: false
      };
    }

    if (!audioTrack.enabled) {
      return {
        mediaStreamActive: this.mediaStream.active,
        audioContextState: this.audioContext?.state || 'none',
        trackStates,
        healthy: false
      };
    }

    // Safari-specific muted state check
    if (audioTrack.muted) {
      return {
        mediaStreamActive: this.mediaStream.active,
        audioContextState: this.audioContext?.state || 'none',
        trackStates,
        healthy: false
      };
    }

    // Additional check: MediaStream and Track consistency verification
    if (this.mediaStream.active && audioTrack.readyState !== 'live') {
      return {
        mediaStreamActive: this.mediaStream.active,
        audioContextState: this.audioContext?.state || 'none',
        trackStates,
        healthy: false
      };
    }

    return {
      mediaStreamActive: this.mediaStream.active,
      audioContextState: this.audioContext?.state || 'none',
      trackStates,
      healthy: true,
      refCount: this.refCount
    };
  }
}