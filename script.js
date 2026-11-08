document.getElementById('y').textContent = new Date().getFullYear();

// Springy "gift box" reveal
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const items=document.querySelectorAll('.card, .feat, .skills > div, .timeline li, .section-head, .facts li, .contact');
const seen=new Map();
items.forEach(el=>{
  el.classList.add('reveal');
  const n=seen.get(el.parentElement)||0; seen.set(el.parentElement,n+1);
  el.style.setProperty('--d',((n%4)*0.12)+'s');
});

function reveal(el){ el.classList.add('in'); }
if('IntersectionObserver' in window && !reduce){
  const io=new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting){ reveal(e.target); io.unobserve(e.target); } });
  },{threshold:0.18, rootMargin:'0px 0px -6% 0px'});
  items.forEach(el=>io.observe(el));
} else {
  items.forEach(el=>el.classList.add('in'));
}

// Gentle parallax on the hero visual
const heroVis=document.querySelector('.visual');
if(heroVis && !reduce){
  let tick=false;
  addEventListener('scroll',()=>{
    if(tick) return; tick=true;
    requestAnimationFrame(()=>{ heroVis.style.transform='translateY('+(-Math.min(scrollY,700)*0.07)+'px)'; tick=false; });
  },{passive:true});
}

// Highlight the nav tab for the section in view
const links=[...document.querySelectorAll('.nav nav a')];
const map=new Map(links.map(a=>[a.getAttribute('href').slice(1),a]));
const secs=[...map.keys()].map(id=>document.getElementById(id)).filter(Boolean);
function setActive(id){
  links.forEach(a=>a.classList.toggle('active',a===map.get(id)));
  const a=map.get(id);
  if(a&&a.scrollIntoView&&innerWidth<=760){
    const bar=a.parentElement; bar.scrollTo({left:a.offsetLeft-bar.clientWidth/2+a.clientWidth/2,behavior:'smooth'});
  }
}
function onScroll(){
  let cur=null;
  secs.forEach(s=>{ if(s.getBoundingClientRect().top<=140) cur=s.id; });
  if(innerHeight+scrollY>=document.body.scrollHeight-4) cur='contact';
  setActive(cur);
}
addEventListener('scroll',onScroll,{passive:true}); onScroll();

// Scroll progress + back-to-top
const bar=document.getElementById('progress'), toTop=document.getElementById('totop');
function onProgress(){
  const h=document.documentElement.scrollHeight-innerHeight;
  bar.style.width=(h>0?scrollY/h*100:0)+'%';
  toTop.classList.toggle('show',scrollY>600);
}
addEventListener('scroll',onProgress,{passive:true}); onProgress();
toTop.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));

// Card spotlight follows the cursor
document.querySelectorAll('.card').forEach(c=>{
  c.addEventListener('pointermove',e=>{
    const r=c.getBoundingClientRect();
    c.style.setProperty('--mx',(e.clientX-r.left)+'px');
    c.style.setProperty('--my',(e.clientY-r.top)+'px');
  });
});

// Click email to copy
const toast=document.getElementById('toast');
const emailBtn=document.getElementById('copyEmail');
emailBtn.addEventListener('click',async()=>{
  const email='sharathjogi04@gmail.com', txt=emailBtn.querySelector('.cp-txt'), ic=emailBtn.querySelector('.cp-ic');
  let ok=true;
  try{ await navigator.clipboard.writeText(email); }catch(_){ ok=false; }
  toast.textContent=ok?'Email copied to clipboard':email;
  toast.classList.add('show'); setTimeout(()=>toast.classList.remove('show'),2000);
  if(ok){
    emailBtn.classList.add('copied'); txt.textContent='Copied!'; ic.textContent='✓';
    setTimeout(()=>{emailBtn.classList.remove('copied');txt.textContent=email;ic.textContent='⧉';},2000);
  }
});

// Animated resume download (the browser download still runs normally)
document.querySelectorAll('a.dl').forEach(a=>{
  const txt=a.querySelector('.dl-txt'), ic=a.querySelector('.dl-ic'), label=txt.textContent;
  a.addEventListener('click',()=>{
    if(a.classList.contains('loading')||a.classList.contains('done')) return;
    a.classList.add('loading'); txt.textContent='Preparing…';
    setTimeout(()=>{a.classList.replace('loading','done'); txt.textContent='Downloaded'; ic.textContent='✓';},1100);
    setTimeout(()=>{a.classList.remove('done'); txt.textContent=label; ic.textContent='⬇';},3600);
  });
});

