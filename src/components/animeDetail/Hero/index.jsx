import { Link } from "react-router-dom";
import {
  Play,
  Plus,
  Star,
  Calendar,
  Clock,
  Film,
  ChevronLeft,
} from "lucide-react";

function Hero({ loading, error, anime }) {
  // 4. Integrated Skeleton Loader Overlay state
  if (loading) {
    return (
      <div className="relative w-full h-[90vh] md:h-[100vh] bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 w-full h-full flex flex-col items-center justify-center gap-6 animate-pulse text-center">
          <div className="h-6 bg-white/5 rounded-full w-24" />
          <div className="h-14 bg-white/10 rounded-xl w-[70%] max-w-2xl" />
          <div className="h-8 bg-white/5 rounded-full w-64" />
          <div className="h-20 bg-white/5 rounded-xl w-[85%] max-w-xl" />
          <div className="flex gap-4 w-full sm:w-auto mt-2 justify-center">
            <div className="h-12 bg-white/10 rounded-lg w-36" />
            <div className="h-12 bg-white/5 rounded-lg w-36" />
          </div>
        </div>
      </div>
    );
  }

  // 5. Clean Error state display bound
  if (error || !anime) {
    return (
      <div className="w-full h-[90vh] md:h-[100vh] bg-[#0a0a0a] flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-(--brand-color) font-[Inter] text-lg font-semibold">
          {error || "Anime not found"}
        </p>
        <Link
          to="/"
          className="text-white bg-white/10 hover:bg-white/15 px-5 py-2.5 rounded-lg text-sm font-[Inter] transition-all"
        >
          Go Back Home
        </Link>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[90vh] md:h-[100vh] bg-[#0a0a0a] overflow-hidden flex items-center justify-center">
      <div className="absolute top-15 left-4 md:left-4 z-40 max-w-7xl mx-auto w-full pointer-events-none">
        <Link
          to="/"
          className="pointer-events-auto flex items-center gap-1.5 text-white/70 hover:text-white bg-black/40 hover:bg-black/60 backdrop-blur-md px-3.5 py-3 rounded-lg border border-white/5 font-[Inter] text-[13px] font-semibold w-fit transition-all shadow-md group"
        >
          <ChevronLeft
            size={16}
            className="transform transition-transform group-hover:-translate-x-0.5"
          />
        </Link>
      </div>
      {/* BACKGROUND LAYERS (These remain full-width, wall-to-wall) */}
      <div className="absolute w-[140vw] h-[140vw] md:w-[100vw] md:h-[100vw] bg-[conic-gradient(from_0deg,transparent,#b11226/30,transparent,#b11226/10,transparent)] opacity-80 animate-[spin_20s_linear_infinite] pointer-events-none z-0" />
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-10">
        <img
          src={anime.bannerImage}
          alt=""
          className="w-full h-full object-cover opacity-35 mix-blend-lighten scale-105 animate-[pulse-slow_8s_ease-in-out_infinite]"
        />
      </div>
      {/* <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/70 to-[#0a0a0a]/40 z-20 pointer-events-none" /> */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/30 to-[#0a0a0a] z-20 pointer-events-none" />

      {/* PROJECT CONTAINER ALIGNMENT LAYER */}
      <div className="max-w-7xl mx-auto px-4 w-full h-full flex items-center justify-center relative z-30 pointer-events-none">
        {/* Centered Content Metadata Interface Wrapper */}
        <div className="text-center flex flex-col items-center gap-5 md:gap-6 mt-12 w-full pointer-events-auto">
          <span className="badge uppercase font-[Inter] bg-[#b11226]/20 text-(--brand-color) text-[12px] font-bold py-1 px-3.5 rounded-full border border-[#b11226]/30 tracking-wider">
            {anime.format} Series
          </span>

          <h1 className="text-[32px] line-clamp-3 sm:text-[46px] md:text-[60px] xl:text-[80px] font-black leading-tight text-white tracking-tight drop-shadow-xl max-w-3xl">
            {anime.title.english}
          </h1>

          {/* Informative Inline Metadata Row with Integrated Icons */}
          <div className="flex flex-wrap gap-4 md:gap-5 justify-center items-center font-[Inter] text-white/80 text-[14px] md:text-[15px] font-medium bg-black/20 backdrop-blur-md py-1.5 px-5 rounded-full border border-white/5">
            <span className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Star size={15} fill="currentColor" /> {anime.averageScore / 10}
            </span>
            <div className="w-1 h-1 bg-white/20 rounded-full" />

            <span className="flex items-center gap-1.5">
              <Calendar size={15} className="text-white/60" />{" "}
              {anime.seasonYear}
            </span>
            <div className="w-1 h-1 bg-white/20 rounded-full" />

            <span className="flex items-center gap-1.5">
              <Film size={15} className="text-white/60" /> {anime.episodes} Eps
            </span>
            <div className="w-1 h-1 bg-white/20 rounded-full" />

            <span className="flex items-center gap-1.5">
              <Clock size={15} className="text-white/60" /> {anime.duration}{" "}
              mins
            </span>
          </div>

          {/* Action Buttons Layer with Play and Plus Icons */}
          <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto mt-2">
            <Link
              to={`/watch/${anime.id}`}
              className="button flex gap-2 w-full sm:w-fit justify-center items-center bg-(--primary-color) hover:bg-[#b11226] font-[Inter] text-[14px] font-bold uppercase py-3.5 px-8 rounded-lg shadow-lg shadow-[#b11226]/20 transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Play size={16} fill="currentColor" />
              Watch Now
            </Link>

            <button
              type="button"
              className="button flex gap-2 w-full sm:w-fit justify-center items-center bg-white/5 hover:bg-white/10 text-white transition-all duration-300 border border-white/10 font-[Inter] text-[14px] font-bold uppercase py-3.5 px-8 rounded-lg transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus size={16} />
              Watchlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
