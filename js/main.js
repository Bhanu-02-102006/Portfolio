/**
 * Portfolio Main JavaScript Engine
 * Contains particle effects, scroll reveals, active navigation, typing effects, 
 * interactive cursors, contact validation, and layout logic.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all elements and scripts
  initPreloader();
  initBackgroundParticles();
  initCursorGlow();
  initTypingEffect();
  initScrollProgress();
  initScrollspyAndReveal();
  initMobileMenu();
  initAchievementCounters();
  initContactForm();
});

/* ==========================================================================
   PRELOADER
   ========================================================================== */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      // Small timeout to ensure everything has settled visually
      setTimeout(() => {
        preloader.classList.add('fade-out');
      }, 500);
    });
  }
}

/* ==========================================================================
   BACKGROUND CANVAS PARTICLES
   ========================================================================== */
function initBackgroundParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particlesArray = [];
  const colors = ['rgba(59, 130, 246, 0.45)', 'rgba(139, 92, 246, 0.45)'];

  // Match canvas dimensions to the window
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
  }

  // Particle representation
  class Particle {
    constructor(x, y, directionX, directionY, size, color) {
      this.x = x;
      this.y = y;
      this.directionX = directionX;
      this.directionY = directionY;
      this.size = size;
      this.color = color;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.shadowBlur = 0; // reset
    }

    update() {
      // Check boundaries and invert directions if collides
      if (this.x > canvas.width || this.x < 0) {
        this.directionX = -this.directionX;
      }
      if (this.y > canvas.height || this.y < 0) {
        this.directionY = -this.directionY;
      }

      this.x += this.directionX;
      this.y += this.directionY;
      this.draw();
    }
  }

  function initParticles() {
    particlesArray = [];
    // Adjust density based on screen resolution
    const numberOfParticles = Math.floor((canvas.width * canvas.height) / 14000);
    const maxParticles = Math.min(numberOfParticles, 80); // Cap for performance

    for (let i = 0; i < maxParticles; i++) {
      let size = (Math.random() * 2) + 1;
      let x = (Math.random() * (innerWidth - size * 2) + size * 2);
      let y = (Math.random() * (innerHeight - size * 2) + size * 2);
      // Speed multiplier
      let directionX = (Math.random() * 0.4) - 0.2;
      let directionY = (Math.random() * 0.4) - 0.2;
      let color = colors[Math.floor(Math.random() * colors.length)];

      particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
    }
  }

  function connectParticles() {
    let opacityValue = 1;
    // Calculate distance threshold based on screen size
    const distanceThreshold = (canvas.width < 768) ? 80 : 120;

    for (let a = 0; a < particlesArray.length; a++) {
      for (let b = a; b < particlesArray.length; b++) {
        let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x))
          + ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
        
        if (distance < distanceThreshold * distanceThreshold) {
          opacityValue = 1 - (distance / (distanceThreshold * distanceThreshold));
          ctx.strokeStyle = `rgba(139, 92, 246, ${opacityValue * 0.12})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
          ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
          ctx.stroke();
        }
      }
    }
  }

  let animationFrameId;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < particlesArray.length; i++) {
      particlesArray[i].update();
    }
    connectParticles();
    animationFrameId = requestAnimationFrame(animate);
  }

  // Bind events and start animation
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  animate();

  // Stop rendering when page is hidden to conserve energy
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationFrameId);
    } else {
      animate();
    }
  });
}

/* ==========================================================================
   CURSOR RADIAL GLOW EFFECT
   ========================================================================== */
function initCursorGlow() {
  const glow = document.getElementById('cursor-glow');
  if (!glow) return;

  // Let glow follow the cursor
  document.addEventListener('mousemove', (e) => {
    glow.style.left = `${e.clientX}px`;
    glow.style.top = `${e.clientY}px`;
    glow.style.opacity = '1';
  });

  document.addEventListener('mouseleave', () => {
    glow.style.opacity = '0';
  });
}

/* ==========================================================================
   DYNAMIC TYPING EFFECT
   ========================================================================== */
function initTypingEffect() {
  const textEl = document.querySelector('.hero-role');
  if (!textEl) return;

  const roles = JSON.parse(textEl.getAttribute('data-roles') || '[]');
  if (roles.length === 0) return;

  let currentRoleIdx = 0;
  let currentCharIdx = 0;
  let isDeleting = false;
  let typingSpeed = 100;

  function type() {
    const currentRole = roles[currentRoleIdx];
    
    if (isDeleting) {
      // Remove character
      textEl.textContent = currentRole.substring(0, currentCharIdx - 1);
      currentCharIdx--;
      typingSpeed = 40; // delete faster
    } else {
      // Add character
      textEl.textContent = currentRole.substring(0, currentCharIdx + 1);
      currentCharIdx++;
      typingSpeed = 100; // standard writing speed
    }

    // Checking boundaries
    if (!isDeleting && currentCharIdx === currentRole.length) {
      // Pause at full word
      typingSpeed = 1800;
      isDeleting = true;
    } else if (isDeleting && currentCharIdx === 0) {
      isDeleting = false;
      // Cycle to next role
      currentRoleIdx = (currentRoleIdx + 1) % roles.length;
      typingSpeed = 500; // Pause before starting next role
    }

    setTimeout(type, typingSpeed);
  }

  // Start loop
  type();
}

/* ==========================================================================
   SCROLL PROGRESS BAR
   ========================================================================== */
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  const backToTopBtn = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    const windowScroll = document.documentElement.scrollTop || document.body.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    
    // Update progress bar
    if (bar && height > 0) {
      const scrolled = (windowScroll / height) * 100;
      bar.style.width = `${scrolled}%`;
    }

    // Toggle Back to Top visibility
    if (backToTopBtn) {
      if (windowScroll > 500) {
        backToTopBtn.classList.add('active');
      } else {
        backToTopBtn.classList.remove('active');
      }
    }

    // Sticky Header scrolled styling
    const header = document.querySelector('.header');
    if (header) {
      if (windowScroll > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }
  });

  // Smooth scroll back to top on click
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

/* ==========================================================================
   SCROLLSPY (ACTIVE LINKS) & SCROLL REVEALS
   ========================================================================== */
function initScrollspyAndReveal() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  // Options for Intersection Observer
  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -40% 0px', // check elements near mid-viewport
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // SCROLLSPY logic: update navbar link focus
        const sectionId = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, observerOptions);

  // Bind observer to sections
  sections.forEach(section => observer.observe(section));

  // Reveal animations on scroll
  const revealOptions = {
    root: null,
    rootMargin: '0px 0px -100px 0px', // trigger slightly before entering fully
    threshold: 0.1
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // trigger achievement counters if this is the achievements section
        if (entry.target.id === 'achievements') {
          triggerCounters();
        }
        // stop observing once revealed
        revealObserver.unobserve(entry.target);
      }
    });
  }, revealOptions);

  revealElements.forEach(el => revealObserver.observe(el));
}

/* ==========================================================================
   MOBILE NAVIGATION MENU
   ========================================================================== */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navMenu.classList.toggle('open');
    });

    // Close mobile menu when clicking nav links
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navMenu.classList.remove('open');
      });
    });

    // Close menu when clicking outside of the navbar
    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
        hamburger.classList.remove('open');
        navMenu.classList.remove('open');
      }
    });
  }
}

/* ==========================================================================
   ACHIEVEMENT COUNTERS
   ========================================================================== */
let countersTriggered = false;

function triggerCounters() {
  if (countersTriggered) return;
  countersTriggered = true;

  const counters = document.querySelectorAll('.counter-val');
  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute('data-target') || '0', 10);
    const speed = 1500; // Animation duration in milliseconds
    const increment = target / (speed / 16); // 16ms per frame roughly (60fps)
    let current = 0;

    const updateCount = () => {
      current += increment;
      if (current < target) {
        counter.textContent = Math.floor(current);
        requestAnimationFrame(updateCount);
      } else {
        counter.textContent = target + (counter.getAttribute('data-suffix') || '');
      }
    };

    updateCount();
  });
}

function initAchievementCounters() {
  // Handled inside scrollspy observer, but we double-check just in case the observer isn't triggered
  const section = document.getElementById('achievements');
  if (section) {
    window.addEventListener('scroll', () => {
      const rect = section.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom >= 0) {
        triggerCounters();
      }
    });
  }
}

/* ==========================================================================
   CONTACT FORM VALIDATION & INTERACTIVES
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const toastSuccess = document.getElementById('toast-success');
  const toastError = document.getElementById('toast-error');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent standard browser redirect

    // Clean active states
    if (toastSuccess) toastSuccess.style.display = 'none';
    if (toastError) toastError.style.display = 'none';

    // Retrieve input values
    const name = document.getElementById('form-name').value.trim();
    const email = document.getElementById('form-email').value.trim();
    const subject = document.getElementById('form-subject').value.trim();
    const message = document.getElementById('form-message').value.trim();

    // Basic Validation checks
    let hasError = false;
    let errorMsg = 'Please check the fields and try again.';

    if (!name) {
      hasError = true;
      errorMsg = 'Name is required.';
    } else if (!email || !validateEmail(email)) {
      hasError = true;
      errorMsg = 'Please enter a valid email address.';
    } else if (!subject) {
      hasError = true;
      errorMsg = 'Subject is required.';
    } else if (!message || message.length < 10) {
      hasError = true;
      errorMsg = 'Message must be at least 10 characters long.';
    }

    if (hasError) {
      if (toastError) {
        toastError.textContent = errorMsg;
        toastError.style.display = 'block';
      }
      return;
    }

    // Mock form submission response
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending...';

    emailjs.send("service_3sb3hbi", "template_jfnk2vk", {
    from_name: name,
    from_email: email,
    subject: subject,
    message: message
})
.then(() => {

    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;

    if (toastSuccess) {
        toastSuccess.innerHTML =
            '<i class="fa-solid fa-circle-check"></i> Thank you! Your message has been sent successfully.';
        toastSuccess.style.display = 'block';
    }

    form.reset();

})
.catch((error) => {

    submitBtn.disabled = false;
    submitBtn.innerHTML = originalBtnText;

    if (toastError) {
        toastError.innerHTML =
            '<i class="fa-solid fa-circle-xmark"></i> Failed to send message.';
        toastError.style.display = 'block';
    }

    console.error("EmailJS Error:", error);

});
  });
}

// Regex matching standard emails
function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}
