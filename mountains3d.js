(function(){
var flat=document.getElementById('range'),hero=flat.parentNode;
var canvas=document.createElement('canvas');
canvas.id='mountains3d';
canvas.setAttribute('aria-hidden','true');
canvas.style.cssText='position:absolute;left:0;bottom:0;width:100%;height:360px;pointer-events:none';
var gl=canvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:true});
if(!gl)return;

var PEAKS=[
{name:'Dhaulagiri',metres:'8,167 m',across:-.85,minWidth:1000},
{name:'Annapurna',metres:'8,091 m',across:-.62,minWidth:0},
{name:'Machhapuchhre',metres:'6,993 m',across:-.4,minWidth:1000},
{name:'Manaslu',metres:'8,163 m',across:-.19,minWidth:640},
{name:'Sagarmatha',metres:'8,849 m',across:.05,minWidth:0},
{name:'Makalu',metres:'8,485 m',across:.4,minWidth:640},
{name:'Kanchenjunga',metres:'8,586 m',across:.68,minWidth:0}
];
var pinLayer=document.createElement('div'),pins=[];
pinLayer.setAttribute('aria-hidden','true');
pinLayer.style.cssText='position:absolute;left:0;right:0;bottom:0;height:360px;pointer-events:none';
var FOV=38*Math.PI/180,FAR_Z=-11,NEAR_Z=2.5,MIST_LEVELS=[.75,1.2,1.75];
var TERRAIN_VS='attribute vec3 aPos;attribute vec3 aNormal;uniform mat4 uView;varying vec3 vPos;varying vec3 vNormal;void main(){vPos=aPos;vNormal=aNormal;gl_Position=uView*vec4(aPos,1.);}';
var NOISE='float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.03+7.1;a*=.5;}return v;}';
var TERRAIN_FS='precision mediump float;uniform float uTime;uniform vec3 uEye;varying vec3 vPos;varying vec3 vNormal;'+NOISE+
'void main(){vec3 n=normalize(vNormal);float grain=noise(vPos.xz*9.)-.5;n=normalize(n+vec3(grain*.28,0.,grain*.28));'+
'float light=clamp(dot(n,normalize(vec3(-.55,.62,.42))),0.,1.);float h=vPos.y;'+
'vec3 col=mix(vec3(.059,.165,.42),vec3(.29,.416,.69),smoothstep(.15,1.5,h));col=mix(col,vec3(.5,.62,.85),smoothstep(1.4,2.6,h));'+
'float line=2.45+fbm(vPos.xz*.9)*.8;float snow=smoothstep(line,line+.28,h)*smoothstep(.42,.72,n.y);col=mix(col,vec3(.96,.97,1.),snow);'+
'col*=.34+1.*light;float d=distance(vPos,uEye);col=mix(col,vec3(.78,.85,.95),(1.-exp(-d*d*.0026))*.8);'+
'float low=fbm(vPos.xz*.42+vec2(uTime*.035,-uTime*.018))*(1.-smoothstep(.2,.9,h));col=mix(col,vec3(.9,.94,.99),smoothstep(.25,.6,low)*.32);'+
'gl_FragColor=vec4(col,1.);}';
var MIST_VS='attribute vec3 aPos;uniform mat4 uView;varying vec3 vPos;void main(){vPos=aPos;gl_Position=uView*vec4(aPos,1.);}';
var MIST_FS='precision mediump float;uniform float uTime;uniform float uSeed;varying vec3 vPos;'+NOISE+
'void main(){float a=fbm(vPos.xz*.3+vec2(uTime*.05+uSeed*9.,uSeed*5.-uTime*.02));a=smoothstep(.48,.8,a)*.3;a*=smoothstep(2.4,.2,vPos.z)*smoothstep(-10.,-4.,vPos.z);gl_FragColor=vec4(vec3(.95,.97,1.)*a,a);}';

