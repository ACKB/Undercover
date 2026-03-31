/**
 * UNDERCOVER — ai.js
 * Integración con Google Gemini API para palabras de categoría personalizada.
 * Usa el SDK oficial @google/genai vía CDN ESM (esm.sh).
 */

import {
    geminiApiKey, aiBuffer, pushAiBuffer,
    isFetching, setIsFetching, playedWords,
} from './config.js';

// ─────────────────────────────────────────────────
// FETCH DE PALABRAS CON GEMINI
// ─────────────────────────────────────────────────

/**
 * Genera 8 palabras para el tema indicado usando Gemini.
 * Llena aiBuffer en config.js. Muestra/oculta el overlay de carga.
 * @param {string} topic — Tema personalizado ingresado por el usuario
 * @returns {Promise<boolean>} — true si se obtuvieron palabras, false si falló
 */
export async function fetchAIWords(topic) {
    if (isFetching) return false;
    if (!geminiApiKey) {
        console.warn('[AI] No hay API Key de Gemini configurada.');
        return false;
    }

    setIsFetching(true);

    try {
        // Importación dinámica del SDK oficial de Google GenAI vía CDN
        const { GoogleGenAI } = await import('https://esm.sh/@google/genai');
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });

        const prompt = `Genera un array JSON de 8 objetos para el juego de mesa "Undercover" sobre el tema: "${topic}".
Cada objeto debe tener:
- "word": una palabra o frase corta relacionada con el tema (ej. un elemento, personaje, lugar, concepto)
- "hint": una pista indirecta de 1 frase que describe la palabra sin mencionarla directamente, útil para que el impostor del juego pueda intuir de qué se habla sin saberlo exactamente

Responde SOLO con el array JSON sin ningún texto adicional, sin markdown, sin bloques de código.
Ejemplo de formato:
[{"word":"Ejemplo","hint":"descripción breve e indirecta"},...]`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
        });

        const text  = response.text.trim();
        // Limpiar posibles bloques de código markdown si el modelo los incluye
        const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
        const json  = JSON.parse(clean);

        if (Array.isArray(json) && json.length > 0) {
            const fresh = json.filter(
                item => item.word && item.hint && !playedWords.includes(item.word)
            );
            pushAiBuffer(...fresh);
            setIsFetching(false);
            return fresh.length > 0;
        }
    } catch (err) {
        console.error('[AI] Error al contactar Gemini:', err);
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
