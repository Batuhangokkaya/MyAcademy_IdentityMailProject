// PREVIEW SELECTED PROFILE IMAGE
document.getElementById("ProfileImage").addEventListener("change", function () {
    const file = this.files[0];

    if (!file) {
        return;
    }

    const preview = document.getElementById("profilePreview");
    const initial = document.getElementById("profileInitial");

    preview.src           = URL.createObjectURL(file);
    preview.style.display = "block";

    if (initial) {
        initial.style.display = "none";
    }
});