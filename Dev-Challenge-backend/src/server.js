// Cargamos las variables de entorno desde .env
require("dotenv").config();
// Importamos la aplicación Express
const app = require("./app");
// Importamos el pool de conexiones a PostgreSQL
const { pool } = require("./config/db");

// Definimos el puerto, usando el de entorno o 4000 por defecto
const PORT = process.env.PORT || 4000;

// Función asíncrona para iniciar el servidor
async function start() {
  try {
    // Intentamos hacer una consulta simple a la base de datos para verificar conexión
    await pool.query("SELECT 1");
    console.log("✅ Conectado a PostgreSQL.");
    // Arrancamos el servidor Express
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (err) {
    // Si falla la conexión a la BD, mostramos error y salimos
    console.error("❌ No se pudo conectar a PostgreSQL:", err.message);
    process.exit(1);
  }
}

// Ejecutamos la función de inicio
start();

// Capturamos la señal de interrupción (Ctrl+C) para cerrar conexiones limpiamente
process.on("SIGINT", async () => {
  console.log("\nCerrando conexiones...");
  await pool.end();   // Cerramos el pool de PostgreSQL
  process.exit(0);
});