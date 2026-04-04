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
    selectedCategory, aiBuffer, shiftAiBuffer, pushAiBuffer, clearAiBuffer,
    impostorIndices, setImpostorIndices,
    currentPlayerIndex, setCurrentPlayerIndex,
    currentWord, setCurrentWord,
    currentHint,  setCurrentHint,
    currentHint2, setCurrentHint2,
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

        // Si el tema cambió respecto a la partida anterior, vaciamos el buffer
        if (currentCategory !== customTopic) {
            clearAiBuffer();
        }
    } else {
        // Para categorías estándar, el topic es la propia categoría
        customTopic = selectedCategory;
        if (currentCategory !== customTopic) {
            clearAiBuffer();
        }
    }

    // Cargar palabras de IA si es CUSTOM y está vacío (bloqueante, porque no hay base de datos)
    if (selectedCategory === 'Custom' && aiBuffer.length === 0) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.classList.remove('hidden');

        const ok = await fetchAIWords(customTopic);

        if (overlay) overlay.classList.add('hidden');

        if (!ok || aiBuffer.length === 0) {
            showToast('Gemini no pudo generar palabras. Cuota agotada o API Key inválida — revisa tu key en ⚙️ Ajustes.', 'error');
            return;
        }
    }

    // Obtener palabra y pista
    const data = getWordData(selectedCategory, customTopic);
    setCurrentWord(data.word);
    setCurrentHint(data.hint1);
    setCurrentHint2(data.hint2);
    setCurrentCategory(data.category);

    addPlayedWord(data.word);

    // ZERO-WAIT HÍBRIDO: Recargar buffer en background si queda poco
    // Aplica para temas "Custom" y "Estándar", pero evitamos en "Mix"
    if (selectedCategory !== 'Mix' && aiBuffer.length < 3 && hasApiKey()) {
        const dbWords = (typeof GAME_DATA !== 'undefined' && GAME_DATA[selectedCategory]) 
            ? GAME_DATA[selectedCategory].map(i => i.word) 
            : [];
        const exclude = [...playedWords, ...dbWords];
        fetchAIWords(customTopic, exclude); // fire & forget
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
    // Si hay palabras en el buffer de IA, se usan SIEMPRE para este tema (excepto si es Mix)
    if (mode !== 'Mix' && aiBuffer.length > 0) {
        const item = shiftAiBuffer();
        const catName = mode === 'Custom' ? customTopic : mode;
        return {
            word:  item.word,
            hint1: item.hint1 || `Relacionado con: ${catName}`,
            hint2: item.hint2 || `Relacionado con: ${catName}`,
            category: catName,
        };
    }

    if (mode === 'Custom') {
        return { word: 'Sin palabras', hint1: 'Reintenta', hint2: 'Reintenta', category: customTopic };
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
        hint1:    entry.hint1 || '',
        hint2:    entry.hint2 || '',
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
 * Fácil   → hint1: pista descriptiva completa
 * Normal  → hint2: palabra clave directa del objeto de la BD
 * Difícil → texto vacío (solo sabe que es impostor)
 */
function getImpostorContent(hint1, hint2, diff) {
    switch (diff) {
        case 'easy':
            return { text: hint1, style: 'hint-easy' };

        case 'normal':
            return { text: hint2, style: 'hint-normal' };

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
        const { text, style } = getImpostorContent(currentHint, currentHint2, difficulty);

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
