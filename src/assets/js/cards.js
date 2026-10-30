/* =====================================================================
 * Componentes reutilizables — covers, tarjetas, secciones, buscador
 * y biblioteca. Todo se genera como HTML para el router del SPA.
 * ================================================================== */

const EMOJIS = ["🎧", "🔥", "🌎", "💜", "🎸", "🌴", "🚀", "🍹", "🧠", "💫", "🌙", "⚡", "🎹", "🫀", "🪩", "🎤"];

function emojiFor(id) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return EMOJIS[Math.abs(h) % EMOJIS.length];
}

function infoOf(type, id) {
  if (type === "playlist") {
    const p = DB.playlist(id);
    return p ? { name: p.name, sub: p.desc || "Playlist", grad: p.grad, item: p } : null;
  }
  if (type === "album") {
    const a = DB.album(id);
    if (!a) return null;
    const artist = DB.artist(a.artistId);
    return {
      name: a.title,
      sub: `${a.year} · ${artist ? artist.name : "Álbum"}`,
      grad: a.grad,
      item: a,
    };
  }
  if (type === "artist") {
    const a = DB.artist(id);
    return a ? { name: a.name, sub: "Artista", grad: a.grad, item: a } : null;
  }
  return null;
}

function contextLabelOf(type, id) {
  const info = infoOf(type, id);
  return info ? info.name : "";
}

function songQueueOf(type, id) {
  if (type === "playlist") {
    const p = DB.playlist(id);
    return p ? [...p.songIds] : [];
  }
  if (type === "album") {
    const a = DB.album(id);
    return a ? a.songs.map((s) => s[0]) : [];
  }
  if (type === "artist") {
    const a = DB.artist(id);
    if (!a) return [];
    const out = [];
    for (const alb of DB.albums)
      if (alb.artistId === id) alb.songs.forEach((s) => out.push(s[0]));
    return out;
  }
  return [];
}

/* --------------------------- cover HTML ---------------------------- */

function coverCss(item) {
  const img = coverImage(item);
  return img ? `url('${img}')` : gradCss(item && item.grad ? item.grad : "ep1");
}

function coverHtml(type, item, extra) {
  const bg = `background-image:${gradCss(item.grad)}`;
  const cls = extra || "";
  const img = coverImage(item);
  const round = type === "artist" ? "rounded-full" : "";

  if (img) {
    return `<div class="relative aspect-square w-full overflow-hidden ${round} shadow-lg ${cls}" style="background-image:${bg}">
        <img src="${img}" alt="" loading="lazy" class="h-full w-full object-cover" />
        <span class="pointer-events-none absolute inset-0 ${round} ring-1 ring-inset ring-white/15"></span>
      </div>`;
  }

  if (type === "artist") {
    return `<div class="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-full shadow-lg ${cls}" style="${bg}">
        <span class="text-5xl font-black text-white/90" style="text-shadow:0 2px 12px rgba(0,0,0,.45)">${esc(initials(item.name))}</span>
        <span class="absolute inset-0 rounded-full ring-1 ring-inset ring-white/15"></span>
      </div>`;
  }
  if (type === "playlist") {
    return `<div class="relative flex aspect-square w-full items-center justify-center overflow-hidden shadow-lg ${cls}" style="${bg}">
        <span class="text-7xl drop-shadow-xl" style="transform:rotate(-8deg)">${item.emoji || emojiFor(item.id)}</span>
      </div>`;
  }
  return `<div class="relative flex aspect-square w-full items-center justify-center overflow-hidden shadow-lg ${cls}" style="${bg}">
      <span class="flex h-[62%] w-[62%] items-center justify-center rounded-full"
        style="background:radial-gradient(circle at 35% 35%, #3a3a3a, #0d0d0d 65%)">
        <span class="flex h-[52%] w-[52%] items-center justify-center rounded-full bg-black/85">
          <span class="text-2xl font-black text-white/80">${esc(initials(item.title || item.name))}</span>
        </span>
      </span>
    </div>`;
}

