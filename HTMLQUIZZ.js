let currentQuestionIndex = 0;
let score = 0;
let questions = [];
let settings = {
    username: "Joueur",
    questionCount: 10,
    difficulty: "medium",
    questionType: "multiple"
};
let categoryMap = { "": "Aléatoire" };

function loadSettings() {
    const savedSettings = localStorage.getItem('quizSettings');
    if (savedSettings) {
        settings = JSON.parse(savedSettings);
        document.getElementById('username').value = settings.username;
        document.getElementById('question-count').value = settings.questionCount;
        document.getElementById('difficulty').value = settings.difficulty;
        document.getElementById('question-type').value = settings.questionType;
    }
}

function saveSettings() {
    settings.username = document.getElementById('username').value || "Joueur";
    settings.questionCount = parseInt(document.getElementById('question-count').value) || 10;
    settings.difficulty = document.getElementById('difficulty').value;
    settings.questionType = document.getElementById('question-type').value;
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

async function startRandomQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    document.getElementById('score').textContent = `Score: ${score}`;
    document.getElementById('feedback-message').style.display = 'none';
    document.getElementById('next-btn').style.display = 'none';
    
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
    
    const answers = [...question.incorrect_answers, question.correct_answer]
        .sort(() => Math.random() - 0.5);
    
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
}

function checkAnswer(selected, correct) {
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
    currentQuestionIndex++;
    displayQuestion();
}

function endQuiz() {
    alert(`${settings.username}, votre score final est: ${score}/${questions.length}`);
    saveScore(document.getElementById('category-select')?.value || "", questions.length);
    showHome();
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