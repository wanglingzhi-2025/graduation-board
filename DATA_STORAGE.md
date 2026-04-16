# 💾 数据存储说明

## 存储位置

所有输入的单词和用户数据都存储在**浏览器的 localStorage** 中。

### 什么是 localStorage？

localStorage 是浏览器提供的本地存储功能，数据保存在您的计算机上，具体位置取决于您使用的浏览器：

#### Windows 系统

- **Chrome**: `C:\Users\[用户名]\AppData\Local\Google\Chrome\User Data\Default\Local Storage`
- **Firefox**: `C:\Users\[用户名]\AppData\Roaming\Mozilla\Firefox\Profiles\[配置文件]\storage\default`
- **Edge**: `C:\Users\[用户名]\AppData\Local\Microsoft\Edge\User Data\Default\Local Storage`

#### macOS 系统

- **Chrome**: `~/Library/Application Support/Google/Chrome/Default/Local Storage`
- **Safari**: `~/Library/Safari/LocalStorage`
- **Firefox**: `~/Library/Application Support/Firefox/Profiles/[配置文件]/storage/default`

## 存储的数据

应用使用以下4个 localStorage 键来存储数据：

### 1. `vocab_users` - 用户信息
存储所有注册用户的账号信息：

```javascript
{
  "username1": {
    "username": "username1",
    "password": "加密后的密码",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastLogin": "2024-01-02T00:00:00.000Z",
    "loginStreak": 5
  },
  "username2": {
    // 另一个用户的信息
  }
}
```

### 2. `vocab_current_user` - 当前登录用户
存储当前登录的用户名：

```javascript
"username1"
```

### 3. `vocab_words` - 单词数据
存储每个用户的单词列表：

```javascript
{
  "username1": [
    {
      "id": "唯一ID",
      "word": "apple",
      "definition": "苹果；苹果树",
      "example": "I like to eat apples.",
      "category": "水果",
      "addedDate": "2024-01-01T00:00:00.000Z",
      "reviewCount": 5,
      "correctCount": 3,
      "incorrectCount": 2
    },
    {
      // 更多单词...
    }
  ],
  "username2": [
    // 另一个用户的单词
  ]
}
```

### 4. `vocab_quizzes` - 测验记录
存储每个用户的测验历史：

```javascript
{
  "username1": [
    {
      "id": "唯一ID",
      "date": "2024-01-01T00:00:00.000Z",
      "score": 8,
      "totalQuestions": 10,
      "duration": 120,
      "words": ["word_id_1", "word_id_2", ...]
    },
    {
      // 更多测验记录...
    }
  ],
  "username2": [
    // 另一个用户的测验记录
  ]
}
```

## 如何查看存储的数据

### 方法1：使用浏览器开发者工具

1. 打开应用页面
2. 按 `F12` 打开开发者工具
3. 切换到 **Application** (Chrome/Edge) 或 **Storage** (Firefox) 标签
4. 在左侧找到 **Local Storage**
5. 点击您的网站域名
6. 右侧会显示所有存储的键值对

### 方法2：使用 JavaScript 控制台

在浏览器控制台中输入以下命令：

```javascript
// 查看所有用户
console.log(JSON.parse(localStorage.getItem('vocab_users')));

// 查看当前登录用户
console.log(localStorage.getItem('vocab_current_user'));

// 查看所有单词
console.log(JSON.parse(localStorage.getItem('vocab_words')));

// 查看所有测验记录
console.log(JSON.parse(localStorage.getItem('vocab_quizzes')));
```

## 数据特点

### ✅ 优点

1. **本地存储**：数据保存在您的电脑上，不会上传到服务器
2. **快速访问**：读写速度快，无需网络连接
3. **持久保存**：关闭浏览器后数据仍然保留
4. **隐私安全**：数据只存在您的设备上
5. **无需注册**：不需要真实的邮箱或手机号

### ⚠️ 注意事项

