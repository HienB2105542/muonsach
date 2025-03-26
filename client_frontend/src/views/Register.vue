<template>
    <div class="register-container">
        <h2 class="register-title">Đăng ký tài khoản</h2>
        <div v-if="message" :class="['alert', success ? 'alert-success' : 'alert-error']">
            {{ message }}
        </div>
        <form @submit.prevent="register" class="register-form">
            <div class="form-group">
                <label for="fullname">Họ và tên</label>
                <input id="fullname" v-model="fullname" type="text" placeholder="Nhập họ và tên của bạn" required />
            </div>

            <div class="form-group">
                <label for="email">Email</label>
                <input id="email" v-model="email" type="email" placeholder="Nhập địa chỉ email của bạn" required />
                <span v-if="emailError" class="error-message">{{ emailError }}</span>
            </div>

            <div class="form-group">
                <label for="password">Mật khẩu</label>
                <input id="password" v-model="password" type="password" placeholder="Tạo mật khẩu (ít nhất 8 ký tự)"
                    required />
                <span v-if="passwordError" class="error-message">{{ passwordError }}</span>
            </div>

            <div class="form-group">
                <label for="confirmPassword">Xác nhận mật khẩu</label>
                <input id="confirmPassword" v-model="confirmPassword" type="password"
                    placeholder="Nhập lại mật khẩu của bạn" required />
                <span v-if="confirmPasswordError" class="error-message">{{ confirmPasswordError }}</span>
            </div>

            <div class="form-group checkbox">
                <input id="terms" v-model="acceptTerms" type="checkbox" required />
                <label for="terms">Tôi đồng ý với <a href="#">Điều khoản dịch vụ</a> và <a href="#">Chính sách bảo
                        mật</a></label>
            </div>

            <button type="submit" class="register-button" :disabled="isSubmitting">
                <span v-if="isSubmitting">Đang xử lý...</span>
                <span v-else>Đăng ký</span>
            </button>

            <div class="login-link">
                Đã có tài khoản? <router-link to="/login">Đăng nhập</router-link>
            </div>
        </form>
    </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import authService from '@/services/auth.service';

export default {
    setup() {
        const router = useRouter();
        const fullname = ref('');
        const email = ref('');
        const password = ref('');
        const confirmPassword = ref('');
        const acceptTerms = ref(false);
        const isSubmitting = ref(false);
        const message = ref('');
        const success = ref(false);

        // Validate email
        const emailError = computed(() => {
            if (!email.value) return '';
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email.value) ? '' : 'Email không hợp lệ';
        });

        // Validate password
        const passwordError = computed(() => {
            if (!password.value) return '';
            return password.value.length >= 8 ? '' : 'Mật khẩu phải có ít nhất 8 ký tự';
        });

        // Validate confirm password
        const confirmPasswordError = computed(() => {
            if (!confirmPassword.value) return '';
            return confirmPassword.value === password.value ? '' : 'Mật khẩu xác nhận không khớp';
        });

        const register = async () => {
            // Validate before submit
            if (emailError.value || passwordError.value || confirmPasswordError.value) {
                return;
            }

            if (!acceptTerms.value) {
                message.value = 'Vui lòng đồng ý với điều khoản dịch vụ và chính sách bảo mật';
                success.value = false;
                return;
            }

            try {
                isSubmitting.value = true;
                await authService.register(email.value, password.value, fullname.value);
                message.value = 'Đăng ký thành công! Bạn sẽ được chuyển đến trang đăng nhập.';
                success.value = true;

                // Reset form
                fullname.value = '';
                email.value = '';
                password.value = '';
                confirmPassword.value = '';
                acceptTerms.value = false;

                // Redirect to login page after 2 seconds
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } catch (error) {
                message.value = error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
                success.value = false;
            } finally {
                isSubmitting.value = false;
            }
        };

        return {
            fullname,
            email,
            password,
            confirmPassword,
            acceptTerms,
            isSubmitting,
            message,
            success,
            emailError,
            passwordError,
            confirmPasswordError,
            register
        };
    }
};
</script>

<style scoped>
.register-container {
    max-width: 500px;
    margin: 0 auto;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    background-color: white;
    color: #1a1a1a;
}

.register-title {
    text-align: center;
    margin-bottom: 20px;
    color: #1a1a1a;
    font-weight: 600;
}

.register-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.form-group label {
    font-weight: 500;
    color: #1a1a1a;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="password"] {
    padding: 10px;
    border: 1px solid #cccccc;
    border-radius: 4px;
    font-size: 16px;
    background-color: white;
    color: #1a1a1a;
}

.form-group input[type="text"]:focus,
.form-group input[type="email"]:focus,
.form-group input[type="password"]:focus {
    border-color: #1a1a1a;
    outline: none;
}

.form-group.checkbox {
    flex-direction: row;
    align-items: center;
    gap: 10px;
}

.form-group.checkbox input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
}

.error-message {
    color: #e74c3c;
    font-size: 14px;
    margin-top: 5px;
}

.alert {
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 15px;
}

.alert-success {
    background-color: #f0f0f0;
    color: #1a1a1a;
    border: 1px solid #cccccc;
}

.alert-error {
    background-color: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
}

.register-button {
    padding: 12px;
    background-color: #1a1a1a;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 500;
    transition: background-color 0.3s;
}

.register-button:hover {
    background-color: #333333;
}

.register-button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

.login-link {
    text-align: center;
    margin-top: 15px;
    color: #1a1a1a;
}

.login-link a {
    color: #1a1a1a;
    text-decoration: underline;
    font-weight: 500;
}

.login-link a:hover {
    text-decoration: none;
}
</style>