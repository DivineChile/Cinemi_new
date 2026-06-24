import { useEffect } from "react";

export const useDocumentTitle = (title) => {
  useEffect(() => {
    // Appends your platform name 'Cinemi' as a professional branding suffix
    document.title = title
      ? `${title} | Cinemi`
      : "Cinemi | Stream Anime at the Edge";
  }, [title]);
};
