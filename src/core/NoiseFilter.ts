/**
 * NoiseFilter - 3-stage Noise Reduction Filter Chain
 * 
 * Implements sophisticated noise filtering for voice detection:
 * 1. Highpass filter - Remove low frequency noise (below 80Hz)
 * 2. Lowpass filter - Remove high frequency noise (above 800Hz) 
 * 3. Notch filter - Remove power line noise (60Hz)
 */

import type { NoiseFilterConfig } from '../types';

export class NoiseFilter {
  private audioContext: AudioContext;
  private config: Required<NoiseFilterConfig>;
  
  // Filter nodes
  private highpassFilter: BiquadFilterNode | null = null;
  private lowpassFilter: BiquadFilterNode | null = null;
  private notchFilter: BiquadFilterNode | null = null;
  
  // Chain state
  private isConnected = false;
  private inputNode: AudioNode | null = null;
  private outputNode: AudioNode | null = null;

  constructor(audioContext: AudioContext, config: NoiseFilterConfig = {}) {
    this.audioContext = audioContext;
    this.config = {
      highpassFreq: 80,
      lowpassFreq: 800,
      notchFreq: 60,
      highpassQ: 0.7,
      lowpassQ: 0.7,
      notchQ: 10.0,
      useFilters: true,
      ...config
    };
    
    this.createFilterChain();
  }

  /**
   * Create the 3-stage filter chain
   */
  private createFilterChain(): void {
    if (!this.config.useFilters) {
      console.log('🔇 [NoiseFilter] Filters disabled - bypassing filter chain');
      return;
    }

    try {
      // 1. Highpass filter (remove low frequency noise: cut below 80Hz)
      this.highpassFilter = this.audioContext.createBiquadFilter();
      this.highpassFilter.type = 'highpass';
      this.highpassFilter.frequency.setValueAtTime(this.config.highpassFreq, this.audioContext.currentTime);
      this.highpassFilter.Q.setValueAtTime(this.config.highpassQ, this.audioContext.currentTime);

      // 2. Lowpass filter (remove high frequency noise: cut above 800Hz)
      this.lowpassFilter = this.audioContext.createBiquadFilter();
      this.lowpassFilter.type = 'lowpass';
      this.lowpassFilter.frequency.setValueAtTime(this.config.lowpassFreq, this.audioContext.currentTime);
      this.lowpassFilter.Q.setValueAtTime(this.config.lowpassQ, this.audioContext.currentTime);

      // 3. Notch filter (remove power line noise: 60Hz)
      this.notchFilter = this.audioContext.createBiquadFilter();
      this.notchFilter.type = 'notch';
      this.notchFilter.frequency.setValueAtTime(this.config.notchFreq, this.audioContext.currentTime);
      this.notchFilter.Q.setValueAtTime(this.config.notchQ, this.audioContext.currentTime);

      console.log('✅ [NoiseFilter] 3-stage filter chain created', {
        highpass: `${this.config.highpassFreq}Hz (Q=${this.config.highpassQ})`,
        lowpass: `${this.config.lowpassFreq}Hz (Q=${this.config.lowpassQ})`,
        notch: `${this.config.notchFreq}Hz (Q=${this.config.notchQ})`
      });

    } catch (error) {
      console.error('❌ [NoiseFilter] Failed to create filter chain:', error);
      throw new Error(`NoiseFilter initialization failed: ${error}`);
    }
  }

