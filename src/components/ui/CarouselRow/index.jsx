import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import ContentCard from "../ContentCard";

// Replace this with your actual Cloudflare Worker URL
const PROXY_API_URL = "https://gentle-block-5322.divinechile16.workers.dev";

export const CarouselRow = ({ title, endpoint, seeAllLink = "/" }) => {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize Embla Carousel with smooth momentum dragging
  const [emblaRef] = useEmblaCarousel({
    loop: false,
    align: "start",
    dragFree: true,
  });

  useEffect(() => {
    const fetchRowData = async () => {
      try {
        setLoading(true);
        // Dynamic endpoint routing path configuration
        const response = await fetch(`${PROXY_API_URL}/${endpoint}`);
        if (!response.ok) setError(`Failed to load data for: ${title}`);
        const data = await response.json();

        const rawResults = data.results || data || [];
        const formattedData = rawResults.map((item) => ({
          id: item.id,
          to: `/info/${item.id}`,
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
  }, [endpoint, title]); // Re-fetch smoothly if endpoint ever changes dynamically

  return (
    <div className="carousel-row py-10 bg-(--neutral-color) w-full overflow-hidden">
      {/* Dynamic Header Block Layer */}
      <div className="max-w-7xl mx-auto px-4 mb-4">
        <div className="header flex justify-between items-center">
          <h2 className="text-[24px] font-bold text-white">{title}</h2>
          <Link
            to={seeAllLink}
            className="text-(--brand-color) flex gap-2 items-center text-[14px] font-[Inter]"
          >
            See All <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {error && (
        <div className="w-full pl-[max(1rem,calc((100vw-80rem)/2))]">
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
                  className="flex-[0_0_230px] min-w-[230px] animate-pulse flex flex-col gap-2"
                >
                  <div className="w-[230px] h-[345px] bg-white/5 rounded-xl" />
                  <div className="h-4 bg-white/10 rounded w-[80%] mt-1" />
                  <div className="h-3 bg-white/5 rounded w-[50%]" />
                </div>
              ))
            : // Render Dynamic Mapping Content
              animeList.map((anime) => (
                <div key={anime.id} className="flex-[0_0_230px] min-w-[230px]">
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
