import { useEffect, useState } from "react";
import { Outlet, NavLink, Link, useLocation } from "react-router-dom";

import { CircleUser, Compass, BookMarked, Home } from "lucide-react";
import { BackToTop } from "../ui/BackToTop";
import { ScrollToTop } from "../ui/ScrollToTop";
import { SearchModal } from "../ui/SearchModal";
import Navbar from "../Navbar";
import Footer from "../Footer";

function RootLayout() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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

  const currentYear = new Date().getFullYear();
  return (
    <div className="wrapper">
      <ScrollToTop />
      <Navbar setIsSearchOpen={setIsSearchOpen} isScrolled={isScrolled} />

      <main className="page-body">
        <Outlet />
      </main>

      <Footer currentYear={currentYear} />

      <SearchModal isOpen={isSearchOpen} setIsOpen={setIsSearchOpen} />
      <BackToTop />
    </div>
  );
}

export default RootLayout;
