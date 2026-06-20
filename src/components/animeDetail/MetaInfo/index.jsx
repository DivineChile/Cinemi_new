import {
  ExternalLink,
  Tv,
  Info,
  PlaySquare,
  Film,
  Sparkles,
  Play,
} from "lucide-react";
import { useState } from "react";

// Formats UNIX timestamp (e.g. 1786539600) into a localized string (e.g., Aug 12, 2026)
const formatAiringDate = (timestamp) => {
  if (!timestamp) return "";
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// Capitalizes strings cleanly (e.g., "SPRING" -> "Spring")
const formatSeason = (season, year) => {
  if (!season) return "TBA";
  const formatted =
    season.charAt(0).toUpperCase() + season.slice(1).toLowerCase();
  return year ? `${formatted} ${year}` : formatted;
};

function MetaInfo({ loading, error, rawApiData }) {
  const [playTrailer, setPlayTrailer] = useState(false);
  // Safe extraction matching your upstream miruro-api /info payload fields
  const data = rawApiData || {};

  const titleRomaji = data.title?.romaji || "N/A";
  const description = data.description
    ? data.description.replace(/<[^>]*>/g, "")
    : "No synopsis available.";
  const genres = data.genres || [];
  const status = data.status || "UNKNOWN";

  // Safe parsing for nested studios nodes array
  const studioName =
    data.studios?.nodes?.find((s) => s.isAnimationStudio)?.name ||
    "Unknown Studio";

  // Safe parsing for next airing episode timer data blocks
  const nextEpisodeNum = data.nextAiringEpisode?.episode;
  const nextEpisodeDate = formatAiringDate(data.nextAiringEpisode?.airingAt);

  // Safe extraction for external source verification mappings
  const malId = data.idMal;
  const aniListId = data.id;

  // YouTube Asset ID Resolution
  const youtubeId = data.trailer?.id;
  // Dynamic Unsplash placeholder if api provides no high-res thumbnail link path
  const videoThumbnail =
    data.trailer?.thumbnail ||
    `https://youtube.com{youtubeId}/maxresdefault.jpg` ||
    data.bannerImage;

  if (loading) {
    return (
      <div className="bg-(--neutral-color) py-12 border-t border-white/5 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="flex flex-col gap-3">
              <div className="h-6 bg-white/10 rounded w-32" />
              <div className="h-4 bg-white/5 rounded w-full" />
              <div className="h-4 bg-white/5 rounded w-[85%]" />
            </div>
            <div className="flex flex-col gap-3">
              <div className="h-6 bg-white/10 rounded w-44" />
              <div className="w-full aspect-video bg-white/5 rounded-xl" />
            </div>
          </div>
          <div className="bg-white/5 rounded-2xl p-6 h-96" />
        </div>
      </div>
    );
  }

  if (error || !rawApiData) return null;

  return (
    <section className="bg-(--neutral-color) py-12 text-white border-t border-white/5 md:border-none">
      {/* Universal Cinemi Page Width Constraints */}
      <div className="max-w-7xl mx-auto px-4">
        {/* Responsive Parent Two-Column Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* LEFT 2-COLUMNS: Dynamic Synopsis Overview & Dynamic Trailer Bracket */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {/* Project Synopsis Content Block */}
            <div className="synopsis-box flex flex-col gap-3">
              <h3 className="text-[20px] lg:text-[24px] font-bold flex items-center gap-2 tracking-wide text-white/90">
                <Info size={18} className="text-(--brand-color)" /> Synopsis
              </h3>
              <p className="text-[#a1a1a1] font-[Inter] text-[16px] leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </div>

            {/* Video Trailer Panel Layer (Self-Collapsing if video string doesn't resolve) */}
            {youtubeId && (
              <div className="trailer-box flex flex-col gap-3">
                <h3 className="text-[20px] lg:text-[24px] font-bold flex items-center gap-2 text-white/90">
                  <PlaySquare size={18} className="text-(--brand-color)" />{" "}
                  Official Trailer
                </h3>

                <div className="w-full aspect-video rounded-xl overflow-hidden border border-white/10 bg-black relative group shadow-2xl">
                  {playTrailer ? (
                    // Explicitly targeted dynamic stream folder structure route to bypass sameorigin block rule
                    <iframe
                      src={`https://youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
                      title="Anime Trailer Video"
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    // Interactive Static Thumbnail Layer Cover with Action Switcher
                    <div
                      className="absolute inset-0 w-full h-full cursor-pointer"
                      onClick={() => setPlayTrailer(true)}
                    >
                      <img
                        src={videoThumbnail}
                        alt="Trailer Cover Graphic"
                        className="w-full h-full object-cover brightness-75 group-hover:scale-102 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-(--primary-color) text-white flex items-center justify-center shadow-xl transform transition-transform group-hover:scale-110 active:scale-95 duration-300">
                          <Play
                            size={26}
                            fill="currentColor"
                            className="ml-1"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT 1-COLUMN: High-Utility Sidebar Meta-Card Grid */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-6 font-[Inter]">
            <h3 className="text-[18px] font-bold tracking-wide border-b border-white/10 pb-3 text-white/90 flex items-center gap-2">
              <Sparkles size={16} className="text-(--brand-color)" />{" "}
              Information
            </h3>

            {/* Next Airing Episode Dynamic Alert Box Container */}
            {nextEpisodeNum && (
              <div className="bg-[#b11226]/10 border border-[#b11226]/20 rounded-xl p-4 flex gap-3 items-center text-[#ff4d5a]">
                <Tv size={22} className="shrink-0" />
                <div className="text-[14px]">
                  <p className="font-bold">
                    Episode {nextEpisodeNum} Airing Soon
                  </p>
                  <p className="opacity-80 font-medium">
                    Expected on {nextEpisodeDate}
                  </p>
                </div>
              </div>
            )}

            {/* Metadata Rows Matrix Stack */}
            <div className="flex flex-col gap-4.5 text-[14px]">
              {/* Romaji Alternative Title Row */}
              <div className="flex flex-col gap-1">
                <span className="text-[#a1a1a1] font-medium text-[13px]">
                  Romaji Title
                </span>
                <span className="text-white/95 font-semibold leading-normal">
                  {titleRomaji}
                </span>
              </div>

              {/* Genres Tag Cloud Wrapper */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[#a1a1a1] font-medium text-[13px]">
                  Genres
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {genres.map((g, idx) => (
                    <span
                      key={idx}
                      className="bg-white/5 border border-white/10 rounded-md px-2.5 py-1 text-[13px] text-white/80 hover:bg-white/10 hover:text-white transition-all cursor-default"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              {/* Broadcast Status Variable Output */}
              <div className="flex justify-between items-center border-t border-white/5 pt-3.5">
                <span className="text-[#a1a1a1] font-medium">
                  Airing Status
                </span>
                <span
                  className={`font-bold uppercase tracking-wider text-[12px] px-2.5 py-0.5 rounded-full border ${
                    status === "RELEASING"
                      ? "bg-green-500/10 border-green-500/20 text-green-400"
                      : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                  }`}
                >
                  {status}
                </span>
              </div>

              {/* Seasonal Context Flag Output */}
              <div className="flex justify-between items-center border-t border-white/5 pt-3.5">
                <span className="text-[#a1a1a1] font-medium">
                  Premieres Season
                </span>
                <span className="text-white/90 font-semibold">
                  {formatSeason(data.season, data.seasonYear)}
                </span>
              </div>

              {/* Animation Studio Variable Output */}
              <div className="flex justify-between items-center border-t border-white/5 pt-3.5">
                <span className="text-[#a1a1a1] font-medium">
                  Studio Production
                </span>
                <span className="text-white/90 font-semibold">
                  {studioName}
                </span>
              </div>

              {/* Dynamic External Verification Directory Anchors Layout */}
              <div className="flex flex-col gap-2 border-t border-white/5 pt-4 mt-1">
                <span className="text-[#a1a1a1] font-medium text-[13px]">
                  Database External Links
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {malId && (
                    <a
                      href={`https://myanimelist.net/${malId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold transition-all text-[13px]"
                    >
                      MyAnimeList <ExternalLink size={12} />
                    </a>
                  )}
                  {aniListId && (
                    <a
                      href={`https://anilist.co/${aniListId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-pink-600/10 hover:bg-pink-600/20 text-pink-400 border border-pink-500/20 flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold transition-all text-[13px]"
                    >
                      AniList <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default MetaInfo;
