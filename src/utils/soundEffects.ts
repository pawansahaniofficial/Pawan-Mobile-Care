// Procedural Web Audio API sound generator for Messenger tones and phone calls
// Completely self-contained: no external audio files required, zero 404 risk.

class SoundEffects {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ringOsc1: OscillatorNode | null = null;
  private ringOsc2: OscillatorNode | null = null;
  private ringInterval: number | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopRingtone();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Messenger message send "pop"
  public playSendSound() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(720, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }

  // Messenger message receive "ding-dong" chime
  public playReceiveSound() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      // Note 1
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      gain1.gain.setValueAtTime(0.18, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.18);

      // Note 2
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.09); // A5
      gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.09);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime + 0.09);
      osc2.stop(ctx.currentTime + 0.35);
    } catch {}
  }

  // Phone Call Ringing Loop (Dual-tone frequency modulation)
  public startRingtone() {
    if (this.isMuted) return;
    this.stopRingtone();
    const ctx = this.getContext();
    if (!ctx) return;

    const playRingBurst = () => {
      try {
        const cur = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(440, cur); // A4
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(480, cur); // B4

        gain.gain.setValueAtTime(0.12, cur);
        gain.gain.setValueAtTime(0.12, cur + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.001, cur + 1.25);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(cur);
        osc2.start(cur);
        osc1.stop(cur + 1.25);
        osc2.stop(cur + 1.25);
      } catch {}
    };

    playRingBurst();
    this.ringInterval = window.setInterval(playRingBurst, 3000);
  }

  public stopRingtone() {
    if (this.ringInterval !== null) {
      clearInterval(this.ringInterval);
      this.ringInterval = null;
    }
  }

  // Call Connected Chime
  public playConnectedSound() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const cur = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, cur + idx * 0.08);
        gain.gain.setValueAtTime(0.15, cur + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, cur + idx * 0.08 + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(cur + idx * 0.08);
        osc.stop(cur + idx * 0.08 + 0.15);
      });
    } catch {}
  }

  // WhatsApp Outgoing Call Ringtone Loop (Distinctive high double-beep blip)
  public startWhatsAppRingtone() {
    if (this.isMuted) return;
    this.stopRingtone();
    const ctx = this.getContext();
    if (!ctx) return;

    const playWhatsAppBurst = () => {
      try {
        const cur = ctx.currentTime;
        // First tone
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(425, cur);
        gain1.gain.setValueAtTime(0.12, cur);
        gain1.gain.exponentialRampToValueAtTime(0.001, cur + 0.35);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(cur);
        osc1.stop(cur + 0.35);

        // Second tone (slightly offset for WhatsApp's rhythmic cadence)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(425, cur + 0.45);
        gain2.gain.setValueAtTime(0.12, cur + 0.45);
        gain2.gain.exponentialRampToValueAtTime(0.001, cur + 0.8);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(cur + 0.45);
        osc2.stop(cur + 0.8);
      } catch {}
    };

    playWhatsAppBurst();
    this.ringInterval = window.setInterval(playWhatsAppBurst, 2800);
  }

  // Call End Tone (double low beep)
  public playHangupSound() {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const cur = ctx.currentTime;
      [440, 370].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, cur + idx * 0.15);
        gain.gain.setValueAtTime(0.15, cur + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, cur + idx * 0.15 + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(cur + idx * 0.15);
        osc.stop(cur + idx * 0.15 + 0.12);
      });
    } catch {}
  }
}

export const sounds = new SoundEffects();
