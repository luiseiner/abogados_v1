"use client";

import { type ColumnDef } from "@tanstack/react-table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { type Solicitud } from "../../../types/requestsTypes";
import { Ellipsis, SquarePen, TextAlignStart, Trash2 } from "lucide-react";

import { getBadgeStyles } from "./utils";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export type CategoriaSolicitud = "tiempo" | "dinero" | "administrativo";

export type EstadoSolicitud =
  | "pendiente"
  | "aprobado"
  | "rechazado"
  | "anulado";

export interface UsuarioSimple {
  id: number;
  nombre: string;
  apellido: string;
}

export interface TipoSolicitudSimple {
  id: number;
  nombre: string;
  categoria: CategoriaSolicitud;
}

const formatLargeDate = (fecha?: string | Date | null): string | null => {
  if (!fecha) return null;

  const date = new Date(fecha);

  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
};

export const columns: ColumnDef<Solicitud, unknown>[] = [
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
    accessorKey: "fecha_creacion",
    header: "Fecha de solicitud",
    cell: ({ row }) => {
      const fechaCreacion = row.getValue("fecha_creacion") as string;
      return <span>{formatLargeDate(fechaCreacion)}</span>;
    },
  },
  {
    accessorKey: "tipo",
    header: "Tipo de solicitud",
    accessorFn: (row) => row.tipo.nombre,
    cell: ({ row }) => (
      <span className="capitalize">{row.original.tipo.nombre}</span>
    ),
    enableSorting: false,
    enableHiding: false,
    meta: {
      filterVariant: "select",
    },
  },
  {
    accessorKey: "motivo",
    header: "Motivo",
    cell: ({ row }) => {
      const motivo = row.getValue("motivo") as string;
      return <span className="capitalize">{motivo}</span>;
    },
    enableSorting: false,
    enableHiding: false,
  },

  {
    accessorKey: "aprobador",
    header: "Evaluado por",
    cell: ({ row }) => {
      const aprobador = row.getValue("aprobador") as UsuarioSimple | null;
      if (!aprobador) {
        return <span className="text-slate-500 italic">Sin aprovador</span>;
      }
      return <span>{`${aprobador.nombre} ${aprobador.apellido}`}</span>;
    },
    enableSorting: false,
    enableHiding: false,
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
    enableSorting: false,
    enableHiding: false,
    meta: {
      filterVariant: "select",
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row, table }) => {
      const solicitud = row.original;
      const openDetails = (table.options.meta as any)?.openDetails;
      const openEdit = (table.options.meta as any)?.openEdit;
      const onDelete = (table.options.meta as any)?.onDelete;
      const isLocked = ["aprobado", "rechazado", "anulado"].includes(
        solicitud.estado,
      );
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <Ellipsis />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openDetails?.(solicitud)}>
              <TextAlignStart />
              Detalles
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={isLocked}
              className={isLocked ? "opacity-50 cursor-not-allowed" : ""}
              onClick={() => !isLocked && openEdit?.(solicitud)} // ACTUALIZADO
            >
              <SquarePen />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              disabled={isLocked}
              className={
                isLocked
                  ? "opacity-50 cursor-not-allowed"
                  : "text-red-600 dark:text-red-400"
              }
              onClick={() => !isLocked && onDelete?.(solicitud)} // Llamada al meta
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
  },
];
