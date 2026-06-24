import { Link } from "react-router-dom";
import { Clock, Trash2, Play } from "lucide-react";

export default function LibraryHistoryRail({ historyList = [], onRemoveItem }) {
  // Self-collapse completely if the user has no history records to prevent empty UI gaps
  if (historyList.length === 0) return null;

  return (
    <div className="flex flex-col gap-4 animate-[fade-in_0.3s_ease-out]">
      {/* Section Subheading Title Header */}
      <h2 className="text-[18px] font-black uppercase tracking-wider text-white/90 flex items-center gap-2 select-none">
        <Clock size={16} className="text-(--brand-color) animate-pulse" />
        <span>In-Progress Sessions</span>
      </h2>

      {/* Horizontal Touch Scroll Track Lane Box */}
      <div className="flex gap-4 overflow-x-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-1 w-full relative">
        {historyList.map((anime) => {
          // Guard safely against dividing by zero if the asset duration fails to compute
          const progressPercent =
            anime.durationSeconds > 0
              ? (anime.progressSeconds / anime.durationSeconds) * 100
              : 0;

          // Route targeting direct parameter structure built earlier
          const targetWatchUrl = `/watch/${anime.provider}/${anime.id}/${anime.category}/${anime.slug}`;

          return (
            <Link
              key={anime.id}
              to={targetWatchUrl}
              className="group flex flex-col gap-2 flex-[0_0_240px] min-w-[240px] bg-white/5 border border-white/5 hover:border-white/10 p-2 rounded-xl transition-all duration-300 relative select-none"
            >
              {/* Image Container Aspect Box */}
              <div className="w-full h-32 bg-neutral-900 rounded-lg overflow-hidden relative shadow-sm">
                <img
                  src={
                    anime.episodeThumbnail || `https://anilist.co{anime.id}.jpg`
                  }
                  alt=""
                  loading="lazy"
                  onError={(e) => {
                    // Safety Unsplash thumbnail alternative backup graphic if banner path skips
                    e.target.src = "https://unsplash.com";
                  }}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                />

                {/* Top-Right Trash Delete Target Control Button Layer */}
                <button
                  type="button"
                  onClick={(e) => onRemoveItem(e, anime.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-white/40 hover:text-white hover:bg-[#b11226] border border-white/5 transition-all z-30 opacity-0 group-hover:opacity-100 shadow-md cursor-pointer"
                  title="Remove from streaming history"
                >
                  <Trash2 size={13} />
                </button>

                {/* Absolute overlay display play circle arrow icon revealing smoothly on card hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 z-20">
                  <div className="w-10 h-10 rounded-full bg-(--primary-color) flex items-center justify-center text-white shadow-xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
                    <Play size={15} fill="currentColor" className="ml-0.5" />
                  </div>
                </div>

                {/* 📊 ACCUMULATED STREAM POSITION RATIO TIMELINE BAR */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-20">
                  <div
                    className="h-full bg-(--primary-color) transition-all duration-300"
                    style={{ width: `${Math.min(progressPercent, 100)}%` }}
                  />
                </div>
              </div>

              {/* Card Title Metadata Information block content text strings */}
              <div className="px-0.5 flex flex-col gap-0.5 leading-tight text-[13px] mt-1.5">
                <span className="text-[11px] text-(--brand-color) font-extrabold uppercase font-mono tracking-wider">
                  EP {anime.episodeNumber}
                </span>
                <p className="font-bold truncate max-w-full text-white/90 group-hover:text-(--brand-color) transition-colors duration-200">
                  {anime.animeTitle || `Anime Collection #${anime.id}`}
                </p>
                <span className="text-[11px] text-white/40 mt-0.5 font-medium">
                  {Math.max(
                    0,
                    Math.floor(
                      (anime.durationSeconds - anime.progressSeconds) / 60,
                    ),
                  )}{" "}
                  mins remaining
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
