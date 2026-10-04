const EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(data,status=200){
  return new Response(JSON.stringify(data),{
    status,
    headers:{
      'Content-Type':'application/json; charset=utf-8',
      'Cache-Control':'no-store',
      'X-Content-Type-Options':'nosniff'
    }
  });
}

function escapeHtml(value=''){
  return String(value).replace(/[&<>"']/g,ch=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[ch]);
}

async function sendEmail(apiKey,payload){
  const response=await fetch('https://api.resend.com/emails',{
    method:'POST',
    headers:{
      'Authorization':`Bearer ${apiKey}`,
      'Content-Type':'application/json'
    },
    body:JSON.stringify(payload)
  });
  if(!response.ok){
    const detail=await response.text().catch(()=> '');
    console.error('Resend error',response.status,detail.slice(0,500));
    throw new Error('Email delivery failed');
  }
  return response.json();
}

export async function onRequestPost({request,env}){
  try{
    const origin=request.headers.get('Origin');
    if(origin!==new URL(request.url).origin) return json({error:'Request origin not allowed.'},403);
    if(!env.RESEND_API_KEY) return json({error:'Contact email is not configured yet.'},503);

    const contentLength=Number(request.headers.get('Content-Length')||0);
    if(contentLength>12000) return json({error:'Message is too large.'},413);

    let body;
    try{ body=await request.json(); }
    catch{ return json({error:'Invalid request.'},400); }

    // Honeypot: bots tend to fill this hidden field.
    if(body.website) return json({ok:true});

    const name=String(body.name||'').trim().slice(0,120);
    const email=String(body.email||'').trim().toLowerCase().slice(0,254);
    const phone=String(body.phone||'').trim().slice(0,60);
    const interest=String(body.interest||'General inquiry').trim().slice(0,120);
    const message=String(body.message||'').trim().slice(0,4000);

    if(name.length<2) return json({error:'Please tell us your name.'},400);
    if(!EMAIL_RE.test(email)) return json({error:'Please enter a valid email address.'},400);
    if(message.length<5) return json({error:'Please add a short message.'},400);

    const safeName=escapeHtml(name);
    const safeEmail=escapeHtml(email);
    const safePhone=escapeHtml(phone||'Not provided');
    const safeInterest=escapeHtml(interest);
    const safeMessage=escapeHtml(message).replace(/\n/g,'<br>');
    const to=env.CONTACT_TO||'dee@juplifestudio.com';
    const from=env.CONTACT_FROM||'JUP LIFE Studio <hello@juplifestudio.com>';

    const deeEmail={
      from,
      to:[to],
      reply_to:email,
      subject:`New JUP LIFE inquiry — ${name}`,
      html:`<!doctype html><html><body style="margin:0;background:#fbf8f0;color:#06475b;font-family:Arial,Helvetica,sans-serif"><div style="max-width:640px;margin:auto;padding:42px 24px"><p style="font-size:12px;letter-spacing:.18em">JUP LIFE / NEW INQUIRY</p><h1 style="font-family:Georgia,serif;font-weight:400;font-size:38px;margin:18px 0 30px">A new hello from ${safeName}.</h1><div style="border-top:1px solid #d9d2c5;padding-top:24px;line-height:1.8"><p><strong>Email:</strong> ${safeEmail}<br><strong>Phone:</strong> ${safePhone}<br><strong>Interest:</strong> ${safeInterest}</p><p style="margin-top:24px"><strong>Message</strong><br>${safeMessage}</p></div><p style="margin-top:36px;font-size:12px;color:#58727b">Reply to this email and it will go directly to ${safeName}.</p></div></body></html>`
    };

    const customerEmail={
      from,
      to:[email],
      reply_to:to,
      subject:'Thank you for reaching out to JUP LIFE ✨',
      html:`<!doctype html><html><body style="margin:0;background:#fbf8f0;color:#06475b;font-family:Arial,Helvetica,sans-serif"><div style="max-width:640px;margin:auto;padding:48px 24px"><p style="font-size:12px;letter-spacing:.18em">JUP LIFE / BY MRS. SMASH</p><h1 style="font-family:Georgia,serif;font-weight:400;font-size:44px;line-height:1.08;margin:18px 0 24px">Thank you for saying hello, ${safeName}.</h1><p style="font-size:17px;line-height:1.8">I received your note and I’m so glad you reached out. JUP LIFE is built around the little moments, celebrations and pieces that make home feel like your happy place.</p><p style="font-size:17px;line-height:1.8">I’ll take a look at your inquiry and get back to you personally. If you’re asking about a custom piece or life event, feel free to reply with any colors, inspiration, dates or ideas you already have.</p><p style="font-family:Georgia,serif;font-style:italic;font-size:26px;margin:34px 0 6px">With love from Jupiter,<br>Dee</p><p style="font-size:13px;letter-spacing:.08em">MRS. SMASH · JUP LIFE STUDIO</p><div style="margin-top:38px;padding-top:24px;border-top:1px solid #d9d2c5;font-size:13px;line-height:1.7;color:#58727b">A little piece of our happy place.<br>juplifestudio.com</div></div></body></html>`
    };

    // Send Dee's notification first so the inquiry is never lost if the auto-reply provider errors.
    await sendEmail(env.RESEND_API_KEY,deeEmail);
    try{ await sendEmail(env.RESEND_API_KEY,customerEmail); }
    catch(error){ console.error('Customer auto-reply failed',error); }

    return json({ok:true,message:'Thanks — your note is on its way to Dee.'});
  }catch(error){
    console.error('Contact endpoint error',error);
    return json({error:'We could not send your note just now. Please email Dee directly at dee@juplifestudio.com.'},502);
  }
}

export function onRequest(){
  return json({error:'Method not allowed.'},405);
}
