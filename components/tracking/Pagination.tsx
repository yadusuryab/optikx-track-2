interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }
  
  export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    const maxVisible = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    const endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    return (
      <div style={{ display: "flex", justifyContent: "center", gap: 4, marginTop: 36 }}>
        <button
          className="page-num"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{ opacity: currentPage === 1 ? 0.28 : 1 }}
        >
          ←
        </button>
        {[...Array(endPage - startPage + 1)].map((_, i) => (
          <button
            key={i}
            className={`page-num${currentPage === startPage + i ? " active" : ""}`}
            onClick={() => onPageChange(startPage + i)}
          >
            {startPage + i}
          </button>
        ))}
        <button
          className="page-num"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{ opacity: currentPage === totalPages ? 0.28 : 1 }}
        >
          →
        </button>
      </div>
    );
  }