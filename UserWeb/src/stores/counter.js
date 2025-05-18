import { defineStore } from 'pinia'

export const useExamStore = defineStore('exam', {
  state: () => ({
    currentTitle: null,
    currentQuestion: null
  }),
  actions: {
    setCurrentTitle(title) {
      this.currentTitle = title
    },
    setCurrentQuestion(question) {
      this.currentQuestion = question
    }
  }
})
