// HELP FAQ TOGGLE
document.querySelectorAll(".help-faq-question").forEach(button => {
    button.addEventListener("click", () => {
        const answer     = button.nextElementSibling;
        const isExpanded = button.getAttribute("aria-expanded") === "true";

        button.setAttribute("aria-expanded", String(!isExpanded));
        answer.hidden = isExpanded;
    });
});

// HELP SEARCH
const helpSearch = document.getElementById("helpSearch");
const faqItems   = document.querySelectorAll(".help-faq-item");
const helpEmpty  = document.querySelector(".help-faq-empty");

helpSearch?.addEventListener("input", () => {
    const query = helpSearch.value
        .toLocaleLowerCase("tr-TR")
        .trim();

    let visibleCount = 0;

    faqItems.forEach(item => {
        const matches = item.textContent
            .toLocaleLowerCase("tr-TR")
            .includes(query);

        item.hidden = !matches;

        if (matches) {
            visibleCount++;
        }
    });

    helpEmpty.hidden = visibleCount !== 0;
});