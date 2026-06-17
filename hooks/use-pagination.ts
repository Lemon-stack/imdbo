import { useState, useMemo } from "react";

const PAGE_SIZE = 10;

export function usePagination<T>(items: T[]) {
  const [pageIndex, setPageIndex] = useState(0);

  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE));

  // Clamp page index if data shrank (e.g. after search/filter) so we never
  // render an empty page. Derived during render — no effect needed.
  const safePageIndex = Math.min(pageIndex, pageCount - 1);

  const paginatedItems = useMemo(() => {
    const start = safePageIndex * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, safePageIndex]);

  return {
    paginatedItems,
    pageIndex: safePageIndex,
    setPageIndex,
    pageCount,
    canPreviousPage: safePageIndex > 0,
    canNextPage: safePageIndex < pageCount - 1,
  };
}
