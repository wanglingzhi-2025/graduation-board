window.WrongBookStorage = (function () {
  const STORAGE_KEY = "wrongbook-mvp-data";

  function loadState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { wrongQuestions: [] };
    }

    try {
      return JSON.parse(raw);
    } catch (error) {
      console.error("Failed to parse WrongBook storage:", error);
      return { wrongQuestions: [] };
    }
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function getWrongQuestions() {
    const state = loadState();
    return Array.isArray(state.wrongQuestions) ? state.wrongQuestions : [];
  }

  function addWrongQuestion(question) {
    const state = loadState();
    const list = Array.isArray(state.wrongQuestions) ? state.wrongQuestions : [];
    list.unshift(question);
    saveState({ wrongQuestions: list });
    return question;
  }

  function seedDemoData() {
    const current = getWrongQuestions();
    if (current.length > 0) {
      return current;
    }

    const seedQuestions = (window.WrongBookSeedData && window.WrongBookSeedData.wrongQuestions) || [];
    saveState({ wrongQuestions: seedQuestions });
    return seedQuestions;
  }

  function clearAll() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function findPracticeByKnowledgePoint(knowledgePoint) {
    const source = (window.WrongBookSeedData && window.WrongBookSeedData.practiceQuestions) || {};
    return source[knowledgePoint] || [];
  }

  window.addEventListener("storage", function () {
    console.log("WrongBook storage updated in another tab.");
  });

  return {
    getWrongQuestions,
    addWrongQuestion,
    seedDemoData,
    clearAll,
    findPracticeByKnowledgePoint
  };
})();

// Made with Bob
