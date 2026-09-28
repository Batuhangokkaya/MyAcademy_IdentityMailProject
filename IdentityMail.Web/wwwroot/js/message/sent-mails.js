document.addEventListener("DOMContentLoaded", function () {
    const selectAllCheckbox   = document.getElementById("sentSelectAll");
    const mailCheckboxes      = Array.from(document.querySelectorAll(".sent-mail-checkbox"));
    const bulkImportantButton = document.getElementById("sentBulkImportantButton");
    const bulkDeleteButton    = document.getElementById("sentBulkDeleteButton");
    const categorySelect      = document.querySelector(".sent-mails-select:not(.sent-mails-sort)");
    const sortSelect          = document.querySelector(".sent-mails-sort");
    const bulkCategory        = document.getElementById("sentBulkCategorySelect");

    /* INITIAL STATE */
    updateSelectAllState();
    updateBulkActions();

    /* SELECT ALL */
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener("change", function () {
            mailCheckboxes.forEach(function (checkbox) {
                checkbox.checked = selectAllCheckbox.checked;

                const row = checkbox.closest(".sent-mails-item");

                if (row) {
                    row.classList.toggle("selected-mail", checkbox.checked);
                }
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
            const row = checkbox.closest(".sent-mails-item");

            if (row) {
                row.classList.toggle("selected-mail", checkbox.checked);
            }

            updateSelectAllState();
            updateBulkActions();
        });
    });

    /* SINGLE IMPORTANT */
    document.querySelectorAll(".sent-mails-important-button").forEach(function (button) {
        button.addEventListener("click", async function (event) {
            event.preventDefault();
            event.stopPropagation();

            const targetState = !button.classList.contains("selected");

            button.disabled = true;

            try {
                await saveImportant(button, targetState);
            } catch (error) {
                console.error("Yıldız işlemi başarısız:", error);
                alert("Mesajın önemli durumu değiştirilemedi.");
            } finally {
                button.disabled = false;
            }
        });
    });

    /* BULK CATEGORY */
    if (bulkCategory) {
        bulkCategory.addEventListener("change", async function () {
            const categoryValue = this.value;
            const selected      = getSelectedCheckboxes();

            if (!categoryValue) {
                return;
            }

            if (selected.length === 0) {
                this.value = "";
                return;
            }

            const formData = new FormData();

            selected.forEach(function (checkbox) {
                formData.append("messageID", checkbox.value);
            });

            if (categoryValue !== "remove") {
                formData.append("categoryID", categoryValue);
            }

            const token = document.querySelector('input[name="__RequestVerificationToken"]')?.value;

            if (token) {
                formData.append("__RequestVerificationToken", token);
            }

            this.disabled = true;

            try {
                const response = await fetch("/Message/AssignCategoryBulk", {
                    method: "POST",
                    body: formData,
                    credentials: "same-origin"
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }

                const result = await response.json();

                if (!result.success) {
                    throw new Error("Kategori güncellenemedi.");
                }

                window.location.reload();
            }
            catch (error) {
                console.error("BULK CATEGORY ERROR:", error);
                this.value = "";
            }
            finally {
                this.disabled = false;
            }
        });
    }

    /* DELETE MODAL */
    const sentDeleteModal   = document.getElementById("sentDeleteModal");
    const sentDeleteTitle   = document.getElementById("sentDeleteTitle");
    const sentDeleteText    = document.getElementById("sentDeleteText");
    const sentDeleteCancel  = document.getElementById("sentDeleteCancel");
    const sentDeleteConfirm = document.getElementById("sentDeleteConfirm");
    let pendingDeleteForms  = [];
    let isDeleting          = false;

    /* OPEN DELETE MODAL */
    function openDeleteModal(forms) {
        if (!forms.length) {
            return;
        }

        pendingDeleteForms = forms;

        if (forms.length === 1) {
            sentDeleteTitle.textContent = "Mesajı Sil";
            sentDeleteText.textContent  = "Bu mesaj Gönderilen Mesajlar listenizden kaldırılacak.";
        } else {
            sentDeleteTitle.textContent = "Seçilen Mesajları Sil";
            sentDeleteText.textContent  = `${forms.length} mesaj Gönderilen Mesajlar listenizden kaldırılacak.`;
        }

        sentDeleteModal.classList.add("show");
        sentDeleteModal.setAttribute("aria-hidden", "false");
        sentDeleteConfirm.focus();
    }

    /* CLOSE DELETE MODAL */
    function closeDeleteModal() {
        if (isDeleting) {
            return;
        }

        sentDeleteModal.classList.remove("show");
        sentDeleteModal.setAttribute("aria-hidden", "true");
        pendingDeleteForms = [];
    }

    /* SINGLE DELETE */
    document.querySelectorAll(".sent-mails-delete-form").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            openDeleteModal([form]);
        });
    });

    /* BULK DELETE */
    if (bulkDeleteButton) {
        bulkDeleteButton.addEventListener("click", function () {
            const selectedCheckboxes = getSelectedCheckboxes();

            if (!selectedCheckboxes.length) {
                return;
            }

            const forms = selectedCheckboxes.map(function (checkbox) {
                const row = checkbox.closest(".sent-mails-item");
                return row?.querySelector(".sent-mails-delete-form");
            });

            if (forms.some(form => !form)) {
                return;
            }

            openDeleteModal(forms);
        });
    }

    /* CANCEL DELETE */
    sentDeleteCancel.addEventListener("click", closeDeleteModal);

    /* CLOSE ON BACKDROP */
    sentDeleteModal.addEventListener("click", function (event) {
        if (event.target === sentDeleteModal) {
            closeDeleteModal();
        }
    });

    /* CLOSE ON ESCAPE */
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeDeleteModal();
        }
    });

    /* CONFIRM DELETE */
    sentDeleteConfirm.addEventListener("click", async function () {
        if (isDeleting || !pendingDeleteForms.length) {
            return;
        }

        isDeleting                    = true;
        sentDeleteConfirm.disabled    = true;
        sentDeleteConfirm.textContent = "Siliniyor...";

        try {
            for (const form of pendingDeleteForms) {
                const response = await fetch(form.action, {
                    method: "POST",
                    body: new FormData(form),
                    credentials: "same-origin"
                });

                if (!response.ok) {
                    throw new Error("Mesaj silinemedi.");
                }
            }

            window.location.reload();
        } catch (error) {
            sentDeleteText.textContent = "İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.";
        } finally {
            isDeleting                    = false;
            sentDeleteConfirm.disabled    = false;
            sentDeleteConfirm.textContent = "Sil";
        }
    });

    /* BULK CATEGORY */
    if (bulkCategory) {
        bulkCategory.addEventListener("change", async function () {
            const categoryValue = this.value;
            const selected      = getSelectedCheckboxes();

            if (!categoryValue) {
                return;
            }

            if (selected.length === 0) {
                this.value = "";
                return;
            }

            const formData = new FormData();

            selected.forEach(function (checkbox) {
                formData.append("messageIds", checkbox.value);
            });

            if (categoryValue !== "remove") {
                formData.append("categoryId", categoryValue);
            }

            const token = document.querySelector('input[name="__RequestVerificationToken"]')?.value;

            if (token) {
                formData.append("__RequestVerificationToken", token);
            }

            this.disabled = true;

            try {
                const response = await fetch("/Message/AssignCategoryBulk", {
                    method: "POST",
                    body: formData,
                    credentials: "same-origin"
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`HTTP ${response.status}: ${errorText}`);
                }

                const result = await response.json();

                if (!result.success) {
                    throw new Error("Kategori güncellenemedi.");
                }

                window.location.reload();
            }
            catch (error) {
                console.error("BULK CATEGORY ERROR:", error);
                this.value = "";
            }
            finally {
                this.disabled = false;
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

        /* CATEGORY */
        if (bulkCategory) {
            bulkCategory.disabled = !hasSelection;

            if (!hasSelection) {
                bulkCategory.value = "";
            }
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
            bulkImportantButton.classList.remove("active");
            return;
        }

        const allImportant = selectedCheckboxes.every(function (checkbox) {
            const row = checkbox.closest(".sent-mails-item");

            if (!row) {
                return false;
            }

            const button = row.querySelector(".sent-mails-important-button");

            return (button && button.classList.contains("selected"));
        });

        bulkImportantButton.classList.toggle("active", allImportant);
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

    /* SAVE IMPORTANT */
    async function saveImportant(button, isImportant) {
        const id    = Number(button.dataset.id);
        const token = document.querySelector('input[name="__RequestVerificationToken"]')?.value;

        if (!id || !token) {
            throw new Error("Mesaj ID veya güvenlik tokenı bulunamadı.");
        }

        const formData = new URLSearchParams();
        formData.append("id", id);
        formData.append("__RequestVerificationToken", token);

        const response = await fetch("/Message/ToggleImportant", {
            method: "POST",
            body: formData,
            credentials: "same-origin"
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const icon = button.querySelector(".material-symbols-outlined");

        button.classList.toggle("selected", data.isImportant);

        if (icon) {
            icon.textContent = data.isImportant ? "star" : "star_border";
        }

        updateBulkImportantState();
        return data;
    }
});