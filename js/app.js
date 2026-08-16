// app.js
// Main entrypoint, routing system, UI shell coordinator, and prototype simulation panel.

import { initState, appState, registerChangeListener, resetState, saveState } from './state.js';
import { renderDashboard } from './components/dashboard.js';
import { renderAnalytics } from './components/analytics.js';
import { renderDecision } from './components/decision.js';
import { renderAction } from './components/action.js';
import { renderDataCenter } from './components/dataCenter.js';
import { renderProfile } from './components/profile.js';
import { renderOnboarding } from './components/onboarding.js';
import { renderLogin, renderRegister, logoutUser } from './components/auth.js';
import { initProductTour } from './components/tour.js';
import { bindContextHelpEvents } from './components/contextHelp.js';

// Holds current active screen identifier
let currentScreen = 'dashboard';

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Theme
  initTheme();
  
  // Initialize Local State
  const state = await initState();
  
  // Register state change listener to dynamically refresh active view
  registerChangeListener((updatedState) => {
    renderActiveScreen(updatedState);
    updateGlobalHeaderMetrics(updatedState);
  });

  // Check auth state
  const auth = localStorage.getItem('aibo_auth');
  if (!auth) {
    navigate('login');
    initPrototypeController();
    return;
  }

  // Setup app container routing
  navigate(state.onboardingCompleted ? 'dashboard' : 'onboarding');
  
  // Setup Prototype State Controller (Utility Panel for reviewers)
  initPrototypeController();
});

function initTheme() {
  const currentTheme = localStorage.getItem('aibo_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', currentTheme);
}

function toggleTheme() {
  const active = document.documentElement.getAttribute('data-theme');
  const next = active === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('aibo_theme', next);
  
  // Update toggle button icon
  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (toggleBtn) {
    toggleBtn.textContent = next === 'dark' ? '☀️' : '🌙';
  }
}

export function navigate(screenId) {
  currentScreen = screenId;
  const state = appState;

  if (screenId === 'login') {
    renderAuthLayout('login');
    return;
  }

  if (screenId === 'register') {
    renderAuthLayout('register');
    return;
  }

  if (screenId === 'logout') {
    logoutUser(navigate);
    return;
  }

  if (!state.onboardingCompleted) {
    // Force onboarding layout regardless of request
    renderOnboardingLayout(state);
    return;
  }

  // Render Full App Shell Layout
  renderAppShell(state);
  renderActiveScreen(state);
  updateGlobalHeaderMetrics(state);
}

function renderAuthLayout(type) {
  const root = document.getElementById('app-root');
  if (type === 'login') {
    renderLogin(root, navigate);
  } else {
    renderRegister(root, navigate);
  }
}

function renderOnboardingLayout(state) {
  const root = document.getElementById('app-root');
  root.innerHTML = `<div id="onboarding-viewport" style="min-height: 100vh; display: flex; align-items: center; justify-content: center; width: 100%;"></div>`;
  const viewport = document.getElementById('onboarding-viewport');
  renderOnboarding(viewport, state, navigate);
}

