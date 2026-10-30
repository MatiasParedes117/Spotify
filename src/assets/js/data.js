/* =====================================================================
 * Datos simulados (mock) para el clon de Spotify.
 * Proyecto académico — no se usa ningún backend real.
 * ================================================================== */

const GRADIENTS = {
  ep1: "linear-gradient(135deg, #450af5 0%, #c4efd9 100%)",
  ep2: "linear-gradient(135deg, #2781fc 0%, #6f00ff 100%)",
  ep3: "linear-gradient(135deg, #00b09b 0%, #96c93d 100%)",
  ep4: "linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)",
  ep5: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
  ep6: "linear-gradient(135deg, #7f00ff 0%, #e100ff 100%)",
  ep7: "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)",
  ep8: "linear-gradient(135deg, #ff512f 0%, #dd2476 100%)",
  ep9: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
  ep10: "linear-gradient(135deg, #fc00ff 0%, #00dbde 100%)",
  ep11: "linear-gradient(135deg, #c31432 0%, #240b36 100%)",
  ep12: "linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)",
  ep13: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
  ep14: "linear-gradient(135deg, #f953c6 0%, #b91d73 100%)",
  ep15: "linear-gradient(135deg, #5a3f37 0%, #2c7744 100%)",
  ep16: "linear-gradient(135deg, #0f0c29 0%, #302b63 100%)",
  ep17: "linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)",
  ep18: "linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%)",
  ep19: "linear-gradient(135deg, #f12711 0%, #f5af19 100%)",
  ep20: "linear-gradient(135deg, #43cea2 0%, #185a9d 100%)",
  ep21: "linear-gradient(135deg, #a8ff78 0%, #78ffd6 100%)",
  ep22: "linear-gradient(135deg, #ff0084 0%, #33001b 100%)",
  ep23: "linear-gradient(135deg, #4776e6 0%, #8e54e9 100%)",
  ep24: "linear-gradient(135deg, #141e30 0%, #243b55 100%)",
  ep25: "linear-gradient(135deg, #ffb347 0%, #ffcc33 100%)",
  spotify: "radial-gradient(circle at top, #1ed760 0%, #121212 70%)",
};

/* ---------------------------------------------------------------------
 * Imágenes locales del catálogo.
 * Artistas: fotografías de Wikimedia Commons (licencias libres).
 * Álbumes: portadas obtenidas de la API pública de Deezer.
 * Playlists y géneros: fotografías de Unsplash.
 * Los detalles de licencia están en el README.
 * ------------------------------------------------------------------ */
