document.addEventListener("DOMContentLoaded", function () {
    /* ELEMENTS */
    const createModal       = document.getElementById("createRoleModal");
    const editModal         = document.getElementById("editRoleModal");
    const manageModal       = document.getElementById("manageRolesModal");
    const createButton      = document.getElementById("createRoleButton");
    const createFirstButton = document.getElementById("createFirstRoleButton");
    const manageButton      = document.getElementById("manageRolesButton");
    const createRoleName    = document.getElementById("createRoleName");
    const editRoleId        = document.getElementById("editRoleId");
    const editRoleName      = document.getElementById("editRoleName");
    const searchInput       = document.getElementById("roleUserSearch");
    const usersList         = document.getElementById("roleUsersList");
    const selectedPanel     = document.getElementById("selectedRoleUser");
    const selectedName      = document.getElementById("selectedRoleUserName");
    const selectedEmail     = document.getElementById("selectedRoleUserEmail");
    const currentRoles      = document.getElementById("selectedUserRoles");
    const backButton        = document.getElementById("backToRoleUsers");
    const roleSelect        = document.getElementById("assignRoleSelect");
    const assignButton      = document.getElementById("assignRoleButton");
    const messageBox        = document.getElementById("roleManageMessage");
    const token             = document.querySelector('input[name="__RequestVerificationToken"]')?.value;
    let activeModal         = null;
    let previousFocus       = null;
    let users               = [];
    let selectedUserId      = null;
    let isSaving            = false;

    /* OPEN MODAL */
    function openModal(modal) {
        if (!modal) {
            return;
        }

        if (activeModal) {
            closeModal(activeModal, false);
        }

        previousFocus = document.activeElement;
        activeModal   = modal;

        modal.classList.add("show");
        modal.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";

        const firstInput = modal.querySelector('input:not([type="hidden"])');

        if (firstInput) {
            firstInput.focus();
        }
    }

    /* CLOSE MODAL */
    function closeModal(modal, restoreFocus = true) {
        if (!modal) {
            return;
        }

        modal.classList.remove("show");
        modal.setAttribute("aria-hidden", "true");

        if (activeModal === modal) {
            activeModal = null;
        }

        if (!document.querySelector(".admin-role-modal.show")) {
            document.body.style.overflow = "";
        }

        if (restoreFocus && previousFocus && typeof previousFocus.focus === "function") {
            previousFocus.focus();
        }
    }

    /* CREATE ROLE */
    function openCreateModal() {
        if (createRoleName) {
            createRoleName.value = "";
            createRoleName.setCustomValidity("");
        }

        openModal(createModal);
    }

    createButton?.addEventListener("click", openCreateModal);
    createFirstButton?.addEventListener("click", openCreateModal);

    /* EDIT ROLE */
    document.querySelectorAll(".admin-role-edit-button").forEach(button => {
        button.addEventListener("click", function () {
            const roleId   = this.dataset.roleId;
            const roleName = this.dataset.roleName;

            if (editRoleId) {
                editRoleId.value = roleId || "";
            }

            if (editRoleName) {
                editRoleName.value = roleName || "";
                editRoleName.setCustomValidity("");
            }

            openModal(editModal);
        });
    });

    /* CLOSE BUTTONS */
    document.querySelectorAll("[data-close-modal]").forEach(button => {
        button.addEventListener("click", function () {
            const modalId = this.dataset.closeModal;
            const modal   = document.getElementById(modalId);

            closeModal(modal);
        });
    });

    /* CLOSE MODAL WHEN CLICKING OVERLAY */
    document.querySelectorAll(".admin-role-modal").forEach(modal => {
        modal.addEventListener("click", function (event) {
            if (event.target === modal) {
                closeModal(modal);
            }
        });
    });

    /* ESCAPE KEY */
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && activeModal) {
            closeModal(activeModal);
        }
    });

    /* VALIDATE ROLE NAME */
    document.querySelectorAll('.admin-role-modal form').forEach(form => {
        form.addEventListener("submit", function (event) {
            const input = form.querySelector('input[name="roleName"]');

            if (!input) {
                return;
            }

            input.value = input.value.trim();

            if (!input.value) {
                event.preventDefault();
                input.setCustomValidity("Lütfen bir rol adı girin.");
                input.reportValidity();
                input.focus();

                return;
            }

            input.setCustomValidity("");
        });
    });

    document.querySelectorAll('.admin-role-modal input[name="roleName"]').forEach(input => {
        input.addEventListener("input", function () {
            this.setCustomValidity("");
        });
    });

    /* SHOW MESSAGE */
    function showMessage(message, type = "success") {
        if (!messageBox) {
            return;
        }

        messageBox.textContent = message;
        messageBox.className   = "admin-role-manage-message " + type;
        messageBox.hidden      = false;
    }

    /* CLEAR MESSAGE */
    function clearMessage() {
        if (!messageBox) {
            return;
        }

        messageBox.textContent = "";
        messageBox.hidden      = true;
    }

    /* LOAD USERS */
    async function loadUsers() {
        if (!usersList) {
            return;
        }

        usersList.innerHTML = "";

        const loading = document.createElement("div");
        loading.className   = "admin-role-loading";
        loading.textContent = "Kullanıcılar yükleniyor...";

        usersList.appendChild(loading);

        try {
            const response = await fetch("/AdminRole/GetUsers", {
                headers: {
                    "Accept": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error("Kullanıcılar yüklenemedi.");
            }

            users = await response.json();

            renderUsers();
        } catch (error) {
            usersList.innerHTML = "";

            const errorElement = document.createElement("div");
            errorElement.className   = "admin-role-empty";
            errorElement.textContent = error.message;

            usersList.appendChild(errorElement);
        }
    }

    /* RENDER USERS */
    function renderUsers() {
        if (!usersList || !searchInput) {
            return;
        }

        const query = searchInput.value
            .trim()
            .toLocaleLowerCase("tr-TR");

        const filteredUsers = users.filter(user => {
            const name  = (user.fullName || "").toLocaleLowerCase("tr-TR");
            const email = (user.email || "").toLocaleLowerCase("tr-TR");

            return name.includes(query) || email.includes(query);
        });

        usersList.innerHTML = "";

        if (filteredUsers.length === 0) {
            const empty = document.createElement("div");

            empty.className   = "admin-role-empty";
            empty.textContent = "Kullanıcı bulunamadı.";

            usersList.appendChild(empty);

            return;
        }

        filteredUsers.forEach(user => {
            const button = document.createElement("button");
            button.type      = "button";
            button.className = "admin-role-user-item";

            const info = document.createElement("div");
            info.className = "admin-role-user-info";

            const name = document.createElement("strong");
            name.textContent = user.fullName || "İsimsiz kullanıcı";

            const email = document.createElement("span");
            email.textContent = user.email || "";

            const arrow = document.createElement("span");
            arrow.className   = "material-symbols-outlined";
            arrow.textContent = "chevron_right";

            info.append(name, email);
            button.append(info, arrow);

            button.addEventListener("click", function () {
                selectUser(user.id);
            });

            usersList.appendChild(button);
        });
    }

    /* SELECT USER */
    function selectUser(userId) {
        const user = users.find(x => x.id === userId);

        if (!user) {
            return;
        }

        selectedUserId                   = user.id;
        selectedName.textContent         = user.fullName || "İsimsiz kullanıcı";
        selectedEmail.textContent        = user.email || "";
        usersList.hidden                 = true;
        searchInput.parentElement.hidden = true;
        selectedPanel.hidden             = false;
        roleSelect.value                 = "";

        clearMessage();
        renderCurrentRoles();
    }

    /* RENDER CURRENT ROLES */
    function renderCurrentRoles() {
        const user = users.find(x => x.id === selectedUserId);

        currentRoles.innerHTML = "";

        if (!user) {
            return;
        }

        if (!user.roles || user.roles.length === 0) {
            const empty = document.createElement("span");

            empty.className   = "admin-role-empty";
            empty.textContent = "Kullanıcıya atanmış rol yok.";

            currentRoles.appendChild(empty);
            return;
        }

        user.roles.forEach(roleName => {
            const roleOption = Array.from(roleSelect.options).find(option => option.textContent.trim() === roleName);

            const item = document.createElement("div");
            item.className = "admin-role-current-item";

            const name = document.createElement("span");
            name.textContent = roleName;

            const removeButton = document.createElement("button");
            removeButton.type      = "button";
            removeButton.className = "admin-role-remove-button";
            removeButton.title     = "Rolü kaldır";

            const icon = document.createElement("span");
            icon.className   = "material-symbols-outlined";
            icon.textContent = "close";

            removeButton.appendChild(icon);
            removeButton.addEventListener("click", function () {
                if (!roleOption) {
                    showMessage("Rol bulunamadı.", "error");

                    return;
                }

                removeRole(user.id, Number(roleOption.value), roleName);
            });

            item.append(name, removeButton);

            currentRoles.appendChild(item);
        });
    }

    /* POST ROLE ACTION */
    async function postRoleAction(url, userId, roleId) {
        if (!token) {
            throw new Error("Güvenlik doğrulama anahtarı bulunamadı.");
        }

        const body = new URLSearchParams({
            userId: String(userId),
            roleId: String(roleId),
            __RequestVerificationToken: token
        });

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json"
            },
            body: body
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "İşlem gerçekleştirilemedi.");
        }

        return data;
    }

    /* REFRESH SELECTED USER */
    async function refreshSelectedUser() {
        const response = await fetch("/AdminRole/GetUsers", {
            headers: {
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Kullanıcı bilgileri yenilenemedi.");
        }

        users = await response.json();

        renderCurrentRoles();
    }

    /* ASSIGN ROLE */
    async function assignRole() {
        if (isSaving || selectedUserId === null) {
            return;
        }

        const roleId = Number(roleSelect.value);

        if (!roleId) {
            showMessage("Lütfen bir rol seçin.", "error");
            return;
        }

        isSaving              = true;
        assignButton.disabled = true;

        clearMessage();

        try {
            const result = await postRoleAction("/AdminRole/AssignRole", selectedUserId, roleId);

            await refreshSelectedUser();

            roleSelect.value = "";

            showMessage(result.message);

        } catch (error) {
            showMessage(error.message, "error");
        } finally {
            isSaving              = false;
            assignButton.disabled = false;
        }
    }

    /* REMOVE ROLE */
    async function removeRole(userId, roleId, roleName) {
        if (isSaving) {
            return;
        }

        const confirmed = confirm(`"${roleName}" rolü kullanıcıdan kaldırılsın mı?`);

        if (!confirmed) {
            return;
        }

        isSaving = true;

        clearMessage();

        currentRoles.querySelectorAll("button").forEach(button => {
            button.disabled = true;
        });

        try {
            const result = await postRoleAction("/AdminRole/RemoveRole", userId, roleId);

            await refreshSelectedUser();
            showMessage(result.message);
        } catch (error) {
            showMessage(error.message, "error");
        } finally {
            isSaving = false;

            currentRoles.querySelectorAll("button").forEach(button => {
                button.disabled = false;
            });
        }
    }

    /* OPEN USER ROLE MANAGEMENT */
    manageButton?.addEventListener("click", async function () {
        selectedUserId                   = null;
        selectedPanel.hidden             = true;
        usersList.hidden                 = false;
        searchInput.parentElement.hidden = false;
        searchInput.value                = "";

        clearMessage();

        openModal(manageModal);

        await loadUsers();
    });

    /* SEARCH USERS */
    searchInput?.addEventListener("input", renderUsers);

    /* BACK TO USERS */
    backButton?.addEventListener("click", function () {
        selectedUserId                   = null;
        selectedPanel.hidden             = true;
        usersList.hidden                 = false;
        searchInput.parentElement.hidden = false;

        clearMessage();
        renderUsers();

        searchInput.focus();
    });

    /* ASSIGN ROLE BUTTON */
    assignButton?.addEventListener("click", assignRole);

    /* DELETE ROLE MODAL */
    const deleteRoleModal         = document.getElementById("deleteRoleModal");
    const deleteRoleName          = document.getElementById("deleteRoleName");
    const confirmDeleteRoleButton = document.getElementById("confirmDeleteRoleButton");
    let pendingDeleteForm         = null;

    document.querySelectorAll(".admin-role-delete-form").forEach(form => {
        form.addEventListener("submit", event => {
            event.preventDefault();

            pendingDeleteForm = form;

            if (deleteRoleName) {
                deleteRoleName.textContent = form.dataset.roleName || "";
            }

            if (deleteRoleModal) {
                openModal(deleteRoleModal);
            }
        });
    });

    if (confirmDeleteRoleButton) {
        confirmDeleteRoleButton.addEventListener("click", () => {
            if (!pendingDeleteForm) {
                return;
            }

            confirmDeleteRoleButton.disabled = true;

            pendingDeleteForm.submit();
        });
    }
});