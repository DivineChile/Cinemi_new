import { Link } from "react-router-dom";
import { ArrowLeft, Moon, Sun } from "lucide-react";

export const WatchHeader = ({ id, isDimmed, setIsDimmed }) => {
  return (
    // We keep the header background transparent so it inherits the master page color safely
    <header className="relative max-w-7xl mx-auto px-4 py-4 flex justify-between items-center z-50 font-[Inter]">
      {/* Left Action: Return to Anime Details Screen Link */}
      <Link
        to={`/anime/${id}`}
        className="flex items-center gap-2 text-white/70 hover:text-white font-semibold text-[14px] bg-white/5 border border-white/10 hover:border-white/20 px-3.5 py-1.5 rounded-lg transition-all duration-300"
      >
        <ArrowLeft size={16} />
        <span>Back to Details</span>
      </Link>

      {/* Right Action: Cinematic Lights Switcher Toggle Button */}
      <button
        type="button"
        onClick={() => setIsDimmed(!isDimmed)}
        className="flex items-center gap-2 text-[13px] font-bold tracking-wide bg-white/5 border border-white/10 text-white/80 hover:text-white px-4 py-1.5 rounded-lg transition-all duration-300 relative pointer-events-auto hover:bg-white/10"
      >
        {isDimmed ? (
          <>
            <Sun size={15} className="text-amber-400 animate-pulse" />
            <span>Turn on Lights</span>
          </>
        ) : (
          <>
            <Moon size={15} className="text-white/60" />
            <span>Dim Lights</span>
          </>
        )}
      </button>
    </header>
  );
};
