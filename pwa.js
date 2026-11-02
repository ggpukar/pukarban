(function(){
// Shows short addresses: /index.html becomes /, and /tools/calendar.html becomes /tools/calendar.
var path=location.pathname,short=path.replace(/(^|\/)index\.html$/,'$1').replace(/\.html$/,'');
if(short!==path&&history.replaceState&&location.protocol!=='file:'){
try{history.replaceState(history.state,'',short+location.search+location.hash)}catch(e){}
}
if(!('serviceWorker' in navigator)||location.protocol!=='https:'&&location.hostname!=='localhost'&&location.hostname!=='127.0.0.1')return;
var worker=new URL('sw.js',document.currentScript.src).href;
addEventListener('load',function(){
navigator.serviceWorker.register(worker).catch(function(){});
});
})();
