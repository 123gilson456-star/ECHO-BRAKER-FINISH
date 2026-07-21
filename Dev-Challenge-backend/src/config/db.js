// Importamos el cliente de PostgreSQL
const { Pool } = require('pg');
// Cargamos variables de entorno (ya se cargaron en server.js, pero por si acaso)
require('dotenv').config();

// Creamos un pool de conexiones con la configuración desde .env
const pool = new Pool({
  host: process.env.PG_HOST,                // Dirección del servidor PostgreSQL
  port: parseInt(process.env.PG_PORT, 10) || 5432, // Puerto (por defecto 5432)
  database: process.env.PG_DATABASE,        // Nombre de la base de datos
  user: process.env.PG_USER,                // Usuario
  password: process.env.PG_PASSWORD,        // Contraseña
  max: parseInt(process.env.PG_MAX_CONN, 10) || 10, // Máximo de conexiones
  idleTimeoutMillis: parseInt(process.env.PG_IDLE_TIMEOUT, 10) || 30000, // Tiempo de inactividad
  connectionTimeoutMillis: parseInt(process.env.PG_CONN_TIMEOUT, 10) || 5000, // Timeout de conexión
});

// Exportamos el pool para usarlo en otros módulos
module.exports = { pool };