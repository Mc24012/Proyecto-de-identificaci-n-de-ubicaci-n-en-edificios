import { mostrarMensaje } from "./mensajes.js";
import { escaparHTML } from "./utilidades.js";

// Estado interno del mapa
let mapa = null;
let marcadorSeleccionado = null;
let coordenadasSeleccionadas = null;
let marcadoresEdificios = [];

/**
 * Inicializa Leaflet y permite seleccionar
 * las coordenadas de un nuevo edificio.
 */
export function inicializarMapa() {
    if (typeof L === "undefined") {
        mostrarMensaje(
            "No se pudo cargar Leaflet. Verifica tu conexión.",
            "error"
        );
        return;
    }

    // Evitar inicializar el mapa más de una vez.
    if (mapa) return;

    mapa = L.map("mapa").setView(
        [13.4396136, -88.1590432],
        18
    );

    // Capa de OpenStreetMap.
    L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            maxZoom: 19,
            attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">' +
                "OpenStreetMap</a>"
        }
    ).addTo(mapa);

    // Seleccionar ubicación al hacer clic.
    mapa.on("click", (evento) => {
        coordenadasSeleccionadas = {
            lat: evento.latlng.lat,
            lng: evento.latlng.lng
        };

        // Eliminar el marcador temporal anterior.
        if (marcadorSeleccionado) {
            mapa.removeLayer(marcadorSeleccionado);
        }

        // Crear un nuevo marcador temporal.
        marcadorSeleccionado = L.marker([
            coordenadasSeleccionadas.lat,
            coordenadasSeleccionadas.lng
        ]).addTo(mapa);

        marcadorSeleccionado
            .bindPopup("Ubicación seleccionada para un edificio.")
            .openPopup();

        mostrarMensaje(
            "Ubicación seleccionada. Escribe el nombre del edificio."
        );
    });
}

/**
 * Devuelve las coordenadas seleccionadas.
 */
export function obtenerCoordenadasSeleccionadas() {
    return coordenadasSeleccionadas;
}

/**
 * Elimina la selección temporal después
 * de registrar correctamente un edificio.
 */
export function limpiarSeleccionMapa() {
    if (marcadorSeleccionado && mapa) {
        mapa.removeLayer(marcadorSeleccionado);
    }

    marcadorSeleccionado = null;
    coordenadasSeleccionadas = null;
}

/**
 * Dibuja los edificios recibidos del servidor.
 */
export function mostrarEdificiosEnMapa(edificios) {
    if (!mapa) return;

    // Eliminar marcadores permanentes anteriores.
    marcadoresEdificios.forEach((marcador) => {
        mapa.removeLayer(marcador);
    });

    marcadoresEdificios = [];

    edificios.forEach((edificio) => {
        const lat = Number(edificio.lat);
        const lng = Number(edificio.lng);

        // Validar coordenadas.
        if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng) ||
            lat < -90 ||
            lat > 90 ||
            lng < -180 ||
            lng > 180
        ) {
            return;
        }

        // Crear el marcador del edificio.
        const marcador = L.marker([lat, lng]).addTo(mapa);

        // Mostrar el nombre de forma segura.
        marcador.bindPopup(
            `<strong>${escaparHTML(edificio.name)}</strong>`
        );

        marcadoresEdificios.push(marcador);
    });
}