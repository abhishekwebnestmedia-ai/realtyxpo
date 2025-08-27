import React from "react";

const Pagination = ({ totalPages, currentPage, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center gap-2 mt-4">
      {/* Previous Button */}
      <button
        onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        className={`px-3 py-1 rounded ${
          currentPage === 1
            ? "bg-gray-200 cursor-not-allowed"
            : "bg-gray-300 hover:bg-gray-400"
        }`}
        disabled={currentPage === 1}
      >
        Prev
      </button>

      {/* Page Numbers */}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
        <button
          key={num}
          onClick={() => onPageChange(num)}
          className={`px-3 py-1 rounded ${
            num === currentPage ? "bg-blue-600 text-white" : "bg-gray-300"
          }`}
        >
          {num}
        </button>
      ))}

      {/* Next Button */}
      <button
        onClick={() =>
          currentPage < totalPages && onPageChange(currentPage + 1)
        }
        className={`px-3 py-1 rounded ${
          currentPage === totalPages
            ? "bg-gray-200 cursor-not-allowed"
            : "bg-gray-300 hover:bg-gray-400"
        }`}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination; // ✅ This is required
