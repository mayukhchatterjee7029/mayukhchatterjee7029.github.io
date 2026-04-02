const root = document.documentElement;
const menuToggle = document.querySelector('.menu-toggle');
const themeToggle = document.querySelector('.theme-toggle');
const nav = document.querySelector('.nav');
const navLinks = Array.from(document.querySelectorAll('.nav a'));
const revealElements = Array.from(document.querySelectorAll('.reveal'));
const sections = Array.from(document.querySelectorAll('main section[id]'));

const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)');
let hasManualThemeOverride = false;

function getSystemTheme() {
  return prefersDarkMode.matches ? 'dark' : 'light';
}

function setTheme(theme) {
  root.dataset.theme = theme;

  if (themeToggle) {
    const isDark = theme === 'dark';
    themeToggle.setAttribute('aria-pressed', String(isDark));
    themeToggle.setAttribute(
      'aria-label',
      isDark ? 'Switch to light mode' : 'Switch to dark mode',
    );
  }
}

setTheme(getSystemTheme());

if (themeToggle) {
  const toggleTheme = () => {
    hasManualThemeOverride = true;
    setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
  };

  themeToggle.addEventListener('click', (e) => {
    e.preventDefault();
    toggleTheme();
  });

  themeToggle.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'Enter') {
      e.preventDefault();
      toggleTheme();
    }
  });
}

prefersDarkMode.addEventListener('change', (event) => {
  if (!hasManualThemeOverride) {
    setTheme(event.matches ? 'dark' : 'light');
  }
});

if (menuToggle && nav) {
  menuToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    if (nav && nav.classList.contains('open')) {
      nav.classList.remove('open');
      menuToggle?.setAttribute('aria-expanded', 'false');
    }
  });
});

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: '0px 0px -10% 0px',
    },
  );

  revealElements.forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index * 90, 360)}ms`;
    observer.observe(element);
  });

  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      });
    },
    {
      threshold: 0.55,
      rootMargin: '-18% 0px -50% 0px',
    },
  );

  sections.forEach((section) => navObserver.observe(section));
} else {
  revealElements.forEach((element) => element.classList.add('in-view'));
}
