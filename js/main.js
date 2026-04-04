/**
 * UNDERCOVER — main.js
 * Entry point principal. Inicializa todos los módulos y conecta
 * los event listeners del DOM con las funciones exportadas.
 */

import { loadSavedConfig, players, geminiApiKey } from './config.js';
import { changeScreen, showToast }               from './ui.js';
import { addPlayer, handlePlayerEnter, renderPlayers, updateSummaryBar } from './players.js';
import {
    openConfig, closeConfig,
    updateConfigControls, changeImpostors, changeTime,
    selectDifficulty, saveApiKey,
} from './configScreen.js';
import { buildCategoryGrid, goToCategory, selectAndStart } from './categories.js';
import { setupDoorEvents, confirmTurn, startGame }         from './game.js';
import { setupTimerRing, toggleTimer, resetTimer, showTimerScreen } from './timer.js';
import { openRevealModal, closeRevealModal, returnToMenu, restartSameCategory, changeCategoryAction } from './modal.js';

// ─────────────────────────────────────────────────
// INICIALIZACIÓN
// ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Cargar config guardada en localStorage
    loadSavedConfig();

    // Construir grid de categorías
    buildCategoryGrid();

    // Configurar mecánica de la puerta
    setupDoorEvents();

    // Configurar anillo del timer
    setupTimerRing();

    // Prellenar API key si ya existe
    const keyInput = document.getElementById('config-api-key');
    if (keyInput && geminiApiKey) keyInput.value = geminiApiKey;

    // Barra de resumen inicial
    updateSummaryBar();

    // Polyfill dvh para móvil
    setDvh();
    window.addEventListener('resize', setDvh);
    window.addEventListener('orientationchange', () => setTimeout(setDvh, 150));

    // ── Pantalla 1: Registro ──
    bindBtn('btn-add-player',    () => addPlayer());
    bindBtn('btn-open-config',   () => openConfig());
    bindBtn('btn-go-to-category', () => {
        if (players.length < 3) {
            showToast('Necesitas al menos 3 jugadores.', 'error');
            return;
        }
        goToCategory();
    });

    const playerInput = document.getElementById('new-player');
    if (playerInput) playerInput.addEventListener('keypress', handlePlayerEnter);

    // ── Pantalla Config ──
    bindBtn('config-btn-back',           () => closeConfig());
    bindBtn('config-btn-minus-impostor', () => changeImpostors(-1));
    bindBtn('config-btn-plus-impostor',  () => changeImpostors(1));
    bindBtn('config-btn-minus-time',     () => changeTime(-1));
    bindBtn('config-btn-plus-time',      () => changeTime(1));
    bindBtn('config-btn-save-key',       () => saveApiKey());

    // Difficulty pills
    document.querySelectorAll('.difficulty-pill').forEach(pill => {
        pill.addEventListener('click', () => selectDifficulty(pill.dataset.diff));
    });

    // ── Pantalla 2: Categorías ──
    bindBtn('btn-go-back-category', () => changeScreen('screen-register'));
    bindBtn('btn-start-game', () => startGame());

    // ── Pantalla 3: Juego ──
    bindBtn('btn-confirm', () => confirmTurn());

    // ── Pantalla 4: Timer ──
    bindBtn('btn-toggle-timer', () => toggleTimer());
    bindBtn('btn-reset-timer',  () => resetTimer());
    bindBtn('btn-reveal',       () => openRevealModal());
    bindBtn('btn-change-theme', () => changeCategoryAction());
    bindBtn('btn-restart-same', () => restartSameCategory());
    bindBtn('btn-return-menu',  () => returnToMenu());

    // ── Modal ──
    bindBtn('btn-close-modal',    () => closeRevealModal());
    bindBtn('btn-new-game-modal', () => returnToMenu());
});

// ─────────────────────────────────────────────────
// POLYFILL DVH
// ─────────────────────────────────────────────────
function setDvh() {
    const dvh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--dvh', dvh + 'px');
}

// ─────────────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────────────
function bindBtn(id, fn) {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', fn);
}
