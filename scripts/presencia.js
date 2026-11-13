import {
    INTERVALO_PRESENCIA,
    INTERVALO_TABLA
} from "./config.js";
import { solicitarAPI } from "./api.js";
import { mostrarMensaje } from "./mensajes.js";
import { nombrePersona, edificioPersona } from "./dom.js";
import { personaId as personaIdActual } from "./estado.js";
import { actualizarTablaPersonas } from "./tabla.js";

let intervaloPresencia = null;
let intervaloActualizacion = null;
let actualizandoPresencia = false;

export async function actualizarPresencia() {
    const personaId = personaIdActual;

    if (personaId === null || actualizandoPresencia) return;

    actualizandoPresencia = true;

    try {
        const persona = await solicitarAPI(
            `/people/${encodeURIComponent(personaId)}`
        );

        if (!persona || persona.id == null) {
            throw new Error("No se encontró el registro actual.");
        }

        const seleccion = edificioPersona.value;

        const personaActualizada = {
            name: nombrePersona.value.trim() || persona.name,
            buildingId: seleccion
                ? seleccion
                : persona.buildingId,
            lastSeen: new Date().toISOString()
        };

        await solicitarAPI(
            `/people/${encodeURIComponent(personaId)}`,
            {
                method: "PUT",
                body: JSON.stringify(personaActualizada)
            }
        );
    } catch (error) {
        mostrarMensaje(
            "No se pudo actualizar la presencia: " + error.message,
            "error"
        );
    } finally {
        actualizandoPresencia = false;
    }
}

export function iniciarActualizaciones() {
    detenerActualizaciones();

    intervaloPresencia = setInterval(
        actualizarPresencia,
        INTERVALO_PRESENCIA
    );

    intervaloActualizacion = setInterval(() => {
        actualizarTablaPersonas().catch(() => {});
    }, INTERVALO_TABLA);
}

export function detenerActualizaciones() {
    if (intervaloPresencia !== null) {
        clearInterval(intervaloPresencia);
        intervaloPresencia = null;
    }

    if (intervaloActualizacion !== null) {
        clearInterval(intervaloActualizacion);
        intervaloActualizacion = null;
    }
}