
import { inicializarMapa } from "./mapa.js";
import { obtenerEdificios } from "./edificios.js";
import { actualizarTablaPersonas } from "./tabla.js";
import { recuperarPersona } from "./personas.js";
import { configurarEventos } from "./eventos.js";
import {
    mostrarErrorServidor,
    mostrarServidorConectado,
    mostrarMensaje
} from "./mensajes.js";
import { estadoCarga } from "./dom.js";

async function iniciarAplicacion() {
    configurarEventos();
    inicializarMapa();

    try {
        estadoCarga.textContent = "Conectando con el servidor...";

        await obtenerEdificios();
        await actualizarTablaPersonas();
        await recuperarPersona();

        mostrarServidorConectado();
        estadoCarga.textContent = "Aplicación lista.";
    } catch (error) {
        mostrarErrorServidor();

        mostrarMensaje(
            "No se pudo iniciar la aplicación. Comprueba el servidor.",
            "error"
        );
    }
}

iniciarAplicacion();