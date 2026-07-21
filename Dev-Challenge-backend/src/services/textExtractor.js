// Cliente HTTP para descargar páginas web
const axios = require("axios");
// Cheerio para parsear HTML y extraer texto
const cheerio = require("cheerio");

/**
 * Extrae el contenido textual principal de una URL.
 * Intenta obtener el título y los párrafos significativos.
 */
async function extractTextFromUrl(url) {
  // Descargamos el HTML de la URL con timeout y un User-Agent personalizado
  const { data: html } = await axios.get(url, {
    timeout: 10000,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; EchoBreakerBot/1.0; +https://echo-breaker.app)",
    },
  });

  // Cargamos el HTML en Cheerio para manipularlo
  const $ = cheerio.load(html);
  // Eliminamos elementos que no contienen texto relevante (scripts, estilos, etc.)
  $("script, style, nav, header, footer, aside, iframe, noscript, form").remove();

  // Buscamos contenedores típicos de contenido: article, main, o body
  let container = $("article");
  if (container.length === 0) container = $("main");
  if (container.length === 0) container = $("body");

  // Extraemos todos los párrafos dentro del contenedor, filtramos los que tengan más de 40 caracteres
  const paragraphs = container
    .find("p")
    .map((_, el) => $(el).text().trim())
    .get()
    .filter((text) => text.length > 40);

  // Obtenemos el título de la página (de la etiqueta <title> o del primer <h1>)
  const title = $("title").first().text().trim() || $("h1").first().text().trim();
  // Unimos los párrafos con dos saltos de línea
  const bodyText = paragraphs.join("\n\n");

  // Si no hay suficiente texto, lanzamos un error
  if (!bodyText || bodyText.length < 100) {
    throw new Error(
      "No se pudo extraer suficiente texto del articulo. Prueba pegando el texto directamente."
    );
  }

  // Devolvemos el título y el texto (limitado a 12000 caracteres)
  return {
    title,
    text: bodyText.slice(0, 12000),
  };
}

module.exports = { extractTextFromUrl };