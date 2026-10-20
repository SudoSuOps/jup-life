const $=s=>document.querySelector(s);
let products=[],cart=[],requestId=null,media=[];
try{const saved=JSON.parse(localStorage.getItem('jup-bag')||'[]');if(Array.isArray(saved))cart=saved.filter(x=>typeof x?.id==='string'&&Number.isInteger(x.quantity)&&x.quantity>0&&x.quantity<=10).filter((x,i,a)=>a.findIndex(y=>y.id===x.id)===i)}catch{}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=p=>p.price!=null||p.amount!=null?new Intl.NumberFormat('en-US',{style:'currency',currency:(p.currency||'USD').toUpperCase(),minimumFractionDigits:0}).format((p.amount??p.price)/100):'Coming soon';
async function api(path,options){const r=await fetch(path,options);const b=await r.json();if(!r.ok)throw Error(b.error||'Please try again.');return b}
function persist(){try{localStorage.setItem('jup-bag',JSON.stringify(cart))}catch{}requestId=null;renderCart()}
function toast(text){const t=$('#toast');if(t){t.textContent=text;t.classList.add('visible');setTimeout(()=>t.classList.remove('visible'),2500)}}

// Cards are rendered into the page from data/products.json at build time; here we only swap in studio-uploaded photos.
function productImage(id){return media.find(m=>m.category==='product'&&m.product_id===id&&m.content_type.startsWith('image/'))}
function applyMedia(){document.querySelectorAll('.product-card[data-id]').forEach(card=>{const m=productImage(card.dataset.id);const img=card.querySelector('img');if(m&&img){img.src=m.url;img.removeAttribute('srcset');img.alt=m.alt||img.alt}})}

function renderCart(){
  document.querySelectorAll('[data-cart-count]').forEach(e=>e.textContent=cart.reduce((n,x)=>n+x.quantity,0));
  const box=$('#cart-items');if(!box)return;
  const lines=cart.map(x=>({x,p:products.find(p=>p.id===x.id)})).filter(l=>l.p);
  box.innerHTML=lines.length?lines.map(({x,p})=>`<article class="cart-row"><img src="${esc(p.image)}" alt="" width="64" height="64"><div><h3>${esc(p.name)}</h3><p>${esc(money(p))}</p><div class="quantity"><button data-quantity="${x.id}" data-delta="-1" aria-label="Remove one ${esc(p.name)}">−</button><span>${x.quantity}</span><button data-quantity="${x.id}" data-delta="1" aria-label="Add one ${esc(p.name)}" ${x.quantity>=10?'disabled':''}>+</button></div><button class="remove" data-remove="${x.id}">Remove</button></div></article>`).join(''):'<p class="empty-bag">Your bag is waiting for a little happy place.</p>';
  const available=lines.length&&lines.every(l=>l.p.available);
  const currencies=new Set(lines.map(l=>l.p.currency));
  $('#cart-total').textContent=available&&currencies.size===1?'Subtotal '+money({amount:lines.reduce((n,l)=>n+l.p.amount*l.x.quantity,0),currency:[...currencies][0]}):'';
  $('#checkout').disabled=!available;
  $('#cart-message').textContent=lines.length&&!available?'Some pieces are coming soon. Contact Dee for availability.':'';
}

document.addEventListener('click',e=>{
  const add=e.target.closest('[data-add]');
  if(add){const p=products.find(p=>p.id===add.dataset.add);if(!p?.available)return;const line=cart.find(x=>x.id===p.id);if(line&&line.quantity>=10){toast('A maximum of 10 per piece.');return}line?line.quantity++:cart.push({id:p.id,quantity:1});persist();toast('A little happy place, added.')}
  if(e.target.closest('[data-open-cart]')){$('#bag')?.showModal();renderCart()}
  if(e.target.closest('[data-close-cart]'))$('#bag')?.close();
  const q=e.target.closest('[data-quantity]');
  if(q){const line=cart.find(x=>x.id===q.dataset.quantity);line.quantity=Math.min(10,line.quantity+Number(q.dataset.delta));cart=cart.filter(x=>x.quantity>0);persist()}
  const r=e.target.closest('[data-remove]');
  if(r){cart=cart.filter(x=>x.id!==r.dataset.remove);persist()}
});
$('#bag')?.addEventListener('click',e=>{if(e.target===$('#bag')&&e.clientX<$('#bag').getBoundingClientRect().left)$('#bag').close()});

