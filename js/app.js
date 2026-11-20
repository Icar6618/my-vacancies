let vacancies = [];

// Filter States
let filterState = {
  searchQuery: '',
  role: 'all',
  workplace: 'all',
  status: 'all',
  minSalary: 'all',
  minMatch: 'all',
  source: 'all',
  sortBy: 'match_desc'
};

const STORAGE_KEY = 'my_vacancies_data_v6';

document.addEventListener('DOMContentLoaded', async () => {
  await initVacanciesData();
  setupEventListeners();
  renderApp();
});

// Load vacancies data
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
  
  // Auto-save directly to disk if running on local server!
  try {
    fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vacancies)
    }).then(res => {
      if (res.ok) console.log('✅ Автоматично збережено у файл data/vacancies.json!');
    }).catch(() => {});
  } catch (e) {}
}

// Download data file directly
window.downloadVacanciesJson = function() {
  const jsonStr = JSON.stringify(vacancies, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'vacancies.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Copy JSON to clipboard
window.copyVacanciesJson = function() {
  const jsonStr = JSON.stringify(vacancies, null, 2);
  navigator.clipboard.writeText(jsonStr).then(() => {
    alert('Дані вакансій скопійовано в буфер обміну! Можна надіслати їх у чат.');
  });
};

// Setup Event Listeners
function setupEventListeners() {
  // Search input
  const searchInput = document.getElementById('searchVacanciesInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filterState.searchQuery = e.target.value.toLowerCase().trim();
      renderApp();
    });
  }

  // Clear search button
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  if (clearSearchBtn && searchInput) {
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      filterState.searchQuery = '';
      renderApp();
    });
  }

  // Role Category Pills
  document.querySelectorAll('[data-role-filter]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('[data-role-filter]').forEach(b => {
        b.classList.remove('filter-pill-active');
        b.classList.add('bg-white/5', 'text-slate-400');
      });
      const el = e.currentTarget;
      el.classList.remove('bg-white/5', 'text-slate-400');
      el.classList.add('filter-pill-active');
      filterState.role = el.getAttribute('data-role-filter');
      renderApp();
    });
  });

  // Workplace Format Pills
  document.querySelectorAll('[data-workplace-filter]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('[data-workplace-filter]').forEach(b => {
        b.classList.remove('filter-pill-active');
        b.classList.add('bg-white/5', 'text-slate-400');
      });
      const el = e.currentTarget;
      el.classList.remove('bg-white/5', 'text-slate-400');
      el.classList.add('filter-pill-active');
      filterState.workplace = el.getAttribute('data-workplace-filter');
      renderApp();
    });
  });

  // Status Filter Pills
  document.querySelectorAll('[data-status-filter]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('[data-status-filter]').forEach(b => {
        b.classList.remove('filter-pill-active');
        b.classList.add('bg-white/5', 'text-slate-400');
      });
      const el = e.currentTarget;
      el.classList.remove('bg-white/5', 'text-slate-400');
      el.classList.add('filter-pill-active');
      filterState.status = el.getAttribute('data-status-filter');
      renderApp();
    });
  });

  // Dropdown Filters: Min Match, Min Salary, Source, SortBy
  const minMatchSelect = document.getElementById('filterMinMatch');
  if (minMatchSelect) {
    minMatchSelect.addEventListener('change', (e) => {
      filterState.minMatch = e.target.value;
      renderApp();
    });
  }

  const minSalarySelect = document.getElementById('filterMinSalary');
  if (minSalarySelect) {
    minSalarySelect.addEventListener('change', (e) => {
      filterState.minSalary = e.target.value;
      renderApp();
    });
  }

  const sourceSelect = document.getElementById('filterSource');
  if (sourceSelect) {
    sourceSelect.addEventListener('change', (e) => {
      filterState.source = e.target.value;
      renderApp();
    });
  }

  const sortBySelect = document.getElementById('filterSortBy');
  if (sortBySelect) {
    sortBySelect.addEventListener('change', (e) => {
      filterState.sortBy = e.target.value;
      renderApp();
    });
  }

  // Reset all filters button
  const resetBtn = document.getElementById('resetAllFiltersBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', resetAllFilters);
  }

  // Toggle Profile Section Accordion
  const toggleProfileBtn = document.getElementById('toggleProfileAccordionBtn');
  const profileContent = document.getElementById('profileAccordionContent');
  const profileChevron = document.getElementById('profileChevronIcon');
  if (toggleProfileBtn && profileContent) {
    toggleProfileBtn.addEventListener('click', () => {
      const isHidden = profileContent.classList.contains('hidden');
      if (isHidden) {
        profileContent.classList.remove('hidden');
        if (profileChevron) profileChevron.style.transform = 'rotate(180deg)';
      } else {
        profileContent.classList.add('hidden');
        if (profileChevron) profileChevron.style.transform = 'rotate(0deg)';
      }
    });
  }

  // Add Vacancy Modal Setup
  setupAddVacancyModal();
}

