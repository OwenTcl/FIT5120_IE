
// Create a map and set its initial view to a default location (e.g., Melbourne)
let map = L.map('map').setView([-37.815237, 144.950171], 12); // Centered on Melbourne

// Add a tile layer to the map (the map appearance)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Store the fetched facility data and LGA boundaries
let facilitiesData = [];
let lgaBoundaries = {}; // Store LGA boundaries (polygons)

// Define marker colors based on the category
const categoryColors = {
    "Social Sports": "red",
    "Dancing": "blue",
    "Adventure Activities": "green",
    "Volunteering": "orange",
    "Group Fitness": "purple",
    "Team Sports": "yellow",
    "Organized Sports": "pink",
    "Crafts and Hobbies": "brown",
    "Mindfulness and Relaxation": "lightblue",
    "Low-Stress Hobbies": "darkgreen",
    "Artistic Pursuits": "violet",
    "Traveling": "lightgreen",
    "Innovative Hobbies": "darkred"
};

// Function to determine marker color based on the first matching category
function getCategoryColor(categories) {
    // Split the category string by commas and trim spaces
    const facilityCategories = categories.split(',').map(cat => cat.trim());

    // Find the first category that has a defined color
    for (const category of facilityCategories) {
        if (categoryColors[category]) {
            return categoryColors[category];  // Return the first matching category color
        }
    }

    // Return a default color if no matching category is found
    return 'gray';  // Default color for unmatched categories
}

document.addEventListener('DOMContentLoaded', function () {
    // Get the suburb (LGA) and personality from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const suburb = urlParams.get('suburb');
    const personality = urlParams.get('personality');

    console.log(`Personality: ${personality}, Suburb: ${suburb}`); // Debugging check

    // Ensure that both suburb and personality are valid
    if (suburb && personality) {
        // Get the relevant categories based on personality
        const recommendedCategories = getRelevantCategories(personality);

        // Load CSVs for each recommended category
        recommendedCategories.forEach(category => {
            loadCSVForCategory(category, suburb, personality);
        });
    } else {
        console.error("Suburb or personality not found in URL parameters.");
    }

    // Fetch LGA boundaries from GeoJSON file
    fetch('suburb-2-vic.geojson')
      .then(response => response.json())
      .then(geojson => {
          // Parse and store LGA boundaries (polygons)
          geojson.features.forEach(feature => {
              const lgaName = feature.properties.vic_loca_2;
              const polygonCoordinates = feature.geometry.coordinates; // Assuming it's a polygon

              if (lgaName && polygonCoordinates) {
                  lgaBoundaries[lgaName] = polygonCoordinates;
              }
          });

          // After storing the LGA boundaries, move the camera to the selected LGA and highlight it
          moveToAndHighlightLGA(suburb);
      })
      .catch(error => console.error('Error fetching LGA boundaries:', error));
});

// Function to move the camera to the selected LGA and highlight its boundary
function moveToAndHighlightLGA(suburb) {
    const polygon = lgaBoundaries[suburb]; // Get the polygon for the selected LGA

    if (!polygon) {
        console.error('No polygon found for the selected LGA');
        return;
    }

    // Convert the polygon coordinates to a format that Leaflet can handle
    const leafletPolygon = polygon[0].map(point => [point[1], point[0]]); // Leaflet expects [lat, lon]

    // Highlight the LGA boundary by adding it to the map
    const lgaLayer = L.polygon(leafletPolygon, {
        color: 'blue',   // Boundary color
        weight: 3,       // Boundary thickness
        fillColor: 'lightblue', // Fill color inside the LGA
        fillOpacity: 0.3  // Opacity of the fill
    }).addTo(map);

    // Move the camera to fit the bounds of the selected LGA
    map.fitBounds(lgaLayer.getBounds());

    // Optional: Add a popup to the polygon (e.g., showing the LGA name)
    lgaLayer.bindPopup(`<b>${suburb}</b>`).openPopup();
}

// Store all facilities across all categories
let allFacilities = [];
let visibleCategories = new Set();

function loadCSVForCategory(category, suburb, personality) {
    // Build the CSV filename based on the category
    const csvFileName = `category_table_${category.replace(/\s+/g, '_')}.csv`;

    // Load the CSV file using PapaParse
    Papa.parse(csvFileName, {
        download: true,
        header: true,
        complete: function(results) {
            const data = results.data;
            console.log(`Loaded data for category ${category}:`, data);

            // Filter the facilities by personality and suburb
            const { allRecommendedFacilities, facilitiesInSuburb } = filterFacilitiesByPersonality(data, suburb, personality);

            // Collect all facilities globally
            allFacilities.push(...allRecommendedFacilities);

            // Add the category to the global set of visible categories
            visibleCategories.add(category);

            // Add all recommended facilities to the map
            addFacilitiesToMap(allRecommendedFacilities);

            // After all CSVs are loaded, update the legend
            addLegend(Array.from(visibleCategories));
        },
        error: function(error) {
            console.error(`Error loading ${csvFileName}:`, error);
        }
    });
}

