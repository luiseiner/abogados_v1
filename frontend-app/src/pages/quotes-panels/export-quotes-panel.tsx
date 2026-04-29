"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useNavigate } from "react-router-dom";
// import { format} from "date-fns"
import {
  Download,
  SquarePen,
} from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import axios from "axios"
import { useAuth } from "@/context/AuthContext"
import { PDFDownloadLink } from '@react-pdf/renderer';
import QuotePDF from '@/pages/quotes-panels/templates/basic-pdf-template';
import QuotePreviewHTML from '@/pages/quotes-panels/templates/basic-html-template';

function parseDateAsLocal(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day, 12, 0, 0, 0)
}

export default function ExportQuotesPanel() {
  const { token } = useAuth()
  const { id } = useParams()
  const [cotizacion, setCotizacion] = useState<any>(null)
  const [pagosDivididos, setPagosDivididos] = useState(false)
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (id) {
      axios.get(`${API_URL}/capitalfarmer.co/api/v1/cotizaciones/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })
        .then(res => {
          const data = res.data
          const hoy = new Date();
          const fechaFormateada = hoy.toISOString().split("T")[0];
          const fechaVencimiento = data.fecha_vencimiento
            ? parseDateAsLocal(data.fecha_vencimiento)
            : undefined
          const fechaEmision = fechaFormateada
          // Mapear cuotas si existen 
          const cuotas = (data.cuotas || []).map((cuota: any) => ({
            id: cuota.id,
            nombre: cuota.nombre_cuota,
            porcentaje: cuota.porcentaje,
            cantidad: cuota.monto.toString(),
            fechaVencimiento: cuota.fecha_vencimiento || "",
          }))
          setCotizacion({
            id: data.id,
            codigoCotizacion: data.codigo_cotizacion || "",
            cliente: {
              nombre: `${data.cliente.nombre || ''} ${data.cliente.apellido || ''}`.trim(),
              email: data.cliente.email || "",
              telefono: data.cliente.telefono || "",
            },
            fechaVencimiento,
            fechaEmision: fechaEmision,
            servicio: data.servicio || "",
            precio: data.precio?.toString() || "",
            comentarios: data.comentarios || "",
            queHaremos: data.detalle_servicio || "",
            queNoIncluye: data.exclusiones || "",
            comoVaAPagar: data.comentarios || "",
            notas: data.notas || "",
            pagosDivididos: cuotas,
            moneda: data.cotizacion_moneda || "PEN",
          })
          setPagosDivididos(cuotas.length > 0)
        })
        .catch(() => alert("Error al cargar la cotización"))
    }
  }, [id, token, API_URL])

  return (
    <div className="fixed inset-0 z-50 min-h-screen  overflow-y-auto">
      <div className="bg-(--background) border-b shadow-sm sticky top-0 z-10">

        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Cotización de Servicios Legales</h2>
            </div>
            <div className="flex items-center gap-2">

              <Button size="sm" onClick={() => navigate(`/home/quotes/edit/${cotizacion.id}`)}>
                <SquarePen className="h-4 w-4 mr-2"/>
                Editar
              </Button>
              {cotizacion && cotizacion.cliente && cotizacion.servicio && (
                <PDFDownloadLink
                  document={<QuotePDF cotizacion={cotizacion} />}
                  fileName={`${cotizacion.codigoCotizacion}_${cotizacion.cliente.nombre}.pdf`}
                  style={{ textDecoration: 'none' }}
                >
                  {({ loading, error }) => (
                    <Button size="sm" disabled={loading || !!error}>
                      <Download className="h-4 w-4 mr-2" />
                      {loading
                        ? 'Generando PDF...'
                        : error
                          ? 'Error al generar PDF'
                          : 'Descargar'}
                    </Button>
                  )}
                </PDFDownloadLink>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="overflow-auto" style={{height: "calc(100vh - 80px)"}}>
        {cotizacion ? (
          <div className="flex justify-center items-start overflow-y-auto overflow-x-hidden">
            <div className="scale-100 origin-top">
              <QuotePreviewHTML cotizacion={cotizacion} mostrarPagosDivididos={pagosDivididos} />
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center h-full text-center text-blue-600">
            <Spinner />
            Cargando vista previa...
          </div>
        )}
      </div>
    </div>
  )
}