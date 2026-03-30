/**
 * UNDERCOVER PRO — Lógica del Juego v2.0
 * Soporta múltiples impostores, pistas contextuales y nuevo flujo de pantallas.
 */

// ═══════════════════════════════════════════
// ESTADO GLOBAL
// ═══════════════════════════════════════════
let players          = [];
let numImpostors     = 1;
let timeSeconds      = 90;  // Configurable: por defecto nJugadores × 30s
let impostorIndices  = [];   // Array de índices — soporte para múltiples impostores
let currentPlayerIndex = 0;
let currentWord      = "";
let currentHint      = "";
let currentCategory  = "";
let selectedCategory = "Mix";
let playedWords      = JSON.parse(localStorage.getItem('playedWords')) || [];
let aiBuffer         = [];
let isFetching       = false;

// Timer
let timerInterval;
let timeRemaining    = 180;
let timerRunning     = false;
let timerFinished    = false;

// ═══════════════════════════════════════════
// DEFINICIÓN DE CATEGORÍAS (para el grid)
// ═══════════════════════════════════════════
const CATEGORIES_META = [
    { id: "Mix",          label: "Aleatorio",        emoji: "🎲", color: "#6366f1" },
    { id: "Infantil",     label: "Infantil",          emoji: "🧸", color: "#ec4899" },
    { id: "Peliculas",    label: "Películas",         emoji: "🎬", color: "#f59e0b" },
    { id: "Objetos",      label: "Objetos",           emoji: "💡", color: "#06b6d4" },
    { id: "Lugares",      label: "Lugares",           emoji: "🌍", color: "#10b981" },
    { id: "Adultos",      label: "Adultos (+18)",     emoji: "🔥", color: "#ef4444" },
    { id: "Profesiones",  label: "Profesiones",       emoji: "🧑‍💼", color: "#8b5cf6" },
    { id: "Partes del cuerpo", label: "Cuerpo humano", emoji: "🫀", color: "#f43f5e" },
    { id: "Animales",     label: "Animales",          emoji: "🐾", color: "#84cc16" },
    { id: "Emociones",    label: "Emociones",         emoji: "😤", color: "#a78bfa" },
    { id: "Comida",       label: "Comida",            emoji: "🍕", color: "#fb923c" },
    { id: "Videojuegos",  label: "Videojuegos",       emoji: "🎮", color: "#22d3ee" },
    { id: "Superhéroes",  label: "Superhéroes",       emoji: "🦸", color: "#facc15" },
    { id: "Famosos",      label: "Famosos",           emoji: "🌟", color: "#f472b6" },
    { id: "Paises",       label: "Países",            emoji: "🗺️",  color: "#34d399" },
    { id: "Abstracto",    label: "Abstracto",         emoji: "🌌", color: "#818cf8" },
    { id: "Custom",       label: "Personalizada",     emoji: "✨", color: "#c084fc" },
];

// ═══════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    buildCategoryGrid();
    setupDoorEvents();
    setupTimerRing();
});

// ═══════════════════════════════════════════
// PANTALLA 1: REGISTRO DE JUGADORES
// ═══════════════════════════════════════════

function addPlayer() {
    const input = document.getElementById('new-player');
    const name  = input.value.trim();
    if (!name) return;
    if (players.map(p => p.toLowerCase()).includes(name.toLowerCase())) {
        shakeElement(input);
        return;
    }
    players.push(name);
    renderPlayers();
    // Actualizar defaults de impostores y tiempo al añadir jugador
    const n = players.length;
    numImpostors = Math.min(Math.floor(n / 3), Math.floor(n / 2));
    numImpostors = Math.max(1, numImpostors);
    timeSeconds  = n * 30;
    updateImpostorControls();
    input.value = '';
    input.focus();
}

function removePlayer(index) {
    players.splice(index, 1);
    // Recalcular defaults
    const n  = players.length;
    const maxImp = Math.max(1, Math.floor(n / 2));
    if (numImpostors > maxImp) numImpostors = maxImp;
    timeSeconds = Math.max(30, n * 30);
    renderPlayers();
    updateImpostorControls();
}

