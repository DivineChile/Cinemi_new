import { useRef, useEffect, useMemo } from "react";
import Hls from "hls.js";

export const Player = ({
  videoUrl,
  loadingVideo,
  provider,
  referer,
  triggerIframeFallback,
  playerTier,
}) => {
  const videoRef = useRef(null);

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

  return (
    <div className="w-full h-full relative bg-black flex items-center justify-center">
      {/* Native HTML5 Video Layer using native browser control interfaces for clean testing */}
      <video
        ref={videoRef}
        controls
        className="w-full h-full object-contain"
        playsInline
      />
    </div>
  );
};
