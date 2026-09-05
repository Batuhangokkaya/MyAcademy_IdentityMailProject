function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    const icon = button.querySelector(".material-symbols-outlined");

    if (input.type === "password") {
        input.type = "text";
        icon.textContent = "visibility";
    }else {
        input.type = "password";
        icon.textContent = "visibility_off";
    }
}