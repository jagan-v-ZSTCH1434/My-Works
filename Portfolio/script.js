/* ============================================================
   PORTFOLIO SCRIPT — Jagan Nath
   Features: Loader, Custom Cursor, Navbar, Typing, Scroll
   Animations, Skill Bars, Project Filter, Contact Form,
   Back to Top, Particle Canvas
============================================================ */

'use strict';

// ─── Loader ─────────────────────────────────────────────────
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  setTimeout(() => {
    loader.classList.add('hidden');
    document.body.style.overflow = 'auto';
    // Trigger initial reveal animations
    revealElements();
  }, 1200);
});

document.body.style.overflow = 'hidden';

// ─── Custom Cursor ───────────────────────────────────────────
const cursor       = document.querySelector('.cursor');
const cursorFollow = document.querySelector('.cursor-follower');
let mouseX = 0, mouseY = 0;
let followX = 0, followY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top  = mouseY + 'px';
});

// Smooth follower animation
(function animateFollower() {
  followX += (mouseX - followX) * 0.12;
  followY += (mouseY - followY) * 0.12;
  cursorFollow.style.left = followX + 'px';
  cursorFollow.style.top  = followY + 'px';
  requestAnimationFrame(animateFollower);
})();

// Hover effect on interactive elements
document.querySelectorAll('a, button, .project-card, .skill-tag, .social-icon, .filter-btn, .nav-cta')
  .forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hovered');
      cursorFollow.classList.add('hovered');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hovered');
      cursorFollow.classList.remove('hovered');
    });
  });

