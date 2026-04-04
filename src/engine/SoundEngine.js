import * as Tone from 'tone';

export class SoundEngine {
  constructor() {
    this.initialized = false;
    this.synths = {};
    this.enabled = true;
  }

  async init() {
    if (this.initialized) return;
    await Tone.start();

    this.synths.draw = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.05, release: 0.3 },
      volume: -20,
    }).toDestination();

    this.synths.gestureChange = new Tone.MembraneSynth({
      pitchDecay: 0.01,
      octaves: 2,
      envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.1 },
      volume: -18,
    }).toDestination();

    this.synths.undo = new Tone.PluckSynth({ volume: -15 }).toDestination();

    this.synths.clear = new Tone.NoiseSynth({
      noise: { type: 'pink' },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.2 },
      volume: -22,
    }).toDestination();

    this.synths.colorSwitch = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.01, decay: 0.08, sustain: 0, release: 0.2 },
      volume: -16,
    }).toDestination();

    this.initialized = true;
  }

  play(event) {
    if (!this.initialized || !this.enabled) return;

    try {
      const now = Tone.now();
      switch (event) {
        case 'draw_start':
          this.synths.draw.triggerAttackRelease('C5', '16n', now);
          break;
        case 'draw_end':
          this.synths.draw.triggerAttackRelease('E4', '32n', now);
          break;
        case 'erase':
          this.synths.gestureChange.triggerAttackRelease('C2', '16n', now);
          break;
        case 'undo':
          this.synths.undo.triggerAttackRelease('A3', now);
          break;
        case 'clear':
          this.synths.clear.triggerAttackRelease('8n', now);
          break;
        case 'color_switch':
          this.synths.colorSwitch.triggerAttackRelease('G5', '32n', now);
          break;
        case 'gesture_change':
          this.synths.gestureChange.triggerAttackRelease('E3', '32n', now);
          break;
      }
    } catch {
      // audio context may not be ready
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  dispose() {
    Object.values(this.synths).forEach((s) => s.dispose());
    this.synths = {};
    this.initialized = false;
  }
}
