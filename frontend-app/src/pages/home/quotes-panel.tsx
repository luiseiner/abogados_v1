"use client"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import axios from "axios"
import {
  Search,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Edit,
  Trash2,
  Paperclip,
  Download,
  AlignLeft,
  Ban,
  CircleDot,
  CirclePlus,
} from 'lucide-react'
import {
  ContextMenu,
  ContextMenuSeparator,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner";


import { useAuth } from "@/context/AuthContext";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PermissionGuard } from "./home";

export default function QuotesManagementPanel() {
  const [quotation, setQuotation] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [alertOpen, setAlertOpen] = useState(false);
  const [pendingChange, setPendingChange] = useState<{ id: number; estado: string } | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quotationToDelete, setQuotationToDelete] = useState<{id: number, codigo_cotizacion: string} | null>(null);

  const { token } = useAuth();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    setLoading(true)
    axios
      .get(`${API_URL}/capitalfarmer.co/api/v1/cotizaciones`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
      .then((res) => setQuotation(res.data))
      .catch(() => setError("Error al cargar cotizaciones"))
      .finally(() => setLoading(false))
  }, [API_URL, token])


  const openAddQuotation = () => {
    navigate("/home/quotes/add");
  }

  const filteredQuotations = quotation.filter((quotation) => {
    const matchesSearch =
      quotation.cliente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.servicio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.fecha_vencimiento?.toString().includes(searchTerm) ||
      quotation.estado?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || quotation.estado === statusFilter

    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredQuotations.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentQuotations = filteredQuotations.slice(startIndex, endIndex)

  const getStateBadgeColor = (state: string) => {
    switch (state) {
      case "Cancelada":
        return "border-red-600/10 bg-red-600/10 text-red-600 dark:bg-red-400/10 dark:text-red-400"
      case "Pendiente":
        return "border-yellow-600/10 bg-yellow-600/10 text-yellow-600 dark:bg-yellow-400/10 dark:text-yellow-400"
      case "Aprobada":
        return "border-green-600/10 bg-green-600/10 text-green-600 dark:bg-green-400/10 dark:text-green-400"
      default:
        return "border-gray-600/10 bg-gray-600/10 text-gray-600 dark:bg-gray-400/10 dark:text-gray-400"
    }
  }

  const handleUpdateQuotationState = async (id: number, nuevoEstado: string) => {
    try {
      await axios.put(
        `${API_URL}/capitalfarmer.co/api/v1/cotizaciones/${id}`,
        {
          estado: nuevoEstado 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Actualiza el estado local para reflejar el cambio sin recargar toda la página
      setQuotation((prev) =>
        prev.map((q) =>
          q.id === id ? { ...q, estado: nuevoEstado } : q
        )
      );
      toast.success(`Estado de la cotización actualizado a "${nuevoEstado}"`);
    } catch (error) {
      toast.error("Error al actualizar el estado de la cotización");
    }
  };

  const handleDeleteQuotation = async (id: number) => {
    try {
      await axios.post(
      `${API_URL}/capitalfarmer.co/api/v1/cotizaciones/desactivar/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
      // Actualiza el estado local para reflejar el cambio sin recargar toda la página
      setQuotation((prev) =>
        prev.filter((q) => q.id !== id)
      );
      toast.success("Cotización eliminada exitosamente",);
    } catch (error) {
      toast.error("Error al eliminar la cotización");
    }
  };

  const handleRequestUpdateQuotationState = (id: number, nuevoEstado: string) => {
    setPendingChange({ id, estado: nuevoEstado });
    setAlertOpen(true);
  };

  const handleConfirmUpdateQuotationState = async () => {
    if (pendingChange) {
      await handleUpdateQuotationState(pendingChange.id, pendingChange.estado);
      setAlertOpen(false);
      setPendingChange(null);
    }
  };

  const uniqueStates = Array.from(new Set(quotation.map((u) => u.estado).filter(Boolean)))

  const handleDownload = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/capitalfarmer.co/api/v1/cotizaciones/exportar-csv`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'cotizaciones.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar:', error);
    }
  };

  return (
    <div className="flex">
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cotizaciones</CardTitle>
                <Paperclip className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{quotation.length}</div>
                {/* <p className="text-xs">+2 desde el mes pasado</p> */}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cotizaciones Aprobadas</CardTitle>
                <FileCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{quotation.filter((q) => q.estado === "Aprobada").length}</div>
                {/* <p className="text-xs">87.5% del total</p> */}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cotizaciones pendientes</CardTitle>
                <CircleDot className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{quotation.filter((q) => q.estado === "Pendiente").length}</div>
                {/* <p className="text-xs">10.0% del total</p> */}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cotizaciones Canceladas</CardTitle>
                <Ban className="h-4 w-4 text-red-600 dark:text-red-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{quotation.filter((q) => q.estado === "Cancelada").length}</div>
                {/* <p className="text-xs">2.5% del total</p> */}
              </CardContent>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Lista de Cotizaciones</CardTitle>
              <CardDescription>Busca y gestiona todas las cotizaciones del sistema</CardDescription>
            </CardHeader>
            <CardContent>
              {loading && <div className="mb-4 text-blue-600 dark:text-blue-400">Cargando cotizaciones...</div>}
              {error && <div className="mb-4 text-red-600 dark:text-red-400">{error}</div>}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por cliente, tipo de servicio, dias de validez, estado..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos estados</SelectItem>
                    {uniqueStates.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleDownload} variant="outline" size="default">
                  <Download className="h-4 w-4" />
                  Descargar
                </Button>
                <PermissionGuard permission="quotes.create">
                  <Button onClick={openAddQuotation}>
                    <CirclePlus className="h-4 w-4"/>
                    Nueva cotización
                  </Button>
                </PermissionGuard>
              </div>
              <div className="overflow-hidden rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Teléfono</TableHead>
                      <TableHead>Servicio</TableHead>
                      <TableHead>Fecha de vencimiento</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción cambiará el estado de la cotización a <b>{pendingChange?.estado}</b>. ¿Deseas continuar?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setAlertOpen(false)}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmUpdateQuotationState}>Confirmar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  <TableBody>
                    {currentQuotations.map((quotation) => (
                      <ContextMenu key={quotation.id}>
                        <ContextMenuTrigger asChild>
                          <TableRow>
                            <TableCell>{quotation.codigo_cotizacion}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{quotation.cliente.nombre || "..."}</TableCell>
                            <TableCell>{quotation.telefono}</TableCell>
                            <TableCell>{quotation.servicio}</TableCell>
                            <TableCell>{quotation.fecha_vencimiento}</TableCell>
                            <TableCell>
                              <Badge className={getStateBadgeColor(quotation.estado)}>{quotation.estado}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => navigate(`/home/quotes/edit/${quotation.id}`)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => navigate(`/home/quotes/details/${quotation.id}`)}>
                                    <AlignLeft className="mr-2 h-4 w-4" />
                                    Detalles
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => navigate(`/home/quotes/export/${quotation.id}`)}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Descargar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    variant="destructive"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      setQuotationToDelete({
                                        id: quotation.id,
                                        codigo_cotizacion: quotation.codigo_cotizacion
                                      });
                                      setDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem onClick={() => navigate(`/home/quotes/edit/${quotation.id}`)}>
                            Editar
                          </ContextMenuItem>
                          <ContextMenuSeparator />
                          <ContextMenuItem onClick={() => handleRequestUpdateQuotationState(quotation.id, "Aprobada")}>
                            Marcar como Aprobada
                          </ContextMenuItem>
                          <ContextMenuItem onClick={() => handleRequestUpdateQuotationState(quotation.id, "Cancelada")}>
                            Marcar como Cancelada
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
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
                      <SelectItem value="5">5</SelectItem>
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
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredQuotations.length)} de{" "}
                {filteredQuotations.length} cotizaciones
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Modal de confirmación de eliminación */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro que deseas eliminar la cotización "{quotationToDelete?.codigo_cotizacion}"? Esta acción no
              se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setQuotationToDelete(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (quotationToDelete) {
                  await handleDeleteQuotation(quotationToDelete.id);
                  setDeleteDialogOpen(false);
                  setQuotationToDelete(null);
                }
              }}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
