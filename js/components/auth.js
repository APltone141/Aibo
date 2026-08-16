// auth.js
// Authentication component for AIbo MVP Phase 4.5
// Provides Login, Register with OTP Verification session, Demo Quick Login, Google Login Simulation, and interactive Forgot Password flow.

import { t } from '../i18n.js';
import { showToast } from '../utils.js';

export function renderLogin(container, onNavigate) {
  container.innerHTML = `
    <div class="auth-container animate-fade-in" style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; width: 100%;">
      <div class="card" style="max-width: 440px; width: 100%; padding: 36px; display: flex; flex-direction: column; gap: 24px; background: var(--bg-card-solid);">
        
        <!-- Brand Header -->
        <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 10px;">
          <div class="logo-icon" style="width: 48px; height: 48px; font-size: 1.8rem; border-radius: var(--radius-md);">A</div>
          <h2 style="font-size: 1.6rem; font-weight: 800; background: linear-gradient(135deg, var(--text-primary), var(--text-secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            ${t('login_title', 'Masuk ke AIbo')}
          </h2>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">
            ${t('login_subtitle', 'Platform Decision Intelligence Berbasis AI')}
          </p>
        </div>

        <!-- Demo Quick Login Chips -->
        <div style="background: var(--bg-primary); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 8px;">
          <span style="font-size: 0.75rem; font-weight: 700; color: var(--primary); text-transform: uppercase; letter-spacing: 0.5px;">⚡ Akses Cepat Demo:</span>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-secondary" id="btn-quick-owner" style="flex: 1; padding: 6px 10px; font-size: 0.78rem;">
              👨‍💼 Pemilik (Ardi P.)
            </button>
            <button class="btn btn-secondary" id="btn-quick-manager" style="flex: 1; padding: 6px 10px; font-size: 0.78rem;">
              👩‍💼 Manajer (Nadia S.)
            </button>
          </div>
        </div>

        <!-- Login Form -->
        <form id="login-form" style="display: flex; flex-direction: column; gap: 16px;">
          <div class="form-group">
            <label class="form-label" for="login-email">Email Bisnis</label>
            <input type="email" id="login-email" class="form-control" placeholder="nama@perusahaan.com" value="ardi@nusabrew.com" required>
          </div>

          <div class="form-group">
            <label class="form-label" for="login-password">Kata Sandi</label>
            <input type="password" id="login-password" class="form-control" placeholder="••••••••" value="password123" required>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem;">
            <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; color: var(--text-secondary);">
              <input type="checkbox" id="login-remember" checked> Ingat Saya
            </label>
            <a href="#" id="link-forgot-pass" style="color: var(--primary); text-decoration: none; font-weight: 600;">Lupa Sandi?</a>
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; padding: 12px; font-weight: 700; margin-top: 4px;">
            Masuk ke Dashboard
          </button>
        </form>

        <div style="display: flex; align-items: center; gap: 12px; margin: 4px 0;">
          <div style="flex: 1; height: 1px; background: var(--border-color);"></div>
          <span style="font-size: 0.75rem; color: var(--text-muted);">ATAU</span>
          <div style="flex: 1; height: 1px; background: var(--border-color);"></div>
        </div>

        <!-- Social Login Simulation Button -->
        <button class="btn btn-secondary" id="btn-google-login" style="width: 100%; padding: 10px; font-size: 0.85rem; display: flex; align-items: center; justify-content: center; gap: 8px;">
          <span>🌐</span> Google Login — Prototype Simulation
        </button>

        <div style="text-align: center; font-size: 0.85rem; color: var(--text-secondary);">
          Belum punya akun? <a href="#" id="link-register" style="color: var(--primary); font-weight: 600; text-decoration: none;">Daftar Akun Baru</a>
        </div>

      </div>
    </div>

    <!-- Interactive Forgot Password Modal Container -->
    <div id="forgot-password-modal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(6px); z-index: 10000; align-items: center; justify-content: center; padding: 20px;">
      <div class="card animate-fade-in" style="max-width: 420px; width: 100%; padding: 28px; background: var(--bg-secondary); border: 2px solid var(--primary); box-shadow: var(--shadow-lg);" id="forgot-modal-card">
        <!-- Rendered dynamically by step -->
      </div>
    </div>
  `;

  bindLoginEvents(onNavigate);
}

