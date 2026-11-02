(function(){
var FRAME_MS=33,LITE_FRAME_MS=50;

function random(seed){var s=Math.sin(seed*91.17)*43758.5453;return s-Math.floor(s)}
function ridgeHeight(x,ridge){
var s=ridge.seed;
return ridge.base+ridge.rise*(Math.abs(Math.sin(x*.0047+s))*.55+Math.abs(Math.sin(x*.0123+s*2))*.3+Math.abs(Math.sin(x*.031+s*3))*.15);
}

function nightSky(host,ridges,firstShooter){
var canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
var width=0,height=0,visible=false,last=0,stars=[],shooter=null,nextShooter=firstShooter;
canvas.className='section-canvas';
canvas.setAttribute('aria-hidden','true');
host.insertBefore(canvas,host.firstChild);

function resize(){
var ratio=sitePerf.lite?1:Math.min(devicePixelRatio||1,2),total;
width=host.clientWidth;
height=host.clientHeight;
canvas.width=width*ratio;
canvas.height=height*ratio;
ctx.setTransform(ratio,0,0,ratio,0,0);
total=Math.min(sitePerf.lite?70:180,Math.round(width*height/8000));
stars=[];
for(var i=0;i<total;i++){
stars.push({x:random(i+1)*width,y:random(i+500)*(height-90),size:.5+random(i+900)*1.3,speed:.6+random(i+1300)*1.8,phase:random(i+1700)*6.28});
}
}
function draw(t){
stars.forEach(function(star){
ctx.globalAlpha=.3+.7*(.5+.5*Math.sin(t*star.speed+star.phase));
ctx.fillStyle='#FFF';
ctx.beginPath();
ctx.arc(star.x,star.y,star.size,0,6.283);
ctx.fill();
});
ctx.globalAlpha=1;
if(!shooter&&t>nextShooter&&!sitePerf.calm){
shooter={x:width*(.15+Math.random()*.6),y:height*(.04+Math.random()*.25),born:t};
nextShooter=t+7+Math.random()*9;
}
if(shooter){
var age=(t-shooter.born)/.9;
if(age>=1){
shooter=null;
}else{
var headX=shooter.x+age*260,headY=shooter.y+age*110,line=ctx.createLinearGradient(headX-90,headY-38,headX,headY);
line.addColorStop(0,'rgba(255,255,255,0)');
line.addColorStop(1,'rgba(255,255,255,'+(1-age)*.9+')');
ctx.strokeStyle=line;
ctx.lineWidth=1.6;
ctx.beginPath();
ctx.moveTo(headX-90,headY-38);
ctx.lineTo(headX,headY);
ctx.stroke();
}
}
ridges.forEach(function(ridge){
ctx.fillStyle=ridge.dark&&document.documentElement.dataset.theme==='dark'?ridge.dark:ridge.color;
ctx.beginPath();
ctx.moveTo(0,height);
for(var x=0;x<=width+12;x+=12)ctx.lineTo(x,height-ridgeHeight(x,ridge));
ctx.lineTo(width,height);
ctx.fill();
});
}
function frame(now){
if(visible&&now-last>=(sitePerf.lite?LITE_FRAME_MS:FRAME_MS)){
last=now;
ctx.clearRect(0,0,width,height);
draw(now/1000*(sitePerf.calm?.4:1));
}
requestAnimationFrame(frame);
}
new ResizeObserver(resize).observe(host);
sitePerf.onLite(resize);
new IntersectionObserver(function(entries){visible=entries[0].isIntersecting}).observe(host);
resize();
requestAnimationFrame(frame);
}

nightSky(document.querySelector('.work-bg'),[{base:88,rise:62,color:'#1C4FA0',seed:9},{base:40,rise:50,color:'#F7F8FC',dark:'#0A1128',seed:5}],2);
nightSky(document.getElementById('contact'),[{base:96,rise:62,color:'rgba(15,42,107,.75)',seed:3},{base:54,rise:48,color:'#081333',seed:17}],6);
})();
