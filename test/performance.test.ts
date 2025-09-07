import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdaptiveFrameRateLimiter, AudioProcessingThrottle } from '../src/utils/performance-optimized';

describe('Adaptive Frame Rate Performance', () => {
  let limiter: AdaptiveFrameRateLimiter;

  beforeEach(() => {
    limiter = new AdaptiveFrameRateLimiter(45);
    vi.useFakeTimers();
  });

  describe('Frame Rate Control', () => {
    it('45FPSで適切なフレーム間隔を維持', () => {
      const frameInterval = 1000 / 45; // ~22.2ms
      
      // First frame should process
      expect(limiter.shouldProcess()).toBe(true);
      
      // Too soon - should skip
      vi.advanceTimersByTime(10);
      expect(limiter.shouldProcess()).toBe(false);
      
      // Right timing - should process
      vi.advanceTimersByTime(frameInterval);
      expect(limiter.shouldProcess()).toBe(true);
    });

    it('最低30FPSを維持（33ms以下のレイテンシー）', () => {
      // Simulate frame drops
      for (let i = 0; i < 10; i++) {
        limiter.shouldProcess();
        vi.advanceTimersByTime(50); // Simulate slow frames
      }
      
      const stats = limiter.getStats();
      expect(stats.currentFPS).toBeGreaterThanOrEqual(30);
      expect(stats.latency).toBeLessThanOrEqual(33.4);
    });

    it('最高60FPSを超えない', () => {
      const fastLimiter = new AdaptiveFrameRateLimiter(100); // Try to set above max
      const stats = fastLimiter.getStats();
      expect(stats.currentFPS).toBeLessThanOrEqual(60);
    });

    it('フレームドロップ時にFPSを自動調整', () => {
      const initialStats = limiter.getStats();
      expect(initialStats.currentFPS).toBe(45);
      
      // Simulate multiple frame drops
      for (let i = 0; i < 6; i++) {
        limiter.shouldProcess();
        vi.advanceTimersByTime(100); // Severe delay
      }
      
      const adjustedStats = limiter.getStats();
      expect(adjustedStats.currentFPS).toBeLessThan(45);
      expect(adjustedStats.currentFPS).toBeGreaterThanOrEqual(30);
    });

    it('パフォーマンス回復時にFPSを復元', () => {
      // First cause FPS reduction
      for (let i = 0; i < 6; i++) {
        limiter.shouldProcess();
        vi.advanceTimersByTime(100);
      }
      
      const reducedStats = limiter.getStats();
      const reducedFPS = reducedStats.currentFPS;
      
      // Now run smoothly
      for (let i = 0; i < 10; i++) {
        limiter.shouldProcess();
        vi.advanceTimersByTime(22); // Good performance
        limiter.recoverPerformance();
      }
      
      const recoveredStats = limiter.getStats();
      expect(recoveredStats.currentFPS).toBeGreaterThan(reducedFPS);
    });
  });

  describe('Musical Performance Requirements', () => {
    it('ビブラート検出に適した更新頻度（5-8Hz）', () => {
      // Vibrato at 6Hz = 166ms period
      // Need at least 30FPS (33ms) to detect properly
      const stats = limiter.getStats();
      const samplesPerVibratoCycle = 166 / stats.latency;
      
      // Should get at least 5 samples per vibrato cycle
      expect(samplesPerVibratoCycle).toBeGreaterThan(5);
    });

    it('トリル検出のための十分な時間分解能', () => {
      // Trill notes can be as fast as 100ms apart
      // Need < 50ms latency to detect reliably
      const stats = limiter.getStats();
      expect(stats.latency).toBeLessThan(50);
    });

    it('リアルタイム演奏に適したレイテンシー（<30ms推奨）', () => {
      const optimalLimiter = new AdaptiveFrameRateLimiter(45);
      const stats = optimalLimiter.getStats();
      
      // 45 FPS = ~22ms latency (optimal for music)
      expect(stats.latency).toBeLessThan(30);
      expect(stats.latency).toBeGreaterThan(15); // Not unnecessarily fast
    });
  });
});

describe('Audio Processing Throttle', () => {
  let throttle: AudioProcessingThrottle;
  
  beforeEach(() => {
    throttle = new AudioProcessingThrottle();
    vi.useFakeTimers();
  });

  it('視覚更新を30FPSにスロットル', () => {
    const mockVisualUpdate = vi.fn();
    const throttledUpdate = throttle.throttleVisual(mockVisualUpdate);
    
    // Call multiple times rapidly
    for (let i = 0; i < 10; i++) {
      throttledUpdate();
      vi.advanceTimersByTime(10);
    }
    
    // Should be throttled to ~30FPS (33ms intervals)
    expect(mockVisualUpdate).toHaveBeenCalledTimes(Math.floor(100 / 33) + 1);
  });

  it('音声処理を60FPSで維持', () => {
    const mockAudioProcess = vi.fn();
    const throttledProcess = throttle.throttleAudio(mockAudioProcess);
    
    // Call multiple times rapidly
    for (let i = 0; i < 10; i++) {
      throttledProcess();
      vi.advanceTimersByTime(8);
    }
    
    // Should maintain ~60FPS (16ms intervals)
    expect(mockAudioProcess).toHaveBeenCalledTimes(Math.floor(80 / 16) + 1);
  });

  it('視覚と音声の処理頻度が異なる', () => {
    const mockVisual = vi.fn();
    const mockAudio = vi.fn();
    
    const throttledVisual = throttle.throttleVisual(mockVisual);
    const throttledAudio = throttle.throttleAudio(mockAudio);
    
    // Run for 100ms
    for (let i = 0; i < 100; i++) {
      throttledVisual();
      throttledAudio();
      vi.advanceTimersByTime(1);
    }
    
    // Audio should be called more frequently than visual
    expect(mockAudio.mock.calls.length).toBeGreaterThan(mockVisual.mock.calls.length);
    
    // Visual ~30FPS, Audio ~60FPS
    expect(mockVisual.mock.calls.length).toBeCloseTo(3, 1);
    expect(mockAudio.mock.calls.length).toBeCloseTo(6, 1);
  });
});

describe('Performance Metrics', () => {
  it('レイテンシー測定の精度', () => {
    const limiter = new AdaptiveFrameRateLimiter(45);
    const expectedLatency = 1000 / 45;
    const stats = limiter.getStats();
    
    expect(stats.latency).toBeCloseTo(expectedLatency, 1);
  });

  it('フレームドロップカウントの正確性', () => {
    vi.useFakeTimers();
    const limiter = new AdaptiveFrameRateLimiter(45);
    
    // Normal frames
    for (let i = 0; i < 5; i++) {
      limiter.shouldProcess();
      vi.advanceTimersByTime(22);
    }
    
    // Dropped frames
    for (let i = 0; i < 3; i++) {
      limiter.shouldProcess();
      vi.advanceTimersByTime(50); // Cause frame drops
    }
    
    const stats = limiter.getStats();
    expect(stats.frameDrops).toBeGreaterThan(0);
  });
});