// Importamos el cliente OpenAI (la API de Cerebras es compatible)
const OpenAI = require("openai");

// Si no hay clave de API, mostramos advertencia pero no detenemos la ejecución
if (!process.env.CEREBRAS_API_KEY) {
  console.warn(
    "[cerebras] CEREBRAS_API_KEY no esta configurada. Las solicitudes de analisis fallaran hasta que la agregues al .env"
  );
}

// Instanciamos el cliente de OpenAI apuntando a la URL de Cerebras
const cerebras = new OpenAI({
  apiKey: process.env.CEREBRAS_API_KEY || "missing-key", // Usamos un placeholder si falta
  baseURL: "https://api.cerebras.ai/v1", // Base URL de la API de Cerebras
});

// Modelo a utilizar, por defecto 'llama-3.3-70b'
const MODEL = process.env.CEREBRAS_MODEL || "llama-3.3-70b";

// Exportamos el cliente y el modelo para usarlos en servicios
module.exports = { cerebras, MODEL };