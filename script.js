document.addEventListener('DOMContentLoaded', () => {
    const mapDiv = document.getElementById('map');
    const generateBtn = document.getElementById('generateBtn');
    const radiusInput = document.getElementById('radius');
    const statusText = document.getElementById('status');

    let map = null;
    let userMarker = null;
    let pointMarker = null;

    // --- 1. GEOLOCATION AND MAP INITIALIZATION ---

    // Function to initialize the map once location is found
    function initMap(lat, lng) {
        if (map) return; // Map is already initialized

        map = L.map(mapDiv).setView([lat, lng], 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        userMarker = L.marker([lat, lng], {
            icon: L.icon({
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41]
            })
        }).addTo(map).bindPopup("Your Location").openPopup();
    }

    // Get the user's current location
    function getLocation() {
        statusText.textContent = 'Finding your location...';
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    initMap(lat, lng);
                    statusText.textContent = 'Location found. Ready to generate!';
                    generateBtn.disabled = false;
                },
                (error) => {
                    statusText.textContent = `Error: Geolocation failed (${error.code}). Please enable location services.`;
                    console.error("Geolocation Error:", error);
                }
            );
        } else {
            statusText.textContent = "Geolocation is not supported by this browser.";
        }
    }

    // --- 2. COORDINATE GENERATION LOGIC ---

    /**
     * Generates a random coordinate (latitude, longitude) within a given radius 
     * (in meters) of a central point.
     * @param {number} centerLat - Center latitude.
     * @param {number} centerLng - Center longitude.
     * @param {number} radius - The radius in meters.
     * @returns {{lat: number, lng: number}} The random coordinate.
     */
    function getRandomPointInRadius(centerLat, centerLng, radius) {
        // Simple pseudo-random generation using trigonometry
        const R = 6378137; // Earth's radius in meters
        
        // 1. Pick a random angle (0 to 2*pi)
        const angle = Math.random() * 2 * Math.PI;

        // 2. Pick a random distance (0 to radius). We use sqrt(rand) to ensure
        // uniform distribution over the area, not just along the radius.
        const distance = Math.sqrt(Math.random()) * radius;

        // Calculate delta latitude (approximate)
        const dLat = (distance / R) * Math.cos(angle);
        
        // Calculate delta longitude (approximate, adjusted for latitude)
        const dLng = (distance / (R * Math.cos(Math.PI * centerLat / 180))) * Math.sin(angle);

        const newLat = centerLat + (dLat * 180 / Math.PI);
        const newLng = centerLng + (dLng * 180 / Math.PI);

        return { lat: newLat, lng: newLng };
    }

    // --- 3. EVENT HANDLER ---

    function handleGenerate() {
        if (!map || !userMarker) {
            statusText.textContent = 'Map not initialized. Please wait for location.';
            return;
        }

        const centerLat = userMarker.getLatLng().lat;
        const centerLng = userMarker.getLatLng().lng;
        const radius = parseFloat(radiusInput.value);

        if (isNaN(radius) || radius <= 0) {
            statusText.textContent = 'Please enter a valid radius.';
            return;
        }

        statusText.textContent = 'Generating random point...';
        
        // Generate the random coordinates
        const randomPoint = getRandomPointInRadius(centerLat, centerLng, radius);

        // Remove old marker if it exists
        if (pointMarker) {
            map.removeLayer(pointMarker);
        }

        // Add a new marker for the generated point
        pointMarker = L.marker([randomPoint.lat, randomPoint.lng], {
            icon: L.icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41]
            })
        }).addTo(map)
          .bindPopup(`**Random Point**<br>Lat: ${randomPoint.lat.toFixed(6)}<br>Lng: ${randomPoint.lng.toFixed(6)}`)
          .openPopup();

        // Optionally, center the map to include both points
        const bounds = L.latLngBounds(userMarker.getLatLng(), pointMarker.getLatLng());
        map.fitBounds(bounds, { padding: [50, 50] });

        statusText.textContent = `Point generated! Lat: ${randomPoint.lat.toFixed(4)}, Lng: ${randomPoint.lng.toFixed(4)}`;
    }

    // Initial setup
    generateBtn.disabled = true; // Disable until location is found
    generateBtn.addEventListener('click', handleGenerate);
    getLocation();
});
