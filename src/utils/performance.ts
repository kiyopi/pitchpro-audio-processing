interface ThrottleOptions {
  leading?: boolean;
  trailing?: boolean;
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: ThrottleOptions = {}
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  let previous = 0;
  let lastArgs: Parameters<T> | null = null;
  
  const { leading = true, trailing = true } = options;
  
  return function throttled(...args: Parameters<T>) {
    const now = Date.now();
    
    if (!previous && !leading) {
      previous = now;
    }
    
    const remaining = wait - (now - previous);
    lastArgs = args;
    
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func.apply(null, args);
      lastArgs = null;
    } else if (!timeout && trailing) {
      timeout = setTimeout(() => {
        previous = leading ? Date.now() : 0;
        timeout = null;
        if (lastArgs) {
          func.apply(null, lastArgs);
          lastArgs = null;
        }
      }, remaining);
    }
  };
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function debounced(...args: Parameters<T>) {
    const callNow = immediate && !timeout;
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      timeout = null;
      if (!immediate) {
        func.apply(null, args);
      }
    }, wait);
    
    if (callNow) {
      func.apply(null, args);
    }
  };
}

export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private readonly maxSamples = 100;
  
  startMeasure(label: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(label, duration);
    };
  }
  
  recordMetric(label: string, value: number): void {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    
    const samples = this.metrics.get(label)!;
    samples.push(value);
    
    if (samples.length > this.maxSamples) {
      samples.shift();
    }
  }
  
  getStats(label: string): {
    mean: number;
    median: number;
    p95: number;
    min: number;
    max: number;
  } | null {
    const samples = this.metrics.get(label);
    if (!samples || samples.length === 0) {
      return null;
    }
    
    const sorted = [...samples].sort((a, b) => a - b);
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];
    
    return {
      mean,
      median,
      p95,
      min: sorted[0],
      max: sorted[sorted.length - 1]
    };
  }
  
  clear(label?: string): void {
    if (label) {
      this.metrics.delete(label);
    } else {
      this.metrics.clear();
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Frame rate limiter for animations
export class FrameRateLimiter {
  private lastFrameTime = 0;
  private readonly frameInterval: number;
  
  constructor(targetFPS = 20) {
    this.frameInterval = 1000 / targetFPS;
  }
  
  shouldProcess(): boolean {
    const now = performance.now();
    const elapsed = now - this.lastFrameTime;
    
    if (elapsed >= this.frameInterval) {
      this.lastFrameTime = now - (elapsed % this.frameInterval);
      return true;
    }
    
    return false;
  }
  
  reset(): void {
    this.lastFrameTime = 0;
  }
}