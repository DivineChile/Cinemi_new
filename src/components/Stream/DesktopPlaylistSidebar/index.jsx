import { Link, useNavigate } from "react-router-dom";
import {
  Tv,
  Layers,
  Play,
  SlidersHorizontal,
} from "lucide-react";

export const DesktopPlaylistSidebar = ({
  episodeData,
  totalEpisodeList,
  episodeChunks,
  activeChunkIndex,
  setActiveChunkIndex,
  id,
  episode,
  activeProvider,
  activeAudio,
}) => {
  const navigate = useNavigate();

  // 1. Cast the active string identifier to an absolute integer safely
  const currentEpNumber = parseInt(episode, 10) || 1;

  // 2. Handles swapping providers while cleanly preserving the episode number context
  const handleSourceRedirect = (newProvider) => {
    // Locate target provider array entry row matching selection criteria
    const targetProviderObj = Array.isArray(episodeData)
      ? episodeData.find(
          (item) => item.provider === newProvider && item.success,
        )
      : null;

    const targetProviderDeck = targetProviderObj?.data?.episodes || [];

    // Map exact or fallback number matches matching structural properties (number vs num)
    const matchingNewEp =
      targetProviderDeck.find(
        (ep) => (ep.number ?? ep.num) === currentEpNumber,
      ) || targetProviderDeck[0];

    const targetEpNum = matchingNewEp
      ? (matchingNewEp.number ?? matchingNewEp.num)
      : 1;

    // Direct path routing format constraints: /watch/:provider/:id/:episode/:category
    navigate(`/watch/${newProvider}/${id}/${targetEpNum}/${activeAudio}`);
  };

  // 3. Handles switching audio streams without dropping the active navigation indices
  const handleAudioRedirect = (newAudio) => {
    // Find matching episode token under the same provider layout context
    const currentProviderObj = Array.isArray(episodeData)
      ? episodeData.find(
          (item) => item.provider === activeProvider && item.success,
        )
      : null;

    const targetDeck = currentProviderObj?.data?.episodes || [];
    const matchingNewEp =
      targetDeck.find((ep) => (ep.number ?? ep.num) === currentEpNumber) ||
      targetDeck[0];

    const targetEpNum = matchingNewEp
      ? (matchingNewEp.number ?? matchingNewEp.num)
      : currentEpNumber;

    // Preserves ongoing provider context track parameters safely
    navigate(`/watch/${activeProvider}/${id}/${targetEpNum}/${newAudio}`);
  };

  // 4. Fallback reference sync to prevent index boundary render crashes
  const paginatedEpisodeList = episodeChunks[activeChunkIndex] || [];

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
              {/* Safeguard checking for array payloads and filtering out failed tracks natively */}
              {Array.isArray(episodeData) &&
                episodeData
                  .filter((item) => item.success)
                  .map((item) => (
                    <option
                      key={item.provider}
                      value={item.provider}
                      className="bg-[#0a0a0a]"
                    >
                      Src: {item.provider}
                    </option>
                  ))}
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

        {/* Chunk Segments Header Row Tracker */}
        {episodeChunks.length > 1 && (
          <div className="flex flex-col gap-1.5 mt-2 border-t border-white/5 pt-3">
            <span className="text-[10px] text-[#a1a1a1] font-bold uppercase tracking-wider flex items-center gap-1">
              <SlidersHorizontal size={11} /> Range Select:
            </span>
            <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pr-1">
              {episodeChunks.map((_, index) => {
                const startEP = index * 50 + 1; // Updated step calculations to match new 50-chunk criteria
                const endEP = Math.min(
                  (index + 1) * 50,
                  totalEpisodeList.length,
                );
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveChunkIndex(index)}
                    className={`px-2 py-1 cursor-pointer rounded text-[11px] font-bold transition-all ${
                      index === activeChunkIndex
                        ? "bg-white text-black"
                        : "bg-white/5 border border-white/5 text-white/60 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {startEP}-{endEP}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* SCROLLING EPISODES PLAYLIST SLOT TRACK */}
      {/* RENDER DENSE TEXT-ONLY GRID ONLY */}
      <div className="overflow-y-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pr-1">
        {paginatedEpisodeList.length === 0 ? (
          <div className="text-center text-white/30 text-[13px] py-12">
            <p>No episodes matched this source channel.</p>
          </div>
        ) : (
          /* Uses grid layout rules tailored cleanly for a sidebar component layout */
          <div className="grid grid-cols-2 gap-2">
            {paginatedEpisodeList.map((ep) => {
              const episodeNum = ep.number ?? ep.num;
              const uniqueId = ep.id || `${activeProvider}-${episodeNum}`;

              // Match matching active parameter track configurations cleanly via absolute numerical matches
              const isSelected = parseInt(episode, 10) === episodeNum;

              return (
                <Link
                  key={uniqueId}
                  to={`/watch/${activeProvider}/${id}/${episodeNum}/${activeAudio}`}
                  className={`flex flex-col justify-center p-2.5 rounded-xl border text-left transition-all duration-200 group relative ${
                    isSelected
                      ? "bg-(--primary-color) border-(--primary-color) text-white font-bold"
                      : "bg-black/20 border-white/5 hover:border-white/20 hover:bg-white/5"
                  }`}
                >
                  {/* Subtle hover play accent indicator icon layer */}
                  {!isSelected && (
                    <div className="absolute top-2 right-2 text-(--brand-color) opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      <Play size={10} fill="currentColor" />
                    </div>
                  )}

                  <span
                    className={`text-[13px] tracking-wide font-extrabold ${isSelected ? "text-white" : "text-white/90"}`}
                  >
                    EP {episodeNum}
                  </span>

                  <span
                    className={`text-[11px] truncate max-w-full mt-0.5 font-[Inter] ${
                      isSelected
                        ? "text-white/80 font-medium"
                        : "text-[#a1a1a1] group-hover:text-white"
                    }`}
                  >
                    {ep.title && ep.title !== `Episode ${episodeNum}`
                      ? ep.title
                      : "Watch Now"}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
