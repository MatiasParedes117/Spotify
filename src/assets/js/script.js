/* =====================================================================
 * Script principal — router, eventos globales, modales, buscador,
 * biblioteca, cuenta, planes y cola de reproducción.
 * ================================================================== */

function esc(str) {
  return String(str).replace(/[&<>"']/g, (m) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m])
  );
}

const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

function injectIcons(root) {
  $$("[data-icon]", root).forEach((el) => {
    const name = el.getAttribute("data-icon");
    if (ICONS[name]) {
      el.innerHTML = ICONS[name];
      el.removeAttribute("data-icon");
    }
  });
}

/* ------------------------- estado global ---------------------------- */

const sidebarLibState = { filter: "all", query: "" };
let pendingHeaderNavigation = false;

/* ------------------------------ router ------------------------------ */

function parseHash() {
  const hash = location.hash || "#/";
  const parts = hash.replace(/^#\//, "").split("/");
  return { name: parts[0] || "home", id: parts[1], hash };
}

function routeViewHtml(r) {
  switch (r.name) {
    case "search":
      return renderSearch(searchState.query);
    case "library":
      return renderLibrary();
    case "playlist":
      return renderPlaylist(r.id);
    case "album":
      return renderAlbum(r.id);
    case "artist":
      return renderArtist(r.id);
    case "liked":
      return renderLiked();
    case "genre":
      return renderGenre(r.id);
    case "premium":
      return renderPremium();
    case "account":
      return renderAccount();
    default:
      return renderHome();
  }
}

function applyNavActive(r) {
  const detail = ["playlist", "album", "artist", "liked", "genre"].includes(r.name);
  const key = detail ? "" : r.name;
  $$("[data-nav]").forEach((a) => {
    const on = a.getAttribute("data-nav") === key;
    a.classList.toggle("text-white", on);
    a.classList.toggle("text-subtle", !on);
    a.classList.toggle("bg-white/10", on);
  });
  $$("[data-nav2]").forEach((a) => {
    const on = a.getAttribute("data-nav2") === key;
    a.classList.toggle("text-white", on);
    a.classList.toggle("text-subtle", !on);
    a.classList.toggle("bg-white/10", on);
  });
}

const navHist = [];
let navIdx = -1;

function updateNavButtons() {
  const back = $("#btn-back");
  const fwd = $("#btn-forward");
  if (back) back.disabled = navIdx <= 0;
  if (fwd) fwd.disabled = navIdx >= navHist.length - 1;
}

function renderRoute() {
  const r = parseHash();
  if (navHist[navIdx] !== r.hash) {
    if (navIdx < navHist.length - 1) navHist.length = navIdx + 1;
    navHist.push(r.hash);
    navIdx = navHist.length - 1;
  }
  const view = $("#view");
  view.innerHTML = routeViewHtml(r);
  injectIcons(view);
  view.scrollTop = 0;
  applyNavActive(r);
  updateNavButtons();
  syncSearchInputs();
  afterView(r);
  setActiveTrackRow();
  renderLikeButtons();
  view.classList.remove("anim-fade");
  void view.offsetWidth;
  view.classList.add("anim-fade");
  updateHeaderScroll();
}

function afterView(r) {
  if (r.name === "search") {
    const input = $("#search-input");
    if (input) {
      input.addEventListener("input", () => {
        searchState.query = input.value;
        searchState.filter = "all";
        syncSearchInputs();
        refreshSearchResults();
      });
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") recordSearch(input.value);
        if (e.key === "Escape") {
          input.value = "";
          searchState.query = "";
          syncSearchInputs();
          refreshSearchResults();
        }
      });
      if (window.innerWidth < 768 && !pendingHeaderNavigation) {
        input.focus({ preventScroll: true });
      }
      pendingHeaderNavigation = false;
    }
  }
  if (r.name === "library") {
    const input = $("#lib-page-search");
    if (input) {
      input.addEventListener("input", () => {
        libState.query = input.value;
        const res = $("#view");
        const y = res.scrollTop;
        res.innerHTML = renderLibrary();
        injectIcons(res);
        res.scrollTop = y;
        const again = $("#lib-page-search");
        if (again) {
          again.focus({ preventScroll: true });
          again.setSelectionRange(again.value.length, again.value.length);
        }
      });
      input.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          input.value = "";
          libState.query = "";
          renderRoute();
        }
      });
    }
  }
}

function updateHeaderScroll() {
  const view = $("#view");
  const header = $("#app-header");
  if (!view || !header) return;
  header.classList.toggle("scrolled", view.scrollTop > 8);
}

/* ------------------------ buscador global --------------------------- */

function syncSearchInputs() {
  const header = $("#global-search");
  if (header && document.activeElement !== header) header.value = searchState.query;
  const mobile = $("#search-input");
  if (mobile && document.activeElement !== mobile) mobile.value = searchState.query;
}

function refreshSearchResults() {
  const res = $("#search-results");
  if (!res) return;
  res.innerHTML = renderSearchResultsBody(searchState.query);
  injectIcons(res);
  setActiveTrackRow();
  renderLikeButtons();
}

function recordSearch(q) {
  const value = (q || "").trim();
  if (!value) return;
  const recent = (Store.get("recentSearches") || []).filter(
    (r) => normalizeText(r) !== normalizeText(value)
  );
  recent.unshift(value);
  Store.set("recentSearches", recent.slice(0, 8));
}

function handleHeaderSearchInput(value) {
  searchState.query = value;
  searchState.filter = "all";
  const r = parseHash();
  if (r.name !== "search") {
    pendingHeaderNavigation = true;
    location.hash = "#/search";
  } else {
    refreshSearchResults();
  }
}

/* -------------------- eventos delegados (contenido) ------------------ */

