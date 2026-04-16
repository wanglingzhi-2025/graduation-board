// Graduation Message Board - Main Functionality

class MessageBoard {
    constructor() {
        this.currentUser = GraduationAuth.checkAuth();
        if (!this.currentUser) return;

        this.messages = this.loadMessages();
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.displayUserInfo();
        this.setupEventListeners();
        this.loadRecipients();
        this.displayMessages();
        this.updateStats();
    }

    displayUserInfo() {
        const roleText = this.currentUser.role === 'student' ? '学生' : '教师';
        const roleEmoji = this.currentUser.role === 'student' ? '🎓' : '👨‍🏫';

        document.getElementById('userInfo').textContent = 
            `${this.currentUser.school} ${this.currentUser.class} - ${this.currentUser.name}`;
        document.getElementById('userName').textContent = this.currentUser.name;
        document.getElementById('userRole').textContent = `${roleEmoji} ${roleText}`;
        document.getElementById('userAvatar').textContent = roleEmoji;
        document.getElementById('schoolInfo').textContent = `🏫 ${this.currentUser.school}`;
        document.getElementById('classInfo').textContent = `📚 ${this.currentUser.class}`;
    }

    setupEventListeners() {
        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            if (confirm('确定要退出登录吗？')) {
                GraduationAuth.logout();
            }
        });

        // New message button
        document.getElementById('newMessageBtn').addEventListener('click', () => {
            this.openMessageModal();
        });

        // Message form
        document.getElementById('messageForm').addEventListener('submit', (e) => {
            this.handleSubmitMessage(e);
        });

        // Message type change
        document.getElementById('messageType').addEventListener('change', (e) => {
            this.toggleRecipientField(e.target.value);
        });

        // Character count
        document.getElementById('messageContent').addEventListener('input', (e) => {
            document.getElementById('charCount').textContent = e.target.value.length;
        });

        // Photo upload
        document.getElementById('messagePhoto').addEventListener('change', (e) => {
            this.handlePhotoUpload(e);
        });

        // Modal close buttons
        document.querySelectorAll('.close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeModals();
            });
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.closeModals();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleFilter(e.target.dataset.filter);
            });
        });

        // Search
        document.getElementById('searchBtn').addEventListener('click', () => {
            this.handleSearch();
        });

        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch();
            }
        });

        // Close modal on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModals();
            }
        });
    }

    loadRecipients() {
        const users = GraduationAuth.getAllUsers();
        const recipientSelect = document.getElementById('recipient');
        
        // Clear existing options except first
        recipientSelect.innerHTML = '<option value="">选择接收者...</option>';

        // Add all users except current user
        users.forEach(user => {
            if (user.username !== this.currentUser.username) {
                const option = document.createElement('option');
                option.value = user.username;
                const roleText = user.role === 'student' ? '学生' : '教师';
                option.textContent = `${user.name} (${roleText})`;
                recipientSelect.appendChild(option);
            }
        });
    }

    toggleRecipientField(type) {
        const recipientGroup = document.getElementById('recipientGroup');
        const recipientSelect = document.getElementById('recipient');
        
        if (type === 'private') {
            recipientGroup.style.display = 'block';
            recipientSelect.required = true;
        } else {
            recipientGroup.style.display = 'none';
            recipientSelect.required = false;
            recipientSelect.value = '';
        }
    }

    openMessageModal() {
        document.getElementById('messageModal').style.display = 'block';
        document.getElementById('messageForm').reset();
        document.getElementById('charCount').textContent = '0';
        document.getElementById('photoPreview').innerHTML = '';
        document.getElementById('isAnonymous').checked = false;
        this.toggleRecipientField('public');
    }

    closeModals() {
        document.getElementById('messageModal').style.display = 'none';
        document.getElementById('viewModal').style.display = 'none';
    }

    handlePhotoUpload(e) {
        const file = e.target.files[0];
        const preview = document.getElementById('photoPreview');
        
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                preview.innerHTML = `
                    <img src="${event.target.result}" alt="预览">
                    <button type="button" class="remove-photo" onclick="messageBoard.removePhoto()">删除</button>
                `;
            };
            reader.readAsDataURL(file);
        }
    }

    removePhoto() {
        document.getElementById('messagePhoto').value = '';
        document.getElementById('photoPreview').innerHTML = '';
    }

    handleSubmitMessage(e) {
        e.preventDefault();

        const type = document.getElementById('messageType').value;
        const recipient = document.getElementById('recipient').value;
        const title = document.getElementById('messageTitle').value.trim();
        const content = document.getElementById('messageContent').value.trim();
        const isAnonymous = document.getElementById('isAnonymous').checked;
        const photoInput = document.getElementById('messagePhoto');

        // Validate private message has recipient
        if (type === 'private' && !recipient) {
            alert('请选择接收者！');
            return;
        }

        const message = {
            id: Date.now().toString(),
            author: this.currentUser.username,
            authorName: this.currentUser.name,
            authorRole: this.currentUser.role,
            isAnonymous: isAnonymous,
            type: type,
            recipient: recipient || null,
            title: title,
            content: content,
            photo: null,
            timestamp: new Date().toISOString(),
            likes: []
        };

        // Handle photo if uploaded
        if (photoInput.files.length > 0) {
            const reader = new FileReader();
            reader.onload = (event) => {
                message.photo = event.target.result;
                this.saveMessage(message);
            };
            reader.readAsDataURL(photoInput.files[0]);
        } else {
            this.saveMessage(message);
        }
    }

    saveMessage(message) {
        this.messages.push(message);
        localStorage.setItem('graduation_messages', JSON.stringify(this.messages));
        
        this.closeModals();
        this.displayMessages();
        this.updateStats();
        this.animatePaperPlane();
        
        this.showNotification('留言发布成功！', 'success');
    }

    loadMessages() {
        const messagesStr = localStorage.getItem('graduation_messages');
        return messagesStr ? JSON.parse(messagesStr) : [];
    }

    displayMessages() {
        const messageList = document.getElementById('messageList');
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();

        // Filter messages based on current filter and search
        let filteredMessages = this.messages.filter(msg => {
            // Search filter
            if (searchTerm) {
                const matchesSearch = 
                    msg.title.toLowerCase().includes(searchTerm) ||
                    msg.content.toLowerCase().includes(searchTerm) ||
                    msg.authorName.toLowerCase().includes(searchTerm);
                if (!matchesSearch) return false;
            }

            // Type filter
            switch (this.currentFilter) {
                case 'public':
                    return msg.type === 'public';
                case 'private':
                    return msg.type === 'private' && 
                           (msg.author === this.currentUser.username || 
                            msg.recipient === this.currentUser.username);
                case 'my':
                    return msg.author === this.currentUser.username;
                case 'all':
                default:
                    // Show public messages and private messages where user is involved
                    return msg.type === 'public' || 
                           msg.author === this.currentUser.username || 
                           msg.recipient === this.currentUser.username;
            }
        });

        // Sort by timestamp (newest first)
        filteredMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        if (filteredMessages.length === 0) {
            messageList.innerHTML = `
                <div class="empty-state">
                    <p>📭 暂无留言</p>
                    <p>快来写下第一条留言吧！</p>
                </div>
            `;
            return;
        }

        messageList.innerHTML = filteredMessages.map(msg => this.createMessageCard(msg)).join('');

        // Add click listeners to message cards
        document.querySelectorAll('.message-card').forEach(card => {
            card.addEventListener('click', () => {
                this.viewMessage(card.dataset.messageId);
            });
        });

        // Add like button listeners
        document.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleLike(btn.dataset.messageId);
            });
        });
    }

    createMessageCard(message) {
        const date = new Date(message.timestamp);
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        
        const roleEmoji = message.authorRole === 'student' ? '🎓' : '👨‍🏫';
        const displayAuthorName = message.isAnonymous
            ? (message.authorRole === 'student' ? '匿名同学' : '匿名教师')
            : message.authorName;
        
        const isLiked = message.likes.includes(this.currentUser.username);
        const likeClass = isLiked ? 'liked' : '';
        
        let recipientInfo = '';
        if (message.type === 'private' && message.recipient) {
            const recipientUser = GraduationAuth.getAllUsers().find(u => u.username === message.recipient);
            if (recipientUser) {
                recipientInfo = `<span class="recipient">→ ${recipientUser.name}</span>`;
            }
        }

        return `
            <div class="message-card" data-message-id="${message.id}">
                <div class="message-header">
                    <div class="author-info">
                        <span class="author-avatar">${roleEmoji}</span>
                        <div>
                            <span class="author-name">${displayAuthorName}</span>
                            ${recipientInfo}
                        </div>
                    </div>
                    <span class="message-date">${formattedDate}</span>
                </div>
                <div class="message-body">
                    <h3 class="message-title">${this.escapeHtml(message.title)}</h3>
                    <p class="message-preview">${this.escapeHtml(message.content.substring(0, 100))}${message.content.length > 100 ? '...' : ''}</p>
                    ${message.photo ? '<div class="has-photo">📷 包含照片</div>' : ''}
                </div>
                <div class="message-footer">
                    <button class="like-btn ${likeClass}" data-message-id="${message.id}">
                        ❤️ ${message.likes.length}
                    </button>
                    <span class="view-detail">点击查看详情 →</span>
                </div>
            </div>
        `;
    }

    viewMessage(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (!message) return;

        const date = new Date(message.timestamp);
        const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        
        const roleEmoji = message.authorRole === 'student' ? '🎓' : '👨‍🏫';
        const displayAuthorName = message.isAnonymous
            ? (message.authorRole === 'student' ? '匿名同学' : '匿名教师')
            : message.authorName;

        let recipientInfo = '';
        if (message.type === 'private' && message.recipient) {
            const recipientUser = GraduationAuth.getAllUsers().find(u => u.username === message.recipient);
            if (recipientUser) {
                recipientInfo = `<p class="recipient-info">接收者: ${recipientUser.name}</p>`;
            }
        }

        const viewContent = document.getElementById('viewMessageContent');
        viewContent.innerHTML = `
            <div class="message-detail">
                <div class="detail-header">
                    <div class="author-info-large">
                        <span class="author-avatar-large">${roleEmoji}</span>
                        <div>
                            <h3>${displayAuthorName}</h3>
                            <p class="message-meta">${formattedDate}</p>
                            ${recipientInfo}
                        </div>
                    </div>
                </div>
                <div class="detail-body">
                    <h2>${this.escapeHtml(message.title)}</h2>
                    <p class="message-content-full">${this.escapeHtml(message.content).replace(/\n/g, '<br>')}</p>
                    ${message.photo ? `<div class="message-photo"><img src="${message.photo}" alt="留言照片"></div>` : ''}
                </div>
                <div class="detail-footer">
                    <button class="like-btn-large ${message.likes.includes(this.currentUser.username) ? 'liked' : ''}" onclick="messageBoard.toggleLike('${message.id}')">
                        ❤️ ${message.likes.length} 人点赞
                    </button>
                </div>
            </div>
        `;

        document.getElementById('viewModal').style.display = 'block';
    }

    toggleLike(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        if (!message) return;

        const userIndex = message.likes.indexOf(this.currentUser.username);
        
        if (userIndex > -1) {
            // Unlike
            message.likes.splice(userIndex, 1);
        } else {
            // Like
            message.likes.push(this.currentUser.username);
        }

        localStorage.setItem('graduation_messages', JSON.stringify(this.messages));
        this.displayMessages();

        // Update view modal if open
        const viewModal = document.getElementById('viewModal');
        if (viewModal.style.display === 'block') {
            this.viewMessage(messageId);
        }
    }

    handleFilter(filter) {
        this.currentFilter = filter;
        
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });

        this.displayMessages();
    }

    handleSearch() {
        this.displayMessages();
    }

    updateStats() {
        const myMessages = this.messages.filter(m => m.author === this.currentUser.username);
        const receivedMessages = this.messages.filter(m => 
            m.recipient === this.currentUser.username || 
            (m.type === 'public' && m.author !== this.currentUser.username)
        );

        document.getElementById('messageCount').textContent = myMessages.length;
        document.getElementById('receivedCount').textContent = receivedMessages.length;
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    animatePaperPlane() {
        const plane = document.getElementById('messagePlane');
        if (!plane) return;

        plane.classList.remove('swing');
        void plane.offsetWidth;
        plane.classList.add('swing');

        setTimeout(() => {
            plane.classList.remove('swing');
        }, 5000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize message board
let messageBoard;
document.addEventListener('DOMContentLoaded', () => {
    messageBoard = new MessageBoard();
});

// Made with Bob
