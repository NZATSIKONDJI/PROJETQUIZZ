let currentQuestionIndex = 0;
let score = 0;
let questions = [];
let settings = {
    username: "Joueur",
    questionCount: 10,
    difficulty: "medium",
    questionType: "multiple",
    timerEnabled: "no"
};
let categoryMap = { "": "Aléatoire" };
let timerInterval = null;
const timerDurations = {
    easy: 45,
    medium: 30,
    hard: 15
};

function loadSettings() {
    const savedSettings = localStorage.getItem('quizSettings');
    if (savedSettings) {
        settings = JSON.parse(savedSettings);
        document.getElementById('username').value = settings.username;
        document.getElementById('question-count').value = settings.questionCount;
        document.getElementById('difficulty').value = settings.difficulty;
        document.getElementById('question-type').value = settings.questionType;
        document.getElementById('timer-enabled').value = settings.timerEnabled || "no";
    }
}

function saveSettings() {
    settings.username = document.getElementById('username').value || "Joueur";
    settings.questionCount = parseInt(document.getElementById('question-count').value) || 10;
    settings.difficulty = document.getElementById('difficulty').value;
    settings.questionType = document.getElementById('question-type').value;
    settings.timerEnabled = document.getElementById('timer-enabled').value;
    localStorage.setItem('quizSettings', JSON.stringify(settings));
    alert('Paramètres sauvegardés !');
    showHome();
}

function showHome() {
    hideAllScreens();
    document.getElementById('home-screen').style.display = 'block';
    document.getElementById('page-title').textContent = 'Home';
}

function showCategories() {
    hideAllScreens();
    document.getElementById('categories-screen').style.display = 'block';
    document.getElementById('page-title').textContent = 'Catégories';
    loadCategories();
}

function showSettings() {
    hideAllScreens();
    document.getElementById('settings-screen').style.display = 'block';
    document.getElementById('page-title').textContent = 'Paramètres';
    loadSettings();
}

function showLeaderboard() {
    hideAllScreens();
    document.getElementById('leaderboard-screen').style.display = 'block';
    document.getElementById('page-title').textContent = 'Classement';
    displayLeaderboard();
}

function showQuiz() {
    hideAllScreens();
    document.getElementById('quiz-screen').style.display = 'block';
    document.getElementById('page-title').textContent = 'Quiz';
}

function hideAllScreens() {
    document.getElementById('home-screen').style.display = 'none';
    document.getElementById('categories-screen').style.display = 'none';
    document.getElementById('quiz-screen').style.display = 'none';
    document.getElementById('settings-screen').style.display = 'none';
    document.getElementById('leaderboard-screen').style.display = 'none';
}

async function loadCategories() {
    try {
        const response = await fetch('https://opentdb.com/api_category.php');
        const data = await response.json();
        const select = document.getElementById('category-select');
        select.innerHTML = '<option value="">Aléatoire</option>';
        data.trivia_categories.forEach(category => {
            categoryMap[category.id] = category.name;
            select.innerHTML += `<option value="${category.id}">${category.name}</option>`;
        });
    } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
    }
}

function startTimer() {
    if (settings.timerEnabled === "no") {
        document.getElementById('timer-display').style.display = 'none';
        return;
    }

    const duration = timerDurations[settings.difficulty];
    let timeLeft = duration;
    document.getElementById('timer-display').style.display = 'block';
    document.getElementById('timer-seconds').textContent = timeLeft;

    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer-seconds').textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;
            const answersDiv = document.getElementById('answers');
            const buttons = answersDiv.getElementsByTagName('button');
            for (let button of buttons) {
                button.disabled = true;
                if (button.innerHTML === decodeHTML(questions[currentQuestionIndex].correct_answer)) {
                    button.classList.add('correct');
                } else {
                    button.classList.add('incorrect');
                }
            }
            document.getElementById('next-btn').style.display = 'block';
            document.getElementById('feedback-message').style.display = 'block';
            document.getElementById('feedback-message').textContent = 'Temps écoulé !';
            document.getElementById('feedback-message').style.color = '#F44336';
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    document.getElementById('timer-display').style.display = 'none';
}

