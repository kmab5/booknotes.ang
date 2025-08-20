document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector("header");
    const darkToggle = document.querySelector(".dark-toggle");
    const menuToggle = document.querySelector(".menu-toggle");
    const menu = document.querySelector(".menu");
    const close = document.querySelector(".close");

    let mode = localStorage.getItem("mode");
    if(mode == "dark") {
        document.body.classList.add("dark");
        darkToggle.classList.add("active-icon");
    }

    darkToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark");
        darkToggle.classList.toggle("active-icon");
        if(document.body.classList.contains("dark")) localStorage.setItem("mode", "dark");
        else localStorage.setItem("mode", "light");
    });

    menuToggle.addEventListener("click", () => {
        menu.classList.add("menu-visible");
    });

    close.addEventListener("click", () => {
        menu.classList.remove("menu-visible");
    });

    document.addEventListener("scroll", e => {
        if(window.scrollY > 0) {
            header.classList.add("detached");
        } else {
            header.classList.remove("detached");
        }
    });
});