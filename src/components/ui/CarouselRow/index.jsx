import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import ContentCard from "../ContentCard";

// Replace this with your actual Cloudflare Worker URL
const PROXY_API_URL = import.meta.env.VITE_PROXY_API_URL;

export const CarouselRow = ({ title, endpoint, seeAllLink = "/", overrideData = null }) => {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Grab both the viewport ref and the emblaApi instance
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    dragFree: true,
  });

  // Navigation button disabled state trackers
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  // 2. Click handler callback methods
  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi],
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi],
  );

  // Track scroll position changes to enable/disable button states
  const onSelect = useCallback((emblaApi) => {
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  // 3. Connect Embla event listeners when API returns data successfully
  useEffect(() => {
    if (!emblaApi) return;

    onSelect(emblaApi);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect, animeList]);

  useEffect(() => {
     if (overrideData) {
       setAnimeList(overrideData);
       setLoading(false);
       setError(null);
       return; // Skip endpoint fetching entirely if data is already passed as a prop!
     }

    const fetchRowData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Dynamic endpoint routing path configuration
        const response = await fetch(`${PROXY_API_URL}/${endpoint}`);
        if (!response.ok) setError(`Failed to load data for: ${title}`);
        const data = await response.json();

        const rawResults = data.results || data || [];

        // 1. Filter out items that contain "Hentai" in their genres array
        const filteredResults = rawResults.filter((item) => {
          // If the anime has no genres array, keep it by default (or adjust if needed)
          if (!item.genres || !Array.isArray(item.genres)) return true;

          // Keep the anime ONLY if "Hentai" is NOT present in its genres
          return !item.genres.includes("Hentai");
        });

        // 2. Map over the SAFE filtered items instead of rawResults
        const formattedData = filteredResults.map((item) => ({
          id: item.id,
          to: `/anime/${item.id}`,
          poster: item.coverImage?.extraLarge || item.coverImage?.large,
          title:
            item.title?.english || item.title?.romaji || item.title?.native,
          score: item.averageScore
            ? (item.averageScore / 10).toFixed(1)
            : "0.0",
          genres: item.genres ? item.genres.slice(0, 2).join(", ") : "Anime",
        }));

        setAnimeList(formattedData);
      } catch (err) {
        console.error(err);
        setError(`Failed to load data for: ${title}`);
      } finally {
        setLoading(false);
      }
    };

    fetchRowData();
  }, [endpoint, title, overrideData]); // Re-fetch smoothly if endpoint ever changes dynamically

  return (
    <div className="carousel-row py-7 md:py-5 lg:py-7 xl:py-10 bg-(--neutral-color) w-full overflow-hidden">
      {/* Dynamic Header Block Layer */}
      <div className="max-w-7xl mx-auto px-4 mb-4">
        <div className="header flex justify-between items-center">
          <h2 className="text-[20px] md:text-[24px] font-bold text-white">{title}</h2>

          {/* Action Group: Holds your original 'See All' Link and the new arrow controls */}
          <div className="flex items-center gap-4">
            <Link
              to={seeAllLink}
              className="text-(--brand-color) flex gap-2 items-center text-[14px] font-[Inter] hover:underline whitespace-nowrap"
            >
              See All <ArrowRight size={14} />
            </Link>

            {/* Desktop Navigation Arrows (Hidden on mobile view via hidden md:flex) */}
            <div className="hidden md:flex items-center gap-1.5 border-l border-white/10 pl-4">
              <button
                type="button"
                onClick={scrollPrev}
                disabled={prevBtnDisabled}
                className={`p-1.5 rounded-md border cursor-pointer transition-all ${
                  prevBtnDisabled
                    ? "border-white/5 text-white/20 cursor-not-allowed"
                    : "border-white/10 text-white/80 hover:bg-white/5 hover:text-white"
                }`}
                aria-label="Scroll left"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                type="button"
                onClick={scrollNext}
                disabled={nextBtnDisabled}
                className={`p-1.5 rounded-md border cursor-pointer transition-all ${
                  nextBtnDisabled
                    ? "border-white/5 text-white/20 cursor-not-allowed"
                    : "border-white/10 text-white/80 hover:bg-white/5 hover:text-white"
                }`}
                aria-label="Scroll right"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="w-full pl-[max(1rem,calc((100vw-80rem)/2))] mb-2">
          <p className="text-(--brand-color) font-[Inter]">{error}</p>
        </div>
      )}

      {/* Full Width Embla Sliding Track Viewport Container */}
      <div
        className="w-full overflow-hidden cursor-grab active:cursor-grabbing pl-[max(1rem,calc((100vw-80rem)/2))] pr-4 py-2"
        ref={emblaRef}
      >
        <div className="flex backface-hidden touch-pan-y gap-4">
          {loading
            ? // Skeleton Loading Framework Track State
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="flex-[0_0_144px] md:flex-[0_0_230px] min-w-[144px] md:min-w-[230px] animate-pulse flex flex-col gap-2"
                >
                  <div className="w-[144px] md:w-[230px] h-[216px] md:h-[345px] bg-white/5 rounded-xl" />
                  <div className="h-4 bg-white/10 rounded w-[80%] mt-1" />
                  <div className="h-3 bg-white/5 rounded w-[50%]" />
                </div>
              ))
            : // Render Dynamic Mapping Content
              animeList.map((anime) => (
                <div
                  key={anime.id}
                  className="flex-[0_0_144px] md:flex-[0_0_230px] min-w-[144px] md:min-w-[230px]"
                >
                  <ContentCard
                    to={anime.to}
                    poster={anime.poster}
                    title={anime.title}
                    score={anime.score}
                    genres={anime.genres}
                  />
                </div>
              ))}
        </div>
      </div>
    </div>
  );
};
