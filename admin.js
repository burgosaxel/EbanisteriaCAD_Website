(function () {
  var STORAGE_KEY = 'ebanisteria_content_v1';

  var DEFAULT_CONTENT = {
    about: {
      title: 'Sobre EbanisteriaCAD',
      paragraphs: [
        'Soy Ana Alamo y llevo 12 anos en la industria de los gabinetes. Junto a mi esposo Christian Del Valle, quien ha sido ebanista por 18, decidimos arriesgarnos y tener nuestro propio negocio.',
        'Lo que comenzo como un sueno en la marquesina de nuestro hogar, es hoy Ebanisteria CAD. Contamos con un taller de ebanisteria ubicado en la carretera numero 1 en direccion de San Juan a Caguas.',
        'Somos un equipo de trabajo extraordinario que dia a dia se levanta para realizar la cocina de tus suenos.',
        'Nos distingue nuestra rapidez, nuestra calidad, pero sobre todo, nuestra responsabilidad.'
      ]
    },
    contact: {
      title: 'Contactenos',
      phones: ['787-425-3887', '787-446-4469'],
      email: 'ebanisteriacad@gmail.com'
    },
    pricing: {
      title: 'Precios Base',
      rows: [
        { service: 'Modulo basico de cocina', price: '$2,500' },
        { service: 'Proyecto personalizado completo', price: '$5,000' }
      ]
    },
    designs: {
      title: 'Disenos Destacados',
      categories: [
        { name: 'Cocinas', images: [{ src: '', caption: 'Cocina Moderna Minimalista' }] },
        { name: 'Closets', images: [{ src: '', caption: 'Closets y Muebles Empotrados' }] },
        { name: 'Acabados', images: [{ src: '', caption: 'Acabado Clasico Elegante' }] }
      ]
    }
  };

  var state = loadContent();
  var currentCategoryIndex = 0;

  function cloneDefault() {
    return JSON.parse(JSON.stringify(DEFAULT_CONTENT));
  }

  function deepMerge(base, incoming) {
    if (!incoming || typeof incoming !== 'object') return base;
    Object.keys(incoming).forEach(function (k) {
      if (Array.isArray(incoming[k])) {
        base[k] = incoming[k];
      } else if (incoming[k] && typeof incoming[k] === 'object' && base[k] && typeof base[k] === 'object') {
        base[k] = deepMerge(base[k], incoming[k]);
      } else {
        base[k] = incoming[k];
      }
    });
    return base;
  }

  function loadContent() {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneDefault();
    try {
      return deepMerge(cloneDefault(), JSON.parse(raw));
    } catch (e) {
      return cloneDefault();
    }
  }

  function saveContent() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function byId(id) {
    return document.getElementById(id);
  }

  function hydrateForm() {
    byId('aboutTitle').value = state.about.title || '';
    byId('aboutParagraphs').value = (state.about.paragraphs || []).join('\n');

    byId('contactTitle').value = state.contact.title || '';
    byId('contactPhones').value = (state.contact.phones || []).join('\n');
    byId('contactEmail').value = state.contact.email || '';

    byId('pricingTitle').value = state.pricing.title || '';
    renderPricingRows();

    byId('designsTitle').value = state.designs.title || '';
    renderCategorySelect();
    renderCategoryEditor();
  }

  function syncFromForm() {
    state.about.title = byId('aboutTitle').value.trim();
    state.about.paragraphs = byId('aboutParagraphs').value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean);

    state.contact.title = byId('contactTitle').value.trim();
    state.contact.phones = byId('contactPhones').value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean);
    state.contact.email = byId('contactEmail').value.trim();

    state.pricing.title = byId('pricingTitle').value.trim();
    state.designs.title = byId('designsTitle').value.trim();
  }

  function renderPricingRows() {
    var wrap = byId('pricingRows');
    wrap.innerHTML = '';

    state.pricing.rows.forEach(function (row, idx) {
      var line = document.createElement('div');
      line.className = 'admin-row';

      var service = document.createElement('input');
      service.type = 'text';
      service.value = row.service || '';
      service.placeholder = 'Servicio';
      service.addEventListener('input', function () { state.pricing.rows[idx].service = service.value; });

      var price = document.createElement('input');
      price.type = 'text';
      price.value = row.price || '';
      price.placeholder = '$0';
      price.addEventListener('input', function () { state.pricing.rows[idx].price = price.value; });

      var removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.textContent = 'Quitar';
      removeBtn.addEventListener('click', function () {
        state.pricing.rows.splice(idx, 1);
        renderPricingRows();
      });

      line.appendChild(service);
      line.appendChild(price);
      line.appendChild(removeBtn);
      wrap.appendChild(line);
    });
  }

  function renderCategorySelect() {
    var select = byId('categorySelect');
    select.innerHTML = '';

    state.designs.categories.forEach(function (cat, idx) {
      var opt = document.createElement('option');
      opt.value = String(idx);
      opt.textContent = cat.name || ('Carpeta ' + (idx + 1));
      select.appendChild(opt);
    });

    if (state.designs.categories.length === 0) {
      state.designs.categories.push({ name: 'Nueva Carpeta', images: [] });
    }

    if (currentCategoryIndex >= state.designs.categories.length) {
      currentCategoryIndex = state.designs.categories.length - 1;
    }

    select.value = String(currentCategoryIndex);
  }

  function renderCategoryEditor() {
    var cat = state.designs.categories[currentCategoryIndex];
    if (!cat) return;

    byId('categoryName').value = cat.name || '';
    byId('imageUrl').value = '';
    byId('imageCaption').value = '';
    byId('imageUpload').value = '';

    var list = byId('imagesList');
    list.innerHTML = '';

    (cat.images || []).forEach(function (img, idx) {
      var row = document.createElement('div');
      row.className = 'admin-image-row';

      if (img.src) {
        var preview = document.createElement('img');
        preview.className = 'admin-thumb';
        preview.src = img.src;
        preview.alt = img.caption || 'Imagen';
        row.appendChild(preview);
      }

      var info = document.createElement('input');
      info.type = 'text';
      info.value = img.caption || '';
      info.placeholder = 'Caption';
      info.addEventListener('input', function () {
        cat.images[idx].caption = info.value;
      });

      var remove = document.createElement('button');
      remove.type = 'button';
      remove.textContent = 'Eliminar';
      remove.addEventListener('click', function () {
        cat.images.splice(idx, 1);
        renderCategoryEditor();
      });

      row.appendChild(info);
      row.appendChild(remove);
      list.appendChild(row);
    });
  }

  function wireEvents() {
    byId('saveAllBtn').addEventListener('click', function () {
      syncFromForm();
      saveContent();
      alert('Contenido guardado. Refresca el sitio para ver cambios.');
    });

    byId('resetBtn').addEventListener('click', function () {
      if (!confirm('Restaurar contenido base?')) return;
      state = cloneDefault();
      currentCategoryIndex = 0;
      hydrateForm();
      saveContent();
    });

    byId('exportBtn').addEventListener('click', function () {
      syncFromForm();
      var blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'ebanisteria-content.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });

    byId('importFile').addEventListener('change', function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var parsed = JSON.parse(String(reader.result || '{}'));
          state = deepMerge(cloneDefault(), parsed);
          currentCategoryIndex = 0;
          hydrateForm();
          saveContent();
          alert('JSON importado.');
        } catch (err) {
          alert('JSON invalido.');
        }
      };
      reader.readAsText(file);
    });

    byId('addPriceRowBtn').addEventListener('click', function () {
      state.pricing.rows.push({ service: '', price: '' });
      renderPricingRows();
    });

    byId('categorySelect').addEventListener('change', function () {
      syncFromForm();
      currentCategoryIndex = Number(byId('categorySelect').value || 0);
      renderCategoryEditor();
    });

    byId('categoryName').addEventListener('input', function () {
      var cat = state.designs.categories[currentCategoryIndex];
      if (!cat) return;
      cat.name = byId('categoryName').value;
      renderCategorySelect();
    });

    byId('addCategoryBtn').addEventListener('click', function () {
      syncFromForm();
      state.designs.categories.push({ name: 'Nueva Carpeta', images: [] });
      currentCategoryIndex = state.designs.categories.length - 1;
      renderCategorySelect();
      renderCategoryEditor();
    });

    byId('removeCategoryBtn').addEventListener('click', function () {
      if (state.designs.categories.length <= 1) {
        alert('Debe quedar al menos una carpeta.');
        return;
      }
      state.designs.categories.splice(currentCategoryIndex, 1);
      currentCategoryIndex = 0;
      renderCategorySelect();
      renderCategoryEditor();
    });

    byId('addImageUrlBtn').addEventListener('click', function () {
      var cat = state.designs.categories[currentCategoryIndex];
      if (!cat) return;
      var src = byId('imageUrl').value.trim();
      var caption = byId('imageCaption').value.trim();
      if (!src) return;
      cat.images.push({ src: src, caption: caption });
      renderCategoryEditor();
    });

    byId('imageUpload').addEventListener('change', function (e) {
      var cat = state.designs.categories[currentCategoryIndex];
      if (!cat) return;
      var files = Array.prototype.slice.call(e.target.files || []);
      files.forEach(function (file) {
        var reader = new FileReader();
        reader.onload = function () {
          cat.images.push({ src: String(reader.result || ''), caption: file.name });
          renderCategoryEditor();
        };
        reader.readAsDataURL(file);
      });
    });
  }

  hydrateForm();
  wireEvents();
})();