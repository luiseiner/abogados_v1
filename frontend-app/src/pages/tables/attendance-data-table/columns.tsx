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

export const columns: ColumnDef<Attendance>[] = [
  {
    accessorKey: "fecha",
    header: "Fecha",
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
        return <span className="text-muted-foreground">--:--</span>;
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

          <span className="text-sm">{formatHours(duracion)}</span>

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
];