1. **浏览器限制**：每个域名通常有 5-10MB 的存储限制
2. **清除数据**：清除浏览器数据会删除所有单词
3. **不同浏览器**：在不同浏览器中数据不共享
4. **不同设备**：在不同设备上数据不同步
5. **隐私模式**：在隐私/无痕模式下，关闭浏览器后数据会被清除

## 数据备份

### 手动备份方法

由于数据存储在 localStorage 中，您可以通过以下方式备份：

#### 方法1：导出到控制台

```javascript
// 在浏览器控制台中运行
const backup = {
  users: localStorage.getItem('vocab_users'),
  words: localStorage.getItem('vocab_words'),
  quizzes: localStorage.getItem('vocab_quizzes')
};
console.log(JSON.stringify(backup));
// 复制输出的内容保存到文本文件
```

#### 方法2：使用浏览器工具

1. 打开开发者工具 (F12)
2. 进入 Application > Local Storage
3. 右键点击每个键
4. 选择 "Copy" 复制值
5. 保存到文本文件

### 恢复数据

```javascript
// 在浏览器控制台中运行
const backup = {
  // 粘贴您之前备份的数据
};
localStorage.setItem('vocab_users', backup.users);
localStorage.setItem('vocab_words', backup.words);
localStorage.setItem('vocab_quizzes', backup.quizzes);
// 刷新页面
```

## 数据安全

### 密码加密

- 密码使用简单的哈希函数加密
- 不以明文形式存储
- 但这不是强加密，仅用于基本保护

### 数据验证

- 所有输入都经过验证
- 防止恶意数据注入
- HTML 内容自动转义

### 建议

1. **不要存储敏感信息**：这是学习应用，不要用真实的重要密码
2. **定期备份**：重要数据建议定期备份
3. **注意浏览器清理**：清理浏览器前先备份数据

## 数据容量

### 存储限制

- 大多数浏览器：5-10MB
- 估算：可存储约 10,000-50,000 个单词（取决于单词内容长度）

### 当前使用量查看

```javascript
// 在浏览器控制台中运行
let total = 0;
for (let key in localStorage) {
  if (localStorage.hasOwnProperty(key)) {
    total += localStorage[key].length + key.length;
  }
}
console.log(`当前使用: ${(total / 1024).toFixed(2)} KB`);
```

## 清除数据

### 清除所有应用数据

```javascript
// 在浏览器控制台中运行
localStorage.removeItem('vocab_users');
localStorage.removeItem('vocab_current_user');
localStorage.removeItem('vocab_words');
localStorage.removeItem('vocab_quizzes');
// 刷新页面
```

### 只清除当前用户数据

```javascript
// 在浏览器控制台中运行
const currentUser = localStorage.getItem('vocab_current_user');
const words = JSON.parse(localStorage.getItem('vocab_words'));
const quizzes = JSON.parse(localStorage.getItem('vocab_quizzes'));
delete words[currentUser];
delete quizzes[currentUser];
localStorage.setItem('vocab_words', JSON.stringify(words));
localStorage.setItem('vocab_quizzes', JSON.stringify(quizzes));
// 刷新页面
```

## 未来改进计划

1. **数据导出功能**：一键导出所有单词为 JSON/CSV 文件
2. **数据导入功能**：从文件导入单词
3. **云端同步**：可选的云端存储，支持多设备同步
4. **自动备份**：定期自动备份到本地文件

## 常见问题

### Q: 数据会丢失吗？
A: 只要不清除浏览器数据，数据就会一直保存。建议定期备份重要数据。

### Q: 可以在多个浏览器使用吗？
A: 可以，但每个浏览器的数据是独立的，需要分别注册和添加单词。

### Q: 换电脑后数据还在吗？
A: 不在。数据只存在当前设备的浏览器中。如需迁移，请先备份数据。

### Q: 隐私模式下可以使用吗？
A: 可以使用，但关闭浏览器后数据会被清除。

### Q: 如何转移到另一台电脑？
A: 使用上面的备份方法导出数据，在新电脑上导入即可。

---

**总结**：您输入的所有单词都安全地存储在您的浏览器 localStorage 中，完全在本地，不会上传到任何服务器。