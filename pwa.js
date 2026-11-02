(function(){
if(!('serviceWorker' in navigator)||location.protocol!=='https:'&&location.hostname!=='localhost'&&location.hostname!=='127.0.0.1')return;
var worker=new URL('sw.js',document.currentScript.src).href;
addEventListener('load',function(){
navigator.serviceWorker.register(worker).catch(function(){});
});
})();
