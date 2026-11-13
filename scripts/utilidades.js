import { TIEMPO_ACTIVO } from "./config.js";

export function escaparHTML(texto) {
    const elemento = document.createElement("span");
    elemento.textContent = String(texto ?? "");
    return elemento.innerHTML;
}

export function calcularEstado(lastSeen) {
    const ultimaConexion = new Date(lastSeen).getTime();

    if (!Number.isFinite(ultimaConexion)) {
        return "Inactivo";
    }

    const diferencia = Date.now() - ultimaConexion;

    return diferencia >= 0 && diferencia < TIEMPO_ACTIVO
        ? "Activo"
        : "Inactivo";
}

export function obtenerFechaLocal(fechaISO) {
    const fecha = new Date(fechaISO);

    return Number.isFinite(fecha.getTime())
        ? fecha.toLocaleString()
        : "Fecha no disponible";
}