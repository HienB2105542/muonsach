<template>
    <div class="container py-5 light-theme">
        <header class="text-center mb-5">
            <h1 class="display-4 fw-bold text-primary">Chào mừng đến với thư viện</h1>
            <p class="text-muted mx-auto w-75">
                Khám phá kho tàng sách phong phú của chúng tôi và tìm kiếm những cuốn sách yêu thích của bạn.
            </p>
        </header>

        <!-- Tìm kiếm và bộ lọc -->
        <div class="bg-light rounded shadow-lg p-4 mb-4">
            <div class="input-group mb-3">
                <input type="text" class="form-control" placeholder="Tìm kiếm sách..." v-model="searchQuery">
                <button class="btn btn-dark" @click="searchBooks">
                    <i class="bi bi-search"></i> Tìm kiếm
                </button>
            </div>
            <div class="d-flex justify-content-end">
                <div class="dropdown me-2">
                    <button class="btn btn-outline-dark dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        Thể loại: {{ selectedCategory || 'Tất cả' }}
                    </button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="#" @click.prevent="selectedCategory = null">Tất cả</a></li>
                        <li v-for="category in categories" :key="category">
                            <a class="dropdown-item" href="#" @click.prevent="selectedCategory = category">{{ category
                                }}</a>
                        </li>
                    </ul>
                </div>
                <div class="dropdown">
                    <button class="btn btn-outline-dark dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        Sắp xếp: {{ sortOptions[sortBy] }}
                    </button>
                    <ul class="dropdown-menu">
                        <li v-for="(label, value) in sortOptions" :key="value">
                            <a class="dropdown-item" href="#" @click.prevent="sortBy = value">{{ label }}</a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Danh sách sách -->
        <h2 class="text-center mb-4 text-primary">Danh sách Sách</h2>

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
            <p>Vui lòng thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc.</p>
        </div>

        <div v-else class="row row-cols-1 row-cols-md-3 g-4">
            <div v-for="book in paginatedBooks" :key="book._id" class="col">
                <div class="card h-100" >
                    <div class="d-flex align-items-center justify-content-center bg-light py-5">
                        <i class="bi bi-book text-secondary" style="font-size: 3rem;"></i>
                    </div>
                    <div class="card-body">
                        <h5 class="card-title mb-1">{{ book.title }}</h5>
                        <p class="card-text text-muted"><i class="bi bi-person me-1"></i> {{ book.author }}</p>
                        <p class="card-text">
                            <span class="badge bg-dark me-1">{{ book.category }}</span>
                            <span class="badge bg-secondary text-white"><i class="bi bi-box-seam me-1"></i> {{
                                book.stock }} cuốn</span>
                        </p>
                        <p class="card-text text-dark fw-bold">{{ formatPrice(book.price) }} VNĐ</p>
                        <p class="card-text small text-truncate" v-if="book.Description">{{ book.Description }}</p>
                    </div>
                    <div class="card-footer bg-white border-0 d-flex justify-content-between">
                        <button class="btn btn-sm btn-dark flex-grow-1" @click.stop="borrowBook(book._id)">
                            <i class="bi bi-cart-plus me-1"></i> Mượn sách
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Phân trang -->
        <nav v-if="filteredBooks.length > 0" class="d-flex justify-content-center mt-4">
            <ul class="pagination">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                    <a class="page-link" href="#" @click.prevent="currentPage = Math.max(1, currentPage - 1)">
                        <i class="bi bi-chevron-left"></i>
                    </a>
                </li>
                <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: currentPage === page }">
                    <a class="page-link" href="#" @click.prevent="currentPage = page">{{ page }}</a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                    <a class="page-link" href="#" @click.prevent="currentPage = Math.min(totalPages, currentPage + 1)">
                        <i class="bi bi-chevron-right"></i>
                    </a>
                </li>
            </ul>
        </nav>
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
            selectedCategory: null,
            sortBy: 'title',
            sortOptions: {
                'title': 'Tên sách (A-Z)',
                'title_desc': 'Tên sách (Z-A)',
                'price_asc': 'Giá (Thấp - Cao)',
                'price_desc': 'Giá (Cao - Thấp)'
            },
            currentPage: 1,
            itemsPerPage: 8
        };
    },
    computed: {
        categories() {
            // Lấy danh sách các thể loại duy nhất từ sách
            const categoriesSet = new Set(this.books.map(book => book.category).filter(Boolean));
            return [...categoriesSet];
        },
        filteredBooks() {
            let result = [...this.books];

            // Lọc theo tìm kiếm
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                result = result.filter(book =>
                    book.title.toLowerCase().includes(query) ||
                    (book.author && book.author.toLowerCase().includes(query)) ||
                    (book.Description && book.Description.toLowerCase().includes(query))
                );
            }

            // Lọc theo thể loại
            if (this.selectedCategory) {
                result = result.filter(book => book.category === this.selectedCategory);
            }

            // Sắp xếp
            result.sort((a, b) => {
                switch (this.sortBy) {
                    case 'title_desc':
                        return b.title.localeCompare(a.title);
                    case 'price_asc':
                        return a.price - b.price;
                    case 'price_desc':
                        return b.price - a.price;
                    case 'title':
                    default:
                        return a.title.localeCompare(b.title);
                }
            });

            return result;
        },
        paginatedBooks() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.filteredBooks.slice(start, end);
        },
        totalPages() {
            return Math.ceil(this.filteredBooks.length / this.itemsPerPage);
        }
    },
    methods: {
        async fetchBooks() {
            this.loading = true;
            this.error = null;

            try {
                const response = await axios.get('http://localhost:5000/api/books');
                this.books = response.data.books;
            } catch (error) {
                console.error('Lỗi khi lấy dữ liệu:', error);
                this.error = 'Không thể tải dữ liệu sách. Vui lòng thử lại sau.';
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
        async borrowBook(bookId) {
            try {
                const token = localStorage.getItem("token");  // Lấy token từ localStorage
                if (!token) {
                    alert("Bạn cần đăng nhập trước khi mượn sách!");
                    this.$router.push({ name: "Login" }); // Chuyển hướng đến trang đăng nhập
                    return;
                }

                const response = await axios.post("http://localhost:5000/api/borrows/request",
                    { bookId },
                    { headers: { Authorization: `Bearer ${token}` } });

                alert("Yêu cầu mượn sách thành công!");
            } catch (error) {
                console.error("Lỗi khi mượn sách:", error.response?.data?.message || error.message);
                alert("Lỗi khi mượn sách: " + (error.response?.data?.message || "Lỗi không xác định"));
            }
        }
    },
    watch: {
        selectedCategory() {
            this.currentPage = 1;
        },
        sortBy() {
            // Không cần reset trang khi chỉ thay đổi sắp xếp
        }
    },
    created() {
        this.fetchBooks();
    }
};
</script>

<style scoped>

h1,
h2,
h3,
h4,
h5,
h6 {
    color: #000000 !important;
}

</style>