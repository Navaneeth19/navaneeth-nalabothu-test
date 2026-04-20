/* ══════════════════════════════════════
   AUDIO ENGINE — Courtroom Soundscape
══════════════════════════════════════ */
class AudioEngine {
    constructor() {
        this.ctx = null;
        this.master = null;
        this.enabled = false;
    }

    init() {
        if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.master = this.ctx.createGain();
        this.master.gain.value = .45;
        this.master.connect(this.ctx.destination);
        this.enabled = true;
    }

    _osc(freq, type, dur, freqEnd, g0, g1, startOffset = 0) {
        if (!this.enabled) return;
        const t = this.ctx.currentTime + startOffset;
        const osc  = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, t);
        if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, t + dur);
        gain.gain.setValueAtTime(g0, t);
        gain.gain.exponentialRampToValueAtTime(g1 || .0001, t + dur);
        osc.connect(gain); gain.connect(this.master);
        osc.start(t); osc.stop(t + dur + .02);
    }

    // Subtle gold chime on hover
    playHover() {
        this._osc(1200, 'sine', .12, 1600, .04, .0001);
    }

    // Heavy gavel strike — thud + crack + room reverb sim
    playGavel() {
        if (!this.enabled) return;
        const t = this.ctx.currentTime;

        // Sub thud
        this._osc(80, 'sine', .6, 20, 1.2, .0001);
        // Mid body
        this._osc(200, 'triangle', .35, 40, .6, .0001);
        // High crack
        this._osc(1200, 'sawtooth', .08, 300, .3, .0001);
        // Room tail (noise-like via detuned saws)
        this._osc(55, 'sawtooth', .8, 30, .15, .0001, .05);
        this._osc(58, 'sawtooth', .8, 32, .12, .0001, .05);
    }

    // Courtroom bell — verdict
    playVerdict() {
        if (!this.enabled) return;
        const bells = [523, 659, 784, 1047];
        bells.forEach((f, i) => {
            this._osc(f, 'sine', 1.2, f*.5, .18, .0001, i * .12);
        });
    }

    // Typewriter key click
    playType() {
        this._osc(800, 'square', .04, 400, .06, .0001);
    }

    // Success chord
    playSuccess() {
        if (!this.enabled) return;
        [523, 659, 784].forEach((f, i) => {
            this._osc(f, 'sine', .5, null, .14, .0001, i * .08);
        });
    }

    playClick() {
        this._osc(400, 'square', .06, 200, .08, .0001);
    }
}

const audio = new AudioEngine();