function onViewClick(e) {
  const target = e.target;

  // Acciones sin navegación
  const toastBtn = target.closest("[data-toast]");
  if (toastBtn) {
    toast(toastBtn.getAttribute("data-toast"));
    return;
  }

  const genre = target.closest("[data-genre]");
  if (genre) {
    location.hash = "#/genre/" + genre.getAttribute("data-genre");
    return;
  }

  const recentSearch = target.closest("[data-recent-search]");
  if (recentSearch) {
    searchState.query = recentSearch.getAttribute("data-recent-search");
    searchState.filter = "all";
    recordSearch(searchState.query);
    if (parseHash().name !== "search") location.hash = "#/search";
    else {
      syncSearchInputs();
      refreshSearchResults();
    }
    return;
  }

  if (target.closest("[data-clear-recent]")) {
    Store.set("recentSearches", []);
    refreshSearchResults();
    toast("Búsquedas recientes borradas");
    return;
  }

  const filterBtn = target.closest("[data-search-filter]");
  if (filterBtn) {
    searchState.filter = filterBtn.getAttribute("data-search-filter");
    refreshSearchResults();
    return;
  }

  const libFilter = target.closest("[data-lib-filter-page]");
  if (libFilter) {
    libState.filter = libFilter.getAttribute("data-lib-filter-page");
    renderRoute();
    return;
  }

  const createBtn = target.closest("[data-create-playlist]");
  if (createBtn) {
    openCreatePlaylist();
    return;
  }

  const planBtn = target.closest("[data-plan-select]");
  if (planBtn && !planBtn.disabled) {
    openCheckout(planBtn.getAttribute("data-plan-select"));
    return;
  }

  const billing = target.closest("[data-billing]");
  if (billing) {
    Store.set("premiumBilling", billing.getAttribute("data-billing"));
    rerenderKeepScroll();
    return;
  }

  if (target.closest("[data-scroll-plans]")) {
    $("#planes")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  if (target.closest("[data-cancel-plan]")) {
    openCancelPlan();
    return;
  }

  const follow = target.closest("[data-follow-artist]");
  if (follow) {
    toggleSavedArtist(follow.getAttribute("data-follow-artist"));
    rerenderKeepScroll();
    return;
  }

  if (target.closest("[data-save-profile]")) {
    const nameEl = $("#account-name");
    const emailEl = $("#account-email");
    const profile = { ...(Store.get("profile") || {}) };
    if (nameEl && nameEl.value.trim()) profile.name = nameEl.value.trim();
    if (emailEl && emailEl.value.trim()) profile.email = emailEl.value.trim();
    Store.set("profile", profile);
    updateAccountUI();
    rerenderKeepScroll();
    toast("Perfil actualizado");
    return;
  }

  const logout = target.closest("[data-action='logout']");
  if (logout) {
    openLogout();
    return;
  }

  const addSongs = target.closest("[data-add-songs]");
  if (addSongs) {
    openAddSongs(addSongs.getAttribute("data-add-songs"));
    return;
  }

  const heart = target.closest("[data-heart-row]");
  if (heart) {
    toggleLike(heart.getAttribute("data-heart-row"));
    return;
  }

  const collection = target.closest("[data-collection-play]");
  if (collection) {
    const [type, id] = collection.getAttribute("data-collection-play").split(":");
    playCollection(type, id);
    return;
  }

  const shuffleCollection = target.closest("[data-shuffle-collection]");
  if (shuffleCollection) {
    const [type, id] = shuffleCollection.getAttribute("data-shuffle-collection").split(":");
    playCollection(type, id, true);
    return;
  }

  const genrePlay = target.closest("[data-genre-play]");
  if (genrePlay) {
    playGenre(genrePlay.getAttribute("data-genre-play"), false);
    return;
  }

  const genreShuffle = target.closest("[data-genre-shuffle]");
  if (genreShuffle) {
    playGenre(genreShuffle.getAttribute("data-genre-shuffle"), true);
    return;
  }

  const trackPlay = target.closest("[data-track-play]");
  if (trackPlay) {
    playLooseSong(trackPlay.getAttribute("data-track-play"));
    return;
  }

  const queuePlay = target.closest("[data-queue-play]");
  if (queuePlay) {
    playFromQueue(queuePlay.getAttribute("data-queue-play"));
    return;
  }

  const track = target.closest("[data-track]");
  if (track) {
    const songId = track.getAttribute("data-track");
    let queue = [];
    let context = { type: null, id: null, label: "" };
    const q = track.getAttribute("data-queue");
    if (q && q !== ":") {
      const [type, id] = q.split(":");
      queue = songQueueOf(type, id);
      context = { type, id, label: contextLabelOf(type, id) };
      if (type === "liked") {
        queue = Array.from(Player.liked);
        context = { type: "liked", id: "liked", label: "Canciones que te gustan" };
      }
    } else {
      queue = searchQueueFor(songId);
      context = { type: "search", id: null, label: "Resultados de búsqueda" };
    }
    playSong(songId, queue.length ? queue : [songId], context);
    return;
  }

  const moreTrack = target.closest("[data-more-track]");
  if (moreTrack) {
    e.preventDefault();
    e.stopPropagation();
    showContextMenu(e.clientX, e.clientY, "track", moreTrack.getAttribute("data-more-track"));
    return;
  }

  const moreContext = target.closest("[data-more-context]");
  if (moreContext) {
    e.preventDefault();
    e.stopPropagation();
    showContextMenu(e.clientX, e.clientY, "card", moreContext.getAttribute("data-more-context"));
    return;
  }

  const link = target.closest("[data-link]");
  if (link) {
    const href = link.getAttribute("href") || link.getAttribute("data-link");
    if (parseHash().name === "search" && searchState.query) recordSearch(searchState.query);
    navigateTo(href);
  }
}

function onViewContext(e) {
  const track = e.target.closest("[data-track]");
  const card = e.target.closest("[data-card]");
  const more = e.target.closest("[data-more-context]");
  let kind = null;
  let ref = null;
  if (track) {
    kind = "track";
    ref = track.getAttribute("data-track");
  } else if (more) {
    kind = "card";
    ref = more.getAttribute("data-more-context");
  } else if (card) {
    kind = "card";
    ref = card.getAttribute("data-card");
  }
  if (!kind || !ref) return;
  e.preventDefault();
  showContextMenu(e.clientX, e.clientY, kind, ref);
}

function navigateTo(link) {
  if (!link) {
    location.hash = "#/";
    return;
  }
  if (link.startsWith("#")) {
    location.hash = link;
    return;
  }
  location.hash = "#/" + link.replace(/^\/+/, "");
}

function rerenderKeepScroll() {
  const view = $("#view");
  const y = view ? view.scrollTop : 0;
  renderRoute();
  if (view) view.scrollTop = y;
}

function searchQueueFor(songId) {
  const results = searchAll(searchState.query);
  const ids = results.songs.map((s) => s.id);
  return ids.includes(songId) ? ids : [songId];
}

function playCollection(type, id, shuffle = false) {
  let queue;
  if (type === "liked" || id === "liked") {
    queue = Array.from(Player.liked);
  } else {
    queue = songQueueOf(type, id);
  }
  if (!queue.length) {
    toast("Esta colección no tiene canciones");
    return;
  }
  if (shuffle) {
    queue = [...queue].sort(() => Math.random() - 0.5);
    Player.shuffle = true;
  }
  playSong(queue[0], queue, { type, id, label: contextLabelOf(type, id) });
  pushRecent(type, id);
}

function playGenre(id, shuffle = false) {
  const g = DB.genre(id);
  if (!g) return;
  let queue = [...new Set(g.playlistIds.flatMap((pid) => (DB.playlist(pid) ? DB.playlist(pid).songIds : [])))];
  if (!queue.length) {
    toast("Esta categoría no tiene canciones");
    return;
  }
  if (shuffle) queue = queue.sort(() => Math.random() - 0.5);
  playSong(queue[0], queue, { type: "genre", id, label: g.name });
}

function playLooseSong(songId) {
  const s = DB.song(songId);
  if (!s) return;
  playSong(songId, [songId], { type: "search", id: null, label: "Resultados de búsqueda" });
}

function playFromQueue(songId) {
  const idx = Player.queue.indexOf(songId);
  if (idx >= 0) loadTrack(idx);
  else playLooseSong(songId);
}

function pushRecent(type, id) {
  if (!type || !id || type === "search" || type === "liked" || type === "genre") return;
  const items = (Store.get("recentItems") || []).filter(
    (it) => !(it.type === type && it.id === id)
  );
  items.unshift({ type, id });
  Store.set("recentItems", items.slice(0, 8));
}

/* --------------------------- menu contextual ------------------------ */

let ctxActions = [];

function showContextMenu(x, y, kind, ref) {
  const menu = $("#context-menu");
  ctxActions = [];
  const push = (label, act, iconName) => ctxActions.push({ label, act, iconName });

  if (kind === "track") {
    const s = DB.song(ref);
    if (!s) return;
    const ar = DB.artist(s.artistId);
    const al = DB.album(s.albumId);
    push("Reproducir", () => playSong(ref, Player.queue.length ? Player.queue : [ref], Player.context));
    push("Añadir a la cola", () => addToQueue(ref));
    push(isLiked(ref) ? "Quitar de tus me gusta" : "Guardar en tus me gusta", () => toggleLike(ref));
    push("Añadir a playlist", () => openAddToPlaylist(ref));
    if (ar) push("Ir al artista", () => (location.hash = `#/artist/${ar.id}`));
    if (al) push("Ir al álbum", () => (location.hash = `#/album/${al.id}`));
    push("Compartir", () => openShare("track", ref));
  } else if (kind === "card") {
    const [type, id] = ref.split(":");
    if (type === "playlist" && id === "liked") {
      push("Reproducir", () => playCollection("liked", "liked"));
      push("Ir a la playlist", () => (location.hash = "#/liked"));
      return renderContextMenu(menu, x, y);
    }
    const info = infoOf(type, id);
    if (!info) return;
    push("Reproducir", () => playCollection(type, id));
    push("Aleatorio", () => playCollection(type, id, true));
    push("Ir a la página", () => (location.hash = `#/${type}/${id}`));
    if (type === "playlist") {
      if (DB.isCustomPlaylist(id)) {
        push("Agregar canciones", () => openAddSongs(id));
      }
      push("Guardar en tu biblioteca", () => toast("Playlist guardada en tu biblioteca (demo)"));
    }
    if (type === "album") {
      const saved = (Store.get("savedAlbums") || []).includes(id);
      push(saved ? "Quitar de tu biblioteca" : "Guardar en tu biblioteca", () => toggleSavedAlbum(id));
    }
    if (type === "artist") {
      const saved = (Store.get("savedArtists") || []).includes(id);
      push(saved ? "Dejar de seguir" : "Seguir artista", () => toggleSavedArtist(id));
    }
    push("Compartir", () => openShare(type, id));
    if (type === "playlist" && DB.isCustomPlaylist(id)) {
      push("Eliminar playlist", () => openDeletePlaylist(id));
    }
  }

  renderContextMenu(menu, x, y);
}

function renderContextMenu(menu, x, y) {
  menu.innerHTML = ctxActions
    .map(
      (it) =>
        `<button class="flex w-full items-center gap-3 whitespace-nowrap rounded-md px-3 py-2.5 text-left text-sm font-medium text-white/90 hover:bg-white/10" data-ctx-item>
          ${it.iconName ? `<span class="text-[16px] text-subtle">${icon(it.iconName)}</span>` : ""}
          <span>${esc(it.label)}</span>
        </button>`
    )
    .join("");
  injectIcons(menu);
  menu.classList.remove("hidden");
  const mw = menu.offsetWidth || 240;
  const mh = menu.offsetHeight || 220;
  menu.style.left = Math.max(8, Math.min(x, window.innerWidth - mw - 8)) + "px";
  menu.style.top = Math.max(8, Math.min(y, window.innerHeight - mh - 8)) + "px";
  menu.classList.add("anim-fade");
}

function hideContextMenu() {
  $("#context-menu").classList.add("hidden");
}

function addToQueue(songId) {
  if (!Player.queue.length) {
    playSong(songId, [songId], Player.context);
    return;
  }
  Player.queue.splice(Player.index + 1, 0, songId);
  toast("Se agregó a la cola");
  if (isQueueOpen()) renderQueuePanel();
}

/* -------------------------------- toast ----------------------------- */

let toastTimer = null;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("opacity-100");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("opacity-100"), 2400);
}

