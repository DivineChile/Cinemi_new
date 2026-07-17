import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Tv,
  Layers,
  Play,
  Image as ImageIcon,
  SlidersHorizontal,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import {
  anime as animeApi,
  ANIME_SOURCES,
  adaptEpisodeData,
  adaptAllAnimeEpisodeSource,
} from "../../../api";

const EPISODES_PER_PAGE = 50; // Define chunk sizes (100 is standard)

export const AnimeEpisodes = ({ title }) => {
  const { animeId } = useParams(); // AniList ID from route url
  const [episodeData, setEpisodeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Layout UI states
  const [activeAudio, setActiveAudio] = useState("sub"); // 'sub' or 'dub'
  const [activeProvider, setActiveProvider] = useState(""); // Selected streaming provider keys

  // 🌟 PAGINATION STATE: Stores the active chunk page index (0 = first 100, 1 = next 100, etc.)
  const [activeChunkIndex, setActiveChunkIndex] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 768);

  // Fetch episode lists from AniVault sources (senshi/animeheaven/anikoto) plus
  // AllAnime (resolved via exact-title search → showId). Miruro is Cloudflare-
  // blocked for playback, so it isn't used here.
  useEffect(() => {
    const controller = new AbortController();

    const fetchEpisodes = async () => {
      try {
        setLoading(true);
        setError(null);

        const [anivaultResult, allanimeResult] = await Promise.allSettled([
          animeApi.episodes(animeId, {
            sources: ANIME_SOURCES,
            signal: controller.signal,
          }),
          title
            ? animeApi.allanimeEpisodes(title, { signal: controller.signal })
            : Promise.resolve(null),
        ]);

        const sources = [];

        if (anivaultResult.status === "fulfilled" && anivaultResult.value) {
          sources.push(...adaptEpisodeData(anivaultResult.value));
        }

        if (allanimeResult.status === "fulfilled" && allanimeResult.value) {
          const entry = adaptAllAnimeEpisodeSource(
            allanimeResult.value.grouped,
            activeAudio,
          );
          if (entry) sources.push(entry);
        }

        if (controller.signal.aborted) return;

        setEpisodeData(sources);

        const successfulFetches = sources.filter((item) => item.success);

        if (successfulFetches.length > 0) {
          const realProviders = successfulFetches.map((item) => item.provider);
          setActiveProvider(
            realProviders.includes("senshi") ? "senshi" : realProviders[0],
          );
        } else {
          throw new Error("All provider requests failed.");
        }
      } catch (err) {
        if (err?.name === "AbortError" || controller.signal.aborted) return;
        console.error(err);
        setError("Episodes for this title could not be fetched.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    if (animeId) fetchEpisodes();

    return () => controller.abort();
    // activeAudio intentionally omitted: AllAnime sub/dub reselection is handled
    // by the memo below off the already-fetched grouped data.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animeId, title]);

  // Reset pagination index if user changes source provider or audio settings
  useEffect(() => {
    setActiveChunkIndex(0);
  }, [activeAudio, activeProvider]);

  // 🌟 FIX: Updated structural extraction matching your new parallel response schema
  const { totalEpisodeList, episodeChunks } = useMemo(() => {
    // 1. Locate the dynamic object matching the active selection
    const activeProviderObj = Array.isArray(episodeData)
      ? episodeData.find(
          (item) => item.provider === activeProvider && item.success,
        )
      : null;

    // 2. Extract the flat episodes array safely
    const rawList = activeProviderObj?.data?.episodes;

    // 3. Safely enforce array formatting constraint variables
    const verifiedList = Array.isArray(rawList) ? rawList : [];

    // 4. Compute the 50-item segmented grid array tracks (EPISODES_PER_PAGE = 50)
    const chunks = [];
    for (let i = 0; i < verifiedList.length; i += EPISODES_PER_PAGE) {
      chunks.push(verifiedList.slice(i, i + EPISODES_PER_PAGE));
    }

    return {
      totalEpisodeList: verifiedList,
      episodeChunks: chunks,
    };
  }, [episodeData, activeProvider]); // 🚀 Re-calculates if the fresh API payloads or active source change

  // Isolate strictly the 50 cards for the currently selected range chunk safely
  const paginatedEpisodeList = episodeChunks[activeChunkIndex] || [];

  // 1. Structural Skeleton Loading Track State
  if (loading) {
    return (
      <div className="bg-(--neutral-color) pb-16 animate-pulse">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-7 bg-white/10 rounded w-48 mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="aspect-video bg-white/5 rounded-lg h-28 w-full"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Self-collapse if no video provider mapping array resolves
  if (error || !episodeData) {
    return (
      <div className="bg-(--neutral-color) pb-16 text-center text-white/40 font-[Inter] text-[14px]">
        <p>
          ⚠️ Direct episodes sources are temporarily unavailable for this title.
        </p>
      </div>
    );
  }
  return (
    <section className="bg-(--neutral-color) pb-5 text-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* 🌟 INTERFACE ACTIONS HEADER BAR (Clicking anywhere on this bar toggles the collapse) */}
        <div
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex justify-between items-center border-b border-white/5 pb-4 mb-6 cursor-pointer select-none group"
        >
          <div className="flex items-center gap-3">
            <h3 className="text-[22px] font-bold flex items-center gap-2 font-[Inter]">
              <Tv size={20} className="text-(--brand-color)" /> Stream Episodes
            </h3>
            <span className="bg-white/5 border border-white/10 text-white/60 font-medium font-[Inter] text-[12px] px-2.5 py-0.5 rounded-full group-hover:text-white transition-colors">
              {totalEpisodeList.length} total
            </span>
          </div>

          <button
            type="button"
            className="p-1.5 rounded-md bg-white/5 border border-white/10 text-white/60 group-hover:text-white transition-all"
          >
            <ChevronDown
              size={18}
              className={`transform transition-transform duration-300 ${isCollapsed ? "-rotate-90" : "rotate-0"}`}
            />
          </button>
        </div>

        {/* 🌟 COLLAPSIBLE WRAPPER BLOCK CONTAINER */}
        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${isCollapsed ? "max-h-0 opacity-0 pointer-events-none" : "max-h-[8000px] opacity-100"}`}
        >
          {/* Controls Bar for Filtering: Stops click propagation so toggling options won't close the accordion */}
          <div
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 🌟 2. EPISODE RANGE PAGINATION CONTROLS BAR */}
            {episodeChunks.length > 1 ? (
              <div className="flex flex-col gap-2 w-full sm:w-auto font-[Inter]">
                <span className="text-[13px] text-[#a1a1a1] font-semibold flex items-center gap-1.5 uppercase tracking-wider">
                  <SlidersHorizontal
                    size={13}
                    className="text-(--brand-color)"
                  />{" "}
                  Select Episode Range:
                </span>
                <div className="flex flex-wrap gap-2">
                  {episodeChunks.map((_, index) => {
                    const startEP = index * EPISODES_PER_PAGE + 1;
                    const endEP = Math.min(
                      (index + 1) * EPISODES_PER_PAGE,
                      totalEpisodeList.length,
                    );
                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setActiveChunkIndex(index)}
                        className={`px-4 py-2 rounded-lg border text-[13px] font-bold transition-all shadow-md ${
                          index === activeChunkIndex
                            ? "bg-white text-black border-white shadow-white/5"
                            : "bg-white/5 border-white/5 text-white/70 hover:border-white/10 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {startEP} - {endEP}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div />
            )}

            {/* Providers and Audio Switch Filters */}
            <div className="flex flex-col md:flex-row items-center gap-3 font-[Inter] text-[13px] w-full md:w-auto justify-end">
              {/* Provider Select Dropdown */}
              <div className="flex items-center w-full md:w-fit gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-3 md:py-1.5 cursor-pointer">
                <Layers size={14} className="text-white/60" />
                <select
                  value={activeProvider}
                  onChange={(e) => setActiveProvider(e.target.value)}
                  className="bg-transparent w-full md:w-fit text-white font-semibold outline-none cursor-pointer pr-1"
                >
                  {/* Safeguard using Array.isArray and filtering only successful parallel responses */}
                  {Array.isArray(episodeData) &&
                    episodeData
                      .filter((item) => item.success)
                      .map((item) => (
                        <option
                          key={item.provider}
                          value={item.provider}
                          className="bg-[#0a0a0a] text-white uppercase text-[12px]"
                        >
                          Source: {item.provider}
                        </option>
                      ))}
                </select>
              </div>

              {/* Audio Sub/Dub Selector */}
              <div className="flex w-full md:w-fit bg-black/40 border border-white/5 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setActiveAudio("sub")}
                  className={`px-4 py-2 md:py-1 w-[50%] md:w-fit rounded-md font-bold uppercase transition-all ${
                    activeAudio === "sub"
                      ? "bg-(--primary-color) text-white"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Sub
                </button>
                <button
                  type="button"
                  onClick={() => setActiveAudio("dub")}
                  className={`px-4 py-2 md:py-1 w-[50%] md:w-fit rounded-md font-bold uppercase transition-all ${
                    activeAudio === "dub"
                      ? "bg-(--primary-color) text-white"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Dub
                </button>
              </div>
            </div>
          </div>

          {totalEpisodeList.length === 0 ? (
            /* Localized fallback banner keeps the dropdown controls fully clickable above it */
            <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center gap-3 text-center font-[Inter]">
              <AlertCircle size={36} className="text-white/40" />
              <div className="flex flex-col gap-1">
                <p className="text-[16px] font-bold text-white/90">
                  No Episodes Available
                </p>
                <p className="text-[14px] text-[#a1a1a1] max-w-sm leading-normal">
                  Provider{" "}
                  <span className="uppercase text-white font-semibold font-mono bg-white/10 px-1.5 py-0.5 rounded text-[12px]">
                    {activeProvider}
                  </span>{" "}
                  does not have any{" "}
                  <span className="font-semibold text-white uppercase">
                    {activeAudio}
                  </span>{" "}
                  episodes listed for this title. Try switching sources.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {paginatedEpisodeList.map((ep) => {
                // 1. Unify varying API key references (falls back to .num based on your response sample)
                const episodeNum = ep.number ?? ep.num;
                const uniqueId = ep.id || `${activeProvider}-${episodeNum}`;

                // 2. Build your custom structural path variables string dynamically
                const watchPath = `/watch/${activeProvider}/${animeId}/${episodeNum}/${activeAudio}`;

                return (
                  <Link
                    key={uniqueId}
                    to={watchPath}
                    className="group relative flex flex-col justify-center p-3 rounded-xl bg-white/5 border border-white/10 hover:border-(--brand-color) hover:bg-white/10 transition-all duration-200 shadow-sm"
                  >
                    {/* Floating Play Indicator Icon on Hover */}
                    <div className="absolute top-3 right-3 text-(--brand-color) opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Play size={12} fill="currentColor" />
                    </div>

                    {/* Top Data Layer: Episode Badge Number + Filler Status */}
                    <div className="flex items-center gap-2 mb-0.5 max-w-[85%]">
                      <span className="text-[14px] font-extrabold text-white font-[Inter] tracking-wide">
                        EP {episodeNum}
                      </span>

                      {ep.filler && (
                        <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] uppercase px-1.5 py-0.5 rounded font-semibold tracking-wider font-[Inter]">
                          Filler
                        </span>
                      )}
                    </div>

                    {/* Bottom Data Layer: Context Title fallback */}
                    <p className="text-[12px] text-[#a1a1a1] group-hover:text-white transition-colors font-[Inter] truncate max-w-full">
                      {ep.title && ep.title !== `Episode ${episodeNum}`
                        ? ep.title
                        : "Watch Now"}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
