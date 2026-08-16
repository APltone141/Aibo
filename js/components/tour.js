// tour.js
// First Login Product Tour & Tour Controls (Stages A & B) for AIbo MVP Phase 4.5
// Guides SME/UMKM users through AIbo's core features with contextual tooltips and local persistence.

import { t } from '../i18n.js';
import { showToast } from '../utils.js';

export function initProductTour(appState, onNavigate, forceRestart = false) {
  if (!appState.tour) {
    appState.tour = {
      completed: localStorage.getItem('aibo_tour_completed') === 'true',
      skipped: localStorage.getItem('aibo_tour_skipped') === 'true',
      currentStep: 0
    };
  }

  // If already completed or skipped and not force restarted, skip tour launch
  if (!forceRestart && (appState.tour.completed || appState.tour.skipped)) {
    return;
  }

  // Reset step if force restarted
  if (forceRestart) {
    appState.tour.completed = false;
    appState.tour.skipped = false;
    appState.tour.currentStep = 0;
    localStorage.removeItem('aibo_tour_completed');
    localStorage.removeItem('aibo_tour_skipped');
  }

  const tourSteps = [
    {
      id: 'welcome',
      target: null,
      screen: 'dashboard',
      title: '👋 Selamat Datang di AIbo!',
      content: 'AIbo adalah AI Business Companion yang membantu Anda memahami performa usaha, mendeteksi masalah, dan mengambil tindakan terbaik tanpa rumus rumit.',
      position: 'center'
    },
    {
      id: 'dashboard',
      target: '#nav-dashboard',
      screen: 'dashboard',
      title: '📊 Executive Dashboard',
      content: 'Pusat kontrol utama usaha Anda. Di sini Anda dapat melihat kesehatan bisnis, metrik kunci (KPI), dan rekomendasi prioritas AIbo.',
      position: 'bottom'
    },
    {
      id: 'health',
      target: '.health-gauge-card, [id*="health"]',
      screen: 'dashboard',
      title: '❤️ Skor Kesehatan Usaha (6 Dimensi)',
      content: 'AIbo mengukur kesehatan bisnis Anda secara holistik melalui 6 dimensi: Revenue, Profitability, Customers, Marketing, Inventory, dan Cash Flow. Klik skor ini untuk detail.',
      position: 'right'
    },
    {
      id: 'kpis',
      target: '.kpi-grid, [class*="kpi"]',
      screen: 'dashboard',
      title: '📈 Kartu Metrik Kunci (KPI)',
      content: 'Pantau Omzet, Laba Bersih, Marjin Laba, dan Jumlah Pelanggan secara real-time. Setiap kartu bisa diklik untuk melihat faktor penyebab perubahan (drivers).',
      position: 'bottom'
    },
    {
      id: 'analytics',
      target: '#nav-analytics',
      screen: 'analytics',
      title: '🔍 Analisis Mendalam (6 Tab)',
      content: 'Gali data penjualan, profitabilitas, segmen pelanggan, ROI marketing, kesehatan stok, dan arus kas. Setiap grafik dilengkapi penjelasan bahasa awam dari AIbo.',
      position: 'bottom'
    },
    {
      id: 'decision',
      target: '#nav-decision',
      screen: 'decision',
      title: '💡 Decision Center & 8-Langkah Transparansi',
      content: 'Tempat AIbo memberikan rekomendasi strategis. Setiap rekomendasi dijelaskan lengkap melalui 8 langkah transparansi: Ringkasan → Penyebab → Bukti → Dampak → Opsi → Konsekuensi → Saran → Aksi.',
      position: 'bottom'
    },
    {
      id: 'action',
      target: '#nav-action',
      screen: 'action',
      title: '📋 Action Center & Task Board',
      content: 'Ubah rekomendasi AIbo menjadi daftar tugas nyata. Kelola dalam tampilan List atau Kanban Board (To Do, In Progress, Completed), dan cetak laporan bisnis.',
      position: 'bottom'
    },
    {
      id: 'datacenter',
      target: '#nav-data',
      screen: 'data',
      title: '🔗 Data Center & Quality Scorecard',
      content: 'Hubungkan platform kasir POS, e-commerce, atau unggah file transaksi bulanan Anda. AIbo akan mengecek tingkat akurasi dan kelengkapan data usaha Anda.',
      position: 'bottom'
    },
    {
      id: 'copilot',
      target: '#chat-messages-box, #chat-user-input',
      screen: 'decision',
      title: '🤖 AI Business Copilot',
      content: 'Tanyakan apa saja tentang kondisi usaha Anda kapan saja! AIbo siap menjawab pertanyaan seperti: "Kenapa omzet minggu ini turun?" atau "Produk apa yang paling laku?"',
      position: 'top-left'
    },
    {
      id: 'finish',
      target: null,
      screen: 'dashboard',
      title: '🎉 Tour Selesai & Siap Digunakan!',
      content: 'Anda sudah mengenal seluruh fitur utama AIbo. Anda bisa membuka kembali Tur Produk ini kapan saja melalui tombol bantuan ❓ di bagian atas antarmuka.',
      position: 'center'
    }
  ];

  let currentStepIdx = appState.tour.currentStep || 0;

  function renderStep() {
    // Clean existing tour elements
    removeTourDOM();

    if (currentStepIdx >= tourSteps.length) {
      completeTour();
      return;
    }

    const step = tourSteps[currentStepIdx];
    appState.tour.currentStep = currentStepIdx;

    // Navigate to step screen if necessary
    if (step.screen && onNavigate) {
      onNavigate(step.screen);
    }

    // Wait short delay for screen render
    setTimeout(() => {
      buildTourUI(step);
    }, 150);
  }

  function buildTourUI(step) {
    removeTourDOM();

    // Create backdrop overlay
    const backdrop = document.createElement('div');
    backdrop.id = 'tour-backdrop';
    backdrop.style.cssText = `
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(3px);
      z-index: 99990;
      pointer-events: auto;
    `;
    document.body.appendChild(backdrop);

    // Create Tooltip Modal Card
    const card = document.createElement('div');
    card.id = 'tour-popover-card';
    card.className = 'card animate-fade-in';
    card.style.cssText = `
      position: fixed;
      z-index: 99995;
      width: 360px;
      max-width: 90vw;
      background: var(--bg-card-solid);
      border: 2px solid var(--primary);
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
      padding: 20px;
      border-radius: var(--radius-md);
      color: var(--text-primary);
    `;

    // Position popover
    if (step.position === 'center' || !step.target) {
      card.style.top = '50%';
      card.style.left = '50%';
      card.style.transform = 'translate(-50%, -50%)';
    } else {
      const el = document.querySelector(step.target);
      if (el) {
        const rect = el.getBoundingClientRect();
        
        // Highlight element
        const highlight = document.createElement('div');
        highlight.id = 'tour-element-highlight';
        highlight.style.cssText = `
          position: fixed;
          top: ${rect.top - 6}px;
          left: ${rect.left - 6}px;
          width: ${rect.width + 12}px;
          height: ${rect.height + 12}px;
          border: 3px solid var(--primary);
          border-radius: var(--radius-sm);
          z-index: 99992;
          pointer-events: none;
          box-shadow: 0 0 20px var(--primary-glow);
          transition: all 0.3s ease;
        `;
        document.body.appendChild(highlight);

        // Smart position card near element
        if (window.innerWidth <= 768) {
          card.style.bottom = '90px';
          card.style.left = '50%';
          card.style.transform = 'translateX(-50%)';
        } else {
          card.style.top = Math.min(window.innerHeight - 260, Math.max(80, rect.bottom + 12)) + 'px';
          card.style.left = Math.min(window.innerWidth - 380, Math.max(20, rect.left)) + 'px';
        }
      } else {
        // Fallback to center
        card.style.top = '50%';
        card.style.left = '50%';
        card.style.transform = 'translate(-50%, -50%)';
      }
    }

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-bottom: 12px;">
        <span style="font-size: 0.75rem; font-weight: 700; color: var(--primary); font-family: var(--font-display);">
          📌 TUR PRODUK AIBO (${currentStepIdx + 1} / ${tourSteps.length})
        </span>
        <button id="btn-tour-skip" style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.78rem; text-decoration: underline;">
          Lewati Tour
        </button>
      </div>

      <h4 style="font-size: 1.05rem; font-weight: 700; margin-bottom: 8px; color: var(--text-primary);">${step.title}</h4>
      <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 16px;">${step.content}</p>

      <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; border-top: 1px solid var(--border-color); padding-top: 12px;">
        <button class="btn btn-secondary btn-sm" id="btn-tour-prev" ${currentStepIdx === 0 ? 'disabled style="opacity: 0.4;"' : ''}>
          ◀ Kembali
        </button>

        <div style="display: flex; gap: 4px;">
          ${tourSteps.map((_, idx) => `
            <div style="width: 6px; height: 6px; border-radius: 50%; background: ${idx === currentStepIdx ? 'var(--primary)' : 'var(--border-color)'};"></div>
          `).join('')}
        </div>

        <button class="btn btn-primary btn-sm" id="btn-tour-next">
          ${currentStepIdx === tourSteps.length - 1 ? 'Selesai 🎉' : 'Lanjut ▶'}
        </button>
      </div>
    `;

    document.body.appendChild(card);

    // Bind event listeners
    document.getElementById('btn-tour-next')?.addEventListener('click', () => {
      currentStepIdx++;
      renderStep();
    });

    document.getElementById('btn-tour-prev')?.addEventListener('click', () => {
      if (currentStepIdx > 0) {
        currentStepIdx--;
        renderStep();
      }
    });

    document.getElementById('btn-tour-skip')?.addEventListener('click', () => {
      skipTour();
    });
  }

  function removeTourDOM() {
    document.getElementById('tour-backdrop')?.remove();
    document.getElementById('tour-popover-card')?.remove();
    document.getElementById('tour-element-highlight')?.remove();
  }

  function completeTour() {
    removeTourDOM();
    appState.tour.completed = true;
    appState.tour.skipped = false;
    localStorage.setItem('aibo_tour_completed', 'true');
    showToast("Selamat! Tur produk AIbo telah selesai.", "success");
  }

  function skipTour() {
    removeTourDOM();
    appState.tour.skipped = true;
    localStorage.setItem('aibo_tour_skipped', 'true');
    showToast("Tur produk dilewati. Anda bisa membukanya kembali dari tombol Bantuan ❓", "info");
  }

  renderStep();
}
