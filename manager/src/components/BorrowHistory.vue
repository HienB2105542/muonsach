<template>
    <div>
        <h3>Lịch sử mượn sách</h3>
        <div v-if="loading" class="text-center my-4">
            <b-spinner variant="primary" label="Loading..."></b-spinner>
        </div>
        <div v-else>
            <b-table :items="borrowHistory" :fields="fields" striped responsive>
                <template #cell(status)="data">
                    <b-badge :variant="getStatusVariant(data.value)">
                        {{ data.value }}
                    </b-badge>
                </template>
            </b-table>
        </div>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
    name: 'BorrowHistory',
    data() {
        return {
            fields: [
                { key: 'user.name', label: 'Tên người mượn' },
                { key: 'book.TenSach', label: 'Tên sách' },
                { key: 'borrowDate', label: 'Ngày mượn' },
                { key: 'returnDate', label: 'Ngày trả' },
                { key: 'status', label: 'Trạng thái' }
            ]
        }
    },
    computed: {
        borrowHistory() {
            return this.$store.getters["borrow/allBorrowHistory"]; // Lấy toàn bộ lịch sử mượn
        },
        pendingRequests() {
            return this.borrowHistory.filter(book => book.status === 'pending');
        }
    },
    methods: {
        ...mapActions('borrows', ['fetchBorrowHistory']),
        getStatusVariant(status) {
            switch (status) {
                case 'pending':
                    return 'warning'
                case 'approved':
                    return 'success'
                case 'rejected':
                    return 'danger'
                default:
                    return 'secondary'
            }
        }
    },
    created() {
        console.log("Fetching all borrow history...");
        this.$store.dispatch("borrow/fetchAllBorrowHistory"); // Gọi action mới để lấy dữ liệu
    },

}
</script>