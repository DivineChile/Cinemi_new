// import { useRef, useEffect, useMemo } from "react";
// import Hls from "hls.js";

// export const Player = ({
//   videoUrl,
//   loadingVideo,
//   provider,
//   referer,
//   triggerIframeFallback,
//   playerTier,
// }) => {
//   const videoRef = useRef(null);

//   // 1. Memoize your custom headers-injection proxy URL transformation
//   const mainUrl = useMemo(() => {
//     if (!videoUrl) return "";

//     const params = new URLSearchParams({
//       url: videoUrl,
//       headers: JSON.stringify({
//         Referer: referer,
//       }),
//     });

//     return `https://another-proxy.fly.dev/m3u8-proxy?${params}`;
//   }, [videoUrl, referer]);

//   // 2. Core HLS Streaming Lifecycle Attachment Engine
//   useEffect(() => {
//     const video = videoRef.current;
//     if (!video || !mainUrl || loadingVideo) return;

//     let hls;

//     console.log("🎬 Connecting Stream Core:", {
//       mainUrl,
//       streamUrl: videoUrl,
//       Referer: referer,
//     });

//     // A. Check if Hls.js is supported by the browser (Chrome, Firefox, Edge, etc.)
//     if (Hls.isSupported()) {
//       hls = new Hls({
//         maxMaxBufferLength: 30, // Inherits your working baseline buffer size
//       });

//       hls.loadSource(mainUrl);
//       hls.attachMedia(video);

//       hls.on(Hls.Events.MANIFEST_PARSED, () => {
//         video.play().catch((err) => console.log("Autoplay blocked:", err));
//       });

//       // 🚨 Defensive Gatekeeper: If the stream engine throws a fatal error, trigger the fallback callback
//       hls.on(Hls.Events.ERROR, (event, data) => {
//         if (data.fatal) {
//           console.warn(
//             "Fatal HLS link interruption caught — triggering iframe fallback.",
//           );
//           triggerIframeFallback();
//         }
//       });
//     }
//     // B. Fallback to native Safari / Apple iOS playback
//     else if (video.canPlayType("application/vnd.apple.mpegurl")) {
//       video.src = mainUrl;

//       const handleNativeLoad = () => {
//         video.play().catch((err) => console.log("Autoplay blocked:", err));
//       };

//       const handleNativeError = () => {
//         console.warn(
//           "Native Apple HLS playback failed — triggering iframe fallback.",
//         );
//         triggerIframeFallback();
//       };

//       video.addEventListener("loadedmetadata", handleNativeLoad);
//       video.addEventListener("error", handleNativeError);

//       return () => {
//         video.removeEventListener("loadedmetadata", handleNativeLoad);
//         video.removeEventListener("error", handleNativeError);
//       };
//     } else {
//       // If the browser supports absolutely nothing, forward straight to the embed frame
//       triggerIframeFallback();
//     }

//     // Garbage Collection Cleanup: Destroys network hooks if user changes routes
//     return () => {
//       if (hls) {
//         hls.destroy();
//       }
//     };
//   }, [mainUrl]);

//   return (
//     <div className="w-full h-full relative bg-black flex items-center justify-center">
//       {/* Native HTML5 Video Layer using native browser control interfaces for clean testing */}
//       <video
//         ref={videoRef}
//         controls
//         className="w-full h-full object-contain"
//         playsInline
//       />
//     </div>
//   );
// };


