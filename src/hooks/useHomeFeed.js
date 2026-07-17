import { useState, useEffect, useMemo } from "react";
import { getHome } from "../api";

// Fetches the unified /api/home feed once and exposes the anime sections.
// The backend returns { movies, tv, anime: { spotlight, trending, popular,
//   upcoming, recent }, featured }. This pass is anime-only, so we surface the
// anime buckets and ignore the rest.
//
// The fetch is module-shared and deliberately NOT tied to any component's
// AbortSignal: multiple rows subscribe to the same promise, and aborting it on
// one subscriber's unmount (e.g. React StrictMode's mount→unmount→remount)
// would poison the shared inflight request and strand every subscriber in a
// permanent loading state.
let cachedFeed = null;
let inflight = null;

function loadFeed() {
  if (cachedFeed) return Promise.resolve(cachedFeed);
  if (!inflight) {
    inflight = getHome()
      .then((data) => {
        cachedFeed = data;
        inflight = null;
        return data;
      })
      .catch((err) => {
        inflight = null;
        throw err;
      });
  }
  return inflight;
}

export function useHomeFeed() {
  const [feed, setFeed] = useState(cachedFeed);
  const [loading, setLoading] = useState(!cachedFeed);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    loadFeed()
      .then((data) => {
        if (active) {
          setFeed(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err);
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  // Memoize derived buckets so consumers get STABLE references across renders.
  // Fresh `?? []` fallbacks each render would retrigger any effect keyed on
  // these arrays (infinite setState loop in Hero).
  const derived = useMemo(() => {
    const anime = feed?.anime ?? {};
    return {
      anime,
      spotlight: anime.spotlight ?? [],
      trending: anime.trending ?? [],
      popular: anime.popular ?? [],
      upcoming: anime.upcoming ?? [],
      recent: anime.recent ?? [],
    };
  }, [feed]);

  return { feed, loading, error, ...derived };
}
