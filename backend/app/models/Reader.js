const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const readerSchema = mongoose.Schema(
    {
      MaDocGia: {type: String, required: true, unique: true},
      HoLot: {type: String, required: true},
      Ten: {type: String, required: true},
      email: {type: String, required: true, unique: true},
      password: {type: String, required: true},
      NgaySinh: {type: Date},
      Phai: {type: String},
      DiaChi: {type: String},
      DienThoai: {type: String},
    },
    {timestamps: true});

// Mã hóa mật khẩu
readerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Phương thức kiểm tra mật khẩu
readerSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Reader = mongoose.model('Reader', readerSchema);

module.exports = Reader;