// Storage Management Module
// Handles all localStorage operations for the vocabulary app

const Storage = {
    // Keys for localStorage
    KEYS: {
        USERS: 'vocab_users',
        CURRENT_USER: 'vocab_current_user',
        WORDS: 'vocab_words',
        QUIZZES: 'vocab_quizzes'
    },

    // Get data from localStorage
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    },

    // Set data to localStorage
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error writing to localStorage:', error);
            return false;
        }
    },

    // Remove data from localStorage
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    },

    // Clear all app data
    clearAll() {
        try {
            Object.values(this.KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    },

    // User Management
    getUsers() {
        return this.get(this.KEYS.USERS) || {};
    },

    saveUser(username, userData) {
        const users = this.getUsers();
        users[username] = userData;
        return this.set(this.KEYS.USERS, users);
    },

    getUser(username) {
        const users = this.getUsers();
        return users[username] || null;
    },

    getCurrentUser() {
        return this.get(this.KEYS.CURRENT_USER);
    },

    setCurrentUser(username) {
        return this.set(this.KEYS.CURRENT_USER, username);
    },

    logout() {
        return this.remove(this.KEYS.CURRENT_USER);
    },

    // Word Management
    getWords(username) {
        const allWords = this.get(this.KEYS.WORDS) || {};
        return allWords[username] || [];
    },

    saveWords(username, words) {
        const allWords = this.get(this.KEYS.WORDS) || {};
        allWords[username] = words;
        return this.set(this.KEYS.WORDS, allWords);
    },

    addWord(username, word) {
        const words = this.getWords(username);
        words.push(word);
        return this.saveWords(username, words);
    },

    updateWord(username, wordId, updatedWord) {
        const words = this.getWords(username);
        const index = words.findIndex(w => w.id === wordId);
        if (index !== -1) {
            words[index] = { ...words[index], ...updatedWord };
            return this.saveWords(username, words);
        }
        return false;
    },

    deleteWord(username, wordId) {
        const words = this.getWords(username);
        const filteredWords = words.filter(w => w.id !== wordId);
        return this.saveWords(username, filteredWords);
    },

    // Quiz Management
    getQuizzes(username) {
        const allQuizzes = this.get(this.KEYS.QUIZZES) || {};
        return allQuizzes[username] || [];
    },

    saveQuiz(username, quiz) {
        const quizzes = this.getQuizzes(username);
        quizzes.push(quiz);
        // Keep only last 20 quizzes
        if (quizzes.length > 20) {
            quizzes.shift();
        }
        const allQuizzes = this.get(this.KEYS.QUIZZES) || {};
        allQuizzes[username] = quizzes;
        return this.set(this.KEYS.QUIZZES, allQuizzes);
    },

    // Update user login info
    updateUserLogin(username) {
        const user = this.getUser(username);
        if (!user) return false;

        const now = new Date();
        const today = now.toDateString();
        const lastLogin = user.lastLogin ? new Date(user.lastLogin).toDateString() : null;

        // Calculate streak
        if (lastLogin) {
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toDateString();

            if (lastLogin === today) {
                // Same day, no change
            } else if (lastLogin === yesterdayStr) {
                // Consecutive day
                user.loginStreak = (user.loginStreak || 0) + 1;
            } else {
                // Streak broken
                user.loginStreak = 1;
            }
        } else {
            // First login
            user.loginStreak = 1;
        }

        user.lastLogin = now.toISOString();
        return this.saveUser(username, user);
    },

    // Get user statistics
    getUserStats(username) {
        const words = this.getWords(username);
        const quizzes = this.getQuizzes(username);
        const user = this.getUser(username);

        const totalQuizzes = quizzes.length;
        const avgScore = totalQuizzes > 0
            ? Math.round(quizzes.reduce((sum, q) => sum + q.score, 0) / totalQuizzes)
            : 0;

        return {
            totalWords: words.length,
            loginStreak: user?.loginStreak || 0,
            totalQuizzes,
            avgScore
        };
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Storage;
}

// Made with Bob