// Function to filter facilities based on personality
function filterFacilitiesByPersonality(facilities, suburb, personality) {
    let recommendedCategories = getRelevantCategories(personality);

    // Define recommended categories for each personality trait
    if (personality === "Extroversion") {
        recommendedCategories = ["Social_Sports", "Dancing", "Adventure_Activities"];
        document.getElementById('activityDetails').innerHTML = `
            <ul>
                <li>Adventure activities combine nature exploration with moderate physical challenges, helping older adults interact with the outdoors while improving cardiovascular health and muscle strength. These activities also promote mental well-being.</li>
            </ul>
            <ul>
                <li>Dancing not only serves as physical exercise but also as an excellent way for older adults to engage socially and improve mental well-being, offering enjoyable group activities.</li>
            </ul>
            <ul>
                <li>Social sports combine light physical activity with social interaction, providing older adults with an enjoyable way to stay active while connecting with others.</li>
            </ul>
        `;

    } else if (personality === "Agreeableness") {
        recommendedCategories = ["Volunteering", "Group_Fitness", "Team_Sports"];
        document.getElementById('activityDetails').innerHTML = `
            <ul>
                <li>Volunteering gives older adults the opportunity to stay active while contributing to the community, enhancing self-worth and maintaining physical and mental activity.</li>
            </ul>
            <ul>
                <li>Group fitness encourages older adults to participate in fitness activities alongside others, boosting teamwork while promoting both social interaction and physical health.</li>
            </ul>
            <ul>
                <li>Team sports foster cooperation and competition, helping older adults develop teamwork and cooperation skills while improving physical fitness.</li>
            </ul>
        `;
    } else if (personality === "Conscientiousness") {
        recommendedCategories = ["Organized_Sports", "Crafts_and_Hobbies"];
        document.getElementById('activityDetails').innerHTML = `
            <ul>
                <li>Organized sports involve structured games with set rules and teamwork, making them suitable for older adults to enjoy friendly competition while promoting physical health.</li>
            </ul>
            <ul>
                <li>Craft hobbies improve hand-eye coordination and provide a sense of accomplishment by creating tangible items. These activities are ideal for older adults who enjoy hands-on projects to relieve stress.</li>
            </ul>
        `;
    } else if (personality === "Neuroticism") {
        recommendedCategories = ["Mindfulness_and_Relaxation", "Low-Stress_Hobbies"];
        document.getElementById('activityDetails').innerHTML = `
            <ul>
                <li>Mindfulness and relaxation activities help older adults reduce anxiety and stress by focusing on balance and relaxation, enhancing mental health and overall well-being.</li>
            </ul>
            <ul>
                <li>Low-stress hobbies provide a relaxed, low-intensity form of exercise that helps older adults stay physically active without exerting too much effort, offering a calm and enjoyable atmosphere.</li>
            </ul>
        `;
    } else if (personality === "Openness to Experience") {
        recommendedCategories = ["Artistic_Pursuits", "Traveling", "Innovative_Hobbies"];
        document.getElementById('activityDetails').innerHTML = `
            <ul>
                <li>Artistic pursuits offer a channel for self-expression and emotional release, helping older adults maintain cognitive function and creative thinking. These activities also encourage social interaction through art.</li>
            </ul>
            <ul>
                <li>Travelling offers older adults opportunities to explore new environments, experience different cultures, relax, and improve mental well-being.</li>
            </ul>
            <ul>
                <li>Innovative hobbies introduce unique and fun experiences that encourage older adults to try new things, adding diversity and excitement to their daily routines.</li>
            </ul>
        `;
    }

    // Filter all facilities that match the recommended categories
    const allRecommendedFacilities = facilities.filter(facility => {
        return recommendedCategories.includes(facility.category.replace(/\s+/g, '_'));
    });

    // Filter facilities that are specifically in the selected suburb
    const facilitiesInSuburb = allRecommendedFacilities.filter(facility => {
        return facility.suburb && facility.suburb.toLowerCase() === suburb.toLowerCase();
    });

    // Return both the all recommended facilities and those in the suburb
    return {
        allRecommendedFacilities,
        facilitiesInSuburb
    };
}

