/**
 * PitchShifter - Piano-based pitch shifting system
 *
 * Uses Tone.js Sampler to play reference tones at different pitches
 * Integrated from pitch_app project's Salamander Piano implementation
 */

import * as Tone from 'tone';

export interface PitchShifterConfig {
  /** Base URL for audio samples (default: local public folder) */
  baseUrl?: string;
  /** Release time in seconds */
  release?: number;
  /** Volume in dB */
  volume?: number;
  /** Available note range */
  noteRange?: string[];
}

export interface NoteInfo {
  /** Note name (e.g., "C4", "D4") */
  note: string;
  /** Frequency in Hz */
  frequency: number;
  /** Japanese note name */
  japaneseName: string;
}

/**
 * PitchShifter - ピッチシフトシステム
 *
 * C4.mp3音源を使用してTone.js Samplerで自動ピッチシフトを実現
 */
export class PitchShifter {
  private sampler: Tone.Sampler | null = null;
  private config: Required<PitchShifterConfig>;
  private isInitialized: boolean = false;
  private isPlaying: boolean = false;

  /** 利用可能な音符リスト */
  public static readonly AVAILABLE_NOTES: NoteInfo[] = [
    { note: 'C4', frequency: 261.63, japaneseName: 'ド（低）' },
    { note: 'C#4', frequency: 277.18, japaneseName: 'ド♯（低）' },
    { note: 'D4', frequency: 293.66, japaneseName: 'レ（低）' },
    { note: 'D#4', frequency: 311.13, japaneseName: 'レ♯（低）' },
    { note: 'E4', frequency: 329.63, japaneseName: 'ミ（低）' },
    { note: 'F4', frequency: 349.23, japaneseName: 'ファ（低）' },
    { note: 'F#4', frequency: 369.99, japaneseName: 'ファ♯（低）' },
    { note: 'G4', frequency: 392.00, japaneseName: 'ソ（低）' },
    { note: 'G#4', frequency: 415.30, japaneseName: 'ソ♯（低）' },
    { note: 'A4', frequency: 440.00, japaneseName: 'ラ（中）' },
    { note: 'A#4', frequency: 466.16, japaneseName: 'ラ♯（中）' },
    { note: 'B4', frequency: 493.88, japaneseName: 'シ（中）' },
    { note: 'C5', frequency: 523.25, japaneseName: 'ド（高）' },
    { note: 'D5', frequency: 587.33, japaneseName: 'レ（高）' },
    { note: 'E5', frequency: 659.25, japaneseName: 'ミ（高）' }
  ];

