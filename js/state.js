// state.js
// Holds the global reactive state for the AIbo prototype, loads from JSON,
// persists to localStorage using email-partitioned keys, and manages state transition logic.
// Features: Multi-Tenant Partitioning, 6-Dimension Health Recalculator, Workflow Approvals, Subscription & Quota Engine.

export let appState = null;

// Listeners that get notified on state changes
const changeListeners = [];

export function registerChangeListener(callback) {
  if (typeof callback === 'function') {
    changeListeners.push(callback);
  }
}

function notifyStateChange() {
  saveState();
  changeListeners.forEach(callback => callback(appState));
}

// Helper: Get active authenticated user email
export function getActiveUserEmail() {
  const auth = localStorage.getItem('aibo_auth');
  if (auth) {
    try {
      const parsed = JSON.parse(auth);
      return parsed.email || 'guest';
    } catch (e) {
      return 'guest';
    }
  }
  return 'guest';
}

// Check if localStorage has state partitioned by email, otherwise fetch it from the JSON file
export async function initState() {
  const email = getActiveUserEmail();
  const cachedState = localStorage.getItem('aibo_state_' + email);
  if (cachedState) {
    try {
      appState = JSON.parse(cachedState);
      // Auto-migrate cached state to ensure schema completeness
      ensureStateSchemaCompleteness();
      saveState();
      return appState;
    } catch (e) {
      console.error("Error parsing cached state for " + email, e);
    }
  }

  // Fetch from the local JSON file
  try {
    const response = await fetch('./AIbo_Dummy_Data.json');
    if (!response.ok) {
      throw new Error(`Failed to load dummy data: ${response.statusText}`);
    }
    const baseline = await response.json();
    
    // Determine if prototype account or new user
    const isPrototype = email === 'ardi@nusabrew.com' || email === 'nadia@nusabrew.com' || email === 'guest';
    
    if (isPrototype) {
      appState = baseline;
      // Guarantee matching session name and email
      if (email === 'nadia@nusabrew.com') {
        appState.user.name = "Nadia Sari";
        appState.user.role = "Manager";
        appState.user.email = "nadia@nusabrew.com";
      } else {
        appState.user.name = "Ardi Pratama";
        appState.user.role = "Owner";
        appState.user.email = "ardi@nusabrew.com";
      }
      appState.onboardingCompleted = true;
    } else {
      // New user registration: Clone baseline structure but reset variables for onboarding
      appState = JSON.parse(JSON.stringify(baseline)); // Deep copy
      
      const auth = localStorage.getItem('aibo_auth');
      let regName = "Owner Baru";
      if (auth) {
        try {
          const parsed = JSON.parse(auth);
          regName = parsed.name || regName;
        } catch(e) {}
      }

      appState.user = { name: regName, role: "Owner", email: email };
      appState.business = { name: "", industry: "", sub_industry: "", scale: "", description: "", main_products: "", channels: "" };
      appState.onboardingCompleted = false;
      appState.onboardingStep = 1;
      appState.tasks = [];
      appState.goals = [];
      appState.alerts = [];
      appState.notifications = [];
      appState.activity = [];
      appState.integrations = [];
      appState.data_quality = { overall_score: 10, issues: ["POS data not connected", "Marketing data not connected"] };
    }

    ensureStateSchemaCompleteness();
    saveState();
    return appState;
  } catch (error) {
    console.error("Could not fetch initial dummy data", error);
    appState = getMinimumFallbackState();
    ensureStateSchemaCompleteness();
    return appState;
  }
}