function compile(vs,fs){
var program=gl.createProgram();
[[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]].forEach(function(part){
var shader=gl.createShader(part[0]);
gl.shaderSource(shader,part[1]);
gl.compileShader(shader);
gl.attachShader(program,shader);
});
gl.linkProgram(program);
return gl.getProgramParameter(program,gl.LINK_STATUS)?program:null;
}
var terrain=compile(TERRAIN_VS,TERRAIN_FS),mist=compile(MIST_VS,MIST_FS);
if(!terrain||!mist)return;

function hash(x,y){var s=Math.sin(x*127.1+y*311.7)*43758.5453;return s-Math.floor(s)}
function noise(x,y){
var ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;
fx=fx*fx*(3-2*fx);
fy=fy*fy*(3-2*fy);
var top=hash(ix,iy)*(1-fx)+hash(ix+1,iy)*fx,bottom=hash(ix,iy+1)*(1-fx)+hash(ix+1,iy+1)*fx;
return top*(1-fy)+bottom*fy;
}
function ridges(x,y){
var value=0,amp=.55,weight=1;
for(var i=0;i<5;i++){
var r=1-Math.abs(noise(x,y)*2-1);
r*=r;
value+=r*amp*weight;
weight=Math.min(1,r*1.8);
x=x*2.05+3.1;
y=y*2.05+1.7;
amp*=.5;
}
return value;
}
function smooth(a,b,v){var t=Math.max(0,Math.min(1,(v-a)/(b-a)));return t*t*(3-2*t)}
function height(x,z){
var far=smooth(1.2,-5.5,z),r=ridges(x*.42+11,z*.42+4);
var summit=Math.exp(-((x-.6)*(x-.6)/7+(z+7.5)*(z+7.5)/9))*2.5;
var side=Math.exp(-((x+6.5)*(x+6.5)/8+(z+6)*(z+6)/7))*1.5+Math.exp(-((x-8)*(x-8)/9+(z+6.5)*(z+6.5)/7))*1.7;
return far*(.15+r*2.5+summit+side)+.2*noise(x*.7,z*.7)*(1-far);
}

var terrainBuffer=gl.createBuffer(),indexBuffer=gl.createBuffer(),mistBuffer=gl.createBuffer(),indexCount=0,aspect=1,width=0,canvasHeight=360;
function buildTerrain(){
var phone=innerWidth<700||sitePerf.lite,cols=phone?110:210,rows=phone?72:110;
var halfWidth=Math.max(7,Math.tan(FOV/2)*aspect*16),data=new Float32Array((cols+1)*(rows+1)*6),heights=new Float32Array((cols+1)*(rows+1));
var dx=halfWidth*2/cols,dz=(NEAR_Z-FAR_Z)/rows,row,col,at;
for(row=0;row<=rows;row++){
for(col=0;col<=cols;col++){
heights[row*(cols+1)+col]=height(-halfWidth+col*dx,FAR_Z+row*dz);
}
}
for(row=0,at=0;row<=rows;row++){
for(col=0;col<=cols;col++){
var i=row*(cols+1)+col;
var left=heights[col?i-1:i],right=heights[col<cols?i+1:i],up=heights[row?i-cols-1:i],down=heights[row<rows?i+cols+1:i];
var nx=(left-right)/(2*dx),nz=(up-down)/(2*dz),len=Math.sqrt(nx*nx+1+nz*nz);
data[at++]=-halfWidth+col*dx;
data[at++]=heights[i];
data[at++]=FAR_Z+row*dz;
data[at++]=nx/len;
data[at++]=1/len;
data[at++]=nz/len;
}
}
var indices=new Uint16Array(cols*rows*6);
for(row=0,at=0;row<rows;row++){
for(col=0;col<cols;col++){
var a=row*(cols+1)+col,b=a+1,c=a+cols+1,d=c+1;
indices[at++]=a;indices[at++]=c;indices[at++]=b;
indices[at++]=b;indices[at++]=c;indices[at++]=d;
}
}
indexCount=indices.length;
gl.bindBuffer(gl.ARRAY_BUFFER,terrainBuffer);
gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indices,gl.STATIC_DRAW);
var quads=[];
MIST_LEVELS.forEach(function(y){
quads.push(-halfWidth,y,FAR_Z,-halfWidth,y,NEAR_Z,halfWidth,y,FAR_Z,halfWidth,y,FAR_Z,-halfWidth,y,NEAR_Z,halfWidth,y,NEAR_Z);
});
gl.bindBuffer(gl.ARRAY_BUFFER,mistBuffer);
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(quads),gl.STATIC_DRAW);
}

