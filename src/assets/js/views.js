/* =====================================================================
 * Páginas de detalle — playlist, álbum, artista, liked, género,
 * premium, cuenta y cola de reproducción.
 * ================================================================== */

const PREMIUM_FEATURES = {
  free: [
    "Música con anuncios",
    "Calidad estándar",
    "Saltos limitados",
    "Sin descargas",
  ],
  premium: [
    "Sin anuncios",
    "Calidad muy alta",
    "Saltos ilimitados",
    "Descargas sin conexión",
  ],
};

function planName(id) {
  if (!id || id === "free") return "Free";
  const p = DB.plan(id);
  return p ? p.name.replace("Premium ", "Premium ") : "Premium";
}

function planPriceText(plan, billing) {
  const annual = billing === "annual";
  const price = annual ? plan.price * 10 : plan.price;
  const fmt = "$" + price.toLocaleString("es-CL");
  return `${fmt} <span class="text-sm font-medium text-subtle">/ ${annual ? "año" : "mes"}</span>`;
}

function detailHeroHtml({ kind, name, grad, img = "", cover, meta = "", round = false }) {
  const art = img ? `url('${img}')` : gradCss(grad);
  const blur = img ? ";filter:blur(24px);transform:scale(1.16);opacity:.7" : "";
  return `<div class="relative overflow-hidden px-4 pb-6 pt-8 sm:px-7 sm:pt-10">
      <div class="absolute inset-0" style="background-image:${art};background-size:cover;background-position:center${blur}"></div>
      <div class="absolute inset-0" style="background:linear-gradient(180deg,rgba(0,0,0,.28) 0%,rgba(18,18,18,.6) 65%,#121212 100%)"></div>
      <div class="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:gap-6">
        ${
          cover
            ? `<span class="mx-auto w-40 shrink-0 sm:mx-0 sm:w-[208px] ${round ? "rounded-full" : ""}">${cover}</span>`
            : ""
        }
        <div class="min-w-0">
          <p class="text-[12px] font-bold uppercase tracking-wide text-white/90">${esc(kind)}</p>
          <h1 class="clamp-2 mt-1 text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl">${esc(name)}</h1>
          ${meta ? `<div class="mt-3 text-sm text-white/90">${meta}</div>` : ""}
        </div>
      </div>
    </div>`;
}

