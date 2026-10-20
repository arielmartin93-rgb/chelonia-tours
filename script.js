const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');

menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  mainNav.classList.toggle('is-open', !isOpen);
});

mainNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menuToggle.setAttribute('aria-expanded', 'false');
    mainNav.classList.remove('is-open');
  });
});

const tourTabs = [...document.querySelectorAll('[role="tab"]')];
const tourPanels = [...document.querySelectorAll('[role="tabpanel"]')];
const carousels = [...document.querySelectorAll('[data-carousel]')];

function showCarouselSlide(carousel, requestedIndex) {
  const images = [...carousel.querySelectorAll('.carousel-image')];
  const dots = [...carousel.querySelectorAll('.carousel-dot')];
  const activeIndex = (requestedIndex + images.length) % images.length;

  images.forEach((image, index) => {
    const isActive = index === activeIndex;
    image.classList.toggle('is-active', isActive);
    image.setAttribute('aria-hidden', String(!isActive));
  });

  dots.forEach((dot, index) => {
    dot.setAttribute('aria-pressed', String(index === activeIndex));
  });

  carousel.dataset.activeSlide = String(activeIndex);
}

function stopCarousel(carousel) {
  window.clearInterval(carousel.autoplayTimer);
  carousel.autoplayTimer = undefined;
}

function startCarousel(carousel) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const panelIsVisible = !carousel.closest('[role="tabpanel"]').hidden;
  if (reducedMotion || !panelIsVisible || carousel.autoplayTimer) return;

  carousel.autoplayTimer = window.setInterval(() => {
    const activeIndex = Number(carousel.dataset.activeSlide || 0);
    showCarouselSlide(carousel, activeIndex + 1);
  }, 5000);
}

carousels.forEach((carousel) => {
  carousel.querySelector('[data-carousel-previous]').addEventListener('click', () => {
    showCarouselSlide(carousel, Number(carousel.dataset.activeSlide || 0) - 1);
  });
  carousel.querySelector('[data-carousel-next]').addEventListener('click', () => {
    showCarouselSlide(carousel, Number(carousel.dataset.activeSlide || 0) + 1);
  });
  carousel.querySelectorAll('.carousel-dot').forEach((dot, index) => {
    dot.addEventListener('click', () => showCarouselSlide(carousel, index));
  });
  carousel.addEventListener('mouseenter', () => stopCarousel(carousel));
  carousel.addEventListener('mouseleave', () => startCarousel(carousel));
  carousel.addEventListener('focusin', () => stopCarousel(carousel));
  carousel.addEventListener('focusout', (event) => {
    if (!carousel.contains(event.relatedTarget) && !carousel.matches(':hover')) startCarousel(carousel);
  });
});

carousels.filter((carousel) => !carousel.closest('[role="tabpanel"]').hidden).forEach(startCarousel);

function selectTourTab(selectedTab, moveFocus = false) {
  tourTabs.forEach((tab) => {
    const isSelected = tab === selectedTab;
    tab.setAttribute('aria-selected', String(isSelected));
    tab.tabIndex = isSelected ? 0 : -1;
  });

  tourPanels.forEach((panel) => {
    panel.hidden = panel.id !== selectedTab.getAttribute('aria-controls');
  });

  carousels.forEach((carousel) => stopCarousel(carousel));
  carousels.filter((carousel) => !carousel.closest('[role="tabpanel"]').hidden).forEach(startCarousel);

  if (moveFocus) selectedTab.focus();
}

tourTabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectTourTab(tab));
  tab.addEventListener('keydown', (event) => {
    let nextIndex;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % tourTabs.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tourTabs.length) % tourTabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = tourTabs.length - 1;
    if (nextIndex !== undefined) {
      event.preventDefault();
      selectTourTab(tourTabs[nextIndex], true);
    }
  });
});

const lightbox = document.querySelector('.lightbox');
const lightboxImage = lightbox.querySelector('img');
const lightboxCaption = lightbox.querySelector('p');

document.querySelectorAll('.gallery-photo').forEach((photo) => {
  photo.addEventListener('click', () => {
    lightboxImage.src = photo.dataset.full;
    lightboxImage.alt = photo.dataset.caption;
    lightboxCaption.textContent = photo.dataset.caption;
    lightbox.showModal();
  });
});

lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox) lightbox.close();
});

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.intro-kicker, .intro-grid, .experience-item, .photo-note, .section-heading, .gallery-photo, .guide-copy, .booking-inner').forEach((element) => {
  element.setAttribute('data-reveal', '');
  revealObserver.observe(element);
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    carousels.forEach(stopCarousel);
  } else {
    carousels.filter((carousel) => !carousel.closest('[role="tabpanel"]').hidden).forEach(startCarousel);
  }
});