  constructor(config: PitchShifterConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl || '/audio/piano/',
      release: config.release ?? 1.5,
      volume: config.volume ?? -6,
      noteRange: config.noteRange || PitchShifter.AVAILABLE_NOTES.map(n => n.note)
    };
  }

  /**
   * Initialize the PitchShifter system
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('⚠️ [PitchShifter] Already initialized');
      return;
    }

    try {
      console.log('🎹 [PitchShifter] Initializing...');

      // Start AudioContext (required for iOS/Safari)
      if (Tone.getContext().state !== 'running') {
        await Tone.start();
        console.log('🔊 [PitchShifter] AudioContext started');
      }

      // Create Sampler with C4.mp3 source
      this.sampler = new Tone.Sampler({
        urls: {
          'C4': 'C4.mp3'
        },
        baseUrl: this.config.baseUrl,
        release: this.config.release
      }).toDestination();

      // Set volume
      this.sampler.volume.value = this.config.volume;

      // Wait for sample to load
      console.log('📥 [PitchShifter] Loading audio sample...');
      await Tone.loaded();

      this.isInitialized = true;
      console.log('✅ [PitchShifter] Initialization complete');

    } catch (error) {
      console.error('❌ [PitchShifter] Initialization failed:', error);
      throw new Error(`PitchShifter initialization failed: ${error}`);
    }
  }

  /**
   * Play a note with the specified pitch
   *
   * @param note - Note name (e.g., "C4", "D4")
   * @param duration - Duration in seconds (default: 2)
   * @param velocity - Velocity 0-1 (default: 0.8)
   */
  async playNote(note: string, duration: number = 2, velocity: number = 0.8): Promise<void> {
    if (!this.isInitialized || !this.sampler) {
      throw new Error('PitchShifter not initialized. Call initialize() first.');
    }

    if (this.isPlaying) {
      console.warn('⚠️ [PitchShifter] Already playing, skipping');
      return;
    }

    try {
      this.isPlaying = true;

      // Validate note
      const noteInfo = PitchShifter.AVAILABLE_NOTES.find(n => n.note === note);
      if (!noteInfo) {
        throw new Error(`Invalid note: ${note}`);
      }

      console.log(`🎵 [PitchShifter] Playing ${note} (${noteInfo.frequency.toFixed(2)}Hz) for ${duration}s`);

      // Trigger attack
      this.sampler.triggerAttack(note, undefined, velocity);

      // Schedule release
      setTimeout(() => {
        if (this.sampler) {
          this.sampler.triggerRelease(note);
          console.log(`🔇 [PitchShifter] Released ${note}`);
        }
        this.isPlaying = false;
      }, duration * 1000);

    } catch (error) {
      this.isPlaying = false;
      console.error('❌ [PitchShifter] Play note failed:', error);
      throw error;
    }
  }

  /**
   * Play a random note from available range
   *
   * @param duration - Duration in seconds (default: 2)
   * @returns The note info that was played
   */
  async playRandomNote(duration: number = 2): Promise<NoteInfo> {
    const randomNote = PitchShifter.AVAILABLE_NOTES[
      Math.floor(Math.random() * PitchShifter.AVAILABLE_NOTES.length)
    ];

    console.log(`🎲 [PitchShifter] Random note selected: ${randomNote.note} (${randomNote.japaneseName})`);

    await this.playNote(randomNote.note, duration);

    return randomNote;
  }

  /**
   * Stop currently playing note immediately
   */
  stopNote(note: string): void {
    if (!this.sampler) {
      console.warn('⚠️ [PitchShifter] Not initialized');
      return;
    }

    this.sampler.triggerRelease(note);
    this.isPlaying = false;
    console.log(`🛑 [PitchShifter] Stopped ${note}`);
  }

  /**
   * Stop all currently playing notes
   */
  stopAll(): void {
    if (!this.sampler) {
      console.warn('⚠️ [PitchShifter] Not initialized');
      return;
    }

    this.sampler.releaseAll();
    this.isPlaying = false;
    console.log('🛑 [PitchShifter] Stopped all notes');
  }

  /**
   * Set volume in dB
   */
  setVolume(volumeDb: number): void {
    if (!this.sampler) {
      console.warn('⚠️ [PitchShifter] Not initialized');
      return;
    }

    this.sampler.volume.value = volumeDb;
    console.log(`🔊 [PitchShifter] Volume set to ${volumeDb}dB`);
  }

  /**
   * Get note info by note name
   */
  static getNoteInfo(note: string): NoteInfo | undefined {
    return PitchShifter.AVAILABLE_NOTES.find(n => n.note === note);
  }

  /**
   * Get note info by frequency (finds closest match)
   */
  static getNoteByFrequency(frequency: number): NoteInfo {
    let closestNote = PitchShifter.AVAILABLE_NOTES[0];
    let minDiff = Math.abs(frequency - closestNote.frequency);

    for (const noteInfo of PitchShifter.AVAILABLE_NOTES) {
      const diff = Math.abs(frequency - noteInfo.frequency);
      if (diff < minDiff) {
        minDiff = diff;
        closestNote = noteInfo;
      }
    }

    return closestNote;
  }

  /**
   * Check if currently playing
   */
  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    if (this.sampler) {
      this.sampler.dispose();
      this.sampler = null;
    }

    this.isInitialized = false;
    this.isPlaying = false;
    console.log('🗑️ [PitchShifter] Disposed');
  }
}
