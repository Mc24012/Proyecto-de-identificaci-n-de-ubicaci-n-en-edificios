import {
    botonRegistrarEdificio,
    botonEliminarEdificio,
    botonSalir,
    filtroEdificio,
    formularioPresencia
} from "./dom.js";
import { registrarEdificio, eliminarEdificio } from "./edificios.js";
import { registrarPersona, salir } from "./personas.js";
import { filtrarPorEdificio } from "./tabla.js";

export function configurarEventos() {
    botonRegistrarEdificio.addEventListener("click", registrarEdificio);
    botonEliminarEdificio.addEventListener("click", eliminarEdificio);

    formularioPresencia.addEventListener("submit", registrarPersona);

    botonSalir.addEventListener("click", salir);

    filtroEdificio.addEventListener("change", filtrarPorEdificio);
}
