// profile.js
// Settings, Extended Company Profile (Stage I), Team Roles, i18n Switcher,
// and Monetization Engine / Subscription & Billing System (Stage L).

import { getLanguage, setLanguage, t } from '../i18n.js';
import { showToast, formatCurrency } from '../utils.js';
import { upgradeSubscription } from '../state.js';

export function renderProfile(container, state, onNavigate) {
  const biz = state.business || {};
  const team = state.team || [];
  let activeTab = 'profile'; // 'profile', 'billing', 'team'
  let billingCycle = 'monthly'; // 'monthly' or 'annual'
  let activeCheckoutModal = null; // null or { planTier: 'pro', planName: 'Pro SME', price: 299000 }
  let selectedPaymentMethod = 'qris'; // 'qris', 'va', 'cc'
  let selectedVaBank = 'BCA';
  let activeLang = getLanguage();

  function updateView() {
    const sub = state.subscription || {
      plan: 'Starter UMKM',
      tier: 'starter',
      billing_cycle: 'monthly',
      renewal_date: '2026-09-01',
      price: 0,
      quota: {
        ai_prompts: { used: 42, max: 100 },
        integrations: { used: 3, max: 5 },
        team_seats: { used: 2, max: 5 }
      }
    };

    container.innerHTML = `
      <div class="animate-fade-in profile-root" style="display: flex; flex-direction: column; gap: 20px;">
        
        <!-- Top Sub Navigation Tabs -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; flex-wrap: wrap; gap: 12px;">
          <div style="display: flex; gap: 8px;">
            <button class="btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'} btn-profile-tab" data-tab="profile" style="padding: 8px 16px; font-size: 0.84rem;">
              🏢 Profil & Identitas Bisnis
            </button>
            <button class="btn ${activeTab === 'billing' ? 'btn-primary' : 'btn-secondary'} btn-profile-tab" data-tab="billing" style="padding: 8px 16px; font-size: 0.84rem;">
              💳 Paket Langganan & Kuota (${sub.plan})
            </button>
            <button class="btn ${activeTab === 'team' ? 'btn-primary' : 'btn-secondary'} btn-profile-tab" data-tab="team" style="padding: 8px 16px; font-size: 0.84rem;">
              👥 Tim & Hak Akses
            </button>
          </div>

          <!-- Language Selector -->
          <div style="display: flex; align-items: center; gap: 6px; background: var(--bg-primary); padding: 4px 8px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
            <span style="font-size: 0.75rem; color: var(--text-muted);">🌐 Bahasa:</span>
            <button class="btn btn-sm ${activeLang === 'id' ? 'btn-primary' : 'btn-secondary'}" id="btn-lang-id" style="padding: 2px 8px; font-size: 0.75rem;">ID</button>
            <button class="btn btn-sm ${activeLang === 'en' ? 'btn-primary' : 'btn-secondary'}" id="btn-lang-en" style="padding: 2px 8px; font-size: 0.75rem;">EN</button>
          </div>
        </div>

        <!-- Main Tab Content Area -->
        ${renderActiveTabContent(biz, team, sub)}

        <!-- Checkout Simulation Modal -->
        ${activeCheckoutModal ? renderCheckoutModal(activeCheckoutModal, billingCycle, selectedPaymentMethod, selectedVaBank) : ''}
      </div>
    `;

    bindEvents(biz, sub);
  }

  function renderActiveTabContent(biz, team, sub) {
    if (activeTab === 'billing') {
      return renderBillingTab(sub);
    } else if (activeTab === 'team') {
      return renderTeamTab(team);
    }
    return renderProfileTab(biz);
  }

  function renderProfileTab(biz) {
    return `
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
    `;
  }

  function renderBillingTab(sub) {
    const isPro = sub.tier === 'pro';
    const isEnterprise = sub.tier === 'enterprise';
    const q = sub.quota || { ai_prompts: { used: 42, max: 100 }, integrations: { used: 3, max: 5 }, team_seats: { used: 2, max: 5 } };

    return `
      <div style="display: flex; flex-direction: column; gap: 20px;">
        
        <!-- Active Subscription & Quota Usage Overview -->
        <div class="card" style="border-left: 4px solid var(--ai-primary); background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, var(--bg-card) 100%);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; margin-bottom: 16px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--text-primary);">Paket Aktif: ${sub.plan}</h3>
                <span class="badge ${sub.tier === 'starter' ? 'badge-medium' : 'badge-low'}">
                  ${sub.tier === 'starter' ? 'Free Plan' : 'Langganan Aktif'}
                </span>
              </div>
              <span style="font-size: 0.78rem; color: var(--text-muted);">
                Siklus: <strong>${sub.billing_cycle === 'annual' ? 'Tahunan (Hemat 20%)' : 'Bulanan'}</strong> • Pembaruan: <strong>${sub.renewal_date || '01 September 2026'}</strong>
              </span>
            </div>
            ${sub.tier === 'starter' ? `
              <button class="btn btn-primary" id="btn-quick-upgrade-pro" style="font-weight: 700; padding: 8px 16px; font-size: 0.85rem;">
                🚀 Upgrade ke Pro SME Sekarang
              </button>
            ` : `
              <span class="badge badge-low" style="font-size: 0.75rem; padding: 6px 12px;">✓ Akses Fitur Lengkap Terbuka</span>
            `}
          </div>

          <!-- Quota Progress Bars -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; padding-top: 14px; border-top: 1px solid var(--border-color);">
            
            <!-- AI Prompts Quota -->
            <div style="background: var(--bg-primary); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 6px;">
                <span>🤖 AI Business Copilot</span>
                <strong>${q.ai_prompts.used} / ${q.ai_prompts.max} Prompt</strong>
              </div>
              <div style="width: 100%; height: 6px; background: var(--border-color); border-radius: 3px; overflow: hidden;">
                <div style="width: ${(q.ai_prompts.used / q.ai_prompts.max) * 100}%; height: 100%; background: var(--ai-primary);"></div>
              </div>
              <span style="font-size: 0.7rem; color: var(--text-muted); margin-top: 4px; display: block;">Reset kuota pada 01 Sep 2026</span>
            </div>

            <!-- Integrations Quota -->
            <div style="background: var(--bg-primary); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 6px;">
                <span>📁 Integrasi Platform Data</span>
                <strong>${q.integrations.used} / ${q.integrations.max} Sumber</strong>
              </div>
              <div style="width: 100%; height: 6px; background: var(--border-color); border-radius: 3px; overflow: hidden;">
                <div style="width: ${(q.integrations.used / q.integrations.max) * 100}%; height: 100%; background: var(--primary);"></div>
              </div>
              <span style="font-size: 0.7rem; color: var(--text-muted); margin-top: 4px; display: block;">POS, Tokopedia, TikTok Ads</span>
            </div>

            <!-- Team Seats Quota -->
            <div style="background: var(--bg-primary); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
              <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 6px;">
                <span>👥 Kursi Anggota Tim</span>
                <strong>${q.team_seats.used} / ${q.team_seats.max} Akun</strong>
              </div>
              <div style="width: 100%; height: 6px; background: var(--border-color); border-radius: 3px; overflow: hidden;">
                <div style="width: ${(q.team_seats.used / q.team_seats.max) * 100}%; height: 100%; background: var(--success);"></div>
              </div>
              <span style="font-size: 0.7rem; color: var(--text-muted); margin-top: 4px; display: block;">Owner & Manager aktif</span>
            </div>

          </div>
        </div>

        <!-- Pricing Tiers & Billing Toggle -->
        <div class="card" style="padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h3 style="font-size: 1.25rem; font-weight: 800; font-family: var(--font-heading); margin-bottom: 6px;">
              Pilih Paket Langganan Pertumbuhan Bisnis Anda
            </h3>
            <p style="font-size: 0.85rem; color: var(--text-secondary); max-width: 540px; margin: 0 auto 16px auto;">
              Buka seluruh potensi AI Decision Intelligence, analisis 6-tab mendalam, dan otomasi persetujuan tim tanpa batas.
            </p>

            <!-- Billing Cycle Toggle Switch -->
            <div style="display: inline-flex; align-items: center; gap: 8px; background: var(--bg-primary); padding: 4px 8px; border-radius: 20px; border: 1px solid var(--border-color);">
              <button class="btn btn-sm ${billingCycle === 'monthly' ? 'btn-primary' : 'btn-secondary'} btn-cycle-toggle" data-cycle="monthly" style="border-radius: 16px; padding: 4px 14px; font-size: 0.78rem;">
                Bulanan
              </button>
              <button class="btn btn-sm ${billingCycle === 'annual' ? 'btn-primary' : 'btn-secondary'} btn-cycle-toggle" data-cycle="annual" style="border-radius: 16px; padding: 4px 14px; font-size: 0.78rem;">
                Tahunan <span class="badge badge-low" style="font-size: 0.62rem; margin-left: 4px;">Hemat 20%</span>
              </button>
            </div>
          </div>

          <!-- 3-Tier Grid -->
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
            
            <!-- Tier 1: Starter -->
            <div class="card" style="background: var(--bg-primary); border: 1px solid var(--border-color); display: flex; flex-direction: column; justify-content: space-between; padding: 18px;">
              <div>
                <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 4px;">Starter UMKM</h4>
                <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 12px;">Cocok untuk bisnis rintisan & tahap awal.</p>
                <div style="margin-bottom: 14px;">
                  <span style="font-size: 1.5rem; font-weight: 800; color: var(--text-primary);">Rp 0</span>
                  <span style="font-size: 0.75rem; color: var(--text-muted);">/ bulan</span>
                </div>
                <ul style="padding-left: 16px; font-size: 0.78rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 6px; margin: 0;">
                  <li>Dashboard Eksekutif Dasar</li>
                  <li>100 AI Copilot Prompts/bln</li>
                  <li>Maks. 5 Integrasi Platform</li>
                  <li>Maks. 5 Anggota Tim</li>
                  <li>Laporan Ekspor CSV</li>
                </ul>
              </div>

              <div style="margin-top: 18px;">
                ${sub.tier === 'starter' ? `
                  <button class="btn btn-secondary" disabled style="width: 100%; font-size: 0.78rem; opacity: 0.7;">✓ Paket Saat Ini</button>
                ` : `
                  <button class="btn btn-secondary" style="width: 100%; font-size: 0.78rem;">Pilih Starter</button>
                `}
              </div>
            </div>

            <!-- Tier 2: Pro SME (Popular) -->
            <div class="card" style="background: var(--bg-card); border: 2px solid var(--ai-primary); display: flex; flex-direction: column; justify-content: space-between; padding: 18px; position: relative; box-shadow: 0 4px 20px rgba(99, 102, 241, 0.15);">
              <span class="badge" style="position: absolute; top: -10px; right: 18px; background: var(--ai-primary); color: white; font-size: 0.65rem; font-weight: 700; padding: 2px 8px;">
                PALING POPULER ⭐
              </span>
              <div>
                <h4 style="font-size: 1.05rem; font-weight: 700; color: var(--ai-primary); margin-bottom: 4px;">Pro SME</h4>
                <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 12px;">Untuk bisnis berkembang & butuh multi-opsi.</p>
                <div style="margin-bottom: 14px;">
                  <span style="font-size: 1.5rem; font-weight: 800; color: var(--text-primary);">
                    ${billingCycle === 'annual' ? 'Rp 239.200' : 'Rp 299.000'}
                  </span>
                  <span style="font-size: 0.75rem; color: var(--text-muted);">/ bulan</span>
                  ${billingCycle === 'annual' ? '<span style="display: block; font-size: 0.68rem; color: var(--success); font-weight: 600;">Ditagih Rp 2.870.400 / tahun</span>' : ''}
                </div>
                <ul style="padding-left: 16px; font-size: 0.78rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 6px; margin: 0;">
                  <li><strong>Semua Fitur Starter</strong></li>
                  <li><strong>6-Tab Deep Analytics Lengkap</strong></li>
                  <li><strong>Decision Center Multi-Choice Opsi</strong></li>
                  <li><strong>Alur Kerja Persetujuan Tim (Approvals)</strong></li>
                  <li>500 AI Prompts/bln</li>
                  <li>20 Integrasi Platform</li>
                  <li>15 Anggota Tim</li>
                  <li>Ekspor Dokumen Resmi PDF & XLSX</li>
                </ul>
              </div>

              <div style="margin-top: 18px;">
                ${isPro ? `
                  <button class="btn btn-secondary" disabled style="width: 100%; font-size: 0.78rem; border-color: var(--success); color: var(--success); font-weight: 700;">✓ Paket Aktif</button>
                ` : `
                  <button class="btn btn-primary btn-open-checkout" data-tier="pro" data-name="Pro SME" data-price="${billingCycle === 'annual' ? 2870400 : 299000}" style="width: 100%; font-size: 0.78rem; font-weight: 700;">
                    🚀 Upgrade ke Pro SME
                  </button>
                `}
              </div>
            </div>

            <!-- Tier 3: Enterprise -->
            <div class="card" style="background: var(--bg-primary); border: 1px solid var(--border-color); display: flex; flex-direction: column; justify-content: space-between; padding: 18px;">
              <div>
                <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 4px;">Enterprise</h4>
                <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 12px;">Untuk jaringan multi-cabang & kustomisasi.</p>
                <div style="margin-bottom: 14px;">
                  <span style="font-size: 1.5rem; font-weight: 800; color: var(--text-primary);">
                    ${billingCycle === 'annual' ? 'Rp 719.200' : 'Rp 899.000'}
                  </span>
                  <span style="font-size: 0.75rem; color: var(--text-muted);">/ bulan</span>
                  ${billingCycle === 'annual' ? '<span style="display: block; font-size: 0.68rem; color: var(--success); font-weight: 600;">Ditagih Rp 8.630.400 / tahun</span>' : ''}
                </div>
                <ul style="padding-left: 16px; font-size: 0.78rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 6px; margin: 0;">
                  <li><strong>Semua Fitur Pro SME</strong></li>
                  <li>Multi-Outlet / Multi-Cabang</li>
                  <li>2.000 AI Prompts/bln</li>
                  <li>Integrasi Unlimited Platform</li>
                  <li>50 Anggota Tim + Role Kustom</li>
                  <li>Dedicated Account Manager & SLA 24/7</li>
                </ul>
              </div>

              <div style="margin-top: 18px;">
                ${isEnterprise ? `
                  <button class="btn btn-secondary" disabled style="width: 100%; font-size: 0.78rem; border-color: var(--success); color: var(--success); font-weight: 700;">✓ Paket Aktif</button>
                ` : `
                  <button class="btn btn-secondary btn-open-checkout" data-tier="enterprise" data-name="Enterprise" data-price="${billingCycle === 'annual' ? 8630400 : 899000}" style="width: 100%; font-size: 0.78rem; font-weight: 700;">
                    Hubungi / Upgrade Enterprise
                  </button>
                `}
              </div>
            </div>

          </div>
        </div>

      </div>
    `;
  }

  function renderTeamTab(team) {
    return `
      <div style="display: flex; flex-direction: column; gap: 20px;">
        
        <!-- Active Team Roles Card -->
        <div class="card">
          <div class="card-title">
            <span>👥 Anggota Tim Terdaftar</span>
            <span class="badge badge-low" style="font-size: 0.65rem;">4 Akun Aktif</span>
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
                <span style="color: var(--ai-primary);">Ajukan Persetujuan</span>
                <span style="color: var(--text-muted);">Tanpa Akses</span>
                <span style="color: var(--ai-primary);">Ajukan Persetujuan</span>
              </div>

              <div class="analytics-table-row" style="grid-template-columns: 2fr 1fr 1fr 1fr 1fr;">
                <strong>Persetujuan Tim (Approvals)</strong>
                <span style="color: var(--success); font-weight: bold;">Approve / Reject</span>
                <span style="color: var(--ai-primary);">Pengaju (Submitter)</span>
                <span style="color: var(--text-muted);">Tanpa Akses</span>
                <span style="color: var(--text-muted);">Tanpa Akses</span>
              </div>

              <div class="analytics-table-row" style="grid-template-columns: 2fr 1fr 1fr 1fr 1fr;">
                <strong>Data Center & Upload Dataset</strong>
                <span style="color: var(--success); font-weight: bold;">Full Access</span>
                <span style="color: var(--success); font-weight: bold;">Full Access</span>
                <span style="color: var(--ai-primary);">Dataset Keuangan</span>
                <span style="color: var(--text-muted);">Tanpa Akses</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    `;
  }

  function renderCheckoutModal(item, cycle, method, vaBank) {
    return `
      <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px;">
        <div class="card animate-fade-in" style="max-width: 520px; width: 100%; max-height: 90vh; overflow-y: auto; border: 1px solid var(--border-color); padding: 24px;">
          
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 16px;">
            <div>
              <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--primary);">Pembayaran Langganan AIbo</h3>
              <span style="font-size: 0.75rem; color: var(--text-muted);">Simulasi Payment Gateway (Midtrans/Xendit Ready)</span>
            </div>
            <button class="btn btn-secondary btn-sm" id="btn-close-checkout-modal">&times;</button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 14px;">
            
            <!-- Order Summary Card -->
            <div style="background: var(--bg-primary); padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
                <span>Paket Langganan:</span>
                <strong>${item.planName} (${cycle.toUpperCase()})</strong>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 6px;">
                <span>Periode:</span>
                <span>${cycle === 'annual' ? '12 Bulan (1 Tahun)' : '1 Bulan'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 1rem; border-top: 1px dashed var(--border-color); padding-top: 8px; margin-top: 6px;">
                <span style="font-weight: 700;">Total Tagihan:</span>
                <strong style="color: var(--primary); font-size: 1.15rem;">${formatCurrency(item.price)}</strong>
              </div>
            </div>

            <!-- Payment Method Selector -->
            <div>
              <label style="font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); display: block; margin-bottom: 8px;">Pilih Metode Pembayaran:</label>
              <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;" id="pay-method-grid">
                <button class="btn btn-sm ${method === 'qris' ? 'btn-primary' : 'btn-secondary'} btn-select-method" data-method="qris" style="padding: 8px 6px; font-size: 0.75rem;">
                  📱 QRIS (Instant)
                </button>
                <button class="btn btn-sm ${method === 'va' ? 'btn-primary' : 'btn-secondary'} btn-select-method" data-method="va" style="padding: 8px 6px; font-size: 0.75rem;">
                  🏦 Virtual Account
                </button>
                <button class="btn btn-sm ${method === 'cc' ? 'btn-primary' : 'btn-secondary'} btn-select-method" data-method="cc" style="padding: 8px 6px; font-size: 0.75rem;">
                  💳 Kartu Kredit
                </button>
              </div>
            </div>

            <!-- Method Detail Render -->
            ${method === 'qris' ? `
              <div style="text-align: center; background: white; color: black; padding: 16px; border-radius: 8px;">
                <span style="font-size: 0.8rem; font-weight: bold; display: block; margin-bottom: 8px;">Scan QRIS via BCA Mobile, GoPay, OVO, atau Dana</span>
                <div style="width: 140px; height: 140px; background: #000; margin: 0 auto; display: flex; align-items: center; justify-content: center; border-radius: 8px; color: white; font-family: monospace; font-size: 0.75rem; text-align: center; padding: 8px;">
                  [ QRIS SIMULASI AIBO PAYMENT ]
                </div>
                <span style="font-size: 0.7rem; color: #64748b; margin-top: 6px; display: block;">NMID: ID102026AIBOPROTO</span>
              </div>
            ` : (method === 'va' ? `
              <div style="background: var(--bg-primary); padding: 14px; border-radius: 6px; font-size: 0.82rem;">
                <div style="display: flex; gap: 6px; margin-bottom: 10px;">
                  <button class="btn btn-sm ${vaBank === 'BCA' ? 'btn-primary' : 'btn-secondary'} btn-bank-select" data-bank="BCA">BCA</button>
                  <button class="btn btn-sm ${vaBank === 'Mandiri' ? 'btn-primary' : 'btn-secondary'} btn-bank-select" data-bank="Mandiri">Mandiri</button>
                  <button class="btn btn-sm ${vaBank === 'BRI' ? 'btn-primary' : 'btn-secondary'} btn-bank-select" data-bank="BRI">BRI</button>
                </div>
                <span style="color: var(--text-muted); font-size: 0.75rem;">Nomor Virtual Account ${vaBank}:</span>
                <strong style="font-size: 1.1rem; color: var(--primary); display: block; letter-spacing: 1px; margin: 4px 0;">8801 2948 2019 3840</strong>
                <span style="font-size: 0.7rem; color: var(--text-muted);">Transfer dapat dilakukan dari m-Banking atau ATM.</span>
              </div>
            ` : `
              <div style="display: flex; flex-direction: column; gap: 8px;">
                <input type="text" class="form-control" placeholder="Nomor Kartu (4000 1234 5678 9010)" value="4000 1234 5678 9010" style="font-size: 0.82rem;">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                  <input type="text" class="form-control" placeholder="MM/YY" value="08/28" style="font-size: 0.82rem;">
                  <input type="password" class="form-control" placeholder="CVV" value="123" style="font-size: 0.82rem;">
                </div>
              </div>
            `)}

            <button class="btn btn-primary" id="btn-complete-sim-payment" style="width: 100%; font-weight: 700; padding: 12px; margin-top: 6px;">
              ✓ Selesaikan Pembayaran Simulasi (${formatCurrency(item.price)})
            </button>
          </div>
        </div>
      </div>
    `;
  }

  function bindEvents(biz, sub) {
    // Tab switching
    const tabButtons = document.querySelectorAll('.btn-profile-tab');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.dataset.tab;
        updateView();
      });
    });

    // Language buttons
    const langIdBtn = document.getElementById('btn-lang-id');
    const langEnBtn = document.getElementById('btn-lang-en');

    if (langIdBtn) {
      langIdBtn.addEventListener('click', () => {
        setLanguage('id');
        showToast("Bahasa tampilan diubah ke Bahasa Indonesia", "success");
        activeLang = 'id';
        updateView();
      });
    }

    if (langEnBtn) {
      langEnBtn.addEventListener('click', () => {
        setLanguage('en');
        showToast("Display language changed to English", "success");
        activeLang = 'en';
        updateView();
      });
    }

    // Billing Cycle toggle
    const cycleToggles = document.querySelectorAll('.btn-cycle-toggle');
    cycleToggles.forEach(toggle => {
      toggle.addEventListener('click', () => {
        billingCycle = toggle.dataset.cycle;
        updateView();
      });
    });

    // Quick upgrade button in banner
    const quickUpgradeBtn = document.getElementById('btn-quick-upgrade-pro');
    if (quickUpgradeBtn) {
      quickUpgradeBtn.addEventListener('click', () => {
        activeCheckoutModal = {
          planTier: 'pro',
          planName: 'Pro SME',
          price: billingCycle === 'annual' ? 2870400 : 299000
        };
        updateView();
      });
    }

    // Open checkout modal buttons
    const checkoutButtons = document.querySelectorAll('.btn-open-checkout');
    checkoutButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        activeCheckoutModal = {
          planTier: btn.dataset.tier,
          planName: btn.dataset.name,
          price: parseInt(btn.dataset.price, 10)
        };
        updateView();
      });
    });

    // Close checkout modal
    const closeCheckoutBtn = document.getElementById('btn-close-checkout-modal');
    if (closeCheckoutBtn) {
      closeCheckoutBtn.addEventListener('click', () => {
        activeCheckoutModal = null;
        updateView();
      });
    }

    // Payment method select
    const methodBtns = document.querySelectorAll('.btn-select-method');
    methodBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        selectedPaymentMethod = btn.dataset.method;
        updateView();
      });
    });

    // Bank select in VA
    const bankBtns = document.querySelectorAll('.btn-bank-select');
    bankBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        selectedVaBank = btn.dataset.bank;
        updateView();
      });
    });

    // Complete simulated payment
    const completePayBtn = document.getElementById('btn-complete-sim-payment');
    if (completePayBtn && activeCheckoutModal) {
      completePayBtn.addEventListener('click', () => {
        upgradeSubscription(activeCheckoutModal.planTier, billingCycle, selectedPaymentMethod.toUpperCase());
        showToast(`Pembayaran Berhasil! Akun Anda telah ditingkatkan ke ${activeCheckoutModal.planName}.`, 'success');
        activeCheckoutModal = null;
        updateView();
      });
    }

    // Save profile settings
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