function renderAppShell(state) {
  const root = document.getElementById('app-root');
  
  // Check if shell already exists to prevent duplicate redraws
  if (document.getElementById('app-shell-container')) {
    return;
  }

  const activeTheme = document.documentElement.getAttribute('data-theme');
  const isCollapsed = localStorage.getItem('aibo_sidebar_collapsed') === 'true';

  root.innerHTML = `
    <div class="app-container" id="app-shell-container">
      
      <!-- DESKTOP SIDEBAR -->
      <aside class="sidebar ${isCollapsed ? 'collapsed' : ''}" id="main-sidebar">
        <div class="sidebar-logo">
          <div class="logo-brand">
            <div class="logo-icon">A</div>
            <span class="logo-text">AIbo</span>
          </div>
          <button class="sidebar-toggle-btn" id="sidebar-toggle-btn" title="Toggle Sidebar">
            ${isCollapsed ? '▶' : '◀'}
          </button>
        </div>
        <nav class="sidebar-nav">
          <a class="nav-item ${currentScreen === 'dashboard' ? 'active' : ''}" data-screen="dashboard" id="nav-dashboard" title="Dashboard">
            <span class="nav-icon">📊</span>
            <span class="nav-text">Dashboard</span>
          </a>
          <a class="nav-item ${currentScreen === 'analytics' ? 'active' : ''}" data-screen="analytics" id="nav-analytics" title="Analytics">
            <span class="nav-icon">📈</span>
            <span class="nav-text">Analytics</span>
          </a>
          <a class="nav-item ${currentScreen === 'decision' ? 'active' : ''}" data-screen="decision" id="nav-decision" title="Decision Center">
            <span class="nav-icon">💡</span>
            <span class="nav-text">Decision Center</span>
          </a>
          <a class="nav-item ${currentScreen === 'action' ? 'active' : ''}" data-screen="action" id="nav-action" title="Action Center">
            <span class="nav-icon">🎯</span>
            <span class="nav-text">Action Center</span>
          </a>
          <a class="nav-item ${currentScreen === 'data' ? 'active' : ''}" data-screen="data" id="nav-data" title="Data Center">
            <span class="nav-icon">📁</span>
            <span class="nav-text">Data Center</span>
          </a>
          <a class="nav-item ${currentScreen === 'profile' ? 'active' : ''}" data-screen="profile" id="nav-profile" title="Settings">
            <span class="nav-icon">⚙️</span>
            <span class="nav-text">Settings</span>
          </a>
        </nav>
        
        <div class="sidebar-footer" style="display: flex; justify-content: space-between; align-items: center; width: 100%; overflow: hidden;">
          <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
            <div class="user-avatar" style="flex-shrink: 0;">${state.user.name.charAt(0)}</div>
            <div class="user-info" style="min-width: 0;">
              <span class="user-name" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;">${state.user.name}</span>
              <span class="user-role">${state.user.role}</span>
            </div>
          </div>
          <button id="btn-logout-sidebar" style="background: none; border: none; cursor: pointer; font-size: 1.15rem; opacity: 0.75; transition: opacity 0.2s; padding: 4px;" title="Keluar (Logout)">
            🚪
          </button>
        </div>
      </aside>

      <!-- MOBILE BOTTOM NAVBAR (4 Primary + More) -->
      <div class="mobile-nav-bar">
        <a class="mobile-nav-item ${currentScreen === 'dashboard' ? 'active' : ''}" data-screen="dashboard">
          <span>📊</span><span>Dash</span>
        </a>
        <a class="mobile-nav-item ${currentScreen === 'analytics' ? 'active' : ''}" data-screen="analytics">
          <span>📈</span><span>Analytics</span>
        </a>
        <a class="mobile-nav-item ${currentScreen === 'decision' ? 'active' : ''}" data-screen="decision">
          <span>💡</span><span>Decision</span>
        </a>
        <a class="mobile-nav-item ${currentScreen === 'action' ? 'active' : ''}" data-screen="action">
          <span>🎯</span><span>Action</span>
        </a>
        <a class="mobile-nav-item" id="mobile-more-btn" style="cursor: pointer;">
          <span>⚡</span><span>More</span>
        </a>
      </div>

      <!-- MOBILE MORE DRAWER SHEET -->
      <div class="mobile-more-drawer-backdrop" id="mobile-more-drawer">
        <div class="mobile-more-sheet">
          <div class="mobile-more-header">
            <span>Menu Navigasi Tambahan</span>
            <button class="mobile-more-close" id="mobile-more-close-btn">&times;</button>
          </div>
          <a class="mobile-more-item" data-screen="data">
            <span>📁</span><span>Data Center</span>
          </a>
          <a class="mobile-more-item" data-screen="profile">
            <span>⚙️</span><span>Settings & Profile</span>
          </a>
          <a class="mobile-more-item" id="mobile-more-notif-btn">
            <span>🔔</span><span>Notifications (${state.notifications.filter(n => !n.read).length})</span>
          </a>
          <a class="mobile-more-item" id="mobile-more-logout-btn" style="border-top: 1px solid var(--border-color); margin-top: 8px; color: var(--danger);">
            <span>🚪</span><span>Keluar (Logout)</span>
          </a>
        </div>
      </div>

      <!-- MAIN PAGE VIEWPORT -->
      <main class="main-content ${isCollapsed ? 'sidebar-collapsed' : ''}" id="main-content-viewport">
        
        <!-- Header / Top Bar -->
        <header class="top-bar">
          <div class="page-title-section">
            <h1 id="header-page-title" style="text-transform: capitalize; font-size: 1.6rem;">${currentScreen}</h1>
            <div class="breadcrumbs" id="header-breadcrumbs">AIbo > ${currentScreen}</div>
          </div>
          
          <div class="page-actions" style="display: flex; align-items: center; gap: 12px;">
            <!-- Help / Product Tour Button -->
            <button class="btn btn-secondary btn-sm" id="btn-launch-tour-header" style="font-size: 0.78rem; padding: 5px 10px; display: flex; align-items: center; gap: 4px;">
              <span>❓</span><span>Tur Produk</span>
            </button>

            <!-- Notification Bell count indicator -->
            <div style="position: relative; cursor: pointer;" id="header-notif-btn">
              <span style="font-size: 1.25rem;">🔔</span>
              <span id="unread-notif-badge" style="position: absolute; top: -4px; right: -4px; background-color: var(--danger); color: white; border-radius: 50%; font-size: 0.65rem; width: 15px; height: 15px; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                ${state.notifications.filter(n => !n.read).length}
              </span>
            </div>
            
            <!-- Light/Dark Toggle -->
            <button class="theme-switch" id="theme-toggle-btn" title="Toggle Light/Dark Theme">
              ${activeTheme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        <!-- Dynamic Screen Content viewport -->
        <section id="screen-content-viewport" class="animate-fade-in" style="flex: 1; display: flex; flex-direction: column; gap: 24px;"></section>

      </main>

    </div>
  `;

  // Bind app navigation events
  bindShellEvents();

  // Bind header tour button
  const tourHeaderBtn = document.getElementById('btn-launch-tour-header');
  if (tourHeaderBtn) {
    tourHeaderBtn.addEventListener('click', () => {
      initProductTour(appState, navigate, true);
    });
  }

  // Auto launch tour if first time
  initProductTour(appState, navigate);
}

