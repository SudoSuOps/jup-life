// Menu toggle shared by every page.
(()=>{
  const button=document.querySelector('.menu-button'),nav=document.querySelector('#mobile-nav');
  if(!button||!nav)return;
  const set=open=>{nav.hidden=!open;button.setAttribute('aria-expanded',String(open));button.textContent=open?'Close':'Menu'};
  button.addEventListener('click',()=>set(nav.hidden));
  nav.addEventListener('click',e=>{if(e.target.closest('a'))set(false)});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!nav.hidden){set(false);button.focus()}});
})();
