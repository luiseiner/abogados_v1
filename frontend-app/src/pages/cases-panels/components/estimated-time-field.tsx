import { useState, useRef, useEffect } from "react";
import { X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface EstimatedTimeFieldProps {
  value?: number | null;          // minutos
  onChange?: (minutes: number | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

// Parsear strings como "1h 30m", "90m", "2h", "45" (asume minutos)
function parseTimeInput(raw: string): number | null {
  const s = raw.trim().toLowerCase();
  if (!s) return null;

  const hoursMatch = s.match(/(\d+)\s*h/);
  const minsMatch = s.match(/(\d+)\s*m/);

  if (hoursMatch || minsMatch) {
    const h = hoursMatch ? parseInt(hoursMatch[1]) : 0;
    const m = minsMatch ? parseInt(minsMatch[1]) : 0;
    const total = h * 60 + m;
    return total > 0 ? total : null;
  }

  // Solo número: asumir minutos
  const num = parseInt(s);
  return isNaN(num) || num <= 0 ? null : num;
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function EstimatedTimeField({
  value,
  onChange,
  disabled = false,
  placeholder = "Estimar tiempo",
}: EstimatedTimeFieldProps) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setInputValue(value ? formatMinutes(value) : "");
      setError(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [editing]);

  const handleCommit = () => {
    if (!inputValue.trim()) {
      onChange?.(null);
      setEditing(false);
      return;
    }
    const parsed = parseTimeInput(inputValue);
    if (parsed === null) {
      setError(true);
      return;
    }
    onChange?.(parsed);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleCommit();
    if (e.key === "Escape") setEditing(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.(null);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => { setInputValue(e.target.value); setError(false); }}
          onKeyDown={handleKeyDown}
          onBlur={handleCommit}
          placeholder="ej: 1h 30m"
          className={cn(
            "h-7 w-28 rounded-md border bg-background px-2 font-mono text-sm outline-none",
            error
              ? "border-destructive text-destructive"
              : "border-input focus:border-ring"
          )}
        />
        <button
          type="button"
          onMouseDown={(e) => { e.preventDefault(); handleCommit(); }}
          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-foreground"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
        {error && (
          <span className="text-xs text-destructive">ej: 1h 30m</span>
        )}
      </div>
    );
  }

  if (!value) {
    return (
      <button
        type="button"
        onClick={() => !disabled && setEditing(true)}
        disabled={disabled}
        className="text-sm text-muted-foreground hover:text-foreground disabled:cursor-default disabled:opacity-50 transition-colors"
      >
        {placeholder}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 group">
      <button
        type="button"
        onClick={() => !disabled && setEditing(true)}
        disabled={disabled}
        className="font-mono text-sm text-foreground hover:text-foreground/80 disabled:cursor-default transition-colors"
      >
        {formatMinutes(value)}
      </button>
      {!disabled && (
        <button
          type="button"
          onClick={handleClear}
          className="hidden group-hover:flex h-4 w-4 items-center justify-center rounded text-muted-foreground hover:text-destructive transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}