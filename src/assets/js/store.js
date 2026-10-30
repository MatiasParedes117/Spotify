/* =====================================================================
 * Persistencia local (localStorage) — estado del "usuario" del clon.
 *
 * Guarda me gusta, playlists creadas, plan contratado, búsquedas
 * recientes, perfil, volumen y preferencias. Todo es simulado: no hay
 * backend ni cuentas reales.
 * ================================================================== */

const Store = (() => {
  const KEY = "spotify-clone-state-v2";

  const DEFAULTS = {
    liked: [],
    playlists: [],
    savedAlbums: ["al-uvst", "al-ah", "al-fn"],
    savedArtists: ["a-badbunny", "a-taylorswift"],
    plan: "free",
    recentSearches: ["Bad Bunny", "Lo-Fi", "Taylor Swift"],
    recentItems: [
      { type: "album", id: "al-uvst" },
      { type: "playlist", id: "pl-exitos" },
      { type: "artist", id: "a-weeknd" },
      { type: "album", id: "al-fn" },
      { type: "playlist", id: "pl-mia" },
      { type: "playlist", id: "pl-toca" },
    ],
    volume: 0.7,
    muted: false,
    profile: {
      name: "Matyaz Paredes",
      email: "matyaz.paredes@correo.cl",
      grad: "ep8",
    },
    settings: {
      quality: "Muy alta",
      notifications: true,
      privateSession: false,
      crossfade: 0,
    },
    notificationsRead: false,
    premiumBilling: "monthly",
  };

  let data = { ...DEFAULTS };

  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      data = {
        ...DEFAULTS,
        ...saved,
        profile: { ...DEFAULTS.profile, ...(saved.profile || {}) },
        settings: { ...DEFAULTS.settings, ...(saved.settings || {}) },
      };
    }
  } catch (err) {
    console.warn("No se pudo leer el estado local; se usan valores por defecto.", err);
  }

  function persist() {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch (err) {
      // Modo privado / almacenamiento lleno: la app sigue funcionando en memoria.
    }
  }

  return {
    data,
    get(key) {
      return data[key];
    },
    set(key, value) {
      data[key] = value;
      persist();
    },
    save() {
      persist();
    },
    reset() {
      data = {
        ...DEFAULTS,
        profile: { ...DEFAULTS.profile },
        settings: { ...DEFAULTS.settings },
      };
      persist();
    },
  };
})();