function renderPlayers() {
    const list        = document.getElementById('player-list');
    const placeholder = document.getElementById('player-placeholder');

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
            <button class="player-remove-btn" onclick="removePlayer(${i})" aria-label="Eliminar a ${escapeHtml(p)}">✕</button>
        </li>
    `).join('');
}

function getInitials(name) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function handlePlayerEnter(e) {
    if (e.key === 'Enter') addPlayer();
}

// --- Stepper de impostores ---
function updateImpostorControls() {
    const impWrapper  = document.getElementById('impostor-selector-wrapper');
    const timeWrapper = document.getElementById('time-selector-wrapper');
    const impHint     = document.getElementById('impostor-hint');
    const timeHint    = document.getElementById('time-hint');
    const minus       = document.getElementById('btn-minus-impostor');
    const plus        = document.getElementById('btn-plus-impostor');
    const minusTime   = document.getElementById('btn-minus-time');
    const plusTime    = document.getElementById('btn-plus-time');
    const plural      = document.getElementById('impostor-plural');
    const countEl     = document.getElementById('impostor-count');
    const timeEl      = document.getElementById('time-minutes');

    const n      = players.length;
    const enough = n >= 3;
    impWrapper?.classList.toggle('active', enough);
    timeWrapper?.classList.toggle('active', enough);

    if (!enough) return;

    // --- Impostores: default = floor(n/3), max = floor(n/2) ---
    const defaultImp = Math.floor(n / 3);
    const maxImp     = Math.max(1, Math.floor(n / 2));

    // Sólo aplicar el default si el jugador no lo ha tocado manualmente
    // (detectamos esto comparando si el valor actual sigue siendo coherente con
    //  el default del tamaño anterior; la forma más simple es re-aplicarlo cada
    //  vez que cambia el número de jugadores — el stepper ya lo guarda en numImpostors)
    if (numImpostors > maxImp) numImpostors = maxImp;
    if (numImpostors < 1)      numImpostors = 1;

    countEl.textContent  = numImpostors;
    plural.textContent   = numImpostors > 1 ? 'es' : '';
    minus.disabled       = numImpostors <= 1;
    plus.disabled        = numImpostors >= maxImp;

    const detectives = n - numImpostors;
    impHint.textContent = `${detectives} detective${detectives !== 1 ? 's' : ''} vs ${numImpostors} impostor${numImpostors !== 1 ? 'es' : ''}`;

    // --- Tiempo: default = n×30 seg, incrementos de 30s ---
    if (timeSeconds < 30) timeSeconds = 30;
    timeEl.textContent  = formatSeconds(timeSeconds);
    minusTime.disabled  = timeSeconds <= 30;
    plusTime.disabled   = timeSeconds >= 3600;
    timeHint.textContent = `${timeSeconds} segundos de discusión`;
}

function changeImpostors(delta) {
    const max = Math.max(1, Math.floor(players.length / 2));
    numImpostors = Math.min(max, Math.max(1, numImpostors + delta));
    updateImpostorControls();
}

function changeTime(delta) {
    timeSeconds = Math.max(30, Math.min(3600, timeSeconds + delta * 30));
    updateImpostorControls();
}

// --- Navegación a categoría ---
function goToCategory() {
    if (players.length < 3) {
        alert('Necesitas al menos 3 jugadores para empezar.');
        return;
    }
    changeScreen('screen-category');
}

// ═══════════════════════════════════════════
// PANTALLA 2: GRID DE CATEGORÍAS
// ═══════════════════════════════════════════

function buildCategoryGrid() {
    const grid = document.getElementById('category-grid');
    if (!grid) return;

    grid.innerHTML = CATEGORIES_META.map(cat => `
        <div class="category-card ${cat.id === 'Mix' ? 'selected' : ''}"
             id="cat-card-${cat.id}"
             style="--card-color: ${cat.color}"
             onclick="${cat.id === 'Custom' ? `selectCategory('${cat.id}')` : `selectAndStart('${cat.id}')`}"
             role="button"
             tabindex="0"
             aria-label="Categoría: ${cat.label}"
             onkeypress="if(event.key==='Enter') ${cat.id === 'Custom' ? `selectCategory('${cat.id}')` : `selectAndStart('${cat.id}')`}">
            <div class="card-check">✓</div>
            <div class="category-emoji">${cat.emoji}</div>
            <div class="category-name">${cat.label}</div>
        </div>
    `).join('');

    // Campo custom - si se selecciona "Personalizada"
    const customContainer = document.createElement('div');
    customContainer.id = 'custom-input-container';
    customContainer.className = 'hidden';
    customContainer.style.cssText = 'grid-column: 1 / -1; margin-top: 4px;';
    customContainer.innerHTML = `
        <input type="text" id="custom-topic" placeholder="Escribe el tema (ej. Medicina, Anime...)" autocomplete="off">
    `;
    grid.after(customContainer);
}

function selectCategory(catId) {
    document.querySelectorAll('.category-card').forEach(c => c.classList.remove('selected'));
    const card = document.getElementById(`cat-card-${catId}`);
    if (card) card.classList.add('selected');
    selectedCategory = catId;

    const customContainer = document.getElementById('custom-input-container');
    const startBtn        = document.getElementById('btn-start-game');
    const isCustom        = catId === 'Custom';

    if (customContainer) {
        customContainer.classList.toggle('hidden', !isCustom);
        if (isCustom) setTimeout(() => document.getElementById('custom-topic')?.focus(), 100);
    }
    // El botón "Empezar" solo aparece para Custom (el resto entra automáticamente)
    if (startBtn) startBtn.classList.toggle('hidden', !isCustom);

    aiBuffer = [];
}

// Selecciona la categoría y entra al juego inmediatamente (categorías no-custom)
async function selectAndStart(catId) {
    selectCategory(catId);
    await startGame();
}

function goBack(screenId) {
    changeScreen(screenId);
}

// ═══════════════════════════════════════════
// INICIO DE PARTIDA
// ═══════════════════════════════════════════

async function startGame() {
    if (players.length < 3) {
        alert('Necesitas al menos 3 jugadores.');
        changeScreen('screen-register');
        return;
    }

    let customTopic = "";
    if (selectedCategory === 'Custom') {
        customTopic = document.getElementById('custom-topic')?.value.trim() || '';
        if (!customTopic) {
            alert('Por favor escribe un tema personalizado.');
            return;
        }
    }

    // Cargar palabras de IA si se necesita
    if (selectedCategory === 'Custom' && aiBuffer.length === 0) {
        document.getElementById('loading-overlay').classList.remove('hidden');
        await fetchAIWords(customTopic);
        document.getElementById('loading-overlay').classList.add('hidden');
        if (aiBuffer.length === 0) {
            alert('La IA no pudo generar palabras. Intenta otro tema.');
            return;
        }
    }

    // Obtener palabra y pista
    const data = getWordData(selectedCategory, customTopic);
    currentWord     = data.word;
    currentHint     = data.hint;
    currentCategory = data.category;

    // Guardar en historial
    if (!playedWords.includes(currentWord)) {
        playedWords.push(currentWord);
        localStorage.setItem('playedWords', JSON.stringify(playedWords));
    }

    // Recargar buffer en background si queda poco
    if (selectedCategory === 'Custom' && aiBuffer.length < 4) {
        fetchAIWords(customTopic);
    }

    // Asignar impostores aleatoriamente
    impostorIndices = assignImpostors(players.length, numImpostors);
    currentPlayerIndex = 0;

    setupGameTurn();
    changeScreen('screen-game');
}

/**
 * Selecciona N índices aleatorios únicos de entre [0, playerCount)
 */
function assignImpostors(playerCount, n) {
    const indices = [...Array(playerCount).keys()];
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices.slice(0, n);
}

// ═══════════════════════════════════════════
// OBTENER PALABRA DEL BANCO
// ═══════════════════════════════════════════

function getWordData(mode, customTopic = '') {
    // Priorizar buffer de IA (para categoría Custom y si tiene datos)
    if (aiBuffer.length > 0) {
        const item = aiBuffer.shift();
        return {
            word: item.word,
            hint: `Está relacionado con: ${customTopic || mode}`,
            category: customTopic || mode
        };
    }

    if (mode === 'Custom') {
        return { word: "Sin palabras", hint: "Reintenta", category: customTopic };
    }

    // Construir pool
    let pool = [];
    if (mode === 'Mix') {
        // Excluir Custom del mix
        Object.keys(GAME_DATA).forEach(key => pool.push(...GAME_DATA[key]));
    } else {
        pool = GAME_DATA[mode] || GAME_DATA['Infantil'];
    }

    // Filtrar palabras ya jugadas
    const available = pool.filter(item => !playedWords.includes(item.word));
    const finalPool = available.length > 0 ? available : pool;
    const entry = finalPool[Math.floor(Math.random() * finalPool.length)];

    return {
        word:     entry.word,
        hint:     entry.hint,
        category: mode === 'Mix' ? 'Aleatorio' : mode
    };
}

// ═══════════════════════════════════════════
// TURNO DE LA PUERTA
// ═══════════════════════════════════════════

function setupGameTurn() {
    const isImpostor = impostorIndices.includes(currentPlayerIndex);

    document.getElementById('current-player-name').textContent = players[currentPlayerIndex];
    document.getElementById('btn-confirm').classList.add('hidden');

    const content = document.getElementById('secret-content');
    const catTag  = document.getElementById('secret-category');
    const subtext = document.getElementById('secret-subtext');

    if (isImpostor) {
        catTag.textContent = '🎭 IMPOSTOR — TU PISTA';
        content.className  = 'secret-word impostor-hint-style';
        content.textContent = currentHint;
        subtext.textContent = 'Memoriza la pista. No conoces la palabra exacta.';
    } else {
        catTag.textContent = `📂 ${currentCategory}`;
        content.className  = 'secret-word';
        content.textContent = currentWord;
        subtext.textContent = 'Memoriza tu palabra y cierra la puerta.';
    }

    resetDoor();
}

function confirmTurn() {
    currentPlayerIndex++;
    if (currentPlayerIndex >= players.length) {
        showTimerScreen();
    } else {
        setupGameTurn();
    }
}

// ═══════════════════════════════════════════
// MECÁNICA DE LA PUERTA
// ═══════════════════════════════════════════

let door;
let startY    = 0;
let isDragging = false;
let hasPeeked  = false;

function setupDoorEvents() {
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

// ═══════════════════════════════════════════
// PANTALLA TEMPORIZADOR
// ═══════════════════════════════════════════

let timerCircle;
let timerCircumference;

function setupTimerRing() {
    timerCircle = document.getElementById('timer-ring');
    if (!timerCircle) return;
    const radius = timerCircle.r.baseVal.value;
    timerCircumference = radius * 2 * Math.PI;
    timerCircle.style.strokeDasharray  = `${timerCircumference} ${timerCircumference}`;
    timerCircle.style.strokeDashoffset = 0;
}

function showTimerScreen() {
    changeScreen('screen-timer');
    const starterIndex = Math.floor(Math.random() * players.length);
    document.getElementById('starter-player').textContent = players[starterIndex];
    // Actualizar label del botón revelar
    const span = document.querySelector('#btn-reveal span:last-child');
    if (span) {
        span.textContent = numImpostors > 1
            ? `REVELAR A LOS ${numImpostors} IMPOSTORES`
            : 'REVELAR AL IMPOSTOR';
    }
    timerFinished = false;
    timeRemaining = timeSeconds;  // Usar los segundos configurados
    resetTimer(false);
    toggleTimer(); // Empieza automáticamente
}

function toggleTimer() {
    if (timerRunning) {
        clearInterval(timerInterval);
        timerRunning = false;
        // Cambiar icono a play
        document.getElementById('play-icon')?.style.setProperty('display', 'block');
        document.getElementById('pause-icon')?.style.setProperty('display', 'none');
    } else {
        if (timerFinished) return;
        timerRunning = true;
        // Cambiar icono a pause
        document.getElementById('play-icon')?.style.setProperty('display', 'none');
        document.getElementById('pause-icon')?.style.setProperty('display', 'block');

        timerInterval = setInterval(() => {
            timeRemaining--;
            updateTimerDisplay();
            if (timeRemaining <= 0) {
                clearInterval(timerInterval);
                timerRunning  = false;
                timerFinished = true;
                onTimerEnd();
            }
        }, 1000);
    }
}

function resetTimer(resetTime = true) {
    clearInterval(timerInterval);
    timerRunning  = false;
    timerFinished = false;
    if (resetTime) timeRemaining = timeSeconds;

    // Icono a play
    document.getElementById('play-icon')?.style.setProperty('display', 'block');
    document.getElementById('pause-icon')?.style.setProperty('display', 'none');

    updateTimerDisplay();
}

function updateTimerDisplay() {
    const m = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
    const s = (timeRemaining % 60).toString().padStart(2, '0');
    const display = document.getElementById('timer-display');
    const label   = document.getElementById('timer-label');

    display.textContent = `${m}:${s}`;

    // Colores de urgencia
    display.classList.remove('time-warning', 'time-danger', 'time-done');
    if (timeRemaining <= 0) {
        display.classList.add('time-done');
        if (label) label.textContent = '¡tiempo!';
    } else if (timeRemaining <= 30) {
        display.classList.add('time-danger');
        if (label) label.textContent = '¡apúrense!';
    } else if (timeRemaining <= 60) {
        display.classList.add('time-warning');
        if (label) label.textContent = 'poco tiempo';
    } else {
        if (label) label.textContent = 'discutiendo';
    }

    // Anillo de progreso
    setTimerProgress(timeRemaining / timeSeconds);
}

function setTimerProgress(fraction) {
    if (!timerCircle) return;
    const offset = timerCircumference * (1 - Math.max(0, fraction));
    timerCircle.style.strokeDashoffset = offset;

    // Color del anillo según urgencia
    const grad = document.getElementById('timerGrad');
    if (!grad) return;
    if (fraction <= 0) {
        timerCircle.setAttribute('stroke', '#f43f5e');
    } else if (fraction <= 0.17) { // <30s
        timerCircle.setAttribute('stroke', '#f43f5e');
    } else if (fraction <= 0.33) { // <60s
        timerCircle.setAttribute('stroke', '#f59e0b');
    } else {
        timerCircle.setAttribute('stroke', 'url(#timerGrad)');
    }
}

function onTimerEnd() {
    // El botón ya está siempre visible; solo actualizar el color/estado si se desea
    const display = document.getElementById('timer-display');
    display?.classList.add('time-done');
}

// ═══════════════════════════════════════════
// MODAL DE VEREDICTO
// ═══════════════════════════════════════════

function openRevealModal() {
    const modal = document.getElementById('reveal-modal');
    const list  = document.getElementById('modal-impostors-list');
    const wordReveal = document.getElementById('modal-word-reveal');
    const title      = document.getElementById('modal-title');

    // Título según cantidad
    title.textContent = numImpostors > 1 ? '¡Se revelan los impostores!' : '¡Se revela el impostor!';

    // Lista de impostores con delay escalonado
    list.innerHTML = impostorIndices.map((idx, i) => `
        <div class="modal-impostor-item" style="animation-delay: ${i * 0.12}s">
            <span class="modal-impostor-icon">😈</span>
            <div>
                <div class="modal-impostor-name">${escapeHtml(players[idx])}</div>
                <div class="modal-impostor-sub">Era el impostor</div>
            </div>
        </div>
    `).join('');

    // Mostrar la palabra
    wordReveal.innerHTML = `La palabra era: <strong>${escapeHtml(currentWord)}</strong>`;

    modal.classList.remove('hidden');
}

function closeRevealModal() {
    document.getElementById('reveal-modal').classList.add('hidden');
}

// ═══════════════════════════════════════════
// IA — PALABRAS PERSONALIZADAS
// ═══════════════════════════════════════════

async function fetchAIWords(topic) {
    if (isFetching) return;
    isFetching = true;

    const prompt = `Genera un Array JSON de 8 objetos. Contexto: "${topic}". Formato: [{"word":"X","category":"${topic}"},...]`;
    const seed   = Math.floor(Math.random() * 999999);
    const url    = `https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=openai&seed=${seed}`;

    try {
        const res   = await fetch(url);
        const text  = await res.text();
        const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const json  = JSON.parse(clean);
        if (Array.isArray(json)) {
            const fresh = json.filter(i => !playedWords.includes(i.word));
            aiBuffer.push(...fresh);
        }
    } catch (e) {
        console.warn('IA fetch error:', e);
    }
    isFetching = false;
}

// ═══════════════════════════════════════════
// NAVEGACIÓN
// ═══════════════════════════════════════════

function returnToMenu() {
    closeRevealModal();
    resetTimer();
    changeScreen('screen-register');
}

// Reinicia la partida con los mismos jugadores y la misma categoría
async function restartSameCategory() {
    closeRevealModal();
    resetTimer(false);
    await startGame();
}

function changeScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id)?.classList.add('active');
}

// ═══════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════

function formatSeconds(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return s === 0 ? `${m}:00` : `${m}:${s.toString().padStart(2, '0')}`;
}

function shakeElement(el) {
    el.style.animation = 'none';
    el.offsetHeight; // reflow
    el.style.animation = 'shake 0.4s ease';
    setTimeout(() => el.style.animation = '', 400);
}