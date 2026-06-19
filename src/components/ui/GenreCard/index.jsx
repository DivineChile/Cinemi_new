import { Link } from "react-router-dom";

function GenreCard({ id, title, to, poster }) {
  return (
    <Link
      to={to}
      className="genre-card group w-full aspect-[3/2] relative rounded-xl overflow-hidden block bg-gray-900"
      key={id}
    >
      <img
        src={poster}
        alt={title}
        className="h-full w-full object-cover transform transition-transform duration-500 ease-out group-hover:scale-110"
      />

      <div className="overlay absolute inset-0 bg-black/40 flex items-center justify-center p-3 text-center transition-colors duration-300 group-hover:bg-black/50">
        <h1 className="text-white font-bold italic text-[20px] lg:text-[24px] xl:text-[32px] font-normal tracking-wide uppercase drop-shadow-md select-none">
          {title}
        </h1>
      </div>
    </Link>
  );
}

export default GenreCard;