  /**
   * Connect the filter chain between input and output nodes
   */
  connect(inputNode: AudioNode, outputNode?: AudioNode): AudioNode {
    if (!this.config.useFilters) {
      // Bypass filtering - direct connection
      if (outputNode) {
        inputNode.connect(outputNode);
      }
      return inputNode;
    }

    if (!this.highpassFilter || !this.lowpassFilter || !this.notchFilter) {
      throw new Error('NoiseFilter not properly initialized');
    }

    try {
      // Disconnect any existing connections
      this.disconnect();

      // Store references
      this.inputNode = inputNode;
      this.outputNode = outputNode || null;

      // Create filter chain: input → highpass → lowpass → notch → output
      inputNode.connect(this.highpassFilter);
      this.highpassFilter.connect(this.lowpassFilter);
      this.lowpassFilter.connect(this.notchFilter);
      
      if (outputNode) {
        this.notchFilter.connect(outputNode);
      }

      this.isConnected = true;

      console.log('🔗 [NoiseFilter] Filter chain connected');
      
      // Return the final node in the chain (notch filter) for further connections
      return this.notchFilter!;

    } catch (error) {
      console.error('❌ [NoiseFilter] Connection failed:', error);
      throw new Error(`NoiseFilter connection failed: ${error}`);
    }
  }

  /**
   * Disconnect the filter chain
   */
  disconnect(): void {
    try {
      if (this.highpassFilter) {
        this.highpassFilter.disconnect();
      }
      if (this.lowpassFilter) {
        this.lowpassFilter.disconnect();
      }
      if (this.notchFilter) {
        this.notchFilter.disconnect();
      }
      
      this.isConnected = false;
      this.inputNode = null;
      this.outputNode = null;

      console.log('🔌 [NoiseFilter] Filter chain disconnected');

    } catch (error) {
      console.warn('⚠️ [NoiseFilter] Disconnect warning:', error);
    }
  }

  /**
   * Update filter parameters dynamically
   */
  updateFrequencies(params: {
    highpassFreq?: number;
    lowpassFreq?: number;
    notchFreq?: number;
    highpassQ?: number;
    lowpassQ?: number;
    notchQ?: number;
  }): void {
    const currentTime = this.audioContext.currentTime;

    try {
      if (params.highpassFreq !== undefined && this.highpassFilter) {
        this.highpassFilter.frequency.setValueAtTime(params.highpassFreq, currentTime);
        this.config.highpassFreq = params.highpassFreq;
      }

      if (params.lowpassFreq !== undefined && this.lowpassFilter) {
        this.lowpassFilter.frequency.setValueAtTime(params.lowpassFreq, currentTime);
        this.config.lowpassFreq = params.lowpassFreq;
      }

      if (params.notchFreq !== undefined && this.notchFilter) {
        this.notchFilter.frequency.setValueAtTime(params.notchFreq, currentTime);
        this.config.notchFreq = params.notchFreq;
      }

      if (params.highpassQ !== undefined && this.highpassFilter) {
        this.highpassFilter.Q.setValueAtTime(params.highpassQ, currentTime);
        this.config.highpassQ = params.highpassQ;
      }

      if (params.lowpassQ !== undefined && this.lowpassFilter) {
        this.lowpassFilter.Q.setValueAtTime(params.lowpassQ, currentTime);
        this.config.lowpassQ = params.lowpassQ;
      }

      if (params.notchQ !== undefined && this.notchFilter) {
        this.notchFilter.Q.setValueAtTime(params.notchQ, currentTime);
        this.config.notchQ = params.notchQ;
      }

      console.log('🔧 [NoiseFilter] Filter parameters updated:', params);

    } catch (error) {
      console.error('❌ [NoiseFilter] Parameter update failed:', error);
      throw new Error(`NoiseFilter parameter update failed: ${error}`);
    }
  }