function coverHtmlShort(type, item) {
  const bg = `background-image:${gradCss(item.grad)}`;
  const img = coverImage(item);
  if (img) {
    return `<img src="${img}" alt="" loading="lazy" class="h-full w-full object-cover" />`;
  }
  if (type === "artist") {
    return `<span class="flex h-full w-full items-center justify-center rounded-full" style="${bg}">
        <span class="text-[16px] font-black text-white/90">${esc(initials(item.name))}</span>
      </span>`;
  }
  const emoji = type === "playlist" ? item.emoji || emojiFor(item.id) : "💿";
  return `<span class="flex h-full w-full items-center justify-center" style="${bg}">
      <span class="text-lg">${emoji}</span>
    </span>`;
}

/* ----------------------------- tarjetas ---------------------------- */

function cardHtml(type, id) {
  const info = infoOf(type, id);
  if (!info) return "";
  return `<article class="card group relative cursor-pointer rounded-lg bg-white/[0.06] p-3 transition-colors duration-200 hover:bg-white/10"
      data-link="${type}/${id}" data-card="${type}:${id}">
      <div class="relative mb-3">
        ${coverHtml(type, info.item)}
        <button class="card-play absolute bottom-1 right-1 flex h-11 w-11 items-center justify-center rounded-full bg-[#1ed760] text-black shadow-2xl transition hover:scale-108 hover:bg-[#3be477]"
          data-collection-play="${type}:${id}" aria-label="Reproducir ${esc(info.name)}">
          <span class="ml-0.5 flex h-5 w-5 items-center justify-center text-[20px]">${icon("play")}</span>
        </button>
        <button class="absolute left-1 top-1 hidden h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white/80 hover:bg-black hover:text-white group-hover:flex"
          data-more-context="${type}:${id}" aria-label="Más opciones de ${esc(info.name)}">
          <span class="flex h-4 w-4 items-center justify-center text-[16px]">${icon("more")}</span>
        </button>
      </div>
      <h4 class="truncate text-[15px] font-bold text-white">${esc(info.name)}</h4>
      <p class="clamp-2 mt-0.5 text-sm font-normal text-subtle">${esc(info.sub)}</p>
    </article>`;
}

function compactCardHtml(type, id) {
  const info = infoOf(type, id);
  if (!info) return "";
  return `<article class="card group relative flex cursor-pointer items-center gap-3 overflow-hidden rounded-md bg-white/[0.07] p-0 transition-colors duration-200 hover:bg-white/[0.13]"
      data-link="${type}/${id}" data-card="${type}:${id}">
      <span class="block h-12 w-12 shrink-0 overflow-hidden shadow sm:h-14 sm:w-14">${coverHtmlShort(type, info.item)}</span>
      <h4 class="min-w-0 flex-1 truncate pr-2 text-sm font-bold">${esc(info.name)}</h4>
      <button class="card-play mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1ed760] text-black shadow-lg hover:scale-110"
        data-collection-play="${type}:${id}" aria-label="Reproducir ${esc(info.name)}">
        <span class="ml-0.5 flex h-4 w-4 items-center justify-center text-[16px]">${icon("play")}</span>
      </button>
    </article>`;
}

function songCardHtml(songId, queueAttr = "") {
  const s = DB.song(songId);
  if (!s) return "";
  const album = s.albumId ? DB.album(s.albumId) : null;
  const artist = s.artistId ? DB.artist(s.artistId) : null;
  return `<article class="card group relative cursor-pointer rounded-lg bg-white/[0.04] p-3 transition-colors duration-200 hover:bg-white/10"
      data-track="${s.id}" ${queueAttr ? `data-queue="${queueAttr}"` : ""} data-card="song:${s.id}">
      <div class="relative mb-3">
        ${album ? coverHtml("album", album) : `<div class="aspect-square w-full rounded-sm bg-white/10"></div>`}
        <button class="card-play absolute bottom-1 right-1 flex h-11 w-11 items-center justify-center rounded-full bg-[#1ed760] text-black shadow-2xl transition hover:scale-108 hover:bg-[#3be477]"
          aria-label="Reproducir ${esc(s.title)}">
          <span class="ml-0.5 flex h-5 w-5 items-center justify-center text-[20px]">${icon("play")}</span>
        </button>
      </div>
      <h4 class="clamp-1 text-[15px] font-bold text-white">${esc(s.title)}</h4>
      <p class="clamp-1 mt-0.5 text-sm font-normal text-subtle">${esc(artist ? artist.name : "Artista")}</p>
    </article>`;
}

