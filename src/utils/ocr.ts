import Tesseract from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  isGoodQuality: boolean;
}

/**
 * Procesa un archivo con OCR usando Tesseract.js
 */
export async function procesarArchivoOCR(
  file: File,
  onProgress?: (progress: number) => void
): Promise<OCRResult> {
  try {
    // Validar que el archivo sea una imagen
    if (!file.type.startsWith('image/')) {
      throw new Error('El archivo debe ser una imagen (PNG, JPG, JPEG)');
    }

    // Crear objeto URL para el archivo
    const imageUrl = URL.createObjectURL(file);

    // Procesar con Tesseract
    const result = await Tesseract.recognize(
      imageUrl,
      'spa', // Idioma español
      {
        logger: (m) => {
          if (m.status === 'recognizing text' && onProgress) {
            onProgress(m.progress * 100);
          }
        }
      }
    );

    // Limpiar el objeto URL
    URL.revokeObjectURL(imageUrl);

    const confidence = result.data.confidence;
    const text = result.data.text.trim();

    return {
      text,
      confidence,
      isGoodQuality: confidence >= 70 && text.length > 10
    };
  } catch (error) {
    console.error('Error en OCR:', error);
    throw new Error('Error al procesar el archivo con OCR');
  }
}

/**
 * Valida la calidad de un archivo de imagen
 */
export function validarCalidadImagen(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve(false);
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      
      ctx.drawImage(img, 0, 0);
      
      // Verificar resolución mínima
      const minWidth = 600;
      const minHeight = 800;
      
      const isGoodResolution = img.width >= minWidth && img.height >= minHeight;
      
      URL.revokeObjectURL(url);
      resolve(isGoodResolution);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(false);
    };

    img.src = url;
  });
}

/**
 * Tipos de archivos permitidos
 */
export const TIPOS_ARCHIVO_PERMITIDOS = [
  'image/png',
  'image/jpeg', 
  'image/jpg',
  'application/pdf'
];

/**
 * Valida si un archivo tiene un tipo permitido
 */
export function validarTipoArchivo(file: File): boolean {
  return TIPOS_ARCHIVO_PERMITIDOS.includes(file.type);
}

/**
 * Formatea el tamaño de archivo para mostrar
 */
export function formatearTamanoArchivo(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Valida el tamaño máximo de archivo (10MB)
 */
export function validarTamanoArchivo(file: File): boolean {
  const maxSize = 10 * 1024 * 1024; // 10MB
  return file.size <= maxSize;
}
