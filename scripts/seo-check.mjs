import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const base='https://juplifestudio.com';
const {products}=JSON.parse(await readFile('data/products.json','utf8'));
const sitemap=await readFile('public/sitemap.xml','utf8');
const urls=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
const titles=new Set(),descriptions=new Set();
const headers=await readFile('public/_headers','utf8');
const robots=await readFile('public/robots.txt','utf8');
assert(robots.includes('Sitemap: '+base+'/sitemap.xml'));
assert(!robots.includes('Disallow: /\n'),'Public crawling blocked');
for(const url of urls){
 const route=new URL(url).pathname;
 assert.equal(new URL(url).origin,base);
 assert(!/admin|success|api/.test(route));
 const file=route==='/'?'/index.html':route.endsWith('/')?route+'index.html':route+'.html';
 const html=await readFile('public'+file,'utf8');
 const title=html.match(/<title>(.*?)<\/title>/s)?.[1];
 const desc=html.match(/<meta name="description" content="([^"]*)">/)?.[1];
 assert(title&&desc&&desc.length<180,'Missing or oversized metadata '+url);
 assert(!titles.has(title)&&!descriptions.has(desc),'Duplicate metadata');
 titles.add(title);descriptions.add(desc);
 assert(html.includes('rel="canonical" href="'+url+'"'));
 assert(html.includes('property="og:url" content="'+url+'"'));
 assert(html.includes('name="twitter:card"'));
 assert.equal((html.match(/<h1[ >]/g)||[]).length,1,'One H1 required');
 assert(!html.includes('noindex'),'Public page noindexed');
 const scripts=[...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)];
 assert(scripts.length);
 for(const [,raw] of scripts){
  const data=JSON.parse(raw);
  assert.equal(data['@context'],'https://schema.org');
  assert(headers.includes("'sha256-"+createHash('sha256').update(raw).digest('base64')+"'"),'JSON-LD blocked by CSP');
  assert(!raw.includes('aggregateRating')&&!raw.includes('foundingDate'),'Unconfirmed commercial facts');
  const product=products.find(p=>p.page===route);
  const offer=JSON.stringify(data).match(/"offers":\{[^}]*"price":"([\d.]+)"/)?.[1];
  if(product?.status==='buyable')assert.equal(offer,(product.price/100).toFixed(2),'Product offer must match data/products.json '+url);
  else assert(!raw.includes('"offers"'),'Offer on a page that is not for sale '+url);
 }
}
for(const path of ['success.html','admin/index.html'])assert((await readFile('public/'+path,'utf8')).includes('content="noindex,nofollow"'));
const home=await readFile('public/index.html','utf8');
for(const p of products.filter(p=>p.home&&p.page.startsWith('/collection/')))assert(home.includes('href="'+p.page+'"'),'Home page must link '+p.page);
assert(home.includes('id="questions"')&&home.includes('Based in Jupiter, Florida'));
for(const [name,html] of [['home',home],['restaurants',await readFile('public/restaurants.html','utf8')]]){assert(html.includes('og:image')&&html.includes('twitter:image'),'Social image missing on '+name);assert(html.includes('LocalBusiness')||name!=='home','LocalBusiness JSON-LD missing')}
console.log('SEO verified: '+urls.length+' public pages, unique metadata, canonical/social URLs, JSON-LD/CSP, crawl policy, noindex and static collection links.');
