/**
 * UNDERCOVER — ai.js
 * Integración con Google Gemini API para palabras de categoría personalizada.
 * Usa el SDK oficial @google/genai vía CDN ESM (esm.sh).
 */

import {
    geminiApiKey, aiBuffer, pushAiBuffer,
    isFetching, setIsFetching, playedWords,
} from './config.js';

// Modelos en orden de preferencia según cuota free tier:
// 3.1-flash-lite → 500 req/día (mejor opción)
// 2.5-flash-lite → 20 req/día  (respaldo)
// 2.0-flash      → 20 req/día  (último recurso)
const MODELS = [
    'gemini-3.1-flash-lite',
    'gemini-3.1-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.5-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash',
];

// ─────────────────────────────────────────────────
// HELPER: espera N milisegundos
// ─────────────────────────────────────────────────
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ─────────────────────────────────────────────────
// HELPER: extrae el retryDelay de un error 429
// ─────────────────────────────────────────────────
function getRetryDelay(err) {
    try {
        const body = typeof err.message === 'string' ? JSON.parse(err.message) : err;
        const details = body?.error?.details ?? [];
        for (const d of details) {
            if (d['@type']?.endsWith('RetryInfo') && d.retryDelay) {
                const secs = parseFloat(d.retryDelay);
                if (!isNaN(secs)) return Math.ceil(secs) * 1000;
            }
        }
    } catch (_) { /* ignorar */ }
    return null;
}

// ─────────────────────────────────────────────────
// FETCH DE PALABRAS CON GEMINI
// ─────────────────────────────────────────────────

/**
 * Genera 5 palabras para el tema indicado usando Gemini.
 * Intenta con varios modelos y hace retry con backoff en 429.
 * @param {string} topic — Tema seleccionado (Custom o BD)
 * @param {Array<string>} excludeWords — Lista de palabras a evadir (de la BD)
 * @returns {Promise<boolean>} — true si se obtuvieron palabras, false si falló
 */
export async function fetchAIWords(topic, excludeWords = []) {
    if (isFetching) return false;
    if (!geminiApiKey) {
        console.warn('[AI] No hay API Key de Gemini configurada.');
        return false;
    }

    setIsFetching(true);

    const avoidStr = excludeWords.length > 0 ? `\nNO uses NINGUNA de estas palabras: ${excludeWords.join(', ')}` : '';

    const prompt = `Quiero que generes listas de palabras para un juego tipo adivinanza con dos pistas (hints) por cada palabra.

Reglas IMPORTANTES:

1. Cada palabra debe tener:
   * hint1: modo fácil → una frase o idea general, pero NO obvia
   * hint2: modo normal → una o máximo dos palabras, indirectas y difíciles

2. Las pistas NO deben ser evidentes.
   * Evita usar partes directas de la palabra.
   * Evita descripciones demasiado claras.
   * Deben ser lo suficientemente ambiguas para confundir con otras opciones.

3. El objetivo es que sea DIFÍCIL adivinar, incluso con hint1.

4. Estilo:
   * Puede incluir doble sentido, ambigüedad o interpretación amplia.
   * Para categorías "adultos", "picante", usar insinuación y tensión, pero sin ser explícito.

5. Formato de salida:
   * Estructura (array JSON simple, sin markdown, comentarios tuyos ni bloques de código):
     [
       { "word": "", "hint1": "", "hint2": "" }
     ]

6. Cantidad:
   * Generar exactamente 5 palabras por categoría.

Empieza con la categoría: ${topic}${avoidStr}

Mantén creatividad alta y evita repetir patrones en las pistas.`;

    try {
        const { GoogleGenAI } = await import('https://esm.sh/@google/genai');
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });

        for (const model of MODELS) {
            const MAX_RETRIES = 3;
            for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
                try {
                    console.log(`[AI] Intentando con modelo: ${model} (intento ${attempt}/${MAX_RETRIES})`);
                    const response = await ai.models.generateContent({ model, contents: prompt });

                    let text = response.text.trim();
                    const startIdx = text.indexOf('[');
                    const endIdx = text.lastIndexOf(']');
                    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
                        text = text.substring(startIdx, endIdx + 1);
                    }
                    const json = JSON.parse(text);

                    if (Array.isArray(json) && json.length > 0) {
                        const fresh = json.filter(
                            item => item.word && item.hint1 && item.hint2 && !playedWords.includes(item.word)
                        );
                        pushAiBuffer(...fresh);
                        setIsFetching(false);
                        console.log(`[AI] ✅ Éxito con modelo: ${model}`);
                        return fresh.length > 0;
                    }
                    break; // JSON inválido pero sin error → pasar al siguiente modelo
                } catch (err) {
                    const is429 = err?.message?.includes('429') || err?.status === 429 ||
                        err?.message?.includes('RESOURCE_EXHAUSTED');

                    const is404 = err?.message?.includes('404') || err?.status === 404 || err?.message?.includes('NOT_FOUND');

                    if (is429) {
                        if (attempt < MAX_RETRIES) {
                            // Usar retryDelay del servidor o backoff exponencial
                            const serverDelay = getRetryDelay(err);
                            const backoff = serverDelay ?? (attempt * 5000);
                            console.warn(`[AI] Cuota excedida (${model}). Esperando ${backoff / 1000}s antes de reintentar...`);
                            await sleep(backoff);
                            continue; // retry mismo modelo
                        } else {
                            console.warn(`[AI] Cuota agotada en ${model}, probando siguiente modelo...`);
                            break; // salir del retry loop, probar siguiente modelo
                        }
                    } else if (is404) {
                        console.warn(`[AI] El modelo ${model} no está disponible (404). Pasando al siguiente modelo...`);
                        break; // salir del retry loop, probar siguiente modelo en el array
                    } else {
                        // Error distinto a 429/404 (auth, red, etc.) → no reintentar
                        console.error(`[AI] Error no recuperable con ${model}:`, err);
                        throw err;
                    }
                }
            }
        }

        console.error('[AI] Todos los modelos fallaron por límite de cuota.');
        // Lanzar error específico para que game.js lo maneje con mensaje correcto
        const quotaErr = new Error('QUOTA_EXHAUSTED');
        quotaErr.isQuotaError = true;
        throw quotaErr;

    } catch (err) {
        if (!err.isQuotaError) {
            console.error('[AI] Error al contactar Gemini:', err);
        }
    }

    setIsFetching(false);
    return false;
}

/**
 * Indica si hay API Key configurada.
 * @returns {boolean}
 */
export function hasApiKey() {
    return Boolean(geminiApiKey && geminiApiKey.length > 10);
}
