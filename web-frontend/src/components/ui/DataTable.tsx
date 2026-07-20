import React from 'react';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
}

export function DataTable<T>({ data, columns, keyExtractor, onRowClick, isLoading }: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full bg-black/20 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <div className="h-6 bg-white/5 shimmer rounded w-1/4"></div>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 p-4 border-b border-white/5">
            <div className="h-10 w-10 bg-white/5 shimmer rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-white/5 shimmer rounded w-1/3"></div>
              <div className="h-3 bg-white/5 shimmer rounded w-1/4"></div>
            </div>
            <div className="h-8 w-24 bg-white/5 shimmer rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full bg-black/20 border border-white/10 rounded-2xl overflow-x-auto">
      <table className="w-full text-left text-sm text-white/70">
        <thead className="bg-black/40 text-white/50 uppercase text-xs">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-6 py-4 font-medium">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              onClick={() => onRowClick && onRowClick(item)}
              className={`hover:bg-white/5 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
            >
              {columns.map((col, idx) => (
                <td key={idx} className="px-6 py-4">
                  {col.cell ? col.cell(item) : col.accessorKey ? String(item[col.accessorKey]) : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
