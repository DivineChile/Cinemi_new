import "./style.css";
import trendingIcon from "../../../images/icons/trendingIon.svg";
import starIcon from "../../../images/icons/starIcon.svg";
import playIcon from "../../../images/icons/playIcon.svg";
import detailsIcon from "../../../images/icons/detailsIcon.svg";
import { Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

function Hero() {
  // 1. Initialize Embla Carousel with Autoplay (4 second delay)
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000, stopOnInteraction: false }),
  ]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const PROXY_API_URL = import.meta.env.VITE_PROXY_API_URL;

  const onSelect = useCallback((emblaApi) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    const fetchSpotlight = async () => {
      try {
        const response = await fetch(`${PROXY_API_URL}/spotlight`);
        if (!response.ok) {
          setError(`API request failed with status ${response.status}`);
        }
        const data = await response.json();

        // Target the results array, slice the first 10, and structure them
        const rawResults = data.results || data || []; // Fallback depending on your root object mapping
        const formattedSlides = rawResults.slice(0, 10).map((item, index) => ({
          id: item.id,
          title: item.title.english || item.title.romaji || item.title.native,
          bgImage: item.bannerImage || item.coverImage.extraLarge, // Use banner, fallback to cover art
          trending: `Trending #${index + 1}`,
          rating: item.averageScore
            ? (item.averageScore / 10).toFixed(1)
            : "0.0", // Turns 89 into 8.9
          year: item.seasonYear || item.startDate?.year || "N/A",
          episodes: item.episodes ? `${item.episodes} Eps` : "TBA",
          genre: item.genres?.[0] || "Anime", // Grabs the primary genre tags safely
          // Fallback description since spotlight endpoints sometimes skip it or name it differently
          description:
            item.description ||
            `Experience the spectacular continuation of ${item.title.romaji || "this epic journey"}.`,
        }));

        setSlides(formattedSlides);
      } catch (err) {
        console.error("Failed to load live hero spots:", err);
        setError("Failed to load spotlight content. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSpotlight();
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    onSelect(emblaApi);
  }, [emblaApi, onSelect]);

  // Loading skeleton state wrapper
  if (loading) {
    return (
      <div className="hero-skeleton w-full h-[100vh] bg-[#0a0a0a] relative overflow-hidden flex items-center">
        {/* Mimics the global layout alignment wrapper box bounds */}
        <div className="max-w-7xl mx-auto w-full px-4 relative z-10">
          {/* Core Content Box matching exact width percentages and gaps */}
          <div className="content w-full flex flex-col gap-5 md:w-[70%] lg:w-[60%] animate-pulse">
            {/* 1. Badge Wrapper Tag Slot */}
            <div className="h-6 bg-white/5 border border-white/10 rounded-xl w-28" />

            {/* 2. Hero Header Title Rows (Matches text-size layouts with a multi-row blocks) */}
            <div className="flex flex-col gap-3">
              <div className="h-10 md:h-14 xl:h-[70px] bg-white/10 rounded-md w-[90%]" />
              <div className="h-10 md:h-14 xl:h-[70px] bg-white/10 rounded-md w-[50%]" />
            </div>

            {/* 3. Metadata Inline Layout Line */}
            <div className="metadata flex gap-5 items-center mt-1">
              {/* Rating Block */}
              <div className="h-5 bg-white/5 rounded w-12" />
              <div className="circle h-[4px] w-[4px] bg-white/20 rounded-full" />

              {/* Year Block */}
              <div className="h-5 bg-white/5 rounded w-10" />
              <div className="circle h-[4px] w-[4px] bg-white/20 rounded-full" />

              {/* Episodes Block */}
              <div className="h-5 bg-white/5 rounded w-14" />

              {/* Genre Block (Desktop Adaptive Visibility Matcher) */}
              <div className="hidden md:block circle h-[4px] w-[4px] bg-white/20 rounded-full" />
              <div className="hidden md:block h-7 bg-white/5 border border-white/10 rounded-sm w-20" />
            </div>

            {/* 4. Paragraph Blocks Summary Lines */}
            <div className="flex flex-col gap-2.5 mt-2">
              <div className="h-4 bg-white/5 rounded w-full" />
              <div className="h-4 bg-white/5 rounded w-[95%]" />
              <div className="h-4 bg-white/5 rounded w-[60%]" />
            </div>

            {/* 5. Responsive Button Layout Deck */}
            <div className="buttons flex flex-col sm:flex-row gap-4 items-center mt-3">
              {/* Watch Now Callout Element */}
              <div className="h-[52px] sm:h-[46px] bg-white/10 rounded-sm w-full sm:w-36" />

              {/* Details Informative Module Element */}
              <div className="h-[52px] sm:h-[46px] bg-white/5 border border-white/10 rounded-sm w-full sm:w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="hero h-[100vh] w-full bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white text-xl font-[Inter] px-4 text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="hero h-[100vh] w-full relative overflow-hidden">
      {/* 2. Embla Viewport Frame */}
      <div className="w-full h-full" ref={emblaRef}>
        {/* Embla Flex Container */}
        <div className="flex w-full h-full backface-hidden touch-pan-y">
          {slides.map((slide, index) => (
            // Embla Slide
            <div
              key={slide.id}
              className="flex-[0_0_100%] min-w-0 h-full w-full relative"
            >
              <img
                src={slide.bgImage}
                alt={slide.title}
                // Native Lazy Loading (Eager for slide 1 to prevent layout shift, lazy for others)
                loading={index === 0 ? "eager" : "lazy"}
                className="h-full w-full object-cover transition-all duration-300"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 3. Static Cinematic Overlay Layout (Stays static while images slide underneath) */}
      <div className="inset-0 w-full bg-[linear-gradient(to_left,transparent,#0a0a0a),linear-gradient(to_bottom,transparent,#0a0a0a)] absolute pointer-events-none z-10" />

      {/* 4. Active Slide Content Block */}
      <div className="hero-inner h-full flex flex-col justify-center absolute inset-0 z-20 max-w-7xl mx-auto px-4 pointer-events-none">
        {/* content box re-enables click actions */}
        <div className="content w-full flex flex-col gap-5 md:w-[70%] lg:w-[60%] pointer-events-auto">
          <span className="badge flex items-center gap-2 uppercase font-[Inter] bg-[#b11226]/20 w-fit py-1 px-3 rounded-xl border border-[#b11226]/30">
            <img src={trendingIcon} alt="" />
            <span className="text-[12px] font-semibold text-(--brand-color)">
              {slides[selectedIndex].trending}
            </span>
          </span>

          {/* Dynamic slide transitions key to trigger CSS re-entry animation */}
          <h1
            key={`title-${selectedIndex}`}
            className="text-[40px] md:text-[60px] line-clamp-2 xl:text-[70px] 2xl:text-[84px] font-bold leading-none text-white animate-fade-in"
          >
            {slides[selectedIndex].title}
          </h1>

          <div className="metadata flex gap-5 items-center">
            <span className="rating flex items-center gap-1">
              <img
                src={starIcon}
                className="w-[15px] md:w-[15.83px] h-[14.25px] md:h-[16.67px]"
                alt=""
              />
              <span className="font-[Inter] text-[16px] text-white/90 font-semibold">
                {slides[selectedIndex].rating}
              </span>
            </span>
            <div className="circle h-[4px] w-[4px] bg-white/30 rounded-full" />
            <span className="text-[16px] text-white/90 font-[Inter]">
              {slides[selectedIndex].year}
            </span>
            <div className="circle h-[4px] w-[4px] bg-white/30 rounded-full" />
            <span className="text-[16px] text-white/90 font-[Inter]">
              {slides[selectedIndex].episodes}
            </span>
            <div className="circle h-[4px] w-[4px] hidden md:block bg-white/30 rounded-full" />
            <span className="text-[16px] hidden md:block bg-white/10 border border-white/20 py-1 px-3 rounded-sm text-white/90 font-[Inter]">
              {slides[selectedIndex].genre}
            </span>
          </div>

          <p
            key={`desc-${selectedIndex}`}
            className="text-[#a1a1a1] text-[18px] font-[Inter]"
          >
            {slides[selectedIndex].description}
          </p>

          <div className="buttons flex flex-col sm:flex-row gap-4 items-center">
            <Link
              to={`/watch/${slides[selectedIndex].id}`}
              className="button flex gap-3 w-full sm:w-fit text-[16px] md:text-[14px] justify-center items-center bg-(--primary-color) font-[Inter] text-[14px] uppercase py-4 sm:py-3 px-6 rounded-sm"
            >
              <img
                src={playIcon}
                className="h-[14px] w-[11px]"
                alt="Play Icon"
              />
              Watch Now
            </Link>
            <Link
              to={`/anime/${slides[selectedIndex].id}`} // Dynamic link to anime details page
              className="button flex gap-3 w-full sm:w-fit text-[16px] md:text-[14px] justify-center items-center bg-white/5 hover:bg-white/10 transition-colors duration-300 border border-white/20 font-[Inter] text-[14px] uppercase py-4 sm:py-3 px-6 rounded-sm"
            >
              <img
                src={detailsIcon}
                className="h-[14px] w-[11px]"
                alt="Details Icon"
              />
              Details
            </Link>
          </div>
        </div>

        {/* 5. Custom Dynamic Slide Indicator Dots */}
        <div className="absolute bottom-10 hidden md:flex right-4 z-10 gap-2 pointer-events-auto">
          {scrollSnaps.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => emblaApi?.scrollTo(index)}
              className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${
                index === selectedIndex
                  ? "w-8 bg-[#b11226]"
                  : "w-2 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Hero;
