// ============================================================
// WC26 PENALTY SHOOTER — Retro 8-bit Chiptune Soundtrack
// Uses Web Audio API to generate procedural chiptune music
// ============================================================

const AudioEngine = (() => {
    let audioCtx = null;
    let masterGain = null;
    let currentTrack = null;
    let currentTrackName = null;
    let sfxGain = null;
    let musicGain = null;
    let isInitialized = false;
    let musicVolume = 0.35;
    let sfxVolume = 0.5;
    let muted = false;

    // Note frequencies (octave 3-5)
    const NOTES = {
        'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61,
        'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
        'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
        'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
        'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46,
        'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
        'C6': 1046.50,
        // Sharps/flats
        'Db3': 138.59, 'Eb3': 155.56, 'Gb3': 185.00, 'Ab3': 207.65, 'Bb3': 233.08,
        'Db4': 277.18, 'Eb4': 311.13, 'Gb4': 369.99, 'Ab4': 415.30, 'Bb4': 466.16,
        'Db5': 554.37, 'Eb5': 622.25, 'Gb5': 739.99, 'Ab5': 830.61, 'Bb5': 932.33,
    };

    function init() {
        if (isInitialized) return;
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioCtx.createGain();
        masterGain.gain.value = 0.8;
        masterGain.connect(audioCtx.destination);

        musicGain = audioCtx.createGain();
        musicGain.gain.value = musicVolume;
        musicGain.connect(masterGain);

        sfxGain = audioCtx.createGain();
        sfxGain.gain.value = sfxVolume;
        sfxGain.connect(masterGain);

        isInitialized = true;
    }

    function ensureContext() {
        if (!isInitialized) init();
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    // --- Oscillator helpers ---
    function createSquareOsc(freq, startTime, duration, gainNode, volume = 0.3) {
        const osc = audioCtx.createOscillator();
        const env = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.value = freq;
        env.gain.setValueAtTime(volume, startTime);
        env.gain.exponentialRampToValueAtTime(0.001, startTime + duration - 0.01);
        osc.connect(env);
        env.connect(gainNode);
        osc.start(startTime);
        osc.stop(startTime + duration);
        return osc;
    }

    function createPulseOsc(freq, startTime, duration, gainNode, volume = 0.25) {
        // Triangle wave for softer chiptune feel
        const osc = audioCtx.createOscillator();
        const env = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        env.gain.setValueAtTime(volume, startTime);
        env.gain.exponentialRampToValueAtTime(0.001, startTime + duration - 0.01);
        osc.connect(env);
        env.connect(gainNode);
        osc.start(startTime);
        osc.stop(startTime + duration);
        return osc;
    }

    function createNoiseHit(startTime, duration, gainNode, volume = 0.15) {
        const bufferSize = audioCtx.sampleRate * duration;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        const env = audioCtx.createGain();
        env.gain.setValueAtTime(volume, startTime);
        env.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.8);
        noise.connect(env);
        env.connect(gainNode);
        noise.start(startTime);
        noise.stop(startTime + duration);
        return noise;
    }

    // --- Track definitions ---
    // Each track is a function that schedules notes and returns { duration, oscillators }

    function scheduleTitleTrack(startTime) {
        // Upbeat anthem feel — think World Cup intro fanfare in 8-bit
        const bpm = 140;
        const beat = 60 / bpm;
        const oscs = [];

        // Melody (square wave) — triumphant fanfare
        const melody = [
            ['C5', 0.5], ['E5', 0.5], ['G5', 0.5], ['C6', 1],
            ['B5', 0.5], ['G5', 0.5], ['E5', 0.5], ['G5', 1],
            ['A5', 0.5], ['G5', 0.5], ['E5', 0.5], ['C5', 1],
            ['D5', 0.5], ['E5', 0.5], ['F5', 0.5], ['G5', 1.5],
            // Second phrase
            ['C5', 0.5], ['D5', 0.5], ['E5', 0.75], ['G5', 0.75],
            ['A5', 0.5], ['G5', 0.5], ['E5', 0.5], ['D5', 1],
            ['C5', 0.5], ['E5', 0.5], ['G5', 0.75], ['A5', 0.75],
            ['G5', 1], ['E5', 0.5], ['C5', 1.5],
        ];

        let t = startTime;
        for (const [note, dur] of melody) {
            oscs.push(createSquareOsc(NOTES[note], t, dur * beat * 0.9, musicGain, 0.25));
            t += dur * beat;
        }
        const melodyDuration = t - startTime;

        // Bass line (triangle wave)
        const bass = [
            ['C3', 1], ['C3', 1], ['G3', 1], ['G3', 1],
            ['A3', 1], ['A3', 1], ['E3', 1], ['G3', 1],
            ['F3', 1], ['F3', 1], ['C3', 1], ['C3', 1],
            ['G3', 1], ['G3', 1], ['C3', 1], ['C3', 1],
        ];

        t = startTime;
        for (const [note, dur] of bass) {
            oscs.push(createPulseOsc(NOTES[note], t, dur * beat * 0.85, musicGain, 0.2));
            t += dur * beat;
        }

        // Drums (noise hits on beats)
        t = startTime;
        const totalBeats = Math.floor(melodyDuration / beat);
        for (let i = 0; i < totalBeats; i++) {
            if (i % 2 === 0) {
                oscs.push(createNoiseHit(t, beat * 0.15, musicGain, 0.12));
            }
            if (i % 4 === 2) {
                oscs.push(createNoiseHit(t, beat * 0.08, musicGain, 0.18));
            }
            t += beat;
        }

        return { duration: melodyDuration, oscillators: oscs };
    }

    function scheduleTeamSelectTrack(startTime) {
        // Chill menu music — bouncy and light
        const bpm = 120;
        const beat = 60 / bpm;
        const oscs = [];

        // Arpeggio melody
        const melody = [
            ['E4', 0.5], ['G4', 0.5], ['B4', 0.5], ['E5', 0.5],
            ['D5', 0.5], ['B4', 0.5], ['G4', 0.5], ['A4', 0.5],
            ['C5', 0.5], ['E5', 0.5], ['G5', 0.5], ['E5', 0.5],
            ['D5', 0.5], ['C5', 0.5], ['B4', 0.5], ['A4', 0.5],
            // Second phrase
            ['F4', 0.5], ['A4', 0.5], ['C5', 0.5], ['F5', 0.5],
            ['E5', 0.5], ['C5', 0.5], ['A4', 0.5], ['G4', 0.5],
            ['E4', 0.5], ['G4', 0.5], ['B4', 0.5], ['D5', 0.5],
            ['C5', 1], ['B4', 0.5], ['G4', 0.5],
        ];

        let t = startTime;
        for (const [note, dur] of melody) {
            oscs.push(createSquareOsc(NOTES[note], t, dur * beat * 0.8, musicGain, 0.2));
            t += dur * beat;
        }
        const melodyDuration = t - startTime;

        // Bass
        const bass = [
            ['E3', 2], ['G3', 2], ['C3', 2], ['D3', 2],
            ['F3', 2], ['A3', 2], ['E3', 2], ['G3', 2],
        ];

        t = startTime;
        for (const [note, dur] of bass) {
            oscs.push(createPulseOsc(NOTES[note], t, dur * beat * 0.9, musicGain, 0.18));
            t += dur * beat;
        }

        // Light percussion
        t = startTime;
        const totalBeats = Math.floor(melodyDuration / beat);
        for (let i = 0; i < totalBeats; i++) {
            if (i % 4 === 0) {
                oscs.push(createNoiseHit(t, beat * 0.1, musicGain, 0.08));
            }
            t += beat;
        }

        return { duration: melodyDuration, oscillators: oscs };
    }

    function scheduleGameplayTrack(startTime) {
        // Tense, driving beat — builds anticipation
        const bpm = 130;
        const beat = 60 / bpm;
        const oscs = [];

        // Tense melody — minor key, suspenseful
        const melody = [
            ['A4', 0.5], ['C5', 0.5], ['E5', 1], ['D5', 0.5], ['C5', 0.5],
            ['B4', 1], ['A4', 0.5], ['G4', 0.5],
            ['A4', 0.5], ['B4', 0.5], ['C5', 1], ['E5', 0.5], ['D5', 0.5],
            ['C5', 0.5], ['B4', 0.5], ['A4', 1.5],
            // Second phrase — more intensity
            ['E5', 0.5], ['D5', 0.5], ['C5', 0.5], ['B4', 0.5],
            ['A4', 1], ['G4', 0.5], ['A4', 0.5],
            ['B4', 0.5], ['C5', 0.5], ['D5', 0.5], ['E5', 0.5],
            ['C5', 1], ['A4', 1.5],
        ];

        let t = startTime;
        for (const [note, dur] of melody) {
            oscs.push(createSquareOsc(NOTES[note], t, dur * beat * 0.85, musicGain, 0.2));
            t += dur * beat;
        }
        const melodyDuration = t - startTime;

        // Driving bass
        const bass = [
            ['A3', 0.5], ['A3', 0.5], ['E3', 0.5], ['A3', 0.5],
            ['G3', 0.5], ['G3', 0.5], ['D3', 0.5], ['G3', 0.5],
            ['F3', 0.5], ['F3', 0.5], ['C3', 0.5], ['F3', 0.5],
            ['E3', 0.5], ['E3', 0.5], ['B3', 0.5], ['E3', 0.5],
            ['A3', 0.5], ['A3', 0.5], ['E3', 0.5], ['A3', 0.5],
            ['G3', 0.5], ['G3', 0.5], ['D3', 0.5], ['G3', 0.5],
            ['F3', 0.5], ['F3', 0.5], ['C3', 0.5], ['F3', 0.5],
            ['E3', 1], ['E3', 0.5], ['E3', 0.5],
        ];

        t = startTime;
        for (const [note, dur] of bass) {
            oscs.push(createPulseOsc(NOTES[note], t, dur * beat * 0.75, musicGain, 0.2));
            t += dur * beat;
        }

        // Driving drums — more aggressive
        t = startTime;
        const totalBeats = Math.floor(melodyDuration / beat);
        for (let i = 0; i < totalBeats; i++) {
            if (i % 2 === 0) {
                oscs.push(createNoiseHit(t, beat * 0.12, musicGain, 0.14));
            }
            if (i % 2 === 1) {
                oscs.push(createNoiseHit(t, beat * 0.06, musicGain, 0.1));
            }
            t += beat;
        }

        return { duration: melodyDuration, oscillators: oscs };
    }

    function scheduleResultTrack(startTime) {
        // Victory fanfare — celebratory, bright
        const bpm = 150;
        const beat = 60 / bpm;
        const oscs = [];

        const melody = [
            ['C5', 0.25], ['E5', 0.25], ['G5', 0.5], ['C6', 1],
            ['B5', 0.5], ['A5', 0.5], ['G5', 1],
            ['A5', 0.25], ['B5', 0.25], ['C6', 0.5], ['G5', 1],
            ['E5', 0.5], ['G5', 0.5], ['C6', 1.5],
            // Repeat with variation
            ['G5', 0.25], ['A5', 0.25], ['B5', 0.5], ['C6', 0.5],
            ['A5', 0.5], ['G5', 0.5], ['E5', 1],
            ['F5', 0.25], ['G5', 0.25], ['A5', 0.5], ['G5', 0.5],
            ['E5', 0.5], ['C5', 0.5], ['E5', 1.5],
        ];

        let t = startTime;
        for (const [note, dur] of melody) {
            oscs.push(createSquareOsc(NOTES[note], t, dur * beat * 0.9, musicGain, 0.25));
            t += dur * beat;
        }
        const melodyDuration = t - startTime;

        // Harmony (slightly offset)
        const harmony = [
            ['E4', 1], ['G4', 1], ['C5', 1], ['E5', 1],
            ['F4', 1], ['A4', 1], ['C5', 1], ['E5', 1],
            ['E4', 1], ['G4', 1], ['B4', 1], ['D5', 1],
        ];

        t = startTime;
        for (const [note, dur] of harmony) {
            oscs.push(createPulseOsc(NOTES[note], t, dur * beat * 0.8, musicGain, 0.12));
            t += dur * beat;
        }

        // Celebratory bass
        const bass = [
            ['C3', 1], ['E3', 1], ['G3', 1], ['C4', 1],
            ['F3', 1], ['A3', 1], ['C4', 1], ['E4', 1],
            ['G3', 1], ['B3', 1], ['D4', 1], ['G3', 1],
        ];

        t = startTime;
        for (const [note, dur] of bass) {
            oscs.push(createPulseOsc(NOTES[note], t, dur * beat * 0.85, musicGain, 0.2));
            t += dur * beat;
        }

        // Percussion — upbeat
        t = startTime;
        const totalBeats = Math.floor(melodyDuration / beat);
        for (let i = 0; i < totalBeats; i++) {
            if (i % 2 === 0) {
                oscs.push(createNoiseHit(t, beat * 0.1, musicGain, 0.12));
            }
            if (i % 4 === 3) {
                oscs.push(createNoiseHit(t, beat * 0.06, musicGain, 0.15));
            }
            t += beat;
        }

        return { duration: melodyDuration, oscillators: oscs };
    }

    // --- Track looping ---
    let loopTimeout = null;

    function playTrack(trackName) {
        ensureContext();
        if (currentTrackName === trackName) return; // Already playing

        stopTrack();
        currentTrackName = trackName;

        function scheduleLoop() {
            const startTime = audioCtx.currentTime + 0.05;
            let result;

            switch (trackName) {
                case 'title': result = scheduleTitleTrack(startTime); break;
                case 'team-select': result = scheduleTeamSelectTrack(startTime); break;
                case 'gameplay': result = scheduleGameplayTrack(startTime); break;
                case 'result': result = scheduleResultTrack(startTime); break;
                default: return;
            }

            currentTrack = result;
            // Schedule next loop slightly before this one ends
            loopTimeout = setTimeout(scheduleLoop, (result.duration - 0.1) * 1000);
        }

        scheduleLoop();
    }

    function stopTrack() {
        if (loopTimeout) {
            clearTimeout(loopTimeout);
            loopTimeout = null;
        }
        currentTrackName = null;
        currentTrack = null;
        // Fade out any lingering sound
        if (musicGain) {
            musicGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.05);
            setTimeout(() => {
                if (musicGain) musicGain.gain.setValueAtTime(musicVolume, audioCtx.currentTime);
            }, 200);
        }
    }

    // --- Sound Effects ---
    function playSfx(type) {
        ensureContext();
        const now = audioCtx.currentTime;

        switch (type) {
            case 'kick': {
                // Short punchy kick sound
                const osc = audioCtx.createOscillator();
                const env = audioCtx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.exponentialRampToValueAtTime(80, now + 0.1);
                env.gain.setValueAtTime(sfxVolume * 0.6, now);
                env.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
                osc.connect(env);
                env.connect(sfxGain);
                osc.start(now);
                osc.stop(now + 0.15);
                // Noise burst
                createNoiseHit(now, 0.08, sfxGain, 0.3);
                break;
            }
            case 'goal': {
                // Triumphant ascending notes
                const freqs = [523.25, 659.25, 783.99, 1046.50];
                freqs.forEach((f, i) => {
                    createSquareOsc(f, now + i * 0.1, 0.2, sfxGain, 0.3);
                });
                break;
            }
            case 'save': {
                // Descending thud
                const osc = audioCtx.createOscillator();
                const env = audioCtx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
                env.gain.setValueAtTime(sfxVolume * 0.4, now);
                env.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
                osc.connect(env);
                env.connect(sfxGain);
                osc.start(now);
                osc.stop(now + 0.25);
                break;
            }
            case 'miss': {
                // Sad descending tone
                const osc = audioCtx.createOscillator();
                const env = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(350, now);
                osc.frequency.exponentialRampToValueAtTime(150, now + 0.3);
                env.gain.setValueAtTime(sfxVolume * 0.35, now);
                env.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
                osc.connect(env);
                env.connect(sfxGain);
                osc.start(now);
                osc.stop(now + 0.35);
                break;
            }
            case 'post': {
                // Metallic clang
                const osc1 = audioCtx.createOscillator();
                const osc2 = audioCtx.createOscillator();
                const env = audioCtx.createGain();
                osc1.type = 'square';
                osc1.frequency.value = 1200;
                osc2.type = 'square';
                osc2.frequency.value = 1350;
                env.gain.setValueAtTime(sfxVolume * 0.5, now);
                env.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
                osc1.connect(env);
                osc2.connect(env);
                env.connect(sfxGain);
                osc1.start(now);
                osc2.start(now);
                osc1.stop(now + 0.2);
                osc2.stop(now + 0.2);
                break;
            }
            case 'whistle': {
                // Referee whistle
                const osc = audioCtx.createOscillator();
                const env = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(2800, now);
                osc.frequency.setValueAtTime(3200, now + 0.15);
                osc.frequency.setValueAtTime(2800, now + 0.3);
                env.gain.setValueAtTime(sfxVolume * 0.3, now);
                env.gain.setValueAtTime(sfxVolume * 0.3, now + 0.35);
                env.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
                osc.connect(env);
                env.connect(sfxGain);
                osc.start(now);
                osc.stop(now + 0.5);
                break;
            }
            case 'select': {
                // Menu selection blip
                const osc = audioCtx.createOscillator();
                const env = audioCtx.createGain();
                osc.type = 'square';
                osc.frequency.value = 880;
                env.gain.setValueAtTime(sfxVolume * 0.2, now);
                env.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
                osc.connect(env);
                env.connect(sfxGain);
                osc.start(now);
                osc.stop(now + 0.06);
                break;
            }
            case 'confirm': {
                // Menu confirm — two quick ascending notes
                createSquareOsc(660, now, 0.08, sfxGain, 0.25);
                createSquareOsc(880, now + 0.08, 0.1, sfxGain, 0.25);
                break;
            }
        }
    }

    function setMusicVolume(v) {
        musicVolume = Math.max(0, Math.min(1, v));
        if (musicGain && !muted) musicGain.gain.setValueAtTime(musicVolume, audioCtx.currentTime);
    }

    function setSfxVolume(v) {
        sfxVolume = Math.max(0, Math.min(1, v));
        if (sfxGain && !muted) sfxGain.gain.setValueAtTime(sfxVolume, audioCtx.currentTime);
    }

    function toggleMute() {
        ensureContext();
        muted = !muted;
        if (muted) {
            masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
        } else {
            masterGain.gain.setValueAtTime(0.8, audioCtx.currentTime);
        }
        return muted;
    }

    function isMuted() {
        return muted;
    }

    return {
        init,
        playTrack,
        stopTrack,
        playSfx,
        setMusicVolume,
        setSfxVolume,
        toggleMute,
        isMuted,
    };
})();
