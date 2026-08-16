// utils.js
// Common helper functions for formatting and SVG graph rendering

export function formatCurrency(value) {
  if (value === undefined || value === null) return "Rp 0";
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(value);
}

export function formatPercent(value) {
  if (value === undefined || value === null) return "0%";
  return `${value}%`;
}

export function formatNumber(value) {
  if (value === undefined || value === null) return "0";
  return new Intl.NumberFormat('id-ID').format(value);
}

// Generate simple SVG line chart
export function renderLineChart(data, width = 500, height = 200, strokeColor = '#6366f1') {
  if (!data || data.length === 0) return '';
  
  const padding = 30;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  
  const values = data.map(d => d.value);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min;
  
  const points = data.map((d, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((d.value - min) / range) * chartHeight;
    return `${x},${y}`;
  }).join(' ');
  
  const gridLines = [];
  // Render horizontal gridlines (3 lines)
  for (let i = 0; i <= 2; i++) {
    const y = padding + (i / 2) * chartHeight;
    gridLines.push(`<line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" stroke="var(--border-color)" stroke-dasharray="4,4" />`);
  }

  // Draw labels
  const labels = data.map((d, index) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    return `<text x="${x}" y="${height - 5}" font-size="9" fill="var(--text-secondary)" text-anchor="middle">${d.label}</text>`;
  }).join(' ');

  return `
    <svg viewBox="0 0 ${width} ${height}" class="svg-chart">
      ${gridLines.join('')}
      <polyline fill="none" stroke="${strokeColor}" stroke-width="3" points="${points}" />
      ${data.map((d, index) => {
        const x = padding + (index / (data.length - 1)) * chartWidth;
        const y = padding + chartHeight - ((d.value - min) / range) * chartHeight;
        return `<circle cx="${x}" cy="${y}" r="4" fill="var(--bg-secondary)" stroke="${strokeColor}" stroke-width="2" class="chart-dot" data-val="${d.value}" />`;
      }).join('')}
      ${labels}
    </svg>
  `;
}

// Generate simple SVG donut chart
export function renderDonutChart(slices, size = 150) {
  if (!slices || slices.length === 0) return '';
  
  const radius = size * 0.35;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;
  
  let accumulatedPercent = 0;
  
  const paths = slices.map((slice, i) => {
    const strokeDash = (slice.percentage / 100) * circumference;
    const strokeOffset = circumference - ((accumulatedPercent / 100) * circumference);
    accumulatedPercent += slice.percentage;
    
    return `
      <circle cx="${center}" cy="${center}" r="${radius}"
        fill="transparent"
        stroke="${slice.color || `hsl(${i * 60 + 200}, 70%, 50%)`}"
        stroke-width="${size * 0.1}"
        stroke-dasharray="${strokeDash} ${circumference}"
        stroke-dashoffset="${strokeOffset}"
        transform="rotate(-90 ${center} ${center})"
        class="donut-slice" />
    `;
  }).join('');
  
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${center}" cy="${center}" r="${radius}" fill="transparent" stroke="var(--border-color)" stroke-width="${size * 0.1}" />
      ${paths}
      <text x="${center}" y="${center + 5}" font-size="12" font-weight="700" fill="var(--text-primary)" text-anchor="middle">Channels</text>
    </svg>
  `;
}

// Generate simple SVG bar chart
export function renderBarChart(data, width = 500, height = 200, barColor = '#6366f1') {
  if (!data || data.length === 0) return '';
  
  const padding = 30;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  
  const values = data.map(d => d.value);
  const max = Math.max(...values, 1);
  
  const barWidth = Math.min(40, (chartWidth / data.length) * 0.6);
  const barGap = (chartWidth - barWidth * data.length) / (data.length + 1);
  
  const bars = data.map((d, index) => {
    const barHeight = (d.value / max) * chartHeight;
    const x = padding + barGap + index * (barWidth + barGap);
    const y = padding + chartHeight - barHeight;
    return `
      <rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}"
        fill="${barColor}" rx="3" ry="3" opacity="0.85" class="bar-rect">
        <animate attributeName="height" from="0" to="${barHeight}" dur="0.5s" fill="freeze" />
        <animate attributeName="y" from="${padding + chartHeight}" to="${y}" dur="0.5s" fill="freeze" />
      </rect>
      <text x="${x + barWidth / 2}" y="${y - 6}" font-size="9" fill="var(--text-secondary)" text-anchor="middle" font-weight="600">${typeof d.value === 'number' && d.value >= 1000000 ? (d.value / 1000000).toFixed(0) + 'M' : d.value}</text>
    `;
  }).join('');
  
  const labels = data.map((d, index) => {
    const x = padding + barGap + index * (barWidth + barGap) + barWidth / 2;
    return `<text x="${x}" y="${height - 5}" font-size="9" fill="var(--text-secondary)" text-anchor="middle">${d.label}</text>`;
  }).join('');
  
  // Grid lines
  const gridLines = [];
  for (let i = 0; i <= 3; i++) {
    const y = padding + (i / 3) * chartHeight;
    gridLines.push(`<line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" stroke="var(--border-color)" stroke-dasharray="4,4" />`);
  }
  
  return `
    <svg viewBox="0 0 ${width} ${height}" class="svg-chart">
      ${gridLines.join('')}
      ${bars}
      ${labels}
    </svg>
  `;
}

// Toast notification helper
export function showToast(message, type = 'info', duration = 3000) {
  let toastContainer = document.getElementById('aibo-toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'aibo-toast-container';
    toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 380px;
      pointer-events: none;
    `;
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  const typeColors = {
    info: 'var(--primary)',
    success: 'var(--success)',
    warning: 'var(--warning)',
    danger: 'var(--danger)'
  };
  const bg = typeColors[type] || 'var(--primary)';

  toast.style.cssText = `
    background: var(--bg-card-solid);
    border-left: 4px solid ${bg};
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    padding: 12px 16px;
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-lg);
    font-size: 0.88rem;
    pointer-events: auto;
    opacity: 0;
    transform: translateX(30px);
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex;
    align-items: center;
    gap: 10px;
  `;

  const iconMap = { info: 'ℹ️', success: '✅', warning: '⚠️', danger: '🚨' };
  toast.innerHTML = `<span>${iconMap[type] || 'ℹ️'}</span><span>${message}</span>`;

  toastContainer.appendChild(toast);

  // Trigger entrance
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(0)';
  });

  // Auto remove
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(30px)';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, duration);
}

// Numerical roll-in counter animation helper
export function animateCounter(element, targetValue, duration = 600, formatter = null) {
  if (!element) return;
  const startVal = 0;
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const current = Math.floor(startVal + (targetValue - startVal) * progress);

    element.textContent = formatter ? formatter(current) : current;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = formatter ? formatter(targetValue) : targetValue;
    }
  }

  requestAnimationFrame(update);
}

