(function(){
var el=ToolKit.el,QUIET=4,QR_SIZE=600,MAX_SIDE=1600,TARGET_BYTES=550*1024;
var file=document.getElementById('pq-file'),preview=document.getElementById('pq-preview'),agree=document.getElementById('pq-agree'),run=document.getElementById('pq-run'),status=document.getElementById('pq-status');
var canvas=document.getElementById('pq-canvas'),linkOut=document.getElementById('pq-link'),links=document.getElementById('pq-links'),result=document.getElementById('pq-result');
var previewUrl=null,saved=[];
qrcode.stringToBytes=function(value){return Array.prototype.slice.call(new TextEncoder().encode(value))};

function ready(){run.disabled=!(file.files[0]&&agree.checked)}
function encode(image,width,height,quality){
var c=document.createElement('canvas'),ctx=c.getContext('2d');
c.width=width;c.height=height;
ctx.fillStyle='#FFF';
ctx.fillRect(0,0,width,height);
ctx.drawImage(image,0,0,width,height);
return new Promise(function(resolve){
c.toBlob(function(blob){
if(blob&&blob.type==='image/webp')return resolve(blob);
c.toBlob(resolve,'image/jpeg',quality);
},'image/webp',quality);
});
}
// Redrawing the photo also drops its hidden details, such as where it was taken.
function shrink(source){
return createImageBitmap(source).then(function(image){
var scale=Math.min(1,MAX_SIDE/Math.max(image.width,image.height)),quality=.82;
function attempt(){
var w=Math.max(1,Math.round(image.width*scale)),h=Math.max(1,Math.round(image.height*scale));
return encode(image,w,h,quality).then(function(blob){
if(!blob)throw new Error('encode');
if(blob.size<=TARGET_BYTES)return blob;
if(quality>.5)quality-=.12;
else scale*=.75;
return attempt();
});
}
return attempt().then(function(blob){image.close();return blob});
});
}
function drawQr(text){
var qr=qrcode(0,'M');
qr.addData(text,'Byte');
qr.make();
var count=qr.getModuleCount(),total=count+QUIET*2,scale=Math.max(1,Math.floor(QR_SIZE/total)),ctx=canvas.getContext('2d');
canvas.width=canvas.height=total*scale;
ctx.fillStyle='#FFF';
ctx.fillRect(0,0,canvas.width,canvas.height);
ctx.fillStyle='#000';
for(var y=0;y<count;y++)for(var x=0;x<count;x++)if(qr.isDark(y,x))ctx.fillRect((x+QUIET)*scale,(y+QUIET)*scale,scale,scale);
}
function showResult(link,expires){
drawQr(link);
saved.forEach(URL.revokeObjectURL);
saved=[];
links.textContent='';
linkOut.textContent='';
var open=el('a','',link);
open.href=link;
open.target='_blank';
open.rel='noopener';
linkOut.appendChild(open);
var copy=el('button','tool-btn tool-btn-quiet','Copy link');
copy.type='button';
copy.addEventListener('click',function(){
navigator.clipboard.writeText(link).then(function(){copy.textContent='Copied'},function(){copy.textContent='Copy failed'});
setTimeout(function(){copy.textContent='Copy link'},2000);
});
canvas.toBlob(function(png){
if(!png)return;
var save=ToolKit.saveLink(png,'photo-qr-code.png','Download QR code');
saved.push(save.href);
links.insertBefore(save,links.firstChild);
});
links.appendChild(copy);
document.getElementById('pq-expires').textContent='This QR code works until '+new Date(expires).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})+'. After that the photo is deleted.';
result.hidden=false;
}

file.addEventListener('change',function(){
var chosen=file.files[0];
status.textContent='';
result.hidden=true;
if(previewUrl)URL.revokeObjectURL(previewUrl);
previewUrl=null;
preview.hidden=true;
if(chosen&&!/^image\//.test(chosen.type)){
status.textContent='Choose a photo file, such as JPG, PNG or WebP.';
file.value='';
}else if(chosen){
previewUrl=URL.createObjectURL(chosen);
preview.src=previewUrl;
preview.hidden=false;
status.textContent=ToolKit.sizeWarning(chosen.size,40*1048576);
}
ready();
});
agree.addEventListener('change',ready);
run.addEventListener('click',function(){
var chosen=file.files[0];
if(!chosen)return;
run.disabled=true;
result.hidden=true;
status.textContent='Preparing your photo…';
shrink(chosen).then(function(blob){
status.textContent='Uploading ('+ToolKit.size(blob.size)+')…';
return fetch(siteWeather.api+'/photo',{method:'POST',headers:{'Content-Type':blob.type},body:blob});
}).then(function(res){
return res.json().catch(function(){return {}}).then(function(data){
if(!res.ok||!data.id)throw new Error(data.error||'Upload failed.');
return data;
});
}).then(function(data){
status.textContent='Done. Scan the code to check it.';
showResult(new URL('photo.html?id='+data.id,location.href).href,data.expires);
}).catch(function(error){
status.textContent=error.message==='encode'||error.name==='InvalidStateError'?'This photo could not be read. Try a JPG or PNG.':error instanceof TypeError?'Upload failed. Check your connection and try again.':error.message;
}).then(ready);
});
})();