function songsSectionHtml(title, songIds, queueAttr = "", link = "") {
  if (!songIds.length) return "";
  const action = link
    ? `<button class="text-xs font-bold uppercase tracking-wide text-subtle transition hover:text-white hover:underline" data-link="${link}">Mostrar todo</button>`
    : "";
  return `<section class="mt-7 first:mt-0">
      <div class="mb-3 flex items-end justify-between gap-4">
        <h2 class="text-[20px] font-black text-white sm:text-[22px]">${esc(title)}</h2>
        ${action}
      </div>
      <div class="no-scrollbar -mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-1">
        ${songIds
          .map(
            (id) =>
              `<div class="w-[150px] shrink-0 snap-start sm:w-[168px]">${songCardHtml(id, queueAttr)}</div>`
          )
          .join("")}
      </div>
    </section>`;
}

/* --------------------------- grids / secciones --------------------- */

const CARDS_GRID = "grid gap-3";
const CARDS_GRID_STYLE = "grid-template-columns:repeat(auto-fill,minmax(150px,1fr))";

function sectionHtml(title, items, { compact = false, link = "" } = {}) {
  if (!items.length) return "";
  const inner = items
    .map((it) => (compact ? compactCardHtml(it.type, it.id) : cardHtml(it.type, it.id)))
    .join("");
  const min = compact ? "minmax(220px,1fr)" : "minmax(150px,1fr)";
  const action = link
    ? `<button class="text-xs font-bold uppercase tracking-wide text-subtle transition hover:text-white hover:underline" data-link="${link}">Mostrar todo</button>`
    : "";
  return `<section class="mt-7 first:mt-0">
      <div class="mb-3 flex items-end justify-between gap-4">
        <h2 class="text-[20px] font-black text-white sm:text-[22px]">${esc(title)}</h2>
        ${action}
      </div>
      <div class="${compact ? "grid gap-2" : CARDS_GRID}" style="grid-template-columns:repeat(auto-fill,${min})">${inner}</div>
    </section>`;
}

function sectionHeaderHtml(title, sub = "", action = "") {
  return `<div class="mb-3 flex items-end justify-between gap-4">
      <div>
        <h2 class="text-[20px] font-black text-white sm:text-[22px]">${esc(title)}</h2>
        ${sub ? `<p class="mt-0.5 text-xs text-subtle">${esc(sub)}</p>` : ""}
      </div>
      ${action}
    </div>`;
}

/* --------------------------- genre cards --------------------------- */

function genreCardHtml(g) {
  return `<button class="genre-card group relative aspect-[1.85] overflow-hidden rounded-lg p-4 text-left shadow-lg"
      style="background-image:${coverCss(g)};background-size:cover;background-position:center" data-genre="${g.id}" aria-label="Explorar ${esc(g.name)}">
      <span class="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/5"></span>
      <span class="relative z-10 block max-w-full text-[14px] font-black leading-[1.15] text-white drop-shadow sm:text-xl">${esc(g.name)}</span>
      <span class="absolute -bottom-2 -right-2 h-[74px] w-[74px] rotate-[25deg] overflow-hidden rounded shadow-2xl ring-1 ring-white/20 transition-transform duration-300 group-hover:rotate-[15deg] group-hover:scale-105 sm:h-[86px] sm:w-[86px]"
        style="background-image:${coverCss(g)};background-size:cover;background-position:center"></span>
      <span class="absolute inset-0 bg-black/0 transition group-hover:bg-black/10"></span>
    </button>`;
}

function genresGridHtml(genres, cols = "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5") {
  return `<div class="grid gap-3 ${cols}">${genres.map(genreCardHtml).join("")}</div>`;
}

/* -------------------------------- HOME ------------------------------ */

