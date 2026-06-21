import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { WatchHeader } from "../../components/Stream/WatchHeader";
import { VideoCanvas } from "../../components/Stream/VideoCanvas";
import { ActiveEpisodeMeta } from "../../components/Stream/ActiveEpisodeMeta";
import { DesktopPlaylistSidebar } from "../../components/Stream/DesktopPlaylistSidebar";

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

  // Synchronize Chunk pagination index updates upon stream switches
  useEffect(() => {
    setActiveChunkIndex(0);
  }, [activeAudio, activeProvider]);

  // Memorize and slice episode sets to maximize performance speeds
  const { totalEpisodeList, episodeChunks } = useMemo(() => {
    const pData = episodeData?.providers?.[activeProvider || provider];
    const rawList = pData?.episodes?.[activeAudio || category];
    const verifiedList = Array.isArray(rawList) ? rawList : [];

    const chunks = [];
    for (let i = 0; i < verifiedList.length; i += EPISODES_PER_PAGE) {
      chunks.push(verifiedList.slice(i, i + EPISODES_PER_PAGE));
    }
    return { totalEpisodeList: verifiedList, episodeChunks: chunks };
  }, [episodeData, activeProvider, provider, activeAudio, category]);

  const paginatedEpisodeList = episodeChunks[activeChunkIndex] || [];

  // Extract primary direct source streaming url (M3U8 / HLS player file or secure Iframe link proxy)
  const activeVideoUrl =
    streamData?.headers?.referer || streamData?.streams?.[0]?.url || "";

  const activeReferer = streamData?.streams?.[0]?.referer || "";

  console.log(activeVideoUrl);

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

  return (
    <div className="bg-(--neutral-color) min-h-screen relative pb-16 overflow-hidden">
      {/* 1. Global Navigation & Cinematic Control Header (Stays full-width) */}
      <WatchHeader id={id} isDimmed={isDimmed} setIsDimmed={setIsDimmed} />

      {/* 🌟 2. RESPONSIVE GRID LAYOUT SYSTEM CONTAINER */}
      {/* 
        On mobile: Acts as a normal single-column block layout with zero outer padding.
        On desktops (lg:): Morphs into your premium asymmetrical 4-column split grid track.
      */}
      <div className="w-full max-w-7xl mx-auto px-0 md:px-4 lg:grid lg:grid-cols-4 lg:gap-6 items-start mt-2">
        {/* LEFT COLUMN RAIL: Occupies 3 columns on big screens, expands to full width on mobile */}
        <div className="lg:col-span-3 flex flex-col gap-5 w-full">
          {/* Main Media Player Viewport Screen Canvas */}
          <VideoCanvas
            videoUrl={streamData?.error ? "" : activeVideoUrl}
            loadingVideo={loadingVideo}
            provider={provider}
            referer={activeReferer}
          />

          {/* Typographic Episode Title & Server Node Summaries */}
          {/* Added internal mobile padding helper wrapper bounds so text doesn't touch the screen edge on mobile */}
          <div className="px-4 md:px-0">
            <ActiveEpisodeMeta
              category={category}
              provider={provider}
              slug={slug}
              activeEpisodeObj={currentActiveEpisodeObj}
            />
          </div>
        </div>

        {/* RIGHT COLUMN RAIL: Occupies exactly 1 column on desktop screens */}
        {/* The component layout file itself contains 'hidden lg:flex' classes, so it automatically ignores mobile streams */}
        <DesktopPlaylistSidebar
          episodeData={episodeData}
          totalEpisodeList={activeEpisodeList}
          id={id}
          slug={slug}
          activeProvider={provider}
          activeAudio={category}
        />
      </div>
    </div>
  );
}

export default Stream;
