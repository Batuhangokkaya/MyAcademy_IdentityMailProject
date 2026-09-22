/* MAIL SELECTION */
document.addEventListener("DOMContentLoaded", function () {
    const selectAll = document.getElementById("importantSelectAll");
    const bulkStar = document.getElementById("importantBulkStar");
    const bulkDelete = document.getElementById("importantBulkDelete");

    /* UPDATE SELECTION */
    function updateSelection() {
        const checkboxes = document.querySelectorAll(".important-mail-checkbox");
        const checked = document.querySelectorAll(".important-mail-checkbox:checked");

        checkboxes.forEach(checkbox => {
            const mailItem = checkbox.closest(".important-mail-item");

            if (mailItem) {
                mailItem.classList.toggle("selected-mail", checkbox.checked);
            }
        });

        if (bulkStar) {
            bulkStar.disabled = checked.length === 0;
        }

        if (bulkDelete) {
            bulkDelete.disabled = checked.length === 0;
        }

        if (selectAll) {
            selectAll.checked = checkboxes.length > 0 && checked.length === checkboxes.length;
            selectAll.indeterminate = checked.length > 0 && checked.length < checkboxes.length;

            const icon = selectAll.parentElement.querySelector(".material-symbols-outlined");

            if (icon) {
                if (selectAll.indeterminate) {
                    icon.textContent = "indeterminate_check_box";
                }
                else if (selectAll.checked) {
                    icon.textContent = "check_box";
                }
                else {
                    icon.textContent = "check_box_outline_blank";
                }
            }
        }
    }

    /* CHECKBOX EVENTS */
    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("important-mail-checkbox")) {
            event.stopPropagation();
        }
    });

    document.addEventListener("change", function (event) {
        if (event.target.classList.contains("important-mail-checkbox")) {
            updateSelection();
        }
    });

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

            const result = await Swal.fire({
                title: "Önem işareti kaldırılsın mı?",
                text: "Seçilen mesajlar Önemli Mesajlar listesinden çıkarılacak.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "Evet, kaldır",
                cancelButtonText: "Vazgeç"
            });

            if (!result.isConfirmed) {
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
            updateImportantCount();
        });
    }

    /* DELETE MODAL */
    const deleteModal   = document.getElementById("importantDeleteModal");
    const deleteTitle   = document.getElementById("importantDeleteTitle");
    const deleteText    = document.getElementById("importantDeleteText");
    const deleteError   = document.getElementById("importantDeleteError");
    const deleteCancel  = document.getElementById("importantDeleteCancel");
    const deleteConfirm = document.getElementById("importantDeleteConfirm");

    let pendingDeleteForms = [];
    let isDeleting         = false;
    let previousFocus      = null;

    /* OPEN DELETE MODAL */
    function openDeleteModal(forms) {
        if (isDeleting || forms.length === 0) {
            return;
        }

        pendingDeleteForms = forms;
        previousFocus      = document.activeElement;

        const count = forms.length;

        deleteTitle.textContent = count === 1 ? "Mesaj Silinsin mi?" : "Seçilen Mesajlar Silinsin mi?";
        deleteText.textContent  = count === 1 ? "Bu mesaj Çöp Kutusu'na taşınacak." : `${count} mesaj Çöp Kutusu'na taşınacak.`;
        deleteError.hidden        = true;
        deleteError.textContent   = "";
        deleteConfirm.textContent = "Sil";
        deleteConfirm.disabled = false;

        deleteModal.classList.add("show");
        deleteModal.setAttribute("aria-hidden", "false");

        deleteCancel.focus();
    }

    /* CLOSE DELETE MODAL */
    function closeDeleteModal() {
        if (isDeleting) {
            return;
        }

        deleteModal.classList.remove("show");
        deleteModal.setAttribute("aria-hidden", "true");

        pendingDeleteForms = [];

        if (previousFocus && previousFocus.isConnected) {
            previousFocus.focus();
        }
    }

    /* CANCEL DELETE */
    deleteCancel.addEventListener("click", closeDeleteModal);

    /* CLOSE ON BACKDROP */
    deleteModal.addEventListener("click", function (event) {
        if (event.target === deleteModal) {
            closeDeleteModal();
        }
    });

    /* CLOSE ON ESCAPE */
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && deleteModal.classList.contains("show")) {
            closeDeleteModal();
        }
    });

    /* SINGLE DELETE */
    document.querySelectorAll(".important-delete-form").forEach(form => {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            event.stopPropagation();

            openDeleteModal([form]);
        });
    });

    /* BULK DELETE */
    if (bulkDelete) {
        bulkDelete.addEventListener("click", function () {
            const selectedCheckboxes = document.querySelectorAll(".important-mail-checkbox:checked");

            if (selectedCheckboxes.length === 0) {
                return;
            }

            const forms = Array.from(selectedCheckboxes)
                .map(checkbox => checkbox.closest(".important-mail-item")?.querySelector(".important-delete-form"))
                .filter(Boolean);

            openDeleteModal(forms);
        });
    }

    /* CONFIRM DELETE */
    deleteConfirm.addEventListener("click", async function () {
        if (isDeleting || pendingDeleteForms.length === 0) {
            return;
        }

        isDeleting                = true;
        deleteConfirm.disabled    = true;
        deleteConfirm.textContent = "Siliniyor...";
        deleteError.hidden        = true;

        const failedForms = [];

        for (const form of pendingDeleteForms) {
            try {
                const response = await fetch(form.action, {
                    method: "POST",
                    body: new FormData(form),
                    credentials: "same-origin"
                });

                if (!response.ok) {
                    failedForms.push(form);
                    continue;
                }

                form.closest(".important-mail-item")?.remove();
            }
            catch (error) {
                failedForms.push(form);
            }
        }

        isDeleting = false;

        updateSelection();
        updateImportantCount();

        if (failedForms.length === 0) {
            closeDeleteModal();
            return;
        }

        pendingDeleteForms        = failedForms;
        deleteError.textContent   = `${failedForms.length} mesaj silinemedi. Tekrar deneyebilirsin.`;
        deleteError.hidden        = false;
        deleteConfirm.disabled    = false;
        deleteConfirm.textContent = "Tekrar Dene";
    });

    /* UPDATE COUNT */
    function updateImportantCount() {
        const count = document.querySelectorAll(".important-mail-item").length;
        const countElement = document.querySelector(".important-title-area p");

        if (countElement) {
            countElement.textContent = `${count} önemli mesaj`;
        }
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

        const count = document.querySelectorAll(".important-mail-item").length;
        const countElement = document.querySelector(".important-title-area p");

        if (countElement) {
            countElement.textContent = `${count} önemli mesaj`;
        }
    }
}