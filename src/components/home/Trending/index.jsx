import { CarouselRow } from "../../ui/CarouselRow";

function Trending() {
  return (
    <CarouselRow
      endpoint="trending"
      title="Trending Now"
      seeAllLink="/"
      key="trending"
    />
  );
}

export default Trending;
