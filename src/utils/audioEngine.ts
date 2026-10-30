/**
 * Web Audio API underwater sound synthesizer for ambient aquarium realism.
 * Self-contained without external audio assets.
 */

class AquariumAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true;
  private volume: number = 0.5;

  private masterGain: GainNode | null = null;
  private bubbleGain: GainNode | null = null;
  private droneGain: GainNode | null = null;

  private bubbleNoiseNode: AudioNode | null = null;
  private bubbleFilter: BiquadFilterNode | null = null;
  private bubbleLfo: OscillatorNode | null = null;
  private droneOsc: OscillatorNode | null = null;
  private isRunning: boolean = false;

  private initContext() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AudioCtx();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.setupAmbience();
  }

  private setupAmbience() {
    if (!this.ctx || !this.masterGain) return;

    // 1. Continuous Bubble Aerator Effervescence
    // Generate pinkish noise buffer for smooth underwater bubbles
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
      b6 = white * 0.115926;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Resonant bandpass filter that modulates frequency to simulate water bubbling
    this.bubbleFilter = this.ctx.createBiquadFilter();
    this.bubbleFilter.type = 'bandpass';
    this.bubbleFilter.frequency.setValueAtTime(540, this.ctx.currentTime);
    this.bubbleFilter.Q.setValueAtTime(4.5, this.ctx.currentTime);

    // LFO to gently modulate the bubble pitch
    this.bubbleLfo = this.ctx.createOscillator();
    this.bubbleLfo.type = 'sine';
    this.bubbleLfo.frequency.setValueAtTime(3.2, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(180, this.ctx.currentTime);
    this.bubbleLfo.connect(lfoGain);
    lfoGain.connect(this.bubbleFilter.frequency);

    this.bubbleGain = this.ctx.createGain();
    this.bubbleGain.gain.setValueAtTime(0.18, this.ctx.currentTime);

    noiseSource.connect(this.bubbleFilter);
    this.bubbleFilter.connect(this.bubbleGain);
    this.bubbleGain.connect(this.masterGain);

    // 2. Deep Sub-Surface Water Drone (Calm oceanic resonance)
    this.droneOsc = this.ctx.createOscillator();
    this.droneOsc.type = 'sine';
    this.droneOsc.frequency.setValueAtTime(55, this.ctx.currentTime); // 55Hz low gentle hum

    const droneFilter = this.ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(90, this.ctx.currentTime);

    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    this.droneOsc.connect(droneFilter);
    droneFilter.connect(this.droneGain);
    this.droneGain.connect(this.masterGain);

    noiseSource.start();
    this.bubbleLfo.start();
    this.droneOsc.start();
    this.bubbleNoiseNode = noiseSource;
    this.isRunning = true;
  }

  public setAeratorIntensity(intensity: number) {
    if (!this.bubbleGain || !this.ctx) return;
    // intensity 0 to 1
    const targetGain = 0.05 + intensity * 0.25;
    this.bubbleGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.2);
    if (this.bubbleFilter && this.bubbleLfo) {
      this.bubbleFilter.frequency.setTargetAtTime(400 + intensity * 350, this.ctx.currentTime, 0.2);
      this.bubbleLfo.frequency.setTargetAtTime(2.0 + intensity * 3.5, this.ctx.currentTime, 0.2);
    }
  }

  public toggleMute(): boolean {
    this.initContext();
    if (!this.ctx || !this.masterGain) return true;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = !this.isMuted;
    const target = this.isMuted ? 0 : this.volume;
    this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.1);
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    if (this.ctx.state === 'suspended' && !muted) {
      this.ctx.resume();
    }
    this.isMuted = muted;
    const target = this.isMuted ? 0 : this.volume;
    this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.1);
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (!this.isMuted && this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public playWaterPlop(pitchOffset: number = 0) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const startFreq = 480 + Math.random() * 120 + pitchOffset;
      const endFreq = 950 + Math.random() * 200;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      // Audio playback failsafe
    }
  }

  public playGlassTap() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.15);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.19);
    } catch {
      // Audio failsafe
    }
  }

  public playNibble() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(750 + Math.random() * 200, now);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.04);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Audio failsafe
    }
  }

  public playGrowthChime() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      // Note 1: 523Hz (C5)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.12);
      gain1.gain.setValueAtTime(0.08, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc1.connect(gain1);
      gain1.connect(this.masterGain);
      osc1.start(now);
      osc1.stop(now + 0.23);

      // Note 2: 783.99Hz (G5) sparkling harmonic
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(783.99, now + 0.08);
      osc2.frequency.exponentialRampToValueAtTime(1046.5, now + 0.24);
      gain2.gain.setValueAtTime(0.06, now + 0.08);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      osc2.connect(gain2);
      gain2.connect(this.masterGain);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.33);
    } catch {
      // Audio failsafe
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getVolume(): number {
    return this.volume;
  }
}

export const audioEngine = new AquariumAudioEngine();
