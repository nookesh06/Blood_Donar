// Blood Donor Management - professional map and donor list
let map;
let myLocation = null;
let myMarker = null;
let markerCluster = null;
let routingControl = null;
let donorMarkers = [];
let currentDonors = [];
let selectedDonorId = null;

const API_BASE = "http://localhost:8800/api/donor/search";

document.addEventListener("DOMContentLoaded", initMap);

function initMap() {
  map = L.map("map", { zoomControl: false }).setView([20.5937, 78.9629], 5);
  L.control.zoom({ position: "topright" }).addTo(map);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(map);
  markerCluster = L.markerClusterGroup({ showCoverageOnHover: false, spiderfyOnMaxZoom: true });
  map.addLayer(markerCluster);

  document.getElementById("searchForm").addEventListener("submit", event => {
    event.preventDefault();
    loadDonors();
  });
  document.getElementById("locateBtn").addEventListener("click", locateMe);
  document.getElementById("clearCity").addEventListener("click", () => {
    document.getElementById("city").value = "";
    loadDonors();
  });
  document.getElementById("sortDonors").addEventListener("change", renderDonorList);

  loadDonors();
  // Try to get the user's location without blocking the initial donor search.
  locateMe(false);
}

function locateMe(showError = true) {
  if (!navigator.geolocation) {
    if (showError) alert("Geolocation is not supported by this browser.");
    return;
  }
  setMapStatus("Finding your location…");
  navigator.geolocation.getCurrentPosition(position => {
    myLocation = [position.coords.latitude, position.coords.longitude];
    if (myMarker) map.removeLayer(myMarker);
    // Keep Leaflet's standard pin icon; only add the permanent label "You".
    myMarker = L.marker(myLocation, { zIndexOffset: 1500 })
      .addTo(map)
      .bindTooltip("You", {
        permanent: true,
        direction: "top",
        offset: [0, -28],
        className: "you-tooltip"
      })
      .bindPopup("<strong>You are here</strong>");
    map.setView(myLocation, 13);
    setMapStatus("Your location is shown on the map");
    // Re-render distances and nearest ordering once location is known.
    renderDonorList();
    updateDistancesAndNearest();
  }, error => {
    console.warn("Geolocation unavailable:", error.message);
    setMapStatus("Allow location access to see distances and routes");
    if (showError) alert("Unable to access your location. Allow location permission and try again.");
  }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
}

async function loadDonors() {
  const bloodGroup = document.getElementById("blood_group").value.trim();
  const city = document.getElementById("city").value.trim();
  const params = new URLSearchParams();
  if (bloodGroup) params.append("bloodGroup", bloodGroup);
  if (city) params.append("city", city);

  updateSearchSummary(bloodGroup, city);
  setMapStatus("Searching donors…");
  const url = `${API_BASE}?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`API returned HTTP ${response.status}`);
    const payload = await response.json();
    const donors = Array.isArray(payload) ? payload : (payload.donors || payload.content || []);
    currentDonors = donors.filter(hasValidCoordinates);
    markerCluster.clearLayers();
    donorMarkers = [];
    selectedDonorId = null;

    currentDonors.forEach((donor, index) => addDonorMarker(donor, index));
    document.getElementById("donor_count").textContent = donors.length;
    document.getElementById("list_count").textContent = `(${currentDonors.length})`;
    renderDonorList();
    updateDistancesAndNearest();

    if (donorMarkers.length) {
      const bounds = markerCluster.getBounds();
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [35, 35], maxZoom: 13 });
      setMapStatus(`${currentDonors.length} donor location(s) shown`);
    } else {
      setMapStatus("No donors with valid map coordinates found");
    }
  } catch (error) {
    console.error("Donor search failed:", error);
    document.getElementById("donorList").innerHTML = '<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i><p>Could not load donors. Check that the Spring Boot API is running.</p></div>';
    document.getElementById("donor_count").textContent = "0";
    document.getElementById("list_count").textContent = "(0)";
    setMapStatus("API connection failed");
  }
}

function updateSearchSummary(bloodGroup, city) {
  const summary = document.getElementById("searchSummary");
  summary.replaceChildren();
  const text = bloodGroup && city
    ? `Showing donors with blood group ${bloodGroup} in ${city}.`
    : bloodGroup
      ? `Showing all donors with blood group ${bloodGroup}, across all locations.`
      : city
        ? `Showing donors of all blood groups in ${city}.`
        : "Showing all blood donors across all locations.";
  summary.textContent = text;
}

function hasValidCoordinates(donor) {
  const lat = Number(donor.latitude);
  const lng = Number(donor.longitude);
  return donor.latitude !== null && donor.latitude !== undefined && donor.latitude !== "" &&
    donor.longitude !== null && donor.longitude !== undefined && donor.longitude !== "" &&
    Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

function addDonorMarker(donor, index) {
  const lat = Number(donor.latitude);
  const lng = Number(donor.longitude);
  const marker = L.marker([lat, lng]); // Standard Leaflet pin retained for donors.
  marker.bindPopup(() => createDonorPopup(donor));
  marker.on("click", () => selectDonor(donor, marker));
  markerCluster.addLayer(marker);
  donorMarkers.push({ donor, marker, lat, lng, index });
}

function createDonorPopup(donor) {
  const popup = document.createElement("div");
  popup.className = "donor-popup";
  const head = document.createElement("div");
  head.className = "donor-popup-head";
  const avatar = document.createElement("div");
  avatar.className = "popup-avatar";
  avatar.innerHTML = '<i class="fa-solid fa-user"></i>';
  const info = document.createElement("div");
  const name = document.createElement("div");
  name.className = "popup-name";
  name.textContent = donor.userName || "Blood Donor";
  const status = document.createElement("div");
  status.className = "popup-status";
  status.textContent = "● Available";
  const blood = document.createElement("span");
  blood.className = "popup-blood";
  blood.textContent = donor.bloodGroup || "N/A";
  status.appendChild(blood);
  info.append(name, status);
  head.append(avatar, info);

  const body = document.createElement("div");
  body.className = "donor-popup-body";
  const distance = myLocation ? `${getDistance(myLocation[0], myLocation[1], Number(donor.latitude), Number(donor.longitude))} km from you` : "Enable location to calculate";
  addPopupDetail(body, "fa-solid fa-location-dot", "City", donor.city || "Not available");
  addPopupDetail(body, "fa-solid fa-phone", "Mobile", donor.mobileNumber || "Not available");
  addPopupDetail(body, "fa-solid fa-route", "Distance", distance);
  const routeButton = document.createElement("button");
  routeButton.type = "button";
  routeButton.className = "popup-route";
  routeButton.innerHTML = '<i class="fa-solid fa-car"></i> &nbsp; Show Route';
  routeButton.addEventListener("click", () => showRoute(Number(donor.latitude), Number(donor.longitude)));
  body.appendChild(routeButton);
  popup.append(head, body);
  return popup;
}

function addPopupDetail(parent, iconClass, label, value) {
  const row = document.createElement("div");
  row.className = "popup-detail";
  const icon = document.createElement("i");
  icon.className = iconClass;
  const text = document.createElement("span");
  const labelText = document.createElement("span");
  labelText.textContent = `${label}: `;
  const strong = document.createElement("strong");
  strong.textContent = value;
  text.append(labelText, strong);
  row.append(icon, text);
  parent.appendChild(row);
}

function renderDonorList() {
  const list = document.getElementById("donorList");
  list.replaceChildren();
  const sortBy = document.getElementById("sortDonors").value;
  const sorted = [...donorMarkers];
  if (sortBy === "nearest" && myLocation) {
    sorted.sort((a, b) => distanceNumber(a) - distanceNumber(b));
  } else if (sortBy === "name") {
    sorted.sort((a, b) => (a.donor.userName || "").localeCompare(b.donor.userName || ""));
  } else if (sortBy === "blood") {
    sorted.sort((a, b) => (a.donor.bloodGroup || "").localeCompare(b.donor.bloodGroup || ""));
  }
  document.getElementById("list_count").textContent = `(${sorted.length})`;
  if (!sorted.length) {
    list.innerHTML = '<div class="empty-state"><i class="fa-solid fa-droplet"></i><p>No donors with valid coordinates match this search.</p></div>';
    return;
  }
  sorted.forEach(item => {
    const donor = item.donor;
    const card = document.createElement("article");
    card.className = "donor-card";
    if (selectedDonorId === donorIdentity(donor)) card.classList.add("selected");
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `View ${donor.userName || "donor"} on map`);
    const avatar = document.createElement("div");
    avatar.className = "donor-avatar";
    avatar.innerHTML = '<i class="fa-solid fa-user"></i>';
    const main = document.createElement("div");
    main.className = "donor-card-main";
    const top = document.createElement("div");
    top.className = "donor-card-top";
    const name = document.createElement("span");
    name.className = "donor-card-name";
    name.textContent = donor.userName || "Blood Donor";
    const availability = document.createElement("span");
    availability.className = "availability";
    availability.textContent = "Available";
    top.append(name, availability);
    const distance = document.createElement("span");
    distance.className = "donor-distance";
    distance.textContent = myLocation ? `${distanceNumber(item).toFixed(1)} km` : "— km";
    top.appendChild(distance);
    const blood = document.createElement("span");
    blood.className = "blood-pill";
    blood.textContent = donor.bloodGroup || "N/A";
    const city = makeMeta("fa-solid fa-location-dot", donor.city || "Location not available");
    const phone = makeMeta("fa-solid fa-phone", donor.mobileNumber || "Phone not available");
    main.append(top, blood, city, phone);
    card.append(avatar, main);
    card.addEventListener("click", () => selectDonor(donor, item.marker));
    card.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") { event.preventDefault(); selectDonor(donor, item.marker); }
    });
    list.appendChild(card);
  });
}

function makeMeta(iconClass, value) {
  const row = document.createElement("div");
  row.className = "donor-meta";
  const icon = document.createElement("i");
  icon.className = iconClass;
  const text = document.createElement("span");
  text.textContent = value;
  row.append(icon, text);
  return row;
}

function selectDonor(donor, marker) {
  selectedDonorId = donorIdentity(donor);
  map.setView(marker.getLatLng(), Math.max(map.getZoom(), 13));
  markerCluster.zoomToShowLayer(marker, () => marker.openPopup());
  renderDonorList();
  document.querySelectorAll(".donor-card").forEach(card => {
    if (card.getAttribute("aria-label") === `View ${donor.userName || "donor"} on map`) card.classList.add("selected");
  });
}

function donorIdentity(donor) {
  return `${donor.userName || ""}|${donor.mobileNumber || ""}|${donor.latitude}|${donor.longitude}`;
}
function distanceNumber(item) {
  if (!myLocation) return Number.POSITIVE_INFINITY;
  return Number(getDistance(myLocation[0], myLocation[1], item.lat, item.lng));
}
function updateDistancesAndNearest() {
  renderDonorList();
}
function getDistance(lat1, lon1, lat2, lon2) {
  const radius = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  const safeA = Math.max(0, Math.min(1, a));
  return (radius * 2 * Math.atan2(Math.sqrt(safeA), Math.sqrt(1 - safeA))).toFixed(2);
}

function showRoute(lat, lng) {
  if (!myLocation) {
    alert("Click 'Use My Location' and allow location access before requesting directions.");
    return;
  }
  closeRoute();
  routingControl = L.Routing.control({
    waypoints: [L.latLng(myLocation[0], myLocation[1]), L.latLng(lat, lng)],
    routeWhileDragging: false,
    show: true,
    collapsible: true,
    createMarker: () => null
  }).addTo(map);
  routingControl.on("routesfound", () => {
    const container = routingControl && routingControl.getContainer();
    if (!container || container.querySelector(".close-directions-btn")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "close-directions-btn";
    button.textContent = "Close Directions";
    button.style.cssText = "margin:8px;padding:7px 10px;border:0;border-radius:6px;background:#df1f2d;color:#fff;cursor:pointer";
    button.addEventListener("click", closeRoute);
    container.appendChild(button);
  });
}
function closeRoute() {
  if (routingControl) {
    map.removeControl(routingControl);
    routingControl = null;
  }
}
function setMapStatus(message) {
  const status = document.getElementById("mapStatus");
  if (status) status.textContent = message;
}
async function refreshDonorLocation() {
  const emailId = localStorage.getItem("emailId");

  if (!emailId || !navigator.geolocation) {
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const locationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };

      try {
        const response = await fetch(
          `/api/donor/update-current-location?emailId=${encodeURIComponent(emailId)
          }`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(locationData)
          }
        );

        if (!response.ok) {
          console.error("Could not update donor location.");
        }
      } catch (error) {
        console.error("Location update failed:", error);
      }
    },
    (error) => {
      console.warn("Current location unavailable:", error.message);
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }
  );
}

document.addEventListener("DOMContentLoaded", refreshDonorLocation);