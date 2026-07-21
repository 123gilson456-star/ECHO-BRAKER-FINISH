// Importamos Express para crear la aplicación web
const express = require("express");
// Middleware para permitir peticiones desde otros dominios
const cors = require("cors");
// Middleware para registrar las peticiones HTTP en consola
const morgan = require("morgan");
// Rutas relacionadas con los análisis
const analysisRoutes = require("./routes/analysisRoutes");
// Middleware para manejar errores de forma centralizada
const errorHandler = require("./middleware/errorHandler");

// Creamos la instancia de la aplicación Express
const app = express();

// Configuramos CORS: permitimos el origen definido en .env o todos (*)
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*" }));
// Parseamos el cuerpo de las peticiones como JSON, con límite de 2MB
app.use(express.json({ limit: "2mb" }));

// Si no estamos en producción, usamos morgan para registrar las peticiones
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Montamos las rutas de análisis en el prefijo /api/analyses
app.use("/api/analyses", analysisRoutes);

// Endpoint de salud para verificar que el servidor está funcionando
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Middleware de manejo de errores (siempre al final)
app.use(errorHandler);

// Exportamos la app para que server.js la use
module.exports = app;