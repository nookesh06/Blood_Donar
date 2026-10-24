
document.getElementById("signupForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const emailId = document.querySelector("input[name='email']").value;

    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    const data = {
        userName: document.querySelector("input[name='name']").value,
        emailId: emailId,
        mobileNumber: document.querySelector("input[name='mobile']").value,
        dateOfBirth: document.querySelector("input[name='dob']").value,
        bloodGroup: document.getElementById("bloodGroup").value,
        password: password
    };

    fetch("http://localhost:8800/api/donor/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
        .then(res => {
            if (!res.ok) {
                throw new Error("Signup failed");
            }
            return res.text();
        })
        .then(msg => {
            localStorage.setItem("emailId", emailId);
            window.location.href = "details_form.html";
        })
        .catch(error => {
            console.error("Signup error:", error);
            alert("Signup failed. Please check your details or server connection.");
        });
});


// Show or hide password

document.querySelectorAll(".password-toggle, .toggle-password").forEach(button => {
    button.addEventListener("click", function () {
        const targetId = this.dataset.target;
        const passwordInput = document.getElementById(targetId);

        if (!passwordInput) {
            console.error("Password input not found:", targetId);
            return;
        }

        const showPassword = passwordInput.type === "password";

        passwordInput.type = showPassword ? "text" : "password";

        this.innerHTML = showPassword
            ? '<i class="fa-solid fa-eye-slash"></i>'
            : '<i class="fa-solid fa-eye"></i>';
    });
});

