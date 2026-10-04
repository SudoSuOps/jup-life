(()=>{
  const css=document.createElement('link');
  css.rel='stylesheet';
  css.href='/contact.css?v=20261004-contact';
  document.head.append(css);

  const footer=document.querySelector('footer');
  if(!footer||document.querySelector('#contact'))return;

  const section=document.createElement('section');
  section.id='contact';
  section.className='contact';
  section.setAttribute('aria-labelledby','contact-title');
  section.innerHTML=`
    <div class="contact-form-wrap">
      <div class="contact-form-intro">
        <p class="eyebrow">SAY HELLO / ASK DEE</p>
        <h2 id="contact-title">Have an idea?<br><em>Let’s make it personal.</em></h2>
        <p>Custom pieces, life events, gifts, restaurant sets or just a question from one happy place to another — send Dee a note.</p>
      </div>
      <form class="jup-contact-form" id="jup-contact-form" novalidate>
        <div class="contact-honeypot" aria-hidden="true">
          <label>Website<input name="website" tabindex="-1" autocomplete="off"></label>
        </div>
        <div class="contact-grid">
          <div class="contact-field"><label for="contact-name">YOUR NAME</label><input id="contact-name" name="name" autocomplete="name" maxlength="120" required placeholder="Your name"></div>
          <div class="contact-field"><label for="contact-email">EMAIL</label><input id="contact-email" name="email" type="email" autocomplete="email" maxlength="254" required placeholder="you@example.com"></div>
          <div class="contact-field"><label for="contact-phone">PHONE <span aria-hidden="true">/ OPTIONAL</span></label><input id="contact-phone" name="phone" type="tel" autocomplete="tel" maxlength="60" placeholder="(561) 555-0123"></div>
          <div class="contact-field"><label for="contact-interest">WHAT ARE YOU THINKING ABOUT?</label><select id="contact-interest" name="interest"><option>General inquiry</option><option>Custom JUP LIFE piece</option><option>Wedding / life event</option><option>Restaurant / hospitality set</option><option>Gift</option><option>Jup Signature by Dee</option></select></div>
        </div>
        <div class="contact-field"><label for="contact-message">TELL DEE A LITTLE ABOUT IT</label><textarea id="contact-message" name="message" maxlength="4000" required placeholder="Colors, event date, quantity, inspiration — whatever you already know."></textarea></div>
        <div class="contact-actions"><button class="button button-light" type="submit">Send to Dee</button><p class="contact-form-status" role="status" aria-live="polite"></p></div>
        <p class="contact-small">Prefer email? <a href="mailto:dee@juplifestudio.com">dee@juplifestudio.com</a></p>
      </form>
    </div>`;
  footer.before(section);

  const form=section.querySelector('#jup-contact-form');
  const status=section.querySelector('.contact-form-status');
  const button=form.querySelector('button[type="submit"]');

  form.addEventListener('submit',async event=>{
    event.preventDefault();
    status.classList.remove('error');
    if(!form.reportValidity())return;
    button.disabled=true;
    button.textContent='Sending…';
    status.textContent='Sending your note to Dee…';

    const values=Object.fromEntries(new FormData(form).entries());
    try{
      const response=await fetch('/api/contact',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(values)
      });
      const result=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(result.error||'Please try again.');
      form.innerHTML=`<div class="contact-success"><h3>Thank you.</h3><p>${result.message||'Your note is on its way to Dee.'}</p><p style="margin-top:12px">Keep an eye on your inbox for a little hello from JUP LIFE.</p></div>`;
    }catch(error){
      status.textContent=error.message;
      status.classList.add('error');
      button.disabled=false;
      button.textContent='Send to Dee';
    }
  });
})();
