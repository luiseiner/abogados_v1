import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

export function formatDateShort(
  date: Date | string | number | null | undefined,
  placeholder = "",
): string {
  if (!date) return placeholder;

  try {
    const d = typeof date === "string" ? parseISO(date) : new Date(date);
    if (isNaN(d.getTime())) return placeholder;
    return format(d, "dd MMM yyyy", { locale: es }).replace(".", "");
  } catch (error) {
    return placeholder;
  }
}