function bindShellEvents() {
  // Navigation elements
  const navItems = document.querySelectorAll('.nav-item, .mobile-nav-item[data-screen], .mobile-more-item[data-screen]');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      
      const targetScreen = item.dataset.screen;
      if (!targetScreen) return;
      
      // Hide mobile drawer if open
      closeMobileMoreDrawer();
      
      // Update active nav class visual layout
      document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(i => i.classList.remove('active'));
      document.querySelectorAll(`[data-screen="${targetScreen}"]`).forEach(i => i.classList.add('active'));
      
      currentScreen = targetScreen;
      
      // Update Title & breadcrumbs
      const titleEl = document.getElementById('header-page-title');
      const breadcrumbEl = document.getElementById('header-breadcrumbs');
      if (titleEl) titleEl.textContent = targetScreen === 'data' ? 'Data Center' : (targetScreen === 'decision' ? 'Decision Center' : (targetScreen === 'action' ? 'Action Center' : targetScreen));
      if (breadcrumbEl) breadcrumbEl.textContent = `AIbo > ${targetScreen}`;
      
      renderActiveScreen(appState);
    });
  });

  // Sidebar collapse button click
  const toggleSidebarBtn = document.getElementById('sidebar-toggle-btn');
  if (toggleSidebarBtn) {
    toggleSidebarBtn.addEventListener('click', () => {
      const sidebar = document.getElementById('main-sidebar');
      const mainContent = document.getElementById('main-content-viewport');
      if (!sidebar || !mainContent) return;

      const isNowCollapsed = sidebar.classList.toggle('collapsed');
      mainContent.classList.toggle('sidebar-collapsed', isNowCollapsed);
      toggleSidebarBtn.textContent = isNowCollapsed ? '▶' : '◀';
      localStorage.setItem('aibo_sidebar_collapsed', isNowCollapsed);
    });
  }

  // Mobile More button & Drawer handlers
  const mobileMoreBtn = document.getElementById('mobile-more-btn');
  const mobileMoreDrawer = document.getElementById('mobile-more-drawer');
  const mobileMoreCloseBtn = document.getElementById('mobile-more-close-btn');
  
  if (mobileMoreBtn && mobileMoreDrawer) {
    mobileMoreBtn.addEventListener('click', () => {
      mobileMoreDrawer.classList.add('active');
    });
  }

  if (mobileMoreCloseBtn) {
    mobileMoreCloseBtn.addEventListener('click', closeMobileMoreDrawer);
  }

  if (mobileMoreDrawer) {
    mobileMoreDrawer.addEventListener('click', (e) => {
      if (e.target === mobileMoreDrawer) {
        closeMobileMoreDrawer();
      }
    });
  }

  const mobileNotifItem = document.getElementById('mobile-more-notif-btn');
  if (mobileNotifItem) {
    mobileNotifItem.addEventListener('click', () => {
      closeMobileMoreDrawer();
      const notifBtn = document.getElementById('header-notif-btn');
      if (notifBtn) notifBtn.click();
    });
  }

  // Theme button click
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
  }

  // Bind Sidebar Logout button
  const logoutSidebarBtn = document.getElementById('btn-logout-sidebar');
  if (logoutSidebarBtn) {
    logoutSidebarBtn.addEventListener('click', () => {
      navigate('logout');
    });
  }

  // Bind Mobile More Sheet Logout button
  const logoutMobileBtn = document.getElementById('mobile-more-logout-btn');
  if (logoutMobileBtn) {
    logoutMobileBtn.addEventListener('click', () => {
      closeMobileMoreDrawer();
      navigate('logout');
    });
  }

  // Notif shortcut click redirects directly to Notification Tab in Action Center
  const notifBtn = document.getElementById('header-notif-btn');
  if (notifBtn) {
    notifBtn.addEventListener('click', () => {
      const actionNav = document.querySelector('[data-screen="action"]');
      if (actionNav) {
        actionNav.click();
        // Trigger action tab sub-select if exists
        setTimeout(() => {
          const tabBtn = document.querySelector('[data-tab="notifications"]');
          if (tabBtn) tabBtn.click();
        }, 100);
      }
    });
  }
}

