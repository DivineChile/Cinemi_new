import { useRef, useState } from "react";
import { useParams } from "react-router-dom";
// 🌟 Vidstack Core Imports
import { MediaPlayer, MediaProvider, Track } from "@vidstack/react";
import {
  PlyrLayout,
  plyrLayoutIcons,
} from "@vidstack/react/player/layouts/plyr";

// Stylesheet distribution hooks pulled out of your exact local folder structure path variables
import "../../../../node_modules/@vidstack/react/player/styles/base.css";
import "../../../../node_modules/@vidstack/react/player/styles/plyr/theme.css";
import { Film } from "lucide-react";

export const Player = ({
  videoUrl,
  subtitles = [], // Target payload structure format: [{ url: "...", lang: "English", default: true }]
  loadingVideo,
  provider,
  referer,
  triggerIframeFallback,
  animeTitle,
}) => {
  const playerRef = useRef(null);

  // Extract parameters matching route path schema: /watch/:provider/:id/:episode/:category
  const {
    id: animeId,
    episode: episodeStr,
    category: audioCategory,
  } = useParams();

  const [isBuffering, setIsBuffering] = useState(false);

  // CONTINUE WATCHING PROGRESS INITIAL HYDRATION HOOK
  const handleCanPlay = () => {
    if (!playerRef.current || !animeId || !episodeStr) return;

    const localHistory = localStorage.getItem("cinemi_history");
    if (localHistory) {
      const historyMap = JSON.parse(localHistory);
      const activeAnimeRecord = historyMap[animeId];

      if (activeAnimeRecord && activeAnimeRecord.episode === episodeStr) {
        const savedPosition = activeAnimeRecord.progressSeconds;
        const totalDuration = playerRef.current.duration || 0;

        if (
          savedPosition > 10 &&
          (totalDuration === 0 || savedPosition < totalDuration - 15)
        ) {
          console.log(
            `⏱️ Vidstack Engine Restored Progress: ${savedPosition} seconds`,
          );
          playerRef.current.currentTime = savedPosition;
        }
      }
    }
  };

  // 🌟 FIX 1: Added 'state' directly into the arrow function parameters.
  // This stops the player from throwing a hidden undefined exception every millisecond!
  const handleTimeUpdate = (state, nativeEvent) => {
    if (!animeId || !episodeStr || !state) return;

    const currentSeconds = state.currentTime;
    const totalDuration = state.duration;

    if (Math.floor(currentSeconds) % 5 === 0 || currentSeconds < 2) {
      const localHistory = localStorage.getItem("cinemi_history");
      const historyMap = localHistory ? JSON.parse(localHistory) : {};

      const currentEpInt = parseInt(episodeStr, 10) || 1;

      historyMap[animeId] = {
        provider,
        category: audioCategory || "sub",
        episode: episodeStr,
        episodeNumber: currentEpInt,
        animeTitle: animeTitle || `Anime #${animeId}`,
        progressSeconds: Math.floor(currentSeconds),
        durationSeconds: isNaN(totalDuration) ? 0 : Math.floor(totalDuration),
        updatedAt: Date.now(),
      };

      localStorage.setItem("cinemi_history", JSON.stringify(historyMap));
    }
  };

  if (!videoUrl || loadingVideo) return null;

  return (
    <div className="w-full h-full relative bg-black flex items-center justify-center">
      <MediaPlayer
        ref={playerRef}
        // 🌟 FIX 2: Bypassed duplicate proxies. Binds the raw, already-proxied prop directly.
        src={{
          src: videoUrl,
          type: "application/x-mpegurl",
        }}
        viewType="video"
        streamType="on-demand"
        autoplay
        playsInline
        crossOrigin="anonymous" // Instructs the browser to send CORS credentials for subtitles
        onCanPlay={handleCanPlay}
        onTimeUpdate={handleTimeUpdate}
        // 🌟 FIX: Listen directly to stable top-level media event properties
        onWaiting={() => setIsBuffering(true)} // Fires immediately when stream buffers/stalls
        onPlaying={() => setIsBuffering(false)} // Fires when playback smoothly resumes
        onPause={() => setIsBuffering(false)} // Prevent loader showing if user pauses manually
        style={{
          "--plyr-color-main": "var(--primary-color, #ff0055)",
          "--plyr-video-control-background-hover":
            "var(--primary-color, #ff0055)",
          "--plyr-menu-background": "#0c0c0c",
          "--plyr-menu-color": "#ffffff",
        }}
        onError={() => {
          console.warn(
            "Vidstack player caught an error — triggering layout embed fallback.",
          );
          triggerIframeFallback();
        }}
        className="w-full h-full object-contain"
      >
        <MediaProvider>
          {/* 🌟 FIX 3: Explicit mappings tell Vidstack how to read your subtitles payload */}
          {Array.isArray(subtitles) &&
            subtitles.map((track, idx) => {
              const isoLangToken =
                track.lang?.toLowerCase().slice(0, 2) || "en";

              return (
                <Track
                  key={idx}
                  src={track.url}
                  lang={isoLangToken}
                  language={track.lang || "English"} // Explicitly pass the full string label name
                  label={track.lang || `Language ${idx + 1}`}
                  kind="subtitles"
                  type="vtt" // Declares the exact layout syntax formatting
                  default={track.default || idx === 0}
                />
              );
            })}
        </MediaProvider>

        {/* 🌟 EMBEDDED BUFFERING OVERLAY ELEMENT (Safe from signal store crashes) */}
        {isBuffering && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 z-60 pointer-events-none transition-opacity duration-200">
            <div className="p-4 bg-[#0c0c0c]/90 border border-white/5 rounded-2xl shadow-2xl flex flex-col items-center gap-2.5">
              <Film size={24} className="animate-spin text-(--primary-color)" />
              <span className="text-[12px] font-bold text-white font-[Inter] tracking-wide animate-pulse">
                Buffering stream...
              </span>
            </div>
          </div>
        )}

        <PlyrLayout icons={plyrLayoutIcons} />
      </MediaPlayer>
    </div>
  );
};
