// Dashboard Module
// Handles main dashboard functionality

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const currentUser = Utils.checkAuth();
    if (!currentUser) return;

    // Get DOM elements
    const usernameEl = document.getElementById('username');
    const loginStreakEl = document.getElementById('loginStreak');
    const totalWordsEl = document.getElementById('totalWords');
    const totalQuizzesEl = document.getElementById('totalQuizzes');
    const avgScoreEl = document.getElementById('avgScore');
    const recentQuizzesEl = document.getElementById('recentQuizzes');
    const dailyTipEl = document.getElementById('dailyTip');
    const logoutBtn = document.getElementById('logoutBtn');
    const viewStatsBtn = document.getElementById('viewStatsBtn');

    // Display username
    if (usernameEl) {
        usernameEl.textContent = currentUser;
    }

    // Load user statistics
    loadStatistics();

    // Load recent quizzes
    loadRecentQuizzes();

    // Display random tip
    if (dailyTipEl) {
        dailyTipEl.textContent = Utils.getRandomTip();
    }

    // Handle logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('确定要退出登录吗？')) {
                Utils.logout();
            }
        });
    }

    // Handle view stats button
    if (viewStatsBtn) {
        viewStatsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showDetailedStats();
        });
    }

    // Load and display statistics
    function loadStatistics() {
        const stats = Storage.getUserStats(currentUser);

        if (loginStreakEl) {
            loginStreakEl.textContent = stats.loginStreak;
        }

        if (totalWordsEl) {
            totalWordsEl.textContent = stats.totalWords;
        }

        if (totalQuizzesEl) {
            totalQuizzesEl.textContent = stats.totalQuizzes;
        }

        if (avgScoreEl) {
            avgScoreEl.textContent = stats.avgScore;
        }
    }

    // Load and display recent quizzes
    function loadRecentQuizzes() {
        if (!recentQuizzesEl) return;

        const quizzes = Storage.getQuizzes(currentUser);
        
        if (quizzes.length === 0) {
            recentQuizzesEl.innerHTML = '<p class="no-data">暂无测验记录</p>';
            return;
        }

        // Show last 5 quizzes
        const recentQuizzes = quizzes.slice(-5).reverse();
        
        recentQuizzesEl.innerHTML = recentQuizzes.map(quiz => {
            const percentage = Utils.calculateScore(quiz.score, quiz.totalQuestions);
            const emoji = Utils.getScoreEmoji(percentage);
            
            return `
                <div class="quiz-item">
                    <div class="quiz-info">
                        <h4>${emoji} ${Utils.formatDate(quiz.date)}</h4>
                        <p>${quiz.totalQuestions}题 · 用时 ${Utils.formatTime(quiz.duration)}</p>
                    </div>
                    <div class="quiz-score">${percentage}%</div>
                </div>
            `;
        }).join('');
    }

    // Show detailed statistics (could be expanded)
    function showDetailedStats() {
        const stats = Storage.getUserStats(currentUser);
        const quizzes = Storage.getQuizzes(currentUser);
        const words = Storage.getWords(currentUser);

        let message = `📊 详细统计\n\n`;
        message += `👤 用户：${currentUser}\n`;
        message += `🔥 连续登录：${stats.loginStreak} 天\n`;
        message += `📖 单词总数：${stats.totalWords} 个\n`;
        message += `✅ 测验次数：${stats.totalQuizzes} 次\n`;
        message += `🎯 平均分数：${stats.avgScore}%\n\n`;

        if (quizzes.length > 0) {
            const bestScore = Math.max(...quizzes.map(q => 
                Utils.calculateScore(q.score, q.totalQuestions)
            ));
            message += `🏆 最高分数：${bestScore}%\n`;
        }

        if (words.length > 0) {
            const categories = Utils.getCategories(words);
            message += `📚 分类数量：${categories.length} 个\n`;
        }

        alert(message);
    }

    // Update stats periodically (every 30 seconds)
    setInterval(() => {
        loadStatistics();
    }, 30000);
});

// Made with Bob
