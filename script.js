(function () {
  function currentPage() {
    var file = window.location.pathname.split('/').pop();
    return (file && file.length ? file : 'index.html').toLowerCase();
  }

  function renderHeader(page) {
    var header = document.querySelector('.site-topbar');
    if (!header) return;

    var links = [
      { href: 'index.html', label: 'Inicio' },
      { href: 'about.html', label: 'Nosotros' },
      { href: 'quote.html', label: 'Cotizaci\u00f3n' },
      { href: 'designs.html', label: 'Dise\u00f1os' },
      { href: 'pricing.html', label: 'Precios' },
      { href: 'contact.html', label: 'Cont\u00e1ctenos' }
    ];

    var navItems = links.map(function (link) {
      var active = page === link.href ? ' class="active"' : '';
      return '<li><a' + active + ' href="' + link.href + '">' + link.label + '</a></li>';
    }).join('');

    header.innerHTML =
      '<a class="brand-logo-link" href="index.html">' +
      '<img class="brand-logo" src="assets/logo.jpg" alt="Ebanister\u00edaCAD logo" />' +
      '</a>' +
      '<nav class="top-links-nav"><ul>' + navItems + '</ul></nav>';
  }

  function normalizeFooter() {
    var footerContact = document.querySelector('.footer-link[href="contact.html"]');
    if (footerContact) footerContact.textContent = 'Cont\u00e1ctenos';

    var footerQuote = document.querySelector('.footer-link[href="quote.html"]');
    if (footerQuote && /solicitar/i.test(footerQuote.textContent)) {
      footerQuote.textContent = 'Solicitar Cotizaci\u00f3n';
    }

    var footerText = document.querySelector('footer p');
    if (footerText) {
      footerText.innerHTML = '&copy; 2026 Ebanister\u00edaCAD. Todos los derechos reservados.';
    }
  }

  function fixIndex() {
    document.title = 'Ebanister\u00edaCAD - Inicio';
    var h2a = document.querySelector('#home-links h2');
    if (h2a) h2a.textContent = 'Categor\u00edas';
    var pills = document.querySelectorAll('#home-links .category-pill');
    if (pills[3]) pills[3].textContent = 'Ba\u00f1os';
    if (pills[4]) pills[4].textContent = 'Remodelaci\u00f3n';
    if (pills[5]) pills[5].textContent = 'Cotizaci\u00f3n';

    var h2b = document.querySelector('#quick-process h2');
    if (h2b) h2b.textContent = 'Proceso R\u00e1pido';
    var stepTitles = document.querySelectorAll('.process-step h3');
    if (stepTitles[1]) stepTitles[1].textContent = 'Dise\u00f1o y Precio';
    if (stepTitles[2]) stepTitles[2].textContent = 'Fabricaci\u00f3n';
    if (stepTitles[3]) stepTitles[3].textContent = 'Instalaci\u00f3n';

    var stepTexts = document.querySelectorAll('.process-step p');
    if (stepTexts[2]) stepTexts[2].textContent = 'Producci\u00f3n con materiales de calidad y control de terminaciones.';
  }

  function fixAbout() {
    document.title = 'Ebanister\u00edaCAD - Nosotros';
    var about = document.getElementById('about');
    if (!about) return;
    about.innerHTML =
      '<h2>Sobre Ebanister\u00edaCAD</h2>' +
      '<p>Soy Ana \u00c1lamo y llevo 12 a\u00f1os en la industria de los gabinetes. Junto a mi esposo Christian Del Valle, quien ha sido ebanista por 18, decidimos arriesgarnos y tener nuestro propio negocio.</p>' +
      '<p>Lo que comenz\u00f3 como un sue\u00f1o en la marquesina de nuestro hogar, es hoy Ebanister\u00eda CAD. Contamos con un taller de ebanister\u00eda ubicado en la carretera n\u00famero 1 en direcci\u00f3n de San Juan a Caguas.</p>' +
      '<p>Somos un equipo de trabajo extraordinario que d\u00eda a d\u00eda se levanta para realizar la cocina de tus sue\u00f1os.</p>' +
      '<p>Nos distingue nuestra rapidez, nuestra calidad, pero sobre todo, nuestra responsabilidad.</p>';
  }

  function fixQuote() {
    document.title = 'Ebanister\u00edaCAD - Cotizaci\u00f3n';
    var h2 = document.querySelector('#quote h2');
    if (h2) h2.textContent = 'Solicitar Cotizaci\u00f3n';
  }

  function fixDesigns() {
    document.title = 'Ebanister\u00edaCAD - Dise\u00f1os';
    var h2 = document.querySelector('#designs h2');
    if (h2) h2.textContent = 'Dise\u00f1os Destacados';
    var cards = document.querySelectorAll('#designs .design-card h3');
    if (cards[1]) cards[1].textContent = 'Acabado Cl\u00e1sico Elegante';
  }

  function fixPricing() {
    document.title = 'Ebanister\u00edaCAD - Precios';
    var row = document.querySelector('#pricing table tr:nth-child(2) td:first-child');
    if (row) row.textContent = 'M\u00f3dulo b\u00e1sico de cocina';
  }

  function fixContact() {
    document.title = 'Ebanister\u00edaCAD - Cont\u00e1ctenos';
    var h2 = document.querySelector('#contact h2');
    if (h2) h2.textContent = 'Cont\u00e1ctenos';
    var lines = document.querySelectorAll('#contact p');
    if (lines[0]) lines[0].textContent = 'Tel\u00e9fono: 787-425-3887';
    if (lines[1]) lines[1].textContent = 'Tel\u00e9fono: 787-446-4469';
    if (lines[2]) lines[2].textContent = 'Email: ebanisteriacad@gmail.com';
  }

  function fixFacebook() {
    document.title = 'Ebanister\u00edaCAD - Facebook';
    var source = document.querySelector('#facebook .fb-link');
    if (source) source.textContent = 'P\u00e1gina de Facebook de Ebanister\u00edaCAD';
    var desc = document.querySelectorAll('#facebook .product-card p');
    for (var i = 0; i < desc.length; i++) {
      desc[i].textContent = 'Espacio listo para imagen y descripci\u00f3n del producto publicado en Facebook.';
    }
  }

  function bindQuoteForm() {
    var quoteForm = document.getElementById('quoteForm');
    if (!quoteForm) return;
    quoteForm.addEventListener('submit', function (e) {
      e.preventDefault();
      alert('\u00a1Gracias! Te contactaremos pronto.');
    });
  }

  var page = currentPage();
  renderHeader(page);
  normalizeFooter();

  if (page === 'index.html') fixIndex();
  if (page === 'about.html') fixAbout();
  if (page === 'quote.html') fixQuote();
  if (page === 'designs.html') fixDesigns();
  if (page === 'pricing.html') fixPricing();
  if (page === 'contact.html') fixContact();
  if (page === 'facebook.html') fixFacebook();

  bindQuoteForm();
})();