// i18n.js
// Lightweight real internationalization module for AIbo MVP
// Provides ID (Bahasa Indonesia) and EN (English) UI dictionary translations

let currentLang = localStorage.getItem('aibo_lang') || 'id';

const translations = {
  id: {
    // Navigation
    nav_dashboard: "Dashboard",
    nav_analytics: "Analitik",
    nav_decision: "Decision Center",
    nav_action: "Action Center",
    nav_data: "Data Center",
    nav_settings: "Pengaturan",
    nav_more: "Lainnya",

    // Headers & Common
    header_subtitle: "AI Business Companion",
    btn_execute: "⚡ Eksekusi Keputusan",
    btn_save: "Simpan Perubahan",
    btn_cancel: "Batal",
    btn_close: "Tutup",
    btn_apply: "Terapkan AIbo",
    btn_details: "Lihat Detail",
    btn_view_report: "Lihat Laporan",
    btn_upload: "Unggah Data",
    btn_sync_all: "Sinkronkan Semua",

    // Dashboard
    health_score_title: "Skor Kesehatan Bisnis",
    health_status_healthy: "Sehat & Stabil",
    health_status_warning: "Perlu Perhatian",
    health_status_critical: "Kritis",
    daily_brief_title: "AI Daily Brief Hari Ini",
    kpi_revenue: "Total Omset (Agustus)",
    kpi_profit: "Laba Bersih",
    kpi_margin: "Margin Laba",
    kpi_customers: "Total Pelanggan",
    kpi_inventory_health: "Kesehatan Stok",
    business_calendar_title: "Kalender & Timeline Bisnis",

    // Decision Center
    decision_copilot_title: "AI Business Copilot",
    decision_copilot_placeholder: "Tanyakan kondisi bisnis Anda...",
    decision_evidence_title: "Analisis & Bukti Pendukung AI",
    
    // Data Center
    data_quality_score: "Skor Kualitas Data",
    data_reminders_title: "Pengingat Pembaruan Data",

    // Profile & Settings
    settings_title: "Pengaturan & Profil Bisnis",
    language_select: "Bahasa Tampilan",
    team_permissions: "Matriks Izin Tim",

    // Auth
    login_title: "Masuk ke AIbo",
    login_subtitle: "Platform Decision Intelligence Berbasis AI",
    login_google_sim: "Masuk dengan Google (Simulasi)",
    register_title: "Daftar Akun Baru",
    logout: "Keluar (Sign Out)"
  },
  en: {
    // Navigation
    nav_dashboard: "Dashboard",
    nav_analytics: "Analytics",
    nav_decision: "Decision Center",
    nav_action: "Action Center",
    nav_data: "Data Center",
    nav_settings: "Settings",
    nav_more: "More",

    // Headers & Common
    header_subtitle: "AI Business Companion",
    btn_execute: "⚡ Execute Decision",
    btn_save: "Save Changes",
    btn_cancel: "Cancel",
    btn_close: "Close",
    btn_apply: "Apply Recommendation",
    btn_details: "View Details",
    btn_view_report: "View Report",
    btn_upload: "Upload Data",
    btn_sync_all: "Sync All",

    // Dashboard
    health_score_title: "Business Health Score",
    health_status_healthy: "Healthy & Stable",
    health_status_warning: "Needs Attention",
    health_status_critical: "Critical",
    daily_brief_title: "Today's AI Daily Brief",
    kpi_revenue: "Total Revenue (August)",
    kpi_profit: "Net Profit",
    kpi_margin: "Profit Margin",
    kpi_customers: "Total Customers",
    kpi_inventory_health: "Inventory Health",
    business_calendar_title: "Business Calendar & Timeline",

    // Decision Center
    decision_copilot_title: "AI Business Copilot",
    decision_copilot_placeholder: "Ask about your business condition...",
    decision_evidence_title: "AI Analysis & Supporting Evidence",

    // Data Center
    data_quality_score: "Data Quality Score",
    data_reminders_title: "Data Refresh Reminders",

    // Profile & Settings
    settings_title: "Settings & Business Profile",
    language_select: "Display Language",
    team_permissions: "Team Permission Matrix",

    // Auth
    login_title: "Sign in to AIbo",
    login_subtitle: "AI-Powered Decision Intelligence Platform",
    login_google_sim: "Sign in with Google (Simulation)",
    register_title: "Create New Account",
    logout: "Sign Out"
  }
};

export function getLanguage() {
  return currentLang;
}

export function setLanguage(lang) {
  if (translations[lang]) {
    currentLang = lang;
    localStorage.setItem('aibo_lang', lang);
    return true;
  }
  return false;
}

export function t(key, fallback = '') {
  const dict = translations[currentLang] || translations.id;
  return dict[key] || fallback || key;
}
