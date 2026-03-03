const quoteForm = document.getElementById('quoteForm');

if (quoteForm) {
  quoteForm.addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Thank you! We will get back to you soon.');
  });
}
