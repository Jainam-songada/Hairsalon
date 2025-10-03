document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

    // Closing time alert functionality
    function checkClosingTime() {
        const now = new Date();
        const day = now.getDay(); // 0 = Sunday, 6 = Saturday
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const currentTime = hours * 60 + minutes;

        let closingTime;
        let openingTime;
        let closingMessage = '';

        // Saturday hours (11 AM - 2 PM)
        if (day === 6) {
            openingTime = 11 * 60; // 11 AM in minutes
            closingTime = 14 * 60; // 2 PM in minutes
        } 
        // Sunday to Friday (10 AM - 9 PM)
        else {
            openingTime = 10 * 60; // 10 AM in minutes
            closingTime = 21 * 60; // 9 PM in minutes
        }

        const alertElement = document.getElementById('closingAlert');
        const messageElement = document.getElementById('closingMessage');

        // Only show alerts during business hours
        if (currentTime < openingTime || currentTime >= closingTime) {
            alertElement.classList.add('d-none');
            alertElement.classList.remove('show');
            return;
        }

        // Calculate time until closing
        const timeUntilClosing = Math.max(0, closingTime - currentTime);

        // Show alert in last 30 minutes
        if (timeUntilClosing <= 30 && timeUntilClosing > 0) {
            if (timeUntilClosing <= 5) {
                closingMessage = `⚠️ We're closing very soon! Only ${timeUntilClosing} minute${timeUntilClosing === 1 ? '' : 's'} left.`;
                alertElement.classList.remove('alert-warning');
                alertElement.classList.add('alert-danger');
            } else {
                closingMessage = `We'll be closing in ${timeUntilClosing} minute${timeUntilClosing === 1 ? '' : 's'}.`;
                alertElement.classList.remove('alert-danger');
                alertElement.classList.add('alert-warning');
            }
            messageElement.textContent = closingMessage;
            alertElement.classList.remove('d-none');
            alertElement.classList.add('show');
        } else {
            alertElement.classList.add('d-none');
            alertElement.classList.remove('show');
        }
    }

    // Test function to simulate different times (for development)
    window.testClosingAlert = function(minutesUntilClosing) {
        const now = new Date();
        const isWeekend = now.getDay() === 6;
        const closingTime = isWeekend ? 14 * 60 : 21 * 60; // 2 PM or 9 PM
        const testTime = new Date();
        testTime.setHours(Math.floor((closingTime - minutesUntilClosing) / 60));
        testTime.setMinutes((closingTime - minutesUntilClosing) % 60);
        const originalNow = Date.now;
        Date.now = () => testTime.getTime();
        checkClosingTime();
        Date.now = originalNow;
    };

    // Check closing time every minute
    checkClosingTime();
    setInterval(checkClosingTime, 60000);

  // Initialize AOS (Animate on Scroll)
  AOS.init({
    duration: 400,
    offset: 100,
    once: true
  });

  // Service selection and total calculation functionality
  const services = document.querySelectorAll('.service-checkbox');
  const servicesTotalElement = document.getElementById('servicesTotal');

  // Function to calculate and update total
  function updateServicesTotal() {
    let total = 0;
    services.forEach(service => {
      if (service.checked) {
        const serviceCard = service.closest('.service-card');
        const price = parseInt(serviceCard.dataset.price);
        total += price;
      }
    });
    if (servicesTotalElement) {
      servicesTotalElement.textContent = total;
    }
  }

  // Add event listeners to service checkboxes
  services.forEach(service => {
    service.addEventListener('change', function() {
      updateServicesTotal();
      // Add animation to total when it changes
      servicesTotalElement.classList.add('highlight');
      setTimeout(() => {
        servicesTotalElement.classList.remove('highlight');
      }, 300);
    });
  });
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
      const price = parseInt(card.querySelector('.card-text strong').textContent.replace('₹', ''));
      selected.push({ name, price });
      total += price;
    }
  });

  let rows = '';
  if (selected.length === 0) {
    rows += `<tr><td colspan="2" class="text-center text-muted">No services selected</td></tr>`;
  } else {
    selected.forEach(item => {
      rows += `<tr class="fade-in"><td>${item.name}</td><td>₹${item.price}</td></tr>`;
    });
  }
  // Update tbody only
  const tbody = summaryTable.querySelector('tbody');
  if (tbody) tbody.innerHTML = rows;
  // Update total
  if (summaryTotal) summaryTotal.textContent = `₹${total}`;
}