/* ------------------------------ modales ----------------------------- */

let modalPreviousFocus = null;

function openModal(html, onMount) {
  const root = $("#modal-root");
  const card = $("#modal-card");
  modalPreviousFocus = document.activeElement;
  card.innerHTML = html;
  injectIcons(card);
  root.classList.remove("hidden");
  root.classList.add("flex");
  root.setAttribute("aria-hidden", "false");
  $$("[data-modal-close]", card).forEach((btn) => btn.addEventListener("click", closeModal));
  const first = card.querySelector("input, select, button");
  if (first) setTimeout(() => first.focus({ preventScroll: true }), 30);
  if (onMount) onMount(card);
}

function closeModal() {
  const root = $("#modal-root");
  root.classList.add("hidden");
  root.classList.remove("flex");
  root.setAttribute("aria-hidden", "true");
  $("#modal-card").innerHTML = "";
  if (modalPreviousFocus && modalPreviousFocus.focus) {
    modalPreviousFocus.focus({ preventScroll: true });
  }
}

function modalHeader(title, sub = "") {
  return `<div class="mb-5 flex items-start justify-between gap-4">
      <div>
        <h2 class="text-xl font-black text-white">${esc(title)}</h2>
        ${sub ? `<p class="mt-1 text-sm text-subtle">${esc(sub)}</p>` : ""}
      </div>
      <button class="rounded-full p-2 text-subtle transition hover:bg-white/10 hover:text-white" data-modal-close aria-label="Cerrar">
        <span class="block text-[18px]">${icon("close")}</span>
      </button>
    </div>`;
}

function persistPlaylists() {
  Store.set(
    "playlists",
    DB.userPlaylists.map((p) => ({ ...p, songIds: [...p.songIds] }))
  );
}

function openCreatePlaylist() {
  const grads = ["ep5", "ep2", "ep1", "ep17", "ep20", "ep23"];
  openModal(
    `${modalHeader("Crear playlist", "Dale un nombre y una descripción. Se guardará en tu biblioteca.")}
      <form id="create-playlist-form" class="space-y-3">
        <div class="flex items-center gap-4 rounded-lg bg-black/30 p-3">
          <span id="new-pl-cover" class="flex h-20 w-20 shrink-0 items-center justify-center rounded text-3xl" style="background-image:${gradCss(
            grads[Math.floor(Math.random() * grads.length)]
          )}">🎵</span>
          <div class="min-w-0">
            <p class="text-sm font-bold">Nueva playlist</p>
            <p class="text-xs text-subtle">Creada por ${esc((Store.get("profile") || {}).name || "ti")}</p>
          </div>
        </div>
        <label class="block">
          <span class="text-xs font-semibold text-subtle">Nombre *</span>
          <input id="new-pl-name" type="text" maxlength="60" placeholder="Mi playlist increíble"
            class="mt-1 w-full rounded-md border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-white placeholder:text-faint focus:border-white focus:outline-none" />
        </label>
        <label class="block">
          <span class="text-xs font-semibold text-subtle">Descripción</span>
          <textarea id="new-pl-desc" rows="2" maxlength="120" placeholder="¿De qué trata esta playlist?"
            class="mt-1 w-full resize-none rounded-md border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-white placeholder:text-faint focus:border-white focus:outline-none"></textarea>
        </label>
        <label class="flex items-center gap-3 text-xs text-subtle">
          <input type="checkbox" id="new-pl-public" class="switch" />
          Hacer pública (simulado)
        </label>
        <div class="flex justify-end gap-2 pt-1">
          <button type="button" class="rounded-full px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10" data-modal-close>Cancelar</button>
          <button type="submit" class="rounded-full bg-white px-6 py-2.5 text-sm font-black text-black transition hover:scale-105">Crear</button>
        </div>
      </form>`,
    (card) => {
      const form = card.querySelector("#create-playlist-form");
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = card.querySelector("#new-pl-name").value.trim();
        if (!name) {
          toast("Escribe un nombre para la playlist");
          return;
        }
        const desc = card.querySelector("#new-pl-desc").value.trim() || "Playlist creada por ti.";
        const grad = grads[Math.floor(Math.random() * grads.length)];
        const playlist = {
          id: "pl-user-" + Date.now().toString(36),
          name,
          desc,
          owner: (Store.get("profile") || {}).name || "Tú",
          grad,
          emoji: emojiFor(name),
          songIds: [],
        };
        DB.userPlaylists.push(playlist);
        persistPlaylists();
        closeModal();
        renderSidebarLib();
        location.hash = "#/playlist/" + playlist.id;
        toast(`Playlist «${name}» creada`);
      });
    }
  );
}

