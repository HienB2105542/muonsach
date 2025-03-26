<template>
    <div class="login-container">
        <div class="login-card">
            <h2 class="login-title">Đăng nhập</h2>

            <div v-if="errorMessage" class="alert-error">
                {{ errorMessage }}
            </div>

            <form @submit.prevent="login" class="login-form">
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" v-model="email" placeholder="Nhập email của bạn" required
                        :disabled="isLoading">
                </div>

                <div class="form-group">
                    <label for="password">Mật khẩu</label>
                    <div class="password-input">
                        <input :type="showPassword ? 'text' : 'password'" id="password" v-model="password"
                            placeholder="Nhập mật khẩu của bạn" required :disabled="isLoading">
                    </div>
                </div>

                <div class="form-extras">
                    <div class="remember-me">
                        <input type="checkbox" id="rememberMe" v-model="rememberMe" :disabled="isLoading">
                        <label for="rememberMe">Ghi nhớ đăng nhập</label>
                    </div>
                    <a href="/forgot-password" class="forgot-password">Quên mật khẩu?</a>
                </div>

                <button type="submit" class="login-button" :disabled="isLoading">
                    <span v-if="isLoading" class="spinner"></span>
                    {{ isLoading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
                </button>
            </form>

            <div class="register-link">
                <p>Chưa có tài khoản? <a href="/register">Đăng ký ngay</a></p>
            </div>
        </div>
    </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';  // ✅ Import Vuex Store
import authService from '@/services/auth.service';

export default {
    name: 'LoginView',

    setup() {
        const router = useRouter();
        const store = useStore(); // ✅ Khai báo store
        const email = ref('');
        const password = ref('');
        const rememberMe = ref(false);
        const isLoading = ref(false);
        const errorMessage = ref('');
        const showPassword = ref(false);

        const toggleShowPassword = () => {
            showPassword.value = !showPassword.value;
        };

        const validateForm = () => {
            errorMessage.value = '';

            if (!email.value) {
                errorMessage.value = 'Vui lòng nhập email';
                return false;
            }

            if (!password.value) {
                errorMessage.value = 'Vui lòng nhập mật khẩu';
                return false;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.value)) {
                errorMessage.value = 'Email không hợp lệ';
                return false;
            }

            return true;
        };

        const login = async () => {
            if (!validateForm()) return;

            isLoading.value = true;
            errorMessage.value = '';

            try {
                const response = await authService.login(
                    email.value,
                    password.value,
                    rememberMe.value
                );

                // ✅ Dùng store.dispatch thay vì this.$store.dispatch
                store.dispatch("auth/login", {
                    user: response.data.user,
                    token: response.data.token
                });

                // Chuyển hướng người dùng sau khi đăng nhập thành công
                router.push('/');
            } catch (error) {
                console.error('Lỗi đăng nhập:', error);

                if (error.response) {
                    const status = error.response.status;

                    if (status === 401) {
                        errorMessage.value = 'Email hoặc mật khẩu không chính xác';
                    } else if (status === 403) {
                        errorMessage.value = 'Tài khoản của bạn đã bị khóa';
                    } else if (status === 429) {
                        errorMessage.value = 'Quá nhiều lần thử. Vui lòng thử lại sau';
                    } else {
                        errorMessage.value = 'Đăng nhập thất bại. Vui lòng thử lại sau';
                    }
                } else if (error.request) {
                    errorMessage.value = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng';
                } else {
                    errorMessage.value = 'Đã xảy ra lỗi. Vui lòng thử lại sau';
                }
            } finally {
                isLoading.value = false;
            }
        };

        return {
            email,
            password,
            rememberMe,
            isLoading,
            errorMessage,
            showPassword,
            toggleShowPassword,
            login
        };
    }
};
</script>

<style scoped>
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px 20px;
    min-height: 100vh;
}

.login-card {
    width: 100%;
    max-width: 450px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 30px;
}

.login-title {
    color: #1a1a1a;
    text-align: center;
    margin-bottom: 25px;
    font-weight: 600;
}

.login-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group label {
    color: #1a1a1a;
    font-weight: 500;
}

.form-group input {
    padding: 12px;
    border: 1px solid #cccccc;
    border-radius: 4px;
    background-color: white;
    color: #1a1a1a;
    font-size: 16px;
}

.form-group input:focus {
    border-color: #1a1a1a;
    outline: none;
}

.form-group input:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
}

.password-input {
    position: relative;
    display: flex;
}

.password-input input {
    flex: 1;
    border-right: none;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
}

.toggle-password {
    padding: 0 15px;
    background-color: white;
    border: 1px solid #cccccc;
    border-left: none;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    color: #1a1a1a;
    cursor: pointer;
    font-size: 14px;
}

.toggle-password:hover {
    background-color: #f5f5f5;
}

.form-extras {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.remember-me {
    display: flex;
    align-items: center;
    gap: 8px;
}

.remember-me input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
}

.remember-me label {
    color: #1a1a1a;
    font-size: 14px;
}

.forgot-password {
    color: #1a1a1a;
    text-decoration: none;
    font-size: 14px;
}

.forgot-password:hover {
    text-decoration: underline;
}

.login-button {
    padding: 12px;
    background-color: #1a1a1a;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
    position: relative;
}

.login-button:hover {
    background-color: #333333;
}

.login-button:disabled {
    background-color: #666666;
    cursor: not-allowed;
}

.spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 0.8s linear infinite;
    margin-right: 8px;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.alert-error {
    background-color: #f8d7da;
    color: #721c24;
    padding: 12px;
    border-radius: 4px;
    margin-bottom: 20px;
}

.register-link {
    text-align: center;
    margin-top: 25px;
}

.register-link p {
    color: #1a1a1a;
    margin: 0;
}

.register-link a {
    color: #1a1a1a;
    font-weight: 500;
    text-decoration: underline;
}

.register-link a:hover {
    text-decoration: none;
}

/* Responsive adjustments */
@media (max-width: 576px) {
    .login-card {
        padding: 20px;
    }

    .form-extras {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }

    .forgot-password {
        align-self: flex-end;
    }
}
</style>