// -------------------------------------------------------------
// Interactive Multi-Step Register with OTP Verification Flow
// -------------------------------------------------------------
export function renderRegister(container, onNavigate) {
  let currentStep = 1;
  let regDetails = { name: '', business: '', email: '', password: '' };
  const mockRegOtp = '987654';

  function renderRegisterView() {
    container.innerHTML = `
      <div class="auth-container animate-fade-in" style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; width: 100%;">
        <div class="card" style="max-width: 460px; width: 100%; padding: 36px; display: flex; flex-direction: column; gap: 20px; background: var(--bg-card-solid);" id="register-card">
          ${getRegisterStepHtml()}
        </div>
      </div>
    `;
    bindRegisterStepEvents();
  }

  function getRegisterStepHtml() {
    if (currentStep === 1) {
      // Step 1: Registration Form inputs
      return `
        <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px;">
          <div class="logo-icon" style="width: 44px; height: 44px; font-size: 1.6rem; border-radius: var(--radius-md);">A</div>
          <h2 style="font-size: 1.5rem; font-weight: 800;">${t('register_title', 'Daftar Akun Baru')}</h2>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">Mulai gunakan AIbo untuk keputusan bisnis lebih cerdas</p>
        </div>

        <form id="register-form" style="display: flex; flex-direction: column; gap: 14px;">
          <div class="form-group">
            <label class="form-label" for="reg-name">Nama Lengkap</label>
            <input type="text" id="reg-name" class="form-control" placeholder="cth. Ardi Pratama" value="${regDetails.name}" required>
          </div>

          <div class="form-group">
            <label class="form-label" for="reg-business">Nama Bisnis / Usaha</label>
            <input type="text" id="reg-business" class="form-control" placeholder="cth. Nusa Brew Coffee" value="${regDetails.business}" required>
          </div>

          <div class="form-group">
            <label class="form-label" for="reg-email">Email Bisnis</label>
            <input type="email" id="reg-email" class="form-control" placeholder="nama@perusahaan.com" value="${regDetails.email}" required>
          </div>

          <div class="form-group">
            <label class="form-label" for="reg-password">Kata Sandi</label>
            <input type="password" id="reg-password" class="form-control" placeholder="Minimal 6 karakter" value="${regDetails.password}" required minlength="6">
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; padding: 12px; font-weight: 700; margin-top: 6px;">
            Lanjutkan & Kirim Kode Verifikasi
          </button>
        </form>

        <div style="text-align: center; font-size: 0.85rem; color: var(--text-secondary);">
          Sudah punya akun? <a href="#" id="link-login" style="color: var(--primary); font-weight: 600; text-decoration: none;">Masuk di Sini</a>
        </div>
      `;
    } else {
      // Step 2: Verification Code (OTP) Form for Register
      return `
        <div style="text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px;">
          <div class="logo-icon" style="width: 44px; height: 44px; font-size: 1.6rem; border-radius: var(--radius-md);">A</div>
          <h2 style="font-size: 1.5rem; font-weight: 800;">Verifikasi Alamat Email</h2>
          <p style="font-size: 0.85rem; color: var(--text-secondary);">
            Kode OTP pendaftaran dikirim ke: <strong>${regDetails.email}</strong>
          </p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 10px;">
          <div class="form-group">
            <label class="form-label" style="text-align: center; display: block;">Masukkan Kode OTP</label>
            <input type="text" id="reg-otp-input" class="form-control" placeholder="987654" style="text-align: center; font-size: 1.25rem; letter-spacing: 4px; font-weight: 700;" maxlength="6" required>
          </div>

          <div style="background: var(--bg-primary); padding: 10px; border-radius: 4px; font-size: 0.76rem; color: var(--primary); text-align: center; border: 1px solid var(--border-color);">
            💡 Simulasi Demo: Gunakan kode verifikasi <strong>${mockRegOtp}</strong>
          </div>

          <button class="btn btn-primary" id="btn-verify-reg" style="width: 100%; padding: 12px; font-weight: 700;">
            Verifikasi & Lanjutkan ke Onboarding
          </button>
          
          <button class="btn btn-secondary" id="btn-back-reg-1" style="width: 100%; padding: 10px;">
            Kembali & Ubah Detail
          </button>
        </div>
      `;
    }
  }

  function bindRegisterStepEvents() {
    // Form Submission for Step 1
    const form = document.getElementById('register-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        regDetails.name = document.getElementById('reg-name').value;
        regDetails.business = document.getElementById('reg-business').value;
        regDetails.email = document.getElementById('reg-email').value;
        regDetails.password = document.getElementById('reg-password').value;

        showToast("Mengirim kode verifikasi pendaftaran...", "info");
        setTimeout(() => {
          currentStep = 2;
          renderRegisterView();
        }, 800);
      });
    }

    // Back to Login link (Step 1)
    const linkLog = document.getElementById('link-login');
    if (linkLog) {
      linkLog.addEventListener('click', (e) => {
        e.preventDefault();
        onNavigate('login');
      });
    }

    // Step 2 buttons
    const backBtn = document.getElementById('btn-back-reg-1');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        currentStep = 1;
        renderRegisterView();
      });
    }

    const verifyBtn = document.getElementById('btn-verify-reg');
    if (verifyBtn) {
      verifyBtn.addEventListener('click', () => {
        const otpVal = document.getElementById('reg-otp-input').value;
        if (otpVal === mockRegOtp) {
          localStorage.setItem('aibo_auth', JSON.stringify({ loggedIn: true, email: regDetails.email, name: regDetails.name, role: 'Owner' }));
          showToast(`Email Berhasil Diverifikasi! Selamat datang ${regDetails.name}.`, "success");
          onNavigate('onboarding');
        } else {
          showToast("Kode OTP pendaftaran salah! Gunakan 987654.", "danger");
        }
      });
    }
  }

  renderRegisterView();
}

