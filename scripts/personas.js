import { STORAGE_PERSONA_ID } from "./config.js";
import { solicitarAPI } from "./api.js";
import { mostrarMensaje } from "./mensajes.js";

import {
    formularioPresencia,
    nombrePersona,
    edificioPersona,
    botonSalir
} from "./dom.js";

import {
    obtenerEdificiosLocales,
    personaId,
    establecerPersonaId
} from "./estado.js";

import {
    iniciarActualizaciones,
    detenerActualizaciones
} from "./presencia.js";

import { actualizarTablaPersonas } from "./tabla.js";


export async function registrarPersona(evento) {
    evento.preventDefault();

    const nombre = nombrePersona.value.trim();
    const buildingId = edificioPersona.value;

    if (!nombre || !buildingId) {
        mostrarMensaje(
            "Completa tu nombre y selecciona un edificio.",
            "error"
        );
        return;
    }

    if (personaId !== null) {
        mostrarMensaje(
            "Ya tienes un registro guardado. Recupera tu identidad actual.",
            "error"
        );
        return;
    }

    const edificio = obtenerEdificiosLocales().find(
        (elemento) => String(elemento.id) === buildingId
    );

    if (!edificio) {
        mostrarMensaje(
            "El edificio seleccionado no existe.",
            "error"
        );
        return;
    }

    const boton = formularioPresencia.querySelector('button[type="submit"]');

    boton.disabled = true;

    try {
        const creada = await solicitarAPI("/people", {
            method: "POST",
            body: JSON.stringify({
                name: nombre,
                buildingId: edificio.id,
                lastSeen: new Date().toISOString()
            })
        });

        if (!creada || creada.id == null) {
            throw new Error(
                "El servidor no devolvió el ID de la persona."
            );
        }

        establecerPersonaId(creada.id);

        localStorage.setItem(
            STORAGE_PERSONA_ID,
            String(creada.id)
        );

        mostrarMensaje(
            "Tu presencia se registró correctamente."
        );

        iniciarActualizaciones();

        await actualizarTablaPersonas();

    } catch (error) {
        mostrarMensaje(
            "No se pudo registrar tu presencia: " + error.message,
            "error"
        );
    } finally {
        boton.disabled = false;
    }
}


export async function recuperarPersona() {
    if (personaId === null) return;

    try {
        const persona = await solicitarAPI(
            `/people/${encodeURIComponent(personaId)}`
        );

        if (!persona || persona.id == null) {
            throw new Error("No se encontró el registro.");
        }

        nombrePersona.value = persona.name ?? "";
        edificioPersona.value = String(persona.buildingId);

        mostrarMensaje(
            `Se recuperó tu registro, ${persona.name ?? "usuario"}.`
        );

        iniciarActualizaciones();

    } catch (error) {
        if (error.status === 404) {
            localStorage.removeItem(STORAGE_PERSONA_ID);
            establecerPersonaId(null);

            mostrarMensaje(
                "Tu registro anterior ya no existe. Puedes registrarte nuevamente.",
                "error"
            );
        } else {
            mostrarMensaje(
                "No se pudo recuperar tu registro: " + error.message,
                "error"
            );
        }
    }
}


export async function salir() {
    if (personaId === null) {
        mostrarMensaje(
            "No tienes una presencia registrada para eliminar.",
            "error"
        );
        return;
    }

    if (!window.confirm(
        "¿Deseas salir y eliminar tu registro del servidor?"
    )) {
        return;
    }

    botonSalir.disabled = true;

    try {
        await solicitarAPI(
            `/people/${encodeURIComponent(personaId)}`,
            { method: "DELETE" }
        );

        detenerActualizaciones();

        localStorage.removeItem(STORAGE_PERSONA_ID);
        establecerPersonaId(null);

        nombrePersona.value = "";
        edificioPersona.value = "";

        mostrarMensaje(
            "Has salido correctamente. Tu registro fue eliminado."
        );

        await actualizarTablaPersonas();

    } catch (error) {
        mostrarMensaje(
            "No se pudo eliminar el registro: " + error.message,
            "error"
        );
    } finally {
        botonSalir.disabled = false;
    }
}