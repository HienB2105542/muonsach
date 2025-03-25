const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const nvSchema = new mongoose.Schema(
    {
      MSNV: {
        type: String,
        unique: true,
        // Auto-generate MSNV if not provided
        default: function() {
          return 'NV' + Math.floor(100000 + Math.random() * 900000);
        }
      },
      HoTenNV: {type: String, required: true},
      Password: {type: String, required: true},
      ChucVu: {type: String, default: 'Nhân viên mới'},
      DiaChi: {type: String, default: ''},
      SoDienThoai: {type: String, required: true},
    },
    {timestamps: true});

// Mã hóa mật khẩu trước khi lưu
nvSchema.pre('save', async function(next) {
  if (!this.isModified('Password')) {
    next();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.Password = await bcrypt.hash(this.Password, salt);
  next();
});

// Phương thức kiểm tra mật khẩu
nvSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.Password);
};

const NhanVien = mongoose.model('NhanVien', nvSchema);

module.exports = NhanVien;