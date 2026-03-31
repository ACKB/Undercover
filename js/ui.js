/**
 * UNDERCOVER — ui.js
 * Utilidades de navegación entre pantallas y notificaciones.
 */

/**
 * Activa una pantalla por su ID, desactiva todas las demás.
 * @param {string} id — ID del elemento .screen a activar
 */
export function changeScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id)?.classList.add('active');
}

/**
 * Muestra una notificación tipo toast que desaparece sola.
 * @param {string} message
 * @param {'info'|'error'|'success'} type
 */
export function showToast(message, type = 'info') {
    // Eliminar toast anterior si existe
    const existing = document.getElementById('uc-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'uc-toast';
    toast.className = `uc-toast uc-toast--${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Forzar reflow y añadir clase visible
    requestAnimationFrame(() => {
        requestAnimationFrame(() => toast.classList.add('visible'));
    });

    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.remove(), 350);
    }, 2800);
}

/**
 * Aplica animación de shake a un elemento (útil para validación).
 * @param {HTMLElement} el
 */
export function shakeElement(el) {
    el.style.animation = 'none';
    el.offsetHeight; // reflow
    el.style.animation = 'shake 0.4s ease';
    setTimeout(() => (el.style.animation = ''), 400);
}

/**
 * Escapa caracteres HTML para prevenir XSS.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/**
 * Obtiene las iniciales de un nombre (máx 2 caracteres).
 * @param {string} name
 * @returns {string}
 */
export function getInitials(name) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}
