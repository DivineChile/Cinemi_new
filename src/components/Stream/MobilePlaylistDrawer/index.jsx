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
  slug,
  activeProvider,
  activeAudio,
}) => {
  const navigate = useNavigate();

  // Guard clause: Return nothing if the drawer state is closed to keep DOM light
  if (!isOpen) return null;

  // Find out what integer episode index number we are currently sitting on
  const currentEpNumber =
    totalEpisodeList.find((ep) => {
      const token = ep.id?.split("/").pop() || ep.number.toString();
      return slug === token;
    })?.number || 1;

  // 🌟 SYNCED SOURCE REDIRECT: Changes provider AND calculates the correct matching episode slug
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

  // 🌟 SYNCED AUDIO REDIRECT: Changes audio track AND updates the matching episode slug
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

  const paginatedEpisodeList = episodeChunks[activeChunkIndex] || [];
  return (
    /* 
      🌟 FIX: Outer parent wrapper container layer stays fully interactive instantly.
      Visibility is handled gracefully by its child structural nodes.
    */
    <div
      className={`lg:hidden fixed inset-0 z-50 flex flex-col justify-end font-[Inter] ${
        isOpen ? "visible" : "invisible"
      }`}
    >
      {/* 1. Backdrop Scrim Layer: Handles the independent clean opacity alpha transition fade */}
      <div
        className={`absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ease-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* 2. Sliding Content Tray Container: Handles the native app fluid translation slide-up */}
      <div
        className={`w-full bg-[#0c0c0c] border-t border-white/10 rounded-t-3xl max-h-[70vh] flex flex-col relative z-50 transition-transform duration-500 transform ease-[cubic-bezier(0.16,1,0.3,1)] ${
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
            className="p-1.5 rounded-full bg-white/5 text-white/60 hover:text-white transition-colors"
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
            className="w-1/2 bg-[#121212] border border-white/10 rounded-lg p-2.5 uppercase text-white outline-none"
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
          <select
            value={activeAudio}
            onChange={(e) => handleAudioRedirect(e.target.value)}
            className="w-1/2 bg-[#121212] border border-white/10 rounded-lg p-2.5 uppercase text-white outline-none"
          >
            <option value="sub">Audio: SUB</option>
            <option value="dub">Audio: DUB</option>
          </select>
        </div>

        {episodeChunks.length > 1 && (
          <div
            className="px-3 py-2 bg-[#101010] border-b border-white/5 flex items-center gap-3 overflow-x-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden shrink-0 scrollbar-none"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-[10px] text-[#a1a1a1] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
              <SlidersHorizontal size={11} /> Range:
            </span>
            <div className="flex gap-1.5">
              {episodeChunks.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveChunkIndex(index)}
                  className={`px-3 py-1.5 cursor-pointer rounded-lg text-[11px] font-bold tracking-wide shrink-0 transition-all ${index === activeChunkIndex ? "bg-white text-black" : "bg-white/5 border border-white/5 text-white/60"}`}
                >
                  {index * 100 + 1} -{" "}
                  {Math.min((index + 1) * 100, totalEpisodeList.length)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Playlist List Grid */}
        {/* Scrolling Episode Grid Frame (Render paginated rows only) */}
        <div className="p-4 overflow-y-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden flex flex-col gap-2.5 bg-[#0a0a0a]">
          {paginatedEpisodeList.length === 0 ? (
            <div className="text-center text-white/30 text-[13px] py-12 flex flex-col items-center gap-2">
              <AlertCircle size={20} className="opacity-50" />
              <p>No episodes matched this settings channel.</p>
            </div>
          ) : (
            paginatedEpisodeList.map((ep) => {
              const epSlugToken =
                ep.id?.split("/")?.pop() || ep.number.toString();
              const isSelected = slug === epSlugToken;

              return (
                <Link
                  key={ep.number || ep.id}
                  to={`/watch/${activeProvider}/${id}/${activeAudio}/${epSlugToken}`}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3.5 p-2.5 rounded-xl border transition-all duration-300 ${isSelected ? "bg-(--primary-color) border-(--primary-color) text-white font-bold" : "bg-white/5 border-transparent text-white/80"}`}
                >
                  <div className="w-16 aspect-video rounded-md overflow-hidden bg-neutral-900 relative shrink-0">
                    {ep.image ? (
                      <SmoothImage src={ep.image} alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20">
                        <ImageIcon size={12} />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0 text-[13px] leading-tight">
                    <span className="font-bold">Episode {ep.number}</span>
                    {ep.title && (
                      <span
                        className={`text-[11px] truncate max-w-[180px] mt-0.5 ${isSelected ? "text-white/70" : "text-white/40"}`}
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
    </div>
  );
};
