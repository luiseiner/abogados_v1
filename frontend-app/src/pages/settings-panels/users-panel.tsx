
import { useState, useEffect, useMemo, memo } from "react";

import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal, Search, Plus, Check, X, Trash2, CirclePlus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner"

interface Role {
  id: number;
  nombre: string;
}

interface FormData {
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
  fecha_registro?: Date;
  roles: Role[];
  contrasena?: string;
}

const UserFormDialog = ({
  dialogOpen,
  setDialogOpen,
  isEditMode,
  editingUserId,
  roles,
  initialData,
  onUserUpdate,
  onUserCreate,
}: { dialogOpen: boolean; setDialogOpen: (open: boolean) => void; isEditMode: boolean; editingUserId: number | null; roles: Role[]; initialData: FormData; onUserUpdate: (user: any) => void; onUserCreate: (user: any) => void; }) => {
  const [formData, setFormData] = useState<FormData>(initialData);
  const [open, setOpen] = useState(false);
  const { token } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addRole = (role: Role) => {
    setFormData((prev) => {
      const currentRoles = prev.roles || [];
      if (!currentRoles.find((r) => r.id === role.id)) {
        return { ...prev, roles: [...currentRoles, role] };
      }
      return prev;
    });
    setOpen(false);
  };

  const removeRole = (roleId: number) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.filter((r) => r.id !== roleId),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.apellido || !formData.correo || !formData.roles.length) {
      toast.error("Por favor complete todos los campos obligatorios");
      return;
    }

    const data = {
      nombre: formData.nombre,
      apellido: formData.apellido,
      correo: formData.correo,
      telefono: formData.telefono,
      contrasena: formData.contrasena,
      rol_ids: formData.roles.map((rol) => rol.id),
    };

    const handleSuccess = (res: any) => {
      if (isEditMode) {
        onUserUpdate(res.data);
        toast.success(`${formData.nombre} ${formData.apellido} ha sido actualizado exitosamente`);
      } else {
        onUserCreate(res.data);
        toast.success(`${data.nombre} ${data.apellido} ha sido creado exitosamente`);
      }
      setDialogOpen(false);
    };

    const handleError = () => {
      toast.error(`Error al ${isEditMode ? "actualizar" : "crear"} usuario`);
    };

    if (isEditMode && editingUserId) {
      axios.put(`${API_URL}/capitalfarmer.co/api/v1/usuarios/${editingUserId}`, data, {
        headers: { Authorization: `Bearer ${token}`}
      }).then(handleSuccess).catch(handleError);
    } else {
      axios.post(`${API_URL}/capitalfarmer.co/api/v1/registro`, data, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(handleSuccess).catch(handleError);
    }
  };

  const availableRoles = useMemo(() => {
    return roles.filter((role) => !formData.roles?.find((selectedRole) => selectedRole.id === role.id));
  }, [roles, formData.roles]);


  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setDialogOpen(true)}>
          <CirclePlus className="h-4 w-4" />
          Agregar Usuario
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{isEditMode ? "Editar Datos" : "Crear Nuevo Usuario"}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Modifique los campos necesarios para actualizar la información del usuario."
              : "Complete el formulario para crear un nuevo usuario en el sistema."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nombre"
                name="nombre"
                placeholder="Ingrese nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />

            </div>

            <div className="space-y-2">
              <Label htmlFor="apellido">
                Apellido <span className="text-red-500">*</span>
              </Label>
              <Input
                id="apellido"
                name="apellido"
                placeholder="Ingrese apellido"
                value={formData.apellido}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="correo">
              Correo Electrónico <span className="text-red-500">*</span>
            </Label>
            <Input
              id="correo"
              name="correo"
              type="email"
              placeholder="ejemplo@correo.com"
              value={formData.correo}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              name="telefono"
              type="tel"
              placeholder="987654321"
              value={formData.telefono}
              onChange={handleChange}
            />
          </div>
          {isEditMode && (
            <div className="space-y-2">
              <Label htmlFor="contrasena">Nueva contraseña</Label>
              <Input
                id="contrasena"
                name="contrasena"
                type="text"
                value={formData.contrasena}
                onChange={handleChange}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label>
              Roles <span className="text-red-500">*</span>
            </Label>
            <div className="min-h-[2.5rem] p-2 border rounded-md bg-background">
              {formData.roles?.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay roles seleccionados</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {formData.roles?.map((role) => (
                    <Badge key={role.id} variant="secondary" className="flex items-center gap-1">
                      {role.nombre}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeRole(role.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}

                </div>
              )}
            </div>
            {availableRoles.length > 0 && (
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar rol
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar roles..." />
                    <CommandList>
                      <CommandEmpty>No se encontraron roles.</CommandEmpty>
                      <CommandGroup>
                        {availableRoles.map((role) => (
                          <CommandItem
                            key={role.id}
                            value={role.nombre}
                            onSelect={() => addRole(role)}
                            className="cursor-pointer"
                          >
                            <Check className={cn("mr-2 h-4 w-4", "opacity-0")} />
                            {role.nombre}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
            {formData.roles?.length === 0 && <p className="text-sm text-red-500">Debe seleccionar al menos un rol</p>}
          </div>
          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={formData.roles?.length === 0}>
              {isEditMode ? "Actualizar Usuario" : "Crear Usuario"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// --------------------------------------------------------------------------------
// COMPONENTES MEMOIZADOS
// Estos componentes no se re-renderizarán si sus props no cambian.
// --------------------------------------------------------------------------------
const MemoizedAdditionalRoles = memo(({ roles }: { roles: any[] }) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Badge
              className="cursor-pointer"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setPopoverOpen(true);
              }}
            >
              +{roles.length - 1}
            </Badge>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Ver todos los roles</p>
        </TooltipContent>
      </Tooltip>
      <PopoverContent className="w-60">
        <div className="grid gap-2">
          <h4 className="font-medium leading-none">Todos los roles</h4>
          <div className="grid gap-1">
            {roles.map((rol, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <span>{rol.nombre}</span>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
});

const MemoizedUsersTable = memo(({ users, searchTerm, roleFilter, handleEditUser }: { users: any[], searchTerm: string, roleFilter: string, roles: any[], handleEditUser: (user: any) => void }) => {
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.correo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.telefono?.includes(searchTerm) ||
        user.rol_nombre?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === "all" || user.roles.some((rol: any) => rol.nombre === roleFilter);

      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Correo</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Fecha de registro</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">{user.nombre}{user.apellido && ` ${user.apellido}`}</span>
                </div>
              </TableCell>
              <TableCell>{user.correo}</TableCell>
              <TableCell>{user.telefono || "-"}</TableCell>
              <TableCell>
                {user.fecha_registro
                  ? new Date(user.fecha_registro).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })
                  : "-"}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span>{user.roles[0]?.nombre}</span>
                  {user.roles.length > 1 && <MemoizedAdditionalRoles roles={user.roles} />}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditUser(user)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-400">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Desactivar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
});

// --------------------------------------------------------------------------------
// COMPONENTE PRINCIPAL: UsersPanel
// Ahora solo se encarga de los estados de la lista y los filtros,
// y de renderizar los componentes hijos.
// --------------------------------------------------------------------------------
export default function UsersPanel() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<{ id: number; nombre: string }[]>([]);
  const { token } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_URL}/capitalfarmer.co/api/v1/usuarios`, {
      headers: {
        Authorization: `Bearer ${token}`
      },
    }).then((res) => {
      setUsers(res.data);
    }).catch(() => setError("Error al cargar usuarios")).finally(() => setLoading(false));

    axios.get(`${API_URL}/capitalfarmer.co/api/v1/roles-base`).then((res) => {
      setRoles(res.data);
    });
  }, [API_URL, token]);

  const handleEditUser = (user: any) => {
    setIsEditMode(true);
    setEditingUserId(user.id);
    setEditingUser(user);
    setDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setIsEditMode(false);
      setEditingUserId(null);
      setEditingUser(null);
    }
    setDialogOpen(open);
  };

  const handleUserUpdate = (updatedUser: any) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
  };

  const handleUserCreate = (newUser: any) => {
    setUsers((prev) => [...prev, newUser]);
  };

  const initialFormData = useMemo(() => {
    if (editingUser) {
      return {
        nombre: editingUser.nombre,
        apellido: editingUser.apellido,
        correo: editingUser.correo,
        telefono: editingUser.telefono || "",
        roles: editingUser.roles,
        contrasena: "",
      };
    }
    return {
      nombre: "",
      apellido: "",
      correo: "",
      telefono: "",
      roles: [],
      contrasena: "",
    };
  }, [editingUser]);

  return (

    <div className="space-y-6 mt-4">
      <div className="px-6">
        <Card>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nombre, apellido, correo, teléfono o rol..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.nombre}>{role.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <UserFormDialog
                dialogOpen={dialogOpen}
                setDialogOpen={handleDialogClose}
                isEditMode={isEditMode}
                editingUserId={editingUserId}
                roles={roles}
                initialData={initialFormData}
                onUserUpdate={handleUserUpdate}
                onUserCreate={handleUserCreate}
              />
            </div>
            {loading &&
              <div className="mb-4 text-blue-600 flex items-center gap-2">
                <Spinner />
                Cargando usuarios...
              </div>}
            {error && <div className="mb-4 text-red-600">{error}</div>}
            <MemoizedUsersTable
              users={users}
              searchTerm={searchTerm}
              roleFilter={roleFilter}
              roles={roles}
              handleEditUser={handleEditUser}
            />
          </CardContent>
        </Card>
      </div>


    </div>
  );
}