// Reset filters
function resetAllFilters() {
  filterState = {
    searchQuery: '',
    role: 'all',
    workplace: 'all',
    status: 'all',
    minSalary: 'all',
    minMatch: 'all',
    source: 'all',
    sortBy: 'match_desc'
  };

  const searchInput = document.getElementById('searchVacanciesInput');
  if (searchInput) searchInput.value = '';

  const minMatch = document.getElementById('filterMinMatch');
  if (minMatch) minMatch.value = 'all';

  const minSalary = document.getElementById('filterMinSalary');
  if (minSalary) minSalary.value = 'all';

  const source = document.getElementById('filterSource');
  if (source) source.value = 'all';

  const sortBy = document.getElementById('filterSortBy');
  if (sortBy) sortBy.value = 'match_desc';

  document.querySelectorAll('[data-role-filter]').forEach(b => {
    b.classList.remove('filter-pill-active');
    if (b.getAttribute('data-role-filter') === 'all') b.classList.add('filter-pill-active');
  });

  document.querySelectorAll('[data-workplace-filter]').forEach(b => {
    b.classList.remove('filter-pill-active');
    if (b.getAttribute('data-workplace-filter') === 'all') b.classList.add('filter-pill-active');
  });

  document.querySelectorAll('[data-status-filter]').forEach(b => {
    b.classList.remove('filter-pill-active');
    if (b.getAttribute('data-status-filter') === 'all') b.classList.add('filter-pill-active');
  });

  renderApp();
}

// Modal handling
function setupAddVacancyModal() {
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
      const workplaceType = document.getElementById('newWorkplace').value;
      const link = document.getElementById('newLink').value.trim() || '#';
      const salary = document.getElementById('newSalary').value.trim() || 'За домовленістю';
      const tagsInput = document.getElementById('newTags').value.trim();
      const description = document.getElementById('newDescription').value.trim();

      const roleNames = {
        'ai-creative': 'AI Creative Producer',
        'product-design': 'Product Designer (UI/UX)',
        'creative-lead': 'Creative Lead / Art Director',
        'video-motion': 'Video & Motion Designer',
        'ai-bots': 'AI Bot & Automation',
        'brand-merch': 'Brand & Merch Art Director'
      };

      const workplaceLabels = {
        'remote': 'Дистанційно (Remote)',
        'office': 'Робота в офісі',
        'hybrid': 'Гібридний формат'
      };

      const newVac = {
        id: 'vac-' + Date.now(),
        roleCategory: roleCategory,
        roleName: roleNames[roleCategory] || 'Інше',
        workplaceType: workplaceType,
        workplaceLabel: workplaceLabels[workplaceType] || 'Дистанційно',
        title: title,
        company: company,
        location: workplaceType === 'remote' ? 'Remote' : 'Офіс / Гібрид',
        salary: salary,
        type: workplaceLabels[workplaceType],
        postedDate: 'Щойно додано',
        link: link,
        matchScore: 90,
        status: 'not_applied',
        appliedAt: null,
        tags: tagsInput ? tagsInput.split(',').map(t => t.trim()).filter(Boolean) : [workplaceLabels[workplaceType]],
        description: description || 'Опис вакансії додано користувачем.',
        matchAnalysis: {
          strengths: ['Додано користувачем вручну'],
          gaps: []
        }
      };

      vacancies.unshift(newVac);
      saveData();
      addForm.reset();
      addModal.classList.add('hidden');
      addModal.classList.remove('flex');
      renderApp();
    });
  }
}

// Render entire UI
function renderApp() {
  updateDashboardCounters();
  renderCardsGrid();
  if (window.lucide) {
    lucide.createIcons();
  }
}