function buildPins(){
var visibleHalf=Math.tan(FOV/2)*aspect*12,reach=Math.max(.8,visibleHalf*.06);
pinLayer.textContent='';
pins=PEAKS.filter(function(peak){return width>=peak.minWidth}).map(function(peak){
var centre=peak.across*visibleHalf,best=[centre,-1,-7];
for(var x=centre-reach;x<=centre+reach;x+=reach/10){
for(var z=-8.6;z<=-6.4;z+=.2){
var y=height(x,z);
if(y>best[1])best=[x,y,z];
}
}
var label=document.createElement('div'),name=document.createElement('div'),metres=document.createElement('div'),marker=document.createElement('div');
label.style.cssText='position:absolute;left:0;top:0;display:flex;flex-direction:column;align-items:center;will-change:transform;font-family:Inter,system-ui,sans-serif;color:#14213D;white-space:nowrap';
name.textContent=peak.name;
name.style.cssText='padding:2px 8px 0;border-radius:8px 8px 0 0;background:rgba(247,248,252,.92);font-size:12px;font-weight:600;line-height:1.3';
metres.textContent=peak.metres;
metres.style.cssText='padding:0 8px 2px;border-radius:0 0 8px 8px;background:rgba(247,248,252,.92);font-size:10px;line-height:1.3;align-self:stretch;text-align:center';
marker.textContent='\uD83D\uDCCD';
marker.style.cssText='font-size:15px;line-height:1.05';
label.appendChild(name);
label.appendChild(metres);
label.appendChild(marker);
pinLayer.appendChild(label);
return {label:label,at:best};
});
}
function placePins(view){
var previous=null;
pins.forEach(function(pin){
var x=pin.at[0],y=pin.at[1],z=pin.at[2];
var clipX=view[0]*x+view[4]*y+view[8]*z+view[12],clipY=view[1]*x+view[5]*y+view[9]*z+view[13],clipW=view[3]*x+view[7]*y+view[11]*z+view[15];
var left=(clipX/clipW*.5+.5)*width,top=(.5-clipY/clipW*.5)*canvasHeight;
var half=pin.label.offsetWidth/2,safe=Math.max(half+4,Math.min(width-half-4,left));
var tall=pin.label.offsetHeight;
if(previous&&safe-half<previous.right+4&&top>previous.top-tall&&top-tall<previous.top)top=previous.top-tall-2;
pin.label.style.transform='translate('+safe.toFixed(1)+'px,'+top.toFixed(1)+'px) translate(-50%,-100%)';
previous={right:safe+half,top:top};
});
}

function viewMatrix(eye,target){
var f=[target[0]-eye[0],target[1]-eye[1],target[2]-eye[2]],fl=Math.hypot(f[0],f[1],f[2]);
f=[f[0]/fl,f[1]/fl,f[2]/fl];
var s=[-f[2],0,f[0]],sl=Math.hypot(s[0],s[2]);
s=[s[0]/sl,0,s[2]/sl];
var u=[s[1]*f[2]-s[2]*f[1],s[2]*f[0]-s[0]*f[2],s[0]*f[1]-s[1]*f[0]];
var t=1/Math.tan(FOV/2),near=.1,farPlane=60,p=(farPlane+near)/(near-farPlane),q=2*farPlane*near/(near-farPlane);
var dotS=s[0]*eye[0]+s[1]*eye[1]+s[2]*eye[2],dotU=u[0]*eye[0]+u[1]*eye[1]+u[2]*eye[2],dotF=f[0]*eye[0]+f[1]*eye[1]+f[2]*eye[2];
return new Float32Array([
t/aspect*s[0],t*u[0],-p*f[0],f[0],
t/aspect*s[1],t*u[1],-p*f[1],f[1],
t/aspect*s[2],t*u[2],-p*f[2],f[2],
-t/aspect*dotS,-t*dotU,p*dotF+q,-dotF
]);
}

