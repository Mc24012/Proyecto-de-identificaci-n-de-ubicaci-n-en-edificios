import { solicitarAPI } from "./api.js";
import { STORAGE_FILTRO } from "./config.js";
import {botonRegistrarEdificio, botonEliminarEdificio, edificioEliminar,
    edificioPersona,
    filtroEdificio,
    nombreEdificio
} from "./dom.js";
import { establecerEdificios, obtenerEdificiosLocales } from "./estado.js";
import { limpiarSeleccionMapa, mostrarEdificiosEnMapa, obtenerCoordenadasSeleccionadas } from "./mapa.js";
import { mostrarMensaje } from "./mensajes.js";
import { actualizarTablaPersonas } from "./tabla.js";

export async function obtenerEdificios() {
    const datos = await solicitarAPI("/buildings");

    const lista = Array.isArray(datos) ? datos : [];
    establecerEdificios(lista);

    cargarSelectoresEdificios();
    mostrarEdificiosEnMapa(lista);

    return lista;
}

export function cargarSelectoresEdificios() {
    const edificios = obtenerEdificiosLocales();
    const edificioAnterior = edificioPersona.value;
    const filtroAnterior = localStorage.getItem(STORAGE_FILTRO) ?? filtroEdificio.value;

    const edificioEliminarAnterior = edificioEliminar.value;

    edificioPersona.replaceChildren();
    filtroEdificio.replaceChildren();
    edificioEliminar.replaceChildren();

    const opcionInicial = new Option("Selecciona un edificio", "");

    const opcionTodos = new Option("Todos los edificios", "");
    const opcionEliminar = new Option("Selecciona un edificio", "");

    edificioPersona.add(opcionInicial);
    filtroEdificio.add(opcionTodos);
    edificioEliminar.add(opcionEliminar);

    edificios.forEach(edificio => {
        edificioPersona.add(new Option(edificio.name, String(edificio.id)));

        filtroEdificio.add(new Option(edificio.name, String(edificio.id)));
        edificioEliminar.add(new Option(edificio.name, String(edificio.id)));
    });

    if (edificios.some(edificio => String(edificio.id) === edificioAnterior)) {
        edificioPersona.value = edificioAnterior;
    }

    if (edificios.some(edificio => String(edificio.id) === filtroAnterior)) {
        filtroEdificio.value = filtroAnterior;
    } else {
        filtroEdificio.value = "";
    }

    if (edificios.some(edificio => String(edificio.id) === edificioEliminarAnterior)) {
        edificioEliminar.value = edificioEliminarAnterior;
    } else {
        edificioEliminar.value = "";
    }
}

export async function registrarEdificio() {
    const nombre = nombreEdificio.value.trim();
    const coordenadas = obtenerCoordenadasSeleccionadas();

    if (!nombre) {
        mostrarMensaje("Escribe el nombre del edificio.", "error");
        return;
    }

    if (!coordenadas) {
        mostrarMensaje("Selecciona primero una ubicación en el mapa.", "error");
        return;
    }

    botonRegistrarEdificio.disabled = true;

    try {
        await solicitarAPI("/buildings", {
            method: "POST",
            body: JSON.stringify({
                name: nombre,
                lat: coordenadas.lat,
                lng: coordenadas.lng,
            }),
        });

        nombreEdificio.value = "";
        limpiarSeleccionMapa();

        await obtenerEdificios();
        await actualizarTablaPersonas();

        mostrarMensaje("Edificio registrado correctamente.");
    } catch (error) {
        mostrarMensaje("No se pudo registrar el edificio: " + error.message, "error");
    } finally {
        botonRegistrarEdificio.disabled = false;
    }
}


/**
 * Elimina un edificio seleccionado.
 * Para evitar perder registros, no permite eliminarlo
 * mientras existan personas asociadas a ese edificio.
 */
export async function eliminarEdificio() {
    const buildingId = edificioEliminar.value;

    if (!buildingId) {
        mostrarMensaje("Selecciona un edificio para eliminar.", "error");
        return;
    }

    const edificio = obtenerEdificiosLocales().find(
        (elemento) => String(elemento.id) === String(buildingId)
    );

    if (!edificio) {
        mostrarMensaje("El edificio seleccionado ya no existe.", "error");
        await obtenerEdificios();
        return;
    }

    botonEliminarEdificio.disabled = true;

    try {
        // Verificar si hay personas registradas en este edificio.
        const personas = await solicitarAPI(
            `/people?buildingId=${encodeURIComponent(buildingId)}`
        );

        if (Array.isArray(personas) && personas.length > 0) {
            mostrarMensaje(
                `No se puede eliminar "${edificio.name}" porque tiene ${personas.length} registro(s) de presencia. Elimina primero esos registros o cambia a esas personas de edificio.`,
                "error"
            );
            return;
        }

        const confirmar = window.confirm(
            `¿Seguro que deseas eliminar el edificio "${edificio.name}"? Esta acción no se puede deshacer.`
        );

        if (!confirmar) return;

        await solicitarAPI(
            `/buildings/${encodeURIComponent(buildingId)}`,
            { method: "DELETE" }
        );

        // Refrescar selectores, mapa y tabla con los datos actuales.
        await obtenerEdificios();
        await actualizarTablaPersonas();

        mostrarMensaje(`El edificio "${edificio.name}" se eliminó correctamente.`);
    } catch (error) {
        mostrarMensaje(
            "No se pudo eliminar el edificio: " + error.message,
            "error"
        );
    } finally {
        botonEliminarEdificio.disabled = false;
    }
}
