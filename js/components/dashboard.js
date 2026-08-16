// dashboard.js
// Executive Dashboard Module with 6-Dimension Health Gauge, AI Daily Brief,
// Interactive Visual Month Calendar, Real-time KPI Cards, and Action Shortcuts.

import { formatCurrency, formatPercent, formatNumber, renderLineChart, showToast, animateCounter } from '../utils.js';
import { applyRecommendation, completeTask } from '../state.js';
import { renderContextHelp } from './contextHelp.js';

let currentCalendarMonth = 7; // August (0-indexed: 7)
let currentCalendarYear = 2026;
let currentCalendarFilter = 'all';

export function renderDashboard(container, state, onNavigate) {
  // Support both (container, state, onNavigate) and legacy (state, container, onNavigate)
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
    <!-- Top Executive Brief Header -->
    <div class="dashboard-header-flex" style="display: flex; justify-content: space-between; align-items: stretch; gap: 20px; margin-bottom: 20px; flex-wrap: wrap;">
      
      <!-- Health Score Circular Gauge Card -->
      <div class="card health-gauge-card animate-fade-in" id="card-health-gauge" style="flex: 1; min-width: 280px; display: flex; align-items: center; gap: 18px; cursor: pointer; border-left: 4px solid ${healthColor}; background: linear-gradient(135deg, var(--bg-card) 0%, var(--bg-secondary) 100%);" title="Klik untuk membuka detail 6 dimensi kesehatan">
        <div style="position: relative; width: 105px; height: 105px; flex-shrink: 0;">
          <svg viewBox="0 0 100 100" style="transform: rotate(-90deg); width: 100%; height: 100%;">
            <circle cx="50" cy="50" r="42" stroke="var(--border-color)" stroke-width="9" fill="none" opacity="0.4" />
            <circle cx="50" cy="50" r="42" stroke="${healthColor}" stroke-width="9" fill="none"
              stroke-dasharray="264"
              stroke-dashoffset="${264 - (264 * health.score) / 100}"
              stroke-linecap="round" style="transition: stroke-dashoffset 1s ease-in-out;" />
          </svg>
          <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;">
            <span style="font-size: 1.65rem; font-weight: 800; font-family: var(--font-heading); color: ${healthColor}; line-height: 1;">${health.score}</span>
            <span style="font-size: 0.65rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">/ 100</span>
          </div>
        </div>
        
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="badge" style="background-color: ${healthBg}; color: ${healthColor}; font-size: 0.75rem; font-weight: 700;">
              ● ${healthText}
            </span>
            <span style="font-size: 0.72rem; color: var(--text-muted);">6 Dimensi</span>
          </div>
          <h2 style="font-size: 1.1rem; font-weight: 700; margin: 2px 0;">Skor Kesehatan Bisnis ${renderContextHelp('business_health')}</h2>
          <p style="font-size: 0.78rem; color: var(--text-secondary); line-height: 1.35;">
            Kondisi finansial dan operasional Nusa Brew sangat prima. Klik untuk evaluasi 6 pilar.
          </p>
        </div>
      </div>

      <!-- AI Daily Executive Brief Card -->
      <div class="card animate-fade-in" style="flex: 2; min-width: 320px; display: flex; flex-direction: column; justify-content: space-between; gap: 10px; background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, var(--bg-card) 100%); border: 1px solid var(--border-color);">
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

        <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.45; margin: 0;">
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

    <!-- Interactive Visual Calendar & Event Timeline Section -->
    <div class="card animate-fade-in" style="margin-bottom: 20px;">
      <div class="card-title" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 1.1rem;">📅</span>
          <div>
            <strong style="font-size: 1.05rem;">Kalender Visual & Agenda Bisnis</strong>
            <span style="font-size: 0.75rem; color: var(--text-muted); display: block;">Jadwal promo campaign, reorder stok, tugas tim, dan evaluasi target</span>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
          <!-- Month Switcher -->
          <div style="display: flex; align-items: center; gap: 6px; background: var(--bg-primary); padding: 4px 8px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
            <button class="btn btn-sm btn-cal-month-nav" id="btn-cal-prev" style="background: none; border: none; padding: 2px 6px; cursor: pointer; color: var(--text-secondary);">◀</button>
            <strong id="cal-month-label" style="font-size: 0.82rem; min-width: 100px; text-align: center;">Agustus 2026</strong>
            <button class="btn btn-sm btn-cal-month-nav" id="btn-cal-next" style="background: none; border: none; padding: 2px 6px; cursor: pointer; color: var(--text-secondary);">▶</button>
          </div>

          <!-- Category Filters -->
          <div style="display: flex; gap: 4px;" id="calendar-filter-bar">
            <button class="btn btn-secondary btn-sm active-cal-filter" data-filter="all" style="padding: 4px 8px; font-size: 0.75rem;">Semua</button>
            <button class="btn btn-secondary btn-sm" data-filter="marketing" style="padding: 4px 8px; font-size: 0.75rem;">📢 Ads</button>
            <button class="btn btn-secondary btn-sm" data-filter="inventory" style="padding: 4px 8px; font-size: 0.75rem;">📦 Stok</button>
            <button class="btn btn-secondary btn-sm" data-filter="tasks" style="padding: 4px 8px; font-size: 0.75rem;">🎯 Tugas</button>
            <button class="btn btn-secondary btn-sm" data-filter="goals" style="padding: 4px 8px; font-size: 0.75rem;">🏁 Goals</button>
          </div>
        </div>
      </div>
      
      <!-- Visual Calendar Grid View (7 Columns: Sen - Min) -->
      <div id="visual-calendar-grid-wrapper" style="margin-top: 14px;">
        ${renderVisualMonthCalendar(currentCalendarMonth, currentCalendarYear, currentCalendarFilter)}
      </div>

      <!-- Compact Timeline Strip -->
      <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
        <span style="font-size: 0.78rem; color: var(--text-muted);">
          💡 <strong>Tips:</strong> Klik pada tanggal atau kartu acara untuk melihat agenda lengkap dan mengeksekusi tindakan.
        </span>
        <div style="display: flex; gap: 12px; font-size: 0.72rem; color: var(--text-secondary);">
          <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #ec4899;"></span> Marketing Campaign</span>
          <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #f59e0b;"></span> Reorder Inventory</span>
          <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #6366f1;"></span> Tugas Tim</span>
          <span style="display: flex; align-items: center; gap: 4px;"><span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></span> Target Milestone</span>
        </div>
      </div>
    </div>

    <!-- Recommendations & Tasks Split layout -->
    <div class="grid-2">
      <!-- Recommendations Section -->
      <div class="card">
        <div class="card-title" style="display: flex; justify-content: space-between; align-items: center;">
          <span>💡 Rekomendasi Strategis AIbo</span>
          <span class="badge" style="background-color: var(--ai-primary-glow); color: var(--ai-primary);">${recommendations.length} Pending</span>
        </div>
        
        ${recommendations.length > 0 ? `
          <div style="display: flex; flex-direction: column; gap: 14px;">
            ${recommendations.map(r => `
              <div class="rec-card" style="padding: 14px; border: 1px solid var(--border-color); background-color: var(--bg-input); border-radius: var(--radius-sm); display: flex; flex-direction: column; gap: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <strong style="font-size: 0.9rem; color: var(--text-primary); line-height: 1.3;">${r.title}</strong>
                  <span class="badge badge-high" style="font-size: 0.65rem; white-space: nowrap;">${r.impact}</span>
                </div>
                <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0; line-height: 1.4;">${r.root_cause || r.evidence}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 8px;">
                  <span style="font-size: 0.75rem; color: var(--ai-primary); font-weight: 600;">Keyakinan AI: ${r.confidence}%</span>
                  <div style="display: flex; gap: 6px;">
                    <button class="btn btn-secondary btn-sm btn-view-rec-detail" data-id="${r.id}" style="font-size: 0.72rem; padding: 4px 8px;">Opsi Skenario</button>
                    <button class="btn btn-primary btn-sm btn-apply-rec" data-id="${r.id}" style="font-size: 0.72rem; padding: 4px 8px;">Terapkan ⚡</button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div style="text-align: center; padding: 30px; color: var(--text-muted);">
            <span>🎉 Semua rekomendasi telah diterapkan. Bisnis berjalan optimal!</span>
          </div>
        `}
      </div>

      <!-- Tasks Checklist Section -->
      <div class="card">
        <div class="card-title" style="display: flex; justify-content: space-between; align-items: center;">
          <span>🎯 Tindakan & Tugas Tim</span>
          <span class="badge" style="background-color: var(--bg-secondary); color: var(--text-secondary);">${tasks.length} Aktif</span>
        </div>

        ${tasks.length > 0 ? `
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${tasks.slice(0, 4).map(t => `
              <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: var(--bg-primary); border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <button class="btn-checkbox-complete" data-id="${t.id}" style="width: 20px; height: 20px; border-radius: 4px; border: 2px solid var(--primary); background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; color: white;"></button>
                  <div>
                    <strong style="font-size: 0.83rem; color: var(--text-primary); display: block;">${t.title}</strong>
                    <span style="font-size: 0.7rem; color: var(--text-muted);">Tenggat: ${t.due_date} • PIC: ${t.assignee}</span>
                  </div>
                </div>
                <span class="badge ${t.priority === 'High' ? 'badge-high' : 'badge-medium'}" style="font-size: 0.65rem;">${t.priority}</span>
              </div>
            `).join('')}
            <button class="btn btn-secondary btn-sm" id="btn-goto-goals" style="margin-top: 6px; width: 100%; font-size: 0.78rem;">
              Buka Semua Tugas di Action Center ➔
            </button>
          </div>
        ` : `
          <div style="text-align: center; padding: 30px; color: var(--text-muted);">
            <span>👍 Tidak ada tugas mendesak saat ini.</span>
          </div>
        `}
      </div>
    </div>

    <!-- Health Gauge 6-Dimension Modal -->
    <div id="health-detail-modal" class="modal-overlay" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.7); z-index: 1050; align-items: center; justify-content: center; padding: 20px;">
      <div class="card animate-fade-in" style="width: 100%; max-width: 540px; background-color: var(--bg-secondary); border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
          <div>
            <h3 style="font-size: 1.15rem; font-weight: 700;">Evaluasi 6 Pilar Kesehatan Bisnis</h3>
            <span style="font-size: 0.75rem; color: var(--text-muted);">Rata-rata Skor: ${health.score}/100 (${healthText})</span>
          </div>
          <button class="btn-close-modal" id="btn-close-health-modal" style="background: none; border: none; color: var(--text-secondary); font-size: 1.4rem; cursor: pointer;">&times;</button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${renderHealthDimensionRow('Revenue (Omset)', health.components.revenue, 'Pertumbuhan omset positif +11.8%')}
          ${renderHealthDimensionRow('Profitabilitas', health.components.profitability, 'Margin laba bersih stabil di 20%')}
          ${renderHealthDimensionRow('Pelanggan', health.components.customers, 'Akuisisi pelanggan baru tumbuh +10.5%')}
          ${renderHealthDimensionRow('Pemasaran (Marketing)', health.components.marketing, 'ROI TikTok Ads masih di bawah ekspektasi')}
          ${renderHealthDimensionRow('Stok (Inventory)', health.components.inventory, '2 SKU produk dalam batas reorder kritis')}
          ${renderHealthDimensionRow('Arus Kas (Cash Flow)', health.components.cashflow, 'Kas bersih positif di semua bulan')}
        </div>

        <div style="background: var(--bg-primary); padding: 12px 16px; border-radius: var(--radius-sm); border-left: 4px solid var(--ai-primary); font-size: 0.83rem; color: var(--text-secondary);">
          💡 <strong>Rekomendasi AIbo:</strong> Lakukan pengisian stok House Blend 1kg dan optimasi campaign Email untuk mempertahankan skor kesehatan di atas 80+.
        </div>
      </div>
    </div>

    <!-- Generic Modal Container for Calendar / KPI Details -->
    <div id="dashboard-detail-modal" class="modal-overlay" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.7); z-index: 1050; align-items: center; justify-content: center; padding: 20px;">
      <div class="card animate-fade-in" style="width: 100%; max-width: 520px; background-color: var(--bg-secondary); border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 16px;">
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

// Master Calendar Events Data
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
function renderVisualMonthCalendar(monthIndex, year, filter) {
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  
  // Total days in August (31 days). Aug 1 2026 is Saturday (Index 5 in 0-indexed Mon-Sun).
  const totalDays = 31;
  const startDayOffset = 5; // 0: Sen, 1: Sel, 2: Rab, 3: Kam, 4: Jum, 5: Sab, 6: Min

  // Filter events
  const filteredEvents = filter === 'all' 
    ? masterCalendarEvents 
    : masterCalendarEvents.filter(e => e.type === filter);

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

  // Clickable KPI Cards
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
            <div style="display: flex; justify-content: space-between;"><span>SKU Stok Kritis (Reorder):</span><span style="color: var(--danger); font-weight: bold;">${state.inventory.low_stock_skus} SKU</span></div>
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
  bindCalendarCellEvents(dashModal, modalTitle, modalBody, onNavigate);

  // Calendar Month Navigation
  const prevMonthBtn = document.getElementById('btn-cal-prev');
  const nextMonthBtn = document.getElementById('btn-cal-next');
  const monthLabel = document.getElementById('cal-month-label');
  const calGridWrapper = document.getElementById('visual-calendar-grid-wrapper');

  if (prevMonthBtn && nextMonthBtn && monthLabel && calGridWrapper) {
    prevMonthBtn.addEventListener('click', () => {
      currentCalendarMonth = Math.max(0, currentCalendarMonth - 1);
      monthLabel.textContent = currentCalendarMonth === 6 ? 'Juli 2026' : (currentCalendarMonth === 7 ? 'Agustus 2026' : 'Juni 2026');
      calGridWrapper.innerHTML = renderVisualMonthCalendar(currentCalendarMonth, currentCalendarYear, currentCalendarFilter);
      bindCalendarCellEvents(dashModal, modalTitle, modalBody, onNavigate);
    });

    nextMonthBtn.addEventListener('click', () => {
      currentCalendarMonth = Math.min(11, currentCalendarMonth + 1);
      monthLabel.textContent = currentCalendarMonth === 8 ? 'September 2026' : (currentCalendarMonth === 7 ? 'Agustus 2026' : 'Oktober 2026');
      calGridWrapper.innerHTML = renderVisualMonthCalendar(currentCalendarMonth, currentCalendarYear, currentCalendarFilter);
      bindCalendarCellEvents(dashModal, modalTitle, modalBody, onNavigate);
    });
  }

  // Calendar Filter Buttons
  const calFilterBtns = document.querySelectorAll('#calendar-filter-bar button');
  if (calFilterBtns && calGridWrapper) {
    calFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        calFilterBtns.forEach(b => b.classList.remove('active-cal-filter'));
        btn.classList.add('active-cal-filter');
        currentCalendarFilter = btn.dataset.filter;
        calGridWrapper.innerHTML = renderVisualMonthCalendar(currentCalendarMonth, currentCalendarYear, currentCalendarFilter);
        bindCalendarCellEvents(dashModal, modalTitle, modalBody, onNavigate);
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

  const gotoGoalsBtn = document.getElementById('btn-goto-goals');
  if (gotoGoalsBtn) {
    gotoGoalsBtn.addEventListener('click', () => onNavigate('action'));
  }
}

// Helper: Bind Calendar Cell & Pill clicks to modal
function bindCalendarCellEvents(dashModal, modalTitle, modalBody, onNavigate) {
  const dayCells = document.querySelectorAll('.cal-day-cell');
  const eventPills = document.querySelectorAll('.cal-event-pill');

  if (dashModal && modalTitle && modalBody) {
    eventPills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        const eventId = pill.dataset.eventId;
        const ev = masterCalendarEvents.find(x => x.id === eventId);
        if (ev) {
          showEventModalDetail(ev, dashModal, modalTitle, modalBody, onNavigate);
        }
      });
    });

    dayCells.forEach(cell => {
      cell.addEventListener('click', () => {
        const day = parseInt(cell.dataset.day);
        const dayEvents = masterCalendarEvents.filter(e => e.day === day && e.month === currentCalendarMonth);
        
        if (dayEvents.length > 0) {
          showEventModalDetail(dayEvents[0], dashModal, modalTitle, modalBody, onNavigate);
        } else {
          modalTitle.textContent = `📅 Agenda Tanggal ${day} Agustus 2026`;
          modalBody.innerHTML = `
            <p>Tidak ada event bisnis atau batas reorder khusus pada tanggal ini.</p>
            <div style="background: var(--bg-primary); padding: 12px; border-radius: 6px;">
              <span>Status Operasional: <strong>Normal</strong></span>
            </div>
          `;
          dashModal.style.display = 'flex';
        }
      });
    });
  }
}

function showEventModalDetail(ev, dashModal, modalTitle, modalBody, onNavigate) {
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
    <button class="btn btn-primary" id="btn-modal-cal-goto" style="width: 100%; margin-top: 8px;">
      ${buttonLabel}
    </button>
  `;

  dashModal.style.display = 'flex';

  const gotoBtn = document.getElementById('btn-modal-cal-goto');
  if (gotoBtn) {
    gotoBtn.addEventListener('click', () => {
      dashModal.style.display = 'none';
      onNavigate(targetScreen);
    });
  }
}
