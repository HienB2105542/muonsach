const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Reader = require('../models/Reader');

const generateToken = (id, isAdmin) => {
  return jwt.sign({id, isAdmin}, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Đăng nhập READER (Người dùng)
const loginReader = async (req, res) => {
  try {
    const {email, password} = req.body;

    const reader = await Reader.findOne({email});

    if (reader && (await reader.matchPassword(password))) {
      res.json({
        _id: reader._id,
        MaDocGia: reader.MaDocGia,
        HoLot: reader.HoLot,
        Ten: reader.Ten,
        email: reader.email,
        isAdmin: reader.isAdmin,  // Sử dụng giá trị isAdmin từ database
        token: generateToken(reader._id, reader.isAdmin)
      });
    } else {
      res.status(401).json({message: 'Email hoặc mật khẩu không đúng'});
    }
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

// Đăng ký người dùng mới
const registerReader = async (req, res) => {
  try {
    const {HoLot, Ten, email, password, NgaySinh, Phai, DiaChi, DienThoai, isAdmin} =
        req.body;

    if (!HoLot || !Ten) {
      return res.status(400).json(
          {message: 'Vui lòng nhập đầy đủ họ lót và tên'});
    }

    const readerExists = await Reader.findOne({email});

    if (readerExists) {
      return res.status(400).json({message: 'Email đã được sử dụng'});
    }

    // Tạo mã độc giả tự động
    const lastReader = await Reader.findOne().sort({MaDocGia: -1});
    let nextId = 1;

    if (lastReader && lastReader.MaDocGia) {
      const lastId = parseInt(lastReader.MaDocGia.slice(2));
      if (!isNaN(lastId)) {
        nextId = lastId + 1;
      }
    }

    const MaDocGia = `DG${nextId.toString().padStart(4, '0')}`;

    // Tạo tài khoản mới
    const reader = await Reader.create({
      MaDocGia,
      HoLot,
      Ten,
      email,
      password,
      NgaySinh,
      Phai,
      DiaChi,
      DienThoai,
      isAdmin: isAdmin === true  // Đảm bảo reader không phải admin
    });

    if (reader) {
      res.status(201).json({
        _id: reader._id,
        MaDocGia: reader.MaDocGia,
        HoLot: reader.HoLot,
        Ten: reader.Ten,
        email: reader.email,
        isAdmin: reader.isAdmin,
        token: generateToken(reader._id, reader.isAdmin)
      });
    } else {
      res.status(400).json({message: 'Dữ liệu không hợp lệ'});
    }
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

// Đăng xuất
const logout = (req, res) => {
  res.clearCookie('token');  // Xóa token nếu có
  res.status(200).json({message: 'Đăng xuất thành công'});
};


module.exports = {
  loginReader,
  registerReader,
  logout
};
