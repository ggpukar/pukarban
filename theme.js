(function(){
var KEY='siteTheme',root=document.documentElement,theme='light';
try{if(localStorage.getItem(KEY)==='dark')theme='dark'}catch(e){}
root.dataset.theme=theme;

function paint(button){
var dark=root.dataset.theme==='dark';
button.textContent=dark?'☀️':'🌙';
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
