// TaskFormDialog.tsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Tarea } from "@/types/caseTypes";
import { Calendar } from "@/components/ui/calendar";
import {
  CalendarCheck2,
  CalendarClock,
  Check,
  Search,
  Users,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { UsuarioSimple } from "@/types/userTypes";

interface TaskFormDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (data: Omit<Tarea, "id">) => void;
  defaultStatus: Tarea["estado"];
  task?: Tarea | null;
  casoId: number;
  members: UsuarioSimple[];
}

export function TaskFormDialog({
  open,
  onOpenChange,
  onSave,
  defaultStatus,
  task,
  members,
}: TaskFormDialogProps) {
  const { register, handleSubmit, reset, setValue } =
    useForm<Omit<Tarea, "id">>();

  useEffect(() => {
    if (task) {
      reset(task);
      const ids = task.asignados_ids?.map((id) => String(id)) || [];
      setSelected(ids);
    } else {
      reset();
      setSelected([]);
      setFechaInicio(undefined);
      setFechaFin(undefined);
    }
  }, [task, defaultStatus, open, reset]);

  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  const [fechaInicio, setFechaInicio] = useState<Date | undefined>();
const [fechaFin, setFechaFin] = useState<Date | undefined>();

  const USERS = members.map((u) => ({
    id: String(u.id),
    name: `${u.nombre} ${u.apellido}`,
    image: `https://ui-avatars.com/api/?name=${u.nombre}+${u.apellido}`,
  }));

  const toggle = (id: string) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  const filtered = USERS.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()),
  );

  const onSubmit = (data: Omit<Tarea, "id">) => {
    // Función auxiliar para evitar el offset de zona horaria
    const formatDateSafe = (date: Date | undefined) => {
      if (!date) return null;
      // Esto asegura que se tome el año, mes y día local antes de formatear
      return format(date, "yyyy-MM-dd");
    };

    const payload = {
      ...data,
      fecha_inicio: formatDateSafe(fechaInicio),
      fecha_fin: formatDateSafe(fechaFin),
      asignados_ids:
        selected.length > 0 ? selected.map((id) => Number(id)) : [],
    };

    onSave(payload);
  };

  const selectedUsers = USERS.filter((u) => selected.includes(u.id));
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{task ? "Editar tarea" : "Nueva tarea"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            placeholder="Título"
            {...register("titulo", { required: true })}
          />
          <Textarea placeholder="Descripción" {...register("descripcion")} />
          <div className="flex flex-row flex-wrap gap-2 items-center">
            <Select
              onValueChange={(v) =>
                setValue("prioridad", v as Tarea["prioridad"])
              }
              defaultValue={task?.prioridad ?? "Media"}
            >
              <SelectTrigger size="sm">
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Baja">Baja</SelectItem>
                <SelectItem value="Media">Media</SelectItem>
                <SelectItem value="Alta">Alta</SelectItem>
                <SelectItem value="Urgente">Urgente</SelectItem>
              </SelectContent>
            </Select>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  {fechaInicio ? format(fechaInicio, "PPP", { locale: es }) : <CalendarClock />}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fechaInicio}
                  onSelect={setFechaInicio}
                  autoFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  {fechaFin ? format(fechaFin, "PPP", { locale: es }) : <CalendarCheck2 />}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={fechaFin}
                  onSelect={setFechaFin}
                  autoFocus
                  locale={es}
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  {selectedUsers.length === 0 ? (
                    <Users className="size-4" />
                  ) : (
                    // avatares apilados
                    <div className="flex items-center -space-x-2">
                      {selectedUsers.map((user) => (
                        <Avatar
                          key={user.id}
                          className="size-6 ring-2 ring-background"
                        >
                          <AvatarImage src={user.image ?? undefined} />
                          <AvatarFallback className="text-[10px]">
                            {user.name[0]}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-1 border-0 w-1xs" align="start">
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
                    const isSelected = selected.includes(user.id);
                    return (
                      <Button
                        key={user.id}
                        variant="ghost"
                        onClick={() => toggle(user.id)}
                        className="flex w-full flex-row items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent cursor-pointer"
                      >
                        <Avatar className="ring-background" size="sm">
                          <AvatarImage
                            src={user.image ?? undefined}
                            alt={user.name}
                          />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="flex-1 text-left text-xs">
                          {user.name}
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
          </div>
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">{task ? "Guardar" : "Crear"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