// Ensures new features schema exists in appState
function ensureStateSchemaCompleteness() {
  if (!appState) return;

  // 1. Inventory units & pricing
  if (appState.inventory && appState.inventory.items) {
    appState.inventory.items.forEach(item => {
      if (!item.unit) {
        item.unit = item.name.includes('Powder') ? 'kg' : (item.name.includes('Bottle') ? 'btl' : (item.name.includes('Latte') ? 'cup' : (item.name.includes('Croissant') ? 'pcs' : 'pack')));
      }
      if (!item.unit_price) {
        item.unit_price = item.name.includes('1kg') ? 220000 : (item.name.includes('Powder') ? 180000 : (item.name.includes('Bottle') ? 35000 : (item.name.includes('Latte') ? 38000 : (item.name.includes('Croissant') ? 28000 : 65000))));
      }
    });
  }

  // 2. 6-Dimension Health Components
  if (appState.business_health && appState.business_health.components && !appState.business_health.components.cashflow) {
    appState.business_health.components.cashflow = 85;
  }

  // 3. Subscription & Quota Engine
  if (!appState.subscription) {
    appState.subscription = {
      plan: 'Starter UMKM',
      tier: 'starter',
      billing_cycle: 'monthly',
      renewal_date: '2026-09-01',
      price: 0,
      quota: {
        ai_prompts: { used: 42, max: 100 },
        integrations: { used: 3, max: 5 },
        team_seats: { used: 2, max: 5 }
      }
    };
  }

  // 4. Team Workflow Approvals
  if (!appState.approvals) {
    appState.approvals = [
      {
        id: 'appr_001',
        rec_id: 'rec_001',
        title: 'Realokasi Budget Iklan TikTok ke Email Marketing',
        category: 'Marketing',
        requested_by: 'Nadia Sari (Manager)',
        requested_at: '2026-08-16T14:30:00Z',
        status: 'pending', // 'pending' | 'approved' | 'rejected'
        option_id: 'opt_balanced',
        option_title: 'Opsi B (Seimbang) — Realokasi Rp 5.000.000',
        amount: 5000000,
        financial_impact: '+Rp 18.000.000 proyeksi omzet tambahan',
        notes: 'Diajukan oleh Manager untuk mengoptimalkan ROI pemasaran sesuai rekomendasi AIbo.'
      }
    ];
  }

  // 5. Cashflow & Runway Indicator
  if (!appState.cashflow) {
    appState.cashflow = {
      balance: 142500000,
      monthly_burn: 29500000,
      runway_months: 4.8,
      status: 'Aman & Sehat',
      inflow: 482000000,
      outflow: 385600000
    };
  }

  // 6. Custom Calendar Events / Notes
  if (!appState.custom_events) {
    appState.custom_events = [
      {
        id: 'evt_custom_001',
        date: '2026-08-19',
        title: 'Meeting Supplier Biji Kopi Toraja',
        category: 'Tugas',
        notes: 'Negosiasi harga pasokan batch panen Q4 dengan Koperasi Petani.',
        time: '10:00 WIB',
        createdBy: 'Ardi Pratama'
      }
    ];
  }
}

export function saveState() {
  if (appState) {
    const email = getActiveUserEmail();
    localStorage.setItem('aibo_state_' + email, JSON.stringify(appState));
  }
}

export function resetState() {
  const email = getActiveUserEmail();
  localStorage.removeItem('aibo_state_' + email);
  return initState();
}

