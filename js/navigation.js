const menuButton = document.querySelector('#menu-toggle');
const menu = document.querySelector('#mobile-menu');
let previousFocus = null;

function closeMenu(returnFocus = false) {
  if (menu.hidden) return;
  menu.hidden = true;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Открыть меню');
  document.body.classList.remove('menu-open');
  if (returnFocus) (previousFocus || menuButton).focus();
}

function openMenu() {
  previousFocus = document.activeElement;
  menu.hidden = false;
  menuButton.setAttribute('aria-expanded', 'true');
  menuButton.setAttribute('aria-label', 'Закрыть меню');
  document.body.classList.add('menu-open');
  menu.querySelector('a').focus();
}

menuButton.addEventListener('click', () => menu.hidden ? openMenu() : closeMenu(true));
document.addEventListener('keydown', (event) => {
  if (menu.hidden) return;
  if (event.key === 'Escape') { closeMenu(true); return; }
  if (event.key !== 'Tab') return;
  const focusables = [menuButton, ...menu.querySelectorAll('a')];
  const first = focusables[0], last = focusables.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});

function scrollToSection(id) {
  const section = document.getElementById(id);
  if (!section) return;
  closeMenu();
  const top = window.scrollY + section.getBoundingClientRect().top - 96;
  window.scrollTo({top: Math.max(0, top), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
  history.replaceState(history.state, '', `#${id}`);
}

document.querySelectorAll('a[href^="#"]:not(.skip-link)').forEach(link => {
  link.addEventListener('click', event => {
    const id = link.hash.slice(1);
    if (!document.getElementById(id)) return;
    event.preventDefault();
    scrollToSection(id);
  });
});

document.querySelector('#copy-brief').addEventListener('click', async () => {
  const message = 'Здравствуйте. Хочу обсудить задачу:\n\n1. Что нужно сделать:\n2. Для чего нужен результат:\n3. Где будет использоваться:\n4. Есть ли примеры / референсы:\n5. В каком формате нужен итог:';
  const status = document.querySelector('#copy-status');
  try { await navigator.clipboard.writeText(message); status.textContent = 'Шаблон скопирован.'; }
  catch { status.textContent = 'Не удалось скопировать. Напишите эти пять пунктов в Telegram.'; }
});

export function initNavigation() {
  const chapters = [...document.querySelectorAll('main > section[id]')];
  const links = [...document.querySelectorAll('.nav-links a')];
  const progress = document.querySelector('#nav-progress');
  const update = () => {
    const limit = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    progress.style.width = `${Math.min(100, scrollY / limit * 100)}%`;
    let active = chapters[0]?.id;
    for (const section of chapters) if (section.getBoundingClientRect().top <= innerHeight * .35) active = section.id;
    links.forEach(link => {
      const isActive = link.hash === `#${active}`;
      link.classList.toggle('is-active', isActive);
      if (isActive) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
  };
  addEventListener('scroll', update, {passive:true});
  addEventListener('resize', update, {passive:true});
  update();
  if (location.hash && !location.hash.startsWith('#project/')) {
    const id = location.hash.slice(1);
    requestAnimationFrame(() => setTimeout(() => scrollToSection(id), 150));
  }
}
