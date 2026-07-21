// Cliente HTTP para consultar la API de GNews
const axios = require("axios");

/**
 * Busca contra‑narrativas (artículos relacionados) usando las palabras clave proporcionadas.
 * Utiliza la API de GNews.
 */
async function findCounterNarratives(keywords = [], { lang = "es", max = 4 } = {}) {
  // Obtenemos la clave de API de las variables de entorno
  const apiKey = process.env.GNEWS_API_KEY;

  // Si no hay clave o no hay keywords, devolvemos un array vacío
  if (!apiKey || keywords.length === 0) {
    return [];
  }

  // Construimos la consulta uniendo las primeras 4 keywords con "OR"
  const query = keywords.slice(0, 4).join(" OR ");

  try {
    // Realizamos la petición a GNews
    const { data } = await axios.get("https://gnews.io/api/v4/search", {
      params: {
        q: query,
        lang,
        max,
        apikey: apiKey,
      },
      timeout: 8000,
    });

    // Mapeamos los artículos al formato que esperamos en la base de datos
    return (data.articles || []).map((article) => ({
      title: article.title,
      source: article.source?.name || "Fuente desconocida",
      url: article.url,
      publishedAt: article.publishedAt,
      perspective: "Cobertura externa relacionada", // perspectiva fija
    }));
  } catch (err) {
    // Si falla, mostramos advertencia y devolvemos array vacío
    console.warn("[newsService] No se pudieron obtener contra-narrativas:", err.message);
    return [];
  }
}

module.exports = { findCounterNarratives };