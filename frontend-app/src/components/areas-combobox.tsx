import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import axios from "axios"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useAuth } from "@/context/AuthContext"

export function ComboboxAreas({
  value,
  onChange,
}: {
  value: string | number;
  onChange: (id: string | number) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [areas, setAreas] = React.useState<any[]>([]);
  const { token } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  React.useEffect(() => {
    axios
      .get(`${API_URL}/capitalfarmer.co/api/v1/areas`, {
        headers: {
          Authorization: `Bearer ${token}`,

        }
      })
      .then((res) => setAreas(res.data))
      .catch(() => setAreas([]))
  }, [API_URL, token]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-muted-foreground"
        >
          {value
            ? areas.find((area) => area.id.toString() === value.toString())?.nombre
            : "Seleccione área..."}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" onWheel={e => e.stopPropagation()}>
        <Command>
          <CommandInput placeholder="Buscar usuario..." className="h-9" />
          <CommandList>
            <CommandEmpty>No se encontró área.</CommandEmpty>
            <CommandGroup>
              {areas.map((area) => (
                <CommandItem
                  key={area.id}
                  value={area.id.toString()}
                  onSelect={() => {
                    setOpen(false);
                    onChange(area.id);
                  }}
                >
                  <div>
                    <div>{area.nombre}</div>
                    <div className="text-xs text-gray-500">{area.correo}</div>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto",
                      value === area.id ? "opacity-100" : "opacity-0"
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