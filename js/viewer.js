import siteData from '../data/site-data.js';

const root = document.querySelector('#viewer');
const scroller = document.querySelector('#viewer-scroll');
const content = document.querySelector('#viewer-content');
const closeButton = document.querySelector('#viewer-close');
const progress = document.querySelector('#viewer-progress');
const projects = siteData.content.projects;
const slides = siteData.slides;
let active = null;
let opener = null;

const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const block = (title, value) => value ? `<section><h3>${esc(title)}</h3><p>${esc(value)}</p></section>` : '';
const list = (title, values) => Array.isArray(values) && values.length ? `<section><h3>${esc(title)}</h3><ul>${values.map(x => `<li>${esc(x)}</li>`).join('')}</ul></section>` : '';

function render(slug) {
  const project = projects.find(item => item.slug === slug);
  if (project) {
    const index = projects.indexOf(project);
    const next = projects[(index + 1) % projects.length];
    content.innerHTML = `<div class="viewer-hero"><div><span class="eyebrow">${esc(project.category)} / ${esc(project.kind)}</span><h2 id="viewer-title">${esc(project.title)}</h2><p>${esc(project.summary)}</p></div><img src="${esc(project.cover)}" width="${Number(project.coverWidth) || 1280}" height="${Number(project.coverHeight) || 720}" alt="Иллюстрация формата ${esc(project.title)}"></div>
      <div class="viewer-detail">${block('Задача',project.task)}${block('Состав работы',project.solution)}${block('Инструменты',project.tools)}${block('Применение',project.usage)}${block('Что будет передано',project.deliverables)}</div>
    <div class="viewer-next"><a class="btn" href="${esc(siteData.site.telegram)}" target="_blank" rel="noopener noreferrer">Обсудить похожую задачу ↗</a><button type="button" data-next="${esc(next.slug)}">Следующий формат →</button><button type="button" data-close>Вернуться к разделу</button></div>`;
    return true;
  }
  const match = slug.match(/^slide-(\d{2})$/);
  if (!match) return false;
  const slide = slides[Number(match[1])];
  if (!slide) return false;
  const skill = siteData.skills[String(slide.id)] || {};
  const img = slide.file.replace('assets/slides/', 'assets/slides/full-webp/').replace(/\.png$/i,'.webp');
  const next = `slide-${String((Number(match[1])+1)%slides.length).padStart(2,'0')}`;
  content.innerHTML = `<div class="viewer-hero"><div><span class="eyebrow">AI Skills Audit / ${esc(slide.number)}</span><h2 id="viewer-title">${esc(skill.title || slide.title)}</h2><p>${esc(skill.description || slide.subtitle)}</p></div><img src="${esc(img)}" width="941" height="1672" alt="Слайд ${esc(slide.title)}"></div>
    <div class="viewer-detail">${block('О модуле',skill.description)}${list('Примеры применения',skill.examples)}${list('Инструменты',skill.tools)}${list('Результат',skill.results)}</div>
    <div class="viewer-next"><a class="btn" href="${esc(siteData.site.telegram)}" target="_blank" rel="noopener noreferrer">Обсудить проект ↗</a><button type="button" data-next="${next}">Следующий слайд →</button><button type="button" data-close>Вернуться к портфолио</button></div>`;
  return true;
}

function lock() {
  const width = innerWidth - document.documentElement.clientWidth;
  document.body.style.setProperty('--scrollbar', `${width}px`);
  document.body.classList.add('body-locked');
}
function unlock() {
  document.body.classList.remove('body-locked');
  document.body.style.removeProperty('--scrollbar');
}
function open(slug, push = true, source = null) {
  if (!render(slug)) return false;
  if (!active) opener = source || document.activeElement;
  active = slug;
  root.hidden = false;
  lock();
  scroller.scrollTop = 0;
  progress.style.width = '0%';
  closeButton.focus();
  if (push) history.pushState({viewer:slug}, '', `#project/${slug}`);
  return true;
}
function close(restore = true) {
  if (!active) return;
  content.querySelectorAll('video').forEach(video => { video.pause(); video.removeAttribute('src'); video.load(); });
  active = null;
  root.hidden = true;
  unlock();
  if (restore) {
    const target = opener?.isConnected ? opener : document.querySelector('.portfolio-open');
    if (target && !opener) document.querySelector('#portfolio').scrollIntoView();
    target?.focus();
  }
}
function requestClose() {
  if (!active) return;
  if (history.state?.viewer) history.back();
  else { close(); history.replaceState(null, '', '#portfolio'); }
}

document.addEventListener('click', event => {
  const trigger = event.target.closest('.project-open');
  if (trigger) { open(trigger.dataset.project, true, trigger); return; }
  if (!active) return;
  const next = event.target.closest('[data-next]');
  if (next) { if (open(next.dataset.next, false)) history.replaceState({viewer:next.dataset.next}, '', `#project/${next.dataset.next}`); return; }
  if (event.target.closest('[data-close]')) { requestClose(); return; }
});
closeButton.addEventListener('click', requestClose);
document.addEventListener('keydown', event => {
  if (!active) return;
  if (event.key === 'Escape') { event.preventDefault(); requestClose(); return; }
  if (event.key !== 'Tab') return;
  const focusables = [...root.querySelectorAll('button,a[href]')].filter(el => el.getClientRects().length);
  const first = focusables[0], last = focusables.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
scroller.addEventListener('scroll', () => {
  const max = Math.max(1, scroller.scrollHeight - scroller.clientHeight);
  progress.style.width = `${scroller.scrollTop / max * 100}%`;
}, {passive:true});
addEventListener('popstate', () => {
  const slug = location.hash.startsWith('#project/') ? location.hash.slice(9) : null;
  if (slug) open(slug, false); else close();
});

export function initViewer() {
  const slug = location.hash.startsWith('#project/') ? location.hash.slice(9) : null;
  if (slug) open(slug, false);
}