// Function to add facilities to the map with colored markers based on category
function addFacilitiesToMap(facilities) {
    facilities.forEach(facility => {
        const latitude = parseFloat(facility.lat);
        const longitude = parseFloat(facility.lon);

        // Check if lat/lon are valid numbers
        if (isNaN(latitude) || isNaN(longitude)) {
            console.log(`Invalid coordinates for facility: ${facility.name}, Lat: ${latitude}, Lon: ${longitude}`);
            return;  // Skip this facility if coordinates are invalid
        }

        const facilityName = facility.name;
        const category = facility.category.trim(); // Ensure category is trimmed and consistent
        const type = facility.type;

        // Debugging: Check which categories are being added
        console.log(`Adding facility: ${facilityName}, Category: ${category}`);

        // Add a colored marker to the map for each facility
        L.circleMarker([latitude, longitude], {
            radius: 8,
            fillColor: getCategoryColor(category) || 'gray',
            color: getCategoryColor(category) || 'gray',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(map)
          .bindPopup(`<b>${facilityName}</b><br>${type}`);
    });
}

// Function to add a dynamic legend to the map based on visible categories
function addLegend(visibleCategories) {
    // Remove existing legend if any
    const existingLegend = document.querySelector('.info.legend');
    if (existingLegend) {
        existingLegend.remove();
    }

    // Create a new legend
    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'info legend');
        div.innerHTML = '<h4>Legend</h4>';  // Add a title for clarity

        // Debugging: Log visible categories in the legend
        console.log('Legend Categories:', visibleCategories);

        // Loop through visible categories to create the legend
        visibleCategories.forEach(category => {
            const color = getCategoryColor(category) || 'gray';  // Get color for the category
            div.innerHTML +=
                `<i style="background: ${color}; width: 18px; height: 18px; display: inline-block; margin-right: 8px;"></i> ${category}<br>`;
        });

        return div;
    };

    legend.addTo(map);
}

document.addEventListener('DOMContentLoaded', function () {
    // Get the suburb and personality from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const suburb = urlParams.get('suburb');
    const personality = urlParams.get('personality');

    // Fetch activities based on the suburb and personality
//    fetchActivitiesInSuburb(suburb, personality);

    // Load the CSV file using PapaParse
    Papa.parse('people_counts_by_category.csv', {
        download: true,
        header: true,
        complete: function(results) {
            const data = results.data;

            // Extract only the categories that align with the personality trait
            const relevantCategories = getRelevantCategories(personality);
            const filteredData = data.filter(item => relevantCategories.includes(item.Categories));

            // Extract categories, 'Male' and 'Female' columns from the filtered data
            let categories = filteredData.map(item => item.Categories);
            let maleParticipation = filteredData.map(item => parseFloat(item.Male));
            let femaleParticipation = filteredData.map(item => parseFloat(item.Female));

            // Sort the data from highest to lowest based on the sum of 'Male' and 'Female' participation
            const sortedData = categories
                .map((category, index) => ({
                    category,
                    male: maleParticipation[index],
                    female: femaleParticipation[index],
                    total: maleParticipation[index] + femaleParticipation[index]
                }))
                .sort((a, b) => b.total - a.total);

            categories = sortedData.map(item => item.category);
            maleParticipation = sortedData.map(item => item.male);
            femaleParticipation = sortedData.map(item => item.female);

//            console.log(categories);
//            console.log(maleParticipation);
//            console.log(femaleParticipation);

            // Call the function to plot the chart with the sorted data
            plotStackedChart(categories, maleParticipation, femaleParticipation);

            // Generate a dynamic description
            const description = generateDescription(personality, sortedData);
            document.getElementById('chartDescription').innerText = description;
        }
    });
});

// Function to get relevant categories based on the personality
function getRelevantCategories(personality) {
    let recommendedCategories = [];

    if (personality === "Extroversion") {
        recommendedCategories = ["Social Sports", "Dancing", "Adventure Activities"];
    } else if (personality === "Agreeableness") {
        recommendedCategories = ["Volunteering", "Group Fitness", "Team Sports"];
    } else if (personality === "Conscientiousness") {
        recommendedCategories = ["Organized Sports", "Crafts and Hobbies"];
    } else if (personality === "Neuroticism") {
        recommendedCategories = ["Mindfulness and Relaxation", "Low-Stress Hobbies"];
    } else if (personality === "Openness to Experience") {
        recommendedCategories = ["Artistic Pursuits", "Traveling", "Innovative Hobbies"];
    }

    return recommendedCategories;
};

// Function to generate a dynamic description based on the personality and data
function generateDescription(personality, sortedData) {
//    const topCategory = sortedData[0].category;
//    const topParticipation = sortedData[0].total;

    let description = `For the personality type ${personality}, the most popular activities are:\n\n`;
//    console.log(sortedData)

    // Dynamically add categories from sortedData
    sortedData.forEach((item, index) => {
        description += `${index + 1}. ${item.category}\n`;
    });

    return description;
};

// Function to plot the stacked bar chart using Chart.js
function plotStackedChart(categories, maleParticipation, femaleParticipation) {
    const ctx = document.getElementById('activityChart').getContext('2d');
    const activityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories,  // Sorted activity categories
            datasets: [{
                label: 'Male Participation (thousands)',
                data: maleParticipation,  // Male participation for each category
                backgroundColor: 'rgba(54, 162, 235, 0.7)',  // Color for male bars
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            },
            {
                label: 'Female Participation (thousands)',
                data: femaleParticipation,  // Female participation for each category
                backgroundColor: 'rgba(255, 99, 132, 0.7)',  // Color for female bars
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    stacked: true  // Stack the x-axis
                },
                y: {
                    beginAtZero: true,
                    stacked: true  // Stack the y-axis
                }
            },
        }
    });
};

