import { AlertCircle, Calendar, Film } from "lucide-react";

export const ActiveEpisodeMeta = ({
  slug,
  provider,
  category,
  activeEpisodeObj,
}) => {
  const rawEpisodeNum = slug?.split("-")?.pop();
  const formattedEpisode = isNaN(rawEpisodeNum) ? "Active" : rawEpisodeNum;

  // Extract rich parameter fields safely out of the newly matched episode metadata object mapping
  const episodeTitle = activeEpisodeObj?.title || `Episode ${formattedEpisode}`;
  const episodeDescription = activeEpisodeObj?.description
    ? activeEpisodeObj.description.replace(/<[^>]*>/g, "")
    : "No synopsis narrative is currently recorded for this individual episode track file.";
  const airDate = activeEpisodeObj?.airDate || null;

  return (
    <div className="active-episode-metadata flex flex-col gap-4 font-[Inter] text-white">
      {/* Top Identity Block */}
      <div className="flex flex-col gap-1.5 border-b border-white/5 pb-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="bg-[#b11226]/10 border border-[#b11226]/20 text-(--brand-color) text-[11px] font-extrabold uppercase font-mono px-2.5 py-0.5 rounded-md tracking-wider select-none animate-pulse">
            Now Streaming
          </span>
          <h2 className="text-[20px] md:text-[24px] font-black tracking-wide leading-none">
            {episodeTitle}
          </h2>
        </div>

        {/* Secondary Context Information Info line (Episode Counter + Airing Timeline details) */}
        <div className="flex items-center gap-3 text-[13px] text-[#a1a1a1] font-medium mt-1">
          <span className="flex items-center gap-1">
            <Film size={13} className="text-(--brand-color)" /> Episode{" "}
            {formattedEpisode}
          </span>
          {airDate && (
            <>
              <div className="w-1 h-1 bg-white/20 rounded-full" />
              <span className="flex items-center gap-1">
                <Calendar size={13} /> Released {airDate}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Episode Plot Summary Synopsis Block */}
      <div className="flex flex-col gap-2">
        <p className="text-[#a1a1a1] font-[Inter] text-[15px] md:text-[16px] leading-relaxed whitespace-pre-line max-w-4xl">
          {episodeDescription}
        </p>
      </div>

      {/* Channel Server Connection Log Summary */}
      <div className="flex items-start gap-2 text-[13px] text-white/40 leading-normal max-w-3xl mt-2 bg-white/5 border border-white/5 p-3 rounded-xl">
        <AlertCircle size={14} className="shrink-0 mt-0.5" />
        <p>
          You are watching via node server{" "}
          <span className="text-white/70 font-bold uppercase font-mono">
            {provider}
          </span>{" "}
          ({category}). If you notice video stuttering, slow loading, audio
          delays, or black screens, switch channels using the controls.
        </p>
      </div>
    </div>
  );
};
