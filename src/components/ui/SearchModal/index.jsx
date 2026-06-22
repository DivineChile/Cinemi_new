import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, X, Film, Calendar, ArrowRight } from "lucide-react";

const PROXY_API_URL = import.meta.env.VITE_PROXY_API_URL;

export const SearchModal = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const modalRef = useRef(null);
  const inputRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Focus input and clear previous states when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setSearchQuery("");
      setSuggestions([]);
    }
  }, [isOpen]);

  // Live Debounce Search Pipeline
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);

    const debounceTimer = setTimeout(async () => {
      try {
        const response = await fetch(
          `${PROXY_API_URL}/suggestions?query=${encodeURIComponent(searchQuery)}`,
        );
        if (!response.ok) throw new Error();
        const data = await response.json();
        setSuggestions(data.suggestions || data || []);
      } catch (err) {
        console.error("Autocomplete failed:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleExecuteFullSearch = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim().length === 0) return;

    setIsOpen(false);
    navigate(`/discover?query=${encodeURIComponent(searchQuery)}`);
  };

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setIsOpen]);

  // 🌟 HYDRATION EFFECT MATRIX: Completely blocks parent background scroll bleeding
  useEffect(() => {
    if (isOpen) {
      // Lock body scrolling instantly when modal drops into view
      document.body.style.overflow = "hidden";
    } else {
      // Restore clean scrolling layout flow when modal finishes its fade out
      document.body.style.overflow = "unset";
    }

    // GARBAGE COLLECTION GARBAGE COLLECTION: Safety fallback cleanup if user unmounts routes mid-search
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    /* 
      🌟 FIX: Component remains permanently mounted. 
      Visibility and pointer events toggle synchronously with opacity to prevent invisible layout clicks.
    */
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-start pt-[10vh] px-4 font-[Inter] select-none transition-all duration-300 ${
        isOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"
      }`}
    >
      {/* 1. Backdrop Scrim: Transitions smoothly from completely transparent to dark blur */}
      <div
        className={`absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300 ease-in-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* 2. Search Modal Box: Handles dual scaling and fading micro-animations simultaneously */}
      <div
        ref={modalRef}
        className={`relative w-full max-w-2xl bg-[#0c0c0c] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-10 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${
          isOpen
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 -translate-y-4"
        }`}
      >
        {/* Input field row */}
        <form
          onSubmit={handleExecuteFullSearch}
          className="flex items-center gap-3 px-4 py-3.5 border-b border-white/5 bg-black/20"
        >
          <Search size={20} className="text-white/40 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search anime title, movies, series tracks..."
            className="w-full bg-transparent text-white placeholder-white/30 text-[15px] outline-none font-medium"
          />
          {loading && (
            <div className="w-4 h-4 border-2 border-(--brand-color) border-t-transparent rounded-full animate-spin shrink-0" />
          )}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all shrink-0 ml-1"
          >
            <X size={15} />
          </button>
        </form>

        {/* Dynamic Suggestions Dropdown List */}
        {suggestions.length > 0 && (
          <div className="flex flex-col max-h-[50vh] overflow-y-auto bg-[#0a0a0a] p-2 divide-y divide-white/5 custom-sidebar-scroll">
            {suggestions.map((item) => (
              <Link
                key={item.id}
                to={`/anime/${item.id}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-4 p-2.5 rounded-xl hover:bg-white/5 transition-all duration-200 group border border-transparent hover:border-white/5"
              >
                <div className="w-11 aspect-[3/4] bg-neutral-900 rounded-md overflow-hidden shrink-0 relative shadow-sm">
                  <img
                    src={item.poster}
                    alt=""
                    className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-102"
                  />
                </div>

                <div className="flex flex-col min-w-0 leading-tight">
                  <h4 className="text-[14px] font-bold text-white group-hover:text-(--brand-color) transition-colors truncate max-w-md">
                    {item.title || item.title_romaji}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 text-[12px] text-[#a1a1a1] font-medium mt-1">
                    <span className="uppercase text-[11px] font-bold font-mono text-white/50 bg-white/5 border border-white/5 px-1.5 py-0.2 rounded">
                      {item.format || "TV"}
                    </span>
                    <div className="w-1 h-1 bg-white/20 rounded-full" />
                    <span className="flex items-center gap-0.5">
                      <Calendar size={11} /> {item.year || "TBA"}
                    </span>
                    {item.episodes && (
                      <>
                        <div className="w-1 h-1 bg-white/20 rounded-full" />
                        <span className="flex items-center gap-0.5">
                          <Film size={11} /> {item.episodes} Eps
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))}

            <button
              type="submit"
              onClick={handleExecuteFullSearch}
              className="w-full text-center py-3.5 bg-black/40 hover:bg-black/60 text-(--brand-color) font-bold text-[13px] tracking-wide flex items-center justify-center gap-1.5 font-[Inter] border-t border-white/5 group mt-1 transition-colors"
            >
              <span>See All Search Results</span>
              <ArrowRight
                size={14}
                className="transform transition-transform group-hover:translate-x-0.5"
              />
            </button>
          </div>
        )}

        {/* Empty State View */}
        {searchQuery.trim().length >= 2 &&
          suggestions.length === 0 &&
          !loading && (
            <div className="p-8 text-center text-white/30 text-[14px] flex flex-col items-center gap-1.5">
              <p className="font-bold text-white/50">No Suggestions Found</p>
              <p className="text-[13px] text-[#a1a1a1]/80 max-w-xs leading-normal">
                We couldn't match recommendations for "{searchQuery}". Press
                Enter to try our full advanced search index filters.
              </p>
            </div>
          )}
      </div>
    </div>
  );
};
