"use client";

import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MoreHorizontal,
  Edit,
  CircleCheck,
  CircleX,
  CircleAlert,
  User,
  CirclePlus,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";


interface Permiso {
  id: number;
  codigo: string;
  nombre: string;
  modulo: string;
  descripcion: string | null;
  created_at: string;
}

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
}

interface Rol {
  id: number;
  nombre: string;
  is_active: boolean;
  is_default: boolean;
  permisos: Permiso[];
  usuarios: Usuario[];
}

export default function ManagmentRolesPanel() {
  const [roles, setRoles] = useState<Rol[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    setLoading(true)
    axios
      .get(`${API_URL}/capitalfarmer.co/api/v1/rolescompletos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setRoles(res.data);
        setError("");
      })
      .catch(() => setError("Error al cargar roles"))
      .finally(() => setLoading(false));
  }, [API_URL, token]);

  const handleDeactivateRole = (roleId: number) => {
    axios
      .post(
        `${API_URL}/capitalfarmer.co/api/v1/roles/desactivar/${roleId}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        // Actualiza el estado local para reflejar el cambio
        setRoles((prevRoles) =>
          prevRoles.map((role) =>
            role.id === roleId ? { ...role, is_active: false } : role
          )
        );
      })
      .catch(() => {
        alert("Error al desactivar el rol");
      });
  };

  const handleActivateRole = (roleId: number) => {
    axios
      .post(
        `${API_URL}/capitalfarmer.co/api/v1/roles/activar/${roleId}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then(() => {
        setRoles((prevRoles) =>
          prevRoles.map((role) =>
            role.id === roleId ? { ...role, is_active: true } : role
          )
        );
      })
      .catch(() => {
        alert("Error al activar el rol");
      });
  };


  return (
    <div className="space-y-6 mt-4 flex-1 px-6">
      <Card>
         <CardHeader>
          <div className="flex items-center justify-between w-full">
            <div>
              <CardTitle>Lista de Roles</CardTitle>
              <CardDescription>Roles disponibles en el sistema</CardDescription>
            </div>
            <Button onClick={() => navigate(`/settings/roles/create`)}>
              <CirclePlus className="h-4 w-4" />
              Nuevo Rol
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading && 
            <div className="mb-4 text-blue-600 flex items-center gap-2">
              <Spinner/>
              Cargando roles...
              </div>}
            {error && <div className="mb-4 text-red-600">{error}</div>}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Permisos</TableHead>
                    <TableHead>Usuarios</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell>{role.nombre}</TableCell>
                      <TableCell className="text-left align-middle">
                        <div className="flex items-center">
                          {role.permisos && role.permisos.length > 0
                            ? `${role.permisos.length}`
                            : "Ninguno"}
                          <Dialog>
                            <DialogTrigger asChild>
                              <CircleAlert className="ml-1 h-4 w-4 text-blue-500 cursor-pointer" />
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Permisos del rol</DialogTitle>
                                <DialogDescription>
                                  Estos son los permisos asignados al rol{" "}
                                  <b>{role.nombre}</b>':
                                  <span className="text-muted-foreground mt-4 flex list-decimal flex-col gap-2 pl-6 text-sm">
                                    {role.permisos.map((permiso) => (
                                      <li key={permiso.id}>{permiso.nombre}</li>
                                    ))}
                                  </span>
                                </DialogDescription>
                              </DialogHeader>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                      <TableCell className="text-left align-middle">
                        <div className="flex items-center">
                          {role.usuarios && role.usuarios.length > 0
                            ? `${role.usuarios.length}`
                            : "Sin usuarios"}
                          <Dialog>
                            <DialogTrigger asChild>
                              <User className="ml-1 h-4 w-4 cursor-pointer" />
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Usuarios del rol</DialogTitle>
                                <DialogDescription>
                                  Estos son los usuarios con el rol{" "}
                                  <b>{role.nombre}</b>':
                                  <span className="text-muted-foreground mt-4 flex list-decimal flex-col gap-2 pl-6 text-sm">
                                    {role.usuarios.map((usuario) => (
                                      <li key={usuario.id}>
                                        {usuario.nombre} {usuario.apellido}
                                      </li>
                                    ))}
                                  </span>
                                </DialogDescription>
                              </DialogHeader>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                      <TableCell>
                        {role.is_active ? (
                          <Badge
                            variant="default"
                            className="border-green-600/10 bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400"
                          >
                            Activo
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="border-red-600/10 bg-red-600/10 text-red-600 dark:bg-red-400/10 dark:text-red-400"
                          >
                            Inactivo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                navigate(`/settings/roles/edit/${role.id}`)
                              }
                            >
                              <Edit className="h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                role.is_active
                                  ? handleDeactivateRole(role.id)
                                  : handleActivateRole(role.id)
                              }
                            >
                              {role.is_active ? (
                                <>
                                  <CircleX className="h-4 w-4 text-red-600 dark:text-red-400" />
                                  Desactivar
                                </>
                              ) : (
                                <>
                                  <CircleCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                                  Activar
                                </>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
