import * as Tone from "tone";

// ═══════════════════════════════════════
// SOUND ENGINE — Pro procedural audio v3
// ═══════════════════════════════════════
let audioStarted = false;
export const startAudio = async () => { if (!audioStarted) { await Tone.start(); audioStarted = true; } };

// ── Crowd Ambience Engine ──
export const Crowd = {
  _running: false, _noise: null, _filter: null, _gain: null, _lfo: null,
  _roarNoise: null, _roarFilter: null, _roarGain: null,
  _targetVol: 0.12, _intensity: 0.5,
  init() {
    if (this._noise) return;
    this._noise = new Tone.Noise('brown');
    this._filter = new Tone.Filter({ frequency: 400, type: 'bandpass', Q: 0.7 });
    this._gain = new Tone.Gain(0);
    this._lfo = new Tone.LFO({ frequency: 0.15, min: 280, max: 520, type: 'sine' }).start();
    this._lfo.connect(this._filter.frequency);
    this._noise.connect(this._filter);
    this._filter.connect(this._gain);
    this._gain.toDestination();
    this._roarNoise = new Tone.Noise('white');
    this._roarFilter = new Tone.Filter({ frequency: 800, type: 'bandpass', Q: 0.5 });
    this._roarGain = new Tone.Gain(0);
    this._roarNoise.connect(this._roarFilter);
    this._roarFilter.connect(this._roarGain);
    this._roarGain.toDestination();
  },
  start() {
    this.init();
    if (this._running || SFX._muted) return;
    this._running = true;
    this._noise.start();
    this._roarNoise.start();
    this._gain.gain.rampTo(this._targetVol, 2);
  },
  stop() {
    if (!this._running) return;
    this._running = false;
    this._gain.gain.rampTo(0, 1.5);
    this._roarGain.gain.rampTo(0, 0.5);
    setTimeout(() => { try { this._noise.stop(); this._roarNoise.stop(); } catch(e){} }, 2000);
  },
  roar(duration = 2.5) {
    if (!this._running) return;
    const now = Tone.now();
    this._roarGain.gain.cancelScheduledValues(now);
    this._roarGain.gain.setValueAtTime(0, now);
    this._roarGain.gain.linearRampToValueAtTime(0.18, now + 0.08);
    this._roarGain.gain.linearRampToValueAtTime(0.12, now + 0.5);
    this._roarGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    this._gain.gain.cancelScheduledValues(now);
    this._gain.gain.setValueAtTime(this._targetVol, now);
    this._gain.gain.linearRampToValueAtTime(this._targetVol * 2.5, now + 0.15);
    this._gain.gain.linearRampToValueAtTime(this._targetVol, now + duration);
  },
  groan(duration = 2) {
    if (!this._running) return;
    const now = Tone.now();
    this._gain.gain.cancelScheduledValues(now);
    this._gain.gain.setValueAtTime(this._targetVol, now);
    this._gain.gain.linearRampToValueAtTime(this._targetVol * 0.3, now + 0.1);
    this._gain.gain.linearRampToValueAtTime(this._targetVol * 0.6, now + 0.8);
    this._gain.gain.linearRampToValueAtTime(this._targetVol, now + duration);
  },
  setIntensity(val) {
    this._intensity = Math.max(0, Math.min(1, val));
    if (!this._running) return;
    this._targetVol = 0.06 + this._intensity * 0.14;
    this._gain.gain.rampTo(this._targetVol, 1);
    if (this._lfo) {
      this._lfo.min = 250 + this._intensity * 150;
      this._lfo.max = 450 + this._intensity * 200;
      this._lfo.frequency.value = 0.1 + this._intensity * 0.2;
    }
  }
};

