document.addEventListener("DOMContentLoaded", function () {
    /* ELEMENTS */
    const selectAll     = document.getElementById("selectAllCheckbox");
    const bulkImportant = document.getElementById("bulkImportantButton");
    const bulkDelete    = document.getElementById("bulkDeleteButton");
    const bulkCategory  = document.getElementById("bulkCategorySelect");

    if (!selectAll || !bulkImportant || !bulkDelete) {
        console.error("Inbox controls not found.");
        return;
    }

    /* HELPER FUNCTIONS */
    function getCheckboxes() {
        return document.querySelectorAll(".mail-checkbox");
    }

    function getSelectedCheckboxes() {
        return document.querySelectorAll(".mail-checkbox:checked");
    }

    function getImportantButton(checkbox) {
        const mailItem = checkbox.closest(".mail-item");
        return mailItem?.querySelector(".important-button") ?? null;
    }

    function getAntiForgeryToken() {
        return document.querySelector('input[name="__RequestVerificationToken"]')?.value;
    }

    /* IMPORTANT STATE */
    function isImportant(button) {
        return button?.dataset.important === "true";
    }

    /* UPDATE IMPORTANT UI */
    function setImportantUI(button, important) {
        if (!button) {
            return;
        }

        button.dataset.important = important ? "true" : "false";
        button.classList.toggle("selected", important);

        const icon = button.querySelector(".material-symbols-outlined");

        if (icon) {
            icon.textContent = important ? "star" : "star_border";
        }
    }

    /* IMPORTANT REQUEST */
    async function sendToggleImportant(id) {
        const token = getAntiForgeryToken();

        const response = await fetch(`/Message/ToggleImportant?id=${encodeURIComponent(id)}`,
        {
            method: "POST",
            credentials: "same-origin",
            headers: token ? { "RequestVerificationToken": token } : {}
        });

        if (!response.ok) {
            throw new Error(`Important request failed: ${response.status}`);
        }

        const data = await response.json();

        if (typeof data.isImportant !== "boolean") {
            throw new Error("Invalid important response.");
        }

        return data.isImportant;
    }

    /* UPDATE TOOLBAR */
    function updateBulkActions() {
        const checkboxes    = [...getCheckboxes()];
        const selected      = [...getSelectedCheckboxes()];
        const selectedCount = selected.length;
        const totalCount    = checkboxes.length;

        /* SELECTED ROWS */
        checkboxes.forEach(function (checkbox) {
            const mailItem = checkbox.closest(".mail-item");
            mailItem?.classList.toggle("selected-mail", checkbox.checked);
        });

        /* BUTTON STATUS */
        bulkImportant.disabled = selectedCount === 0;
        bulkDelete.disabled    = selectedCount === 0;

        if (bulkCategory) {
            bulkCategory.disabled = selectedCount === 0;

            if (selectedCount === 0) {
                bulkCategory.value = "";
            }
        }

        /* SELECT ALL STATUS */
        selectAll.checked       = totalCount > 0 && selectedCount === totalCount;
        selectAll.indeterminate = selectedCount > 0 && selectedCount < totalCount;

        /* BULK IMPORTANT STATUS */
        const allImportant = selectedCount > 0 && selected.every(function (checkbox) {
            return isImportant(
                getImportantButton(checkbox)
            );
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
    });

    /* INDIVIDUAL SELECTION */
    getCheckboxes().forEach(function (checkbox) {
        checkbox.addEventListener("change", updateBulkActions);
    });

    /* SINGLE IMPORTANT */
    window.toggleImportant = async function (event, id, button) {
        event.preventDefault();
        event.stopPropagation();

        if (button.disabled) {
            return;
        }

        button.disabled = true;

        try {
            const important = await sendToggleImportant(id);
            setImportantUI(button, important);
        }
        catch (error) {
            console.error("Single important error:", error);
        }
        finally {
            button.disabled = false;
            updateBulkActions();
        }
    };

    /* BULK IMPORTANT */
    bulkImportant.addEventListener("click", async function () {
        const selected = [...getSelectedCheckboxes()];

        if (selected.length === 0 || bulkImportant.disabled) {
            return;
        }

        const allImportant = selected.every(function (checkbox) {
            return isImportant(getImportantButton(checkbox));
        });

        const targetImportant = !allImportant;

        bulkImportant.disabled = true;

        try {
            for (const checkbox of selected) {
                const button = getImportantButton(checkbox);

                if (!button) {
                    continue;
                }

                const currentImportant = isImportant(button);

                if (currentImportant === targetImportant) {
                    continue;
                }

                const id = checkbox.value;

                try {
                    const important = await sendToggleImportant(id);
                    setImportantUI(button, important);
                }
                catch (error) {
                    console.error("Bulk important error:", id, error);
                }
            }
        }
        finally {
            updateBulkActions();
        }
    });

    /* BULK CATEGORY */
    if (bulkCategory) {
        bulkCategory.addEventListener("change", async function () {
            const selectedCategory = this.value;

            /* CHECK CATEGORY */
            if (!selectedCategory) {
                return;
            }

            const selected = [...getSelectedCheckboxes()];

            /* CHECK SELECTED MESSAGES */
            if (selected.length === 0) {
                this.value = "";
                return;
            }

            const formData = new FormData();

            /* CATEGORY ID */
            if (selectedCategory === "remove") {
                formData.append("categoryId", "");
            }
            else {
                formData.append("categoryId", selectedCategory);
            }

            /* MESSAGE IDS */
            selected.forEach(function (checkbox) {
                formData.append("messageIds", checkbox.value);
            });

            /* DISABLE CATEGORY */
            bulkCategory.disabled = true;

            try {
                /* SEND REQUEST */
                const response = await fetch("/Message/AssignCategoryBulk", {
                    method: "POST",
                    body: formData,
                    credentials: "same-origin"
                });

                /* CHECK RESPONSE */
                if (!response.ok) {
                    throw new Error(`Category request failed: ${response.status}`);
                }

                /* REFRESH PAGE */
                window.location.reload();
            }
            catch (error) {
                console.error("Bulk category error:", error);
                alert("Kategori işlemi sırasında bir hata oluştu.");

                bulkCategory.value = "";

                updateBulkActions();
            }
        });
    }

    /* DELETE MODAL ELEMENTS */
    const deleteModal      = document.getElementById("inboxDeleteModal");
    const deleteTitle      = document.getElementById("inboxDeleteTitle");
    const deleteText       = document.getElementById("inboxDeleteText");
    const deleteCancel     = document.getElementById("inboxDeleteCancel");
    const deleteConfirm    = document.getElementById("inboxDeleteConfirm");
    let pendingDeleteForms = [];
    let isDeleting         = false;

    /* OPEN DELETE MODAL */
    function openDeleteModal(forms) {
        if (!deleteModal || isDeleting || forms.length === 0) {
            return;
        }

        pendingDeleteForms = forms;

        const count = forms.length;

        deleteTitle.textContent = count === 1 ? "Mesajı Sil" : "Seçilen Mesajları Sil";
        deleteText.textContent  = count === 1 ? "Bu mesaj Çöp Kutusu'na taşınacak. Devam etmek istiyor musun?" : `${count} mesaj Çöp Kutusu'na taşınacak. Devam etmek istiyor musun?`;

        deleteModal.classList.add("is-open");
        deleteModal.setAttribute("aria-hidden", "false");

        deleteCancel.focus();
    }

    /* CLOSE DELETE MODAL */
    function closeDeleteModal() {
        if (isDeleting || !deleteModal) {
            return;
        }

        deleteModal.classList.remove("is-open");
        deleteModal.setAttribute("aria-hidden", "true");

        pendingDeleteForms = [];
    }

    /* SINGLE DELETE */
    document.querySelectorAll(".single-delete-form").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            openDeleteModal([form]);
        });
    });

    /* BULK DELETE */
    bulkDelete.addEventListener("click", function () {
        const selected = [...getSelectedCheckboxes()];
        const forms    = selected
            .map(function (checkbox) {
                return checkbox.closest(".mail-item") ?.querySelector(".single-delete-form");
            })
            .filter(Boolean);

        openDeleteModal(forms);
    });

    /* DELETE MODAL EVENTS */
    if (deleteModal && deleteCancel && deleteConfirm) {
        deleteCancel.addEventListener("click", closeDeleteModal);

        deleteModal.addEventListener("click", function (event) {
            if (event.target === deleteModal) {
                closeDeleteModal();
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape" && deleteModal.classList.contains("is-open")) {
                closeDeleteModal();
            }
        });

        /* CONFIRM DELETE */
        deleteConfirm.addEventListener("click", async function () {
            if (isDeleting || pendingDeleteForms.length === 0) {
                return;
            }

            isDeleting                = true;
            deleteConfirm.disabled    = true;
            deleteCancel.disabled     = true;
            deleteConfirm.textContent = "Siliniyor...";

            const failedForms = [];

            for (const form of pendingDeleteForms) {
                try {
                    const formData = new FormData(form);
                    const token    = getAntiForgeryToken();

                    if (token && !formData.has("__RequestVerificationToken")) {
                        formData.append("__RequestVerificationToken", token);
                    }

                    const response = await fetch(form.action, {
                        method: "POST",
                        body: formData,
                        credentials: "same-origin"
                    });

                    if (!response.ok) {
                        throw new Error(`Delete request failed: ${response.status}`);
                    }

                    form.closest(".mail-item")?.remove();
                }
                catch (error) {
                    console.error("Delete error:", error);
                    failedForms.push(form);
                }
            }

            isDeleting                = false;
            deleteConfirm.disabled    = false;
            deleteCancel.disabled     = false;
            deleteConfirm.textContent = "Sil";

            updateBulkActions();

            if (failedForms.length > 0) {
                pendingDeleteForms     = failedForms;
                deleteText.textContent = `${failedForms.length} mesaj silinemedi. Tekrar deneyebilirsin.`;
                return;
            }

            closeDeleteModal();
        });
    }

    /* INITIAL STATE */
    updateBulkActions();
});