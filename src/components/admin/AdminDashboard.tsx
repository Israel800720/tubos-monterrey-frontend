import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { 
  Users, 
  FileText, 
  Upload, 
  Download, 
  RefreshCw, 
  Trash2, 
  LogOut,
  Database,
  AlertCircle,
  CheckCircle,
  Eye,
  FileSpreadsheet
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { 
  generarLayoutExcel, 
  exportarSolicitudesAExcel, 
  validarArchivoExcel,
  generarRespaldoBaseDatos
} from '../../utils/excel';
import JSZip from 'jszip';

export function AdminDashboard() {
  const { state, actions } = useApp();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!validarArchivoExcel(file)) {
        throw new Error('El archivo debe ser un Excel (.xls o .xlsx)');
      }

      await actions.cargarClientesDesdeExcel(file);
      setSuccess(`Base de datos actualizada con éxito. ${state.admin.clientesDatabase.length} clientes cargados.`);
      
      // Limpiar el input
      event.target.value = '';
    } catch (error) {
      console.error('Error cargando Excel:', error);
      setError(error instanceof Error ? error.message : 'Error al procesar el archivo Excel');
    } finally {
      setUploading(false);
    }
  };

  const handleResetDatabase = () => {
    if (confirm('¿Está seguro de resetear toda la base de datos? Esta acción generará un respaldo automático.')) {
      // Generar respaldo antes de resetear
      generarRespaldoBaseDatos(state.admin.clientesDatabase, state.admin.solicitudes);
      
      // Resetear
      actions.resetearBaseDatos();
      setSuccess('Base de datos reseteada. Se generó un respaldo automático.');
    }
  };

  const downloadSolicitudArchivos = async (solicitudId: string) => {
    const solicitud = state.admin.solicitudes.find(s => s.id === solicitudId);
    if (!solicitud || solicitud.archivos.length === 0) {
      alert('No hay archivos para descargar');
      return;
    }

    try {
      const zip = new JSZip();
      
      // Aquí en una implementación real, descargarías los archivos de Cloudinary
      // Por ahora, creamos archivos de ejemplo
      solicitud.archivos.forEach((archivo, index) => {
        zip.file(`documento_${index + 1}.txt`, `Archivo: ${archivo}\nFolio: ${solicitud.folio}`);
      });

      const content = await zip.generateAsync({ type: "blob" });
      
      // Crear enlace de descarga
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = `solicitud_${solicitud.folio}_archivos.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error creando ZIP:', error);
      alert('Error al crear el archivo ZIP');
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pendiente</Badge>;
      case 'PROCESADA':
        return <Badge variant="outline" className="text-green-600 border-green-600">Procesada</Badge>;
      case 'RECHAZADA':
        return <Badge variant="outline" className="text-red-600 border-red-600">Rechazada</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const getTipoPersonaBadge = (tipo: string) => {
    return tipo === 'FISICA' 
      ? <Badge variant="secondary">Persona Física</Badge>
      : <Badge variant="secondary">Persona Moral</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Panel Administrativo</h1>
            <p className="text-gray-600 mt-2">TUBOS MONTERREY, S.A. DE C.V.</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Administrador</p>
              <p className="font-medium">{state.admin.user?.name}</p>
            </div>
            <Button variant="outline" onClick={actions.logoutAdmin}>
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* Alertas */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Cards de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Database className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Clientes en BD</p>
                  <p className="text-2xl font-bold text-gray-900">{state.admin.clientesDatabase.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Solicitudes</p>
                  <p className="text-2xl font-bold text-gray-900">{state.admin.solicitudes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {state.admin.solicitudes.filter(s => s.estado === 'PENDIENTE').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Procesadas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {state.admin.solicitudes.filter(s => s.estado === 'PROCESADA').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs principales */}
        <Tabs defaultValue="database" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="database">Gestión de Base de Datos</TabsTrigger>
            <TabsTrigger value="solicitudes">Solicitudes de Crédito</TabsTrigger>
          </TabsList>

          {/* Tab de Base de Datos */}
          <TabsContent value="database">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Cargar Excel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="w-5 h-5 mr-2" />
                    Cargar Base de Datos de Clientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="excel-upload">Archivo Excel (.xls, .xlsx)</Label>
                      <Input
                        id="excel-upload"
                        type="file"
                        accept=".xls,.xlsx"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="mt-2"
                      />
                    </div>
                    
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Formato requerido:</strong>
                        <br />Columna A: Código SN
                        <br />Columna B: Nombre SN
                        <br />Columna C: RFC
                        <br />Columna D: Condiciones de Pago
                        <br />Columna E: Código de Grupo
                      </AlertDescription>
                    </Alert>

                    <Button 
                      onClick={generarLayoutExcel}
                      variant="outline" 
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Descargar Layout de Ejemplo
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Acciones de BD */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Database className="w-5 h-5 mr-2" />
                    Acciones de Base de Datos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Estado Actual</h4>
                      <p className="text-sm text-gray-600">
                        {state.admin.clientesDatabase.length} clientes registrados
                      </p>
                      <p className="text-sm text-gray-600">
                        {state.admin.solicitudes.length} solicitudes en sistema
                      </p>
                    </div>

                    <Button 
                      onClick={() => exportarSolicitudesAExcel(state.admin.solicitudes)}
                      variant="outline" 
                      className="w-full"
                      disabled={state.admin.solicitudes.length === 0}
                    >
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      Exportar Solicitudes a Excel
                    </Button>

                    <Button 
                      onClick={handleResetDatabase}
                      variant="destructive" 
                      className="w-full"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Resetear Base de Datos
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabla de clientes */}
            {state.admin.clientesDatabase.length > 0 && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Clientes en Base de Datos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-4 py-2 text-left">Código</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Nombre</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">RFC</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Condiciones</th>
                          <th className="border border-gray-300 px-4 py-2 text-left">Grupo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {state.admin.clientesDatabase.slice(0, 10).map((cliente, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="border border-gray-300 px-4 py-2">{cliente.codigoSN}</td>
                            <td className="border border-gray-300 px-4 py-2">{cliente.nombreSN}</td>
                            <td className="border border-gray-300 px-4 py-2">{cliente.rfc}</td>
                            <td className="border border-gray-300 px-4 py-2">{cliente.codigoCondicionesPago}</td>
                            <td className="border border-gray-300 px-4 py-2">{cliente.codigoGrupo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {state.admin.clientesDatabase.length > 10 && (
                      <p className="text-sm text-gray-500 mt-2">
                        Mostrando 10 de {state.admin.clientesDatabase.length} clientes
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab de Solicitudes */}
          <TabsContent value="solicitudes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Solicitudes de Crédito
                  </span>
                  <Button 
                    onClick={() => exportarSolicitudesAExcel(state.admin.solicitudes)}
                    variant="outline"
                    size="sm"
                    disabled={state.admin.solicitudes.length === 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {state.admin.solicitudes.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No hay solicitudes de crédito registradas</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {state.admin.solicitudes.map((solicitud) => (
                      <Card key={solicitud.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="font-semibold text-lg">Folio: {solicitud.folio}</h3>
                                {getTipoPersonaBadge(solicitud.tipoPersona)}
                                {getEstadoBadge(solicitud.estado)}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p><strong>Cliente:</strong> {solicitud.cliente.nombreSN}</p>
                                  <p><strong>RFC:</strong> {solicitud.cliente.rfc}</p>
                                  <p><strong>Código:</strong> {solicitud.cliente.codigoSN}</p>
                                </div>
                                <div>
                                  <p><strong>Fecha:</strong> {solicitud.fechaCreacion.toLocaleDateString('es-MX')}</p>
                                  <p><strong>Archivos:</strong> {solicitud.archivos.length}</p>
                                  <p><strong>Línea Solicitada:</strong> {(solicitud.formulario as any).lineaCreditoSolicitada}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex space-x-2 ml-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  // Aquí mostrarías un modal con los detalles completos
                                  const detalles = JSON.stringify(solicitud.formulario, null, 2);
                                  alert(`Detalles de la solicitud:\n\n${detalles.substring(0, 1000)}...`);
                                }}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                Ver
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => downloadSolicitudArchivos(solicitud.id)}
                                disabled={solicitud.archivos.length === 0}
                              >
                                <Download className="w-3 h-3 mr-1" />
                                Archivos
                              </Button>

                              {solicitud.estado === 'PENDIENTE' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600 border-green-600"
                                    onClick={() => actions.actualizarSolicitud(solicitud.id, { estado: 'PROCESADA' })}
                                  >
                                    Aprobar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 border-red-600"
                                    onClick={() => actions.actualizarSolicitud(solicitud.id, { estado: 'RECHAZADA' })}
                                  >
                                    Rechazar
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
