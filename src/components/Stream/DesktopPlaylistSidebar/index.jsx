import { SmoothImage } from "../../ui/SmoothImage";
import { Link, useNavigate } from "react-router-dom";
import {
  Tv,
  Layers,
  Image as ImageIcon,
  Play,
  AlertCircle,
} from "lucide-react";

export const DesktopPlaylistSidebar = ({
  episodeData,
  totalEpisodeList,
  id,
  slug,
  activeProvider,
  activeAudio,
}) => {
  const navigate = useNavigate();

  // Find out what integer episode index number we are currently sitting on
  const currentEpNumber =
    totalEpisodeList.find((ep) => {
      const token = ep.id?.split("/").pop() || ep.number.toString();
      return slug === token;
    })?.number || 1;

  // Handles swapping providers while cleanly preserving the episode number count
  const handleSourceRedirect = (newProvider) => {
    const targetProviderDeck =
      episodeData?.providers?.[newProvider]?.episodes?.[activeAudio] || [];

    // Find the matching episode object inside the newly selected provider's deck
    const matchingNewEp =
      targetProviderDeck.find((ep) => ep.number === currentEpNumber) ||
      targetProviderDeck[0];

    if (matchingNewEp) {
      const newSlugToken =
        matchingNewEp.id?.split("/").pop() || matchingNewEp.number.toString();
      navigate(`/watch/${newProvider}/${id}/${activeAudio}/${newSlugToken}`);
    } else {
      navigate(`/watch/${newProvider}/${id}/${activeAudio}/1`);
    }
  };

  const handleAudioRedirect = (newAudio) => {
    const targetAudioDeck =
      episodeData?.providers?.[activeProvider]?.episodes?.[newAudio] || [];
    const matchingNewEp =
      targetAudioDeck.find((ep) => ep.number === currentEpNumber) ||
      targetAudioDeck[0];

    if (matchingNewEp) {
      const newSlugToken =
        matchingNewEp.id?.split("/").pop() || matchingNewEp.number.toString();
      navigate(`/watch/${activeProvider}/${id}/${newAudio}/${newSlugToken}`);
    }
  };

  const workingProviders = ["bonk", "bee", "pewe"];
  return (
    /* 
      Exclusively visible on laptop/desktop monitor viewports (lg:flex).
      Completely hidden out of the DOM flow on small mobile smartphones (hidden).
      Locked to a maximum cinematic height matching standard widescreen aspect scales.
    */
    <div className="hidden lg:flex flex-col bg-white/5 border border-white/10 rounded-2xl p-5 gap-4 max-h-[75vh] min-h-[500px] overflow-y-auto font-[Inter] tracking-wide select-none">
      {/* SIDEBAR NAVIGATION CONTROL CHANNEL INTERFACE */}
      <div className="sidebar-header border-b border-white/10 pb-3.5 flex flex-col gap-3 shrink-0">
        <h3 className="text-[16px] font-bold text-white/90 flex items-center gap-2">
          <Tv size={16} className="text-(--brand-color)" /> Dynamic Playlist
        </h3>

        {/* Dual Context Selectors Grid Rows */}
        <div className="grid grid-cols-2 gap-2 text-[12px] font-semibold font-[Inter]">
          {/* Channel Server Switcher Dropdown */}
          <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 cursor-pointer hover:border-white/20 transition-all">
            <Layers size={13} className="text-white/40" />
            <select
              value={activeProvider}
              onChange={(e) => handleSourceRedirect(e.target.value)}
              className="bg-transparent w-full text-white outline-none cursor-pointer uppercase text-[11px]"
            >
              {Object.entries(episodeData?.providers)
                .filter(([key]) => workingProviders.includes(key))
                .map(([pKey]) => {
                  return (
                    <option key={pKey} value={pKey} className="bg-[#0a0a0a]">
                      Src: {pKey}
                    </option>
                  );
                })}
            </select>
          </div>

          {/* Sub / Dub Audio Selector Dropdown */}
          <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 cursor-pointer hover:border-white/20 transition-all">
            <select
              value={activeAudio}
              onChange={(e) => handleAudioRedirect(e.target.value)}
              className="bg-transparent w-full text-white outline-none cursor-pointer uppercase text-[11px]"
            >
              <option value="sub" className="bg-[#0a0a0a]">
                Format: SUB
              </option>
              <option value="dub" className="bg-[#0a0a0a]">
                Format: DUB
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* SCROLLING EPISODES PLAYLIST SLOT TRACK */}
      <div className="flex flex-col gap-2.5 overflow-y-auto pr-1">
        {totalEpisodeList.length === 0 ? (
          <div className="text-center text-white/30 text-[13px] py-12 flex flex-col items-center gap-2">
            <AlertCircle size={20} className="opacity-50" />
            <p>No episodes matched this source settings block.</p>
          </div>
        ) : (
          totalEpisodeList.map((ep) => {
            // Isolate individual endpoint tokens safely to check against active states
            const epSlugToken =
              ep.id?.split("/")?.pop() || ep.number.toString();
            const isSelected = slug === epSlugToken;

            const targetWatchPath = ep.id
              ? `/${ep.id}`
              : `/watch/${activeProvider}/${id}/${activeAudio}/${ep.number}`;

            return (
              <Link
                key={ep.number || ep.id}
                to={targetWatchPath}
                className={`flex items-center gap-3 p-2 rounded-xl border transition-all duration-300 group ${
                  isSelected
                    ? "bg-(--primary-color) border-(--primary-color) text-white shadow-lg shadow-[#b11226]/10 font-bold"
                    : "bg-black/10 border-white/0 hover:border-white/5 hover:bg-white/5 text-white/80 hover:text-white"
                }`}
              >
                {/* Micro Thumbnail Image Box frame */}
                <div className="w-20 aspect-video rounded-md overflow-hidden relative shrink-0 bg-neutral-900 shadow-sm">
                  {ep.image ? (
                    <SmoothImage src={ep.image} alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/20">
                      <ImageIcon size={14} />
                    </div>
                  )}
                  {/* Subtle black overlay appears with play vector arrow icon on card item hover triggers */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play
                      size={12}
                      fill="currentColor"
                      className="text-white"
                    />
                  </div>
                </div>

                {/* Typography Metadata description stack rows */}
                <div className="flex flex-col min-w-0 font-[Inter] leading-tight">
                  <span className="text-[13px]">Episode {ep.number}</span>
                  {ep.title && (
                    <span
                      className={`text-[11px] truncate max-w-[130px] mt-0.5 transition-colors ${
                        isSelected
                          ? "text-white/70"
                          : "text-white/40 group-hover:text-white/60"
                      }`}
                    >
                      {ep.title}
                    </span>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};;;
