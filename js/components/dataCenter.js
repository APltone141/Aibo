// dataCenter.js
// Data Center for AIbo MVP Phase 4.5
// Features: Data Guidance System (Stage D), Recommended Data Intelligence (Stage E), Missing Data Guidance (Stage F),
// Platform Sync Simulation, File Upload Wizard, and Data Quality Scorecard.

import { formatPercent, formatNumber, showToast } from '../utils.js';

export function renderDataCenter(container, state, onNavigate) {
  const dataQuality = state.data_quality || { overall_score: 91, completeness: 94, accuracy: 92, consistency: 89, freshness: 88, issues: [] };
  const integrations = state.integrations || [];

  let isUploading = false;
  let uploadProgress = 0;
  let reminderSchedule = localStorage.getItem('aibo_data_reminder') || 'weekly';

  // Dataset Guidance Catalog definitions (Stage D & Classification)
  const datasetGuidance = [
    {
      id: 'sales',
      name: 'Data Penjualan & Transaksi (POS / Kasir)',
      tier: 'ESSENTIAL',
      tierColor: 'var(--danger)',
      tierBadge: 'badge-high',
      status: 'connected',
      source: 'Moka POS (Connected)',
      what: 'Rekaman struk kasir, jumlah pesanan, item terjual, metode bayar, dan total omzet.',
      why: 'Membantu AIbo menghitung Revenue, Omzet harian, AOV, dan tren pertumbuhan bisnis.',
      analyzes: ['Tren omzet & penjualan harian/bulanan', 'Produk terlaris vs kurang laku', 'Rata-rata nilai belanja (AOV)', 'Jam sibuk transaksi'],
      missingImpact: 'AIbo tidak dapat menghitung kesehatan omzet dan laba dasar usaha.',
      connected: true
    },
    {
      id: 'inventory',
      name: 'Data Stok & Persediaan Produk',
      tier: 'ESSENTIAL',
      tierColor: 'var(--danger)',
      tierBadge: 'badge-high',
      status: 'connected',
      source: 'Jurnal Inventory (Connected)',
      what: 'Jumlah stok bahan baku (biji kopi, susu, sirup) dan barang jadi di gudang/outlet.',
      why: 'Mendeteksi risiko kehabisan stok (stockout) atau barang mengendap (overstock).',
      analyzes: ['Peringatan stok menipis (Reorder Point)', 'Deteksi barang menumpuk / overstock', 'Estimasi kebutuhan belanja bahan baku'],
      missingImpact: 'Rekomendasi pemesanan ulang bahan baku otomatis tidak dapat dibuat.',
      connected: true
    },
    {
      id: 'customers',
      name: 'Data Pelanggan & Keanggotaan (CRM)',
      tier: 'RECOMMENDED',
      tierColor: 'var(--warning)',
      tierBadge: 'badge-medium',
      status: 'connected',
      source: 'Loyalty App / Kontak (Connected)',
      what: 'Riwayat nomor kontak pelanggan, frekuensi kunjungan, dan poin reward.',
      why: 'Memetakan loyalitas pelanggan lama vs pelanggan baru.',
      analyzes: ['Tingkat retensi pelanggan (Customer Retention)', 'Segmen pelanggan setia vs berisiko churn', 'Frekuensi repeat order'],
      missingImpact: 'Analisis segmen pelanggan hanya bersifat agregat tanpa profil detail.',
      connected: true
    },
    {
      id: 'marketing',
      name: 'Data Kampanye & Iklan Pemasaran',
      tier: 'RECOMMENDED',
      tierColor: 'var(--warning)',
      tierBadge: 'badge-medium',
      status: 'needs_attention',
      source: 'TikTok Ads / Meta Ads (Tersambung Sebagian)',
      what: 'Biaya iklan per channel (Instagram, TikTok, Google) dan jumlah klik/leads.',
      why: 'Mengukur efektivitas setiap rupiah yang Anda keluarkan untuk promosi.',
      analyzes: ['Marketing ROI (Return on Investment)', 'Biaya per pelanggan baru (CPA)', 'Rekomendasi alokasi anggaran iklan terbaik'],
      missingImpact: 'AIbo tidak dapat memberikan saran optimalisasi budget promosi secara spesifik.',
      connected: false
    },
    {
      id: 'operational',
      name: 'Data Biaya Operasional & Karyawan',
      tier: 'OPTIONAL',
      tierColor: 'var(--text-muted)',
      tierBadge: 'badge-low',
      status: 'manual',
      source: 'File Excel Jurnal (Manual)',
      what: 'Biaya sewa ruko, listrik, gaji staf, dan biaya tak terduga.',
      why: 'Memperdalam kalkulasi Net Profit (Laba Bersih) murni.',
      analyzes: ['Rasio beban operasional terhadap omzet', 'Margin laba bersih riil per outlet'],
      missingImpact: 'Perhitungan laba menggunakan estimasi persentase standar industri.',
      connected: true
    }
  ];

  function updateView() {
    container.innerHTML = `
      <div class="animate-fade-in data-center-root" style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px;">
        
        <!-- Left Column: Guidance, Upload Center & Recommended Next Data -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          
          <!-- Stage F: Reassuring Missing Data Guidance Banner -->
          <div class="card" style="border-left: 4px solid var(--ai-primary); background: var(--bg-card-solid); padding: 18px 20px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px;">
              <div style="flex: 1; min-width: 280px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                  <span style="font-size: 1.2rem;">💡</span>
                  <strong style="font-size: 0.98rem; color: var(--text-primary); font-family: var(--font-display);">
                    Status Kesiapan Data: Analisis Anda Berjalan Optimal (Kualitas ${dataQuality.overall_score}%)
                  </strong>
                </div>
                <p style="font-size: 0.83rem; color: var(--text-secondary); line-height: 1.5;">
                  AIbo sudah memiliki cukup data untuk menganalisis <strong>Penjualan, Stok, dan Pelanggan</strong>. 
                  Data yang belum lengkap hanya membatasi analisis lanjutan tertentu, namun <strong>TIDAK menonaktifkan</strong> dashboard bisnis Anda.
                </p>
                <div style="display: flex; gap: 14px; margin-top: 10px; font-size: 0.78rem; flex-wrap: wrap;">
                  <span style="color: var(--success); font-weight: 600;">✓ Data Penjualan Terhubung</span>
                  <span style="color: var(--success); font-weight: 600;">✓ Data Stok Terhubung</span>
                  <span style="color: var(--warning); font-weight: 600;">⚠ Data Iklan (Bisa Dilengkapi Kapan Saja)</span>
                </div>
              </div>
              <button class="btn btn-secondary btn-sm" id="btn-dismiss-missing-guide" style="font-size: 0.78rem;">Paham 👍</button>
            </div>
          </div>

          <!-- Stage E: Recommended Data to Connect Next -->
          <div class="card" style="border: 2px solid var(--primary); background: var(--primary-glow); padding: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-size: 0.8rem; font-weight: 800; color: var(--primary); text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px;">
                <span>🎯</span> Rekomendasi Integrasi Data Berikutnya
              </span>
              <span class="badge badge-medium">Target: Marketing ROI</span>
            </div>

            <h4 style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">
              Hubungkan Data Kampanye Iklan (TikTok Ads / Meta Ads)
            </h4>
            
            <p style="font-size: 0.84rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 12px;">
              <strong>Mengapa?</strong> Karena usaha Anda memiliki target <em>Marketing ROI 3.0x</em>. Data kampanye iklan akan membantu AIbo membedah efektivitas setiap channel dan mendeteksi pemborosan biaya promosi.
            </p>

            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
              <span style="font-size: 0.76rem; color: var(--text-muted);">Dampak: Membuka fitur rekomendasi alokasi budget otomatis.</span>
              <div style="display: flex; gap: 8px;">
                <button class="btn btn-secondary btn-sm" id="btn-remind-data-later" style="font-size: 0.78rem;">Ingatkan Nanti</button>
                <button class="btn btn-primary btn-sm" id="btn-connect-recommended" style="font-size: 0.78rem;">+ Hubungkan Data Iklan</button>
              </div>
            </div>
          </div>

          <!-- Stage D: Comprehensive Data Guidance Catalog -->
          <div class="card">
            <div class="card-title">
              <span style="display: flex; align-items: center; gap: 8px;">
                <span>📚</span> Panduan & Status Sumber Data Usaha
              </span>
              <span style="font-size: 0.75rem; color: var(--text-muted);">Klasifikasi Kebutuhan AIbo</span>
            </div>
            
            <p style="color: var(--text-secondary); font-size: 0.83rem; margin-bottom: 16px;">
              Ketahui fungsi masing-masing sumber data dan bagaimana AIbo memanfaatkannya untuk menghasilkan insight bisnis yang akurat.
            </p>

            <div style="display: flex; flex-direction: column; gap: 14px;">
              ${datasetGuidance.map(d => `
                <div style="padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); background: var(--bg-primary); display: flex; flex-direction: column; gap: 10px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                    <div>
                      <span class="badge ${d.tierBadge}" style="font-size: 0.65rem; margin-right: 6px;">${d.tier}</span>
                      <strong style="font-size: 0.92rem; color: var(--text-primary); font-family: var(--font-display);">${d.name}</strong>
                    </div>
                    <span style="font-size: 0.75rem; color: ${d.connected ? 'var(--success)' : 'var(--warning)'}; font-weight: 600;">
                      ${d.connected ? '● Terhubung Aktif' : '○ Perlu Perhatian'}
                    </span>
                  </div>

                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 0.8rem; background: var(--bg-input); padding: 12px; border-radius: var(--radius-sm);">
                    <div>
                      <span style="color: var(--text-muted); display: block; font-weight: 600; margin-bottom: 2px;">Fungsi bagi AIbo:</span>
                      <span style="color: var(--text-secondary); line-height: 1.4;">${d.why}</span>
                    </div>
                    <div>
                      <span style="color: var(--text-muted); display: block; font-weight: 600; margin-bottom: 2px;">Dampak jika belum ada:</span>
                      <span style="color: var(--text-secondary); line-height: 1.4;">${d.missingImpact}</span>
                    </div>
                  </div>

                  <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--text-muted); padding-top: 4px;">
                    <span>Sumber: <strong>${d.source}</strong></span>
                    <button class="btn btn-secondary btn-sm btn-guide-detail" data-id="${d.id}" style="padding: 4px 10px; font-size: 0.72rem;">
                      ${d.connected ? 'Lihat Rincian Analisis' : 'Hubungkan Sumber'}
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Manual Upload Center -->
          <div class="card">
            <div class="card-title">
              <span style="display: flex; align-items: center; gap: 8px;">
                <span>📤</span> Wizard Unggah File Dataset Usaha
              </span>
              <span class="badge" style="background: var(--primary-glow); color: var(--primary);">CSV / XLSX / JSON</span>
            </div>
            <p style="color: var(--text-secondary); font-size: 0.84rem; margin-bottom: 14px;">
              Unggah jurnal transaksi bulanan, stok produk, atau biaya iklan marketing untuk memperbarui analisis AIbo secara berkala.
            </p>
            
            <div style="border: 2px dashed ${isUploading ? 'var(--primary)' : 'var(--border-color)'}; border-radius: var(--radius-sm); padding: 28px; text-align: center; cursor: pointer; background: var(--bg-input); transition: all var(--transition-fast);" id="data-drop-zone">
              <div style="font-size: 2.5rem; margin-bottom: 8px; color: var(--primary);">📤</div>
              <h4 style="font-size: 1rem; margin-bottom: 6px; font-family: var(--font-display);">
                ${isUploading ? 'Memproses & Memvalidasi File Dataset...' : 'Klik atau Drag & Drop File Transaksi di Sini'}
              </h4>
              <p style="color: var(--text-muted); font-size: 0.78rem;">Mendukung NusaBrew_August_Transactions.xlsx atau file CSV</p>
              
              ${isUploading ? `
                <div style="width: 80%; height: 8px; background: var(--border-color); border-radius: 4px; overflow: hidden; margin: 14px auto 6px auto;">
                  <div style="width: ${uploadProgress}%; height: 100%; background: linear-gradient(90deg, var(--primary), var(--ai-primary)); border-radius: 4px; transition: width 0.2s;"></div>
                </div>
                <span style="font-size: 0.75rem; color: var(--ai-primary); font-weight: 600;">Progres Ingest: ${uploadProgress}%</span>
              ` : ''}

              <div id="data-upload-status" style="margin-top: 10px; font-weight: 600; color: var(--success); font-size: 0.84rem; display: none;">
                ✓ Dataset Berhasil Terunggah: NusaBrew_August_Transactions.xlsx (124 rekaman terverifikasi)
              </div>
            </div>
          </div>

        </div>

        <!-- Right Column: Data Quality Scorecard & Recurring Reminders -->
        <div style="display: flex; flex-direction: column; gap: 20px;">
          
          <!-- Recurring Data Reminders Banner -->
          <div class="card" style="border-left: 4px solid var(--warning);">
            <strong style="font-size: 0.92rem; color: var(--text-primary); display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
              <span>⏰</span> Jadwal Pengingat Data
            </strong>
            <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 12px;">
              Atur frekuensi AIbo mengingatkan Anda untuk menyinkronkan data:
            </p>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <select id="reminder-schedule-select" class="form-control" style="font-size: 0.8rem; padding: 6px 10px;">
                <option value="weekly" ${reminderSchedule === 'weekly' ? 'selected' : ''}>Mingguan (Setiap Senin)</option>
                <option value="biweekly" ${reminderSchedule === 'biweekly' ? 'selected' : ''}>Dua Mingguan</option>
                <option value="monthly" ${reminderSchedule === 'monthly' ? 'selected' : ''}>Bulanan (Tgl 1)</option>
              </select>
              <button class="btn btn-secondary btn-sm" id="btn-snooze-reminder" style="font-size: 0.78rem;">Tunda Pengingat (3 Hari)</button>
            </div>
          </div>

          <!-- Data Quality Scorecard -->
          <div class="card" style="text-align: center;">
            <h3 class="card-title" style="justify-content: center;">Data Quality Scorecard</h3>
            <h2 style="font-size: 3.2rem; font-family: var(--font-display); color: var(--success); margin: 10px 0; font-weight: 800;">
              ${dataQuality.overall_score}%
            </h2>
            <p style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 14px;">
              Skor Kualitas Sangat Baik — Data SIAP untuk Pemodelan AI
            </p>
            
            <div style="display: flex; flex-direction: column; gap: 10px; text-align: left; font-size: 0.82rem; border-top: 1px solid var(--border-color); padding-top: 14px;">
              <div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span>Kelengkapan (Completeness):</span><strong>${dataQuality.completeness}%</strong>
                </div>
                <div style="width: 100%; height: 6px; background: var(--border-color); border-radius: 3px; overflow: hidden;">
                  <div style="width: ${dataQuality.completeness}%; height: 100%; background: var(--success);"></div>
                </div>
              </div>

              <div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span>Akurasi (Accuracy):</span><strong>${dataQuality.accuracy}%</strong>
                </div>
                <div style="width: 100%; height: 6px; background: var(--border-color); border-radius: 3px; overflow: hidden;">
                  <div style="width: ${dataQuality.accuracy}%; height: 100%; background: var(--ai-primary);"></div>
                </div>
              </div>

              <div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span>Konsistensi:</span><strong>${dataQuality.consistency}%</strong>
                </div>
                <div style="width: 100%; height: 6px; background: var(--border-color); border-radius: 3px; overflow: hidden;">
                  <div style="width: ${dataQuality.consistency}%; height: 100%; background: var(--primary);"></div>
                </div>
              </div>

              <div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                  <span>Keterbaruan (Freshness):</span><strong>${dataQuality.freshness}%</strong>
                </div>
                <div style="width: 100%; height: 6px; background: var(--border-color); border-radius: 3px; overflow: hidden;">
                  <div style="width: ${dataQuality.freshness}%; height: 100%; background: var(--secondary);"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Connected Platform Integrations Card -->
          <div class="card">
            <div class="card-title">
              <span style="font-size: 0.9rem;">🔗 Platform Terhubung (Simulasi)</span>
              <button class="btn btn-secondary btn-sm" id="btn-sync-all-platforms" style="padding: 4px 8px; font-size: 0.72rem;">
                🔄 Sync All
              </button>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 10px;">
              ${integrations.map(int => `
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
                  <div>
                    <strong style="color: var(--text-primary); display: block;">${int.platform}</strong>
                    <span style="font-size: 0.72rem; color: var(--text-muted);">${formatLastSync(int.last_sync)}</span>
                  </div>
                  <button class="btn btn-secondary btn-sm btn-reconnect" data-platform="${int.platform}" style="padding: 3px 8px; font-size: 0.68rem;">
                    Sync
                  </button>
                </div>
              `).join('')}
            </div>
          </div>

        </div>

      </div>
    `;

    bindEvents();
  }

  function formatLastSync(timestamp) {
    if (!timestamp) return 'Baru saja';
    if (timestamp.includes('T')) {
      return timestamp.split('T')[0] + ' ' + timestamp.split('T')[1].substring(0, 5);
    }
    return timestamp;
  }

  function bindEvents() {
    const reminderSelect = document.getElementById('reminder-schedule-select');
    if (reminderSelect) {
      reminderSelect.addEventListener('change', (e) => {
        reminderSchedule = e.target.value;
        localStorage.setItem('aibo_data_reminder', reminderSchedule);
        showToast("Jadwal pengingat pembaruan data berhasil disimpan.", "success");
      });
    }

    const snoozeBtn = document.getElementById('btn-snooze-reminder');
    if (snoozeBtn) {
      snoozeBtn.addEventListener('click', () => {
        showToast("Pengingat ditunda selama 3 hari.", "info");
      });
    }

    const dismissMissingBtn = document.getElementById('btn-dismiss-missing-guide');
    if (dismissMissingBtn) {
      dismissMissingBtn.addEventListener('click', () => {
        showToast("Panduan kesiapan data telah dipahami.", "info");
      });
    }

    const connectRecBtn = document.getElementById('btn-connect-recommended');
    if (connectRecBtn) {
      connectRecBtn.addEventListener('click', () => {
        showToast("Menghubungkan Data Iklan (Simulasi Integrasi)...", "info");
        setTimeout(() => {
          showToast("Data Iklan berhasil terhubung (Simulasi)!", "success");
          const mkt = datasetGuidance.find(d => d.id === 'marketing');
          if (mkt) mkt.connected = true;
          dataQuality.overall_score = 96;
          updateView();
        }, 1000);
      });
    }

    const remindLaterBtn = document.getElementById('btn-remind-data-later');
    if (remindLaterBtn) {
      remindLaterBtn.addEventListener('click', () => {
        showToast("Pengingat integrasi data iklan disimpan.", "info");
      });
    }

    const guideDetailBtns = document.querySelectorAll('.btn-guide-detail');
    guideDetailBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const item = datasetGuidance.find(d => d.id === id);
        if (item) {
          alert(`Rincian Sumber: ${item.name}\n\nAnalisis yang Dihasilkan AIbo:\n• ${item.analyzes.join('\n• ')}\n\nStatus: ${item.connected ? 'Terhubung Aktif' : 'Perlu Dihubungkan'}`);
        }
      });
    });

    const reconnectBtns = document.querySelectorAll('.btn-reconnect');
    reconnectBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const platform = btn.dataset.platform;
        btn.disabled = true;
        btn.textContent = 'Syncing...';

        setTimeout(() => {
          const int = integrations.find(i => i.platform === platform);
          if (int) {
            int.status = 'connected';
            int.last_sync = new Date().toISOString();
            if (dataQuality.issues) {
              const issueIdx = dataQuality.issues.findIndex(i => i.source === platform);
              if (issueIdx !== -1) dataQuality.issues.splice(issueIdx, 1);
            }
            dataQuality.overall_score = Math.min(100, dataQuality.overall_score + 3);
            showToast(`Platform ${platform} berhasil disinkronkan! (Simulasi)`, "success");
            updateView();
          }
        }, 800);
      });
    });

    const syncAllBtn = document.getElementById('btn-sync-all-platforms');
    if (syncAllBtn) {
      syncAllBtn.addEventListener('click', () => {
        syncAllBtn.disabled = true;
        syncAllBtn.textContent = '🔄 Syncing...';

        setTimeout(() => {
          integrations.forEach(i => {
            i.status = 'connected';
            i.last_sync = new Date().toISOString();
          });
          dataQuality.issues = [];
          dataQuality.overall_score = 96;
          dataQuality.freshness = 98;
          showToast("Semua platform terhubung berhasil disinkronkan!", "success");
          updateView();
        }, 1000);
      });
    }

    const dropZone = document.getElementById('data-drop-zone');
    if (dropZone && !isUploading) {
      dropZone.addEventListener('click', () => {
        isUploading = true;
        uploadProgress = 10;
        updateView();

        const interval = setInterval(() => {
          uploadProgress += 30;
          if (uploadProgress >= 100) {
            clearInterval(interval);
            isUploading = false;
            uploadProgress = 0;
            dataQuality.overall_score = Math.min(100, dataQuality.overall_score + 4);
            showToast("Dataset NusaBrew_August_Transactions.xlsx berhasil terunggah!", "success");
            updateView();
            setTimeout(() => {
              const statusEl = document.getElementById('data-upload-status');
              if (statusEl) statusEl.style.display = 'block';
            }, 100);
          } else {
            updateView();
          }
        }, 150);
      });
    }
  }

  updateView();
}