function renderHome() {
  const hl = new Date().getHours();
  const greet = hl < 12 ? "Buenos días" : hl < 20 ? "Buenas tardes" : "Buenas noches";

  const recents = (Store.get("recentItems") || []).slice(0, 8);
  const quick = `<section class="mt-2 first:mt-0">
      ${sectionHeaderHtml(greet)}
      <div class="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        ${recents.map((it) => compactCardHtml(it.type, it.id)).join("")}
      </div>
    </section>`;

  const premium =
    Store.get("plan") === "free"
      ? `<section class="mt-8 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-r from-[#1db954]/20 via-[#121212] to-[#121212] p-5 sm:p-6">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-[11px] font-bold uppercase tracking-[0.18em] text-spotify">Spotify Premium</p>
              <h3 class="mt-1 text-xl font-black sm:text-2xl">Escucha sin anuncios. Sin límites.</h3>
              <p class="mt-1 max-w-xl text-sm text-subtle">Descarga música, salta canciones y escucha en calidad muy alta. Desde $1.490 al mes.</p>
            </div>
            <a href="#/premium" class="shrink-0 rounded-full bg-white px-6 py-3 text-center text-sm font-black text-black transition hover:scale-105">Ver planes</a>
          </div>
        </section>`
      : "";

  const sections = DB.homeSections
    .map((s) => sectionHtml(s.title, s.items, { link: s.title === "Artistas populares" ? "#/library" : "" }))
    .join("");

  const trending = DB.homeTrending
    ? songsSectionHtml(DB.homeTrending.title, DB.homeTrending.songIds, DB.homeTrending.queue)
    : "";

  const explore = `<section class="mt-9">
      ${sectionHeaderHtml("Explorar categorías", "Encuentra tu próximo género favorito")}
      ${genresGridHtml(DB.genres.slice(0, 8))}
    </section>`;

  return `<main class="pb-10">
      <div class="bg-gradient-to-b from-[#1f2a33]/90 from-10% via-base to-base px-4 pt-2 sm:px-7">
        ${quick}
        ${trending}
        ${premium}
        <div class="mt-8">${sections}</div>
        ${explore}
      </div>
      <div class="mt-10 px-4 text-xs leading-relaxed text-faint sm:px-7">
        <p>Proyecto académico · Clon visual e interactivo de Spotify. Las canciones son melodías generadas en tiempo real con la Web Audio API.</p>
        <p class="mt-1">No está afiliado a Spotify AB ni reproduce música con derechos de autor.</p>
      </div>
    </main>`;
}

/* ------------------------------- SEARCH ----------------------------- */

const libState = { filter: "all", query: "" };
const searchState = { query: "", filter: "all" };