// Action: Apply a Recommendation with Multi-Choice Options
export function applyRecommendation(recId, optionId = 'opt_balanced') {
  if (!appState) return;

  const recIndex = appState.recommendations.findIndex(r => r.id === recId);
  if (recIndex === -1) return;

  const rec = appState.recommendations[recIndex];
  if (rec.status !== 'pending') return;

  rec.status = 'applied';
  rec.chosen_option = optionId;

  // Specific state impact simulation based on Option chosen
  if (recId === 'rec_001') {
    let moveAmount = 5000000;
    let expectedRevBoost = 18000000;
    let taskPriority = 'High';

    if (optionId === 'opt_aggressive') {
      moveAmount = 7500000;
      expectedRevBoost = 26000000;
      taskPriority = 'High';
    } else if (optionId === 'opt_conservative') {
      moveAmount = 2500000;
      expectedRevBoost = 9000000;
      taskPriority = 'Medium';
    }

    const tiktok = appState.marketing.channels.find(c => c.channel === 'TikTok');
    const email = appState.marketing.channels.find(c => c.channel === 'Email');

    if (tiktok && email) {
      tiktok.spend = Math.max(0, tiktok.spend - moveAmount);
      email.spend = email.spend + moveAmount;
      
      tiktok.revenue = Math.round(tiktok.spend * 2.58);
      email.revenue = Math.round(email.spend * 6.0);
      
      appState.marketing.spend = appState.marketing.channels.reduce((sum, c) => sum + c.spend, 0);
      appState.marketing.revenue_attributed = appState.marketing.channels.reduce((sum, c) => sum + c.revenue, 0);
      appState.marketing.roi = parseFloat((appState.marketing.revenue_attributed / appState.marketing.spend).toFixed(2));
      appState.kpis.marketing_roi.current = appState.marketing.roi;

      appState.business_health.components.marketing = Math.min(100, (appState.business_health.components.marketing || 79) + 6);

      const marketingGoal = appState.goals.find(g => g.id === 'goal_004');
      if (marketingGoal) {
        marketingGoal.current = appState.marketing.roi;
        marketingGoal.progress = parseFloat(((marketingGoal.current / marketingGoal.target) * 100).toFixed(2));
        if (marketingGoal.current >= marketingGoal.target) {
          marketingGoal.status = 'on_track';
          resolveAlert('alert_001');
        } else {
          marketingGoal.status = 'on_track';
        }
      }
    }

    addTask({
      title: `Execute budget reallocation of Rp ${(moveAmount/1000000).toFixed(1)}M from TikTok Ads to Email (${optionId.replace('opt_', '')})`,
      source: "AI Recommendation",
      priority: taskPriority,
      assignee: appState.user.name,
      status: "todo",
      due_date: getFutureDate(1),
      related_goal: "goal_004"
    });

  } else if (recId === 'rec_002') {
    const task2 = appState.tasks.find(t => t.id === 'task_002');
    const task3 = appState.tasks.find(t => t.id === 'task_003');
    if (task2) task2.status = 'in_progress';
    if (task3) task3.status = 'in_progress';

    appState.business_health.components.inventory = Math.min(100, (appState.business_health.components.inventory || 80) + 6);

    addNotification('task', 'Purchase Order Drafted', 'Purchase orders for House Blend 1kg and Matcha Latte Powder have been drafted.', false);

  } else if (recId === 'rec_003') {
    appState.kpis.revenue.current += 12000000;
    appState.kpis.revenue.change_percent = parseFloat(((appState.kpis.revenue.current - appState.kpis.revenue.previous) / appState.kpis.revenue.previous * 100).toFixed(2));

    const revGoal = appState.goals.find(g => g.id === 'goal_001');
    if (revGoal) {
      revGoal.current = appState.kpis.revenue.current;
      revGoal.progress = parseFloat(((revGoal.current / revGoal.target) * 100).toFixed(2));
      if (revGoal.current >= revGoal.target) {
        revGoal.status = 'completed';
        resolveAlert('alert_003');
      }
    }

    appState.business_health.components.revenue = Math.min(100, appState.business_health.components.revenue + 4);
    recalculateHealthScore();

    addTask({
      title: "Optimize online ads assets for Top Performing Coffee blends",
      source: "AI Recommendation",
      priority: "Medium",
      assignee: appState.user.name,
      status: "todo",
      due_date: getFutureDate(3),
      related_goal: "goal_001"
    });
  }

  // Update corresponding approval request if it exists
  const relatedApproval = (appState.approvals || []).find(a => a.rec_id === recId && a.status === 'pending');
  if (relatedApproval) {
    relatedApproval.status = 'approved';
  }

  addActivityLog(appState.user.name, "applied", `AI Recommendation: "${rec.title}" (Opsi: ${optionId})`);
  recalculateHealthScore();
  notifyStateChange();
}

