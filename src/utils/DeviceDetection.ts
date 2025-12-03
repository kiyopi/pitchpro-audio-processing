/**
 * DeviceDetection - Cross-platform device detection and optimization
 * 
 * Detects device types, capabilities, and provides optimized settings
 * Handles iPadOS 13+ detection issues and provides device-specific configurations
 */

import type { DeviceSpecs } from '../types';

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

    // Android detection (v1.3.23)
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
      // v1.3.23: Android専用設定
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
   * v1.3.23: Android追加、全デバイス設定見直し
   *
   * 設計方針:
   * - 準備ページ（BGMなし）: デフォルト設定を使用
   * - トレーニングページ（BGMあり・ダッキング環境）: override機能で上書き
   * - iPhoneのみダッキングの影響が大きいため、他デバイスはoverrideなしでも動作
   */
  private static getDeviceOptimizations(deviceType: 'iPhone' | 'iPad' | 'Android' | 'PC', _isIOS: boolean) {
    switch (deviceType) {
      case 'iPad':
        // v1.3.25: iPad設定調整（ノイズ問題修正）
        // ログ分析: 静寂時でもvolumeAsPercent 8%〜10%のノイズ発生
        // noiseGate 5%→12%に上げてノイズをブロック
        return {
          sensitivity: 2.5,           // 🎤 マイク感度
          noiseGate: 0.12,            // 🚪 ノイズゲート閾値 (5%→12% ノイズブロック)
          volumeMultiplier: 1.2,      // 🔊 表示音量補正
          smoothingFactor: 0.1        // 📊 平滑化係数
        };

      case 'iPhone':
        // v1.3.22: 準備ページ用デフォルト設定（BGMなし環境）
        // ダッキング環境ではoverride機能で上書き（noiseGate: 15%, volMult: 2.5）
        return {
          sensitivity: 2.0,           // 🎤 マイク感度 ※アプリが8xに上書き
          noiseGate: 0.25,            // 🚪 ノイズゲート閾値 (25%)
          volumeMultiplier: 1.2,      // 🔊 表示音量補正
          smoothingFactor: 0.1        // 📊 平滑化係数
        };

      case 'Android':
        // v1.3.23: Android専用設定（新規追加）
        // Androidはダッキングの影響がiPhoneより軽微
        return {
          sensitivity: 2.0,           // 🎤 マイク感度
          noiseGate: 0.08,            // 🚪 ノイズゲート閾値 (8% - iPhone程高くない)
          volumeMultiplier: 2.5,      // 🔊 表示音量補正
          smoothingFactor: 0.1        // 📊 平滑化係数
        };

      case 'PC':
      default:
        // v1.3.23: PC設定（ダッキングなし）
        return {
          sensitivity: 1.7,           // 🎤 マイク感度
          noiseGate: 0.03,            // 🚪 ノイズゲート閾値 (3%)
          volumeMultiplier: 3.5,      // 🔊 表示音量補正
          smoothingFactor: 0.1        // 📊 平滑化係数
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