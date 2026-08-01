import React, { useState, useMemo } from 'react';
import Avatar from './Avatar';
import { Skeleton, TableRowSkeleton } from './Skeleton';
import EmptyState from './EmptyState';

const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  emptyIcon = 'inbox',
  emptyTitle = 'No data found',
  emptySubtitle,
  emptyAction,
  emptyActionText,
  onRowClick,
  pagination = true,
  pageSize = 10,
  className = '',
  skeletonRows = 5,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;
    const sorted = [...data].sort((a, b) => {
      const aVal = sortConfig.accessor ? sortConfig.accessor(a) : a[sortConfig.key];
      const bVal = sortConfig.accessor ? sortConfig.accessor(b) : b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [data, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = pagination
    ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedData;

  const handleSort = (col) => {
    if (!col.sortable) return;
    setSortConfig(prev => ({
      key: col.key,
      accessor: col.sortAccessor,
      direction: prev.key === col.key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortIcon = (col) => {
    if (!col.sortable) return null;
    if (sortConfig.key !== col.key) return 'unfold_more';
    return sortConfig.direction === 'asc' ? 'arrow_upward' : 'arrow_downward';
  };

  return (
    <div className={`bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-lg py-md font-label-md text-label-md text-on-surface-variant ${col.sortable ? 'cursor-pointer select-none hover:text-on-surface' : ''} ${col.align === 'right' ? 'text-right' : ''} ${col.headerClassName || ''}`}
                  onClick={() => handleSort(col)}
                >
                  <span className="inline-flex items-center gap-xs">
                    {col.label}
                    {col.sortable && (
                      <span className="material-symbols-outlined text-[16px]">
                        {getSortIcon(col)}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {loading ? (
              Array.from({ length: skeletonRows }).map((_, i) => (
                <TableRowSkeleton key={i} columns={columns.length} />
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-xl">
                  <EmptyState
                    icon={emptyIcon}
                    title={emptyTitle}
                    subtitle={emptySubtitle}
                    actionText={emptyActionText}
                    onAction={emptyAction}
                  />
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIdx) => (
                <tr
                  key={row._id || row.id || rowIdx}
                  className={`hover:bg-background transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-lg py-lg ${col.align === 'right' ? 'text-right' : ''} ${col.cellClassName || ''}`}
                    >
                      {col.render ? col.render(row, rowIdx) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && !loading && paginatedData.length > 0 && (
        <div className="px-lg py-md border-t border-outline-variant flex items-center justify-between bg-surface-container-lowest">
          <p className="text-label-sm font-label-sm text-on-surface-variant">
            Showing {((currentPage - 1) * pageSize) + 1}–{Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-xs">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-xs rounded-lg text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                let page;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-label-md font-label-md transition-colors ${
                      currentPage === page
                        ? 'bg-primary text-on-primary'
                        : 'text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-xs rounded-lg text-on-surface-variant hover:bg-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DataTable;
