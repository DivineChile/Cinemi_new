import { Search, Settings } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

import streamIcon from "../../images/icons/streamIcon.svg";
import profileIcon from "../../images/icons/profileIcon.svg";

const NavLinks = [
  { label: "Home", to: "/" },
  { label: "Discover", to: "/discover" },
  { label: "Library", to: "/library" },
];

function Navbar({ setIsSearchOpen, isScrolled }) {
  const location = useLocation();

  // 🌟 SMART HIDEOVER STATE CONTROL SYSTEM (Runs globally on all device dimensions)
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollDistance = useRef(0);

  useEffect(() => {
    const handleScrollDirection = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;

      // Force absolute visibility state when resting back at the very top of the window
      if (currentScrollY <= 10) {
        setIsVisible(true);
        scrollDistance.current = 0;
        lastScrollY.current = currentScrollY;
        return;
      }

      // If scroll direction changes layout vectors, flush the accumulated accumulator distance
      if (
        (delta > 0 && scrollDistance.current < 0) ||
        (delta < 0 && scrollDistance.current > 0)
      ) {
        scrollDistance.current = 0;
      }

      scrollDistance.current += delta;

      // 1. DIRECTION SCROLL DOWN: Slide up and hide if consecutively dragged downwards past 80px
      if (scrollDistance.current > 80 && isVisible) {
        setIsVisible(false);
      }

      // 2. DIRECTION SCROLL UP: Immediately pop back down when pulled up by a mere 15px
      if (scrollDistance.current < -15 && !isVisible) {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScrollDirection, { passive: true });
    return () => window.removeEventListener("scroll", handleScrollDirection);
  }, [isVisible]);

  if (location.pathname.includes("watch")) return null;

  // 🌟 FORMULATE PLACEMENT Y-AXIS: Dynamic positions tracking state mutations smoothly
  const getTopPositionClass = () => {
    if (!isVisible) return "-translate-y-[125%] top-0"; // Fully hidden off-screen layout block
    if (isScrolled) return "top-4 translate-y-0"; // Floating pill capsule wrapper view
    return "top-0 translate-y-0"; // Standard baseline top placement view
  };

  return (
    <header
      className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] select-none ${getTopPositionClass()} ${
        isScrolled
          ? "w-[calc(100%-2rem)] max-w-7xl bg-black/40 backdrop-blur-md rounded-full border border-white/10 shadow-2xl px-4"
          : "w-full bg-transparent px-0"
      }`}
    >
      <div
        className={`mx-auto transition-all duration-500 ${isScrolled ? "w-full" : "max-w-7xl px-4"}`}
      >
        <div
          className={`flex justify-between items-center transition-all duration-500 ${isScrolled ? "h-[54px]" : "h-[64px]"}`}
        >
          <Link to="/" className="flex gap-2 items-center">
            <img src={streamIcon} className="h-[17px] w-[21px] md:hidden" />
            <h1 className="text-(--brand-color) text-[22px] md:text-[24px] font-bold tracking-wider leading-tight">
              CINEMI
            </h1>
          </Link>

          <div className="nav-links flex gap-6 md:gap-8 items-center">
            {NavLinks.map((link, i) => (
              <NavLink
                key={i}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `py-2 text-[14px] hidden lg:block transition-all duration-300 font-[Inter] tracking-wide ${
                    isActive
                      ? "text-(--brand-color) font-semibold relative after:content-[''] after:absolute after:bottom-[-2px] after:left-1/2 after:-translate-x-1/2 after:w-4 after:h-[2px] after:bg-(--brand-color) after:rounded-full"
                      : "text-white/70 hover:text-(--brand-color)"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            <button
              onClick={() => setIsSearchOpen(true)}
              className="cursor-pointer p-1 rounded-full hover:bg-white/5 transition-colors"
            >
              <Search
                height="18px"
                width="18px"
                className="text-white md:hidden"
              />
              <Search
                height="18px"
                width="18px"
                className="text-(--brand-color) hidden md:block transition-transform duration-300 hover:scale-110"
              />
            </button>

            <NavLink to="/">
              <img
                src={profileIcon}
                className="profileIcon h-[30px] w-[30px] hidden md:block rounded-full border border-white/10"
                alt="Profile"
              />
              <Settings
                height="19px"
                width="19px"
                className="md:hidden text-white/80 hover:text-white"
              />
            </NavLink>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
