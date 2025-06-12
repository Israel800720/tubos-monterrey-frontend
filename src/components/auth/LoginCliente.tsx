import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, Building2, Shield } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { validarRFC } from '../../utils/rfc';

export function LoginCliente() {
  const { state, actions } = useApp();
  const [formData, setFormData] = useState({
    numeroCliente: '',
    rfc: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar errores cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Limpiar error general
    if (state.error) {
      // No podemos llamar dispatch directamente aquí, pero el error se limpiará en el siguiente intento
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.numeroCliente.trim()) {
      newErrors.numeroCliente = 'El número de cliente es requerido';
    }

    if (!formData.rfc.trim()) {
      newErrors.rfc = 'El RFC es requerido';
    } else if (!validarRFC(formData.rfc)) {
      newErrors.rfc = 'El RFC no tiene un formato válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const success = await actions.loginCliente(
      formData.numeroCliente.trim(),
      formData.rfc.trim().toUpperCase()
    );

    if (success) {
      // Limpiar formulario
      setFormData({ numeroCliente: '', rfc: '' });
      setErrors({});
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            TUBOS MONTERREY
          </h1>
          <p className="text-gray-600">
            Sistema de Solicitud de Línea de Crédito
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-lg font-semibold flex items-center justify-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Acceso de Clientes
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {state.error && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800 text-sm leading-relaxed">
                  {state.error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="numeroCliente" className="text-sm font-medium">
                  Número de Cliente
                </Label>
                <Input
                  id="numeroCliente"
                  type="text"
                  value={formData.numeroCliente}
                  onChange={(e) => handleInputChange('numeroCliente', e.target.value)}
                  placeholder="Ej: CLI001"
                  className={errors.numeroCliente ? 'border-red-300' : ''}
                  disabled={state.loading}
                />
                {errors.numeroCliente && (
                  <p className="text-red-500 text-xs mt-1">{errors.numeroCliente}</p>
                )}
              </div>

              <div>
                <Label htmlFor="rfc" className="text-sm font-medium">
                  RFC
                </Label>
                <Input
                  id="rfc"
                  type="text"
                  value={formData.rfc}
                  onChange={(e) => handleInputChange('rfc', e.target.value.toUpperCase())}
                  placeholder="Ej: ABC123456789"
                  className={errors.rfc ? 'border-red-300' : ''}
                  disabled={state.loading}
                  maxLength={13}
                />
                {errors.rfc && (
                  <p className="text-red-500 text-xs mt-1">{errors.rfc}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={state.loading}
              >
                {state.loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Validando...
                  </>
                ) : (
                  'Ingresar'
                )}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">
                  ¿Eres administrador?
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.hash = '#admin'}
                  className="text-xs"
                >
                  Acceso Administrativo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información de contacto */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>¿Necesita ayuda?</p>
          <p>📞 55 5078 7700 | 📱 55 4144 8919</p>
          <p>✉️ tubosmty@tubosmonterrey.com.mx</p>
        </div>
      </div>
    </div>
  );
}
