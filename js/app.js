let vacancies = [];
let activeRole = 'all';
let activeStatus = 'all';
let searchQuery = '';

const STORAGE_KEY = 'my_vacancies_data_v2';

document.addEventListener('DOMContentLoaded', async () => {
  await initVacanciesData();
  setupUIEventListeners();
  renderTracker();
});

// Load vacancies
async function initVacanciesData() {
  const local = localStorage.getItem(STORAGE_KEY);
  if (local) {
    try {
      vacancies = JSON.parse(local);
      return;
    } catch (e) {
      console.warn('Storage parsing error, loading defaults');
    }
  }

  try {
    const res = await fetch('./data/vacancies.json');
    vacancies = await res.json();
    saveData();
  } catch (err) {
    console.error('Error fetching data/vacancies.json:', err);
    vacancies = [];
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vacancies));
}

// Event Listeners
function setupUIEventListeners() {
  // Role category filter tabs
  document.querySelectorAll('[data-role-filter]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('[data-role-filter]').forEach(b => {
        b.classList.remove('bg-purple-600', 'text-white', 'shadow-lg', 'shadow-purple-600/30');
        b.classList.add('bg-white/5', 'text-slate-300');
      });
      const el = e.currentTarget;
      el.classList.remove('bg-white/5', 'text-slate-300');
      el.classList.add('bg-purple-600', 'text-white', 'shadow-lg', 'shadow-purple-600/30');
      activeRole = el.getAttribute('data-role-filter');
      renderTracker();
    });
  });

  // Status pills
  document.querySelectorAll('[data-status-filter]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('[data-status-filter]').forEach(b => {
        b.classList.remove('border-purple-500', 'text-purple-300', 'bg-purple-500/15');
        b.classList.add('border-white/10', 'text-slate-400', 'bg-white/5');
      });
      const el = e.currentTarget;
      el.classList.remove('border-white/10', 'text-slate-400', 'bg-white/5');
      el.classList.add('border-purple-500', 'text-purple-300', 'bg-purple-500/15');
      activeStatus = el.getAttribute('data-status-filter');
      renderTracker();
    });
  });

  // Search input
  const searchInput = document.getElementById('searchVacanciesInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderTracker();
    });
  }

  // Quick Add Modal Form
  const addModal = document.getElementById('addVacancyModal');
  const openAddBtn = document.getElementById('openAddModalBtn');
  const closeAddBtn = document.getElementById('closeAddModalBtn');
  const addForm = document.getElementById('addVacancyForm');

  if (openAddBtn && addModal) {
    openAddBtn.addEventListener('click', () => {
      addModal.classList.remove('hidden');
      addModal.classList.add('flex');
    });
  }
  if (closeAddBtn && addModal) {
    closeAddBtn.addEventListener('click', () => {
      addModal.classList.add('hidden');
      addModal.classList.remove('flex');
    });
  }

  if (addForm) {
    addForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('newTitle').value.trim();
      const company = document.getElementById('newCompany').value.trim();
      const roleCategory = document.getElementById('newRole').value;
      const link = document.getElementById('newLink').value.trim() || '#';
      const salary = document.getElementById('newSalary').value.trim() || 'За домовленістю';
      const tagsInput = document.getElementById('newTags').value.trim();
      const description = document.getElementById('newDescription').value.trim();

      const roleNames = {
        'ai-creative': 'AI Creative Producer',
        'product-design': 'Product Designer (UI/UX)',
        'creative-lead': 'Creative Lead / Art Director',
        'video-motion': 'Video & Motion Designer',
        'ai-bots': 'AI Bot & Automation Specialist',
        'brand-merch': 'Brand & Merch Art Director'
      };

      const newVac = {
        id: 'vac-' + Date.now(),
        roleCategory: roleCategory,
        roleName: roleNames[roleCategory] || 'Інше',
        title: title,
        company: company,
        location: 'Remote',
        salary: salary,
        type: 'Remote',
        postedDate: 'Щойно',
        link: link,
        matchScore: 92,
        status: 'not_applied',
        appliedAt: null,
        tags: tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : ['Remote'],
        description: description || 'Опис вакансії додано користувачем.'
      };

      vacancies.unshift(newVac);
      saveData();
      addForm.reset();
      addModal.classList.add('hidden');
      addModal.classList.remove('flex');
      renderTracker();
    });
  }
}

// Render main tracker
function renderTracker() {
  updateDashboardCounters();
  renderCardsGrid();
  if (window.lucide) {
    lucide.createIcons();
  }
}

// Update counters
function updateDashboardCounters() {
  const totalEl = document.getElementById('countTotal');
  const notAppliedEl = document.getElementById('countNotApplied');
  const appliedEl = document.getElementById('countApplied');
  const savedEl = document.getElementById('countSaved');

  if (!totalEl) return;

  const total = vacancies.length;
  const applied = vacancies.filter(v => v.status === 'applied').length;
  const saved = vacancies.filter(v => v.isSaved).length;
  const notApplied = total - applied;

  totalEl.textContent = total;
  notAppliedEl.textContent = notApplied;
  appliedEl.textContent = applied;
  savedEl.textContent = saved;
}

