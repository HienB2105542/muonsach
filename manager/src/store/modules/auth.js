const state = {
  isAuthenticated: false,
  user: null,
  token: null
};

const getters = {
  isLoggedIn: (state) => state.isAuthenticated  
};

const mutations = {
  setAuth(state, payload) {
    state.isAuthenticated = payload.isAuthenticated;
    state.user = payload.user;
    state.token = payload.token;
  },
  logout(state) {
    state.isAuthenticated = false;
    state.user = null;
    state.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

const actions = {
  initializeAuth({commit}) {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const parsedUser = user && user !== 'undefined' ? JSON.parse(user) : null;

    if (token && user) {
      commit('setAuth', {isAuthenticated: true, user: parsedUser, token});
    }
  },
  async login({commit}, userData) {
    commit(
        'setAuth',
        {isAuthenticated: true, user: userData.user, token: userData.token});

    localStorage.setItem('token', userData.token);
    if (userData.user) {
      localStorage.setItem('user', JSON.stringify(userData.user));
    }
    
  },
  logout({commit}) {
    commit('logout');
  }
};

export default {namespaced: true, state, getters, mutations, actions};
