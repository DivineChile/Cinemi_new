import React, { useRef, useState, useEffect, useMemo } from "react";
import Hls from "hls.js";
import {
  Play,
  Pause,
  Square,
  RotateCw,
  Volume2,
  VolumeX,
  Settings,
  Maximize,
  Minimize,
  Film,
  AlertCircle,
  Subtitles,
} from "lucide-react";

export const VideoCanvas = ({ videoUrl, loadingVideo, provider }) => {
  // DOM & Library Core Engine References
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hlsRef = useRef(null);

  // Playback Control UI States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Interface Visibility and Dropdown States
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackError, setPlaybackError] = useState(false);

  // HLS Manifest Level Track States (Resolutions)
  const [qualities, setQualities] = useState([]);
  const [currentQuality, setCurrentQuality] = useState(-1); // -1 defaults to 'Auto'

  // Text Capture Captions Track States (Subtitles)
  const [subtitles, setSubtitles] = useState([]);
  const [activeSubtitle, setActiveSubtitle] = useState(-1); // -1 defaults to 'Off'
  // 🌟 NEW MULTI-TIER RECOVERY TRACKER STATE
  // Options: 'hls' (Direct .m3u8), 'iframe' (Embed Fallback), 'failed' (Global block)
  const [playerTier, setPlayerTier] = useState("hls");
  const [statusMessage, setStatusMessage] = useState("");

  // 🌟 EFFECTS BINDING 1: INITIALIZE OR REBOOT HLS.JS STREAMING ENGINE CORE
  useEffect(() => {
    if (!videoUrl || loadingVideo) return;

    const video = videoRef.current;
    if (!video) return;

    // Reset interface conditions on new track injection
    setPlaybackError(false);
    setIsPlaying(false);
    setQualities([]);
    setCurrentQuality(-1);
    setSubtitles([]);
    setActiveSubtitle(-1);

    // Completely dismantle older active streaming engine loops to free up system memory
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // NATIVE SAFARI / IOS PLAYBACK HOOK
    // Apple browsers decode .m3u8 files directly without needing external libraries
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoUrl;

      const syncNativeMetadata = () => {
        setDuration(video.duration);
      };

      video.addEventListener("loadedmetadata", syncNativeMetadata);
      return () =>
        video.removeEventListener("loadedmetadata", syncNativeMetadata);
    }

    // STANDARD BROWSERS HOOK (Chrome, Firefox, Brave, Edge, etc.)
    else if (Hls.isSupported()) {
      // Configure defensive streaming parameters (caps backbuffer lengths to protect device RAM)
      const hls = new Hls({
        maxMaxBufferLength: 30,
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;

      hls.loadSource(videoUrl);
      hls.attachMedia(video);

      // Listener A: Fires when video stream metadata files parse completely
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (video) setDuration(video.duration);

        // Map available quality levels cleanly into our custom selection array
        const mappedQualities = hls.levels.map((level, index) => ({
          index,
          height: level.height,
          bitrate: level.bitrate,
        }));
        setQualities(mappedQualities);
      });

      // Listener B: Catch critical streaming pipeline errors to trigger our UI fallback panel
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error("HLS.js Encountered Fatal Streaming Error:", data);
          setPlaybackError(true);
        }
      });
    }

    // Fallback if browser is ancient and supports absolutely nothing
    else {
      setPlaybackError(true);
    }

    // CLEANUP GARBAGE COLLECTION: Fires if user changes episodes or leaves the watch page mid-stream
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [videoUrl, loadingVideo]);

  // 🌟 EFFECTS BINDING 2: SUBTITLE TEXT TRACK RESOLVER LISTENER
  // Periodically audits video element tracks to bind dynamic cross-origin subtitle files
  useEffect(() => {
    const video = videoRef.current;
    if (!video || duration === 0) return;

    const tracks = video.textTracks;
    if (tracks && tracks.length > 0 && subtitles.length === 0) {
      const parsedTracks = Array.from(tracks).map((track, i) => ({
        index: i,
        label: track.label || track.language || `Subtitle Track ${i + 1}`,
        trackObj: track,
      }));
      setSubtitles(parsedTracks);
    }
  }, [duration, subtitles.length]);

  // 🌟 PLAYER ENGINE CONTROLS: INTERACTIVE METHOD PLUGINS

  // 1. Toggles video playback state cleanly between playing and paused
  const togglePlay = () => {
    if (!videoRef.current || playbackError) return;

    if (videoRef.current.paused) {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error("Playback interrupted:", err));
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // 2. Completely stops media playback and rewinds the timeline back to frame zero
  const stopVideo = () => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // 3. Advances the current timeline position forward by exactly 10 seconds
  const fastForward = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(
      videoRef.current.currentTime + 10,
      duration,
    );
  };

  // 4. Synchronizes React states with the hardware element timing parameters as frames tick
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // 5. Allows smooth timeline scrubbing via our custom slider range track
  const handleSeekChange = (e) => {
    if (!videoRef.current) return;
    const time = parseFloat(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
  };

  // 6. Scales the player's internal audio amplitude values cleanly
  const handleVolumeChange = (e) => {
    if (!videoRef.current) return;
    const vol = parseFloat(e.target.value);
    videoRef.current.volume = vol;
    setVolume(vol);
    setIsMuted(vol === 0);
    videoRef.current.muted = vol === 0;
  };

  // 7. Instantly mutes or restores previous audio volume scales
  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuteState = !videoRef.current.muted;
    videoRef.current.muted = nextMuteState;
    setIsMuted(nextMuteState);
    if (!nextMuteState && volume === 0) {
      // If unmuting while volume was zero, restore to a safe 30% default volume baseline
      videoRef.current.volume = 0.3;
      setVolume(0.3);
    }
  };

  // 8. Instructs Hls.js to instantly switch stream resolution level pipelines
  const changeQuality = (index) => {
    if (!hlsRef.current) return;
    hlsRef.current.currentLevel = index;
    setCurrentQuality(index);
    setShowSettings(false);
  };

  // 9. Controls web text tracks visibility to activate specified closed captions files
  const changeSubtitle = (index) => {
    if (!videoRef.current) return;
    const tracks = videoRef.current.textTracks;

    Array.from(tracks).forEach((track, i) => {
      track.mode = i === index ? "showing" : "disabled";
    });
    setActiveSubtitle(index);
    setShowSettings(false);
  };

  // 10. Coordinates browser-native APIs to expand/exit true cinematic fullscreen view
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch((err) => console.error("Fullscreen entry rejected:", err));
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch((err) => console.error("Fullscreen exit failed:", err));
    }
  };

  // Helper utility: Formats raw stream seconds cleanly into digital clocks (e.g., 04:20)
  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === Infinity) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // 🌟 AUTOMATED INTERFACE ACTIVITY DETECTOR
  // Fades out HUD control panels if the video is playing and the mouse stays dead stationary
  useEffect(() => {
    let timeoutId;
    const moveMouse = () => {
      setShowControls(true);
      clearTimeout(timeoutId);
      if (isPlaying) {
        timeoutId = setTimeout(() => setShowControls(false), 2500);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", moveMouse);
      container.addEventListener("click", moveMouse);
      // Synchronize hardware fullscreen tracking with device escape keystroke releases
      const handleFsChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
      };
      document.addEventListener("fullscreenchange", handleFsChange);

      return () => {
        container.removeEventListener("mousemove", moveMouse);
        container.removeEventListener("click", moveMouse);
        document.removeEventListener("fullscreenchange", handleFsChange);
      };
    }
  }, [isPlaying]);

  return (
    <div
      ref={containerRef}
      className="w-full aspect-video bg-black border border-white/5 shadow-2xl rounded-none md:rounded-xl overflow-hidden relative group z-45"
    >
      {/* HUD CASE 1: LOADING SKELETON LAYER */}
      {loadingVideo && (
        <div className="absolute inset-0 bg-neutral-950 flex flex-col items-center justify-center gap-3 text-white/50 text-[14px] font-[Inter] z-50">
          <Film size={28} className="animate-spin text-(--brand-color)" />
          <p className="animate-pulse tracking-wide font-medium">
            Securing dynamic streaming links...
          </p>
        </div>
      )}

      {/* HUD CASE 2: CRASH / TIMEOUT FALLBACK SCREEN LAYER */}
      {playbackError && (
        <div className="absolute inset-0 bg-neutral-950 flex flex-col items-center justify-center gap-2.5 text-white/40 text-[14px] font-[Inter] px-4 text-center z-50">
          <AlertCircle size={32} className="text-[#b11226]/60" />
          <p className="font-bold text-white/80">Playback Error</p>
          <p className="text-[13px] text-[#a1a1a1]">
            Direct video stream links timed out for provider{" "}
            {provider || "UNKNOWN"}.
          </p>
        </div>
      )}

      {/* HARDWARE INTERACTION MEDIA DECODER CORE */}
      <video
        ref={videoRef}
        onTimeUpdate={handleTimeUpdate}
        onClick={togglePlay}
        className="w-full h-full cursor-pointer object-contain"
        playsInline
      />

      {/* ATMOSPHERIC COMPONENT CONTROLS WRAPPER OVERLAY TRACK */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/50 flex flex-col justify-between transition-opacity duration-300 font-[Inter] z-40 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Top Control Strip HUD Panel */}
        <div className="p-4 flex justify-between items-center">
          <span className="text-[11px] bg-black/40 border border-white/10 px-2.5 py-0.5 rounded text-white/60 font-semibold uppercase tracking-wider select-none">
            Server: {provider || "Default"}
          </span>
        </div>

        {/* Bottom Control Deck Panel */}
        <div
          className="p-4 flex flex-col gap-3 w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* PROGRESS TIMELINE SEEK RANGE CONTROLLER TRACK */}
          <div className="flex items-center gap-3 w-full group/timeline">
            <span className="text-[11px] text-white/80 font-mono min-w-[34px] select-none text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeekChange}
              className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-(--primary-color) hover:h-1.5 transition-all outline-none"
            />
            <span className="text-[11px] text-white/50 font-mono min-w-[34px] select-none">
              {formatTime(duration)}
            </span>
          </div>

          {/* ACTION BUTTON CONTROLS MODULE GRID STRIP */}
          <div className="flex justify-between items-center w-full relative">
            {/* Left Deck: Playback speed mechanics, Volume level management sliders */}
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlay}
                className="text-white/80 hover:text-white transition-colors p-1"
                type="button"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause size={18} fill="currentColor" />
                ) : (
                  <Play size={18} fill="currentColor" />
                )}
              </button>
              <button
                onClick={stopVideo}
                className="text-white/80 hover:text-white transition-colors p-1"
                type="button"
                aria-label="Stop"
              >
                <Square size={16} fill="currentColor" />
              </button>
              <button
                onClick={fastForward}
                className="text-white/80 hover:text-white transition-colors flex items-center gap-1 text-[11px] font-bold p-1"
                type="button"
                title="Skip 10 seconds"
              >
                <RotateCw size={16} /> <span>10s</span>
              </button>

              {/* Expandable Volume slider module strip */}
              <div className="flex items-center gap-2 group/volume ml-2">
                <button
                  onClick={toggleMute}
                  className="text-white/80 hover:text-white transition-colors p-1"
                  type="button"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-0 group-hover/volume:w-16 h-1 bg-white/20 appearance-none rounded-md cursor-pointer accent-white transition-all duration-300 outline-none"
                />
              </div>
            </div>

            {/* Right Deck: Quality resolution adjustments parameters toggles */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`transition-colors p-1 ${showSettings ? "text-(--brand-color)" : "text-white/80 hover:text-white"}`}
                type="button"
                aria-label="Settings"
              >
                <Settings size={18} />
              </button>
              <button
                onClick={toggleFullscreen}
                className="text-white/80 hover:text-white transition-colors p-1"
                type="button"
                aria-label="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>
            </div>

            {/* ⚙️ FLY-OUT SETTINGS DROPDOWN SUBMENU CONTEXT OVERLAY OVERLAY PANEL */}
            {showSettings && (
              <div className="absolute bottom-12 right-0 bg-[#0e0e0e]/95 border border-white/10 rounded-xl p-4 w-52 flex flex-col gap-3.5 shadow-2xl backdrop-blur-md text-[12px] font-[Inter]">
                {/* Section A: Multi-Resolution Video Quality Track Array Map Selection */}
                {qualities.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[#a1a1a1] font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 select-none">
                      <Film size={11} /> Quality
                    </span>
                    <div className="flex flex-col max-h-24 overflow-y-auto gap-0.5 pr-1">
                      <button
                        onClick={() => changeQuality(-1)}
                        className={`text-left px-2 py-1 rounded transition-colors ${currentQuality === -1 ? "bg-(--primary-color) text-white font-bold" : "hover:bg-white/5 text-white/70"}`}
                      >
                        Auto
                      </button>
                      {qualities.map((q) => (
                        <button
                          key={q.index}
                          onClick={() => changeQuality(q.index)}
                          className={`text-left px-2 py-1 rounded transition-colors ${currentQuality === q.index ? "bg-(--primary-color) text-white font-bold" : "hover:bg-white/5 text-white/70"}`}
                        >
                          {q.height}p
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section B: Closed Captions Subtitle Language Track Selection */}
                <div className="flex flex-col gap-1.5 border-t border-white/5 pt-2">
                  <span className="text-[#a1a1a1] font-bold uppercase tracking-wider text-[10px] flex items-center gap-1 select-none">
                    <Subtitles size={11} /> Captions
                  </span>
                  <div className="flex flex-col max-h-24 overflow-y-auto gap-0.5 pr-1">
                    <button
                      onClick={() => changeSubtitle(-1)}
                      className={`text-left px-2 py-1 rounded transition-colors ${activeSubtitle === -1 ? "bg-(--primary-color) text-white font-bold" : "hover:bg-white/5 text-white/70"}`}
                    >
                      Off
                    </button>
                    {subtitles.map((sub) => (
                      <button
                        key={sub.index}
                        onClick={() => changeSubtitle(sub.index)}
                        className={`text-left px-2 py-1 rounded transition-colors ${activeSubtitle === sub.index ? "bg-(--primary-color) text-white font-bold" : "hover:bg-white/5 text-white/70"}`}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
