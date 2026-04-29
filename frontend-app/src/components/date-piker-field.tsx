"use client";

import { useState } from "react";
import { es } from "date-fns/locale";
import { parseISO } from "date-fns";
import { X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { formatDateShort } from "@/lib/date-time-utils";

interface DatePickerFieldProps {
  value: string | null;
  onChange: (date: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function DatePickerField({
  value,
  onChange,
  placeholder = "Agregar fecha",
   disabled = false
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const date = value ? parseISO(value) : undefined;

  return (
    <div className="flex items-center gap-3 ">
      {/* Picker */}
      <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
        <PopoverTrigger asChild>
          
          <button
            disabled={disabled}
            className={cn(
              "flex-1 flex items-center justify-between rounded-md px-2 py-1 text-sm text-left",
              "hover:bg-muted/50 transition-colors",
              !date && "text-muted-foreground",
              disabled && "opacity-60 cursor-default pointer-events-none",
            )}
          >
            <span>{formatDateShort(date, placeholder)}</span>
            {date && !disabled && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(null);
                }}
                className="ml-2 rounded-sm hover:bg-muted p-0.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              onChange(d ? d.toISOString().split("T")[0] : null);
              setOpen(false);
            }}
            autoFocus
            locale={es}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}