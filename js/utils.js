// Utility Functions Module
// Common helper functions used across the app

const Utils = {
    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Simple hash function for passwords
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString(36);
    },

    // Validate username
    validateUsername(username) {
        if (!username || username.trim().length < 3) {
            return { valid: false, message: '用户名至少需要3个字符' };
        }
        if (username.length > 20) {
            return { valid: false, message: '用户名不能超过20个字符' };
        }
        if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(username)) {
            return { valid: false, message: '用户名只能包含字母、数字、下划线和中文' };
        }
        return { valid: true };
    },

    // Validate password
    validatePassword(password) {
        if (!password || password.length < 6) {
            return { valid: false, message: '密码至少需要6个字符' };
        }
        return { valid: true };
    },

    // Validate word
    validateWord(word) {
        if (!word || word.trim().length === 0) {
            return { valid: false, message: '单词不能为空' };
        }
        return { valid: true };
    },

    // Validate definition
    validateDefinition(definition) {
        if (!definition || definition.trim().length === 0) {
            return { valid: false, message: '释义不能为空' };
        }
        return { valid: true };
    },

    // Show message
    showMessage(elementId, message, type = 'info') {
        const messageEl = document.getElementById(elementId);
        if (!messageEl) return;

        messageEl.textContent = message;
        messageEl.className = `message ${type} show`;

        // Auto hide after 3 seconds
        setTimeout(() => {
            messageEl.classList.remove('show');
        }, 3000);
    },

    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return '今天';
        } else if (days === 1) {
            return '昨天';
        } else if (days < 7) {
            return `${days}天前`;
        } else {
            return date.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        }
    },

    // Format time duration
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },

    // Shuffle array (Fisher-Yates algorithm)
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    },

    // Get random items from array
    getRandomItems(array, count) {
        const shuffled = this.shuffleArray(array);
        return shuffled.slice(0, Math.min(count, array.length));
    },

    // Sanitize HTML to prevent XSS
    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    },

    // Escape HTML
    escapeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    // Check if user is logged in
    checkAuth() {
        const currentUser = Storage.getCurrentUser();
        if (!currentUser) {
            window.location.href = 'index.html';
            return false;
        }
        return currentUser;
    },

    // Logout user
    logout() {
        Storage.logout();
        window.location.href = 'index.html';
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Get random tip
    getRandomTip() {
        const tips = [
            '每天坚持学习，养成良好的学习习惯！',
            '复习是记忆的关键，定期回顾学过的单词。',
            '尝试在句子中使用新学的单词，加深记忆。',
            '制定学习计划，每天学习一定数量的单词。',
            '使用联想记忆法，将单词与图像或故事联系起来。',
            '不要害怕犯错，错误是学习的一部分。',
            '多做测验，检验自己的学习成果。',
            '将单词按主题分类，便于系统学习。',
            '利用碎片时间学习，积少成多。',
            '保持积极的学习态度，相信自己能够进步！'
        ];
        return tips[Math.floor(Math.random() * tips.length)];
    },

    // Calculate quiz score percentage
    calculateScore(correct, total) {
        if (total === 0) return 0;
        return Math.round((correct / total) * 100);
    },

    // Get score emoji
    getScoreEmoji(percentage) {
        if (percentage >= 90) return '🎉';
        if (percentage >= 80) return '😊';
        if (percentage >= 70) return '👍';
        if (percentage >= 60) return '😐';
        return '😢';
    },

    // Get score message
    getScoreMessage(percentage) {
        if (percentage >= 90) return '太棒了！继续保持！';
        if (percentage >= 80) return '很好！再接再厉！';
        if (percentage >= 70) return '不错！继续努力！';
        if (percentage >= 60) return '还可以，需要多加练习。';
        return '加油！多复习会更好！';
    },

    // Sort words
    sortWords(words, sortBy) {
        const sorted = [...words];
        switch (sortBy) {
            case 'date-desc':
                return sorted.sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate));
            case 'date-asc':
                return sorted.sort((a, b) => new Date(a.addedDate) - new Date(b.addedDate));
            case 'alpha-asc':
                return sorted.sort((a, b) => a.word.localeCompare(b.word));
            case 'alpha-desc':
                return sorted.sort((a, b) => b.word.localeCompare(a.word));
            case 'review-desc':
                return sorted.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
            default:
                return sorted;
        }
    },

    // Filter words
    filterWords(words, searchTerm, category) {
        let filtered = words;

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(word =>
                word.word.toLowerCase().includes(term) ||
                word.definition.toLowerCase().includes(term) ||
                (word.example && word.example.toLowerCase().includes(term))
            );
        }

        // Filter by category
        if (category) {
            filtered = filtered.filter(word => word.category === category);
        }

        return filtered;
    },

    // Get unique categories from words
    getCategories(words) {
        const categories = new Set();
        words.forEach(word => {
            if (word.category) {
                categories.add(word.category);
            }
        });
        return Array.from(categories).sort();
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}

// Made with Bob