// Phone demo: offline checklist -> sync (loops)
(function(){
  if(matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const rows=[...document.querySelectorAll('.phone .row.todo')];
  const off=document.querySelector('.phone .off'), sync=document.querySelector('.phone .sync');
  if(!rows.length||!off||!sync) return;
  const orig=rows.map(r=>r.querySelector('small').textContent);
  const later=(fn,ms)=>setTimeout(fn,ms);
  function reset(){
    rows.forEach((r,i)=>{r.classList.remove('ok');r.classList.add('todo');r.querySelector('small').textContent=orig[i];});
    off.textContent='● Offline'; off.classList.remove('on'); sync.textContent='Sync when online'; sync.classList.remove('done');
  }
  function done(r){r.classList.remove('todo');r.classList.add('ok');r.querySelector('small').textContent=r.dataset.done;}
  function cycle(){
    later(()=>done(rows[0]),1400);
    later(()=>done(rows[1]),2600);
    later(()=>{sync.textContent='Syncing…';},3800);
    later(()=>{off.textContent='● Online';off.classList.add('on');sync.textContent='Synced ✓';sync.classList.add('done');},5200);
    later(()=>{reset();cycle();},9000);
  }
  cycle();
})();

// Resume preview modal
(function(){
  const modal=document.getElementById('resumeModal');
  const closeBtn=document.getElementById('closeResume');
  let lastFocus=null;
  const mobile=()=>matchMedia('(max-width:760px)').matches && /iPhone|iPad|Android/i.test(navigator.userAgent);
  function open(){
    // Phones can't scroll embedded PDFs reliably; open natively instead.
    if(mobile()){ window.open('Sharath_Resume.pdf','_blank','noopener'); return; }
    lastFocus=document.activeElement;
    modal.hidden=false; document.body.classList.add('noscroll');
    requestAnimationFrame(()=>modal.classList.add('open')); closeBtn.focus();
  }
  function close(){
    modal.classList.remove('open'); document.body.classList.remove('noscroll');
    setTimeout(()=>{modal.hidden=true;},250); if(lastFocus) lastFocus.focus();
  }
  document.querySelectorAll('[data-open-resume]').forEach(b=>b.addEventListener('click',open));
  closeBtn.addEventListener('click',close);
  modal.addEventListener('click',e=>{ if(e.target===modal) close(); });
  addEventListener('keydown',e=>{ if(e.key==='Escape'&&!modal.hidden) close(); });
})();

// Project demos: play every time they scroll into view
(function(){
  const demos=document.querySelectorAll('.demo:not(.sc)');
  if(!('IntersectionObserver' in window)){ demos.forEach(d=>d.classList.add('playing')); return; }
  const io=new IntersectionObserver(es=>{
    es.forEach(e=>e.target.classList.toggle('playing',e.isIntersecting));
  },{threshold:0.45});
  demos.forEach(d=>io.observe(d));
})();

// Sclera: one phone, switches between features (hover/click, auto-rotates while in view)
(function(){
  const wrap=document.querySelector('.sclera-wrap'); if(!wrap) return;
  const feats=[...wrap.querySelectorAll('.feat')], screens=[...wrap.querySelectorAll('.demo.sc')];
  const still=matchMedia('(prefers-reduced-motion:reduce)').matches;
  let cur=0,inView=false,paused=false,timer=null;
  function show(i){
    cur=i;
    feats.forEach((f,k)=>f.classList.toggle('active',k===i));
    screens.forEach((s,k)=>{ s.classList.toggle('on',k===i); s.classList.remove('playing'); });
    if(inView||still){ void screens[i].offsetWidth; screens[i].classList.add('playing'); }
  }
  const stop=()=>clearInterval(timer);
  function start(){ stop(); if(still) return; timer=setInterval(()=>{ if(!paused) show((cur+1)%screens.length); },7500); }
  feats.forEach((f,k)=>{
    f.addEventListener('mouseenter',()=>{ paused=true; if(k!==cur) show(k); });
    f.addEventListener('mouseleave',()=>{ paused=false; start(); });
    f.addEventListener('click',()=>{ show(k); start(); });
    f.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); show(k); start(); } });
  });
  show(0);
  if('IntersectionObserver' in window){
    new IntersectionObserver(es=>{
      inView=es[0].isIntersecting;
      if(inView){ show(cur); start(); } else { stop(); screens.forEach(s=>s.classList.remove('playing')); }
    },{threshold:0.4}).observe(wrap.querySelector('.pphone'));
  } else { inView=true; show(0); start(); }
})();
