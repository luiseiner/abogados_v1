import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function QuotePreviewHTML({ cotizacion, mostrarPagosDivididos, mostrarComoVaAPagar, mostrarNotas }: { cotizacion: any, mostrarPagosDivididos?: boolean, mostrarComoVaAPagar?: boolean, mostrarNotas?: boolean}) {
  
  let fechaVigencia = "Sin fecha";
  if (cotizacion.fechaVencimiento) {
    try {
      const fecha =
        typeof cotizacion.fechaVencimiento === "string"
          ? new Date(cotizacion.fechaVencimiento)
          : cotizacion.fechaVencimiento;
      fechaVigencia = format(fecha, "dd/MM/yyyy", { locale: es });
    } catch {
      fechaVigencia = cotizacion.fechaVencimiento.toString();
    }
  }

  function getCurrencySymbol(moneda: string) {
    switch (moneda) {
      case "USD":
        return "$";
      case "EUR":
        return "€";
      case "PEN":
      default:
        return "S/";
    }
  }
  
  return (
    <div
      className="bg-white border border-gray-300 mx-auto my-4"
      style={{
        width: 794,
        minHeight: 1123,
        padding: 40,
        boxSizing: "border-box",
        fontFamily: "Times New Roman, Times, serif",
        color: "#333",
        position: "relative",
      }}
    >
      {/* Logos */}
      <div className="flex justify-between items-center mb-2" style={{ marginTop: -20 }}>
        <img src="/logo-izquierdo.jpg" alt="Logo izquierdo" style={{ width: 90, height: 89, objectFit: "contain" }} />
        <img src="/logo-derecho.jpg" alt="Logo derecho" style={{ width: 90, height: 89, objectFit: "contain" }} />
      </div>
      {/* Título */}
      <div className="text-center mb-2" style={{ marginTop: -65 }}>
        <div className="text-xs text-gray-400">{cotizacion.codigoCotizacion}</div>
        <div className="text-xl font-bold uppercase text-gray-800 mb-6">Cotización de servicios legales</div>
      </div>
      {/* Cliente */}
      <div className="mb-6">
        <div className="mb-1 text-sm">Cliente: {cotizacion?.cliente?.nombre || "Sin nombre"}</div>
        {/* <div className="mb-1 text-xs">Fecha de emisión: {fechaEmision}</div> */}
        <div className="mb-1 text-xs">Vigencia de la propuesta: {fechaVigencia}</div>
      </div>
      {/* Servicios */}
      <div className="mb-6">
        <div style={{color: "#3498db"}} className="text-base font-bold mb-2">¿Qué incluye el servicio?</div>
        <div className="text-sm mb-2">Servicios incluidos</div>
        <table className="w-full border text-xs mb-2">
          <thead>
            <tr>
              <th className="border bg-gray-100 p-2 w-1/6">N°</th>
              <th className="border bg-gray-100 p-2 w-3/6">Servicio</th>
              <th className="border bg-gray-100 p-2 w-1/6">Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2">1</td>
              <td className="border p-2">{cotizacion.servicio}</td>
              <td className="border p-2">
                <span>
                  {getCurrencySymbol(cotizacion.moneda)} {cotizacion.precio}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* Pagos divididos */}
      {mostrarPagosDivididos && cotizacion.pagosDivididos && cotizacion.pagosDivididos.length > 0 && (
        <div className="mb-6">
          <div style={{color: "#3498db"}} className="text-base font-bold mb-2">Concepto y fecha de pago</div>
          <table className="w-full border text-xs mb-2">
            <thead>
              <tr>
                <th className="border bg-gray-100 p-2">Nombre</th>
                <th className="border bg-gray-100 p-2">Pendiente</th>
                <th className="border bg-gray-100 p-2">Importe</th>
              </tr>
            </thead>
            <tbody>
              {cotizacion.pagosDivididos.map((pago: any, idx: number) => (
                <tr key={idx}>
                  <td className="border p-2">{pago.nombre}</td>
                  <td className="border p-2">{pago.fechaVencimiento || "Sin fecha"}</td>
                  <td className="border p-2">{getCurrencySymbol(cotizacion.moneda)} {pago.cantidad || "$0.00"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Secciones */}
      <div className="mb-6">
        <div style={{color: "#3498db"}} className="text-base font-bold mb-2">¿Qué haremos por usted?</div>
        <div className="bg-gray-50 border rounded p-3 text-xs">{cotizacion.queHaremos}</div>
      </div>
      <div className="mb-6">
        <div style={{color: "#3498db"}} className="text-base font-bold mb-2">¿Qué no incluye la cotización?</div>
        <div className="bg-gray-50 border rounded p-3 text-xs">{cotizacion.queNoIncluye}</div>
      </div>
      {mostrarComoVaAPagar && (
        <div className="mb-6">
          <div style={{color: "#3498db"}} className="text-base font-bold mb-2">Honorarios y forma de pago</div>
          <div className="bg-gray-50 border rounded p-3 text-xs">{cotizacion.comoVaAPagar}</div>
        </div>
      )}
      {mostrarNotas && (
        <div className="mb-6">
        <div style={{color: "#3498db"}} className="text-base font-bold mb-2">Notas importantes</div>
        <div className="bg-gray-50 border rounded p-3 text-xs">{cotizacion.notas}</div>
      </div>
      )}
      <div className="mb-6">
        <div style={{color: "#3498db"}} className="text-base font-bold mb-2">¿Cuánto cuesta el servicio?</div>
        <div className="bg-gray-50 border rounded p-3 text-xs">
          <span className="block mt-2">
            Este precio incluye la emisión de un Recibo por honorarios de un abogado del estudio,
            pero si desea boleta o factura del estudio deberá añadir el 18% de IGV
          </span>
        </div>
      </div>
      <div className="mb-6">
        <div style={{color: "#3498db"}} className="text-base font-bold mb-2">Medios de pago</div>
        <div className="bg-gray-50 border rounded p-3 text-xs">
          Transferencia, Yape o Plin
        </div>
      </div>
      {/* Footer */}
      <div className="bottom-10 left-0 w-full text-center text-xs text-gray-500">
        <div>Atentamente:</div>
        <div className="font-bold text-base text-gray-800">FARMER & CAPITAL ABOGADOS</div>
        <div>Tel: +51 968 140 000 | comercial.capitalfarmer@gmail.com</div>
      </div>
    </div>
  );
}