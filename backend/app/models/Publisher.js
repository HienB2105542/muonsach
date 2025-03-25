const mongoose = require('mongoose');

const PublisherSchema = new mongoose.Schema(
    {
      MaNXB: {type: String, required: true, unique: true},
      TenNXB: {type: String, required: true},
      DiaChi: {type: String}
    },
    {timestamps: true});

module.exports = mongoose.model('Publisher', PublisherSchema);