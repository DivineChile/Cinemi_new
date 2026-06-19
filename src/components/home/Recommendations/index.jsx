import { CarouselRow } from "../../ui/CarouselRow";

function Recommendations() {
  const id = null;

  return (
    <CarouselRow
      endpoint={`anime/${id}/recommendations`}
      title="Recommended For You"
      seeAllLink="/"
      key="recommended"
    />
  );
}

export default Recommendations;
