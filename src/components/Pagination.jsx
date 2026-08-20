import React from 'react';
import { 
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight 
} from 'lucide-react';
import { sound } from '../services/soundEffects';

export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 24,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [16, 24, 48, 96, 'All']
}) {
  const effectivePageSize = pageSize === 'All' || pageSize === 'all' ? totalItems : Number(pageSize);
  const totalPages = effectivePageSize > 0 ? Math.max(1, Math.ceil(totalItems / effectivePageSize)) : 1;

  if (totalItems <= 0) return null;

  const startItem = effectivePageSize > 0 ? Math.min(totalItems, (currentPage - 1) * effectivePageSize + 1) : 1;
  const endItem = effectivePageSize > 0 ? Math.min(totalItems, currentPage * effectivePageSize) : totalItems;

  const handlePageClick = (page) => {
    if (page === currentPage || page < 1 || page > totalPages) return;
    sound.playTap();
    onPageChange(page);
    
    // Smooth scroll to top of collection
    const mainEl = document.querySelector('.filter-bar');
    if (mainEl) {
      const topOffset = mainEl.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  };

  // Generate smart pagination page array with ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    pages.push(1);

    if (currentPage > 3) {
      pages.push('...');
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    pages.push(totalPages);
    return pages;
  };

  return (
    <nav className="pagination-container" aria-label="Diecast Collection Pagination">
      {/* Telemetry info */}
      <div className="pagination-info">
        <span style={{ color: 'var(--text-tertiary)' }}>Showing</span>
        <span className="pagination-info-range">
          {startItem}–{endItem}
        </span>
        <span style={{ color: 'var(--text-tertiary)' }}>of</span>
        <span className="pagination-info-total">
          {totalItems} models
        </span>
      </div>

      {/* Center: Interactive Page Capsule */}
      {totalPages > 1 && (
        <div className="pagination-controls">
          {/* First Page */}
          <button
            type="button"
            className="pagination-btn pagination-nav-btn"
            disabled={currentPage === 1}
            onClick={() => handlePageClick(1)}
            aria-label="Go to first page"
            title="First page"
          >
            <ChevronsLeft size={15} />
          </button>

          {/* Previous Page */}
          <button
            type="button"
            className="pagination-btn pagination-nav-btn"
            disabled={currentPage === 1}
            onClick={() => handlePageClick(currentPage - 1)}
            aria-label="Go to previous page"
            title="Previous page"
          >
            <ChevronLeft size={15} />
          </button>

          {/* Page Numbers */}
          <div className="pagination-pages">
            {getPageNumbers().map((page, idx) => {
              if (page === '...') {
                return (
                  <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
                    •••
                  </span>
                );
              }
              const isCurrent = page === currentPage;
              return (
                <button
                  key={page}
                  type="button"
                  className={`pagination-btn pagination-number-btn ${isCurrent ? 'active' : ''}`}
                  onClick={() => handlePageClick(page)}
                  aria-current={isCurrent ? 'page' : undefined}
                  aria-label={`Page ${page}`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          {/* Next Page */}
          <button
            type="button"
            className="pagination-btn pagination-nav-btn"
            disabled={currentPage === totalPages}
            onClick={() => handlePageClick(currentPage + 1)}
            aria-label="Go to next page"
            title="Next page"
          >
            <ChevronRight size={15} />
          </button>

          {/* Last Page */}
          <button
            type="button"
            className="pagination-btn pagination-nav-btn"
            disabled={currentPage === totalPages}
            onClick={() => handlePageClick(totalPages)}
            aria-label="Go to last page"
            title="Last page"
          >
            <ChevronsRight size={15} />
          </button>
        </div>
      )}

      {/* Page Size Selector */}
      <div className="pagination-size-wrapper">
        <label htmlFor="pageSizeSelect" style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
          Per Page:
        </label>
        <select
          id="pageSizeSelect"
          className="pagination-size-select"
          value={pageSize}
          onChange={(e) => {
            sound.playTap();
            const val = e.target.value === 'All' ? 'All' : Number(e.target.value);
            onPageSizeChange(val);
          }}
          aria-label="Select items per page"
        >
          {pageSizeOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt === 'All' ? `All (${totalItems})` : `${opt} cars`}
            </option>
          ))}
        </select>
      </div>
    </nav>
  );
}
