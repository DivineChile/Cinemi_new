import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SearchBannerHeader } from "../../components/discover/SearchBannerHeader";
import AdvancedFilterBar from "../../components/discover/AdvancedFilterBar";
import ActiveResultsLayout from "../../components/discover/ActiveResultsLayout";
import PaginationControls from "../../components/discover/PaginationControls";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";

const PROXY_API_URL = import.meta.env.VITE_PROXY_API_URL;

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
  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        setLoading(true);
        setError(null);

        let endpointUrl = "";

        // SCENARIO A: Text query matching coming from the SearchModal autocomplete input
        if (currentQuery) {
          const queryParams = new URLSearchParams({
            query: currentQuery,
            page: currentPage.toString(),
            per_page: filters.per_page,
          });
          endpointUrl = `${PROXY_API_URL}/search?${queryParams.toString()}`;
        }
        // SCENARIO B: Advanced filtration matching / Home Page Genre Exploration cards click redirects
        else {
          const filterParams = new URLSearchParams();
          // Build request parameters dynamically—only appending options that are actively chosen
          Object.entries(filters).forEach(([key, val]) => {
            if (val) filterParams.append(key, val);
          });
          filterParams.append("page", currentPage.toString());

          endpointUrl = `${PROXY_API_URL}/filter?${filterParams.toString()}`;
        }

        console.log("🌐 Discover Pipeline Fetching:", endpointUrl);
        const response = await fetch(endpointUrl);
        if (!response.ok)
          throw new Error(
            "Failed to secure connection to the catalog database.",
          );
        const data = await response.json();

        // Target raw payload data arrays safely
        const rawResults = data.results || data || [];

        // Defensive pre-mapping gatekeeper filter: Exclude mature content parameters automatically
        const verifiedResults = rawResults.filter(
          (item) =>
            !item.genres ||
            !Array.isArray(item.genres) ||
            !item.genres.includes("Hentai"),
        );

        setResultsData({
          results: verifiedResults,
          total: data.total || verifiedResults.length,
          hasNextPage: data.hasNextPage || false,
        });
      } catch (err) {
        console.error(err);
        setError(
          "Database catalog data could not be retrieved. Please try refreshing.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCatalogData();
  }, [currentQuery, currentPage, filters]); // 🚀 Seamlessly re-fires immediately whenever a user interacts with filters or pages

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
