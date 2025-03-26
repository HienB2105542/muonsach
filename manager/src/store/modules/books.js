import axios from 'axios'

const state = {
  books: [],
  book: null,
  loading: false,
  error: null,
  page: 1,
  pages: 1,
  count: 0
}

const getters = {
  allBooks: state => state.books,
  book: state => state.book,
  loading: state => state.loading,
  error: state => state.error,
  pagination: state =>
      ({page: state.page, pages: state.pages, count: state.count})
}

const actions = {
  async fetchBooks({commit}, {page = 1, keyword = ''}) {
    try {
      commit('setLoading', true)

      const {data} =
          await axios.get(`/api/books`)

      commit('setBooks', data.books)
      commit(
          'setPagination',
          {page: data.page, pages: data.pages, count: data.count})
      commit('setLoading', false)

      return data
    } catch (error) {
      commit('setError', error.response?.data?.message || 'Có lỗi xảy ra')
      commit('setLoading', false)
      throw error
    }
  },

  async fetchBookById({commit}, id) {
    try {
      commit('setLoading', true)

      const {data} = await axios.get(`/api/books/${id}`)

      commit('setBook', data)
      commit('setLoading', false)

      return data
    } catch (error) {
      commit('setError', error.response?.data?.message || 'Có lỗi xảy ra')
      commit('setLoading', false)
      throw error
    }
  }
}

const mutations = {
  setBooks(state, books) {
    state.books = books
  },
  setBook(state, book) {
    state.book = book
  },
  setLoading(state, loading) {
    state.loading = loading
  },
  setError(state, error) {
    state.error = error
  },
  setPagination(state, {page, pages, count}) {
    state.page = page
    state.pages = pages
    state.count = count
  }
}

export default {
  namespaced: true, state, getters, actions, mutations
}