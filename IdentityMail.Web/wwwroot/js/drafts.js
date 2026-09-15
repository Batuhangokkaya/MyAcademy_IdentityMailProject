/* DRAFTS */
async function saveDraft() {
    const receiverMail = document.getElementById("ReceiverMail").value;
    const subject      = document.getElementById("Subject").value;
    const body         = document.getElementById("Body").value;

    const formData = new FormData();

    formData.append("ReceiverMail", receiverMail);
    formData.append("Subject", subject);
    formData.append("Body", body);

    try {

        const response = await fetch("/Message/SaveDraft", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            console.log("HTTP Hatası:", response.status);
            return;
        }

        const result = await response.json();

        console.log(result);

        if (result.success) {
            document.getElementById("compose-window").classList.add("hidden");
        }

    } catch (error) {
        console.error("Taslak kaydetme hatası:", error);
    }
}

// ON DRAFT
async function openDraft(id) {

    const response = await fetch(`/Message/EditDraft?id=${id}`);

    if (!response.ok) {
        console.error("Taslak bulunamadı.");
        return;
    }

    const draft = await response.json();

    document.getElementById("DraftID").value = draft.id;
    document.getElementById("ReceiverMail").value = draft.receiverMail;
    document.getElementById("Subject").value = draft.subject;
    document.getElementById("Body").value = draft.body;

    document.getElementById("compose-window").classList.remove("hidden");
}