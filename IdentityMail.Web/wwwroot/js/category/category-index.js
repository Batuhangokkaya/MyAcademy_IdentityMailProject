/* WARNING MODAL */
function openCategoryWarning(message) {
    const modal = document.getElementById("categoryModal");

    document.getElementById("categoryWarningText").textContent = message || "Kategoriyle ilgili işlem gerçekleştirilemedi.";

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");

    modal.querySelector(".category-modal-button").focus();
}

function closeCategoryWarning() {
    const modal = document.getElementById("categoryModal");

    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
}

/* DELETE MODAL */
function openCategoryDelete(id, name) {
    const modal = document.getElementById("categoryActionModal");

    document.getElementById("categoryDeleteId").value         = id;
    document.getElementById("categoryDeleteName").textContent = name;

    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");

    document.getElementById("categoryActionCancel").focus();
}

function closeCategoryDelete() {
    const modal = document.getElementById("categoryActionModal");
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
}

/* DOM CONTENT LOADED */
document.addEventListener("DOMContentLoaded", function () {
    /* CATEGORY DELETE BUTTONS */
    document.querySelectorAll(".category-delete-button").forEach(button => {
        button.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();

            const id   = this.dataset.id;
            const name = this.dataset.name;

            openCategoryDelete(id, name);
        });
    });

    /* CANCEL DELETE */
    document.getElementById("categoryActionCancel").addEventListener("click", closeCategoryDelete);

    /* CLOSE MODAL ON BACKDROP CLICK */
    document.querySelectorAll(".category-modal").forEach(modal => {
        modal.addEventListener("click", function (event) {
            if (event.target === modal) {
                if (modal.id === "categoryModal") {
                    closeCategoryWarning();
                }

                if (modal.id === "categoryActionModal") {
                    closeCategoryDelete();
                }
            }
        });
    });

    /* ESC KEY */
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeCategoryWarning();
            closeCategoryDelete();
        }
    });

    /* DELETE FORM */
    document.getElementById("categoryDeleteForm").addEventListener("submit", function () {
        const button = document.getElementById("categoryActionConfirm");

        button.disabled = true;
        button.textContent = "Siliniyor...";
    });
});