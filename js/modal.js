/**
 * UNDERCOVER — modal.js
 * Modal de veredicto (revelar impostores) + acciones post-partida.
 */

import {
    players, impostorIndices, numImpostors, currentWord,
} from './config.js';
import { changeScreen, escapeHtml } from './ui.js';
import { resetTimer } from './timer.js';
import { startGame } from './game.js';
import { goToCategory } from './categories.js';

// ─────────────────────────────────────────────────
// ABRIR MODAL
// ─────────────────────────────────────────────────
export function openRevealModal() {
    const modal      = document.getElementById('reveal-modal');
    const list       = document.getElementById('modal-impostors-list');
    const wordReveal = document.getElementById('modal-word-reveal');
    const title      = document.getElementById('modal-title');

    if (!modal) return;

    title.textContent = numImpostors > 1 ? '¡Se revelan los impostores!' : '¡Se revela el impostor!';

    list.innerHTML = impostorIndices.map((idx, i) => `
        <div class="modal-impostor-item" style="animation-delay: ${i * 0.12}s">
            <span class="modal-impostor-icon">😈</span>
            <div>
                <div class="modal-impostor-name">${escapeHtml(players[idx])}</div>
                <div class="modal-impostor-sub">Era el impostor</div>
            </div>
        </div>
    `).join('');

    wordReveal.innerHTML = `La palabra era: <strong>${escapeHtml(currentWord)}</strong>`;
    modal.classList.remove('hidden');
}

// ─────────────────────────────────────────────────
// CERRAR MODAL
// ─────────────────────────────────────────────────
export function closeRevealModal() {
    document.getElementById('reveal-modal')?.classList.add('hidden');
}

// ─────────────────────────────────────────────────
// ACCIONES
// ─────────────────────────────────────────────────
export function returnToMenu() {
    closeRevealModal();
    resetTimer();
    changeScreen('screen-register');
}

export async function restartSameCategory() {
    closeRevealModal();
    resetTimer(false);
    await startGame();
}

export function changeCategoryAction() {
    closeRevealModal();
    resetTimer();
    goToCategory();
}