import { useRef, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import Hls from "hls.js";

export const Player = ({
  videoUrl,
  loadingVideo,
  provider,
  referer,
  triggerIframeFallback,
  playerTier,
  totalEpisodeList, 
  animeTitle,
  episodeThumbnail
}) => {
  const videoRef = useRef(null);

  // Extract route parameters natively to identify unique Anime and active Episode slugs
  const { id, category, slug } = useParams();

  // 1. Memoize your custom headers-injection proxy URL transformation
  const mainUrl = useMemo(() => {
    if (!videoUrl) return "";

    const params = new URLSearchParams({
      url: videoUrl,
      headers: JSON.stringify({
        Referer: referer,
      }),
    });

    return `https://another-proxy.fly.dev/m3u8-proxy?${params}`;
  }, [videoUrl, referer]);

  // 2. Core HLS Streaming Lifecycle Attachment Engine
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !mainUrl || loadingVideo) return;

    let hls;

    console.log("🎬 Connecting Stream Core:", {
      mainUrl,
      streamUrl: videoUrl,
      Referer: referer,
    });

    // A. Check if Hls.js is supported by the browser (Chrome, Firefox, Edge, etc.)
    if (Hls.isSupported()) {
      hls = new Hls({
        maxMaxBufferLength: 30, // Inherits your working baseline buffer size
      });

      hls.loadSource(mainUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch((err) => console.log("Autoplay blocked:", err));
      });

      // 🚨 Defensive Gatekeeper: If the stream engine throws a fatal error, trigger the fallback callback
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.warn(
            "Fatal HLS link interruption caught — triggering iframe fallback.",
          );
          triggerIframeFallback();
        }
      });
    }
    // B. Fallback to native Safari / Apple iOS playback
    else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = mainUrl;

      const handleNativeLoad = () => {
        video.play().catch((err) => console.log("Autoplay blocked:", err));
      };

      const handleNativeError = () => {
        console.warn(
          "Native Apple HLS playback failed — triggering iframe fallback.",
        );
        triggerIframeFallback();
      };

      video.addEventListener("loadedmetadata", handleNativeLoad);
      video.addEventListener("error", handleNativeError);

      return () => {
        video.removeEventListener("loadedmetadata", handleNativeLoad);
        video.removeEventListener("error", handleNativeError);
      };
    } else {
      // If the browser supports absolutely nothing, forward straight to the embed frame
      triggerIframeFallback();
    }

    // Garbage Collection Cleanup: Destroys network hooks if user changes routes
    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [mainUrl]);

  // 🌟 3. CONTINUE WATCHING PROGRESS INITIAL HYDRATION HOOK
  // Snaps the native video track timeline forward on track launch if history exists
  useEffect(() => {
    const video = videoRef.current;
    if (!video || loadingVideo || !id || !slug) return;

    const handleLoadedMetadata = () => {
      const localHistory = localStorage.getItem("cinemi_history");
      if (localHistory) {
        const historyMap = JSON.parse(localHistory);
        const activeAnimeRecord = historyMap[id];

        // Ensure the saved session matches our exact active video slug path
        if (activeAnimeRecord && activeAnimeRecord.slug === slug) {
          const savedPosition = activeAnimeRecord.progressSeconds;
          const totalDuration = video.duration;

          // Prevent snapping to the absolute end if they already watched the full episode
          if (savedPosition > 10 && savedPosition < totalDuration - 15) {
            console.log(
              `⏱️ Cinemi Progress Restored: ${savedPosition} seconds`,
            );
            video.currentTime = savedPosition;
          }
        }
      }
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    return () =>
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
  }, [mainUrl, loadingVideo, id, slug]);

  // 🌟 4. THROTTLED HISTORY TRACKER WRITER METHOD
  // Records current timestamp parameters to local browser memory every 5 seconds
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !id || !slug) return;

    const currentSeconds = video.currentTime;
    const totalDuration = video.duration;

    // Performance Throttle Check: Writes only on multi-5 modulo seconds or at the absolute beginning
    if (Math.floor(currentSeconds) % 5 === 0 || currentSeconds < 2) {
      const localHistory = localStorage.getItem("cinemi_history");
      const historyMap = localHistory ? JSON.parse(localHistory) : {};

      // Match current slug against array properties to isolate the display EP number (default to 1)
      const episodeNumber = Array.isArray(totalEpisodeList)
        ? totalEpisodeList.find(
            (ep) => (ep.id?.split("/").pop() || ep.number.toString()) === slug,
          )?.number || 1
        : 1;

      historyMap[id] = {
        provider,
        category,
        slug,
        episodeNumber,
        animeTitle: animeTitle || `Anime #${id}`, // 🚀 Saves real title
        episodeThumbnail: episodeThumbnail || "", // 🚀 Saves real thumbnail
        progressSeconds: Math.floor(currentSeconds),
        durationSeconds: isNaN(totalDuration) ? 0 : Math.floor(totalDuration),
        updatedAt: Date.now(),
      };

      localStorage.setItem("cinemi_history", JSON.stringify(historyMap));
    }
  };

  return (
    <div className="w-full h-full relative bg-black flex items-center justify-center">
      {/* Attached the handleTimeUpdate tracker listener to the native HTML5 player */}
      <video
        ref={videoRef}
        onTimeUpdate={handleTimeUpdate}
        controls
        className="w-full h-full object-contain"
        playsInline
      />
    </div>
  );
};
