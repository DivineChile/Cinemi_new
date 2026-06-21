import { useState, useEffect } from "react";
import { AlertCircle, Film } from "lucide-react";
import { Player } from "../Player";

export const VideoCanvas = ({ videoUrl, loadingVideo, provider, referer }) => {
  // 🎰 MULTI-TIER PLAYER STATE MACHINE
  // Options: 'hls' (Direct proxy stream), 'iframe' (Embedded fallback), 'failed' (All sources down)
  const [playerTier, setPlayerTier] = useState("hls");
  const [statusMessage, setStatusMessage] = useState("");

  // Always reset back to Tier 1 (HLS) whenever a brand new video URL loads in from the API
  useEffect(() => {
    if (videoUrl) {
      setPlayerTier("hls");
      setStatusMessage("");
    }
  }, [videoUrl]);

  // Callback trigger: Fires automatically if the inner HLS engine crashes or errors out
  const triggerIframeFallback = () => {
    console.warn(
      "⚠️ High-Level Shell: HLS player failed. Auto-switching to Iframe embed link...",
    );
    setStatusMessage(
      "Playback optimization triggered. Auto-switching to embedded mirror player...",
    );
    setPlayerTier("iframe");
  };

  // Callback trigger: Fires if the iframe layout layer also fails to load completely
  const triggerGlobalProviderFailure = () => {
    console.error(
      "❌ High-Level Shell: Direct streams and embed mirrors have both failed.",
    );
    setPlayerTier("failed");
  };

  return (
    /* 
      Rigid 16:9 widescreen layout aspect box framework.
      Snaps flush wall-to-wall on small mobile devices (rounded-none),
      but curves softly with borders on tablet/desktop displays (md:rounded-xl).
    */
    <div className="w-full aspect-video bg-black border border-white/5 shadow-2xl rounded-none md:rounded-xl overflow-hidden relative flex items-center justify-center text-white z-45">
      {/* 🌟 VIEW STATE 1: REUSABLE API PIPELINE LOADING SHIMMER */}
      {loadingVideo && (
        <div className="absolute inset-0 bg-neutral-950 flex flex-col items-center justify-center gap-3 text-white/50 text-[14px] font-[Inter] z-50">
          <Film size={28} className="animate-spin text-(--brand-color)" />
          <p className="animate-pulse tracking-wide font-medium">
            Securing dynamic streaming links...
          </p>
        </div>
      )}

      {/* 🌟 VIEW STATE 2: INTERACTIVE AUTO-RECOVERY TOAST POP-UP */}
      {statusMessage && playerTier === "iframe" && (
        <div className="absolute top-4 left-4 right-4 bg-[#b11226]/90 border border-white/10 text-white font-[Inter] text-[13px] font-semibold p-3 rounded-lg shadow-xl z-50 flex items-center gap-2 animate-[slide-down_0.3s_ease-out] select-none">
          <Film size={15} className="animate-spin shrink-0" />
          <p>{statusMessage}</p>
        </div>
      )}

      {/* 🎰 MULTI-TIER RECOVERY TRACK RENDERING BLOCKS */}

      {/* TIER 1: STABLE CUSTOM HLS PLAYER WITH native browser tools */}
      {playerTier === "hls" && (
        <Player
          videoUrl={videoUrl}
          loadingVideo={loadingVideo}
          provider={provider}
          referer={referer}
          triggerIframeFallback={triggerIframeFallback}
          playerTier={playerTier}
        />
      )}

      {/* TIER 2: SECURE EMBEDDED IFRAME FALLBACK CONTAINER LAYER */}
      {playerTier === "iframe" && videoUrl && (
        <iframe
          src={videoUrl} // Mounts your fallback embed watch link
          title="Cinemi Secondary Embedded Engine"
          className="w-full h-full bg-black border-none"
          allowFullScreen
          scrolling="no"
          allow="autoplay; encrypted-media; picture-in-picture"
          // Triggers total failure screen if the frame source drops connection
          onError={triggerGlobalProviderFailure}
        />
      )}

      {/* TIER 3: ABSOLUTE CRASH - INFORMS USER TO MANUALLY SWITCH CHANNELS/PROVIDERS */}
      {playerTier === "failed" && (
        <div className="absolute inset-0 bg-neutral-950 flex flex-col items-center justify-center gap-3 text-white/40 text-[14px] font-[Inter] px-6 text-center z-40">
          <AlertCircle size={36} className="text-[#b11226]" />
          <div className="flex flex-col gap-1">
            <p className="font-bold text-[16px] text-white/90">
              Source Connection Failure
            </p>
            <p className="text-[13px] text-[#a1a1a1] max-w-sm leading-normal">
              Playback is completely unavailable on channel{" "}
              <span className="uppercase text-white font-mono bg-white/10 border border-white/10 px-1.5 py-0.2 rounded text-[11px]">
                {provider || "Current"}
              </span>
              . Please use the menu below to switch streaming providers.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
