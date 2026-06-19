import { CarouselRow } from "../../ui/CarouselRow";

function RecentlyAdded() {
  return (
    <CarouselRow
      endpoint="recent"
      title="New This Week"
      seeAllLink="/"
      key="new"
    />
  );
}

export default RecentlyAdded;
