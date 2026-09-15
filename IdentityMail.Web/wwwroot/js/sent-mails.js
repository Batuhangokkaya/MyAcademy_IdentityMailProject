document.addEventListener("DOMContentLoaded", function () {
    const selectAllCheckbox   = document.getElementById("sentSelectAll");
    const mailCheckboxes      = Array.from(document.querySelectorAll(".sent-mail-checkbox"));
    const bulkImportantButton = document.querySelector(".sent-mails-bulk button:nth-of-type(1)");
    const bulkDeleteButton    = document.querySelector(".sent-mails-bulk button:nth-of-type(2)");
    const categorySelect      = document.querySelector(".sent-mails-select:not(.sent-mails-sort)");
    const sortSelect          = document.querySelector(".sent-mails-sort");

    /* INITIAL STATE */
    updateBulkActions();

    /* SELECT ALL */
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener("change", function () {
            mailCheckboxes.forEach(function (checkbox) {
                checkbox.checked = selectAllCheckbox.checked;
            });

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
        bulkImportantButton.addEventListener("click", function () {
            const selectedCheckboxes = getSelectedCheckboxes();

            selectedCheckboxes.forEach(function (checkbox) {
                const row = checkbox.closest(".sent-mails-item");

                if (!row) {
                    return;
                }

                const star = row.querySelector(".sent-mails-item-star .material-icons");

                if (star) {
                    star.click();
                }
            });
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
        const selectedCount = getSelectedCheckboxes().length;
        const hasSelection = selectedCount > 0;

        if (bulkImportantButton) {
            bulkImportantButton.disabled = !hasSelection;
        }

        if (bulkDeleteButton) {
            bulkDeleteButton.disabled = !hasSelection;
        }
    }

    /* UPDATE SELECT ALL */
    function updateSelectAllState() {
        if (!selectAllCheckbox) {
            return;
        }

        const selectedCount = getSelectedCheckboxes().length;

        selectAllCheckbox.checked       = selectedCount === mailCheckboxes.length && mailCheckboxes.length > 0;
        selectAllCheckbox.indeterminate = selectedCount > 0 && selectedCount < mailCheckboxes.length;
    }

    /* DELETE MAIL */
    async function deleteMail(id) {
        const token = document.querySelector('input[name="__RequestVerificationToken"]')?.value;
        const headers = {};

        if (token) {
            headers["RequestVerificationToken"] = token;
        }

        const response = await fetch(`/Message/DeleteMail/${id}`, {
            method: "POST",
            headers: headers
        });

        if (!response.ok) {
            const secondResponse = await fetch(`/Message/DeleteMail?id=${id}`, {
                method: "POST",
                headers: headers
            });

            if (!secondResponse.ok) {
                throw new Error(`Mail silinemedi. ID: ${id}`);
            }
        }
    }
});