"use client";

import { useState, useEffect } from "react";
import { ChevronDown, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { AccesoCaso, AsignadoCaso } from "@/types/caseTypes";
import { usersAPI } from "@/services/usersService";

const ACCESOS: { value: AccesoCaso; label: string }[] = [
  { value: "can_view", label: "Lector" },
  { value: "can_edit", label: "Editor" },
  { value: "can_manage", label: "Administrador" },
];

const VISIBLE = 4;

interface UsuarioSimple {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
}

interface MembersDialogProps {
  members: AsignadoCaso[];
  onInvite: (
    asignaciones: { usuario_id: number; acceso: AccesoCaso }[],
  ) => void;
  onRemove: (usuarioId: number) => void;
  onChangeAccess: (usuarioId: number, acceso: AccesoCaso) => void;
  trigger?: React.ReactNode;
}

export function MembersDialog({
  members,
  onInvite,
  onRemove,
  onChangeAccess,
  trigger,
}: MembersDialogProps) {
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [search] = useState("");

  // búsqueda de usuarios para invitar
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UsuarioSimple[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UsuarioSimple[]>([]);
  const [acceso, setAcceso] = useState<AccesoCaso>("can_view");
  const [searching, setSearching] = useState(false);

  const memberIds = new Set(members.map((m) => m.usuario.id));
  const selectedIds = new Set(selectedUsers.map((u) => u.id));

  // busca usuarios mientras escribe
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await usersAPI.getAll(); // GET /usuarios
        setResults(
          data.filter(
            (u: UsuarioSimple) =>
              !memberIds.has(u.id) &&
              !selectedIds.has(u.id) &&
              `${u.nombre} ${u.apellido}`
                .toLowerCase()
                .includes(query.toLowerCase()),
          ),
        );
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const handleInvite = () => {
    if (selectedUsers.length === 0) return;
    onInvite(selectedUsers.map((u) => ({ usuario_id: u.id, acceso })));
    setSelectedUsers([]);
    setQuery("");
    setResults([]);
    setAcceso("can_view");
  };

  const filtered = members.filter((m) =>
    `${m.usuario.nombre} ${m.usuario.apellido}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const visible = showAll ? filtered : filtered.slice(0, VISIBLE);
  const hidden = filtered.length - VISIBLE;

  return (
    <>
      <div onClick={() => setOpen(true)}>
        {trigger ?? (
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 gap-1.5 text-xs"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Agregar
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Miembros del caso</DialogTitle>
            <DialogDescription>
              Gestiona quién puede ver y editar este caso.
            </DialogDescription>
          </DialogHeader>
          {/* Invitar nuevo miembro */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2 md:flex-row">
              <div className="relative flex-4">
                <div
                  className="flex flex-wrap items-center gap-1.5 min-h-8 px-2 py-1 border border-input rounded-md bg-background focus-within:ring-1 focus-within:ring-ring cursor-text"
                  onClick={() =>
                    document.getElementById("member-search")?.focus()
                  }
                >
                  {/* Badges de usuarios seleccionados */}
                  {selectedUsers.map((u) => (
                    <span
                      key={u.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 text-xs font-medium shrink-0"
                    >
                      {u.nombre} {u.apellido}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUsers((prev) =>
                            prev.filter((x) => x.id !== u.id),
                          );
                        }}
                        className="hover:text-blue-800 dark:hover:text-blue-200 transition-colors"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}

                  {/* Input de búsqueda inline */}
                  <input
                    id="member-search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={
                      selectedUsers.length === 0 ? "Buscar usuario..." : ""
                    }
                    className="flex-1 min-w-24 bg-transparent text-sm outline-none placeholder:text-muted-foreground h-6"
                  />
                </div>

                {/* Contenedor de resultados de búsqueda */}
                {(searching || results.length > 0) && (
                  <div className="absolute top-full mt-1 left-0 right-0 bg-background border rounded-md shadow-md z-10 max-h-40 overflow-y-auto">
                    {searching ? (
                      // Estado de carga (puedes usar un icono de Loader2 de lucide-react si lo prefieres)
                      <div className="flex items-center justify-center gap-2 px-3 py-4 text-xs text-muted-foreground">
                        <div className="size-3 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                        Buscando usuarios...
                      </div>
                    ) : (
                      // Lista de resultados
                      results.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => {
                            setSelectedUsers((prev) => [...prev, u]);
                            setQuery("");
                            setResults([]);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/50 text-left transition-colors"
                        >
                          <Avatar className="size-6 shrink-0">
                            <AvatarFallback className="text-[9px]">
                              {u.nombre[0]}
                              {u.apellido[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="flex-1 truncate">
                            {u.nombre} {u.apellido}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {u.correo}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              <Button className="flex-1 h-8" onClick={handleInvite}>
                Agregar
              </Button>
            </div>
          </div>

          {/* Lista de miembros actuales */}
          <div className="flex flex-col gap-0.5 max-h-52 overflow-y-auto -mx-1 px-1">
            {visible.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Sin miembros asignados
              </p>
            ) : (
              visible.map((m) => (
                <div
                  key={m.usuario.id}
                  className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="size-7 shrink-0">
                    <AvatarFallback className="text-[10px]">
                      {m.usuario.nombre[0]}
                      {m.usuario.apellido[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate leading-tight">
                      {m.usuario.nombre} {m.usuario.apellido}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0">
                        {ACCESOS.find((a) => a.value === m.acceso)?.label ??
                          m.acceso}
                        <ChevronDown className="size-3" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      {ACCESOS.map((a) => (
                        <DropdownMenuItem
                          key={a.value}
                          onClick={() => onChangeAccess(m.usuario.id, a.value)}
                          className={m.acceso === a.value ? "bg-muted" : ""}
                        >
                          {a.label}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onRemove(m.usuario.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        Remover
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))
            )}
            {filtered.length > VISIBLE && (
              <button
                onClick={() => setShowAll((p) => !p)}
                className="text-xs text-muted-foreground text-center py-1.5 hover:text-foreground transition-colors"
              >
                {showAll ? "Ver menos" : `Ver ${hidden} más`}
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
