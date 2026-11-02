(function(){
var el=ToolKit.el;
var input=document.getElementById('img-files'),quality=document.getElementById('img-quality'),qualityOut=document.getElementById('img-quality-value'),width=document.getElementById('img-width'),format=document.getElementById('img-format'),run=document.getElementById('img-run'),list=document.getElementById('img-results'),status=document.getElementById('img-status');
var EXT={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'};

function targetType(file){
if(format.value!=='same')return format.value;
return EXT[file.type]?file.type:'image/jpeg';
}
function compress(file){
return createImageBitmap(file).then(function(image){
var limit=+width.value||image.width,scale=Math.min(1,limit/image.width),canvas=document.createElement('canvas'),ctx=canvas.getContext('2d'),type=targetType(file);
canvas.width=Math.max(1,Math.round(image.width*scale));
canvas.height=Math.max(1,Math.round(image.height*scale));
if(type==='image/jpeg'){
ctx.fillStyle='#FFF';
ctx.fillRect(0,0,canvas.width,canvas.height);
}
ctx.drawImage(image,0,0,canvas.width,canvas.height);
image.close();
return new Promise(function(resolve,reject){
canvas.toBlob(function(blob){
if(blob)resolve({blob:blob,width:canvas.width,height:canvas.height});
else reject(new Error('encode'));
},type,+quality.value/100);
});
});
}
function row(file,result){
var item=el('div','tool-panel tool-result'),blob=result.blob,base=file.name.replace(/\.[^.]+$/,'');
var saved=Math.round((1-blob.size/file.size)*100);
var info=el('div');
info.appendChild(el('p','tool-result-name',file.name));
info.appendChild(el('p','tool-note',ToolKit.size(file.size)+' → '+ToolKit.size(blob.size)+' · '+result.width+' × '+result.height+(saved>0?' · '+saved+'% smaller':' · not smaller, try a lower quality or JPEG')));
item.appendChild(info);
item.appendChild(ToolKit.saveLink(blob,base+'-compressed.'+EXT[blob.type],'Download'));
return item;
}
quality.addEventListener('input',function(){qualityOut.textContent=quality.value+'%'});
input.addEventListener('change',function(){
var total=[].reduce.call(input.files,function(sum,file){return sum+file.size},0);
status.textContent=ToolKit.sizeWarning(total,80*1048576);
});
run.addEventListener('click',function(){
var files=[].slice.call(input.files);
list.textContent='';
if(!files.length){
status.textContent='Choose at least one image first.';
return;
}
run.disabled=true;
var done=[],chain=Promise.resolve();
files.forEach(function(file,i){
chain=chain.then(function(){
status.textContent='Compressing '+(i+1)+' of '+files.length+'…';
return compress(file).then(function(result){
list.appendChild(row(file,result));
done.push({name:file.name.replace(/\.[^.]+$/,'')+'-compressed.'+EXT[result.blob.type],blob:result.blob});
}).catch(function(){
var item=el('div','tool-panel tool-result');
item.appendChild(el('p','',file.name+' could not be read. It may not be a supported image.'));
list.appendChild(item);
});
});
});
chain.then(function(){
status.textContent=done.length>1?'':done.length?'Done.':'No images could be compressed.';
if(done.length<2)return;
return ToolKit.loadScript('lib/jszip.min.js').then(function(){
var zip=new JSZip();
done.forEach(function(item,i){zip.file((i+1)+'-'+item.name,item.blob)});
return zip.generateAsync({type:'blob'});
}).then(function(blob){
status.textContent='';
status.appendChild(ToolKit.saveLink(blob,'compressed-images.zip','Download all as ZIP'));
});
}).catch(function(){
status.textContent='The ZIP could not be created. You can still download each image.';
}).then(function(){
run.disabled=false;
});
});
})();
