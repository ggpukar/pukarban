// Prayer flags on a string across the top of the hero, waving in a soft wind.
(function(){
var canvas=document.getElementById('flags'),ctx=canvas.getContext('2d');
var COLORS=[[31,95,168],[244,244,240],[198,40,40],[46,125,50],[242,194,48]];
var COLS=16,ROWS=6,FLAG_H=54,SHADES=30;
var W=0,count=0,spacing=0,flagW=0,visible=true,last=0;
var grid=new Float32Array((COLS+1)*(ROWS+1)*2);
var palette=COLORS.map(function(c){
var list=[];
for(var i=-SHADES;i<=SHADES;i++){
var m=i/SHADES,to=m>0?255:0,k=Math.abs(m)*(m>0?.24:.3);
list.push('rgb('+c.map(function(v){return Math.round(v+(to-v)*k)}).join(',')+')');
}
return list;
});
function stringY(x,t){return 92+(x-W/2)*-.035+2.5*Math.sin(x*.007+t*.8)}
function drawFlag(i,t){
var x0=(i+.5)*spacing-flagW/2,gust=.75+.25*Math.sin(t*.31+i*.4),shades=palette[i%COLORS.length];
var drift=6*gust+5*gust*Math.sin(t*.9+i*.6),r,c,n=0;
for(r=0;r<=ROWS;r++){
for(c=0;c<=COLS;c++){
var u=c/COLS,v=r/ROWS,top=x0+u*flagW;
var phase=u*5.2+v*1.6-t*3.4+i*.9;
grid[n++]=top+v*(drift+3*gust*Math.sin(phase*.7+1));
grid[n++]=stringY(top,t)+v*FLAG_H+5*gust*v*Math.sin(phase);
}
}
for(c=0;c<COLS;c++){
var fold=Math.cos((c+.5)/COLS*5.2+.8-t*3.4+i*.9)*.8*gust;
ctx.fillStyle=ctx.strokeStyle=shades[Math.round((fold+1)*SHADES)];
ctx.beginPath();
for(r=0;r<=ROWS;r++){
n=(r*(COLS+1)+c)*2;
r?ctx.lineTo(grid[n],grid[n+1]):ctx.moveTo(grid[n],grid[n+1]);
}
for(r=ROWS;r>=0;r--){
n=(r*(COLS+1)+c+1)*2;
ctx.lineTo(grid[n],grid[n+1]);
}
ctx.closePath();
ctx.fill();
ctx.stroke();
}
}
function draw(t){
ctx.clearRect(0,0,W,220);
ctx.lineWidth=1;
for(var i=0;i<count;i++)drawFlag(i,t);
ctx.strokeStyle=document.documentElement.dataset.theme==='dark'||canvas.parentNode.dataset.sky==='night'?'#A8B3D1':'#4A5578';
ctx.lineWidth=2;
ctx.beginPath();
for(var x=0;x<=W;x+=20){var y=stringY(x,t);x?ctx.lineTo(x,y):ctx.moveTo(x,y)}
ctx.stroke();
}
function resize(){
W=canvas.clientWidth;
var ratio=sitePerf.lite?1:Math.min(devicePixelRatio||1,2);
canvas.width=W*ratio;
canvas.height=220*ratio;
ctx.setTransform(ratio,0,0,ratio,0,0);
count=Math.max(5,Math.round(W/51));
spacing=W/count;
flagW=Math.min(44,spacing*.88);
}
function frame(now){
if(visible&&(!sitePerf.lite||now-last>=33)){
last=now;
draw(now/1000*(sitePerf.calm?.35:1));
}
requestAnimationFrame(frame);
}
addEventListener('resize',resize);
sitePerf.onLite(resize);
resize();
new IntersectionObserver(function(entries){visible=entries[0].isIntersecting}).observe(canvas);
requestAnimationFrame(frame);
})();
