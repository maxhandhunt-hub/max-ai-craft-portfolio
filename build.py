"""Pre-render editable JSON content into a static, SEO-readable page."""
from pathlib import Path
from html import escape
import json

ROOT = Path(__file__).parent
content = json.loads((ROOT / 'data/content.json').read_text(encoding='utf-8'))
slides = json.loads((ROOT / 'data/slides.json').read_text(encoding='utf-8'))
skills = json.loads((ROOT / 'data/skills.json').read_text(encoding='utf-8'))
site = json.loads((ROOT / 'data/site.json').read_text(encoding='utf-8'))
service_visuals = json.loads((ROOT / 'data/service-visuals.json').read_text(encoding='utf-8'))


def e(value):
    return escape(str(value or ''), quote=True)


def tag(name, body='', **attrs):
    attr = ' '.join(f'{key.replace("_", "-")}="{e(value)}"' for key, value in attrs.items() if value is not None)
    return f'<{name}{(" " + attr) if attr else ""}>{body}</{name}>'


def p(text, cls=None):
    return tag('p', e(text), **({'class': cls} if cls else {}))


def section_head(number, label, title, text=''):
    return f'<div class="section-head wrap"><span class="eyebrow">{number} / {e(label)}</span><h2>{e(title)}</h2>{p(text) if text else ""}</div>'


services = ''
assert len(service_visuals) == len(content['services']) == 7
for i, item in enumerate(content['services']):
    visual = service_visuals[i]
    assert (ROOT / visual['src']).is_file(), visual['src']
    detail = ''
    if i == 0:
        detail = p(content['neuroavatar']['intro'])
    elif i == 1:
        detail = p(content['aiPhotoshoot']['intro'])
    services += f'''<article class="service-slide" data-service="{i}">
      <div class="service-copy"><span class="eyebrow">{e(item['number'])} / {e(item['label'])}</span><h3>{e(item['title'])}</h3>
      {p(item['description'], 'lead')}{detail}<div class="service-result"><strong>Что получает клиент</strong>{p(item['result'])}</div>
      <a class="text-link" href="#contacts">{e(item['cta'])} <span aria-hidden="true">↗</span></a></div>
      <div class="service-media service-stage" data-visual="{e(visual['id'])}" aria-hidden="true"><div class="service-image-wrap"><img src="{e(visual['src'])}" width="{visual['width']}" height="{visual['height']}" alt="" loading="lazy" decoding="async"></div><div class="service-fx service-fx-a"></div><div class="service-fx service-fx-b"></div><div class="service-fx service-fx-c"></div></div>
    </article>'''


cases = ''
for item in content['projects']:
    if not item.get('featured', False):
        continue
    cases += f'''<article class="case-card" data-project="{e(item['slug'])}">
      <div class="case-media"><img src="{e(item['cover'])}" width="{item.get('coverWidth', 1280)}" height="{item.get('coverHeight', 720)}" loading="lazy" alt="Иллюстрация формата {e(item['title'])}"></div>
      <div class="case-body"><span class="eyebrow">{e(item['category'])} · {e(item['kind'])}</span><h3>{e(item['title'])}</h3>
      {p(item['summary'])}<dl><div><dt>Задача</dt><dd>{e(item['task'])}</dd></div><div><dt>Состав работы</dt><dd>{e(item['solution'])}</dd></div></dl>
      <button class="text-link project-open" type="button" data-project="{e(item['slug'])}">Подробнее <span aria-hidden="true">↗</span></button></div>
    </article>'''


portfolio = ''
for i, slide in enumerate(slides):
    detail = skills.get(str(slide['id']), {})
    title = detail.get('title') or slide['title']
    description = detail.get('description') or slide['subtitle']
    portfolio += f'''<article class="portfolio-card" data-project="slide-{i:02}"><button class="portfolio-open project-open" type="button" data-project="slide-{i:02}" aria-label="Открыть слайд: {e(title)}">
      <span class="portfolio-media"><img src="{e(slide['thumb'])}" width="337" height="600" loading="lazy" alt="Слайд {e(title)}"></span>
      <span class="portfolio-info"><small>{e(slide['number'])} / AI Skills</small><strong>{e(title)}</strong><span>{e(description)}</span><b>Открыть слайд ↗</b></span></button></article>'''


