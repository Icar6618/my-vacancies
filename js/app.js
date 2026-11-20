let vacancies = [];
let activeCategory = 'all';
let activeStatus = 'all';
let searchQuery = '';

const STORAGE_KEY = 'my_vacancies_data';

// Initial Load
document.addEventListener('DOMContentLoaded', async () => {
  await loadVacancies();
  setupEventListeners();
  renderApp();
});

// Load vacancies from localStorage or fallback to JSON
async function loadVacancies() {
  const localData = localStorage.getItem(STORAGE_KEY);
  if (localData) {
    try {
      vacancies = JSON.parse(localData);
      return;
    } catch (e) {
      console.warn('Failed to parse localStorage data, loading defaults.');
    }
  }

  try {
    const res = await fetch('./data/vacancies.json');
    vacancies = await res.json();
    saveToStorage();
  } catch (err) {
    console.error('Error loading vacancies.json:', err);
    vacancies = [];
  }
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vacancies));
}

// Event Listeners
function setupEventListeners() {
  // Category tabs
  document.querySelectorAll('[data-category]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('[data-category]').forEach(b => {
        b.classList.remove('bg-purple-600', 'text-white');
        b.classList.add('bg-white/5', 'text-slate-300');
      });
      const target = e.currentTarget;
      target.classList.remove('bg-white/5', 'text-slate-300');
      target.classList.add('bg-purple-600', 'text-white');
      activeCategory = target.getAttribute('data-category');
      renderApp();
    });
  });

  // Status filter
  const statusSelect = document.getElementById('statusFilter');
  if (statusSelect) {
    statusSelect.addEventListener('change', (e) => {
      activeStatus = e.target.value;
      renderApp();
    });
  }

  // Search input
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderApp();
    });
  }

  // Modal close
  const modalCloseBtn = document.getElementById('closeModal');
  const modalOverlay = document.getElementById('detailsModal');
  if (modalCloseBtn && modalOverlay) {
    modalCloseBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }
}

// Render Main App
function renderApp() {
  updateStats();
  renderVacancyCards();
  if (window.lucide) {
    lucide.createIcons();
  }
}

// Update Dashboard Statistics
function updateStats() {
  const totalEl = document.getElementById('statTotal');
  const highMatchEl = document.getElementById('statHighMatch');
  const savedEl = document.getElementById('statSaved');
  const appliedEl = document.getElementById('statApplied');

  if (!totalEl) return;

  const total = vacancies.length;
  const highMatch = vacancies.filter(v => (v.matchScore || 0) >= 90).length;
  const saved = vacancies.filter(v => v.status === 'saved').length;
  const applied = vacancies.filter(v => v.status === 'applied').length;

  totalEl.textContent = total;
  highMatchEl.textContent = highMatch;
  savedEl.textContent = saved;
  appliedEl.textContent = applied;
}

