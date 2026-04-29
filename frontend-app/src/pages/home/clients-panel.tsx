"use client"

import type React from "react"

import { useState, useEffect } from "react"
import axios, { isAxiosError } from 'axios';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Edit,
  Trash2,
  CirclePlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext";

export default function UserManagementPanel() {
  const [clients, setClients] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    tipo_documento: "",
    documento: "",
    nombre_corto: "",
    direccion: "",
  })
  const [isEditMode, setIsEditMode] = useState(false)
  const [editingUserId, setEditingUserId] = useState<number | null>(null)

  const { token } = useAuth();

  const API_URL = import.meta.env.VITE_API_URL;
  const APIPERU_TOKEN = import.meta.env.VITE_APIPERU_TOKEN;

  useEffect(() => {
    setLoading(true)
    axios
      .get(`${API_URL}/capitalfarmer.co/api/v1/clientes` , {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        })
      .then((res) => {
        setClients(res.data);
      })
      .catch(() => setError("Error al cargar clientes"))
      .finally(() => setLoading(false))
  }, [API_URL, token])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (!isRUC && (name === "nombre" || name === "apellido")) {
      setFormData((prev) => ({ ...prev, [name]: capitalizeWords(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCreateUser = () => {
    setFormData({
      nombre: "",
      apellido: "",
      correo: "",
      telefono: "",
      tipo_documento: "",
      documento: "",
      nombre_corto: "",
      direccion: "",
    })
    setEditingUserId(null)
    setIsEditMode(false)
    setDialogOpen(true)
  }

  const handleEditUser = (client: any) => {
    setFormData({
      nombre: client.nombre,
      apellido: client.apellido,
      correo: client.correo,
      telefono: client.telefono || "",
      tipo_documento: client.tipo_documento || "",
      documento: client.documento || "",
      nombre_corto: client.nombre_corto || "",
      direccion: client.direccion || "",
    })
    setEditingUserId(client.id)
    setIsEditMode(true)
    setDialogOpen(true)
  }

  const handleDeleteUser = (clientId: number) => {
  axios
    .delete(`${API_URL}/capitalfarmer.co/api/v1/clientes/${clientId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        })
    .then(() => {
      setClients((prev) => prev.filter((client) => client.id !== clientId))
      toast.success("Usuario eliminado correctamente")
    })
    .catch(() => toast.error("Error al eliminar usuario"))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nombre || (!isRUC && !formData.apellido) || !formData.correo) {
      toast.error("Por favor complete todos los campos obligatorios")
      return
    }

    const dataToSend = {
      ...formData,
      nombre: isRUC ? formData.nombre : capitalizeWords(formData.nombre),
      apellido: isRUC ? "" : capitalizeWords(formData.apellido),
    };

    if (isEditMode && editingUserId) {
      axios
      .put(`${API_URL}/capitalfarmer.co/api/v1/clientes/${editingUserId}`, dataToSend, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        })
      .then((res) => {
        setClients((prev) =>
          prev.map((client) => (client.id === editingUserId ? res.data : client))
        );
        toast.success(`${formData.nombre} ${formData.apellido} ha sido actualizado exitosamente`);
      })
      .catch(() => toast.error("Error al actualizar usuario"));
    } else {
      axios
        .post(
          `${API_URL}/capitalfarmer.co/api/v1/clientes`,
          {
            ...dataToSend,
            contrasena: "123456",
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        .then((res) => {
          setClients((prev) => [...prev, res.data]);
        })
        .catch((error) => {
          let detailMessage = "";

          if (isAxiosError(error)) {
            detailMessage = error.response?.data?.detail;
          } else {
            detailMessage = error.message;
          }
          const finalMessage = detailMessage
            ? `Error al crear cliente: ${detailMessage}`
            : "Error al crear cliente";

          toast.error(finalMessage);
        });
    }

    // Resetear el formulario y cerrar el diálogo
    setFormData({
      nombre: "",
      apellido: "",
      correo: "",
      telefono: "",
      tipo_documento: "",
      documento: "",
      nombre_corto: "",
      direccion: "",
    })
    setIsEditMode(false)
    setEditingUserId(null)
    setDialogOpen(false)
  }

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.correo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.telefono?.includes(searchTerm) ||
      client.rol_nombre?.toLowerCase().includes(searchTerm.toLowerCase())


    return matchesSearch
  })

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentUsers = filteredClients.slice(startIndex, endIndex)

  const documentos = [
    { id: 1, nombre: "DNI" },
    { id: 2, nombre: "RUC" },
    { id: 3, nombre: "CE" }
  ];

  const isRUC = formData.tipo_documento === "RUC";

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setFormData({
        nombre: "",
        apellido: "",
        correo: "",
        telefono: "",
        tipo_documento: "",
        documento: "",
        nombre_corto: "",
        direccion: "",
      })
      setIsEditMode(false)
      setEditingUserId(null)
    }
    setDialogOpen(open)
  }

  const [busquedaLoading, setBusquedaLoading] = useState(false);
    const handleBuscarDocumento = async () => {
    const tipo = formData.tipo_documento; 
    const numero = formData.documento;

    let url = "";
    let body = {};
    if (tipo === "DNI") {
      url = "https://apiperu.dev/api/dni";
      body = { dni: numero };
    } else if (tipo === "RUC") {
      url = "https://apiperu.dev/api/ruc";
      body = { ruc: numero };
    } else {
      return;
    }

    setBusquedaLoading(true);
    try {
      const res = await axios.post(url, body, {
        headers: {
          Authorization: `Bearer ${APIPERU_TOKEN}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      
      if (tipo === "DNI" && res.data.success) {
        setFormData(prev => ({
          ...prev,
          nombre: capitalizeWords(res.data.data.nombres || ""),
          apellido: capitalizeWords(
            `${res.data.data.apellido_paterno || ""} ${res.data.data.apellido_materno || ""}`.trim()
          ),
          direccion: res.data.data.direccion || "", 
        }));
      } else if (tipo === "RUC" && res.data.success) {
        setFormData(prev => ({
          ...prev,
          nombre: res.data.data.nombre_o_razon_social || "",
          direccion: res.data.data.direccion_completa || res.data.data.direccion || "", 
          apellido: "", // RUC no tiene apellido
        }));
      } else {
        toast.error("No se encontraron datos para el documento ingresado");
      }
      // Ejemplo: setFormData(prev => ({ ...prev, nombre: res.data.data.nombres }));
    } catch (error) {
      alert("No se pudo consultar el documento");
    } finally {
      setBusquedaLoading(false);
    }
  };

  const handleTipoDocumentoChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      tipo_documento: value,
      documento: "",
      nombre: "",
      apellido: "",
      direccion: "",
    }));
  };

  function capitalizeWords(str: string) {
    return str
      .toLowerCase()
      .replace(/(^|\s)([a-záéíóúüñ])/giu, (match) => match.toUpperCase());
  }

  return (
    <div className="flex">
      <div className="flex-1 overflow-auto">
        <div className="p-6">

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Lista de Clientes</CardTitle>
              <CardDescription>Busca y gestiona todos los clientes del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              {loading && <div className="mb-4 text-blue-600 dark:text-blue-400">Cargando clientes...</div>}
              {error && <div className="mb-4 text-red-600 dark:text-red-400">{error}</div>}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por nombre, apellido, documento, teléfono o correo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
                  <DialogTrigger asChild>
                    <Button onClick={handleCreateUser}>
                      <CirclePlus className="h-4 w-4" />
                      Nuevo cliente
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle className="text-2xl">
                        {isEditMode ? "Editar Datos" : "Crear Nuevo Cliente"}
                      </DialogTitle>
                      <DialogDescription>
                        {isEditMode
                          ? "Modifique los campos necesarios para actualizar la información del cliente."
                          : "Complete el formulario para crear un nuevo cliente en el sistema."}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        {/* Columna 1: Tipo de documento */}
                        <div className="space-y-2 col-span-2" >
                          <Label htmlFor="tipo"> 
                            Tipo <span className="text-red-600 dark:text-red-400">*</span> 
                          </Label>
                          <Select 
                            value={formData.tipo_documento}
                            onValueChange={handleTipoDocumentoChange}
                            required
                          >
                            <SelectTrigger id="tipo_documento" className="w-full ">
                              <SelectValue placeholder="Tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              {documentos.map((doc) => (
                                <SelectItem key={doc.id} value={doc.nombre}>
                                  {doc.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Columna 2: Número de documento */}
                        <div className="space-y-2 col-span-3">
                          <Label htmlFor="numero_documento">
                            Documento <span className="text-red-600 dark:text-red-400">*</span>
                          </Label>
                          <Input
                            id="numero_documento"
                            name="documento"
                            placeholder="Ingrese número"
                            value={formData.documento}
                            onChange={handleChange}
                            required
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2 col-span-1 flex flex-col items-end">
                          <Label className="invisible">Acción</Label>
                          <Button
                            type="button"
                            className="w-full"
                            onClick={handleBuscarDocumento}
                            disabled={busquedaLoading}
                          >
                            {busquedaLoading ? "Buscando..." : "Buscar"}
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className={`space-y-2 ${isRUC ? "md:col-span-2" : ""}`}>
                          <Label htmlFor="nombre">
                            {isRUC ? <>Razon Social <span className="text-red-600 dark:text-red-400">*</span></> : <>Nombre <span className="text-red-600 dark:text-red-400">*</span></>}
                          </Label>
                          <Input
                            id="nombre"
                            name="nombre"
                            placeholder={isRUC ? "Ingrese razón social" : "Ingrese nombre"}
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        {/* Campo Apellido, solo visible si NO es RUC */}
                        {!isRUC && (
                          <div className="space-y-2">
                            <Label htmlFor="apellido">
                              Apellido <span className="text-red-600 dark:text-red-400">*</span>
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
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="nombre_corto">Nombre corto</Label>
                        <Input
                          id="nombre_corto"
                          name="nombre_corto"
                          type="text"
                          placeholder="Ingrese nombre corto"
                          value={formData.nombre_corto}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="correo">
                            Correo Electrónico <span className="text-red-600 dark:text-red-400">*</span>
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
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="direccion">Dirección</Label>
                        <Input
                          id="direccion"
                          name="direccion"
                          placeholder="Ingrese dirección"
                          value={formData.direccion}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="flex justify-between pt-4">
                        <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit">
                          {isEditMode ? "Actualizar Usuario" : "Agregar Cliente"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="rounded-md border overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Correo</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Tipo de documento</TableHead>
                      <TableHead>Numero de documento</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentUsers.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell>{client.id}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{client.nombre} {client.apellido}</TableCell>
                        <TableCell>{client.correo}</TableCell>
                        <TableCell>{client.telefono}</TableCell>
                        <TableCell>{client.tipo_documento}</TableCell>
                        <TableCell>{client.documento}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditUser(client)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem variant="destructive" onClick={() => handleDeleteUser(client.id)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium">Filas por página</p>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value))
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="h-8 w-[70px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent side="top">
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-6 lg:space-x-8">
                  <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    Página {currentPage} de {totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredClients.length)} de {filteredClients.length}{" "}
                usuarios
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
