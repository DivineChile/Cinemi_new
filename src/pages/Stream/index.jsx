import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { WatchHeader } from "../../components/Stream/WatchHeader";
import { VideoCanvas } from "../../components/Stream/VideoCanvas";
import { ActiveEpisodeMeta } from "../../components/Stream/ActiveEpisodeMeta";
import { DesktopPlaylistSidebar } from "../../components/Stream/DesktopPlaylistSidebar";
import { MobilePlaylistDrawer } from "../../components/Stream/MobilePlaylistDrawer";
import { ChevronUp } from "lucide-react";
import { CarouselRow } from "../../components/ui/CarouselRow";

function Stream() {
  const PROXY_API_URL = import.meta.env.VITE_PROXY_API_URL;
  const EPISODES_PER_PAGE = 100;

  const { id, provider, category, slug } = useParams();
  const navigate = useNavigate();

  // Primary Data and Media Loading States
  const [episodeData, setEpisodeData] = useState(null);
  const [streamData, setStreamData] = useState(null);
  const [loadingLayout, setLoadingLayout] = useState(true);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [error, setError] = useState(null);

  // Streaming Configuration States
  const [activeAudio, setActiveAudio] = useState(category || "sub");
  const [activeProvider, setActiveProvider] = useState(provider || "");
  const [activeChunkIndex, setActiveChunkIndex] = useState(0);
  const [recommendations, setRecommendations] = useState([]);

  // Cinematic and Layout Interaction States
  const [isDimmed, setIsDimmed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const [activeEpisodeList, setActiveEpisodeList] = useState([]);
  const [currentActiveEpisodeObj, setCurrentActiveEpisodeObj] = useState(null);

  // 🌟 STEP 1 & 2 ROUTING RESOLVER LOGIC
  useEffect(() => {
    const initializeWatchView = async () => {
      try {
        setLoadingLayout(true);
        setError(null);

        // Fetch Step 1: Episode mappings structure
        const res = await fetch(`${PROXY_API_URL}/episodes/${id}`);
        if (!res.ok) setError("Failed to capture streaming map references.");
        const epPayload = await res.json();
        setEpisodeData(epPayload);

        // Detect available providers
        const availableProviders = Object.keys(epPayload.providers || {});
        const realProviders = availableProviders.filter(
          (provider) => provider !== "kiwi" && provider !== "hop",
        );

        if (realProviders.length === 0)
          setError("No active streaming sources found.");

        const fallbackProvider = realProviders.includes("bee")
          ? "bee"
          : realProviders[0];

        // SCENARIO A: Routed from Home Page "Watch Now" (Missing trailing layout parameters)
        if (!provider || !category || !slug) {
          const firstEp =
            epPayload.providers?.[fallbackProvider]?.episodes?.sub?.[0];
          if (!firstEp) setError("No valid episodes found for this title.");

          // If the episode has a complete custom tracking path string, use it, else formulate it
          const TargetRoute = firstEp.id
            ? `/${firstEp.id}`
            : `/watch/${fallbackProvider}/${id}/sub/${firstEp.number}`;

          navigate(TargetRoute, { replace: true });
          return;
        }

        // SCENARIO B: Deep-linked directly (All route variables are active)
        setLoadingLayout(false);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load watch framework.");
        setLoadingLayout(false);
      }
    };

    if (id) initializeWatchView();
  }, [id, provider, category, slug, navigate]);

  useEffect(() => {
    const fetchBackupRecommendations = async () => {
      try {
        const res = await fetch(`${PROXY_API_URL}/info/${id}`);
        if (!res.ok) return;
        const infoData = await res.json();
        const recommendationsRaw =
          infoData?.recommendations?.nodes.map(
            (item) => item?.mediaRecommendation,
          ) || [];
        setRecommendations(recommendationsRaw || []);
      } catch (err) {
        console.error("Recommendations lookup failed:", err);
      }
    };
    if (id) fetchBackupRecommendations();
  }, [id]);

  // 🌟 2. NEW LOGIC SWITCH BOARD SYSTEM: Triggers live episode switches when URL changes
  useEffect(() => {
    if (!episodeData || !provider || !category || !slug) return;

    // A. Isolate the target provider's array list dynamically
    const targetProviderDeck =
      episodeData?.providers?.[provider]?.episodes?.[category] || [];
    setActiveEpisodeList(targetProviderDeck);

    // B. Re-map and discover the active card object matching the new slug identifier
    const activeObj = targetProviderDeck.find((ep) => {
      const epSlugToken = ep.id?.split("/").pop() || ep.number.toString();
      return slug === epSlugToken;
    });
    setCurrentActiveEpisodeObj(activeObj || null);
  }, [episodeData, provider, category, slug]); // Fires immediately whenever a dropdown selection updates the parameters

  // 🌟 STEP 3: OUTBOUND VIDEO LINK RETRIEVAL
  useEffect(() => {
    // Only query video links if deep parameters are fully mapped and ready
    if (!provider || !id || !category || !slug) return;

    const fetchVideoStream = async () => {
      try {
        setLoadingVideo(true);
        // Using recommended step 2/3 structured layout forwarding format
        const res = await fetch(
          `${PROXY_API_URL}/watch/${provider}/${id}/${category}/${slug}`,
        );
        if (!res.ok)
          setError("Stream player failed to query asset source link.");
        const streamPayload = await res.json();
        setStreamData(streamPayload);
      } catch (err) {
        console.error(err);
        setError(err);
        setStreamData({ error: true });
      } finally {
        setLoadingVideo(false);
      }
    };

    fetchVideoStream();
  }, [provider, id, category, slug]);

  // Segments the active provider episode array list into blocks of 100 items each
  const { episodeChunks, currentChunkIndexFromUrl } = useMemo(() => {
    const chunks = [];
    for (let i = 0; i < activeEpisodeList.length; i += EPISODES_PER_PAGE) {
      chunks.push(activeEpisodeList.slice(i, i + EPISODES_PER_PAGE));
    }

    // Auto-discover which chunk index the user's active url episode belongs to
    const urlEpNum = currentActiveEpisodeObj?.number || 1;
    const calculatedChunkIdx = Math.floor((urlEpNum - 1) / EPISODES_PER_PAGE);
    const validChunkIdx =
      calculatedChunkIdx >= 0 && calculatedChunkIdx < chunks.length
        ? calculatedChunkIdx
        : 0;

    return { episodeChunks: chunks, currentChunkIndexFromUrl: validChunkIdx };
  }, [activeEpisodeList, currentActiveEpisodeObj]);

  // Sync active chunk selection view frame whenever a new episode mounts
  useEffect(() => {
    setActiveChunkIndex(currentChunkIndexFromUrl);
  }, [currentChunkIndexFromUrl]);

  // Extract primary direct source streaming url (M3U8 / HLS player file or secure Iframe link proxy)
  const activeVideoUrl =
    streamData?.headers?.referer || streamData?.streams?.[0]?.url || "";

  const activeReferer = streamData?.streams?.[0]?.referer || "";

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
          to={`/anime/${id}`}
          className="text-white cursor-pointer bg-white/5 border border-white/10 px-5 py-2 rounded-lg text-[13px] font-semibold font-[Inter]"
        >
          Return to Details
        </Link>
      </div>
    );
  }

  const activeAnimeTitle =
    episodeData?.mappings?.title?.english ||
    episodeData?.mappings?.title?.romaji ||
    episodeData?.mappings?.title ||
    "Active Anime";
  const activeEpisodeImg = currentActiveEpisodeObj?.image || "";

  return (
    <div className="bg-(--neutral-color) min-h-screen relative pb-28 overflow-hidden">
      {/* Theater Lights Dim Switch Header */}
      <WatchHeader id={id} isDimmed={isDimmed} setIsDimmed={setIsDimmed} />

      {/* Grid Layout Track Container */}
      <div className="w-full max-w-7xl mx-auto px-0 md:px-4 lg:grid lg:grid-cols-4 lg:gap-6 items-start mt-2">
        <div className="lg:col-span-3 flex flex-col gap-6 w-full">
          {/* Main Video element screen viewport block */}
          <VideoCanvas
            videoUrl={streamData?.error ? "" : activeVideoUrl}
            loadingVideo={loadingVideo}
            provider={provider}
            referer={activeReferer}
            totalEpisodeList={activeEpisodeList}
            animeTitle={activeAnimeTitle}
            episodeThumbnail={activeEpisodeImg}
          />

          {/* 🌟 FIX: Active Episode Meta now automatically hides when 'isDimmed' is active */}
          <div
            className={`px-4 md:px-0 transition-opacity duration-500 ${isDimmed ? "opacity-0 pointer-events-none" : "opacity-100"}`}
          >
            <ActiveEpisodeMeta
              category={category}
              provider={provider}
              slug={slug}
              activeEpisodeObj={currentActiveEpisodeObj}
              // downloadUrl={downloadLink}
            />
          </div>
        </div>

        {/* 🌟 FIX: Desktop sidebar automatically hides when 'isDimmed' is active */}
        <div
          className={`transition-opacity duration-500 ${isDimmed ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
          <DesktopPlaylistSidebar
            episodeData={episodeData}
            totalEpisodeList={activeEpisodeList}
            episodeChunks={episodeChunks}
            activeChunkIndex={activeChunkIndex}
            setActiveChunkIndex={setActiveChunkIndex}
            id={id}
            slug={slug}
            activeProvider={provider}
            activeAudio={category}
          />
        </div>
      </div>

      {/* 🌟 ENHANCEMENT: "UP NEXT" DYNAMIC DISCOVERY RECOMMENDATIONS LANE SHELF */}
      {/* Sits right at the bottom base line inside the layout limits to add depth to the page view */}
      {!isDimmed && recommendations.length > 0 && (
        <div className="mt-10 pb-10 mb:pb-1 opacity-90 border-t border-white/5 pt-4">
          <CarouselRow
            title="You May Also Like..."
            seeAllLink="#"
            overrideData={recommendations.slice(0, 10).map((item) => ({
              id: item.id,
              mobileHref: `/anime/${item.id}`,
              desktopHref: `/watch/${item.id}`,
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
              {currentActiveEpisodeObj?.title ||
                `Episode ${slug?.split("-").pop()}`}
            </span>
          </div>
          <span
            type="button"
            className="bg-white/5 border border-white/10 text-white/90 font-bold text-[12px] uppercase tracking-wider py-2 px-4 rounded-lg flex items-center gap-1.5"
          >
            Episodes ({activeEpisodeList.length})
            <ChevronUp />
          </span>
        </div>
      )}

      {/* Sliding Mobile App-style Episode Drawer Sheet Container */}
      <MobilePlaylistDrawer
        isOpen={isMobileDrawerOpen}
        setIsOpen={setIsMobileDrawerOpen}
        episodeData={episodeData}
        totalEpisodeList={activeEpisodeList}
        episodeChunks={episodeChunks}
        activeChunkIndex={activeChunkIndex}
        setActiveChunkIndex={setActiveChunkIndex}
        id={id}
        slug={slug}
        activeProvider={provider}
        activeAudio={category}
      />
    </div>
  );
}

export default Stream;
