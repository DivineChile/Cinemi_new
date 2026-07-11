import { useMediaPlayer } from "@vidstack/react";
import { Film } from "lucide-react";
import { useState, useEffect } from "react";

export const PlayerLoader = () => {
  // 1. Grab access to the global parent player context engine safely
  const player = useMediaPlayer();
  const [isWaiting, setIsWaiting] = useState(false);

  useEffect(() => {
    if (!player) return;

    // 2. Subscribe directly to the player's internal state store fields
    return player.subscribe(({ waiting, buffering }) => {
      // Combines both buffering conditions into a standard React state boolean toggle
      setIsWaiting(waiting || buffering);
    });
  }, [player]);

  if (!isWaiting) return null;

  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex flex-col items-center justify-center gap-3 z-40 pointer-events-none transition-all duration-300">
      <div className="p-4 bg-[#0c0c0c]/90 border border-white/5 rounded-2xl shadow-2xl flex flex-col items-center gap-2.5">
        <Film size={24} className="animate-spin text-(--primary-color)" />
        <span className="text-[12px] font-bold text-white font-[Inter] tracking-wide animate-pulse">
          Buffering stream...
        </span>
      </div>
    </div>
  );
};
