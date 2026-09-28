/* CLOSE DROPDOWN MENUS */
function closeDetailMenus() {
    document.querySelectorAll(".detail-menu").forEach(menu => {
        const panel  = menu.querySelector(".detail-menu-panel");
        const toggle = menu.querySelector(".detail-menu-toggle");

        if (panel) {
            panel.hidden = true;
        }

        if (toggle) {
            toggle.setAttribute("aria-expanded", "false");
        }
    });
}

/* TOGGLE DROPDOWN MENUS */
document.addEventListener("click", function (event) {
    const toggle = event.target.closest(".detail-menu-toggle");

    if (toggle) {
        const menu  = toggle.closest(".detail-menu");
        const panel = menu?.querySelector(".detail-menu-panel");

        if (!panel) {
            return;
        }

        const shouldOpen = panel.hidden;

        closeDetailMenus();

        panel.hidden = !shouldOpen;

        toggle.setAttribute("aria-expanded", String(shouldOpen));
        return;
    }

    /* CLOSE MENUS ON OUTSIDE CLICK */
    if (!event.target.closest(".detail-menu")) {
        closeDetailMenus();
    }
});

/* CLOSE MENUS WITH ESCAPE KEY */
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeDetailMenus();
    }
});

/* OPEN COMPOSE WINDOW */
function openComposeWindow() {
    const composeWindow = document.getElementById("compose-window");

    if (!composeWindow) {
        return null;
    }

    const form = composeWindow.querySelector(".compose-message-form");

    if (!form) {
        return null;
    }

    /* SHOW COMPOSE WINDOW */
    composeWindow.classList.remove("hidden");
    composeWindow.classList.remove("is-minimized");

    /* RESTORE DEFAULT HEIGHT */
    if (!composeWindow.classList.contains("is-maximized")) {
        composeWindow.style.height = "600px";
    }

    /* SHOW COMPOSE BODY AND FOOTER */
    const composeBody   = document.getElementById("compose-body");
    const composeFooter = document.getElementById("compose-footer");

    if (composeBody) {
        composeBody.style.display = "flex";
    }

    if (composeFooter) {
        composeFooter.style.display = "flex";
    }

    return form;
}

/* PREPARE COMPOSE FORM */
function prepareCompose(title) {
    closeDetailMenus();

    const composeWindow = document.getElementById("compose-window");

    if (!composeWindow) {
        return null;
    }

    const form = composeWindow.querySelector(".compose-message-form");

    if (!form) {
        return null;
    }

    form.reset();

    const draftId   = form.querySelector('[name="DraftID"]');
    const replyId   = form.querySelector('[name="ReplyToMessageID"]');
    const forwardId = form.querySelector('[name="ForwardFromMessageID"]');

    if (draftId) {
        draftId.value = "";
    }
    if (replyId) {
        replyId.value = "";
    }
    if (forwardId) {
        forwardId.value = "";
    }

    const fileInput = form.querySelector('[name="Attachments"]');

    if (fileInput) {
        fileInput.value = "";
        fileInput.dispatchEvent(new Event("change"));
    }

    document.getElementById("forwarded-files")?.replaceChildren();

    form.querySelectorAll(".compose-validation-error").forEach(error => error.remove());

    composeWindow.classList.remove("hidden", "is-minimized");

    if (!composeWindow.classList.contains("is-maximized")) {
        composeWindow.style.height = "600px";
    }

    const composeBody   = document.getElementById("compose-body");
    const composeFooter = document.getElementById("compose-footer");

    if (composeBody) {
        composeBody.style.display = "flex";
    }
    if (composeFooter) {
        composeFooter.style.display = "flex";
    }

    const titleElement = composeWindow.querySelector(".compose-message-title");

    if (titleElement) {
        titleElement.textContent = title;
    }

    return form;
}

