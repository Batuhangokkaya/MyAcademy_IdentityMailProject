/* MAIL SELECTION */
document.addEventListener("DOMContentLoaded", function () {
    const selectAll  = document.getElementById("importantSelectAll");
    const bulkStar   = document.getElementById("importantBulkStar");
    const bulkDelete = document.getElementById("importantBulkDelete");

    /* UPDATE SELECTION */
    function updateSelection() {
        const checkboxes = document.querySelectorAll(".important-mail-checkbox");
        const checked    = document.querySelectorAll(".important-mail-checkbox:checked");

        /* SELECTED ROW */
        checkboxes.forEach(function (checkbox) {
            const mailItem = checkbox.closest(".important-mail-item");

            if (mailItem) {
                mailItem.classList.toggle("selected-mail", checkbox.checked);
            }
        });

        /* BULK STAR */
        if (bulkStar) {
            bulkStar.disabled = checked.length === 0;
        }

        /* BULK DELETE */
        if (bulkDelete) {
            bulkDelete.disabled = checked.length === 0;
        }

        /* SELECT ALL */
        if (selectAll) {
            selectAll.checked       = checkboxes.length > 0 && checked.length === checkboxes.length;
            selectAll.indeterminate = checked.length > 0 && checked.length < checkboxes.length;
        }
    }

    /* CHECKBOX EVENTS */
    function bindCheckboxEvents() {
        const checkboxes = document.querySelectorAll(".important-mail-checkbox");

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener("click", function (event) {
                event.stopPropagation();
            });

            checkbox.addEventListener("change", updateSelection);
        });
    }

    bindCheckboxEvents();

    /* SELECT ALL */
    if (selectAll) {
        selectAll.addEventListener("change", function () {
            const checkboxes = document.querySelectorAll(".important-mail-checkbox");

            checkboxes.forEach(checkbox => {
                checkbox.checked = selectAll.checked;
            });

            updateSelection();
        });
    }

    /* BULK REMOVE IMPORTANT */
    if (bulkStar) {
        bulkStar.addEventListener("click", async function () {
            const selectedCheckboxes = document.querySelectorAll(".important-mail-checkbox:checked");

            if (selectedCheckboxes.length === 0) {
                return;
            }

            for (const checkbox of selectedCheckboxes) {
                const id = checkbox.value;

                const response = await fetch(`/Message/ToggleImportant?id=${id}`, {
                    method: "POST"
                });

                if (!response.ok) {
                    continue;
                }

                const data = await response.json();

                if (!data.isImportant) {
                    const mailItem = checkbox.closest(".important-mail-item");

                    if (mailItem) {
                        mailItem.remove();
                    }
                }
            }

            updateSelection();
        });
    }

    /* INITIAL STATE */
    updateSelection();
});


/* TOGGLE IMPORTANT */
async function toggleImportant(event, id, button) {
    event.preventDefault();
    event.stopPropagation();

    const response = await fetch(`/Message/ToggleImportant?id=${id}`, {
        method: "POST"
    });

    if (!response.ok) {
        return;
    }

    const data = await response.json();

    if (!data.isImportant) {
        const mailItem = button.closest(".important-mail-item");

        if (mailItem) {
            mailItem.remove();
        }
    }
}