import {createStore} from 'vuex'

import auth from './modules/auth'
import books from './modules/books';
import borrow from './modules/borrow';

const store = createStore({
  modules: {auth, books, borrow},
  state: {user: null},
  mutations: {
    setUser(state, user) {
      state.user = user;
    }
  },
  actions: {
    login({commit}, user) {
      return new Promise((resolve) => {
        setTimeout(() => {
          commit('setUser', user);
          resolve();
        }, 1000);
      });
    }
  }
});


export default store
