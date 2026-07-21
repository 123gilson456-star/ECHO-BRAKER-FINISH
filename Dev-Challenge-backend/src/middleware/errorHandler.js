/**
 * Middleware de manejo de errores centralizado.
 * Recibe el error, lo loguea y envía una respuesta JSON al cliente.
 */
function errorHandler(err, req, res, next) {
  // Mostramos el error en consola (solo el mensaje, pero podríamos mostrar el stack en desarrollo)
  console.error("[error]", err.message);
  // Usamos el status del error o 500 por defecto
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Error interno del servidor.",
  });
}

module.exports = errorHandler;