// Action: Submit Workflow Approval Request (Used by Manager)
export function submitApprovalRequest(requestData) {
  if (!appState) return;

  const nextId = `appr_0${(appState.approvals || []).length + 1}`;
  const newApproval = {
    id: nextId,
    rec_id: requestData.rec_id || 'rec_001',
    title: requestData.title || 'Pengajuan Keputusan Strategis',
    category: requestData.category || 'Operations',
    requested_by: `${appState.user.name} (${appState.user.role})`,
    requested_at: new Date().toISOString(),
    status: 'pending',
    option_id: requestData.option_id || 'opt_balanced',
    option_title: requestData.option_title || 'Opsi B (Seimbang)',
    amount: requestData.amount || 5000000,
    financial_impact: requestData.financial_impact || '+Rp 18.000.000 proyeksi omzet',
    notes: requestData.notes || 'Pengajuan persetujuan keputusan bisnis AIbo kepada Pemilik Usaha.'
  };

  if (!appState.approvals) appState.approvals = [];
  appState.approvals.unshift(newApproval);

  addNotification('approval', 'Pengajuan Persetujuan Baru', `Pengajuan "${newApproval.title}" oleh ${newApproval.requested_by} menunggu persetujuan Owner.`, false);
  addActivityLog(appState.user.name, "submitted_approval", `Approval Request: "${newApproval.title}"`);
  
  notifyStateChange();
}

// Action: Respond to Approval Request (Used by Owner)
export function respondApprovalRequest(approvalId, action, reviewNotes = '') {
  if (!appState || !appState.approvals) return;

  const approval = appState.approvals.find(a => a.id === approvalId);
  if (!approval || approval.status !== 'pending') return;

  approval.status = action === 'approved' ? 'approved' : 'rejected';
  approval.reviewed_by = `${appState.user.name} (${appState.user.role})`;
  approval.reviewed_at = new Date().toISOString();
  approval.review_notes = reviewNotes;

  if (action === 'approved') {
    // Automatically apply the recommendation
    applyRecommendation(approval.rec_id, approval.option_id);
    addNotification('approval', 'Pengajuan Disetujui ✅', `Owner menyetujui "${approval.title}". Tugas operasional telah dibuat secara otomatis.`, true);
    addActivityLog(appState.user.name, "approved", `Approved Request: "${approval.title}"`);
  } else {
    addNotification('approval', 'Pengajuan Ditolak ❌', `Owner menolak "${approval.title}": ${reviewNotes || 'Perlu peninjauan ulang strategi.'}`, true);
    addActivityLog(appState.user.name, "rejected", `Rejected Request: "${approval.title}"`);
  }

  notifyStateChange();
}

// Action: Upgrade Subscription Tier (Monetization Engine)
export function upgradeSubscription(planTier, billingCycle = 'monthly', paymentMethod = 'QRIS') {
  if (!appState) return;

  let planName = 'Pro SME';
  let price = billingCycle === 'annual' ? 2870400 : 299000;
  let promptsMax = 500;
  let integrationsMax = 20;
  let seatsMax = 15;

  if (planTier === 'enterprise') {
    planName = 'Enterprise Tier';
    price = billingCycle === 'annual' ? 8630400 : 899000;
    promptsMax = 2000;
    integrationsMax = 99;
    seatsMax = 50;
  }

  appState.subscription = {
    plan: planName,
    tier: planTier,
    billing_cycle: billingCycle,
    renewal_date: '2027-08-16',
    price: price,
    payment_method: paymentMethod,
    quota: {
      ai_prompts: { used: 42, max: promptsMax },
      integrations: { used: 3, max: integrationsMax },
      team_seats: { used: 2, max: seatsMax }
    }
  };

  addNotification('system', 'Paket Langganan Diperbarui 🎉', `Selamat! Akun bisnis Anda telah ditingkatkan ke paket ${planName}.`, true);
  addActivityLog(appState.user.name, "upgraded_plan", `Subscribed to ${planName} (${billingCycle.toUpperCase()}) via ${paymentMethod}`);

  notifyStateChange();
}

