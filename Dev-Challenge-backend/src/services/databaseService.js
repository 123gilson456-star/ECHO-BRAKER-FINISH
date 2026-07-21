// Pool de conexiones a PostgreSQL
const { pool } = require("../config/db");
// Módulo crypto para generar hashes
const crypto = require("crypto");

/**
 * Genera un hash SHA256 de una cadena de entrada (texto o URL).
 */
function hashInput(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

/**
 * Busca en la tabla analysis_cache si ya existe un análisis con el hash dado.
 * Devuelve el ID del análisis si existe, o null.
 */
async function findCachedAnalysis(inputHash) {
  const res = await pool.query(
    "SELECT analysis_id FROM analysis_cache WHERE input_hash = $1",
    [inputHash]
  );
  return res.rows.length ? res.rows[0].analysis_id : null;
}

/**
 * Guarda un análisis completo con todos sus datos relacionados.
 * Utiliza una transacción para asegurar consistencia.
 */
async function saveFullAnalysis({
  inputType,
  sourceUrl,
  originalExcerpt,
  summary,
  detectedTone,
  websiteType,
  languageBreakdown = {},
  keywords = [],
  counterNarratives = [],
  inputHash,
}) {
  // El inputHash es obligatorio
  if (!inputHash) {
    throw new Error("saveFullAnalysis requiere un inputHash ya calculado.");
  }

  // Obtenemos un cliente de la conexión
  const client = await pool.connect();
  try {
    // Iniciamos la transacción
    await client.query("BEGIN");

    // 1. Insertar el registro principal en analyses
    const analysisRes = await client.query(
      `INSERT INTO analyses (input_type, source_url, original_excerpt, summary, detected_tone, website_type)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [inputType, sourceUrl, originalExcerpt, summary, detectedTone, websiteType]
    );
    const analysisId = analysisRes.rows[0].id;

    // 2. Insertar los porcentajes de lenguaje en analysis_language_scores
    for (const [category, percentage] of Object.entries(languageBreakdown)) {
      const validPercentage = Math.min(100, Math.max(0, Number(percentage) || 0));
      await client.query(
        `INSERT INTO analysis_language_scores (analysis_id, category, percentage)
         VALUES ($1, $2, $3)
         ON CONFLICT (analysis_id, category) DO NOTHING`,
        [analysisId, category, validPercentage]
      );
    }

    // 3. Insertar palabras clave en la tabla keywords (si no existen) y relacionarlas
    for (const rawWord of keywords) {
      const word = String(rawWord).trim().toLowerCase();
      if (!word) continue;

      // Insertamos o obtenemos el ID de la keyword (ON CONFLICT DO UPDATE devuelve id)
      const kwRes = await client.query(
        `INSERT INTO keywords (word) VALUES ($1)
         ON CONFLICT (word) DO UPDATE SET word = EXCLUDED.word
         RETURNING id`,
        [word]
      );
      // Relacionamos análisis y keyword
      await client.query(
        `INSERT INTO analysis_keywords (analysis_id, keyword_id)
         VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [analysisId, kwRes.rows[0].id]
      );
    }

    // 4. Insertar contra‑narrativas
    for (const item of counterNarratives) {
      await client.query(
        `INSERT INTO counter_narratives (analysis_id, title, source, url, published_at, perspective)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          analysisId,
          item.title || "",
          item.source || null,
          item.url || null,
          item.publishedAt || null,
          item.perspective || null,
        ]
      );
    }

    // 5. Guardar en la caché
    await client.query(
      `INSERT INTO analysis_cache (input_hash, source_url, analysis_id)
       VALUES ($1, $2, $3)`,
      [inputHash, sourceUrl, analysisId]
    );

    // Confirmamos la transacción
    await client.query("COMMIT");
    return analysisId;
  } catch (err) {
    // En caso de error, deshacemos la transacción
    await client.query("ROLLBACK");
    throw err;
  } finally {
    // Liberamos el cliente de vuelta al pool
    client.release();
  }
}

/**
 * Obtiene un análisis completo con todos sus datos relacionados por su ID.
 * Devuelve el objeto enriquecido o null si no existe.
 */
async function getFullAnalysis(analysisId) {
  // 1. Obtener el registro principal
  const analysisRes = await pool.query(
    "SELECT * FROM analyses WHERE id = $1",
    [analysisId]
  );
  if (analysisRes.rows.length === 0) return null;
  const analysis = analysisRes.rows[0];

  // 2. Obtener los porcentajes de lenguaje
  const scoresRes = await pool.query(
    "SELECT category, percentage FROM analysis_language_scores WHERE analysis_id = $1",
    [analysisId]
  );
  const languageBreakdown = {};
  scoresRes.rows.forEach((r) => {
    languageBreakdown[r.category] = r.percentage;
  });

  // 3. Obtener las palabras clave
  const keywordsRes = await pool.query(
    `SELECT k.word FROM keywords k
     JOIN analysis_keywords ak ON k.id = ak.keyword_id
     WHERE ak.analysis_id = $1`,
    [analysisId]
  );
  const keywords = keywordsRes.rows.map((r) => r.word);

  // 4. Obtener las contra‑narrativas
  const cnRes = await pool.query(
    `SELECT title, source, url, published_at AS "publishedAt", perspective
     FROM counter_narratives WHERE analysis_id = $1`,
    [analysisId]
  );

  // Devolvemos el objeto completo
  return {
    ...analysis,
    languageBreakdown,
    keywords,
    counterNarratives: cnRes.rows,
  };
}

// Exportamos las funciones
module.exports = {
  hashInput,
  findCachedAnalysis,
  saveFullAnalysis,
  getFullAnalysis,
};