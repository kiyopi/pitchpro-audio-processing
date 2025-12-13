/**
 * DeviceDetection - Cross-platform device detection and optimization
 * 
 * Detects device types, capabilities, and provides optimized settings
 * Handles iPadOS 13+ detection issues and provides device-specific configurations
 */

import type { DeviceSpecs, DeviceOverrides, DeviceSpecsWithOverrides } from '../types';

export class DeviceDetection {
  private static cachedSpecs: DeviceSpecs | null = null;

  /**
   * Detect current device and return optimized specifications
   */
  static getDeviceSpecs(): DeviceSpecs {
    // Return cached result if available
    if (DeviceDetection.cachedSpecs) {
      return DeviceDetection.cachedSpecs;
    }

    // SSR compatibility
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return DeviceDetection.getDefaultSpecs();
    }

    const userAgent = navigator.userAgent;
    const deviceSpecs = DeviceDetection.analyzeUserAgent(userAgent);
    
    // Cache the result
    DeviceDetection.cachedSpecs = deviceSpecs;
    
    console.log('📱 [DeviceDetection] Device analysis:', {
      userAgent: userAgent.substring(0, 100) + '...',
      deviceType: deviceSpecs.deviceType,
      isIOS: deviceSpecs.isIOS,
      sensitivity: deviceSpecs.sensitivity,
      divisor: deviceSpecs.divisor
    });

