import { StatusBadge } from "@/components/status-badge";
import type { PickerOption } from "@/components/picker-field";
import { PriorityBadge } from "@/components/priority-badge";

export const CASE_STATUSES: PickerOption[] = [
  { value: "registrado",  label: <StatusBadge status="registrado" /> },
  { value: "en_progreso", label: <StatusBadge status="en_progreso" /> },
  { value: "cerrado",     label: <StatusBadge status="cerrado" /> },
  { value: "cancelado",   label: <StatusBadge status="cancelado" /> },
];

export const TASK_STATUSES: PickerOption[] = [
  { value: "pendiente",   label: <StatusBadge status="pendiente" /> },
  { value: "en_progreso", label: <StatusBadge status="en_progreso" /> },
  { value: "completado",  label: <StatusBadge status="completado" /> },
  { value: "cancelado",   label: <StatusBadge status="cancelado" /> },
];

export const PRIORITIES: PickerOption[] = [
  { value: "baja",   label: <PriorityBadge priority="baja" /> },
  { value: "media",  label: <PriorityBadge priority="media" /> },
  { value: "alta",   label: <PriorityBadge priority="alta" /> },
  { value: "urgente", label: <PriorityBadge priority="urgente" /> },
];
