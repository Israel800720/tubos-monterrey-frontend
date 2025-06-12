import * as XLSX from 'xlsx';
import { Cliente, SolicitudCredito } from '../types';

/**
 * Lee un archivo Excel y extrae los datos de clientes
 */
export async function leerArchivoExcel(file: File): Promise<Cliente[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        
        // Tomar la primera hoja
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convertir a JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Procesar los datos
        const clientes: Cliente[] = [];
        
        // Saltar la primera fila si contiene encabezados
        const startRow = 1;
        
        for (let i = startRow; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          
          // Verificar que la fila tenga datos
          if (!row || row.length < 5) continue;
          
          const cliente: Cliente = {
            codigoSN: String(row[0] || '').trim(),
            nombreSN: String(row[1] || '').trim().toUpperCase(),
            rfc: String(row[2] || '').trim().toUpperCase(),
            codigoCondicionesPago: String(row[3] || '').trim(),
            codigoGrupo: String(row[4] || '').trim().toUpperCase()
          };
          
          // Validar que los campos obligatorios estén presentes
          if (cliente.codigoSN && cliente.nombreSN && cliente.rfc) {
            clientes.push(cliente);
          }
        }
        
        resolve(clientes);
      } catch (error) {
        reject(new Error('Error al procesar el archivo Excel: ' + error));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };
    
    reader.readAsBinaryString(file);
  });
}

/**
 * Genera un archivo Excel de layout para que el administrador sepa el formato
 */
export function generarLayoutExcel(): void {
  const data = [
    ['Código SN', 'Nombre SN', 'Número de identificación fiscal', 'Código de condiciones de pago', 'Código de grupo'],
    ['CLI001', 'FERRETERÍA GONZÁLEZ S.A. DE C.V.', 'FGO950523ABC', '30', 'A'],
    ['CLI002', 'CONSTRUCCIONES MARTÍNEZ', 'MARP801215DEF', '15', 'B'],
    ['CLI003', 'DISTRIBUIDORA INDUSTRIAL LÓPEZ S.A.', 'DIL920310GHI', '45', 'A'],
    ['CLI004', 'JUAN CARLOS HERNÁNDEZ RUIZ', 'HERJ850618JKL', '30', 'C'],
    ['CLI005', 'MATERIALES Y CONSTRUCCIÓN DEL NORTE S.A.', 'MCN880425MNO', '60', 'A']
  ];
  
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  
  // Agregar estilos a los encabezados
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:E1');
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!worksheet[cellAddress]) continue;
    worksheet[cellAddress].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: "FFFF00" } }
    };
  }
  
  // Configurar anchos de columna
  worksheet['!cols'] = [
    { width: 15 }, // Código SN
    { width: 40 }, // Nombre SN
    { width: 20 }, // RFC
    { width: 15 }, // Condiciones de pago
    { width: 10 }  // Grupo
  ];
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes');
  
  // Descargar el archivo
  XLSX.writeFile(workbook, 'layout_clientes_tubos_monterrey.xlsx');
}

/**
 * Exporta las solicitudes de crédito a Excel
 */
export function exportarSolicitudesAExcel(solicitudes: SolicitudCredito[]): void {
  const data = [
    [
      'Folio',
      'Fecha',
      'Tipo Persona',
      'Código Cliente',
      'Nombre Cliente',
      'RFC Cliente',
      'Línea Crédito Solicitada',
      'Estado',
      'Archivos Adjuntos'
    ]
  ];
  
  solicitudes.forEach(solicitud => {
    const formulario = solicitud.formulario as any;
    data.push([
      solicitud.folio,
      solicitud.fechaCreacion.toLocaleDateString('es-MX'),
      solicitud.tipoPersona === 'FISICA' ? 'Persona Física' : 'Persona Moral',
      solicitud.cliente.codigoSN,
      solicitud.cliente.nombreSN,
      solicitud.cliente.rfc,
      formulario.lineaCreditoSolicitada || '',
      solicitud.estado,
      solicitud.archivos.length.toString()
    ]);
  });
  
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  
  // Configurar anchos de columna
  worksheet['!cols'] = [
    { width: 15 }, // Folio
    { width: 12 }, // Fecha
    { width: 15 }, // Tipo Persona
    { width: 15 }, // Código Cliente
    { width: 40 }, // Nombre Cliente
    { width: 15 }, // RFC Cliente
    { width: 20 }, // Línea Crédito
    { width: 12 }, // Estado
    { width: 10 }  // Archivos
  ];
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Solicitudes');
  
  // Descargar el archivo
  const fecha = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `solicitudes_credito_${fecha}.xlsx`);
}

/**
 * Valida si un archivo es de Excel
 */
export function validarArchivoExcel(file: File): boolean {
  const extensionesValidas = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  
  return extensionesValidas.includes(file.type) || 
         file.name.endsWith('.xls') || 
         file.name.endsWith('.xlsx');
}

/**
 * Genera un respaldo de la base de datos actual antes de resetear
 */
export function generarRespaldoBaseDatos(clientes: Cliente[], solicitudes: SolicitudCredito[]): void {
  const workbook = XLSX.utils.book_new();
  
  // Hoja de clientes
  const clientesData = [
    ['Código SN', 'Nombre SN', 'RFC', 'Condiciones de Pago', 'Grupo']
  ];
  
  clientes.forEach(cliente => {
    clientesData.push([
      cliente.codigoSN,
      cliente.nombreSN,
      cliente.rfc,
      cliente.codigoCondicionesPago,
      cliente.codigoGrupo
    ]);
  });
  
  const clientesWorksheet = XLSX.utils.aoa_to_sheet(clientesData);
  XLSX.utils.book_append_sheet(workbook, clientesWorksheet, 'Clientes');
  
  // Hoja de solicitudes
  const solicitudesData = [
    [
      'ID', 'Folio', 'Fecha', 'Tipo Persona', 'Código Cliente', 
      'Nombre Cliente', 'RFC Cliente', 'Estado'
    ]
  ];
  
  solicitudes.forEach(solicitud => {
    solicitudesData.push([
      solicitud.id,
      solicitud.folio,
      solicitud.fechaCreacion.toISOString(),
      solicitud.tipoPersona,
      solicitud.cliente.codigoSN,
      solicitud.cliente.nombreSN,
      solicitud.cliente.rfc,
      solicitud.estado
    ]);
  });
  
  const solicitudesWorksheet = XLSX.utils.aoa_to_sheet(solicitudesData);
  XLSX.utils.book_append_sheet(workbook, solicitudesWorksheet, 'Solicitudes');
  
  // Descargar el respaldo
  const fecha = new Date().toISOString().split('T')[0];
  const hora = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
  XLSX.writeFile(workbook, `respaldo_tubos_monterrey_${fecha}_${hora}.xlsx`);
}