const COVER_IMAGES = {
  // Artistas
  "a-badbunny": "assets/img/artists/bad-bunny.jpg",
  "a-karolg": "assets/img/artists/karol-g.jpg",
  "a-feid": "assets/img/artists/feid.jpg",
  "a-taylorswift": "assets/img/artists/taylor-swift.jpg",
  "a-weeknd": "assets/img/artists/the-weeknd.jpg",
  "a-dualipa": "assets/img/artists/dua-lipa.jpg",
  "a-monlaferte": "assets/img/artists/mon-laferte.jpg",
  "a-bunkers": "assets/img/artists/los-bunkers.jpg",
  "a-rosalia": "assets/img/artists/rosalia.jpg",
  "a-kendrick": "assets/img/artists/kendrick-lamar.jpg",
  "a-sza": "assets/img/artists/sza.jpg",
  "a-coldplay": "assets/img/artists/coldplay.jpg",

  // Álbumes
  "al-uvst": "assets/img/albums/un-verano-sin-ti.jpg",
  "al-yhlq": "assets/img/albums/yhlqmdlg.jpg",
  "al-msb": "assets/img/albums/manana-sera-bonito.jpg",
  "al-fcf": "assets/img/albums/feliz-cumpleanos-ferxxo.jpg",
  "al-1989": "assets/img/albums/1989.jpg",
  "al-folklore": "assets/img/albums/folklore.jpg",
  "al-ah": "assets/img/albums/after-hours.jpg",
  "al-fn": "assets/img/albums/future-nostalgia.jpg",
  "al-norma": "assets/img/albums/norma.jpg",
  "al-lvlz": "assets/img/albums/la-velocidad-de-la-luz.jpg",
  "al-motomami": "assets/img/albums/motomami.jpg",
  "al-damn": "assets/img/albums/damn.jpg",
  "al-sos": "assets/img/albums/sos.jpg",
  "al-parachutes": "assets/img/albums/parachutes.jpg",

  // Playlists del catálogo
  "pl-topglobal": "assets/img/playlists/top-global.jpg",
  "pl-exitos": "assets/img/playlists/exitos-de-hoy.jpg",
  "pl-daily1": "assets/img/playlists/daily-mix-1.jpg",
  "pl-daily2": "assets/img/playlists/daily-mix-2.jpg",
  "pl-lofi": "assets/img/playlists/chill-lofi.jpg",
  "pl-fitness": "assets/img/playlists/gimnasio.jpg",
  "pl-rockcl": "assets/img/playlists/rock-nacional.jpg",
  "pl-ferxxo": "assets/img/playlists/bichota-party.jpg",
  "pl-latinx": "assets/img/playlists/latino-caliente.jpg",
  "pl-sad": "assets/img/playlists/tristeza-premium.jpg",
  "pl-rap": "assets/img/playlists/rap-rnb.jpg",
  "pl-indie": "assets/img/playlists/indie-acustico.jpg",

  // Playlists del usuario
  "pl-mia": "assets/img/playlists/mi-playlist-favorita.jpg",
  "pl-tarea": "assets/img/playlists/foco-programar.jpg",
  "pl-toca": "assets/img/playlists/cantar-ducha.jpg",

  // Géneros
  "g-pop": "assets/img/genres/pop.jpg",
  "g-reggaeton": "assets/img/genres/reggaeton.jpg",
  "g-rock": "assets/img/genres/rock.jpg",
  "g-lofi": "assets/img/genres/lofi.jpg",
  "g-fiesta": "assets/img/genres/fiesta.jpg",
  "g-chill": "assets/img/genres/chill.jpg",
  "g-workout": "assets/img/genres/entrenamiento.jpg",
  "g-hiphop": "assets/img/genres/hip-hop.jpg",
  "g-rnb": "assets/img/genres/rnb.jpg",
  "g-romanticas": "assets/img/genres/romanticas.jpg",
  "g-chile": "assets/img/genres/musica-chilena.jpg",
  "g-electronica": "assets/img/genres/electronica.jpg",
};

function coverImage(item) {
  if (!item) return "";
  return item.img || COVER_IMAGES[item.id] || "";
}

