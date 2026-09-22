/* SAVE DRAFT */
async function saveDraft() {
    const receiverMail = document.getElementById("ReceiverMail").value;
    const subject      = document.getElementById("Subject").value;
    const body         = document.getElementById("Body").value;

    const formData = new FormData();

    formData.append("ReceiverMail", receiverMail);
    formData.append("Subject", subject);
    formData.append("Body", body);

    try {
        const response = await fetch("/Message/SaveDraft", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            console.log("HTTP Hatası:", response.status);
            return;
        }

        const result = await response.json();

        if (result.success) {
            document.getElementById("compose-window").classList.add("hidden");
            window.location.reload();
        }
    }
    catch (error) {
        console.error("Taslak kaydetme hatası:", error);
    }
}

/* OPEN DRAFT */
async function openDraft(id) {
    const response = await fetch(`/Message/EditDraft?id=${id}`);

    if (!response.ok) {
        console.error("Taslak bulunamadı.");
        return;
    }

    const draft = await response.json();

    document.getElementById("DraftID").value      = draft.id;
    document.getElementById("ReceiverMail").value = draft.receiverMail;
    document.getElementById("Subject").value      = draft.subject;
    document.getElementById("Body").value         = draft.body;

    document.getElementById("compose-window").classList.remove("hidden");
}

/* DRAFT SELECTION AND DELETE MODAL */
document.addEventListener("DOMContentLoaded", function () {
    const selectAll     = document.getElementById("selectAllDrafts");
    const deleteButton  = document.getElementById("deleteSelectedDrafts");
    const modal         = document.getElementById("draftsDeleteModal");
    const modalTitle    = document.getElementById("draftsModalTitle");
    const modalText     = document.getElementById("draftsModalText");
    const modalError    = document.getElementById("draftsModalError");
    const cancelButton  = document.getElementById("draftsModalCancel");
    const confirmButton = document.getElementById("draftsModalConfirm");

    let pendingForms = [];
    let isDeleting = false;
    let previousFocus = null;

    /* GET CHECKBOXES */
    function getCheckboxes() {
        return Array.from(document.querySelectorAll(".draft-checkbox"));
    }

    /* GET SELECTED CHECKBOXES */
    function getSelectedCheckboxes() {
        return getCheckboxes().filter(checkbox => checkbox.checked);
    }

    /* UPDATE SELECTION */
    function updateDraftSelection() {
        const checkboxes = getCheckboxes();
        const checked = getSelectedCheckboxes();

        if (deleteButton) {
            deleteButton.disabled = checked.length === 0;
        }

        if (selectAll) {
            selectAll.checked = checkboxes.length > 0 && checked.length === checkboxes.length;
            selectAll.indeterminate = checked.length > 0 && checked.length < checkboxes.length;
        }
    }

    /* SELECT ALL */
    if (selectAll) {
        selectAll.addEventListener("change", function () {
            getCheckboxes().forEach(function (checkbox) {
                checkbox.checked = selectAll.checked;
            });

            updateDraftSelection();
        });
    }

    /* SINGLE CHECKBOX */
    getCheckboxes().forEach(function (checkbox) {
        checkbox.addEventListener("change", updateDraftSelection);
    });

    /* OPEN DELETE MODAL */
    function openDeleteModal(forms) {
        if (!modal || isDeleting || forms.length === 0) {
            return;
        }

        pendingForms  = forms;
        previousFocus = document.activeElement;

        const count = forms.length;

        modalTitle.textContent = count === 1 ? "Taslağı Sil" : "Seçilen Taslakları Sil";
        modalText.textContent = count === 1 ? "Bu taslağı silmek istediğinize emin misiniz? Taslak listenizden kaldırılacak." : `${count} taslağı silmek istediğinize emin misiniz? Seçilen taslaklar listenizden kaldırılacak.`;

        modalError.hidden      = true;
        modalError.textContent = "";

        modal.classList.add("show");
        modal.setAttribute("aria-hidden", "false");

        confirmButton.focus();
    }

    /* CLOSE DELETE MODAL */
    function closeDeleteModal() {
        if (isDeleting) {
            return;
        }

        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");

        pendingForms = [];

        if (previousFocus && previousFocus.isConnected) {
            previousFocus.focus();
        }
    }

    /* SINGLE DELETE */
    document.querySelectorAll(".drafts-delete-form")
        .forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                event.stopPropagation();

                openDeleteModal([form]);
            });
        });

    /* BULK DELETE */
    if (deleteButton) {
        deleteButton.addEventListener("click", function () {
            const forms = getSelectedCheckboxes()
                .map(checkbox => checkbox.closest(".drafts-row")?.querySelector(".drafts-delete-form"))
                .filter(Boolean);

            openDeleteModal(forms);
        });
    }

    /* CANCEL DELETE */
    cancelButton.addEventListener("click", closeDeleteModal);

    /* CLOSE ON BACKDROP */
    modal.addEventListener("click", function (event) {
        if (event.target === modal) {
            closeDeleteModal();
        }
    });

    /* CLOSE ON ESCAPE */
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && modal.classList.contains("show")) {
            closeDeleteModal();
        }
    });

    /* CONFIRM DELETE */
    confirmButton.addEventListener("click", async function () {
        if (isDeleting || pendingForms.length === 0) {
            return;
        }

        isDeleting                = true;
        confirmButton.disabled    = true;
        cancelButton.disabled     = true;
        confirmButton.textContent = "Siliniyor...";

        try {
            for (const form of pendingForms) {
                const response = await fetch(form.action, {
                    method: "POST",
                    body: new FormData(form),
                    credentials: "same-origin"
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
            }

            window.location.reload();
        }
        catch (error) {
            modalError.textContent = "Taslaklar silinirken bir hata oluştu. Sayfayı yenileyip tekrar deneyin.";
            modalError.hidden      = false;

            isDeleting                = false;
            confirmButton.disabled    = false;
            cancelButton.disabled     = false;
            confirmButton.textContent = "Sil";
        }
    });

    updateDraftSelection();
});