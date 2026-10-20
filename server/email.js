export const escapeHtml=(value='')=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch]);

export async function sendEmail(apiKey,payload){
  const response=await fetch('https://api.resend.com/emails',{
    method:'POST',
    headers:{'Authorization':`Bearer ${apiKey}`,'Content-Type':'application/json'},
    body:JSON.stringify(payload)
  });
  if(!response.ok){
    const detail=await response.text().catch(()=> '');
    console.error('Resend error',response.status,detail.slice(0,500));
    throw new Error('Email delivery failed');
  }
  return response.json();
}
