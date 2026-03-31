/**
 * UNDERCOVER — Service Worker
 * Estrategia: Cache First para todos los assets estáticos.
 * Permite que el juego funcione completamente offline.
 */

const CACHE_NAME    = 'undercover-v2';
const OFFLINE_URL   = './';

// Assets que se precargan en la instalación
const PRECACHE_URLS = [
    './',
    './index.html',
    './style.css',
    './manifest.json',
    './database.js',
    './js/main.js',
    './js/config.js',
    './js/ui.js',
    './js/players.js',
    './js/configScreen.js',
    './js/categories.js',
    './js/ai.js',
    './js/game.js',
    './js/timer.js',
    './js/modal.js',
    './icons/icon-192.png',
    './icons/icon-512.png',
    // Google Fonts (intentamos cachearlas; si falla, no importa)
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap',
];

// ─────────────────────────────────────────────────
// INSTALL — Precachear assets
// ─────────────────────────────────────────────────
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            // Cachear lo que se pueda; ignorar fallos individuales (ej. fuentes)
            return Promise.allSettled(
                PRECACHE_URLS.map(url =>
                    cache.add(url).catch(err => console.warn('[SW] No se pudo cachear:', url, err))
                )
            );
        }).then(() => self.skipWaiting())
    );
});

// ─────────────────────────────────────────────────
// ACTIVATE — Eliminar caches obsoletas
// ─────────────────────────────────────────────────
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

// ─────────────────────────────────────────────────
// FETCH — Cache First, Network Fallback
// ─────────────────────────────────────────────────
self.addEventListener('fetch', event => {
    // No interceptar requests de la Gemini API (siempre necesitan red)
    if (event.request.url.includes('generativelanguage.googleapis.com') ||
        event.request.url.includes('esm.sh')) {
        return; // Deja pasar sin interceptar
    }

    // Solo GET
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;

            // No está en cache — intentar red
            return fetch(event.request).then(response => {
                // Solo cachear respuestas válidas
                if (!response || response.status !== 200 || response.type === 'error') {
                    return response;
                }

                // Clonar y guardar en cache
                const toCache = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache));
                return response;
            }).catch(() => {
                // Sin red y sin cache → servir página principal
                return caches.match(OFFLINE_URL);
            });
        })
    );
});
