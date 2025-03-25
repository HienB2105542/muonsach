const BorrowRecord = require('../models/BorrowRecord');
const Book = require('../models/Book');
const Reader = require('../models/Reader');

const requestBorrow = async (req, res) => {
  try {
    const {bookId} = req.body;
    const readerId = req.user._id;

    // Kiểm tra sách còn tồn tại không
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({message: 'Không tìm thấy sách'});
    }

    // Kiểm tra số lượng sách còn lại
    if (book.stock <= 0) {
      return res.status(400).json({message: 'Sách đã hết, không thể mượn'});
    }

    // Kiểm tra xem người dùng đã có yêu cầu mượn chưa
    const existingBorrow = await BorrowRecord.findOne({
      MaDocGia: readerId,
      MaSach: bookId,
      status: {$in: ['pending', 'approved', 'borrowed']},
    });

    if (existingBorrow) {
      return res.status(400).json(
          {message: 'Bạn đã có yêu cầu mượn sách này rồi'});
    }

    // Tạo bản ghi yêu cầu mượn sách
    const borrowRecord = new BorrowRecord({
      MaDocGia: readerId,
      MaSach: bookId,
      status: 'pending',
      NgayMuon: new Date(),
    });
    borrowRecord.set({status: 'pending'});
    await borrowRecord.save();

    // Giảm stock của sách
    book.stock -= 1;
    await book.save();

    res.status(201).json(borrowRecord);
  } catch (error) {
    console.error('Lỗi khi yêu cầu mượn sách:', error);
    res.status(500).json({message: 'Lỗi hệ thống, vui lòng thử lại sau'});
  }
};

const rejectBorrowRequest = async (req, res) => {
  try {
    const {borrowId} = req.params;

    // Tìm bản ghi mượn sách
    const borrowRecord = await BorrowRecord.findById(borrowId);
    if (!borrowRecord) {
      return res.status(404).json(
          {message: 'Không tìm thấy yêu cầu mượn sách'});
    }

    // Kiểm tra trạng thái hiện tại
    if (borrowRecord.status !== 'pending') {
      return res.status(400).json(
          {message: 'Chỉ có thể từ chối yêu cầu đang chờ xác nhận'});
    }

    // Cập nhật trạng thái thành rejected
    borrowRecord.status = 'rejected';
    await borrowRecord.save();

    // Tăng số lượng sách trong kho vì đã từ chối
    const book = await Book.findById(borrowRecord.MaSach);
    if (book) {
      book.stock += 1;
      await book.save();
    }

    res.json(borrowRecord);
  } catch (error) {
    console.error('Lỗi khi từ chối yêu cầu mượn sách:', error);
    res.status(500).json({message: 'Lỗi hệ thống'});
  }
};


// Lấy danh sách sách đã mượn của người dùng
const getUserBorrowedBooks = async (req, res) => {
  try {
    const userId = req.user._id;

    // Tìm tất cả sách đã mượn của người dùng và lấy thông tin sách
    const borrowedBooks =
        await BorrowRecord
            .find({
              MaDocGia: userId,
              status: {$in: ['pending', 'approved', 'borrowed']}
            })
            .populate('MaSach', 'title author');  // Lấy thông tin sách

    res.json(borrowedBooks);
  } catch (error) {
    console.error('Lỗi khi lấy sách đã mượn:', error);
    res.status(500).json({message: 'Lỗi hệ thống, vui lòng thử lại sau'});
  }
};

const getUserBorrowHistory = async (req, res) => {
  try {
    const userId = req.user._id;

    // Kiểm tra userId hợp lệ
    if (!userId) {
      return res.status(400).json({message: 'Thiếu userId'});
    }

    const borrowRecords =
        await BorrowRecord.find({MaDocGia: userId})
            .populate('MaDocGia', 'name email')  // Lấy thông tin người mượn
            .populate('MaSach', 'title author')  // Lấy thông tin sách
            .sort({createdAt: -1});

    console.log('Dữ liệu trả về:', borrowRecords);

    res.json(borrowRecords);
  } catch (error) {
    console.error('Lỗi khi lấy lịch sử mượn sách:', error);
    res.status(500).json({message: 'Lỗi hệ thống'});
  }
};


// Định nghĩa hàm approveBorrowRequest nếu cần
const approveBorrowRequest = async (req, res) => {
  try {
    const {borrowId} = req.params;

    // Tìm bản ghi mượn sách
    const borrowRecord = await BorrowRecord.findById(borrowId);
    if (!borrowRecord) {
      return res.status(404).json(
          {message: 'Không tìm thấy yêu cầu mượn sách'});
    }

    // Cập nhật trạng thái
    borrowRecord.status = 'approved';
    await borrowRecord.save();

    res.json(borrowRecord);
  } catch (error) {
    console.error('Lỗi khi duyệt yêu cầu mượn sách:', error);
    res.status(500).json({message: 'Lỗi hệ thống'});
  }
};

const returnBook = async (req, res) => {
  try {
    const borrow = await BorrowRecord.findById(req.params.borrowId);
    if (!borrow) {
      return res.status(404).json(
          {message: 'Không tìm thấy thông tin mượn sách'});
    }

    // Cập nhật trạng thái thành "Đã trả"
    borrow.status = 'returned';
    borrow.NgayTra = new Date();
    await borrow.save();

    // Tăng số lượng sách trong kho
    const book = await Book.findById(borrow.MaSach);
    if (book) {
      book.stock += 1;
      await book.save();
    }

    res.json({message: 'Trả sách thành công', data: borrow});
  } catch (error) {
    console.error('Lỗi khi trả sách:', error);
    res.status(500).json({message: 'Lỗi server khi trả sách'});
  }
};


module.exports = {
  requestBorrow,
  approveBorrowRequest,
  getUserBorrowedBooks,
  getUserBorrowHistory,
  rejectBorrowRequest,
  returnBook
};
