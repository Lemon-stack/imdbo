import { useState, useMemo } from "react";

const PAGE_SIZE = 10;

export function usePagination<T>(items: T[]) {
  const [pageIndex, setPageIndex] = useState(0);

  const paginatedItems = useMemo(() => {
    const start = pageIndex * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, pageIndex]);

  const pageCount = Math.ceil(items.length / PAGE_SIZE);

  return {
    paginatedItems,
    pageIndex,
    setPageIndex,
    pageCount,
    canPreviousPage: pageIndex > 0,
    canNextPage: pageIndex < pageCount - 1,
  };
}
