// check if all questions had already done
function checkCompletion() {
    const totalQuestions = document.querySelectorAll('.question').length; // 获取总问题数
    const answeredQuestions = document.querySelectorAll('input[type="radio"]:checked').length; // 获取已回答问题数
    return answeredQuestions === totalQuestions; // 如果已回答问题数等于总问题数，返回true
}

// submitButton
document.getElementById('submit').addEventListener('click', function() {
    if (checkCompletion()) {
        document.getElementById('quizForm').submit(); // 所有问题回答完毕，提交表单
    } else {
        alert("Please complete all the questions before submitting!"); // 如果有未回答问题，弹出提示
    }
});


    window.onload = function() {
restoreProgressFromStorage(); // 从 sessionStorage 恢复进度和选择
highlightSelected(); // 确保选项高亮
updateProgressOnSelection(); // 监听选择，更新进度
};

// resetProgressBar
function resetProgressBar() {
    const progressElement = document.getElementById('progress');
    progressElement.style.width = '0%'; // 初始化进度条
}

// updateProgressOnSelection
function updateProgressOnSelection() {
    const totalQuestions = document.querySelectorAll('.question').length; // 获取总问题数
    const radios = document.querySelectorAll('input[type="radio"]');
    const progressElement = document.getElementById('progress');

    radios.forEach(radio => {
        radio.addEventListener('change', function() {
            let answeredQuestions = 0;
            const radioGroups = new Set();

            // 遍历所有单选按钮并记录已回答问题的数量
            radios.forEach(r => {
                if (r.checked) {
                    radioGroups.add(r.name); // 通过name属性判断是哪个问题
                }
            });

            answeredQuestions = radioGroups.size;

            // 更新进度条百分比
            const progressPercentage = (answeredQuestions / totalQuestions) * 100;
            progressElement.style.width = `${progressPercentage}%`;

            // 保存用户进度和选择到 sessionStorage
            saveProgressToStorage();
        });
    });
}

// highlightSelected
function highlightSelected() {
    const radios = document.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => {
        radio.addEventListener('change', function() {
            const labels = this.closest('.scale').querySelectorAll('label');
            labels.forEach(label => label.classList.remove('highlight')); // 清除高亮
            this.parentNode.classList.add('highlight'); // 高亮选中的选项
        });
    });
}

// 保存用户选择和进度到 sessionStorage
function saveProgressToStorage() {
    const radios = document.querySelectorAll('input[type="radio"]');
    const selectedValues = {};

    radios.forEach(radio => {
        if (radio.checked) {
            selectedValues[radio.name] = radio.value; // 保存每个问题的选择值
        }
    });

    // 保存到 sessionStorage
    sessionStorage.setItem('quizProgress', JSON.stringify(selectedValues));
}

// 从 sessionStorage 恢复用户进度和选择，并确保高亮
function restoreProgressFromStorage() {
    const savedProgress = sessionStorage.getItem('quizProgress');

    if (savedProgress) {
        const selectedValues = JSON.parse(savedProgress);

        // 恢复每个问题的选择，并确保高亮
        for (const name in selectedValues) {
            const value = selectedValues[name];
            const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
            if (radio) {
                radio.checked = true;
                // 这里同时添加高亮逻辑
                const labels = radio.closest('.scale').querySelectorAll('label');
                labels.forEach(label => label.classList.remove('highlight')); // 清除高亮
                radio.parentNode.classList.add('highlight'); // 高亮选中的选项
            }
        }

        // 更新进度条
        updateProgressBar();
    }
}

// 更新进度条显示
function updateProgressBar() {
    const totalQuestions = document.querySelectorAll('.question').length;
    const answeredQuestions = document.querySelectorAll('input[type="radio"]:checked').length;
    const progressPercent = (answeredQuestions / totalQuestions) * 100;
    document.getElementById('progress').style.width = progressPercent + '%';
}

// 监听表单提交
document.getElementById('quizForm').addEventListener('submit', function(event) {
    event.preventDefault();
    calculatePersonalityScores();
});

