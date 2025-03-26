import apiClient from './api'

export default {
  fetchBooks(page = 1, keyword = '') {
    return apiClient.get(`/books?pageNumber=${page}&keyword=${keyword}`)
  },
  fetchBookById(id) {
    return apiClient.get(`/books/${id}`)
  }
}