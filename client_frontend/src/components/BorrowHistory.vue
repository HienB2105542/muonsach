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
                { key: 'book.TenSach', label: 'Tên sách' },
                { key: 'borrowDate', label: 'Ngày mượn' },
                { key: 'returnDate', label: 'Ngày trả' },
                { key: 'status', label: 'Trạng thái' }
            ]
        }
    },
    component: {
        refreshBorrowHistory() {
            this.fetchBorrowHistory();
        }
    },
    computed: {
        ...mapState('borrows', {
            borrowHistory: state => state.borrowHistory,
            loading: state => state.loading
        })
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
        this.fetchBorrowHistory()
    }
}
</script>