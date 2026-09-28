document.addEventListener("DOMContentLoaded", function () {
    const colorInput   = document.getElementById("categoryColor");
    const colorButtons = document.querySelectorAll(".category-color");

    if (!colorInput || colorButtons.length === 0) {
        return;
    }

    /* SELECT COLOR */
    function selectColor(button) {

        colorButtons.forEach(function (item) {
            item.classList.remove("selected");
        });

        button.classList.add("selected");

        colorInput.value = button.dataset.color;
    }

    /* CURRENT CATEGORY COLOR */
    const currentColor = colorInput.value ? colorInput.value.trim().toUpperCase() : "#2563EB";

    /* FIND CURRENT COLOR */
    let currentButton = null;

    colorButtons.forEach(function (button) {
        const buttonColor = button.dataset.color.toUpperCase();

        if (buttonColor === currentColor) {
            currentButton = button;
        }

        /* CLICK */
        button.addEventListener("click", function () {
            selectColor(this);
        });

    });

    /* INITIAL SELECTED COLOR */
    if (currentButton) {
        selectColor(currentButton);
    }
    else {
        selectColor(colorButtons[0]);
    }
});