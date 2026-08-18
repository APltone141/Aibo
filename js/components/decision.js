import { formatCurrency, formatPercent, formatNumber, showToast } from '../utils.js';
import { applyRecommendation, submitApprovalRequest, respondApprovalRequest } from '../state.js';
import { getIcon } from '../icons.js';

export function renderDecision(container, state, onNavigate) {
  const recommendations = state.recommendations || [];
  const insights = state.ai_insights || [];
  const userRole = state.user?.role || 'Owner';
  const isOwner = userRole === 'Owner';
  const isManager = userRole === 'Manager';

  let activeCategory = 'all'; 
  let activePriority = 'all'; 
  let activeModalRec = null;  
  
  // Selected option per recommendation: default to 'opt_balanced'
  if (!state.selected_rec_options) {
    state.selected_rec_options = {
      rec_001: 'opt_balanced',
      rec_002: 'opt_balanced',
      rec_003: 'opt_balanced'
    };
  }

  if (!state.copilot_history) {
    state.copilot_history = [
      {
        sender: 'ai',
        text: `Halo ${state.user?.name || 'Pemilik Usaha'} (${userRole})! Saya adalah **AI Business Copilot** Anda. Berdasarkan data Nusa Brew Coffee bulan Agustus, saya mendeteksi anomali efisiensi iklan di TikTok Ads dan 2 SKU dengan stok kritis. Anda dapat memilih skenario optimalisasi pada kartu rekomendasi di bawah!`
      }
    ];
  }

  let isThinking = false;

  function updateView() {
    const filteredRecs = recommendations.filter(r => {
      const matchCat = activeCategory === 'all' || r.category === activeCategory || (r.affected_kpis && r.affected_kpis.some(k => k.toLowerCase().includes(activeCategory.toLowerCase())));
      const matchPrio = activePriority === 'all' || r.priority === activePriority;
      return matchCat && matchPrio;
    });

    const pendingApprovals = (state.approvals || []).filter(a => a.status === 'pending');

    container.innerHTML = `
      <div class="animate-fade-in decision-root" style="display: flex; flex-direction: column; gap: 20px;">
        
        <!-- Team Approval Queue Banner (Visible if there are pending requests or for Owner/Manager) -->
        ${pendingApprovals.length > 0 ? `
          <div class="card" style="border-left: 4px solid var(--warning); background: linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, var(--bg-card) 100%);">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 12px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span style="color: var(--warning); display: flex; align-items: center;">${getIcon('pending', { size: 20 })}</span>
                <div>
                  <strong style="font-size: 0.95rem; color: var(--text-primary);">Antrean Persetujuan Tim (${pendingApprovals.length} Menunggu Persetujuan)</strong>
                  <span style="font-size: 0.72rem; color: var(--text-muted); display: block;">
                    ${isOwner ? 'Sebagai Owner, Anda berhak menyetujui atau menolak permohonan eksekusi keputusan dari tim.' : 'Permohonan keputusan yang diajukan ke Owner.'}
                  </span>
                </div>
              </div>
              <span class="badge badge-medium">${isOwner ? 'Aksi Diperlukan' : 'Status: Menunggu'}</span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${pendingApprovals.map(appr => `
                <div style="background: var(--bg-primary); padding: 12px 16px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                  <div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <strong style="font-size: 0.88rem; color: var(--text-primary);">${appr.title}</strong>
                      <span class="badge" style="font-size: 0.65rem; background: var(--bg-secondary);">${appr.category}</span>
                    </div>
                    <p style="font-size: 0.78rem; color: var(--text-secondary); margin: 4px 0 0 0;">
                      Diajukan oleh: <strong>${appr.requested_by}</strong> • Opsi: <strong style="color: var(--ai-primary);">${appr.option_title}</strong> • Nominal: <strong>${formatCurrency(appr.amount)}</strong>
                    </p>
                    <span style="font-size: 0.72rem; color: var(--success); font-weight: 600;">Proyeksi: ${appr.financial_impact}</span>
                  </div>

                  ${isOwner ? `
                    <div style="display: flex; gap: 8px;">
                      <button class="btn btn-secondary btn-sm btn-reject-approval aibo-icon-btn" data-id="${appr.id}" style="padding: 6px 12px; font-size: 0.75rem; color: var(--danger); border-color: var(--danger);">
                        ${getIcon('reject', { size: 14 })} <span>Tolak</span>
                      </button>
                      <button class="btn btn-primary btn-sm btn-approve-approval aibo-icon-btn" data-id="${appr.id}" style="padding: 6px 12px; font-size: 0.75rem; background: var(--success); border-color: var(--success);">
                        ${getIcon('approve', { size: 14 })} <span>Setujui</span>
                      </button>
                    </div>
                  ` : `
                    <span class="badge" style="background: var(--bg-secondary); color: var(--warning);">Menunggu Konfirmasi Owner</span>
                  `}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Filter Header Bar -->
        <div class="card" style="padding: 14px 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span style="font-size: 0.82rem; font-weight: 600; color: var(--text-secondary);">Kategori:</span>
              ${renderFilterChip('all', 'Semua Kategori', activeCategory === 'all', 'cat')}
              ${renderFilterChip('Marketing', 'Marketing', activeCategory === 'Marketing', 'cat')}
              ${renderFilterChip('Inventory', 'Stok & Produk', activeCategory === 'Inventory', 'cat')}
              ${renderFilterChip('Revenue', 'Omset & Sales', activeCategory === 'Revenue', 'cat')}
              ${renderFilterChip('Customer', 'Pelanggan', activeCategory === 'Customer', 'cat')}
            </div>

            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 0.82rem; font-weight: 600; color: var(--text-secondary);">Prioritas:</span>
              ${renderFilterChip('all', 'Semua', activePriority === 'all', 'prio')}
              ${renderFilterChip('high', 'Tinggi', activePriority === 'high', 'prio')}
              ${renderFilterChip('medium', 'Sedang', activePriority === 'medium', 'prio')}
            </div>
          </div>
        </div>

        <!-- Main 2-Column Grid -->
        <div class="dashboard-hero-grid" style="gap: 20px;">
          
          <!-- Left Column: Decision Optimization Panel with Multi-Choice Options -->
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <div class="card">
              <div class="card-title">
                <span style="display: flex; align-items: center; gap: 8px;">
                  <span style="color: var(--primary); display: flex; align-items: center;">${getIcon('decision', { size: 20 })}</span> <strong>Panel Optimalisasi Keputusan AIbo</strong>
                </span>
                <span class="badge" style="background-color: var(--ai-primary-glow); color: var(--ai-primary);">
                  ${filteredRecs.length} Rekomendasi Multi-Opsi
                </span>
              </div>

              <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 14px;">
                ${filteredRecs.length === 0 ? `
                  <div style="text-align: center; padding: 30px; color: var(--text-secondary);">
                    <p>Tidak ada rekomendasi yang sesuai dengan filter.</p>
                  </div>
                ` : filteredRecs.map(r => {
                  const isPending = r.status === 'pending';
                  const selectedOpt = state.selected_rec_options[r.id] || 'opt_balanced';
                  const optionsData = getRecommendationOptions(r.id);
                  const currentOptData = optionsData.find(o => o.id === selectedOpt) || optionsData[1];

                  return `
                    <div style="padding: 18px; border: 1px solid var(--border-color); background-color: var(--bg-input); border-radius: var(--radius-sm); opacity: ${isPending ? 1 : 0.85};">
                      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; gap: 10px;">
                        <div>
                          <h4 style="font-size: 1rem; color: ${isPending ? 'var(--text-primary)' : 'var(--text-muted)'}; font-family: var(--font-display); margin-bottom: 2px;">
                            ${r.title}
                          </h4>
                          <span style="font-size: 0.75rem; color: var(--text-muted);">Kategori: ${r.category || 'Operations'}</span>
                        </div>
                        <span class="badge ${isPending ? (r.priority === 'high' ? 'badge-high' : 'badge-medium') : 'badge-low'}">
                          ${isPending ? (r.priority ? r.priority.toUpperCase() : 'PENDING') : '✓ TERPASANG'}
                        </span>
                      </div>

                      <p style="font-size: 0.84rem; color: var(--text-secondary); margin-bottom: 10px; line-height: 1.5;">
                        ${r.description}
                      </p>

                      <!-- Multi-Choice Decision Options Selector -->
                      <div style="background: var(--bg-primary); padding: 12px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); margin-bottom: 12px;">
                        <span style="font-size: 0.78rem; font-weight: 700; color: var(--ai-primary); display: flex; align-items: center; gap: 6px; margin-bottom: 8px;">
                          ${getIcon('option', { size: 14 })} <span>Pilih Skenario Alokasi Keputusan:</span>
                        </span>
                        
                        <div class="scenario-options-grid" style="gap: 8px;">
                          ${optionsData.map(opt => {
                            const isChecked = opt.id === selectedOpt;
                            return `
                              <div class="rec-option-card ${isChecked ? 'active-rec-option' : ''}" data-rec-id="${r.id}" data-opt-id="${opt.id}" style="padding: 8px 10px; border-radius: 6px; border: 1px solid ${isChecked ? 'var(--ai-primary)' : 'var(--border-color)'}; background: ${isChecked ? 'var(--ai-primary-glow)' : 'var(--bg-secondary)'}; cursor: pointer; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.2s ease;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                  <strong style="font-size: 0.78rem; color: ${isChecked ? 'var(--ai-primary)' : 'var(--text-primary)'};">${opt.name}</strong>
                                  <input type="radio" name="opt_${r.id}" ${isChecked ? 'checked' : ''} style="cursor: pointer;">
                                </div>
                                <span style="font-size: 0.72rem; color: var(--text-muted);">${opt.amountText}</span>
                                <strong style="font-size: 0.72rem; color: var(--success); margin-top: 4px;">${opt.impactText}</strong>
                              </div>
                            `;
                          }).join('')}
                        </div>
                      </div>

                      <!-- Active Option Dynamic Trade-off Stats -->
                      <div style="background-color: var(--bg-primary); padding: 10px 14px; border-radius: 6px; font-size: 0.8rem; border-left: 3px solid var(--primary); margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                        <div>
                          <span style="color: var(--text-muted);">Proyeksi Dampak Finansial: </span>
                          <strong style="color: var(--success);">${currentOptData.fullImpact}</strong>
                        </div>
                        <div>
                          <span style="color: var(--text-muted);">Tingkat Risiko: </span>
                          <span class="badge ${currentOptData.riskBadge}">${currentOptData.risk}</span>
                        </div>
                      </div>

                      <!-- Actions & Workflow Buttons -->
                      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; border-top: 1px dashed var(--border-color); padding-top: 10px; flex-wrap: wrap; gap: 8px;">
                        <button class="btn btn-secondary btn-sm btn-detail-8step aibo-icon-btn" data-id="${r.id}" style="padding: 6px 12px; font-size: 0.75rem;">
                          ${getIcon('evidence', { size: 14 })} <span>Struktur 8-Langkah</span>
                        </button>

                        <div style="display: flex; gap: 8px;">
                          ${isPending ? (
                            isManager ? `
                              <button class="btn btn-secondary btn-sm btn-submit-approval aibo-icon-btn" data-id="${r.id}" style="padding: 6px 14px; font-size: 0.75rem; color: var(--ai-primary); border-color: var(--ai-primary);">
                                ${getIcon('export', { size: 14 })} <span>Ajukan Persetujuan ke Owner</span>
                              </button>
                            ` : `
                              <button class="btn btn-primary btn-sm btn-exec-with-confirm aibo-icon-btn" data-id="${r.id}" style="padding: 6px 14px; font-size: 0.75rem;">
                                ${getIcon('recommendation', { size: 14 })} <span>Eksekusi Skenario (${currentOptData.name})</span>
                              </button>
                            `
                          ) : `
                            <span style="color: var(--success); font-weight: bold; font-size: 0.8rem; display: flex; align-items: center; gap: 4px;">
                              ${getIcon('check', { size: 14 })} Telah Diterapkan (${currentOptData.name})
                            </span>
                          `}
                        </div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>

          <!-- Right Column: Contextual AI Copilot -->
          <div class="card" style="display: flex; flex-direction: column; height: calc(100vh - 180px); min-height: 540px; justify-content: space-between; padding: 18px; position: sticky; top: 20px;">
            <div class="card-title" style="margin-bottom: 8px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
              <span style="display: flex; align-items: center; gap: 8px;">
                <span style="color: var(--ai-primary); display: flex; align-items: center;">${getIcon('copilot', { size: 20 })}</span>
                <span>AI Business Copilot</span>
              </span>
              <span class="badge" style="background: var(--success-glow); color: var(--success); font-size: 0.65rem;">Sesi: ${userRole}</span>
            </div>

            <!-- Messages Box -->
            <div id="chat-messages-box" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding: 8px 4px; margin-bottom: 10px;">
              ${state.copilot_history.map(m => `
                <div style="max-width: 90%; align-self: ${m.sender === 'user' ? 'flex-end' : 'flex-start'}; background-color: ${m.sender === 'user' ? 'var(--primary-glow)' : 'var(--bg-input)'}; border: 1px solid ${m.sender === 'user' ? 'var(--primary)' : 'var(--border-color)'}; padding: 10px 14px; border-radius: var(--radius-sm); font-size: 0.84rem; line-height: 1.5;">
                  ${formatChatMessage(m.text)}
                </div>
              `).join('')}
              
              ${isThinking ? `
                <div style="align-self: flex-start; background: var(--bg-input); border: 1px solid var(--border-color); padding: 8px 12px; border-radius: var(--radius-sm); font-size: 0.8rem; color: var(--ai-primary); display: flex; align-items: center; gap: 8px;">
                  ${getIcon('loading', { size: 16 })} <em>AIbo sedang menganalisis simulasi skenario...</em>
                </div>
              ` : ''}
            </div>

            <!-- Quick Prompt Chips -->
            <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 6px; margin-bottom: 6px; scrollbar-width: none;">
              <button class="btn btn-secondary btn-prompt-chip aibo-icon-btn" data-prompt="Apa beda Opsi Agresif vs Seimbang?" style="padding: 4px 8px; font-size: 0.72rem; white-space: nowrap;">${getIcon('option', { size: 12 })} <span>Komparasi Opsi</span></button>
              <button class="btn btn-secondary btn-prompt-chip aibo-icon-btn" data-prompt="Mengapa ROI TikTok Ads turun?" style="padding: 4px 8px; font-size: 0.72rem; white-space: nowrap;">${getIcon('marketing', { size: 12 })} <span>TikTok ROI</span></button>
              <button class="btn btn-secondary btn-prompt-chip aibo-icon-btn" data-prompt="Produk apa yang stoknya kritis?" style="padding: 4px 8px; font-size: 0.72rem; white-space: nowrap;">${getIcon('inventory', { size: 12 })} <span>Stok Kritis</span></button>
            </div>

            <!-- Input Bar -->
            <div style="display: flex; gap: 8px;">
              <input type="text" id="chat-user-input" class="form-control" placeholder="Tanyakan saran skenario bisnis..." style="flex: 1; padding: 10px; font-size: 0.84rem;">
              <button class="btn btn-primary" id="btn-chat-send" style="padding: 10px 14px; font-weight: 700;">Kirim</button>
            </div>
          </div>

        </div>

        <!-- 8-Step Structure Modal -->
        ${activeModalRec ? render8StepModal(activeModalRec) : ''}
      </div>
    `;

    bindEvents();
    scrollChatBottom();
  }

  function getRecommendationOptions(recId) {
    if (recId === 'rec_001') {
      return [
        { id: 'opt_aggressive', name: 'Opsi A (Agresif)', amountText: 'Geser Rp 7.500.000', impactText: '+Rp 26M Omzet', fullImpact: '+Rp 26.000.000 (ROI 4.2x)', risk: 'Sedang (TikTok Drop)', riskBadge: 'badge-medium' },
        { id: 'opt_balanced', name: 'Opsi B (Seimbang)', amountText: 'Geser Rp 5.000.000', impactText: '+Rp 18M Omzet', fullImpact: '+Rp 18.000.000 (ROI 3.8x)', risk: 'Rendah (Optimal)', riskBadge: 'badge-low' },
        { id: 'opt_conservative', name: 'Opsi C (Konservatif)', amountText: 'Geser Rp 2.500.000', impactText: '+Rp 9M Omzet', fullImpact: '+Rp 9.000.000 (ROI 3.2x)', risk: 'Minimal', riskBadge: 'badge-low' }
      ];
    } else if (recId === 'rec_002') {
      return [
        { id: 'opt_aggressive', name: 'Opsi A (Stok 3 Bulan)', amountText: 'Reorder 50 Pack', impactText: 'Hemat 12% Biaya', fullImpact: 'Bebas Out-of-Stock s/d Nov', risk: 'Sedang (Modal Tertahan)', riskBadge: 'badge-medium' },
        { id: 'opt_balanced', name: 'Opsi B (Seimbang)', amountText: 'Reorder 20 Pack', impactText: 'Kesehatan 90%', fullImpact: 'Stok Aman 45 Hari', risk: 'Rendah (Ideal)', riskBadge: 'badge-low' },
        { id: 'opt_conservative', name: 'Opsi C (Stok Darurat)', amountText: 'Reorder 10 Pack', impactText: 'Kesehatan 84%', fullImpact: 'Stok Aman 15 Hari', risk: 'Tinggi (Cepat Habis)', riskBadge: 'badge-high' }
      ];
    }
    return [
      { id: 'opt_aggressive', name: 'Opsi A (Agresif)', amountText: 'Alokasi Penuh', impactText: '+Rp 15M Omzet', fullImpact: '+Rp 15.000.000 Omzet', risk: 'Sedang', riskBadge: 'badge-medium' },
      { id: 'opt_balanced', name: 'Opsi B (Seimbang)', amountText: 'Alokasi Bertahap', impactText: '+Rp 12M Omzet', fullImpact: '+Rp 12.000.000 Omzet', risk: 'Rendah', riskBadge: 'badge-low' },
      { id: 'opt_conservative', name: 'Opsi C (Konservatif)', amountText: 'Alokasi Parsial', impactText: '+Rp 6M Omzet', fullImpact: '+Rp 6.000.000 Omzet', risk: 'Minimal', riskBadge: 'badge-low' }
    ];
  }

  function renderFilterChip(id, label, isActive, group) {
    return `
      <button class="btn btn-sm ${isActive ? 'btn-primary' : 'btn-secondary'} btn-filter-chip" data-group="${group}" data-val="${id}" style="padding: 4px 10px; font-size: 0.78rem;">
        ${label}
      </button>
    `;
  }

  function formatChatMessage(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n- (.*?)/g, '<br/>• $1')
      .replace(/\n/g, '<br/>');
  }

  function render8StepModal(rec) {
    const relatedInsight = insights.find(i => i.id === rec.insight_id);
    const isPending = rec.status === 'pending';
    const selectedOpt = state.selected_rec_options[rec.id] || 'opt_balanced';
    const optionsData = getRecommendationOptions(rec.id);
    const currentOptData = optionsData.find(o => o.id === selectedOpt) || optionsData[1];

    return `
      <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px;">
        <div class="card animate-fade-in" style="max-width: 640px; width: 100%; max-height: 90vh; overflow-y: auto; border: 1px solid var(--border-color-hover); box-shadow: var(--shadow-lg); padding: 24px;">
          
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 16px;">
            <h3 style="font-size: 1.15rem; font-family: var(--font-display); font-weight: 700; color: var(--primary); display: flex; align-items: center; gap: 8px;">
              ${getIcon('decision', { size: 20 })} <span>Struktur Keputusan AIbo (8 Langkah Explainability)</span>
            </h3>
            <button class="btn btn-secondary btn-sm" id="btn-close-8step-modal" style="padding: 4px 8px; display: flex; align-items: center;">${getIcon('close', { size: 18 })}</button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 14px; font-size: 0.85rem;">
            
            <!-- Step 1: Summary -->
            <div style="background: var(--bg-primary); padding: 12px; border-radius: 6px; border-left: 4px solid var(--primary);">
              <strong style="color: var(--text-primary); display: flex; align-items: center; gap: 6px;">${getIcon('chart-detail', { size: 15 })} 1. Ringkasan Eksekutif (Summary):</strong>
              <p style="color: var(--text-secondary); margin-top: 4px;">${rec.title} — ${rec.description}</p>
            </div>

            <!-- Step 2: Root Cause -->
            <div style="background: var(--bg-primary); padding: 12px; border-radius: 6px; border-left: 4px solid var(--danger);">
              <strong style="color: var(--text-primary); display: flex; align-items: center; gap: 6px;">${getIcon('cause', { size: 15 })} 2. Akar Masalah (Root Cause):</strong>
              <p style="color: var(--text-secondary); margin-top: 4px;">${rec.reason}</p>
            </div>

            <!-- Step 3: Evidence -->
            <div style="background: var(--bg-primary); padding: 12px; border-radius: 6px; border-left: 4px solid var(--warning);">
              <strong style="color: var(--text-primary); display: flex; align-items: center; gap: 6px;">${getIcon('evidence', { size: 15 })} 3. Bukti Data Pendukung (Evidence):</strong>
              <ul style="padding-left: 18px; margin-top: 4px; color: var(--text-secondary); display: flex; flex-direction: column; gap: 4px;">
                ${relatedInsight ? relatedInsight.evidence.map(e => `<li>${e}</li>`).join('') : '<li>Log transaksi penjualan Agustus 2026</li>'}
              </ul>
            </div>

            <!-- Step 4: Impact Projection -->
            <div style="background: var(--bg-primary); padding: 12px; border-radius: 6px; border-left: 4px solid var(--success);">
              <strong style="color: var(--text-primary); display: flex; align-items: center; gap: 6px;">${getIcon('impact', { size: 15 })} 4. Proyeksi Dampak Kuantitatif (${currentOptData.name}):</strong>
              <p style="color: var(--success); font-weight: 700; margin-top: 4px;">
                ${currentOptData.fullImpact}
              </p>
            </div>

            <!-- Step 5: Alternative Options -->
            <div style="background: var(--bg-primary); padding: 12px; border-radius: 6px; border-left: 4px solid var(--ai-primary);">
              <strong style="color: var(--text-primary); display: flex; align-items: center; gap: 6px;">${getIcon('option', { size: 15 })} 5. Opsi Alternatif Skenario Yang Dipilih:</strong>
              <p style="color: var(--text-secondary); margin-top: 4px;">
                Terpilih: <strong>${currentOptData.name}</strong> (${currentOptData.amountText}). Estimasi risiko: ${currentOptData.risk}.
              </p>
            </div>

            <!-- Step 6: Consequences of Inaction -->
            <div style="background: var(--bg-primary); padding: 12px; border-radius: 6px; border-left: 4px solid var(--danger);">
              <strong style="color: var(--text-primary); display: flex; align-items: center; gap: 6px;">${getIcon('consequence', { size: 15 })} 6. Konsekuensi Jika Dibiarkan:</strong>
              <p style="color: var(--text-secondary); margin-top: 4px;">Potensi kerugian efisiensi anggaran hingga Rp 5.000.000/bulan & penurunan skor marketing sebesar 6 poin.</p>
            </div>

            <!-- Step 7: AI Recommendation -->
            <div style="background: var(--primary-glow); padding: 12px; border-radius: 6px; border: 1px solid var(--primary);">
              <strong style="color: var(--primary); display: flex; align-items: center; gap: 6px;">${getIcon('recommendation', { size: 15 })} 7. Rekomendasi Terpilih AIbo:</strong>
              <p style="color: var(--text-primary); font-weight: 600; margin-top: 4px;">Terapkan strategi alokasi ${currentOptData.name} untuk efisiensi maksimal.</p>
            </div>

            <!-- Step 8: Action -->
            <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; border-top: 1px solid var(--border-color); padding-top: 14px;">
              <button class="btn btn-secondary" id="btn-close-8step-modal-2">Tutup</button>
              ${isPending ? (
                isManager ? `
                  <button class="btn btn-secondary btn-submit-approval aibo-icon-btn" data-id="${rec.id}">
                    ${getIcon('export', { size: 14 })} <span>Ajukan Persetujuan ke Owner</span>
                  </button>
                ` : `
                  <button class="btn btn-primary btn-exec-with-confirm aibo-icon-btn" data-id="${rec.id}">
                    ${getIcon('recommendation', { size: 14 })} <span>8. Eksekusi Skenario (${currentOptData.name})</span>
                  </button>
                `
              ) : `
                <span style="color: var(--success); font-weight: bold; align-self: center; display: flex; align-items: center; gap: 4px;">${getIcon('check', { size: 14 })} Keputusan Telah Diterapkan</span>
              `}
            </div>

          </div>
        </div>
      </div>
    `;
  }

  function bindEvents() {
    // Multi-Choice Option Clicks
    const optionCards = document.querySelectorAll('.rec-option-card');
    optionCards.forEach(card => {
      card.addEventListener('click', (e) => {
        const recId = card.dataset.recId;
        const optId = card.dataset.optId;
        state.selected_rec_options[recId] = optId;
        updateView();
      });
    });

    // Filter Chips
    const filterChips = document.querySelectorAll('.btn-filter-chip');
    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const group = chip.dataset.group;
        const val = chip.dataset.val;
        if (group === 'cat') activeCategory = val;
        if (group === 'prio') activePriority = val;
        updateView();
      });
    });

    // 8-Step Detail Buttons
    const detailButtons = document.querySelectorAll('.btn-detail-8step');
    detailButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        activeModalRec = recommendations.find(r => r.id === id);
        updateView();
      });
    });

    const closeBtn1 = document.getElementById('btn-close-8step-modal');
    const closeBtn2 = document.getElementById('btn-close-8step-modal-2');
    if (closeBtn1) closeBtn1.addEventListener('click', () => { activeModalRec = null; updateView(); });
    if (closeBtn2) closeBtn2.addEventListener('click', () => { activeModalRec = null; updateView(); });

    // Execute Decision Button (Owner)
    const execButtons = document.querySelectorAll('.btn-exec-with-confirm');
    execButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const rec = recommendations.find(r => r.id === id);
        const selectedOpt = state.selected_rec_options[id] || 'opt_balanced';
        const optionsData = getRecommendationOptions(id);
        const optObj = optionsData.find(o => o.id === selectedOpt) || optionsData[1];
        
        const confirmExec = confirm(`Eksekusi Keputusan:\n"${rec ? rec.title : id}"\nSkenario: ${optObj.name} (${optObj.amountText})\n\nTerapkan keputusan ini ke sistem?`);
        
        if (confirmExec) {
          applyRecommendation(id, selectedOpt);
          activeModalRec = null;

          showToast(`Keputusan berhasil dieksekusi dengan ${optObj.name}!`, "success");
          state.copilot_history.push({
            sender: 'ai',
            text: `⚡ **Keputusan Dieksekusi**: "${rec?.title || id}" dengan **${optObj.name}**. Proyeksi: ${optObj.fullImpact}. Tugas otomatis telah dibuat di Action Center.`
          });
          updateView();
        }
      });
    });

    // Submit Approval Button (Manager)
    const submitApprButtons = document.querySelectorAll('.btn-submit-approval');
    submitApprButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const rec = recommendations.find(r => r.id === id);
        const selectedOpt = state.selected_rec_options[id] || 'opt_balanced';
        const optionsData = getRecommendationOptions(id);
        const optObj = optionsData.find(o => o.id === selectedOpt) || optionsData[1];

        submitApprovalRequest({
          rec_id: id,
          title: rec?.title || 'Pengajuan Keputusan',
          category: rec?.category || 'Operations',
          option_id: selectedOpt,
          option_title: `${optObj.name} (${optObj.amountText})`,
          amount: selectedOpt === 'opt_aggressive' ? 7500000 : (selectedOpt === 'opt_conservative' ? 2500000 : 5000000),
          financial_impact: optObj.fullImpact,
          notes: `Diajukan oleh ${state.user.name} via Decision Center.`
        });

        activeModalRec = null;
        showToast("Permohonan persetujuan berhasil dikirim ke Owner!", "success");
        state.copilot_history.push({
          sender: 'ai',
          text: `📤 **Pengajuan Terkirim**: Permohonan "${rec?.title}" (${optObj.name}) telah dikirimkan ke Owner untuk disetujui.`
        });
        updateView();
      });
    });

    // Owner Approve / Reject handlers
    const approveBtns = document.querySelectorAll('.btn-approve-approval');
    approveBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const apprId = btn.dataset.id;
        respondApprovalRequest(apprId, 'approved');
        showToast("Pengajuan disetujui! Keputusan telah diterapkan.", "success");
        updateView();
      });
    });

    const rejectBtns = document.querySelectorAll('.btn-reject-approval');
    rejectBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const apprId = btn.dataset.id;
        const reason = prompt("Masukkan alasan penolakan untuk tim:", "Perlu peninjauan ulang alokasi anggaran.");
        if (reason !== null) {
          respondApprovalRequest(apprId, 'rejected', reason);
          showToast("Pengajuan ditolak dengan catatan.", "warning");
          updateView();
        }
      });
    });

    // Chat Chips & Input
    const promptChips = document.querySelectorAll('.btn-prompt-chip');
    promptChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const promptText = chip.dataset.prompt;
        sendChatMessage(promptText);
      });
    });

    const sendBtn = document.getElementById('btn-chat-send');
    const input = document.getElementById('chat-user-input');

    if (sendBtn && input) {
      const handleSend = () => {
        const text = input.value.trim();
        if (!text) return;
        sendChatMessage(text);
        input.value = '';
      };

      sendBtn.addEventListener('click', handleSend);
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
      });
    }
  }

  function sendChatMessage(text) {
    state.copilot_history.push({ sender: 'user', text: text });
    isThinking = true;
    updateView();

    setTimeout(() => {
      let aiText = "Saya telah menganalisis simulasi data bisnis Nusa Brew Coffee. Apakah Anda ingin membandingkan skenario alokasi anggaran atau melihat proyeksi dampak laba bersih?";

      const query = text.toLowerCase();
      if (query.includes('opsi') || query.includes('skenario') || query.includes('agresif') || query.includes('beda') || query.includes('seimbang')) {
        aiText = `Perbandingan 3 Skenario Optimalisasi AIbo:\n- **Opsi A (Agresif)**: Pindahkan Rp 7.5 Juta $\\rightarrow$ Proyeksi omzet tertinggi (+Rp 26 Juta), namun ada sedikit risiko penurunan brand awareness di TikTok.\n- **Opsi B (Seimbang - Rekomendasi AIbo)**: Pindahkan Rp 5.0 Juta $\\rightarrow$ Proyeksi omzet +Rp 18 Juta dengan risiko rendah dan ROI stabil 3.8x.\n- **Opsi C (Konservatif)**: Pindahkan Rp 2.5 Juta $\\rightarrow$ Proyeksi omzet +Rp 9 Juta, sangat aman untuk uji coba awal.`;
      } else if (query.includes('tiktok') || query.includes('marketing') || query.includes('roi')) {
        aiText = `ROI Marketing saat ini berada di **3.2x** (target **3.5x**). Iklan TikTok Ads kurang efisien pada **2.58x** ROI. Mengalihkan anggaran ke Email Marketing (ROI **6.0x**) diproyeksikan mengembalikan total ROI ke **3.45x** s/d **3.8x**.`;
      } else if (query.includes('inventory') || query.includes('stok') || query.includes('kritis') || query.includes('reorder')) {
        aiText = `2 SKU produk saat ini di bawah ambang reorder aman:\n- **House Blend 1kg**: sisa 8 unit (titik reorder: 15)\n- **Matcha Latte Powder**: sisa 7 unit (titik reorder: 12)\n\nMengeksekusi tugas reorder akan mengembalikan Skor Kesehatan Stok ke 90%.`;
      } else if (query.includes('revenue') || query.includes('omset') || query.includes('target')) {
        aiText = `Total omset bulanan saat ini adalah **${formatCurrency(state.kpis.revenue.current)}** (96.4% dari target Rp 500 Juta). Proyeksi AIbo menunjukkan kita akan mencapai **Rp 508.000.000** di akhir bulan.`;
      }

      isThinking = false;
      state.copilot_history.push({ sender: 'ai', text: aiText });
      updateView();
    }, 600);
  }

  function scrollChatBottom() {
    const chatBox = document.getElementById('chat-messages-box');
    if (chatBox) {
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }

  updateView();
}
