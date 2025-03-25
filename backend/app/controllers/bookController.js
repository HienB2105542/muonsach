const Book = require('../models/Book');
const Publisher = require('../models/Publisher');

// Lấy tất cả sách
const getBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.json({books});
  } catch (error) {
    res.status(500).json({message: 'Lỗi server'});
  }
};


// Lấy thông tin chi tiết sách
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
                     .populate('publisher', 'TenNXB MaNXB DiaChi');

    if (book) {
      res.json(book);
    } else {
      res.status(404).json({message: 'Không tìm thấy sách'});
    }
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};
const createBook = async (req, res) => {
  try {
    const {MaSach, title, author, price, description, category, stock} =
        req.body;

    console.log('Dữ liệu nhận được:', req.body);

    // Kiểm tra dữ liệu đầu vào
    if (!MaSach || !title || !author || !price || !stock) {
      console.error('Thiếu dữ liệu!');
      return res.status(400).json(
          {message: 'Vui lòng nhập đầy đủ thông tin sách.'});
    }

    // Tạo sách mới theo cách giống `Publisher`
    const newBook = new Book({
      MaSach,
      title,
      author,
      price,
      description: description || '',
      category: category || 'Khác',
      stock
    });

    // Lưu sách vào database
    await newBook.save();

    console.log('Thêm sách thành công:', newBook);
    return res.status(201).json(
        {message: 'Thêm sách thành công!', book: newBook});

  } catch (error) {
    console.error('Lỗi khi thêm sách:', error);
    return res.status(500).json(
        {message: 'Lỗi server, không thể thêm sách', error: error.message});
  }
};

// Cập nhật thông tin sách
const updateBook = async (req, res) => {
  try {
    const {
      TenSach,
      DonGia,
      SoQuyen,
      NamXuatBan,
      publisherId,
      NguonGoc,
      TacGia
    } = req.body;

    const book = await Book.findById(req.params.id);

    if (book) {
      // Cập nhật số lượng available dựa vào sự thay đổi của SoQuyen
      const availableDiff = SoQuyen - book.SoQuyen;

      book.TenSach = TenSach || book.TenSach;
      book.DonGia = DonGia || book.DonGia;
      book.SoQuyen = SoQuyen || book.SoQuyen;
      book.available = Math.max(0, book.available + availableDiff);
      book.NamXuatBan = NamXuatBan || book.NamXuatBan;
      book.publisher = publisherId || book.publisher;
      book.NguonGoc = NguonGoc || book.NguonGoc;
      book.TacGia = TacGia || book.TacGia;

      const updatedBook = await book.save();
      res.json(updatedBook);
    } else {
      res.status(404).json({message: 'Không tìm thấy sách'});
    }
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

// Xóa sách
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (book) {
      await book.deleteOne();
      res.json({message: 'Đã xóa sách'});
    } else {
      res.status(404).json({message: 'Không tìm thấy sách'});
    }
  } catch (error) {
    res.status(500).json({message: error.message});
  }
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
};