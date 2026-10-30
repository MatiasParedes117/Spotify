/* =====================================================================
 * Reproductor — motor de audio (Web Audio API) y lógica de reproducción.
 *
 * Las canciones no son archivos de audio reales: el motor genera una
 * melodía sintetizada (determinística por canción) en tiempo real para
 * que los controles de play/pause/seek funcionen de verdad.
 * ================================================================== */

const Player = {
  queue: [],
  index: -1,
  song: null,
  context: { type: null, id: null, label: "" },
  playing: false,
  currentTime: 0,
  volume: typeof Store !== "undefined" ? Store.get("volume") ?? 0.7 : 0.7,
  muted: typeof Store !== "undefined" ? Boolean(Store.get("muted")) : false,
  liked: new Set(typeof Store !== "undefined" ? Store.get("liked") || [] : []),
  shuffle: false,
  repeat: false,
};

/* ----------------------------- helpers ----------------------------- */

function fmtTime(sec) {
  sec = Math.max(0, Math.floor(sec || 0));
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
}

function gradCss(key) {
  return GRADIENTS[key] || GRADIENTS.ep1;
}

function initials(name) {
  return (name || "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/* ------------------------- melodia sintetizada --------------------- */

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const NOTE_VALS = { C: 0, "C#": 1, D: 2, "D#": 3, E: 4, F: 5, "F#": 6, G: 7, "G#": 8, A: 9, "A#": 10, B: 11 };
const SCALES = [
  [0, 2, 4, 7, 9],
  [0, 3, 5, 7, 10],
  [0, 2, 3, 5, 7, 8, 10],
  [0, 2, 4, 5, 7, 9, 11],
];

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(h, 31) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function midiToName(midi) {
  return NOTE_NAMES[midi % 12] + Math.floor(midi / 12);
}

function nameToMidi(name) {
  const m = name.match(/^([A-G]#?)(\d)$/);
  if (!m) return 60;
  return NOTE_VALS[m[1]] + (parseInt(m[2], 10) + 1) * 12;
}

function nameToFreq(name) {
  return 440 * Math.pow(2, (nameToMidi(name) - 69) / 12);
}

function makeMelody(seed) {
  const rng = mulberry32(seed);
  const scale = SCALES[seed % SCALES.length];
  const root = 48 + Math.floor(seed % 6) * 2;
  const count = 28 + Math.floor(rng() * 12);
  const notes = [];
  for (let i = 0; i < count; i++) {
    const sem = scale[Math.floor(rng() * scale.length)];
    const r = rng();
    const oct = r < 0.25 ? 0 : r < 0.8 ? 1 : 2;
    notes.push(midiToName(root + sem + oct * 12));
  }
  return notes;
}

/* --------------------------- motor de audio ------------------------ */

const AudioEngine = {
  ctx: null,
  master: null,
  timer: null,
  origin: 0,
  nextNote: 0,
  melody: [],
  step: 0.28,
  melodyDur: 0,
};

function ensureAudio() {
  if (AudioEngine.ctx) {
    if (AudioEngine.ctx.state === "suspended") AudioEngine.ctx.resume();
    return AudioEngine.ctx;
  }
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    AudioEngine.ctx = new AC();
    AudioEngine.master = AudioEngine.ctx.createGain();
    AudioEngine.master.gain.value = Player.muted ? 0 : Player.volume;
    AudioEngine.master.connect(AudioEngine.ctx.destination);
  } catch (e) {
    AudioEngine.ctx = null;
  }
  return AudioEngine.ctx;
}

function scheduleNote(name, at, i, step) {
  const ctx = AudioEngine.ctx;
  const freq = nameToFreq(name);
  const dur = step * 0.9;

  const osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(0.16, at + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(g);
  g.connect(AudioEngine.master);
  osc.start(at);
  osc.stop(at + dur + 0.05);

  if (i % 4 === 0) {
    const bass = ctx.createOscillator();
    bass.type = "sine";
    bass.frequency.value = freq > 400 ? freq / 4 : freq / 2;
    const bg = ctx.createGain();
    bg.gain.setValueAtTime(0.0001, at);
    bg.gain.exponentialRampToValueAtTime(0.08, at + 0.03);
    bg.gain.exponentialRampToValueAtTime(0.0001, at + dur * 2);
    bass.connect(bg);
    bg.connect(AudioEngine.master);
    bass.start(at);
    bass.stop(at + dur * 2 + 0.05);
  }
}

function engineStep() {
  const ctx = AudioEngine.ctx;
  const melody = AudioEngine.melody;
  const step = AudioEngine.step;
  if (!melody.length) return;

  const musicalNow = ctx.currentTime - AudioEngine.origin;
  // Programa notas hacia adelante sobre la línea de tiempo absoluta.
  // El índice de la melodía se repite con módulo, así el loop continúa
  // aunque la canción lleve más tiempo que una vuelta de la melodía.
  const target = Math.floor((musicalNow + 0.6) / step);

  while (AudioEngine.nextNote <= target) {
    const i = AudioEngine.nextNote;
    const at = AudioEngine.origin + i * step;
    scheduleNote(melody[i % melody.length], at, i, step);
    AudioEngine.nextNote++;
  }
}

function startEngine(resumePos) {
  if (!ensureAudio()) return;
  // Si el reproductor se precargó sin arrancar el motor, la melodía aún
  // está vacía. Se configura antes de programar las notas para que el
  // primer play (y cualquier reanudación) suene.
  if (!AudioEngine.melody.length && Player.song) {
    engineReconfigure(Player.song);
  }
  AudioEngine.origin = AudioEngine.ctx.currentTime - resumePos;
  AudioEngine.nextNote = Math.max(0, Math.ceil(resumePos / AudioEngine.step));
  if (!AudioEngine.timer) {
    AudioEngine.timer = setInterval(engineStep, 100);
  }
  AudioEngine.ctx.resume();
}

function stopEngine() {
  if (AudioEngine.timer) {
    clearInterval(AudioEngine.timer);
    AudioEngine.timer = null;
  }
}

function engineReconfigure(song) {
  const seed = hashSeed(song.id + song.title);
  AudioEngine.melody = makeMelody(seed);
  AudioEngine.step = 60 / (86 + (seed % 60)) / 2;
  AudioEngine.melodyDur = AudioEngine.melody.length * AudioEngine.step;
}

/* ----------------------- logica de reproduccion --------------------- */

function playSong(songId, queue, context) {
  const song = DB.song(songId);
  if (!song) return;
  if (Player.song && Player.song.id === songId && Player.playing) return;

  Player.queue = queue || [songId];
  Player.index = Player.queue.indexOf(songId);
  if (Player.index < 0) Player.index = 0;
  Player.song = song;
  if (context) Player.context = context;
  Player.currentTime = 0;

  engineReconfigure(song);
  stopEngine();
  startEngine(0);
  Player.playing = true;

  if (typeof pushRecent === "function" && Player.context && Player.context.type) {
    pushRecent(Player.context.type, Player.context.id);
  }
  renderPlayerUI();
  emitPlayerChange();
}

function defaultContext() {
  const pl = DB.playlist("pl-exitos");
  return {
    type: "playlist",
    id: pl.id,
    label: pl.name,
    songIds: pl.songIds,
  };
}

function togglePlay() {
  if (!Player.song) {
    const ctx = defaultContext();
    playSong(ctx.songIds[0], ctx.songIds, ctx);
    return;
  }
  if (Player.playing) {
    Player.playing = false;
    stopEngine();
  } else {
    stopEngine();
    startEngine(Player.currentTime);
    Player.playing = true;
  }
  renderPlayerUI();
  emitPlayerChange();
}

function nextSong(manual) {
  if (!Player.queue.length) return;
  let ni = Player.index + 1;
  if (Player.shuffle && Player.queue.length > 1) {
    do {
      ni = Math.floor(Math.random() * Player.queue.length);
    } while (ni === Player.index);
  } else if (ni >= Player.queue.length) {
    if (!Player.repeat && !manual) {
      Player.playing = false;
      stopEngine();
      Player.currentTime = 0;
      renderPlayerUI();
      emitPlayerChange();
      return;
    }
    ni = 0;
  }
  loadTrack(ni);
}

function prevSong() {
  if (!Player.queue.length) return;
  if (Player.currentTime > 3) {
    seekTo(0);
    return;
  }
  let ni = Player.index - 1;
  if (ni < 0) ni = Player.queue.length - 1;
  loadTrack(ni);
}

function loadTrack(ni) {
  const song = DB.song(Player.queue[ni]);
  if (!song) return;
  Player.index = ni;
  Player.song = song;
  Player.currentTime = 0;
  engineReconfigure(song);
  stopEngine();
  startEngine(0);
  Player.playing = true;
  renderPlayerUI();
  emitPlayerChange();
}

function seekTo(sec) {
  const dur = Player.song ? Player.song.duration : 0;
  sec = Math.max(0, Math.min(sec, dur));
  Player.currentTime = sec;
  if (Player.playing) {
    stopEngine();
    startEngine(sec);
  }
  updateProgressUI();
  if (sec >= dur && Player.song) nextSong(false);
}

function tick() {
  if (!Player.playing || !Player.song) return;
  Player.currentTime += 0.25;
  if (Player.currentTime >= Player.song.duration) {
    nextSong(false);
    return;
  }
  updateProgressUI();
}

function setVolume(v) {
  Player.volume = Math.max(0, Math.min(1, v));
  if (Player.volume > 0) Player.muted = false;
  if (AudioEngine.master && AudioEngine.ctx) {
    AudioEngine.master.gain.setTargetAtTime(
      Player.muted ? 0 : Player.volume,
      AudioEngine.ctx.currentTime,
      0.02
    );
  }
  Store.set("volume", Player.volume);
  Store.set("muted", Player.muted);
  const slider = $("#player-volume");
  if (slider) {
    slider.value = Math.round(Player.volume * 100);
    slider.style.setProperty("--fill", Math.round(Player.volume * 100) + "%");
  }
  if (typeof updatePlayerIcons === "function") updatePlayerIcons();
  emitPlayerChange();
}

function toggleMute() {
  Player.muted = !Player.muted;
  if (AudioEngine.master && AudioEngine.ctx) {
    AudioEngine.master.gain.setTargetAtTime(
      Player.muted ? 0 : Player.volume,
      AudioEngine.ctx.currentTime,
      0.02
    );
  }
  Store.set("muted", Player.muted);
  const slider = $("#player-volume");
  if (slider) slider.style.setProperty("--fill", Math.round((Player.muted ? 0 : Player.volume) * 100) + "%");
  if (typeof updatePlayerIcons === "function") updatePlayerIcons();
  emitPlayerChange();
}

/* ----------------------- like / guardado ---------------------------- */

function isLiked(songId) {
  return Player.liked.has(songId);
}

function toggleLike(songId) {
  if (!songId) return;
  if (Player.liked.has(songId)) {
    Player.liked.delete(songId);
    toast("Se quitó de tus canciones que te gustan");
  } else {
    Player.liked.add(songId);
    toast("Se agregó a tus canciones que te gustan");
  }
  Store.set("liked", Array.from(Player.liked));
  renderLikeButtons();
  emitPlayerChange();
  if (parseHash().name === "liked" && typeof renderRoute === "function") {
    const y = $("#view") ? $("#view").scrollTop : 0;
    renderRoute();
    if ($("#view")) $("#view").scrollTop = y;
  }
}

function renderLikeButtons() {
  const id = Player.song ? Player.song.id : null;

  $$("[data-like-btn]").forEach((btn) => {
    const songId = btn.getAttribute("data-like-btn");
    if (!songId || songId !== id) {
      btn.innerHTML = `<span class="block text-[16px] text-faint">${icon("heart")}</span>`;
      return;
    }
    const liked = isLiked(id);
    btn.innerHTML = `<span class="block text-[16px] ${liked ? "text-[#1db954]" : "text-faint"}">${icon(
      "heart"
    )}</span>`;
    btn.setAttribute("aria-label", liked ? "Quitar me gusta" : "Me gusta");
  });

  $$("[data-heart-row]").forEach((btn) => {
    const songId = btn.getAttribute("data-heart-row");
    const liked = isLiked(songId);
    btn.innerHTML = `<span class="flex h-4 w-4 items-center justify-center text-[16px] ${
      liked ? "text-[#1db954]" : "text-faint"
    }">${icon("heart")}</span>`;
    btn.setAttribute("aria-label", liked ? "Quitar me gusta" : "Me gusta");
  });
}

/* --------------------- arranque de los controles -------------------- */

function initPlayerUI() {
  function wire(sel, fn) {
    const el = typeof sel === "string" ? document.querySelector(sel) : sel;
    if (el) el.addEventListener("click", fn);
  }

  wire("#player-play", togglePlay);
  wire("#player-prev", prevSong);
  wire("#player-next", () => nextSong(true));
  wire("#player-shuffle", () => {
    Player.shuffle = !Player.shuffle;
    updateProgressUI();
    emitPlayerChange();
  });
  wire("#player-repeat", () => {
    Player.repeat = !Player.repeat;
    updateProgressUI();
    emitPlayerChange();
  });
  wire("#now-shuffle", () => {
    Player.shuffle = !Player.shuffle;
    updateProgressUI();
    emitPlayerChange();
  });
  wire("#now-repeat", () => {
    Player.repeat = !Player.repeat;
    updateProgressUI();
    emitPlayerChange();
  });
  wire("#player-like", () => toggleLike(Player.song ? Player.song.id : null));
  wire("#now-like", () => toggleLike(Player.song ? Player.song.id : null));
  wire("#player-mute", toggleMute);

  const vol = document.querySelector("#player-volume");
  if (vol) {
    vol.addEventListener("input", (e) => setVolume(Number(e.target.value) / 100));
    vol.value = Math.round(Player.volume * 100);
    vol.style.setProperty("--fill", Math.round(Player.volume * 100) + "%");
  }

  ["#player-progress", "#now-progress"].forEach((sel) => {
    const sl = document.querySelector(sel);
    if (sl) {
      sl.addEventListener("input", (e) => {
        const dur = Player.song ? Player.song.duration : 0;
        seekTo((Number(e.target.value) / 100) * dur);
      });
    }
  });

  const mini = document.querySelector("#mini-player");
  if (mini) {
    mini.addEventListener("click", (e) => {
      if (e.target.closest("#mini-play-ic")) return;
      openNowPlaying();
    });
    mini.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openNowPlaying();
      }
    });
  }
  wire("#mini-play-ic", (e) => {
    e.stopPropagation();
    togglePlay();
  });

  wire("#now-close", closeNowPlaying);
  wire("#now-prev", prevSong);
  wire("#now-next", () => nextSong(true));
  wire("#now-play", togglePlay);
  wire("#now-more", () => {
    if (Player.song) showContextMenu(window.innerWidth - 280, 80, "track", Player.song.id);
    else toast("Reproduce una canción para ver opciones");
  });

  // Precarga la primera canción para que el reproductor no aparezca vacío.
  const ctx = defaultContext();
  Player.queue = ctx.songIds;
  Player.index = 0;
  Player.song = DB.song(ctx.songIds[0]);
  Player.context = { type: ctx.type, id: ctx.id, label: ctx.label };
  engineReconfigure(Player.song);

  renderPlayerUI();
  renderLikeButtons();
  updateProgressUI();
}