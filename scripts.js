// Define global variables
let diseaseData = {}; // Stores the total number of people for each disease
let ageRangeData = {}; // Stores the distribution of each disease across different age ranges
let diseasePieChart; // Stores the age range pie chart object

document.addEventListener('DOMContentLoaded', function () {
    // Use PapaParse to read the CSV file
    Papa.parse("impact_of_isolation.csv", {
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
                                size: 10,
                            },
                            boxWidth: 20,
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
                                size: 10,
                            },
                            boxWidth: 20,
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

function showCongratsMessage() {
    const congratsMessage = document.getElementById('congrats-message');
    congratsMessage.style.display = 'block';
    congratsMessage.scrollIntoView({ behavior: 'smooth' });
}

function scrollToButtons() {
    document.getElementById('action-section').scrollIntoView({ behavior: 'smooth' });
}

function updateDescription(factor) {
    const descriptions = {
        'Retirement': 'Retirement can lead to social isolation due to the loss of daily social interactions with colleagues, a disruption in routine, and potential health issues that limit mobility. Additionally, living on a fixed income might restrict participation in social activities, and changes in family dynamics can leave retirees with fewer opportunities for connection. Cultural factors and a lack of social value placed on older adults can also contribute to feelings of isolation.',
        'Due to Disability': 'Having a disability during retirement can be a significant factor in causing social isolation. Physical or cognitive disabilities may limit a person\'s ability to engage in social activities, travel, or even leave the house, reducing opportunities for interaction. Disabilities can also lead to dependence on others for daily tasks, which might make socializing feel burdensome or exhausting. Additionally, societal barriers, such as lack of accessible venues or support, can further isolate individuals with disabilities, making it challenging for them to maintain a social life.',
        'Significant life events': 'Significant life events during retirement, such as the death of a loved one, major health issues, relocation, or even the transition into retirement itself, can lead to social isolation. These events can disrupt an individual’s routine, social network, and sense of stability, making it difficult to maintain or build new relationships. The emotional impact of these events can also result in withdrawal from social activities, as individuals may struggle with grief, stress, or the challenge of adapting to new circumstances, leading to increased feelings of isolation.',
        'Low self-esteem': 'Low self-esteem during retirement can lead to social isolation by causing individuals to feel unworthy of social interaction or fear being judged by others. Retirees may struggle with feelings of inadequacy or a diminished sense of purpose, particularly if their self-worth was tied to their career or physical abilities. This can result in avoiding social situations, withdrawing from relationships, and a reluctance to engage in new activities, further deepening their sense of isolation.',
    };
    document.getElementById('description-box').textContent = descriptions[factor];
}
