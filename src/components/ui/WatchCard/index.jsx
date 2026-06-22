import { Play, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

function WatchCard({
  id,
  episodeThumbnail,
  durationSeconds,
  progressSeconds,
  clearItemFromHistory,
  title,
  episodeNumber,
  progressPercent,
  to,
}) {
  return (
    <Link
      key={id}
      to={to}
      className="group flex flex-col gap-2.5 flex-[0_0_256px] md:flex-[0_0_280px] w-[256px] md:w-[280px] h-[200px] md:h-[232px] p-2 rounded-xl"
    >
      <div className="w-full h-40 bg-neutral-900 rounded-lg overflow-hidden relative shadow-md">
        {/* 🌟 RENDER THE REAL SAVED IMAGE PREVIEW FROM LOCALSTORAGE */}
        <img
          src={episodeThumbnail || "https://unsplash.com"}
          alt=""
          className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-102"
        />

        {/* ... keep progress bars and trash icons buttons exactly the same ... */}
        {/* Top-Right Absolute Delete Trash Icon Button Layer */}
        <button
          type="button"
          onClick={(e) => clearItemFromHistory(e, id)}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white/40 hover:text-white hover:bg-[#b11226] transition-all z-30 opacity-0 group-hover:opacity-100"
          title="Remove from history"
        >
          <Trash2 size={13} />
        </button>

        {/* Play circle overlay icon effect appearing cleanly on hover action triggers */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 z-20">
          <div className="w-10 h-10 rounded-full bg-(--primary-color) text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
            <Play size={16} fill="currentColor" className="ml-0.5" />
          </div>
        </div>

        {/* 📊 VISUAL RESUME PROGRESS SLIDER LINE TRACK */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
          <div
            className="h-full bg-(--primary-color) transition-all duration-300"
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>
      </div>

      <div className="px-1 flex map flex-col gap-0.5 font-[Inter]">
        {/* 🌟 RENDER THE REAL ANIME TITLE STRING FROM LOCALSTORAGE */}
        <p className="text-[14px] font-semibold text-white truncate max-w-full group-hover:text-(--brand-color) transition-colors leading-tight">
          {title}
        </p>

        <span className="text-[12px] text-[#a1a1a1] flex items-center gap-1">
          <span className="text-[12px] text-[#a1a1a1] uppercase">
            Ep{episodeNumber}
          </span>
          <span className="text-[12px]"> • </span>
          <span className="text-[12px]">
            {Math.max(0, Math.floor((durationSeconds - progressSeconds) / 60))}m
            left
          </span>
        </span>
      </div>
    </Link>
  );
}

export default WatchCard;
