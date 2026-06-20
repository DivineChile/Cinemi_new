import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Instantly snaps scroll height matrix positions back to the top left margin grid edge
    window.scrollTo(0, 0);
  }, [pathname]); // Runs instantly every single time the site's URL parameter changes

  return null; // This component handles operations entirely behind the scenes without markup
};
