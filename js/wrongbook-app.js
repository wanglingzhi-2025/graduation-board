(function () {
  const state = {
    activeView: "home",
    questions: []
  };

  const elements = {};

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    cacheElements();
    bindEvents();
    refreshData();
    switchView("home");
  }

  function cacheElements() {
    elements.viewPanels = document.querySelectorAll(".view-panel");
    elements.navItems = document.querySelectorAll("[data-view-target]");
    elements.form = document.getElementById("wrongQuestionForm");
    elements.seedDemoBtn = document.getElementById("seedDemoBtn");
    elements.totalQuestions = document.getElementById("totalQuestions");
    elements.weakPointsCount = document.getElementById("weakPointsCount");
    elements.practiceCount = document.getElementById("practiceCount");
    elements.recentActivityList = document.getElementById("recentActivityList");
    elements.weakTopicList = document.getElementById("weakTopicList");
    elements.studySuggestion = document.getElementById("studySuggestion");
    elements.questionList = document.getElementById("questionList");
    elements.practiceList = document.getElementById("practiceList");
    elements.filterSubject = document.getElementById("filterSubject");
    elements.searchInput = document.getElementById("searchInput");
    elements.subject = document.getElementById("subject");
    elements.questionType = document.getElementById("questionType");
    elements.knowledgePoint = document.getElementById("knowledgePoint");
    elements.errorReason = document.getElementById("errorReason");
    elements.ocrText = document.getElementById("ocrText");
    elements.questionNote = document.getElementById("questionNote");
  }

  function bindEvents() {
    elements.navItems.forEach(function (item) {
      item.addEventListener("click", function () {
        switchView(item.dataset.viewTarget);
      });
    });

    elements.form.addEventListener("submit", handleSubmit);
    elements.seedDemoBtn.addEventListener("click", handleSeedDemoData);
    elements.filterSubject.addEventListener("change", renderQuestionList);
    elements.searchInput.addEventListener("input", renderQuestionList);
  }

  function switchView(viewName) {
    state.activeView = viewName;

    elements.viewPanels.forEach(function (panel) {
      panel.classList.toggle("active", panel.id === "view-" + viewName);
    });

    document.querySelectorAll(".bottom-nav .nav-item").forEach(function (item) {
      item.classList.toggle("active", item.dataset.viewTarget === viewName);
    });

    renderPracticeList();
  }

  function refreshData() {
    state.questions = WrongBookStorage.getWrongQuestions();
    renderStats();
    renderOverview();
    renderQuestionList();
    renderPracticeList();
  }

  function handleSeedDemoData() {
    WrongBookStorage.seedDemoData();
    refreshData();
    switchView("home");
  }

  function handleSubmit(event) {
    event.preventDefault();

    const question = {
      id: "wq-" + Date.now(),
      subject: elements.subject.value,
      questionType: elements.questionType.value,
      knowledgePoint: elements.knowledgePoint.value.trim(),
      errorReason: elements.errorReason.value,
      ocrText: elements.ocrText.value.trim(),
      note: elements.questionNote.value.trim(),
      createdAt: formatNow()
    };

    WrongBookStorage.addWrongQuestion(question);
    elements.form.reset();
    refreshData();
    switchView("notebook");
  }

  function renderStats() {
    const topicMap = buildTopicMap(state.questions);
    const recommendationCount = state.questions.reduce(function (count, question) {
      return count + WrongBookStorage.findPracticeByKnowledgePoint(question.knowledgePoint).length;
    }, 0);

    elements.totalQuestions.textContent = state.questions.length;
    elements.weakPointsCount.textContent = Object.keys(topicMap).length;
    elements.practiceCount.textContent = recommendationCount;
  }

  function renderOverview() {
    const latest = state.questions.slice(0, 3);
    const topicEntries = Object.entries(buildTopicMap(state.questions)).sort(function (a, b) {
      return b[1] - a[1];
    });

    elements.recentActivityList.innerHTML = latest.length
      ? latest.map(function (item) {
          return "<li>" + escapeHtml(item.subject) + " · " + escapeHtml(item.knowledgePoint) + " · " + escapeHtml(item.createdAt) + "</li>";
        }).join("")
      : "<li>还没有保存错题。</li>";

    elements.weakTopicList.innerHTML = topicEntries.length
      ? topicEntries.slice(0, 3).map(function (entry) {
          return "<li>" + escapeHtml(entry[0]) + " · " + entry[1] + " 题</li>";
        }).join("")
      : "<li>暂无数据。</li>";

    elements.studySuggestion.textContent = buildStudySuggestion(topicEntries);
  }

  function renderQuestionList() {
    const subjectFilter = elements.filterSubject.value;
    const keyword = elements.searchInput.value.trim().toLowerCase();

    const filtered = state.questions.filter(function (question) {
      const matchesSubject = !subjectFilter || question.subject === subjectFilter;
      const searchTarget = [question.subject, question.knowledgePoint, question.ocrText, question.errorReason].join(" ").toLowerCase();
      const matchesKeyword = !keyword || searchTarget.includes(keyword);
      return matchesSubject && matchesKeyword;
    });

    if (!filtered.length) {
      elements.questionList.innerHTML = '<article class="empty-card">没有匹配的错题。</article>';
      return;
    }

    elements.questionList.innerHTML = filtered.map(function (question) {
      return [
        '<article class="question-card">',
        "<h4>" + escapeHtml(question.knowledgePoint) + "</h4>",
        '<div class="meta-row">',
        '<span class="meta-chip">' + escapeHtml(question.subject) + "</span>",
        '<span class="meta-chip">' + escapeHtml(question.questionType) + "</span>",
        '<span class="meta-chip">' + escapeHtml(question.errorReason) + "</span>",
        "</div>",
        '<p class="question-text">' + escapeHtml(question.ocrText) + "</p>",
        '<p class="question-text"><strong>备注：</strong>' + escapeHtml(question.note || "暂无备注") + "</p>",
        '<div class="card-actions">',
        '<button class="secondary-btn" type="button" onclick="WrongBookApp.showPractice(\'' + question.id + '\')">练习相似题</button>',
        "</div>",
        "</article>"
      ].join("");
    }).join("");
  }

  function renderPracticeList() {
    const latestQuestion = state.questions[0];

    if (!latestQuestion) {
      elements.practiceList.innerHTML = '<article class="empty-card">先保存一道错题，再查看相似练习。</article>';
      return;
    }

    const practices = WrongBookStorage.findPracticeByKnowledgePoint(latestQuestion.knowledgePoint);

    if (!practices.length) {
      elements.practiceList.innerHTML = '<article class="empty-card">该知识点暂时没有相似题。</article>';
      return;
    }

    elements.practiceList.innerHTML = practices.map(function (item) {
      return [
        '<article class="practice-card">',
        "<h4>" + escapeHtml(item.title) + "</h4>",
        '<div class="meta-row">',
        '<span class="meta-chip">' + escapeHtml(latestQuestion.knowledgePoint) + "</span>",
        '<span class="meta-chip">' + escapeHtml(item.difficulty) + "</span>",
        "</div>",
        '<p class="practice-text">' + escapeHtml(item.text) + "</p>",
        "</article>"
      ].join("");
    }).join("");
  }

  function buildTopicMap(questions) {
    return questions.reduce(function (acc, question) {
      const key = question.knowledgePoint || "未分类";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }

  function buildStudySuggestion(topicEntries) {
    if (!topicEntries.length) {
      return "先添加第一道错题，系统会自动生成学习建议。";
    }

    const topTopic = topicEntries[0][0];
    return "建议优先复习“" + topTopic + "”，先回顾核心概念，再完成 2 到 3 道相似练习。";
  }

  function formatNow() {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");
    return yyyy + "-" + mm + "-" + dd + " " + hh + ":" + min;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "＆")
      .replace(/</g, "＜")
      .replace(/>/g, "＞")
      .replace(/"/g, "＂")
      .replace(/'/g, "＇");
  }

  window.WrongBookApp = {
    showPractice: function (questionId) {
      const target = state.questions.find(function (question) {
        return question.id === questionId;
      });

      if (!target) {
        return;
      }

      state.questions = [target].concat(state.questions.filter(function (question) {
        return question.id !== questionId;
      }));

      renderPracticeList();
      switchView("practice");
    }
  };
})();

// Made with Bob
