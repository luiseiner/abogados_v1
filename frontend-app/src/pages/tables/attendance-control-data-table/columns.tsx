"use client";

import { type ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type Pause = {
  hora_inicio: string;
  hora_fin: string;
  duracion: number;
};

export type Attendance = {
  id: string;
  usuario: number;
  hora_entrada: string;
  hora_salida: string;
  horas_extra: string;
  horas_trabajadas: string;
  nombre_usuario: string;
  apellido_usuario: string;
  estado: string;
  pausas: Pause[];
};

function formatHours(decimalHoras: number | null | undefined): string {
  if (!decimalHoras) return "--:--";

  const horas = Math.floor(decimalHoras);
  const minutos = Math.round((decimalHoras - horas) * 60);

  const partes: string[] = [];

  if (horas > 0) partes.push(`${horas}h`);
  if (minutos > 0) partes.push(`${minutos}m`);

  return partes.length > 0 ? partes.join(" ") : "--:--";
}

const formatTime = (timeString: string) => {
  if (!timeString) return "--:--";

  const [hours, minutes] = timeString.split(":");
  const date = new Date();
  date.setHours(parseInt(hours), parseInt(minutes));

  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

const getBadgeStyles = (status: string) => {
  switch (status.toLowerCase()) {
    case "presente":
      return "border-green-600/10 bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400";
    case "auscente":
      return "border-red-600/10 bg-red-600/10 text-red-600 dark:bg-red-400/10 dark:text-red-400";
    case "en_pausa":
      return "border-amber-600/10 bg-amber-600/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400";
    case "licencia":
      return "border-purple-600/10 bg-purple-600/10 text-purple-600 dark:bg-purple-400/10 dark:text-purple-400";
    case "finalizado":
      return "border-sky-600/10 bg-sky-600/10 text-sky-600 dark:bg-sky-400/10 dark:text-sky-400";
    default:
      return "border-slate-600/10 bg-slate-600/10 text-slate-600 dark:bg-slate-400/10 dark:text-slate-400";
  }
};

export const columns: ColumnDef<Attendance>[] = [
  {
    accessorKey: "usuario",
    header: "Usuario",
    cell: ({ row }) => {
      const nombre = row.original.nombre_usuario;
      const apellido = row.original.apellido_usuario;
      return (
        <span className="truncate block">
          {nombre} {apellido}
        </span>
      );
    },
  },
  {
    accessorKey: "hora_entrada",
    header: "Entrada",
    cell: ({ row }) => {
      const entrada = row.getValue("hora_entrada") as string;
      return <span>{formatTime(entrada)}</span>;
    },
  },
  {
    accessorKey: "pausas",
    header: "Refrigerio",
    cell: ({ row }) => {
      const pausas = row.getValue("pausas") as Pause[];

      if (!pausas || pausas.length === 0) {
        return <span>--:--</span>;
      }

      const pausa = pausas[pausas.length - 1];

      const inicio = pausa.hora_inicio;
      const fin = pausa.hora_fin;
      const duracion = pausa.duracion;

      const extras = pausas.length - 1;

      return (
        <div className="flex items-center gap-2">
          <span>{formatTime(inicio)}</span>

          <span className="text-muted-foreground">|</span>

          <span>{formatHours(duracion)}</span>

          <span className="text-muted-foreground">|</span>

          <span className={formatTime(fin) ? "" : "text-muted-foreground"}>
            {formatTime(fin) ?? "--:--"}
          </span>

          {extras > 0 && (
            <Badge
              className="
                  h-5 min-w-5 rounded-full px-1 font-mono tabular-nums
                  border-sky-600/10 bg-sky-600/10 text-sky-600
                  dark:bg-sky-400/10 dark:text-sky-400
                "
            >
              +{extras}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "hora_salida",
    header: "Salida",
    cell: ({ row }) => {
      const entrada = row.getValue("hora_salida") as string;
      return <span>{formatTime(entrada)}</span>;
    },
  },
  {
    accessorKey: "horas_trabajadas",
    header: "Total",
    cell: ({ row }) => {
      const total = row.getValue("horas_trabajadas") as number;
      return <span>{formatHours(total)}</span>;
    },
  },
  {
    accessorKey: "horas_extra",
    header: "Extra",
    cell: ({ row }) => {
      const extra = row.getValue("horas_extra") as number;
      return <span>{formatHours(extra)}</span>;
    },
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const estado = row.getValue("estado") as string;
      return (
        <Badge
          variant="outline"
          className={`${getBadgeStyles(estado)} capitalize`}
        >
          {estado}
        </Badge>
      );
    },
  },
];