var mouseX=0,mouseY=0,camX=0,camY=0,scrollEase=0,visible=true,lastDraw=0;
addEventListener('pointermove',function(event){
if(event.pointerType!=='mouse')return;
mouseX=event.clientX/innerWidth-.5;
mouseY=event.clientY/innerHeight-.5;
});
function resize(){
var ratio=sitePerf.lite?.75:Math.min(devicePixelRatio||1,innerWidth<700?1.25:1.5);
width=hero.clientWidth;
canvas.width=width*ratio;
canvas.height=canvasHeight*ratio;
aspect=width/canvasHeight;
gl.viewport(0,0,canvas.width,canvas.height);
buildTerrain();
buildPins();
}
var resizeTimer;
addEventListener('resize',function(){
clearTimeout(resizeTimer);
resizeTimer=setTimeout(resize,200);
});

function draw(now){
var t=now/1000;
camX+=(mouseX-camX)*.045;
camY+=(mouseY-camY)*.045;
scrollEase+=(scrollY-scrollEase)*.1;
var eye=[camX*2.2+Math.sin(t*.13)*.12,2.55-camY*.45+Math.min(scrollEase,900)*.0011,5.1];
var view=viewMatrix(eye,[camX*.5,1.32,-4]);
placePins(view);
gl.clearColor(0,0,0,0);
gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
gl.enable(gl.DEPTH_TEST);
gl.disable(gl.BLEND);
gl.depthMask(true);
gl.useProgram(terrain);
gl.bindBuffer(gl.ARRAY_BUFFER,terrainBuffer);
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
var pos=gl.getAttribLocation(terrain,'aPos'),normal=gl.getAttribLocation(terrain,'aNormal');
gl.enableVertexAttribArray(pos);
gl.enableVertexAttribArray(normal);
gl.vertexAttribPointer(pos,3,gl.FLOAT,false,24,0);
gl.vertexAttribPointer(normal,3,gl.FLOAT,false,24,12);
gl.uniformMatrix4fv(gl.getUniformLocation(terrain,'uView'),false,view);
gl.uniform1f(gl.getUniformLocation(terrain,'uTime'),t);
gl.uniform3fv(gl.getUniformLocation(terrain,'uEye'),eye);
gl.drawElements(gl.TRIANGLES,indexCount,gl.UNSIGNED_SHORT,0);
gl.disableVertexAttribArray(normal);
gl.enable(gl.BLEND);
gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
gl.depthMask(false);
gl.useProgram(mist);
gl.bindBuffer(gl.ARRAY_BUFFER,mistBuffer);
var mistPos=gl.getAttribLocation(mist,'aPos');
gl.enableVertexAttribArray(mistPos);
gl.vertexAttribPointer(mistPos,3,gl.FLOAT,false,0,0);
gl.uniformMatrix4fv(gl.getUniformLocation(mist,'uView'),false,view);
gl.uniform1f(gl.getUniformLocation(mist,'uTime'),t);
MIST_LEVELS.forEach(function(y,i){
if(sitePerf.lite&&i!==1)return;
gl.uniform1f(gl.getUniformLocation(mist,'uSeed'),i*.37);
gl.drawArrays(gl.TRIANGLES,i*6,6);
});
}
function frame(now){
if(visible&&!gl.isContextLost()&&(!sitePerf.lite||now-lastDraw>=33)){
lastDraw=now;
draw(sitePerf.calm?now*.35:now);
}
requestAnimationFrame(frame);
}
canvas.addEventListener('webglcontextlost',function(event){
event.preventDefault();
canvas.remove();
pinLayer.remove();
flat.style.display='';
});
new IntersectionObserver(function(entries){visible=entries[0].isIntersecting}).observe(hero);

sitePerf.onLite(resize);
hero.insertBefore(canvas,flat);
hero.insertBefore(pinLayer,flat);
flat.style.display='none';
resize();
requestAnimationFrame(frame);
})();