const DB = {
  /* --------------------------- ARTISTAS --------------------------- */
  artists: [
    {
      id: "a-badbunny",
      name: "Bad Bunny",
      grad: "ep8",
      monthly: "72.154.320",
      followers: "85.5M",
      genre: "Reggaetón / Trap",
      about:
        "Benito Antonio Martínez Ocasio, más conocido como Bad Bunny, es un cantante y compositor puertorriqueño de reggaetón y trap latino.",
    },
    {
      id: "a-karolg",
      name: "Karol G",
      grad: "ep10",
      monthly: "68.920.140",
      followers: "70.1M",
      genre: "Reggaetón",
      about:
        "Carolina Giraldo Navarro, reconocida artísticamente como Karol G, es una cantante colombiana, máxima exponente del reggaetón femenino.",
    },
    {
      id: "a-feid",
      name: "Feid",
      grad: "ep9",
      monthly: "51.430.222",
      followers: "48.7M",
      genre: "Reggaetón / Pop latino",
      about:
        "Salomón Villada Hoyos, conocido como Feid o Ferxxo, es un cantante y productor colombiano de reggaetón.",
    },
    {
      id: "a-taylorswift",
      name: "Taylor Swift",
      grad: "ep1",
      monthly: "83.201.980",
      followers: "95.9M",
      genre: "Pop",
      about:
        "Taylor Alison Swift es una cantautora estadounidense, una de las artistas más influyentes de la música pop actual.",
    },
    {
      id: "a-weeknd",
      name: "The Weeknd",
      grad: "ep13",
      monthly: "89.120.540",
      followers: "112.4M",
      genre: "R&B / Synthwave",
      about:
        "Abel Tesfaye, conocido como The Weeknd, es un cantante y productor canadiense de R&B alternativo.",
    },
    {
      id: "a-dualipa",
      name: "Dua Lipa",
      grad: "ep14",
      monthly: "64.700.120",
      followers: "88.3M",
      genre: "Pop / Dance",
      about:
        "Dua Lipa es una cantante y compositora británica, símbolo del pop y la música disco actual.",
    },
    {
      id: "a-monlaferte",
      name: "Mon Laferte",
      grad: "ep6",
      monthly: "9.240.880",
      followers: "4.8M",
      genre: "Pop / Balada",
      about:
        "Norma Monserrat Bustamante Laferte, conocida como Mon Laferte, es una cantautora chileno-mexicana.",
    },
    {
      id: "a-bunkers",
      name: "Los Bunkers",
      grad: "ep11",
      monthly: "6.410.220",
      followers: "3.2M",
      genre: "Rock chileno",
      about:
        "Los Bunkers es una banda chilena de rock, ícono de la música nacional desde comienzos de los 2000.",
    },
    {
      id: "a-rosalia",
      name: "Rosalía",
      grad: "ep19",
      monthly: "38.502.910",
      followers: "31.7M",
      genre: "Pop / Flamenco",
      about:
        "Rosalía Vila Tobella es una cantante y productora española que mezcla flamenco, pop y música urbana.",
    },
    {
      id: "a-kendrick",
      name: "Kendrick Lamar",
      grad: "ep24",
      monthly: "44.871.650",
      followers: "38.2M",
      genre: "Hip-Hop",
      about:
        "Kendrick Lamar Duckworth es un rapero estadounidense, ganador del Premio Pulitzer y referente del hip-hop contemporáneo.",
    },
    {
      id: "a-sza",
      name: "SZA",
      grad: "ep20",
      monthly: "61.204.770",
      followers: "40.5M",
      genre: "R&B / Neo Soul",
      about:
        "Solána Imani Rowe, conocida como SZA, es una cantante y compositora estadounidense de R&B alternativo.",
    },
    {
      id: "a-coldplay",
      name: "Coldplay",
      grad: "ep23",
      monthly: "74.338.410",
      followers: "96.1M",
      genre: "Rock alternativo",
      about:
        "Coldplay es una banda británica formada en Londres en 1996, una de las agrupaciones de rock pop más populares del mundo.",
    },
  ],

  /* ---------------------------- ÁLBUMES ---------------------------- */
  albums: [
    {
      id: "al-uvst",
      title: "Un Verano Sin Ti",
      artistId: "a-badbunny",
      year: 2022,
      grad: "ep3",
      songs: [
        ["s1", "Tití Me Preguntó", 208],
        ["s2", "El Apagón", 202],
        ["s3", "Ojitos Lindos", 190],
        ["s4", "Neverita", 160],
      ],
    },
    {
      id: "al-yhlq",
      title: "YHLQMDLG",
      artistId: "a-badbunny",
      year: 2020,
      grad: "ep7",
      songs: [
        ["s5", "Yo Perreo Sola", 163],
        ["s6", "La Difícil", 179],
        ["s7", "Safaera", 307],
        ["s8", "Bichiyal", 222],
      ],
    },
    {
      id: "al-msb",
      title: "Mañana Será Bonito",
      artistId: "a-karolg",
      year: 2023,
      grad: "ep10",
      songs: [
        ["s9", "Mientras Me Curo del Cora", 221],
        ["s10", "Provenza", 216],
        ["s11", "TQG", 213],
        ["s12", "Amargura", 158],
      ],
    },
    {
      id: "al-fcf",
      title: "Feliz Cumpleaños Ferxxo",
      artistId: "a-feid",
      year: 2022,
      grad: "ep9",
      songs: [
        ["s13", "Normal", 172],
        ["s14", "Prohibidox", 161],
        ["s15", "Ferxxo 100", 145],
        ["s16", "Si Te La Encuentras Por Ahí", 238],
      ],
    },
    {
      id: "al-1989",
      title: "1989",
      artistId: "a-taylorswift",
      year: 2014,
      grad: "ep4",
      songs: [
        ["s17", "Welcome to New York", 212],
        ["s18", "Blank Space", 234],
        ["s19", "Style", 231],
        ["s20", "Shake It Off", 219],
      ],
    },
    {
      id: "al-folklore",
      title: "Folklore",
      artistId: "a-taylorswift",
      year: 2020,
      grad: "ep5",
      songs: [
        ["s21", "Cardigan", 239],
        ["s22", "Exile (feat. Bon Iver)", 246],
        ["s23", "August", 261],
        ["s24", "The 1", 202],
      ],
    },
    {
      id: "al-ah",
      title: "After Hours",
      artistId: "a-weeknd",
      year: 2020,
      grad: "ep13",
      songs: [
        ["s25", "Blinding Lights", 200],
        ["s26", "Heartless", 199],
        ["s27", "In Your Eyes", 205],
        ["s28", "Save Your Tears", 207],
      ],
    },
    {
      id: "al-fn",
      title: "Future Nostalgia",
      artistId: "a-dualipa",
      year: 2020,
      grad: "ep14",
      songs: [
        ["s29", "Don't Start Now", 183],
        ["s30", "Levitating (feat. DaBaby)", 203],
        ["s31", "Physical", 193],
        ["s32", "Break My Heart", 215],
      ],
    },
    {
      id: "al-norma",
      title: "Norma",
      artistId: "a-monlaferte",
      year: 2018,
      grad: "ep6",
      songs: [
        ["s33", "El Beso", 231],
        ["s34", "Ropa De Cama", 255],
        ["s35", "Por Qué Me Fui a Enamorar de Ti", 218],
      ],
    },
    {
      id: "al-lvlz",
      title: "La Velocidad de la Luz",
      artistId: "a-bunkers",
      year: 2013,
      grad: "ep11",
      songs: [
        ["s36", "Quién Fuera", 218],
        ["s37", "Bajo Los Árboles", 190],
        ["s38", "Los Peces Gordos No Pueden Volar", 205],
      ],
    },
    {
      id: "al-motomami",
      title: "Motomami",
      artistId: "a-rosalia",
      year: 2022,
      grad: "ep19",
      songs: [
        ["s39", "Saoko", 137],
        ["s40", "Chicken Teriyaki", 148],
        ["s41", "Despechá", 150],
        ["s42", "La Fama (feat. The Weeknd)", 188],
      ],
    },
    {
      id: "al-damn",
      title: "DAMN.",
      artistId: "a-kendrick",
      year: 2017,
      grad: "ep22",
      songs: [
        ["s43", "HUMBLE.", 177],
        ["s44", "DNA.", 185],
        ["s45", "LOYALTY. (feat. Rihanna)", 227],
        ["s46", "LOVE. (feat. Zacari)", 213],
      ],
    },
    {
      id: "al-sos",
      title: "SOS",
      artistId: "a-sza",
      year: 2022,
      grad: "ep20",
      songs: [
        ["s47", "Kill Bill", 153],
        ["s48", "Snooze", 201],
        ["s49", "Nobody Gets Me", 181],
        ["s50", "Shirt", 182],
      ],
    },
    {
      id: "al-parachutes",
      title: "Parachutes",
      artistId: "a-coldplay",
      year: 2000,
      grad: "ep25",
      songs: [
        ["s51", "Yellow", 269],
        ["s52", "Trouble", 273],
        ["s53", "Don't Panic", 137],
        ["s54", "Shiver", 300],
      ],
    },
  ],

  /* --------------------------- PLAYLISTS --------------------------- */
  playlists: [
    {
      id: "pl-topglobal",
      name: "Top Global 50",
      desc: "Los 50 temas más escuchados en el mundo, actualizados cada día.",
      owner: "Spotify",
      grad: "ep16",
      emoji: "🌎",
      songIds: ["s1", "s25", "s9", "s13", "s5", "s29", "s27", "s18", "s43", "s47"],
    },
    {
      id: "pl-exitos",
      name: "Éxitos de Hoy",
      desc: "Lo que más se escucha hoy mismo. Éxitos actuales y nuevos lanzamientos.",
      owner: "Spotify",
      grad: "ep8",
      emoji: "🔥",
      songIds: ["s10", "s1", "s13", "s25", "s17", "s9", "s30", "s39", "s47"],
    },
    {
      id: "pl-daily1",
      name: "Daily Mix 1",
      desc: "Bad Bunny, Feid y más para el día de hoy.",
      owner: "Spotify",
      grad: "ep7",
      emoji: "🎧",
      songIds: ["s2", "s8", "s15", "s6", "s14", "s3"],
    },
    {
      id: "pl-daily2",
      name: "Daily Mix 2",
      desc: "Taylor Swift, Dua Lipa y más.",
      owner: "Spotify",
      grad: "ep1",
      emoji: "💜",
      songIds: ["s17", "s18", "s21", "s29", "s20", "s22"],
    },
    {
      id: "pl-lofi",
      name: "Chill & Lo-Fi",
      desc: "Foco, estudio y calma. La banda sonora para concentrarte.",
      owner: "Spotify",
      grad: "ep13",
      emoji: "🌙",
      songIds: ["s23", "s33", "s34", "s21", "s36", "s53"],
    },
    {
      id: "pl-fitness",
      name: "Gimnasio 💪",
      desc: "Energía para entrenar de inicio a fin.",
      owner: "Usuario 4212",
      grad: "ep9",
      emoji: "⚡",
      songIds: ["s8", "s29", "s31", "s25", "s16", "s12", "s40"],
    },
    {
      id: "pl-rockcl",
      name: "Rock Nacional (CL)",
      desc: "Los gigantes del rock chileno. Clásicos que no envejecen.",
      owner: "Spotify",
      grad: "ep11",
      emoji: "🎸",
      songIds: ["s36", "s37", "s38", "s33", "s53"],
    },
    {
      id: "pl-ferxxo",
      name: "Bichota Party",
      desc: "Perreo para la noche del sábado.",
      owner: "Usuario.com",
      grad: "ep10",
      emoji: "🪩",
      songIds: ["s1", "s5", "s9", "s13", "s25", "s6", "s41"],
    },
    {
      id: "pl-latinx",
      name: "Latino Caliente",
      desc: "Reggaetón, trap y pop latino sin parar.",
      owner: "Spotify",
      grad: "ep17",
      emoji: "🌴",
      songIds: ["s1", "s9", "s13", "s39", "s41", "s10", "s14"],
    },
    {
      id: "pl-sad",
      name: "Tristeza Premium",
      desc: "Para esos días en que solo quieres una buena balada.",
      owner: "Spotify",
      grad: "ep18",
      emoji: "🫀",
      songIds: ["s33", "s35", "s22", "s24", "s52", "s49"],
    },
    {
      id: "pl-rap",
      name: "Rap & R&B",
      desc: "Barras, flow y voces que se sienten.",
      owner: "Spotify",
      grad: "ep22",
      emoji: "🎤",
      songIds: ["s43", "s44", "s45", "s46", "s47", "s48", "s50"],
    },
    {
      id: "pl-indie",
      name: "Indie Acústico",
      desc: "Guitarras suaves, historias y tardes tranquilas.",
      owner: "Spotify",
      grad: "ep25",
      emoji: "🍂",
      songIds: ["s21", "s23", "s51", "s53", "s54", "s37"],
    },
  ],

  /* ---------------------------- GÉNEROS ---------------------------- */
  genres: [
    {
      id: "g-pop",
      name: "Pop",
      grad: "ep4",
      emoji: "🎤",
      desc: "Las canciones que todos cantan.",
      playlistIds: ["pl-exitos", "pl-daily2", "pl-latinx"],
      artistIds: ["a-taylorswift", "a-dualipa", "a-rosalia"],
    },
    {
      id: "g-reggaeton",
      name: "Reggaetón",
      grad: "ep17",
      emoji: "🔥",
      desc: "Perreo, flow y calor latino.",
      playlistIds: ["pl-topglobal", "pl-ferxxo", "pl-daily1", "pl-latinx"],
      artistIds: ["a-badbunny", "a-karolg", "a-feid"],
    },
    {
      id: "g-rock",
      name: "Rock",
      grad: "ep11",
      emoji: "🎸",
      desc: "Riffs, guitarras y clásicos.",
      playlistIds: ["pl-rockcl", "pl-indie"],
      artistIds: ["a-bunkers", "a-coldplay"],
    },
    {
      id: "g-lofi",
      name: "Lo-Fi",
      grad: "ep13",
      emoji: "🌙",
      desc: "Calma para estudiar y programar.",
      playlistIds: ["pl-lofi", "pl-indie"],
      artistIds: ["a-taylorswift", "a-monlaferte"],
    },
    {
      id: "g-fiesta",
      name: "Fiesta",
      grad: "ep10",
      emoji: "🪩",
      desc: "Éxitos para bailar hasta el amanecer.",
      playlistIds: ["pl-ferxxo", "pl-fitness", "pl-exitos"],
      artistIds: ["a-karolg", "a-badbunny", "a-feid"],
    },
    {
      id: "g-chill",
      name: "Chill",
      grad: "ep20",
      emoji: "🍃",
      desc: "Baja revoluciones y respira.",
      playlistIds: ["pl-lofi", "pl-sad", "pl-indie"],
      artistIds: ["a-sza", "a-coldplay", "a-monlaferte"],
    },
    {
      id: "g-workout",
      name: "Entrenamiento",
      grad: "ep9",
      emoji: "💪",
      desc: "Energía para sudar la camiseta.",
      playlistIds: ["pl-fitness", "pl-topglobal"],
      artistIds: ["a-badbunny", "a-karolg", "a-kendrick"],
    },
    {
      id: "g-hiphop",
      name: "Hip-Hop",
      grad: "ep24",
      emoji: "🎧",
      desc: "Barras que se sienten.",
      playlistIds: ["pl-rap", "pl-topglobal"],
      artistIds: ["a-kendrick", "a-sza"],
    },
    {
      id: "g-rnb",
      name: "R&B",
      grad: "ep14",
      emoji: "💜",
      desc: "Voces suaves, ritmo nocturno.",
      playlistIds: ["pl-rap", "pl-chill"],
      artistIds: ["a-sza", "a-weeknd"],
    },
    {
      id: "g-romanticas",
      name: "Románticas",
      grad: "ep18",
      emoji: "🌹",
      desc: "Para dedicar y sentir.",
      playlistIds: ["pl-sad", "pl-indie"],
      artistIds: ["a-monlaferte", "a-coldplay"],
    },
    {
      id: "g-chile",
      name: "Música chilena",
      grad: "ep15",
      emoji: "🇨🇱",
      desc: "Talento nacional de norte a sur.",
      playlistIds: ["pl-rockcl", "pl-sad"],
      artistIds: ["a-bunkers", "a-monlaferte"],
    },
    {
      id: "g-electronica",
      name: "Electrónica",
      grad: "ep23",
      emoji: "⚡",
      desc: "Sintetizadores y pistas infinitas.",
      playlistIds: ["pl-daily2", "pl-fitness"],
      artistIds: ["a-dualipa", "a-weeknd"],
    },
  ],

  /* ----------------------- PLANES PREMIUM -------------------------- */
  plans: [
    {
      id: "individual",
      name: "Premium Individual",
      short: "Individual",
      price: 2990,
      tagline: "Cuenta individual",
      desc: "Un plan para una sola persona. Escucha sin anuncios donde quieras.",
      badge: "Más popular",
      highlight: true,
      grad: "ep1",
      emoji: "🎧",
      features: [
        "Escucha sin anuncios",
        "Descarga música y podcasts",
        "Calidad de audio Muy alta (320 kbps)",
        "Salta canciones sin límites",
        "Reproduce sin conexión",
      ],
    },
    {
      id: "duo",
      name: "Premium Duo",
      short: "Duo",
      price: 3990,
      tagline: "2 cuentas premium",
      desc: "Dos cuentas Premium independientes para vivir la música en pareja.",
      badge: "Para dos",
      highlight: false,
      grad: "ep17",
      emoji: "💞",
      features: [
        "2 cuentas Premium independientes",
        "Todo lo de Premium Individual",
        "Playlist Duo en conjunto",
        "Administra desde una sola cuenta",
        "Cancela cuando quieras",
      ],
    },
    {
      id: "familiar",
      name: "Premium Familiar",
      short: "Familiar",
      price: 4990,
      tagline: "Hasta 6 cuentas",
      desc: "Música para toda la familia, cada uno con su propia cuenta.",
      badge: "Mejor valor",
      highlight: false,
      grad: "ep9",
      emoji: "🏠",
      features: [
        "Hasta 6 cuentas Premium",
        "Control parental con Spotify Kids",
        "Todo lo de Premium Individual",
        "Playlist Familiar compartida",
        "Bloqueo de contenido explícito",
      ],
    },
    {
      id: "estudiante",
      name: "Premium Estudiantes",
      short: "Estudiantes",
      price: 1490,
      tagline: "Descuento académico",
      desc: "Verifica tu condición de estudiante y accede a todo por menos.",
      badge: "Ahorra 50%",
      highlight: false,
      grad: "ep23",
      emoji: "🎓",
      features: [
        "Todo lo de Premium Individual",
        "Precio especial para estudiantes",
        "Cancelas cuando quieras",
        "Revalidación anual",
        "Ideal para el taller de programación",
      ],
    },
  ],

  planCompare: [
    ["Escucha sin anuncios", "—", "✓"],
    ["Descarga música y podcasts", "—", "✓"],
    ["Salta canciones sin límites", "—", "✓"],
    ["Reproduce sin conexión", "—", "✓"],
    ["Calidad de audio Muy alta", "—", "✓"],
    ["Control de reproducción", "✓", "✓"],
    ["Música con anuncios", "✓", "—"],
  ],

  faqs: [
    {
      q: "¿Qué incluye Premium?",
      a: "Escucha sin anuncios, descarga música y podcasts, salta canciones sin límites y reproduce sin conexión. En este clon académico todo está simulado, pero la experiencia de elegir y activar un plan es funcional.",
    },
    {
      q: "¿Cuánto cuesta Premium?",
      a: "Los precios mostrados son de referencia en pesos chilenos: Individual $2.990, Duo $3.990, Familiar $4.990 y Estudiantes $1.490 al mes. No se realiza ningún cobro real.",
    },
    {
      q: "¿Puedo cancelar cuando quiera?",
      a: "Sí. Desde la sección Cuenta puedes volver al plan Free con un clic. No hay contratos ni cargos porque es una demo académica.",
    },
    {
      q: "¿Premium funciona en este proyecto?",
      a: "El pago no existe. Al confirmar un plan, la app guarda tu elección en localStorage, actualiza tu perfil y muestra el estado Premium en el reproductor.",
    },
    {
      q: "¿Puedo compartir mi cuenta?",
      a: "El plan Familiar simula hasta 6 cuentas y el plan Duo 2 cuentas. Son datos ficticios para representar la interfaz real de Spotify.",
    },
  ],

  /* ------------------------ NOTIFICACIONES ------------------------- */
  notifications: [
    {
      icon: "premium",
      title: "Tu prueba Premium te espera",
      body: "Escucha sin anuncios y descarga tu música favorita.",
      link: "premium",
      time: "Ahora",
    },
    {
      icon: "music",
      title: "Nuevo lanzamiento de Rosalía",
      body: "Motomami ya está disponible en tu biblioteca.",
      link: "album/al-motomami",
      time: "Hace 1 h",
    },
    {
      icon: "queue",
      title: "Tu Daily Mix 1 se actualizó",
      body: "Incluye nuevos temas de Bad Bunny y Feid.",
      link: "playlist/pl-daily1",
      time: "Hace 3 h",
    },
  ],

  /* --------------------------- DISPOSITIVOS ------------------------ */
  devices: [
    { id: "web", name: "Este navegador", type: "Web Player", icon: "devices", active: true },
    { id: "phone", name: "Teléfono de Matyaz", type: "Android", icon: "devices", active: false },
    { id: "tv", name: "TV del living", type: "Smart TV", icon: "devices", active: false },
    { id: "speaker", name: "Parlante Bluetooth", type: "Altavoz", icon: "volume", active: false },
  ],

  /* ---------------------- Canciones (assembled) --------------------- */
  buildSongs() {
    const songs = [];
    for (const alb of DB.albums) {
      for (const [id, title, dur] of alb.songs) {
        songs.push({
          id,
          title,
          albumId: alb.id,
          artistId: alb.artistId,
          duration: dur,
        });
      }
    }
    DB.songs = songs;
  },

  song(id) {
    return DB.songs.find((s) => s.id === id);
  },
  album(id) {
    return DB.albums.find((a) => a.id === id);
  },
  artist(id) {
    return DB.artists.find((a) => a.id === id);
  },
  playlist(id) {
    return (
      DB.playlists.find((p) => p.id === id) ||
      DB.userPlaylists.find((p) => p.id === id) ||
      null
    );
  },
  genre(id) {
    return DB.genres.find((g) => g.id === id);
  },
  plan(id) {
    return DB.plans.find((p) => p.id === id) || null;
  },
  allPlaylists() {
    return [...DB.playlists, ...DB.userPlaylists];
  },
  isCustomPlaylist(id) {
    return DB.userPlaylists.some((p) => p.id === id);
  },
};

