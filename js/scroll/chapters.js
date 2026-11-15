const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
const MOTION = {scrub:.65, hero:2.6, positioning:1.35, services:.52, capability:1.35, final:1.2};

function tween(target, trigger, from, to, start = 'top 85%', end = 'bottom 20%') {
  return gsap.fromTo(target, from, { ...to, ease:'none', scrollTrigger:{trigger,start,end,scrub:MOTION.scrub}});
}

function desktop() {
  document.body.classList.add('motion-ready');
  const cleanups = [];
  const hero = gsap.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:'.hero',start:'top top',end:()=>`+=${innerHeight*MOTION.hero}`,pin:'.hero-stage',scrub:MOTION.scrub,anticipatePin:1}});
  hero.to('.hero-copy',{y:-55,scale:.94,opacity:.18,duration:1.1},0)
      .to('.hero-portrait',{xPercent:-18,yPercent:5,scale:.78,duration:1.35},.3)
      .to('.hero-brain',{xPercent:-22,yPercent:-36,scale:1.42,duration:1.3},.78)
      .fromTo('.orbit',{scale:.75,opacity:.25},{scale:1.17,opacity:.8,duration:1.1},.65)
      .fromTo('.tool',{opacity:.58,y:28,scale:.88},{opacity:1,y:0,scale:1,stagger:.12,duration:.75},1.15)
      .to('.hero-directions',{opacity:1,y:0,duration:.55},2.05)
      .to('.hero-art',{scale:.91,y:-32,duration:.7},2.3)
      .to('.hero-halo',{opacity:.3,duration:.5},2.55);

  const statements = gsap.utils.toArray('.positioning-statements p');
  gsap.set(statements.slice(1),{autoAlpha:0,y:38});
  const positioning = gsap.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:'.positioning',start:'top top',end:()=>`+=${innerHeight*MOTION.positioning}`,pin:'.positioning-stage',scrub:MOTION.scrub,anticipatePin:1}});
  positioning.fromTo('.positioning h2',{y:55,opacity:.65},{y:0,opacity:1,duration:.65},0);
  statements.forEach((item,index) => {
    if (index) positioning.to(statements[index-1],{autoAlpha:0,y:-26,duration:.22},index*1.25-.18).to(item,{autoAlpha:1,y:0,duration:.32},index*1.25);
    positioning.to(item,{duration:.8},index*1.25+.3);
  });
  positioning.fromTo('.audience-tags',{opacity:.35,y:32},{opacity:1,y:0,duration:.7},2.2);

  const panels = gsap.utils.toArray('.service-slide');
  gsap.set(panels[0],{autoAlpha:1,y:0});
  gsap.set(panels.slice(1),{autoAlpha:0,y:50});
  const services = gsap.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:'.services-stage',start:'top top',end:()=>`+=${innerHeight*(panels.length*MOTION.services)}`,pin:true,scrub:MOTION.scrub,anticipatePin:1}});
  panels.forEach((panel,index) => {
    const time = index*1.1;
    if (index) {
      services.to(panels[index-1],{autoAlpha:0,y:-36,duration:.23},time-.16)
              .to(panel,{autoAlpha:1,y:0,duration:.25},time+.02);
    }
    const visual = panel.querySelector('.service-image-wrap');
    const accents = panel.querySelectorAll('.service-fx');
    const variant = panel.querySelector('.service-stage')?.dataset.visual;
    const side = index % 2 ? 1 : -1;
    services.fromTo(visual,{autoAlpha:.52,y:24,scale:.87,rotationY:side*9},{autoAlpha:1,y:0,scale:1,rotationY:0,duration:.42},time+.04);
    services.fromTo(accents,{autoAlpha:0,x:side*25,y:16,scale:.78},{autoAlpha:1,x:0,y:0,scale:1,stagger:.07,duration:.28},time+.16);
    if (variant === 'neuroavatar') services.to(accents,{rotation:'+=18',duration:.42},time+.36);
    if (variant === 'video') services.fromTo(panel.querySelector('.service-fx-c'),{scaleX:.25,transformOrigin:'left center'},{scaleX:1,duration:.42},time+.34);
    if (variant === 'automation') services.to(accents,{scale:1.18,stagger:.07,duration:.24},time+.38);
    services.to(panel,{duration:.72},time+.29);
  });
  services.to('#service-progress',{height:'100%',duration:panels.length*1.1},0);

  const capItems = gsap.utils.toArray('.cap-list article');
  const capabilities = gsap.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:'.cap-stage',start:'top top',end:()=>`+=${innerHeight*MOTION.capability}`,pin:true,scrub:MOTION.scrub,anticipatePin:1}});
  capItems.forEach((item,index) => capabilities.fromTo(item,{y:innerWidth<=900?30:0,x:innerWidth<=900?0:38,opacity:.48,scale:.96},{x:0,y:0,opacity:1,scale:1,duration:.55},index*.65));
  capabilities.to('.cap-core img',{rotation:14,scale:1.14,y:-18,duration:2.7},0);
  tween('.automation-visual img','.automation-visual',{scale:.88,rotation:-7,opacity:.58},{scale:1,rotation:0,opacity:1},'top 85%','bottom 40%');

  const track = document.querySelector('.cases-track');
  const distance = () => {
    const pad = parseFloat(getComputedStyle(document.querySelector('.cases-window')).paddingLeft) || 0;
    return Math.max(0, track.scrollWidth - innerWidth + pad * 2);
  };
  gsap.to(track,{x:()=>-distance(),ease:'none',scrollTrigger:{trigger:'.cases-window',start:'top top',end:()=>`+=${distance()+innerHeight*.35}`,pin:true,scrub:MOTION.scrub,anticipatePin:1,invalidateOnRefresh:true}});
  gsap.utils.toArray('.case-card').forEach(card => tween(card,card,{scale:.95,opacity:.8},{scale:1,opacity:1},'left 95%','center 50%'));

  tween('.portfolio-intro h2','.portfolio-intro',{y:90,opacity:.4,scale:.96},{y:0,opacity:1,scale:1},'top bottom','bottom 35%');
  tween('.portfolio-intro p','.portfolio-intro',{x:innerWidth<=900?0:65,y:innerWidth<=900?30:0,opacity:.1},{x:0,y:0,opacity:1},'top 75%','bottom 30%');
  gsap.utils.toArray('.portfolio-card').forEach((card,index) => tween(card,card,{y:35,opacity:.7,scale:.96},{y:0,opacity:1,scale:1},'top 95%','bottom 65%'));

  tween('#process-progress','.process-layout',{height:'0%'},{height:'100%'},'top 75%','bottom 30%');
  gsap.utils.toArray('.process-step').forEach(step => tween(step,step,{x:innerWidth<=900?0:30,y:innerWidth<=900?20:0,opacity:.55},{x:0,y:0,opacity:1},'top 90%','center 40%'));
  tween('.experience h2','.experience',{y:75,scale:.92,opacity:.55},{y:0,scale:1,opacity:1},'top 80%','center 35%');
  gsap.utils.toArray('.trust-item').forEach((item,index) => tween(item,item,{y:35,opacity:.45},{y:0,opacity:1},'top 90%','bottom 65%'));
  gsap.utils.toArray('.package-card').forEach((item,index) => tween(item,item,{y:48,opacity:.45,rotation:index%2?1:-1},{y:0,opacity:1,rotation:0},'top 95%','bottom 60%'));
  tween('.faq .section-head h2','.faq',{y:35,opacity:.5},{y:0,opacity:1},'top 90%','top 45%');

  const final = gsap.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:'.final-stage',start:'top top',end:()=>`+=${innerHeight*MOTION.final}`,pin:true,scrub:MOTION.scrub,anticipatePin:1}});
  final.fromTo('.final-words span',{y:55,opacity:.1,scale:.86},{y:0,opacity:1,scale:1,stagger:.3,duration:.6},0)
       .fromTo('.final h2',{y:100,opacity:.1,scale:.9},{y:0,opacity:1,scale:1,duration:1},.8)
       .fromTo('.final-actions',{y:45,opacity:.3},{y:0,opacity:1,duration:.7},1.5)
       .fromTo('.final-portal',{xPercent:12,scale:.89,opacity:.06},{xPercent:0,scale:1,opacity:.34,duration:1.9},.25);
  return () => { document.body.classList.remove('motion-ready'); cleanups.forEach(fn=>fn()); };
}

