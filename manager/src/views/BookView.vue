<template>
    <div class="container mt-4">
        <div class="card bg-white">
            <div class="card-header bg-dark text-white">
                <h2 class="mb-0">Lịch sử mượn sách</h2>
            </div>
            <div class="card-body">
                <div v-if="borrowHistory.length">
                    <div class="table-responsive">
                        <table class="table table-striped table-hover">
                            <thead class="table-dark">
                                <tr>
                                    <th>Tên sách</th>
                                    <th>Tác giả</th>
                                    <th>Ngày yêu cầu</th>
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
                                            'bg-warning text-dark': borrow.status === 'pending',   
                                            'bg-info text-dark': borrow.status === 'approved',      
                                            'bg-primary text-white': borrow.status === 'borrowed', 
                                            'bg-success text-white': borrow.status === 'returned', 
                                            'bg-danger text-white': borrow.status === 'rejected',
                                        }">
                                            {{ translateStatus(borrow.status) }}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="d-flex gap-2">
                                            <button v-if="borrow.status === 'pending'" class="btn btn-sm btn-success"
                                                @click="handleBookAction(borrow._id, 'approve')"
                                                :disabled="isLoading && currentBookId === borrow._id">
                                                <span
                                                    v-if="isLoading && currentBookId === borrow._id && actionType === 'approve'"
                                                    class="spinner-border spinner-border-sm me-1" role="status"></span>
                                                <i v-else class="bi bi-check-circle me-1"></i>
                                                Xác nhận
                                            </button>
                                            <button v-if="borrow.status === 'pending'" class="btn btn-sm btn-danger"
                                                @click="handleBookAction(borrow._id, 'reject')"
                                                :disabled="isLoading && currentBookId === borrow._id">
                                                <span
                                                    v-if="isLoading && currentBookId === borrow._id && actionType === 'reject'"
                                                    class="spinner-border spinner-border-sm me-1" role="status"></span>
                                                <i v-else class="bi bi-x-circle me-1"></i>
                                                Từ chối
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div v-else class="text-center py-4">
                    <i class="bi bi-exclamation-triangle fs-2 text-dark"></i>
                    <p class="mt-3">Không có yêu cầu mượn sách nào</p>
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
            currentBookId: null,
            actionType: null
        };
    },

    computed: {
        borrowHistory() {
            return this.$store.getters["borrow/borrowHistory"];
        },
        pendingRequests() {
            return this.borrowHistory.filter(book => book.status === 'pending');
        },
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

        async handleBookAction(borrowId, action) {
            try {
                this.isLoading = true;
                this.currentBookId = borrowId;
                this.actionType = action;

                let message = '';

                if (action === 'approve') {
                    await this.$store.dispatch("borrow/approveBook", borrowId);
                    message = "Đã xác nhận yêu cầu mượn sách!";
                } else if (action === 'reject') {
                    await this.$store.dispatch("borrow/rejectBook", borrowId);
                    message = "Đã từ chối yêu cầu mượn sách!";
                }

                this.$toast.success(message);
                this.$store.dispatch("borrow/fetchBorrowHistory");
            } catch (error) {
                console.error(`Lỗi khi thực hiện hành động ${action}:`, error);

                // Kiểm tra nếu error.response tồn tại
                let errorMessage = error?.response?.data?.message || "Có lỗi xảy ra.";
                this.$toast.error(errorMessage);
            } finally {
                this.isLoading = false;
                this.currentBookId = null;
                this.actionType = null;
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
