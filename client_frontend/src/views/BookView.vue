<template>
    <div class="container mt-4">
        <div class="card bg-white">
            <div class="card-header bg-dark text-white">
                <h2 class="mb-0">Lịch sử mượn sách</h2>
            </div>
            <div class="card-body">
                <div v-if="borrowHistory.length">
                    <div class="alert alert-light border mb-3">
                        <i class="bi bi-info-circle me-2"></i>
                        Bạn đang mượn <strong>{{ activeBooks.length }}</strong> cuốn sách
                    </div>

                    <div class="table-responsive">
                        <table class="table table-striped table-hover">
                            <thead class="table-dark">
                                <tr>
                                    <th>Tên sách</th>
                                    <th>Tác giả</th>
                                    <th>Ngày mượn</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="borrow in borrowHistory" :key="borrow._id">
                                    <td>
                                        <span v-if="borrow.MaSach && borrow.MaSach.title">
                                            {{ borrow.MaSach.title }}
                                        </span>
                                        <span v-else class="text-muted">Không có dữ liệu</span>
                                    </td>
                                    <td>
                                        <span v-if="borrow.MaSach && borrow.MaSach.author">
                                            {{ borrow.MaSach.author }}
                                        </span>
                                        <span v-else class="text-muted">Không có dữ liệu</span>
                                    </td>
                                    <td>{{ formatDate(borrow.NgayMuon) }}</td>
                                    <td>
                                        <span :class="{
                                            'badge': true,
    'bg-warning text-dark': borrow.status === 'pending',   // Màu vàng
    'bg-primary text-white': borrow.status === 'approved', // Màu xanh
    'bg-danger text-white': borrow.status === 'rejected',
    'bg-success': borrow.status === 'returned'
                                        }">
                                            {{ translateStatus(borrow.status) }}
                                        </span>
                                    </td>
                                    <td>
                                        <button class="btn btn-sm btn-dark" @click="returnBook(borrow._id)"
                                            :disabled="isLoading">
                                            <span v-if="isLoading && currentBookId === borrow._id"
                                                class="spinner-border spinner-border-sm me-1" role="status"></span>
                                            <i v-else class="bi bi-arrow-return-left me-1"></i>
                                            Trả sách
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div v-else class="text-center py-4">
                    <i class="bi bi-exclamation-triangle fs-2 text-dark"></i>
                    <p class="mt-3">Không có lịch sử mượn sách</p>
                    <router-link to="/" class="btn btn-dark mt-2">
                        <i class="bi bi-book me-2"></i>Tìm sách để mượn
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            isLoading: false,
            currentBookId: null
        };
    },

    computed: {
        borrowHistory() {
            return this.$store.getters["borrow/borrowHistory"];
        },
        activeBooks() {
            return this.borrowHistory.filter(book => book.status === 'pending' || book.status === 'approved');
        }
    },

    created() {
        console.log("Fetching borrow history...");
        this.$store.dispatch("borrow/fetchBorrowHistory");
    },

    methods: {
        formatDate(dateString) {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return new Intl.DateTimeFormat('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).format(date);
        },
        translateStatus(status) {
            const statusMap = {
                'pending': 'Chờ xác nhận',
                'approved': 'Xác nhận',
                'returned': 'Đã trả',
                'rejected': 'Đã từ chối'
            };
            return statusMap[status] || status;
        },
        async returnBook(borrowId) {
            try {
                this.isLoading = true;
                this.currentBookId = borrowId;

                await this.$store.dispatch("borrow/returnBook", borrowId);

                this.$toast.success("Đã trả sách thành công!");

                // Cập nhật lại danh sách
                this.$store.dispatch("borrow/fetchBorrowHistory");
            } catch (error) {
                console.error("Lỗi khi trả sách:", error);
                this.$toast.error(error && error.response && error.response.data ?
                    error.response.data.message : "Có lỗi xảy ra khi trả sách.");
            } finally {
                this.isLoading = false;
                this.currentBookId = null;
            }
        }
    }
};
</script>

<style scoped>
.card {
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.table-striped>tbody>tr:nth-of-type(odd) {
    background-color: #f8f9fa;
}

.table-hover>tbody>tr:hover {
    background-color: #e9ecef;
}
</style>