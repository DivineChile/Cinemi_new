import {
  SlidersHorizontal,
  RotateCcw,
} from "lucide-react";

// Hardcoded static option parameters matching your /filter API specs exactly
const FILTER_OPTIONS = {
  genres: [
    "Action",
    "Adventure",
    "Comedy",
    "Drama",
    "Fantasy",
    "Mystery",
    "Romance",
    "Sci-Fi",
    "Sports",
    "Supernatural",
    "Historical",
    "Slice of Life",
    "Psychological",
    "Thriller",
    "Horror",
  ],
  formats: ["TV", "MOVIE", "OVA", "ONA", "SPECIAL"],
  statuses: ["RELEASING", "FINISHED", "NOT_YET_RELEASED", "CANCELLED"],
  seasons: ["WINTER", "SPRING", "SUMMER", "FALL"],
  sorts: [
    { label: "Most Popular", value: "POPULARITY_DESC" },
    { label: "Trending Now", value: "TRENDING_DESC" },
    { label: "Highest Score", value: "SCORE_DESC" },
    { label: "Release Date", value: "START_DATE_DESC" },
  ],
  // Generate a dynamic list of years backward from 2026 down to 1990
  years: Array.from({ length: 2026 - 1990 + 1 }, (_, i) =>
    (2026 - i).toString(),
  ),
};

export default function AdvancedFilterBar({
  filters,
  onFilterChange,
  onClearAll,
  isSearchingText,
}) {
  // Detect if any active filters are applied so we can show the reset button conditionally
  const hasActiveFilters = Object.entries(filters).some(([key, val]) => {
    if (key === "sort" && val === "POPULARITY_DESC") return false; // Skip checking default sorting
    if (key === "per_page") return false;
    return val !== "";
  });

  return (
    <div className="advanced-filter-bar w-full flex flex-col gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 font-[Inter] select-none shadow-md">
      {/* Top Controller Header Indicator Row */}
      <div className="flex justify-between items-center border-b border-white/5 pb-3 shrink-0">
        <div className="flex items-center gap-2 text-[14px] font-bold text-white/90">
          <SlidersHorizontal size={15} className="text-(--brand-color)" />
          <span>Advanced Discovery Filters</span>
        </div>

        {/* Global Clear Filters Action Trigger Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearAll}
            className="flex items-center gap-1.5 text-[12px] font-bold text-(--brand-color) hover:text-white bg-[#b11226]/10 hover:bg-[#b11226] border border-[#b11226]/20 px-3 py-1.5 rounded-lg transition-all duration-300 transform active:scale-95 cursor-pointer"
          >
            <RotateCcw size={12} />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* 🌟 RESPONSIVE FILTERS SELECTORS DROPDOWNS ROW GRID MAP */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 text-[13px] font-semibold font-[Inter]">
        {/* Dropdown 1: Genre Filter Selector (Disabled automatically if user is text-searching via modal) */}
        <div
          className={`flex items-center gap-1 bg-black/40 border rounded-lg px-2.5 py-2 transition-all ${
            isSearchingText
              ? "opacity-30 border-white/5 cursor-not-allowed"
              : "border-white/10 hover:border-white/20"
          }`}
        >
          <select
            value={filters.genre}
            disabled={isSearchingText}
            onChange={(e) => onFilterChange("genre", e.target.value)}
            className="bg-transparent w-full text-white outline-none cursor-pointer pr-1 disabled:cursor-not-allowed"
          >
            <option value="" className="bg-[#0a0a0a] text-[#a1a1a1]">
              Filter: All Genres
            </option>
            {FILTER_OPTIONS.genres.map((g) => (
              <option key={g} value={g} className="bg-[#0a0a0a] text-white">
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown 2: Media Format Selector */}
        <div className="flex items-center gap-1 bg-black/40 border border-white/10 hover:border-white/20 rounded-lg px-2.5 py-2 transition-all">
          <select
            value={filters.format}
            onChange={(e) => onFilterChange("format", e.target.value)}
            className="bg-transparent w-full text-white outline-none cursor-pointer pr-1"
          >
            <option value="" className="bg-[#0a0a0a] text-[#a1a1a1]">
              Format: All Media
            </option>
            {FILTER_OPTIONS.formats.map((f) => (
              <option
                key={f}
                value={f}
                className="bg-[#0a0a0a] text-white uppercase"
              >
                {f}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown 3: Release Year Selector */}
        <div className="flex items-center gap-1 bg-black/40 border border-white/10 hover:border-white/20 rounded-lg px-2.5 py-2 transition-all">
          <select
            value={filters.year}
            onChange={(e) => onFilterChange("year", e.target.value)}
            className="bg-transparent w-full text-white outline-none cursor-pointer pr-1"
          >
            <option value="" className="bg-[#0a0a0a] text-[#a1a1a1]">
              Year: All Years
            </option>
            {FILTER_OPTIONS.years.map((y) => (
              <option
                key={y}
                value={y}
                className="bg-[#0a0a0a] text-white font-mono"
              >
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown 4: Broadcast Season Selector */}
        <div className="flex items-center gap-1 bg-black/40 border border-white/10 hover:border-white/20 rounded-lg px-2.5 py-2 transition-all">
          <select
            value={filters.season}
            onChange={(e) => onFilterChange("season", e.target.value)}
            className="bg-transparent w-full text-white outline-none cursor-pointer pr-1"
          >
            <option value="" className="bg-[#0a0a0a] text-[#a1a1a1]">
              Season: All Seasons
            </option>
            {FILTER_OPTIONS.seasons.map((s) => (
              <option
                key={s}
                value={s}
                className="bg-[#0a0a0a] text-white uppercase"
              >
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown 5: Airing Status Selector */}
        <div className="flex items-center gap-1 bg-black/40 border border-white/10 hover:border-white/20 rounded-lg px-2.5 py-2 transition-all">
          <select
            value={filters.status}
            onChange={(e) => onFilterChange("status", e.target.value)}
            className="bg-transparent w-full text-white outline-none cursor-pointer pr-1"
          >
            <option value="" className="bg-[#0a0a0a] text-[#a1a1a1]">
              Status: All Statuses
            </option>
            {FILTER_OPTIONS.statuses.map((s) => (
              <option
                key={s}
                value={s}
                className="bg-[#0a0a0a] text-white uppercase"
              >
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown 6: Sorting Criteria Selector */}
        <div className="flex items-center gap-1 bg-black/40 border border-(--primary-color)/30 hover:border-(--primary-color)/50 rounded-lg px-2.5 py-2 transition-all shadow-sm">
          <select
            value={filters.sort}
            onChange={(e) => onFilterChange("sort", e.target.value)}
            className="bg-transparent w-full text-(--brand-color) font-bold outline-none cursor-pointer pr-1"
          >
            {FILTER_OPTIONS.sorts.map((s) => (
              <option
                key={s.value}
                value={s.value}
                className="bg-[#0a0a0a] text-white font-medium"
              >
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
