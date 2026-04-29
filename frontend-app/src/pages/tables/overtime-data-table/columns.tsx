"use client";

import { type ColumnDef } from "@tanstack/react-table";
import type { MonthlyOvertime } from "@/types/attendanceTypes";


export const columns: ColumnDef<MonthlyOvertime>[] = [
  {
    accessorKey: "usuario.nombre",
    header: "Usuario",
  },
  {
    accessorKey: "horas_extra_total",
    header: "Horas extras",
  },
  {
    accessorKey: "ultimo_aprobador",
    header: "Aprobado por",
  },
  {
    accessorKey: "ultima_fecha_aprobacion",
    header: "Fecha de aprobación",
  },
  {
    accessorKey: "estado_horas_extra",
    header: "Estado",
  },
];
