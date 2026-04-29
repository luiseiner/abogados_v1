"use client";

import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import {
  InteractiveStepper,
  InteractiveStepperContent,
  InteractiveStepperIndicator,
  InteractiveStepperItem,
  InteractiveStepperSeparator,
  InteractiveStepperTitle,
  InteractiveStepperTrigger,
  type IStepperMethods,
} from "@/components/ui/interactive-stepper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRef, useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { HelpCircle, Plus, Search, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SelectGroup } from "@radix-ui/react-select";

export const areaSchema = z.object({
  nombre: z.string().min(1, "El nombre del área es obligatorio"),
  correo: z
    .string()
    .email("Correo inválido")
    .min(1, "El correo es obligatorio"),
  permisos: z.array(z.number()).min(1, "Debes seleccionar al menos un permiso"),
  roles: z
    .array(
      z.object({
        nombre: z.string().min(1, "El nombre del rol es obligatorio"),
        permiso_ids: z
          .array(z.number())
          .min(1, "Selecciona al menos un permiso para el rol"),
      })
    )
    .min(1, "Debes crear al menos un rol"),
  administradores: z
    .array(z.number())
    .min(1, "Selecciona al menos un administrador"),
  usuarios: z.array(z.number()).min(1, "Selecciona al menos un usuario"),
});
// interface Area {
//   nombre: string;
//   administradores: number[];
//   usuarios: number[];
//   roles: Role[];
// }

interface Permission {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  modulo: string;
}

interface Role {
  id?: number | null;
  nombre: string;
  permiso_ids?: number[];
  user_ids?: number[];
}

interface User {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  avatar?: string;
  telefono: string;
}

