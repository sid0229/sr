document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // 1. Interactive Count-Up Animation (600ms, eased)
  initCountUps();

  // 2. Scroll Entrance Observer with Staggered Delays
  initScrollAnimations();

  // 3. Review Filters & Sorting Logic
  initReviewFilters();

  // 4. Interactive Elements (Helpful counter buttons, CTAs)
  initInteractiveElements();

  // 5. Horizontal Tab Navigation Logic
  initTabs();
});

/**
 * Animates the stats row numbers from zero to their target values
 */
function initCountUps() {
  const countUpElements = document.querySelectorAll('.count-up');
  const duration = 600; // 600ms duration
  const frameRate = 1000 / 60; // 60fps
  const totalFrames = Math.round(duration / frameRate);

  countUpElements.forEach(el => {
    const target = parseFloat(el.getAttribute('data-target'));
    const isDecimal = el.id === 'stat-rating';
    let frame = 0;

    const easeOutQuad = (t) => t * (2 - t);

    const animate = () => {
      frame++;
      const progress = easeOutQuad(frame / totalFrames);
      const currentValue = progress * target;

      if (isDecimal) {
        el.textContent = currentValue.toFixed(1);
      } else {
        el.textContent = Math.floor(currentValue);
      }

      if (frame < totalFrames) {
        requestAnimationFrame(animate);
      } else {
        el.textContent = isDecimal ? target.toFixed(1) : target;
      }
    };

    animate();
  });
}

/**
 * Sets up IntersectionObserver for fade-and-rise entrance transitions
 * programmatically staggering the inner children of grids.
 */
function initScrollAnimations() {
  const options = {
    root: null,
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        
        // Stagger inner grid children programmatically
        if (entry.target.id === 'snapshot') {
          staggerGridItems('.snap-card');
        } else if (entry.target.id === 'similar-schools') {
          staggerGridItems('.similar-card');
        } else if (entry.target.id === 'compensation') {
          staggerGridItems('.benefit-item');
        }
        
        obs.unobserve(entry.target);
      }
    });
  }, options);

  // Observe sections
  document.querySelectorAll('.scroll-fade-in, #snapshot, #compensation, #similar-schools').forEach(sec => {
    if (!sec.classList.contains('scroll-fade-in')) {
      sec.classList.add('scroll-fade-in');
    }
    observer.observe(sec);
  });

  function staggerGridItems(selector) {
    const items = document.querySelectorAll(selector);
    items.forEach((item, index) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(12px)';
      item.style.transition = 'opacity 500ms cubic-bezier(0.16, 1, 0.3, 1), transform 500ms cubic-bezier(0.16, 1, 0.3, 1)';
      item.style.transitionDelay = `${index * 50}ms`;
      
      requestAnimationFrame(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      });
    });
  }
}

/**
 * Logic to filter and sort reviews dynamically in the DOM
 */
function initReviewFilters() {
  const chips = document.querySelectorAll('.filter-chips .chip');
  const reviewsContainer = document.getElementById('reviews-list-container');
  
  if (!reviewsContainer) return;

  const originalReviews = Array.from(reviewsContainer.querySelectorAll('.review-card'));

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const filterVal = chip.getAttribute('data-filter');
      
      originalReviews.forEach(card => {
        card.style.display = 'block';
      });

      let workingSet = [...originalReviews];

      if (filterVal === 'current') {
        workingSet.forEach(card => {
          if (card.getAttribute('data-status') !== 'current') {
            card.style.display = 'none';
          }
        });
        workingSet = workingSet.filter(card => card.getAttribute('data-status') === 'current');
      } else if (filterVal === 'former') {
        workingSet.forEach(card => {
          if (card.getAttribute('data-status') !== 'former') {
            card.style.display = 'none';
          }
        });
        workingSet = workingSet.filter(card => card.getAttribute('data-status') === 'former');
      }

      if (filterVal === 'highest') {
        workingSet.sort((a, b) => {
          return parseInt(b.getAttribute('data-rating')) - parseInt(a.getAttribute('data-rating'));
        });
      } else if (filterVal === 'recent') {
        workingSet.sort((a, b) => {
          return new Date(b.getAttribute('data-date')) - new Date(a.getAttribute('data-date'));
        });
      } else if (filterVal === 'all' || filterVal === 'current' || filterVal === 'former') {
        workingSet.sort((a, b) => {
          return originalReviews.indexOf(a) - originalReviews.indexOf(b);
        });
      }

      // Re-append sorted cards into DOM
      workingSet.forEach(card => {
        if (card.style.display !== 'none') {
          reviewsContainer.appendChild(card);
        }
      });

      // Quick visual feedback transition
      reviewsContainer.style.opacity = '0.3';
      setTimeout(() => {
        reviewsContainer.style.opacity = '1';
        reviewsContainer.style.transition = 'opacity 200ms ease';
      }, 50);
    });
  });
}

