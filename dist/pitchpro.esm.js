var Gr = Object.defineProperty;
var Hr = (i, e, t) => e in i ? Gr(i, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : i[e] = t;
var Be = (i, e, t) => Hr(i, typeof e != "symbol" ? e + "" : e, t);
const Qr = "1.3.1", us = `PitchPro v${Qr}`, id = (/* @__PURE__ */ new Date()).toISOString(), le = class le {
  /**
   * Detect current device and return optimized specifications
   */
  static getDeviceSpecs() {
    if (le.cachedSpecs)
      return le.cachedSpecs;
    if (typeof window > "u" || typeof navigator > "u")
      return le.getDefaultSpecs();
    const e = navigator.userAgent, t = le.analyzeUserAgent(e);
    return le.cachedSpecs = t, console.log("📱 [DeviceDetection] Device analysis:", {
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
    const t = /iPhone/.test(e), n = /iPad/.test(e), s = /Macintosh/.test(e) && "ontouchend" in document, r = /iPad|iPhone|iPod/.test(e), o = /iPad|iPhone|iPod/.test(navigator.platform || ""), a = t || n || s || r || o;
    let c = "PC";
    t ? c = "iPhone" : n || s ? c = "iPad" : a && (c = le.detectIOSDeviceType());
    const l = le.getDeviceOptimizations(c, a);
    return {
      deviceType: c,
      isIOS: a,
      sensitivity: l.sensitivity,
      noiseGate: l.noiseGate,
      volumeMultiplier: l.volumeMultiplier,
      smoothingFactor: l.smoothingFactor,
      // 後方互換性のため残す（将来的に削除予定）
      divisor: 6,
      gainCompensation: 1,
      noiseThreshold: 7
    };
  }
  /**
   * Detect iOS device type when specific detection fails
   */
  static detectIOSDeviceType() {
    const e = window.screen.width, t = window.screen.height, n = Math.max(e, t), s = Math.min(e, t);
    return n >= 768 || n >= 700 && s >= 500 ? "iPad" : "iPhone";
  }
  /**
   * Get device-specific optimization parameters
   */
  static getDeviceOptimizations(e, t) {
    switch (e) {
      case "iPad":
        return {
          sensitivity: 4,
          // 🎤 マイク感度 (PitchDetector用)
          noiseGate: 0.023,
          // 🚪 ノイズゲート閾値 (2.3%設定で低周波数検出感度向上)
          volumeMultiplier: 4,
          // 🔊 表示音量補正 (13.0→4.0 大幅削減で適切レベル)
          smoothingFactor: 0.25
          // 📊 平滑化係数
        };
      case "iPhone":
        return {
          sensitivity: 3.5,
          // 🎤 マイク感度 (iPhone最適化値)
          noiseGate: 0.028,
          // 🚪 ノイズゲート閾値 (2.8%設定でiPadとの中間値)
          volumeMultiplier: 3,
          // 🔊 表示音量補正 (9.0→3.0 大幅削減で適切レベル)
          smoothingFactor: 0.25
          // 📊 平滑化係数
        };
      case "PC":
      default:
        return {
          sensitivity: 1.7,
          // 🎤 マイク感度 (PC環境安定性重視)
          noiseGate: 0.023,
          // 🚪 ノイズゲート閾値 (2.3%設定で低周波数検出最適化)
          volumeMultiplier: 2.5,
          // 🔊 表示音量補正 (7.5→2.5 大幅削減で適切レベル)
          smoothingFactor: 0.25
          // 📊 平滑化係数
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
      sensitivity: 1.7,
      // 🎤 PC最適化値と統一
      noiseGate: 0.06,
      // 🚪 PC最適化値と統一 (6.0%) - getDeviceOptimizationsと完全一致
      volumeMultiplier: 3,
      // 🔊 PC最適化値と統一
      smoothingFactor: 0.25,
      // 📊 PC最適化値と統一
      // 後方互換性のため残す（将来的に削除予定）
      divisor: 6,
      gainCompensation: 1,
      noiseThreshold: 7
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
      deviceSpecs: le.getDeviceSpecs(),
      webAudioSupport: le.supportsWebAudio(),
      mediaDevicesSupport: le.supportsMediaDevices(),
      mediaRecorderSupport: le.supportsMediaRecorder(),
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
    return le.getDeviceSpecs().isIOS || /Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test((navigator == null ? void 0 : navigator.userAgent) || "");
  }
  /**
   * Check if current device is tablet
   */
  static isTablet() {
    if (le.getDeviceSpecs().deviceType === "iPad") return !0;
    const t = (navigator == null ? void 0 : navigator.userAgent) || "";
    return /Android/i.test(t) && !/Mobile/i.test(t);
  }
  /**
   * Check if current device is desktop
   */
  static isDesktop() {
    return !le.isMobile() && !le.isTablet();
  }
  /**
   * Get recommended audio constraints for current device
   */
  static getOptimalAudioConstraints() {
    const e = le.getDeviceSpecs(), t = {
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
    le.cachedSpecs = null;
  }
  /**
   * Get device-specific debugging information
   */
  static getDebugInfo() {
    return {
      ...le.getDeviceCapabilities(),
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
le.cachedSpecs = null;
let At = le;
var mt = /* @__PURE__ */ ((i) => (i.AUDIO_CONTEXT_ERROR = "AUDIO_CONTEXT_ERROR", i.MICROPHONE_ACCESS_DENIED = "MICROPHONE_ACCESS_DENIED", i.PITCH_DETECTION_ERROR = "PITCH_DETECTION_ERROR", i.BUFFER_OVERFLOW = "BUFFER_OVERFLOW", i.INVALID_SAMPLE_RATE = "INVALID_SAMPLE_RATE", i.DEVICE_NOT_SUPPORTED = "DEVICE_NOT_SUPPORTED", i.PROCESSING_TIMEOUT = "PROCESSING_TIMEOUT", i))(mt || {});
class Se extends Error {
  constructor(e, t, n) {
    super(e), this.name = "PitchProError", this.code = t, this.timestamp = /* @__PURE__ */ new Date(), this.context = n, Error.captureStackTrace && Error.captureStackTrace(this, Se);
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
class ot extends Se {
  constructor(e, t) {
    super(e, "AUDIO_CONTEXT_ERROR", t), this.name = "AudioContextError";
  }
}
class ws extends Se {
  constructor(e, t) {
    super(e, "MICROPHONE_ACCESS_DENIED", t), this.name = "MicrophoneAccessError";
  }
}
class Xr extends Se {
  constructor(e, t, n, s) {
    super(
      e,
      "MICROPHONE_ACCESS_DENIED",
      {
        healthStatus: t,
        recoveryAttempts: n,
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
class li extends Se {
  constructor(e, t) {
    super(e, "PITCH_DETECTION_ERROR", t), this.name = "PitchDetectionError";
  }
}
function Oi(i) {
  return [
    "BUFFER_OVERFLOW",
    "PROCESSING_TIMEOUT",
    "PITCH_DETECTION_ERROR"
    /* PITCH_DETECTION_ERROR */
  ].includes(i.code);
}
class ke {
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
        isRecoverable: Oi(e)
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
    const n = this.getUserFriendlyMessage(e), s = this.getTechnicalDetails(e);
    console.group(`🚨 [PitchPro Error] ${n.title}`), console.log("👤 User Message:", n.message), console.log("📋 Suggested Actions:", n.actions), console.log("⚠️ Severity:", n.severity), console.log("🔄 Can Retry:", n.canRetry), console.log("🔧 Error Code:", s.errorCode), console.log("⏰ Timestamp:", s.timestamp), t && console.log("📍 Context:", t), s.context && Object.keys(s.context).length > 0 && console.log("🔍 Additional Context:", s.context), s.stackTrace && console.log("📜 Stack Trace:", s.stackTrace), console.groupEnd();
  }
  /**
   * Creates recovery suggestions based on error type and context
   * 
   * @param error - PitchProError instance
   * @param deviceType - Device type for specific recommendations
   * @returns Recovery strategy object
   */
  static getRecoveryStrategy(e, t) {
    const n = this.getUserFriendlyMessage(e), s = n.actions.slice(0, 2), r = n.actions.slice(2);
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
      fallback: r,
      preventive: o
    };
  }
}
class Yr {
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
    this.audioContext = null, this.mediaStream = null, this.sourceNode = null, this.gainNode = null, this.analysers = /* @__PURE__ */ new Map(), this.filters = /* @__PURE__ */ new Map(), this.refCount = 0, this.initPromise = null, this.isInitialized = !1, this.lastError = null, this.gainMonitorInterval = null, this.isMuted = !1, console.log("🔍 [DIAGNOSTIC] AudioManager constructor - input config:", e), this.config = {
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
    const e = At.getDeviceSpecs();
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
    var e, t, n;
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
        trackStates: (n = this.mediaStream) == null ? void 0 : n.getTracks().map((r) => ({
          kind: r.kind,
          readyState: r.readyState,
          enabled: r.enabled,
          muted: r.muted
        }))
      }), this._cleanup(), this.isInitialized = !1, this.refCount = 0, await new Promise((r) => setTimeout(r, 100)), console.log("🔄 [AudioManager] Cleanup complete - starting re-initialization");
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
            // ✅ 設定値を尊重
            autoGainControl: this.config.autoGainControl,
            // ブラウザ固有制御: noiseSuppression設定に基づく条件付き適用
            ...window.chrome && {
              googAutoGainControl: !1,
              // AGCは常に無効（音量問題回避）
              googNoiseSuppression: this.config.noiseSuppression,
              // ✅ 設定値に従う
              googEchoCancellation: this.config.echoCancellation,
              // ✅ 設定値に従う
              googHighpassFilter: !1,
              // ハイパスフィルターは独自実装を使用
              googTypingNoiseDetection: this.config.noiseSuppression,
              // ノイズ抑制と連動
              googBeamforming: this.config.noiseSuppression
              // ノイズ抑制と連動
            },
            // Mozilla-specific constraints
            ...navigator.userAgent.includes("Firefox") && {
              mozAutoGainControl: !1,
              // AGCは常に無効
              mozNoiseSuppression: this.config.noiseSuppression
              // ✅ 設定値に従う
            },
            // Safari compatibility: Explicit quality settings  
            sampleRate: this.config.sampleRate,
            channelCount: this.config.channelCount,
            sampleSize: 16,
            // Flexible device selection (Safari compatibility)
            deviceId: { ideal: "default" }
          }
        };
        console.log("🎤 [AudioManager] Getting MediaStream with noiseSuppression settings:", {
          noiseSuppression: this.config.noiseSuppression,
          constraints: t
        }), this.mediaStream = await navigator.mediaDevices.getUserMedia(t), console.log("✅ [AudioManager] MediaStream acquisition complete");
        const n = this.mediaStream.getAudioTracks()[0];
        if (n && typeof n.getConstraints == "function" && typeof n.getSettings == "function")
          try {
            const s = n.getConstraints(), r = n.getSettings();
            console.log("🔍 [DIAGNOSTIC] Requested noiseSuppression:", this.config.noiseSuppression), console.log("🔍 [DIAGNOSTIC] Actually applied constraints:", s), console.log("🔍 [DIAGNOSTIC] Actual MediaStream settings:", r), r.noiseSuppression !== this.config.noiseSuppression ? (console.warn("⚠️ [DIAGNOSTIC] noiseSuppression setting mismatch!"), console.warn(`⚠️ [DIAGNOSTIC] Requested: ${this.config.noiseSuppression}, Applied: ${r.noiseSuppression}`)) : console.log("✅ [DIAGNOSTIC] noiseSuppression successfully applied by browser"), r.autoGainControl === !0 ? (console.warn("⚠️ [DIAGNOSTIC] CRITICAL: Browser ignored autoGainControl: false setting!"), console.warn("⚠️ [DIAGNOSTIC] This explains the gain drift issues - browser is automatically adjusting gain")) : console.log("✅ [DIAGNOSTIC] autoGainControl successfully disabled by browser");
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
      throw ke.logError(t, "AudioManager initialization"), this.lastError = t, this.isInitialized = !1, this._cleanup(), t;
    }
  }
  /**
   * Create dedicated AnalyserNode
   * @param id - Analyser identifier
   * @param options - Option settings
   */
  createAnalyser(e, t = {}) {
    if (!this.isInitialized || !this.audioContext || !this.sourceNode) {
      const h = new ot(
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
      throw ke.logError(h, "Analyser creation"), h;
    }
    this.removeAnalyser(e);
    const {
      fftSize: n = 2048,
      smoothingTimeConstant: s = 0.8,
      minDecibels: r = -90,
      maxDecibels: o = -10,
      useFilters: a = !0
    } = t, c = this.audioContext.createAnalyser();
    c.fftSize = Math.min(n, 2048), c.smoothingTimeConstant = Math.max(s, 0.7), c.minDecibels = Math.max(r, -80), c.maxDecibels = Math.min(o, -10);
    let l = this.gainNode || this.sourceNode;
    if (a) {
      const h = this._createFilterChain();
      this.filters.set(e, h), l.connect(h.highpass), h.highpass.connect(h.lowpass), h.lowpass.connect(h.notch), h.notch.connect(c), console.log(`🔧 [AudioManager] Filtered Analyser created: ${e}`);
    } else
      l.connect(c), console.log(`🔧 [AudioManager] Raw signal Analyser created: ${e}`);
    return this.analysers.set(e, c), c;
  }
  /**
   * Create 3-stage noise reduction filter chain
   */
  _createFilterChain() {
    if (!this.audioContext) {
      const s = new ot(
        "AudioContextが利用できません。ブラウザでオーディオ機能が無効になっているか、デバイスがサポートされていません。",
        {
          operation: "_createFilterChain",
          audioContextState: "null"
        }
      );
      throw ke.logError(s, "Filter chain creation"), s;
    }
    const e = this.audioContext.createBiquadFilter();
    e.type = "highpass", e.frequency.setValueAtTime(50, this.audioContext.currentTime), e.Q.setValueAtTime(0.7, this.audioContext.currentTime);
    const t = this.audioContext.createBiquadFilter();
    t.type = "lowpass", t.frequency.setValueAtTime(800, this.audioContext.currentTime), t.Q.setValueAtTime(0.7, this.audioContext.currentTime);
    const n = this.audioContext.createBiquadFilter();
    return n.type = "notch", n.frequency.setValueAtTime(50, this.audioContext.currentTime), n.Q.setValueAtTime(10, this.audioContext.currentTime), { highpass: e, lowpass: t, notch: n };
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
  async _verifyGainChange(e, t = 200, n = 20) {
    const s = Date.now();
    for (; Date.now() - s < t; ) {
      if (this.gainNode && Math.abs(this.gainNode.gain.value - e) <= 0.1)
        return !0;
      await new Promise((r) => setTimeout(r, n));
    }
    return !1;
  }
  setSensitivity(e) {
    var n;
    const t = Math.max(0.1, Math.min(10, e));
    this.gainNode ? (this.gainNode.gain.setValueAtTime(t, ((n = this.audioContext) == null ? void 0 : n.currentTime) || 0), this.currentSensitivity = t, (async () => {
      var r;
      if (await this._verifyGainChange(t))
        console.log(`✅ [AudioManager] Gain setting verified: ${(r = this.gainNode) == null ? void 0 : r.gain.value.toFixed(1)}x (expected: ${t.toFixed(1)}x)`);
      else if (this.gainNode) {
        const o = this.gainNode.gain.value;
        console.warn("⚠️ [AudioManager] ゲイン検証失敗 (機能継続):", {
          期待値: `${t}x`,
          実際値: `${o}x`,
          差分: Math.abs(o - t).toFixed(2),
          理由: "ブラウザのautoGainControl制御による制限",
          影響: "音量計算には影響なし（動的SCALING_FACTOR使用）",
          状態: "正常動作中"
        });
      }
    })(), console.log(`🎤 [AudioManager] Microphone sensitivity updated: ${t.toFixed(1)}x`)) : (this.currentSensitivity = t, console.log(`🎤 [AudioManager] Microphone sensitivity set (awaiting initialization): ${t.toFixed(1)}x`));
  }
  /**
   * Get current microphone sensitivity
   */
  getSensitivity() {
    return this.currentSensitivity;
  }
  /**
   * Mutes the microphone by disabling audio tracks
   * 
   * @description Disables all audio tracks in the MediaStream while maintaining 
   * the connection. This provides instant mute functionality without requiring 
   * MediaStream reinitialization.
   * 
   * @example
   * ```typescript
   * audioManager.mute();
   * console.log('Microphone muted');
   * ```
   */
  mute() {
    if (!this.mediaStream) {
      console.warn("⚠️ [AudioManager] Cannot mute, MediaStream is not available.");
      return;
    }
    this.mediaStream.getAudioTracks().forEach((e) => {
      e.enabled = !1;
    }), this.isMuted = !0, console.log("🔇 [AudioManager] Microphone muted.");
  }
  /**
   * Unmutes the microphone by enabling audio tracks
   * 
   * @description Re-enables all audio tracks in the MediaStream. The audio 
   * input resumes immediately without any initialization delays.
   * 
   * @example
   * ```typescript
   * audioManager.unmute();
   * console.log('Microphone unmuted');
   * ```
   */
  unmute() {
    if (!this.mediaStream) {
      console.warn("⚠️ [AudioManager] Cannot unmute, MediaStream is not available.");
      return;
    }
    this.mediaStream.getAudioTracks().forEach((e) => {
      e.enabled = !0;
    }), this.isMuted = !1, console.log("🔊 [AudioManager] Microphone unmuted.");
  }
  /**
   * Gets the current mute state
   * 
   * @returns True if microphone is muted, false otherwise
   * 
   * @example
   * ```typescript
   * if (audioManager.getIsMuted()) {
   *   console.log('Microphone is currently muted');
   * }
   * ```
   */
  getIsMuted() {
    return this.isMuted;
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
    const e = At.getDeviceSpecs();
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
      console.log(`🛑 [AudioManager] Stopping MediaStream: ${t.length} tracks`), t.forEach((n, s) => {
        try {
          n.readyState !== "ended" ? (n.stop(), console.log(`🛑 [AudioManager] Track ${s} stop complete`)) : console.log(`⚠️ [AudioManager] Track ${s} already ended`);
        } catch (r) {
          const o = new Se(
            `メディアトラック ${s} の停止中にエラーが発生しました: ${r.message}`,
            mt.AUDIO_CONTEXT_ERROR,
            {
              operation: "track_cleanup",
              trackIndex: s,
              originalError: r.message,
              trackState: n.readyState
            }
          );
          ke.logError(o, "Media track cleanup");
        }
      }), this.mediaStream = null;
    }
    if (this.audioContext && this.audioContext.state !== "closed") {
      try {
        this.audioContext.close(), console.log("🛑 [AudioManager] AudioContext close complete");
      } catch (t) {
        const n = new ot(
          `AudioContextの終了中にエラーが発生しました: ${t.message}`,
          {
            operation: "audioContext_cleanup",
            contextState: (e = this.audioContext) == null ? void 0 : e.state,
            originalError: t.message
          }
        );
        ke.logError(n, "AudioContext cleanup");
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
    var n, s;
    return e.message.includes("Permission denied") || e.message.includes("NotAllowedError") || e.message.includes("permission") ? new ws(
      "マイクへのアクセス許可が拒否されました。ブラウザの設定でマイクアクセスを許可してください。",
      {
        operation: t,
        originalError: e.message,
        deviceSpecs: this.getPlatformSpecs(),
        userAgent: typeof navigator < "u" ? navigator.userAgent : "unknown"
      }
    ) : e.message.includes("AudioContext") || e.message.includes("audio") || e.message.includes("context") ? new ot(
      "オーディオシステムの初期化に失敗しました。デバイスの音響設定を確認するか、ブラウザを再起動してください。",
      {
        operation: t,
        originalError: e.message,
        audioContextState: ((n = this.audioContext) == null ? void 0 : n.state) || "none",
        sampleRate: ((s = this.audioContext) == null ? void 0 : s.sampleRate) || "unknown",
        deviceSpecs: this.getPlatformSpecs()
      }
    ) : new Se(
      `${t}中に予期しないエラーが発生しました: ${e.message}`,
      mt.AUDIO_CONTEXT_ERROR,
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
    var s, r, o, a, c, l, h, u;
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
        audioContextState: ((r = this.audioContext) == null ? void 0 : r.state) || "none",
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
    const t = e.find((d) => d.kind === "audio");
    if (!t)
      return {
        mediaStreamActive: this.mediaStream.active,
        audioContextState: ((a = this.audioContext) == null ? void 0 : a.state) || "none",
        trackStates: e.map((d) => ({
          kind: d.kind,
          enabled: d.enabled,
          readyState: d.readyState,
          muted: d.muted
        })),
        healthy: !1
      };
    const n = e.map((d) => ({
      kind: d.kind,
      enabled: d.enabled,
      readyState: d.readyState,
      muted: d.muted
    }));
    return t.readyState === "ended" ? {
      mediaStreamActive: this.mediaStream.active,
      audioContextState: ((c = this.audioContext) == null ? void 0 : c.state) || "none",
      trackStates: n,
      healthy: !1
    } : t.muted ? {
      mediaStreamActive: this.mediaStream.active,
      audioContextState: ((l = this.audioContext) == null ? void 0 : l.state) || "none",
      trackStates: n,
      healthy: !1
    } : this.mediaStream.active && t.readyState !== "live" ? {
      mediaStreamActive: this.mediaStream.active,
      audioContextState: ((h = this.audioContext) == null ? void 0 : h.state) || "none",
      trackStates: n,
      healthy: !1
    } : {
      mediaStreamActive: this.mediaStream.active,
      audioContextState: ((u = this.audioContext) == null ? void 0 : u.state) || "none",
      trackStates: n,
      healthy: !0,
      refCount: this.refCount
    };
  }
}
function Zr(i) {
  return i && i.__esModule && Object.prototype.hasOwnProperty.call(i, "default") ? i.default : i;
}
function Oe(i) {
  if (this.size = i | 0, this.size <= 1 || this.size & this.size - 1)
    throw new Error("FFT size must be a power of two and bigger than 1");
  this._csize = i << 1;
  for (var e = new Array(this.size * 2), t = 0; t < e.length; t += 2) {
    const c = Math.PI * t / this.size;
    e[t] = Math.cos(c), e[t + 1] = -Math.sin(c);
  }
  this.table = e;
  for (var n = 0, s = 1; this.size > s; s <<= 1)
    n++;
  this._width = n % 2 === 0 ? n - 1 : n, this._bitrev = new Array(1 << this._width);
  for (var r = 0; r < this._bitrev.length; r++) {
    this._bitrev[r] = 0;
    for (var o = 0; o < this._width; o += 2) {
      var a = this._width - o - 2;
      this._bitrev[r] |= (r >>> o & 3) << a;
    }
  }
  this._out = null, this._data = null, this._inv = 0;
}
var Jr = Oe;
Oe.prototype.fromComplexArray = function(e, t) {
  for (var n = t || new Array(e.length >>> 1), s = 0; s < e.length; s += 2)
    n[s >>> 1] = e[s];
  return n;
};
Oe.prototype.createComplexArray = function() {
  const e = new Array(this._csize);
  for (var t = 0; t < e.length; t++)
    e[t] = 0;
  return e;
};
Oe.prototype.toComplexArray = function(e, t) {
  for (var n = t || this.createComplexArray(), s = 0; s < n.length; s += 2)
    n[s] = e[s >>> 1], n[s + 1] = 0;
  return n;
};
Oe.prototype.completeSpectrum = function(e) {
  for (var t = this._csize, n = t >>> 1, s = 2; s < n; s += 2)
    e[t - s] = e[s], e[t - s + 1] = -e[s + 1];
};
Oe.prototype.transform = function(e, t) {
  if (e === t)
    throw new Error("Input and output buffers must be different");
  this._out = e, this._data = t, this._inv = 0, this._transform4(), this._out = null, this._data = null;
};
Oe.prototype.realTransform = function(e, t) {
  if (e === t)
    throw new Error("Input and output buffers must be different");
  this._out = e, this._data = t, this._inv = 0, this._realTransform4(), this._out = null, this._data = null;
};
Oe.prototype.inverseTransform = function(e, t) {
  if (e === t)
    throw new Error("Input and output buffers must be different");
  this._out = e, this._data = t, this._inv = 1, this._transform4();
  for (var n = 0; n < e.length; n++)
    e[n] /= this.size;
  this._out = null, this._data = null;
};
Oe.prototype._transform4 = function() {
  var e = this._out, t = this._csize, n = this._width, s = 1 << n, r = t / s << 1, o, a, c = this._bitrev;
  if (r === 4)
    for (o = 0, a = 0; o < t; o += r, a++) {
      const m = c[a];
      this._singleTransform2(o, m, s);
    }
  else
    for (o = 0, a = 0; o < t; o += r, a++) {
      const m = c[a];
      this._singleTransform4(o, m, s);
    }
  var l = this._inv ? -1 : 1, h = this.table;
  for (s >>= 2; s >= 2; s >>= 2) {
    r = t / s << 1;
    var u = r >>> 2;
    for (o = 0; o < t; o += r)
      for (var d = o + u, f = o, p = 0; f < d; f += 2, p += s) {
        const m = f, g = m + u, _ = g + u, T = _ + u, b = e[m], C = e[m + 1], v = e[g], S = e[g + 1], w = e[_], y = e[_ + 1], x = e[T], E = e[T + 1], M = b, A = C, I = h[p], N = l * h[p + 1], R = v * I - S * N, D = v * N + S * I, F = h[2 * p], B = l * h[2 * p + 1], P = w * F - y * B, L = w * B + y * F, V = h[3 * p], H = l * h[3 * p + 1], pe = x * V - E * H, me = x * H + E * V, U = M + P, Q = A + L, oe = M - P, O = A - L, Re = R + pe, Ee = D + me, Pe = l * (R - pe), Le = l * (D - me), Dt = U + Re, en = Q + Ee, k = U - Re, q = Q - Ee, ie = oe + Le, Z = O - Pe, G = oe - Le, J = O + Pe;
        e[m] = Dt, e[m + 1] = en, e[g] = ie, e[g + 1] = Z, e[_] = k, e[_ + 1] = q, e[T] = G, e[T + 1] = J;
      }
  }
};
Oe.prototype._singleTransform2 = function(e, t, n) {
  const s = this._out, r = this._data, o = r[t], a = r[t + 1], c = r[t + n], l = r[t + n + 1], h = o + c, u = a + l, d = o - c, f = a - l;
  s[e] = h, s[e + 1] = u, s[e + 2] = d, s[e + 3] = f;
};
Oe.prototype._singleTransform4 = function(e, t, n) {
  const s = this._out, r = this._data, o = this._inv ? -1 : 1, a = n * 2, c = n * 3, l = r[t], h = r[t + 1], u = r[t + n], d = r[t + n + 1], f = r[t + a], p = r[t + a + 1], m = r[t + c], g = r[t + c + 1], _ = l + f, T = h + p, b = l - f, C = h - p, v = u + m, S = d + g, w = o * (u - m), y = o * (d - g), x = _ + v, E = T + S, M = b + y, A = C - w, I = _ - v, N = T - S, R = b - y, D = C + w;
  s[e] = x, s[e + 1] = E, s[e + 2] = M, s[e + 3] = A, s[e + 4] = I, s[e + 5] = N, s[e + 6] = R, s[e + 7] = D;
};
Oe.prototype._realTransform4 = function() {
  var e = this._out, t = this._csize, n = this._width, s = 1 << n, r = t / s << 1, o, a, c = this._bitrev;
  if (r === 4)
    for (o = 0, a = 0; o < t; o += r, a++) {
      const ls = c[a];
      this._singleRealTransform2(o, ls >>> 1, s >>> 1);
    }
  else
    for (o = 0, a = 0; o < t; o += r, a++) {
      const ls = c[a];
      this._singleRealTransform4(o, ls >>> 1, s >>> 1);
    }
  var l = this._inv ? -1 : 1, h = this.table;
  for (s >>= 2; s >= 2; s >>= 2) {
    r = t / s << 1;
    var u = r >>> 1, d = u >>> 1, f = d >>> 1;
    for (o = 0; o < t; o += r)
      for (var p = 0, m = 0; p <= f; p += 2, m += s) {
        var g = o + p, _ = g + d, T = _ + d, b = T + d, C = e[g], v = e[g + 1], S = e[_], w = e[_ + 1], y = e[T], x = e[T + 1], E = e[b], M = e[b + 1], A = C, I = v, N = h[m], R = l * h[m + 1], D = S * N - w * R, F = S * R + w * N, B = h[2 * m], P = l * h[2 * m + 1], L = y * B - x * P, V = y * P + x * B, H = h[3 * m], pe = l * h[3 * m + 1], me = E * H - M * pe, U = E * pe + M * H, Q = A + L, oe = I + V, O = A - L, Re = I - V, Ee = D + me, Pe = F + U, Le = l * (D - me), Dt = l * (F - U), en = Q + Ee, k = oe + Pe, q = O + Dt, ie = Re - Le;
        if (e[g] = en, e[g + 1] = k, e[_] = q, e[_ + 1] = ie, p === 0) {
          var Z = Q - Ee, G = oe - Pe;
          e[T] = Z, e[T + 1] = G;
          continue;
        }
        if (p !== f) {
          var J = O, xe = -Re, Je = Q, Tt = -oe, tn = -l * Dt, as = -l * Le, cs = -l * Pe, Ur = -l * Ee, zr = J + tn, Wr = xe + as, $r = Je + Ur, jr = Tt - cs, ai = o + d - p, ci = o + u - p;
          e[ai] = zr, e[ai + 1] = Wr, e[ci] = $r, e[ci + 1] = jr;
        }
      }
  }
};
Oe.prototype._singleRealTransform2 = function(e, t, n) {
  const s = this._out, r = this._data, o = r[t], a = r[t + n], c = o + a, l = o - a;
  s[e] = c, s[e + 1] = 0, s[e + 2] = l, s[e + 3] = 0;
};
Oe.prototype._singleRealTransform4 = function(e, t, n) {
  const s = this._out, r = this._data, o = this._inv ? -1 : 1, a = n * 2, c = n * 3, l = r[t], h = r[t + n], u = r[t + a], d = r[t + c], f = l + u, p = l - u, m = h + d, g = o * (h - d), _ = f + m, T = p, b = -g, C = f - m, v = p, S = g;
  s[e] = _, s[e + 1] = 0, s[e + 2] = T, s[e + 3] = b, s[e + 4] = C, s[e + 5] = 0, s[e + 6] = v, s[e + 7] = S;
};
const Kr = /* @__PURE__ */ Zr(Jr);
class nn {
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
    Be(this, "_inputLength");
    /** @private @type {FFT} */
    Be(this, "_fft");
    /** @private @type {(size: number) => T} */
    Be(this, "_bufferSupplier");
    /** @private @type {T} */
    Be(this, "_paddedInputBuffer");
    /** @private @type {T} */
    Be(this, "_transformBuffer");
    /** @private @type {T} */
    Be(this, "_inverseBuffer");
    if (e < 1)
      throw new Error("Input length must be at least one");
    this._inputLength = e, this._fft = new Kr(so(2 * e)), this._bufferSupplier = t, this._paddedInputBuffer = this._bufferSupplier(this._fft.size), this._transformBuffer = this._bufferSupplier(2 * this._fft.size), this._inverseBuffer = this._bufferSupplier(2 * this._fft.size);
  }
  /**
   * A helper method to create an {@link Autocorrelator} using
   * {@link Float32Array} buffers.
   *
   * @param inputLength {number} the input array length to support
   * @returns {Autocorrelator<Float32Array>}
   */
  static forFloat32Array(e) {
    return new nn(
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
    return new nn(
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
    return new nn(e, (t) => Array(t));
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
    const n = this._transformBuffer;
    for (let s = 0; s < n.length; s += 2)
      n[s] = n[s] * n[s] + n[s + 1] * n[s + 1], n[s + 1] = 0;
    this._fft.inverseTransform(this._inverseBuffer, this._transformBuffer);
    for (let s = 0; s < e.length; s++)
      t[s] = this._inverseBuffer[2 * s];
    return t;
  }
}
function eo(i) {
  const e = [];
  let t = !1, n = -1 / 0, s = -1;
  for (let r = 1; r < i.length - 1; r++)
    i[r - 1] <= 0 && i[r] > 0 ? (t = !0, s = r, n = i[r]) : i[r - 1] > 0 && i[r] <= 0 ? (t = !1, s !== -1 && e.push(s)) : t && i[r] > n && (n = i[r], s = r);
  return e;
}
function to(i, e) {
  const [t, n, s] = [i - 1, i, i + 1], [r, o, a] = [e[t], e[n], e[s]], c = r / 2 - o + a / 2, l = -(r / 2) * (n + s) + o * (t + s) - a / 2 * (t + n), h = r * n * s / 2 - o * t * s + a * t * n / 2, u = -l / (2 * c), d = c * u * u + l * u + h;
  return [u, d];
}
let no = class Mn {
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
    Be(this, "_autocorrelator");
    /** @private @type {T} */
    Be(this, "_nsdfBuffer");
    /** @private @type {number} */
    Be(this, "_clarityThreshold", 0.9);
    /** @private @type {number} */
    Be(this, "_minVolumeAbsolute", 0);
    /** @private @type {number} */
    Be(this, "_maxInputAmplitude", 1);
    this._autocorrelator = new nn(e, t), this._nsdfBuffer = t(e);
  }
  /**
   * A helper method to create an {@link PitchDetector} using {@link Float32Array} buffers.
   *
   * @param inputLength {number} the input array length to support
   * @returns {PitchDetector<Float32Array>}
   */
  static forFloat32Array(e) {
    return new Mn(e, (t) => new Float32Array(t));
  }
  /**
   * A helper method to create an {@link PitchDetector} using {@link Float64Array} buffers.
   *
   * @param inputLength {number} the input array length to support
   * @returns {PitchDetector<Float64Array>}
   */
  static forFloat64Array(e) {
    return new Mn(e, (t) => new Float64Array(t));
  }
  /**
   * A helper method to create an {@link PitchDetector} using `number[]` buffers.
   *
   * @param inputLength {number} the input array length to support
   * @returns {PitchDetector<number[]>}
   */
  static forNumberArray(e) {
    return new Mn(e, (t) => Array(t));
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
    const n = eo(this._nsdfBuffer);
    if (n.length === 0)
      return [0, 0];
    const s = Math.max(...n.map((c) => this._nsdfBuffer[c])), r = n.find(
      (c) => this._nsdfBuffer[c] >= this._clarityThreshold * s
    ), [o, a] = to(
      // @ts-expect-error resultIndex is guaranteed to be defined
      r,
      this._nsdfBuffer
    );
    return [t / o, Math.min(a, 1)];
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
    for (let n = 0; n < e.length; n++)
      t += e[n] ** 2;
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
    let t = 2 * this._nsdfBuffer[0], n;
    for (n = 0; n < this._nsdfBuffer.length && t > 0; n++)
      this._nsdfBuffer[n] = 2 * this._nsdfBuffer[n] / t, t -= e[n] ** 2 + e[e.length - n - 1] ** 2;
    for (; n < this._nsdfBuffer.length; n++)
      this._nsdfBuffer[n] = 0;
  }
};
function so(i) {
  return i--, i |= i >> 1, i |= i >> 2, i |= i >> 4, i |= i >> 8, i |= i >> 16, i++, i;
}
class io {
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
class ro {
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
   * @param config.volumeHistory.historyLength - Number of frames to average (default: 10)
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
    this.pitchDetector = null, this.analyser = null, this.rawAnalyser = null, this.animationFrame = null, this.componentState = "uninitialized", this.isInitialized = !1, this.isDetecting = !1, this.lastError = null, this.analyserIds = [], this.currentVolume = 0, this.rawVolume = 0, this.currentFrequency = 0, this.detectedNote = "--", this.detectedOctave = null, this.pitchClarity = 0, this.previousFrequency = 0, this.harmonicHistory = [], this.disableHarmonicCorrection = !1, this.callbacks = {}, this.deviceSpecs = null, this.silenceStartTime = null, this.silenceWarningTimer = null, this.silenceTimeoutTimer = null, this.isSilent = !1, this.hasWarned = !1, this.audioManager = e, this.config = {
      fftSize: 4096,
      smoothing: 0.9,
      // 揺れ防止のため強化 (0.1 → 0.9)
      clarityThreshold: 0.4,
      // 0.8から0.4に現実的な値に変更
      // ⬇️ 固定のデフォルト値を削除し、configから渡される値を優先する
      minVolumeAbsolute: t.minVolumeAbsolute ?? 0.015,
      // 安全なフォールバック値
      // 🔧 noiseGate削除: minVolumeAbsoluteと重複のため不要
      deviceOptimization: !0,
      // v1.1.8: デバイス最適化デフォルト有効
      ...t
      // 🎯 外部設定で上書き
    }, this.harmonicConfig = {
      enabled: !0,
      confidenceThreshold: 0.7,
      historyWindow: 1e3,
      frequencyThreshold: 0.1,
      ...t.harmonicCorrection
    }, this.volumeHistoryConfig = {
      historyLength: 10,
      // 音程変化対応のため大幅短縮 (12 -> 10) - 高応答性重視
      useTypedArray: !0,
      // Enable by default for better performance
      ...t.volumeHistory
    }, this.disableHarmonicCorrection = !this.harmonicConfig.enabled, this.silenceDetectionConfig = {
      enabled: !1,
      warningThreshold: 15e3,
      // 15秒で警告
      timeoutThreshold: 3e4,
      // 30秒でタイムアウト
      minVolumeThreshold: 0.01,
      // 消音判定の音量閾値
      ...t.silenceDetection
    }, this.frameRateLimiter = new io(45), console.log(`${us} PitchDetector created with config:`, this.config);
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
    var e, t, n, s, r;
    try {
      this.componentState = "initializing", this.lastError = null, await this.audioManager.initialize(), this.deviceSpecs = this.audioManager.getPlatformSpecs();
      const o = `pitch-detector-filtered-${Date.now()}`;
      this.analyser = this.audioManager.createAnalyser(o, {
        fftSize: this.config.fftSize,
        smoothingTimeConstant: this.config.smoothing,
        minDecibels: -90,
        maxDecibels: -10,
        useFilters: !0
      }), this.analyserIds.push(o);
      const a = `pitch-detector-raw-${Date.now()}`;
      this.rawAnalyser = this.audioManager.createAnalyser(a, {
        fftSize: this.config.fftSize,
        smoothingTimeConstant: this.config.smoothing,
        minDecibels: -90,
        maxDecibels: -10,
        useFilters: !1
      }), this.analyserIds.push(a), this.pitchDetector = no.forFloat32Array(this.analyser.fftSize), typeof process < "u" && ((e = process.env) == null ? void 0 : e.NODE_ENV) === "development" && console.log(`[Debug] Pitchyインスタンス作成: ${!!this.pitchDetector}, FFTサイズ: ${this.analyser.fftSize}`), this.componentState = "ready", this.isInitialized = !0, (n = (t = this.callbacks).onStateChange) == null || n.call(t, this.componentState);
    } catch (o) {
      const a = o instanceof Se ? o : new ot(
        "PitchDetector initialization failed",
        {
          originalError: o instanceof Error ? o.message : String(o),
          audioContextState: this.audioManager.getStatus().audioContextState,
          deviceSpecs: this.deviceSpecs
        }
      );
      throw console.error("❌ [PitchDetector] Initialization error:", a.toJSON()), this.componentState = "error", this.lastError = a, this.isInitialized = !1, (r = (s = this.callbacks).onError) == null || r.call(s, a), o;
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
    var e, t, n, s, r, o;
    if (this.componentState !== "ready") {
      const a = new Error(`Cannot start detection: component state is ${this.componentState}`);
      return (t = (e = this.callbacks).onError) == null || t.call(e, a), !1;
    }
    if (!this.analyser || !this.pitchDetector) {
      const a = new li(
        "ピッチ検出に必要なコンポーネントが初期化されていません。initialize()メソッドを先に呼び出してください。",
        {
          operation: "startDetection",
          hasAnalyser: !!this.analyser,
          hasPitchDetector: !!this.pitchDetector,
          componentState: this.componentState,
          isInitialized: this.isInitialized
        }
      );
      return ke.logError(a, "Pitch detection startup"), this.componentState = "error", (s = (n = this.callbacks).onError) == null || s.call(n, a), !1;
    }
    return this.componentState = "detecting", this.isDetecting = !0, (o = (r = this.callbacks).onStateChange) == null || o.call(r, this.componentState), this.detectPitch(), !0;
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
    var g, _, T, b;
    const e = performance.now();
    if (!this.frameRateLimiter.shouldProcess()) {
      this.animationFrame = requestAnimationFrame(() => this.detectPitch());
      return;
    }
    if (!this.isDetecting || !this.analyser || !this.rawAnalyser || !this.pitchDetector || !this.deviceSpecs) return;
    const t = this.analyser.fftSize, n = new Float32Array(t), s = new Float32Array(this.rawAnalyser.fftSize);
    this.analyser.getFloatTimeDomainData(n), this.rawAnalyser.getFloatTimeDomainData(s);
    let r = 0;
    for (let C = 0; C < t; C++)
      r += Math.abs(n[C]);
    const a = Math.sqrt(r / t);
    this.currentVolume = a, this.rawVolume = a;
    const c = ((g = this.analyser.context) == null ? void 0 : g.sampleRate) || 44100;
    let l = 0, h = 0;
    try {
      const C = this.pitchDetector.findPitch(n, c);
      l = C[0] || 0, h = C[1] || 0;
    } catch (C) {
      const v = new li(
        "Pitch detection algorithm failed",
        {
          bufferLength: n.length,
          sampleRate: c,
          volume: this.currentVolume,
          originalError: C instanceof Error ? C.message : String(C)
        }
      );
      if (console.warn("⚠️ [PitchDetector] Pitch detection error (recoverable):", v.toJSON()), Oi(v))
        l = 0, h = 0;
      else {
        (T = (_ = this.callbacks).onError) == null || T.call(_, v);
        return;
      }
    }
    const u = l >= 30 && l <= 1200;
    if (l && h > this.config.clarityThreshold && this.currentVolume > this.config.minVolumeAbsolute && u) {
      let C = l;
      if (!this.disableHarmonicCorrection) {
        const S = Math.min(this.currentVolume / 100, 1);
        C = this.correctHarmonic(l, S);
      }
      this.currentFrequency = C;
      const v = this.frequencyToNoteAndOctave(this.currentFrequency);
      this.detectedNote = v.note, this.detectedOctave = v.octave, this.pitchClarity = h;
    } else
      this.currentFrequency === 0 && this.resetHarmonicHistory(), this.currentFrequency = 0, this.detectedNote = "--", this.detectedOctave = null, this.pitchClarity = 0;
    this.processSilenceDetection(this.currentVolume);
    const d = {
      frequency: this.currentFrequency,
      note: this.detectedNote,
      octave: this.detectedOctave || void 0,
      clarity: this.pitchClarity,
      volume: a,
      // 生のRMS値を送信（AudioDetectionComponentで処理）
      cents: this.currentFrequency > 0 ? this.frequencyToCents(this.currentFrequency) : void 0
    };
    this.processAudioData(d), this.updateVisuals(d);
    const p = performance.now() - e;
    this.frameRateLimiter.getStats().frameDrops === 0 && this.frameRateLimiter.recoverPerformance(), typeof process < "u" && ((b = process.env) == null ? void 0 : b.NODE_ENV) === "development" && p > 16.67 && console.warn(`[PitchDetector] Frame processing took ${p.toFixed(2)}ms (>16.67ms threshold)`), this.animationFrame = requestAnimationFrame(() => this.detectPitch());
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
    var u, d;
    if (!this.harmonicConfig.enabled)
      return this.previousFrequency = e, e;
    const n = performance.now();
    if (this.harmonicHistory = this.harmonicHistory.filter(
      (f) => n - f.timestamp < this.harmonicConfig.historyWindow
    ), this.harmonicHistory.push({ frequency: e, confidence: t, timestamp: n }), this.harmonicHistory.length < 8)
      return this.previousFrequency = e, e;
    const s = this.harmonicHistory.reduce((f, p) => f + p.frequency, 0) / this.harmonicHistory.length, r = e * 2, o = e / 2, a = Math.abs(e - s), c = Math.abs(r - s), l = Math.abs(o - s);
    let h = e;
    return l < a && l < c ? (h = o, typeof process < "u" && ((u = process.env) == null || u.NODE_ENV)) : c < a && c < l && (h = r, typeof process < "u" && ((d = process.env) == null || d.NODE_ENV)), this.previousFrequency = h, h;
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
    const s = Math.round(12 * Math.log2(e / 440)), r = (s + 9 + 120) % 12, o = Math.floor((s + 9) / 12) + 4;
    return { note: t[r], octave: o };
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
    const n = 12 * Math.log2(e / 440), s = Math.round(n), r = (n - s) * 100;
    return Math.round(r);
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
    const t = Date.now(), n = this.silenceDetectionConfig.minVolumeThreshold || 0.01;
    e < n ? this.isSilent || (this.isSilent = !0, this.silenceStartTime = t, this.hasWarned = !1, this.silenceDetectionConfig.warningThreshold && (this.silenceWarningTimer = window.setTimeout(() => {
      this.handleSilenceWarning();
    }, this.silenceDetectionConfig.warningThreshold)), this.silenceDetectionConfig.timeoutThreshold && (this.silenceTimeoutTimer = window.setTimeout(() => {
      this.handleSilenceTimeout();
    }, this.silenceDetectionConfig.timeoutThreshold))) : this.isSilent && (this.resetSilenceTracking(), this.silenceDetectionConfig.onSilenceRecovered && this.silenceDetectionConfig.onSilenceRecovered());
  }
  /**
   * Handle silence warning
   */
  handleSilenceWarning() {
    if (!this.hasWarned && this.silenceStartTime) {
      const e = Date.now() - this.silenceStartTime;
      this.hasWarned = !0, this.silenceDetectionConfig.onSilenceWarning && this.silenceDetectionConfig.onSilenceWarning(e);
    }
  }
  /**
   * Handle silence timeout
   */
  handleSilenceTimeout() {
    this.silenceDetectionConfig.onSilenceTimeout && this.silenceDetectionConfig.onSilenceTimeout(), this.stopDetection(), this.resetSilenceTracking();
  }
  /**
   * Reset silence tracking state
   */
  resetSilenceTracking() {
    this.isSilent = !1, this.silenceStartTime = null, this.hasWarned = !1, this.silenceWarningTimer && (clearTimeout(this.silenceWarningTimer), this.silenceWarningTimer = null), this.silenceTimeoutTimer && (clearTimeout(this.silenceTimeoutTimer), this.silenceTimeoutTimer = null);
  }
  /**
   * Reset display state and immediately update UI elements
   */
  resetDisplayState() {
    this.currentVolume = 0, this.rawVolume = 0, this.currentFrequency = 0, this.detectedNote = "--", this.detectedOctave = null, this.pitchClarity = 0, this.resetHarmonicHistory(), this.resetSilenceTracking(), this.forceUIUpdate();
  }
  /**
   * Force UI update with current internal state (reset values)
   * @private
   */
  forceUIUpdate() {
    try {
      [
        "#volume-bar",
        "#mic-volume-bar",
        "#range-volume-bar",
        "#practice-volume-bar",
        '[id*="volume-bar"]',
        ".volume-bar"
      ].forEach((r) => {
        const o = document.querySelector(r);
        o && (o instanceof HTMLProgressElement ? o.value = 0 : o.style.width = "0%");
      }), [
        "#volume-text",
        "#mic-volume-text",
        "#range-volume-text",
        "#practice-volume-text",
        '[id*="volume-text"]',
        ".volume-text"
      ].forEach((r) => {
        const o = document.querySelector(r);
        o && (o.textContent = "0.0%");
      }), [
        "#frequency",
        "#mic-frequency",
        "#range-frequency",
        "#practice-frequency",
        '[id*="frequency"]',
        ".frequency",
        "#freq-1",
        "#freq-2",
        "#freq-3"
      ].forEach((r) => {
        const o = document.querySelector(r);
        o && (o.textContent = "0.0 Hz");
      }), [
        "#note",
        "#note-display",
        "#mic-note",
        "#range-note",
        "#practice-note",
        '[id*="note"]',
        ".note",
        ".note-display"
      ].forEach((r) => {
        const o = document.querySelector(r);
        o && (o.textContent = "--");
      });
    } catch (e) {
      console.warn("⚠️ [PitchDetector] Error in forceUIUpdate:", e.message);
    }
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
    }, this.silenceDetectionConfig.enabled || this.resetSilenceTracking();
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
    var t, n;
    (n = (t = this.callbacks).onPitchUpdate) == null || n.call(t, e);
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
    this.cleanup(), await new Promise((e) => setTimeout(e, 100)), await this.initialize();
  }
  /**
   * Cleanup resources
   */
  cleanup() {
    this.stopDetection(), this.analyserIds.length > 0 && (this.audioManager.release(this.analyserIds), this.analyserIds = []), this.componentState = "uninitialized", this.isInitialized = !1, this.lastError = null, this.analyser = null, this.rawAnalyser = null, this.pitchDetector = null, this.resetHarmonicHistory();
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
    this.stopDetection(), this.analyserIds.length > 0 && (this.audioManager.release(this.analyserIds), this.analyserIds = []), this.componentState = "uninitialized", this.isInitialized = !1, this.lastError = null, this.analyser = null;
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
  // 削除: initializeVolumeHistory, updateVolumeHistoryConfig（統合音量処理でAudioDetectionComponentに移管）
  /**
   * Update harmonic correction configuration
   *
   * @param config - Partial harmonic correction configuration to update
   */
  updateHarmonicConfig(e) {
    var t;
    this.harmonicConfig = { ...this.harmonicConfig, ...e }, this.resetHarmonicHistory(), typeof process < "u" && ((t = process.env) == null || t.NODE_ENV);
  }
}
class rd {
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
      highpassFreq: 50,
      // 深い男性の声に対応（G1 49Hzまで）
      lowpassFreq: 800,
      notchFreq: 50,
      // 🔧 日本の電源周波数50Hzに合わせて電源ハムノイズを除去
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
      const t = new ot(
        "ノイズフィルターチェーンの初期化に失敗しました。オーディオシステムのサポート状況を確認してください。",
        {
          operation: "createFilterChain",
          originalError: e.message,
          filterConfig: this.config,
          audioContextState: this.audioContext.state,
          sampleRate: this.audioContext.sampleRate
        }
      );
      throw ke.logError(t, "NoiseFilter initialization"), console.error("❌ [NoiseFilter] Failed to create filter chain:", t.toJSON()), t;
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
      const n = new Se(
        "ノイズフィルターが正しく初期化されていません。コンストラクタでuseFilters: trueで初期化してください。",
        mt.AUDIO_CONTEXT_ERROR,
        {
          operation: "connect",
          useFilters: this.config.useFilters,
          hasHighpassFilter: !!this.highpassFilter,
          hasLowpassFilter: !!this.lowpassFilter,
          hasNotchFilter: !!this.notchFilter
        }
      );
      throw ke.logError(n, "NoiseFilter connection"), n;
    }
    try {
      return this.disconnect(), this.inputNode = e, this.outputNode = t || null, e.connect(this.highpassFilter), this.highpassFilter.connect(this.lowpassFilter), this.lowpassFilter.connect(this.notchFilter), t && this.notchFilter.connect(t), this.isConnected = !0, console.log("🔗 [NoiseFilter] Filter chain connected"), this.notchFilter;
    } catch (n) {
      const s = new ot(
        "ノイズフィルターの接続に失敗しました。オーディオノードの接続状態を確認してください。",
        {
          operation: "connect",
          originalError: n.message,
          hasInputNode: !!this.inputNode,
          hasOutputNode: !!this.outputNode,
          isConnected: this.isConnected,
          filterConfig: this.config
        }
      );
      throw ke.logError(s, "NoiseFilter audio connection"), console.error("❌ [NoiseFilter] Connection failed:", s.toJSON()), s;
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
    } catch (n) {
      const s = new Se(
        "フィルターパラメータの更新に失敗しました。指定した値が範囲外であるか、フィルターが無効になっている可能性があります。",
        mt.INVALID_SAMPLE_RATE,
        {
          operation: "updateFrequencies",
          originalError: n.message,
          requestedParams: e,
          currentConfig: this.config,
          audioContextTime: this.audioContext.currentTime
        }
      );
      throw ke.logError(s, "NoiseFilter parameter update"), console.error("❌ [NoiseFilter] Parameter update failed:", s.toJSON()), s;
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
      const t = new Float32Array([e]), n = new Float32Array(1), s = new Float32Array(1);
      this.highpassFilter.getFrequencyResponse(t, n, s);
      const r = n[0];
      this.lowpassFilter.getFrequencyResponse(t, n, s);
      const o = n[0];
      this.notchFilter.getFrequencyResponse(t, n, s);
      const a = n[0];
      return {
        magnitude: r * o * a,
        phase: s[0]
      };
    } catch (t) {
      const n = new Se(
        "フィルター応答の計算に失敗しました。デフォルト値を返します。",
        mt.PROCESSING_TIMEOUT,
        {
          operation: "getFilterResponse",
          frequency: e,
          originalError: t.message,
          useFilters: this.config.useFilters
        }
      );
      return ke.logError(n, "Filter response calculation"), console.warn("⚠️ [NoiseFilter] Filter response calculation failed:", n.toJSON()), { magnitude: 1, phase: 0 };
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
var Un = /* @__PURE__ */ ((i) => (i[i.DEBUG = 0] = "DEBUG", i[i.INFO = 1] = "INFO", i[i.WARN = 2] = "WARN", i[i.ERROR = 3] = "ERROR", i[i.SILENT = 4] = "SILENT", i))(Un || {});
class cn {
  constructor(e = 1, t = "", n = {}) {
    this.listeners = [], this.level = e, this.prefix = t, this.context = n;
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
    const n = this.prefix ? `${this.prefix}:${e}` : e, s = { ...this.context, ...t }, r = new cn(this.level, n, s);
    return r.addListener((o) => {
      this.listeners.forEach((a) => a(o));
    }), r;
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
  error(e, t, n) {
    const s = t ? {
      errorName: t.name,
      errorMessage: t.message,
      stack: t.stack,
      ...n
    } : n;
    this.log(3, e, s);
  }
  /**
   * Core logging method
   */
  log(e, t, n) {
    if (e < this.level)
      return;
    const s = {
      level: e,
      message: t,
      context: { ...this.context, ...n },
      timestamp: Date.now(),
      prefix: this.prefix
    };
    this.logToConsole(s), this.listeners.forEach((r) => {
      try {
        r(s);
      } catch (o) {
        console.error("Logger listener error:", o);
      }
    });
  }
  /**
   * Format and output to console
   */
  logToConsole(e) {
    const t = new Date(e.timestamp).toISOString(), n = Un[e.level], s = e.prefix ? `[${e.prefix}]` : "", r = `${t} ${n} ${s} ${e.message}`, o = this.getConsoleMethod(e.level);
    e.context && Object.keys(e.context).length > 0 ? o(r, e.context) : o(r);
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
const zn = new cn(1, "PitchPro"), od = (i, e) => zn.debug(i, e), ad = (i, e) => zn.info(i, e), cd = (i, e) => zn.warn(i, e), ld = (i, e, t) => zn.error(i, e, t);
class oo {
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
      logLevel: t.logLevel ?? Un.INFO,
      enableDetailedLogging: t.enableDetailedLogging ?? !1
    }, this.logger = new cn(
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
    }), this.eventListeners.forEach(({ target: e, listener: t, eventName: n }, s) => {
      try {
        e.removeEventListener(n, t);
      } catch (r) {
        this.logger.warn("Failed to remove event listener", {
          eventName: n,
          key: s,
          error: r.message
        });
      }
    }), this.eventListeners.clear(), this.logger.debug("All event listeners removed");
  }
  /**
   * Acquire microphone resources (with reference counting)
   */
  async acquire() {
    var e, t, n, s;
    this.refCount++, console.log(`🎤 [MicrophoneLifecycleManager] Acquiring resources (refCount: ${this.refCount})`);
    try {
      if (!this.isActive) {
        const o = await this.audioManager.initialize();
        return this.isActive = !0, this.lastActivityTime = Date.now(), this.autoRecoveryAttempts = 0, this.startHealthMonitoring(), this.startIdleMonitoring(), this.startVisibilityMonitoring(), (t = (e = this.callbacks).onStateChange) == null || t.call(e, "active"), console.log("🟢 [MicrophoneLifecycleManager] Microphone activated"), o;
      }
      return this.updateActivity(), await this.audioManager.initialize();
    } catch (r) {
      throw console.error("❌ [MicrophoneLifecycleManager] Failed to acquire resources:", r), this.refCount = Math.max(0, this.refCount - 1), (s = (n = this.callbacks).onError) == null || s.call(n, r), r;
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
    }, n = () => {
      this.forceRelease();
    }, s = () => {
      this.isPageVisible = !0, this.handleVisibilityChange();
    }, r = () => {
      this.isPageVisible = !1, this.handleVisibilityChange();
    };
    document.addEventListener("visibilitychange", e), document.addEventListener("mousemove", t), document.addEventListener("keydown", t), document.addEventListener("click", t), document.addEventListener("scroll", t), document.addEventListener("touchstart", t), window.addEventListener("beforeunload", n), window.addEventListener("unload", n), window.addEventListener("focus", s), window.addEventListener("blur", r), this.eventListeners.set("visibilitychange", { target: document, listener: e, eventName: "visibilitychange" }), this.eventListeners.set("mousemove", { target: document, listener: t, eventName: "mousemove" }), this.eventListeners.set("keydown", { target: document, listener: t, eventName: "keydown" }), this.eventListeners.set("click", { target: document, listener: t, eventName: "click" }), this.eventListeners.set("scroll", { target: document, listener: t, eventName: "scroll" }), this.eventListeners.set("touchstart", { target: document, listener: t, eventName: "touchstart" }), this.eventListeners.set("beforeunload", { target: window, listener: n, eventName: "beforeunload" }), this.eventListeners.set("unload", { target: window, listener: n, eventName: "unload" }), this.eventListeners.set("focus", { target: window, listener: s, eventName: "focus" }), this.eventListeners.set("blur", { target: window, listener: r, eventName: "blur" }), console.log("👂 [MicrophoneLifecycleManager] Event listeners setup complete");
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
    var e, t, n, s;
    if (this.isActive)
      try {
        const r = this.audioManager.checkMediaStreamHealth();
        if (this.lastHealthCheck = r, r.healthy)
          this.autoRecoveryAttempts > 0 && (this.logger.info("Microphone health restored, resetting recovery attempts", {
            previousAttempts: this.autoRecoveryAttempts,
            healthStatus: r
          }), this.autoRecoveryAttempts = 0);
        else if (this.logger.warn("Unhealthy microphone state detected", { healthStatus: r }), this.autoRecoveryAttempts < this.config.maxAutoRecoveryAttempts)
          this.autoRecoveryAttempts++, this.logger.warn("Attempting automatic recovery", {
            attempt: this.autoRecoveryAttempts,
            maxAttempts: this.config.maxAutoRecoveryAttempts,
            healthStatus: r
          }), setTimeout(async () => {
            var o, a;
            try {
              await this.audioManager.initialize(), this.logger.info("Automatic recovery successful", {
                attempt: this.autoRecoveryAttempts,
                totalAttempts: this.autoRecoveryAttempts
              }), this.autoRecoveryAttempts = 0, this.dispatchCustomEvent("pitchpro:lifecycle:autoRecoverySuccess", {});
            } catch (c) {
              this.logger.error("Automatic recovery failed", c, {
                attempt: this.autoRecoveryAttempts,
                maxAttempts: this.config.maxAutoRecoveryAttempts
              }), (a = (o = this.callbacks).onError) == null || a.call(o, c), this.dispatchCustomEvent("pitchpro:lifecycle:autoRecoveryFailed", { error: c });
            }
          }, this.config.autoRecoveryDelayMs);
        else {
          const o = new Xr(
            `Microphone health check failed after ${this.autoRecoveryAttempts} recovery attempts. Monitoring stopped to prevent infinite error loop.`,
            r,
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
            healthStatus: r
          }), this.stopAllMonitoring(), this.isActive = !1, (t = (e = this.callbacks).onError) == null || t.call(e, o), this.dispatchCustomEvent("pitchpro:lifecycle:maxRecoveryAttemptsReached", {
            attempts: this.autoRecoveryAttempts,
            lastHealthStatus: r
          });
        }
      } catch (r) {
        this.logger.error("Health check failed", r, {
          operation: "performHealthCheck",
          isActive: this.isActive,
          attempts: this.autoRecoveryAttempts
        }), (s = (n = this.callbacks).onError) == null || s.call(n, r);
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
    const n = new CustomEvent(e, { detail: t });
    window.dispatchEvent(n);
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
class ao {
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
    const t = `notification-${++this.notificationCounter}`, n = this.createNotificationElement(t, e);
    if (this.notifications.size >= this.maxNotifications) {
      const s = Array.from(this.notifications.keys())[0];
      this.remove(s);
    }
    if (this.container.appendChild(n), this.notifications.set(t, n), e.autoHide !== !1) {
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
    const n = document.createElement("div");
    n.className = [
      this.cssClasses.notification,
      this.cssClasses[t.type],
      t.priority ? this.cssClasses[t.priority] : ""
    ].filter(Boolean).join(" "), n["data-notification-id"] = e;
    const s = document.createElement("div");
    s.className = this.cssClasses.title, s.textContent = t.title, n.appendChild(s);
    const r = document.createElement("div");
    if (r.className = this.cssClasses.message, r.textContent = t.message, n.appendChild(r), t.details && t.details.length > 0) {
      const a = document.createElement("div");
      a.className = this.cssClasses.details;
      const c = document.createElement("ul");
      c.style.margin = "0", c.style.paddingLeft = "16px", t.details.forEach((l) => {
        const h = document.createElement("li");
        h.textContent = l, c.appendChild(h);
      }), a.appendChild(c), n.appendChild(a);
    }
    if (t.solution) {
      const a = document.createElement("div");
      a.className = this.cssClasses.solution, a.textContent = t.solution, n.appendChild(a);
    }
    const o = document.createElement("button");
    return o.className = this.cssClasses.closeButton, o.innerHTML = "×", o.setAttribute("aria-label", "Close notification"), o.addEventListener("click", () => {
      this.remove(e);
    }), n.appendChild(o), n;
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
  showError(e, t, n = {}) {
    return this.show({
      type: "error",
      title: e,
      message: t,
      priority: "high",
      autoHide: !1,
      // Errors should be manually dismissed
      ...n
    });
  }
  /**
   * Show warning notification (convenience method)
   */
  showWarning(e, t, n = {}) {
    return this.show({
      type: "warning",
      title: e,
      message: t,
      priority: "medium",
      duration: 8e3,
      // Longer duration for warnings
      ...n
    });
  }
  /**
   * Show success notification (convenience method)
   */
  showSuccess(e, t, n = {}) {
    return this.show({
      type: "success",
      title: e,
      message: t,
      priority: "low",
      duration: 3e3,
      // Shorter duration for success messages
      ...n
    });
  }
  /**
   * Show info notification (convenience method)
   */
  showInfo(e, t, n = {}) {
    return this.show({
      type: "info",
      title: e,
      message: t,
      priority: "low",
      ...n
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
class co {
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
    var t, n, s, r, o, a, c, l, h, u, d;
    this.currentState = "uninitialized", this.isPermissionGranted = !1, this.lastError = null, this.eventCallbacks = {}, this.deviceSpecs = null, this.pitchDetector = null, this.audioDetectionComponent = null, this.config = {
      audioManager: {
        sampleRate: ((t = e.audioManager) == null ? void 0 : t.sampleRate) ?? 44100,
        echoCancellation: ((n = e.audioManager) == null ? void 0 : n.echoCancellation) ?? !1,
        noiseSuppression: ((s = e.audioManager) == null ? void 0 : s.noiseSuppression) ?? !1,
        autoGainControl: ((r = e.audioManager) == null ? void 0 : r.autoGainControl) ?? !1
      },
      lifecycle: e.lifecycle ?? {},
      audioConstraints: {
        echoCancellation: ((o = e.audioConstraints) == null ? void 0 : o.echoCancellation) ?? !1,
        noiseSuppression: ((a = e.audioConstraints) == null ? void 0 : a.noiseSuppression) ?? !1,
        autoGainControl: ((c = e.audioConstraints) == null ? void 0 : c.autoGainControl) ?? !1
      },
      notifications: {
        enabled: ((l = e.notifications) == null ? void 0 : l.enabled) ?? !0,
        position: ((h = e.notifications) == null ? void 0 : h.position) ?? "top-right"
      },
      logging: {
        level: ((u = e.logging) == null ? void 0 : u.level) ?? Un.INFO,
        prefix: ((d = e.logging) == null ? void 0 : d.prefix) ?? "MicrophoneController"
      }
    }, this.logger = new cn(
      this.config.logging.level,
      this.config.logging.prefix,
      { component: "MicrophoneController" }
    ), this.logger.debug("Initializing MicrophoneController", { config: this.config }), this.audioManager = new Yr(this.config.audioManager), this.lifecycleManager = new oo(this.audioManager, this.config.lifecycle), this.errorSystem = this.config.notifications.enabled ? new ao() : null, this.setupEventHandlers(), this.detectDevice();
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
    var e, t, n, s;
    try {
      this.updateState("initializing"), console.log("🎤 [MicrophoneController] Starting initialization");
      const r = await this.lifecycleManager.acquire();
      return this.isPermissionGranted = !0, this.updateState("ready"), this.lastError = null, (t = (e = this.eventCallbacks).onPermissionChange) == null || t.call(e, !0), this.dispatchCustomEvent("pitchpro:microphoneGranted", { stream: r.mediaStream }), console.log("✅ [MicrophoneController] Initialization complete"), r;
    } catch (r) {
      throw this.logger.error("Initialization failed", r, {
        operation: "initialize",
        currentState: this.currentState
      }), this.isPermissionGranted = !1, this.handleError(r, "initialization"), (s = (n = this.eventCallbacks).onPermissionChange) == null || s.call(n, !1), this.dispatchCustomEvent("pitchpro:microphoneDenied", { error: r }), r;
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
    var s, r;
    const t = this.audioManager.getSensitivity();
    this.audioManager.setSensitivity(e);
    const n = this.audioManager.getSensitivity();
    t !== n && (console.log(`🔧 [MicrophoneController] Sensitivity changed: ${t}x → ${n}x`), (r = (s = this.eventCallbacks).onSensitivityChange) == null || r.call(s, n), this.dispatchCustomEvent("pitchpro:sensitivityChanged", { sensitivity: n }));
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
   * Mutes the microphone by disabling audio tracks
   * 
   * @description Provides instant mute functionality by disabling MediaStream 
   * audio tracks without requiring resource reinitialization. Maintains stream 
   * connection for quick unmute operations. Ideal for UI switching and temporary 
   * audio interruptions.
   * 
   * @example
   * ```typescript
   * micController.mute();
   * console.log('Microphone muted');
   * ```
   */
  mute() {
    this.logger.info("Muting microphone via controller"), this.audioManager.mute(), this.dispatchCustomEvent("pitchpro:microphoneMuted", {
      timestamp: Date.now(),
      controllerState: this.currentState
    });
  }
  /**
   * Unmutes the microphone by enabling audio tracks
   * 
   * @description Re-enables audio input immediately without initialization delays.
   * Complements the mute() method for seamless audio control during UI operations.
   * 
   * @example
   * ```typescript
   * micController.unmute();
   * console.log('Microphone unmuted');
   * ```
   */
  unmute() {
    this.logger.info("Unmuting microphone via controller"), this.audioManager.unmute(), this.dispatchCustomEvent("pitchpro:microphoneUnmuted", {
      timestamp: Date.now(),
      controllerState: this.currentState
    });
  }
  /**
   * Toggles microphone mute state
   * 
   * @description Convenience method that automatically mutes or unmutes based on 
   * current state. Useful for implementing mute buttons and keyboard shortcuts.
   * 
   * @returns The new mute state (true if now muted, false if now unmuted)
   * 
   * @example
   * ```typescript
   * const isMuted = micController.toggleMute();
   * console.log(`Microphone is now ${isMuted ? 'muted' : 'unmuted'}`);
   * ```
   */
  toggleMute() {
    return this.audioManager.getIsMuted() ? (this.unmute(), !1) : (this.mute(), !0);
  }
  /**
   * Checks if microphone is currently muted
   * 
   * @returns True if microphone is muted, false otherwise
   * 
   * @example
   * ```typescript
   * if (micController.isMuted()) {
   *   console.log('Microphone is currently muted');
   * }
   * ```
   */
  isMuted() {
    return this.audioManager.getIsMuted();
  }
  /**
   * Registers an AudioDetectionComponent instance with this controller for UI management
   * 
   * @description Enables the MicrophoneController to control AudioDetectionComponent UI
   * reset operations for complete system reset including comprehensive UI cleanup.
   * 
   * @param component - The AudioDetectionComponent instance to register
   * 
   * @example
   * ```typescript
   * const audioDetector = new AudioDetectionComponent();
   * const micController = audioDetector.microphoneController;
   * 
   * // Register component for UI control
   * micController.registerAudioDetectionComponent(audioDetector);
   * 
   * // Now reset() includes comprehensive UI reset
   * micController.reset(); // Includes AudioDetectionComponent UI reset
   * ```
   */
  registerAudioDetectionComponent(e) {
    this.audioDetectionComponent = e, this.logger.info("AudioDetectionComponent registered for UI control"), console.log("🎛️ [MicrophoneController] AudioDetectionComponent registered for UI management");
  }
  /**
   * Registers a PitchDetector instance with this controller for unified management
   * 
   * @description Enables the MicrophoneController to act as the central coordinator
   * for the entire PitchPro library by managing PitchDetector instances. This allows
   * unified control over detection, display, and audio management operations.
   * 
   * @param detector - The PitchDetector instance to register
   * 
   * @example
   * ```typescript
   * const micController = new MicrophoneController();
   * const pitchDetector = new PitchDetector(micController.audioManager);
   * 
   * // Register detector for unified control
   * micController.registerDetector(pitchDetector);
   * 
   * // Now controller can manage both audio and detection
   * micController.reset(); // Stops detection, resets display, mutes mic
   * ```
   */
  registerDetector(e) {
    this.pitchDetector = e, this.logger.info("PitchDetector instance has been registered to the controller."), console.log("🎯 [MicrophoneController] PitchDetector registered for unified management");
  }
  /**
   * Starts microphone and pitch detection systems
   * 
   * @description Unmutes the microphone and starts pitch detection if a PitchDetector
   * is registered. This method complements the reset() method for complete system
   * lifecycle management. Provides one-click start functionality for the entire
   * PitchPro library ecosystem.
   * 
   * @returns True if both unmute and detection start succeeded, false otherwise
   * 
   * @example
   * ```typescript
   * // Start system - unmutes mic and begins detection
   * const success = micController.start();
   * if (success) {
   *   console.log('System started successfully');
   * }
   * 
   * // Typical usage pattern
   * micController.reset(); // Stop everything
   * micController.start(); // Resume everything
   * ```
   */
  start() {
    this.logger.info("Starting microphone and pitch detection systems..."), console.log("▶️ [MicrophoneController] Starting comprehensive system startup");
    try {
      this.unmute(), console.log("✅ [MicrophoneController] Microphone unmuted");
    } catch (e) {
      return this.logger.error("Error during microphone unmute", e), console.warn("⚠️ [MicrophoneController] Microphone unmute failed:", e.message), !1;
    }
    if (this.pitchDetector)
      try {
        return this.pitchDetector.startDetection() ? (this.logger.info("PitchDetector detection started successfully"), console.log("✅ [MicrophoneController] Pitch detection started"), console.log("🎉 [MicrophoneController] System startup completed successfully"), !0) : (this.logger.warn("PitchDetector failed to start detection"), console.warn("⚠️ [MicrophoneController] Pitch detection failed to start"), !1);
      } catch (e) {
        return this.logger.error("Error during PitchDetector start", e), console.warn("⚠️ [MicrophoneController] PitchDetector start encountered error:", e.message), !1;
      }
    else
      return this.logger.warn("No PitchDetector registered, cannot start detection"), console.log("⚠️ [MicrophoneController] No PitchDetector registered - skipping detection start"), console.log("ℹ️ [MicrophoneController] Only microphone unmuted, detection not available"), !1;
  }
  /**
   * Performs comprehensive system reset across all managed components
   * 
   * @description Executes a complete system reset by stopping pitch detection,
   * clearing all UI display elements, muting the microphone, and resetting
   * internal states. Provides one-click reset functionality for the entire
   * PitchPro library ecosystem when used as the central coordinator.
   * 
   * @example
   * ```typescript
   * // Complete system reset - stops everything and clears UI
   * micController.reset();
   * console.log('All systems reset and ready for next operation');
   * 
   * // Ideal for UI reset buttons
   * function handleResetButtonClick() {
   *   micController.reset(); // One call handles everything
   * }
   * ```
   */
  reset() {
    if (this.logger.info("Performing full system reset..."), console.log("🔄 [MicrophoneController] Starting comprehensive system reset"), this.pitchDetector)
      try {
        this.pitchDetector.stopDetection(), console.log("✅ [MicrophoneController] PitchDetector stopped"), this.pitchDetector.resetDisplayState(), console.log("✅ [MicrophoneController] Display state reset");
      } catch (e) {
        this.logger.error("Error during PitchDetector reset", e), console.warn("⚠️ [MicrophoneController] PitchDetector reset encountered error:", e.message);
      }
    else
      this.logger.warn("No PitchDetector registered, skipping detector reset."), console.log("⚠️ [MicrophoneController] No PitchDetector registered - skipping detection reset");
    if (this.audioDetectionComponent)
      try {
        typeof this.audioDetectionComponent.resetDisplayElements == "function" ? (this.audioDetectionComponent.resetDisplayElements(), console.log("✅ [MicrophoneController] AudioDetectionComponent UI reset")) : console.warn("⚠️ [MicrophoneController] AudioDetectionComponent does not have resetDisplayElements method");
      } catch (e) {
        this.logger.error("Error during AudioDetectionComponent UI reset", e), console.warn("⚠️ [MicrophoneController] AudioDetectionComponent UI reset encountered error:", e.message);
      }
    else
      console.log("ℹ️ [MicrophoneController] No AudioDetectionComponent registered - skipping comprehensive UI reset");
    try {
      this.mute(), console.log("✅ [MicrophoneController] Microphone muted");
    } catch (e) {
      this.logger.error("Error during microphone mute", e), console.warn("⚠️ [MicrophoneController] Microphone mute encountered error:", e.message);
    }
    try {
      this.resetRecoveryAttempts(), console.log("✅ [MicrophoneController] Recovery attempts reset");
    } catch (e) {
      this.logger.error("Error during recovery reset", e), console.warn("⚠️ [MicrophoneController] Recovery reset encountered error:", e.message);
    }
    this.logger.info("System reset complete."), console.log("🎉 [MicrophoneController] Comprehensive system reset completed"), console.log("ℹ️ [MicrophoneController] Note: Muted state is normal and will not trigger health check errors");
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
      const n = this.audioManager.createAnalyser("microphone-test", {
        fftSize: 1024,
        smoothingTimeConstant: 0.8
      });
      let s = 0, r = null;
      const o = t + e;
      await new Promise((h) => {
        const u = () => {
          if (Date.now() >= o) {
            h();
            return;
          }
          const d = n.fftSize, f = new Float32Array(d);
          n.getFloatTimeDomainData(f);
          let p = 0;
          for (let _ = 0; _ < d; _++)
            p += Math.abs(f[_]);
          const g = Math.sqrt(p / d) * 100;
          if (g > s && (s = g), g > 5) {
            let _ = 0, T = 0;
            for (let b = 1; b < d / 2; b++) {
              const C = Math.abs(f[b]);
              C > T && (T = C, _ = b);
            }
            _ > 0 && (r = _ * 44100 / d);
          }
          requestAnimationFrame(u);
        };
        u();
      }), this.audioManager.removeAnalyser("microphone-test");
      const a = Date.now() - t, c = s > 1, l = r ? r.toFixed(0) : "none";
      return console.log(`🧪 [MicrophoneController] Microphone test complete: volume=${s.toFixed(2)}, frequency=${l}, duration=${a}ms`), {
        success: c,
        volume: s,
        frequency: r,
        duration: a
      };
    } catch (n) {
      const s = Date.now() - t, r = this._createStructuredError(n, "microphone_test");
      return ke.logError(r, "Microphone functionality test"), console.error("❌ [MicrophoneController] Microphone test failed:", r.toJSON()), {
        success: !1,
        volume: 0,
        frequency: null,
        duration: s,
        error: n
      };
    }
  }
  /**
   * Update internal state and notify
   */
  updateState(e) {
    var t, n;
    if (this.currentState !== e) {
      const s = this.currentState;
      this.currentState = e, console.log(`🔄 [MicrophoneController] State changed: ${s} → ${e}`), (n = (t = this.eventCallbacks).onStateChange) == null || n.call(t, e);
    }
  }
  /**
   * Handle errors with notification system
   */
  handleError(e, t) {
    var s, r;
    const n = e instanceof Se ? e : this._createStructuredError(e, t);
    ke.logError(n, `MicrophoneController ${t}`), console.error(`❌ [MicrophoneController] Error in ${t}:`, n.toJSON()), this.lastError = e, this.updateState("error"), this.errorSystem && (t === "initialization" || t === "lifecycle" ? this.errorSystem.showMicrophoneError(e, t) : this.errorSystem.showError(
      "マイクエラー",
      `${t}でエラーが発生しました: ${e.message}`,
      { priority: "medium" }
    )), (r = (s = this.eventCallbacks).onError) == null || r.call(s, e);
  }
  /**
   * Dispatch custom DOM event
   */
  dispatchCustomEvent(e, t) {
    if (typeof window > "u") return;
    const n = new CustomEvent(e, { detail: t });
    window.dispatchEvent(n);
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
    return e.message.includes("Permission denied") || e.message.includes("NotAllowedError") || e.message.includes("permission") || e.message.includes("denied") ? new ws(
      "マイクへのアクセス許可が拒否されました。ブラウザの設定でマイクアクセスを許可してください。",
      {
        operation: t,
        originalError: e.message,
        deviceSpecs: this.deviceSpecs,
        permissionState: this.isPermissionGranted,
        controllerState: this.currentState,
        userAgent: typeof navigator < "u" ? navigator.userAgent : "unknown"
      }
    ) : e.message.includes("AudioContext") || e.message.includes("audio") || e.message.includes("context") || e.message.includes("initialization") ? new ot(
      "オーディオシステムの初期化に失敗しました。デバイスの音響設定を確認するか、ブラウザを再起動してください。",
      {
        operation: t,
        originalError: e.message,
        controllerState: this.currentState,
        audioManagerStatus: this.audioManager.getStatus(),
        deviceSpecs: this.deviceSpecs
      }
    ) : new Se(
      `${t}中に予期しないエラーが発生しました: ${e.message}`,
      mt.MICROPHONE_ACCESS_DENIED,
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
const ee = class ee {
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
    return e <= 0 ? 0 : Math.round(12 * Math.log2(e / ee.A4_FREQUENCY) + ee.A4_MIDI_NUMBER);
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
    return ee.A4_FREQUENCY * Math.pow(2, (e - ee.A4_MIDI_NUMBER) / 12);
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
    const n = ee.frequencyToMidi(e), s = t ? ee.FLAT_NOTE_NAMES : ee.NOTE_NAMES, r = (n - 12) % 12, o = Math.floor((n - 12) / 12);
    return {
      name: s[r] + o,
      octave: o,
      midi: n,
      frequency: ee.midiToFrequency(n)
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
    const t = 12 * Math.log2(e / ee.A4_FREQUENCY) + ee.A4_MIDI_NUMBER, n = Math.round(t), s = (t - n) * 100;
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
    const t = ee.frequencyToMidi(e);
    return ee.midiToFrequency(t);
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
    const n = ee.frequencyToMidi(e), s = ee.frequencyToMidi(t);
    return Math.abs(s - n);
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
    const n = ee.frequencyToMidi(e);
    return ee.frequencyToMidi(t) - n;
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
    }, n = (e % 12 + 12) % 12, s = Math.floor(e / 12), r = t[n] || "Unknown";
    return {
      name: s > 0 ? `${r} + ${s} octave(s)` : r,
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
    const n = [];
    for (let s = 0; s < 12 * t; s++) {
      const r = e * Math.pow(2, s / 12);
      n.push(r);
    }
    return n;
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
    return [0, 2, 4, 5, 7, 9, 11, 12].map((n) => e * Math.pow(2, n / 12));
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
    return [0, 2, 3, 5, 7, 8, 10, 12].map((n) => e * Math.pow(2, n / 12));
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
    const n = [];
    for (let s = 1; s <= t; s++)
      n.push(e * s);
    return n;
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
  static isHarmonic(e, t, n = 0.05) {
    if (t <= 0 || e <= 0)
      return { isHarmonic: !1, harmonicNumber: null, exactFrequency: null };
    const s = e / t, r = Math.round(s);
    return r >= 1 && Math.abs(s - r) <= n ? {
      isHarmonic: !0,
      harmonicNumber: r,
      exactFrequency: t * r
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
    return ee.frequencyToNote(e).name;
  }
  /**
   * Convert scientific pitch notation to frequency
   */
  static scientificPitchToFrequency(e) {
    const t = e.match(/^([A-G][#b]?)(-?\d+)$/);
    if (!t) return 0;
    const [, n, s] = t, r = parseInt(s, 10);
    let o = 0;
    const a = n[0], c = n.slice(1);
    o = {
      C: 0,
      D: 2,
      E: 4,
      F: 5,
      G: 7,
      A: 9,
      B: 11
    }[a] || 0, c === "#" ? o += 1 : c === "b" && (o -= 1);
    const h = (r + 1) * 12 + o;
    return ee.midiToFrequency(h);
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
ee.A4_FREQUENCY = 440, ee.A4_MIDI_NUMBER = 69, ee.NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"], ee.FLAT_NOTE_NAMES = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"], ee.INTERVALS = {
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
let Ne = ee;
/**
 * PitchPro Audio Processing Library
 * High-precision pitch detection and audio processing for web applications
 * 
 * @description A comprehensive audio detection component that provides real-time pitch detection,
 * volume analysis, and frequency display with automatic device optimization and UI management.
 * 
 * Supports unified management through MicrophoneController for centralized system control.
 * 
 * @version 1.3.0 (自動同期)
 * @author PitchPro Team
 * @license MIT
 * 
 * @example
 * ```typescript
 * // Basic usage with automatic device optimization
 * const audioDetector = new AudioDetectionComponent({
 *   volumeBarSelector: '#volume-bar',
 *   frequencySelector: '#frequency-display'
 * });
 * 
 * // Initialize the component
 * await audioDetector.initialize();
 * 
 * // Start pitch detection (v1.3.0 API)
 * const success = await audioDetector.startDetection();
 * if (success) {
 *   console.log('Detection started successfully');
 * }
 * 
 * // Stop detection but preserve UI state
 * audioDetector.stopDetection();
 * 
 * // Complete reset including UI (recommended)
 * audioDetector.microphoneController?.reset();
 * 
 * // Clean up when done
 * audioDetector.destroy();
 * ```
 * 
 * @example
 * ```typescript
 * // Advanced configuration for custom processing
 * const audioDetector = new AudioDetectionComponent({
 *   clarityThreshold: 0.3,
 *   minVolumeAbsolute: 0.001,
 *   deviceOptimization: true,
 *   autoUpdateUI: false, // Manual UI control
 *   onPitchUpdate: (result) => {
 *     // Custom processing with device-optimized results
 *     console.log(`Frequency: ${result.frequency}Hz, Volume: ${result.volume}%`);
 *   }
 * });
 * 
 * await audioDetector.initialize();
 * await audioDetector.startDetection();
 * ```
 * 
 * @example
 * ```typescript
 * // Using MicrophoneController for unified system management
 * const audioDetector = new AudioDetectionComponent({
 *   volumeBarSelector: '#volume-bar',
 *   frequencySelector: '#frequency-display'
 * });
 * 
 * await audioDetector.initialize();
 * const micController = audioDetector.microphoneController;
 * 
 * if (micController) {
 *   // Unified system control
 *   micController.start();     // Start detection
 *   micController.toggleMute(); // Mute/unmute
 *   micController.reset();      // Complete reset
 * }
 * ```
 */
const rt = class rt {
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
   * @param config.deviceOptimization - デバイス固有の音量最適化を有効にする (default: true)
   *   - true: 自動音量補正 (PC: 7.5x, iPhone: 11.5x, iPad: 13.0x)
   *   - false: 生音量値を使用（独自処理向け）
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
      volumeBarSelector: e.volumeBarSelector,
      volumeTextSelector: e.volumeTextSelector,
      frequencySelector: e.frequencySelector,
      noteSelector: e.noteSelector,
      clarityThreshold: e.clarityThreshold ?? 0.4,
      minVolumeAbsolute: e.minVolumeAbsolute,
      // 🔧 DeviceDetectionの値を優先（デフォルト値削除）
      fftSize: e.fftSize ?? 4096,
      smoothing: e.smoothing ?? 0.1,
      deviceOptimization: e.deviceOptimization ?? !0,
      uiUpdateInterval: e.uiUpdateInterval ?? 50,
      // 20fps
      autoUpdateUI: e.autoUpdateUI ?? !0,
      onPitchUpdate: e.onPitchUpdate,
      // コールバック関数はオプショナル
      debug: e.debug ?? !1,
      logPrefix: e.logPrefix ?? "🎵 AudioDetection"
    }, this.config.deviceOptimization && this.detectAndOptimizeDevice(), this.checkAutoUpdateUIWarnings(), this.debugLog(`${us} AudioDetectionComponent created with config:`, this.config);
  }
  /** @private Helper method for creating delays */
  delay(e) {
    return new Promise((t) => setTimeout(t, e));
  }
  /**
   * 自動UI更新機能に関する警告をチェックして表示
   */
  checkAutoUpdateUIWarnings() {
    const e = !!(this.config.volumeBarSelector || this.config.volumeTextSelector || this.config.frequencySelector || this.config.noteSelector);
    e && !this.config.autoUpdateUI && console.warn(
      "⚠️ [PitchPro v1.1.9] UI selectors provided without autoUpdateUI=true. Set autoUpdateUI=true to enable automatic updates, or remove selectors for manual control in onPitchUpdate callback."
    ), e && this.config.autoUpdateUI && console.info(
      "ℹ️ [PitchPro] Automatic UI updates enabled. Note: Values applied may include device-specific multipliers and may differ from callback result.volume. For precise control, set autoUpdateUI=false and handle UI manually."
    );
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
    var e, t, n, s, r, o;
    if (this.isInitialized) {
      this.debugLog("Already initialized");
      return;
    }
    try {
      this.updateState("initializing"), this.debugLog(`${us} Starting initialization...`), this.micController = new co({
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
        onStateChange: (h) => {
          this.debugLog("MicrophoneController state:", h);
        },
        onError: (h) => {
          this.handleError(h, "microphone_controller");
        },
        onDeviceChange: (h) => {
          var u, d;
          this.deviceSpecs = h, (d = (u = this.callbacks).onDeviceDetected) == null || d.call(u, h);
        }
      }), await this.micController.initialize(), this.audioManager = this.micController.audioManager, this.debugLog("✅ AudioManager reference obtained from MicrophoneController"), this.debugLog("DeviceDetection values:", {
        device: (e = this.deviceSpecs) == null ? void 0 : e.deviceType,
        noiseGate: (t = this.deviceSpecs) == null ? void 0 : t.noiseGate,
        volumeMultiplier: (n = this.deviceSpecs) == null ? void 0 : n.volumeMultiplier,
        smoothingFactor: (s = this.deviceSpecs) == null ? void 0 : s.smoothingFactor
      });
      const a = At.getDeviceSpecs(), c = {
        clarityThreshold: this.config.clarityThreshold,
        // 🔧 DeviceDetectionを完全信頼：deviceSpecsがnullでも安全なPC設定を保証
        minVolumeAbsolute: ((r = this.deviceSpecs) == null ? void 0 : r.noiseGate) ?? a.noiseGate,
        fftSize: this.config.fftSize,
        smoothing: ((o = this.deviceSpecs) == null ? void 0 : o.smoothingFactor) ?? a.smoothingFactor,
        deviceOptimization: this.config.deviceOptimization
      };
      this.debugLog("PitchDetector config object:", c), this.pitchDetector = new ro(this.audioManager, c), this.pitchDetector.setCallbacks({
        onPitchUpdate: (h) => {
          this.handlePitchUpdate(h);
        },
        onError: (h) => {
          this.handleError(h, "pitch_detector");
        },
        onStateChange: (h) => {
          this.debugLog("PitchDetector state:", h), h === "detecting" && this.config.autoUpdateUI ? (this.debugLog("🔄 Starting UI updates (state: detecting)"), this.startUIUpdates()) : h !== "detecting" && this.uiUpdateTimer && (this.debugLog("⏹️ Stopping UI updates (state: " + h + ")"), clearInterval(this.uiUpdateTimer), this.uiUpdateTimer = null);
        }
      }), await this.pitchDetector.initialize();
      const l = this.pitchDetector.getStatus();
      this.debugLog("After PitchDetector initialization:", {
        status: l,
        componentState: l.componentState,
        isInitialized: l.isInitialized
      }), this.micController && this.pitchDetector && (this.micController.registerDetector(this.pitchDetector), this.micController.registerAudioDetectionComponent(this), this.debugLog("✅ PitchDetector and AudioDetectionComponent registered with MicrophoneController for unified management")), this.cacheUIElements(), this.deviceSpecs && this.micController && (this.micController.setSensitivity(this.deviceSpecs.sensitivity), this.debugLog("Applied DeviceDetection sensitivity:", this.deviceSpecs.sensitivity)), this.isInitialized = !0, this.updateState("ready"), this.debugLog("Initialization complete");
    } catch (a) {
      const c = this.createStructuredError(a, "initialization");
      throw ke.logError(c, "AudioDetectionComponent initialization"), this.lastError = c, this.updateState("error"), c;
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
    if (this.config.autoUpdateUI) {
      if (this.isUpdatingSelectors) {
        this.debugLog("UI update skipped - selectors are being updated");
        return;
      }
      try {
        if (this.uiElements.volumeBar && this.config.volumeBarSelector) {
          const t = document.querySelector(this.config.volumeBarSelector);
          if (t && t === this.uiElements.volumeBar) {
            const n = Math.min(100, Math.max(0, e.volume));
            this.uiElements.volumeBar instanceof HTMLProgressElement ? this.uiElements.volumeBar.value = n : this.uiElements.volumeBar.style.width = `${n}%`;
          }
        }
        if (this.uiElements.volumeText && this.config.volumeTextSelector) {
          const t = document.querySelector(this.config.volumeTextSelector);
          if (t && t === this.uiElements.volumeText) {
            const n = Math.min(100, Math.max(0, e.volume));
            this.uiElements.volumeText.textContent = `${n.toFixed(1)}%`;
          }
        }
        if (this.uiElements.frequency && this.config.frequencySelector) {
          const t = document.querySelector(this.config.frequencySelector);
          t && t === this.uiElements.frequency && (e.frequency && e.frequency > 0 ? this.uiElements.frequency.textContent = Ne.formatFrequency(e.frequency) : this.uiElements.frequency.textContent = "0.0 Hz");
        }
        if (this.uiElements.note && this.config.noteSelector && this.config.noteSelector !== "#note-display") {
          const t = document.querySelector(this.config.noteSelector);
          if (t && t === this.uiElements.note)
            if (e.frequency && e.frequency > 0) {
              this.noteResetTimer && (clearTimeout(this.noteResetTimer), this.noteResetTimer = null);
              const n = Ne.frequencyToNote(e.frequency);
              this.debugLog(`Updating note display: ${this.uiElements.note.id || "unknown-id"} with note: ${n.name} (selector: ${this.config.noteSelector})`), this.uiElements.note.textContent = n.name;
            } else
              this.noteResetTimer || (this.noteResetTimer = window.setTimeout(() => {
                this.uiElements.note && (this.debugLog(`Resetting note display: ${this.uiElements.note.id || "unknown-id"} to "-" (delayed, selector: ${this.config.noteSelector})`), this.uiElements.note.textContent = "-"), this.noteResetTimer = null;
              }, rt.NOTE_RESET_DELAY_MS));
          else
            this.debugLog(`Note element mismatch: cached element does not match current selector ${this.config.noteSelector} - skipping update to prevent cross-mode interference`);
        } else
          this.config.noteSelector ? this.debugLog("Note element not found in uiElements.note - check selector caching") : this.debugLog("Note updates skipped - no noteSelector configured");
      } catch (t) {
        this.debugLog("UI update error:", t);
      }
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
    t && this.stopUIUpdates(), await this.delay(rt.SELECTOR_UPDATE_DELAY_MS), this.resetAllUIElements(), e.volumeBarSelector !== void 0 && (this.config.volumeBarSelector = e.volumeBarSelector), e.volumeTextSelector !== void 0 && (this.config.volumeTextSelector = e.volumeTextSelector), e.frequencySelector !== void 0 && (this.config.frequencySelector = e.frequencySelector), e.noteSelector !== void 0 ? this.config.noteSelector = e.noteSelector : (this.config.noteSelector = "", this.debugLog("noteSelector cleared automatically to prevent cross-mode interference")), this.cacheUIElements(), await this.delay(rt.SELECTOR_UPDATE_DELAY_MS), this.resetAllUIElements(), this.isUpdatingSelectors = !1, t && (await this.delay(rt.UI_RESTART_DELAY_MS), this.startUIUpdates()), this.debugLog("Selectors updated, all elements reset, and UI elements re-cached:", Object.keys(this.uiElements));
  }
  /**
   * コールバック関数を設定
   * 
   * @param callbacks - 設定するコールバック関数
   * 
   * @example
   * ```typescript
   * audioDetector.setCallbacks({
   *   onPitchUpdate: (result) => {
   *     console.log('音程検出:', result);
   *     // result.volume は既にデバイス固有補正済み（0-100%）
   *     // PC: 生音量 × 3.0, iPhone: 生音量 × 7.5, iPad: 生音量 × 20.0
   *   },
   *   onError: (error) => {
   *     console.error('検出エラー:', error);
   *   }
   * });
   * ```
   */
  setCallbacks(e) {
    this.debugLog("Setting callbacks:", Object.keys(e)), this.callbacks = { ...this.callbacks, ...e }, this.pitchDetector && this.pitchDetector.setCallbacks({
      onPitchUpdate: e.onPitchUpdate,
      // PitchDetectorのErrorCallbackは標準Errorを期待するため、PitchProErrorをErrorにラップ
      onError: e.onError ? (t) => {
        var s;
        const n = t instanceof Error && "code" in t ? t : this.createStructuredError(t, "pitch_detector");
        (s = e.onError) == null || s.call(e, n);
      } : void 0
    });
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
      this.stopUIUpdates(), this.noteResetTimer && (clearTimeout(this.noteResetTimer), this.noteResetTimer = null), this.pitchDetector && (this.pitchDetector.destroy(), this.pitchDetector = null), this.micController && (this.micController.destroy(), this.micController = null), this.uiElements = {}, this.isInitialized = !1, this.currentState = "uninitialized", this.callbacks = {}, this.lastError = null, this.debugLog("AudioDetectionComponent destroyed");
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
  /**
   * Provides access to the MicrophoneController for unified system management
   * 
   * @description Exposes the MicrophoneController instance to enable external access
   * to unified reset operations, mute/unmute functionality, and centralized control
   * of the entire PitchPro system. This is the primary interface for system-wide operations.
   * 
   * @returns The MicrophoneController instance, or null if not initialized
   * 
   * @example
   * ```typescript
   * const micController = audioDetector.microphoneController;
   * if (micController) {
   *   // Perform unified system reset
   *   micController.reset(); // Stops detection, clears UI, mutes mic
   *   
   *   // Control microphone state
   *   micController.toggleMute();
   * }
   * ```
   */
  get microphoneController() {
    return this.micController;
  }
  // Private methods implementation continues...
  // (Will be implemented in the next part)
  /**
   * Detects device type and applies optimization settings
   * @private
   */
  detectAndOptimizeDevice() {
    this.deviceSpecs = At.getDeviceSpecs(), this.debugLog("Using DeviceDetection values directly:", {
      device: this.deviceSpecs.deviceType,
      noiseGate: `${this.deviceSpecs.noiseGate} (${(this.deviceSpecs.noiseGate * 100).toFixed(2)}% threshold)`,
      volumeMultiplier: this.deviceSpecs.volumeMultiplier,
      sensitivity: this.deviceSpecs.sensitivity,
      smoothingFactor: this.deviceSpecs.smoothingFactor
    }), this.debugLog("Device optimization applied:", {
      device: this.deviceSpecs.deviceType,
      settings: this.deviceSpecs
      // ⬅️ deviceSettingsではなくdeviceSpecsを参照
    });
  }
  // ⬇️ 独自のdeviceSettingsMapを削除し、deviceSpecsを直接利用するように変更\n    // DeviceDetection.ts が唯一の情報源となる\n    \n    console.log(`🔧 [DeviceOptimization] Using DeviceDetection values directly:`);\n    console.log(`📱 Device: ${this.deviceSpecs.deviceType}`);\n    console.log(`🎯 noiseGate: ${this.deviceSpecs.noiseGate} (${(this.deviceSpecs.noiseGate * 100).toFixed(2)}% threshold)`);\n    console.log(`🔊 volumeMultiplier: ${this.deviceSpecs.volumeMultiplier}`);\n    console.log(`🎤 sensitivity: ${this.deviceSpecs.sensitivity}`);\n    console.log(`📊 smoothingFactor: ${this.deviceSpecs.smoothingFactor}`);\n    \n    this.debugLog('Device optimization applied:', {\n      device: this.deviceSpecs.deviceType,\n      settings: this.deviceSpecs // ⬅️ deviceSettingsではなくdeviceSpecsを参照\n    });\n  }
  /**
   * Caches UI elements for efficient updates
   * @private
   */
  cacheUIElements() {
    var e;
    if (!this.config.autoUpdateUI) {
      this.debugLog("UI element caching skipped - autoUpdateUI is disabled");
      return;
    }
    this.config.volumeBarSelector && (this.uiElements.volumeBar = document.querySelector(this.config.volumeBarSelector) || void 0), this.config.volumeTextSelector && (this.uiElements.volumeText = document.querySelector(this.config.volumeTextSelector) || void 0), this.config.frequencySelector && (this.uiElements.frequency = document.querySelector(this.config.frequencySelector) || void 0), this.config.noteSelector && (this.uiElements.note = document.querySelector(this.config.noteSelector) || void 0, this.debugLog(`Note element cached: selector="${this.config.noteSelector}", found=${!!this.uiElements.note}, id="${((e = this.uiElements.note) == null ? void 0 : e.id) || "no-id"}"`)), this.debugLog("UI elements cached:", Object.keys(this.uiElements));
  }
  /**
   * Publicly accessible method to reset all UI elements to their initial state
   * Provides external access to comprehensive UI reset functionality
   */
  resetDisplayElements() {
    this.resetAllUIElements();
  }
  /**
   * Starts pitch detection and UI updates
   * 
   * @description This method starts the pitch detection process and begins UI updates.
   * It uses the unified MicrophoneController system for centralized management.
   * 
   * @returns Promise<boolean> - Returns true if detection started successfully, false otherwise
   * 
   * @example
   * ```typescript
   * // Start detection after initialization
   * const success = await audioDetector.startDetection();
   * if (success) {
   *   console.log('Detection started successfully');
   * } else {
   *   console.error('Failed to start detection');
   * }
   * ```
   */
  async startDetection() {
    if (this.debugLog("Starting detection via AudioDetectionComponent..."), !this.isInitialized)
      return this.debugLog("Cannot start detection - component not initialized"), !1;
    if (!this.micController)
      return this.debugLog("Cannot start detection - no MicrophoneController available"), !1;
    try {
      return this.micController.start() ? (this.debugLog("✅ Detection started successfully via MicrophoneController"), this.updateState("detecting"), !0) : (this.debugLog("❌ Failed to start detection via MicrophoneController"), !1);
    } catch (e) {
      const t = this.createStructuredError(e, "start_detection");
      return this.debugLog("Error starting detection:", t), this.lastError = t, this.updateState("error"), !1;
    }
  }
  /**
   * Stops pitch detection but preserves UI state
   * 
   * @description This method stops the pitch detection process while keeping UI elements
   * in their current state. For complete reset including UI, use reset() instead.
   * 
   * @returns boolean - Returns true if detection stopped successfully, false otherwise
   * 
   * @example
   * ```typescript
   * // Stop detection but keep UI values
   * const stopped = audioDetector.stopDetection();
   * if (stopped) {
   *   console.log('Detection stopped, UI preserved');
   * }
   * 
   * // For complete reset including UI:
   * audioDetector.microphoneController?.reset();
   * ```
   */
  /**
   * Stops pitch detection but preserves UI state
   * 
   * @description This method stops the pitch detection process while keeping UI elements
   * in their current state. For complete reset including UI, use reset() instead.
   * 
   * @returns boolean - Returns true if detection stopped successfully, false otherwise
   * 
   * @example
   * ```typescript
   * // Stop detection but keep UI values
   * const stopped = audioDetector.stopDetection();
   * if (stopped) {
   *   console.log('Detection stopped, UI preserved');
   * }
   * 
   * // For complete reset including UI:
   * audioDetector.microphoneController?.reset();
   * ```
   */
  stopDetection() {
    if (this.debugLog("Stopping detection via AudioDetectionComponent..."), !this.pitchDetector)
      return this.debugLog("Cannot stop detection - no PitchDetector available"), !1;
    try {
      return this.pitchDetector.stopDetection(), this.debugLog("✅ Detection stopped successfully, UI state preserved"), this.updateState("ready"), !0;
    } catch (e) {
      const t = this.createStructuredError(e, "stop_detection");
      return this.debugLog("Error stopping detection:", t), this.lastError = t, !1;
    }
  }
  /**
   * Resets all UI elements to their initial state (0 values)
   * @private
   */
  resetAllUIElements() {
    try {
      if (this.uiElements.volumeBar && this.config.volumeBarSelector) {
        const n = document.querySelector(this.config.volumeBarSelector);
        n && n === this.uiElements.volumeBar && (this.uiElements.volumeBar instanceof HTMLProgressElement ? this.uiElements.volumeBar.value = 0 : this.uiElements.volumeBar.style.width = "0%", this.debugLog(`Reset cached volume bar: ${this.config.volumeBarSelector}`));
      }
      if (this.uiElements.volumeText && this.config.volumeTextSelector) {
        const n = document.querySelector(this.config.volumeTextSelector);
        n && n === this.uiElements.volumeText && (this.uiElements.volumeText.textContent = "0.0%", this.debugLog(`Reset cached volume text: ${this.config.volumeTextSelector}`));
      }
      if (this.uiElements.frequency && this.config.frequencySelector) {
        const n = document.querySelector(this.config.frequencySelector);
        n && n === this.uiElements.frequency && (this.uiElements.frequency.textContent = "0.0 Hz", this.debugLog(`Reset cached frequency: ${this.config.frequencySelector}`));
      }
      if (this.uiElements.note && this.config.noteSelector) {
        const n = document.querySelector(this.config.noteSelector);
        n && n === this.uiElements.note && (this.uiElements.note.textContent = "-", this.debugLog(`Reset cached note: ${this.config.noteSelector}`));
      }
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
        "#pitch-3"
      ];
      document.querySelectorAll('[id*="freq"]:not(.frequency-group):not(.frequency-box), [id*="frequency"]:not(.frequency-group):not(.frequency-box), [id*="pitch"]:not(.frequency-group):not(.frequency-box)').forEach((n) => {
        const s = n.textContent || "";
        (s.includes("Hz") || s.match(/^\d+\.?\d*$/)) && (n.classList.contains("frequency-display") || n.id.includes("freq-")) && (n.textContent = "0.0 Hz");
      }), e.forEach((n) => {
        if (n && n !== this.config.volumeBarSelector && n !== this.config.volumeTextSelector && n !== this.config.frequencySelector && n !== this.config.noteSelector) {
          const s = document.querySelector(n);
          if (s) {
            if (this.debugLog(`Processing additional selector: ${n}`), n.includes("volume-bar"))
              s instanceof HTMLProgressElement ? s.value = 0 : s.style.width = "0%";
            else if (n.includes("volume-text"))
              s.textContent = "0.0%";
            else if (n.includes("frequency"))
              s.textContent = "0.0 Hz", s.innerHTML = "0.0 Hz", s.setAttribute("data-frequency", "0"), s.style.display !== "none" && (s.style.opacity = "0.99", s.offsetHeight, s.style.opacity = "");
            else if (n.includes("note")) {
              const r = s.textContent, o = s.innerHTML;
              this.debugLog(`Resetting note element: ${n}, textContent: "${r}", innerHTML: "${o}"`), s.textContent = "-", s.innerHTML = "-", s.style.opacity = "0.99", s.offsetHeight, s.style.opacity = "", this.debugLog(`Note reset complete: ${n}, new textContent: "${s.textContent}", new innerHTML: "${s.innerHTML}"`);
            }
          }
        }
      }), this.debugLog("All UI elements reset to initial state (cached elements processed first)");
    } catch (e) {
      this.debugLog("Error resetting UI elements:", e);
    }
  }
  /**
   * Handles pitch update events from PitchDetector
   * @private
   */
  handlePitchUpdate(e) {
    var n, s, r, o;
    const t = this._getProcessedResult(e);
    t && ((s = (n = this.callbacks).onPitchUpdate) == null || s.call(n, t), (o = (r = this.callbacks).onVolumeUpdate) == null || o.call(r, t.volume));
  }
  /**
   * Starts UI update timer
   * @private
   */
  startUIUpdates() {
    this.uiUpdateTimer && clearInterval(this.uiUpdateTimer), this.uiUpdateTimer = window.setInterval(() => {
      if (this.pitchDetector && this.pitchDetector.getStatus().componentState === "detecting") {
        const e = this.pitchDetector.getLatestResult(), t = this._getProcessedResult(e);
        if (t)
          this.config.autoUpdateUI && this.updateUI(t), this.config.onPitchUpdate ? (this.debugLog("Calling onPitchUpdate callback with result:", t), this.config.onPitchUpdate(t)) : this.debugLog("onPitchUpdate callback not set - skipping callback execution");
        else {
          const n = {
            frequency: 0,
            note: "-",
            octave: 0,
            volume: 0,
            rawVolume: 0,
            clarity: 0
          };
          this.config.autoUpdateUI && this.updateUI(n), this.config.onPitchUpdate && this.config.onPitchUpdate(n);
        }
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
   * 検出結果にデバイス最適化を適用し、最終的な値を生成します。
   * コールバック値とUI値の一貫性を保証するための一元管理メソッド。
   * @param rawResult PitchDetectorからの生の検出結果
   * @returns デバイス最適化が適用された処理済み結果、またはnull
   * @private
   */
  /**
   * 生の検出結果にデバイス固有の音量補正を適用します
   *
   * @remarks
   * このメソッドがPitchProの音量調整の核心部分です。以下の処理を行います：
   *
   * 1. **デバイス固有の音量補正**: volumeMultiplierによる音量調整
   *    - PC: 7.5x（v1.3.0確定）
   *    - iPhone: 9.0x（v1.3.0確定）
   *    - iPad: 13.0x（v1.3.0確定）
   *
   * 2. **範囲制限**: 最終音量を0-100%の範囲に制限
   *
   * 3. **デバッグログ**: モバイルデバイスでの音量調整過程を記録
   *
   * @param rawResult - PitchDetectorから取得した生の検出結果
   * @returns 音量補正が適用された最終的な検出結果
   *
   * @example
   * ```typescript
   * // PitchDetectorからの生結果
   * const rawResult = { frequency: 440, note: 'A4', volume: 15.2 };
   *
   * // iPhone (volumeMultiplier: 11.5) での処理
   * const processed = this._getProcessedResult(rawResult);
   * // → { frequency: 440, note: 'A4', volume: 100 } (15.2 * 11.5 = 174.8 → 100に制限)
   *
   * // PC (volumeMultiplier: 7.5) での処理
   * // → { frequency: 440, note: 'A4', volume: 114 } (15.2 * 7.5 = 114 → 100に制限)
   * ```
   *
   * @since v1.2.0 デバイス固有音量調整システム導入
   * @see {@link detectAndOptimizeDevice} デバイス設定の決定方法
   */
  _getProcessedResult(e) {
    var l, h, u, d, f;
    if (!e) return null;
    const t = { ...e }, s = e.volume * 200, o = (((l = this.deviceSpecs) == null ? void 0 : l.noiseGate) ?? 0.06) * 100 * 10;
    if (s < o)
      return t.volume = 0, t.frequency = 0, t.note = "--", t.rawVolume = e.volume, this.config.debug && this.debugLog("UnifiedVolumeProcessing: BLOCKED", {
        device: (h = this.deviceSpecs) == null ? void 0 : h.deviceType,
        volumeAsPercent: s.toFixed(2),
        noiseGateThreshold: `${o.toFixed(2)}%`,
        note: "Environment noise filtering active"
      }), t;
    const a = ((u = this.deviceSpecs) == null ? void 0 : u.volumeMultiplier) ?? 1, c = s * a;
    return t.volume = Math.min(100, Math.max(0, c)), t.rawVolume = e.volume, this.config.debug && this.debugLog("UnifiedVolumeProcessing: PASSED", {
      device: (d = this.deviceSpecs) == null ? void 0 : d.deviceType,
      initialPercent: s.toFixed(2),
      noiseGate: `${o.toFixed(2)}%`,
      multiplier: a,
      finalVolume: `${t.volume.toFixed(2)}%`,
      frequency: `${(f = e.frequency) == null ? void 0 : f.toFixed(2)}Hz`
    }), t;
  }
  /**
   * Updates component state and notifies callbacks
   * @private
   */
  updateState(e) {
    var t, n;
    if (this.currentState !== e) {
      const s = this.currentState;
      this.currentState = e, this.debugLog(`State changed: ${s} → ${e}`), (n = (t = this.callbacks).onStateChange) == null || n.call(t, e);
    }
  }
  /**
   * Handles errors with proper logging and callback notification
   * @private
   */
  handleError(e, t) {
    var s, r;
    const n = e instanceof Se ? e : this.createStructuredError(e, t);
    this.lastError = n, this.updateState("error"), (r = (s = this.callbacks).onError) == null || r.call(s, n), this.debugLog("Error handled:", n.toJSON());
  }
  /**
   * Creates structured error with context information
   * @private
   */
  createStructuredError(e, t) {
    return e.message.includes("Permission denied") || e.message.includes("NotAllowedError") || e.message.includes("permission") ? new ws(
      "マイクへのアクセス許可が拒否されました。ブラウザの設定でマイクアクセスを許可してください。",
      {
        operation: t,
        originalError: e.message,
        deviceSpecs: this.deviceSpecs,
        componentState: this.currentState
      }
    ) : e.message.includes("AudioContext") || e.message.includes("audio") || e.message.includes("initialization") ? new ot(
      "オーディオシステムの初期化に失敗しました。デバイスの音響設定を確認するか、ブラウザを再起動してください。",
      {
        operation: t,
        originalError: e.message,
        componentState: this.currentState,
        deviceSpecs: this.deviceSpecs
      }
    ) : new Se(
      `${t}中に予期しないエラーが発生しました: ${e.message}`,
      mt.PITCH_DETECTION_ERROR,
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
rt.NOTE_RESET_DELAY_MS = 300, rt.SELECTOR_UPDATE_DELAY_MS = 50, rt.UI_RESTART_DELAY_MS = 200;
let hi = rt;
class hd {
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
    const n = Date.now();
    this.cleanHistory(n), this.addToHistory(e, t, n);
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
    const t = this.historyBuffer.slice(-10).map((r) => r.frequency), n = this.findFundamentalCandidates(e);
    let s = {
      frequency: e,
      confidence: 0.1,
      harmonicNumber: 1
    };
    for (const r of n) {
      const o = this.calculateHarmonicConfidence(
        r.fundamental,
        r.harmonicNumber,
        t
      );
      o > s.confidence && (s = {
        frequency: r.fundamental,
        confidence: o,
        harmonicNumber: r.harmonicNumber
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
    for (let n = 2; n <= this.config.maxHarmonicNumber; n++) {
      const s = e / n;
      if (s < 60) continue;
      const r = s * n, o = Math.abs(1200 * Math.log2(e / r));
      if (o <= this.config.harmonicToleranceCents) {
        const a = 1 - o / this.config.harmonicToleranceCents;
        t.push({
          fundamental: s,
          harmonicNumber: n,
          likelihood: a
        });
      }
    }
    return t.push({
      fundamental: e,
      harmonicNumber: 1,
      likelihood: 0.5
    }), t.sort((n, s) => s.likelihood - n.likelihood);
  }
  /**
   * Calculate confidence that a frequency pattern represents a harmonic series
   */
  calculateHarmonicConfidence(e, t, n) {
    if (n.length < 3) return 0.1;
    let s = 0, r = 0;
    for (const c of n) {
      let l = Math.round(c / e);
      l < 1 && (l = 1);
      const h = e * l, u = Math.abs(1200 * Math.log2(c / h));
      if (u <= this.config.harmonicToleranceCents * 2) {
        const d = 1 - u / (this.config.harmonicToleranceCents * 2);
        s += d, r++;
      }
    }
    if (r === 0) return 0.1;
    const o = s / r, a = Math.min(r / n.length, 1);
    return Math.min(o * this.config.stabilityWeight + a * (1 - this.config.stabilityWeight), 1);
  }
  /**
   * Add frequency detection to history
   */
  addToHistory(e, t, n) {
    const s = Math.min(t, 1);
    let r = 0.5;
    if (this.historyBuffer.length > 0) {
      const a = this.historyBuffer[this.historyBuffer.length - 1].frequency, c = Math.max(e, a) / Math.min(e, a);
      r = Math.max(0, 1 - (c - 1) * 5);
    }
    const o = s * this.config.volumeWeight + r * (1 - this.config.volumeWeight);
    this.historyBuffer.push({
      frequency: e,
      confidence: o,
      timestamp: n,
      volume: t
    }), this.historyBuffer.length > 50 && this.historyBuffer.shift();
  }
  /**
   * Clean old entries from history
   */
  cleanHistory(e) {
    const t = e - this.config.historyWindowMs;
    this.historyBuffer = this.historyBuffer.filter((n) => n.timestamp > t);
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
    const e = this.historyBuffer.map((h) => h.frequency), t = this.historyBuffer.map((h) => h.confidence), n = t.reduce((h, u) => h + u, 0) / t.length, s = Math.min(...e), r = Math.max(...e), o = e.reduce((h, u) => h + u, 0) / e.length, a = e.reduce((h, u) => h + Math.pow(u - o, 2), 0) / e.length, c = Math.sqrt(a) / o, l = Math.max(0, 1 - c);
    return {
      historyLength: this.historyBuffer.length,
      averageConfidence: n,
      frequencyRange: { min: s, max: r },
      stabilityScore: l
    };
  }
  /**
   * Configure correction parameters
   */
  updateConfig(e) {
    this.config = { ...this.config, ...e };
  }
}
const dt = {
  EXCELLENT: "excellent",
  GOOD: "good",
  FAIR: "fair",
  POOR: "poor"
};
class ud {
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
  analyzeVoice(e, t, n, s) {
    const r = Date.now();
    this.addToBuffer(e, t, n, r), this.cleanBuffer(r);
    const o = this.calculateStability(), a = this.detectVibrato(), c = s ? this.analyzeBreathiness(s) : null, l = this.analyzeConsistency(), h = this.calculateOverallQuality(o, a, c, l), u = this.generateRecommendations(
      h,
      o,
      a,
      c,
      l
    );
    return {
      quality: h,
      stability: o,
      recommendations: u
    };
  }
  /**
   * Calculate pitch stability
   */
  calculateStability() {
    if (this.analysisBuffer.length < 10)
      return 0.5;
    const t = this.analysisBuffer.map((c) => c.frequency).filter((c) => c > 0);
    if (t.length < 5)
      return 0.3;
    const n = t.reduce((c, l) => c + l, 0) / t.length, s = t.reduce((c, l) => c + Math.pow(l - n, 2), 0) / t.length, a = Math.sqrt(s) / n * 1200;
    return Math.max(0, Math.min(1, 1 - a / 100));
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
    const t = this.smoothFrequencies(e, 3), n = this.findExtrema(t);
    if (n.length < 4)
      return { detected: !1, rate: null, depth: null, regularity: null };
    const s = (this.analysisBuffer[this.analysisBuffer.length - 1].timestamp - this.analysisBuffer[0].timestamp) / 1e3, o = n.length / 2 / s, a = [];
    for (let d = 0; d < n.length - 1; d++) {
      const f = t[n[d].index], p = t[n[d + 1].index];
      if (f > 0 && p > 0) {
        const m = Math.abs(1200 * Math.log2(f / p));
        a.push(m);
      }
    }
    const c = a.length > 0 ? a.reduce((d, f) => d + f, 0) / a.length : 0, l = [];
    for (let d = 0; d < n.length - 2; d += 2) {
      const f = n[d + 2].index - n[d].index;
      l.push(f);
    }
    let h = 0;
    if (l.length > 2) {
      const d = l.reduce((p, m) => p + m, 0) / l.length, f = l.reduce((p, m) => p + Math.pow(m - d, 2), 0) / l.length;
      h = Math.max(0, 1 - Math.sqrt(f) / d);
    }
    return {
      detected: o >= this.config.vibratoMinRate && o <= this.config.vibratoMaxRate && c >= this.config.vibratoMinDepthCents,
      rate: o,
      depth: c,
      regularity: h
    };
  }
  /**
   * Analyze breathiness from spectral data
   */
  analyzeBreathiness(e) {
    const t = Math.floor(e.length * 0.1), n = e.slice(Math.floor(e.length * 0.7)), s = e.slice(0, t * 2).reduce((a, c) => a + c * c, 0), r = n.reduce((a, c) => a + c * c, 0);
    if (s === 0) return 1;
    const o = r / s;
    return Math.min(1, o);
  }
  /**
   * Analyze consistency over time
   */
  analyzeConsistency() {
    if (this.analysisBuffer.length < 10) return 0.5;
    const e = this.analysisBuffer.map((r) => r.volume), t = this.analysisBuffer.map((r) => r.clarity), n = this.calculateConsistencyScore(e), s = this.calculateConsistencyScore(t);
    return (n + s) / 2;
  }
  /**
   * Calculate consistency score for an array of values
   */
  calculateConsistencyScore(e) {
    if (e.length < 3) return 0.5;
    const t = e.reduce((r, o) => r + o, 0) / e.length, n = e.reduce((r, o) => r + Math.pow(o - t, 2), 0) / e.length, s = Math.sqrt(n) / (t || 1);
    return Math.max(0, Math.min(1, 1 - s));
  }
  /**
   * Calculate overall voice quality
   */
  calculateOverallQuality(e, t, n, s) {
    const r = {
      stability: 0.4,
      consistency: 0.3,
      breathiness: 0.2,
      vibrato: 0.1
    };
    let o = e * r.stability + s * r.consistency;
    return n !== null ? o += (1 - Math.min(n, 1)) * r.breathiness : o += 0.7 * r.breathiness, t.detected && t.regularity > 0.7 ? o += 0.9 * r.vibrato : t.detected ? o += 0.6 * r.vibrato : o += 0.5 * r.vibrato, o >= 0.85 ? dt.EXCELLENT : o >= 0.7 ? dt.GOOD : o >= 0.5 ? dt.FAIR : dt.POOR;
  }
  /**
   * Generate recommendations based on analysis
   */
  generateRecommendations(e, t, n, s, r) {
    const o = [];
    return t < 0.5 ? (o.push("音程の安定性を向上させるため、ゆっくりとした発声練習を行ってください"), o.push("腹式呼吸を意識して、息の流れを一定に保つ練習をしてください")) : t < 0.7 && o.push("音程の微調整練習で、より正確なピッチコントロールを目指しましょう"), r < 0.5 && (o.push("音量と音質の一貫性を保つため、定期的な発声練習を継続してください"), o.push("録音を聞き返して、自分の声の特徴を把握しましょう")), s !== null && s > 0.6 && (o.push("声の息漏れが気になります。発声時の喉の締まりを意識してください"), o.push("ハミング練習で、クリアな声質を目指しましょう")), n.detected ? n.regularity < 0.5 ? o.push("ビブラートの規則性を改善するため、メトロノームに合わせた練習をしてください") : n.rate > 7.5 && o.push("ビブラートの速度が速すぎます。よりゆったりとしたビブラートを練習してください") : (e === dt.GOOD || e === dt.EXCELLENT) && o.push("美しいビブラートの習得に挑戦してみましょう"), e === dt.POOR ? (o.push("基礎的な発声練習から始めることをお勧めします"), o.push("専門的な指導を受けることを検討してください")) : e === dt.EXCELLENT && o.push("素晴らしい声質です。この状態を維持する練習を続けてください"), o;
  }
  /**
   * Smooth frequency data using moving average
   */
  smoothFrequencies(e, t) {
    const n = [];
    for (let s = 0; s < e.length; s++) {
      let r = 0, o = 0;
      const a = Math.max(0, s - Math.floor(t / 2)), c = Math.min(e.length, s + Math.floor(t / 2) + 1);
      for (let l = a; l < c; l++)
        r += e[l], o++;
      n.push(r / o);
    }
    return n;
  }
  /**
   * Find local extrema (peaks and valleys) in frequency data
   */
  findExtrema(e) {
    const t = [];
    for (let n = 1; n < e.length - 1; n++) {
      const s = e[n - 1], r = e[n], o = e[n + 1];
      r > s && r > o ? t.push({ index: n, value: r, type: "peak" }) : r < s && r < o && t.push({ index: n, value: r, type: "valley" });
    }
    return t;
  }
  /**
   * Add data to analysis buffer
   */
  addToBuffer(e, t, n, s) {
    this.analysisBuffer.push({ frequency: e, volume: t, clarity: n, timestamp: s }), this.analysisBuffer.length > 200 && this.analysisBuffer.shift();
  }
  /**
   * Clean old data from buffer
   */
  cleanBuffer(e) {
    const t = e - this.config.analysisWindowMs;
    this.analysisBuffer = this.analysisBuffer.filter((n) => n.timestamp > t);
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
    const e = this.analysisBuffer.map((s) => s.volume), t = this.analysisBuffer.map((s) => s.clarity), n = this.analysisBuffer[this.analysisBuffer.length - 1].timestamp - this.analysisBuffer[0].timestamp;
    return {
      entryCount: this.analysisBuffer.length,
      timeSpanMs: n,
      averageVolume: e.reduce((s, r) => s + r, 0) / e.length,
      averageClarity: t.reduce((s, r) => s + r, 0) / t.length
    };
  }
}
class dd {
  constructor() {
    this.calibrationData = null, this.isCalibrated = !1, this.calibrationInProgress = !1, this.deviceSpecs = At.getDeviceSpecs();
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
      const n = await this.measureBackgroundNoise(e, t), s = await this.calibrateVolumeLevels(e, t), r = await this.measureFrequencyResponse(e, t), o = this.calculateOptimalSettings(
        n,
        s,
        r
      );
      return this.calibrationData = {
        volumeOffset: s.offset,
        frequencyResponse: r,
        noiseProfile: n,
        optimalSettings: o
      }, this.isCalibrated = !0, this.calibrationInProgress = !1, console.log("✅ [CalibrationSystem] Calibration completed successfully"), {
        success: !0,
        calibrationData: this.calibrationData,
        recommendedSettings: o
      };
    } catch (n) {
      return console.error("❌ [CalibrationSystem] Calibration failed:", n), this.calibrationInProgress = !1, {
        success: !1,
        calibrationData: null,
        recommendedSettings: this.getDefaultSettings(),
        error: n
      };
    }
  }
  /**
   * Measure background noise levels
   */
  async measureBackgroundNoise(e, t, n = 2e3) {
    return new Promise((s) => {
      const r = e.createAnalyser();
      r.fftSize = 2048;
      const o = e.createMediaStreamSource(t);
      o.connect(r);
      const a = r.frequencyBinCount, c = new Float32Array(a), l = [], h = Date.now(), u = () => {
        if (Date.now() - h >= n) {
          const d = {};
          for (let f = 0; f < a; f++) {
            const p = f * e.sampleRate / r.fftSize;
            let m = 0;
            for (const g of l)
              m += g[f];
            d[Math.round(p)] = m / l.length;
          }
          o.disconnect(), s(d);
          return;
        }
        r.getFloatFrequencyData(c), l.push(new Float32Array(c)), setTimeout(u, 100);
      };
      u();
    });
  }
  /**
   * Calibrate volume levels
   */
  async calibrateVolumeLevels(e, t, n = 3e3) {
    return new Promise((s) => {
      const r = e.createAnalyser();
      r.fftSize = 1024;
      const o = e.createMediaStreamSource(t);
      o.connect(r);
      const a = r.fftSize, c = new Float32Array(a), l = [], h = Date.now(), u = () => {
        if (Date.now() - h >= n) {
          l.sort((b, C) => b - C);
          const p = l[0] || 0, m = l[l.length - 1] || 1, T = 0.3 - (l[Math.floor(l.length / 2)] || 0.5);
          o.disconnect(), s({
            offset: T,
            range: { min: p, max: m }
          });
          return;
        }
        r.getFloatTimeDomainData(c);
        let d = 0;
        for (let p = 0; p < a; p++)
          d += c[p] * c[p];
        const f = Math.sqrt(d / a);
        l.push(f), setTimeout(u, 50);
      };
      u();
    });
  }
  /**
   * Measure frequency response (simplified version)
   */
  async measureFrequencyResponse(e, t, n = 5e3) {
    return new Promise((s) => {
      const r = e.createAnalyser();
      r.fftSize = 4096;
      const o = e.createMediaStreamSource(t);
      o.connect(r);
      const a = r.frequencyBinCount, c = new Float32Array(a), l = {}, h = Date.now(), u = () => {
        if (Date.now() - h >= n) {
          const d = {};
          Object.keys(l).forEach((f) => {
            const p = parseInt(f), m = l[p], g = m.reduce((_, T) => _ + T, 0) / m.length;
            d[p] = g;
          }), o.disconnect(), s(d);
          return;
        }
        r.getFloatFrequencyData(c);
        for (let d = 0; d < a; d++) {
          const f = Math.round(d * e.sampleRate / r.fftSize);
          f >= 80 && f <= 1e3 && (l[f] || (l[f] = []), l[f].push(c[d]));
        }
        setTimeout(u, 100);
      };
      u();
    });
  }
  /**
   * Calculate optimal settings based on calibration data
   */
  calculateOptimalSettings(e, t, n) {
    const s = this.getDefaultSettings(), r = Math.max(0.5, Math.min(2, 1 - t.offset)), o = s.sensitivity * r, c = Object.keys(e).map((C) => parseInt(C)).filter((C) => C >= 100 && C <= 800).map((C) => e[C]), l = c.length > 0 ? c.reduce((C, v) => C + v, 0) / c.length : -60, h = Math.max(-20, l + 10), u = Math.max(s.noiseGate, Math.abs(h) / 1e3), f = Object.keys(n).map((C) => parseInt(C)).sort((C, v) => C - v).map((C) => n[C]), p = f.slice(0, Math.floor(f.length * 0.3)), m = f.slice(
      Math.floor(f.length * 0.3),
      Math.floor(f.length * 0.7)
    ), g = f.slice(Math.floor(f.length * 0.7)), _ = p.reduce((C, v) => C + v, 0) / p.length, T = m.reduce((C, v) => C + v, 0) / m.length, b = g.reduce((C, v) => C + v, 0) / g.length;
    return {
      sensitivity: Math.round(o * 10) / 10,
      noiseGate: Math.round(u * 1e3) / 1e3,
      volumeOffset: t.offset,
      filterSettings: {
        highpassFreq: _ < T - 5 ? 100 : 80,
        // Stronger highpass if low freq is weak
        lowpassFreq: b > T + 3 ? 600 : 800,
        // Lower cutoff if high freq is strong
        notchFreq: 60,
        // Standard power line frequency
        highpassQ: 0.7,
        lowpassQ: 0.7,
        notchQ: 10
      },
      deviceAdjustments: {
        lowFreqCompensation: Math.max(0.8, Math.min(1.5, T / (_ || -60))),
        highFreqCompensation: Math.max(0.8, Math.min(1.2, T / (b || -60)))
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
      const n = JSON.parse(t), s = 7 * 24 * 60 * 60 * 1e3;
      return Date.now() - n.timestamp > s ? (console.log("⏰ [CalibrationSystem] Saved calibration is too old, ignoring"), !1) : n.deviceSpecs.deviceType !== this.deviceSpecs.deviceType ? (console.log("📱 [CalibrationSystem] Device type mismatch, ignoring saved calibration"), !1) : (this.calibrationData = n.calibrationData, this.isCalibrated = !0, console.log("📂 [CalibrationSystem] Calibration loaded successfully"), !0);
    } catch (e) {
      return console.error("❌ [CalibrationSystem] Failed to load calibration:", e), !1;
    }
  }
}
const Ri = "15.1.22", ui = (i, e, t) => ({ endTime: e, insertTime: t, type: "exponentialRampToValue", value: i }), di = (i, e, t) => ({ endTime: e, insertTime: t, type: "linearRampToValue", value: i }), ds = (i, e) => ({ startTime: e, type: "setValue", value: i }), Pi = (i, e, t) => ({ duration: t, startTime: e, type: "setValueCurve", values: i }), qi = (i, e, { startTime: t, target: n, timeConstant: s }) => n + (e - n) * Math.exp((t - i) / s), Ot = (i) => i.type === "exponentialRampToValue", Nn = (i) => i.type === "linearRampToValue", pt = (i) => Ot(i) || Nn(i), bs = (i) => i.type === "setValue", it = (i) => i.type === "setValueCurve", In = (i, e, t, n) => {
  const s = i[e];
  return s === void 0 ? n : pt(s) || bs(s) ? s.value : it(s) ? s.values[s.values.length - 1] : qi(t, In(i, e - 1, s.startTime, n), s);
}, fi = (i, e, t, n, s) => t === void 0 ? [n.insertTime, s] : pt(t) ? [t.endTime, t.value] : bs(t) ? [t.startTime, t.value] : it(t) ? [
  t.startTime + t.duration,
  t.values[t.values.length - 1]
] : [
  t.startTime,
  In(i, e - 1, t.startTime, s)
], fs = (i) => i.type === "cancelAndHold", ps = (i) => i.type === "cancelScheduledValues", ft = (i) => fs(i) || ps(i) ? i.cancelTime : Ot(i) || Nn(i) ? i.endTime : i.startTime, pi = (i, e, t, { endTime: n, value: s }) => t === s ? s : 0 < t && 0 < s || t < 0 && s < 0 ? t * (s / t) ** ((i - e) / (n - e)) : 0, mi = (i, e, t, { endTime: n, value: s }) => t + (i - e) / (n - e) * (s - t), lo = (i, e) => {
  const t = Math.floor(e), n = Math.ceil(e);
  return t === n ? i[t] : (1 - (e - t)) * i[t] + (1 - (n - e)) * i[n];
}, ho = (i, { duration: e, startTime: t, values: n }) => {
  const s = (i - t) / e * (n.length - 1);
  return lo(n, s);
}, Tn = (i) => i.type === "setTarget";
class uo {
  constructor(e) {
    this._automationEvents = [], this._currenTime = 0, this._defaultValue = e;
  }
  [Symbol.iterator]() {
    return this._automationEvents[Symbol.iterator]();
  }
  add(e) {
    const t = ft(e);
    if (fs(e) || ps(e)) {
      const n = this._automationEvents.findIndex((r) => ps(e) && it(r) ? r.startTime + r.duration >= t : ft(r) >= t), s = this._automationEvents[n];
      if (n !== -1 && (this._automationEvents = this._automationEvents.slice(0, n)), fs(e)) {
        const r = this._automationEvents[this._automationEvents.length - 1];
        if (s !== void 0 && pt(s)) {
          if (r !== void 0 && Tn(r))
            throw new Error("The internal list is malformed.");
          const o = r === void 0 ? s.insertTime : it(r) ? r.startTime + r.duration : ft(r), a = r === void 0 ? this._defaultValue : it(r) ? r.values[r.values.length - 1] : r.value, c = Ot(s) ? pi(t, o, a, s) : mi(t, o, a, s), l = Ot(s) ? ui(c, t, this._currenTime) : di(c, t, this._currenTime);
          this._automationEvents.push(l);
        }
        if (r !== void 0 && Tn(r) && this._automationEvents.push(ds(this.getValue(t), t)), r !== void 0 && it(r) && r.startTime + r.duration > t) {
          const o = t - r.startTime, a = (r.values.length - 1) / r.duration, c = Math.max(2, 1 + Math.ceil(o * a)), l = o / (c - 1) * a, h = r.values.slice(0, c);
          if (l < 1)
            for (let u = 1; u < c; u += 1) {
              const d = l * u % 1;
              h[u] = r.values[u - 1] * (1 - d) + r.values[u] * d;
            }
          this._automationEvents[this._automationEvents.length - 1] = Pi(h, r.startTime, o);
        }
      }
    } else {
      const n = this._automationEvents.findIndex((o) => ft(o) > t), s = n === -1 ? this._automationEvents[this._automationEvents.length - 1] : this._automationEvents[n - 1];
      if (s !== void 0 && it(s) && ft(s) + s.duration > t)
        return !1;
      const r = Ot(e) ? ui(e.value, e.endTime, this._currenTime) : Nn(e) ? di(e.value, t, this._currenTime) : e;
      if (n === -1)
        this._automationEvents.push(r);
      else {
        if (it(e) && t + e.duration > ft(this._automationEvents[n]))
          return !1;
        this._automationEvents.splice(n, 0, r);
      }
    }
    return !0;
  }
  flush(e) {
    const t = this._automationEvents.findIndex((n) => ft(n) > e);
    if (t > 1) {
      const n = this._automationEvents.slice(t - 1), s = n[0];
      Tn(s) && n.unshift(ds(In(this._automationEvents, t - 2, s.startTime, this._defaultValue), s.startTime)), this._automationEvents = n;
    }
  }
  getValue(e) {
    if (this._automationEvents.length === 0)
      return this._defaultValue;
    const t = this._automationEvents.findIndex((o) => ft(o) > e), n = this._automationEvents[t], s = (t === -1 ? this._automationEvents.length : t) - 1, r = this._automationEvents[s];
    if (r !== void 0 && Tn(r) && (n === void 0 || !pt(n) || n.insertTime > e))
      return qi(e, In(this._automationEvents, s - 1, r.startTime, this._defaultValue), r);
    if (r !== void 0 && bs(r) && (n === void 0 || !pt(n)))
      return r.value;
    if (r !== void 0 && it(r) && (n === void 0 || !pt(n) || r.startTime + r.duration > e))
      return e < r.startTime + r.duration ? ho(e, r) : r.values[r.values.length - 1];
    if (r !== void 0 && pt(r) && (n === void 0 || !pt(n)))
      return r.value;
    if (n !== void 0 && Ot(n)) {
      const [o, a] = fi(this._automationEvents, s, r, n, this._defaultValue);
      return pi(e, o, a, n);
    }
    if (n !== void 0 && Nn(n)) {
      const [o, a] = fi(this._automationEvents, s, r, n, this._defaultValue);
      return mi(e, o, a, n);
    }
    return this._defaultValue;
  }
}
const fo = (i) => ({ cancelTime: i, type: "cancelAndHold" }), po = (i) => ({ cancelTime: i, type: "cancelScheduledValues" }), mo = (i, e) => ({ endTime: e, type: "exponentialRampToValue", value: i }), go = (i, e) => ({ endTime: e, type: "linearRampToValue", value: i }), _o = (i, e, t) => ({ startTime: e, target: i, timeConstant: t, type: "setTarget" }), vo = () => new DOMException("", "AbortError"), yo = (i) => (e, t, [n, s, r], o) => {
  i(e[s], [t, n, r], (a) => a[0] === t && a[1] === n, o);
}, So = (i) => (e, t, n) => {
  const s = [];
  for (let r = 0; r < n.numberOfInputs; r += 1)
    s.push(/* @__PURE__ */ new Set());
  i.set(e, {
    activeInputs: s,
    outputs: /* @__PURE__ */ new Set(),
    passiveInputs: /* @__PURE__ */ new WeakMap(),
    renderer: t
  });
}, Co = (i) => (e, t) => {
  i.set(e, { activeInputs: /* @__PURE__ */ new Set(), passiveInputs: /* @__PURE__ */ new WeakMap(), renderer: t });
}, Lt = /* @__PURE__ */ new WeakSet(), Vi = /* @__PURE__ */ new WeakMap(), As = /* @__PURE__ */ new WeakMap(), Li = /* @__PURE__ */ new WeakMap(), Ms = /* @__PURE__ */ new WeakMap(), Wn = /* @__PURE__ */ new WeakMap(), Bi = /* @__PURE__ */ new WeakMap(), ms = /* @__PURE__ */ new WeakMap(), gs = /* @__PURE__ */ new WeakMap(), _s = /* @__PURE__ */ new WeakMap(), Ui = {
  construct() {
    return Ui;
  }
}, To = (i) => {
  try {
    const e = new Proxy(i, Ui);
    new e();
  } catch {
    return !1;
  }
  return !0;
}, gi = /^import(?:(?:[\s]+[\w]+|(?:[\s]+[\w]+[\s]*,)?[\s]*\{[\s]*[\w]+(?:[\s]+as[\s]+[\w]+)?(?:[\s]*,[\s]*[\w]+(?:[\s]+as[\s]+[\w]+)?)*[\s]*}|(?:[\s]+[\w]+[\s]*,)?[\s]*\*[\s]+as[\s]+[\w]+)[\s]+from)?(?:[\s]*)("([^"\\]|\\.)+"|'([^'\\]|\\.)+')(?:[\s]*);?/, _i = (i, e) => {
  const t = [];
  let n = i.replace(/^[\s]+/, ""), s = n.match(gi);
  for (; s !== null; ) {
    const r = s[1].slice(1, -1), o = s[0].replace(/([\s]+)?;?$/, "").replace(r, new URL(r, e).toString());
    t.push(o), n = n.slice(s[0].length).replace(/^[\s]+/, ""), s = n.match(gi);
  }
  return [t.join(";"), n];
}, vi = (i) => {
  if (i !== void 0 && !Array.isArray(i))
    throw new TypeError("The parameterDescriptors property of given value for processorCtor is not an array.");
}, yi = (i) => {
  if (!To(i))
    throw new TypeError("The given value for processorCtor should be a constructor.");
  if (i.prototype === null || typeof i.prototype != "object")
    throw new TypeError("The given value for processorCtor should have a prototype.");
}, wo = (i, e, t, n, s, r, o, a, c, l, h, u, d) => {
  let f = 0;
  return (p, m, g = { credentials: "omit" }) => {
    const _ = h.get(p);
    if (_ !== void 0 && _.has(m))
      return Promise.resolve();
    const T = l.get(p);
    if (T !== void 0) {
      const v = T.get(m);
      if (v !== void 0)
        return v;
    }
    const b = r(p), C = b.audioWorklet === void 0 ? s(m).then(([v, S]) => {
      const [w, y] = _i(v, S), x = `${w};((a,b)=>{(a[b]=a[b]||[]).push((AudioWorkletProcessor,global,registerProcessor,sampleRate,self,window)=>{${y}
})})(window,'_AWGS')`;
      return t(x);
    }).then(() => {
      const v = d._AWGS.pop();
      if (v === void 0)
        throw new SyntaxError();
      n(b.currentTime, b.sampleRate, () => v(class {
      }, void 0, (S, w) => {
        if (S.trim() === "")
          throw e();
        const y = gs.get(b);
        if (y !== void 0) {
          if (y.has(S))
            throw e();
          yi(w), vi(w.parameterDescriptors), y.set(S, w);
        } else
          yi(w), vi(w.parameterDescriptors), gs.set(b, /* @__PURE__ */ new Map([[S, w]]));
      }, b.sampleRate, void 0, void 0));
    }) : Promise.all([
      s(m),
      Promise.resolve(i(u, u))
    ]).then(([[v, S], w]) => {
      const y = f + 1;
      f = y;
      const [x, E] = _i(v, S), N = `${x};((AudioWorkletProcessor,registerProcessor)=>{${E}
})(${w ? "AudioWorkletProcessor" : "class extends AudioWorkletProcessor {__b=new WeakSet();constructor(){super();(p=>p.postMessage=(q=>(m,t)=>q.call(p,m,t?t.filter(u=>!this.__b.has(u)):t))(p.postMessage))(this.port)}}"},(n,p)=>registerProcessor(n,class extends p{${w ? "" : "__c = (a) => a.forEach(e=>this.__b.add(e.buffer));"}process(i,o,p){${w ? "" : "i.forEach(this.__c);o.forEach(this.__c);this.__c(Object.values(p));"}return super.process(i.map(j=>j.some(k=>k.length===0)?[]:j),o,p)}}));registerProcessor('__sac${y}',class extends AudioWorkletProcessor{process(){return !1}})`, R = new Blob([N], { type: "application/javascript; charset=utf-8" }), D = URL.createObjectURL(R);
      return b.audioWorklet.addModule(D, g).then(() => {
        if (a(b))
          return b;
        const F = o(b);
        return F.audioWorklet.addModule(D, g).then(() => F);
      }).then((F) => {
        if (c === null)
          throw new SyntaxError();
        try {
          new c(F, `__sac${y}`);
        } catch {
          throw new SyntaxError();
        }
      }).finally(() => URL.revokeObjectURL(D));
    });
    return T === void 0 ? l.set(p, /* @__PURE__ */ new Map([[m, C]])) : T.set(m, C), C.then(() => {
      const v = h.get(p);
      v === void 0 ? h.set(p, /* @__PURE__ */ new Set([m])) : v.add(m);
    }).finally(() => {
      const v = l.get(p);
      v !== void 0 && v.delete(m);
    }), C;
  };
}, Qe = (i, e) => {
  const t = i.get(e);
  if (t === void 0)
    throw new Error("A value with the given key could not be found.");
  return t;
}, $n = (i, e) => {
  const t = Array.from(i).filter(e);
  if (t.length > 1)
    throw Error("More than one element was found.");
  if (t.length === 0)
    throw Error("No element was found.");
  const [n] = t;
  return i.delete(n), n;
}, zi = (i, e, t, n) => {
  const s = Qe(i, e), r = $n(s, (o) => o[0] === t && o[1] === n);
  return s.size === 0 && i.delete(e), r;
}, ln = (i) => Qe(Bi, i), Bt = (i) => {
  if (Lt.has(i))
    throw new Error("The AudioNode is already stored.");
  Lt.add(i), ln(i).forEach((e) => e(!0));
}, Wi = (i) => "port" in i, hn = (i) => {
  if (!Lt.has(i))
    throw new Error("The AudioNode is not stored.");
  Lt.delete(i), ln(i).forEach((e) => e(!1));
}, vs = (i, e) => {
  !Wi(i) && e.every((t) => t.size === 0) && hn(i);
}, bo = (i, e, t, n, s, r, o, a, c, l, h, u, d) => {
  const f = /* @__PURE__ */ new WeakMap();
  return (p, m, g, _, T) => {
    const { activeInputs: b, passiveInputs: C } = r(m), { outputs: v } = r(p), S = a(p), w = (y) => {
      const x = c(m), E = c(p);
      if (y) {
        const M = zi(C, p, g, _);
        i(b, p, M, !1), !T && !u(p) && t(E, x, g, _), d(m) && Bt(m);
      } else {
        const M = n(b, p, g, _);
        e(C, _, M, !1), !T && !u(p) && s(E, x, g, _);
        const A = o(m);
        if (A === 0)
          h(m) && vs(m, b);
        else {
          const I = f.get(m);
          I !== void 0 && clearTimeout(I), f.set(m, setTimeout(() => {
            h(m) && vs(m, b);
          }, A * 1e3));
        }
      }
    };
    return l(v, [m, g, _], (y) => y[0] === m && y[1] === g && y[2] === _, !0) ? (S.add(w), h(p) ? i(b, p, [g, _, w], !0) : e(C, _, [p, g, w], !0), !0) : !1;
  };
}, Ao = (i) => (e, t, [n, s, r], o) => {
  const a = e.get(n);
  a === void 0 ? e.set(n, /* @__PURE__ */ new Set([[s, t, r]])) : i(a, [s, t, r], (c) => c[0] === s && c[1] === t, o);
}, Mo = (i) => (e, t) => {
  const n = i(e, {
    channelCount: 1,
    channelCountMode: "explicit",
    channelInterpretation: "discrete",
    gain: 0
  });
  t.connect(n).connect(e.destination);
  const s = () => {
    t.removeEventListener("ended", s), t.disconnect(n), n.disconnect();
  };
  t.addEventListener("ended", s);
}, Eo = (i) => (e, t) => {
  i(e).add(t);
}, xo = {
  channelCount: 2,
  channelCountMode: "max",
  channelInterpretation: "speakers",
  fftSize: 2048,
  maxDecibels: -30,
  minDecibels: -100,
  smoothingTimeConstant: 0.8
}, No = (i, e, t, n, s, r) => class extends i {
  constructor(a, c) {
    const l = s(a), h = { ...xo, ...c }, u = n(l, h), d = r(l) ? e() : null;
    super(a, !1, u, d), this._nativeAnalyserNode = u;
  }
  get fftSize() {
    return this._nativeAnalyserNode.fftSize;
  }
  set fftSize(a) {
    this._nativeAnalyserNode.fftSize = a;
  }
  get frequencyBinCount() {
    return this._nativeAnalyserNode.frequencyBinCount;
  }
  get maxDecibels() {
    return this._nativeAnalyserNode.maxDecibels;
  }
  set maxDecibels(a) {
    const c = this._nativeAnalyserNode.maxDecibels;
    if (this._nativeAnalyserNode.maxDecibels = a, !(a > this._nativeAnalyserNode.minDecibels))
      throw this._nativeAnalyserNode.maxDecibels = c, t();
  }
  get minDecibels() {
    return this._nativeAnalyserNode.minDecibels;
  }
  set minDecibels(a) {
    const c = this._nativeAnalyserNode.minDecibels;
    if (this._nativeAnalyserNode.minDecibels = a, !(this._nativeAnalyserNode.maxDecibels > a))
      throw this._nativeAnalyserNode.minDecibels = c, t();
  }
  get smoothingTimeConstant() {
    return this._nativeAnalyserNode.smoothingTimeConstant;
  }
  set smoothingTimeConstant(a) {
    this._nativeAnalyserNode.smoothingTimeConstant = a;
  }
  getByteFrequencyData(a) {
    this._nativeAnalyserNode.getByteFrequencyData(a);
  }
  getByteTimeDomainData(a) {
    this._nativeAnalyserNode.getByteTimeDomainData(a);
  }
  getFloatFrequencyData(a) {
    this._nativeAnalyserNode.getFloatFrequencyData(a);
  }
  getFloatTimeDomainData(a) {
    this._nativeAnalyserNode.getFloatTimeDomainData(a);
  }
}, Te = (i, e) => i.context === e, Io = (i, e, t) => () => {
  const n = /* @__PURE__ */ new WeakMap(), s = async (r, o) => {
    let a = e(r);
    if (!Te(a, o)) {
      const l = {
        channelCount: a.channelCount,
        channelCountMode: a.channelCountMode,
        channelInterpretation: a.channelInterpretation,
        fftSize: a.fftSize,
        maxDecibels: a.maxDecibels,
        minDecibels: a.minDecibels,
        smoothingTimeConstant: a.smoothingTimeConstant
      };
      a = i(o, l);
    }
    return n.set(o, a), await t(r, o, a), a;
  };
  return {
    render(r, o) {
      const a = n.get(o);
      return a !== void 0 ? Promise.resolve(a) : s(r, o);
    }
  };
}, kn = (i) => {
  try {
    i.copyToChannel(new Float32Array(1), 0, -1);
  } catch {
    return !1;
  }
  return !0;
}, tt = () => new DOMException("", "IndexSizeError"), Es = (i) => {
  i.getChannelData = /* @__PURE__ */ ((e) => (t) => {
    try {
      return e.call(i, t);
    } catch (n) {
      throw n.code === 12 ? tt() : n;
    }
  })(i.getChannelData);
}, ko = {
  numberOfChannels: 1
}, Do = (i, e, t, n, s, r, o, a) => {
  let c = null;
  return class $i {
    constructor(h) {
      if (s === null)
        throw new Error("Missing the native OfflineAudioContext constructor.");
      const { length: u, numberOfChannels: d, sampleRate: f } = { ...ko, ...h };
      c === null && (c = new s(1, 1, 44100));
      const p = n !== null && e(r, r) ? new n({ length: u, numberOfChannels: d, sampleRate: f }) : c.createBuffer(d, u, f);
      if (p.numberOfChannels === 0)
        throw t();
      return typeof p.copyFromChannel != "function" ? (o(p), Es(p)) : e(kn, () => kn(p)) || a(p), i.add(p), p;
    }
    static [Symbol.hasInstance](h) {
      return h !== null && typeof h == "object" && Object.getPrototypeOf(h) === $i.prototype || i.has(h);
    }
  };
}, Ie = -34028234663852886e22, be = -Ie, at = (i) => Lt.has(i), Fo = {
  buffer: null,
  channelCount: 2,
  channelCountMode: "max",
  channelInterpretation: "speakers",
  // Bug #149: Safari does not yet support the detune AudioParam.
  loop: !1,
  loopEnd: 0,
  loopStart: 0,
  playbackRate: 1
}, Oo = (i, e, t, n, s, r, o, a) => class extends i {
  constructor(l, h) {
    const u = r(l), d = { ...Fo, ...h }, f = s(u, d), p = o(u), m = p ? e() : null;
    super(l, !1, f, m), this._audioBufferSourceNodeRenderer = m, this._isBufferNullified = !1, this._isBufferSet = d.buffer !== null, this._nativeAudioBufferSourceNode = f, this._onended = null, this._playbackRate = t(this, p, f.playbackRate, be, Ie);
  }
  get buffer() {
    return this._isBufferNullified ? null : this._nativeAudioBufferSourceNode.buffer;
  }
  set buffer(l) {
    if (this._nativeAudioBufferSourceNode.buffer = l, l !== null) {
      if (this._isBufferSet)
        throw n();
      this._isBufferSet = !0;
    }
  }
  get loop() {
    return this._nativeAudioBufferSourceNode.loop;
  }
  set loop(l) {
    this._nativeAudioBufferSourceNode.loop = l;
  }
  get loopEnd() {
    return this._nativeAudioBufferSourceNode.loopEnd;
  }
  set loopEnd(l) {
    this._nativeAudioBufferSourceNode.loopEnd = l;
  }
  get loopStart() {
    return this._nativeAudioBufferSourceNode.loopStart;
  }
  set loopStart(l) {
    this._nativeAudioBufferSourceNode.loopStart = l;
  }
  get onended() {
    return this._onended;
  }
  set onended(l) {
    const h = typeof l == "function" ? a(this, l) : null;
    this._nativeAudioBufferSourceNode.onended = h;
    const u = this._nativeAudioBufferSourceNode.onended;
    this._onended = u !== null && u === h ? l : u;
  }
  get playbackRate() {
    return this._playbackRate;
  }
  start(l = 0, h = 0, u) {
    if (this._nativeAudioBufferSourceNode.start(l, h, u), this._audioBufferSourceNodeRenderer !== null && (this._audioBufferSourceNodeRenderer.start = u === void 0 ? [l, h] : [l, h, u]), this.context.state !== "closed") {
      Bt(this);
      const d = () => {
        this._nativeAudioBufferSourceNode.removeEventListener("ended", d), at(this) && hn(this);
      };
      this._nativeAudioBufferSourceNode.addEventListener("ended", d);
    }
  }
  stop(l = 0) {
    this._nativeAudioBufferSourceNode.stop(l), this._audioBufferSourceNodeRenderer !== null && (this._audioBufferSourceNodeRenderer.stop = l);
  }
}, Ro = (i, e, t, n, s) => () => {
  const r = /* @__PURE__ */ new WeakMap();
  let o = null, a = null;
  const c = async (l, h) => {
    let u = t(l);
    const d = Te(u, h);
    if (!d) {
      const f = {
        buffer: u.buffer,
        channelCount: u.channelCount,
        channelCountMode: u.channelCountMode,
        channelInterpretation: u.channelInterpretation,
        // Bug #149: Safari does not yet support the detune AudioParam.
        loop: u.loop,
        loopEnd: u.loopEnd,
        loopStart: u.loopStart,
        playbackRate: u.playbackRate.value
      };
      u = e(h, f), o !== null && u.start(...o), a !== null && u.stop(a);
    }
    return r.set(h, u), d ? await i(h, l.playbackRate, u.playbackRate) : await n(h, l.playbackRate, u.playbackRate), await s(l, h, u), u;
  };
  return {
    set start(l) {
      o = l;
    },
    set stop(l) {
      a = l;
    },
    render(l, h) {
      const u = r.get(h);
      return u !== void 0 ? Promise.resolve(u) : c(l, h);
    }
  };
}, Po = (i) => "playbackRate" in i, qo = (i) => "frequency" in i && "gain" in i, Vo = (i) => "offset" in i, Lo = (i) => !("frequency" in i) && "gain" in i, Bo = (i) => "detune" in i && "frequency" in i && !("gain" in i), Uo = (i) => "pan" in i, Ae = (i) => Qe(Vi, i), un = (i) => Qe(Li, i), ys = (i, e) => {
  const { activeInputs: t } = Ae(i);
  t.forEach((s) => s.forEach(([r]) => {
    e.includes(i) || ys(r, [...e, i]);
  }));
  const n = Po(i) ? [
    // Bug #149: Safari does not yet support the detune AudioParam.
    i.playbackRate
  ] : Wi(i) ? Array.from(i.parameters.values()) : qo(i) ? [i.Q, i.detune, i.frequency, i.gain] : Vo(i) ? [i.offset] : Lo(i) ? [i.gain] : Bo(i) ? [i.detune, i.frequency] : Uo(i) ? [i.pan] : [];
  for (const s of n) {
    const r = un(s);
    r !== void 0 && r.activeInputs.forEach(([o]) => ys(o, e));
  }
  at(i) && hn(i);
}, ji = (i) => {
  ys(i.destination, []);
}, zo = (i) => i === void 0 || typeof i == "number" || typeof i == "string" && (i === "balanced" || i === "interactive" || i === "playback"), Wo = (i, e, t, n, s, r, o, a, c) => class extends i {
  constructor(h = {}) {
    if (c === null)
      throw new Error("Missing the native AudioContext constructor.");
    let u;
    try {
      u = new c(h);
    } catch (p) {
      throw p.code === 12 && p.message === "sampleRate is not in range" ? t() : p;
    }
    if (u === null)
      throw n();
    if (!zo(h.latencyHint))
      throw new TypeError(`The provided value '${h.latencyHint}' is not a valid enum value of type AudioContextLatencyCategory.`);
    if (h.sampleRate !== void 0 && u.sampleRate !== h.sampleRate)
      throw t();
    super(u, 2);
    const { latencyHint: d } = h, { sampleRate: f } = u;
    if (this._baseLatency = typeof u.baseLatency == "number" ? u.baseLatency : d === "balanced" ? 512 / f : d === "interactive" || d === void 0 ? 256 / f : d === "playback" ? 1024 / f : (
      /*
       * @todo The min (256) and max (16384) values are taken from the allowed bufferSize values of a
       * ScriptProcessorNode.
       */
      Math.max(2, Math.min(128, Math.round(d * f / 128))) * 128 / f
    ), this._nativeAudioContext = u, c.name === "webkitAudioContext" ? (this._nativeGainNode = u.createGain(), this._nativeOscillatorNode = u.createOscillator(), this._nativeGainNode.gain.value = 1e-37, this._nativeOscillatorNode.connect(this._nativeGainNode).connect(u.destination), this._nativeOscillatorNode.start()) : (this._nativeGainNode = null, this._nativeOscillatorNode = null), this._state = null, u.state === "running") {
      this._state = "suspended";
      const p = () => {
        this._state === "suspended" && (this._state = null), u.removeEventListener("statechange", p);
      };
      u.addEventListener("statechange", p);
    }
  }
  get baseLatency() {
    return this._baseLatency;
  }
  get state() {
    return this._state !== null ? this._state : this._nativeAudioContext.state;
  }
  close() {
    return this.state === "closed" ? this._nativeAudioContext.close().then(() => {
      throw e();
    }) : (this._state === "suspended" && (this._state = null), this._nativeAudioContext.close().then(() => {
      this._nativeGainNode !== null && this._nativeOscillatorNode !== null && (this._nativeOscillatorNode.stop(), this._nativeGainNode.disconnect(), this._nativeOscillatorNode.disconnect()), ji(this);
    }));
  }
  createMediaElementSource(h) {
    return new s(this, { mediaElement: h });
  }
  createMediaStreamDestination() {
    return new r(this);
  }
  createMediaStreamSource(h) {
    return new o(this, { mediaStream: h });
  }
  createMediaStreamTrackSource(h) {
    return new a(this, { mediaStreamTrack: h });
  }
  resume() {
    return this._state === "suspended" ? new Promise((h, u) => {
      const d = () => {
        this._nativeAudioContext.removeEventListener("statechange", d), this._nativeAudioContext.state === "running" ? h() : this.resume().then(h, u);
      };
      this._nativeAudioContext.addEventListener("statechange", d);
    }) : this._nativeAudioContext.resume().catch((h) => {
      throw h === void 0 || h.code === 15 ? e() : h;
    });
  }
  suspend() {
    return this._nativeAudioContext.suspend().catch((h) => {
      throw h === void 0 ? e() : h;
    });
  }
}, $o = (i, e, t, n, s, r, o, a) => class extends i {
  constructor(l, h) {
    const u = r(l), d = o(u), f = s(u, h, d), p = d ? e(a) : null;
    super(l, !1, f, p), this._isNodeOfNativeOfflineAudioContext = d, this._nativeAudioDestinationNode = f;
  }
  get channelCount() {
    return this._nativeAudioDestinationNode.channelCount;
  }
  set channelCount(l) {
    if (this._isNodeOfNativeOfflineAudioContext)
      throw n();
    if (l > this._nativeAudioDestinationNode.maxChannelCount)
      throw t();
    this._nativeAudioDestinationNode.channelCount = l;
  }
  get channelCountMode() {
    return this._nativeAudioDestinationNode.channelCountMode;
  }
  set channelCountMode(l) {
    if (this._isNodeOfNativeOfflineAudioContext)
      throw n();
    this._nativeAudioDestinationNode.channelCountMode = l;
  }
  get maxChannelCount() {
    return this._nativeAudioDestinationNode.maxChannelCount;
  }
}, jo = (i) => {
  const e = /* @__PURE__ */ new WeakMap(), t = async (n, s) => {
    const r = s.destination;
    return e.set(s, r), await i(n, s, r), r;
  };
  return {
    render(n, s) {
      const r = e.get(s);
      return r !== void 0 ? Promise.resolve(r) : t(n, s);
    }
  };
}, Go = (i, e, t, n, s, r, o, a) => (c, l) => {
  const h = l.listener, u = () => {
    const v = new Float32Array(1), S = e(l, {
      channelCount: 1,
      channelCountMode: "explicit",
      channelInterpretation: "speakers",
      numberOfInputs: 9
    }), w = o(l);
    let y = !1, x = [0, 0, -1, 0, 1, 0], E = [0, 0, 0];
    const M = () => {
      if (y)
        return;
      y = !0;
      const R = n(l, 256, 9, 0);
      R.onaudioprocess = ({ inputBuffer: D }) => {
        const F = [
          r(D, v, 0),
          r(D, v, 1),
          r(D, v, 2),
          r(D, v, 3),
          r(D, v, 4),
          r(D, v, 5)
        ];
        F.some((P, L) => P !== x[L]) && (h.setOrientation(...F), x = F);
        const B = [
          r(D, v, 6),
          r(D, v, 7),
          r(D, v, 8)
        ];
        B.some((P, L) => P !== E[L]) && (h.setPosition(...B), E = B);
      }, S.connect(R);
    }, A = (R) => (D) => {
      D !== x[R] && (x[R] = D, h.setOrientation(...x));
    }, I = (R) => (D) => {
      D !== E[R] && (E[R] = D, h.setPosition(...E));
    }, N = (R, D, F) => {
      const B = t(l, {
        channelCount: 1,
        channelCountMode: "explicit",
        channelInterpretation: "discrete",
        offset: D
      });
      B.connect(S, 0, R), B.start(), Object.defineProperty(B.offset, "defaultValue", {
        get() {
          return D;
        }
      });
      const P = i({ context: c }, w, B.offset, be, Ie);
      return a(P, "value", (L) => () => L.call(P), (L) => (V) => {
        try {
          L.call(P, V);
        } catch (H) {
          if (H.code !== 9)
            throw H;
        }
        M(), w && F(V);
      }), P.cancelAndHoldAtTime = /* @__PURE__ */ ((L) => w ? () => {
        throw s();
      } : (...V) => {
        const H = L.apply(P, V);
        return M(), H;
      })(P.cancelAndHoldAtTime), P.cancelScheduledValues = /* @__PURE__ */ ((L) => w ? () => {
        throw s();
      } : (...V) => {
        const H = L.apply(P, V);
        return M(), H;
      })(P.cancelScheduledValues), P.exponentialRampToValueAtTime = /* @__PURE__ */ ((L) => w ? () => {
        throw s();
      } : (...V) => {
        const H = L.apply(P, V);
        return M(), H;
      })(P.exponentialRampToValueAtTime), P.linearRampToValueAtTime = /* @__PURE__ */ ((L) => w ? () => {
        throw s();
      } : (...V) => {
        const H = L.apply(P, V);
        return M(), H;
      })(P.linearRampToValueAtTime), P.setTargetAtTime = /* @__PURE__ */ ((L) => w ? () => {
        throw s();
      } : (...V) => {
        const H = L.apply(P, V);
        return M(), H;
      })(P.setTargetAtTime), P.setValueAtTime = /* @__PURE__ */ ((L) => w ? () => {
        throw s();
      } : (...V) => {
        const H = L.apply(P, V);
        return M(), H;
      })(P.setValueAtTime), P.setValueCurveAtTime = /* @__PURE__ */ ((L) => w ? () => {
        throw s();
      } : (...V) => {
        const H = L.apply(P, V);
        return M(), H;
      })(P.setValueCurveAtTime), P;
    };
    return {
      forwardX: N(0, 0, A(0)),
      forwardY: N(1, 0, A(1)),
      forwardZ: N(2, -1, A(2)),
      positionX: N(6, 0, I(0)),
      positionY: N(7, 0, I(1)),
      positionZ: N(8, 0, I(2)),
      upX: N(3, 0, A(3)),
      upY: N(4, 1, A(4)),
      upZ: N(5, 0, A(5))
    };
  }, { forwardX: d, forwardY: f, forwardZ: p, positionX: m, positionY: g, positionZ: _, upX: T, upY: b, upZ: C } = h.forwardX === void 0 ? u() : h;
  return {
    get forwardX() {
      return d;
    },
    get forwardY() {
      return f;
    },
    get forwardZ() {
      return p;
    },
    get positionX() {
      return m;
    },
    get positionY() {
      return g;
    },
    get positionZ() {
      return _;
    },
    get upX() {
      return T;
    },
    get upY() {
      return b;
    },
    get upZ() {
      return C;
    }
  };
}, Dn = (i) => "context" in i, dn = (i) => Dn(i[0]), Nt = (i, e, t, n) => {
  for (const s of i)
    if (t(s)) {
      if (n)
        return !1;
      throw Error("The set contains at least one similar element.");
    }
  return i.add(e), !0;
}, Si = (i, e, [t, n], s) => {
  Nt(i, [e, t, n], (r) => r[0] === e && r[1] === t, s);
}, Ci = (i, [e, t, n], s) => {
  const r = i.get(e);
  r === void 0 ? i.set(e, /* @__PURE__ */ new Set([[t, n]])) : Nt(r, [t, n], (o) => o[0] === t, s);
}, Ht = (i) => "inputs" in i, Fn = (i, e, t, n) => {
  if (Ht(e)) {
    const s = e.inputs[n];
    return i.connect(s, t, 0), [s, t, 0];
  }
  return i.connect(e, t, n), [e, t, n];
}, Gi = (i, e, t) => {
  for (const n of i)
    if (n[0] === e && n[1] === t)
      return i.delete(n), n;
  return null;
}, Ho = (i, e, t) => $n(i, (n) => n[0] === e && n[1] === t), Hi = (i, e) => {
  if (!ln(i).delete(e))
    throw new Error("Missing the expected event listener.");
}, Qi = (i, e, t) => {
  const n = Qe(i, e), s = $n(n, (r) => r[0] === t);
  return n.size === 0 && i.delete(e), s;
}, On = (i, e, t, n) => {
  Ht(e) ? i.disconnect(e.inputs[n], t, 0) : i.disconnect(e, t, n);
}, ne = (i) => Qe(As, i), rn = (i) => Qe(Ms, i), Mt = (i) => ms.has(i), En = (i) => !Lt.has(i), Ti = (i, e) => new Promise((t) => {
  if (e !== null)
    t(!0);
  else {
    const n = i.createScriptProcessor(256, 1, 1), s = i.createGain(), r = i.createBuffer(1, 2, 44100), o = r.getChannelData(0);
    o[0] = 1, o[1] = 1;
    const a = i.createBufferSource();
    a.buffer = r, a.loop = !0, a.connect(n).connect(i.destination), a.connect(s), a.disconnect(s), n.onaudioprocess = (c) => {
      const l = c.inputBuffer.getChannelData(0);
      Array.prototype.some.call(l, (h) => h === 1) ? t(!0) : t(!1), a.stop(), n.onaudioprocess = null, a.disconnect(n), n.disconnect(i.destination);
    }, a.start();
  }
}), hs = (i, e) => {
  const t = /* @__PURE__ */ new Map();
  for (const n of i)
    for (const s of n) {
      const r = t.get(s);
      t.set(s, r === void 0 ? 1 : r + 1);
    }
  t.forEach((n, s) => e(s, n));
}, Rn = (i) => "context" in i, Qo = (i) => {
  const e = /* @__PURE__ */ new Map();
  i.connect = /* @__PURE__ */ ((t) => (n, s = 0, r = 0) => {
    const o = Rn(n) ? t(n, s, r) : t(n, s), a = e.get(n);
    return a === void 0 ? e.set(n, [{ input: r, output: s }]) : a.every((c) => c.input !== r || c.output !== s) && a.push({ input: r, output: s }), o;
  })(i.connect.bind(i)), i.disconnect = /* @__PURE__ */ ((t) => (n, s, r) => {
    if (t.apply(i), n === void 0)
      e.clear();
    else if (typeof n == "number")
      for (const [o, a] of e) {
        const c = a.filter((l) => l.output !== n);
        c.length === 0 ? e.delete(o) : e.set(o, c);
      }
    else if (e.has(n))
      if (s === void 0)
        e.delete(n);
      else {
        const o = e.get(n);
        if (o !== void 0) {
          const a = o.filter((c) => c.output !== s && (c.input !== r || r === void 0));
          a.length === 0 ? e.delete(n) : e.set(n, a);
        }
      }
    for (const [o, a] of e)
      a.forEach((c) => {
        Rn(o) ? i.connect(o, c.output, c.input) : i.connect(o, c.output);
      });
  })(i.disconnect);
}, Xo = (i, e, t, n) => {
  const { activeInputs: s, passiveInputs: r } = un(e), { outputs: o } = Ae(i), a = ln(i), c = (l) => {
    const h = ne(i), u = rn(e);
    if (l) {
      const d = Qi(r, i, t);
      Si(s, i, d, !1), !n && !Mt(i) && h.connect(u, t);
    } else {
      const d = Ho(s, i, t);
      Ci(r, d, !1), !n && !Mt(i) && h.disconnect(u, t);
    }
  };
  return Nt(o, [e, t], (l) => l[0] === e && l[1] === t, !0) ? (a.add(c), at(i) ? Si(s, i, [t, c], !0) : Ci(r, [i, t, c], !0), !0) : !1;
}, Yo = (i, e, t, n) => {
  const { activeInputs: s, passiveInputs: r } = Ae(e), o = Gi(s[n], i, t);
  return o === null ? [zi(r, i, t, n)[2], !1] : [o[2], !0];
}, Zo = (i, e, t) => {
  const { activeInputs: n, passiveInputs: s } = un(e), r = Gi(n, i, t);
  return r === null ? [Qi(s, i, t)[1], !1] : [r[2], !0];
}, xs = (i, e, t, n, s) => {
  const [r, o] = Yo(i, t, n, s);
  if (r !== null && (Hi(i, r), o && !e && !Mt(i) && On(ne(i), ne(t), n, s)), at(t)) {
    const { activeInputs: a } = Ae(t);
    vs(t, a);
  }
}, Ns = (i, e, t, n) => {
  const [s, r] = Zo(i, t, n);
  s !== null && (Hi(i, s), r && !e && !Mt(i) && ne(i).disconnect(rn(t), n));
}, Jo = (i, e) => {
  const t = Ae(i), n = [];
  for (const s of t.outputs)
    dn(s) ? xs(i, e, ...s) : Ns(i, e, ...s), n.push(s[0]);
  return t.outputs.clear(), n;
}, Ko = (i, e, t) => {
  const n = Ae(i), s = [];
  for (const r of n.outputs)
    r[1] === t && (dn(r) ? xs(i, e, ...r) : Ns(i, e, ...r), s.push(r[0]), n.outputs.delete(r));
  return s;
}, ea = (i, e, t, n, s) => {
  const r = Ae(i);
  return Array.from(r.outputs).filter((o) => o[0] === t && (n === void 0 || o[1] === n) && (s === void 0 || o[2] === s)).map((o) => (dn(o) ? xs(i, e, ...o) : Ns(i, e, ...o), r.outputs.delete(o), o[0]));
}, ta = (i, e, t, n, s, r, o, a, c, l, h, u, d, f, p, m) => class extends l {
  constructor(_, T, b, C) {
    super(b), this._context = _, this._nativeAudioNode = b;
    const v = h(_);
    u(v) && t(Ti, () => Ti(v, m)) !== !0 && Qo(b), As.set(this, b), Bi.set(this, /* @__PURE__ */ new Set()), _.state !== "closed" && T && Bt(this), i(this, C, b);
  }
  get channelCount() {
    return this._nativeAudioNode.channelCount;
  }
  set channelCount(_) {
    this._nativeAudioNode.channelCount = _;
  }
  get channelCountMode() {
    return this._nativeAudioNode.channelCountMode;
  }
  set channelCountMode(_) {
    this._nativeAudioNode.channelCountMode = _;
  }
  get channelInterpretation() {
    return this._nativeAudioNode.channelInterpretation;
  }
  set channelInterpretation(_) {
    this._nativeAudioNode.channelInterpretation = _;
  }
  get context() {
    return this._context;
  }
  get numberOfInputs() {
    return this._nativeAudioNode.numberOfInputs;
  }
  get numberOfOutputs() {
    return this._nativeAudioNode.numberOfOutputs;
  }
  // tslint:disable-next-line:invalid-void
  connect(_, T = 0, b = 0) {
    if (T < 0 || T >= this._nativeAudioNode.numberOfOutputs)
      throw s();
    const C = h(this._context), v = p(C);
    if (d(_) || f(_))
      throw r();
    if (Dn(_)) {
      const y = ne(_);
      try {
        const E = Fn(this._nativeAudioNode, y, T, b), M = En(this);
        (v || M) && this._nativeAudioNode.disconnect(...E), this.context.state !== "closed" && !M && En(_) && Bt(_);
      } catch (E) {
        throw E.code === 12 ? r() : E;
      }
      if (e(this, _, T, b, v)) {
        const E = c([this], _);
        hs(E, n(v));
      }
      return _;
    }
    const S = rn(_);
    if (S.name === "playbackRate" && S.maxValue === 1024)
      throw o();
    try {
      this._nativeAudioNode.connect(S, T), (v || En(this)) && this._nativeAudioNode.disconnect(S, T);
    } catch (y) {
      throw y.code === 12 ? r() : y;
    }
    if (Xo(this, _, T, v)) {
      const y = c([this], _);
      hs(y, n(v));
    }
  }
  disconnect(_, T, b) {
    let C;
    const v = h(this._context), S = p(v);
    if (_ === void 0)
      C = Jo(this, S);
    else if (typeof _ == "number") {
      if (_ < 0 || _ >= this.numberOfOutputs)
        throw s();
      C = Ko(this, S, _);
    } else {
      if (T !== void 0 && (T < 0 || T >= this.numberOfOutputs) || Dn(_) && b !== void 0 && (b < 0 || b >= _.numberOfInputs))
        throw s();
      if (C = ea(this, S, _, T, b), C.length === 0)
        throw r();
    }
    for (const w of C) {
      const y = c([this], w);
      hs(y, a);
    }
  }
}, na = (i, e, t, n, s, r, o, a, c, l, h, u, d) => (f, p, m, g = null, _ = null) => {
  const T = m.value, b = new uo(T), C = p ? n(b) : null, v = {
    get defaultValue() {
      return T;
    },
    get maxValue() {
      return g === null ? m.maxValue : g;
    },
    get minValue() {
      return _ === null ? m.minValue : _;
    },
    get value() {
      return m.value;
    },
    set value(S) {
      m.value = S, v.setValueAtTime(S, f.context.currentTime);
    },
    cancelAndHoldAtTime(S) {
      if (typeof m.cancelAndHoldAtTime == "function")
        C === null && b.flush(f.context.currentTime), b.add(s(S)), m.cancelAndHoldAtTime(S);
      else {
        const w = Array.from(b).pop();
        C === null && b.flush(f.context.currentTime), b.add(s(S));
        const y = Array.from(b).pop();
        m.cancelScheduledValues(S), w !== y && y !== void 0 && (y.type === "exponentialRampToValue" ? m.exponentialRampToValueAtTime(y.value, y.endTime) : y.type === "linearRampToValue" ? m.linearRampToValueAtTime(y.value, y.endTime) : y.type === "setValue" ? m.setValueAtTime(y.value, y.startTime) : y.type === "setValueCurve" && m.setValueCurveAtTime(y.values, y.startTime, y.duration));
      }
      return v;
    },
    cancelScheduledValues(S) {
      return C === null && b.flush(f.context.currentTime), b.add(r(S)), m.cancelScheduledValues(S), v;
    },
    exponentialRampToValueAtTime(S, w) {
      if (S === 0)
        throw new RangeError();
      if (!Number.isFinite(w) || w < 0)
        throw new RangeError();
      const y = f.context.currentTime;
      return C === null && b.flush(y), Array.from(b).length === 0 && (b.add(l(T, y)), m.setValueAtTime(T, y)), b.add(o(S, w)), m.exponentialRampToValueAtTime(S, w), v;
    },
    linearRampToValueAtTime(S, w) {
      const y = f.context.currentTime;
      return C === null && b.flush(y), Array.from(b).length === 0 && (b.add(l(T, y)), m.setValueAtTime(T, y)), b.add(a(S, w)), m.linearRampToValueAtTime(S, w), v;
    },
    setTargetAtTime(S, w, y) {
      return C === null && b.flush(f.context.currentTime), b.add(c(S, w, y)), m.setTargetAtTime(S, w, y), v;
    },
    setValueAtTime(S, w) {
      return C === null && b.flush(f.context.currentTime), b.add(l(S, w)), m.setValueAtTime(S, w), v;
    },
    setValueCurveAtTime(S, w, y) {
      const x = S instanceof Float32Array ? S : new Float32Array(S);
      if (u !== null && u.name === "webkitAudioContext") {
        const E = w + y, M = f.context.sampleRate, A = Math.ceil(w * M), I = Math.floor(E * M), N = I - A, R = new Float32Array(N);
        for (let F = 0; F < N; F += 1) {
          const B = (x.length - 1) / y * ((A + F) / M - w), P = Math.floor(B), L = Math.ceil(B);
          R[F] = P === L ? x[P] : (1 - (B - P)) * x[P] + (1 - (L - B)) * x[L];
        }
        C === null && b.flush(f.context.currentTime), b.add(h(R, w, y)), m.setValueCurveAtTime(R, w, y);
        const D = I / M;
        D < E && d(v, R[R.length - 1], D), d(v, x[x.length - 1], E);
      } else
        C === null && b.flush(f.context.currentTime), b.add(h(x, w, y)), m.setValueCurveAtTime(x, w, y);
      return v;
    }
  };
  return t.set(v, m), e.set(v, f), i(v, C), v;
}, sa = (i) => ({
  replay(e) {
    for (const t of i)
      if (t.type === "exponentialRampToValue") {
        const { endTime: n, value: s } = t;
        e.exponentialRampToValueAtTime(s, n);
      } else if (t.type === "linearRampToValue") {
        const { endTime: n, value: s } = t;
        e.linearRampToValueAtTime(s, n);
      } else if (t.type === "setTarget") {
        const { startTime: n, target: s, timeConstant: r } = t;
        e.setTargetAtTime(s, n, r);
      } else if (t.type === "setValue") {
        const { startTime: n, value: s } = t;
        e.setValueAtTime(s, n);
      } else if (t.type === "setValueCurve") {
        const { duration: n, startTime: s, values: r } = t;
        e.setValueCurveAtTime(r, s, n);
      } else
        throw new Error("Can't apply an unknown automation.");
  }
});
class Xi {
  constructor(e) {
    this._map = new Map(e);
  }
  get size() {
    return this._map.size;
  }
  entries() {
    return this._map.entries();
  }
  forEach(e, t = null) {
    return this._map.forEach((n, s) => e.call(t, n, s, this));
  }
  get(e) {
    return this._map.get(e);
  }
  has(e) {
    return this._map.has(e);
  }
  keys() {
    return this._map.keys();
  }
  values() {
    return this._map.values();
  }
}
const ia = {
  channelCount: 2,
  // Bug #61: The channelCountMode should be 'max' according to the spec but is set to 'explicit' to achieve consistent behavior.
  channelCountMode: "explicit",
  channelInterpretation: "speakers",
  numberOfInputs: 1,
  numberOfOutputs: 1,
  parameterData: {},
  processorOptions: {}
}, ra = (i, e, t, n, s, r, o, a, c, l, h, u, d, f) => class extends e {
  constructor(m, g, _) {
    var T;
    const b = a(m), C = c(b), v = h({ ...ia, ..._ });
    d(v);
    const S = gs.get(b), w = S == null ? void 0 : S.get(g), y = C || b.state !== "closed" ? b : (T = o(b)) !== null && T !== void 0 ? T : b, x = s(y, C ? null : m.baseLatency, l, g, w, v), E = C ? n(g, v, w) : null;
    super(m, !0, x, E);
    const M = [];
    x.parameters.forEach((I, N) => {
      const R = t(this, C, I);
      M.push([N, R]);
    }), this._nativeAudioWorkletNode = x, this._onprocessorerror = null, this._parameters = new Xi(M), C && i(b, this);
    const { activeInputs: A } = r(this);
    u(x, A);
  }
  get onprocessorerror() {
    return this._onprocessorerror;
  }
  set onprocessorerror(m) {
    const g = typeof m == "function" ? f(this, m) : null;
    this._nativeAudioWorkletNode.onprocessorerror = g;
    const _ = this._nativeAudioWorkletNode.onprocessorerror;
    this._onprocessorerror = _ !== null && _ === g ? m : _;
  }
  get parameters() {
    return this._parameters === null ? this._nativeAudioWorkletNode.parameters : this._parameters;
  }
  get port() {
    return this._nativeAudioWorkletNode.port;
  }
};
function Pn(i, e, t, n, s) {
  if (typeof i.copyFromChannel == "function")
    e[t].byteLength === 0 && (e[t] = new Float32Array(128)), i.copyFromChannel(e[t], n, s);
  else {
    const r = i.getChannelData(n);
    if (e[t].byteLength === 0)
      e[t] = r.slice(s, s + 128);
    else {
      const o = new Float32Array(r.buffer, s * Float32Array.BYTES_PER_ELEMENT, 128);
      e[t].set(o);
    }
  }
}
const Yi = (i, e, t, n, s) => {
  typeof i.copyToChannel == "function" ? e[t].byteLength !== 0 && i.copyToChannel(e[t], n, s) : e[t].byteLength !== 0 && i.getChannelData(n).set(e[t], s);
}, qn = (i, e) => {
  const t = [];
  for (let n = 0; n < i; n += 1) {
    const s = [], r = typeof e == "number" ? e : e[n];
    for (let o = 0; o < r; o += 1)
      s.push(new Float32Array(128));
    t.push(s);
  }
  return t;
}, oa = (i, e) => {
  const t = Qe(_s, i), n = ne(e);
  return Qe(t, n);
}, aa = async (i, e, t, n, s, r, o) => {
  const a = e === null ? Math.ceil(i.context.length / 128) * 128 : e.length, c = n.channelCount * n.numberOfInputs, l = s.reduce((g, _) => g + _, 0), h = l === 0 ? null : t.createBuffer(l, a, t.sampleRate);
  if (r === void 0)
    throw new Error("Missing the processor constructor.");
  const u = Ae(i), d = await oa(t, i), f = qn(n.numberOfInputs, n.channelCount), p = qn(n.numberOfOutputs, s), m = Array.from(i.parameters.keys()).reduce((g, _) => ({ ...g, [_]: new Float32Array(128) }), {});
  for (let g = 0; g < a; g += 128) {
    if (n.numberOfInputs > 0 && e !== null)
      for (let _ = 0; _ < n.numberOfInputs; _ += 1)
        for (let T = 0; T < n.channelCount; T += 1)
          Pn(e, f[_], T, T, g);
    r.parameterDescriptors !== void 0 && e !== null && r.parameterDescriptors.forEach(({ name: _ }, T) => {
      Pn(e, m, _, c + T, g);
    });
    for (let _ = 0; _ < n.numberOfInputs; _ += 1)
      for (let T = 0; T < s[_]; T += 1)
        p[_][T].byteLength === 0 && (p[_][T] = new Float32Array(128));
    try {
      const _ = f.map((b, C) => u.activeInputs[C].size === 0 ? [] : b), T = o(g / t.sampleRate, t.sampleRate, () => d.process(_, p, m));
      if (h !== null)
        for (let b = 0, C = 0; b < n.numberOfOutputs; b += 1) {
          for (let v = 0; v < s[b]; v += 1)
            Yi(h, p[b], v, C + v, g);
          C += s[b];
        }
      if (!T)
        break;
    } catch (_) {
      i.dispatchEvent(new ErrorEvent("processorerror", {
        colno: _.colno,
        filename: _.filename,
        lineno: _.lineno,
        message: _.message
      }));
      break;
    }
  }
  return h;
}, ca = (i, e, t, n, s, r, o, a, c, l, h, u, d, f, p, m) => (g, _, T) => {
  const b = /* @__PURE__ */ new WeakMap();
  let C = null;
  const v = async (S, w) => {
    let y = h(S), x = null;
    const E = Te(y, w), M = Array.isArray(_.outputChannelCount) ? _.outputChannelCount : Array.from(_.outputChannelCount);
    if (u === null) {
      const A = M.reduce((D, F) => D + F, 0), I = s(w, {
        channelCount: Math.max(1, A),
        channelCountMode: "explicit",
        channelInterpretation: "discrete",
        numberOfOutputs: Math.max(1, A)
      }), N = [];
      for (let D = 0; D < S.numberOfOutputs; D += 1)
        N.push(n(w, {
          channelCount: 1,
          channelCountMode: "explicit",
          channelInterpretation: "speakers",
          numberOfInputs: M[D]
        }));
      const R = o(w, {
        channelCount: _.channelCount,
        channelCountMode: _.channelCountMode,
        channelInterpretation: _.channelInterpretation,
        gain: 1
      });
      R.connect = e.bind(null, N), R.disconnect = c.bind(null, N), x = [I, N, R];
    } else E || (y = new u(w, g));
    if (b.set(w, x === null ? y : x[2]), x !== null) {
      if (C === null) {
        if (T === void 0)
          throw new Error("Missing the processor constructor.");
        if (d === null)
          throw new Error("Missing the native OfflineAudioContext constructor.");
        const F = S.channelCount * S.numberOfInputs, B = T.parameterDescriptors === void 0 ? 0 : T.parameterDescriptors.length, P = F + B;
        C = aa(S, P === 0 ? null : await (async () => {
          const V = new d(
            P,
            // Ceil the length to the next full render quantum.
            // Bug #17: Safari does not yet expose the length.
            Math.ceil(S.context.length / 128) * 128,
            w.sampleRate
          ), H = [], pe = [];
          for (let Q = 0; Q < _.numberOfInputs; Q += 1)
            H.push(o(V, {
              channelCount: _.channelCount,
              channelCountMode: _.channelCountMode,
              channelInterpretation: _.channelInterpretation,
              gain: 1
            })), pe.push(s(V, {
              channelCount: _.channelCount,
              channelCountMode: "explicit",
              channelInterpretation: "discrete",
              numberOfOutputs: _.channelCount
            }));
          const me = await Promise.all(Array.from(S.parameters.values()).map(async (Q) => {
            const oe = r(V, {
              channelCount: 1,
              channelCountMode: "explicit",
              channelInterpretation: "discrete",
              offset: Q.value
            });
            return await f(V, Q, oe.offset), oe;
          })), U = n(V, {
            channelCount: 1,
            channelCountMode: "explicit",
            channelInterpretation: "speakers",
            numberOfInputs: Math.max(1, F + B)
          });
          for (let Q = 0; Q < _.numberOfInputs; Q += 1) {
            H[Q].connect(pe[Q]);
            for (let oe = 0; oe < _.channelCount; oe += 1)
              pe[Q].connect(U, oe, Q * _.channelCount + oe);
          }
          for (const [Q, oe] of me.entries())
            oe.connect(U, 0, F + Q), oe.start(0);
          return U.connect(V.destination), await Promise.all(H.map((Q) => p(S, V, Q))), m(V);
        })(), w, _, M, T, l);
      }
      const A = await C, I = t(w, {
        buffer: null,
        channelCount: 2,
        channelCountMode: "max",
        channelInterpretation: "speakers",
        loop: !1,
        loopEnd: 0,
        loopStart: 0,
        playbackRate: 1
      }), [N, R, D] = x;
      A !== null && (I.buffer = A, I.start(0)), I.connect(N);
      for (let F = 0, B = 0; F < S.numberOfOutputs; F += 1) {
        const P = R[F];
        for (let L = 0; L < M[F]; L += 1)
          N.connect(P, B + L, L);
        B += M[F];
      }
      return D;
    }
    if (E)
      for (const [A, I] of S.parameters.entries())
        await i(
          w,
          I,
          // @todo The definition that TypeScript uses of the AudioParamMap is lacking many methods.
          y.parameters.get(A)
        );
    else
      for (const [A, I] of S.parameters.entries())
        await f(
          w,
          I,
          // @todo The definition that TypeScript uses of the AudioParamMap is lacking many methods.
          y.parameters.get(A)
        );
    return await p(S, w, y), y;
  };
  return {
    render(S, w) {
      a(w, S);
      const y = b.get(w);
      return y !== void 0 ? Promise.resolve(y) : v(S, w);
    }
  };
}, la = (i, e, t, n, s, r, o, a, c, l, h, u, d, f, p, m, g, _, T, b) => class extends p {
  constructor(v, S) {
    super(v, S), this._nativeContext = v, this._audioWorklet = i === void 0 ? void 0 : {
      addModule: (w, y) => i(this, w, y)
    };
  }
  get audioWorklet() {
    return this._audioWorklet;
  }
  createAnalyser() {
    return new e(this);
  }
  createBiquadFilter() {
    return new s(this);
  }
  createBuffer(v, S, w) {
    return new t({ length: S, numberOfChannels: v, sampleRate: w });
  }
  createBufferSource() {
    return new n(this);
  }
  createChannelMerger(v = 6) {
    return new r(this, { numberOfInputs: v });
  }
  createChannelSplitter(v = 6) {
    return new o(this, { numberOfOutputs: v });
  }
  createConstantSource() {
    return new a(this);
  }
  createConvolver() {
    return new c(this);
  }
  createDelay(v = 1) {
    return new h(this, { maxDelayTime: v });
  }
  createDynamicsCompressor() {
    return new u(this);
  }
  createGain() {
    return new d(this);
  }
  createIIRFilter(v, S) {
    return new f(this, { feedback: S, feedforward: v });
  }
  createOscillator() {
    return new m(this);
  }
  createPanner() {
    return new g(this);
  }
  createPeriodicWave(v, S, w = { disableNormalization: !1 }) {
    return new _(this, { ...w, imag: S, real: v });
  }
  createStereoPanner() {
    return new T(this);
  }
  createWaveShaper() {
    return new b(this);
  }
  decodeAudioData(v, S, w) {
    return l(this._nativeContext, v).then((y) => (typeof S == "function" && S(y), y), (y) => {
      throw typeof w == "function" && w(y), y;
    });
  }
}, ha = {
  Q: 1,
  channelCount: 2,
  channelCountMode: "max",
  channelInterpretation: "speakers",
  detune: 0,
  frequency: 350,
  gain: 0,
  type: "lowpass"
}, ua = (i, e, t, n, s, r, o, a) => class extends i {
  constructor(l, h) {
    const u = r(l), d = { ...ha, ...h }, f = s(u, d), p = o(u), m = p ? t() : null;
    super(l, !1, f, m), this._Q = e(this, p, f.Q, be, Ie), this._detune = e(this, p, f.detune, 1200 * Math.log2(be), -1200 * Math.log2(be)), this._frequency = e(this, p, f.frequency, l.sampleRate / 2, 0), this._gain = e(this, p, f.gain, 40 * Math.log10(be), Ie), this._nativeBiquadFilterNode = f, a(this, 1);
  }
  get detune() {
    return this._detune;
  }
  get frequency() {
    return this._frequency;
  }
  get gain() {
    return this._gain;
  }
  get Q() {
    return this._Q;
  }
  get type() {
    return this._nativeBiquadFilterNode.type;
  }
  set type(l) {
    this._nativeBiquadFilterNode.type = l;
  }
  getFrequencyResponse(l, h, u) {
    try {
      this._nativeBiquadFilterNode.getFrequencyResponse(l, h, u);
    } catch (d) {
      throw d.code === 11 ? n() : d;
    }
    if (l.length !== h.length || h.length !== u.length)
      throw n();
  }
}, da = (i, e, t, n, s) => () => {
  const r = /* @__PURE__ */ new WeakMap(), o = async (a, c) => {
    let l = t(a);
    const h = Te(l, c);
    if (!h) {
      const u = {
        Q: l.Q.value,
        channelCount: l.channelCount,
        channelCountMode: l.channelCountMode,
        channelInterpretation: l.channelInterpretation,
        detune: l.detune.value,
        frequency: l.frequency.value,
        gain: l.gain.value,
        type: l.type
      };
      l = e(c, u);
    }
    return r.set(c, l), h ? (await i(c, a.Q, l.Q), await i(c, a.detune, l.detune), await i(c, a.frequency, l.frequency), await i(c, a.gain, l.gain)) : (await n(c, a.Q, l.Q), await n(c, a.detune, l.detune), await n(c, a.frequency, l.frequency), await n(c, a.gain, l.gain)), await s(a, c, l), l;
  };
  return {
    render(a, c) {
      const l = r.get(c);
      return l !== void 0 ? Promise.resolve(l) : o(a, c);
    }
  };
}, fa = (i, e) => (t, n) => {
  const s = e.get(t);
  if (s !== void 0)
    return s;
  const r = i.get(t);
  if (r !== void 0)
    return r;
  try {
    const o = n();
    return o instanceof Promise ? (i.set(t, o), o.catch(() => !1).then((a) => (i.delete(t), e.set(t, a), a))) : (e.set(t, o), o);
  } catch {
    return e.set(t, !1), !1;
  }
}, pa = {
  channelCount: 1,
  channelCountMode: "explicit",
  channelInterpretation: "speakers",
  numberOfInputs: 6
}, ma = (i, e, t, n, s) => class extends i {
  constructor(o, a) {
    const c = n(o), l = { ...pa, ...a }, h = t(c, l), u = s(c) ? e() : null;
    super(o, !1, h, u);
  }
}, ga = (i, e, t) => () => {
  const n = /* @__PURE__ */ new WeakMap(), s = async (r, o) => {
    let a = e(r);
    if (!Te(a, o)) {
      const l = {
        channelCount: a.channelCount,
        channelCountMode: a.channelCountMode,
        channelInterpretation: a.channelInterpretation,
        numberOfInputs: a.numberOfInputs
      };
      a = i(o, l);
    }
    return n.set(o, a), await t(r, o, a), a;
  };
  return {
    render(r, o) {
      const a = n.get(o);
      return a !== void 0 ? Promise.resolve(a) : s(r, o);
    }
  };
}, _a = {
  channelCount: 6,
  channelCountMode: "explicit",
  channelInterpretation: "discrete",
  numberOfOutputs: 6
}, va = (i, e, t, n, s, r) => class extends i {
  constructor(a, c) {
    const l = n(a), h = r({ ..._a, ...c }), u = t(l, h), d = s(l) ? e() : null;
    super(a, !1, u, d);
  }
}, ya = (i, e, t) => () => {
  const n = /* @__PURE__ */ new WeakMap(), s = async (r, o) => {
    let a = e(r);
    if (!Te(a, o)) {
      const l = {
        channelCount: a.channelCount,
        channelCountMode: a.channelCountMode,
        channelInterpretation: a.channelInterpretation,
        numberOfOutputs: a.numberOfOutputs
      };
      a = i(o, l);
    }
    return n.set(o, a), await t(r, o, a), a;
  };
  return {
    render(r, o) {
      const a = n.get(o);
      return a !== void 0 ? Promise.resolve(a) : s(r, o);
    }
  };
}, Sa = (i) => (e, t, n) => i(t, e, n), Ca = (i) => (e, t, n = 0, s = 0) => {
  const r = e[n];
  if (r === void 0)
    throw i();
  return Rn(t) ? r.connect(t, 0, s) : r.connect(t, 0);
}, Ta = (i) => (e, t) => {
  const n = i(e, {
    buffer: null,
    channelCount: 2,
    channelCountMode: "max",
    channelInterpretation: "speakers",
    loop: !1,
    loopEnd: 0,
    loopStart: 0,
    playbackRate: 1
  }), s = e.createBuffer(1, 2, 44100);
  return n.buffer = s, n.loop = !0, n.connect(t), n.start(), () => {
    n.stop(), n.disconnect(t);
  };
}, wa = {
  channelCount: 2,
  channelCountMode: "max",
  channelInterpretation: "speakers",
  offset: 1
}, ba = (i, e, t, n, s, r, o) => class extends i {
  constructor(c, l) {
    const h = s(c), u = { ...wa, ...l }, d = n(h, u), f = r(h), p = f ? t() : null;
    super(c, !1, d, p), this._constantSourceNodeRenderer = p, this._nativeConstantSourceNode = d, this._offset = e(this, f, d.offset, be, Ie), this._onended = null;
  }
  get offset() {
    return this._offset;
  }
  get onended() {
    return this._onended;
  }
  set onended(c) {
    const l = typeof c == "function" ? o(this, c) : null;
    this._nativeConstantSourceNode.onended = l;
    const h = this._nativeConstantSourceNode.onended;
    this._onended = h !== null && h === l ? c : h;
  }
  start(c = 0) {
    if (this._nativeConstantSourceNode.start(c), this._constantSourceNodeRenderer !== null && (this._constantSourceNodeRenderer.start = c), this.context.state !== "closed") {
      Bt(this);
      const l = () => {
        this._nativeConstantSourceNode.removeEventListener("ended", l), at(this) && hn(this);
      };
      this._nativeConstantSourceNode.addEventListener("ended", l);
    }
  }
  stop(c = 0) {
    this._nativeConstantSourceNode.stop(c), this._constantSourceNodeRenderer !== null && (this._constantSourceNodeRenderer.stop = c);
  }
}, Aa = (i, e, t, n, s) => () => {
  const r = /* @__PURE__ */ new WeakMap();
  let o = null, a = null;
  const c = async (l, h) => {
    let u = t(l);
    const d = Te(u, h);
    if (!d) {
      const f = {
        channelCount: u.channelCount,
        channelCountMode: u.channelCountMode,
        channelInterpretation: u.channelInterpretation,
        offset: u.offset.value
      };
      u = e(h, f), o !== null && u.start(o), a !== null && u.stop(a);
    }
    return r.set(h, u), d ? await i(h, l.offset, u.offset) : await n(h, l.offset, u.offset), await s(l, h, u), u;
  };
  return {
    set start(l) {
      o = l;
    },
    set stop(l) {
      a = l;
    },
    render(l, h) {
      const u = r.get(h);
      return u !== void 0 ? Promise.resolve(u) : c(l, h);
    }
  };
}, Ma = (i) => (e) => (i[0] = e, i[0]), Ea = {
  buffer: null,
  channelCount: 2,
  channelCountMode: "clamped-max",
  channelInterpretation: "speakers",
  disableNormalization: !1
}, xa = (i, e, t, n, s, r) => class extends i {
  constructor(a, c) {
    const l = n(a), h = { ...Ea, ...c }, u = t(l, h), f = s(l) ? e() : null;
    super(a, !1, u, f), this._isBufferNullified = !1, this._nativeConvolverNode = u, h.buffer !== null && r(this, h.buffer.duration);
  }
  get buffer() {
    return this._isBufferNullified ? null : this._nativeConvolverNode.buffer;
  }
  set buffer(a) {
    if (this._nativeConvolverNode.buffer = a, a === null && this._nativeConvolverNode.buffer !== null) {
      const c = this._nativeConvolverNode.context;
      this._nativeConvolverNode.buffer = c.createBuffer(1, 1, c.sampleRate), this._isBufferNullified = !0, r(this, 0);
    } else
      this._isBufferNullified = !1, r(this, this._nativeConvolverNode.buffer === null ? 0 : this._nativeConvolverNode.buffer.duration);
  }
  get normalize() {
    return this._nativeConvolverNode.normalize;
  }
  set normalize(a) {
    this._nativeConvolverNode.normalize = a;
  }
}, Na = (i, e, t) => () => {
  const n = /* @__PURE__ */ new WeakMap(), s = async (r, o) => {
    let a = e(r);
    if (!Te(a, o)) {
      const l = {
        buffer: a.buffer,
        channelCount: a.channelCount,
        channelCountMode: a.channelCountMode,
        channelInterpretation: a.channelInterpretation,
        disableNormalization: !a.normalize
      };
      a = i(o, l);
    }
    return n.set(o, a), Ht(a) ? await t(r, o, a.inputs[0]) : await t(r, o, a), a;
  };
  return {
    render(r, o) {
      const a = n.get(o);
      return a !== void 0 ? Promise.resolve(a) : s(r, o);
    }
  };
}, Ia = (i, e) => (t, n, s) => {
  if (e === null)
    throw new Error("Missing the native OfflineAudioContext constructor.");
  try {
    return new e(t, n, s);
  } catch (r) {
    throw r.name === "SyntaxError" ? i() : r;
  }
}, ka = () => new DOMException("", "DataCloneError"), wi = (i) => {
  const { port1: e, port2: t } = new MessageChannel();
  return new Promise((n) => {
    const s = () => {
      t.onmessage = null, e.close(), t.close(), n();
    };
    t.onmessage = () => s();
    try {
      e.postMessage(i, [i]);
    } catch {
    } finally {
      s();
    }
  });
}, Da = (i, e, t, n, s, r, o, a, c, l, h) => (u, d) => {
  const f = o(u) ? u : r(u);
  if (s.has(d)) {
    const p = t();
    return Promise.reject(p);
  }
  try {
    s.add(d);
  } catch {
  }
  return e(c, () => c(f)) ? f.decodeAudioData(d).then((p) => (wi(d).catch(() => {
  }), e(a, () => a(p)) || h(p), i.add(p), p)) : new Promise((p, m) => {
    const g = async () => {
      try {
        await wi(d);
      } catch {
      }
    }, _ = (T) => {
      m(T), g();
    };
    try {
      f.decodeAudioData(d, (T) => {
        typeof T.copyFromChannel != "function" && (l(T), Es(T)), i.add(T), g().then(() => p(T));
      }, (T) => {
        _(T === null ? n() : T);
      });
    } catch (T) {
      _(T);
    }
  });
}, Fa = (i, e, t, n, s, r, o, a) => (c, l) => {
  const h = e.get(c);
  if (h === void 0)
    throw new Error("Missing the expected cycle count.");
  const u = r(c.context), d = a(u);
  if (h === l) {
    if (e.delete(c), !d && o(c)) {
      const f = n(c), { outputs: p } = t(c);
      for (const m of p)
        if (dn(m)) {
          const g = n(m[0]);
          i(f, g, m[1], m[2]);
        } else {
          const g = s(m[0]);
          f.connect(g, m[1]);
        }
    }
  } else
    e.set(c, h - l);
}, Oa = {
  channelCount: 2,
  channelCountMode: "max",
  channelInterpretation: "speakers",
  delayTime: 0,
  maxDelayTime: 1
}, Ra = (i, e, t, n, s, r, o) => class extends i {
  constructor(c, l) {
    const h = s(c), u = { ...Oa, ...l }, d = n(h, u), f = r(h), p = f ? t(u.maxDelayTime) : null;
    super(c, !1, d, p), this._delayTime = e(this, f, d.delayTime), o(this, u.maxDelayTime);
  }
  get delayTime() {
    return this._delayTime;
  }
}, Pa = (i, e, t, n, s) => (r) => {
  const o = /* @__PURE__ */ new WeakMap(), a = async (c, l) => {
    let h = t(c);
    const u = Te(h, l);
    if (!u) {
      const d = {
        channelCount: h.channelCount,
        channelCountMode: h.channelCountMode,
        channelInterpretation: h.channelInterpretation,
        delayTime: h.delayTime.value,
        maxDelayTime: r
      };
      h = e(l, d);
    }
    return o.set(l, h), u ? await i(l, c.delayTime, h.delayTime) : await n(l, c.delayTime, h.delayTime), await s(c, l, h), h;
  };
  return {
    render(c, l) {
      const h = o.get(l);
      return h !== void 0 ? Promise.resolve(h) : a(c, l);
    }
  };
}, qa = (i) => (e, t, n, s) => i(e[s], (r) => r[0] === t && r[1] === n), Va = (i) => (e, t) => {
  i(e).delete(t);
}, La = (i) => "delayTime" in i, Ba = (i, e, t) => function n(s, r) {
  const o = Dn(r) ? r : t(i, r);
  if (La(o))
    return [];
  if (s[0] === o)
    return [s];
  if (s.includes(o))
    return [];
  const { outputs: a } = e(o);
  return Array.from(a).map((c) => n([...s, o], c[0])).reduce((c, l) => c.concat(l), []);
}, wn = (i, e, t) => {
  const n = e[t];
  if (n === void 0)
    throw i();
  return n;
}, Ua = (i) => (e, t = void 0, n = void 0, s = 0) => t === void 0 ? e.forEach((r) => r.disconnect()) : typeof t == "number" ? wn(i, e, t).disconnect() : Rn(t) ? n === void 0 ? e.forEach((r) => r.disconnect(t)) : s === void 0 ? wn(i, e, n).disconnect(t, 0) : wn(i, e, n).disconnect(t, 0, s) : n === void 0 ? e.forEach((r) => r.disconnect(t)) : wn(i, e, n).disconnect(t, 0), za = {
  attack: 3e-3,
  channelCount: 2,
  channelCountMode: "clamped-max",
  channelInterpretation: "speakers",
  knee: 30,
  ratio: 12,
  release: 0.25,
  threshold: -24
}, Wa = (i, e, t, n, s, r, o, a) => class extends i {
  constructor(l, h) {
    const u = r(l), d = { ...za, ...h }, f = n(u, d), p = o(u), m = p ? t() : null;
    super(l, !1, f, m), this._attack = e(this, p, f.attack), this._knee = e(this, p, f.knee), this._nativeDynamicsCompressorNode = f, this._ratio = e(this, p, f.ratio), this._release = e(this, p, f.release), this._threshold = e(this, p, f.threshold), a(this, 6e-3);
  }
  get attack() {
    return this._attack;
  }
  // Bug #108: Safari allows a channelCount of three and above which is why the getter and setter needs to be overwritten here.
  get channelCount() {
    return this._nativeDynamicsCompressorNode.channelCount;
  }
  set channelCount(l) {
    const h = this._nativeDynamicsCompressorNode.channelCount;
    if (this._nativeDynamicsCompressorNode.channelCount = l, l > 2)
      throw this._nativeDynamicsCompressorNode.channelCount = h, s();
  }
  /*
   * Bug #109: Only Chrome and Firefox disallow a channelCountMode of 'max' yet which is why the getter and setter needs to be
   * overwritten here.
   */
  get channelCountMode() {
    return this._nativeDynamicsCompressorNode.channelCountMode;
  }
  set channelCountMode(l) {
    const h = this._nativeDynamicsCompressorNode.channelCountMode;
    if (this._nativeDynamicsCompressorNode.channelCountMode = l, l === "max")
      throw this._nativeDynamicsCompressorNode.channelCountMode = h, s();
  }
  get knee() {
    return this._knee;
  }
  get ratio() {
    return this._ratio;
  }
  get reduction() {
    return typeof this._nativeDynamicsCompressorNode.reduction.value == "number" ? this._nativeDynamicsCompressorNode.reduction.value : this._nativeDynamicsCompressorNode.reduction;
  }
  get release() {
    return this._release;
  }
  get threshold() {
    return this._threshold;
  }
}, $a = (i, e, t, n, s) => () => {
  const r = /* @__PURE__ */ new WeakMap(), o = async (a, c) => {
    let l = t(a);
    const h = Te(l, c);
    if (!h) {
      const u = {
        attack: l.attack.value,
        channelCount: l.channelCount,
        channelCountMode: l.channelCountMode,
        channelInterpretation: l.channelInterpretation,
        knee: l.knee.value,
        ratio: l.ratio.value,
        release: l.release.value,
        threshold: l.threshold.value
      };
      l = e(c, u);
    }
    return r.set(c, l), h ? (await i(c, a.attack, l.attack), await i(c, a.knee, l.knee), await i(c, a.ratio, l.ratio), await i(c, a.release, l.release), await i(c, a.threshold, l.threshold)) : (await n(c, a.attack, l.attack), await n(c, a.knee, l.knee), await n(c, a.ratio, l.ratio), await n(c, a.release, l.release), await n(c, a.threshold, l.threshold)), await s(a, c, l), l;
  };
  return {
    render(a, c) {
      const l = r.get(c);
      return l !== void 0 ? Promise.resolve(l) : o(a, c);
    }
  };
}, ja = () => new DOMException("", "EncodingError"), Ga = (i) => (e) => new Promise((t, n) => {
  if (i === null) {
    n(new SyntaxError());
    return;
  }
  const s = i.document.head;
  if (s === null)
    n(new SyntaxError());
  else {
    const r = i.document.createElement("script"), o = new Blob([e], { type: "application/javascript" }), a = URL.createObjectURL(o), c = i.onerror, l = () => {
      i.onerror = c, URL.revokeObjectURL(a);
    };
    i.onerror = (h, u, d, f, p) => {
      if (u === a || u === i.location.href && d === 1 && f === 1)
        return l(), n(p), !1;
      if (c !== null)
        return c(h, u, d, f, p);
    }, r.onerror = () => {
      l(), n(new SyntaxError());
    }, r.onload = () => {
      l(), t();
    }, r.src = a, r.type = "module", s.appendChild(r);
  }
}), Ha = (i) => class {
  constructor(t) {
    this._nativeEventTarget = t, this._listeners = /* @__PURE__ */ new WeakMap();
  }
  addEventListener(t, n, s) {
    if (n !== null) {
      let r = this._listeners.get(n);
      r === void 0 && (r = i(this, n), typeof n == "function" && this._listeners.set(n, r)), this._nativeEventTarget.addEventListener(t, r, s);
    }
  }
  dispatchEvent(t) {
    return this._nativeEventTarget.dispatchEvent(t);
  }
  removeEventListener(t, n, s) {
    const r = n === null ? void 0 : this._listeners.get(n);
    this._nativeEventTarget.removeEventListener(t, r === void 0 ? null : r, s);
  }
}, Qa = (i) => (e, t, n) => {
  Object.defineProperties(i, {
    currentFrame: {
      configurable: !0,
      get() {
        return Math.round(e * t);
      }
    },
    currentTime: {
      configurable: !0,
      get() {
        return e;
      }
    }
  });
  try {
    return n();
  } finally {
    i !== null && (delete i.currentFrame, delete i.currentTime);
  }
}, Xa = (i) => async (e) => {
  try {
    const t = await fetch(e);
    if (t.ok)
      return [await t.text(), t.url];
  } catch {
  }
  throw i();
}, Ya = {
  channelCount: 2,
  channelCountMode: "max",
  channelInterpretation: "speakers",
  gain: 1
}, Za = (i, e, t, n, s, r) => class extends i {
  constructor(a, c) {
    const l = s(a), h = { ...Ya, ...c }, u = n(l, h), d = r(l), f = d ? t() : null;
    super(a, !1, u, f), this._gain = e(this, d, u.gain, be, Ie);
  }
  get gain() {
    return this._gain;
  }
}, Ja = (i, e, t, n, s) => () => {
  const r = /* @__PURE__ */ new WeakMap(), o = async (a, c) => {
    let l = t(a);
    const h = Te(l, c);
    if (!h) {
      const u = {
        channelCount: l.channelCount,
        channelCountMode: l.channelCountMode,
        channelInterpretation: l.channelInterpretation,
        gain: l.gain.value
      };
      l = e(c, u);
    }
    return r.set(c, l), h ? await i(c, a.gain, l.gain) : await n(c, a.gain, l.gain), await s(a, c, l), l;
  };
  return {
    render(a, c) {
      const l = r.get(c);
      return l !== void 0 ? Promise.resolve(l) : o(a, c);
    }
  };
}, Ka = (i, e) => (t) => e(i, t), ec = (i) => (e) => {
  const t = i(e);
  if (t.renderer === null)
    throw new Error("Missing the renderer of the given AudioNode in the audio graph.");
  return t.renderer;
}, tc = (i) => (e) => {
  var t;
  return (t = i.get(e)) !== null && t !== void 0 ? t : 0;
}, nc = (i) => (e) => {
  const t = i(e);
  if (t.renderer === null)
    throw new Error("Missing the renderer of the given AudioParam in the audio graph.");
  return t.renderer;
}, sc = (i) => (e) => i.get(e), _e = () => new DOMException("", "InvalidStateError"), ic = (i) => (e) => {
  const t = i.get(e);
  if (t === void 0)
    throw _e();
  return t;
}, rc = (i, e) => (t) => {
  let n = i.get(t);
  if (n !== void 0)
    return n;
  if (e === null)
    throw new Error("Missing the native OfflineAudioContext constructor.");
  return n = new e(1, 1, 44100), i.set(t, n), n;
}, oc = (i) => (e) => {
  const t = i.get(e);
  if (t === void 0)
    throw new Error("The context has no set of AudioWorkletNodes.");
  return t;
}, jn = () => new DOMException("", "InvalidAccessError"), ac = (i) => {
  i.getFrequencyResponse = /* @__PURE__ */ ((e) => (t, n, s) => {
    if (t.length !== n.length || n.length !== s.length)
      throw jn();
    return e.call(i, t, n, s);
  })(i.getFrequencyResponse);
}, cc = {
  channelCount: 2,
  channelCountMode: "max",
  channelInterpretation: "speakers"
}, lc = (i, e, t, n, s, r) => class extends i {
  constructor(a, c) {
    const l = n(a), h = s(l), u = { ...cc, ...c }, d = e(l, h ? null : a.baseLatency, u), f = h ? t(u.feedback, u.feedforward) : null;
    super(a, !1, d, f), ac(d), this._nativeIIRFilterNode = d, r(this, 1);
  }
  getFrequencyResponse(a, c, l) {
    return this._nativeIIRFilterNode.getFrequencyResponse(a, c, l);
  }
}, Zi = (i, e, t, n, s, r, o, a, c, l, h) => {
  const u = l.length;
  let d = a;
  for (let f = 0; f < u; f += 1) {
    let p = t[0] * l[f];
    for (let m = 1; m < s; m += 1) {
      const g = d - m & c - 1;
      p += t[m] * r[g], p -= i[m] * o[g];
    }
    for (let m = s; m < n; m += 1)
      p += t[m] * r[d - m & c - 1];
    for (let m = s; m < e; m += 1)
      p -= i[m] * o[d - m & c - 1];
    r[d] = l[f], o[d] = p, d = d + 1 & c - 1, h[f] = p;
  }
  return d;
}, hc = (i, e, t, n) => {
  const s = t instanceof Float64Array ? t : new Float64Array(t), r = n instanceof Float64Array ? n : new Float64Array(n), o = s.length, a = r.length, c = Math.min(o, a);
  if (s[0] !== 1) {
    for (let p = 0; p < o; p += 1)
      r[p] /= s[0];
    for (let p = 1; p < a; p += 1)
      s[p] /= s[0];
  }
  const l = 32, h = new Float32Array(l), u = new Float32Array(l), d = e.createBuffer(i.numberOfChannels, i.length, i.sampleRate), f = i.numberOfChannels;
  for (let p = 0; p < f; p += 1) {
    const m = i.getChannelData(p), g = d.getChannelData(p);
    h.fill(0), u.fill(0), Zi(s, o, r, a, c, h, u, 0, l, m, g);
  }
  return d;
}, uc = (i, e, t, n, s) => (r, o) => {
  const a = /* @__PURE__ */ new WeakMap();
  let c = null;
  const l = async (h, u) => {
    let d = null, f = e(h);
    const p = Te(f, u);
    if (u.createIIRFilter === void 0 ? d = i(u, {
      buffer: null,
      channelCount: 2,
      channelCountMode: "max",
      channelInterpretation: "speakers",
      loop: !1,
      loopEnd: 0,
      loopStart: 0,
      playbackRate: 1
    }) : p || (f = u.createIIRFilter(o, r)), a.set(u, d === null ? f : d), d !== null) {
      if (c === null) {
        if (t === null)
          throw new Error("Missing the native OfflineAudioContext constructor.");
        const g = new t(
          // Bug #47: The AudioDestinationNode in Safari gets not initialized correctly.
          h.context.destination.channelCount,
          // Bug #17: Safari does not yet expose the length.
          h.context.length,
          u.sampleRate
        );
        c = (async () => {
          await n(h, g, g.destination);
          const _ = await s(g);
          return hc(_, u, r, o);
        })();
      }
      const m = await c;
      return d.buffer = m, d.start(0), d;
    }
    return await n(h, u, f), f;
  };
  return {
    render(h, u) {
      const d = a.get(u);
      return d !== void 0 ? Promise.resolve(d) : l(h, u);
    }
  };
}, dc = (i, e, t, n, s, r) => (o) => (a, c) => {
  const l = i.get(a);
  if (l === void 0) {
    if (!o && r(a)) {
      const h = n(a), { outputs: u } = t(a);
      for (const d of u)
        if (dn(d)) {
          const f = n(d[0]);
          e(h, f, d[1], d[2]);
        } else {
          const f = s(d[0]);
          h.disconnect(f, d[1]);
        }
    }
    i.set(a, c);
  } else
    i.set(a, l + c);
}, fc = (i, e) => (t) => {
  const n = i.get(t);
  return e(n) || e(t);
}, pc = (i, e) => (t) => i.has(t) || e(t), mc = (i, e) => (t) => i.has(t) || e(t), gc = (i, e) => (t) => {
  const n = i.get(t);
  return e(n) || e(t);
}, _c = (i) => (e) => i !== null && e instanceof i, vc = (i) => (e) => i !== null && typeof i.AudioNode == "function" && e instanceof i.AudioNode, yc = (i) => (e) => i !== null && typeof i.AudioParam == "function" && e instanceof i.AudioParam, Sc = (i, e) => (t) => i(t) || e(t), Cc = (i) => (e) => i !== null && e instanceof i, Tc = (i) => i !== null && i.isSecureContext, wc = (i, e, t, n) => class extends i {
  constructor(r, o) {
    const a = t(r), c = e(a, o);
    if (n(a))
      throw TypeError();
    super(r, !0, c, null), this._nativeMediaElementAudioSourceNode = c;
  }
  get mediaElement() {
    return this._nativeMediaElementAudioSourceNode.mediaElement;
  }
}, bc = {
  channelCount: 2,
  channelCountMode: "explicit",
  channelInterpretation: "speakers"
}, Ac = (i, e, t, n) => class extends i {
  constructor(r, o) {
    const a = t(r);
    if (n(a))
      throw new TypeError();
    const c = { ...bc, ...o }, l = e(a, c);
    super(r, !1, l, null), this._nativeMediaStreamAudioDestinationNode = l;
  }
  get stream() {
    return this._nativeMediaStreamAudioDestinationNode.stream;
  }
}, Mc = (i, e, t, n) => class extends i {
  constructor(r, o) {
    const a = t(r), c = e(a, o);
    if (n(a))
      throw new TypeError();
    super(r, !0, c, null), this._nativeMediaStreamAudioSourceNode = c;
  }
  get mediaStream() {
    return this._nativeMediaStreamAudioSourceNode.mediaStream;
  }
}, Ec = (i, e, t) => class extends i {
  constructor(s, r) {
    const o = t(s), a = e(o, r);
    super(s, !0, a, null);
  }
}, xc = (i, e, t, n, s, r) => class extends t {
  constructor(a, c) {
    super(a), this._nativeContext = a, Wn.set(this, a), n(a) && s.set(a, /* @__PURE__ */ new Set()), this._destination = new i(this, c), this._listener = e(this, a), this._onstatechange = null;
  }
  get currentTime() {
    return this._nativeContext.currentTime;
  }
  get destination() {
    return this._destination;
  }
  get listener() {
    return this._listener;
  }
  get onstatechange() {
    return this._onstatechange;
  }
  set onstatechange(a) {
    const c = typeof a == "function" ? r(this, a) : null;
    this._nativeContext.onstatechange = c;
    const l = this._nativeContext.onstatechange;
    this._onstatechange = l !== null && l === c ? a : l;
  }
  get sampleRate() {
    return this._nativeContext.sampleRate;
  }
  get state() {
    return this._nativeContext.state;
  }
}, on = (i) => {
  const e = new Uint32Array([1179011410, 40, 1163280727, 544501094, 16, 131073, 44100, 176400, 1048580, 1635017060, 4, 0]);
  try {
    const t = i.decodeAudioData(e.buffer, () => {
    });
    return t === void 0 ? !1 : (t.catch(() => {
    }), !0);
  } catch {
  }
  return !1;
}, Nc = (i, e) => (t, n, s) => {
  const r = /* @__PURE__ */ new Set();
  return t.connect = /* @__PURE__ */ ((o) => (a, c = 0, l = 0) => {
    const h = r.size === 0;
    if (e(a))
      return o.call(t, a, c, l), i(r, [a, c, l], (u) => u[0] === a && u[1] === c && u[2] === l, !0), h && n(), a;
    o.call(t, a, c), i(r, [a, c], (u) => u[0] === a && u[1] === c, !0), h && n();
  })(t.connect), t.disconnect = /* @__PURE__ */ ((o) => (a, c, l) => {
    const h = r.size > 0;
    if (a === void 0)
      o.apply(t), r.clear();
    else if (typeof a == "number") {
      o.call(t, a);
      for (const d of r)
        d[1] === a && r.delete(d);
    } else {
      e(a) ? o.call(t, a, c, l) : o.call(t, a, c);
      for (const d of r)
        d[0] === a && (c === void 0 || d[1] === c) && (l === void 0 || d[2] === l) && r.delete(d);
    }
    const u = r.size === 0;
    h && u && s();
  })(t.disconnect), t;
}, se = (i, e, t) => {
  const n = e[t];
  n !== void 0 && n !== i[t] && (i[t] = n);
}, ge = (i, e) => {
  se(i, e, "channelCount"), se(i, e, "channelCountMode"), se(i, e, "channelInterpretation");
}, bi = (i) => typeof i.getFloatTimeDomainData == "function", Ic = (i) => {
  i.getFloatTimeDomainData = (e) => {
    const t = new Uint8Array(e.length);
    i.getByteTimeDomainData(t);
    const n = Math.max(t.length, i.fftSize);
    for (let s = 0; s < n; s += 1)
      e[s] = (t[s] - 128) * 78125e-7;
    return e;
  };
}, kc = (i, e) => (t, n) => {
  const s = t.createAnalyser();
  if (ge(s, n), !(n.maxDecibels > n.minDecibels))
    throw e();
  return se(s, n, "fftSize"), se(s, n, "maxDecibels"), se(s, n, "minDecibels"), se(s, n, "smoothingTimeConstant"), i(bi, () => bi(s)) || Ic(s), s;
}, Dc = (i) => i === null ? null : i.hasOwnProperty("AudioBuffer") ? i.AudioBuffer : null, ae = (i, e, t) => {
  const n = e[t];
  n !== void 0 && n !== i[t].value && (i[t].value = n);
}, Fc = (i) => {
  i.start = /* @__PURE__ */ ((e) => {
    let t = !1;
    return (n = 0, s = 0, r) => {
      if (t)
        throw _e();
      e.call(i, n, s, r), t = !0;
    };
  })(i.start);
}, Is = (i) => {
  i.start = /* @__PURE__ */ ((e) => (t = 0, n = 0, s) => {
    if (typeof s == "number" && s < 0 || n < 0 || t < 0)
      throw new RangeError("The parameters can't be negative.");
    e.call(i, t, n, s);
  })(i.start);
}, ks = (i) => {
  i.stop = /* @__PURE__ */ ((e) => (t = 0) => {
    if (t < 0)
      throw new RangeError("The parameter can't be negative.");
    e.call(i, t);
  })(i.stop);
}, Oc = (i, e, t, n, s, r, o, a, c, l, h) => (u, d) => {
  const f = u.createBufferSource();
  return ge(f, d), ae(f, d, "playbackRate"), se(f, d, "buffer"), se(f, d, "loop"), se(f, d, "loopEnd"), se(f, d, "loopStart"), e(t, () => t(u)) || Fc(f), e(n, () => n(u)) || c(f), e(s, () => s(u)) || l(f, u), e(r, () => r(u)) || Is(f), e(o, () => o(u)) || h(f, u), e(a, () => a(u)) || ks(f), i(u, f), f;
}, Rc = (i) => i === null ? null : i.hasOwnProperty("AudioContext") ? i.AudioContext : i.hasOwnProperty("webkitAudioContext") ? i.webkitAudioContext : null, Pc = (i, e) => (t, n, s) => {
  const r = t.destination;
  if (r.channelCount !== n)
    try {
      r.channelCount = n;
    } catch {
    }
  s && r.channelCountMode !== "explicit" && (r.channelCountMode = "explicit"), r.maxChannelCount === 0 && Object.defineProperty(r, "maxChannelCount", {
    value: n
  });
  const o = i(t, {
    channelCount: n,
    channelCountMode: r.channelCountMode,
    channelInterpretation: r.channelInterpretation,
    gain: 1
  });
  return e(o, "channelCount", (a) => () => a.call(o), (a) => (c) => {
    a.call(o, c);
    try {
      r.channelCount = c;
    } catch (l) {
      if (c > r.maxChannelCount)
        throw l;
    }
  }), e(o, "channelCountMode", (a) => () => a.call(o), (a) => (c) => {
    a.call(o, c), r.channelCountMode = c;
  }), e(o, "channelInterpretation", (a) => () => a.call(o), (a) => (c) => {
    a.call(o, c), r.channelInterpretation = c;
  }), Object.defineProperty(o, "maxChannelCount", {
    get: () => r.maxChannelCount
  }), o.connect(r), o;
}, qc = (i) => i === null ? null : i.hasOwnProperty("AudioWorkletNode") ? i.AudioWorkletNode : null, Vc = (i) => {
  const { port1: e } = new MessageChannel();
  try {
    e.postMessage(i);
  } finally {
    e.close();
  }
}, Lc = (i, e, t, n, s) => (r, o, a, c, l, h) => {
  if (a !== null)
    try {
      const u = new a(r, c, h), d = /* @__PURE__ */ new Map();
      let f = null;
      if (Object.defineProperties(u, {
        /*
         * Bug #61: Overwriting the property accessors for channelCount and channelCountMode is necessary as long as some
         * browsers have no native implementation to achieve a consistent behavior.
         */
        channelCount: {
          get: () => h.channelCount,
          set: () => {
            throw i();
          }
        },
        channelCountMode: {
          get: () => "explicit",
          set: () => {
            throw i();
          }
        },
        // Bug #156: Chrome and Edge do not yet fire an ErrorEvent.
        onprocessorerror: {
          get: () => f,
          set: (p) => {
            typeof f == "function" && u.removeEventListener("processorerror", f), f = typeof p == "function" ? p : null, typeof f == "function" && u.addEventListener("processorerror", f);
          }
        }
      }), u.addEventListener = /* @__PURE__ */ ((p) => (...m) => {
        if (m[0] === "processorerror") {
          const g = typeof m[1] == "function" ? m[1] : typeof m[1] == "object" && m[1] !== null && typeof m[1].handleEvent == "function" ? m[1].handleEvent : null;
          if (g !== null) {
            const _ = d.get(m[1]);
            _ !== void 0 ? m[1] = _ : (m[1] = (T) => {
              T.type === "error" ? (Object.defineProperties(T, {
                type: { value: "processorerror" }
              }), g(T)) : g(new ErrorEvent(m[0], { ...T }));
            }, d.set(g, m[1]));
          }
        }
        return p.call(u, "error", m[1], m[2]), p.call(u, ...m);
      })(u.addEventListener), u.removeEventListener = /* @__PURE__ */ ((p) => (...m) => {
        if (m[0] === "processorerror") {
          const g = d.get(m[1]);
          g !== void 0 && (d.delete(m[1]), m[1] = g);
        }
        return p.call(u, "error", m[1], m[2]), p.call(u, m[0], m[1], m[2]);
      })(u.removeEventListener), h.numberOfOutputs !== 0) {
        const p = t(r, {
          channelCount: 1,
          channelCountMode: "explicit",
          channelInterpretation: "discrete",
          gain: 0
        });
        return u.connect(p).connect(r.destination), s(u, () => p.disconnect(), () => p.connect(r.destination));
      }
      return u;
    } catch (u) {
      throw u.code === 11 ? n() : u;
    }
  if (l === void 0)
    throw n();
  return Vc(h), e(r, o, l, h);
}, Ji = (i, e) => i === null ? 512 : Math.max(512, Math.min(16384, Math.pow(2, Math.round(Math.log2(i * e))))), Bc = (i) => new Promise((e, t) => {
  const { port1: n, port2: s } = new MessageChannel();
  n.onmessage = ({ data: r }) => {
    n.close(), s.close(), e(r);
  }, n.onmessageerror = ({ data: r }) => {
    n.close(), s.close(), t(r);
  }, s.postMessage(i);
}), Uc = async (i, e) => {
  const t = await Bc(e);
  return new i(t);
}, zc = (i, e, t, n) => {
  let s = _s.get(i);
  s === void 0 && (s = /* @__PURE__ */ new WeakMap(), _s.set(i, s));
  const r = Uc(t, n);
  return s.set(e, r), r;
}, Wc = (i, e, t, n, s, r, o, a, c, l, h, u, d) => (f, p, m, g) => {
  if (g.numberOfInputs === 0 && g.numberOfOutputs === 0)
    throw c();
  const _ = Array.isArray(g.outputChannelCount) ? g.outputChannelCount : Array.from(g.outputChannelCount);
  if (_.some((k) => k < 1))
    throw c();
  if (_.length !== g.numberOfOutputs)
    throw e();
  if (g.channelCountMode !== "explicit")
    throw c();
  const T = g.channelCount * g.numberOfInputs, b = _.reduce((k, q) => k + q, 0), C = m.parameterDescriptors === void 0 ? 0 : m.parameterDescriptors.length;
  if (T + C > 6 || b > 6)
    throw c();
  const v = new MessageChannel(), S = [], w = [];
  for (let k = 0; k < g.numberOfInputs; k += 1)
    S.push(o(f, {
      channelCount: g.channelCount,
      channelCountMode: g.channelCountMode,
      channelInterpretation: g.channelInterpretation,
      gain: 1
    })), w.push(s(f, {
      channelCount: g.channelCount,
      channelCountMode: "explicit",
      channelInterpretation: "discrete",
      numberOfOutputs: g.channelCount
    }));
  const y = [];
  if (m.parameterDescriptors !== void 0)
    for (const { defaultValue: k, maxValue: q, minValue: ie, name: Z } of m.parameterDescriptors) {
      const G = r(f, {
        channelCount: 1,
        channelCountMode: "explicit",
        channelInterpretation: "discrete",
        offset: g.parameterData[Z] !== void 0 ? g.parameterData[Z] : k === void 0 ? 0 : k
      });
      Object.defineProperties(G.offset, {
        defaultValue: {
          get: () => k === void 0 ? 0 : k
        },
        maxValue: {
          get: () => q === void 0 ? be : q
        },
        minValue: {
          get: () => ie === void 0 ? Ie : ie
        }
      }), y.push(G);
    }
  const x = n(f, {
    channelCount: 1,
    channelCountMode: "explicit",
    channelInterpretation: "speakers",
    numberOfInputs: Math.max(1, T + C)
  }), E = Ji(p, f.sampleRate), M = a(
    f,
    E,
    T + C,
    // Bug #87: Only Firefox will fire an AudioProcessingEvent if there is no connected output.
    Math.max(1, b)
  ), A = s(f, {
    channelCount: Math.max(1, b),
    channelCountMode: "explicit",
    channelInterpretation: "discrete",
    numberOfOutputs: Math.max(1, b)
  }), I = [];
  for (let k = 0; k < g.numberOfOutputs; k += 1)
    I.push(n(f, {
      channelCount: 1,
      channelCountMode: "explicit",
      channelInterpretation: "speakers",
      numberOfInputs: _[k]
    }));
  for (let k = 0; k < g.numberOfInputs; k += 1) {
    S[k].connect(w[k]);
    for (let q = 0; q < g.channelCount; q += 1)
      w[k].connect(x, q, k * g.channelCount + q);
  }
  const N = new Xi(m.parameterDescriptors === void 0 ? [] : m.parameterDescriptors.map(({ name: k }, q) => {
    const ie = y[q];
    return ie.connect(x, 0, T + q), ie.start(0), [k, ie.offset];
  }));
  x.connect(M);
  let R = g.channelInterpretation, D = null;
  const F = g.numberOfOutputs === 0 ? [M] : I, B = {
    get bufferSize() {
      return E;
    },
    get channelCount() {
      return g.channelCount;
    },
    set channelCount(k) {
      throw t();
    },
    get channelCountMode() {
      return g.channelCountMode;
    },
    set channelCountMode(k) {
      throw t();
    },
    get channelInterpretation() {
      return R;
    },
    set channelInterpretation(k) {
      for (const q of S)
        q.channelInterpretation = k;
      R = k;
    },
    get context() {
      return M.context;
    },
    get inputs() {
      return S;
    },
    get numberOfInputs() {
      return g.numberOfInputs;
    },
    get numberOfOutputs() {
      return g.numberOfOutputs;
    },
    get onprocessorerror() {
      return D;
    },
    set onprocessorerror(k) {
      typeof D == "function" && B.removeEventListener("processorerror", D), D = typeof k == "function" ? k : null, typeof D == "function" && B.addEventListener("processorerror", D);
    },
    get parameters() {
      return N;
    },
    get port() {
      return v.port2;
    },
    addEventListener(...k) {
      return M.addEventListener(k[0], k[1], k[2]);
    },
    connect: i.bind(null, F),
    disconnect: l.bind(null, F),
    dispatchEvent(...k) {
      return M.dispatchEvent(k[0]);
    },
    removeEventListener(...k) {
      return M.removeEventListener(k[0], k[1], k[2]);
    }
  }, P = /* @__PURE__ */ new Map();
  v.port1.addEventListener = /* @__PURE__ */ ((k) => (...q) => {
    if (q[0] === "message") {
      const ie = typeof q[1] == "function" ? q[1] : typeof q[1] == "object" && q[1] !== null && typeof q[1].handleEvent == "function" ? q[1].handleEvent : null;
      if (ie !== null) {
        const Z = P.get(q[1]);
        Z !== void 0 ? q[1] = Z : (q[1] = (G) => {
          h(f.currentTime, f.sampleRate, () => ie(G));
        }, P.set(ie, q[1]));
      }
    }
    return k.call(v.port1, q[0], q[1], q[2]);
  })(v.port1.addEventListener), v.port1.removeEventListener = /* @__PURE__ */ ((k) => (...q) => {
    if (q[0] === "message") {
      const ie = P.get(q[1]);
      ie !== void 0 && (P.delete(q[1]), q[1] = ie);
    }
    return k.call(v.port1, q[0], q[1], q[2]);
  })(v.port1.removeEventListener);
  let L = null;
  Object.defineProperty(v.port1, "onmessage", {
    get: () => L,
    set: (k) => {
      typeof L == "function" && v.port1.removeEventListener("message", L), L = typeof k == "function" ? k : null, typeof L == "function" && (v.port1.addEventListener("message", L), v.port1.start());
    }
  }), m.prototype.port = v.port1;
  let V = null;
  zc(f, B, m, g).then((k) => V = k);
  const pe = qn(g.numberOfInputs, g.channelCount), me = qn(g.numberOfOutputs, _), U = m.parameterDescriptors === void 0 ? [] : m.parameterDescriptors.reduce((k, { name: q }) => ({ ...k, [q]: new Float32Array(128) }), {});
  let Q = !0;
  const oe = () => {
    g.numberOfOutputs > 0 && M.disconnect(A);
    for (let k = 0, q = 0; k < g.numberOfOutputs; k += 1) {
      const ie = I[k];
      for (let Z = 0; Z < _[k]; Z += 1)
        A.disconnect(ie, q + Z, Z);
      q += _[k];
    }
  }, O = /* @__PURE__ */ new Map();
  M.onaudioprocess = ({ inputBuffer: k, outputBuffer: q }) => {
    if (V !== null) {
      const ie = u(B);
      for (let Z = 0; Z < E; Z += 128) {
        for (let G = 0; G < g.numberOfInputs; G += 1)
          for (let J = 0; J < g.channelCount; J += 1)
            Pn(k, pe[G], J, J, Z);
        m.parameterDescriptors !== void 0 && m.parameterDescriptors.forEach(({ name: G }, J) => {
          Pn(k, U, G, T + J, Z);
        });
        for (let G = 0; G < g.numberOfInputs; G += 1)
          for (let J = 0; J < _[G]; J += 1)
            me[G][J].byteLength === 0 && (me[G][J] = new Float32Array(128));
        try {
          const G = pe.map((xe, Je) => {
            if (ie[Je].size > 0)
              return O.set(Je, E / 128), xe;
            const tn = O.get(Je);
            return tn === void 0 ? [] : (xe.every((as) => as.every((cs) => cs === 0)) && (tn === 1 ? O.delete(Je) : O.set(Je, tn - 1)), xe);
          });
          Q = h(f.currentTime + Z / f.sampleRate, f.sampleRate, () => V.process(G, me, U));
          for (let xe = 0, Je = 0; xe < g.numberOfOutputs; xe += 1) {
            for (let Tt = 0; Tt < _[xe]; Tt += 1)
              Yi(q, me[xe], Tt, Je + Tt, Z);
            Je += _[xe];
          }
        } catch (G) {
          Q = !1, B.dispatchEvent(new ErrorEvent("processorerror", {
            colno: G.colno,
            filename: G.filename,
            lineno: G.lineno,
            message: G.message
          }));
        }
        if (!Q) {
          for (let G = 0; G < g.numberOfInputs; G += 1) {
            S[G].disconnect(w[G]);
            for (let J = 0; J < g.channelCount; J += 1)
              w[Z].disconnect(x, J, G * g.channelCount + J);
          }
          if (m.parameterDescriptors !== void 0) {
            const G = m.parameterDescriptors.length;
            for (let J = 0; J < G; J += 1) {
              const xe = y[J];
              xe.disconnect(x, 0, T + J), xe.stop();
            }
          }
          x.disconnect(M), M.onaudioprocess = null, Re ? oe() : Le();
          break;
        }
      }
    }
  };
  let Re = !1;
  const Ee = o(f, {
    channelCount: 1,
    channelCountMode: "explicit",
    channelInterpretation: "discrete",
    gain: 0
  }), Pe = () => M.connect(Ee).connect(f.destination), Le = () => {
    M.disconnect(Ee), Ee.disconnect();
  }, Dt = () => {
    if (Q) {
      Le(), g.numberOfOutputs > 0 && M.connect(A);
      for (let k = 0, q = 0; k < g.numberOfOutputs; k += 1) {
        const ie = I[k];
        for (let Z = 0; Z < _[k]; Z += 1)
          A.connect(ie, q + Z, Z);
        q += _[k];
      }
    }
    Re = !0;
  }, en = () => {
    Q && (Pe(), oe()), Re = !1;
  };
  return Pe(), d(B, Dt, en);
}, Ki = (i, e) => {
  const t = i.createBiquadFilter();
  return ge(t, e), ae(t, e, "Q"), ae(t, e, "detune"), ae(t, e, "frequency"), ae(t, e, "gain"), se(t, e, "type"), t;
}, $c = (i, e) => (t, n) => {
  const s = t.createChannelMerger(n.numberOfInputs);
  return i !== null && i.name === "webkitAudioContext" && e(t, s), ge(s, n), s;
}, jc = (i) => {
  const e = i.numberOfOutputs;
  Object.defineProperty(i, "channelCount", {
    get: () => e,
    set: (t) => {
      if (t !== e)
        throw _e();
    }
  }), Object.defineProperty(i, "channelCountMode", {
    get: () => "explicit",
    set: (t) => {
      if (t !== "explicit")
        throw _e();
    }
  }), Object.defineProperty(i, "channelInterpretation", {
    get: () => "discrete",
    set: (t) => {
      if (t !== "discrete")
        throw _e();
    }
  });
}, fn = (i, e) => {
  const t = i.createChannelSplitter(e.numberOfOutputs);
  return ge(t, e), jc(t), t;
}, Gc = (i, e, t, n, s) => (r, o) => {
  if (r.createConstantSource === void 0)
    return t(r, o);
  const a = r.createConstantSource();
  return ge(a, o), ae(a, o, "offset"), e(n, () => n(r)) || Is(a), e(s, () => s(r)) || ks(a), i(r, a), a;
}, Qt = (i, e) => (i.connect = e.connect.bind(e), i.disconnect = e.disconnect.bind(e), i), Hc = (i, e, t, n) => (s, { offset: r, ...o }) => {
  const a = s.createBuffer(1, 2, 44100), c = e(s, {
    buffer: null,
    channelCount: 2,
    channelCountMode: "max",
    channelInterpretation: "speakers",
    loop: !1,
    loopEnd: 0,
    loopStart: 0,
    playbackRate: 1
  }), l = t(s, { ...o, gain: r }), h = a.getChannelData(0);
  h[0] = 1, h[1] = 1, c.buffer = a, c.loop = !0;
  const u = {
    get bufferSize() {
    },
    get channelCount() {
      return l.channelCount;
    },
    set channelCount(p) {
      l.channelCount = p;
    },
    get channelCountMode() {
      return l.channelCountMode;
    },
    set channelCountMode(p) {
      l.channelCountMode = p;
    },
    get channelInterpretation() {
      return l.channelInterpretation;
    },
    set channelInterpretation(p) {
      l.channelInterpretation = p;
    },
    get context() {
      return l.context;
    },
    get inputs() {
      return [];
    },
    get numberOfInputs() {
      return c.numberOfInputs;
    },
    get numberOfOutputs() {
      return l.numberOfOutputs;
    },
    get offset() {
      return l.gain;
    },
    get onended() {
      return c.onended;
    },
    set onended(p) {
      c.onended = p;
    },
    addEventListener(...p) {
      return c.addEventListener(p[0], p[1], p[2]);
    },
    dispatchEvent(...p) {
      return c.dispatchEvent(p[0]);
    },
    removeEventListener(...p) {
      return c.removeEventListener(p[0], p[1], p[2]);
    },
    start(p = 0) {
      c.start.call(c, p);
    },
    stop(p = 0) {
      c.stop.call(c, p);
    }
  }, d = () => c.connect(l), f = () => c.disconnect(l);
  return i(s, c), n(Qt(u, l), d, f);
}, Qc = (i, e) => (t, n) => {
  const s = t.createConvolver();
  if (ge(s, n), n.disableNormalization === s.normalize && (s.normalize = !n.disableNormalization), se(s, n, "buffer"), n.channelCount > 2 || (e(s, "channelCount", (r) => () => r.call(s), (r) => (o) => {
    if (o > 2)
      throw i();
    return r.call(s, o);
  }), n.channelCountMode === "max"))
    throw i();
  return e(s, "channelCountMode", (r) => () => r.call(s), (r) => (o) => {
    if (o === "max")
      throw i();
    return r.call(s, o);
  }), s;
}, er = (i, e) => {
  const t = i.createDelay(e.maxDelayTime);
  return ge(t, e), ae(t, e, "delayTime"), t;
}, Xc = (i) => (e, t) => {
  const n = e.createDynamicsCompressor();
  if (ge(n, t), t.channelCount > 2 || t.channelCountMode === "max")
    throw i();
  return ae(n, t, "attack"), ae(n, t, "knee"), ae(n, t, "ratio"), ae(n, t, "release"), ae(n, t, "threshold"), n;
}, Fe = (i, e) => {
  const t = i.createGain();
  return ge(t, e), ae(t, e, "gain"), t;
}, Yc = (i) => (e, t, n) => {
  if (e.createIIRFilter === void 0)
    return i(e, t, n);
  const s = e.createIIRFilter(n.feedforward, n.feedback);
  return ge(s, n), s;
};
function Zc(i, e) {
  const t = e[0] * e[0] + e[1] * e[1];
  return [(i[0] * e[0] + i[1] * e[1]) / t, (i[1] * e[0] - i[0] * e[1]) / t];
}
function Jc(i, e) {
  return [i[0] * e[0] - i[1] * e[1], i[0] * e[1] + i[1] * e[0]];
}
function Ai(i, e) {
  let t = [0, 0];
  for (let n = i.length - 1; n >= 0; n -= 1)
    t = Jc(t, e), t[0] += i[n];
  return t;
}
const Kc = (i, e, t, n) => (s, r, { channelCount: o, channelCountMode: a, channelInterpretation: c, feedback: l, feedforward: h }) => {
  const u = Ji(r, s.sampleRate), d = l instanceof Float64Array ? l : new Float64Array(l), f = h instanceof Float64Array ? h : new Float64Array(h), p = d.length, m = f.length, g = Math.min(p, m);
  if (p === 0 || p > 20)
    throw n();
  if (d[0] === 0)
    throw e();
  if (m === 0 || m > 20)
    throw n();
  if (f[0] === 0)
    throw e();
  if (d[0] !== 1) {
    for (let y = 0; y < m; y += 1)
      f[y] /= d[0];
    for (let y = 1; y < p; y += 1)
      d[y] /= d[0];
  }
  const _ = t(s, u, o, o);
  _.channelCount = o, _.channelCountMode = a, _.channelInterpretation = c;
  const T = 32, b = [], C = [], v = [];
  for (let y = 0; y < o; y += 1) {
    b.push(0);
    const x = new Float32Array(T), E = new Float32Array(T);
    x.fill(0), E.fill(0), C.push(x), v.push(E);
  }
  _.onaudioprocess = (y) => {
    const x = y.inputBuffer, E = y.outputBuffer, M = x.numberOfChannels;
    for (let A = 0; A < M; A += 1) {
      const I = x.getChannelData(A), N = E.getChannelData(A);
      b[A] = Zi(d, p, f, m, g, C[A], v[A], b[A], T, I, N);
    }
  };
  const S = s.sampleRate / 2;
  return Qt({
    get bufferSize() {
      return u;
    },
    get channelCount() {
      return _.channelCount;
    },
    set channelCount(y) {
      _.channelCount = y;
    },
    get channelCountMode() {
      return _.channelCountMode;
    },
    set channelCountMode(y) {
      _.channelCountMode = y;
    },
    get channelInterpretation() {
      return _.channelInterpretation;
    },
    set channelInterpretation(y) {
      _.channelInterpretation = y;
    },
    get context() {
      return _.context;
    },
    get inputs() {
      return [_];
    },
    get numberOfInputs() {
      return _.numberOfInputs;
    },
    get numberOfOutputs() {
      return _.numberOfOutputs;
    },
    addEventListener(...y) {
      return _.addEventListener(y[0], y[1], y[2]);
    },
    dispatchEvent(...y) {
      return _.dispatchEvent(y[0]);
    },
    getFrequencyResponse(y, x, E) {
      if (y.length !== x.length || x.length !== E.length)
        throw i();
      const M = y.length;
      for (let A = 0; A < M; A += 1) {
        const I = -Math.PI * (y[A] / S), N = [Math.cos(I), Math.sin(I)], R = Ai(f, N), D = Ai(d, N), F = Zc(R, D);
        x[A] = Math.sqrt(F[0] * F[0] + F[1] * F[1]), E[A] = Math.atan2(F[1], F[0]);
      }
    },
    removeEventListener(...y) {
      return _.removeEventListener(y[0], y[1], y[2]);
    }
  }, _);
}, el = (i, e) => i.createMediaElementSource(e.mediaElement), tl = (i, e) => {
  const t = i.createMediaStreamDestination();
  return ge(t, e), t.numberOfOutputs === 1 && Object.defineProperty(t, "numberOfOutputs", { get: () => 0 }), t;
}, nl = (i, { mediaStream: e }) => {
  const t = e.getAudioTracks();
  t.sort((r, o) => r.id < o.id ? -1 : r.id > o.id ? 1 : 0);
  const n = t.slice(0, 1), s = i.createMediaStreamSource(new MediaStream(n));
  return Object.defineProperty(s, "mediaStream", { value: e }), s;
}, sl = (i, e) => (t, { mediaStreamTrack: n }) => {
  if (typeof t.createMediaStreamTrackSource == "function")
    return t.createMediaStreamTrackSource(n);
  const s = new MediaStream([n]), r = t.createMediaStreamSource(s);
  if (n.kind !== "audio")
    throw i();
  if (e(t))
    throw new TypeError();
  return r;
}, il = (i) => i === null ? null : i.hasOwnProperty("OfflineAudioContext") ? i.OfflineAudioContext : i.hasOwnProperty("webkitOfflineAudioContext") ? i.webkitOfflineAudioContext : null, rl = (i, e, t, n, s, r) => (o, a) => {
  const c = o.createOscillator();
  return ge(c, a), ae(c, a, "detune"), ae(c, a, "frequency"), a.periodicWave !== void 0 ? c.setPeriodicWave(a.periodicWave) : se(c, a, "type"), e(t, () => t(o)) || Is(c), e(n, () => n(o)) || r(c, o), e(s, () => s(o)) || ks(c), i(o, c), c;
}, ol = (i) => (e, t) => {
  const n = e.createPanner();
  return n.orientationX === void 0 ? i(e, t) : (ge(n, t), ae(n, t, "orientationX"), ae(n, t, "orientationY"), ae(n, t, "orientationZ"), ae(n, t, "positionX"), ae(n, t, "positionY"), ae(n, t, "positionZ"), se(n, t, "coneInnerAngle"), se(n, t, "coneOuterAngle"), se(n, t, "coneOuterGain"), se(n, t, "distanceModel"), se(n, t, "maxDistance"), se(n, t, "panningModel"), se(n, t, "refDistance"), se(n, t, "rolloffFactor"), n);
}, al = (i, e, t, n, s, r, o, a, c, l) => (h, { coneInnerAngle: u, coneOuterAngle: d, coneOuterGain: f, distanceModel: p, maxDistance: m, orientationX: g, orientationY: _, orientationZ: T, panningModel: b, positionX: C, positionY: v, positionZ: S, refDistance: w, rolloffFactor: y, ...x }) => {
  const E = h.createPanner();
  if (x.channelCount > 2 || x.channelCountMode === "max")
    throw o();
  ge(E, x);
  const M = {
    channelCount: 1,
    channelCountMode: "explicit",
    channelInterpretation: "discrete"
  }, A = t(h, {
    ...M,
    channelInterpretation: "speakers",
    numberOfInputs: 6
  }), I = n(h, { ...x, gain: 1 }), N = n(h, { ...M, gain: 1 }), R = n(h, { ...M, gain: 0 }), D = n(h, { ...M, gain: 0 }), F = n(h, { ...M, gain: 0 }), B = n(h, { ...M, gain: 0 }), P = n(h, { ...M, gain: 0 }), L = s(h, 256, 6, 1), V = r(h, {
    ...M,
    curve: new Float32Array([1, 1]),
    oversample: "none"
  });
  let H = [g, _, T], pe = [C, v, S];
  const me = new Float32Array(1);
  L.onaudioprocess = ({ inputBuffer: O }) => {
    const Re = [
      c(O, me, 0),
      c(O, me, 1),
      c(O, me, 2)
    ];
    Re.some((Pe, Le) => Pe !== H[Le]) && (E.setOrientation(...Re), H = Re);
    const Ee = [
      c(O, me, 3),
      c(O, me, 4),
      c(O, me, 5)
    ];
    Ee.some((Pe, Le) => Pe !== pe[Le]) && (E.setPosition(...Ee), pe = Ee);
  }, Object.defineProperty(R.gain, "defaultValue", { get: () => 0 }), Object.defineProperty(D.gain, "defaultValue", { get: () => 0 }), Object.defineProperty(F.gain, "defaultValue", { get: () => 0 }), Object.defineProperty(B.gain, "defaultValue", { get: () => 0 }), Object.defineProperty(P.gain, "defaultValue", { get: () => 0 });
  const U = {
    get bufferSize() {
    },
    get channelCount() {
      return E.channelCount;
    },
    set channelCount(O) {
      if (O > 2)
        throw o();
      I.channelCount = O, E.channelCount = O;
    },
    get channelCountMode() {
      return E.channelCountMode;
    },
    set channelCountMode(O) {
      if (O === "max")
        throw o();
      I.channelCountMode = O, E.channelCountMode = O;
    },
    get channelInterpretation() {
      return E.channelInterpretation;
    },
    set channelInterpretation(O) {
      I.channelInterpretation = O, E.channelInterpretation = O;
    },
    get coneInnerAngle() {
      return E.coneInnerAngle;
    },
    set coneInnerAngle(O) {
      E.coneInnerAngle = O;
    },
    get coneOuterAngle() {
      return E.coneOuterAngle;
    },
    set coneOuterAngle(O) {
      E.coneOuterAngle = O;
    },
    get coneOuterGain() {
      return E.coneOuterGain;
    },
    set coneOuterGain(O) {
      if (O < 0 || O > 1)
        throw e();
      E.coneOuterGain = O;
    },
    get context() {
      return E.context;
    },
    get distanceModel() {
      return E.distanceModel;
    },
    set distanceModel(O) {
      E.distanceModel = O;
    },
    get inputs() {
      return [I];
    },
    get maxDistance() {
      return E.maxDistance;
    },
    set maxDistance(O) {
      if (O < 0)
        throw new RangeError();
      E.maxDistance = O;
    },
    get numberOfInputs() {
      return E.numberOfInputs;
    },
    get numberOfOutputs() {
      return E.numberOfOutputs;
    },
    get orientationX() {
      return N.gain;
    },
    get orientationY() {
      return R.gain;
    },
    get orientationZ() {
      return D.gain;
    },
    get panningModel() {
      return E.panningModel;
    },
    set panningModel(O) {
      E.panningModel = O;
    },
    get positionX() {
      return F.gain;
    },
    get positionY() {
      return B.gain;
    },
    get positionZ() {
      return P.gain;
    },
    get refDistance() {
      return E.refDistance;
    },
    set refDistance(O) {
      if (O < 0)
        throw new RangeError();
      E.refDistance = O;
    },
    get rolloffFactor() {
      return E.rolloffFactor;
    },
    set rolloffFactor(O) {
      if (O < 0)
        throw new RangeError();
      E.rolloffFactor = O;
    },
    addEventListener(...O) {
      return I.addEventListener(O[0], O[1], O[2]);
    },
    dispatchEvent(...O) {
      return I.dispatchEvent(O[0]);
    },
    removeEventListener(...O) {
      return I.removeEventListener(O[0], O[1], O[2]);
    }
  };
  u !== U.coneInnerAngle && (U.coneInnerAngle = u), d !== U.coneOuterAngle && (U.coneOuterAngle = d), f !== U.coneOuterGain && (U.coneOuterGain = f), p !== U.distanceModel && (U.distanceModel = p), m !== U.maxDistance && (U.maxDistance = m), g !== U.orientationX.value && (U.orientationX.value = g), _ !== U.orientationY.value && (U.orientationY.value = _), T !== U.orientationZ.value && (U.orientationZ.value = T), b !== U.panningModel && (U.panningModel = b), C !== U.positionX.value && (U.positionX.value = C), v !== U.positionY.value && (U.positionY.value = v), S !== U.positionZ.value && (U.positionZ.value = S), w !== U.refDistance && (U.refDistance = w), y !== U.rolloffFactor && (U.rolloffFactor = y), (H[0] !== 1 || H[1] !== 0 || H[2] !== 0) && E.setOrientation(...H), (pe[0] !== 0 || pe[1] !== 0 || pe[2] !== 0) && E.setPosition(...pe);
  const Q = () => {
    I.connect(E), i(I, V, 0, 0), V.connect(N).connect(A, 0, 0), V.connect(R).connect(A, 0, 1), V.connect(D).connect(A, 0, 2), V.connect(F).connect(A, 0, 3), V.connect(B).connect(A, 0, 4), V.connect(P).connect(A, 0, 5), A.connect(L).connect(h.destination);
  }, oe = () => {
    I.disconnect(E), a(I, V, 0, 0), V.disconnect(N), N.disconnect(A), V.disconnect(R), R.disconnect(A), V.disconnect(D), D.disconnect(A), V.disconnect(F), F.disconnect(A), V.disconnect(B), B.disconnect(A), V.disconnect(P), P.disconnect(A), A.disconnect(L), L.disconnect(h.destination);
  };
  return l(Qt(U, E), Q, oe);
}, cl = (i) => (e, { disableNormalization: t, imag: n, real: s }) => {
  const r = n instanceof Float32Array ? n : new Float32Array(n), o = s instanceof Float32Array ? s : new Float32Array(s), a = e.createPeriodicWave(o, r, { disableNormalization: t });
  if (Array.from(n).length < 2)
    throw i();
  return a;
}, pn = (i, e, t, n) => i.createScriptProcessor(e, t, n), ll = (i, e) => (t, n) => {
  const s = n.channelCountMode;
  if (s === "clamped-max")
    throw e();
  if (t.createStereoPanner === void 0)
    return i(t, n);
  const r = t.createStereoPanner();
  return ge(r, n), ae(r, n, "pan"), Object.defineProperty(r, "channelCountMode", {
    get: () => s,
    set: (o) => {
      if (o !== s)
        throw e();
    }
  }), r;
}, hl = (i, e, t, n, s, r) => {
  const a = new Float32Array([1, 1]), c = Math.PI / 2, l = { channelCount: 1, channelCountMode: "explicit", channelInterpretation: "discrete" }, h = { ...l, oversample: "none" }, u = (p, m, g, _) => {
    const T = new Float32Array(16385), b = new Float32Array(16385);
    for (let x = 0; x < 16385; x += 1) {
      const E = x / 16384 * c;
      T[x] = Math.cos(E), b[x] = Math.sin(E);
    }
    const C = t(p, { ...l, gain: 0 }), v = n(p, { ...h, curve: T }), S = n(p, { ...h, curve: a }), w = t(p, { ...l, gain: 0 }), y = n(p, { ...h, curve: b });
    return {
      connectGraph() {
        m.connect(C), m.connect(S.inputs === void 0 ? S : S.inputs[0]), m.connect(w), S.connect(g), g.connect(v.inputs === void 0 ? v : v.inputs[0]), g.connect(y.inputs === void 0 ? y : y.inputs[0]), v.connect(C.gain), y.connect(w.gain), C.connect(_, 0, 0), w.connect(_, 0, 1);
      },
      disconnectGraph() {
        m.disconnect(C), m.disconnect(S.inputs === void 0 ? S : S.inputs[0]), m.disconnect(w), S.disconnect(g), g.disconnect(v.inputs === void 0 ? v : v.inputs[0]), g.disconnect(y.inputs === void 0 ? y : y.inputs[0]), v.disconnect(C.gain), y.disconnect(w.gain), C.disconnect(_, 0, 0), w.disconnect(_, 0, 1);
      }
    };
  }, d = (p, m, g, _) => {
    const T = new Float32Array(16385), b = new Float32Array(16385), C = new Float32Array(16385), v = new Float32Array(16385), S = Math.floor(16385 / 2);
    for (let F = 0; F < 16385; F += 1)
      if (F > S) {
        const B = (F - S) / (16384 - S) * c;
        T[F] = Math.cos(B), b[F] = Math.sin(B), C[F] = 0, v[F] = 1;
      } else {
        const B = F / (16384 - S) * c;
        T[F] = 1, b[F] = 0, C[F] = Math.cos(B), v[F] = Math.sin(B);
      }
    const w = e(p, {
      channelCount: 2,
      channelCountMode: "explicit",
      channelInterpretation: "discrete",
      numberOfOutputs: 2
    }), y = t(p, { ...l, gain: 0 }), x = n(p, {
      ...h,
      curve: T
    }), E = t(p, { ...l, gain: 0 }), M = n(p, {
      ...h,
      curve: b
    }), A = n(p, { ...h, curve: a }), I = t(p, { ...l, gain: 0 }), N = n(p, {
      ...h,
      curve: C
    }), R = t(p, { ...l, gain: 0 }), D = n(p, {
      ...h,
      curve: v
    });
    return {
      connectGraph() {
        m.connect(w), m.connect(A.inputs === void 0 ? A : A.inputs[0]), w.connect(y, 0), w.connect(E, 0), w.connect(I, 1), w.connect(R, 1), A.connect(g), g.connect(x.inputs === void 0 ? x : x.inputs[0]), g.connect(M.inputs === void 0 ? M : M.inputs[0]), g.connect(N.inputs === void 0 ? N : N.inputs[0]), g.connect(D.inputs === void 0 ? D : D.inputs[0]), x.connect(y.gain), M.connect(E.gain), N.connect(I.gain), D.connect(R.gain), y.connect(_, 0, 0), I.connect(_, 0, 0), E.connect(_, 0, 1), R.connect(_, 0, 1);
      },
      disconnectGraph() {
        m.disconnect(w), m.disconnect(A.inputs === void 0 ? A : A.inputs[0]), w.disconnect(y, 0), w.disconnect(E, 0), w.disconnect(I, 1), w.disconnect(R, 1), A.disconnect(g), g.disconnect(x.inputs === void 0 ? x : x.inputs[0]), g.disconnect(M.inputs === void 0 ? M : M.inputs[0]), g.disconnect(N.inputs === void 0 ? N : N.inputs[0]), g.disconnect(D.inputs === void 0 ? D : D.inputs[0]), x.disconnect(y.gain), M.disconnect(E.gain), N.disconnect(I.gain), D.disconnect(R.gain), y.disconnect(_, 0, 0), I.disconnect(_, 0, 0), E.disconnect(_, 0, 1), R.disconnect(_, 0, 1);
      }
    };
  }, f = (p, m, g, _, T) => {
    if (m === 1)
      return u(p, g, _, T);
    if (m === 2)
      return d(p, g, _, T);
    throw s();
  };
  return (p, { channelCount: m, channelCountMode: g, pan: _, ...T }) => {
    if (g === "max")
      throw s();
    const b = i(p, {
      ...T,
      channelCount: 1,
      channelCountMode: g,
      numberOfInputs: 2
    }), C = t(p, { ...T, channelCount: m, channelCountMode: g, gain: 1 }), v = t(p, {
      channelCount: 1,
      channelCountMode: "explicit",
      channelInterpretation: "discrete",
      gain: _
    });
    let { connectGraph: S, disconnectGraph: w } = f(p, m, C, v, b);
    Object.defineProperty(v.gain, "defaultValue", { get: () => 0 }), Object.defineProperty(v.gain, "maxValue", { get: () => 1 }), Object.defineProperty(v.gain, "minValue", { get: () => -1 });
    const y = {
      get bufferSize() {
      },
      get channelCount() {
        return C.channelCount;
      },
      set channelCount(A) {
        C.channelCount !== A && (x && w(), { connectGraph: S, disconnectGraph: w } = f(p, A, C, v, b), x && S()), C.channelCount = A;
      },
      get channelCountMode() {
        return C.channelCountMode;
      },
      set channelCountMode(A) {
        if (A === "clamped-max" || A === "max")
          throw s();
        C.channelCountMode = A;
      },
      get channelInterpretation() {
        return C.channelInterpretation;
      },
      set channelInterpretation(A) {
        C.channelInterpretation = A;
      },
      get context() {
        return C.context;
      },
      get inputs() {
        return [C];
      },
      get numberOfInputs() {
        return C.numberOfInputs;
      },
      get numberOfOutputs() {
        return C.numberOfOutputs;
      },
      get pan() {
        return v.gain;
      },
      addEventListener(...A) {
        return C.addEventListener(A[0], A[1], A[2]);
      },
      dispatchEvent(...A) {
        return C.dispatchEvent(A[0]);
      },
      removeEventListener(...A) {
        return C.removeEventListener(A[0], A[1], A[2]);
      }
    };
    let x = !1;
    const E = () => {
      S(), x = !0;
    }, M = () => {
      w(), x = !1;
    };
    return r(Qt(y, b), E, M);
  };
}, ul = (i, e, t, n, s, r, o) => (a, c) => {
  const l = a.createWaveShaper();
  if (r !== null && r.name === "webkitAudioContext" && a.createGain().gain.automationRate === void 0)
    return t(a, c);
  ge(l, c);
  const h = c.curve === null || c.curve instanceof Float32Array ? c.curve : new Float32Array(c.curve);
  if (h !== null && h.length < 2)
    throw e();
  se(l, { curve: h }, "curve"), se(l, c, "oversample");
  let u = null, d = !1;
  return o(l, "curve", (m) => () => m.call(l), (m) => (g) => (m.call(l, g), d && (n(g) && u === null ? u = i(a, l) : !n(g) && u !== null && (u(), u = null)), g)), s(l, () => {
    d = !0, n(l.curve) && (u = i(a, l));
  }, () => {
    d = !1, u !== null && (u(), u = null);
  });
}, dl = (i, e, t, n, s) => (r, { curve: o, oversample: a, ...c }) => {
  const l = r.createWaveShaper(), h = r.createWaveShaper();
  ge(l, c), ge(h, c);
  const u = t(r, { ...c, gain: 1 }), d = t(r, { ...c, gain: -1 }), f = t(r, { ...c, gain: 1 }), p = t(r, { ...c, gain: -1 });
  let m = null, g = !1, _ = null;
  const T = {
    get bufferSize() {
    },
    get channelCount() {
      return l.channelCount;
    },
    set channelCount(v) {
      u.channelCount = v, d.channelCount = v, l.channelCount = v, f.channelCount = v, h.channelCount = v, p.channelCount = v;
    },
    get channelCountMode() {
      return l.channelCountMode;
    },
    set channelCountMode(v) {
      u.channelCountMode = v, d.channelCountMode = v, l.channelCountMode = v, f.channelCountMode = v, h.channelCountMode = v, p.channelCountMode = v;
    },
    get channelInterpretation() {
      return l.channelInterpretation;
    },
    set channelInterpretation(v) {
      u.channelInterpretation = v, d.channelInterpretation = v, l.channelInterpretation = v, f.channelInterpretation = v, h.channelInterpretation = v, p.channelInterpretation = v;
    },
    get context() {
      return l.context;
    },
    get curve() {
      return _;
    },
    set curve(v) {
      if (v !== null && v.length < 2)
        throw e();
      if (v === null)
        l.curve = v, h.curve = v;
      else {
        const S = v.length, w = new Float32Array(S + 2 - S % 2), y = new Float32Array(S + 2 - S % 2);
        w[0] = v[0], y[0] = -v[S - 1];
        const x = Math.ceil((S + 1) / 2), E = (S + 1) / 2 - 1;
        for (let M = 1; M < x; M += 1) {
          const A = M / x * E, I = Math.floor(A), N = Math.ceil(A);
          w[M] = I === N ? v[I] : (1 - (A - I)) * v[I] + (1 - (N - A)) * v[N], y[M] = I === N ? -v[S - 1 - I] : -((1 - (A - I)) * v[S - 1 - I]) - (1 - (N - A)) * v[S - 1 - N];
        }
        w[x] = S % 2 === 1 ? v[x - 1] : (v[x - 2] + v[x - 1]) / 2, l.curve = w, h.curve = y;
      }
      _ = v, g && (n(_) && m === null ? m = i(r, u) : m !== null && (m(), m = null));
    },
    get inputs() {
      return [u];
    },
    get numberOfInputs() {
      return l.numberOfInputs;
    },
    get numberOfOutputs() {
      return l.numberOfOutputs;
    },
    get oversample() {
      return l.oversample;
    },
    set oversample(v) {
      l.oversample = v, h.oversample = v;
    },
    addEventListener(...v) {
      return u.addEventListener(v[0], v[1], v[2]);
    },
    dispatchEvent(...v) {
      return u.dispatchEvent(v[0]);
    },
    removeEventListener(...v) {
      return u.removeEventListener(v[0], v[1], v[2]);
    }
  };
  o !== null && (T.curve = o instanceof Float32Array ? o : new Float32Array(o)), a !== T.oversample && (T.oversample = a);
  const b = () => {
    u.connect(l).connect(f), u.connect(d).connect(h).connect(p).connect(f), g = !0, n(_) && (m = i(r, u));
  }, C = () => {
    u.disconnect(l), l.disconnect(f), u.disconnect(d), d.disconnect(h), h.disconnect(p), p.disconnect(f), g = !1, m !== null && (m(), m = null);
  };
  return s(Qt(T, f), b, C);
}, Me = () => new DOMException("", "NotSupportedError"), fl = {
  numberOfChannels: 1
}, pl = (i, e, t, n, s) => class extends i {
  constructor(o, a, c) {
    let l;
    if (typeof o == "number" && a !== void 0 && c !== void 0)
      l = { length: a, numberOfChannels: o, sampleRate: c };
    else if (typeof o == "object")
      l = o;
    else
      throw new Error("The given parameters are not valid.");
    const { length: h, numberOfChannels: u, sampleRate: d } = { ...fl, ...l }, f = n(u, h, d);
    e(on, () => on(f)) || f.addEventListener("statechange", /* @__PURE__ */ (() => {
      let p = 0;
      const m = (g) => {
        this._state === "running" && (p > 0 ? (f.removeEventListener("statechange", m), g.stopImmediatePropagation(), this._waitForThePromiseToSettle(g)) : p += 1);
      };
      return m;
    })()), super(f, u), this._length = h, this._nativeOfflineAudioContext = f, this._state = null;
  }
  get length() {
    return this._nativeOfflineAudioContext.length === void 0 ? this._length : this._nativeOfflineAudioContext.length;
  }
  get state() {
    return this._state === null ? this._nativeOfflineAudioContext.state : this._state;
  }
  startRendering() {
    return this._state === "running" ? Promise.reject(t()) : (this._state = "running", s(this.destination, this._nativeOfflineAudioContext).finally(() => {
      this._state = null, ji(this);
    }));
  }
  _waitForThePromiseToSettle(o) {
    this._state === null ? this._nativeOfflineAudioContext.dispatchEvent(o) : setTimeout(() => this._waitForThePromiseToSettle(o));
  }
}, ml = {
  channelCount: 2,
  channelCountMode: "max",
  // This attribute has no effect for nodes with no inputs.
  channelInterpretation: "speakers",
  // This attribute has no effect for nodes with no inputs.
  detune: 0,
  frequency: 440,
  periodicWave: void 0,
  type: "sine"
}, gl = (i, e, t, n, s, r, o) => class extends i {
  constructor(c, l) {
    const h = s(c), u = { ...ml, ...l }, d = t(h, u), f = r(h), p = f ? n() : null, m = c.sampleRate / 2;
    super(c, !1, d, p), this._detune = e(this, f, d.detune, 153600, -153600), this._frequency = e(this, f, d.frequency, m, -m), this._nativeOscillatorNode = d, this._onended = null, this._oscillatorNodeRenderer = p, this._oscillatorNodeRenderer !== null && u.periodicWave !== void 0 && (this._oscillatorNodeRenderer.periodicWave = u.periodicWave);
  }
  get detune() {
    return this._detune;
  }
  get frequency() {
    return this._frequency;
  }
  get onended() {
    return this._onended;
  }
  set onended(c) {
    const l = typeof c == "function" ? o(this, c) : null;
    this._nativeOscillatorNode.onended = l;
    const h = this._nativeOscillatorNode.onended;
    this._onended = h !== null && h === l ? c : h;
  }
  get type() {
    return this._nativeOscillatorNode.type;
  }
  set type(c) {
    this._nativeOscillatorNode.type = c, this._oscillatorNodeRenderer !== null && (this._oscillatorNodeRenderer.periodicWave = null);
  }
  setPeriodicWave(c) {
    this._nativeOscillatorNode.setPeriodicWave(c), this._oscillatorNodeRenderer !== null && (this._oscillatorNodeRenderer.periodicWave = c);
  }
  start(c = 0) {
    if (this._nativeOscillatorNode.start(c), this._oscillatorNodeRenderer !== null && (this._oscillatorNodeRenderer.start = c), this.context.state !== "closed") {
      Bt(this);
      const l = () => {
        this._nativeOscillatorNode.removeEventListener("ended", l), at(this) && hn(this);
      };
      this._nativeOscillatorNode.addEventListener("ended", l);
    }
  }
  stop(c = 0) {
    this._nativeOscillatorNode.stop(c), this._oscillatorNodeRenderer !== null && (this._oscillatorNodeRenderer.stop = c);
  }
}, _l = (i, e, t, n, s) => () => {
  const r = /* @__PURE__ */ new WeakMap();
  let o = null, a = null, c = null;
  const l = async (h, u) => {
    let d = t(h);
    const f = Te(d, u);
    if (!f) {
      const p = {
        channelCount: d.channelCount,
        channelCountMode: d.channelCountMode,
        channelInterpretation: d.channelInterpretation,
        detune: d.detune.value,
        frequency: d.frequency.value,
        periodicWave: o === null ? void 0 : o,
        type: d.type
      };
      d = e(u, p), a !== null && d.start(a), c !== null && d.stop(c);
    }
    return r.set(u, d), f ? (await i(u, h.detune, d.detune), await i(u, h.frequency, d.frequency)) : (await n(u, h.detune, d.detune), await n(u, h.frequency, d.frequency)), await s(h, u, d), d;
  };
  return {
    set periodicWave(h) {
      o = h;
    },
    set start(h) {
      a = h;
    },
    set stop(h) {
      c = h;
    },
    render(h, u) {
      const d = r.get(u);
      return d !== void 0 ? Promise.resolve(d) : l(h, u);
    }
  };
}, vl = {
  channelCount: 2,
  channelCountMode: "clamped-max",
  channelInterpretation: "speakers",
  coneInnerAngle: 360,
  coneOuterAngle: 360,
  coneOuterGain: 0,
  distanceModel: "inverse",
  maxDistance: 1e4,
  orientationX: 1,
  orientationY: 0,
  orientationZ: 0,
  panningModel: "equalpower",
  positionX: 0,
  positionY: 0,
  positionZ: 0,
  refDistance: 1,
  rolloffFactor: 1
}, yl = (i, e, t, n, s, r, o) => class extends i {
  constructor(c, l) {
    const h = s(c), u = { ...vl, ...l }, d = t(h, u), f = r(h), p = f ? n() : null;
    super(c, !1, d, p), this._nativePannerNode = d, this._orientationX = e(this, f, d.orientationX, be, Ie), this._orientationY = e(this, f, d.orientationY, be, Ie), this._orientationZ = e(this, f, d.orientationZ, be, Ie), this._positionX = e(this, f, d.positionX, be, Ie), this._positionY = e(this, f, d.positionY, be, Ie), this._positionZ = e(this, f, d.positionZ, be, Ie), o(this, 1);
  }
  get coneInnerAngle() {
    return this._nativePannerNode.coneInnerAngle;
  }
  set coneInnerAngle(c) {
    this._nativePannerNode.coneInnerAngle = c;
  }
  get coneOuterAngle() {
    return this._nativePannerNode.coneOuterAngle;
  }
  set coneOuterAngle(c) {
    this._nativePannerNode.coneOuterAngle = c;
  }
  get coneOuterGain() {
    return this._nativePannerNode.coneOuterGain;
  }
  set coneOuterGain(c) {
    this._nativePannerNode.coneOuterGain = c;
  }
  get distanceModel() {
    return this._nativePannerNode.distanceModel;
  }
  set distanceModel(c) {
    this._nativePannerNode.distanceModel = c;
  }
  get maxDistance() {
    return this._nativePannerNode.maxDistance;
  }
  set maxDistance(c) {
    this._nativePannerNode.maxDistance = c;
  }
  get orientationX() {
    return this._orientationX;
  }
  get orientationY() {
    return this._orientationY;
  }
  get orientationZ() {
    return this._orientationZ;
  }
  get panningModel() {
    return this._nativePannerNode.panningModel;
  }
  set panningModel(c) {
    this._nativePannerNode.panningModel = c;
  }
  get positionX() {
    return this._positionX;
  }
  get positionY() {
    return this._positionY;
  }
  get positionZ() {
    return this._positionZ;
  }
  get refDistance() {
    return this._nativePannerNode.refDistance;
  }
  set refDistance(c) {
    this._nativePannerNode.refDistance = c;
  }
  get rolloffFactor() {
    return this._nativePannerNode.rolloffFactor;
  }
  set rolloffFactor(c) {
    this._nativePannerNode.rolloffFactor = c;
  }
}, Sl = (i, e, t, n, s, r, o, a, c, l) => () => {
  const h = /* @__PURE__ */ new WeakMap();
  let u = null;
  const d = async (f, p) => {
    let m = null, g = r(f);
    const _ = {
      channelCount: g.channelCount,
      channelCountMode: g.channelCountMode,
      channelInterpretation: g.channelInterpretation
    }, T = {
      ..._,
      coneInnerAngle: g.coneInnerAngle,
      coneOuterAngle: g.coneOuterAngle,
      coneOuterGain: g.coneOuterGain,
      distanceModel: g.distanceModel,
      maxDistance: g.maxDistance,
      panningModel: g.panningModel,
      refDistance: g.refDistance,
      rolloffFactor: g.rolloffFactor
    }, b = Te(g, p);
    if ("bufferSize" in g)
      m = n(p, { ..._, gain: 1 });
    else if (!b) {
      const C = {
        ...T,
        orientationX: g.orientationX.value,
        orientationY: g.orientationY.value,
        orientationZ: g.orientationZ.value,
        positionX: g.positionX.value,
        positionY: g.positionY.value,
        positionZ: g.positionZ.value
      };
      g = s(p, C);
    }
    if (h.set(p, m === null ? g : m), m !== null) {
      if (u === null) {
        if (o === null)
          throw new Error("Missing the native OfflineAudioContext constructor.");
        const M = new o(
          6,
          // Bug #17: Safari does not yet expose the length.
          f.context.length,
          p.sampleRate
        ), A = e(M, {
          channelCount: 1,
          channelCountMode: "explicit",
          channelInterpretation: "speakers",
          numberOfInputs: 6
        });
        A.connect(M.destination), u = (async () => {
          const I = await Promise.all([
            f.orientationX,
            f.orientationY,
            f.orientationZ,
            f.positionX,
            f.positionY,
            f.positionZ
          ].map(async (N, R) => {
            const D = t(M, {
              channelCount: 1,
              channelCountMode: "explicit",
              channelInterpretation: "discrete",
              offset: R === 0 ? 1 : 0
            });
            return await a(M, N, D.offset), D;
          }));
          for (let N = 0; N < 6; N += 1)
            I[N].connect(A, 0, N), I[N].start(0);
          return l(M);
        })();
      }
      const C = await u, v = n(p, { ..._, gain: 1 });
      await c(f, p, v);
      const S = [];
      for (let M = 0; M < C.numberOfChannels; M += 1)
        S.push(C.getChannelData(M));
      let w = [S[0][0], S[1][0], S[2][0]], y = [S[3][0], S[4][0], S[5][0]], x = n(p, { ..._, gain: 1 }), E = s(p, {
        ...T,
        orientationX: w[0],
        orientationY: w[1],
        orientationZ: w[2],
        positionX: y[0],
        positionY: y[1],
        positionZ: y[2]
      });
      v.connect(x).connect(E.inputs[0]), E.connect(m);
      for (let M = 128; M < C.length; M += 128) {
        const A = [S[0][M], S[1][M], S[2][M]], I = [S[3][M], S[4][M], S[5][M]];
        if (A.some((N, R) => N !== w[R]) || I.some((N, R) => N !== y[R])) {
          w = A, y = I;
          const N = M / p.sampleRate;
          x.gain.setValueAtTime(0, N), x = n(p, { ..._, gain: 0 }), E = s(p, {
            ...T,
            orientationX: w[0],
            orientationY: w[1],
            orientationZ: w[2],
            positionX: y[0],
            positionY: y[1],
            positionZ: y[2]
          }), x.gain.setValueAtTime(1, N), v.connect(x).connect(E.inputs[0]), E.connect(m);
        }
      }
      return m;
    }
    return b ? (await i(p, f.orientationX, g.orientationX), await i(p, f.orientationY, g.orientationY), await i(p, f.orientationZ, g.orientationZ), await i(p, f.positionX, g.positionX), await i(p, f.positionY, g.positionY), await i(p, f.positionZ, g.positionZ)) : (await a(p, f.orientationX, g.orientationX), await a(p, f.orientationY, g.orientationY), await a(p, f.orientationZ, g.orientationZ), await a(p, f.positionX, g.positionX), await a(p, f.positionY, g.positionY), await a(p, f.positionZ, g.positionZ)), Ht(g) ? await c(f, p, g.inputs[0]) : await c(f, p, g), g;
  };
  return {
    render(f, p) {
      const m = h.get(p);
      return m !== void 0 ? Promise.resolve(m) : d(f, p);
    }
  };
}, Cl = {
  disableNormalization: !1
}, Tl = (i, e, t, n) => class tr {
  constructor(r, o) {
    const a = e(r), c = n({ ...Cl, ...o }), l = i(a, c);
    return t.add(l), l;
  }
  static [Symbol.hasInstance](r) {
    return r !== null && typeof r == "object" && Object.getPrototypeOf(r) === tr.prototype || t.has(r);
  }
}, wl = (i, e) => (t, n, s) => (i(n).replay(s), e(n, t, s)), bl = (i, e, t) => async (n, s, r) => {
  const o = i(n);
  await Promise.all(o.activeInputs.map((a, c) => Array.from(a).map(async ([l, h]) => {
    const d = await e(l).render(l, s), f = n.context.destination;
    !t(l) && (n !== f || !t(n)) && d.connect(r, h, c);
  })).reduce((a, c) => [...a, ...c], []));
}, Al = (i, e, t) => async (n, s, r) => {
  const o = e(n);
  await Promise.all(Array.from(o.activeInputs).map(async ([a, c]) => {
    const h = await i(a).render(a, s);
    t(a) || h.connect(r, c);
  }));
}, Ml = (i, e, t, n) => (s) => i(on, () => on(s)) ? Promise.resolve(i(n, n)).then((r) => {
  if (!r) {
    const o = t(s, 512, 0, 1);
    s.oncomplete = () => {
      o.onaudioprocess = null, o.disconnect();
    }, o.onaudioprocess = () => s.currentTime, o.connect(s.destination);
  }
  return s.startRendering();
}) : new Promise((r) => {
  const o = e(s, {
    channelCount: 1,
    channelCountMode: "explicit",
    channelInterpretation: "discrete",
    gain: 0
  });
  s.oncomplete = (a) => {
    o.disconnect(), r(a.renderedBuffer);
  }, o.connect(s.destination), s.startRendering();
}), El = (i) => (e, t) => {
  i.set(e, t);
}, xl = (i) => (e, t) => i.set(e, t), Nl = (i, e, t, n, s, r, o, a) => (c, l) => t(c).render(c, l).then(() => Promise.all(Array.from(n(l)).map((h) => t(h).render(h, l)))).then(() => s(l)).then((h) => (typeof h.copyFromChannel != "function" ? (o(h), Es(h)) : e(r, () => r(h)) || a(h), i.add(h), h)), Il = {
  channelCount: 2,
  /*
   * Bug #105: The channelCountMode should be 'clamped-max' according to the spec but is set to 'explicit' to achieve consistent
   * behavior.
   */
  channelCountMode: "explicit",
  channelInterpretation: "speakers",
  pan: 0
}, kl = (i, e, t, n, s, r) => class extends i {
  constructor(a, c) {
    const l = s(a), h = { ...Il, ...c }, u = t(l, h), d = r(l), f = d ? n() : null;
    super(a, !1, u, f), this._pan = e(this, d, u.pan);
  }
  get pan() {
    return this._pan;
  }
}, Dl = (i, e, t, n, s) => () => {
  const r = /* @__PURE__ */ new WeakMap(), o = async (a, c) => {
    let l = t(a);
    const h = Te(l, c);
    if (!h) {
      const u = {
        channelCount: l.channelCount,
        channelCountMode: l.channelCountMode,
        channelInterpretation: l.channelInterpretation,
        pan: l.pan.value
      };
      l = e(c, u);
    }
    return r.set(c, l), h ? await i(c, a.pan, l.pan) : await n(c, a.pan, l.pan), Ht(l) ? await s(a, c, l.inputs[0]) : await s(a, c, l), l;
  };
  return {
    render(a, c) {
      const l = r.get(c);
      return l !== void 0 ? Promise.resolve(l) : o(a, c);
    }
  };
}, Fl = (i) => () => {
  if (i === null)
    return !1;
  try {
    new i({ length: 1, sampleRate: 44100 });
  } catch {
    return !1;
  }
  return !0;
}, Ol = (i, e) => async () => {
  if (i === null)
    return !0;
  if (e === null)
    return !1;
  const t = new Blob(['class A extends AudioWorkletProcessor{process(i){this.port.postMessage(i,[i[0][0].buffer])}}registerProcessor("a",A)'], {
    type: "application/javascript; charset=utf-8"
  }), n = new e(1, 128, 44100), s = URL.createObjectURL(t);
  let r = !1, o = !1;
  try {
    await n.audioWorklet.addModule(s);
    const a = new i(n, "a", { numberOfOutputs: 0 }), c = n.createOscillator();
    a.port.onmessage = () => r = !0, a.onprocessorerror = () => o = !0, c.connect(a), c.start(0), await n.startRendering(), await new Promise((l) => setTimeout(l));
  } catch {
  } finally {
    URL.revokeObjectURL(s);
  }
  return r && !o;
}, Rl = (i, e) => () => {
  if (e === null)
    return Promise.resolve(!1);
  const t = new e(1, 1, 44100), n = i(t, {
    channelCount: 1,
    channelCountMode: "explicit",
    channelInterpretation: "discrete",
    gain: 0
  });
  return new Promise((s) => {
    t.oncomplete = () => {
      n.disconnect(), s(t.currentTime !== 0);
    }, t.startRendering();
  });
}, Pl = () => new DOMException("", "UnknownError"), ql = {
  channelCount: 2,
  channelCountMode: "max",
  channelInterpretation: "speakers",
  curve: null,
  oversample: "none"
}, Vl = (i, e, t, n, s, r, o) => class extends i {
  constructor(c, l) {
    const h = s(c), u = { ...ql, ...l }, d = t(h, u), p = r(h) ? n() : null;
    super(c, !0, d, p), this._isCurveNullified = !1, this._nativeWaveShaperNode = d, o(this, 1);
  }
  get curve() {
    return this._isCurveNullified ? null : this._nativeWaveShaperNode.curve;
  }
  set curve(c) {
    if (c === null)
      this._isCurveNullified = !0, this._nativeWaveShaperNode.curve = new Float32Array([0, 0]);
    else {
      if (c.length < 2)
        throw e();
      this._isCurveNullified = !1, this._nativeWaveShaperNode.curve = c;
    }
  }
  get oversample() {
    return this._nativeWaveShaperNode.oversample;
  }
  set oversample(c) {
    this._nativeWaveShaperNode.oversample = c;
  }
}, Ll = (i, e, t) => () => {
  const n = /* @__PURE__ */ new WeakMap(), s = async (r, o) => {
    let a = e(r);
    if (!Te(a, o)) {
      const l = {
        channelCount: a.channelCount,
        channelCountMode: a.channelCountMode,
        channelInterpretation: a.channelInterpretation,
        curve: a.curve,
        oversample: a.oversample
      };
      a = i(o, l);
    }
    return n.set(o, a), Ht(a) ? await t(r, o, a.inputs[0]) : await t(r, o, a), a;
  };
  return {
    render(r, o) {
      const a = n.get(o);
      return a !== void 0 ? Promise.resolve(a) : s(r, o);
    }
  };
}, Bl = () => typeof window > "u" ? null : window, Ul = (i, e) => (t) => {
  t.copyFromChannel = (n, s, r = 0) => {
    const o = i(r), a = i(s);
    if (a >= t.numberOfChannels)
      throw e();
    const c = t.length, l = t.getChannelData(a), h = n.length;
    for (let u = o < 0 ? -o : 0; u + o < c && u < h; u += 1)
      n[u] = l[u + o];
  }, t.copyToChannel = (n, s, r = 0) => {
    const o = i(r), a = i(s);
    if (a >= t.numberOfChannels)
      throw e();
    const c = t.length, l = t.getChannelData(a), h = n.length;
    for (let u = o < 0 ? -o : 0; u + o < c && u < h; u += 1)
      l[u + o] = n[u];
  };
}, zl = (i) => (e) => {
  e.copyFromChannel = /* @__PURE__ */ ((t) => (n, s, r = 0) => {
    const o = i(r), a = i(s);
    if (o < e.length)
      return t.call(e, n, a, o);
  })(e.copyFromChannel), e.copyToChannel = /* @__PURE__ */ ((t) => (n, s, r = 0) => {
    const o = i(r), a = i(s);
    if (o < e.length)
      return t.call(e, n, a, o);
  })(e.copyToChannel);
}, Wl = (i) => (e, t) => {
  const n = t.createBuffer(1, 1, 44100);
  e.buffer === null && (e.buffer = n), i(e, "buffer", (s) => () => {
    const r = s.call(e);
    return r === n ? null : r;
  }, (s) => (r) => s.call(e, r === null ? n : r));
}, $l = (i, e) => (t, n) => {
  n.channelCount = 1, n.channelCountMode = "explicit", Object.defineProperty(n, "channelCount", {
    get: () => 1,
    set: () => {
      throw i();
    }
  }), Object.defineProperty(n, "channelCountMode", {
    get: () => "explicit",
    set: () => {
      throw i();
    }
  });
  const s = t.createBufferSource();
  e(n, () => {
    const a = n.numberOfInputs;
    for (let c = 0; c < a; c += 1)
      s.connect(n, 0, c);
  }, () => s.disconnect(n));
}, nr = (i, e, t) => i.copyFromChannel === void 0 ? i.getChannelData(t)[0] : (i.copyFromChannel(e, t), e[0]), sr = (i) => {
  if (i === null)
    return !1;
  const e = i.length;
  return e % 2 !== 0 ? i[Math.floor(e / 2)] !== 0 : i[e / 2 - 1] + i[e / 2] !== 0;
}, mn = (i, e, t, n) => {
  let s = i;
  for (; !s.hasOwnProperty(e); )
    s = Object.getPrototypeOf(s);
  const { get: r, set: o } = Object.getOwnPropertyDescriptor(s, e);
  Object.defineProperty(i, e, { get: t(r), set: n(o) });
}, jl = (i) => ({
  ...i,
  outputChannelCount: i.outputChannelCount !== void 0 ? i.outputChannelCount : i.numberOfInputs === 1 && i.numberOfOutputs === 1 ? (
    /*
     * Bug #61: This should be the computedNumberOfChannels, but unfortunately that is almost impossible to fake. That's why
     * the channelCountMode is required to be 'explicit' as long as there is not a native implementation in every browser. That
     * makes sure the computedNumberOfChannels is equivilant to the channelCount which makes it much easier to compute.
     */
    [i.channelCount]
  ) : Array.from({ length: i.numberOfOutputs }, () => 1)
}), Gl = (i) => ({ ...i, channelCount: i.numberOfOutputs }), Hl = (i) => {
  const { imag: e, real: t } = i;
  return e === void 0 ? t === void 0 ? { ...i, imag: [0, 0], real: [0, 0] } : { ...i, imag: Array.from(t, () => 0), real: t } : t === void 0 ? { ...i, imag: e, real: Array.from(e, () => 0) } : { ...i, imag: e, real: t };
}, ir = (i, e, t) => {
  try {
    i.setValueAtTime(e, t);
  } catch (n) {
    if (n.code !== 9)
      throw n;
    ir(i, e, t + 1e-7);
  }
}, Ql = (i) => {
  const e = i.createBufferSource();
  e.start();
  try {
    e.start();
  } catch {
    return !0;
  }
  return !1;
}, Xl = (i) => {
  const e = i.createBufferSource(), t = i.createBuffer(1, 1, 44100);
  e.buffer = t;
  try {
    e.start(0, 1);
  } catch {
    return !1;
  }
  return !0;
}, Yl = (i) => {
  const e = i.createBufferSource();
  e.start();
  try {
    e.stop();
  } catch {
    return !1;
  }
  return !0;
}, Ds = (i) => {
  const e = i.createOscillator();
  try {
    e.start(-1);
  } catch (t) {
    return t instanceof RangeError;
  }
  return !1;
}, rr = (i) => {
  const e = i.createBuffer(1, 1, 44100), t = i.createBufferSource();
  t.buffer = e, t.start(), t.stop();
  try {
    return t.stop(), !0;
  } catch {
    return !1;
  }
}, Fs = (i) => {
  const e = i.createOscillator();
  try {
    e.stop(-1);
  } catch (t) {
    return t instanceof RangeError;
  }
  return !1;
}, Zl = (i) => {
  const { port1: e, port2: t } = new MessageChannel();
  try {
    e.postMessage(i);
  } finally {
    e.close(), t.close();
  }
}, Jl = (i) => {
  i.start = /* @__PURE__ */ ((e) => (t = 0, n = 0, s) => {
    const r = i.buffer, o = r === null ? n : Math.min(r.duration, n);
    r !== null && o > r.duration - 0.5 / i.context.sampleRate ? e.call(i, t, 0, 0) : e.call(i, t, o, s);
  })(i.start);
}, or = (i, e) => {
  const t = e.createGain();
  i.connect(t);
  const n = /* @__PURE__ */ ((s) => () => {
    s.call(i, t), i.removeEventListener("ended", n);
  })(i.disconnect);
  i.addEventListener("ended", n), Qt(i, t), i.stop = /* @__PURE__ */ ((s) => {
    let r = !1;
    return (o = 0) => {
      if (r)
        try {
          s.call(i, o);
        } catch {
          t.gain.setValueAtTime(0, o);
        }
      else
        s.call(i, o), r = !0;
    };
  })(i.stop);
}, Xt = (i, e) => (t) => {
  const n = { value: i };
  return Object.defineProperties(t, {
    currentTarget: n,
    target: n
  }), typeof e == "function" ? e.call(i, t) : e.handleEvent.call(i, t);
}, Kl = yo(Nt), eh = Ao(Nt), th = qa($n), ar = /* @__PURE__ */ new WeakMap(), nh = tc(ar), Xe = fa(/* @__PURE__ */ new Map(), /* @__PURE__ */ new WeakMap()), et = Bl(), cr = kc(Xe, tt), Os = ec(Ae), ye = bl(Ae, Os, Mt), sh = Io(cr, ne, ye), K = ic(Wn), lt = il(et), Y = Cc(lt), lr = /* @__PURE__ */ new WeakMap(), hr = Ha(Xt), gn = Rc(et), Rs = _c(gn), Ps = vc(et), ur = yc(et), an = qc(et), he = ta(So(Vi), bo(Kl, eh, Fn, th, On, Ae, nh, ln, ne, Nt, at, Mt, En), Xe, dc(ms, On, Ae, ne, rn, at), tt, jn, Me, Fa(Fn, ms, Ae, ne, rn, K, at, Y), Ba(lr, Ae, Qe), hr, K, Rs, Ps, ur, Y, an), ih = No(he, sh, tt, cr, K, Y), qs = /* @__PURE__ */ new WeakSet(), Mi = Dc(et), dr = Ma(new Uint32Array(1)), Vs = Ul(dr, tt), Ls = zl(dr), fr = Do(qs, Xe, Me, Mi, lt, Fl(Mi), Vs, Ls), Gn = Mo(Fe), pr = Al(Os, un, Mt), nt = Sa(pr), Yt = Oc(Gn, Xe, Ql, Xl, Yl, Ds, rr, Fs, Jl, Wl(mn), or), st = wl(nc(un), pr), rh = Ro(nt, Yt, ne, st, ye), Ye = na(Co(Li), lr, Ms, sa, fo, po, mo, go, _o, ds, Pi, gn, ir), oh = Oo(he, rh, Ye, _e, Yt, K, Y, Xt), ah = $o(he, jo, tt, _e, Pc(Fe, mn), K, Y, ye), ch = da(nt, Ki, ne, st, ye), It = xl(ar), lh = ua(he, Ye, ch, jn, Ki, K, Y, It), yt = Nc(Nt, Ps), hh = $l(_e, yt), St = $c(gn, hh), uh = ga(St, ne, ye), dh = ma(he, uh, St, K, Y), fh = ya(fn, ne, ye), ph = va(he, fh, fn, K, Y, Gl), mh = Hc(Gn, Yt, Fe, yt), Zt = Gc(Gn, Xe, mh, Ds, Fs), gh = Aa(nt, Zt, ne, st, ye), _h = ba(he, Ye, gh, Zt, K, Y, Xt), mr = Qc(Me, mn), vh = Na(mr, ne, ye), yh = xa(he, vh, mr, K, Y, It), Sh = Pa(nt, er, ne, st, ye), Ch = Ra(he, Ye, Sh, er, K, Y, It), gr = Xc(Me), Th = $a(nt, gr, ne, st, ye), wh = Wa(he, Ye, Th, gr, Me, K, Y, It), bh = Ja(nt, Fe, ne, st, ye), Ah = Za(he, Ye, bh, Fe, K, Y), Mh = Kc(jn, _e, pn, Me), Hn = Ml(Xe, Fe, pn, Rl(Fe, lt)), Eh = uc(Yt, ne, lt, ye, Hn), xh = Yc(Mh), Nh = lc(he, xh, Eh, K, Y, It), Ih = Go(Ye, St, Zt, pn, Me, nr, Y, mn), _r = /* @__PURE__ */ new WeakMap(), kh = xc(ah, Ih, hr, Y, _r, Xt), vr = rl(Gn, Xe, Ds, rr, Fs, or), Dh = _l(nt, vr, ne, st, ye), Fh = gl(he, Ye, vr, Dh, K, Y, Xt), yr = Ta(Yt), Oh = dl(yr, _e, Fe, sr, yt), Qn = ul(yr, _e, Oh, sr, yt, gn, mn), Rh = al(Fn, _e, St, Fe, pn, Qn, Me, On, nr, yt), Sr = ol(Rh), Ph = Sl(nt, St, Zt, Fe, Sr, ne, lt, st, ye, Hn), qh = yl(he, Ye, Sr, Ph, K, Y, It), Vh = cl(tt), Lh = Tl(Vh, K, /* @__PURE__ */ new WeakSet(), Hl), Bh = hl(St, fn, Fe, Qn, Me, yt), Cr = ll(Bh, Me), Uh = Dl(nt, Cr, ne, st, ye), zh = kl(he, Ye, Cr, Uh, K, Y), Wh = Ll(Qn, ne, ye), $h = Vl(he, _e, Qn, Wh, K, Y, It), Tr = Tc(et), Bs = Qa(et), wr = /* @__PURE__ */ new WeakMap(), jh = rc(wr, lt), Gh = Tr ? wo(
  Xe,
  Me,
  Ga(et),
  Bs,
  Xa(vo),
  K,
  jh,
  Y,
  an,
  /* @__PURE__ */ new WeakMap(),
  /* @__PURE__ */ new WeakMap(),
  Ol(an, lt),
  // @todo window is guaranteed to be defined because isSecureContext checks that as well.
  et
) : void 0, Hh = Sc(Rs, Y), Qh = Da(qs, Xe, ka, ja, /* @__PURE__ */ new WeakSet(), K, Hh, kn, on, Vs, Ls), br = la(Gh, ih, fr, oh, lh, dh, ph, _h, yh, Qh, Ch, wh, Ah, Nh, kh, Fh, qh, Lh, zh, $h), Xh = wc(he, el, K, Y), Yh = Ac(he, tl, K, Y), Zh = Mc(he, nl, K, Y), Jh = sl(_e, Y), Kh = Ec(he, Jh, K), eu = Wo(br, _e, Me, Pl, Xh, Yh, Zh, Kh, gn), Us = oc(_r), tu = Eo(Us), Ar = Ca(tt), nu = Va(Us), Mr = Ua(tt), Er = /* @__PURE__ */ new WeakMap(), su = Ka(Er, Qe), iu = Wc(Ar, tt, _e, St, fn, Zt, Fe, pn, Me, Mr, Bs, su, yt), ru = Lc(_e, iu, Fe, Me, yt), ou = ca(nt, Ar, Yt, St, fn, Zt, Fe, nu, Mr, Bs, ne, an, lt, st, ye, Hn), au = sc(wr), cu = El(Er), Ei = Tr ? ra(tu, he, Ye, ou, ru, Ae, au, K, Y, an, jl, cu, Zl, Xt) : void 0, lu = Ia(Me, lt), hu = Nl(qs, Xe, Os, Us, Hn, kn, Vs, Ls), uu = pl(br, Xe, _e, lu, hu), du = fc(Wn, Rs), fu = pc(As, Ps), pu = mc(Ms, ur), mu = gc(Wn, Y);
function We(i) {
  return i === void 0;
}
function j(i) {
  return i !== void 0;
}
function gu(i) {
  return typeof i == "function";
}
function Et(i) {
  return typeof i == "number";
}
function bt(i) {
  return Object.prototype.toString.call(i) === "[object Object]" && i.constructor === Object;
}
function _u(i) {
  return typeof i == "boolean";
}
function He(i) {
  return Array.isArray(i);
}
function ct(i) {
  return typeof i == "string";
}
function bn(i) {
  return ct(i) && /^([a-g]{1}(?:b|#|x|bb)?)(-?[0-9]+)/i.test(i);
}
function W(i, e) {
  if (!i)
    throw new Error(e);
}
function _t(i, e, t = 1 / 0) {
  if (!(e <= i && i <= t))
    throw new RangeError(`Value must be within [${e}, ${t}], got: ${i}`);
}
function xr(i) {
  !i.isOffline && i.state !== "running" && zs('The AudioContext is "suspended". Invoke Tone.start() from a user action to start the audio.');
}
let Nr = !1, xi = !1;
function Ni(i) {
  Nr = i;
}
function vu(i) {
  We(i) && Nr && !xi && (xi = !0, zs("Events scheduled inside of scheduled callbacks should use the passed in scheduling time. See https://github.com/Tonejs/Tone.js/wiki/Accurate-Timing"));
}
let Ir = console;
function yu(...i) {
  Ir.log(...i);
}
function zs(...i) {
  Ir.warn(...i);
}
function Su(i) {
  return new eu(i);
}
function Cu(i, e, t) {
  return new uu(i, e, t);
}
const qe = typeof self == "object" ? self : null, Tu = qe && (qe.hasOwnProperty("AudioContext") || qe.hasOwnProperty("webkitAudioContext"));
function wu(i, e, t) {
  return W(j(Ei), "AudioWorkletNode only works in a secure context (https or localhost)"), new (i instanceof (qe == null ? void 0 : qe.BaseAudioContext) ? qe == null ? void 0 : qe.AudioWorkletNode : Ei)(i, e, t);
}
function Ze(i, e, t, n) {
  var s = arguments.length, r = s < 3 ? e : n === null ? n = Object.getOwnPropertyDescriptor(e, t) : n, o;
  if (typeof Reflect == "object" && typeof Reflect.decorate == "function") r = Reflect.decorate(i, e, t, n);
  else for (var a = i.length - 1; a >= 0; a--) (o = i[a]) && (r = (s < 3 ? o(r) : s > 3 ? o(e, t, r) : o(e, t)) || r);
  return s > 3 && r && Object.defineProperty(e, t, r), r;
}
function fe(i, e, t, n) {
  function s(r) {
    return r instanceof t ? r : new t(function(o) {
      o(r);
    });
  }
  return new (t || (t = Promise))(function(r, o) {
    function a(h) {
      try {
        l(n.next(h));
      } catch (u) {
        o(u);
      }
    }
    function c(h) {
      try {
        l(n.throw(h));
      } catch (u) {
        o(u);
      }
    }
    function l(h) {
      h.done ? r(h.value) : s(h.value).then(a, c);
    }
    l((n = n.apply(i, e || [])).next());
  });
}
class bu {
  constructor(e, t, n, s) {
    this._callback = e, this._type = t, this._minimumUpdateInterval = Math.max(128 / (s || 44100), 1e-3), this.updateInterval = n, this._createClock();
  }
  /**
   * Generate a web worker
   */
  _createWorker() {
    const e = new Blob([
      /* javascript */
      `
			// the initial timeout time
			let timeoutTime =  ${(this._updateInterval * 1e3).toFixed(1)};
			// onmessage callback
			self.onmessage = function(msg){
				timeoutTime = parseInt(msg.data);
			};
			// the tick function which posts a message
			// and schedules a new tick
			function tick(){
				setTimeout(tick, timeoutTime);
				self.postMessage('tick');
			}
			// call tick initially
			tick();
			`
    ], { type: "text/javascript" }), t = URL.createObjectURL(e), n = new Worker(t);
    n.onmessage = this._callback.bind(this), this._worker = n;
  }
  /**
   * Create a timeout loop
   */
  _createTimeout() {
    this._timeout = setTimeout(() => {
      this._createTimeout(), this._callback();
    }, this._updateInterval * 1e3);
  }
  /**
   * Create the clock source.
   */
  _createClock() {
    if (this._type === "worker")
      try {
        this._createWorker();
      } catch {
        this._type = "timeout", this._createClock();
      }
    else this._type === "timeout" && this._createTimeout();
  }
  /**
   * Clean up the current clock source
   */
  _disposeClock() {
    this._timeout && clearTimeout(this._timeout), this._worker && (this._worker.terminate(), this._worker.onmessage = null);
  }
  /**
   * The rate in seconds the ticker will update
   */
  get updateInterval() {
    return this._updateInterval;
  }
  set updateInterval(e) {
    var t;
    this._updateInterval = Math.max(e, this._minimumUpdateInterval), this._type === "worker" && ((t = this._worker) === null || t === void 0 || t.postMessage(this._updateInterval * 1e3));
  }
  /**
   * The type of the ticker, either a worker or a timeout
   */
  get type() {
    return this._type;
  }
  set type(e) {
    this._disposeClock(), this._type = e, this._createClock();
  }
  /**
   * Clean up
   */
  dispose() {
    this._disposeClock();
  }
}
function xt(i) {
  return pu(i);
}
function gt(i) {
  return fu(i);
}
function xn(i) {
  return mu(i);
}
function Ft(i) {
  return du(i);
}
function Au(i) {
  return i instanceof fr;
}
function Mu(i, e) {
  return i === "value" || xt(e) || gt(e) || Au(e);
}
function qt(i, ...e) {
  if (!e.length)
    return i;
  const t = e.shift();
  if (bt(i) && bt(t))
    for (const n in t)
      Mu(n, t[n]) ? i[n] = t[n] : bt(t[n]) ? (i[n] || Object.assign(i, { [n]: {} }), qt(i[n], t[n])) : Object.assign(i, { [n]: t[n] });
  return qt(i, ...e);
}
function Eu(i, e) {
  return i.length === e.length && i.every((t, n) => e[n] === t);
}
function z(i, e, t = [], n) {
  const s = {}, r = Array.from(e);
  if (bt(r[0]) && n && !Reflect.has(r[0], n) && (Object.keys(r[0]).some((a) => Reflect.has(i, a)) || (qt(s, { [n]: r[0] }), t.splice(t.indexOf(n), 1), r.shift())), r.length === 1 && bt(r[0]))
    qt(s, r[0]);
  else
    for (let o = 0; o < t.length; o++)
      j(r[o]) && (s[t[o]] = r[o]);
  return qt(i, s);
}
function xu(i) {
  return i.constructor.getDefaults();
}
function Vt(i, e) {
  return We(i) ? e : i;
}
function Ii(i, e) {
  return e.forEach((t) => {
    Reflect.has(i, t) && delete i[t];
  }), i;
}
/**
 * Tone.js
 * @author Yotam Mann
 * @license http://opensource.org/licenses/MIT MIT License
 * @copyright 2014-2024 Yotam Mann
 */
class ht {
  constructor() {
    this.debug = !1, this._wasDisposed = !1;
  }
  /**
   * Returns all of the default options belonging to the class.
   */
  static getDefaults() {
    return {};
  }
  /**
   * Prints the outputs to the console log for debugging purposes.
   * Prints the contents only if either the object has a property
   * called `debug` set to true, or a variable called TONE_DEBUG_CLASS
   * is set to the name of the class.
   * @example
   * const osc = new Tone.Oscillator();
   * // prints all logs originating from this oscillator
   * osc.debug = true;
   * // calls to start/stop will print in the console
   * osc.start();
   */
  log(...e) {
    (this.debug || qe && this.toString() === qe.TONE_DEBUG_CLASS) && yu(this, ...e);
  }
  /**
   * disconnect and dispose.
   */
  dispose() {
    return this._wasDisposed = !0, this;
  }
  /**
   * Indicates if the instance was disposed. 'Disposing' an
   * instance means that all of the Web Audio nodes that were
   * created for the instance are disconnected and freed for garbage collection.
   */
  get disposed() {
    return this._wasDisposed;
  }
  /**
   * Convert the class to a string
   * @example
   * const osc = new Tone.Oscillator();
   * console.log(osc.toString());
   */
  toString() {
    return this.name;
  }
}
ht.version = Ri;
const Ws = 1e-6;
function Ut(i, e) {
  return i > e + Ws;
}
function Ss(i, e) {
  return Ut(i, e) || je(i, e);
}
function Vn(i, e) {
  return i + Ws < e;
}
function je(i, e) {
  return Math.abs(i - e) < Ws;
}
function Nu(i, e, t) {
  return Math.max(Math.min(i, t), e);
}
class $e extends ht {
  constructor() {
    super(), this.name = "Timeline", this._timeline = [];
    const e = z($e.getDefaults(), arguments, ["memory"]);
    this.memory = e.memory, this.increasing = e.increasing;
  }
  static getDefaults() {
    return {
      memory: 1 / 0,
      increasing: !1
    };
  }
  /**
   * The number of items in the timeline.
   */
  get length() {
    return this._timeline.length;
  }
  /**
   * Insert an event object onto the timeline. Events must have a "time" attribute.
   * @param event  The event object to insert into the timeline.
   */
  add(e) {
    if (W(Reflect.has(e, "time"), "Timeline: events must have a time attribute"), e.time = e.time.valueOf(), this.increasing && this.length) {
      const t = this._timeline[this.length - 1];
      W(Ss(e.time, t.time), "The time must be greater than or equal to the last scheduled time"), this._timeline.push(e);
    } else {
      const t = this._search(e.time);
      this._timeline.splice(t + 1, 0, e);
    }
    if (this.length > this.memory) {
      const t = this.length - this.memory;
      this._timeline.splice(0, t);
    }
    return this;
  }
  /**
   * Remove an event from the timeline.
   * @param  {Object}  event  The event object to remove from the list.
   * @returns {Timeline} this
   */
  remove(e) {
    const t = this._timeline.indexOf(e);
    return t !== -1 && this._timeline.splice(t, 1), this;
  }
  /**
   * Get the nearest event whose time is less than or equal to the given time.
   * @param  time  The time to query.
   */
  get(e, t = "time") {
    const n = this._search(e, t);
    return n !== -1 ? this._timeline[n] : null;
  }
  /**
   * Return the first event in the timeline without removing it
   * @returns {Object} The first event object
   * @deprecated
   */
  peek() {
    return this._timeline[0];
  }
  /**
   * Return the first event in the timeline and remove it
   * @deprecated
   */
  shift() {
    return this._timeline.shift();
  }
  /**
   * Get the event which is scheduled after the given time.
   * @param  time  The time to query.
   */
  getAfter(e, t = "time") {
    const n = this._search(e, t);
    return n + 1 < this._timeline.length ? this._timeline[n + 1] : null;
  }
  /**
   * Get the event before the event at the given time.
   * @param  time  The time to query.
   */
  getBefore(e) {
    const t = this._timeline.length;
    if (t > 0 && this._timeline[t - 1].time < e)
      return this._timeline[t - 1];
    const n = this._search(e);
    return n - 1 >= 0 ? this._timeline[n - 1] : null;
  }
  /**
   * Cancel events at and after the given time
   * @param  after  The time to query.
   */
  cancel(e) {
    if (this._timeline.length > 1) {
      let t = this._search(e);
      if (t >= 0)
        if (je(this._timeline[t].time, e)) {
          for (let n = t; n >= 0 && je(this._timeline[n].time, e); n--)
            t = n;
          this._timeline = this._timeline.slice(0, t);
        } else
          this._timeline = this._timeline.slice(0, t + 1);
      else
        this._timeline = [];
    } else this._timeline.length === 1 && Ss(this._timeline[0].time, e) && (this._timeline = []);
    return this;
  }
  /**
   * Cancel events before or equal to the given time.
   * @param  time  The time to cancel before.
   */
  cancelBefore(e) {
    const t = this._search(e);
    return t >= 0 && (this._timeline = this._timeline.slice(t + 1)), this;
  }
  /**
   * Returns the previous event if there is one. null otherwise
   * @param  event The event to find the previous one of
   * @return The event right before the given event
   */
  previousEvent(e) {
    const t = this._timeline.indexOf(e);
    return t > 0 ? this._timeline[t - 1] : null;
  }
  /**
   * Does a binary search on the timeline array and returns the
   * nearest event index whose time is after or equal to the given time.
   * If a time is searched before the first index in the timeline, -1 is returned.
   * If the time is after the end, the index of the last item is returned.
   */
  _search(e, t = "time") {
    if (this._timeline.length === 0)
      return -1;
    let n = 0;
    const s = this._timeline.length;
    let r = s;
    if (s > 0 && this._timeline[s - 1][t] <= e)
      return s - 1;
    for (; n < r; ) {
      let o = Math.floor(n + (r - n) / 2);
      const a = this._timeline[o], c = this._timeline[o + 1];
      if (je(a[t], e)) {
        for (let l = o; l < this._timeline.length; l++) {
          const h = this._timeline[l];
          if (je(h[t], e))
            o = l;
          else
            break;
        }
        return o;
      } else {
        if (Vn(a[t], e) && Ut(c[t], e))
          return o;
        Ut(a[t], e) ? r = o : n = o + 1;
      }
    }
    return -1;
  }
  /**
   * Internal iterator. Applies extra safety checks for
   * removing items from the array.
   */
  _iterate(e, t = 0, n = this._timeline.length - 1) {
    this._timeline.slice(t, n + 1).forEach(e);
  }
  /**
   * Iterate over everything in the array
   * @param  callback The callback to invoke with every item
   */
  forEach(e) {
    return this._iterate(e), this;
  }
  /**
   * Iterate over everything in the array at or before the given time.
   * @param  time The time to check if items are before
   * @param  callback The callback to invoke with every item
   */
  forEachBefore(e, t) {
    const n = this._search(e);
    return n !== -1 && this._iterate(t, 0, n), this;
  }
  /**
   * Iterate over everything in the array after the given time.
   * @param  time The time to check if items are before
   * @param  callback The callback to invoke with every item
   */
  forEachAfter(e, t) {
    const n = this._search(e);
    return this._iterate(t, n + 1), this;
  }
  /**
   * Iterate over everything in the array between the startTime and endTime.
   * The timerange is inclusive of the startTime, but exclusive of the endTime.
   * range = [startTime, endTime).
   * @param  startTime The time to check if items are before
   * @param  endTime The end of the test interval.
   * @param  callback The callback to invoke with every item
   */
  forEachBetween(e, t, n) {
    let s = this._search(e), r = this._search(t);
    return s !== -1 && r !== -1 ? (this._timeline[s].time !== e && (s += 1), this._timeline[r].time === t && (r -= 1), this._iterate(n, s, r)) : s === -1 && this._iterate(n, 0, r), this;
  }
  /**
   * Iterate over everything in the array at or after the given time. Similar to
   * forEachAfter, but includes the item(s) at the given time.
   * @param  time The time to check if items are before
   * @param  callback The callback to invoke with every item
   */
  forEachFrom(e, t) {
    let n = this._search(e);
    for (; n >= 0 && this._timeline[n].time >= e; )
      n--;
    return this._iterate(t, n + 1), this;
  }
  /**
   * Iterate over everything in the array at the given time
   * @param  time The time to check if items are before
   * @param  callback The callback to invoke with every item
   */
  forEachAtTime(e, t) {
    const n = this._search(e);
    if (n !== -1 && je(this._timeline[n].time, e)) {
      let s = n;
      for (let r = n; r >= 0 && je(this._timeline[r].time, e); r--)
        s = r;
      this._iterate((r) => {
        t(r);
      }, s, n);
    }
    return this;
  }
  /**
   * Clean up.
   */
  dispose() {
    return super.dispose(), this._timeline = [], this;
  }
}
const kr = [];
function Xn(i) {
  kr.push(i);
}
function Iu(i) {
  kr.forEach((e) => e(i));
}
const Dr = [];
function Yn(i) {
  Dr.push(i);
}
function ku(i) {
  Dr.forEach((e) => e(i));
}
class _n extends ht {
  constructor() {
    super(...arguments), this.name = "Emitter";
  }
  /**
   * Bind a callback to a specific event.
   * @param  event     The name of the event to listen for.
   * @param  callback  The callback to invoke when the event is emitted
   */
  on(e, t) {
    return e.split(/\W+/).forEach((s) => {
      We(this._events) && (this._events = {}), this._events.hasOwnProperty(s) || (this._events[s] = []), this._events[s].push(t);
    }), this;
  }
  /**
   * Bind a callback which is only invoked once
   * @param  event     The name of the event to listen for.
   * @param  callback  The callback to invoke when the event is emitted
   */
  once(e, t) {
    const n = (...s) => {
      t(...s), this.off(e, n);
    };
    return this.on(e, n), this;
  }
  /**
   * Remove the event listener.
   * @param  event     The event to stop listening to.
   * @param  callback  The callback which was bound to the event with Emitter.on.
   *                   If no callback is given, all callbacks events are removed.
   */
  off(e, t) {
    return e.split(/\W+/).forEach((s) => {
      if (We(this._events) && (this._events = {}), this._events.hasOwnProperty(s))
        if (We(t))
          this._events[s] = [];
        else {
          const r = this._events[s];
          for (let o = r.length - 1; o >= 0; o--)
            r[o] === t && r.splice(o, 1);
        }
    }), this;
  }
  /**
   * Invoke all of the callbacks bound to the event
   * with any arguments passed in.
   * @param  event  The name of the event.
   * @param args The arguments to pass to the functions listening.
   */
  emit(e, ...t) {
    if (this._events && this._events.hasOwnProperty(e)) {
      const n = this._events[e].slice(0);
      for (let s = 0, r = n.length; s < r; s++)
        n[s].apply(this, t);
    }
    return this;
  }
  /**
   * Add Emitter functions (on/off/emit) to the object
   */
  static mixin(e) {
    ["on", "once", "off", "emit"].forEach((t) => {
      const n = Object.getOwnPropertyDescriptor(_n.prototype, t);
      Object.defineProperty(e.prototype, t, n);
    });
  }
  /**
   * Clean up
   */
  dispose() {
    return super.dispose(), this._events = void 0, this;
  }
}
class Fr extends _n {
  constructor() {
    super(...arguments), this.isOffline = !1;
  }
  /*
   * This is a placeholder so that JSON.stringify does not throw an error
   * This matches what JSON.stringify(audioContext) returns on a native
   * audioContext instance.
   */
  toJSON() {
    return {};
  }
}
class vn extends Fr {
  constructor() {
    var e, t;
    super(), this.name = "Context", this._constants = /* @__PURE__ */ new Map(), this._timeouts = new $e(), this._timeoutIds = 0, this._initialized = !1, this._closeStarted = !1, this.isOffline = !1, this._workletPromise = null;
    const n = z(vn.getDefaults(), arguments, [
      "context"
    ]);
    n.context ? (this._context = n.context, this._latencyHint = ((e = arguments[0]) === null || e === void 0 ? void 0 : e.latencyHint) || "") : (this._context = Su({
      latencyHint: n.latencyHint
    }), this._latencyHint = n.latencyHint), this._ticker = new bu(this.emit.bind(this, "tick"), n.clockSource, n.updateInterval, this._context.sampleRate), this.on("tick", this._timeoutLoop.bind(this)), this._context.onstatechange = () => {
      this.emit("statechange", this.state);
    }, this[!((t = arguments[0]) === null || t === void 0) && t.hasOwnProperty("updateInterval") ? "_lookAhead" : "lookAhead"] = n.lookAhead;
  }
  static getDefaults() {
    return {
      clockSource: "worker",
      latencyHint: "interactive",
      lookAhead: 0.1,
      updateInterval: 0.05
    };
  }
  /**
   * Finish setting up the context. **You usually do not need to do this manually.**
   */
  initialize() {
    return this._initialized || (Iu(this), this._initialized = !0), this;
  }
  //---------------------------
  // BASE AUDIO CONTEXT METHODS
  //---------------------------
  createAnalyser() {
    return this._context.createAnalyser();
  }
  createOscillator() {
    return this._context.createOscillator();
  }
  createBufferSource() {
    return this._context.createBufferSource();
  }
  createBiquadFilter() {
    return this._context.createBiquadFilter();
  }
  createBuffer(e, t, n) {
    return this._context.createBuffer(e, t, n);
  }
  createChannelMerger(e) {
    return this._context.createChannelMerger(e);
  }
  createChannelSplitter(e) {
    return this._context.createChannelSplitter(e);
  }
  createConstantSource() {
    return this._context.createConstantSource();
  }
  createConvolver() {
    return this._context.createConvolver();
  }
  createDelay(e) {
    return this._context.createDelay(e);
  }
  createDynamicsCompressor() {
    return this._context.createDynamicsCompressor();
  }
  createGain() {
    return this._context.createGain();
  }
  createIIRFilter(e, t) {
    return this._context.createIIRFilter(e, t);
  }
  createPanner() {
    return this._context.createPanner();
  }
  createPeriodicWave(e, t, n) {
    return this._context.createPeriodicWave(e, t, n);
  }
  createStereoPanner() {
    return this._context.createStereoPanner();
  }
  createWaveShaper() {
    return this._context.createWaveShaper();
  }
  createMediaStreamSource(e) {
    return W(Ft(this._context), "Not available if OfflineAudioContext"), this._context.createMediaStreamSource(e);
  }
  createMediaElementSource(e) {
    return W(Ft(this._context), "Not available if OfflineAudioContext"), this._context.createMediaElementSource(e);
  }
  createMediaStreamDestination() {
    return W(Ft(this._context), "Not available if OfflineAudioContext"), this._context.createMediaStreamDestination();
  }
  decodeAudioData(e) {
    return this._context.decodeAudioData(e);
  }
  /**
   * The current time in seconds of the AudioContext.
   */
  get currentTime() {
    return this._context.currentTime;
  }
  /**
   * The current time in seconds of the AudioContext.
   */
  get state() {
    return this._context.state;
  }
  /**
   * The current time in seconds of the AudioContext.
   */
  get sampleRate() {
    return this._context.sampleRate;
  }
  /**
   * The listener
   */
  get listener() {
    return this.initialize(), this._listener;
  }
  set listener(e) {
    W(!this._initialized, "The listener cannot be set after initialization."), this._listener = e;
  }
  /**
   * There is only one Transport per Context. It is created on initialization.
   */
  get transport() {
    return this.initialize(), this._transport;
  }
  set transport(e) {
    W(!this._initialized, "The transport cannot be set after initialization."), this._transport = e;
  }
  /**
   * This is the Draw object for the context which is useful for synchronizing the draw frame with the Tone.js clock.
   */
  get draw() {
    return this.initialize(), this._draw;
  }
  set draw(e) {
    W(!this._initialized, "Draw cannot be set after initialization."), this._draw = e;
  }
  /**
   * A reference to the Context's destination node.
   */
  get destination() {
    return this.initialize(), this._destination;
  }
  set destination(e) {
    W(!this._initialized, "The destination cannot be set after initialization."), this._destination = e;
  }
  /**
   * Create an audio worklet node from a name and options. The module
   * must first be loaded using {@link addAudioWorkletModule}.
   */
  createAudioWorkletNode(e, t) {
    return wu(this.rawContext, e, t);
  }
  /**
   * Add an AudioWorkletProcessor module
   * @param url The url of the module
   */
  addAudioWorkletModule(e) {
    return fe(this, void 0, void 0, function* () {
      W(j(this.rawContext.audioWorklet), "AudioWorkletNode is only available in a secure context (https or localhost)"), this._workletPromise || (this._workletPromise = this.rawContext.audioWorklet.addModule(e)), yield this._workletPromise;
    });
  }
  /**
   * Returns a promise which resolves when all of the worklets have been loaded on this context
   */
  workletsAreReady() {
    return fe(this, void 0, void 0, function* () {
      (yield this._workletPromise) ? this._workletPromise : Promise.resolve();
    });
  }
  //---------------------------
  // TICKER
  //---------------------------
  /**
   * How often the interval callback is invoked.
   * This number corresponds to how responsive the scheduling
   * can be. Setting to 0 will result in the lowest practial interval
   * based on context properties. context.updateInterval + context.lookAhead
   * gives you the total latency between scheduling an event and hearing it.
   */
  get updateInterval() {
    return this._ticker.updateInterval;
  }
  set updateInterval(e) {
    this._ticker.updateInterval = e;
  }
  /**
   * What the source of the clock is, either "worker" (default),
   * "timeout", or "offline" (none).
   */
  get clockSource() {
    return this._ticker.type;
  }
  set clockSource(e) {
    this._ticker.type = e;
  }
  /**
   * The amount of time into the future events are scheduled. Giving Web Audio
   * a short amount of time into the future to schedule events can reduce clicks and
   * improve performance. This value can be set to 0 to get the lowest latency.
   * Adjusting this value also affects the {@link updateInterval}.
   */
  get lookAhead() {
    return this._lookAhead;
  }
  set lookAhead(e) {
    this._lookAhead = e, this.updateInterval = e ? e / 2 : 0.01;
  }
  /**
   * The type of playback, which affects tradeoffs between audio
   * output latency and responsiveness.
   * In addition to setting the value in seconds, the latencyHint also
   * accepts the strings "interactive" (prioritizes low latency),
   * "playback" (prioritizes sustained playback), "balanced" (balances
   * latency and performance).
   * @example
   * // prioritize sustained playback
   * const context = new Tone.Context({ latencyHint: "playback" });
   * // set this context as the global Context
   * Tone.setContext(context);
   * // the global context is gettable with Tone.getContext()
   * console.log(Tone.getContext().latencyHint);
   */
  get latencyHint() {
    return this._latencyHint;
  }
  /**
   * The unwrapped AudioContext or OfflineAudioContext
   */
  get rawContext() {
    return this._context;
  }
  /**
   * The current audio context time plus a short {@link lookAhead}.
   * @example
   * setInterval(() => {
   * 	console.log("now", Tone.now());
   * }, 100);
   */
  now() {
    return this._context.currentTime + this._lookAhead;
  }
  /**
   * The current audio context time without the {@link lookAhead}.
   * In most cases it is better to use {@link now} instead of {@link immediate} since
   * with {@link now} the {@link lookAhead} is applied equally to _all_ components including internal components,
   * to making sure that everything is scheduled in sync. Mixing {@link now} and {@link immediate}
   * can cause some timing issues. If no lookAhead is desired, you can set the {@link lookAhead} to `0`.
   */
  immediate() {
    return this._context.currentTime;
  }
  /**
   * Starts the audio context from a suspended state. This is required
   * to initially start the AudioContext.
   * @see {@link start}
   */
  resume() {
    return Ft(this._context) ? this._context.resume() : Promise.resolve();
  }
  /**
   * Close the context. Once closed, the context can no longer be used and
   * any AudioNodes created from the context will be silent.
   */
  close() {
    return fe(this, void 0, void 0, function* () {
      Ft(this._context) && this.state !== "closed" && !this._closeStarted && (this._closeStarted = !0, yield this._context.close()), this._initialized && ku(this);
    });
  }
  /**
   * **Internal** Generate a looped buffer at some constant value.
   */
  getConstant(e) {
    if (this._constants.has(e))
      return this._constants.get(e);
    {
      const t = this._context.createBuffer(1, 128, this._context.sampleRate), n = t.getChannelData(0);
      for (let r = 0; r < n.length; r++)
        n[r] = e;
      const s = this._context.createBufferSource();
      return s.channelCount = 1, s.channelCountMode = "explicit", s.buffer = t, s.loop = !0, s.start(0), this._constants.set(e, s), s;
    }
  }
  /**
   * Clean up. Also closes the audio context.
   */
  dispose() {
    return super.dispose(), this._ticker.dispose(), this._timeouts.dispose(), Object.keys(this._constants).map((e) => this._constants[e].disconnect()), this.close(), this;
  }
  //---------------------------
  // TIMEOUTS
  //---------------------------
  /**
   * The private loop which keeps track of the context scheduled timeouts
   * Is invoked from the clock source
   */
  _timeoutLoop() {
    const e = this.now();
    this._timeouts.forEachBefore(e, (t) => {
      t.callback(), this._timeouts.remove(t);
    });
  }
  /**
   * A setTimeout which is guaranteed by the clock source.
   * Also runs in the offline context.
   * @param  fn       The callback to invoke
   * @param  timeout  The timeout in seconds
   * @returns ID to use when invoking Context.clearTimeout
   */
  setTimeout(e, t) {
    this._timeoutIds++;
    const n = this.now();
    return this._timeouts.add({
      callback: e,
      id: this._timeoutIds,
      time: n + t
    }), this._timeoutIds;
  }
  /**
   * Clears a previously scheduled timeout with Tone.context.setTimeout
   * @param  id  The ID returned from setTimeout
   */
  clearTimeout(e) {
    return this._timeouts.forEach((t) => {
      t.id === e && this._timeouts.remove(t);
    }), this;
  }
  /**
   * Clear the function scheduled by {@link setInterval}
   */
  clearInterval(e) {
    return this.clearTimeout(e);
  }
  /**
   * Adds a repeating event to the context's callback clock
   */
  setInterval(e, t) {
    const n = ++this._timeoutIds, s = () => {
      const r = this.now();
      this._timeouts.add({
        callback: () => {
          e(), s();
        },
        id: n,
        time: r + t
      });
    };
    return s(), n;
  }
}
class Du extends Fr {
  constructor() {
    super(...arguments), this.lookAhead = 0, this.latencyHint = 0, this.isOffline = !1;
  }
  //---------------------------
  // BASE AUDIO CONTEXT METHODS
  //---------------------------
  createAnalyser() {
    return {};
  }
  createOscillator() {
    return {};
  }
  createBufferSource() {
    return {};
  }
  createBiquadFilter() {
    return {};
  }
  createBuffer(e, t, n) {
    return {};
  }
  createChannelMerger(e) {
    return {};
  }
  createChannelSplitter(e) {
    return {};
  }
  createConstantSource() {
    return {};
  }
  createConvolver() {
    return {};
  }
  createDelay(e) {
    return {};
  }
  createDynamicsCompressor() {
    return {};
  }
  createGain() {
    return {};
  }
  createIIRFilter(e, t) {
    return {};
  }
  createPanner() {
    return {};
  }
  createPeriodicWave(e, t, n) {
    return {};
  }
  createStereoPanner() {
    return {};
  }
  createWaveShaper() {
    return {};
  }
  createMediaStreamSource(e) {
    return {};
  }
  createMediaElementSource(e) {
    return {};
  }
  createMediaStreamDestination() {
    return {};
  }
  decodeAudioData(e) {
    return Promise.resolve({});
  }
  //---------------------------
  // TONE AUDIO CONTEXT METHODS
  //---------------------------
  createAudioWorkletNode(e, t) {
    return {};
  }
  get rawContext() {
    return {};
  }
  addAudioWorkletModule(e) {
    return fe(this, void 0, void 0, function* () {
      return Promise.resolve();
    });
  }
  resume() {
    return Promise.resolve();
  }
  setTimeout(e, t) {
    return 0;
  }
  clearTimeout(e) {
    return this;
  }
  setInterval(e, t) {
    return 0;
  }
  clearInterval(e) {
    return this;
  }
  getConstant(e) {
    return {};
  }
  get currentTime() {
    return 0;
  }
  get state() {
    return {};
  }
  get sampleRate() {
    return 0;
  }
  get listener() {
    return {};
  }
  get transport() {
    return {};
  }
  get draw() {
    return {};
  }
  set draw(e) {
  }
  get destination() {
    return {};
  }
  set destination(e) {
  }
  now() {
    return 0;
  }
  immediate() {
    return 0;
  }
}
function ce(i, e) {
  He(e) ? e.forEach((t) => ce(i, t)) : Object.defineProperty(i, e, {
    enumerable: !0,
    writable: !1
  });
}
function Or(i, e) {
  He(e) ? e.forEach((t) => Or(i, t)) : Object.defineProperty(i, e, {
    writable: !0
  });
}
const X = () => {
};
class te extends ht {
  constructor() {
    super(), this.name = "ToneAudioBuffer", this.onload = X;
    const e = z(te.getDefaults(), arguments, ["url", "onload", "onerror"]);
    this.reverse = e.reverse, this.onload = e.onload, ct(e.url) ? this.load(e.url).catch(e.onerror) : e.url && this.set(e.url);
  }
  static getDefaults() {
    return {
      onerror: X,
      onload: X,
      reverse: !1
    };
  }
  /**
   * The sample rate of the AudioBuffer
   */
  get sampleRate() {
    return this._buffer ? this._buffer.sampleRate : Ue().sampleRate;
  }
  /**
   * Pass in an AudioBuffer or ToneAudioBuffer to set the value of this buffer.
   */
  set(e) {
    return e instanceof te ? e.loaded ? this._buffer = e.get() : e.onload = () => {
      this.set(e), this.onload(this);
    } : this._buffer = e, this._reversed && this._reverse(), this;
  }
  /**
   * The audio buffer stored in the object.
   */
  get() {
    return this._buffer;
  }
  /**
   * Makes an fetch request for the selected url then decodes the file as an audio buffer.
   * Invokes the callback once the audio buffer loads.
   * @param url The url of the buffer to load. filetype support depends on the browser.
   * @returns A Promise which resolves with this ToneAudioBuffer
   */
  load(e) {
    return fe(this, void 0, void 0, function* () {
      const t = te.load(e).then((n) => {
        this.set(n), this.onload(this);
      });
      te.downloads.push(t);
      try {
        yield t;
      } finally {
        const n = te.downloads.indexOf(t);
        te.downloads.splice(n, 1);
      }
      return this;
    });
  }
  /**
   * clean up
   */
  dispose() {
    return super.dispose(), this._buffer = void 0, this;
  }
  /**
   * Set the audio buffer from the array.
   * To create a multichannel AudioBuffer, pass in a multidimensional array.
   * @param array The array to fill the audio buffer
   */
  fromArray(e) {
    const t = He(e) && e[0].length > 0, n = t ? e.length : 1, s = t ? e[0].length : e.length, r = Ue(), o = r.createBuffer(n, s, r.sampleRate), a = !t && n === 1 ? [e] : e;
    for (let c = 0; c < n; c++)
      o.copyToChannel(a[c], c);
    return this._buffer = o, this;
  }
  /**
   * Sums multiple channels into 1 channel
   * @param chanNum Optionally only copy a single channel from the array.
   */
  toMono(e) {
    if (Et(e))
      this.fromArray(this.toArray(e));
    else {
      let t = new Float32Array(this.length);
      const n = this.numberOfChannels;
      for (let s = 0; s < n; s++) {
        const r = this.toArray(s);
        for (let o = 0; o < r.length; o++)
          t[o] += r[o];
      }
      t = t.map((s) => s / n), this.fromArray(t);
    }
    return this;
  }
  /**
   * Get the buffer as an array. Single channel buffers will return a 1-dimensional
   * Float32Array, and multichannel buffers will return multidimensional arrays.
   * @param channel Optionally only copy a single channel from the array.
   */
  toArray(e) {
    if (Et(e))
      return this.getChannelData(e);
    if (this.numberOfChannels === 1)
      return this.toArray(0);
    {
      const t = [];
      for (let n = 0; n < this.numberOfChannels; n++)
        t[n] = this.getChannelData(n);
      return t;
    }
  }
  /**
   * Returns the Float32Array representing the PCM audio data for the specific channel.
   * @param  channel  The channel number to return
   * @return The audio as a TypedArray
   */
  getChannelData(e) {
    return this._buffer ? this._buffer.getChannelData(e) : new Float32Array(0);
  }
  /**
   * Cut a subsection of the array and return a buffer of the
   * subsection. Does not modify the original buffer
   * @param start The time to start the slice
   * @param end The end time to slice. If none is given will default to the end of the buffer
   */
  slice(e, t = this.duration) {
    W(this.loaded, "Buffer is not loaded");
    const n = Math.floor(e * this.sampleRate), s = Math.floor(t * this.sampleRate);
    W(n < s, "The start time must be less than the end time");
    const r = s - n, o = Ue().createBuffer(this.numberOfChannels, r, this.sampleRate);
    for (let a = 0; a < this.numberOfChannels; a++)
      o.copyToChannel(this.getChannelData(a).subarray(n, s), a);
    return new te(o);
  }
  /**
   * Reverse the buffer.
   */
  _reverse() {
    if (this.loaded)
      for (let e = 0; e < this.numberOfChannels; e++)
        this.getChannelData(e).reverse();
    return this;
  }
  /**
   * If the buffer is loaded or not
   */
  get loaded() {
    return this.length > 0;
  }
  /**
   * The duration of the buffer in seconds.
   */
  get duration() {
    return this._buffer ? this._buffer.duration : 0;
  }
  /**
   * The length of the buffer in samples
   */
  get length() {
    return this._buffer ? this._buffer.length : 0;
  }
  /**
   * The number of discrete audio channels. Returns 0 if no buffer is loaded.
   */
  get numberOfChannels() {
    return this._buffer ? this._buffer.numberOfChannels : 0;
  }
  /**
   * Reverse the buffer.
   */
  get reverse() {
    return this._reversed;
  }
  set reverse(e) {
    this._reversed !== e && (this._reversed = e, this._reverse());
  }
  /**
   * Create a ToneAudioBuffer from the array. To create a multichannel AudioBuffer,
   * pass in a multidimensional array.
   * @param array The array to fill the audio buffer
   * @return A ToneAudioBuffer created from the array
   */
  static fromArray(e) {
    return new te().fromArray(e);
  }
  /**
   * Creates a ToneAudioBuffer from a URL, returns a promise which resolves to a ToneAudioBuffer
   * @param  url The url to load.
   * @return A promise which resolves to a ToneAudioBuffer
   */
  static fromUrl(e) {
    return fe(this, void 0, void 0, function* () {
      return yield new te().load(e);
    });
  }
  /**
   * Loads a url using fetch and returns the AudioBuffer.
   */
  static load(e) {
    return fe(this, void 0, void 0, function* () {
      const t = te.baseUrl === "" || te.baseUrl.endsWith("/") ? te.baseUrl : te.baseUrl + "/", n = yield fetch(t + e);
      if (!n.ok)
        throw new Error(`could not load url: ${e}`);
      const s = yield n.arrayBuffer();
      return yield Ue().decodeAudioData(s);
    });
  }
  /**
   * Checks a url's extension to see if the current browser can play that file type.
   * @param url The url/extension to test
   * @return If the file extension can be played
   * @static
   * @example
   * Tone.ToneAudioBuffer.supportsType("wav"); // returns true
   * Tone.ToneAudioBuffer.supportsType("path/to/file.wav"); // returns true
   */
  static supportsType(e) {
    const t = e.split("."), n = t[t.length - 1];
    return document.createElement("audio").canPlayType("audio/" + n) !== "";
  }
  /**
   * Returns a Promise which resolves when all of the buffers have loaded
   */
  static loaded() {
    return fe(this, void 0, void 0, function* () {
      for (yield Promise.resolve(); te.downloads.length; )
        yield te.downloads[0];
    });
  }
}
te.baseUrl = "";
te.downloads = [];
class $s extends vn {
  constructor() {
    super({
      clockSource: "offline",
      context: xn(arguments[0]) ? arguments[0] : Cu(arguments[0], arguments[1] * arguments[2], arguments[2]),
      lookAhead: 0,
      updateInterval: xn(arguments[0]) ? 128 / arguments[0].sampleRate : 128 / arguments[2]
    }), this.name = "OfflineContext", this._currentTime = 0, this.isOffline = !0, this._duration = xn(arguments[0]) ? arguments[0].length / arguments[0].sampleRate : arguments[1];
  }
  /**
   * Override the now method to point to the internal clock time
   */
  now() {
    return this._currentTime;
  }
  /**
   * Same as this.now()
   */
  get currentTime() {
    return this._currentTime;
  }
  /**
   * Render just the clock portion of the audio context.
   */
  _renderClock(e) {
    return fe(this, void 0, void 0, function* () {
      let t = 0;
      for (; this._duration - this._currentTime >= 0; ) {
        this.emit("tick"), this._currentTime += 128 / this.sampleRate, t++;
        const n = Math.floor(this.sampleRate / 128);
        e && t % n === 0 && (yield new Promise((s) => setTimeout(s, 1)));
      }
    });
  }
  /**
   * Render the output of the OfflineContext
   * @param asynchronous If the clock should be rendered asynchronously, which will not block the main thread, but be slightly slower.
   */
  render() {
    return fe(this, arguments, void 0, function* (e = !0) {
      yield this.workletsAreReady(), yield this._renderClock(e);
      const t = yield this._context.startRendering();
      return new te(t);
    });
  }
  /**
   * Close the context
   */
  close() {
    return Promise.resolve();
  }
}
const Rr = new Du();
let wt = Rr;
function Ue() {
  return wt === Rr && Tu && Fu(new vn()), wt;
}
function Fu(i, e = !1) {
  e && wt.dispose(), Ft(i) ? wt = new vn(i) : xn(i) ? wt = new $s(i) : wt = i;
}
function Ou() {
  return wt.resume();
}
if (qe && !qe.TONE_SILENCE_LOGGING) {
  const e = ` * Tone.js v${Ri} * `;
  console.log(`%c${e}`, "background: #000; color: #fff");
}
function Ru(i) {
  return Math.pow(10, i / 20);
}
function Pu(i) {
  return 20 * (Math.log(i) / Math.LN10);
}
function Pr(i) {
  return Math.pow(2, i / 12);
}
let Zn = 440;
function qu() {
  return Zn;
}
function Vu(i) {
  Zn = i;
}
function Cs(i) {
  return Math.round(qr(i));
}
function qr(i) {
  return 69 + 12 * Math.log2(i / Zn);
}
function Lu(i) {
  return Zn * Math.pow(2, (i - 69) / 12);
}
class js extends ht {
  /**
   * @param context The context associated with the time value. Used to compute
   * Transport and context-relative timing.
   * @param  value  The time value as a number, string or object
   * @param  units  Unit values
   */
  constructor(e, t, n) {
    super(), this.defaultUnits = "s", this._val = t, this._units = n, this.context = e, this._expressions = this._getExpressions();
  }
  /**
   * All of the time encoding expressions
   */
  _getExpressions() {
    return {
      hz: {
        method: (e) => this._frequencyToUnits(parseFloat(e)),
        regexp: /^(\d+(?:\.\d+)?)hz$/i
      },
      i: {
        method: (e) => this._ticksToUnits(parseInt(e, 10)),
        regexp: /^(\d+)i$/i
      },
      m: {
        method: (e) => this._beatsToUnits(parseInt(e, 10) * this._getTimeSignature()),
        regexp: /^(\d+)m$/i
      },
      n: {
        method: (e, t) => {
          const n = parseInt(e, 10), s = t === "." ? 1.5 : 1;
          return n === 1 ? this._beatsToUnits(this._getTimeSignature()) * s : this._beatsToUnits(4 / n) * s;
        },
        regexp: /^(\d+)n(\.?)$/i
      },
      number: {
        method: (e) => this._expressions[this.defaultUnits].method.call(this, e),
        regexp: /^(\d+(?:\.\d+)?)$/
      },
      s: {
        method: (e) => this._secondsToUnits(parseFloat(e)),
        regexp: /^(\d+(?:\.\d+)?)s$/
      },
      samples: {
        method: (e) => parseInt(e, 10) / this.context.sampleRate,
        regexp: /^(\d+)samples$/
      },
      t: {
        method: (e) => {
          const t = parseInt(e, 10);
          return this._beatsToUnits(8 / (Math.floor(t) * 3));
        },
        regexp: /^(\d+)t$/i
      },
      tr: {
        method: (e, t, n) => {
          let s = 0;
          return e && e !== "0" && (s += this._beatsToUnits(this._getTimeSignature() * parseFloat(e))), t && t !== "0" && (s += this._beatsToUnits(parseFloat(t))), n && n !== "0" && (s += this._beatsToUnits(parseFloat(n) / 4)), s;
        },
        regexp: /^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?):?(\d+(?:\.\d+)?)?$/
      }
    };
  }
  //-------------------------------------
  // 	VALUE OF
  //-------------------------------------
  /**
   * Evaluate the time value. Returns the time in seconds.
   */
  valueOf() {
    if (this._val instanceof js && this.fromType(this._val), We(this._val))
      return this._noArg();
    if (ct(this._val) && We(this._units)) {
      for (const e in this._expressions)
        if (this._expressions[e].regexp.test(this._val.trim())) {
          this._units = e;
          break;
        }
    } else if (bt(this._val)) {
      let e = 0;
      for (const t in this._val)
        if (j(this._val[t])) {
          const n = this._val[t], s = (
            // @ts-ignore
            new this.constructor(this.context, t).valueOf() * n
          );
          e += s;
        }
      return e;
    }
    if (j(this._units)) {
      const e = this._expressions[this._units], t = this._val.toString().trim().match(e.regexp);
      return t ? e.method.apply(this, t.slice(1)) : e.method.call(this, this._val);
    } else return ct(this._val) ? parseFloat(this._val) : this._val;
  }
  //-------------------------------------
  // 	UNIT CONVERSIONS
  //-------------------------------------
  /**
   * Returns the value of a frequency in the current units
   */
  _frequencyToUnits(e) {
    return 1 / e;
  }
  /**
   * Return the value of the beats in the current units
   */
  _beatsToUnits(e) {
    return 60 / this._getBpm() * e;
  }
  /**
   * Returns the value of a second in the current units
   */
  _secondsToUnits(e) {
    return e;
  }
  /**
   * Returns the value of a tick in the current time units
   */
  _ticksToUnits(e) {
    return e * this._beatsToUnits(1) / this._getPPQ();
  }
  /**
   * With no arguments, return 'now'
   */
  _noArg() {
    return this._now();
  }
  //-------------------------------------
  // 	TEMPO CONVERSIONS
  //-------------------------------------
  /**
   * Return the bpm
   */
  _getBpm() {
    return this.context.transport.bpm.value;
  }
  /**
   * Return the timeSignature
   */
  _getTimeSignature() {
    return this.context.transport.timeSignature;
  }
  /**
   * Return the PPQ or 192 if Transport is not available
   */
  _getPPQ() {
    return this.context.transport.PPQ;
  }
  //-------------------------------------
  // 	CONVERSION INTERFACE
  //-------------------------------------
  /**
   * Coerce a time type into this units type.
   * @param type Any time type units
   */
  fromType(e) {
    switch (this._units = void 0, this.defaultUnits) {
      case "s":
        this._val = e.toSeconds();
        break;
      case "i":
        this._val = e.toTicks();
        break;
      case "hz":
        this._val = e.toFrequency();
        break;
      case "midi":
        this._val = e.toMidi();
        break;
    }
    return this;
  }
  /**
   * Return the value in hertz
   */
  toFrequency() {
    return 1 / this.toSeconds();
  }
  /**
   * Return the time in samples
   */
  toSamples() {
    return this.toSeconds() * this.context.sampleRate;
  }
  /**
   * Return the time in milliseconds.
   */
  toMilliseconds() {
    return this.toSeconds() * 1e3;
  }
}
class Ge extends js {
  constructor() {
    super(...arguments), this.name = "TimeClass";
  }
  _getExpressions() {
    return Object.assign(super._getExpressions(), {
      now: {
        method: (e) => this._now() + new this.constructor(this.context, e).valueOf(),
        regexp: /^\+(.+)/
      },
      quantize: {
        method: (e) => {
          const t = new Ge(this.context, e).valueOf();
          return this._secondsToUnits(this.context.transport.nextSubdivision(t));
        },
        regexp: /^@(.+)/
      }
    });
  }
  /**
   * Quantize the time by the given subdivision. Optionally add a
   * percentage which will move the time value towards the ideal
   * quantized value by that percentage.
   * @param  subdiv    The subdivision to quantize to
   * @param  percent  Move the time value towards the quantized value by a percentage.
   * @example
   * Tone.Time(21).quantize(2); // returns 22
   * Tone.Time(0.6).quantize("4n", 0.5); // returns 0.55
   */
  quantize(e, t = 1) {
    const n = new this.constructor(this.context, e).valueOf(), s = this.valueOf(), a = Math.round(s / n) * n - s;
    return s + a * t;
  }
  //-------------------------------------
  // CONVERSIONS
  //-------------------------------------
  /**
   * Convert a Time to Notation. The notation values are will be the
   * closest representation between 1m to 128th note.
   * @return {Notation}
   * @example
   * // if the Transport is at 120bpm:
   * Tone.Time(2).toNotation(); // returns "1m"
   */
  toNotation() {
    const e = this.toSeconds(), t = ["1m"];
    for (let r = 1; r < 9; r++) {
      const o = Math.pow(2, r);
      t.push(o + "n."), t.push(o + "n"), t.push(o + "t");
    }
    t.push("0");
    let n = t[0], s = new Ge(this.context, t[0]).toSeconds();
    return t.forEach((r) => {
      const o = new Ge(this.context, r).toSeconds();
      Math.abs(o - e) < Math.abs(s - e) && (n = r, s = o);
    }), n;
  }
  /**
   * Return the time encoded as Bars:Beats:Sixteenths.
   */
  toBarsBeatsSixteenths() {
    const e = this._beatsToUnits(1);
    let t = this.valueOf() / e;
    t = parseFloat(t.toFixed(4));
    const n = Math.floor(t / this._getTimeSignature());
    let s = t % 1 * 4;
    t = Math.floor(t) % this._getTimeSignature();
    const r = s.toString();
    return r.length > 3 && (s = parseFloat(parseFloat(r).toFixed(3))), [n, t, s].join(":");
  }
  /**
   * Return the time in ticks.
   */
  toTicks() {
    const e = this._beatsToUnits(1);
    return this.valueOf() / e * this._getPPQ();
  }
  /**
   * Return the time in seconds.
   */
  toSeconds() {
    return this.valueOf();
  }
  /**
   * Return the value as a midi note.
   */
  toMidi() {
    return Cs(this.toFrequency());
  }
  _now() {
    return this.context.now();
  }
}
class ze extends Ge {
  constructor() {
    super(...arguments), this.name = "Frequency", this.defaultUnits = "hz";
  }
  /**
   * The [concert tuning pitch](https://en.wikipedia.org/wiki/Concert_pitch) which is used
   * to generate all the other pitch values from notes. A4's values in Hertz.
   */
  static get A4() {
    return qu();
  }
  static set A4(e) {
    Vu(e);
  }
  //-------------------------------------
  // 	AUGMENT BASE EXPRESSIONS
  //-------------------------------------
  _getExpressions() {
    return Object.assign({}, super._getExpressions(), {
      midi: {
        regexp: /^(\d+(?:\.\d+)?midi)/,
        method(e) {
          return this.defaultUnits === "midi" ? e : ze.mtof(e);
        }
      },
      note: {
        regexp: /^([a-g]{1}(?:b|#|##|x|bb|###|#x|x#|bbb)?)(-?[0-9]+)/i,
        method(e, t) {
          const s = Bu[e.toLowerCase()] + (parseInt(t, 10) + 1) * 12;
          return this.defaultUnits === "midi" ? s : ze.mtof(s);
        }
      },
      tr: {
        regexp: /^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?):?(\d+(?:\.\d+)?)?/,
        method(e, t, n) {
          let s = 1;
          return e && e !== "0" && (s *= this._beatsToUnits(this._getTimeSignature() * parseFloat(e))), t && t !== "0" && (s *= this._beatsToUnits(parseFloat(t))), n && n !== "0" && (s *= this._beatsToUnits(parseFloat(n) / 4)), s;
        }
      }
    });
  }
  //-------------------------------------
  // 	EXPRESSIONS
  //-------------------------------------
  /**
   * Transposes the frequency by the given number of semitones.
   * @return  A new transposed frequency
   * @example
   * Tone.Frequency("A4").transpose(3); // "C5"
   */
  transpose(e) {
    return new ze(this.context, this.valueOf() * Pr(e));
  }
  /**
   * Takes an array of semitone intervals and returns
   * an array of frequencies transposed by those intervals.
   * @return  Returns an array of Frequencies
   * @example
   * Tone.Frequency("A4").harmonize([0, 3, 7]); // ["A4", "C5", "E5"]
   */
  harmonize(e) {
    return e.map((t) => this.transpose(t));
  }
  //-------------------------------------
  // 	UNIT CONVERSIONS
  //-------------------------------------
  /**
   * Return the value of the frequency as a MIDI note
   * @example
   * Tone.Frequency("C4").toMidi(); // 60
   */
  toMidi() {
    return Cs(this.valueOf());
  }
  /**
   * Return the value of the frequency in Scientific Pitch Notation
   * @example
   * Tone.Frequency(69, "midi").toNote(); // "A4"
   */
  toNote() {
    const e = this.toFrequency(), t = Math.log2(e / ze.A4);
    let n = Math.round(12 * t) + 57;
    const s = Math.floor(n / 12);
    return s < 0 && (n += -12 * s), Uu[n % 12] + s.toString();
  }
  /**
   * Return the duration of one cycle in seconds.
   */
  toSeconds() {
    return 1 / super.toSeconds();
  }
  /**
   * Return the duration of one cycle in ticks
   */
  toTicks() {
    const e = this._beatsToUnits(1), t = this.valueOf() / e;
    return Math.floor(t * this._getPPQ());
  }
  //-------------------------------------
  // 	UNIT CONVERSIONS HELPERS
  //-------------------------------------
  /**
   * With no arguments, return 0
   */
  _noArg() {
    return 0;
  }
  /**
   * Returns the value of a frequency in the current units
   */
  _frequencyToUnits(e) {
    return e;
  }
  /**
   * Returns the value of a tick in the current time units
   */
  _ticksToUnits(e) {
    return 1 / (e * 60 / (this._getBpm() * this._getPPQ()));
  }
  /**
   * Return the value of the beats in the current units
   */
  _beatsToUnits(e) {
    return 1 / super._beatsToUnits(e);
  }
  /**
   * Returns the value of a second in the current units
   */
  _secondsToUnits(e) {
    return 1 / e;
  }
  /**
   * Convert a MIDI note to frequency value.
   * @param  midi The midi number to convert.
   * @return The corresponding frequency value
   */
  static mtof(e) {
    return Lu(e);
  }
  /**
   * Convert a frequency value to a MIDI note.
   * @param frequency The value to frequency value to convert.
   */
  static ftom(e) {
    return Cs(e);
  }
}
const Bu = {
  cbbb: -3,
  cbb: -2,
  cb: -1,
  c: 0,
  "c#": 1,
  cx: 2,
  "c##": 2,
  "c###": 3,
  "cx#": 3,
  "c#x": 3,
  dbbb: -1,
  dbb: 0,
  db: 1,
  d: 2,
  "d#": 3,
  dx: 4,
  "d##": 4,
  "d###": 5,
  "dx#": 5,
  "d#x": 5,
  ebbb: 1,
  ebb: 2,
  eb: 3,
  e: 4,
  "e#": 5,
  ex: 6,
  "e##": 6,
  "e###": 7,
  "ex#": 7,
  "e#x": 7,
  fbbb: 2,
  fbb: 3,
  fb: 4,
  f: 5,
  "f#": 6,
  fx: 7,
  "f##": 7,
  "f###": 8,
  "fx#": 8,
  "f#x": 8,
  gbbb: 4,
  gbb: 5,
  gb: 6,
  g: 7,
  "g#": 8,
  gx: 9,
  "g##": 9,
  "g###": 10,
  "gx#": 10,
  "g#x": 10,
  abbb: 6,
  abb: 7,
  ab: 8,
  a: 9,
  "a#": 10,
  ax: 11,
  "a##": 11,
  "a###": 12,
  "ax#": 12,
  "a#x": 12,
  bbbb: 8,
  bbb: 9,
  bb: 10,
  b: 11,
  "b#": 12,
  bx: 13,
  "b##": 13,
  "b###": 14,
  "bx#": 14,
  "b#x": 14
}, Uu = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B"
];
class sn extends Ge {
  constructor() {
    super(...arguments), this.name = "TransportTime";
  }
  /**
   * Return the current time in whichever context is relevant
   */
  _now() {
    return this.context.transport.seconds;
  }
}
class De extends ht {
  constructor() {
    super();
    const e = z(De.getDefaults(), arguments, ["context"]);
    this.defaultContext ? this.context = this.defaultContext : this.context = e.context;
  }
  static getDefaults() {
    return {
      context: Ue()
    };
  }
  /**
   * Return the current time of the Context clock plus the lookAhead.
   * @example
   * setInterval(() => {
   * 	console.log(Tone.now());
   * }, 100);
   */
  now() {
    return this.context.currentTime + this.context.lookAhead;
  }
  /**
   * Return the current time of the Context clock without any lookAhead.
   * @example
   * setInterval(() => {
   * 	console.log(Tone.immediate());
   * }, 100);
   */
  immediate() {
    return this.context.currentTime;
  }
  /**
   * The duration in seconds of one sample.
   */
  get sampleTime() {
    return 1 / this.context.sampleRate;
  }
  /**
   * The number of seconds of 1 processing block (128 samples)
   * @example
   * console.log(Tone.Destination.blockTime);
   */
  get blockTime() {
    return 128 / this.context.sampleRate;
  }
  /**
   * Convert the incoming time to seconds.
   * This is calculated against the current {@link TransportClass} bpm
   * @example
   * const gain = new Tone.Gain();
   * setInterval(() => console.log(gain.toSeconds("4n")), 100);
   * // ramp the tempo to 60 bpm over 30 seconds
   * Tone.getTransport().bpm.rampTo(60, 30);
   */
  toSeconds(e) {
    return vu(e), new Ge(this.context, e).toSeconds();
  }
  /**
   * Convert the input to a frequency number
   * @example
   * const gain = new Tone.Gain();
   * console.log(gain.toFrequency("4n"));
   */
  toFrequency(e) {
    return new ze(this.context, e).toFrequency();
  }
  /**
   * Convert the input time into ticks
   * @example
   * const gain = new Tone.Gain();
   * console.log(gain.toTicks("4n"));
   */
  toTicks(e) {
    return new sn(this.context, e).toTicks();
  }
  //-------------------------------------
  // 	GET/SET
  //-------------------------------------
  /**
   * Get a subset of the properties which are in the partial props
   */
  _getPartialProperties(e) {
    const t = this.get();
    return Object.keys(t).forEach((n) => {
      We(e[n]) && delete t[n];
    }), t;
  }
  /**
   * Get the object's attributes.
   * @example
   * const osc = new Tone.Oscillator();
   * console.log(osc.get());
   */
  get() {
    const e = xu(this);
    return Object.keys(e).forEach((t) => {
      if (Reflect.has(this, t)) {
        const n = this[t];
        j(n) && j(n.value) && j(n.setValueAtTime) ? e[t] = n.value : n instanceof De ? e[t] = n._getPartialProperties(e[t]) : He(n) || Et(n) || ct(n) || _u(n) ? e[t] = n : delete e[t];
      }
    }), e;
  }
  /**
   * Set multiple properties at once with an object.
   * @example
   * const filter = new Tone.Filter().toDestination();
   * // set values using an object
   * filter.set({
   * 	frequency: "C6",
   * 	type: "highpass"
   * });
   * const player = new Tone.Player("https://tonejs.github.io/audio/berklee/Analogsynth_octaves_highmid.mp3").connect(filter);
   * player.autostart = true;
   */
  set(e) {
    return Object.keys(e).forEach((t) => {
      Reflect.has(this, t) && j(this[t]) && (this[t] && j(this[t].value) && j(this[t].setValueAtTime) ? this[t].value !== e[t] && (this[t].value = e[t]) : this[t] instanceof De ? this[t].set(e[t]) : this[t] = e[t]);
    }), this;
  }
}
class Gs extends $e {
  constructor(e = "stopped") {
    super(), this.name = "StateTimeline", this._initial = e, this.setStateAtTime(this._initial, 0);
  }
  /**
   * Returns the scheduled state scheduled before or at
   * the given time.
   * @param  time  The time to query.
   * @return  The name of the state input in setStateAtTime.
   */
  getValueAtTime(e) {
    const t = this.get(e);
    return t !== null ? t.state : this._initial;
  }
  /**
   * Add a state to the timeline.
   * @param  state The name of the state to set.
   * @param  time  The time to query.
   * @param options Any additional options that are needed in the timeline.
   */
  setStateAtTime(e, t, n) {
    return _t(t, 0), this.add(Object.assign({}, n, {
      state: e,
      time: t
    })), this;
  }
  /**
   * Return the event before the time with the given state
   * @param  state The state to look for
   * @param  time  When to check before
   * @return  The event with the given state before the time
   */
  getLastState(e, t) {
    const n = this._search(t);
    for (let s = n; s >= 0; s--) {
      const r = this._timeline[s];
      if (r.state === e)
        return r;
    }
  }
  /**
   * Return the event after the time with the given state
   * @param  state The state to look for
   * @param  time  When to check from
   * @return  The event with the given state after the time
   */
  getNextState(e, t) {
    const n = this._search(t);
    if (n !== -1)
      for (let s = n; s < this._timeline.length; s++) {
        const r = this._timeline[s];
        if (r.state === e)
          return r;
      }
  }
}
class re extends De {
  constructor() {
    const e = z(re.getDefaults(), arguments, [
      "param",
      "units",
      "convert"
    ]);
    for (super(e), this.name = "Param", this.overridden = !1, this._minOutput = 1e-7, W(j(e.param) && (xt(e.param) || e.param instanceof re), "param must be an AudioParam"); !xt(e.param); )
      e.param = e.param._param;
    this._swappable = j(e.swappable) ? e.swappable : !1, this._swappable ? (this.input = this.context.createGain(), this._param = e.param, this.input.connect(this._param)) : this._param = this.input = e.param, this._events = new $e(1e3), this._initialValue = this._param.defaultValue, this.units = e.units, this.convert = e.convert, this._minValue = e.minValue, this._maxValue = e.maxValue, j(e.value) && e.value !== this._toType(this._initialValue) && this.setValueAtTime(e.value, 0);
  }
  static getDefaults() {
    return Object.assign(De.getDefaults(), {
      convert: !0,
      units: "number"
    });
  }
  get value() {
    const e = this.now();
    return this.getValueAtTime(e);
  }
  set value(e) {
    this.cancelScheduledValues(this.now()), this.setValueAtTime(e, this.now());
  }
  get minValue() {
    return j(this._minValue) ? this._minValue : this.units === "time" || this.units === "frequency" || this.units === "normalRange" || this.units === "positive" || this.units === "transportTime" || this.units === "ticks" || this.units === "bpm" || this.units === "hertz" || this.units === "samples" ? 0 : this.units === "audioRange" ? -1 : this.units === "decibels" ? -1 / 0 : this._param.minValue;
  }
  get maxValue() {
    return j(this._maxValue) ? this._maxValue : this.units === "normalRange" || this.units === "audioRange" ? 1 : this._param.maxValue;
  }
  /**
   * Type guard based on the unit name
   */
  _is(e, t) {
    return this.units === t;
  }
  /**
   * Make sure the value is always in the defined range
   */
  _assertRange(e) {
    return j(this.maxValue) && j(this.minValue) && _t(e, this._fromType(this.minValue), this._fromType(this.maxValue)), e;
  }
  /**
   * Convert the given value from the type specified by Param.units
   * into the destination value (such as Gain or Frequency).
   */
  _fromType(e) {
    return this.convert && !this.overridden ? this._is(e, "time") ? this.toSeconds(e) : this._is(e, "decibels") ? Ru(e) : this._is(e, "frequency") ? this.toFrequency(e) : e : this.overridden ? 0 : e;
  }
  /**
   * Convert the parameters value into the units specified by Param.units.
   */
  _toType(e) {
    return this.convert && this.units === "decibels" ? Pu(e) : e;
  }
  //-------------------------------------
  // ABSTRACT PARAM INTERFACE
  // all docs are generated from ParamInterface.ts
  //-------------------------------------
  setValueAtTime(e, t) {
    const n = this.toSeconds(t), s = this._fromType(e);
    return W(isFinite(s) && isFinite(n), `Invalid argument(s) to setValueAtTime: ${JSON.stringify(e)}, ${JSON.stringify(t)}`), this._assertRange(s), this.log(this.units, "setValueAtTime", e, n), this._events.add({
      time: n,
      type: "setValueAtTime",
      value: s
    }), this._param.setValueAtTime(s, n), this;
  }
  getValueAtTime(e) {
    const t = Math.max(this.toSeconds(e), 0), n = this._events.getAfter(t), s = this._events.get(t);
    let r = this._initialValue;
    if (s === null)
      r = this._initialValue;
    else if (s.type === "setTargetAtTime" && (n === null || n.type === "setValueAtTime")) {
      const o = this._events.getBefore(s.time);
      let a;
      o === null ? a = this._initialValue : a = o.value, s.type === "setTargetAtTime" && (r = this._exponentialApproach(s.time, a, s.value, s.constant, t));
    } else if (n === null)
      r = s.value;
    else if (n.type === "linearRampToValueAtTime" || n.type === "exponentialRampToValueAtTime") {
      let o = s.value;
      if (s.type === "setTargetAtTime") {
        const a = this._events.getBefore(s.time);
        a === null ? o = this._initialValue : o = a.value;
      }
      n.type === "linearRampToValueAtTime" ? r = this._linearInterpolate(s.time, o, n.time, n.value, t) : r = this._exponentialInterpolate(s.time, o, n.time, n.value, t);
    } else
      r = s.value;
    return this._toType(r);
  }
  setRampPoint(e) {
    e = this.toSeconds(e);
    let t = this.getValueAtTime(e);
    return this.cancelAndHoldAtTime(e), this._fromType(t) === 0 && (t = this._toType(this._minOutput)), this.setValueAtTime(t, e), this;
  }
  linearRampToValueAtTime(e, t) {
    const n = this._fromType(e), s = this.toSeconds(t);
    return W(isFinite(n) && isFinite(s), `Invalid argument(s) to linearRampToValueAtTime: ${JSON.stringify(e)}, ${JSON.stringify(t)}`), this._assertRange(n), this._events.add({
      time: s,
      type: "linearRampToValueAtTime",
      value: n
    }), this.log(this.units, "linearRampToValueAtTime", e, s), this._param.linearRampToValueAtTime(n, s), this;
  }
  exponentialRampToValueAtTime(e, t) {
    let n = this._fromType(e);
    n = je(n, 0) ? this._minOutput : n, this._assertRange(n);
    const s = this.toSeconds(t);
    return W(isFinite(n) && isFinite(s), `Invalid argument(s) to exponentialRampToValueAtTime: ${JSON.stringify(e)}, ${JSON.stringify(t)}`), this._events.add({
      time: s,
      type: "exponentialRampToValueAtTime",
      value: n
    }), this.log(this.units, "exponentialRampToValueAtTime", e, s), this._param.exponentialRampToValueAtTime(n, s), this;
  }
  exponentialRampTo(e, t, n) {
    return n = this.toSeconds(n), this.setRampPoint(n), this.exponentialRampToValueAtTime(e, n + this.toSeconds(t)), this;
  }
  linearRampTo(e, t, n) {
    return n = this.toSeconds(n), this.setRampPoint(n), this.linearRampToValueAtTime(e, n + this.toSeconds(t)), this;
  }
  targetRampTo(e, t, n) {
    return n = this.toSeconds(n), this.setRampPoint(n), this.exponentialApproachValueAtTime(e, n, t), this;
  }
  exponentialApproachValueAtTime(e, t, n) {
    t = this.toSeconds(t), n = this.toSeconds(n);
    const s = Math.log(n + 1) / Math.log(200);
    return this.setTargetAtTime(e, t, s), this.cancelAndHoldAtTime(t + n * 0.9), this.linearRampToValueAtTime(e, t + n), this;
  }
  setTargetAtTime(e, t, n) {
    const s = this._fromType(e);
    W(isFinite(n) && n > 0, "timeConstant must be a number greater than 0");
    const r = this.toSeconds(t);
    return this._assertRange(s), W(isFinite(s) && isFinite(r), `Invalid argument(s) to setTargetAtTime: ${JSON.stringify(e)}, ${JSON.stringify(t)}`), this._events.add({
      constant: n,
      time: r,
      type: "setTargetAtTime",
      value: s
    }), this.log(this.units, "setTargetAtTime", e, r, n), this._param.setTargetAtTime(s, r, n), this;
  }
  setValueCurveAtTime(e, t, n, s = 1) {
    n = this.toSeconds(n), t = this.toSeconds(t);
    const r = this._fromType(e[0]) * s;
    this.setValueAtTime(this._toType(r), t);
    const o = n / (e.length - 1);
    for (let a = 1; a < e.length; a++) {
      const c = this._fromType(e[a]) * s;
      this.linearRampToValueAtTime(this._toType(c), t + a * o);
    }
    return this;
  }
  cancelScheduledValues(e) {
    const t = this.toSeconds(e);
    return W(isFinite(t), `Invalid argument to cancelScheduledValues: ${JSON.stringify(e)}`), this._events.cancel(t), this._param.cancelScheduledValues(t), this.log(this.units, "cancelScheduledValues", t), this;
  }
  cancelAndHoldAtTime(e) {
    const t = this.toSeconds(e), n = this._fromType(this.getValueAtTime(t));
    W(isFinite(t), `Invalid argument to cancelAndHoldAtTime: ${JSON.stringify(e)}`), this.log(this.units, "cancelAndHoldAtTime", t, "value=" + n);
    const s = this._events.get(t), r = this._events.getAfter(t);
    return s && je(s.time, t) ? r ? (this._param.cancelScheduledValues(r.time), this._events.cancel(r.time)) : (this._param.cancelAndHoldAtTime(t), this._events.cancel(t + this.sampleTime)) : r && (this._param.cancelScheduledValues(r.time), this._events.cancel(r.time), r.type === "linearRampToValueAtTime" ? this.linearRampToValueAtTime(this._toType(n), t) : r.type === "exponentialRampToValueAtTime" && this.exponentialRampToValueAtTime(this._toType(n), t)), this._events.add({
      time: t,
      type: "setValueAtTime",
      value: n
    }), this._param.setValueAtTime(n, t), this;
  }
  rampTo(e, t = 0.1, n) {
    return this.units === "frequency" || this.units === "bpm" || this.units === "decibels" ? this.exponentialRampTo(e, t, n) : this.linearRampTo(e, t, n), this;
  }
  /**
   * Apply all of the previously scheduled events to the passed in Param or AudioParam.
   * The applied values will start at the context's current time and schedule
   * all of the events which are scheduled on this Param onto the passed in param.
   */
  apply(e) {
    const t = this.context.currentTime;
    e.setValueAtTime(this.getValueAtTime(t), t);
    const n = this._events.get(t);
    if (n && n.type === "setTargetAtTime") {
      const s = this._events.getAfter(n.time), r = s ? s.time : t + 2, o = (r - t) / 10;
      for (let a = t; a < r; a += o)
        e.linearRampToValueAtTime(this.getValueAtTime(a), a);
    }
    return this._events.forEachAfter(this.context.currentTime, (s) => {
      s.type === "cancelScheduledValues" ? e.cancelScheduledValues(s.time) : s.type === "setTargetAtTime" ? e.setTargetAtTime(s.value, s.time, s.constant) : e[s.type](s.value, s.time);
    }), this;
  }
  /**
   * Replace the Param's internal AudioParam. Will apply scheduled curves
   * onto the parameter and replace the connections.
   */
  setParam(e) {
    W(this._swappable, "The Param must be assigned as 'swappable' in the constructor");
    const t = this.input;
    return t.disconnect(this._param), this.apply(e), this._param = e, t.connect(this._param), this;
  }
  dispose() {
    return super.dispose(), this._events.dispose(), this;
  }
  get defaultValue() {
    return this._toType(this._param.defaultValue);
  }
  //-------------------------------------
  // 	AUTOMATION CURVE CALCULATIONS
  // 	MIT License, copyright (c) 2014 Jordan Santell
  //-------------------------------------
  // Calculates the the value along the curve produced by setTargetAtTime
  _exponentialApproach(e, t, n, s, r) {
    return n + (t - n) * Math.exp(-(r - e) / s);
  }
  // Calculates the the value along the curve produced by linearRampToValueAtTime
  _linearInterpolate(e, t, n, s, r) {
    return t + (s - t) * ((r - e) / (n - e));
  }
  // Calculates the the value along the curve produced by exponentialRampToValueAtTime
  _exponentialInterpolate(e, t, n, s, r) {
    return t * Math.pow(s / t, (r - e) / (n - e));
  }
}
class $ extends De {
  constructor() {
    super(...arguments), this._internalChannels = [];
  }
  /**
   * The number of inputs feeding into the AudioNode.
   * For source nodes, this will be 0.
   * @example
   * const node = new Tone.Gain();
   * console.log(node.numberOfInputs);
   */
  get numberOfInputs() {
    return j(this.input) ? xt(this.input) || this.input instanceof re ? 1 : this.input.numberOfInputs : 0;
  }
  /**
   * The number of outputs of the AudioNode.
   * @example
   * const node = new Tone.Gain();
   * console.log(node.numberOfOutputs);
   */
  get numberOfOutputs() {
    return j(this.output) ? this.output.numberOfOutputs : 0;
  }
  //-------------------------------------
  // AUDIO PROPERTIES
  //-------------------------------------
  /**
   * Used to decide which nodes to get/set properties on
   */
  _isAudioNode(e) {
    return j(e) && (e instanceof $ || gt(e));
  }
  /**
   * Get all of the audio nodes (either internal or input/output) which together
   * make up how the class node responds to channel input/output
   */
  _getInternalNodes() {
    const e = this._internalChannels.slice(0);
    return this._isAudioNode(this.input) && e.push(this.input), this._isAudioNode(this.output) && this.input !== this.output && e.push(this.output), e;
  }
  /**
   * Set the audio options for this node such as channelInterpretation
   * channelCount, etc.
   * @param options
   */
  _setChannelProperties(e) {
    this._getInternalNodes().forEach((n) => {
      n.channelCount = e.channelCount, n.channelCountMode = e.channelCountMode, n.channelInterpretation = e.channelInterpretation;
    });
  }
  /**
   * Get the current audio options for this node such as channelInterpretation
   * channelCount, etc.
   */
  _getChannelProperties() {
    const e = this._getInternalNodes();
    W(e.length > 0, "ToneAudioNode does not have any internal nodes");
    const t = e[0];
    return {
      channelCount: t.channelCount,
      channelCountMode: t.channelCountMode,
      channelInterpretation: t.channelInterpretation
    };
  }
  /**
   * channelCount is the number of channels used when up-mixing and down-mixing
   * connections to any inputs to the node. The default value is 2 except for
   * specific nodes where its value is specially determined.
   */
  get channelCount() {
    return this._getChannelProperties().channelCount;
  }
  set channelCount(e) {
    const t = this._getChannelProperties();
    this._setChannelProperties(Object.assign(t, { channelCount: e }));
  }
  /**
   * channelCountMode determines how channels will be counted when up-mixing and
   * down-mixing connections to any inputs to the node.
   * The default value is "max". This attribute has no effect for nodes with no inputs.
   * * "max" - computedNumberOfChannels is the maximum of the number of channels of all connections to an input. In this mode channelCount is ignored.
   * * "clamped-max" - computedNumberOfChannels is determined as for "max" and then clamped to a maximum value of the given channelCount.
   * * "explicit" - computedNumberOfChannels is the exact value as specified by the channelCount.
   */
  get channelCountMode() {
    return this._getChannelProperties().channelCountMode;
  }
  set channelCountMode(e) {
    const t = this._getChannelProperties();
    this._setChannelProperties(Object.assign(t, { channelCountMode: e }));
  }
  /**
   * channelInterpretation determines how individual channels will be treated
   * when up-mixing and down-mixing connections to any inputs to the node.
   * The default value is "speakers".
   */
  get channelInterpretation() {
    return this._getChannelProperties().channelInterpretation;
  }
  set channelInterpretation(e) {
    const t = this._getChannelProperties();
    this._setChannelProperties(Object.assign(t, { channelInterpretation: e }));
  }
  //-------------------------------------
  // CONNECTIONS
  //-------------------------------------
  /**
   * connect the output of a ToneAudioNode to an AudioParam, AudioNode, or ToneAudioNode
   * @param destination The output to connect to
   * @param outputNum The output to connect from
   * @param inputNum The input to connect to
   */
  connect(e, t = 0, n = 0) {
    return Jt(this, e, t, n), this;
  }
  /**
   * Connect the output to the context's destination node.
   * @example
   * const osc = new Tone.Oscillator("C2").start();
   * osc.toDestination();
   */
  toDestination() {
    return this.connect(this.context.destination), this;
  }
  /**
   * Connect the output to the context's destination node.
   * @see {@link toDestination}
   * @deprecated
   */
  toMaster() {
    return zs("toMaster() has been renamed toDestination()"), this.toDestination();
  }
  /**
   * disconnect the output
   */
  disconnect(e, t = 0, n = 0) {
    return zu(this, e, t, n), this;
  }
  /**
   * Connect the output of this node to the rest of the nodes in series.
   * @example
   * const player = new Tone.Player("https://tonejs.github.io/audio/drum-samples/handdrum-loop.mp3");
   * player.autostart = true;
   * const filter = new Tone.AutoFilter(4).start();
   * const distortion = new Tone.Distortion(0.5);
   * // connect the player to the filter, distortion and then to the master output
   * player.chain(filter, distortion, Tone.Destination);
   */
  chain(...e) {
    return Ts(this, ...e), this;
  }
  /**
   * connect the output of this node to the rest of the nodes in parallel.
   * @example
   * const player = new Tone.Player("https://tonejs.github.io/audio/drum-samples/conga-rhythm.mp3");
   * player.autostart = true;
   * const pitchShift = new Tone.PitchShift(4).toDestination();
   * const filter = new Tone.Filter("G5").toDestination();
   * // connect a node to the pitch shift and filter in parallel
   * player.fan(pitchShift, filter);
   */
  fan(...e) {
    return e.forEach((t) => this.connect(t)), this;
  }
  /**
   * Dispose and disconnect
   */
  dispose() {
    return super.dispose(), j(this.input) && (this.input instanceof $ ? this.input.dispose() : gt(this.input) && this.input.disconnect()), j(this.output) && (this.output instanceof $ ? this.output.dispose() : gt(this.output) && this.output.disconnect()), this._internalChannels = [], this;
  }
}
function Ts(...i) {
  const e = i.shift();
  i.reduce((t, n) => (t instanceof $ ? t.connect(n) : gt(t) && Jt(t, n), n), e);
}
function Jt(i, e, t = 0, n = 0) {
  for (W(j(i), "Cannot connect from undefined node"), W(j(e), "Cannot connect to undefined node"), (e instanceof $ || gt(e)) && W(e.numberOfInputs > 0, "Cannot connect to node with no inputs"), W(i.numberOfOutputs > 0, "Cannot connect from node with no outputs"); e instanceof $ || e instanceof re; )
    j(e.input) && (e = e.input);
  for (; i instanceof $; )
    j(i.output) && (i = i.output);
  xt(e) ? i.connect(e, t) : i.connect(e, t, n);
}
function zu(i, e, t = 0, n = 0) {
  if (j(e))
    for (; e instanceof $; )
      e = e.input;
  for (; !gt(i); )
    j(i.output) && (i = i.output);
  xt(e) ? i.disconnect(e, t) : gt(e) ? i.disconnect(e, t, n) : i.disconnect();
}
class Ce extends $ {
  constructor() {
    const e = z(Ce.getDefaults(), arguments, [
      "gain",
      "units"
    ]);
    super(e), this.name = "Gain", this._gainNode = this.context.createGain(), this.input = this._gainNode, this.output = this._gainNode, this.gain = new re({
      context: this.context,
      convert: e.convert,
      param: this._gainNode.gain,
      units: e.units,
      value: e.gain,
      minValue: e.minValue,
      maxValue: e.maxValue
    }), ce(this, "gain");
  }
  static getDefaults() {
    return Object.assign($.getDefaults(), {
      convert: !0,
      gain: 1,
      units: "gain"
    });
  }
  /**
   * Clean up.
   */
  dispose() {
    return super.dispose(), this._gainNode.disconnect(), this.gain.dispose(), this;
  }
}
class zt extends $ {
  constructor(e) {
    super(e), this.onended = X, this._startTime = -1, this._stopTime = -1, this._timeout = -1, this.output = new Ce({
      context: this.context,
      gain: 0
    }), this._gainNode = this.output, this.getStateAtTime = function(t) {
      const n = this.toSeconds(t);
      return this._startTime !== -1 && n >= this._startTime && (this._stopTime === -1 || n <= this._stopTime) ? "started" : "stopped";
    }, this._fadeIn = e.fadeIn, this._fadeOut = e.fadeOut, this._curve = e.curve, this.onended = e.onended;
  }
  static getDefaults() {
    return Object.assign($.getDefaults(), {
      curve: "linear",
      fadeIn: 0,
      fadeOut: 0,
      onended: X
    });
  }
  /**
   * Start the source at the given time
   * @param  time When to start the source
   */
  _startGain(e, t = 1) {
    W(this._startTime === -1, "Source cannot be started more than once");
    const n = this.toSeconds(this._fadeIn);
    return this._startTime = e + n, this._startTime = Math.max(this._startTime, this.context.currentTime), n > 0 ? (this._gainNode.gain.setValueAtTime(0, e), this._curve === "linear" ? this._gainNode.gain.linearRampToValueAtTime(t, e + n) : this._gainNode.gain.exponentialApproachValueAtTime(t, e, n)) : this._gainNode.gain.setValueAtTime(t, e), this;
  }
  /**
   * Stop the source node at the given time.
   * @param time When to stop the source
   */
  stop(e) {
    return this.log("stop", e), this._stopGain(this.toSeconds(e)), this;
  }
  /**
   * Stop the source at the given time
   * @param  time When to stop the source
   */
  _stopGain(e) {
    W(this._startTime !== -1, "'start' must be called before 'stop'"), this.cancelStop();
    const t = this.toSeconds(this._fadeOut);
    return this._stopTime = this.toSeconds(e) + t, this._stopTime = Math.max(this._stopTime, this.now()), t > 0 ? this._curve === "linear" ? this._gainNode.gain.linearRampTo(0, t, e) : this._gainNode.gain.targetRampTo(0, t, e) : (this._gainNode.gain.cancelAndHoldAtTime(e), this._gainNode.gain.setValueAtTime(0, e)), this.context.clearTimeout(this._timeout), this._timeout = this.context.setTimeout(() => {
      const n = this._curve === "exponential" ? t * 2 : 0;
      this._stopSource(this.now() + n), this._onended();
    }, this._stopTime - this.context.currentTime), this;
  }
  /**
   * Invoke the onended callback
   */
  _onended() {
    if (this.onended !== X && (this.onended(this), this.onended = X, !this.context.isOffline)) {
      const e = () => this.dispose();
      typeof requestIdleCallback < "u" ? requestIdleCallback(e) : setTimeout(e, 10);
    }
  }
  /**
   * Get the playback state at the current time
   */
  get state() {
    return this.getStateAtTime(this.now());
  }
  /**
   * Cancel a scheduled stop event
   */
  cancelStop() {
    return this.log("cancelStop"), W(this._startTime !== -1, "Source is not started"), this._gainNode.gain.cancelScheduledValues(this._startTime + this.sampleTime), this.context.clearTimeout(this._timeout), this._stopTime = -1, this;
  }
  dispose() {
    return super.dispose(), this._gainNode.dispose(), this.onended = X, this;
  }
}
class Hs extends zt {
  constructor() {
    const e = z(Hs.getDefaults(), arguments, ["offset"]);
    super(e), this.name = "ToneConstantSource", this._source = this.context.createConstantSource(), Jt(this._source, this._gainNode), this.offset = new re({
      context: this.context,
      convert: e.convert,
      param: this._source.offset,
      units: e.units,
      value: e.offset,
      minValue: e.minValue,
      maxValue: e.maxValue
    });
  }
  static getDefaults() {
    return Object.assign(zt.getDefaults(), {
      convert: !0,
      offset: 1,
      units: "number"
    });
  }
  /**
   * Start the source node at the given time
   * @param  time When to start the source
   */
  start(e) {
    const t = this.toSeconds(e);
    return this.log("start", t), this._startGain(t), this._source.start(t), this;
  }
  _stopSource(e) {
    this._source.stop(e);
  }
  dispose() {
    return super.dispose(), this.state === "started" && this.stop(), this._source.disconnect(), this.offset.dispose(), this;
  }
}
class ve extends $ {
  constructor() {
    const e = z(ve.getDefaults(), arguments, [
      "value",
      "units"
    ]);
    super(e), this.name = "Signal", this.override = !0, this.output = this._constantSource = new Hs({
      context: this.context,
      convert: e.convert,
      offset: e.value,
      units: e.units,
      minValue: e.minValue,
      maxValue: e.maxValue
    }), this._constantSource.start(0), this.input = this._param = this._constantSource.offset;
  }
  static getDefaults() {
    return Object.assign($.getDefaults(), {
      convert: !0,
      units: "number",
      value: 0
    });
  }
  connect(e, t = 0, n = 0) {
    return Qs(this, e, t, n), this;
  }
  dispose() {
    return super.dispose(), this._param.dispose(), this._constantSource.dispose(), this;
  }
  //-------------------------------------
  // ABSTRACT PARAM INTERFACE
  // just a proxy for the ConstantSourceNode's offset AudioParam
  // all docs are generated from AbstractParam.ts
  //-------------------------------------
  setValueAtTime(e, t) {
    return this._param.setValueAtTime(e, t), this;
  }
  getValueAtTime(e) {
    return this._param.getValueAtTime(e);
  }
  setRampPoint(e) {
    return this._param.setRampPoint(e), this;
  }
  linearRampToValueAtTime(e, t) {
    return this._param.linearRampToValueAtTime(e, t), this;
  }
  exponentialRampToValueAtTime(e, t) {
    return this._param.exponentialRampToValueAtTime(e, t), this;
  }
  exponentialRampTo(e, t, n) {
    return this._param.exponentialRampTo(e, t, n), this;
  }
  linearRampTo(e, t, n) {
    return this._param.linearRampTo(e, t, n), this;
  }
  targetRampTo(e, t, n) {
    return this._param.targetRampTo(e, t, n), this;
  }
  exponentialApproachValueAtTime(e, t, n) {
    return this._param.exponentialApproachValueAtTime(e, t, n), this;
  }
  setTargetAtTime(e, t, n) {
    return this._param.setTargetAtTime(e, t, n), this;
  }
  setValueCurveAtTime(e, t, n, s) {
    return this._param.setValueCurveAtTime(e, t, n, s), this;
  }
  cancelScheduledValues(e) {
    return this._param.cancelScheduledValues(e), this;
  }
  cancelAndHoldAtTime(e) {
    return this._param.cancelAndHoldAtTime(e), this;
  }
  rampTo(e, t, n) {
    return this._param.rampTo(e, t, n), this;
  }
  get value() {
    return this._param.value;
  }
  set value(e) {
    this._param.value = e;
  }
  get convert() {
    return this._param.convert;
  }
  set convert(e) {
    this._param.convert = e;
  }
  get units() {
    return this._param.units;
  }
  get overridden() {
    return this._param.overridden;
  }
  set overridden(e) {
    this._param.overridden = e;
  }
  get maxValue() {
    return this._param.maxValue;
  }
  get minValue() {
    return this._param.minValue;
  }
  /**
   * @see {@link Param.apply}.
   */
  apply(e) {
    return this._param.apply(e), this;
  }
}
function Qs(i, e, t, n) {
  (e instanceof re || xt(e) || e instanceof ve && e.override) && (e.cancelScheduledValues(0), e.setValueAtTime(0, 0), e instanceof ve && (e.overridden = !0)), Jt(i, e, t, n);
}
class Xs extends re {
  constructor() {
    const e = z(Xs.getDefaults(), arguments, ["value"]);
    super(e), this.name = "TickParam", this._events = new $e(1 / 0), this._multiplier = 1, this._multiplier = e.multiplier, this._events.cancel(0), this._events.add({
      ticks: 0,
      time: 0,
      type: "setValueAtTime",
      value: this._fromType(e.value)
    }), this.setValueAtTime(e.value, 0);
  }
  static getDefaults() {
    return Object.assign(re.getDefaults(), {
      multiplier: 1,
      units: "hertz",
      value: 1
    });
  }
  setTargetAtTime(e, t, n) {
    t = this.toSeconds(t), this.setRampPoint(t);
    const s = this._fromType(e), r = this._events.get(t), o = Math.round(Math.max(1 / n, 1));
    for (let a = 0; a <= o; a++) {
      const c = n * a + t, l = this._exponentialApproach(r.time, r.value, s, n, c);
      this.linearRampToValueAtTime(this._toType(l), c);
    }
    return this;
  }
  setValueAtTime(e, t) {
    const n = this.toSeconds(t);
    super.setValueAtTime(e, t);
    const s = this._events.get(n), r = this._events.previousEvent(s), o = this._getTicksUntilEvent(r, n);
    return s.ticks = Math.max(o, 0), this;
  }
  linearRampToValueAtTime(e, t) {
    const n = this.toSeconds(t);
    super.linearRampToValueAtTime(e, t);
    const s = this._events.get(n), r = this._events.previousEvent(s), o = this._getTicksUntilEvent(r, n);
    return s.ticks = Math.max(o, 0), this;
  }
  exponentialRampToValueAtTime(e, t) {
    t = this.toSeconds(t);
    const n = this._fromType(e), s = this._events.get(t), r = Math.round(Math.max((t - s.time) * 10, 1)), o = (t - s.time) / r;
    for (let a = 0; a <= r; a++) {
      const c = o * a + s.time, l = this._exponentialInterpolate(s.time, s.value, t, n, c);
      this.linearRampToValueAtTime(this._toType(l), c);
    }
    return this;
  }
  /**
   * Returns the tick value at the time. Takes into account
   * any automation curves scheduled on the signal.
   * @param  event The time to get the tick count at
   * @return The number of ticks which have elapsed at the time given any automations.
   */
  _getTicksUntilEvent(e, t) {
    if (e === null)
      e = {
        ticks: 0,
        time: 0,
        type: "setValueAtTime",
        value: 0
      };
    else if (We(e.ticks)) {
      const o = this._events.previousEvent(e);
      e.ticks = this._getTicksUntilEvent(o, e.time);
    }
    const n = this._fromType(this.getValueAtTime(e.time));
    let s = this._fromType(this.getValueAtTime(t));
    const r = this._events.get(t);
    return r && r.time === t && r.type === "setValueAtTime" && (s = this._fromType(this.getValueAtTime(t - this.sampleTime))), 0.5 * (t - e.time) * (n + s) + e.ticks;
  }
  /**
   * Returns the tick value at the time. Takes into account
   * any automation curves scheduled on the signal.
   * @param  time The time to get the tick count at
   * @return The number of ticks which have elapsed at the time given any automations.
   */
  getTicksAtTime(e) {
    const t = this.toSeconds(e), n = this._events.get(t);
    return Math.max(this._getTicksUntilEvent(n, t), 0);
  }
  /**
   * Return the elapsed time of the number of ticks from the given time
   * @param ticks The number of ticks to calculate
   * @param  time The time to get the next tick from
   * @return The duration of the number of ticks from the given time in seconds
   */
  getDurationOfTicks(e, t) {
    const n = this.toSeconds(t), s = this.getTicksAtTime(t);
    return this.getTimeOfTick(s + e) - n;
  }
  /**
   * Given a tick, returns the time that tick occurs at.
   * @return The time that the tick occurs.
   */
  getTimeOfTick(e) {
    const t = this._events.get(e, "ticks"), n = this._events.getAfter(e, "ticks");
    if (t && t.ticks === e)
      return t.time;
    if (t && n && n.type === "linearRampToValueAtTime" && t.value !== n.value) {
      const s = this._fromType(this.getValueAtTime(t.time)), o = (this._fromType(this.getValueAtTime(n.time)) - s) / (n.time - t.time), a = Math.sqrt(Math.pow(s, 2) - 2 * o * (t.ticks - e)), c = (-s + a) / o, l = (-s - a) / o;
      return (c > 0 ? c : l) + t.time;
    } else return t ? t.value === 0 ? 1 / 0 : t.time + (e - t.ticks) / t.value : e / this._initialValue;
  }
  /**
   * Convert some number of ticks their the duration in seconds accounting
   * for any automation curves starting at the given time.
   * @param  ticks The number of ticks to convert to seconds.
   * @param  when  When along the automation timeline to convert the ticks.
   * @return The duration in seconds of the ticks.
   */
  ticksToTime(e, t) {
    return this.getDurationOfTicks(e, t);
  }
  /**
   * The inverse of {@link ticksToTime}. Convert a duration in
   * seconds to the corresponding number of ticks accounting for any
   * automation curves starting at the given time.
   * @param  duration The time interval to convert to ticks.
   * @param  when When along the automation timeline to convert the ticks.
   * @return The duration in ticks.
   */
  timeToTicks(e, t) {
    const n = this.toSeconds(t), s = this.toSeconds(e), r = this.getTicksAtTime(n);
    return this.getTicksAtTime(n + s) - r;
  }
  /**
   * Convert from the type when the unit value is BPM
   */
  _fromType(e) {
    return this.units === "bpm" && this.multiplier ? 1 / (60 / e / this.multiplier) : super._fromType(e);
  }
  /**
   * Special case of type conversion where the units === "bpm"
   */
  _toType(e) {
    return this.units === "bpm" && this.multiplier ? e / this.multiplier * 60 : super._toType(e);
  }
  /**
   * A multiplier on the bpm value. Useful for setting a PPQ relative to the base frequency value.
   */
  get multiplier() {
    return this._multiplier;
  }
  set multiplier(e) {
    const t = this.value;
    this._multiplier = e, this.cancelScheduledValues(0), this.setValueAtTime(t, 0);
  }
}
class Ys extends ve {
  constructor() {
    const e = z(Ys.getDefaults(), arguments, ["value"]);
    super(e), this.name = "TickSignal", this.input = this._param = new Xs({
      context: this.context,
      convert: e.convert,
      multiplier: e.multiplier,
      param: this._constantSource.offset,
      units: e.units,
      value: e.value
    });
  }
  static getDefaults() {
    return Object.assign(ve.getDefaults(), {
      multiplier: 1,
      units: "hertz",
      value: 1
    });
  }
  ticksToTime(e, t) {
    return this._param.ticksToTime(e, t);
  }
  timeToTicks(e, t) {
    return this._param.timeToTicks(e, t);
  }
  getTimeOfTick(e) {
    return this._param.getTimeOfTick(e);
  }
  getDurationOfTicks(e, t) {
    return this._param.getDurationOfTicks(e, t);
  }
  getTicksAtTime(e) {
    return this._param.getTicksAtTime(e);
  }
  /**
   * A multiplier on the bpm value. Useful for setting a PPQ relative to the base frequency value.
   */
  get multiplier() {
    return this._param.multiplier;
  }
  set multiplier(e) {
    this._param.multiplier = e;
  }
  dispose() {
    return super.dispose(), this._param.dispose(), this;
  }
}
class Zs extends De {
  constructor() {
    const e = z(Zs.getDefaults(), arguments, ["frequency"]);
    super(e), this.name = "TickSource", this._state = new Gs(), this._tickOffset = new $e(), this._ticksAtTime = new $e(), this._secondsAtTime = new $e(), this.frequency = new Ys({
      context: this.context,
      units: e.units,
      value: e.frequency
    }), ce(this, "frequency"), this._state.setStateAtTime("stopped", 0), this.setTicksAtTime(0, 0);
  }
  static getDefaults() {
    return Object.assign({
      frequency: 1,
      units: "hertz"
    }, De.getDefaults());
  }
  /**
   * Returns the playback state of the source, either "started", "stopped" or "paused".
   */
  get state() {
    return this.getStateAtTime(this.now());
  }
  /**
   * Start the clock at the given time. Optionally pass in an offset
   * of where to start the tick counter from.
   * @param  time    The time the clock should start
   * @param offset The number of ticks to start the source at
   */
  start(e, t) {
    const n = this.toSeconds(e);
    return this._state.getValueAtTime(n) !== "started" && (this._state.setStateAtTime("started", n), j(t) && this.setTicksAtTime(t, n), this._ticksAtTime.cancel(n), this._secondsAtTime.cancel(n)), this;
  }
  /**
   * Stop the clock. Stopping the clock resets the tick counter to 0.
   * @param time The time when the clock should stop.
   */
  stop(e) {
    const t = this.toSeconds(e);
    if (this._state.getValueAtTime(t) === "stopped") {
      const n = this._state.get(t);
      n && n.time > 0 && (this._tickOffset.cancel(n.time), this._state.cancel(n.time));
    }
    return this._state.cancel(t), this._state.setStateAtTime("stopped", t), this.setTicksAtTime(0, t), this._ticksAtTime.cancel(t), this._secondsAtTime.cancel(t), this;
  }
  /**
   * Pause the clock. Pausing does not reset the tick counter.
   * @param time The time when the clock should stop.
   */
  pause(e) {
    const t = this.toSeconds(e);
    return this._state.getValueAtTime(t) === "started" && (this._state.setStateAtTime("paused", t), this._ticksAtTime.cancel(t), this._secondsAtTime.cancel(t)), this;
  }
  /**
   * Cancel start/stop/pause and setTickAtTime events scheduled after the given time.
   * @param time When to clear the events after
   */
  cancel(e) {
    return e = this.toSeconds(e), this._state.cancel(e), this._tickOffset.cancel(e), this._ticksAtTime.cancel(e), this._secondsAtTime.cancel(e), this;
  }
  /**
   * Get the elapsed ticks at the given time
   * @param  time  When to get the tick value
   * @return The number of ticks
   */
  getTicksAtTime(e) {
    const t = this.toSeconds(e), n = this._state.getLastState("stopped", t), s = this._ticksAtTime.get(t), r = {
      state: "paused",
      time: t
    };
    this._state.add(r);
    let o = s || n, a = s ? s.ticks : 0, c = null;
    return this._state.forEachBetween(o.time, t + this.sampleTime, (l) => {
      let h = o.time;
      const u = this._tickOffset.get(l.time);
      u && u.time >= o.time && (a = u.ticks, h = u.time), o.state === "started" && l.state !== "started" && (a += this.frequency.getTicksAtTime(l.time) - this.frequency.getTicksAtTime(h), l.time !== r.time && (c = {
        state: l.state,
        time: l.time,
        ticks: a
      })), o = l;
    }), this._state.remove(r), c && this._ticksAtTime.add(c), a;
  }
  /**
   * The number of times the callback was invoked. Starts counting at 0
   * and increments after the callback was invoked. Returns -1 when stopped.
   */
  get ticks() {
    return this.getTicksAtTime(this.now());
  }
  set ticks(e) {
    this.setTicksAtTime(e, this.now());
  }
  /**
   * The time since ticks=0 that the TickSource has been running. Accounts
   * for tempo curves
   */
  get seconds() {
    return this.getSecondsAtTime(this.now());
  }
  set seconds(e) {
    const t = this.now(), n = this.frequency.timeToTicks(e, t);
    this.setTicksAtTime(n, t);
  }
  /**
   * Return the elapsed seconds at the given time.
   * @param  time  When to get the elapsed seconds
   * @return  The number of elapsed seconds
   */
  getSecondsAtTime(e) {
    e = this.toSeconds(e);
    const t = this._state.getLastState("stopped", e), n = { state: "paused", time: e };
    this._state.add(n);
    const s = this._secondsAtTime.get(e);
    let r = s || t, o = s ? s.seconds : 0, a = null;
    return this._state.forEachBetween(r.time, e + this.sampleTime, (c) => {
      let l = r.time;
      const h = this._tickOffset.get(c.time);
      h && h.time >= r.time && (o = h.seconds, l = h.time), r.state === "started" && c.state !== "started" && (o += c.time - l, c.time !== n.time && (a = {
        state: c.state,
        time: c.time,
        seconds: o
      })), r = c;
    }), this._state.remove(n), a && this._secondsAtTime.add(a), o;
  }
  /**
   * Set the clock's ticks at the given time.
   * @param  ticks The tick value to set
   * @param  time  When to set the tick value
   */
  setTicksAtTime(e, t) {
    return t = this.toSeconds(t), this._tickOffset.cancel(t), this._tickOffset.add({
      seconds: this.frequency.getDurationOfTicks(e, t),
      ticks: e,
      time: t
    }), this._ticksAtTime.cancel(t), this._secondsAtTime.cancel(t), this;
  }
  /**
   * Returns the scheduled state at the given time.
   * @param  time  The time to query.
   */
  getStateAtTime(e) {
    return e = this.toSeconds(e), this._state.getValueAtTime(e);
  }
  /**
   * Get the time of the given tick. The second argument
   * is when to test before. Since ticks can be set (with setTicksAtTime)
   * there may be multiple times for a given tick value.
   * @param  tick The tick number.
   * @param  before When to measure the tick value from.
   * @return The time of the tick
   */
  getTimeOfTick(e, t = this.now()) {
    const n = this._tickOffset.get(t), s = this._state.get(t), r = Math.max(n.time, s.time), o = this.frequency.getTicksAtTime(r) + e - n.ticks;
    return this.frequency.getTimeOfTick(o);
  }
  /**
   * Invoke the callback event at all scheduled ticks between the
   * start time and the end time
   * @param  startTime  The beginning of the search range
   * @param  endTime    The end of the search range
   * @param  callback   The callback to invoke with each tick
   */
  forEachTickBetween(e, t, n) {
    let s = this._state.get(e);
    this._state.forEachBetween(e, t, (o) => {
      s && s.state === "started" && o.state !== "started" && this.forEachTickBetween(Math.max(s.time, e), o.time - this.sampleTime, n), s = o;
    });
    let r = null;
    if (s && s.state === "started") {
      const o = Math.max(s.time, e), a = this.frequency.getTicksAtTime(o), c = this.frequency.getTicksAtTime(s.time), l = a - c;
      let h = Math.ceil(l) - l;
      h = je(h, 1) ? 0 : h;
      let u = this.frequency.getTimeOfTick(a + h);
      for (; u < t; ) {
        try {
          n(u, Math.round(this.getTicksAtTime(u)));
        } catch (d) {
          r = d;
          break;
        }
        u += this.frequency.getDurationOfTicks(1, u);
      }
    }
    if (r)
      throw r;
    return this;
  }
  /**
   * Clean up
   */
  dispose() {
    return super.dispose(), this._state.dispose(), this._tickOffset.dispose(), this._ticksAtTime.dispose(), this._secondsAtTime.dispose(), this.frequency.dispose(), this;
  }
}
class Jn extends De {
  constructor() {
    const e = z(Jn.getDefaults(), arguments, [
      "callback",
      "frequency"
    ]);
    super(e), this.name = "Clock", this.callback = X, this._lastUpdate = 0, this._state = new Gs("stopped"), this._boundLoop = this._loop.bind(this), this.callback = e.callback, this._tickSource = new Zs({
      context: this.context,
      frequency: e.frequency,
      units: e.units
    }), this._lastUpdate = 0, this.frequency = this._tickSource.frequency, ce(this, "frequency"), this._state.setStateAtTime("stopped", 0), this.context.on("tick", this._boundLoop);
  }
  static getDefaults() {
    return Object.assign(De.getDefaults(), {
      callback: X,
      frequency: 1,
      units: "hertz"
    });
  }
  /**
   * Returns the playback state of the source, either "started", "stopped" or "paused".
   */
  get state() {
    return this._state.getValueAtTime(this.now());
  }
  /**
   * Start the clock at the given time. Optionally pass in an offset
   * of where to start the tick counter from.
   * @param  time    The time the clock should start
   * @param offset  Where the tick counter starts counting from.
   */
  start(e, t) {
    xr(this.context);
    const n = this.toSeconds(e);
    return this.log("start", n), this._state.getValueAtTime(n) !== "started" && (this._state.setStateAtTime("started", n), this._tickSource.start(n, t), n < this._lastUpdate && this.emit("start", n, t)), this;
  }
  /**
   * Stop the clock. Stopping the clock resets the tick counter to 0.
   * @param time The time when the clock should stop.
   * @example
   * const clock = new Tone.Clock(time => {
   * 	console.log(time);
   * }, 1);
   * clock.start();
   * // stop the clock after 10 seconds
   * clock.stop("+10");
   */
  stop(e) {
    const t = this.toSeconds(e);
    return this.log("stop", t), this._state.cancel(t), this._state.setStateAtTime("stopped", t), this._tickSource.stop(t), t < this._lastUpdate && this.emit("stop", t), this;
  }
  /**
   * Pause the clock. Pausing does not reset the tick counter.
   * @param time The time when the clock should stop.
   */
  pause(e) {
    const t = this.toSeconds(e);
    return this._state.getValueAtTime(t) === "started" && (this._state.setStateAtTime("paused", t), this._tickSource.pause(t), t < this._lastUpdate && this.emit("pause", t)), this;
  }
  /**
   * The number of times the callback was invoked. Starts counting at 0
   * and increments after the callback was invoked.
   */
  get ticks() {
    return Math.ceil(this.getTicksAtTime(this.now()));
  }
  set ticks(e) {
    this._tickSource.ticks = e;
  }
  /**
   * The time since ticks=0 that the Clock has been running. Accounts for tempo curves
   */
  get seconds() {
    return this._tickSource.seconds;
  }
  set seconds(e) {
    this._tickSource.seconds = e;
  }
  /**
   * Return the elapsed seconds at the given time.
   * @param  time  When to get the elapsed seconds
   * @return  The number of elapsed seconds
   */
  getSecondsAtTime(e) {
    return this._tickSource.getSecondsAtTime(e);
  }
  /**
   * Set the clock's ticks at the given time.
   * @param  ticks The tick value to set
   * @param  time  When to set the tick value
   */
  setTicksAtTime(e, t) {
    return this._tickSource.setTicksAtTime(e, t), this;
  }
  /**
   * Get the time of the given tick. The second argument
   * is when to test before. Since ticks can be set (with setTicksAtTime)
   * there may be multiple times for a given tick value.
   * @param  tick The tick number.
   * @param  before When to measure the tick value from.
   * @return The time of the tick
   */
  getTimeOfTick(e, t = this.now()) {
    return this._tickSource.getTimeOfTick(e, t);
  }
  /**
   * Get the clock's ticks at the given time.
   * @param  time  When to get the tick value
   * @return The tick value at the given time.
   */
  getTicksAtTime(e) {
    return this._tickSource.getTicksAtTime(e);
  }
  /**
   * Get the time of the next tick
   * @param  offset The tick number.
   */
  nextTickTime(e, t) {
    const n = this.toSeconds(t), s = this.getTicksAtTime(n);
    return this._tickSource.getTimeOfTick(s + e, n);
  }
  /**
   * The scheduling loop.
   */
  _loop() {
    const e = this._lastUpdate, t = this.now();
    this._lastUpdate = t, this.log("loop", e, t), e !== t && (this._state.forEachBetween(e, t, (n) => {
      switch (n.state) {
        case "started":
          const s = this._tickSource.getTicksAtTime(n.time);
          this.emit("start", n.time, s);
          break;
        case "stopped":
          n.time !== 0 && this.emit("stop", n.time);
          break;
        case "paused":
          this.emit("pause", n.time);
          break;
      }
    }), this._tickSource.forEachTickBetween(e, t, (n, s) => {
      this.callback(n, s);
    }));
  }
  /**
   * Returns the scheduled state at the given time.
   * @param  time  The time to query.
   * @return  The name of the state input in setStateAtTime.
   * @example
   * const clock = new Tone.Clock();
   * clock.start("+0.1");
   * clock.getStateAtTime("+0.1"); // returns "started"
   */
  getStateAtTime(e) {
    const t = this.toSeconds(e);
    return this._state.getValueAtTime(t);
  }
  /**
   * Clean up
   */
  dispose() {
    return super.dispose(), this.context.off("tick", this._boundLoop), this._tickSource.dispose(), this._state.dispose(), this;
  }
}
_n.mixin(Jn);
class Kt extends $ {
  constructor() {
    const e = z(Kt.getDefaults(), arguments, [
      "volume"
    ]);
    super(e), this.name = "Volume", this.input = this.output = new Ce({
      context: this.context,
      gain: e.volume,
      units: "decibels"
    }), this.volume = this.output.gain, ce(this, "volume"), this._unmutedVolume = e.volume, this.mute = e.mute;
  }
  static getDefaults() {
    return Object.assign($.getDefaults(), {
      mute: !1,
      volume: 0
    });
  }
  /**
   * Mute the output.
   * @example
   * const vol = new Tone.Volume(-12).toDestination();
   * const osc = new Tone.Oscillator().connect(vol).start();
   * // mute the output
   * vol.mute = true;
   */
  get mute() {
    return this.volume.value === -1 / 0;
  }
  set mute(e) {
    !this.mute && e ? (this._unmutedVolume = this.volume.value, this.volume.value = -1 / 0) : this.mute && !e && (this.volume.value = this._unmutedVolume);
  }
  /**
   * clean up
   */
  dispose() {
    return super.dispose(), this.input.dispose(), this.volume.dispose(), this;
  }
}
class Js extends $ {
  constructor() {
    const e = z(Js.getDefaults(), arguments);
    super(e), this.name = "Destination", this.input = new Kt({ context: this.context }), this.output = new Ce({ context: this.context }), this.volume = this.input.volume, Ts(this.input, this.output, this.context.rawContext.destination), this.mute = e.mute, this._internalChannels = [
      this.input,
      this.context.rawContext.destination,
      this.output
    ];
  }
  static getDefaults() {
    return Object.assign($.getDefaults(), {
      mute: !1,
      volume: 0
    });
  }
  /**
   * Mute the output.
   * @example
   * const oscillator = new Tone.Oscillator().start().toDestination();
   * setTimeout(() => {
   * 	// mute the output
   * 	Tone.Destination.mute = true;
   * }, 1000);
   */
  get mute() {
    return this.input.mute;
  }
  set mute(e) {
    this.input.mute = e;
  }
  /**
   * Add a master effects chain. NOTE: this will disconnect any nodes which were previously
   * chained in the master effects chain.
   * @param args All arguments will be connected in a row and the Master will be routed through it.
   * @example
   * // route all audio through a filter and compressor
   * const lowpass = new Tone.Filter(800, "lowpass");
   * const compressor = new Tone.Compressor(-18);
   * Tone.Destination.chain(lowpass, compressor);
   */
  chain(...e) {
    return this.input.disconnect(), e.unshift(this.input), e.push(this.output), Ts(...e), this;
  }
  /**
   * The maximum number of channels the system can output
   * @example
   * console.log(Tone.Destination.maxChannelCount);
   */
  get maxChannelCount() {
    return this.context.rawContext.destination.maxChannelCount;
  }
  /**
   * Clean up
   */
  dispose() {
    return super.dispose(), this.volume.dispose(), this;
  }
}
Xn((i) => {
  i.destination = new Js({ context: i });
});
Yn((i) => {
  i.destination.dispose();
});
class Wu extends $ {
  constructor() {
    super(...arguments), this.name = "Listener", this.positionX = new re({
      context: this.context,
      param: this.context.rawContext.listener.positionX
    }), this.positionY = new re({
      context: this.context,
      param: this.context.rawContext.listener.positionY
    }), this.positionZ = new re({
      context: this.context,
      param: this.context.rawContext.listener.positionZ
    }), this.forwardX = new re({
      context: this.context,
      param: this.context.rawContext.listener.forwardX
    }), this.forwardY = new re({
      context: this.context,
      param: this.context.rawContext.listener.forwardY
    }), this.forwardZ = new re({
      context: this.context,
      param: this.context.rawContext.listener.forwardZ
    }), this.upX = new re({
      context: this.context,
      param: this.context.rawContext.listener.upX
    }), this.upY = new re({
      context: this.context,
      param: this.context.rawContext.listener.upY
    }), this.upZ = new re({
      context: this.context,
      param: this.context.rawContext.listener.upZ
    });
  }
  static getDefaults() {
    return Object.assign($.getDefaults(), {
      positionX: 0,
      positionY: 0,
      positionZ: 0,
      forwardX: 0,
      forwardY: 0,
      forwardZ: -1,
      upX: 0,
      upY: 1,
      upZ: 0
    });
  }
  dispose() {
    return super.dispose(), this.positionX.dispose(), this.positionY.dispose(), this.positionZ.dispose(), this.forwardX.dispose(), this.forwardY.dispose(), this.forwardZ.dispose(), this.upX.dispose(), this.upY.dispose(), this.upZ.dispose(), this;
  }
}
Xn((i) => {
  i.listener = new Wu({ context: i });
});
Yn((i) => {
  i.listener.dispose();
});
class Ks extends ht {
  constructor() {
    super(), this.name = "ToneAudioBuffers", this._buffers = /* @__PURE__ */ new Map(), this._loadingCount = 0;
    const e = z(Ks.getDefaults(), arguments, ["urls", "onload", "baseUrl"], "urls");
    this.baseUrl = e.baseUrl, Object.keys(e.urls).forEach((t) => {
      this._loadingCount++;
      const n = e.urls[t];
      this.add(t, n, this._bufferLoaded.bind(this, e.onload), e.onerror);
    });
  }
  static getDefaults() {
    return {
      baseUrl: "",
      onerror: X,
      onload: X,
      urls: {}
    };
  }
  /**
   * True if the buffers object has a buffer by that name.
   * @param  name  The key or index of the buffer.
   */
  has(e) {
    return this._buffers.has(e.toString());
  }
  /**
   * Get a buffer by name. If an array was loaded,
   * then use the array index.
   * @param  name  The key or index of the buffer.
   */
  get(e) {
    return W(this.has(e), `ToneAudioBuffers has no buffer named: ${e}`), this._buffers.get(e.toString());
  }
  /**
   * A buffer was loaded. decrement the counter.
   */
  _bufferLoaded(e) {
    this._loadingCount--, this._loadingCount === 0 && e && e();
  }
  /**
   * If the buffers are loaded or not
   */
  get loaded() {
    return Array.from(this._buffers).every(([e, t]) => t.loaded);
  }
  /**
   * Add a buffer by name and url to the Buffers
   * @param  name      A unique name to give the buffer
   * @param  url  Either the url of the bufer, or a buffer which will be added with the given name.
   * @param  callback  The callback to invoke when the url is loaded.
   * @param  onerror  Invoked if the buffer can't be loaded
   */
  add(e, t, n = X, s = X) {
    return ct(t) ? (this.baseUrl && t.trim().substring(0, 11).toLowerCase() === "data:audio/" && (this.baseUrl = ""), this._buffers.set(e.toString(), new te(this.baseUrl + t, n, s))) : this._buffers.set(e.toString(), new te(t, n, s)), this;
  }
  dispose() {
    return super.dispose(), this._buffers.forEach((e) => e.dispose()), this._buffers.clear(), this;
  }
}
class Rt extends sn {
  constructor() {
    super(...arguments), this.name = "Ticks", this.defaultUnits = "i";
  }
  /**
   * Get the current time in the given units
   */
  _now() {
    return this.context.transport.ticks;
  }
  /**
   * Return the value of the beats in the current units
   */
  _beatsToUnits(e) {
    return this._getPPQ() * e;
  }
  /**
   * Returns the value of a second in the current units
   */
  _secondsToUnits(e) {
    return Math.floor(e / (60 / this._getBpm()) * this._getPPQ());
  }
  /**
   * Returns the value of a tick in the current time units
   */
  _ticksToUnits(e) {
    return e;
  }
  /**
   * Return the time in ticks
   */
  toTicks() {
    return this.valueOf();
  }
  /**
   * Return the time in seconds
   */
  toSeconds() {
    return this.valueOf() / this._getPPQ() * (60 / this._getBpm());
  }
}
class $u extends De {
  constructor() {
    super(...arguments), this.name = "Draw", this.expiration = 0.25, this.anticipation = 8e-3, this._events = new $e(), this._boundDrawLoop = this._drawLoop.bind(this), this._animationFrame = -1;
  }
  /**
   * Schedule a function at the given time to be invoked
   * on the nearest animation frame.
   * @param  callback  Callback is invoked at the given time.
   * @param  time      The time relative to the AudioContext time to invoke the callback.
   * @example
   * Tone.Transport.scheduleRepeat(time => {
   * 	Tone.Draw.schedule(() => console.log(time), time);
   * }, 1);
   * Tone.Transport.start();
   */
  schedule(e, t) {
    return this._events.add({
      callback: e,
      time: this.toSeconds(t)
    }), this._events.length === 1 && (this._animationFrame = requestAnimationFrame(this._boundDrawLoop)), this;
  }
  /**
   * Cancel events scheduled after the given time
   * @param  after  Time after which scheduled events will be removed from the scheduling timeline.
   */
  cancel(e) {
    return this._events.cancel(this.toSeconds(e)), this;
  }
  /**
   * The draw loop
   */
  _drawLoop() {
    const e = this.context.currentTime;
    this._events.forEachBefore(e + this.anticipation, (t) => {
      e - t.time <= this.expiration && t.callback(), this._events.remove(t);
    }), this._events.length > 0 && (this._animationFrame = requestAnimationFrame(this._boundDrawLoop));
  }
  dispose() {
    return super.dispose(), this._events.dispose(), cancelAnimationFrame(this._animationFrame), this;
  }
}
Xn((i) => {
  i.draw = new $u({ context: i });
});
Yn((i) => {
  i.draw.dispose();
});
class ju extends ht {
  constructor() {
    super(...arguments), this.name = "IntervalTimeline", this._root = null, this._length = 0;
  }
  /**
   * The event to add to the timeline. All events must
   * have a time and duration value
   * @param  event  The event to add to the timeline
   */
  add(e) {
    W(j(e.time), "Events must have a time property"), W(j(e.duration), "Events must have a duration parameter"), e.time = e.time.valueOf();
    let t = new Gu(e.time, e.time + e.duration, e);
    for (this._root === null ? this._root = t : this._root.insert(t), this._length++; t !== null; )
      t.updateHeight(), t.updateMax(), this._rebalance(t), t = t.parent;
    return this;
  }
  /**
   * Remove an event from the timeline.
   * @param  event  The event to remove from the timeline
   */
  remove(e) {
    if (this._root !== null) {
      const t = [];
      this._root.search(e.time, t);
      for (const n of t)
        if (n.event === e) {
          this._removeNode(n), this._length--;
          break;
        }
    }
    return this;
  }
  /**
   * The number of items in the timeline.
   * @readOnly
   */
  get length() {
    return this._length;
  }
  /**
   * Remove events whose time time is after the given time
   * @param  after  The time to query.
   */
  cancel(e) {
    return this.forEachFrom(e, (t) => this.remove(t)), this;
  }
  /**
   * Set the root node as the given node
   */
  _setRoot(e) {
    this._root = e, this._root !== null && (this._root.parent = null);
  }
  /**
   * Replace the references to the node in the node's parent
   * with the replacement node.
   */
  _replaceNodeInParent(e, t) {
    e.parent !== null ? (e.isLeftChild() ? e.parent.left = t : e.parent.right = t, this._rebalance(e.parent)) : this._setRoot(t);
  }
  /**
   * Remove the node from the tree and replace it with
   * a successor which follows the schema.
   */
  _removeNode(e) {
    if (e.left === null && e.right === null)
      this._replaceNodeInParent(e, null);
    else if (e.right === null)
      this._replaceNodeInParent(e, e.left);
    else if (e.left === null)
      this._replaceNodeInParent(e, e.right);
    else {
      const t = e.getBalance();
      let n, s = null;
      if (t > 0)
        if (e.left.right === null)
          n = e.left, n.right = e.right, s = n;
        else {
          for (n = e.left.right; n.right !== null; )
            n = n.right;
          n.parent && (n.parent.right = n.left, s = n.parent, n.left = e.left, n.right = e.right);
        }
      else if (e.right.left === null)
        n = e.right, n.left = e.left, s = n;
      else {
        for (n = e.right.left; n.left !== null; )
          n = n.left;
        n.parent && (n.parent.left = n.right, s = n.parent, n.left = e.left, n.right = e.right);
      }
      e.parent !== null ? e.isLeftChild() ? e.parent.left = n : e.parent.right = n : this._setRoot(n), s && this._rebalance(s);
    }
    e.dispose();
  }
  /**
   * Rotate the tree to the left
   */
  _rotateLeft(e) {
    const t = e.parent, n = e.isLeftChild(), s = e.right;
    s && (e.right = s.left, s.left = e), t !== null ? n ? t.left = s : t.right = s : this._setRoot(s);
  }
  /**
   * Rotate the tree to the right
   */
  _rotateRight(e) {
    const t = e.parent, n = e.isLeftChild(), s = e.left;
    s && (e.left = s.right, s.right = e), t !== null ? n ? t.left = s : t.right = s : this._setRoot(s);
  }
  /**
   * Balance the BST
   */
  _rebalance(e) {
    const t = e.getBalance();
    t > 1 && e.left ? e.left.getBalance() < 0 ? this._rotateLeft(e.left) : this._rotateRight(e) : t < -1 && e.right && (e.right.getBalance() > 0 ? this._rotateRight(e.right) : this._rotateLeft(e));
  }
  /**
   * Get an event whose time and duration span the give time. Will
   * return the match whose "time" value is closest to the given time.
   * @return  The event which spans the desired time
   */
  get(e) {
    if (this._root !== null) {
      const t = [];
      if (this._root.search(e, t), t.length > 0) {
        let n = t[0];
        for (let s = 1; s < t.length; s++)
          t[s].low > n.low && (n = t[s]);
        return n.event;
      }
    }
    return null;
  }
  /**
   * Iterate over everything in the timeline.
   * @param  callback The callback to invoke with every item
   */
  forEach(e) {
    if (this._root !== null) {
      const t = [];
      this._root.traverse((n) => t.push(n)), t.forEach((n) => {
        n.event && e(n.event);
      });
    }
    return this;
  }
  /**
   * Iterate over everything in the array in which the given time
   * overlaps with the time and duration time of the event.
   * @param  time The time to check if items are overlapping
   * @param  callback The callback to invoke with every item
   */
  forEachAtTime(e, t) {
    if (this._root !== null) {
      const n = [];
      this._root.search(e, n), n.forEach((s) => {
        s.event && t(s.event);
      });
    }
    return this;
  }
  /**
   * Iterate over everything in the array in which the time is greater
   * than or equal to the given time.
   * @param  time The time to check if items are before
   * @param  callback The callback to invoke with every item
   */
  forEachFrom(e, t) {
    if (this._root !== null) {
      const n = [];
      this._root.searchAfter(e, n), n.forEach((s) => {
        s.event && t(s.event);
      });
    }
    return this;
  }
  /**
   * Clean up
   */
  dispose() {
    return super.dispose(), this._root !== null && this._root.traverse((e) => e.dispose()), this._root = null, this;
  }
}
class Gu {
  constructor(e, t, n) {
    this._left = null, this._right = null, this.parent = null, this.height = 0, this.event = n, this.low = e, this.high = t, this.max = this.high;
  }
  /**
   * Insert a node into the correct spot in the tree
   */
  insert(e) {
    e.low <= this.low ? this.left === null ? this.left = e : this.left.insert(e) : this.right === null ? this.right = e : this.right.insert(e);
  }
  /**
   * Search the tree for nodes which overlap
   * with the given point
   * @param  point  The point to query
   * @param  results  The array to put the results
   */
  search(e, t) {
    e > this.max || (this.left !== null && this.left.search(e, t), this.low <= e && this.high > e && t.push(this), !(this.low > e) && this.right !== null && this.right.search(e, t));
  }
  /**
   * Search the tree for nodes which are less
   * than the given point
   * @param  point  The point to query
   * @param  results  The array to put the results
   */
  searchAfter(e, t) {
    this.low >= e && (t.push(this), this.left !== null && this.left.searchAfter(e, t)), this.right !== null && this.right.searchAfter(e, t);
  }
  /**
   * Invoke the callback on this element and both it's branches
   * @param  {Function}  callback
   */
  traverse(e) {
    e(this), this.left !== null && this.left.traverse(e), this.right !== null && this.right.traverse(e);
  }
  /**
   * Update the height of the node
   */
  updateHeight() {
    this.left !== null && this.right !== null ? this.height = Math.max(this.left.height, this.right.height) + 1 : this.right !== null ? this.height = this.right.height + 1 : this.left !== null ? this.height = this.left.height + 1 : this.height = 0;
  }
  /**
   * Update the height of the node
   */
  updateMax() {
    this.max = this.high, this.left !== null && (this.max = Math.max(this.max, this.left.max)), this.right !== null && (this.max = Math.max(this.max, this.right.max));
  }
  /**
   * The balance is how the leafs are distributed on the node
   * @return  Negative numbers are balanced to the right
   */
  getBalance() {
    let e = 0;
    return this.left !== null && this.right !== null ? e = this.left.height - this.right.height : this.left !== null ? e = this.left.height + 1 : this.right !== null && (e = -(this.right.height + 1)), e;
  }
  /**
   * @returns true if this node is the left child of its parent
   */
  isLeftChild() {
    return this.parent !== null && this.parent.left === this;
  }
  /**
   * get/set the left node
   */
  get left() {
    return this._left;
  }
  set left(e) {
    this._left = e, e !== null && (e.parent = this), this.updateHeight(), this.updateMax();
  }
  /**
   * get/set the right node
   */
  get right() {
    return this._right;
  }
  set right(e) {
    this._right = e, e !== null && (e.parent = this), this.updateHeight(), this.updateMax();
  }
  /**
   * null out references.
   */
  dispose() {
    this.parent = null, this._left = null, this._right = null, this.event = null;
  }
}
class Hu extends ht {
  /**
   * @param initialValue The value to return if there is no scheduled values
   */
  constructor(e) {
    super(), this.name = "TimelineValue", this._timeline = new $e({
      memory: 10
    }), this._initialValue = e;
  }
  /**
   * Set the value at the given time
   */
  set(e, t) {
    return this._timeline.add({
      value: e,
      time: t
    }), this;
  }
  /**
   * Get the value at the given time
   */
  get(e) {
    const t = this._timeline.get(e);
    return t ? t.value : this._initialValue;
  }
}
class Wt extends $ {
  constructor() {
    super(z(Wt.getDefaults(), arguments, [
      "context"
    ]));
  }
  connect(e, t = 0, n = 0) {
    return Qs(this, e, t, n), this;
  }
}
class yn extends Wt {
  constructor() {
    const e = z(yn.getDefaults(), arguments, ["mapping", "length"]);
    super(e), this.name = "WaveShaper", this._shaper = this.context.createWaveShaper(), this.input = this._shaper, this.output = this._shaper, He(e.mapping) || e.mapping instanceof Float32Array ? this.curve = Float32Array.from(e.mapping) : gu(e.mapping) && this.setMap(e.mapping, e.length);
  }
  static getDefaults() {
    return Object.assign(ve.getDefaults(), {
      length: 1024
    });
  }
  /**
   * Uses a mapping function to set the value of the curve.
   * @param mapping The function used to define the values.
   *                The mapping function take two arguments:
   *                the first is the value at the current position
   *                which goes from -1 to 1 over the number of elements
   *                in the curve array. The second argument is the array position.
   * @example
   * const shaper = new Tone.WaveShaper();
   * // map the input signal from [-1, 1] to [0, 10]
   * shaper.setMap((val, index) => (val + 1) * 5);
   */
  setMap(e, t = 1024) {
    const n = new Float32Array(t);
    for (let s = 0, r = t; s < r; s++) {
      const o = s / (r - 1) * 2 - 1;
      n[s] = e(o, s);
    }
    return this.curve = n, this;
  }
  /**
   * The array to set as the waveshaper curve. For linear curves
   * array length does not make much difference, but for complex curves
   * longer arrays will provide smoother interpolation.
   */
  get curve() {
    return this._shaper.curve;
  }
  set curve(e) {
    this._shaper.curve = e;
  }
  /**
   * Specifies what type of oversampling (if any) should be used when
   * applying the shaping curve. Can either be "none", "2x" or "4x".
   */
  get oversample() {
    return this._shaper.oversample;
  }
  set oversample(e) {
    const t = ["none", "2x", "4x"].some((n) => n.includes(e));
    W(t, "oversampling must be either 'none', '2x', or '4x'"), this._shaper.oversample = e;
  }
  /**
   * Clean up.
   */
  dispose() {
    return super.dispose(), this._shaper.disconnect(), this;
  }
}
class ei extends Wt {
  constructor() {
    const e = z(ei.getDefaults(), arguments, [
      "value"
    ]);
    super(e), this.name = "Pow", this._exponentScaler = this.input = this.output = new yn({
      context: this.context,
      mapping: this._expFunc(e.value),
      length: 8192
    }), this._exponent = e.value;
  }
  static getDefaults() {
    return Object.assign(Wt.getDefaults(), {
      value: 1
    });
  }
  /**
   * the function which maps the waveshaper
   * @param exponent exponent value
   */
  _expFunc(e) {
    return (t) => Math.pow(Math.abs(t), e);
  }
  /**
   * The value of the exponent.
   */
  get value() {
    return this._exponent;
  }
  set value(e) {
    this._exponent = e, this._exponentScaler.setMap(this._expFunc(this._exponent));
  }
  /**
   * Clean up.
   */
  dispose() {
    return super.dispose(), this._exponentScaler.dispose(), this;
  }
}
class vt {
  /**
   * @param transport The transport object which the event belongs to
   */
  constructor(e, t) {
    this.id = vt._eventId++, this._remainderTime = 0;
    const n = Object.assign(vt.getDefaults(), t);
    this.transport = e, this.callback = n.callback, this._once = n.once, this.time = Math.floor(n.time), this._remainderTime = n.time - this.time;
  }
  static getDefaults() {
    return {
      callback: X,
      once: !1,
      time: 0
    };
  }
  /**
   * Get the time and remainder time.
   */
  get floatTime() {
    return this.time + this._remainderTime;
  }
  /**
   * Invoke the event callback.
   * @param  time  The AudioContext time in seconds of the event
   */
  invoke(e) {
    if (this.callback) {
      const t = this.transport.bpm.getDurationOfTicks(1, e);
      this.callback(e + this._remainderTime * t), this._once && this.transport.clear(this.id);
    }
  }
  /**
   * Clean up
   */
  dispose() {
    return this.callback = void 0, this;
  }
}
vt._eventId = 0;
class ti extends vt {
  /**
   * @param transport The transport object which the event belongs to
   */
  constructor(e, t) {
    super(e, t), this._currentId = -1, this._nextId = -1, this._nextTick = this.time, this._boundRestart = this._restart.bind(this);
    const n = Object.assign(ti.getDefaults(), t);
    this.duration = n.duration, this._interval = n.interval, this._nextTick = n.time, this.transport.on("start", this._boundRestart), this.transport.on("loopStart", this._boundRestart), this.transport.on("ticks", this._boundRestart), this.context = this.transport.context, this._restart();
  }
  static getDefaults() {
    return Object.assign({}, vt.getDefaults(), {
      duration: 1 / 0,
      interval: 1,
      once: !1
    });
  }
  /**
   * Invoke the callback. Returns the tick time which
   * the next event should be scheduled at.
   * @param  time  The AudioContext time in seconds of the event
   */
  invoke(e) {
    this._createEvents(e), super.invoke(e);
  }
  /**
   * Create an event on the transport on the nextTick
   */
  _createEvent() {
    return Vn(this._nextTick, this.floatTime + this.duration) ? this.transport.scheduleOnce(this.invoke.bind(this), new Rt(this.context, this._nextTick).toSeconds()) : -1;
  }
  /**
   * Push more events onto the timeline to keep up with the position of the timeline
   */
  _createEvents(e) {
    Vn(this._nextTick + this._interval, this.floatTime + this.duration) && (this._nextTick += this._interval, this._currentId = this._nextId, this._nextId = this.transport.scheduleOnce(this.invoke.bind(this), new Rt(this.context, this._nextTick).toSeconds()));
  }
  /**
   * Re-compute the events when the transport time has changed from a start/ticks/loopStart event
   */
  _restart(e) {
    this.transport.clear(this._currentId), this.transport.clear(this._nextId), this._nextTick = this.floatTime;
    const t = this.transport.getTicksAtTime(e);
    Ut(t, this.time) && (this._nextTick = this.floatTime + Math.ceil((t - this.floatTime) / this._interval) * this._interval), this._currentId = this._createEvent(), this._nextTick += this._interval, this._nextId = this._createEvent();
  }
  /**
   * Clean up
   */
  dispose() {
    return super.dispose(), this.transport.clear(this._currentId), this.transport.clear(this._nextId), this.transport.off("start", this._boundRestart), this.transport.off("loopStart", this._boundRestart), this.transport.off("ticks", this._boundRestart), this;
  }
}
class Kn extends De {
  constructor() {
    const e = z(Kn.getDefaults(), arguments);
    super(e), this.name = "Transport", this._loop = new Hu(!1), this._loopStart = 0, this._loopEnd = 0, this._scheduledEvents = {}, this._timeline = new $e(), this._repeatedEvents = new ju(), this._syncedSignals = [], this._swingAmount = 0, this._ppq = e.ppq, this._clock = new Jn({
      callback: this._processTick.bind(this),
      context: this.context,
      frequency: 0,
      units: "bpm"
    }), this._bindClockEvents(), this.bpm = this._clock.frequency, this._clock.frequency.multiplier = e.ppq, this.bpm.setValueAtTime(e.bpm, 0), ce(this, "bpm"), this._timeSignature = e.timeSignature, this._swingTicks = e.ppq / 2;
  }
  static getDefaults() {
    return Object.assign(De.getDefaults(), {
      bpm: 120,
      loopEnd: "4m",
      loopStart: 0,
      ppq: 192,
      swing: 0,
      swingSubdivision: "8n",
      timeSignature: 4
    });
  }
  //-------------------------------------
  // 	TICKS
  //-------------------------------------
  /**
   * called on every tick
   * @param  tickTime clock relative tick time
   */
  _processTick(e, t) {
    if (this._loop.get(e) && t >= this._loopEnd && (this.emit("loopEnd", e), this._clock.setTicksAtTime(this._loopStart, e), t = this._loopStart, this.emit("loopStart", e, this._clock.getSecondsAtTime(e)), this.emit("loop", e)), this._swingAmount > 0 && t % this._ppq !== 0 && // not on a downbeat
    t % (this._swingTicks * 2) !== 0) {
      const n = t % (this._swingTicks * 2) / (this._swingTicks * 2), s = Math.sin(n * Math.PI) * this._swingAmount;
      e += new Rt(this.context, this._swingTicks * 2 / 3).toSeconds() * s;
    }
    Ni(!0), this._timeline.forEachAtTime(t, (n) => n.invoke(e)), Ni(!1);
  }
  //-------------------------------------
  // 	SCHEDULABLE EVENTS
  //-------------------------------------
  /**
   * Schedule an event along the timeline.
   * @param callback The callback to be invoked at the time.
   * @param time The time to invoke the callback at.
   * @return The id of the event which can be used for canceling the event.
   * @example
   * // schedule an event on the 16th measure
   * Tone.getTransport().schedule((time) => {
   * 	// invoked on measure 16
   * 	console.log("measure 16!");
   * }, "16:0:0");
   */
  schedule(e, t) {
    const n = new vt(this, {
      callback: e,
      time: new sn(this.context, t).toTicks()
    });
    return this._addEvent(n, this._timeline);
  }
  /**
   * Schedule a repeated event along the timeline. The event will fire
   * at the `interval` starting at the `startTime` and for the specified
   * `duration`.
   * @param  callback   The callback to invoke.
   * @param  interval   The duration between successive callbacks. Must be a positive number.
   * @param  startTime  When along the timeline the events should start being invoked.
   * @param  duration How long the event should repeat.
   * @return  The ID of the scheduled event. Use this to cancel the event.
   * @example
   * const osc = new Tone.Oscillator().toDestination().start();
   * // a callback invoked every eighth note after the first measure
   * Tone.getTransport().scheduleRepeat((time) => {
   * 	osc.start(time).stop(time + 0.1);
   * }, "8n", "1m");
   */
  scheduleRepeat(e, t, n, s = 1 / 0) {
    const r = new ti(this, {
      callback: e,
      duration: new Ge(this.context, s).toTicks(),
      interval: new Ge(this.context, t).toTicks(),
      time: new sn(this.context, n).toTicks()
    });
    return this._addEvent(r, this._repeatedEvents);
  }
  /**
   * Schedule an event that will be removed after it is invoked.
   * @param callback The callback to invoke once.
   * @param time The time the callback should be invoked.
   * @returns The ID of the scheduled event.
   */
  scheduleOnce(e, t) {
    const n = new vt(this, {
      callback: e,
      once: !0,
      time: new sn(this.context, t).toTicks()
    });
    return this._addEvent(n, this._timeline);
  }
  /**
   * Clear the passed in event id from the timeline
   * @param eventId The id of the event.
   */
  clear(e) {
    if (this._scheduledEvents.hasOwnProperty(e)) {
      const t = this._scheduledEvents[e.toString()];
      t.timeline.remove(t.event), t.event.dispose(), delete this._scheduledEvents[e.toString()];
    }
    return this;
  }
  /**
   * Add an event to the correct timeline. Keep track of the
   * timeline it was added to.
   * @returns the event id which was just added
   */
  _addEvent(e, t) {
    return this._scheduledEvents[e.id.toString()] = {
      event: e,
      timeline: t
    }, t.add(e), e.id;
  }
  /**
   * Remove scheduled events from the timeline after
   * the given time. Repeated events will be removed
   * if their startTime is after the given time
   * @param after Clear all events after this time.
   */
  cancel(e = 0) {
    const t = this.toTicks(e);
    return this._timeline.forEachFrom(t, (n) => this.clear(n.id)), this._repeatedEvents.forEachFrom(t, (n) => this.clear(n.id)), this;
  }
  //-------------------------------------
  // 	START/STOP/PAUSE
  //-------------------------------------
  /**
   * Bind start/stop/pause events from the clock and emit them.
   */
  _bindClockEvents() {
    this._clock.on("start", (e, t) => {
      t = new Rt(this.context, t).toSeconds(), this.emit("start", e, t);
    }), this._clock.on("stop", (e) => {
      this.emit("stop", e);
    }), this._clock.on("pause", (e) => {
      this.emit("pause", e);
    });
  }
  /**
   * Returns the playback state of the source, either "started", "stopped", or "paused"
   */
  get state() {
    return this._clock.getStateAtTime(this.now());
  }
  /**
   * Start the transport and all sources synced to the transport.
   * @param  time The time when the transport should start.
   * @param  offset The timeline offset to start the transport.
   * @example
   * // start the transport in one second starting at beginning of the 5th measure.
   * Tone.getTransport().start("+1", "4:0:0");
   */
  start(e, t) {
    this.context.resume();
    let n;
    return j(t) && (n = this.toTicks(t)), this._clock.start(e, n), this;
  }
  /**
   * Stop the transport and all sources synced to the transport.
   * @param time The time when the transport should stop.
   * @example
   * Tone.getTransport().stop();
   */
  stop(e) {
    return this._clock.stop(e), this;
  }
  /**
   * Pause the transport and all sources synced to the transport.
   */
  pause(e) {
    return this._clock.pause(e), this;
  }
  /**
   * Toggle the current state of the transport. If it is
   * started, it will stop it, otherwise it will start the Transport.
   * @param  time The time of the event
   */
  toggle(e) {
    return e = this.toSeconds(e), this._clock.getStateAtTime(e) !== "started" ? this.start(e) : this.stop(e), this;
  }
  //-------------------------------------
  // 	SETTERS/GETTERS
  //-------------------------------------
  /**
   * The time signature as just the numerator over 4.
   * For example 4/4 would be just 4 and 6/8 would be 3.
   * @example
   * // common time
   * Tone.getTransport().timeSignature = 4;
   * // 7/8
   * Tone.getTransport().timeSignature = [7, 8];
   * // this will be reduced to a single number
   * Tone.getTransport().timeSignature; // returns 3.5
   */
  get timeSignature() {
    return this._timeSignature;
  }
  set timeSignature(e) {
    He(e) && (e = e[0] / e[1] * 4), this._timeSignature = e;
  }
  /**
   * When the Transport.loop = true, this is the starting position of the loop.
   */
  get loopStart() {
    return new Ge(this.context, this._loopStart, "i").toSeconds();
  }
  set loopStart(e) {
    this._loopStart = this.toTicks(e);
  }
  /**
   * When the Transport.loop = true, this is the ending position of the loop.
   */
  get loopEnd() {
    return new Ge(this.context, this._loopEnd, "i").toSeconds();
  }
  set loopEnd(e) {
    this._loopEnd = this.toTicks(e);
  }
  /**
   * If the transport loops or not.
   */
  get loop() {
    return this._loop.get(this.now());
  }
  set loop(e) {
    this._loop.set(e, this.now());
  }
  /**
   * Set the loop start and stop at the same time.
   * @example
   * // loop over the first measure
   * Tone.getTransport().setLoopPoints(0, "1m");
   * Tone.getTransport().loop = true;
   */
  setLoopPoints(e, t) {
    return this.loopStart = e, this.loopEnd = t, this;
  }
  /**
   * The swing value. Between 0-1 where 1 equal to the note + half the subdivision.
   */
  get swing() {
    return this._swingAmount;
  }
  set swing(e) {
    this._swingAmount = e;
  }
  /**
   * Set the subdivision which the swing will be applied to.
   * The default value is an 8th note. Value must be less
   * than a quarter note.
   */
  get swingSubdivision() {
    return new Rt(this.context, this._swingTicks).toNotation();
  }
  set swingSubdivision(e) {
    this._swingTicks = this.toTicks(e);
  }
  /**
   * The Transport's position in Bars:Beats:Sixteenths.
   * Setting the value will jump to that position right away.
   */
  get position() {
    const e = this.now(), t = this._clock.getTicksAtTime(e);
    return new Rt(this.context, t).toBarsBeatsSixteenths();
  }
  set position(e) {
    const t = this.toTicks(e);
    this.ticks = t;
  }
  /**
   * The Transport's position in seconds.
   * Setting the value will jump to that position right away.
   */
  get seconds() {
    return this._clock.seconds;
  }
  set seconds(e) {
    const t = this.now(), n = this._clock.frequency.timeToTicks(e, t);
    this.ticks = n;
  }
  /**
   * The Transport's loop position as a normalized value. Always
   * returns 0 if the Transport.loop = false.
   */
  get progress() {
    if (this.loop) {
      const e = this.now();
      return (this._clock.getTicksAtTime(e) - this._loopStart) / (this._loopEnd - this._loopStart);
    } else
      return 0;
  }
  /**
   * The Transport's current tick position.
   */
  get ticks() {
    return this._clock.ticks;
  }
  set ticks(e) {
    if (this._clock.ticks !== e) {
      const t = this.now();
      if (this.state === "started") {
        const n = this._clock.getTicksAtTime(t), s = this._clock.frequency.getDurationOfTicks(Math.ceil(n) - n, t), r = t + s;
        this.emit("stop", r), this._clock.setTicksAtTime(e, r), this.emit("start", r, this._clock.getSecondsAtTime(r));
      } else
        this.emit("ticks", t), this._clock.setTicksAtTime(e, t);
    }
  }
  /**
   * Get the clock's ticks at the given time.
   * @param  time  When to get the tick value
   * @return The tick value at the given time.
   */
  getTicksAtTime(e) {
    return this._clock.getTicksAtTime(e);
  }
  /**
   * Return the elapsed seconds at the given time.
   * @param  time  When to get the elapsed seconds
   * @return  The number of elapsed seconds
   */
  getSecondsAtTime(e) {
    return this._clock.getSecondsAtTime(e);
  }
  /**
   * Pulses Per Quarter note. This is the smallest resolution
   * the Transport timing supports. This should be set once
   * on initialization and not set again. Changing this value
   * after other objects have been created can cause problems.
   */
  get PPQ() {
    return this._clock.frequency.multiplier;
  }
  set PPQ(e) {
    this._clock.frequency.multiplier = e;
  }
  //-------------------------------------
  // 	SYNCING
  //-------------------------------------
  /**
   * Returns the time aligned to the next subdivision
   * of the Transport. If the Transport is not started,
   * it will return 0.
   * Note: this will not work precisely during tempo ramps.
   * @param  subdivision  The subdivision to quantize to
   * @return  The context time of the next subdivision.
   * @example
   * // the transport must be started, otherwise returns 0
   * Tone.getTransport().start();
   * Tone.getTransport().nextSubdivision("4n");
   */
  nextSubdivision(e) {
    if (e = this.toTicks(e), this.state !== "started")
      return 0;
    {
      const t = this.now(), n = this.getTicksAtTime(t), s = e - n % e;
      return this._clock.nextTickTime(s, t);
    }
  }
  /**
   * Attaches the signal to the tempo control signal so that
   * any changes in the tempo will change the signal in the same
   * ratio.
   *
   * @param signal
   * @param ratio Optionally pass in the ratio between the two signals.
   * 			Otherwise it will be computed based on their current values.
   */
  syncSignal(e, t) {
    const n = this.now();
    let s = this.bpm, r = 1 / (60 / s.getValueAtTime(n) / this.PPQ), o = [];
    if (e.units === "time") {
      const c = 0.015625 / r, l = new Ce(c), h = new ei(-1), u = new Ce(c);
      s.chain(l, h, u), s = u, r = 1 / r, o = [l, h, u];
    }
    t || (e.getValueAtTime(n) !== 0 ? t = e.getValueAtTime(n) / r : t = 0);
    const a = new Ce(t);
    return s.connect(a), a.connect(e._param), o.push(a), this._syncedSignals.push({
      initial: e.value,
      nodes: o,
      signal: e
    }), e.value = 0, this;
  }
  /**
   * Unsyncs a previously synced signal from the transport's control.
   * @see {@link syncSignal}.
   */
  unsyncSignal(e) {
    for (let t = this._syncedSignals.length - 1; t >= 0; t--) {
      const n = this._syncedSignals[t];
      n.signal === e && (n.nodes.forEach((s) => s.dispose()), n.signal.value = n.initial, this._syncedSignals.splice(t, 1));
    }
    return this;
  }
  /**
   * Clean up.
   */
  dispose() {
    return super.dispose(), this._clock.dispose(), Or(this, "bpm"), this._timeline.dispose(), this._repeatedEvents.dispose(), this;
  }
}
_n.mixin(Kn);
Xn((i) => {
  i.transport = new Kn({ context: i });
});
Yn((i) => {
  i.transport.dispose();
});
class Ve extends $ {
  constructor(e) {
    super(e), this.input = void 0, this._state = new Gs("stopped"), this._synced = !1, this._scheduled = [], this._syncedStart = X, this._syncedStop = X, this._state.memory = 100, this._state.increasing = !0, this._volume = this.output = new Kt({
      context: this.context,
      mute: e.mute,
      volume: e.volume
    }), this.volume = this._volume.volume, ce(this, "volume"), this.onstop = e.onstop;
  }
  static getDefaults() {
    return Object.assign($.getDefaults(), {
      mute: !1,
      onstop: X,
      volume: 0
    });
  }
  /**
   * Returns the playback state of the source, either "started" or "stopped".
   * @example
   * const player = new Tone.Player("https://tonejs.github.io/audio/berklee/ahntone_c3.mp3", () => {
   * 	player.start();
   * 	console.log(player.state);
   * }).toDestination();
   */
  get state() {
    return this._synced ? this.context.transport.state === "started" ? this._state.getValueAtTime(this.context.transport.seconds) : "stopped" : this._state.getValueAtTime(this.now());
  }
  /**
   * Mute the output.
   * @example
   * const osc = new Tone.Oscillator().toDestination().start();
   * // mute the output
   * osc.mute = true;
   */
  get mute() {
    return this._volume.mute;
  }
  set mute(e) {
    this._volume.mute = e;
  }
  /**
   * Ensure that the scheduled time is not before the current time.
   * Should only be used when scheduled unsynced.
   */
  _clampToCurrentTime(e) {
    return this._synced ? e : Math.max(e, this.context.currentTime);
  }
  /**
   * Start the source at the specified time. If no time is given,
   * start the source now.
   * @param  time When the source should be started.
   * @example
   * const source = new Tone.Oscillator().toDestination();
   * source.start("+0.5"); // starts the source 0.5 seconds from now
   */
  start(e, t, n) {
    let s = We(e) && this._synced ? this.context.transport.seconds : this.toSeconds(e);
    if (s = this._clampToCurrentTime(s), !this._synced && this._state.getValueAtTime(s) === "started")
      W(Ut(s, this._state.get(s).time), "Start time must be strictly greater than previous start time"), this._state.cancel(s), this._state.setStateAtTime("started", s), this.log("restart", s), this.restart(s, t, n);
    else if (this.log("start", s), this._state.setStateAtTime("started", s), this._synced) {
      const r = this._state.get(s);
      r && (r.offset = this.toSeconds(Vt(t, 0)), r.duration = n ? this.toSeconds(n) : void 0);
      const o = this.context.transport.schedule((a) => {
        this._start(a, t, n);
      }, s);
      this._scheduled.push(o), this.context.transport.state === "started" && this.context.transport.getSecondsAtTime(this.immediate()) > s && this._syncedStart(this.now(), this.context.transport.seconds);
    } else
      xr(this.context), this._start(s, t, n);
    return this;
  }
  /**
   * Stop the source at the specified time. If no time is given,
   * stop the source now.
   * @param  time When the source should be stopped.
   * @example
   * const source = new Tone.Oscillator().toDestination();
   * source.start();
   * source.stop("+0.5"); // stops the source 0.5 seconds from now
   */
  stop(e) {
    let t = We(e) && this._synced ? this.context.transport.seconds : this.toSeconds(e);
    if (t = this._clampToCurrentTime(t), this._state.getValueAtTime(t) === "started" || j(this._state.getNextState("started", t))) {
      if (this.log("stop", t), !this._synced)
        this._stop(t);
      else {
        const n = this.context.transport.schedule(this._stop.bind(this), t);
        this._scheduled.push(n);
      }
      this._state.cancel(t), this._state.setStateAtTime("stopped", t);
    }
    return this;
  }
  /**
   * Restart the source.
   */
  restart(e, t, n) {
    return e = this.toSeconds(e), this._state.getValueAtTime(e) === "started" && (this._state.cancel(e), this._restart(e, t, n)), this;
  }
  /**
   * Sync the source to the Transport so that all subsequent
   * calls to `start` and `stop` are synced to the TransportTime
   * instead of the AudioContext time.
   *
   * @example
   * const osc = new Tone.Oscillator().toDestination();
   * // sync the source so that it plays between 0 and 0.3 on the Transport's timeline
   * osc.sync().start(0).stop(0.3);
   * // start the transport.
   * Tone.Transport.start();
   * // set it to loop once a second
   * Tone.Transport.loop = true;
   * Tone.Transport.loopEnd = 1;
   */
  sync() {
    return this._synced || (this._synced = !0, this._syncedStart = (e, t) => {
      if (Ut(t, 0)) {
        const n = this._state.get(t);
        if (n && n.state === "started" && n.time !== t) {
          const s = t - this.toSeconds(n.time);
          let r;
          n.duration && (r = this.toSeconds(n.duration) - s), this._start(e, this.toSeconds(n.offset) + s, r);
        }
      }
    }, this._syncedStop = (e) => {
      const t = this.context.transport.getSecondsAtTime(Math.max(e - this.sampleTime, 0));
      this._state.getValueAtTime(t) === "started" && this._stop(e);
    }, this.context.transport.on("start", this._syncedStart), this.context.transport.on("loopStart", this._syncedStart), this.context.transport.on("stop", this._syncedStop), this.context.transport.on("pause", this._syncedStop), this.context.transport.on("loopEnd", this._syncedStop)), this;
  }
  /**
   * Unsync the source to the Transport.
   * @see {@link sync}
   */
  unsync() {
    return this._synced && (this.context.transport.off("stop", this._syncedStop), this.context.transport.off("pause", this._syncedStop), this.context.transport.off("loopEnd", this._syncedStop), this.context.transport.off("start", this._syncedStart), this.context.transport.off("loopStart", this._syncedStart)), this._synced = !1, this._scheduled.forEach((e) => this.context.transport.clear(e)), this._scheduled = [], this._state.cancel(0), this._stop(0), this;
  }
  /**
   * Clean up.
   */
  dispose() {
    return super.dispose(), this.onstop = X, this.unsync(), this._volume.dispose(), this._state.dispose(), this;
  }
}
class es extends zt {
  constructor() {
    const e = z(es.getDefaults(), arguments, ["url", "onload"]);
    super(e), this.name = "ToneBufferSource", this._source = this.context.createBufferSource(), this._internalChannels = [this._source], this._sourceStarted = !1, this._sourceStopped = !1, Jt(this._source, this._gainNode), this._source.onended = () => this._stopSource(), this.playbackRate = new re({
      context: this.context,
      param: this._source.playbackRate,
      units: "positive",
      value: e.playbackRate
    }), this.loop = e.loop, this.loopStart = e.loopStart, this.loopEnd = e.loopEnd, this._buffer = new te(e.url, e.onload, e.onerror), this._internalChannels.push(this._source);
  }
  static getDefaults() {
    return Object.assign(zt.getDefaults(), {
      url: new te(),
      loop: !1,
      loopEnd: 0,
      loopStart: 0,
      onload: X,
      onerror: X,
      playbackRate: 1
    });
  }
  /**
   * The fadeIn time of the amplitude envelope.
   */
  get fadeIn() {
    return this._fadeIn;
  }
  set fadeIn(e) {
    this._fadeIn = e;
  }
  /**
   * The fadeOut time of the amplitude envelope.
   */
  get fadeOut() {
    return this._fadeOut;
  }
  set fadeOut(e) {
    this._fadeOut = e;
  }
  /**
   * The curve applied to the fades, either "linear" or "exponential"
   */
  get curve() {
    return this._curve;
  }
  set curve(e) {
    this._curve = e;
  }
  /**
   * Start the buffer
   * @param  time When the player should start.
   * @param  offset The offset from the beginning of the sample to start at.
   * @param  duration How long the sample should play. If no duration is given, it will default to the full length of the sample (minus any offset)
   * @param  gain  The gain to play the buffer back at.
   */
  start(e, t, n, s = 1) {
    W(this.buffer.loaded, "buffer is either not set or not loaded");
    const r = this.toSeconds(e);
    this._startGain(r, s), this.loop ? t = Vt(t, this.loopStart) : t = Vt(t, 0);
    let o = Math.max(this.toSeconds(t), 0);
    if (this.loop) {
      const a = this.toSeconds(this.loopEnd) || this.buffer.duration, c = this.toSeconds(this.loopStart), l = a - c;
      Ss(o, a) && (o = (o - c) % l + c), je(o, this.buffer.duration) && (o = 0);
    }
    if (this._source.buffer = this.buffer.get(), this._source.loopEnd = this.toSeconds(this.loopEnd) || this.buffer.duration, Vn(o, this.buffer.duration) && (this._sourceStarted = !0, this._source.start(r, o)), j(n)) {
      let a = this.toSeconds(n);
      a = Math.max(a, 0), this.stop(r + a);
    }
    return this;
  }
  _stopSource(e) {
    !this._sourceStopped && this._sourceStarted && (this._sourceStopped = !0, this._source.stop(this.toSeconds(e)), this._onended());
  }
  /**
   * If loop is true, the loop will start at this position.
   */
  get loopStart() {
    return this._source.loopStart;
  }
  set loopStart(e) {
    this._source.loopStart = this.toSeconds(e);
  }
  /**
   * If loop is true, the loop will end at this position.
   */
  get loopEnd() {
    return this._source.loopEnd;
  }
  set loopEnd(e) {
    this._source.loopEnd = this.toSeconds(e);
  }
  /**
   * The audio buffer belonging to the player.
   */
  get buffer() {
    return this._buffer;
  }
  set buffer(e) {
    this._buffer.set(e);
  }
  /**
   * If the buffer should loop once it's over.
   */
  get loop() {
    return this._source.loop;
  }
  set loop(e) {
    this._source.loop = e, this._sourceStarted && this.cancelStop();
  }
  /**
   * Clean up.
   */
  dispose() {
    return super.dispose(), this._source.onended = null, this._source.disconnect(), this._buffer.dispose(), this.playbackRate.dispose(), this;
  }
}
function kt(i, e) {
  return fe(this, void 0, void 0, function* () {
    const t = e / i.context.sampleRate, n = new $s(1, t, i.context.sampleRate);
    return new i.constructor(Object.assign(i.get(), {
      // should do 2 iterations
      frequency: 2 / t,
      // zero out the detune
      detune: 0,
      context: n
    })).toDestination().start(0), (yield n.render()).getChannelData(0);
  });
}
class ni extends zt {
  constructor() {
    const e = z(ni.getDefaults(), arguments, ["frequency", "type"]);
    super(e), this.name = "ToneOscillatorNode", this._oscillator = this.context.createOscillator(), this._internalChannels = [this._oscillator], Jt(this._oscillator, this._gainNode), this.type = e.type, this.frequency = new re({
      context: this.context,
      param: this._oscillator.frequency,
      units: "frequency",
      value: e.frequency
    }), this.detune = new re({
      context: this.context,
      param: this._oscillator.detune,
      units: "cents",
      value: e.detune
    }), ce(this, ["frequency", "detune"]);
  }
  static getDefaults() {
    return Object.assign(zt.getDefaults(), {
      detune: 0,
      frequency: 440,
      type: "sine"
    });
  }
  /**
   * Start the oscillator node at the given time
   * @param  time When to start the oscillator
   */
  start(e) {
    const t = this.toSeconds(e);
    return this.log("start", t), this._startGain(t), this._oscillator.start(t), this;
  }
  _stopSource(e) {
    this._oscillator.stop(e);
  }
  /**
   * Sets an arbitrary custom periodic waveform given a PeriodicWave.
   * @param  periodicWave PeriodicWave should be created with context.createPeriodicWave
   */
  setPeriodicWave(e) {
    return this._oscillator.setPeriodicWave(e), this;
  }
  /**
   * The oscillator type. Either 'sine', 'sawtooth', 'square', or 'triangle'
   */
  get type() {
    return this._oscillator.type;
  }
  set type(e) {
    this._oscillator.type = e;
  }
  /**
   * Clean up.
   */
  dispose() {
    return super.dispose(), this.state === "started" && this.stop(), this._oscillator.disconnect(), this.frequency.dispose(), this.detune.dispose(), this;
  }
}
class de extends Ve {
  constructor() {
    const e = z(de.getDefaults(), arguments, ["frequency", "type"]);
    super(e), this.name = "Oscillator", this._oscillator = null, this.frequency = new ve({
      context: this.context,
      units: "frequency",
      value: e.frequency
    }), ce(this, "frequency"), this.detune = new ve({
      context: this.context,
      units: "cents",
      value: e.detune
    }), ce(this, "detune"), this._partials = e.partials, this._partialCount = e.partialCount, this._type = e.type, e.partialCount && e.type !== "custom" && (this._type = this.baseType + e.partialCount.toString()), this.phase = e.phase;
  }
  static getDefaults() {
    return Object.assign(Ve.getDefaults(), {
      detune: 0,
      frequency: 440,
      partialCount: 0,
      partials: [],
      phase: 0,
      type: "sine"
    });
  }
  /**
   * start the oscillator
   */
  _start(e) {
    const t = this.toSeconds(e), n = new ni({
      context: this.context,
      onended: () => this.onstop(this)
    });
    this._oscillator = n, this._wave ? this._oscillator.setPeriodicWave(this._wave) : this._oscillator.type = this._type, this._oscillator.connect(this.output), this.frequency.connect(this._oscillator.frequency), this.detune.connect(this._oscillator.detune), this._oscillator.start(t);
  }
  /**
   * stop the oscillator
   */
  _stop(e) {
    const t = this.toSeconds(e);
    this._oscillator && this._oscillator.stop(t);
  }
  /**
   * Restart the oscillator. Does not stop the oscillator, but instead
   * just cancels any scheduled 'stop' from being invoked.
   */
  _restart(e) {
    const t = this.toSeconds(e);
    return this.log("restart", t), this._oscillator && this._oscillator.cancelStop(), this._state.cancel(t), this;
  }
  /**
   * Sync the signal to the Transport's bpm. Any changes to the transports bpm,
   * will also affect the oscillators frequency.
   * @example
   * const osc = new Tone.Oscillator().toDestination().start();
   * osc.frequency.value = 440;
   * // the ratio between the bpm and the frequency will be maintained
   * osc.syncFrequency();
   * // double the tempo
   * Tone.Transport.bpm.value *= 2;
   * // the frequency of the oscillator is doubled to 880
   */
  syncFrequency() {
    return this.context.transport.syncSignal(this.frequency), this;
  }
  /**
   * Unsync the oscillator's frequency from the Transport.
   * @see {@link syncFrequency}
   */
  unsyncFrequency() {
    return this.context.transport.unsyncSignal(this.frequency), this;
  }
  /**
   * Get a cached periodic wave. Avoids having to recompute
   * the oscillator values when they have already been computed
   * with the same values.
   */
  _getCachedPeriodicWave() {
    if (this._type === "custom")
      return de._periodicWaveCache.find((t) => t.phase === this._phase && Eu(t.partials, this._partials));
    {
      const e = de._periodicWaveCache.find((t) => t.type === this._type && t.phase === this._phase);
      return this._partialCount = e ? e.partialCount : this._partialCount, e;
    }
  }
  get type() {
    return this._type;
  }
  set type(e) {
    this._type = e;
    const t = ["sine", "square", "sawtooth", "triangle"].indexOf(e) !== -1;
    if (this._phase === 0 && t)
      this._wave = void 0, this._partialCount = 0, this._oscillator !== null && (this._oscillator.type = e);
    else {
      const n = this._getCachedPeriodicWave();
      if (j(n)) {
        const { partials: s, wave: r } = n;
        this._wave = r, this._partials = s, this._oscillator !== null && this._oscillator.setPeriodicWave(this._wave);
      } else {
        const [s, r] = this._getRealImaginary(e, this._phase), o = this.context.createPeriodicWave(s, r);
        this._wave = o, this._oscillator !== null && this._oscillator.setPeriodicWave(this._wave), de._periodicWaveCache.push({
          imag: r,
          partialCount: this._partialCount,
          partials: this._partials,
          phase: this._phase,
          real: s,
          type: this._type,
          wave: this._wave
        }), de._periodicWaveCache.length > 100 && de._periodicWaveCache.shift();
      }
    }
  }
  get baseType() {
    return this._type.replace(this.partialCount.toString(), "");
  }
  set baseType(e) {
    this.partialCount && this._type !== "custom" && e !== "custom" ? this.type = e + this.partialCount : this.type = e;
  }
  get partialCount() {
    return this._partialCount;
  }
  set partialCount(e) {
    _t(e, 0);
    let t = this._type;
    const n = /^(sine|triangle|square|sawtooth)(\d+)$/.exec(this._type);
    if (n && (t = n[1]), this._type !== "custom")
      e === 0 ? this.type = t : this.type = t + e.toString();
    else {
      const s = new Float32Array(e);
      this._partials.forEach((r, o) => s[o] = r), this._partials = Array.from(s), this.type = this._type;
    }
  }
  /**
   * Returns the real and imaginary components based
   * on the oscillator type.
   * @returns [real: Float32Array, imaginary: Float32Array]
   */
  _getRealImaginary(e, t) {
    let s = 2048;
    const r = new Float32Array(s), o = new Float32Array(s);
    let a = 1;
    if (e === "custom") {
      if (a = this._partials.length + 1, this._partialCount = this._partials.length, s = a, this._partials.length === 0)
        return [r, o];
    } else {
      const c = /^(sine|triangle|square|sawtooth)(\d+)$/.exec(e);
      c ? (a = parseInt(c[2], 10) + 1, this._partialCount = parseInt(c[2], 10), e = c[1], a = Math.max(a, 2), s = a) : this._partialCount = 0, this._partials = [];
    }
    for (let c = 1; c < s; ++c) {
      const l = 2 / (c * Math.PI);
      let h;
      switch (e) {
        case "sine":
          h = c <= a ? 1 : 0, this._partials[c - 1] = h;
          break;
        case "square":
          h = c & 1 ? 2 * l : 0, this._partials[c - 1] = h;
          break;
        case "sawtooth":
          h = l * (c & 1 ? 1 : -1), this._partials[c - 1] = h;
          break;
        case "triangle":
          c & 1 ? h = 2 * (l * l) * (c - 1 >> 1 & 1 ? -1 : 1) : h = 0, this._partials[c - 1] = h;
          break;
        case "custom":
          h = this._partials[c - 1];
          break;
        default:
          throw new TypeError("Oscillator: invalid type: " + e);
      }
      h !== 0 ? (r[c] = -h * Math.sin(t * c), o[c] = h * Math.cos(t * c)) : (r[c] = 0, o[c] = 0);
    }
    return [r, o];
  }
  /**
   * Compute the inverse FFT for a given phase.
   */
  _inverseFFT(e, t, n) {
    let s = 0;
    const r = e.length;
    for (let o = 0; o < r; o++)
      s += e[o] * Math.cos(o * n) + t[o] * Math.sin(o * n);
    return s;
  }
  /**
   * Returns the initial value of the oscillator when stopped.
   * E.g. a "sine" oscillator with phase = 90 would return an initial value of -1.
   */
  getInitialValue() {
    const [e, t] = this._getRealImaginary(this._type, 0);
    let n = 0;
    const s = Math.PI * 2, r = 32;
    for (let o = 0; o < r; o++)
      n = Math.max(this._inverseFFT(e, t, o / r * s), n);
    return Nu(-this._inverseFFT(e, t, this._phase) / n, -1, 1);
  }
  get partials() {
    return this._partials.slice(0, this.partialCount);
  }
  set partials(e) {
    this._partials = e, this._partialCount = this._partials.length, e.length && (this.type = "custom");
  }
  get phase() {
    return this._phase * (180 / Math.PI);
  }
  set phase(e) {
    this._phase = e * Math.PI / 180, this.type = this._type;
  }
  asArray() {
    return fe(this, arguments, void 0, function* (e = 1024) {
      return kt(this, e);
    });
  }
  dispose() {
    return super.dispose(), this._oscillator !== null && this._oscillator.dispose(), this._wave = void 0, this.frequency.dispose(), this.detune.dispose(), this;
  }
}
de._periodicWaveCache = [];
class Qu extends Wt {
  constructor() {
    super(...arguments), this.name = "AudioToGain", this._norm = new yn({
      context: this.context,
      mapping: (e) => (e + 1) / 2
    }), this.input = this._norm, this.output = this._norm;
  }
  /**
   * clean up
   */
  dispose() {
    return super.dispose(), this._norm.dispose(), this;
  }
}
class $t extends ve {
  constructor() {
    const e = z($t.getDefaults(), arguments, ["value"]);
    super(e), this.name = "Multiply", this.override = !1, this._mult = this.input = this.output = new Ce({
      context: this.context,
      minValue: e.minValue,
      maxValue: e.maxValue
    }), this.factor = this._param = this._mult.gain, this.factor.setValueAtTime(e.value, 0);
  }
  static getDefaults() {
    return Object.assign(ve.getDefaults(), {
      value: 0
    });
  }
  dispose() {
    return super.dispose(), this._mult.dispose(), this;
  }
}
class ts extends Ve {
  constructor() {
    const e = z(ts.getDefaults(), arguments, ["frequency", "type", "modulationType"]);
    super(e), this.name = "AMOscillator", this._modulationScale = new Qu({ context: this.context }), this._modulationNode = new Ce({
      context: this.context
    }), this._carrier = new de({
      context: this.context,
      detune: e.detune,
      frequency: e.frequency,
      onstop: () => this.onstop(this),
      phase: e.phase,
      type: e.type
    }), this.frequency = this._carrier.frequency, this.detune = this._carrier.detune, this._modulator = new de({
      context: this.context,
      phase: e.phase,
      type: e.modulationType
    }), this.harmonicity = new $t({
      context: this.context,
      units: "positive",
      value: e.harmonicity
    }), this.frequency.chain(this.harmonicity, this._modulator.frequency), this._modulator.chain(this._modulationScale, this._modulationNode.gain), this._carrier.chain(this._modulationNode, this.output), ce(this, ["frequency", "detune", "harmonicity"]);
  }
  static getDefaults() {
    return Object.assign(de.getDefaults(), {
      harmonicity: 1,
      modulationType: "square"
    });
  }
  /**
   * start the oscillator
   */
  _start(e) {
    this._modulator.start(e), this._carrier.start(e);
  }
  /**
   * stop the oscillator
   */
  _stop(e) {
    this._modulator.stop(e), this._carrier.stop(e);
  }
  _restart(e) {
    this._modulator.restart(e), this._carrier.restart(e);
  }
  /**
   * The type of the carrier oscillator
   */
  get type() {
    return this._carrier.type;
  }
  set type(e) {
    this._carrier.type = e;
  }
  get baseType() {
    return this._carrier.baseType;
  }
  set baseType(e) {
    this._carrier.baseType = e;
  }
  get partialCount() {
    return this._carrier.partialCount;
  }
  set partialCount(e) {
    this._carrier.partialCount = e;
  }
  /**
   * The type of the modulator oscillator
   */
  get modulationType() {
    return this._modulator.type;
  }
  set modulationType(e) {
    this._modulator.type = e;
  }
  get phase() {
    return this._carrier.phase;
  }
  set phase(e) {
    this._carrier.phase = e, this._modulator.phase = e;
  }
  get partials() {
    return this._carrier.partials;
  }
  set partials(e) {
    this._carrier.partials = e;
  }
  asArray() {
    return fe(this, arguments, void 0, function* (e = 1024) {
      return kt(this, e);
    });
  }
  /**
   * Clean up.
   */
  dispose() {
    return super.dispose(), this.frequency.dispose(), this.detune.dispose(), this.harmonicity.dispose(), this._carrier.dispose(), this._modulator.dispose(), this._modulationNode.dispose(), this._modulationScale.dispose(), this;
  }
}
class ns extends Ve {
  constructor() {
    const e = z(ns.getDefaults(), arguments, ["frequency", "type", "modulationType"]);
    super(e), this.name = "FMOscillator", this._modulationNode = new Ce({
      context: this.context,
      gain: 0
    }), this._carrier = new de({
      context: this.context,
      detune: e.detune,
      frequency: 0,
      onstop: () => this.onstop(this),
      phase: e.phase,
      type: e.type
    }), this.detune = this._carrier.detune, this.frequency = new ve({
      context: this.context,
      units: "frequency",
      value: e.frequency
    }), this._modulator = new de({
      context: this.context,
      phase: e.phase,
      type: e.modulationType
    }), this.harmonicity = new $t({
      context: this.context,
      units: "positive",
      value: e.harmonicity
    }), this.modulationIndex = new $t({
      context: this.context,
      units: "positive",
      value: e.modulationIndex
    }), this.frequency.connect(this._carrier.frequency), this.frequency.chain(this.harmonicity, this._modulator.frequency), this.frequency.chain(this.modulationIndex, this._modulationNode), this._modulator.connect(this._modulationNode.gain), this._modulationNode.connect(this._carrier.frequency), this._carrier.connect(this.output), this.detune.connect(this._modulator.detune), ce(this, [
      "modulationIndex",
      "frequency",
      "detune",
      "harmonicity"
    ]);
  }
  static getDefaults() {
    return Object.assign(de.getDefaults(), {
      harmonicity: 1,
      modulationIndex: 2,
      modulationType: "square"
    });
  }
  /**
   * start the oscillator
   */
  _start(e) {
    this._modulator.start(e), this._carrier.start(e);
  }
  /**
   * stop the oscillator
   */
  _stop(e) {
    this._modulator.stop(e), this._carrier.stop(e);
  }
  _restart(e) {
    return this._modulator.restart(e), this._carrier.restart(e), this;
  }
  get type() {
    return this._carrier.type;
  }
  set type(e) {
    this._carrier.type = e;
  }
  get baseType() {
    return this._carrier.baseType;
  }
  set baseType(e) {
    this._carrier.baseType = e;
  }
  get partialCount() {
    return this._carrier.partialCount;
  }
  set partialCount(e) {
    this._carrier.partialCount = e;
  }
  /**
   * The type of the modulator oscillator
   */
  get modulationType() {
    return this._modulator.type;
  }
  set modulationType(e) {
    this._modulator.type = e;
  }
  get phase() {
    return this._carrier.phase;
  }
  set phase(e) {
    this._carrier.phase = e, this._modulator.phase = e;
  }
  get partials() {
    return this._carrier.partials;
  }
  set partials(e) {
    this._carrier.partials = e;
  }
  asArray() {
    return fe(this, arguments, void 0, function* (e = 1024) {
      return kt(this, e);
    });
  }
  /**
   * Clean up.
   */
  dispose() {
    return super.dispose(), this.frequency.dispose(), this.harmonicity.dispose(), this._carrier.dispose(), this._modulator.dispose(), this._modulationNode.dispose(), this.modulationIndex.dispose(), this;
  }
}
class Sn extends Ve {
  constructor() {
    const e = z(Sn.getDefaults(), arguments, ["frequency", "width"]);
    super(e), this.name = "PulseOscillator", this._widthGate = new Ce({
      context: this.context,
      gain: 0
    }), this._thresh = new yn({
      context: this.context,
      mapping: (t) => t <= 0 ? -1 : 1
    }), this.width = new ve({
      context: this.context,
      units: "audioRange",
      value: e.width
    }), this._triangle = new de({
      context: this.context,
      detune: e.detune,
      frequency: e.frequency,
      onstop: () => this.onstop(this),
      phase: e.phase,
      type: "triangle"
    }), this.frequency = this._triangle.frequency, this.detune = this._triangle.detune, this._triangle.chain(this._thresh, this.output), this.width.chain(this._widthGate, this._thresh), ce(this, ["width", "frequency", "detune"]);
  }
  static getDefaults() {
    return Object.assign(Ve.getDefaults(), {
      detune: 0,
      frequency: 440,
      phase: 0,
      type: "pulse",
      width: 0.2
    });
  }
  /**
   * start the oscillator
   */
  _start(e) {
    e = this.toSeconds(e), this._triangle.start(e), this._widthGate.gain.setValueAtTime(1, e);
  }
  /**
   * stop the oscillator
   */
  _stop(e) {
    e = this.toSeconds(e), this._triangle.stop(e), this._widthGate.gain.cancelScheduledValues(e), this._widthGate.gain.setValueAtTime(0, e);
  }
  _restart(e) {
    this._triangle.restart(e), this._widthGate.gain.cancelScheduledValues(e), this._widthGate.gain.setValueAtTime(1, e);
  }
  /**
   * The phase of the oscillator in degrees.
   */
  get phase() {
    return this._triangle.phase;
  }
  set phase(e) {
    this._triangle.phase = e;
  }
  /**
   * The type of the oscillator. Always returns "pulse".
   */
  get type() {
    return "pulse";
  }
  /**
   * The baseType of the oscillator. Always returns "pulse".
   */
  get baseType() {
    return "pulse";
  }
  /**
   * The partials of the waveform. Cannot set partials for this waveform type
   */
  get partials() {
    return [];
  }
  /**
   * No partials for this waveform type.
   */
  get partialCount() {
    return 0;
  }
  /**
   * *Internal use* The carrier oscillator type is fed through the
   * waveshaper node to create the pulse. Using different carrier oscillators
   * changes oscillator's behavior.
   */
  set carrierType(e) {
    this._triangle.type = e;
  }
  asArray() {
    return fe(this, arguments, void 0, function* (e = 1024) {
      return kt(this, e);
    });
  }
  /**
   * Clean up method.
   */
  dispose() {
    return super.dispose(), this._triangle.dispose(), this.width.dispose(), this._widthGate.dispose(), this._thresh.dispose(), this;
  }
}
class ss extends Ve {
  constructor() {
    const e = z(ss.getDefaults(), arguments, ["frequency", "type", "spread"]);
    super(e), this.name = "FatOscillator", this._oscillators = [], this.frequency = new ve({
      context: this.context,
      units: "frequency",
      value: e.frequency
    }), this.detune = new ve({
      context: this.context,
      units: "cents",
      value: e.detune
    }), this._spread = e.spread, this._type = e.type, this._phase = e.phase, this._partials = e.partials, this._partialCount = e.partialCount, this.count = e.count, ce(this, ["frequency", "detune"]);
  }
  static getDefaults() {
    return Object.assign(de.getDefaults(), {
      count: 3,
      spread: 20,
      type: "sawtooth"
    });
  }
  /**
   * start the oscillator
   */
  _start(e) {
    e = this.toSeconds(e), this._forEach((t) => t.start(e));
  }
  /**
   * stop the oscillator
   */
  _stop(e) {
    e = this.toSeconds(e), this._forEach((t) => t.stop(e));
  }
  _restart(e) {
    this._forEach((t) => t.restart(e));
  }
  /**
   * Iterate over all of the oscillators
   */
  _forEach(e) {
    for (let t = 0; t < this._oscillators.length; t++)
      e(this._oscillators[t], t);
  }
  /**
   * The type of the oscillator
   */
  get type() {
    return this._type;
  }
  set type(e) {
    this._type = e, this._forEach((t) => t.type = e);
  }
  /**
   * The detune spread between the oscillators. If "count" is
   * set to 3 oscillators and the "spread" is set to 40,
   * the three oscillators would be detuned like this: [-20, 0, 20]
   * for a total detune spread of 40 cents.
   * @example
   * const fatOsc = new Tone.FatOscillator().toDestination().start();
   * fatOsc.spread = 70;
   */
  get spread() {
    return this._spread;
  }
  set spread(e) {
    if (this._spread = e, this._oscillators.length > 1) {
      const t = -e / 2, n = e / (this._oscillators.length - 1);
      this._forEach((s, r) => s.detune.value = t + n * r);
    }
  }
  /**
   * The number of detuned oscillators. Must be an integer greater than 1.
   * @example
   * const fatOsc = new Tone.FatOscillator("C#3", "sawtooth").toDestination().start();
   * // use 4 sawtooth oscillators
   * fatOsc.count = 4;
   */
  get count() {
    return this._oscillators.length;
  }
  set count(e) {
    if (_t(e, 1), this._oscillators.length !== e) {
      this._forEach((t) => t.dispose()), this._oscillators = [];
      for (let t = 0; t < e; t++) {
        const n = new de({
          context: this.context,
          volume: -6 - e * 1.1,
          type: this._type,
          phase: this._phase + t / e * 360,
          partialCount: this._partialCount,
          onstop: t === 0 ? () => this.onstop(this) : X
        });
        this.type === "custom" && (n.partials = this._partials), this.frequency.connect(n.frequency), this.detune.connect(n.detune), n.detune.overridden = !1, n.connect(this.output), this._oscillators[t] = n;
      }
      this.spread = this._spread, this.state === "started" && this._forEach((t) => t.start());
    }
  }
  get phase() {
    return this._phase;
  }
  set phase(e) {
    this._phase = e, this._forEach((t, n) => t.phase = this._phase + n / this.count * 360);
  }
  get baseType() {
    return this._oscillators[0].baseType;
  }
  set baseType(e) {
    this._forEach((t) => t.baseType = e), this._type = this._oscillators[0].type;
  }
  get partials() {
    return this._oscillators[0].partials;
  }
  set partials(e) {
    this._partials = e, this._partialCount = this._partials.length, e.length && (this._type = "custom", this._forEach((t) => t.partials = e));
  }
  get partialCount() {
    return this._oscillators[0].partialCount;
  }
  set partialCount(e) {
    this._partialCount = e, this._forEach((t) => t.partialCount = e), this._type = this._oscillators[0].type;
  }
  asArray() {
    return fe(this, arguments, void 0, function* (e = 1024) {
      return kt(this, e);
    });
  }
  /**
   * Clean up.
   */
  dispose() {
    return super.dispose(), this.frequency.dispose(), this.detune.dispose(), this._forEach((e) => e.dispose()), this;
  }
}
class is extends Ve {
  constructor() {
    const e = z(is.getDefaults(), arguments, ["frequency", "modulationFrequency"]);
    super(e), this.name = "PWMOscillator", this.sourceType = "pwm", this._scale = new $t({
      context: this.context,
      value: 2
    }), this._pulse = new Sn({
      context: this.context,
      frequency: e.modulationFrequency
    }), this._pulse.carrierType = "sine", this.modulationFrequency = this._pulse.frequency, this._modulator = new de({
      context: this.context,
      detune: e.detune,
      frequency: e.frequency,
      onstop: () => this.onstop(this),
      phase: e.phase
    }), this.frequency = this._modulator.frequency, this.detune = this._modulator.detune, this._modulator.chain(this._scale, this._pulse.width), this._pulse.connect(this.output), ce(this, ["modulationFrequency", "frequency", "detune"]);
  }
  static getDefaults() {
    return Object.assign(Ve.getDefaults(), {
      detune: 0,
      frequency: 440,
      modulationFrequency: 0.4,
      phase: 0,
      type: "pwm"
    });
  }
  /**
   * start the oscillator
   */
  _start(e) {
    e = this.toSeconds(e), this._modulator.start(e), this._pulse.start(e);
  }
  /**
   * stop the oscillator
   */
  _stop(e) {
    e = this.toSeconds(e), this._modulator.stop(e), this._pulse.stop(e);
  }
  /**
   * restart the oscillator
   */
  _restart(e) {
    this._modulator.restart(e), this._pulse.restart(e);
  }
  /**
   * The type of the oscillator. Always returns "pwm".
   */
  get type() {
    return "pwm";
  }
  /**
   * The baseType of the oscillator. Always returns "pwm".
   */
  get baseType() {
    return "pwm";
  }
  /**
   * The partials of the waveform. Cannot set partials for this waveform type
   */
  get partials() {
    return [];
  }
  /**
   * No partials for this waveform type.
   */
  get partialCount() {
    return 0;
  }
  /**
   * The phase of the oscillator in degrees.
   */
  get phase() {
    return this._modulator.phase;
  }
  set phase(e) {
    this._modulator.phase = e;
  }
  asArray() {
    return fe(this, arguments, void 0, function* (e = 1024) {
      return kt(this, e);
    });
  }
  /**
   * Clean up.
   */
  dispose() {
    return super.dispose(), this._pulse.dispose(), this._scale.dispose(), this._modulator.dispose(), this;
  }
}
const ki = {
  am: ts,
  fat: ss,
  fm: ns,
  oscillator: de,
  pulse: Sn,
  pwm: is
};
class Ln extends Ve {
  constructor() {
    const e = z(Ln.getDefaults(), arguments, ["frequency", "type"]);
    super(e), this.name = "OmniOscillator", this.frequency = new ve({
      context: this.context,
      units: "frequency",
      value: e.frequency
    }), this.detune = new ve({
      context: this.context,
      units: "cents",
      value: e.detune
    }), ce(this, ["frequency", "detune"]), this.set(e);
  }
  static getDefaults() {
    return Object.assign(de.getDefaults(), ns.getDefaults(), ts.getDefaults(), ss.getDefaults(), Sn.getDefaults(), is.getDefaults());
  }
  /**
   * start the oscillator
   */
  _start(e) {
    this._oscillator.start(e);
  }
  /**
   * start the oscillator
   */
  _stop(e) {
    this._oscillator.stop(e);
  }
  _restart(e) {
    return this._oscillator.restart(e), this;
  }
  /**
   * The type of the oscillator. Can be any of the basic types: sine, square, triangle, sawtooth. Or
   * prefix the basic types with "fm", "am", or "fat" to use the FMOscillator, AMOscillator or FatOscillator
   * types. The oscillator could also be set to "pwm" or "pulse". All of the parameters of the
   * oscillator's class are accessible when the oscillator is set to that type, but throws an error
   * when it's not.
   * @example
   * const omniOsc = new Tone.OmniOscillator().toDestination().start();
   * omniOsc.type = "pwm";
   * // modulationFrequency is parameter which is available
   * // only when the type is "pwm".
   * omniOsc.modulationFrequency.value = 0.5;
   */
  get type() {
    let e = "";
    return ["am", "fm", "fat"].some((t) => this._sourceType === t) && (e = this._sourceType), e + this._oscillator.type;
  }
  set type(e) {
    e.substr(0, 2) === "fm" ? (this._createNewOscillator("fm"), this._oscillator = this._oscillator, this._oscillator.type = e.substr(2)) : e.substr(0, 2) === "am" ? (this._createNewOscillator("am"), this._oscillator = this._oscillator, this._oscillator.type = e.substr(2)) : e.substr(0, 3) === "fat" ? (this._createNewOscillator("fat"), this._oscillator = this._oscillator, this._oscillator.type = e.substr(3)) : e === "pwm" ? (this._createNewOscillator("pwm"), this._oscillator = this._oscillator) : e === "pulse" ? this._createNewOscillator("pulse") : (this._createNewOscillator("oscillator"), this._oscillator = this._oscillator, this._oscillator.type = e);
  }
  /**
   * The value is an empty array when the type is not "custom".
   * This is not available on "pwm" and "pulse" oscillator types.
   * @see {@link Oscillator.partials}
   */
  get partials() {
    return this._oscillator.partials;
  }
  set partials(e) {
    !this._getOscType(this._oscillator, "pulse") && !this._getOscType(this._oscillator, "pwm") && (this._oscillator.partials = e);
  }
  get partialCount() {
    return this._oscillator.partialCount;
  }
  set partialCount(e) {
    !this._getOscType(this._oscillator, "pulse") && !this._getOscType(this._oscillator, "pwm") && (this._oscillator.partialCount = e);
  }
  set(e) {
    return Reflect.has(e, "type") && e.type && (this.type = e.type), super.set(e), this;
  }
  /**
   * connect the oscillator to the frequency and detune signals
   */
  _createNewOscillator(e) {
    if (e !== this._sourceType) {
      this._sourceType = e;
      const t = ki[e], n = this.now();
      if (this._oscillator) {
        const s = this._oscillator;
        s.stop(n), this.context.setTimeout(() => s.dispose(), this.blockTime);
      }
      this._oscillator = new t({
        context: this.context
      }), this.frequency.connect(this._oscillator.frequency), this.detune.connect(this._oscillator.detune), this._oscillator.connect(this.output), this._oscillator.onstop = () => this.onstop(this), this.state === "started" && this._oscillator.start(n);
    }
  }
  get phase() {
    return this._oscillator.phase;
  }
  set phase(e) {
    this._oscillator.phase = e;
  }
  /**
   * The source type of the oscillator.
   * @example
   * const omniOsc = new Tone.OmniOscillator(440, "fmsquare");
   * console.log(omniOsc.sourceType); // 'fm'
   */
  get sourceType() {
    return this._sourceType;
  }
  set sourceType(e) {
    let t = "sine";
    this._oscillator.type !== "pwm" && this._oscillator.type !== "pulse" && (t = this._oscillator.type), e === "fm" ? this.type = "fm" + t : e === "am" ? this.type = "am" + t : e === "fat" ? this.type = "fat" + t : e === "oscillator" ? this.type = t : e === "pulse" ? this.type = "pulse" : e === "pwm" && (this.type = "pwm");
  }
  _getOscType(e, t) {
    return e instanceof ki[t];
  }
  /**
   * The base type of the oscillator.
   * @see {@link Oscillator.baseType}
   * @example
   * const omniOsc = new Tone.OmniOscillator(440, "fmsquare4");
   * console.log(omniOsc.sourceType, omniOsc.baseType, omniOsc.partialCount);
   */
  get baseType() {
    return this._oscillator.baseType;
  }
  set baseType(e) {
    !this._getOscType(this._oscillator, "pulse") && !this._getOscType(this._oscillator, "pwm") && e !== "pulse" && e !== "pwm" && (this._oscillator.baseType = e);
  }
  /**
   * The width of the oscillator when sourceType === "pulse".
   * @see {@link PWMOscillator}
   */
  get width() {
    if (this._getOscType(this._oscillator, "pulse"))
      return this._oscillator.width;
  }
  /**
   * The number of detuned oscillators when sourceType === "fat".
   * @see {@link FatOscillator.count}
   */
  get count() {
    if (this._getOscType(this._oscillator, "fat"))
      return this._oscillator.count;
  }
  set count(e) {
    this._getOscType(this._oscillator, "fat") && Et(e) && (this._oscillator.count = e);
  }
  /**
   * The detune spread between the oscillators when sourceType === "fat".
   * @see {@link FatOscillator.count}
   */
  get spread() {
    if (this._getOscType(this._oscillator, "fat"))
      return this._oscillator.spread;
  }
  set spread(e) {
    this._getOscType(this._oscillator, "fat") && Et(e) && (this._oscillator.spread = e);
  }
  /**
   * The type of the modulator oscillator. Only if the oscillator is set to "am" or "fm" types.
   * @see {@link AMOscillator} or {@link FMOscillator}
   */
  get modulationType() {
    if (this._getOscType(this._oscillator, "fm") || this._getOscType(this._oscillator, "am"))
      return this._oscillator.modulationType;
  }
  set modulationType(e) {
    (this._getOscType(this._oscillator, "fm") || this._getOscType(this._oscillator, "am")) && ct(e) && (this._oscillator.modulationType = e);
  }
  /**
   * The modulation index when the sourceType === "fm"
   * @see {@link FMOscillator}.
   */
  get modulationIndex() {
    if (this._getOscType(this._oscillator, "fm"))
      return this._oscillator.modulationIndex;
  }
  /**
   * Harmonicity is the frequency ratio between the carrier and the modulator oscillators.
   * @see {@link AMOscillator} or {@link FMOscillator}
   */
  get harmonicity() {
    if (this._getOscType(this._oscillator, "fm") || this._getOscType(this._oscillator, "am"))
      return this._oscillator.harmonicity;
  }
  /**
   * The modulationFrequency Signal of the oscillator when sourceType === "pwm"
   * see {@link PWMOscillator}
   * @min 0.1
   * @max 5
   */
  get modulationFrequency() {
    if (this._getOscType(this._oscillator, "pwm"))
      return this._oscillator.modulationFrequency;
  }
  asArray() {
    return fe(this, arguments, void 0, function* (e = 1024) {
      return kt(this, e);
    });
  }
  dispose() {
    return super.dispose(), this.detune.dispose(), this.frequency.dispose(), this._oscillator.dispose(), this;
  }
}
function Vr(i, e = 1 / 0) {
  const t = /* @__PURE__ */ new WeakMap();
  return function(n, s) {
    Reflect.defineProperty(n, s, {
      configurable: !0,
      enumerable: !0,
      get: function() {
        return t.get(this);
      },
      set: function(r) {
        _t(r, i, e), t.set(this, r);
      }
    });
  };
}
function ut(i, e = 1 / 0) {
  const t = /* @__PURE__ */ new WeakMap();
  return function(n, s) {
    Reflect.defineProperty(n, s, {
      configurable: !0,
      enumerable: !0,
      get: function() {
        return t.get(this);
      },
      set: function(r) {
        _t(this.toSeconds(r), i, e), t.set(this, r);
      }
    });
  };
}
class rs extends Ve {
  constructor() {
    const e = z(rs.getDefaults(), arguments, [
      "url",
      "onload"
    ]);
    super(e), this.name = "Player", this._activeSources = /* @__PURE__ */ new Set(), this._buffer = new te({
      onload: this._onload.bind(this, e.onload),
      onerror: e.onerror,
      reverse: e.reverse,
      url: e.url
    }), this.autostart = e.autostart, this._loop = e.loop, this._loopStart = e.loopStart, this._loopEnd = e.loopEnd, this._playbackRate = e.playbackRate, this.fadeIn = e.fadeIn, this.fadeOut = e.fadeOut;
  }
  static getDefaults() {
    return Object.assign(Ve.getDefaults(), {
      autostart: !1,
      fadeIn: 0,
      fadeOut: 0,
      loop: !1,
      loopEnd: 0,
      loopStart: 0,
      onload: X,
      onerror: X,
      playbackRate: 1,
      reverse: !1
    });
  }
  /**
   * Load the audio file as an audio buffer.
   * Decodes the audio asynchronously and invokes
   * the callback once the audio buffer loads.
   * Note: this does not need to be called if a url
   * was passed in to the constructor. Only use this
   * if you want to manually load a new url.
   * @param url The url of the buffer to load. Filetype support depends on the browser.
   */
  load(e) {
    return fe(this, void 0, void 0, function* () {
      return yield this._buffer.load(e), this._onload(), this;
    });
  }
  /**
   * Internal callback when the buffer is loaded.
   */
  _onload(e = X) {
    e(), this.autostart && this.start();
  }
  /**
   * Internal callback when the buffer is done playing.
   */
  _onSourceEnd(e) {
    this.onstop(this), this._activeSources.delete(e), this._activeSources.size === 0 && !this._synced && this._state.getValueAtTime(this.now()) === "started" && (this._state.cancel(this.now()), this._state.setStateAtTime("stopped", this.now()));
  }
  /**
   * Play the buffer at the given startTime. Optionally add an offset
   * and/or duration which will play the buffer from a position
   * within the buffer for the given duration.
   *
   * @param  time When the player should start.
   * @param  offset The offset from the beginning of the sample to start at.
   * @param  duration How long the sample should play. If no duration is given, it will default to the full length of the sample (minus any offset)
   */
  start(e, t, n) {
    return super.start(e, t, n), this;
  }
  /**
   * Internal start method
   */
  _start(e, t, n) {
    this._loop ? t = Vt(t, this._loopStart) : t = Vt(t, 0);
    const s = this.toSeconds(t), r = n;
    n = Vt(n, Math.max(this._buffer.duration - s, 0));
    let o = this.toSeconds(n);
    o = o / this._playbackRate, e = this.toSeconds(e);
    const a = new es({
      url: this._buffer,
      context: this.context,
      fadeIn: this.fadeIn,
      fadeOut: this.fadeOut,
      loop: this._loop,
      loopEnd: this._loopEnd,
      loopStart: this._loopStart,
      onended: this._onSourceEnd.bind(this),
      playbackRate: this._playbackRate
    }).connect(this.output);
    !this._loop && !this._synced && (this._state.cancel(e + o), this._state.setStateAtTime("stopped", e + o, {
      implicitEnd: !0
    })), this._activeSources.add(a), this._loop && We(r) ? a.start(e, s) : a.start(e, s, o - this.toSeconds(this.fadeOut));
  }
  /**
   * Stop playback.
   */
  _stop(e) {
    const t = this.toSeconds(e);
    this._activeSources.forEach((n) => n.stop(t));
  }
  /**
   * Stop and then restart the player from the beginning (or offset)
   * @param  time When the player should start.
   * @param  offset The offset from the beginning of the sample to start at.
   * @param  duration How long the sample should play. If no duration is given,
   * 					it will default to the full length of the sample (minus any offset)
   */
  restart(e, t, n) {
    return super.restart(e, t, n), this;
  }
  _restart(e, t, n) {
    var s;
    (s = [...this._activeSources].pop()) === null || s === void 0 || s.stop(e), this._start(e, t, n);
  }
  /**
   * Seek to a specific time in the player's buffer. If the
   * source is no longer playing at that time, it will stop.
   * @param offset The time to seek to.
   * @param when The time for the seek event to occur.
   * @example
   * const player = new Tone.Player("https://tonejs.github.io/audio/berklee/gurgling_theremin_1.mp3", () => {
   * 	player.start();
   * 	// seek to the offset in 1 second from now
   * 	player.seek(0.4, "+1");
   * }).toDestination();
   */
  seek(e, t) {
    const n = this.toSeconds(t);
    if (this._state.getValueAtTime(n) === "started") {
      const s = this.toSeconds(e);
      this._stop(n), this._start(n, s);
    }
    return this;
  }
  /**
   * Set the loop start and end. Will only loop if loop is set to true.
   * @param loopStart The loop start time
   * @param loopEnd The loop end time
   * @example
   * const player = new Tone.Player("https://tonejs.github.io/audio/berklee/malevoices_aa2_F3.mp3").toDestination();
   * // loop between the given points
   * player.setLoopPoints(0.2, 0.3);
   * player.loop = true;
   * player.autostart = true;
   */
  setLoopPoints(e, t) {
    return this.loopStart = e, this.loopEnd = t, this;
  }
  /**
   * If loop is true, the loop will start at this position.
   */
  get loopStart() {
    return this._loopStart;
  }
  set loopStart(e) {
    this._loopStart = e, this.buffer.loaded && _t(this.toSeconds(e), 0, this.buffer.duration), this._activeSources.forEach((t) => {
      t.loopStart = e;
    });
  }
  /**
   * If loop is true, the loop will end at this position.
   */
  get loopEnd() {
    return this._loopEnd;
  }
  set loopEnd(e) {
    this._loopEnd = e, this.buffer.loaded && _t(this.toSeconds(e), 0, this.buffer.duration), this._activeSources.forEach((t) => {
      t.loopEnd = e;
    });
  }
  /**
   * The audio buffer belonging to the player.
   */
  get buffer() {
    return this._buffer;
  }
  set buffer(e) {
    this._buffer.set(e);
  }
  /**
   * If the buffer should loop once it's over.
   * @example
   * const player = new Tone.Player("https://tonejs.github.io/audio/drum-samples/breakbeat.mp3").toDestination();
   * player.loop = true;
   * player.autostart = true;
   */
  get loop() {
    return this._loop;
  }
  set loop(e) {
    if (this._loop !== e && (this._loop = e, this._activeSources.forEach((t) => {
      t.loop = e;
    }), e)) {
      const t = this._state.getNextState("stopped", this.now());
      t && this._state.cancel(t.time);
    }
  }
  /**
   * Normal speed is 1. The pitch will change with the playback rate.
   * @example
   * const player = new Tone.Player("https://tonejs.github.io/audio/berklee/femalevoices_aa2_A5.mp3").toDestination();
   * // play at 1/4 speed
   * player.playbackRate = 0.25;
   * // play as soon as the buffer is loaded
   * player.autostart = true;
   */
  get playbackRate() {
    return this._playbackRate;
  }
  set playbackRate(e) {
    this._playbackRate = e;
    const t = this.now(), n = this._state.getNextState("stopped", t);
    n && n.implicitEnd && (this._state.cancel(n.time), this._activeSources.forEach((s) => s.cancelStop())), this._activeSources.forEach((s) => {
      s.playbackRate.setValueAtTime(e, t);
    });
  }
  /**
   * If the buffer should be reversed. Note that this sets the underlying {@link ToneAudioBuffer.reverse}, so
   * if multiple players are pointing at the same ToneAudioBuffer, they will all be reversed.
   * @example
   * const player = new Tone.Player("https://tonejs.github.io/audio/berklee/chime_1.mp3").toDestination();
   * player.autostart = true;
   * player.reverse = true;
   */
  get reverse() {
    return this._buffer.reverse;
  }
  set reverse(e) {
    this._buffer.reverse = e;
  }
  /**
   * If the buffer is loaded
   */
  get loaded() {
    return this._buffer.loaded;
  }
  dispose() {
    return super.dispose(), this._activeSources.forEach((e) => e.dispose()), this._activeSources.clear(), this._buffer.dispose(), this;
  }
}
Ze([
  ut(0)
], rs.prototype, "fadeIn", void 0);
Ze([
  ut(0)
], rs.prototype, "fadeOut", void 0);
class Ct extends $ {
  constructor() {
    const e = z(Ct.getDefaults(), arguments, ["attack", "decay", "sustain", "release"]);
    super(e), this.name = "Envelope", this._sig = new ve({
      context: this.context,
      value: 0
    }), this.output = this._sig, this.input = void 0, this.attack = e.attack, this.decay = e.decay, this.sustain = e.sustain, this.release = e.release, this.attackCurve = e.attackCurve, this.releaseCurve = e.releaseCurve, this.decayCurve = e.decayCurve;
  }
  static getDefaults() {
    return Object.assign($.getDefaults(), {
      attack: 0.01,
      attackCurve: "linear",
      decay: 0.1,
      decayCurve: "exponential",
      release: 1,
      releaseCurve: "exponential",
      sustain: 0.5
    });
  }
  /**
   * Read the current value of the envelope. Useful for
   * synchronizing visual output to the envelope.
   */
  get value() {
    return this.getValueAtTime(this.now());
  }
  /**
   * Get the curve
   * @param  curve
   * @param  direction  In/Out
   * @return The curve name
   */
  _getCurve(e, t) {
    if (ct(e))
      return e;
    {
      let n;
      for (n in An)
        if (An[n][t] === e)
          return n;
      return e;
    }
  }
  /**
   * Assign a the curve to the given name using the direction
   * @param  name
   * @param  direction In/Out
   * @param  curve
   */
  _setCurve(e, t, n) {
    if (ct(n) && Reflect.has(An, n)) {
      const s = An[n];
      bt(s) ? e !== "_decayCurve" && (this[e] = s[t]) : this[e] = s;
    } else if (He(n) && e !== "_decayCurve")
      this[e] = n;
    else
      throw new Error("Envelope: invalid curve: " + n);
  }
  /**
   * The shape of the attack.
   * Can be any of these strings:
   * * "linear"
   * * "exponential"
   * * "sine"
   * * "cosine"
   * * "bounce"
   * * "ripple"
   * * "step"
   *
   * Can also be an array which describes the curve. Values
   * in the array are evenly subdivided and linearly
   * interpolated over the duration of the attack.
   * @example
   * return Tone.Offline(() => {
   * 	const env = new Tone.Envelope(0.4).toDestination();
   * 	env.attackCurve = "linear";
   * 	env.triggerAttack();
   * }, 1, 1);
   */
  get attackCurve() {
    return this._getCurve(this._attackCurve, "In");
  }
  set attackCurve(e) {
    this._setCurve("_attackCurve", "In", e);
  }
  /**
   * The shape of the release. See the attack curve types.
   * @example
   * return Tone.Offline(() => {
   * 	const env = new Tone.Envelope({
   * 		release: 0.8
   * 	}).toDestination();
   * 	env.triggerAttack();
   * 	// release curve could also be defined by an array
   * 	env.releaseCurve = [1, 0.3, 0.4, 0.2, 0.7, 0];
   * 	env.triggerRelease(0.2);
   * }, 1, 1);
   */
  get releaseCurve() {
    return this._getCurve(this._releaseCurve, "Out");
  }
  set releaseCurve(e) {
    this._setCurve("_releaseCurve", "Out", e);
  }
  /**
   * The shape of the decay either "linear" or "exponential"
   * @example
   * return Tone.Offline(() => {
   * 	const env = new Tone.Envelope({
   * 		sustain: 0.1,
   * 		decay: 0.5
   * 	}).toDestination();
   * 	env.decayCurve = "linear";
   * 	env.triggerAttack();
   * }, 1, 1);
   */
  get decayCurve() {
    return this._getCurve(this._decayCurve, "Out");
  }
  set decayCurve(e) {
    this._setCurve("_decayCurve", "Out", e);
  }
  /**
   * Trigger the attack/decay portion of the ADSR envelope.
   * @param  time When the attack should start.
   * @param velocity The velocity of the envelope scales the vales.
   *                             number between 0-1
   * @example
   * const env = new Tone.AmplitudeEnvelope().toDestination();
   * const osc = new Tone.Oscillator().connect(env).start();
   * // trigger the attack 0.5 seconds from now with a velocity of 0.2
   * env.triggerAttack("+0.5", 0.2);
   */
  triggerAttack(e, t = 1) {
    this.log("triggerAttack", e, t), e = this.toSeconds(e);
    let s = this.toSeconds(this.attack);
    const r = this.toSeconds(this.decay), o = this.getValueAtTime(e);
    if (o > 0) {
      const a = 1 / s;
      s = (1 - o) / a;
    }
    if (s < this.sampleTime)
      this._sig.cancelScheduledValues(e), this._sig.setValueAtTime(t, e);
    else if (this._attackCurve === "linear")
      this._sig.linearRampTo(t, s, e);
    else if (this._attackCurve === "exponential")
      this._sig.targetRampTo(t, s, e);
    else {
      this._sig.cancelAndHoldAtTime(e);
      let a = this._attackCurve;
      for (let c = 1; c < a.length; c++)
        if (a[c - 1] <= o && o <= a[c]) {
          a = this._attackCurve.slice(c), a[0] = o;
          break;
        }
      this._sig.setValueCurveAtTime(a, e, s, t);
    }
    if (r && this.sustain < 1) {
      const a = t * this.sustain, c = e + s;
      this.log("decay", c), this._decayCurve === "linear" ? this._sig.linearRampToValueAtTime(a, r + c) : this._sig.exponentialApproachValueAtTime(a, c, r);
    }
    return this;
  }
  /**
   * Triggers the release of the envelope.
   * @param  time When the release portion of the envelope should start.
   * @example
   * const env = new Tone.AmplitudeEnvelope().toDestination();
   * const osc = new Tone.Oscillator({
   * 	type: "sawtooth"
   * }).connect(env).start();
   * env.triggerAttack();
   * // trigger the release half a second after the attack
   * env.triggerRelease("+0.5");
   */
  triggerRelease(e) {
    this.log("triggerRelease", e), e = this.toSeconds(e);
    const t = this.getValueAtTime(e);
    if (t > 0) {
      const n = this.toSeconds(this.release);
      n < this.sampleTime ? this._sig.setValueAtTime(0, e) : this._releaseCurve === "linear" ? this._sig.linearRampTo(0, n, e) : this._releaseCurve === "exponential" ? this._sig.targetRampTo(0, n, e) : (W(He(this._releaseCurve), "releaseCurve must be either 'linear', 'exponential' or an array"), this._sig.cancelAndHoldAtTime(e), this._sig.setValueCurveAtTime(this._releaseCurve, e, n, t));
    }
    return this;
  }
  /**
   * Get the scheduled value at the given time. This will
   * return the unconverted (raw) value.
   * @example
   * const env = new Tone.Envelope(0.5, 1, 0.4, 2);
   * env.triggerAttackRelease(2);
   * setInterval(() => console.log(env.getValueAtTime(Tone.now())), 100);
   */
  getValueAtTime(e) {
    return this._sig.getValueAtTime(e);
  }
  /**
   * triggerAttackRelease is shorthand for triggerAttack, then waiting
   * some duration, then triggerRelease.
   * @param duration The duration of the sustain.
   * @param time When the attack should be triggered.
   * @param velocity The velocity of the envelope.
   * @example
   * const env = new Tone.AmplitudeEnvelope().toDestination();
   * const osc = new Tone.Oscillator().connect(env).start();
   * // trigger the release 0.5 seconds after the attack
   * env.triggerAttackRelease(0.5);
   */
  triggerAttackRelease(e, t, n = 1) {
    return t = this.toSeconds(t), this.triggerAttack(t, n), this.triggerRelease(t + this.toSeconds(e)), this;
  }
  /**
   * Cancels all scheduled envelope changes after the given time.
   */
  cancel(e) {
    return this._sig.cancelScheduledValues(this.toSeconds(e)), this;
  }
  /**
   * Connect the envelope to a destination node.
   */
  connect(e, t = 0, n = 0) {
    return Qs(this, e, t, n), this;
  }
  /**
   * Render the envelope curve to an array of the given length.
   * Good for visualizing the envelope curve. Rescales the duration of the
   * envelope to fit the length.
   */
  asArray() {
    return fe(this, arguments, void 0, function* (e = 1024) {
      const t = e / this.context.sampleRate, n = new $s(1, t, this.context.sampleRate), s = this.toSeconds(this.attack) + this.toSeconds(this.decay), r = s + this.toSeconds(this.release), o = r * 0.1, a = r + o, c = new this.constructor(Object.assign(this.get(), {
        attack: t * this.toSeconds(this.attack) / a,
        decay: t * this.toSeconds(this.decay) / a,
        release: t * this.toSeconds(this.release) / a,
        context: n
      }));
      return c._sig.toDestination(), c.triggerAttackRelease(t * (s + o) / a, 0), (yield n.render()).getChannelData(0);
    });
  }
  dispose() {
    return super.dispose(), this._sig.dispose(), this;
  }
}
Ze([
  ut(0)
], Ct.prototype, "attack", void 0);
Ze([
  ut(0)
], Ct.prototype, "decay", void 0);
Ze([
  Vr(0, 1)
], Ct.prototype, "sustain", void 0);
Ze([
  ut(0)
], Ct.prototype, "release", void 0);
const An = (() => {
  let e, t;
  const n = [];
  for (e = 0; e < 128; e++)
    n[e] = Math.sin(e / 127 * (Math.PI / 2));
  const s = [], r = 6.4;
  for (e = 0; e < 127; e++) {
    t = e / 127;
    const d = Math.sin(t * (Math.PI * 2) * r - Math.PI / 2) + 1;
    s[e] = d / 10 + t * 0.83;
  }
  s[127] = 1;
  const o = [], a = 5;
  for (e = 0; e < 128; e++)
    o[e] = Math.ceil(e / 127 * a) / a;
  const c = [];
  for (e = 0; e < 128; e++)
    t = e / 127, c[e] = 0.5 * (1 - Math.cos(Math.PI * t));
  const l = [];
  for (e = 0; e < 128; e++) {
    t = e / 127;
    const d = Math.pow(t, 3) * 4 + 0.2, f = Math.cos(d * Math.PI * 2 * t);
    l[e] = Math.abs(f * (1 - t));
  }
  function h(d) {
    const f = new Array(d.length);
    for (let p = 0; p < d.length; p++)
      f[p] = 1 - d[p];
    return f;
  }
  function u(d) {
    return d.slice(0).reverse();
  }
  return {
    bounce: {
      In: h(l),
      Out: l
    },
    cosine: {
      In: n,
      Out: u(n)
    },
    exponential: "exponential",
    linear: "linear",
    ripple: {
      In: s,
      Out: h(s)
    },
    sine: {
      In: c,
      Out: h(c)
    },
    step: {
      In: o,
      Out: h(o)
    }
  };
})();
class jt extends $ {
  constructor() {
    const e = z(jt.getDefaults(), arguments);
    super(e), this._scheduledEvents = [], this._synced = !1, this._original_triggerAttack = this.triggerAttack, this._original_triggerRelease = this.triggerRelease, this._syncedRelease = (t) => this._original_triggerRelease(t), this._volume = this.output = new Kt({
      context: this.context,
      volume: e.volume
    }), this.volume = this._volume.volume, ce(this, "volume");
  }
  static getDefaults() {
    return Object.assign($.getDefaults(), {
      volume: 0
    });
  }
  /**
   * Sync the instrument to the Transport. All subsequent calls of
   * {@link triggerAttack} and {@link triggerRelease} will be scheduled along the transport.
   * @example
   * const fmSynth = new Tone.FMSynth().toDestination();
   * fmSynth.volume.value = -6;
   * fmSynth.sync();
   * // schedule 3 notes when the transport first starts
   * fmSynth.triggerAttackRelease("C4", "8n", 0);
   * fmSynth.triggerAttackRelease("E4", "8n", "8n");
   * fmSynth.triggerAttackRelease("G4", "8n", "4n");
   * // start the transport to hear the notes
   * Tone.Transport.start();
   */
  sync() {
    return this._syncState() && (this._syncMethod("triggerAttack", 1), this._syncMethod("triggerRelease", 0), this.context.transport.on("stop", this._syncedRelease), this.context.transport.on("pause", this._syncedRelease), this.context.transport.on("loopEnd", this._syncedRelease)), this;
  }
  /**
   * set _sync
   */
  _syncState() {
    let e = !1;
    return this._synced || (this._synced = !0, e = !0), e;
  }
  /**
   * Wrap the given method so that it can be synchronized
   * @param method Which method to wrap and sync
   * @param  timePosition What position the time argument appears in
   */
  _syncMethod(e, t) {
    const n = this["_original_" + e] = this[e];
    this[e] = (...s) => {
      const r = s[t], o = this.context.transport.schedule((a) => {
        s[t] = a, n.apply(this, s);
      }, r);
      this._scheduledEvents.push(o);
    };
  }
  /**
   * Unsync the instrument from the Transport
   */
  unsync() {
    return this._scheduledEvents.forEach((e) => this.context.transport.clear(e)), this._scheduledEvents = [], this._synced && (this._synced = !1, this.triggerAttack = this._original_triggerAttack, this.triggerRelease = this._original_triggerRelease, this.context.transport.off("stop", this._syncedRelease), this.context.transport.off("pause", this._syncedRelease), this.context.transport.off("loopEnd", this._syncedRelease)), this;
  }
  /**
   * Trigger the attack and then the release after the duration.
   * @param  note     The note to trigger.
   * @param  duration How long the note should be held for before
   *                         triggering the release. This value must be greater than 0.
   * @param time  When the note should be triggered.
   * @param  velocity The velocity the note should be triggered at.
   * @example
   * const synth = new Tone.Synth().toDestination();
   * // trigger "C4" for the duration of an 8th note
   * synth.triggerAttackRelease("C4", "8n");
   */
  triggerAttackRelease(e, t, n, s) {
    const r = this.toSeconds(n), o = this.toSeconds(t);
    return this.triggerAttack(e, r, s), this.triggerRelease(r + o), this;
  }
  /**
   * clean up
   * @returns {Instrument} this
   */
  dispose() {
    return super.dispose(), this._volume.dispose(), this.unsync(), this._scheduledEvents = [], this;
  }
}
class Gt extends jt {
  constructor() {
    const e = z(Gt.getDefaults(), arguments);
    super(e), this.portamento = e.portamento, this.onsilence = e.onsilence;
  }
  static getDefaults() {
    return Object.assign(jt.getDefaults(), {
      detune: 0,
      onsilence: X,
      portamento: 0
    });
  }
  /**
   * Trigger the attack of the note optionally with a given velocity.
   * @param  note The note to trigger.
   * @param  time When the note should start.
   * @param  velocity The velocity determines how "loud" the note will be.
   * @example
   * const synth = new Tone.Synth().toDestination();
   * // trigger the note a half second from now at half velocity
   * synth.triggerAttack("C4", "+0.5", 0.5);
   */
  triggerAttack(e, t, n = 1) {
    this.log("triggerAttack", e, t, n);
    const s = this.toSeconds(t);
    return this._triggerEnvelopeAttack(s, n), this.setNote(e, s), this;
  }
  /**
   * Trigger the release portion of the envelope.
   * @param  time If no time is given, the release happens immediately.
   * @example
   * const synth = new Tone.Synth().toDestination();
   * synth.triggerAttack("C4");
   * // trigger the release a second from now
   * synth.triggerRelease("+1");
   */
  triggerRelease(e) {
    this.log("triggerRelease", e);
    const t = this.toSeconds(e);
    return this._triggerEnvelopeRelease(t), this;
  }
  /**
   * Set the note at the given time. If no time is given, the note
   * will set immediately.
   * @param note The note to change to.
   * @param  time The time when the note should be set.
   * @example
   * const synth = new Tone.Synth().toDestination();
   * synth.triggerAttack("C4");
   * // change to F#6 in one quarter note from now.
   * synth.setNote("F#6", "+4n");
   */
  setNote(e, t) {
    const n = this.toSeconds(t), s = e instanceof ze ? e.toFrequency() : e;
    if (this.portamento > 0 && this.getLevelAtTime(n) > 0.05) {
      const r = this.toSeconds(this.portamento);
      this.frequency.exponentialRampTo(s, r, n);
    } else
      this.frequency.setValueAtTime(s, n);
    return this;
  }
}
Ze([
  ut(0)
], Gt.prototype, "portamento", void 0);
class si extends Ct {
  constructor() {
    super(z(si.getDefaults(), arguments, [
      "attack",
      "decay",
      "sustain",
      "release"
    ])), this.name = "AmplitudeEnvelope", this._gainNode = new Ce({
      context: this.context,
      gain: 0
    }), this.output = this._gainNode, this.input = this._gainNode, this._sig.connect(this._gainNode.gain), this.output = this._gainNode, this.input = this._gainNode;
  }
  /**
   * Clean up
   */
  dispose() {
    return super.dispose(), this._gainNode.dispose(), this;
  }
}
class Bn extends Gt {
  constructor() {
    const e = z(Bn.getDefaults(), arguments);
    super(e), this.name = "Synth", this.oscillator = new Ln(Object.assign({
      context: this.context,
      detune: e.detune,
      onstop: () => this.onsilence(this)
    }, e.oscillator)), this.frequency = this.oscillator.frequency, this.detune = this.oscillator.detune, this.envelope = new si(Object.assign({
      context: this.context
    }, e.envelope)), this.oscillator.chain(this.envelope, this.output), ce(this, ["oscillator", "frequency", "detune", "envelope"]);
  }
  static getDefaults() {
    return Object.assign(Gt.getDefaults(), {
      envelope: Object.assign(Ii(Ct.getDefaults(), Object.keys($.getDefaults())), {
        attack: 5e-3,
        decay: 0.1,
        release: 1,
        sustain: 0.3
      }),
      oscillator: Object.assign(Ii(Ln.getDefaults(), [
        ...Object.keys(Ve.getDefaults()),
        "frequency",
        "detune"
      ]), {
        type: "triangle"
      })
    });
  }
  /**
   * start the attack portion of the envelope
   * @param time the time the attack should start
   * @param velocity the velocity of the note (0-1)
   */
  _triggerEnvelopeAttack(e, t) {
    if (this.envelope.triggerAttack(e, t), this.oscillator.start(e), this.envelope.sustain === 0) {
      const n = this.toSeconds(this.envelope.attack), s = this.toSeconds(this.envelope.decay);
      this.oscillator.stop(e + n + s);
    }
  }
  /**
   * start the release portion of the envelope
   * @param time the time the release should start
   */
  _triggerEnvelopeRelease(e) {
    this.envelope.triggerRelease(e), this.oscillator.stop(e + this.toSeconds(this.envelope.release));
  }
  getLevelAtTime(e) {
    return e = this.toSeconds(e), this.envelope.getValueAtTime(e);
  }
  /**
   * clean up
   */
  dispose() {
    return super.dispose(), this.oscillator.dispose(), this.envelope.dispose(), this;
  }
}
class os extends Bn {
  constructor() {
    const e = z(os.getDefaults(), arguments);
    super(e), this.name = "MembraneSynth", this.portamento = 0, this.pitchDecay = e.pitchDecay, this.octaves = e.octaves, ce(this, ["oscillator", "envelope"]);
  }
  static getDefaults() {
    return qt(Gt.getDefaults(), Bn.getDefaults(), {
      envelope: {
        attack: 1e-3,
        attackCurve: "exponential",
        decay: 0.4,
        release: 1.4,
        sustain: 0.01
      },
      octaves: 10,
      oscillator: {
        type: "sine"
      },
      pitchDecay: 0.05
    });
  }
  setNote(e, t) {
    const n = this.toSeconds(t), s = this.toFrequency(e instanceof ze ? e.toFrequency() : e), r = s * this.octaves;
    return this.oscillator.frequency.setValueAtTime(r, n), this.oscillator.frequency.exponentialRampToValueAtTime(s, n + this.toSeconds(this.pitchDecay)), this;
  }
  dispose() {
    return super.dispose(), this;
  }
}
Ze([
  Vr(0)
], os.prototype, "octaves", void 0);
Ze([
  ut(0)
], os.prototype, "pitchDecay", void 0);
const Lr = /* @__PURE__ */ new Set();
function ii(i) {
  Lr.add(i);
}
function Br(i, e) {
  const t = (
    /* javascript */
    `registerProcessor("${i}", ${e})`
  );
  Lr.add(t);
}
const Xu = (
  /* javascript */
  `
	/**
	 * The base AudioWorkletProcessor for use in Tone.js. Works with the {@link ToneAudioWorklet}. 
	 */
	class ToneAudioWorkletProcessor extends AudioWorkletProcessor {

		constructor(options) {
			
			super(options);
			/**
			 * If the processor was disposed or not. Keep alive until it's disposed.
			 */
			this.disposed = false;
		   	/** 
			 * The number of samples in the processing block
			 */
			this.blockSize = 128;
			/**
			 * the sample rate
			 */
			this.sampleRate = sampleRate;

			this.port.onmessage = (event) => {
				// when it receives a dispose 
				if (event.data === "dispose") {
					this.disposed = true;
				}
			};
		}
	}
`
);
ii(Xu);
const Yu = (
  /* javascript */
  `
	/**
	 * Abstract class for a single input/output processor. 
	 * has a 'generate' function which processes one sample at a time
	 */
	class SingleIOProcessor extends ToneAudioWorkletProcessor {

		constructor(options) {
			super(Object.assign(options, {
				numberOfInputs: 1,
				numberOfOutputs: 1
			}));
			/**
			 * Holds the name of the parameter and a single value of that
			 * parameter at the current sample
			 * @type { [name: string]: number }
			 */
			this.params = {}
		}

		/**
		 * Generate an output sample from the input sample and parameters
		 * @abstract
		 * @param input number
		 * @param channel number
		 * @param parameters { [name: string]: number }
		 * @returns number
		 */
		generate(){}

		/**
		 * Update the private params object with the 
		 * values of the parameters at the given index
		 * @param parameters { [name: string]: Float32Array },
		 * @param index number
		 */
		updateParams(parameters, index) {
			for (const paramName in parameters) {
				const param = parameters[paramName];
				if (param.length > 1) {
					this.params[paramName] = parameters[paramName][index];
				} else {
					this.params[paramName] = parameters[paramName][0];
				}
			}
		}

		/**
		 * Process a single frame of the audio
		 * @param inputs Float32Array[][]
		 * @param outputs Float32Array[][]
		 */
		process(inputs, outputs, parameters) {
			const input = inputs[0];
			const output = outputs[0];
			// get the parameter values
			const channelCount = Math.max(input && input.length || 0, output.length);
			for (let sample = 0; sample < this.blockSize; sample++) {
				this.updateParams(parameters, sample);
				for (let channel = 0; channel < channelCount; channel++) {
					const inputSample = input && input.length ? input[channel][sample] : 0;
					output[channel][sample] = this.generate(inputSample, channel, this.params);
				}
			}
			return !this.disposed;
		}
	};
`
);
ii(Yu);
const Zu = (
  /* javascript */
  `
	/**
	 * A multichannel buffer for use within an AudioWorkletProcessor as a delay line
	 */
	class DelayLine {
		
		constructor(size, channels) {
			this.buffer = [];
			this.writeHead = []
			this.size = size;

			// create the empty channels
			for (let i = 0; i < channels; i++) {
				this.buffer[i] = new Float32Array(this.size);
				this.writeHead[i] = 0;
			}
		}

		/**
		 * Push a value onto the end
		 * @param channel number
		 * @param value number
		 */
		push(channel, value) {
			this.writeHead[channel] += 1;
			if (this.writeHead[channel] > this.size) {
				this.writeHead[channel] = 0;
			}
			this.buffer[channel][this.writeHead[channel]] = value;
		}

		/**
		 * Get the recorded value of the channel given the delay
		 * @param channel number
		 * @param delay number delay samples
		 */
		get(channel, delay) {
			let readHead = this.writeHead[channel] - Math.floor(delay);
			if (readHead < 0) {
				readHead += this.size;
			}
			return this.buffer[channel][readHead];
		}
	}
`
);
ii(Zu);
const Ju = "feedback-comb-filter", Ku = (
  /* javascript */
  `
	class FeedbackCombFilterWorklet extends SingleIOProcessor {

		constructor(options) {
			super(options);
			this.delayLine = new DelayLine(this.sampleRate, options.channelCount || 2);
		}

		static get parameterDescriptors() {
			return [{
				name: "delayTime",
				defaultValue: 0.1,
				minValue: 0,
				maxValue: 1,
				automationRate: "k-rate"
			}, {
				name: "feedback",
				defaultValue: 0.5,
				minValue: 0,
				maxValue: 0.9999,
				automationRate: "k-rate"
			}];
		}

		generate(input, channel, parameters) {
			const delayedSample = this.delayLine.get(channel, parameters.delayTime * this.sampleRate);
			this.delayLine.push(channel, input + delayedSample * parameters.feedback);
			return delayedSample;
		}
	}
`
);
Br(Ju, Ku);
class Cn extends jt {
  constructor() {
    const e = z(Cn.getDefaults(), arguments, ["urls", "onload", "baseUrl"], "urls");
    super(e), this.name = "Sampler", this._activeSources = /* @__PURE__ */ new Map();
    const t = {};
    Object.keys(e.urls).forEach((n) => {
      const s = parseInt(n, 10);
      if (W(bn(n) || Et(s) && isFinite(s), `url key is neither a note or midi pitch: ${n}`), bn(n)) {
        const r = new ze(this.context, n).toMidi();
        t[r] = e.urls[n];
      } else Et(s) && isFinite(s) && (t[s] = e.urls[s]);
    }), this._buffers = new Ks({
      urls: t,
      onload: e.onload,
      baseUrl: e.baseUrl,
      onerror: e.onerror
    }), this.attack = e.attack, this.release = e.release, this.curve = e.curve, this._buffers.loaded && Promise.resolve().then(e.onload);
  }
  static getDefaults() {
    return Object.assign(jt.getDefaults(), {
      attack: 0,
      baseUrl: "",
      curve: "exponential",
      onload: X,
      onerror: X,
      release: 0.1,
      urls: {}
    });
  }
  /**
   * Returns the difference in steps between the given midi note at the closets sample.
   */
  _findClosest(e) {
    let n = 0;
    for (; n < 96; ) {
      if (this._buffers.has(e + n))
        return -n;
      if (this._buffers.has(e - n))
        return n;
      n++;
    }
    throw new Error(`No available buffers for note: ${e}`);
  }
  /**
   * @param  notes	The note to play, or an array of notes.
   * @param  time     When to play the note
   * @param  velocity The velocity to play the sample back.
   */
  triggerAttack(e, t, n = 1) {
    return this.log("triggerAttack", e, t, n), Array.isArray(e) || (e = [e]), e.forEach((s) => {
      const r = qr(new ze(this.context, s).toFrequency()), o = Math.round(r), a = r - o, c = this._findClosest(o), l = o - c, h = this._buffers.get(l), u = Pr(c + a), d = new es({
        url: h,
        context: this.context,
        curve: this.curve,
        fadeIn: this.attack,
        fadeOut: this.release,
        playbackRate: u
      }).connect(this.output);
      d.start(t, 0, h.duration / u, n), He(this._activeSources.get(o)) || this._activeSources.set(o, []), this._activeSources.get(o).push(d), d.onended = () => {
        if (this._activeSources && this._activeSources.has(o)) {
          const f = this._activeSources.get(o), p = f.indexOf(d);
          p !== -1 && f.splice(p, 1);
        }
      };
    }), this;
  }
  /**
   * @param  notes	The note to release, or an array of notes.
   * @param  time     	When to release the note.
   */
  triggerRelease(e, t) {
    return this.log("triggerRelease", e, t), Array.isArray(e) || (e = [e]), e.forEach((n) => {
      const s = new ze(this.context, n).toMidi();
      if (this._activeSources.has(s) && this._activeSources.get(s).length) {
        const r = this._activeSources.get(s);
        t = this.toSeconds(t), r.forEach((o) => {
          o.stop(t);
        }), this._activeSources.set(s, []);
      }
    }), this;
  }
  /**
   * Release all currently active notes.
   * @param  time     	When to release the notes.
   */
  releaseAll(e) {
    const t = this.toSeconds(e);
    return this._activeSources.forEach((n) => {
      for (; n.length; )
        n.shift().stop(t);
    }), this;
  }
  sync() {
    return this._syncState() && (this._syncMethod("triggerAttack", 1), this._syncMethod("triggerRelease", 1)), this;
  }
  /**
   * Invoke the attack phase, then after the duration, invoke the release.
   * @param  notes	The note to play and release, or an array of notes.
   * @param  duration The time the note should be held
   * @param  time     When to start the attack
   * @param  velocity The velocity of the attack
   */
  triggerAttackRelease(e, t, n, s = 1) {
    const r = this.toSeconds(n);
    return this.triggerAttack(e, r, s), He(t) ? (W(He(e), "notes must be an array when duration is array"), e.forEach((o, a) => {
      const c = t[Math.min(a, t.length - 1)];
      this.triggerRelease(o, r + this.toSeconds(c));
    })) : this.triggerRelease(e, r + this.toSeconds(t)), this;
  }
  /**
   * Add a note to the sampler.
   * @param  note      The buffer's pitch.
   * @param  url  Either the url of the buffer, or a buffer which will be added with the given name.
   * @param  callback  The callback to invoke when the url is loaded.
   */
  add(e, t, n) {
    if (W(bn(e) || isFinite(e), `note must be a pitch or midi: ${e}`), bn(e)) {
      const s = new ze(this.context, e).toMidi();
      this._buffers.add(s, t, n);
    } else
      this._buffers.add(e, t, n);
    return this;
  }
  /**
   * If the buffers are loaded or not
   */
  get loaded() {
    return this._buffers.loaded;
  }
  /**
   * Clean up
   */
  dispose() {
    return super.dispose(), this._buffers.dispose(), this._activeSources.forEach((e) => {
      e.forEach((t) => t.dispose());
    }), this._activeSources.clear(), this;
  }
}
Ze([
  ut(0)
], Cn.prototype, "attack", void 0);
Ze([
  ut(0)
], Cn.prototype, "release", void 0);
class ri extends $ {
  constructor() {
    const e = z(ri.getDefaults(), arguments, [
      "pan"
    ]);
    super(e), this.name = "Panner", this._panner = this.context.createStereoPanner(), this.input = this._panner, this.output = this._panner, this.pan = new re({
      context: this.context,
      param: this._panner.pan,
      value: e.pan,
      minValue: -1,
      maxValue: 1
    }), this._panner.channelCount = e.channelCount, this._panner.channelCountMode = "explicit", ce(this, "pan");
  }
  static getDefaults() {
    return Object.assign($.getDefaults(), {
      pan: 0,
      channelCount: 1
    });
  }
  dispose() {
    return super.dispose(), this._panner.disconnect(), this.pan.dispose(), this;
  }
}
const ed = "bit-crusher", td = (
  /* javascript */
  `
	class BitCrusherWorklet extends SingleIOProcessor {

		static get parameterDescriptors() {
			return [{
				name: "bits",
				defaultValue: 12,
				minValue: 1,
				maxValue: 16,
				automationRate: 'k-rate'
			}];
		}

		generate(input, _channel, parameters) {
			const step = Math.pow(0.5, parameters.bits - 1);
			const val = step * Math.floor(input / step + 0.5);
			return val;
		}
	}
`
);
Br(ed, td);
class ue extends $ {
  constructor() {
    const e = z(ue.getDefaults(), arguments, [
      "solo"
    ]);
    super(e), this.name = "Solo", this.input = this.output = new Ce({
      context: this.context
    }), ue._allSolos.has(this.context) || ue._allSolos.set(this.context, /* @__PURE__ */ new Set()), ue._allSolos.get(this.context).add(this), this.solo = e.solo;
  }
  static getDefaults() {
    return Object.assign($.getDefaults(), {
      solo: !1
    });
  }
  /**
   * Isolates this instance and mutes all other instances of Solo.
   * Only one instance can be soloed at a time. A soloed
   * instance will report `solo=false` when another instance is soloed.
   */
  get solo() {
    return this._isSoloed();
  }
  set solo(e) {
    e ? this._addSolo() : this._removeSolo(), ue._allSolos.get(this.context).forEach((t) => t._updateSolo());
  }
  /**
   * If the current instance is muted, i.e. another instance is soloed
   */
  get muted() {
    return this.input.gain.value === 0;
  }
  /**
   * Add this to the soloed array
   */
  _addSolo() {
    ue._soloed.has(this.context) || ue._soloed.set(this.context, /* @__PURE__ */ new Set()), ue._soloed.get(this.context).add(this);
  }
  /**
   * Remove this from the soloed array
   */
  _removeSolo() {
    ue._soloed.has(this.context) && ue._soloed.get(this.context).delete(this);
  }
  /**
   * Is this on the soloed array
   */
  _isSoloed() {
    return ue._soloed.has(this.context) && ue._soloed.get(this.context).has(this);
  }
  /**
   * Returns true if no one is soloed
   */
  _noSolos() {
    return !ue._soloed.has(this.context) || // or has a solo set but doesn't include any items
    ue._soloed.has(this.context) && ue._soloed.get(this.context).size === 0;
  }
  /**
   * Solo the current instance and unsolo all other instances.
   */
  _updateSolo() {
    this._isSoloed() ? this.input.gain.value = 1 : this._noSolos() ? this.input.gain.value = 1 : this.input.gain.value = 0;
  }
  dispose() {
    return super.dispose(), ue._allSolos.get(this.context).delete(this), this._removeSolo(), this;
  }
}
ue._allSolos = /* @__PURE__ */ new Map();
ue._soloed = /* @__PURE__ */ new Map();
class oi extends $ {
  constructor() {
    const e = z(oi.getDefaults(), arguments, [
      "pan",
      "volume"
    ]);
    super(e), this.name = "PanVol", this._panner = this.input = new ri({
      context: this.context,
      pan: e.pan,
      channelCount: e.channelCount
    }), this.pan = this._panner.pan, this._volume = this.output = new Kt({
      context: this.context,
      volume: e.volume
    }), this.volume = this._volume.volume, this._panner.connect(this._volume), this.mute = e.mute, ce(this, ["pan", "volume"]);
  }
  static getDefaults() {
    return Object.assign($.getDefaults(), {
      mute: !1,
      pan: 0,
      volume: 0,
      channelCount: 1
    });
  }
  /**
   * Mute/unmute the volume
   */
  get mute() {
    return this._volume.mute;
  }
  set mute(e) {
    this._volume.mute = e;
  }
  dispose() {
    return super.dispose(), this._panner.dispose(), this.pan.dispose(), this._volume.dispose(), this.volume.dispose(), this;
  }
}
class Pt extends $ {
  constructor() {
    const e = z(Pt.getDefaults(), arguments, [
      "volume",
      "pan"
    ]);
    super(e), this.name = "Channel", this._solo = this.input = new ue({
      solo: e.solo,
      context: this.context
    }), this._panVol = this.output = new oi({
      context: this.context,
      pan: e.pan,
      volume: e.volume,
      mute: e.mute,
      channelCount: e.channelCount
    }), this.pan = this._panVol.pan, this.volume = this._panVol.volume, this._solo.connect(this._panVol), ce(this, ["pan", "volume"]);
  }
  static getDefaults() {
    return Object.assign($.getDefaults(), {
      pan: 0,
      volume: 0,
      mute: !1,
      solo: !1,
      channelCount: 1
    });
  }
  /**
   * Solo/unsolo the channel. Soloing is only relative to other {@link Channel}s and {@link Solo} instances
   */
  get solo() {
    return this._solo.solo;
  }
  set solo(e) {
    this._solo.solo = e;
  }
  /**
   * If the current instance is muted, i.e. another instance is soloed,
   * or the channel is muted
   */
  get muted() {
    return this._solo.muted || this.mute;
  }
  /**
   * Mute/unmute the volume
   */
  get mute() {
    return this._panVol.mute;
  }
  set mute(e) {
    this._panVol.mute = e;
  }
  /**
   * Get the gain node belonging to the bus name. Create it if
   * it doesn't exist
   * @param name The bus name
   */
  _getBus(e) {
    return Pt.buses.has(e) || Pt.buses.set(e, new Ce({ context: this.context })), Pt.buses.get(e);
  }
  /**
   * Send audio to another channel using a string. `send` is a lot like
   * {@link connect}, except it uses a string instead of an object. This can
   * be useful in large applications to decouple sections since {@link send}
   * and {@link receive} can be invoked separately in order to connect an object
   * @param name The channel name to send the audio
   * @param volume The amount of the signal to send.
   * 	Defaults to 0db, i.e. send the entire signal
   * @returns Returns the gain node of this connection.
   */
  send(e, t = 0) {
    const n = this._getBus(e), s = new Ce({
      context: this.context,
      units: "decibels",
      gain: t
    });
    return this.connect(s), s.connect(n), s;
  }
  /**
   * Receive audio from a channel which was connected with {@link send}.
   * @param name The channel name to receive audio from.
   */
  receive(e) {
    return this._getBus(e).connect(this), this;
  }
  dispose() {
    return super.dispose(), this._panVol.dispose(), this.pan.dispose(), this.volume.dispose(), this._solo.dispose(), this;
  }
}
Pt.buses = /* @__PURE__ */ new Map();
Ue().transport;
Ue().destination;
Ue().destination;
Ue().listener;
Ue().draw;
Ue();
function nd() {
  return te.loaded();
}
const Ke = class Ke {
  constructor(e = {}) {
    this.sampler = null, this.isInitialized = !1, this.isPlaying = !1, this.config = {
      baseUrl: e.baseUrl || "/audio/piano/",
      release: e.release ?? 1.5,
      volume: e.volume ?? -6,
      noteRange: e.noteRange || Ke.AVAILABLE_NOTES.map((t) => t.note)
    };
  }
  /**
   * Initialize the PitchShifter system
   */
  async initialize() {
    if (this.isInitialized) {
      console.warn("⚠️ [PitchShifter] Already initialized");
      return;
    }
    try {
      console.log("🎹 [PitchShifter] Initializing..."), Ue().state !== "running" && (await Ou(), console.log("🔊 [PitchShifter] AudioContext started")), this.sampler = new Cn({
        urls: {
          C4: "C4.mp3"
        },
        baseUrl: this.config.baseUrl,
        release: this.config.release
      }).toDestination(), this.sampler.volume.value = this.config.volume, console.log("📥 [PitchShifter] Loading audio sample..."), await nd(), this.isInitialized = !0, console.log("✅ [PitchShifter] Initialization complete");
    } catch (e) {
      throw console.error("❌ [PitchShifter] Initialization failed:", e), new Error(`PitchShifter initialization failed: ${e}`);
    }
  }
  /**
   * Play a note with the specified pitch
   *
   * @param note - Note name (e.g., "C4", "D4")
   * @param duration - Duration in seconds (default: 2)
   * @param velocity - Velocity 0-1 (default: 0.8)
   */
  async playNote(e, t = 2, n = 0.8) {
    if (!this.isInitialized || !this.sampler)
      throw new Error("PitchShifter not initialized. Call initialize() first.");
    if (this.isPlaying) {
      console.warn("⚠️ [PitchShifter] Already playing, skipping");
      return;
    }
    try {
      this.isPlaying = !0;
      const s = Ke.AVAILABLE_NOTES.find((r) => r.note === e);
      if (!s)
        throw new Error(`Invalid note: ${e}`);
      console.log(`🎵 [PitchShifter] Playing ${e} (${s.frequency.toFixed(2)}Hz) for ${t}s`), this.sampler.triggerAttack(e, void 0, n), setTimeout(() => {
        this.sampler && (this.sampler.triggerRelease(e), console.log(`🔇 [PitchShifter] Released ${e}`)), this.isPlaying = !1;
      }, t * 1e3);
    } catch (s) {
      throw this.isPlaying = !1, console.error("❌ [PitchShifter] Play note failed:", s), s;
    }
  }
  /**
   * Play a random note from available range
   *
   * @param duration - Duration in seconds (default: 2)
   * @returns The note info that was played
   */
  async playRandomNote(e = 2) {
    const t = Ke.AVAILABLE_NOTES[Math.floor(Math.random() * Ke.AVAILABLE_NOTES.length)];
    return console.log(`🎲 [PitchShifter] Random note selected: ${t.note} (${t.japaneseName})`), await this.playNote(t.note, e), t;
  }
  /**
   * Stop currently playing note immediately
   */
  stopNote(e) {
    if (!this.sampler) {
      console.warn("⚠️ [PitchShifter] Not initialized");
      return;
    }
    this.sampler.triggerRelease(e), this.isPlaying = !1, console.log(`🛑 [PitchShifter] Stopped ${e}`);
  }
  /**
   * Stop all currently playing notes
   */
  stopAll() {
    if (!this.sampler) {
      console.warn("⚠️ [PitchShifter] Not initialized");
      return;
    }
    this.sampler.releaseAll(), this.isPlaying = !1, console.log("🛑 [PitchShifter] Stopped all notes");
  }
  /**
   * Set volume in dB
   */
  setVolume(e) {
    if (!this.sampler) {
      console.warn("⚠️ [PitchShifter] Not initialized");
      return;
    }
    this.sampler.volume.value = e, console.log(`🔊 [PitchShifter] Volume set to ${e}dB`);
  }
  /**
   * Get note info by note name
   */
  static getNoteInfo(e) {
    return Ke.AVAILABLE_NOTES.find((t) => t.note === e);
  }
  /**
   * Get note info by frequency (finds closest match)
   */
  static getNoteByFrequency(e) {
    let t = Ke.AVAILABLE_NOTES[0], n = Math.abs(e - t.frequency);
    for (const s of Ke.AVAILABLE_NOTES) {
      const r = Math.abs(e - s.frequency);
      r < n && (n = r, t = s);
    }
    return t;
  }
  /**
   * Check if currently playing
   */
  isCurrentlyPlaying() {
    return this.isPlaying;
  }
  /**
   * Dispose of resources
   */
  dispose() {
    this.sampler && (this.sampler.dispose(), this.sampler = null), this.isInitialized = !1, this.isPlaying = !1, console.log("🗑️ [PitchShifter] Disposed");
  }
};
Ke.AVAILABLE_NOTES = [
  { note: "C4", frequency: 261.63, japaneseName: "ド（低）" },
  { note: "C#4", frequency: 277.18, japaneseName: "ド♯（低）" },
  { note: "D4", frequency: 293.66, japaneseName: "レ（低）" },
  { note: "D#4", frequency: 311.13, japaneseName: "レ♯（低）" },
  { note: "E4", frequency: 329.63, japaneseName: "ミ（低）" },
  { note: "F4", frequency: 349.23, japaneseName: "ファ（低）" },
  { note: "F#4", frequency: 369.99, japaneseName: "ファ♯（低）" },
  { note: "G4", frequency: 392, japaneseName: "ソ（低）" },
  { note: "G#4", frequency: 415.3, japaneseName: "ソ♯（低）" },
  { note: "A4", frequency: 440, japaneseName: "ラ（中）" },
  { note: "A#4", frequency: 466.16, japaneseName: "ラ♯（中）" },
  { note: "B4", frequency: 493.88, japaneseName: "シ（中）" },
  { note: "C5", frequency: 523.25, japaneseName: "ド（高）" },
  { note: "D5", frequency: 587.33, japaneseName: "レ（高）" },
  { note: "E5", frequency: 659.25, japaneseName: "ミ（高）" }
];
let Di = Ke;
const we = class we {
  /**
   * Generate scale from root note
   */
  static generateScale(e, t = "major") {
    const n = we.SCALE_PATTERNS[t];
    if (!n)
      throw new Error(`Unknown scale type: ${t}`);
    return n.map((s) => {
      const r = e * Math.pow(2, s / 12);
      return Ne.frequencyToNote(r);
    });
  }
  /**
   * Generate chord from root note
   */
  static generateChord(e, t = "major") {
    const n = we.CHORD_PATTERNS[t];
    if (!n)
      throw new Error(`Unknown chord type: ${t}`);
    return n.map((s) => {
      const r = e * Math.pow(2, s / 12);
      return Ne.frequencyToNote(r);
    });
  }
  /**
   * Identify scale from a set of frequencies
   */
  static identifyScale(e) {
    if (e.length < 3)
      return [];
    const t = e.sort((o, a) => o - a), n = t[0], s = t.map(
      (o) => Math.round(12 * Math.log2(o / n))
    ), r = [];
    return Object.entries(we.SCALE_PATTERNS).forEach(([o, a]) => {
      for (let c = 0; c < 12; c++) {
        const l = a.map((f) => (f + c) % 12).sort((f, p) => f - p), h = s.map((f) => f % 12).sort((f, p) => f - p);
        let u = 0;
        h.forEach((f) => {
          l.includes(f) && u++;
        });
        const d = u / Math.max(h.length, l.length);
        if (d > 0.5) {
          const f = n * Math.pow(2, -c / 12);
          r.push({
            scale: o,
            confidence: d,
            root: Ne.frequencyToNote(f)
          });
        }
      }
    }), r.sort((o, a) => a.confidence - o.confidence).slice(0, 5);
  }
  /**
   * Identify chord from frequencies
   */
  static identifyChord(e) {
    if (e.length < 2)
      return [];
    const t = e.sort((s, r) => s - r), n = [];
    return Object.entries(we.CHORD_PATTERNS).forEach(([s, r]) => {
      for (let o = 0; o < r.length; o++) {
        const a = [
          ...r.slice(o),
          ...r.slice(0, o).map((c) => c + 12)
        ];
        t.forEach((c, l) => {
          const h = t.map(
            (p) => Math.round(12 * Math.log2(p / c))
          );
          let u = 0;
          const d = new Set(a);
          h.forEach((p) => {
            const m = p % 12;
            (d.has(m) || d.has(m + 12)) && u++;
          });
          const f = u / Math.max(h.length, r.length);
          if (f > 0.6) {
            const p = o === 0 ? c : c * Math.pow(2, -r[o] / 12);
            n.push({
              chord: s,
              confidence: f,
              root: Ne.frequencyToNote(p),
              inversion: o > 0 ? o : void 0
            });
          }
        });
      }
    }), n.sort((s, r) => r.confidence - s.confidence).slice(0, 3);
  }
  /**
   * Get the key signature for a given key
   */
  static getKeySignature(e, t = "major") {
    const n = ["F", "C", "G", "D", "A", "E", "B"], s = ["B", "E", "A", "D", "G", "C", "F"], r = {
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
    let o = r[e];
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
      h && (o = r[h]);
    }
    if (!o)
      return { sharps: [], flats: [], accidentalCount: 0 };
    const a = n.slice(0, o.sharps).map((l) => l + "#"), c = s.slice(0, o.flats).map((l) => l + "b");
    return {
      sharps: a,
      flats: c,
      accidentalCount: o.sharps || o.flats
    };
  }
  /**
   * Calculate the harmonic series for a fundamental frequency
   */
  static getHarmonicSeries(e, t = 16) {
    const n = [];
    for (let s = 1; s <= t; s++) {
      const r = e * s;
      n.push(Ne.frequencyToNote(r));
    }
    return n;
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
    const t = e * 100, n = we.getJustIntonationRatios();
    let s, r = 1 / 0;
    return Object.entries(n).forEach(([a, { cents: c }]) => {
      const l = Math.abs(t - c);
      l < r && (r = l, s = a);
    }), {
      ratio: Math.pow(2, e / 12),
      cents: t,
      closestJustInterval: s,
      centsDeviation: s ? r : void 0
    };
  }
  /**
   * Analyze melodic intervals in a sequence of notes
   */
  static analyzeMelody(e) {
    if (e.length < 2)
      return [];
    const t = [];
    for (let n = 1; n < e.length; n++) {
      const s = e[n - 1], r = e[n], o = Ne.frequencyToNote(s), a = Ne.frequencyToNote(r), c = Ne.getSignedInterval(s, r), l = Ne.getIntervalInfo(Math.abs(c)), h = c > 0 ? "up" : c < 0 ? "down" : "same";
      t.push({
        fromNote: o,
        toNote: a,
        interval: l,
        direction: h
      });
    }
    return t;
  }
  /**
   * Generate chord progressions in a given key
   */
  static generateChordProgression(e, t = "major", n = [1, 4, 5, 1]) {
    const s = Ne.scientificPitchToFrequency(e + "4");
    if (s === 0)
      throw new Error(`Invalid key: ${e}`);
    const r = we.generateScale(s, t === "minor" ? "naturalMinor" : "major"), o = [];
    return n.forEach((a) => {
      const c = r[(a - 1) % r.length], l = t === "major" ? we.getMajorScaleChordType(a) : we.getMinorScaleChordType(a), h = we.generateChord(c.frequency, l);
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
we.SCALE_PATTERNS = {
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
}, we.CHORD_PATTERNS = {
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
}, we.CIRCLE_OF_FIFTHS = [
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
], we.INTERVAL_NAMES = {
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
let Fi = we;
const Ud = (/* @__PURE__ */ new Date()).toISOString(), zd = {
  pitchDetector: {
    fftSize: 4096,
    smoothing: 0.1,
    clarityThreshold: 0.4,
    // 現実的な値に修正
    minVolumeAbsolute: 0.02
    // 🔧 環境適応ノイズゲート: 10%閾値でマイクノイズを確実にブロック
  },
  audioManager: {
    sampleRate: 44100,
    channelCount: 1,
    echoCancellation: !1,
    noiseSuppression: !1,
    // 独自フィルター優先（PitchPro 3段階フィルタリング使用）
    autoGainControl: !1
  },
  noiseFilter: {
    highpassFreq: 50,
    // 深い男性の声に対応（G1 49Hzまで）
    lowpassFreq: 800,
    notchFreq: 50,
    // 🔧 日本の電源周波数50Hzに合わせて電源ハムノイズを除去
    highpassQ: 0.7,
    // 個別に設定
    lowpassQ: 0.7,
    // 個別に設定
    notchQ: 10
    // ノッチフィルターは通常、より高いQ値を持つ
  }
};
export {
  hi as AudioDetectionComponent,
  Yr as AudioManager,
  Ud as BUILD_DATE,
  id as BUILD_TIMESTAMP,
  dd as CalibrationSystem,
  zd as DEFAULT_CONFIG,
  At as DeviceDetection,
  ao as ErrorNotificationSystem,
  Ne as FrequencyUtils,
  hd as HarmonicCorrection,
  Un as LogLevel,
  cn as Logger,
  co as MicrophoneController,
  Xr as MicrophoneHealthError,
  oo as MicrophoneLifecycleManager,
  Fi as MusicTheory,
  rd as NoiseFilter,
  ro as PitchDetector,
  Di as PitchShifter,
  Qr as VERSION,
  us as VERSION_STRING,
  ud as VoiceAnalyzer,
  od as debug,
  zn as defaultLogger,
  ld as error,
  ad as info,
  cd as warn
};
//# sourceMappingURL=index.esm.js.map
