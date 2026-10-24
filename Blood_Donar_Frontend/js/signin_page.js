
const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const togglePassword = document.getElementById("togglePassword");
const loginButton = document.getElementById("loginButton");
const loginMessage = document.getElementById("loginMessage");

// Show or hide password
togglePassword.addEventListener("click", function () {
    const showPassword = loginPassword.type === "password";

    loginPassword.type = showPassword ? "text" : "password";

    this.innerHTML = showPassword
        ? '<i class="fa-regular fa-eye-slash"></i>'
        : '<i class="fa-regular fa-eye"></i>';

    this.setAttribute("aria-pressed", String(showPassword));
    this.setAttribute(
        "aria-label",
        showPassword ? "Hide password" : "Show password"
    );
});

// Submit login form
loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const data = {
        emailId: loginEmail.value.trim(),
        password: loginPassword.value
    };

    loginButton.disabled = true;
    loginButton.querySelector("span").textContent = "Signing in...";
    loginMessage.textContent = "";

    try {
        const response = await fetch(
            "http://localhost:8800/api/donor/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            }
        );

        if (!response.ok) {
            throw new Error("Invalid email or password.");
        }

        localStorage.setItem("emailId", data.emailId);
        window.location.href = "home_page.html";

    } catch (error) {
        loginMessage.textContent =
            error.message || "Unable to connect to the server.";

        loginButton.disabled = false;
        loginButton.querySelector("span").textContent = "Sign In";
    }
});
