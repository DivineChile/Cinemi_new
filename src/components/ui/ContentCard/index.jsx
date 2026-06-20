import { Play, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { SmoothImage } from "../SmoothImage";

function ContentCard({ to, id, poster, title, score, genres }) {
  return (
    <Link
      to={to}
      className="content-card group flex flex-col w-[144px] md:w-[230px]"
    >
      {/* Poster image box frame */}
      <div className="poster-container w-full h-[216px] md:h-[345px] relative overflow-hidden rounded-xl bg-gray-900">
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
          <span className="text-white font-[Inter] flex gap-2 items-center justify-center w-full bg-white/5 hover:bg-white/10 transition-colors duration-300 border border-white/20 rounded-lg py-3 transition-transform duration-300 translate-y-4 group-hover:translate-y-0 cursor-pointer">
            <Plus size={16} />
            Add to List
          </span>
        </div>
      </div>

      {/* Text description metadata rows */}
      <div className="poster-content flex flex-col gap-1 mt-2">
        <h1 className="text-[16px] text-white font-semibold font-[Inter] truncate group-hover:text-(--brand-color) transition-colors">
          {title}
        </h1>
        <p className="flex gap-1 items-center text-[14px] font-[Inter] text-[#a1a1a1] truncate">
          ⭐ {score} • {genres}
        </p>
      </div>
    </Link>
  );
}

export default ContentCard;
