// dashboard.js
// Executive Dashboard for AIbo MVP Phase 4
// Features: 6-Dimension Health Gauge & Detail Modal, Animated KPI Cards with Overlays, Business Calendar & Timeline, AI Daily Brief, Goals & Task loops.

import { formatCurrency, formatPercent, formatNumber, renderLineChart, showToast, animateCounter } from '../utils.js';
import { applyRecommendation, completeTask } from '../state.js';
import { renderContextHelp } from './contextHelp.js';

export function renderDashboard(container, state, onNavigate) {
  const health = state.business_health;
  const kpis = state.kpis;
  const recommendations = state.recommendations.filter(r => r.status === 'pending');
  const activeTasks = state.tasks.filter(t => t.status !== 'completed');
  const alerts = state.alerts.filter(a => a.status === 'unresolved');
  
  // Ensure 6 health dimensions exist
  if (!health.components.cashflow) {
    health.components.cashflow = 85;
  }

  // Format health color
  let healthColor = 'var(--success)';
  if (health.score < 60) healthColor = 'var(--danger)';
  else if (health.score < 80) healthColor = 'var(--warning)';

  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (health.score / 100) * circumference;

  // Monthly trends for sparklines
  const revenueTrendData = state.revenue.monthly.map(m => ({ label: m.month.split('-')[1], value: m.revenue }));
  const profitTrendData = state.profit.monthly.map(m => ({ label: m.month.split('-')[1], value: m.profit }));
  const customerTrendData = state.customers.monthly.map(m => ({ label: m.month.split('-')[1], value: m.customers }));

  container.innerHTML = `
    <!-- Top Alert Banners -->
    ${alerts.length > 0 ? `
      <div class="alerts-container" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 4px;">
        ${alerts.map(a => `
          <div class="insight-alert ${a.priority === 'high' ? 'priority-high' : ''}" style="display: flex; justify-content: space-between; align-items: center; border-radius: var(--radius-sm); padding: 12px 20px; border-left: 4px solid ${a.priority === 'high' ? 'var(--danger)' : 'var(--warning)'};">
            <div>
              <strong style="display: block; font-size: 0.92rem; color: var(--text-primary);">⚠️ ${a.title}</strong>
              <span style="font-size: 0.83rem; color: var(--text-secondary);">${a.description}</span>
            </div>
            <button class="btn btn-secondary btn-sm btn-quick-resolve" style="padding: 6px 12px; font-size: 0.78rem;">Lihat Tindakan AIbo</button>
          </div>
        `).join('')}
      </div>
    ` : ''}

    <!-- Main Dashboard Row: 6-Dimension Health & AI Daily Brief -->
    <div class="grid-3">
      
      <!-- 6-Dimension Health Gauge Card -->
      <div class="card" id="card-health-gauge" style="display: flex; flex-direction: column; justify-content: center; gap: 16px; cursor: pointer; position: relative;" title="Klik untuk melihat rincian 6 Dimensi Kesehatan Bisnis">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 class="card-title" style="margin-bottom: 0;">Skor Kesehatan Bisnis ${renderContextHelp('business_health')}</h3>
          <span style="font-size: 0.75rem; color: var(--primary); font-weight: 600;">🔍 Detail 6 Dimensi</span>
        </div>
        <div class="health-gauge-container">
          <div class="health-gauge-circle">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="${radius}" fill="none" stroke="var(--border-color)" stroke-width="8" />
              <circle cx="60" cy="60" r="${radius}" fill="none" stroke="${healthColor}" stroke-width="8" 
                stroke-dasharray="${circumference}" 
                stroke-dashoffset="${offset}" 
                stroke-linecap="round"
                transform="rotate(-90 60 60)"
                style="transition: stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1);" />
            </svg>
            <div class="health-gauge-value" id="health-score-val">${health.score}</div>
          </div>
          <div>
            <h4 style="font-size: 1.15rem; color: ${healthColor};">${health.status}</h4>
            <p style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 4px;">
              ${health.score_change >= 0 ? `+${health.score_change}` : health.score_change} poin vs bulan lalu
            </p>
            <span style="font-size: 0.72rem; color: var(--text-muted);">6 Dimensi Teranalisis</span>
          </div>
        </div>
      </div>

      <!-- Today's AI Daily Brief Card -->
      <div class="card" style="grid-column: span 2; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div class="card-title">
            <span style="display: flex; align-items: center; gap: 8px;">
              <span style="color: var(--ai-primary); font-size: 1.25rem;">✨</span> AI Daily Brief Hari Ini
            </span>
            <span class="badge" style="background-color: var(--ai-primary-glow); color: var(--ai-primary); text-transform: none;">Executive Insight</span>
          </div>
          <p style="font-size: 0.92rem; line-height: 1.6; color: var(--text-primary); margin-bottom: 16px;">
            "Omset mencapai <strong>${formatCurrency(kpis.revenue.current)}</strong> (+${kpis.revenue.change_percent}% vs bulan lalu). Pertumbuhan penjualan online sangat positif, namun ROI marketing TikTok masih perlu optimasi. AIbo merekomendasikan realokasi budget <strong>Rp 5 Juta</strong> ke saluran Email."
          </p>
        </div>
        <div style="display: flex; gap: 12px;">
          <button class="btn btn-ai" id="btn-view-brief-recs" style="font-size: 0.85rem; padding: 8px 16px;">⚡ Terapkan Rekomendasi</button>
          <button class="btn btn-secondary" id="btn-view-analytics-shortcut" style="font-size: 0.85rem; padding: 8px 16px;">📈 Analisis Deep Dive</button>
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
          <strong style="color: ${state.inventory.low_stock_skus > 0 ? 'var(--danger)' : 'var(--text-primary)'};">${state.inventory.low_stock_skus} SKU</strong>
        </div>
      </div>

    </div>

    <!-- Business Calendar & Timeline Section -->
    <div class="card">
      <div class="card-title" style="display: flex; justify-content: space-between; align-items: center;">
        <span style="display: flex; align-items: center; gap: 8px;">
          <span>📅</span> Kalender & Timeline Event Bisnis
        </span>
        <div style="display: flex; gap: 6px;" id="calendar-filter-bar">
          <button class="btn btn-secondary btn-sm active-cal-filter" data-filter="all" style="padding: 4px 10px; font-size: 0.75rem;">Semua</button>
          <button class="btn btn-secondary btn-sm" data-filter="marketing" style="padding: 4px 10px; font-size: 0.75rem;">Campaign</button>
          <button class="btn btn-secondary btn-sm" data-filter="inventory" style="padding: 4px 10px; font-size: 0.75rem;">Stok</button>
          <button class="btn btn-secondary btn-sm" data-filter="tasks" style="padding: 4px 10px; font-size: 0.75rem;">Tugas</button>
        </div>
      </div>
      
      <div id="calendar-timeline-container" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-top: 8px;">
        ${renderCalendarEvents('all')}
      </div>
    </div>

    <!-- Recommendations & Tasks Split layout -->
    <div class="grid-2">
      <!-- Recommendations Section -->
      <div class="card">
        <div class="card-title">
          <span>Rekomendasi AIbo</span>
          <span class="badge" style="background-color: var(--ai-primary-glow); color: var(--ai-primary);">${recommendations.length} Pending</span>
        </div>
        
        ${recommendations.length > 0 ? `
          <div style="display: flex; flex-direction: column; gap: 16px;">
            ${recommendations.map(r => `
              <div class="rec-card" style="padding: 16px; border: 1px solid var(--border-color); background-color: var(--bg-input); border-radius: var(--radius-sm); display: flex; flex-direction: column; gap: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                  <h4 style="font-size: 0.95rem; color: var(--text-primary);">${r.title}</h4>
                  <span class="badge ${r.confidence >= 90 ? 'badge-low' : 'badge-medium'}" style="text-transform: none;">
                    ${r.confidence}% Conf.
                  </span>
                </div>
                <p style="font-size: 0.83rem; color: var(--text-secondary);">${r.description}</p>
                <div style="font-size: 0.8rem; background-color: var(--bg-primary); padding: 8px 12px; border-radius: 4px; display: flex; justify-content: space-between;">
                  <span>Alasan: <span style="color: var(--text-primary); font-weight: 500;">${r.reason}</span></span>
                  ${r.expected_impact.estimated_revenue_gain ? `
                    <span style="color: var(--success); font-weight: 600;">+${formatCurrency(r.expected_impact.estimated_revenue_gain)}</span>
                  ` : ''}
                </div>
                <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px;">
                  <button class="btn btn-secondary btn-sm btn-view-rec-detail" data-id="${r.id}" style="font-size: 0.75rem; padding: 6px 12px;">Bukti Support</button>
                  <button class="btn btn-primary btn-sm btn-apply-rec" data-id="${r.id}" style="font-size: 0.75rem; padding: 6px 12px;">Terapkan Keputusan</button>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div style="text-align: center; padding: 40px 0; color: var(--text-muted);">
            <div style="font-size: 2rem; margin-bottom: 8px;">✓</div>
            <p>Semua rekomendasi telah dieksekusi!</p>
          </div>
        `}
      </div>

      <!-- Tasks Section -->
      <div class="card">
        <div class="card-title">
          <span>Tugas Aktif</span>
          <span class="badge" style="background-color: var(--primary-glow); color: var(--primary);">${activeTasks.length} Belum Selesai</span>
        </div>
        
        ${activeTasks.length > 0 ? `
          <div style="display: flex; flex-direction: column;">
            ${activeTasks.map(t => `
              <div class="task-item">
                <div class="task-details">
                  <div class="task-checkbox btn-checkbox-complete" data-id="${t.id}"></div>
                  <div style="display: flex; flex-direction: column;">
                    <span class="task-title" style="font-weight: 500; font-size: 0.88rem;">${t.title}</span>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">Penanggung Jawab: ${t.assignee} | Tenggat: ${t.due_date}</span>
                  </div>
                </div>
                <span class="badge ${t.priority === 'High' ? 'badge-high' : 'badge-medium'}" style="font-size: 0.65rem;">
                  ${t.priority}
                </span>
              </div>
            `).join('')}
          </div>
        ` : `
          <div style="text-align: center; padding: 40px 0; color: var(--text-muted);">
            <div style="font-size: 2rem; margin-bottom: 8px;">🎉</div>
            <p>Tidak ada tugas aktif! Semua target terpenuhi.</p>
          </div>
        `}
      </div>
    </div>

    <!-- Active Goals Progress row -->
    <div class="card">
      <div class="card-title" style="margin-bottom: 16px;">
        <span>Target & Goal Bisnis</span>
        <button class="btn btn-secondary btn-sm" id="btn-goto-goals" style="font-size: 0.75rem; padding: 4px 10px;">Lihat Rincian Drivers ➔</button>
      </div>
      <div class="grid-3" style="gap: 16px;">
        ${state.goals.map(g => {
          let barColor = 'var(--primary)';
          if (g.status === 'at_risk') barColor = 'var(--danger)';
          else if (g.status === 'completed') barColor = 'var(--success)';
          
          return `
            <div class="dash-goal-item" data-goal-id="${g.id}" style="background-color: var(--bg-input); padding: 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 8px; cursor: pointer;" title="Klik untuk analisis drivers dan keputusan">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.85rem; font-weight: 600;">${g.name}</span>
                <span class="badge ${g.status === 'at_risk' ? 'badge-high' : 'badge-low'}" style="font-size: 0.65rem;">
                  ${g.status.replace('_', ' ')}
                </span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">
                <span>Progres: ${g.progress}%</span>
                <span>Target: ${g.unit === 'IDR' ? formatCurrency(g.target) : formatNumber(g.target)}</span>
              </div>
              <div style="width: 100%; height: 6px; background-color: var(--border-color); border-radius: 3px; overflow: hidden; margin-top: 4px;">
                <div style="width: ${Math.min(100, g.progress)}%; height: 100%; background-color: ${barColor}; border-radius: 3px; transition: width 0.3s ease;"></div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <!-- 6-Dimension Health Detail Modal -->
    <div id="health-detail-modal" class="modal-overlay" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.7); z-index: 1050; align-items: center; justify-content: center; padding: 20px;">
      <div class="card animate-fade-in" style="width: 100%; max-width: 580px; background-color: var(--bg-secondary); border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
          <h3 style="font-size: 1.2rem; font-weight: 700;">📊 Detail 6 Dimensi Kesehatan Bisnis</h3>
          <button class="btn-close-modal" id="btn-close-health-modal" style="background: none; border: none; color: var(--text-secondary); font-size: 1.4rem; cursor: pointer;">&times;</button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 14px;">
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

    <!-- Generic Modal Container for Evidence/KPI Details -->
    <div id="dashboard-detail-modal" class="modal-overlay" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.7); z-index: 1050; align-items: center; justify-content: center; padding: 20px;">
      <div class="card animate-fade-in" style="width: 100%; max-width: 520px; background-color: var(--bg-secondary); border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
          <h3 id="dash-modal-title" style="font-size: 1.15rem; font-weight: 700;">Detail Metric</h3>
          <button id="btn-close-dash-modal" style="background: none; border: none; color: var(--text-secondary); font-size: 1.4rem; cursor: pointer;">&times;</button>
        </div>
        <div id="dash-modal-body" style="font-size: 0.88rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 12px;">
        </div>
      </div>
    </div>
  `;

  bindEvents(state, onNavigate);
}

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

function renderCalendarEvents(filter) {
  const events = [
    { type: 'marketing', title: '📢 Realokasi Ad Spend TikTok -> Email', date: '20 Agu 2026', priority: 'High' },
    { type: 'inventory', title: '📦 Reorder Stok House Blend 1kg', date: '22 Agu 2026', priority: 'High' },
    { type: 'tasks', title: '🎯 Review Campaign TikTok Ads', date: '24 Agu 2026', priority: 'Medium' },
    { type: 'inventory', title: '📦 Reorder Matcha Latte Powder', date: '25 Agu 2026', priority: 'Medium' }
  ];

  const filtered = filter === 'all' ? events : events.filter(e => e.type === filter);

  return filtered.map(e => `
    <div style="background: var(--bg-primary); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 6px;">
      <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600;">${e.date}</span>
      <strong style="font-size: 0.82rem; color: var(--text-primary); line-height: 1.3;">${e.title}</strong>
      <span class="badge ${e.priority === 'High' ? 'badge-high' : 'badge-medium'}" style="font-size: 0.62rem; align-self: flex-start; margin-top: 4px;">
        ${e.priority}
      </span>
    </div>
  `).join('');
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
        } else {
          modalTitle.textContent = `📋 Detail Metrik ${kpiType.toUpperCase()}`;
          modalBody.innerHTML = `<p>Metrik ${kpiType} berada dalam kondisi normal dan terkendali.</p>`;
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

  if (closeDashModalBtn && dashModal) {
    closeDashModalBtn.addEventListener('click', () => {
      dashModal.style.display = 'none';
    });
  }

  // Quick Resolve Alert buttons
  const quickResolveBtns = document.querySelectorAll('.btn-quick-resolve');
  quickResolveBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      onNavigate('decision');
    });
  });

  // Recommendation Bukti Support buttons
  const viewRecDetailBtns = document.querySelectorAll('.btn-view-rec-detail');
  viewRecDetailBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      onNavigate('decision');
    });
  });

  // Calendar Filter Bar
  const calFilterBtns = document.querySelectorAll('#calendar-filter-bar button');
  const calContainer = document.getElementById('calendar-timeline-container');
  if (calFilterBtns && calContainer) {
    calFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        calFilterBtns.forEach(b => b.classList.remove('active-cal-filter'));
        btn.classList.add('active-cal-filter');
        const filter = btn.dataset.filter;
        calContainer.innerHTML = renderCalendarEvents(filter);
      });
    });
  }

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

  const dashGoalItems = document.querySelectorAll('.dash-goal-item');
  dashGoalItems.forEach(item => {
    item.addEventListener('click', () => onNavigate('action'));
  });
}
