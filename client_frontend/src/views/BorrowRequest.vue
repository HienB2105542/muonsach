<template>
    <div class="container py-4">
        <h2 class="mb-4">Yêu cầu mượn sách</h2>

        <div v-if="loading" class="text-center">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Đang tải...</span>
            </div>
        </div>

        <div v-else-if="error" class="alert alert-danger">
            {{ error }}
        </div>

        <div v-else class="row">
            <div class="col-md-6">
                <div class="card mb-4">
                    <div class="card-body">
                        <h5 class="card-title">{{ book.title }}</h5>
                        <p class="card-text"><strong>Tác giả:</strong> {{ book.author }}</p>
                        <p class="card-text"><strong>Thể loại:</strong> {{ book.category }}</p>
                        <p class="card-text"><strong>Số lượng còn lại:</strong> {{ book.stock }}</p>
                    </div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title">Thông tin mượn sách</h5>
                        <form @submit.prevent="submitRequest">
                            <div class="mb-3">
                                <label class="form-label">Ngày mượn:</label>
                                <input type="date" class="form-control" v-model="borrowDate" :min="today" required>
                            </div>

                            <div class="mb-3">
                                <label class="form-label">Ngày trả dự kiến:</label>
                                <input type="date" class="form-control" v-model="returnDate" :min="borrowDate" required>
                            </div>

                            <div class="mb-3">
                                <label class="form-label">Ghi chú (không bắt buộc):</label>
                                <textarea class="form-control" v-model="notes" rows="3"></textarea>
                            </div>

                            <div class="d-grid">
                                <button type="submit" class="btn btn-dark" :disabled="book.stock <= 0 || isSubmitting">
                                    <span v-if="isSubmitting">
                                        <span class="spinner-border spinner-border-sm" role="status"
                                            aria-hidden="true"></span>
                                        Đang xử lý...
                                    </span>
                                    <span v-else>Gửi yêu cầu mượn sách</span>
                                </button>
                            </div>

                            <div v-if="book.stock <= 0" class="text-danger mt-2">
                                Sách hiện không còn để mượn.
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';

export default {
    setup() {
        const router = useRouter();
        const route = useRoute();
        const store = useStore();

        const book = ref({});
        const loading = ref(true);
        const error = ref(null);
        const isSubmitting = ref(false);

        const borrowDate = ref(new Date().toISOString().split('T')[0]);
        const returnDate = ref(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
        const notes = ref('');

        const today = computed(() => new Date().toISOString().split('T')[0]);

        onMounted(async () => {
            try {
                const bookId = route.params.id;
                const response = await axios.get(`http://localhost:5000/api/books/${bookId}`);
                book.value = response.data.book;
            } catch (err) {
                console.error('Lỗi khi lấy thông tin sách:', err);
                error.value = 'Không thể tải thông tin sách. Vui lòng thử lại sau.';
            } finally {
                loading.value = false;
            }
        });

        const submitRequest = async () => {
            if (isSubmitting.value) return;

            isSubmitting.value = true;

            try {
                const borrowRequest = {
                    bookId: route.params.id,
                    borrowDate: borrowDate.value,
                    returnDate: returnDate.value,
                    notes: notes.value,
                    userId: store.getters['auth/user']._id // Lấy id người dùng từ store
                };

                await axios.post('http://localhost:5000/api/borrows/request', borrowRequest, {
                    headers: {
                        Authorization: `Bearer ${store.getters['auth/token']}`
                    }
                });

                // Hiển thị thông báo thành công
                alert('Yêu cầu mượn sách đã được gửi thành công và đang chờ xác nhận!');

                // Chuyển hướng đến trang BookView để xem các giao dịch
                router.push({ name: 'BookView' });
            } catch (err) {
                console.error('Lỗi khi gửi yêu cầu mượn sách:', err);
                alert('Có lỗi xảy ra khi gửi yêu cầu. Vui lòng thử lại sau.');
            } finally {
                isSubmitting.value = false;
            }
        };

        return {
            book,
            loading,
            error,
            borrowDate,
            returnDate,
            notes,
            today,
            isSubmitting,
            submitRequest
        };
    }
};
</script>