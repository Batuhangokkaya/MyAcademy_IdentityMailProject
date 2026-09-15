document.addEventListener("DOMContentLoaded", function () {
    const selectAll     = document.getElementById("selectAllCheckbox");
    const bulkImportant = document.getElementById("bulkImportantButton");
    const bulkDelete    = document.getElementById("bulkDeleteButton");
    const selectAllIcon = document.querySelector(".bulk-select-all .material-symbols-outlined");

    /* HELPER FUNCTIONS */
    function getCheckboxes() {
        return document.querySelectorAll(".mail-checkbox");
    }

    function getSelectedCheckboxes() {
        return document.querySelectorAll(".mail-checkbox:checked");
    }

    function getImportantButton(checkbox) {
        const mailItem = checkbox.closest(".mail-item");
        return mailItem.querySelector(".important-button");
    }
    function isImportant(button) {
        return button.dataset.important === "true";
    }

    function setImportantUI(button, important) {
        button.dataset.important = important ? "true" : "false";
        button.classList.toggle("selected", important);

        const icon = button.querySelector(".material-symbols-outlined");
        icon.textContent = important ? "star" : "star_border";
    }

    /* UPDATE TOOLBAR */
    function updateBulkActions() {
        const checkboxes = [...getCheckboxes()];
        const selected = [...getSelectedCheckboxes()];
        const selectedCount = selected.length;
        const totalCount    = checkboxes.length;

        /* BUTTONS */
        bulkImportant.disabled =selectedCount === 0;
        bulkDelete.disabled =selectedCount === 0;

        /* SELECT ALL */
        selectAll.checked       = totalCount > 0 && selectedCount === totalCount;
        selectAll.indeterminate = selectedCount > 0 && selectedCount < totalCount;

        if (selectAll.checked) {
            selectAllIcon.textContent = "check_box";
        }
        else if (selectAll.indeterminate) {
            selectAllIcon.textContent = "indeterminate_check_box";
        }
        else {
            selectAllIcon.textContent = "check_box_outline_blank";
        }

        /* TOP STAR STATUS */
        const allImportant = selectedCount > 0 && selected.every(function (checkbox) {
            const button = getImportantButton(checkbox);
            return isImportant(button);
        });

        /*
            If all the selected ones are starred, the one on top is filled/orange.
        */
        bulkImportant.classList.toggle("active", allImportant);

        bulkImportant.title = allImportant ? "Seçilenlerden yıldızı kaldır" : "Seçilenleri önemli yap";
    }


    /* SELECT ALL */
    selectAll.addEventListener("change", function () {
            getCheckboxes().forEach(function (checkbox) {
                    checkbox.checked = selectAll.checked;
                }
            );

            updateBulkActions();
        }
    );

    /* CHECKBOX ONE BY ONE */
    getCheckboxes().forEach(
        function (checkbox) {
            checkbox.addEventListener("change", updateBulkActions);
        }
    );

    /* THE ONLY EMAIL STAR */
    window.toggleImportant =
        async function (event, id, button) {
            event.preventDefault();
            event.stopPropagation();

            const response = await fetch(`/Message/ToggleImportant?id=${id}`,
                {
                    method: "POST"
                }
            );

            if (!response.ok) {
                return;
            }

            const data = await response.json();

            setImportantUI(button, data.isImportant);

            /*
                When the single star changes, the top toolbar should update too.
            */
            updateBulkActions();
        };

    /* BUNCH OF STARS */
    bulkImportant.addEventListener("click", async function () {
            const selected = [...getSelectedCheckboxes()];

            if (selected.length === 0) {
                return;
            }

            /*
                If the top star is active:
                ALL are starred.
                => remove.

                If it's not active:
                => star it.
            */
            const targetImportant = !bulkImportant.classList.contains("active");

            for (const checkbox of selected) {
                const button = getImportantButton(checkbox);
                const currentImportant = isImportant(button);

                /*
                    If it's already in the target state, don't call ToggleImportant.
                */
                if (
                    currentImportant === targetImportant
                ){
                    continue;
                }

                const id = checkbox.value;

                const response = await fetch(`/Message/ToggleImportant?id=${id}`,
                    {
                        method: "POST"
                    }
                );

                if (!response.ok) {
                    console.error("Yıldız işlemi başarısız:",id);
                    continue;
                }

                const data = await response.json();

                setImportantUI(button, data.isImportant);
            }

            /*
                After the batch process is finished, the top star is recalculated.
            */
            updateBulkActions();
        }
    );

    /* DELETE ALL */
    bulkDelete.addEventListener("click", async function () {
            const selected = [...getSelectedCheckboxes()];

            if (selected.length === 0) {
                return;
            }

            for (const checkbox of selected) {
                const id = checkbox.value;

                const response = await fetch(`/Message/DeleteMail?id=${id}`,
                    {
                        method: "POST"
                    }
                );

                if (!response.ok) {
                    continue;
                }

                checkbox.closest(".mail-item").remove();
            }

            updateBulkActions();
        }
    );

    /* FIRST STATUS */
    updateBulkActions();

});