function bindLoginEvents(onNavigate) {
  const form = document.getElementById('login-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      performLogin({ email, name: 'Ardi Pratama', role: 'Owner' }, onNavigate);
    });
  }

  const btnOwner = document.getElementById('btn-quick-owner');
  if (btnOwner) {
    btnOwner.addEventListener('click', () => {
      performLogin({ email: 'ardi@nusabrew.com', name: 'Ardi Pratama', role: 'Owner' }, onNavigate);
    });
  }

  const btnManager = document.getElementById('btn-quick-manager');
  if (btnManager) {
    btnManager.addEventListener('click', () => {
      performLogin({ email: 'nadia@nusabrew.com', name: 'Nadia Sari', role: 'Manager' }, onNavigate);
    });
  }

  const btnGoogle = document.getElementById('btn-google-login');
  if (btnGoogle) {
    btnGoogle.addEventListener('click', () => {
      showToast("Google OAuth — Prototype Simulation Active", "info");
      setTimeout(() => {
        performLogin({ email: 'google.user@nusabrew.com', name: 'Ardi Pratama (Google)', role: 'Owner' }, onNavigate);
      }, 600);
    });
  }

  const linkReg = document.getElementById('link-register');
  if (linkReg) {
    linkReg.addEventListener('click', (e) => {
      e.preventDefault();
      onNavigate('register');
    });
  }

  const linkForgot = document.getElementById('link-forgot-pass');
  if (linkForgot) {
    linkForgot.addEventListener('click', (e) => {
      e.preventDefault();
      openForgotPasswordWorkflow(onNavigate);
    });
  }
}

