document.addEventListener("DOMContentLoaded", function () {
    const selectAllCheckbox   = document.getElementById("sentSelectAll");
    const mailCheckboxes      = Array.from(document.querySelectorAll(".sent-mail-checkbox"));
    const bulkImportantButton = document.getElementById("sentBulkImportantButton");
    const bulkDeleteButton    = document.getElementById("sentBulkDeleteButton");
    const categorySelect      = document.querySelector(".sent-mails-select:not(.sent-mails-sort)");
    const sortSelect          = document.querySelector(".sent-mails-sort");

    /* INITIAL STATE */
    updateSelectAllState();
    updateBulkActions();

    /* SELECT ALL */
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener("change", function () {
            mailCheckboxes.forEach(function (checkbox) {
                checkbox.checked = selectAllCheckbox.checked;
            });

            updateSelectAllState();
            updateBulkActions();
        });
    }

    /* MAIL CHECKBOXES */
    mailCheckboxes.forEach(function (checkbox) {
        checkbox.addEventListener("click", function (event) {
            event.stopPropagation();
        });

        checkbox.addEventListener("change", function () {
            updateSelectAllState();
            updateBulkActions();
        });
    });

    /* BULK IMPORTANT */
    if (bulkImportantButton) {
        bulkImportantButton.addEventListener("click", async function () {
            const selectedCheckboxes = getSelectedCheckboxes();

            if (selectedCheckboxes.length === 0) {
                return;
            }

            const selectedButtons = selectedCheckboxes
                .map(function (checkbox) {
                    const row = checkbox.closest(".sent-mails-item");

                    if (!row) {
                        return null;
                    }

                    return row.querySelector(".sent-mails-important-button");
                })
                .filter(Boolean);

            const allImportant = selectedButtons.every(function (button) {
                return button.classList.contains("selected");
            });

            const targetImportantState = !allImportant;

            bulkImportantButton.disabled = true;

            try {
                for (let i = 0; i < selectedCheckboxes.length; i++) {
                    const checkbox = selectedCheckboxes[i];
                    const button   = selectedButtons[i];

                    if (!button) {
                        continue;
                    }

                    const currentState = button.classList.contains("selected");

                    if (currentState !== targetImportantState) {
                        await toggleImportantRequest(checkbox.value, button);
                    }
                }
            } catch (error) {
                console.error("Önemli durumu değiştirilirken hata oluştu:", error);
            }

            updateBulkActions();
            updateBulkImportantState();
        });
    }

    /* BULK DELETE */
    if (bulkDeleteButton) {
        bulkDeleteButton.addEventListener("click", async function () {
            const selectedCheckboxes = getSelectedCheckboxes();

            if (selectedCheckboxes.length === 0) {
                return;
            }

            const confirmed = confirm(`${selectedCheckboxes.length} mesaj silinsin mi?`);

            if (!confirmed) {
                return;
            }

            bulkDeleteButton.disabled = true;

            try {
                for (const checkbox of selectedCheckboxes) {
                    await deleteMail(checkbox.value);
                }

                window.location.reload();
            } catch (error) {
                console.error("Mesajlar silinirken hata oluştu:", error);
                alert("Mesajlar silinirken bir hata oluştu.");
                updateBulkActions();
            }
        });
    }

    /* CATEGORY FILTER */
    if (categorySelect) {
        categorySelect.addEventListener("change", function () {
            const url = new URL(window.location.href);

            if (categorySelect.value) {
                url.searchParams.set("categoryId", categorySelect.value);
            } else {
                url.searchParams.delete("categoryId");
            }

            window.location.href = url.toString();
        });
    }

    /* SORT FILTER */
    if (sortSelect) {
        sortSelect.addEventListener("change", function () {
            const url = new URL(window.location.href);

            url.searchParams.set("sort", sortSelect.value);

            window.location.href = url.toString();
        });
    }

    /* GET SELECTED MAILS */
    function getSelectedCheckboxes() {
        return mailCheckboxes.filter(function (checkbox) {
            return checkbox.checked;
        });
    }

    /* UPDATE BULK ACTIONS */
    function updateBulkActions() {
        const hasSelection = getSelectedCheckboxes().length > 0;

        if (bulkImportantButton) {
            bulkImportantButton.disabled = !hasSelection;
        }

        if (bulkDeleteButton) {
            bulkDeleteButton.disabled = !hasSelection;
        }

        updateBulkImportantState();
    }

    /* UPDATE BULK IMPORTANT */
    function updateBulkImportantState() {
        if (!bulkImportantButton) {
            return;
        }

        const selectedCheckboxes = getSelectedCheckboxes();

        if (selectedCheckboxes.length === 0) {
            bulkImportantButton.classList.remove("selected");
            return;
        }

        const allImportant = selectedCheckboxes.every(function (checkbox) {
            const row = checkbox.closest(".sent-mails-item");

            if (!row) {
                return false;
            }

            const button = row.querySelector(".sent-mails-important-button");

            return button && button.classList.contains("selected");
        });

        bulkImportantButton.classList.toggle("selected", allImportant);
    }

    /* UPDATE SELECT ALL */
    function updateSelectAllState() {
        if (!selectAllCheckbox) {
            return;
        }

        const selectedCount = getSelectedCheckboxes().length;
        const totalCount    = mailCheckboxes.length;

        selectAllCheckbox.checked       = totalCount > 0 && selectedCount === totalCount;
        selectAllCheckbox.indeterminate = selectedCount > 0 && selectedCount < totalCount;
    }

    /* IMPORTANT REQUEST */
    async function toggleImportantRequest(id, button) {
        const response = await fetch(`/Message/ToggleImportant?id=${id}`, {
            method: "POST"
        });

        if (!response.ok) {
            throw new Error(`Önemli durumu değiştirilemedi. ID: ${id}`);
        }

        const data = await response.json();
        const icon = button.querySelector(".material-symbols-outlined");

        button.classList.toggle("selected", data.isImportant);

        if (icon) {
            icon.textContent = data.isImportant ? "star" : "star_border";
        }

        return data;
    }

    /* DELETE MAIL */
    async function deleteMail(id) {
        const response = await fetch(`/Message/DeleteMail?id=${id}`, {
            method: "POST"
        });

        if (!response.ok) {
            throw new Error(`Mail silinemedi. ID: ${id}`);
        }
    }

    /* GLOBAL IMPORTANT */
    window.toggleImportant = async function (event, id, button) {
        event.preventDefault();
        event.stopPropagation();

        try {
            await toggleImportantRequest(id, button);
            updateBulkImportantState();
        } catch (error) {
            console.error("Önemli durumu değiştirilirken hata oluştu:", error);
        }
    };
});