// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: 
// ID: 

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

import { useUpdateSearchParam } from '../hooks/useUpdateSearchParam';
import { useShopProducts } from '../stores/ShopProductDataContext';
import { Skeleton } from '@/components/ui/skeleton';

const ShopPagination: React.FC = () => {
  const { data, loading, error } = useShopProducts();

  if (loading)
    return (
      <Pagination>
        <div className="flex gap-2">
          <Skeleton className="w-16 h-7" />
          <Skeleton className="w-7 h-7" />
          <Skeleton className="w-7 h-7" />
          <Skeleton className="w-7 h-7" />
          <Skeleton className="w-16 h-7" />
        </div>
      </Pagination>
    );
  if (error) return <></>;
  const updateSearchParam = useUpdateSearchParam();

  // calculate the window of pages to show (3 pages)
  let start = Math.max(1, data.pageIndex - 1);
  let end = Math.min(data.totalPages, data.pageIndex + 1);

  // adjust if near the start
  if (data.pageIndex === 1) {
    end = Math.min(data.totalPages, 3);
  }
  // adjust if near the end
  if (data.pageIndex === data.totalPages) {
    start = Math.max(1, data.totalPages - 2);
  }

  const pages = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <>
      {data.products.length > 0 && (
        <Pagination>
          <PaginationContent>
            {/* Previous */}
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e: any) => {
                  e.preventDefault();
                  if (data.pageIndex > 1)
                    updateSearchParam({ page: String(data.pageIndex - 1) });
                }}
              />
            </PaginationItem>

            {/* First page + ellipsis if needed */}
            {start > 1 && (
              <>
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    isActive={data.pageIndex === 1}
                    onClick={(e: any) => {
                      e.preventDefault();
                      updateSearchParam({ page: String(1) });
                    }}
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
                {start > 2 && <PaginationEllipsis />}
              </>
            )}

            {/* Middle pages (3 at a time) */}
            {pages.map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  isActive={data.pageIndex === page}
                  onClick={(e: any) => {
                    e.preventDefault();
                    updateSearchParam({ page: String(page) });
                  }}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            {/* Last page + ellipsis if needed */}
            {end < data.totalPages && (
              <>
                {end < data.totalPages - 1 && <PaginationEllipsis />}
                <PaginationItem>
                  <PaginationLink
                    href="#"
                    isActive={data.pageIndex === data.totalPages}
                    onClick={(e: any) => {
                      e.preventDefault();
                      updateSearchParam({ page: String(data.totalPages) });
                    }}
                  >
                    {data.totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}

            {/* Next */}
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e: any) => {
                  e.preventDefault();
                  if (data.pageIndex < data.totalPages)
                    updateSearchParam({ page: String(data.pageIndex + 1) });
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </>
  );
};

export default ShopPagination;
