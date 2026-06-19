import WatchCard from "../../ui/WatchCard";

function Watching() {
  return (
    <div className="watching py-5 bg-(--neutral-color)">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-[24px] font-bold text-white mb-3">
          Continue Watching
        </h2>
        <div className="watching-list flex gap-4 overflow-x-auto scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-2">
          {/* Example watching item */}
          <p className="font-[Inter]">
            When you start streaming an episode, it'll appear here.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Watching;