function mobile() {
  tween('.hero-brain','.hero',{y:-18,scale:.9},{y:12,scale:1.05},'top top','bottom top');
  tween('.hero-copy','.hero',{y:0,opacity:1},{y:-26,opacity:.72},'top top','bottom top');
  tween('.positioning h2','.positioning',{y:35,opacity:.65},{y:0,opacity:1},'top 90%','center 45%');
  gsap.utils.toArray('.service-slide').forEach(slide => {
    tween(slide,slide,{y:25,opacity:.72},{y:0,opacity:1},'top 95%','center 45%');
    tween(slide.querySelector('.service-image-wrap'),slide,{y:12,scale:.94,opacity:.75},{y:0,scale:1,opacity:1},'top 95%','center 50%');
  });
  gsap.utils.toArray('.cap-list article').forEach(item => tween(item,item,{y:25,opacity:.65},{y:0,opacity:1},'top 95%','center 45%'));
  gsap.utils.toArray('.case-card').forEach(card => tween(card,card,{y:28,opacity:.68},{y:0,opacity:1},'top 95%','center 45%'));
  tween('.portfolio-intro','.portfolio-intro',{y:40,opacity:.6},{y:0,opacity:1},'top 90%','center 40%');
  gsap.utils.toArray('.portfolio-card').forEach(card => tween(card,card,{y:20,opacity:.75},{y:0,opacity:1},'top 95%','center 60%'));
  tween('#process-progress','.process-layout',{height:'0%'},{height:'100%'},'top 80%','bottom 40%');
  gsap.utils.toArray('.process-step').forEach(step => tween(step,step,{x:18,opacity:.6},{x:0,opacity:1},'top 90%','center 45%'));
  tween('.automation-visual img','.automation-visual',{scale:.96,opacity:.75},{scale:1,opacity:1},'top 90%','center 50%');
  tween('.experience h2','.experience',{y:40,opacity:.6},{y:0,opacity:1},'top 85%','center 40%');
  gsap.utils.toArray('.package-card').forEach(card => tween(card,card,{y:25,opacity:.7},{y:0,opacity:1},'top 95%','center 55%'));
  tween('.faq .section-head','.faq',{y:25,opacity:.6},{y:0,opacity:1},'top 90%','center 45%');
  tween('.final h2','.final-stage',{y:55,scale:.94,opacity:.55},{y:0,scale:1,opacity:1},'top 95%','center 40%');
  tween('.final-portal','.final-stage',{y:30,opacity:.1},{y:-20,opacity:.2},'top 95%','center 45%');
}

export function initChapters() {
  if (!gsap || !ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();
  mm.add('(min-width: 701px) and (min-height: 650px) and (prefers-reduced-motion: no-preference)', desktop);
  mm.add('(max-width: 700px) and (prefers-reduced-motion: no-preference), (max-height: 649px) and (prefers-reduced-motion: no-preference)', mobile);
  const refresh = () => ScrollTrigger.refresh();
  document.fonts?.ready.then(refresh);
  const critical = document.querySelectorAll('.hero-portrait,.hero-brain');
  Promise.all([...critical].map(img => img.decode?.().catch(()=>{}) || Promise.resolve())).then(refresh);
  addEventListener('orientationchange', () => setTimeout(refresh,250), {passive:true});
  return mm;
}
