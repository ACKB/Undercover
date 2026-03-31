/**
 * UNDERCOVER — game.js
 * Lógica central de la partida:
 *   - Asignar impostores aleatoriamente
 *   - Turnos de la puerta
 *   - Obtener palabra y pista según categoría y dificultad
 *   - Mecánica de arrastrar la puerta (touch + mouse)
 */

import {
    players, numImpostors, timeSeconds, difficulty,
    selectedCategory, aiBuffer, shiftAiBuffer, pushAiBuffer,
    impostorIndices, setImpostorIndices,
    currentPlayerIndex, setCurrentPlayerIndex,
    currentWord, setCurrentWord,
    currentHint, setCurrentHint,
    currentCategory, setCurrentCategory,
    addPlayedWord, playedWords, isFetching,
    geminiApiKey,
} from './config.js';
import { changeScreen, showToast, escapeHtml } from './ui.js';
import { fetchAIWords, hasApiKey } from './ai.js';
import { showTimerScreen } from './timer.js';

// ─────────────────────────────────────────────────
// INICIO DE PARTIDA
// ─────────────────────────────────────────────────
export async function startGame() {
    if (players.length < 3) {
        showToast('Necesitas al menos 3 jugadores.', 'error');
        changeScreen('screen-register');
        return;
    }

    let customTopic = '';
    if (selectedCategory === 'Custom') {
        customTopic = document.getElementById('custom-topic')?.value.trim() || '';
        if (!customTopic) {
            showToast('Escribe un tema personalizado.', 'error');
            return;
        }
        if (!hasApiKey()) {
            showToast('Configura tu API Key de Gemini en ⚙️ Ajustes.', 'error');
            return;
        }
    }

    // Cargar palabras de IA si se necesitan
    if (selectedCategory === 'Custom' && aiBuffer.length === 0) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.classList.remove('hidden');

        const ok = await fetchAIWords(customTopic);

        if (overlay) overlay.classList.add('hidden');

        if (!ok || aiBuffer.length === 0) {
            showToast('Gemini no pudo generar palabras. Revisa tu API Key o intenta otro tema.', 'error');
            return;
        }
    }

    // Obtener palabra y pista
    const data = getWordData(selectedCategory, customTopic);
    setCurrentWord(data.word);
    setCurrentHint(data.hint);
    setCurrentCategory(data.category);

    addPlayedWord(data.word);

    // Recargar buffer en background si queda poco
    if (selectedCategory === 'Custom' && aiBuffer.length < 3 && hasApiKey()) {
        fetchAIWords(customTopic); // fire & forget
    }

    // Asignar impostores
    setImpostorIndices(assignImpostors(players.length, numImpostors));
    setCurrentPlayerIndex(0);

    setupGameTurn();
    changeScreen('screen-game');
}

// ─────────────────────────────────────────────────
// OBTENER PALABRA DEL BANCO
// ─────────────────────────────────────────────────
function getWordData(mode, customTopic = '') {
    if (mode === 'Custom' && aiBuffer.length > 0) {
        const item = shiftAiBuffer();
        return {
            word:     item.word,
            hint:     item.hint || `Relacionado con: ${customTopic}`,
            category: customTopic,
        };
    }

    if (mode === 'Custom') {
        return { word: 'Sin palabras', hint: 'Reintenta', category: customTopic };
    }

    // Construir pool de palabras
    let pool = [];
    if (mode === 'Mix') {
        Object.values(GAME_DATA).forEach(arr => pool.push(...arr));
    } else {
        pool = GAME_DATA[mode] || GAME_DATA['Infantil'];
    }

    const available = pool.filter(item => !playedWords.includes(item.word));
    const finalPool = available.length > 0 ? available : pool;
    const entry     = finalPool[Math.floor(Math.random() * finalPool.length)];

    return {
        word:     entry.word,
        hint:     entry.hint,
        category: mode === 'Mix' ? 'Aleatorio' : mode,
    };
}

// ─────────────────────────────────────────────────
// ASIGNAR IMPOSTORES (Fisher-Yates)
// ─────────────────────────────────────────────────
function assignImpostors(playerCount, n) {
    const indices = [...Array(playerCount).keys()];
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices.slice(0, n);
}

// ─────────────────────────────────────────────────
// LÓGICA DE DIFICULTAD — PISTA PARA EL IMPOSTOR
// ─────────────────────────────────────────────────
/**
 * Retorna el texto que ve el impostor según el modo de dificultad.
 * Fácil   → pista completa
 * Normal  → 1 palabra clave extraída algorítmicamente
 * Difícil → texto vacío (solo sabe que es impostor)
 */
