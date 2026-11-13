import { STORAGE_FILTRO } from "./config.js";
import { solicitarAPI } from "./api.js";
import { mostrarMensaje } from "./mensajes.js";
import {
    estadoCarga,
    filtroEdificio,
    tablaPersonas
} from "./dom.js";
import {
    establecerPersonas,
    obtenerEdificiosLocales
} from "./estado.js";
import {
    calcularEstado,
    obtenerFechaLocal
} from "./utilidades.js";

export async function obtenerPersonas() {
    const filtro = filtroEdificio.value;

    const endpoint = filtro
        ? `/people?buildingId=${encodeURIComponent(filtro)}`
        : "/people";

    const datos = await solicitarAPI(endpoint);
    const lista = Array.isArray(datos) ? datos : [];

    establecerPersonas(lista);

    return lista;
}

export function obtenerNombreEdificio(buildingId) {
    const edificio = obtenerEdificiosLocales().find(
        (elemento) => String(elemento.id) === String(buildingId)
    );

    return edificio ? edificio.name : "Edificio no encontrado";
}

export function contarPersonasActivas(buildingId, personas) {
    return personas.filter((persona) =>
        String(persona.buildingId) === String(buildingId) &&
        calcularEstado(persona.lastSeen) === "Activo"
    ).length;
}

export function mostrarPersonas(personas) {
    tablaPersonas.replaceChildren();

    if (personas.length === 0) {
        const fila = document.createElement("tr");
        const celda = document.createElement("td");

        celda.colSpan = 4;
        celda.textContent =
            "No hay personas registradas en este filtro.";

        fila.appendChild(celda);
        tablaPersonas.appendChild(fila);
        return;
    }

    personas.forEach((persona) => {
        const fila = document.createElement("tr");

        const celdaNombre = document.createElement("td");
        celdaNombre.textContent = persona.name ?? "Sin nombre";

        const celdaEdificio = document.createElement("td");
        celdaEdificio.textContent =
            obtenerNombreEdificio(persona.buildingId);

        const celdaConexion = document.createElement("td"); 
        celdaConexion.textContent =
            obtenerFechaLocal(persona.lastSeen);

        const celdaEstado = document.createElement("td");
        const estado = calcularEstado(persona.lastSeen);

        celdaEstado.textContent = estado;
        celdaEstado.classList.add(
            estado === "Activo"
                ? "estado-activo"
                : "estado-inactivo"
        );

        fila.append(
            celdaNombre,
            celdaEdificio,
            celdaConexion,
            celdaEstado
        );

        tablaPersonas.appendChild(fila);
    });
}

export async function actualizarTablaPersonas() {
    estadoCarga.textContent = "Cargando personas...";

    try {
        const personas = await obtenerPersonas();

        mostrarPersonas(personas);

        estadoCarga.textContent =
            `Personas encontradas: ${personas.length}`;
    } catch (error) {
        estadoCarga.textContent =
            "No se pudieron cargar las personas.";

        mostrarMensaje(
            "Error al consultar las personas. " + error.message,
            "error"
        );

        throw error;
    }
}

export async function filtrarPorEdificio() {
    localStorage.setItem(
        STORAGE_FILTRO,
        filtroEdificio.value
    );

    try {
        await actualizarTablaPersonas();
    } catch {
        
    }
}