(function(){
var KEY='siteTheme',root=document.documentElement,theme='light';
var SUN='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
var MOON='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>';
try{if(localStorage.getItem(KEY)==='dark')theme='dark'}catch(e){}
root.dataset.theme=theme;

function paint(button){
var dark=root.dataset.theme==='dark';
button.innerHTML=dark?SUN:MOON;
button.title='Switch to '+(dark?'light':'dark')+' theme';
button.setAttribute('aria-pressed',dark);
}
document.addEventListener('DOMContentLoaded',function(){
var host=document.getElementById('wx');
if(!host)return;
var button=document.createElement('button');
button.type='button';
button.className='theme-toggle';
button.id='theme-toggle';
button.setAttribute('aria-label','Dark theme');
paint(button);
button.addEventListener('click',function(){
root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';
try{localStorage.setItem(KEY,root.dataset.theme)}catch(e){}
paint(button);
});
host.appendChild(button);
});
})();
