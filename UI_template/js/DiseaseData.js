// Define global variables
let diseaseData = {}; // Stores the total number of people for each disease
let ageRangeData = {}; // Stores the distribution of each disease across different age ranges
let diseasePieChart; // Stores the age range pie chart object

document.addEventListener('DOMContentLoaded', function () {
    // Use PapaParse to read the CSV file
    Papa.parse("csv/impact_of_isolation.csv", {
        download: true,
        header: true,
        complete: function(results) {
            processCSVData(results.data);
        }
    });

    function processCSVData(data) {
        // Initialize diseaseData and ageRangeData
        data.forEach(row => {
            const disease = row["All causes"]?.trim();
            const persons = parseInt(row["Persons"]);
            const ageRange = row["Age Range"]?.trim();

            // Filter out blank or invalid entries
            if (disease && !isNaN(persons) && ageRange) {
                // Accumulate the total number of people for each disease
                if (!diseaseData[disease]) {
                    diseaseData[disease] = persons;
                } else {
                    diseaseData[disease] += persons;
                }

                // Accumulate the number of people with each disease across different age ranges
                if (!ageRangeData[disease]) {
                    ageRangeData[disease] = {};
                }
                if (!ageRangeData[disease][ageRange]) {
                    ageRangeData[disease][ageRange] = persons;
                } else {
                    ageRangeData[disease][ageRange] += persons;
                }
            }
        });

        const diseaseLabels = Object.keys(diseaseData);
        const diseaseValues = Object.values(diseaseData);

        createTotalPieChart(diseaseLabels, diseaseValues);
    }

    function createTotalPieChart(labels, data) {
        const ctx = document.getElementById('totalPieChart').getContext('2d');
        const totalPieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: generateColorPalette(labels.length),
                }]
            },
            plugins: [ChartDataLabels],
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            font: {
                                size: 20,
                            },
                            boxWidth: 10,
                            padding: 15,
                        }
                    },
                    datalabels: {
                        formatter: (value, context) => {
                            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            const percentage = (value / total * 100).toFixed(1) + '%';
                            return percentage;
                        },
                        color: '#fff',
                        font: {
                            weight: 'bold',
                            size: 10,
                        }
                    }
                }
            }
        });

        // Add click event handler
        document.getElementById('totalPieChart').onclick = function(evt) {
            const activePoints = totalPieChart.getElementsAtEventForMode(evt, 'nearest', { intersect: true }, true);
            if (activePoints.length > 0) {
                const firstPoint = activePoints[0];
                const label = totalPieChart.data.labels[firstPoint.index];
                showDiseasePieChart(label);
            }
        };
    }

    function showDiseasePieChart(disease) {
        const labels = Object.keys(ageRangeData[disease]);
        const data = Object.values(ageRangeData[disease]);

        // Do not display the chart if there is no age range data
        if (labels.length === 0) {
            alert('No age range data available for this disease.');
            return;
        }

        document.getElementById('ageRangeTitle').textContent = `Age Range Distribution for ${disease}`;
        document.getElementById('ageRangeSection').style.display = 'block';

        if (diseasePieChart) {
            diseasePieChart.destroy(); // Destroy the old chart instance
        }

        const ctx = document.getElementById('diseasePieChart').getContext('2d');
        diseasePieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: generateColorPalette(labels.length),
                }]
            },
            plugins: [ChartDataLabels],
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            font: {
                                size: 20,
                            },
                            boxWidth: 10,
                            padding: 15,
                        }
                    },
                    datalabels: {
                        formatter: (value, context) => {
                            const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                            const percentage = (value / total * 100).toFixed(1) + '%';
                            return percentage;
                        },
                        color: '#fff',
                        font: {
                            weight: 'bold',
                            size: 10,
                        }
                    }
                }
            }
        });
    }

    // Function to generate a color palette
    function generateColorPalette(numColors) {
        const palette = [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
            '#9966FF', '#FF9F40', '#E7E9ED', '#8A2BE2',
            '#00CED1', '#FF4500', '#2E8B57', '#FFD700'
        ];
        if (numColors <= palette.length) {
            return palette.slice(0, numColors);
        } else {
            // If more colors are needed than are available in the preset, generate random colors
            const colors = [];
            for (let i = 0; i < numColors; i++) {
                colors.push(`hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`);
            }
            return colors;
        }
    }
});
