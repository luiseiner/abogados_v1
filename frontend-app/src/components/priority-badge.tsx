import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertCircle, ArrowDown, ArrowUp, Zap } from "lucide-react";

const priorityConfig: Record<string, { style: string; icon: any }> = {
  
  baja: {
    style: "border-blue-600/10 bg-blue-600/10 text-blue-600 dark:border-blue-400/10 dark:bg-blue-400/10 dark:text-blue-400",
    icon: ArrowDown,
  },
  media: {
    style: "border-yellow-600/10 bg-yellow-600/10 text-yellow-600 dark:border-yellow-400/10 dark:bg-yellow-400/10 dark:text-yellow-400",
    icon: ArrowUp,
  },
  alta: {
    style: "border-orange-600/10 bg-orange-600/10 text-orange-600 dark:border-orange-400/10 dark:bg-orange-400/10 dark:text-orange-400",
    icon: AlertCircle,
  },
  urgente: {
    style: "border-red-600/10 bg-red-600/10 text-red-600 dark:border-red-400/10 dark:bg-red-400/10 dark:text-red-400",
    icon: Zap,
  },
};

export function PriorityBadge({ priority }: { priority: string }) {
  const config = priorityConfig[priority] || priorityConfig["baja"];
  const Icon = config.icon;

  if (!priority) {
    return <span className="text-xs text-slate-600 dark:text-slate-400 italic">Sin prioridad</span>;
  }

  return (
    <Badge 
      variant="outline" 
      className={cn("flex items-center w-fit gap-1 px-2 py-0.5 font-semibold", config.style)}
    >
      <Icon className="w-3 h-3" />
      {priority}
    </Badge>
  );
}