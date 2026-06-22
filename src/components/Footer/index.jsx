import { BookMarked, CircleUser, Compass, Home, } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

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

function Footer({ currentYear }) {
  return (
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
  );
}

export default Footer;
