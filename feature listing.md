# 📋 AIbo — Master Feature Listing & Architecture Mechanisms

> **Dokumen Spesifikasi Lengkap**: Berkas ini mendokumentasikan seluruh fitur, mekanisme internal, logika komputasi, alur interaksi pengguna (*user interaction flow*), dan struktur data yang telah diimplementasikan dalam platform **AIbo (AI Business Companion)**.

---

## 📑 Daftar Isi
1. [Ringkasan Arsitektur & Prinsip Sistem](#1-ringkasan-arsitektur--prinsip-sistem)
2. [Katalog Modul & Fitur Komprehensif (20 Modul)](#2-katalog-modul--fitur-komprehensif)
   - [Modul 01: Autentikasi, Keamanan Sesi OTP & Manajemen Pengguna](#modul-01-autentikasi-keamanan-sesi-otp--manajemen-pengguna)
   - [Modul 02: Onboarding Usaha 6-Langkah & Multi-Goal Setup](#modul-02-onboarding-usaha-6-langkah--multi-goal-setup)
   - [Modul 03: Executive Dashboard & 6-Dimension Health Engine](#modul-03-executive-dashboard--6-dimension-health-engine)
   - [Modul 04: Kalender Visual Bulanan Interaktif & Agenda Bisnis](#modul-04-kalender-visual-bulanan-interaktif--agenda-bisnis)
   - [Modul 05: Deep-Dive Analytics Suite (6 Tab & Drill-Down Kanal)](#modul-05-deep-dive-analytics-suite-6-tab--drill-down-kanal)
   - [Modul 06: Decision Center & 8-Langkah Transparansi Rekomendasi](#modul-06-decision-center--8-langkah-transparansi-rekomendasi)
   - [Modul 07: Multi-Choice Panel Optimalisasi Skenario Keputusan](#modul-07-multi-choice-panel-optimalisasi-skenario-keputusan)
   - [Modul 08: AI Business Copilot Interaktif (Kontekstual & Chat)](#modul-08-ai-business-copilot-interaktif-kontekstual--chat)
   - [Modul 09: Alur Kerja Persetujuan Tim (Team Workflow Approvals)](#modul-09-alur-kerja-persetujuan-tim-team-workflow-approvals)
   - [Modul 10: Action Center (Checklist Tugas, Kanban Board & Otomasi)](#modul-10-action-center-checklist-tugas-kanban-board--otomasi)
   - [Modul 11: Goal Drivers Detail Closed-Loop Experience](#modul-11-goal-drivers-detail-closed-loop-experience)
   - [Modul 12: Pusat Laporan Bisnis Resmi & Ekspor Multi-Format](#modul-12-pusat-laporan-bisnis-resmi--ekspor-multi-format)
   - [Modul 13: Data Center (Katalog 5-Poin, Rekomendasi & Wizard)](#modul-13-data-center-katalog-5-poin-rekomendasi--wizard)
   - [Modul 14: Pengaturan Usaha, Profil Legal, Tim RBAC & Kamus i18n](#modul-14-pengaturan-usaha-profil-legal-tim-rbac--kamus-i18n)
   - [Modul 15: Sistem Monetisasi, Paket Langganan & Checkout Simulasi](#modul-15-sistem-monetisasi-paket-langganan--checkout-simulasi)
   - [Modul 16: Tur Produk Interaktif 11-Langkah (Guided Tour)](#modul-16-tur-produk-interaktif-11-langkah-guided-tour)
   - [Modul 17: Kamus Istilah Bisnis Kontekstual (ⓘ Popover Engine)](#modul-17-kamus-istilah-bisnis-kontekstual--popover-engine)
   - [Modul 18: Reactive State Multi-Tenant LocalStorage Partitioning](#modul-18-reactive-state-multi-tenant-localstorage-partitioning)
   - [Modul 19: Reviewer Sandbox Panel & Pengatur Status Instan](#modul-19-reviewer-sandbox-panel--pengatur-status-instan)
   - [Modul 20: Desain Responsif & Antarmuka Mobile-First](#modul-20-desain-responsif--antarmuka-mobile-first)
3. [Matriks Keterhubungan Antar-Fitur (Closed-Loop Grid)](#3-matriks-keterhubungan-antar-fitur-closed-loop-grid)
4. [Daftar Kunci Penyimpanan LocalStorage & State Schema](#4-daftar-kunci-penyimpanan-localstorage--state-schema)

---

## 1. Ringkasan Arsitektur & Prinsip Sistem

AIbo mengintegrasikan seluruh fungsionalitasnya berdasarkan 4 pilar arsitektur:

1. **Zero-Backend Client-Side Reactive State:** Seluruh status data disimpan dan dipartisi per pengguna di `localStorage` (`aibo_state_[email]`), menghasilkan responsivitas instan tanpa *network latency*.
2. **Explainable AI Framework (8-Langkah Transparansi):** AIbo tidak memberikan saran berupa *black box*, melainkan memaparkan data pendukung, akar masalah, proyeksi kuantitatif, analisis risiko, dan opsi alternatif.
3. **Closed-Loop Action Feedback:** Setiap aksi di modul analitik, rekomendasi, atau target secara otomatis memperbarui tugas tim (*Kanban*), metrik KPI, dan *Health Score* bisnis.
4. **Multi-Role Team Governance:** Membedakan hak akses dan alur kerja antara Pemilik Bisnis (*Owner*) dan Manajer Operasional (*Manager*).

---

## 2. Katalog Modul & Fitur Komprehensif

---

### Modul 01: Autentikasi, Keamanan Sesi OTP & Manajemen Pengguna
* **Berkas Pengelola**: `js/components/auth.js` & `js/state.js`
* **Mekanisme & Kapabilitas**:
  1. **Demo Quick Login**: Tombol cepat 1-klik untuk masuk sebagai **Owner (Ardi Pratama - ardi@nusabrew.com)** atau **Manager (Nadia Sari - nadia@nusabrew.com)** tanpa perlu mengetik manual.
  2. **Registrasi Akun Baru dengan Validasi OTP 2-Arah**:
     * Input: Nama Pengguna, Nama Bisnis, Email, Kata Sandi.
     * Sesi Verifikasi OTP: Sistem memunculkan layar OTP interaktif dengan simulasi pengiriman kode ke email.
     * Kode Validasi OTP Registrasi: **`987654`**.
     * Keberhasilan verifikasi membuat sesi baru dan mengarahkan pengguna ke wizard *Onboarding*.
  3. **Alur Lupa Kata Sandi 3-Langkah (Forgot Password Wizard)**:
     * *Langkah 1*: Input email bisnis terdaftar.
     * *Langkah 2*: Masukkan kode keamanan OTP (Kode: **`123456`**).
     * *Langkah 3*: Buat kata sandi baru (minimal 6 karakter) $\rightarrow$ Konfirmasi $\rightarrow$ Otomatis login ke Dashboard.
  4. **Proteksi Sesi & Logout**:
     * Sesi disimpan pada `localStorage('aibo_auth')`.
     * Tombol Logout fisik di sidebar desktop (`🚪`) dan drawer navigasi mobile membersihkan sesi dan mengembalikan pengguna ke layar login.

---

### Modul 02: Onboarding Usaha 6-Langkah & Multi-Goal Setup
* **Berkas Pengelola**: `js/components/onboarding.js`
* **Mekanisme & Kapabilitas**:
  1. **Stepper 6-Tahap Interaktif**:
     * *Tahap 1 (Welcome)*: Pengenalan filosofi platform.
     * *Tahap 2 (Peran & Tim)*: Pemilihan peran pengguna (*Owner, General Manager, Finance, Marketing, Operations*).
     * *Tahap 3 (Identitas Usaha)*: Nama usaha, sektor industri, sub-industri, skala bisnis (*Mikro, Kecil, Menengah*) dengan tooltip penjelasan batas omzet, dan kota operasional.
     * *Tahap 4 (Target Bisnis Multi-Goal & Custom Goal)*: Memilih target preset (*Omzet Rp 500M, Laba 20%, Retensi 65%, Marketing ROI 3.5x, Stok 90%*) atau menambahkan **Target Kustom Mandiri**.
     * *Tahap 5 (Checklist Integrasi Data)*: Pemetaan kebutuhan data (*Essential, Recommended, Optional*).
     * *Tahap 6 (Validasi Mutu Data)*: Kalkulasi *Data Quality Score* (91% - Optimal) sebelum memasuki dashboard.
  2. **Inisialisasi Profil Bersih**: Menghubungkan profil bisnis baru ke state pengguna terisolasi.

---

### Modul 03: Executive Dashboard & 6-Dimension Health Engine
* **Berkas Pengelola**: `js/components/dashboard.js` & `js/state.js`
* **Mekanisme & Kapabilitas**:
  1. **Gauge Skor Kesehatan Bisnis 6-Dimensi (SVG Circular)**:
     * Menghitung rata-rata skor berbobot dari 6 pilar bisnis: **Revenue (Omset), Profitabilitas, Pelanggan, Pemasaran (ROI), Stok (Inventory), dan Arus Kas (Cash Flow)**.
     * Warna adaptif: Hijau ($\ge 80$), Kuning ($60-79$), Merah ($< 60$).
     * Modal Detail 6-Dimensi: Mengeklik gauge membuka rincian nilai 0–100 per dimensi, progres bar warna, status analisis, dan saran prioritas AIbo.
  2. **Widget Sisa Kas Cair & Runway Arus Kas (*Cash Runway & Working Capital Indicator*)**:
     * Menampilkan saldo kas cair operasional (**Rp 142.500.000**), estimasi daya tahan runway kas (**4.8 Bulan - Status Aman & Sehat**), arus masuk, dan beban pengeluaran operasional.
  3. **Banner Peringatan Dini Anomali Kritis (*Smart Anomaly Alert Banner*)**:
     * Deteksi anomali operasional real-time di bagian atas dashboard dengan tombol aksi cepat `[ 📦 Reorder Stok ➔ ]` dan `[ ⚡ Optimasi Iklan ]`.
  4. **Pita Ringkasan Progres Target Utama (*Active Goal Progress Tracker Strip*)**:
     * Progres bar visual target utama bulanan (Omzet Rp 500M / 96.4% tercapai) dengan estimasi capaian AIbo (Rp 512M) dan klik interaktif membuka rincian pendorong (*drivers*).
  5. **AI Daily Executive Brief**: Ringkasan harian cerdas yang memaparkan performa omzet bulan berjalan, status anomali pemasaran, dan tombol pintas ke analitik/keputusan.
  6. **4 Kartu KPI Interaktif dengan Sparkline**:
     * Kartu Total Omzet, Laba Bersih, Total Pelanggan, dan Kesehatan Stok.
     * Dilengkapi grafik garis mini (*sparkline SVG* 4 bulan terakhir), persentase pertumbuhan vs bulan lalu/target, dan modal detail metrik saat diklik.
  7. **Split Panel Rekomendasi & Tugas**: Ringkasan rekomendasi pending dan 4 tugas teratas dengan kotak centang penyelesaian instan.

---

### Modul 04: Kalender Visual Bulanan Interaktif & Agenda Bisnis
* **Berkas Pengelola**: `js/components/dashboard.js` & `js/state.js`
* **Mekanisme & Kapabilitas**:
  1. **Grid Kalender Bulanan 7-Kolom (Senin — Minggu)**:
     * Menampilkan 31 hari bulan Agustus 2026 dengan offset hari yang presisi.
     * Tanggal aktif (16 Agustus) ditandai dengan badge `HARI INI`.
  2. **Badge Acara Berwarna Berdasarkan Kategori**:
     * 📢 **Marketing Campaign (Pink)**: Promo Kemerdekaan (17 Agu) & Realokasi Iklan (20 Agu).
     * 📦 **Stok & Inventory (Amber)**: Reorder House Blend 1kg (22 Agu) & Matcha Powder (25 Agu).
     * 🎯 **Tugas Tim (Indigo)**: Review TikTok Ads (24 Agu) & Tagihan B2B (28 Agu).
     * 📝 **Catatan & Agenda Mandiri (Cyan)**: Pertemuan supplier, bazar event, jadwal personal tim.
     * 🏁 **Target Goals (Emerald)**: Evaluasi Target Omzet Bulanan (31 Agu).
  3. **Navigasi Bulan & Filter Kategori**: Tombol `◀ Jul`, `Agustus 2026`, `Sep ▶`, serta filter tombol (*Semua, 📢 Ads, 📦 Stok, 🎯 Tugas, 📝 Catatan, 🏁 Goals*).
  4. **Fitur Tambah Catatan & Agenda Mandiri (*Custom Calendar Events*)**:
     * Tombol `[ ➕ Tambah Agenda / Catatan ]` di header kalender.
     * Form modal input agenda: Judul Agenda, Kategori, Waktu/Jam, dan Catatan.
     * Persistensi state ke `state.custom_events` dan kemampuan menghapus agenda kustom dengan tombol `[ 🗑️ Hapus ]`.
  5. **Modal Detail Agenda Harian**: Mengeklik tanggal memunculkan modal detail agenda dengan rincian kegiatan dan tombol jalan pintas tindakan.

---

### Modul 05: Deep-Dive Analytics Suite (6 Tab & Drill-Down Kanal)
* **Berkas Pengelola**: `js/components/analytics.js` & `js/utils.js`
* **Mekanisme & Kapabilitas**:
  1. **6 Tab Analitik Komprehensif**:
     * Tab 1: **Penjualan (Sales & Revenue)** — Grafik tren omzet, komposisi saluran, AOV.
     * Tab 2: **Profitabilitas (Profit & Margins)** — Tren laba bersih, margin profit, biaya operasional.
     * Tab 3: **Pelanggan (Customers & Retention)** — Rasio pelanggan baru vs returning, churn rate, segmen pembeli.
     * Tab 4: **Pemasaran (Marketing & Ads ROI)** — Spend per kanal iklan, atribusi pendapatan, CPA, konversi.
     * Tab 5: **Stok Barang (Inventory Health)** — Status SKU, reorder points, valuasi persediaan.
     * Tab 6: **Arus Kas (Cash Flow)** — Arus kas masuk, arus kas keluar, estimasi runway keuangan.
  2. **Filter Rentang Waktu & Toggle Granularitas Dinamis**:
     * Rentang: *Jan - Agu 2026, Kuartal 1, Kuartal 2, Kuartal 3, 3 Bulan Terakhir*.
     * Granularitas: *Harian, Mingguan, Bulanan, Kuartalan* yang secara otomatis mengkalkulasi ulang visualisasi grafik.
  3. **Modal Drill-Down Produk Saluran Penjualan**:
     * Mengeklik baris kanal (POS Offline, Website, Marketplace) memunculkan modal rincian daftar produk terlaris, persentase kontribusi omzet kanal, dan insight optimasi.
  4. **Tabel Komparasi Periode**: Membandingkan performa *Bulan Ini vs Bulan Lalu vs Target* lengkap dengan indikator delta pertumbuhan.
  5. **Kartu Penjelasan Cerdas 3-Pertanyaan**:
     * *Apa yang Anda lihat? (What Happened?)*
     * *Mengapa ini penting bagi bisnis? (Why it Matters?)*
     * *Apa tindakan yang disarankan AIbo? (What to Do?)* dengan tautan ke Decision Center.

---

### Modul 06: Decision Center & 8-Langkah Transparansi Rekomendasi
* **Berkas Pengelola**: `js/components/decision.js`
* **Mekanisme & Kapabilitas**:
  1. **Framework 8-Langkah Explainability**:
     * *Langkah 1*: Ringkasan Eksekutif (Executive Summary).
     * *Langkah 2*: Akar Masalah (Root Cause / Drivers).
     * *Langkah 3*: Bukti Data Pendukung Historis (Data Evidence).
     * *Langkah 4*: Proyeksi Dampak Kuantitatif Finansial (Financial Impact).
     * *Langkah 5*: Opsi Skenario Alternatif (Alternative Options).
     * *Langkah 6*: Konsekuensi Jika Dibiarkan (Consequences of Inaction).
     * *Langkah 7*: Rekomendasi Terpilih AIbo (Best Recommendation).
     * *Langkah 8*: Tindakan Eksekusi 1-Klik / Pengajuan Persetujuan.
  2. **Filter Kategori & Prioritas**: Memfilter rekomendasi berdasarkan *Marketing, Inventory, Revenue, Customer* dan level prioritas *High, Medium, Low*.

---

### Modul 07: Multi-Choice Panel Optimalisasi Skenario Keputusan
* **Berkas Pengelola**: `js/components/decision.js` & `js/state.js`
* **Mekanisme & Kapabilitas**:
  1. **3 Pilihan Skenario Strategi per Rekomendasi**:
     * **Opsi A (Agresif)**: Realokasi budget Rp 7.500.000 $\rightarrow$ Proyeksi Omzet **+Rp 26.000.000** (ROI 4.2x), Risiko Sedang.
     * **Opsi B (Seimbang — Rekomendasi AIbo)**: Realokasi budget Rp 5.000.000 $\rightarrow$ Proyeksi Omzet **+Rp 18.000.000** (ROI 3.8x), Risiko Rendah.
     * **Opsi C (Konservatif)**: Realokasi budget Rp 2.500.000 $\rightarrow$ Proyeksi Omzet **+Rp 9.000.000** (ROI 3.2x), Risiko Minimal.
  2. **Kalkulasi Trade-Off Dinamis**: Memilih opsi kartu radio secara reaktif mengubah tampilan angka dampak finansial dan tingkat risiko sebelum diterapkan.
  3. **Eksekusi Sesuai Opsi**: Menerapkan nominal dan parameter khusus opsi yang dipilih ke `state.js`.

---

### Modul 08: AI Business Copilot Interaktif (Kontekstual & Chat)
* **Berkas Pengelola**: `js/components/decision.js`
* **Mekanisme & Kapabilitas**:
  1. **Asisten Chat Bisnis Terintegrasi**: Memahami konteks data operasional dan keuangan usaha *Nusa Brew Coffee*.
  2. **Indikator Berpikir (Typing Indicator)**: Animasi loading saat AIbo mengolah query pengguna.
  3. **Chip Pertanyaan Cepat (*Quick Prompts*)**: Tombol 1-klik (*"Apa beda Opsi Agresif vs Seimbang?", "Mengapa ROI TikTok Ads turun?", "Produk apa yang stoknya kritis?"*).
  4. **Riwayat Percakapan Persisten**: Percakapan tersimpan di state sesi pengguna.

---

### Modul 09: Alur Kerja Persetujuan Tim (Team Workflow Approvals)
* **Berkas Pengelola**: `js/state.js`, `js/components/decision.js`, & `js/components/action.js`
* **Mekanisme & Kapabilitas**:
  1. **Pengajuan oleh Manajer**:
     * Saat login sebagai **Manager (Nadia Sari)**, tombol aksi pada rekomendasi berubah menjadi **`[ 📤 Ajukan Persetujuan ke Owner ]`**.
     * Data pengajuan mencakup: nama keputusan, opsi skenario yang dipilih, nominal dana, estimasi dampak, dan catatan pemohon.
  2. **Antrean Persetujuan Owner (Approval Queue)**:
     * Banner antrean persetujuan muncul di Decision Center dan tab **`⏳ Persetujuan Tim`** di Action Center saat login sebagai **Owner (Ardi Pratama)**.
  3. **Aksi Setujui / Tolak**:
     * Tombol **`[ ✓ Setujui (Approve) ]`**: Menyetujui pengajuan, otomatis mengeksekusi rekomendasi, membuat tugas operasional di tim, dan memperbarui target.
     * Tombol **`[ ✕ Tolak (Reject) ]`**: Memunculkan dialog input catatan penolakan untuk tim dan mencatat status ditolak di riwayat persetujuan.

---

### Modul 10: Action Center (Checklist Tugas, Kanban Board & Otomasi)
* **Berkas Pengelola**: `js/components/action.js` & `js/state.js`
* **Mekanisme & Kapabilitas**:
  1. **Dual-View: Mode List & Mode Kanban Board**:
     * Toggle instan antara *Tampilan List* dan *Kanban Board (Belum Dikerjakan, Sedang Berjalan, Selesai)*.
  2. **Otomasi Pembuatan Tugas**: Keputusan yang dieksekusi otomatis menambahkan tugas baru ke Kanban board dengan PIC dan tenggat waktu.
  3. **Penyelesaian Tugas Interaktif**: Mencentang tugas otomatis mengubah status, memperbarui skor inventaris/pemasaran, dan mencatat log aktivitas.
  4. **Form Tambah Tugas Manual**: Modal input tugas baru (Judul, Prioritas, PIC, Tenggat Waktu).

---

### Modul 11: Goal Drivers Detail Closed-Loop Experience
* **Berkas Pengelola**: `js/components/action.js`
* **Mekanisme & Kapabilitas**:
  1. **Kartu Capaian Target Dinamis**: Progres bar persentase, nilai aktual vs target, dan tenggat waktu bulanan.
  2. **Modal Analisis Pendorong (Goal Drivers)**:
     * Membedah faktor positif dan negatif yang mempengaruhi capaian target (misal: *Penjualan TikTok Ads -18%, Website Direct +24%*).
  3. **Eksekusi Rekomendasi Terkait 1-Klik**: Tombol eksekusi langsung di dalam modal target yang seketika memperbarui progres capaian target.

---

### Modul 12: Pusat Laporan Bisnis Resmi & Ekspor Multi-Format
* **Berkas Pengelola**: `js/components/action.js`
* **Mekanisme & Kapabilitas**:
  1. **6 Template Laporan Bisnis Siap Cetak**:
     * *Executive Summary & Business Health Report*
     * *Laporan Pendapatan & Marjin Profitabilitas*
     * *Laporan Arus Kas Operasional (Cash Flow)*
     * *Laporan Retensi & Segmen Pelanggan*
     * *Laporan Kesehatan Persediaan & Stok Produk*
     * *Laporan Kinerja Kampanye Promosi & Marketing ROI*
  2. **Filter Kategori Laporan**: *Eksekutif, Keuangan, Pelanggan & Ops, Pemasaran*.
  3. **Lembar Pratinjau Dokumen Cetak (*Printable Sheet*)**:
     * Kop resmi perusahaan (*PT Nusa Brew Indonesia*), periode laporan (Agustus 2026), narasi AI Executive Summary, tabel verifikasi metrik, dan stempel status validasi AIbo.
  4. **Ekspor Simulasi Multi-Format**: Tombol ekspor simulasi ke format **PDF**, spreadsheet **XLSX**, dan dataset **CSV**.

---

### Modul 13: Data Center (Katalog 5-Poin, Rekomendasi & Wizard)
* **Berkas Pengelola**: `js/components/dataCenter.js`
* **Mekanisme & Kapabilitas**:
  1. **Klasifikasi Kebutuhan Data 5-Poin**:
     * 🟢 **Essential (Wajib)**: POS Kasir Penjualan & Inventaris Stok.
     * 🟡 **Recommended (Disarankan)**: CRM & Data Iklan Meta/TikTok Ads.
     * ⚪ **Optional (Tambahan)**: Biaya Operasional & Beban Gaji SDM.
  2. **Kartu Cerdas Rekomendasi Integrasi**: Menyarankan platform integrasi berikutnya yang paling relevan dengan target aktif.
  3. **Banner Status Kesiapan Data 91% (Optimal)**: Memberikan rasa tenang kepada pengguna bahwa analisis AIbo sudah berjalan akurat meskipun belum semua data opsional terkoneksi.
  4. **Wizard Unggah Dataset Manual**: Dialog simulasi upload berkas Excel/CSV untuk data penjualan offline.
  5. **Pengatur Jadwal Pengingat Sinkronisasi**: Pengingat mingguan/bulanan untuk memperbarui pembukuan.

---

### Modul 14: Pengaturan Usaha, Profil Legal, Tim RBAC & Kamus i18n
* **Berkas Pengelola**: `js/components/profile.js` & `js/i18n.js`
* **Mekanisme & Kapabilitas**:
  1. **Identitas & Legalitas Usaha**: Form pengisian Nama Legal PT/CV, Sektor Industri, Skala Usaha, Jumlah Karyawan, dan Model Bisnis (B2C/B2B/Hybrid).
  2. **Alamat & Kontak Resmi**: Alamat kantor/outlet, Kota, Provinsi, No. WhatsApp, Email, dan Website.
  3. **Konteks Bisnis bagi AIbo**: Deskripsi profil produk, lini produk unggulan, dan saluran penjualan aktif yang menjadi konteks analisis AI.
  4. **Matriks Izin Akses Peran Tim (*Role-Based Access Control / RBAC*)**:
     * Tabel matriks hak akses untuk 4 peran (*Owner, Manager, Finance, Marketing*).
  5. **Pengalih Bahasa Antarmuka (i18n)**: Toggle instan antara **Bahasa Indonesia (ID)** dan **English (EN)** tersimpan di `localStorage('aibo_lang')`.

---

### Modul 15: Sistem Monetisasi, Paket Langganan & Checkout Simulasi
* **Berkas Pengelola**: `js/components/profile.js` & `js/state.js`
* **Mekanisme & Kapabilitas**:
  1. **Pelacak Kuota Penggunaan Bisnis (*Quota Progress Bars*)**:
     * AI Business Copilot: `42 / 100` Prompt (Starter) $\rightarrow$ `500` (Pro) $\rightarrow$ `2000` (Enterprise).
     * Integrasi Platform Data: `3 / 5` Sumber (Starter) $\rightarrow$ `20` (Pro) $\rightarrow$ `Unlimited` (Enterprise).
     * Kursi Anggota Tim: `2 / 5` Akun (Starter) $\rightarrow$ `15` (Pro) $\rightarrow$ `50` (Enterprise).
  2. **Matriks 3 Tingkat Paket Langganan**:
     * **Starter UMKM**: Rp 0 / bulan.
     * **Pro SME (Paling Populer)**: Rp 299.000 / bulan (atau Rp 2.870.400 / tahun dengan diskon 20%).
     * **Enterprise Tier**: Rp 899.000 / bulan (atau Rp 8.630.400 / tahun).
  3. **Toggle Siklus Penagihan Bulanan vs Tahunan**: Diskon hemat 20% untuk paket tahunan.
  4. **Modal Simulasi Checkout Pembayaran Lengkap**:
     * Pilihan metode pembayaran: **QRIS (Instant QR Code)**, **Virtual Account (BCA, Mandiri, BRI)**, atau **Kartu Kredit**.
     * Eksekusi pembayaran simulasi langsung meng-upgrade tier paket akun, memperluas kapasitas kuota, dan mengirimkan notifikasi konfirmasi.

---

### Modul 16: Tur Produk Interaktif 11-Langkah (Guided Tour)
* **Berkas Pengelola**: `js/components/tour.js`
* **Mekanisme & Kapabilitas**:
  1. **Sorotan Elemen Visual (Element Highlighting Backdrop)**: Memandu pengguna memahami setiap modul (*Health Gauge, KPI Cards, Kalender, Analytics, Decision, Action, Data Center, Profile*).
  2. **Kontrol Tur Penuh**: Tombol *Lanjut, Kembali, Lewati*, dan indikator langkah `(1/11)`.
  3. **Tombol Pemicu di Top Header**: Tombol `[ ❓ Tur Produk ]` memungkinkan pengguna mengulang tur kapan saja secara mandiri.

---

### Modul 17: Kamus Istilah Bisnis Kontekstual (ⓘ Popover Engine)
* **Berkas Pengelola**: `js/components/contextHelp.js`
* **Mekanisme & Kapabilitas**:
  1. **Ikon Bantuan Kontekstual `ⓘ`**: Terpasang di sebelah istilah bisnis teknis di seluruh halaman aplikasi.
  2. **Modal Penjelasan Ramah Pemula**:
     * Definisi dalam bahasa sehari-hari tanpa jargon rumit.
     * **Contoh Perhitungan Angka Nyata** (misal: cara menghitung AOV, ROI, CPA, Net Profit, Margin, Retention Rate, Cash Flow).

---

### Modul 18: Reactive State Multi-Tenant LocalStorage Partitioning
* **Berkas Pengelola**: `js/state.js`
* **Mekanisme & Kapabilitas**:
  1. **Partisi Kunci Dinamis Berbasis Email**: `localStorage('aibo_state_' + email)`.
  2. **Pemisahan Akun Demo vs Pengguna Baru**:
     * Akun Demo (`ardi@nusabrew.com` / `nadia@nusabrew.com`): Memuat dataset *Nusa Brew Coffee* dari `AIbo_Dummy_Data.json`.
     * Akun Baru (Registrasi Mandiri): Mengkloning skema data namun mengosongkan profil bisnis dan target (`onboardingCompleted = false`, `data_quality = 10%`) sehingga penguji dapat menguji onboarding dari awal.
  3. **Reactive Listeners**: Memperbarui komponen antarmuka seketika saat data termodifikasi tanpa me-reload browser.

---

### Modul 19: Reviewer Sandbox Panel & Pengatur Status Instan
* **Berkas Pengelola**: `js/app.js` (Pojok Kiri Bawah `[ 🔧 ]`)
* **Mekanisme & Kapabilitas**:
  1. **Pengalih Status Akun Cepat**: Switcher instan antara status *Sudah Onboarding (Active Dashboard)* dan *Pengguna Baru (Mulai dari Wizard Onboarding)*.
  2. **Tombol Reset State**: Menghapus cache local storage akun aktif dan mengembalikan data ke baseline awal.

---

### Modul 20: Desain Responsif & Antarmuka Mobile-First
* **Berkas Pengelola**: `index.css` & `js/app.js`
* **Mekanisme & Kapabilitas**:
  1. **Sidebar Desktop Collapsible**: Dapat di-minimize dari lebar 260px menjadi 72px (icon-only mode) dengan persistensi status.
  2. **Mobile Bottom Navigation Bar (4 Tab Utama + More)**: *Dash, Analytics, Decision, Action, dan More*.
  3. **Mobile Drawer Sheet**: Menampung menu sekunder (*Data Center, Settings, Notifikasi, Logout*) dengan animasi slide-up mulus pada layar smartphone (390px - 768px).
  4. **Tema Gelap & Terang (Dark/Light Mode)**: Toggle tema instan dengan persistensi di `localStorage('aibo_theme')`.

---

## 3. Matriks Keterhubungan Antar-Fitur (Closed-Loop Grid)

| Modul Asal | Aksi Pengguna | Dampak Otomatis pada Modul Terkait |
|---|---|---|
| **Data Center** | Hubungkan Data Iklan Meta/TikTok | ➔ *Analytics*: Metrik Spend & ROI diperbarui.<br/>➔ *Dashboard*: Kualitas data naik ke 91%. |
| **Analytics** | Klik Baris Saluran POS pada Donut Chart | ➔ *Modal Drill-Down*: Rincian produk terlaris terbuka.<br/>➔ *Explainer*: Saran tindakan AIbo terhubung ke Decision Center. |
| **Decision Center** | Pilih Opsi B (Seimbang) & Klik Eksekusi | ➔ *State*: Realokasi budget Rp 5 Juta diterapkan.<br/>➔ *Action Center*: Tugas otomatis dibuat di Kanban board.<br/>➔ *Dashboard*: Progres target omzet & skor kesehatan naik. |
| **Decision Center** | Manajer klik "Ajukan Persetujuan" | ➔ *Action Center*: Masuk ke tab antrean persetujuan Owner.<br/>➔ *Notifikasi*: Owner menerima notifikasi persetujuan baru. |
| **Action Center** | Owner klik "Setujui (Approve)" | ➔ *Decision*: Rekomendasi otomatis berstatus diaplikasikan.<br/>➔ *Tugas*: Tugas PIC dibuat di Kanban board. |
| **Action Center** | Klik Selesaikan Tugas di Kanban | ➔ *State*: Status stok / kampanye iklan diperbarui.<br/>➔ *Dashboard*: Skor kesehatan stok pulih ke 90%. |
| **Profile / Billing** | Upgrade ke Paket Pro SME via QRIS | ➔ *State*: Kuota AI bertambah menjadi 500 prompt.<br/>➔ *Dashboard*: Badge status langganan Pro aktif. |

---

## 4. Daftar Kunci Penyimpanan LocalStorage & State Schema

| Kunci LocalStorage | Tipe Data | Deskripsi & Fungsi |
|---|---|---|
| `aibo_auth` | `JSON Object` | Menyimpan sesi autentikasi pengguna aktif: `{ name, role, email, token }`. |
| `aibo_state_[email]` | `JSON Object` | Menyimpan seluruh state reaktif bisnis pengguna aktif (KPI, omzet, target, rekomendasi, tugas, kuota, persetujuan). |
| `aibo_lang` | `String ('id' \| 'en')` | Menyimpan preferensi bahasa antarmuka aplikasi. |
| `aibo_theme` | `String ('dark' \| 'light')` | Menyimpan preferensi mode tampilan (Dark Mode / Light Mode). |
| `aibo_sidebar_collapsed` | `Boolean` | Menyimpan status minimized sidebar desktop (true/false). |
| `aibo_tour_completed` | `Boolean` | Menyimpan status apakah tur produk 11-langkah telah diselesaikan. |

---

**AIbo — Decision Intelligence Platform for SME Growth.**
