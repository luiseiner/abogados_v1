"use client";

import { useState } from "react";
import { Search, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UsuarioSimple } from "@/types/userTypes";

interface AssigneePickerFieldProps {
  value: UsuarioSimple[];           // asignados actuales
  members: UsuarioSimple[];         // todos los disponibles
  onChange: (users: UsuarioSimple[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function AssigneePickerField({
  value,
  members,
  onChange,
  placeholder = "Sin asignar",
  disabled = false,
}: AssigneePickerFieldProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selectedIds = value.map((u) => u.id);

  const filtered = members.filter((u) =>
    `${u.nombre} ${u.apellido}`.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (user: UsuarioSimple) => {
    const isSelected = selectedIds.includes(user.id);
    if (isSelected) {
      onChange(value.filter((u) => u.id !== user.id));
    } else {
      onChange([...value, user]);
    }
  };

  return (
    <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverTrigger asChild>
        <button
          disabled={disabled}
          className={cn(
            "w-full flex items-center gap-2 rounded-md px-2 py-1 text-sm text-left",
            "hover:bg-muted/50 transition-colors",
            value.length === 0 && "text-muted-foreground",
            disabled && "opacity-60 cursor-default pointer-events-none",
          )}
        >
          {value.length === 0 ? (
            <span>{placeholder}</span>
          ) : (
            <div className="flex items-center gap-2">
              {/* Avatares apilados */}
              <div className="flex items-center -space-x-2">
                {value.slice(0, 3).map((user) => (
                  <Avatar key={user.id} className="size-5 ring-2 ring-background">
                    <AvatarFallback className="text-[10px]">
                      {user.nombre[0]}{user.apellido[0]}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <span className="text-sm text-foreground">
                {value.length === 1
                  ? `${value[0].nombre} ${value[0].apellido}`
                  : `${value.length} asignados`}
              </span>
            </div>
          )}
        </button>
      </PopoverTrigger>

      {/* Content igual al original */}
      <PopoverContent className="p-1 border-0 w-64" align="start">
        <div className="relative">
          <div className="text-muted-foreground pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3">
            <Search className="size-4" />
          </div>
          <Input
            type="text"
            placeholder="Buscar"
            className="peer pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-col pt-2 gap-1">
          {filtered.map((user) => {
            const isSelected = selectedIds.includes(user.id);
            return (
              <Button
                key={user.id}
                variant="ghost"
                onClick={() => toggle(user)}
                className="flex w-full flex-row items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent cursor-pointer"
              >
                <Avatar size="sm" className="ring-background">
                  
                  <AvatarFallback>
                    {user.nombre[0]}{user.apellido[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="flex-1 text-left text-xs">
                  {user.nombre} {user.apellido}
                </span>
                <Check
                  className={cn(
                    "size-4 text-muted-foreground transition-opacity",
                    isSelected ? "opacity-100" : "opacity-0",
                  )}
                />
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}