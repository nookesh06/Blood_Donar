
const form = document.getElementById("details_form");
const locationButton = document.getElementById("locationButton");
const locationButtonText = document.getElementById("locationButtonText");
const locationStatus = document.getElementById("locationStatus");
const latitudeInput = document.getElementById("latitude");
const longitudeInput = document.getElementById("longitude");
const submitButton = document.getElementById("btnSubmit");
const formMessage = document.getElementById("formMessage");

function showMessage(message, type = "error") {
    formMessage.textContent = message;
    formMessage.className =
        type === "success"
            ? "form-message success"
            : "form-message";

    formMessage.hidden = false;
}

function clearMessage() {
    formMessage.textContent = "";
    formMessage.hidden = true;
    formMessage.className = "form-message";
}

function updateLocationStatus(message, type = "") {
    locationStatus.textContent = message;
    locationStatus.className =
        type ? `location-status ${type}` : "location-status";
}

function getGender() {
    const selectedGender = document.querySelector(
        'input[name="gender"]:checked'
    );

    return selectedGender ? selectedGender.value : null;
}

function getLocation() {
    clearMessage();

    if (!navigator.geolocation) {
        updateLocationStatus(
            "Your browser does not support location access.",
            "error"
        );
        return;
    }

    locationButton.disabled = true;
    locationButtonText.textContent = "Finding your location...";
    latitudeInput.value = "";
    longitudeInput.value = "";

    updateLocationStatus("Waiting for GPS location permission...");

    navigator.geolocation.getCurrentPosition(
        (position) => {
            latitudeInput.value =
                position.coords.latitude.toFixed(6);

            longitudeInput.value =
                position.coords.longitude.toFixed(6);

            locationButton.disabled = false;
            locationButtonText.textContent = "Refresh my location";

            updateLocationStatus(
                "Location obtained successfully.",
                "success"
            );
        },

        (error) => {
            locationButton.disabled = false;
            locationButtonText.textContent = "Try location again";

            latitudeInput.value = "";
            longitudeInput.value = "";

            let message;

            switch (error.code) {
                case error.PERMISSION_DENIED:
                    message =
                        "Location permission was denied. Allow location access in your browser settings and try again.";
                    break;

                case error.POSITION_UNAVAILABLE:
                    message =
                        "Your current location is unavailable. Check your device location settings.";
                    break;

                case error.TIMEOUT:
                    message =
                        "Location request timed out. Please try again.";
                    break;

                default:
                    message =
                        "Unable to retrieve your location. Please try again.";
            }

            updateLocationStatus(message, "error");
        },

        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0
        }
    );
}

locationButton.addEventListener("click", getLocation);

form.addEventListener("submit", async function (event) {
    event.preventDefault();
    clearMessage();

    const emailId = localStorage.getItem("emailId");

    if (!emailId) {
        showMessage("Your session has expired. Please log in again.");
        return;
    }

    const city = document.getElementById("city").value.trim();
    const gender = getGender();
    const latitude = latitudeInput.value;
    const longitude = longitudeInput.value;

    if (!city || !gender) {
        showMessage("Please enter your city and select your gender.");
        return;
    }

    if (
        !latitude ||
        !longitude ||
        !Number.isFinite(Number(latitude)) ||
        !Number.isFinite(Number(longitude))
    ) {
        showMessage("Please share your current location before submitting.");
        return;
    }

    const data = {
        city: city,
        gender: gender,
        latitude: Number(latitude),
        longitude: Number(longitude)
    };

    submitButton.disabled = true;
    submitButton.querySelector("span:first-child").textContent =
        "Saving your profile...";

    try {
        const response = await fetch(
            `http://localhost:8800/api/donor/location-details?emailId=${encodeURIComponent(emailId)}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            }
        );

        if (!response.ok) {
            throw new Error(
                `Unable to save your profile (HTTP ${response.status}).`
            );
        }

        showMessage(
            "Your donor details have been saved successfully. Redirecting to login...",
            "success"
        );

        window.location.href = "signin_page.html";

    } catch (error) {
        console.error("Donor profile submission failed:", error);

        showMessage(
            error instanceof TypeError
                ? "Unable to connect to the server. Check whether your backend is running."
                : error.message || "Something went wrong. Please try again."
        );

        submitButton.disabled = false;
        submitButton.querySelector("span:first-child").textContent =
            "Save and complete profile";
    }
});