DB.buildSongs();

/* ------------- Playlists del usuario (persistidas en Store) ---------- */

const DEFAULT_USER_PLAYLISTS = [
  {
    id: "pl-mia",
    name: "Mi playlist favorita",
    desc: "Mis temas favoritos del momento.",
    owner: "Matyaz Paredes",
    grad: "ep5",
    emoji: "💜",
    songIds: ["s25", "s1", "s9", "s17", "s13", "s33", "s29"],
  },
  {
    id: "pl-tarea",
    name: "Foco para programar",
    desc: "Lo-Fi para estudiar y programar sin distracciones.",
    owner: "Matyaz Paredes",
    grad: "ep2",
    emoji: "🧠",
    songIds: ["s23", "s21", "s36", "s34", "s33", "s53"],
  },
  {
    id: "pl-toca",
    name: "Para cantar en la ducha",
    desc: "Éxitos que suenan mejor con el agua corriendo.",
    owner: "Matyaz Paredes",
    grad: "ep25",
    emoji: "🚿",
    songIds: ["s18", "s29", "s30", "s10", "s41", "s51"],
  },
];

const STORED_PLAYLISTS = Store.get("playlists") || [];

DB.userPlaylists = [
  ...DEFAULT_USER_PLAYLISTS.map((def) => {
    const saved = STORED_PLAYLISTS.find((p) => p && p.id === def.id);
    return saved
      ? { ...def, ...saved, songIds: [...(saved.songIds || def.songIds)] }
      : { ...def, songIds: [...def.songIds] };
  }),
  ...STORED_PLAYLISTS.filter(
    (p) => p && p.id && !DEFAULT_USER_PLAYLISTS.some((d) => d.id === p.id)
  ).map((p) => ({ ...p, songIds: [...(p.songIds || [])] })),
];

