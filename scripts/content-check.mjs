// Guards the customer-facing copy: prices come from data/products.json, no leftover development wording.
import {readFile,readdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';

const {products}=JSON.parse(await readFile('data/products.json','utf8'));
const amounts=new Set(products.filter(p=>p.price!=null).map(p=>'$'+(p.price/100).toFixed(p.price%100?2:0)));
async function walk(dir){return(await Promise.all((await readdir(dir,{withFileTypes:true})).map(d=>d.isDirectory()?walk(path.join(dir,d.name)):path.join(dir,d.name)))).flat()}
const files=(await walk('public')).filter(f=>!f.includes('/admin/'));

const banned=[/petg/i,/lucky shuck/i,/luckyshuck/i,/\bAI[- ]concept/i,/studio concept/i,/development archive/i,/physical testing/i,/planned \$/i,/\[email.protected\]/i];
for(const file of files.filter(f=>/\.(html|js|json|txt|xml)$/.test(f))){
  const text=await readFile(file,'utf8');
  for(const re of banned)assert(!re.test(text),`${file}: contains banned wording ${re}`);
}
for(const file of files.filter(f=>f.endsWith('.html'))){
  const html=await readFile(file,'utf8');
  const visible=html.replace(/<script[\s\S]*?<\/script>/g,'');
  for(const [,amount] of visible.matchAll(/(\$\d+(?:\.\d\d)?)(?![\d])/g))assert(amounts.has(amount),`${file}: ${amount} is not a price in data/products.json`);
  for(const [tag] of html.matchAll(/<img\b[^>]*>/g)){
    assert(/\balt="/.test(tag),`${file}: image without alt text: ${tag.slice(0,80)}`);
    assert(/\bwidth="\d+"/.test(tag)&&/\bheight="\d+"/.test(tag),`${file}: image without width/height: ${tag.slice(0,80)}`);
  }
  for(const [,href] of html.matchAll(/href="mailto:([^"?]*)/g))assert.equal(href,'dee@juplifestudio.com',`${file}: unexpected mailto ${href}`);
  if(html.includes('dee@juplifestudio.com'))assert(html.includes('<!--email_off-->'),`${file}: Cloudflare would obfuscate the email address`);
  if(html.includes('tel:'))assert(html.includes('href="tel:+15615327120"'),`${file}: phone link`);
}
console.log('Content verified: prices match data/products.json, no development wording, images have alt text and dimensions, email and phone links intact.');
