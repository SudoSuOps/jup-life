import test from 'node:test';
import assert from 'node:assert/strict';
import {handleApi,signSession} from '../server/app.js';
const origin='https://juplifestudio.com',secret='test-secret-longer-than-thirty-two-characters';
test('quotes require sign-in and same origin, create private drafts and publish without image storage',async()=>{
 const rows=new Map();
 const DB={prepare(sql){return {bind(...args){return {async run(){
  if(sql.startsWith('INSERT'))rows.set(args[0],{id:args[0],object_key:args[1],content_type:args[2],bytes:args[3],original_name:args[4],title:args[5],category:args[6],published:0});
  if(sql.startsWith('UPDATE'))Object.assign(rows.get(args[5]),{title:args[0],alt:args[1],category:args[2],published:args[4]});
  return {meta:{changes:1}};
 },async first(){return rows.get(args[0])}}}}}};
 const env={DB,SESSION_SECRET:secret};
 const cookie='jup_session='+await signSession(secret);
 const req=(path,body,method='POST',site=origin,signed=true)=>new Request(origin+path,{method,headers:{Origin:site,'Content-Type':'application/json',...(signed?{Cookie:cookie}:{})},body:JSON.stringify(body)});
 assert.equal((await handleApi({env,request:req('/api/admin/quotes',{text:'Hello'},'POST',origin,false)})).status,401);
 assert.equal((await handleApi({env,request:req('/api/admin/quotes',{text:'Hello'},'POST','https://foreign.test')})).status,403);
 assert.equal((await handleApi({env,request:req('/api/admin/quotes',{text:''})})).status,400);
 const result=await handleApi({env,request:req('/api/admin/quotes',{text:'A little piece of our happy place.',published:true})});
 assert.equal(result.status,201);
 const {id,published}=await result.json();assert.equal(published,false);assert.equal(rows.get(id).published,0);
 const change={title:'A little piece of our happy place.',alt:'',category:'quote',published:true};
 const publish=await handleApi({env,request:req('/api/admin/media/'+id,change,'PATCH')});
 assert.equal(publish.status,200);
 const wrongType=await handleApi({env,request:req('/api/admin/media/'+id,{...change,category:'hero'},'PATCH')});
 assert.equal(wrongType.status,400);
});
