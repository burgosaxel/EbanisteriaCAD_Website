(function () {
  var STORAGE_KEY = 'ebanisteria_quotes';
  var SIDEBAR_OPEN_CLASS = 'admin-sidebar-open';

  var SAMPLE_QUOTES = [
    {
      id: 'REQ-1001',
      name: 'María Torres',
      phone: '787-555-0101',
      email: 'maria.torres@email.com',
      category: 'Cocinas',
      message: 'Quiero una cocina moderna en L con isla.',
      status: 'new',
      createdAt: '2026-03-01T10:12:00',
      measures: '12x10 pies',
      material: 'PVC + cuarzo',
      budget: '$6,000 - $8,000'
    },
    {
      id: 'REQ-1002',
      name: 'Carlos Rivera',
      phone: '787-555-0198',
      email: 'carlos.rivera@email.com',
      category: 'Closets',
      message: 'Necesito closet empotrado con módulos y gavetas.',
      status: 'in_progress',
      createdAt: '2026-03-02T14:40:00',
      measures: '8x6 pies',
      material: 'Melamina premium',
      budget: '$3,000 - $4,500'
    },
    {
      id: 'REQ-1003',
      name: 'Laura Méndez',
      phone: '787-555-0137',
      email: 'laura.mendez@email.com',
      category: 'Remodelación',
      message: 'Proyecto integral de cocina y mueble de TV.',
      status: 'completed',
      createdAt: '2026-02-25T09:05:00',
      measures: 'Apartamento completo',
      material: 'Combinado',
      budget: '$12,000+'
    }
  ];

  var STATUS_META = {
    new: { label: 'Nuevo', css: 'status-nuevo' },
    in_progress: { label: 'En Proceso', css: 'status-en-proceso' },
    completed: { label: 'Completado', css: 'status-completado' }
  };

  // Data service abstraction
  // TODO: Replace localStorage with Firebase Firestore queries
  var QuoteService = {
    getQuotes: getQuotes,
    saveQuote: saveQuote,
    updateQuoteStatus: updateQuoteStatus,
    deleteQuote: deleteQuote
  };

  var state = {
    search: '',
    statusFilter: 'Todos',
    loading: false
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function notifyQuotesUpdated() {
    document.dispatchEvent(new CustomEvent('quotesUpdated'));
  }

  function readStore() {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    try {
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function writeStore(quotes, emitEvent) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quotes));
    if (emitEvent !== false) {
      notifyQuotesUpdated();
    }
  }

  function generateId() {
    return 'REQ-' + Date.now().toString(36).toUpperCase();
  }

  function normalizeQuote(input) {
    return {
      id: input.id || generateId(),
      name: input.name || '',
      phone: input.phone || '',
      email: input.email || '',
      category: input.category || '',
      message: input.message || '',
      status: input.status || 'new',
      createdAt: input.createdAt || new Date().toISOString(),
      measures: input.measures || '',
      material: input.material || '',
      budget: input.budget || ''
    };
  }

  function getQuotes() {
    return readStore();
  }

  function saveQuote(quote) {
    var quotes = readStore();
    var normalized = normalizeQuote(quote || {});
    quotes.push(normalized);
    writeStore(quotes);
    return normalized;
  }

  function updateQuoteStatus(id, status) {
    var quotes = readStore();
    var updated = false;

    quotes = quotes.map(function (q) {
      if (q.id !== id) return q;
      updated = true;
      return Object.assign({}, q, { status: status });
    });

    if (updated) {
      writeStore(quotes);
    }

    return updated;
  }

  function deleteQuote(id) {
    var quotes = readStore();
    var next = quotes.filter(function (q) { return q.id !== id; });

    if (next.length !== quotes.length) {
      writeStore(next);
      return true;
    }

    return false;
  }

  function seedDemoDataIfNeeded() {
    if (QuoteService.getQuotes().length > 0) return;

    SAMPLE_QUOTES.forEach(function (quote) {
      var quotes = readStore();
      quotes.push(normalizeQuote(quote));
      writeStore(quotes, false);
    });

    notifyQuotesUpdated();
  }

  function formatDate(iso) {
    var d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '-';

    return d.toLocaleString('es-PR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function normalize(value) {
    return String(value || '').toLowerCase();
  }

  function statusToFilterValue(status) {
    if (status === 'new') return 'Nuevo';
    if (status === 'in_progress') return 'En Proceso';
    if (status === 'completed') return 'Completado';
    return 'Todos';
  }

  function filterValueToStatus(filter) {
    if (filter === 'Nuevo') return 'new';
    if (filter === 'En Proceso') return 'in_progress';
    if (filter === 'Completado') return 'completed';
    return 'all';
  }

  function getFilteredQuotes() {
    var q = normalize(state.search);
    var statusFilter = filterValueToStatus(state.statusFilter);

    return QuoteService.getQuotes().filter(function (item) {
      var statusOk = statusFilter === 'all' || item.status === statusFilter;
      if (!statusOk) return false;

      if (!q) return true;

      return [item.name, item.email, item.category, item.phone]
        .some(function (v) { return normalize(v).indexOf(q) !== -1; });
    });
  }

  function calcStats() {
    var quotes = QuoteService.getQuotes();
    var total = quotes.length;
    var pending = quotes.filter(function (r) { return r.status === 'new'; }).length;
    var done = quotes.filter(function (r) { return r.status === 'completed'; }).length;

    var now = new Date();
    var weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);

    var week = quotes.filter(function (r) {
      var d = new Date(r.createdAt);
      return d >= weekAgo && d <= now;
    }).length;

    byId('statTotal').textContent = String(total);
    byId('statWeek').textContent = String(week);
    byId('statPending').textContent = String(pending);
    byId('statDone').textContent = String(done);
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function rowActions(id, status) {
    var disableProcess = status === 'in_progress';
    var disableDone = status === 'completed';

    return (
      '<div class="admin-actions-cell">' +
      '<button class="btn btn-outline admin-mini" data-action="view" data-id="' + id + '">Ver</button>' +
      '<button class="btn btn-outline admin-mini" data-action="process" data-id="' + id + '"' + (disableProcess ? ' disabled' : '') + '>En Proceso</button>' +
      '<button class="btn btn-primary admin-mini" data-action="done" data-id="' + id + '"' + (disableDone ? ' disabled' : '') + '>Completar</button>' +
      '<button class="btn btn-outline admin-mini danger" data-action="delete" data-id="' + id + '">Eliminar</button>' +
      '</div>'
    );
  }

  function setLoading(value) {
    state.loading = value;
    var loading = byId('loadingState');
    var empty = byId('emptyState');
    var tableWrap = byId('tableWrap');
    if (!loading || !empty || !tableWrap) return;

    loading.hidden = !value;
    if (value) {
      empty.hidden = true;
      tableWrap.hidden = true;
    }
  }

  function renderTable() {
    var tbody = byId('requestsTbody');
    var empty = byId('emptyState');
    var tableWrap = byId('tableWrap');
    if (!tbody || !empty || !tableWrap) return;

    var rows = getFilteredQuotes();

    if (!rows.length) {
      tbody.innerHTML = '';
      tableWrap.hidden = true;
      empty.hidden = false;
      calcStats();
      return;
    }

    empty.hidden = true;
    tableWrap.hidden = false;

    tbody.innerHTML = rows.map(function (item) {
      var meta = STATUS_META[item.status] || STATUS_META.new;

      return (
        '<tr>' +
        '<td>' + formatDate(item.createdAt) + '</td>' +
        '<td>' + escapeHtml(item.name) + '</td>' +
        '<td>' + escapeHtml(item.category) + '</td>' +
        '<td>' + escapeHtml(item.phone) + '</td>' +
        '<td>' + escapeHtml(item.email) + '</td>' +
        '<td><span class="admin-status ' + meta.css + '">' + escapeHtml(meta.label) + '</span></td>' +
        '<td>' + rowActions(item.id, item.status) + '</td>' +
        '</tr>'
      );
    }).join('');

    calcStats();
  }

  function showToast(type, message) {
    var wrap = byId('toastContainer');
    if (!wrap) return;

    var toast = document.createElement('div');
    toast.className = 'admin-toast ' + type;
    toast.textContent = message;
    wrap.appendChild(toast);

    requestAnimationFrame(function () {
      toast.classList.add('show');
    });

    setTimeout(function () {
      toast.classList.remove('show');
      setTimeout(function () {
        toast.remove();
      }, 220);
    }, 3000);
  }

  function detail(label, value) {
    return '<div><dt>' + escapeHtml(label) + '</dt><dd>' + escapeHtml(value) + '</dd></div>';
  }

  function openRequestModal(request) {
    var modal = byId('requestModal');
    var content = byId('modalContent');
    if (!modal || !content || !request) return;

    var meta = STATUS_META[request.status] || STATUS_META.new;

    content.innerHTML =
      '<dl class="admin-detail-grid">' +
      detail('ID', request.id) +
      detail('Fecha', formatDate(request.createdAt)) +
      detail('Nombre', request.name) +
      detail('Categoría', request.category) +
      detail('Teléfono', request.phone) +
      detail('Email', request.email) +
      detail('Estado', meta.label) +
      detail('Medidas', request.measures || '-') +
      detail('Material', request.material || '-') +
      detail('Presupuesto', request.budget || '-') +
      detail('Mensaje', request.message || '-') +
      '</dl>';

    modal.hidden = false;
    document.body.classList.add('admin-modal-open');
  }

  function closeModal() {
    var modal = byId('requestModal');
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove('admin-modal-open');
  }

  function findQuote(id) {
    return QuoteService.getQuotes().find(function (r) { return r.id === id; });
  }

  function handleActionClick(e) {
    var target = e.target;
    if (!(target instanceof HTMLElement)) return;

    var action = target.getAttribute('data-action');
    var id = target.getAttribute('data-id');
    if (!action || !id) return;

    if (action === 'view') {
      openRequestModal(findQuote(id));
      return;
    }

    if (action === 'process') {
      var okProcess = QuoteService.updateQuoteStatus(id, 'in_progress');
      if (okProcess) showToast('success', 'Estado actualizado a En Proceso.');
      return;
    }

    if (action === 'done') {
      var okDone = QuoteService.updateQuoteStatus(id, 'completed');
      if (okDone) showToast('success', 'Solicitud marcada como completada.');
      return;
    }

    if (action === 'delete') {
      var req = findQuote(id);
      if (!req) return;
      if (!window.confirm('¿Eliminar la solicitud de ' + req.name + '?')) return;
      var removed = QuoteService.deleteQuote(id);
      if (removed) showToast('info', 'Solicitud eliminada.');
    }
  }

  function updateNowClock() {
    var el = byId('adminNow');
    if (!el) return;
    el.textContent = new Date().toLocaleString('es-PR', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function closeSidebarOnNav() {
    document.querySelectorAll('.admin-nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        document.body.classList.remove(SIDEBAR_OPEN_CLASS);
      });
    });
  }

  function wireSidebar() {
    var toggle = byId('sidebarToggle');
    if (!toggle) return;

    toggle.addEventListener('click', function () {
      document.body.classList.toggle(SIDEBAR_OPEN_CLASS);
    });

    closeSidebarOnNav();
  }

  function wireFilters() {
    var search = byId('searchInput');
    var status = byId('statusFilter');
    if (!search || !status) return;

    search.addEventListener('input', function () {
      state.search = search.value;
      renderTable();
    });

    status.addEventListener('change', function () {
      state.statusFilter = status.value;
      renderTable();
    });
  }

  function wireTableActions() {
    var tbody = byId('requestsTbody');
    if (!tbody) return;
    tbody.addEventListener('click', handleActionClick);
  }

  function wireModal() {
    var modal = byId('requestModal');
    var closeBtn = byId('closeModalBtn');
    if (!modal || !closeBtn) return;

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) {
      var target = e.target;
      if (target instanceof HTMLElement && target.hasAttribute('data-close-modal')) {
        closeModal();
      }
    });

    window.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });
  }

  function wireSectionSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.admin-nav-link'));
    var sections = links
      .map(function (link) {
        var id = link.getAttribute('href') || '';
        return document.querySelector(id);
      })
      .filter(Boolean);

    if (!sections.length) return;

    function updateActive() {
      var y = window.scrollY + 120;
      var current = sections[0].id;

      sections.forEach(function (s) {
        if (s.offsetTop <= y) current = s.id;
      });

      links.forEach(function (link) {
        link.classList.toggle('active', link.getAttribute('href') === '#' + current);
      });
    }

    updateActive();
    window.addEventListener('scroll', updateActive, { passive: true });
  }

  function refreshFromService() {
    if (state.loading) return;
    renderTable();
  }

  function init() {
    setLoading(true);

    seedDemoDataIfNeeded();

    setTimeout(function () {
      setLoading(false);
      wireSidebar();
      wireFilters();
      wireTableActions();
      wireModal();
      wireSectionSpy();
      document.addEventListener('quotesUpdated', refreshFromService);
      renderTable();
      updateNowClock();
      setInterval(updateNowClock, 30000);
      showToast('info', 'Panel listo. Puedes gestionar solicitudes localmente.');
    }, 320);
  }

  init();
})();
