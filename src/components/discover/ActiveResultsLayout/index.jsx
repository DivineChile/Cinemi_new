import { AlertCircle, Compass } from "lucide-react";
import ContentCard from "../../ui/ContentCard";

export default function ActiveResultsLayout({ results = [], loading, error }) {
  // 🌟 VIEW STATE 1: REUSABLE API GRID SKELETON SHIMMER LOADERS
  // Renders a grid of 15 empty pulse-cards to shield against content displacement jumps
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8 py-2 w-full">
        {Array.from({ length: 15 }).map((_, index) => (
          <div
            key={`discover-skeleton-${index}`}
            className="w-full flex flex-col gap-2 animate-pulse"
          >
            {/* Poster framework bounding box fallback */}
            <div className="w-full aspect-[230/345] bg-white/5 rounded-xl" />
            {/* Title line fallback text indicator */}
            <div className="h-4 bg-white/10 rounded w-[85%] mt-1" />
            {/* Metadata tags fallback line */}
            <div className="h-3 bg-white/5 rounded w-[55%]" />
          </div>
        ))}
      </div>
    );
  }

  // 🌟 VIEW STATE 2: ERROR GATE OVERLAY
  if (error) {
    return (
      <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-16 flex flex-col items-center justify-center gap-3 text-center font-[Inter] py-20">
        <AlertCircle size={40} className="text-[#b11226]/80 animate-bounce" />
        <div className="flex flex-col gap-1">
          <p className="text-[18px] font-bold text-white">Connection Error</p>
          <p className="text-[14px] text-[#a1a1a1] max-w-sm leading-normal">
            {error ||
              "The server failed to pull database entries. Please check your network context parameters."}
          </p>
        </div>
      </div>
    );
  }

  // 🌟 VIEW STATE 3: MATCH ZERO FILTERED EMPTY FALLBACK BANNER
  if (results.length === 0) {
    return (
      <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-16 flex flex-col items-center justify-center gap-3 text-center font-[Inter] py-24">
        <Compass size={40} className="text-white/20" />
        <div className="flex flex-col gap-1">
          <p className="text-[18px] font-bold text-white/90">No Anime Found</p>
          <p className="text-[14px] text-[#a1a1a1] max-w-sm leading-normal">
            We couldn't track content matching that combination of filters. Try
            adjusting your format, year ranges, or sorting options.
          </p>
        </div>
      </div>
    );
  }

  // 🌟 VIEW STATE 4: PRIMARY MULTI-COLUMN CONTENT MATRIX DISPLAY GRID
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8 py-2 w-full animate-[fade-in_0.3s_ease-out]">
      {results.map((anime) => {
        const mobileHref = `/anime/${anime.id}`;
        const desktopHref = `/watch/${anime.id}`;
        const animeTitle =
          anime?.title?.english || anime?.title?.romaji || "Anime";

        const animePoster = anime?.coverImage?.large;
        const animeScore =
          (anime?.averageScore / 10).toFixed(1) ||
          (anime?.meanScore / 10).toFixed(1) || "0.0";
        const animeSeasonYear = anime?.seasonYear || anime?.startDate?.year || "N/A";
        const animeFormat = anime?.format;
        console.log(anime);
        return (
          /* 
           Wrapper containers automatically dictate item widths globally, 
           overriding hardcoded limits to fit your responsive rows flawlessly.
        */
          <div key={anime.id} className="w-full">
            <ContentCard
              mobileHref={mobileHref}
              desktopHref={desktopHref}
              poster={animePoster}
              title={animeTitle}
              score={animeScore}
              seasonYear={animeSeasonYear}
              animeFormat={animeFormat}
            />
          </div>
        );
      })}
    </div>
  );
}
