import { Page, Text, View, Document, StyleSheet, Image} from '@react-pdf/renderer';
import { format } from "date-fns";
import { es } from "date-fns/locale";

// --- Definición de Estilos ---
const styles = StyleSheet.create({
  page: {
    padding: 30,
    paddingBottom: 80,
    fontFamily: 'Times-Roman',
    fontSize: 10,
    color: '#333333',
  },
  header: {
    textAlign: 'center',
    color: '#a0a0a0',
    fontSize: 9,
    marginBottom: 5,
    marginTop: 5,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 25,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  clientInfoContainer: {
    marginBottom: 30,
  },
  clientInfoText: {
    marginBottom: 4,
    fontSize: 10,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#3498db', // Azul brillante para los títulos de sección
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 10,
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderWidth: 1,
    borderColor: '#eeeeee',
    borderRadius: 3,
  },
  // Estilos de la tabla
  table: {
    // display: "table",
    width: "auto",
    borderStyle: "solid",
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    width: "20%",
    borderStyle: "solid",
    borderColor: '#e0e0e0',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    backgroundColor: '#f2f2f2',
    padding: 8,
  },
  tableColHeaderService: {
    width: "60%",
    borderStyle: "solid",
    borderColor: '#e0e0e0',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    backgroundColor: '#f2f2f2',
    padding: 8,
  },
  tableColHeaderTotal: {
    width: "20%",
    borderStyle: "solid",
    borderColor: '#e0e0e0',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    backgroundColor: '#f2f2f2',
    padding: 8,
  },
  tableHeader: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#555555',
  },
  tableCol: {
    width: "20%",
    borderStyle: "solid",
    borderColor: '#e0e0e0',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    padding: 8,
  },
  tableColService: {
    width: "60%",
    borderStyle: "solid",
    borderColor: '#e0e0e0',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    padding: 8,
  },
  tableCell: {
    fontSize: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#555',
  },
  footerText: {
    fontSize: 9,
    marginBottom: 3,
  },
  footerBrand: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  logosRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 0,
    marginTop: -20,
  },
  logo: {
    width: 90,
    height: 89,
    objectFit: 'contain',   
    margin: 0,           
  },
});

function formateaFecha(fecha: Date | undefined) {
  return fecha ? format(fecha, "dd 'de' MMMM 'de' yyyy", { locale: es }) : "Fecha no seleccionada";
}

