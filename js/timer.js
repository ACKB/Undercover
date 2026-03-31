/**
 * UNDERCOVER — timer.js
 * Temporizador de discusión: anillo SVG, pausa/reanuda, reset.
 */

import {
    players, timeSeconds,
    numImpostors,
} from './config.js';
import { changeScreen } from './ui.js';

// ─────────────────────────────────────────────────
// ESTADO INTERNO DEL TIMER
// ─────────────────────────────────────────────────
let timerInterval;
let timeRemaining = 180;
let timerRunning  = false;
let timerFinished = false;

let timerCircle;
let timerCircumference;

// ─────────────────────────────────────────────────
// INICIALIZAR EL ANILLO SVG
// ─────────────────────────────────────────────────
export function setupTimerRing() {
    timerCircle = document.getElementById('timer-ring');
    if (!timerCircle) return;
    const radius       = timerCircle.r.baseVal.value;
    timerCircumference = radius * 2 * Math.PI;
    timerCircle.style.strokeDasharray  = `${timerCircumference} ${timerCircumference}`;
    timerCircle.style.strokeDashoffset = 0;
}

// ─────────────────────────────────────────────────
// MOSTRAR PANTALLA DE TEMPORIZADOR
// ─────────────────────────────────────────────────
export function showTimerScreen() {
    changeScreen('screen-timer');

    // Jugador que empieza (aleatorio)
    const starterIndex = Math.floor(Math.random() * players.length);
    document.getElementById('starter-player').textContent = players[starterIndex];

    // Texto del botón revelar
    const revealSpan = document.querySelector('#btn-reveal span:last-child');
    if (revealSpan) {
        revealSpan.textContent = numImpostors > 1
            ? `REVELAR A LOS ${numImpostors} IMPOSTORES`
            : 'REVELAR AL IMPOSTOR';
    }

    timerFinished = false;
    timeRemaining = timeSeconds;
    resetTimer(false);
    toggleTimer(); // Arranca automáticamente
}

// ─────────────────────────────────────────────────
// TOGGLE (PLAY / PAUSA)
// ─────────────────────────────────────────────────
export function toggleTimer() {
    if (timerRunning) {
        clearInterval(timerInterval);
        timerRunning = false;
        setPlayPauseIcons(false);
    } else {
        if (timerFinished) return;
        timerRunning = true;
        setPlayPauseIcons(true);

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

// ─────────────────────────────────────────────────
// RESET
// ─────────────────────────────────────────────────
export function resetTimer(resetTime = true) {
    clearInterval(timerInterval);
    timerRunning  = false;
    timerFinished = false;
    if (resetTime) timeRemaining = timeSeconds;
    setPlayPauseIcons(false);
    updateTimerDisplay();
}

// ─────────────────────────────────────────────────
// ACTUALIZAR DISPLAY
// ─────────────────────────────────────────────────
function updateTimerDisplay() {
    const m = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
    const s = (timeRemaining % 60).toString().padStart(2, '0');

    const display = document.getElementById('timer-display');
    const label   = document.getElementById('timer-label');
    if (!display) return;

    display.textContent = `${m}:${s}`;
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

    setTimerProgress(timeRemaining / timeSeconds);
}

function setTimerProgress(fraction) {
    if (!timerCircle) return;
    const offset = timerCircumference * (1 - Math.max(0, fraction));
    timerCircle.style.strokeDashoffset = offset;

    const grad = document.getElementById('timerGrad');
    if (!grad) return;

    if (fraction <= 0.17) {
        timerCircle.setAttribute('stroke', '#f43f5e');
    } else if (fraction <= 0.33) {
        timerCircle.setAttribute('stroke', '#f59e0b');
    } else {
        timerCircle.setAttribute('stroke', 'url(#timerGrad)');
    }
}

function onTimerEnd() {
    document.getElementById('timer-display')?.classList.add('time-done');
}

function setPlayPauseIcons(playing) {
    document.getElementById('play-icon')?.style.setProperty('display', playing ? 'none' : 'block');
    document.getElementById('pause-icon')?.style.setProperty('display', playing ? 'block' : 'none');
}