// 监听单选按钮的改变，实时更新进度条
document.querySelectorAll('input[type="radio"]').forEach((input) => {
    input.addEventListener('change', updateProgressBar);
});


    // Calculate scores and redirect to appropriate page
    function calculatePersonalityScores() {
        const extraversion1 = parseInt(document.querySelector('input[name="extraversion1"]:checked').value);
        const extraversion2 = parseInt(document.querySelector('input[name="extraversion2"]:checked').value);
        const agreeableness1 = parseInt(document.querySelector('input[name="agreeableness1"]:checked').value);
        const agreeableness2 = parseInt(document.querySelector('input[name="agreeableness2"]:checked').value);
        const conscientiousness1 = parseInt(document.querySelector('input[name="conscientiousness1"]:checked').value);
        const conscientiousness2 = parseInt(document.querySelector('input[name="conscientiousness2"]:checked').value);
        const neuroticism1 = parseInt(document.querySelector('input[name="neuroticism1"]:checked').value);
        const neuroticism2 = parseInt(document.querySelector('input[name="neuroticism2"]:checked').value); // reverse-scored
        const openness1 = parseInt(document.querySelector('input[name="openness1"]:checked').value);
        const openness2 = parseInt(document.querySelector('input[name="openness2"]:checked').value); // reverse-scored

        function reverseScore(score) {
            return 6 - score;
        }

        const extraversionScore = extraversion1 + reverseScore(extraversion2);
        const agreeablenessScore = agreeableness1 + reverseScore(agreeableness2);
        const conscientiousnessScore = conscientiousness1 + reverseScore(conscientiousness2);
        const neuroticismScore = neuroticism1 + reverseScore(neuroticism2);
        const opennessScore = openness1 + reverseScore(openness2);

        // caculate total points 
        const totalScore = extraversionScore + agreeablenessScore + conscientiousnessScore + neuroticismScore + opennessScore;

        
        const extraversionPercentage = parseFloat(((extraversionScore / totalScore) * 100).toFixed(2));
        const agreeablenessPercentage = parseFloat(((agreeablenessScore / totalScore) * 100).toFixed(2));
        const conscientiousnessPercentage = parseFloat(((conscientiousnessScore / totalScore) * 100).toFixed(2));
        const neuroticismPercentage = parseFloat(((neuroticismScore / totalScore) * 100).toFixed(2));
        const opennessPercentage = parseFloat(((opennessScore / totalScore) * 100).toFixed(2));

        // const scores = {
        //     extraversion: extraversionScore,
        //     agreeableness: agreeablenessScore,
        //     conscientiousness: conscientiousnessScore,
        //     neuroticism: neuroticismScore,
        //     openness: opennessScore
        // };

        const percentageScores = {
            extraversion: extraversionPercentage,
            agreeableness: agreeablenessPercentage,
            conscientiousness: conscientiousnessPercentage,
            neuroticism: neuroticismPercentage,
            openness: opennessPercentage
        };

        // 将分数保存到 sessionStorage 中
        sessionStorage.setItem('personalityPercentages', JSON.stringify(percentageScores));

        // const highestTrait = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
        const highestTrait = Object.keys(percentageScores).reduce((a, b) => percentageScores[a] > percentageScores[b] ? a : b);

        switch (highestTrait) {
            case "extraversion":
                window.location.href = "extraversion_page_1.html";
                break;
            case "agreeableness":
                window.location.href = "agreeableness_page_1.html";
                break;
            case "conscientiousness":
                window.location.href = "conscientiousness_page_1.html";
                break;
            case "neuroticism":
                window.location.href = "neuroticism_page_1.html"; // Redirect to the page for Neuroticism
                break;
            case "openness":
                window.location.href = "openness_page_1.html"; // Redirect to the page for Openness
                break;
            default:
                alert("Unable to determine highest trait.");
        }
    }

    document.getElementById('quizForm').addEventListener('submit', function(event) {
        event.preventDefault();
        calculatePersonalityScores();
    });

    // Add change event listener to radio buttons for progress bar
    document.querySelectorAll('input[type="radio"]').forEach((input) => {
        input.addEventListener('change', updateProgressBar);
    });
