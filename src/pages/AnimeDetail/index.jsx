import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import Hero from "../../components/animeDetail/Hero";
import MetaInfo from "../../components/animeDetail/MetaInfo";
import { AnimeEpisodes } from "../../components/animeDetail/AnimeEpisodes";
import { CarouselRow } from "../../components/ui/CarouselRow";

function AnimeDetail() {
  const { animeId } = useParams();
  const [animeData, setAnimeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const PROXY_API_URL = import.meta.env.VITE_PROXY_API_URL;

  useEffect(() => {
    const getAnimeData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${PROXY_API_URL}/info/${animeId}`);
        if (!response.ok) setError("Failed to retrieve anime details");
        const data = await response.json();

        setAnimeData(data);
      } catch (err) {
        console.error(err);
        setError("Something went wrong while loading this page.");
      } finally {
        setLoading(false);
      }
    };

    if (animeId) getAnimeData();
  }, [animeId]);

  const relatedMediaRaw = animeData?.relations?.edges.map((item) => item) || [];
  const recommendationsRaw =
    animeData?.recommendations?.nodes.map(
      (item) => item?.mediaRecommendation,
    ) || [];

  return (
    <div className="bg-(--neutral-color) min-h-screen pb-16">
      <Hero loading={loading} error={error} anime={animeData} />
      <MetaInfo loading={loading} error={error} rawApiData={animeData} />
      <AnimeEpisodes />

      {relatedMediaRaw.length > 0 && (
        <CarouselRow
          title="Related Media"
          seeAllLink="#"
          overrideData={relatedMediaRaw
            .filter(
              (item) =>
                item?.relationType !== "OTHER" &&
                item?.relationType !== "SOURCE" &&
                item?.relationType !== "ALTERNATIVE",
            )
            .map((item) => ({
              id: item?.node?.id,
              to: `/anime/${item?.node.id}`,
              poster:
                item?.node?.coverImage?.extraLarge ||
                item?.node?.coverImage?.large,
              title:
                item?.node?.title?.english ||
                item?.node?.title?.romaji ||
                item?.node?.title?.native,
              score: item?.node?.meanScore
                ? (item?.node?.meanScore / 10).toFixed(1)
                : "0.0",
              // Display the specific relationship format as the card subtitle (e.g., SEQUEL · TV)
              seasonYear: item?.node?.seasonYear || "N/A",
              animeFormat: item?.node?.format || "N/A",
            }))}
        />
      )}

      {/* 🌟 SECTION 2: COMMUNITY RECOMMENDATIONS ("If you liked X, you'll like Y") */}
      {recommendationsRaw.length > 0 && (
        <CarouselRow
          title="Recommendedations"
          seeAllLink="#"
          overrideData={recommendationsRaw.map((item) => ({
            id: item.id,
            to: `/anime/${item.id}`,
            poster: item.coverImage?.extraLarge || item.coverImage?.large,
            title:
              item.title?.english || item.title?.romaji || item.title?.native,
            score: item.averageScore
              ? (item.averageScore / 10).toFixed(1)
              : "0.0",
            seasonYear: item?.seasonYear || "N/A",
            animeFormat: item?.format || "N/A",
          }))}
        />
      )}
    </div>
  );
}

export default AnimeDetail;
