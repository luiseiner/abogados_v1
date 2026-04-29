"use client";

import { type ColumnDef } from "@tanstack/react-table";
import type { Ticket } from "@/types/ticketTypes";
import { UserAvatar } from "@/components/user-avatar";
import { PriorityBadge } from "@/components/priority-badge";
import { StatusBadge } from "@/components/status-badge";

export const columns: ColumnDef<Ticket>[] = [
  {
    accessorKey: "codigo",
    header: "Codigo",
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
  },
  {
    accessorKey: "responsable",
    header: "Responsable",
    cell: ({ row }) => {
    const responsable = row.original.responsable;
    if (!responsable) return "—";
    return (
      <UserAvatar
        nombre={responsable.nombre}
        apellido={responsable.apellido}
      />
    );
  },
  },
  {
    accessorKey: "asignados",
    header: "Asignado(s)",
    cell: ({ row }) => {
      const asignados = row.original.asignados;

      if (!asignados || asignados.length === 0) return "—";

      return (
        <div className="flex items-center gap-1">
          <div className="flex -space-x-2">
            {asignados.slice(0, 4).map((assigne, i) => (
              <UserAvatar
                key={i}
                nombre={assigne.nombre}
                apellido={assigne.apellido}
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
    // cell: ({ row }) => <ActionsCell row={row} onEdit={onEdit} />,
    enableSorting: false,
  },
];
