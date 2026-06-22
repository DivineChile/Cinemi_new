import { Compass, Search, Sparkles } from "lucide-react";

export const SearchBannerHeader = ({
  query,
  activeGenre,
  totalResults,
  loading,
}) => {
  // Determine the contextual text title strings dynamically based on parameters entry
  const hasQuery = query && query.trim().length > 0;
  const hasGenre = activeGenre && activeGenre.trim().length > 0;

  return (
    /* 
      Cinematic deep-tint header section. 
      Utilizes a soft backdrop gradient overlay to mimic a movie catalog dashboard entrance.
    */
    <div className="w-full mt-10 bg-(--neutral-color) border-b border-white/5 py-10 md:py-14 font-[Inter] select-none">
      <div className="max-w-7xl mx-auto px-4 flex flex-col gap-2.5">
        {/* Dynamic Badge Context Tag Row */}
        <div className="flex items-center gap-2 text-(--brand-color) text-[11px] font-extrabold uppercase font-mono tracking-widest">
          {hasQuery ? (
            <>
              <Search size={13} strokeWidth={2.5} />
              <span>Search Directory</span>
            </>
          ) : hasGenre ? (
            <>
              <Sparkles size={13} />
              <span>Genre Category</span>
            </>
          ) : (
            <>
              <Compass size={13} />
              <span>Global Catalog</span>
            </>
          )}
        </div>

        {/* Dynamic Context Headers Typography */}
        <h1 className="text-[28px] sm:text-[36px] md:text-[42px] font-black text-white tracking-tight font-[Inter] leading-tight max-w-4xl">
          {hasQuery ? (
            <>
              Showing results for{" "}
              <span className="text-(--brand-color)">"{query}"</span>
            </>
          ) : hasGenre ? (
            <>
              Exploring{" "}
              <span className="text-(--brand-color)">{activeGenre}</span> Anime
            </>
          ) : (
            "Explore the Universe of Anime"
          )}
        </h1>

        {/* Total Metrics Count Summary Indicator line */}
        <div className="flex items-center gap-2 text-[13px] md:text-[14px] text-[#a1a1a1] font-medium mt-0.5">
          {loading ? (
            <div className="h-4 bg-white/5 border border-white/5 rounded animate-pulse w-36" />
          ) : (
            <p>
              Discovered{" "}
              <span className="text-white font-bold font-mono">
                {totalResults || 0}
              </span>{" "}
              matching titles tailored inside the matrix
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
