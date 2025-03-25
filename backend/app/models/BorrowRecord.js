const mongoose = require('mongoose');

const BorrowRecordSchema = new mongoose.Schema(
    {
      MaDocGia:
          {type: mongoose.Schema.Types.ObjectId, ref: 'Reader', required: true},
      MaSach:
          {type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true},
      NgayMuon: {type: Date, required: true, default: Date.now},
      NgayTra: {type: Date, default: Date.now},
      status: {
        type: String,
        enum: ['pending', 'approved', 'borrowed', 'returned', 'rejected'],
        default: 'pending'
      }
    },
    {timestamps: true});

module.exports = mongoose.model('BorrowRecord', BorrowRecordSchema);