/**
 * UNDERCOVER — players.js
 * Gestión de jugadores: añadir, quitar y renderizar la lista.
 */

import {
    players, addPlayerToList, removePlayerFromList,
    numImpostors, setNumImpostors, timeSeconds, setTimeSeconds,
    userSetImpostors,
} from './config.js';
import { shakeElement, escapeHtml, getInitials } from './ui.js';
import { updateConfigControls } from './configScreen.js';

// ─────────────────────────────────────────────────
// AÑADIR JUGADOR
// ─────────────────────────────────────────────────
export function addPlayer() {
    const input = document.getElementById('new-player');
    const name  = input.value.trim();
    if (!name) { shakeElement(input); return; }

    if (players.map(p => p.toLowerCase()).includes(name.toLowerCase())) {
        shakeElement(input);
        return;
    }

    addPlayerToList(name);
    renderPlayers();
    recalcDefaults();
    input.value = '';
    input.focus();
}

// ─────────────────────────────────────────────────
// ELIMINAR JUGADOR
// ─────────────────────────────────────────────────
export function removePlayer(index) {
    removePlayerFromList(index);
    recalcDefaults();
    renderPlayers();
}

// ─────────────────────────────────────────────────
// RECALCULAR DEFAULTS AL CAMBIAR EL NÚMERO DE JUGADORES
// ─────────────────────────────────────────────────
function recalcDefaults() {
    const n      = players.length;
    const maxImp = Math.max(1, Math.floor(n / 2));

    // Si el usuario NO ajustó manualmente, aplicar siempre el default floor(n/3)
    if (!userSetImpostors) {
        const defaultImp = Math.max(1, Math.min(Math.floor(n / 3), maxImp));
        setNumImpostors(defaultImp);
    } else {
        // Solo corregir si está fuera de rango
        if (numImpostors > maxImp) setNumImpostors(maxImp);
        if (numImpostors < 1)      setNumImpostors(1);
    }

    setTimeSeconds(Math.max(30, n * 30));
    updateConfigControls();
    updateSummaryBar();
}

// ─────────────────────────────────────────────────
// RENDERIZAR LISTA
// ─────────────────────────────────────────────────
export function renderPlayers() {
    const list        = document.getElementById('player-list');
    const placeholder = document.getElementById('player-placeholder');
    if (!list) return;

    if (players.length === 0) {
        list.innerHTML = '';
        if (placeholder) placeholder.style.display = 'flex';
        return;
    }
    if (placeholder) placeholder.style.display = 'none';

    list.innerHTML = players.map((p, i) => `
        <li class="player-item">
            <div class="player-item-name">
                <div class="player-avatar">${getInitials(p)}</div>
                <span>${escapeHtml(p)}</span>
            </div>
            <button class="player-remove-btn" data-index="${i}" aria-label="Eliminar a ${escapeHtml(p)}">✕</button>
        </li>
    `).join('');

    // Event delegation para los botones de eliminar
    list.querySelectorAll('.player-remove-btn').forEach(btn => {
        btn.addEventListener('click', () => removePlayer(parseInt(btn.dataset.index, 10)));
    });
}

// ─────────────────────────────────────────────────
// ENTER en el input
// ─────────────────────────────────────────────────
export function handlePlayerEnter(e) {
    if (e.key === 'Enter') addPlayer();
}

// ─────────────────────────────────────────────────
// BARRA DE RESUMEN (detectives · impostores · tiempo)
// ─────────────────────────────────────────────────
export function updateSummaryBar() {
    const bar = document.getElementById('game-summary-bar');
    if (!bar) return;
    const n = players.length;
    if (n < 3) {
        bar.textContent = 'Agrega al menos 3 jugadores para jugar';
        bar.classList.add('summary-bar--empty');
        return;
    }
    bar.classList.remove('summary-bar--empty');
    const dets = n - numImpostors;
    const mins = Math.floor(timeSeconds / 60);
    const secs = timeSeconds % 60;
    const timeStr = secs === 0 ? `${mins}:00` : `${mins}:${secs.toString().padStart(2,'0')}`;
    bar.innerHTML =
        `<span>${dets} detective${dets !== 1 ? 's' : ''}</span>` +
        `<span class="summary-dot">·</span>` +
        `<span>${numImpostors} impostor${numImpostors !== 1 ? 'es' : ''}</span>` +
        `<span class="summary-dot">·</span>` +
        `<span>${timeStr} min</span>`;
}
