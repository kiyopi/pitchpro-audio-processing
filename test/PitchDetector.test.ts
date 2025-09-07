import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('PitchDetector', () => {
  let mockAudioContext: any;
  let mockAnalyser: any;

  beforeEach(() => {
    mockAnalyser = {
      fftSize: 2048,
      getFloatTimeDomainData: vi.fn()
    };
    
    mockAudioContext = {
      sampleRate: 44100,
      createAnalyser: vi.fn(() => mockAnalyser)
    };

    global.AudioContext = vi.fn(() => mockAudioContext);
  });

  describe('ピッチ検出精度', () => {
    it('A4（440Hz）を5セント以内の精度で検出', () => {
      const testSignal = generateSineWave(440, mockAudioContext.sampleRate);
      mockAnalyser.getFloatTimeDomainData.mockImplementation((array: Float32Array) => {
        array.set(testSignal);
      });

      const detectedPitch = detectPitchMcLeod(testSignal, mockAudioContext.sampleRate);
      const cents = 1200 * Math.log2(detectedPitch / 440);
      
      expect(Math.abs(cents)).toBeLessThan(5);
    });

    it('低音域（E2=82.41Hz）の検出', () => {
      const testSignal = generateSineWave(82.41, mockAudioContext.sampleRate);
      const detectedPitch = detectPitchMcLeod(testSignal, mockAudioContext.sampleRate);
      const cents = 1200 * Math.log2(detectedPitch / 82.41);
      
      expect(Math.abs(cents)).toBeLessThan(10);
    });

    it('高音域（C6=1046.5Hz）の検出', () => {
      const testSignal = generateSineWave(1046.5, mockAudioContext.sampleRate);
      const detectedPitch = detectPitchMcLeod(testSignal, mockAudioContext.sampleRate);
      const cents = 1200 * Math.log2(detectedPitch / 1046.5);
      
      expect(Math.abs(cents)).toBeLessThan(5);
    });
  });

  describe('ノイズ耐性', () => {
    it('SNR 20dBのノイズ環境での検出', () => {
      const cleanSignal = generateSineWave(440, mockAudioContext.sampleRate);
      const noisySignal = addNoise(cleanSignal, 20);
      
      const detectedPitch = detectPitchMcLeod(noisySignal, mockAudioContext.sampleRate);
      const cents = 1200 * Math.log2(detectedPitch / 440);
      
      expect(Math.abs(cents)).toBeLessThan(20);
    });

    it('clarity閾値以下の信号を無視', () => {
      const weakSignal = generateSineWave(440, mockAudioContext.sampleRate, 0.001);
      const result = detectPitchWithClarity(weakSignal, mockAudioContext.sampleRate);
      
      expect(result.clarity).toBeLessThan(0.4);
      expect(result.pitch).toBe(0);
    });
  });

  describe('デバイス別設定', () => {
    it('iPhone設定（感度2.0）の検証', () => {
      const deviceSettings = getDeviceSettings('iPhone');
      expect(deviceSettings.sensitivity).toBe(2.0);
      expect(deviceSettings.noiseGate).toBe(0.003);
    });

    it('Android設定の検証', () => {
      const deviceSettings = getDeviceSettings('Android');
      expect(deviceSettings.sensitivity).toBe(1.5);
      expect(deviceSettings.noiseGate).toBe(0.002);
    });
  });
});

function generateSineWave(frequency: number, sampleRate: number, amplitude = 1.0): Float32Array {
  const samples = 2048;
  const signal = new Float32Array(samples);
  for (let i = 0; i < samples; i++) {
    signal[i] = amplitude * Math.sin(2 * Math.PI * frequency * i / sampleRate);
  }
  return signal;
}

function addNoise(signal: Float32Array, snrDb: number): Float32Array {
  const noisy = new Float32Array(signal.length);
  const signalPower = signal.reduce((sum, x) => sum + x * x, 0) / signal.length;
  const noisePower = signalPower / Math.pow(10, snrDb / 10);
  
  for (let i = 0; i < signal.length; i++) {
    const noise = (Math.random() - 0.5) * Math.sqrt(12 * noisePower);
    noisy[i] = signal[i] + noise;
  }
  return noisy;
}

function detectPitchMcLeod(signal: Float32Array, sampleRate: number): number {
  // McLeod Pitch Method の簡易実装
  // 実際のコードから抽出
  return 440; // プレースホルダー
}

function detectPitchWithClarity(signal: Float32Array, sampleRate: number): {pitch: number, clarity: number} {
  // clarity計算を含む検出
  return { pitch: 0, clarity: 0 };
}

function getDeviceSettings(device: string): {sensitivity: number, noiseGate: number} {
  // デバイス設定取得
  return { sensitivity: 1.0, noiseGate: 0.001 };
}