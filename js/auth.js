// Authentication Module
// Handles user login and registration

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    const currentUser = Storage.getCurrentUser();
    if (currentUser) {
        window.location.href = 'dashboard.html';
        return;
    }

    // Get DOM elements
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginFormElement = document.getElementById('loginFormElement');
    const registerFormElement = document.getElementById('registerFormElement');
    const showRegisterLink = document.getElementById('showRegister');
    const showLoginLink = document.getElementById('showLogin');
    const messageEl = document.getElementById('message');

    // Toggle between login and register forms
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
        messageEl.classList.remove('show');
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.remove('active');
        loginForm.classList.add('active');
        messageEl.classList.remove('show');
    });

    // Handle login
    loginFormElement.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;

        // Validate inputs
        if (!username || !password) {
            Utils.showMessage('message', '请输入用户名和密码', 'error');
            return;
        }

        // Check if user exists
        const user = Storage.getUser(username);
        if (!user) {
            Utils.showMessage('message', '用户不存在', 'error');
            return;
        }

        // Verify password
        const hashedPassword = Utils.hashPassword(password);
        if (user.password !== hashedPassword) {
            Utils.showMessage('message', '密码错误', 'error');
            return;
        }

        // Update login info
        Storage.updateUserLogin(username);

        // Set current user
        Storage.setCurrentUser(username);

        // Show success message and redirect
        Utils.showMessage('message', '登录成功！正在跳转...', 'success');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    });

    // Handle registration
    registerFormElement.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('registerUsername').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validate username
        const usernameValidation = Utils.validateUsername(username);
        if (!usernameValidation.valid) {
            Utils.showMessage('message', usernameValidation.message, 'error');
            return;
        }

        // Validate password
        const passwordValidation = Utils.validatePassword(password);
        if (!passwordValidation.valid) {
            Utils.showMessage('message', passwordValidation.message, 'error');
            return;
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            Utils.showMessage('message', '两次输入的密码不一致', 'error');
            return;
        }

        // Check if user already exists
        const existingUser = Storage.getUser(username);
        if (existingUser) {
            Utils.showMessage('message', '用户名已存在', 'error');
            return;
        }

        // Create new user
        const newUser = {
            username: username,
            password: Utils.hashPassword(password),
            createdAt: new Date().toISOString(),
            lastLogin: null,
            loginStreak: 0
        };

        // Save user
        if (Storage.saveUser(username, newUser)) {
            Utils.showMessage('message', '注册成功！请登录', 'success');
            
            // Clear form
            registerFormElement.reset();
            
            // Switch to login form after 1.5 seconds
            setTimeout(() => {
                registerForm.classList.remove('active');
                loginForm.classList.add('active');
                
                // Pre-fill username in login form
                document.getElementById('loginUsername').value = username;
                document.getElementById('loginPassword').focus();
            }, 1500);
        } else {
            Utils.showMessage('message', '注册失败，请重试', 'error');
        }
    });

    // Add some sample words for demo purposes (optional)
    // This can be removed in production
    const addSampleWords = (username) => {
        const sampleWords = [
            {
                id: Utils.generateId(),
                word: 'apple',
                definition: '苹果；苹果树',
                example: 'I like to eat apples.',
                category: '水果',
                addedDate: new Date().toISOString(),
                reviewCount: 0,
                correctCount: 0,
                incorrectCount: 0
            },
            {
                id: Utils.generateId(),
                word: 'book',
                definition: '书；书籍',
                example: 'I am reading a book.',
                category: '学习',
                addedDate: new Date().toISOString(),
                reviewCount: 0,
                correctCount: 0,
                incorrectCount: 0
            },
            {
                id: Utils.generateId(),
                word: 'computer',
                definition: '计算机；电脑',
                example: 'I use my computer every day.',
                category: '科技',
                addedDate: new Date().toISOString(),
                reviewCount: 0,
                correctCount: 0,
                incorrectCount: 0
            },
            {
                id: Utils.generateId(),
                word: 'happy',
                definition: '快乐的；幸福的',
                example: 'I am very happy today.',
                category: '情感',
                addedDate: new Date().toISOString(),
                reviewCount: 0,
                correctCount: 0,
                incorrectCount: 0
            },
            {
                id: Utils.generateId(),
                word: 'study',
                definition: '学习；研究',
                example: 'I study English every day.',
                category: '学习',
                addedDate: new Date().toISOString(),
                reviewCount: 0,
                correctCount: 0,
                incorrectCount: 0
            }
        ];

        Storage.saveWords(username, sampleWords);
    };

    // Uncomment the following to add sample words on registration
    // Modify the registration success handler above to include:
    // addSampleWords(username);
});

// Made with Bob
