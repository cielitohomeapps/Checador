/**
 * Utilidades de geolocalización
 */

import { CONFIG } from '../config/constants.js';

/**
 * Calcula la distancia entre dos coordenadas usando la fórmula de Haversine
 * @param {number} lat1 - Latitud punto 1
 * @param {number} lng1 - Longitud punto 1
 * @param {number} lat2 - Latitud punto 2
 * @param {number} lng2 - Longitud punto 2
 * @returns {number} Distancia en metros
 */
export function calcularDistanciaMetros(lat1, lng1, lat2, lng2) {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  let a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  // Evita NaN por error de redondeo cuando a supera ligeramente 1
  a = Math.min(a, 1);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distancia en metros
}

/**
 * Verifica que la oficina tenga coordenadas válidas configuradas
 * @returns {boolean}
 */
export function oficinaConfigurada() {
  const { lat, lng } = CONFIG.OFICINA;
  return Number.isFinite(lat) && Number.isFinite(lng) &&
    Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

/**
 * Verifica si unas coordenadas están dentro del rango de la oficina
 * @param {Object} coords - { lat, lng }
 * @returns {Object} { dentroDeRango: boolean, distancia: number }
 */
export function verificarUbicacionOficina(coords) {
  const limiteMetros = CONFIG.OFICINA.radio_metros;

  if (!oficinaConfigurada()) {
    console.error('❌ ERROR: Coordenadas de oficina no configuradas en el servidor (OFFICE_LAT/OFFICE_LNG)');
    return {
      dentroDeRango: false,
      distancia: null,
      limiteMetros,
      error: 'Configuración de servidor incompleta'
    };
  }

  const lat = Number(coords?.lat);
  const lng = Number(coords?.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng) ||
      Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return {
      dentroDeRango: false,
      distancia: null,
      limiteMetros,
      error: 'Coordenadas inválidas'
    };
  }

  const distancia = calcularDistanciaMetros(
    lat,
    lng,
    CONFIG.OFICINA.lat,
    CONFIG.OFICINA.lng
  );

  if (!Number.isFinite(distancia)) {
    console.error('❌ ERROR: No se pudo calcular la distancia a la oficina');
    return {
      dentroDeRango: false,
      distancia: null,
      limiteMetros,
      error: 'No se pudo calcular la distancia'
    };
  }

  console.log(`📍 Validación de ubicación: Distancia a oficina = ${Math.round(distancia)}m (Límite: ${limiteMetros}m)`);

  return {
    dentroDeRango: distancia <= limiteMetros,
    distancia: Math.round(distancia),
    limiteMetros
  };
}

/**
 * Formatea coordenadas para mostrar
 */
export function formatearCoordenadas(coords) {
  if (!coords) return 'Sin ubicación';

  const lat = Number(coords.lat);
  const lng = Number(coords.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return 'Sin ubicación';

  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

export default {
  calcularDistanciaMetros,
  oficinaConfigurada,
  verificarUbicacionOficina,
  formatearCoordenadas
};
