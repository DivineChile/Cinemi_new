import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { useLocation } from "react-router-dom";

export const BackToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={`fixed ${location.pathname.includes('watch') ? "hidden" : "block"} cursor-pointer right-6 z-50 p-3 bg-(--primary-color) hover:bg-[#b11226] text-white rounded-full shadow-xl transition-all duration-300 border border-white/10 transform active:scale-95 ${
        isVisible
          ? "translate-y-0 opacity-100 pointer-events-auto"
          : "translate-y-4 opacity-0 pointer-events-none"
      }`}
      aria-label="Scroll to top of the page"
    >
      <ArrowUp size={20} strokeWidth={2.5} />
    </button>
  );
};
