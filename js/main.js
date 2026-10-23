/* ==========================================================================
   IK INTERIORS SOLUTIONS - CLIENT SCRIPTING & INTERACTION LOGIC
   ========================================================================== */

function initApp() {
  initMobileNavigation();
  initStickyHeader();
  initConsultationModal();
  initCostEstimator();
  initPortfolioFilters();
  initForms();
  initPhoneFormatting();
  initConversionTracking();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

/* --------------------------------------------------------------------------
   Mobile Navigation Drawer
   -------------------------------------------------------------------------- */
function initMobileNavigation() {
  const toggleBtn = document.querySelector('.nav-toggle-btn');
  const drawer = document.querySelector('.mobile-nav-drawer');
  const overlay = document.querySelector('.mobile-drawer-overlay');
  const closeBtn = document.querySelector('.mobile-drawer-close');

  if (!toggleBtn || !drawer || !overlay) return;

  function openDrawer() {
    drawer.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  // Close drawer on clicking internal links
  const links = drawer.querySelectorAll('.mobile-drawer-link');
  links.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });
}

/* --------------------------------------------------------------------------
   Sticky Header on Scroll
   -------------------------------------------------------------------------- */
function initStickyHeader() {
  const header = document.querySelector('.main-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.style.background = 'rgba(8, 10, 14, 0.98)';
      header.style.boxShadow = '0 10px 30px rgba(0,0,0,0.7)';
    } else {
      header.style.background = 'rgba(11, 13, 17, 0.92)';
      header.style.boxShadow = 'none';
    }
  });
}

/* --------------------------------------------------------------------------
   Consultation Modal Controller
   -------------------------------------------------------------------------- */
function initConsultationModal() {
  const modal = document.getElementById('consultationModal');
  if (!modal) return;

  const openTriggers = document.querySelectorAll('.open-consultation-modal');
  const closeBtn = modal.querySelector('.modal-close-btn');

  function openModal(servicePreselect = '') {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (servicePreselect) {
      const select = modal.querySelector('select[name="service"]');
      if (select) select.value = servicePreselect;
    }
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  openTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const service = btn.getAttribute('data-service') || '';
      openModal(service);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Modal Form Submit
  const modalForm = modal.querySelector('#modalConsultationForm');
  if (modalForm) {
    modalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = modalForm.querySelector('input[name="name"]')?.value || 'Customer';
      const phone = modalForm.querySelector('input[name="phone"]')?.value || '';
      const service = modalForm.querySelector('select[name="service"]')?.value || 'Interior Design';
      const property = modalForm.querySelector('select[name="property"]')?.value || 'Residential';

      trackConversionEvent('generate_lead', {
        event_category: 'Consultation Modal',
        service_requested: service,
        property_tier: property
      });

      showToast(`Thank you ${name}! Our team will call you shortly.`);
      closeModal();
      modalForm.reset();

      // Offer WhatsApp quick connect
      const waMsg = encodeURIComponent(
        `Hi IK Interiors, I requested a consultation for ${property} ${service}. Name: ${name}, Phone: ${phone}`
      );
      setTimeout(() => {
        window.open(`https://wa.me/917816034566?text=${waMsg}`, '_blank');
      }, 900);
    });
  }
}

/* --------------------------------------------------------------------------
   Interactive Interior Cost Estimator
   -------------------------------------------------------------------------- */
function initCostEstimator() {
  const container = document.getElementById('costEstimator');
  if (!container) return;

  const bhkOptions = container.querySelectorAll('.bhk-option');
  const priceDisplay = document.getElementById('estimatePriceDisplay');
  const waEstimateBtn = document.getElementById('waEstimateBtn');

  // Pricing matrix in INR Lakhs as requested
  const pricingData = {
    '1bhk': { price: '₹ 1 - 1.5 Lakhs', title: '1 BHK Flat' },
    '2bhk': { price: '₹ 2 - 2.5 Lakhs', title: '2 BHK Flat' },
    '3bhk': { price: '₹ 3 - 3.5 Lakhs', title: '3 BHK Flat' },
    'villa': { price: '₹ 4 - 4.5 Lakhs', title: 'Luxury Villa / 4BHK' },
    'commercial': { price: 'Based on Requirement', title: 'Office / Commercial' }
  };

  let selectedBHK = '2bhk';

  function updateEstimate() {
    const data = pricingData[selectedBHK] || pricingData['2bhk'];

    if (priceDisplay) {
      priceDisplay.textContent = data.price;
      // Adjust font size slightly if text is longer
      if (selectedBHK === 'commercial') {
        priceDisplay.style.fontSize = '1.8rem';
      } else {
        priceDisplay.style.fontSize = '2.4rem';
      }
    }

    if (waEstimateBtn) {
      const text = selectedBHK === 'commercial'
        ? encodeURIComponent(`Hi IK Interiors, I would like to inquire about interior design for an Office / Commercial space in Hyderabad (Based on Requirement). I'd like to book a site consultation.`)
        : encodeURIComponent(`Hi IK Interiors, I calculated an estimate on your website for ${data.title} (${data.price}). I'd like to book a site visit in Hyderabad.`);
      waEstimateBtn.href = `https://wa.me/917816034566?text=${text}`;
    }
  }

  bhkOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      bhkOptions.forEach(b => b.classList.remove('active'));
      opt.classList.add('active');
      selectedBHK = opt.getAttribute('data-bhk');
      updateEstimate();
    });
  });

  updateEstimate();
}