/* ---------- Secciones del Home (para render propuesto) ------------ */
DB.homeSections = [
  {
    title: "Artistas populares",
    items: [
      { type: "artist", id: "a-badbunny" },
      { type: "artist", id: "a-karolg" },
      { type: "artist", id: "a-feid" },
      { type: "artist", id: "a-taylorswift" },
      { type: "artist", id: "a-weeknd" },
      { type: "artist", id: "a-dualipa" },
      { type: "artist", id: "a-rosalia" },
    ],
  },
  {
    title: "Álbumes y sencillos populares",
    items: [
      { type: "album", id: "al-ah" },
      { type: "album", id: "al-folklore" },
      { type: "album", id: "al-fn" },
      { type: "album", id: "al-1989" },
      { type: "album", id: "al-lvlz" },
      { type: "album", id: "al-motomami" },
      { type: "album", id: "al-damn" },
    ],
  },
  {
    title: "Playlists recomendadas",
    items: [
      { type: "playlist", id: "pl-topglobal" },
      { type: "playlist", id: "pl-exitos" },
      { type: "playlist", id: "pl-ferxxo" },
      { type: "playlist", id: "pl-fitness" },
      { type: "playlist", id: "pl-latinx" },
      { type: "playlist", id: "pl-rap" },
      { type: "playlist", id: "pl-sad" },
    ],
  },
  {
    title: "Hecho para ti",
    items: [
      { type: "playlist", id: "pl-daily1" },
      { type: "playlist", id: "pl-daily2" },
      { type: "playlist", id: "pl-lofi" },
      { type: "playlist", id: "pl-indie" },
      { type: "playlist", id: "pl-mia" },
      { type: "playlist", id: "pl-tarea" },
    ],
  },
  {
    title: "Reproducido recientemente",
    items: [
      { type: "album", id: "al-uvst" },
      { type: "playlist", id: "pl-exitos" },
      { type: "artist", id: "a-weeknd" },
      { type: "album", id: "al-fn" },
      { type: "playlist", id: "pl-lofi" },
      { type: "artist", id: "a-monlaferte" },
      { type: "album", id: "al-sos" },
    ],
  },
];

/* ---------- Canciones del momento (chart de la portada) ----------- */
DB.homeTrending = {
  title: "Canciones del momento",
  queue: "playlist:pl-topglobal",
  songIds: ["s1", "s25", "s9", "s13", "s5", "s29", "s27", "s18", "s43", "s47"],
};