function actionBarHtml(type, id, { follow = false, custom = false } = {}) {
  const saved = follow && (Store.get("savedArtists") || []).includes(id);
  return `<div class="sticky top-0 z-20 flex items-center gap-4 bg-gradient-to-b from-[#121212]/90 to-transparent px-4 py-4 backdrop-blur-sm sm:px-7">
      <button class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#1ed760] text-black shadow-xl transition hover:scale-105 hover:bg-[#3be477]"
        data-collection-play="${type}:${id}" aria-label="Reproducir todo">
        <span class="ml-0.5 flex h-6 w-6 items-center justify-center text-[22px]">${icon("play")}</span>
      </button>
      <button class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-faint transition hover:scale-110 hover:text-white" data-shuffle-collection="${type}:${id}" aria-label="Reproducir aleatoriamente">
        <span class="flex h-6 w-6 items-center justify-center text-[24px]">${icon("shuffle")}</span>
      </button>
      ${
        follow
          ? `<button class="rounded-full border px-4 py-1.5 text-sm font-bold transition ${
              saved
                ? "border-[#1db954] text-[#1db954] hover:border-white hover:text-white"
                : "border-white/40 text-white hover:scale-105 hover:border-white"
            }" data-follow-artist="${id}">${saved ? "Siguiendo" : "Seguir"}</button>`
          : ""
      }
      ${
        custom
          ? `<button class="rounded-full border border-white/40 px-4 py-1.5 text-sm font-bold text-white transition hover:scale-105 hover:border-white" data-add-songs="${id}">Agregar canciones</button>`
          : ""
      }
      <button class="shrink-0 text-faint transition hover:text-white" data-more-context="${type}:${id}" aria-label="Más opciones">
        <span class="flex h-7 w-7 items-center justify-center text-[24px]">${icon("more")}</span>
      </button>
      <span class="ml-auto hidden text-sm text-subtle lg:block">${Player.liked.size} canciones que te gustan</span>
    </div>`;
}

function trackRowHtml(song, i, { withAlbum = true, queueType, queueId } = {}) {
  const album = DB.album(song.albumId);
  const artist = DB.artist(song.artistId);
  const bg = coverCss(album || { grad: "ep1" });
  const liked = Player.liked.has(song.id);

  const cols = withAlbum
    ? "grid-cols-[1.5rem_minmax(0,1fr)_auto] sm:grid-cols-[1.5rem_minmax(0,1.4fr)_minmax(0,1fr)_auto]"
    : "grid-cols-[1.5rem_minmax(0,1fr)_auto]";

  const albumCell = withAlbum
    ? `<p class="hidden truncate text-sm text-subtle hover:text-white sm:block">${
        album
          ? `<a href="#/album/${album.id}" class="hover:underline" data-link="album/${album.id}">${esc(album.title)}</a>`
          : ""
      }</p>`
    : "";

  return `<div class="track group grid ${cols} items-center gap-3 rounded-md px-2 py-2 hover:bg-white/10 sm:px-3"
      data-track="${song.id}" data-queue="${queueType || ""}:${queueId || ""}">
      <span class="flex h-6 w-6 items-center justify-center text-sm text-subtle">
        <span class="idx-num block">${i + 1}</span>
        <span class="idx-play hidden items-center justify-center group-hover:flex"><span class="flex h-3.5 w-3.5 items-center justify-center text-[14px]">${icon("play")}</span></span>
        <span class="idx-eq hidden h-3 items-end gap-[2px]"><span class="eq-bar" style="height:45%"></span><span class="eq-bar" style="height:80%"></span><span class="eq-bar" style="height:60%"></span></span>
      </span>
      <div class="flex min-w-0 items-center gap-3">
        <span class="hidden h-10 w-10 shrink-0 rounded-sm bg-cover bg-center sm:block" style="background-image:${bg}"></span>
        <div class="min-w-0 leading-tight">
          <p class="truncate text-sm text-white">${esc(song.title)}</p>
          <p class="truncate text-xs text-subtle hover:text-white">
            <a href="#/artist/${song.artistId}" class="hover:underline" data-link="artist/${song.artistId}">${artist ? esc(artist.name) : ""}</a>
          </p>
        </div>
      </div>
      ${albumCell}
      <div class="flex items-center justify-end gap-2 sm:gap-3">
        <button class="text-faint transition hover:scale-110 hover:text-white" data-heart-row="${song.id}" aria-label="${
          liked ? "Quitar me gusta" : "Me gusta"
        }">
          <span class="flex h-4 w-4 items-center justify-center text-[16px] ${liked ? "text-[#1db954]" : ""}">${icon("heart")}</span>
        </button>
        <span class="w-9 text-right text-sm tabular-nums text-subtle">${fmtTime(song.duration)}</span>
        <button class="hidden text-faint transition hover:text-white sm:block" data-more-track="${song.id}" aria-label="Más opciones">
          <span class="flex h-4 w-4 items-center justify-center text-[16px]">${icon("more")}</span>
        </button>
      </div>
    </div>`;
}

function tracksContainerHtml(html, empty = "") {
  if (!html) return `<div class="rounded-t-lg bg-base px-6 pb-16 pt-6 text-sm text-subtle">${empty}</div>`;
  return `<div class="rounded-t-lg bg-base px-2 pb-10 pt-3 sm:px-4">
      <div class="mb-2 hidden grid-cols-[1.5rem_minmax(0,1.4fr)_minmax(0,1fr)_auto] gap-3 border-b border-white/10 px-3 pb-2 text-xs font-medium uppercase tracking-wide text-subtle sm:grid">
        <span>#</span><span>Título</span><span>Álbum</span><span class="justify-self-end pr-16">Duración</span>
      </div>
      ${html}
    </div>`;
}

/* ------------------------------ PLAYLIST ---------------------------- */

function renderPlaylist(id) {
  if (id === "liked") return renderLiked();
  const p = DB.playlist(id);
  if (!p) return renderNotFound(`la playlist «${esc(id)}»`);
  const songs = p.songIds.map((sid) => DB.song(sid)).filter(Boolean);
  const totalSec = songs.reduce((a, s) => a + s.duration, 0);
  const custom = DB.isCustomPlaylist(id);

  const meta = `<p class="text-sm text-white/90">${esc(p.owner || "Spotify")} · ${songs.length} canciones${
    songs.length ? `, ${fmtTime(totalSec)}` : ""
  }</p>`;

  const rows = songs
    .map((s, i) => trackRowHtml(s, i, { queueType: "playlist", queueId: p.id }))
    .join("");

  return `<main>
      ${detailHeroHtml({
        kind: custom ? "Playlist privada" : "Playlist",
        name: p.name,
        grad: p.grad,
        img: coverImage(p),
        cover: coverHtml("playlist", p),
        meta: `${p.desc ? `<p class="mb-2 max-w-2xl text-white/80">${esc(p.desc)}</p>` : ""}${meta}`,
      })}
      ${actionBarHtml("playlist", p.id, { custom })}
      ${tracksContainerHtml(rows, "Esta playlist todavía está vacía. Usa «Agregar canciones» para empezar.")}
    </main>`;
}

/* ------------------------------- ALBUM ------------------------------ */

function renderAlbum(id) {
  const a = DB.album(id);
  if (!a) return renderNotFound(`el álbum «${esc(id)}»`);
  const artist = DB.artist(a.artistId);
  const songs = a.songs.map((s) => DB.song(s[0])).filter(Boolean);
  const totalSec = songs.reduce((x, s) => x + s.duration, 0);

  const meta = `<p class="flex flex-wrap items-center gap-1.5 text-sm text-white/90">
      <a href="#/artist/${artist.id}" class="font-bold text-white hover:underline" data-link="artist/${artist.id}">${esc(artist.name)}</a>
      <span>· ${a.year} · ${songs.length} canciones, ${fmtTime(totalSec)}</span>
    </p>`;

  const rows = songs
    .map((s, i) => trackRowHtml(s, i, { withAlbum: false, queueType: "album", queueId: a.id }))
    .join("");

  return `<main>
      ${detailHeroHtml({
        kind: "Álbum",
        name: a.title,
        grad: a.grad,
        img: coverImage(a),
        cover: coverHtml("album", a),
        meta,
      })}
      ${actionBarHtml("album", a.id)}
      ${tracksContainerHtml(rows)}
      <p class="px-6 pb-10 pt-4 text-xs text-faint sm:px-8">© ${a.year} · Proyecto académico. Todos los datos y nombres de canciones son ficticios o de referencia.</p>
    </main>`;
}

/* ------------------------------- ARTIST ----------------------------- */

function renderArtist(id) {
  const ar = DB.artist(id);
  if (!ar) return renderNotFound(`el artista «${esc(id)}»`);
  const albums = DB.albums.filter((a) => a.artistId === id);
  const songs = songQueueOf("artist", id)
    .map((sid) => DB.song(sid))
    .filter(Boolean);

  const meta = `<p class="text-sm font-medium text-white/90">${esc(ar.monthly)} oyentes mensuales · ${esc(
    ar.followers
  )} seguidores</p>
    <p class="mt-2 max-w-2xl text-sm leading-relaxed text-white/70">${esc(ar.about)}</p>`;

  const rows = songs
    .slice(0, 5)
    .map((s, i) => trackRowHtml(s, i, { withAlbum: false, queueType: "artist", queueId: ar.id }))
    .join("");

  const albGrid = albums
    .map(
      (a) => `<article class="group cursor-pointer rounded-lg bg-white/[0.06] p-3 transition hover:bg-white/10" data-link="album/${a.id}" data-card="album:${a.id}">
        <div class="relative">
          ${coverHtml("album", a)}
          <button class="card-play absolute bottom-1 right-1 flex h-10 w-10 items-center justify-center rounded-full bg-[#1ed760] text-black shadow-xl" data-collection-play="album:${a.id}" aria-label="Reproducir">
            <span class="ml-0.5 flex h-5 w-5 items-center justify-center text-[18px]">${icon("play")}</span>
          </button>
        </div>
        <h4 class="mt-2 truncate text-sm font-bold">${esc(a.title)}</h4>
        <p class="truncate text-xs text-subtle">${a.year} · Álbum</p>
      </article>`
    )
    .join("");

  const appearances = DB.playlists.filter((p) => p.songIds.some((sid) => songs.some((s) => s.id === sid)));
  const playlistsHtml = appearances
    .slice(0, 6)
    .map((p) => cardHtml("playlist", p.id))
    .join("");

  return `<main>
      ${detailHeroHtml({
        kind: "Artista verificado",
        name: ar.name,
        grad: ar.grad,
        img: coverImage(ar),
        cover: coverImage(ar)
          ? `<span class="block aspect-square w-full overflow-hidden rounded-full shadow-xl"><img src="${coverImage(
              ar
            )}" alt="${esc(ar.name)}" class="h-full w-full object-cover" /></span>`
          : `<span class="block aspect-square w-full rounded-full" style="background-image:${gradCss(ar.grad)}"></span>`,
        meta,
        round: true,
      })}
      ${actionBarHtml("artist", ar.id, { follow: true })}
      <div class="rounded-t-lg bg-base px-2 pb-10 pt-3 sm:px-4">
        <h3 class="mb-3 px-3 text-[20px] font-black">Populares</h3>
        <div>${rows}</div>
        <h3 class="mb-3 mt-8 px-3 text-[20px] font-black">Discografía</h3>
        <div class="grid gap-3 px-2" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr))">${albGrid}</div>
        ${
          playlistsHtml
            ? `<h3 class="mb-3 mt-8 px-3 text-[20px] font-black">Aparece en</h3>
               <div class="grid gap-3 px-2" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr))">${playlistsHtml}</div>`
            : ""
        }
      </div>
    </main>`;
}

/* ------------------------------- LIKED ------------------------------ */

function renderLiked() {
  const songIds = Array.from(Player.liked);
  const songs = songIds.map((sid) => DB.song(sid)).filter(Boolean);

  if (!songs.length) {
    return `<main class="flex flex-col items-center justify-center px-6 pt-16 text-center">
        <span class="mb-5 flex h-28 w-28 items-center justify-center rounded-full text-5xl" style="background-image:${gradCss("ep6")}">💚</span>
        <h2 class="text-3xl font-black">Canciones que te gustan</h2>
        <p class="mt-2 max-w-md text-sm text-subtle">Toca el corazón de una canción para guardarla aquí. Todas tus canciones favoritas en un solo lugar.</p>
        <a href="#/search" class="mt-6 rounded-full bg-white px-6 py-3 text-sm font-black text-black transition hover:scale-105" data-link="search">Buscar canciones</a>
      </main>`;
  }

  const totalSec = songs.reduce((a, s) => a + s.duration, 0);
  const rows = songs
    .map((s, i) => trackRowHtml(s, i, { queueType: "liked", queueId: "liked" }))
    .join("");

  return `<main>
      ${detailHeroHtml({
        kind: "Playlist",
        name: "Canciones que te gustan",
        grad: "ep6",
        cover: `<div class="flex aspect-square w-full items-center justify-center rounded-sm bg-gradient-to-br from-[#450af5] via-[#8e8ee5] to-[#c4efd9] text-7xl">💚</div>`,
        meta: `<p class="text-sm text-white/90">Tú · ${songs.length} canciones, ${fmtTime(totalSec)}</p>`,
      })}
      ${actionBarHtml("playlist", "liked")}
      ${tracksContainerHtml(rows)}
    </main>`;
}

/* ------------------------------- GENRE ------------------------------ */

function renderGenre(id) {
  const g = DB.genre(id);
  if (!g) return renderNotFound(`la categoría «${esc(id)}»`);
  const playlists = (g.playlistIds || []).map((pid) => DB.playlist(pid)).filter(Boolean);
  const artists = (g.artistIds || []).map((aid) => DB.artist(aid)).filter(Boolean);
  const songIds = [...new Set(playlists.flatMap((p) => p.songIds))].slice(0, 10);

  return `<main>
      <div class="relative overflow-hidden px-4 pb-7 pt-10 sm:px-7">
        <div class="absolute inset-0" style="background-image:${coverCss(g)};background-size:cover;background-position:center"></div>
        <div class="absolute inset-0" style="background:linear-gradient(180deg,rgba(0,0,0,.45),rgba(18,18,18,.82) 70%,#121212 97%)"></div>
        <div class="relative">
          <p class="text-xs font-bold uppercase tracking-[0.18em] text-white/80">Categoría</p>
          <h1 class="mt-1 text-5xl font-black sm:text-7xl">${esc(g.name)}</h1>
          <p class="mt-3 max-w-xl text-sm text-white/80">${esc(g.desc)}</p>
          <div class="mt-5 flex gap-3">
            <button class="rounded-full bg-[#1ed760] px-6 py-3 text-sm font-black text-black transition hover:scale-105" data-genre-play="${g.id}">Reproducir</button>
            <button class="rounded-full border border-white/40 px-6 py-3 text-sm font-bold text-white transition hover:scale-105 hover:border-white" data-genre-shuffle="${g.id}">Aleatorio</button>
          </div>
        </div>
      </div>
      <div class="px-4 pb-12 sm:px-7">
        <section class="mt-2">
          ${sectionHeaderHtml("Playlists populares")}
          <div class="grid gap-3" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr))">
            ${playlists.map((p) => cardHtml("playlist", p.id)).join("")}
          </div>
        </section>
        <section class="mt-8">
          ${sectionHeaderHtml("Artistas")}
          <div class="grid gap-3" style="grid-template-columns:repeat(auto-fill,minmax(150px,1fr))">
            ${artists.map((a) => cardHtml("artist", a.id)).join("")}
          </div>
        </section>
        <section class="mt-8">
          ${sectionHeaderHtml("Canciones destacadas")}
          <div>${songIds.map((sid, i) => {
            const s = DB.song(sid);
            return s ? trackRowHtml(s, i, { withAlbum: true, queueType: "playlist", queueId: playlists[0] ? playlists[0].id : "" }) : "";
          }).join("")}</div>
        </section>
      </div>
    </main>`;
}

/* ------------------------------ PREMIUM ----------------------------- */

function renderPremium() {
  const current = Store.get("plan") || "free";
  const billing = Store.get("premiumBilling") || "monthly";
  const isPremium = current !== "free";

  const planCards = DB.plans
    .map((p) => {
      const isCurrent = current === p.id;
      return `<article class="relative flex flex-col rounded-xl border ${
        p.highlight ? "border-spotify/70 bg-[#1a2b22]" : "border-white/10 bg-white/[0.06]"
      } p-5 transition hover:-translate-y-0.5 hover:bg-white/[0.09]">
        ${
          p.badge
            ? `<span class="absolute -top-2.5 left-4 rounded-full ${
                p.highlight ? "bg-spotify text-black" : "bg-white text-black"
              } px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide">${esc(p.badge)}</span>`
            : ""
        }
        <div class="flex items-center gap-2">
          <span class="text-2xl">${p.emoji}</span>
          <h3 class="text-lg font-black leading-tight">${esc(p.name)}</h3>
        </div>
        <p class="mt-1 text-xs font-semibold uppercase tracking-wide text-spotify">${esc(p.tagline)}</p>
        <p class="mt-2 text-sm leading-relaxed text-subtle">${esc(p.desc)}</p>
        <p class="mt-4 text-3xl font-black">${planPriceText(p, billing)}</p>
        <ul class="mt-4 flex-1 space-y-2 text-sm text-white/85">
          ${p.features
            .map(
              (f) =>
                `<li class="flex items-start gap-2"><span class="mt-0.5 text-[16px] text-spotify">${icon(
                  "check-circle"
                )}</span><span>${esc(f)}</span></li>`
            )
            .join("")}
        </ul>
        <button class="mt-5 w-full rounded-full py-3 text-sm font-black transition ${
          isCurrent
            ? "cursor-default bg-white/15 text-white"
            : "bg-white text-black hover:scale-[1.02] hover:bg-[#f6f6f6]"
        }" data-plan-select="${p.id}" ${isCurrent ? "disabled" : ""}>
          ${isCurrent ? "Tu plan actual" : "Elegir " + esc(p.short)}
        </button>
        ${p.id === "estudiante" ? `<p class="mt-2 text-center text-[10px] text-faint">Sujeto a verificación de estudiante</p>` : ""}
      </article>`;
    })
    .join("");

  const compareRows = DB.planCompare
    .map(
      ([label, free, prem]) => `<tr class="border-b border-white/10 last:border-0">
        <td class="py-3 pr-4 text-left text-sm text-white/85">${esc(label)}</td>
        <td class="px-3 py-3 text-center text-sm ${free === "✓" ? "text-spotify" : "text-faint"}">${
        free === "✓" ? icon("check") : "—"
      }</td>
        <td class="px-3 py-3 text-center text-sm ${prem === "✓" ? "text-spotify" : "text-faint"}">${
        prem === "✓" ? icon("check") : "—"
      }</td>
      </tr>`
    )
    .join("");

  const faqs = DB.faqs
    .map(
      (f) => `<details class="group border-b border-white/10 py-4">
        <summary class="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-[15px] font-bold text-white">
          ${esc(f.q)}
          <span class="shrink-0 text-subtle transition-transform duration-200 group-open:rotate-180">${icon(
            "chevron-down"
          )}</span>
        </summary>
        <p class="mt-3 text-sm leading-relaxed text-subtle">${esc(f.a)}</p>
      </details>`
    )
    .join("");

  return `<main class="pb-14">
      <section class="premium-hero relative overflow-hidden px-4 pb-14 pt-14 text-center sm:px-8 sm:pt-16">
        <div class="relative z-10 mx-auto max-w-3xl">
          <span class="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/20 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] text-white/90 backdrop-blur">
            ${icon("premium")} Spotify Premium
          </span>
          <h1 class="mt-5 text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">Escucha sin límites.<br />Prueba Premium.</h1>
          <p class="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/85 sm:text-[16px]">
            Sin anuncios, sin saltos limitados y con descargas para escuchar donde quieras. Elige el plan que mejor se ajuste a ti.
          </p>
          <div class="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#planes" class="w-full rounded-full bg-white px-7 py-3.5 text-sm font-black text-black transition hover:scale-105 sm:w-auto">Ver planes</a>
            <button class="w-full rounded-full border border-white/40 px-7 py-3.5 text-sm font-bold text-white transition hover:scale-105 hover:border-white sm:w-auto" data-toast="Los pagos son simulados: este clon es académico 😉">
              Saber más
            </button>
          </div>
          <p class="mt-4 text-[11px] text-white/60">Precios de referencia en CLP. No se realizan cobros reales.</p>
        </div>
      </section>

      ${
        isPremium
          ? `<section class="mx-4 -mt-6 rounded-xl border border-spotify/40 bg-[#15251b] p-4 sm:mx-7">
              <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div class="flex items-center gap-3">
                  <span class="flex h-10 w-10 items-center justify-center rounded-full bg-spotify text-black">${icon("check-circle")}</span>
                  <div>
                    <p class="text-sm font-black">Ya eres Premium · ${esc(planName(current))}</p>
                    <p class="text-xs text-subtle">Disfruta de música sin anuncios. Gestiona tu plan desde tu cuenta.</p>
                  </div>
                </div>
                <a href="#/account" class="rounded-full border border-white/30 px-4 py-2 text-center text-xs font-bold transition hover:border-white" data-link="account">Gestionar cuenta</a>
              </div>
            </section>`
          : ""
      }

      <section id="planes" class="scroll-mt-20 px-4 pt-10 sm:px-7">
        <div class="mx-auto max-w-6xl">
          <div class="flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p class="text-xs font-bold uppercase tracking-[0.18em] text-spotify">Planes</p>
              <h2 class="mt-1 text-2xl font-black sm:text-3xl">Elige tu experiencia Premium</h2>
            </div>
            <div class="flex items-center rounded-full bg-white/10 p-1 text-xs font-bold">
              <button class="rounded-full px-4 py-2 ${billing === "monthly" ? "bg-white text-black" : "text-white"}" data-billing="monthly">Mensual</button>
              <button class="rounded-full px-4 py-2 ${billing === "annual" ? "bg-white text-black" : "text-white"}" data-billing="annual">Anual <span class="text-[10px] text-spotify">2 meses gratis</span></button>
            </div>
          </div>
          <div class="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">${planCards}</div>
          <p class="mt-4 text-center text-[11px] text-faint">Cancela cuando quieras. Los precios anuales se cobran una vez al año (simulado).</p>
        </div>
      </section>

      <section class="px-4 pt-14 sm:px-7">
        <div class="mx-auto max-w-3xl">
          <h2 class="text-center text-2xl font-black sm:text-3xl">Todo lo que incluye Premium</h2>
          <p class="mt-2 text-center text-sm text-subtle">Compara la experiencia gratuita con Premium.</p>
          <div class="mt-6 overflow-x-auto rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2">
            <table class="w-full min-w-[420px] border-collapse">
              <thead>
                <tr class="border-b border-white/10 text-xs uppercase tracking-wide text-subtle">
                  <th class="py-3 pr-4 text-left font-semibold">Característica</th>
                  <th class="w-20 px-3 py-3 text-center font-semibold">Free</th>
                  <th class="w-24 px-3 py-3 text-center font-semibold text-spotify">Premium</th>
                </tr>
              </thead>
              <tbody>${compareRows}</tbody>
            </table>
          </div>
          <div class="mt-6 grid gap-3 sm:grid-cols-2">
            <div class="rounded-xl bg-white/[0.06] p-5">
              <h3 class="text-sm font-black text-white">Plan Free</h3>
              <ul class="mt-3 space-y-2 text-xs text-subtle">
                ${PREMIUM_FEATURES.free.map((f) => `<li class="flex gap-2"><span class="text-faint">•</span>${esc(f)}</li>`).join("")}
              </ul>
            </div>
            <div class="rounded-xl border border-spotify/40 bg-[#15251b] p-5">
              <h3 class="text-sm font-black text-white">Premium</h3>
              <ul class="mt-3 space-y-2 text-xs text-white/80">
                ${PREMIUM_FEATURES.premium
                  .map((f) => `<li class="flex gap-2"><span class="text-spotify">${icon("check")}</span>${esc(f)}</li>`)
                  .join("")}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section class="px-4 pt-14 sm:px-7">
        <div class="mx-auto max-w-3xl">
          <h2 class="text-center text-2xl font-black sm:text-3xl">Preguntas frecuentes</h2>
          <div class="mt-6 rounded-xl border border-white/10 bg-white/[0.04] px-5">${faqs}</div>
        </div>
      </section>

      <section class="mt-14 bg-gradient-to-b from-[#1db954] to-[#0d5c2b] px-5 py-12 text-center">
        <h2 class="text-3xl font-black text-black sm:text-4xl">¿Listo para escuchar sin límites?</h2>
        <p class="mx-auto mt-2 max-w-lg text-sm font-medium text-black/70">Elige un plan y activa tu Premium simulado en segundos.</p>
        <button class="mt-6 rounded-full bg-black px-8 py-3.5 text-sm font-black text-white transition hover:scale-105" data-scroll-plans>Ver planes</button>
      </section>
    </main>`;
}

/* ------------------------------ ACCOUNT ----------------------------- */

function renderAccount() {
  const profile = Store.get("profile") || {};
  const plan = Store.get("plan") || "free";
  const isPremium = plan !== "free";
  const currentPlan = DB.plan(plan);
  const settings = Store.get("settings") || {};
  const savedAlbums = (Store.get("savedAlbums") || []).length;
  const savedArtists = (Store.get("savedArtists") || []).length;

  return `<main class="pb-14">
      <section class="relative overflow-hidden px-4 pb-8 pt-10 sm:px-7">
        <div class="absolute inset-0" style="background-image:${gradCss(profile.grad || "ep8")}"></div>
        <div class="absolute inset-0" style="background:linear-gradient(180deg,rgba(0,0,0,.45),#121212 98%)"></div>
        <div class="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:items-end sm:text-left">
          <span class="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-black/50 text-4xl font-black ring-4 ring-white/20 backdrop-blur">
            ${esc(initials(profile.name || "MP"))}
          </span>
          <div class="min-w-0">
            <p class="text-xs font-bold uppercase tracking-[0.18em] text-white/70">Perfil</p>
            <h1 class="mt-1 text-4xl font-black sm:text-5xl">${esc(profile.name || "Usuario")}</h1>
            <p class="mt-2 text-sm text-white/80">${esc(profile.email || "")}</p>
            <span class="mt-3 inline-flex items-center gap-1.5 rounded-full ${
              isPremium ? "bg-spotify text-black" : "bg-white/15 text-white"
            } px-3 py-1 text-[11px] font-black uppercase tracking-wide">
              ${isPremium ? icon("premium") : ""} ${isPremium ? "Premium" : "Plan Free"}
            </span>
          </div>
          <div class="sm:ml-auto">
            <a href="#/premium" class="inline-block rounded-full ${
              isPremium ? "border border-white/40 text-white hover:border-white" : "bg-white text-black hover:scale-105"
            } px-5 py-2.5 text-sm font-black transition" data-link="premium">
              ${isPremium ? "Cambiar plan" : "Hazte Premium"}
            </a>
          </div>
        </div>
      </section>

      <div class="px-4 sm:px-7">
        <div class="grid gap-4 lg:grid-cols-3">
          <section class="rounded-xl border border-white/10 bg-white/[0.05] p-5 lg:col-span-2">
            <h2 class="text-lg font-black">Tu suscripción</h2>
            <div class="mt-4 flex flex-col gap-4 rounded-lg bg-black/30 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p class="text-sm font-bold">${isPremium ? esc(currentPlan ? currentPlan.name : "Premium") : "Spotify Free"}</p>
                <p class="mt-1 text-xs text-subtle">${
                  isPremium
                    ? `$${(currentPlan ? currentPlan.price : 0).toLocaleString("es-CL")} / mes · Renovación simulada el próximo mes`
                    : "Música con anuncios y funciones limitadas."
                }</p>
              </div>
              ${
                isPremium
                  ? `<button class="rounded-full border border-white/30 px-4 py-2 text-xs font-bold transition hover:border-white" data-cancel-plan>Volver a Free</button>`
                  : `<a href="#/premium" class="rounded-full bg-spotify px-4 py-2 text-center text-xs font-black text-black transition hover:scale-105" data-link="premium">Ver planes</a>`
              }
            </div>
            <div class="mt-4 grid grid-cols-3 gap-3 text-center">
              <div class="rounded-lg bg-white/[0.04] p-3">
                <p class="text-2xl font-black">${Player.liked.size}</p>
                <p class="mt-0.5 text-[11px] text-subtle">Me gusta</p>
              </div>
              <div class="rounded-lg bg-white/[0.04] p-3">
                <p class="text-2xl font-black">${DB.userPlaylists.length}</p>
                <p class="mt-0.5 text-[11px] text-subtle">Playlists</p>
              </div>
              <div class="rounded-lg bg-white/[0.04] p-3">
                <p class="text-2xl font-black">${savedAlbums + savedArtists}</p>
                <p class="mt-0.5 text-[11px] text-subtle">Guardados</p>
              </div>
            </div>
          </section>

          <section class="rounded-xl border border-white/10 bg-white/[0.05] p-5">
            <h2 class="text-lg font-black">Datos de la cuenta</h2>
            <div class="mt-4 space-y-3">
              <label class="block">
                <span class="text-xs font-semibold text-subtle">Nombre</span>
                <input id="account-name" type="text" value="${esc(profile.name || "")}"
                  class="mt-1 w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm text-white focus:border-white focus:outline-none" />
              </label>
              <label class="block">
                <span class="text-xs font-semibold text-subtle">Correo electrónico</span>
                <input id="account-email" type="email" value="${esc(profile.email || "")}"
                  class="mt-1 w-full rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm text-white focus:border-white focus:outline-none" />
              </label>
              <button class="w-full rounded-full bg-white py-2.5 text-sm font-black text-black transition hover:scale-[1.02]" data-save-profile>Guardar cambios</button>
              <p class="text-center text-[10px] text-faint">Datos guardados solo en tu navegador.</p>
            </div>
          </section>
        </div>

        <section class="mt-4 rounded-xl border border-white/10 bg-white/[0.05] p-5">
          <h2 class="text-lg font-black">Preferencias</h2>
          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            <label class="flex items-center justify-between gap-4 rounded-lg bg-white/[0.04] p-4">
              <span>
                <span class="block text-sm font-semibold">Calidad de audio</span>
                <span class="block text-xs text-subtle">Solo aplica a la demo visual</span>
              </span>
              <select id="setting-quality" class="rounded-md border border-white/15 bg-black/40 px-2 py-1.5 text-xs text-white focus:outline-none">
                ${["Automática", "Normal", "Alta", "Muy alta"]
                  .map(
                    (q) => `<option value="${q}" ${settings.quality === q ? "selected" : ""}>${q}</option>`
                  )
                  .join("")}
              </select>
            </label>
            <label class="flex cursor-pointer items-center justify-between gap-4 rounded-lg bg-white/[0.04] p-4">
              <span>
                <span class="block text-sm font-semibold">Notificaciones</span>
                <span class="block text-xs text-subtle">Nuevos lanzamientos y novedades</span>
              </span>
              <input type="checkbox" class="switch" data-setting="notifications" ${settings.notifications ? "checked" : ""} />
            </label>
            <label class="flex cursor-pointer items-center justify-between gap-4 rounded-lg bg-white/[0.04] p-4">
              <span>
                <span class="block text-sm font-semibold">Sesión privada</span>
                <span class="block text-xs text-subtle">Oculta lo que reproduces</span>
              </span>
              <input type="checkbox" class="switch" data-setting="privateSession" ${settings.privateSession ? "checked" : ""} />
            </label>
            <label class="flex items-center justify-between gap-4 rounded-lg bg-white/[0.04] p-4">
              <span>
                <span class="block text-sm font-semibold">Modo demo</span>
                <span class="block text-xs text-subtle">Sin anuncios reales ni pagos</span>
              </span>
              <span class="text-spotify">${icon("check-circle")}</span>
            </label>
          </div>
        </section>

        <section class="mt-4 flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.05] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 class="text-sm font-black">Cerrar sesión</h2>
            <p class="mt-0.5 text-xs text-subtle">Puedes volver a entrar cuando quieras. Esta sesión es simulada.</p>
          </div>
          <button class="self-start rounded-full border border-white/30 px-5 py-2.5 text-xs font-bold transition hover:border-white sm:self-auto" data-action="logout">Cerrar sesión</button>
        </section>

        <p class="mt-6 text-center text-[10px] text-faint">Clon académico de Spotify · Los datos se guardan localmente en localStorage.</p>
      </div>
    </main>`;
}

/* --------------------------- QUEUE / LYRICS ------------------------- */

const queueState = { tab: "queue" };

function queueHtml() {
  if (queueState.tab === "lyrics") {
    const song = Player.song;
    if (!song) {
      return `<div class="flex h-full flex-col items-center justify-center px-6 text-center text-sm text-subtle">
          <span class="mb-3 text-3xl">${icon("lyrics")}</span>
          Reproduce una canción para ver la letra.
        </div>`;
    }
    const lines = fauxLyrics(song);
    return `<div class="px-3 py-2">
        <p class="mb-4 rounded-md bg-white/[0.04] p-3 text-[11px] leading-relaxed text-subtle">
          Letra simulada para fines visuales. No corresponde a la letra real de la canción.
        </p>
        ${lines
          .map(
            (l) =>
              `<p class="mb-4 text-[15px] font-semibold leading-snug ${l.chorus ? "text-white" : "text-white/55"}">${esc(l.text)}</p>`
          )
          .join("")}
      </div>`;
  }

  const current = Player.song;
  if (!current) {
    return `<div class="flex h-full flex-col items-center justify-center px-6 text-center text-sm text-subtle">
        <span class="mb-3 text-3xl">🎵</span>
        La cola está vacía. Reproduce algo para empezar.
      </div>`;
  }

  const upcoming = Player.queue
    .map((sid, i) => ({ sid, i }))
    .filter((x) => x.i > Player.index)
    .map(({ sid }) => DB.song(sid))
    .filter(Boolean);

  const currentAlbum = current.albumId ? DB.album(current.albumId) : null;
  const currentRow = `<div class="flex items-center gap-3 rounded-md bg-white/10 p-2">
      <span class="h-11 w-11 shrink-0 rounded bg-cover bg-center" style="background-image:${coverCss(
        currentAlbum || { grad: "ep1" }
      )}"></span>
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-bold text-spotify">${esc(current.title)}</p>
        <p class="truncate text-xs text-subtle">${esc(DB.artist(current.artistId).name)}</p>
      </div>
      <span class="text-[11px] tabular-nums text-subtle">${fmtTime(current.duration)}</span>
    </div>`;

  const rows = upcoming.length
    ? upcoming
        .map((s) => {
          const al = DB.album(s.albumId);
          return `<button class="flex w-full items-center gap-3 rounded-md p-2 text-left transition hover:bg-white/10" data-queue-play="${s.id}">
              <span class="h-10 w-10 shrink-0 rounded bg-cover bg-center" style="background-image:${coverCss(
                al || { grad: "ep1" }
              )}"></span>
              <span class="min-w-0 flex-1">
                <span class="block truncate text-sm font-medium">${esc(s.title)}</span>
                <span class="block truncate text-xs text-subtle">${esc(DB.artist(s.artistId).name)}</span>
              </span>
              <span class="text-[11px] tabular-nums text-subtle">${fmtTime(s.duration)}</span>
            </button>`;
        })
        .join("")
    : `<p class="px-2 py-4 text-xs text-subtle">No hay más canciones en la cola.</p>`;

  return `<div class="px-2">
      <p class="mb-2 px-1 text-[11px] font-bold uppercase tracking-wide text-subtle">Sonando ahora</p>
      ${currentRow}
      <p class="mb-2 mt-5 px-1 text-[11px] font-bold uppercase tracking-wide text-subtle">A continuación</p>
      ${rows}
      <p class="mt-4 px-1 text-[10px] text-faint">Contexto: ${esc(Player.context.label || "Clon de Spotify")}</p>
    </div>`;
}

function fauxLyrics(song) {
  const base = [
    "Se encienden las luces de la ciudad,",
    "y tu nombre suena en la radio otra vez.",
    "No sé si es el ritmo o la soledad,",
    "pero esta noche no pienso volver.",
    "Y bailamos bajo la lluvia,",
    "como si el mundo no existiera.",
    "Cada latido es una excusa",
    "para quedarnos hasta que amanezca.",
    "No me digas que es el final,",
    "que la noche apenas empieza.",
    "Tu voz se mezcla con el beat",
    "y todo lo demás se congela.",
    "Y bailamos bajo la lluvia,",
    "como si el mundo no existiera.",
    "Déjame un poco más de ti,",
    "antes de que salga la luna llena.",
  ];
  const chorus = new Set([4, 5, 6, 7, 12, 13, 14, 15]);
  return base.map((text, i) => ({ text, chorus: chorus.has(i) }));
}

/* ------------------------------ NOT FOUND --------------------------- */

function renderNotFound(what) {
  return `<main class="flex flex-col items-center justify-center px-6 pt-20 text-center">
      <span class="mb-4 text-5xl">😵‍💫</span>
      <h2 class="text-3xl font-black">No encontrado</h2>
      <p class="mt-2 max-w-md text-sm text-subtle">No pudimos encontrar ${esc(what)} en el catálogo simulado.</p>
      <div class="mt-6 flex gap-3">
        <a href="#/" class="rounded-full bg-spotify px-6 py-3 text-sm font-bold text-black hover:bg-spotify-hover" data-link="">Volver al inicio</a>
        <a href="#/search" class="rounded-full border border-white/30 px-6 py-3 text-sm font-bold text-white hover:border-white" data-link="search">Buscar</a>
      </div>
    </main>`;
}
