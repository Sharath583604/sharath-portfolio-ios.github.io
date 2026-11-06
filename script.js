document.getElementById('y').textContent = new Date().getFullYear();

// Fade cards in as they scroll into view
const items = document.querySelectorAll('.card, .skills > div, .timeline li');
items.forEach(el => el.classList.add('reveal'));
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  items.forEach(el => io.observe(el));
} else {
  items.forEach(el => el.classList.add('in'));
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