// -------------------------------------------------------------
// Interactive 3-Step Forgot Password Simulation Flow
// -------------------------------------------------------------
function openForgotPasswordWorkflow(onNavigate) {
  const modal = document.getElementById('forgot-password-modal');
  const card = document.getElementById('forgot-modal-card');
  if (!modal || !card) return;

  modal.style.display = 'flex';

  let currentStep = 1;
  let targetEmail = 'ardi@nusabrew.com';
  const mockOtp = '123456';

  function renderStep() {
    if (currentStep === 1) {
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-bottom: 16px;">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary);">🔒 Lupa Kata Sandi</h3>
          <button id="btn-close-forgot" style="background:none; border:none; font-size:1.3rem; cursor:pointer; color:var(--text-muted);">&times;</button>
        </div>
        <p style="font-size: 0.84rem; color: var(--text-secondary); line-height: 1.4; margin-bottom: 14px;">
          Masukkan alamat email bisnis terdaftar Anda. AIbo akan mengirimkan kode verifikasi atur ulang sandi.
        </p>
        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label">Email Bisnis</label>
          <input type="email" id="forgot-email-input" class="form-control" value="${targetEmail}" placeholder="nama@perusahaan.com" required>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 8px;">
          <button class="btn btn-secondary btn-sm" id="btn-back-to-login">Batal</button>
          <button class="btn btn-primary btn-sm" id="btn-submit-forgot-1">Kirim Kode</button>
        </div>
      `;
    } else if (currentStep === 2) {
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-bottom: 16px;">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary);">🔑 Verifikasi Kode Keamanan</h3>
          <button id="btn-close-forgot" style="background:none; border:none; font-size:1.3rem; cursor:pointer; color:var(--text-muted);">&times;</button>
        </div>
        <p style="font-size: 0.84rem; color: var(--text-secondary); line-height: 1.4; margin-bottom: 14px;">
          Kode keamanan 6-digit dikirim ke <strong>${targetEmail}</strong>.
        </p>
        <div class="form-group" style="margin-bottom: 10px;">
          <label class="form-label">Kode Verifikasi (OTP)</label>
          <input type="text" id="forgot-otp-input" class="form-control" placeholder="123456" style="text-align: center; font-size: 1.25rem; letter-spacing: 4px; font-weight: 700;" maxlength="6" required>
        </div>
        <div style="background: var(--bg-primary); padding: 8px 12px; border-radius: 4px; font-size: 0.76rem; color: var(--primary); margin-bottom: 14px; text-align: center;">
          💡 Simulasi Demo: Masukkan kode keamanan <strong>${mockOtp}</strong>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 8px;">
          <button class="btn btn-secondary btn-sm" id="btn-back-forgot-step">Kembali</button>
          <button class="btn btn-primary btn-sm" id="btn-submit-forgot-2">Verifikasi</button>
        </div>
      `;
    } else if (currentStep === 3) {
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-bottom: 16px;">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary);">🔄 Atur Ulang Sandi</h3>
          <button id="btn-close-forgot" style="background:none; border:none; font-size:1.3rem; cursor:pointer; color:var(--text-muted);">&times;</button>
        </div>
        <p style="font-size: 0.84rem; color: var(--text-secondary); line-height: 1.4; margin-bottom: 14px;">
          Verifikasi berhasil. Tentukan kata sandi baru untuk akun bisnis Anda.
        </p>
        <div class="form-group" style="margin-bottom: 12px;">
          <label class="form-label">Kata Sandi Baru</label>
          <input type="password" id="forgot-new-pass" class="form-control" placeholder="Minimal 8 karakter" required>
        </div>
        <div class="form-group" style="margin-bottom: 16px;">
          <label class="form-label">Konfirmasi Sandi Baru</label>
          <input type="password" id="forgot-confirm-pass" class="form-control" placeholder="Minimal 8 karakter" required>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 8px;">
          <button class="btn btn-primary btn-sm" id="btn-submit-forgot-3" style="width: 100%; font-weight: 700;">Simpan & Masuk Dashboard</button>
        </div>
      `;
    }

    bindStepEvents();
  }

  function bindStepEvents() {
    const closeBtns = card.querySelectorAll('#btn-close-forgot, #btn-back-to-login');
    closeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    });

    const submit1 = card.querySelector('#btn-submit-forgot-1');
    if (submit1) {
      submit1.addEventListener('click', () => {
        const emailVal = card.querySelector('#forgot-email-input').value;
        if (emailVal) {
          targetEmail = emailVal;
          showToast("Mengirim kode keamanan (Simulasi)...", "info");
          setTimeout(() => {
            currentStep = 2;
            renderStep();
          }, 800);
        } else {
          showToast("Harap masukkan email yang valid.", "warning");
        }
      });
    }

    const backStep = card.querySelector('#btn-back-forgot-step');
    if (backStep) {
      backStep.addEventListener('click', () => {
        currentStep = 1;
        renderStep();
      });
    }

    const submit2 = card.querySelector('#btn-submit-forgot-2');
    if (submit2) {
      submit2.addEventListener('click', () => {
        const otpVal = card.querySelector('#forgot-otp-input').value;
        if (otpVal === mockOtp) {
          showToast("Kode terverifikasi!", "success");
          currentStep = 3;
          renderStep();
        } else {
          showToast("Kode OTP salah! Gunakan 123456.", "danger");
        }
      });
    }

    const submit3 = card.querySelector('#btn-submit-forgot-3');
    if (submit3) {
      submit3.addEventListener('click', () => {
        const newPass = card.querySelector('#forgot-new-pass').value;
        const confirmPass = card.querySelector('#forgot-confirm-pass').value;

        if (newPass && newPass.length >= 6) {
          if (newPass === confirmPass) {
            showToast("Kata sandi berhasil diperbarui!", "success");
            modal.style.display = 'none';
            performLogin({ email: targetEmail, name: 'Ardi Pratama', role: 'Owner' }, onNavigate);
          } else {
            showToast("Konfirmasi kata sandi tidak cocok.", "warning");
          }
        } else {
          showToast("Kata sandi baru minimal 6 karakter.", "warning");
        }
      });
    }
  }

  renderStep();
}

function performLogin(userData, onNavigate) {
  localStorage.setItem('aibo_auth', JSON.stringify({ loggedIn: true, ...userData }));
  showToast(`Selamat Datang Kembali, ${userData.name}!`, "success");
  onNavigate('dashboard');
}

export function logoutUser(onNavigate) {
  localStorage.removeItem('aibo_auth');
  showToast("Anda telah keluar dari aplikasi.", "info");
  onNavigate('login');
}
