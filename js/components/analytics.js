// analytics.js
// Renders the full Analytics experience for AIbo MVP Phase 4.5.
// Features: 6 Analytical Tabs, Time Granularity (Day/Week/Month/Quarter), Channel Drill-Down (Stage J),
// Period Comparison (This Month vs Last Month vs Target), and Plain-Language 3-Question AI Explanations.

import { formatCurrency, formatPercent, formatNumber, renderLineChart, renderDonutChart, renderBarChart, showToast } from '../utils.js';
import { renderContextHelp } from './contextHelp.js';
import { getIcon } from '../icons.js';

// ── Color palette for charts ──
const CHART_COLORS = [
  '#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444',
  '#ec4899', '#8b5cf6', '#14b8a6'
];

function getColor(i) {
  return CHART_COLORS[i % CHART_COLORS.length];
}

export function renderAnalytics(container, state, onNavigate) {
  let activeTab = 'sales';
  let dateRange = { start: 0, end: 7 }; // index into monthly arrays (0–7 = Jan–Aug)
  let activeGranularity = 'monthly'; // 'daily', 'weekly', 'monthly', 'quarterly'
  let activeChannelDrilldown = null; // Channel object for Stage J drill-down modal

  function updateView() {
    container.innerHTML = `
      <div class="animate-fade-in analytics-root">
        <!-- Tab Selector -->
        <div class="analytics-tabs" id="analytics-tabs">
          ${renderTabButton('sales', 'revenue', 'Sales / Revenue')}
          ${renderTabButton('profit', 'profit', 'Profit')}
          ${renderTabButton('customer', 'customer', 'Customer')}
          ${renderTabButton('marketing', 'marketing', 'Marketing')}
          ${renderTabButton('inventory', 'inventory', 'Inventory')}
          ${renderTabButton('cashflow', 'cashflow', 'Cash Flow')}
        </div>

        <!-- Date Range & Time Granularity Filter Bar (Stage J) -->
        <div class="analytics-filter-bar card" id="analytics-filter" style="margin-bottom: 20px;">
          <div class="filter-row" style="display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 12px;">
            
            <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
              <div class="filter-group">
                <label class="filter-label">Rentang Waktu</label>
                <select class="form-control filter-select" id="filter-period" style="font-size: 0.82rem;">
                  <option value="all" ${dateRange.start === 0 && dateRange.end === 7 ? 'selected' : ''}>Semua (Jan — Agu 2026)</option>
                  <option value="q1" ${dateRange.start === 0 && dateRange.end === 2 ? 'selected' : ''}>Q1 (Jan — Mar)</option>
                  <option value="q2" ${dateRange.start === 3 && dateRange.end === 5 ? 'selected' : ''}>Q2 (Apr — Jun)</option>
                  <option value="q3" ${dateRange.start === 6 && dateRange.end === 7 ? 'selected' : ''}>Q3 (Jul — Agu)</option>
                  <option value="last3" ${dateRange.start === 5 && dateRange.end === 7 ? 'selected' : ''}>3 Bulan Terakhir</option>
                  <option value="last6" ${dateRange.start === 2 && dateRange.end === 7 ? 'selected' : ''}>6 Bulan Terakhir</option>
                </select>
              </div>

              <!-- Granularity Toggle (Stage J) -->
              <div class="filter-group">
                <label class="filter-label">Granularitas Waktu</label>
                <div style="display: flex; gap: 4px;" id="granularity-toggle-bar">
                  <button class="btn btn-secondary btn-sm ${activeGranularity === 'daily' ? 'btn-primary' : ''}" data-gran="daily" style="padding: 4px 8px; font-size: 0.72rem;">Harian</button>
                  <button class="btn btn-secondary btn-sm ${activeGranularity === 'weekly' ? 'btn-primary' : ''}" data-gran="weekly" style="padding: 4px 8px; font-size: 0.72rem;">Mingguan</button>
                  <button class="btn btn-secondary btn-sm ${activeGranularity === 'monthly' ? 'btn-primary' : ''}" data-gran="monthly" style="padding: 4px 8px; font-size: 0.72rem;">Bulanan</button>
                  <button class="btn btn-secondary btn-sm ${activeGranularity === 'quarterly' ? 'btn-primary' : ''}" data-gran="quarterly" style="padding: 4px 8px; font-size: 0.72rem;">Kuartalan</button>
                </div>
              </div>
            </div>

            <button class="btn btn-secondary btn-sm aibo-icon-btn" id="btn-export-csv" style="padding: 8px 14px; font-size: 0.8rem;">
              ${getIcon('export', { size: 15 })} <span>Ekspor Data CSV</span>
            </button>
          </div>
        </div>

        <!-- Tab Content -->
        <div id="analytics-tab-content">
          ${getTabContent()}
        </div>

        <!-- Stage J: Channel Revenue Drill-Down Modal -->
        ${activeChannelDrilldown ? renderChannelDrilldownModal(activeChannelDrilldown) : ''}

        <!-- Universal Chart Detail Modal -->
        <div id="analytics-chart-modal" class="modal-overlay" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.75); backdrop-filter: blur(6px); z-index: 2000; align-items: center; justify-content: center; padding: 20px;">
          <div class="card animate-fade-in" style="width: 100%; max-width: 680px; max-height: 90vh; overflow-y: auto; background-color: var(--bg-secondary); border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 16px; padding: 24px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
              <h3 id="chart-modal-title" style="font-size: 1.2rem; font-weight: 700; color: var(--primary); display: flex; align-items: center; gap: 8px;">
                ${getIcon('chart-detail', { size: 20 })} <span>Detail Visualisasi & Analisis Metrik</span>
              </h3>
              <button id="btn-close-chart-modal" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; display: flex; align-items: center;">${getIcon('close', { size: 20 })}</button>
            </div>
            <div id="chart-modal-body" style="font-size: 0.88rem; color: var(--text-secondary); display: flex; flex-direction: column; gap: 14px;">
            </div>
          </div>
        </div>
      </div>
    `;

    bindEvents();
  }

  function renderTabButton(id, iconKey, label) {
    const isActive = activeTab === id;
    return `
      <button class="analytics-tab-btn ${isActive ? 'active' : ''}" data-tab="${id}" style="display: inline-flex; align-items: center; gap: 6px;">
        <span class="tab-icon" style="display: flex; align-items: center;">${getIcon(iconKey, { size: 16 })}</span>
        <span class="tab-label">${label}</span>
      </button>
    `;
  }

  function getMonthLabel(idx) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu'];
    return months[idx] || 'Agu';
  }

  function sliceMonthly(arr) {
    if (!arr) return [];
    return arr.slice(dateRange.start, dateRange.end + 1);
  }

  function sumField(arr, field) {
    return arr.reduce((s, item) => s + (item[field] || 0), 0);
  }

  function lastOf(arr, field) {
    return arr.length > 0 ? arr[arr.length - 1][field] : 0;
  }

  function firstOf(arr, field) {
    return arr.length > 0 ? arr[0][field] : 0;
  }

  function pctChange(current, previous) {
    if (!previous) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  }

  function changeIndicator(pct) {
    const num = parseFloat(pct);
    if (isNaN(num)) return '';
    const isUp = num >= 0;
    return `<span class="change-tag ${isUp ? 'tag-up' : 'tag-down'}" style="display: inline-flex; align-items: center; gap: 3px;">${isUp ? getIcon('trend-up', { size: 12 }) : getIcon('trend-down', { size: 12 })} ${Math.abs(num)}%</span>`;
  }

  function kpiCard(title, value, subtext, color = 'var(--primary)', metricKey = '') {
    const cleanKey = (metricKey || title).replace(/<[^>]*>?/gm, '').replace(/"/g, '').trim();
    return `
      <div class="card analytics-kpi-card" data-metric="${cleanKey}" style="cursor: pointer; position: relative;" title="Klik untuk analisis perbandingan & rincian AIbo">
        <span class="kpi-label">${title}</span>
        <span class="kpi-number" style="color:${color}">${value}</span>
        <span class="kpi-subtext">${subtext}</span>
      </div>
    `;
  }

  // Universal Plain-Language 3-Question AI Explainability Card (Stage J)
  function renderPlainLanguageAICard(title, whatHappened, whyItMatters, whatToDo, relatedRecId = null) {
    return `
      <div class="card" style="border-left: 4px solid var(--ai-primary); background: var(--bg-card-solid); margin-top: 24px; padding: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: var(--ai-primary); display: flex; align-items: center;">${getIcon('copilot', { size: 18 })}</span>
            <h4 style="font-size: 1rem; font-weight: 700; color: var(--text-primary); margin: 0;">
              Penjelasan Cerdas AIbo: ${title}
            </h4>
          </div>
          <span class="badge badge-low" style="font-size: 0.65rem;">Bahasa Awam</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.86rem; line-height: 1.5;">
          <div>
            <strong style="color: var(--primary); display: block; font-size: 0.8rem; text-transform: uppercase;">1. Apa yang Anda lihat? (What Happened)</strong>
            <span style="color: var(--text-primary);">${whatHappened}</span>
          </div>

          <div>
            <strong style="color: var(--warning); display: block; font-size: 0.8rem; text-transform: uppercase;">2. Mengapa ini penting? (Why it Matters)</strong>
            <span style="color: var(--text-secondary);">${whyItMatters}</span>
          </div>

          <div>
            <strong style="color: var(--success); display: block; font-size: 0.8rem; text-transform: uppercase;">3. Apa saran tindakan AIbo? (What Should I Do)</strong>
            <span style="color: var(--text-primary);">${whatToDo}</span>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; margin-top: 14px; border-top: 1px dashed var(--border-color); padding-top: 10px;">
          <button class="btn btn-primary btn-sm btn-goto-decision-rec aibo-icon-btn" style="font-size: 0.78rem; padding: 6px 14px;">
            ${getIcon('recommendation', { size: 14 })} <span>Lihat Rekomendasi Terkait di Decision Center</span> ${getIcon('arrow-right', { size: 13 })}
          </button>
        </div>
      </div>
    `;
  }

  // Period Comparison Table (Stage J)
  function renderPeriodComparisonCard() {
    return `
      <div class="card" style="margin-top: 24px;">
        <h3 class="card-title" style="display: flex; align-items: center; gap: 8px;">
          ${getIcon('comparison', { size: 18 })} <span>Perbandingan Kinerja Periode (Bulan Ini vs Bulan Lalu vs Target)</span>
        </h3>
        <div class="analytics-table-wrap" style="margin-top: 12px;">
          <div class="analytics-table-header" style="grid-template-columns: 2fr 1.2fr 1.2fr 1.2fr 1.2fr;">
            <span>Metrik Bisnis</span>
            <span>Bulan Ini (Agu)</span>
            <span>Bulan Lalu (Jul)</span>
            <span>Target Usaha</span>
            <span>Capaian Target</span>
          </div>
          
          <div class="analytics-table-row" style="grid-template-columns: 2fr 1.2fr 1.2fr 1.2fr 1.2fr;">
            <strong>Total Pendapatan (Revenue)</strong>
            <span style="font-weight: 700; color: var(--primary);">Rp 482.000.000</span>
            <span>Rp 431.000.000</span>
            <span>Rp 500.000.000</span>
            <span style="color: var(--success); font-weight: 700;">96.4% (On Track)</span>
          </div>

          <div class="analytics-table-row" style="grid-template-columns: 2fr 1.2fr 1.2fr 1.2fr 1.2fr;">
            <strong>Laba Bersih (Net Profit)</strong>
            <span style="font-weight: 700; color: var(--success);">Rp 96.400.000</span>
            <span>Rp 77.580.000</span>
            <span>Rp 100.000.000</span>
            <span style="color: var(--success); font-weight: 700;">96.4% (On Track)</span>
          </div>

          <div class="analytics-table-row" style="grid-template-columns: 2fr 1.2fr 1.2fr 1.2fr 1.2fr;">
            <strong>Rata-rata Order (AOV)</strong>
            <span style="font-weight: 700;">Rp 400.332</span>
            <span>Rp 381.270</span>
            <span>Rp 400.000</span>
            <span style="color: var(--success); font-weight: 700;">100.1% (Tercapai)</span>
          </div>

          <div class="analytics-table-row" style="grid-template-columns: 2fr 1.2fr 1.2fr 1.2fr 1.2fr;">
            <strong>Total Pelanggan Aktif</strong>
            <span style="font-weight: 700;">1.204 Pelanggan</span>
            <span>1.089 Pelanggan</span>
            <span>1.250 Pelanggan</span>
            <span style="color: var(--ai-primary); font-weight: 700;">96.3% (Tumbuh)</span>
          </div>
        </div>
      </div>
    `;
  }

  function getTabContent() {
    switch (activeTab) {
      case 'sales':     return renderSalesTab();
      case 'profit':    return renderProfitTab();
      case 'customer':  return renderCustomerTab();
      case 'marketing': return renderMarketingTab();
      case 'inventory': return renderInventoryTab();
      case 'cashflow':  return renderCashFlowTab();
      default:          return renderSalesTab();
    }
  }

  // 1. SALES / REVENUE TAB
  function renderSalesTab() {
    const monthlySlice = sliceMonthly(state.revenue.monthly);
    const totalRevInRange = sumField(monthlySlice, 'revenue');
    const latestRev = lastOf(monthlySlice, 'revenue');
    const firstRev = firstOf(monthlySlice, 'revenue');
    const change = pctChange(latestRev, firstRev);
    const revHistory = monthlySlice.map(m => ({ label: m.month.split('-')[1], value: m.revenue }));
    const channels = state.revenue.channels;

    return `
      <!-- KPI Row -->
      <div class="grid-4 analytics-kpi-row">
        ${kpiCard('Total Revenue (Period)', formatCurrency(totalRevInRange), changeIndicator(change), 'var(--primary)')}
        ${kpiCard('Latest Month', formatCurrency(latestRev), `vs target ${formatCurrency(state.kpis.revenue.target)}`, 'var(--ai-primary)')}
        ${kpiCard('Orders', formatNumber(state.kpis.orders.current), changeIndicator(state.kpis.orders.change_percent), 'var(--success)')}
        ${kpiCard(`Avg. Order Value ${renderContextHelp('aov')}`, formatCurrency(state.kpis.average_order_value.current), changeIndicator(state.kpis.average_order_value.change_percent), 'var(--secondary)')}
      </div>

      <div class="grid-2" style="margin-top:24px;">
        <!-- Revenue Trend Chart -->
        <div class="card">
          <div class="card-title">
            <span>Tren Pendapatan Bulanan (${activeGranularity.toUpperCase()})</span>
            <span style="font-size: 0.75rem; color: var(--primary);">+11.8% vs bulan lalu</span>
          </div>
          <div class="svg-chart-container" style="height:200px;margin-top:12px;">
            ${renderLineChart(revHistory, 480, 200, 'var(--primary)')}
          </div>
        </div>

        <!-- Channel Mix Donut with Drilldown Trigger (Stage J) -->
        <div class="card">
          <div class="card-title">
            <span>Komposisi Saluran Penjualan</span>
            <span style="font-size: 0.72rem; color: var(--text-muted);">Klik baris untuk Drill-Down</span>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-around;flex-wrap:wrap;gap:20px;margin-top:12px;">
            <div>${renderDonutChart(channels.map((c, i) => ({ ...c, color: getColor(i) })), 160)}</div>
            <div style="flex:1;min-width:200px;display:flex;flex-direction:column;gap:10px;">
              ${channels.map((c, i) => `
                <div class="btn-channel-drilldown" data-channel="${c.channel}" style="display:flex;justify-content:space-between;align-items:center;padding:6px 8px;border-radius:4px;border-bottom:1px solid var(--border-color);cursor:pointer;background:var(--bg-primary);transition:background 0.2s;" title="Klik untuk rincian produk channel ini">
                  <span style="display:flex;align-items:center;gap:8px;">
                    <span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:${getColor(i)};"></span>
                    <span style="font-size:0.88rem;font-weight:600;">${c.channel} 🔍</span>
                  </span>
                  <strong style="font-size:0.88rem;">${formatCurrency(c.revenue)} <span style="font-weight:400;color:var(--text-muted);">(${c.percentage}%)</span></strong>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Stage J: Period Comparison Card -->
      ${renderPeriodComparisonCard()}

      <!-- Stage J: Plain-Language AI Card -->
      ${renderPlainLanguageAICard(
        'Pertumbuhan Omzet Sehat Ditopang Penjualan Offline',
        'Omzet bulan Agustus mencapai Rp 482.000.000, tumbuh +11.8% dari bulan sebelumnya. Penjualan tertinggi berasal dari Outlet POS Fisik (45%) dan Website Direct (30%).',
        'Pertumbuhan ini mendekati target Rp 500 Juta (96.4%). Namun kanal TikTok Ads mengalami penurunan konversi sebesar -18% yang berpotensi menahan target jika tidak dioptimasi.',
        'Pindahkan sebagian anggaran iklan TikTok Ads ke Email Marketing yang memiliki ROI 6.0x, dan gencarkan paket bundling specialty beans di outlet fisik.',
        'rec_001'
      )}
    `;
  }

  // 2. PROFIT TAB
  function renderProfitTab() {
    const monthlySlice = sliceMonthly(state.profit.monthly);
    const totalProfit = sumField(monthlySlice, 'profit');
    const latestProfit = lastOf(monthlySlice, 'profit');
    const latestMargin = lastOf(monthlySlice, 'margin');
    const firstProfit = firstOf(monthlySlice, 'profit');
    const change = pctChange(latestProfit, firstProfit);
    const profitHistory = monthlySlice.map(m => ({ label: m.month.split('-')[1], value: m.profit }));
    const marginHistory = monthlySlice.map(m => ({ label: m.month.split('-')[1], value: m.margin }));

    return `
      <div class="grid-4 analytics-kpi-row">
        ${kpiCard('Total Profit (Period)', formatCurrency(totalProfit), changeIndicator(change), 'var(--success)')}
        ${kpiCard(`Latest Net Profit ${renderContextHelp('net_profit')}`, formatCurrency(latestProfit), `target: ${formatCurrency(state.kpis.profit.target)}`, 'var(--primary)')}
        ${kpiCard(`Profit Margin ${renderContextHelp('profit_margin')}`, `${latestMargin}%`, `target: ${state.kpis.profit_margin.target}%`, 'var(--ai-primary)')}
        ${kpiCard('Est. Monthly Costs', formatCurrency(state.kpis.revenue.current - latestProfit), 'HPP + Gaji + Operasional', 'var(--danger)')}
      </div>

      <div class="grid-2" style="margin-top:24px;">
        <div class="card">
          <h3 class="card-title">Tren Pertumbuhan Laba Bersih (Net Profit)</h3>
          <div class="svg-chart-container" style="height:200px;margin-top:12px;">
            ${renderLineChart(profitHistory, 480, 200, 'var(--success)')}
          </div>
        </div>

        <div class="card">
          <h3 class="card-title">Marjin Keuntungan Bulanan (%)</h3>
          <div class="svg-chart-container" style="height:200px;margin-top:12px;">
            ${renderLineChart(marginHistory, 480, 200, 'var(--ai-primary)')}
          </div>
        </div>
      </div>

      ${renderPeriodComparisonCard()}

      ${renderPlainLanguageAICard(
        'Marjin Laba Stabil di 20.0% dengan Efisiensi Biaya Operasional',
        'Laba bersih bulan Agustus tercatat Rp 96.400.000 dengan marjin 20.0%, naik konsisten dari 18.0% pada awal tahun.',
        'Kenaikan harga beli bahan baku kemasan (+4%) berhasil diimbangi oleh penghematan pemborosan bahan baku outlet.',
        'Lakukan pemesanan ulang biji kopi mentah (green beans) dalam volume besar untuk mendapatkan diskon supplier 8% sehingga marjin laba bisa naik ke 21.5%.',
        'rec_002'
      )}
    `;
  }

  // 3. CUSTOMER TAB
  function renderCustomerTab() {
    const summary = state.customers.summary;
    const segments = state.customers.segments;
    const growthSlice = sliceMonthly(state.customers.monthly);
    const latestTotal = lastOf(growthSlice, 'customers');
    const firstTotal = firstOf(growthSlice, 'customers');
    const change = pctChange(latestTotal, firstTotal);
    const growthChart = growthSlice.map(m => ({ label: m.month.split('-')[1], value: m.customers }));

    return `
      <div class="grid-4 analytics-kpi-row">
        ${kpiCard('Total Customers', formatNumber(latestTotal), changeIndicator(change), 'var(--primary)')}
        ${kpiCard('New (Period)', formatNumber(summary.new_this_month), 'pelanggan baru bulan ini', 'var(--success)')}
        ${kpiCard(`Retention Rate ${renderContextHelp('retention')}`, `${summary.retention_rate}%`, `churn: ${summary.churn_rate}%`, 'var(--ai-primary)')}
        ${kpiCard('Pelanggan Setia (Returning)', formatNumber(summary.returning), `dari ${formatNumber(summary.total)} total`, 'var(--secondary)')}
      </div>

      <div class="grid-2" style="margin-top:24px;">
        <div class="card">
          <h3 class="card-title">Pertumbuhan Basis Pelanggan</h3>
          <div class="svg-chart-container" style="height:200px;margin-top:12px;">
            ${renderLineChart(growthChart, 480, 200, 'var(--primary)')}
          </div>
        </div>

        <div class="card">
          <h3 class="card-title">Segmentasi Pelanggan</h3>
          <div style="display:flex;flex-wrap:wrap;gap:24px;margin-top:16px;">
            <div style="flex:0 0 160px;">
              ${renderDonutChart(segments.map((s, i) => ({ ...s, channel: s.name, color: getColor(i) })), 160)}
            </div>
            <div style="flex:1;min-width:200px;display:flex;flex-direction:column;gap:12px;">
              ${segments.map((seg, i) => `
                <div>
                  <div style="display:flex;justify-content:space-between;font-size:0.85rem;margin-bottom:4px;">
                    <strong>${seg.name}</strong>
                    <span>${formatNumber(seg.customers)} (${seg.percentage}%)</span>
                  </div>
                  <div style="width:100%;height:6px;background:var(--border-color);border-radius:3px;overflow:hidden;">
                    <div style="width:${seg.percentage}%;height:100%;background:${getColor(i)};border-radius:3px;"></div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      ${renderPlainLanguageAICard(
        'Loyalitas Pelanggan Sangat Kuat (Retensi 65%)',
        'Pelanggan repeat order menyumbang 782 dari 1.204 total pelanggan aktif. Pelanggan baru bulan ini bertambah 115 orang.',
        'Tingkat retensi 65% berada di atas rata-rata industri kopi (50-55%), menjadi pondasi arus kas yang sangat stabil.',
        'Luncurkan program membership poin via WhatsApp / Email untuk mendorong frekuensi repeat order dari 1.8x menjadi 2.5x per bulan.',
        'rec_001'
      )}
    `;
  }

  // 4. MARKETING TAB
  function renderMarketingTab() {
    const m = state.marketing;
    const channels = m.channels;
    const bestChannel = [...channels].sort((a, b) => b.roi - a.roi)[0];

    return `
      <div class="grid-4 analytics-kpi-row">
        ${kpiCard('Attributed Revenue', formatCurrency(m.revenue_attributed), `dari ${formatCurrency(m.spend)} biaya iklan`, 'var(--primary)')}
        ${kpiCard(`Overall ROI ${renderContextHelp('roi')}`, `${m.roi}x`, `target: ${state.kpis.marketing_roi.target}x`, m.roi >= state.kpis.marketing_roi.target ? 'var(--success)' : 'var(--warning)')}
        ${kpiCard(`Conversion Rate ${renderContextHelp('conversion_rate')}`, `${m.conversion_rate}%`, `tertinggi: ${bestChannel.channel}`, 'var(--ai-primary)')}
        ${kpiCard(`Cost / Acquisition ${renderContextHelp('cpa')}`, formatCurrency(m.cost_per_acquisition), 'biaya per pelanggan baru', 'var(--success)')}
      </div>

      <div class="card" style="margin-top:24px;">
        <h3 class="card-title">Kinerja Kanal Pemasaran & Iklan</h3>
        <div class="analytics-table-wrap">
          <div class="analytics-table-header" style="grid-template-columns:2fr 1fr 1fr 1fr 1fr;">
            <span>Kanal Iklan</span><span>Biaya (Spend)</span><span>Omzet Dihasilkan</span><span>ROI</span><span>Konversi</span>
          </div>
          ${channels.map((ch, i) => `
            <div class="analytics-table-row" style="grid-template-columns:2fr 1fr 1fr 1fr 1fr;">
              <strong>${ch.channel}</strong>
              <span>${formatCurrency(ch.spend)}</span>
              <span>${formatCurrency(ch.revenue)}</span>
              <span style="font-weight:700;color:${ch.roi >= 4 ? 'var(--success)' : (ch.roi >= 3 ? 'var(--ai-primary)' : 'var(--warning)')};">${ch.roi}x</span>
              <span>${formatNumber(ch.conversions)} Pesanan</span>
            </div>
          `).join('')}
        </div>
      </div>

      ${renderPlainLanguageAICard(
        'Email Marketing Menghasilkan ROI Tertinggi (6.0x)',
        'Biaya promosi Rp 28,5 Juta menghasilkan omzet teratribusi Rp 98 Juta. Kanal Email Marketing mencatatkan ROI 6.0x, sedangkan TikTok Ads tertahan di 2.58x.',
        'TikTok Ads menyedot 42% total budget iklan tetapi menghasilkan efisiensi di bawah target standar 3.0x.',
        'Segera alihkan Rp 5.000.000 dari budget TikTok Ads ke kampanye Email newsletter dan diskon bundling pelanggan lama.',
        'rec_001'
      )}
    `;
  }

  // 5. INVENTORY TAB
  function renderInventoryTab() {
    const inv = state.inventory || {};
    const items = inv.items || [];
    const lowCount = inv.low_stock_skus !== undefined ? inv.low_stock_skus : (inv.low_stock_count !== undefined ? inv.low_stock_count : items.filter(i => i.stock < i.reorder_point).length);
    const overCount = inv.overstock_skus !== undefined ? inv.overstock_skus : (inv.overstock_count !== undefined ? inv.overstock_count : items.filter(i => i.status === 'overstock').length);
    const totalCount = inv.total_skus || inv.total_items || items.length;
    const healthScore = inv.health_score || (state.kpis?.inventory_health?.current) || 86;

    return `
      <div class="grid-4 analytics-kpi-row">
        ${kpiCard('Skor Kesehatan Stok', `${healthScore}%`, `target: ${state.kpis?.inventory_health?.target || 90}%`, 'var(--warning)')}
        ${kpiCard('Total SKU Produk', formatNumber(totalCount), 'produk aktif di katalog', 'var(--primary)')}
        ${kpiCard('Stok Kritis (Reorder)', `${lowCount} SKU`, 'perlu dipesan ulang segera', 'var(--danger)')}
        ${kpiCard('Stok Mengendap (Overstock)', `${overCount} SKU`, 'risiko modal tertahan', 'var(--warning)')}
      </div>

      <div class="card" style="margin-top:24px;">
        <h3 class="card-title">Daftar Persediaan Produk Kunci</h3>
        <div class="analytics-table-wrap">
          <div class="analytics-table-header" style="grid-template-columns:2fr 1fr 1fr 1fr 1fr;">
            <span>Nama Produk</span><span>Stok Saat Ini</span><span>Batas Reorder</span><span>Status</span><span>Nilai Stok</span>
          </div>
          ${items.map(item => {
            const unit = item.unit || (item.name.includes('Powder') ? 'kg' : (item.name.includes('Bottle') ? 'btl' : (item.name.includes('Latte') ? 'cup' : (item.name.includes('Croissant') ? 'pcs' : 'pack'))));
            const unitPrice = item.unit_price || (item.name.includes('1kg') ? 220000 : (item.name.includes('Powder') ? 180000 : (item.name.includes('Bottle') ? 35000 : (item.name.includes('Latte') ? 38000 : (item.name.includes('Croissant') ? 28000 : 65000)))));
            const stockVal = unitPrice * (item.stock || 0);

            return `
              <div class="analytics-table-row" style="grid-template-columns:2fr 1fr 1fr 1fr 1fr;">
                <strong>${item.name}</strong>
                <span>${item.stock} ${unit}</span>
                <span>${item.reorder_point} ${unit}</span>
                <span class="badge ${item.status === 'low_stock' ? 'badge-high' : (item.status === 'overstock' ? 'badge-medium' : 'badge-low')}" style="font-size:0.65rem;">
                  ${item.status.replace('_', ' ')}
                </span>
                <span>${formatCurrency(stockVal)}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      ${renderPlainLanguageAICard(
        'House Blend 1kg dan Matcha Latte Berada di Batas Reorder Kritis',
        'Stok House Blend Arabica tersisa 18 kg (batas reorder 25 kg), cukup untuk 4 hari operasional outlet.',
        'Jika kehabisan stok, potensi kehilangan omzet harian diperkirakan mencapai Rp 6.000.000 per hari.',
        'Terbitkan Purchase Order untuk 100 kg House Blend 1kg dan 30 kg Matcha Latte powder hari ini.',
        'rec_002'
      )}
    `;
  }

  // 6. CASH FLOW TAB
  function renderCashFlowTab() {
    const revSlice = sliceMonthly(state.revenue.monthly);
    const profitSlice = sliceMonthly(state.profit.monthly);
    const cashFlowData = revSlice.map((m, i) => {
      const p = profitSlice[i] || { profit: Math.round(m.revenue * 0.2) };
      return {
        label: m.month.split('-')[1],
        value: p.profit
      };
    });

    return `
      <div class="grid-4 analytics-kpi-row">
        ${kpiCard(`Net Cash Flow (Est.) ${renderContextHelp('cash_flow')}`, formatCurrency(sumField(cashFlowData, 'value')), 'surplus kas operasional', 'var(--success)')}
        ${kpiCard('Kas Masuk Terkini', formatCurrency(lastOf(revSlice, 'revenue')), 'omzet penjualan kotor', 'var(--primary)')}
        ${kpiCard('Kas Keluar Terkini', formatCurrency(lastOf(revSlice, 'revenue') - lastOf(profitSlice, 'profit')), 'estimasi total beban kas', 'var(--danger)')}
        ${kpiCard('Cash Runway', '6.4 Bulan', 'cadangan likuiditas aman', 'var(--ai-primary)')}
      </div>

      <div class="card" style="margin-top:24px;">
        <h3 class="card-title">Arus Kas Masuk Bersih Bulanan (Surplus Operasional)</h3>
        <div class="svg-chart-container" style="height:200px;margin-top:12px;">
          ${renderBarChart(cashFlowData, 500, 200, 'var(--success)')}
        </div>
      </div>

      ${renderPeriodComparisonCard()}

      ${renderPlainLanguageAICard(
        'Likuiditas Kas Sangat Sehat dengan Cadangan Runway 6.4 Bulan',
        'Arus kas operasional surplus Rp 96,4 Juta pada bulan Agustus, dengan total cadangan kas aman untuk 6.4 bulan ke depan.',
        'Kondisi likuiditas ini memberi ruang fleksibilitas untuk membuka ekspansi outlet kedua atau menambah mesin sangrai baru.',
        'Pertahankan alokasi dana darurat minimal 3 bulan beban operasional sebelum memutuskan ekspansi besar.',
        'rec_003'
      )}
    `;
  }

  // Stage J: Channel Drilldown Modal
  function renderChannelDrilldownModal(channel) {
    return `
      <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px;">
        <div class="card animate-fade-in" style="max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 26px; background: var(--bg-secondary); border: 2px solid var(--primary); box-shadow: var(--shadow-lg);">
          
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 16px;">
            <div>
              <span style="font-size: 0.75rem; font-weight: 800; color: var(--primary); text-transform: uppercase;">🔍 DRILL-DOWN SALURAN PENJUALAN</span>
              <h3 style="font-size: 1.2rem; font-weight: 700; color: var(--text-primary); margin-top: 2px;">Kanal: ${channel.channel}</h3>
            </div>
            <button class="btn btn-secondary btn-sm" id="btn-close-drill-modal" style="padding: 4px 10px; font-size: 1.1rem;">&times;</button>
          </div>

          <div style="background: var(--bg-input); padding: 14px 16px; border-radius: var(--radius-sm); margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <span style="font-size: 0.8rem; color: var(--text-secondary); display: block;">Total Omzet Kanal:</span>
              <strong style="font-size: 1.2rem; color: var(--primary);">${formatCurrency(channel.revenue)}</strong>
            </div>
            <span class="badge badge-low" style="font-size: 0.85rem; padding: 6px 12px;">Kontribusi: ${channel.percentage}%</span>
          </div>

          <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 8px;">Top Produk Terlaris di Kanal Ini:</h4>
          <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
            <div style="padding: 10px 12px; background: var(--bg-primary); border-radius: 4px; border: 1px solid var(--border-color); display: flex; justify-content: space-between;">
              <span>1. House Blend 1kg Specialty</span>
              <strong>${formatCurrency(channel.revenue * 0.45)} (45%)</strong>
            </div>
            <div style="padding: 10px 12px; background: var(--bg-primary); border-radius: 4px; border: 1px solid var(--border-color); display: flex; justify-content: space-between;">
              <span>2. Single Origin Gayo 250g</span>
              <strong>${formatCurrency(channel.revenue * 0.30)} (30%)</strong>
            </div>
            <div style="padding: 10px 12px; background: var(--bg-primary); border-radius: 4px; border: 1px solid var(--border-color); display: flex; justify-content: space-between;">
              <span>3. Ready-to-Drink Cold Brew 1L</span>
              <strong>${formatCurrency(channel.revenue * 0.25)} (25%)</strong>
            </div>
          </div>

          <div style="background: var(--bg-primary); border-left: 3px solid var(--ai-primary); padding: 10px 12px; font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 16px;">
            💡 <strong>Saran AIbo untuk Kanal Ini:</strong> Tingkatkan ketersediaan stok produk kemasan 1kg pada kanal ini untuk menjaga kecepatan pemenuhan pesanan.
          </div>

          <div style="display: flex; justify-content: flex-end;">
            <button class="btn btn-secondary" id="btn-close-drill-modal-2">Tutup Rincian</button>
          </div>

        </div>
      </div>
    `;
  }

  function bindEvents() {
    const tabBtns = document.querySelectorAll('.analytics-tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.dataset.tab;
        updateView();
      });
    });

    const periodSelect = document.getElementById('filter-period');
    if (periodSelect) {
      periodSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === 'all')        dateRange = { start: 0, end: 7 };
        else if (val === 'q1')    dateRange = { start: 0, end: 2 };
        else if (val === 'q2')    dateRange = { start: 3, end: 5 };
        else if (val === 'q3')    dateRange = { start: 6, end: 7 };
        else if (val === 'last3') dateRange = { start: 5, end: 7 };
        else if (val === 'last6') dateRange = { start: 2, end: 7 };
        updateView();
      });
    }

    // Granularity Toggle
    const granBtns = document.querySelectorAll('#granularity-toggle-bar button');
    granBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        activeGranularity = btn.dataset.gran;
        showToast(`Granularitas grafik diubah ke ${btn.textContent}`, "info");
        updateView();
      });
    });

    // Channel Drilldown Clicks
    const channelRows = document.querySelectorAll('.btn-channel-drilldown');
    channelRows.forEach(row => {
      row.addEventListener('click', () => {
        const channelName = row.dataset.channel;
        activeChannelDrilldown = state.revenue.channels.find(c => c.channel === channelName);
        updateView();
      });
    });

    const closeD1 = document.getElementById('btn-close-drill-modal');
    const closeD2 = document.getElementById('btn-close-drill-modal-2');
    if (closeD1) closeD1.addEventListener('click', () => { activeChannelDrilldown = null; updateView(); });
    if (closeD2) closeD2.addEventListener('click', () => { activeChannelDrilldown = null; updateView(); });

    // Analytics KPI Card Click -> Open Detail Comparison Modal
    const kpiCards = document.querySelectorAll('.analytics-kpi-card');
    const chartModal = document.getElementById('analytics-chart-modal');
    const modalTitle = document.getElementById('chart-modal-title');
    const modalBody = document.getElementById('chart-modal-body');
    const closeChartModalBtn = document.getElementById('btn-close-chart-modal');

    if (kpiCards && chartModal) {
      kpiCards.forEach(card => {
        card.addEventListener('click', () => {
          const metricName = card.dataset.metric || card.querySelector('.kpi-label')?.textContent || 'Metrik';
          const metricVal = card.querySelector('.kpi-number')?.textContent || '-';
          const metricSub = card.querySelector('.kpi-subtext')?.textContent || '';

          modalTitle.textContent = `📊 Detail Analisis & Benchmark: ${metricName.replace(/ⓘ/g, '').trim()}`;
          modalBody.innerHTML = `
            <div style="background: var(--bg-primary); padding: 14px 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="font-size: 0.8rem; color: var(--text-muted); display: block;">Nilai Metrik Periode Ini:</span>
                <strong style="font-size: 1.4rem; color: var(--primary);">${metricVal}</strong>
              </div>
              <span style="font-size: 0.82rem; color: var(--text-secondary);">${metricSub}</span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 8px;">
              <strong style="font-size: 0.88rem; color: var(--text-primary);">Evaluasi & Benchmark AIbo:</strong>
              <div style="background: var(--bg-card); padding: 12px; border-radius: 6px; font-size: 0.83rem; line-height: 1.5; color: var(--text-secondary);">
                Metrik ini menunjukkan stabilitas yang baik untuk skala bisnis Food & Beverage. AIbo memproyeksikan target akhir kuartal akan tercapai jika efisiensi operasional dan saluran berkinerja tinggi dipertahankan.
              </div>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px; border-top: 1px solid var(--border-color); padding-top: 12px;">
              <button class="btn btn-secondary btn-sm" id="btn-close-chart-modal-2">Tutup</button>
              <button class="btn btn-primary btn-sm" id="btn-modal-goto-decision">Lihat Saran AIbo di Decision Center ➔</button>
            </div>
          `;
          chartModal.style.display = 'flex';

          const closeM2 = document.getElementById('btn-close-chart-modal-2');
          if (closeM2) closeM2.addEventListener('click', () => { chartModal.style.display = 'none'; });

          const gotoDec = document.getElementById('btn-modal-goto-decision');
          if (gotoDec) gotoDec.addEventListener('click', () => {
            chartModal.style.display = 'none';
            onNavigate('decision');
          });
        });
      });
    }

    if (closeChartModalBtn && chartModal) {
      closeChartModalBtn.addEventListener('click', () => {
        chartModal.style.display = 'none';
      });
      chartModal.addEventListener('click', (e) => {
        if (e.target === chartModal) chartModal.style.display = 'none';
      });
    }

    // Link to Decision Center from AI explainability cards
    const decisionNavBtns = document.querySelectorAll('.btn-goto-decision-rec');
    decisionNavBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        onNavigate('decision');
      });
    });

    const exportCsvBtn = document.getElementById('btn-export-csv');
    if (exportCsvBtn) {
      exportCsvBtn.addEventListener('click', () => {
        showToast("Ekspor Data CSV — Prototype Simulation Active", "success");
      });
    }
  }

  updateView();
}
