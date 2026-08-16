// dashboard.js
// Executive Dashboard Module with 6-Dimension Health Gauge, AI Daily Brief,
// Smart Anomaly Alert Banner, Cash Runway & Working Capital Indicator,
// Active Goal Progress Tracker Strip, Interactive Visual Month Calendar with Custom Events,
// Real-time KPI Cards, and Action Shortcuts.

import { formatCurrency, formatPercent, formatNumber, renderLineChart, showToast, animateCounter } from '../utils.js';
import { applyRecommendation, completeTask, addCustomCalendarEvent, deleteCustomCalendarEvent } from '../state.js';
import { renderContextHelp } from './contextHelp.js';

let currentCalendarMonth = 7; // August (0-indexed: 7)
let currentCalendarYear = 2026;
let currentCalendarFilter = 'all';
let isAlertBannerDismissed = false;

export function renderDashboard(container, state, onNavigate) {
  // Support polymorphic parameter orders
  let targetContainer = container;
  let targetState = state;
  if (container && !container.nodeType && state && state.nodeType) {
    targetContainer = state;
    targetState = container;
  }

  if (!targetState || !targetState.kpis) {
    if (targetContainer) targetContainer.innerHTML = `<div class="card"><p>Memuat data dashboard...</p></div>`;
    return;
  }

  const kpis = targetState.kpis;
  const health = targetState.business_health || { score: 82, status: 'Healthy', components: { revenue: 86, profitability: 81, customers: 84, marketing: 79, inventory: 80, cashflow: 85 } };
  const recommendations = (targetState.recommendations || []).filter(r => r.status === 'pending');
  const tasks = (targetState.tasks || []).filter(t => t.status !== 'completed');
  const goals = targetState.goals || [];
  const cashflow = targetState.cashflow || { balance: 142500000, monthly_burn: 29500000, runway_months: 4.8, status: 'Aman & Sehat' };
  const primaryGoal = goals.length > 0 ? goals[0] : { name: 'Target Omzet Agustus 2026', current: 482000000, target: 500000000, progress: 96.4, deadline: '31 Agu 2026' };

  // Sparkline data from monthly trends
  const revenueTrendData = (targetState.revenue && targetState.revenue.monthly) ? targetState.revenue.monthly.map(m => ({ label: m.month, value: m.revenue })) : [];
  const profitTrendData = (targetState.profit && targetState.profit.monthly) ? targetState.profit.monthly.map(m => ({ label: m.month, value: m.profit })) : [];
  const customerTrendData = (targetState.customers && targetState.customers.monthly) ? targetState.customers.monthly.map(m => ({ label: m.month, value: m.customers })) : [];

  // Determine health color badge
  let healthColor = 'var(--success)';
  let healthBg = 'var(--success-bg)';
  let healthText = 'Sehat & Terkendali';
  if (health.score < 60) {
    healthColor = 'var(--danger)';
    healthBg = 'var(--danger-bg)';
    healthText = 'Perlu Perhatian Kritis';
  } else if (health.score < 80) {
    healthColor = 'var(--warning)';
    healthBg = 'var(--warning-bg)';
    healthText = 'Waspada (Peluang Optimasi)';
  }

  targetContainer.innerHTML = `
    <div class="animate-fade-in" style="display: flex; flex-direction: column; gap: 20px;">
      
      <!-- 1. SMART ANOMALY ALERT BANNER (Feature 2: Peringatan Dini Kritis) -->
      ${!isAlertBannerDismissed ? `
        <div class="card animate-fade-in" id="dashboard-alert-banner" style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, var(--bg-card) 100%); border: 1px solid var(--warning); border-left: 5px solid var(--warning); padding: 14px 18px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <span style="font-size: 1.4rem;">⚠️</span>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <strong style="font-size: 0.92rem; color: var(--text-primary);">Peringatan Dini Operasional AIbo</strong>
                <span class="badge badge-medium" style="font-size: 0.65rem;">Prioritas Tinggi</span>
              </div>
              <p style="font-size: 0.82rem; color: var(--text-secondary); margin: 2px 0 0 0;">
                Stok <strong>House Blend 1kg</strong> tersisa 14 unit (Estimasi habis 3 hari lagi) dan ROI <strong>TikTok Ads</strong> menurun ke 1.8x.
              </p>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <button class="btn btn-sm btn-primary" id="btn-alert-reorder" style="font-size: 0.78rem; font-weight: 700; padding: 6px 12px;">
              📦 Reorder Stok ➔
            </button>
            <button class="btn btn-sm btn-secondary" id="btn-alert-optimize-ads" style="font-size: 0.78rem; font-weight: 600; padding: 6px 12px;">
              ⚡ Optimasi Iklan
            </button>
            <button class="btn btn-sm btn-secondary" id="btn-dismiss-alert" style="padding: 6px 8px;" title="Tutup Peringatan">&times;</button>
          </div>
        </div>
      ` : ''}

      <!-- Top Executive Brief & Financial Runway Header -->
      <div class="dashboard-header-flex" style="display: flex; justify-content: space-between; align-items: stretch; gap: 20px; flex-wrap: wrap;">
        
        <!-- Health Score Circular Gauge Card -->
        <div class="card health-gauge-card animate-fade-in" id="card-health-gauge" style="flex: 1.1; min-width: 280px; display: flex; align-items: center; gap: 18px; cursor: pointer; border-left: 4px solid ${healthColor}; background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%);" title="Klik untuk membuka detail 6 dimensi kesehatan">
          <div style="position: relative; width: 100px; height: 100px; flex-shrink: 0;">
            <svg viewBox="0 0 100 100" style="transform: rotate(-90deg); width: 100%; height: 100%;">
              <circle cx="50" cy="50" r="42" stroke="var(--border-color)" stroke-width="9" fill="none" opacity="0.4" />
              <circle cx="50" cy="50" r="42" stroke="${healthColor}" stroke-width="9" fill="none"
                stroke-dasharray="264"
                stroke-dashoffset="${264 - (264 * health.score) / 100}"
                stroke-linecap="round" style="transition: stroke-dashoffset 1s ease-in-out;" />
            </svg>
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;">
              <span style="font-size: 1.6rem; font-weight: 800; font-family: var(--font-heading); color: ${healthColor}; line-height: 1;">${health.score}</span>
              <span style="font-size: 0.62rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">/ 100</span>
            </div>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span class="badge" style="background-color: ${healthBg}; color: ${healthColor}; font-size: 0.72rem; font-weight: 700;">
                ● ${healthText}
              </span>
              <span style="font-size: 0.7rem; color: var(--text-muted);">6 Dimensi</span>
            </div>
            <h2 style="font-size: 1.05rem; font-weight: 700; margin: 2px 0;">Skor Kesehatan Bisnis ${renderContextHelp('business_health')}</h2>
            <p style="font-size: 0.76rem; color: var(--text-secondary); line-height: 1.35; margin: 0;">
              Kondisi operasional Nusa Brew sangat prima. Klik untuk evaluasi 6 pilar.
            </p>
          </div>
        </div>

        <!-- 2. CASH RUNWAY & WORKING CAPITAL INDICATOR (Feature 1: Indikator Kas & Runway) -->
        <div class="card animate-fade-in" style="flex: 1.1; min-width: 280px; display: flex; flex-direction: column; justify-content: space-between; gap: 10px; background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, var(--bg-card) 100%); border-left: 4px solid var(--success);">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 1.1rem;">💵</span>
              <strong style="font-size: 0.9rem; color: var(--text-primary);">Kas Cair & Runway ${renderContextHelp('cash_flow')}</strong>
            </div>
            <span class="badge badge-low" style="font-size: 0.65rem;">${cashflow.status}</span>
          </div>

          <div>
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <span style="font-size: 1.3rem; font-weight: 800; font-family: var(--font-heading); color: var(--success);">${formatCurrency(cashflow.balance)}</span>
              <span style="font-size: 0.8rem; font-weight: 700; color: var(--text-primary);">Runway: ${cashflow.runway_months} Bulan</span>
            </div>
            <div style="width: 100%; height: 6px; background: var(--border-color); border-radius: 3px; overflow: hidden; margin: 6px 0;">
              <div style="width: ${Math.min(100, (cashflow.runway_months / 6) * 100)}%; height: 100%; background: var(--success);"></div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted);">
            <span>Arus Masuk: <strong style="color: var(--success);">${formatCurrency(cashflow.inflow || 482000000)}</strong></span>
            <span>Biaya Ops: <strong style="color: var(--danger);">${formatCurrency(cashflow.outflow || 385600000)}</strong></span>
          </div>
        </div>

        <!-- AI Daily Executive Brief Card -->
        <div class="card animate-fade-in" style="flex: 1.8; min-width: 320px; display: flex; flex-direction: column; justify-content: space-between; gap: 10px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, var(--bg-card) 100%); border: 1px solid var(--border-color);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 28px; height: 28px; border-radius: 6px; background: var(--ai-primary-glow); display: flex; align-items: center; justify-content: center; font-size: 1rem;">
                ✨
              </div>
              <div>
                <strong style="font-size: 0.95rem; color: var(--text-primary);">Ringkasan Harian AIbo (AI Daily Brief)</strong>
                <span style="font-size: 0.72rem; color: var(--text-muted); display: block;">Update per 16 Agustus 2026</span>
              </div>
            </div>
            <span class="badge" style="background: var(--ai-primary-glow); color: var(--ai-primary); font-size: 0.7rem;">AI Copilot Aktif</span>
          </div>

          <p style="font-size: 0.83rem; color: var(--text-secondary); line-height: 1.45; margin: 0;">
            Omzet Agustus mencapai <strong>${formatCurrency(kpis.revenue.current)}</strong> (+${kpis.revenue.change_percent}%). Ada <strong>${recommendations.length} rekomendasi strategis</strong> untuk realokasi iklan dan restock 2 SKU produk kopi agar target laba tercapai optimal.
          </p>

          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn btn-primary btn-sm" id="btn-view-brief-recs" style="font-size: 0.78rem; padding: 6px 12px;">
              ⚡ Tinjau Rekomendasi (${recommendations.length})
            </button>
            <button class="btn btn-secondary btn-sm" id="btn-view-analytics-shortcut" style="font-size: 0.78rem; padding: 6px 12px;">
              📈 Eksplorasi 6-Tab Analitik
            </button>
          </div>
        </div>

      </div>

      <!-- 3. ACTIVE GOAL PROGRESS TRACKER STRIP (Feature 3: Strip Target Utama) -->
      <div class="card animate-fade-in" id="dashboard-goal-strip" style="background: var(--bg-primary); border: 1px solid var(--border-color); padding: 12px 18px; cursor: pointer; transition: transform 0.2s ease, border-color 0.2s ease;" title="Klik untuk membuka rincian faktor pendorong target">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 6px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.1rem;">🎯</span>
            <strong style="font-size: 0.88rem; color: var(--text-primary);">${primaryGoal.name}</strong>
            <span class="badge badge-low" style="font-size: 0.65rem;">On Track</span>
          </div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">
            Progres: <strong style="color: var(--primary); font-size: 0.92rem;">${primaryGoal.progress || 96.4}%</strong> (${formatCurrency(primaryGoal.current || 482000000)} / ${formatCurrency(primaryGoal.target || 500000000)}) • <span style="color: var(--text-secondary);">Sisa 15 Hari</span>
          </div>
        </div>

        <div style="width: 100%; height: 8px; background: var(--border-color); border-radius: 4px; overflow: hidden; margin-bottom: 4px;">
          <div style="width: ${Math.min(100, primaryGoal.progress || 96.4)}%; height: 100%; background: linear-gradient(90deg, var(--primary) 0%, var(--ai-primary) 100%); border-radius: 4px;"></div>
        </div>

        <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted);">
          <span>💡 Proyeksi AIbo: <strong>Rp 512.000.000 (+2.4% melampaui target)</strong> jika realokasi iklan dieksekusi.</span>
          <span style="color: var(--primary); font-weight: 600;">Lihat Rincian Drivers ➔</span>
        </div>
      </div>

      <!-- Core KPI Dashboard Grid -->
      <div class="grid-4">
        
        <!-- Revenue KPI -->
        <div class="card kpi-card clickable-kpi" data-kpi="revenue" style="cursor: pointer;" title="Klik untuk detail breakdown omset">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.8rem; color: var(--text-secondary); font-weight: 500;">Total Omset</span>
            <span style="font-size: 0.7rem; color: var(--primary);">🔍</span>
          </div>
          <div class="kpi-val" id="kpi-revenue-val">${formatCurrency(kpis.revenue.current)}</div>
          <div class="kpi-change change-up">
            ▲ ${kpis.revenue.change_percent}% <span style="color: var(--text-muted); font-size: 0.75rem;">vs bulan lalu</span>
          </div>
          <div class="svg-chart-container" style="height: 45px; margin-top: 8px;">
            ${renderLineChart(revenueTrendData.slice(-4), 160, 45, 'var(--primary)')}
          </div>
        </div>

        <!-- Profit KPI -->
        <div class="card kpi-card clickable-kpi" data-kpi="profit" style="cursor: pointer;" title="Klik untuk detail laba bersih">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.8rem; color: var(--text-secondary); font-weight: 500;">Laba Bersih ${renderContextHelp('net_profit')}</span>
            <span style="font-size: 0.7rem; color: var(--success);">🔍</span>
          </div>
          <div class="kpi-val" id="kpi-profit-val">${formatCurrency(kpis.profit.current)}</div>
          <div class="kpi-change change-up">
            ▲ ${kpis.profit.change_percent}% <span style="color: var(--text-muted); font-size: 0.75rem;">vs target</span>
          </div>
          <div class="svg-chart-container" style="height: 45px; margin-top: 8px;">
            ${renderLineChart(profitTrendData.slice(-4), 160, 45, 'var(--success)')}
          </div>
        </div>

        <!-- Customers KPI -->
        <div class="card kpi-card clickable-kpi" data-kpi="customers" style="cursor: pointer;" title="Klik untuk detail pelanggan">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.8rem; color: var(--text-secondary); font-weight: 500;">Total Pelanggan ${renderContextHelp('retention')}</span>
            <span style="font-size: 0.7rem; color: var(--ai-primary);">🔍</span>
          </div>
          <div class="kpi-val" id="kpi-customers-val">${formatNumber(kpis.customers.current)}</div>
          <div class="kpi-change change-up">
            ▲ ${kpis.customers.change_percent}% <span style="color: var(--text-muted); font-size: 0.75rem;">akuisisi</span>
          </div>
          <div class="svg-chart-container" style="height: 45px; margin-top: 8px;">
            ${renderLineChart(customerTrendData.slice(-4), 160, 45, 'var(--ai-primary)')}
          </div>
        </div>

        <!-- Inventory KPI -->
        <div class="card kpi-card clickable-kpi" data-kpi="inventory" style="cursor: pointer;" title="Klik untuk detail stok">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 0.8rem; color: var(--text-secondary); font-weight: 500;">Kesehatan Stok</span>
            <span style="font-size: 0.7rem; color: var(--warning);">🔍</span>
          </div>
          <div class="kpi-val">${formatPercent(kpis.inventory_health.current)}</div>
          <div class="kpi-change ${kpis.inventory_health.current >= kpis.inventory_health.target ? 'change-up' : 'change-down'}" style="color: ${kpis.inventory_health.current >= kpis.inventory_health.target ? 'var(--success)' : 'var(--warning)'};">
            ● Target: ${kpis.inventory_health.target}%
          </div>
          <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 8px; display: flex; justify-content: space-between;">
            <span>SKU Stok Rendah:</span>
            <strong style="color: ${(targetState.inventory?.low_stock_skus || 0) > 0 ? 'var(--danger)' : 'var(--text-primary)'};">${targetState.inventory?.low_stock_skus || 0} SKU</strong>
          </div>
        </div>

      </div>

      <!-- 4. INTERACTIVE VISUAL CALENDAR & CUSTOM EVENTS (Feature 4: Tambah Catatan & Agenda) -->
      <div class="card animate-fade-in" style="margin-bottom: 0;">
        <div class="card-title" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.15rem;">📅</span>
            <div>
              <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary); margin: 0;">Kalender Agenda Bisnis & Timeline Tindakan</h3>
              <span style="font-size: 0.72rem; color: var(--text-muted);">Jadwal kampanye, batas stok, tugas tim, dan catatan mandiri</span>
            </div>
          </div>

          <!-- Calendar Controls & Add Event Button -->
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            
            <!-- Add Custom Event Button -->
            <button class="btn btn-sm btn-primary" id="btn-open-add-event-modal" style="font-size: 0.78rem; font-weight: 700; padding: 6px 12px;">
              ➕ Tambah Agenda / Catatan
            </button>

            <!-- Month Switcher -->
            <div style="display: flex; align-items: center; gap: 4px; background: var(--bg-primary); padding: 4px 8px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
              <button class="btn btn-secondary btn-sm" id="btn-cal-prev" style="padding: 2px 8px; font-size: 0.75rem;">◀</button>
              <strong style="font-size: 0.8rem; min-width: 95px; text-align: center;" id="cal-month-label">Agustus 2026</strong>
              <button class="btn btn-secondary btn-sm" id="btn-cal-next" style="padding: 2px 8px; font-size: 0.75rem;">▶</button>
            </div>
          </div>
        </div>

        <!-- Filter Categories Pill Bar -->
        <div style="display: flex; gap: 6px; margin-bottom: 14px; flex-wrap: wrap;" id="calendar-filter-bar">
          <button class="btn btn-sm ${currentCalendarFilter === 'all' ? 'active-cal-filter' : 'btn-secondary'}" data-filter="all" style="font-size: 0.75rem; padding: 4px 10px;">Semua</button>
          <button class="btn btn-sm ${currentCalendarFilter === 'marketing' ? 'active-cal-filter' : 'btn-secondary'}" data-filter="marketing" style="font-size: 0.75rem; padding: 4px 10px;">📢 Marketing Ads</button>
          <button class="btn btn-sm ${currentCalendarFilter === 'inventory' ? 'active-cal-filter' : 'btn-secondary'}" data-filter="inventory" style="font-size: 0.75rem; padding: 4px 10px;">📦 Reorder Stok</button>
          <button class="btn btn-sm ${currentCalendarFilter === 'tasks' ? 'active-cal-filter' : 'btn-secondary'}" data-filter="tasks" style="font-size: 0.75rem; padding: 4px 10px;">🎯 Tugas Tim</button>
          <button class="btn btn-sm ${currentCalendarFilter === 'custom' ? 'active-cal-filter' : 'btn-secondary'}" data-filter="custom" style="font-size: 0.75rem; padding: 4px 10px;">📝 Catatan Mandiri</button>
          <button class="btn btn-sm ${currentCalendarFilter === 'goals' ? 'active-cal-filter' : 'btn-secondary'}" data-filter="goals" style="font-size: 0.75rem; padding: 4px 10px;">🏁 Target Goals</button>
        </div>

        <!-- 7-Column Visual Month Calendar Grid -->
        <div id="visual-calendar-grid-wrapper">
          ${renderVisualMonthCalendar(currentCalendarMonth, currentCalendarYear, currentCalendarFilter, targetState.custom_events || [])}
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; font-size: 0.72rem; color: var(--text-muted); border-top: 1px solid var(--border-color); padding-top: 8px;">
          <span>💡 <strong>Tips:</strong> Klik pada tanggal mana pun untuk melihat rincian agenda atau menambahkan catatan kustom baru.</span>
          <span style="color: var(--ai-primary); font-weight: 600;">Sinkronisasi Real-time ✓</span>
        </div>
      </div>

      <!-- Split 2-Column: Key Recommendations & Pending Tasks -->
      <div style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 20px; align-items: start;">
        
        <!-- Left: AI Recommendations List -->
        <div class="card animate-fade-in">
          <div class="card-title" style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span>💡 Rekomendasi Prioritas AIbo</span>
              <span class="badge badge-high" style="font-size: 0.65rem;">${recommendations.length} Pending</span>
            </div>
            <a id="btn-goto-decision" style="font-size: 0.78rem; color: var(--primary); cursor: pointer; font-weight: 600;">Lihat Semua ➔</a>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
            ${recommendations.slice(0, 2).map(r => `
              <div style="background: var(--bg-primary); border: 1px solid var(--border-color); border-left: 4px solid var(--primary); padding: 14px; border-radius: var(--radius-sm); display: flex; flex-direction: column; gap: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                  <strong style="font-size: 0.9rem; color: var(--text-primary); font-family: var(--font-display);">${r.title}</strong>
                  <span class="badge badge-low" style="font-size: 0.65rem;">${r.confidence}% Keyakinan</span>
                </div>
                <p style="font-size: 0.78rem; color: var(--text-secondary); margin: 0; line-height: 1.4;">${r.financial_impact}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                  <span style="font-size: 0.72rem; color: var(--text-muted);">Estimasi Upaya: <strong>${r.effort}</strong></span>
                  <div style="display: flex; gap: 6px;">
                    <button class="btn btn-secondary btn-sm btn-view-rec-detail" data-id="${r.id}" style="font-size: 0.72rem; padding: 4px 8px;">
                      Bukti Data
                    </button>
                    <button class="btn btn-primary btn-sm btn-apply-rec" data-id="${r.id}" style="font-size: 0.72rem; padding: 4px 8px;">
                      Terapkan ⚡
                    </button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Right: Action Checklist & Tasks -->
        <div class="card animate-fade-in">
          <div class="card-title" style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span>🎯 Tindakan & Tugas Tim</span>
              <span class="badge badge-medium" style="font-size: 0.65rem;">${tasks.length} Terbuka</span>
            </div>
            <a id="btn-goto-actions" style="font-size: 0.78rem; color: var(--primary); cursor: pointer; font-weight: 600;">Action Center ➔</a>
          </div>

          <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px;">
            ${tasks.slice(0, 4).map(t => `
              <div style="display: flex; align-items: center; gap: 10px; background: var(--bg-primary); padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                <div class="custom-checkbox btn-checkbox-complete" data-id="${t.id}" style="cursor: pointer; width: 18px; height: 18px; border-radius: 4px; border: 2px solid var(--border-color); display: flex; align-items: center; justify-content: center; flex-shrink: 0;" title="Tandai selesai">
                </div>
                <div style="flex: 1; min-width: 0;">
                  <span style="font-size: 0.82rem; font-weight: 600; color: var(--text-primary); display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${t.title}</span>
                  <span style="font-size: 0.7rem; color: var(--text-muted);">PIC: ${t.assignee} • Tenggat: ${t.due_date}</span>
                </div>
                <span class="badge ${t.priority === 'High' ? 'badge-high' : 'badge-low'}" style="font-size: 0.6rem;">${t.priority}</span>
              </div>
            `).join('')}
          </div>
        </div>

      </div>

    </div>

    <!-- Health Dimension Detail Modal -->
    <div id="health-detail-modal" class="modal-overlay" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.75); backdrop-filter: blur(6px); z-index: 1050; align-items: center; justify-content: center; padding: 20px;">
      <div class="card animate-fade-in" style="width: 100%; max-width: 580px; background-color: var(--bg-secondary); border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 16px; max-height: 90vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
          <div>
            <h3 style="font-size: 1.2rem; font-weight: 700; color: ${healthColor};">Evaluasi 6 Dimensi Kesehatan Bisnis</h3>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Skor Agregat Terbobot: ${health.score} / 100 (${healthText})</span>
          </div>
          <button id="btn-close-health-modal" style="background: none; border: none; color: var(--text-secondary); font-size: 1.4rem; cursor: pointer;">&times;</button>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${renderHealthDimensionRow('💰 Revenue (Pertumbuhan Omzet)', health.components.revenue, 'Omset tumbuh +11.8% vs bulan lalu. Sangat sehat.')}
          ${renderHealthDimensionRow('📊 Profitabilitas (Margin Bersih)', health.components.profitability, 'Margin laba 20.0% melampaui target minimum (18%).')}
          ${renderHealthDimensionRow('👥 Pelanggan & Retensi', health.components.customers, 'Retensi pelanggan 68.2% stabil di atas benchmark industri.')}
          ${renderHealthDimensionRow('📣 Efektivitas Pemasaran (ROI)', health.components.marketing, 'Email marketing sangat tinggi (ROI 6.0x), namun TikTok perlu realokasi.')}
          ${renderHealthDimensionRow('📦 Kesehatan Persediaan (Stok)', health.components.inventory, '2 SKU produk berada di bawah batas minimum (reorder point).')}
          ${renderHealthDimensionRow('💵 Arus Kas (Cash Flow & Runway)', health.components.cashflow || 85, 'Runway kas 4.8 bulan dengan arus kas operasional positif.')}
        </div>

        <div style="background: var(--bg-primary); padding: 12px 16px; border-radius: var(--radius-sm); border-left: 4px solid var(--ai-primary); font-size: 0.83rem; color: var(--text-secondary);">
          💡 <strong>Rekomendasi AIbo:</strong> Lakukan pengisian stok House Blend 1kg dan optimasi campaign Email untuk mempertahankan skor kesehatan di atas 80+.
        </div>
      </div>
    </div>

    <!-- Generic Modal Container for Calendar / KPI Details / Custom Events -->
    <div id="dashboard-detail-modal" class="modal-overlay" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.75); backdrop-filter: blur(6px); z-index: 1050; align-items: center; justify-content: center; padding: 20px;">
      <div class="card animate-fade-in" style="width: 100%; max-width: 540px; background-color: var(--bg-secondary); border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 16px; max-height: 90vh; overflow-y: auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
          <h3 id="dash-modal-title" style="font-size: 1.15rem; font-weight: 700;">Detail Agenda / Metric</h3>
          <button id="btn-close-dash-modal" style="background: none; border: none; color: var(--text-secondary); font-size: 1.4rem; cursor: pointer;">&times;</button>
        </div>
        <div id="dash-modal-body" style="font-size: 0.88rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 12px;">
        </div>
      </div>
    </div>
  `;

  bindEvents(targetState, onNavigate);
}

// Helper: Render 6 Dimensions in Health Modal
function renderHealthDimensionRow(name, score, statusText) {
  let color = 'var(--success)';
  if (score < 60) color = 'var(--danger)';
  else if (score < 80) color = 'var(--warning)';

  return `
    <div style="display: flex; flex-direction: column; gap: 4px; background: var(--bg-primary); padding: 10px 14px; border-radius: 6px;">
      <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600;">
        <span>${name}</span>
        <span style="color: ${color};">${score} / 100</span>
      </div>
      <div style="width: 100%; height: 6px; background: var(--border-color); border-radius: 3px; overflow: hidden; margin: 4px 0;">
        <div style="width: ${score}%; height: 100%; background: ${color}; border-radius: 3px;"></div>
      </div>
      <span style="font-size: 0.75rem; color: var(--text-muted);">${statusText}</span>
    </div>
  `;
}

// Master Calendar Events Data (System Generated)
const masterCalendarEvents = [
  { id: 'ev_001', day: 17, month: 7, year: 2026, type: 'marketing', title: '🇮🇩 Promo Kemerdekaan Kopi Merdeka', time: '08:00 - 22:00', priority: 'High', desc: 'Diskon 17% all espresso-based beverages via POS & Tokopedia.' },
  { id: 'ev_002', day: 20, month: 7, year: 2026, type: 'marketing', title: '📢 Realokasi Ad Spend TikTok -> Email', time: '10:00 WIB', priority: 'High', desc: 'Memindahkan budget Rp 5.000.000 ke Email Campaign member untuk mengejar ROI 6.0x.' },
  { id: 'ev_003', day: 22, month: 7, year: 2026, type: 'inventory', title: '📦 Reorder Stok House Blend 1kg', time: '14:00 WIB', priority: 'High', desc: 'Restock 20 pack biji kopi House Blend 1kg dari supplier Java Roastery.' },
  { id: 'ev_004', day: 24, month: 7, year: 2026, type: 'tasks', title: '🎯 Review Campaign TikTok Ads', time: '16:00 WIB', priority: 'Medium', desc: 'Evaluasi CTR video kreator dan audit biaya CPA sebelum penutupan akhir bulan.' },
  { id: 'ev_005', day: 25, month: 7, year: 2026, type: 'inventory', title: '📦 Reorder Matcha Latte Powder', time: '11:00 WIB', priority: 'Medium', desc: 'Restock 15 kg Matcha Powder Uji Japan untuk stok menu non-kopi.' },
  { id: 'ev_006', day: 28, month: 7, year: 2026, type: 'tasks', title: '🎯 Follow-up Pembayaran B2B Corporate', time: '13:30 WIB', priority: 'Medium', desc: 'Kirim invoice dan follow-up penagihan supply beans ke 3 kantor mitra.' },
  { id: 'ev_007', day: 31, month: 7, year: 2026, type: 'goals', title: '🏁 Evaluasi Target Omzet Bulanan (Goal Review)', time: '17:00 WIB', priority: 'High', desc: 'Closing buku akhir bulan Agustus dan sinkronisasi target omzet Rp 500 Juta.' }
];

// Render Interactive Visual Month Calendar (7 Columns: Sen, Sel, Rab, Kam, Jum, Sab, Min)
function renderVisualMonthCalendar(monthIndex, year, filter, customEvents = []) {
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  
  // Total days in August (31 days). Aug 1 2026 is Saturday (Index 5 in 0-indexed Mon-Sun).
  const totalDays = 31;
  const startDayOffset = 5; // 0: Sen, 1: Sel, 2: Rab, 3: Kam, 4: Jum, 5: Sab, 6: Min

  // Combine system events and custom user events
  const allEvents = [
    ...masterCalendarEvents,
    ...customEvents.map(c => {
      const parts = (c.date || '').split('-');
      const d = parts.length === 3 ? parseInt(parts[2], 10) : 16;
      return {
        id: c.id,
        day: d,
        month: 7, // August
        year: 2026,
        type: 'custom',
        title: `📝 ${c.title}`,
        time: c.time || '09:00 WIB',
        priority: 'Medium',
        desc: c.notes || 'Catatan agenda mandiri.',
        isCustom: true
      };
    })
  ];

  // Filter events
  const filteredEvents = filter === 'all' 
    ? allEvents 
    : allEvents.filter(e => e.type === filter);

  let gridCells = '';

  // 1. Day headers (Sen - Min)
  const headerHtml = `
    <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; margin-bottom: 6px; text-align: center;">
      ${dayNames.map(d => `<div style="font-size: 0.72rem; font-weight: 700; color: var(--text-muted); padding: 4px;">${d}</div>`).join('')}
    </div>
  `;

  // 2. Empty cells before month start
  for (let i = 0; i < startDayOffset; i++) {
    gridCells += `
      <div style="min-height: 75px; background: var(--bg-primary); opacity: 0.3; border-radius: var(--radius-sm); border: 1px dashed var(--border-color); padding: 6px;">
        <span style="font-size: 0.7rem; color: var(--text-muted);">${26 + i}</span>
      </div>
    `;
  }

  // 3. Month day cells (1 - 31)
  for (let day = 1; day <= totalDays; day++) {
    const dayEvents = filteredEvents.filter(e => e.day === day && e.month === monthIndex && e.year === year);
    const isToday = day === 16; // Simulated active date: 16 Aug 2026

    let eventPills = '';
    if (dayEvents.length > 0) {
      eventPills = dayEvents.map(e => {
        let color = '#ec4899';
        if (e.type === 'inventory') color = '#f59e0b';
        else if (e.type === 'tasks') color = '#6366f1';
        else if (e.type === 'goals') color = '#10b981';
        else if (e.type === 'custom') color = '#06b6d4';

        return `
          <div class="cal-event-pill" data-event-id="${e.id}" style="background: ${color}22; border-left: 3px solid ${color}; padding: 2px 4px; border-radius: 3px; font-size: 0.65rem; color: var(--text-primary); font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; cursor: pointer; margin-top: 2px;" title="${e.title} (${e.time})">
            ${e.title}
          </div>
        `;
      }).join('');
    }

    gridCells += `
      <div class="cal-day-cell ${isToday ? 'cal-today-cell' : ''}" data-day="${day}" style="min-height: 75px; background: ${isToday ? 'var(--ai-primary-glow)' : 'var(--bg-primary)'}; border: 1px solid ${isToday ? 'var(--ai-primary)' : 'var(--border-color)'}; border-radius: var(--radius-sm); padding: 6px; display: flex; flex-direction: column; justify-content: space-between; cursor: pointer; transition: all 0.2s ease;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-size: 0.75rem; font-weight: ${isToday ? '800' : '600'}; color: ${isToday ? 'var(--ai-primary)' : 'var(--text-primary)'};">${day}</span>
          ${isToday ? '<span style="font-size: 0.58rem; background: var(--ai-primary); color: white; padding: 1px 4px; border-radius: 3px; font-weight: 700;">HARI INI</span>' : ''}
        </div>
        <div style="display: flex; flex-direction: column; gap: 2px; flex: 1; margin-top: 4px;">
          ${eventPills}
        </div>
      </div>
    `;
  }

  return `
    ${headerHtml}
    <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px;" id="visual-calendar-grid">
      ${gridCells}
    </div>
  `;
}

function bindEvents(state, onNavigate) {
  // Alert Banner Bindings
  const dismissAlertBtn = document.getElementById('btn-dismiss-alert');
  const alertBanner = document.getElementById('dashboard-alert-banner');
  if (dismissAlertBtn && alertBanner) {
    dismissAlertBtn.addEventListener('click', () => {
      isAlertBannerDismissed = true;
      alertBanner.style.display = 'none';
      showToast('Peringatan disembunyikan untuk sesi ini.', 'info');
    });
  }

  const alertReorderBtn = document.getElementById('btn-alert-reorder');
  if (alertReorderBtn) {
    alertReorderBtn.addEventListener('click', () => onNavigate('action'));
  }

  const alertOptimizeAdsBtn = document.getElementById('btn-alert-optimize-ads');
  if (alertOptimizeAdsBtn) {
    alertOptimizeAdsBtn.addEventListener('click', () => onNavigate('decision'));
  }

  // Active Goal Progress Tracker Strip Click -> Jumps to Action / Opens Goal Detail
  const goalStrip = document.getElementById('dashboard-goal-strip');
  if (goalStrip) {
    goalStrip.addEventListener('click', () => onNavigate('action'));
  }

  // Health Gauge Click -> Detail Modal
  const healthCard = document.getElementById('card-health-gauge');
  const healthModal = document.getElementById('health-detail-modal');
  const closeHealthModalBtn = document.getElementById('btn-close-health-modal');

  if (healthCard && healthModal) {
    healthCard.addEventListener('click', () => {
      healthModal.style.display = 'flex';
    });
  }

  if (closeHealthModalBtn && healthModal) {
    closeHealthModalBtn.addEventListener('click', () => {
      healthModal.style.display = 'none';
    });
  }

  // Clickable KPI Cards -> Drilldown Modal
  const kpiCards = document.querySelectorAll('.clickable-kpi');
  const dashModal = document.getElementById('dashboard-detail-modal');
  const closeDashModalBtn = document.getElementById('btn-close-dash-modal');
  const modalTitle = document.getElementById('dash-modal-title');
  const modalBody = document.getElementById('dash-modal-body');

  if (kpiCards && dashModal) {
    kpiCards.forEach(card => {
      card.addEventListener('click', () => {
        const kpiType = card.dataset.kpi;
        if (kpiType === 'revenue') {
          modalTitle.textContent = "📈 Detail Omset Penjualan";
          modalBody.innerHTML = `
            <div style="display: flex; justify-content: space-between;"><span>Omset Bulan Ini:</span><strong>${formatCurrency(state.kpis.revenue.current)}</strong></div>
            <div style="display: flex; justify-content: space-between;"><span>Omset Bulan Lalu:</span><span>${formatCurrency(state.kpis.revenue.previous)}</span></div>
            <div style="display: flex; justify-content: space-between;"><span>Target Omset:</span><span>${formatCurrency(state.kpis.revenue.target)}</span></div>
            <div style="background: var(--bg-primary); padding: 10px; border-radius: 6px; margin-top: 8px;">
              <strong>Pendorong Utama:</strong> Penjualan produk Tokopedia tumbuh +24.5% dan transaksi POS outlet stabil di 45% dari total omset.
            </div>
            <button class="btn btn-primary" id="btn-modal-open-analytics" style="margin-top: 8px; width: 100%;">Buka Analitik Omset Lengkap ➔</button>
          `;
        } else if (kpiType === 'profit') {
          modalTitle.textContent = "📊 Detail Laba Bersih & Margin";
          modalBody.innerHTML = `
            <div style="display: flex; justify-content: space-between;"><span>Laba Bersih:</span><strong>${formatCurrency(state.kpis.profit.current)}</strong></div>
            <div style="display: flex; justify-content: space-between;"><span>Margin Laba:</span><span>${state.kpis.profit_margin.current}%</span></div>
            <div style="display: flex; justify-content: space-between;"><span>Target Laba:</span><span>${formatCurrency(state.kpis.profit.target)}</span></div>
            <div style="background: var(--bg-primary); padding: 10px; border-radius: 6px; margin-top: 8px;">
              <strong>Pendorong Utama:</strong> Efisiensi biaya bahan baku dan pertumbuhan volume retail menghasilkan margin 20.0%.
            </div>
            <button class="btn btn-primary" id="btn-modal-open-analytics" style="margin-top: 8px; width: 100%;">Buka Analitik Profitabilitas ➔</button>
          `;
        } else if (kpiType === 'customers') {
          modalTitle.textContent = "👥 Detail Pelanggan & Retensi";
          modalBody.innerHTML = `
            <div style="display: flex; justify-content: space-between;"><span>Total Pelanggan Aktif:</span><strong>${formatNumber(state.kpis.customers.current)}</strong></div>
            <div style="display: flex; justify-content: space-between;"><span>Pelanggan Baru Bulan Ini:</span><span>${formatNumber(state.customers.summary.new_this_month)}</span></div>
            <div style="display: flex; justify-content: space-between;"><span>Tingkat Retensi:</span><span>${state.customers.summary.retention_rate}%</span></div>
            <div style="background: var(--bg-primary); padding: 10px; border-radius: 6px; margin-top: 8px;">
              <strong>Pendorong Utama:</strong> Loyalitas pelanggan repeat order di outlet dan program membership via WhatsApp/Email.
            </div>
            <button class="btn btn-primary" id="btn-modal-open-analytics" style="margin-top: 8px; width: 100%;">Buka Analitik Pelanggan ➔</button>
          `;
        } else if (kpiType === 'inventory') {
          modalTitle.textContent = "📦 Detail Kesehatan Stok Produk";
          modalBody.innerHTML = `
            <div style="display: flex; justify-content: space-between;"><span>Skor Kesehatan Stok:</span><strong>${state.kpis.inventory_health.current}%</strong></div>
            <div style="display: flex; justify-content: space-between;"><span>SKU Stok Kritis (Reorder):</span><span style="color: var(--danger); font-weight: bold;">${state.inventory?.low_stock_skus || 2} SKU</span></div>
            <div style="display: flex; justify-content: space-between;"><span>Target Kesehatan:</span><span>${state.kpis.inventory_health.target}%</span></div>
            <div style="background: var(--bg-primary); padding: 10px; border-radius: 6px; margin-top: 8px;">
              <strong>Pendorong Utama:</strong> 2 produk (House Blend 1kg & Matcha Powder) menyentuh reorder point dan perlu restock segera.
            </div>
            <button class="btn btn-primary" id="btn-modal-open-analytics" style="margin-top: 8px; width: 100%;">Buka Analitik Persediaan ➔</button>
          `;
        }
        dashModal.style.display = 'flex';

        const openAnalyticsBtn = document.getElementById('btn-modal-open-analytics');
        if (openAnalyticsBtn) {
          openAnalyticsBtn.addEventListener('click', () => {
            dashModal.style.display = 'none';
            onNavigate('analytics');
          });
        }
      });
    });
  }

  // Calendar Event / Day Cell Clicks -> Opens Modal
  bindCalendarCellEvents(state, dashModal, modalTitle, modalBody, onNavigate);

  // Add Custom Event Modal Trigger
  const openAddEventBtn = document.getElementById('btn-open-add-event-modal');
  if (openAddEventBtn && dashModal && modalTitle && modalBody) {
    openAddEventBtn.addEventListener('click', () => {
      renderAddEventForm(16, dashModal, modalTitle, modalBody, state, onNavigate);
    });
  }

  // Calendar Month Navigation
  const prevMonthBtn = document.getElementById('btn-cal-prev');
  const nextMonthBtn = document.getElementById('btn-cal-next');
  const monthLabel = document.getElementById('cal-month-label');
  const calGridWrapper = document.getElementById('visual-calendar-grid-wrapper');

  if (prevMonthBtn && nextMonthBtn && monthLabel && calGridWrapper) {
    prevMonthBtn.addEventListener('click', () => {
      currentCalendarMonth = Math.max(0, currentCalendarMonth - 1);
      monthLabel.textContent = currentCalendarMonth === 6 ? 'Juli 2026' : (currentCalendarMonth === 7 ? 'Agustus 2026' : 'Juni 2026');
      calGridWrapper.innerHTML = renderVisualMonthCalendar(currentCalendarMonth, currentCalendarYear, currentCalendarFilter, state.custom_events || []);
      bindCalendarCellEvents(state, dashModal, modalTitle, modalBody, onNavigate);
    });

    nextMonthBtn.addEventListener('click', () => {
      currentCalendarMonth = Math.min(11, currentCalendarMonth + 1);
      monthLabel.textContent = currentCalendarMonth === 8 ? 'September 2026' : (currentCalendarMonth === 7 ? 'Agustus 2026' : 'Oktober 2026');
      calGridWrapper.innerHTML = renderVisualMonthCalendar(currentCalendarMonth, currentCalendarYear, currentCalendarFilter, state.custom_events || []);
      bindCalendarCellEvents(state, dashModal, modalTitle, modalBody, onNavigate);
    });
  }

  // Calendar Filter Buttons
  const calFilterBtns = document.querySelectorAll('#calendar-filter-bar button');
  if (calFilterBtns && calGridWrapper) {
    calFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        calFilterBtns.forEach(b => {
          b.classList.remove('active-cal-filter');
          b.classList.add('btn-secondary');
        });
        btn.classList.add('active-cal-filter');
        btn.classList.remove('btn-secondary');
        currentCalendarFilter = btn.dataset.filter;
        calGridWrapper.innerHTML = renderVisualMonthCalendar(currentCalendarMonth, currentCalendarYear, currentCalendarFilter, state.custom_events || []);
        bindCalendarCellEvents(state, dashModal, modalTitle, modalBody, onNavigate);
      });
    });
  }

  if (closeDashModalBtn && dashModal) {
    closeDashModalBtn.addEventListener('click', () => {
      dashModal.style.display = 'none';
    });
  }

  // Recommendation Bukti / Detail buttons
  const viewRecDetailBtns = document.querySelectorAll('.btn-view-rec-detail');
  viewRecDetailBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      onNavigate('decision');
    });
  });

  // Apply Recommendation clicks
  const applyButtons = document.querySelectorAll('.btn-apply-rec');
  applyButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const recId = btn.dataset.id;
      applyRecommendation(recId);
      showToast('Rekomendasi berhasil diterapkan! Metrik & target diperbarui.', 'success');
    });
  });

  // Task check clicks (completes task)
  const taskCheckboxes = document.querySelectorAll('.btn-checkbox-complete');
  taskCheckboxes.forEach(box => {
    box.addEventListener('click', (e) => {
      e.stopPropagation();
      const taskId = box.dataset.id;
      box.classList.add('checked');
      box.innerHTML = '✓';
      setTimeout(() => {
        completeTask(taskId);
        showToast('Tugas ditandai selesai! Skor stok diperbarui.', 'success');
      }, 300);
    });
  });

  // Shortcuts
  const viewAnalyticsBtn = document.getElementById('btn-view-analytics-shortcut');
  if (viewAnalyticsBtn) {
    viewAnalyticsBtn.addEventListener('click', () => onNavigate('analytics'));
  }

  const viewBriefRecsBtn = document.getElementById('btn-view-brief-recs');
  if (viewBriefRecsBtn) {
    viewBriefRecsBtn.addEventListener('click', () => onNavigate('decision'));
  }

  const gotoDecisionBtn = document.getElementById('btn-goto-decision');
  if (gotoDecisionBtn) {
    gotoDecisionBtn.addEventListener('click', () => onNavigate('decision'));
  }

  const gotoActionsBtn = document.getElementById('btn-goto-actions');
  if (gotoActionsBtn) {
    gotoActionsBtn.addEventListener('click', () => onNavigate('action'));
  }
}

// Helper: Bind Calendar Cell & Pill clicks to modal
function bindCalendarCellEvents(state, dashModal, modalTitle, modalBody, onNavigate) {
  const dayCells = document.querySelectorAll('.cal-day-cell');
  const eventPills = document.querySelectorAll('.cal-event-pill');
  const customEvents = state.custom_events || [];

  const allEvents = [
    ...masterCalendarEvents,
    ...customEvents.map(c => {
      const parts = (c.date || '').split('-');
      const d = parts.length === 3 ? parseInt(parts[2], 10) : 16;
      return {
        id: c.id,
        day: d,
        month: 7,
        year: 2026,
        type: 'custom',
        title: c.title,
        time: c.time || '09:00 WIB',
        priority: 'Medium',
        desc: c.notes || 'Catatan agenda mandiri.',
        isCustom: true
      };
    })
  ];

  if (dashModal && modalTitle && modalBody) {
    eventPills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        const eventId = pill.dataset.eventId;
        const ev = allEvents.find(x => x.id === eventId);
        if (ev) {
          showEventModalDetail(ev, dashModal, modalTitle, modalBody, onNavigate, state);
        }
      });
    });

    dayCells.forEach(cell => {
      cell.addEventListener('click', () => {
        const day = parseInt(cell.dataset.day, 10);
        const dayEvents = allEvents.filter(e => e.day === day && e.month === currentCalendarMonth);
        
        modalTitle.textContent = `📅 Agenda Tanggal ${day} Agustus 2026`;
        let eventsHtml = '';
        
        if (dayEvents.length > 0) {
          eventsHtml = `
            <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px;">
              ${dayEvents.map(ev => `
                <div style="background: var(--bg-primary); padding: 10px 12px; border-radius: 6px; border-left: 4px solid ${ev.type === 'marketing' ? '#ec4899' : (ev.type === 'inventory' ? '#f59e0b' : (ev.type === 'tasks' ? '#6366f1' : (ev.type === 'custom' ? '#06b6d4' : '#10b981')))}; display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
                  <div>
                    <strong style="font-size: 0.86rem; color: var(--text-primary);">${ev.title}</strong>
                    <span style="font-size: 0.74rem; color: var(--text-muted); display: block;">⏰ ${ev.time} • ${ev.desc}</span>
                  </div>
                  ${ev.isCustom ? `
                    <button class="btn btn-sm btn-secondary btn-delete-custom-evt" data-id="${ev.id}" style="color: var(--danger); padding: 2px 6px; font-size: 0.7rem;" title="Hapus Agenda">🗑️</button>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          `;
        } else {
          eventsHtml = `
            <div style="background: var(--bg-primary); padding: 12px; border-radius: 6px; margin-bottom: 14px; text-align: center; color: var(--text-muted); font-size: 0.82rem;">
              Belum ada agenda khusus pada tanggal ini.
            </div>
          `;
        }

        modalBody.innerHTML = `
          ${eventsHtml}
          <div style="border-top: 1px solid var(--border-color); padding-top: 12px;">
            <button class="btn btn-primary" id="btn-modal-add-agenda-here" style="width: 100%; font-size: 0.82rem; font-weight: 700;">
              ➕ Tambah Catatan / Agenda untuk Tanggal Ini
            </button>
          </div>
        `;

        dashModal.style.display = 'flex';

        // Add note for this date
        const addBtn = document.getElementById('btn-modal-add-agenda-here');
        if (addBtn) {
          addBtn.addEventListener('click', () => {
            renderAddEventForm(day, dashModal, modalTitle, modalBody, state, onNavigate);
          });
        }

        // Delete custom events
        const deleteBtns = modalBody.querySelectorAll('.btn-delete-custom-evt');
        deleteBtns.forEach(dBtn => {
          dBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteCustomCalendarEvent(dBtn.dataset.id);
            showToast('Agenda kustom berhasil dihapus!', 'info');
            dashModal.style.display = 'none';
          });
        });
      });
    });
  }
}

function renderAddEventForm(selectedDay, dashModal, modalTitle, modalBody, state, onNavigate) {
  modalTitle.textContent = `➕ Tambah Agenda (${selectedDay} Agustus 2026)`;
  modalBody.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 12px;">
      <div class="form-group">
        <label class="form-label" style="font-size: 0.78rem;">Judul Agenda / Rapat / Catatan</label>
        <input type="text" class="form-control" id="custom-evt-title" placeholder="cth: Meeting Supplier Biji Kopi Toraja" style="font-size: 0.82rem;">
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div class="form-group">
          <label class="form-label" style="font-size: 0.78rem;">Kategori</label>
          <select class="form-control" id="custom-evt-cat" style="font-size: 0.82rem;">
            <option value="Tugas">🎯 Tugas Operasional</option>
            <option value="Marketing">📢 Pemasaran & Promo</option>
            <option value="Stok">📦 Pengadaan / Stok</option>
            <option value="Catatan" selected>📝 Catatan Bisnis Mandiri</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" style="font-size: 0.78rem;">Waktu / Jam</label>
          <input type="text" class="form-control" id="custom-evt-time" value="10:00 WIB" style="font-size: 0.82rem;">
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" style="font-size: 0.78rem;">Catatan Tambahan & Detail</label>
        <textarea class="form-control" id="custom-evt-notes" rows="2" placeholder="Tuliskan catatan penting agenda..." style="font-size: 0.82rem;"></textarea>
      </div>

      <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 6px;">
        <button class="btn btn-secondary btn-sm" id="btn-cancel-custom-evt">Batal</button>
        <button class="btn btn-primary btn-sm" id="btn-save-custom-evt" style="font-weight: 700; padding: 8px 16px;">
          💾 Simpan Agenda
        </button>
      </div>
    </div>
  `;

  const cancelBtn = document.getElementById('btn-cancel-custom-evt');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      dashModal.style.display = 'none';
    });
  }

  const saveBtn = document.getElementById('btn-save-custom-evt');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const title = document.getElementById('custom-evt-title').value.trim();
      const category = document.getElementById('custom-evt-cat').value;
      const time = document.getElementById('custom-evt-time').value.trim();
      const notes = document.getElementById('custom-evt-notes').value.trim();

      if (!title) {
        showToast('Mohon masukkan judul agenda!', 'warning');
        return;
      }

      const formattedDay = selectedDay < 10 ? `0${selectedDay}` : selectedDay;
      const dateStr = `2026-08-${formattedDay}`;

      addCustomCalendarEvent({
        date: dateStr,
        title,
        category,
        time,
        notes
      });

      showToast(`Agenda "${title}" berhasil disimpan di kalender!`, 'success');
      dashModal.style.display = 'none';
    });
  }
}

