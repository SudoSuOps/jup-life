// Renders everything that comes from data/products.json into the static pages.
//   node scripts/render.mjs          rewrite files in place
//   node scripts/render.mjs --check  fail if any file is out of date
import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';

const check=process.argv.includes('--check');
const SITE='https://juplifestudio.com';
const {products}=JSON.parse(await readFile('data/products.json','utf8'));
const byId=Object.fromEntries(products.map(p=>[p.id,p]));
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const money=p=>p.price==null?'Coming soon':'$'+(p.price/100).toFixed(p.price%100?2:0);

const field={
  name:p=>esc(p.name),
  tagline:p=>esc(p.tagline),
  kicker:p=>esc(p.kicker),
  desc:p=>esc(p.description),
  price:money,
  unit:p=>esc(p.unit||''),
  priceUnit:p=>p.price==null?'Coming soon':`${money(p)} ${esc(p.unit||'')}`.trim()
};

const RENDER_NOTE='Product images are studio renderings; real photos are on the way. Printed colors and details may vary.';

function card(p){
  const img=p.image?`<img src="${p.image}"${p.imageSmall?` srcset="${p.imageSmall} 800w, ${p.image} ${p.imageWidth}w" sizes="(max-width:700px) 92vw, 30vw"`:''} alt="${esc(p.imageAlt)}" width="${p.imageWidth}" height="${p.imageHeight}" loading="lazy">`:'';
  const buyable=p.status==='buyable';
  const action=buyable
    ?`<a class="text-link" data-product-action="${p.id}" href="${p.page}">View ${esc(p.name)}</a>`
    :`<a class="text-link" href="${p.page}">${p.id==='weddings'?'Ask Dee about weddings':'Take a peek'}</a>`;
  return `<article class="product-card${buyable?'':' is-soon'}" data-id="${p.id}"><a class="product-image" href="${p.page}" tabindex="-1" aria-hidden="true">${img}${buyable?'':'<span class="image-label">Coming soon</span>'}</a><div class="product-meta"><span>${esc(p.kicker)}</span><span>${buyable?money(p):'Coming soon'}</span></div><h3><a href="${p.page}">${esc(p.name)}</a></h3><p>${esc(p.description)}</p>${action}</article>`;
}

const grids={
  shop:()=>products.filter(p=>p.home&&p.status==='buyable').map(card).join(''),
  soon:()=>products.filter(p=>p.home&&p.status==='coming-soon').map(card).join('')
};
const notes={
  shop:()=>products.some(p=>p.home&&p.status==='buyable'&&p.imageKind==='render')?RENDER_NOTE:'',
  soon:()=>''
};

function nav(home,file,hasApp){
  const h=home?'':'/';
  const cur=(href)=>file==='restaurants.html'&&href==='/restaurants'?' aria-current="page"':'';
  const links=[['Shop',h+'#shop'],['Restaurants','/restaurants'],['Weddings',h+'#weddings'],['About Dee',h+'#about'],['Contact',h+'#contact']];
  const a=links.map(([t,href])=>`<a href="${href}"${cur(href)}>${t}</a>`).join('');
  return `<header class="site-header"><a class="brand" href="/"><span>JUP LIFE</span><small>by MRS SMASH</small></a><nav class="desktop-nav" aria-label="Main navigation">${a}</nav><div class="header-actions">${hasApp?'<button class="bag-button" data-open-cart>Bag <span data-cart-count>0</span></button>':''}<button class="menu-button" aria-expanded="false" aria-controls="mobile-nav">Menu</button></div></header><nav id="mobile-nav" class="mobile-nav" aria-label="Mobile navigation" hidden>${a}</nav>`;
}
const sticky=(home)=>`<div class="sticky-cta" role="complementary" aria-label="Quick links"><a class="button button-dark" href="${home?'':'/'}#shop">Shop</a><a class="button button-light" href="/restaurants#sample-request">Free Samples</a></div>`;

