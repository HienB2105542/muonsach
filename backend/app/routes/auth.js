const express = require('express');
const router = express.Router();
const {loginReader, registerReader, logout} =
    require('../controllers/authController');

// Route đăng nhập người đọc
router.post('/reader/login', loginReader);

// Route đăng ký người đọc
router.post('/reader/register', registerReader);

router.get('/logout', logout);

module.exports = router;
