import { Play, Plus, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { SmoothImage } from "../SmoothImage";
import { useMediaQuery } from "../../../hooks/useMediaQuery";
import { useEffect, useState } from "react";

function ContentCard({
  mobileHref,
  desktopHref,
  id,
  poster,
  title,
  score,
  seasonYear,
  animeFormat,
}) {
  // Local track state to update the UI button instantly upon click actions
  const [isSaved, setIsSaved] = useState(false);

  // Parse current active anime ID token safely out of the navigation route string path
  const animeId = desktopHref?.split("/").pop();

  // On mount, check if this specific show is already inside the user's saved watchlist archive
  useEffect(() => {
    if (!animeId) return;
    const localList = localStorage.getItem("cinemi_watchlist");
    if (localList) {
      const currentList = JSON.parse(localList);
      const exists = currentList.some(
        (item) => item.id.toString() === animeId.toString(),
      );
      setIsSaved(exists);
    }
  }, [animeId, desktopHref, mobileHref]);

  // 🌟 CLICK HANDLER: Pushes fresh metadata elements straight to browser local database memory
  const handleAddToWatchlist = (e) => {
    e.preventDefault(); // Stop card Link from launching page routing when clicking button
    e.stopPropagation();

    if (!animeId) return;

    const localList = localStorage.getItem("cinemi_watchlist");
    let currentList = localList ? JSON.parse(localList) : [];

    if (isSaved) {
      // Toggle Action Option A: Remove from list if already saved (Prevents duplicate clutter)
      currentList = currentList.filter(
        (item) => item.id.toString() !== animeId.toString(),
      );
      setIsSaved(false);
    } else {
      // Toggle Action Option B: Append a clean normalized catalog data object payload card
      const newWatchlistItem = {
        id: parseInt(animeId, 10) || animeId,
        title: title || "Unknown Title",
        poster: poster || "",
        score: score || "0.0",
        seasonYear: seasonYear || "N/A",
        format: animeFormat || "N/A",
        status: "planned", // Sets a predictable baseline filter status tag automatically
        updatedAt: Date.now(),
      };
      currentList.push(newWatchlistItem);
      setIsSaved(true);
    }

    // Commit changes back to the global client memory state
    localStorage.setItem("cinemi_watchlist", JSON.stringify(currentList));

    // Dispatch a cross-window storage event listener update message
    // This instantly updates counts on the Library Page if it is running in another browser tab
    window.dispatchEvent(new Event("storage"));
  };

  const isDesktop = useMediaQuery("(min-width: 768px)");
  const activeHref = isDesktop ? desktopHref : mobileHref;
  return (
    <Link
      to={activeHref}
      key={id}
      className="content-card group flex flex-col w-full select-none"
    >
      {/* Poster image box frame */}
      <div className="poster-container w-full aspect-[2/3] shadow-md relative overflow-hidden rounded-xl bg-gray-900">
        <SmoothImage
          src={poster}
          alt={title}
          className="transform transition-transform duration-500 group-hover:scale-105"
        />

        {/* 2. Turned 'poster-overlay' into a centered backdrop with transition utilities */}
        <div className="poster-overlay absolute inset-0 bg-black/70 flex flex-col justify-center items-center gap-3 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 px-4">
          {/* Watch Now Button */}
          <span className="text-white font-[Inter] font-medium text-[14px] flex gap-2 items-center justify-center w-full rounded-lg bg-(--primary-color) py-3 transition-transform duration-300 translate-y-2 group-hover:translate-y-0 cursor-pointer">
            <Play size={16} fill="currentColor" />
            Watch Now
          </span>

          {/* Plus Watchlist Button */}
          <button
            type="button"
            onClick={handleAddToWatchlist}
            className={`text-white text-[13px] flex gap-2 items-center justify-center w-full rounded-lg py-2.5 transition-transform duration-300 translate-y-4 group-hover:translate-y-0 cursor-pointer outline-none border ${
              isSaved
                ? "bg-[#0060b2]/20 border-[#0060b2]/40 text-blue-400 hover:bg-[#0060b2]/30 hover:border-[#0060b2]/60 shadow-lg shadow-blue-950/20"
                : "bg-white/5 border-white/20 hover:bg-white/10"
            }`}
          >
            {isSaved ? (
              <>
                <Check size={14} strokeWidth={2.5} />
                <span>On Watchlist</span>
              </>
            ) : (
              <>
                <Plus size={14} />
                <span>Add to List</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Text description metadata rows */}
      <div className="poster-content flex flex-col gap-1 mt-2">
        <h1 className="text-[16px] text-white font-semibold font-[Inter] truncate group-hover:text-(--brand-color) transition-colors">
          {title}
        </h1>
        <p className="flex gap-1 items-center text-[14px] font-[Inter] text-[#a1a1a1] truncate">
          ⭐ {score} • {animeFormat}
          <span className="">• {seasonYear}</span>
        </p>
      </div>
    </Link>
  );
}

export default ContentCard;
