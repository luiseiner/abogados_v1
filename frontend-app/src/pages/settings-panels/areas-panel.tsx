"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom";
import axios from "axios"
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent} from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Search, Users, Edit, Trash2, CirclePlus } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";

interface Area {
  id: number;
  nombre: string;
  correo: string;
  usuarios: Usuarios[];
}

interface Usuarios {
  id: number;
  nombre: string;
}

export default function AreasPanel() {
  const [areas, setAreas] = useState<Area[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const { token } = useAuth();


  const openAddArea = (area? : Area) => {
    if (area) {

      navigate("/settings/areas/create", {
        state: {
          isEditMode: true,
          area: area
        }
      });
      console.log("to update")
    } else {
      navigate("/settings/areas/create");
    }
  }

  useEffect(() => {
    setLoading(true)
    axios.get(`${API_URL}/capitalfarmer.co/api/v1/areas`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then((res) => {
      setAreas(res.data)
    }).catch(() => setError("Error al cargar áreas")).finally(() => setLoading(false))
  }, [API_URL, token]);

  const filteredAreas = areas.filter((area) => {
    const matchesSearch =
      area.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })


  return (
    <div className="space-y-6 mt-4 px-6">
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
            <Button onClick={() => openAddArea()}>
              <CirclePlus className="h-4 w-4" />
              Nueva Área
            </Button>
          </div>
          {loading && 
          <div className="mb-4 text-blue-600 flex items-center gap-2">
            <Spinner/>
            Cargando areas...
          </div>}
          {error && <div className="mb-4 text-red-600">{error}</div>}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Empleados</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAreas.map((area) => (
                  <TableRow key={area.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{area.nombre}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4 text-gray-400" />
                        {area.usuarios && area.usuarios.length > 0
                          ? <span>{area.usuarios.length}</span>
                          : <span>Ninguno</span>
                        }
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
                          <DropdownMenuItem onClick={() => openAddArea(area)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-400">
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
        </CardContent>
      </Card>
    </div>
  )
}