// Form validation and booking details display
const form = document.querySelector('.needs-validation');
if (form) {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (form.checkValidity()) {
      // Collect form data
      const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        gender: document.querySelector('input[name="gender"]:checked')?.id || '',
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        notes: document.getElementById('notes').value,
        payment: document.getElementById('payment').value,
        services: []
      };

      // Collect selected services
      const selectedServices = document.querySelectorAll('.service-checkbox:checked');
      let totalAmount = 0;
      selectedServices.forEach(service => {
        const card = service.closest('.service-card');
        const price = parseInt(card.getAttribute('data-price'));
        totalAmount += price;
        formData.services.push({
          name: card.getAttribute('data-name'),
          price: price
        });
      });

      // Create booking details HTML
      const bookingDetailsHTML = `
        <div class="modal fade" id="bookingDetailsModal" tabindex="-1">
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Booking Details</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
              </div>
              <div class="modal-body">
                <div class="booking-details">
                  <h6 class="mb-3">Personal Information</h6>
                  <p><strong>Name:</strong> ${formData.name}</p>
                  <p><strong>Email:</strong> ${formData.email}</p>
                  <p><strong>Phone:</strong> ${formData.phone}</p>
                  <p><strong>Gender:</strong> ${formData.gender}</p>
                  
                  <h6 class="mb-3 mt-4">Appointment Details</h6>
                  <p><strong>Date:</strong> ${formData.date}</p>
                  <p><strong>Time:</strong> ${formData.time}</p>
                  <p><strong>Payment Method:</strong> ${formData.payment}</p>
                  
                  <h6 class="mb-3 mt-4">Selected Services</h6>
                  <div class="table-responsive">
                    <table class="table table-bordered">
                      <thead>
                        <tr>
                          <th>Service</th>
                          <th>Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${formData.services.map(service => `
                          <tr>
                            <td>${service.name}</td>
                            <td>₹${service.price}</td>
                          </tr>
                        `).join('')}
                        <tr class="table-primary">
                          <td><strong>Total Amount</strong></td>
                          <td><strong>₹${totalAmount}</strong></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  ${formData.notes ? `
                    <h6 class="mb-3 mt-4">Additional Notes</h6>
                    <p>${formData.notes}</p>
                  ` : ''}
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="button" class="btn btn-primary" onclick="printBookingDetails()">Print</button>
              </div>
            </div>
          </div>
        </div>
      `;

      // Remove existing modal if any
      const existingModal = document.getElementById('bookingDetailsModal');
      if (existingModal) {
        existingModal.remove();
      }

      // Add modal to document
      document.body.insertAdjacentHTML('beforeend', bookingDetailsHTML);

      // Show modal
      const modal = new bootstrap.Modal(document.getElementById('bookingDetailsModal'));
      modal.show();

      // Show success toast
      const toastEl = document.getElementById('successToast');
      if (toastEl) {
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
      }

      // Reset form after showing details
      setTimeout(() => {
        form.reset();
        updateSummary();
      }, 2000);
    }
    form.classList.add('was-validated');
  });
}

// Function to print booking details
function printBookingDetails() {
  const modalBody = document.querySelector('.booking-details').cloneNode(true);
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Booking Details - Print</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      <style>
        body { padding: 20px; }
        @media print {
          .booking-details { margin: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h3 class="text-center mb-4">Modern Hair Salon - Booking Details</h3>
        ${modalBody.outerHTML}
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.print();
  }, 500);
}
});
