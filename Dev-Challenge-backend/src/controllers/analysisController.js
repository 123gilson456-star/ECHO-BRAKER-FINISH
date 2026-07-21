// Servicios necesarios
const { extractTextFromUrl } = require("../services/textExtractor");
const { analyzeBias } = require("../services/cerebrasService");
const { findCounterNarratives } = require("../services/newsService");
const {
  hashInput,
  findCachedAnalysis,
  saveFullAnalysis,
  getFullAnalysis,
} = require("../services/databaseService");
const { pool } = require("../config/db");

/**
 * Transforma una fila de la base de datos al formato esperado por el cliente.
 * (Cliente espera _id, inputType, etc.)
 */
function toClientShape(row) {
  if (!row) return null;
  return {
    _id: row.id,
    inputType: row.input_type,
    sourceUrl: row.source_url,
    originalExcerpt: row.original_excerpt,
    summary: row.summary,
    detectedTone: row.detected_tone,
    websiteType: row.website_type,
    createdAt: row.created_at,
    languageBreakdown: row.languageBreakdown,
    keywords: row.keywords,
    counterNarratives: row.counterNarratives,
  };
}

/**
 * Controlador para crear un nuevo análisis (POST /api/analyses).
 */
async function createAnalysis(req, res, next) {
  try {
    const { text, url } = req.body;
    // Validamos que al menos uno de los campos esté presente
    if (!text && !url) {
      return res.status(400).json({ error: "Debes enviar 'text' o 'url'." });
    }

    let inputType = "text";
    let contentToAnalyze = text;
    let sourceUrl = null;

    // Si se proporciona URL, extraemos el texto
    if (url) {
      inputType = "url";
      sourceUrl = url;
      const extracted = await extractTextFromUrl(url);
      contentToAnalyze = extracted.text;
    }

    // Validamos que el texto tenga al menos 50 caracteres
    if (!contentToAnalyze || contentToAnalyze.trim().length < 50) {
      return res.status(400).json({
        error: "El texto es demasiado corto para un análisis confiable (mínimo ~50 caracteres).",
      });
    }

    // Calculamos el hash del input (usamos la URL si existe, o el texto)
    const inputHash = hashInput(sourceUrl || contentToAnalyze);

    // Verificamos caché
    const cachedId = await findCachedAnalysis(inputHash);
    if (cachedId) {
      const cached = await getFullAnalysis(cachedId);
      // Devolvemos el análisis existente con status 200 (OK)
      return res.json(toClientShape(cached));
    }

    // Si no está en caché, llamamos a Cerebras para analizar
    const result = await analyzeBias(contentToAnalyze);
    // Obtenemos contra‑narrativas usando las keywords del resultado
    const counterNarratives = await findCounterNarratives(result.keywords);

    // Guardamos todo en la base de datos
    const newId = await saveFullAnalysis({
      inputType,
      sourceUrl,
      originalExcerpt: contentToAnalyze.slice(0, 500), // guardamos un extracto
      summary: result.summary,
      detectedTone: result.detectedTone,
      websiteType: result.websiteType,
      languageBreakdown: result.languageBreakdown,
      keywords: result.keywords,
      counterNarratives,
      inputHash,
    });

    // Recuperamos el análisis completo recién guardado
    const full = await getFullAnalysis(newId);
    // Devolvemos el nuevo análisis con status 201 (Created)
    return res.status(201).json(toClientShape(full));
  } catch (err) {
    // Pasamos el error al middleware de errores
    return next(err);
  }
}

/**
 * Controlador para listar análisis (GET /api/analyses).
 * Permite limitar la cantidad con query param 'limit'.
 */
async function listAnalyses(req, res, next) {
  try {
    // Limitamos a un máximo de 50 registros
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    // Consultamos los análisis ordenados por fecha descendente
    const result = await pool.query(
      `SELECT id, input_type, source_url, original_excerpt, summary,
              detected_tone, website_type, created_at
       FROM analyses ORDER BY created_at DESC LIMIT $1`,
      [limit]
    );
    // Mapeamos al formato de cliente y devolvemos
    return res.json(result.rows.map(toClientShape));
  } catch (err) {
    return next(err);
  }
}

/**
 * Controlador para obtener un análisis por su ID (GET /api/analyses/:id).
 */
async function getAnalysis(req, res, next) {
  try {
    const analysis = await getFullAnalysis(req.params.id);
    if (!analysis) {
      return res.status(404).json({ error: "Análisis no encontrado." });
    }
    return res.json(toClientShape(analysis));
  } catch (err) {
    return next(err);
  }
}

// Exportamos los controladores
module.exports = { createAnalysis, listAnalyses, getAnalysis };