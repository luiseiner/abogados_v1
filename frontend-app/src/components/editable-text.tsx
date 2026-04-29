import { useState } from "react";
import { Pencil, Check, X } from "lucide-react";

interface EditableTextProps {
  value: string;
  danger?: boolean;
  rows?: number;
  variant?: "default" | "title";
  onSave?: (val: string) => void;
}

export function EditableText({
  value,
  danger,
  rows = 3,
  variant = "default",
  onSave,
}: EditableTextProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const handleSave = () => {
    setEditing(false);
    if (draft !== value) onSave?.(draft);
  };

  const handleCancel = () => {
    setDraft(value);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") handleCancel();
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  if (editing) {
    if (variant === "title") {
      return (
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleSave}  // guarda al perder foco, sin botones
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }}
          className="w-full bg-transparent border-b border-input focus:outline-none focus:border-primary text-2xl font-semibold leading-snug"
        />
      );
    }
    
    return (
      <div className="flex flex-col gap-1.5">
        <textarea
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={rows}
          className={`w-full resize-none rounded-md border border-input bg-background px-2.5 py-1.5 text-sm leading-relaxed focus:outline-none focus:ring-1 focus:ring-ring ${
            danger ? "text-red-600 dark:text-red-400" : ""
          }`}
        />
        <div className="flex items-center gap-1.5 justify-end">
          <button
            onClick={handleCancel}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="size-3" />
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
          >
            <Check className="size-3" />
            Guardar
          </button>
        </div>
      </div>
    );
  }
  if (variant === "title") {
    return (
      <div className="group flex items-center gap-2">
        <span className="flex-1">{value}</span>
        {onSave && (
          <button
            onClick={() => setEditing(true)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-muted text-muted-foreground cursor-pointer"
          >
            <Pencil className="size-3.5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="group flex items-start gap-2 rounded-md px-2 py-1.5 -mx-2 transition-colors hover:bg-muted/50">
      <p
        className={`flex-1 text-sm leading-relaxed ${danger ? "text-red-600 dark:text-red-400" : ""}`}
      >
        {value || (
          <span className="text-muted-foreground italic">Sin contenido...</span>
        )}
      </p>
      {onSave && (
        <button
          onClick={() => setEditing(true)}
          className="shrink-0 mt-0.5 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
          aria-label="Editar"
        >
          <Pencil className="size-3" />
        </button>
      )}
    </div>
  );
}
