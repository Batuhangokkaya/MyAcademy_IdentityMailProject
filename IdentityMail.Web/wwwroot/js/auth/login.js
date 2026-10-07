/* LOGIN */
function closeEmailConfirmModal() {
    const modal = document.querySelector(".email-confirm-modal");

    if (modal) {
        modal.remove();
    }
}

function toggleLoginPassword(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);

    if (!input || !icon) {
        return;
    }

    if (input.type === "password") {
        input.type       = "text";
        icon.textContent = "visibility_off";
    } else {
        input.type       = "password";
        icon.textContent = "visibility";
    }
}