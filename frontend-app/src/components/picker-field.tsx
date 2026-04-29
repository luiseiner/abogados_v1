"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface PickerOption {
  value: string;
  label: React.ReactNode;   // acepta texto, badge, icon+texto, lo que sea
  triggerLabel?: React.ReactNode; // si el trigger debe verse distinto al item del menú
}

interface PickerFieldProps {
  value: string | null;
  onChange: (value: string) => void;
  options: PickerOption[];
  placeholder?: string;
  popoverWidth?: string;
  align?: "start" | "center" | "end";
  triggerClassName?: string;
  disabled?: boolean;
}

export function PickerField({
  value,
  onChange,
  options,
  placeholder = "Sin valor",
  popoverWidth = "w-44",
  align = "start",
  triggerClassName,
  disabled = false,
}: PickerFieldProps) {
  const [open, setOpen] = useState(false);

  const selected = options.find((o) => o.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          disabled={disabled}
          className={cn(
            "inline-flex items-center rounded-md px-2 py-1 text-sm text-left",
            "hover:bg-muted/50 transition-colors",
            !value && "text-muted-foreground",
            triggerClassName,
            disabled && "opacity-60 cursor-default pointer-events-none",
          )}
        >
          {selected ? (
            (selected.triggerLabel ?? selected.label)
          ) : (
            <span>{placeholder}</span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent className={cn(popoverWidth, "p-1")} align={align}>
        <div className="flex flex-col gap-0.5">
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm",
                "hover:bg-muted transition-colors",
                value === o.value && "bg-muted",
              )}
            >
              {o.label}
              {value === o.value && (
                <Check className="h-3.5 w-3.5 ml-auto text-muted-foreground shrink-0" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}