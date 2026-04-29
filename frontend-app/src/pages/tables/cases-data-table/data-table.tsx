"use client";

import { useState } from "react";

import type {
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ChevronLeft, ChevronRight, CirclePlus } from "lucide-react";

import { Spinner } from "@/components/ui/spinner";

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import { Input } from "@/components/ui/input";
import type { Caso } from "@/types/caseTypes";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  onNewCase?: () => void;
  pagination?: { pageIndex: number; pageSize: number };
  onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void;
  pageCount?: number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  onNewCase,
  pagination,
  onPaginationChange,
  pageCount,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");

  const [localPagination, setLocalPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const isServerSide = !!onPaginationChange;
  const activePagination = isServerSide ? pagination! : localPagination;
  const handlePaginationChange = isServerSide ? onPaginationChange! : setLocalPagination;

  const table = useReactTable({
    data,
    columns,
    manualPagination: isServerSide,
    pageCount: isServerSide ? pageCount : undefined,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater(activePagination) : updater;
      handlePaginationChange(next);
    },
    globalFilterFn: (row, _columnId, filterValue) => {
      const searchValue = filterValue.toLowerCase();
      const caso = row.original as Caso;

      // Buscar en cliente
      const cliente = caso.cliente;
      if (cliente) {
        const clienteText =
          `${cliente.nombre || ""} ${cliente.apellido || ""}`.trim();
        if (clienteText.toLowerCase().includes(searchValue)) {
          return true;
        }
      }

      // Buscar en expediente
      const expediente = caso.expediente;
      if (expediente && expediente.toLowerCase().includes(searchValue)) {
        return true;
      }

      // Buscar en asignados
      const asignados = caso.asignados;
      if (asignados && asignados.length > 0) {
        const found = asignados.some((u) => {
          const nombreCompleto =
            `${u.usuario.nombre || ""} ${u.usuario.apellido || ""}`.trim();
          return nombreCompleto.toLowerCase().includes(searchValue);
        });
        if (found) return true;
      }

      return false;
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
      pagination: activePagination,
    },
  });

  return (
    <div className="w-full">
      <div className="mb-6 gap-4 flex flex-col justify-between sm:flex-row">
        <div className="flex flex-3">
          <Input
            placeholder="Buscar por cliente, expediente o asignado..."
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
          />
        </div>
        <Select
          value={
            (table.getColumn("estado")?.getFilterValue() as string) ?? "all"
          }
          onValueChange={(value) =>
            table
              .getColumn("estado")
              ?.setFilterValue(value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="flex flex-1 w-full">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Estado</SelectItem>
            <SelectItem value="registrado">Registrado</SelectItem>
            <SelectItem value="en_progreso">En Progreso</SelectItem>
            <SelectItem value="cerrado">Cerrado</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={
            (table.getColumn("prioridad")?.getFilterValue() as string) ?? "all"
          }
          onValueChange={(value) =>
            table
              .getColumn("prioridad")
              ?.setFilterValue(value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="flex flex-1 w-full">
            <SelectValue placeholder="Prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Prioridad</SelectItem>
            <SelectItem value="Alta">Alta</SelectItem>
            <SelectItem value="Media">Media</SelectItem>
            <SelectItem value="Baja">Baja</SelectItem>
            <SelectItem value="Urgente">Urgente</SelectItem>
          </SelectContent>
        </Select>
        <Button className="flex flex-1 w-full" onClick={onNewCase} >
          <CirclePlus className="size-4" />
          Nuevo caso
        </Button>
      </div>
      <div className="overflow-hidden rounded-md border">
        <ScrollArea>
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Spinner className="h-5 w-5 animate-spin" />
                      <span>Cargando datos...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="cursor-pointer hover:bg-accent/50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="truncate overflow-hidden whitespace-nowrap max-w-40"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
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
                    No hay resultados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-muted-foreground">Filas por página</p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-17.5">
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
