/* TOOGLE IMPORTANT */
async function toggleImportant(event, id, element) {
    event.preventDefault();
    event.stopPropagation();

    const response = await fetch(`/Message/ToggleImportant?id=${id}`, {
        method: 'POST'
    });

    if (!response.ok)
        return;

    const data = await response.json();

    element.textContent = data.isImportant ? "star" : "star_border";
}