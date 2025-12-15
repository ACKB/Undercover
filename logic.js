let players = []; 
let playedWords = JSON.parse(localStorage.getItem('playedWords')) || [];
let aiBuffer = [];
let currentPlayerIndex = 0;
let impostorIndex = 0;
let currentWord = "";
let currentCategory = ""; 
let isFetching = false;
let timerInterval;
let timeRemaining = 180;

document.addEventListener('DOMContentLoaded', () => {
});

function addPlayer() {
    const input = document.getElementById('new-player');
    const name = input.value.trim();
    if (name && !players.includes(name)) {
        players.push(name);
        renderPlayers();
        input.value = '';
        input.focus();
    } else if (players.includes(name)) {
        alert("Jugador repetido.");
    }
}
function removePlayer(index) { players.splice(index, 1); renderPlayers(); }
function renderPlayers() {
    const list = document.getElementById('player-list');
    list.innerHTML = '';
    players.forEach((p, index) => {
        list.innerHTML += `<li class="player-item"><span>${p}</span><span onclick="removePlayer(${index})" style="cursor:pointer;color:#f43f5e">✕</span></li>`;
    });
}
function handleEnter(e) { if (e.key === 'Enter') addPlayer(); }

function toggleDropdown() {
    document.getElementById('custom-options').classList.toggle('show');
    document.querySelector('.custom-select').classList.toggle('open');
}

function selectOption(value, text) {
    document.getElementById('selected-text').innerText = text;
    toggleDropdown();
    
    const nativeSelect = document.getElementById('game-mode');
    nativeSelect.value = value;
    
    const customInput = document.getElementById('custom-input-container');
    if (value === 'Custom') {
        customInput.classList.remove('hidden');
        document.getElementById('custom-topic').focus();
    } else {
        customInput.classList.add('hidden');
    }
    
    aiBuffer = [];
}

window.addEventListener('click', function(e) {
    if (!document.querySelector('.custom-select-wrapper').contains(e.target)) {
        document.getElementById('custom-options').classList.remove('show');
        document.querySelector('.custom-select').classList.remove('open');
    }
});


async function fetchAIWords(forcedTopic = null) {
    if (isFetching) return;
    isFetching = true;

    let topic = "";
    const mode = document.getElementById('game-mode').value;
    
    if (forcedTopic) {
        topic = forcedTopic;
    } else if (mode === 'Custom') {
        topic = document.getElementById('custom-topic').value.trim();
        if (!topic) { isFetching = false; return; }
    } else {
        topic = mode === "Mix" ? "variado y general" : mode;
    }

    console.log(`🤖 IA: Buscando palabras sobre: ${topic}`);

    const prompt = `Genera un Array JSON de 8 objetos (words).
Contexto: "${topic}".
Instrucción: Dame palabras creativas, no tan obvias pero no imposibles.
Formato: [{"word":"X","category":"${topic}"},...]`;
    const seed = Math.floor(Math.random() * 999999);
    const url = `https://text.pollinations.ai/${encodeURIComponent(prompt)}?model=openai&seed=${seed}`;

    try {
        const res = await fetch(url);
        const text = await res.text();
        const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const json = JSON.parse(clean);
        
        if (Array.isArray(json)) {
            const fresh = json.filter(i => !playedWords.includes(i.word));
            aiBuffer.push(...fresh);
            console.log(`✅ Buffer recargado. Total en cola: ${aiBuffer.length}`);
        }
    } catch (e) {
        console.warn("❌ Error IA:", e);
    }
    isFetching = false;
}

async function startGame() {
    if (players.length < 3) return alert("Mínimo 3 jugadores.");
    
    const mode = document.getElementById('game-mode').value;
    let customTopic = "";

    if (mode === 'Custom') {
        customTopic = document.getElementById('custom-topic').value.trim();
        if (!customTopic) return alert("Por favor escribe un tema personalizado.");
    }

    if (mode === 'Custom' && aiBuffer.length === 0) {
        document.getElementById('loading-overlay').classList.remove('hidden');
        await fetchAIWords(customTopic);
        document.getElementById('loading-overlay').classList.add('hidden');
        
        if (aiBuffer.length === 0) return alert("La IA no pudo generar palabras sobre eso. Intenta otro tema.");
    }

    const data = getWord(mode);
    currentWord = data.word;
    currentCategory = data.category;
    
    if(!playedWords.includes(currentWord)) {
        playedWords.push(currentWord);
        localStorage.setItem('playedWords', JSON.stringify(playedWords));
    }

    if (aiBuffer.length < 4) {
        console.log("⚡ Buffer bajo. Recargando en background...");
        fetchAIWords(mode === 'Custom' ? customTopic : null);
    }

    impostorIndex = Math.floor(Math.random() * players.length);
    currentPlayerIndex = 0;
    
    setupTurn();
    changeScreen('screen-game');
}

