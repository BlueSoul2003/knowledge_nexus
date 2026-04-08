import { supabase } from './supabase_client.js';

let isLoginMode = true;

document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.getElementById('auth-form');
    const authToggleBtn = document.getElementById('auth-toggle-btn');
    const authToggleText = document.getElementById('auth-toggle-text');
    const authModalTitle = document.getElementById('auth-modal-title');
    const authSubmitBtn = document.getElementById('auth-submit-btn');

    // Prevent errors if auth modal is not on this page (e.g. dashboard vs index check)
    if (!authForm) return;

    // Toggle between Login and Registration mode
    authToggleBtn.addEventListener('click', () => {
        isLoginMode = !isLoginMode;
        if (isLoginMode) {
            authModalTitle.textContent = '登入你的實驗室';
            authSubmitBtn.textContent = '登入 (Login)';
            authToggleText.textContent = '還沒有帳號？';
            authToggleBtn.textContent = '立即註冊 (Sign Up)';
        } else {
            authModalTitle.textContent = '建立新帳號';
            authSubmitBtn.textContent = '註冊 (Sign Up)';
            authToggleText.textContent = '已經有帳號了？';
            authToggleBtn.textContent = '登入 (Login)';
        }
    });

    // Handle form submit for Authentication
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('auth-email').value;
        const password = document.getElementById('auth-password').value;

        try {
            authSubmitBtn.disabled = true;
            authSubmitBtn.textContent = '請稍候...';

            if (isLoginMode) {
                // Perform Login
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password,
                });
                if (error) throw error;
                console.log('Logged in successfully', data);
                
            } else {
                // Perform Signup
                const { data, error } = await supabase.auth.signUp({
                    email: email,
                    password: password,
                });
                if (error) throw error;
                alert('註冊成功！請檢查你的信箱以驗證帳號（如果需要）。');
            }
            
            // Hide the modal upon success
            document.getElementById('auth-modal').classList.add('hidden');
            authForm.reset();

        } catch (error) {
            alert(error.message || '發生錯誤');
        } finally {
            authSubmitBtn.disabled = false;
            authSubmitBtn.textContent = isLoginMode ? '登入 (Login)' : '註冊 (Sign Up)';
        }
    });

    // Listen to Auth State Changes (Fires on init and whenever auth changes)
    supabase.auth.onAuthStateChange((event, session) => {
        const authContainer = document.getElementById('auth-container');
        if (!authContainer) return;

        if (session) {
            const emailPrefix = session.user.email.split('@')[0];
            // Render User Profile & Links when logged in
            authContainer.innerHTML = `
                <div class="flex items-center gap-4">
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold border border-blue-500/30">
                            ${emailPrefix.substring(0, 2).toUpperCase()}
                        </div>
                        <span class="text-sm font-medium text-slate-300 hidden sm:block">${emailPrefix}</span>
                    </div>
                    <button id="auth-logout-btn" class="text-xs text-slate-400 hover:text-white transition-colors">
                        登出
                    </button>
                    <a href="#dashboard" onclick="document.getElementById('dashboard').classList.remove('hidden')" class="bg-emerald-600 hover:bg-emerald-500 text-white text-sm px-4 py-2 rounded-full font-semibold transition-colors shadow-lg">
                        Creator Dashboard
                    </a>
                </div>
            `;
            
            document.getElementById('auth-logout-btn').addEventListener('click', async () => {
                await supabase.auth.signOut();
            });
            
        } else {
            // Revert back to Login button when logged out
            authContainer.innerHTML = `
                <button onclick="document.getElementById('auth-modal').classList.remove('hidden')" class="bg-blue-600 hover:bg-blue-500 text-white text-sm px-5 py-2 rounded-full font-semibold transition-colors shadow-[0_0_15px_rgba(37,99,235,0.5)]">
                    登入 / 註冊
                </button>
            `;
        }
    });
});
