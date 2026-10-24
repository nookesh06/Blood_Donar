
document.addEventListener("DOMContentLoaded", () => {
    // HTML elements
    const profileForm = document.getElementById("profileForm");
    const editBtn = document.getElementById("editBtn");
    const cancelBtn = document.getElementById("cancelBtn");
    const saveBtn = document.getElementById("saveBtn");

    const fullName = document.getElementById("fullName");
    const mobileNumber = document.getElementById("mobileNumber");
    const bloodGroup = document.getElementById("bloodGroup");
    const city = document.getElementById("city");

    const displayName = document.getElementById("profileDisplayName");
    const displayEmail = document.getElementById("profileDisplayEmail");
    const profileMessage = document.getElementById("profileMessage");

    // Backend configuration
    const API_URL = "http://localhost:8800/api/donor/profile";
    const emailId = localStorage.getItem("emailId");

    const fields = [fullName, mobileNumber, bloodGroup, city];

    let originalValues = {};

    // Show messages on the page
    function showMessage(message, type = "") {
        if (!profileMessage) return;

        profileMessage.textContent = message;
        profileMessage.className = type;
    }

    // Read current form values
    function getFormValues() {
        return {
            userName: fullName.value,
            mobileNumber: mobileNumber.value,
            bloodGroup: bloodGroup.value,
            city: city.value
        };
    }

    // Fill form with profile data
    function fillForm(user) {
        fullName.value = user.userName ?? user.fullName ?? "";
        mobileNumber.value = user.mobileNumber ?? "";
        bloodGroup.value = user.bloodGroup ?? "";
        city.value = user.city ?? "";

        displayName.textContent = fullName.value || "Your name";
        displayEmail.textContent = user.emailId ?? emailId ?? "No email available";
    }

    // Enable or disable editing
    function setEditing(editing) {
        fields.forEach(field => {
            field.readOnly = !editing;
        });

        editBtn.hidden = editing;
        cancelBtn.hidden = !editing;
        saveBtn.hidden = !editing;
    }

    // Load the logged-in donor's profile
    async function loadProfile() {
        if (!emailId) {
            showMessage("Please sign in to view your profile.", "error");
            return;
        }

        showMessage("Loading your profile...");

        try {
            const url =
                `${API_URL}?emailId=${encodeURIComponent(emailId)}`;

            console.log("Loading profile:", url);

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(
                    `Profile request failed with status ${response.status}`
                );
            }

            const user = await response.json();

            fillForm(user);
            originalValues = getFormValues();
            setEditing(false);
            showMessage("");

        } catch (error) {
            console.error("Profile loading error:", error);

            showMessage(
                "Unable to load profile. Check your backend API and browser console.",
                "error"
            );
        }
    }

    // Edit profile
    editBtn.addEventListener("click", () => {
        originalValues = getFormValues();
        setEditing(true);
        showMessage("You can now edit your profile.");
    });

    // Cancel editing
    cancelBtn.addEventListener("click", () => {
        fullName.value = originalValues.userName ?? "";
        mobileNumber.value = originalValues.mobileNumber ?? "";
        bloodGroup.value = originalValues.bloodGroup ?? "";
        city.value = originalValues.city ?? "";

        displayName.textContent = fullName.value || "Your name";

        setEditing(false);
        showMessage("Changes discarded.");
    });

    // Save profile changes
    profileForm.addEventListener("submit", async event => {
        event.preventDefault();

        if (!emailId) {
            showMessage("Please sign in again.", "error");
            return;
        }

        const data = {
            userName: fullName.value.trim(),
            emailId: emailId,
            mobileNumber: mobileNumber.value.trim(),
            bloodGroup: bloodGroup.value.trim(),
            city: city.value.trim()
        };

        if (
            !data.userName ||
            !data.mobileNumber ||
            !data.bloodGroup ||
            !data.city
        ) {
            showMessage("Please fill in all profile fields.", "error");
            return;
        }

        saveBtn.disabled = true;
        saveBtn.textContent = "Saving...";

        try {
            const url =
                `${API_URL}?emailId=${encodeURIComponent(emailId)}`;

            const response = await fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorText = await response.text();

                throw new Error(
                    errorText || `Update failed with status ${response.status}`
                );
            }

            originalValues = getFormValues();
            displayName.textContent = data.userName;
            displayEmail.textContent = data.emailId;

            setEditing(false);
            showMessage("Profile updated successfully.", "success");

        } catch (error) {
            console.error("Profile update error:", error);

            showMessage(
                "Unable to save changes. Check your backend update endpoint.",
                "error"
            );

        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML =
                '<i class="fa-solid fa-check"></i> Save Changes';
        }
    });

    // Initial setup
    setEditing(false);
    loadProfile();
});
