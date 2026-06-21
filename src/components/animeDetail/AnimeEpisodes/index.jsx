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

const PROXY_API_URL = import.meta.env.VITE_PROXY_API_URL;
const EPISODES_PER_PAGE = 100; // Define chunk sizes (100 is standard)

export const AnimeEpisodes = () => {
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

  const workingProviders = ["bonk", "bee", "pewe"];

  // Fetch episodes dataset matching your 3-Step Streaming Flow
  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${PROXY_API_URL}/episodes/${animeId}`);
        if (!response.ok)
          throw new Error("Failed to load episodes tracking matrix");
        const data = await response.json();

        setEpisodeData(data);

        // Auto-select the first available provider from the API response payload object map
        const availableProviders = Object.keys(data.providers || {});
        const realProviders = availableProviders.filter(
          (provider) => provider !== "kiwi" && provider !== "hop",
        );

        if (realProviders.length > 0) {
          // Default to 'kiwi' if available, otherwise grab the first one
          if (realProviders.includes("bee")) {
            setActiveProvider("bee");
          } else {
            setActiveProvider(realProviders[0]);
          }
        }
      } catch (err) {
        console.error(err);
        setError("Episodes for this title could not be fetched.");
      } finally {
        setLoading(false);
      }
    };

    if (animeId) fetchEpisodes();
  }, [animeId]);

  // Reset pagination index if user changes source provider or audio settings
  useEffect(() => {
    setActiveChunkIndex(0);
  }, [activeAudio, activeProvider]);

  // 🌟 FIX: Combined structural extraction and slicing into a single dependency-safe memo block
  const { totalEpisodeList, episodeChunks } = useMemo(() => {
    // Isolate active array references safely without creating fresh fallback reference objects inline
    const providerData = episodeData?.providers?.[activeProvider];
    const rawList = providerData?.episodes?.[activeAudio];

    // Safely enforce array formatting constraint variables
    const verifiedList = Array.isArray(rawList) ? rawList : [];

    // Compute the 100-item segmented grid array tracks
    const chunks = [];
    for (let i = 0; i < verifiedList.length; i += EPISODES_PER_PAGE) {
      chunks.push(verifiedList.slice(i, i + EPISODES_PER_PAGE));
    }

    return {
      totalEpisodeList: verifiedList,
      episodeChunks: chunks,
    };
  }, [episodeData, activeProvider, activeAudio]); // 🚀 Only runs when these specific state values change!

  // Isolate strictly the 100 cards for the currently selected range chunk safely
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

  // const realProviders = episodeData?.providers?.filter(
  //   (provider) => provider !== "kiwi" && provider !== "hop",
  // );

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
              <div className="flex items-center w-full md:w-fit gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-3 md:py-1.5 cursor-pointer">
                <Layers size={14} className="text-white/60" />
                <select
                  value={activeProvider}
                  onChange={(e) => setActiveProvider(e.target.value)}
                  className="bg-transparent w-full md:w-fit text-white font-semibold outline-none cursor-pointer pr-1"
                >
                  {Object.entries(episodeData?.providers).filter(([key]) => workingProviders.includes(key)).map(([key]) => {
                    return (
                      <option
                        key={key}
                        value={key}
                        className="bg-[#0a0a0a] text-white uppercase text-[12px]"
                      >
                        Source: {key}
                      </option>
                    );
                  })}
                </select>
              </div>

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
            // Localized fallback banner keeps the dropdown controls fully clickable above it
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {paginatedEpisodeList.map((ep) => {
                // Encode the parameters securely to match Step 2 streaming endpoint constraints safely
                // Format path variable: /watch/:provider/:anilistId/:category/:slug
                // ep.id typically holds a path string like "watch/kiwi/178005/sub/animepahe-1"
                const watchPath = `/${ep.id || `watch/${activeProvider}/${animeId}/${activeAudio}/${ep.number}`}`;

                return (
                  <Link
                    key={ep.number || ep.id}
                    to={watchPath}
                    className="group flex flex-col gap-2.5 bg-white/0 hover:bg-white/5 border border-transparent hover:border-white/5 p-2 rounded-xl transition-all duration-300"
                  >
                    {/* Image Frame aspect locked preview box box */}
                    <div className="w-full aspect-video bg-gray-900 rounded-lg overflow-hidden relative shadow-md">
                      {ep.image ? (
                        <img
                          src={ep.image}
                          alt=""
                          loading="lazy"
                          className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        // Default fallback node graphic icon element if API skips preview image paths
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-white/20">
                          <ImageIcon size={24} />
                          <span className="text-[11px] font-[Inter]">
                            No Preview
                          </span>
                        </div>
                      )}

                      {/* Absolute Card Duration Tag and Hover Play Circle Layer */}
                      {ep.duration && (
                        <span className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white/90 text-[11px] font-bold px-2 py-0.5 rounded font-[Inter]">
                          {Math.floor(ep.duration / 60)}m
                        </span>
                      )}

                      {/* Hover Video Dim Backdrop Reveal layer */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                        <div className="w-10 h-10 rounded-full bg-(--primary-color) text-white flex items-center justify-center scale-90 group-hover:scale-100 transition-transform duration-300 shadow-lg">
                          <Play
                            size={16}
                            fill="currentColor"
                            className="ml-0.5"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Text Metadata descriptions tags row */}
                    <div className="px-1 flex flex-col gap-0.5">
                      <h4 className="text-[14px] font-bold text-white font-[Inter] flex items-center gap-2">
                        <span className="text-(--brand-color)">
                          EP {ep.number}
                        </span>
                        {ep.filler && (
                          <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] uppercase px-1.5 py-0.2 rounded font-semibold tracking-wider font-[Inter]">
                            Filler
                          </span>
                        )}
                      </h4>
                      {ep.title && (
                        <p className="text-[13px] text-[#a1a1a1] group-hover:text-white transition-colors font-[Inter] truncate max-w-full">
                          {ep.title}
                        </p>
                      )}
                    </div>
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
