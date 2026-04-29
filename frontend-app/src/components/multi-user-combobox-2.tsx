"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { Check, ChevronsUpDownIcon, XIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { usersAPI } from "@/services/usersService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function MultiUserCombobox2({
  value = [],
  onChange,
}: {
  value: (string | number)[];
  onChange: (ids: (string | number)[]) => void;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [usersData, setUsersData] = useState<any[]>([]);

  const selectedUsers = useMemo(() => {
    return (value ?? []).map((v) => Number(v));
  }, [value]);

  const toggleSelection = (userId: number) => {
    const newSelection = selectedUsers.includes(userId)
      ? selectedUsers.filter((id) => id !== userId)
      : [...selectedUsers, userId];

    onChange(newSelection);
  };

  const removeSelection = (userId: number) => {
    const newSelection = selectedUsers.filter((id) => id !== userId);
    onChange(newSelection);
  };

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await usersAPI.getAll();
      setUsersData(response);
    } catch (error: any) {
      toast.error("Error al obtener los usuarios:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-auto min-h-8 w-full justify-between hover:bg-transparent"
        >
          <div className="flex flex-wrap items-center gap-1 pr-2.5">
            {selectedUsers.length > 0 ? (
              selectedUsers.map((userId) => {
                const user = usersData.find((u) => u.id === userId);

                return user ? (
                  <Badge key={userId} variant="outline" className="rounded-sm">
                    {user.nombre} {user.apellido}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSelection(userId);
                      }}
                      asChild
                    >
                      <span>
                        <XIcon className="size-3" />
                      </span>
                    </Button>
                  </Badge>
                ) : null;
              })
            ) : (
              <span className="text-muted-foreground">Slecciona usuarios</span>
            )}
          </div>
          <ChevronsUpDownIcon
            className="text-muted-foreground/80 shrink-0"
            aria-hidden="true"
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        onWheel={(e) => e.stopPropagation()}
      >
        <Command>
          <CommandInput placeholder="Buscar usuario..." />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                {/* Puedes usar un icono de carga aquí */}
                <span className="animate-pulse">Cargando usuarios...</span>
              </div>
            ) : (
              <>
                <CommandEmpty>No se encontraron usuarios.</CommandEmpty>
                <CommandGroup>
                  {usersData.map((user) => (
                    <CommandItem
                      key={user.id}
                      value={`${user.nombre} ${user.apellido} ${user.correo}`.toLowerCase()}
                      onSelect={() => {
                        toggleSelection(user.id);
                        setOpen(true);
                      }}
                    >
                      <div>
                        <div>
                          {user.nombre} {user.apellido}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.correo}
                        </div>
                      </div>
                      <Check
                        className={cn(
                          "ml-auto",
                          selectedUsers.includes(user.id)
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
