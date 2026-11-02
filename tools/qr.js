(function(){
var QUIET=4;
var text=document.getElementById('qr-text'),level=document.getElementById('qr-level'),size=document.getElementById('qr-size'),canvas=document.getElementById('qr-canvas'),status=document.getElementById('qr-status'),links=document.getElementById('qr-links');
var current=null,renders=0;
qrcode.stringToBytes=function(value){return Array.prototype.slice.call(new TextEncoder().encode(value))};

function build(value){
var qr=qrcode(0,level.value);
qr.addData(value,'Byte');
qr.make();
return qr;
}
function svgOf(qr){
var count=qr.getModuleCount(),total=count+QUIET*2,path='';
for(var y=0;y<count;y++){
for(var x=0;x<count;x++){
if(qr.isDark(y,x))path+='M'+(x+QUIET)+' '+(y+QUIET)+'h1v1h-1z';
}
}
return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+total+' '+total+'" shape-rendering="crispEdges"><rect width="'+total+'" height="'+total+'" fill="#fff"/><path d="'+path+'" fill="#000"/></svg>';
}
function draw(qr){
var count=qr.getModuleCount(),total=count+QUIET*2,scale=Math.max(1,Math.floor(+size.value/total)),ctx=canvas.getContext('2d');
canvas.width=canvas.height=total*scale;
ctx.fillStyle='#FFF';
ctx.fillRect(0,0,canvas.width,canvas.height);
ctx.fillStyle='#000';
for(var y=0;y<count;y++){
for(var x=0;x<count;x++){
if(qr.isDark(y,x))ctx.fillRect((x+QUIET)*scale,(y+QUIET)*scale,scale,scale);
}
}
}
function update(){
var value=text.value;
renders++;
links.textContent='';
if(current)current.forEach(URL.revokeObjectURL);
current=null;
canvas.hidden=!value;
if(!value){
status.textContent='Enter text or a link to create a QR code.';
return;
}
var qr;
try{
qr=build(value);
}catch(e){
canvas.hidden=true;
status.textContent='That is too much text for a QR code. Shorten it or lower the error correction.';
return;
}
draw(qr);
status.textContent='';
var svg=new Blob([svgOf(qr)],{type:'image/svg+xml'}),svgLink=ToolKit.saveLink(svg,'qr-code.svg','Download SVG');
links.appendChild(svgLink);
current=[svgLink.href];
var mine=++renders;
canvas.toBlob(function(png){
if(mine!==renders||!png)return;
var pngLink=ToolKit.saveLink(png,'qr-code.png','Download PNG');
links.insertBefore(pngLink,svgLink);
if(current)current.push(pngLink.href);
});
}
[text,level,size].forEach(function(input){input.addEventListener('input',update)});
update();
})();