const InteractiveStepperExternalInteractions = () => {
  const location = useLocation();
  const stepperRef = useRef<HTMLDivElement & IStepperMethods>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [permissionSearchTerm, setPermissionSearchTerm] = useState("");
  const isEditMode = location.state?.isEditMode || false;
  const [roleName, setRoleName] = useState<string | null>(null);
  const navigate = useNavigate();
 
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [_isEditingRole, setIsEditingRole] = useState(false);
  const [idToEditRole, setIdToEditRole] = useState<number | null>(null);

  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [employeeSelectedSearchTerm, setEmployeeSelectedSearchTerm] =
    useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [selectedPermissionsRole, setSelectedPermissionsRole] = useState<
    number[]
  >([]);

  const [userRoles, setUserRoles] = useState<Record<number, string>>({});

  const [areaNombre, setAreaNombre] = useState("");
  const [areaCorreo, setAreaCorreo] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;
  const token = useAuth().token;

  useEffect(() => {
    axios
      .get(`${API_URL}/capitalfarmer.co/api/v1/permisos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setPermissions(res.data);
      })
      .catch(() => setError("Error al cargar permisos"))
      .finally(() => setLoading(false));

    axios
      .get(`${API_URL}/capitalfarmer.co/api/v1/usuarios`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setUsers(response.data);
      });
  }, [API_URL, token]);

  // useEffect para actualizar currentStep si cambia en el stepper
  useEffect(() => {
    const interval = setInterval(() => {
      if (
        stepperRef.current &&
        stepperRef.current.currentStep !== currentStep
      ) {
        setCurrentStep(stepperRef.current.currentStep);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [currentStep]);

  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      axios.get(`${API_URL}/capitalfarmer.co/api/v1/areas/${location.state?.area.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          const areaData = response.data;
          setAreaNombre(areaData.nombre || "");
          setAreaCorreo(areaData.correo || "");

          if (areaData.permisos) {
            setSelectedPermissions(areaData.permisos);
          }

          if (areaData.roles) {
            setRoles(areaData.roles);
          }

          if (areaData.usuarios) {
            setSelectedEmployees(areaData.usuarios);
          }

          if (areaData.roles) {
            const rolesMap: Record<number, string> = {};
            areaData.roles.forEach((role: Role) => {
              if (role.user_ids) {
                role.user_ids.forEach((userId: number) => {
                  rolesMap[userId] = role.nombre;
                  
                });
              }
            });
            
            setUserRoles(rolesMap);
          }

          // if (areaData.usuarios) {
          //   const rolesMap: Record<number, number[]> = {};
          //   areaData.usuarios.forEach((user: any) => {
          //     rolesMap[user.id] = user.rol_ids; // guarda el array de roles completo
          //   });
          //   setUserRoles(rolesMap);
          // }
        })
        .catch((error) => {
          setError("Error al cargar el área");
          console.error("Error fetching area:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isEditMode, API_URL, token]);

  const filteredPermissions = permissions.filter(
    (permission) =>
      permission.nombre
        .toLowerCase()
        .includes(permissionSearchTerm.toLowerCase()) ||
      permission.modulo
        .toLowerCase()
        .includes(permissionSearchTerm.toLowerCase())
  );

  const groupedPermissions = filteredPermissions.reduce((acc, permission) => {
    if (!acc[permission.modulo]) {
      acc[permission.modulo] = [];
    }
    acc[permission.modulo].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const filteredUsers = users.filter(
    (user) =>
      user.nombre.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.apellido.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.correo.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const handleEmployeeToggle = (userId: number) => {
    setSelectedEmployees((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handlePermissionRoleToggle = (permissionId: number) => {
    setSelectedPermissionsRole((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };


  const handleNext = () => {
    stepperRef.current?.nextStep();
    setTimeout(() => {
      setCurrentStep(stepperRef.current?.currentStep ?? 1);
    }, 0);
  };

  const handlePrev = () => {
    stepperRef.current?.prevStep();
    setTimeout(() => {
      setCurrentStep(stepperRef.current?.currentStep ?? 1);
    }, 0);
  };


  const addRoleToList = () => {
    
    if (!roleName || roleName.trim() === "") {
      setError("El nombre del rol es obligatorio.");
      return;
    }
    if (selectedPermissionsRole.length === 0) {
      setError("Debes seleccionar al menos un permiso para el rol.");
      return;
    }
    
    const new_role: Role = {
      id: idToEditRole,
      nombre: roleName.trim(),
      permiso_ids: selectedPermissionsRole,
    };
    setRoles((prev) => [...prev, new_role]);
    setRoleName("");
    setSelectedPermissionsRole([]);
    setError(""); // Limpia el error si todo salió bien
  };

   const handleSubmitArea = async () => {
    // Construir roles con usuario_ids
    const rolesWithUsers = roles.map((role) => ({
      ...role,
      id: role.id || null,
      usuario_ids: selectedEmployees.filter(
        (userId) => userRoles[userId] === role.nombre
      ),
    }));

    const areaData = {
      nombre: areaNombre,
      correo: areaCorreo,
      usuarios: selectedEmployees,
      roles: rolesWithUsers,
    };
    try {
      if (isEditMode && location.state?.area) {
        // UPDATE existing area
        await axios.put(
          `${API_URL}/capitalfarmer.co/api/v1/areas/${location.state.area.id}`,
          areaData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ).catch((e)=>{
          console.log(e)
        });
      } else {
        await axios.post(
          `${API_URL}/capitalfarmer.co/api/v1/areas`,
          areaData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
      navigate("/settings/areas");
    } catch (error: any) {
      setError(
        error?.response?.data?.detail ||
          `Error al ${isEditMode ? "actualizar" : "crear"} el área`
      );
    }
  };



  return (
    <div className="w-full max-w-4xl p-4 mx-auto">
      <InteractiveStepper ref={stepperRef}>
        <InteractiveStepperItem>
          <InteractiveStepperTrigger>
            <InteractiveStepperIndicator />
            <div>
              <InteractiveStepperTitle>Datos del area</InteractiveStepperTitle>
            </div>
          </InteractiveStepperTrigger>
          <InteractiveStepperSeparator />
        </InteractiveStepperItem>

        <InteractiveStepperItem>
          <InteractiveStepperTrigger>
            <InteractiveStepperIndicator />
            <div>
              <InteractiveStepperTitle>Roles del area</InteractiveStepperTitle>
            </div>
          </InteractiveStepperTrigger>
          <InteractiveStepperSeparator />
        </InteractiveStepperItem>

        <InteractiveStepperItem>
          <InteractiveStepperTrigger>
            <InteractiveStepperIndicator />
            <div>
              <InteractiveStepperTitle>
                Lista de usuarios
              </InteractiveStepperTitle>
            </div>
          </InteractiveStepperTrigger>
          <InteractiveStepperSeparator />
        </InteractiveStepperItem>

        <InteractiveStepperItem>
          <InteractiveStepperTrigger>
            <InteractiveStepperIndicator />
            <div>
              <InteractiveStepperTitle>Roles y resumen</InteractiveStepperTitle>
            </div>
          </InteractiveStepperTrigger>
        </InteractiveStepperItem>

        <InteractiveStepperContent step={1}>
          <Card>
            <CardHeader>
              <CardTitle>Datos del area</CardTitle>
              <CardDescription>
                Ingrese los datos y permisos del area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form>
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex flex-col gap-6 flex-1">
                      <div className="grid gap-2">
                        <Label>Nombre del area</Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Ej: Ventas"
                          required
                          value={areaNombre}
                          onChange={(e) => setAreaNombre(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Correo del area</Label>
                        <Input
                          id="email1"
                          type="email"
                          placeholder="area@mail.com"
                          required
                          value={areaCorreo}
                          onChange={(e) => setAreaCorreo(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="space-y-2">
                        <Label>Permisos del área</Label>
                        <div className="p-3 border rounded-md bg-muted/50">
                          {selectedPermissions.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              No hay permisos seleccionados
                            </p>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {selectedPermissions.map((permissionId) => {
                                const permission = permissions.find(
                                  (p) => p.id === permissionId
                                );
                                return (
                                  <Badge key={permissionId} className="text-xs">
                                    {permission?.nombre}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handlePermissionToggle(permissionId)
                                      }
                                      className="ml-1 text-red-500 hover:text-red-700 focus:outline-none"
                                      title="Quitar permiso"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </Badge>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    {/* Barra de búsqueda  */}
                    <div className="flex items-center gap-2">
                      <Label>Lista de permisos</Label>
                      <HelpCircle className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Buscar permisos por nombre o modulo"
                        value={permissionSearchTerm}
                        onChange={(e) =>
                          setPermissionSearchTerm(e.target.value)
                        }
                        className="pl-10"
                      />
                    </div>
                    <div>
                      <div className="min-h-[280px] max-h-[280px] overflow-y-auto border rounded-md">
                        <Accordion type="single" collapsible className="w-full">
                          {loading && <p>Loading...</p>}
                          {error && <p className="text-red-500">{error}</p>}
                          {Object.entries(groupedPermissions).map(
                            ([category, permissions]) => (
                              <AccordionItem
                                value={category}
                                key={category}
                                className="border-b last:border-b-0"
                              >
                                <AccordionTrigger className="px-4 py-3 hover:bg-muted/50">
                                  <span className="font-medium">
                                    Modulo {category}
                                  </span>
                                </AccordionTrigger>

                                <AccordionContent className="pb-0">
                                  <div className="space-y-1">
                                    {permissions.map((permission) => {
                                      const checked =
                                        selectedPermissions.includes(
                                          permission.id
                                        );
                                      return (
                                        <div
                                          key={permission.id}
                                          className="flex items-start gap-3 p-3 hover:bg-muted/30 transition-colors border-l-2 border-transparent hover:border-primary/20"
                                        >
                                          <div className="flex items-center gap-3">
                                            <Checkbox
                                              className="mt-0.5"
                                              checked={checked}
                                              onCheckedChange={() =>
                                                handlePermissionToggle(
                                                  permission.id
                                                )
                                              }
                                            />
                                            <div>
                                              <div className="font-medium text-foreground">
                                                {permission.nombre}
                                              </div>
                                              <div className="text-sm text-muted-foreground">
                                                {permission.descripcion}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            )
                          )}
                        </Accordion>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </InteractiveStepperContent>

        <InteractiveStepperContent step={2}>
          <Card>
            <CardHeader>
              <CardTitle>Roles del área</CardTitle>
              <CardDescription>Cree los roles del área</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-row gap-4">
                <div className="flex flex-col gap-4 flex-1">
                  <Label className="flex-1" htmlFor="role-name">
                    Nombre del rol
                  </Label>
                  <Input
                    id="role-name"
                    type="text"
                    placeholder="Ej: Administrador"

                    value={roleName ?? ""}
                    onChange={(e) => {
                      setRoleName(e.target.value);
                      setError("");
                    }}
                  />
                  {error && (
                    <div className="text-red-500 text-xs mt-1">{error}</div>
                  )}

                  <div className="space-y-2">
                    <Label>Permisos Seleccionados</Label>
                    <div className="min-h-[80px] p-3 border rounded-md bg-muted/50">
                      {selectedPermissions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No hay permisos seleccionados
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {selectedPermissionsRole
                            .filter((permissionId) =>
                              selectedPermissions.includes(permissionId)
                            )
                            .map((permissionId) => {
                              const permission = permissions.find(
                                (p) => p.id === permissionId
                              );
                              return (
                                <Badge key={permissionId} className="text-xs">
                                  {permission?.nombre}
                                </Badge>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  </div>
                  <Button onClick={addRoleToList}>
                    <Plus className="h-4 w-4 mr-2" />
                   {idToEditRole ? "Actualizar rol" : "Crear nuevo rol"}
                  </Button>
                  <div className="space-y-2">
                    <Label>Permisos Disponibles</Label>
                    <div className="min-h-[80px] p-3 border rounded-md bg-muted/50">
                      {selectedPermissions.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No hay permisos seleccionados para esta area
                        </p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {selectedPermissions.map((permissionId) => {
                            const permission = permissions.find(
                              (p) => p.id === permissionId
                            );
                            return (
                              <div
                                key={permissionId}
                                className="flex items-center gap-2"
                              >
                                <Checkbox
                                  checked={selectedPermissionsRole.includes(
                                    permissionId
                                  )}
                                  onCheckedChange={() =>
                                    handlePermissionRoleToggle(permissionId)
                                  }
                                />
                                <span className="text-sm text-foreground">
                                  {permission?.nombre}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-4 flex-1">
                  <Label>Roles creados para el area</Label>
                  <Card className="w-full flex-1">
                    <CardContent className="space-y-2">
                      {roles.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No hay roles creados aún.
                        </p>
                      ) : (
                        <ScrollArea className="h-72 rounded-md">
                          <div className="space-y-2 p-2">
                            {roles.map((role, id) => (
                              <div
                                key={id}
                                className="border rounded p-2 flex flex-col gap-1"
                              >
                                <span className="font-semibold">
                                  {role.nombre}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  Permisos:{" "}
                                  {role.permiso_ids
                                    ?.map(
                                      (pid) =>
                                        permissions.find((p) => p.id === pid)
                                          ?.nombre
                                    )
                                    .filter(Boolean)
                                    .join(", ") || "Ninguno"}
                                </span>
                                <div className="flex gap-2 mt-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setRoleName(role.nombre);
                                      setSelectedPermissionsRole(
                                        role.permiso_ids || []
                                      );
                                      setIdToEditRole(role.id || null);
                                      setIsEditingRole(true);
                                      setRoles((prev) =>
                                        prev.filter((_, i) => i !== id)
                                      );
                                    }}
                                  >
                                    Editar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() =>
                                      setRoles((prev) =>
                                        prev.filter((_, i) => i !== id)
                                      )
                                    }
                                  >
                                    Eliminar
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </InteractiveStepperContent>

        <InteractiveStepperContent step={3}>
          <Card>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div>
                  <Label>Seleccione los EMPLEADOS del área</Label>
                </div>
                <div className="gap-4 flex flex-row">
                  <div className="flex-1 flex flex-row gap-2">
                    <Card className="w-full flex-1">
                      <CardContent>
                        <div className="space-y-2">
                          {/* Search bar */}
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                              placeholder="Buscar usuarios por nombre o email"
                              value={userSearchTerm}
                              onChange={(e) =>
                                setUserSearchTerm(e.target.value)
                              }
                              className="pl-10"
                            />
                          </div>
                          {/* Users list */}
                          {loading && <p>Loading...</p>}
                          {error && (
                            <p className="text-red-500">
                              Error al cargar usuarios
                            </p>
                          )}
                          <ScrollArea className="h-72 rounded-md">
                            <div className="p-3">
                              {filteredUsers
                                .filter(
                                  (user) =>
                                    user.nombre
                                      .toLowerCase()
                                      .includes(userSearchTerm.toLowerCase()) ||
                                    user.correo
                                      .toLowerCase()
                                      .includes(userSearchTerm.toLowerCase())
                                )
                                .map((user) => (
                                  <div
                                    key={user.id}
                                    className="flex items-center justify-between p-1 rounded-lg hover:bg-muted/50 transition-colors"
                                  >
                                    <div className="flex items-center gap-3">
                                      <Checkbox
                                        checked={selectedEmployees.includes(
                                          user.id
                                        )}
                                        onCheckedChange={() =>
                                          handleEmployeeToggle(user.id)
                                        }
                                      />
                                      <div>
                                        <div className="font-medium text-foreground">
                                          {user.nombre} {user.apellido}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          {user.correo}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              {filteredUsers.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                  No se encontraron usuarios que coincidan con
                                  la búsqueda
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="flex-1 flex flex-row gap-2">
                    <Card className="w-full flex-1">
                      <CardContent>
                        <div className="space-y-2">
                          {/* Search bar */}
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                              placeholder="Buscar usuarios por nombre o email"
                              value={employeeSelectedSearchTerm}
                              onChange={(e) =>
                                setEmployeeSelectedSearchTerm(e.target.value)
                              }
                              className="pl-10"
                            />
                          </div>

                          {selectedEmployees.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              No hay miembros seleccionados usuarios
                            </p>
                          ) : (
                            <ScrollArea className="h-72 rounded-md">
                              <div className="space-y-2 p-2">
                                {selectedEmployees
                                  .map((userId) =>
                                    users.find((u) => u.id === userId)
                                  )
                                  .filter(
                                    (user): user is User =>
                                      !!user &&
                                      (user.nombre
                                        .toLowerCase()
                                        .includes(
                                          employeeSelectedSearchTerm.toLowerCase()
                                        ) ||
                                        user.correo
                                          .toLowerCase()
                                          .includes(
                                            employeeSelectedSearchTerm.toLowerCase()
                                          ))
                                  )
                                  .map((user) => (
                                    <div
                                      key={user.id}
                                      className="flex items-center gap-2"
                                    >
                                      <div className="flex flex-col">
                                        <span className="font-medium text-foreground">
                                          {user?.nombre} {user?.apellido}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                          {user?.correo}
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setSelectedEmployees((prev) =>
                                            prev.filter((id) => id !== user.id)
                                          )
                                        }
                                        className="ml-auto p-1 rounded hover:bg-red-100 dark:hover:bg-red-900 transition-colors"
                                        title="Quitar usuario"
                                      >
                                        <X className="w-4 h-4 text-red-500" />
                                      </button>
                                    </div>
                                  ))}
                              </div>
                            </ScrollArea>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </InteractiveStepperContent>

        <InteractiveStepperContent step={4}>
          <Card>
            <CardContent>
              <div className="overflow-hidden rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Correo</TableHead>
                      <TableHead>Rol</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedEmployees.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center text-muted-foreground"
                        >
                          No hay usuarios seleccionados
                        </TableCell>
                      </TableRow>
                    ) : (
                      selectedEmployees.map((userId) => {
                        const user = users.find((u) => u.id === userId);
                        return (
                          <TableRow key={userId}>
                            <TableCell className="font-medium">
                              {user?.nombre} {user?.apellido}
                            </TableCell>
                            <TableCell>{user?.correo}</TableCell>
                            <TableCell>
                              <Select
                                value={userRoles[userId] || ""}

                                onValueChange={(value) =>
                                  setUserRoles((prev) => ({
                                    ...prev,
                                    [userId]: value,
                                  }))
                                }
                              >
                                <SelectTrigger className="w-[180px]">
                                  <SelectValue placeholder="Rol" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    <SelectLabel>Roles</SelectLabel>
                                    {roles.map((role, id) => (
                                      <SelectItem key={id} value={role.nombre} >
                                        {role.nombre}
                                      </SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </InteractiveStepperContent>
      </InteractiveStepper>

      <div className="mt-4 flex justify-between gap-2">
        <Button
          disabled={stepperRef.current?.isPrevDisabled}
          onClick={handlePrev}
        >
          Anterior
        </Button>


        {currentStep === 4 ? (
          <Button onClick={handleSubmitArea}>{isEditMode ? "Guardar cambios" : "Crear área"}</Button>
        ) : (
          <Button
            disabled={stepperRef.current?.isNextDisabled}
            onClick={handleNext}
          >
            Siguiente
          </Button>
        )}
      </div>
    </div>
  );
};

export default InteractiveStepperExternalInteractions;