function showEventModalDetail(ev, dashModal, modalTitle, modalBody, onNavigate, state) {
  let badgeColor = 'var(--primary)';
  let targetScreen = 'action';
  let buttonLabel = 'Lihat di Action Center ➔';

  if (ev.type === 'marketing') {
    badgeColor = '#ec4899';
    targetScreen = 'decision';
    buttonLabel = 'Buka Rekomendasi di Decision Center ➔';
  } else if (ev.type === 'inventory') {
    badgeColor = '#f59e0b';
    targetScreen = 'action';
    buttonLabel = 'Buka Tugas Reorder di Action Center ➔';
  } else if (ev.type === 'custom') {
    badgeColor = '#06b6d4';
    buttonLabel = 'Tutup';
  }

  modalTitle.textContent = ev.title;
  modalBody.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span class="badge" style="background: ${badgeColor}22; color: ${badgeColor}; font-weight: 700;">
        Kategori: ${ev.type.toUpperCase()}
      </span>
      <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">⏰ ${ev.time} (${ev.day} Agu 2026)</span>
    </div>
    <div style="background: var(--bg-primary); padding: 14px; border-radius: var(--radius-sm); border-left: 4px solid ${badgeColor};">
      <strong style="display: block; margin-bottom: 4px; font-size: 0.9rem;">Deskripsi & Tindakan:</strong>
      <p style="margin: 0; font-size: 0.85rem; line-height: 1.45; color: var(--text-secondary);">${ev.desc}</p>
    </div>
    <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
      <span>Prioritas: <strong>${ev.priority}</strong></span>
      <span>Dampak Target: <strong>Tinggi</strong></span>
    </div>
    ${ev.isCustom ? `
      <div style="display: flex; justify-content: space-between; gap: 8px; margin-top: 8px;">
        <button class="btn btn-secondary btn-delete-custom-evt-single" data-id="${ev.id}" style="color: var(--danger);">🗑️ Hapus Agenda</button>
        <button class="btn btn-primary" id="btn-modal-cal-close">Tutup</button>
      </div>
    ` : `
      <button class="btn btn-primary" id="btn-modal-cal-goto" style="width: 100%; margin-top: 8px;">
        ${buttonLabel}
      </button>
    `}
  `;

  dashModal.style.display = 'flex';

  const gotoBtn = document.getElementById('btn-modal-cal-goto');
  if (gotoBtn) {
    gotoBtn.addEventListener('click', () => {
      dashModal.style.display = 'none';
      onNavigate(targetScreen);
    });
  }

  const closeBtn = document.getElementById('btn-modal-cal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      dashModal.style.display = 'none';
    });
  }

  const delSingleBtn = modalBody.querySelector('.btn-delete-custom-evt-single');
  if (delSingleBtn) {
    delSingleBtn.addEventListener('click', () => {
      deleteCustomCalendarEvent(delSingleBtn.dataset.id);
      showToast('Agenda berhasil dihapus!', 'info');
      dashModal.style.display = 'none';
    });
  }
}