function openAddToPlaylist(songId) {
  const song = DB.song(songId);
  if (!song) return;
  const rows = DB.userPlaylists
    .map(
      (p) => `<button class="flex w-full items-center gap-3 rounded-md p-2 text-left transition hover:bg-white/10" data-add-to="${p.id}">
        <span class="h-10 w-10 shrink-0 rounded bg-cover bg-center" style="background-image:${coverCss(p)}"></span>
        <span class="min-w-0 flex-1">
          <span class="block truncate text-sm font-semibold">${esc(p.name)}</span>
          <span class="block text-xs text-subtle">${p.songIds.length} canciones</span>
        </span>
        <span class="text-lg text-subtle">${icon("plus")}</span>
      </button>`
    )
    .join("");

  openModal(
    `${modalHeader("Añadir a playlist", `Elige dónde guardar «${song.title}».`)}
      <div class="max-h-72 space-y-1 overflow-y-auto scroll-area">${rows}</div>
      <div class="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
        <p class="text-xs text-subtle">¿No encuentras la playlist?</p>
        <button class="rounded-full border border-white/30 px-4 py-2 text-xs font-bold transition hover:border-white" data-new-playlist>Crear nueva</button>
      </div>`,
    (card) => {
      card.querySelectorAll("[data-add-to]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const pl = DB.playlist(btn.getAttribute("data-add-to"));
          if (!pl) return;
          const already = pl.songIds.includes(songId);
          if (!already) pl.songIds.push(songId);
          persistPlaylists();
          closeModal();
          toast(already ? `Ya estaba en «${pl.name}»` : `Agregada a «${pl.name}»`);
        });
      });
      card.querySelector("[data-new-playlist]").addEventListener("click", () => {
        closeModal();
        setTimeout(openCreatePlaylist, 120);
      });
    }
  );
}

function openAddSongs(playlistId) {
  const pl = DB.playlist(playlistId);
  if (!pl) return;
  const rowHtml = DB.songs
    .map((s) => {
      const ar = DB.artist(s.artistId);
      const al = DB.album(s.albumId);
      const added = pl.songIds.includes(s.id);
      return `<button class="flex w-full items-center gap-3 rounded-md p-2 text-left transition hover:bg-white/10 ${added ? "opacity-50" : ""}" data-song-add="${s.id}" ${added ? "disabled" : ""}>
          <span class="h-9 w-9 shrink-0 rounded bg-cover bg-center" style="background-image:${coverCss(al || { grad: "ep1" })}"></span>
          <span class="min-w-0 flex-1">
            <span class="block truncate text-sm font-medium">${esc(s.title)}</span>
            <span class="block truncate text-xs text-subtle">${esc(ar ? ar.name : "")}</span>
          </span>
          <span class="text-xs text-subtle">${added ? "Añadida" : icon("plus")}</span>
        </button>`;
    })
    .join("");

  openModal(
    `${modalHeader("Agregar canciones", pl.name)}
      <div class="mb-3 flex items-center gap-2 rounded-full bg-white/10 px-3 py-2">
        <span class="text-[16px] text-subtle">${icon("search")}</span>
        <input id="add-songs-search" type="search" placeholder="Buscar canciones..."
          class="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-subtle focus:outline-none" />
      </div>
      <div id="add-songs-list" class="max-h-[50vh] space-y-1 overflow-y-auto scroll-area">${rowHtml}</div>`,
    (card) => {
      const list = card.querySelector("#add-songs-list");
      const search = card.querySelector("#add-songs-search");
      search.addEventListener("input", () => {
        const q = normalizeText(search.value);
        list.querySelectorAll("[data-song-add]").forEach((btn) => {
          const song = DB.song(btn.getAttribute("data-song-add"));
          const ar = DB.artist(song.artistId);
          const hay = normalizeText(`${song.title} ${ar ? ar.name : ""}`);
          btn.classList.toggle("hidden", q && !hay.includes(q));
        });
      });
      list.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-song-add]");
        if (!btn || btn.disabled) return;
        const sid = btn.getAttribute("data-song-add");
        if (!pl.songIds.includes(sid)) pl.songIds.push(sid);
        btn.disabled = true;
        btn.classList.add("opacity-50");
        btn.querySelector("span:last-child").textContent = "Añadida";
        persistPlaylists();
        toast("Canción agregada");
      });
    }
  );
}

function openCheckout(planId) {
  const plan = DB.plan(planId);
  if (!plan) return;
  const billing = Store.get("premiumBilling") || "monthly";
  const current = Store.get("plan") || "free";

  openModal(
    `${modalHeader("Confirmar tu plan", "Pago simulado para esta demo académica.")}
      <div class="rounded-lg border border-white/10 bg-black/30 p-4">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span class="text-2xl">${plan.emoji}</span>
            <div>
              <p class="text-sm font-black">${esc(plan.name)}</p>
              <p class="text-xs text-subtle">${esc(plan.tagline)}</p>
            </div>
          </div>
          <p class="text-right text-xl font-black">${planPriceText(plan, billing)}</p>
        </div>
        <ul class="mt-4 space-y-1.5 border-t border-white/10 pt-4 text-xs text-white/80">
          ${plan.features
            .slice(0, 3)
            .map((f) => `<li class="flex gap-2"><span class="text-spotify">${icon("check")}</span>${esc(f)}</li>`)
            .join("")}
        </ul>
      </div>

      <div class="mt-4 rounded-lg border border-white/10 bg-white/[0.04] p-4">
        <p class="text-xs font-bold uppercase tracking-wide text-subtle">Método de pago</p>
        <label class="mt-3 block">
          <span class="text-[11px] text-subtle">Nombre en la tarjeta</span>
          <input type="text" value="${esc((Store.get("profile") || {}).name || "")}"
            class="mt-1 w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm text-white focus:border-white focus:outline-none" />
        </label>
        <label class="mt-2 block">
          <span class="text-[11px] text-subtle">Número de tarjeta</span>
          <input type="text" inputmode="numeric" value="4242 4242 4242 4242"
            class="mt-1 w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm text-white focus:border-white focus:outline-none" />
        </label>
        <div class="mt-2 grid grid-cols-2 gap-2">
          <label class="block"><span class="text-[11px] text-subtle">Vence</span>
            <input type="text" value="12/30" class="mt-1 w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm text-white focus:border-white focus:outline-none" />
          </label>
          <label class="block"><span class="text-[11px] text-subtle">CVC</span>
            <input type="text" value="123" class="mt-1 w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm text-white focus:border-white focus:outline-none" />
          </label>
        </div>
        <p class="mt-2 flex items-start gap-1.5 text-[10px] leading-relaxed text-faint">
          ${icon("info")} No se realizará ningún cobro. Los datos no se envían a ningún servidor.
        </p>
      </div>

      <div class="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
        <button class="rounded-full px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10" data-modal-close>Cancelar</button>
        <button class="rounded-full bg-spotify px-6 py-2.5 text-sm font-black text-black transition hover:scale-105 hover:bg-spotify-hover" id="confirm-checkout">
          ${current === planId ? "Renovar plan" : "Confirmar y activar"} · ${planPriceText(plan, billing).replace(/<[^>]+>/g, "")}
        </button>
      </div>
      <p class="mt-2 text-center text-[10px] text-faint">Puedes volver al plan Free desde Cuenta cuando quieras.</p>`,
    (card) => {
      card.querySelector("#confirm-checkout").addEventListener("click", () => {
        Store.set("plan", planId);
        closeModal();
        updateAccountUI();
        renderRoute();
        toast(`¡Bienvenido a ${plan.name}! (demo)`);
      });
    }
  );
}

