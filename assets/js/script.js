document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

  // Initialize AOS (Animate on Scroll)
  AOS.init({
    duration: 800,
    once: true
  });

  // Service selection and summary functionality
  const services = document.querySelectorAll('.service-checkbox');
  const summaryTable = document.getElementById('summaryTable');
  const summaryTotal = document.getElementById('summaryTotal');
  const loadingSpinner = document.querySelector('.loading-spinner');

  services.forEach(service => {
    service.addEventListener('change', updateSummary);
  });

function updateSummary() {
  let selected = [];
  let total = 0;

  services.forEach(service => {
    if (service.checked) {
      // Get service name and price from parent card
      const card = service.closest('.service-card');
      const name = card.getAttribute('data-name');
      const price = parseInt(card.getAttribute('data-price'));
      selected.push({ name, price });
      total += price;
    }
  });

  let rows = '';
  if (selected.length === 0) {
    rows += `<tr><td colspan="2" class="text-center text-muted">No services selected</td></tr>`;
  } else {
    selected.forEach(item => {
      rows += `<tr class="fade-in"><td>${item.name}</td><td>$${item.price}</td></tr>`;
    });
  }
  // Update tbody only
  const tbody = summaryTable.querySelector('tbody');
  if (tbody) tbody.innerHTML = rows;
  // Update total
  if (summaryTotal) summaryTotal.textContent = `$${total}`;
}

// Form validation and toast
const form = document.querySelector('.needs-validation');
if (form) {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (form.checkValidity()) {
      const toastEl = document.getElementById('successToast');
      if (toastEl) {
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
      }
      setTimeout(() => {
        form.reset();
        updateSummary();
      }, 2000);
    }
    form.classList.add('was-validated');
  });
}
});
