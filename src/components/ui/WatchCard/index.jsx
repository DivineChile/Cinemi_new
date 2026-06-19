import { PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";

function WatchCard({ img, title, currentEP, timeLeft, to }) {
  return (
    <Link className="watch-card group flex flex-col gap-3" to={to}>
      <div className="watch-card-inner relative w-[256px] h-[144px] md:w-[320px] md:h-[180px] overflow-hidden rounded-lg">
        {/* Image wrapper needs h-full to match the card inner container */}
        <div className="watch-card-img rounded-lg overflow-hidden relative h-full w-full">
          <img
            src={img}
            alt={title}
            className="w-full h-full rounded-md object-cover"
          />
          {/* Progress bar stays visible at the bottom */}
          <div className="progress w-[50%] bg-(--primary-color) h-[4px] rounded-l-md absolute bottom-0 left-0 z-10"></div>
        </div>

        {/* 2. Replaced 'hover:' with 'group-hover:' and cleaned up positioning classes */}
        <div className="overlay absolute inset-0 bg-[#0a0a0a]/60 opacity-0 pointer-events-none scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 flex items-center justify-center text-center z-20">
          <PlayCircle
            size={50} // Use numeric size prop for standard Lucide icons
            className="text-white transform transition-transform duration-300 scale-75 group-hover:scale-100"
          />
        </div>
      </div>

      <div className="info flex-1">
        <h3 className="text-[14px] font-semibold text-white font-[Inter] group-hover:text-(--brand-color) transition-colors">
          {title}
        </h3>
        <p className="text-[12px] flex gap-1 text-[#a1a1a1] font-[Inter]">
          EP{currentEP} • {timeLeft} left
        </p>
      </div>
    </Link>
  );
}

export default WatchCard;
