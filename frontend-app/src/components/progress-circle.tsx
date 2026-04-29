import { Badge } from "@/components/ui/badge"

// ─── Tipos ────────────────────────────────────────────────────────────────────

type ProgressMode =
  | { mode?: "percent"; value: number }          // 0–100
  | { mode: "fraction"; done: number; total: number } // ej: 2/3

interface ProgressBadgeBaseProps {
  size?: number
  label?: string
  showBadge?: boolean
  color?: string
}

type ProgressBadgeProps = ProgressBadgeBaseProps & ProgressMode

// ─── Componente ───────────────────────────────────────────────────────────────

export function ProgressBadge(props: ProgressBadgeProps) {
  const { size = 20, label = "Sub-work items", showBadge = false, color } = props

  // Calcular value (0–100) y texto a mostrar según el modo
  const { percentage, displayText } = (() => {
    if (props.mode === "fraction") {
      const { done, total } = props
      const pct = total === 0 ? 0 : Math.round((done / total) * 100)
      return { percentage: pct, displayText: `${done}/${total} Completadas` }
    }
    const pct = props.value ?? 0
    return { percentage: pct, displayText: `${pct}%` }
  })()

  const radius = 9
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference

  const progressColor = color ?? "text-green-600 dark:text-green-400"

  return (
    <div className="flex items-center gap-2">
      {label && (
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      )}

      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md">
        {/* Círculo de progreso */}
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="2.5"
            fill="transparent"
            className="text-muted/30"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth="2.5"
            fill="transparent"
            strokeDasharray={circumference}
            style={{ strokeDashoffset: offset }}
            strokeLinecap="round"
            className={`${progressColor} transition-all duration-500 ease-in-out`}
          />
        </svg>

        <span className="text-sm font-medium text-foreground">
          {displayText}
        </span>
      </div>

      {showBadge && (
        <Badge variant="outline" className="bg-amber-400/10 text-amber-600 border-amber-200">
          {percentage}%
        </Badge>
      )}
    </div>
  )
}