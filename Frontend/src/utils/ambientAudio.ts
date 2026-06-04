export type AmbientTrack = 'off' | 'lab' | 'bubbles' | 'noise';

interface ActiveSource {
  stop: () => void;
}

const MASTER_GAIN = 0.08;

export class AmbientAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private active: ActiveSource[] = [];
  private current: AmbientTrack = 'off';
  private bubbleTimer: number | null = null;

  private ensureCtx(): AudioContext {
    if (this.ctx && this.ctx.state !== 'closed') return this.ctx;
    const Ctx = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = MASTER_GAIN;
    this.master.connect(this.ctx.destination);
    return this.ctx;
  }

  async resume() {
    const ctx = this.ensureCtx();
    if (ctx.state === 'suspended') {
      try { await ctx.resume(); } catch { /* ignore */ }
    }
  }

  setVolume(v: number) {
    if (this.master) this.master.gain.value = Math.max(0, Math.min(1, v)) * MASTER_GAIN;
  }

  async start(track: AmbientTrack) {
    if (track === this.current) return;
    this.stop();
    if (track === 'off') {
      this.current = 'off';
      return;
    }
    await this.resume();
    const ctx = this.ensureCtx();
    if (track === 'lab') this.startLabHum(ctx);
    else if (track === 'bubbles') this.startBubbles(ctx);
    else if (track === 'noise') this.startWhiteNoise(ctx);
    this.current = track;
  }

  stop() {
    this.active.forEach(s => {
      try { s.stop(); } catch { /* ignore */ }
    });
    this.active = [];
    if (this.bubbleTimer !== null) {
      clearTimeout(this.bubbleTimer);
      this.bubbleTimer = null;
    }
  }

  destroy() {
    this.stop();
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close().catch(() => undefined);
    }
    this.ctx = null;
    this.master = null;
    this.current = 'off';
  }

  private startLabHum(ctx: AudioContext) {
    const baseFreqs = [55, 110, 165];
    const oscs: OscillatorNode[] = [];
    const gains: GainNode[] = [];
    baseFreqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq * (1 + (i * 0.005));
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.07 + i * 0.03;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 1.5;
      lfo.connect(lfoGain).connect(osc.frequency);
      lfo.start();
      const gain = ctx.createGain();
      gain.gain.value = i === 0 ? 0.6 : 0.18;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 320;
      filter.Q.value = 0.5;
      osc.connect(filter).connect(gain).connect(this.master!);
      osc.start();
      oscs.push(osc, lfo);
      gains.push(gain, lfoGain);
    });
    this.active.push({
      stop: () => {
        oscs.forEach(o => { try { o.stop(); } catch { /* ignore */ } });
      },
    });
  }

  private startBubbles(ctx: AudioContext) {
    const schedule = () => {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      osc.type = 'sine';
      const basePitch = 220 + Math.random() * 380;
      osc.frequency.setValueAtTime(basePitch * 2, now);
      osc.frequency.exponentialRampToValueAtTime(basePitch, now + 0.08);
      filter.type = 'bandpass';
      filter.frequency.value = basePitch;
      filter.Q.value = 6;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.5, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(filter).connect(gain).connect(this.master!);
      osc.start(now);
      osc.stop(now + 0.2);
      const next = 220 + Math.random() * 580;
      this.bubbleTimer = window.setTimeout(schedule, next);
    };
    schedule();
  }

  private startWhiteNoise(ctx: AudioContext) {
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      output[i] = lastOut * 3.5;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;
    filter.Q.value = 0.7;
    const gain = ctx.createGain();
    gain.gain.value = 0.7;
    noise.connect(filter).connect(gain).connect(this.master!);
    noise.start();
    this.active.push({
      stop: () => { try { noise.stop(); } catch { /* ignore */ } },
    });
  }
}

let instance: AmbientAudio | null = null;

export const getAmbientAudio = (): AmbientAudio => {
  if (!instance) instance = new AmbientAudio();
  return instance;
};
