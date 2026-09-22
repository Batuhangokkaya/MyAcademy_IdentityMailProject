/* TRASH */
function showTrashWarning() {
    const modal = document.getElementById("trashModal");
    modal.classList.add("show");
}

function closeTrashWarning() {
    const modal = document.getElementById("trashModal");
    modal.classList.remove("show");
}

document.getElementById("trashModal").addEventListener("click", function (event) {
    if (event.target === this) {
        closeTrashWarning();
    }
});

/* TRASH */
document.addEventListener("DOMContentLoaded", function () {
    const page = document.querySelector(".trash-page");
    if (!page) {
        return;
    }
    const rows                 = Array.from(page.querySelectorAll(".trash-row"));
    const selectAll            = document.getElementById("trashSelectAll");
    const restoreButton        = document.getElementById("trashRestoreButton");
    const emptyButton          = document.getElementById("trashEmptyButton");
    const emptyText            = document.getElementById("trashEmptyText");
    const filterButton         = document.getElementById("trashFilterButton");
    const selectedDeleteButton = document.getElementById("trashSelectedDeleteButton");
    const filterMenu           = document.getElementById("trashFilterMenu");
    const filterText           = document.getElementById("trashFilterText");
    const filterOptions        = document.querySelectorAll(".trash-filter-option");
    const actionModal          = document.getElementById("trashActionModal");
    const actionTitle          = document.getElementById("trashActionTitle");
    const actionText           = document.getElementById("trashActionText");
    const actionCancel         = document.getElementById("trashActionCancel");
    const actionConfirm        = document.getElementById("trashActionConfirm");
    const warningModal         = document.getElementById("trashModal");
    const token                = document.querySelector('input[name="__RequestVerificationToken"]')?.value;

    let pendingAction = null;
    let pendingIds = [];
    let processing = false;

    /* GET CHECKBOX */
    function getCheckbox(row) {
        return row.querySelector(".trash-mail-checkbox");
    }

    /* GET VISIBLE ROWS */
    function getVisibleRows() {
        return rows.filter(row => row.style.display !== "none");
    }

    /* GET SELECTED IDS */
    function getSelectedIds() {
        return getVisibleRows().filter(row => getCheckbox(row)?.checked).map(row => Number(row.dataset.id));
    }

    /* UPDATE SELECTION */
    function updateSelection() {
        rows.forEach(row => {
            const checkbox = getCheckbox(row);
            row.classList.toggle("selected-mail", checkbox?.checked === true);
        });

        const visibleRows = getVisibleRows();
        const selectedIds = getSelectedIds();
        const allSelected = visibleRows.length > 0 && selectedIds.length === visibleRows.length;

        selectAll.checked             = allSelected;
        selectAll.indeterminate       = selectedIds.length > 0 && !allSelected;
        restoreButton.disabled        = selectedIds.length === 0;
        selectedDeleteButton.disabled = selectedIds.length === 0;
        emptyButton.disabled          = rows.length === 0;

        if (selectedIds.length > 0) {
            emptyText.textContent = `Seçilenleri Kaldır (${selectedIds.length})`;
        }
        else {
            emptyText.textContent = "Çöp Kutusunu Boşalt";
        }
    }

    /* MESSAGE CHECKBOX */
    rows.forEach(row => {
        const checkbox = getCheckbox(row);

        if (!checkbox) return;

        checkbox.addEventListener("click", function (event) {
            event.stopPropagation();
        });

        checkbox.addEventListener("change", updateSelection);
    });


    /* SELECT ALL */
    selectAll.addEventListener("change", function () {
        const checked = selectAll.checked;

        getVisibleRows().forEach(row => {
            const checkbox = getCheckbox(row);

            if (checkbox) {
                checkbox.checked = checked;
            }
        });

        updateSelection();
    });

    /* OPEN FILTER */
    filterButton.addEventListener("click", function (event) {
        event.stopPropagation();
        filterMenu.classList.toggle("show");
    });

    /* FILTER OPTIONS */
    filterOptions.forEach(option => {
        option.addEventListener("click", function (event) {
            event.stopPropagation();

            const filter = option.dataset.filter;

            filterOptions.forEach(item => {
                item.classList.remove("active");
            });

            option.classList.add("active");

            filterText.textContent = option.textContent.trim();

            rows.forEach(row => {
                const visible = filter === "all" || row.dataset.type === filter;

                row.style.display = visible ? "" : "none";

                // Filtre değişince önceki seçimleri temizle.
                const checkbox = getCheckbox(row);

                if (checkbox) {
                    checkbox.checked = false;
                }
            });

            filterMenu.classList.remove("show");

            updateSelection();
        });
    });

    /* CLOSE FILTER */
    document.addEventListener("click", function (event) {
        if (!event.target.closest(".trash-filter-wrapper")) {
            filterMenu.classList.remove("show");
        }
    });

    /* SEND REQUEST */
    async function sendRequest(url, ids = null) {
        if (!url || !token) {
            throw new Error("İşlem adresi veya güvenlik anahtarı eksik.");
        }

        const options = {
            method: "POST",
            headers: {
                "RequestVerificationToken": token
            }
        };

        if (ids !== null) {
            options.headers["Content-Type"] = "application/json";
            options.body = JSON.stringify(ids);
        }

        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error("İşlem gerçekleştirilemedi.");
        }

        return await response.json();
    }


    /* RESTORE MESSAGES */
    async function restoreMessages(ids) {
        if (processing || ids.length === 0) return;

        processing             = true;
        restoreButton.disabled = true;

        try {
            const result = await sendRequest(page.dataset.restoreUrl, ids);

            if (result.success) {
                window.location.reload();
            }
        }
        catch (error) {
            alert(error.message);
        }
        finally {
            processing = false;
            updateSelection();
        }
    }

    /* RESTORE SELECTED */
    restoreButton.addEventListener("click", function () {
        restoreMessages(getSelectedIds());
    });

    /* RESTORE SINGLE */
    page.querySelectorAll(".trash-single-restore").forEach(button => {
        button.addEventListener("click", function (event) {
            event.stopPropagation();

            const id = Number(button.dataset.id);

            if (Number.isInteger(id) && id > 0) {
                restoreMessages([id]);
            }

        });
    });

    /* OPEN CONFIRMATION */
    function openConfirmation(action, ids = []) {
        if (!actionModal || processing) return;

        if (action === "remove" && ids.length === 0) return;

        pendingAction = action;
        pendingIds    = ids;

        if (action === "empty") {
            actionTitle.textContent   = "Çöp Kutusunu Boşalt";
            actionText.textContent    = "Çöp kutunuzdaki bütün mesajlar kaldırılacak. Mesaj kayıtları veritabanında kalacak.";
            actionConfirm.textContent = "Çöp Kutusunu Boşalt";
        }
        else {
            actionTitle.textContent   = ids.length === 1 ? "Mesajı Çöp Kutusundan Kaldır" : "Seçilen Mesajları Kaldır";
            actionText.textContent    = `${ids.length} mesaj çöp kutunuzdan kaldırılacak.`;
            actionConfirm.textContent = "Kaldır";
        }

        actionModal.classList.add("show");
        actionModal.setAttribute("aria-hidden", "false");
        actionCancel.focus();
    }

    /* REMOVE SINGLE */
    page.querySelectorAll(".trash-delete-button").forEach(button => {
        button.addEventListener("click", function (event) {
            event.stopPropagation();

            const id = Number(button.dataset.id);

            if (Number.isInteger(id) && id > 0) {
                openConfirmation("remove", [id]);
            }

        });
    });

    /* DELETE SELECTED */
    selectedDeleteButton.addEventListener("click", function () {
        const ids = getSelectedIds();
        if (ids.length === 0) return;
        openConfirmation("remove", ids);
    });

    /* EMPTY TRASH */
    emptyButton.addEventListener("click", function () {
        openConfirmation("empty");
    });

    /* CLOSE CONFIRMATION */
    function closeConfirmation() {
        if (processing) return;

        actionModal.classList.remove("show");
        actionModal.setAttribute("aria-hidden", "true");

        pendingAction = null;
        pendingIds = [];
    }

    /* CONFIRM ACTION */
    actionConfirm.addEventListener("click", async function () {
        if (processing || !pendingAction) return;

        processing             = true;
        actionConfirm.disabled = true;

        try {
            const url    = pendingAction === "empty" ? page.dataset.emptyUrl : page.dataset.removeUrl;
            const ids    = pendingAction === "empty" ? null : pendingIds;
            const result = await sendRequest(url, ids);

            if (result.success) {
                window.location.reload();
            }
        }
        catch (error) {
            alert(error.message);
        }
        finally {
            processing = false;
            actionConfirm.disabled = false;
        }
    });

    /* CANCEL */
    actionCancel.addEventListener("click", closeConfirmation);

    /* CLOSE MODALS ON BACKDROP */
    actionModal.addEventListener("click", function (event) {
        if (event.target === actionModal) {
            closeConfirmation();
        }

    });

    warningModal?.addEventListener("click", function (event) {
        if (event.target === warningModal) {
            closeTrashWarning();
        }

    });

    /* INITIALIZE */
    updateSelection();
});

/* MESSAGE WARNING */
function showTrashWarning() {
    document.getElementById("trashModal")?.classList.add("show");
}

function closeTrashWarning() {
    document.getElementById("trashModal")?.classList.remove("show");
}