async function startRandomQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    document.getElementById('score').textContent = `Score: ${score}`;
    document.getElementById('feedback-message').style.display = 'none';
    document.getElementById('next-btn').style.display = 'none';
    stopTimer();
    const url = `https://opentdb.com/api.php?amount=${settings.questionCount}&difficulty=${settings.difficulty}&type=${settings.questionType}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        questions = data.results;
        showQuiz();
        displayQuestion();
    } catch (error) {
        console.error('Erreur lors du chargement des questions:', error);
    }
}

async function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    document.getElementById('score').textContent = `Score: ${score}`;
    document.getElementById('feedback-message').style.display = 'none';
    document.getElementById('next-btn').style.display = 'none';
    stopTimer();
    const category = document.getElementById('category-select').value;
    const url = `https://opentdb.com/api.php?amount=${settings.questionCount}${category ? `&category=${category}` : ''}&difficulty=${settings.difficulty}&type=${settings.questionType}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        questions = data.results;
        showQuiz();
        displayQuestion();
    } catch (error) {
        console.error('Erreur lors du chargement des questions:', error);
    }
}

function displayQuestion() {
    if (currentQuestionIndex >= questions.length) {
        endQuiz();
        return;
    }

    const question = questions[currentQuestionIndex];
    document.getElementById('question').innerHTML = decodeHTML(question.question);
    const answers = [...question.incorrect_answers, question.correct_answer].sort(() => Math.random() - 0.5);
    const answersDiv = document.getElementById('answers');
    answersDiv.innerHTML = '';
    answers.forEach(answer => {
        const button = document.createElement('button');
        button.innerHTML = decodeHTML(answer);
        button.onclick = () => checkAnswer(answer, question.correct_answer);
        answersDiv.appendChild(button);
    });
    document.getElementById('next-btn').style.display = 'none';
    document.getElementById('feedback-message').style.display = 'none';
    startTimer();
}

function checkAnswer(selected, correct) {
    stopTimer();
    const answersDiv = document.getElementById('answers');
    const buttons = answersDiv.getElementsByTagName('button');
    let isCorrect = selected === correct;
    for (let button of buttons) {
        button.disabled = true;
        if (button.innerHTML === decodeHTML(correct)) {
            button.classList.add('correct');
        } else {
            button.classList.add('incorrect');
        }
    }
    document.getElementById('next-btn').style.display = 'block';
    const feedback = document.getElementById('feedback-message');
    feedback.style.display = 'block';
    feedback.textContent = isCorrect ? 'Bonne réponse !' : 'Mauvaise réponse !';
    feedback.style.color = isCorrect ? '#4CAF50' : '#F44336';
    if (isCorrect) {
        score++;
        document.getElementById('score').textContent = `Score: ${score}`;
    }
}

function nextQuestion() {
    stopTimer();
    currentQuestionIndex++;
    displayQuestion();
}

function endQuiz() {
    stopTimer();
    alert(`${settings.username}, votre score final est: ${score}/${questions.length}`);
    saveScore(document.getElementById('category-select')?.value || "", questions.length);
    showHome();
}

function saveScore(categoryId, totalQuestions) {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    const scoreEntry = {
        username: settings.username,
        score: score,
        totalQuestions: totalQuestions,
        categoryId: categoryId || "",
        difficulty: settings.difficulty,
        questionType: settings.questionType,
        timestamp: new Date().toISOString()
    };
    const existingIndex = leaderboard.findIndex(entry =>
        entry.username === settings.username &&
        entry.categoryId === scoreEntry.categoryId &&
        entry.difficulty === scoreEntry.difficulty &&
        entry.questionType === scoreEntry.questionType
    );
    if (existingIndex !== -1) {
        if (scoreEntry.score > leaderboard[existingIndex].score) {
            leaderboard[existingIndex] = scoreEntry;
        }
    } else {
        leaderboard.push(scoreEntry);
    }
    leaderboard.sort((a, b) => b.score - a.score);
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

function displayLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard') || '[]');
    const tbody = document.getElementById('leaderboard-body');
    if (!tbody) {
        console.error('Élément leaderboard-body non trouvé');
        return;
    }
    tbody.innerHTML = '';
    if (leaderboard.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">Aucun score enregistré</td></tr>';
        return;
    }
    leaderboard.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${entry.username}</td>
            <td>${entry.score}/${entry.totalQuestions}</td>
            <td>${categoryMap[entry.categoryId] || 'Aléatoire'}</td>
            <td>${entry.difficulty.charAt(0).toUpperCase() + entry.difficulty.slice(1)}</td>
            <td>${entry.questionType === 'multiple' ? 'Choix multiple' : 'Vrai/Faux'}</td>
        `;
        tbody.appendChild(row);
    });
}

function decodeHTML(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    showHome();
});