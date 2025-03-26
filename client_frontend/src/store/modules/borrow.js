import axios from 'axios'

const state = {
  borrowHistory: [],
  loading: false,
  error: null
}

const getters = {
  borrowHistory: state => state.borrowHistory,
  loading: state => state.loading,
  error: state => state.error
}

const actions = {
  async fetchBorrowHistory({commit, rootState}, status = '') {
    try {
      commit('setLoading', true);

      if (!rootState.auth.token) {
        console.error('Token null, yêu cầu đăng nhập lại.');
        commit('setError', 'Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
        commit('setLoading', false);
        return;
      }

      axios.defaults.headers.common['Authorization'] =
        `Bearer ${rootState.auth.token}`;
      axios.defaults.baseURL = 'http://localhost:5000';

      console.log(`Gửi request đến: ${axios.defaults.baseURL}/api/borrows/history?status=${status}`);

      const { data } = await axios.get(`/api/borrows/history?status=${status}`);

      if (!Array.isArray(data)) {
        console.error('API trả về dữ liệu không hợp lệ:', data);
        commit('setError', 'Dữ liệu không hợp lệ.');
        commit('setLoading', false);
        return;
      }

      console.log(' Dữ liệu lịch sử mượn sách:', data);
      commit('setBorrowHistory', data);
      commit('setLoading', false);
    } catch (error) {
      console.error('Lỗi API:', error);
      commit('setError', error.response?.data?.message || 'Có lỗi xảy ra.');
      commit('setLoading', false);
    }
  },

  async requestBorrow({commit, rootState}, bookId) {
    try {
      commit('setLoading', true)

      axios.defaults.headers.common['Authorization'] =
        `Bearer ${rootState.auth.token}`

      const { data } = await axios.post('/api/borrows/request', { bookId })

      commit('setLoading', false)

      return data
    } catch (error) {
      commit('setError', error.response?.data?.message || 'Có lỗi xảy ra')
      commit('setLoading', false)
      throw error
    }
  },
}

const mutations = {
  setBorrowHistory(state, borrowHistory) {
    state.borrowHistory = borrowHistory
  },
  setLoading(state, loading) {
    state.loading = loading
  },
  setError(state, error) {
    state.error = error
  }
}

export default {
  namespaced: true, state, getters, actions, mutations
}
