import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Play, Trash2, Clock } from "lucide-react";
import WatchCard from "../../ui/WatchCard";

export const Watching = () => {
  const [historyList, setHistoryList] = useState([]);

  useEffect(() => {
    const loadWatchHistory = () => {
      const localHistory = localStorage.getItem("cinemi_history");
      if (localHistory) {
        const historyMap = JSON.parse(localHistory);

        // Transform the map object values into a sorted list array (Most recently updated first)
        const sortedHistory = Object.entries(historyMap)
          .map(([animeId, details]) => ({
            id: animeId,
            ...details,
          }))
          .sort((a, b) => b.updatedAt - a.updatedAt);

        setHistoryList(sortedHistory);
      }
    };

    loadWatchHistory();

    // Listen for storage changes across other browser windows tabs smoothly
    window.addEventListener("storage", loadWatchHistory);
    return () => window.removeEventListener("storage", loadWatchHistory);
  }, []);

  const clearItemFromHistory = (e, animeId) => {
    e.preventDefault(); // Stop Link navigation trigger clicks from firing
    e.stopPropagation();

    const localHistory = localStorage.getItem("cinemi_history");
    if (localHistory) {
      const historyMap = JSON.parse(localHistory);
      delete historyMap[animeId]; // Wipe specific node reference key
      localStorage.setItem("cinemi_history", JSON.stringify(historyMap));

      // Update local state instantly to trigger clean DOM re-render animations
      setHistoryList((prev) => prev.filter((item) => item.id !== animeId));
    }
  };

  // Guard clause: Completely hide the row from the homepage if the user has no history records
  if (historyList.length === 0) return null;

  return (
    <div className="continue-watching-section py-6 bg-(--neutral-color) w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-[20px] md:text-[24px] font-bold text-white mb-5 flex items-center gap-2">
          <Clock size={20} className="text-(--brand-color)" /> Continue Watching
        </h2>

        {/* Fluid Horizontal Scroll Layout Box Track Grid */}
        <div className="flex gap-4 overflow-x-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-2">
          {historyList.map((anime) => {
            const progressPercent =
              anime.durationSeconds > 0
                ? (anime.progressSeconds / anime.durationSeconds) * 100
                : 0;
            const watchPath = `/watch/${anime.provider}/${anime.id}/${anime.category}/${anime.slug}`;

            return (
              <WatchCard
                id={anime.id}
                clearItemFromHistory={clearItemFromHistory}
                episodeNumber={anime.episodeNumber}
                episodeThumbnail={anime.episodeThumbnail}
                progressPercent={progressPercent}
                to={watchPath}
                title={anime.animeTitle}
                durationSeconds={anime.durationSeconds}
                progressSeconds={anime.progressSeconds}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