// Update KPI Counters
function updateDashboardCounters() {
  const countTotalEl = document.getElementById('countTotal');
  const countHighMatchEl = document.getElementById('countHighMatch');
  const countNotAppliedEl = document.getElementById('countNotApplied');
  const countAppliedEl = document.getElementById('countApplied');
  const countSavedEl = document.getElementById('countSaved');

  if (!countTotalEl) return;

  const total = vacancies.length;
  const highMatch = vacancies.filter(v => (v.matchScore || 0) >= 90).length;
  const applied = vacancies.filter(v => v.status === 'applied').length;
  const saved = vacancies.filter(v => v.isSaved).length;
  const notApplied = total - applied;

  countTotalEl.textContent = total;
  if (countHighMatchEl) countHighMatchEl.textContent = highMatch;
  countNotAppliedEl.textContent = notApplied;
  countAppliedEl.textContent = applied;
  countSavedEl.textContent = saved;
}

// Filter and Sort algorithm
function getFilteredAndSortedVacancies() {
  return vacancies.filter(v => {
    // 1. Role filter
    if (filterState.role !== 'all' && v.roleCategory !== filterState.role) {
      return false;
    }

    // 2. Workplace filter
    const vType = v.workplaceType || (v.location && v.location.toLowerCase().includes('remote') ? 'remote' : 'office');
    if (filterState.workplace === 'remote' && vType !== 'remote') return false;
    if (filterState.workplace === 'office' && vType !== 'office' && vType !== 'hybrid') return false;

    // 3. Status filter
    if (filterState.status === 'applied' && v.status !== 'applied') return false;
    if (filterState.status === 'not_applied' && v.status === 'applied') return false;
    if (filterState.status === 'saved' && !v.isSaved) return false;

    // 4. Min Match filter
    if (filterState.minMatch !== 'all') {
      const minScore = parseInt(filterState.minMatch, 10);
      if ((v.matchScore || 0) < minScore) return false;
    }

    // 5. Min Salary filter (parsing numeric values)
    if (filterState.minSalary !== 'all') {
      const targetMin = parseInt(filterState.minSalary, 10);
      const salaryText = (v.salary || '').toLowerCase();
      // Extract first dollar amount or hryvnia equivalent
      const dollarMatch = salaryText.match(/\$([0-9,]+)/);
      const uahMatch = salaryText.match(/([0-9,]+)\s*грн/);
      let parsedUsd = 0;

      if (dollarMatch) {
        parsedUsd = parseInt(dollarMatch[1].replace(/,/g, ''), 10);
      } else if (uahMatch) {
        parsedUsd = Math.round(parseInt(uahMatch[1].replace(/,/g, ''), 10) / 41.5);
      }

      if (parsedUsd > 0 && parsedUsd < targetMin) return false;
    }

    // 6. Source platform filter
    if (filterState.source !== 'all') {
      const link = (v.link || '').toLowerCase();
      if (filterState.source === 'linkedin' && !link.includes('linkedin.com')) return false;
      if (filterState.source === 'djinni' && !link.includes('djinni.co')) return false;
      if (filterState.source === 'dou' && !link.includes('dou.ua')) return false;
      if (filterState.source === 'workua' && !link.includes('work.ua') && !link.includes('robota.ua')) return false;
    }

    // 7. Search text query
    if (filterState.searchQuery) {
      const q = filterState.searchQuery;
      const inTitle = v.title && v.title.toLowerCase().includes(q);
      const inCompany = v.company && v.company.toLowerCase().includes(q);
      const inDesc = v.description && v.description.toLowerCase().includes(q);
      const inRole = v.roleName && v.roleName.toLowerCase().includes(q);
      const inTags = v.tags && v.tags.some(t => t.toLowerCase().includes(q));

      if (!inTitle && !inCompany && !inDesc && !inRole && !inTags) return false;
    }

    return true;
  }).sort((a, b) => {
    if (filterState.sortBy === 'match_desc') {
      return (b.matchScore || 0) - (a.matchScore || 0);
    }
    if (filterState.sortBy === 'date_desc') {
      return (b.id || '').localeCompare(a.id || '');
    }
    if (filterState.sortBy === 'salary_desc') {
      const getVal = (v) => {
        const m = (v.salary || '').match(/\$([0-9,]+)/);
        return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
      };
      return getVal(b) - getVal(a);
    }
    return 0;
  });
}

