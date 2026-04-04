/**
 * UNDERCOVER — configScreen.js
 * Pantalla de configuración: impostores, dificultad, tiempo y API Key.
 */

import {
    players, numImpostors, setNumImpostors,
    timeSeconds, setTimeSeconds,
    difficulty, setDifficulty,
    geminiApiKey, setGeminiApiKey,
    setUserSetImpostors,
} from './config.js';
import { changeScreen, showToast } from './ui.js';
import { updateSummaryBar } from './players.js';

// ─────────────────────────────────────────────────
// ACTUALIZAR CONTROLES DE CONFIGURACIÓN
// ─────────────────────────────────────────────────
export function updateConfigControls() {
    const n      = players.length;
    const enough = n >= 3;

    // Wrappers de stepper
    const impWrapper  = document.getElementById('config-impostor-wrapper');
    const timeWrapper = document.getElementById('config-time-wrapper');
    if (impWrapper)  impWrapper.classList.toggle('active', enough);
    if (timeWrapper) timeWrapper.classList.toggle('active', enough);

    if (!enough) return;

    // ── Impostores ──
    const maxImp  = Math.max(1, Math.floor(n / 2));
    if (numImpostors > maxImp) setNumImpostors(maxImp);
    if (numImpostors < 1)      setNumImpostors(1);

    const countEl = document.getElementById('config-impostor-count');
    const plural  = document.getElementById('config-impostor-plural');
    const minus   = document.getElementById('config-btn-minus-impostor');
    const plus    = document.getElementById('config-btn-plus-impostor');
    const impHint = document.getElementById('config-impostor-hint');

    if (countEl) countEl.textContent = numImpostors;
    if (plural)  plural.textContent  = numImpostors > 1 ? 'es' : '';
    if (minus)   minus.disabled      = numImpostors <= 1;
    if (plus)    plus.disabled       = numImpostors >= maxImp;
    if (impHint) {
        const dets = n - numImpostors;
        impHint.textContent = `${dets} detective${dets !== 1 ? 's' : ''} vs ${numImpostors} impostor${numImpostors !== 1 ? 'es' : ''}`;
    }

    // ── Tiempo ──
    if (timeSeconds < 30) setTimeSeconds(30);
    const timeEl    = document.getElementById('config-time-display');
    const minusTime = document.getElementById('config-btn-minus-time');
    const plusTime  = document.getElementById('config-btn-plus-time');
    const timeHint  = document.getElementById('config-time-hint');

    if (timeEl)    timeEl.textContent    = formatSeconds(timeSeconds);
    if (minusTime) minusTime.disabled    = timeSeconds <= 30;
    if (plusTime)  plusTime.disabled     = timeSeconds >= 3600;
    if (timeHint)  timeHint.textContent  = `${timeSeconds} segundos de discusión`;

    // ── Dificultad: resaltar pill activo ──
    document.querySelectorAll('.difficulty-pill').forEach(pill => {
        pill.classList.toggle('active', pill.dataset.diff === difficulty);
    });

    // ── API Key: prellenar el campo si ya hay una guardada ──
    const keyInput = document.getElementById('config-api-key');
    if (keyInput && geminiApiKey && !keyInput.value) {
        keyInput.value = geminiApiKey;
    }
}

// ─────────────────────────────────────────────────
// ACCIONES DE IMPOSTORES
// ─────────────────────────────────────────────────
export function changeImpostors(delta) {
    const max = Math.max(1, Math.floor(players.length / 2));
    setNumImpostors(Math.min(max, Math.max(1, numImpostors + delta)));
    setUserSetImpostors(true); // el usuario ajustó manualmente
    updateConfigControls();
}

// ─────────────────────────────────────────────────
// ACCIONES DE TIEMPO
// ─────────────────────────────────────────────────
export function changeTime(delta) {
    setTimeSeconds(Math.max(30, Math.min(3600, timeSeconds + delta * 30)));
    updateConfigControls();
    updateSummaryBar();
}

// ─────────────────────────────────────────────────
// MODO DE DIFICULTAD
// ─────────────────────────────────────────────────
export function selectDifficulty(diff) {
    setDifficulty(diff);
    document.querySelectorAll('.difficulty-pill').forEach(pill => {
        pill.classList.toggle('active', pill.dataset.diff === diff);
    });
}

// ─────────────────────────────────────────────────
// API KEY
// ─────────────────────────────────────────────────
export function saveApiKey() {
    const input = document.getElementById('config-api-key');
    if (!input) return;
    const key = input.value.trim();
    setGeminiApiKey(key);
    showToast(key ? 'API Key guardada ✓' : 'API Key eliminada', key ? 'success' : 'info');
}


// ─────────────────────────────────────────────────
// NAVEGACIÓN
// ─────────────────────────────────────────────────
export function openConfig() {
    updateConfigControls();
    changeScreen('screen-config');
}

export function closeConfig() {
    // Guardar API Key al cerrar si hay contenido en el input
    const keyInput = document.getElementById('config-api-key');
    if (keyInput) setGeminiApiKey(keyInput.value.trim());
    updateSummaryBar(); // reflejar cambios en pantalla principal
    changeScreen('screen-register');
}

// ─────────────────────────────────────────────────
// UTIL
// ─────────────────────────────────────────────────
function formatSeconds(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return s === 0 ? `${m}:00` : `${m}:${s.toString().padStart(2, '0')}`;
}
