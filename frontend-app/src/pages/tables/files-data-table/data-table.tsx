"use client";
import { useEffect, useMemo, useState } from "react";

import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
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

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  ChevronUp,
  ChevronDown,
  Download,
  Info,
  PenLine,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Link2,
  History,
  Share2,
  ScanSearch,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onInfoClick?: (file: TData) => void
  onPreviewClick?: (file: TData) => void
  onRowClick?: (file: TData) => void
  onRenameClick?: (file: TData) => void
  onShareClick?: (file: TData) => void
  onDownloadClick?: (file: TData) => void
  onDownloadSelectedClick?: () => void
  onSelectionChange?: (ids: string[]) => void
  onDeleteClick?: (file: TData | TData[]) => void
  isPanelOpen?: boolean
  globalFilter?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onInfoClick,
  onPreviewClick,
  onRowClick,
  onRenameClick,
  onShareClick,
  onDownloadClick,
  onDownloadSelectedClick,
  onSelectionChange,
  onDeleteClick,
  globalFilter: globalFilterProp = "",
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);

  const [globalFilter, setGlobalFilter] = useState(globalFilterProp);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });
    
const rowSelectionState = table.getState().rowSelection;
  const selectedIds = useMemo(
    () =>
      table
        .getSelectedRowModel()
        .rows.map((row) => (row.original as any)?.id)
        .filter(Boolean) as string[],
    [rowSelectionState]
  );

  useEffect(() => {
    onSelectionChange?.(selectedIds);
  }, [onSelectionChange, selectedIds]);

  useEffect(() => {
    setGlobalFilter(globalFilterProp);
  }, [globalFilterProp]);


  return (
    <div className="flex flex-col gap-2">
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="h-10">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      aria-sort={
                        header.column.getIsSorted() === "asc"
                          ? "ascending"
                          : header.column.getIsSorted() === "desc"
                            ? "descending"
                            : "none"
                      }
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={cn(
                            header.column.getCanSort() &&
                            "flex h-full cursor-pointer items-center justify-between gap-2 select-none"
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                          onKeyDown={(e) => {
                            if (
                              header.column.getCanSort() &&
                              (e.key === "Enter" || e.key === " ")
                            ) {
                              e.preventDefault();
                              header.column.getToggleSortingHandler()?.(e);
                            }
                          }}
                          tabIndex={header.column.getCanSort() ? 0 : undefined}
                        >
                          <span className="truncate">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </span>
                          {{
                            asc: (
                              <ChevronUp
                                className="shrink-0 opacity-60"
                                size={16}
                                aria-hidden="true"
                              />
                            ),
                            desc: (
                              <ChevronDown
                                className="shrink-0 opacity-60"
                                size={16}
                                aria-hidden="true"
                              />
                            ),
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <ContextMenu key={row.id}>
                  <ContextMenuTrigger asChild>
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      onClick={() => {
                        const data = row.original as any;
                        if (!data.is_directory) {
                          onRowClick?.(row.original);
                        }
                      }}
                      onDoubleClick={() => {
                        const data = row.original as any;
                        if (data.is_directory) {
                          onRowClick?.(row.original);
                        }
                      }}
                      className="group/row cursor-pointer hover:bg-accent h-12"
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
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem onClick={() => onDownloadClick?.(row.original)}>
                      <Download className="h-4 w-4" />
                      Descargar
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => onDownloadSelectedClick?.()}
                      disabled={selectedIds.length === 0}
                    >
                      <Download className="h-4 w-4" />
                      Descargar seleccionados
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => onRenameClick?.(row.original)}
                    >
                      <PenLine className="h-4 w-4" />
                      Cambiar nombre
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuSub>
                      <ContextMenuSubTrigger className="flex items-center gap-2">
                        <Share2 className="h-4 w-4 text-muted-foreground" />
                        Compartir
                      </ContextMenuSubTrigger>
                      <ContextMenuSubContent>
                        <ContextMenuItem onClick={() => onShareClick?.(row.original)}>
                          <History className="h-4 w-4" />
                          Compartir
                        </ContextMenuItem>
                        <ContextMenuItem>
                          <Link2 className="h-4 w-4" />
                          Copiar enlace
                        </ContextMenuItem>
                      </ContextMenuSubContent>
                    </ContextMenuSub>
                    <ContextMenuItem
                      onClick={() => onInfoClick?.(row.original)}
                    >
                      <Info className="h-4 w-4" />
                      Información del archivo
                    </ContextMenuItem>
                    <ContextMenuItem
                      onClick={() => onPreviewClick?.(row.original)}
                    >
                      <ScanSearch className="h-4 w-4" />
                      Previsualizar el archivo
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem onClick={() => {
                      const selectedRows = table.getFilteredSelectedRowModel().rows;
                      if (selectedRows.length > 1) {
                        const selectedData = selectedRows.map(r => r.original);
                        onDeleteClick?.(selectedData);
                      } else {
                        onDeleteClick?.(row.original);
                      }
                    }}>
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Sin resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} columna(s) seleccionada(s).
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">Filas por página</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 15, 20, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <span className="text-sm text-muted-foreground">
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
