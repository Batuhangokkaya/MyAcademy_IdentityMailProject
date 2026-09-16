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

/* DRAFT PAGE SELECTION */
document.addEventListener("DOMContentLoaded", function () {
    const selectAll    = document.getElementById("selectAllDrafts");
    const deleteButton = document.getElementById("deleteSelectedDrafts");

    function getCheckboxes() {
        return document.querySelectorAll(".draft-checkbox");
    }

    function updateSelection() {
        const checkboxes = getCheckboxes();
        const checked    = document.querySelectorAll(".draft-checkbox:checked");

        if (deleteButton) {
            deleteButton.disabled = checked.length === 0;
        }

        if (selectAll) {
            selectAll.checked       = checkboxes.length > 0 && checked.length === checkboxes.length;
            selectAll.indeterminate = checked.length > 0 && checked.length < checkboxes.length;
        }
    }

    if (selectAll) {
        selectAll.addEventListener("change", function () {
            getCheckboxes().forEach(function (checkbox) {
                checkbox.checked = selectAll.checked;
            });

            updateSelection();
        });
    }

    getCheckboxes().forEach(function (checkbox) {
        checkbox.addEventListener("change", function () {
            updateSelection();
        });
    });

    if (deleteButton) {
        deleteButton.addEventListener("click", async function () {
            const selectedIds = Array.from(document.querySelectorAll(".draft-checkbox:checked"))
                .map(function (checkbox) {
                    return parseInt(checkbox.value);
                });

            if (selectedIds.length === 0) {
                return;
            }

            try {
                const response = await fetch("/Message/DeleteDrafts", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(selectedIds)
                });

                if (!response.ok) {
                    console.error("Taslaklar silinemedi.");
                    return;
                }

                const result = await response.json();

                if (result.success) {
                    location.reload();
                }
            }
            catch (error) {
                console.error("Taslak silme hatası:", error);
            }
        });
    }

    updateSelection();
});

async function deleteDraft(id) {
    try {
        const response = await fetch(`/Message/DeleteDraft?id=${id}`, {
            method: "POST"
        });

        if (!response.ok) {
            console.error("Taslak silinemedi.");
            return;
        }

        const result = await response.json();

        if (result.success) {
            location.reload();
        }
    }
    catch (error) {
        console.error("Taslak silme hatası:", error);
    }
}