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

/* TRASH SELECTION AND FILTER */
document.addEventListener("DOMContentLoaded", function () {
    const selectAll     = document.getElementById("trashSelectAll");
    const restoreButton = document.getElementById("trashRestoreButton");
    const filterButton  = document.getElementById("trashFilterButton");
    const filterMenu    = document.getElementById("trashFilterMenu");
    const filterText    = document.getElementById("trashFilterText");
    const filterOptions = document.querySelectorAll(".trash-filter-option");
    const rows          = document.querySelectorAll(".trash-row");
    const checkboxes    = document.querySelectorAll(".trash-mail-checkbox");

    /* UPDATE SELECTION */
    function updateSelection() {
        const visibleCheckboxes = Array.from(checkboxes).filter(function (checkbox) {
            const row = checkbox.closest(".trash-row");
            return row.style.display !== "none";
        });

        const selectedCheckboxes = visibleCheckboxes.filter(function (checkbox) {
            return checkbox.checked;
        });

        checkboxes.forEach(function (checkbox) {
            const row = checkbox.closest(".trash-row");
            row.classList.toggle("selected-mail", checkbox.checked);
        });

        restoreButton.disabled  = selectedCheckboxes.length === 0;
        selectAll.checked       = visibleCheckboxes.length > 0 && selectedCheckboxes.length === visibleCheckboxes.length;
        selectAll.indeterminate = selectedCheckboxes.length > 0 && selectedCheckboxes.length < visibleCheckboxes.length;
    }

    /* MESSAGE CHECKBOX */
    checkboxes.forEach(function (checkbox) {
        checkbox.addEventListener("click", function (event) {
            event.stopPropagation();
        });

        checkbox.addEventListener("change", function () {
            updateSelection();
        });
    });

    /* SELECT ALL */
    selectAll.addEventListener("change", function () {
        checkboxes.forEach(function (checkbox) {

            const row = checkbox.closest(".trash-row");

            if (row.style.display !== "none") {
                checkbox.checked = selectAll.checked;
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
    filterOptions.forEach(function (option) {
        option.addEventListener("click", function (event) {
            event.stopPropagation();

            const selectedFilter = option.dataset.filter;

            filterOptions.forEach(function (item) {
                item.classList.remove("active");
            });

            option.classList.add("active");

            filterText.textContent = option.textContent.trim();

            rows.forEach(function (row) {
                const rowType = row.dataset.type;

                if (
                    selectedFilter === "all" ||
                    rowType === selectedFilter
                ) {
                    row.style.display = "flex";
                }
                else {
                    row.style.display = "none";
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

    updateSelection();
});