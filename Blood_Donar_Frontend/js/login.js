document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const emailId = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const data = {
        emailId: emailId,
        password: password
    };

    fetch("http://localhost:1919/api/donor/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(res => {
        if (!res.ok) throw new Error("Login failed");
        return res.text();
    })
    .then(() => {
        window.location.href = "home_page.html";
    })
    .catch(() => alert("Invalid Email or Password"));
});
