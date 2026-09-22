document.addEventListener("DOMContentLoaded", function () {
    const colorButtons = document.querySelectorAll(".category-color");
    const colorInput = document.getElementById("categoryColor");

    colorButtons.forEach(button => {
        button.addEventListener("click", function () {
            /* REMOVE OLD SELECTION */
            colorButtons.forEach(item => {
                item.classList.remove("selected");
            })

            /* SELECT NEW COLOR */
            this.classList.add("selected");

            /* GET COLOR */
            const selectedColor = this.dataset.color;

            /* SAVE COLOR TO INPUT */
            colorInput.value = selectedColor;
        });
    });
});