// action.js
// Action Center for AIbo MVP Phase 4.5
// Features: Task Kanban & List View, Goal Detail Closed-Loop Experience (Stage G), 
// Advanced Multi-Category Reports with Period Selector & Simulation Exporters (Stage H),
// Team Workflow Approvals Queue Tab (Stage K).

import { formatCurrency, formatPercent, formatNumber, showToast } from '../utils.js';
import { completeTask, addTask, applyRecommendation, respondApprovalRequest } from '../state.js';
import { getIcon } from '../icons.js';

export function renderAction(container, state, onNavigate) {
  let activeTab = 'tasks'; // 'tasks', 'goals', 'approvals', 'notifications', 'reports'
  let taskViewMode = 'list'; // 'list' or 'kanban'
  let activeReportModal = null; 
  let selectedReportPeriod = 'august_2026';
  let activeGoalModal = null; // Goal object for Stage G detail modal
  let reportCategoryFilter = 'all'; // 'all', 'executive', 'financial', 'customer_ops', 'marketing'
  let notifFilter = 'all'; 
  const isOwner = state.user?.role === 'Owner';

  // Detailed Goal Analytics & Driver Mappings (Stage G Closed-Loop)
  const goalDetailProfiles = {
    goal_001: {
      drivers: [
        { label: 'Penjualan Kanal TikTok Ads', change: '-18%', impact: 'negative', text: 'Penurunan konversi dari traffic video berbayar' },
        { label: 'Penjualan Kanal Website / Direct', change: '+24%', impact: 'positive', text: 'Pertumbuhan pembelian repeat order dari pelanggan setia' },
        { label: 'Rata-rata Nilai Belanja (AOV)', change: '+5%', impact: 'positive', text: 'Kenaikan pembelian bundling produk biji kopi 1kg' },
        { label: 'Total Volume Transaksi (Orders)', change: '-8%', impact: 'negative', text: 'Jumlah pesanan baru mingguan mengalami perlambatan' }
      ],
      relatedDecisions: [
        { id: 'rec_001', title: 'Alokasikan Ulang Budget TikTok ke Email Marketing', impact: '+Rp 18.500.000 Omzet', status: 'pending' },
        { id: 'rec_003', title: 'Promosikan Paket Bundling Biji Kopi Terlaris', impact: '+Rp 12.000.000 Omzet', status: 'pending' }
      ],
      relatedTasks: [
        { id: 'task_001', title: 'Review efektivitas materi iklan TikTok bersama tim kreatif', assignee: 'Maya Putri' },
        { id: 'task_004', title: 'Setup email broadcast promo bundling kopi akhir pekan', assignee: 'Nadia Sari' }
      ]
    },
    goal_002: {
      drivers: [
        { label: 'Beban Pokok Penjualan (HPP)', change: '+4%', impact: 'negative', text: 'Kenaikan harga beli bahan baku kemasan dan sirup' },
        { label: 'Efisiensi Biaya Operasional', change: '+8%', impact: 'positive', text: 'Pengurangan biaya listrik & pemborosan bahan baku outlet' },
        { label: 'Marjin Produk House Blend', change: '62%', impact: 'positive', text: 'Kontribusi marjin laba tertinggi dari lini produk kopi' }
      ],
      relatedDecisions: [
        { id: 'rec_002', title: 'Pesan Ulang Stok Biji Kopi dengan Diskon Volume', impact: '+Rp 4.500.000 Laba Bersih', status: 'pending' }
      ],
      relatedTasks: [
        { id: 'task_002', title: 'Negosiasi harga beli kemasan dengan supplier utama', assignee: 'Raka Wijaya' }
      ]
    },
    goal_003: {
      drivers: [
        { label: 'Customer Retention Rate', change: '65%', impact: 'positive', text: 'Loyalitas pelanggan setia di atas rata-rata industri' },
        { label: 'Akuisisi Pelanggan Baru (CPA)', change: 'Rp 63.800', impact: 'negative', text: 'Biaya iklan per pelanggan baru masih bisa ditekan' }
      ],
      relatedDecisions: [
        { id: 'rec_001', title: 'Program Loyalty Email untuk Pelanggan Lama', impact: '+120 Pelanggan Retensi', status: 'pending' }
      ],
      relatedTasks: [
        { id: 'task_003', title: 'Rilis program poin reward loyalty pelanggan', assignee: 'Nadia Sari' }
      ]
    },
    goal_004: {
      drivers: [
        { label: 'Channel Email ROI', change: '6.0x', impact: 'positive', text: 'Performa kanal ROI tertinggi dengan biaya minimal' },
        { label: 'Channel TikTok Ads ROI', change: '2.58x', impact: 'negative', text: 'Performa iklan di bawah target minimal 3.0x' },
        { label: 'Channel Instagram Ads ROI', change: '4.2x', impact: 'positive', text: 'Efisiensi iklan feed & story berjalan sehat' }
      ],
      relatedDecisions: [
        { id: 'rec_001', title: 'Pindahkan Rp 5 Juta dari TikTok Ads ke Email Marketing', impact: 'Naikkan ROI ke 3.45x', status: 'pending' }
      ],
      relatedTasks: [
        { id: 'task_001', title: 'Evaluasi ad spend harian TikTok Ads Manager', assignee: 'Maya Putri' }
      ]
    }
  };

  // Advanced Report Catalog (Stage H)
  const reportCatalog = [
    {
      id: 'rep_exec_summary',
      category: 'executive',
      categoryLabel: 'Eksekutif',
      title: 'Executive Summary & Business Health Report',
      summary: 'Ringkasan performa menyeluruh meliputi Omzet, Laba Bersih, Skor Kesehatan 6 Dimensi, dan rekomendasi prioritas AIbo.',
      data: { revenue: 482000000, profit: 96400000, margin: '20.0%', healthScore: 82, customers: 1204 }
    },
    {
      id: 'rep_revenue_profit',
      category: 'financial',
      categoryLabel: 'Keuangan',
      title: 'Laporan Pendapatan & Marjin Profitabilitas',
      summary: 'Analisis mendalam tren omzet bulanan, breakdown saluran penjualan (POS, Web, Marketplace), dan margin per kategori.',
      data: { revenue: 482000000, profit: 96400000, topChannel: 'Offline POS (45%)', bestMargin: 'Specialty Beans (62%)' }
    },
    {
      id: 'rep_cash_flow',
      category: 'financial',
      categoryLabel: 'Keuangan',
      title: 'Laporan Arus Kas Operasional (Cash Flow)',
      summary: 'Pemantauan kas masuk, kas keluar, estimasi runway keuangan usaha, dan cadangan likuiditas darurat.',
      data: { cashIn: 512000000, cashOut: 415600000, netCash: 96400000, runway: '6.4 Bulan' }
    },
    {
      id: 'rep_customer_retention',
      category: 'customer_ops',
      categoryLabel: 'Pelanggan & Operasional',
      title: 'Laporan Retensi & Segmen Pelanggan',
      summary: 'Profil pelanggan setia, tingkat churn, frekuensi repeat order, dan rata-rata nilai transaksi per pesanan (AOV).',
      data: { total: 1204, returning: 782, newCust: 115, retentionRate: '65%', aov: 'Rp 400.332' }
    },
    {
      id: 'rep_inventory_health',
      category: 'customer_ops',
      categoryLabel: 'Pelanggan & Operasional',
      title: 'Laporan Kesehatan Persediaan & Stok Produk',
      summary: 'Monitoring persediaan bahan baku, deteksi produk overstock, dan peringatan reorder point untuk mencegah stockout.',
      data: { healthScore: '86%', lowStockItems: 2, overstockItems: 1, inventoryValuation: 'Rp 84.500.000' }
    },
    {
      id: 'rep_marketing_roi',
      category: 'marketing',
      categoryLabel: 'Pemasaran',
      title: 'Laporan Kinerja Kampanye Promosi & Marketing ROI',
      summary: 'Evaluasi efisiensi biaya iklan per kanal promosi (TikTok, Instagram, Email) dan biaya perolehan pelanggan (CPA).',
      data: { spend: 28500000, revenueAttributed: 98000000, overallRoi: '3.44x', bestRoiChannel: 'Email (6.0x)' }
    }
  ];

  function updateView() {
    const tasks = state.tasks || [];
    const goals = state.goals || [];
    const notifications = state.notifications || [];
    const approvals = state.approvals || [];
    const pendingApprCount = approvals.filter(a => a.status === 'pending').length;

    container.innerHTML = `
      <div class="animate-fade-in action-root" style="display: flex; flex-direction: column; gap: 20px;">
        
        <!-- Sub Navigation Tabs -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; flex-wrap: wrap; gap: 12px;">
          <div class="horizontal-scroll-tabs" style="display: flex; gap: 8px;">
            <button class="btn ${activeTab === 'tasks' ? 'btn-primary' : 'btn-secondary'} aibo-icon-btn" data-tab="tasks" style="padding: 8px 14px; font-size: 0.82rem; white-space: nowrap; flex-shrink: 0;">
              ${getIcon('task', { size: 16 })} <span>Checklist Tugas (${tasks.filter(t => t.status !== 'completed').length})</span>
            </button>
            <button class="btn ${activeTab === 'goals' ? 'btn-primary' : 'btn-secondary'} aibo-icon-btn" data-tab="goals" style="padding: 8px 14px; font-size: 0.82rem; white-space: nowrap; flex-shrink: 0;">
              ${getIcon('goals', { size: 16 })} <span>Target Goals & Drivers (${goals.length})</span>
            </button>
            <button class="btn ${activeTab === 'approvals' ? 'btn-primary' : 'btn-secondary'} aibo-icon-btn" data-tab="approvals" style="padding: 8px 14px; font-size: 0.82rem; white-space: nowrap; flex-shrink: 0;">
              ${getIcon('approvals', { size: 16 })} <span>Persetujuan Tim</span> ${pendingApprCount > 0 ? `<span class="badge badge-high" style="font-size: 0.65rem; margin-left: 4px;">${pendingApprCount}</span>` : ''}
            </button>
            <button class="btn ${activeTab === 'notifications' ? 'btn-primary' : 'btn-secondary'} aibo-icon-btn" data-tab="notifications" style="padding: 8px 14px; font-size: 0.82rem; white-space: nowrap; flex-shrink: 0;">
              ${getIcon('bell', { size: 16 })} <span>Notifikasi (${notifications.filter(n => !n.read).length})</span>
            </button>
            <button class="btn ${activeTab === 'reports' ? 'btn-primary' : 'btn-secondary'} aibo-icon-btn" data-tab="reports" style="padding: 8px 14px; font-size: 0.82rem; white-space: nowrap; flex-shrink: 0;">
              ${getIcon('reports', { size: 16 })} <span>Pusat Laporan Bisnis</span>
            </button>
          </div>

          ${activeTab === 'tasks' ? `
            <div style="display: flex; gap: 6px;">
              <button class="btn btn-secondary btn-sm aibo-icon-btn ${taskViewMode === 'list' ? 'btn-primary' : ''}" id="btn-view-list" style="padding: 6px 12px; font-size: 0.78rem;">${getIcon('task', { size: 14 })} <span>List</span></button>
              <button class="btn btn-secondary btn-sm aibo-icon-btn ${taskViewMode === 'kanban' ? 'btn-primary' : ''}" id="btn-view-kanban" style="padding: 6px 12px; font-size: 0.78rem;">${getIcon('kanban', { size: 14 })} <span>Kanban</span></button>
            </div>
          ` : ''}
        </div>

        <div id="action-tab-content">
          ${getTabContent(tasks, goals, notifications, approvals)}
        </div>

        <!-- Stage G: Goal Detail Closed-Loop Modal -->
        ${activeGoalModal ? renderGoalDetailModal(activeGoalModal) : ''}

        <!-- Stage H: Advanced Report Preview Modal -->
        ${activeReportModal ? renderReportModal(activeReportModal) : ''}
      </div>
    `;

    bindEvents();
  }

  function getTabContent(tasks, goals, notifications, approvals) {
    switch (activeTab) {
      case 'tasks': {
        const completedCount = tasks.filter(t => t.status === 'completed').length;
        const totalCount = tasks.length;
        const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        return `
          <div style="display: flex; flex-direction: column; gap: 16px;">
            
            <!-- Header bar with Create Task button -->
            <div class="card" style="padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
              <div>
                <strong style="font-size: 1rem;">Tingkat Penyelesaian Tugas: ${completionRate}%</strong>
                <div style="width: 240px; height: 6px; background: var(--border-color); border-radius: 3px; overflow: hidden; margin-top: 6px;">
                  <div style="width: ${completionRate}%; height: 100%; background: var(--primary);"></div>
                </div>
              </div>
              <button class="btn btn-primary" id="btn-show-add-task" style="padding: 8px 16px; font-weight: 700; font-size: 0.85rem;">+ Tambah Tugas Baru</button>
            </div>

            <!-- Create task form overlay/modal -->
            <div id="inline-task-form" style="display: none;" class="card">
              <h4 style="font-size: 1rem; margin-bottom: 12px; font-weight: 700;">Tambah Tugas Baru</h4>
              <div class="form-group" style="margin-bottom: 12px;">
                <label style="font-size: 0.8rem; color: var(--text-secondary); display: block; margin-bottom: 4px;">Judul Tugas</label>
                <input type="text" id="new-task-title" class="form-control" placeholder="Contoh: Evaluasi materi iklan promosi akhir bulan">
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 14px;">
                <div>
                  <label style="font-size: 0.8rem; color: var(--text-secondary); display: block; margin-bottom: 4px;">Prioritas</label>
                  <select id="new-task-priority" class="form-control">
                    <option value="High">Tinggi (High)</option>
                    <option value="Medium" selected>Sedang (Medium)</option>
                    <option value="Low">Rendah (Low)</option>
                  </select>
                </div>
                <div>
                  <label style="font-size: 0.8rem; color: var(--text-secondary); display: block; margin-bottom: 4px;">Penanggung Jawab (PIC)</label>
                  <input type="text" id="new-task-assignee" class="form-control" value="${state.user?.name || 'Ardi Pratama'}">
                </div>
                <div>
                  <label style="font-size: 0.8rem; color: var(--text-secondary); display: block; margin-bottom: 4px;">Tenggat Waktu</label>
                  <input type="date" id="new-task-due" class="form-control" value="2026-08-25">
                </div>
              </div>
              <div style="display: flex; justify-content: flex-end; gap: 8px;">
                <button class="btn btn-secondary" id="btn-cancel-task">Batal</button>
                <button class="btn btn-primary" id="btn-save-task">Simpan Tugas</button>
              </div>
            </div>

            ${taskViewMode === 'list' ? renderTaskListView(tasks) : renderTaskKanbanView(tasks)}
          </div>
        `;
      }

      case 'approvals': {
        const pending = approvals.filter(a => a.status === 'pending');
        const history = approvals.filter(a => a.status !== 'pending');

        return `
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <div class="card" style="padding: 16px 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div>
                  <h3 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 4px;">Alur Kerja Persetujuan Tim (Workflow Approvals)</h3>
                  <span style="font-size: 0.8rem; color: var(--text-secondary);">
                    Setiap pengeluaran anggaran iklan atau restock besar oleh Manajer membutuhkan persetujuan Owner.
                  </span>
                </div>
                <span class="badge badge-medium">Role: ${state.user?.role || 'Owner'}</span>
              </div>
            </div>

            <!-- Pending Section -->
            <div class="card">
              <div class="card-title">
                <span>⏳ Menunggu Persetujuan (${pending.length})</span>
              </div>

              ${pending.length === 0 ? `
                <div style="text-align: center; padding: 24px; color: var(--text-muted);">
                  <p>Tidak ada permohonan persetujuan yang tertunda saat ini.</p>
                </div>
              ` : `
                <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
                  ${pending.map(appr => `
                    <div style="background: var(--bg-primary); padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
                      <div style="flex: 1; min-width: 260px;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                          <strong style="font-size: 0.95rem; color: var(--text-primary);">${appr.title}</strong>
                          <span class="badge" style="font-size: 0.65rem; background: var(--bg-secondary);">${appr.category}</span>
                        </div>
                        <p style="font-size: 0.82rem; color: var(--text-secondary); margin: 0 0 6px 0; line-height: 1.4;">
                          ${appr.notes || 'Pengajuan realokasi strategi keputusan AIbo.'}
                        </p>
                        <div style="display: flex; gap: 16px; font-size: 0.75rem; color: var(--text-muted);">
                          <span>Pemohon: <strong>${appr.requested_by}</strong></span>
                          <span>Opsi: <strong style="color: var(--ai-primary);">${appr.option_title}</strong></span>
                          <span>Nominal: <strong>${formatCurrency(appr.amount)}</strong></span>
                          <span style="color: var(--success); font-weight: 600;">Proyeksi: ${appr.financial_impact}</span>
                        </div>
                      </div>

                      ${isOwner ? `
                        <div style="display: flex; gap: 8px;">
                          <button class="btn btn-secondary btn-sm btn-reject-approval" data-id="${appr.id}" style="padding: 8px 14px; font-size: 0.78rem; color: var(--danger); border-color: var(--danger);">
                            ✕ Tolak
                          </button>
                          <button class="btn btn-primary btn-sm btn-approve-approval" data-id="${appr.id}" style="padding: 8px 14px; font-size: 0.78rem; background: var(--success); border-color: var(--success);">
                            ✓ Setujui (Approve)
                          </button>
                        </div>
                      ` : `
                        <span class="badge" style="background: var(--bg-secondary); color: var(--warning); padding: 6px 12px;">Menunggu Persetujuan Owner</span>
                      `}
                    </div>
                  `).join('')}
                </div>
              `}
            </div>

            <!-- Approval History Section -->
            <div class="card">
              <div class="card-title">
                <span>📋 Riwayat Keputusan Tim (${history.length})</span>
              </div>

              ${history.length === 0 ? `
                <div style="text-align: center; padding: 20px; color: var(--text-muted);">
                  <p>Belum ada riwayat persetujuan lampau.</p>
                </div>
              ` : `
                <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 10px;">
                  ${history.map(appr => `
                    <div style="background: var(--bg-primary); padding: 12px 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem;">
                      <div>
                        <strong>${appr.title}</strong>
                        <span style="color: var(--text-muted); font-size: 0.75rem; display: block;">
                          Diajukan oleh: ${appr.requested_by} • Direview oleh: ${appr.reviewed_by || 'Owner'}
                        </span>
                      </div>
                      <span class="badge ${appr.status === 'approved' ? 'badge-low' : 'badge-high'}" style="color: ${appr.status === 'approved' ? 'var(--success)' : 'var(--danger)'};">
                        ${appr.status === 'approved' ? '✓ DISETUJUI' : '✕ DITOLAK'}
                      </span>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>
          </div>
        `;
      }

      case 'goals': {
        return `
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <div class="card" style="padding: 16px 20px;">
              <h3 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 4px;">Target Strategis Bisnis & Analisis Pendorong (Drivers)</h3>
              <span style="font-size: 0.8rem; color: var(--text-secondary);">
                Klik pada salah satu target untuk membuka rincian faktor pendukung, keputusan terkait, dan eksekusi tindakan 1-klik.
              </span>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px;">
              ${goals.map(g => {
                let statusBadge = g.status === 'on_track' ? 'badge-low' : (g.status === 'completed' ? 'badge-low' : 'badge-high');
                let statusText = g.status === 'on_track' ? 'On Track' : (g.status === 'completed' ? 'Tercapai 🎉' : 'Perlu Perhatian');
                let progressPercent = Math.min(100, g.progress || 0);

                return `
                  <div class="card goal-card-clickable" data-goal-id="${g.id}" style="cursor: pointer; display: flex; flex-direction: column; justify-content: space-between; border-top: 4px solid var(--primary); transition: transform 0.2s ease;" title="Klik untuk membuka detail driver & closed-loop actions">
                    <div>
                      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                        <span class="badge" style="background: var(--bg-primary); color: var(--text-secondary);">${g.category}</span>
                        <span class="badge ${statusBadge}">${statusText}</span>
                      </div>
                      <h4 style="font-size: 1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">${g.name}</h4>
                      <p style="font-size: 0.78rem; color: var(--text-secondary); line-height: 1.4;">${g.explanation || 'Target pertumbuhan usaha yang diselaraskan dengan analitik AIbo.'}</p>
                    </div>

                    <div style="margin-top: 14px;">
                      <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 4px;">
                        <span style="color: var(--text-muted);">Capaian: <strong>${typeof g.current === 'number' && g.current >= 1000000 ? formatCurrency(g.current) : g.current}</strong></span>
                        <span style="font-weight: 700; color: var(--primary);">${progressPercent}%</span>
                      </div>
                      <div style="width: 100%; height: 6px; background: var(--border-color); border-radius: 3px; overflow: hidden;">
                        <div style="width: ${progressPercent}%; height: 100%; background: var(--primary);"></div>
                      </div>
                      <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); margin-top: 6px;">
                        <span>Target: ${typeof g.target === 'number' && g.target >= 1000000 ? formatCurrency(g.target) : g.target}</span>
                        <span>Tenggat: ${g.deadline}</span>
                      </div>
                      <div style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed var(--border-color); text-align: right;">
                        <span style="font-size: 0.75rem; color: var(--ai-primary); font-weight: 600;">Lihat Detail & Eksekusi ➔</span>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `;
      }

      case 'notifications': {
        return `
          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div class="card">
              <div class="card-title">
                <span>Pusat Notifikasi & Log Aktivitas Bisnis</span>
                <span class="badge" style="background: var(--bg-primary);">${notifications.length} Total</span>
              </div>
              <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 12px;">
                ${notifications.map(n => `
                  <div style="padding: 12px 14px; background: var(--bg-primary); border-radius: var(--radius-sm); border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <strong style="font-size: 0.88rem; color: var(--text-primary); display: block;">${n.title}</strong>
                      <span style="font-size: 0.78rem; color: var(--text-secondary);">${n.message}</span>
                    </div>
                    <span style="font-size: 0.7rem; color: var(--text-muted);">${n.time}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `;
      }

      case 'reports': {
        const filteredReports = reportCategoryFilter === 'all' 
          ? reportCatalog 
          : reportCatalog.filter(r => r.category === reportCategoryFilter);

        return `
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <div class="card" style="padding: 16px 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                <div>
                  <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 4px;">Pusat Laporan & Ekspor Dokumen Bisnis</h3>
                  <span style="font-size: 0.8rem; color: var(--text-secondary);">Template laporan tervalidasi siap cetak untuk manajemen, partner, dan perbankan.</span>
                </div>
                <div style="display: flex; gap: 6px;" id="report-filter-buttons">
                  <button class="btn btn-sm ${reportCategoryFilter === 'all' ? 'btn-primary' : 'btn-secondary'} btn-filter-rep" data-cat="all" style="font-size: 0.75rem;">Semua</button>
                  <button class="btn btn-sm ${reportCategoryFilter === 'executive' ? 'btn-primary' : 'btn-secondary'} btn-filter-rep aibo-icon-btn" data-cat="executive" style="font-size: 0.75rem;">${getIcon('health', { size: 13 })} <span>Eksekutif</span></button>
                  <button class="btn btn-sm ${reportCategoryFilter === 'financial' ? 'btn-primary' : 'btn-secondary'} btn-filter-rep aibo-icon-btn" data-cat="financial" style="font-size: 0.75rem;">${getIcon('revenue', { size: 13 })} <span>Keuangan</span></button>
                  <button class="btn btn-sm ${reportCategoryFilter === 'customer_ops' ? 'btn-primary' : 'btn-secondary'} btn-filter-rep aibo-icon-btn" data-cat="customer_ops" style="font-size: 0.75rem;">${getIcon('customer', { size: 13 })} <span>Pelanggan & Ops</span></button>
                  <button class="btn btn-sm ${reportCategoryFilter === 'marketing' ? 'btn-primary' : 'btn-secondary'} btn-filter-rep aibo-icon-btn" data-cat="marketing" style="font-size: 0.75rem;">${getIcon('marketing', { size: 13 })} <span>Pemasaran</span></button>
                </div>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px;">
              ${filteredReports.map(rep => `
                <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; border-left: 4px solid var(--primary);">
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                      <span class="badge" style="background: var(--bg-primary); color: var(--text-secondary); font-size: 0.7rem;">${rep.categoryLabel}</span>
                      <span style="font-size: 0.7rem; color: var(--text-muted);">Format: PDF, XLSX, CSV</span>
                    </div>
                    <h4 style="font-size: 0.98rem; font-weight: 700; color: var(--text-primary); margin-bottom: 6px;">${rep.title}</h4>
                    <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.45;">${rep.summary}</p>
                  </div>
                  <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.72rem; color: var(--ai-primary); font-weight: 600; display: flex; align-items: center; gap: 4px;">${getIcon('check-circle', { size: 13 })} Terverifikasi AIbo</span>
                    <button class="btn btn-primary btn-sm btn-open-report-preview aibo-icon-btn" data-report-id="${rep.id}" style="font-size: 0.78rem; padding: 6px 14px;">
                      ${getIcon('reports', { size: 14 })} <span>Pratinjau & Ekspor</span>
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }
    }
  }

  function renderTaskListView(tasks) {
    return `
      <div class="card" style="padding: 16px;">
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${tasks.map(t => {
            const isDone = t.status === 'completed';
            return `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: var(--bg-primary); border-radius: var(--radius-sm); border: 1px solid var(--border-color); opacity: ${isDone ? 0.65 : 1};">
                <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                  <button class="btn-check-task" data-task-id="${t.id}" style="background: none; border: 2px solid ${isDone ? 'var(--success)' : 'var(--border-color)'}; width: 22px; height: 22px; border-radius: 4px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--success); flex-shrink: 0;">
                    ${isDone ? getIcon('check', { size: 14 }) : ''}
                  </button>
                  <div>
                    <span style="font-size: 0.88rem; font-weight: 600; color: ${isDone ? 'var(--text-muted)' : 'var(--text-primary)'}; text-decoration: ${isDone ? 'line-through' : 'none'}; display: block;">
                      ${t.title}
                    </span>
                    <span style="font-size: 0.72rem; color: var(--text-muted);">PIC: ${t.assignee} • Tenggat: ${t.due_date}</span>
                  </div>
                </div>
                <span class="badge ${t.priority === 'High' ? 'badge-high' : 'badge-low'}" style="font-size: 0.65rem;">${t.priority}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function renderTaskKanbanView(tasks) {
    const todo = tasks.filter(t => t.status === 'todo' || !t.status);
    const inProgress = tasks.filter(t => t.status === 'in_progress');
    const completed = tasks.filter(t => t.status === 'completed');

    return `
      <div class="kanban-board-scroll">
        <div class="card kanban-column" style="padding: 14px;">
          <div class="card-title" style="font-size: 0.88rem; margin-bottom: 12px; color: var(--warning); display: flex; align-items: center; gap: 6px;">${getIcon('pending', { size: 14 })} <span>Belum Dimulai (${todo.length})</span></div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${todo.map(t => renderKanbanCard(t)).join('')}
          </div>
        </div>
        <div class="card kanban-column" style="padding: 14px;">
          <div class="card-title" style="font-size: 0.88rem; margin-bottom: 12px; color: var(--ai-primary); display: flex; align-items: center; gap: 6px;">${getIcon('recommendation', { size: 14 })} <span>Sedang Berjalan (${inProgress.length})</span></div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${inProgress.map(t => renderKanbanCard(t)).join('')}
          </div>
        </div>
        <div class="card kanban-column" style="padding: 14px;">
          <div class="card-title" style="font-size: 0.88rem; margin-bottom: 12px; color: var(--success); display: flex; align-items: center; gap: 6px;">${getIcon('check-circle', { size: 14 })} <span>Selesai (${completed.length})</span></div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${completed.map(t => renderKanbanCard(t)).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function renderKanbanCard(t) {
    return `
      <div style="background: var(--bg-primary); padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 6px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <strong style="font-size: 0.82rem; color: var(--text-primary);">${t.title}</strong>
          <span class="badge ${t.priority === 'High' ? 'badge-high' : 'badge-medium'}" style="font-size: 0.62rem;">${t.priority}</span>
        </div>
        <span style="font-size: 0.7rem; color: var(--text-muted);">PIC: ${t.assignee} • ${t.due_date}</span>
      </div>
    `;
  }

  function renderGoalDetailModal(goal) {
    const profile = goalDetailProfiles[goal.id] || {
      drivers: [
        { label: 'Volume Transaksi Pelanggan', change: '+12%', impact: 'positive', text: 'Peningkatan transaksi repeat order di outlet' }
      ],
      relatedDecisions: [],
      relatedTasks: []
    };

    return `
      <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px;">
        <div class="card animate-fade-in" style="max-width: 620px; width: 100%; max-height: 90vh; overflow-y: auto; border: 1px solid var(--border-color); padding: 24px;">
          
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 16px;">
            <div>
              <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--primary); display: flex; align-items: center; gap: 8px;">
                ${getIcon('goals', { size: 20 })} <span>${goal.name}</span>
              </h3>
              <span style="font-size: 0.75rem; color: var(--text-muted);">Kategori: ${goal.category} • Tenggat: ${goal.deadline}</span>
            </div>
            <button class="btn btn-secondary btn-sm" id="btn-close-goal-modal" style="display: flex; align-items: center; padding: 4px 8px;">${getIcon('close', { size: 18 })}</button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div style="background: var(--bg-primary); padding: 12px 16px; border-radius: var(--radius-sm); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="font-size: 0.78rem; color: var(--text-muted);">Status Saat Ini:</span>
                <strong style="font-size: 1.1rem; color: var(--text-primary); display: block;">${typeof goal.current === 'number' && goal.current >= 1000000 ? formatCurrency(goal.current) : goal.current}</strong>
              </div>
              <div>
                <span style="font-size: 0.78rem; color: var(--text-muted);">Target:</span>
                <strong style="font-size: 1.1rem; color: var(--primary); display: block;">${typeof goal.target === 'number' && goal.target >= 1000000 ? formatCurrency(goal.target) : goal.target}</strong>
              </div>
              <div>
                <span style="font-size: 0.78rem; color: var(--text-muted);">Progres:</span>
                <strong style="font-size: 1.1rem; color: var(--success); display: block;">${goal.progress}%</strong>
              </div>
            </div>

            <!-- Drivers -->
            <div>
              <strong style="font-size: 0.88rem; color: var(--text-primary); display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
                ${getIcon('comparison', { size: 16 })} <span>Faktor Pendorong Capaian (Drivers):</span>
              </strong>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                ${profile.drivers.map(d => `
                  <div style="background: var(--bg-primary); padding: 8px 12px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem;">
                    <div>
                      <strong>${d.label}</strong>
                      <span style="font-size: 0.72rem; color: var(--text-muted); display: block;">${d.text}</span>
                    </div>
                    <span style="font-weight: 700; color: ${d.impact === 'positive' ? 'var(--success)' : 'var(--danger)'};">${d.change}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Related Decisions -->
            ${profile.relatedDecisions.length > 0 ? `
              <div>
                <strong style="font-size: 0.88rem; color: var(--text-primary); display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
                  ${getIcon('insight', { size: 16 })} <span>Rekomendasi Terkait & Eksekusi:</span>
                </strong>
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  ${profile.relatedDecisions.map(r => `
                    <div style="background: var(--bg-primary); padding: 10px 12px; border-radius: 6px; border-left: 3px solid var(--ai-primary); display: flex; justify-content: space-between; align-items: center;">
                      <div>
                        <strong style="font-size: 0.82rem; color: var(--text-primary);">${r.title}</strong>
                        <span style="font-size: 0.72rem; color: var(--success); display: block;">Dampak: ${r.impact}</span>
                      </div>
                      <button class="btn btn-primary btn-sm btn-exec-goal-rec aibo-icon-btn" data-rec-id="${r.id}" style="font-size: 0.72rem; padding: 4px 10px;">
                        ${getIcon('recommendation', { size: 12 })} <span>Eksekusi</span>
                      </button>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
              <button class="btn btn-secondary" id="btn-close-goal-modal-2">Tutup Rincian</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderReportModal(rep) {
    return `
      <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px;">
        <div class="card animate-fade-in" style="max-width: 680px; width: 100%; max-height: 90vh; overflow-y: auto; border: 1px solid var(--border-color); padding: 24px;">
          
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 16px;">
            <div>
              <h3 style="font-size: 1.15rem; font-weight: 700; color: var(--primary); display: flex; align-items: center; gap: 8px;">
                ${getIcon('reports', { size: 20 })} <span>${rep.title}</span>
              </h3>
              <span style="font-size: 0.75rem; color: var(--text-muted);">Kategori: ${rep.categoryLabel} • Verifikasi Resmi AIbo</span>
            </div>
            <button class="btn btn-secondary btn-sm" id="btn-close-report-modal" style="display: flex; align-items: center; padding: 4px 8px;">${getIcon('close', { size: 18 })}</button>
          </div>

          <!-- Printable Sheet Simulation -->
          <div style="background: white; color: #1e293b; padding: 20px; border-radius: 6px; border: 1px solid #cbd5e1; font-family: sans-serif; display: flex; flex-direction: column; gap: 14px;">
            <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 10px;">
              <div>
                <strong style="font-size: 1.1rem; color: #0f172a; display: block;">PT NUSA BREW INDONESIA</strong>
                <span style="font-size: 0.75rem; color: #64748b;">Specialty Coffee & Retail Roastery</span>
              </div>
              <div style="text-align: right;">
                <span style="font-size: 0.75rem; color: #64748b; display: block;">Periode: <strong>Agustus 2026</strong></span>
                <span style="font-size: 0.75rem; color: #10b981; font-weight: bold;">STATUS: VALID</span>
              </div>
            </div>

            <p style="font-size: 0.85rem; line-height: 1.5; color: #334155; margin: 0;">
              Laporan ini dibuat otomatis berdasarkan data transaksi POS outlet, kampanye periklanan digital, dan persediaan inventaris PT Nusa Brew Indonesia.
            </p>

            <table style="width: 100%; border-collapse: collapse; font-size: 0.82rem; margin-top: 8px;">
              <tr style="background: #f1f5f9; text-align: left;">
                <th style="padding: 8px; border: 1px solid #cbd5e1;">Metrik Kunci</th>
                <th style="padding: 8px; border: 1px solid #cbd5e1;">Nilai Aktual</th>
                <th style="padding: 8px; border: 1px solid #cbd5e1;">Status AIbo</th>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #cbd5e1;">Total Pendapatan (Revenue)</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Rp 482.000.000</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; color: #10b981;">● Sehat (+11.8%)</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #cbd5e1;">Laba Bersih (Net Profit)</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Rp 96.400.000</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; color: #10b981;">● Margin 20.0%</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #cbd5e1;">Skor Kesehatan Bisnis</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">82 / 100</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; color: #10b981;">● 6 Dimensi Terverifikasi</td>
              </tr>
            </table>

            <div style="background: #f8fafc; border-left: 3px solid #4f46e5; padding: 10px 12px; font-size: 0.8rem; color: #334155;">
              <strong>Rekomendasi AIbo:</strong> Kinerja penjualan offline POS dan produk specialty beans sangat kuat. Disarankan memindahkan sebagian budget iklan TikTok ke Email Marketing untuk mengoptimalkan laba bersih.
            </div>
          </div>

          <!-- Multi-Format Export Buttons -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px; flex-wrap: wrap; gap: 10px;">
            <button class="btn btn-secondary" id="btn-close-report-modal-2">Tutup</button>
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button class="btn btn-secondary btn-sm aibo-icon-btn" id="btn-sim-export-csv" style="font-size: 0.78rem;">${getIcon('export', { size: 13 })} <span>Ekspor CSV</span></button>
              <button class="btn btn-secondary btn-sm aibo-icon-btn" id="btn-sim-export-xlsx" style="font-size: 0.78rem;">${getIcon('export', { size: 13 })} <span>Ekspor XLSX</span></button>
              <button class="btn btn-primary btn-sm aibo-icon-btn" id="btn-download-pdf-sim" style="font-size: 0.78rem; font-weight: 700;">${getIcon('download', { size: 14 })} <span>Cetak Laporan PDF</span></button>
            </div>
          </div>

        </div>
      </div>
    `;
  }

  function bindEvents() {
    const tabs = document.querySelectorAll('button[data-tab]');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        activeTab = tab.dataset.tab;
        updateView();
      });
    });

    const btnList = document.getElementById('btn-view-list');
    const btnKanban = document.getElementById('btn-view-kanban');
    if (btnList) btnList.addEventListener('click', () => { taskViewMode = 'list'; updateView(); });
    if (btnKanban) btnKanban.addEventListener('click', () => { taskViewMode = 'kanban'; updateView(); });

    const showAddBtn = document.getElementById('btn-show-add-task');
    const inlineForm = document.getElementById('inline-task-form');
    const cancelBtn = document.getElementById('btn-cancel-task');
    const saveBtn = document.getElementById('btn-save-task');

    if (showAddBtn && inlineForm) {
      showAddBtn.addEventListener('click', () => {
        inlineForm.style.display = inlineForm.style.display === 'none' ? 'block' : 'none';
      });
    }

    if (cancelBtn && inlineForm) {
      cancelBtn.addEventListener('click', () => {
        inlineForm.style.display = 'none';
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const title = document.getElementById('new-task-title').value;
        const priority = document.getElementById('new-task-priority').value;
        const assignee = document.getElementById('new-task-assignee').value;
        const due = document.getElementById('new-task-due').value;

        if (title) {
          addTask({ title, priority, assignee, due_date: due, status: 'todo' });
          showToast(`Tugas "${title}" berhasil ditambahkan!`, 'success');
          updateView();
        }
      });
    }

    // Complete task click
    const checkButtons = document.querySelectorAll('.btn-check-task');
    checkButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const taskId = btn.dataset.taskId;
        completeTask(taskId);
        showToast('Tugas ditandai selesai!', 'success');
        updateView();
      });
    });

    // Approval approve/reject in Action Center
    const approveBtns = document.querySelectorAll('.btn-approve-approval');
    approveBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const apprId = btn.dataset.id;
        respondApprovalRequest(apprId, 'approved');
        showToast("Pengajuan disetujui! Keputusan telah diterapkan.", "success");
        updateView();
      });
    });

    const rejectBtns = document.querySelectorAll('.btn-reject-approval');
    rejectBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const apprId = btn.dataset.id;
        const reason = prompt("Masukkan alasan penolakan untuk tim:", "Perlu peninjauan ulang alokasi anggaran.");
        if (reason !== null) {
          respondApprovalRequest(apprId, 'rejected', reason);
          showToast("Pengajuan ditolak.", "warning");
          updateView();
        }
      });
    });

    // Goal detail click
    const goalCards = document.querySelectorAll('.goal-card-clickable');
    goalCards.forEach(card => {
      card.addEventListener('click', () => {
        const goalId = card.dataset.goalId;
        activeGoalModal = state.goals.find(g => g.id === goalId);
        updateView();
      });
    });

    const closeGoalBtn1 = document.getElementById('btn-close-goal-modal');
    const closeGoalBtn2 = document.getElementById('btn-close-goal-modal-2');
    if (closeGoalBtn1) closeGoalBtn1.addEventListener('click', () => { activeGoalModal = null; updateView(); });
    if (closeGoalBtn2) closeGoalBtn2.addEventListener('click', () => { activeGoalModal = null; updateView(); });

    // Execute rec inside goal modal
    const execGoalRecBtns = document.querySelectorAll('.btn-exec-goal-rec');
    execGoalRecBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const recId = btn.dataset.recId;
        applyRecommendation(recId);
        showToast('Keputusan rekomendasi berhasil dieksekusi dari target!', 'success');
        activeGoalModal = null;
        updateView();
      });
    });

    // Report filter buttons
    const reportFilterBtns = document.querySelectorAll('.btn-filter-rep');
    reportFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        reportCategoryFilter = btn.dataset.cat;
        updateView();
      });
    });

    // Report preview modal
    const previewBtns = document.querySelectorAll('.btn-open-report-preview');
    previewBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const repId = btn.dataset.reportId;
        activeReportModal = reportCatalog.find(r => r.id === repId);
        updateView();
      });
    });

    const closeRepBtn1 = document.getElementById('btn-close-report-modal');
    const closeRepBtn2 = document.getElementById('btn-close-report-modal-2');
    if (closeRepBtn1) closeRepBtn1.addEventListener('click', () => { activeReportModal = null; updateView(); });
    if (closeRepBtn2) closeRepBtn2.addEventListener('click', () => { activeReportModal = null; updateView(); });

    // Simulation download buttons
    const btnPdf = document.getElementById('btn-download-pdf-sim');
    const btnCsv = document.getElementById('btn-sim-export-csv');
    const btnXlsx = document.getElementById('btn-sim-export-xlsx');

    if (btnPdf) btnPdf.addEventListener('click', () => showToast('Simulasi Cetak PDF: Dokumen resmi ter-generate!', 'success'));
    if (btnCsv) btnCsv.addEventListener('click', () => showToast('Simulasi Ekspor CSV: Berkas tabel terunduh!', 'success'));
    if (btnXlsx) btnXlsx.addEventListener('click', () => showToast('Simulasi Ekspor XLSX: Format Excel siap dibuka!', 'success'));
  }

  updateView();
}
