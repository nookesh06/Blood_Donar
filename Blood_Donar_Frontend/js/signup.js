document.getElementById("signupForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const emailId = document.querySelector("input[name='email']").value;

    const data = {
        userName: document.querySelector("input[name='name']").value,
        emailId: emailId,
        mobileNumber: document.querySelector("input[name='mobile']").value,
        dateOfBirth: document.querySelector("input[name='dob']").value,
        bloodGroup: document.getElementById("bloodGroup").value,
        password: document.getElementById("password").value
    };

    fetch("http://localhost:1919/api/donor/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(res => {
        if (!res.ok) throw new Error();
        return res.text();
    })
    .then(msg => {
    alert(msg);
    localStorage.setItem("emailId", emailId);
    window.location.href = "details_form.html";
});
    })
    .catch(() => alert("Signup failed"));
