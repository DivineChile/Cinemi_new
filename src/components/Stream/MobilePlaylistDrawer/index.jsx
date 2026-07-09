import { useNavigate, Link } from "react-router-dom";
import {
  Tv,
  X,
  Image as ImageIcon,
  AlertCircle,
  SlidersHorizontal,
} from "lucide-react";
import { SmoothImage } from "../../ui/SmoothImage";

export const MobilePlaylistDrawer = ({
  isOpen,
  setIsOpen,
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

  // Guard clause: Return nothing if the drawer state is closed to keep DOM light
  if (!isOpen) return null;

  // 1. Cast the active string identifier to an absolute integer safely
  const currentEpNumber = parseInt(episode, 10) || 1;

  // 2. SYNCED SOURCE REDIRECT: Changes provider while cleanly preserving the episode number context
  const handleSourceRedirect = (newProvider) => {
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

    // Direct routing format path constraints: /watch/:provider/:id/:episode/:category
    navigate(`/watch/${newProvider}/${id}/${targetEpNum}/${activeAudio}`);
  };

  // 3. SYNCED AUDIO REDIRECT: Changes audio track without dropping ongoing provider context parameters
  const handleAudioRedirect = (newAudio) => {
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

    navigate(`/watch/${activeProvider}/${id}/${targetEpNum}/${newAudio}`);
  };

  // 4. Fallback reference sync to prevent index boundary render crashes
  const paginatedEpisodeList = episodeChunks[activeChunkIndex] || [];

  return (
    /* 
      🌟 FIX: Outer parent wrapper container layer stays fully interactive instantly.
      Visibility is handled gracefully by its child structural nodes.
    */
    <div
      className={`lg:hidden fixed inset-0 z-50 flex flex-col justify-end font-[Inter] transition-all duration-500 ${
        isOpen
          ? "visible opacity-100 pointer-events-auto"
          : "invisible opacity-0 pointer-events-none"
      }`}
    >
      {/* 1. Backdrop Scrim Layer: Seamlessly fades out alpha levels alongside the parent container */}
      <div
        className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-500 ease-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* 2. Sliding Content Tray Container: Executes a hardware-accelerated slide-down transition */}
      <div
        className={`w-full bg-[#0c0c0c] border-t border-white/10 rounded-t-3xl max-h-[70vh] flex flex-col relative z-50 transition-transform duration-500 transform ease-out ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Drawer Header Block */}
        <div className="p-4 border-b border-white/5 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Tv size={16} className="text-(--brand-color)" />
            <span className="font-bold text-[16px] text-white">
              Select Episode Deck
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-full bg-white/5 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Dropdown Filters Row */}
        <div
          className="p-3 bg-black/40 border-b border-white/5 flex gap-2 text-[12px] shrink-0 font-semibold"
          onClick={(e) => e.stopPropagation()}
        >
          <select
            value={activeProvider}
            onChange={(e) => handleSourceRedirect(e.target.value)}
            className="w-1/2 bg-[#121212] border border-white/10 rounded-lg p-2.5 uppercase text-white outline-none cursor-pointer"
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
          <select
            value={activeAudio}
            onChange={(e) => handleAudioRedirect(e.target.value)}
            className="w-1/2 bg-[#121212] border border-white/10 rounded-lg p-2.5 uppercase text-white outline-none cursor-pointer"
          >
            <option value="sub">Audio: SUB</option>
            <option value="dub">Audio: DUB</option>
          </select>
        </div>

        {/* Pagination Range Selectors */}
        {episodeChunks?.length > 1 && (
          <div
            className="px-3 py-2 bg-[#101010] border-b border-white/5 flex items-center gap-3 overflow-x-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-[10px] text-[#a1a1a1] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
              <SlidersHorizontal size={11} /> Range:
            </span>
            <div className="flex gap-1.5">
              {episodeChunks.map((_, index) => {
                const startEP = index * 50 + 1; // Updated step calculations to match 50-chunk criteria
                const endEP = Math.min(
                  (index + 1) * 50,
                  totalEpisodeList.length,
                );
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveChunkIndex(index)}
                    className={`px-3 py-1.5 cursor-pointer rounded-lg text-[11px] font-bold tracking-wide shrink-0 transition-all ${
                      index === activeChunkIndex
                        ? "bg-white text-black"
                        : "bg-white/5 border border-white/5 text-white/60 hover:text-white"
                    }`}
                  >
                    {startEP} - {endEP}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Dynamic Playlist List Grid */}
        <div className="p-4 overflow-y-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden bg-[#0a0a0a] flex-1">
          {paginatedEpisodeList?.length === 0 ? (
            <div className="text-center text-white/30 text-[13px] py-12 flex flex-col items-center gap-2">
              <AlertCircle size={20} className="opacity-50" />
              <p>No episodes matched this settings channel.</p>
            </div>
          ) : (
            /* Implements an efficient 2-column small screen button matrix */
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {paginatedEpisodeList.map((ep) => {
                const episodeNum = ep.number ?? ep.num;
                const uniqueId = ep.id || `${activeProvider}-${episodeNum}`;

                // Match active link paths reliably via direct integer casting comparisons
                const isSelected = parseInt(episode, 10) === episodeNum;

                return (
                  <Link
                    key={uniqueId}
                    to={`/watch/${activeProvider}/${id}/${episodeNum}/${activeAudio}`}
                    onClick={() => setIsOpen(false)}
                    className={`flex flex-col justify-center p-3 rounded-xl border text-left transition-all duration-200 group relative ${
                      isSelected
                        ? "bg-(--primary-color) border-(--primary-color) text-white font-bold shadow-lg shadow-red-950/20"
                        : "bg-white/5 border-white/5 text-white/80 hover:bg-white/10"
                    }`}
                  >
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
    </div>
  );
};
