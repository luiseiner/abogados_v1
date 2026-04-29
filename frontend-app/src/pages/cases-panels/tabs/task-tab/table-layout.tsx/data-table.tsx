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

import {
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Trash2,
  Eye,
} from "lucide-react";

import { Spinner } from "@/components/ui/spinner";

import { Button } from "@/components/ui/button";

import { TaskDetailsSheet } from "../../../components/task-sheet";

import type { Tarea } from "@/types/caseTypes";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { casosAPI } from "@/services/casesSrevice";
import type { UsuarioSimple } from "@/types/userTypes";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  onNewTask?: () => void;
  members?: UsuarioSimple[];
  casoId: number;
  onUpdateTask?: (tarea: Tarea) => void;
  canEdit?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  onNewTask,
  members = [],
  casoId,
  onUpdateTask,
  canEdit = false,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const [selectedTask, setSelectedTask] = useState<Tarea | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const searchValue = filterValue.toLowerCase();

      const tarea = row.original as any;

      const titulo = tarea.titulo?.toLowerCase() || "";
      if (titulo.includes(searchValue)) return true;

      const asignados = tarea.asignados || [];
      if (asignados.length > 0) {
        const foundAsignado = asignados.some((user: any) => {
          const nombreCompleto = `${user.nombre || ""} ${user.apellido || ""}`
            .trim()
            .toLowerCase();
          return nombreCompleto.includes(searchValue);
        });
        if (foundAsignado) return true;
      }

      const estado = tarea.estado?.toLowerCase() || "";
      const prioridad = tarea.prioridad?.toLowerCase() || "";
      if (estado.includes(searchValue) || prioridad.includes(searchValue))
        return true;

      return false;
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
  });

  const handleRowClick = (rowData: TData) => {
    setSelectedTask(rowData as unknown as Tarea);
    setIsSheetOpen(true);
  };

  const handleUpdateTask = async (data: Partial<Tarea>) => {
    
    if (!selectedTask?.id) return;

    // El backend requiere todos los campos, mergeamos con la tarea actual
    const payload = { ...selectedTask, ...data };

    if (data.asignados !== undefined) {
      payload.asignados_ids = data.asignados.map((u) => u.id);
    }

    try {
      const updated = await casosAPI.updateCaseTask(
        casoId,
        selectedTask.id,
        payload,
      );
      setSelectedTask(updated); // actualiza el sheet inmediatamente
      onUpdateTask?.(updated); // notifica al padre para actualizar la tabla
    } catch {
      toast.error("Error al actualizar la tarea");
    }
  };

  const handleDeleteTask = async (tarea: Tarea) => {
    try {
      await casosAPI.deleteCasteTask(casoId, tarea.id!);
      onUpdateTask?.({ ...tarea, _deleted: true } as any);
      toast.success("Tarea eliminada");
    } catch {
      toast.error("Error al eliminar la tarea");
    }
  };

  const handleTimerUpdate = (tareaId: number, tiempo: number) => {
    onUpdateTask?.({
      ...selectedTask!,
      id: tareaId,
      tiempo_total_segundos: tiempo,
    });
    if (selectedTask?.id === tareaId) {
      setSelectedTask((prev) =>
        prev ? { ...prev, tiempo_total_segundos: tiempo } : prev,
      );
    }
  };

  return (
    <div className="w-full">
      <div className="mb-6 gap-4 flex flex-col justify-between sm:flex-row">
        <div className="flex flex-3 ">
          <Input
            placeholder="Buscar por tarea, estado o asignado..."
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
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="completada">Completada</SelectItem>
            <SelectItem value="en progreso">En progreso</SelectItem>
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
          </SelectContent>
        </Select>
        {onNewTask && (
          <Button onClick={onNewTask}>
            <CirclePlus className="mr-2 h-4 w-4" />
            Nueva tarea
          </Button>
        )}
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
                  <ContextMenu key={row.id}>
                    <ContextMenuTrigger asChild>
                      <TableRow
                        className="cursor-pointer hover:bg-accent/50 transition-colors"
                        onClick={() => handleRowClick(row.original)}
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
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem
                        onClick={() => handleRowClick(row.original)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalles
                      </ContextMenuItem>
                      {canEdit && (
                        <>
                          <ContextMenuItem
                            variant="destructive"
                            onClick={() =>
                              handleDeleteTask(row.original as unknown as Tarea)
                            }
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar tarea
                          </ContextMenuItem>
                        </>
                      )}
                    </ContextMenuContent>
                  </ContextMenu>
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
      <TaskDetailsSheet
        task={selectedTask}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        members={members}
        casoId={casoId}
        onUpdate={canEdit ? handleUpdateTask : undefined}
        onTimerUpdate={(tiempo) =>
          handleTimerUpdate(selectedTask!.id!, tiempo.tiempo_total_segundos)
        }
      />

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
