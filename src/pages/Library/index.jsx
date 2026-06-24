import { useState, useEffect, useMemo } from "react";
import LibraryStats from "../../components/library/LibraryStats";
import LibraryHistoryRail from "../../components/library/LibraryHistoryRail";
import WatchlistHub from "../../components/library/WatchlistHub";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

export default function Library() {
  // 🌟 CORE MASTER CONTEXT STATES
  const [activeTab, setActiveTab] = useState("all"); // options: 'all', 'watching', 'planned', 'completed'
  const [watchlist, setWatchlist] = useState([]);
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);

  useDocumentTitle("My Library");
  // 1. DATA HYDRATION AND DISCOVERY CORE ENGINE
  // Inside LibraryPage.jsx, update your initialization useEffect to include a window storage event monitor:
  useEffect(() => {
    const loadLibraryUserData = () => {
      try {
        setLoading(true);

        const localHistory = localStorage.getItem("cinemi_history");
        if (localHistory) {
          setHistoryList(
            Object.entries(JSON.parse(localHistory))
              .map(([id, data]) => ({ id, ...data }))
              .sort((a, b) => b.updatedAt - a.updatedAt),
          );
        }

        const localWatchlist = localStorage.getItem("cinemi_watchlist");
        if (localWatchlist) {
          setWatchlist(JSON.parse(localWatchlist));
        } else {
          // Safe baseline seed array setup
          setWatchlist([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadLibraryUserData();

    // 🌟 FIX: Active storage boundary intercept listener
    // Instantly pushes live array state modifications from child nodes up to master dashboard layers
    window.addEventListener("storage", loadLibraryUserData);
    return () => window.removeEventListener("storage", loadLibraryUserData);
  }, []);

  // 🌟 2. MEMOIZED ANALYTICS STATS RECALCULATOR CORE
  const computedStats = useMemo(() => {
    // Accumulate total seconds streamed across historical cookies safely
    const totalAccumulatedSeconds = historyList.reduce(
      (acc, current) => acc + (current.progressSeconds || 0),
      0,
    );
    const convertedHours = totalAccumulatedSeconds / 3600;

    return {
      totalSaved: watchlist.length,
      watchingCount: watchlist.filter((item) => item.status === "watching")
        .length,
      completedCount: watchlist.filter((item) => item.status === "completed")
        .length,
      totalHours: convertedHours.toFixed(1),
    };
  }, [watchlist, historyList]);

  // 🌟 3. MEMOIZED FILTER PIPELINE FOR THE WATCHLIST GRID
  const filteredWatchlistData = useMemo(() => {
    if (activeTab === "all") return watchlist;
    return watchlist.filter((item) => item.status === activeTab);
  }, [watchlist, activeTab]);

  // 🌟 4. GLOBAL COOKIE MUTATION CALLBACK HANDLERS
  const handleRemoveHistoryItem = (e, animeId) => {
    e.preventDefault();
    e.stopPropagation();

    const localHistory = localStorage.getItem("cinemi_history");
    if (localHistory) {
      const historyMap = JSON.parse(localHistory);
      delete historyMap[animeId]; // Wipe specific reference key

      localStorage.setItem("cinemi_history", JSON.stringify(historyMap));
      setHistoryList((prev) => prev.filter((item) => item.id !== animeId));
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-[#0a0a0a] flex items-center justify-center text-white/50 text-[14px] font-[Inter] animate-pulse">
        Syncing personal archive collection...
      </div>
    );
  }

  return (
    <div className="bg-(--neutral-color) min-h-screen mt-15 text-white font-[Inter] pb-24 overflow-x-hidden">
      {/* SECTION 1: Personal Profile Analytics Executive Metric Dashboard Bar */}
      <LibraryStats stats={computedStats} />

      {/* Main Structural Page Constraint Box */}
      <main className="max-w-7xl mx-auto px-4 mt-8 flex flex-col gap-12">
        {/* SECTION 2: Suspended In-Progress Resuming Streams Touch Rail */}
        <LibraryHistoryRail
          historyList={historyList}
          onRemoveItem={handleRemoveHistoryItem}
        />

        {/* SECTION 3: Tabbed Watchlist Hub Workspace Navigation Layout and Dynamic Grid */}
        <WatchlistHub
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          filteredWatchlist={filteredWatchlistData}
          totalCount={watchlist.length}
        />
      </main>
    </div>
  );
}
