/**
 * UNDERCOVER — config.js
 * Estado global del juego y configuración persistente.
 * IMPORTAR primero en el módulo principal (index.html).
 */

// ─────────────────────────────────────────────────
// ESTADO DE JUGADORES
// ─────────────────────────────────────────────────
export let players = [];

export function setPlayers(arr) { players = arr; }
export function addPlayerToList(name) { players.push(name); }
export function removePlayerFromList(index) { players.splice(index, 1); }

// ─────────────────────────────────────────────────
// CONFIGURACIÓN (persiste en localStorage)
// ─────────────────────────────────────────────────
export let numImpostors = 1;
export let timeSeconds = 90;
export let difficulty = 'normal'; // 'easy' | 'normal' | 'hard'
export let geminiApiKey = '';
export let userSetImpostors = false; // true cuando el usuario ajustó manualmente

export function setNumImpostors(val) {
    numImpostors = val;
    localStorage.setItem('uc_impostors', val);
}
export function setUserSetImpostors(val) { userSetImpostors = val; }
export function setTimeSeconds(val) {
    timeSeconds = val;
    localStorage.setItem('uc_time', val);
}
export function setDifficulty(val) {
    difficulty = val;
    localStorage.setItem('uc_difficulty', val);
}
export function setGeminiApiKey(val) {
    geminiApiKey = val;
    localStorage.setItem('uc_gemini_key', val);
}

// Cargar configuración guardada al iniciar
export function loadSavedConfig() {
    const savedImp = localStorage.getItem('uc_impostors');
    const savedTime = localStorage.getItem('uc_time');
    const savedDiff = localStorage.getItem('uc_difficulty');
    const savedKey = localStorage.getItem('uc_gemini_key');

    if (savedImp !== null) numImpostors = parseInt(savedImp, 10);
    if (savedTime !== null) timeSeconds = parseInt(savedTime, 10);
    if (savedDiff !== null) difficulty = savedDiff;
    if (savedKey !== null) geminiApiKey = savedKey;
}

// ─────────────────────────────────────────────────
// ESTADO DE PARTIDA
// ─────────────────────────────────────────────────
export let impostorIndices = [];
export let currentPlayerIndex = 0;
export let currentWord = '';
export let currentHint = ''; // hint1: pista modo fácil
export let currentHint2 = ''; // hint2: pista modo normal
export let currentCategory = '';
export let selectedCategory = 'Mix';
export let playedWords = JSON.parse(localStorage.getItem('uc_played') || '[]');
export let aiBuffer = [];
export let isFetching = false;

export function setImpostorIndices(arr) { impostorIndices = arr; }
export function setCurrentPlayerIndex(val) { currentPlayerIndex = val; }
export function setCurrentWord(val) { currentWord = val; }
export function setCurrentHint(val) { currentHint = val; }
export function setCurrentHint2(val) { currentHint2 = val; }
export function setCurrentCategory(val) { currentCategory = val; }
export function setSelectedCategory(val) { selectedCategory = val; }
export function setIsFetching(val) { isFetching = val; }
export function clearAiBuffer() { aiBuffer = []; }
export function pushAiBuffer(...items) { aiBuffer.push(...items); }
export function shiftAiBuffer() { return aiBuffer.shift(); }

export function addPlayedWord(word) {
    if (!playedWords.includes(word)) {
        playedWords.push(word);
        localStorage.setItem('uc_played', JSON.stringify(playedWords));
    }
}

// ─────────────────────────────────────────────────
// DEFINICIÓN DE CATEGORÍAS (para el grid)
// ─────────────────────────────────────────────────
export const CATEGORIES_META = [
    { id: 'Infantil', label: 'Infantil', emoji: '🧸', color: '#ec4899' },
    { id: 'Peliculas', label: 'Películas', emoji: '🎬', color: '#f59e0b' },
    { id: 'Objetos', label: 'Objetos', emoji: '💡', color: '#06b6d4' },
    { id: 'Lugares', label: 'Lugares', emoji: '🌍', color: '#10b981' },
    { id: 'Adultos', label: 'Adultos', emoji: '🔥', color: '#ef4444' },
    { id: 'Picante', label: 'Picante', emoji: '😈', color: '#dc2626' },
    { id: 'Profesiones', label: 'Profesiones', emoji: '🧑‍💼', color: '#8b5cf6' },
    { id: 'Cuerpo', label: 'Cuerpo humano', emoji: '🫀', color: '#f43f5e' },
    { id: 'Animales', label: 'Animales', emoji: '🐾', color: '#84cc16' },
    { id: 'Emociones', label: 'Emociones', emoji: '😤', color: '#a78bfa' },
    { id: 'Comida', label: 'Comida', emoji: '🍕', color: '#fb923c' },
    { id: 'Videojuegos', label: 'Videojuegos', emoji: '🎮', color: '#22d3ee' },
    { id: 'Superhéroes', label: 'Superhéroes', emoji: '🦸', color: '#facc15' },
    { id: 'Famosos', label: 'Famosos', emoji: '🌟', color: '#f472b6' },
    { id: 'Países', label: 'Países', emoji: '🗺️', color: '#34d399' },
    { id: 'Abstracto', label: 'Abstracto', emoji: '🌌', color: '#818cf8' },
    { id: 'Mix', label: 'Aleatorio', emoji: '🎲', color: '#6366f1' },
    { id: 'Custom', label: 'Personalizada', emoji: '✨', color: '#c084fc' },
];
