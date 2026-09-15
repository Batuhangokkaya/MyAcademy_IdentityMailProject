/* COMPOSE MESSAGE */
(function () {
    const composeBtn    = document.getElementById('compose-btn');
    const composeWindow = document.getElementById('compose-window');
    const closeBtn      = document.getElementById('compose-close');
    const minimizeBtn   = document.getElementById('compose-minimize');
    const maximizeBtn   = document.getElementById('compose-maximize');
    const maximizeIcon  = maximizeBtn.querySelector('.material-symbols-outlined');
    const composeBody   = document.getElementById('compose-body');
    const composeFooter = document.getElementById('compose-footer');
    if (composeBtn) {
        composeBtn.onclick = () => {
            composeWindow.classList.remove('hidden');
            if (!composeWindow.classList.contains('is-maximized')) {
                composeWindow.classList.remove('is-minimized');
                composeWindow.style.height = '600px';
                composeBody.style.display = 'flex';
                composeFooter.style.display = 'flex';
            }
        };
    }
    if (closeBtn) {
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            composeWindow.classList.add('hidden');
        };
    }
    if (minimizeBtn) {
        minimizeBtn.onclick = (e) => {
            e.stopPropagation();
            if (composeWindow.classList.contains('is-maximized')) {
                composeWindow.classList.remove('is-maximized');
                maximizeIcon.textContent = 'open_in_full';
            }
            if (composeWindow.classList.contains('is-minimized')) {
                composeWindow.classList.remove('is-minimized');
                composeWindow.style.height = '600px';
                composeBody.style.display = 'flex';
                composeFooter.style.display = 'flex';
            } else {
                composeWindow.classList.add('is-minimized');
                composeWindow.style.height = '48px';
                composeBody.style.display = 'none';
                composeFooter.style.display = 'none';
            }
        };
    }
    if (maximizeBtn) {
        maximizeBtn.onclick = (e) => {
            e.stopPropagation();
            if (composeWindow.classList.contains('is-minimized')) {
                composeWindow.classList.remove('is-minimized');
                composeBody.style.display = 'flex';
                composeFooter.style.display = 'flex';
            }
            if (composeWindow.classList.contains('is-maximized')) {
                composeWindow.classList.remove('is-maximized');
                composeWindow.style.height = '600px';
                maximizeIcon.textContent = 'open_in_full';
            } else {
                composeWindow.classList.add('is-maximized');
                composeWindow.style.height = ''; // Let CSS handle it
                maximizeIcon.textContent = 'close_fullscreen';
            }
        };
    }
})();