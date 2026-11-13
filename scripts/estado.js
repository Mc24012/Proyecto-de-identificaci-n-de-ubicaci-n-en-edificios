import { STORAGE_PERSONA_ID } from "./config.js";

export let edificios = [];
export let personas = [];

export let personaId =
    localStorage.getItem(STORAGE_PERSONA_ID);

export function establecerEdificios(datos) {
    edificios = datos;
}

export function establecerPersonas(datos) {
    personas = datos;
}

export function establecerPersonaId(id) {
    personaId = id == null ? null : String(id);
}

export function obtenerEdificiosLocales() {
    return edificios;
}

export function obtenerPersonasLocales() {
    return personas;
}