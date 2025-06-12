import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, FileText, CheckCircle } from 'lucide-react';
import { FormularioPersonaMoral as IFormularioPersonaMoral, Cliente, Proveedor, DatosBancarios, Accionista } from '../../types';
import { SubidaArchivos } from './SubidaArchivos';

// Schema de validación para persona moral
const personaMoralSchema = z.object({
  idCif: z.string().min(1, 'El ID CIF es requerido'),
  lineaCreditoSolicitada: z.string().min(1, 'La línea de crédito solicitada es requerida'),
  agenteVentas: z.string().optional(),
  correoEmpresa: z.string().email('Correo electrónico inválido'),
  tipoDomicilioEmpresa: z.enum(['PROPIO', 'RENTA']),
  
  // Datos constitutivos
  fechaConstitucion: z.string().min(1, 'La fecha de constitución es requerida'),
  numeroEscritura: z.string().min(1, 'El número de escritura es requerido'),
  folioRegistro: z.string().min(1, 'El folio de registro es requerido'),
  fechaRegistro: z.string().min(1, 'La fecha de registro es requerida'),
  capitalInicial: z.string().min(1, 'El capital inicial es requerido'),
  capitalActual: z.string().min(1, 'El capital actual es requerido'),
  fechaUltimoAumento: z.string().min(1, 'La fecha del último aumento es requerida'),
  
  // Datos del local
  calleNumeroLocal: z.string().min(1, 'La dirección del local es requerida'),
  telefonoLocal: z.string().min(10, 'El teléfono del local debe tener al menos 10 dígitos'),
  coloniaEstadoLocal: z.string().min(1, 'La colonia y estado son requeridos'),
  codigoPostalLocal: z.string().min(5, 'El código postal debe tener al menos 5 dígitos'),
  correoLocal: z.string().email('Correo electrónico del local inválido'),
  tipoDomicilioLocal: z.enum(['PROPIO', 'RENTA']),
  
  // Accionistas
  accionista1Nombre: z.string().min(1, 'El nombre del accionista mayoritario es requerido'),
  accionista1Edad: z.string().min(1, 'La edad del accionista mayoritario es requerida'),
  accionista1NumeroAcciones: z.string().min(1, 'El número de acciones es requerido'),
  accionista1Telefono: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos'),
  accionista1Domicilio: z.string().min(1, 'El domicilio es requerido'),
  accionista1TipoDomicilio: z.enum(['PROPIO', 'RENTA']),
  
  accionista2Nombre: z.string().min(1, 'El nombre del segundo accionista es requerido'),
  accionista2Edad: z.string().min(1, 'La edad del segundo accionista es requerida'),
  accionista2NumeroAcciones: z.string().min(1, 'El número de acciones es requerido'),
  accionista2Telefono: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos'),
  accionista2Domicilio: z.string().min(1, 'El domicilio es requerido'),
  accionista2TipoDomicilio: z.enum(['PROPIO', 'RENTA']),
  
  // Representantes
  representanteLegal: z.string().min(1, 'El nombre del representante legal es requerido'),
  administrador: z.string().min(1, 'El nombre del administrador es requerido'),
  personaPoderDominio: z.string().min(1, 'El nombre de la persona con poder de dominio es requerido'),
  puestoPoder: z.string().min(1, 'El puesto o cargo es requerido'),
  giroActividades: z.string().min(1, 'El giro y actividades son requeridos'),
  
  // Proveedores (opcionales)
  proveedor1Nombre: z.string().optional(),
  proveedor1Domicilio: z.string().optional(),
  proveedor1PromedioCompra: z.string().optional(),
  proveedor1LineaCredito: z.string().optional(),
  proveedor1Telefono: z.string().optional(),
  
  proveedor2Nombre: z.string().optional(),
  proveedor2Domicilio: z.string().optional(),
  proveedor2PromedioCompra: z.string().optional(),
  proveedor2LineaCredito: z.string().optional(),
  proveedor2Telefono: z.string().optional(),
  
  proveedor3Nombre: z.string().optional(),
  proveedor3Domicilio: z.string().optional(),
  proveedor3PromedioCompra: z.string().optional(),
  proveedor3LineaCredito: z.string().optional(),
  proveedor3Telefono: z.string().optional(),
  
  // Datos bancarios
  bancoNombre: z.string().min(1, 'El nombre del banco es requerido'),
  bancoNumeroSucursal: z.string().min(1, 'El número de sucursal es requerido'),
  bancoTelefono: z.string().min(10, 'El teléfono del banco debe tener al menos 10 dígitos'),
  bancoTipoCuenta: z.enum(['Cheques', 'Débito', 'Crédito']),
  bancoMonto: z.string().min(1, 'El monto es requerido')
});

