import type { UsuarioSimple } from "@/types/userTypes";

export type TipoTicket = "incidente" | "problema" | "pregunta" | "sugerencia";
export type PrioridadTicket = "baja" | "media" | "alta";
export type EstadoTicket =
  | "asignado"
  | "en_progreso"
  | "en_revision"
  | "por_corregir"
  | "pausado"
  | "resuelto"
  | "cancelado";

export interface PausaTicketOut {
  id: number;
  fecha_hora: string | null;
}

export interface ReanudacionTicketOut {
  id: number;
  fecha_hora: string | null;
}

export interface Ticket {
  id: number;
  codigo: string;
  area_id: number | null;
  nombre: string | null;
  descripcion: string | null;
  tipo?: string | null;
  responsable_id: number | null;
  responsable: UsuarioSimple | null;
  prioridad: PrioridadTicket | null;
  fecha_inicio: string | null;
  fecha_finalizacion: string | null;
  tiempo_total: number | null;
  estado: string | null;
  observaciones: string | null;
  is_active: number;
  revision: number;
  asignados: UsuarioSimple[];
  pausas: PausaTicketOut[];
  reanudaciones: ReanudacionTicketOut[];
}

export interface TicketCreate {
  nombre: string;
  area_id: number;
  descripcion?: string | null;
  tipo?: string | null;
  responsable_id?: number | null;
  prioridad?: PrioridadTicket | null;
  fecha_inicio?: string | null;
  fecha_finalizacion?: string | null;
  tiempo_total?: number | null;
  estado?: string | null;
  observaciones?: string | null;
  is_active?: number;
  revision?: number;
  asignados?: number[];
}

export interface TicketUpdate {
  area_id?: number | null;
  nombre?: string | null;
  descripcion?: string | null;
  tipo?: string | null;
  responsable_id?: number | null;
  prioridad?: PrioridadTicket | null;
  fecha_inicio?: string | null;
  fecha_finalizacion?: string | null;
  tiempo_total?: number | null;
  estado?: string | null;
  observaciones?: string | null;
  revision?: number | null;
  asignados?: number[] | null;
}