// ── SFX Engine ──
export const SFX = {
  _synth: null, _noise: null, _metal: null, _whistle: null, _whistleGain: null,
  _kick: null, _kickFilter: null, _kickGain: null,
  _fanfare: null,
  _muted: false,
  init() {
    if (this._synth) return;
    this._synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0.08, release: 0.4 },
      volume: -14
    }).toDestination();
    this._fanfare = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.005, decay: 0.12, sustain: 0.15, release: 0.5 },
      volume: -18
    }).toDestination();
    this._noise = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: { attack: 0.003, decay: 0.06, sustain: 0 },
      volume: -22
    }).toDestination();
    this._metal = new Tone.MetalSynth({
      frequency: 600, envelope: { attack: 0.001, decay: 0.08, release: 0.02 },
      volume: -20
    }).toDestination();
    this._whistleGain = new Tone.Gain(0.18).toDestination();
    this._whistle = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.02, decay: 0.05, sustain: 0.6, release: 0.15 },
      volume: -8
    }).connect(this._whistleGain);
    this._kickGain = new Tone.Gain(0.15).toDestination();
    this._kickFilter = new Tone.Filter({ frequency: 300, type: 'lowpass', Q: 2 });
    this._kick = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.05 },
      volume: -6
    }).connect(this._kickFilter).connect(this._kickGain);
  },
  async play(type) {
    if (this._muted) return;
    await startAudio(); this.init();
    const s = this._synth, f = this._fanfare, w = this._whistle, now = Tone.now();
    try { switch(type) {
      case 'whistle': {
        w.triggerAttackRelease('E6', 0.5, now);
        const vib = new Tone.LFO({ frequency: 6, min: -30, max: 30 }).start(now).stop(now + 0.5);
        vib.connect(w.detune);
        setTimeout(() => vib.dispose(), 800);
        this._noise.triggerAttackRelease('0.06', now);
        break;
      }
      case 'whistle_double': {
        w.triggerAttackRelease('E6', 0.2, now);
        w.triggerAttackRelease('E6', 0.15, now + 0.25);
        w.triggerAttackRelease('E6', 0.5, now + 0.45);
        this._noise.triggerAttackRelease('0.04', now);
        this._noise.triggerAttackRelease('0.04', now + 0.25);
        this._noise.triggerAttackRelease('0.06', now + 0.45);
        break;
      }
      case 'goal': {
        Crowd.roar(3.5);
        f.triggerAttackRelease('C5', '8n', now + 0.05);
        f.triggerAttackRelease('E5', '8n', now + 0.15);
        f.triggerAttackRelease('G5', '8n', now + 0.25);
        f.triggerAttackRelease('C6', '4n', now + 0.35);
        s.triggerAttackRelease('C4', '8n', now + 0.05);
        s.triggerAttackRelease('C3', '8n', now + 0.35);
        this._metal.triggerAttackRelease('0.04', now);
        break;
      }
      case 'goal_rival': {
        Crowd.groan(3);
        s.triggerAttackRelease('Eb4', '4n', now + 0.1);
        s.triggerAttackRelease('C4', '4n', now + 0.3);
        s.triggerAttackRelease('Ab3', '2n', now + 0.5);
        this._metal.triggerAttackRelease('0.03', now);
        break;
      }
      case 'card': {
        w.triggerAttackRelease('F#6', 0.12, now);
        this._metal.triggerAttackRelease('0.06', now + 0.05);
        Crowd.roar(0.8);
        break;
      }
      case 'click': {
        this._noise.triggerAttackRelease('0.015', now);
        s.triggerAttackRelease('G6', '32n', now);
        break;
      }
      case 'event': {
        s.triggerAttackRelease('A5', '16n', now);
        s.triggerAttackRelease('D6', '16n', now + 0.08);
        s.triggerAttackRelease('A5', '16n', now + 0.16);
        break;
      }
      case 'reward': {
        s.triggerAttackRelease('E5', '16n', now);
        s.triggerAttackRelease('G#5', '16n', now + 0.08);
        s.triggerAttackRelease('B5', '16n', now + 0.16);
        s.triggerAttackRelease('E6', '8n', now + 0.24);
        this._noise.triggerAttackRelease('0.02', now + 0.24);
        break;
      }
      case 'victory': {
        Crowd.roar(5);
        f.triggerAttackRelease('C5', '8n', now);
        f.triggerAttackRelease('E5', '8n', now + 0.12);
        f.triggerAttackRelease('G5', '8n', now + 0.24);
        f.triggerAttackRelease('C6', '4n', now + 0.36);
        f.triggerAttackRelease('D5', '8n', now + 0.7);
        f.triggerAttackRelease('F5', '8n', now + 0.82);
        f.triggerAttackRelease('A5', '8n', now + 0.94);
        f.triggerAttackRelease('D6', '2n', now + 1.06);
        s.triggerAttackRelease('C3', '4n', now + 0.36);
        s.triggerAttackRelease('D3', '4n', now + 1.06);
        break;
      }
      case 'defeat': {
        Crowd.groan(3);
        s.triggerAttackRelease('D4', '4n', now + 0.2);
        s.triggerAttackRelease('Bb3', '4n', now + 0.5);
        s.triggerAttackRelease('G3', '4n', now + 0.8);
        s.triggerAttackRelease('F3', '2n', now + 1.1);
        break;
      }
      case 'halftime': {
        w.triggerAttackRelease('E6', 0.15, now);
        w.triggerAttackRelease('E6', 0.15, now + 0.2);
        this._noise.triggerAttackRelease('0.03', now);
        this._noise.triggerAttackRelease('0.03', now + 0.2);
        break;
      }
      case 'tick': {
        Crowd.roar(0.5);
        this._noise.triggerAttackRelease('0.02', now);
        break;
      }
      case 'kick': {
        this._kick.triggerAttackRelease('A1', '32n', now);
        this._noise.triggerAttackRelease('0.02', now);
        break;
      }
      case 'ascend': {
        f.triggerAttackRelease('C5', '8n', now);
        f.triggerAttackRelease('E5', '8n', now + 0.15);
        f.triggerAttackRelease('G5', '8n', now + 0.3);
        f.triggerAttackRelease('B5', '8n', now + 0.45);
        f.triggerAttackRelease('C6', '8n', now + 0.6);
        f.triggerAttackRelease('E6', '2n', now + 0.75);
        s.triggerAttackRelease('C3', '4n', now);
        s.triggerAttackRelease('G3', '4n', now + 0.6);
        Crowd.roar(4);
        break;
      }
    }} catch(e) {}
  }
};