function openCancelPlan() {
  const plan = DB.plan(Store.get("plan"));
  openModal(
    `${modalHeader("Volver al plan Free", "Perderás las ventajas Premium simuladas.")}
      <p class="text-sm leading-relaxed text-subtle">Tu plan actual es <strong class="text-white">${esc(
        plan ? plan.name : "Premium"
      )}</strong>. Si vuelves a Free podrás seguir escuchando música con anuncios simulados.</p>
      <div class="mt-6 flex justify-end gap-2">
        <button class="rounded-full px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10" data-modal-close>Mantener Premium</button>
        <button class="rounded-full bg-white px-6 py-2.5 text-sm font-black text-black transition hover:scale-105" id="confirm-cancel-plan">Volver a Free</button>
      </div>`,
    (card) => {
      card.querySelector("#confirm-cancel-plan").addEventListener("click", () => {
        Store.set("plan", "free");
        closeModal();
        updateAccountUI();
        renderRoute();
        toast("Ahora estás en el plan Free");
      });
    }
  );
}

function openDevices() {
  const rows = DB.devices
    .map(
      (d, i) => `<button class="flex w-full items-center gap-3 rounded-md p-3 text-left transition hover:bg-white/10" data-device="${i}">
        <span class="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-[20px] text-white">${icon(d.icon)}</span>
        <span class="min-w-0 flex-1">
          <span class="block truncate text-sm font-semibold">${esc(d.name)}</span>
          <span class="block text-xs text-subtle">${esc(d.type)}</span>
        </span>
        ${d.active ? `<span class="text-xs font-bold text-spotify">Activo</span>` : `<span class="text-xs text-subtle">Conectar</span>`}
      </button>`
    )
    .join("");
  openModal(
    `${modalHeader("Conectar a un dispositivo", "Selecciona dónde quieres reproducir.")}
      <div class="space-y-1">${rows}</div>
      <p class="mt-4 text-center text-[10px] text-faint">La transferencia es simulada.</p>`,
    (card) => {
      card.querySelectorAll("[data-device]").forEach((btn) => {
        btn.addEventListener("click", () => {
          DB.devices.forEach((d, i) => (d.active = i === Number(btn.getAttribute("data-device"))));
          closeModal();
          toast("Dispositivo conectado (demo)");
        });
      });
    }
  );
}

function openInstall() {
  openModal(
    `${modalHeader("Instalar Spotify Clone", "Atajo rápido para esta demo académica.")}
      <div class="rounded-lg bg-black/30 p-4 text-sm leading-relaxed text-subtle">
        <p>Este clon no tiene instalador real. Puedes crear un acceso directo:</p>
        <ol class="mt-3 list-decimal space-y-2 pl-5 text-white/80">
          <li>Abre el menú de tu navegador.</li>
          <li>Elige «Instalar aplicación» o «Crear acceso directo».</li>
          <li>Se abrirá en una ventana independiente.</li>
        </ol>
      </div>
      <div class="mt-5 flex justify-end">
        <button class="rounded-full bg-white px-6 py-2.5 text-sm font-black text-black" data-modal-close>Entendido</button>
      </div>`
  );
}

function openShare(kind, id) {
  let title = "Spotify Clone";
  let url = location.href;
  if (kind === "track") {
    const s = DB.song(id);
    if (s) {
      title = s.title + " · " + DB.artist(s.artistId).name;
      url = location.origin + location.pathname + "#/album/" + s.albumId;
    }
  } else {
    const info = infoOf(kind, id);
    if (info) title = info.name;
    url = location.origin + location.pathname + `#/${kind}/${id}`;
  }
  openModal(
    `${modalHeader("Compartir", "Copia el enlace de esta demo.")}
      <div class="rounded-lg bg-black/30 p-4">
        <p class="text-sm font-bold text-white">${esc(title)}</p>
        <p class="mt-1 break-all text-xs text-subtle">${esc(url)}</p>
      </div>
      <div class="mt-5 flex justify-end gap-2">
        <button class="rounded-full px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10" data-modal-close>Cerrar</button>
        <button class="rounded-full bg-white px-6 py-2.5 text-sm font-black text-black transition hover:scale-105" id="copy-share">Copiar enlace</button>
      </div>`,
    (card) => {
      card.querySelector("#copy-share").addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(url);
          toast("Enlace copiado (demo)");
        } catch (err) {
          toast("No se pudo copiar, pero aquí está el enlace");
        }
        closeModal();
      });
    }
  );
}

function openDeletePlaylist(id) {
  const pl = DB.playlist(id);
  if (!pl) return;
  openModal(
    `${modalHeader("Eliminar playlist", "Esta acción no se puede deshacer.")}
      <p class="text-sm text-subtle">¿Seguro que quieres eliminar <strong class="text-white">${esc(pl.name)}</strong> de tu biblioteca?</p>
      <div class="mt-6 flex justify-end gap-2">
        <button class="rounded-full px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10" data-modal-close>Cancelar</button>
        <button class="rounded-full bg-[#e91429] px-6 py-2.5 text-sm font-black text-white transition hover:scale-105" id="confirm-delete">Eliminar</button>
      </div>`,
    (card) => {
      card.querySelector("#confirm-delete").addEventListener("click", () => {
        DB.userPlaylists = DB.userPlaylists.filter((p) => p.id !== id);
        persistPlaylists();
        closeModal();
        renderSidebarLib();
        location.hash = "#/library";
        toast("Playlist eliminada");
      });
    }
  );
}

function openLogout() {
  openModal(
    `${modalHeader("Cerrar sesión", "Tu progreso local se conserva.")}
      <p class="text-sm text-subtle">Al cerrar sesión volverás a la pantalla de inicio. Esta demo no tiene autenticación real, así que puedes seguir usando la app.</p>
      <div class="mt-6 flex justify-end gap-2">
        <button class="rounded-full px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10" data-modal-close>Cancelar</button>
        <button class="rounded-full bg-white px-6 py-2.5 text-sm font-black text-black transition hover:scale-105" id="confirm-logout">Cerrar sesión</button>
      </div>`,
    (card) => {
      card.querySelector("#confirm-logout").addEventListener("click", () => {
        closeModal();
        location.hash = "#/";
        toast("Sesión cerrada (demo)");
      });
    }
  );
}

