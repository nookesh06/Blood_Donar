let map;
let myMarker;
let donorMarkers = [];
let routingControl = null;
let myLocation = null;

document.addEventListener("DOMContentLoaded", initMap);

function initMap() {

    map = L.map("map").setView([20.5937, 78.9629], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap"
    }).addTo(map);

    locateMe();
    loadDonors();

    document.querySelector("form").addEventListener("submit", e => {
        e.preventDefault();
        loadDonors();
    });

    document.getElementById("locateBtn").addEventListener("click", locateMe);
}
// Enable scroll zoom when mouse enters map
map.on("mouseover", () => {
    map.scrollWheelZoom.enable();
});

// Disable when mouse leaves map (page scroll works)
map.on("mouseout", () => {
    map.scrollWheelZoom.disable();
});
map.on('wheel', e => {
    if (!e.originalEvent.ctrlKey) {
        map.scrollWheelZoom.disable();
    }
});

/* ===============================
   MY LOCATION
================================ */
function locateMe() {

    if (!navigator.geolocation) {
        alert("Geolocation not supported");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        pos => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;

            myLocation = [lat, lng];

            map.setView(myLocation, 15, { animate: true });

            // Remove old marker if exists
            if (myMarker) {
                map.removeLayer(myMarker);
            }

            myMarker = L.marker(myLocation, {
                title: "You are here",
                zIndexOffset: 1000   // 👈 IMPORTANT (above all markers)
            })
            .addTo(map)
            .bindPopup("📍 <b>You are here</b>")
            .openPopup(); // 👈 force visible
        },
        err => {
            alert("Location access denied");
            console.error(err);
        },
        {
            enableHighAccuracy: true,
            timeout: 10000
        }
    );
}


/* ===============================
   LOAD DONORS
================================ */
function loadDonors() {

    const bloodGroup = document.getElementById("blood_group").value;
    const city = document.getElementById("city").value;

    let url = "http://localhost:1919/api/donor/search?";

    if (bloodGroup) url += `bloodGroup=${bloodGroup}&`;
    if (city) url += `city=${city}`;

    fetch(url)
        .then(res => res.json())
        .then(donors => {
            clearMarkers();
            addDonors(donors);
            document.getElementById("donor_count").innerText = donors.length;
        })
        .catch(err => console.error(err));
}

/* ===============================
   ADD DONORS WITH ROUTING
================================ */
function addDonors(donors) {

    donors.forEach(d => {

        if (!d.latitude || !d.longitude) return;

        const donorLatLng = [d.latitude, d.longitude];

        const popupContent = `
            <strong>${d.userName}</strong><br>
            🩸 ${d.bloodGroup}<br>
            📞 ${d.mobileNumber}<br>
            ✉ ${d.emailId}<br><br>
            <button onclick="showRoute(${d.latitude}, ${d.longitude})">
                🚗 Get Directions
            </button>
        `;

        const marker = L.marker(donorLatLng)
            .addTo(map)
            .bindPopup(popupContent);

        donorMarkers.push(marker);
    });
}

/* ===============================
   SHOW SHORTEST ROUTE
================================ */
function showRoute(destLat, destLng) {

    if (!myLocation) {
        alert("Your location not available yet");
        return;
    }

    // Remove old route
    if (routingControl) {
        map.removeControl(routingControl);
    }

    routingControl = L.Routing.control({
        waypoints: [
            L.latLng(myLocation[0], myLocation[1]),
            L.latLng(destLat, destLng)
        ],
        routeWhileDragging: false,
        show: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        lineOptions: {
            styles: [{ color: 'red', weight: 5 }]
        }
    }).addTo(map);
}

/* ===============================
   CLEAR MARKERS
================================ */
function clearMarkers() {
    donorMarkers.forEach(m => map.removeLayer(m));
    donorMarkers = [];
}
