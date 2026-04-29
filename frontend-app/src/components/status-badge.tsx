import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Definimos los estilos por estado
const statusStyles: Record<string, string> = {
  pendiente: "border-slate-600/10 bg-slate-600/10 text-slate-600 dark:border-slate-400/10 dark:bg-slate-400/10 dark:text-slate-400",
  en_progreso: "border-yellow-600/10 bg-yellow-600/10 text-yellow-600 dark:border-yellow-400/10 dark:bg-yellow-400/10 dark:text-yellow-400",
  completado: "border-green-600/10 bg-green-600/10 text-green-600 dark:border-green-400/10 dark:bg-green-400/10 dark:text-green-400",
  cancelado: "border-red-600/10 bg-red-600/10 text-red-600 dark:border-red-400/10 dark:bg-red-400/10 dark:text-red-400",
  registrado: "border-blue-600/10 bg-blue-600/10 text-blue-600 dark:border-blue-400/10 dark:bg-blue-400/10 dark:text-blue-400",
  cerrado: "border-green-600/10 bg-green-600/10 text-green-600 dark:border-green-400/10 dark:bg-green-400/10 dark:text-green-400",

  resuelto: "border-green-600/10 bg-green-600/10 text-green-600 dark:border-green-400/10 dark:bg-green-400/10 dark:text-green-400",
  asignado: "border-blue-600/10 bg-blue-600/10 text-blue-600 dark:border-blue-400/10 dark:bg-blue-400/10 dark:text-blue-400",
  en_revision: "border-orange-600/10 bg-orange-600/10 text-orange-600 dark:border-orange-400/10 dark:bg-orange-400/10 dark:text-orange-400",
  por_corregir: "border-purple-600/10 bg-purple-600/10 text-purple-600 dark:border-purple-400/10 dark:bg-purple-400/10 dark:text-purple-400",
  pausado: "border-slate-600/10 bg-slate-600/10 text-slate-600 dark:border-slate-400/10 dark:bg-slate-400/10 dark:text-slate-400",
};

// Formateo de texto (ej: "en_proceso" -> "En Proceso")
const formatStatus = (status: string) => {
  return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

export function StatusBadge({ status }: { status: string }) {

  if (!status) {
    return <span className="text-xs text-slate-4600 dark:text-slate-400 italic">Sin estado</span>;
  }

  const style = statusStyles[status] || "bg-gray-100 text-gray-800";

  return (
    <Badge variant="outline" className={cn("font-medium", style)}>
      {formatStatus(status)}
    </Badge>
  );
}