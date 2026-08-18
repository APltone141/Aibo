// contextHelp.js
// Contextual Terminology Help System (Stage C) for AIbo MVP Phase 4.5
// Renders readable ⓘ info popovers for SME/UMKM business metrics.

import { getIcon } from '../icons.js';

export const terminologyDictionary = {
  aov: {
    title: 'AOV (Average Order Value)',
    definition: 'Rata-rata nilai pendapatan yang didapatkan usaha Anda dalam satu kali transaksi.',
    example: 'Jika omzet Rp 10.000.000 berasal dari 100 transaksi pesanan, AOV Anda adalah Rp 100.000 per transaksi.'
  },
  roi: {
    title: 'ROI (Return on Investment)',
    definition: 'Rasio tingkat pengembalian modal atau laba yang didapatkan dari biaya investasi/marketing.',
    example: 'Biaya iklan Rp 1.000.000 menghasilkan omzet tambahan Rp 5.000.000. Nilai ROI Anda adalah 5.0x (500%).'
  },
  cpa: {
    title: 'CPA (Cost Per Acquisition)',
    definition: 'Rata-rata biaya pemasaran yang dikeluarkan untuk mendapatkan 1 pelanggan baru.',
    example: 'Total biaya iklan Rp 2.000.000 berhasil mendatangkan 40 pelanggan baru. CPA Anda adalah Rp 50.000 per pelanggan.'
  },
  conversion_rate: {
    title: 'Conversion Rate (Tingkat Konversi)',
    definition: 'Persentase pengunjung toko/aplikasi yang akhirnya melakukan pembelian.',
    example: 'Dari 1.000 pengunjung web bulan ini, 50 orang membeli produk. Conversion rate Anda adalah 5%.'
  },
  profit_margin: {
    title: 'Profit Margin (Marjin Laba)',
    definition: 'Persentase sisa laba bersih dari total omzet penjualan setelah dikurangi semua biaya operasional.',
    example: 'Omzet Rp 100.000.000 menghasilkan Laba Bersih Rp 20.000.000. Marjin Laba usaha Anda adalah 20%.'
  },
  net_profit: {
    title: 'Net Profit (Laba Bersih)',
    definition: 'Sisa uang tunai murni yang dimiliki usaha setelah dikurangi HPP, gaji, sewa, dan pengeluaran.',
    example: 'Omzet Rp 482M - Total Beban Rp 385,6M = Laba Bersih Rp 96,4 Juta.'
  },
  cash_flow: {
    title: 'Cash Flow (Arus Kas)',
    definition: 'Pergerakan arus uang tunai masuk (pendapatan) dan uang tunai keluar (pengeluaran operasional).',
    example: 'Kas Masuk Rp 50M - Kas Keluar Rp 42M = Cash Flow Positif Rp 8 Juta.'
  },
  retention: {
    title: 'Customer Retention (Retensi Pelanggan)',
    definition: 'Kemampuan bisnis Anda dalam membuat pelanggan lama kembali membeli produk Anda secara berulang.',
    example: 'Dari 100 pelanggan bulan lalu, 65 orang kembali membeli bulan ini (Retention Rate = 65%).'
  },
  reorder_point: {
    title: 'Reorder Point (Batas Pemesanan Ulang)',
    definition: 'Jumlah stok minimal yang menjadi sinyal bahwa Anda harus segera memesan ulang ke supplier.',
    example: 'Stok House Blend Arabica tersisa 15 kg (Batas Reorder Point). AIbo memberi peringatan stok menipis.'
  },
  overstock: {
    title: 'Overstock (Stok Menumpuk/Berlebih)',
    definition: 'Kondisi persediaan barang yang terlalu banyak sehingga mengendapkan modal usaha tanpa penjualan.',
    example: 'Stok Syrup Vanilla tersisa 120 botol dengan penjualan 5 botol/bulan (Stok bertahan > 24 bulan).'
  },
  business_health: {
    title: 'Business Health (Skor Kesehatan Usaha)',
    definition: 'Indikator komprehensif (0-100%) yang mengukur performa 6 area kunci bisnis Anda.',
    example: 'Skor 82% menunjukkan usaha Anda dalam kondisi Sangat Sehat (Healthy).'
  }
};

export function renderContextHelp(termKey) {
  const term = terminologyDictionary[termKey.toLowerCase()];
  if (!term) return '';

  return `
    <span class="context-help-trigger" data-term="${termKey.toLowerCase()}" style="cursor: pointer; display: inline-flex; align-items: center; justify-content: center; margin-left: 4px; color: var(--primary); vertical-align: middle;" title="Klik untuk penjelasan istilah">
      ${getIcon('info', { size: 14 })}
    </span>
  `;
}

export function bindContextHelpEvents(container = document) {
  const triggers = container.querySelectorAll('.context-help-trigger');
  triggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const termKey = trigger.dataset.term;
      const term = terminologyDictionary[termKey];
      if (!term) return;

      showTermModal(term);
    });
  });
}

function showTermModal(term) {
  // Remove any existing term modal
  document.getElementById('context-term-modal')?.remove();

  const modal = document.createElement('div');
  modal.id = 'context-term-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.65);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 20px;
  `;

  modal.innerHTML = `
    <div class="card animate-fade-in" style="max-width: 460px; width: 100%; padding: 24px; background: var(--bg-secondary); border: 2px solid var(--primary); box-shadow: var(--shadow-lg); display: flex; flex-direction: column; gap: 14px;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="color: var(--primary); display: flex; align-items: center;">${getIcon('info', { size: 20 })}</span>
          <h3 style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary); margin: 0;">${term.title}</h3>
        </div>
        <button id="btn-close-term-modal" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; display: flex; align-items: center;">${getIcon('close', { size: 18 })}</button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.86rem; line-height: 1.5;">
        <div>
          <strong style="color: var(--primary); display: block; font-size: 0.78rem; text-transform: uppercase; margin-bottom: 2px;">Definisi:</strong>
          <span style="color: var(--text-primary);">${term.definition}</span>
        </div>

        <div style="background: var(--bg-primary); padding: 10px 14px; border-radius: var(--radius-sm); border-left: 3px solid var(--ai-primary);">
          <strong style="color: var(--ai-primary); display: block; font-size: 0.78rem; text-transform: uppercase; margin-bottom: 2px;">Contoh Nyata:</strong>
          <span style="color: var(--text-secondary);">${term.example}</span>
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; margin-top: 6px;">
        <button class="btn btn-primary btn-sm" id="btn-close-term-modal-2" style="padding: 6px 16px;">Paham</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeModal = () => modal.remove();
  document.getElementById('btn-close-term-modal')?.addEventListener('click', closeModal);
  document.getElementById('btn-close-term-modal-2')?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}
