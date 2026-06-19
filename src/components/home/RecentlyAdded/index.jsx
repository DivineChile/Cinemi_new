import { CarouselRow } from "../../ui/CarouselRow";

function RecentlyAdded() {
  return (
    <CarouselRow
      endpoint="filter?status=RELEASING&sort=POPULARITY_DESC&year=2026"
      title="New This Week"
      seeAllLink="/"
      key="new"
    />
  );
}

export default RecentlyAdded;
