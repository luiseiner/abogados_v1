"use client";

import { type ColumnDef } from "@tanstack/react-table";
import type { Caso } from "@/types/caseTypes";
import { ActionsCell } from "./acion-cell";
import { StatusBadge } from "@/components/status-badge";
import { UserAvatar } from "@/components/user-avatar";
import { PriorityBadge } from "@/components/priority-badge";

// Cambiar de array a función que recibe onEdit
export const createColumns = (
  onEdit: (caso: Caso) => void,
  onDelete: (caso: Caso) => void,
): ColumnDef<Caso>[] => [
  {
    accessorKey: "expediente",
    header: "N° Expediente",
  },
  {
    accessorKey: "cliente_id",
    header: "Cliente",
    cell: ({ row }) => {
      const cliente = row.original.cliente;
      if (!cliente) return "—";
      return `${cliente.nombre}`.trim();
    },
    filterFn: (row, _id, value) => {
      const cliente = row.original.cliente;
      if (!cliente) return false;
      const searchValue = value.toLowerCase();
      const nombre = cliente.nombre?.toLowerCase() || "";
      const apellido = cliente.apellido?.toLowerCase() || "";
      const nombreCompleto = `${nombre} ${apellido}`.trim();
      return nombreCompleto.includes(searchValue);
    },
  },
  {
    id: "miembros",
    header: "Miembros",
    cell: ({ row }) => {
      const asignados = row.original.asignados;

      if (!asignados || asignados.length === 0) return "—";

      return (
        <div className="flex items-center gap-1">
          <div className="flex -space-x-2">
            {asignados.slice(0, 4).map((member, i) => (
              <UserAvatar
                key={i}
                nombre={member.usuario.nombre}
                apellido={member.usuario.apellido}
              />
            ))}
            {asignados.length > 4 && (
              <div className="h-7 w-7 rounded-full ring-2 ring-background bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                +{asignados.length - 4}
              </div>
            )}
          </div>
          
        </div>
      );
    },
    filterFn: (row, _id, value) => {
      const asignados = row.original.asignados;
      if (!asignados || asignados.length === 0) return false;

      const searchValue = value.toLowerCase();
      return asignados.some((a) => {
        // Aquí ya lo tenías bien (a.usuario.nombre), solo faltaba en la celda
        const nombre = a.usuario.nombre?.toLowerCase() || "";
        const apellido = a.usuario.apellido?.toLowerCase() || "";
        return `${nombre} ${apellido}`.includes(searchValue);
      });
    },
    enableSorting: false,
  },
  {
    accessorKey: "prioridad",
    header: "Prioridad",
    cell: ({ row }) => <PriorityBadge priority={row.getValue("prioridad")} />,
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => <StatusBadge status={row.getValue("estado")} />,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <ActionsCell row={row} onEdit={onEdit} onDelete={onDelete}/>,
    enableSorting: false,
  },
];
