// Cargamos variables de entorno
require("dotenv").config();
const fs = require("fs");
const path = require("path");
// Importamos el pool de conexiones
const { pool } = require("../src/config/db");

/**
 * Función para ejecutar el script schema.sql y crear las tablas.
 */
async function runSchema() {
  // Leemos el archivo schema.sql
  const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  try {
    // Ejecutamos el SQL
    await pool.query(sql);
    console.log("✅ Esquema PostgreSQL creado correctamente.");
  } catch (err) {
    console.error("❌ Error al crear el esquema:", err.message);
  } finally {
    // Cerramos la conexión
    await pool.end();
  }
}

// Ejecutamos la función
runSchema();