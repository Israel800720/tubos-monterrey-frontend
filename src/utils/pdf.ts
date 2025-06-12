import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { FormularioPersonaFisica, FormularioPersonaMoral, TipoPersona, Cliente } from '../types';

/**
 * Genera un PDF con los datos del formulario
 */
export async function generarPDFSolicitud(
  cliente: Cliente,
  formulario: FormularioPersonaFisica | FormularioPersonaMoral,
  tipoPersona: TipoPersona,
  folio: string,
  archivosSubidos: string[]
): Promise<Uint8Array> {
  
  const pdfDoc = await PDFDocument.create();
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  let page = pdfDoc.addPage([612, 792]); // Tamaño carta
  const { width, height } = page.getSize();
  
  let yPosition = height - 60;
  const leftMargin = 50;
  const rightMargin = width - 50;
  const lineHeight = 15;

  // Función auxiliar para agregar texto
  const addText = (text: string, options: {
    x?: number;
    y?: number;
    size?: number;
    font?: any;
    color?: any;
    bold?: boolean;
  } = {}) => {
    const {
      x = leftMargin,
      y = yPosition,
      size = 10,
      font = helveticaFont,
      color = rgb(0, 0, 0),
      bold = false
    } = options;

    page.drawText(text, {
      x,
      y,
      size,
      font: bold ? helveticaBoldFont : font,
      color
    });
    
    if (options.y === undefined) {
      yPosition -= lineHeight;
    }
  };

  // Función para agregar nueva página si es necesario
  const checkNewPage = () => {
    if (yPosition < 60) {
      page = pdfDoc.addPage([612, 792]);
      yPosition = height - 60;
    }
  };

  // Encabezado
  addText('TUBOS MONTERREY, S.A. DE C.V.', {
    x: leftMargin,
    size: 16,
    bold: true
  });
  
  addText('SOLICITUD DE LÍNEA DE CRÉDITO', {
    x: leftMargin,
    size: 14,
    bold: true
  });
  
  yPosition -= 10;
  
  addText(`Folio: ${folio}`, { bold: true });
  addText(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, { bold: true });
  addText(`Tipo de Persona: ${tipoPersona === 'FISICA' ? 'Persona Física' : 'Persona Moral'}`, { bold: true });
  
  yPosition -= 10;

  // Datos del cliente
  addText('DATOS DEL CLIENTE', { size: 12, bold: true });
  addText(`Código: ${cliente.codigoSN}`);
  addText(`Nombre: ${cliente.nombreSN}`);
  addText(`RFC: ${cliente.rfc}`);
  addText(`Condiciones de Pago: ${cliente.codigoCondicionesPago} días`);
  addText(`Grupo: ${cliente.codigoGrupo}`);
  
  yPosition -= 10;

  // Datos del formulario
  addText('DATOS DE LA SOLICITUD', { size: 12, bold: true });
  
  if (tipoPersona === 'FISICA') {
    const form = formulario as FormularioPersonaFisica;
    
    addText(`ID CIF: ${form.idCif}`);
    addText(`Línea de Crédito Solicitada: ${form.lineaCreditoSolicitada}`);
    addText(`Agente de Ventas: ${form.agenteVentas || 'No especificado'}`);
    addText(`Nombre del Titular: ${form.nombreTitular}`);
    addText(`Teléfono Fijo: ${form.telefonoFijo}`);
    addText(`Celular: ${form.celular}`);
    addText(`Correo Electrónico: ${form.correoElectronico}`);
    addText(`Tipo de Domicilio: ${form.tipoDomicilio}`);
    
    checkNewPage();
    
    addText('DATOS DEL NEGOCIO', { size: 12, bold: true });
    addText(`Dirección del Negocio: ${form.calleNumeroNegocio}`);
    addText(`Teléfono del Negocio: ${form.telefonoNegocio}`);
    addText(`Colonia/Estado: ${form.coloniaEstadoNegocio}`);
    addText(`Código Postal: ${form.codigoPostalNegocio}`);
    addText(`Correo del Negocio: ${form.correoNegocio}`);
    addText(`Tipo de Domicilio del Negocio: ${form.tipoDomicilioNegocio}`);
    addText(`Giro y Actividades: ${form.giroActividades}`);
    
    checkNewPage();
    
    // Proveedores
    addText('PROVEEDORES PRINCIPALES', { size: 12, bold: true });
    form.proveedores.forEach((proveedor, index) => {
      addText(`${index + 1}. ${proveedor.nombre || 'No especificado'}`);
      addText(`   Domicilio: ${proveedor.domicilio || 'No especificado'}`);
      addText(`   Promedio de Compra: ${proveedor.promedioCompra || 'No especificado'}`);
      addText(`   Línea de Crédito: ${proveedor.lineaCredito || 'No especificado'}`);
      addText(`   Teléfono: ${proveedor.telefono || 'No especificado'}`);
      yPosition -= 5;
      checkNewPage();
    });
    
  } else {
    const form = formulario as FormularioPersonaMoral;
    
    addText(`ID CIF: ${form.idCif}`);
    addText(`Línea de Crédito Solicitada: ${form.lineaCreditoSolicitada}`);
    addText(`Agente de Ventas: ${form.agenteVentas || 'No especificado'}`);
    addText(`Correo de la Empresa: ${form.correoEmpresa}`);
    addText(`Tipo de Domicilio de la Empresa: ${form.tipoDomicilioEmpresa}`);
    
    checkNewPage();
    
    addText('DATOS CONSTITUTIVOS', { size: 12, bold: true });
    addText(`Fecha de Constitución: ${form.fechaConstitucion}`);
    addText(`Número de Escritura: ${form.numeroEscritura}`);
    addText(`Folio de Registro: ${form.folioRegistro}`);
    addText(`Fecha de Registro: ${form.fechaRegistro}`);
    addText(`Capital Inicial: ${form.capitalInicial}`);
    addText(`Capital Actual: ${form.capitalActual}`);
    addText(`Fecha Último Aumento: ${form.fechaUltimoAumento}`);
    
    checkNewPage();
    
    addText('DATOS DEL LOCAL', { size: 12, bold: true });
    addText(`Dirección del Local: ${form.calleNumeroLocal}`);
    addText(`Teléfono del Local: ${form.telefonoLocal}`);
    addText(`Colonia/Estado: ${form.coloniaEstadoLocal}`);
    addText(`Código Postal: ${form.codigoPostalLocal}`);
    addText(`Correo del Local: ${form.correoLocal}`);
    addText(`Tipo de Domicilio del Local: ${form.tipoDomicilioLocal}`);
    
    checkNewPage();
    
    // Accionistas
    addText('ACCIONISTAS', { size: 12, bold: true });
    form.accionistas.forEach((accionista, index) => {
      const tipo = index === 0 ? 'Mayoritario' : 'Segundo Mayor';
      addText(`Accionista ${tipo}: ${accionista.nombre || 'No especificado'}`);
      addText(`   Edad: ${accionista.edad || 'No especificado'}`);
      addText(`   Número de Acciones: ${accionista.numeroAcciones || 'No especificado'}`);
      addText(`   Teléfono: ${accionista.telefono || 'No especificado'}`);
      addText(`   Domicilio: ${accionista.domicilio || 'No especificado'}`);
      addText(`   Tipo de Domicilio: ${accionista.tipoDomicilio}`);
      yPosition -= 5;
      checkNewPage();
    });
    
    addText('REPRESENTANTES', { size: 12, bold: true });
    addText(`Representante Legal: ${form.representanteLegal}`);
    addText(`Administrador: ${form.administrador}`);
    addText(`Persona con Poder de Dominio: ${form.personaPoderDominio}`);
    addText(`Puesto: ${form.puestoPoder}`);
    addText(`Giro y Actividades: ${form.giroActividades}`);
    
    checkNewPage();
    
    // Proveedores
    addText('PROVEEDORES PRINCIPALES', { size: 12, bold: true });
    form.proveedores.forEach((proveedor, index) => {
      addText(`${index + 1}. ${proveedor.nombre || 'No especificado'}`);
      addText(`   Domicilio: ${proveedor.domicilio || 'No especificado'}`);
      addText(`   Promedio de Compra: ${proveedor.promedioCompra || 'No especificado'}`);
      addText(`   Línea de Crédito: ${proveedor.lineaCredito || 'No especificado'}`);
      addText(`   Teléfono: ${proveedor.telefono || 'No especificado'}`);
      yPosition -= 5;
      checkNewPage();
    });
  }

  // Datos bancarios (común para ambos tipos)
  const datosBancarios = formulario.datosBancarios;
  addText('DATOS BANCARIOS', { size: 12, bold: true });
  addText(`Banco: ${datosBancarios.nombre}`);
  addText(`Sucursal: ${datosBancarios.numeroSucursal}`);
  addText(`Teléfono del Banco: ${datosBancarios.telefono}`);
  addText(`Tipo de Cuenta: ${datosBancarios.tipoCuenta}`);
  addText(`Monto: ${datosBancarios.monto}`);
  
  yPosition -= 10;
  checkNewPage();

  // Lista de archivos
  addText('ARCHIVOS ADJUNTOS', { size: 12, bold: true });
  archivosSubidos.forEach((archivo, index) => {
    addText(`${index + 1}. ${archivo}`);
    checkNewPage();
  });

  // Pie de página
  yPosition = 60;
  addText('Esta solicitud fue generada automáticamente por el sistema de TUBOS MONTERREY, S.A. DE C.V.', {
    y: yPosition,
    size: 8,
    color: rgb(0.5, 0.5, 0.5)
  });

  return await pdfDoc.save();
}

/**
 * Descarga un PDF generado
 */
export function descargarPDF(pdfBytes: Uint8Array, filename: string): void {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  
  URL.revokeObjectURL(url);
}