function getImpostorContent(hint, diff) {
    switch (diff) {
        case 'easy':
            return { text: hint, style: 'hint-easy' };

        case 'normal': {
            // Extraer la palabra más significativa de la pista (sin artículos ni preposiciones)
            const stopWords = new Set([
                'el','la','los','las','un','una','unos','unas',
                'de','del','al','en','con','por','para','sin',
                'que','se','su','sus','lo','le','les','hay',
                'es','son','no','si','ya','pero','más','y','o',
            ]);
            const words = hint.match(/\b[a-záéíóúüñA-ZÁÉÍÓÚÜÑ]{4,}\b/g) || [];
            const keyword = words.find(w => !stopWords.has(w.toLowerCase())) || words[0] || hint.split(' ')[0];
            return { text: keyword, style: 'hint-normal' };
        }

        case 'hard':
        default:
            return { text: '', style: 'hint-hard' };
    }
}

// ─────────────────────────────────────────────────
// TURNO DE LA PUERTA
// ─────────────────────────────────────────────────
export function setupGameTurn() {
    const isImpostor = impostorIndices.includes(currentPlayerIndex);

    document.getElementById('current-player-name').textContent = players[currentPlayerIndex];
    document.getElementById('btn-confirm')?.classList.add('hidden');

    const content = document.getElementById('secret-content');
    const catTag  = document.getElementById('secret-category');
    const subtext = document.getElementById('secret-subtext');

    if (isImpostor) {
        const { text, style } = getImpostorContent(currentHint, difficulty);

        catTag.textContent = '🎭 IMPOSTOR';
        content.className  = `secret-word ${style}`;

        if (difficulty === 'hard' || !text) {
            content.innerHTML = `<span class="impostor-no-hint">🤫<br><span class="impostor-no-hint-label">Solo tú lo sabes</span></span>`;
            subtext.textContent = 'Eres el impostor. No tienes ninguna pista. ¡Actúa bien!';
        } else if (difficulty === 'normal') {
            content.innerHTML = `<span class="impostor-keyword">${escapeHtml(text)}</span>`;
            subtext.textContent = 'Eres el impostor. Esta es tu única pista.';
        } else {
            // easy
            content.textContent = text;
            subtext.textContent = 'Eres el impostor. Memoriza la pista. No conoces la palabra exacta.';
        }
    } else {
        catTag.textContent  = `📂 ${currentCategory}`;
        content.className   = 'secret-word';
        content.textContent = currentWord;
        subtext.textContent = 'Memoriza tu palabra y cierra la puerta.';
    }

    resetDoor();
}

export function confirmTurn() {
    setCurrentPlayerIndex(currentPlayerIndex + 1);
    if (currentPlayerIndex >= players.length) {
        showTimerScreen();
    } else {
        setupGameTurn();
    }
}

// ─────────────────────────────────────────────────
// MECÁNICA DE LA PUERTA
// ─────────────────────────────────────────────────
let door;
let startY     = 0;
let isDragging = false;
let hasPeeked  = false;

export function setupDoorEvents() {
    door = document.getElementById('sliding-door');
    if (!door) return;

    door.addEventListener('touchstart', dragStart, { passive: false });
    door.addEventListener('touchmove',  dragMove,  { passive: false });
    door.addEventListener('touchend',   dragEnd);
    door.addEventListener('mousedown',  dragStart);
    document.addEventListener('mousemove', dragMove);
    document.addEventListener('mouseup',   dragEnd);
}

function dragStart(e) {
    if (e.type === 'mousedown' && e.button !== 0) return;
    isDragging = true;
    startY = getClientY(e);
    door.classList.add('dragging');
}

function dragMove(e) {
    if (!isDragging) return;
    e.preventDefault();
    const delta = startY - getClientY(e);
    if (delta > 0) {
        door.style.transform = `translateY(${-delta}px)`;
        if (delta > 100) hasPeeked = true;
    }
}

function dragEnd() {
    if (!isDragging) return;
    isDragging = false;
    door.classList.remove('dragging');
    door.style.transform = 'translateY(0)';
    if (hasPeeked) {
        setTimeout(() => {
            document.getElementById('btn-confirm')?.classList.remove('hidden');
        }, 350);
    }
}

function getClientY(e) {
    return e.touches ? e.touches[0].clientY : e.clientY;
}

function resetDoor() {
    hasPeeked = false;
    if (door) door.style.transform = 'translateY(0)';
}
