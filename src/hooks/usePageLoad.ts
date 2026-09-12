import { useEffect, useState } from "react";

/** Simulates data fetch so skeletons show briefly; swap for real API later */
export function usePageLoad(delay = 450) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), delay);
    return () => window.clearTimeout(t);
  }, [delay]);
  return loading;
}
