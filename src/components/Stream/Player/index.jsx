import { useRef } from "react";
import { useParams } from "react-router-dom";
// 🌟 Vidstack Core Imports
// 🌟 Vidstack Default Layout Styles and UI Component Packs
// 🌟 FIX: Import directly from the core 'vidstack' module using explicit paths
import "../../../../node_modules/@vidstack/react/player/styles/base.css";
import "../../../../node_modules/@vidstack/react/player/styles/plyr/theme.css";

import { MediaPlayer, MediaProvider, Track } from "@vidstack/react";

import {
  PlyrLayout,
  plyrLayoutIcons,
} from "@vidstack/react/player/layouts/plyr";

export const Player = ({
  videoUrl,
  subtitles = [], // Expects array structure: [{ url: "...", lang: "English", default: true }]
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

  // 2. CONTINUE WATCHING PROGRESS INITIAL HYDRATION HOOK
  // Vidstack calls onCanPlay when the media layout engine resolves and is prepared to snap timestamps
  const handleCanPlay = () => {
    if (!playerRef.current || !animeId || !episodeStr) return;

    const localHistory = localStorage.getItem("cinemi_history");
    if (localHistory) {
      const historyMap = JSON.parse(localHistory);
      const activeAnimeRecord = historyMap[animeId];

      if (activeAnimeRecord && activeAnimeRecord.episode === episodeStr) {
        const savedPosition = activeAnimeRecord.progressSeconds;
        const totalDuration = playerRef.current.duration || 0;

        // Prevent snapping to the absolute end if they already finished the file
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

  // 3. THROTTLED HISTORY TRACKER WRITER METHOD
  // Vidstack's onTimeUpdate passes down an object parameter exposing modern state targets directly
  const handleTimeUpdate = () => {
    if (!animeId || !episodeStr) return;

    const currentSeconds = state.currentTime;
    const totalDuration = state.duration;

    // Performance Throttle Check: Writes every 5 seconds or at the absolute start
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
      {/* 
        MediaPlayer acts as the structural root coordinator wrapper.
        It natively embeds hls.js internally behind the scenes.
      */}
      <MediaPlayer
        ref={playerRef}
        src={{
          src: videoUrl,
          type: "application/x-mpegurl",
        }}
        viewType="video"
        streamType="on-demand"
        autoplay
        playsInline
        crossOrigin="anonymous" // 🌟 Essential: Enables cross-origin fetching for external subtitle vtt text files
        onCanPlay={handleCanPlay}
        onTimeUpdate={handleTimeUpdate}
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
          {/* 4. DYNAMIC SUBTITLE INJECTION LAYER */}
          {Array.isArray(subtitles) &&
            subtitles.map((track, idx) => (
              <Track
                key={idx}
                src={track.url}
                lang={track.lang?.toLowerCase().slice(0, 2) || "en"}
                label={track.lang || `Language ${idx + 1}`}
                kind="subtitles"
                default={track.default || idx === 0} // Highlights first loaded sub language track track
              />
            ))}
        </MediaProvider>

        {/* 5. GORGEOUS COMPACT PLAYER SKIN LAYER CONTROL BAR */}
        {/* Mounts fully customized cross-platform controls natively instantly */}
        <PlyrLayout icons={plyrLayoutIcons} />
      </MediaPlayer>
    </div>
  );
};

//
