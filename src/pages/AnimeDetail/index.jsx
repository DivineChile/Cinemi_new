import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

import Hero from "../../components/animeDetail/Hero";
import MetaInfo from "../../components/animeDetail/MetaInfo";
import { AnimeEpisodes } from "../../components/animeDetail/AnimeEpisodes";

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

        console.log(data);
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
  return (
    <div className="bg-(--neutral-color) min-h-screen">
      <Hero loading={loading} error={error} anime={animeData} />
      <MetaInfo loading={loading} error={error} rawApiData={animeData} />
      <AnimeEpisodes />
    </div>
  );
}

export default AnimeDetail;
