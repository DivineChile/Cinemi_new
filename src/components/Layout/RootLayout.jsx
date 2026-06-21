import { useEffect, useState } from "react";
import { Outlet, NavLink, Link, useLocation } from "react-router-dom";

import profileIcon from "../../images/icons/profileIcon.svg";
import streamIcon from "../../images/icons/streamIcon.svg";

import {
  Search,
  CircleUser,
  Compass,
  BookMarked,
  Settings,
  Home,
} from "lucide-react";
import { BackToTop } from "../ui/BackToTop";
import { ScrollToTop } from "../ui/ScrollToTop";

function RootLayout() {
  const [isScrolled, setIsScrolled] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const NavLinks = [
    {
      label: "Home",
      to: "/",
    },
    {
      label: "Discover",
      to: "/discover",
    },
    {
      label: "Library",
      to: "/library",
    },
  ];

  const FooterLinks = [
    {
      label: "About",
      to: "/",
    },
    {
      label: "Privacy Policy",
      to: "/",
    },
    {
      label: "Terms of Service",
      to: "/",
    },
    {
      label: "DMCA",
      to: "/",
    },
  ];

  const mobileNavLinks = [
    {
      icon: Home,
      activeState: Home,
      label: "Home",
      to: "/",
    },
    {
      icon: Compass,
      activeState: Compass,
      label: "Discover",
      to: "/discover",
    },
    {
      icon: BookMarked,
      activeState: BookMarked,
      label: "Library",
      to: "/library",
    },
    {
      icon: CircleUser,
      activeState: CircleUser,
      label: "Profile",
      to: "/profile",
    },
  ];

  const currentYear = new Date().getFullYear();
  return (
    <div className="wrapper">
      <ScrollToTop />
      <header
        className={`fixed top-0 ${location.pathname.includes("watch") ? "hidden" : "block"} left-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-[#0a0a0a] shadow-md border-b border-transparent" : "bg-transparent"}`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="navbar-inner flex justify-between items-center h-[64px]">
            <Link to="/" className="flex gap-2 items-center">
              <img src={streamIcon} className="h-[17px] w-[21px] md:hidden" />
              <h1 className="text-(--brand-color) text-[24px] font-semibold leading-tight">
                CINEMI
              </h1>
            </Link>

            <div className="nav-links flex gap-8 items-center">
              {NavLinks.map((link, i) => {
                return (
                  <NavLink
                    key={i}
                    to={link.to}
                    end={link.to == "/" ? true : false}
                    className={({ isActive }) =>
                      `py-2 text-[14px] hidden md:block transition-colors font-[Inter] ${isActive ? "text-(--brand-color) font-semibold relative after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-full after:h-[2px] after:bg-(--brand-color) after:rounded-md" : "text-(#e3be3c) hover:text-(--brand-color)"}`
                    }
                  >
                    {link.label}
                  </NavLink>
                );
              })}
              <NavLink to="/search">
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
              </NavLink>
              <NavLink to="/profile">
                <img
                  src={profileIcon}
                  className="profileIcon h-[32px] w-[32px] hidden md:block"
                  alt="Profile"
                />
                <Settings height="20px" width="21px" className="md:hidden" />
              </NavLink>
            </div>
          </div>
        </div>
      </header>

      <main className="page-body">
        <Outlet />
      </main>

      <div className="foot">
        <footer
          className={`footer py-[40px] hidden ${location.pathname.includes("watch") ? "hidden" : "block"} lg:block border border-white/5 bg-(--neutral-color)`}
        >
          <div className="max-w-7xl mx-auto px-4">
            <div className="footer-inner flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="left-side">
                <Link to="/">
                  <h1 className="text-[20px] text-white leading-snug text-center md:text-left">
                    CINEMI
                  </h1>
                </Link>
                <p className="text-[14px] hidden md:block text-[#a1a1a1] font-[Inter]">
                  Stream your favorite anime.
                </p>
              </div>

              <div className="center flex items-center gap-4 md:gap-5">
                {FooterLinks.map((link, i) => {
                  return (
                    <NavLink
                      key={i}
                      className="footer-link text-[14px] font-[Inter] text-[#a1a1a1] hover:underline"
                      to={link.to}
                    >
                      {link.label}
                    </NavLink>
                  );
                })}
              </div>

              <div className="right-side">
                <p className="text-[14px] text-[#a1a1a1] font-[Inter]">
                  &copy; {currentYear} Cinemi.
                </p>
              </div>
            </div>
          </div>
        </footer>

        <div className="bottom-mobile-nav lg:hidden border border-white/5 flex justify-between py-4 px-4 fixed z-20 bottom-0 w-full items-center bg-[#1c1b1b]">
          {mobileNavLinks.map((link, i) => {
            const isActive = location.pathname === link.to;

            const IconComponent = isActive ? link.activeState : link.icon;
            return (
              <NavLink
                key={i}
                to={link.to}
                end={link.to == "/" ? true : false}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 text-[14px] transition-all font-[Inter] ${isActive ? "text-(--brand-color) font-medium" : "text-[#a1a1a1] hover:text-(--brand-color)"}`
                }
              >
                <IconComponent
                  height="20px"
                  width="20px"
                  className={isActive ? "scale-130" : "text-(#a1a1a1)"}
                />
                {link.label}
              </NavLink>
            );
          })}
        </div>
      </div>
      <BackToTop />
    </div>
  );
}

export default RootLayout;
