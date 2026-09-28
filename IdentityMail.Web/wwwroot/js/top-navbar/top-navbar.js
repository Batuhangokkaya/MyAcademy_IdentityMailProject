/* MAIL SEARCH */
const searchInput   = document.getElementById("mailSearchInput");
const searchResults = document.getElementById("mailSearchResults");

let searchTimeout;
let searchController;

/* ESCAPE HTML */
function escapeHTML(value) {
    const div = document.createElement("div");
    div.textContent = value ?? "";
    return div.innerHTML;
}

/* SEARCH MAILS WHILE TYPING */
searchInput.addEventListener("input", function () {
    clearTimeout(searchTimeout);

    if (searchController) {
        searchController.abort();
    }

    const query = this.value.trim();

    if (!query) {
        searchResults.classList.remove("show");
        searchResults.innerHTML = "";
        return;
    }

    searchTimeout = setTimeout(async () => {
        searchController = new AbortController();

        try {
            const response = await fetch(`/Message/Search?query=${encodeURIComponent(query)}`, { signal: searchController.signal });

            if (!response.ok) {
                return;
            }

            const messages = await response.json();

            /* PREVENT DISPLAYING RESULTS FROM PREVIOUS SEARCHES */
            if (searchInput.value.trim() !== query) {
                return;
            }

            if (messages.length === 0) {
                searchResults.innerHTML = `
                    <div class="mail-search-empty">
                        Sonuç bulunamadı.
                    </div>`;
            } else {
                searchResults.innerHTML = messages.map(mail => {
                    const name    = mail.name || "Bilinmeyen";
                    const subject = mail.subject || "Konu yok";
                    const preview = mail.body || "";
                    const url     = `/Message/MailDetail/${mail.id}`;

                    return `
                        <a class="mail-search-item"
                           href="${url}">
                            <div class="mail-search-avatar">
                                ${escapeHTML(name.charAt(0).toUpperCase())}
                            </div>
                            <div class="mail-search-content">
                                <span class="mail-search-name">${escapeHTML(name)}</span>
                                <span class="mail-search-subject">${escapeHTML(subject)}</span>
                                <span class="mail-search-preview">${escapeHTML(preview.substring(0, 65))}</span>
                            </div>
                        </a>`;
                }).join("");
            }

            searchResults.classList.add("show");
        } catch (error) {
            if (error.name !== "AbortError") {
                console.error("Arama hatası:", error);
            }
        }
    }, 300);
});

/* CLOSE SEARCH RESULTS WHEN CLICKING OUTSIDE */
document.addEventListener("click", function (event) {
    if (!event.target.closest(".top-navbar-search")) {
        searchResults.classList.remove("show");
    }
});

/* SHOW EXISTING RESULTS WHEN SEARCH INPUT IS FOCUSED */
searchInput.addEventListener("focus", function () {
    if (searchResults.innerHTML.trim()) {
        searchResults.classList.add("show");
    }
});

/* CLOSE SEARCH RESULTS WHEN ESCAPE KEY IS PRESSED */
searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        searchResults.classList.remove("show");
        this.blur();
    }
});

<form id="notificationTokenForm" hidden>
    @Html.AntiForgeryToken()
</form>