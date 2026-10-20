// Footer link to the ecosystem page. The main navigation stays focused on Shop, Restaurants, Weddings, About Dee and Contact.
const footer=document.querySelector('.footer-bottom>div');
if(footer&&!footer.querySelector('a[href="/ecosystem/"]')){const a=document.createElement('a');a.href='/ecosystem/';a.textContent='Ecosystem';footer.prepend(a)}
