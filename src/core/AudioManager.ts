/**
 * AudioManager - Framework-agnostic Global Audio Resource Management System
 * 
 * @description Provides centralized management of Web Audio API resources with automatic
 * device optimization, reference counting, and health monitoring. Solves common issues
 * with AudioContext sharing and MediaStream lifecycle management.
 * 
 * @example
 * ```typescript
 * const audioManager = new AudioManager({
 *   sampleRate: 44100,
 *   echoCancellation: false,
 *   autoGainControl: false
 * });
 * 
 * const resources = await audioManager.initialize();
 * const analyser = audioManager.createAnalyser('pitch-detection');
 * ```
 * 
 * @version 1.1.3
 * @since 1.0.0
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
  /** @private Global AudioContext instance shared across the application */
  private audioContext: AudioContext | null = null;
  
  /** @private MediaStream from user's microphone */
  private mediaStream: MediaStream | null = null;
  
  /** @private Source node for audio processing pipeline */
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  
  /** @private Gain node for microphone sensitivity adjustment */
  private gainNode: GainNode | null = null;
  
  /** @private Map of analyser nodes by identifier for reuse */
  private analysers = new Map<string, AnalyserNode>();
  
  /** @private Map of filter chains for noise reduction */
  private filters = new Map<string, { highpass: BiquadFilterNode; lowpass: BiquadFilterNode; notch: BiquadFilterNode }>();
  
  /** @private Reference count for safe resource sharing */
  private refCount = 0;
  
  /** @private Promise to prevent duplicate initialization */
  private initPromise: Promise<MediaStreamResources> | null = null;
  
  /** @private Initialization state flag */
  private isInitialized = false;
  
  /** @private Last error encountered during operations */
  private lastError: Error | null = null;
  
  /** @private Current microphone sensitivity multiplier */
  private currentSensitivity: number;
  
  /** @private Interval ID for gain monitoring (hotfix v1.1.3) */
  private gainMonitorInterval: number | null = null;
  
  /** @private AudioManager configuration */
  private config: AudioManagerConfig;

  /**
   * Creates a new AudioManager instance with device-optimized configuration
   * 
   * @param config - Optional configuration to override defaults
   * @param config.sampleRate - Audio sample rate in Hz (default: 44100)
   * @param config.channelCount - Number of audio channels (default: 1)
   * @param config.echoCancellation - Enable echo cancellation (default: false)
   * @param config.noiseSuppression - Enable noise suppression (default: false)
   * @param config.autoGainControl - Enable auto gain control (default: false)
   * @param config.latency - Target latency in seconds (default: 0.1)
   * 
   * @example
   * ```typescript
   * // Basic usage with defaults
   * const audioManager = new AudioManager();
   * 
   * // Custom configuration
   * const audioManager = new AudioManager({
   *   sampleRate: 48000,
   *   echoCancellation: true,
   *   latency: 0.05
   * });
   * ```
   */
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
   * Gets device-specific default sensitivity multiplier
   * 
   * @private
   * @returns Device-optimized sensitivity value (PC: 1.0x, iPhone: 3.0x, iPad: 7.0x)
   */
  private _getDefaultSensitivity(): number {
    const deviceSpecs = DeviceDetection.getDeviceSpecs();
    
    console.log(`🔧 [AudioManager] ${deviceSpecs.deviceType} detected - setting default sensitivity ${deviceSpecs.sensitivity}x`);
    return deviceSpecs.sensitivity;
  }

  /**
   * Initializes audio resources including AudioContext and MediaStream
   * 
   * @description Safe to call multiple times - uses reference counting and health checks.
   * Automatically handles browser-specific quirks and device optimization.
   * 
   * @returns Promise resolving to audio resources
   * @throws {Error} If microphone permission is denied or AudioContext creation fails
   * 
   * @example
   * ```typescript
   * try {
   *   const { audioContext, mediaStream, sourceNode } = await audioManager.initialize();
   *   console.log('Audio initialized:', audioContext.state);
   * } catch (error) {
   *   console.error('Failed to initialize audio:', error.message);
   * }
   * ```
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
   * Performs the actual initialization process
   * 
   * @private
   * @returns Promise resolving to initialized audio resources
   * @throws {Error} If any step of initialization fails
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
            
            // HOTFIX: Enhanced AGC disable for all platforms to prevent level drop
            ...(window as any).chrome && {
              googAutoGainControl: false,     // Google AGC complete disable
              googNoiseSuppression: false,    // Google noise suppression disable
              googEchoCancellation: false,    // Google echo cancellation disable
              googHighpassFilter: false,      // Google highpass filter disable
              googTypingNoiseDetection: false, // Typing noise detection disable
              googBeamforming: false,         // Beamforming disable
            },
            
            // Mozilla-specific constraints
            ...(navigator.userAgent.includes('Firefox')) && {
              mozAutoGainControl: false,      // Mozilla AGC disable
              mozNoiseSuppression: false,     // Mozilla noise suppression disable
            },
            
            // Safari compatibility: Explicit quality settings  
            sampleRate: this.config.sampleRate,
            channelCount: this.config.channelCount,
            sampleSize: 16,
            
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
        this.gainNode.gain.setValueAtTime(this.currentSensitivity, this.audioContext.currentTime);
        
        // Connect SourceNode -> GainNode
        this.sourceNode.connect(this.gainNode);
        console.log(`✅ [AudioManager] GainNode creation complete (sensitivity: ${this.currentSensitivity}x)`);
        
        // HOTFIX: Start gain monitoring to prevent level drops
        this.startGainMonitoring();
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
   * Removes a specific analyser and its associated filter chain
   * 
   * @param id - Unique identifier for the analyser to remove
   * 
   * @example
   * ```typescript
   * audioManager.removeAnalyser('pitch-detection');
   * ```
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
   * Adjusts microphone sensitivity with automatic gain monitoring
   * 
   * @param sensitivity - Sensitivity multiplier (0.1 ~ 10.0)
   * - 0.1-1.0: Reduced sensitivity for loud environments
   * - 1.0: Standard sensitivity (PC default)
   * - 3.0: iPhone optimized sensitivity
   * - 7.0: iPad optimized sensitivity
   * - 10.0: Maximum sensitivity for quiet environments
   * 
   * @example
   * ```typescript
   * // Set sensitivity for iPad
   * audioManager.setSensitivity(7.0);
   * 
   * // Reduce for loud environment
   * audioManager.setSensitivity(0.5);
   * ```
   */
  setSensitivity(sensitivity: number): void {
    // Range limit (extended to 10.0x for iPad real device support)
    const clampedSensitivity = Math.max(0.1, Math.min(10.0, sensitivity));
    
    if (this.gainNode) {
      // HOTFIX: Ensure gain value is properly set and monitored
      this.gainNode.gain.setValueAtTime(clampedSensitivity, this.audioContext?.currentTime || 0);
      this.currentSensitivity = clampedSensitivity;
      
      // Verify the gain was actually set
      setTimeout(() => {
        if (this.gainNode && Math.abs(this.gainNode.gain.value - clampedSensitivity) > 0.1) {
          console.warn(`⚠️ [AudioManager] Gain value drift detected! Expected: ${clampedSensitivity}, Actual: ${this.gainNode.gain.value}`);
          this.gainNode.gain.setValueAtTime(clampedSensitivity, this.audioContext?.currentTime || 0);
        }
      }, 100);
      
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
   * HOTFIX: Start gain monitoring to prevent level drops
   */
  private startGainMonitoring(): void {
    if (this.gainMonitorInterval) {
      clearInterval(this.gainMonitorInterval);
    }
    
    this.gainMonitorInterval = window.setInterval(() => {
      if (this.gainNode && this.audioContext) {
        const currentGainValue = this.gainNode.gain.value;
        const expectedGain = this.currentSensitivity;
        
        // Check for significant drift (more than 10% difference)
        if (Math.abs(currentGainValue - expectedGain) > expectedGain * 0.1) {
          console.warn(`🚨 [AudioManager] Gain drift detected! Expected: ${expectedGain}, Current: ${currentGainValue}`);
          
          // Force reset to expected value
          this.gainNode.gain.setValueAtTime(expectedGain, this.audioContext.currentTime);
          console.log(`🔧 [AudioManager] Gain reset to: ${expectedGain}`);
        }
      }
    }, 2000); // Check every 2 seconds
  }

  /**
   * HOTFIX: Stop gain monitoring
   */
  private stopGainMonitoring(): void {
    if (this.gainMonitorInterval) {
      clearInterval(this.gainMonitorInterval);
      this.gainMonitorInterval = null;
    }
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
    
    // HOTFIX: Stop gain monitoring
    this.stopGainMonitoring();
    
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
   * Gets current AudioManager status for debugging and monitoring
   * 
   * @returns Status object containing initialization state, reference count, and resource states
   * 
   * @example
   * ```typescript
   * const status = audioManager.getStatus();
   * console.log('AudioManager Status:', status);
   * console.log('Active analysers:', status.activeAnalysers);
   * ```
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
   * Performs comprehensive health check on MediaStream and tracks
   * 
   * @returns Health status object with detailed track information
   * 
   * @example
   * ```typescript
   * const health = audioManager.checkMediaStreamHealth();
   * if (!health.healthy) {
   *   console.warn('MediaStream health issue detected:', health);
   *   // Perform recovery actions
   * }
   * ```
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