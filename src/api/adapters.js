// Adapters translate the unified backend's shapes into the shapes the existing
// UI already consumes, so components (especially the fragile Vidstack player)
// stay largely unchanged during the rewire.

import { proxyMediaUrl } from "./client.js";

// --- Cards -----------------------------------------------------------------
// Backend anime card: { provider, id, type, title, poster, backdrop, year,
//   rating (0-10), format, episodes, genres[] }
export function adaptMediaCard(item = {}) {
  return {
    id: item.id,
    type: item.type,
    provider: item.provider,
    title: item.title ?? "Unknown",
    poster: item.poster ?? null,
    backdrop: item.backdrop ?? item.poster ?? null,
    year: item.year ?? null,
    rating: item.rating != null ? Number(item.rating).toFixed(1) : null,
    format: item.format ?? null,
    episodes: item.episodes ?? null,
    genres: Array.isArray(item.genres) ? item.genres : [],
  };
}

// Map a backend anime card → the item shape CarouselRow/ContentCard consume.
export function toRowCard(item = {}) {
  return {
    id: item.id,
    mobileHref: `/anime/${item.id}`,
    desktopHref: `/watch/${item.id}`,
    poster: item.poster ?? item.backdrop ?? null,
    title: item.title ?? "Unknown",
    score: item.rating != null ? Number(item.rating).toFixed(1) : "0.0",
    seasonYear: item.year ?? null,
    animeFormat: item.format ?? null,
  };
}

// --- Detail ----------------------------------------------------------------
// Backend detail nests most anime fields under `anime` and uses different names
// than the old AniList /info payload. adaptDetail re-emits the legacy field
// names so animeDetail/Hero and MetaInfo keep working unchanged.
export function adaptDetail(raw = {}) {
  if (!raw) return null;

  const a = raw.anime ?? {};
  const score = raw.rating?.score ?? null; // 0-100

  const studioName = Array.isArray(a.studios) ? a.studios[0] : null;

  return {
    // identifiers
    id: raw.id,
    idMal: a.myanimelistId ?? null,

    // titles (object, matching old shape)
    title: raw.title ?? { english: "Unknown", romaji: "Unknown" },

    // imagery
    bannerImage: raw.backdrop ?? raw.poster ?? null,
    coverImage: { extraLarge: raw.poster ?? null, large: raw.poster ?? null },

    // scores / dates
    averageScore: score, // Hero divides by 10
    score: score != null ? (score / 10).toFixed(1) : "0.0",
    seasonYear: raw.year ?? null,
    season: a.season ?? null,

    // counts / meta
    format: a.format ?? null,
    episodes: a.episodes ?? null,
    duration: a.duration ?? null,
    status: a.status ?? "UNKNOWN",
    description: raw.description ?? null,
    genres: Array.isArray(raw.genres) ? raw.genres : [],

    // studios reshaped to the { nodes: [{ isAnimationStudio, name }] } MetaInfo reads
    studios: studioName
      ? { nodes: [{ isAnimationStudio: true, name: studioName }] }
      : { nodes: [] },

    trailer: a.trailer ?? null,

    // No next-airing data from this backend; leaves the MetaInfo alert hidden.
    nextAiringEpisode: null,

    // relations / recommendations (title/poster are plain values here)
    relations: Array.isArray(a.relations) ? a.relations : [],
    recommendations: Array.isArray(a.recommendations)
      ? a.recommendations
      : [],
  };
}

// --- Episodes --------------------------------------------------------------
// Backend anime episodes come grouped by source:
//   { senshi: { episodes: [...] }, animeheaven: { episodes: [...] }, ... }
// The Stream/AnimeEpisodes UI expects a per-source array:
//   [ { provider, data: { episodes: [...] }, success } ]
export function adaptEpisodeData(grouped = {}) {
  return Object.entries(grouped).map(([provider, value]) => {
    const episodes = Array.isArray(value?.episodes) ? value.episodes : [];
    return {
      provider,
      data: { episodes },
      success: episodes.length > 0,
    };
  });
}

// AllAnime episodes are audio-split: { allanime: { sub: [...], dub: [...] } }.
// Normalize into the same per-source entry the UI uses. Uses the requested
// audio's list, falling back to whichever translation has episodes so the list
// still renders. Episode objects carry inline `streams` when requested.
export function adaptAllAnimeEpisodeSource(grouped = {}, audio = "sub") {
  const group = grouped?.allanime;
  if (!group) return null;

  const primary = audio === "dub" ? group.dub : group.sub;
  const episodes =
    (Array.isArray(primary) && primary.length ? primary : null) ??
    (group.sub?.length ? group.sub : group.dub) ??
    [];

  return {
    provider: "allanime",
    data: { episodes },
    success: episodes.length > 0,
  };
}

// --- Streams ---------------------------------------------------------------
// Backend streams: { providers: [ { provider, sources: [ { url, type, server,
//   quality, language, headers, source, default } ], subtitles: [ { file,
//   label, language, kind, format, default } ], ... } ] }
// Legacy player shape: { playbackMode, hlsProxyUrl, mp4ProxyUrl, m3u8,
//   subtitles: [ { url, lang, default } ], title, type }
function pickSource(sources = []) {
  if (!sources.length) return null;
  return (
    sources.find((s) => s.default) ||
    sources.find((s) => s.type === "hls") ||
    sources[0]
  );
}

// A source that names a Referer (or custom headers) points at a CDN the
// browser can't fetch directly — reroute it through the backend media relay.
// AniVault URLs arrive pre-proxied (referer baked in), so they pass through.
function resolvePlayableUrl(source) {
  const referer = source.referer ?? source.headers?.Referer ?? null;
  if (!referer) return source.url;
  return proxyMediaUrl(source.url, referer);
}

export function adaptStreamData(providers = [], { title, type } = {}) {
  const provider = Array.isArray(providers) ? providers[0] : null;
  const source = pickSource(provider?.sources);

  if (!source?.url) {
    return { error: true, title, type };
  }

  const isHls = source.type === "hls";
  const playableUrl = resolvePlayableUrl(source);

  return {
    playbackMode: isHls ? "hls" : "mp4",
    hlsProxyUrl: isHls ? playableUrl : undefined,
    m3u8: isHls ? playableUrl : undefined,
    mp4ProxyUrl: !isHls ? playableUrl : undefined,
    streamUrl: !isHls ? playableUrl : undefined,
    // Backend serves direct media URLs — no embeddable page. Kept undefined so
    // the old iframe fallback never fires.
    embedUrl: undefined,
    referer: source.referer ?? null,
    headers: source.headers ?? null,
    subtitles: (provider?.subtitles ?? []).map((s) => ({
      url: s.file,
      lang: s.label || s.language || "Subtitle",
      default: !!s.default,
    })),
    // Raw sources retained for future quality/source switching.
    _sources: provider?.sources ?? [],
    title,
    type,
  };
}
