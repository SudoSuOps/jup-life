import test from 'node:test';
import assert from 'node:assert/strict';
import {handleRestaurantRequest} from '../server/restaurant.js';

const origin='https://juplifestudio.com';
const env={RESEND_API_KEY:'re_test',CONTACT_TO:'dee@juplifestudio.com'};
function formWith(extra={}){
  const f=new FormData();
  for(const [k,v] of Object.entries({restaurant:'Salty Pelican',contact:'Sam',email:'sam@example.com',phone:'561-555-0100',address:'1 Ocean Blvd, Jupiter, FL 33477',notes:'Hi',...extra}))if(v!==undefined)f.set(k,v);
  return f;
}
const post=(form,headers={})=>handleRestaurantRequest({request:new Request(origin+'/api/restaurant-request',{method:'POST',headers:{Origin:origin,...headers},body:form}),env});
async function withMail(fn){
  const original=globalThis.fetch,sent=[];
  globalThis.fetch=async(url,init)=>{sent.push({url,body:JSON.parse(init.body)});return new Response('{"id":"x"}',{status:200})};
  try{return await fn(sent)}finally{globalThis.fetch=original}
}

test('emails Dee with the logo attached, then thanks the sender',()=>withMail(async sent=>{
  const res=await post(formWith({logo:new File([new Uint8Array([1,2,3])],'My Logo.png',{type:'image/png'})}));
  assert.equal(res.status,200);
  assert.equal(sent.length,2);
  assert.deepEqual(sent[0].body.to,['dee@juplifestudio.com']);
  assert.equal(sent[0].body.reply_to,'sam@example.com');
  assert.match(sent[0].body.subject,/Salty Pelican/);
  assert.equal(sent[0].body.attachments[0].filename,'My_Logo.png');
  assert.equal(sent[0].body.attachments[0].content,'AQID');
  assert.deepEqual(sent[1].body.to,['sam@example.com']);
}));

test('works without a logo and escapes HTML in the email',()=>withMail(async sent=>{
  const res=await post(formWith({restaurant:'<b>Bar</b>'}));
  assert.equal(res.status,200);
  assert.equal(sent[0].body.attachments,undefined);
  assert(!sent[0].body.html.includes('<b>Bar</b>'));
}));

test('rejects missing fields, bad email and short phone',()=>withMail(async sent=>{
  for(const bad of [{restaurant:''},{contact:''},{email:'nope'},{phone:'12'},{address:'x'}]){
    assert.equal((await post(formWith(bad))).status,400,JSON.stringify(bad));
  }
  assert.equal(sent.length,0);
}));

test('rejects other origins, spam honeypot sends nothing, bad and oversized logos',()=>withMail(async sent=>{
  assert.equal((await post(formWith(),{Origin:'https://evil.example'})).status,403);
  assert.equal((await post(formWith({website:'spam.example'}))).status,200);
  assert.equal(sent.length,0);
  assert.equal((await post(formWith({logo:new File(['x'],'logo.exe',{type:'application/octet-stream'})}))).status,400);
  assert.equal((await post(formWith({logo:new File([new Uint8Array(4*1024*1024+1)],'big.png',{type:'image/png'})}))).status,413);
  assert.equal(sent.length,0);
}));

test('reports an email provider failure without losing the form data silently',async()=>{
  const original=globalThis.fetch;globalThis.fetch=async()=>new Response('no',{status:500});
  const err=console.error;console.error=()=>{};
  try{const res=await post(formWith());assert.equal(res.status,502);assert.match((await res.json()).error,/dee@juplifestudio\.com/)}
  finally{globalThis.fetch=original;console.error=err}
});

test('applies the rate limit when a database is present',async()=>{
  const res=await handleRestaurantRequest({request:new Request(origin+'/x',{method:'POST',headers:{Origin:origin},body:formWith()}),env:{...env,DB:{}}},{limit:async()=>{const e=new Error('Please wait a few minutes before trying again.');e.status=429;throw e}});
  assert.equal(res.status,429);
});

test('a broken rate-limit table does not lose the request',()=>withMail(async sent=>{
  const err=console.error;console.error=()=>{};
  try{
    const res=await handleRestaurantRequest({request:new Request(origin+'/x',{method:'POST',headers:{Origin:origin},body:formWith()}),env:{...env,DB:{}}},{limit:async()=>{throw new Error('D1_ERROR: no such table: rate_limits')}});
    assert.equal(res.status,200);
    assert.equal(sent.length,2);
  }finally{console.error=err}
}));