// Render cards
function renderCardsGrid() {
  const container = document.getElementById('vacanciesContainer');
  const emptyState = document.getElementById('vacanciesEmpty');
  const resultCountEl = document.getElementById('filteredResultsCount');
  if (!container) return;

  const filtered = getFilteredAndSortedVacancies();

  if (resultCountEl) {
    resultCountEl.textContent = `${filtered.length} із ${vacancies.length}`;
  }

  if (filtered.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  container.innerHTML = filtered.map(vac => {
    const isApplied = (vac.status === 'applied');
    const isSaved = !!vac.isSaved;
    const match = vac.matchScore || 85;
    const strengths = (vac.matchAnalysis && vac.matchAnalysis.strengths) || [];
    const gaps = (vac.matchAnalysis && vac.matchAnalysis.gaps) || [];

    // Platform source badge
    let platformBadge = `<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/5 border border-white/10 text-slate-400">Пряма</span>`;
    const linkLower = (vac.link || '').toLowerCase();
    if (linkLower.includes('linkedin.com')) {
      platformBadge = `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#0a66c2]/15 text-[#70b5f9] border border-[#0a66c2]/30">LinkedIn</span>`;
    } else if (linkLower.includes('djinni.co')) {
      platformBadge = `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">Djinni</span>`;
    } else if (linkLower.includes('dou.ua')) {
      platformBadge = `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">DOU</span>`;
    }

    // Workplace badge
    const wType = vac.workplaceType || 'remote';
    let workplaceBadge = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-500/15 text-teal-300 border border-teal-500/25">
      <i data-lucide="globe" class="w-3 h-3"></i> Remote
    </span>`;
    if (wType === 'office') {
      workplaceBadge = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
        <i data-lucide="building" class="w-3 h-3"></i> В офісі
      </span>`;
    } else if (wType === 'hybrid') {
      workplaceBadge = `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/25">
        <i data-lucide="shuffle" class="w-3 h-3"></i> Гібрид
      </span>`;
    }

    // Match Color Badge
    let matchColor = 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    if (match >= 95) matchColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    else if (match < 80) matchColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';

    return `
      <div class="glass-card rounded-2xl p-5 sm:p-6 border transition-all duration-300 flex flex-col justify-between ${
        isApplied 
          ? 'border-emerald-500/40 bg-emerald-950/10 shadow-lg shadow-emerald-500/5' 
          : 'border-white/10 hover:border-purple-500/35'
      }">
        <div>
          <!-- Top Row: Source, Role, Workplace, Match, Bookmark -->
          <div class="flex items-start justify-between gap-2.5 mb-3">
            <div class="flex flex-wrap items-center gap-1.5">
              ${platformBadge}
              <span class="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-slate-300">
                ${escapeHtml(vac.roleName || 'Позиція')}
              </span>
              ${workplaceBadge}
            </div>

            <div class="flex items-center gap-1.5 shrink-0">
              <div class="px-2.5 py-1 rounded-xl ${matchColor} border text-center">
                <div class="text-xs font-black font-display leading-tight">${match}%</div>
                <div class="text-[8px] uppercase tracking-wider opacity-75 font-semibold">Метч</div>
              </div>
              <button onclick="toggleBookmark('${vac.id}')" title="${isSaved ? 'Прибрати з обраного' : 'Додати в обране'}" class="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-amber-300 transition-colors">
                <i data-lucide="star" class="w-4 h-4 ${isSaved ? 'text-amber-400 fill-amber-400' : ''}"></i>
              </button>
            </div>
          </div>

          <!-- Title with Direct Link -->
          <h4 class="text-lg font-bold text-white mb-1.5 font-display leading-snug">
            <a href="${escapeHtml(vac.link)}" target="_blank" rel="noopener noreferrer" class="hover:text-purple-400 transition-colors inline-flex items-center gap-1.5 group/title">
              <span>${escapeHtml(vac.title)}</span>
              <i data-lucide="external-link" class="w-4 h-4 text-slate-500 group-hover/title:text-purple-400 opacity-80 shrink-0"></i>
            </a>
          </h4>

          <!-- Direct Full URL Link Starting with https:// -->
          <div class="mb-3.5 p-2.5 rounded-xl bg-purple-950/20 border border-purple-500/25 flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-2 min-w-0 flex-1">
              <i data-lucide="link" class="w-3.5 h-3.5 text-purple-400 shrink-0"></i>
              <a href="${escapeHtml(vac.link)}" target="_blank" rel="noopener noreferrer" class="text-xs text-purple-300 hover:text-white font-mono break-all underline decoration-purple-500/50 hover:decoration-white transition-colors">
                ${escapeHtml(vac.link)}
              </a>
            </div>
            
            <button onclick="navigator.clipboard.writeText('${escapeHtml(vac.link)}'); alert('Посилання скопійовано: ${escapeHtml(vac.link)}');" title="Скопіювати посилання" class="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-[11px] font-medium flex items-center gap-1 transition-colors shrink-0 cursor-pointer">
              <i data-lucide="copy" class="w-3 h-3"></i>
              <span>Копіювати</span>
            </button>
          </div>

          <!-- Company, Location & Date -->
          <div class="text-xs text-slate-400 mb-3 flex flex-wrap items-center gap-2">
            <span class="font-semibold text-slate-200">${escapeHtml(vac.company)}</span>
            <span>•</span>
            <span class="text-slate-400">${escapeHtml(vac.location)}</span>
            <span>•</span>
            <span class="text-purple-400 font-medium flex items-center gap-1">
              <i data-lucide="calendar" class="w-3 h-3"></i>
              ${escapeHtml(vac.postedDate || 'Нещодавно')}
            </span>
          </div>

          <!-- Salary Pill -->
          <div class="mb-3 py-2 px-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
            <span class="text-[11px] text-slate-400 font-medium">Винагорода:</span>
            <span class="text-xs sm:text-sm font-bold text-emerald-400 font-display">${escapeHtml(vac.salary)}</span>
          </div>

          <!-- Description Preview -->
          <p class="text-xs text-slate-300/90 line-clamp-2 mb-3 leading-relaxed">
            ${escapeHtml(vac.description)}
          </p>

          <!-- Match Analysis Breakdown -->
          ${
            (strengths.length > 0 || gaps.length > 0)
              ? `
                <div class="p-3 rounded-xl bg-white/[0.02] border border-white/5 mb-4 text-xs space-y-1.5">
                  <div class="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                    <i data-lucide="shield-check" class="w-3.5 h-3.5 text-purple-400"></i>
                    <span>Оцінка сумісності:</span>
                  </div>
                  ${strengths.slice(0, 2).map(s => `
                    <div class="flex items-start gap-1.5 text-slate-300 text-[11px]">
                      <i data-lucide="check" class="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5"></i>
                      <span>${escapeHtml(s)}</span>
                    </div>
                  `).join('')}
                  ${gaps.slice(0, 1).map(g => `
                    <div class="flex items-start gap-1.5 text-amber-300/90 text-[11px]">
                      <i data-lucide="alert-circle" class="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5"></i>
                      <span>${escapeHtml(g)}</span>
                    </div>
                  `).join('')}
                </div>
              `
              : ''
          }

          <!-- Skill Tags -->
          <div class="flex flex-wrap gap-1.5 mb-4">
            ${(vac.tags || []).slice(0, 5).map(tag => `
              <span class="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/5">
                ${escapeHtml(tag)}
              </span>
            `).join('')}
          </div>
        </div>

        <!-- Card Actions Footer -->
        <div class="pt-3.5 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <a href="${escapeHtml(vac.link)}" target="_blank" rel="noopener noreferrer" class="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors group/link">
            <span>Відкрити вакансію</span>
            <i data-lucide="external-link" class="w-3.5 h-3.5 text-slate-400 group-hover/link:text-white transition-colors"></i>
          </a>

          <button onclick="toggleApplicationStatus('${vac.id}')" class="px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            isApplied
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-600/20'
          }">
            <i data-lucide="${isApplied ? 'check' : 'send'}" class="w-3.5 h-3.5"></i>
            <span>${isApplied ? (vac.appliedAt ? `Заявку подано (${vac.appliedAt})` : 'Заявку подано ✓') : 'Позначити: Подав заявку'}</span>
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
  renderApp();
};

// Toggle bookmark
window.toggleBookmark = function(id) {
  const vac = vacancies.find(v => v.id === id);
  if (!vac) return;
  vac.isSaved = !vac.isSaved;
  saveData();
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
