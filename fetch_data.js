// Create a map and set its initial view to a default location (e.g., Australia)
let map = L.map('map').setView([-37.815237, 144.950171], 12); // Centered on Australia

// Add a tile layer to the map (the map appearance)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Store the fetched facility data
let facilitiesData = [];

// Fetch facilities data from the Flask API
fetch('https://95alhmeubg.execute-api.ap-southeast-2.amazonaws.com/dev/maps')  // Replace with the correct API URL
  .then(response => {
    console.log('Response status:', response.status);
    return response.json();
  })
  .then(data => {
    facilitiesData = data;
    console.log('Facilities Data:', data);
  })
  .catch(error => console.error('Error fetching facilities:', error));

// Event listeners for the sport buttons
document.querySelectorAll('.sport-button').forEach(button => {
  button.addEventListener('click', function() {
    const sport = button.getAttribute('data-sport');  // Get the sport name from the button
    displayFacilitiesAndStatistics(sport);
  });
});

// Function to filter and display facilities based on the selected sport
function displayFacilitiesAndStatistics(sport) {
  // Filter facilities based on the "Classification" (specific sport) field
  const filteredFacilities = facilitiesData.filter(facility =>
    facility.Classification.toLowerCase().includes(sport.toLowerCase())
  );

  // Clear previous facilities and statistics
//  document.getElementById('facilities-list').innerHTML = '';
  document.getElementById('statistic').innerHTML = '';

  // Clear previous markers on the map
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });

  // Display filtered facilities and update the map with markers
  filteredFacilities.forEach(facility => {
    let facilityItem = document.createElement('li');
    facilityItem.textContent = `Name: ${facility.FacilityName}, Category: ${facility.Category}, Location: (${facility.Latitude}, ${facility.Longitude})`;
//    document.getElementById('facilities-list').appendChild(facilityItem);

    // Add a marker for the facility on the map
    let marker = L.marker([facility.Latitude, facility.Longitude]).addTo(map);
    marker.bindPopup(`<b>${facility.FacilityName}</b><br>Category: ${facility.Category}<br>Classification: ${facility.Classification}`).openPopup();
  });

  // Display statistics (e.g., number of facilities for this sport)
  let statItem = document.createElement('li');
  statItem.textContent = `Total Facilities for ${sport}: ${filteredFacilities.length}`;
  document.getElementById('statistic').appendChild(statItem);
}
