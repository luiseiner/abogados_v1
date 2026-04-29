"use client";

import { type ColumnDef } from "@tanstack/react-table";

export interface UsuarioSimple {
  id: number;
  nombre: string;
  apellido: string;
}

export interface VacacionPeriodo {
  id: number;
  usuario_id: number;
  usuario: UsuarioSimple; // Reutiliza tu interfaz existente
  periodo_inicio: string; // ISO Date
  periodo_fin: string;    // ISO Date
  dias_ganados: number;
  dias_tomados: number;
  dias_pendientes: number; // Campo calculado en backend o frontend
  fecha_limite: string;   // ISO Date
  is_active: boolean;
  periodo_disfrute: string; // Ej: "03/06/2026 - 03/06/2027"
  created_at: string;
}

const formatLargeDate = (
  fecha?: string | Date | null
): string | null => {
  if (!fecha) return null;

  const date = new Date(fecha);

  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const formatRangeDate = (rango?: string | null): string | null => {
  if (!rango) return null;
  
  // Separamos el string por el guion
  const partes = rango.split(' - ');
  if (partes.length !== 2) return rango; // Si no tiene el formato esperado, devolvemos el original

  // Formateamos cada parte usando tu lógica original (ajustada para parsear DD/MM/YYYY)
  const formatPart = (f: string) => {
    const [day, month, year] = f.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  return `${formatPart(partes[0])} - ${formatPart(partes[1])}`;
};

export const columns: ColumnDef<VacacionPeriodo>[] = [
  {
    accessorKey: "usuario",
    header: "Usuario",
    accessorFn: (row) => `${row.usuario.nombre} ${row.usuario.apellido}`,
    cell: ({ row }) => (
      <span>
        {row.original.usuario.nombre} {row.original.usuario.apellido}
      </span>
    ),
  },
  {
    accessorKey: "",
    header: "Fecha de ingreso",
  },
  {
    accessorKey: "periodo_inicio",
    header: "Periodo ganado",
  },
  {
    accessorKey: "dias_ganados",
    header: "Días ganados",
  },
  {
    accessorKey: "periodo_disfrute",
    header: "Periodo de disfrute",
    cell: ({ getValue }) => {
      const valor = getValue<string>();
      return formatRangeDate(valor);
    }
  },
  {
    accessorKey: "dias_tomados",
    header: "Días Tomados",
  },
  {
    accessorKey: "fecha_limite",
    header: "Fecha Límite",
    cell: ({ getValue }) => formatLargeDate(getValue<string>()),
  },
];
