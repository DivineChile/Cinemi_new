import { useNavigate, Link } from "react-router-dom";
import { Tv, Layers, X, Image as ImageIcon } from "lucide-react";
import { SmoothImage } from "../../ui/SmoothImage";

export const MobilePlaylistDrawer = ({
  isOpen,
  setIsOpen,
  episodeData,
  totalEpisodeList,
  id,
  slug,
  activeProvider,
  activeAudio,
}) => {
  const navigate = useNavigate();

  // Guard clause: Return nothing if the drawer state is closed to keep DOM light
  if (!isOpen) return null;

  const handleSourceRedirect = (newProvider) => {
    navigate(`/watch/${newProvider}/${id}/${activeAudio}/${slug}`);
  };

  const handleAudioRedirect = (newAudio) => {
    navigate(`/watch/${activeProvider}/${id}/${newAudio}/${slug}`);
  };
  return (
    /* 
      Exclusively active on mobile viewports (lg:hidden).
      Fixed layout overlay spans the entire device viewport.
    */
    <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end font-[Inter]">
      {/* 1. TRANSLUCENT BACKDROP MASK PANEL */}
      {/* Clicking this area dismisses the entire drawer overlay safely */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]"
        onClick={() => setIsOpen(false)}
      />

      {/* 2. SLIDING APP-STYLE CONTENT TRAY BOX */}
      {/* Animates up smoothly from the base of the device display */}
      <div className="absolute bottom-0 left-0 right-0 bg-[#0c0c0c] border-t border-white/10 rounded-t-3xl max-h-[70vh] flex flex-col z-50 animate-[slide-up_0.4s_cubic-bezier(0.16,1,0.3,1)]">
        {/* Drawer Drag-Indicator Top Bar Header */}
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
            aria-label="Close drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Selector Filters Row */}
        <div className="p-3 bg-black/40 border-b border-white/5 flex gap-2 text-[12px] shrink-0 font-semibold">
          {/* Provider Select Dropdown Box */}
          <select
            value={activeProvider}
            onChange={(e) => handleSourceRedirect(e.target.value)}
            className="w-1/2 bg-[#121212] border border-white/10 rounded-lg p-2.5 uppercase text-white outline-none"
          >
            {Object.keys(episodeData?.providers || {}).map((pKey) => (
              <option key={pKey} value={pKey}>
                Source: {pKey}
              </option>
            ))}
          </select>

          {/* Sub / Dub Audio Selector Dropdown Box */}
          <select
            value={activeAudio}
            onChange={(e) => handleAudioRedirect(e.target.value)}
            className="w-1/2 bg-[#121212] border border-white/10 rounded-lg p-2.5 uppercase text-white outline-none"
          >
            <option value="sub">Audio: SUB</option>
            <option value="dub">Audio: DUB</option>
          </select>
        </div>

        {/* MOBILE LIST ITEMS MATRIX ROW CONTAINER */}
        <div className="p-4 overflow-y-auto flex flex-col gap-2.5 bg-[#0a0a0a]">
          {totalEpisodeList.length === 0 ? (
            <p className="text-center text-white/30 text-[13px] py-12">
              No media links matched.
            </p>
          ) : (
            totalEpisodeList.map((ep) => {
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
                  onClick={() => setIsOpen(false)} // Auto dismiss the drawer view layer upon episode selection
                  className={`flex items-center gap-3.5 p-2.5 rounded-xl border transition-all ${
                    isSelected
                      ? "bg-(--primary-color) border-(--primary-color) text-white font-bold shadow-lg shadow-[#b11226]/10"
                      : "bg-white/5 border-transparent text-white/80"
                  }`}
                >
                  {/* Aspect-Locked Card Thumbnail Frame */}
                  <div className="w-16 aspect-video rounded-md overflow-hidden bg-neutral-900 relative shrink-0">
                    {ep.image ? (
                      <SmoothImage src={ep.image} alt="" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20">
                        <ImageIcon size={12} />
                      </div>
                    )}
                  </div>

                  {/* Typographic Metadata description lines */}
                  <div className="flex flex-col min-w-0 text-[13px] leading-tight">
                    <span className="font-bold">Episode {ep.number}</span>
                    {ep.title && (
                      <span
                        className={`text-[11px] truncate max-w-[180px] mt-0.5 ${
                          isSelected ? "text-white/70" : "text-white/40"
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
    </div>
  );
};