// Filter and render list
function renderCardsGrid() {
  const container = document.getElementById('vacanciesContainer');
  const emptyState = document.getElementById('vacanciesEmpty');
  if (!container) return;

  const filtered = vacancies.filter(v => {
    // Role filter
    const matchRole = (activeRole === 'all') || (v.roleCategory === activeRole);

    // Status filter
    let matchStatus = true;
    if (activeStatus === 'applied') matchStatus = (v.status === 'applied');
    else if (activeStatus === 'not_applied') matchStatus = (v.status !== 'applied');
    else if (activeStatus === 'saved') matchStatus = !!v.isSaved;

    // Search query
    const matchSearch = !searchQuery ||
      v.title.toLowerCase().includes(searchQuery) ||
      v.company.toLowerCase().includes(searchQuery) ||
      (v.tags && v.tags.some(t => t.toLowerCase().includes(searchQuery))) ||
      (v.roleName && v.roleName.toLowerCase().includes(searchQuery));

    return matchRole && matchStatus && matchSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  container.innerHTML = filtered.map(vac => {
    const isApplied = (vac.status === 'applied');
    const isSaved = !!vac.isSaved;

    return `
      <div class="glass-card rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between ${
        isApplied 
          ? 'border-emerald-500/40 bg-emerald-950/10 shadow-lg shadow-emerald-500/5' 
          : 'border-white/10 hover:border-purple-500/30'
      }">
        <div>
          <!-- Header Bar: Role Pill + Match + Bookmark -->
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex flex-wrap items-center gap-2">
              <span class="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-slate-300">
                ${escapeHtml(vac.roleName || 'Позиція')}
              </span>
              ${
                isApplied 
                  ? `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                      <i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Заявку відправлено
                    </span>`
                  : `<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-800 text-slate-400 border border-white/5">
                      <i data-lucide="clock" class="w-3.5 h-3.5"></i> Очікує подачі
                    </span>`
              }
            </div>

            <div class="flex items-center gap-2">
              <div class="score-badge px-2.5 py-1 rounded-xl text-center">
                <span class="text-xs font-bold text-white font-display">${vac.matchScore || 90}%</span>
                <span class="text-[9px] text-purple-300 block leading-none">Метч</span>
              </div>
              <button onclick="toggleBookmark('${vac.id}')" title="${isSaved ? 'Прибрати з обраного' : 'Додати в обране'}" class="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-amber-300 transition-colors">
                <i data-lucide="star" class="w-4 h-4 ${isSaved ? 'text-amber-400 fill-amber-400' : ''}"></i>
              </button>
            </div>
          </div>

          <!-- Title & Company -->
          <h4 class="text-lg sm:text-xl font-bold text-white mb-1 hover:text-purple-300 transition-colors font-display">
            ${escapeHtml(vac.title)}
          </h4>
          <p class="text-xs sm:text-sm text-slate-400 mb-3 flex items-center gap-2">
            <span class="font-medium text-slate-300">${escapeHtml(vac.company)}</span>
            <span>•</span>
            <span class="text-slate-400">${escapeHtml(vac.location)}</span>
            <span>•</span>
            <span class="text-slate-500 text-xs">${escapeHtml(vac.postedDate || 'Нещодавно')}</span>
          </p>

          <!-- Salary & Description -->
          <div class="mb-3 py-2 px-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
            <span class="text-xs text-slate-400">Вилка винагороди:</span>
            <span class="text-sm font-bold text-emerald-400 font-display">${escapeHtml(vac.salary)}</span>
          </div>

          <p class="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">
            ${escapeHtml(vac.description)}
          </p>

          <!-- Skill Tags -->
          <div class="flex flex-wrap gap-1.5 mb-5">
            ${(vac.tags || []).map(tag => `
              <span class="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/5">
                ${escapeHtml(tag)}
              </span>
            `).join('')}
          </div>
        </div>

        <!-- ACTIONS ROW: Direct Link + Application Status Button -->
        <div class="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          <!-- Open Vacancy External Link -->
          <a href="${escapeHtml(vac.link)}" target="_blank" rel="noopener noreferrer" class="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors group/link">
            <span>Відкрити вакансію</span>
            <i data-lucide="external-link" class="w-3.5 h-3.5 text-slate-400 group-hover/link:text-white transition-colors"></i>
          </a>

          <!-- Send Application Status Toggle Button -->
          <button onclick="toggleApplicationStatus('${vac.id}')" class="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            isApplied
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-600/20'
          }">
            <i data-lucide="${isApplied ? 'check' : 'send'}" class="w-3.5 h-3.5"></i>
            <span>${isApplied ? (vac.appliedAt ? `Заявку подано (${vac.appliedAt})` : 'Заявку подано ✓') : 'Позначити: Заявку відправив'}</span>
          </button>

        </div>
      </div>
    `;
  }).join('');
}

// Toggle application status
window.toggleApplicationStatus = function(id) {
  const vac = vacancies.find(v => v.id === id);
  if (!vac) return;

  if (vac.status === 'applied') {
    vac.status = 'not_applied';
    vac.appliedAt = null;
  } else {
    vac.status = 'applied';
    const d = new Date();
    const day = d.getDate();
    const months = ['січ', 'лют', 'бер', 'кві', 'тра', 'чер', 'лип', 'сер', 'вер', 'жов', 'лис', 'груд'];
    vac.appliedAt = `${day} ${months[d.getMonth()]}`;
  }

  saveData();
  renderTracker();
};

// Toggle bookmark
window.toggleBookmark = function(id) {
  const vac = vacancies.find(v => v.id === id);
  if (!vac) return;
  vac.isSaved = !vac.isSaved;
  saveData();
  renderTracker();
};

// Reset to defaults
window.resetVacanciesDefaults = async function() {
  if (confirm('Скинути всі вакансії до початкового стану?')) {
    localStorage.removeItem(STORAGE_KEY);
    await initVacanciesData();
    renderTracker();
  }
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
