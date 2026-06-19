import Hero from "../../components/home/Hero";
import RecentlyAdded from "../../components/home/RecentlyAdded";
import Recommendations from "../../components/home/Recommendations";
import Trending from "../../components/home/Trending";
import Watching from "../../components/home/Watching";

function Home() {
  return (
    <div className="">
      <Hero />
      <Watching />
      <Trending />
      <RecentlyAdded />
      <Recommendations />
    </div>
  );
}

export default Home;