/* ---------------------- guardados / preferencias --------------------- */

function toggleSavedAlbum(id) {
  const saved = [...(Store.get("savedAlbums") || [])];
  const idx = saved.indexOf(id);
  if (idx >= 0) {
    saved.splice(idx, 1);
    toast("Álbum eliminado de tu biblioteca");
  } else {
    saved.push(id);
    toast("Álbum guardado en tu biblioteca");
  }
  Store.set("savedAlbums", saved);
  renderSidebarLib();
  if (parseHash().name === "album" || parseHash().name === "library") rerenderKeepScroll();
}

function toggleSavedArtist(id) {
  const saved = [...(Store.get("savedArtists") || [])];
  const idx = saved.indexOf(id);
  if (idx >= 0) {
    saved.splice(idx, 1);
    toast("Dejaste de seguir al artista");
  } else {
    saved.push(id);
    toast("Ahora sigues al artista");
  }
  Store.set("savedArtists", saved);
  renderSidebarLib();
  if (parseHash().name === "artist") rerenderKeepScroll();
}

/* ------------------------- UI del reproductor ----------------------- */

function emitPlayerChange() {
  window.dispatchEvent(new CustomEvent("spotify:playerchange"));
}

function toggleBtnActive(selector, on) {
  const el = $(selector);
  if (el) {
    el.classList.toggle("text-[#1db954]", on);
    el.classList.toggle("text-faint", !on);
    el.classList.toggle("text-white", false);
  }
}

function coverBackgroundOf(songId) {
  const s = songId ? DB.song(songId) : null;
  const album = s && s.albumId ? DB.album(s.albumId) : null;
  return coverCss(album || { grad: "ep1" });
}

function renderPlayerUI() {
  const s = Player.song;
  const album = s && s.albumId ? DB.album(s.albumId) : null;
  const cover = coverBackgroundOf(s ? s.id : null);
  ["#player-cover", "#mini-cover", "#now-cover"].forEach((sel) => {
    const el = $(sel);
    if (el) el.style.backgroundImage = cover;
  });

  const nowPlaying = $("#now-playing");
  if (nowPlaying) {
    const art = album ? coverImage(album) : "";
    nowPlaying.style.backgroundImage = art
      ? `linear-gradient(180deg, rgba(0,0,0,.5), rgba(18,18,18,.92)), url('${art}')`
      : "";
    nowPlaying.style.backgroundSize = "cover";
    nowPlaying.style.backgroundPosition = "center";
  }

  const title = s ? s.title : "Sin canción";
  const artist = s && s.artistId ? DB.artist(s.artistId).name : "Elige una canción para empezar";

  $("#player-title").textContent = title;
  $("#player-artist").textContent = artist;
  $("#player-title").onclick = () => s && (location.hash = `#/album/${s.albumId}`);
  $("#player-artist").onclick = () => s && (location.hash = `#/artist/${s.artistId}`);
  $("#player-track-cover").onclick = () => s && (location.hash = `#/album/${s.albumId}`);

  $("#mini-title").textContent = title;
  $("#mini-artist").textContent = artist;
  $("#now-title").textContent = title;
  $("#now-artist").textContent = artist;
  $("#now-context").textContent = Player.context.label || "Clon de Spotify";

  updatePlayerIcons();
  updateProgressUI();
  ["#player-like", "#now-like"].forEach((sel) => {
    const el = $(sel);
    if (el) el.setAttribute("data-like-btn", s ? s.id : "");
  });
  renderLikeButtons();
  updateAccountUI();
}

function updatePlayerIcons() {
  const ic = Player.playing ? "pause" : "play";
  const off = ic === "play" ? "ml-0.5" : "ml-0";
  $("#player-play").innerHTML = `<span class="${off} flex h-5 w-5 items-center justify-center text-[20px]">${icon(ic)}</span>`;
  $("#mini-play-ic").innerHTML = `<span class="flex h-6 w-6 items-center justify-center text-[20px]">${icon(ic)}</span>`;
  $("#now-play").innerHTML = `<span class="${
    off === "ml-0.5" ? "ml-1" : "ml-0"
  } flex h-8 w-8 items-center justify-center text-[28px]">${icon(ic)}</span>`;
  const mute = $("#player-mute");
  if (mute) {
    mute.innerHTML = `<span class="block text-[18px]">${icon(
      Player.muted || Player.volume === 0 ? "volume-off" : "volume"
    )}</span>`;
    mute.setAttribute("aria-label", Player.muted || Player.volume === 0 ? "Activar sonido" : "Silenciar");
  }
  toggleBtnActive("#now-shuffle", Player.shuffle);
}

function updateProgressUI() {
  const dur = Player.song ? Player.song.duration : 0;
  const pct = dur ? Math.round((Player.currentTime / dur) * 100) : 0;
  [
    ["#player-progress", "#player-time", "#player-duration"],
    ["#now-progress", "#now-time", "#now-duration"],
  ].forEach(([sliderSel, tSel, dSel]) => {
    const sl = $(sliderSel);
    if (sl) {
      sl.value = pct;
      sl.style.setProperty("--fill", pct + "%");
    }
    if ($(tSel)) $(tSel).textContent = fmtTime(Player.currentTime);
    if ($(dSel)) $(dSel).textContent = fmtTime(dur);
  });
  const miniProgress = $("#mini-progress");
  if (miniProgress) miniProgress.style.width = pct + "%";
  toggleBtnActive("#player-shuffle", Player.shuffle);
  toggleBtnActive("#player-repeat", Player.repeat);
  toggleBtnActive("#now-shuffle", Player.shuffle);
  toggleBtnActive("#now-repeat", Player.repeat);
}

function setActiveTrackRow() {
  $$(".track").forEach((row) => {
    const id = row.getAttribute("data-track");
    const active = Player.song && Player.song.id === id;
    const num = row.querySelector(".idx-num");
    if (!num) return;
    const play = row.querySelector(".idx-play");
    const eq = row.querySelector(".idx-eq");
    row.classList.toggle("track-active", active);
    if (active) {
      row.classList.add("text-white");
      num.classList.toggle("hidden", Player.playing);
      if (play) play.classList.add("hidden");
      if (eq) eq.classList.toggle("hidden", !Player.playing);
    } else {
      row.classList.remove("text-white");
      num.classList.remove("hidden");
      if (play) play.classList.remove("hidden");
      if (eq) eq.classList.add("hidden");
    }
  });
}

/* --------------------------- biblioteca (aside) --------------------- */