function normalizeText(str) {
  return String(str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function searchAll(q) {
  const n = normalizeText(q).trim();
  if (!n) {
    return { songs: [], albums: [], artists: [], playlists: [], genres: [], total: 0, best: null };
  }
  const tokens = n.split(/\s+/).filter(Boolean);
  const matches = (haystack) => tokens.every((t) => normalizeText(haystack).includes(t));

  const artists = DB.artists.filter((a) => matches(`${a.name} ${a.genre} ${a.about}`));
  const albums = DB.albums.filter((a) => {
    const ar = DB.artist(a.artistId);
    return matches(`${a.title} ${a.year} ${ar ? ar.name : ""}`);
  });
  const playlists = DB.allPlaylists().filter((p) =>
    matches(`${p.name} ${p.desc || ""} ${p.owner || ""}`)
  );
  const songs = DB.songs.filter((s) => {
    const ar = DB.artist(s.artistId);
    const al = DB.album(s.albumId);
    return matches(`${s.title} ${ar ? ar.name : ""} ${al ? al.title : ""}`);
  });
  const genres = DB.genres.filter((g) => matches(`${g.name} ${g.desc}`));

  const scored = [
    ...artists.map((a) => ({ type: "artist", item: a, score: matchScore(a.name, n) })),
    ...albums.map((a) => ({ type: "album", item: a, score: matchScore(a.title, n) })),
    ...playlists.map((p) => ({ type: "playlist", item: p, score: matchScore(p.name, n) })),
    ...songs.map((s) => ({ type: "song", item: s, score: matchScore(s.title, n) - 1 })),
  ].sort((a, b) => b.score - a.score);

  return {
    songs,
    albums,
    artists,
    playlists,
    genres,
    best: scored[0] || null,
    total: artists.length + albums.length + playlists.length + songs.length + genres.length,
  };
}

function matchScore(text, n) {
  const t = normalizeText(text);
  if (t === n) return 100;
  if (t.startsWith(n)) return 80;
  if (t.includes(n)) return 60;
  return 10;
}

function searchChipHtml(value, label) {
  const on = searchState.filter === value;
  return `<button class="rounded-full px-3 py-1.5 text-xs font-bold transition ${
    on ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"
  }" data-search-filter="${value}">${esc(label)}</button>`;
}

function renderSearchResultsBody(query) {
  const q = (query || "").trim();
  const results = searchAll(q);

  if (!q) {
    const recent = Store.get("recentSearches") || [];
    const savedArtists = (Store.get("savedArtists") || [])
      .map((id) => DB.artist(id))
      .filter(Boolean);

    const recentBlock = recent.length
      ? `<section class="mt-6">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="text-[20px] font-black">Búsquedas recientes</h2>
            <button class="text-xs font-bold text-subtle transition hover:text-white" data-clear-recent>Borrar</button>
          </div>
          <div class="flex flex-wrap gap-2">
            ${recent
              .map(
                (r) =>
                  `<button class="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-white/20" data-recent-search="${esc(r)}">
                    <span class="text-[14px] text-subtle">${icon("search")}</span>${esc(r)}
                  </button>`
              )
              .join("")}
          </div>
        </section>`
      : "";

    const artistsBlock = savedArtists.length
      ? `<section class="mt-7">
          ${sectionHeaderHtml("Tus artistas favoritos")}
          <div class="flex gap-4 overflow-x-auto pb-2 scroll-area">
            ${savedArtists
              .map(
                (a) => `<button class="group flex w-28 shrink-0 flex-col items-center gap-2 text-center" data-link="artist/${a.id}">
                  <span class="block w-24">${coverHtml("artist", a)}</span>
                  <span class="truncate text-sm font-bold">${esc(a.name)}</span>
                </button>`
              )
              .join("")}
          </div>
        </section>`
      : "";

    const userPlaylists = DB.userPlaylists.slice(0, 4);
    const playlistsBlock = userPlaylists.length
      ? `<section class="mt-7">
          ${sectionHeaderHtml("Tus playlists")}
          <div class="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            ${userPlaylists.map((p) => compactCardHtml("playlist", p.id)).join("")}
          </div>
        </section>`
      : "";

    const recommended = DB.playlists.slice(0, 6);
    const recommendedBlock = `<section class="mt-8">
        ${sectionHeaderHtml("Recomendado para hoy")}
        <div class="${CARDS_GRID}" style="${CARDS_GRID_STYLE}">
          ${recommended.map((p) => cardHtml("playlist", p.id)).join("")}
        </div>
      </section>`;

    return `${recentBlock}${artistsBlock}${playlistsBlock}${recommendedBlock}
      <section class="mt-8">
        ${sectionHeaderHtml("Explorar todo", "Géneros y estados de ánimo")}
        ${genresGridHtml(DB.genres)}
      </section>`;
  }

  if (!results.total) {
    return `<div class="flex flex-col items-center justify-center py-16 text-center">
        <span class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-3xl">🔎</span>
        <h2 class="text-2xl font-black">No se encontraron resultados para «${esc(q)}»</h2>
        <p class="mt-2 max-w-md text-sm text-subtle">Revisa la ortografía o busca por otro artista, álbum o canción. También puedes explorar las categorías.</p>
        <div class="mt-6 flex flex-wrap justify-center gap-2">
          ${["Bad Bunny", "Taylor Swift", "Lo-Fi", "Rock chileno"]
            .map(
              (s) =>
                `<button class="rounded-full bg-white/10 px-4 py-2 text-sm font-bold transition hover:bg-white/20" data-recent-search="${esc(s)}">${esc(s)}</button>`
            )
            .join("")}
        </div>
      </div>`;
  }

  const filters = `<div class="mt-4 flex flex-wrap gap-2">
      ${searchChipHtml("all", "Todo")}
      ${searchChipHtml("songs", "Canciones")}
      ${searchChipHtml("artists", "Artistas")}
      ${searchChipHtml("albums", "Álbumes")}
      ${searchChipHtml("playlists", "Playlists")}
    </div>`;

  const f = searchState.filter;
  const blocks = [];

  if (f === "all" && results.best) {
    blocks.push(topResultHtml(results.best));
  }

  if (f === "songs" || (f === "all" && results.songs.length)) {
    blocks.push(songResults(results.songs, f === "all" ? 5 : 40));
  }
  if (f === "all" && results.genres.length) {
    blocks.push(`<section class="mt-7">
        ${sectionHeaderHtml("Géneros")}
        ${genresGridHtml(results.genres, "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4")}
      </section>`);
  }
  if (f === "artists" || (f === "all" && results.artists.length)) {
    blocks.push(blockGrid("Artistas", results.artists, "artist"));
  }
  if (f === "albums" || (f === "all" && results.albums.length)) {
    blocks.push(blockGrid("Álbumes", results.albums, "album"));
  }
  if (f === "playlists" || (f === "all" && results.playlists.length)) {
    blocks.push(blockGrid("Playlists", results.playlists, "playlist"));
  }

  const emptyFilter = !blocks.length
    ? `<p class="mt-8 text-sm text-subtle">No hay resultados de este tipo para «${esc(q)}».</p>`
    : "";

  return `${filters}${blocks.join("")}${emptyFilter}`;
}

function topResultHtml(best) {
  if (best.type === "song") {
    const s = best.item;
    const album = DB.album(s.albumId);
    const artist = DB.artist(s.artistId);
    const bg = coverCss(album || { grad: "ep1" });
    return `<section class="mt-7">
        <h2 class="mb-3 text-[20px] font-black">Mejor resultado</h2>
        <div class="group relative flex cursor-pointer items-center gap-4 overflow-hidden rounded-lg bg-white/[0.07] p-4 transition hover:bg-white/10" data-card="album:${s.albumId}">
          <span class="block h-24 w-24 shrink-0 rounded bg-cover bg-center shadow-lg" style="background-image:${bg}"></span>
          <div class="min-w-0">
            <p class="text-[11px] font-bold uppercase tracking-wide text-subtle">Canción</p>
            <h3 class="clamp-1 mt-1 text-2xl font-black sm:text-3xl">${esc(s.title)}</h3>
            <p class="mt-1 text-sm text-subtle">${esc(artist ? artist.name : "")} · ${esc(album ? album.title : "")}</p>
            <p class="mt-1 text-xs text-faint">${fmtTime(s.duration)}</p>
          </div>
          <button class="card-play absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#1ed760] text-black shadow-xl hover:scale-105"
            data-track-play="${s.id}" aria-label="Reproducir ${esc(s.title)}">
            <span class="ml-0.5 flex h-6 w-6 items-center justify-center text-[24px]">${icon("play")}</span>
          </button>
        </div>
      </section>`;
  }
  const info = infoOf(best.type, best.item.id);
  if (!info) return "";
  return `<section class="mt-7">
      <h2 class="mb-3 text-[20px] font-black">Mejor resultado</h2>
      <article class="group relative flex cursor-pointer items-center gap-4 overflow-hidden rounded-lg bg-white/[0.07] p-4 transition hover:bg-white/10"
        data-card="${best.type}:${best.item.id}" data-link="${best.type}/${best.item.id}">
        <span class="block h-24 w-24 shrink-0">${coverHtml(best.type, best.item)}</span>
        <div class="min-w-0">
          <p class="text-[11px] font-bold uppercase tracking-wide text-subtle">${
            best.type === "artist" ? "Artista" : best.type === "album" ? "Álbum" : "Playlist"
          }</p>
          <h3 class="clamp-1 mt-1 text-2xl font-black sm:text-3xl">${esc(info.name)}</h3>
          <p class="clamp-2 mt-1 text-sm text-subtle">${esc(info.sub)}</p>
        </div>
        <button class="card-play absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#1ed760] text-black shadow-xl hover:scale-105"
          data-collection-play="${best.type}:${best.item.id}" aria-label="Reproducir">
          <span class="ml-0.5 flex h-6 w-6 items-center justify-center text-[24px]">${icon("play")}</span>
        </button>
      </article>
    </section>`;
}

function blockGrid(title, items, type) {
  const cards = items.map((it) => cardHtml(type, it.id)).join("");
  return `<section class="mt-7">
      ${sectionHeaderHtml(title)}
      <div class="${CARDS_GRID}" style="${CARDS_GRID_STYLE}">${cards}</div>
    </section>`;
}

function songResults(songs, limit = 5) {
  const list = songs.slice(0, limit);
  const rows = list
    .map((s, i) => {
      const album = s.albumId ? DB.album(s.albumId) : null;
      const artist = s.artistId ? DB.artist(s.artistId) : null;
      const bg = coverCss(album || { grad: "ep1" });
      return `<div class="track group grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-3 rounded-md px-3 py-2 hover:bg-white/10" data-track="${s.id}">
          <span class="flex h-6 w-6 items-center justify-center text-sm text-subtle">
            <span class="idx-num block">${i + 1}</span>
            <span class="idx-play hidden items-center justify-center group-hover:flex"><span class="flex h-3.5 w-3.5 items-center justify-center text-[14px]">${icon("play")}</span></span>
            <span class="idx-eq hidden h-3 items-end gap-[2px]"><span class="eq-bar" style="height:45%"></span><span class="eq-bar" style="height:80%"></span><span class="eq-bar" style="height:60%"></span></span>
          </span>
          <div class="flex min-w-0 items-center gap-3">
            <span class="h-10 w-10 shrink-0 rounded-sm bg-cover bg-center" style="background-image:${bg}"></span>
            <div class="min-w-0 leading-tight">
              <p class="truncate text-sm text-white">${esc(s.title)}</p>
              <p class="truncate text-xs text-subtle">${artist ? esc(artist.name) : ""} · ${album ? esc(album.title) : ""}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button class="hidden text-faint hover:text-white group-hover:block" data-more-track="${s.id}" aria-label="Más opciones">
              <span class="flex h-4 w-4 items-center justify-center text-[16px]">${icon("more")}</span>
            </button>
            <span class="text-sm tabular-nums text-subtle">${fmtTime(s.duration)}</span>
          </div>
        </div>`;
    })
    .join("");
  const link =
    limit < songs.length
      ? `<button class="text-xs font-bold text-subtle hover:text-white hover:underline" data-search-filter="songs">Ver todo</button>`
      : "";
  return `<section class="mt-7">
      ${sectionHeaderHtml("Canciones", "", link)}
      <div>${rows}</div>
    </section>`;
}

function renderSearch(query) {
  const q = query || "";
  return `<main class="px-4 pb-12 pt-4 sm:px-7">
      <h1 class="sr-only">Buscar</h1>
      <div id="search-results">${renderSearchResultsBody(q)}</div>
    </main>`;
}

/* ------------------------------- LIBRARY ---------------------------- */

function libraryItems() {
  const savedAlbums = (Store.get("savedAlbums") || []).map((id) => DB.album(id)).filter(Boolean);
  const savedArtists = (Store.get("savedArtists") || []).map((id) => DB.artist(id)).filter(Boolean);
  return [
    ...DB.userPlaylists.map((p) => ({
      type: "playlist",
      id: p.id,
      item: p,
      name: p.name,
      sub: `Playlist · ${p.owner || "Tú"} · ${p.songIds.length} canciones`,
      grad: p.grad,
      emoji: p.emoji,
    })),
    {
      type: "liked",
      id: "liked",
      name: "Canciones que te gustan",
      sub: `Playlist · ${Player.liked.size} canciones`,
      grad: "ep6",
      emoji: "💚",
    },
    ...savedAlbums.map((a) => ({
      type: "album",
      id: a.id,
      item: a,
      name: a.title,
      sub: `Álbum · ${DB.artist(a.artistId) ? DB.artist(a.artistId).name : ""}`,
      grad: a.grad,
    })),
    ...savedArtists.map((a) => ({
      type: "artist",
      id: a.id,
      item: a,
      name: a.name,
      sub: "Artista",
      grad: a.grad,
      round: true,
    })),
  ];
}

function renderLibrary() {
  const q = normalizeText(libState.query);
  const all = libraryItems();
  const filtered = all.filter((it) => {
    if (libState.filter !== "all") {
      const matchesFilter =
        it.type === libState.filter || (libState.filter === "playlist" && it.type === "liked");
      if (!matchesFilter) return false;
    }
    if (q && !normalizeText(`${it.name} ${it.sub}`).includes(q)) return false;
    return true;
  });

  const chips = [
    ["all", "Todas"],
    ["playlist", "Playlists"],
    ["album", "Álbumes"],
    ["artist", "Artistas"],
  ]
    .map(([val, label]) => {
      const on = libState.filter === val;
      return `<button class="rounded-full px-3 py-1.5 text-xs font-bold transition ${
        on ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"
      }" data-lib-filter-page="${val}">${label}</button>`;
    })
    .join("");

  const rows = filtered.length
    ? filtered
        .map((it) => {
          const cover =
            it.type === "liked"
              ? `<span class="flex h-14 w-14 shrink-0 items-center justify-center rounded-sm text-xl" style="background-image:${gradCss("ep6")}">💚</span>`
              : `<span class="block h-14 w-14 shrink-0 overflow-hidden ${
                  it.type === "artist" ? "rounded-full" : "rounded-sm"
                }">${coverHtmlShort(it.type === "liked" ? "playlist" : it.type, it.item || { name: it.name, grad: it.grad, emoji: it.emoji })}</span>`;
          const link = it.type === "liked" ? "liked" : `${it.type}/${it.id}`;
          return `<article class="group flex min-w-0 cursor-pointer items-center gap-3 rounded-md p-2 transition hover:bg-white/10" data-link="${link}" data-card="${
            it.type === "liked" ? "playlist:liked" : `${it.type}:${it.id}`
          }">
              ${cover}
              <div class="min-w-0 flex-1">
                <h4 class="truncate text-sm font-bold">${esc(it.name)}</h4>
                <p class="truncate text-xs text-subtle">${esc(it.sub)}</p>
              </div>
              ${
                it.type === "liked"
                  ? `<span class="hidden text-xs font-bold text-spotify group-hover:block">Reproducir</span>`
                  : `<button class="card-play flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-spotify text-black shadow hover:scale-110" data-collection-play="${it.type}:${it.id}" aria-label="Reproducir">
                      <span class="ml-0.5 flex h-4 w-4 items-center justify-center text-[16px]">${icon("play")}</span>
                    </button>`
              }
              <button class="rounded-full p-2 text-subtle opacity-0 transition hover:bg-white/10 hover:text-white group-hover:opacity-100" data-more-context="${
                it.type === "liked" ? "playlist:liked" : `${it.type}:${it.id}`
              }" aria-label="Más opciones">
                <span class="block text-[18px]">${icon("more")}</span>
              </button>
            </article>`;
        })
        .join("")
    : `<div class="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed border-white/15 py-14 text-center">
        <span class="text-3xl">🎧</span>
        <h3 class="mt-3 text-lg font-black">Aún no hay nada aquí</h3>
        <p class="mt-1 max-w-sm text-sm text-subtle">Guarda álbumes o artistas, o crea una playlist para verla en tu biblioteca.</p>
        <button class="mt-4 rounded-full bg-white px-5 py-2.5 text-sm font-black text-black transition hover:scale-105" data-create-playlist>Crear playlist</button>
      </div>`;

  return `<main class="px-4 pb-12 pt-2 sm:px-7">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 class="text-3xl font-black">Tu biblioteca</h1>
          <p class="mt-1 text-sm text-subtle">${all.length} elementos guardados · ${DB.userPlaylists.length} playlists propias</p>
        </div>
        <button class="flex items-center gap-2 self-start rounded-full bg-white px-4 py-2 text-sm font-black text-black transition hover:scale-105 sm:self-auto" data-create-playlist>
          ${icon("plus")} Crear playlist
        </button>
      </div>
      <div class="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex flex-wrap gap-2">${chips}</div>
        <div class="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 sm:w-64">
          <span class="text-[16px] text-subtle">${icon("search")}</span>
          <input id="lib-page-search" type="search" value="${esc(libState.query)}" placeholder="Buscar en tu biblioteca"
            class="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-subtle focus:outline-none" />
        </div>
      </div>
      <div class="mt-4 grid gap-1 lg:grid-cols-2">${rows}</div>
    </main>`;
}