/**
 * Attaches events to review preview CTAs and helpful voting mechanisms
 */
function initInteractiveElements() {
  const helpfulBtns = document.querySelectorAll('.btn-helpful');
  helpfulBtns.forEach(btn => {
    let voted = false;
    btn.addEventListener('click', () => {
      const countEl = btn.querySelector('.helpful-count');
      let count = parseInt(countEl.textContent);

      if (!voted) {
        count++;
        voted = true;
        btn.style.backgroundColor = 'var(--light-green)';
        btn.style.color = 'var(--primary-green)';
        btn.style.borderColor = 'var(--primary-green)';
        const icon = btn.querySelector('.helpful-icon');
        if (icon) icon.style.color = 'var(--primary-green)';
      } else {
        count--;
        voted = false;
        btn.style.backgroundColor = 'var(--surface)';
        btn.style.color = 'var(--ink-muted)';
        btn.style.borderColor = 'var(--border-color)';
        const icon = btn.querySelector('.helpful-icon');
        if (icon) icon.style.color = 'var(--ink-muted)';
      }

      countEl.textContent = count;
    });
  });

  const writeReviewBtn = document.getElementById('write-review-btn');
  const saveSchoolBtn = document.getElementById('save-school-btn');
  const sidebarCtaBtn = document.getElementById('sidebar-cta-btn');

  if (writeReviewBtn) {
    writeReviewBtn.addEventListener('click', () => {
      alert('Review submission wizard initiated: Step 1 (Role details)');
    });
  }

  if (sidebarCtaBtn) {
    sidebarCtaBtn.addEventListener('click', () => {
      alert('Review submission wizard initiated: Step 1 (Role details)');
    });
  }

  if (saveSchoolBtn) {
    let saved = false;
    saveSchoolBtn.addEventListener('click', () => {
      if (!saved) {
        saved = true;
        saveSchoolBtn.innerHTML = '<i data-lucide="bookmark-check" class="btn-icon"></i> Saved';
        saveSchoolBtn.style.backgroundColor = 'var(--light-green)';
        saveSchoolBtn.style.color = 'var(--primary-green)';
        saveSchoolBtn.style.borderColor = 'var(--primary-green)';
      } else {
        saved = false;
        saveSchoolBtn.innerHTML = '<i data-lucide="bookmark" class="btn-icon"></i> Save school';
        saveSchoolBtn.style.backgroundColor = 'var(--surface)';
        saveSchoolBtn.style.color = 'var(--ink)';
        saveSchoolBtn.style.borderColor = 'var(--border-color)';
      }
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    });
  }
}

/**
 * Handles horizontal tab switching logic and active styling
 */
function initTabs() {
  const tabsContainer = document.querySelector('.app-tabs-container');
  const tabPills = document.querySelectorAll('.tab-pill');
  const tabSections = document.querySelectorAll('.tab-section');

  if (!tabPills.length || !tabSections.length) return;

  tabPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const targetId = pill.getAttribute('data-target');
      const targetSection = document.getElementById(targetId);

      if (!targetSection) return;

      // 1. Update active tab pill state
      tabPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      // 2. Hide all tab sections with transition
      tabSections.forEach(sec => {
        sec.classList.remove('show');
        sec.classList.remove('active');
      });

      // 3. Show targeted section with fade-rise animation
      targetSection.classList.add('active');
      
      // Force reflow to ensure the transition is captured by the browser
      void targetSection.offsetWidth;
      
      targetSection.classList.add('show');

      // 4. Smooth scroll back to tabs header if scrolled past
      if (tabsContainer) {
        const headerOffset = 52; // Height of the sticky app-header
        const tabsOffsetTop = tabsContainer.offsetTop;
        
        if (window.scrollY > tabsOffsetTop - headerOffset) {
          window.scrollTo({
            top: tabsOffsetTop - headerOffset,
            behavior: 'smooth'
          });
        }
      }

      // 5. Scroll active tab pill into view horizontally without shifting the page container
      const tabsRow = pill.parentElement;
      if (tabsRow) {
        const pillLeft = pill.getBoundingClientRect().left - tabsRow.getBoundingClientRect().left + tabsRow.scrollLeft;
        const pillWidth = pill.offsetWidth;
        const containerWidth = tabsRow.offsetWidth;
        const targetScrollLeft = pillLeft - (containerWidth / 2) + (pillWidth / 2);
        
        tabsRow.scrollTo({
          left: targetScrollLeft,
          behavior: 'smooth'
        });
      }
    });
  });
}