function renderSidebarLib() {
  const list = $("#sidebar-library-list");
  if (!list) return;

  const items = libraryItems().filter((it) => {
    if (sidebarLibState.filter !== "all") {
      const matchesFilter =
        it.type === sidebarLibState.filter ||
        (sidebarLibState.filter === "playlist" && it.type === "liked");
      if (!matchesFilter) return false;
    }
    if (
      sidebarLibState.query &&
      !normalizeText(`${it.name} ${it.sub}`).includes(normalizeText(sidebarLibState.query))
    )
      return false;
    return true;
  });

  if (!items.length) {
    list.innerHTML = `<div class="rounded-md border border-white/10 p-4 text-center">
        <p class="text-sm font-bold">Sin resultados</p>
        <p class="mt-1 text-xs text-subtle">Prueba con otro filtro o crea una playlist.</p>
        <button class="mt-3 rounded-full bg-white px-4 py-1.5 text-xs font-black text-black" data-create-playlist>Crear playlist</button>
      </div>`;
    injectIcons(list);
    return;
  }

  list.innerHTML = items
    .map((it) => {
      const link = it.type === "liked" ? "liked" : `${it.type}/${it.id}`;
      const artItem = it.item || { id: it.id, grad: it.grad, emoji: it.emoji, name: it.name };
      const art = it.type === "liked" ? "" : coverImage(artItem);
      const cover =
        it.type === "liked"
          ? `<span class="flex h-11 w-11 shrink-0 items-center justify-center rounded text-lg" style="background-image:${gradCss("ep6")}">💚</span>`
          : `<span class="block h-11 w-11 shrink-0 overflow-hidden bg-cover bg-center ${
              it.round ? "rounded-full" : "rounded"
            }" style="background-image:${coverCss(artItem)}">
              ${
                art
                  ? ""
                  : `<span class="flex h-full w-full items-center justify-center text-[16px] font-black text-white/90">${
                      it.type === "playlist" ? it.emoji || emojiFor(it.id) : esc(initials(it.name))
                    }</span>`
              }
            </span>`;
      return `<div class="group flex w-full cursor-pointer items-center gap-3 rounded-md p-2 transition hover:bg-white/10" data-link="${link}">
        ${cover}
        <div class="sidebar-word min-w-0 leading-tight">
          <p class="truncate text-sm font-medium text-white">${esc(it.name)}</p>
          <p class="truncate text-xs text-subtle">${esc(it.sub)}</p>
        </div>
      </div>`;
    })
    .join("");
  injectIcons(list);
}

function renderSidebarFilters() {
  $$("#sidebar-library .lib-chip").forEach((chip) => {
    const on = chip.getAttribute("data-lib-filter") === sidebarLibState.filter;
    chip.classList.toggle("bg-white", on);
    chip.classList.toggle("text-black", on);
    chip.classList.toggle("bg-white/10", !on);
    chip.classList.toggle("text-white", !on);
  });
}

/* --------------------------- cuenta / plan -------------------------- */

function updateAccountUI() {
  const profile = Store.get("profile") || {};
  const plan = Store.get("plan") || "free";
  const isPremium = plan !== "free";

  const avatar = $("#profile-avatar");
  if (avatar) {
    avatar.textContent = initials(profile.name || "MP");
    avatar.style.backgroundImage = gradCss(profile.grad || "ep8");
  }
  const name = $("#profile-menu-name");
  if (name) name.textContent = profile.name || "Usuario";
  const planLine = $("#profile-menu-plan");
  if (planLine) {
    planLine.innerHTML = `${isPremium ? `<span class="text-spotify">${icon("premium")}</span>` : ""} ${
      isPremium ? esc(planName(plan)) : "Plan Free"
    }`;
  }
  const premiumBtn = $("#btn-premium");
  if (premiumBtn) {
    premiumBtn.innerHTML = isPremium
      ? `<span class="inline-flex items-center gap-1.5">${icon("check-circle")} Premium activo</span>`
      : "Explorar Premium";
  }
}

/* --------------------------- notificaciones ------------------------- */

function renderNotifPanel() {
  const panel = $("#notif-panel");
  if (!panel) return;
  panel.innerHTML = `<div class="flex items-center justify-between px-2 pb-2 pt-1">
      <h3 class="text-sm font-black">Novedades</h3>
      <button class="text-[11px] font-bold text-subtle hover:text-white" data-notif-read>Marcar leídas</button>
    </div>
    ${DB.notifications
      .map(
        (n) => `<button class="flex w-full items-start gap-3 rounded-md p-2 text-left transition hover:bg-white/10" data-notif-link="${n.link}">
          <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-[16px] text-spotify">${icon(
            n.icon
          )}</span>
          <span class="min-w-0">
            <span class="block text-sm font-semibold leading-snug">${esc(n.title)}</span>
            <span class="mt-0.5 block text-xs leading-snug text-subtle">${esc(n.body)}</span>
            <span class="mt-1 block text-[10px] text-faint">${esc(n.time)}</span>
          </span>
        </button>`
      )
      .join("")}`;
  injectIcons(panel);
}

/* --------------------------- cola de reproducción ------------------- */

function isQueueOpen() {
  const panel = $("#queue-panel");
  return panel && !panel.classList.contains("translate-x-full");
}

function openQueue(tab = "queue") {
  queueState.tab = tab;
  const panel = $("#queue-panel");
  if (!panel) return;
  panel.classList.remove("translate-x-full");
  panel.setAttribute("aria-hidden", "false");
  renderQueuePanel();
  if (window.innerWidth < 1024) panel.classList.add("shadow-2xl");
}

function closeQueue() {
  const panel = $("#queue-panel");
  if (!panel) return;
  panel.classList.add("translate-x-full");
  panel.setAttribute("aria-hidden", "true");
}

function toggleQueue(tab = "queue") {
  if (isQueueOpen() && queueState.tab === tab) closeQueue();
  else openQueue(tab);
}

function renderQueuePanel() {
  const content = $("#queue-content");
  if (!content) return;
  content.innerHTML = queueHtml();
  injectIcons(content);
  $$("#queue-panel .queue-tab").forEach((btn) => {
    const on = btn.getAttribute("data-queue-tab") === queueState.tab;
    btn.classList.toggle("bg-white", on);
    btn.classList.toggle("text-black", on);
    btn.classList.toggle("bg-white/10", !on);
    btn.classList.toggle("text-white", !on);
  });
}

/* --------------------------- navegación (shell) --------------------- */

function initShell() {
  injectIcons(document);
}

function initSidebarTabs() {
  $$("#sidebar-library .lib-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      sidebarLibState.filter = chip.getAttribute("data-lib-filter");
      renderSidebarFilters();
      renderSidebarLib();
    });
  });
  $("#lib-search")?.addEventListener("click", () => {
    const wrap = $("#lib-search-wrap");
    wrap.classList.toggle("hidden");
    if (!wrap.classList.contains("hidden")) $("#lib-search-input").focus();
  });
  $("#lib-search-input")?.addEventListener("input", (e) => {
    sidebarLibState.query = e.target.value;
    renderSidebarLib();
  });
  $("#lib-create")?.addEventListener("click", openCreatePlaylist);
}

function initSidebarCollapse() {
  const btn = $("#lib-collapse-btn");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const aside = $("#sidebar");
    aside.classList.toggle("collapsed");
    const collapsed = aside.classList.contains("collapsed");
    btn.title = collapsed ? "Expandir barra lateral" : "Contraer barra lateral";
    btn.setAttribute("aria-label", btn.title);
  });
}

