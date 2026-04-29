"use client";

import { type ColumnDef } from "@tanstack/react-table";
import type { Tarea } from "@/types/caseTypes";
import { StatusBadge } from "@/components/status-badge";
import { PriorityBadge } from "@/components/priority-badge";
import { formatDateShort } from "@/lib/date-time-utils";
import { UserAvatar } from "@/components/user-avatar";

export const columns: ColumnDef<Tarea>[] = [
  {
    accessorKey: "titulo",
    header: "Título",
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const estado = row.getValue("estado") as string;
      return <StatusBadge status={estado} />;
    },
  },
  {
    accessorKey: "prioridad",
    header: "Prioridad",
    cell: ({ row }) => <PriorityBadge priority={row.original.prioridad} />,
  },
  {
    accessorKey: "fecha_inicio",
    header: "Fecha Inicio",
    cell: ({ row }) => {
      const date = row.getValue("fecha_inicio") as string;
      return formatDateShort(date, "Sin fecha");
    },
  },
  {
    accessorKey: "fecha_fin",
    header: "Fecha Fin",
    cell: ({ row }) => {
      const date = row.getValue("fecha_fin") as string;
      return formatDateShort(date, "Sin fecha");
    },
  },
  {
    id: "asignados",
    header: "Asignados",
    accessorFn: (row) =>
      row.asignados?.map((a) => `${a.nombre} ${a.apellido}`).join(", "),
    cell: ({ row }) => {
      const asignados = row.original.asignados;

      if (!asignados || asignados.length === 0) return "—";

      return (
        <div className="flex items-center gap-1">
          <div className="flex -space-x-2">
            {asignados.slice(0, 4).map((member, i) => (
              <UserAvatar
                key={i}
                nombre={member.nombre}
                apellido={member.apellido}
              />
            ))}
            {asignados.length > 4 && (
              <div className="h-7 w-7 rounded-full ring-2 ring-background bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                +{asignados.length - 4}
              </div>
            )}
          </div>
        </div>
      )
    }
  },
];
