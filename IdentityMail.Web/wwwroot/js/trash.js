/* TRASH */
function showTrashWarning() {
    const modal = document.getElementById("trashModal");

modal.classList.add("show");
}

function closeTrashWarning() {
    const modal = document.getElementById("trashModal");

modal.classList.remove("show");
}

document.getElementById("trashModal").addEventListener("click", function (event) {

    if (event.target === this) {
    closeTrashWarning();
    }

});