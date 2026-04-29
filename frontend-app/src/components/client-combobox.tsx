"use client"

import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"
import axios from "axios"
import { useAuth } from "@/context/AuthContext";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type cliente = {
  id: number
  nombre: string
  apellido: string
  correo: string
  telefono: string
}

interface ComboboxProps {
  // value?: cliente | null
  value?: number | null
  onChange?: (cliente: cliente) => void
}

export function ClientCombobox({onChange, value }: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [clientes, setClientes] = React.useState<cliente[]>([])
  const [selectedId, setSelectedId] = React.useState<number | null>(null)
  const { token } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;
  const APIPERU_TOKEN = import.meta.env.VITE_APIPERU_TOKEN;

  const [formData, setFormData] = React.useState({
      nombre: "",
      apellido: "",
      correo: "",
      telefono: "",
      tipo_documento: "",
      documento: "",
      nombre_corto: "",
      direccion: "",
    })

  React.useEffect(() => {
    if (clientes.length > 0) return;
    axios
      .get(`${API_URL}/capitalfarmer.co/api/v1/clientes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => setClientes(res.data))
      .catch(() => setClientes([]));
  }, [token]);

  React.useEffect(() => {
    setSelectedId(value ?? null);
  }, [value]);

  const documentos = [
    { id: 1, nombre: "DNI" },
    { id: 2, nombre: "RUC" },
    { id: 3, nombre: "CE" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isRUC = formData.tipo_documento === "RUC";

    if (!formData.nombre || (!isRUC && !formData.apellido) || !formData.correo) {
      toast.error("Por favor complete todos los campos obligatorios");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/capitalfarmer.co/api/v1/clientes`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        },
      });

      toast("Cliente agregado correctamente");
      setClientes((prev) => [...prev, response.data]); // Actualiza la lista de clientes
      setFormData({
        nombre: "",
        apellido: "",
        correo: "",
        telefono: "",
        tipo_documento: "",
        documento: "",
        nombre_corto: "",
        direccion: "",
      }); // Resetea el formulario
    } catch (error) {
      toast("Error al agregar cliente");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const [busquedaLoading, setBusquedaLoading] = React.useState(false);
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
      
    } catch (err) {
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id="cliente_id"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedId
            ? (() => {
                const cliente = clientes.find(c => c.id === selectedId)
                return cliente
                  ? `${cliente.nombre} ${cliente.apellido}`
                  : "Seleccione cliente..."
              })()
            : "Seleccione cliente..."}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" onWheel={e => e.stopPropagation()}>
        <Command>
            <CommandInput  placeholder="Buscar cliente..."/>
              <CommandList>
                <CommandEmpty>No se encontró cliente</CommandEmpty>
                <CommandGroup>
                  {clientes.map((cliente) => (
                    <CommandItem
                      key={cliente.id}
                      value={`${cliente.nombre} ${cliente.apellido} ${cliente.correo}`.toLowerCase()}
                      onSelect={() => {
                        setSelectedId(cliente.id)
                        setOpen(false)
                        if (onChange) onChange(cliente)
                      }}
                    >
                      <CheckIcon
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedId === cliente.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div>
                        <div className="font-medium">{cliente.nombre} {cliente.apellido}</div>
                        <div className="text-xs text-gray-500">{cliente.correo}</div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
        </Command>
        <div className="border-t mt-1 sticky bottom-0">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-blue-600 dark:text-blue-400 ghost w-full justify-start"
                >
                  + Agregar nuevo cliente
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Agregar nuevo Cliente</SheetTitle>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="grid flex-1 auto-rows-min gap-6 px-4">
                  <div className="grid flex-1 auto-rows-min gap-6 px-4">
                    <div className="grid gap-3">
                      <Label htmlFor="sheet-demo-name">Tipo</Label>
                      <Select 
                        value={formData.tipo_documento}
                        onValueChange={handleTipoDocumentoChange}
                        required
                      >
                        <SelectTrigger id="tipo_documento" className="w-full ">
                          <SelectValue placeholder="Seleccione el tipo de documento" />
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
                    <div className="grid gap-3">
                      <Label>Documento</Label>
                      <div className="flex items-center gap-2">
                        <Input 
                          id="sheet-demo-username"
                          name="documento"
                          placeholder="Ingrese número de documento"
                          value={formData.documento}
                          onChange={handleChange} 
                          className="flex-1" 
                        />
                        <Button
                          variant="outline"
                          onClick={handleBuscarDocumento}
                          disabled={busquedaLoading}
                        >
                          {busquedaLoading ? "Buscando..." : "Buscar"}
                        </Button>
                      </div>
                    </div>
                    <div className="grid gap-3">
                      <Label>
                        {formData.tipo_documento === "RUC" ? "Empresa" : "Nombre"}
                      </Label>
                      <Input
                        name="nombre"
                        placeholder="Ingrese nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                      />
                    </div>
                    {formData.tipo_documento !== "RUC" && (
                      <div className="grid gap-3">
                        <Label>Apellido</Label>
                        <Input 
                          name="apellido"
                          placeholder="Ingrese apellido"
                          value={formData.apellido}
                          onChange={handleChange}
                        />
                      </div>
                    )}
                    <div className="grid gap-3">
                      <Label >Nombre corto</Label>
                      <Input
                        name="nombre_corto"
                        placeholder="Ingrese nombre corto"
                        value={formData.nombre_corto}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="grid gap-3">
                      <Label >Correo electronico</Label>
                      <Input
                        name="correo"
                        placeholder="Ingrese correo electronico"
                        value={formData.correo}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="grid gap-3">
                      <Label >Teléfono</Label>
                      <Input 
                        name="telefono"
                        placeholder="Ingrese teléfono"
                        value={formData.telefono}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="grid gap-3">
                      <Label >Dirección</Label>
                      <Input
                        name="direccion"
                        placeholder="Ingrese dirección"
                        value={formData.direccion}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <SheetFooter>
                    <Button 
                      type="submit"
                      onClick={handleSubmit}
                    >
                      Crear usuario
                    </Button>
                    <SheetClose asChild>
                      <Button variant="outline">Cerrar</Button>
                    </SheetClose>
                  </SheetFooter>
                </form>
              </SheetContent>
            </Sheet>
        </div>
      </PopoverContent>
    </Popover>
  )
}