function closeMobileMoreDrawer() {
  const drawer = document.getElementById('mobile-more-drawer');
  if (drawer) drawer.classList.remove('active');
}

function renderActiveScreen(state) {
  const container = document.getElementById('screen-content-viewport');
  if (!container) return;

  switch (currentScreen) {
    case 'dashboard':
      renderDashboard(container, state, navigate);
      break;
    case 'analytics':
      renderAnalytics(container, state, navigate);
      break;
    case 'decision':
      renderDecision(container, state, navigate);
      break;
    case 'action':
      renderAction(container, state, navigate);
      break;
    case 'data':
      renderDataCenter(container, state, navigate);
      break;
    case 'profile':
      renderProfile(container, state, navigate);
      break;
  }

  // Automatically bind contextual terminology help (ⓘ popovers) across all views
  bindContextHelpEvents(container);
}

function updateGlobalHeaderMetrics(state) {
  const badge = document.getElementById('unread-notif-badge');
  if (badge) {
    const unreadCount = state.notifications.filter(n => !n.read).length;
    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? 'flex' : 'none';
  }
}

// Special Prototype Control Panel (Reviews Sandbox switcher - Minimized by Default)
function initPrototypeController() {
  if (document.getElementById('prototype-helper-box')) return;

  const controller = document.createElement('div');
  controller.id = 'prototype-helper-box';
  controller.style.cssText = `
    position: fixed;
    bottom: 80px;
    left: 16px;
    z-index: 10000;
    background-color: var(--bg-card-solid);
    border: 1px solid var(--border-color);
    padding: 6px 10px;
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-lg);
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.8rem;
    transition: all var(--transition-fast);
  `;
  
  controller.innerHTML = `
    <button id="btn-toggle-sandbox" style="background: none; border: none; cursor: pointer; color: var(--primary); font-weight: bold; font-size: 0.9rem;" title="Buka Reviewer Sandbox Panel">
      🔧 Sandbox
    </button>
    <div id="sandbox-expanded-content" style="display: none; align-items: center; gap: 8px; border-left: 1px solid var(--border-color); padding-left: 8px;">
      <select id="prototype-state-dropdown" style="background-color: var(--bg-primary); border: 1px solid var(--border-color); color: var(--text-primary); padding: 4px; border-radius: 4px; font-size: 0.75rem;">
        <option value="returning" ${appState?.onboardingCompleted ? 'selected' : ''}>Pemilik Kembali (Ardi P.)</option>
        <option value="new" ${!appState?.onboardingCompleted ? 'selected' : ''}>Onboarding Pengguna Baru</option>
      </select>
      <button id="btn-sandbox-reset" style="background: none; border: none; cursor: pointer; color: var(--text-muted);" title="Reset local storage state">🔄</button>
    </div>
  `;
  
  document.body.appendChild(controller);

  // Toggle sandbox expand/collapse
  const toggleBtn = document.getElementById('btn-toggle-sandbox');
  const expandedContent = document.getElementById('sandbox-expanded-content');

  if (toggleBtn && expandedContent) {
    toggleBtn.addEventListener('click', () => {
      const isHidden = expandedContent.style.display === 'none';
      expandedContent.style.display = isHidden ? 'flex' : 'none';
    });
  }
  
  // Bind Sandbox dropdown
  const dropdown = document.getElementById('prototype-state-dropdown');
  if (dropdown) {
    dropdown.addEventListener('change', () => {
      if (dropdown.value === 'new') {
        appState.onboardingCompleted = false;
        appState.onboardingStep = 1;
        document.getElementById('app-root').innerHTML = '';
        saveState();
        navigate('onboarding');
      } else {
        appState.onboardingCompleted = true;
        document.getElementById('app-root').innerHTML = '';
        saveState();
        navigate('dashboard');
      }
    });
  }

  // Bind Reset state
  const resetBtn = document.getElementById('btn-sandbox-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
      const confirmReset = confirm("Reset state localStorage ke data dummy awal?");
      if (confirmReset) {
        document.getElementById('app-root').innerHTML = '';
        const state = await resetState();
        dropdown.value = state.onboardingCompleted ? 'returning' : 'new';
        navigate(state.onboardingCompleted ? 'dashboard' : 'onboarding');
      }
    });
  }
}
