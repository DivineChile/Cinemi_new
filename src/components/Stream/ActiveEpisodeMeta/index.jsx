import { AlertCircle } from "lucide-react";

export const ActiveEpisodeMeta = ({ slug, provider, category }) => {
  // Extract and clean up the episode number string format safely (e.g., "episode-12" -> "12")
  const rawEpisodeNum = slug?.split("-")?.pop();
  const formattedEpisode = isNaN(rawEpisodeNum) ? "Active" : rawEpisodeNum;

  return (
    <div className="active-episode-metadata mt-2 flex flex-col gap-2 font-[Inter]">
      {/* Dynamic Notification Badging Row */}
      <div className="flex items-center gap-2.5">
        <span className="bg-[#b11226]/10 border border-[#b11226]/20 text-(--brand-color) text-[11px] font-extrabold uppercase font-mono px-2.5 py-0.5 rounded-md tracking-wider select-none animate-pulse">
          Now Playing
        </span>
        <h2 className="text-[20px] md:text-[24px] font-bold text-white tracking-wide leading-none">
          Episode {formattedEpisode}
        </h2>
      </div>

      {/* Informative Connection Channel Status Block */}
      <div className="flex items-start gap-2 text-[14px] text-[#a1a1a1] leading-relaxed max-w-3xl font-medium mt-0.5">
        <AlertCircle size={15} className="text-[#a1a1a1]/40 shrink-0 mt-1" />
        <p>
          Connected to server node{" "}
          <span className="text-white uppercase font-bold font-mono bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[12px]">
            {provider || "Default"}
          </span>{" "}
          running audio track channel{" "}
          <span className="text-white uppercase font-bold font-mono bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[12px]">
            {category || "SUB"}
          </span>
          . If you experience unexpected buffering loops, dropouts, or audio
          mismatches, utilize the configuration menus to shift streaming
          providers.
        </p>
      </div>
    </div>
  );
};