$('#checkout')?.addEventListener('click',async()=>{
  const b=$('#checkout');b.disabled=true;b.textContent='Opening your checkout…';
  try{
    requestId||=crypto.randomUUID();
    const out=await api('/api/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:cart,requestId})});
    const u=new URL(out.url);if(u.protocol!=='https:'||u.hostname!=='checkout.stripe.com')throw Error('Checkout could not be opened.');
    location.assign(u.href);
  }catch(e){$('#cart-message').textContent=e.message;b.disabled=false;b.textContent='Continue to checkout'}
});

async function load(){
  try{
    products=(await api('/api/catalog')).products;
  }catch{
    // The static page already shows every product; the bag just can't check out without the live catalog.
    try{products=(await api('/products.json')).products}catch{}
  }
  cart=cart.filter(x=>products.some(p=>p.id===x.id));
  document.querySelectorAll('[data-product-action]').forEach(el=>{const p=products.find(p=>p.id===el.dataset.productAction);if(p?.available)el.outerHTML=`<button class="button button-dark" data-add="${p.id}">Add to bag</button>`});
  renderCart();
  const id=document.body.dataset.product;
  if(id){const p=products.find(p=>p.id===id);if(p){if($('#product-price')&&p.amount!=null)$('#product-price').textContent=money(p);if(p.available&&$('#product-action'))$('#product-action').outerHTML=`<button class="button button-dark" data-add="${p.id}">Add to bag</button>`}}

  try{
    const {items}=await api('/api/media');media=items;applyMedia();
    const quote=items.find(x=>x.category==='quote'&&x.title);
    if(quote&&$('#daily-quote')){$('#daily-quote').textContent=quote.title;$('#quote-note').textContent='/ FROM DEE’S POINT OF VIEW'}
    const productId=document.body.dataset.product;
    if(productId){
      const image=items.find(x=>x.category==='product'&&x.product_id===productId&&x.content_type.startsWith('image/'));
      if(image){const el=$('.product-detail img');el.src=image.url;el.alt=image.alt;$('.product-detail .collection-note')?.remove()}
      const video=items.find(x=>x.category==='product'&&x.product_id===productId&&x.content_type.startsWith('video/'));
      if(video){const v=document.createElement('video');v.src=video.url;v.controls=true;v.playsInline=true;v.preload='metadata';v.setAttribute('aria-label',video.title);$('.product-detail>div').append(v)}
    }
    const journal=items.filter(x=>x.category==='journal');
    if(journal.length&&$('#journal-media'))$('#journal-media').innerHTML=journal.map(x=>`<figure>${x.content_type.startsWith('video/')?`<video src="${esc(x.url)}" controls playsinline preload="metadata" aria-label="${esc(x.title)}"></video>`:`<img src="${esc(x.url)}" alt="${esc(x.alt)}" loading="lazy">`}<figcaption><span>FROM THE STUDIO</span><h3>${esc(x.title)}</h3></figcaption></figure>`).join('');
    const hero=items.find(x=>x.category==='hero'&&x.content_type.startsWith('image/'));
    if(hero&&$('.hero-image')){const pic=$('.hero-image').closest('picture');pic.querySelector('source')?.remove();$('.hero-image').src=hero.url;$('.hero-image').alt=hero.alt}
  }catch{}
}
renderCart();load();

document.addEventListener('jup-order-paid',()=>{cart=[];persist()});
if($('#year'))$('#year').textContent=new Date().getFullYear();

import('/contact.js').catch(error=>console.error('Contact form failed to load',error));