    return deviceSpecs;
  }

  /**
   * デバイス検出値にアプリ側オーバーライドをマージ
   *
   * @description
   * DeviceDetectionの自動検出値をベースに、アプリ側からの上書き設定を適用。
   * 各パラメータは安全な範囲内にクランプされる。
   *
   * @param overrides アプリ側からの上書き設定
   * @returns マージ済みDeviceSpecs（minFrequency, maxFrequency, harmonicCorrectionEnabled含む）
   *
   * @example
   * ```typescript
   * const specs = DeviceDetection.getDeviceSpecsWithOverrides({
   *   sensitivity: 2.0,
   *   minFrequency: 50,
   *   harmonicCorrectionEnabled: false
   * });
   * ```
   */
  static getDeviceSpecsWithOverrides(overrides?: DeviceOverrides): DeviceSpecsWithOverrides {
    const baseSpecs = DeviceDetection.getDeviceSpecs();

    // デフォルト周波数範囲
    const defaultMinFreq = 30;
    const defaultMaxFreq = 1200;

    const result: DeviceSpecsWithOverrides = {
      ...baseSpecs,
      // オーバーライド適用（範囲制限付き）
      sensitivity: overrides?.sensitivity !== undefined
        ? Math.max(0.5, Math.min(5.0, overrides.sensitivity))
        : baseSpecs.sensitivity,
      noiseGate: overrides?.noiseGate !== undefined
        ? Math.max(0.01, Math.min(0.20, overrides.noiseGate))
        : baseSpecs.noiseGate,
      volumeMultiplier: overrides?.volumeMultiplier !== undefined
        ? Math.max(1.0, Math.min(10.0, overrides.volumeMultiplier))
        : baseSpecs.volumeMultiplier,
      // 新規パラメータ
      minFrequency: overrides?.minFrequency !== undefined
        ? Math.max(30, Math.min(100, overrides.minFrequency))
        : defaultMinFreq,
      maxFrequency: overrides?.maxFrequency !== undefined
        ? Math.max(800, Math.min(2000, overrides.maxFrequency))
        : defaultMaxFreq,
      harmonicCorrectionEnabled: overrides?.harmonicCorrectionEnabled ?? true,
    };

    // オーバーライド適用時はログ出力
    if (overrides) {
      console.log('🔧 [DeviceDetection] Overrides applied:', {
        original: {
          sensitivity: baseSpecs.sensitivity,
          noiseGate: baseSpecs.noiseGate,
          volumeMultiplier: baseSpecs.volumeMultiplier,
        },
        overrides,
        result: {
          sensitivity: result.sensitivity,
          noiseGate: result.noiseGate,
          volumeMultiplier: result.volumeMultiplier,
          minFrequency: result.minFrequency,
          maxFrequency: result.maxFrequency,
          harmonicCorrectionEnabled: result.harmonicCorrectionEnabled,
        }
      });
    }

    return result;
  }

  /**
   * Analyze user agent string and determine device specifications
   */
  private static analyzeUserAgent(userAgent: string): DeviceSpecs {
    // iOS device detection (including iPadOS 13+ workaround)
    const isIPhone = /iPhone/.test(userAgent);
    const isIPad = /iPad/.test(userAgent);
    
    // iPadOS 13+ reports as \"Macintosh\" but has touch support
    const isIPadOS = /Macintosh/.test(userAgent) && 'ontouchend' in document;
    
    // Additional iOS detection methods
    const hasIOSNavigator = /iPad|iPhone|iPod/.test(userAgent);
    const hasIOSPlatform = /iPad|iPhone|iPod/.test((navigator as any).platform || '');
    
    // Combined iOS detection
    const isIOS = isIPhone || isIPad || isIPadOS || hasIOSNavigator || hasIOSPlatform;

    // Android detection
    const isAndroid = /Android/i.test(userAgent);

    // More specific device type detection
    let deviceType: 'iPhone' | 'iPad' | 'Android' | 'PC' = 'PC';

    if (isIPhone) {
      deviceType = 'iPhone';
    } else if (isIPad || isIPadOS) {
      deviceType = 'iPad';
    } else if (isIOS) {
      // Fallback iOS device - could be iPhone or iPad
      deviceType = DeviceDetection.detectIOSDeviceType();
    } else if (isAndroid) {
      deviceType = 'Android';
    }

    // Get device-specific optimizations
    const optimizations = DeviceDetection.getDeviceOptimizations(deviceType, isIOS);

    return {
      deviceType,
      isIOS,
      sensitivity: optimizations.sensitivity,
      noiseGate: optimizations.noiseGate,
      volumeMultiplier: optimizations.volumeMultiplier,
      smoothingFactor: optimizations.smoothingFactor,
      // 後方互換性のため残す（将来的に削除予定）
      divisor: 6.0,
      gainCompensation: 1.0,
      noiseThreshold: 7.0
    };
  }

  /**
   * Detect iOS device type when specific detection fails
   */
  private static detectIOSDeviceType(): 'iPhone' | 'iPad' {
    // Use screen size as a heuristic
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const maxDimension = Math.max(screenWidth, screenHeight);
    const minDimension = Math.min(screenWidth, screenHeight);
    
    // iPad generally has larger screens
    // iPhone 6 Plus and newer have screens around 414x736 or similar
    // iPad screens are typically 768+ in at least one dimension
    if (maxDimension >= 768 || (maxDimension >= 700 && minDimension >= 500)) {
      return 'iPad';
    }
    
    return 'iPhone';
  }

  /**
   * Get device-specific optimization parameters
   */
  private static getDeviceOptimizations(deviceType: 'iPhone' | 'iPad' | 'Android' | 'PC', _isIOS: boolean) {
    switch (deviceType) {
      case 'iPad':
        // v1.3.11: 二重増幅問題の修正 (sensitivity × RMS_TO_PERCENT × volumeMultiplier)
        return {
          sensitivity: 2.5,           // 🎤 マイク感度 (4.0→2.5 ノイズフロア低減、100%飽和防止)
          noiseGate: 0.05,            // 🚪 ノイズゲート閾値 (0.023→0.05 静寂時の誤検知防止)
          volumeMultiplier: 3.0,      // 🔊 表示音量補正 (4.0→3.0 音量バー挙動を自然に)
          smoothingFactor: 0.1        // 📊 平滑化係数（CPU負荷軽減）
        };

      case 'iPhone':
        // v1.3.11: 二重増幅問題の修正 + 音域テストノイズ対策
        return {
          sensitivity: 2.0,           // 🎤 マイク感度 (3.5→2.0 環境ノイズ増幅を抑制)
          noiseGate: 0.08,            // 🚪 ノイズゲート閾値 (0.028→0.08 音域テスト開始時のノイズ対策)
          volumeMultiplier: 2.0,      // 🔊 表示音量補正 (3.0→2.0 50%で100%到達に改善)
          smoothingFactor: 0.1        // 📊 平滑化係数（CPU負荷軽減）
        };

      case 'Android':
        // v1.5.3: Android対応（iPhoneと同等の初期値）
        return {
          sensitivity: 2.0,           // 🎤 マイク感度 (iPhoneと同等)
          noiseGate: 0.08,            // 🚪 ノイズゲート閾値 (iPhoneと同等)
          volumeMultiplier: 2.0,      // 🔊 表示音量補正 (iPhoneと同等)
          smoothingFactor: 0.1        // 📊 平滑化係数
        };

      case 'PC':
      default:
        // v1.3.13: ノイズフロア対策 + 音量バー上昇率改善
        return {
          sensitivity: 1.7,           // 🎤 マイク感度 (PC環境安定性重視)
          noiseGate: 0.03,            // 🚪 ノイズゲート閾値 (0.023→0.03 ノイズフロア2.3%を確実にブロック)
          volumeMultiplier: 3.5,      // 🔊 表示音量補正 (2.5→3.5 音量バー上昇率改善)
          smoothingFactor: 0.1        // 📊 平滑化係数（CPU負荷軽減: 0.25→0.1）
        };
    }
  }

  /**
   * Get default specifications for SSR or fallback
   */
  private static getDefaultSpecs(): DeviceSpecs {
    // SSR環境などでデフォルトとして使用される値
    // getDeviceOptimizationsのPC設定と完全に一致させる
    return {
      deviceType: 'PC',
      isIOS: false,
      sensitivity: 1.7,           // 🎤 PC最適化値と統一
      noiseGate: 0.060,           // 🚪 PC最適化値と統一 (6.0%) - getDeviceOptimizationsと完全一致
      volumeMultiplier: 3.0,      // 🔊 PC最適化値と統一
      smoothingFactor: 0.1,       // 📊 PC最適化値と統一（CPU負荷軽減: 0.25→0.1）
      // 後方互換性のため残す（将来的に削除予定）
      divisor: 6.0,
      gainCompensation: 1.0,
      noiseThreshold: 7.0
    };
  }

  /**
   * Check if device supports Web Audio API
   */
  static supportsWebAudio(): boolean {
    return typeof window !== 'undefined' && 
           (typeof window.AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined');
  }

  /**
   * Check if device supports MediaDevices API
   */
  static supportsMediaDevices(): boolean {
    return typeof navigator !== 'undefined' && 
           typeof navigator.mediaDevices !== 'undefined' && 
           typeof navigator.mediaDevices.getUserMedia !== 'undefined';
  }

  /**
   * Check if device supports MediaRecorder API
   */
  static supportsMediaRecorder(): boolean {
    return typeof window !== 'undefined' && typeof (window as any).MediaRecorder !== 'undefined';
  }

  /**
   * Get comprehensive device capabilities
   */
  static getDeviceCapabilities() {
    const specs = DeviceDetection.getDeviceSpecs();
    
    return {
      deviceSpecs: specs,
      webAudioSupport: DeviceDetection.supportsWebAudio(),
      mediaDevicesSupport: DeviceDetection.supportsMediaDevices(),
      mediaRecorderSupport: DeviceDetection.supportsMediaRecorder(),
      touchSupport: 'ontouchend' in document,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      screenSize: typeof window !== 'undefined' ? {
        width: window.screen.width,
        height: window.screen.height,
        pixelRatio: window.devicePixelRatio
      } : null,
      language: typeof navigator !== 'undefined' ? navigator.language : 'Unknown',
      platform: typeof navigator !== 'undefined' ? (navigator as any).platform || 'Unknown' : 'Unknown'
    };
  }

  /**
   * Check if current device is mobile
   */
  static isMobile(): boolean {
    const specs = DeviceDetection.getDeviceSpecs();
    return specs.isIOS || /Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator?.userAgent || '');
  }

  /**
   * Check if current device is tablet
   */
  static isTablet(): boolean {
    const specs = DeviceDetection.getDeviceSpecs();
    if (specs.deviceType === 'iPad') return true;
    
    // Android tablet detection
    const userAgent = navigator?.userAgent || '';
    return /Android/i.test(userAgent) && !/Mobile/i.test(userAgent);
  }

  /**
   * Check if current device is desktop
   */
  static isDesktop(): boolean {
    return !DeviceDetection.isMobile() && !DeviceDetection.isTablet();
  }

  /**
   * Get recommended audio constraints for current device
   */
  static getOptimalAudioConstraints(): MediaStreamConstraints {
    const specs = DeviceDetection.getDeviceSpecs();
    
    const baseConstraints: MediaStreamConstraints = {
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
        sampleRate: 44100,
        channelCount: 1,
        sampleSize: 16,
        // latency: 0.1, // Not supported in MediaTrackConstraints
        // volume: 1.0, // Not supported in MediaTrackConstraints
        deviceId: { ideal: 'default' }
      }
    };

    // Add iOS-specific optimizations
    if (specs.isIOS && baseConstraints.audio && typeof baseConstraints.audio === 'object') {
      (baseConstraints.audio as any) = {
        ...baseConstraints.audio,
        // Disable all browser-level processing for iOS
        googAutoGainControl: false,
        googNoiseSuppression: false,
        googEchoCancellation: false,
        googHighpassFilter: false,
        googTypingNoiseDetection: false,
        googBeamforming: false,
        mozAutoGainControl: false,
        mozNoiseSuppression: false
      };
    }

    return baseConstraints;
  }

  /**
   * Clear cached device specifications (for testing)
   */
  static clearCache(): void {
    DeviceDetection.cachedSpecs = null;
  }

  /**
   * Get device-specific debugging information
   */
  static getDebugInfo() {
    const capabilities = DeviceDetection.getDeviceCapabilities();
    
    return {
      ...capabilities,
      detectionMethods: {
        userAgentIPhone: /iPhone/.test(navigator?.userAgent || ''),
        userAgentIPad: /iPad/.test(navigator?.userAgent || ''),
        userAgentMacintosh: /Macintosh/.test(navigator?.userAgent || ''),
        touchSupport: 'ontouchend' in document,
        navigatorPlatform: (navigator as any)?.platform || 'Unknown',
        screenAspectRatio: typeof window !== 'undefined' ? 
          (window.screen.width / window.screen.height).toFixed(2) : 'Unknown'
      }
    };
  }
}