// Action: Complete a Task
export function completeTask(taskId) {
  if (!appState) return;

  const task = appState.tasks.find(t => t.id === taskId);
  if (!task || task.status === 'completed') return;

  task.status = 'completed';

  // Specific state impact based on task completion
  if (taskId === 'task_002' || taskId === 'task_003') {
    const skuCode = taskId === 'task_002' ? 'SKU-002' : 'SKU-004';
    const item = appState.inventory.items.find(i => i.sku === skuCode);
    
    if (item) {
      item.stock = item.sku === 'SKU-002' ? 20 : 15;
      item.status = 'healthy';
      
      const lowStockCount = appState.inventory.items.filter(i => i.stock < i.reorder_point).length;
      appState.inventory.low_stock_skus = lowStockCount;
      appState.inventory.healthy_skus = appState.inventory.items.filter(i => i.stock >= i.reorder_point).length;
      
      appState.kpis.inventory_health.current = Math.min(100, 80 + (6 - lowStockCount) * 3.3);
      appState.business_health.components.inventory = Math.min(100, 75 + (6 - lowStockCount) * 4.2);

      if (lowStockCount === 0) {
        resolveAlert('alert_002');
      }

      const invGoal = appState.goals.find(g => g.id === 'goal_005');
      if (invGoal) {
        invGoal.current = appState.kpis.inventory_health.current;
        invGoal.progress = parseFloat(((invGoal.current / invGoal.target) * 100).toFixed(2));
        if (invGoal.current >= invGoal.target) {
          invGoal.status = 'on_track';
        }
      }
    }
  } else if (taskId === 'task_001') {
    appState.marketing.roi = Math.min(3.5, appState.marketing.roi + 0.1);
    appState.kpis.marketing_roi.current = appState.marketing.roi;
    
    const marketingGoal = appState.goals.find(g => g.id === 'goal_004');
    if (marketingGoal) {
      marketingGoal.current = appState.marketing.roi;
      marketingGoal.progress = parseFloat(((marketingGoal.current / marketingGoal.target) * 100).toFixed(2));
      if (marketingGoal.current >= marketingGoal.target) {
        marketingGoal.status = 'on_track';
        resolveAlert('alert_001');
      }
    }
  }

  addActivityLog(task.assignee || appState.user.name, "completed", `Task: "${task.title}"`);
  addNotification('task', 'Task Completed', `Task "${task.title}" has been completed.`, true);
  
  recalculateHealthScore();
  notifyStateChange();
}

// Action: Set Onboarding Completed
export function completeOnboarding(profileData) {
  if (!appState) return;

  appState.onboardingCompleted = true;
  appState.onboardingStep = 0;

  if (profileData) {
    if (profileData.name) appState.business.name = profileData.name;
    if (profileData.industry) appState.business.industry = profileData.industry;
    if (profileData.sub_industry) appState.business.sub_industry = profileData.sub_industry;
    if (profileData.business_scale) {
      appState.business.business_scale = profileData.business_scale;
      appState.business.scale = profileData.business_scale;
    }
    
    if (profileData.selectedGoals && profileData.selectedGoals.length > 0) {
      appState.goals = profileData.selectedGoals.map((g, idx) => {
        let category = 'Revenue';
        let unit = 'IDR';
        if (g.id === 'goal_002') { category = 'Profit'; }
        else if (g.id === 'goal_003') { category = 'Customer'; unit = 'pelanggan'; }
        else if (g.id === 'goal_004') { category = 'Marketing'; unit = 'x ROI'; }
        else if (g.id === 'goal_005') { category = 'Inventory'; unit = '%'; }

        return {
          id: g.id || `goal_custom_${idx}`,
          name: g.name,
          category: category,
          target: g.target || 100,
          current: g.id === 'goal_001' ? 482000000 : (g.id === 'goal_002' ? 96400000 : 0),
          progress: g.id === 'goal_001' ? 96.4 : (g.id === 'goal_002' ? 96.4 : 0),
          status: 'on_track',
          deadline: (g.deadline || '6') + ' bulan',
          priority: g.priority || 'Medium',
          explanation: g.explanation || 'Target usaha terintegrasi AIbo'
        };
      });
    }
  }

  appState.data_quality.overall_score = 91;
  appState.business_health.score = 82;

  addActivityLog(appState.user.name, "completed", "Business Setup Onboarding");
  notifyStateChange();
}

// Helper: Add custom task
export function addTask(taskData) {
  const nextId = `task_0${appState.tasks.length + 1}`;
  const newTask = {
    id: nextId,
    title: taskData.title || "New Task",
    source: taskData.source || "User Action",
    priority: taskData.priority || "Medium",
    assignee: taskData.assignee || appState.user.name,
    status: taskData.status || "todo",
    due_date: taskData.due_date || getFutureDate(2),
    related_goal: taskData.related_goal || null
  };
  appState.tasks.unshift(newTask);
  addNotification('task', 'New Task Created', newTask.title, false);
}