// ─── Navbar ──────────────────────────────────────────────────
const navbar = document.getElementById('navbar');
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  // Scrolled class
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Active link highlight
  let current = '';
  sections.forEach(sec => {
    const top = sec.offsetTop - 100;
    if (window.scrollY >= top) current = sec.getAttribute('id');
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${current}`) {
      link.classList.add('active');
    }
  });

  // Back-to-top visibility
  const btt = document.getElementById('backToTop');
  if (window.scrollY > 500) {
    btt.classList.add('visible');
  } else {
    btt.classList.remove('visible');
  }

  // Reveal on scroll
  revealElements();

  // Animate skill bars when skills section is visible
  animateSkillBars();
});

// Smooth scroll for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
      // Close mobile menu if open
      closeMobileMenu();
    }
  });
});

// ─── Hamburger / Mobile Menu ─────────────────────────────────
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
let menuOpen = false;

function closeMobileMenu() {
  menuOpen = false;
  mobileMenu.classList.remove('open');
  hamburger.classList.remove('active');
}

hamburger.addEventListener('click', () => {
  menuOpen = !menuOpen;
  if (menuOpen) {
    mobileMenu.classList.add('open');
    hamburger.classList.add('active');
  } else {
    closeMobileMenu();
  }
});

// Hamburger animation
const hLines = hamburger.querySelectorAll('span');
hamburger.addEventListener('click', () => {
  if (menuOpen) {
    hLines[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    hLines[1].style.opacity = '0';
    hLines[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    hLines[0].style.transform = '';
    hLines[1].style.opacity = '';
    hLines[2].style.transform = '';
  }
});

// ─── Typing Animation ────────────────────────────────────────
const typedEl = document.getElementById('typedText');
const roles   = [
  'Full Stack Developer',
  'UI/UX Enthusiast',
  'React Developer',
  'Problem Solver',
  'Open Source Contributor',
];

let roleIndex  = 0;
let charIndex  = 0;
let isDeleting = false;
let typingDelay;

function type() {
  const current = roles[roleIndex];

  if (isDeleting) {
    typedEl.textContent = current.slice(0, charIndex - 1);
    charIndex--;
  } else {
    typedEl.textContent = current.slice(0, charIndex + 1);
    charIndex++;
  }

  let speed = isDeleting ? 60 : 100;

  if (!isDeleting && charIndex === current.length) {
    speed = 1800;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    roleIndex = (roleIndex + 1) % roles.length;
    speed = 400;
  }

  typingDelay = setTimeout(type, speed);
}

// Start typing after loader
setTimeout(type, 1600);

// ─── Scroll Reveal ───────────────────────────────────────────
function revealElements() {
  const revealItems = document.querySelectorAll(
    '.reveal-up, .reveal-left, .reveal-right'
  );

  revealItems.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 80) {
      el.classList.add('visible');
    }
  });
}

// ─── Skill Bars ──────────────────────────────────────────────
let skillsAnimated = false;

function animateSkillBars() {
  if (skillsAnimated) return;
  const skillSection = document.getElementById('skills');
  if (!skillSection) return;

  const rect = skillSection.getBoundingClientRect();
  if (rect.top < window.innerHeight - 100) {
    skillsAnimated = true;
    document.querySelectorAll('.skill-item').forEach(item => {
      const level = item.getAttribute('data-level');
      const fill  = item.querySelector('.skill-fill');
      if (fill && level) {
        setTimeout(() => {
          fill.style.width = level + '%';
        }, 200);
      }
    });
  }
}

// ─── Project Filter ──────────────────────────────────────────
const filterBtns  = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.getAttribute('data-filter');

    projectCards.forEach(card => {
      const category = card.getAttribute('data-category');
      if (filter === 'all' || category === filter) {
        card.classList.remove('hide');
        card.style.animation = 'none';
        void card.offsetWidth;
        card.style.animation = '';
        card.style.opacity = '1';
        card.style.transform = 'none';
      } else {
        card.style.opacity = '0';
        card.style.transform = 'scale(0.92)';
        setTimeout(() => card.classList.add('hide'), 300);
      }
    });
  });
});

// Smooth project card transition
projectCards.forEach(card => {
  card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
});

// ─── Contact Form ────────────────────────────────────────────
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const btn = contactForm.querySelector('button[type="submit"]');
  btn.textContent = 'Sending...';
  btn.disabled = true;

  // Simulate async send
  setTimeout(() => {
    btn.innerHTML = 'Send Message <i class="fas fa-paper-plane"></i>';
    btn.disabled = false;
    formSuccess.classList.add('show');
    contactForm.reset();

    setTimeout(() => {
      formSuccess.classList.remove('show');
    }, 4000);
  }, 1500);
});

// ─── Back To Top ─────────────────────────────────────────────
document.getElementById('backToTop').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ─── Active Nav on page load ─────────────────────────────────
window.dispatchEvent(new Event('scroll'));

// ─── Stat Counter Animation ──────────────────────────────────
function animateCounters() {
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = parseInt(el.textContent) || 0;
    if (el.dataset.counted) return;
    el.dataset.counted = true;
    let count = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      count = Math.min(count + step, target);
      el.textContent = count + '+';
      if (count >= target) clearInterval(timer);
    }, 40);
  });
}

// Trigger counter when about section is visible
const aboutObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) animateCounters();
  });
}, { threshold: 0.3 });

const aboutSection = document.getElementById('about');
if (aboutSection) aboutObs.observe(aboutSection);

// Trigger exp counter too
const expObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const full = el.textContent;
    const target = parseInt(full) || 0;
    if (el.dataset.counted) return;
    el.dataset.counted = true;
    let count = 0;
    const timer = setInterval(() => {
      count = Math.min(count + 1, target);
      el.textContent = count + '+';
      if (count >= target) clearInterval(timer);
    }, 80);
  });
}, { threshold: 0.5 });

document.querySelectorAll('.exp-num').forEach(el => expObs.observe(el));

// ─── Particle Canvas ─────────────────────────────────────────
(function initParticles() {
  const canvas = document.createElement('canvas');
  canvas.id = 'particles-canvas';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let particles = [];
  const PARTICLE_COUNT = 60;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x     = Math.random() * canvas.width;
      this.y     = Math.random() * canvas.height;
      this.size  = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.alpha  = Math.random() * 0.5 + 0.1;
      this.color  = Math.random() > 0.5 ? '108,99,255' : '255,101,132';
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width ||
          this.y < 0 || this.y > canvas.height) {
        this.reset();
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle());
  }

  // Connect nearby particles
  function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(108,99,255,${0.08 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    connectParticles();
    requestAnimationFrame(animate);
  }

  animate();
})();

// ─── Tilt effect on project cards ────────────────────────────
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect   = card.getBoundingClientRect();
    const cx     = rect.left + rect.width  / 2;
    const cy     = rect.top  + rect.height / 2;
    const dx     = (e.clientX - cx) / (rect.width  / 2);
    const dy     = (e.clientY - cy) / (rect.height / 2);
    const tiltX  = dy * -6;
    const tiltY  = dx *  6;
    card.style.transform = `translateY(-8px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    card.style.transition = 'transform 0.05s ease';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform 0.4s ease';
  });
});
