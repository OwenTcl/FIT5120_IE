
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

document.addEventListener('DOMContentLoaded', function () {
    // Get the suburb (LGA) and personality from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const suburb = urlParams.get('suburb');
    const personality = urlParams.get('personality');

    console.log(`Personality: ${personality}, Suburb: ${suburb}`); // Debugging check

    // Fetch activities based on the suburb and personality
    fetchActivitiesInSuburb(suburb, personality);

    // Fetch LGA boundaries from GeoJSON file
    fetch('map.geojson')
      .then(response => response.json())
      .then(geojson => {
          // Parse and store LGA boundaries (polygons)
          geojson.features.forEach(feature => {
              const lgaName = feature.properties.lga_name[0];
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

function fetchActivitiesInSuburb(suburb, personality) {
    // Fetch facilities data from the Flask API
    fetch('https://95alhmeubg.execute-api.ap-southeast-2.amazonaws.com/dev/maps')  // Replace with the correct API URL
      .then(response => response.json())
      .then(data => {
        facilitiesData = data;
        console.log('Facilities Data:', data);

        // Filter the facilities based on the personality trait
        const filteredFacilities = filterFacilitiesByPersonality(data, personality);

        // Add the filtered facilities to the map
        addFacilitiesToMap(filteredFacilities);
      })
      .catch(error => console.error('Error fetching facilities:', error));
}

// Function to filter facilities based on personality
function filterFacilitiesByPersonality(facilities, personality) {
    let recommendedCategories = [];

    // Define recommended categories for each personality trait
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

    // Filter the facilities based on the recommended categories for the personality
    return facilities.filter(facility => recommendedCategories.includes(facility.Category));
}

// Function to add facilities to the map with colored markers based on category
function addFacilitiesToMap(facilities) {
    const visibleCategories = new Set(); // Track visible categories

    facilities.forEach(facility => {
        const latitude = parseFloat(facility.Latitude);
        const longitude = parseFloat(facility.Longitude);
        const facilityName = facility.FacilityName;
        const classification = facility.Classification;
        const category = facility.Category;

        // Add a colored marker to the map for each facility
        L.circleMarker([latitude, longitude], {
            radius: 8,
            fillColor: categoryColors[category] || 'gray', // Default color if category is not found
            color: categoryColors[category] || 'gray',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(map)
          .bindPopup(`<b>${facilityName}</b><br>${classification}`);

        // Add the category to the set of visible categories
        visibleCategories.add(category);
    });

    // Add the legend based on visible categories
    addLegend(Array.from(visibleCategories));
}

// Function to add a dynamic legend to the map based on visible categories
function addLegend(visibleCategories) {
    // Remove existing legend if any
    const existingLegend = document.querySelector('.info.legend');
    if (existingLegend) {
        existingLegend.remove();
    }

    // Create a new legend
    const legend = L.control({position: 'bottomright'});

    legend.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'info legend');

        // Loop through visible categories to create the legend
        visibleCategories.forEach(category => {
            const color = categoryColors[category] || 'gray';  // Get color for the category
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
    fetchActivitiesInSuburb(suburb, personality);

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

            console.log(categories);
            console.log(maleParticipation);
            console.log(femaleParticipation);

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
    const topCategory = sortedData[0].category;
    const topParticipation = sortedData[0].total;

    return `For the personality type ${personality}, the most popular activity category is ${topCategory}, with a total participation of ${topParticipation} (in thousands).`;
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

document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const personality = urlParams.get('personality');

    // Load slideshow images based on the personality trait
    loadSlideshowImages(personality);
});

function loadSlideshowImages(personality) {
    const activityImagesDiv = document.getElementById('activityImages');
    const folderPath = `${personality}/`; // Path to the folder for the personality trait

    // Example: Dynamic list of image filenames for each personality (you could load this from a server too)
    const imageFilenames = ['activity1.jpg', 'activity2.jpg', 'activity3.jpg', 'activity4.jpg', 'activity5.jpg', 'activity6.jpg'];  // Modify this array based on actual files

    // Clear the container in case there are existing slides
    activityImagesDiv.innerHTML = '';

    // Dynamically add slides based on the number of images
    imageFilenames.forEach(filename => {
        const slideDiv = document.createElement('div');
        slideDiv.classList.add('slides', 'fade');

        const imgElement = document.createElement('img');
        imgElement.src = folderPath + filename;
        imgElement.style.width = '100%';

        slideDiv.appendChild(imgElement);
        activityImagesDiv.appendChild(slideDiv);
    });

    // Add the navigation arrows
    activityImagesDiv.innerHTML += `
        <a class="prev" onclick="plusSlides(-1)">&#10094;</a>
        <a class="next" onclick="plusSlides(1)">&#10095;</a>
    `;

    showSlides(1);  // Initialize the slideshow
}

let slideIndex = 1;
let autoSlideInterval;  // To store the interval for auto-sliding

// Function to show slides
function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("slides");

    if (n > slides.length) {
        slideIndex = 1;
    }
    if (n < 1) {
        slideIndex = slides.length;
    }

    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }

    slides[slideIndex - 1].style.display = "block";
}

// Function to advance slides manually
function plusSlides(n) {
    clearInterval(autoSlideInterval);  // Stop auto-sliding when user interacts
    slideIndex += n;
    showSlides(slideIndex);
    startAutoSlide();  // Restart auto-sliding after manual navigation
}

// Function to start auto-sliding every 3 seconds
function startAutoSlide() {
    autoSlideInterval = setInterval(function() {
        slideIndex++;
        showSlides(slideIndex);
    }, 3000);  // Change the slide every 3 seconds (3000ms)
}

// Initialize the slideshow and start auto-sliding
function initSlideshow() {
    showSlides(slideIndex);  // Show the first slide
    startAutoSlide();        // Start auto-sliding
}

// Call the initialization function after loading the images
document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const personality = urlParams.get('personality');

    loadSlideshowImages(personality);  // Load images based on personality
    initSlideshow();                   // Initialize the slideshow
});

