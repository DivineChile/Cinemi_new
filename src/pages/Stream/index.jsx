import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { WatchHeader } from "../../components/Stream/WatchHeader";
import { Link } from "lucide-react";
import { VideoCanvas } from "../../components/Stream/VideoCanvas";
import { ActiveEpisodeMeta } from "../../components/Stream/ActiveEpisodeMeta";

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
        if (availableProviders.length === 0)
          setError("No active streaming sources found.");

        const fallbackProvider = availableProviders.includes("pewe")
          ? "pewe"
          : availableProviders[0];

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
        console.log(streamPayload);
        setStreamData(streamPayload);
      } catch (err) {
        console.error(err);
        setError(err);
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
          ⚠️ {error}
        </p>
        <Link
          to={`/info/${id}`}
          className="text-white bg-white/5 border border-white/10 px-5 py-2 rounded-lg text-[13px] font-semibold font-[Inter]"
        >
          Return to Details
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-(--neutral-color) min-h-screen">
      <WatchHeader id={id} isDimmed={isDimmed} setIsDimmed={setIsDimmed} />
      <VideoCanvas
        videoUrl={activeVideoUrl}
        loadingVideo={loadingVideo}
        provider={provider}
      />
      <ActiveEpisodeMeta category={category} provider={provider} slug={slug}/>
    </div>
  );
}

export default Stream;
