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

    // Campo de texto para categoría personalizada
    const customContainer = document.createElement('div');
    customContainer.id = 'custom-input-container';
    customContainer.className = 'hidden';
    customContainer.style.cssText = 'grid-column: 1 / -1; margin-top: 4px;';
    customContainer.innerHTML = `
        <input type="text" id="custom-topic" placeholder="Escribe el tema (ej. Medicina, Anime...)" autocomplete="off">
        <p class="custom-topic-hint" id="custom-topic-hint"></p>
    `;
    grid.after(customContainer);

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
    const startBtn        = document.getElementById('btn-start-game');
    const isCustom        = catId === 'Custom';

    if (customContainer) {
        customContainer.classList.toggle('hidden', !isCustom);
        if (isCustom) setTimeout(() => document.getElementById('custom-topic')?.focus(), 100);
    }
    if (startBtn) startBtn.classList.toggle('hidden', !isCustom);

    // Actualizar hint debajo del input custom
    if (isCustom) {
        const hint = document.getElementById('custom-topic-hint');
        if (hint) {
            hint.textContent = hasApiKey()
                ? '✨ Se usará Gemini AI para generar las palabras'
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
