"""Original background music (lo-fi and bright pop), synthesized from scratch (no samples, no licensing).

usage: python lofi_synth.py <out.wav> <seconds> <bpm> <mood>
  mood: "bright" (R1, light & bouncy) | "calm" (C1, mellow)

Electric-piano chords + soft bass + kick/snare/hat + vinyl crackle, warm low-pass,
fade in/out, peak-normalized to -1 dBFS. Deterministic (fixed seed) so a rebuild
gives the same track.
"""
import sys
import numpy as np
from scipy.signal import butter, sosfilt
from scipy.io import wavfile

SR = 44100
rng = np.random.default_rng(7)


def note_hz(n):  # MIDI note -> Hz
    return 440.0 * 2 ** ((n - 69) / 12)


def env_adsr(n, a=0.01, d=0.25, s=0.55, r=0.35, length=None):
    length = length or n
    t = np.arange(n) / SR
    e = np.ones(n) * s
    ai, di = int(a * SR), int(d * SR)
    e[:ai] = np.linspace(0, 1, ai, endpoint=False)
    e[ai:ai + di] = np.linspace(1, s, di, endpoint=False)[: max(0, min(di, n - ai))]
    ri = int(r * SR)
    if n > ri:
        e[-ri:] *= np.linspace(1, 0, ri)
    return e


def epiano(freq, dur, vel=0.5):
    n = int(dur * SR)
    t = np.arange(n) / SR
    tone = (np.sin(2 * np.pi * freq * t) + 0.35 * np.sin(2 * np.pi * 2 * freq * t) * np.exp(-t * 3)
            + 0.12 * np.sin(2 * np.pi * 3 * freq * t) * np.exp(-t * 6))
    trem = 1 + 0.08 * np.sin(2 * np.pi * 4.5 * t)
    return vel * tone * trem * env_adsr(n, 0.005, 0.6, 0.35, 0.5) * np.exp(-t * 0.6)


def bass(freq, dur, vel=0.5):
    n = int(dur * SR)
    t = np.arange(n) / SR
    return vel * (np.sin(2 * np.pi * freq * t) + 0.2 * np.sin(2 * np.pi * 2 * freq * t)) * env_adsr(n, 0.01, 0.2, 0.7, 0.15)


def kick():
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    f = 50 + 70 * np.exp(-t * 30)
    return 0.9 * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)


def snare():
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    noise = sosfilt(butter(2, [1200, 6000], "bandpass", fs=SR, output="sos"), rng.standard_normal(n))
    return 0.35 * noise * np.exp(-t * 18) + 0.15 * np.sin(2 * np.pi * 190 * t) * np.exp(-t * 25)


def hat():
    n = int(0.06 * SR)
    t = np.arange(n) / SR
    noise = sosfilt(butter(2, 7000, "highpass", fs=SR, output="sos"), rng.standard_normal(n))
    return 0.12 * noise * np.exp(-t * 70)


def pluck(freq, dur, vel=0.5):
    """Karplus-Strong plucked string (ukulele/guitar-like)."""
    n = int(dur * SR)
    period = max(2, int(SR / freq))
    buf = rng.uniform(-1, 1, period)
    out = np.empty(n)
    for i in range(n):
        out[i] = buf[i % period]
        buf[i % period] = 0.996 * 0.5 * (buf[i % period] + buf[(i + 1) % period])
    return vel * out


def clap():
    n = int(0.18 * SR)
    t = np.arange(n) / SR
    noise = sosfilt(butter(2, [900, 4000], "bandpass", fs=SR, output="sos"), rng.standard_normal(n))
    env = np.exp(-t * 30) + 0.6 * np.exp(-np.maximum(t - 0.012, 0) * 30) * (t > 0.012)
    return 0.4 * noise * env


def shaker():
    n = int(0.05 * SR)
    t = np.arange(n) / SR
    noise = sosfilt(butter(2, 5000, "highpass", fs=SR, output="sos"), rng.standard_normal(n))
    return 0.07 * noise * np.sin(np.pi * t / t[-1])


def marimba(freq, dur, vel=0.5):
    n = int(dur * SR)
    t = np.arange(n) / SR
    return vel * (np.sin(2 * np.pi * freq * t) * np.exp(-t * 7) + 0.25 * np.sin(2 * np.pi * 4 * freq * t) * np.exp(-t * 30))


