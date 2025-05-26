// 从pinia库导入defineStore方法，用于创建store
import { defineStore } from 'pinia'

// 定义并导出一个名为useExamStore的store
export const useExamStore = defineStore('exam', {
  //定义store的状态(数据)
  state: () => ({
    // 当前题目类型名称，从localStorage读取或默认为null
    currentTitle: localStorage.getItem('exam_currentTitle') || null,
    //是否立即显示答案
    IsShowAnswer: localStorage.getItem('exam_showAnswer') === "false" || true,
    //是否随机显示
    IsRandom: localStorage.getItem('exam_random') === "true" || false,
  }),
  
  // 定义store的操作方法
  actions: {
    /**
     * 设置当前题目类型名称
     * @param {string} title - 题目类型名称
     */
    setCurrentTitle(title) {
      this.currentTitle = title  // 更新store中的状态
      localStorage.setItem('exam_currentTitle', title)  // 同步更新到localStorage
    },
    setIsShowAnswer(show) {
      this.IsShowAnswer = show
      localStorage.setItem('exam_showAnswer', show)
    },
    setIsRandom(random) {
      this.IsRandom = random
      localStorage.setItem('exam_random', random)
    },
    /**
     * 设置当前题目内容
     * @param {string|object} question - 题目内容
     */
    setCurrentQuestion(question) {
      localStorage.setItem('exam_currentQuestion', JSON.stringify(question))  // 同步更新到localStorage本地存储仍需序列化
    },
    setSelectedQuestions(questions) {
      this.selectedQuestions = questions
      localStorage.setItem('exam_selectedQuestions', JSON.stringify(questions))
    },


    // 新增获取方法,用于从localStorage获取当前所有题目
    getCurrentQuestion() {
      const question = localStorage.getItem('exam_currentQuestion')
      return question ? JSON.parse(question) : null
    },
    // 新增获取方法,用于从localStorage获取当前选择题目类型题目
    getSelectedQuestions() {
      const questions = localStorage.getItem('exam_selectedQuestions')
      return questions ? JSON.parse(questions) : null
    },
    
  }
})