/* --------------------------------------------------------------------------
   Portfolio Filter Functionality
   -------------------------------------------------------------------------- */
function initPortfolioFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-card');

  if (!filterBtns.length || !portfolioItems.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');

      portfolioItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category');
        if (filterVal === 'all' || itemCategory === filterVal) {
          item.style.display = 'block';
          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'scale(1)';
          }, 10);
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.95)';
          setTimeout(() => {
            item.style.display = 'none';
          }, 250);
        }
      });
    });
  });
}

/* --------------------------------------------------------------------------
   Contact Form & General Forms
   -------------------------------------------------------------------------- */
function initForms() {
  const contactForm = document.getElementById('mainContactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = contactForm.querySelector('input[name="fullname"]')?.value || 'Valued Client';
      const phone = contactForm.querySelector('input[name="phone"]')?.value || '';
      const service = contactForm.querySelector('select[name="service"]')?.value || 'Interior Services';
      const location = contactForm.querySelector('input[name="location"]')?.value || 'Hyderabad';
      const budget = contactForm.querySelector('select[name="budget"]')?.value || 'Not specified';
      const message = contactForm.querySelector('textarea[name="message"]')?.value || '';

      trackConversionEvent('generate_lead', {
        event_category: 'Contact Form',
        service_requested: service,
        locality: location,
        budget_bracket: budget
      });

      showToast(`Thank you, ${name}! Your consultation request has been received.`);
      contactForm.reset();

      // Trigger pre-filled WhatsApp message
      const msg = encodeURIComponent(
        `Hi IK Interiors,\nI have submitted an enquiry from the website:\n- Name: ${name}\n- Phone: ${phone}\n- Service: ${service}\n- Locality: ${location}\n- Budget: ${budget}\n- Details: ${message}`
      );

      setTimeout(() => {
        const proceed = confirm("Would you like to send this inquiry directly to IK Interiors on WhatsApp for faster response?");
        if (proceed) {
          window.open(`https://wa.me/917816034566?text=${msg}`, '_blank');
        }
      }, 800);
    });
  }
}

/* --------------------------------------------------------------------------
   Phone Click / Copy & Toast Helper
   -------------------------------------------------------------------------- */
function initPhoneFormatting() {
  window.copyPhone = function(number) {
    navigator.clipboard.writeText(number).then(() => {
      showToast(`Copied ${number} to clipboard!`);
    }).catch(() => {
      showToast(`Call: ${number}`);
    });
  };
}

/* Toast Utility */
function showToast(message) {
  let toast = document.querySelector('.toast-msg');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-msg';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<i class="fa-solid fa-circle-check text-gold"></i> <span>${message}</span>`;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

/* --------------------------------------------------------------------------
   Analytics & Conversion Tracking Helper (Safe GA4 / GTM / Meta hooks)
   -------------------------------------------------------------------------- */
function trackConversionEvent(eventName, eventParams = {}) {
  try {
    if (typeof gtag === 'function') {
      gtag('event', eventName, eventParams);
    }
    if (window.dataLayer && Array.isArray(window.dataLayer)) {
      window.dataLayer.push({
        event: eventName,
        ...eventParams
      });
    }
  } catch (err) {
    // Non-intrusive error handling
  }
}

function initConversionTracking() {
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href') || '';
    if (href.startsWith('tel:')) {
      trackConversionEvent('contact', {
        event_category: 'Phone Call',
        event_label: href.replace('tel:', '')
      });
    } else if (href.includes('wa.me') || href.includes('whatsapp.com')) {
      trackConversionEvent('contact', {
        event_category: 'WhatsApp Click',
        event_label: href
      });
    }
  });
}

