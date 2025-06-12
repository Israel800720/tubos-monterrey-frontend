import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { User, Building2, ArrowRight, LogOut } from 'lucide-react';
import { TipoPersona, Cliente } from '../types';
import { determinarTipoPersona } from '../utils/rfc';
import { useApp } from '../contexts/AppContext';

interface SelectorTipoPersonaProps {
  cliente: Cliente;
  onSeleccionar: (tipo: TipoPersona) => void;
}

export function SelectorTipoPersona({ cliente, onSeleccionar }: SelectorTipoPersonaProps) {
  const { actions } = useApp();
  
  // Detectar automáticamente el tipo basado en RFC
  const tipoDetectado = determinarTipoPersona(cliente.rfc);

  const handleSeleccion = (tipo: TipoPersona) => {
    if (tipo !== tipoDetectado) {
      if (!confirm(`Su RFC indica que es ${tipoDetectado === 'FISICA' ? 'Persona Física' : 'Persona Moral'}, pero ha seleccionado ${tipo === 'FISICA' ? 'Persona Física' : 'Persona Moral'}. ¿Está seguro de continuar?`)) {
        return;
      }
    }
    onSeleccionar(tipo);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            TUBOS MONTERREY, S.A. DE C.V.
          </h1>
          <p className="text-gray-600">
            Sistema de Solicitud de Línea de Crédito
          </p>
        </div>

        {/* Información del cliente */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Bienvenido, {cliente.nombreSN}
                </h2>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>RFC:</strong> {cliente.rfc}</p>
                  <p><strong>Código Cliente:</strong> {cliente.codigoSN}</p>
                  <p><strong>Grupo:</strong> {cliente.codigoGrupo}</p>
                  <p><strong>Condiciones de Pago:</strong> {cliente.codigoCondicionesPago} días</p>
                </div>
              </div>
              
              <Button variant="outline" onClick={actions.logoutCliente}>
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Detección automática */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                {tipoDetectado === 'FISICA' ? (
                  <User className="w-6 h-6 text-green-600" />
                ) : (
                  <Building2 className="w-6 h-6 text-green-600" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Tipo Detectado Automáticamente</h3>
                <p className="text-sm text-gray-600">
                  Basado en su RFC, usted es: <strong>{tipoDetectado === 'FISICA' ? 'Persona Física' : 'Persona Moral'}</strong>
                </p>
              </div>
              <Badge variant="secondary" className="ml-auto">
                Recomendado
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Selector de tipo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Persona Física */}
          <Card className={`cursor-pointer transition-all hover:shadow-lg ${tipoDetectado === 'FISICA' ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Persona Física</h3>
                  {tipoDetectado === 'FISICA' && (
                    <Badge className="bg-blue-600">Recomendado para usted</Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3 mb-6">
                <p className="text-gray-600 text-sm">
                  Para individuos que realizan actividades empresariales de manera personal.
                </p>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Documentos requeridos:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Identificación oficial (INE/IFE)</li>
                    <li>• Estado de cuenta bancario</li>
                    <li>• Comprobante de domicilio</li>
                    <li>• Constancia de Situación Fiscal</li>
                    <li>• Declaración anual</li>
                    <li>• Documentos del aval</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">
                    <strong>RFC de 13 caracteres:</strong> AAAA######AAA
                  </p>
                </div>
              </div>
              
              <Button 
                onClick={() => handleSeleccion('FISICA')}
                className="w-full"
                variant={tipoDetectado === 'FISICA' ? 'default' : 'outline'}
              >
                Continuar como Persona Física
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Persona Moral */}
          <Card className={`cursor-pointer transition-all hover:shadow-lg ${tipoDetectado === 'MORAL' ? 'ring-2 ring-purple-500 bg-purple-50' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Persona Moral</h3>
                  {tipoDetectado === 'MORAL' && (
                    <Badge className="bg-purple-600">Recomendado para usted</Badge>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3 mb-6">
                <p className="text-gray-600 text-sm">
                  Para empresas, sociedades anónimas, SRL y otras entidades jurídicas.
                </p>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Documentos requeridos:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Acta constitutiva</li>
                    <li>• Estados financieros</li>
                    <li>• Constancia de Situación Fiscal</li>
                    <li>• Documentos del representante legal</li>
                    <li>• Documentos del aval</li>
                    <li>• Cédula profesional del contador</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-600">
                    <strong>RFC de 12 caracteres:</strong> AAA######AAA
                  </p>
                </div>
              </div>
              
              <Button 
                onClick={() => handleSeleccion('MORAL')}
                className="w-full"
                variant={tipoDetectado === 'MORAL' ? 'default' : 'outline'}
              >
                Continuar como Persona Moral
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Información adicional */}
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold text-gray-900 mb-2">¿Necesita ayuda?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Si tiene dudas sobre qué tipo de persona seleccionar, nuestro equipo está disponible para apoyarlo.
            </p>
            <div className="flex justify-center space-x-6 text-sm">
              <div className="flex items-center text-gray-600">
                <span className="mr-1">📞</span>
                <span>55 5078 7700</span>
              </div>
              <div className="flex items-center text-gray-600">
                <span className="mr-1">📱</span>
                <span>55 4144 8919</span>
              </div>
              <div className="flex items-center text-gray-600">
                <span className="mr-1">✉️</span>
                <span>tubosmty@tubosmonterrey.com.mx</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
