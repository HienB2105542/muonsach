<template>
    <div class="container py-5 light-theme">
        <!-- Tìm kiếm và Thêm mới -->
        <div class="bg-light rounded shadow-lg p-4 mb-4">
            <div class="input-group mb-3">
                <input type="text" class="form-control" placeholder="Tìm kiếm sách..." v-model="searchQuery">
                <button class="btn btn-dark" @click="searchBooks">
                    <i class="bi bi-search"></i> Tìm kiếm
                </button>
            </div>
            <div class="d-flex justify-content-end">
                <button class="btn btn-dark text-white ms-2 px-3" @click="showAddForm">
                    <i class="bi bi-plus-lg me-1"></i> Thêm
                </button>
            </div>
        </div>

        <!-- Danh sách sách -->
        <h2 class="text-center mb-4 text-dark">Danh sách Sách</h2>

        <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-dark" role="status">
                <span class="visually-hidden">Đang tải...</span>
            </div>
            <p class="mt-2">Đang tải dữ liệu sách...</p>
        </div>

        <div v-else-if="error" class="alert alert-danger text-center">
            <i class="bi bi-exclamation-triangle me-2"></i> {{ error }}
        </div>

        <div v-else-if="filteredBooks.length === 0" class="text-center py-5">
            <i class="bi bi-book text-muted" style="font-size: 3rem;"></i>
            <h4 class="text-muted">Không tìm thấy sách nào</h4>
            <p>Vui lòng thử tìm kiếm với từ khóa khác.</p>
        </div>

        <div v-else class="row row-cols-1 row-cols-md-3 g-4">
            <div v-for="book in paginatedBooks" :key="book._id" class="col">
                <div class="card h-100">
                    <div class="d-flex align-items-center justify-content-center bg-light py-5">
                        <i class="bi bi-book text-secondary" style="font-size: 3rem;"></i>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title mb-1">{{ book.title }}</h5>
                        <p class="card-text text-muted" v-if="book.author"><i class="bi bi-person me-1"></i> {{
                            book.author }}</p>
                        <p class="card-text text-dark fw-bold" v-if="book.price !== null && book.price !== undefined">{{
                            formatPrice(book.price) }} VNĐ</p>
                        <p class="card-text small text-truncate" v-if="book.description">{{ book.description }}</p>
                        <p class="card-text text-muted" v-if="book.category"><i class="bi bi-tag me-1"></i> {{
                            book.category }}</p>
                        <p class="card-text text-muted" v-if="book.stock"><i class="bi bi-boxes me-1"></i> Số lượng: {{
                            book.stock }}</p>
                    </div>
                    <div class="card-footer bg-white border-0 d-flex justify-content-between">
                        <button class="btn btn-sm btn-warning me-2" @click="showEditForm(book)">
                            <i class="bi bi-pencil-square me-1"></i> Sửa
                        </button>
                        <button class="btn btn-sm btn-danger" @click="confirmDeleteBook(book._id)">
                            <i class="bi bi-trash me-1"></i> Xóa
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Phân trang -->
        <div v-if="filteredBooks.length > itemsPerPage" class="d-flex justify-content-center mt-4">
            <nav>
                <ul class="pagination">
                    <li class="page-item" :class="{ disabled: currentPage === 1 }">
                        <button class="page-link" @click="currentPage--" :disabled="currentPage === 1">
                            <i class="bi bi-chevron-left"></i>
                        </button>
                    </li>
                    <li v-for="page in totalPages" :key="page" class="page-item"
                        :class="{ active: page === currentPage }">
                        <button class="page-link" @click="currentPage = page">{{ page }}</button>
                    </li>
                    <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                        <button class="page-link" @click="currentPage++" :disabled="currentPage === totalPages">
                            <i class="bi bi-chevron-right"></i>
                        </button>
                    </li>
                </ul>
            </nav>
        </div>

        <!-- Form Thêm/Sửa Sách -->
        <div class="modal fade" id="bookFormModal" tabindex="-1" aria-labelledby="bookFormModalLabel">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="bookFormModalLabel">{{ isEditing ? 'Sửa thông tin sách' : 'Thêm sách mới' }}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="submitBookForm">
                            <div class="mb-3">
                                <label for="bookMaSach" class="form-label">Mã sách <span
                                        class="text-danger">*</span></label>
                                <input type="text" class="form-control" id="bookMaSach" v-model="bookForm.MaSach"
                                    required>
                            </div>
                            <div class="mb-3">
                                <label for="bookTitle" class="form-label">Tên sách <span
                                        class="text-danger">*</span></label>
                                <input type="text" class="form-control" id="bookTitle" v-model="bookForm.title"
                                    required>
                            </div>
                            <div class="mb-3">
                                <label for="bookAuthor" class="form-label">Tác giả</label>
                                <input type="text" class="form-control" id="bookAuthor" v-model="bookForm.author">
                            </div>
                            <div class="mb-3">
                                <label for="bookCategory" class="form-label">Thể loại</label>
                                <select class="form-control" id="bookCategory" v-model="bookForm.category">
                                    <option value="" selected>Chọn thể loại</option>
                                    <option value="Văn học">Văn học</option>
                                    <option value="Khoa học">Khoa học</option>
                                    <option value="Kinh tế">Kinh tế</option>
                                    <option value="Thiếu nhi">Thiếu nhi</option>
                                    <option value="Lịch sử">Lịch sử</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="bookStock" class="form-label">Số lượng</label>
                                <input type="number" class="form-control" id="bookStock" v-model="bookForm.stock"
                                    min="0">
                            </div>
                            <div class="mb-3">
                                <label for="bookPrice" class="form-label">Giá (VNĐ)</label>
                                <input type="number" class="form-control" id="bookPrice" v-model="bookForm.price"
                                    min="0">
                            </div>
                            <div class="mb-3">
                                <label for="bookDescription" class="form-label">Mô tả</label>
                                <textarea class="form-control" id="bookDescription" rows="3"
                                    v-model="bookForm.description"></textarea>
                            </div>
                            <div class="d-flex justify-content-end">
                                <button type="button" class="btn btn-secondary me-2"
                                    data-bs-dismiss="modal">Hủy</button>
                                <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                                    <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1"
                                        role="status"></span>
                                    {{ isEditing ? 'Cập nhật' : 'Thêm sách' }}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            books: [],
            loading: true,
            error: null,
            searchQuery: '',
            currentPage: 1,
            itemsPerPage: 8,
            bookToDelete: null,
            bookForm: {
                MaSach: '',
                title: '',
                author: '',
                price: null,
                description: '',
                category: '',
                stock: null
            },
            isEditing: false,
            currentBookId: null,
            isSubmitting: false,
            bookModal: null
        };
    },
    computed: {
        filteredBooks() {
            let result = [...this.books];
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                result = result.filter(book =>
                    book.title.toLowerCase().includes(query) ||
                    (book.author && book.author.toLowerCase().includes(query)) ||
                    (book.description && book.description.toLowerCase().includes(query))
                );
            }
            return result;
        },
        paginatedBooks() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            return this.filteredBooks.slice(start, start + this.itemsPerPage);
        },
        totalPages() {
            return Math.ceil(this.filteredBooks.length / this.itemsPerPage);
        }
    },
    methods: {
        async fetchBooks() {
            this.loading = true;
            try {
                const response = await axios.get('http://localhost:5000/api/books');
                this.books = response.data.books;
            } catch (error) {
                this.error = 'Không thể tải dữ liệu sách. Vui lòng thử lại sau.';
                console.error('Error fetching books:', error);
            } finally {
                this.loading = false;
            }
        },
        searchBooks() {
            this.currentPage = 1;
        },
        formatPrice(price) {
            return new Intl.NumberFormat('vi-VN').format(price);
        },
        resetBookForm() {
            this.bookForm = {
                MaSach: '',
                title: '',
                author: '',
                price: null,
                description: '',
                category: '',
                stock: null
            };
            this.isEditing = false;
            this.currentBookId = null;
        },
        showAddForm() {
            this.resetBookForm();
            this.isEditing = false;
            this.bookModal.show();
        },
        showEditForm(book) {
            this.isEditing = true;
            this.currentBookId = book._id;
            this.bookForm = {
                MaSach: book.MaSach,
                title: book.title,
                author: book.author || '',
                price: book.price !== undefined ? book.price : null,
                description: book.description || '',
                category: book.category || '',
                stock: book.stock !== undefined ? book.stock : null
            };
            this.bookModal.show();
        },
        async submitBookForm() {
            if (!this.bookForm.title) {
                alert("Tên sách là trường bắt buộc!");
                return;
            }

            // Chuẩn bị dữ liệu để gửi
            const formData = {
                MaSach: this.bookForm.MaSach,
                title: this.bookForm.title
            };

            // Thêm các trường không bắt buộc nếu có giá trị
            if (this.bookForm.author) formData.author = this.bookForm.author;
            if (this.bookForm.price !== null) formData.price = this.bookForm.price;
            if (this.bookForm.description) formData.description = this.bookForm.description;
            if (this.bookForm.category) formData.category = this.bookForm.category;
            if (this.bookForm.stock !== null) formData.stock = this.bookForm.stock;

            this.isSubmitting = true;
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    alert("Bạn cần đăng nhập để thực hiện thao tác này!");
                    this.bookModal.hide();
                    this.$router.push({ name: "Login" });
                    return;
                }

                const headers = { Authorization: `Bearer ${token}` };
                let response;

                if (this.isEditing) {
                    // Cập nhật sách
                    response = await axios.put(
                        `http://localhost:5000/api/books/${this.currentBookId}`,
                        formData,
                        { headers }
                    );

                    const index = this.books.findIndex(book => book._id === this.currentBookId);
                    if (index !== -1) {
                        this.books[index] = { ...this.books[index], ...formData };
                    }

                    alert("Cập nhật sách thành công!");
                } else {
                    // Thêm sách mới
                    response = await axios.post(
                        'http://localhost:5000/api/books',
                        formData,
                        { headers }
                    );

                    this.books.push(response.data.book);
                    alert("Thêm sách mới thành công!");
                }

                this.bookModal.hide();
                this.resetBookForm();
            } catch (error) {
                const errorMsg = error.response?.data?.message || "Lỗi không xác định";
                alert(`Lỗi: ${errorMsg}`);
                console.error('Error submitting form:', error);
            } finally {
                this.isSubmitting = false;
            }
        },
        confirmDeleteBook(bookId) {
            this.bookToDelete = bookId;
            if (confirm("Bạn có chắc chắn muốn xóa sách này không?")) {
                this.deleteBook();
            }
        },
        async deleteBook() {
            if (!this.bookToDelete) return;
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    alert("Bạn cần đăng nhập để thực hiện thao tác này!");
                    this.$router.push({ name: "Login" });
                    return;
                }

                await axios.delete(`http://localhost:5000/api/books/${this.bookToDelete}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                this.books = this.books.filter(book => book._id !== this.bookToDelete);
                this.bookToDelete = null;

                if (this.filteredBooks.length === 0 && this.currentPage > 1) {
                    this.currentPage--;
                }

                alert("Xóa sách thành công!");
            } catch (error) {
                alert("Lỗi khi xóa sách: " + (error.response?.data?.message || "Lỗi không xác định"));
                console.error('Error deleting book:', error);
            }
        }
    },
    created() {
        this.fetchBooks();
    },
    mounted() {
        // Khởi tạo modal Bootstrap
        this.bookModal = new bootstrap.Modal(document.getElementById('bookFormModal'));

        // Xử lý sự kiện đóng modal
        document.getElementById('bookFormModal').addEventListener('hidden.bs.modal', () => {
            this.resetBookForm();
        });
    }
};
</script>

<style scoped>
.card-footer .btn {
    flex: 1;
}
</style>