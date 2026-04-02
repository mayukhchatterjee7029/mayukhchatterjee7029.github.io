const root = document.documentElement;
const menuToggle = document.querySelector('.menu-toggle');
const themeToggle = document.querySelector('.theme-toggle');
const themeToggleLabel = document.querySelector('.theme-toggle-label');
const nav = document.querySelector('.nav');
const navLinks = Array.from(document.querySelectorAll('.nav a'));
const revealElements = Array.from(document.querySelectorAll('.reveal'));
const sections = Array.from(document.querySelectorAll('main section[id]'));
const themeStorageKey = 'portfolio-theme';

const safeStorage = {
  get(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      return undefined;
    }
  },
};

const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)');

function setTheme(theme, persist = true) {
  root.dataset.theme = theme;

  if (themeToggle) {
    themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
    themeToggle.setAttribute(
      'aria-label',
      theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode',
    );
  }

  if (themeToggleLabel) {
    themeToggleLabel.textContent = theme === 'dark' ? 'Dark mode' : 'Light mode';
  }

  if (persist) {
    safeStorage.set(themeStorageKey, theme);
  }
}

const savedTheme = safeStorage.get(themeStorageKey);
const initialTheme = savedTheme || (prefersDarkMode.matches ? 'dark' : 'light');
setTheme(initialTheme, false);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
  });
}

prefersDarkMode.addEventListener('change', (event) => {
  if (!safeStorage.get(themeStorageKey)) {
    setTheme(event.matches ? 'dark' : 'light', false);
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
