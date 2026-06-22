import CTA from "../../components/home/CTA";
import GenreExploration from "../../components/home/GenreExploration";
import Hero from "../../components/home/Hero";
import RecentlyAdded from "../../components/home/RecentlyAdded";
import Recommendations from "../../components/home/Recommendations";
import Trending from "../../components/home/Trending";
import { Watching } from "../../components/home/Watching";

function Home() {
  return (
    <div className="">
      <Hero />
      <Watching />
      <Trending />
      <RecentlyAdded />
      {/* <Recommendations /> */}
      <GenreExploration />
      <CTA />
    </div>
  );
}

export default Home;
