var He = Object.defineProperty;
var Be = (l, e, t) => e in l ? He(l, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : l[e] = t;
var R = (l, e, t) => Be(l, typeof e != "symbol" ? e + "" : e, t);
const b = class b {
  /**
   * Detect current device and return optimized specifications
   */
  static getDeviceSpecs() {
    if (b.cachedSpecs)
      return b.cachedSpecs;
    if (typeof window > "u" || typeof navigator > "u")
      return b.getDefaultSpecs();
    const e = navigator.userAgent, t = b.analyzeUserAgent(e);
    return b.cachedSpecs = t, console.log("📱 [DeviceDetection] Device analysis:", {
      userAgent: e.substring(0, 100) + "...",
      deviceType: t.deviceType,
      isIOS: t.isIOS,
      sensitivity: t.sensitivity,
      divisor: t.divisor
    }), t;
  }
  /**
   * Analyze user agent string and determine device specifications
   */
  static analyzeUserAgent(e) {
    const t = /iPhone/.test(e), i = /iPad/.test(e), s = /Macintosh/.test(e) && "ontouchend" in document, n = /iPad|iPhone|iPod/.test(e), o = /iPad|iPhone|iPod/.test(navigator.platform || ""), r = t || i || s || n || o;
    let a = "PC";
    t ? a = "iPhone" : i || s ? a = "iPad" : r && (a = b.detectIOSDeviceType());
    const c = b.getDeviceOptimizations(a, r);
    return {
      deviceType: a,
      isIOS: r,
      sensitivity: c.sensitivity,
      noiseGate: c.noiseGate,
      divisor: c.divisor,
      gainCompensation: c.gainCompensation,
      noiseThreshold: c.noiseThreshold,
      smoothingFactor: c.smoothingFactor
    };
  }
  /**
   * Detect iOS device type when specific detection fails
   */
  static detectIOSDeviceType() {
    const e = window.screen.width, t = window.screen.height, i = Math.max(e, t), s = Math.min(e, t);
    return i >= 768 || i >= 700 && s >= 500 ? "iPad" : "iPhone";
  }
  /**
   * Get device-specific optimization parameters
   */
  static getDeviceOptimizations(e, t) {
    switch (e) {
      case "iPad":
        return {
          sensitivity: 7,
          // High sensitivity for iPad microphones
          noiseGate: 0.025,
          // v1.1.8: Increased noise gate for better noise rejection
          divisor: 4,
          // Volume calculation divisor
          gainCompensation: 1.5,
          // Gain compensation for low-frequency cut
          noiseThreshold: 8,
          // v1.1.8: Increased noise threshold to prevent ambient noise pickup
          smoothingFactor: 0.3
          // v1.1.8: Increased smoothing to reduce noise fluctuations
        };
      case "iPhone":
        return {
          sensitivity: 2,
          // Lower sensitivity for cleaner signal
          noiseGate: 0.03,
          // v1.1.8: Increased noise gate to filter out background noise
          divisor: 4,
          // Keep original divisor
          gainCompensation: 1.5,
          // Keep original gain compensation
          noiseThreshold: 6,
          // v1.1.8: Increased noise threshold for better noise rejection
          smoothingFactor: 0.25
          // v1.1.8: Increased smoothing to reduce noise spikes
        };
      case "PC":
      default:
        return {
          sensitivity: 1,
          // Standard sensitivity for PC
          noiseGate: 0.035,
          // v1.1.8: Increased noise gate for better ambient noise filtering
          divisor: 6,
          // Different volume calculation for PC
          gainCompensation: 1,
          // No additional gain compensation needed
          noiseThreshold: 7,
          // v1.1.8: Increased noise threshold for cleaner detection
          smoothingFactor: 0.25
          // v1.1.8: Increased smoothing for more stable readings
        };
    }
  }
  /**
   * Get default specifications for SSR or fallback
   */
  static getDefaultSpecs() {
    return {
      deviceType: "PC",
      isIOS: !1,
      sensitivity: 1,
      noiseGate: 0.035,
      // v1.1.8: Improved default noise gate
      divisor: 6,
      gainCompensation: 1,
      noiseThreshold: 7,
      // v1.1.8: Improved default noise threshold
      smoothingFactor: 0.25
      // v1.1.8: Improved default smoothing
    };
  }
  /**
   * Check if device supports Web Audio API
   */
  static supportsWebAudio() {
    return typeof window < "u" && (typeof window.AudioContext < "u" || typeof window.webkitAudioContext < "u");
  }
  /**
   * Check if device supports MediaDevices API
   */
  static supportsMediaDevices() {
    return typeof navigator < "u" && typeof navigator.mediaDevices < "u" && typeof navigator.mediaDevices.getUserMedia < "u";
  }
  /**
   * Check if device supports MediaRecorder API
   */
  static supportsMediaRecorder() {
    return typeof window < "u" && typeof window.MediaRecorder < "u";
  }
  /**
   * Get comprehensive device capabilities
   */
  static getDeviceCapabilities() {
    return {
      deviceSpecs: b.getDeviceSpecs(),
      webAudioSupport: b.supportsWebAudio(),
      mediaDevicesSupport: b.supportsMediaDevices(),
      mediaRecorderSupport: b.supportsMediaRecorder(),
      touchSupport: "ontouchend" in document,
      userAgent: typeof navigator < "u" ? navigator.userAgent : "Unknown",
      screenSize: typeof window < "u" ? {
        width: window.screen.width,
        height: window.screen.height,
        pixelRatio: window.devicePixelRatio
      } : null,
      language: typeof navigator < "u" ? navigator.language : "Unknown",
      platform: typeof navigator < "u" && navigator.platform || "Unknown"
    };
  }
  /**
   * Check if current device is mobile
   */
  static isMobile() {
    return b.getDeviceSpecs().isIOS || /Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test((navigator == null ? void 0 : navigator.userAgent) || "");
  }
  /**
   * Check if current device is tablet
   */
  static isTablet() {
    if (b.getDeviceSpecs().deviceType === "iPad") return !0;
    const t = (navigator == null ? void 0 : navigator.userAgent) || "";
    return /Android/i.test(t) && !/Mobile/i.test(t);
  }
  /**
   * Check if current device is desktop
   */
  static isDesktop() {
    return !b.isMobile() && !b.isTablet();
  }
  /**
   * Get recommended audio constraints for current device
   */
  static getOptimalAudioConstraints() {
    const e = b.getDeviceSpecs(), t = {
      audio: {
        echoCancellation: !1,
        noiseSuppression: !1,
        autoGainControl: !1,
        sampleRate: 44100,
        channelCount: 1,
        sampleSize: 16,
        // latency: 0.1, // Not supported in MediaTrackConstraints
        // volume: 1.0, // Not supported in MediaTrackConstraints
        deviceId: { ideal: "default" }
      }
    };
    return e.isIOS && t.audio && typeof t.audio == "object" && (t.audio = {
      ...t.audio,
      // Disable all browser-level processing for iOS
      googAutoGainControl: !1,
      googNoiseSuppression: !1,
      googEchoCancellation: !1,
      googHighpassFilter: !1,
      googTypingNoiseDetection: !1,
      googBeamforming: !1,
      mozAutoGainControl: !1,
      mozNoiseSuppression: !1
    }), t;
  }
  /**
   * Clear cached device specifications (for testing)
   */
  static clearCache() {
    b.cachedSpecs = null;
  }
  /**
   * Get device-specific debugging information
   */
  static getDebugInfo() {
    return {
      ...b.getDeviceCapabilities(),
      detectionMethods: {
        userAgentIPhone: /iPhone/.test((navigator == null ? void 0 : navigator.userAgent) || ""),
        userAgentIPad: /iPad/.test((navigator == null ? void 0 : navigator.userAgent) || ""),
        userAgentMacintosh: /Macintosh/.test((navigator == null ? void 0 : navigator.userAgent) || ""),
        touchSupport: "ontouchend" in document,
        navigatorPlatform: (navigator == null ? void 0 : navigator.platform) || "Unknown",
        screenAspectRatio: typeof window < "u" ? (window.screen.width / window.screen.height).toFixed(2) : "Unknown"
      }
    };
  }
};
b.cachedSpecs = null;
let K = b;
var U = /* @__PURE__ */ ((l) => (l.AUDIO_CONTEXT_ERROR = "AUDIO_CONTEXT_ERROR", l.MICROPHONE_ACCESS_DENIED = "MICROPHONE_ACCESS_DENIED", l.PITCH_DETECTION_ERROR = "PITCH_DETECTION_ERROR", l.BUFFER_OVERFLOW = "BUFFER_OVERFLOW", l.INVALID_SAMPLE_RATE = "INVALID_SAMPLE_RATE", l.DEVICE_NOT_SUPPORTED = "DEVICE_NOT_SUPPORTED", l.PROCESSING_TIMEOUT = "PROCESSING_TIMEOUT", l))(U || {});
class w extends Error {
  constructor(e, t, i) {
    super(e), this.name = "PitchProError", this.code = t, this.timestamp = /* @__PURE__ */ new Date(), this.context = i, Error.captureStackTrace && Error.captureStackTrace(this, w);
  }
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      timestamp: this.timestamp,
      context: this.context,
      stack: this.stack
    };
  }
}
class j extends w {
  constructor(e, t) {
    super(e, "AUDIO_CONTEXT_ERROR", t), this.name = "AudioContextError";
  }
}
class be extends w {
  constructor(e, t) {
    super(e, "MICROPHONE_ACCESS_DENIED", t), this.name = "MicrophoneAccessError";
  }
}
class Ve extends w {
  constructor(e, t, i, s) {
    super(
      e,
      "MICROPHONE_ACCESS_DENIED",
      {
        healthStatus: t,
        recoveryAttempts: i,
        timestamp: Date.now(),
        ...s
      }
    ), this.name = "MicrophoneHealthError";
  }
  getHealthStatus() {
    var e;
    return (e = this.context) == null ? void 0 : e.healthStatus;
  }
  getRecoveryAttempts() {
    var e;
    return (e = this.context) == null ? void 0 : e.recoveryAttempts;
  }
}
class we extends w {
  constructor(e, t) {
    super(e, "PITCH_DETECTION_ERROR", t), this.name = "PitchDetectionError";
  }
}
function xe(l) {
  return [
    "BUFFER_OVERFLOW",
    "PROCESSING_TIMEOUT",
    "PITCH_DETECTION_ERROR"
    /* PITCH_DETECTION_ERROR */
  ].includes(l.code);
}
class T {
  /**
   * Generates user-friendly error messages with resolution steps
   * 
   * @param error - PitchProError instance
   * @returns Object containing user message and suggested actions
   */
  static getUserFriendlyMessage(e) {
    switch (e.code) {
      case "MICROPHONE_ACCESS_DENIED":
        return {
          title: "マイクアクセスが拒否されました",
          message: "ピッチ検出を行うには、マイクへのアクセス許可が必要です。",
          actions: [
            "ブラウザのアドレスバーにあるマイクアイコンをクリック",
            "「このサイトでマイクを許可する」を選択",
            "ページを再読み込みしてもう一度試す",
            "プライベートブラウジングモードを無効にする（Safariの場合）"
          ],
          severity: "high",
          canRetry: !0
        };
      case "AUDIO_CONTEXT_ERROR":
        return {
          title: "オーディオシステムエラー",
          message: "オーディオの初期化に失敗しました。デバイスの音響設定を確認してください。",
          actions: [
            "他のアプリケーションでマイクが使用中でないか確認",
            "ブラウザを再起動してもう一度試す",
            "システムの音響設定でマイクが有効になっているか確認",
            "外部マイクを使用している場合は接続を確認"
          ],
          severity: "high",
          canRetry: !0
        };
      case "PITCH_DETECTION_ERROR":
        return {
          title: "ピッチ検出エラー",
          message: "音程の検出中に一時的な問題が発生しました。",
          actions: [
            "マイクに向かって明確に歌ってみる",
            "周囲のノイズを減らす",
            "感度設定を調整する",
            "数秒待ってからもう一度試す"
          ],
          severity: "medium",
          canRetry: !0
        };
      case "BUFFER_OVERFLOW":
        return {
          title: "バッファオーバーフロー",
          message: "オーディオデータの処理が追いついていません。",
          actions: [
            "他のタブやアプリケーションを閉じる",
            "ブラウザのハードウェアアクセラレーションを有効にする",
            "より高性能なデバイスを使用する",
            "ページを再読み込みする"
          ],
          severity: "medium",
          canRetry: !0
        };
      case "PROCESSING_TIMEOUT":
        return {
          title: "処理タイムアウト",
          message: "オーディオ処理の応答時間が長すぎます。",
          actions: [
            "デバイスの負荷を減らす（他のアプリを閉じる）",
            "ネットワーク接続を確認する",
            "ブラウザを再起動する",
            "しばらく待ってからもう一度試す"
          ],
          severity: "medium",
          canRetry: !0
        };
      case "INVALID_SAMPLE_RATE":
        return {
          title: "サンプリングレート不適合",
          message: "お使いのデバイスのサンプリングレートがサポートされていません。",
          actions: [
            "システムの音響設定で44.1kHz または 48kHzに設定",
            "外部オーディオインターフェースの設定を確認",
            "デバイスドライバを更新",
            "別のマイクを試す"
          ],
          severity: "high",
          canRetry: !1
        };
      case "DEVICE_NOT_SUPPORTED":
        return {
          title: "デバイス非対応",
          message: "お使いのデバイスまたはブラウザはサポートされていません。",
          actions: [
            "Chrome、Firefox、Safari の最新版を使用",
            "より新しいデバイスを使用",
            "ブラウザの互換性情報を確認",
            "技術サポートにお問い合わせ"
          ],
          severity: "critical",
          canRetry: !1
        };
      default:
        return {
          title: "予期しないエラー",
          message: "システムで予期しない問題が発生しました。",
          actions: [
            "ページを再読み込み",
            "ブラウザを再起動",
            "しばらく時間をおいて再試行",
            "問題が続く場合はサポートへ連絡"
          ],
          severity: "medium",
          canRetry: !0
        };
    }
  }
  /**
   * Generates detailed technical error information for developers
   * 
   * @param error - PitchProError instance
   * @returns Formatted technical error details
   */
  static getTechnicalDetails(e) {
    return {
      errorCode: e.code,
      timestamp: e.timestamp.toISOString(),
      context: e.context || {},
      stackTrace: e.stack,
      diagnosticInfo: {
        userAgent: typeof navigator < "u" ? navigator.userAgent : "unknown",
        timestamp: Date.now(),
        url: typeof window < "u" ? window.location.href : "unknown",
        isRecoverable: xe(e)
      }
    };
  }
  /**
   * Creates formatted console error messages for development
   * 
   * @param error - PitchProError instance
   * @param context - Additional context information
   */
  static logError(e, t) {
    const i = this.getUserFriendlyMessage(e), s = this.getTechnicalDetails(e);
    console.group(`🚨 [PitchPro Error] ${i.title}`), console.log("👤 User Message:", i.message), console.log("📋 Suggested Actions:", i.actions), console.log("⚠️ Severity:", i.severity), console.log("🔄 Can Retry:", i.canRetry), console.log("🔧 Error Code:", s.errorCode), console.log("⏰ Timestamp:", s.timestamp), t && console.log("📍 Context:", t), s.context && Object.keys(s.context).length > 0 && console.log("🔍 Additional Context:", s.context), s.stackTrace && console.log("📜 Stack Trace:", s.stackTrace), console.groupEnd();
  }
  /**
   * Creates recovery suggestions based on error type and context
   * 
   * @param error - PitchProError instance
   * @param deviceType - Device type for specific recommendations
   * @returns Recovery strategy object
   */
  static getRecoveryStrategy(e, t) {
    const i = this.getUserFriendlyMessage(e), s = i.actions.slice(0, 2), n = i.actions.slice(2);
    let o = [];
    return t === "iPhone" || t === "iPad" ? o = [
      "感度を高めに設定（7.0x推奨）",
      "Safari使用を推奨",
      "iOS 14以上で使用",
      "低電力モードを無効にする"
    ] : t === "Android" ? o = [
      "Chrome使用を推奨",
      "バックグラウンドアプリを制限",
      "省電力モードを無効にする",
      "マイク権限を常に許可に設定"
    ] : o = [
      "安定したネットワーク環境で使用",
      "ブラウザを最新版に更新",
      "ハードウェアアクセラレーションを有効化",
      "外部ノイズの少ない環境で使用"
    ], {
      immediate: s,
      fallback: n,
      preventive: o
    };
  }
}
class De {
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
  constructor(e = {}) {
    this.audioContext = null, this.mediaStream = null, this.sourceNode = null, this.gainNode = null, this.analysers = /* @__PURE__ */ new Map(), this.filters = /* @__PURE__ */ new Map(), this.refCount = 0, this.initPromise = null, this.isInitialized = !1, this.lastError = null, this.gainMonitorInterval = null, console.log("🔍 [DIAGNOSTIC] AudioManager constructor - input config:", e), this.config = {
      sampleRate: 44100,
      channelCount: 1,
      echoCancellation: !1,
      noiseSuppression: !1,
      autoGainControl: !1,
      latency: 0.1,
      ...e
    }, console.log("🔍 [DIAGNOSTIC] AudioManager constructor - final config:", this.config), console.log("🔍 [DIAGNOSTIC] autoGainControl value after merge:", this.config.autoGainControl), this.currentSensitivity = this._getDefaultSensitivity();
  }
  /**
   * Gets device-specific default sensitivity multiplier
   * 
   * @private
   * @returns Device-optimized sensitivity value (PC: 1.0x, iPhone: 3.0x, iPad: 7.0x)
   */
  _getDefaultSensitivity() {
    const e = K.getDeviceSpecs();
    return console.log(`🔧 [AudioManager] ${e.deviceType} detected - setting default sensitivity ${e.sensitivity}x`), e.sensitivity;
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
  async initialize() {
    var e, t, i;
    if (this.initPromise)
      return this.initPromise;
    if (this.isInitialized && this.audioContext && this.mediaStream) {
      const s = this.checkMediaStreamHealth();
      if (s.healthy)
        return this.refCount++, {
          audioContext: this.audioContext,
          mediaStream: this.mediaStream,
          sourceNode: this.sourceNode
        };
      console.warn("⚠️ [AudioManager] Unhealthy MediaStream detected - force re-initialization:", s), console.log("🔄 [AudioManager] Unhealthy MediaStream details:", {
        mediaStreamActive: (e = this.mediaStream) == null ? void 0 : e.active,
        trackCount: (t = this.mediaStream) == null ? void 0 : t.getTracks().length,
        trackStates: (i = this.mediaStream) == null ? void 0 : i.getTracks().map((n) => ({
          kind: n.kind,
          readyState: n.readyState,
          enabled: n.enabled,
          muted: n.muted
        }))
      }), this._cleanup(), this.isInitialized = !1, this.refCount = 0, await new Promise((n) => setTimeout(n, 100)), console.log("🔄 [AudioManager] Cleanup complete - starting re-initialization");
    }
    this.initPromise = this._doInitialize();
    try {
      const s = await this.initPromise;
      return this.initPromise = null, s;
    } catch (s) {
      throw this.initPromise = null, s;
    }
  }
  /**
   * Performs the actual initialization process
   * 
   * @private
   * @returns Promise resolving to initialized audio resources
   * @throws {Error} If any step of initialization fails
   */
  async _doInitialize() {
    try {
      if (console.log("🎤 [AudioManager] Starting initialization"), this.audioContext || (this.audioContext = new (window.AudioContext || window.webkitAudioContext)(), console.log("✅ [AudioManager] AudioContext creation complete")), this.audioContext.state === "suspended" && (await this.audioContext.resume(), console.log("✅ [AudioManager] AudioContext resume complete")), !this.mediaStream) {
        const e = this.getPlatformSpecs();
        console.log(`🔍 [AudioManager] Device detection: ${e.deviceType}`, navigator.userAgent), console.log(`🔍 [AudioManager] Touch support: ${"ontouchend" in document}`), console.log("🔍 [DIAGNOSTIC] Device specs from getPlatformSpecs():", e), console.log("🔍 [DIAGNOSTIC] Current this.config before constraints creation:", this.config);
        const t = {
          audio: {
            // Basic settings: Safari WebKit stability focused
            echoCancellation: this.config.echoCancellation,
            noiseSuppression: this.config.noiseSuppression,
            autoGainControl: this.config.autoGainControl,
            // HOTFIX: Enhanced AGC disable for all platforms to prevent level drop
            ...window.chrome && {
              googAutoGainControl: !1,
              // Google AGC complete disable
              googNoiseSuppression: !1,
              // Google noise suppression disable
              googEchoCancellation: !1,
              // Google echo cancellation disable
              googHighpassFilter: !1,
              // Google highpass filter disable
              googTypingNoiseDetection: !1,
              // Typing noise detection disable
              googBeamforming: !1
              // Beamforming disable
            },
            // Mozilla-specific constraints
            ...navigator.userAgent.includes("Firefox") && {
              mozAutoGainControl: !1,
              // Mozilla AGC disable
              mozNoiseSuppression: !1
              // Mozilla noise suppression disable
            },
            // Safari compatibility: Explicit quality settings  
            sampleRate: this.config.sampleRate,
            channelCount: this.config.channelCount,
            sampleSize: 16,
            // Flexible device selection (Safari compatibility)
            deviceId: { ideal: "default" }
          }
        };
        console.log("🎤 [AudioManager] Getting MediaStream with Safari-compatible settings:", t), this.mediaStream = await navigator.mediaDevices.getUserMedia(t), console.log("✅ [AudioManager] MediaStream acquisition complete");
        const i = this.mediaStream.getAudioTracks()[0];
        if (i && typeof i.getConstraints == "function" && typeof i.getSettings == "function")
          try {
            const s = i.getConstraints(), n = i.getSettings();
            console.log("🔍 [DIAGNOSTIC] Requested autoGainControl:", t.audio && t.audio.autoGainControl), console.log("🔍 [DIAGNOSTIC] Actually applied constraints:", s), console.log("🔍 [DIAGNOSTIC] Actual MediaStream settings:", n), n.autoGainControl === !0 ? (console.warn("⚠️ [DIAGNOSTIC] CRITICAL: Browser ignored autoGainControl: false setting!"), console.warn("⚠️ [DIAGNOSTIC] This explains the gain drift issues - browser is automatically adjusting gain")) : console.log("✅ [DIAGNOSTIC] autoGainControl successfully disabled by browser");
          } catch {
            console.log("ℹ️ [DIAGNOSTIC] MediaTrack constraint inspection not available in this environment");
          }
        else
          console.log("ℹ️ [DIAGNOSTIC] MediaTrack constraint inspection not supported in this environment");
      }
      if (!this.sourceNode) {
        this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream), console.log("✅ [AudioManager] SourceNode creation complete");
        const e = this.mediaStream.getTracks();
        console.log("🎤 [AudioManager] MediaStream tracks:", e.map((t) => ({
          kind: t.kind,
          label: t.label,
          enabled: t.enabled,
          readyState: t.readyState,
          muted: t.muted
        })));
      }
      return this.gainNode || (this.gainNode = this.audioContext.createGain(), this.gainNode.gain.setValueAtTime(this.currentSensitivity, this.audioContext.currentTime), this.sourceNode.connect(this.gainNode), console.log(`✅ [AudioManager] GainNode creation complete (sensitivity: ${this.currentSensitivity}x)`)), this.isInitialized = !0, this.refCount++, this.lastError = null, console.log(`🎤 [AudioManager] Initialization complete (refCount: ${this.refCount})`), {
        audioContext: this.audioContext,
        mediaStream: this.mediaStream,
        sourceNode: this.sourceNode
      };
    } catch (e) {
      const t = this._createStructuredError(e, "initialization");
      throw T.logError(t, "AudioManager initialization"), this.lastError = t, this.isInitialized = !1, this._cleanup(), t;
    }
  }
  /**
   * Create dedicated AnalyserNode
   * @param id - Analyser identifier
   * @param options - Option settings
   */
  createAnalyser(e, t = {}) {
    if (!this.isInitialized || !this.audioContext || !this.sourceNode) {
      const h = new j(
        "AudioManagerが初期化されていません。initialize()メソッドを最初に呼び出してください。",
        {
          operation: "createAnalyser",
          analyserId: e,
          currentState: {
            isInitialized: this.isInitialized,
            hasAudioContext: !!this.audioContext,
            hasSourceNode: !!this.sourceNode
          }
        }
      );
      throw T.logError(h, "Analyser creation"), h;
    }
    this.removeAnalyser(e);
    const {
      fftSize: i = 2048,
      smoothingTimeConstant: s = 0.8,
      minDecibels: n = -90,
      maxDecibels: o = -10,
      useFilters: r = !0
    } = t, a = this.audioContext.createAnalyser();
    a.fftSize = Math.min(i, 2048), a.smoothingTimeConstant = Math.max(s, 0.7), a.minDecibels = Math.max(n, -80), a.maxDecibels = Math.min(o, -10);
    let c = this.gainNode || this.sourceNode;
    if (r) {
      const h = this._createFilterChain();
      this.filters.set(e, h), c.connect(h.highpass), h.highpass.connect(h.lowpass), h.lowpass.connect(h.notch), h.notch.connect(a), console.log(`🔧 [AudioManager] Filtered Analyser created: ${e}`);
    } else
      c.connect(a), console.log(`🔧 [AudioManager] Raw signal Analyser created: ${e}`);
    return this.analysers.set(e, a), a;
  }
  /**
   * Create 3-stage noise reduction filter chain
   */
  _createFilterChain() {
    if (!this.audioContext) {
      const s = new j(
        "AudioContextが利用できません。ブラウザでオーディオ機能が無効になっているか、デバイスがサポートされていません。",
        {
          operation: "_createFilterChain",
          audioContextState: "null"
        }
      );
      throw T.logError(s, "Filter chain creation"), s;
    }
    const e = this.audioContext.createBiquadFilter();
    e.type = "highpass", e.frequency.setValueAtTime(80, this.audioContext.currentTime), e.Q.setValueAtTime(0.7, this.audioContext.currentTime);
    const t = this.audioContext.createBiquadFilter();
    t.type = "lowpass", t.frequency.setValueAtTime(800, this.audioContext.currentTime), t.Q.setValueAtTime(0.7, this.audioContext.currentTime);
    const i = this.audioContext.createBiquadFilter();
    return i.type = "notch", i.frequency.setValueAtTime(60, this.audioContext.currentTime), i.Q.setValueAtTime(10, this.audioContext.currentTime), { highpass: e, lowpass: t, notch: i };
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
  removeAnalyser(e) {
    if (this.analysers.has(e) && (this.analysers.get(e).disconnect(), this.analysers.delete(e), console.log(`🗑️ [AudioManager] Analyser removed: ${e}`)), this.filters.has(e)) {
      const t = this.filters.get(e);
      t.highpass.disconnect(), t.lowpass.disconnect(), t.notch.disconnect(), this.filters.delete(e), console.log(`🗑️ [AudioManager] Filter chain removed: ${e}`);
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
  setSensitivity(e) {
    var i;
    const t = Math.max(0.1, Math.min(10, e));
    this.gainNode ? (this.gainNode.gain.setValueAtTime(t, ((i = this.audioContext) == null ? void 0 : i.currentTime) || 0), this.currentSensitivity = t, setTimeout(() => {
      if (!this.gainNode) return;
      const s = this.gainNode.gain.value, n = 0.1;
      if (Math.abs(s - t) > n) {
        const o = new w(
          `期待ゲイン(${t}x)が設定できませんでした。ブラウザのautoGainControlが有効になっている可能性があります。実際値: ${s}`,
          U.AUDIO_CONTEXT_ERROR,
          {
            operation: "setSensitivity_verification_critical",
            expectedGain: t,
            actualGain: s,
            driftAmount: Math.abs(s - t),
            tolerance: n,
            isCriticalFailure: !0,
            suggestion: "ブラウザ設定でautoGainControlを無効にするか、デバイス設定を確認してください"
          }
        );
        throw T.logError(o, "Critical gain setting failure"), o;
      } else
        console.log(`✅ [AudioManager] Gain setting verified: ${s.toFixed(1)}x (expected: ${t.toFixed(1)}x)`);
    }, 50), console.log(`🎤 [AudioManager] Microphone sensitivity updated: ${t.toFixed(1)}x`)) : (this.currentSensitivity = t, console.log(`🎤 [AudioManager] Microphone sensitivity set (awaiting initialization): ${t.toFixed(1)}x`));
  }
  /**
   * Get current microphone sensitivity
   */
  getSensitivity() {
    return this.currentSensitivity;
  }
  /**
   * HOTFIX: Start gain monitoring to prevent level drops
   * @deprecated Temporarily disabled in v1.1.4 due to browser compatibility issues
   * 
   * This method is preserved for future re-implementation with proper browser compatibility.
   * The gain monitoring caused 60% drift errors every 2 seconds in some environments.
   * Will be re-enabled once a more robust solution is developed.
   */
  /* private startGainMonitoring(): void {
    if (this.gainMonitorInterval) {
      clearInterval(this.gainMonitorInterval);
    }
    
    this.gainMonitorInterval = window.setInterval(() => {
      if (this.gainNode && this.audioContext) {
        const currentGainValue = this.gainNode.gain.value;
        const expectedGain = this.currentSensitivity;
        
        // Check for significant drift (more than 50% difference) - relaxed threshold
        if (Math.abs(currentGainValue - expectedGain) > expectedGain * 0.5) {
          const monitorError = new PitchProError(
            `ゲインモニタリングでドリフト検出: 期待値 ${expectedGain}, 現在値 ${currentGainValue}`,
            ErrorCode.AUDIO_CONTEXT_ERROR,
            {
              operation: 'gainMonitoring',
              expectedGain,
              currentGain: currentGainValue,
              driftPercentage: ((Math.abs(currentGainValue - expectedGain) / expectedGain) * 100).toFixed(1)
            }
          );
          
          ErrorMessageBuilder.logError(monitorError, 'Automatic gain monitoring');
          
          // Force reset to expected value
          this.gainNode.gain.setValueAtTime(expectedGain, this.audioContext.currentTime);
          console.log(`🔧 [AudioManager] Gain reset to: ${expectedGain}`);
        }
      }
    }, 2000); // Check every 2 seconds
  } */
  /**
   * HOTFIX: Stop gain monitoring
   */
  stopGainMonitoring() {
    this.gainMonitorInterval && (clearInterval(this.gainMonitorInterval), this.gainMonitorInterval = null);
  }
  /**
   * Get platform-specific settings according to specification
   * Complies with MICROPHONE_PLATFORM_SPECIFICATIONS.md
   */
  getPlatformSpecs() {
    const e = K.getDeviceSpecs();
    return {
      ...e,
      sensitivity: this.currentSensitivity || e.sensitivity
    };
  }
  /**
   * Decrement reference count and cleanup
   */
  release(e = []) {
    e.forEach((t) => this.removeAnalyser(t)), this.refCount = Math.max(0, this.refCount - 1), console.log(`📉 [AudioManager] Reference count decremented: ${this.refCount}`), this.refCount <= 0 && (console.log("🧹 [AudioManager] Starting full resource cleanup"), this._cleanup());
  }
  /**
   * Force cleanup (for emergency use)
   */
  forceCleanup() {
    console.log("🚨 [AudioManager] Force cleanup executed"), this._cleanup();
  }
  /**
   * Internal cleanup process
   */
  _cleanup() {
    var e;
    console.log("🧹 [AudioManager] Starting cleanup"), this.stopGainMonitoring();
    for (const t of this.analysers.keys())
      this.removeAnalyser(t);
    if (this.mediaStream) {
      const t = this.mediaStream.getTracks();
      console.log(`🛑 [AudioManager] Stopping MediaStream: ${t.length} tracks`), t.forEach((i, s) => {
        try {
          i.readyState !== "ended" ? (i.stop(), console.log(`🛑 [AudioManager] Track ${s} stop complete`)) : console.log(`⚠️ [AudioManager] Track ${s} already ended`);
        } catch (n) {
          const o = new w(
            `メディアトラック ${s} の停止中にエラーが発生しました: ${n.message}`,
            U.AUDIO_CONTEXT_ERROR,
            {
              operation: "track_cleanup",
              trackIndex: s,
              originalError: n.message,
              trackState: i.readyState
            }
          );
          T.logError(o, "Media track cleanup");
        }
      }), this.mediaStream = null;
    }
    if (this.audioContext && this.audioContext.state !== "closed") {
      try {
        this.audioContext.close(), console.log("🛑 [AudioManager] AudioContext close complete");
      } catch (t) {
        const i = new j(
          `AudioContextの終了中にエラーが発生しました: ${t.message}`,
          {
            operation: "audioContext_cleanup",
            contextState: (e = this.audioContext) == null ? void 0 : e.state,
            originalError: t.message
          }
        );
        T.logError(i, "AudioContext cleanup");
      }
      this.audioContext = null;
    }
    this.gainNode && (this.gainNode.disconnect(), this.gainNode = null), this.sourceNode && (this.sourceNode.disconnect(), this.sourceNode = null), this.isInitialized = !1, this.refCount = 0, this.initPromise = null, this.currentSensitivity = this._getDefaultSensitivity(), console.log("✅ [AudioManager] Cleanup complete");
  }
  /**
   * Creates structured error with enhanced context information
   * 
   * @private
   * @param error - Original error
   * @param operation - Operation that failed
   * @returns Structured PitchProError with context
   */
  _createStructuredError(e, t) {
    var i, s;
    return e.message.includes("Permission denied") || e.message.includes("NotAllowedError") || e.message.includes("permission") ? new be(
      "マイクへのアクセス許可が拒否されました。ブラウザの設定でマイクアクセスを許可してください。",
      {
        operation: t,
        originalError: e.message,
        deviceSpecs: this.getPlatformSpecs(),
        userAgent: typeof navigator < "u" ? navigator.userAgent : "unknown"
      }
    ) : e.message.includes("AudioContext") || e.message.includes("audio") || e.message.includes("context") ? new j(
      "オーディオシステムの初期化に失敗しました。デバイスの音響設定を確認するか、ブラウザを再起動してください。",
      {
        operation: t,
        originalError: e.message,
        audioContextState: ((i = this.audioContext) == null ? void 0 : i.state) || "none",
        sampleRate: ((s = this.audioContext) == null ? void 0 : s.sampleRate) || "unknown",
        deviceSpecs: this.getPlatformSpecs()
      }
    ) : new w(
      `${t}中に予期しないエラーが発生しました: ${e.message}`,
      U.AUDIO_CONTEXT_ERROR,
      {
        operation: t,
        originalError: e.message,
        stack: e.stack,
        currentState: {
          isInitialized: this.isInitialized,
          refCount: this.refCount,
          hasResources: !!(this.audioContext && this.mediaStream && this.sourceNode)
        }
      }
    );
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
    var e, t;
    return {
      isInitialized: this.isInitialized,
      refCount: this.refCount,
      audioContextState: ((e = this.audioContext) == null ? void 0 : e.state) || "none",
      mediaStreamActive: ((t = this.mediaStream) == null ? void 0 : t.active) || !1,
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
  checkMediaStreamHealth() {
    var s, n, o, r, a, c, h, f, d;
    if (!this.mediaStream)
      return {
        mediaStreamActive: !1,
        audioContextState: ((s = this.audioContext) == null ? void 0 : s.state) || "none",
        trackStates: [],
        healthy: !1
      };
    if (!this.mediaStream.active)
      return {
        mediaStreamActive: !1,
        audioContextState: ((n = this.audioContext) == null ? void 0 : n.state) || "none",
        trackStates: [],
        healthy: !1
      };
    const e = this.mediaStream.getTracks();
    if (e.length === 0)
      return {
        mediaStreamActive: this.mediaStream.active,
        audioContextState: ((o = this.audioContext) == null ? void 0 : o.state) || "none",
        trackStates: [],
        healthy: !1
      };
    const t = e.find((u) => u.kind === "audio");
    if (!t)
      return {
        mediaStreamActive: this.mediaStream.active,
        audioContextState: ((r = this.audioContext) == null ? void 0 : r.state) || "none",
        trackStates: e.map((u) => ({
          kind: u.kind,
          enabled: u.enabled,
          readyState: u.readyState,
          muted: u.muted
        })),
        healthy: !1
      };
    const i = e.map((u) => ({
      kind: u.kind,
      enabled: u.enabled,
      readyState: u.readyState,
      muted: u.muted
    }));
    return t.readyState === "ended" ? {
      mediaStreamActive: this.mediaStream.active,
      audioContextState: ((a = this.audioContext) == null ? void 0 : a.state) || "none",
      trackStates: i,
      healthy: !1
    } : t.enabled ? t.muted ? {
      mediaStreamActive: this.mediaStream.active,
      audioContextState: ((h = this.audioContext) == null ? void 0 : h.state) || "none",
      trackStates: i,
      healthy: !1
    } : this.mediaStream.active && t.readyState !== "live" ? {
      mediaStreamActive: this.mediaStream.active,
      audioContextState: ((f = this.audioContext) == null ? void 0 : f.state) || "none",
      trackStates: i,
      healthy: !1
    } : {
      mediaStreamActive: this.mediaStream.active,
      audioContextState: ((d = this.audioContext) == null ? void 0 : d.state) || "none",
      trackStates: i,
      healthy: !0,
      refCount: this.refCount
    } : {
      mediaStreamActive: this.mediaStream.active,
      audioContextState: ((c = this.audioContext) == null ? void 0 : c.state) || "none",
      trackStates: i,
      healthy: !1
    };
  }
}
function Ue(l) {
  return l && l.__esModule && Object.prototype.hasOwnProperty.call(l, "default") ? l.default : l;
}
function I(l) {
  if (this.size = l | 0, this.size <= 1 || this.size & this.size - 1)
    throw new Error("FFT size must be a power of two and bigger than 1");
  this._csize = l << 1;
  for (var e = new Array(this.size * 2), t = 0; t < e.length; t += 2) {
    const a = Math.PI * t / this.size;
    e[t] = Math.cos(a), e[t + 1] = -Math.sin(a);
  }
  this.table = e;
  for (var i = 0, s = 1; this.size > s; s <<= 1)
    i++;
  this._width = i % 2 === 0 ? i - 1 : i, this._bitrev = new Array(1 << this._width);
  for (var n = 0; n < this._bitrev.length; n++) {
    this._bitrev[n] = 0;
    for (var o = 0; o < this._width; o += 2) {
      var r = this._width - o - 2;
      this._bitrev[n] |= (n >>> o & 3) << r;
    }
  }
  this._out = null, this._data = null, this._inv = 0;
}
var Ge = I;
I.prototype.fromComplexArray = function(e, t) {
  for (var i = t || new Array(e.length >>> 1), s = 0; s < e.length; s += 2)
    i[s >>> 1] = e[s];
  return i;
};
I.prototype.createComplexArray = function() {
  const e = new Array(this._csize);
  for (var t = 0; t < e.length; t++)
    e[t] = 0;
  return e;
};
I.prototype.toComplexArray = function(e, t) {
  for (var i = t || this.createComplexArray(), s = 0; s < i.length; s += 2)
    i[s] = e[s >>> 1], i[s + 1] = 0;
  return i;
};
I.prototype.completeSpectrum = function(e) {
  for (var t = this._csize, i = t >>> 1, s = 2; s < i; s += 2)
    e[t - s] = e[s], e[t - s + 1] = -e[s + 1];
};
I.prototype.transform = function(e, t) {
  if (e === t)
    throw new Error("Input and output buffers must be different");
  this._out = e, this._data = t, this._inv = 0, this._transform4(), this._out = null, this._data = null;
};
I.prototype.realTransform = function(e, t) {
  if (e === t)
    throw new Error("Input and output buffers must be different");
  this._out = e, this._data = t, this._inv = 0, this._realTransform4(), this._out = null, this._data = null;
};
I.prototype.inverseTransform = function(e, t) {
  if (e === t)
    throw new Error("Input and output buffers must be different");
  this._out = e, this._data = t, this._inv = 1, this._transform4();
  for (var i = 0; i < e.length; i++)
    e[i] /= this.size;
  this._out = null, this._data = null;
};
I.prototype._transform4 = function() {
  var e = this._out, t = this._csize, i = this._width, s = 1 << i, n = t / s << 1, o, r, a = this._bitrev;
  if (n === 4)
    for (o = 0, r = 0; o < t; o += n, r++) {
      const g = a[r];
      this._singleTransform2(o, g, s);
    }
  else
    for (o = 0, r = 0; o < t; o += n, r++) {
      const g = a[r];
      this._singleTransform4(o, g, s);
    }
  var c = this._inv ? -1 : 1, h = this.table;
  for (s >>= 2; s >= 2; s >>= 2) {
    n = t / s << 1;
    var f = n >>> 2;
    for (o = 0; o < t; o += n)
      for (var d = o + f, u = o, m = 0; u < d; u += 2, m += s) {
        const g = u, y = g + f, v = y + f, S = v + f, A = e[g], p = e[g + 1], E = e[y], N = e[y + 1], P = e[v], _ = e[v + 1], z = e[S], k = e[S + 1], O = A, L = p, $ = h[m], H = c * h[m + 1], B = E * $ - N * H, V = E * H + N * $, C = h[2 * m], x = c * h[2 * m + 1], q = P * C - _ * x, Z = P * x + _ * C, ee = h[3 * m], te = c * h[3 * m + 1], ie = z * ee - k * te, se = z * te + k * ee, ne = O + q, W = L + Z, X = O - q, oe = L - Z, re = B + ie, J = V + se, Y = c * (B - ie), ae = c * (V - se), he = ne + re, fe = W + J, ge = ne - re, pe = W - J, ye = X + ae, ve = oe - Y, Se = X - ae, Ce = oe + Y;
        e[g] = he, e[g + 1] = fe, e[y] = ye, e[y + 1] = ve, e[v] = ge, e[v + 1] = pe, e[S] = Se, e[S + 1] = Ce;
      }
  }
};
I.prototype._singleTransform2 = function(e, t, i) {
  const s = this._out, n = this._data, o = n[t], r = n[t + 1], a = n[t + i], c = n[t + i + 1], h = o + a, f = r + c, d = o - a, u = r - c;
  s[e] = h, s[e + 1] = f, s[e + 2] = d, s[e + 3] = u;
};
I.prototype._singleTransform4 = function(e, t, i) {
  const s = this._out, n = this._data, o = this._inv ? -1 : 1, r = i * 2, a = i * 3, c = n[t], h = n[t + 1], f = n[t + i], d = n[t + i + 1], u = n[t + r], m = n[t + r + 1], g = n[t + a], y = n[t + a + 1], v = c + u, S = h + m, A = c - u, p = h - m, E = f + g, N = d + y, P = o * (f - g), _ = o * (d - y), z = v + E, k = S + N, O = A + _, L = p - P, $ = v - E, H = S - N, B = A - _, V = p + P;
  s[e] = z, s[e + 1] = k, s[e + 2] = O, s[e + 3] = L, s[e + 4] = $, s[e + 5] = H, s[e + 6] = B, s[e + 7] = V;
};
I.prototype._realTransform4 = function() {
  var e = this._out, t = this._csize, i = this._width, s = 1 << i, n = t / s << 1, o, r, a = this._bitrev;
  if (n === 4)
    for (o = 0, r = 0; o < t; o += n, r++) {
      const Me = a[r];
      this._singleRealTransform2(o, Me >>> 1, s >>> 1);
    }
  else
    for (o = 0, r = 0; o < t; o += n, r++) {
      const Me = a[r];
      this._singleRealTransform4(o, Me >>> 1, s >>> 1);
    }
  var c = this._inv ? -1 : 1, h = this.table;
  for (s >>= 2; s >= 2; s >>= 2) {
    n = t / s << 1;
    var f = n >>> 1, d = f >>> 1, u = d >>> 1;
    for (o = 0; o < t; o += n)
      for (var m = 0, g = 0; m <= u; m += 2, g += s) {
        var y = o + m, v = y + d, S = v + d, A = S + d, p = e[y], E = e[y + 1], N = e[v], P = e[v + 1], _ = e[S], z = e[S + 1], k = e[A], O = e[A + 1], L = p, $ = E, H = h[g], B = c * h[g + 1], V = N * H - P * B, C = N * B + P * H, x = h[2 * g], q = c * h[2 * g + 1], Z = _ * x - z * q, ee = _ * q + z * x, te = h[3 * g], ie = c * h[3 * g + 1], se = k * te - O * ie, ne = k * ie + O * te, W = L + Z, X = $ + ee, oe = L - Z, re = $ - ee, J = V + se, Y = C + ne, ae = c * (V - se), he = c * (C - ne), fe = W + J, ge = X + Y, pe = oe + he, ye = re - ae;
        if (e[y] = fe, e[y + 1] = ge, e[v] = pe, e[v + 1] = ye, m === 0) {
          var ve = W - J, Se = X - Y;
          e[S] = ve, e[S + 1] = Se;
          continue;
        }
        if (m !== u) {
          var Ce = oe, Ie = -re, Ne = W, Re = -X, Pe = -c * he, _e = -c * ae, qe = -c * Y, ze = -c * J, ke = Ce + Pe, Oe = Ie + _e, Le = Ne + ze, $e = Re - qe, Ae = o + d - m, Ee = o + f - m;
          e[Ae] = ke, e[Ae + 1] = Oe, e[Ee] = Le, e[Ee + 1] = $e;
        }
      }
  }
};
I.prototype._singleRealTransform2 = function(e, t, i) {
  const s = this._out, n = this._data, o = n[t], r = n[t + i], a = o + r, c = o - r;
  s[e] = a, s[e + 1] = 0, s[e + 2] = c, s[e + 3] = 0;
};
I.prototype._singleRealTransform4 = function(e, t, i) {
  const s = this._out, n = this._data, o = this._inv ? -1 : 1, r = i * 2, a = i * 3, c = n[t], h = n[t + i], f = n[t + r], d = n[t + a], u = c + f, m = c - f, g = h + d, y = o * (h - d), v = u + g, S = m, A = -y, p = u - g, E = m, N = y;
  s[e] = v, s[e + 1] = 0, s[e + 2] = S, s[e + 3] = A, s[e + 4] = p, s[e + 5] = 0, s[e + 6] = E, s[e + 7] = N;
};
const je = /* @__PURE__ */ Ue(Ge);
class ce {
  /**
   * Constructs a new {@link Autocorrelator} able to handle input arrays of the
   * given length.
   *
   * @param inputLength {number} the input array length to support. This
   * `Autocorrelator` will only support operation on arrays of this length.
   * @param bufferSupplier {(length: number) => T} the function to use for
   * creating buffers, accepting the length of the buffer to create and
   * returning a new buffer of that length. The values of the returned buffer
   * need not be initialized in any particular way.
   */
  constructor(e, t) {
    /** @private @readonly @type {number} */
    R(this, "_inputLength");
    /** @private @type {FFT} */
    R(this, "_fft");
    /** @private @type {(size: number) => T} */
    R(this, "_bufferSupplier");
    /** @private @type {T} */
    R(this, "_paddedInputBuffer");
    /** @private @type {T} */
    R(this, "_transformBuffer");
    /** @private @type {T} */
    R(this, "_inverseBuffer");
    if (e < 1)
      throw new Error("Input length must be at least one");
    this._inputLength = e, this._fft = new je(Je(2 * e)), this._bufferSupplier = t, this._paddedInputBuffer = this._bufferSupplier(this._fft.size), this._transformBuffer = this._bufferSupplier(2 * this._fft.size), this._inverseBuffer = this._bufferSupplier(2 * this._fft.size);
  }
  /**
   * A helper method to create an {@link Autocorrelator} using
   * {@link Float32Array} buffers.
   *
   * @param inputLength {number} the input array length to support
   * @returns {Autocorrelator<Float32Array>}
   */
  static forFloat32Array(e) {
    return new ce(
      e,
      (t) => new Float32Array(t)
    );
  }
  /**
   * A helper method to create an {@link Autocorrelator} using
   * {@link Float64Array} buffers.
   *
   * @param inputLength {number} the input array length to support
   * @returns {Autocorrelator<Float64Array>}
   */
  static forFloat64Array(e) {
    return new ce(
      e,
      (t) => new Float64Array(t)
    );
  }
  /**
   * A helper method to create an {@link Autocorrelator} using `number[]`
   * buffers.
   *
   * @param inputLength {number} the input array length to support
   * @returns {Autocorrelator<number[]>}
   */
  static forNumberArray(e) {
    return new ce(e, (t) => Array(t));
  }
  /**
   * Returns the supported input length.
   *
   * @returns {number} the supported input length
   */
  get inputLength() {
    return this._inputLength;
  }
  /**
   * Autocorrelates the given input data.
   *
   * @param input {ArrayLike<number>} the input data to autocorrelate
   * @param output {T} the output buffer into which to write the autocorrelated
   * data. If not provided, a new buffer will be created.
   * @returns {T} `output`
   */
  autocorrelate(e, t = this._bufferSupplier(e.length)) {
    if (e.length !== this._inputLength)
      throw new Error(
        `Input must have length ${this._inputLength} but had length ${e.length}`
      );
    for (let s = 0; s < e.length; s++)
      this._paddedInputBuffer[s] = e[s];
    for (let s = e.length; s < this._paddedInputBuffer.length; s++)
      this._paddedInputBuffer[s] = 0;
    this._fft.realTransform(this._transformBuffer, this._paddedInputBuffer), this._fft.completeSpectrum(this._transformBuffer);
    const i = this._transformBuffer;
    for (let s = 0; s < i.length; s += 2)
      i[s] = i[s] * i[s] + i[s + 1] * i[s + 1], i[s + 1] = 0;
    this._fft.inverseTransform(this._inverseBuffer, this._transformBuffer);
    for (let s = 0; s < e.length; s++)
      t[s] = this._inverseBuffer[2 * s];
    return t;
  }
}
function Qe(l) {
  const e = [];
  let t = !1, i = -1 / 0, s = -1;
  for (let n = 1; n < l.length - 1; n++)
    l[n - 1] <= 0 && l[n] > 0 ? (t = !0, s = n, i = l[n]) : l[n - 1] > 0 && l[n] <= 0 ? (t = !1, s !== -1 && e.push(s)) : t && l[n] > i && (i = l[n], s = n);
  return e;
}
function We(l, e) {
  const [t, i, s] = [l - 1, l, l + 1], [n, o, r] = [e[t], e[i], e[s]], a = n / 2 - o + r / 2, c = -(n / 2) * (i + s) + o * (t + s) - r / 2 * (t + i), h = n * i * s / 2 - o * t * s + r * t * i / 2, f = -c / (2 * a), d = a * f * f + c * f + h;
  return [f, d];
}
let Xe = class ue {
  /**
   * Constructs a new {@link PitchDetector} able to handle input arrays of the
   * given length.
   *
   * @param inputLength {number} the input array length to support. This
   * `PitchDetector` will only support operation on arrays of this length.
   * @param bufferSupplier {(inputLength: number) => T} the function to use for
   * creating buffers, accepting the length of the buffer to create and
   * returning a new buffer of that length. The values of the returned buffer
   * need not be initialized in any particular way.
   */
  constructor(e, t) {
    /** @private @type {Autocorrelator<T>} */
    R(this, "_autocorrelator");
    /** @private @type {T} */
    R(this, "_nsdfBuffer");
    /** @private @type {number} */
    R(this, "_clarityThreshold", 0.9);
    /** @private @type {number} */
    R(this, "_minVolumeAbsolute", 0);
    /** @private @type {number} */
    R(this, "_maxInputAmplitude", 1);
    this._autocorrelator = new ce(e, t), this._nsdfBuffer = t(e);
  }
  /**
   * A helper method to create an {@link PitchDetector} using {@link Float32Array} buffers.
   *
   * @param inputLength {number} the input array length to support
   * @returns {PitchDetector<Float32Array>}
   */
  static forFloat32Array(e) {
    return new ue(e, (t) => new Float32Array(t));
  }
  /**
   * A helper method to create an {@link PitchDetector} using {@link Float64Array} buffers.
   *
   * @param inputLength {number} the input array length to support
   * @returns {PitchDetector<Float64Array>}
   */
  static forFloat64Array(e) {
    return new ue(e, (t) => new Float64Array(t));
  }
  /**
   * A helper method to create an {@link PitchDetector} using `number[]` buffers.
   *
   * @param inputLength {number} the input array length to support
   * @returns {PitchDetector<number[]>}
   */
  static forNumberArray(e) {
    return new ue(e, (t) => Array(t));
  }
  /**
   * Returns the supported input length.
   *
   * @returns {number} the supported input length
   */
  get inputLength() {
    return this._autocorrelator.inputLength;
  }
  /**
   * Sets the clarity threshold used when identifying the correct pitch (the constant
   * `k` from the MPM paper). The value must be between 0 (exclusive) and 1
   * (inclusive), with the most suitable range being between 0.8 and 1.
   *
   * @param threshold {number} the clarity threshold
   */
  set clarityThreshold(e) {
    if (!Number.isFinite(e) || e <= 0 || e > 1)
      throw new Error("clarityThreshold must be a number in the range (0, 1]");
    this._clarityThreshold = e;
  }
  /**
   * Sets the minimum detectable volume, as an absolute number between 0 and
   * `maxInputAmplitude`, inclusive, to consider in a sample when detecting the
   * pitch. If a sample fails to meet this minimum volume, `findPitch` will
   * return a clarity of 0.
   *
   * Volume is calculated as the RMS (root mean square) of the input samples.
   *
   * @param volume {number} the minimum volume as an absolute amplitude value
   */
  set minVolumeAbsolute(e) {
    if (!Number.isFinite(e) || e < 0 || e > this._maxInputAmplitude)
      throw new Error(
        `minVolumeAbsolute must be a number in the range [0, ${this._maxInputAmplitude}]`
      );
    this._minVolumeAbsolute = e;
  }
  /**
   * Sets the minimum volume using a decibel measurement. Must be less than or
   * equal to 0: 0 indicates the loudest possible sound (see
   * `maxInputAmplitude`), -10 is a sound with a tenth of the volume of the
   * loudest possible sound, etc.
   *
   * Volume is calculated as the RMS (root mean square) of the input samples.
   *
   * @param db {number} the minimum volume in decibels, with 0 being the loudest
   * sound
   */
  set minVolumeDecibels(e) {
    if (!Number.isFinite(e) || e > 0)
      throw new Error("minVolumeDecibels must be a number <= 0");
    this._minVolumeAbsolute = this._maxInputAmplitude * 10 ** (e / 10);
  }
  /**
   * Sets the maximum amplitude of an input reading. Must be greater than 0.
   *
   * @param amplitude {number} the maximum amplitude (absolute value) of an input reading
   */
  set maxInputAmplitude(e) {
    if (!Number.isFinite(e) || e <= 0)
      throw new Error("maxInputAmplitude must be a number > 0");
    this._maxInputAmplitude = e;
  }
  /**
   * Returns the pitch detected using McLeod Pitch Method (MPM) along with a
   * measure of its clarity.
   *
   * The clarity is a value between 0 and 1 (potentially inclusive) that
   * represents how "clear" the pitch was. A clarity value of 1 indicates that
   * the pitch was very distinct, while lower clarity values indicate less
   * definite pitches.
   *
   * @param input {ArrayLike<number>} the time-domain input data
   * @param sampleRate {number} the sample rate at which the input data was
   * collected
   * @returns {[number, number]} the detected pitch, in Hz, followed by the
   * clarity. If a pitch cannot be determined from the input, such as if the
   * volume is too low (see `minVolumeAbsolute` and `minVolumeDecibels`), this
   * will be `[0, 0]`.
   */
  findPitch(e, t) {
    if (this._belowMinimumVolume(e)) return [0, 0];
    this._nsdf(e);
    const i = Qe(this._nsdfBuffer);
    if (i.length === 0)
      return [0, 0];
    const s = Math.max(...i.map((a) => this._nsdfBuffer[a])), n = i.find(
      (a) => this._nsdfBuffer[a] >= this._clarityThreshold * s
    ), [o, r] = We(
      // @ts-expect-error resultIndex is guaranteed to be defined
      n,
      this._nsdfBuffer
    );
    return [t / o, Math.min(r, 1)];
  }
  /**
   * Returns whether the input audio data is below the minimum volume allowed by
   * the pitch detector.
   *
   * @private
   * @param input {ArrayLike<number>}
   * @returns {boolean}
   */
  _belowMinimumVolume(e) {
    if (this._minVolumeAbsolute === 0) return !1;
    let t = 0;
    for (let i = 0; i < e.length; i++)
      t += e[i] ** 2;
    return Math.sqrt(t / e.length) < this._minVolumeAbsolute;
  }
  /**
   * Computes the NSDF of the input and stores it in the internal buffer. This
   * is equation (9) in the McLeod pitch method paper.
   *
   * @private
   * @param input {ArrayLike<number>}
   */
  _nsdf(e) {
    this._autocorrelator.autocorrelate(e, this._nsdfBuffer);
    let t = 2 * this._nsdfBuffer[0], i;
    for (i = 0; i < this._nsdfBuffer.length && t > 0; i++)
      this._nsdfBuffer[i] = 2 * this._nsdfBuffer[i] / t, t -= e[i] ** 2 + e[e.length - i - 1] ** 2;
    for (; i < this._nsdfBuffer.length; i++)
      this._nsdfBuffer[i] = 0;
  }
};
function Je(l) {
  return l--, l |= l >> 1, l |= l >> 2, l |= l >> 4, l |= l >> 8, l |= l >> 16, l++, l;
}
class Ye {
  // 推奨45FPS（22ms、音楽演奏に適切）
  constructor(e = 45) {
    this.lastFrameTime = 0, this.nextFrameTime = 0, this.frameDrops = 0, this.MIN_FPS = 30, this.MAX_FPS = 60, this.OPTIMAL_FPS = 45, this.targetFPS = Math.max(this.MIN_FPS, Math.min(e, this.MAX_FPS)), this.frameInterval = 1e3 / this.targetFPS;
  }
  shouldProcess() {
    const e = performance.now();
    return this.nextFrameTime === 0 ? (this.nextFrameTime = e + this.frameInterval, this.lastFrameTime = e, !0) : e >= this.nextFrameTime ? (e - this.lastFrameTime > this.frameInterval * 1.5 && (this.frameDrops++, this.adjustFrameRate()), this.nextFrameTime = e + this.frameInterval, this.lastFrameTime = e, !0) : !1;
  }
  // CPU負荷に応じて動的にFPSを調整
  adjustFrameRate() {
    if (this.frameDrops > 5 && this.targetFPS > this.MIN_FPS) {
      this.targetFPS = Math.max(this.MIN_FPS, this.targetFPS - 5), this.frameInterval = 1e3 / this.targetFPS, this.frameDrops = 0;
      const e = performance.now();
      this.nextFrameTime = e + this.frameInterval, console.log(`Adjusted FPS to ${this.targetFPS} due to high load`);
    }
  }
  // パフォーマンス回復時にFPSを戻す
  recoverPerformance() {
    if (this.frameDrops === 0 && this.targetFPS < this.OPTIMAL_FPS) {
      this.targetFPS = Math.min(this.OPTIMAL_FPS, this.targetFPS + 5), this.frameInterval = 1e3 / this.targetFPS;
      const e = performance.now();
      this.nextFrameTime = e + this.frameInterval;
    }
  }
  reset() {
    this.lastFrameTime = 0, this.nextFrameTime = 0, this.frameDrops = 0, this.targetFPS = this.OPTIMAL_FPS, this.frameInterval = 1e3 / this.targetFPS;
  }
  getStats() {
    return {
      currentFPS: this.targetFPS,
      frameDrops: this.frameDrops,
      latency: this.frameInterval
    };
  }
}
class Ke {
  /**
   * Creates a new PitchDetector instance with comprehensive configuration options
   * 
   * @description Initializes a high-performance pitch detection engine with configurable
   * harmonic correction, optimized volume history buffers, and device-specific optimizations.
   * The constructor applies sensible defaults while allowing fine-grained control over all
   * detection parameters and performance characteristics.
   * 
   * @param audioManager - AudioManager instance for resource management and audio context access
   * @param config - Optional configuration object to customize detection behavior
   * @param config.fftSize - FFT size for frequency analysis (default: 4096, recommended: 2048-8192)
   * @param config.smoothing - Smoothing factor for AnalyserNode (default: 0.1, range: 0-1)
   * @param config.clarityThreshold - Minimum clarity for valid detection (default: 0.4, range: 0-1)
   * @param config.minVolumeAbsolute - Minimum volume threshold (default: 0.003, range: 0.001-0.01)
   * @param config.harmonicCorrection - Harmonic correction configuration
   * @param config.harmonicCorrection.enabled - Enable octave jump correction (default: true)
   * @param config.harmonicCorrection.confidenceThreshold - Confidence required for correction (default: 0.7)
   * @param config.harmonicCorrection.historyWindow - Time window for harmonic analysis in ms (default: 1000)
   * @param config.harmonicCorrection.frequencyThreshold - Frequency difference threshold (default: 0.1)
   * @param config.volumeHistory - Volume history buffer configuration
   * @param config.volumeHistory.historyLength - Number of frames to average (default: 5)
   * @param config.volumeHistory.useTypedArray - Use TypedArray for better performance (default: true)
   * @param config.silenceDetection - Silence detection and timeout configuration
   * @param config.silenceDetection.enabled - Enable silence detection (default: false)
   * @param config.silenceDetection.warningThreshold - Warning timeout in ms (default: 15000)
   * @param config.silenceDetection.timeoutThreshold - Hard timeout in ms (default: 30000)
   * 
   * @example
   * ```typescript
   * // Minimal configuration (uses optimized defaults)
   * const pitchDetector = new PitchDetector(audioManager);
   * 
   * // Performance-optimized configuration for music applications
   * const pitchDetector = new PitchDetector(audioManager, {
   *   fftSize: 4096,           // Good balance of accuracy and performance
   *   clarityThreshold: 0.5,   // Higher threshold for cleaner detection
   *   minVolumeAbsolute: 0.002, // Sensitive to quiet sounds
   *   harmonicCorrection: {
   *     enabled: true,
   *     confidenceThreshold: 0.8, // Conservative octave correction
   *     historyWindow: 1500,       // Longer analysis window
   *     frequencyThreshold: 0.08   // Tighter frequency matching
   *   },
   *   volumeHistory: {
   *     historyLength: 7,      // More smoothing
   *     useTypedArray: true    // Maximum performance
   *   }
   * });
   * 
   * // Educational/debugging configuration
   * const pitchDetector = new PitchDetector(audioManager, {
   *   fftSize: 8192,           // High resolution for analysis
   *   clarityThreshold: 0.3,   // Lower threshold to see more detections
   *   harmonicCorrection: {
   *     enabled: false         // Disable to see raw algorithm output
   *   },
   *   volumeHistory: {
   *     historyLength: 3,      // Less smoothing for immediate response
   *     useTypedArray: false   // Standard arrays for easier debugging
   *   },
   *   silenceDetection: {
   *     enabled: true,
   *     warningThreshold: 10000, // 10 second warning
   *     timeoutThreshold: 20000  // 20 second timeout
   *   }
   * });
   * ```
   */
  constructor(e, t = {}) {
    this.pitchDetector = null, this.analyser = null, this.rawAnalyser = null, this.animationFrame = null, this.componentState = "uninitialized", this.isInitialized = !1, this.isDetecting = !1, this.lastError = null, this.analyserIds = [], this.currentVolume = 0, this.rawVolume = 0, this.currentFrequency = 0, this.detectedNote = "--", this.detectedOctave = null, this.pitchClarity = 0, this.volumeHistory = [], this.stableVolume = 0, this.previousFrequency = 0, this.harmonicHistory = [], this.disableHarmonicCorrection = !1, this.callbacks = {}, this.deviceSpecs = null, this.silenceStartTime = null, this.silenceWarningTimer = null, this.silenceTimeoutTimer = null, this.isSilent = !1, this.hasWarned = !1, this.audioManager = e, this.config = {
      fftSize: 4096,
      smoothing: 0.1,
      clarityThreshold: 0.4,
      // 0.8から0.4に現実的な値に変更
      minVolumeAbsolute: 8e-3,
      // v1.1.8: 雑音対策強化のため閾値上昇 (0.003→0.008)
      noiseGate: 0.02,
      // v1.1.8: デフォルトnoiseGate値
      deviceOptimization: !0,
      // v1.1.8: デバイス最適化デフォルト有効
      ...t
    }, this.harmonicConfig = {
      enabled: !0,
      confidenceThreshold: 0.7,
      historyWindow: 1e3,
      frequencyThreshold: 0.1,
      ...t.harmonicCorrection
    }, this.volumeHistoryConfig = {
      historyLength: 5,
      useTypedArray: !0,
      // Enable by default for better performance
      ...t.volumeHistory
    }, this.initializeVolumeHistory(), this.disableHarmonicCorrection = !this.harmonicConfig.enabled, this.silenceDetectionConfig = {
      enabled: !1,
      warningThreshold: 15e3,
      // 15秒で警告
      timeoutThreshold: 3e4,
      // 30秒でタイムアウト
      minVolumeThreshold: 0.01,
      // 消音判定の音量閾値
      ...t.silenceDetection
    }, this.frameRateLimiter = new Ye(45);
  }
  /**
   * Sets callback functions for pitch detection events
   * 
   * @description Configures event handlers for real-time pitch detection results,
   * errors, and state changes. Callbacks are called at the adaptive frame rate
   * (typically 30-60 FPS) during active detection.
   * 
   * @param callbacks - Object containing callback functions
   * @param callbacks.onPitchUpdate - Called when valid pitch is detected with frequency, note, clarity, and volume data
   * @param callbacks.onError - Called when recoverable or non-recoverable errors occur during detection
   * @param callbacks.onStateChange - Called when component transitions between states (uninitialized/ready/detecting/error)
   * 
   * @example
   * ```typescript
   * pitchDetector.setCallbacks({
   *   onPitchUpdate: (result) => {
   *     // Real-time pitch data (30-60 times per second)
   *     console.log(`Pitch: ${result.frequency.toFixed(2)}Hz`);
   *     console.log(`Note: ${result.note}, Octave: ${result.octave}`);
   *     console.log(`Clarity: ${(result.clarity * 100).toFixed(1)}%`);
   *     console.log(`Volume: ${result.volume.toFixed(1)}%`);
   *     
   *     // Cents deviation from perfect tuning
   *     if (result.cents !== undefined) {
   *       console.log(`Tuning: ${result.cents > 0 ? '+' : ''}${result.cents} cents`);
   *     }
   *   },
   *   onError: (error) => {
   *     console.error('Detection error:', error.message);
   *     
   *     // Handle specific error types
   *     if (error instanceof PitchDetectionError) {
   *       console.log('Pitch detection algorithm error - may be recoverable');
   *     } else if (error instanceof AudioContextError) {
   *       console.log('Audio system error - requires reinitialization');
   *     }
   *   },
   *   onStateChange: (state) => {
   *     console.log('Detection state changed to:', state);
   *     
   *     // React to state changes
   *     switch (state) {
   *       case 'ready':
   *         console.log('PitchDetector initialized and ready');
   *         break;
   *       case 'detecting':
   *         console.log('Active pitch detection started');
   *         break;
   *       case 'error':
   *         console.log('Error state - check error callback for details');
   *         break;
   *     }
   *   }
   * });
   * ```
   */
  setCallbacks(e) {
    this.callbacks = { ...this.callbacks, ...e };
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
  async initialize() {
    var e, t, i, s, n;
    try {
      this.componentState = "initializing", this.lastError = null, console.log("🎙️ [PitchDetector] Starting initialization via AudioManager"), await this.audioManager.initialize(), this.deviceSpecs = this.audioManager.getPlatformSpecs(), console.log("📱 [PitchDetector] Device specs initialized:", this.deviceSpecs.deviceType), console.log("✅ [PitchDetector] AudioManager resources acquired");
      const o = `pitch-detector-filtered-${Date.now()}`;
      this.analyser = this.audioManager.createAnalyser(o, {
        fftSize: this.config.fftSize,
        smoothingTimeConstant: this.config.smoothing,
        minDecibels: -90,
        maxDecibels: -10,
        useFilters: !0
      }), this.analyserIds.push(o);
      const r = `pitch-detector-raw-${Date.now()}`;
      this.rawAnalyser = this.audioManager.createAnalyser(r, {
        fftSize: this.config.fftSize,
        smoothingTimeConstant: this.config.smoothing,
        minDecibels: -90,
        maxDecibels: -10,
        useFilters: !1
      }), this.analyserIds.push(r), console.log("✅ [PitchDetector] Analysers created:", this.analyserIds), this.pitchDetector = Xe.forFloat32Array(this.analyser.fftSize), typeof process < "u" && ((e = process.env) == null ? void 0 : e.NODE_ENV) === "development" && console.log(`[Debug] Pitchyインスタンス作成: ${!!this.pitchDetector}, FFTサイズ: ${this.analyser.fftSize}`), this.componentState = "ready", this.isInitialized = !0, (i = (t = this.callbacks).onStateChange) == null || i.call(t, this.componentState), console.log("✅ [PitchDetector] Initialization complete");
    } catch (o) {
      const r = o instanceof w ? o : new j(
        "PitchDetector initialization failed",
        {
          originalError: o instanceof Error ? o.message : String(o),
          audioContextState: this.audioManager.getStatus().audioContextState,
          deviceSpecs: this.deviceSpecs
        }
      );
      throw console.error("❌ [PitchDetector] Initialization error:", r.toJSON()), this.componentState = "error", this.lastError = r, this.isInitialized = !1, (n = (s = this.callbacks).onError) == null || n.call(s, r), o;
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
  startDetection() {
    var e, t, i, s, n, o;
    if (this.componentState !== "ready") {
      const r = new Error(`Cannot start detection: component state is ${this.componentState}`);
      return (t = (e = this.callbacks).onError) == null || t.call(e, r), !1;
    }
    if (!this.analyser || !this.pitchDetector) {
      const r = new we(
        "ピッチ検出に必要なコンポーネントが初期化されていません。initialize()メソッドを先に呼び出してください。",
        {
          operation: "startDetection",
          hasAnalyser: !!this.analyser,
          hasPitchDetector: !!this.pitchDetector,
          componentState: this.componentState,
          isInitialized: this.isInitialized
        }
      );
      return T.logError(r, "Pitch detection startup"), this.componentState = "error", (s = (i = this.callbacks).onError) == null || s.call(i, r), !1;
    }
    return this.componentState = "detecting", this.isDetecting = !0, (o = (n = this.callbacks).onStateChange) == null || o.call(n, this.componentState), this.detectPitch(), !0;
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
  stopDetection() {
    var e, t;
    this.isDetecting = !1, this.animationFrame && (cancelAnimationFrame(this.animationFrame), this.animationFrame = null), this.frameRateLimiter.reset(), this.resetSilenceTracking(), this.componentState === "detecting" && this.isInitialized && (this.componentState = "ready", (t = (e = this.callbacks).onStateChange) == null || t.call(e, this.componentState));
  }
  /**
   * Real-time pitch detection loop with adaptive frame rate
   * @private
   * @description Main detection loop optimized for performance with minimal
   * redundant calculations and efficient buffer operations
   */
  detectPitch() {
    var N, P, _, z, k, O, L, $, H, B, V;
    const e = performance.now();
    if (!this.frameRateLimiter.shouldProcess()) {
      this.animationFrame = requestAnimationFrame(() => this.detectPitch());
      return;
    }
    if (typeof process < "u" && ((N = process.env) == null ? void 0 : N.NODE_ENV) === "development") {
      console.log(`[Debug] detectPitch呼び出し: detecting=${this.isDetecting}, analyser=${!!this.analyser}, rawAnalyser=${!!this.rawAnalyser}, pitchDetector=${!!this.pitchDetector}`);
      const C = this.audioManager.getStatus();
      console.log(`[Debug] AudioManager状態: context=${C.audioContextState}, stream=${C.mediaStreamActive}`);
    }
    if (!this.isDetecting || !this.analyser || !this.rawAnalyser || !this.pitchDetector || !this.deviceSpecs) return;
    const t = this.analyser.fftSize, i = new Float32Array(t), s = new Float32Array(this.rawAnalyser.fftSize);
    if (this.analyser.getFloatTimeDomainData(i), this.rawAnalyser.getFloatTimeDomainData(s), typeof process < "u" && ((P = process.env) == null ? void 0 : P.NODE_ENV) === "development") {
      const C = i.filter((q) => Math.abs(q) > 1e-4).length, x = Math.max(...i.map((q) => Math.abs(q)));
      console.log(`[Debug] バッファー分析: 非ゼロ値=${C}/${t}, 最大値=${x.toFixed(6)}`);
    }
    let n = 0;
    for (let C = 0; C < t; C++)
      n += Math.abs(i[C]);
    const o = Math.sqrt(n / t);
    typeof process < "u" && ((_ = process.env) == null ? void 0 : _.NODE_ENV) === "development" && console.log(`[Debug] RMS計算: sum=${n.toFixed(6)}, rms=${o.toFixed(6)}`);
    const r = this.deviceSpecs, a = o * r.gainCompensation, c = Math.max(0, Math.min(
      100,
      a * 100 / r.divisor * 25 - r.noiseThreshold
    ));
    typeof process < "u" && ((z = process.env) == null ? void 0 : z.NODE_ENV) === "development" && (console.log(`[Debug] 音量計算: rms=${o.toFixed(6)}, adjustedRms=${a.toFixed(6)}, volumePercent=${c.toFixed(2)}%`), console.log(`[Debug] プラットフォーム設定: gain=${r.gainCompensation}, divisor=${r.divisor}, noise=${r.noiseThreshold}`));
    let h = 0;
    for (let C = 0; C < s.length; C++)
      h += Math.abs(s[C]);
    const f = Math.sqrt(h / s.length), d = Math.max(0, Math.min(
      100,
      f * r.gainCompensation * 100 / r.divisor * 25 - r.noiseThreshold
    ));
    this.addToVolumeHistory(c), this.stableVolume = this.calculateVolumeAverage(), this.currentVolume = this.stableVolume, this.rawVolume = d;
    const u = 44100;
    let m = 0, g = 0;
    try {
      const C = this.pitchDetector.findPitch(i, u);
      m = C[0] || 0, g = C[1] || 0;
    } catch (C) {
      const x = new we(
        "Pitch detection algorithm failed",
        {
          bufferLength: i.length,
          sampleRate: u,
          volume: this.currentVolume,
          originalError: C instanceof Error ? C.message : String(C)
        }
      );
      if (console.warn("⚠️ [PitchDetector] Pitch detection error (recoverable):", x.toJSON()), xe(x))
        m = 0, g = 0;
      else {
        (O = (k = this.callbacks).onError) == null || O.call(k, x);
        return;
      }
    }
    typeof process < "u" && ((L = process.env) == null ? void 0 : L.NODE_ENV) === "development" && (console.log(`[Debug] Pitchy結果: pitch=${(m == null ? void 0 : m.toFixed(1)) || "null"}, clarity=${(g == null ? void 0 : g.toFixed(3)) || "null"}, volume=${($ = this.currentVolume) == null ? void 0 : $.toFixed(1)}%, sampleRate=${u.toString()}`), console.log(`[Debug] Pitchyバッファー: 最初5要素=${Array.from(i.slice(0, 5)).map((C) => C.toFixed(6)).join(", ")}`));
    const y = m >= 65 && m <= 1200;
    if (typeof process < "u" && ((H = process.env) == null ? void 0 : H.NODE_ENV) === "development" && console.log(`[Debug] 判定条件: pitch=${!!m}, clarity=${g == null ? void 0 : g.toFixed(3)}>${this.config.clarityThreshold}, volume=${(B = this.currentVolume) == null ? void 0 : B.toFixed(1)}>0.4, range=${y}`), m && g > this.config.clarityThreshold && this.currentVolume > 0.4 && y) {
      let C = m;
      if (!this.disableHarmonicCorrection) {
        const q = Math.min(this.currentVolume / 100, 1);
        C = this.correctHarmonic(m, q);
      }
      this.currentFrequency = C;
      const x = this.frequencyToNoteAndOctave(this.currentFrequency);
      this.detectedNote = x.note, this.detectedOctave = x.octave, this.pitchClarity = g;
    } else
      this.currentFrequency === 0 && this.resetHarmonicHistory(), this.currentFrequency = 0, this.detectedNote = "--", this.detectedOctave = null, this.pitchClarity = 0;
    const v = this.currentFrequency > 0 ? this.rawVolume : 0;
    this.processSilenceDetection(this.currentVolume);
    const S = {
      frequency: this.currentFrequency,
      note: this.detectedNote,
      octave: this.detectedOctave || void 0,
      clarity: this.pitchClarity,
      volume: v,
      cents: this.currentFrequency > 0 ? this.frequencyToCents(this.currentFrequency) : void 0
    };
    this.processAudioData(S), this.updateVisuals(S);
    const p = performance.now() - e;
    this.frameRateLimiter.getStats().frameDrops === 0 && this.frameRateLimiter.recoverPerformance(), typeof process < "u" && ((V = process.env) == null ? void 0 : V.NODE_ENV) === "development" && p > 16.67 && console.warn(`[PitchDetector] Frame processing took ${p.toFixed(2)}ms (>16.67ms threshold)`), this.animationFrame = requestAnimationFrame(() => this.detectPitch());
  }
  /**
   * Harmonic correction system with configurable parameters
   * 
   * @private
   * @description Analyzes frequency history to detect and correct harmonic errors
   * like octave jumping. Uses configurable confidence thresholds and time windows
   * to balance correction accuracy with responsiveness.
   * 
   * @param frequency - The detected frequency to potentially correct
   * @param volume - The current volume level for confidence calculation
   * @returns The corrected frequency or original if no correction needed
   */
  correctHarmonic(e, t) {
    var r, a;
    if (!this.harmonicConfig.enabled)
      return this.previousFrequency = e, e;
    const i = Date.now();
    this.harmonicHistory = this.harmonicHistory.filter(
      (c) => i - c.timestamp < this.harmonicConfig.historyWindow
    );
    const s = Math.min(t * 1.5, 1), n = this.previousFrequency > 0 ? Math.max(0, 1 - Math.abs(e - this.previousFrequency) / this.previousFrequency) : 0.5, o = (s + n) / 2;
    if (this.harmonicHistory.push({ frequency: e, confidence: o, timestamp: i }), this.harmonicHistory.length >= 3) {
      const c = this.harmonicHistory.slice(-5), h = c.reduce((m, g) => m + g.frequency, 0) / c.length, f = c.reduce((m, g) => m + g.confidence, 0) / c.length, d = e / 2;
      if (Math.abs(d - h) / h < this.harmonicConfig.frequencyThreshold && f > this.harmonicConfig.confidenceThreshold)
        return typeof process < "u" && ((r = process.env) == null ? void 0 : r.NODE_ENV) === "development" && console.log(`🔧 [PitchDetector] Octave correction: ${e.toFixed(1)}Hz → ${d.toFixed(1)}Hz`), this.previousFrequency = d, d;
      const u = e * 2;
      if (Math.abs(u - h) / h < this.harmonicConfig.frequencyThreshold && f > this.harmonicConfig.confidenceThreshold)
        return typeof process < "u" && ((a = process.env) == null ? void 0 : a.NODE_ENV) === "development" && console.log(`🔧 [PitchDetector] Octave up correction: ${e.toFixed(1)}Hz → ${u.toFixed(1)}Hz`), this.previousFrequency = u, u;
    }
    return this.previousFrequency = e, e;
  }
  /**
   * Reset harmonic correction history and frequency tracking
   * 
   * @private
   * @description Clears the frequency history buffer used for harmonic correction
   * and resets the previous frequency reference. Called when signal quality is poor
   * or when restarting detection to prevent incorrect corrections.
   */
  resetHarmonicHistory() {
    this.harmonicHistory = [], this.previousFrequency = 0;
  }
  /**
   * Convert frequency to musical note name and octave number
   * 
   * @private
   * @description Converts a frequency in Hz to standard musical notation using
   * equal temperament tuning (A4 = 440Hz). Calculates semitone distances
   * and maps to chromatic scale positions.
   * 
   * @param frequency - Input frequency in Hz
   * @returns Object containing note name (C, C#, D, etc.) and octave number
   * 
   * @example
   * ```typescript
   * frequencyToNoteAndOctave(440) // { note: 'A', octave: 4 }
   * frequencyToNoteAndOctave(261.63) // { note: 'C', octave: 4 }
   * ```
   */
  frequencyToNoteAndOctave(e) {
    const t = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    if (e <= 0) return { note: "--", octave: null };
    const s = Math.round(12 * Math.log2(e / 440)), n = (s + 9 + 120) % 12, o = Math.floor((s + 9) / 12) + 4;
    return { note: t[n], octave: o };
  }
  /**
   * Convert frequency to cents deviation from the nearest semitone
   * 
   * @private
   * @description Calculates the pitch deviation in cents (1/100th of a semitone)
   * from the nearest equal temperament note. Positive values indicate sharp,
   * negative values indicate flat.
   * 
   * @param frequency - Input frequency in Hz
   * @returns Cents deviation (-50 to +50 cents from nearest note)
   * 
   * @example
   * ```typescript
   * frequencyToCents(440) // 0 (exactly A4)
   * frequencyToCents(446) // ~25 cents sharp
   * frequencyToCents(435) // ~-20 cents flat
   * ```
   */
  frequencyToCents(e) {
    const i = 12 * Math.log2(e / 440), s = Math.round(i), n = (i - s) * 100;
    return Math.round(n);
  }
  /**
   * Process silence detection logic and manage timeout handlers
   * 
   * @private
   * @description Monitors volume levels to detect periods of silence and triggers
   * appropriate warnings and timeouts. Manages silence detection state and timers
   * to provide automatic recovery from idle states.
   * 
   * @param currentVolume - Current volume level to evaluate for silence
   */
  processSilenceDetection(e) {
    if (!this.silenceDetectionConfig.enabled)
      return;
    const t = Date.now(), i = this.silenceDetectionConfig.minVolumeThreshold || 0.01;
    if (e < i)
      this.isSilent || (this.isSilent = !0, this.silenceStartTime = t, this.hasWarned = !1, console.log("🔇 [PitchDetector] Silence detected, starting timer"), this.silenceDetectionConfig.warningThreshold && (this.silenceWarningTimer = window.setTimeout(() => {
        this.handleSilenceWarning();
      }, this.silenceDetectionConfig.warningThreshold)), this.silenceDetectionConfig.timeoutThreshold && (this.silenceTimeoutTimer = window.setTimeout(() => {
        this.handleSilenceTimeout();
      }, this.silenceDetectionConfig.timeoutThreshold)));
    else if (this.isSilent) {
      const n = this.silenceStartTime ? t - this.silenceStartTime : 0;
      console.log(`🔊 [PitchDetector] Voice recovered after ${n}ms of silence`), this.resetSilenceTracking(), this.silenceDetectionConfig.onSilenceRecovered && this.silenceDetectionConfig.onSilenceRecovered();
    }
  }
  /**
   * Handle silence warning
   */
  handleSilenceWarning() {
    if (!this.hasWarned && this.silenceStartTime) {
      const e = Date.now() - this.silenceStartTime;
      this.hasWarned = !0, console.log(`⚠️ [PitchDetector] Silence warning: ${e}ms`), this.silenceDetectionConfig.onSilenceWarning && this.silenceDetectionConfig.onSilenceWarning(e);
    }
  }
  /**
   * Handle silence timeout
   */
  handleSilenceTimeout() {
    console.log("⏰ [PitchDetector] Silence timeout reached"), this.silenceDetectionConfig.onSilenceTimeout && this.silenceDetectionConfig.onSilenceTimeout(), this.stopDetection(), this.resetSilenceTracking();
  }
  /**
   * Reset silence tracking state
   */
  resetSilenceTracking() {
    this.isSilent = !1, this.silenceStartTime = null, this.hasWarned = !1, this.silenceWarningTimer && (clearTimeout(this.silenceWarningTimer), this.silenceWarningTimer = null), this.silenceTimeoutTimer && (clearTimeout(this.silenceTimeoutTimer), this.silenceTimeoutTimer = null);
  }
  /**
   * Reset display state
   */
  resetDisplayState() {
    this.currentVolume = 0, this.rawVolume = 0, this.currentFrequency = 0, this.detectedNote = "--", this.detectedOctave = null, this.pitchClarity = 0, this.stableVolume = 0, this.initializeVolumeHistory(), this.resetHarmonicHistory(), this.resetSilenceTracking(), console.log("🔄 [PitchDetector] Display state reset");
  }
  /**
   * Enable/disable harmonic correction
   */
  setHarmonicCorrectionEnabled(e) {
    this.disableHarmonicCorrection = !e, e || this.resetHarmonicHistory();
  }
  /**
   * Update silence detection configuration
   */
  setSilenceDetectionConfig(e) {
    this.silenceDetectionConfig = {
      ...this.silenceDetectionConfig,
      ...e
    }, this.silenceDetectionConfig.enabled || this.resetSilenceTracking(), console.log("🔇 [PitchDetector] Silence detection config updated:", this.silenceDetectionConfig);
  }
  /**
   * Get current silence detection status
   */
  getSilenceStatus() {
    const e = this.silenceStartTime && this.isSilent ? Date.now() - this.silenceStartTime : null;
    return {
      isEnabled: this.silenceDetectionConfig.enabled || !1,
      isSilent: this.isSilent,
      silenceDuration: e,
      hasWarned: this.hasWarned
    };
  }
  /**
   * Get initialization status
   */
  getIsInitialized() {
    return this.isInitialized && this.componentState === "ready";
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
  getCurrentResult() {
    return {
      frequency: this.currentFrequency,
      note: this.detectedNote,
      clarity: this.pitchClarity,
      volume: this.currentFrequency > 0 ? this.rawVolume : 0
    };
  }
  /**
   * Process audio data with high priority for real-time callback delivery
   * 
   * @private
   * @description Handles critical audio processing that requires low latency.
   * Runs at the full adaptive frame rate (30-60 FPS) to ensure responsive
   * pitch detection callbacks for real-time applications.
   * 
   * @param result - Complete pitch detection result to process
   */
  processAudioData(e) {
    var t, i;
    (i = (t = this.callbacks).onPitchUpdate) == null || i.call(t, e);
  }
  /**
   * Update visual elements with lower priority rendering
   * 
   * @private
   * @description Handles visual updates that can be throttled to maintain performance.
   * Visual rendering can be limited to 30 FPS without affecting audio processing quality.
   * The underscore prefix indicates intentional parameter non-use.
   * 
   * @param _result - Pitch detection result (unused, handled by UI layer)
   */
  updateVisuals(e) {
  }
  /**
   * Get current performance statistics
   */
  getPerformanceStats() {
    return this.frameRateLimiter.getStats();
  }
  /**
   * Reinitialize detector
   */
  async reinitialize() {
    console.log("🔄 [PitchDetector] Starting reinitialization"), this.cleanup(), await new Promise((e) => setTimeout(e, 100)), await this.initialize(), console.log("✅ [PitchDetector] Reinitialization complete");
  }
  /**
   * Cleanup resources
   */
  cleanup() {
    console.log("🧹 [PitchDetector] Starting cleanup"), this.stopDetection(), this.analyserIds.length > 0 && (this.audioManager.release(this.analyserIds), console.log("📤 [PitchDetector] Notified AudioManager of Analyser release:", this.analyserIds), this.analyserIds = []), this.componentState = "uninitialized", this.isInitialized = !1, this.lastError = null, this.analyser = null, this.rawAnalyser = null, this.pitchDetector = null, this.initializeVolumeHistory(), this.resetHarmonicHistory(), console.log("✅ [PitchDetector] Cleanup complete");
  }
  /**
   * Gets the latest pitch detection result without triggering new analysis
   * 
   * @description Returns the most recent detection result from the ongoing analysis.
   * Useful for UI updates and external monitoring without affecting detection performance.
   * 
   * @returns Latest pitch detection result or null if no detection is active
   * 
   * @example
   * ```typescript
   * const result = pitchDetector.getLatestResult();
   * if (result) {
   *   console.log(`Latest: ${result.note} - ${result.frequency.toFixed(1)}Hz`);
   *   console.log(`Volume: ${result.volume.toFixed(1)}%, Clarity: ${result.clarity.toFixed(2)}`);
   * }
   * ```
   */
  getLatestResult() {
    return !this.isDetecting || this.componentState !== "detecting" ? null : {
      frequency: this.currentFrequency,
      note: this.detectedNote,
      octave: this.detectedOctave ?? 0,
      volume: this.currentVolume,
      rawVolume: this.rawVolume,
      clarity: this.pitchClarity,
      timestamp: Date.now()
    };
  }
  /**
   * Destroys the PitchDetector and cleans up all resources
   * 
   * @example
   * ```typescript
   * pitchDetector.destroy();
   * console.log('PitchDetector destroyed and resources cleaned up');
   * ```
   */
  destroy() {
    this.stopDetection(), this.analyserIds.length > 0 && (this.audioManager.release(this.analyserIds), console.log("📤 [PitchDetector] Notified AudioManager of Analyser release:", this.analyserIds), this.analyserIds = []), this.componentState = "uninitialized", this.isInitialized = !1, this.lastError = null, this.analyser = null;
  }
  /**
   * Gets current PitchDetector status for debugging and monitoring
   * 
   * @returns Status object with component state and performance metrics
   */
  getStatus() {
    var e;
    return {
      componentState: this.componentState,
      isInitialized: this.isInitialized,
      isDetecting: this.isDetecting,
      isRunning: this.isDetecting,
      currentVolume: this.currentVolume,
      rawVolume: this.rawVolume,
      currentFrequency: this.currentFrequency,
      detectedNote: this.detectedNote,
      detectedOctave: this.detectedOctave,
      currentClarity: this.pitchClarity,
      lastError: this.lastError,
      frameRateStatus: (e = this.frameRateLimiter) == null ? void 0 : e.getStats(),
      deviceSpecs: this.deviceSpecs,
      hasRequiredComponents: !!(this.analyser && this.pitchDetector),
      harmonicConfig: this.harmonicConfig,
      volumeHistoryConfig: this.volumeHistoryConfig
    };
  }
  /**
   * Initialize volume history buffer based on configuration
   * 
   * @private
   * @description Creates either a regular array or TypedArray buffer based on config
   */
  initializeVolumeHistory() {
    const e = this.volumeHistoryConfig.historyLength;
    this.volumeHistoryConfig.useTypedArray ? this.volumeHistory = new Float32Array(e) : this.volumeHistory = new Array(e).fill(0);
  }
  /**
   * Add new volume value to history buffer with efficient circular buffer operation
   * 
   * @private
   * @param volume - Volume value to add to history
   */
  addToVolumeHistory(e) {
    this.volumeHistory instanceof Float32Array ? (this.volumeHistory.copyWithin(0, 1), this.volumeHistory[this.volumeHistory.length - 1] = e) : (this.volumeHistory.push(e), this.volumeHistory.length > this.volumeHistoryConfig.historyLength && this.volumeHistory.shift());
  }
  /**
   * Calculate average volume from history buffer
   * 
   * @private
   * @returns Average volume value
   */
  calculateVolumeAverage() {
    if (this.volumeHistory instanceof Float32Array) {
      let e = 0;
      for (let t = 0; t < this.volumeHistory.length; t++)
        e += this.volumeHistory[t];
      return e / this.volumeHistory.length;
    } else
      return this.volumeHistory.reduce((e, t) => e + t, 0) / this.volumeHistory.length;
  }
  /**
   * Update harmonic correction configuration
   * 
   * @param config - Partial harmonic correction configuration to update
   */
  updateHarmonicConfig(e) {
    var t;
    this.harmonicConfig = { ...this.harmonicConfig, ...e }, this.resetHarmonicHistory(), typeof process < "u" && ((t = process.env) == null ? void 0 : t.NODE_ENV) === "development" && console.log("🔧 [PitchDetector] Harmonic correction config updated:", this.harmonicConfig);
  }
  /**
   * Update volume history configuration
   * 
   * @param config - Partial volume history configuration to update
   */
  updateVolumeHistoryConfig(e) {
    var t;
    this.volumeHistoryConfig = { ...this.volumeHistoryConfig, ...e }, this.initializeVolumeHistory(), typeof process < "u" && ((t = process.env) == null ? void 0 : t.NODE_ENV) === "development" && console.log("📊 [PitchDetector] Volume history config updated:", this.volumeHistoryConfig);
  }
}
class st {
  /**
   * Creates a new NoiseFilter with configurable 3-stage filtering
   * 
   * @param audioContext - Web Audio API AudioContext instance
   * @param config - Optional filter configuration to override defaults
   * @param config.highpassFreq - Highpass cutoff frequency in Hz (default: 80)
   * @param config.lowpassFreq - Lowpass cutoff frequency in Hz (default: 800)  
   * @param config.notchFreq - Notch filter center frequency in Hz (default: 60)
   * @param config.highpassQ - Highpass filter Q factor (default: 0.7)
   * @param config.lowpassQ - Lowpass filter Q factor (default: 0.7)
   * @param config.notchQ - Notch filter Q factor (default: 10.0)
   * @param config.useFilters - Enable/disable entire filter chain (default: true)
   * 
   * @example
   * ```typescript
   * // Standard voice filtering
   * const voiceFilter = new NoiseFilter(audioContext);
   * 
   * // Custom instrument filtering  
   * const instrumentFilter = new NoiseFilter(audioContext, {
   *   highpassFreq: 60,   // Allow deeper frequencies
   *   lowpassFreq: 2000,  // Extended harmonic range
   *   notchQ: 20.0        // Sharper power line rejection
   * });
   * 
   * // Bypass filtering
   * const bypassFilter = new NoiseFilter(audioContext, {
   *   useFilters: false
   * });
   * ```
   */
  constructor(e, t = {}) {
    this.highpassFilter = null, this.lowpassFilter = null, this.notchFilter = null, this.isConnected = !1, this.inputNode = null, this.outputNode = null, this.audioContext = e, this.config = {
      highpassFreq: 80,
      lowpassFreq: 800,
      notchFreq: 60,
      highpassQ: 0.7,
      lowpassQ: 0.7,
      notchQ: 10,
      useFilters: !0,
      ...t
    }, this.createFilterChain();
  }
  /**
   * Create the 3-stage filter chain
   */
  createFilterChain() {
    if (!this.config.useFilters) {
      console.log("🔇 [NoiseFilter] Filters disabled - bypassing filter chain");
      return;
    }
    try {
      this.highpassFilter = this.audioContext.createBiquadFilter(), this.highpassFilter.type = "highpass", this.highpassFilter.frequency.setValueAtTime(this.config.highpassFreq, this.audioContext.currentTime), this.highpassFilter.Q.setValueAtTime(this.config.highpassQ, this.audioContext.currentTime), this.lowpassFilter = this.audioContext.createBiquadFilter(), this.lowpassFilter.type = "lowpass", this.lowpassFilter.frequency.setValueAtTime(this.config.lowpassFreq, this.audioContext.currentTime), this.lowpassFilter.Q.setValueAtTime(this.config.lowpassQ, this.audioContext.currentTime), this.notchFilter = this.audioContext.createBiquadFilter(), this.notchFilter.type = "notch", this.notchFilter.frequency.setValueAtTime(this.config.notchFreq, this.audioContext.currentTime), this.notchFilter.Q.setValueAtTime(this.config.notchQ, this.audioContext.currentTime), console.log("✅ [NoiseFilter] 3-stage filter chain created", {
        highpass: `${this.config.highpassFreq}Hz (Q=${this.config.highpassQ})`,
        lowpass: `${this.config.lowpassFreq}Hz (Q=${this.config.lowpassQ})`,
        notch: `${this.config.notchFreq}Hz (Q=${this.config.notchQ})`
      });
    } catch (e) {
      const t = new j(
        "ノイズフィルターチェーンの初期化に失敗しました。オーディオシステムのサポート状況を確認してください。",
        {
          operation: "createFilterChain",
          originalError: e.message,
          filterConfig: this.config,
          audioContextState: this.audioContext.state,
          sampleRate: this.audioContext.sampleRate
        }
      );
      throw T.logError(t, "NoiseFilter initialization"), console.error("❌ [NoiseFilter] Failed to create filter chain:", t.toJSON()), t;
    }
  }
  /**
   * Connects the filter chain between input and output nodes in audio processing pipeline
   * 
   * @description Creates audio connections through the 3-stage filter chain or bypasses
   * if filtering is disabled. Handles both inline filtering and return-node patterns.
   * 
   * @param inputNode - Source audio node (e.g., MediaStreamAudioSourceNode)
   * @param outputNode - Optional destination node (e.g., AnalyserNode)
   * @returns The final output node in the chain for further connections
   * 
   * @example
   * ```typescript
   * // Direct connection pattern
   * sourceNode.connect(noiseFilter.connect(inputNode, analyserNode));
   * 
   * // Chain connection pattern
   * const filteredNode = noiseFilter.connect(sourceNode);
   * filteredNode.connect(analyserNode);
   * 
   * // Bypass mode (useFilters: false)
   * const passthroughNode = noiseFilter.connect(sourceNode, analyserNode);
   * ```
   */
  connect(e, t) {
    if (!this.config.useFilters)
      return t && e.connect(t), e;
    if (!this.highpassFilter || !this.lowpassFilter || !this.notchFilter) {
      const i = new w(
        "ノイズフィルターが正しく初期化されていません。コンストラクタでuseFilters: trueで初期化してください。",
        U.AUDIO_CONTEXT_ERROR,
        {
          operation: "connect",
          useFilters: this.config.useFilters,
          hasHighpassFilter: !!this.highpassFilter,
          hasLowpassFilter: !!this.lowpassFilter,
          hasNotchFilter: !!this.notchFilter
        }
      );
      throw T.logError(i, "NoiseFilter connection"), i;
    }
    try {
      return this.disconnect(), this.inputNode = e, this.outputNode = t || null, e.connect(this.highpassFilter), this.highpassFilter.connect(this.lowpassFilter), this.lowpassFilter.connect(this.notchFilter), t && this.notchFilter.connect(t), this.isConnected = !0, console.log("🔗 [NoiseFilter] Filter chain connected"), this.notchFilter;
    } catch (i) {
      const s = new j(
        "ノイズフィルターの接続に失敗しました。オーディオノードの接続状態を確認してください。",
        {
          operation: "connect",
          originalError: i.message,
          hasInputNode: !!this.inputNode,
          hasOutputNode: !!this.outputNode,
          isConnected: this.isConnected,
          filterConfig: this.config
        }
      );
      throw T.logError(s, "NoiseFilter audio connection"), console.error("❌ [NoiseFilter] Connection failed:", s.toJSON()), s;
    }
  }
  /**
   * Disconnects all filter nodes and cleans up audio connections
   * 
   * @description Safely disconnects all filter nodes in the chain and resets
   * connection state. Safe to call multiple times.
   * 
   * @example
   * ```typescript
   * // Clean up when finished
   * noiseFilter.disconnect();
   * console.log('Filter chain disconnected');
   * ```
   */
  disconnect() {
    try {
      this.highpassFilter && this.highpassFilter.disconnect(), this.lowpassFilter && this.lowpassFilter.disconnect(), this.notchFilter && this.notchFilter.disconnect(), this.isConnected = !1, this.inputNode = null, this.outputNode = null, console.log("🔌 [NoiseFilter] Filter chain disconnected");
    } catch (e) {
      console.warn("⚠️ [NoiseFilter] Disconnect warning:", e);
    }
  }
  /**
   * Updates filter parameters dynamically during runtime
   * 
   * @param params - Object containing new filter parameters
   * @param params.highpassFreq - New highpass cutoff frequency in Hz
   * @param params.lowpassFreq - New lowpass cutoff frequency in Hz
   * @param params.notchFreq - New notch filter center frequency in Hz
   * @param params.highpassQ - New highpass filter Q factor
   * @param params.lowpassQ - New lowpass filter Q factor  
   * @param params.notchQ - New notch filter Q factor
   * 
   * @example
   * ```typescript
   * // Adapt filtering for different content
   * noiseFilter.updateFrequencies({
   *   highpassFreq: 100,  // More aggressive low-cut
   *   lowpassFreq: 1200   // Extended high-frequency range
   * });
   * 
   * // Adjust power line rejection
   * noiseFilter.updateFrequencies({
   *   notchFreq: 50,      // 50Hz power line (Europe)
   *   notchQ: 15.0        // Sharper notch
   * });
   * ```
   */
  updateFrequencies(e) {
    const t = this.audioContext.currentTime;
    try {
      e.highpassFreq !== void 0 && this.highpassFilter && (this.highpassFilter.frequency.setValueAtTime(e.highpassFreq, t), this.config.highpassFreq = e.highpassFreq), e.lowpassFreq !== void 0 && this.lowpassFilter && (this.lowpassFilter.frequency.setValueAtTime(e.lowpassFreq, t), this.config.lowpassFreq = e.lowpassFreq), e.notchFreq !== void 0 && this.notchFilter && (this.notchFilter.frequency.setValueAtTime(e.notchFreq, t), this.config.notchFreq = e.notchFreq), e.highpassQ !== void 0 && this.highpassFilter && (this.highpassFilter.Q.setValueAtTime(e.highpassQ, t), this.config.highpassQ = e.highpassQ), e.lowpassQ !== void 0 && this.lowpassFilter && (this.lowpassFilter.Q.setValueAtTime(e.lowpassQ, t), this.config.lowpassQ = e.lowpassQ), e.notchQ !== void 0 && this.notchFilter && (this.notchFilter.Q.setValueAtTime(e.notchQ, t), this.config.notchQ = e.notchQ), console.log("🔧 [NoiseFilter] Filter parameters updated:", e);
    } catch (i) {
      const s = new w(
        "フィルターパラメータの更新に失敗しました。指定した値が範囲外であるか、フィルターが無効になっている可能性があります。",
        U.INVALID_SAMPLE_RATE,
        {
          operation: "updateFrequencies",
          originalError: i.message,
          requestedParams: e,
          currentConfig: this.config,
          audioContextTime: this.audioContext.currentTime
        }
      );
      throw T.logError(s, "NoiseFilter parameter update"), console.error("❌ [NoiseFilter] Parameter update failed:", s.toJSON()), s;
    }
  }
  /**
   * Enable or disable the entire filter chain
   */
  setEnabled(e) {
    if (e !== this.config.useFilters) {
      if (this.config.useFilters = e, this.isConnected && this.inputNode) {
        const t = this.outputNode;
        this.disconnect(), e && (this.highpassFilter || this.createFilterChain()), this.connect(this.inputNode, t || void 0);
      }
      console.log(`🔘 [NoiseFilter] Filters ${e ? "enabled" : "disabled"}`);
    }
  }
  /**
   * Get filter response at specific frequency (for visualization)
   */
  getFilterResponse(e) {
    if (!this.config.useFilters || !this.highpassFilter || !this.lowpassFilter || !this.notchFilter)
      return { magnitude: 1, phase: 0 };
    try {
      const t = new Float32Array([e]), i = new Float32Array(1), s = new Float32Array(1);
      this.highpassFilter.getFrequencyResponse(t, i, s);
      const n = i[0];
      this.lowpassFilter.getFrequencyResponse(t, i, s);
      const o = i[0];
      this.notchFilter.getFrequencyResponse(t, i, s);
      const r = i[0];
      return {
        magnitude: n * o * r,
        phase: s[0]
      };
    } catch (t) {
      const i = new w(
        "フィルター応答の計算に失敗しました。デフォルト値を返します。",
        U.PROCESSING_TIMEOUT,
        {
          operation: "getFilterResponse",
          frequency: e,
          originalError: t.message,
          useFilters: this.config.useFilters
        }
      );
      return T.logError(i, "Filter response calculation"), console.warn("⚠️ [NoiseFilter] Filter response calculation failed:", i.toJSON()), { magnitude: 1, phase: 0 };
    }
  }
  /**
   * Get current filter configuration
   */
  getConfig() {
    return { ...this.config };
  }
  /**
   * Get filter chain status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      useFilters: this.config.useFilters,
      hasFilters: !!(this.highpassFilter && this.lowpassFilter && this.notchFilter),
      filterTypes: this.config.useFilters ? ["highpass", "lowpass", "notch"] : [],
      frequencies: {
        highpass: this.config.highpassFreq,
        lowpass: this.config.lowpassFreq,
        notch: this.config.notchFreq
      },
      qFactors: {
        highpass: this.config.highpassQ,
        lowpass: this.config.lowpassQ,
        notch: this.config.notchQ
      }
    };
  }
  /**
   * Get the final output node (for chaining)
   */
  getOutputNode() {
    return !this.config.useFilters || !this.notchFilter ? this.inputNode || null : this.notchFilter;
  }
  /**
   * Cleanup and destroy filter nodes
   */
  destroy() {
    console.log("🗑️ [NoiseFilter] Destroying filter chain"), this.disconnect(), this.highpassFilter = null, this.lowpassFilter = null, this.notchFilter = null, console.log("✅ [NoiseFilter] Cleanup complete");
  }
  /**
   * Create a preset configuration for different scenarios
   */
  static getPresetConfig(e) {
    switch (e) {
      case "voice":
        return {
          highpassFreq: 80,
          // Remove breath noise
          lowpassFreq: 800,
          // Focus on vocal fundamentals
          notchFreq: 60,
          // Remove power line hum
          highpassQ: 0.7,
          lowpassQ: 0.7,
          notchQ: 10,
          useFilters: !0
        };
      case "instrument":
        return {
          highpassFreq: 40,
          // Preserve low fundamentals
          lowpassFreq: 2e3,
          // Allow more harmonics
          notchFreq: 60,
          // Remove power line hum
          highpassQ: 0.5,
          lowpassQ: 0.5,
          notchQ: 8,
          useFilters: !0
        };
      case "wide":
        return {
          highpassFreq: 20,
          // Minimal low cut
          lowpassFreq: 5e3,
          // Minimal high cut
          notchFreq: 60,
          // Only power line filtering
          highpassQ: 0.3,
          lowpassQ: 0.3,
          notchQ: 5,
          useFilters: !0
        };
      case "minimal":
        return {
          highpassFreq: 60,
          // Just power line region
          lowpassFreq: 8e3,
          // Very high cutoff
          notchFreq: 60,
          // Power line only
          highpassQ: 0.1,
          lowpassQ: 0.1,
          notchQ: 3,
          useFilters: !0
        };
      default:
        return {
          useFilters: !1
        };
    }
  }
}
var de = /* @__PURE__ */ ((l) => (l[l.DEBUG = 0] = "DEBUG", l[l.INFO = 1] = "INFO", l[l.WARN = 2] = "WARN", l[l.ERROR = 3] = "ERROR", l[l.SILENT = 4] = "SILENT", l))(de || {});
class le {
  constructor(e = 1, t = "", i = {}) {
    this.listeners = [], this.level = e, this.prefix = t, this.context = i;
  }
  /**
   * Set the minimum log level
   */
  setLevel(e) {
    this.level = e;
  }
  /**
   * Add a log listener for custom handling
   */
  addListener(e) {
    this.listeners.push(e);
  }
  /**
   * Remove a log listener
   */
  removeListener(e) {
    const t = this.listeners.indexOf(e);
    t !== -1 && this.listeners.splice(t, 1);
  }
  /**
   * Create a child logger with additional context
   */
  child(e, t = {}) {
    const i = this.prefix ? `${this.prefix}:${e}` : e, s = { ...this.context, ...t }, n = new le(this.level, i, s);
    return n.addListener((o) => {
      this.listeners.forEach((r) => r(o));
    }), n;
  }
  /**
   * Log a debug message
   */
  debug(e, t) {
    this.log(0, e, t);
  }
  /**
   * Log an info message
   */
  info(e, t) {
    this.log(1, e, t);
  }
  /**
   * Log a warning message
   */
  warn(e, t) {
    this.log(2, e, t);
  }
  /**
   * Log an error message
   */
  error(e, t, i) {
    const s = t ? {
      errorName: t.name,
      errorMessage: t.message,
      stack: t.stack,
      ...i
    } : i;
    this.log(3, e, s);
  }
  /**
   * Core logging method
   */
  log(e, t, i) {
    if (e < this.level)
      return;
    const s = {
      level: e,
      message: t,
      context: { ...this.context, ...i },
      timestamp: Date.now(),
      prefix: this.prefix
    };
    this.logToConsole(s), this.listeners.forEach((n) => {
      try {
        n(s);
      } catch (o) {
        console.error("Logger listener error:", o);
      }
    });
  }
  /**
   * Format and output to console
   */
  logToConsole(e) {
    const t = new Date(e.timestamp).toISOString(), i = de[e.level], s = e.prefix ? `[${e.prefix}]` : "", n = `${t} ${i} ${s} ${e.message}`, o = this.getConsoleMethod(e.level);
    e.context && Object.keys(e.context).length > 0 ? o(n, e.context) : o(n);
  }
  /**
   * Get appropriate console method for log level
   */
  getConsoleMethod(e) {
    switch (e) {
      case 0:
        return console.debug;
      case 1:
        return console.info;
      case 2:
        return console.warn;
      case 3:
        return console.error;
      default:
        return console.log;
    }
  }
  /**
   * Get current log level
   */
  getLevel() {
    return this.level;
  }
  /**
   * Check if a level is enabled
   */
  isLevelEnabled(e) {
    return e >= this.level;
  }
}
const me = new le(1, "PitchPro"), nt = (l, e) => me.debug(l, e), ot = (l, e) => me.info(l, e), rt = (l, e) => me.warn(l, e), at = (l, e, t) => me.error(l, e, t);
class Ze {
  constructor(e, t = {}) {
    if (this.refCount = 0, this.isActive = !1, this.lastHealthCheck = null, this.healthCheckInterval = null, this.idleCheckInterval = null, this.visibilityCheckInterval = null, this.lastActivityTime = Date.now(), this.isPageVisible = !0, this.isUserActive = !0, this.autoRecoveryAttempts = 0, this.eventListeners = /* @__PURE__ */ new Map(), this.callbacks = {}, this.audioManager = e, this.config = {
      healthCheckIntervalMs: t.healthCheckIntervalMs ?? 5e3,
      // 5 seconds
      idleTimeoutMs: t.idleTimeoutMs ?? 3e5,
      // 5 minutes
      autoRecoveryDelayMs: t.autoRecoveryDelayMs ?? 2e3,
      // 2 seconds
      maxIdleTimeBeforeRelease: t.maxIdleTimeBeforeRelease ?? 6e5,
      // 10 minutes
      maxAutoRecoveryAttempts: t.maxAutoRecoveryAttempts ?? 3,
      logLevel: t.logLevel ?? de.INFO,
      enableDetailedLogging: t.enableDetailedLogging ?? !1
    }, this.logger = new le(
      this.config.logLevel,
      "MicrophoneLifecycleManager",
      {
        component: "MicrophoneLifecycleManager",
        enableDetailedLogging: this.config.enableDetailedLogging
      }
    ), typeof window > "u") {
      this.logger.info("SSR environment detected - skipping initialization");
      return;
    }
    this.logger.debug("Initializing MicrophoneLifecycleManager", {
      config: this.config
    }), this.setupEventListeners();
  }
  /**
   * Set callback functions
   */
  setCallbacks(e) {
    this.callbacks = { ...this.callbacks, ...e };
  }
  /**
   * Helper method to add event listener with automatic tracking for cleanup
   * Currently not used but available for future event listener management improvements
   */
  /* private addTrackedEventListener(
    target: EventTarget,
    eventName: string, 
    listener: EventListener,
    options?: AddEventListenerOptions
  ): void {
    const key = `${eventName}-${Date.now()}-${Math.random()}`;
    
    target.addEventListener(eventName, listener, options);
    this.eventListeners.set(key, { target, listener, eventName });
    
    this.logger.debug('Event listener added', {
      eventName,
      target: target.constructor.name,
      totalListeners: this.eventListeners.size
    });
  } */
  /**
   * Helper method to remove all tracked event listeners
   */
  removeAllTrackedEventListeners() {
    this.logger.debug("Removing all tracked event listeners", {
      count: this.eventListeners.size
    }), this.eventListeners.forEach(({ target: e, listener: t, eventName: i }, s) => {
      try {
        e.removeEventListener(i, t);
      } catch (n) {
        this.logger.warn("Failed to remove event listener", {
          eventName: i,
          key: s,
          error: n.message
        });
      }
    }), this.eventListeners.clear(), this.logger.debug("All event listeners removed");
  }
  /**
   * Acquire microphone resources (with reference counting)
   */
  async acquire() {
    var e, t, i, s;
    this.refCount++, console.log(`🎤 [MicrophoneLifecycleManager] Acquiring resources (refCount: ${this.refCount})`);
    try {
      if (!this.isActive) {
        const o = await this.audioManager.initialize();
        return this.isActive = !0, this.lastActivityTime = Date.now(), this.autoRecoveryAttempts = 0, this.startHealthMonitoring(), this.startIdleMonitoring(), this.startVisibilityMonitoring(), (t = (e = this.callbacks).onStateChange) == null || t.call(e, "active"), console.log("🟢 [MicrophoneLifecycleManager] Microphone activated"), o;
      }
      return this.updateActivity(), await this.audioManager.initialize();
    } catch (n) {
      throw console.error("❌ [MicrophoneLifecycleManager] Failed to acquire resources:", n), this.refCount = Math.max(0, this.refCount - 1), (s = (i = this.callbacks).onError) == null || s.call(i, n), n;
    }
  }
  /**
   * Release microphone resources (with reference counting)
   */
  release() {
    var e, t;
    this.refCount = Math.max(0, this.refCount - 1), console.log(`📉 [MicrophoneLifecycleManager] Releasing resources (refCount: ${this.refCount})`), this.refCount <= 0 && (this.stopAllMonitoring(), this.audioManager.release(), this.isActive = !1, (t = (e = this.callbacks).onStateChange) == null || t.call(e, "inactive"), console.log("🔴 [MicrophoneLifecycleManager] Microphone deactivated"));
  }
  /**
   * Force release all resources (emergency cleanup)
   */
  forceRelease() {
    var e, t;
    console.log("🚨 [MicrophoneLifecycleManager] Force release - cleaning up all resources"), this.refCount = 0, this.stopAllMonitoring(), this.audioManager.forceCleanup(), this.isActive = !1, (t = (e = this.callbacks).onStateChange) == null || t.call(e, "inactive");
  }
  /**
   * Setup page lifecycle event listeners
   */
  setupEventListeners() {
    const e = () => {
      this.isPageVisible = !document.hidden, this.handleVisibilityChange();
    }, t = () => {
      this.updateActivity();
    }, i = () => {
      this.forceRelease();
    }, s = () => {
      this.isPageVisible = !0, this.handleVisibilityChange();
    }, n = () => {
      this.isPageVisible = !1, this.handleVisibilityChange();
    };
    document.addEventListener("visibilitychange", e), document.addEventListener("mousemove", t), document.addEventListener("keydown", t), document.addEventListener("click", t), document.addEventListener("scroll", t), document.addEventListener("touchstart", t), window.addEventListener("beforeunload", i), window.addEventListener("unload", i), window.addEventListener("focus", s), window.addEventListener("blur", n), this.eventListeners.set("visibilitychange", { target: document, listener: e, eventName: "visibilitychange" }), this.eventListeners.set("mousemove", { target: document, listener: t, eventName: "mousemove" }), this.eventListeners.set("keydown", { target: document, listener: t, eventName: "keydown" }), this.eventListeners.set("click", { target: document, listener: t, eventName: "click" }), this.eventListeners.set("scroll", { target: document, listener: t, eventName: "scroll" }), this.eventListeners.set("touchstart", { target: document, listener: t, eventName: "touchstart" }), this.eventListeners.set("beforeunload", { target: window, listener: i, eventName: "beforeunload" }), this.eventListeners.set("unload", { target: window, listener: i, eventName: "unload" }), this.eventListeners.set("focus", { target: window, listener: s, eventName: "focus" }), this.eventListeners.set("blur", { target: window, listener: n, eventName: "blur" }), console.log("👂 [MicrophoneLifecycleManager] Event listeners setup complete");
  }
  /**
   * Handle page visibility changes
   */
  handleVisibilityChange() {
    this.isActive && (this.isPageVisible ? (console.log("👁️ [MicrophoneLifecycleManager] Page became visible - resuming monitoring"), this.updateActivity(), setTimeout(() => {
      this.performHealthCheck();
    }, 1e3)) : (console.log("🙈 [MicrophoneLifecycleManager] Page became hidden - reducing monitoring frequency"), setTimeout(() => {
      !this.isPageVisible && this.isActive && Date.now() - this.lastActivityTime > this.config.maxIdleTimeBeforeRelease && (console.log("⏰ [MicrophoneLifecycleManager] Long inactivity detected - releasing resources"), this.forceRelease());
    }, this.config.maxIdleTimeBeforeRelease)));
  }
  /**
   * Update user activity timestamp
   */
  updateActivity() {
    this.lastActivityTime = Date.now(), this.isUserActive = !0;
  }
  /**
   * Start health monitoring
   */
  startHealthMonitoring() {
    this.healthCheckInterval && clearInterval(this.healthCheckInterval), this.healthCheckInterval = window.setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckIntervalMs), console.log(`💓 [MicrophoneLifecycleManager] Health monitoring started (${this.config.healthCheckIntervalMs}ms interval)`);
  }
  /**
   * Start idle monitoring
   */
  startIdleMonitoring() {
    this.idleCheckInterval && clearInterval(this.idleCheckInterval), this.idleCheckInterval = window.setInterval(() => {
      this.checkIdleTimeout();
    }, 3e4), console.log("😴 [MicrophoneLifecycleManager] Idle monitoring started");
  }
  /**
   * Start visibility monitoring
   */
  startVisibilityMonitoring() {
    this.visibilityCheckInterval && clearInterval(this.visibilityCheckInterval), this.visibilityCheckInterval = window.setInterval(() => {
      this.isPageVisible && this.isActive && this.performHealthCheck();
    }, 1e4), console.log("👁️ [MicrophoneLifecycleManager] Visibility monitoring started");
  }
  /**
   * Perform comprehensive health check
   */
  async performHealthCheck() {
    var e, t, i, s;
    if (this.isActive)
      try {
        const n = this.audioManager.checkMediaStreamHealth();
        if (this.lastHealthCheck = n, n.healthy)
          this.autoRecoveryAttempts > 0 && (this.logger.info("Microphone health restored, resetting recovery attempts", {
            previousAttempts: this.autoRecoveryAttempts,
            healthStatus: n
          }), this.autoRecoveryAttempts = 0);
        else if (this.logger.warn("Unhealthy microphone state detected", { healthStatus: n }), this.autoRecoveryAttempts < this.config.maxAutoRecoveryAttempts)
          this.autoRecoveryAttempts++, this.logger.warn("Attempting automatic recovery", {
            attempt: this.autoRecoveryAttempts,
            maxAttempts: this.config.maxAutoRecoveryAttempts,
            healthStatus: n
          }), setTimeout(async () => {
            var o, r;
            try {
              await this.audioManager.initialize(), this.logger.info("Automatic recovery successful", {
                attempt: this.autoRecoveryAttempts,
                totalAttempts: this.autoRecoveryAttempts
              }), this.autoRecoveryAttempts = 0, this.dispatchCustomEvent("pitchpro:lifecycle:autoRecoverySuccess", {});
            } catch (a) {
              this.logger.error("Automatic recovery failed", a, {
                attempt: this.autoRecoveryAttempts,
                maxAttempts: this.config.maxAutoRecoveryAttempts
              }), (r = (o = this.callbacks).onError) == null || r.call(o, a), this.dispatchCustomEvent("pitchpro:lifecycle:autoRecoveryFailed", { error: a });
            }
          }, this.config.autoRecoveryDelayMs);
        else {
          const o = new Ve(
            `Microphone health check failed after ${this.autoRecoveryAttempts} recovery attempts. Monitoring stopped to prevent infinite error loop.`,
            n,
            this.autoRecoveryAttempts,
            {
              operation: "performHealthCheck",
              maxAttemptsReached: !0,
              monitoringStopped: !0
            }
          );
          this.logger.error("Maximum recovery attempts reached - stopping health checks", o, {
            attempts: this.autoRecoveryAttempts,
            maxAttempts: this.config.maxAutoRecoveryAttempts,
            healthStatus: n
          }), this.stopAllMonitoring(), this.isActive = !1, (t = (e = this.callbacks).onError) == null || t.call(e, o), this.dispatchCustomEvent("pitchpro:lifecycle:maxRecoveryAttemptsReached", {
            attempts: this.autoRecoveryAttempts,
            lastHealthStatus: n
          });
        }
      } catch (n) {
        this.logger.error("Health check failed", n, {
          operation: "performHealthCheck",
          isActive: this.isActive,
          attempts: this.autoRecoveryAttempts
        }), (s = (i = this.callbacks).onError) == null || s.call(i, n);
      }
  }
  /**
   * Check for idle timeout
   */
  checkIdleTimeout() {
    if (!this.isActive) return;
    const e = Date.now() - this.lastActivityTime;
    e > this.config.idleTimeoutMs && this.isUserActive && (console.log("😴 [MicrophoneLifecycleManager] User idle detected"), this.isUserActive = !1), e > this.config.maxIdleTimeBeforeRelease && (console.log("⏰ [MicrophoneLifecycleManager] Extreme idle detected - auto-releasing resources"), this.forceRelease());
  }
  /**
   * Stop all monitoring intervals
   */
  stopAllMonitoring() {
    this.healthCheckInterval && (clearInterval(this.healthCheckInterval), this.healthCheckInterval = null), this.idleCheckInterval && (clearInterval(this.idleCheckInterval), this.idleCheckInterval = null), this.visibilityCheckInterval && (clearInterval(this.visibilityCheckInterval), this.visibilityCheckInterval = null), console.log("⏹️ [MicrophoneLifecycleManager] All monitoring stopped");
  }
  /**
   * Dispatch custom event
   */
  dispatchCustomEvent(e, t) {
    if (typeof window > "u") return;
    const i = new CustomEvent(e, { detail: t });
    window.dispatchEvent(i);
  }
  /**
   * Get current status
   */
  getStatus() {
    return {
      refCount: this.refCount,
      isActive: this.isActive,
      isPageVisible: this.isPageVisible,
      isUserActive: this.isUserActive,
      lastActivityTime: this.lastActivityTime,
      timeSinceActivity: Date.now() - this.lastActivityTime,
      autoRecoveryAttempts: this.autoRecoveryAttempts,
      lastHealthCheck: this.lastHealthCheck,
      audioManagerStatus: this.audioManager.getStatus()
    };
  }
  /**
   * Update configuration
   */
  updateConfig(e) {
    this.config = { ...this.config, ...e }, this.isActive && (this.stopAllMonitoring(), this.startHealthMonitoring(), this.startIdleMonitoring(), this.startVisibilityMonitoring()), console.log("🔧 [MicrophoneLifecycleManager] Configuration updated:", e);
  }
  /**
   * Reset recovery attempts and restart monitoring if needed
   * This method provides manual intervention capability for max recovery attempts errors
   */
  resetRecoveryAttempts() {
    const e = this.autoRecoveryAttempts;
    this.autoRecoveryAttempts = 0, this.logger.info("Recovery attempts reset manually", {
      previousAttempts: e,
      refCount: this.refCount,
      wasActive: this.isActive,
      hasMonitoring: !!this.healthCheckInterval
    }), !this.healthCheckInterval && this.refCount > 0 && (this.logger.info("Restarting monitoring after manual reset", {
      refCount: this.refCount,
      reason: "Manual recovery reset with active references"
    }), this.isActive = !0, this.startHealthMonitoring(), this.startIdleMonitoring(), this.startVisibilityMonitoring(), this.dispatchCustomEvent("pitchpro:lifecycle:monitoringRestarted", {
      reason: "Manual recovery reset",
      refCount: this.refCount
    }));
  }
  /**
   * Cleanup and destroy
   */
  destroy() {
    this.logger.info("Destroying MicrophoneLifecycleManager", {
      refCount: this.refCount,
      isActive: this.isActive,
      autoRecoveryAttempts: this.autoRecoveryAttempts,
      listenerCount: this.eventListeners.size
    }), this.stopAllMonitoring(), this.forceRelease(), this.removeAllTrackedEventListeners(), this.isActive = !1, this.refCount = 0, this.autoRecoveryAttempts = 0, this.logger.info("MicrophoneLifecycleManager cleanup complete");
  }
}
class et {
  constructor() {
    if (this.container = null, this.notifications = /* @__PURE__ */ new Map(), this.notificationCounter = 0, this.defaultDuration = 5e3, this.maxNotifications = 0, this.cssClasses = {
      container: "pitchpro-notifications",
      notification: "pitchpro-notification",
      title: "pitchpro-notification-title",
      message: "pitchpro-notification-message",
      details: "pitchpro-notification-details",
      solution: "pitchpro-notification-solution",
      closeButton: "pitchpro-notification-close",
      error: "pitchpro-notification-error",
      warning: "pitchpro-notification-warning",
      success: "pitchpro-notification-success",
      info: "pitchpro-notification-info",
      high: "pitchpro-notification-priority-high",
      medium: "pitchpro-notification-priority-medium",
      low: "pitchpro-notification-priority-low"
    }, typeof window > "u") {
      console.log("🔇 [ErrorNotificationSystem] SSR environment detected - skipping initialization");
      return;
    }
    this.initializeContainer(), this.injectCSS();
  }
  /**
   * Create and inject the notification container into the DOM
   */
  initializeContainer() {
    let e = document.querySelector(`.${this.cssClasses.container}`);
    e ? (this.container = e, console.log("📋 [ErrorNotificationSystem] Using existing notification container")) : (this.container = document.createElement("div"), this.container.className = this.cssClasses.container, this.container.setAttribute("role", "alert"), this.container.setAttribute("aria-live", "polite"), document.body.appendChild(this.container), console.log("📋 [ErrorNotificationSystem] Notification container created"));
  }
  /**
   * Inject default CSS styles
   */
  injectCSS() {
    if (document.querySelector("#pitchpro-notifications-styles"))
      return;
    const e = `
      .${this.cssClasses.container} {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        max-width: 400px;
        pointer-events: none;
      }

      .${this.cssClasses.notification} {
        background: white;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        margin-bottom: 12px;
        padding: 16px;
        pointer-events: auto;
        position: relative;
        animation: slideIn 0.3s ease-out;
        transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
      }

      .${this.cssClasses.notification}.removing {
        opacity: 0;
        transform: translateX(100%);
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(100%);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }

      .${this.cssClasses.notification}.${this.cssClasses.error} {
        border-left: 4px solid #ef4444;
      }

      .${this.cssClasses.notification}.${this.cssClasses.warning} {
        border-left: 4px solid #f59e0b;
      }

      .${this.cssClasses.notification}.${this.cssClasses.success} {
        border-left: 4px solid #10b981;
      }

      .${this.cssClasses.notification}.${this.cssClasses.info} {
        border-left: 4px solid #3b82f6;
      }

      .${this.cssClasses.title} {
        font-weight: 600;
        font-size: 14px;
        color: #1f2937;
        margin-bottom: 4px;
        padding-right: 24px;
      }

      .${this.cssClasses.message} {
        font-size: 13px;
        color: #4b5563;
        margin-bottom: 8px;
        line-height: 1.4;
      }

      .${this.cssClasses.details} {
        font-size: 12px;
        color: #6b7280;
        margin-bottom: 8px;
        padding-left: 12px;
        border-left: 2px solid #e5e7eb;
      }

      .${this.cssClasses.details} li {
        margin-bottom: 2px;
      }

      .${this.cssClasses.solution} {
        font-size: 12px;
        color: #059669;
        background: #ecfdf5;
        border: 1px solid #a7f3d0;
        border-radius: 4px;
        padding: 8px;
        margin-top: 8px;
      }

      .${this.cssClasses.closeButton} {
        position: absolute;
        top: 12px;
        right: 12px;
        background: none;
        border: none;
        font-size: 18px;
        color: #9ca3af;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .${this.cssClasses.closeButton}:hover {
        color: #6b7280;
      }

      .${this.cssClasses.notification}.${this.cssClasses.high} {
        border-width: 2px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      }

      @media (max-width: 640px) {
        .${this.cssClasses.container} {
          top: 10px;
          left: 10px;
          right: 10px;
          max-width: none;
        }
      }
    `, t = document.createElement("style");
    t.id = "pitchpro-notifications-styles", t.textContent = e, document.head.appendChild(t);
  }
  /**
   * Show a notification
   */
  show(e) {
    if (!this.container)
      return console.warn("⚠️ [ErrorNotificationSystem] Container not available - cannot show notification"), "";
    const t = `notification-${++this.notificationCounter}`, i = this.createNotificationElement(t, e);
    if (this.notifications.size >= this.maxNotifications) {
      const s = Array.from(this.notifications.keys())[0];
      this.remove(s);
    }
    if (this.container.appendChild(i), this.notifications.set(t, i), e.autoHide !== !1) {
      const s = e.duration || this.defaultDuration;
      setTimeout(() => {
        this.remove(t);
      }, s);
    }
    return console.log(`📢 [ErrorNotificationSystem] Notification shown: ${e.type} - ${e.title}`), t;
  }
  /**
   * Create notification DOM element
   */
  createNotificationElement(e, t) {
    const i = document.createElement("div");
    i.className = [
      this.cssClasses.notification,
      this.cssClasses[t.type],
      t.priority ? this.cssClasses[t.priority] : ""
    ].filter(Boolean).join(" "), i["data-notification-id"] = e;
    const s = document.createElement("div");
    s.className = this.cssClasses.title, s.textContent = t.title, i.appendChild(s);
    const n = document.createElement("div");
    if (n.className = this.cssClasses.message, n.textContent = t.message, i.appendChild(n), t.details && t.details.length > 0) {
      const r = document.createElement("div");
      r.className = this.cssClasses.details;
      const a = document.createElement("ul");
      a.style.margin = "0", a.style.paddingLeft = "16px", t.details.forEach((c) => {
        const h = document.createElement("li");
        h.textContent = c, a.appendChild(h);
      }), r.appendChild(a), i.appendChild(r);
    }
    if (t.solution) {
      const r = document.createElement("div");
      r.className = this.cssClasses.solution, r.textContent = t.solution, i.appendChild(r);
    }
    const o = document.createElement("button");
    return o.className = this.cssClasses.closeButton, o.innerHTML = "×", o.setAttribute("aria-label", "Close notification"), o.addEventListener("click", () => {
      this.remove(e);
    }), i.appendChild(o), i;
  }
  /**
   * Remove a specific notification
   */
  remove(e) {
    const t = this.notifications.get(e);
    t && (t.classList.add("removing"), setTimeout(() => {
      t.parentNode && t.parentNode.removeChild(t), this.notifications.delete(e);
    }, 300), console.log(`🗑️ [ErrorNotificationSystem] Notification removed: ${e}`));
  }
  /**
   * Clear all notifications
   */
  clearAll() {
    Array.from(this.notifications.keys()).forEach((t) => this.remove(t)), console.log("🧹 [ErrorNotificationSystem] All notifications cleared");
  }
  /**
   * Show error notification (convenience method)
   */
  showError(e, t, i = {}) {
    return this.show({
      type: "error",
      title: e,
      message: t,
      priority: "high",
      autoHide: !1,
      // Errors should be manually dismissed
      ...i
    });
  }
  /**
   * Show warning notification (convenience method)
   */
  showWarning(e, t, i = {}) {
    return this.show({
      type: "warning",
      title: e,
      message: t,
      priority: "medium",
      duration: 8e3,
      // Longer duration for warnings
      ...i
    });
  }
  /**
   * Show success notification (convenience method)
   */
  showSuccess(e, t, i = {}) {
    return this.show({
      type: "success",
      title: e,
      message: t,
      priority: "low",
      duration: 3e3,
      // Shorter duration for success messages
      ...i
    });
  }
  /**
   * Show info notification (convenience method)
   */
  showInfo(e, t, i = {}) {
    return this.show({
      type: "info",
      title: e,
      message: t,
      priority: "low",
      ...i
    });
  }
  /**
   * Show microphone error with common solutions
   */
  showMicrophoneError(e, t) {
    return this.showError(
      "マイクロフォンエラー",
      `マイクの初期化に失敗しました: ${e.message}`,
      {
        details: t ? [`発生箇所: ${t}`, `エラー詳細: ${e.name}`] : [`エラー詳細: ${e.name}`],
        solution: "マイクの設定を確認し、ブラウザにマイクアクセスを許可してください。",
        priority: "high"
      }
    );
  }
  /**
   * Show audio context error
   */
  showAudioContextError(e) {
    return this.showError(
      "オーディオシステムエラー",
      `音声処理システムの初期化に失敗しました: ${e.message}`,
      {
        details: [
          "ブラウザがWeb Audio APIに対応していない可能性があります",
          "または、音声デバイスに問題が発生しています"
        ],
        solution: "ブラウザを最新版に更新するか、別のブラウザで試してください。",
        priority: "high"
      }
    );
  }
  /**
   * Show network/loading error
   */
  showLoadingError(e, t) {
    return this.showError(
      "読み込みエラー",
      `${e}の読み込みに失敗しました: ${t.message}`,
      {
        details: [
          "ネットワーク接続を確認してください",
          "ブラウザのキャッシュをクリアしてみてください"
        ],
        solution: "ページを再読み込みするか、しばらく待ってから再度お試しください。",
        priority: "medium"
      }
    );
  }
  /**
   * Get current notification count
   */
  getNotificationCount() {
    return this.notifications.size;
  }
  /**
   * Get all notification IDs
   */
  getNotificationIds() {
    return Array.from(this.notifications.keys());
  }
  /**
   * Check if a specific notification exists
   */
  hasNotification(e) {
    return this.notifications.has(e);
  }
  /**
   * Update configuration
   */
  updateConfig(e) {
    e.defaultDuration !== void 0 && (this.defaultDuration = e.defaultDuration), e.maxNotifications !== void 0 && (this.maxNotifications = e.maxNotifications), console.log("🔧 [ErrorNotificationSystem] Configuration updated:", e);
  }
  /**
   * Destroy the notification system
   */
  destroy() {
    console.log("🗑️ [ErrorNotificationSystem] Destroying notification system"), this.clearAll(), this.container && this.container.parentNode && this.container.parentNode.removeChild(this.container);
    const e = document.querySelector("#pitchpro-notifications-styles");
    e && e.parentNode && e.parentNode.removeChild(e), this.container = null, this.notifications.clear(), console.log("✅ [ErrorNotificationSystem] Cleanup complete");
  }
}
class tt {
  /**
   * Creates a new MicrophoneController with integrated management systems
   * 
   * @param audioManagerConfig - Configuration for AudioManager (optional)
   * @param audioManagerConfig.sampleRate - Audio sample rate (default: 44100)
   * @param audioManagerConfig.echoCancellation - Enable echo cancellation (default: false)
   * @param audioManagerConfig.autoGainControl - Enable auto gain control (default: false)
   * @param lifecycleConfig - Configuration for lifecycle management (optional)
   * @param lifecycleConfig.maxRetries - Maximum retry attempts (default: 3)
   * @param lifecycleConfig.retryDelayMs - Delay between retries (default: 1000)
   * @param showErrorNotifications - Enable visual error notifications (default: true)
   * 
   * @example
   * ```typescript
   * // Basic usage with defaults
   * const micController = new MicrophoneController();
   * 
   * // Custom configuration
   * const micController = new MicrophoneController(
   *   { sampleRate: 48000, echoCancellation: true },
   *   { maxRetries: 5, retryDelayMs: 2000 },
   *   false  // Disable error notifications
   * );
   * ```
   */
  constructor(e = {}) {
    var t, i, s, n, o, r, a, c, h, f, d;
    this.currentState = "uninitialized", this.isPermissionGranted = !1, this.lastError = null, this.eventCallbacks = {}, this.deviceSpecs = null, this.config = {
      audioManager: {
        sampleRate: ((t = e.audioManager) == null ? void 0 : t.sampleRate) ?? 44100,
        echoCancellation: ((i = e.audioManager) == null ? void 0 : i.echoCancellation) ?? !1,
        noiseSuppression: ((s = e.audioManager) == null ? void 0 : s.noiseSuppression) ?? !1,
        autoGainControl: ((n = e.audioManager) == null ? void 0 : n.autoGainControl) ?? !1
      },
      lifecycle: e.lifecycle ?? {},
      audioConstraints: {
        echoCancellation: ((o = e.audioConstraints) == null ? void 0 : o.echoCancellation) ?? !1,
        noiseSuppression: ((r = e.audioConstraints) == null ? void 0 : r.noiseSuppression) ?? !1,
        autoGainControl: ((a = e.audioConstraints) == null ? void 0 : a.autoGainControl) ?? !1
      },
      notifications: {
        enabled: ((c = e.notifications) == null ? void 0 : c.enabled) ?? !0,
        position: ((h = e.notifications) == null ? void 0 : h.position) ?? "top-right"
      },
      logging: {
        level: ((f = e.logging) == null ? void 0 : f.level) ?? de.INFO,
        prefix: ((d = e.logging) == null ? void 0 : d.prefix) ?? "MicrophoneController"
      }
    }, this.logger = new le(
      this.config.logging.level,
      this.config.logging.prefix,
      { component: "MicrophoneController" }
    ), this.logger.debug("Initializing MicrophoneController", { config: this.config }), this.audioManager = new De(this.config.audioManager), this.lifecycleManager = new Ze(this.audioManager, this.config.lifecycle), this.errorSystem = this.config.notifications.enabled ? new et() : null, this.setupEventHandlers(), this.detectDevice();
  }
  /**
   * Sets callback functions for microphone controller events
   * 
   * @param callbacks - Object containing event callback functions
   * @param callbacks.onStateChange - Called when controller state changes
   * @param callbacks.onError - Called when errors occur
   * @param callbacks.onPermissionChange - Called when microphone permission changes
   * @param callbacks.onSensitivityChange - Called when sensitivity is adjusted
   * @param callbacks.onDeviceChange - Called when device specifications are detected
   * 
   * @example
   * ```typescript
   * micController.setCallbacks({
   *   onStateChange: (state) => {
   *     console.log('Controller state:', state);
   *   },
   *   onError: (error) => {
   *     console.error('Microphone error:', error.message);
   *   },
   *   onDeviceChange: (specs) => {
   *     console.log(`Device: ${specs.deviceType}, Sensitivity: ${specs.sensitivity}x`);
   *   }
   * });
   * ```
   */
  setCallbacks(e) {
    this.eventCallbacks = { ...this.eventCallbacks, ...e };
  }
  /**
   * Reset lifecycle manager recovery attempts
   * Provides safe access to lifecycle recovery reset without exposing internal state
   */
  resetRecoveryAttempts() {
    this.logger.info("Resetting recovery attempts via public API");
    try {
      this.lifecycleManager.resetRecoveryAttempts(), this.logger.info("Recovery attempts reset successfully");
    } catch (e) {
      throw this.logger.error("Failed to reset recovery attempts", e), e;
    }
  }
  /**
   * Check if controller is in active state
   */
  isActive() {
    return this.currentState === "active";
  }
  /**
   * Check if controller is ready for use
   */
  isReady() {
    return this.currentState === "ready" || this.currentState === "active";
  }
  /**
   * Check if controller is initialized
   */
  isInitialized() {
    return this.currentState !== "uninitialized";
  }
  /**
   * Setup internal event handlers
   */
  setupEventHandlers() {
    this.lifecycleManager.setCallbacks({
      onStateChange: (e) => {
        this.updateState(e === "active" ? "active" : "ready");
      },
      onError: (e) => {
        this.handleError(e, "lifecycle");
      }
    });
  }
  /**
   * Detect device specifications
   */
  detectDevice() {
    var e, t;
    this.deviceSpecs = this.audioManager.getPlatformSpecs(), console.log("📱 [MicrophoneController] Device detected:", this.deviceSpecs), (t = (e = this.eventCallbacks).onDeviceChange) == null || t.call(e, this.deviceSpecs), this.dispatchCustomEvent("pitchpro:deviceDetected", { specs: this.deviceSpecs });
  }
  /**
   * Initializes microphone access with automatic device detection and permissions
   * 
   * @description Handles the complete initialization flow including device detection,
   * permission requests, resource acquisition, and error recovery. Automatically
   * applies device-specific optimizations and sets up monitoring systems.
   * 
   * @returns Promise resolving to audio resources (AudioContext, MediaStream, SourceNode)
   * @throws {Error} If microphone permission is denied or initialization fails
   * 
   * @example
   * ```typescript
   * try {
   *   const resources = await micController.initialize();
   *   console.log('Microphone ready:', resources.mediaStream.active);
   *   console.log('AudioContext state:', resources.audioContext.state);
   * } catch (error) {
   *   console.error('Failed to initialize microphone:', error.message);
   * }
   * ```
   */
  async initialize() {
    var e, t, i, s;
    try {
      this.updateState("initializing"), console.log("🎤 [MicrophoneController] Starting initialization");
      const n = await this.lifecycleManager.acquire();
      return this.isPermissionGranted = !0, this.updateState("ready"), this.lastError = null, (t = (e = this.eventCallbacks).onPermissionChange) == null || t.call(e, !0), this.dispatchCustomEvent("pitchpro:microphoneGranted", { stream: n.mediaStream }), console.log("✅ [MicrophoneController] Initialization complete"), n;
    } catch (n) {
      throw this.logger.error("Initialization failed", n, {
        operation: "initialize",
        currentState: this.currentState
      }), this.isPermissionGranted = !1, this.handleError(n, "initialization"), (s = (i = this.eventCallbacks).onPermissionChange) == null || s.call(i, !1), this.dispatchCustomEvent("pitchpro:microphoneDenied", { error: n }), n;
    }
  }
  /**
   * Request microphone permission (alias for initialize)
   */
  async requestPermission() {
    try {
      return await this.initialize(), !0;
    } catch {
      return !1;
    }
  }
  /**
   * Check if microphone permission is granted
   */
  async checkPermissionStatus() {
    if (typeof navigator > "u" || !navigator.mediaDevices)
      return "denied";
    try {
      return (await navigator.permissions.query({ name: "microphone" })).state;
    } catch {
      try {
        return (await navigator.mediaDevices.getUserMedia({
          audio: this.config.audioConstraints
        })).getTracks().forEach((t) => t.stop()), "granted";
      } catch {
        return "denied";
      }
    }
  }
  /**
   * Stop microphone and release resources
   */
  stop() {
    console.log("🛑 [MicrophoneController] Stopping microphone"), this.lifecycleManager.release(), this.updateState("ready"), this.dispatchCustomEvent("pitchpro:microphoneStopped", {}), console.log("✅ [MicrophoneController] Microphone stopped");
  }
  /**
   * Forcefully stops microphone with complete resource cleanup
   * 
   * @description Performs immediate and complete cleanup of all microphone resources,
   * resets permission state, and returns controller to uninitialized state.
   * Use when normal stop() is not sufficient or emergency cleanup is needed.
   * 
   * @example
   * ```typescript
   * // Emergency cleanup
   * micController.forceStop();
   * console.log('All microphone resources cleaned up');
   * ```
   */
  forceStop() {
    console.log("🚨 [MicrophoneController] Force stopping microphone"), this.lifecycleManager.forceRelease(), this.updateState("uninitialized"), this.isPermissionGranted = !1, console.log("✅ [MicrophoneController] Force stop complete");
  }
  /**
   * Sets microphone sensitivity with automatic validation and event notification
   * 
   * @param sensitivity - Sensitivity multiplier (0.1 ~ 10.0)
   * - 0.1-1.0: Reduced sensitivity for loud environments
   * - 1.0: Standard PC sensitivity
   * - 3.0: iPhone optimized
   * - 7.0: iPad optimized  
   * - 10.0: Maximum sensitivity for quiet environments
   * 
   * @example
   * ```typescript
   * // Set device-optimized sensitivity
   * micController.setSensitivity(7.0);  // iPad optimization
   * 
   * // Adjust for environment
   * micController.setSensitivity(0.5);  // Reduce for loud room
   * ```
   */
  setSensitivity(e) {
    var s, n;
    const t = this.audioManager.getSensitivity();
    this.audioManager.setSensitivity(e);
    const i = this.audioManager.getSensitivity();
    t !== i && (console.log(`🔧 [MicrophoneController] Sensitivity changed: ${t}x → ${i}x`), (n = (s = this.eventCallbacks).onSensitivityChange) == null || n.call(s, i), this.dispatchCustomEvent("pitchpro:sensitivityChanged", { sensitivity: i }));
  }
  /**
   * Gets current microphone sensitivity multiplier
   * 
   * @returns Current sensitivity value (0.1 ~ 10.0)
   * 
   * @example
   * ```typescript
   * const currentSensitivity = micController.getSensitivity();
   * console.log(`Current sensitivity: ${currentSensitivity}x`);
   * ```
   */
  getSensitivity() {
    return this.audioManager.getSensitivity();
  }
  /**
   * Get device specifications
   */
  getDeviceSpecs() {
    return this.deviceSpecs;
  }
  /**
   * Get current state
   */
  getState() {
    return this.currentState;
  }
  /**
   * Check if permission is granted
   */
  hasPermission() {
    return this.isPermissionGranted;
  }
  /**
   * Get comprehensive status
   */
  getStatus() {
    return {
      state: this.currentState,
      isPermissionGranted: this.isPermissionGranted,
      isActive: this.isActive(),
      isReady: this.isReady(),
      sensitivity: this.getSensitivity(),
      deviceSpecs: this.deviceSpecs,
      lastError: this.lastError,
      audioManagerStatus: this.audioManager.getStatus(),
      lifecycleStatus: this.lifecycleManager.getStatus()
    };
  }
  /**
   * Perform health check
   */
  checkHealth() {
    return this.audioManager.checkMediaStreamHealth();
  }
  /**
   * Test microphone functionality
   */
  async testMicrophone(e = 2e3) {
    const t = Date.now();
    try {
      !this.isReady() && !this.isActive() && await this.initialize();
      const i = this.audioManager.createAnalyser("microphone-test", {
        fftSize: 1024,
        smoothingTimeConstant: 0.8
      });
      let s = 0, n = null;
      const o = t + e;
      await new Promise((h) => {
        const f = () => {
          if (Date.now() >= o) {
            h();
            return;
          }
          const d = i.fftSize, u = new Float32Array(d);
          i.getFloatTimeDomainData(u);
          let m = 0;
          for (let v = 0; v < d; v++)
            m += Math.abs(u[v]);
          const y = Math.sqrt(m / d) * 100;
          if (y > s && (s = y), y > 5) {
            let v = 0, S = 0;
            for (let A = 1; A < d / 2; A++) {
              const p = Math.abs(u[A]);
              p > S && (S = p, v = A);
            }
            v > 0 && (n = v * 44100 / d);
          }
          requestAnimationFrame(f);
        };
        f();
      }), this.audioManager.removeAnalyser("microphone-test");
      const r = Date.now() - t, a = s > 1, c = n ? n.toFixed(0) : "none";
      return console.log(`🧪 [MicrophoneController] Microphone test complete: volume=${s.toFixed(2)}, frequency=${c}, duration=${r}ms`), {
        success: a,
        volume: s,
        frequency: n,
        duration: r
      };
    } catch (i) {
      const s = Date.now() - t, n = this._createStructuredError(i, "microphone_test");
      return T.logError(n, "Microphone functionality test"), console.error("❌ [MicrophoneController] Microphone test failed:", n.toJSON()), {
        success: !1,
        volume: 0,
        frequency: null,
        duration: s,
        error: i
      };
    }
  }
  /**
   * Update internal state and notify
   */
  updateState(e) {
    var t, i;
    if (this.currentState !== e) {
      const s = this.currentState;
      this.currentState = e, console.log(`🔄 [MicrophoneController] State changed: ${s} → ${e}`), (i = (t = this.eventCallbacks).onStateChange) == null || i.call(t, e);
    }
  }
  /**
   * Handle errors with notification system
   */
  handleError(e, t) {
    var s, n;
    const i = e instanceof w ? e : this._createStructuredError(e, t);
    T.logError(i, `MicrophoneController ${t}`), console.error(`❌ [MicrophoneController] Error in ${t}:`, i.toJSON()), this.lastError = e, this.updateState("error"), this.errorSystem && (t === "initialization" || t === "lifecycle" ? this.errorSystem.showMicrophoneError(e, t) : this.errorSystem.showError(
      "マイクエラー",
      `${t}でエラーが発生しました: ${e.message}`,
      { priority: "medium" }
    )), (n = (s = this.eventCallbacks).onError) == null || n.call(s, e);
  }
  /**
   * Dispatch custom DOM event
   */
  dispatchCustomEvent(e, t) {
    if (typeof window > "u") return;
    const i = new CustomEvent(e, { detail: t });
    window.dispatchEvent(i);
  }
  /**
   * Add event listener for microphone events
   */
  addEventListener(e, t) {
    typeof window > "u" || window.addEventListener(e, t);
  }
  /**
   * Remove event listener for microphone events
   */
  removeEventListener(e, t) {
    typeof window > "u" || window.removeEventListener(e, t);
  }
  /**
   * Cleanup and destroy all resources
   */
  destroy() {
    var e;
    console.log("🗑️ [MicrophoneController] Destroying controller"), this.forceStop(), this.lifecycleManager.destroy(), (e = this.errorSystem) == null || e.destroy(), this.eventCallbacks = {}, this.currentState = "uninitialized", this.isPermissionGranted = !1, this.lastError = null, this.deviceSpecs = null, console.log("✅ [MicrophoneController] Cleanup complete");
  }
  /**
   * Creates structured error with enhanced context information
   * 
   * @private
   * @param error - Original error
   * @param operation - Operation that failed
   * @returns Structured PitchProError with context
   */
  _createStructuredError(e, t) {
    return e.message.includes("Permission denied") || e.message.includes("NotAllowedError") || e.message.includes("permission") || e.message.includes("denied") ? new be(
      "マイクへのアクセス許可が拒否されました。ブラウザの設定でマイクアクセスを許可してください。",
      {
        operation: t,
        originalError: e.message,
        deviceSpecs: this.deviceSpecs,
        permissionState: this.isPermissionGranted,
        controllerState: this.currentState,
        userAgent: typeof navigator < "u" ? navigator.userAgent : "unknown"
      }
    ) : e.message.includes("AudioContext") || e.message.includes("audio") || e.message.includes("context") || e.message.includes("initialization") ? new j(
      "オーディオシステムの初期化に失敗しました。デバイスの音響設定を確認するか、ブラウザを再起動してください。",
      {
        operation: t,
        originalError: e.message,
        controllerState: this.currentState,
        audioManagerStatus: this.audioManager.getStatus(),
        deviceSpecs: this.deviceSpecs
      }
    ) : new w(
      `${t}中に予期しないエラーが発生しました: ${e.message}`,
      U.MICROPHONE_ACCESS_DENIED,
      {
        operation: t,
        originalError: e.message,
        stack: e.stack,
        currentState: {
          controllerState: this.currentState,
          isPermissionGranted: this.isPermissionGranted,
          isActive: this.isActive(),
          isReady: this.isReady(),
          deviceSpecs: this.deviceSpecs
        }
      }
    );
  }
}
const M = class M {
  /**
   * Converts frequency in Hz to MIDI note number
   * 
   * @param frequency - Input frequency in Hz
   * @returns MIDI note number (0-127, where 69 = A4 = 440Hz)
   * 
   * @example
   * ```typescript
   * const midiNote = FrequencyUtils.frequencyToMidi(440);
   * console.log(midiNote); // 69 (A4)
   * 
   * const midiNote2 = FrequencyUtils.frequencyToMidi(261.63);
   * console.log(midiNote2); // 60 (C4)
   * ```
   */
  static frequencyToMidi(e) {
    return e <= 0 ? 0 : Math.round(12 * Math.log2(e / M.A4_FREQUENCY) + M.A4_MIDI_NUMBER);
  }
  /**
   * Converts MIDI note number to frequency in Hz
   * 
   * @param midiNumber - MIDI note number (0-127)
   * @returns Frequency in Hz
   * 
   * @example
   * ```typescript
   * const frequency = FrequencyUtils.midiToFrequency(69);
   * console.log(frequency); // 440 (A4)
   * 
   * const frequency2 = FrequencyUtils.midiToFrequency(60);
   * console.log(frequency2); // 261.63 (C4)
   * ```
   */
  static midiToFrequency(e) {
    return M.A4_FREQUENCY * Math.pow(2, (e - M.A4_MIDI_NUMBER) / 12);
  }
  /**
   * Converts frequency to musical note with octave detection and enharmonic support
   * 
   * @param frequency - Input frequency in Hz
   * @param useFlats - Use flat notation instead of sharps (default: false)
   * @returns Musical note object with name, octave, MIDI number, and exact frequency
   * 
   * @example
   * ```typescript
   * const note1 = FrequencyUtils.frequencyToNote(440);
   * console.log(note1); // { name: 'A4', octave: 4, midi: 69, frequency: 440 }
   * 
   * const note2 = FrequencyUtils.frequencyToNote(466.16, true);
   * console.log(note2); // { name: 'Bb4', octave: 4, midi: 70, frequency: 466.164... }
   * 
   * // Invalid frequency handling
   * const invalid = FrequencyUtils.frequencyToNote(-10);
   * console.log(invalid); // { name: '--', octave: 0, midi: 0, frequency: 0 }
   * ```
   */
  static frequencyToNote(e, t = !1) {
    if (e <= 0)
      return {
        name: "--",
        octave: 0,
        midi: 0,
        frequency: 0
      };
    const i = M.frequencyToMidi(e), s = t ? M.FLAT_NOTE_NAMES : M.NOTE_NAMES, n = (i - 12) % 12, o = Math.floor((i - 12) / 12);
    return {
      name: s[n] + o,
      octave: o,
      midi: i,
      frequency: M.midiToFrequency(i)
    };
  }
  /**
   * Calculates cents deviation from the nearest semitone for pitch accuracy analysis
   * 
   * @description Converts frequency to cents deviation, where 100 cents = 1 semitone.
   * Positive values indicate sharp pitch, negative values indicate flat pitch.
   * 
   * @param frequency - Input frequency in Hz
   * @returns Cents deviation from nearest semitone (-50 to +50 cents)
   * 
   * @example
   * ```typescript
   * const cents1 = FrequencyUtils.frequencyToCents(440);
   * console.log(cents1); // 0 (A4 is perfectly in tune)
   * 
   * const cents2 = FrequencyUtils.frequencyToCents(445);
   * console.log(cents2); // +20 (20 cents sharp)
   * 
   * const cents3 = FrequencyUtils.frequencyToCents(435);
   * console.log(cents3); // -20 (20 cents flat)
   * ```
   */
  static frequencyToCents(e) {
    if (e <= 0) return 0;
    const t = 12 * Math.log2(e / M.A4_FREQUENCY) + M.A4_MIDI_NUMBER, i = Math.round(t), s = (t - i) * 100;
    return Math.round(s);
  }
  /**
   * Converts cents to frequency ratio for interval calculations
   * 
   * @description Calculates the frequency multiplier for a given cent value.
   * Useful for transposition and interval calculations.
   * 
   * @param cents - Cents value (100 cents = 1 semitone)
   * @returns Frequency ratio multiplier
   * 
   * @example
   * ```typescript
   * const ratio1 = FrequencyUtils.centsToRatio(1200);
   * console.log(ratio1); // 2.0 (1200 cents = 1 octave = 2x frequency)
   * 
   * const ratio2 = FrequencyUtils.centsToRatio(700);
   * console.log(ratio2); // ~1.498 (700 cents ≈ perfect fifth)
   * 
   * // Apply ratio to transpose frequency
   * const newFreq = 440 * FrequencyUtils.centsToRatio(100); // 440 * semitone ratio
   * console.log(newFreq); // ~466.16 (A# above A4)
   * ```
   */
  static centsToRatio(e) {
    return Math.pow(2, e / 1200);
  }
  /**
   * Converts frequency ratio to cents for interval analysis
   * 
   * @description Calculates the cent value for a given frequency ratio.
   * Useful for analyzing musical intervals and pitch relationships.
   * 
   * @param ratio - Frequency ratio (higher frequency / lower frequency)
   * @returns Cents value (positive for ascending intervals)
   * 
   * @example
   * ```typescript
   * const cents1 = FrequencyUtils.ratioToCents(2.0);
   * console.log(cents1); // 1200 (octave)
   * 
   * const cents2 = FrequencyUtils.ratioToCents(1.5);
   * console.log(cents2); // 702 (perfect fifth)
   * 
   * const cents3 = FrequencyUtils.ratioToCents(880 / 440);
   * console.log(cents3); // 1200 (A4 to A5 = octave)
   * ```
   */
  static ratioToCents(e) {
    return e <= 0 ? 0 : Math.round(1200 * Math.log2(e));
  }
  /**
   * Finds the exact frequency of the closest equal temperament note
   * 
   * @description Rounds the input frequency to the nearest semitone frequency
   * in equal temperament tuning. Useful for pitch correction and reference.
   * 
   * @param frequency - Input frequency in Hz
   * @returns Exact frequency of the closest note in Hz
   * 
   * @example
   * ```typescript
   * const closest1 = FrequencyUtils.getClosestNoteFrequency(445);
   * console.log(closest1); // 440 (closest to A4)
   * 
   * const closest2 = FrequencyUtils.getClosestNoteFrequency(470);
   * console.log(closest2); // 466.16 (closest to A#4/Bb4)
   * 
   * const closest3 = FrequencyUtils.getClosestNoteFrequency(260);
   * console.log(closest3); // 261.63 (closest to C4)
   * ```
   */
  static getClosestNoteFrequency(e) {
    if (e <= 0) return 0;
    const t = M.frequencyToMidi(e);
    return M.midiToFrequency(t);
  }
  /**
   * Calculates the absolute interval between two frequencies in semitones
   * 
   * @description Determines the musical interval size between two frequencies,
   * always returning a positive value regardless of frequency order.
   * 
   * @param frequency1 - First frequency in Hz
   * @param frequency2 - Second frequency in Hz
   * @returns Absolute interval in semitones (always positive)
   * 
   * @example
   * ```typescript
   * const interval1 = FrequencyUtils.getInterval(440, 880);
   * console.log(interval1); // 12 (octave)
   * 
   * const interval2 = FrequencyUtils.getInterval(880, 440);
   * console.log(interval2); // 12 (same interval, order doesn't matter)
   * 
   * const interval3 = FrequencyUtils.getInterval(440, 659.25);
   * console.log(interval3); // 7 (perfect fifth)
   * ```
   */
  static getInterval(e, t) {
    if (e <= 0 || t <= 0) return 0;
    const i = M.frequencyToMidi(e), s = M.frequencyToMidi(t);
    return Math.abs(s - i);
  }
  /**
   * Calculates the signed interval between two frequencies with direction
   * 
   * @description Determines the musical interval with direction information.
   * Positive values indicate ascending intervals, negative values indicate descending.
   * 
   * @param fromFrequency - Starting frequency in Hz
   * @param toFrequency - Target frequency in Hz
   * @returns Signed interval in semitones (positive = ascending, negative = descending)
   * 
   * @example
   * ```typescript
   * const interval1 = FrequencyUtils.getSignedInterval(440, 880);
   * console.log(interval1); // +12 (ascending octave)
   * 
   * const interval2 = FrequencyUtils.getSignedInterval(880, 440);
   * console.log(interval2); // -12 (descending octave)
   * 
   * const interval3 = FrequencyUtils.getSignedInterval(261.63, 392);
   * console.log(interval3); // +7 (ascending perfect fifth)
   * ```
   */
  static getSignedInterval(e, t) {
    if (e <= 0 || t <= 0) return 0;
    const i = M.frequencyToMidi(e);
    return M.frequencyToMidi(t) - i;
  }
  /**
   * Provides comprehensive musical interval information and analysis
   * 
   * @description Converts semitone count to detailed interval information including
   * name, cents value, and frequency ratio. Handles compound intervals with octaves.
   * 
   * @param semitones - Interval size in semitones
   * @returns Musical interval object with name, semitones, cents, and ratio
   * 
   * @example
   * ```typescript
   * const fifth = FrequencyUtils.getIntervalInfo(7);
   * console.log(fifth);
   * // { name: 'Perfect Fifth', semitones: 7, cents: 700, ratio: 1.498... }
   * 
   * const compound = FrequencyUtils.getIntervalInfo(19);
   * console.log(compound);
   * // { name: 'Perfect Fifth + 1 octave(s)', semitones: 19, cents: 1900, ratio: 2.996... }
   * 
   * const unison = FrequencyUtils.getIntervalInfo(0);
   * console.log(unison);
   * // { name: 'Perfect Unison', semitones: 0, cents: 0, ratio: 1.0 }
   * ```
   */
  static getIntervalInfo(e) {
    const t = {
      0: "Perfect Unison",
      1: "Minor Second",
      2: "Major Second",
      3: "Minor Third",
      4: "Major Third",
      5: "Perfect Fourth",
      6: "Tritone",
      7: "Perfect Fifth",
      8: "Minor Sixth",
      9: "Major Sixth",
      10: "Minor Seventh",
      11: "Major Seventh",
      12: "Perfect Octave"
    }, i = (e % 12 + 12) % 12, s = Math.floor(e / 12), n = t[i] || "Unknown";
    return {
      name: s > 0 ? `${n} + ${s} octave(s)` : n,
      semitones: e,
      cents: e * 100,
      ratio: Math.pow(2, e / 12)
    };
  }
  /**
   * Checks if frequency falls within typical human vocal range
   * 
   * @description Tests whether a frequency is within the fundamental vocal range
   * of approximately 80Hz to 1100Hz, covering bass to soprano voices.
   * 
   * @param frequency - Input frequency in Hz
   * @returns True if frequency is within vocal range, false otherwise
   * 
   * @example
   * ```typescript
   * const isVocal1 = FrequencyUtils.isInVocalRange(220);
   * console.log(isVocal1); // true (A3, typical male voice)
   * 
   * const isVocal2 = FrequencyUtils.isInVocalRange(50);
   * console.log(isVocal2); // false (below vocal range)
   * 
   * const isVocal3 = FrequencyUtils.isInVocalRange(2000);
   * console.log(isVocal3); // false (above fundamental vocal range)
   * ```
   */
  static isInVocalRange(e) {
    return e >= 80 && e <= 1100;
  }
  /**
   * Checks if frequency falls within standard piano key range
   * 
   * @description Tests whether a frequency is within the range of a standard
   * 88-key piano, from A0 (27.5Hz) to C8 (4186Hz).
   * 
   * @param frequency - Input frequency in Hz
   * @returns True if frequency is within piano range, false otherwise
   * 
   * @example
   * ```typescript
   * const isPiano1 = FrequencyUtils.isInPianoRange(440);
   * console.log(isPiano1); // true (A4, middle of piano range)
   * 
   * const isPiano2 = FrequencyUtils.isInPianoRange(20);
   * console.log(isPiano2); // false (below piano range)
   * 
   * const isPiano3 = FrequencyUtils.isInPianoRange(5000);
   * console.log(isPiano3); // false (above piano range)
   * ```
   */
  static isInPianoRange(e) {
    return e >= 27.5 && e <= 4186;
  }
  /**
   * Retrieves frequency range specifications for common instruments
   * 
   * @description Returns the typical fundamental frequency range for various
   * instruments and voice types. Useful for instrument-specific audio processing.
   * 
   * @param instrument - Instrument name (piano, guitar, violin, cello, voice_bass, voice_tenor, voice_alto, voice_soprano)
   * @returns Object with min/max frequencies in Hz, or null if instrument not found
   * 
   * @example
   * ```typescript
   * const guitarRange = FrequencyUtils.getInstrumentRange('guitar');
   * console.log(guitarRange); // { min: 82.4, max: 1397 } (E2 to F6)
   * 
   * const bassRange = FrequencyUtils.getInstrumentRange('voice_bass');
   * console.log(bassRange); // { min: 87.3, max: 349 } (F2 to F4)
   * 
   * const unknown = FrequencyUtils.getInstrumentRange('kazoo');
   * console.log(unknown); // null (instrument not in database)
   * ```
   */
  static getInstrumentRange(e) {
    return {
      piano: { min: 27.5, max: 4186 },
      guitar: { min: 82.4, max: 1397 },
      // E2 to F6
      violin: { min: 196, max: 3520 },
      // G3 to A7
      cello: { min: 65.4, max: 1397 },
      // C2 to F6
      voice_bass: { min: 87.3, max: 349 },
      // F2 to F4
      voice_tenor: { min: 131, max: 523 },
      // C3 to C5
      voice_alto: { min: 175, max: 698 },
      // F3 to F5
      voice_soprano: { min: 262, max: 1047 }
      // C4 to C6
    }[e] || null;
  }
  /**
   * Generates chromatic scale frequencies from a base frequency
   * 
   * @description Creates an array of frequencies representing a chromatic scale
   * (all 12 semitones) starting from the given base frequency.
   * 
   * @param baseFrequency - Starting frequency in Hz
   * @param octaves - Number of octaves to generate (default: 1)
   * @returns Array of frequencies representing the chromatic scale
   * 
   * @example
   * ```typescript
   * const chromaticC4 = FrequencyUtils.generateChromaticScale(261.63, 1);
   * console.log(chromaticC4);
   * // [261.63, 277.18, 293.66, 311.13, 329.63, 349.23, 369.99, 392.00, 415.30, 440.00, 466.16, 493.88, 523.25]
   * 
   * const chromatic2Oct = FrequencyUtils.generateChromaticScale(440, 2);
   * console.log(chromatic2Oct.length); // 24 (2 octaves × 12 semitones)
   * ```
   */
  static generateChromaticScale(e, t = 1) {
    const i = [];
    for (let s = 0; s < 12 * t; s++) {
      const n = e * Math.pow(2, s / 12);
      i.push(n);
    }
    return i;
  }
  /**
   * Generates major scale frequencies from a base frequency
   * 
   * @description Creates an array of frequencies representing a major scale
   * using the pattern W-W-H-W-W-W-H (whole step, half step intervals).
   * 
   * @param baseFrequency - Starting frequency in Hz (tonic note)
   * @returns Array of 8 frequencies representing the major scale (including octave)
   * 
   * @example
   * ```typescript
   * const cMajor = FrequencyUtils.generateMajorScale(261.63); // C4 major
   * console.log(cMajor);
   * // [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25]
   * // [C4,     D4,     E4,     F4,     G4,     A4,     B4,     C5]
   * 
   * const gMajor = FrequencyUtils.generateMajorScale(392); // G4 major
   * console.log(gMajor.length); // 8 notes (including octave)
   * ```
   */
  static generateMajorScale(e) {
    return [0, 2, 4, 5, 7, 9, 11, 12].map((i) => e * Math.pow(2, i / 12));
  }
  /**
   * Generates natural minor scale frequencies from a base frequency
   * 
   * @description Creates an array of frequencies representing a natural minor scale
   * using the pattern W-H-W-W-H-W-W (whole step, half step intervals).
   * 
   * @param baseFrequency - Starting frequency in Hz (tonic note)
   * @returns Array of 8 frequencies representing the natural minor scale (including octave)
   * 
   * @example
   * ```typescript
   * const aMinor = FrequencyUtils.generateMinorScale(440); // A4 minor
   * console.log(aMinor);
   * // [440.00, 493.88, 523.25, 587.33, 659.25, 698.46, 783.99, 880.00]
   * // [A4,     B4,     C5,     D5,     E5,     F5,     G5,     A5]
   * 
   * const dMinor = FrequencyUtils.generateMinorScale(293.66); // D4 minor
   * console.log(dMinor.length); // 8 notes (including octave)
   * ```
   */
  static generateMinorScale(e) {
    return [0, 2, 3, 5, 7, 8, 10, 12].map((i) => e * Math.pow(2, i / 12));
  }
  /**
   * Calculates harmonic series frequencies for a given fundamental
   * 
   * @description Generates the harmonic series by multiplying the fundamental
   * frequency by integer values. Essential for understanding timbre and overtones.
   * 
   * @param fundamental - Fundamental frequency in Hz
   * @param maxHarmonic - Maximum harmonic number to calculate (default: 8)
   * @returns Array of harmonic frequencies including the fundamental
   * 
   * @example
   * ```typescript
   * const harmonics = FrequencyUtils.findHarmonics(220, 5); // A3 harmonics
   * console.log(harmonics);
   * // [220, 440, 660, 880, 1100] (A3, A4, E5, A5, C#6)
   * 
   * const allHarmonics = FrequencyUtils.findHarmonics(100, 8);
   * console.log(allHarmonics.length); // 8 harmonics
   * ```
   */
  static findHarmonics(e, t = 8) {
    const i = [];
    for (let s = 1; s <= t; s++)
      i.push(e * s);
    return i;
  }
  /**
   * Analyzes whether a frequency is a harmonic of a fundamental frequency
   * 
   * @description Tests if the given frequency matches a harmonic of the fundamental
   * within the specified tolerance. Returns detailed harmonic analysis.
   * 
   * @param frequency - Frequency to test in Hz
   * @param fundamental - Fundamental frequency in Hz
   * @param tolerance - Tolerance for harmonic matching (default: 0.05 = 5%)
   * @returns Object containing harmonic analysis results
   * 
   * @example
   * ```typescript
   * const result1 = FrequencyUtils.isHarmonic(440, 220);
   * console.log(result1);
   * // { isHarmonic: true, harmonicNumber: 2, exactFrequency: 440 }
   * 
   * const result2 = FrequencyUtils.isHarmonic(665, 220, 0.1);
   * console.log(result2);
   * // { isHarmonic: true, harmonicNumber: 3, exactFrequency: 660 } (within 10% tolerance)
   * 
   * const result3 = FrequencyUtils.isHarmonic(450, 220);
   * console.log(result3);
   * // { isHarmonic: false, harmonicNumber: null, exactFrequency: null }
   * ```
   */
  static isHarmonic(e, t, i = 0.05) {
    if (t <= 0 || e <= 0)
      return { isHarmonic: !1, harmonicNumber: null, exactFrequency: null };
    const s = e / t, n = Math.round(s);
    return n >= 1 && Math.abs(s - n) <= i ? {
      isHarmonic: !0,
      harmonicNumber: n,
      exactFrequency: t * n
    } : { isHarmonic: !1, harmonicNumber: null, exactFrequency: null };
  }
  /**
   * Calculate the fundamental frequency from a suspected harmonic
   */
  static calculateFundamental(e, t) {
    return t <= 0 || e <= 0 ? 0 : e / t;
  }
  /**
   * Convert frequency to scientific pitch notation
   */
  static frequencyToScientificPitch(e) {
    return M.frequencyToNote(e).name;
  }
  /**
   * Convert scientific pitch notation to frequency
   */
  static scientificPitchToFrequency(e) {
    const t = e.match(/^([A-G][#b]?)(-?\d+)$/);
    if (!t) return 0;
    const [, i, s] = t, n = parseInt(s, 10);
    let o = 0;
    const r = i[0], a = i.slice(1);
    o = {
      C: 0,
      D: 2,
      E: 4,
      F: 5,
      G: 7,
      A: 9,
      B: 11
    }[r] || 0, a === "#" ? o += 1 : a === "b" && (o -= 1);
    const h = (n + 1) * 12 + o;
    return M.midiToFrequency(h);
  }
  /**
   * Format frequency display with appropriate precision
   */
  static formatFrequency(e, t = 1) {
    return e === 0 ? "0 Hz" : e < 0.1 ? "<0.1 Hz" : e >= 1e4 ? `${Math.round(e / 1e3)}k Hz` : `${e.toFixed(t)} Hz`;
  }
  /**
   * Format cents display with sign
   */
  static formatCents(e) {
    return e === 0 ? "0¢" : `${e > 0 ? "+" : ""}${e}¢`;
  }
};
M.A4_FREQUENCY = 440, M.A4_MIDI_NUMBER = 69, M.NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"], M.FLAT_NOTE_NAMES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"], M.INTERVALS = {
  unison: 0,
  minorSecond: 1,
  majorSecond: 2,
  minorThird: 3,
  majorThird: 4,
  perfectFourth: 5,
  tritone: 6,
  perfectFifth: 7,
  minorSixth: 8,
  majorSixth: 9,
  minorSeventh: 10,
  majorSeventh: 11,
  octave: 12
};
let D = M;
const G = class G {
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
   * @param config.deviceOptimization - Enable automatic device optimization (default: true)
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
  constructor(e = {}) {
    this.pitchDetector = null, this.micController = null, this.currentState = "uninitialized", this.callbacks = {}, this.deviceSpecs = null, this.deviceSettings = null, this.uiUpdateTimer = null, this.isUpdatingSelectors = !1, this.uiElements = {}, this.lastError = null, this.isInitialized = !1, this.noteResetTimer = null, this.config = {
      volumeBarSelector: e.volumeBarSelector || "#volume-bar",
      volumeTextSelector: e.volumeTextSelector || "#volume-text",
      frequencySelector: e.frequencySelector || "#frequency-display",
      noteSelector: e.noteSelector || "#note-display",
      clarityThreshold: e.clarityThreshold ?? 0.4,
      minVolumeAbsolute: e.minVolumeAbsolute ?? 3e-3,
      fftSize: e.fftSize ?? 4096,
      smoothing: e.smoothing ?? 0.1,
      deviceOptimization: e.deviceOptimization ?? !0,
      uiUpdateInterval: e.uiUpdateInterval ?? 50,
      // 20fps
      autoUpdateUI: e.autoUpdateUI ?? !0,
      debug: e.debug ?? !1,
      logPrefix: e.logPrefix ?? "🎵 AudioDetection"
    }, this.audioManager = new De({
      sampleRate: 44100,
      channelCount: 1,
      echoCancellation: !1,
      noiseSuppression: !1,
      autoGainControl: !1
    }), this.config.deviceOptimization && this.detectAndOptimizeDevice(), this.debugLog("AudioDetectionComponent created with config:", this.config);
  }
  /** @private Helper method for creating delays */
  delay(e) {
    return new Promise((t) => setTimeout(t, e));
  }
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
  async initialize() {
    var e;
    if (this.isInitialized) {
      this.debugLog("Already initialized");
      return;
    }
    try {
      this.updateState("initializing"), this.debugLog("Starting initialization..."), this.micController = new tt({
        audioManager: {
          sampleRate: 44100,
          echoCancellation: !1,
          autoGainControl: !1
        },
        lifecycle: {
          maxAutoRecoveryAttempts: 3,
          healthCheckIntervalMs: 1e3
        },
        notifications: {
          enabled: this.config.debug
        }
      }), this.micController.setCallbacks({
        onStateChange: (t) => {
          this.debugLog("MicrophoneController state:", t);
        },
        onError: (t) => {
          this.handleError(t, "microphone_controller");
        },
        onDeviceChange: (t) => {
          var i, s;
          this.deviceSpecs = t, (s = (i = this.callbacks).onDeviceDetected) == null || s.call(i, t);
        }
      }), await this.micController.initialize(), this.pitchDetector = new Ke(this.audioManager, {
        clarityThreshold: this.config.clarityThreshold,
        minVolumeAbsolute: this.config.minVolumeAbsolute,
        fftSize: this.config.fftSize,
        smoothing: ((e = this.deviceSpecs) == null ? void 0 : e.smoothingFactor) ?? this.config.smoothing,
        // v1.1.8: Use DeviceDetection smoothing
        deviceOptimization: this.config.deviceOptimization
      }), this.pitchDetector.setCallbacks({
        onPitchUpdate: (t) => {
          this.handlePitchUpdate(t);
        },
        onError: (t) => {
          this.handleError(t, "pitch_detector");
        },
        onStateChange: (t) => {
          this.debugLog("PitchDetector state:", t);
        }
      }), await this.pitchDetector.initialize(), this.cacheUIElements(), this.deviceSettings && this.micController && (this.micController.setSensitivity(this.deviceSettings.sensitivityMultiplier), this.debugLog("Applied device-specific sensitivity:", this.deviceSettings.sensitivityMultiplier)), this.isInitialized = !0, this.updateState("ready"), this.debugLog("Initialization complete");
    } catch (t) {
      const i = this.createStructuredError(t, "initialization");
      throw T.logError(i, "AudioDetectionComponent initialization"), this.lastError = i, this.updateState("error"), i;
    }
  }
  /**
   * Sets callback functions for audio detection events
   * 
   * @param callbacks - Object containing callback functions
   * @param callbacks.onPitchUpdate - Called when pitch is detected
   * @param callbacks.onVolumeUpdate - Called when volume changes
   * @param callbacks.onStateChange - Called when component state changes
   * @param callbacks.onError - Called when errors occur
   * @param callbacks.onDeviceDetected - Called when device is detected
   * 
   * @example
   * ```typescript
   * audioDetector.setCallbacks({
   *   onPitchUpdate: (result) => {
   *     console.log(`${result.note} - ${result.frequency.toFixed(1)}Hz`);
   *   },
   *   onVolumeUpdate: (volume) => {
   *     console.log(`Volume: ${volume.toFixed(1)}%`);
   *   },
   *   onError: (error) => {
   *     console.error('Detection error:', error.message);
   *   }
   * });
   * ```
   */
  setCallbacks(e) {
    this.callbacks = { ...this.callbacks, ...e }, this.debugLog("Callbacks updated");
  }
  /**
   * Starts pitch detection and automatic UI updates
   * 
   * @returns True if detection started successfully, false otherwise
   * @throws {PitchProError} If component is not initialized or detection fails
   * 
   * @example
   * ```typescript
   * if (audioDetector.startDetection()) {
   *   console.log('Detection started successfully');
   * } else {
   *   console.log('Failed to start detection');
   * }
   * ```
   */
  startDetection() {
    if (!this.isInitialized || !this.pitchDetector) {
      const e = new w(
        "AudioDetectionComponentが初期化されていません。initialize()メソッドを先に呼び出してください。",
        U.AUDIO_CONTEXT_ERROR,
        {
          operation: "startDetection",
          isInitialized: this.isInitialized,
          hasPitchDetector: !!this.pitchDetector,
          currentState: this.currentState
        }
      );
      throw T.logError(e, "AudioDetection start"), this.handleError(e, "start_detection"), e;
    }
    try {
      return this.pitchDetector.startDetection() ? (this.updateState("detecting"), this.config.autoUpdateUI && this.startUIUpdates(), this.debugLog("Detection started successfully"), !0) : (this.debugLog("Failed to start detection"), !1);
    } catch (e) {
      const t = this.createStructuredError(e, "start_detection");
      throw this.handleError(t, "start_detection"), t;
    }
  }
  /**
   * Stops pitch detection and UI updates
   * 
   * @example
   * ```typescript
   * audioDetector.stopDetection();
   * console.log('Detection stopped');
   * ```
   */
  stopDetection() {
    try {
      this.pitchDetector && this.pitchDetector.stopDetection(), this.stopUIUpdates(), this.updateState("stopped"), this.debugLog("Detection stopped");
    } catch (e) {
      const t = this.createStructuredError(e, "stop_detection");
      this.handleError(t, "stop_detection");
    }
  }
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
  updateUI(e) {
    var t, i;
    if (this.isUpdatingSelectors) {
      this.debugLog("UI update skipped - selectors are being updated");
      return;
    }
    try {
      if (this.uiElements.volumeBar && this.config.volumeBarSelector) {
        const s = document.querySelector(this.config.volumeBarSelector);
        if (s && s === this.uiElements.volumeBar) {
          const n = Math.min(100, e.volume * (((t = this.deviceSettings) == null ? void 0 : t.volumeMultiplier) ?? 1));
          this.uiElements.volumeBar instanceof HTMLProgressElement ? this.uiElements.volumeBar.value = n : this.uiElements.volumeBar.style.width = `${n}%`;
        }
      }
      if (this.uiElements.volumeText && this.config.volumeTextSelector) {
        const s = document.querySelector(this.config.volumeTextSelector);
        if (s && s === this.uiElements.volumeText) {
          const n = Math.min(100, e.volume * (((i = this.deviceSettings) == null ? void 0 : i.volumeMultiplier) ?? 1));
          this.uiElements.volumeText.textContent = `${n.toFixed(1)}%`;
        }
      }
      if (this.uiElements.frequency && this.config.frequencySelector) {
        const s = document.querySelector(this.config.frequencySelector);
        s && s === this.uiElements.frequency && (e.frequency && e.frequency > 0 ? this.uiElements.frequency.textContent = D.formatFrequency(e.frequency) : this.uiElements.frequency.textContent = "0.0 Hz");
      }
      if (this.uiElements.note && this.config.noteSelector && this.config.noteSelector !== "#note-display") {
        const s = document.querySelector(this.config.noteSelector);
        if (s && s === this.uiElements.note)
          if (e.frequency && e.frequency > 0) {
            this.noteResetTimer && (clearTimeout(this.noteResetTimer), this.noteResetTimer = null);
            const n = D.frequencyToNote(e.frequency);
            this.debugLog(`Updating note display: ${this.uiElements.note.id || "unknown-id"} with note: ${n.name} (selector: ${this.config.noteSelector})`), this.uiElements.note.textContent = n.name;
          } else
            this.noteResetTimer || (this.noteResetTimer = window.setTimeout(() => {
              this.uiElements.note && (this.debugLog(`Resetting note display: ${this.uiElements.note.id || "unknown-id"} to "-" (delayed, selector: ${this.config.noteSelector})`), this.uiElements.note.textContent = "-"), this.noteResetTimer = null;
            }, G.NOTE_RESET_DELAY_MS));
        else
          this.debugLog(`Note element mismatch: cached element does not match current selector ${this.config.noteSelector} - skipping update to prevent cross-mode interference`);
      } else
        this.config.noteSelector ? this.debugLog("Note element not found in uiElements.note - check selector caching") : this.debugLog("Note updates skipped - no noteSelector configured");
    } catch (s) {
      this.debugLog("UI update error:", s);
    }
  }
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
  async updateSelectors(e) {
    this.debugLog("Updating selectors:", e), this.isUpdatingSelectors = !0;
    const t = this.uiUpdateTimer !== null;
    t && this.stopUIUpdates(), await this.delay(G.SELECTOR_UPDATE_DELAY_MS), this.resetAllUIElements(), e.volumeBarSelector !== void 0 && (this.config.volumeBarSelector = e.volumeBarSelector), e.volumeTextSelector !== void 0 && (this.config.volumeTextSelector = e.volumeTextSelector), e.frequencySelector !== void 0 && (this.config.frequencySelector = e.frequencySelector), e.noteSelector !== void 0 ? this.config.noteSelector = e.noteSelector : (this.config.noteSelector = "", this.debugLog("noteSelector cleared automatically to prevent cross-mode interference")), this.cacheUIElements(), await this.delay(G.SELECTOR_UPDATE_DELAY_MS), this.resetAllUIElements(), this.isUpdatingSelectors = !1, t && (await this.delay(G.UI_RESTART_DELAY_MS), this.startUIUpdates()), this.debugLog("Selectors updated, all elements reset, and UI elements re-cached:", Object.keys(this.uiElements));
  }
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
  resetRecoveryAttempts() {
    this.debugLog("Resetting recovery attempts...");
    try {
      this.micController ? (this.micController.resetRecoveryAttempts(), this.debugLog("Recovery attempts reset successfully")) : this.debugLog("No microphone controller available to reset");
    } catch (e) {
      throw this.debugLog("Error resetting recovery attempts:", e), e;
    }
  }
  destroy() {
    this.debugLog("Destroying AudioDetectionComponent...");
    try {
      this.stopDetection(), this.noteResetTimer && (clearTimeout(this.noteResetTimer), this.noteResetTimer = null), this.pitchDetector && (this.pitchDetector.destroy(), this.pitchDetector = null), this.micController && (this.micController.destroy(), this.micController = null), this.uiElements = {}, this.isInitialized = !1, this.currentState = "uninitialized", this.callbacks = {}, this.lastError = null, this.debugLog("AudioDetectionComponent destroyed");
    } catch (e) {
      console.error("Error during AudioDetectionComponent destruction:", e);
    }
  }
  /**
   * Gets current component status for debugging
   * 
   * @returns Status object with current state information
   */
  getStatus() {
    var e, t;
    return {
      state: this.currentState,
      isInitialized: this.isInitialized,
      deviceSpecs: this.deviceSpecs,
      deviceSettings: this.deviceSettings,
      config: this.config,
      lastError: this.lastError,
      pitchDetectorStatus: (e = this.pitchDetector) == null ? void 0 : e.getStatus(),
      micControllerStatus: (t = this.micController) == null ? void 0 : t.getStatus()
    };
  }
  // Private methods implementation continues...
  // (Will be implemented in the next part)
  /**
   * Detects device type and applies optimization settings
   * @private
   */
  detectAndOptimizeDevice() {
    this.deviceSpecs = K.getDeviceSpecs();
    const e = {
      PC: {
        volumeMultiplier: 3,
        sensitivityMultiplier: 2.5,
        minVolumeAbsolute: this.deviceSpecs.noiseGate * 0.25
        // Based on DeviceDetection noiseGate
      },
      iPhone: {
        volumeMultiplier: 4.5,
        sensitivityMultiplier: 3.5,
        minVolumeAbsolute: this.deviceSpecs.noiseGate * 0.27
        // Based on DeviceDetection noiseGate
      },
      iPad: {
        volumeMultiplier: 7,
        sensitivityMultiplier: 5,
        minVolumeAbsolute: this.deviceSpecs.noiseGate * 0.28
        // Based on DeviceDetection noiseGate
      }
    };
    this.deviceSettings = e[this.deviceSpecs.deviceType] || e.PC, this.config.minVolumeAbsolute = this.deviceSettings.minVolumeAbsolute, this.debugLog("Device optimization applied:", {
      device: this.deviceSpecs.deviceType,
      settings: this.deviceSettings
    });
  }
  /**
   * Caches UI elements for efficient updates
   * @private
   */
  cacheUIElements() {
    var e;
    this.config.volumeBarSelector && (this.uiElements.volumeBar = document.querySelector(this.config.volumeBarSelector) || void 0), this.config.volumeTextSelector && (this.uiElements.volumeText = document.querySelector(this.config.volumeTextSelector) || void 0), this.config.frequencySelector && (this.uiElements.frequency = document.querySelector(this.config.frequencySelector) || void 0), this.config.noteSelector && (this.uiElements.note = document.querySelector(this.config.noteSelector) || void 0, this.debugLog(`Note element cached: selector="${this.config.noteSelector}", found=${!!this.uiElements.note}, id="${((e = this.uiElements.note) == null ? void 0 : e.id) || "no-id"}"`)), this.debugLog("UI elements cached:", Object.keys(this.uiElements));
  }
  /**
   * Resets all UI elements to their initial state (0 values)
   * @private
   */
  resetAllUIElements() {
    try {
      const e = [
        // Mic mode selectors (all possible variations)
        "#mic-volume-bar",
        "#mic-volume-text",
        "#mic-frequency",
        "#mic-frequency-display",
        // Range mode selectors (all possible variations)
        "#range-volume-bar",
        "#range-volume-text",
        "#range-frequency",
        "#range-frequency-value",
        "#range-frequency-display",
        // Practice mode selectors (always reset note display when switching modes)
        "#practice-volume-bar",
        "#practice-volume-text",
        "#practice-frequency",
        "#practice-note",
        // Add common frequency display patterns
        "#freq-1",
        "#freq-2",
        "#freq-3",
        "#freq-4",
        "#freq-5",
        "#frequency-1",
        "#frequency-2",
        "#frequency-3",
        "#pitch-1",
        "#pitch-2",
        "#pitch-3",
        // Also reset current configuration selectors
        this.config.volumeBarSelector,
        this.config.volumeTextSelector,
        this.config.frequencySelector,
        this.config.noteSelector
      ];
      document.querySelectorAll('[id*="freq"]:not(.frequency-group):not(.frequency-box), [id*="frequency"]:not(.frequency-group):not(.frequency-box), [id*="pitch"]:not(.frequency-group):not(.frequency-box)').forEach((i) => {
        const s = i.textContent || "";
        (s.includes("Hz") || s.match(/^\d+\.?\d*$/)) && (i.classList.contains("frequency-display") || i.id.includes("freq-")) && (i.textContent = "0.0 Hz");
      }), e.forEach((i) => {
        if (i) {
          const s = document.querySelector(i);
          if (s) {
            if (this.debugLog(`Processing selector: ${i}, element found: ${!!s}`), i.includes("volume-bar"))
              s instanceof HTMLProgressElement ? s.value = 0 : s.style.width = "0%";
            else if (i.includes("volume-text"))
              s.textContent = "0.0%";
            else if (i.includes("frequency"))
              s.textContent = "0.0 Hz", s.innerHTML = "0.0 Hz", s.setAttribute("data-frequency", "0"), s.style.display !== "none" && (s.style.opacity = "0.99", s.offsetHeight, s.style.opacity = "");
            else if (i.includes("note")) {
              const n = s.textContent, o = s.innerHTML;
              this.debugLog(`Resetting note element: ${i}, textContent: "${n}", innerHTML: "${o}"`), s.textContent = "-", s.innerHTML = "-", s.style.opacity = "0.99", s.offsetHeight, s.style.opacity = "", this.debugLog(`Note reset complete: ${i}, new textContent: "${s.textContent}", new innerHTML: "${s.innerHTML}"`);
            }
          }
        }
      }), this.debugLog("All UI elements reset to initial state");
    } catch (e) {
      this.debugLog("Error resetting UI elements:", e);
    }
  }
  /**
   * Handles pitch update events from PitchDetector
   * @private
   */
  handlePitchUpdate(e) {
    var t, i, s, n;
    (i = (t = this.callbacks).onPitchUpdate) == null || i.call(t, e), (n = (s = this.callbacks).onVolumeUpdate) == null || n.call(s, e.volume);
  }
  /**
   * Starts UI update timer
   * @private
   */
  startUIUpdates() {
    this.uiUpdateTimer && clearInterval(this.uiUpdateTimer), this.uiUpdateTimer = window.setInterval(() => {
      if (this.pitchDetector && this.currentState === "detecting") {
        const e = this.pitchDetector.getLatestResult();
        e ? this.updateUI(e) : this.updateUI({
          frequency: 0,
          note: "-",
          octave: 0,
          volume: 0,
          clarity: 0
        });
      }
    }, this.config.uiUpdateInterval);
  }
  /**
   * Stops UI update timer
   * @private
   */
  stopUIUpdates() {
    this.uiUpdateTimer && (clearInterval(this.uiUpdateTimer), this.uiUpdateTimer = null);
  }
  /**
   * Updates component state and notifies callbacks
   * @private
   */
  updateState(e) {
    var t, i;
    if (this.currentState !== e) {
      const s = this.currentState;
      this.currentState = e, this.debugLog(`State changed: ${s} → ${e}`), (i = (t = this.callbacks).onStateChange) == null || i.call(t, e);
    }
  }
  /**
   * Handles errors with proper logging and callback notification
   * @private
   */
  handleError(e, t) {
    var s, n;
    const i = e instanceof w ? e : this.createStructuredError(e, t);
    this.lastError = i, this.updateState("error"), (n = (s = this.callbacks).onError) == null || n.call(s, i), this.debugLog("Error handled:", i.toJSON());
  }
  /**
   * Creates structured error with context information
   * @private
   */
  createStructuredError(e, t) {
    return e.message.includes("Permission denied") || e.message.includes("NotAllowedError") || e.message.includes("permission") ? new be(
      "マイクへのアクセス許可が拒否されました。ブラウザの設定でマイクアクセスを許可してください。",
      {
        operation: t,
        originalError: e.message,
        deviceSpecs: this.deviceSpecs,
        componentState: this.currentState
      }
    ) : e.message.includes("AudioContext") || e.message.includes("audio") || e.message.includes("initialization") ? new j(
      "オーディオシステムの初期化に失敗しました。デバイスの音響設定を確認するか、ブラウザを再起動してください。",
      {
        operation: t,
        originalError: e.message,
        componentState: this.currentState,
        deviceSpecs: this.deviceSpecs
      }
    ) : new w(
      `${t}中に予期しないエラーが発生しました: ${e.message}`,
      U.PITCH_DETECTION_ERROR,
      {
        operation: t,
        originalError: e.message,
        stack: e.stack,
        componentState: this.currentState,
        isInitialized: this.isInitialized
      }
    );
  }
  /**
   * Debug logging utility
   * @private
   */
  debugLog(e, ...t) {
    this.config.debug && console.log(`${this.config.logPrefix} ${e}`, ...t);
  }
};
G.NOTE_RESET_DELAY_MS = 300, G.SELECTOR_UPDATE_DELAY_MS = 50, G.UI_RESTART_DELAY_MS = 200;
let Te = G;
class ct {
  constructor(e = {}) {
    this.historyBuffer = [], this.config = {
      historyWindowMs: 2e3,
      minConfidenceThreshold: 0.6,
      harmonicToleranceCents: 30,
      maxHarmonicNumber: 8,
      stabilityWeight: 0.7,
      volumeWeight: 0.3
    }, this.config = { ...this.config, ...e };
  }
  /**
   * Apply harmonic correction to detected frequency
   */
  correctFrequency(e, t = 1) {
    const i = Date.now();
    this.cleanHistory(i), this.addToHistory(e, t, i);
    const s = this.analyzeHarmonics(e);
    return s.confidence >= this.config.minConfidenceThreshold ? {
      correctedFreq: s.correctedFrequency,
      confidence: s.confidence,
      correctionApplied: Math.abs(s.correctedFrequency - e) > 1
    } : {
      correctedFreq: e,
      confidence: s.confidence,
      correctionApplied: !1
    };
  }
  /**
   * Analyze frequency for harmonic patterns
   */
  analyzeHarmonics(e) {
    if (this.historyBuffer.length < 3)
      return {
        correctedFrequency: e,
        confidence: 0.1
      };
    const t = this.historyBuffer.slice(-10).map((n) => n.frequency), i = this.findFundamentalCandidates(e);
    let s = {
      frequency: e,
      confidence: 0.1,
      harmonicNumber: 1
    };
    for (const n of i) {
      const o = this.calculateHarmonicConfidence(
        n.fundamental,
        n.harmonicNumber,
        t
      );
      o > s.confidence && (s = {
        frequency: n.fundamental,
        confidence: o,
        harmonicNumber: n.harmonicNumber
      });
    }
    return s.harmonicNumber > 1 && s.confidence > this.config.minConfidenceThreshold ? {
      correctedFrequency: s.frequency,
      confidence: s.confidence,
      harmonicNumber: s.harmonicNumber,
      fundamentalCandidate: s.frequency
    } : {
      correctedFrequency: e,
      confidence: s.confidence
    };
  }
  /**
   * Find potential fundamental frequencies for a given detected frequency
   */
  findFundamentalCandidates(e) {
    const t = [];
    for (let i = 2; i <= this.config.maxHarmonicNumber; i++) {
      const s = e / i;
      if (s < 60) continue;
      const n = s * i, o = Math.abs(1200 * Math.log2(e / n));
      if (o <= this.config.harmonicToleranceCents) {
        const r = 1 - o / this.config.harmonicToleranceCents;
        t.push({
          fundamental: s,
          harmonicNumber: i,
          likelihood: r
        });
      }
    }
    return t.push({
      fundamental: e,
      harmonicNumber: 1,
      likelihood: 0.5
    }), t.sort((i, s) => s.likelihood - i.likelihood);
  }
  /**
   * Calculate confidence that a frequency pattern represents a harmonic series
   */
  calculateHarmonicConfidence(e, t, i) {
    if (i.length < 3) return 0.1;
    let s = 0, n = 0;
    for (const a of i) {
      let c = Math.round(a / e);
      c < 1 && (c = 1);
      const h = e * c, f = Math.abs(1200 * Math.log2(a / h));
      if (f <= this.config.harmonicToleranceCents * 2) {
        const d = 1 - f / (this.config.harmonicToleranceCents * 2);
        s += d, n++;
      }
    }
    if (n === 0) return 0.1;
    const o = s / n, r = Math.min(n / i.length, 1);
    return Math.min(o * this.config.stabilityWeight + r * (1 - this.config.stabilityWeight), 1);
  }
  /**
   * Add frequency detection to history
   */
  addToHistory(e, t, i) {
    const s = Math.min(t, 1);
    let n = 0.5;
    if (this.historyBuffer.length > 0) {
      const r = this.historyBuffer[this.historyBuffer.length - 1].frequency, a = Math.max(e, r) / Math.min(e, r);
      n = Math.max(0, 1 - (a - 1) * 5);
    }
    const o = s * this.config.volumeWeight + n * (1 - this.config.volumeWeight);
    this.historyBuffer.push({
      frequency: e,
      confidence: o,
      timestamp: i,
      volume: t
    }), this.historyBuffer.length > 50 && this.historyBuffer.shift();
  }
  /**
   * Clean old entries from history
   */
  cleanHistory(e) {
    const t = e - this.config.historyWindowMs;
    this.historyBuffer = this.historyBuffer.filter((i) => i.timestamp > t);
  }
  /**
   * Reset correction history
   */
  resetHistory() {
    this.historyBuffer = [];
  }
  /**
   * Get current analysis statistics
   */
  getAnalysisStats() {
    if (this.historyBuffer.length === 0)
      return {
        historyLength: 0,
        averageConfidence: 0,
        frequencyRange: null,
        stabilityScore: 0
      };
    const e = this.historyBuffer.map((h) => h.frequency), t = this.historyBuffer.map((h) => h.confidence), i = t.reduce((h, f) => h + f, 0) / t.length, s = Math.min(...e), n = Math.max(...e), o = e.reduce((h, f) => h + f, 0) / e.length, r = e.reduce((h, f) => h + Math.pow(f - o, 2), 0) / e.length, a = Math.sqrt(r) / o, c = Math.max(0, 1 - a);
    return {
      historyLength: this.historyBuffer.length,
      averageConfidence: i,
      frequencyRange: { min: s, max: n },
      stabilityScore: c
    };
  }
  /**
   * Configure correction parameters
   */
  updateConfig(e) {
    this.config = { ...this.config, ...e };
  }
}
const Q = {
  EXCELLENT: "excellent",
  GOOD: "good",
  FAIR: "fair",
  POOR: "poor"
};
class lt {
  constructor(e = {}) {
    this.analysisBuffer = [], this.config = {
      analysisWindowMs: 3e3,
      stabilityThresholdCents: 20,
      vibratoMinRate: 4.5,
      vibratoMaxRate: 7.5,
      vibratoMinDepthCents: 50,
      breathinessThreshold: 0.3,
      minAnalysisTime: 1e3
    }, this.config = { ...this.config, ...e };
  }
  /**
   * Analyze voice characteristics from audio data
   */
  analyzeVoice(e, t, i, s) {
    const n = Date.now();
    this.addToBuffer(e, t, i, n), this.cleanBuffer(n);
    const o = this.calculateStability(), r = this.detectVibrato(), a = s ? this.analyzeBreathiness(s) : null, c = this.analyzeConsistency(), h = this.calculateOverallQuality(o, r, a, c), f = this.generateRecommendations(
      h,
      o,
      r,
      a,
      c
    );
    return {
      quality: h,
      stability: o,
      recommendations: f
    };
  }
  /**
   * Calculate pitch stability
   */
  calculateStability() {
    if (this.analysisBuffer.length < 10)
      return 0.5;
    const t = this.analysisBuffer.map((a) => a.frequency).filter((a) => a > 0);
    if (t.length < 5)
      return 0.3;
    const i = t.reduce((a, c) => a + c, 0) / t.length, s = t.reduce((a, c) => a + Math.pow(c - i, 2), 0) / t.length, r = Math.sqrt(s) / i * 1200;
    return Math.max(0, Math.min(1, 1 - r / 100));
  }
  /**
   * Detect vibrato characteristics
   */
  detectVibrato() {
    if (this.analysisBuffer.length < 30)
      return { detected: !1, rate: null, depth: null, regularity: null };
    const e = this.analysisBuffer.map((d) => d.frequency).filter((d) => d > 0);
    if (e.length < 20)
      return { detected: !1, rate: null, depth: null, regularity: null };
    const t = this.smoothFrequencies(e, 3), i = this.findExtrema(t);
    if (i.length < 4)
      return { detected: !1, rate: null, depth: null, regularity: null };
    const s = (this.analysisBuffer[this.analysisBuffer.length - 1].timestamp - this.analysisBuffer[0].timestamp) / 1e3, o = i.length / 2 / s, r = [];
    for (let d = 0; d < i.length - 1; d++) {
      const u = t[i[d].index], m = t[i[d + 1].index];
      if (u > 0 && m > 0) {
        const g = Math.abs(1200 * Math.log2(u / m));
        r.push(g);
      }
    }
    const a = r.length > 0 ? r.reduce((d, u) => d + u, 0) / r.length : 0, c = [];
    for (let d = 0; d < i.length - 2; d += 2) {
      const u = i[d + 2].index - i[d].index;
      c.push(u);
    }
    let h = 0;
    if (c.length > 2) {
      const d = c.reduce((m, g) => m + g, 0) / c.length, u = c.reduce((m, g) => m + Math.pow(g - d, 2), 0) / c.length;
      h = Math.max(0, 1 - Math.sqrt(u) / d);
    }
    return {
      detected: o >= this.config.vibratoMinRate && o <= this.config.vibratoMaxRate && a >= this.config.vibratoMinDepthCents,
      rate: o,
      depth: a,
      regularity: h
    };
  }
  /**
   * Analyze breathiness from spectral data
   */
  analyzeBreathiness(e) {
    const t = Math.floor(e.length * 0.1), i = e.slice(Math.floor(e.length * 0.7)), s = e.slice(0, t * 2).reduce((r, a) => r + a * a, 0), n = i.reduce((r, a) => r + a * a, 0);
    if (s === 0) return 1;
    const o = n / s;
    return Math.min(1, o);
  }
  /**
   * Analyze consistency over time
   */
  analyzeConsistency() {
    if (this.analysisBuffer.length < 10) return 0.5;
    const e = this.analysisBuffer.map((n) => n.volume), t = this.analysisBuffer.map((n) => n.clarity), i = this.calculateConsistencyScore(e), s = this.calculateConsistencyScore(t);
    return (i + s) / 2;
  }
  /**
   * Calculate consistency score for an array of values
   */
  calculateConsistencyScore(e) {
    if (e.length < 3) return 0.5;
    const t = e.reduce((n, o) => n + o, 0) / e.length, i = e.reduce((n, o) => n + Math.pow(o - t, 2), 0) / e.length, s = Math.sqrt(i) / (t || 1);
    return Math.max(0, Math.min(1, 1 - s));
  }
  /**
   * Calculate overall voice quality
   */
  calculateOverallQuality(e, t, i, s) {
    const n = {
      stability: 0.4,
      consistency: 0.3,
      breathiness: 0.2,
      vibrato: 0.1
    };
    let o = e * n.stability + s * n.consistency;
    return i !== null ? o += (1 - Math.min(i, 1)) * n.breathiness : o += 0.7 * n.breathiness, t.detected && t.regularity > 0.7 ? o += 0.9 * n.vibrato : t.detected ? o += 0.6 * n.vibrato : o += 0.5 * n.vibrato, o >= 0.85 ? Q.EXCELLENT : o >= 0.7 ? Q.GOOD : o >= 0.5 ? Q.FAIR : Q.POOR;
  }
  /**
   * Generate recommendations based on analysis
   */
  generateRecommendations(e, t, i, s, n) {
    const o = [];
    return t < 0.5 ? (o.push("音程の安定性を向上させるため、ゆっくりとした発声練習を行ってください"), o.push("腹式呼吸を意識して、息の流れを一定に保つ練習をしてください")) : t < 0.7 && o.push("音程の微調整練習で、より正確なピッチコントロールを目指しましょう"), n < 0.5 && (o.push("音量と音質の一貫性を保つため、定期的な発声練習を継続してください"), o.push("録音を聞き返して、自分の声の特徴を把握しましょう")), s !== null && s > 0.6 && (o.push("声の息漏れが気になります。発声時の喉の締まりを意識してください"), o.push("ハミング練習で、クリアな声質を目指しましょう")), i.detected ? i.regularity < 0.5 ? o.push("ビブラートの規則性を改善するため、メトロノームに合わせた練習をしてください") : i.rate > 7.5 && o.push("ビブラートの速度が速すぎます。よりゆったりとしたビブラートを練習してください") : (e === Q.GOOD || e === Q.EXCELLENT) && o.push("美しいビブラートの習得に挑戦してみましょう"), e === Q.POOR ? (o.push("基礎的な発声練習から始めることをお勧めします"), o.push("専門的な指導を受けることを検討してください")) : e === Q.EXCELLENT && o.push("素晴らしい声質です。この状態を維持する練習を続けてください"), o;
  }
  /**
   * Smooth frequency data using moving average
   */
  smoothFrequencies(e, t) {
    const i = [];
    for (let s = 0; s < e.length; s++) {
      let n = 0, o = 0;
      const r = Math.max(0, s - Math.floor(t / 2)), a = Math.min(e.length, s + Math.floor(t / 2) + 1);
      for (let c = r; c < a; c++)
        n += e[c], o++;
      i.push(n / o);
    }
    return i;
  }
  /**
   * Find local extrema (peaks and valleys) in frequency data
   */
  findExtrema(e) {
    const t = [];
    for (let i = 1; i < e.length - 1; i++) {
      const s = e[i - 1], n = e[i], o = e[i + 1];
      n > s && n > o ? t.push({ index: i, value: n, type: "peak" }) : n < s && n < o && t.push({ index: i, value: n, type: "valley" });
    }
    return t;
  }
  /**
   * Add data to analysis buffer
   */
  addToBuffer(e, t, i, s) {
    this.analysisBuffer.push({ frequency: e, volume: t, clarity: i, timestamp: s }), this.analysisBuffer.length > 200 && this.analysisBuffer.shift();
  }
  /**
   * Clean old data from buffer
   */
  cleanBuffer(e) {
    const t = e - this.config.analysisWindowMs;
    this.analysisBuffer = this.analysisBuffer.filter((i) => i.timestamp > t);
  }
  /**
   * Reset analysis buffer
   */
  reset() {
    this.analysisBuffer = [];
  }
  /**
   * Get current buffer statistics
   */
  getBufferStats() {
    if (this.analysisBuffer.length === 0)
      return { entryCount: 0, timeSpanMs: 0, averageVolume: 0, averageClarity: 0 };
    const e = this.analysisBuffer.map((s) => s.volume), t = this.analysisBuffer.map((s) => s.clarity), i = this.analysisBuffer[this.analysisBuffer.length - 1].timestamp - this.analysisBuffer[0].timestamp;
    return {
      entryCount: this.analysisBuffer.length,
      timeSpanMs: i,
      averageVolume: e.reduce((s, n) => s + n, 0) / e.length,
      averageClarity: t.reduce((s, n) => s + n, 0) / t.length
    };
  }
}
class ht {
  constructor() {
    this.calibrationData = null, this.isCalibrated = !1, this.calibrationInProgress = !1, this.deviceSpecs = K.getDeviceSpecs();
  }
  /**
   * Perform automatic calibration
   */
  async calibrate(e, t) {
    if (this.calibrationInProgress)
      throw new Error("Calibration already in progress");
    this.calibrationInProgress = !0;
    try {
      console.log("🎛️ [CalibrationSystem] Starting device calibration");
      const i = await this.measureBackgroundNoise(e, t), s = await this.calibrateVolumeLevels(e, t), n = await this.measureFrequencyResponse(e, t), o = this.calculateOptimalSettings(
        i,
        s,
        n
      );
      return this.calibrationData = {
        volumeOffset: s.offset,
        frequencyResponse: n,
        noiseProfile: i,
        optimalSettings: o
      }, this.isCalibrated = !0, this.calibrationInProgress = !1, console.log("✅ [CalibrationSystem] Calibration completed successfully"), {
        success: !0,
        calibrationData: this.calibrationData,
        recommendedSettings: o
      };
    } catch (i) {
      return console.error("❌ [CalibrationSystem] Calibration failed:", i), this.calibrationInProgress = !1, {
        success: !1,
        calibrationData: null,
        recommendedSettings: this.getDefaultSettings(),
        error: i
      };
    }
  }
  /**
   * Measure background noise levels
   */
  async measureBackgroundNoise(e, t, i = 2e3) {
    return new Promise((s) => {
      const n = e.createAnalyser();
      n.fftSize = 2048;
      const o = e.createMediaStreamSource(t);
      o.connect(n);
      const r = n.frequencyBinCount, a = new Float32Array(r), c = [], h = Date.now(), f = () => {
        if (Date.now() - h >= i) {
          const d = {};
          for (let u = 0; u < r; u++) {
            const m = u * e.sampleRate / n.fftSize;
            let g = 0;
            for (const y of c)
              g += y[u];
            d[Math.round(m)] = g / c.length;
          }
          o.disconnect(), s(d);
          return;
        }
        n.getFloatFrequencyData(a), c.push(new Float32Array(a)), setTimeout(f, 100);
      };
      f();
    });
  }
  /**
   * Calibrate volume levels
   */
  async calibrateVolumeLevels(e, t, i = 3e3) {
    return new Promise((s) => {
      const n = e.createAnalyser();
      n.fftSize = 1024;
      const o = e.createMediaStreamSource(t);
      o.connect(n);
      const r = n.fftSize, a = new Float32Array(r), c = [], h = Date.now(), f = () => {
        if (Date.now() - h >= i) {
          c.sort((A, p) => A - p);
          const m = c[0] || 0, g = c[c.length - 1] || 1, S = 0.3 - (c[Math.floor(c.length / 2)] || 0.5);
          o.disconnect(), s({
            offset: S,
            range: { min: m, max: g }
          });
          return;
        }
        n.getFloatTimeDomainData(a);
        let d = 0;
        for (let m = 0; m < r; m++)
          d += a[m] * a[m];
        const u = Math.sqrt(d / r);
        c.push(u), setTimeout(f, 50);
      };
      f();
    });
  }
  /**
   * Measure frequency response (simplified version)
   */
  async measureFrequencyResponse(e, t, i = 5e3) {
    return new Promise((s) => {
      const n = e.createAnalyser();
      n.fftSize = 4096;
      const o = e.createMediaStreamSource(t);
      o.connect(n);
      const r = n.frequencyBinCount, a = new Float32Array(r), c = {}, h = Date.now(), f = () => {
        if (Date.now() - h >= i) {
          const d = {};
          Object.keys(c).forEach((u) => {
            const m = parseInt(u), g = c[m], y = g.reduce((v, S) => v + S, 0) / g.length;
            d[m] = y;
          }), o.disconnect(), s(d);
          return;
        }
        n.getFloatFrequencyData(a);
        for (let d = 0; d < r; d++) {
          const u = Math.round(d * e.sampleRate / n.fftSize);
          u >= 80 && u <= 1e3 && (c[u] || (c[u] = []), c[u].push(a[d]));
        }
        setTimeout(f, 100);
      };
      f();
    });
  }
  /**
   * Calculate optimal settings based on calibration data
   */
  calculateOptimalSettings(e, t, i) {
    const s = this.getDefaultSettings(), n = Math.max(0.5, Math.min(2, 1 - t.offset)), o = s.sensitivity * n, a = Object.keys(e).map((p) => parseInt(p)).filter((p) => p >= 100 && p <= 800).map((p) => e[p]), c = a.length > 0 ? a.reduce((p, E) => p + E, 0) / a.length : -60, h = Math.max(-20, c + 10), f = Math.max(s.noiseGate, Math.abs(h) / 1e3), u = Object.keys(i).map((p) => parseInt(p)).sort((p, E) => p - E).map((p) => i[p]), m = u.slice(0, Math.floor(u.length * 0.3)), g = u.slice(
      Math.floor(u.length * 0.3),
      Math.floor(u.length * 0.7)
    ), y = u.slice(Math.floor(u.length * 0.7)), v = m.reduce((p, E) => p + E, 0) / m.length, S = g.reduce((p, E) => p + E, 0) / g.length, A = y.reduce((p, E) => p + E, 0) / y.length;
    return {
      sensitivity: Math.round(o * 10) / 10,
      noiseGate: Math.round(f * 1e3) / 1e3,
      volumeOffset: t.offset,
      filterSettings: {
        highpassFreq: v < S - 5 ? 100 : 80,
        // Stronger highpass if low freq is weak
        lowpassFreq: A > S + 3 ? 600 : 800,
        // Lower cutoff if high freq is strong
        notchFreq: 60,
        // Standard power line frequency
        highpassQ: 0.7,
        lowpassQ: 0.7,
        notchQ: 10
      },
      deviceAdjustments: {
        lowFreqCompensation: Math.max(0.8, Math.min(1.5, S / (v || -60))),
        highFreqCompensation: Math.max(0.8, Math.min(1.2, S / (A || -60)))
      }
    };
  }
  /**
   * Get default settings for current device
   */
  getDefaultSettings() {
    return {
      sensitivity: this.deviceSpecs.sensitivity,
      noiseGate: this.deviceSpecs.noiseGate,
      volumeOffset: 0,
      filterSettings: {
        highpassFreq: 80,
        lowpassFreq: 800,
        notchFreq: 60,
        highpassQ: 0.7,
        lowpassQ: 0.7,
        notchQ: 10
      }
    };
  }
  /**
   * Apply calibrated settings to audio processing
   */
  applyCalibration(e) {
    if (!this.isCalibrated || !this.calibrationData)
      return console.warn("⚠️ [CalibrationSystem] No calibration data available"), !1;
    try {
      const t = this.calibrationData.optimalSettings;
      return e.setSensitivity && e.setSensitivity(t.sensitivity), e.setNoiseGate && e.setNoiseGate(t.noiseGate), e.updateFilterSettings && e.updateFilterSettings(t.filterSettings), console.log("✅ [CalibrationSystem] Calibration applied successfully"), !0;
    } catch (t) {
      return console.error("❌ [CalibrationSystem] Failed to apply calibration:", t), !1;
    }
  }
  /**
   * Get calibration status
   */
  getCalibrationStatus() {
    return {
      isCalibrated: this.isCalibrated,
      inProgress: this.calibrationInProgress,
      deviceSpecs: this.deviceSpecs,
      calibrationData: this.calibrationData
    };
  }
  /**
   * Reset calibration
   */
  reset() {
    this.isCalibrated = !1, this.calibrationInProgress = !1, this.calibrationData = null, console.log("🔄 [CalibrationSystem] Calibration reset");
  }
  /**
   * Save calibration data to localStorage
   */
  saveCalibration() {
    if (!this.isCalibrated || !this.calibrationData)
      return !1;
    try {
      const e = `pitchpro_calibration_${this.deviceSpecs.deviceType}`, t = {
        deviceSpecs: this.deviceSpecs,
        calibrationData: this.calibrationData,
        timestamp: Date.now()
      };
      return localStorage.setItem(e, JSON.stringify(t)), console.log("💾 [CalibrationSystem] Calibration saved"), !0;
    } catch (e) {
      return console.error("❌ [CalibrationSystem] Failed to save calibration:", e), !1;
    }
  }
  /**
   * Load calibration data from localStorage
   */
  loadCalibration() {
    try {
      const e = `pitchpro_calibration_${this.deviceSpecs.deviceType}`, t = localStorage.getItem(e);
      if (!t)
        return !1;
      const i = JSON.parse(t), s = 7 * 24 * 60 * 60 * 1e3;
      return Date.now() - i.timestamp > s ? (console.log("⏰ [CalibrationSystem] Saved calibration is too old, ignoring"), !1) : i.deviceSpecs.deviceType !== this.deviceSpecs.deviceType ? (console.log("📱 [CalibrationSystem] Device type mismatch, ignoring saved calibration"), !1) : (this.calibrationData = i.calibrationData, this.isCalibrated = !0, console.log("📂 [CalibrationSystem] Calibration loaded successfully"), !0);
    } catch (e) {
      return console.error("❌ [CalibrationSystem] Failed to load calibration:", e), !1;
    }
  }
}
const F = class F {
  /**
   * Generate scale from root note
   */
  static generateScale(e, t = "major") {
    const i = F.SCALE_PATTERNS[t];
    if (!i)
      throw new Error(`Unknown scale type: ${t}`);
    return i.map((s) => {
      const n = e * Math.pow(2, s / 12);
      return D.frequencyToNote(n);
    });
  }
  /**
   * Generate chord from root note
   */
  static generateChord(e, t = "major") {
    const i = F.CHORD_PATTERNS[t];
    if (!i)
      throw new Error(`Unknown chord type: ${t}`);
    return i.map((s) => {
      const n = e * Math.pow(2, s / 12);
      return D.frequencyToNote(n);
    });
  }
  /**
   * Identify scale from a set of frequencies
   */
  static identifyScale(e) {
    if (e.length < 3)
      return [];
    const t = e.sort((o, r) => o - r), i = t[0], s = t.map(
      (o) => Math.round(12 * Math.log2(o / i))
    ), n = [];
    return Object.entries(F.SCALE_PATTERNS).forEach(([o, r]) => {
      for (let a = 0; a < 12; a++) {
        const c = r.map((u) => (u + a) % 12).sort((u, m) => u - m), h = s.map((u) => u % 12).sort((u, m) => u - m);
        let f = 0;
        h.forEach((u) => {
          c.includes(u) && f++;
        });
        const d = f / Math.max(h.length, c.length);
        if (d > 0.5) {
          const u = i * Math.pow(2, -a / 12);
          n.push({
            scale: o,
            confidence: d,
            root: D.frequencyToNote(u)
          });
        }
      }
    }), n.sort((o, r) => r.confidence - o.confidence).slice(0, 5);
  }
  /**
   * Identify chord from frequencies
   */
  static identifyChord(e) {
    if (e.length < 2)
      return [];
    const t = e.sort((s, n) => s - n), i = [];
    return Object.entries(F.CHORD_PATTERNS).forEach(([s, n]) => {
      for (let o = 0; o < n.length; o++) {
        const r = [
          ...n.slice(o),
          ...n.slice(0, o).map((a) => a + 12)
        ];
        t.forEach((a, c) => {
          const h = t.map(
            (m) => Math.round(12 * Math.log2(m / a))
          );
          let f = 0;
          const d = new Set(r);
          h.forEach((m) => {
            const g = m % 12;
            (d.has(g) || d.has(g + 12)) && f++;
          });
          const u = f / Math.max(h.length, n.length);
          if (u > 0.6) {
            const m = o === 0 ? a : a * Math.pow(2, -n[o] / 12);
            i.push({
              chord: s,
              confidence: u,
              root: D.frequencyToNote(m),
              inversion: o > 0 ? o : void 0
            });
          }
        });
      }
    }), i.sort((s, n) => n.confidence - s.confidence).slice(0, 3);
  }
  /**
   * Get the key signature for a given key
   */
  static getKeySignature(e, t = "major") {
    const i = ["F", "C", "G", "D", "A", "E", "B"], s = ["B", "E", "A", "D", "G", "C", "F"], n = {
      C: { sharps: 0, flats: 0 },
      G: { sharps: 1, flats: 0 },
      D: { sharps: 2, flats: 0 },
      A: { sharps: 3, flats: 0 },
      E: { sharps: 4, flats: 0 },
      B: { sharps: 5, flats: 0 },
      "F#": { sharps: 6, flats: 0 },
      "C#": { sharps: 7, flats: 0 },
      F: { sharps: 0, flats: 1 },
      Bb: { sharps: 0, flats: 2 },
      Eb: { sharps: 0, flats: 3 },
      Ab: { sharps: 0, flats: 4 },
      Db: { sharps: 0, flats: 5 },
      Gb: { sharps: 0, flats: 6 },
      Cb: { sharps: 0, flats: 7 }
    };
    let o = n[e];
    if (!o && t === "minor") {
      const h = {
        A: "C",
        E: "G",
        B: "D",
        "F#": "A",
        "C#": "E",
        "G#": "B",
        "D#": "F#",
        "A#": "C#",
        D: "F",
        G: "Bb",
        C: "Eb",
        F: "Ab",
        Bb: "Db",
        Eb: "Gb",
        Ab: "Cb"
      }[e];
      h && (o = n[h]);
    }
    if (!o)
      return { sharps: [], flats: [], accidentalCount: 0 };
    const r = i.slice(0, o.sharps).map((c) => c + "#"), a = s.slice(0, o.flats).map((c) => c + "b");
    return {
      sharps: r,
      flats: a,
      accidentalCount: o.sharps || o.flats
    };
  }
  /**
   * Calculate the harmonic series for a fundamental frequency
   */
  static getHarmonicSeries(e, t = 16) {
    const i = [];
    for (let s = 1; s <= t; s++) {
      const n = e * s;
      i.push(D.frequencyToNote(n));
    }
    return i;
  }
  /**
   * Calculate just intonation ratios for common intervals
   */
  static getJustIntonationRatios() {
    return {
      unison: { ratio: 1 / 1, cents: 0 },
      minorSecond: { ratio: 16 / 15, cents: 112 },
      majorSecond: { ratio: 9 / 8, cents: 204 },
      minorThird: { ratio: 6 / 5, cents: 316 },
      majorThird: { ratio: 5 / 4, cents: 386 },
      perfectFourth: { ratio: 4 / 3, cents: 498 },
      tritone: { ratio: 45 / 32, cents: 590 },
      perfectFifth: { ratio: 3 / 2, cents: 702 },
      minorSixth: { ratio: 8 / 5, cents: 814 },
      majorSixth: { ratio: 5 / 3, cents: 884 },
      minorSeventh: { ratio: 16 / 9, cents: 996 },
      majorSeventh: { ratio: 15 / 8, cents: 1088 },
      octave: { ratio: 2 / 1, cents: 1200 }
    };
  }
  /**
   * Convert equal temperament interval to just intonation
   */
  static equalTemperamentToJustIntonation(e) {
    const t = e * 100, i = F.getJustIntonationRatios();
    let s, n = 1 / 0;
    return Object.entries(i).forEach(([r, { cents: a }]) => {
      const c = Math.abs(t - a);
      c < n && (n = c, s = r);
    }), {
      ratio: Math.pow(2, e / 12),
      cents: t,
      closestJustInterval: s,
      centsDeviation: s ? n : void 0
    };
  }
  /**
   * Analyze melodic intervals in a sequence of notes
   */
  static analyzeMelody(e) {
    if (e.length < 2)
      return [];
    const t = [];
    for (let i = 1; i < e.length; i++) {
      const s = e[i - 1], n = e[i], o = D.frequencyToNote(s), r = D.frequencyToNote(n), a = D.getSignedInterval(s, n), c = D.getIntervalInfo(Math.abs(a)), h = a > 0 ? "up" : a < 0 ? "down" : "same";
      t.push({
        fromNote: o,
        toNote: r,
        interval: c,
        direction: h
      });
    }
    return t;
  }
  /**
   * Generate chord progressions in a given key
   */
  static generateChordProgression(e, t = "major", i = [1, 4, 5, 1]) {
    const s = D.scientificPitchToFrequency(e + "4");
    if (s === 0)
      throw new Error(`Invalid key: ${e}`);
    const n = F.generateScale(s, t === "minor" ? "naturalMinor" : "major"), o = [];
    return i.forEach((r) => {
      const a = n[(r - 1) % n.length], c = t === "major" ? F.getMajorScaleChordType(r) : F.getMinorScaleChordType(r), h = F.generateChord(a.frequency, c);
      o.push(h);
    }), o;
  }
  /**
   * Get chord type for scale degree in major scale
   */
  static getMajorScaleChordType(e) {
    return ["major", "minor", "minor", "major", "major", "minor", "diminished"][(e - 1) % 7];
  }
  /**
   * Get chord type for scale degree in minor scale
   */
  static getMinorScaleChordType(e) {
    return ["minor", "diminished", "major", "minor", "minor", "major", "major"][(e - 1) % 7];
  }
};
F.SCALE_PATTERNS = {
  major: [0, 2, 4, 5, 7, 9, 11],
  naturalMinor: [0, 2, 3, 5, 7, 8, 10],
  harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
  melodicMinor: [0, 2, 3, 5, 7, 9, 11],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  phrygian: [0, 1, 3, 5, 7, 8, 10],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  locrian: [0, 1, 3, 5, 6, 8, 10],
  pentatonicMajor: [0, 2, 4, 7, 9],
  pentatonicMinor: [0, 3, 5, 7, 10],
  blues: [0, 3, 5, 6, 7, 10],
  chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
}, F.CHORD_PATTERNS = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  diminished: [0, 3, 6],
  augmented: [0, 4, 8],
  sus2: [0, 2, 7],
  sus4: [0, 5, 7],
  major7: [0, 4, 7, 11],
  minor7: [0, 3, 7, 10],
  dominant7: [0, 4, 7, 10],
  majorMaj7: [0, 4, 7, 11],
  halfDiminished7: [0, 3, 6, 10],
  diminished7: [0, 3, 6, 9],
  add9: [0, 4, 7, 14],
  // 14 = 2 + 12 (octave)
  major9: [0, 4, 7, 11, 14],
  minor9: [0, 3, 7, 10, 14]
}, F.CIRCLE_OF_FIFTHS = [
  "C",
  "G",
  "D",
  "A",
  "E",
  "B",
  "F#",
  "C#",
  "Ab",
  "Eb",
  "Bb",
  "F"
], F.INTERVAL_NAMES = {
  0: "Perfect Unison",
  1: "Minor Second",
  2: "Major Second",
  3: "Minor Third",
  4: "Major Third",
  5: "Perfect Fourth",
  6: "Tritone",
  7: "Perfect Fifth",
  8: "Minor Sixth",
  9: "Major Sixth",
  10: "Minor Seventh",
  11: "Major Seventh",
  12: "Perfect Octave"
};
let Fe = F;
const ut = "1.1.8", dt = (/* @__PURE__ */ new Date()).toISOString(), mt = {
  pitchDetector: {
    fftSize: 4096,
    smoothing: 0.1,
    clarityThreshold: 0.4,
    // 現実的な値に修正
    minVolumeAbsolute: 3e-3
    // 現実的な値に修正
  },
  audioManager: {
    sampleRate: 44100,
    channelCount: 1,
    echoCancellation: !1,
    noiseSuppression: !1,
    autoGainControl: !1
  },
  noiseFilter: {
    highpassFreq: 80,
    lowpassFreq: 800,
    notchFreq: 60,
    Q: 0.7
  }
};
export {
  Te as AudioDetectionComponent,
  De as AudioManager,
  dt as BUILD_DATE,
  ht as CalibrationSystem,
  mt as DEFAULT_CONFIG,
  K as DeviceDetection,
  et as ErrorNotificationSystem,
  D as FrequencyUtils,
  ct as HarmonicCorrection,
  de as LogLevel,
  le as Logger,
  tt as MicrophoneController,
  Ve as MicrophoneHealthError,
  Ze as MicrophoneLifecycleManager,
  Fe as MusicTheory,
  st as NoiseFilter,
  Ke as PitchDetector,
  ut as VERSION,
  lt as VoiceAnalyzer,
  nt as debug,
  me as defaultLogger,
  at as error,
  ot as info,
  rt as warn
};
//# sourceMappingURL=index.esm.js.map
