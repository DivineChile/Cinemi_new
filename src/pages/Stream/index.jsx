import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { WatchHeader } from "../../components/Stream/WatchHeader";
import { VideoCanvas } from "../../components/Stream/VideoCanvas";
import { ActiveEpisodeMeta } from "../../components/Stream/ActiveEpisodeMeta";
import { DesktopPlaylistSidebar } from "../../components/Stream/DesktopPlaylistSidebar";
import { MobilePlaylistDrawer } from "../../components/Stream/MobilePlaylistDrawer";
import { ChevronUp } from "lucide-react";
import { CarouselRow } from "../../components/ui/CarouselRow";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

function Stream() {
  const PROXY_API_URL_V2 = import.meta.env.VITE_PROXY_API_URL_V2;
  const PROXY_API_URL = import.meta.env.VITE_PROXY_API_URL; // Kept only if info/recommendations endpoint relies on V1
  const EPISODES_PER_PAGE = 50;
  const anivaultWorkingProviders = ["senshi", "animeheaven", "anikoto"];

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

  // Streaming Configuration States
  const [activeAudio, setActiveAudio] = useState(audioCategory || "sub");
  const [activeProvider, setActiveProvider] = useState(provider || "senshi");
  const [activeChunkIndex, setActiveChunkIndex] = useState(0);
  const [recommendations, setRecommendations] = useState([]);

  // Cinematic and Layout Interaction States
  const [isDimmed, setIsDimmed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Sync state tracking variables with current URL parameter actions
  useEffect(() => {
    if (audioCategory) setActiveAudio(audioCategory);
    if (provider) setActiveProvider(provider);
  }, [audioCategory, provider]);

  // 🌟 STEP 1: INITIALIZE PARALLEL SOURCE DATA
  useEffect(() => {
    const initializeWatchView = async () => {
      try {
        setLoadingLayout(true);
        setError(null);
        console.log("Parallel Querying Episodes for:", animeId);

        // 1. Fire requests to all known servers simultaneously
        const fetchPromises = anivaultWorkingProviders.map((src) =>
          fetch(
            `${PROXY_API_URL_V2}/api/episodes?anilistId=${animeId}&source=${src}`,
          ),
        );

        const fetchResults = await Promise.allSettled(fetchPromises);

        // 2. Parse responses inside concurrent loops
        const jsonPromises = fetchResults.map(async (result, index) => {
          const providerName = anivaultWorkingProviders[index];
          if (result.status === "fulfilled" && result.value.ok) {
            try {
              const payload = await result.value.json();
              return { provider: providerName, data: payload, success: true };
            } catch (err) {
              return {
                provider: providerName,
                error: "JSON Error",
                success: false,
              };
            }
          }
          return {
            provider: providerName,
            error: "Network Error",
            success: false,
          };
        });

        const parsedResults = await Promise.all(jsonPromises);
        setEpisodeData(parsedResults);

        // 3. Isolate valid servers that returned full array track listings
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

        // 4. ROUTING FALLBACK: User clicked "Watch Now" on details page (Missing URL tracking tokens)
        if (!provider || !episodeNumStr || !audioCategory) {
          const targetObj = successfulFetches.find(
            (item) => item.provider === fallbackProvider,
          );
          const firstEp = targetObj?.data?.episodes?.[0];
          const targetEpNum = firstEp ? (firstEp.number ?? firstEp.num) : 1;

          // Push into predictable route path
          navigate(
            `/watch/${fallbackProvider}/${animeId}/${targetEpNum}/${activeAudio}`,
            { replace: true },
          );
          return;
        }

        setLoadingLayout(false);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load watch framework.");
        setLoadingLayout(false);
      }
    };

    if (animeId) initializeWatchView();
  }, [animeId, provider, episodeNumStr, audioCategory, navigate]);

  // Fetch Sidebar Info Recommendations
  useEffect(() => {
    const fetchBackupRecommendations = async () => {
      try {
        const res = await fetch(`${PROXY_API_URL}/info/${animeId}`);
        if (!res.ok) return;
        const infoData = await res.json();
        const recommendationsRaw =
          infoData?.recommendations?.nodes.map(
            (item) => item?.mediaRecommendation,
          ) || [];
        setRecommendations(recommendationsRaw);
      } catch (err) {
        console.error("Recommendations lookup failed:", err);
      }
    };
    if (animeId) fetchBackupRecommendations();
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

  // 🌟 STEP 3: VIDEO LINK RETRIEVAL USING THE NEW STRIPED ROUTE PATH
  useEffect(() => {
    if (!provider || !animeId || !episodeNumStr || !audioCategory) return;

    const fetchVideoStream = async () => {
      try {
        setLoadingVideo(true);
        // Generates endpoint payload path pattern: 'api/watch/${provider}/${animeId}/${episodeNum}/${activeAudio}'
        const res = await fetch(
          `${PROXY_API_URL_V2}/api/watch/${provider}/${animeId}/${episodeNumStr}/${audioCategory}`,
        );
        if (!res.ok)
          throw new Error("Stream player failed to query asset source link.");

        const streamPayload = await res.json();
        setStreamData(streamPayload);
        console.log(streamPayload);
      } catch (err) {
        console.error(err);
        setStreamData({ error: true });
      } finally {
        setLoadingVideo(false);
      }
    };

    fetchVideoStream();
  }, [provider, animeId, episodeNumStr, audioCategory]);

  // Extract direct source streaming configurations
  const activeVideoUrl =
    streamData?.playbackMode == "mp4"
      ? streamData?.mp4ProxyUrl || streamData?.streamUrl
      : streamData?.hlsProxyUrl || streamData?.m3u8 || streamData?.embedUrl;
  const activeSubtitles = streamData?.subtitles || [];
  console.log(episodeData);

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

  console.log(currentActiveEpisodeObj);

  return (
    <div className="bg-(--neutral-color) min-h-screen relative pb-28 overflow-hidden">
      {/* Theater Lights Dim Switch Header */}
      <WatchHeader id={animeId} isDimmed={isDimmed} setIsDimmed={setIsDimmed} />

      {/* Grid Layout Track Container */}
      <div className="w-full max-w-7xl mx-auto px-0 md:px-4 lg:grid lg:grid-cols-4 lg:gap-6 items-start mt-2">
        <div className="lg:col-span-3 flex flex-col gap-6 w-full">
          {/* Main Video element screen viewport block */}
          {console.log(streamData)}
          <VideoCanvas
            videoUrl={streamData?.error ? "" : activeVideoUrl}
            loadingVideo={loadingVideo}
            provider={activeProvider}
            referer={null}
            totalEpisodeList={totalEpisodeList}
            animeTitle={currentActiveEpisodeObj?.title || "Anime Stream"}
            episodeThumbnail={
              null
            } /* Removed thumbnail ref since new schema omits previews */
            subtitles={activeSubtitles}
          />

          {/* 🌟 FIX: Active Episode Meta now automatically hides when 'isDimmed' is active */}
          <div
            className={`px-4 md:px-0 transition-opacity duration-500 ${isDimmed ? "opacity-0 pointer-events-none" : "opacity-100"}`}
          >
            {console.log(streamData)}
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
          {console.log(episodeChunks)}
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
              desktopHref: `/watch/senshi/${item.id}/1/sub` /* Safely defaults destination parameters on routing click */,
              poster: item.coverImage?.extraLarge || item.coverImage?.large,
              title:
                item.title?.english || item.title?.romaji || item.title?.native,
              score: item.averageScore
                ? (item.averageScore / 10).toFixed(1)
                : "0.0",
              seasonYear: item.seasonYear || item?.startDate?.year || "",
              format: item.format || "N/A",
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
