# 🚀 AIbo — AI Business Companion (Decision Intelligence Platform for SMEs)

> **AIbo** adalah platform *Business Intelligence & Decision Intelligence* berbasis AI yang dirancang khusus untuk pemilik usaha kecil & menengah (UMKM/SME), manajer operasional, dan pengambil keputusan bisnis. AIbo mengubah tumpukan data bisnis yang rumit menjadi wawasan yang mudah dipahami, dapat dijelaskan (*explainable*), dan dapat dieksekusi dalam satu klik (*closed-loop action*).

---

## 📑 Daftar Isi
1. [Filosofi & Pendekatan Produk](#-filosofi--pendekatan-produk)
2. [Struktur Pohon Direktori (Project Tree)](#-struktur-pohon-direktori-project-tree)
3. [Rincian Fungsi Setiap Berkas](#-rincian-fungsi-setiap-berkas)
4. [Diagram Alur & Arsitektur Konektivitas Sistem](#-diagram-alur--arsitektur-konektivitas-sistem)
5. [Diagram Siklus Tertutup (Closed-Loop Interaction)](#-diagram-siklus-tertutup-closed-loop-interaction)
6. [Diagram Workflow Arsitektur Per Fitur Utama](#-diagram-workflow-arsitektur-per-fitur-utama)
   - [Workflow 1: Autentikasi, Registrasi OTP & Pemulihan Sandi](#1-workflow-autentikasi-registrasi-otp--pemulihan-sandi)
   - [Workflow 2: Onboarding Usaha & Inisialisasi Target Bisnis](#2-workflow-onboarding-usaha--inisialisasi-target-bisnis)
   - [Workflow 3: Executive Dashboard & Health Score 6-Dimensi](#3-workflow-executive-dashboard--health-score-6-dimensi)
   - [Workflow 4: Deep-Dive Analytics & Drill-Down Kanal Penjualan](#4-workflow-deep-dive-analytics--drill-down-kanal-penjualan)
   - [Workflow 5: Decision Center & 8-Langkah Transparansi AI](#5-workflow-decision-center--8-langkah-transparansi-ai)
   - [Workflow 6: Action Center, Goal Drivers & Eksekusi Loop Tertutup](#6-workflow-action-center-goal-drivers--eksekusi-loop-tertutup)
   - [Workflow 7: Pusat Laporan Bisnis & Simulasi Ekspor Dokumen](#7-workflow-pusat-laporan-bisnis--simulasi-ekspor-dokumen)
   - [Workflow 8: Data Center, Klasifikasi Data & Rekomendasi Integrasi](#8-workflow-data-center-klasifikasi-data--rekomendasi-integrasi)
   - [Workflow 9: Multi-Tenant State Partitioning di LocalStorage](#9-workflow-multi-tenant-state-partitioning-di-localstorage)
7. [Detail Fitur-Fitur Kunci (Phase 1 — 4.6)](#-detail-fitur-fitur-kunci-phase-1--46)
8. [Skema Data & State Management](#-skema-data--state-management)
9. [Panduan Penggunaan & Skenario Pengujian](#-panduan-penggunaan--skenario-pengujian)
10. [Panduan Deployment Vercel](#-panduan-deployment-vercel)

---

## 🎯 Filosofi & Pendekatan Produk

AIbo dibangun berdasarkan kerangka kerja kognitif 5-tahap yang memandu pemilik usaha dari pemahaman data hingga tindakan nyata:

$$\textbf{WHAT HAPPENED} \longrightarrow \textbf{WHY DID IT HAPPEN} \longrightarrow \textbf{WHAT DOES IT MEAN} \longrightarrow \textbf{WHAT SHOULD I DO} \longrightarrow \textbf{TAKE ACTION}$$

* **Tanpa Istilah Rumit:** Metrik bisnis kompleks dijelaskan dengan bahasa sehari-hari disertai contoh angka nyata.
* **Transparansi Penuh (Explainability):** Rekomendasi AI tidak berupa *black-box*, melainkan dipaparkan lewat 8 langkah bukti data, opsi komparasi, dan analisis risiko.
* **Loop Tertutup (Closed-Loop):** Setiap keputusan terhubung langsung ke otomatisasi tugas dan pembaruan KPI reaktif secara *real-time*.

---

## 🌳 Struktur Pohon Direktori (Project Tree)

```text
Aibo/
├── vercel.json                    # Konfigurasi SPA Routing & Clean URLs untuk Vercel Hosting
├── index.html                     # Entrypoint HTML & container viewport Single Page Application (#app-root)
├── index.css                      # Design System lengkap (CSS Tokens, Theme, Responsive Grid, Animations)
├── AIbo_Dummy_Data.json           # Baseline dataset bisnis default (Nusa Brew Coffee - Agustus 2026)
├── README.md                      # Dokumentasi komprehensif proyek & panduan arsitektur
└── js/
    ├── app.js                     # Root Controller: Router SPA, Layout Shell, Navigasi Desktop & Mobile, Sandbox
    ├── state.js                   # Reactive Store: Multi-Tenant LocalStorage, Approvals Engine, Subscription & Quota
    ├── i18n.js                    # Mesin penerjemah antarmuka dwibahasa (Bahasa Indonesia & English)
    ├── utils.js                   # Helper formatting Rupiah, persentase, SVG Chart, counter, toast
    └── components/
        ├── action.js              # Action Center: Task Kanban/List, Goal Drivers, Team Approvals, Report Center
        ├── analytics.js           # Analytics Suite: 6 Tab Analitik, Granularitas Waktu, Drill-Down Kanal Penjualan
        ├── auth.js                # Modul Autentikasi: Login, Register (OTP 987654), Lupa Sandi (OTP 123456)
        ├── contextHelp.js         # Kamus Istilah Bisnis: Popover modal ⓘ untuk metrik awam & contoh hitungan
        ├── dashboard.js           # Executive Dashboard: Health Gauge 6-Dimensi, Visual Month Calendar, AI Daily Brief
        ├── dataCenter.js          # Data Center: Panduan Kebutuhan Data 5-Poin, Rekomendasi Integrasi, Sync Wizard
        ├── decision.js            # Decision Center: Multi-Choice Options Selector, 8-Langkah Transparansi & Copilot
        ├── onboarding.js          # Wizard Onboarding Pengguna Baru: Profil Usaha, Target Multi-Goal, Data Checklist
        ├── profile.js             # Pengaturan & Profil: Subscription Plans, Quota Bars, Checkout QRIS/VA, Tim RBAC
        └── tour.js                # Tur Produk Interaktif: Panduan sorotan visual 11-langkah untuk pengguna pertama
```

---

## 📄 Rincian Fungsi Setiap Berkas

| Berkas | Ukuran | Fungsi & Tanggung Jawab Utama | Keterkaitan / Ekspor Kunci |
|---|---|---|---|
| `vercel.json` | 133 B | Mengatur konfigurasi hosting statis di Vercel, memastikan semua request URL diarahkan ke `index.html` (*SPA rewrites*). | Digunakan langsung oleh Vercel CLI / Git Integration. |
| `index.html` | 1.1 KB | Dokumen HTML utama yang memuat font (*Plus Jakarta Sans*, *Outfit*), stylesheet `index.css`, dan elemen `<div id="app-root">`. | Memuat `js/app.js` via `<script type="module">`. |
| `index.css` | 20.8 KB | Desain sistem modern: variabel warna HSL/HEX, tema dark/light, grid responsif (*Desktop, Tablet, Mobile*), sidebar collapsible, modal backdrop blur, dan animasi chart SVG. | Diaplikasikan ke seluruh komponen antarmuka. |
| `AIbo_Dummy_Data.json` | 19.5 KB | Dataset bisnis acuan UMKM kopi specialty (*Nusa Brew Coffee*) mencakup data omzet bulanan, kanal marketing, pelanggan, stok SKU, dan matriks target. | Dimuat oleh `js/state.js` sebagai baseline data akun demo. |
| `js/app.js` | 19.9 KB | **Router & Pengatur Layout Aplikasi**: Mengatur perpindahan rute layar (*dashboard, analytics, decision, action, data, profile, login, onboarding*), toggle sidebar desktop (260px ↔ 72px), bottom bar mobile, drawer sheet, dan Reviewer Sandbox `[ 🔧 ]`. | Ekspor: `navigate(screenId)`. |
| `js/state.js` | 18.1 KB | **Store Reaktif Multi-Tenant**: Mengelola status aplikasi dengan partisi `aibo_state_[email]` di `localStorage`, kalkulasi Health Score 6-dimensi, engine persetujuan tim (*approvals*), engine monetisasi (*subscription*), dan listener reaktif. | Ekspor: `appState`, `initState()`, `saveState()`, `resetState()`, `applyRecommendation()`, `submitApprovalRequest()`, `respondApprovalRequest()`, `upgradeSubscription()`, `completeTask()`, `completeOnboarding()`, `addTask()`, `addNotification()`. |
| `js/i18n.js` | 4.3 KB | **Kamus Internasionalisasi**: Menyimpan kamus istilah dwibahasa (ID/EN) di `localStorage('aibo_lang')` dan menyediakan helper penerjemahan teks antarmuka. | Ekspor: `t(key, fallback)`, `getLanguage()`, `setLanguage(lang)`. |
| `js/utils.js` | 8.4 KB | **Utilitas Visual & Formatting**: Pemformatan Rupiah (`formatCurrency`), persentase, pembuat chart SVG murni (*Line Chart, Donut Chart, Bar Chart*), animasi counter angka, dan toast notification. | Ekspor: `formatCurrency`, `formatPercent`, `formatNumber`, `renderLineChart`, `renderDonutChart`, `renderBarChart`, `showToast`, `animateCounter`. |
| `js/components/auth.js` | 21.3 KB | **Autentikasi & Keamanan Prototipe**: Formulir login demo cepat (Owner Ardi / Manager Nadia), registrasi akun baru dengan **verifikasi OTP (`987654`)**, dan **alur lupa kata sandi 3-langkah (OTP `123456`)**. | Ekspor: `renderLogin()`, `renderRegister()`, `logoutUser()`. |
| `js/components/onboarding.js` | 23.2 KB | **Wizard Onboarding 6-Langkah**: Pendaftaran profil usaha, pemilihan peran, tooltip skala bisnis UMKM, pemilihan target multi-goal + custom goal, checklist integrasi data, dan validasi mutu data. | Ekspor: `renderOnboarding()`. |
| `js/components/dashboard.js` | 31.9 KB | **Executive Dashboard**: Visualisasi Health Gauge 6-Dimensi, **Kalender Visual Bulanan Interaktif (Grid 7-Kolom dengan Event Badges & Modal Agenda)**, KPI cards sparkline, dan AI Daily Brief. | Ekspor: `renderDashboard()`. |
| `js/components/analytics.js` | 39.9 KB | **Deep-Dive Analytics (6 Tab)**: Tab *Sales, Profit, Customer, Marketing, Inventory, Cash Flow*. Granularitas waktu (Harian/Mingguan/Bulanan/Kuartalan), drill-down produk kanal, dan evaluasi AI 3-pertanyaan. | Ekspor: `renderAnalytics()`. |
| `js/components/decision.js` | 21.7 KB | **Pusat Keputusan Strategis**: **Selector Multi-Choice Opsi Skenario (Agresif, Seimbang, Konservatif)**, **Antrean Persetujuan Tim (Approvals)**, 8-Langkah Transparansi, dan Copilot Interaktif. | Ekspor: `renderDecision()`. |
| `js/components/action.js` | 42.0 KB | **Pusat Eksekusi & Pelaporan**: Manajemen tugas List / Kanban, **Tab Antrean Persetujuan Tim (Workflow Approvals)**, Modal Detail Target Bisnis (*Goal Drivers*), dan Pusat Laporan Bisnis dengan ekspor PDF/XLSX/CSV. | Ekspor: `renderAction()`. |
| `js/components/dataCenter.js` | 24.4 KB | **Pusat Integrasi & Panduan Data**: Katalog panduan data 5-poin (*Essential, Recommended, Optional*), kartu rekomendasi integrasi berikutnya, banner status kesiapan data 91%, jadwal pengingat, dan upload dataset wizard. | Ekspor: `renderDataCenter()`. |
| `js/components/profile.js` | 15.5 KB | **Pengaturan, Profil & Monetisasi**: Identitas legal usaha, kontak, **Tab Paket Langganan & Kuota Penggunaan (Starter/Pro/Enterprise)**, **Modal Checkout Pembayaran QRIS/VA/CC**, dan Matriks Tim. | Ekspor: `renderProfile()`. |
| `js/components/tour.js` | 10.5 KB | **Tur Produk Interaktif**: Panduan 11-langkah pengguna baru dengan sorotan elemen visual (*element highlight backdrop*), navigasi Lanjut/Kembali/Lewati, persistensi status, dan tombol restart tur di top header. | Ekspor: `initProductTour()`. |
| `js/components/contextHelp.js` | 6.7 KB | **Kamus Istilah Kontekstual**: Menyediakan tombol `ⓘ` yang memunculkan popover modal berisi definisi awam serta contoh perhitungan angka riil (AOV, ROI, CPA, Net Profit, Margin, Retention, Cash Flow, dll.). | Ekspor: `renderContextHelp()`, `bindContextHelpEvents()`. |

---

## 🏗️ Diagram Alur & Arsitektur Konektivitas Sistem

```mermaid
graph TD
    %% Storage Layer
    subgraph StorageLayer ["💾 Persistent Storage (LocalStorage Multi-Tenant)"]
        AUTH_STORE[("🔐 Sesi Auth<br/>localStorage('aibo_auth')")]
        DEMO_STORE[("📦 State Akun Demo<br/>localStorage('aibo_state_ardi@nusabrew.com')")]
        CUSTOM_STORE[("📦 State Akun Baru<br/>localStorage('aibo_state_user@email.com')")]
        JSON_BASELINE[("📄 AIbo_Dummy_Data.json<br/>(Baseline Template)")]
    end

    %% Routing & Controller
    subgraph AppShell ["🖥️ Router & App Shell (app.js)"]
        ROUTER{"🧭 Router (navigate)"}
        NAV_DESKTOP["💻 Sidebar Desktop (260px ↔ 72px)"]
        NAV_MOBILE["📱 Bottom Bar & More Drawer (390px)"]
        SANDBOX["🔧 Reviewer Sandbox Controller"]
    end

    %% Authentication & Onboarding
    subgraph Gateways ["🚪 Gerbang Akses"]
        LOGIN["🔑 Login & OTP Forgot Password (auth.js)"]
        REGISTER["📝 Register & OTP Email Verification (auth.js)"]
        ONBOARDING["🚀 6-Step Business Wizard (onboarding.js)"]
    end

    %% Business Intelligence Modules
    subgraph AppModules ["📊 Modul Solusi Bisnis"]
        DASHBOARD["📊 Executive Dashboard & Visual Calendar (dashboard.js)"]
        ANALYTICS["📈 6-Tab Deep Analytics (analytics.js)"]
        DECISION["💡 Decision Center & Multi-Choice (decision.js)"]
        ACTION["🎯 Action Center & Team Approvals (action.js)"]
        DATA_CENTER["📁 Data Center & Guidance (dataCenter.js)"]
        PROFILE["⚙️ Profile & Subscription Engine (profile.js)"]
    end

    %% Helper Injections
    subgraph Helpers ["🛠️ Shared Helper Services"]
        TOUR["🧭 11-Step Product Tour (tour.js)"]
        HELP["ⓘ Context Help Popover (contextHelp.js)"]
        UTILS["🎨 SVG Charts & Formatter (utils.js)"]
        I18N["🌐 i18n Translation Engine (i18n.js)"]
    end

    %% Connections
    AUTH_STORE --> ROUTER
    JSON_BASELINE -.-> DEMO_STORE
    JSON_BASELINE -.-> CUSTOM_STORE
    DEMO_STORE <==> ROUTER
    CUSTOM_STORE <==> ROUTER

    ROUTER --> LOGIN
    ROUTER --> REGISTER
    ROUTER --> ONBOARDING
    ROUTER --> DASHBOARD
    ROUTER --> ANALYTICS
    ROUTER --> DECISION
    ROUTER --> ACTION
    ROUTER --> DATA_CENTER
    ROUTER --> PROFILE

    NAV_DESKTOP --> ROUTER
    NAV_MOBILE --> ROUTER
    SANDBOX --> ROUTER

    HELP -.-> DASHBOARD
    HELP -.-> ANALYTICS
    UTILS -.-> DASHBOARD
    UTILS -.-> ANALYTICS
    UTILS -.-> ACTION
    I18N -.-> PROFILE
    TOUR -.-> ROUTER
```

---

## 🔄 Diagram Siklus Tertutup (Closed-Loop Interaction)

```mermaid
sequenceDiagram
    autonumber
    actor User as 👤 Pengguna (Pemilik / Manajer)
    participant Data as 📁 Data Center
    participant Analytics as 📈 Analytics Suite
    participant Decision as 💡 Decision Center (Multi-Opsi)
    participant Action as 🎯 Action Center (Approvals & Tasks)
    participant State as 💾 Reactive State (state.js)
    participant Dashboard as 📊 Executive Dashboard (Kalender)

    User->>Data: 1. Hubungkan Data Iklan Meta/TikTok / Unggah POS
    Data->>State: Perbarui Kualitas Data (91%) & Integrasi Baru
    State-->>Analytics: Sinkronkan Omzet Kanal & Metrik ROI Iklan
    
    User->>Analytics: 2. Buka Tab Sales/Marketing, Amati Drilldown Kanal & Baca Penjelasan AI 3-Pertanyaan
    Analytics->>Decision: 3. Klik "Lihat Rekomendasi Terkait"
    
    Decision->>User: 4. Paparkan 3 Skenario Optimalisasi (Opsi A: Agresif, Opsi B: Seimbang, Opsi C: Konservatif)
    User->>Decision: 5. Pilih Opsi B & Klik "Eksekusi Keputusan" (atau Ajukan Persetujuan jika Manager)
    
    alt Jika Pengguna adalah Manajer (Nadia Sari)
        Decision->>State: submitApprovalRequest(rec_001, opt_balanced)
        State->>Action: Masukkan ke Antrean Persetujuan Owner
        Action-->>User: Notifikasi: "Menunggu Persetujuan Owner"
    else Jika Pengguna adalah Pemilik (Ardi Pratama)
        Decision->>State: Terapkan Keputusan (applyRecommendation)
        State->>Action: Otomatis Buat Tugas Baru & Update Progres Target Goal
        State->>State: Hitung Ulang Health Score 6-Dimensi
        State-->>Dashboard: 6. Tampilkan Notifikasi Sukses & Jadwalkan Agenda di Kalender Visual
    end
```

---

## 📐 Diagram Workflow Arsitektur Per Fitur Utama

---

### 1. Workflow: Autentikasi, Registrasi OTP & Pemulihan Sandi

```mermaid
flowchart TD
    START([🌐 Akses Aplikasi]) --> CHECK_AUTH{Sudah Ada Sesi Login?}
    CHECK_AUTH -- Ya --> INIT_STATE[Inisialisasi State Pengguna]
    CHECK_AUTH -- Tidak --> SCREEN_LOGIN[Layar Login: auth.js]

    %% Alur Login
    SCREEN_LOGIN --> CHOICE_LOGIN{Pilihan Masuk}
    CHOICE_LOGIN -- "Demo Quick Login (Ardi / Nadia)" --> SET_DEMO_SESSION[Simpan Sesi Demo ke localStorage]
    CHOICE_LOGIN -- "Google Login (Simulasi)" --> TOAST_GOOGLE[Toast Simulasi OAuth] --> SET_DEMO_SESSION
    CHOICE_LOGIN -- "Form Login Reguler" --> VALIDATE_LOGIN[Validasi Format Email & Sandi] --> SET_DEMO_SESSION
    SET_DEMO_SESSION --> ROUTE_APP[Arahkan ke Dashboard / Onboarding]

    %% Alur Registrasi
    CHOICE_LOGIN -- "Daftar Akun Baru" --> FORM_REG[Form Pendaftaran: Nama, Bisnis, Email, Sandi]
    FORM_REG --> SUBMIT_REG[Kirim Kode OTP Simulasi]
    SUBMIT_REG --> OTP_REG_VIEW[Layar Verifikasi OTP Pendaftaran]
    OTP_REG_VIEW --> VERIFY_REG_OTP{Kode == '987654'?}
    VERIFY_REG_OTP -- Tidak --> ERROR_REG_OTP[Munculkan Toast Eror] --> OTP_REG_VIEW
    VERIFY_REG_OTP -- Ya --> INIT_CLEAN_STATE[Buat State Bersih di LocalStorage]
    INIT_CLEAN_STATE --> ROUTE_ONBOARD[Arahkan ke Wizard Onboarding]

    %% Alur Lupa Sandi
    CHOICE_LOGIN -- "Lupa Sandi?" --> MODAL_FORGOT_1[Modal Step 1: Masukkan Email Bisnis]
    MODAL_FORGOT_1 --> SUBMIT_FORGOT[Kirim Kode Keamanan]
    SUBMIT_FORGOT --> MODAL_FORGOT_2[Modal Step 2: Input OTP '123456']
    MODAL_FORGOT_2 --> VERIFY_FORGOT_OTP{Kode == '123456'?}
    VERIFY_FORGOT_OTP -- Tidak --> ERROR_FORGOT_OTP[Toast Eror OTP] --> MODAL_FORGOT_2
    VERIFY_FORGOT_OTP -- Ya --> MODAL_FORGOT_3[Modal Step 3: Atur Sandi Baru >= 6 Karakter]
    MODAL_FORGOT_3 --> SAVE_NEW_PASS[Simpan Sandi & Login Otomatis] --> ROUTE_APP
```

---

### 2. Workflow: Onboarding Usaha & Inisialisasi Target Bisnis

```mermaid
flowchart LR
    S1["1. Welcome<br/>Filosofi AIbo"] --> S2["2. Peran & Tim<br/>Owner/Manager/Staff"]
    S2 --> S3["3. Profil Usaha<br/>Nama, Industri, Skala, Kota"]
    S3 --> S4["4. Target Goals<br/>Preset & Custom Goal"]
    S4 --> S5["5. Checklist Data<br/>Essential/Rec/Opt"]
    S5 --> S6["6. Validasi Data<br/>Skor Kualitas 91%"]
    S6 --> FINISH["💾 Simpan ke LocalStorage<br/>(completeOnboarding)"]
    FINISH --> DASHBOARD["📊 Buka Dashboard &<br/>Mulai Tur Produk (tour.js)"]
```

---

### 3. Workflow: Executive Dashboard & Health Score 6-Dimensi

```mermaid
flowchart TD
    STATE_DATA[(Global State)] --> HEALTH_CALC["⚙️ Health Engine (recalculateHealthScore)"]
    
    subgraph Dimensions ["6 Dimensi Kesehatan Bisnis"]
        D1["💰 Revenue (Omzet)"]
        D2["📊 Profitabilitas"]
        D3["👥 Pelanggan (Retention)"]
        D4["📣 Pemasaran (ROI)"]
        D5["📦 Stok (Inventory)"]
        D6["💵 Arus Kas (Cash Flow)"]
    end
    
    HEALTH_CALC --> D1 & D2 & D3 & D4 & D5 & D6
    D1 & D2 & D3 & D4 & D5 & D6 --> AVG_SCORE["Rata-Rata Terbobot (Skor 0 - 100)"]
    
    AVG_SCORE --> GAUGE_SVG["Render SVG Gauge Circular (120x120)"]
    STATE_DATA --> KPI_GRID["Render Grid 4 Kartu KPI + Sparkline Tren"]
    STATE_DATA --> DAILY_BRIEF["Render AI Daily Brief Dinamis"]
    STATE_DATA --> CALENDAR["Render Kalender Visual 7-Kolom"]
    
    GAUGE_SVG --> DASH_VIEW["Executive Dashboard UI"]
    KPI_GRID --> DASH_VIEW
    DAILY_BRIEF --> DASH_VIEW
    CALENDAR --> DASH_VIEW

    DASH_VIEW -- "Klik Gauge" --> MODAL_HEALTH["Modal Detail 6 Dimensi"]
    DASH_VIEW -- "Klik KPI" --> MODAL_KPI["Modal Analisis Metrik & Target"]
    DASH_VIEW -- "Klik Tanggal/Acara" --> MODAL_AGENDA["Modal Detail Agenda Harian"]
```

---

### 4. Workflow: Deep-Dive Analytics & Drill-Down Kanal Penjualan

```mermaid
flowchart TD
    ANALYTICS_START[Buka Halaman Analytics] --> SELECT_TAB{Pilih Tab Analitik}
    
    SELECT_TAB --> T1[💰 Sales / Revenue]
    SELECT_TAB --> T2[📊 Profit]
    SELECT_TAB --> T3[👥 Customer]
    SELECT_TAB --> T4[📣 Marketing]
    SELECT_TAB --> T5[📦 Inventory]
    SELECT_TAB --> T6[💵 Cash Flow]

    FILTER_BAR[Filter Rentang Waktu: Jan - Agu / Q1 / Q2 / Q3 / 3 Bulan] --> SLICE_DATA[Pemotongan Array Bulanan]
    GRANULARITY[Granularitas: Harian / Mingguan / Bulanan / Kuartalan] --> RE_RENDER_CHART[Update Sumbu Visual Grafik]
    
    SLICE_DATA & RE_RENDER_CHART --> RENDER_ACTIVE_TAB[Render Visualisasi Tab Aktif]
    
    T1 --> DONUT_CHANNEL[Komposisi Saluran Penjualan Donut]
    DONUT_CHANNEL -- "Klik Baris Kanal (cth: POS)" --> DRILL_MODAL["🔍 Modal Drill-Down Kanal<br/>(Top Produk SKU, % Kontribusi, Saran AI)"]
    
    RENDER_ACTIVE_TAB --> COMPARISON_TABLE["📊 Tabel Komparasi Periode<br/>(Bulan Ini vs Bulan Lalu vs Target)"]
    RENDER_ACTIVE_TAB --> EXPLAINER_CARD["✨ Kartu Penjelasan Cerdas 3-Pertanyaan<br/>1. What Happened?<br/>2. Why it Matters?<br/>3. What to Do?"]
    
    EXPLAINER_CARD -- "Klik Lihat Rekomendasi" --> GOTO_DECISION[Router Pindah ke Decision Center]
```

---

### 5. Workflow: Decision Center & 8-Langkah Transparansi AI

```mermaid
flowchart LR
    subgraph MultiOptions ["Pilihan Multi-Opsi Skenario"]
        OPT_A["Opsi A: Agresif (Rp 7.5M)<br/>+Rp 26M Omzet, Risiko Sedang"]
        OPT_B["Opsi B: Seimbang (Rp 5.0M)<br/>+Rp 18M Omzet, Risiko Rendah"]
        OPT_C["Opsi C: Konservatif (Rp 2.5M)<br/>+Rp 9M Omzet, Risiko Minimal"]
    end

    subgraph StepFramework ["8-Langkah Transparansi AIbo"]
        S1["1. Ringkasan Masalah"]
        S2["2. Akar Masalah (Drivers)"]
        S3["3. Bukti Historis"]
        S4["4. Proyeksi Finansial Opsi"]
        S5["5. Skenario Alternatif"]
        S6["6. Analisis Risiko"]
        S7["7. Rekomendasi Terpilih AIbo"]
        S8["8. Tombol Eksekusi / Ajukan Persetujuan"]
    end

    MultiOptions --> StepFramework
    S8 -- "Klik Terapkan / Ajukan" --> EXECUTE[applyRecommendation / submitApprovalRequest]
```

---

### 6. Workflow: Action Center, Goal Drivers & Eksekusi Loop Tertutup

```mermaid
flowchart TD
    GOAL_TAB[Tab Target Goals & Drivers] --> CLICK_GOAL["Klik Kartu Target (cth: Omzet Rp 500M)"]
    CLICK_GOAL --> MODAL_GOAL_DETAIL["Modal Rincian Target Bisnis"]
    
    MODAL_GOAL_DETAIL --> VIEW_DRIVERS["Lihat Faktor Pendorong (Drivers):<br/>- Penjualan TikTok Ads -18%<br/>- Penjualan Web Direct +24%"]
    MODAL_GOAL_DETAIL --> VIEW_RECS["Lihat Keputusan Terkait"]
    
    VIEW_RECS -- "Klik Eksekusi Keputusan" --> RUN_ACTION["applyRecommendation('rec_001', 'opt_balanced')"]
    
    RUN_ACTION --> AUTO_TASK["Otomatis Tambah Tugas di Kanban Board:<br/>'Realokasi budget TikTok ke Email'"]
    RUN_ACTION --> UPDATE_METRICS["Perbarui Data Spend & ROI Kanal"]
    RUN_ACTION --> UPDATE_GOAL_PROGRESS["Naikkan Progres Target Goal (96.4% -> 98%)"]
    RUN_ACTION --> RECALC_HEALTH["Hitung Ulang Health Score di Dashboard"]
    
    AUTO_TASK & UPDATE_METRICS & UPDATE_GOAL_PROGRESS & RECALC_HEALTH --> NOTIFY["Kirim Toast & Notifikasi Sistem 🎉"]
```

---

### 7. Workflow: Pusat Laporan Bisnis & Simulasi Ekspor Dokumen

```mermaid
flowchart TD
    REPORT_CENTER[Pusat Laporan Bisnis] --> SELECT_CATEGORY{Pilih Kategori}
    
    SELECT_CATEGORY --> C1[🏢 Eksekutif]
    SELECT_CATEGORY --> C2[💰 Keuangan]
    SELECT_CATEGORY --> C3[👥 Pelanggan & Ops]
    SELECT_CATEGORY --> C4[📈 Pemasaran]

    C1 & C2 & C3 & C4 --> SELECT_TEMPLATE[Pilih 1 dari 6 Template Laporan]
    SELECT_TEMPLATE --> OPEN_PREVIEW[Buka Lembar Pratinjau Dokumen]
    
    OPEN_PREVIEW --> PERIOD_CHANGE{Pilih Periode Laporan}
    PERIOD_CHANGE -- "Bulan Ini" --> DATA_MONTHLY[Kalkulasi Metrik Agustus]
    PERIOD_CHANGE -- "Kuartal 3" --> DATA_Q3[Kalkulasi Metrik Jul - Sep]
    PERIOD_CHANGE -- "Year-to-Date" --> DATA_YTD[Kalkulasi Metrik Jan - Agu]
    
    DATA_MONTHLY & DATA_Q3 & DATA_YTD --> RENDER_LETTERHEAD["Render Lembar Cetak:<br/>- Kop Resmi PT Nusa Brew Indonesia<br/>- Narasi AI Executive Summary<br/>- Tabel Verifikasi KPI & Cap AIbo"]
    
    RENDER_LETTERHEAD --> EXPORT_OPTIONS{Opsi Ekspor}
    EXPORT_OPTIONS -- "Cetak PDF" --> SIM_PDF[Simulasi Format PDF]
    EXPORT_OPTIONS -- "Ekspor XLSX" --> SIM_XLSX[Simulasi Spreadsheet Excel]
    EXPORT_OPTIONS -- "Ekspor CSV" --> SIM_CSV[Simulasi Dataset CSV]
```

---

### 8. Workflow: Data Center, Klasifikasi Data & Rekomendasi Integrasi

```mermaid
flowchart TD
    DATA_CENTER[Buka Data Center] --> CHECK_TIERS["Klasifikasi Kebutuhan Data:"]
    
    CHECK_TIERS --> TIER_ESSENTIAL["🟢 ESSENTIAL (Wajib): POS Penjualan & Stok"]
    CHECK_TIERS --> TIER_RECOMMENDED["🟡 RECOMMENDED (Disarankan): CRM & Ads Marketing"]
    CHECK_TIERS --> TIER_OPTIONAL["⚪ OPTIONAL (Tambahan): Biaya Operasional & SDM"]

    DATA_CENTER --> READINESS_BANNER["Banner Kesiapan: 'Analisis Berjalan Optimal (Kualitas 91%)'"]
    DATA_CENTER --> REC_CARD["Kartu Cerdas: Rekomendasi Integrasi Iklan Meta/TikTok"]
    
    REC_CARD -- "Klik Hubungkan Data" --> SIM_SYNC[Simulasi Integrasi Akun Iklan]
    SIM_SYNC --> UPDATE_SCORE[Kualitas Data Naik & Status Iklan Terhubung]
    
    DATA_CENTER --> REMINDER_SCHEDULER[Atur Pengingat Pembaruan Data Mingguan/Bulanan]
    DATA_CENTER --> UPLOAD_WIZARD[Wizard Unggah File CSV / Excel]
```

---

### 9. Workflow: Multi-Tenant State Partitioning di LocalStorage

```mermaid
flowchart TD
    START([Pemuatan State: initState]) --> GET_EMAIL["Ambil Email Aktif dari localStorage('aibo_auth')"]
    GET_EMAIL --> CHECK_KEY{"Cek localStorage('aibo_state_' + email)"}
    
    CHECK_KEY -- "Ada Cache" --> PARSE_CACHE[Parse JSON dan Jadikan appState]
    
    CHECK_KEY -- "Belum Ada" --> FETCH_BASELINE[Fetch AIbo_Dummy_Data.json]
    FETCH_BASELINE --> IS_DEMO{Apakah Email Akun Demo?<br/>ardi@ / nadia@ / guest}
    
    IS_DEMO -- "Ya (Demo)" --> POPULATE_DEMO["Isi Penuh Data Nusa Brew<br/>onboardingCompleted = true"]
    IS_DEMO -- "Tidak (Akun Baru)" --> POPULATE_CLEAN["Salin Skema, Kosongkan Profil & Target<br/>onboardingCompleted = false<br/>data_quality = 10%"]
    
    POPULATE_DEMO & POPULATE_CLEAN --> SAVE_PARTITION["Simpan ke localStorage('aibo_state_' + email)"]
    PARSE_CACHE & SAVE_PARTITION --> NOTIFY_LISTENERS["Picukan Listener Reaktif (notifyStateChange)"]
    NOTIFY_LISTENERS --> RENDER_VIEW[Render Layar Aktif Sesuai State Pengguna]
```

---

## ✨ Detail Fitur-Fitur Kunci (Phase 1 — 4.7)

### 1. Executive Dashboard & High-Impact Widgets
* **Skor Kesehatan 6-Dimensi SVG Circular**: Mengukur Revenue, Profitabilitas, Pelanggan, Pemasaran, Stok, dan Arus Kas.
* **Widget Kas Cair & Runway Operasional**: Menampilkan kas cair Rp 142.5M, daya tahan runway 4.8 bulan (Aman & Sehat), serta perbandingan arus masuk vs beban pengeluaran.
* **Banner Peringatan Dini Anomali Kritis**: Floating alert real-time dengan tombol tindakan cepat `[ 📦 Reorder Stok ➔ ]` dan `[ ⚡ Optimasi Iklan ]`.
* **Pita Ringkasan Progres Target Utama**: Bar progres target bulanan (Omzet Rp 500M / 96.4%) dengan estimasi AIbo Rp 512M dan klik interaktif membuka faktor pendorong (*drivers*).
* **Kalender Visual Bulanan Interaktif & Agenda Mandiri**: Grid 7-kolom (Senin–Minggu), badge kategori acara (Ads, Stok, Tugas, Catatan, Goals), tombol tambah agenda mandiri (`addCustomCalendarEvent`), dan modal detail agenda.

### 2. Multi-Choice Optimalisasi Keputusan di Decision Center
* 3 pilihan skenario per rekomendasi: **Opsi A (Agresif)**, **Opsi B (Seimbang)**, dan **Opsi C (Konservatif)**.
* Kalkulasi trade-off finansial dinamis dan pemilihan opsi saat eksekusi.

### 3. Alur Kerja Persetujuan Tim (*Team Workflow Approvals*)
* Manajer dapat mengajukan permohonan keputusan ke Owner (`submitApprovalRequest`).
* Owner memiliki antrean persetujuan (*Approval Queue*) di Decision Center & Action Center untuk menyetujui (*Approve*) atau menolak (*Reject*).

### 4. Sistem Monetisasi & Paket Langganan (*Subscription & Billing*)
* Pelacak kuota penggunaan AI Copilot, Integrasi Platform, dan Kursi Anggota Tim.
* Matriks perbandingan 3 paket: **Starter UMKM (Rp 0)**, **Pro SME (Rp 299.000/bln)**, dan **Enterprise (Rp 899.000/bln)** dengan diskon 20% tahunan.
* Modal simulasi checkout pembayaran dengan **QRIS**, **Virtual Account (BCA, Mandiri, BRI)**, dan **Kartu Kredit**.

### 5. Sistem Multi-Tenant LocalStorage Sandbox
* State disimpan per-email: `aibo_state_[email]`.
* Akun demo memuat Nusa Brew Coffee, akun pendaftar baru dimulai dari profil bersih/kosong.

### 6. Autentikasi dengan Sesi OTP Realistis
* Registrasi Akun Baru: OTP **`987654`**.
* Pemulihan Lupa Sandi: OTP **`123456`**.

### 7. Health Score 6-Dimensi & AI Daily Brief
* Mengukur kesehatan bisnis secara komprehensif: **Revenue, Profitabilitas, Pelanggan, Pemasaran, Stok, dan Arus Kas**.

### 8. 8-Langkah Transparansi Keputusan (*Decision Explainability*)
* Ringkasan, Akar Masalah, Bukti Data, Proyeksi Finansial, Opsi Alternatif, Analisis Risiko, Rekomendasi, dan Tombol Tindakan 1-Klik.

### 9. Goal Closed-Loop & Advanced Report Center
* Goal Drivers Detail dengan eksekusi 1-klik dan 6 template laporan resmi dengan ekspor simulasi PDF/XLSX/CSV.

### 10. Eksplorasi Visual & Drill-Down Analitik
* Granularitas Waktu (Harian/Mingguan/Bulanan/Kuartalan), Drilldown Saluran Penjualan, dan Penjelasan Cerdas 3-Pertanyaan.

### 11. Tur Produk & Kamus Istilah Kontekstual
* Tur produk 11-langkah berpandu dan popover kamus istilah `ⓘ` dengan contoh hitungan konkret.

---

## 📊 Skema Data & State Management

Objek status global (`appState`) di `js/state.js` memiliki struktur data sebagai berikut:

```typescript
interface AIboState {
  meta: { dataset_name: string; version: string; currency: "IDR" };
  business: {
    name: string;
    legal_name?: string;
    industry: string;
    sub_industry: string;
    scale: "Mikro" | "Kecil" | "Menengah";
    employee_count?: number;
    business_model?: "B2C" | "B2B" | "Hybrid";
    address?: string;
    city?: string;
    province?: string;
    phone?: string;
    email?: string;
    website?: string;
    description?: string;
    main_products?: string;
    channels?: string;
  };
  user: { name: string; role: "Owner" | "Manager" | "Finance" | "Marketing"; email: string };
  subscription: {
    plan: "Starter UMKM" | "Pro SME" | "Enterprise Tier";
    tier: "starter" | "pro" | "enterprise";
    billing_cycle: "monthly" | "annual";
    renewal_date: string;
    price: number;
    payment_method?: string;
    quota: {
      ai_prompts: { used: number; max: number };
      integrations: { used: number; max: number };
      team_seats: { used: number; max: number };
    };
  };
  approvals: Array<{
    id: string;
    rec_id: string;
    title: string;
    category: string;
    requested_by: string;
    requested_at: string;
    status: "pending" | "approved" | "rejected";
    option_id: string;
    option_title: string;
    amount: number;
    financial_impact: string;
    notes?: string;
    reviewed_by?: string;
    reviewed_at?: string;
    review_notes?: string;
  }>;
  business_health: {
    score: number;
    previous_score: number;
    score_change: number;
    status: "Healthy" | "Warning" | "Critical";
    components: {
      revenue: number;
      profitability: number;
      customers: number;
      marketing: number;
      inventory: number;
      cashflow: number;
    };
  };
  kpis: {
    revenue: { current: number; previous: number; target: number; change_percent: number };
    profit: { current: number; previous: number; target: number; change_percent: number };
    profit_margin: { current: number; previous: number; target: number };
    customers: { current: number; previous: number; target: number; change_percent: number };
    average_order_value: { current: number; previous: number; change_percent: number };
    marketing_roi: { current: number; target: number };
    inventory_health: { current: number; target: number };
  };
  revenue: { monthly: Array<{ month: string; revenue: number }>; channels: Array<{ channel: string; revenue: number; percentage: number }> };
  profit: { monthly: Array<{ month: string; profit: number; margin: number }> };
  customers: { summary: { total: number; new_this_month: number; retention_rate: number; churn_rate: number; returning: number }; monthly: Array<{ month: string; customers: number }>; segments: Array<{ name: string; percentage: number; customers: number }> };
  marketing: { spend: number; revenue_attributed: number; roi: number; conversion_rate: number; cost_per_acquisition: number; channels: Array<{ channel: string; spend: number; revenue: number; roi: number; conversions: number }> };
  inventory: { health_score: number; total_items: number; low_stock_count: number; overstock_count: number; low_stock_skus: number; healthy_skus: number; items: Array<{ id: string; sku: string; name: string; category: string; stock: number; reorder_point: number; unit_price: number; unit: string; status: "healthy" | "low_stock" | "overstock" }> };
  goals: Array<{ id: string; name: string; category: string; target: number; current: number; progress: number; status: "on_track" | "at_risk" | "completed"; deadline: string; priority: "High" | "Medium" | "Low"; forecast?: number; explanation?: string }>;
  recommendations: Array<{ id: string; title: string; category: string; impact: string; confidence: number; effort: string; status: "pending" | "applied" | "dismissed"; evidence: string; root_cause: string; financial_impact: string; options: Array<{ title: string; desc: string }>; risk: string; action_text: string; chosen_option?: string }>;
  tasks: Array<{ id: string; title: string; source: string; priority: string; assignee: string; status: "todo" | "in_progress" | "completed"; due_date: string; related_goal?: string }>;
  integrations: Array<{ id: string; name: string; type: string; status: "connected" | "disconnected" | "syncing"; last_sync: string }>;
  data_quality: { overall_score: number; issues: string[] };
  notifications: Array<{ id: string; type: string; title: string; message: string; time: string; read: boolean }>;
  activity: Array<{ id: string; user: string; action: string; object: string; time: string }>;
  onboardingCompleted: boolean;
  onboardingStep: number;
}
```

---

## 🧪 Panduan Penggunaan & Skenario Pengujian

### Skenario 1: Menguji Kalender Visual di Dashboard
1. Buka Executive Dashboard.
2. Amati grid kalender bulan Agustus 2026 dengan badge acara (*Marketing 📢, Stok 📦, Tugas 🎯, Goals 🏁*).
3. Klik tanggal 20 atau 22 Agustus untuk membuka **Modal Detail Agenda Harian**.
4. Klik tombol **`[ Buka Rekomendasi di Decision Center ➔ ]`** untuk navigasi langsung.

### Skenario 2: Menguji Multi-Opsi Optimalisasi Keputusan
1. Buka menu **Decision Center**.
2. Pada kartu rekomendasi pertama, pilih **Opsi A (Agresif)** vs **Opsi B (Seimbang)** vs **Opsi C (Konservatif)**.
3. Perhatikan: Proyeksi dampak finansial berubah seketika (+Rp 26M vs +Rp 18M vs +Rp 9M).
4. Klik **`[ Eksekusi Skenario ]`** untuk menerapkan opsi yang dipilih.

### Skenario 3: Menguji Alur Persetujuan Tim (Manager $\rightarrow$ Owner)
1. Logout dan masuk sebagai **Manager (Nadia Sari)**.
2. Buka Decision Center $\rightarrow$ Klik tombol **`[ 📤 Ajukan Persetujuan ke Owner ]`**.
3. Notifikasi toast sukses muncul dan permohonan masuk antrean.
4. Logout dan masuk kembali sebagai **Owner (Ardi Pratama)**.
5. Buka tab **`⏳ Persetujuan Tim`** di Action Center atau Decision Center $\rightarrow$ Klik **`[ ✓ Setujui (Approve) ]`**.
6. Keputusan langsung dieksekusi secara otomatis dan tugas dibuat di tim!

### Skenario 4: Menguji Upgrade Paket Langganan (Monetisasi)
1. Buka menu **Pengaturan & Profil Bisnis** $\rightarrow$ klik tab **`💳 Paket Langganan & Kuota`**.
2. Amati pengukur kuota (*AI Prompt 42/100, Integrasi 3/5*).
3. Klik tombol **`🚀 Upgrade ke Pro SME`**.
4. Pilih metode pembayaran **QRIS** atau **Virtual Account BCA**.
5. Klik **`[ Selesaikan Pembayaran Simulasi ]`**.
6. Akun Anda berhasil di-upgrade ke **Pro SME** dan kuota AI langsung bertambah menjadi 500 prompt!

---

## 🚀 Panduan Deployment Vercel

Aplikasi telah memenuhi 100% standar static hosting Vercel.

### Cara Deploy via Vercel CLI:
```bash
# 1. Pastikan Anda berada di root direktori proyek
cd Aibo

# 2. Jalankan perintah deploy Vercel
npx vercel

# 3. Ikuti instruksi di terminal (default settings: Static Site)
```

---

**AIbo — Empowering SME Decisions with Artificial Intelligence.**
