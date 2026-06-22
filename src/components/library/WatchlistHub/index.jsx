import { Grid, Bookmark } from "lucide-react";
import ContentCard from "../../ui/ContentCard";

export default function WatchlistHub({
  activeTab,
  setActiveTab,
  filteredWatchlist = [],
  totalCount = 0,
}) {
  return (
    <div className="watchlist-hub-wrapper flex flex-col gap-6 border-t border-white/5 pt-8 font-[Inter] text-white">
      {/* 🌟 TAB NAVIGATION CONTROLS DECK HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-3.5 select-none">
        <div className="flex items-center gap-3">
          <h2 className="text-[18px] font-black uppercase tracking-wider text-white/90 flex items-center gap-2">
            <Grid size={16} className="text-(--brand-color)" />
            <span>Personal Watchlist</span>
          </h2>
          <span className="bg-white/5 border border-white/10 text-white/50 font-medium font-mono text-[11px] px-2 py-0.5 rounded-md">
            {totalCount} total
          </span>
        </div>

        {/* Horizontal Navigation Selector Switch Row */}
        <div className="flex bg-black/40 border border-white/5 p-1 rounded-xl text-[12px] font-bold uppercase w-full sm:w-auto shadow-inner">
          {["all", "watching", "planned", "completed"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 rounded-lg transition-all duration-300 text-center flex-1 sm:flex-none cursor-pointer tracking-wide ${
                activeTab === tab
                  ? "bg-white text-black font-black shadow-md"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 🎰 DYNAMIC CONDITIONAL RENDERING ROW TRACK */}
      {filteredWatchlist.length === 0 ? (
        // CASE A: EMPTY WATCHLIST FILTER BANNER OVERLAY
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-12 text-center text-[#a1a1a1] text-[14px] flex flex-col items-center justify-center gap-2 py-16 shadow-inner animate-[fade-in_0.2s_ease-out]">
          <Bookmark size={28} className="text-white/20 mb-1" />
          <div className="flex flex-col gap-0.5">
            <p className="font-bold text-white/90 text-[15px]">
              No Saved Content Found
            </p>
            <p className="max-w-xs leading-normal text-[13px]">
              Your library slot is empty for the filter category{" "}
              <span className="text-white font-bold uppercase font-mono bg-white/10 px-1.5 py-0.2 rounded text-[11px]">
                {activeTab}
              </span>
              . Head back to the Discovery catalog to save titles.
            </p>
          </div>
        </div>
      ) : (
        // CASE B: PIXEL-PERFECT METRIC DISPLAY MATRIX GRID
        /* 
           Hooks seamlessly into your refactored fluid ContentCard engine. 
           Maintains identical column alignments to your Discover Catalog page layout.
        */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-5 py-1 w-full animate-[fade-in_0.3s_ease-out]">
          {filteredWatchlist.map((anime) => (
            <ContentCard
              key={anime.id}
              desktopHref={`/watch/${anime.id}`}
              mobileHref={`/anime/${anime.id}`}
              poster={anime.poster}
              title={anime?.title}
              score={anime.score}
              seasonYear={anime.seasonYear}
              animeFormat={anime.format}
            />
          ))}
        </div>
      )}
    </div>
  );
}
