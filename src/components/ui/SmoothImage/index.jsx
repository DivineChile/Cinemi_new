import { useState } from "react";

export const SmoothImage = ({ src, alt, className, loading = "lazy" }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div
      className={`relative w-full h-full bg-white/5 overflow-hidden transition-colors duration-300 ${!isLoaded ? "animate-pulse" : ""}`}
    >
      <img
        src={src}
        alt={alt}
        loading={loading}
        onLoad={() => setIsLoaded(true)}
        className={`w-full h-full object-cover transition-all duration-700 ease-out ${
          isLoaded
            ? "opacity-100 scale-100 blur-0"
            : "opacity-0 scale-98 blur-sm"
        } ${className || ""}`}
      />
    </div>
  );
};