// --- Componente del Documento PDF ---
const QuotePDF = ({ cotizacion }: { cotizacion: any }) => {
return (     
  <Document>
    <Page size="A4" style={styles.page}>

      <View style={styles.logosRow}>
        <Image style={styles.logo} src="/logo-izquierdo.jpg" />
        <Image style={styles.logo} src="/logo-derecho.jpg" />
      </View>

      <View style={{ alignItems: 'center', marginBottom: 10, marginTop: -65 }}>
        <Text style={styles.header}>{cotizacion.codigoCotizacion}</Text>
        <Text style={styles.title}>Cotización de servicios legales</Text>
      </View>
      
      
      {/* Información del Cliente */}
      <View style={styles.clientInfoContainer}>
        <Text style={styles.clientInfoText}>Cliente: {cotizacion.cliente.nombre}</Text>
        {/* <Text style={{ ...styles.clientInfoText, marginTop: 10, fontSize: 9}}>
        </Text> */}
        <Text style={{ ...styles.clientInfoText, fontSize: 9}}>
          Vigencia de la propuesta: {formateaFecha(cotizacion.fechaVencimiento)}
        </Text>
      </View>
      
      {/* Sección: Servicios Incluidos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>¿Que incluye el servicio?</Text>
        <Text style={{ fontSize: 11, marginBottom: 10 }}>Servicios incluidos</Text>
        
        {/* Tabla de Servicios */}
        <View style={styles.table}>
          {/* Cabecera de la tabla */}
          <View style={styles.tableRow}>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableHeader}>N°</Text>
            </View>
            <View style={styles.tableColHeaderService}>
              <Text style={styles.tableHeader}>Servicio</Text>
            </View>
            <View style={styles.tableColHeaderTotal}>
              <Text style={styles.tableHeader}>Total</Text>
            </View>
          </View>
          {/* Fila de datos */}
          <View style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>1</Text>
            </View>
            <View style={styles.tableColService}>
              <Text style={styles.tableCell}>{cotizacion.servicio}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>
                {cotizacion.moneda === "USD" ? "$" : cotizacion.moneda === "EUR" ? "€" : "S/"}{cotizacion.precio}
              </Text>
            </View>
          </View>
        </View>
      </View>

      
      {cotizacion.pagosDivididos && cotizacion.pagosDivididos.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Calendario de pagos</Text>
          <View style={styles.table}>
            {/* Cabecera de la tabla */}
            <View style={styles.tableRow}>
              <View style={styles.tableColHeader}><Text style={styles.tableHeader}>Nombre</Text></View>
              <View style={styles.tableColHeaderService}><Text style={styles.tableHeader}>Pendiente</Text></View>
              <View style={styles.tableColHeaderTotal}><Text style={styles.tableHeader}>Importe</Text></View>
            </View>
            {/* Filas de pagos */}
            {cotizacion.pagosDivididos.map((pago: any, idx: number) => (
              <View style={styles.tableRow} key={idx}>
                <View style={styles.tableCol}><Text style={styles.tableCell}>{pago.nombre}</Text></View>
                <View style={styles.tableColService}><Text style={styles.tableCell}>{pago.fechaVencimiento || "Sin fecha"}</Text></View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>
                    {cotizacion.moneda === "USD" ? "$" : cotizacion.moneda === "EUR" ? "€" : "S/"}{pago.cantidad || "0.00"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
      
      {/* Sección: ¿Qué haremos por usted? */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>¿Qué haremos por usted?</Text>
        <View style={styles.sectionContent}>
          <Text>{cotizacion.queHaremos}</Text>
        </View>
      </View>
      
      {/* Sección: ¿Qué no incluye la cotización? */}
      <View style={styles.section} wrap={false}>
        <Text style={styles.sectionTitle}>¿Qué no incluye la cotización?</Text>
        <View style={styles.sectionContent}>
          <Text>{cotizacion.queNoIncluye}</Text>
        </View>
      </View>
      {/* Sección: ¿Cómo va a pagar? */}
      {cotizacion.comoVaAPagar && (
      <View style={styles.section} wrap={false}>
        <Text style={styles.sectionTitle}>¿Cómo va a pagar?</Text>
        <View style={styles.sectionContent}>
          <Text>{cotizacion.comoVaAPagar}</Text>
        </View>
      </View>
      )}
      {/* Sección: Notas importantes */}
      {cotizacion.notas && (
      <View style={styles.section} wrap={false}>
        <Text style={styles.sectionTitle}>Notas importantes</Text>
        <View style={styles.sectionContent}>
          <Text>{cotizacion.notas}</Text>
        </View>
      </View>
      )}
      {/* Sección: Nota */}
      <View style={styles.section} wrap={false}>
        <Text style={styles.sectionTitle}>¿Cuánto cuesta el servicio?</Text>
        <View style={styles.sectionContent}>
          <Text style={{ marginTop: 8 }}>
            Este precio incluye la emisión de un Recibo por honorarios de un abogado del estudio, 
            pero si desea boleta o factura del estudio deberá añadir el 18% de IGV
          </Text>
        </View>
      </View>

      {/* Sección: Medios de pago */}
      <View style={styles.section} wrap={false}>
        <Text style={styles.sectionTitle}>¿Cómo puedo pagar los honorarios?</Text>
        <View style={styles.sectionContent}>
          <Text>- Medios de pago: Transferencia, Yape o Plin</Text>
        </View>
      </View>
      
      {/* Pie de Página */}
      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>Atentamente:</Text>
        <Text style={styles.footerBrand}>FARMER & CAPITAL ABOGADOS</Text>
        <Text style={styles.footerText}>Tel: +51 968 140 000 | comercial.capitalfarmer@gmail.com</Text>
      </View>
    </Page>
  </Document>
  );

};

export default QuotePDF;