import React from 'react';
import { ReactPaginateComponent } from './ReactPaginate';

interface PaginationProps {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  size,
  totalElements,
  totalPages,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50]
}) => {
  const handlePageChange = ({ selected }: { selected: number }) => onPageChange(selected);
  const start = totalElements === 0 ? 0 : page * size + 1;
  const end = Math.min((page + 1) * size, totalElements);
  return (
    <div className="d-flex justify-content-end align-items-center gap-3">
      {onPageSizeChange && (
        <div className="d-flex align-items-center gap-2">
          <label className="form-label mb-0 small">Show:</label>
          <select
            className="form-select form-select-sm"
            style={{ width: 'auto' }}
            value={size}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {pageSizeOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <span className="small text-muted">entries</span>
        </div>
      )}
      <div className="text-muted small me-2">
        {`Showing ${start} to ${end} of ${totalElements}`}
      </div>
      <ReactPaginateComponent
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

// Backwards compatibility alias for older imports
export const PaginationControls = Pagination;
