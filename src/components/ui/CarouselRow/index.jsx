import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import ContentCard from "../ContentCard";

export const CarouselRow = ({
  title,
  seeAllLink = "/",
  overrideData = null,
  loading = false,
}) => {
  // Data is supplied by the caller already shaped for ContentCard — render it
  // straight from props (no mirrored state; a new array reference per render
  // would loop a setState effect infinitely).
  const animeList = Array.isArray(overrideData) ? overrideData : [];
  const error = null;

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
  }, [emblaApi, onSelect, animeList.length]);

  return (
    <div className="carousel-row py-7 md:py-5 lg:py-7 xl:py-10 bg-(--neutral-color) w-full overflow-hidden">
      {/* Dynamic Header Block Layer */}
      <div className="max-w-7xl mx-auto px-4 mb-4">
        <div className="header flex justify-between items-center">
          <h2 className="text-[20px] md:text-[24px] font-bold text-white">
            {title}
          </h2>

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
                  <div className="w-full aspect-[2/3] bg-white/5 rounded-xl" />
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
                    mobileHref={anime.mobileHref}
                    desktopHref={anime.desktopHref}
                    poster={anime.poster}
                    title={anime.title}
                    score={anime.score}
                    seasonYear={anime.seasonYear}
                    animeFormat={anime.animeFormat}
                  />
                </div>
              ))}
        </div>
      </div>
    </div>
  );
};
