(function(){
// Switches between the text and photo QR makers. #photo in the link opens the photo one.
var tabs=[].slice.call(document.querySelectorAll('.qr-tab'));
function select(tab,focus){
tabs.forEach(function(other){
var on=other===tab;
other.setAttribute('aria-selected',on);
other.tabIndex=on?0:-1;
document.getElementById(other.getAttribute('aria-controls')).hidden=!on;
});
if(focus)tab.focus();
history.replaceState(null,'',tab.id==='qr-tab-photo'?'#photo':location.pathname+location.search);
}
tabs.forEach(function(tab,i){
tab.addEventListener('click',function(){select(tab)});
tab.addEventListener('keydown',function(e){
if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;
e.preventDefault();
select(tabs[(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length],true);
});
});
function fromHash(){select(tabs[location.hash==='#photo'?1:0])}
addEventListener('hashchange',fromHash);
fromHash();
})();