// Helper: Add custom notification
export function addNotification(type, title, message, read = false) {
  const newNotif = {
    id: `notif_0${appState.notifications.length + 1}`,
    type: type,
    title: title,
    message: message,
    time: "Just now",
    read: read
  };
  appState.notifications.unshift(newNotif);
}

// Helper: Add custom activity log
export function addActivityLog(user, action, object) {
  const newActivity = {
    id: `act_0${appState.activity.length + 1}`,
    user: user,
    action: action,
    object: object,
    time: new Date().toISOString()
  };
  appState.activity.unshift(newActivity);
}

// Helper: Recalculate Business Health Score based on 6 dimensions (Stage E consistency)
export function recalculateHealthScore() {
  const comps = appState.business_health.components;
  if (comps.cashflow === undefined) comps.cashflow = 85;
  const average = (comps.revenue + comps.profitability + comps.customers + comps.marketing + comps.inventory + comps.cashflow) / 6;
  
  appState.business_health.previous_score = appState.business_health.score;
  appState.business_health.score = Math.round(average);
  appState.business_health.score_change = appState.business_health.score - appState.business_health.previous_score;
  appState.business_health.status = appState.business_health.score >= 80 ? "Healthy" : (appState.business_health.score >= 60 ? "Warning" : "Critical");
}

// Calendar Custom Events / Business Notes Management
export function addCustomCalendarEvent(event) {
  if (!appState) return null;
  if (!appState.custom_events) appState.custom_events = [];
  
  const newEvt = {
    id: `evt_custom_${Date.now()}`,
    date: event.date || '2026-08-16',
    title: event.title || 'Agenda Baru',
    category: event.category || 'Catatan',
    notes: event.notes || '',
    time: event.time || '09:00 WIB',
    createdBy: appState.user ? appState.user.name : 'User'
  };
  
  appState.custom_events.push(newEvt);
  
  addActivity(
    appState.user ? appState.user.name : 'User',
    'menambahkan agenda kalender',
    `"${newEvt.title}" pada ${newEvt.date}`
  );
  
  notifyStateChange();
  return newEvt;
}

export function deleteCustomCalendarEvent(eventId) {
  if (!appState || !appState.custom_events) return;
  const index = appState.custom_events.findIndex(e => e.id === eventId);
  if (index !== -1) {
    const deleted = appState.custom_events.splice(index, 1)[0];
    addActivity(
      appState.user ? appState.user.name : 'User',
      'menghapus agenda kalender',
      `"${deleted.title}"`
    );
    notifyStateChange();
  }
}

function resolveAlert(alertId) {
  const alert = appState.alerts.find(a => a.id === alertId);
  if (alert) {
    alert.status = 'resolved';
  }
}

function getFutureDate(daysAhead) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}

function getMinimumFallbackState() {
  return {
    meta: { dataset_name: "Fallback State", version: "1.0", currency: "IDR" },
    business: { name: "Nusa Brew Coffee", industry: "Food & Beverage", sub_industry: "Specialty Coffee", scale: "Usaha Kecil" },
    user: { name: "Ardi Pratama", role: "Owner" },
    business_health: { score: 82, status: "Healthy", components: { revenue: 86, profitability: 81, customers: 84, marketing: 79, inventory: 80, cashflow: 85 } },
    kpis: {
      revenue: { current: 482000000, previous: 431000000, target: 500000000 },
      profit: { current: 96400000, previous: 77580000, target: 100000000 },
      profit_margin: { current: 20.0, previous: 18.0, target: 20.0 },
      customers: { current: 1204, previous: 1089, target: 1250 },
      inventory_health: { current: 86, target: 90 }
    },
    tasks: [],
    recommendations: [],
    goals: [],
    alerts: [],
    notifications: [],
    activity: [],
    integrations: [],
    data_quality: { overall_score: 91, issues: [] },
    onboardingCompleted: true
  };
}
