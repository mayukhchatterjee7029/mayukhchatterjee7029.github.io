const root = document.documentElement;
const menuToggle = document.querySelector('.menu-toggle');
const themeToggle = document.querySelector('.theme-toggle');
const nav = document.querySelector('.nav');
const navLinks = Array.from(document.querySelectorAll('.nav a'));
const revealElements = Array.from(document.querySelectorAll('.reveal'));
const sections = Array.from(document.querySelectorAll('main section[id]'));

const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)');
const THEME_STORAGE_KEY = 'eunoia-theme-preference';

function getSystemTheme() {
  return prefersDarkMode.matches ? 'dark' : 'light';
}

function getSavedTheme() {
  return localStorage.getItem(THEME_STORAGE_KEY);
}

function saveTheme(theme) {
  localStorage.setItem(THEME_STORAGE_KEY, theme);
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

// Initialize theme: saved preference takes priority, otherwise use system theme
const initialTheme = getSavedTheme() || getSystemTheme();
setTheme(initialTheme);

if (themeToggle) {
  const toggleTheme = () => {
    const newTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    saveTheme(newTheme);
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

// Listen for system theme changes, but respect saved user preference
prefersDarkMode.addEventListener('change', (event) => {
  const savedTheme = getSavedTheme();
  // Only update if user hasn't set a preference
  if (!savedTheme) {
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

  // Back-to-top button visibility based on hero section scroll
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
      const backToTopObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // Show back-to-top when hero section is NOT in view (i.e., scrolled past it)
            backToTop.classList.toggle('visible', !entry.isIntersecting);
          });
        },
        {
          threshold: 0,
          rootMargin: '0px',
        },
      );
      backToTopObserver.observe(heroSection);
    }
  }
} else {
  revealElements.forEach((element) => element.classList.add('in-view'));
}
