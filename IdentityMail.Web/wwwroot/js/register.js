/* REGISTER */
function togglePassword(inputId, iconId) {

    const input = document.getElementById(inputId);
    const icon  = document.getElementById(iconId);

    if (input.type === "password") {

        input.type = "text";
        icon.textContent = "visibility_off";

    }
    else {

        input.type = "password";
        icon.textContent = "visibility";

    }
}