document.getElementById('question-form').addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent the form from refreshing the page

    // Show the loading message and spinner
    document.getElementById('loading-message').style.display = 'block';

    // Capture user input from the form
    const response1 = document.getElementById('response1').value;
    const response2 = document.getElementById('response2').value;
    const response3 = document.getElementById('response3').value;

    // Combine all responses into one string
    const combinedResponses = response1 + " " + response2 + " " + response3;

    // Make a POST request to the external API for sentiment analysis
    fetch('https://95alhmeubg.execute-api.ap-southeast-2.amazonaws.com/dev/analysis_text', {  // Replace with your actual API endpoint
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: combinedResponses })
    })
    .then(response => response.json())
    .then(data => {
        // Store the result in sessionStorage
        sessionStorage.setItem('sentimentResult', JSON.stringify(data));

        // Redirect to the result page
        window.location.href = 'written_test_result.html';  // Make sure this page exists
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('There was an error processing your request.');
    })
    .finally(() => {
        // Hide the loading message and spinner when done
        document.getElementById('loading-message').style.display = 'none';
    });
});