import * as React from "react";
import { Check, ChevronsUpDown, XIcon } from "lucide-react";
import axios from "axios";
import { cn } from "@/lib/utils";
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
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

export function MultiUserCombobox({
  value,
  onChange,
}: {
  value: (string | number)[];
  onChange: (ids: (string | number)[]) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [usuarios, setUsuarios] = React.useState<any[]>([]);
  const { token } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  // Sincronizar el estado interno con el prop value
  // Convertir todos los valores a números para consistencia
  const selectedUsers = React.useMemo(() => {
    return value.map(v => Number(v));
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

  React.useEffect(() => {
    axios
      .get(`${API_URL}/capitalfarmer.co/api/v1/usuarios`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setUsuarios(res.data))
      .catch(() => setUsuarios([]));
  }, [API_URL, token]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-auto min-h-8 w-full justify-between hover:bg-transparent"
        >
          <div className="flex flex-wrap gap-1 pr-2.5">
            {selectedUsers.length > 0 ? (
              selectedUsers.map((userId) => {
                const user = usuarios.find((u) => u.id === userId);

                return user ? (
                  <Badge key={userId} variant="outline">
                    {user.nombre} {user.apellido}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-4 ml-1"
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
              <Label className="opacity-50">Seleccione usuarios...</Label>
            )}
          </div>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0"
        onWheel={(e) => e.stopPropagation()}
      >
        <Command>
          <CommandInput placeholder="Buscar usuario..." className="h-9"/>
          <CommandList>
            <CommandEmpty>No se encontró usuario.</CommandEmpty>
            <CommandGroup>
              {usuarios.map((user) => (
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
                    <div className="text-xs text-gray-500">{user.correo}</div>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto",
                      selectedUsers.includes(user.id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}