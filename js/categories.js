/**
 * UNDERCOVER — categories.js
 * Grid de categorías: construcción, selección e inicio de partida.
 */

import {
    CATEGORIES_META,
    selectedCategory, setSelectedCategory,
    clearAiBuffer,
    geminiApiKey, aiBuffer,
} from './config.js';
import { changeScreen, showToast } from './ui.js';
import { startGame } from './game.js';
import { hasApiKey } from './ai.js';

// ─────────────────────────────────────────────────
// CONSTRUIR EL GRID
// ─────────────────────────────────────────────────
export function buildCategoryGrid() {
    const grid = document.getElementById('category-grid');
    if (!grid) return;

    grid.innerHTML = CATEGORIES_META.map(cat => `
        <div class="category-card ${cat.id === 'Mix' ? 'selected' : ''}"
             id="cat-card-${cat.id}"
             style="--card-color: ${cat.color}"
             role="button"
             tabindex="0"
             aria-label="Categoría: ${cat.label}">
            <div class="card-check">✓</div>
            <div class="category-emoji">${cat.emoji}</div>
            <div class="category-name">${cat.label}</div>
        </div>
    `).join('');

    // Event listeners por delegación
    grid.addEventListener('click', e => {
        const card = e.target.closest('.category-card');
        if (!card) return;
        const catId = card.id.replace('cat-card-', '');
        if (catId === 'Custom') {
            selectCategory('Custom');
        } else {
            selectAndStart(catId);
        }
    });

    grid.addEventListener('keypress', e => {
        if (e.key !== 'Enter') return;
        const card = e.target.closest('.category-card');
        if (!card) return;
        const catId = card.id.replace('cat-card-', '');
        if (catId === 'Custom') selectCategory('Custom');
        else selectAndStart(catId);
    });
}

// ─────────────────────────────────────────────────
// SELECCIONAR CATEGORÍA
// ─────────────────────────────────────────────────
export function selectCategory(catId) {
    document.querySelectorAll('.category-card').forEach(c => c.classList.remove('selected'));
    const card = document.getElementById(`cat-card-${catId}`);
    if (card) card.classList.add('selected');
    setSelectedCategory(catId);

    const customContainer = document.getElementById('custom-input-container');
    const startBtn        = document.getElementById('btn-start-game'); // Still used?
    const isCustom        = catId === 'Custom';

    if (customContainer) {
        customContainer.classList.toggle('hidden', !isCustom);
        if (isCustom) setTimeout(() => document.getElementById('custom-topic')?.focus(), 100);
    }
    
    // startBtn is now inside customContainer and handled by its hidden state, 
    // or we can toggle it individually if it's outside. But we moved it inside.
    // If we want we can still toggle it or omit this, but it doesn't hurt.
    if (startBtn && startBtn.parentElement.id !== 'custom-input-container') {
        startBtn.classList.toggle('hidden', !isCustom);
    }

    // Actualizar hint debajo del input custom
    if (isCustom) {
        const hint = document.getElementById('custom-topic-hint');
        if (hint) {
            hint.textContent = hasApiKey()
                ? ''
                : '⚠️ Sin API Key de Gemini — configúrala en ⚙️ Ajustes';
            hint.style.color = hasApiKey() ? 'var(--success)' : 'var(--warning)';
        }
    }

    clearAiBuffer();
}

// ─────────────────────────────────────────────────
// SELECCIONAR + INICIAR (categorías normales)
// ─────────────────────────────────────────────────
export async function selectAndStart(catId) {
    selectCategory(catId);
    await startGame();
}

// ─────────────────────────────────────────────────
// IR A PANTALLA DE CATEGORÍA
// ─────────────────────────────────────────────────
export function goToCategory() {
    changeScreen('screen-category');
    // Asegurarse de que el grid esté construido
    const grid = document.getElementById('category-grid');
    if (!grid || grid.children.length === 0) buildCategoryGrid();
}