  /**
   * Enable or disable the entire filter chain
   */
  setEnabled(enabled: boolean): void {
    if (enabled === this.config.useFilters) {
      return; // No change needed
    }

    this.config.useFilters = enabled;

    if (this.isConnected && this.inputNode) {
      // Reconnect with new settings
      const savedOutputNode = this.outputNode;
      this.disconnect();
      
      if (enabled) {
        // Recreate filters if they were destroyed
        if (!this.highpassFilter) {
          this.createFilterChain();
        }
      }
      
      this.connect(this.inputNode, savedOutputNode || undefined);
    }

    console.log(`🔘 [NoiseFilter] Filters ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get filter response at specific frequency (for visualization)
   */
  getFilterResponse(frequency: number): { magnitude: number; phase: number } {
    if (!this.config.useFilters || !this.highpassFilter || !this.lowpassFilter || !this.notchFilter) {
      return { magnitude: 1.0, phase: 0.0 };
    }

    try {
      // Create frequency array for single frequency
      const frequencyArray = new Float32Array([frequency]);
      const magnitudeArray = new Float32Array(1);
      const phaseArray = new Float32Array(1);

      // Calculate combined response (simplified - in practice you'd need to chain the calculations)
      this.highpassFilter.getFrequencyResponse(frequencyArray, magnitudeArray, phaseArray);
      const highpassMagnitude = magnitudeArray[0];
      
      this.lowpassFilter.getFrequencyResponse(frequencyArray, magnitudeArray, phaseArray);
      const lowpassMagnitude = magnitudeArray[0];
      
      this.notchFilter.getFrequencyResponse(frequencyArray, magnitudeArray, phaseArray);
      const notchMagnitude = magnitudeArray[0];

      // Combined magnitude (multiply individual filter responses)
      const combinedMagnitude = highpassMagnitude * lowpassMagnitude * notchMagnitude;
      
      return { 
        magnitude: combinedMagnitude, 
        phase: phaseArray[0] 
      };

    } catch (error) {
      console.warn('⚠️ [NoiseFilter] Filter response calculation failed:', error);
      return { magnitude: 1.0, phase: 0.0 };
    }
  }

  /**
   * Get current filter configuration
   */
  getConfig(): Required<NoiseFilterConfig> {
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
      filterTypes: this.config.useFilters ? ['highpass', 'lowpass', 'notch'] : [],
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
  getOutputNode(): AudioNode | null {
    if (!this.config.useFilters || !this.notchFilter) {
      return this.inputNode || null; // Bypass mode
    }
    return this.notchFilter;
  }

  /**
   * Cleanup and destroy filter nodes
   */
  destroy(): void {
    console.log('🗑️ [NoiseFilter] Destroying filter chain');
    
    this.disconnect();
    
    // Note: Filter nodes are automatically garbage collected
    // when disconnected and no longer referenced
    this.highpassFilter = null;
    this.lowpassFilter = null;
    this.notchFilter = null;
    
    console.log('✅ [NoiseFilter] Cleanup complete');
  }

  /**
   * Create a preset configuration for different scenarios
   */
  static getPresetConfig(preset: 'voice' | 'instrument' | 'wide' | 'minimal'): NoiseFilterConfig {
    switch (preset) {
      case 'voice':
        return {
          highpassFreq: 80,   // Remove breath noise
          lowpassFreq: 800,   // Focus on vocal fundamentals
          notchFreq: 60,      // Remove power line hum
          highpassQ: 0.7,
          lowpassQ: 0.7,
          notchQ: 10.0,
          useFilters: true
        };
        
      case 'instrument':
        return {
          highpassFreq: 40,   // Preserve low fundamentals
          lowpassFreq: 2000,  // Allow more harmonics
          notchFreq: 60,      // Remove power line hum
          highpassQ: 0.5,
          lowpassQ: 0.5,
          notchQ: 8.0,
          useFilters: true
        };
        
      case 'wide':
        return {
          highpassFreq: 20,   // Minimal low cut
          lowpassFreq: 5000,  // Minimal high cut
          notchFreq: 60,      // Only power line filtering
          highpassQ: 0.3,
          lowpassQ: 0.3,
          notchQ: 5.0,
          useFilters: true
        };
        
      case 'minimal':
        return {
          highpassFreq: 60,   // Just power line region
          lowpassFreq: 8000,  // Very high cutoff
          notchFreq: 60,      // Power line only
          highpassQ: 0.1,
          lowpassQ: 0.1,
          notchQ: 3.0,
          useFilters: true
        };
        
      default:
        return {
          useFilters: false
        };
    }
  }
}