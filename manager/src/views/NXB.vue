<template>
    <div class="container py-5 light-theme">
        <div class="bg-light rounded shadow-lg p-4 mb-4 text-dark">
            <div class="input-group mb-3">
                <input type="text" class="form-control" placeholder="Tìm kiếm nhà xuất bản..." v-model="searchQuery">
                <button class="btn btn-dark" @click="searchPublishers">
                    <i class="bi bi-search"></i> Tìm kiếm
                </button>
            </div>
            <button class="btn btn-dark text-white ms-2 px-3" @click="checkLoginBeforeAdd">
                <i class="bi bi-plus-lg me-1"></i> Thêm
            </button>
        </div>

        <div class="container py-4">
            <h2 class="text-center mb-4">Nhà Xuất Bản</h2>
            <div class="list-group">
                <div v-for="publisher in filteredPublishers" :key="publisher._id"
                    class="list-group-item d-flex align-items-center">
                    <div class="flex-grow-1">
                        <h5 class="mb-1">{{ publisher.TenNXB }}</h5>
                        <p class="mb-0">{{ publisher.DiaChi }}</p>
                    </div>
                    <button class="btn btn-primary me-2" @click="checkLoginBeforeEdit(publisher)">Chỉnh sửa</button>
                    <button class="btn btn-danger" @click="checkLoginBeforeDelete(publisher._id)">Xóa</button>
                </div>
            </div>
        </div>

        <!-- Form chỉnh sửa -->
        <div v-if="showEditForm" class="edit-form">
            <div class="form-container">
                <h3>Chỉnh sửa Nhà Xuất Bản</h3>
                <label>Tên:</label>
                <input v-model="selectedPublisher.TenNXB" type="text" class="form-control mb-2">
                <label>Địa chỉ:</label>
                <input v-model="selectedPublisher.DiaChi" type="text" class="form-control mb-2">
                <button class="btn btn-success me-2" @click="updatePublisher">Lưu</button>
                <button class="btn btn-secondary" @click="showEditForm = false">Hủy</button>
            </div>
        </div>

        <!-- Form thêm mới -->
        <div v-if="showAddForm" class="edit-form">
            <div class="form-container">
                <h3>Thêm Nhà Xuất Bản Mới</h3>
                <label>Mã nhà xuất bản:</label>
                <input v-model="newPublisher.MaNXB" type="text" class="form-control mb-2">
                <label>Tên:</label>
                <input v-model="newPublisher.TenNXB" type="text" class="form-control mb-2">
                <label>Địa chỉ:</label>
                <input v-model="newPublisher.DiaChi" type="text" class="form-control mb-2">
                <button class="btn btn-success me-2" @click="addPublisher">Thêm</button>
                <button class="btn btn-secondary" @click="showAddForm = false">Hủy</button>
            </div>
        </div>

        <!-- Thông báo đăng nhập -->
        <div v-if="showLoginAlert" class="login-alert">
            <div class="alert-container">
                <h3 class="text-center mb-3">Thông báo</h3>
                <p class="mb-4">Vui lòng đăng nhập để thực hiện chức năng này!</p>
                <div class="d-flex justify-content-center">
                    <button class="btn btn-primary me-2" @click="redirectToLogin">Đăng nhập</button>
                    <button class="btn btn-secondary" @click="showLoginAlert = false">Đóng</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    name: 'NXB',
    data() {
        return {
            searchQuery: "",
            publishers: [],
            showEditForm: false,
            showAddForm: false,
            showLoginAlert: false,
            selectedPublisher: null,
            newPublisher: { MaNXB: '', TenNXB: '', DiaChi: '' },
            isLoggedIn: false
        };
    },
    computed: {
        filteredPublishers() {
            if (!this.searchQuery) return this.publishers;
            return this.publishers.filter(publisher =>
                publisher.TenNXB.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                publisher.DiaChi.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
        }
    },
    methods: {
        async fetchPublishers() {
            try {
                const response = await axios.get('http://localhost:5000/api/publishers');
                this.publishers = response.data;
            } catch (error) {
                console.error('Lỗi khi lấy danh sách nhà xuất bản:', error);
                alert('Không thể lấy danh sách nhà xuất bản. Vui lòng thử lại sau.');
            }
        },
        checkLoginStatus() {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            this.isLoggedIn = !!token;
            return this.isLoggedIn;
        },
        checkLoginBeforeAdd() {
            if (this.checkLoginStatus()) {
                this.showAddForm = true;
            } else {
                this.showLoginAlert = true;
            }
        },
        checkLoginBeforeEdit(publisher) {
            if (this.checkLoginStatus()) {
                this.openEditForm(publisher);
            } else {
                this.showLoginAlert = true;
            }
        },
        checkLoginBeforeDelete(id) {
            if (this.checkLoginStatus()) {
                this.confirmDelete(id);
            } else {
                this.showLoginAlert = true;
            }
        },
        redirectToLogin() {
            // Lưu URL hiện tại để sau khi đăng nhập có thể quay lại
            sessionStorage.setItem('redirectAfterLogin', this.$route.fullPath);
            this.$router.push('/login');
            this.showLoginAlert = false;
        },
        openEditForm(publisher) {
            this.selectedPublisher = { ...publisher };
            this.showEditForm = true;
        },
        async updatePublisher() {
            try {
                // Gửi request PUT để cập nhật dữ liệu trên MongoDB
                await axios.put(`http://localhost:5000/api/publishers/${this.selectedPublisher._id}`, {
                    TenNXB: this.selectedPublisher.TenNXB,
                    DiaChi: this.selectedPublisher.DiaChi
                });

                // Cập nhật mảng publishers để hiển thị dữ liệu mới mà không cần reload trang
                const index = this.publishers.findIndex(p => p._id === this.selectedPublisher._id);
                if (index !== -1) {
                    this.publishers[index] = { ...this.selectedPublisher };
                }

                alert("Cập nhật thành công!");
                this.showEditForm = false;
            } catch (error) {
                console.error('Lỗi khi cập nhật nhà xuất bản:', error);
                alert('Không thể cập nhật nhà xuất bản. Vui lòng thử lại sau.');
            }
        },
        async confirmDelete(id) {
            const publisher = this.publishers.find(p => p._id === id);
            if (confirm(`Bạn có chắc chắn muốn xóa "${publisher.TenNXB}" không?`)) {
                try {
                    // Gửi request DELETE để xóa dữ liệu trên MongoDB
                    await axios.delete(`http://localhost:5000/api/publishers/${id}`);

                    // Cập nhật mảng publishers để hiển thị dữ liệu mới mà không cần reload trang
                    this.publishers = this.publishers.filter(p => p._id !== id);

                    alert("Xóa thành công!");
                } catch (error) {
                    console.error('Lỗi khi xóa nhà xuất bản:', error);
                    alert('Không thể xóa nhà xuất bản. Vui lòng thử lại sau.');
                }
            }
        },
        async addPublisher() {
            try {
                if (!this.newPublisher.MaNXB || !this.newPublisher.TenNXB || !this.newPublisher.DiaChi) {
                    alert('Vui lòng điền đầy đủ thông tin');
                    return;
                }

                // Gửi request POST
                await axios.post('http://localhost:5000/api/publishers', this.newPublisher);

                alert("Thêm thành công!");

                // Gọi lại API để cập nhật danh sách mới nhất từ server
                await this.fetchPublishers();

                // Reset form và đóng form
                this.newPublisher = { MaNXB: '', TenNXB: '', DiaChi: '' };
                this.showAddForm = false;
            } catch (error) {
                console.error('Lỗi khi thêm nhà xuất bản:', error);
                alert('Không thể thêm nhà xuất bản. Vui lòng thử lại sau.');
            }
        },
        searchPublishers() {
        }
    },
    mounted() {
        this.fetchPublishers();
        this.checkLoginStatus();
    }
};
</script>

<style scoped>
.container {
    max-width: 800px;
    background: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.publisher-logo {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 5px;
}

.list-group-item {
    display: flex;
    align-items: center;
    padding: 15px;
    border-bottom: 1px solid #ddd;
}

.btn-primary {
    background-color: #007bff;
    border-color: #007bff;
}

.btn-danger {
    background-color: #dc3545;
    border-color: #dc3545;
}

.edit-form,
.login-alert {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
    width: 400px;
    z-index: 1000;
}

.form-container h3,
.alert-container h3 {
    text-align: center;
    margin-bottom: 15px;
}

.alert-container {
    padding: 10px;
}
</style>