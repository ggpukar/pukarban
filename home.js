(function(){
// The flat mountain drawing is the fallback when WebGL is missing; its layers shift with the mouse or a finger.
var hero=document.getElementById('hero'),layers=[].slice.call(document.querySelectorAll('#range [data-depth]'));
var targetX=0,x=0,y=0,visible=true;
addEventListener('pointermove',function(e){
if(e.pointerType==='mouse')targetX=e.clientX/innerWidth-.5;
});
addEventListener('touchmove',function(e){
var box=hero.getBoundingClientRect(),point=e.touches[0];
if(point&&point.clientY>=box.top&&point.clientY<=box.bottom)targetX=point.clientX/innerWidth-.5;
},{passive:true});
addEventListener('touchend',function(){targetX=0},{passive:true});
new IntersectionObserver(function(entries){visible=entries[0].isIntersecting}).observe(hero);
function frame(){
if(visible&&!sitePerf.calm){
x+=(targetX-x)*.05;
y+=(scrollY-y)*.12;
layers.forEach(function(layer){
var depth=+layer.getAttribute('data-depth');
layer.style.transform='translate('+(-x*36*depth).toFixed(2)+'px,'+(y*.28*depth).toFixed(2)+'px)';
});
}
requestAnimationFrame(frame);
}
frame();
})();
