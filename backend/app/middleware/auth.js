const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Reader = require('../models/Reader');
const NhanVien = require('../models/nv');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('Token nhận được từ frontend:', token);
    console.log(req.headers.authorization);
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token giải mã:', decoded);

      req.nhanVien = await NhanVien.findById(decoded.id).select('-Password');

      // Nếu không phải admin, kiểm tra reader
      const reader = await Reader.findById(decoded.id).select('-password');
      if (reader) {
        req.user = reader;
        req.user.isAdmin = decoded.isAdmin;
        return next();
      }

      throw new Error('Không tìm thấy người dùng');
    } catch (error) {
      console.error('Lỗi JWT:', error.message);
      return res.status(401).json({message: 'Token không hợp lệ!'});
    }
  } else {
    console.log('Không tìm thấy token trong request.');
    return res.status(401).json({message: 'Không được phép, không có token'});
  }
};

module.exports = {
  protect,
};