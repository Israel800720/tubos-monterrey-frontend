import { TipoPersona } from '../types';

/**
 * Valida si un RFC tiene el formato correcto
 */
export function validarRFC(rfc: string): boolean {
  // Eliminar espacios y convertir a mayúsculas
  const rfcLimpio = rfc.replace(/\s/g, '').toUpperCase();
  
  // Expresión regular para validar RFC
  // Persona Física: 4 letras + 6 dígitos + 3 caracteres alfanuméricos
  // Persona Moral: 3 letras + 6 dígitos + 3 caracteres alfanuméricos
  const regexPersonaFisica = /^[A-Z]{4}[0-9]{6}[A-Z0-9]{3}$/;
  const regexPersonaMoral = /^[A-Z]{3}[0-9]{6}[A-Z0-9]{3}$/;
  
  return regexPersonaFisica.test(rfcLimpio) || regexPersonaMoral.test(rfcLimpio);
}

/**
 * Determina si un RFC corresponde a persona física o moral
 */
export function determinarTipoPersona(rfc: string): TipoPersona {
  const rfcLimpio = rfc.replace(/\s/g, '').toUpperCase();
  
  // Persona Física: 13 caracteres (AAAA000000AAA)
  // Persona Moral: 12 caracteres (AAA000000AAA)
  if (rfcLimpio.length === 13) {
    return 'FISICA';
  } else if (rfcLimpio.length === 12) {
    return 'MORAL';
  } else {
    throw new Error('RFC inválido');
  }
}

/**
 * Formatea el RFC con guiones para mejor legibilidad
 */
export function formatearRFC(rfc: string): string {
  const rfcLimpio = rfc.replace(/\s/g, '').toUpperCase();
  
  if (rfcLimpio.length === 13) {
    // Persona Física: AAAA-000000-AAA
    return `${rfcLimpio.substring(0, 4)}-${rfcLimpio.substring(4, 10)}-${rfcLimpio.substring(10)}`;
  } else if (rfcLimpio.length === 12) {
    // Persona Moral: AAA-000000-AAA
    return `${rfcLimpio.substring(0, 3)}-${rfcLimpio.substring(3, 9)}-${rfcLimpio.substring(9)}`;
  }
  
  return rfcLimpio;
}

/**
 * Lista de palabras inconvenientes que no deben aparecer en RFC
 */
const palabrasInconvenientes = [
  'BUEI', 'BUEY', 'CACA', 'CACO', 'CAGA', 'CAGO', 'CAKA', 'CAKO', 'COGE', 'COGI', 'COJA', 'COJE', 'COJI', 'COJO',
  'COLA', 'CULO', 'FALO', 'FETO', 'GETA', 'GUEI', 'GUEY', 'JETA', 'JOTO', 'KACA', 'KACO', 'KAGA', 'KAGO', 'KAKA',
  'KAKO', 'KOGE', 'KOGI', 'KOJA', 'KOJE', 'KOJI', 'KOJO', 'KOLA', 'KULO', 'LILO', 'LOCA', 'LOCO', 'LOKA', 'LOKO',
  'MAME', 'MAMO', 'MEAR', 'MEAS', 'MEON', 'MIAR', 'MION', 'MOCO', 'MOKO', 'MULA', 'MULO', 'NACA', 'NACO', 'PEDA',
  'PEDO', 'PENE', 'PIPI', 'PITO', 'POPO', 'PUTA', 'PUTO', 'QULO', 'RATA', 'ROBA', 'ROBE', 'ROBO', 'RUIN', 'SENO',
  'TETA', 'VACA', 'VAGA', 'VAGO', 'VAKA', 'VUEI', 'VUEY', 'WUEI', 'WUEY'
];

/**
 * Verifica si el RFC contiene palabras inconvenientes
 */
export function tieneAlbureriaRFC(rfc: string): boolean {
  const rfcLimpio = rfc.replace(/\s/g, '').toUpperCase();
  const primeros4 = rfcLimpio.substring(0, 4);
  
  return palabrasInconvenientes.includes(primeros4);
}
