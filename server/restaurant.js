import {sendEmail,escapeHtml} from './email.js';

export const MAX_LOGO_BYTES=4*1024*1024;
const LOGO_TYPES={png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',svg:'image/svg+xml',pdf:'application/pdf'};
const EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const line=(value,max)=>String(value??'').replace(/[\r\n\t]+/g,' ').trim().slice(0,max);

function toBase64(bytes){let s='';for(let i=0;i<bytes.length;i+=0x8000)s+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return btoa(s)}

// Free sample pack request from a restaurant or bar. Emails Dee (with the logo attached) and thanks the sender.
export async function handleRestaurantRequest({request,env},{limit}={}){
  try{
    const origin=request.headers.get('Origin');
    if(origin!==new URL(request.url).origin)return reply({error:'Request origin not allowed.'},403);
    if(!env.RESEND_API_KEY)return reply({error:'Requests are not set up yet. Please email dee@juplifestudio.com.'},503);
    if(Number(request.headers.get('Content-Length')||0)>MAX_LOGO_BYTES+200000)return reply({error:'That file is too large. Logos can be up to 4 MB.'},413);
    // Throttle repeat submissions, but never lose a lead because the rate-limit table is unavailable.
    if(limit&&env.DB){try{await limit(request,env,'restaurant',5,3600)}catch(error){if(error?.status===429)throw error;console.error('Rate limit unavailable',error)}}

    let form;
    try{form=await request.formData()}catch{return reply({error:'Invalid request.'},400)}
    if(form.get('website'))return reply({ok:true,message:'Thank you.'});

    const restaurant=line(form.get('restaurant'),160),contact=line(form.get('contact'),120),email=line(form.get('email'),254).toLowerCase();
    const phone=line(form.get('phone'),60),address=line(form.get('address'),300),notes=String(form.get('notes')??'').trim().slice(0,3000);
    if(restaurant.length<2)return reply({error:'Please tell us your restaurant or bar name.'},400);
    if(contact.length<2)return reply({error:'Please tell us who to ask for.'},400);
    if(!EMAIL_RE.test(email))return reply({error:'Please enter a valid email address.'},400);
    if(phone.replace(/\D/g,'').length<7)return reply({error:'Please enter a phone number.'},400);
    if(address.length<8)return reply({error:'Please enter the address where we should send your pack.'},400);

    let attachments=[],logoName='No logo attached';
    const logo=form.get('logo');
    if(logo&&typeof logo==='object'&&logo.size>0){
      const ext=(logo.name.split('.').pop()||'').toLowerCase();
      if(!LOGO_TYPES[ext])return reply({error:'Please upload your logo as a PNG, JPG, SVG, WebP or PDF.'},400);
      if(logo.size>MAX_LOGO_BYTES)return reply({error:'That logo is over 4 MB. Please send a smaller file.'},413);
      const safe=logo.name.replace(/[^\w.-]+/g,'_').slice(-80)||'logo.'+ext;
      attachments=[{filename:safe,content:toBase64(new Uint8Array(await logo.arrayBuffer()))}];
      logoName=safe;
    }

    const to=env.CONTACT_TO||'dee@juplifestudio.com';
    const from=env.CONTACT_FROM||'JUP LIFE Studio <hello@juplifestudio.com>';
    const row=(k,v)=>`<strong>${k}:</strong> ${escapeHtml(v)}<br>`;
    await sendEmail(env.RESEND_API_KEY,{
      from,to:[to],reply_to:email,
      subject:`Free sample pack request — ${restaurant}`,
      html:`<!doctype html><html><body style="margin:0;background:#fbf8f0;color:#06475b;font-family:Arial,Helvetica,sans-serif"><div style="max-width:640px;margin:auto;padding:36px 24px"><p style="font-size:12px;letter-spacing:.18em">JUP LIFE / FREE SAMPLE PACK REQUEST</p><h1 style="font-family:Georgia,serif;font-weight:400;font-size:32px;margin:16px 0 24px">${escapeHtml(restaurant)}</h1><p style="line-height:1.8">${row('Contact',contact)}${row('Email',email)}${row('Phone',phone)}${row('Ship to',address)}${row('Logo',logoName)}</p><p style="line-height:1.7"><strong>Notes</strong><br>${escapeHtml(notes||'None').replace(/\n/g,'<br>')}</p><p style="margin-top:28px;font-size:12px;color:#58727b">Reply to this email and it goes straight to ${escapeHtml(contact)}.</p></div></body></html>`,
      ...(attachments.length?{attachments}:{})
    });
    try{await sendEmail(env.RESEND_API_KEY,{
      from,to:[email],reply_to:to,
      subject:'Your free JUP LIFE sample pack request',
      html:`<!doctype html><html><body style="margin:0;background:#f3eee4;color:#06475b;font-family:Arial,Helvetica,sans-serif"><div style="max-width:600px;margin:auto;padding:36px 24px;line-height:1.8"><p style="font-size:12px;letter-spacing:.18em">JUP LIFE BY MRS. SMASH · JUPITER, FLORIDA</p><h1 style="font-family:Georgia,serif;font-weight:400;font-size:32px">Thank you, ${escapeHtml(contact)}.</h1><p>Your free sample pack request for ${escapeHtml(restaurant)} made it to the studio. I’ll be in touch personally.</p><p style="font-family:Georgia,serif;font-style:italic;font-size:20px">With love from Jupiter,<br>Dee</p><p style="font-size:12px;color:#58727b">A little piece of our happy place.</p></div></body></html>`
    })}catch(error){console.error('Sample request auto-reply failed',error)}
    return reply({ok:true,message:'Thank you! Your request is on its way to Dee, Mrs. Smash.'});
  }catch(error){
    if(error?.status)return reply({error:error.message},error.status);
    console.error('Restaurant request error',error);
    return reply({error:'We could not send your request just now. Please email Dee at dee@juplifestudio.com.'},502);
  }
}
