const express = require('express');
const router = express.Router();
const {protect, admin} = require('../middleware/auth');
const User = require('../models/User');
const Reader = require('../models/Reader');

// Controller cho người dùng
const userController = {
  // Lấy thông tin tài khoản cá nhân
  getUserProfile: async (req, res) => {
    try {
      if (req.user.isAdmin !== undefined) {
        // Đây là tài khoản quản lý
        const user = await User.findById(req.user._id).select('-Password');
        res.json(user);
      } else {
        // Đây là tài khoản người đọc
        const reader = await Reader.findById(req.user._id).select('-password');
        res.json(reader);
      }
    } catch (error) {
      res.status(500).json({message: error.message});
    }
  },

  // Cập nhật thông tin tài khoản người đọc
  updateReaderProfile: async (req, res) => {
    try {
      const reader = await Reader.findById(req.user._id);

      if (!reader) {
        return res.status(404).json({message: 'Không tìm thấy người dùng'});
      }

      const {HoLot, Ten, email, password, NgaySinh, Phai, DiaChi, DienThoai} =
          req.body;

      reader.HoLot = HoLot || reader.HoLot;
      reader.Ten = Ten || reader.Ten;
      reader.email = email || reader.email;
      reader.NgaySinh = NgaySinh || reader.NgaySinh;
      reader.Phai = Phai || reader.Phai;
      reader.DiaChi = DiaChi || reader.DiaChi;
      reader.DienThoai = DienThoai || reader.DienThoai;

      if (password) {
        reader.password = password;
      }

      const updatedReader = await reader.save();

      res.json({
        _id: updatedReader._id,
        MaDocGia: updatedReader.MaDocGia,
        HoLot: updatedReader.HoLot,
        Ten: updatedReader.Ten,
        email: updatedReader.email
      });
    } catch (error) {
      res.status(500).json({message: error.message});
    }
  },

  // Lấy danh sách người đọc (Admin only)
  getReaders: async (req, res) => {
    try {
      const pageSize = 10;
      const page = Number(req.query.pageNumber) || 1;

      const keyword = req.query.keyword ? {
        $or: [
          {HoLot: {$regex: req.query.keyword, $options: 'i'}},
          {Ten: {$regex: req.query.keyword, $options: 'i'}},
          {email: {$regex: req.query.keyword, $options: 'i'}}
        ]
      } :
                                          {};

      const count = await Reader.countDocuments({...keyword});
      const readers = await Reader.find({...keyword})
                          .select('-password')
                          .limit(pageSize)
                          .skip(pageSize * (page - 1))
                          .sort({createdAt: -1});

      res.json({readers, page, pages: Math.ceil(count / pageSize), count});
    } catch (error) {
      res.status(500).json({message: error.message});
    }
  },

  // Lấy thông tin chi tiết người đọc (Admin only)
  getReaderById: async (req, res) => {
    try {
      const reader = await Reader.findById(req.params.id).select('-password');

      if (reader) {
        res.json(reader);
      } else {
        res.status(404).json({message: 'Không tìm thấy người đọc'});
      }
    } catch (error) {
      res.status(500).json({message: error.message});
    }
  }
};

// Các routes cho người dùng
router.get('/profile', protect, userController.getUserProfile);
router.put('/profile', protect, userController.updateReaderProfile);
router.get('/readers', protect, admin, userController.getReaders);
router.get('/readers/:id', protect, admin, userController.getReaderById);

module.exports = router;