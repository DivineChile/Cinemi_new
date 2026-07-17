import { apiFetch } from "./client.js";

// Low-level endpoint wrappers. Each returns the unwrapped `data` payload.

export function getHome({ signal } = {}) {
  return apiFetch("/api/home", { signal });
}

export function getGenres({ signal } = {}) {
  return apiFetch("/api/genres", { signal });
}

export function search({ q, page = 1, type, provider, signal } = {}) {
  return apiFetch("/api/search", { params: { q, page, type, provider }, signal });
}

// Anime catalog browsing via Miruro's AniList-backed /filter. Supports genre,
// tag, year, season, format, status, sort, page. NOTE: it ignores text search
// params (verified) — use search() for text queries.
export function browseAnime(filters = {}, { signal } = {}) {
  return apiFetch("/api/browse", {
    params: { type: "anime", ...filters },
    signal,
  });
}

export function getMediaDetail(type, id, { provider, signal } = {}) {
  return apiFetch(`/api/media/${type}/${id}`, { params: { provider }, signal });
}

export function getEpisodes(
  type,
  id,
  { season, provider, source, sources, includeStreams, episodeStart, episodeEnd, signal } = {},
) {
  return apiFetch(`/api/media/${type}/${id}/episodes`, {
    params: {
      season,
      provider,
      source,
      sources: Array.isArray(sources) ? sources.join(",") : sources,
      includeStreams,
      episodeStart,
      episodeEnd,
    },
    signal,
  });
}

export function getServers(type, id, { episode, audio, source, provider, signal } = {}) {
  return apiFetch(`/api/media/${type}/${id}/servers`, {
    params: { episode, audio, source, provider },
    signal,
  });
}

export function getStreams(
  type,
  id,
  { episode, season, audio, source, server, provider, signal } = {},
) {
  return apiFetch(`/api/media/${type}/${id}/streams`, {
    params: { episode, season, audio, source, server, provider },
    signal,
  });
}

export function getStreamsAggregate(
  type,
  id,
  { episode, audio, sources, server, provider, signal } = {},
) {
  return apiFetch(`/api/media/${type}/${id}/streams/aggregate`, {
    params: {
      episode,
      audio,
      sources: Array.isArray(sources) ? sources.join(",") : sources,
      server,
      provider,
    },
    signal,
  });
}

// AniVault sub-sources that serve anime episodes/streams. Miruro is blocked
// behind Cloudflare for playback, so anime episodes come from AniVault.
export const ANIME_SOURCES = ["senshi", "animeheaven", "anikoto"];

function normalizeTitle(value) {
  return String(value ?? "").trim().toLowerCase();
}

// AllAnime uses its own show IDs, so episodes require a title→showId lookup
// first. Prefer an exact title match; fall back to the top result.
export async function resolveAllAnimeId(title, { signal } = {}) {
  if (!title) return null;

  const res = await search({ q: title, provider: "allanime", signal });
  const results = res?.results ?? [];

  if (!results.length) return null;

  const target = normalizeTitle(title);
  const exact = results.find((r) => normalizeTitle(r.title) === target);

  return (exact ?? results[0]).id ?? null;
}

// Convenience wrappers so components don't repeat "anime" / provider names.
export const anime = {
  detail: (id, opts) => getMediaDetail("anime", id, opts),

  search: (q, page, opts) => search({ q, page, provider: "miruro", ...opts }),

  episodes: (id, opts) =>
    getEpisodes("anime", id, { provider: "anivault", ...opts }),

  servers: (id, opts) =>
    getServers("anime", id, { provider: "anivault", ...opts }),

  streams: (id, opts) =>
    getStreams("anime", id, { provider: "anivault", ...opts }),

  // Two-step AllAnime episode fetch: search by exact title → showId → episodes.
  // Returns { showId, grouped } or null. Pass includeStreams:true to also get
  // inline CDN streams on each episode (AllAnime resolves playback itself).
  async allanimeEpisodes(title, { includeStreams = false, signal } = {}) {
    const showId = await resolveAllAnimeId(title, { signal });
    if (!showId) return null;

    const grouped = await getEpisodes("anime", showId, {
      provider: "allanime",
      includeStreams,
      signal,
    });

    return { showId, grouped };
  },
};