process = ''.join(f'''<article class="process-step"><span class="step-num">{i+1:02}</span><div><h3>{e(x['title'])}</h3>{p(x['description'])}</div></article>''' for i,x in enumerate(content['process']))

trust = ''.join(f'<article class="trust-item"><h3>{e(x["title"])}</h3>{p(x["text"])}</article>' for x in content['trust'])
deliverables = ''.join(f'<li><strong>{e(x["title"])}</strong><span>{e(x["text"])}</span></li>' for x in content['deliverables'])
audiences = ''.join(f'<span>{e(x)}</span>' for x in content['audiences'])

packages = ''
for x in content['packages']:
    includes = x.get('includes', [])
    if isinstance(includes, list): includes_html = '<ul>' + ''.join(tag('li', e(a)) for a in includes) + '</ul>'
    else: includes_html = p(includes)
    packages += f'''<article class="package-card"><span class="eyebrow">{e(x['label'])}</span><h3>{e(x['title'])}</h3><p class="package-audience"><strong>Для кого</strong> {e(x['audience'])}</p><div><strong>Что входит</strong>{includes_html}</div><p><strong>Результат</strong> {e(x['result'])}</p><a class="text-link" href="#contacts">{e(x['cta'])} ↗</a></article>'''

faq = ''.join(f'<details><summary>{e(x["question"])}</summary>{p(x["answer"])}</details>' for x in content['faq'])
start_steps = ''.join(f'<li><strong>{e(x["title"])}</strong><span>{e(x["text"])}</span></li>' for x in content['whatToSend'])
fit = ''.join(f'<article><h3>{e(x["title"])}</h3><ul>{"".join(tag("li",e(a)) for a in x["items"])}</ul></article>' for x in content['fit'])
before_after = ''.join(f'<article><h3>{e(x["title"])}</h3>{p(x["text"].replace(x["title"], "", 1))}</article>' for x in content['beforeAfter'])
service_details = ''
for key, title in [('neuroavatar','Нейроаватар'),('aiPhotoshoot','AI-фотосессия')]:
    item = content[key]
    service_details += f'<article><span class="eyebrow">Подробнее об услуге</span><h3>{e(title)}</h3>{p(item["intro"])}'
    for detail in item['details']:
        service_details += f'<div><h4>{e(detail["heading"])}</h4>{p(detail["text"].replace(detail["heading"],"",1))}</div>'
    service_details += '</article>'

qr_html = (f'''<div class="qr-box"><a href="{e(site['telegram'])}" target="_blank" rel="noopener noreferrer"><img src="{e(site['telegramQr'])}" width="947" height="1280" loading="lazy" alt="QR-код Telegram Максима Лихачева"></a><span>Сканируйте, чтобы открыть Telegram<br>{e(site['telegramLabel'])}</span></div>''' if site.get('telegramQr') else f'''<div class="contact-direct"><span class="eyebrow">Telegram</span><a href="{e(site['telegram'])}" target="_blank" rel="noopener noreferrer">{e(site['telegramLabel'])} ↗</a></div>''')

