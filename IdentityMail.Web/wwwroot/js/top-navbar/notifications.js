/* NOTIFICATION SYSTEM */
const notificationToken = document.querySelector('#notificationTokenForm input[name="__RequestVerificationToken"]')?.value;

/* UPDATE NOTIFICATION BADGE */
function updateNotificationBadge(count) {
    const badge = document.getElementById("notificationBadge");

    if (!badge) {
        return;
    }

    badge.style.display = count > 0 ? "" : "none";
}

/* MARK NOTIFICATION AS READ AND OPEN MESSAGE */
async function openNotification(item) {
    const id = item.dataset.id;

    if (!notificationToken) {
        console.error("Notification token not found.");
        return;
    }

    try {
        const response = await fetch(`/Notification/MarkAsRead?id=${encodeURIComponent(id)}`, {
            method: "POST",
            headers: {
                "RequestVerificationToken": notificationToken
            }
        });

        if (!response.ok) {
            console.error("MarkAsRead failed:", response.status, await response.text());
            return;
        }

        const result = await response.json();

        if (!result.success) {
            return;
        }

        item.classList.remove("unread");
        item.querySelector(".unread-dot")?.remove();

        updateNotificationBadge(result.unreadCount);

        if (result.messageId != null) {
            window.location.href = `/Message/MailDetail?id=${encodeURIComponent(result.messageId)}`;
        }

    } catch (error) {
        console.error("Notification error:", error);
    }
}

/* HANDLE NOTIFICATION CLICKS */
document.addEventListener("click", function (event) {
    const item = event.target.closest(".notification-item[data-id]");

    if (item) {
        openNotification(item);
    }
});

/* HANDLE NOTIFICATION KEYBOARD ACTIONS */
document.addEventListener("keydown", function (event) {
    const item = event.target.closest(".notification-item[data-id]");

    if (!item) {
        return;
    }

    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openNotification(item);
    }
});

/* MARK ALL NOTIFICATIONS AS READ */
document.addEventListener("click", async function (event) {
    const button = event.target.closest("#notificationReadAll, #pageNotificationReadAll");

    if (!button) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();

    if (!notificationToken) {
        console.error("Notification token not found.");
        return;
    }

    button.disabled = true;

    try {
        const response = await fetch("/Notification/MarkAllAsRead",{
            method: "POST",
            headers: {
                "RequestVerificationToken": notificationToken
            }
        });

        if (!response.ok) {
            console.error("MarkAllAsRead failed:", response.status, await response.text());
            return;
        }

        const result = await response.json();

        if (!result.success) {
            return;
        }

        document.querySelectorAll(".notification-item.unread").forEach(item => {
            item.classList.remove("unread");
            item.querySelector(".unread-dot")?.remove();
        });

        updateNotificationBadge(result.unreadCount);

        console.log("All notifications marked as read.");
    } catch (error) {
        console.error("Notification error:", error);
    } finally {
        button.disabled = false;
    }
});

/* DELETE NOTIFICATION */
document.addEventListener("click", async function (event) {
    const button = event.target.closest(".notification-delete");

    if (!button) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();

    const id = button.dataset.id;

    if (!notificationToken) {
        return;
    }

    button.disabled = true;

    try {
        const response = await fetch(`/Notification/Delete?id=${encodeURIComponent(id)}`, {
            method: "POST",
            headers: {
                "RequestVerificationToken": notificationToken
            }
        });

        if (!response.ok) {
            return;
        }

        const result = await response.json();

        if (!result.success) {
            return;
        }

        document.querySelectorAll(`.notification-item[data-id="${id}"]`).forEach(item => item.remove());

        updateNotificationBadge(result.unreadCount);
    } catch (error) {
        console.error("Delete notification error:", error);
    } finally {
        button.disabled = false;
    }
});

/* FILTER NOTIFICATIONS */
document.querySelectorAll(".notifications-tabs button").forEach(button => {
    button.addEventListener("click", function () {
        const filter = this.dataset.filter;

        document.querySelectorAll(".notifications-tabs button").forEach(tab => tab.classList.remove("active"));

        this.classList.add("active");

        document.querySelectorAll(".notification-card").forEach(card => {
            const isUnread = card.classList.contains("unread");
            card.style.display = filter === "all" || (filter === "unread" && isUnread) || (filter === "read" && !isUnread) ? "" : "none";
        });
    });
});