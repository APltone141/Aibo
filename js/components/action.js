// action.js
// Action Center for AIbo MVP Phase 4.5
// Features: Task Kanban & List View, Goal Detail Closed-Loop Experience (Stage G), 
// Advanced Multi-Category Reports with Period Selector & Simulation Exporters (Stage H).

import { formatCurrency, formatPercent, formatNumber, showToast } from '../utils.js';
import { completeTask, addTask, applyRecommendation } from '../state.js';

export function renderAction(container, state, onNavigate) {
  let activeTab = 'tasks'; 
  let taskViewMode = 'list'; // 'list' or 'kanban'
  let activeReportModal = null; 
  let selectedReportPeriod = 'august_2026';
  let activeGoalModal = null; // Goal object for Stage G detail modal
  let reportCategoryFilter = 'all'; // 'all', 'executive', 'financial', 'customer_ops', 'marketing'
  let notifFilter = 'all'; 

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
    const tasks = state.tasks;
    const goals = state.goals;
    const notifications = state.notifications;

    container.innerHTML = `
      <div class="animate-fade-in action-root" style="display: flex; flex-direction: column; gap: 20px;">
        
        <!-- Sub Navigation Tabs -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; flex-wrap: wrap; gap: 12px;">
          <div style="display: flex; gap: 8px;">
            <button class="btn ${activeTab === 'tasks' ? 'btn-primary' : 'btn-secondary'}" data-tab="tasks" style="padding: 8px 16px; font-size: 0.84rem;">
              📋 Check Checklist Tugas (${tasks.filter(t => t.status !== 'completed').length})
            </button>
            <button class="btn ${activeTab === 'goals' ? 'btn-primary' : 'btn-secondary'}" data-tab="goals" style="padding: 8px 16px; font-size: 0.84rem;">
              🎯 Target Goals & Drivers (${goals.length})
            </button>
            <button class="btn ${activeTab === 'notifications' ? 'btn-primary' : 'btn-secondary'}" data-tab="notifications" style="padding: 8px 16px; font-size: 0.84rem;">
              🔔 Notifikasi (${notifications.filter(n => !n.read).length})
            </button>
            <button class="btn ${activeTab === 'reports' ? 'btn-primary' : 'btn-secondary'}" data-tab="reports" style="padding: 8px 16px; font-size: 0.84rem;">
              📑 Pusat Laporan Bisnis
            </button>
          </div>

          ${activeTab === 'tasks' ? `
            <div style="display: flex; gap: 6px;">
              <button class="btn btn-secondary btn-sm ${taskViewMode === 'list' ? 'btn-primary' : ''}" id="btn-view-list" style="padding: 6px 12px; font-size: 0.78rem;">Tampilan List</button>
              <button class="btn btn-secondary btn-sm ${taskViewMode === 'kanban' ? 'btn-primary' : ''}" id="btn-view-kanban" style="padding: 6px 12px; font-size: 0.78rem;">Kanban Board</button>
            </div>
          ` : ''}
        </div>

        <div id="action-tab-content">
          ${getTabContent(tasks, goals, notifications)}
        </div>

        <!-- Stage G: Goal Detail Closed-Loop Modal -->
        ${activeGoalModal ? renderGoalDetailModal(activeGoalModal) : ''}

        <!-- Stage H: Advanced Report Preview Modal -->
        ${activeReportModal ? renderReportModal(activeReportModal) : ''}
      </div>
    `;

    bindEvents();
  }

  function getTabContent(tasks, goals, notifications) {
    switch (activeTab) {
      case 'tasks': {
        const completedCount = tasks.filter(t => t.status === 'completed').length;
        const totalCount = tasks.length;
        const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        return `
          <div style="display: flex; flex-direction: column; gap: 16px;">
            
            <!-- Header bar with Create Task button -->
            <div class="card" style="padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;">
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
                <label class="form-label">Judul Tugas</label>
                <input type="text" id="new-task-title" class="form-control" placeholder="cth. Reorder stok House Blend Arabica">
              </div>
              <div class="grid-3" style="margin-bottom: 12px;">
                <div class="form-group">
                  <label class="form-label">Prioritas</label>
                  <select id="new-task-priority" class="form-control">
                    <option value="High">Tinggi (High)</option>
                    <option value="Medium" selected>Sedang (Medium)</option>
                    <option value="Low">Rendah (Low)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Penanggung Jawab</label>
                  <select id="new-task-assignee" class="form-control">
                    <option value="Ardi Pratama">Ardi Pratama (Owner)</option>
                    <option value="Nadia Sari">Nadia Sari (Manager)</option>
                    <option value="Maya Putri">Maya Putri (Marketing)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Tenggat Waktu</label>
                  <input type="date" id="new-task-due" class="form-control" value="2026-08-25">
                </div>
              </div>
              <div style="display: flex; justify-content: flex-end; gap: 8px;">
                <button class="btn btn-secondary btn-sm" id="btn-cancel-task">Batal</button>
                <button class="btn btn-primary btn-sm" id="btn-save-task">Simpan Tugas</button>
              </div>
            </div>

            <!-- Task Display Mode -->
            ${taskViewMode === 'list' ? renderTaskList(tasks) : renderTaskKanban(tasks)}
          </div>
        `;
      }

      case 'goals': {
        return `
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <div class="card" style="padding: 14px 20px; background: var(--bg-card-solid); border-left: 4px solid var(--primary);">
              <span style="font-size: 0.88rem; color: var(--text-secondary);">
                💡 <strong>Klik kartu target bisnis</strong> untuk melihat analisis faktor pendorong (*drivers*), rekomendasi keputusan, dan tugas terkait.
              </span>
            </div>

            <div class="grid-2">
              ${goals.map(g => `
                <div class="card btn-open-goal-detail" data-goal-id="${g.id}" style="display: flex; flex-direction: column; gap: 12px; cursor: pointer; transition: transform 0.2s;" title="Klik untuk membuka rincian faktor pendorong target">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h4 style="font-size: 1rem; font-weight: 700; color: var(--text-primary);">${g.name}</h4>
                    <span class="badge ${g.status === 'at_risk' ? 'badge-high' : 'badge-low'}">
                      ${g.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-secondary);">
                    <span>Progres Capaian: <strong style="color: var(--text-primary);">${g.progress}%</strong></span>
                    <span>Target: <strong>${g.unit === 'IDR' ? formatCurrency(g.target) : formatNumber(g.target)}</strong></span>
                  </div>
                  <div style="width: 100%; height: 8px; background: var(--border-color); border-radius: 4px; overflow: hidden;">
                    <div style="width: ${Math.min(100, g.progress)}%; height: 100%; background: ${g.status === 'at_risk' ? 'var(--danger)' : 'var(--success)'};"></div>
                  </div>
                  <div style="font-size: 0.78rem; color: var(--text-muted); display: flex; justify-content: space-between; margin-top: 4px; border-top: 1px dashed var(--border-color); padding-top: 8px;">
                    <span>Posisi Saat Ini: ${g.unit === 'IDR' ? formatCurrency(g.current) : formatNumber(g.current)}</span>
                    <span style="color: var(--primary); font-weight: 600;">🔍 Lihat Drivers & Keputusan</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      case 'notifications': {
        const filteredNotifs = notifications.filter(n => notifFilter === 'all' || n.type === notifFilter);

        return `
          <div class="card" style="display: flex; flex-direction: column; gap: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div style="display: flex; gap: 8px;" id="notif-filter-bar">
                <button class="btn btn-secondary btn-sm ${notifFilter === 'all' ? 'btn-primary' : ''}" data-filter="all">Semua</button>
                <button class="btn btn-secondary btn-sm ${notifFilter === 'task' ? 'btn-primary' : ''}" data-filter="task">Tugas</button>
                <button class="btn btn-secondary btn-sm ${notifFilter === 'alert' ? 'btn-primary' : ''}" data-filter="alert">Alert</button>
              </div>
              <button class="btn btn-secondary btn-sm" id="btn-mark-all-read">Tandai Semua Dibaca</button>
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${filteredNotifs.length === 0 ? `
                <div style="text-align: center; padding: 30px; color: var(--text-muted);">Tidak ada notifikasi.</div>
              ` : filteredNotifs.map(n => `
                <div style="padding: 12px 16px; background: ${n.read ? 'var(--bg-primary)' : 'var(--primary-glow)'}; border-radius: var(--radius-sm); border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <strong style="font-size: 0.88rem; display: block; color: var(--text-primary);">${n.title}</strong>
                    <span style="font-size: 0.82rem; color: var(--text-secondary);">${n.message}</span>
                  </div>
                  <span style="font-size: 0.72rem; color: var(--text-muted);">${n.time}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      case 'reports': {
        const filteredReports = reportCatalog.filter(r => reportCategoryFilter === 'all' || r.category === reportCategoryFilter);

        return `
          <div style="display: flex; flex-direction: column; gap: 18px;">
            
            <!-- Category Filter Bar -->
            <div class="card" style="padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
              <div style="display: flex; gap: 8px; flex-wrap: wrap;" id="report-cat-filter-bar">
                <button class="btn btn-secondary btn-sm ${reportCategoryFilter === 'all' ? 'btn-primary' : ''}" data-cat="all">Semua Laporan</button>
                <button class="btn btn-secondary btn-sm ${reportCategoryFilter === 'executive' ? 'btn-primary' : ''}" data-cat="executive">🏢 Eksekutif</button>
                <button class="btn btn-secondary btn-sm ${reportCategoryFilter === 'financial' ? 'btn-primary' : ''}" data-cat="financial">💰 Keuangan & Kas</button>
                <button class="btn btn-secondary btn-sm ${reportCategoryFilter === 'customer_ops' ? 'btn-primary' : ''}" data-cat="customer_ops">👥 Pelanggan & Stok</button>
                <button class="btn btn-secondary btn-sm ${reportCategoryFilter === 'marketing' ? 'btn-primary' : ''}" data-cat="marketing">📈 Pemasaran / Iklan</button>
              </div>

              <span style="font-size: 0.78rem; color: var(--text-muted);">
                Tersedia 6 Template Laporan Bisnis
              </span>
            </div>

            <!-- Report Cards Grid -->
            <div class="grid-3">
              ${filteredReports.map(r => `
                <div class="card" style="display: flex; flex-direction: column; justify-content: space-between; gap: 14px;">
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                      <span style="font-size: 1.8rem;">📑</span>
                      <span class="badge badge-low" style="font-size: 0.65rem;">${r.categoryLabel}</span>
                    </div>
                    <h4 style="font-size: 1rem; font-weight: 700; color: var(--text-primary);">${r.title}</h4>
                    <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 6px; line-height: 1.4;">${r.summary}</p>
                  </div>
                  <button class="btn btn-primary btn-sm btn-preview-report" data-id="${r.id}" style="padding: 8px 14px; font-size: 0.8rem; font-weight: 600;">
                    👁️ Buka & Pratinjau Laporan
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }
    }
  }

  function renderTaskList(tasks) {
    return `
      <div class="card" style="display: flex; flex-direction: column; gap: 8px;">
        ${tasks.map(t => {
          const isCompleted = t.status === 'completed';
          return `
            <div class="task-item" style="padding: 12px 16px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
              <div class="task-details" style="display: flex; align-items: center; gap: 12px;">
                <div class="task-checkbox btn-checkbox-complete ${isCompleted ? 'checked' : ''}" data-id="${t.id}" style="cursor: pointer; width: 22px; height: 22px; border: 2px solid var(--primary); border-radius: 4px; display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; background: ${isCompleted ? 'var(--primary)' : 'transparent'};">
                  ${isCompleted ? '✓' : ''}
                </div>
                <div style="display: flex; flex-direction: column;">
                  <span class="task-title ${isCompleted ? 'completed' : ''}" style="font-weight: 500; font-size: 0.88rem; ${isCompleted ? 'text-decoration: line-through; color: var(--text-muted);' : ''}">${t.title}</span>
                  <span style="font-size: 0.75rem; color: var(--text-muted);">Penanggung Jawab: ${t.assignee} | Tenggat: ${t.due_date}</span>
                </div>
              </div>
              <span class="badge ${t.priority === 'High' ? 'badge-high' : 'badge-medium'}" style="font-size: 0.65rem;">
                ${t.priority}
              </span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderTaskKanban(tasks) {
    const todo = tasks.filter(t => t.status === 'todo');
    const inProgress = tasks.filter(t => t.status === 'in_progress');
    const completed = tasks.filter(t => t.status === 'completed');

    return `
      <div class="grid-3" style="gap: 16px;">
        <div class="card" style="background: var(--bg-primary); padding: 14px;">
          <h4 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 12px; color: var(--text-secondary);">📌 To Do (${todo.length})</h4>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${todo.map(t => renderKanbanCard(t)).join('')}
          </div>
        </div>

        <div class="card" style="background: var(--bg-primary); padding: 14px;">
          <h4 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 12px; color: var(--warning);">⏳ In Progress (${inProgress.length})</h4>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${inProgress.map(t => renderKanbanCard(t)).join('')}
          </div>
        </div>

        <div class="card" style="background: var(--bg-primary); padding: 14px;">
          <h4 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 12px; color: var(--success);">✅ Selesai (${completed.length})</h4>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${completed.map(t => renderKanbanCard(t)).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function renderKanbanCard(t) {
    return `
      <div style="background: var(--bg-card-solid); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 8px;">
        <span style="font-size: 0.84rem; font-weight: 600; color: var(--text-primary);">${t.title}</span>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem; color: var(--text-muted);">
          <span>👤 ${t.assignee}</span>
          <span class="badge ${t.priority === 'High' ? 'badge-high' : 'badge-medium'}" style="font-size: 0.6rem;">${t.priority}</span>
        </div>
      </div>
    `;
  }

  // Stage G: Interactive Goal Detail Closed-Loop Modal
  function renderGoalDetailModal(goal) {
    const profile = goalDetailProfiles[goal.id] || {
      drivers: [
        { label: 'Aktivitas Penjualan', change: '+12%', impact: 'positive', text: 'Performa penjualan berjalan sesuai ekspektasi' },
        { label: 'Efisiensi Biaya', change: '-4%', impact: 'negative', text: 'Perlu optimalisasi pengeluaran non-esensial' }
      ],
      relatedDecisions: [],
      relatedTasks: []
    };

    return `
      <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px;">
        <div class="card animate-fade-in" style="max-width: 640px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 26px; background: var(--bg-secondary); border: 2px solid var(--primary); box-shadow: var(--shadow-lg);">
          
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 16px;">
            <div>
              <span style="font-size: 0.75rem; font-weight: 800; color: var(--primary); text-transform: uppercase;">🎯 Rincian Analisis Target Bisnis</span>
              <h3 style="font-size: 1.2rem; font-weight: 700; color: var(--text-primary); margin-top: 2px;">${goal.name}</h3>
            </div>
            <button class="btn btn-secondary btn-sm" id="btn-close-goal-modal" style="padding: 4px 10px; font-size: 1.1rem;">&times;</button>
          </div>

          <!-- Progress Overview -->
          <div style="background: var(--bg-input); padding: 14px 16px; border-radius: var(--radius-sm); margin-bottom: 18px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.88rem; margin-bottom: 6px;">
              <span>Capaian Saat Ini: <strong>${goal.unit === 'IDR' ? formatCurrency(goal.current) : formatNumber(goal.current)}</strong></span>
              <span>Target: <strong>${goal.unit === 'IDR' ? formatCurrency(goal.target) : formatNumber(goal.target)}</strong></span>
            </div>
            <div style="width: 100%; height: 10px; background: var(--border-color); border-radius: 5px; overflow: hidden; margin-bottom: 8px;">
              <div style="width: ${Math.min(100, goal.progress)}%; height: 100%; background: ${goal.status === 'at_risk' ? 'var(--danger)' : 'var(--success)'};"></div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--text-muted);">
              <span>Progres: <strong>${goal.progress}%</strong></span>
              <span>Proyeksi AIbo: <strong>${goal.unit === 'IDR' ? formatCurrency(goal.forecast || goal.target) : formatNumber(goal.forecast || goal.target)}</strong></span>
              <span>Tenggat: <strong>${goal.deadline || 'Des 2026'}</strong></span>
            </div>
          </div>

          <!-- Drivers (Why did it happen?) -->
          <div style="margin-bottom: 18px;">
            <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
              <span>🔍</span> Faktor Pendorong Utama (Drivers)
            </h4>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${profile.drivers.map(d => `
                <div style="padding: 10px 12px; background: var(--bg-primary); border-radius: var(--radius-sm); border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <strong style="font-size: 0.85rem; color: var(--text-primary); display: block;">${d.label}</strong>
                    <span style="font-size: 0.78rem; color: var(--text-secondary);">${d.text}</span>
                  </div>
                  <span style="font-weight: bold; font-size: 0.85rem; color: ${d.impact === 'positive' ? 'var(--success)' : 'var(--danger)'};">
                    ${d.change}
                  </span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Related Decisions (What Should I Do?) -->
          ${profile.relatedDecisions.length > 0 ? `
            <div style="margin-bottom: 18px;">
              <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--ai-primary); margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
                <span>💡</span> Rekomendasi Keputusan Terkait
              </h4>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${profile.relatedDecisions.map(rec => `
                  <div style="padding: 12px; background: var(--ai-primary-glow); border-radius: var(--radius-sm); border: 1px solid var(--ai-primary); display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <strong style="font-size: 0.86rem; color: var(--text-primary); display: block;">${rec.title}</strong>
                      <span style="font-size: 0.78rem; color: var(--success); font-weight: 600;">Estimasi Dampak: ${rec.impact}</span>
                    </div>
                    <button class="btn btn-primary btn-sm btn-exec-goal-rec" data-rec-id="${rec.id}" style="padding: 5px 10px; font-size: 0.75rem;">
                      Eksekusi Keputusan
                    </button>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <div style="display: flex; justify-content: flex-end; margin-top: 14px;">
            <button class="btn btn-secondary" id="btn-close-goal-modal-2">Tutup Rincian</button>
          </div>

        </div>
      </div>
    `;
  }

  // Stage H: Advanced Report Preview Modal with Period Selector & Simulation Exporters
  function renderReportModal(report) {
    return `
      <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px;">
        <div class="card animate-fade-in" style="max-width: 720px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 28px; background: var(--bg-secondary); border: 1px solid var(--border-color);">
          
          <!-- Modal Header with Period Selector -->
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 14px; margin-bottom: 18px; flex-wrap: wrap; gap: 10px;">
            <div>
              <h3 style="font-size: 1.15rem; font-weight: 700;">📑 Pratinjau Laporan Bisnis</h3>
              <span style="font-size: 0.78rem; color: var(--text-muted);">Kategori: ${report.categoryLabel}</span>
            </div>

            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 0.8rem; color: var(--text-secondary);">Periode:</span>
              <select id="report-period-select" class="form-control" style="font-size: 0.8rem; padding: 4px 8px;">
                <option value="august_2026" ${selectedReportPeriod === 'august_2026' ? 'selected' : ''}>Bulan Ini (Agustus 2026)</option>
                <option value="q3_2026" ${selectedReportPeriod === 'q3_2026' ? 'selected' : ''}>Kuartal 3 (Jul - Sep 2026)</option>
                <option value="ytd_2026" ${selectedReportPeriod === 'ytd_2026' ? 'selected' : ''}>Year-to-Date (Jan - Agu 2026)</option>
              </select>
              <button class="btn btn-secondary btn-sm" id="btn-close-report-modal" style="padding: 4px 10px;">&times;</button>
            </div>
          </div>

          <!-- Printable Document Sheet (Letterhead) -->
          <div style="background: white; color: #0f172a; padding: 26px; border-radius: 8px; font-family: sans-serif; display: flex; flex-direction: column; gap: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);">
            
            <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 12px;">
              <div>
                <h2 style="font-size: 1.3rem; font-weight: 800; color: #4f46e5;">AIbo — Executive Business Report</h2>
                <span style="font-size: 0.85rem; color: #64748b; font-weight: 600;">PT Nusa Brew Indonesia | Coffee Shop & Roastery</span>
              </div>
              <div style="text-align: right; font-size: 0.78rem; color: #64748b;">
                Tanggal Terbit: 15 Agu 2026<br/>
                Status: Verified by AI Engine
              </div>
            </div>

            <div>
              <h4 style="font-size: 1.05rem; font-weight: 700; color: #0f172a; margin-bottom: 4px;">${report.title}</h4>
              <p style="font-size: 0.85rem; color: #475569; line-height: 1.5;">${report.summary}</p>
            </div>

            <!-- Report KPI Breakdown Table -->
            <table style="width: 100%; border-collapse: collapse; font-size: 0.82rem; margin-top: 8px;">
              <tr style="background: #f1f5f9; text-align: left;">
                <th style="padding: 8px; border: 1px solid #cbd5e1;">Metrik & Area Kunci</th>
                <th style="padding: 8px; border: 1px solid #cbd5e1;">Nilai Aktual</th>
                <th style="padding: 8px; border: 1px solid #cbd5e1;">Status AIbo</th>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #cbd5e1;">Total Pendapatan (Revenue)</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Rp 482.000.000</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; color: #10b981;">● Sehat (+11.8% vs bln lalu)</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #cbd5e1;">Laba Bersih (Net Profit)</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">Rp 96.400.000</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; color: #10b981;">● Sehat (Marjin 20%)</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #cbd5e1;">Skor Kesehatan Bisnis</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold;">82 / 100</td>
                <td style="padding: 8px; border: 1px solid #cbd5e1; color: #10b981;">● 6 Dimensi Terverifikasi</td>
              </tr>
            </table>

            <!-- AI Insight Note in Document -->
            <div style="background: #f8fafc; border-left: 3px solid #4f46e5; padding: 10px 12px; font-size: 0.8rem; color: #334155;">
              <strong>Rekomendasi AIbo:</strong> Kinerja penjualan offline POS dan produk specialty beans sangat kuat. Disarankan memindahkan sebagian budget iklan TikTok ke Email Marketing untuk mengoptimalkan laba bersih.
            </div>

          </div>

          <!-- Multi-Format Export Buttons (Explicit Prototype Simulations) -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px; flex-wrap: wrap; gap: 10px;">
            <button class="btn btn-secondary" id="btn-close-report-modal-2">Tutup</button>
            
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button class="btn btn-secondary btn-sm" id="btn-sim-export-csv" style="font-size: 0.78rem;">
                📄 CSV (Simulasi)
              </button>
              <button class="btn btn-secondary btn-sm" id="btn-sim-export-xlsx" style="font-size: 0.78rem;">
                📊 XLSX (Simulasi)
              </button>
              <button class="btn btn-primary btn-sm" id="btn-download-pdf-sim" style="font-size: 0.78rem; font-weight: 700;">
                📥 Cetak PDF (Simulasi)
              </button>
            </div>
          </div>

        </div>
      </div>
    `;
  }

  function bindEvents() {
    const tabs = document.querySelectorAll('.btn-tab, button[data-tab]');
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

    const taskCheckboxes = document.querySelectorAll('.btn-checkbox-complete');
    taskCheckboxes.forEach(box => {
      box.addEventListener('click', () => {
        const id = box.dataset.id;
        completeTask(id);
        showToast('Tugas ditandai selesai!', 'success');
        updateView();
      });
    });

    // Stage G: Goal Detail Card click event
    const goalCards = document.querySelectorAll('.btn-open-goal-detail');
    goalCards.forEach(card => {
      card.addEventListener('click', () => {
        const goalId = card.dataset.goalId;
        activeGoalModal = state.goals.find(g => g.id === goalId);
        updateView();
      });
    });

    const closeG1 = document.getElementById('btn-close-goal-modal');
    const closeG2 = document.getElementById('btn-close-goal-modal-2');
    if (closeG1) closeG1.addEventListener('click', () => { activeGoalModal = null; updateView(); });
    if (closeG2) closeG2.addEventListener('click', () => { activeGoalModal = null; updateView(); });

    // Execute decision directly from Goal modal
    const execGoalRecBtns = document.querySelectorAll('.btn-exec-goal-rec');
    execGoalRecBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const recId = btn.dataset.recId;
        applyRecommendation(recId);
        showToast("Rekomendasi berhasil dieksekusi! Progres target telah diperbarui.", "success");
        activeGoalModal = null;
        updateView();
      });
    });

    // Stage H: Report Category Filter
    const reportCatBtns = document.querySelectorAll('#report-cat-filter-bar button');
    reportCatBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        reportCategoryFilter = btn.dataset.cat;
        updateView();
      });
    });

    const reportBtns = document.querySelectorAll('.btn-preview-report');
    reportBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        activeReportModal = reportCatalog.find(r => r.id === id);
        updateView();
      });
    });

    const closeR1 = document.getElementById('btn-close-report-modal');
    const closeR2 = document.getElementById('btn-close-report-modal-2');
    if (closeR1) closeR1.addEventListener('click', () => { activeReportModal = null; updateView(); });
    if (closeR2) closeR2.addEventListener('click', () => { activeReportModal = null; updateView(); });

    const periodSelect = document.getElementById('report-period-select');
    if (periodSelect) {
      periodSelect.addEventListener('change', (e) => {
        selectedReportPeriod = e.target.value;
        showToast(`Periode laporan diperbarui ke ${e.target.options[e.target.selectedIndex].text}`, "info");
      });
    }

    const downloadPdfBtn = document.getElementById('btn-download-pdf-sim');
    if (downloadPdfBtn) {
      downloadPdfBtn.addEventListener('click', () => {
        showToast("PDF Export — Prototype Simulation", "info");
        setTimeout(() => {
          alert("Laporan PDF berhasil dicetak dan disimulasikan.");
        }, 300);
      });
    }

    const exportCsvBtn = document.getElementById('btn-sim-export-csv');
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => {
        showToast("CSV Export — Prototype Simulation", "success");
      });
    }

    const exportXlsxBtn = document.getElementById('btn-sim-export-xlsx');
    if (exportXlsxBtn) {
      exportXlsxBtn.addEventListener('click', () => {
        showToast("XLSX Export — Prototype Simulation", "success");
      });
    }

    const notifFilterBtns = document.querySelectorAll('#notif-filter-bar button');
    if (notifFilterBtns) {
      notifFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          notifFilter = btn.dataset.filter;
          updateView();
        });
      });
    }

    const markAllBtn = document.getElementById('btn-mark-all-read');
    if (markAllBtn) {
      markAllBtn.addEventListener('click', () => {
        state.notifications.forEach(n => n.read = true);
        showToast('Semua notifikasi ditandai dibaca.', 'info');
        updateView();
      });
    }
  }

  updateView();
}
