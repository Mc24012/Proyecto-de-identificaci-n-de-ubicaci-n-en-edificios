const puerto_api = 3000;
const host = window.location.hostname || "localhost";
export const API_URL = `http://${host}:${puerto_api}`;

export const STORAGE_PERSONA_ID = "personaId";
export const STORAGE_FILTRO = "filtroEdificio";

export const INTERVALO_PRESENCIA = 30000;
export const INTERVALO_TABLA = 20000;
export const TIEMPO_ACTIVO = 1 * 60 * 1000;
