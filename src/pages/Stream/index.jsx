import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { WatchHeader } from "../../components/Stream/WatchHeader";
import { VideoCanvas } from "../../components/Stream/VideoCanvas";
import { ActiveEpisodeMeta } from "../../components/Stream/ActiveEpisodeMeta";
import { DesktopPlaylistSidebar } from "../../components/Stream/DesktopPlaylistSidebar";
import { MobilePlaylistDrawer } from "../../components/Stream/MobilePlaylistDrawer";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Layers,
} from "lucide-react";
import { CarouselRow } from "../../components/ui/CarouselRow";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import {
  anime as animeApi,
  getMediaDetail,
  ANIME_SOURCES,
  adaptDetail,
  adaptEpisodeData,
  adaptAllAnimeEpisodeSource,
  adaptStreamData,
} from "../../api";

function Stream() {
  const EPISODES_PER_PAGE = 50;
  const anivaultWorkingProviders = ANIME_SOURCES;

  // URL Parameters matching your updated path schema: /watch/:provider/:id/:episode/:category
  const {
    provider,
    id: animeId,
    episode: episodeNumStr,
    category: audioCategory,
  } = useParams();
  const navigate = useNavigate();

  // Primary Data and Media Loading States
  const [episodeData, setEpisodeData] = useState([]);
  const [streamData, setStreamData] = useState(null);
  const [loadingLayout, setLoadingLayout] = useState(true);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [error, setError] = useState(null);

  // 🌟 NEW SERVER CONFIGURATION STATES
  const [serverList, setServerList] = useState([]);
  const [activeServer, setActiveServer] = useState("");
  const [loadingServers, setLoadingServers] = useState(false);

  // Streaming Configuration States
  const [activeAudio, setActiveAudio] = useState(audioCategory || "sub");
  const [activeProvider, setActiveProvider] = useState(provider || "anikoto");
  const [activeChunkIndex, setActiveChunkIndex] = useState(0);
  const [recommendations, setRecommendations] = useState([]);
  // Title/type resolved from the detail endpoint — used for the stream payload
  // and for AllAnime's title→showId lookup.
  const [animeTitle, setAnimeTitle] = useState("");
  const [animeType, setAnimeType] = useState("TV");
  // 🌟 NEW: UI Alert state for the gatekeeper fallback notification
  const [audioNotification, setAudioNotification] = useState("");

  // Cinematic and Layout Interaction States
  const [isDimmed, setIsDimmed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  // 🌟 NEW: Autoplay Toggle State initialized from local storage
  const [autoplayEnabled, setAutoplayEnabled] = useState(() => {
    const saved = localStorage.getItem("cinemi_autoplay");
    return saved !== null ? JSON.parse(saved) : true; // Defaults to true
  });

  // Sync state tracking variables with current URL parameter actions
  useEffect(() => {
    if (audioCategory) setActiveAudio(audioCategory);
    if (provider) setActiveProvider(provider);
  }, [audioCategory, provider]);

  // 🌟 PHASE 1: INITIALIZE PARALLEL SOURCE DATA (AniVault sources + AllAnime)
  useEffect(() => {
    const controller = new AbortController();

    const initializeWatchView = async () => {
      try {
        setLoadingLayout(true);
        setError(null);

        const [anivaultResult, allanimeResult] = await Promise.allSettled([
          animeApi.episodes(animeId, {
            sources: ANIME_SOURCES,
            signal: controller.signal,
          }),
          animeTitle
            ? animeApi.allanimeEpisodes(animeTitle, { signal: controller.signal })
            : Promise.resolve(null),
        ]);

        const parsedResults = [];

        if (anivaultResult.status === "fulfilled" && anivaultResult.value) {
          parsedResults.push(...adaptEpisodeData(anivaultResult.value));
        }

        if (allanimeResult.status === "fulfilled" && allanimeResult.value) {
          const entry = adaptAllAnimeEpisodeSource(
            allanimeResult.value.grouped,
            activeAudio,
          );
          if (entry) parsedResults.push(entry);
        }

        if (controller.signal.aborted) return;

        setEpisodeData(parsedResults);

        const successfulFetches = parsedResults.filter((item) => item.success);
        if (successfulFetches.length === 0) {
          throw new Error(
            "No active streaming sources found from any provider.",
          );
        }

        const availableProviderNames = successfulFetches.map(
          (item) => item.provider,
        );
        const fallbackProvider = availableProviderNames.includes("senshi")
          ? "senshi"
          : availableProviderNames[0];

        // ROUTING FALLBACK: "Watch Now" clicked without full URL tracking tokens.
        if (!provider || !episodeNumStr || !audioCategory) {
          const targetObj = successfulFetches.find(
            (item) => item.provider === fallbackProvider,
          );
          const firstEp = targetObj?.data?.episodes?.[0];
          const targetEpNum = firstEp ? (firstEp.number ?? firstEp.num) : 1;

          navigate(
            `/watch/${fallbackProvider}/${animeId}/${targetEpNum}/${activeAudio}`,
            { replace: true },
          );
          return;
        }

        setLoadingLayout(false);
      } catch (err) {
        if (err?.name === "AbortError" || controller.signal.aborted) return;
        console.error(err);
        setError(err.message || "Failed to load watch framework.");
        setLoadingLayout(false);
      }
    };

    if (animeId) initializeWatchView();

    return () => controller.abort();
  }, [
    animeId,
    animeTitle,
    provider,
    episodeNumStr,
    audioCategory,
    navigate,
    activeAudio,
  ]);

  // 🌟 PHASE 2: NEW SERVER LIST DISCOVERY & INTERCEPTOR FALLBACK
  useEffect(() => {
    if (!provider || !animeId || !episodeNumStr || !audioCategory) return;

    // AllAnime resolves playback from inline episode streams — no server list.
    if (provider === "allanime") {
      setServerList([]);
      setActiveServer("allanime");
      return;
    }

    const controller = new AbortController();

    const fetchServerDeck = async () => {
      try {
        setLoadingServers(true);

        const serverPayload = await animeApi.servers(animeId, {
          episode: episodeNumStr,
          audio: audioCategory,
          source: provider,
          signal: controller.signal,
        });

        const mainServerPayload = serverPayload?.servers;

        // 🛡️ CRITICAL GATEKEEPER: Fallback sequence handles if payload array drops empty
        if (
          !Array.isArray(mainServerPayload) ||
          mainServerPayload.length === 0
        ) {
          console.warn(
            `⚠️ Zero servers found for ${provider} [${audioCategory}]. Checking fallback options...`,
          );

          if (audioCategory === "dub") {
            // 🌟 FIX: Trigger visible UI alert banner notification card instead of console logging
            setAudioNotification(
              "Audio Dub unavailable on this source channel. Automatically switching to Sub.",
            );

            // Auto-dismiss the overlay notification badge completely after 4.5 seconds
            setTimeout(() => {
              setAudioNotification("");
            }, 4500);

            // Rewrite history route state to point cleanly into the sub layout map instead
            navigate(`/watch/${provider}/${animeId}/${episodeNumStr}/sub`, {
              replace: true,
            });
            return;
          }

          // If even sub drops completely empty, flush lists out and trigger canvas fallback block
          setServerList([]);
          setActiveServer("");
          return;
        }

        // 🌟 FIX: Use a Map tracking keys to filter out any duplicate items safely by 'sourceId' or 'name'
        const uniqueServersMap = new Map();
        mainServerPayload.forEach((server) => {
          if (server && server.name) {
            // Normalize the name string completely to catch duplicates like "AnimeHeaven" and "animeheaven"
            const normalizedKey = server.name.trim().toLowerCase();

            if (!uniqueServersMap.has(normalizedKey)) {
              uniqueServersMap.set(normalizedKey, server);
            }
          }
        });
        const uniqueServersArray = Array.from(uniqueServersMap.values());

        setServerList(uniqueServersArray);
        console.log(Array.from(uniqueServersMap.values()));

        // Auto-select the first structural index item in the array track list by default
        // Select the first safe fallback ID string
        const firstValidServer = uniqueServersArray[0];
        const initialServerId = firstValidServer ? firstValidServer.name : "";
        setActiveServer((prevServer) => {
          // Look up if our previously selected active server still exists inside the new deck list
          const serverStillExists = uniqueServersArray.some(
            (s) => (s.sourceId || s.name) === prevServer,
          );

          // If it exists, keep it! Do not override the user's click choice.
          if (prevServer && serverStillExists) {
            return prevServer;
          }

          // Otherwise (on initial load or episode change), fallback safely to the first node
          return initialServerId;
        });
      } catch (err) {
        if (err?.name === "AbortError" || controller.signal.aborted) return;
        console.error("Failed to compile server list layers:", err);
        setServerList([]);
        setActiveServer("");
      } finally {
        if (!controller.signal.aborted) setLoadingServers(false);
      }
    };

    fetchServerDeck();

    return () => controller.abort();
  }, [provider, animeId, episodeNumStr, audioCategory, navigate]);

  // 🌟 PHASE 3: FETCH LIVE VIDEO SOURCE ASSIGNING DYNAMIC SERVER KEYS
  useEffect(() => {
    // Need core params, plus a server token for AniVault sources (AllAnime sets
    // activeServer to "allanime" and resolves inline).
    if (
      !provider ||
      !animeId ||
      !episodeNumStr ||
      !audioCategory ||
      !activeServer
    )
      return;

    const controller = new AbortController();

    const fetchVideoStream = async () => {
      try {
        setLoadingVideo(true);

        let providersPayload;

        if (provider === "allanime") {
          // AllAnime carries playable CDN streams inline on the episode object;
          // resolve the show, find this episode, and use its streams.
          const res = animeTitle
            ? await animeApi.allanimeEpisodes(animeTitle, {
                includeStreams: true,
                signal: controller.signal,
              })
            : null;

          const group = res?.grouped?.allanime;
          const list =
            (audioCategory === "dub" ? group?.dub : group?.sub) ?? [];
          const epObj = list.find(
            (e) => (e.number ?? e.num) === Number(episodeNumStr),
          );

          providersPayload = [
            {
              provider: "allanime",
              sources: epObj?.streams ?? [],
              subtitles: [],
            },
          ];
        } else {
          const data = await animeApi.streams(animeId, {
            episode: episodeNumStr,
            audio: audioCategory,
            source: provider,
            server: activeServer,
            signal: controller.signal,
          });
          providersPayload = data?.providers ?? [];
        }

        if (controller.signal.aborted) return;

        setStreamData(
          adaptStreamData(providersPayload, {
            title: animeTitle,
            type: animeType,
          }),
        );
      } catch (err) {
        if (err?.name === "AbortError" || controller.signal.aborted) return;
        console.error(err);
        setStreamData({ error: true });
      } finally {
        if (!controller.signal.aborted) setLoadingVideo(false);
      }
    };

    fetchVideoStream();

    return () => controller.abort();
  }, [
    provider,
    animeId,
    episodeNumStr,
    audioCategory,
    activeServer,
    animeTitle,
    animeType,
  ]);

  // Detail lookup: resolves title/type (used by the stream payload + AllAnime
  // showId search) and the sidebar recommendations rail.
  useEffect(() => {
    const controller = new AbortController();

    const fetchDetail = async () => {
      try {
        const data = await getMediaDetail("anime", animeId, {
          signal: controller.signal,
        });
        const detail = adaptDetail(data);
        if (controller.signal.aborted) return;

        setAnimeTitle(detail?.title?.english || detail?.title?.romaji || "");
        setAnimeType(detail?.format || "TV");
        setRecommendations(detail?.recommendations || []);
      } catch (err) {
        if (err?.name === "AbortError") return;
        console.error("Detail lookup failed:", err);
      }
    };

    if (animeId) fetchDetail();

    return () => controller.abort();
  }, [animeId]);

  // 🌟 STEP 2: EXTRACT CHUNKS AND LIVE DATA FROM PARALLEL PAYLOAD VIA MEMO
  const {
    totalEpisodeList,
    episodeChunks,
    currentChunkIndexFromUrl,
    currentActiveEpisodeObj,
  } = useMemo(() => {
    // A. Pinpoint selected resource row data matching active selection state
    const currentSourceObj = Array.isArray(episodeData)
      ? episodeData.find(
          (item) => item.provider === activeProvider && item.success,
        )
      : null;

    const rawList = currentSourceObj?.data?.episodes;
    const verifiedList = Array.isArray(rawList) ? rawList : [];

    // B. Re-map array and chunk segment loops into sections of 50
    const chunks = [];
    for (let i = 0; i < verifiedList.length; i += EPISODES_PER_PAGE) {
      chunks.push(verifiedList.slice(i, i + EPISODES_PER_PAGE));
    }

    // C. Locate object instance mirroring active URL index parameters
    const parsedEpNum = parseInt(episodeNumStr, 10) || 1;
    const activeObj =
      verifiedList.find((ep) => (ep.number ?? ep.num) === parsedEpNum) || null;

    // D. Compute matching active range bucket
    const calculatedChunkIdx = Math.floor(
      (parsedEpNum - 1) / EPISODES_PER_PAGE,
    );
    const validChunkIdx =
      calculatedChunkIdx >= 0 && calculatedChunkIdx < chunks.length
        ? calculatedChunkIdx
        : 0;

    return {
      totalEpisodeList: verifiedList,
      episodeChunks: chunks,
      currentChunkIndexFromUrl: validChunkIdx,
      currentActiveEpisodeObj: activeObj,
    };
  }, [episodeData, activeProvider, episodeNumStr]);

  // Sync range pagination panel frame viewport on mount/update
  useEffect(() => {
    setActiveChunkIndex(currentChunkIndexFromUrl);
  }, [currentChunkIndexFromUrl]);

  // Slice visible items matching selected range index variable bounds safely
  const paginatedEpisodeList = episodeChunks[activeChunkIndex] || [];

  // Reset chunk view frame if provider source toggles manually
  useEffect(() => {
    setActiveChunkIndex(0);
  }, [activeProvider]);

  // (Removed a duplicate stream-fetch effect that raced with Phase 3 above.)

  // Persist autoplay configuration shifts to local memory instantly
  const handleToggleAutoplay = () => {
    setAutoplayEnabled((prev) => {
      const newVal = !prev;
      localStorage.setItem("cinemi_autoplay", JSON.stringify(newVal));
      return newVal;
    });
  };

  // Convert current episode string param to mathematical integer index context safely
  const currentEpNum = parseInt(episodeNumStr, 10) || 1;

  // Determine if a legitimate previous or next episode number track exists in our total deck
  const hasPreviousEpisode = totalEpisodeList.some(
    (ep) => (ep.number ?? ep.num) === currentEpNum - 1,
  );
  const hasNextEpisode = totalEpisodeList.some(
    (ep) => (ep.number ?? ep.num) === currentEpNum + 1,
  );

  // Quick navigation wrappers pushing values cleanly through React Router
  const handlePrevEpisodeClick = () => {
    if (hasPreviousEpisode) {
      navigate(
        `/watch/${activeProvider}/${animeId}/${currentEpNum - 1}/${activeAudio}`,
      );
    }
  };

  const handleNextEpisodeClick = () => {
    if (hasNextEpisode) {
      navigate(
        `/watch/${activeProvider}/${animeId}/${currentEpNum + 1}/${activeAudio}`,
      );
    }
  };

  // Extract direct source streaming configurations
  const activeVideoUrl =
    streamData?.playbackMode == "mp4"
      ? streamData?.mp4ProxyUrl || streamData?.streamUrl
      : streamData?.hlsProxyUrl || streamData?.m3u8 || streamData?.embedUrl;
  const activeSubtitles = streamData?.subtitles || [];

  const formattedEpisode =
    !episodeNumStr || isNaN(Number(episodeNumStr))
      ? "Active"
      : `EP ${episodeNumStr}`;

  useDocumentTitle(
    `Watching ${streamData?.title} ${formattedEpisode} ${streamData?.type}`,
  );

  if (loadingLayout) {
    return (
      <div className="w-full h-screen bg-[#0a0a0a] flex items-center justify-center text-white font-[Inter] animate-pulse">
        Initializing Cinemi Theater Framework...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-(--brand-color) font-[Inter] text-md font-semibold">
          Error Loading Streams
        </p>
        <Link
          to={`/anime/${animeId}`}
          className="text-white cursor-pointer bg-white/5 border border-white/10 px-5 py-2 rounded-lg text-[13px] font-semibold font-[Inter]"
        >
          Return to Details
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-(--neutral-color) min-h-screen relative pb-28 overflow-hidden">
      {/* Theater Lights Dim Switch Header */}
      <WatchHeader id={animeId} isDimmed={isDimmed} setIsDimmed={setIsDimmed} />

      {/* 🌟 NEW: INTERACTIVE GATEKEEPER AUDIO DISMISSAL TOAST BADGE */}
      {audioNotification && !isDimmed && (
        <div className="w-full max-w-7xl mx-auto px-4 mt-3 animate-[slide-down_0.25s_ease-out] select-none font-[Inter]">
          <div className="w-full bg-amber-500/10 border border-amber-500/20 text-amber-400 p-3.5 rounded-xl flex items-center gap-2.5 shadow-lg shadow-amber-950/10">
            <AlertCircle
              size={16}
              className="shrink-0 animate-pulse text-amber-400"
            />
            <p className="text-[13px] font-semibold leading-snug tracking-wide">
              {audioNotification}
            </p>
          </div>
        </div>
      )}

      {/* Grid Layout Track Container */}
      <div className="w-full max-w-7xl mx-auto px-0 md:px-4 lg:grid lg:grid-cols-4 lg:gap-6 items-start mt-2">
        <div className="lg:col-span-3 flex flex-col gap-6 w-full">
          {/* Main Video element screen viewport block */}
          <VideoCanvas
            videoUrl={streamData?.error ? "" : activeVideoUrl}
            loadingVideo={
              loadingVideo || loadingServers
            } /* Combines loading triggers for consistency */
            provider={activeProvider}
            referer={null}
            totalEpisodeList={totalEpisodeList}
            animeTitle={currentActiveEpisodeObj?.title || "Anime Stream"}
            episodeThumbnail={
              null
            } /* Removed thumbnail ref since new schema omits previews */
            subtitles={activeSubtitles}
            autoplayEnabled={autoplayEnabled}
            onEpisodeEnded={handleNextEpisodeClick}
          />

          {/* 🌟 NEW: THE INTEGRATED QUICK CONTROLS BAR (AUTOPLAY + PREV/NEXT BUTTONS) */}
          {!isDimmed && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 font-[Inter] px-4 md:px-0 select-none">
              {/* Left Column Section: Linear Navigation Action Deck */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={!hasPreviousEpisode}
                  onClick={handlePrevEpisodeClick}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border text-[13px] font-bold transition-all duration-200 cursor-pointer shadow-sm ${
                    hasPreviousEpisode
                      ? "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20"
                      : "bg-white/0 border-white/5 text-white/20 pointer-events-none"
                  }`}
                >
                  <ChevronLeft size={16} /> Prev Episode
                </button>

                <button
                  type="button"
                  disabled={!hasNextEpisode}
                  onClick={handleNextEpisodeClick}
                  className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border text-[13px] font-bold transition-all duration-200 cursor-pointer shadow-sm ${
                    hasNextEpisode
                      ? "bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20"
                      : "bg-white/0 border-white/5 text-white/20 pointer-events-none"
                  }`}
                >
                  Next Episode <ChevronRight size={16} />
                </button>
              </div>

              {/* Right Column Section: Persistent AutoPlay Toggle Feature pill */}
              <div
                onClick={handleToggleAutoplay}
                className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl cursor-pointer hover:bg-white/10 transition-colors shadow-sm"
              >
                <div className="flex flex-col leading-tight">
                  <span className="text-[13px] font-bold text-white tracking-wide">
                    Autoplay Episodes
                  </span>
                  <span className="text-[11px] text-[#a1a1a1]">
                    {autoplayEnabled
                      ? "Continuous playback on"
                      : "Will pause on completion"}
                  </span>
                </div>

                {/* Visual Switch Indicator element box layer */}
                <div
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-all duration-300 ${
                    autoplayEnabled ? "bg-(--primary-color)" : "bg-white/10"
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                      autoplayEnabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 🌟 NEW: THE REAL-TIME SERVER SWITCHING COMPONENT BAR (FIXED FOR OBJECTS) */}
          {!isDimmed && serverList.length > 0 && (
            <div className="flex flex-col gap-2 font-[Inter] px-4 md:px-0 select-none">
              <span className="text-[11px] text-[#a1a1a1] uppercase font-bold tracking-wider flex items-center gap-1.5">
                <Layers size={12} className="text-(--brand-color)" />
                Select Server:
              </span>
              <div className="flex flex-wrap gap-2">
                {serverList.map((server) => {
                  // Fallback target to server.name if sourceId is missing from a specific node
                  const currentServerId = server.name;
                  const isCurrentNode = currentServerId === activeServer;

                  return (
                    <button
                      key={currentServerId}
                      type="button"
                      onClick={() => setActiveServer(currentServerId)}
                      className={`px-3 py-1.5 rounded-lg border text-[12px] font-extrabold capitalize transition-all duration-200 cursor-pointer shadow-sm ${
                        isCurrentNode
                          ? "bg-(--primary-color) text-white border-none shadow-white/5"
                          : "bg-white/5 border-white/5 text-white/70 hover:border-white/20 hover:bg-white/10"
                      }`}
                    >
                      {/* 🌟 FIX: Renders the simple string name property value instead of the full object */}
                      {server.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 🌟 FIX: Active Episode Meta now automatically hides when 'isDimmed' is active */}
          <div
            className={`px-4 md:px-0 transition-opacity duration-500 ${isDimmed ? "opacity-0 pointer-events-none" : "opacity-100"}`}
          >
            <ActiveEpisodeMeta
              category={activeAudio}
              provider={activeProvider}
              episode={episodeNumStr}
              animeTitle={streamData?.title}
              activeEpisodeObj={currentActiveEpisodeObj}
            />
          </div>
        </div>

        {/* 🌟 FIX: Desktop sidebar automatically hides when 'isDimmed' is active */}
        <div
          className={`transition-opacity duration-500 ${isDimmed ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
          <DesktopPlaylistSidebar
            episodeData={episodeData}
            totalEpisodeList={totalEpisodeList}
            episodeChunks={episodeChunks}
            activeChunkIndex={activeChunkIndex}
            setActiveChunkIndex={setActiveChunkIndex}
            id={animeId}
            episode={episodeNumStr}
            activeProvider={activeProvider}
            activeAudio={activeAudio}
          />
        </div>
      </div>

      {/* 🌟 ENHANCEMENT: "UP NEXT" DYNAMIC DISCOVERY RECOMMENDATIONS LANE SHELF */}
      {!isDimmed && recommendations.length > 0 && (
        <div className="mt-10 pb-10 mb:pb-1 opacity-90 border-t border-white/5 pt-4">
          <CarouselRow
            title="You May Also Like..."
            seeAllLink="#"
            overrideData={recommendations.slice(0, 10).map((item) => ({
              id: item.id,
              mobileHref: `/anime/${item.id}`,
              // Land on the details page; Phase 1 auto-resolves a valid source.
              desktopHref: `/anime/${item.id}`,
              poster: item.poster,
              title: item.title,
              score: item.score ? (item.score / 10).toFixed(1) : "0.0",
              seasonYear: item.status || "",
              animeFormat: item.episodes ? `${item.episodes} Eps` : "N/A",
            }))}
          />
        </div>
      )}

      {/* Sticky Bottom Control Tray (Hidden on Desktops and when Dimmed) */}
      {!isDimmed && (
        <div
          onClick={() => setIsMobileDrawerOpen(true)}
          className="lg:hidden cursor-pointer fixed bottom-[82px] md:bottom-[77px] left-0 right-0 z-40 bg-[#0c0c0c]/95 backdrop-blur-md border-t border-white/5 px-4 py-3 flex items-center justify-between shadow-xl"
        >
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] text-white/40 uppercase font-bold tracking-wider font-mono">
              Current Track
            </span>
            <span className="text-[13px] font-bold text-white truncate max-w-[170px]">
              {currentActiveEpisodeObj?.title || `Episode ${episodeNumStr}`}
            </span>
          </div>
          <button
            type="button"
            className="bg-white/5 border border-white/10 text-white/90 font-bold text-[12px] uppercase tracking-wider py-2 px-4 rounded-lg flex items-center gap-1.5 cursor-pointer"
          >
            Episodes ({totalEpisodeList.length})
            <ChevronUp size={16} />
          </button>
        </div>
      )}

      {/* Sliding Mobile App-style Episode Drawer Sheet Container */}
      <MobilePlaylistDrawer
        isOpen={isMobileDrawerOpen}
        setIsOpen={setIsMobileDrawerOpen}
        episodeData={episodeData}
        totalEpisodeList={totalEpisodeList}
        episodeChunks={episodeChunks}
        activeChunkIndex={activeChunkIndex}
        setActiveChunkIndex={setActiveChunkIndex}
        id={animeId}
        episode={episodeNumStr}
        activeProvider={activeProvider}
        activeAudio={activeAudio}
      />
    </div>
  );
}

export default Stream;
