import { CarouselRow } from "../../ui/CarouselRow";
import { useHomeFeed } from "../../../hooks/useHomeFeed";
import { toRowCard } from "../../../api";

function Trending() {
  const { trending, loading } = useHomeFeed();

  return (
    <CarouselRow
      title="Trending Now"
      seeAllLink="/discover"
      overrideData={trending.map(toRowCard)}
      loading={loading}
    />
  );
}

export default Trending;
