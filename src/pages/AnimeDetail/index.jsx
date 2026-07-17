import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import Hero from "../../components/animeDetail/Hero";
import MetaInfo from "../../components/animeDetail/MetaInfo";
import { AnimeEpisodes } from "../../components/animeDetail/AnimeEpisodes";
import { CarouselRow } from "../../components/ui/CarouselRow";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { getMediaDetail, adaptDetail } from "../../api";

function AnimeDetail() {
  const { animeId } = useParams();
  const [animeData, setAnimeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract clean title string parameter safely
  const pageTitle =
    animeData?.title?.english ||
    animeData?.title?.romaji ||
    "Loading Details...";

  useDocumentTitle(pageTitle);

  useEffect(() => {
    const controller = new AbortController();

    const getAnimeData = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getMediaDetail("anime", animeId, {
          signal: controller.signal,
        });

        setAnimeData(adaptDetail(data));
      } catch (err) {
        if (err?.name === "AbortError") return;
        console.error(err);
        setError("Something went wrong while loading this page.");
      } finally {
        setLoading(false);
      }
    };

    if (animeId) getAnimeData();

    return () => controller.abort();
  }, [animeId]);

  // Relations/recommendations now carry plain string title + poster URL.
  const relatedMediaRaw = animeData?.relations || [];
  const recommendationsRaw = animeData?.recommendations || [];

  return (
    <div className="bg-(--neutral-color) min-h-screen pb-16">
      <Hero loading={loading} error={error} anime={animeData} />
      <MetaInfo loading={loading} error={error} rawApiData={animeData} />
      <AnimeEpisodes
        title={animeData?.title?.english || animeData?.title?.romaji}
      />

      {relatedMediaRaw.length > 0 && (
        <CarouselRow
          key="related"
          title="Related Media"
          seeAllLink="#"
          overrideData={relatedMediaRaw
            .filter(
              (item) =>
                item?.type !== "OTHER" &&
                item?.type !== "SOURCE" &&
                item?.type !== "ALTERNATIVE",
            )
            .map((item) => ({
              id: item.id,
              mobileHref: `/anime/${item.id}`,
              desktopHref: `/watch/${item.id}`,
              poster: item.poster,
              title: item.title,
              score: item.score ? (item.score / 10).toFixed(1) : "0.0",
              seasonYear: item.type || "N/A",
              animeFormat: item.episodes ? `${item.episodes} Eps` : "N/A",
            }))}
        />
      )}

      {/* 🌟 SECTION 2: COMMUNITY RECOMMENDATIONS ("If you liked X, you'll like Y") */}
      {recommendationsRaw.length > 0 && (
        <CarouselRow
          key="recommended"
          title="Recommendations"
          seeAllLink="#"
          overrideData={recommendationsRaw.map((item) => ({
            id: item.id,
            mobileHref: `/anime/${item.id}`,
            desktopHref: `/watch/${item.id}`,
            poster: item.poster,
            title: item.title,
            score: item.score ? (item.score / 10).toFixed(1) : "0.0",
            seasonYear: item.status || "N/A",
            animeFormat: item.episodes ? `${item.episodes} Eps` : "N/A",
          }))}
        />
      )}
    </div>
  );
}

export default AnimeDetail;
