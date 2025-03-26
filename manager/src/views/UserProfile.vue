<template>
    <div class="container mt-4">

        <!-- Main Content -->
        <div class="row mt-4">
            <!-- Sidebar -->
            <aside class="col-md-3">
                <div class="list-group shadow">
                    <h2 class="h5 list-group-item active bg-dark text-white text-center">Trang Cá Nhân</h2>
                    <a href="#" class="list-group-item list-group-item-action">Xem Sách</a>
                    <a href="#" class="list-group-item list-group-item-action">Xem Sách Đã Mượn</a>
                </div>
            </aside>

            <!-- User Info -->
            <main class="col-md-9">
                <div class="card shadow border-0">
                    <div class="card-body text-center">
                        <h2 class="h4 text-dark mt-3">Ong Tố Hiền</h2>
                        <p class="text-muted"><i class="bi bi-geo-alt"></i> Sóc Trăng</p>
                        <p class="text-muted"><i class="bi bi-calendar"></i> Ngày Sinh: 27/9/2024</p>
                        <p class="text-muted"><i class="bi bi-gender-male"></i> Giới Tính: Nữ</p>
                    </div>
                </div>

                <!-- Introduction -->
                <div class="card mt-4 shadow border-0">
                    <div class="card-body">
                        <h3 class="h5 text-dark">Giới Thiệu</h3>
                        <p class="text-secondary">
                            Người dùng trong hệ thống mượn sách trực tuyến là những cá nhân có nhu cầu đọc và mượn sách
                            từ thư viện hoặc hệ thống sách điện tử. Vai trò chính của họ là tìm kiếm, mượn và sử dụng
                            sách
                            một cách tiện lợi và hiệu quả.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    </div>
</template>

<script>
export default {
    name: 'UserProfile',
};
</script>

<!-- CSS Tùy Chỉnh -->
<style scoped>
.container {
    max-width: 1100px;
}

/* Header Background */
.bg-header img {
    max-height: 250px;
    object-fit: cover;
}

/* Avatar */
.profile-img-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: -50px;
}

.profile-img {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    border: 3px solid #fff;
    background: #ddd;
}

/* Card Style */
.card {
    background: #fff;
    border-radius: 8px;
}

/* Sidebar */
.list-group-item-action {
    color: black;
    transition: 0.3s;
}

.list-group-item-action:hover {
    background-color: #f8f9fa;
}
</style>
