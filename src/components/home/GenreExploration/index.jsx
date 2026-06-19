import GenreCard from "../../ui/GenreCard";

const TOP_ANIME_GENRES = [
  {
    id: "g-action",
    title: "Action",
    poster:
      "https://s4.anilist.co/file/anilistcdn/media/anime/banner/21-wf37VakJmZqs.jpg",
  },
  {
    id: "g-romance",
    title: "Romance",
    poster:
      "https://s4.anilist.co/file/anilistcdn/media/anime/banner/186497-naXtQFMHJaR1.jpg",
  },
  {
    id: "g-comedy",
    title: "Comedy",
    poster:
      "https://s4.anilist.co/file/anilistcdn/media/anime/banner/192808-iaS1GnOo5l3G.jpg",
  },
  {
    id: "g-drama",
    title: "Drama",
    poster:
      "https://s4.anilist.co/file/anilistcdn/media/anime/banner/180745-Iicz1F6Kuj4e.jpg",
  },
  {
    id: "g-fantasy",
    title: "Fantasy",
    poster:
      "https://s4.anilist.co/file/anilistcdn/media/anime/banner/182483-Nzix9ntq3CVj.jpg",
  },
  {
    id: "g-scifi",
    title: "Sci-Fi",
    poster:
      "https://s4.anilist.co/file/anilistcdn/media/anime/banner/199221-b3W0FfJd4zMy.jpg",
  },
  {
    id: "g-adventure",
    title: "Adventure",
    poster:
      "https://s4.anilist.co/file/anilistcdn/media/anime/banner/147105-fTjmRrILFixZ.jpg",
  },
  {
    id: "g-mystery",
    title: "Mystery",
    poster:
      "https://s4.anilist.co/file/anilistcdn/media/anime/banner/16498-8jpFCOcDmneX.jpg",
  },
  {
    id: "g-sports",
    title: "Sports",
    poster:
      "https://s4.anilist.co/file/anilistcdn/media/anime/banner/20464-PpYjO9cPN1gs.jpg",
  },
  {
    id: "g-sliceoflife",
    title: "Slice of Life",
    poster:
      "https://s4.anilist.co/file/anilistcdn/media/anime/banner/170019-r07RiVV5d8rT.jpg",
  },
  {
    id: "g-supernatural",
    title: "Supernatural",
    poster:
      "https://s4.anilist.co/file/anilistcdn/media/anime/banner/269-08ar2HJOUAuL.jpg",
  },
  {
    id: "g-historical",
    title: "Historical",
    poster: "https://unsplash.com",
  },
];

function GenreExploration() {
  return (
    <div className="genres-section py-3 md:py-5 lg:py-7 xl:py-10 bg-(--neutral-color) w-full">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-[24px] font-bold text-white mb-6">
          Genre Exploration
        </h2>

        {/* Changed gap to gap-3 on mobile to maximize space, and removed justify-items-center */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:gap-4">
          {TOP_ANIME_GENRES.map((genre) => (
            <GenreCard
              key={genre.id}
              to={`/filter?genre=${genre.title}`}
              poster={genre.poster}
              title={genre.title}
              id={genre.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default GenreExploration;
