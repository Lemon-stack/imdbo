import { useSyncExternalStore } from "react";

function subscribe(callback: () => void, query: string): () => void {
  if (typeof window === "undefined") return () => {};

  const media = window.matchMedia(query);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

export function useMediaQuery(query: string): boolean {
  const getSnapshot = () => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  };

  // Server snapshot must be stable — always false during SSR.
  const getServerSnapshot = () => false;

  return useSyncExternalStore(
    (cb) => subscribe(cb, query),
    getSnapshot,
    getServerSnapshot
  );
}
