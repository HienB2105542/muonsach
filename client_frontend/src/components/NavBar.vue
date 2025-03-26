<template>
    <nav class="navbar navbar-expand-lg navbar-dark bg-black">
        <div class="container">
            <router-link to="/" class="navbar-brand">
                <span class="fw-bold">THƯ VIỆN</span>
            </router-link>

            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarMain">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarMain">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item">
                        <router-link to="/" class="nav-link">Trang chủ</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link to="/BookView" class="nav-link">Xem Sách Đã Mượn</router-link>
                    </li>
                </ul>

                <ul class="navbar-nav ms-auto">
                    <template v-if="isLoggedIn">
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button"
                                data-bs-toggle="dropdown">
                                <i class="bi bi-person-circle me-1"></i>
                                {{ user?.fullname }} 
                            </a>
                            <div class="dropdown-menu dropdown-menu-end bg-dark">
                                <router-link to="/profile" class="dropdown-item text-light">
                                    <i class="bi bi-person me-2"></i>Thông tin cá nhân
                                </router-link>
                                <router-link to="/" class="dropdown-item text-light">
                                    <i class="bi bi-heart me-2"></i>Sách yêu thích
                                </router-link>
                                <div class="dropdown-divider"></div>
                                <a href="#" class="dropdown-item text-light" @click.prevent="logout">
                                    <i class="bi bi-box-arrow-right me-2"></i>Đăng xuất
                                </a>
                            </div>
                        </li>
                    </template>
                    <template v-else>
                        <li class="nav-item">
                            <router-link to="/login" class="nav-link">
                                <i class="bi bi-box-arrow-in-right me-1"></i>Đăng nhập
                            </router-link>
                        </li>
                        <li class="nav-item">
                            <router-link to="/register" class="nav-link btn btn-outline-light ms-2 px-3">
                                Đăng ký
                            </router-link>
                        </li>
                    </template>
                </ul>
            </div>
        </div>
    </nav>
</template>

<script>
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

    export default {
        setup() {
            const router = useRouter();
            const store = useStore(); 

            const isLoggedIn = computed(() => store.state.auth.isAuthenticated);
            const user = computed(() => store.state.auth.user);

            onMounted(() => {
                store.dispatch("auth/initializeAuth");
            });


            const logout = () => {
                store.dispatch("auth/logout");
                router.push("/login"); 
            };

            return {
                isLoggedIn,
                user,
                logout,
            };
        },
    }
</script>


<style scoped>
.navbar {
    background-color: #1a1a1a;
    padding: 15px 0;
    color: white;
}

.container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 15px;
}

.navbar-brand a {
    color: white;
    font-size: 1.5rem;
    font-weight: bold;
    text-decoration: none;
}

.navbar-menu {
    display: flex;
    align-items: center;
}

.navbar-item {
    color: white;
    text-decoration: none;
    margin-left: 20px;
}

.navbar-item:hover {
    text-decoration: underline;
}

.welcome {
    margin-right: 15px;
}

.logout-button {
    background: none;
    border: 1px solid white;
    color: white;
    padding: 5px 10px;
    border-radius: 4px;
    margin-left: 15px;
    cursor: pointer;
}

.logout-button:hover {
    background-color: rgba(255, 255, 255, 0.1);
}
</style>