function initProfileMenu() {
  const btn = $("#profile-btn");
  const menu = $("#profile-menu");
  if (!btn || !menu) return;
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.toggle("hidden");
    $("#notif-panel")?.classList.add("hidden");
  });
  document.addEventListener("click", (e) => {
    if (!menu.contains(e.target) && !btn.contains(e.target)) menu.classList.add("hidden");
  });
  menu.addEventListener("click", (e) => {
    const link = e.target.closest("[data-link]");
    if (link) {
      navigateTo(link.getAttribute("data-link"));
      menu.classList.add("hidden");
      return;
    }
    if (e.target.closest("[data-action='logout']")) {
      menu.classList.add("hidden");
      openLogout();
    }
  });
}

function initNotifications() {
  const btn = $("#btn-notif");
  const panel = $("#notif-panel");
  if (!btn || !panel) return;
  renderNotifPanel();
  const dot = $("#notif-dot");
  if (Store.get("notificationsRead")) dot?.classList.add("hidden");

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    panel.classList.toggle("hidden");
    $("#profile-menu")?.classList.add("hidden");
    if (!panel.classList.contains("hidden")) {
      Store.set("notificationsRead", true);
      dot?.classList.add("hidden");
    }
  });
  document.addEventListener("click", (e) => {
    if (!panel.contains(e.target) && !btn.contains(e.target)) panel.classList.add("hidden");
  });
  panel.addEventListener("click", (e) => {
    if (e.target.closest("[data-notif-read]")) {
      Store.set("notificationsRead", true);
      dot?.classList.add("hidden");
      toast("Notificaciones marcadas como leídas");
      return;
    }
    const link = e.target.closest("[data-notif-link]");
    if (link) {
      panel.classList.add("hidden");
      navigateTo(link.getAttribute("data-notif-link"));
    }
  });
}

function initBackForward() {
  $("#btn-back")?.addEventListener("click", () => {
    if (navIdx > 0) {
      navIdx--;
      location.hash = navHist[navIdx];
    }
  });
  $("#btn-forward")?.addEventListener("click", () => {
    if (navIdx < navHist.length - 1) {
      navIdx++;
      location.hash = navHist[navIdx];
    }
  });
}

function initHeaderSearch() {
  const header = $("#global-search");
  if (!header) return;
  header.addEventListener("input", () => handleHeaderSearchInput(header.value));
  header.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      recordSearch(header.value);
      if (parseHash().name === "search") refreshSearchResults();
    }
    if (e.key === "Escape") {
      header.value = "";
      searchState.query = "";
      if (parseHash().name === "search") refreshSearchResults();
      header.blur();
    }
  });
  $("#header-search")?.addEventListener("click", () => {
    $("#global-search")?.focus();
    if (parseHash().name !== "search" && !searchState.query) {
      // No navegar solo con enfocar: se navega al escribir.
    }
  });
}

function initActions() {
  $("#btn-install")?.addEventListener("click", openInstall);
  $("#btn-premium")?.addEventListener("click", (e) => {
    e.preventDefault();
    location.hash = "#/premium";
  });
  $("#player-queue")?.addEventListener("click", () => toggleQueue("queue"));
  $("#now-queue")?.addEventListener("click", () => {
    closeNowPlaying();
    openQueue("queue");
  });
  $("#player-devices")?.addEventListener("click", openDevices);
  $("#queue-close")?.addEventListener("click", closeQueue);
  $$("#queue-panel .queue-tab").forEach((btn) =>
    btn.addEventListener("click", () => {
      queueState.tab = btn.getAttribute("data-queue-tab");
      renderQueuePanel();
    })
  );
  $("#modal-root")?.addEventListener("click", (e) => {
    if (e.target.id === "modal-root") closeModal();
  });
}

/* ----------------------------- now playing -------------------------- */

function openNowPlaying() {
  const np = $("#now-playing");
  np.classList.remove("hidden");
  np.classList.add("flex", "anim-player-up");
  np.setAttribute("aria-hidden", "false");
  renderPlayerUI();
}

function closeNowPlaying() {
  const np = $("#now-playing");
  np.classList.add("hidden");
  np.classList.remove("flex", "anim-player-up");
  np.setAttribute("aria-hidden", "true");
}

/* ------------------------------- teclado ---------------------------- */

function initKeyboard() {
  document.addEventListener("keydown", (e) => {
    const tag = (e.target.tagName || "").toLowerCase();
    const typing = tag === "input" || tag === "textarea" || tag === "select";

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      const input = $("#global-search");
      if (input) {
        input.focus();
        input.select();
      }
      if (parseHash().name !== "search") location.hash = "#/search";
      return;
    }

    if (e.key === "Escape") {
      hideContextMenu();
      closeModal();
      closeQueue();
      $("#notif-panel")?.classList.add("hidden");
      $("#profile-menu")?.classList.add("hidden");
      return;
    }

    if (typing) return;

    if (e.code === "Space") {
      e.preventDefault();
      togglePlay();
    } else if (e.code === "ArrowRight") {
      e.preventDefault();
      seekTo(Player.currentTime + 5);
    } else if (e.code === "ArrowLeft") {
      e.preventDefault();
      seekTo(Player.currentTime - 5);
    } else if (e.code === "ArrowUp") {
      e.preventDefault();
      setVolume(Player.volume + 0.05);
    } else if (e.code === "ArrowDown") {
      e.preventDefault();
      setVolume(Player.volume - 0.05);
    }
  });
}

/* ------------------------------ sidebar ----------------------------- */

function initSidebar() {
  renderSidebarFilters();
  renderSidebarLib();
}

/* -------------------------------- init ------------------------------ */

function init() {
  initShell();
  initSidebar();
  initPlayerUI();
  initBackForward();
  initProfileMenu();
  initNotifications();
  initSidebarTabs();
  initSidebarCollapse();
  initHeaderSearch();
  initActions();
  initKeyboard();
  updateAccountUI();

  $("#view").addEventListener("click", onViewClick);
  $("#view").addEventListener("contextmenu", onViewContext);
  $("#view").addEventListener("scroll", updateHeaderScroll, { passive: true });
  document.addEventListener("click", hideContextMenu);
  $("#context-menu").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-ctx-item]");
    if (btn) {
      const idx = Array.from($$("#context-menu [data-ctx-item]")).indexOf(btn);
      const act = ctxActions[idx];
      if (act) act.act();
    }
    hideContextMenu();
  });

  $("#view").addEventListener("change", (e) => {
    const t = e.target;
    if (t.matches("[data-setting]")) {
      const key = t.getAttribute("data-setting");
      const settings = { ...(Store.get("settings") || {}) };
      settings[key] = t.type === "checkbox" ? t.checked : t.value;
      Store.set("settings", settings);
      toast("Preferencia guardada");
    }
    if (t.id === "setting-quality") {
      const settings = { ...(Store.get("settings") || {}) };
      settings.quality = t.value;
      Store.set("settings", settings);
      toast("Calidad de audio: " + t.value);
    }
  });

  window.addEventListener("hashchange", () => {
    renderRoute();
    renderSidebarLib();
    closeNowPlaying();
    $("#notif-panel")?.classList.add("hidden");
    $("#profile-menu")?.classList.add("hidden");
  });

  window.addEventListener("spotify:playerchange", () => {
    setActiveTrackRow();
    renderLikeButtons();
    renderSidebarLib();
    if (isQueueOpen()) renderQueuePanel();
    updateAccountUI();
  });

  setInterval(tick, 250);

  renderRoute();
  updateProgressUI();
  renderNotifPanel();
}

document.addEventListener("DOMContentLoaded", init);
