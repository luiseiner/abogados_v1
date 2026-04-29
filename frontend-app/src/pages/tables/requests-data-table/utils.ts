export const getBadgeStyles = (status: string) => {
  switch (status.toLowerCase()) {
    case "aprobado":
      return "border-green-600/10 bg-green-600/10 text-green-600 dark:border-green-400/10 dark:bg-green-400/10 dark:text-green-400";
    case "rechazado":
      return "border-red-600/10 bg-red-600/10 text-red-600 dark:border-red-400/10 dark:bg-red-400/10 dark:text-red-400";
    case "pendiente":
      return "border-yellow-600/10 bg-yellow-600/10 text-yellow-600 dark:border-yellow-400/10 dark:bg-yellow-400/10 dark:text-yellow-400";
    default:
      return "border-slate-600/10 bg-slate-600/10 text-slate-600 dark:border-slate-400/10 dark:bg-slate-400/10 dark:text-slate-400";
  }
};

export const formatFullDate = (fecha?: string | Date | null): string | null => {
  if (!fecha) return null;
  const date = new Date(fecha);
  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export function formatHours(decimalHoras: number | null | undefined): string {
  if (!decimalHoras) return "--:--";

  const horas = Math.floor(decimalHoras);
  const minutos = Math.round((decimalHoras - horas) * 60);

  const partes: string[] = [];

  if (horas > 0) partes.push(`${horas}h`);
  if (minutos > 0) partes.push(`${minutos}m`);

  return partes.length > 0 ? partes.join(" ") : "--:--";
}