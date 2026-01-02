function getLocation() {

    document.getElementById("latitude").value = "Fetching...";
    document.getElementById("longitude").value = "Fetching...";

    if (!navigator.geolocation) {
        alert("Geolocation not supported");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        pos => {
            document.getElementById("latitude").value =
                pos.coords.latitude.toFixed(6);

            document.getElementById("longitude").value =
                pos.coords.longitude.toFixed(6);
        },
        () => {
            alert("Location permission denied");
            document.getElementById("latitude").value = "";
            document.getElementById("longitude").value = "";
        },
        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }
    );
}

function getGender() {
    const g = document.querySelector("input[name='gender']:checked");
    return g ? g.value : null;
}

document.getElementById("details_form").addEventListener("submit", function (e) {
    e.preventDefault();

    const emailId = localStorage.getItem("emailId");
    if (!emailId) {
        alert("Session expired. Login again.");
        window.location.href = "login_page.html";
        return;
    }

    const city = document.querySelector("input[name='city']").value.trim();
    const gender = getGender();
    const latitude = document.getElementById("latitude").value;
    const longitude = document.getElementById("longitude").value;

    if (!city || !gender || !latitude || !longitude) {
        alert("Fill all fields and fetch location");
        return;
    }

    const data = {
        city: city,
        gender: gender,
        latitude: Number(latitude),
        longitude: Number(longitude)
    };

    fetch(`http://localhost:1919/api/donor/location-details?emailId=${emailId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(res => {
        if (!res.ok) throw new Error("Save failed");
        return res.text();
    })
    .then(msg => {
        alert(msg);
        window.location.href = "login_page.html";
    })
    .catch(err => {
        console.error(err);
        alert("Error saving donor details");
    });
});
