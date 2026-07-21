-- Habilitamos la extensión para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla principal de análisis
CREATE TABLE IF NOT EXISTS analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    input_type VARCHAR(10) NOT NULL CHECK (input_type IN ('text', 'url')),
    source_url TEXT,
    original_excerpt TEXT NOT NULL,
    summary TEXT NOT NULL,
    detected_tone VARCHAR(50) NOT NULL,
    website_type VARCHAR(30) NOT NULL DEFAULT 'otro' CHECK (website_type IN ('e-commerce', 'corporativa', 'blog', 'portafolio', 'landing_page', 'redes_sociales', 'multimedia', 'otro')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Porcentajes de lenguaje por análisis
CREATE TABLE IF NOT EXISTS analysis_language_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
    category VARCHAR(20) NOT NULL CHECK (category IN ('academico', 'agresivo', 'emocional', 'informativo', 'persuasivo', 'neutral')),
    percentage INTEGER NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
    UNIQUE(analysis_id, category)
);

-- Tabla maestra de palabras clave
CREATE TABLE IF NOT EXISTS keywords (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    word VARCHAR(255) UNIQUE NOT NULL
);

-- Relación muchos a muchos entre análisis y keywords
CREATE TABLE IF NOT EXISTS analysis_keywords (
    analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
    keyword_id UUID REFERENCES keywords(id) ON DELETE CASCADE,
    PRIMARY KEY (analysis_id, keyword_id)
);

-- Contra‑narrativas (artículos relacionados)
CREATE TABLE IF NOT EXISTS counter_narratives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    source VARCHAR(255),
    url TEXT,
    published_at VARCHAR(100),
    perspective TEXT
);

-- Tabla de caché para evitar reprocesar el mismo contenido
CREATE TABLE IF NOT EXISTS analysis_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    input_hash VARCHAR(64) UNIQUE NOT NULL,
    source_url TEXT,
    analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lang_scores_analysis_id ON analysis_language_scores(analysis_id);
CREATE INDEX IF NOT EXISTS idx_counter_narratives_analysis_id ON counter_narratives(analysis_id);
CREATE INDEX IF NOT EXISTS idx_analysis_keywords_analysis ON analysis_keywords(analysis_id);
CREATE INDEX IF NOT EXISTS idx_analysis_keywords_keyword ON analysis_keywords(keyword_id);
CREATE INDEX IF NOT EXISTS idx_keywords_word ON keywords(word);
CREATE INDEX IF NOT EXISTS idx_cache_input_hash ON analysis_cache(input_hash);