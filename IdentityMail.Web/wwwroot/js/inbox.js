document.addEventListener("DOMContentLoaded", function () {
    const selectAll     = document.getElementById("selectAllCheckbox");
    const bulkImportant = document.getElementById("bulkImportantButton");
    const bulkDelete    = document.getElementById("bulkDeleteButton");
    const bulkCategory  = document.getElementById("bulkCategorySelect");


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

        return (button.dataset.important?.toLowerCase() === "true" || button.classList.contains("selected"));
    }

    /* SET IMPORTANT UI */
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

    /* UPDATE TOOLBAR */
    function updateBulkActions() {
        const checkboxes = [...getCheckboxes()];
        const selected = [...getSelectedCheckboxes()];

        const selectedCount = selected.length;
        const totalCount = checkboxes.length;

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
        bulkCategory.disabled  = selectedCount === 0;

        /*
            SEÇİM YOKSA CATEGORY SELECT
            TEKRAR BAŞLANGIÇ DEĞERİNE DÖNSÜN
        */
        if (selectedCount === 0) {
            bulkCategory.value = "";
        }

        /* SELECT ALL */
        selectAll.checked       = totalCount > 0 && selectedCount === totalCount;
        selectAll.indeterminate = selectedCount > 0 && selectedCount < totalCount;

        /*
            TOP STAR

            TÜM SEÇİLENLER ÖNEMLİYSE:
            YILDIZ SARI + DOLU

            ARALARINDA ÖNEMLİ OLMAYAN VARSA:
            NORMAL YILDIZ
        */
        const allImportant = selectedCount > 0 &&
            selected.every(function (checkbox) {
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
    });

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
                return;
            }

            const data = await response.json();

            setImportantUI(button, data.isImportant);

            updateBulkActions();
        };

    /* BULK STAR */
    bulkImportant.addEventListener("click",
        async function () {
            const selected = [...getSelectedCheckboxes()];

            if (selected.length === 0) {
                return;
            }


            /*
                TOP STAR SARIYSA:
                YILDIZLARI KALDIR

                SARI DEĞİLSE:
                ÖNEMLİ YAP
            */
            const targetImportant = !bulkImportant.classList.contains("active");

            for (const checkbox of selected) {
                const button           = getImportantButton(checkbox);
                const currentImportant = isImportant(button);

                /*
                    ZATEN İSTENEN DURUMDAYSA
                    SERVER'A TEKRAR İSTEK ATMA
                */
                if (currentImportant === targetImportant) {
                    continue;
                }

                const id = checkbox.value;

                const response = await fetch(`/Message/ToggleImportant?id=${id}`,
                    {
                        method: "POST"
                    }
                );

                if (!response.ok) {
                    continue;
                }

                const data = await response.json();

                setImportantUI(button, data.isImportant);
            }

            updateBulkActions();
        }
    );

    /* BULK CATEGORY */
    bulkCategory.addEventListener("change",
        async function () {
            const categoryId = this.value;

            /* KATEGORİ SEÇİLMEDİYSE */
            if (!categoryId) {
                return;
            }

            const selected = [...getSelectedCheckboxes()];

            /* MAİL SEÇİLİ DEĞİLSE */
            if (selected.length === 0) {
                this.value = "";

                return;
            }

            const formData = new FormData();

            /* CATEGORY ID */
            formData.append("categoryId", categoryId);

            /* SELECTED MESSAGE IDS */
            selected.forEach(function (checkbox) {
                formData.append("messageIds", checkbox.value);
            });

            try {
                const response = await fetch("/Message/AssignCategoryBulk", {
                        method: "POST",
                        body: formData
                    }
                );

                if (!response.ok) {
                    throw new Error("Kategori atama işlemi başarısız.");
                }

                /*
                    CATEGORY BADGE'LERİNİN
                    GÜNCELLENMESİ İÇİN
                    SAYFAYI YENİLE
                */
                window.location.reload();
            }
            catch (error) {
                alert("Kategori atanırken bir hata oluştu.");
                bulkCategory.value = "";
            }
        }
    );

    /* INBOX DELETE MODAL */
    const deleteModal   = document.getElementById("inboxDeleteModal");
    const deleteTitle   = document.getElementById("inboxDeleteTitle");
    const deleteText    = document.getElementById("inboxDeleteText");
    const deleteCancel  = document.getElementById("inboxDeleteCancel");
    const deleteConfirm = document.getElementById("inboxDeleteConfirm");

    let pendingDeleteForms = [];
    let isDeleting = false;

    /* MODALI AÇ */
    function openDeleteModal(forms) {
        if (isDeleting || forms.length === 0) {
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

    /* MODALI KAPAT */
    function closeDeleteModal() {
        if (isDeleting) {
            return;
        }

        deleteModal.classList.remove("is-open");
        deleteModal.setAttribute("aria-hidden", "true");

        pendingDeleteForms = [];
    }

    /* TEKLİ SİLME */
    document.querySelectorAll(".single-delete-form").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            openDeleteModal([form]);
        });
    });

    /* TOPLU SİLME */
    bulkDelete.addEventListener("click", function () {
        const selected =[...getSelectedCheckboxes()];
        const forms = selected.map(checkbox =>checkbox.closest(".mail-item")?.querySelector(".single-delete-form")).filter(Boolean);

        openDeleteModal(forms);
    });

    /* VAZGEÇ */
    deleteCancel.addEventListener("click", closeDeleteModal);

    /* MODAL DIŞINA TIKLAYINCA KAPAT */
    deleteModal.addEventListener("click", function (event) {
        if (event.target === deleteModal) {
            closeDeleteModal();
        }
    });

    /* ESC İLE KAPAT */
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && deleteModal.classList.contains("is-open")) {
            closeDeleteModal();
        }
    });

    /* SİLMEYİ ONAYLA */
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
                // Mevcut POST formunu kullanıyoruz.
                // Anti-forgery token da FormData'ya dahil edilir.
                const response = await fetch(form.action, {
                    method: "POST",
                    body: new FormData(form),
                    credentials: "same-origin"
                });

                if (!response.ok) {
                    throw new Error("Silme isteği başarısız.");
                }

                form.closest(".mail-item")?.remove();
            } catch (error) {
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

    /* FIRST STATUS */
    updateBulkActions();
});