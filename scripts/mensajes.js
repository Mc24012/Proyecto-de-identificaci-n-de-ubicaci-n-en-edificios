import { estadoServidor, mensajes } from "./dom.js";

export function mostrarMensaje(texto, tipo = "exito") {
    mensajes.textContent = texto;
    mensajes.classList.remove("mensaje-exito", "mensaje-error");
    mensajes.classList.add(
        tipo === "error" ? "mensaje-error" : "mensaje-exito"
    );
}

export function mostrarErrorServidor() {
    estadoServidor.textContent =
        "No se puede conectar con el servidor. Verifica la IP, " +
        "que JSON Server esté encendido y la conexión de red.";

    estadoServidor.classList.remove("mensaje-exito");
    estadoServidor.classList.add("mensaje-error");
}

export function mostrarServidorConectado() {
    estadoServidor.textContent = "Servidor conectado correctamente.";
    estadoServidor.classList.remove("mensaje-error");
    estadoServidor.classList.add("mensaje-exito");
}