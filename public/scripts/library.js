document.addEventListener('DOMContentLoaded', () => {
    const sortMenu = document.querySelector(".sort-menu");
    const sort = document.querySelector(".sort-btn");

    sort.addEventListener('click', e => {
        sortMenu.classList.toggle("hidden");
    });
});