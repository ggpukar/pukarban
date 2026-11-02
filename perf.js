(function(){
var KEY='perfLite',START_DELAY=2000,CHECK_MS=3000,MIN_FPS=24,SLOW_CHECKS=2;
var listeners=[],perf=window.sitePerf={lite:false,onLite:function(fn){listeners.push(fn)}};
// Animations stay on, but run slower and calmer for visitors who ask their device to reduce motion.
try{perf.calm=matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){perf.calm=false}
var connection=navigator.connection;
try{perf.lite=sessionStorage.getItem(KEY)==='1'}catch(e){}
if((connection&&connection.saveData)||navigator.deviceMemory<=2||navigator.hardwareConcurrency<=2)perf.lite=true;
if(perf.lite)return;

var start=0,frames=0,slow=0;
function restart(now){
start=now;
frames=0;
}
function goLite(){
perf.lite=true;
try{sessionStorage.setItem(KEY,'1')}catch(e){}
listeners.forEach(function(fn){fn()});
}
function tick(now){
frames++;
if(now-start>=CHECK_MS){
slow=frames*1000/(now-start)<MIN_FPS?slow+1:0;
if(slow>=SLOW_CHECKS){
goLite();
return;
}
restart(now);
}
requestAnimationFrame(tick);
}
document.addEventListener('visibilitychange',function(){
slow=0;
restart(performance.now());
});
setTimeout(function(){
requestAnimationFrame(function(now){
restart(now);
requestAnimationFrame(tick);
});
},START_DELAY);
})();
