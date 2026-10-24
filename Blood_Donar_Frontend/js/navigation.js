
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-page]").forEach(function (link) {
        link.addEventListener("click", function (event) {
            const page = link.getAttribute("data-page");

            const pages = {
                home: "/home_page.html",
                about: "/about.html",
                contact: "/contact.html",
                details: "/details_form.html",
                profile: "/profile.html",
                signin: "/login_page.html",
                signup: "/signup_page.html"
            };

            if (pages[page]) {
                event.preventDefault();
                window.location.assign(pages[page]);
            }
        });
    });
});