page = f'''<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>MAX AI CRAFT — Максим Лихачев · AI-портфолио и услуги</title>
<meta name="description" content="AI-упаковка для личного бренда, услуг и контента: нейроаватары, AI-фотосессии, лендинги, визуалы, тексты и автоматизация. Максим Лихачев.">
<link rel="canonical" href="{e(site["domain"])}"><meta property="og:type" content="website"><meta property="og:title" content="MAX AI CRAFT — AI-портфолио Максима Лихачева"><meta property="og:description" content="AI-упаковка для личного бренда, услуг и контента."><meta property="og:url" content="{e(site["domain"])}"><meta property="og:image" content="{e(site["domain"])}assets/social/og-light.png">
<link rel="icon" href="assets/favicon/favicon.svg" type="image/svg+xml"><link rel="preload" href="assets/profile/photo.jpg" as="image"><link rel="preload" href="assets/3d/neural-core.webp" as="image">
<link rel="stylesheet" href="css/site.css"><link rel="stylesheet" href="css/3d.css"><link rel="stylesheet" href="css/service-3d.css"><script src="js/vendor/gsap.min.js" defer></script><script src="js/vendor/ScrollTrigger.min.js" defer></script><script type="module" src="js/main.js"></script></head>
<body><a class="skip-link" href="#main">Перейти к содержанию</a>
<header class="site-header" id="site-header"><nav class="nav-shell" aria-label="Главная навигация"><a class="brand" href="#home"><span class="brand-mark">M<span>✦</span></span><span>MAX AI CRAFT<small>Максим Лихачев</small></span></a><div class="nav-links" id="nav-links"><a href="#positioning">Обо мне</a><a href="#services">Услуги</a><a href="#cases">Форматы</a><a href="#portfolio">Портфолио</a><a href="#process">Процесс</a><a href="#contacts">Контакты</a></div><a class="btn btn-small nav-cta" href="#contacts">Обсудить проект <span aria-hidden="true">↗</span></a><button class="menu-toggle" id="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-menu" aria-label="Открыть меню"><span></span><span></span></button></nav><div class="nav-progress" id="nav-progress"></div><div class="mobile-menu" id="mobile-menu" hidden><a href="#positioning">Обо мне</a><a href="#services">Услуги</a><a href="#cases">Форматы</a><a href="#portfolio">Портфолио</a><a href="#process">Процесс</a><a href="#contacts">Контакты</a><a class="btn" href="#contacts">Обсудить проект ↗</a></div></header>
<main id="main">
<section class="hero chapter" id="home" aria-labelledby="hero-title"><div class="hero-stage"><div class="hero-grid wrap"><div class="hero-copy"><span class="eyebrow">MAX AI CRAFT / Максим Лихачев</span><h1 id="hero-title">{e(site["heroLead"])}<br>{e(site["heroMiddle"])} <em>{e(site["heroAccent"])}</em></h1><p>{e(site["heroText"])}</p><p class="brand-thesis">ЧЕЛОВЕК СОЗДАЁТ. <span>AI УСИЛИВАЕТ.</span></p><div class="hero-actions"><a class="btn" href="#contacts">Обсудить проект ↗</a><a class="btn btn-ghost" href="#portfolio">Смотреть работы</a></div></div><div class="hero-art" aria-label="Портрет Максима Лихачева в окружении логотипов AI-инструментов"><div class="hero-halo"></div><img class="hero-portrait" src="assets/profile/photo.jpg" width="1024" height="1024" alt="Максим Лихачев" fetchpriority="high"><img class="hero-brain" src="assets/3d/neural-core.webp" width="1200" height="1200" alt="" fetchpriority="high"><div class="orbit orbit-one" aria-hidden="true"></div><div class="orbit orbit-two" aria-hidden="true"></div><span class="tool tool-1"><img src="assets/tool-logos/chatgpt.svg" width="25" height="25" alt="" decoding="async">ChatGPT</span><span class="tool tool-2"><img src="assets/tool-logos/claude.svg" width="25" height="25" alt="" decoding="async">Claude</span><span class="tool tool-3"><img src="assets/tool-logos/gemini.svg" width="25" height="25" alt="" decoding="async">Gemini</span><span class="tool tool-4"><img src="assets/tool-logos/veo.svg" width="25" height="25" alt="Veo" decoding="async"></span><span class="tool tool-5"><img src="assets/tool-logos/heygen.svg" width="25" height="25" alt="" decoding="async">HeyGen</span><span class="tool tool-6"><img src="assets/tool-logos/codex.svg" width="25" height="25" alt="" decoding="async">Codex</span><span class="tool tool-7"><img src="assets/tool-logos/elevenlabs.svg" width="25" height="25" alt="" decoding="async">ElevenLabs</span><span class="tool tool-8"><img src="assets/tool-logos/kling.svg" width="25" height="25" alt="" decoding="async">Kling</span><span class="tool tool-9"><img src="assets/tool-logos/nanobanana.svg" width="25" height="25" alt="" decoding="async">NanoBanana</span><span class="hero-art-label">HUMAN × AI</span></div></div><div class="hero-directions wrap"><span>AI VIDEO</span><span>AI AVATARS</span><span>AI PHOTOSHOOTS</span><span>AUTOMATION</span></div><div class="scroll-cue wrap">Прокрутите, чтобы увидеть историю <span>↓</span></div></div></section>
<section class="positioning chapter" id="positioning" aria-labelledby="positioning-title"><div class="positioning-stage wrap"><span class="eyebrow">01 / Подход</span><h2 id="positioning-title">Сначала смысл.<br><em>Затем технология.</em></h2><div class="positioning-statements"><p>Помогаю экспертам, предпринимателям и малому бизнесу быстро упаковать себя, продукт или услугу с помощью AI.</p><p>От идеи и структуры — до материалов, которые можно использовать, редактировать и передавать дальше.</p><p>Тексты, визуалы, лендинг и автоматизация работают как одна понятная система.</p></div><div class="audience-tags">{audiences}</div></div></section>
<section class="services chapter" id="services" aria-labelledby="services-title">{section_head('02','Услуги','Что можно заказать сразу','Готовые форматы задач, с которыми можно обратиться без длинной подготовки.')}<div class="services-stage wrap"><div class="service-meter"><span>01</span><div><i id="service-progress"></i></div><span>07</span></div><div class="service-slides">{services}</div></div><div class="service-detail-grid wrap">{service_details}</div><div class="before-after wrap"><h3>Как меняется результат</h3><div>{before_after}</div></div></section>
<section class="capabilities chapter" id="capabilities" aria-labelledby="capabilities-title">{section_head('03','Возможности','Инструменты под задачу','От промпт-инжиниринга до мультимодального контента и рабочих процессов.')}
<div class="cap-stage wrap"><div class="cap-core"><img src="assets/3d/neural-core.webp" width="1200" height="1200" loading="lazy" alt=""><span>AI × HUMAN</span></div><div class="cap-list"><article><span>01</span><h3>Содержание</h3><p>Промпты, тексты, сценарии, исследование и структура.</p></article><article><span>02</span><h3>Визуал</h3><p>AI-фото, карточки, презентации и дизайн.</p></article><article><span>03</span><h3>Видео и аватары</h3><p>Нейроаватары, сценарии Reels / Shorts и мультимодальный контент.</p></article><article><span>04</span><h3>Системы</h3><p>Лендинги, таблицы, интеграции и автоматизация.</p></article></div></div></section>
<section class="cases chapter" id="cases" aria-labelledby="cases-title">{section_head('04','Направления работ','От задачи — к формату','Шесть направлений из v42. Карточки описывают состав работы и возможный результат; клиентские метрики не заявляются.')}
<div class="cases-window"><div class="cases-track">{cases}</div></div></section>
<section class="portfolio chapter" id="portfolio" aria-labelledby="portfolio-title"><div class="portfolio-intro wrap"><span class="eyebrow">05 / Портфолио</span><h2 id="portfolio-title">Навыки,<br><em>показанные визуально.</em></h2><p>16 оригинальных слайдов AI Skills Audit из v42. Откройте любой модуль: внутри — описание, примеры применения, инструменты и сам слайд.</p></div><div class="portfolio-grid wrap">{portfolio}</div><div class="portfolio-after wrap"><a class="btn btn-ghost" href="#contacts">Обсудить похожую задачу ↗</a></div></section>
<section class="process chapter" id="process" aria-labelledby="process-title">{section_head('06','Процесс','Понятная последовательность','От первого сообщения до передачи готовых файлов и инструкции.')}<div class="process-layout wrap"><div class="process-rail"><div class="process-rail-fill" id="process-progress"></div></div><div class="process-steps">{process}</div></div><div class="automation-visual wrap" aria-hidden="true"><img src="assets/3d/automation-core.webp" width="1200" height="800" loading="lazy" alt=""></div><div class="start-box wrap"><div><span class="eyebrow">Для старта</span><h3>Что нужно от вас</h3></div><ol>{start_steps}</ol></div></section>
<section class="experience chapter" id="experience" aria-labelledby="experience-title"><div class="experience-inner wrap"><span class="eyebrow">07 / Опыт и доверие</span><h2 id="experience-title">16+ лет<br><em>практического IT-опыта.</em></h2><p class="lead">В технической поддержке, сервисных процессах, работе с пользователями, инструкциями, заявками и рабочими системами.</p><div class="trust-grid">{trust}</div><div class="deliverables"><h3>Что остаётся у вас после проекта</h3><ul>{deliverables}</ul></div><div class="fit-grid">{fit}</div></div></section>
<section class="packages chapter" id="packages" aria-labelledby="packages-title">{section_head('08','Формат сотрудничества','Выберите точку входа','Можно начать с одной задачи или собрать полноценный мини-проект.')}<div class="packages-grid wrap">{packages}</div></section>
<section class="faq chapter" id="faq" aria-labelledby="faq-title">{section_head('09','FAQ','Частые вопросы')}<div class="faq-list wrap">{faq}</div></section>
<section class="final chapter" id="contacts" aria-labelledby="final-title"><div class="final-stage"><img class="final-portal" src="assets/3d/ai-portal.webp" width="1200" height="1200" loading="lazy" alt=""><div class="wrap final-copy"><span class="eyebrow">10 / Давайте начнём</span><div class="final-words"><span>Идея.</span><span>Система.</span><span>Результат.</span></div><h2 id="final-title">Создадим<br><em>что-то сильное.</em></h2><p>Лучше всего писать в Telegram. Также можно отправить письмо на почту.</p><div class="final-actions"><a class="btn" href="{e(site["telegram"])}" target="_blank" rel="noopener noreferrer">Обсудить проект в Telegram ↗</a><a class="btn btn-ghost" href="mailto:{e(site["email"])}">Написать на почту</a></div></div></div><div class="contact-panel wrap"><div><span class="eyebrow">Коротко о задаче</span><h3>Что написать в Telegram</h3><p>Укажите, что нужно сделать, для чего нужен результат, где он будет использоваться, есть ли референсы и в каком формате нужен итог.</p><button class="text-link" id="copy-brief" type="button">Скопировать шаблон ↗</button><p class="copy-status" id="copy-status" role="status"></p></div>{qr_html}</div></section>
</main><footer class="site-footer"><div class="wrap footer-layout"><div><strong>MAX AI CRAFT</strong><p>Максим Лихачев · AI Portfolio / Content / Automation</p></div><div><a href="mailto:{e(site["email"])}">{e(site["email"])}</a><a href="{e(site["telegram"])}" target="_blank" rel="noopener noreferrer">{e(site["telegramLabel"])}</a></div><a href="#home">Наверх ↑</a><small>© 2026 Максим Лихачев</small></div></footer>
<div class="viewer" id="viewer" role="dialog" aria-modal="true" aria-labelledby="viewer-title" hidden><div class="viewer-progress"><i id="viewer-progress"></i></div><div class="viewer-top"><span>MAX AI CRAFT / Проект</span><button id="viewer-close" type="button" aria-label="Закрыть проект">Закрыть ✕</button></div><div class="viewer-scroll" id="viewer-scroll"><div id="viewer-content"></div></div></div>
</body></html>'''

(ROOT / 'index.html').write_text(page, encoding='utf-8')
(ROOT / 'data/site-data.js').write_text('export default ' + json.dumps({'site': site, 'content': content, 'slides': slides, 'skills': skills}, ensure_ascii=False) + ';\n', encoding='utf-8')
print('Built', ROOT / 'index.html')

