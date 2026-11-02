(function(){
var nav=document.getElementById('sidenav'),toggle=document.getElementById('sidenav-toggle'),scrim=document.getElementById('sidenav-scrim');
var label=toggle.querySelector('.sidenav-label');
var links=[].slice.call(nav.querySelectorAll('.sidenav-link'));
var inView={};

function setOpen(open){
nav.classList.toggle('open',open);
scrim.classList.toggle('open',open);
toggle.setAttribute('aria-expanded',open);
label.textContent=open?'Close':'Menu';
if(open)links[0].focus();
}
function setCurrent(hash){
links.forEach(function(link){
if(link.getAttribute('href')===hash)link.setAttribute('aria-current','true');
else link.removeAttribute('aria-current');
});
}

toggle.addEventListener('click',function(){setOpen(!nav.classList.contains('open'))});
scrim.addEventListener('click',function(){setOpen(false)});
links.forEach(function(link){
link.addEventListener('click',function(){setOpen(false)});
});
document.addEventListener('keydown',function(event){
if(event.key==='Escape'&&nav.classList.contains('open')){
setOpen(false);
toggle.focus();
}
});

if(!document.getElementById('work'))return;
var observer=new IntersectionObserver(function(entries){
entries.forEach(function(entry){inView[entry.target.id]=entry.isIntersecting});
setCurrent(inView.contact?'#contact':inView.skills?'#skills':inView.about?'#about':inView.work?'#work':'#top');
},{rootMargin:'-45% 0px -50% 0px'});
['work','about','skills','contact'].forEach(function(id){observer.observe(document.getElementById(id))});
setCurrent('#top');
})();
