// Tipos para el sistema de solicitud de crédito TUBOS MONTERREY

export interface Cliente {
  id?: string;
  codigoSN: string;
  nombreSN: string;
  rfc: string;
  codigoCondicionesPago: string;
  codigoGrupo: string;
}

export interface AuthData {
  numeroCliente: string;
  rfc: string;
}

export interface Proveedor {
  nombre: string;
  domicilio: string;
  promedioCompra: string;
  lineaCredito: string;
  telefono: string;
}

export interface DatosBancarios {
  nombre: string;
  numeroSucursal: string;
  telefono: string;
  tipoCuenta: 'Cheques' | 'Débito' | 'Crédito';
  monto: string;
}

export interface Accionista {
  nombre: string;
  edad: string;
  numeroAcciones: string;
  telefono: string;
  domicilio: string;
  tipoDomicilio: 'PROPIO' | 'RENTA';
}

export interface FormularioPersonaFisica {
  // Datos básicos
  idCif: string;
  lineaCreditoSolicitada: string;
  agenteVentas: string;
  nombreTitular: string;
  telefonoFijo: string;
  celular: string;
  correoElectronico: string;
  tipoDomicilio: 'PROPIO' | 'RENTA';
  
  // Datos del negocio
  calleNumeroNegocio: string;
  telefonoNegocio: string;
  coloniaEstadoNegocio: string;
  codigoPostalNegocio: string;
  correoNegocio: string;
  tipoDomicilioNegocio: 'PROPIO' | 'RENTA';
  giroActividades: string;
  
  // Proveedores (3)
  proveedores: [Proveedor, Proveedor, Proveedor];
  
  // Datos bancarios
  datosBancarios: DatosBancarios;
  
  // Archivos
  archivos: FileList | null;
}

export interface FormularioPersonaMoral {
  // Datos básicos
  idCif: string;
  lineaCreditoSolicitada: string;
  agenteVentas: string;
  correoEmpresa: string;
  tipoDomicilioEmpresa: 'PROPIO' | 'RENTA';
  
  // Datos constitutivos
  fechaConstitucion: string;
  numeroEscritura: string;
  folioRegistro: string;
  fechaRegistro: string;
  capitalInicial: string;
  capitalActual: string;
  fechaUltimoAumento: string;
  
  // Datos del local
  calleNumeroLocal: string;
  telefonoLocal: string;
  coloniaEstadoLocal: string;
  codigoPostalLocal: string;
  correoLocal: string;
  tipoDomicilioLocal: 'PROPIO' | 'RENTA';
  
  // Accionistas (2)
  accionistas: [Accionista, Accionista];
  
  // Representantes
  representanteLegal: string;
  administrador: string;
  personaPoderDominio: string;
  puestoPoder: string;
  
  // Actividades
  giroActividades: string;
  
  // Proveedores (3)
  proveedores: [Proveedor, Proveedor, Proveedor];
  
  // Datos bancarios
  datosBancarios: DatosBancarios;
  
  // Archivos
  archivos: FileList | null;
}

export type TipoPersona = 'FISICA' | 'MORAL';

export interface SolicitudCredito {
  id: string;
  folio: string;
  tipoPersona: TipoPersona;
  cliente: Cliente;
  formulario: FormularioPersonaFisica | FormularioPersonaMoral;
  archivos: string[]; // URLs de Cloudinary
  fechaCreacion: Date;
  estado: 'PENDIENTE' | 'PROCESADA' | 'RECHAZADA';
}

export interface UploadedFile {
  file: File;
  description: string;
  quality?: number; // Calidad OCR
  textExtracted?: string; // Texto extraído por OCR
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'client';
  name: string;
}

export interface AdminState {
  isAuthenticated: boolean;
  user: User | null;
  clientesDatabase: Cliente[];
  solicitudes: SolicitudCredito[];
}
