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
import { Loader2, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { FormularioPersonaFisica as IFormularioPersonaFisica, Cliente, Proveedor, DatosBancarios } from '../../types';
import { SubidaArchivos } from './SubidaArchivos';

// Schema de validación
const personaFisicaSchema = z.object({
  idCif: z.string().min(1, 'El ID CIF es requerido'),
  lineaCreditoSolicitada: z.string().min(1, 'La línea de crédito solicitada es requerida'),
  agenteVentas: z.string().optional(),
  nombreTitular: z.string().min(1, 'El nombre del titular es requerido'),
  telefonoFijo: z.string().min(10, 'El teléfono fijo debe tener al menos 10 dígitos'),
  celular: z.string().min(10, 'El celular debe tener al menos 10 dígitos'),
  correoElectronico: z.string().email('Correo electrónico inválido'),
  tipoDomicilio: z.enum(['PROPIO', 'RENTA']),
  
  // Datos del negocio
  calleNumeroNegocio: z.string().min(1, 'La dirección del negocio es requerida'),
  telefonoNegocio: z.string().min(10, 'El teléfono del negocio debe tener al menos 10 dígitos'),
  coloniaEstadoNegocio: z.string().min(1, 'La colonia y estado son requeridos'),
  codigoPostalNegocio: z.string().min(5, 'El código postal debe tener al menos 5 dígitos'),
  correoNegocio: z.string().email('Correo electrónico del negocio inválido'),
  tipoDomicilioNegocio: z.enum(['PROPIO', 'RENTA']),
  giroActividades: z.string().min(1, 'El giro y actividades son requeridos'),
  
  // Proveedores
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

type PersonaFisicaFormData = z.infer<typeof personaFisicaSchema>;

interface FormularioPersonaFisicaProps {
  cliente: Cliente;
  onSubmit: (data: IFormularioPersonaFisica, archivos: File[]) => Promise<void>;
  onCancel: () => void;
}

export function FormularioPersonaFisica({ cliente, onSubmit, onCancel }: FormularioPersonaFisicaProps) {
  const [archivos, setArchivos] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger
  } = useForm<PersonaFisicaFormData>({
    resolver: zodResolver(personaFisicaSchema),
    defaultValues: {
      tipoDomicilio: 'PROPIO',
      tipoDomicilioNegocio: 'PROPIO',
      bancoTipoCuenta: 'Cheques'
    }
  });

  const handleNextStep = async () => {
    let fieldsToValidate: (keyof PersonaFisicaFormData)[] = [];
    
    switch (currentStep) {
      case 1:
        fieldsToValidate = [
          'idCif', 'lineaCreditoSolicitada', 'nombreTitular', 
          'telefonoFijo', 'celular', 'correoElectronico', 'tipoDomicilio'
        ];
        break;
      case 2:
        fieldsToValidate = [
          'calleNumeroNegocio', 'telefonoNegocio', 'coloniaEstadoNegocio',
          'codigoPostalNegocio', 'correoNegocio', 'tipoDomicilioNegocio', 'giroActividades'
        ];
        break;
      case 3:
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

  const onFormSubmit = async (data: PersonaFisicaFormData) => {
    if (archivos.length === 0) {
      alert('Debe subir al menos un archivo requerido');
      setCurrentStep(4);
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

      // Construir datos bancarios
      const datosBancarios: DatosBancarios = {
        nombre: data.bancoNombre,
        numeroSucursal: data.bancoNumeroSucursal,
        telefono: data.bancoTelefono,
        tipoCuenta: data.bancoTipoCuenta,
        monto: data.bancoMonto
      };

      // Construir formulario completo
      const formulario: IFormularioPersonaFisica = {
        idCif: data.idCif.toUpperCase(),
        lineaCreditoSolicitada: data.lineaCreditoSolicitada,
        agenteVentas: data.agenteVentas || '',
        nombreTitular: data.nombreTitular.toUpperCase(),
        telefonoFijo: data.telefonoFijo,
        celular: data.celular,
        correoElectronico: data.correoElectronico.toLowerCase(),
        tipoDomicilio: data.tipoDomicilio,
        calleNumeroNegocio: data.calleNumeroNegocio.toUpperCase(),
        telefonoNegocio: data.telefonoNegocio,
        coloniaEstadoNegocio: data.coloniaEstadoNegocio.toUpperCase(),
        codigoPostalNegocio: data.codigoPostalNegocio,
        correoNegocio: data.correoNegocio.toLowerCase(),
        tipoDomicilioNegocio: data.tipoDomicilioNegocio,
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
            <h3 className="text-lg font-semibold mb-4">Datos Personales del Titular</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="idCif">ID CIF (tal como aparece en constancia fiscal) *</Label>
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
                  placeholder="Ej: $100,000.00"
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

              <div className="md:col-span-2">
                <Label htmlFor="nombreTitular">Nombre Completo del Titular *</Label>
                <Input
                  id="nombreTitular"
                  {...register('nombreTitular')}
                  className={errors.nombreTitular ? 'border-red-300' : ''}
                />
                {errors.nombreTitular && <p className="text-red-500 text-xs mt-1">{errors.nombreTitular.message}</p>}
              </div>

              <div>
                <Label htmlFor="telefonoFijo">Teléfono Fijo *</Label>
                <Input
                  id="telefonoFijo"
                  {...register('telefonoFijo')}
                  placeholder="55 1234 5678"
                  className={errors.telefonoFijo ? 'border-red-300' : ''}
                />
                {errors.telefonoFijo && <p className="text-red-500 text-xs mt-1">{errors.telefonoFijo.message}</p>}
              </div>

              <div>
                <Label htmlFor="celular">Número de Celular *</Label>
                <Input
                  id="celular"
                  {...register('celular')}
                  placeholder="55 9876 5432"
                  className={errors.celular ? 'border-red-300' : ''}
                />
                {errors.celular && <p className="text-red-500 text-xs mt-1">{errors.celular.message}</p>}
              </div>

              <div>
                <Label htmlFor="correoElectronico">Correo Electrónico *</Label>
                <Input
                  id="correoElectronico"
                  type="email"
                  {...register('correoElectronico')}
                  placeholder="ejemplo@correo.com"
                  className={errors.correoElectronico ? 'border-red-300' : ''}
                />
                {errors.correoElectronico && <p className="text-red-500 text-xs mt-1">{errors.correoElectronico.message}</p>}
              </div>

              <div>
                <Label htmlFor="tipoDomicilio">Tipo de Domicilio *</Label>
                <Select onValueChange={(value) => setValue('tipoDomicilio', value as 'PROPIO' | 'RENTA')}>
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
            <h3 className="text-lg font-semibold mb-4">Datos del Local o Negocio</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="calleNumeroNegocio">Calle y Número del Domicilio del Negocio *</Label>
                <Input
                  id="calleNumeroNegocio"
                  {...register('calleNumeroNegocio')}
                  className={errors.calleNumeroNegocio ? 'border-red-300' : ''}
                />
                {errors.calleNumeroNegocio && <p className="text-red-500 text-xs mt-1">{errors.calleNumeroNegocio.message}</p>}
              </div>

              <div>
                <Label htmlFor="telefonoNegocio">Teléfono del Negocio *</Label>
                <Input
                  id="telefonoNegocio"
                  {...register('telefonoNegocio')}
                  className={errors.telefonoNegocio ? 'border-red-300' : ''}
                />
                {errors.telefonoNegocio && <p className="text-red-500 text-xs mt-1">{errors.telefonoNegocio.message}</p>}
              </div>

              <div>
                <Label htmlFor="codigoPostalNegocio">Código Postal *</Label>
                <Input
                  id="codigoPostalNegocio"
                  {...register('codigoPostalNegocio')}
                  className={errors.codigoPostalNegocio ? 'border-red-300' : ''}
                />
                {errors.codigoPostalNegocio && <p className="text-red-500 text-xs mt-1">{errors.codigoPostalNegocio.message}</p>}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="coloniaEstadoNegocio">Colonia, Delegación o Municipio y Estado *</Label>
                <Input
                  id="coloniaEstadoNegocio"
                  {...register('coloniaEstadoNegocio')}
                  className={errors.coloniaEstadoNegocio ? 'border-red-300' : ''}
                />
                {errors.coloniaEstadoNegocio && <p className="text-red-500 text-xs mt-1">{errors.coloniaEstadoNegocio.message}</p>}
              </div>

              <div>
                <Label htmlFor="correoNegocio">Correo Electrónico del Negocio *</Label>
                <Input
                  id="correoNegocio"
                  type="email"
                  {...register('correoNegocio')}
                  className={errors.correoNegocio ? 'border-red-300' : ''}
                />
                {errors.correoNegocio && <p className="text-red-500 text-xs mt-1">{errors.correoNegocio.message}</p>}
              </div>

              <div>
                <Label htmlFor="tipoDomicilioNegocio">Tipo de Domicilio del Negocio *</Label>
                <Select onValueChange={(value) => setValue('tipoDomicilioNegocio', value as 'PROPIO' | 'RENTA')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PROPIO">PROPIO</SelectItem>
                    <SelectItem value="RENTA">RENTA</SelectItem>
                  </SelectContent>
                </Select>
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

            {/* Proveedores */}
            <div className="mt-8">
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
                        <Input {...register(`proveedor${num}Nombre` as keyof PersonaFisicaFormData)} />
                      </div>
                      <div>
                        <Label>Teléfono</Label>
                        <Input {...register(`proveedor${num}Telefono` as keyof PersonaFisicaFormData)} />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Domicilio</Label>
                        <Input {...register(`proveedor${num}Domicilio` as keyof PersonaFisicaFormData)} />
                      </div>
                      <div>
                        <Label>Promedio de Compra</Label>
                        <Input {...register(`proveedor${num}PromedioCompra` as keyof PersonaFisicaFormData)} placeholder="$0.00" />
                      </div>
                      <div>
                        <Label>Línea de Crédito</Label>
                        <Input {...register(`proveedor${num}LineaCredito` as keyof PersonaFisicaFormData)} placeholder="$0.00" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 3:
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

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Documentos Requeridos</h3>
            
            <Alert className="mb-6">
              <FileText className="h-4 w-4" />
              <AlertDescription>
                <strong>Archivos requeridos para Persona Física:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Copia de Identificación oficial vigente (INE o IFE) del titular</li>
                  <li>Solo la carátula del estado de cuenta bancario no mayor a 3 meses de antigüedad del titular</li>
                  <li>Comprobante de Domicilio (teléfono) del titular</li>
                  <li>Constancia de Situación Fiscal reciente del titular</li>
                  <li>Declaración anual del titular</li>
                  <li>Opinión de cumplimiento de obligaciones fiscales del titular</li>
                  <li>Copia de Identificación oficial vigente (INE o IFE) del aval</li>
                  <li>Comprobante de Domicilio (teléfono) del aval</li>
                  <li>Constancia de Situación Fiscal reciente del aval</li>
                  <li>Garantía de inmueble del aval (escritura, título de propiedad, factura de auto, comprobante de predial o agua)</li>
                </ul>
              </AlertDescription>
            </Alert>

            <SubidaArchivos
              archivos={archivos}
              onArchivosChange={setArchivos}
              tipoPersona="FISICA"
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
            <span>Solicitud de Línea de Crédito - Persona Física</span>
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
