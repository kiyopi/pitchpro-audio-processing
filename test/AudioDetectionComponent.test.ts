/**
 * AudioDetectionComponent Tests - autoUpdateUI機能のテスト
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AudioDetectionComponent, AudioDetectionConfig } from '../src/components/AudioDetectionComponent';

// Mock dependencies
vi.mock('../src/core/AudioManager');
vi.mock('../src/core/PitchDetector');
vi.mock('../src/core/MicrophoneController');
vi.mock('../src/utils/DeviceDetection', () => ({
  DeviceDetection: {
    getDeviceSpecs: vi.fn(() => ({
      deviceType: 'PC',
      isIOS: false,
      sensitivity: 1,
      noiseGate: 0.02,
      divisor: 6,
      gainCompensation: 1.0,
      noiseThreshold: 5,
      smoothingFactor: 0.2
    }))
  }
}));

describe('AudioDetectionComponent - autoUpdateUI Feature', () => {
  let mockConsoleWarn: any;
  let mockConsoleInfo: any;

  beforeEach(() => {
    // Console methods をモック
    mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockConsoleInfo = vi.spyOn(console, 'info').mockImplementation(() => {});
    
    // DOM要素をモック
    global.document = {
      querySelector: vi.fn().mockReturnValue(null)
    } as any;
  });

  describe('Constructor Warnings', () => {
    it('should warn when UI selectors are provided without autoUpdateUI=true', () => {
      const config: AudioDetectionConfig = {
        volumeBarSelector: '#volume-bar',
        autoUpdateUI: false
      };

      new AudioDetectionComponent(config);

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('⚠️ [PitchPro v1.1.9] UI selectors provided without autoUpdateUI=true')
      );
    });

    it('should show info when UI selectors are provided with autoUpdateUI=true', () => {
      const config: AudioDetectionConfig = {
        volumeBarSelector: '#volume-bar',
        autoUpdateUI: true
      };

      new AudioDetectionComponent(config);

      expect(mockConsoleInfo).toHaveBeenCalledWith(
        expect.stringContaining('ℹ️ [PitchPro] Automatic UI updates enabled')
      );
    });

    it('should not warn when no UI selectors are provided', () => {
      const config: AudioDetectionConfig = {
        autoUpdateUI: false,
        clarityThreshold: 0.4
      };

      new AudioDetectionComponent(config);

      expect(mockConsoleWarn).not.toHaveBeenCalled();
      expect(mockConsoleInfo).not.toHaveBeenCalled();
    });

    it('should warn for multiple UI selectors without autoUpdateUI', () => {
      const config: AudioDetectionConfig = {
        volumeBarSelector: '#volume-bar',
        volumeTextSelector: '#volume-text',
        frequencySelector: '#frequency',
        noteSelector: '#note',
        autoUpdateUI: false
      };

      new AudioDetectionComponent(config);

      expect(mockConsoleWarn).toHaveBeenCalledTimes(1);
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('UI selectors provided without autoUpdateUI=true')
      );
    });
  });

  describe('updateUI Method', () => {
    it('should skip UI updates when autoUpdateUI=false', () => {
      const config: AudioDetectionConfig = {
        volumeBarSelector: '#volume-bar',
        autoUpdateUI: false
      };

      const component = new AudioDetectionComponent(config);
      
      // DOM要素のモック
      const mockElement = { style: { width: '' } };
      vi.spyOn(document, 'querySelector').mockReturnValue(mockElement as any);

      // updateUIを呼び出し
      component.updateUI({
        frequency: 440,
        note: 'A4',
        volume: 50,
        clarity: 0.8
      });

      // DOM操作が行われないことを確認
      expect(mockElement.style.width).toBe('');
    });

    it('should perform UI updates when autoUpdateUI=true', () => {
      const config: AudioDetectionConfig = {
        volumeBarSelector: '#volume-bar',
        autoUpdateUI: true
      };

      const component = new AudioDetectionComponent(config);
      
      // UIElementsを手動で設定（実際の初期化をバイパス）
      const mockVolumeBar = { style: { width: '' } };
      (component as any).uiElements = { volumeBar: mockVolumeBar };
      (component as any).config.volumeBarSelector = '#volume-bar';

      vi.spyOn(document, 'querySelector').mockReturnValue(mockVolumeBar as any);

      // updateUIを呼び出し（result.volumeは既に処理済みの想定）
      component.updateUI({
        frequency: 440,
        note: 'A4',
        volume: 50, // 既にvolumeMultiplierが適用済みの値
        clarity: 0.8
      });

      // DOM操作が行われることを確認（重複計算は削除されている）
      expect(mockVolumeBar.style.width).toBe('50%');
    });
  });

  describe('Default Values', () => {
    it('should default autoUpdateUI to true for backward compatibility', () => {
      const config: AudioDetectionConfig = {
        clarityThreshold: 0.4
      };

      const component = new AudioDetectionComponent(config);
      
      // 内部configを確認
      expect((component as any).config.autoUpdateUI).toBe(true);
    });
  });

  describe('cacheUIElements Method', () => {
    it('should skip caching when autoUpdateUI=false', () => {
      const config: AudioDetectionConfig = {
        volumeBarSelector: '#volume-bar',
        autoUpdateUI: false
      };

      const component = new AudioDetectionComponent(config);
      
      // querySelector が呼ばれないことを確認
      const querySelectorSpy = vi.spyOn(document, 'querySelector');
      
      // 手動でcacheUIElementsを呼び出し
      (component as any).cacheUIElements();
      
      expect(querySelectorSpy).not.toHaveBeenCalled();
    });

    it('should cache UI elements when autoUpdateUI=true', () => {
      const config: AudioDetectionConfig = {
        volumeBarSelector: '#volume-bar',
        autoUpdateUI: true
      };

      const component = new AudioDetectionComponent(config);
      
      const mockElement = {};
      const querySelectorSpy = vi.spyOn(document, 'querySelector').mockReturnValue(mockElement as any);
      
      // 手動でcacheUIElementsを呼び出し
      (component as any).cacheUIElements();
      
      expect(querySelectorSpy).toHaveBeenCalledWith('#volume-bar');
    });
  });

  describe('_getProcessedResult Method', () => {
    it('should apply device volumeMultiplier correctly', () => {
      const config: AudioDetectionConfig = {
        autoUpdateUI: true
      };

      const component = new AudioDetectionComponent(config);

      // デバイス設定をモック（実際の実装に合わせてdeviceSpecsを設定）
      (component as any).deviceSpecs = {
        volumeMultiplier: 1.5,
        noiseGate: 0.02, // 2% noise gate
        deviceType: 'PC'
      };

      const rawResult = {
        frequency: 440,
        note: 'A4',
        volume: 0.8, // 生のRMS値（0-1範囲）
        clarity: 0.8
      };

      // プライベートメソッドを直接テスト
      const processedResult = (component as any)._getProcessedResult(rawResult);

      expect(processedResult).not.toBeNull();
      // 計算: 0.8 * 50 (BASE_SCALING_FACTOR) * 1.5 (volumeMultiplier) = 60
      expect(processedResult.volume).toBe(60);
      expect(processedResult.frequency).toBe(440); // 他の値は変更されない
      expect(processedResult.note).toBe('A4');
      expect(processedResult.clarity).toBe(0.8);
    });

    it('should clamp volume to 0-100 range', () => {
      const config: AudioDetectionConfig = {
        autoUpdateUI: true
      };

      const component = new AudioDetectionComponent(config);

      // 高い倍率のデバイス設定
      (component as any).deviceSpecs = {
        volumeMultiplier: 3.0,
        noiseGate: 0.02,
        deviceType: 'PC'
      };

      const rawResult = {
        frequency: 440,
        note: 'A4',
        volume: 1.0, // 最大RMS値 1.0 * 50 * 3.0 = 150（上限を超過）
        clarity: 0.8
      };

      const processedResult = (component as any)._getProcessedResult(rawResult);

      expect(processedResult.volume).toBe(100); // 100に制限される
    });

    it('should handle null input gracefully', () => {
      const config: AudioDetectionConfig = {
        autoUpdateUI: true
      };

      const component = new AudioDetectionComponent(config);

      const processedResult = (component as any)._getProcessedResult(null);

      expect(processedResult).toBeNull();
    });

    it('should apply noise gate correctly', () => {
      const config: AudioDetectionConfig = {
        autoUpdateUI: true
      };

      const component = new AudioDetectionComponent(config);

      // ノイズゲートが5%のデバイス設定
      (component as any).deviceSpecs = {
        volumeMultiplier: 2.0,
        noiseGate: 0.05, // 5% noise gate
        deviceType: 'PC'
      };

      const rawResult = {
        frequency: 440,
        note: 'A4',
        volume: 0.08, // 0.08 * 50 = 4% < 5%（ノイズゲート閾値）
        clarity: 0.8
      };

      const processedResult = (component as any)._getProcessedResult(rawResult);

      expect(processedResult).not.toBeNull();
      expect(processedResult.volume).toBe(0); // ノイズゲートによって0になる
      expect(processedResult.frequency).toBe(0); // 周波数も0になる
      expect(processedResult.note).toBe('--'); // ノート表示も無効化
    });

    it('should handle iPad special case', () => {
      const config: AudioDetectionConfig = {
        autoUpdateUI: true
      };

      const component = new AudioDetectionComponent(config);

      // iPad特別処理の設定
      (component as any).deviceSpecs = {
        volumeMultiplier: 15.0, // テスト用設定値15.0が使用される
        noiseGate: 0.012,
        deviceType: 'iPad'
      };

      const rawResult = {
        frequency: 440,
        note: 'A4',
        volume: 0.1, // 0.1 * 50 * 15.0 = 75.0
        clarity: 0.8
      };

      const processedResult = (component as any)._getProcessedResult(rawResult);

      expect(processedResult).not.toBeNull();
      // iPad特別処理: volumeMultiplier 15.0が適用される (テスト設定値)
      expect(processedResult.volume).toBe(75.0);
    });

    it('should use default multiplier when deviceSpecs is undefined', () => {
      const config: AudioDetectionConfig = {
        autoUpdateUI: true
      };

      const component = new AudioDetectionComponent(config);

      // deviceSpecs未設定の状態
      (component as any).deviceSpecs = null;

      const rawResult = {
        frequency: 440,
        note: 'A4',
        volume: 1.0, // RMS値
        clarity: 0.8
      };

      const processedResult = (component as any)._getProcessedResult(rawResult);

      // 計算: 1.0 * 50 (BASE_SCALING_FACTOR) * 1.0（デフォルト） = 50
      expect(processedResult.volume).toBe(50);
    });
  });

  describe('setCallbacks Method', () => {
    it('should set callbacks correctly', () => {
      const config: AudioDetectionConfig = {
        autoUpdateUI: true
      };

      const component = new AudioDetectionComponent(config);

      // Mock console.log to capture debug messages
      const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Set debug mode to true to test debug logging
      (component as any).config.debug = true;

      const mockOnPitchUpdate = vi.fn();
      const mockOnError = vi.fn();
      const mockOnStateChange = vi.fn();

      const callbacks = {
        onPitchUpdate: mockOnPitchUpdate,
        onError: mockOnError,
        onStateChange: mockOnStateChange
      };

      // Call setCallbacks
      component.setCallbacks(callbacks);

      // Verify callbacks were set internally
      const internalCallbacks = (component as any).callbacks;
      expect(internalCallbacks.onPitchUpdate).toBe(mockOnPitchUpdate);
      expect(internalCallbacks.onError).toBe(mockOnError);
      expect(internalCallbacks.onStateChange).toBe(mockOnStateChange);

      // Verify debug log was called
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('🎵 AudioDetection Setting callbacks:'),
        expect.arrayContaining(['onPitchUpdate', 'onError', 'onStateChange'])
      );

      mockConsoleLog.mockRestore();
    });

    it('should merge callbacks with existing ones', () => {
      const component = new AudioDetectionComponent({});

      const firstCallback = vi.fn();
      const secondCallback = vi.fn();
      const thirdCallback = vi.fn();

      // Set first set of callbacks
      component.setCallbacks({
        onPitchUpdate: firstCallback,
        onError: secondCallback
      });

      // Set second set of callbacks (should merge)
      component.setCallbacks({
        onStateChange: thirdCallback
      });

      const internalCallbacks = (component as any).callbacks;
      expect(internalCallbacks.onPitchUpdate).toBe(firstCallback); // Should remain
      expect(internalCallbacks.onError).toBe(secondCallback); // Should remain
      expect(internalCallbacks.onStateChange).toBe(thirdCallback); // Should be added
    });

    it('should propagate callbacks to PitchDetector when available', () => {
      const component = new AudioDetectionComponent({});

      // Mock PitchDetector with setCallbacks method
      const mockPitchDetector = {
        setCallbacks: vi.fn()
      };
      (component as any).pitchDetector = mockPitchDetector;

      const mockOnPitchUpdate = vi.fn();
      const mockOnError = vi.fn();

      component.setCallbacks({
        onPitchUpdate: mockOnPitchUpdate,
        onError: mockOnError,
        onStateChange: vi.fn() // This should not be propagated to PitchDetector
      });

      // Verify PitchDetector.setCallbacks was called
      expect(mockPitchDetector.setCallbacks).toHaveBeenCalledTimes(1);
      const callArgs = mockPitchDetector.setCallbacks.mock.calls[0][0];

      // Verify onPitchUpdate is passed directly
      expect(callArgs.onPitchUpdate).toBe(mockOnPitchUpdate);

      // Verify onError is wrapped (function will be different due to error type conversion)
      expect(typeof callArgs.onError).toBe('function');
      expect(callArgs.onError).not.toBe(mockOnError); // Should be wrapped
    });

    it('should handle case when PitchDetector is not available', () => {
      const component = new AudioDetectionComponent({});

      // Ensure PitchDetector is null
      (component as any).pitchDetector = null;

      const mockOnPitchUpdate = vi.fn();

      // Should not throw error when PitchDetector is null
      expect(() => {
        component.setCallbacks({
          onPitchUpdate: mockOnPitchUpdate
        });
      }).not.toThrow();

      // Verify callbacks were still set internally
      const internalCallbacks = (component as any).callbacks;
      expect(internalCallbacks.onPitchUpdate).toBe(mockOnPitchUpdate);
    });
  });
});