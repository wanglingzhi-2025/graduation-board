// Quiz Module
// Handles quiz functionality with multiple-choice questions

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const currentUser = Utils.checkAuth();
    if (!currentUser) return;

    // Get DOM elements
    const quizSetup = document.getElementById('quizSetup');
    const quizScreen = document.getElementById('quizScreen');
    const resultsScreen = document.getElementById('resultsScreen');
    const startQuizBtn = document.getElementById('startQuizBtn');
    const nextBtn = document.getElementById('nextBtn');
    const retryBtn = document.getElementById('retryBtn');
    const backToDashboardBtn = document.getElementById('backToDashboardBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const quizCategory = document.getElementById('quizCategory');
    const availableWordsEl = document.getElementById('availableWords');

    // Quiz state
    let quizState = {
        words: [],
        questions: [],
        currentQuestionIndex: 0,
        score: 0,
        startTime: null,
        questionCount: 10,
        selectedCategory: '',
        answers: []
    };

    // Initialize
    loadWords();
    setupEventListeners();

    // Setup event listeners
    function setupEventListeners() {
        // Question count buttons
        document.querySelectorAll('.count-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                quizState.questionCount = parseInt(btn.dataset.count);
                updateAvailableWords();
            });
        });

        // Category filter
        quizCategory.addEventListener('change', () => {
            quizState.selectedCategory = quizCategory.value;
            updateAvailableWords();
        });

        // Start quiz
        startQuizBtn.addEventListener('click', startQuiz);

        // Next button
        nextBtn.addEventListener('click', nextQuestion);

        // Retry button
        retryBtn.addEventListener('click', () => {
            resetQuiz();
            showScreen('setup');
        });

        // Back to dashboard
        backToDashboardBtn.addEventListener('click', () => {
            window.location.href = 'dashboard.html';
        });

        // Logout
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('确定要退出登录吗？')) {
                    Utils.logout();
                }
            });
        }
    }

    // Load words
    function loadWords() {
        const allWords = Storage.getWords(currentUser);
        quizState.words = allWords;
        
        // Populate category filter
        const categories = Utils.getCategories(allWords);
        quizCategory.innerHTML = '<option value="">所有分类</option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            quizCategory.appendChild(option);
        });

        updateAvailableWords();
    }

    // Update available words count
    function updateAvailableWords() {
        let availableWords = quizState.words;
        
        if (quizState.selectedCategory) {
            availableWords = availableWords.filter(w => w.category === quizState.selectedCategory);
        }

        availableWordsEl.textContent = availableWords.length;

        // Disable start button if not enough words
        if (availableWords.length < 4) {
            startQuizBtn.disabled = true;
            startQuizBtn.textContent = '单词不足（至少需要4个）';
        } else if (availableWords.length < quizState.questionCount) {
            startQuizBtn.disabled = false;
            startQuizBtn.textContent = `开始测验（最多${availableWords.length}题）`;
        } else {
            startQuizBtn.disabled = false;
            startQuizBtn.textContent = '开始测验';
        }
    }

    // Start quiz
    function startQuiz() {
        // Filter words by category
        let availableWords = quizState.words;
        if (quizState.selectedCategory) {
            availableWords = availableWords.filter(w => w.category === quizState.selectedCategory);
        }

        // Check if enough words
        if (availableWords.length < 4) {
            alert('单词数量不足，至少需要4个单词才能开始测验');
            return;
        }

        // Adjust question count if needed
        const actualQuestionCount = Math.min(quizState.questionCount, availableWords.length);

        // Generate questions
        quizState.questions = generateQuestions(availableWords, actualQuestionCount);
        quizState.currentQuestionIndex = 0;
        quizState.score = 0;
        quizState.startTime = Date.now();
        quizState.answers = [];

        // Show quiz screen
        showScreen('quiz');
        displayQuestion();
        startTimer();
    }

    // Generate quiz questions
    function generateQuestions(words, count) {
        const selectedWords = Utils.getRandomItems(words, count);
        
        return selectedWords.map(word => {
            // Get wrong answers (3 random definitions from other words)
            const otherWords = words.filter(w => w.id !== word.id);
            const wrongAnswers = Utils.getRandomItems(otherWords, 3).map(w => w.definition);
            
            // Combine correct and wrong answers
            const options = Utils.shuffleArray([
                { text: word.definition, correct: true },
                ...wrongAnswers.map(def => ({ text: def, correct: false }))
            ]);

            return {
                word: word,
                options: options,
                selectedAnswer: null,
                correct: false
            };
        });
    }

    // Display current question
    function displayQuestion() {
        const question = quizState.questions[quizState.currentQuestionIndex];
        
        // Update progress
        document.getElementById('currentQuestion').textContent = quizState.currentQuestionIndex + 1;
        document.getElementById('totalQuestions').textContent = quizState.questions.length;
        
        // Update progress bar
        const progress = ((quizState.currentQuestionIndex + 1) / quizState.questions.length) * 100;
        document.getElementById('progressFill').style.width = `${progress}%`;

        // Display word
        document.getElementById('questionWord').textContent = question.word.word;

        // Display options
        const optionsContainer = document.getElementById('optionsContainer');
        optionsContainer.innerHTML = question.options.map((option, index) => `
            <button class="option-btn" data-index="${index}">
                ${Utils.escapeHTML(option.text)}
            </button>
        `).join('');

        // Add click handlers to options
        optionsContainer.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', () => selectAnswer(parseInt(btn.dataset.index)));
        });

        // Disable next button
        nextBtn.disabled = true;
    }

    // Select answer
    function selectAnswer(optionIndex) {
        const question = quizState.questions[quizState.currentQuestionIndex];
        const selectedOption = question.options[optionIndex];
        
        // Mark as selected
        question.selectedAnswer = optionIndex;
        question.correct = selectedOption.correct;

        // Update UI
        const optionButtons = document.querySelectorAll('.option-btn');
        optionButtons.forEach((btn, index) => {
            btn.disabled = true;
            
            if (question.options[index].correct) {
                btn.classList.add('correct');
            } else if (index === optionIndex) {
                btn.classList.add('incorrect');
            }
        });

        // Update score
        if (selectedOption.correct) {
            quizState.score++;
        }

        // Update word statistics
        const word = question.word;
        word.reviewCount = (word.reviewCount || 0) + 1;
        if (selectedOption.correct) {
            word.correctCount = (word.correctCount || 0) + 1;
        } else {
            word.incorrectCount = (word.incorrectCount || 0) + 1;
        }
        Storage.updateWord(currentUser, word.id, word);

        // Store answer
        quizState.answers.push({
            word: word.word,
            definition: word.definition,
            selectedAnswer: selectedOption.text,
            correct: selectedOption.correct
        });

        // Enable next button
        nextBtn.disabled = false;
        nextBtn.focus();
    }

    // Next question
    function nextQuestion() {
        quizState.currentQuestionIndex++;

        if (quizState.currentQuestionIndex < quizState.questions.length) {
            displayQuestion();
        } else {
            finishQuiz();
        }
    }

    // Start timer
    function startTimer() {
        const timerEl = document.getElementById('timer');
        
        const updateTimer = () => {
            if (quizState.startTime) {
                const elapsed = Math.floor((Date.now() - quizState.startTime) / 1000);
                timerEl.textContent = Utils.formatTime(elapsed);
            }
        };

        updateTimer();
        const timerInterval = setInterval(() => {
            if (quizScreen.classList.contains('active')) {
                updateTimer();
            } else {
                clearInterval(timerInterval);
            }
        }, 1000);
    }

    // Finish quiz
    function finishQuiz() {
        const duration = Math.floor((Date.now() - quizState.startTime) / 1000);
        const totalQuestions = quizState.questions.length;
        const percentage = Utils.calculateScore(quizState.score, totalQuestions);

        // Save quiz result
        const quizResult = {
            id: Utils.generateId(),
            date: new Date().toISOString(),
            score: quizState.score,
            totalQuestions: totalQuestions,
            duration: duration,
            words: quizState.questions.map(q => q.word.id)
        };
        Storage.saveQuiz(currentUser, quizResult);

        // Display results
        displayResults(percentage, duration, totalQuestions);
        showScreen('results');
    }

    // Display results
    function displayResults(percentage, duration, totalQuestions) {
        // Update score display
        document.getElementById('scorePercentage').textContent = percentage;
        document.getElementById('correctCount').textContent = quizState.score;
        document.getElementById('totalCount').textContent = totalQuestions;
        document.getElementById('timeTaken').textContent = Utils.formatTime(duration);
        document.getElementById('accuracyRate').textContent = `${percentage}%`;

        // Update icon and message
        const resultsIcon = document.getElementById('resultsIcon');
        resultsIcon.textContent = Utils.getScoreEmoji(percentage);

        // Display wrong answers
        const wrongAnswers = quizState.answers.filter(a => !a.correct);
        const wrongAnswersList = document.getElementById('wrongAnswersList');
        const wrongAnswersSection = document.getElementById('wrongAnswers');

        if (wrongAnswers.length === 0) {
            wrongAnswersSection.style.display = 'none';
        } else {
            wrongAnswersSection.style.display = 'block';
            wrongAnswersList.innerHTML = wrongAnswers.map(answer => `
                <div class="wrong-answer-item">
                    <div class="word">${Utils.escapeHTML(answer.word)}</div>
                    <div class="definition">✅ 正确答案：${Utils.escapeHTML(answer.definition)}</div>
                    <div class="your-answer">❌ 你的答案：${Utils.escapeHTML(answer.selectedAnswer)}</div>
                </div>
            `).join('');
        }
    }

    // Show screen
    function showScreen(screen) {
        quizSetup.classList.remove('active');
        quizScreen.classList.remove('active');
        resultsScreen.classList.remove('active');

        switch (screen) {
            case 'setup':
                quizSetup.classList.add('active');
                break;
            case 'quiz':
                quizScreen.classList.add('active');
                break;
            case 'results':
                resultsScreen.classList.add('active');
                break;
        }
    }

    // Reset quiz
    function resetQuiz() {
        quizState = {
            words: quizState.words,
            questions: [],
            currentQuestionIndex: 0,
            score: 0,
            startTime: null,
            questionCount: 10,
            selectedCategory: '',
            answers: []
        };
        
        // Reset UI
        document.querySelectorAll('.count-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.count === '10') {
                btn.classList.add('active');
            }
        });
        
        quizCategory.value = '';
        updateAvailableWords();
    }
});

// Made with Bob
