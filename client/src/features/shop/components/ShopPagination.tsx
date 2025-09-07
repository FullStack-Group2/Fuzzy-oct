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

import { useShopProducts } from '../stores/ShopProductDataContext';

type ShopPaginationProps = {
  pageIndex: number;
  setPageIndex: React.Dispatch<React.SetStateAction<number>>;
};

const ShopPagination: React.FC<ShopPaginationProps> = ({
  pageIndex,
  setPageIndex,
}) => {
  const { products, loading, error } = useShopProducts();

  if (loading) return <p>is Loading...</p>;
  if (error) return <p>{error}</p>;

  const MAX_PAGE = Math.ceil(products.length / 9);

  // calculate the window of pages to show (3 pages)
  let start = Math.max(1, pageIndex - 1);
  let end = Math.min(MAX_PAGE, pageIndex + 1);

  // adjust if near the start
  if (pageIndex === 1) {
    end = Math.min(MAX_PAGE, 3);
  }
  // adjust if near the end
  if (pageIndex === MAX_PAGE) {
    start = Math.max(1, MAX_PAGE - 2);
  }

  const pages = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <Pagination>
      <PaginationContent>
        {/* Previous */}
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e: any) => {
              e.preventDefault();
              if (pageIndex > 1) setPageIndex(pageIndex - 1);
            }}
          />
        </PaginationItem>

        {/* First page + ellipsis if needed */}
        {start > 1 && (
          <>
            <PaginationItem>
              <PaginationLink
                href="#"
                isActive={pageIndex === 1}
                onClick={(e: any) => {
                  e.preventDefault();
                  setPageIndex(1);
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
              isActive={pageIndex === page}
              onClick={(e: any) => {
                e.preventDefault();
                setPageIndex(page);
              }}
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}

        {/* Last page + ellipsis if needed */}
        {end < MAX_PAGE && (
          <>
            {end < MAX_PAGE - 1 && <PaginationEllipsis />}
            <PaginationItem>
              <PaginationLink
                href="#"
                isActive={pageIndex === MAX_PAGE}
                onClick={(e: any) => {
                  e.preventDefault();
                  setPageIndex(MAX_PAGE);
                }}
              >
                {MAX_PAGE}
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
              if (pageIndex < MAX_PAGE) setPageIndex(pageIndex + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default ShopPagination;
