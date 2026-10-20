(()=>{
  const form=document.querySelector('#sample-form');
  if(!form)return;
  const status=form.querySelector('.contact-form-status');
  const button=form.querySelector('button[type="submit"]');
  const logo=form.querySelector('#r-logo');
  const MAX=4*1024*1024;

  logo.addEventListener('change',()=>{
    const file=logo.files[0];
    logo.setCustomValidity(file&&file.size>MAX?'That logo is over 4 MB. Please choose a smaller file.':'');
  });

  form.addEventListener('submit',async event=>{
    event.preventDefault();
    status.classList.remove('error');
    if(!form.reportValidity())return;
    button.disabled=true;
    status.textContent='Sending your request to Dee…';
    try{
      const response=await fetch(form.action,{method:'POST',body:new FormData(form)});
      const result=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(result.error||'Please try again.');
      const done=document.createElement('div');
      done.className='contact-success';
      done.tabIndex=-1;
      const h=document.createElement('h3');h.textContent='Thank you.';
      const p=document.createElement('p');p.textContent=result.message||'Your request is on its way to Dee.';
      const p2=document.createElement('p');p2.textContent='Keep an eye on your inbox for a little hello from JUP LIFE.';
      done.append(h,p,p2);
      form.replaceWith(done);
      done.focus();
    }catch(error){
      status.textContent=error.message;
      status.classList.add('error');
      button.disabled=false;
    }
  });
})();
