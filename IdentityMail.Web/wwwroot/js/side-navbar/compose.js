/* COMPOSE MESSAGE */
(function () {
    const composeBtn    = document.getElementById('compose-btn');
    const composeWindow = document.getElementById('compose-window');
    const closeBtn      = document.getElementById('compose-close');
    const minimizeBtn   = document.getElementById('compose-minimize');
    const maximizeBtn   = document.getElementById('compose-maximize');
    const composeBody   = document.getElementById('compose-body');
    const composeFooter = document.getElementById('compose-footer');
    const maximizeIcon  = maximizeBtn ? maximizeBtn.querySelector('.material-symbols-outlined') : null;

    if (composeBtn && composeWindow) {
        composeBtn.onclick = () => {
            composeWindow.classList.remove('hidden');

            if (!composeWindow.classList.contains('is-maximized')) {
                composeWindow.classList.remove('is-minimized');
                composeWindow.style.height = '600px';

                if (composeBody) {
                    composeBody.style.display = 'flex';
                }

                if (composeFooter) {
                    composeFooter.style.display = 'flex';
                }
            }
        };
    }

    if (closeBtn && composeWindow) {
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            composeWindow.classList.add('hidden');
        };
    }

    if (minimizeBtn && composeWindow) {
        minimizeBtn.onclick = (e) => {
            e.stopPropagation();

            if (composeWindow.classList.contains('is-maximized')) {
                composeWindow.classList.remove('is-maximized');

                if (maximizeIcon) {
                    maximizeIcon.textContent = 'open_in_full';
                }
            }

            if (composeWindow.classList.contains('is-minimized')) {
                composeWindow.classList.remove('is-minimized');
                composeWindow.style.height = '600px';

                if (composeBody) {
                    composeBody.style.display = 'flex';
                }

                if (composeFooter) {
                    composeFooter.style.display = 'flex';
                }
            } else {
                composeWindow.classList.add('is-minimized');
                composeWindow.style.height = '48px';

                if (composeBody) {
                    composeBody.style.display = 'none';
                }

                if (composeFooter) {
                    composeFooter.style.display = 'none';
                }
            }
        };
    }

    if (maximizeBtn && composeWindow) {
        maximizeBtn.onclick = (e) => {
            e.stopPropagation();

            if (composeWindow.classList.contains('is-minimized')) {
                composeWindow.classList.remove('is-minimized');

                if (composeBody) {
                    composeBody.style.display = 'flex';
                }

                if (composeFooter) {
                    composeFooter.style.display = 'flex';
                }
            }
            if (composeWindow.classList.contains('is-maximized')) {
                composeWindow.classList.remove('is-maximized');
                composeWindow.style.height = '600px';

                if (maximizeIcon) {
                    maximizeIcon.textContent = 'open_in_full';
                }
            } else {
                composeWindow.classList.add('is-maximized');
                composeWindow.style.height = '';

                if (maximizeIcon) {
                    maximizeIcon.textContent = 'close_fullscreen';
                }
            }
        };
    }

})();

/* COMPOSE MAIL VALIDATION */
document.addEventListener("submit", function (e) {
    const form = e.target;

    if (!form.classList.contains("compose-message-form")) {
        return;
    }

    const receiverInput = form.querySelector('[name="ReceiverMail"]');
    const subjectInput  = form.querySelector('[name="Subject"]');
    const bodyInput     = form.querySelector('[name="Body"]');
    const composeBody   = form.querySelector(".compose-message-body");

    /* DELETE THE OLD ALERT */
    const oldError = form.querySelector(".compose-validation-error");

    if (oldError) {
        oldError.remove();
    }

    let errorMessage = "";
    let focusInput   = null;

    /* RECEIVER */
    if (!receiverInput || !receiverInput.value.trim()) {
        errorMessage = "Alıcı mail adresini girmeniz gerekiyor.";
        focusInput   = receiverInput;
    }

    /* SUBJECT */
    else if (!subjectInput || !subjectInput.value.trim()) {
        errorMessage = "Mail konusunu girmeniz gerekiyor.";
        focusInput   = subjectInput;
    }

    /* MESSAGE */
    else if (!bodyInput || !bodyInput.value.trim()) {
        errorMessage = "Mesaj içeriğini girmeniz gerekiyor.";
        focusInput   = bodyInput;
    }

    /* DON'T SEND IT IF THERE'S AN ERROR */
    if (errorMessage) {
        e.preventDefault();

        const errorBox = document.createElement("div");

        errorBox.className   = "compose-validation-error";
        errorBox.textContent = errorMessage;

        composeBody.prepend(errorBox);

        if (focusInput) {
            focusInput.focus();
        }

        return;
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const windowEl = document.getElementById("compose-window");

    if (!windowEl) {
        return;
    }

    const form        = windowEl.querySelector(".compose-message-form");
    const fileInput   = document.getElementById("compose-files");
    const preview     = document.getElementById("compose-selected-files");
    const clearButton = document.getElementById("compose-clear");
    let imageUrls     = [];

    function clearPreviews() {
        imageUrls.forEach(url => URL.revokeObjectURL(url));
        imageUrls = [];
        preview.replaceChildren();
    }

    fileInput.addEventListener("change", function () {
        clearPreviews();

        for (const file of fileInput.files) {
            const item = document.createElement("div");
            item.className = "compose-file-item";

            if (file.type.startsWith("image/")) {
                const img = document.createElement("img");
                const url = URL.createObjectURL(file);

                imageUrls.push(url);

                img.src = url;
                img.alt = file.name;

                item.appendChild(img);
            }

            const name = document.createElement("span");
            name.className   = "compose-file-name";
            name.textContent = file.name;

            item.appendChild(name);
            preview.appendChild(item);
        }
    });

    clearButton.addEventListener("click", function () {
        form.reset();

        // REMOVE THE LINK TO THE DRAFT BEING EDITED.
        const draftInput = form.querySelector('[name="DraftID"]');

        if (draftInput) {
            draftInput.value = "";
        }

        fileInput.value = "";
        clearPreviews();

        form.querySelectorAll(".compose-validation-error").forEach(error => error.remove());
        form.querySelector('[name="ReceiverMail"]')?.focus();
    });
});