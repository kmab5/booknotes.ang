document.addEventListener('DOMContentLoaded', () => {
    const sideMenu = document.querySelector(".side-menu");
    const labels = document.querySelectorAll(".label");

    sideMenu.addEventListener('click', e => {
        labels.forEach(label => {
            label.classList.toggle("hidden");
        });
    });
});