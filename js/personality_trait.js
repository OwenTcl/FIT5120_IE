document.addEventListener('DOMContentLoaded', function () {
    // Fetch the GeoJSON data
    fetch('suburb-2-vic.geojson')
        .then(response => response.json())
        .then(data => {
            populateSuburbDropdown(data);
        })
        .catch(error => console.error('Error fetching GeoJSON data:', error));

    function populateSuburbDropdown(geojson) {
        const dropdown = document.getElementById('suburbDropdown');
        const suburbs = new Set(); // Use a set to avoid duplicate suburbs

        geojson.features.forEach(feature => {
            const suburb = feature.properties.vic_loca_2;
            if (suburb) {
                suburbs.add(suburb);
            }
        });

        // Convert set to array and sort alphabetically
        const sortedSuburbs = Array.from(suburbs).sort();

        // Populate the dropdown with the suburb names
        sortedSuburbs.forEach(suburb => {
            const option = document.createElement('option');
            option.value = suburb;
            option.textContent = suburb;
            dropdown.appendChild(option);
        });

        // Attach event listener for suburb search
        document.getElementById('searchSuburb').addEventListener('input', function () {
            filterSuburbDropdown(sortedSuburbs, this.value.toLowerCase());
        });
    }

    function filterSuburbDropdown(suburbs, searchTerm) {
        const dropdown = document.getElementById('suburbDropdown');
        dropdown.innerHTML = ''; // Clear existing options

        // Filter and repopulate the dropdown based on the search term
        suburbs
            .filter(suburb => suburb.toLowerCase().includes(searchTerm))
            .forEach(suburb => {
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
