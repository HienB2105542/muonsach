import { createRouter, createWebHistory } from 'vue-router';
import store from '@/store';
import Home from '../views/Home.vue'

const routes =
    [
      {path: '/', name: 'Home', component: Home}, {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/Login.vue'),
        meta: {guest: true}
      },
      {
        path: '/register',
        name: 'Register',
        component: () => import('@/views/Register.vue'),
        meta: {guest: true}

      },
      {
        path: '/bookview',
        name: 'BookView',
        component: () => import('@/views/BookView.vue'),
        meta: {guest: true}
      },
      {
        path: '/borrow/:id',
        name: 'BorrowRequest',
        component: () => import('@/views/BorrowRequest.vue'),
        meta: {guest: true}
      },
      {
        path: '/history',
        name: 'BorrowHistory',
        component: () => import('@/components/BorrowHistory.vue'),
        meta: {guest: true}
      },
      {
        path: '/profile',
        name: 'UserProfile',
        component: () => import('@/views/UserProfile.vue'),
      }
    ]

    const router = createRouter({
      history: createWebHistory(import.meta.env.BASE_URL),
      routes,
    });

store.dispatch('auth/initializeAuth')
    .catch(err => console.error('Auth init error:', err));


router.beforeEach((to, from, next) => {
  const isLoggedIn = store.getters['auth/isLoggedIn']

    if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isLoggedIn) {
      next('/login')
    } else {
      next()
    }
  }
  else if (to.matched.some(record => record.meta.guestOnly)) {
    if (isLoggedIn) {
      next('/')
    } else {
      next()
    }
  }
  else {
    next()
  }
})

export default router