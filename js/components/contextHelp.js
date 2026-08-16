// contextHelp.js
// Contextual Terminology Help System (Stage C) for AIbo MVP Phase 4.5
// Renders readable ⓘ info popovers for SME/UMKM business metrics.

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
    <span class="context-help-trigger" data-term="${termKey.toLowerCase()}" style="cursor: pointer; display: inline-flex; align-items: center; justify-content: center; margin-left: 4px; color: var(--primary); font-size: 0.85rem;" title="Klik untuk penjelasan istilah">
      ⓘ
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
    z-index: 100000;
    padding: 20px;
  `;

  modal.innerHTML = `
    <div class="card animate-fade-in" style="max-width: 440px; width: 100%; padding: 22px; background: var(--bg-secondary); border: 2px solid var(--primary); box-shadow: var(--shadow-lg);">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; margin-bottom: 12px;">
        <strong style="font-size: 1rem; font-weight: 700; color: var(--primary); font-family: var(--font-display);">
          💡 Penjelasan Istilah Bisnis
        </strong>
        <button id="btn-close-term-modal" style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: var(--text-muted);">&times;</button>
      </div>

      <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">${term.title}</h4>
      <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 14px;">${term.definition}</p>

      <div style="background: var(--bg-input); padding: 12px 14px; border-radius: var(--radius-sm); border-left: 3px solid var(--ai-primary);">
        <strong style="font-size: 0.78rem; color: var(--ai-primary); display: block; margin-bottom: 4px;">📌 Contoh Nyata Dalam Usaha:</strong>
        <span style="font-size: 0.82rem; color: var(--text-primary); line-height: 1.4;">${term.example}</span>
      </div>

      <div style="display: flex; justify-content: flex-end; margin-top: 16px;">
        <button class="btn btn-primary btn-sm" id="btn-close-term-modal-2">Paham, Terima Kasih 👍</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeBtn1 = document.getElementById('btn-close-term-modal');
  const closeBtn2 = document.getElementById('btn-close-term-modal-2');

  const closeModal = () => modal.remove();
  if (closeBtn1) closeBtn1.addEventListener('click', closeModal);
  if (closeBtn2) closeBtn2.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
}
