// profile.js
// Settings, Extended Company Profile (Stage I), Team Roles, i18n Switcher, and Permission Matrix for AIbo MVP Phase 4.5

import { getLanguage, setLanguage, t } from '../i18n.js';
import { showToast } from '../utils.js';

export function renderProfile(container, state, onNavigate) {
  const biz = state.business || {};
  const team = state.team || [];
  let activeLang = getLanguage();

  function updateView() {
    container.innerHTML = `
      <div class="animate-fade-in profile-root" style="display: flex; flex-direction: column; gap: 20px;">
        
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px;">
          
          <!-- Left Column: Business Profile Form (Stage I) -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            
            <!-- 1. Identitas Bisnis -->
            <div class="card">
              <h3 class="card-title">🏢 Identitas & Legalitas Usaha</h3>
              
              <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 14px;">
                <div class="form-group">
                  <label class="form-label">Nama Legal Perusahaan</label>
                  <input type="text" class="form-control" id="settings-legal" value="${biz.legal_name || 'PT Nusa Brew Indonesia'}">
                </div>
                
                <div class="grid-3">
                  <div class="form-group">
                    <label class="form-label">Sektor Industri</label>
                    <input type="text" class="form-control" id="settings-industry" value="${biz.industry || 'Food & Beverage'}" readonly style="background: var(--bg-input);">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Sub Industri Usaha</label>
                    <input type="text" class="form-control" id="settings-sub-industry" value="${biz.sub_industry || 'Specialty Coffee & Roastery'}">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Skala Usaha</label>
                    <select class="form-control" id="settings-scale">
                      <option value="Mikro" ${biz.scale === 'Mikro' ? 'selected' : ''}>Mikro / UMKM (< Rp 1M/th)</option>
                      <option value="Kecil" ${biz.scale === 'Kecil' || !biz.scale ? 'selected' : ''}>Kecil (Rp 1M - 5M/th)</option>
                      <option value="Menengah" ${biz.scale === 'Menengah' ? 'selected' : ''}>Menengah (Rp 5M - 50M/th)</option>
                    </select>
                  </div>
                </div>

                <div class="grid-2">
                  <div class="form-group">
                    <label class="form-label">Jumlah Karyawan / Staf</label>
                    <input type="number" class="form-control" id="settings-employees" value="${biz.employee_count || 24}">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Model Bisnis Utama</label>
                    <select class="form-control" id="settings-model">
                      <option value="B2C" ${biz.business_model === 'B2C' ? 'selected' : ''}>B2C (Penjualan Langsung Ritel Konsumen)</option>
                      <option value="B2B" ${biz.business_model === 'B2B' ? 'selected' : ''}>B2B (Grosir / Pasokan Korporasi & Kafe)</option>
                      <option value="Hybrid" ${biz.business_model === 'Hybrid' ? 'selected' : ''}>Hybrid (Kombinasi Ritel & Grosir)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <!-- 2. Kontak & Alamat Operasional -->
            <div class="card">
              <h3 class="card-title">📍 Alamat & Kontak Resmi</h3>
              
              <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 14px;">
                <div class="form-group">
                  <label class="form-label">Alamat Lengkap Kantor Pusat / Outlet Utama</label>
                  <input type="text" class="form-control" id="settings-address" value="${biz.address || 'Jl. Senopati No. 45, Kebayoran Baru'}">
                </div>

                <div class="grid-3">
                  <div class="form-group">
                    <label class="form-label">Kota / Kabupaten</label>
                    <input type="text" class="form-control" id="settings-city" value="${biz.city || 'Jakarta Selatan'}">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Provinsi</label>
                    <input type="text" class="form-control" id="settings-province" value="${biz.province || 'DKI Jakarta'}">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Negara</label>
                    <input type="text" class="form-control" id="settings-country" value="Indonesia" readonly style="background: var(--bg-input);">
                  </div>
                </div>

                <div class="grid-3">
                  <div class="form-group">
                    <label class="form-label">Nomor Telepon / WhatsApp</label>
                    <input type="text" class="form-control" id="settings-phone" value="${biz.phone || '+62 812-3456-7890'}">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Email Bisnis</label>
                    <input type="email" class="form-control" id="settings-email" value="${biz.email || 'halo@nusabrew.id'}">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Website / Toko Online</label>
                    <input type="text" class="form-control" id="settings-website" value="${biz.website || 'https://nusabrew.id'}">
                  </div>
                </div>
              </div>
            </div>

            <!-- 3. Konteks & Karakteristik Usaha -->
            <div class="card">
              <h3 class="card-title">💡 Konteks & Karakteristik Bisnis bagi AIbo</h3>
              
              <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 14px;">
                <div class="form-group">
                  <label class="form-label">Deskripsi Singkat Profil Usaha</label>
                  <textarea class="form-control" id="settings-desc" rows="2">${biz.description || 'Penyedia biji kopi specialty lokal nusantara, minuman espresso bar di outlet fisik, dan paket pasokan biji sangrai B2B untuk hotel & kafe mitra.'}</textarea>
                </div>

                <div class="grid-2">
                  <div class="form-group">
                    <label class="form-label">Lini Produk / Layanan Utama</label>
                    <input type="text" class="form-control" id="settings-products" value="${biz.main_products || 'House Blend 1kg, Single Origin Beans, Ready-to-Drink Coffee'}">
                  </div>
                  <div class="form-group">
                    <label class="form-label">Kanal Penjualan Aktif</label>
                    <input type="text" class="form-control" id="settings-channels" value="${biz.channels || 'Outlet POS Fisik, Website Direct, Tokopedia, Shopee'}">
                  </div>
                </div>

                <div style="display: flex; justify-content: flex-end; margin-top: 6px;">
                  <button class="btn btn-primary" id="btn-save-settings" style="font-weight: 700; padding: 10px 24px;">
                    💾 Simpan Pembaruan Profil
                  </button>
                </div>
              </div>
            </div>

          </div>

          <!-- Right Column: Language Toggle, Team Accounts & Quick Info -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            
            <!-- Language Switcher Card -->
            <div class="card" style="border-left: 4px solid var(--primary);">
              <h3 class="card-title">🌐 Bahasa Antarmuka (i18n)</h3>
              <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 12px;">
                Pilih bahasa pengantar antarmuka sistem AIbo.
              </p>
              
              <div style="display: flex; gap: 10px;">
                <button class="btn ${activeLang === 'id' ? 'btn-primary' : 'btn-secondary'}" id="btn-lang-id" style="flex: 1; padding: 10px; font-weight: 700; font-size: 0.85rem;">
                  🇮🇩 Indonesia
                </button>
                <button class="btn ${activeLang === 'en' ? 'btn-primary' : 'btn-secondary'}" id="btn-lang-en" style="flex: 1; padding: 10px; font-weight: 700; font-size: 0.85rem;">
                  🇬🇧 English
                </button>
              </div>
            </div>

            <!-- Active Team Roles Card -->
            <div class="card">
              <div class="card-title">
                <span>👥 Anggota Tim Terdaftar</span>
                <span class="badge badge-low" style="font-size: 0.65rem;">4 Akun</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px;">
                ${team.map(member => `
                  <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 8px; font-size: 0.85rem;">
                    <div>
                      <strong style="display: block; color: var(--text-primary); font-family: var(--font-display);">${member.name}</strong>
                      <span style="font-size: 0.75rem; color: var(--text-muted);">${member.role} (${member.email})</span>
                    </div>
                    <span class="badge ${member.status === 'active' ? 'badge-low' : 'badge-medium'}" style="font-size: 0.6rem;">
                      ${member.status}
                    </span>
                  </div>
                `).join('')}
              </div>
            </div>

          </div>
        </div>

        <!-- Full Width: Team Permission Matrix -->
        <div class="card">
          <h3 class="card-title">${t('team_permissions', 'Matriks Izin Akses Tim')}</h3>
          <p style="color: var(--text-secondary); font-size: 0.84rem; margin-bottom: 14px;">
            Atur batas kewenangan dan izin modul bagi masing-masing peran dalam bisnis Anda.
          </p>

          <div style="overflow-x: auto;">
            <div class="analytics-table-wrap">
              <div class="analytics-table-header" style="grid-template-columns: 2fr 1fr 1fr 1fr 1fr;">
                <span>Modul / Fitur</span>
                <span>Owner</span>
                <span>Manager</span>
                <span>Finance</span>
                <span>Marketing</span>
              </div>

              <div class="analytics-table-row" style="grid-template-columns: 2fr 1fr 1fr 1fr 1fr;">
                <strong>Dashboard & Health Score</strong>
                <span style="color: var(--success); font-weight: bold;">Full Access</span>
                <span style="color: var(--success); font-weight: bold;">Full Access</span>
                <span style="color: var(--ai-primary);">Lihat Sahaja</span>
                <span style="color: var(--ai-primary);">Lihat Sahaja</span>
              </div>

              <div class="analytics-table-row" style="grid-template-columns: 2fr 1fr 1fr 1fr 1fr;">
                <strong>Analitik (6 Tab Deep-Dive)</strong>
                <span style="color: var(--success); font-weight: bold;">Full Access</span>
                <span style="color: var(--success); font-weight: bold;">Full Access</span>
                <span style="color: var(--success); font-weight: bold;">Full Access</span>
                <span style="color: var(--ai-primary);">Marketing & Sales</span>
              </div>

              <div class="analytics-table-row" style="grid-template-columns: 2fr 1fr 1fr 1fr 1fr;">
                <strong>Decision Center & Eksekusi</strong>
                <span style="color: var(--success); font-weight: bold;">Full Access</span>
                <span style="color: var(--ai-primary);">Eksekusi Tugas</span>
                <span style="color: var(--text-muted);">Tanpa Akses</span>
                <span style="color: var(--ai-primary);">Eksekusi Tugas</span>
              </div>

              <div class="analytics-table-row" style="grid-template-columns: 2fr 1fr 1fr 1fr 1fr;">
                <strong>Data Center & Upload Dataset</strong>
                <span style="color: var(--success); font-weight: bold;">Full Access</span>
                <span style="color: var(--success); font-weight: bold;">Full Access</span>
                <span style="color: var(--ai-primary);">Dataset Keuangan</span>
                <span style="color: var(--text-muted);">Tanpa Akses</span>
              </div>

              <div class="analytics-table-row" style="grid-template-columns: 2fr 1fr 1fr 1fr 1fr;">
                <strong>Pengaturan & Identitas Bisnis</strong>
                <span style="color: var(--success); font-weight: bold;">Full Access</span>
                <span style="color: var(--text-muted);">Tanpa Akses</span>
                <span style="color: var(--text-muted);">Tanpa Akses</span>
                <span style="color: var(--text-muted);">Tanpa Akses</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    const langIdBtn = document.getElementById('btn-lang-id');
    const langEnBtn = document.getElementById('btn-lang-en');

    if (langIdBtn) {
      langIdBtn.addEventListener('click', () => {
        setLanguage('id');
        showToast("Bahasa tampilan diubah ke Bahasa Indonesia", "success");
        onNavigate('profile');
      });
    }

    if (langEnBtn) {
      langEnBtn.addEventListener('click', () => {
        setLanguage('en');
        showToast("Display language changed to English", "success");
        onNavigate('profile');
      });
    }

    const saveBtn = document.getElementById('btn-save-settings');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        biz.legal_name = document.getElementById('settings-legal').value;
        biz.sub_industry = document.getElementById('settings-sub-industry').value;
        biz.scale = document.getElementById('settings-scale').value;
        biz.employee_count = parseInt(document.getElementById('settings-employees').value, 10);
        biz.business_model = document.getElementById('settings-model').value;
        biz.address = document.getElementById('settings-address').value;
        biz.city = document.getElementById('settings-city').value;
        biz.province = document.getElementById('settings-province').value;
        biz.phone = document.getElementById('settings-phone').value;
        biz.email = document.getElementById('settings-email').value;
        biz.website = document.getElementById('settings-website').value;
        biz.description = document.getElementById('settings-desc').value;
        biz.main_products = document.getElementById('settings-products').value;
        biz.channels = document.getElementById('settings-channels').value;

        showToast("Profil dan konteks bisnis berhasil disimpan!", "success");
      });
    }
  }

  updateView();
}