def whistle(freq, dur, vel=0.5):
    n = int(dur * SR)
    t = np.arange(n) / SR
    vib = 1 + 0.006 * np.sin(2 * np.pi * 5.5 * t) * np.minimum(t / 0.15, 1)
    tone = np.sin(2 * np.pi * np.cumsum(freq * vib) / SR) + 0.03 * rng.standard_normal(n)
    return vel * tone * env_adsr(n, 0.03, 0.1, 0.8, min(0.08, dur / 3))


def chip(freq, dur, vel=0.5):
    """Soft square lead (rounded so it stays friendly, not harsh)."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    sq = sum(np.sin(2 * np.pi * (2 * h + 1) * freq * t) / (2 * h + 1) for h in range(5))
    return vel * 0.7 * sq * env_adsr(n, 0.005, 0.08, 0.6, min(0.05, dur / 3))


# Rotation variants (added 2026-11-23 so Kira posts don't all share one track).
#   key: semitones from D major · prog: chord order · lead: melody voice · bass: pattern · swing: 8th swing ratio
CHEERFUL_VARIANTS = {
    "a": dict(key=0, prog=["D", "A", "Bm", "G"], lead="pluck", bass="bounce", swing=0.0),
    "b": dict(key=0, prog=["G", "D", "A", "Bm"], lead="pluck", bass="bounce", swing=0.0),
    "c": dict(key=2, prog=["D", "Bm", "G", "A"], lead="marimba", bass="bounce", swing=0.0),
    "d": dict(key=-2, prog=["D", "G", "Bm", "A"], lead="whistle", bass="walk", swing=0.16),
    "e": dict(key=3, prog=["Bm", "G", "D", "A"], lead="chip", bass="offbeat", swing=0.0),
    "f": dict(key=-3, prog=["G", "A", "D", "Bm"], lead="marimba", bass="walk", swing=0.12),
}


def render_cheerful(seconds, bpm, variant):
    """Bright, upbeat major-key pop: ukulele strums, plucked melody, claps, shaker, bouncy bass."""
    v = CHEERFUL_VARIANTS[variant]
    tr = v["key"]
    beat = 60.0 / bpm
    bar = 4 * beat
    total = int(seconds * SR)
    mus = np.zeros(total)
    drums = np.zeros(total)
    chords = {"D": [62, 66, 69], "A": [61, 64, 69], "Bm": [59, 62, 66], "G": [59, 62, 67]}
    roots = {"D": 38, "A": 45, "Bm": 47, "G": 43}
    prog = v["prog"]
    # simple catchy 8th-note melody per chord (MIDI), None = rest
    mel = {"D": [74, None, 78, 76, 74, None, 71, 74], "A": [73, None, 76, 73, 69, None, 71, 73],
           "Bm": [71, None, 74, 78, 76, None, 74, 71], "G": [74, None, 71, 74, 79, 78, 76, 74]}

    def sw(x):  # swing: delay off-beat 8ths
        return x + (v["swing"] * beat if (x * 2) % 2 == 1 else 0)

    t, k = 0.0, 0
    strum = [0, 1, 1.5, 2.5, 3, 3.5]   # beat positions of ukulele strums (down-up pattern)
    while t < seconds:
        c = prog[k % 4]
        for pos in strum:
            vel = 0.22 if pos in (0, 2.5) else 0.15
            for i, n in enumerate(chords[c] + [chords[c][0] + 12]):
                add(mus, pluck(note_hz(n + tr), beat * 1.2, vel), t + sw(pos) * beat + i * 0.008)
        if k >= 1:  # melody enters on bar 2
            for j, n in enumerate(mel[c]):
                if n is None:
                    continue
                f, d, at = note_hz(n + tr), beat * 0.9, t + sw(j / 2) * beat
                if v["lead"] == "pluck":
                    add(mus, pluck(f, d, 0.28) + epiano(f, d, 0.08), at)
                elif v["lead"] == "marimba":
                    add(mus, marimba(f, d, 0.34), at)
                elif v["lead"] == "whistle":
                    add(mus, whistle(f * 2, beat * 0.45, 0.13), at)
                else:
                    add(mus, chip(f, beat * 0.4, 0.12), at)
        r = roots[c] + tr
        if v["bass"] == "bounce":
            pat = ((0, r), (1.5, r), (2, r + 7), (3, r + 12))
        elif v["bass"] == "walk":
            pat = ((0, r), (1, r + 4), (2, r + 7), (3, r + 9))
        else:  # offbeat (dance-pop)
            pat = ((0.5, r), (1.5, r), (2.5, r + 12), (3.5, r))
        for pos, n in pat:
            add(mus, bass(note_hz(n), beat * 0.6, 0.3), t + sw(pos) * beat)
        for b in range(4):
            bt = t + b * beat
            add(drums, kick() * 0.8, bt)
            if b in (1, 3):
                add(drums, clap(), bt)
            for s in range(4):
                add(drums, shaker() * (1.0 if s % 2 else 0.6), bt + sw(s / 4) * beat)
        t += bar
        k += 1
    mus = sosfilt(butter(2, 9000, "lowpass", fs=SR, output="sos"), mus)
    mix = mus * 0.85 + drums * 0.6
    fi, fo = int(0.3 * SR), int(1.2 * SR)
    mix[:fi] *= np.linspace(0, 1, fi)
    mix[-fo:] *= np.linspace(1, 0, fo)
    d = int(0.006 * SR)
    st = np.stack([mix, np.concatenate([np.zeros(d), mix[:-d]])], axis=1)
    st /= np.max(np.abs(st)) / 10 ** (-1 / 20)
    return (st * 32767).astype(np.int16)


def add(buf, sig, at):
    i = int(at * SR)
    j = min(len(buf), i + len(sig))
    if i < len(buf):
        buf[i:j] += sig[: j - i]


def render(seconds, bpm, mood):
    beat = 60.0 / bpm
    bar = 4 * beat
    total = int(seconds * SR)
    mus = np.zeros(total)
    drums = np.zeros(total)
    if mood == "bright":   # Fmaj7 - Em7 - Dm7 - Cmaj7(add9), bouncy 8th hats
        prog = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59, 62]]
        roots = [41, 40, 38, 36]
        swing, hat_div = 0.06, 2
    else:                  # Am9 - Fmaj7 - Cmaj7 - G6, slower, sparser
        prog = [[57, 60, 64, 67, 71], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 64]]
        roots = [45, 41, 36, 43]
        swing, hat_div = 0.08, 2
    t = 0.0
    k = 0
    while t < seconds:
        chord, root = prog[k % 4], roots[k % 4]
        # chord stabs: on 1 and the "and" of 2
        for off, vel in ((0, 0.22), (1.5 * beat, 0.16)):
            for i, n in enumerate(chord):
                add(mus, epiano(note_hz(n), bar - off, vel), t + off + i * 0.012)
        # bass: root on 1, fifth on 3
        add(mus, bass(note_hz(root), beat * 1.8, 0.32), t)
        add(mus, bass(note_hz(root + 7), beat * 1.2, 0.25), t + 2 * beat)
        # drums
        for b in range(4):
            bt = t + b * beat
            if b in (0, 2):
                add(drums, kick(), bt)
            if b in (1, 3):
                add(drums, snare(), bt)
            for h in range(hat_div):
                add(drums, hat() * (1 if h == 0 else 0.6), bt + h * beat / hat_div + (swing * beat if h else 0))
        if mood == "bright":
            add(drums, kick() * 0.6, t + 2.5 * beat)
        t += bar
        k += 1
    # warm low-pass on music, lighter on drums; vinyl crackle bed
    mus = sosfilt(butter(2, 3200, "lowpass", fs=SR, output="sos"), mus)
    drums = sosfilt(butter(1, 9000, "lowpass", fs=SR, output="sos"), drums)
    crackle = np.zeros(total)
    pops = rng.integers(0, total, int(seconds * 18))
    crackle[pops] = rng.uniform(-0.25, 0.25, len(pops))
    crackle = sosfilt(butter(2, [800, 5000], "bandpass", fs=SR, output="sos"), crackle) + 0.004 * rng.standard_normal(total)
    mix = mus * 0.9 + drums * (0.75 if mood == "bright" else 0.55) + crackle * 0.5
    # fades
    fi, fo = int(0.6 * SR), int(1.5 * SR)
    mix[:fi] *= np.linspace(0, 1, fi)
    mix[-fo:] *= np.linspace(1, 0, fo)
    # slight stereo width: delay right channel by 8 ms
    d = int(0.008 * SR)
    left = mix
    right = np.concatenate([np.zeros(d), mix[:-d]])
    st = np.stack([left, right], axis=1)
    st /= np.max(np.abs(st)) / 10 ** (-1 / 20)
    return (st * 32767).astype(np.int16)


if __name__ == "__main__":
    out, seconds, bpm, mood = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), sys.argv[4]
    # "cheerful-a" / "cheerful-b": bright upbeat major-key pop (chosen 2026-11-23 for Kira posts)
    data = render_cheerful(seconds, bpm, mood.split("-")[1]) if mood.startswith("cheerful") else render(seconds, bpm, mood)
    wavfile.write(out, SR, data)
    print("wrote", out, seconds, "s", bpm, "bpm", mood)
