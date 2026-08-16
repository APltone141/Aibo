// state.js
// Holds the global reactive state for the AIbo prototype, loads from JSON,
// persists to localStorage using email-partitioned keys, and manages state transition logic.

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
      if (appState.business_health && appState.business_health.components && !appState.business_health.components.cashflow) {
        appState.business_health.components.cashflow = 85;
      }
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

    saveState();
    return appState;
  } catch (error) {
    console.error("Could not fetch initial dummy data", error);
    appState = getMinimumFallbackState();
    return appState;
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

// Action: Apply a Recommendation
export function applyRecommendation(recId) {
  if (!appState) return;

  const recIndex = appState.recommendations.findIndex(r => r.id === recId);
  if (recIndex === -1) return;

  const rec = appState.recommendations[recIndex];
  if (rec.status !== 'pending') return;

  rec.status = 'applied';

  // Specific state impact simulation
  if (recId === 'rec_001') {
    // Shift part of TikTok budget to Email: Move Rp 5M
    const tiktok = appState.marketing.channels.find(c => c.channel === 'TikTok');
    const email = appState.marketing.channels.find(c => c.channel === 'Email');

    if (tiktok && email) {
      tiktok.spend = Math.max(0, tiktok.spend - 5000000);
      email.spend = email.spend + 5000000;
      
      // Update ROI estimations in channels
      tiktok.revenue = Math.round(tiktok.spend * 2.58);
      email.revenue = Math.round(email.spend * 6.0);
      
      // Overall stats update
      appState.marketing.spend = appState.marketing.channels.reduce((sum, c) => sum + c.spend, 0);
      appState.marketing.revenue_attributed = appState.marketing.channels.reduce((sum, c) => sum + c.revenue, 0);
      appState.marketing.roi = parseFloat((appState.marketing.revenue_attributed / appState.marketing.spend).toFixed(2));
      appState.kpis.marketing_roi.current = appState.marketing.roi;

      // Update marketing component health
      appState.business_health.components.marketing = Math.min(100, (appState.business_health.components.marketing || 79) + 6);

      // Update marketing goal progress
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

    // Auto-create a task to implement this campaign shift
    addTask({
      title: "Execute budget reallocation from TikTok Ads to Email",
      source: "AI Recommendation",
      priority: "High",
      assignee: appState.user.name,
      status: "todo",
      due_date: getFutureDate(1),
      related_goal: "goal_004"
    });

  } else if (recId === 'rec_002') {
    // Reorder low-stock products: House Blend 1kg & Matcha Latte Powder
    const task2 = appState.tasks.find(t => t.id === 'task_002');
    const task3 = appState.tasks.find(t => t.id === 'task_003');
    if (task2) task2.status = 'in_progress';
    if (task3) task3.status = 'in_progress';

    // Boost inventory health component
    appState.business_health.components.inventory = Math.min(100, (appState.business_health.components.inventory || 80) + 6);

    addNotification('task', 'Purchase Order Drafted', 'Purchase orders for House Blend 1kg and Matcha Latte Powder have been drafted.', false);

  } else if (recId === 'rec_003') {
    // Push best-performing online products: Increase revenue by Rp 12M
    appState.kpis.revenue.current += 12000000;
    appState.kpis.revenue.change_percent = parseFloat(((appState.kpis.revenue.current - appState.kpis.revenue.previous) / appState.kpis.revenue.previous * 100).toFixed(2));

    // Update goals
    const revGoal = appState.goals.find(g => g.id === 'goal_001');
    if (revGoal) {
      revGoal.current = appState.kpis.revenue.current;
      revGoal.progress = parseFloat(((revGoal.current / revGoal.target) * 100).toFixed(2));
      if (revGoal.current >= revGoal.target) {
        revGoal.status = 'completed';
        resolveAlert('alert_003');
      }
    }

    // Update health components
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

  addActivityLog(appState.user.name, "applied", `AI Recommendation: "${rec.title}"`);
  recalculateHealthScore();
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
    // Reordering items
    const skuCode = taskId === 'task_002' ? 'SKU-002' : 'SKU-004';
    const item = appState.inventory.items.find(i => i.sku === skuCode);
    
    if (item) {
      item.stock = item.sku === 'SKU-002' ? 20 : 15; // replenished to safe stock
      item.status = 'healthy';
      
      // Recalculate low stock items count
      const lowStockCount = appState.inventory.items.filter(i => i.stock < i.reorder_point).length;
      appState.inventory.low_stock_skus = lowStockCount;
      appState.inventory.healthy_skus = appState.inventory.items.filter(i => i.stock >= i.reorder_point).length;
      
      // Update inventory health score
      appState.kpis.inventory_health.current = Math.min(100, 80 + (6 - lowStockCount) * 3.3);
      appState.business_health.components.inventory = Math.min(100, 75 + (6 - lowStockCount) * 4.2);

      // Check if inventory alert can be resolved
      if (lowStockCount === 0) {
        resolveAlert('alert_002');
      }

      // Update goal
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
    // Review TikTok Ads campaigns improves marketing ROI
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

  // Map onboarding profile data to application context
  if (profileData) {
    if (profileData.name) appState.business.name = profileData.name;
    if (profileData.industry) appState.business.industry = profileData.industry;
    if (profileData.sub_industry) appState.business.sub_industry = profileData.sub_industry;
    if (profileData.business_scale) {
      appState.business.business_scale = profileData.business_scale;
      appState.business.scale = profileData.business_scale;
    }
    if (profileData.employee_count) appState.business.employee_count = profileData.employee_count;
    if (profileData.city) appState.business.city = profileData.city;
    
    // Map team members if present
    if (profileData.teamMembers && profileData.teamMembers.length > 0) {
      const existingTeam = appState.team || [];
      profileData.teamMembers.forEach((m, idx) => {
        if (!existingTeam.some(t => t.email === m.email)) {
          existingTeam.push({
            id: `usr_team_${idx + 1}`,
            name: m.email.split('@')[0],
            email: m.email,
            role: m.role || 'Manager',
            status: 'active'
          });
        }
      });
      appState.team = existingTeam;
    }

    // Map selected goals to state
    if (profileData.selectedGoals && profileData.selectedGoals.length > 0) {
      appState.goals = profileData.selectedGoals.map((g, idx) => {
        // Standardize category and units
        let category = 'Revenue';
        let unit = 'IDR';
        if (g.id === 'goal_002') { category = 'Profit'; }
        else if (g.id === 'goal_003') { category = 'Customer'; unit = 'pelanggan'; }
        else if (g.id === 'goal_004') { category = 'Marketing'; unit = 'x ROI'; }
        else if (g.id === 'goal_005') { category = 'Inventory'; unit = '%'; }

        const targetVal = g.target || 100;
        const currentVal = g.id === 'goal_001' ? 482000000 : (g.id === 'goal_002' ? 96400000 : (g.id === 'goal_003' ? 1204 : (g.id === 'goal_004' ? 3.2 : 86)));
        const forecastVal = g.id === 'goal_001' ? 508000000 : (g.id === 'goal_002' ? 102000000 : (g.id === 'goal_003' ? 1280 : (g.id === 'goal_004' ? 3.45 : Math.round(targetVal * 1.05))));

        return {
          id: g.id || `goal_custom_${idx}`,
          name: g.name,
          category: category,
          unit: unit,
          target: targetVal,
          current: currentVal,
          progress: parseFloat(((currentVal / targetVal) * 100).toFixed(1)),
          status: 'on_track',
          deadline: (g.deadline || '6') + ' bulan',
          forecast: forecastVal,
          priority: g.priority || 'Medium',
          explanation: g.explanation || 'Target usaha terintegrasi AIbo'
        };
      });
    }
  }

  // Complete onboarding, simulate initial validation metrics
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
  if (comps.cashflow === undefined) comps.cashflow = 85; // Default Stage E cashflow dimension score
  const average = (comps.revenue + comps.profitability + comps.customers + comps.marketing + comps.inventory + comps.cashflow) / 6;
  
  appState.business_health.previous_score = appState.business_health.score;
  appState.business_health.score = Math.round(average);
  appState.business_health.score_change = appState.business_health.score - appState.business_health.previous_score;
  appState.business_health.status = appState.business_health.score >= 80 ? "Healthy" : (appState.business_health.score >= 60 ? "Warning" : "Critical");
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
