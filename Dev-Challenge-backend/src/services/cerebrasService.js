// Importamos el cliente de Cerebras y el modelo
const { cerebras, MODEL } = require("../config/cerebras");

// Prompt del sistema que define el comportamiento del modelo
const SYSTEM_PROMPT = `Eres Echo-Breaker, un motor de análisis que detecta si un texto está diseñado para confirmar sesgos cognitivos (efecto "cámara de eco").

Analiza el texto y devuelve ÚNICAMENTE un objeto JSON válido, sin texto adicional, sin markdown, con esta estructura exacta:

{
  "summary": "Resumen de 2-3 frases en español explicando el hallazgo principal y si tiene sesgo o es neutral.",
  "detectedTone": "Clasifica el tono general en una de estas palabras: 'informativo', 'polarizante', 'neutral', 'emocional', 'agresivo' o 'persuasivo'.",
  "websiteType": "Clasifica el tipo de fuente según esta lista: 'blog', 'noticias', 'redes_sociales', 'foro', 'wiki', 'educativo', 'gubernamental', 'organizacion_sin_fines_lucro', 'corporativa', 'e-commerce', 'portafolio', 'landing_page', 'multimedia', 'streaming', 'podcast', 'revista_digital', 'periodico', 'agencia_noticias', 'cientifico', 'tecnologico', 'salud', 'deportes', 'entretenimiento', 'financiero', 'legal', 'religioso', 'personal', 'otro'.",
  "languageBreakdown": {
    "academico": 0-100,
    "agresivo": 0-100,
    "emocional": 0-100,
    "informativo": 0-100,
    "persuasivo": 0-100,
    "neutral": 0-100
  },
  "keywords": ["palabra1", "palabra2", "palabra3", "palabra4", "palabra5"]
}

Asegúrate de que los porcentajes de languageBreakdown sumen 100. Si no estás seguro, distribuye el peso de forma lógica según el texto.`;

// Lista de categorías de lenguaje que esperamos
const LANGUAGE_CATEGORIES = [
  "academico",
  "agresivo",
  "emocional",
  "informativo",
  "persuasivo",
  "neutral",
];

/**
 * Normaliza el desglose de lenguaje para que:
 * - Todas las categorías existan (si faltan, se ponen a 0)
 * - Los valores sean números válidos y no negativos
 * - La suma sea exactamente 100 (redondeando y escalando si es necesario)
 */
function normalizeLanguageBreakdown(rawBreakdown = {}) {
  const breakdown = {};

  // 1. Aseguramos que todas las categorías estén presentes y sean números válidos
  LANGUAGE_CATEGORIES.forEach((cat) => {
    const value = Number(rawBreakdown[cat]);
    breakdown[cat] = Number.isFinite(value) ? Math.max(0, value) : 0;
  });

  // Calculamos la suma actual
  const total = LANGUAGE_CATEGORIES.reduce((sum, cat) => sum + breakdown[cat], 0);

  // 2. Si todas son 0, asignamos 100 a 'neutral' como fallback
  if (total === 0) {
    breakdown.neutral = 100;
    return breakdown;
  }

  // 3. Escalamos proporcionalmente para que sumen 100 y redondeamos
  const factor = 100 / total;
  let runningSum = 0;
  LANGUAGE_CATEGORIES.forEach((cat, idx) => {
    if (idx === LANGUAGE_CATEGORIES.length - 1) {
      // La última categoría absorbe el residuo para asegurar suma exacta
      breakdown[cat] = 100 - runningSum;
    } else {
      breakdown[cat] = Math.round(breakdown[cat] * factor);
      runningSum += breakdown[cat];
    }
  });

  // 4. Salvaguarda: ningún valor negativo
  LANGUAGE_CATEGORIES.forEach((cat) => {
    if (breakdown[cat] < 0) breakdown[cat] = 0;
  });

  return breakdown;
}

/**
 * Función principal: analiza el texto utilizando Cerebras y devuelve el resultado estructurado.
 */
async function analyzeBias(text) {
  // Limitamos el texto a 18000 caracteres para evitar exceder el límite del modelo
  const trimmedText = text.slice(0, 18000);

  // Llamada a la API de Cerebras (chat completions)
  const completion = await cerebras.chat.completions.create({
    model: MODEL,
    temperature: 0.3, // Temperatura baja para respuestas más deterministas
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: trimmedText },
    ],
  });

  // Extraemos el contenido de la respuesta, o un objeto vacío si falla
  const raw = completion.choices?.[0]?.message?.content?.trim() || "{}";

  let parsed;
  try {
    // Limpiamos posibles marcadores de código markdown
    const cleaned = raw.replace(/```json|```/g, "").trim();
    parsed = JSON.parse(cleaned);
  } catch (err) {
    // Si la respuesta no es JSON válido, lanzamos un error
    throw new Error("El modelo de Cerebras devolvió una respuesta inválida.");
  }

  // Devolvemos el objeto con valores por defecto en caso de que falten campos
  return {
    summary: parsed.summary || "Análisis completado sin resumen detallado.",
    detectedTone: parsed.detectedTone || "neutral",
    websiteType: parsed.websiteType || "otro",
    languageBreakdown: normalizeLanguageBreakdown(parsed.languageBreakdown),
    keywords: Array.isArray(parsed.keywords) ? parsed.keywords.slice(0, 5) : [],
  };
}

// Exportamos la función para usarla en el controlador
module.exports = { analyzeBias };