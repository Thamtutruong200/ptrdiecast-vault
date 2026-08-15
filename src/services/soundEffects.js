/**
 * Pure Web Audio API Sound Synthesizer
 * Generates pristine, ultra-subtle Apple-grade haptic UI audio feedback
 * Zero external audio files required!
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  // Apple Tap / Click
  playTap() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.035);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {}
  }

  // Star / Favorite Toggle
  playStar() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [880, 1320].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.04);

        gain.gain.setValueAtTime(0.08, now + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + i * 0.04);
        osc.stop(now + i * 0.04 + 0.09);
      });
    } catch (e) {}
  }

  // Dice / Shuffle Sound
  playShuffle() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      [400, 600, 800, 1000].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq + Math.random() * 80, now + i * 0.03);

        gain.gain.setValueAtTime(0.05, now + i * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.03 + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + i * 0.03);
        osc.stop(now + i * 0.03 + 0.05);
      });
    } catch (e) {}
  }

  // Modal Open Sheet Sound
  playSheetOpen() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(560, now + 0.06);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch (e) {}
  }

  // Camera Shutter Snap
  playShutter() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Click 1
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(1400, now);
      gain1.gain.setValueAtTime(0.07, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.03);

      // Click 2
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(1100, now + 0.04);
      gain2.gain.setValueAtTime(0.08, now + 0.04);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(now + 0.04);
      osc2.stop(now + 0.09);
    } catch (e) {}
  }
}

export const sound = new SoundEngine();
