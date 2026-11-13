import { API_URL } from "./config.js";
import { urlConsultada } from "./dom.js";
import { mostrarErrorServidor } from "./mensajes.js";

export async function solicitarAPI(endpoint, opciones = {}) {
    const url = `${API_URL}${endpoint}`;
    urlConsultada.textContent = url;

    let respuesta;

    try {
        respuesta = await fetch(url, {
            ...opciones,
            headers: {
                ...(opciones.body
                    ? { "Content-Type": "application/json" }
                    : {}),
                ...opciones.headers
            }
        });
    } catch (error) {
        mostrarErrorServidor();
        throw error;
    }

    if (!respuesta.ok) {
        const error = new Error(
            `Error HTTP ${respuesta.status}: ${respuesta.statusText}`
        );
        error.status = respuesta.status;
        throw error;
    }

    if (respuesta.status === 204) {
        return null;
    }

    const texto = await respuesta.text();

    if (!texto) {
        return null;
    }

    try {
        return JSON.parse(texto);
    } catch {
        throw new Error("El servidor devolvió una respuesta JSON inválida.");
    }
}