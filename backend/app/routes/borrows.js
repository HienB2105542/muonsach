  const express = require('express');
  const router = express.Router();
  const {
    requestBorrow,
    approveBorrowRequest,
    getUserBorrowedBooks,
    getUserBorrowHistory,
    rejectBorrowRequest,
    returnBook
  } = require('../controllers/borrowController');

  const {protect} = require('../middleware/auth');

  // Route người dùng yêu cầu mượn sách
  router.post('/request', protect, requestBorrow);

  // Route lấy danh sách sách đã mượn của người dùng
  router.get('/borrowed', protect, getUserBorrowedBooks);

  // Route quản lý duyệt yêu cầu mượn sách
  router.patch('/approve/:borrowId', protect, approveBorrowRequest);

  router.patch('/reject/:borrowId', protect, rejectBorrowRequest);

  router.get('/history', protect, getUserBorrowHistory);

  // API để trả sách
  router.put('/return/:borrowId', protect, returnBook);

  module.exports = router;