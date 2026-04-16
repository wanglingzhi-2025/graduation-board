window.WrongBookSeedData = {
  wrongQuestions: [
    {
      id: "wq-1001",
      subject: "数学",
      questionType: "选择题",
      knowledgePoint: "一次函数",
      errorReason: "概念不清",
      ocrText: "已知 y = 2x + 3，下列哪个点在该函数图像上？A.(0,2) B.(1,5) C.(2,3) D.(3,10)",
      note: "需要复习斜率和截距的含义。",
      createdAt: "2026-04-10 19:20"
    },
    {
      id: "wq-1002",
      subject: "数学",
      questionType: "填空题",
      knowledgePoint: "解方程",
      errorReason: "计算错误",
      ocrText: "解方程：3(x - 2) = 12",
      note: "展开后忘记继续除以 3。",
      createdAt: "2026-04-12 15:10"
    },
    {
      id: "wq-1003",
      subject: "英语",
      questionType: "简答题",
      knowledgePoint: "阅读理解",
      errorReason: "审题错误",
      ocrText: "阅读短文并回答：Tom 为什么错过了火车？",
      note: "回答成了结果，没有根据第二段说明真正原因。",
      createdAt: "2026-04-13 20:05"
    }
  ],
  practiceQuestions: {
    "一次函数": [
      {
        id: "pq-2001",
        title: "一次函数练习 1",
        difficulty: "简单",
        text: "在 y = 2x + 1 中，当 x = 4 时，求 y 的值。"
      },
      {
        id: "pq-2002",
        title: "一次函数练习 2",
        difficulty: "中等",
        text: "下列哪个函数解析式的斜率为 3，截距为 -2？"
      }
    ],
    "解方程": [
      {
        id: "pq-2003",
        title: "解方程练习 1",
        difficulty: "简单",
        text: "解方程：5x - 10 = 20。"
      },
      {
        id: "pq-2004",
        title: "解方程练习 2",
        difficulty: "中等",
        text: "解方程：2(3x + 1) = 14。"
      }
    ],
    "阅读理解": [
      {
        id: "pq-2005",
        title: "阅读理解练习 1",
        difficulty: "中等",
        text: "阅读短文后，找出学生迟到的主要原因。"
      }
    ]
  }
};

// Made with Bob
