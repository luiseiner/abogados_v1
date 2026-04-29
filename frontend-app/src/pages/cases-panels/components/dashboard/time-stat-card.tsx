// tabs/case-overview-tab/dashboard/time-stat-card.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimeStatCardProps {
  label: string;
  seconds: number;
  description?: React.ReactNode;
  variant?: "default" | "accent" | "muted";
}

function formatSeconds(seconds: number): string {
  if (seconds <= 0) return "0s";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function TimeStatCard({
  label,
  seconds,
  description,
  variant = "default",
}: TimeStatCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden h-full",
        variant === "accent" && "border-primary/40 bg-primary/5",
        variant === "muted" && "bg-muted/40",
      )}
    >
      
      <CardContent className="p-0 h-full flex flex-col">
        {/* Header */}
        <div className="px-4 pt-4 pb-3 border-b flex items-center justify-between">
          <p className="text-sm font-semibold tracking-tight">{label}</p>
          <Clock className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
        </div>

        {/* Body */}
        <div className="px-4 py-4 flex flex-col justify-center flex-1 gap-0.5">
          <p
            className={cn(
              "text-3xl font-bold tabular-nums leading-none",
              variant === "accent" && "text-primary",
            )}
          >
            {formatSeconds(seconds)}
          </p>
          {description && (
            <div className="text-[11px] text-muted-foreground mt-1.5 leading-snug">
              {description}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}