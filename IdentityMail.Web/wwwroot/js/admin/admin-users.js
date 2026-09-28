document.addEventListener("DOMContentLoaded", () => {
    /* ELEMENTS */
    const detailsModal     = document.getElementById("adminUserDetailsModal");
    const statusModal      = document.getElementById("adminUserStatusModal");
    const statusConfirm    = document.getElementById("adminStatusConfirm");
    const statusCancel     = document.getElementById("adminStatusCancel");
    const antiforgeryToken = document.querySelector('#adminAntiforgeryForm input[name="__RequestVerificationToken"]');
    let selectedUserId     = null;

    /* OPEN MODAL */
    function openModal(modal) {
        if (!modal) {
            return;
        }

        modal.classList.add("show");
        modal.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";
    }

    /* CLOSE MODAL */
    function closeModal(modal) {
        if (!modal) {
            return;
        }

        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");

        if (!document.querySelector(".admin-modal.show")) {
            document.body.style.overflow = "";
        }
    }

    /* CLOSE DROPDOWNS */
    function closeDropdowns() {
        document.querySelectorAll(".admin-user-menu-wrapper.open").forEach(menu => {
            menu.classList.remove("open");

            const toggle = menu.querySelector(".admin-user-menu-toggle");

            if (toggle) {
                toggle.setAttribute("aria-expanded", "false");
            }
        });
    }

    /* TOGGLE USER DROPDOWN */
    document.querySelectorAll(".admin-user-menu-toggle").forEach(button => {
        button.addEventListener("click", event => {
            event.stopPropagation();

            const wrapper = button.closest(".admin-user-menu-wrapper");
            const wasOpen = wrapper.classList.contains("open");

            closeDropdowns();

            if (!wasOpen) {
                wrapper.classList.add("open");
                button.setAttribute("aria-expanded", "true");
            }
        });
    });

    /* CLOSE DROPDOWN ON OUTSIDE CLICK */
    document.addEventListener("click", event => {
        if (!event.target.closest(".admin-user-menu-wrapper")) {
            closeDropdowns();
        }
    });

    /* OPEN USER DETAILS */
    async function openUserDetails(userId) {
        if (!detailsModal || !userId) {
            return;
        }

        closeDropdowns();

        try {
            const response = await fetch(`/AdminUser/Details/${encodeURIComponent(userId)}`,{
                method: "GET",
                headers: {
                    "Accept": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error("Kullanıcı bilgileri alınamadı.");
            }

            const user      = await response.json();
            const firstName = user.firstName || "";
            const lastName  = user.lastName || "";
            const fullName  = `${firstName} ${lastName}`.trim() || "İsimsiz Kullanıcı";
            const initials  = `${firstName.charAt(0)}${lastName.charAt(0)}`.toLocaleUpperCase("tr-TR") || "?";

            /* PROFILE */
            document.getElementById("adminDetailsFullName").textContent = fullName;
            document.getElementById("adminDetailsEmail").textContent    = user.email || "E-posta yok";

            /* AVATAR */
            const avatar = document.getElementById("adminDetailsAvatar");

            avatar.replaceChildren();

            if (user.profileImageURL) {
                const image = document.createElement("img");
                image.src = user.profileImageURL;
                image.alt = fullName;

                avatar.appendChild(image);
            } else {
                avatar.textContent = initials;
            }

            /* ACCOUNT STATUS */
            const status = document.getElementById("adminDetailsStatus");

            status.replaceChildren();
            const badge = document.createElement("span");
            badge.className = user.isActive ? "admin-status-badge active" : "admin-status-badge passive";

            const dot = document.createElement("span");
            dot.className = "admin-status-dot";

            badge.appendChild(dot);
            badge.append(user.isActive ? "Aktif" : "Pasif");

            status.appendChild(badge);

            /* USER INFORMATION */
            document.getElementById("adminDetailsFirstName").textContent      = firstName || "Belirtilmemiş";
            document.getElementById("adminDetailsLastName").textContent       = lastName || "Belirtilmemiş";
            document.getElementById("adminDetailsUsername").textContent       = user.userName || "Belirtilmemiş";
            document.getElementById("adminDetailsEmailAddress").textContent   = user.email || "Belirtilmemiş";
            document.getElementById("adminDetailsEmailConfirmed").textContent = user.emailConfirmed ? "Doğrulandı" : "Doğrulanmadı";

            openModal(detailsModal);
        } catch (error) {
            console.error(error);
            alert("Kullanıcı detayları yüklenemedi.");
        }
    }

    /* DETAILS BUTTONS */
    document.querySelectorAll(".admin-user-details-button, .admin-user-detail-action").forEach(button => {
        button.addEventListener("click", () => {
            openUserDetails(button.dataset.userId);
        });
    });

    /* OPEN STATUS CONFIRMATION */
    document.querySelectorAll(".admin-user-status-action").forEach(button => {
        button.addEventListener("click", () => {
            closeDropdowns();

            selectedUserId = button.dataset.userId;

            const userName = button.dataset.userName || "Bu kullanıcı";
            const isActive = button.dataset.isActive === "true";

            document.getElementById("adminStatusUserId").value            = selectedUserId;
            document.getElementById("adminStatusTitle").textContent       = isActive ? "Kullanıcı Pasife Alınsın mı?" : "Kullanıcı Aktifleştirilsin mi?";
            document.getElementById("adminStatusDescription").textContent = isActive ? `${userName} adlı kullanıcıyı pasife almak istediğinize emin misiniz?` : `${userName} adlı kullanıcıyı aktifleştirmek istediğinize emin misiniz?`;
            document.getElementById("adminStatusIcon").textContent        = isActive ? "person_off" : "person_check";
            statusConfirm.textContent                                     = isActive ? "Pasife Al" : "Aktifleştir";
            statusConfirm.classList.toggle("danger", isActive);

            openModal(statusModal);
        });
    });

    /* CONFIRM STATUS CHANGE */
    statusConfirm?.addEventListener("click", async () => {
        if (!selectedUserId) {
            return;
        }

        if (!antiforgeryToken) {
            alert("Güvenlik doğrulaması bulunamadı.");
            return;
        }

        statusConfirm.disabled = true;

        try {
            const response = await fetch(`/AdminUser/ToggleStatus/${encodeURIComponent(selectedUserId)}`, {
                method: "POST",
                headers: {
                    "RequestVerificationToken": antiforgeryToken.value,
                    "Accept": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error("Kullanıcı durumu değiştirilemedi.");
            }

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || "İşlem başarısız.");
            }

            closeModal(statusModal);

            /* REFRESH USER LIST AND STATISTICS */
            window.location.reload();

        } catch (error) {
            console.error(error);
            alert(error.message || "İşlem sırasında bir hata oluştu.");

        } finally {
            statusConfirm.disabled = false;
        }
    });

    /* CLOSE DETAILS MODAL */
    document.getElementById("adminDetailsClose")?.addEventListener("click", () => {
        closeModal(detailsModal);
    });

    document.getElementById("adminDetailsCancel")?.addEventListener("click", () => {
        closeModal(detailsModal);
    });

    /* CLOSE STATUS MODAL */
    statusCancel?.addEventListener("click", () => {
        closeModal(statusModal);
        selectedUserId = null;
    });

    /* CLOSE MODAL ON OVERLAY CLICK */
    [detailsModal, statusModal].forEach(modal => {
        modal?.addEventListener("click", event => {
            if (event.target === modal) {
                closeModal(modal);
                selectedUserId = null;
            }
        });
    });

    /* KEYBOARD ACTIONS */
    document.addEventListener("keydown", event => {
        if (event.key !== "Escape") {
            return;
        }

        closeDropdowns();

        closeModal(detailsModal);
        closeModal(statusModal);

        selectedUserId = null;
    });
});