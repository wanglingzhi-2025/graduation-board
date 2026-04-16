// Vocabulary Management Module
// Handles word CRUD operations and display

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const currentUser = Utils.checkAuth();
    if (!currentUser) return;

    // Get DOM elements
    const addWordBtn = document.getElementById('addWordBtn');
    const wordModal = document.getElementById('wordModal');
    const deleteModal = document.getElementById('deleteModal');
    const wordForm = document.getElementById('wordForm');
    const wordList = document.getElementById('wordList');
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortBy = document.getElementById('sortBy');
    const wordCountEl = document.getElementById('wordCount');
    const logoutBtn = document.getElementById('logoutBtn');
    const categoryList = document.getElementById('categoryList');

    // Modal close buttons
    const closeButtons = document.querySelectorAll('.close');
    const cancelBtn = document.getElementById('cancelBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    // State
    let currentWords = [];
    let editingWordId = null;
    let deletingWordId = null;

    // Initialize
    loadWords();
    setupEventListeners();

    // Setup event listeners
    function setupEventListeners() {
        // Add word button
        addWordBtn.addEventListener('click', () => {
            openModal();
        });

        // Word form submit
        wordForm.addEventListener('submit', handleWordSubmit);

        // Search input
        searchInput.addEventListener('input', Utils.debounce(() => {
            displayWords();
        }, 300));

        // Category filter
        categoryFilter.addEventListener('change', () => {
            displayWords();
        });

        // Sort by
        sortBy.addEventListener('change', () => {
            displayWords();
        });

        // Close modal buttons
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                closeModals();
            });
        });

        cancelBtn.addEventListener('click', () => {
            closeModals();
        });

        cancelDeleteBtn.addEventListener('click', () => {
            closeModals();
        });

        // Confirm delete
        confirmDeleteBtn.addEventListener('click', handleDelete);

        // Close modal on outside click
        window.addEventListener('click', (e) => {
            if (e.target === wordModal) {
                closeModals();
            }
            if (e.target === deleteModal) {
                closeModals();
            }
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

    // Load words from storage
    function loadWords() {
        currentWords = Storage.getWords(currentUser);
        updateCategoryFilter();
        updateCategoryDatalist();
        displayWords();
    }

    // Display words
    function displayWords() {
        const searchTerm = searchInput.value.trim();
        const category = categoryFilter.value;
        const sortOption = sortBy.value;

        // Filter words
        let filteredWords = Utils.filterWords(currentWords, searchTerm, category);

        // Sort words
        filteredWords = Utils.sortWords(filteredWords, sortOption);

        // Update word count
        wordCountEl.textContent = filteredWords.length;

        // Display words
        if (filteredWords.length === 0) {
            wordList.innerHTML = '<p class="no-data">暂无单词，点击上方按钮添加单词</p>';
            return;
        }

        wordList.innerHTML = filteredWords.map(word => `
            <div class="word-item" data-id="${word.id}">
                <div class="word-header">
                    <div class="word-title">
                        <h3>${Utils.escapeHTML(word.word)}</h3>
                        ${word.category ? `<span class="word-category">${Utils.escapeHTML(word.category)}</span>` : ''}
                    </div>
                    <div class="word-actions">
                        <button class="edit-btn" onclick="editWord('${word.id}')">编辑</button>
                        <button class="delete-btn" onclick="confirmDelete('${word.id}')">删除</button>
                    </div>
                </div>
                <div class="word-definition">
                    ${Utils.escapeHTML(word.definition)}
                </div>
                ${word.example ? `
                    <div class="word-example">
                        💬 ${Utils.escapeHTML(word.example)}
                    </div>
                ` : ''}
                <div class="word-stats">
                    <span>📅 ${Utils.formatDate(word.addedDate)}</span>
                    <span>🔄 复习 ${word.reviewCount || 0} 次</span>
                    <span>✅ 正确 ${word.correctCount || 0} 次</span>
                </div>
            </div>
        `).join('');
    }

    // Open modal for add/edit
    function openModal(wordId = null) {
        const modalTitle = document.getElementById('modalTitle');
        const wordIdInput = document.getElementById('wordId');
        const wordInput = document.getElementById('wordInput');
        const definitionInput = document.getElementById('definitionInput');
        const exampleInput = document.getElementById('exampleInput');
        const categoryInput = document.getElementById('categoryInput');

        if (wordId) {
            // Edit mode
            const word = currentWords.find(w => w.id === wordId);
            if (!word) return;

            modalTitle.textContent = '编辑单词';
            wordIdInput.value = word.id;
            wordInput.value = word.word;
            definitionInput.value = word.definition;
            exampleInput.value = word.example || '';
            categoryInput.value = word.category || '';
            editingWordId = wordId;
        } else {
            // Add mode
            modalTitle.textContent = '添加单词';
            wordForm.reset();
            wordIdInput.value = '';
            editingWordId = null;
        }

        wordModal.classList.add('active');
        wordInput.focus();
    }

    // Close all modals
    function closeModals() {
        wordModal.classList.remove('active');
        deleteModal.classList.remove('active');
        wordForm.reset();
        editingWordId = null;
        deletingWordId = null;
    }

    // Handle word form submit
    function handleWordSubmit(e) {
        e.preventDefault();

        const wordId = document.getElementById('wordId').value;
        const word = document.getElementById('wordInput').value.trim();
        const definition = document.getElementById('definitionInput').value.trim();
        const example = document.getElementById('exampleInput').value.trim();
        const category = document.getElementById('categoryInput').value.trim();

        // Validate
        const wordValidation = Utils.validateWord(word);
        if (!wordValidation.valid) {
            alert(wordValidation.message);
            return;
        }

        const definitionValidation = Utils.validateDefinition(definition);
        if (!definitionValidation.valid) {
            alert(definitionValidation.message);
            return;
        }

        if (wordId) {
            // Update existing word
            const updatedWord = {
                word,
                definition,
                example,
                category
            };

            if (Storage.updateWord(currentUser, wordId, updatedWord)) {
                loadWords();
                closeModals();
                showNotification('单词更新成功！');
            } else {
                alert('更新失败，请重试');
            }
        } else {
            // Add new word
            const newWord = {
                id: Utils.generateId(),
                word,
                definition,
                example,
                category,
                addedDate: new Date().toISOString(),
                reviewCount: 0,
                correctCount: 0,
                incorrectCount: 0
            };

            if (Storage.addWord(currentUser, newWord)) {
                loadWords();
                closeModals();
                showNotification('单词添加成功！');
            } else {
                alert('添加失败，请重试');
            }
        }
    }

    // Confirm delete
    function confirmDelete(wordId) {
        const word = currentWords.find(w => w.id === wordId);
        if (!word) return;

        deletingWordId = wordId;
        document.getElementById('deleteWordName').textContent = word.word;
        deleteModal.classList.add('active');
    }

    // Handle delete
    function handleDelete() {
        if (!deletingWordId) return;

        if (Storage.deleteWord(currentUser, deletingWordId)) {
            loadWords();
            closeModals();
            showNotification('单词删除成功！');
        } else {
            alert('删除失败，请重试');
        }
    }

    // Update category filter dropdown
    function updateCategoryFilter() {
        const categories = Utils.getCategories(currentWords);
        
        categoryFilter.innerHTML = '<option value="">所有分类</option>';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categoryFilter.appendChild(option);
        });
    }

    // Update category datalist for autocomplete
    function updateCategoryDatalist() {
        const categories = Utils.getCategories(currentWords);
        
        categoryList.innerHTML = '';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            categoryList.appendChild(option);
        });
    }

    // Show notification
    function showNotification(message) {
        // Create temporary notification
        const notification = document.createElement('div');
        notification.className = 'message success show';
        notification.textContent = message;
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '9999';
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Make functions globally accessible for inline onclick handlers
    window.editWord = (wordId) => {
        openModal(wordId);
    };

    window.confirmDelete = confirmDelete;
});

// Made with Bob