// Filter and render cards
function renderVacancyCards() {
  const container = document.getElementById('vacanciesGrid');
  const emptyState = document.getElementById('emptyState');
  if (!container) return;

  const filtered = vacancies.filter(v => {
    // Category match
    const matchCategory = (activeCategory === 'all') || (v.category === activeCategory);
    // Status match
    const matchStatus = (activeStatus === 'all') || (v.status === activeStatus);
    // Search query match
    const matchSearch = !searchQuery || 
      v.title.toLowerCase().includes(searchQuery) ||
      v.company.toLowerCase().includes(searchQuery) ||
      (v.tags && v.tags.some(t => t.toLowerCase().includes(searchQuery))) ||
      (v.description && v.description.toLowerCase().includes(searchQuery));

    return matchCategory && matchStatus && matchSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  container.innerHTML = filtered.map(vac => {
    const statusLabels = {
      new: { label: 'Нова', class: 'badge-new' },
      saved: { label: 'Збережено', class: 'badge-saved' },
      applied: { label: 'Відгукнувся', class: 'badge-applied' }
    };
    const currentStatus = statusLabels[vac.status] || statusLabels.new;

    return `
      <div class="glass-card rounded-2xl p-6 flex flex-col justify-between border border-white/10 relative overflow-hidden group">
        <!-- Top header -->
        <div>
          <div class="flex items-start justify-between gap-3 mb-3">
            <div>
              <span class="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${currentStatus.class} mb-2">
                ${currentStatus.label}
              </span>
              <h3 class="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">
                ${escapeHtml(vac.title)}
              </h3>
              <p class="text-sm text-slate-400 font-medium">${escapeHtml(vac.company)} • <span class="text-slate-500">${escapeHtml(vac.location)}</span></p>
            </div>
            
            <div class="score-badge px-3 py-1.5 rounded-xl text-center shrink-0">
              <div class="text-xs text-purple-300 font-semibold">Метч</div>
              <div class="text-lg font-black text-white font-display">${vac.matchScore || 85}%</div>
            </div>
          </div>

          <!-- Salary & Type -->
          <div class="flex flex-wrap items-center gap-3 py-2 mb-3 text-sm text-slate-300 border-y border-white/5">
            <span class="font-bold text-emerald-400 font-display">${escapeHtml(vac.salary || 'За домовленістю')}</span>
            <span class="text-slate-600">•</span>
            <span class="text-slate-400 text-xs">${escapeHtml(vac.type)}</span>
          </div>

          <!-- Description preview -->
          <p class="text-sm text-slate-300/90 line-clamp-2 mb-4 leading-relaxed">
            ${escapeHtml(vac.description)}
          </p>

          <!-- Skills tags -->
          <div class="flex flex-wrap gap-1.5 mb-5">
            ${(vac.tags || []).map(tag => `
              <span class="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/5">
                ${escapeHtml(tag)}
              </span>
            `).join('')}
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-between gap-2 pt-3 border-t border-white/10 mt-2">
          <button onclick="openModal('${vac.id}')" class="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors">
            Деталі вакансії
            <i data-lucide="chevron-right" class="w-4 h-4"></i>
          </button>

          <div class="flex items-center gap-1.5">
            <button onclick="toggleSave('${vac.id}')" title="${vac.status === 'saved' ? 'Прибрати зі збережених' : 'Зберегти'}" class="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors">
              <i data-lucide="${vac.status === 'saved' ? 'bookmark-check' : 'bookmark'}" class="w-4 h-4 ${vac.status === 'saved' ? 'text-yellow-400' : ''}"></i>
            </button>
            <button onclick="toggleApply('${vac.id}')" title="${vac.status === 'applied' ? 'Скасувати статус відгуку' : 'Позначити як відгукнувся'}" class="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 transition-colors">
              <i data-lucide="${vac.status === 'applied' ? 'check-circle-2' : 'send'}" class="w-4 h-4 ${vac.status === 'applied' ? 'text-green-400' : ''}"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Modal handling
window.openModal = function(id) {
  const vac = vacancies.find(v => v.id === id);
  if (!vac) return;

  const modal = document.getElementById('detailsModal');
  const modalBody = document.getElementById('modalContent');
  if (!modal || !modalBody) return;

  modalBody.innerHTML = `
    <div class="flex items-start justify-between gap-4 mb-4">
      <div>
        <h2 class="text-2xl font-bold text-white mb-1 font-display">${escapeHtml(vac.title)}</h2>
        <p class="text-slate-400">${escapeHtml(vac.company)} • ${escapeHtml(vac.location)}</p>
      </div>
      <div class="score-badge px-4 py-2 rounded-xl text-center shrink-0">
        <div class="text-xs text-purple-300 font-semibold">Сумісність</div>
        <div class="text-2xl font-black text-white font-display">${vac.matchScore || 85}%</div>
      </div>
    </div>

    <div class="flex flex-wrap gap-4 p-4 rounded-xl bg-white/5 border border-white/10 mb-6 text-sm">
      <div>
        <span class="text-slate-500 block text-xs">Винагорода</span>
        <span class="font-bold text-emerald-400 font-display text-base">${escapeHtml(vac.salary || 'Не вказано')}</span>
      </div>
      <div>
        <span class="text-slate-500 block text-xs">Формат</span>
        <span class="text-slate-200 font-medium">${escapeHtml(vac.type)}</span>
      </div>
      <div>
        <span class="text-slate-500 block text-xs">Опубліковано</span>
        <span class="text-slate-200 font-medium">${escapeHtml(vac.postedDate || 'Нещодавно')}</span>
      </div>
    </div>

    <div class="mb-6">
      <h4 class="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Опис вакансії</h4>
      <p class="text-slate-300 leading-relaxed text-sm">${escapeHtml(vac.description)}</p>
    </div>

    <div class="mb-6">
      <h4 class="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Основні вимоги & навички</h4>
      <ul class="space-y-2">
        ${(vac.requirements || []).map(r => `
          <li class="flex items-start gap-2.5 text-sm text-slate-300">
            <i data-lucide="check" class="w-4 h-4 text-purple-400 shrink-0 mt-0.5"></i>
            <span>${escapeHtml(r)}</span>
          </li>
        `).join('')}
      </ul>
    </div>

    <div class="mb-6">
      <h4 class="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Теги навичок</h4>
      <div class="flex flex-wrap gap-2">
        ${(vac.tags || []).map(t => `
          <span class="text-xs px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20 font-medium">
            ${escapeHtml(t)}
          </span>
        `).join('')}
      </div>
    </div>

    <div class="flex items-center justify-between gap-3 pt-4 border-t border-white/10">
      <div class="flex gap-2">
        <button onclick="toggleSave('${vac.id}'); openModal('${vac.id}');" class="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-2 border border-white/10 transition-colors">
          <i data-lucide="${vac.status === 'saved' ? 'bookmark-check' : 'bookmark'}" class="w-4 h-4 ${vac.status === 'saved' ? 'text-yellow-400' : ''}"></i>
          ${vac.status === 'saved' ? 'Збережено' : 'В збережені'}
        </button>
        <button onclick="toggleApply('${vac.id}'); openModal('${vac.id}');" class="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center gap-2 border border-white/10 transition-colors">
          <i data-lucide="${vac.status === 'applied' ? 'check-circle-2' : 'send'}" class="w-4 h-4 ${vac.status === 'applied' ? 'text-green-400' : ''}"></i>
          ${vac.status === 'applied' ? 'Відгукнувся' : 'Позначити відгук'}
        </button>
      </div>

      <a href="${vac.link || '#'}" target="_blank" rel="noopener noreferrer" class="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-purple-600/30">
        <span>Перейти до вакансії</span>
        <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
      </a>
    </div>
  `;

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  if (window.lucide) lucide.createIcons();
};

window.closeModal = function() {
  const modal = document.getElementById('detailsModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
};

// Toggle Save
window.toggleSave = function(id) {
  const vac = vacancies.find(v => v.id === id);
  if (!vac) return;
  vac.status = (vac.status === 'saved') ? 'new' : 'saved';
  saveToStorage();
  renderApp();
};

// Toggle Apply
window.toggleApply = function(id) {
  const vac = vacancies.find(v => v.id === id);
  if (!vac) return;
  vac.status = (vac.status === 'applied') ? 'new' : 'applied';
  saveToStorage();
  renderApp();
};

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