// ── Background Music Engine (FIFA-style soundtrack) ──
// HTML5 Audio for file playback — simpler and more efficient than Tone.js for pre-recorded tracks
export const Music = {
  _player: null,
  _playlist: [],        // array of { url, title, artist }
  _shuffled: [],         // shuffled index order
  _currentIdx: 0,
  _volume: 0.35,
  _duckVolume: 0.12,    // volume during matches
  _enabled: true,
  _ducking: false,
  _initialized: false,
  _onTrackChange: null,  // callback(track) when track changes

  init(tracks) {
    if (this._initialized && this._playlist.length) return;
    this._playlist = tracks.filter(t => t && t.url);
    if (!this._playlist.length) return;
    this._shuffled = this._shuffle([...Array(this._playlist.length).keys()]);
    this._currentIdx = 0;
    this._player = new Audio();
    this._player.volume = this._enabled ? this._volume : 0;
    this._player.addEventListener('ended', () => this.next());
    this._player.addEventListener('error', () => this.next());
    this._initialized = true;
  },

  _shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  play() {
    if (!this._initialized || !this._playlist.length || !this._enabled) return;
    const track = this._playlist[this._shuffled[this._currentIdx]];
    if (!track) return;
    if (this._player.src !== track.url) {
      this._player.src = track.url;
    }
    this._player.volume = this._ducking ? this._duckVolume : this._volume;
    this._player.play().catch(() => {});
    if (this._onTrackChange) this._onTrackChange(track);
  },

  pause() {
    if (this._player) this._player.pause();
  },

  next() {
    if (!this._initialized || !this._playlist.length) return;
    this._currentIdx = (this._currentIdx + 1) % this._shuffled.length;
    // Reshuffle when we've gone through all tracks
    if (this._currentIdx === 0) {
      this._shuffled = this._shuffle([...Array(this._playlist.length).keys()]);
    }
    this.play();
  },

  prev() {
    if (!this._initialized || !this._playlist.length) return;
    this._currentIdx = (this._currentIdx - 1 + this._shuffled.length) % this._shuffled.length;
    this.play();
  },

  setVolume(v) {
    this._volume = Math.max(0, Math.min(1, v));
    if (this._player && !this._ducking) this._player.volume = this._volume;
  },

  // Duck volume during matches (crowd/SFX take priority)
  duck() {
    this._ducking = true;
    if (this._player) this._player.volume = this._duckVolume;
  },

  // Restore full volume after match
  unduck() {
    this._ducking = false;
    if (this._player) this._player.volume = this._volume;
  },

  toggle() {
    this._enabled = !this._enabled;
    if (!this._enabled) {
      this.pause();
    } else if (this._initialized) {
      this.play();
    }
    return this._enabled;
  },

  isPlaying() {
    return this._player && !this._player.paused;
  },

  getCurrentTrack() {
    if (!this._initialized || !this._playlist.length) return null;
    return this._playlist[this._shuffled[this._currentIdx]] || null;
  },

  onTrackChange(cb) {
    this._onTrackChange = cb;
  },
};