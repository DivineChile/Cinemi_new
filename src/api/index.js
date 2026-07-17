export { apiFetch, ApiError } from "./client.js";

export {
  getHome,
  getGenres,
  search,
  browseAnime,
  getMediaDetail,
  getEpisodes,
  getServers,
  getStreams,
  getStreamsAggregate,
  resolveAllAnimeId,
  anime,
  ANIME_SOURCES,
} from "./media.js";

export {
  adaptMediaCard,
  toRowCard,
  adaptDetail,
  adaptEpisodeData,
  adaptAllAnimeEpisodeSource,
  adaptStreamData,
} from "./adapters.js";