type PersonaMoralFormData = z.infer<typeof personaMoralSchema>;

interface FormularioPersonaMoralProps {
  cliente: Cliente;
  onSubmit: (data: IFormularioPersonaMoral, archivos: File[]) => Promise<void>;
  onCancel: () => void;
}

export function FormularioPersonaMoral({ cliente, onSubmit, onCancel }: FormularioPersonaMoralProps) {
  const [archivos, setArchivos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger
  } = useForm<PersonaMoralFormData>({
    resolver: zodResolver(personaMoralSchema),
    defaultValues: {
      tipoDomicilioEmpresa: 'PROPIO',
      tipoDomicilioLocal: 'PROPIO',
      accionista1TipoDomicilio: 'PROPIO',
      accionista2TipoDomicilio: 'PROPIO',
      bancoTipoCuenta: 'Cheques'
    }
  });

  const handleNextStep = async () => {
    let fieldsToValidate: (keyof PersonaMoralFormData)[] = [];
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = [
          'idCif', 'lineaCreditoSolicitada', 'correoEmpresa', 'tipoDomicilioEmpresa'
        ];
        break;
      case 2:
        fieldsToValidate = [
          'fechaConstitucion', 'numeroEscritura', 'folioRegistro', 'fechaRegistro',
          'capitalInicial', 'capitalActual', 'fechaUltimoAumento'
        ];
        break;
      case 3:
        fieldsToValidate = [
          'calleNumeroLocal', 'telefonoLocal', 'coloniaEstadoLocal',
          'codigoPostalLocal', 'correoLocal', 'tipoDomicilioLocal',
          'accionista1Nombre', 'accionista1Edad', 'accionista1NumeroAcciones',
          'accionista1Telefono', 'accionista1Domicilio', 'accionista1TipoDomicilio',
          'accionista2Nombre', 'accionista2Edad', 'accionista2NumeroAcciones',
          'accionista2Telefono', 'accionista2Domicilio', 'accionista2TipoDomicilio',
          'representanteLegal', 'administrador', 'personaPoderDominio', 'puestoPoder', 'giroActividades'
        ];
        break;
      case 4:
        fieldsToValidate = [
          'bancoNombre', 'bancoNumeroSucursal', 'bancoTelefono', 'bancoTipoCuenta', 'bancoMonto'
        ];
        break;
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const onFormSubmit = async (data: PersonaMoralFormData) => {
    if (archivos.length === 0) {
      alert('Debe subir al menos un archivo requerido');
      setCurrentStep(5);
      return;
    }

    setSubmitting(true);
    
    try {
      // Construir proveedores
      const proveedores: [Proveedor, Proveedor, Proveedor] = [
        {
          nombre: data.proveedor1Nombre || '',
          domicilio: data.proveedor1Domicilio || '',
          promedioCompra: data.proveedor1PromedioCompra || '',
          lineaCredito: data.proveedor1LineaCredito || '',
          telefono: data.proveedor1Telefono || ''
        },
        {
          nombre: data.proveedor2Nombre || '',
          domicilio: data.proveedor2Domicilio || '',
          promedioCompra: data.proveedor2PromedioCompra || '',
          lineaCredito: data.proveedor2LineaCredito || '',
          telefono: data.proveedor2Telefono || ''
        },
        {
          nombre: data.proveedor3Nombre || '',
          domicilio: data.proveedor3Domicilio || '',
          promedioCompra: data.proveedor3PromedioCompra || '',
          lineaCredito: data.proveedor3LineaCredito || '',
          telefono: data.proveedor3Telefono || ''
        }
      ];

      // Construir accionistas
      const accionistas: [Accionista, Accionista] = [
        {
          nombre: data.accionista1Nombre.toUpperCase(),
          edad: data.accionista1Edad,
          numeroAcciones: data.accionista1NumeroAcciones,
          telefono: data.accionista1Telefono,
          domicilio: data.accionista1Domicilio.toUpperCase(),
          tipoDomicilio: data.accionista1TipoDomicilio
        },
        {
          nombre: data.accionista2Nombre.toUpperCase(),
          edad: data.accionista2Edad,
          numeroAcciones: data.accionista2NumeroAcciones,
          telefono: data.accionista2Telefono,
          domicilio: data.accionista2Domicilio.toUpperCase(),
          tipoDomicilio: data.accionista2TipoDomicilio
        }
      ];

      // Construir datos bancarios
      const datosBancarios: DatosBancarios = {
        nombre: data.bancoNombre,
        numeroSucursal: data.bancoNumeroSucursal,
        telefono: data.bancoTelefono,
        tipoCuenta: data.bancoTipoCuenta,
        monto: data.bancoMonto
      };

      // Construir formulario completo
      const formulario: IFormularioPersonaMoral = {
        idCif: data.idCif.toUpperCase(),
        lineaCreditoSolicitada: data.lineaCreditoSolicitada,
        agenteVentas: data.agenteVentas || '',
        correoEmpresa: data.correoEmpresa.toLowerCase(),
        tipoDomicilioEmpresa: data.tipoDomicilioEmpresa,
        fechaConstitucion: data.fechaConstitucion,
        numeroEscritura: data.numeroEscritura,
        folioRegistro: data.folioRegistro,
        fechaRegistro: data.fechaRegistro,
        capitalInicial: data.capitalInicial,
        capitalActual: data.capitalActual,
        fechaUltimoAumento: data.fechaUltimoAumento,
        calleNumeroLocal: data.calleNumeroLocal.toUpperCase(),
        telefonoLocal: data.telefonoLocal,
        coloniaEstadoLocal: data.coloniaEstadoLocal.toUpperCase(),
        codigoPostalLocal: data.codigoPostalLocal,
        correoLocal: data.correoLocal.toLowerCase(),
        tipoDomicilioLocal: data.tipoDomicilioLocal,
        accionistas,
        representanteLegal: data.representanteLegal.toUpperCase(),
        administrador: data.administrador.toUpperCase(),
        personaPoderDominio: data.personaPoderDominio.toUpperCase(),
        puestoPoder: data.puestoPoder.toUpperCase(),
        giroActividades: data.giroActividades.toUpperCase(),
        proveedores,
        datosBancarios,
        archivos: null
      };

      await onSubmit(formulario, archivos);
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      alert('Error al enviar la solicitud. Por favor intente nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Datos Básicos de la Empresa</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="idCif">ID CIF de la Empresa *</Label>
                <Input
                  id="idCif"
                  {...register('idCif')}
                  className={errors.idCif ? 'border-red-300' : ''}
                />
                {errors.idCif && <p className="text-red-500 text-xs mt-1">{errors.idCif.message}</p>}
              </div>

              <div>
                <Label htmlFor="lineaCreditoSolicitada">Línea de Crédito Solicitada *</Label>
                <Input
                  id="lineaCreditoSolicitada"
                  {...register('lineaCreditoSolicitada')}
                  placeholder="Ej: $500,000.00"
                  className={errors.lineaCreditoSolicitada ? 'border-red-300' : ''}
                />
                {errors.lineaCreditoSolicitada && <p className="text-red-500 text-xs mt-1">{errors.lineaCreditoSolicitada.message}</p>}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="agenteVentas">Nombre del Agente de Ventas (si lo conoce)</Label>
                <Input
                  id="agenteVentas"
                  {...register('agenteVentas')}
                  placeholder="Opcional"
                />
              </div>

              <div>
                <Label htmlFor="correoEmpresa">Correo Electrónico de la Empresa *</Label>
                <Input
                  id="correoEmpresa"
                  type="email"
                  {...register('correoEmpresa')}
                  className={errors.correoEmpresa ? 'border-red-300' : ''}
                />
                {errors.correoEmpresa && <p className="text-red-500 text-xs mt-1">{errors.correoEmpresa.message}</p>}
              </div>

              <div>
                <Label htmlFor="tipoDomicilioEmpresa">Tipo de Domicilio de la Empresa *</Label>
                <Select onValueChange={(value) => setValue('tipoDomicilioEmpresa', value as 'PROPIO' | 'RENTA')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PROPIO">PROPIO</SelectItem>
                    <SelectItem value="RENTA">RENTA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Datos Constitutivos</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fechaConstitucion">Fecha de Constitución *</Label>
                <Input
                  id="fechaConstitucion"
                  type="date"
                  {...register('fechaConstitucion')}
                  className={errors.fechaConstitucion ? 'border-red-300' : ''}
                />
                {errors.fechaConstitucion && <p className="text-red-500 text-xs mt-1">{errors.fechaConstitucion.message}</p>}
              </div>

              <div>
                <Label htmlFor="numeroEscritura">Número de Escritura *</Label>
                <Input
                  id="numeroEscritura"
                  {...register('numeroEscritura')}
                  className={errors.numeroEscritura ? 'border-red-300' : ''}
                />
                {errors.numeroEscritura && <p className="text-red-500 text-xs mt-1">{errors.numeroEscritura.message}</p>}
              </div>

              <div>
                <Label htmlFor="folioRegistro">Folio de Inscripción en Registro Público *</Label>
                <Input
                  id="folioRegistro"
                  {...register('folioRegistro')}
                  className={errors.folioRegistro ? 'border-red-300' : ''}
                />
                {errors.folioRegistro && <p className="text-red-500 text-xs mt-1">{errors.folioRegistro.message}</p>}
              </div>

              <div>
                <Label htmlFor="fechaRegistro">Fecha de Inscripción en Registro Público *</Label>
                <Input
                  id="fechaRegistro"
                  type="date"
                  {...register('fechaRegistro')}
                  className={errors.fechaRegistro ? 'border-red-300' : ''}
                />
                {errors.fechaRegistro && <p className="text-red-500 text-xs mt-1">{errors.fechaRegistro.message}</p>}
              </div>

              <div>
                <Label htmlFor="capitalInicial">Capital Inicial *</Label>
                <Input
                  id="capitalInicial"
                  {...register('capitalInicial')}
                  placeholder="$0.00"
                  className={errors.capitalInicial ? 'border-red-300' : ''}
                />
                {errors.capitalInicial && <p className="text-red-500 text-xs mt-1">{errors.capitalInicial.message}</p>}
              </div>

              <div>
                <Label htmlFor="capitalActual">Capital Actual *</Label>
                <Input
                  id="capitalActual"
                  {...register('capitalActual')}
                  placeholder="$0.00"
                  className={errors.capitalActual ? 'border-red-300' : ''}
                />
                {errors.capitalActual && <p className="text-red-500 text-xs mt-1">{errors.capitalActual.message}</p>}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="fechaUltimoAumento">Fecha del Último Aumento de Capital *</Label>
                <Input
                  id="fechaUltimoAumento"
                  type="date"
                  {...register('fechaUltimoAumento')}
                  className={errors.fechaUltimoAumento ? 'border-red-300' : ''}
                />
                {errors.fechaUltimoAumento && <p className="text-red-500 text-xs mt-1">{errors.fechaUltimoAumento.message}</p>}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Datos del Local */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Datos del Local, Sucursal o Negocio</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="calleNumeroLocal">Calle y Número del Local *</Label>
                  <Input
                    id="calleNumeroLocal"
                    {...register('calleNumeroLocal')}
                    className={errors.calleNumeroLocal ? 'border-red-300' : ''}
                  />
                  {errors.calleNumeroLocal && <p className="text-red-500 text-xs mt-1">{errors.calleNumeroLocal.message}</p>}
                </div>

                <div>
                  <Label htmlFor="telefonoLocal">Teléfono del Local *</Label>
                  <Input
                    id="telefonoLocal"
                    {...register('telefonoLocal')}
                    className={errors.telefonoLocal ? 'border-red-300' : ''}
                  />
                  {errors.telefonoLocal && <p className="text-red-500 text-xs mt-1">{errors.telefonoLocal.message}</p>}
                </div>

                <div>
                  <Label htmlFor="codigoPostalLocal">Código Postal *</Label>
                  <Input
                    id="codigoPostalLocal"
                    {...register('codigoPostalLocal')}
                    className={errors.codigoPostalLocal ? 'border-red-300' : ''}
                  />
                  {errors.codigoPostalLocal && <p className="text-red-500 text-xs mt-1">{errors.codigoPostalLocal.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="coloniaEstadoLocal">Colonia, Delegación o Municipio y Estado *</Label>
                  <Input
                    id="coloniaEstadoLocal"
                    {...register('coloniaEstadoLocal')}
                    className={errors.coloniaEstadoLocal ? 'border-red-300' : ''}
                  />
                  {errors.coloniaEstadoLocal && <p className="text-red-500 text-xs mt-1">{errors.coloniaEstadoLocal.message}</p>}
                </div>

                <div>
                  <Label htmlFor="correoLocal">Correo Electrónico del Local *</Label>
                  <Input
                    id="correoLocal"
                    type="email"
                    {...register('correoLocal')}
                    className={errors.correoLocal ? 'border-red-300' : ''}
                  />
                  {errors.correoLocal && <p className="text-red-500 text-xs mt-1">{errors.correoLocal.message}</p>}
                </div>

                <div>
                  <Label htmlFor="tipoDomicilioLocal">Tipo de Domicilio del Local *</Label>
                  <Select onValueChange={(value) => setValue('tipoDomicilioLocal', value as 'PROPIO' | 'RENTA')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PROPIO">PROPIO</SelectItem>
                      <SelectItem value="RENTA">RENTA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Accionistas */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Accionistas</h3>
              
              {[1, 2].map((num) => (
                <Card key={num} className="mb-4">
                  <CardHeader>
                    <CardTitle className="text-sm">
                      {num === 1 ? 'Accionista Mayoritario' : 'Segundo Mayor Accionista'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nombre Completo *</Label>
                        <Input 
                          {...register(`accionista${num}Nombre` as keyof PersonaMoralFormData)}
                          className={errors[`accionista${num}Nombre` as keyof PersonaMoralFormData] ? 'border-red-300' : ''}
                        />
                        {errors[`accionista${num}Nombre` as keyof PersonaMoralFormData] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors[`accionista${num}Nombre` as keyof PersonaMoralFormData]?.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label>Edad *</Label>
                        <Input 
                          type="number"
                          {...register(`accionista${num}Edad` as keyof PersonaMoralFormData)}
                          className={errors[`accionista${num}Edad` as keyof PersonaMoralFormData] ? 'border-red-300' : ''}
                        />
                        {errors[`accionista${num}Edad` as keyof PersonaMoralFormData] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors[`accionista${num}Edad` as keyof PersonaMoralFormData]?.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label>Número de Acciones *</Label>
                        <Input 
                          {...register(`accionista${num}NumeroAcciones` as keyof PersonaMoralFormData)}
                          className={errors[`accionista${num}NumeroAcciones` as keyof PersonaMoralFormData] ? 'border-red-300' : ''}
                        />
                        {errors[`accionista${num}NumeroAcciones` as keyof PersonaMoralFormData] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors[`accionista${num}NumeroAcciones` as keyof PersonaMoralFormData]?.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label>Teléfono *</Label>
                        <Input 
                          {...register(`accionista${num}Telefono` as keyof PersonaMoralFormData)}
                          className={errors[`accionista${num}Telefono` as keyof PersonaMoralFormData] ? 'border-red-300' : ''}
                        />
                        {errors[`accionista${num}Telefono` as keyof PersonaMoralFormData] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors[`accionista${num}Telefono` as keyof PersonaMoralFormData]?.message}
                          </p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <Label>Domicilio Completo *</Label>
                        <Input 
                          {...register(`accionista${num}Domicilio` as keyof PersonaMoralFormData)}
                          className={errors[`accionista${num}Domicilio` as keyof PersonaMoralFormData] ? 'border-red-300' : ''}
                        />
                        {errors[`accionista${num}Domicilio` as keyof PersonaMoralFormData] && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors[`accionista${num}Domicilio` as keyof PersonaMoralFormData]?.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label>Tipo de Domicilio *</Label>
                        <Select onValueChange={(value) => setValue(`accionista${num}TipoDomicilio` as keyof PersonaMoralFormData, value as 'PROPIO' | 'RENTA')}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PROPIO">PROPIO</SelectItem>
                            <SelectItem value="RENTA">RENTA</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Representantes */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Representantes y Administración</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="representanteLegal">Representante Legal *</Label>
                  <Input
                    id="representanteLegal"
                    {...register('representanteLegal')}
                    className={errors.representanteLegal ? 'border-red-300' : ''}
                  />
                  {errors.representanteLegal && <p className="text-red-500 text-xs mt-1">{errors.representanteLegal.message}</p>}
                </div>

                <div>
                  <Label htmlFor="administrador">Administrador *</Label>
                  <Input
                    id="administrador"
                    {...register('administrador')}
                    className={errors.administrador ? 'border-red-300' : ''}
                  />
                  {errors.administrador && <p className="text-red-500 text-xs mt-1">{errors.administrador.message}</p>}
                </div>

                <div>
                  <Label htmlFor="personaPoderDominio">Persona con Poder de Dominio *</Label>
                  <Input
                    id="personaPoderDominio"
                    {...register('personaPoderDominio')}
                    className={errors.personaPoderDominio ? 'border-red-300' : ''}
                  />
                  {errors.personaPoderDominio && <p className="text-red-500 text-xs mt-1">{errors.personaPoderDominio.message}</p>}
                </div>

                <div>
                  <Label htmlFor="puestoPoder">Puesto o Cargo *</Label>
                  <Input
                    id="puestoPoder"
                    {...register('puestoPoder')}
                    className={errors.puestoPoder ? 'border-red-300' : ''}
                  />
                  {errors.puestoPoder && <p className="text-red-500 text-xs mt-1">{errors.puestoPoder.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="giroActividades">Giro y/o Actividades del Negocio *</Label>
                  <Textarea
                    id="giroActividades"
                    {...register('giroActividades')}
                    className={errors.giroActividades ? 'border-red-300' : ''}
                    rows={3}
                  />
                  {errors.giroActividades && <p className="text-red-500 text-xs mt-1">{errors.giroActividades.message}</p>}
                </div>
              </div>
            </div>

            {/* Proveedores */}
            <div>
              <h4 className="text-md font-semibold mb-4">Proveedores Principales</h4>
              
              {[1, 2, 3].map((num) => (
                <Card key={num} className="mb-4">
                  <CardHeader>
                    <CardTitle className="text-sm">
                      {num === 1 ? 'Primer' : num === 2 ? 'Segundo' : 'Tercer'} Principal Proveedor
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nombre del Proveedor</Label>
                        <Input {...register(`proveedor${num}Nombre` as keyof PersonaMoralFormData)} />
                      </div>
                      <div>
                        <Label>Teléfono</Label>
                        <Input {...register(`proveedor${num}Telefono` as keyof PersonaMoralFormData)} />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Domicilio</Label>
                        <Input {...register(`proveedor${num}Domicilio` as keyof PersonaMoralFormData)} />
                      </div>
                      <div>
                        <Label>Promedio de Compra</Label>
                        <Input {...register(`proveedor${num}PromedioCompra` as keyof PersonaMoralFormData)} placeholder="$0.00" />
                      </div>
                      <div>
                        <Label>Línea de Crédito</Label>
                        <Input {...register(`proveedor${num}LineaCredito` as keyof PersonaMoralFormData)} placeholder="$0.00" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Datos Bancarios</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bancoNombre">Nombre del Banco *</Label>
                <Input
                  id="bancoNombre"
                  {...register('bancoNombre')}
                  className={errors.bancoNombre ? 'border-red-300' : ''}
                />
                {errors.bancoNombre && <p className="text-red-500 text-xs mt-1">{errors.bancoNombre.message}</p>}
              </div>

              <div>
                <Label htmlFor="bancoNumeroSucursal">Número y Nombre de Sucursal *</Label>
                <Input
                  id="bancoNumeroSucursal"
                  {...register('bancoNumeroSucursal')}
                  className={errors.bancoNumeroSucursal ? 'border-red-300' : ''}
                />
                {errors.bancoNumeroSucursal && <p className="text-red-500 text-xs mt-1">{errors.bancoNumeroSucursal.message}</p>}
              </div>

              <div>
                <Label htmlFor="bancoTelefono">Teléfono del Banco *</Label>
                <Input
                  id="bancoTelefono"
                  {...register('bancoTelefono')}
                  className={errors.bancoTelefono ? 'border-red-300' : ''}
                />
                {errors.bancoTelefono && <p className="text-red-500 text-xs mt-1">{errors.bancoTelefono.message}</p>}
              </div>

              <div>
                <Label htmlFor="bancoTipoCuenta">Tipo de Cuenta *</Label>
                <Select onValueChange={(value) => setValue('bancoTipoCuenta', value as 'Cheques' | 'Débito' | 'Crédito')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cheques">Cheques</SelectItem>
                    <SelectItem value="Débito">Débito</SelectItem>
                    <SelectItem value="Crédito">Crédito</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="bancoMonto">Monto de la Cuenta o Crédito *</Label>
                <Input
                  id="bancoMonto"
                  {...register('bancoMonto')}
                  placeholder="$0.00"
                  className={errors.bancoMonto ? 'border-red-300' : ''}
                />
                {errors.bancoMonto && <p className="text-red-500 text-xs mt-1">{errors.bancoMonto.message}</p>}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Documentos Requeridos</h3>
            
            <Alert className="mb-6">
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <strong>Archivos requeridos para Persona Moral:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Constancia de Situación Fiscal reciente de la empresa</li>
                  <li>Copia de Acta Constitutiva y/o la última modificación</li>
                  <li>Estados financieros vigentes y originales, firmados por el representante legal y contador</li>
                  <li>Copia de Cédula Profesional de quien firma los estados financieros</li>
                  <li>Copia de comprobante de Domicilio (teléfono) de la empresa</li>
                  <li>Declaración Anual (PDF Original)</li>
                  <li>Opinión de Cumplimiento SAT (PDF Original)</li>
                  <li>Identificación oficial vigente (INE o IFE) del representante legal de la empresa</li>
                  <li>Constancia de Situación Fiscal reciente del representante legal de la empresa</li>
                  <li>Comprobante de Domicilio (teléfono) del representante legal de la empresa</li>
                  <li>Poder Notarial en caso de no aparecer en el Acta Constitutiva</li>
                  <li>Identificación oficial vigente (INE o IFE) del aval (debe ser otra persona que no sea el representante legal)</li>
                  <li>Constancia de Situación Fiscal reciente del aval (debe ser otra persona que no sea el representante legal)</li>
                  <li>Comprobante de Domicilio (teléfono) del aval (debe ser otra persona que no sea el representante legal)</li>
                  <li>Poder Notarial del aval en caso de no aparecer en el Acta Constitutiva</li>
                </ul>
              </AlertDescription>
            </Alert>

            <SubidaArchivos
              archivos={archivos}
              onArchivosChange={setArchivos}
              tipoPersona="MORAL"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Solicitud de Línea de Crédito - Persona Moral</span>
            <span className="text-sm font-normal text-gray-500">
              Paso {currentStep} de {totalSteps}
            </span>
          </CardTitle>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
          
          <div className="text-sm text-gray-600 mt-2">
            Cliente: <strong>{cliente.nombreSN}</strong> | RFC: <strong>{cliente.rfc}</strong>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onFormSubmit)}>
            {renderStep()}
            
            <div className="flex justify-between mt-8">
              <div className="space-x-2">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevStep}
                    disabled={submitting}
                  >
                    Anterior
                  </Button>
                )}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
              </div>
              
              <div>
                {currentStep < totalSteps ? (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    disabled={submitting}
                  >
                    Siguiente
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={submitting || archivos.length === 0}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Enviar Solicitud
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
