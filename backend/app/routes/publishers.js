const express = require('express');
const router = express.Router();
const Publisher = require('../models/Publisher');

// Lấy danh sách Nhà Xuất Bản
router.get('/', async (req, res) => {
  try {
    const publishers = await Publisher.find();
    res.json(publishers);
  } catch (error) {
    res.status(500).json({message: 'Lỗi khi lấy danh sách nhà xuất bản'});
  }
});

//  Thêm Nhà Xuất Bản
router.post('/', async (req, res) => {
  const {MaNXB, TenNXB, DiaChi} = req.body;
  try {
    const newPublisher = new Publisher({MaNXB, TenNXB, DiaChi});
    await newPublisher.save();
    res.status(201).json(
        {message: 'Thêm nhà xuất bản thành công!', publisher: newPublisher});
  } catch (error) {
    res.status(400).json({message: 'Lỗi khi thêm nhà xuất bản', error});
  }
});

// Cập nhật Nhà Xuất Bản
router.put('/:id', async (req, res) => {
  try {
    const updatedPublisher =
        await Publisher.findByIdAndUpdate(req.params.id, req.body, {new: true});
    res.json({message: 'Cập nhật thành công!', publisher: updatedPublisher});
  } catch (error) {
    res.status(400).json({message: 'Lỗi khi cập nhật nhà xuất bản', error});
  }
});

//  Xóa Nhà Xuất Bản
router.delete('/:id', async (req, res) => {
  try {
    await Publisher.findByIdAndDelete(req.params.id);
    res.json({message: 'Xóa nhà xuất bản thành công!'});
  } catch (error) {
    res.status(500).json({message: 'Lỗi khi xóa nhà xuất bản', error});
  }
});

module.exports = router;
