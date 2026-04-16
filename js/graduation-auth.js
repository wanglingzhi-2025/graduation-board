// Graduation Message Board - Authentication System
// Preset accounts for students and teachers

class GraduationAuth {
    constructor() {
        this.initializeAccounts();
        this.setupEventListeners();
    }

    initializeAccounts() {
        // Check if accounts are already initialized
        if (!localStorage.getItem('graduation_accounts_initialized')) {
            const accounts = [];

            // Create 45 student accounts (stu001 - stu045)
            for (let i = 1; i <= 45; i++) {
                const username = `stu${String(i).padStart(3, '0')}`;
                accounts.push({
                    username: username,
                    password: username, // Default password same as username
                    role: 'student',
                    name: `学生${i}`,
                    school: '第一中学',
                    class: '8年1班'
                });
            }

            // Create 10 teacher accounts (tch001 - tch010)
            for (let i = 1; i <= 10; i++) {
                const username = `tch${String(i).padStart(3, '0')}`;
                accounts.push({
                    username: username,
                    password: username, // Default password same as username
                    role: 'teacher',
                    name: `教师${i}`,
                    school: '第一中学',
                    class: '8年1班'
                });
            }

            localStorage.setItem('graduation_accounts', JSON.stringify(accounts));
            localStorage.setItem('graduation_accounts_initialized', 'true');
            console.log('Accounts initialized:', accounts.length);
        }
    }

    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Set default values
        document.getElementById('school').value = '第一中学';
        document.getElementById('class').value = '8年1班';
    }

    handleLogin(e) {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const school = document.getElementById('school').value;
        const classValue = document.getElementById('class').value;

        // Get all accounts
        const accounts = JSON.parse(localStorage.getItem('graduation_accounts') || '[]');

        // Find matching account
        const account = accounts.find(acc => 
            acc.username === username && acc.password === password
        );

        if (account) {
            // Update account with selected school and class
            account.school = school;
            account.class = classValue;

            // Save updated accounts
            const accountIndex = accounts.findIndex(acc => acc.username === username);
            accounts[accountIndex] = account;
            localStorage.setItem('graduation_accounts', JSON.stringify(accounts));

            // Store current user session
            const session = {
                username: account.username,
                name: account.name,
                role: account.role,
                school: school,
                class: classValue,
                loginTime: new Date().toISOString()
            };

            localStorage.setItem('graduation_current_user', JSON.stringify(session));

            // Show success message
            this.showMessage('登录成功！正在跳转...', 'success');

            // Redirect to message board
            setTimeout(() => {
                window.location.href = 'message-board.html';
            }, 1000);
        } else {
            this.showMessage('用户名或密码错误！', 'error');
        }
    }

    showMessage(message, type) {
        // Remove existing message
        const existingMsg = document.querySelector('.auth-message');
        if (existingMsg) {
            existingMsg.remove();
        }

        // Create new message
        const msgDiv = document.createElement('div');
        msgDiv.className = `auth-message ${type}`;
        msgDiv.textContent = message;

        const loginBox = document.querySelector('.login-box');
        loginBox.insertBefore(msgDiv, loginBox.firstChild);

        // Auto remove after 3 seconds
        setTimeout(() => {
            msgDiv.remove();
        }, 3000);
    }

    static checkAuth() {
        const currentUser = localStorage.getItem('graduation_current_user');
        if (!currentUser) {
            window.location.href = 'graduation.html';
            return null;
        }
        return JSON.parse(currentUser);
    }

    static logout() {
        localStorage.removeItem('graduation_current_user');
        window.location.href = 'graduation.html';
    }

    static getCurrentUser() {
        const userStr = localStorage.getItem('graduation_current_user');
        return userStr ? JSON.parse(userStr) : null;
    }

    static getAllUsers() {
        const accounts = JSON.parse(localStorage.getItem('graduation_accounts') || '[]');
        return accounts;
    }
}

// Initialize authentication system
document.addEventListener('DOMContentLoaded', () => {
    new GraduationAuth();
});

// Made with Bob