function productLd(p){
  const url=SITE+p.page,image=p.image?SITE+p.image:undefined;
  const brand={'@id':SITE+'/#organization'};
  const node={'@type':'Product','@id':url+'#product',name:p.name,description:p.description,url,...(image?{image}:{}),brand,manufacturer:brand};
  if(p.status==='buyable')node.offers={'@type':'Offer',url,price:(p.price/100).toFixed(2),priceCurrency:'USD',availability:'https://schema.org/InStock',itemCondition:'https://schema.org/NewCondition',seller:brand,shippingDetails:{'@type':'OfferShippingDetails',shippingRate:{'@type':'MonetaryAmount',value:'0',currency:'USD'},shippingDestination:{'@type':'DefinedRegion',addressCountry:'US'}}};
  return JSON.stringify({'@context':'https://schema.org','@graph':[
    {'@type':'WebPage','@id':url+'#webpage',url,name:p.name+' | JUP LIFE by Mrs. Smash',description:p.description,isPartOf:{'@id':SITE+'/#website'},mainEntity:{'@id':url+'#product'}},
    node,
    {'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'JUP LIFE Studio',item:SITE+'/'},{'@type':'ListItem',position:2,name:p.name,item:url}]}
  ]});
}

async function walk(dir){return(await Promise.all((await readdir(dir,{withFileTypes:true})).map(d=>d.isDirectory()?walk(path.join(dir,d.name)):path.join(dir,d.name)))).flat()}
const files=await walk('public');
const stale=[];
async function put(file,next){const prev=await readFile(file,'utf8').catch(()=>null);if(prev!==next){if(check)stale.push(file);else await writeFile(file,next)}}

// Public catalog: no Stripe variable names.
const pub=products.map(({priceEnv,home,...rest})=>rest);
await put('public/products.json',JSON.stringify({products:pub},null,1)+'\n');

// Content-hash version for local css/js so a deploy is never served stale.
const hashOf={};
for(const f of files.filter(f=>/\.(css|js)$/.test(f)&&!f.includes('/admin/')))hashOf['/'+f.replace(/^public\//,'')]=createHash('sha256').update(await readFile(f)).digest('hex').slice(0,8);

const assetHash={};
for(const f of files.filter(f=>f.startsWith('public/assets/')&&!f.endsWith('.otf')))assetHash['/'+f.replace(/^public\//,'')]=createHash('sha256').update(await readFile(f)).digest('hex').slice(0,8);
const hasAsset=p=>p in assetHash;

// AVIF first (smaller), WebP as the fallback. Sources are rebuilt on every run so this stays idempotent.
function avifify(html){
  html=html.replace(/<source[^>]*type="image\/avif"[^>]*>/g,'');
  return html.replace(/<picture>[\s\S]*?<\/picture>|<img\b[^>]*>/g,tag=>{
    const img=tag.match(/<img\b[^>]*\bsrc="(\/assets\/([\w-]+)\.webp)(?:\?v=\w+)?"[^>]*>/);
    if(!img)return tag;
    const base=img[2],full='/assets/'+base+'.avif',small='/assets/'+base+'-small.avif';
    if(!hasAsset(full))return tag;
    const inPicture=tag.startsWith('<picture>');
    const srcset=img[0].match(/\bsrcset="[^"]*"/),sizes=img[0].match(/\bsizes="[^"]*"/),width=img[0].match(/\bwidth="(\d+)"/)?.[1];
    const mobile=hasAsset(small)?`<source media="(max-width:700px)" srcset="${small}" type="image/avif">`:'';
    // Responsive <img srcset>: one AVIF source with the same candidates.
    if(srcset&&hasAsset(small)){
      const source=`<source srcset="${small} 800w, ${full} ${width}w" ${sizes?sizes[0]+' ':''}type="image/avif">`;
      return inPicture?tag.replace('<picture>','<picture>'+source):`<picture>${source}${tag}</picture>`;
    }
    if(inPicture)return tag.replace('<picture>','<picture>'+mobile).replace(/(<img\b)/,`<source srcset="${full}" type="image/avif">$1`);
    const webpSmall=hasAsset('/assets/'+base+'-small.webp')?`<source media="(max-width:700px)" srcset="/assets/${base}-small.webp">`:'';
    return `<picture>${mobile}${webpSmall}<source srcset="${full}" type="image/avif">${tag}</picture>`;
  });
}
// Version asset URLs by content so a long browser cache can never serve a replaced photo.
const version=html=>html.replace(/(?<![\w.:\/-])(\/assets\/[\w.-]+\.(?:webp|avif|svg|png|jpg|mp4))(?:\?v=[0-9a-f]{8})?/g,(m,p)=>assetHash[p]?`${p}?v=${assetHash[p]}`:m);

const inlineScripts=new Set();
for(const file of files.filter(f=>f.endsWith('.html'))){
  const rel=file.replace(/^public\//,'');
  if(rel.startsWith('admin/'))continue;
  let html=await readFile(file,'utf8');
  const home=rel==='index.html';
  const hasApp=/\/app\.js/.test(html);

  html=html.replace(/<!--p:([a-z0-9-]+)\.([a-zA-Z]+)-->[\s\S]*?<!--\/p-->/g,(m,id,f)=>{
    if(!byId[id]||!field[f])throw Error(`${rel}: unknown product marker ${id}.${f}`);
    return `<!--p:${id}.${f}-->${field[f](byId[id])}<!--/p-->`});
  html=html.replace(/<!--grid:(\w+)-->[\s\S]*?<!--\/grid-->/g,(m,name)=>`<!--grid:${name}-->${grids[name]()}<!--/grid-->`);
  html=html.replace(/<!--note:(\w+)-->[\s\S]*?<!--\/note-->/g,(m,name)=>`<!--note:${name}-->${notes[name]()}<!--/note-->`);

  // Product structured data comes from the data file.
  const product=products.find(p=>p.page==='/'+rel.replace(/\.html$/,''));
  if(product&&rel.startsWith('collection/')&&product.priceEnv)
    html=html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/,`<script type="application/ld+json">${productLd(product)}</script>`);

  if(!rel.startsWith('success')){
    html=html.replace(/<header class="site-header">[\s\S]*?<\/header>(\s*<nav id="mobile-nav"[\s\S]*?<\/nav>)?/,nav(home,rel,hasApp));
    html=html.replace(/<div class="sticky-cta"[\s\S]*?<\/div>/,'');
    if(rel!=='restaurants.html')html=html.replace(/<\/body>/,sticky(home)+'</body>');
    if(!/\/site\.js/.test(html))html=html.replace('</head>','<script src="/site.js" defer></script></head>');
  }

  // Cloudflare rewrites addresses into "[email protected]"; keep ours readable.
  html=html.replace(/<!--\/?email_off-->/g,'');
  html=html.replace(/(<html[^>]*>)/,'$1<!--email_off-->').replace(/<\/html>/,'<!--/email_off--></html>');

  html=version(avifify(html));
  html=html.replace(/(href|src)="(\/[\w.-]+\.(?:css|js))(?:\?v=[\w-]+)?"/g,(m,a,p)=>hashOf[p]?`${a}="${p}?v=${hashOf[p]}"`:m);
  html=html.replace(/import\('(\/[\w.-]+\.js)(?:\?v=[\w-]+)?'\)/g,(m,p)=>hashOf[p]?`import('${p}?v=${hashOf[p]}')`:m);

  for(const m of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g))inlineScripts.add(createHash('sha256').update(m[1]).digest('base64'));
  await put(file,html);
}

// Content-Security-Policy: pin each inline script (JSON-LD) by hash. The
// Cloudflare Web Analytics beacon is allowed from its own host only.
let headers=await readFile('public/_headers','utf8');
const scriptSrc="script-src 'self' https://static.cloudflareinsights.com "+[...inlineScripts].sort().map(h=>`'sha256-${h}'`).join(' ');
headers=headers.replace(/script-src [^;]*/,scriptSrc).replace(/connect-src [^;]*/,"connect-src 'self' https://cloudflareinsights.com");
await put('public/_headers',headers);

if(stale.length){console.error('Out of date, run `npm run render`:\n'+stale.join('\n'));process.exit(1)}
console.log(check?'Rendered files are up to date.':'Rendered '+files.filter(f=>f.endsWith('.html')).length+' pages from data/products.json.');
