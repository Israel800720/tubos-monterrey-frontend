import React, { useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Upload, 
  FileText, 
  Image, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Eye
} from 'lucide-react';
import { TipoPersona } from '../../types';
import { 
  procesarArchivoOCR, 
  validarCalidadImagen, 
  validarTipoArchivo,
  validarTamanoArchivo,
  formatearTamanoArchivo,
  TIPOS_ARCHIVO_PERMITIDOS
} from '../../utils/ocr';

interface ArchivoConEstado {
  file: File;
  id: string;
  estado: 'pending' | 'processing' | 'success' | 'error';
  progreso: number;
  calidadOCR?: number;
  textoExtraido?: string;
  error?: string;
}

interface SubidaArchivosProps {
  archivos: File[];
  onArchivosChange: (archivos: File[]) => void;
  tipoPersona: TipoPersona;
}

export function SubidaArchivos({ archivos, onArchivosChange, tipoPersona }: SubidaArchivosProps) {
  const [archivosConEstado, setArchivosConEstado] = useState<ArchivoConEstado[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Manejar drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      procesarNuevosArchivos(files);
    }
  }, []);

  // Procesar archivos seleccionados
  const procesarNuevosArchivos = async (files: File[]) => {
    const nuevosArchivos: ArchivoConEstado[] = [];
    
    for (const file of files) {
      // Validaciones básicas
      if (!validarTipoArchivo(file)) {
        alert(`El archivo ${file.name} no tiene un formato válido. Use PNG, JPG, JPEG o PDF.`);
        continue;
      }
      
      if (!validarTamanoArchivo(file)) {
        alert(`El archivo ${file.name} es demasiado grande. El tamaño máximo es 10MB.`);
        continue;
      }
      
      const archivoConEstado: ArchivoConEstado = {
        file,
        id: `${Date.now()}-${Math.random()}`,
        estado: 'pending',
        progreso: 0
      };
      
      nuevosArchivos.push(archivoConEstado);
    }
    
    setArchivosConEstado(prev => [...prev, ...nuevosArchivos]);
    
    // Procesar archivos con OCR si son imágenes
    for (const archivo of nuevosArchivos) {
      if (archivo.file.type.startsWith('image/')) {
        await procesarArchivoConOCR(archivo);
      } else {
        // Para PDFs, marcar como éxito sin OCR
        setArchivosConEstado(prev => 
          prev.map(a => 
            a.id === archivo.id 
              ? { ...a, estado: 'success', progreso: 100 }
              : a
          )
        );
      }
    }
    
    // Actualizar lista de archivos válidos
    actualizarListaArchivos();
  };

  // Procesar archivo con OCR
  const procesarArchivoConOCR = async (archivo: ArchivoConEstado) => {
    setArchivosConEstado(prev => 
      prev.map(a => 
        a.id === archivo.id 
          ? { ...a, estado: 'processing', progreso: 10 }
          : a
      )
    );

    try {
      // Verificar calidad de imagen
      const tieneCalidadAdecuada = await validarCalidadImagen(archivo.file);
      
      if (!tieneCalidadAdecuada) {
        setArchivosConEstado(prev => 
          prev.map(a => 
            a.id === archivo.id 
              ? { 
                  ...a, 
                  estado: 'error', 
                  error: 'La imagen tiene muy baja resolución. Use una imagen de mejor calidad.' 
                }
              : a
          )
        );
        return;
      }

      // Procesar con OCR
      const resultado = await procesarArchivoOCR(
        archivo.file,
        (progreso) => {
          setArchivosConEstado(prev => 
            prev.map(a => 
              a.id === archivo.id 
                ? { ...a, progreso: 10 + (progreso * 0.8) }
                : a
            )
          );
        }
      );

      if (resultado.isGoodQuality) {
        setArchivosConEstado(prev => 
          prev.map(a => 
            a.id === archivo.id 
              ? { 
                  ...a, 
                  estado: 'success', 
                  progreso: 100,
                  calidadOCR: resultado.confidence,
                  textoExtraido: resultado.text
                }
              : a
          )
        );
      } else {
        setArchivosConEstado(prev => 
          prev.map(a => 
            a.id === archivo.id 
              ? { 
                  ...a, 
                  estado: 'error',
                  error: `Calidad de OCR insuficiente (${resultado.confidence.toFixed(1)}%). Use una imagen más clara.`
                }
              : a
          )
        );
      }
    } catch (error) {
      setArchivosConEstado(prev => 
        prev.map(a => 
          a.id === archivo.id 
            ? { 
                ...a, 
                estado: 'error',
                error: 'Error al procesar el archivo con OCR.'
              }
            : a
        )
      );
    }
  };

  // Actualizar lista de archivos válidos
  const actualizarListaArchivos = () => {
    const archivosValidos = archivosConEstado
      .filter(a => a.estado === 'success')
      .map(a => a.file);
    
    onArchivosChange(archivosValidos);
  };

  // Eliminar archivo
  const eliminarArchivo = (id: string) => {
    setArchivosConEstado(prev => prev.filter(a => a.id !== id));
    setTimeout(actualizarListaArchivos, 100);
  };

  // Reintentar procesamiento
  const reintentarProceso = async (archivo: ArchivoConEstado) => {
    if (archivo.file.type.startsWith('image/')) {
      await procesarArchivoConOCR(archivo);
    }
    actualizarListaArchivos();
  };

  // Obtener color del estado
  const getColorEstado = (estado: string) => {
    switch (estado) {
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      case 'processing': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  // Obtener ícono del estado
  const getIconoEstado = (estado: string) => {
    switch (estado) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'error': return <AlertCircle className="w-4 h-4" />;
      case 'processing': return <Loader2 className="w-4 h-4 animate-spin" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const archivosExitosos = archivosConEstado.filter(a => a.estado === 'success').length;

  return (
    <div className="space-y-6">
      {/* Área de subida */}
      <Card>
        <CardContent className="p-6">
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors
              ${dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
              }
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Arrastra archivos aquí o haz clic para seleccionar
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Formatos permitidos: PNG, JPG, JPEG, PDF (máximo 10MB por archivo)
            </p>
            
            <input
              type="file"
              multiple
              accept={TIPOS_ARCHIVO_PERMITIDOS.join(',')}
              onChange={(e) => {
                if (e.target.files) {
                  procesarNuevosArchivos(Array.from(e.target.files));
                }
              }}
              className="hidden"
              id="file-upload"
            />
            
            <Button asChild variant="outline">
              <label htmlFor="file-upload" className="cursor-pointer">
                Seleccionar Archivos
              </label>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de archivos */}
      {archivosConEstado.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Archivos Subidos</span>
              <span className="text-sm font-normal">
                {archivosExitosos} de {archivosConEstado.length} procesados
              </span>
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {archivosConEstado.map((archivo) => (
                <div key={archivo.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <div className={`flex-shrink-0 ${getColorEstado(archivo.estado)}`}>
                    {getIconoEstado(archivo.estado)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {archivo.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatearTamanoArchivo(archivo.file.size)}
                      {archivo.calidadOCR && (
                        <span className="ml-2">
                          • Calidad OCR: {archivo.calidadOCR.toFixed(1)}%
                        </span>
                      )}
                    </p>
                    
                    {archivo.estado === 'processing' && (
                      <Progress value={archivo.progreso} className="mt-2" />
                    )}
                    
                    {archivo.error && (
                      <p className="text-xs text-red-600 mt-1">{archivo.error}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {archivo.estado === 'error' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => reintentarProceso(archivo)}
                      >
                        Reintentar
                      </Button>
                    )}
                    
                    {archivo.textoExtraido && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          alert(`Texto extraído:\n\n${archivo.textoExtraido?.substring(0, 500)}...`);
                        }}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => eliminarArchivo(archivo.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerta de validación */}
      {archivosConEstado.length > 0 && archivosExitosos === 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Debe tener al menos un archivo procesado exitosamente para continuar.
          </AlertDescription>
        </Alert>
      )}

      {archivosExitosos > 0 && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {archivosExitosos} archivo(s) listo(s) para enviar.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
