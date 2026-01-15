"use client";

import * as React from "react";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  striped?: boolean;
  outerBorder?: boolean;
  headerBorder?: boolean;
  rowBorder?: boolean;
  borderColor?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  striped = false,
  outerBorder = true,
  headerBorder = true,
  rowBorder = true,
  borderColor = "border-gray-200",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  // Calculate if pagination should be shown (more than 1 page)
  const showPagination = table.getPageCount() > 1;

  // Function to merge border color classes
  const getBorderColorClass = () => borderColor;

  return (
    <div className="space-y-4">
      <div
        className={`rounded-md overflow-hidden ${outerBorder ? "border" : ""} ${
          outerBorder ? getBorderColorClass() : ""
        }`}
      >
        <Table>
          <TableHeader
            className={`bg-[#EBF5F0]/50 ${
              !headerBorder ? "[&_tr]:border-0" : getBorderColorClass()
            }`}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={`font-semibold text-gray-900 ${
                        headerBorder ? "border-b" : "border-0"
                      } ${headerBorder ? getBorderColorClass() : ""}`}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={`
                    ${
                      striped
                        ? index % 2 === 0
                          ? "bg-white"
                          : "bg-off-white-1"
                        : "bg-white"
                    }
                    ${!rowBorder ? "border-0" : "border-b"}
                    ${rowBorder ? getBorderColorClass() : ""}
                  `}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls - Only show if necessary */}
      {showPagination && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className={!table.getCanPreviousPage() ? "hidden" : ""}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className={!table.getCanNextPage() ? "hidden" : ""}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
