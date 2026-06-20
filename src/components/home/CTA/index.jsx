import { MonitorSmartphone, Sparkles, History, Bookmark } from "lucide-react";
import { Link } from "react-router-dom";

function CTA() {
  const items = [
    {
      icon: MonitorSmartphone,
      label: "Continue watching across devices",
    },
    {
      icon: Bookmark,
      label: "Save anime to your watchlist",
    },
    {
      icon: Sparkles,
      label: "Get personalized recommendations",
    },
    {
      icon: History,
      label: "Track your viewing history",
    },
  ];
  return (
    <div className="pt-9 pb-28 md:pb-7 md:py-7 lg:py-10 xl:py-20 bg-(--neutral-color) w-full">
      <div className="max-w-7xl mx-auto px-4">
        <div className="cta-inner flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-0 px-9 xl:px-10 py-9 xl:py-10 rounded-4xl border border-[#ffffff]/5 md:border-[#5b403f]/10 inset-0 w-full bg-[#151515] md:bg-[linear-gradient(to_right,transparent,#151515,rgba(177,18,38,0.1))]">
          <div className="left-area text-left md:text-center lg:text-left flex flex-col gap-5 w-full lg:w-[70%]">
            <div className="head flex flex-col gap-2">
              <h1 className="text-[32px] text-white font-semibold font-[Inter] leading-snug">
                Unlock the Full{" "}
                <span className="text-(--brand-color)">Cinemi</span> Experience
              </h1>
              <p className="text-[16px] hidden md:block font-[Inter] text-[#a1a1a1]">
                Create a free account to personalize your anime journey and keep
                track of everything you watch.
              </p>
            </div>

            <div className="perks grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-3 w-full">
              {items.map((item, i) => {
                const Icon = item.icon;

                return (
                  <p
                    key={i}
                    className="flex gap-3 md:gap-2 items-center justify-start md:justify-center lg:justify-start"
                  >
                    <Icon className="text-(--brand-color) h-[20px] w-[20px] md:h-[18px] md:w-[18px]" />
                    <span className="text-[15px] text-[#a1a1a1] md:text-white sm:text-[14px] font-normal md:font-semibold font-[Inter]">
                      {item.label}
                    </span>
                  </p>
                );
              })}
            </div>
          </div>
          <div className="right-area flex flex-col gap-3 w-full lg:w-[25%]">
            <Link
              to="/register"
              className="w-full justify-center text-center items-center bg-(--primary-color) font-[Inter] text-[16px] md:text-[14px] py-5 sm:py-3 px-6 rounded-lg"
            >
              Create Account
            </Link>
            <Link
              to="/login"
              className="w-full justify-center text-center items-center bg-white/5 hover:bg-white/10 transition-colors duration-300 border border-white/20 font-[Inter] text-[16px] md:text-[14px] py-5 sm:py-3 px-6 rounded-lg"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CTA;
