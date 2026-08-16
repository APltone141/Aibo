// onboarding.js
// Enhanced Onboarding wizard for AIbo MVP Phase 4
// Features: Business Profile, Industry Tooltips, Multi-Goal Customization, Team Invitations, Data Connection Checklist

import { completeOnboarding } from '../state.js';
import { showToast } from '../utils.js';

export function renderOnboarding(container, state, onNavigate) {
  let step = state.onboardingStep || 1;
  const totalSteps = 6;
  
  // Local state for onboarding answers
  const onboardingData = {
    name: 'Nusa Brew Coffee',
    industry: 'Food & Beverage',
    sub_industry: 'Coffee Shop & Roastery',
    business_scale: 'Small Business',
    employee_count: '10 - 25 staf',
    city: 'Jakarta Selatan',
    description: 'Roastery kopi lokal dan kafe retail online & offline',
    role: 'Owner',
    teamMembers: [
      { email: 'nadia@nusabrew.com', role: 'Manager' }
    ],
    selectedGoals: [
      { id: 'goal_001', name: 'Revenue Growth', target: 500000000, deadline: '6', priority: 'High', explanation: 'Tingkatkan total omset bulanan untuk ekspansi cabang.' },
      { id: 'goal_002', name: 'Profit Growth', target: 100000000, deadline: '6', priority: 'High', explanation: 'Pertahankan margin laba bersih di atas 20%.' }
    ],
    dataUploaded: true
  };

  function updateWizardView() {
    container.innerHTML = `
      <div class="onboarding-container animate-fade-in" style="max-width: 680px; margin: 40px auto; padding: 24px;">
        <div class="onboarding-header" style="text-align: center; margin-bottom: 24px;">
          <h2 style="font-size: 1.8rem; font-weight: 800; background: linear-gradient(135deg, var(--text-primary), var(--text-secondary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            Setup Profil Bisnis & Tujuan AIbo
          </h2>
          <p style="color: var(--text-secondary); font-size: 0.88rem; margin-top: 4px;">
            Bantu AIbo memahami kondisi usaha Anda untuk rekomendasi cerdas yang relevan.
          </p>
        </div>
        
        <!-- Progress Stepper -->
        <div class="onboarding-steps" style="display: flex; gap: 8px; margin-bottom: 28px;">
          ${Array.from({ length: totalSteps }, (_, i) => `
            <div class="step-indicator ${i + 1 <= step ? 'active' : ''}" style="flex: 1; height: 6px; border-radius: 3px; background: ${i + 1 <= step ? 'var(--primary)' : 'var(--bg-card-solid)'}; transition: all 0.3s ease;"></div>
          `).join('')}
        </div>
        
        <div class="card" style="padding: 32px; background: var(--bg-card-solid);">
          <div class="wizard-body">
            ${getStepContent()}
          </div>
          
          <div class="wizard-footer" style="display: flex; justify-content: space-between; margin-top: 28px; padding-top: 20px; border-top: 1px solid var(--border-color);">
            ${step > 1 && step < 6 ? `<button class="btn btn-secondary" id="btn-back">← Kembali</button>` : '<div></div>'}
            ${step < 6 ? `
              <button class="btn btn-primary" id="btn-next" style="padding: 10px 24px; font-weight: 700;">
                ${step === 5 ? 'Proses Validation Data' : 'Lanjutkan →'}
              </button>
            ` : `
              <button class="btn btn-ai" id="btn-finish" style="width: 100%; padding: 14px; font-weight: 700; font-size: 1rem;">
                🚀 Masuk ke Dashboard Executive AIbo
              </button>
            `}
          </div>
        </div>
      </div>
    `;
    
    bindEvents();
  }

  function getStepContent() {
    switch (step) {
      case 1:
        return `
          <div style="text-align: center; padding: 20px 0; display: flex; flex-direction: column; gap: 16px; align-items: center;">
            <div style="font-size: 3rem; width: 80px; height: 80px; background: linear-gradient(135deg, var(--primary), var(--ai-primary)); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; box-shadow: var(--shadow-md);">👋</div>
            <h3 style="font-size: 1.5rem; font-weight: 700;">Selamat Datang di AIbo!</h3>
            <p style="color: var(--text-secondary); max-width: 480px; font-size: 0.92rem; line-height: 1.6;">
              AI Business Companion yang membantu Anda memahami <strong>apa yang terjadi</strong>, <strong>mengapa terjadi</strong>, dan <strong>langkah konkret apa yang harus dilakukan</strong> untuk memajukan bisnis Anda.
            </p>
            <div style="background: var(--bg-primary); padding: 14px 20px; border-radius: var(--radius-sm); border-left: 4px solid var(--primary); text-align: left; font-size: 0.85rem; color: var(--text-secondary); margin-top: 8px;">
              💡 <em>Tidak memerlukan keahlian analisis data enterprise. AIbo dirancang khusus untuk pemilik usaha dan manajer operasional.</em>
            </div>
          </div>
        `;
      case 2:
        return `
          <div style="display: flex; flex-direction: column; gap: 20px;">
            <div>
              <h3 style="font-size: 1.3rem; font-weight: 700;">Peran & Undang Anggota Tim</h3>
              <p style="color: var(--text-secondary); font-size: 0.88rem;">Pilih peran utama Anda dan optionally undang staf/manajer ke AIbo.</p>
            </div>

            <div class="form-group">
              <label class="form-label" style="font-weight: 600;">Peran Utama Anda</label>
              <div class="selection-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                <div class="select-card ${onboardingData.role === 'Owner' ? 'selected' : ''}" data-role="Owner" style="padding: 14px; text-align: center; border: 1px solid var(--border-color); border-radius: var(--radius-sm); cursor: pointer;">👨‍💼 Pemilik (Owner)</div>
                <div class="select-card ${onboardingData.role === 'Manager' ? 'selected' : ''}" data-role="Manager" style="padding: 14px; text-align: center; border: 1px solid var(--border-color); border-radius: var(--radius-sm); cursor: pointer;">👩‍💼 Manajer Operasional</div>
                <div class="select-card ${onboardingData.role === 'Finance' ? 'selected' : ''}" data-role="Finance" style="padding: 14px; text-align: center; border: 1px solid var(--border-color); border-radius: var(--radius-sm); cursor: pointer;">📊 Keuangan (Finance)</div>
                <div class="select-card ${onboardingData.role === 'Marketing' ? 'selected' : ''}" data-role="Marketing" style="padding: 14px; text-align: center; border: 1px solid var(--border-color); border-radius: var(--radius-sm); cursor: pointer;">📣 Pemasaran (Marketing)</div>
              </div>
            </div>

            <div class="form-group" style="margin-top: 8px;">
              <label class="form-label" style="font-weight: 600; display: flex; justify-content: space-between;">
                <span>Undang Anggota Tim (Opsional)</span>
                <span style="font-size: 0.75rem; color: var(--text-muted);">Bisa dilewati</span>
              </label>
              <div style="display: flex; gap: 8px;">
                <input type="email" id="invite-email-input" class="form-control" placeholder="email.rekan@perusahaan.com" style="flex: 1;">
                <select id="invite-role-select" class="form-control" style="width: 130px;">
                  <option value="Manager">Manajer</option>
                  <option value="Finance">Finance</option>
                  <option value="Marketing">Marketing</option>
                </select>
                <button type="button" class="btn btn-secondary" id="btn-add-invite">Undang</button>
              </div>
              <div id="invite-list" style="margin-top: 10px; display: flex; flex-direction: column; gap: 6px;">
                ${onboardingData.teamMembers.map((m, idx) => `
                  <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-primary); padding: 8px 12px; border-radius: 6px; font-size: 0.82rem;">
                    <span>📧 ${m.email} (${m.role})</span>
                    <span style="color: var(--danger); cursor: pointer;" onclick="window.removeInvite(${idx})">&times;</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `;
      case 3:
        return `
          <div style="display: flex; flex-direction: column; gap: 18px;">
            <div>
              <h3 style="font-size: 1.3rem; font-weight: 700;">Profil & Identitas Bisnis</h3>
              <p style="color: var(--text-secondary); font-size: 0.88rem;">Informasi dasar tentang bidang dan skala bisnis Anda.</p>
            </div>
            
            <div class="form-group">
              <label class="form-label">Nama Bisnis / Usaha</label>
              <input type="text" class="form-control" id="biz-name" value="${onboardingData.name}">
            </div>
            
            <div class="grid-2">
              <div class="form-group">
                <label class="form-label" style="display: flex; align-items: center; gap: 6px;">
                  Industri Usaha
                  <span title="Kategori bidang usaha membantu AIbo membandingkan pola penjualan Anda dengan standar industri sejenis." style="cursor: help; color: var(--primary);">ⓘ</span>
                </label>
                <select class="form-control" id="biz-industry">
                  <option value="Food & Beverage" ${onboardingData.industry === 'Food & Beverage' ? 'selected' : ''}>Food & Beverage (Kuliner)</option>
                  <option value="Retail" ${onboardingData.industry === 'Retail' ? 'selected' : ''}>Retail & Toko Fisik</option>
                  <option value="Fashion" ${onboardingData.industry === 'Fashion' ? 'selected' : ''}>Fashion & Pakaian</option>
                  <option value="Services" ${onboardingData.industry === 'Services' ? 'selected' : ''}>Jasa / Layanan</option>
                  <option value="Technology" ${onboardingData.industry === 'Technology' ? 'selected' : ''}>Teknologi & Digital</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" style="display: flex; align-items: center; gap: 6px;">
                  Skala Usaha
                  <span title="Mikro (< Rp 300jt/thn), Kecil (< Rp 2.5M/thn), Menengah (> Rp 2.5M/thn)" style="cursor: help; color: var(--primary);">ⓘ</span>
                </label>
                <select class="form-control" id="biz-scale">
                  <option value="Micro Business" ${onboardingData.business_scale === 'Micro Business' ? 'selected' : ''}>Usaha Mikro (UMKM)</option>
                  <option value="Small Business" ${onboardingData.business_scale === 'Small Business' ? 'selected' : ''}>Usaha Kecil (Small Business)</option>
                  <option value="Medium Business" ${onboardingData.business_scale === 'Medium Business' ? 'selected' : ''}>Usaha Menengah (Medium Business)</option>
                </select>
              </div>
            </div>

            <div class="grid-2">
              <div class="form-group">
                <label class="form-label">Jumlah Karyawan / Staf</label>
                <select class="form-control" id="biz-employees">
                  <option value="1 - 5 staf">1 - 5 Orang</option>
                  <option value="6 - 15 staf" selected>6 - 15 Orang</option>
                  <option value="16 - 50 staf">16 - 50 Orang</option>
                  <option value="50+ staf">> 50 Orang</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Kota Operasional Usaha</label>
                <input type="text" class="form-control" id="biz-city" value="${onboardingData.city}">
              </div>
            </div>
          </div>
        `;
      case 4:
        return `
          <div style="display: flex; flex-direction: column; gap: 18px;">
            <div>
              <h3 style="font-size: 1.3rem; font-weight: 700;">Kustomisasi Target & Goal Bisnis</h3>
              <p style="color: var(--text-secondary); font-size: 0.88rem;">Pilih beberapa target usaha yang ingin diprioritaskan oleh rekomendasi AIbo.</p>
            </div>
            
            <!-- Preset Goal Selection List -->
            <div style="display: flex; flex-direction: column; gap: 10px; max-height: 280px; overflow-y: auto; padding-right: 4px;">
              ${renderGoalOption('goal_001', '💰 Revenue Growth', 'Target pertumbuhan total omset penjualan bulanan', 500000000, '6', 'High')}
              ${renderGoalOption('goal_002', '📊 Profit Growth', 'Target meningkatkan laba bersih dan efisiensi biaya', 100000000, '6', 'High')}
              ${renderGoalOption('goal_003', '👥 Customer Growth', 'Target penambahan jumlah pelanggan baru bulanan', 1250, '3', 'Medium')}
              ${renderGoalOption('goal_004', '📣 Marketing ROI', 'Target efisiensi pengembalian iklan minimal 3.0x', 3.5, '3', 'Medium')}
              ${renderGoalOption('goal_005', '📦 Inventory Health', 'Target kesehatan dan ketersediaan stok barang 90%+', 90, '3', 'Low')}
            </div>

            <!-- Custom Goal Trigger -->
            <div style="background: var(--bg-primary); padding: 12px; border-radius: var(--radius-sm); border: 1px dashed var(--border-color); display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 0.85rem; color: var(--text-secondary);">Punya target spesifik lainnya?</span>
              <button type="button" class="btn btn-secondary" id="btn-add-custom-goal" style="padding: 6px 12px; font-size: 0.8rem;">+ Tambah Custom Goal</button>
            </div>
          </div>
        `;
      case 5:
        return `
          <div style="display: flex; flex-direction: column; gap: 18px;">
            <div>
              <h3 style="font-size: 1.3rem; font-weight: 700;">Checklist Integrasi & Data Usaha</h3>
              <p style="color: var(--text-secondary); font-size: 0.88rem;">AIbo mengklasifikasikan kebutuhan data bisnis secara transparan.</p>
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              
              <!-- Essential Data -->
              <div style="background: var(--bg-primary); padding: 12px 16px; border-radius: var(--radius-sm); border-left: 4px solid var(--success);">
                <div style="display: flex; justify-content: space-between; font-size: 0.88rem; font-weight: 700;">
                  <span>🟢 DATA UTAMA (ESSENTIAL)</span>
                  <span style="color: var(--success);">✓ Terhubung (POS / Excel)</span>
                </div>
                <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">
                  Penjualan/Omset, Pelanggan, & Inventoris Produk
                </div>
              </div>

              <!-- Recommended Data -->
              <div style="background: var(--bg-primary); padding: 12px 16px; border-radius: var(--radius-sm); border-left: 4px solid var(--warning);">
                <div style="display: flex; justify-content: space-between; font-size: 0.88rem; font-weight: 700;">
                  <span>🟡 DATA REKOMENDASI (RECOMMENDED)</span>
                  <span style="color: var(--warning);">⚠ Sebagian Terhubung</span>
                </div>
                <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">
                  Biaya Iklan Marketing (Meta/TikTok Ads), Arus Kas Detail
                </div>
              </div>

              <!-- Optional Data -->
              <div style="background: var(--bg-primary); padding: 12px 16px; border-radius: var(--radius-sm); border-left: 4px solid var(--text-muted);">
                <div style="display: flex; justify-content: space-between; font-size: 0.88rem; font-weight: 700;">
                  <span>⚪ DATA OPSIONAL (OPTIONAL)</span>
                  <span style="color: var(--text-muted);">Dapat Ditambahkan Nanti</span>
                </div>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">
                  Data absensi staf, catatan vendor/supplier
                </div>
              </div>

            </div>

            <div style="background: var(--primary-glow); padding: 12px 16px; border-radius: var(--radius-sm); border: 1px solid var(--primary); font-size: 0.83rem; color: var(--text-primary); display: flex; align-items: center; gap: 10px;">
              <span style="font-size: 1.2rem;">💡</span>
              <span><strong>Catatan Penting:</strong> Anda <u>TIDAK harus</u> menyambungkan semua data sekarang untuk mulai menggunakan AIbo Dashboard.</span>
            </div>
          </div>
        `;
      case 6:
        return `
          <div style="display: flex; flex-direction: column; gap: 18px;">
            <div style="text-align: center; padding: 10px 0;">
              <div style="font-size: 2.5rem; color: var(--success); margin-bottom: 8px;">✅</div>
              <h3 style="font-size: 1.4rem; font-weight: 700;">Validasi Profil & Data Selesai!</h3>
              <p style="color: var(--text-secondary); font-size: 0.88rem;">Engine AIbo telah menyelaraskan target usaha Anda dengan data dummy terpasang.</p>
            </div>
            
            <div class="card" style="padding: 18px; background-color: var(--bg-primary);">
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-weight: 700;">
                <span>Skor Kualitas Data (Data Quality Score):</span>
                <span style="color: var(--success);">91% (Sangat Baik)</span>
              </div>
              <div style="font-size: 0.85rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; justify-content: space-between;">
                  <span>Kelengkapan Data Omset & Stok:</span><span>95%</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Integrasi Platform Marketing:</span><span>88%</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span>Target Bisnis Aktif Dikonfigurasi:</span><span>${onboardingData.selectedGoals.length} Target</span>
                </div>
              </div>
            </div>

            <p style="font-size: 0.85rem; border-left: 3px solid var(--ai-primary); padding-left: 12px; color: var(--text-secondary);">
              Dashboard Executive AIbo siap menampilkan Business Health Score 6 dimensi dan AI Daily Brief perdana Anda.
            </p>
          </div>
        `;
    }
  }

  function renderGoalOption(id, title, desc, defaultTarget, defaultDeadline, defaultPriority) {
    const isSelected = onboardingData.selectedGoals.some(g => g.id === id);
    return `
      <div class="card" style="padding: 14px; background: ${isSelected ? 'var(--primary-glow)' : 'var(--bg-primary)'}; border: 1px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'};">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; cursor: pointer;" onclick="window.toggleGoalSelection('${id}', '${title}', ${defaultTarget}, '${defaultDeadline}', '${defaultPriority}')">
          <div>
            <strong style="font-size: 0.92rem;">${title}</strong>
            <p style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">${desc}</p>
          </div>
          <input type="checkbox" ${isSelected ? 'checked' : ''} style="cursor: pointer; width: 18px; height: 18px;">
        </div>
      </div>
    `;
  }

  window.toggleGoalSelection = (id, title, target, deadline, priority) => {
    const existingIdx = onboardingData.selectedGoals.findIndex(g => g.id === id);
    if (existingIdx >= 0) {
      onboardingData.selectedGoals.splice(existingIdx, 1);
    } else {
      onboardingData.selectedGoals.push({ id, name: title, target, deadline, priority });
    }
    updateWizardView();
  };

  window.removeInvite = (index) => {
    onboardingData.teamMembers.splice(index, 1);
    updateWizardView();
  };

  function bindEvents() {
    const nextBtn = document.getElementById('btn-next');
    const backBtn = document.getElementById('btn-back');
    const finishBtn = document.getElementById('btn-finish');
    const roleCards = document.querySelectorAll('[data-role]');

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (step === 3) {
          const bizNameInput = document.getElementById('biz-name');
          const industrySelect = document.getElementById('biz-industry');
          const scaleSelect = document.getElementById('biz-scale');
          const cityInput = document.getElementById('biz-city');
          if (bizNameInput) onboardingData.name = bizNameInput.value;
          if (industrySelect) onboardingData.industry = industrySelect.value;
          if (scaleSelect) onboardingData.business_scale = scaleSelect.value;
          if (cityInput) onboardingData.city = cityInput.value;
        }
        step++;
        state.onboardingStep = step;
        updateWizardView();
      });
    }

    if (backBtn) {
      backBtn.addEventListener('click', () => {
        step--;
        state.onboardingStep = step;
        updateWizardView();
      });
    }

    if (finishBtn) {
      finishBtn.addEventListener('click', () => {
        completeOnboarding(onboardingData);
        showToast("Setup Profil Usaha Berhasil Disimpan!", "success");
        onNavigate('dashboard');
      });
    }

    roleCards.forEach(card => {
      card.addEventListener('click', () => {
        roleCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        onboardingData.role = card.dataset.role;
      });
    });

    const addInviteBtn = document.getElementById('btn-add-invite');
    if (addInviteBtn) {
      addInviteBtn.addEventListener('click', () => {
        const emailInput = document.getElementById('invite-email-input');
        const roleSelect = document.getElementById('invite-role-select');
        if (emailInput && emailInput.value) {
          onboardingData.teamMembers.push({ email: emailInput.value, role: roleSelect.value });
          showToast(`Undangan dikirim ke ${emailInput.value}`, "info");
          updateWizardView();
        }
      });
    }

    const addCustomGoalBtn = document.getElementById('btn-add-custom-goal');
    if (addCustomGoalBtn) {
      addCustomGoalBtn.addEventListener('click', () => {
        const title = prompt("Masukkan Judul Custom Goal (cth. Efisiensi Biaya Operasional):");
        if (title) {
          onboardingData.selectedGoals.push({
            id: `goal_custom_${Date.now()}`,
            name: title,
            target: 100,
            deadline: '3',
            priority: 'Medium'
          });
          showToast(`Custom Goal "${title}" Ditambahkan!`, "success");
          updateWizardView();
        }
      });
    }
  }

  updateWizardView();
}
