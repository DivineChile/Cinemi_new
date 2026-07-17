import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchBannerHeader } from "../../components/discover/SearchBannerHeader";
import AdvancedFilterBar from "../../components/discover/AdvancedFilterBar";
import ActiveResultsLayout from "../../components/discover/ActiveResultsLayout";
import PaginationControls from "../../components/discover/PaginationControls";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { search as searchApi, browseAnime } from "../../api";

export default function Discover() {
  // 1. React Router search parameters synchronization hook
  const [searchParams, setSearchParams] = useSearchParams();

  // Core Data and Media States
  const [resultsData, setResultsData] = useState({
    results: [],
    total: 0,
    hasNextPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🌟 REACTIVE FILTER SELECTION STATE MATRICES
  // Automatically hydrates its defaults based on whatever is present in the browser URL bar
  const currentQuery = searchParams.get("query") || "";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const activeGenre = searchParams.get("genre");

  const computedTitle = currentQuery
    ? `Results for "${currentQuery}"`
    : activeGenre
      ? `${activeGenre} Category`
      : "Discover Anime";

  useDocumentTitle(computedTitle);

  const [filters, setFilters] = useState({
    genre: searchParams.get("genre") || "",
    tag: searchParams.get("tag") || "",
    year: searchParams.get("year") || "",
    season: searchParams.get("season") || "",
    format: searchParams.get("format") || "",
    status: searchParams.get("status") || "",
    sort: searchParams.get("sort") || "POPULARITY_DESC", // Default catalog sorting
    per_page: "20",
  });

  // Keep internal filter state synchronized if the URL parameters update from the outside
  // (Like when clicking an Action genre card from home, then clicking a Comedy card right after)
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      genre: searchParams.get("genre") || "",
      tag: searchParams.get("tag") || "",
      year: searchParams.get("year") || "",
      season: searchParams.get("season") || "",
      format: searchParams.get("format") || "",
      status: searchParams.get("status") || "",
      sort: searchParams.get("sort") || prev.sort,
    }));
  }, [searchParams]);

  // 🌟 2. THE CORE DISCOVERY PIPELINE FETCH LAYER
  // SCENARIO A: text query → /api/search (Miruro, AniList-backed).
  // SCENARIO B: filters or default catalog → /api/browse?type=anime (Miruro
  // /filter) — powers genre cards from home, advanced filters, and the default
  // POPULARITY_DESC catalog when nothing is selected.
  useEffect(() => {
    const controller = new AbortController();

    const fetchCatalogData = async () => {
      try {
        setLoading(true);
        setError(null);

        let data;

        if (currentQuery) {
          data = await searchApi({
            q: currentQuery,
            page: currentPage,
            provider: "miruro",
            signal: controller.signal,
          });
        } else {
          const activeFilters = {};
          // Only append options that are actively chosen (skip per_page — the
          // backend forwards perPage separately).
          Object.entries(filters).forEach(([key, val]) => {
            if (val && key !== "per_page") activeFilters[key] = val;
          });

          data = await browseAnime(
            { ...activeFilters, page: currentPage, perPage: filters.per_page },
            { signal: controller.signal },
          );
        }

        const rawResults = data?.results || [];

        // Defensive gatekeeper: exclude mature content automatically.
        const verifiedResults = rawResults.filter(
          (item) =>
            !item.genres ||
            !Array.isArray(item.genres) ||
            !item.genres.includes("Hentai"),
        );

        if (controller.signal.aborted) return;

        // search returns { page, totalPages }; browse returns { pagination }.
        const totalPages =
          data?.pagination?.totalPages ?? data?.totalPages ?? 1;

        setResultsData({
          results: verifiedResults,
          total: verifiedResults.length,
          hasNextPage: currentPage < totalPages,
        });
      } catch (err) {
        if (err?.name === "AbortError" || controller.signal.aborted) return;
        console.error(err);
        setError(
          "Database catalog data could not be retrieved. Please try refreshing.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchCatalogData();

    return () => controller.abort();
  }, [currentQuery, currentPage, filters]); // 🚀 Re-fires whenever a user interacts with filters or pages

  // 🌟 3. GLOBAL ROUTE PARAMETER REWRITER METHODS
  // Updates browser search strings synchronously so bookmark links remain functional
  const updateUrlParams = (newFilters, targetPage = 1) => {
    const nextParams = new URLSearchParams();

    if (currentQuery) {
      nextParams.set("query", currentQuery);
    }

    Object.entries(newFilters).forEach(([key, val]) => {
      if (val) nextParams.set(key, val);
    });

    if (targetPage > 1) {
      nextParams.set("page", targetPage.toString());
    }

    setSearchParams(nextParams);
  };

  const handleFilterChange = (key, value) => {
    const updatedFilters = { ...filters, [key]: value };
    setFilters(updatedFilters);
    updateUrlParams(updatedFilters, 1); // Drop users back to page 1 automatically on fresh filter criteria shifts
  };

  const handlePageChange = (targetPage) => {
    updateUrlParams(filters, targetPage);
    window.scrollTo({ top: 0, behavior: "smooth" }); // Symmetrical screen snapping lift
  };

  const handleClearAllFilters = () => {
    const cleared = {
      genre: "",
      tag: "",
      year: "",
      season: "",
      format: "",
      status: "",
      sort: "POPULARITY_DESC",
      per_page: "20",
    };
    setFilters(cleared);
    setSearchParams(currentQuery ? { query: currentQuery } : {});
  };

  return (
    <div className="bg-(--neutral-color) min-h-screen text-white pb-20 font-[Inter] overflow-x-hidden">
      {/* SECTION 1: Dynamic Banner Header Context Indicator */}
      <SearchBannerHeader
        query={currentQuery}
        activeGenre={filters.genre}
        totalResults={resultsData.total}
        loading={loading}
      />

      {/* Main UI structural container grid aligned to Cinemi specs */}
      <main className="max-w-7xl mx-auto px-4 mt-6 flex flex-col gap-8">
        {/* SECTION 2: Advanced Collapsible Option Badges Selector Row */}
        <AdvancedFilterBar
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearAll={handleClearAllFilters}
          isSearchingText={!!currentQuery}
        />

        {/* SECTION 3: Responsive Multi-Column Layout Media Matrix Grid */}
        <ActiveResultsLayout
          results={resultsData.results}
          loading={loading}
          error={error}
        />

        {/* SECTION 4: Low-Impact Numerical Step Pagination Control Panel */}
        {!loading && !error && resultsData.results.length > 0 && (
          <PaginationControls
            currentPage={currentPage}
            hasNextPage={resultsData.hasNextPage}
            onPageChange={handlePageChange}
          />
        )}
      </main>
    </div>
  );
}
