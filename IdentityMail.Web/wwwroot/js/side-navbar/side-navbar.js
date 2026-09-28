/* NAVBAR */
document.addEventListener('DOMContentLoaded', () => {
    const avatar               = document.getElementById('profile-avatar');
    const profileDropdown      = document.getElementById('profile-dropdown');
    const notificationBell     = document.getElementById('notification-bell');
    const notificationDropdown = document.getElementById('notification-dropdown');
    const settingsIcon         = document.getElementById('settings-icon');
    const settingsDropdown     = document.getElementById('settings-dropdown');

    function toggleDropdown(dropdownToToggle) {
        [profileDropdown, notificationDropdown, settingsDropdown].forEach(dropdown => {
            if (dropdown && dropdown !== dropdownToToggle && dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
            }
        });

        if (dropdownToToggle) {
            dropdownToToggle.classList.toggle('show');
        }
    }

    if (avatar) {
        avatar.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown(profileDropdown);
        });
    }

    if (notificationBell) {
        notificationBell.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown(notificationDropdown);
        });
    }

    if (settingsIcon) {
        settingsIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown(settingsDropdown);
        });
    }

    document.addEventListener('click', (e) => {
        if (profileDropdown && avatar && !profileDropdown.contains(e.target) && !avatar.contains(e.target)) {
            profileDropdown.classList.remove('show');
        }

        if (notificationDropdown && notificationBell && !notificationDropdown.contains(e.target) && !notificationBell.contains(e.target)) {
            notificationDropdown.classList.remove('show');
        }

        if (settingsDropdown && settingsIcon && !settingsDropdown.contains(e.target) && !settingsIcon.contains(e.target)) {
            settingsDropdown.classList.remove('show');
        }
    });
});