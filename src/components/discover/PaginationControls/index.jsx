import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function PaginationControls ({ currentPage = 1, hasNextPage = false, onPageChange }) {
  return (
    <div className="pagination-controls-wrapper mb-10 w-full flex items-center justify-center gap-4 mt-8 pt-4 border-t border-white/5 font-[Inter] select-none text-white">
      
      {/* 1. PREVIOUS PAGE BUTTON VECTOR ACTION */}
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-[13px] font-bold tracking-wide transition-all shadow-md transform active:scale-95 cursor-pointer ${
          currentPage === 1
            ? 'border-white/5 bg-white/0 text-white/20 cursor-not-allowed transform-none shadow-none'
            : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white'
        }`}
        aria-label="Go to previous page"
      >
        <ChevronLeft size={16} />
        <span>Previous</span>
      </button>

      {/* 2. NUMERICAL INDICATOR STRIP BOX */}
      <div className="flex items-center justify-center bg-black/40 border border-white/5 px-4 py-2.5 rounded-xl text-[13px] font-semibold font-mono tracking-wide">
        <span className="text-[#a1a1a1]">Page</span>
        <span className="text-(--brand-color) font-black ml-1.5">{currentPage}</span>
      </div>

      {/* 3. NEXT PAGE BUTTON VECTOR ACTION */}
      <button
        type="button"
        disabled={!hasNextPage}
        onClick={() => onPageChange(currentPage + 1)}
        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-[13px] font-bold tracking-wide transition-all shadow-md transform active:scale-95 cursor-pointer ${
          !hasNextPage
            ? 'border-white/5 bg-white/0 text-white/20 cursor-not-allowed transform-none shadow-none'
            : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white'
        }`}
        aria-label="Go to next page"
      >
        <span>Next</span>
        <ChevronRight size={16} />
      </button>

    </div>
  );
};
