document.addEventListener('DOMContentLoaded', function () {
    // Fetch the GeoJSON data
    fetch('map.geojson')
        .then(response => response.json())
        .then(data => {
            populateSuburbDropdown(data);
        })
        .catch(error => console.error('Error fetching GeoJSON data:', error));

    function populateSuburbDropdown(geojson) {
        const dropdown = document.getElementById('suburbDropdown');

        const suburbs = new Set(); // Use a set to avoid duplicate suburbs
        geojson.features.forEach(feature => {
            const suburb = feature.properties.lga_name[0];
            if (suburb) {
                suburbs.add(suburb);
            }
        });

        // Create an empty array to store the values for sorting
        let arrsub = [];

        // Push all the values in suburbs set into the array
        for (let suburb of suburbs){
            arrsub.push(suburb);
        }

        // Sort the array and clear the old set
        arrsub.sort();
        suburbs.clear();

        // Add back all the sorted value into the set
        for (let suburb of arrsub){
            suburbs.add(suburb);
        }

        // Populate the dropdown with the suburb names
        suburbs.forEach(suburb => {
            const option = document.createElement('option');
            option.value = suburb;
            option.textContent = suburb;
            dropdown.appendChild(option);
        });
    }
});

// Event listener for submitting suburb
document.getElementById('submitSuburb').addEventListener('click', function() {
    const selectedSuburb = document.getElementById('suburbDropdown').value;
    const personality = document.getElementById('personalityType').textContent;

    if (selectedSuburb) {
        // Redirect to the activities page with both suburb and personality as query parameters
        window.location.href = `show_activities.html?suburb=${selectedSuburb}&personality=${personality}`;
    } else {
        alert('Please select a suburb.');
    }
});