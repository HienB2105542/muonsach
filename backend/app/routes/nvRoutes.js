const express = require('express');
const {registerNhanVien, loginNhanVien} =
    require('../controllers/nvController');

const router = express.Router();

// Routes không yêu cầu xác thực
router.post('/register', registerNhanVien);
router.post('/login', loginNhanVien);

module.exports = router;