const jwt = require('jsonwebtoken');
const NhanVien = require('../models/nv');

const registerNhanVien = async (req, res) => {
  const { HoTenNV, Password, SoDienThoai, DiaChi } = req.body;

  // Kiểm tra nhân viên đã tồn tại chưa
  const nhanvienExists = await NhanVien.findOne({ SoDienThoai });
  if (nhanvienExists) {
    return res.status(400).json({ message: 'Nhân viên đã tồn tại' });
  }

  // Tạo nhân viên mới
  const nhanvien =
    await NhanVien.create({ HoTenNV, Password, SoDienThoai, DiaChi });

  if (nhanvien) {
    res.status(201).json({
      _id: nhanvien._id,
      HoTenNV: nhanvien.HoTenNV,
      SoDienThoai: nhanvien.SoDienThoai,
      DiaChi: nhanvien.DiaChi
    });
  } else {
    res.status(400).json({ message: 'Lỗi khi tạo tài khoản' });
  }
};


// Đăng nhập nhân viên
const loginNhanVien = async (req, res) => {
  try {
    const {MSNV, Password} = req.body;

    // Kiểm tra nhân viên có tồn tại không
    const nhanVien = await NhanVien.findOne({MSNV});
    if (!nhanVien) {
      return res.status(404).json({message: 'Nhân viên không tồn tại!'});
    }

    // Kiểm tra mật khẩu bằng method của schema
    const isMatch = await nhanVien.matchPassword(Password);
    if (!isMatch) {
      return res.status(401).json({message: 'Sai mật khẩu!'});
    }

    // Tạo token đăng nhập
    const token = jwt.sign(
        {id: nhanVien._id}, process.env.JWT_SECRET || 'SECRET_KEY',
        {expiresIn: '1h'});

    res.json({
      message: 'Đăng nhập thành công!',
      token,
      nhanVien: {
        MSNV: nhanVien.MSNV,
        HoTenNV: nhanVien.HoTenNV,
        ChucVu: nhanVien.ChucVu
      }
    });

  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    res.status(500).json({message: 'Lỗi server', error: error.message});
  }
};

module.exports = {
  registerNhanVien,
  loginNhanVien
};