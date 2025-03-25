const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema(
    {
      MaSach: {type: String, required: true, unique: true},
      title: {type: String, required: true},   
      author: {type: String, required: true},  
      price: {type: Number, required: true},   
      description: {type: String},             
      category: {type: String},                
      stock: {
        type: Number,
        required: true,
        default: 1
      },  
    },
    {timestamps: true});

module.exports = mongoose.model('Book', BookSchema);
