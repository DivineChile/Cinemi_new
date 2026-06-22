import { Bookmark, Activity, CheckCircle2, Clock } from "lucide-react";

export default function LibraryStats({ stats }) {
  // Safe default fallback if props data object map fails to initialize
  const data = stats || {
    totalSaved: 0,
    watchingCount: 0,
    completedCount: 0,
    totalHours: "0.0",
  };

  return (
    <div className="w-full bg-(--neutral-color) border-b border-white/5 py-8 select-none font-[Inter]">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric Card 1: Total Saved Records */}
        <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center gap-3 shadow-sm hover:border-white/10 transition-colors">
          <div className="p-2.5 rounded-lg bg-(--primary-color)/10 text-(--brand-color) shrink-0">
            <Bookmark size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[20px] font-black font-mono leading-none text-white">
              {data.totalSaved}
            </p>
            <p className="text-[12px] text-[#a1a1a1] font-medium mt-1 truncate">
              Saved Titles
            </p>
          </div>
        </div>

        {/* Metric Card 2: Shows Currently In-Progress */}
        <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center gap-3 shadow-sm hover:border-white/10 transition-colors">
          <div className="p-2.5 rounded-lg bg-green-500/10 text-green-400 shrink-0">
            <Activity size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[20px] font-black font-mono leading-none text-white">
              {data.watchingCount}
            </p>
            <p className="text-[12px] text-[#a1a1a1] font-medium mt-1 truncate">
              Currently Watching
            </p>
          </div>
        </div>

        {/* Metric Card 3: Completed Series Archive */}
        <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center gap-3 shadow-sm hover:border-white/10 transition-colors">
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
            <CheckCircle2 size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[20px] font-black font-mono leading-none text-white">
              {data.completedCount}
            </p>
            <p className="text-[12px] text-[#a1a1a1] font-medium mt-1 truncate">
              Completed
            </p>
          </div>
        </div>

        {/* Metric Card 4: Accumulated Media Stream Distance */}
        <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center gap-3 shadow-sm hover:border-white/10 transition-colors">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
            <Clock size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[20px] font-black font-mono leading-none text-white">
              {data.totalHours}h
            </p>
            <p className="text-[12px] text-[#a1a1a1] font-medium mt-1 truncate">
              Time Streamed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