/* REPLY TO MESSAGE */
function replyToMessage() {
    const mailData = window.mailDetailData;

    if (!mailData) {
        return;
    }

    const form = prepareCompose("Yanıtla");

    if (!form) {
        return;
    }

    const receiver = form.querySelector('[name="ReceiverMail"]');
    const subject  = form.querySelector('[name="Subject"]');
    const body     = form.querySelector('[name="Body"]');
    const replyId  = form.querySelector('[name="ReplyToMessageID"]');

    if (replyId) {
        replyId.value = mailData.messageId;
    }

    if (receiver) {
        receiver.value = mailData.replyMail || "";
    }

    if (subject) {
        const oldSubject = mailData.subject || "";
        subject.value = /^re:/i.test(oldSubject) ? oldSubject : "Re: " + oldSubject;
    }

    /* INCLUDE QUOTED ORIGINAL MESSAGE */
    if (body) {
        const originalLines = (mailData.body || "")
            .split(/\r?\n/)
            .map(line => "> " + line)
            .join("\n");

        body.value = "\n\n" + mailData.sendDate + " tarihinde " + mailData.senderName + " yazdı:\n\n" + originalLines;
        body.focus();
        body.setSelectionRange(0, 0);
    }

    /* DISPLAY REPLY ATTACHMENTS */
    const replyFiles = document.getElementById("forwarded-files");

    if (replyFiles && mailData.attachments?.length) {
        mailData.attachments.forEach(file => {
            const item = document.createElement("div");
            item.className = "forwarded-file-item";

            const icon = document.createElement("span");
            icon.className   = "material-symbols-outlined";
            icon.textContent = "attach_file";

            const name = document.createElement("span");
            name.textContent = file.name;

            item.append(icon, name);
            replyFiles.appendChild(item);
        });
    }
}

/* FORWARD MESSAGE */
function forwardMessage() {
    const mailData = window.mailDetailData;

    if (!mailData) {
        return;
    }

    const form = prepareCompose("İlet");

    if (!form) {
        return;
    }

    const receiver  = form.querySelector('[name="ReceiverMail"]');
    const subject   = form.querySelector('[name="Subject"]');
    const body      = form.querySelector('[name="Body"]');
    const forwardId = form.querySelector('[name="ForwardFromMessageID"]');

    if (forwardId) {
        forwardId.value = mailData.messageId;
    }

    if (receiver) {
        receiver.value = "";
    }

    if (subject) {
        const oldSubject = mailData.subject || "";
        subject.value = /^(fwd|fw):/i.test(oldSubject) ? oldSubject : "Fwd: " + oldSubject;
    }

    if (body) {
        body.value = ["", "", "---------- İletilen mesaj ----------", "Gönderen: " + (mailData.senderName || "") + " <" + (mailData.senderEmail || "") + ">", "Tarih: " + (mailData.sendDate || ""), "Konu: " + (mailData.subject || ""), "", mailData.body || ""].join("\n");
    }

    /* DISPLAY ATTACHMENTS TO BE FORWARDED */
    const forwardedFiles = document.getElementById("forwarded-files");

    if (forwardedFiles && mailData.attachments?.length) {
        mailData.attachments.forEach(file => {
            const item = document.createElement("div");
            item.className = "forwarded-file-item";

            const icon = document.createElement("span");
            icon.className   = "material-symbols-outlined";
            icon.textContent = "attach_file";

            const name = document.createElement("span");
            name.textContent = file.name;

            item.append(icon, name);
            forwardedFiles.appendChild(item);
        });
    }

    if (receiver) receiver.focus();
}

/* RESET COMPOSE TITLE */
document.addEventListener("DOMContentLoaded", function () {
    const composeButton = document.getElementById("compose-btn");

    if (composeButton) {
        composeButton.addEventListener("click", function () {
            const composeWindow = document.getElementById("compose-window");

            if (!composeWindow) {
                return;
            }

            const titleElement = composeWindow.querySelector(".compose-message-title");

            if (titleElement) {
                titleElement.textContent = "Yeni Mail";
            }
        });
    }
});