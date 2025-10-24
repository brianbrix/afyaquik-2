import React from 'react';
import ReactPaginate from 'react-paginate';
import './ReactPaginate.css';

interface ReactPaginateProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (selectedItem: { selected: number }) => void;
  className?: string;
  disabled?: boolean;
}

export const ReactPaginateComponent: React.FC<ReactPaginateProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
  disabled = false
}) => {
  // Only hide pagination if there are truly no pages or only 1 page
  if (totalPages <= 1) {
    return null;
  }

  return (
    <ReactPaginate
      previousLabel="‹ Previous"
      nextLabel="Next ›"
      pageCount={totalPages}
      forcePage={currentPage}
      onPageChange={onPageChange}
      containerClassName={`pagination justify-content-center ${className}`}
      pageClassName="page-item"
      pageLinkClassName="page-link"
      previousClassName="page-item"
      previousLinkClassName="page-link"
      nextClassName="page-item"
      nextLinkClassName="page-link"
      breakClassName="page-item"
      breakLinkClassName="page-link"
      activeClassName="active"
      disabledClassName="disabled"
      marginPagesDisplayed={2}
      pageRangeDisplayed={5}
    />
  );
};
