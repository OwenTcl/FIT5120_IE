const questions = [
    "I am unhappy doing so many things alone.",
    "I have nobody to talk to.",
    "I cannot tolerate being so alone.",
    "I lack companionship.",
    "I feel as if nobody really understands me.",
    "I find myself waiting for people to call or write.",
    "There is no one I can turn to.",
    "I am no longer close to anyone.",
    "My interests and ideas are not shared by those around me.",
    "I feel left out.",
    "I feel completely alone.",
    "I am unable to reach out and communicate with those around me.",
    "My social relationships are superficial.",
    "I feel starved for company.",
    "No one really knows me well.",
    "I feel isolated from others.",
    "I am unhappy being so withdrawn.",
    "It is difficult for me to make friends.",
    "I feel shut out and excluded by others.",
    "People are around me but not with me."
];

let currentQuestionIndex = 0;
let totalQuestions = questions.length;
let responses = []; // Array to store user responses

function showQuestion() {
    // Display the current question
    document.getElementById("ucla-question").textContent = questions[currentQuestionIndex];

    // Highlight previously selected option if there was one
    const options = document.querySelectorAll('.option-btn');
    options.forEach(option => option.classList.remove('selected-option'));

    if (responses[currentQuestionIndex] !== undefined) {
        const selectedValue = responses[currentQuestionIndex];
        let buttonToHighlight = options[0]; // Default to first button

        if (selectedValue === 3) buttonToHighlight = options[0];
        else if (selectedValue === 2) buttonToHighlight = options[1];
        else if (selectedValue === 1) buttonToHighlight = options[2];
        else if (selectedValue === 0) buttonToHighlight = options[3];

        buttonToHighlight.classList.add('selected-option');
    }

    // Update the progress bar
    const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;
    document.getElementById("ucla-progress").style.width = progressPercentage + '%';
    document.getElementById("progress-text").textContent = Math.round(progressPercentage) + '%';

    // Show/Hide previous button
    if (currentQuestionIndex === 0) {
        document.getElementById("previous-btn").style.display = 'none';
    } else {
        document.getElementById("previous-btn").style.display = 'inline-block';
    }
}

function selectOption(button, optionValue) {
    if (!button || !button.classList) {
        console.error("The button element or its classList is undefined:", button);
        return;
    }

    let score = 0;

    // Map the options (O, S, R, N) to the appropriate score
    if (optionValue === 'O') {
        score = 3;
    } else if (optionValue === 'S') {
        score = 2;
    } else if (optionValue === 'R') {
        score = 1;
    } else if (optionValue === 'N') {
        score = 0;
    }

    // Store the response for the current question
    responses[currentQuestionIndex] = score;

    // Remove highlight from any previously selected option
    const options = document.querySelectorAll('.option-btn');
    options.forEach(option => option.classList.remove('selected-option'));

    // Highlight the clicked button
    button.classList.add('selected-option');

    // Move to the next question if not the last one
    currentQuestionIndex++;
    if (currentQuestionIndex < totalQuestions) {
        showQuestion();
    } else {
        calculateScore();
    }
}

function calculateScore() {
    // Sum up the scores of all responses
    const totalScore = responses.reduce((acc, curr) => acc + curr, 0);
    // Redirect to the results page with the score as a query parameter
    window.location.href = `ucla_test_result.html?score=${totalScore}`;
//    showResults(totalScore);
}

function previousQuestion() {
    // Go back to the previous question
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion();
    }
}

function showResults(score) {
    let resultMessage = "";

    // Interpret the total score based on the UCLA Loneliness Scale
    if (score <= 20) {
        resultMessage = "Low level of loneliness.";
    } else if (score <= 40) {
        resultMessage = "Moderate level of loneliness.";
    } else {
        resultMessage = "High level of loneliness.";
    }

    // Display the result and score
//    document.getElementById("container").style.display = 'none';
//    document.getElementById("ucla-quiz-container").innerHTML = `<h2>${resultMessage}</h2><p>Your total score is ${score}.</p>`;
}

// Start by showing the first question when the page loads
showQuestion();