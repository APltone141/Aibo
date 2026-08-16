// decision.js
// Decision Center for AIbo MVP Phase 4
// Features: 8-Step Recommendation Detail Structure, Context-Aware AI Copilot with Typing Indicator, Confirmation Dialogs, Category & Priority Filters.

import { formatCurrency, formatPercent, formatNumber, showToast } from '../utils.js';
import { applyRecommendation } from '../state.js';

export function renderDecision(container, state, onNavigate) {
  const recommendations = state.recommendations || [];
  const insights = state.ai_insights || [];

  let activeCategory = 'all'; 
  let activePriority = 'all'; 
  let activeModalRec = null;  

  if (!state.copilot_history) {
    state.copilot_history = [
      {
        sender: 'ai',
        text: `Halo ${state.user?.name || 'Pemilik Usaha'}! Saya adalah **AI Business Copilot** Anda. Berdasarkan data Nusa Brew Coffee bulan Agustus, saya mendeteksi hambatan ROI marketing di TikTok Ads dan 2 produk dengan stok kritis. Tanyakan kondisi bisnis Anda di bawah atau klik tombol pertanyaan cepat!`
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

    container.innerHTML = `
      <div class="animate-fade-in decision-root" style="display: flex; flex-direction: column; gap: 20px;">
        
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
        <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 20px;">
          
          <!-- Left Column: Decision Optimization Panel -->
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <div class="card">
              <div class="card-title">
                <span style="display: flex; align-items: center; gap: 8px;">
                  <span>🧠</span> Panel Optimalisasi Keputusan AIbo
                </span>
                <span class="badge" style="background-color: var(--ai-primary-glow); color: var(--ai-primary);">
                  ${filteredRecs.length} Rekomendasi Siap Eksekusi
                </span>
              </div>

              <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 14px;">
                ${filteredRecs.length === 0 ? `
                  <div style="text-align: center; padding: 30px; color: var(--text-secondary);">
                    <p>Tidak ada rekomendasi yang sesuai dengan filter.</p>
                  </div>
                ` : filteredRecs.map(r => {
                  const isPending = r.status === 'pending';
                  const relatedInsight = insights.find(i => i.id === r.insight_id);

                  return `
                    <div style="padding: 18px; border: 1px solid var(--border-color); background-color: var(--bg-input); border-radius: var(--radius-sm); opacity: ${isPending ? 1 : 0.85};">
                      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; gap: 10px;">
                        <h4 style="font-size: 1rem; color: ${isPending ? 'var(--text-primary)' : 'var(--text-muted)'}; font-family: var(--font-display);">
                          ${r.title}
                        </h4>
                        <span class="badge ${isPending ? (r.priority === 'high' ? 'badge-high' : 'badge-medium') : 'badge-low'}">
                          ${isPending ? (r.priority ? r.priority.toUpperCase() : 'PENDING') : '✓ TERPASANG'}
                        </span>
                      </div>

                      <p style="font-size: 0.84rem; color: var(--text-secondary); margin-bottom: 10px; line-height: 1.5;">
                        ${r.description}
                      </p>

                      <!-- Brief Reason -->
                      <div style="background-color: var(--bg-primary); padding: 10px 14px; border-radius: 6px; font-size: 0.8rem; border: 1px solid var(--border-color); margin-bottom: 12px;">
                        <strong style="color: var(--ai-primary);">💡 Ringkasan Analisis AI:</strong> ${r.reason}
                      </div>

                      <!-- Actions -->
                      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; border-top: 1px dashed var(--border-color); padding-top: 10px;">
                        <div>
                          <span style="color: var(--text-muted);">Proyeksi Dampak: </span>
                          <strong style="color: var(--success);">
                            ${r.expected_impact ? `${r.expected_impact.metric} ${r.expected_impact.from ? `(${r.expected_impact.from} → ${r.expected_impact.to})` : ''}` : '+ Dampak Positif'}
                          </strong>
                        </div>

                        <div style="display: flex; gap: 8px;">
                          <button class="btn btn-secondary btn-sm btn-detail-8step" data-id="${r.id}" style="padding: 6px 12px; font-size: 0.75rem;">
                            🔍 Struktur 8-Langkah
                          </button>
                          ${isPending ? `
                            <button class="btn btn-primary btn-sm btn-exec-with-confirm" data-id="${r.id}" style="padding: 6px 12px; font-size: 0.75rem;">
                              ⚡ Eksekusi Keputusan
                            </button>
                          ` : `
                            <span style="color: var(--success); font-weight: bold; font-size: 0.8rem;">
                              ✓ Telah Di-eksekusi
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
          <div class="card" style="display: flex; flex-direction: column; height: calc(100vh - 180px); min-height: 520px; justify-content: space-between; padding: 18px; position: sticky; top: 20px;">
            <div class="card-title" style="margin-bottom: 8px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
              <span style="display: flex; align-items: center; gap: 8px;">
                <span style="color: var(--ai-primary); font-size: 1.2rem;">🤖</span>
                <span>AI Business Copilot</span>
              </span>
              <span class="badge" style="background: var(--success-glow); color: var(--success); font-size: 0.65rem;">Aktif & Kontekstual</span>
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
                  <span>⏳</span> <em>AIbo sedang menganalisis data bisnis Anda...</em>
                </div>
              ` : ''}
            </div>

            <!-- Quick Prompt Chips -->
            <div style="display: flex; gap: 6px; overflow-x: auto; padding-bottom: 6px; margin-bottom: 6px; scrollbar-width: none;">
              <button class="btn btn-secondary btn-prompt-chip" data-prompt="Mengapa ROI TikTok Ads turun?" style="padding: 4px 8px; font-size: 0.72rem; white-space: nowrap;">📉 TikTok ROI</button>
              <button class="btn btn-secondary btn-prompt-chip" data-prompt="Produk apa yang stoknya kritis?" style="padding: 4px 8px; font-size: 0.72rem; white-space: nowrap;">📦 Stok Kritis</button>
              <button class="btn btn-secondary btn-prompt-chip" data-prompt="Bagaimana cara mencapai target omset?" style="padding: 4px 8px; font-size: 0.72rem; white-space: nowrap;">💰 Target Omset</button>
            </div>

            <!-- Input Bar -->
            <div style="display: flex; gap: 8px;">
              <input type="text" id="chat-user-input" class="form-control" placeholder="Tanyakan seputar bisnis Anda..." style="flex: 1; padding: 10px; font-size: 0.84rem;">
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

    return `
      <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px;">
        <div class="card animate-fade-in" style="max-width: 640px; width: 100%; max-height: 90vh; overflow-y: auto; border: 1px solid var(--border-color-hover); box-shadow: var(--shadow-lg); padding: 24px;">
          
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; margin-bottom: 16px;">
            <h3 style="font-size: 1.15rem; font-family: var(--font-display); font-weight: 700; color: var(--primary);">
              🧠 Struktur Keputusan AIbo (8 Langkah Explainability)
            </h3>
            <button class="btn btn-secondary btn-sm" id="btn-close-8step-modal" style="padding: 4px 10px;">&times;</button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 14px; font-size: 0.85rem;">
            
            <!-- Step 1: Summary -->
            <div style="background: var(--bg-primary); padding: 12px; border-radius: 6px; border-left: 4px solid var(--primary);">
              <strong style="color: var(--text-primary);">1. Ringkasan Eksekutif (Summary):</strong>
              <p style="color: var(--text-secondary); margin-top: 4px;">${rec.title} — ${rec.description}</p>
            </div>

            <!-- Step 2: Root Cause -->
            <div style="background: var(--bg-primary); padding: 12px; border-radius: 6px; border-left: 4px solid var(--danger);">
              <strong style="color: var(--text-primary);">2. Akar Masalah (Root Cause):</strong>
              <p style="color: var(--text-secondary); margin-top: 4px;">${rec.reason}</p>
            </div>

            <!-- Step 3: Evidence -->
            <div style="background: var(--bg-primary); padding: 12px; border-radius: 6px; border-left: 4px solid var(--warning);">
              <strong style="color: var(--text-primary);">3. Bukti Data Pendukung (Evidence):</strong>
              <ul style="padding-left: 18px; margin-top: 4px; color: var(--text-secondary); display: flex; flex-direction: column; gap: 4px;">
                ${relatedInsight ? relatedInsight.evidence.map(e => `<li>${e}</li>`).join('') : '<li>Log transaksi penjualan Agustus 2026</li>'}
              </ul>
            </div>

            <!-- Step 4: Impact Projection -->
            <div style="background: var(--bg-primary); padding: 12px; border-radius: 6px; border-left: 4px solid var(--success);">
              <strong style="color: var(--text-primary);">4. Proyeksi Dampak Kuantitatif (Impact):</strong>
              <p style="color: var(--success); font-weight: 700; margin-top: 4px;">
                ${rec.expected_impact ? `${rec.expected_impact.metric}: ${rec.expected_impact.from} → ${rec.expected_impact.to}` : '+ Rp 8.500.000 perkiraan tambahan omset'}
              </p>
            </div>

            <!-- Step 5: Alternative Options -->
            <div style="background: var(--bg-primary); padding: 12px; border-radius: 6px; border-left: 4px solid var(--ai-primary);">
              <strong style="color: var(--text-primary);">5. Opsi Alternatif Yang Dipertimbangkan:</strong>
              <p style="color: var(--text-secondary); margin-top: 4px;">Opsional A: Menambah budget total marketing (Risiko: Cash flow tertekan). Opsi B: Mematikan seluruh iklan TikTok (Risiko: Kehilangan brand awareness).</p>
            </div>

            <!-- Step 6: Consequences of Inaction -->
            <div style="background: var(--bg-primary); padding: 12px; border-radius: 6px; border-left: 4px solid var(--danger);">
              <strong style="color: var(--text-primary);">6. Konsekuensi Jika Dibiarkan (Consequences of Inaction):</strong>
              <p style="color: var(--text-secondary); margin-top: 4px;">Kerugian efisiensi anggaran marketing hingga Rp 5.000.000/bulan & penurunan skor kesehatan bisnis sebesar 4 poin.</p>
            </div>

            <!-- Step 7: AI Recommendation -->
            <div style="background: var(--primary-glow); padding: 12px; border-radius: 6px; border: 1px solid var(--primary);">
              <strong style="color: var(--primary);">7. Rekomendasi Terbaik AIbo:</strong>
              <p style="color: var(--text-primary); font-weight: 600; margin-top: 4px;">Eksekusi pemindahan alokasi budget sebesar Rp 5.000.000 dari TikTok Ads ke Email Marketing terstruktur.</p>
            </div>

            <!-- Step 8: Action -->
            <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 8px; border-top: 1px solid var(--border-color); padding-top: 14px;">
              <button class="btn btn-secondary" id="btn-close-8step-modal-2">Tutup</button>
              ${isPending ? `
                <button class="btn btn-primary btn-exec-with-confirm" data-id="${rec.id}">
                  ⚡ 8. Eksekusi Keputusan Sekarang
                </button>
              ` : `
                <span style="color: var(--success); font-weight: bold; align-self: center;">✓ Keputusan Telah Diterapkan</span>
              `}
            </div>

          </div>
        </div>
      </div>
    `;
  }

  function bindEvents() {
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

    const execButtons = document.querySelectorAll('.btn-exec-with-confirm');
    execButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const rec = recommendations.find(r => r.id === id);
        
        const confirmExec = confirm(`Apakah Anda yakin ingin mengeksekusi keputusan ini?\n\n"${rec ? rec.title : id}"\n\nTindakan ini akan membuat tugas otomatis di tim dan memperbarui parameter bisnis.`);
        
        if (confirmExec) {
          applyRecommendation(id);
          activeModalRec = null;

          showToast("Keputusan berhasil dieksekusi!", "success");
          state.copilot_history.push({
            sender: 'ai',
            text: `⚡ **Keputusan Dieksekusi**: "${rec?.title || id}". Tugas otomatis telah ditambahkan ke Action Center dan target omset akan dikalkulasi ulang.`
          });
          updateView();
        }
      });
    });

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
      let aiText = "Saya telah menganalisis pertanyaan Anda terhadap metrik bisnis Nusa Brew Coffee. Apakah Anda ingin fokus pada realokasi anggaran marketing, reorder stok produk, atau proyeksi omset?";

      const query = text.toLowerCase();
      if (query.includes('tiktok') || query.includes('marketing') || query.includes('roi')) {
        aiText = `ROI Marketing saat ini berada di **3.2x** (target **3.5x**). Iklan TikTok Ads kurang efisien pada **2.58x** ROI. Mengalihkan anggaran Rp 5 Juta ke Email Marketing (ROI **6.0x**) diproyeksikan meningkatkan total ROI ke **3.45x** (+Rp 8.5 Juta omset).`;
      } else if (query.includes('inventory') || query.includes('stok') || query.includes('kritis') || query.includes('reorder')) {
        aiText = `2 SKU produk saat ini di bawah ambang reorder aman:\n- **House Blend 1kg**: sisa 8 unit (titik reorder: 15)\n- **Matcha Latte Powder**: sisa 7 unit (titik reorder: 12)\n\nMengeksekusi tugas reorder akan mengembalikan Skor Kesehatan Stok ke 90%.`;
      } else if (query.includes('revenue') || query.includes('omset') || query.includes('target')) {
        aiText = `Total omset bulanan saat ini adalah **${formatCurrency(state.kpis.revenue.current)}** (96.4% dari target Rp 500 Juta). Proyeksi AIbo menunjukkan kita akan mencapai **Rp 508.000.000** di akhir bulan.`;
      } else if (query.includes('health') || query.includes('kesehatan') || query.includes('skor')) {
        aiText = `Skor Kesehatan Bisnis saat ini **${state.business_health.score}/100** (Sehat). Rincian 6 Dimensi:\n- Omset: 86\n- Profitabilitas: 81\n- Pelanggan: 84\n- Marketing: 79\n- Stok: 80\n- Arus Kas: 85`;
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
