import { useEffect, useState } from "react";

type Column<T> = {
  key: keyof T | string;
  title: string;
  render?: (row: T) => React.ReactNode;
  hideOnMobile?: boolean;
};

type CustomTableProps<T> = {
  data: T[];
  columns: Column<T>[];
  showStatus?: boolean;
  showActions?: boolean;
  renderStatus?: (row: T) => React.ReactNode;
  renderActions?: (row: T) => React.ReactNode;

  selectable?: boolean;
  getRowId: (row: T) => string | number;
  onSelectionChange?: (selectedIds: (string | number)[]) => void;

  pageSize?: number;
  loading?: boolean;

  page?: number;
  onPageChange?: (page: number) => void;
  totalPages?: number;
};

export function CustomTable<T extends Record<string, any>>({
  data,
  columns,
  showStatus = false,
  showActions = false,
  renderStatus,
  renderActions,
  selectable = false,
  getRowId,
  onSelectionChange,
  pageSize = 5,
  loading = false,
  page: controlledPage,
  onPageChange,
  totalPages: controlledTotalPages,
}: CustomTableProps<T>) {
  const [selected, setSelected] = useState<(string | number)[]>([]);
  const [internalPage, setInternalPage] = useState(1);

  const isControlled =
    controlledPage !== undefined && onPageChange !== undefined;

  const page = isControlled ? controlledPage : internalPage;
  const setPage = isControlled ? onPageChange : setInternalPage;

  const totalPages = isControlled
    ? (controlledTotalPages ?? 1)
    : Math.ceil((data?.length || 0) / pageSize);

  const paginatedData = isControlled
    ? data
    : (() => {
        const startIndex = (internalPage - 1) * pageSize;
        return data?.slice(startIndex, startIndex + pageSize);
      })();

  const allSelected =
    selectable && selected?.length === data?.length && data?.length > 0;

  const toggleSelectAll = () => {
    if (allSelected) setSelected([]);
    else setSelected(data.map(getRowId));
  };

  const toggleRow = (id: string | number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  useEffect(() => {
    onSelectionChange?.(selected);
  }, [selected]);

  const visibleColumns = columns.filter((col) => !col.hideOnMobile);

  const skeletonRows = Array.from({ length: pageSize });

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-accent/30 bg-white">
      <div className="w-full overflow-x-auto">
        <div className="min-w-175">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-10 bg-bg-soft">
              <tr className="border-b border-gray-100">
                {selectable && (
                  <th className="px-3 sm:px-5 py-3 sm:py-4 text-left">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 accent-accent cursor-pointer"
                    />
                  </th>
                )}

                {visibleColumns.map((column) => (
                  <th
                    key={String(column.key)}
                    className="px-3 sm:px-5 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-gray-500"
                  >
                    {column.title}
                  </th>
                ))}

                {showStatus && (
                  <th className="px-3 sm:px-5 py-3 sm:py-4 text-left text-[10px] sm:text-xs font-semibold uppercase text-gray-500">
                    Status
                  </th>
                )}

                {showActions && (
                  <th className="px-3 sm:px-5 py-3 sm:py-4 text-right text-[10px] sm:text-xs font-semibold uppercase text-gray-500">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {loading &&
                skeletonRows.map((_, idx) => (
                  <tr key={idx} className="border-b border-gray-50">
                    {selectable && (
                      <td className="px-3 sm:px-5 py-4">
                        <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                      </td>
                    )}

                    {visibleColumns.map((col) => (
                      <td key={String(col.key)} className="px-3 sm:px-5 py-4">
                        <div className="h-4 w-full max-w-30 bg-gray-200 rounded animate-pulse" />
                      </td>
                    ))}

                    {showStatus && (
                      <td className="px-3 sm:px-5 py-4">
                        <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                      </td>
                    )}

                    {showActions && (
                      <td className="px-3 sm:px-5 py-4 text-right">
                        <div className="h-4 w-20 bg-gray-200 rounded ml-auto animate-pulse" />
                      </td>
                    )}
                  </tr>
                ))}

              {!loading && paginatedData?.length === 0 && (
                <tr>
                  <td
                    colSpan={
                      visibleColumns.length +
                      (selectable ? 1 : 0) +
                      (showStatus ? 1 : 0) +
                      (showActions ? 1 : 0)
                    }
                    className="text-center py-10 text-sm text-gray-500"
                  >
                    No data available
                  </td>
                </tr>
              )}

              {!loading &&
                paginatedData?.map((row) => {
                  const id = getRowId(row);
                  const isChecked = selected.includes(id);

                  return (
                    <tr
                      key={id}
                      className="border-b border-gray-50 transition hover:bg-bg-soft/30"
                    >
                      {selectable && (
                        <td className="px-3 sm:px-5 py-3 sm:py-4">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleRow(id)}
                            className="h-4 w-4 accent-accent cursor-pointer"
                          />
                        </td>
                      )}

                      {visibleColumns.map((column) => (
                        <td
                          key={String(column.key)}
                          className="px-3 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm text-gray-700"
                        >
                          {column.render
                            ? column.render(row)
                            : (row[column.key as keyof T] as any)}
                        </td>
                      ))}

                      {showStatus && (
                        <td className="px-3 sm:px-5 py-3 sm:py-4">
                          {renderStatus?.(row)}
                        </td>
                      )}

                      {showActions && (
                        <td className="px-3 sm:px-5 py-3 sm:py-4 text-right">
                          {renderActions?.(row)}
                        </td>
                      )}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && paginatedData?.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-gray-100 bg-white">
          <p className="text-xs sm:text-sm text-gray-500">
            Page <span className="font-medium text-gray-800">{page}</span> of{" "}
            {totalPages || 1}
          </p>

          <div className="flex gap-1 sm:gap-2 flex-wrap justify-center sm:justify-end">
            {Array.from({ length: totalPages || 1 }, (_, i) => i + 1).map(
              (pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm border transition ${
                    page === pageNumber
                      ? "bg-accent text-white border-accent shadow-sm"
                      : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {pageNumber}
                </button>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