function getWord(mode) {
    if (aiBuffer.length > 0) return aiBuffer.shift();

    if (mode !== 'Custom') {
        let pool = [];
        if (mode === "Mix") {
            Object.values(GAME_DATA).forEach(arr => pool.push(...arr));
        } else {
            pool = GAME_DATA[mode] || GAME_DATA["Infantil"];
        }
        const available = pool.filter(w => !playedWords.includes(w));
        const finalPool = available.length > 0 ? available : pool;
        const w = finalPool[Math.floor(Math.random() * finalPool.length)];
        return { word: w, category: mode === "Mix" ? "General" : mode };
    }
    
    return { word: "Error", category: "Reintenta" };
}

function setupTurn() {
    document.getElementById('current-player-name').innerText = players[currentPlayerIndex];
    document.getElementById('btn-confirm').classList.add('hidden');
    
    const content = document.getElementById('secret-content');
    const catTag = document.getElementById('secret-category');
    const subText = document.querySelector('.secret-subtext');
    
    if (currentPlayerIndex === impostorIndex) {
        content.innerHTML = "😈 IMPOSTOR";
        content.classList.add("impostor-style");
        catTag.innerText = "PISTA"; 
        content.style.fontSize = "2rem"; 
        subText.innerText = `El tema es: ${currentCategory}`;
    } else {
        content.innerHTML = currentWord;
        content.classList.remove("impostor-style");
        catTag.innerText = "TU PALABRA";
        content.style.fontSize = "2.2rem";
        subText.innerText = `Categoría: ${currentCategory}`;
    }
    resetDoor();
}

function confirmTurn() {
    currentPlayerIndex++;
    if (currentPlayerIndex >= players.length) {
        showTimerScreen();
    } else {
        setupTurn();
    }
}

const door = document.getElementById('sliding-door');
let startY = 0;
let isDragging = false;
let hasPeeked = false;

door.addEventListener('touchstart', dragStart, {passive: false});
door.addEventListener('touchmove', dragMove, {passive: false});
door.addEventListener('touchend', dragEnd);
door.addEventListener('mousedown', dragStart);
document.addEventListener('mousemove', dragMove);
document.addEventListener('mouseup', dragEnd);

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
        if (delta > 120) hasPeeked = true;
    }
}
function dragEnd() {
    isDragging = false;
    door.classList.remove('dragging');
    door.style.transform = `translateY(0px)`;
    if (hasPeeked) setTimeout(() => document.getElementById('btn-confirm').classList.remove('hidden'), 300);
}
function getClientY(e) { return e.touches ? e.touches[0].clientY : e.clientY; }
function resetDoor() { hasPeeked = false; door.style.transform = `translateY(0px)`; }

const circle = document.querySelector('.progress-ring__circle');
const radius = circle.r.baseVal.value;
const circumference = radius * 2 * Math.PI;
circle.style.strokeDasharray = `${circumference} ${circumference}`;
circle.style.strokeDashoffset = circumference;

function setProgress(percent) {
    const offset = circumference - (percent / 100) * circumference;
    circle.style.strokeDashoffset = offset;
}

function showTimerScreen() {
    changeScreen('screen-timer');
    const starter = players[Math.floor(Math.random() * players.length)];
    document.getElementById('starter-player').innerText = starter;
    resetTimer();
    toggleTimer(); 
}

function toggleTimer() {
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    else {
        timerInterval = setInterval(() => {
            timeRemaining--;
            updateTimerDisplay();
            if (timeRemaining <= 0) clearInterval(timerInterval);
        }, 1000);
    }
}
function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    timeRemaining = 180;
    updateTimerDisplay();
    setProgress(100); 
}
function updateTimerDisplay() {
    const m = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
    const s = (timeRemaining % 60).toString().padStart(2, '0');
    document.getElementById('timer-display').innerText = `${m}:${s}`;
    setProgress((timeRemaining / 180) * 100); 
}

function returnToMenu() { changeScreen('screen-setup'); resetTimer(); }
function changeScreen(id) { document.querySelectorAll('.screen').forEach(s => s.classList.remove('active')); document.getElementById(id).classList.add('active'); }