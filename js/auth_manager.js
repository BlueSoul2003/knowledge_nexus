import { supabase } from './supabase_client.js';

// ─────────────────────────────────────────────
//  Tab switcher (called from inline onclick in HTML)
// ─────────────────────────────────────────────
window.authSwitchTab = function (tab) {
    const loginForm    = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const tabLogin     = document.getElementById('tab-login');
    const tabRegister  = document.getElementById('tab-register');

    if (!loginForm || !registerForm) return;

    if (tab === 'login') {
        loginForm.style.display      = '';
        registerForm.style.display   = 'none';
        tabLogin.style.background    = '#3b82f6';
        tabLogin.style.color         = 'white';
        tabRegister.style.background = 'transparent';
        tabRegister.style.color      = '#9ca3af';
    } else {
        loginForm.style.display      = 'none';
        registerForm.style.display   = '';
        tabLogin.style.background    = 'transparent';
        tabLogin.style.color         = '#9ca3af';
        tabRegister.style.background = '#8b5cf6';
        tabRegister.style.color      = 'white';
    }
};

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────
function showMsg(elementId, msg, isError = true) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
}

function hideMsg(elementId) {
    const el = document.getElementById(elementId);
    if (el) el.style.display = 'none';
}

function setButtonLoading(btnId, loading, defaultText) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    btn.disabled = loading;
    btn.style.opacity = loading ? '0.6' : '1';
    btn.textContent = loading ? 'Please wait…' : defaultText;
}

// ─────────────────────────────────────────────
//  Render nav bar based on auth state
// ─────────────────────────────────────────────
async function renderAuthNav(session) {
    const authContainer = document.getElementById('auth-container');
    if (!authContainer) return;

    if (session) {
        let displayName = session.user.email.split('@')[0];
        try {
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('full_name, exp')
                .eq('id', session.user.id)
                .single();
            if (profile?.full_name) displayName = profile.full_name.split(' ')[0];
        } catch (_) { /* ignore */ }

        const initials = displayName.substring(0, 2).toUpperCase();

        authContainer.innerHTML = `
            <div style="display:flex;align-items:center;gap:0.75rem;">
                <div style="display:flex;align-items:center;gap:0.5rem;">
                    <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#3b82f6,#8b5cf6);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.85rem;color:white;border:2px solid rgba(139,92,246,0.4);">
                        ${initials}
                    </div>
                    <span style="font-size:0.85rem;font-weight:500;color:#cbd5e1;" class="desktop-only">${displayName}</span>
                </div>
                <button id="auth-logout-btn" style="font-size:0.75rem;color:#94a3b8;background:none;border:1px solid #334155;border-radius:9999px;padding:0.3rem 0.8rem;cursor:pointer;transition:all 0.2s;">
                    Sign Out
                </button>
                <a href="#dashboard" onclick="document.getElementById('dashboard').classList.remove('hidden')"
                    style="background:linear-gradient(135deg,#10b981,#059669);color:white;font-size:0.82rem;font-weight:600;padding:0.45rem 1rem;border-radius:9999px;text-decoration:none;box-shadow:0 0 14px rgba(16,185,129,0.35);">
                    Dashboard
                </a>
            </div>
        `;

        document.getElementById('auth-logout-btn')?.addEventListener('click', async () => {
            await supabase.auth.signOut();
        });

    } else {
        authContainer.innerHTML = `
            <button onclick="document.getElementById('auth-modal').classList.remove('hidden')"
                style="background:linear-gradient(135deg,#3b82f6,#2563eb);color:white;font-size:0.85rem;font-weight:600;padding:0.5rem 1.25rem;border-radius:9999px;border:none;cursor:pointer;box-shadow:0 0 15px rgba(37,99,235,0.45);transition:opacity 0.2s;">
                Login / Register
            </button>
        `;
    }
}

