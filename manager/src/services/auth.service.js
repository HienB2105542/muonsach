import apiClient from './api'

export default {
  login(email, password, rememberMe) {
    return apiClient.post('/auth/reader/login', {
      email, password, rememberMe
    })
  },
  register(email, password, fullname) {
    const [HoLot, ...tenParts] = fullname.split(' ');  
    const Ten = tenParts.join(' '); 

    return apiClient.post(
        '/auth/reader/register', {email, password, HoLot, Ten});
  },
  updateProfile(userData) {
    return apiClient.put('/users/profile', userData)
  }
}