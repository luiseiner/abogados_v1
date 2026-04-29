import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Shield, Save, Search } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface Permission {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  modulo: string;
}

interface Role {
  nombre: string;
  permiso_ids?: number[];
  usuario_ids?: number[];
}

interface User {
  id: number;
  nombre: string;
  apellidos: string;
  correo: string;
  avatar?: string;
  telefono: string;
}

const API_URL = import.meta.env.VITE_API_URL;

export default function CreateEditRolesPanel() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const { token } = useAuth();
  const [roleName, setRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${API_URL}/capitalfarmer.co/api/v1/permisos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setPermissions(response.data);
      });

    axios
      .get(`${API_URL}/capitalfarmer.co/api/v1/usuarios`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setUsers(response.data);
      });
  }, [token]);

  useEffect(() => {
    if (id) {
      axios
        .get(`${API_URL}/capitalfarmer.co/api/v1/roles/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          const rol = response.data;
          setRoleName(rol.nombre);
          setSelectedPermissions(rol.permisos.map((p: any) => p.id));
          setSelectedMembers(rol.usuarios.map((u: any) => u.id));
        });
    }
  }, [id, token]);

  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleMemberToggle = (userId: number) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSaveRole = () => {
    const newRole: Role = {
      nombre: roleName,
      permiso_ids: selectedPermissions,
      usuario_ids: selectedMembers,
    };

    if (isEditMode && id) {
      // Editar rol existente
      axios
        .put(`${API_URL}/capitalfarmer.co/api/v1/roles/${id}`, newRole, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(() => {
          toast.success("Rol actualizado correctamente");
          navigate("/settings/roles");
        })
        .catch(() => {
          toast.error("Error al actualizar el rol");
        });
    } else {
      // Crear nuevo rol
      axios
        .post(`${API_URL}/capitalfarmer.co/api/v1/roles`, newRole, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(() => {
          toast.success("Rol creado correctamente");
        })
        .catch(() => {
          toast.error("Error al crear el rol");
          navigate("/settings/roles");
        });
    }
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.modulo]) {
      acc[permission.modulo] = [];
    }
    acc[permission.modulo].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const filteredUsers = users.filter(
    (user) =>
      user.nombre.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
      user.correo.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {isEditMode ? "Editar Rol" : "Creación de Roles"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isEditMode
              ? "Modifica los datos y permisos de este rol del sistema"
              : "Crea y configura roles con permisos específicos para tu sistema"}
          </p>
        </div>
        <Button
          onClick={handleSaveRole}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          <Save className="h-4 w-4 mr-2" />
          {isEditMode ? "Guardar Cambios" : "Crear Rol"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role Creation Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Nuevo Rol
              </CardTitle>
              <CardDescription>
                Define el nombre, permisos y miembros para el nuevo rol
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role-name">Nombre del Rol</Label>
                <Input
                  id="role-name"
                  placeholder="Ej: Editor, Administrador, Moderador"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Permisos Seleccionados</Label>
                <div className="min-h-[80px] p-3 border rounded-md bg-muted/50">
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
                          <Badge
                            key={permissionId}
                            className="text-xs"
                          >
                            {permission?.nombre}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Miembros Seleccionados</Label>
                <div className="min-h-[80px] p-3 border rounded-md bg-muted/50">
                  {selectedMembers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No hay miembros seleccionados
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedMembers.map((userId) => {
                        const user = users.find((u) => u.id === userId);
                        return (
                          <div key={userId} className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={user?.avatar || "/placeholder.svg"}
                              />
                              <AvatarFallback className="text-xs">
                                {user?.nombre
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{user?.nombre}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Permissions and Members Tabs */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Rol</CardTitle>
              <CardDescription>
                Configura los permisos y miembros que tendrá este rol
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="permissions" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="permissions">Permisos</TabsTrigger>
                  <TabsTrigger value="members">
                    Gestionar miembros ({selectedMembers.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="permissions" className="mt-6">
                  <div className="space-y-6 max-h-[700px] overflow-y-auto">
                    {Object.entries(groupedPermissions).map(
                      ([category, permissions]) => (
                        <div key={category} className="space-y-4">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-foreground">
                              {category}
                            </h3>
                            <Separator className="flex-1" />
                          </div>

                          <div className="grid gap-3">
                            {permissions.map((permission) => (
                              <div
                                key={permission.id}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="text-muted-foreground"></div>
                                  <div>
                                    <div className="font-medium text-foreground">
                                      {permission.nombre}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {permission.descripcion}
                                    </div>
                                  </div>
                                </div>

                                <Switch
                                  checked={selectedPermissions.includes(
                                    permission.id
                                  )}
                                  onCheckedChange={() =>
                                    handlePermissionToggle(permission.id)
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="members" className="mt-6">
                  <div className="space-y-4">
                    {/* Search bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Buscar usuarios por nombre, email o departamento..."
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Users list */}
                    <div className="space-y-2 max-h-[500px] overflow-y-auto">
                      {filteredUsers.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={selectedMembers.includes(user.id)}
                              onCheckedChange={() =>
                                handleMemberToggle(user.id)
                              }
                            />
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={user.avatar || "/placeholder.svg"}
                              />
                              <AvatarFallback>
                                {user.nombre
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-foreground">
                                {user.nombre}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {user.correo}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {filteredUsers.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No se encontraron usuarios que coincidan con la búsqueda
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
