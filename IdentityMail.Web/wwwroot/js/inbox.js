document.addEventListener("DOMContentLoaded", function () {
    const selectAll     = document.getElementById("selectAllCheckbox");
    const bulkImportant = document.getElementById("bulkImportantButton");
    const bulkDelete    = document.getElementById("bulkDeleteButton");

    /* HELPER FUNCTIONS */
    function getCheckboxes() {
        return document.querySelectorAll(".mail-checkbox");
    }

    function getSelectedCheckboxes() {
        return document.querySelectorAll(".mail-checkbox:checked");
    }

    function getImportantButton(checkbox) {
        const mailItem = checkbox.closest(".mail-item");

        if (!mailItem) {
            return null;
        }

        return mailItem.querySelector(".important-button");
    }

    /* IS IMPORTANT */
    function isImportant(button) {
        if (!button) {
            return false;
        }

        return (
            button.dataset.important?.toLowerCase() === "true" ||
            button.classList.contains("selected")
        );
    }

    /* SET IMPORTANT UI */
    function setImportantUI(button, important) {
        if (!button) {
            return;
        }

        button.dataset.important = important ? "true" : "false";

        button.classList.toggle("selected", important);

        const icon = button.querySelector(
            ".material-symbols-outlined"
        );

        if (icon) {
            icon.textContent = important ? "star" : "star_border";
        }
    }

    /* UPDATE TOOLBAR */
    function updateBulkActions() {
        const checkboxes    = [...getCheckboxes()];
        const selected      = [...getSelectedCheckboxes()];
        const selectedCount = selected.length;
        const totalCount    = checkboxes.length;

        /* SELECTED ROW BLUE */
        checkboxes.forEach(function (checkbox) {
            const mailItem = checkbox.closest(".mail-item");

            if (mailItem) {
                mailItem.classList.toggle("selected-mail", checkbox.checked);
            }
        });

        /* BUTTON STATUS */
        bulkImportant.disabled = selectedCount === 0;
        bulkDelete.disabled    = selectedCount === 0;

        /* SELECT ALL */
        selectAll.checked       = totalCount > 0 && selectedCount === totalCount;
        selectAll.indeterminate = selectedCount > 0 && selectedCount < totalCount;

        /*
            TOP STAR

            IF ALL SELECTED EMAILS ARE IMPORTANT:  
            STAR YELLOW + FILLED.  

            IF THERE ARE SOME THAT AREN'T IMPORTANT:  
            NORMAL STAR.
        */
        const allImportant = selectedCount > 0 && selected.every(function (checkbox) {
            const button = getImportantButton(checkbox);

            return isImportant(button);
        });

        bulkImportant.classList.toggle("active", allImportant);
        bulkImportant.title = allImportant ? "Seçilenlerden yıldızı kaldır" : "Seçilenleri önemli yap";
    }

    /* SELECT ALL */
    selectAll.addEventListener("change", function () {
        getCheckboxes().forEach(function (checkbox) {
            checkbox.checked = selectAll.checked;
        });

        updateBulkActions();
        }
    );

    /* CHECKBOX ONE BY ONE */
    getCheckboxes().forEach(function (checkbox) {
        checkbox.addEventListener("change", updateBulkActions);
    });

    /* SINGLE MAIL STAR */
    window.toggleImportant =
        async function (event, id, button) {
            event.preventDefault();
            event.stopPropagation();

            const response = await fetch(`/Message/ToggleImportant?id=${id}`, {
                    method: "POST"
                }
            );

            if (!response.ok) {
                console.error("Yıldız işlemi başarısız:", id);
                return;
            }

            const data = await response.json();

            setImportantUI(button, data.isImportant);

            updateBulkActions();
        };

    /* BULK STAR */
    bulkImportant.addEventListener("click", async function () {
            const selected = [...getSelectedCheckboxes()];

            if (selected.length === 0) {
                return;
            }

            /* IF THE TOP STAR IS YELLOW: REMOVE THE STARS. IF IT'S NOT YELLOW: MARK IT AS IMPORTANT. */
            const targetImportant = !bulkImportant.classList.contains("active");

            for (const checkbox of selected) {
                const button           = getImportantButton(checkbox);
                const currentImportant = isImportant(button);

                /*
                    IF IT'S ALREADY IN THE DESIRED STATE, DON'T SEND A REQUEST TO THE SERVER AGAIN.
                */
                if (currentImportant === targetImportant) {
                    continue;
                }

                const id       = checkbox.value;

                const response = await fetch(`/Message/ToggleImportant?id=${id}`, {
                    method: "POST"
                });

                if (!response.ok) {
                    console.error("Yıldız işlemi başarısız:", id);
                    continue;
                }

                const data = await response.json();

                setImportantUI(button, data.isImportant);
            }

            updateBulkActions();
        }
    );

    /* BULK DELETE */
    bulkDelete.addEventListener("click", async function () {
        const selected = [...getSelectedCheckboxes()];

        if (selected.length === 0) {
            return;
        }

        for (const checkbox of selected) {
            const id = checkbox.value;

            const response = await fetch(`/Message/DeleteMail?id=${id}`, {

                method: "POST"
            });

            if (!response.ok) {
                continue;
            }

            const mailItem = checkbox.closest(".mail-item");

            if (mailItem) {
                mailItem.remove();
            }
        }

        updateBulkActions();
    });

    /* FIRST STATUS */
    updateBulkActions();
});