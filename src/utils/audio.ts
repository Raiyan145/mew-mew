/**
 * Audio Synthesizer for Johaer's Flappy Adventure using Web Audio API.
 * Self-contained, zero external audio asset loading required, ultra low-latency.
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Check saved audio preference
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('johaer_sound_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('johaer_sound_muted', String(this.isMuted));
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Cute bouncy cartoon flap/chirp sound
   */
  public playFlap() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      // Pitch sweeps upward swiftly
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.12);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);

      // Second harmonic for airy wing flap effect
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(450, now);
      osc2.frequency.exponentialRampToValueAtTime(890, now + 0.1);
      gain2.gain.setValueAtTime(0.12, now);
      gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);

      osc2.start(now);
      osc2.stop(now + 0.11);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  /**
   * Joyful arcade score ding
   */
  public playScore() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // High bright two-tone chime
      const notes = [987.77, 1318.51]; // B5, E6
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.25, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.19);
      });
    } catch {}
  }

  /**
   * Comical BONK! sound when hitting obstacle
   */
  public playBonk() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // 1. Heavy low punch / thud
      const oscLow = this.ctx.createOscillator();
      const gainLow = this.ctx.createGain();
      oscLow.type = 'square';
      oscLow.frequency.setValueAtTime(160, now);
      oscLow.frequency.exponentialRampToValueAtTime(45, now + 0.18);

      gainLow.gain.setValueAtTime(0.4, now);
      gainLow.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      oscLow.connect(gainLow);
      gainLow.connect(this.ctx.destination);
      oscLow.start(now);
      oscLow.stop(now + 0.22);

      // 2. Cartoon metal "clank" or wooden hollow "tonk"
      const oscTonk = this.ctx.createOscillator();
      const gainTonk = this.ctx.createGain();
      oscTonk.type = 'triangle';
      oscTonk.frequency.setValueAtTime(520, now);
      oscTonk.frequency.exponentialRampToValueAtTime(140, now + 0.14);

      gainTonk.gain.setValueAtTime(0.5, now);
      gainTonk.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      oscTonk.connect(gainTonk);
      gainTonk.connect(this.ctx.destination);
      oscTonk.start(now);
      oscTonk.stop(now + 0.16);

      // 3. Funny spring boing aftermath
      const oscBoing = this.ctx.createOscillator();
      const gainBoing = this.ctx.createGain();
      oscBoing.type = 'sine';
      oscBoing.frequency.setValueAtTime(320, now + 0.06);
      oscBoing.frequency.linearRampToValueAtTime(260, now + 0.12);
      oscBoing.frequency.linearRampToValueAtTime(300, now + 0.18);
      oscBoing.frequency.linearRampToValueAtTime(240, now + 0.25);

      gainBoing.gain.setValueAtTime(0.2, now + 0.06);
      gainBoing.gain.exponentialRampToValueAtTime(0.005, now + 0.28);

      oscBoing.connect(gainBoing);
      gainBoing.connect(this.ctx.destination);
      oscBoing.start(now + 0.06);
      oscBoing.stop(now + 0.3);
    } catch {}
  }

  /**
   * Cartoon descending slide whistle when falling
   */
  public playFall() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      // Whistle sliding down
      osc.frequency.setValueAtTime(700, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.55);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.linearRampToValueAtTime(0.2, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.55);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.56);
    } catch {}
  }

  /**
   * Milestone Fanfare (celebrating 10, 25, 50, 100)
   */
  public playMilestone() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Arpeggiated C major fanfare: C5, E5, G5, C6
      const chord = [523.25, 659.25, 783.99, 1046.50];
      chord.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = idx === 3 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        const startTime = now + idx * 0.08;
        const dur = idx === 3 ? 0.6 : 0.2;

        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + dur + 0.01);
      });
    } catch {}
  }

  /**
   * UI button click sound
   */
  public playClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.06);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {}
  }
}

export const sound = new SoundManager();
