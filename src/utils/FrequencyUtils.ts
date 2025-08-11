/**
 * FrequencyUtils - Frequency conversion and analysis utilities
 * 
 * Provides utilities for converting between frequencies, notes, cents, and MIDI values
 * Includes musical interval calculations and frequency analysis functions
 */

import type { MusicalNote, MusicalInterval } from '../types';

export class FrequencyUtils {
  // Standard reference frequency (A4 = 440 Hz)
  static readonly A4_FREQUENCY = 440;
  static readonly A4_MIDI_NUMBER = 69;
  
  // Note names and chromatic scale
  static readonly NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  static readonly FLAT_NOTE_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  
  // Common musical intervals (in semitones)
  static readonly INTERVALS = {
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

  /**
   * Convert frequency to MIDI note number
   */
  static frequencyToMidi(frequency: number): number {
    if (frequency <= 0) return 0;
    return Math.round(12 * Math.log2(frequency / FrequencyUtils.A4_FREQUENCY) + FrequencyUtils.A4_MIDI_NUMBER);
  }

  /**
   * Convert MIDI note number to frequency
   */
  static midiToFrequency(midiNumber: number): number {
    return FrequencyUtils.A4_FREQUENCY * Math.pow(2, (midiNumber - FrequencyUtils.A4_MIDI_NUMBER) / 12);
  }

  /**
   * Convert frequency to note name with octave
   */
  static frequencyToNote(frequency: number, useFlats = false): MusicalNote {
    if (frequency <= 0) {
      return {
        name: '--',
        octave: 0,
        midi: 0,
        frequency: 0
      };
    }

    const midiNumber = FrequencyUtils.frequencyToMidi(frequency);
    const noteNames = useFlats ? FrequencyUtils.FLAT_NOTE_NAMES : FrequencyUtils.NOTE_NAMES;
    
    const noteIndex = (midiNumber - 12) % 12; // C0 = MIDI 12
    const octave = Math.floor((midiNumber - 12) / 12);
    const noteName = noteNames[noteIndex];
    
    return {
      name: noteName + octave,
      octave,
      midi: midiNumber,
      frequency: FrequencyUtils.midiToFrequency(midiNumber)
    };
  }

  /**
   * Convert frequency to cents deviation from nearest semitone
   */
  static frequencyToCents(frequency: number): number {
    if (frequency <= 0) return 0;
    
    const midiNumber = 12 * Math.log2(frequency / FrequencyUtils.A4_FREQUENCY) + FrequencyUtils.A4_MIDI_NUMBER;
    const nearestMidi = Math.round(midiNumber);
    const centsDeviation = (midiNumber - nearestMidi) * 100;
    
    return Math.round(centsDeviation);
  }

  /**
   * Convert cents to frequency ratio
   */
  static centsToRatio(cents: number): number {
    return Math.pow(2, cents / 1200);
  }

  /**
   * Convert frequency ratio to cents
   */
  static ratioToCents(ratio: number): number {
    if (ratio <= 0) return 0;
    return Math.round(1200 * Math.log2(ratio));
  }

  /**
   * Get the closest note frequency to a given frequency
   */
  static getClosestNoteFrequency(frequency: number): number {
    if (frequency <= 0) return 0;
    
    const midiNumber = FrequencyUtils.frequencyToMidi(frequency);
    return FrequencyUtils.midiToFrequency(midiNumber);
  }

  /**
   * Calculate the interval between two frequencies in semitones
   */
  static getInterval(frequency1: number, frequency2: number): number {
    if (frequency1 <= 0 || frequency2 <= 0) return 0;
    
    const midi1 = FrequencyUtils.frequencyToMidi(frequency1);
    const midi2 = FrequencyUtils.frequencyToMidi(frequency2);
    
    return Math.abs(midi2 - midi1);
  }

  /**
   * Calculate the interval between two frequencies with direction
   */
  static getSignedInterval(fromFrequency: number, toFrequency: number): number {
    if (fromFrequency <= 0 || toFrequency <= 0) return 0;
    
    const midi1 = FrequencyUtils.frequencyToMidi(fromFrequency);
    const midi2 = FrequencyUtils.frequencyToMidi(toFrequency);
    
    return midi2 - midi1;
  }

  /**
   * Get musical interval information
   */
  static getIntervalInfo(semitones: number): MusicalInterval {
    const intervalNames = {
      0: 'Perfect Unison',
      1: 'Minor Second',
      2: 'Major Second',
      3: 'Minor Third',
      4: 'Major Third',
      5: 'Perfect Fourth',
      6: 'Tritone',
      7: 'Perfect Fifth',
      8: 'Minor Sixth',
      9: 'Major Sixth',
      10: 'Minor Seventh',
      11: 'Major Seventh',
      12: 'Perfect Octave'
    };

    const normalizedSemitones = ((semitones % 12) + 12) % 12;
    const octaves = Math.floor(semitones / 12);
    
    const baseName = intervalNames[normalizedSemitones as keyof typeof intervalNames] || 'Unknown';
    const name = octaves > 0 ? `${baseName} + ${octaves} octave(s)` : baseName;
    
    return {
      name,
      semitones,
      cents: semitones * 100,
      ratio: Math.pow(2, semitones / 12)
    };
  }

  /**
   * Check if frequency is within human vocal range
   */
  static isInVocalRange(frequency: number): boolean {
    // Human vocal range roughly 80Hz to 1100Hz
    return frequency >= 80 && frequency <= 1100;
  }

  /**
   * Check if frequency is in piano range
   */
  static isInPianoRange(frequency: number): boolean {
    // Piano range A0 (27.5Hz) to C8 (4186Hz)
    return frequency >= 27.5 && frequency <= 4186;
  }

  /**
   * Get frequency range for a specific instrument
   */
  static getInstrumentRange(instrument: string): { min: number; max: number } | null {
    const ranges = {
      piano: { min: 27.5, max: 4186 },
      guitar: { min: 82.4, max: 1397 }, // E2 to F6
      violin: { min: 196, max: 3520 },  // G3 to A7
      cello: { min: 65.4, max: 1397 },  // C2 to F6
      voice_bass: { min: 87.3, max: 349 }, // F2 to F4
      voice_tenor: { min: 131, max: 523 }, // C3 to C5
      voice_alto: { min: 175, max: 698 },  // F3 to F5
      voice_soprano: { min: 262, max: 1047 } // C4 to C6
    };

    return ranges[instrument as keyof typeof ranges] || null;
  }

  /**
   * Generate a chromatic scale starting from a base frequency
   */
  static generateChromaticScale(baseFrequency: number, octaves = 1): number[] {
    const frequencies: number[] = [];
    
    for (let i = 0; i < 12 * octaves; i++) {
      const frequency = baseFrequency * Math.pow(2, i / 12);
      frequencies.push(frequency);
    }
    
    return frequencies;
  }

  /**
   * Generate a major scale starting from a base frequency
   */
  static generateMajorScale(baseFrequency: number): number[] {
    // Major scale pattern: W-W-H-W-W-W-H (W=whole step=2 semitones, H=half step=1 semitone)
    const pattern = [0, 2, 4, 5, 7, 9, 11, 12];
    
    return pattern.map(semitones => baseFrequency * Math.pow(2, semitones / 12));
  }

  /**
   * Generate a minor scale starting from a base frequency
   */
  static generateMinorScale(baseFrequency: number): number[] {
    // Natural minor scale pattern: W-H-W-W-H-W-W
    const pattern = [0, 2, 3, 5, 7, 8, 10, 12];
    
    return pattern.map(semitones => baseFrequency * Math.pow(2, semitones / 12));
  }

  /**
   * Find harmonics of a fundamental frequency
   */
  static findHarmonics(fundamental: number, maxHarmonic = 8): number[] {
    const harmonics: number[] = [];
    
    for (let i = 1; i <= maxHarmonic; i++) {
      harmonics.push(fundamental * i);
    }
    
    return harmonics;
  }

  /**
   * Check if a frequency could be a harmonic of a fundamental
   */
  static isHarmonic(frequency: number, fundamental: number, tolerance = 0.05): {
    isHarmonic: boolean;
    harmonicNumber: number | null;
    exactFrequency: number | null;
  } {
    if (fundamental <= 0 || frequency <= 0) {
      return { isHarmonic: false, harmonicNumber: null, exactFrequency: null };
    }

    const ratio = frequency / fundamental;
    const nearestInteger = Math.round(ratio);
    
    // Check if the ratio is close to an integer (within tolerance)
    if (nearestInteger >= 1 && Math.abs(ratio - nearestInteger) <= tolerance) {
      return {
        isHarmonic: true,
        harmonicNumber: nearestInteger,
        exactFrequency: fundamental * nearestInteger
      };
    }

    return { isHarmonic: false, harmonicNumber: null, exactFrequency: null };
  }

  /**
   * Calculate the fundamental frequency from a suspected harmonic
   */
  static calculateFundamental(harmonicFrequency: number, harmonicNumber: number): number {
    if (harmonicNumber <= 0 || harmonicFrequency <= 0) return 0;
    return harmonicFrequency / harmonicNumber;
  }

  /**
   * Convert frequency to scientific pitch notation
   */
  static frequencyToScientificPitch(frequency: number): string {
    const note = FrequencyUtils.frequencyToNote(frequency);
    return note.name;
  }

  /**
   * Convert scientific pitch notation to frequency
   */
  static scientificPitchToFrequency(scientificPitch: string): number {
    const match = scientificPitch.match(/^([A-G][#b]?)(-?\d+)$/);
    if (!match) return 0;

    const [, noteName, octaveStr] = match;
    const octave = parseInt(octaveStr, 10);
    
    // Convert note name to semitone offset from C
    let semitoneOffset = 0;
    const baseNote = noteName[0];
    const accidental = noteName.slice(1);
    
    const baseOffsets: { [key: string]: number } = {
      'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11
    };
    
    semitoneOffset = baseOffsets[baseNote] || 0;
    
    if (accidental === '#') {
      semitoneOffset += 1;
    } else if (accidental === 'b') {
      semitoneOffset -= 1;
    }
    
    // Calculate MIDI number (C4 = MIDI 60)
    const midiNumber = (octave + 1) * 12 + semitoneOffset;
    
    return FrequencyUtils.midiToFrequency(midiNumber);
  }

  /**
   * Format frequency display with appropriate precision
   */
  static formatFrequency(frequency: number, decimalPlaces = 1): string {
    if (frequency === 0) return '0 Hz';
    if (frequency < 0.1) return '<0.1 Hz';
    if (frequency >= 10000) return `${Math.round(frequency / 1000)}k Hz`;
    
    return `${frequency.toFixed(decimalPlaces)} Hz`;
  }

  /**
   * Format cents display with sign
   */
  static formatCents(cents: number): string {
    if (cents === 0) return '0¢';
    const sign = cents > 0 ? '+' : '';
    return `${sign}${cents}¢`;
  }
}