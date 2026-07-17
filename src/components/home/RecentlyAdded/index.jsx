import { CarouselRow } from "../../ui/CarouselRow";
import { useHomeFeed } from "../../../hooks/useHomeFeed";
import { toRowCard } from "../../../api";

function RecentlyAdded() {
  // Backend has no anime "browse/filter" endpoint; the home feed's `recent`
  // bucket is the equivalent recently-released rail.
  const { recent, loading } = useHomeFeed();

  return (
    <CarouselRow
      title="New This Week"
      seeAllLink="/discover"
      overrideData={recent.map(toRowCard)}
      loading={loading}
    />
  );
}

export default RecentlyAdded;