// ─────────────────────────────────────────────
//  Write / update profile row in user_profiles
// ─────────────────────────────────────────────
async function upsertProfile(userId, email, extras = {}) {
    // Build payload — strip out null/empty so we don't overwrite existing data
    const payload = { id: userId, email, updated_at: new Date().toISOString(), ...extras };
    Object.keys(payload).forEach(k => {
        if (payload[k] === '' || payload[k] === null || payload[k] === undefined) {
            delete payload[k];
        }
    });

    console.log('[upsertProfile] Writing to user_profiles:', payload);

    const { data, error } = await supabase
        .from('user_profiles')
        .upsert(payload, { onConflict: 'id' })
        .select(); // .select() forces the response to return the upserted row

    if (error) {
        console.error('[upsertProfile] FAILED:', error);
        throw error; // Re-throw so the caller can show it to the user
    }

    console.log('[upsertProfile] Success:', data);
    return data;
}

// ─────────────────────────────────────────────
//  Bootstrap
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    const loginForm    = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (!loginForm && !registerForm) return;

    // ── Login ───────────────────────────────────
    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideMsg('login-error');

        const email    = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            showMsg('login-error', 'Please fill in all fields.');
            return;
        }

        setButtonLoading('login-submit-btn', true, 'Sign In');

        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;

            document.getElementById('auth-modal').classList.add('hidden');
            loginForm.reset();

        } catch (err) {
            console.error('[Login] Error:', err);
            showMsg('login-error', err.message || 'Login failed. Please check your credentials.');
        } finally {
            setButtonLoading('login-submit-btn', false, 'Sign In');
        }
    });

    // ── Register ────────────────────────────────
    registerForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        hideMsg('reg-error');
        hideMsg('reg-success');

        const name     = document.getElementById('reg-name').value.trim();
        const email    = document.getElementById('reg-email').value.trim();
        const password = document.getElementById('reg-password').value;
        const phone    = document.getElementById('reg-phone').value.trim();
        const age      = document.getElementById('reg-age').value;
        const gender   = document.getElementById('reg-gender').value;
        const syllabus = document.getElementById('reg-syllabus').value;

        // Validation
        if (!name || !email || !password) {
            showMsg('reg-error', 'Full Name, Email and Password are required.');
            return;
        }
        if (password.length < 6) {
            showMsg('reg-error', 'Password must be at least 6 characters.');
            return;
        }

        setButtonLoading('reg-submit-btn', true, 'Create Account');
        console.log('[Register] Attempting signup for:', email);

        try {
            // Step 1 — Create auth user
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {              // stored in auth.users.raw_user_meta_data
                        full_name: name,
                        phone:     phone    || null,
                        age:       age      ? parseInt(age) : null,
                        gender:    gender   || null,
                        syllabus:  syllabus || null,
                    }
                }
            });

            if (signUpError) throw signUpError;
            console.log('[Register] Auth signUp result:', data);

            // Step 2 — Write demographics to user_profiles
            // data.user is available immediately even if email confirmation is required
            if (data.user) {
                await upsertProfile(data.user.id, email, {
                    full_name: name,
                    phone:     phone    || null,
                    age:       age      ? parseInt(age) : null,
                    gender:    gender   || null,
                    syllabus:  syllabus || null,
                    exp:       0,
                    role:      'user',
                });
            } else {
                // This happens when email confirmation is disabled but the user already exists
                console.warn('[Register] No user object in signUp response — user may already exist.');
                showMsg('reg-error', 'This email may already be registered. Try logging in instead.');
                return;
            }

            // Step 3 — Show success
            showMsg('reg-success',
                '✅ Account created! ' +
                (data.session ? 'You are now logged in.' : 'Please check your email to confirm, then log in.')
            );
            registerForm.reset();

            // Auto-switch to Login tab after 2.5s
            setTimeout(() => window.authSwitchTab('login'), 2500);

        } catch (err) {
            console.error('[Register] Error:', err);
            showMsg('reg-error', err.message || 'Registration failed. Please try again.');
        } finally {
            setButtonLoading('reg-submit-btn', false, 'Create Account');
        }
    });

    // ── Auth state listener ─────────────────────
    // Fires on page load if a session exists in localStorage (remembered login)
    supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('[AuthState]', event, session?.user?.email ?? 'no user');
        await renderAuthNav(session);

        // Update EXP counter in dashboard
        if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
            try {
                const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('exp')
                    .eq('id', session.user.id)
                    .single();
                const expEl = document.getElementById('user-exp');
                if (expEl && profile) expEl.textContent = profile.exp ?? 0;
            } catch (_) { /* ignore */ }
        }
    });
});
