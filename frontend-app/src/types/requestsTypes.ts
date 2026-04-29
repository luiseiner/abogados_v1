import type { File } from "./fileTypes";
import type { UsuarioSimple } from "./userTypes";
export type CategoriaSolicitud = "tiempo" | "dinero" | "administrativo";

export type EstadoSolicitud =
  | "pendiente"
  | "aprobado"
  | "rechazado"
  | "anulado";


export interface TipoSolicitudSimple {
  id: number;
  nombre: string;
  categoria: CategoriaSolicitud;
}

export interface Solicitud {
  id: number;
  tipo: TipoSolicitudSimple;
  usuario: UsuarioSimple;
  estado: EstadoSolicitud;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  total_horas: string | null;
  total_dias: number | null;
  monto_solicitado: string;
  motivo: string | null;
  fecha_creacion: string;
  actualizado_en: string;
  aprobador: UsuarioSimple | null;
  archivos: File[];
}
