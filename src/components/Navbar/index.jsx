import { Search, Settings } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";

import streamIcon from "../../images/icons/streamIcon.svg";
import profileIcon from "../../images/icons/profileIcon.svg";

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

function Navbar({ setIsSearchOpen, isScrolled }) {
  const location = useLocation();
  return (
    <header
      className={`fixed top-0 ${location.pathname.includes("watch") ? "hidden" : "block"} left-0 w-full z-50 transition-all duration-300 ${isScrolled ? "bg-[#0a0a0a] shadow-md border-b border-b-white/5" : "bg-transparent"}`}
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
            <button
              onClick={() => setIsSearchOpen(true)}
              className="cursor-pointer"
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
  );
}

export default Navbar;
