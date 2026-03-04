(function () {
  var STORAGE_KEY = 'ebanisteria_admin_requests_v1';
  var SIDEBAR_OPEN_CLASS = 'admin-sidebar-open';

  var SAMPLE_REQUESTS = [
    {
      id: 'REQ-1001',
      fecha: '2026-03-01T10:12:00',
      nombre: 'María Torres',
      categoria: 'Cocinas',
      telefono: '787-555-0101',
      email: 'maria.torres@email.com',
      estado: 'Nuevo',
      medidas: '12x10 pies',
      material: 'PVC + cuarzo',
      presupuesto: '$6,000 - $8,000',
      mensaje: 'Quiero una cocina moderna en L con isla.'
    },
    {
      id: 'REQ-1002',
      fecha: '2026-03-02T14:40:00',
      nombre: 'Carlos Rivera',
      categoria: 'Closets',
      telefono: '787-555-0198',
      email: 'carlos.rivera@email.com',
      estado: 'En Proceso',
      medidas: '8x6 pies',
      material: 'Melamina premium',
      presupuesto: '$3,000 - $4,500',
      mensaje: 'Necesito closet empotrado con módulos y gavetas.'
    },
    {
      id: 'REQ-1003',
      fecha: '2026-02-25T09:05:00',
      nombre: 'Laura Méndez',
      categoria: 'Remodelación',
      telefono: '787-555-0137',
      email: 'laura.mendez@email.com',
      estado: 'Completado',
      medidas: 'Apartamento completo',
      material: 'Combinado',
      presupuesto: '$12,000+',
      mensaje: 'Proyecto integral de cocina y mueble de TV.'
    }
  ];

  var state = {
    requests: [],
    search: '',
    status: 'Todos',
    loading: false,
    activeId: null
  };

  function byId(id) {
    return document.getElementById(id);
  }

  function nowISODate() {
    return new Date().toISOString();
  }

  function parseOrDefault(raw, fallback) {
    try {
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function loadRequests() {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      state.requests = SAMPLE_REQUESTS.slice();
      saveRequests();
      return;
    }
    state.requests = parseOrDefault(raw, SAMPLE_REQUESTS.slice());
  }

  function saveRequests() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.requests));
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

  function getFilteredRequests() {
    var q = normalize(state.search);

    return state.requests.filter(function (item) {
      var statusOk = state.status === 'Todos' || item.estado === state.status;
      if (!statusOk) return false;

      if (!q) return true;

      return [item.nombre, item.email, item.categoria, item.telefono]
        .some(function (v) { return normalize(v).indexOf(q) !== -1; });
    });
  }

  function calcStats() {
    var total = state.requests.length;
    var pending = state.requests.filter(function (r) { return r.estado === 'Nuevo'; }).length;
    var done = state.requests.filter(function (r) { return r.estado === 'Completado'; }).length;

    var now = new Date();
    var weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);

    var week = state.requests.filter(function (r) {
      var d = new Date(r.fecha);
      return d >= weekAgo && d <= now;
    }).length;

    byId('statTotal').textContent = String(total);
    byId('statWeek').textContent = String(week);
    byId('statPending').textContent = String(pending);
    byId('statDone').textContent = String(done);
  }

  function rowActions(id, status) {
    var disableProcess = status === 'En Proceso';
    var disableDone = status === 'Completado';

    return (
      '<div class="admin-actions-cell">' +
      '<button class="btn btn-outline admin-mini" data-action="view" data-id="' + id + '">Ver</button>' +
      '<button class="btn btn-outline admin-mini" data-action="process" data-id="' + id + '"' + (disableProcess ? ' disabled' : '') + '>En Proceso</button>' +
      '<button class="btn btn-primary admin-mini" data-action="done" data-id="' + id + '"' + (disableDone ? ' disabled' : '') + '>Completar</button>' +
      '<button class="btn btn-outline admin-mini danger" data-action="delete" data-id="' + id + '">Eliminar</button>' +
      '</div>'
    );
  }

  function renderTable() {
    var tbody = byId('requestsTbody');
    var empty = byId('emptyState');
    var tableWrap = byId('tableWrap');
    if (!tbody || !empty || !tableWrap) return;

    var rows = getFilteredRequests();

    if (!rows.length) {
      tbody.innerHTML = '';
      tableWrap.hidden = true;
      empty.hidden = false;
      return;
    }

    empty.hidden = true;
    tableWrap.hidden = false;

    tbody.innerHTML = rows.map(function (item) {
      return (
        '<tr>' +
        '<td>' + formatDate(item.fecha) + '</td>' +
        '<td>' + escapeHtml(item.nombre) + '</td>' +
        '<td>' + escapeHtml(item.categoria) + '</td>' +
        '<td>' + escapeHtml(item.telefono) + '</td>' +
        '<td>' + escapeHtml(item.email) + '</td>' +
        '<td><span class="admin-status status-' + slug(item.estado) + '">' + escapeHtml(item.estado) + '</span></td>' +
        '<td>' + rowActions(item.id, item.estado) + '</td>' +
        '</tr>'
      );
    }).join('');

    calcStats();
  }

  function slug(value) {
    return normalize(value).replace(/\s+/g, '-');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
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

  function openRequestModal(request) {
    var modal = byId('requestModal');
    var content = byId('modalContent');
    if (!modal || !content || !request) return;

    content.innerHTML =
      '<dl class="admin-detail-grid">' +
      detail('ID', request.id) +
      detail('Fecha', formatDate(request.fecha)) +
      detail('Nombre', request.nombre) +
      detail('Categoría', request.categoria) +
      detail('Teléfono', request.telefono) +
      detail('Email', request.email) +
      detail('Estado', request.estado) +
      detail('Medidas', request.medidas || '-') +
      detail('Material', request.material || '-') +
      detail('Presupuesto', request.presupuesto || '-') +
      detail('Mensaje', request.mensaje || '-') +
      '</dl>';

    modal.hidden = false;
    document.body.classList.add('admin-modal-open');
  }

  function detail(label, value) {
    return '<div><dt>' + escapeHtml(label) + '</dt><dd>' + escapeHtml(value) + '</dd></div>';
  }

  function closeModal() {
    var modal = byId('requestModal');
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove('admin-modal-open');
  }

  function findRequest(id) {
    return state.requests.find(function (r) { return r.id === id; });
  }

  function updateStatus(id, status) {
    var req = findRequest(id);
    if (!req) return;
    req.estado = status;
    saveRequests();
    renderTable();
    showToast('success', 'Estado actualizado a: ' + status);
  }

  function deleteRequest(id) {
    var req = findRequest(id);
    if (!req) return;

    var ok = window.confirm('¿Eliminar la solicitud de ' + req.nombre + '?');
    if (!ok) return;

    state.requests = state.requests.filter(function (r) { return r.id !== id; });
    saveRequests();
    renderTable();
    showToast('info', 'Solicitud eliminada.');
  }

  function handleActionClick(e) {
    var target = e.target;
    if (!(target instanceof HTMLElement)) return;

    var action = target.getAttribute('data-action');
    var id = target.getAttribute('data-id');
    if (!action || !id) return;

    if (action === 'view') {
      openRequestModal(findRequest(id));
      return;
    }

    if (action === 'process') {
      updateStatus(id, 'En Proceso');
      return;
    }

    if (action === 'done') {
      updateStatus(id, 'Completado');
      return;
    }

    if (action === 'delete') {
      deleteRequest(id);
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
      state.status = status.value;
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

  function init() {
    setLoading(true);
    loadRequests();

    setTimeout(function () {
      setLoading(false);
      wireSidebar();
      wireFilters();
      wireTableActions();
      wireModal();
      wireSectionSpy();
      renderTable();
      updateNowClock();
      setInterval(updateNowClock, 30000);
      showToast('info', 'Panel listo. Puedes gestionar solicitudes localmente.');
    }, 350);
  }

  init();
})();
