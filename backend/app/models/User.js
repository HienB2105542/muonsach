const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const UserSchema = new mongoose.Schema({
  fullname: {type: String, required: [true, 'Vui lòng nhập họ tên']},
  email: {
    type: String,
    required: [true, 'Vui lòng nhập email'],
    unique: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email không hợp lệ']
  },
  password: {
    type: String,
    required: [true, 'Vui lòng nhập mật khẩu'],
    minlength: 8,
    select: false
  },
  role: {type: String, enum: ['reader', 'admin'], default: 'reader'},
  isActive: {type: Boolean, default: true},
  createdAt: {type: Date, default: Date.now}
})

// Mã hóa mật khẩu trước khi lưu
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next()
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
})

// Phương thức so sánh mật khẩu
UserSchema.methods.matchPassword =
    async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

    // Phương thức tạo JWT
    UserSchema.methods.getSignedJwtToken =
        function() {
  return jwt.sign(
      {id: this._id, role: this.role}, process.env.JWT_SECRET,
      {expiresIn: process.env.JWT_EXPIRE})
}

        module.exports = mongoose.model('User', UserSchema)