(function(){
var el=ToolKit.el;
var CORE='https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd/';
var CORE_JS_HASH='sha384-sKfkiFtvUk+vexk+0EUhEh366190/4WpgUAsUvaxEfyg7+E1Zt5Y5hrsU808g8Q9',CORE_WASM_HASH='sha384-U1VDhkPYrM3wTCT4/vjSpSsKqG/UjljYrYCI4hBSJ02svbCkxuCi6U6u/peg5vpW';
var MAX_BYTES=524288000;
var EVEN='scale=trunc(iw/2)*2:trunc(ih/2)*2';
var H264=['-c:v','libx264','-preset','ultrafast','-crf','28','-pix_fmt','yuv420p','-vf',EVEN];
var FORMATS={
mp4:H264.concat(['-c:a','aac','-movflags','+faststart']),
webm:['-c:v','libvpx','-deadline','realtime','-cpu-used','8','-b:v','1M','-c:a','libvorbis'],
mov:H264.concat(['-c:a','aac']),
mkv:H264.concat(['-c:a','aac']),
avi:['-c:v','mpeg4','-q:v','5','-c:a','libmp3lame'],
flv:['-c:v','flv','-q:v','5','-vf',EVEN,'-ar','44100','-c:a','libmp3lame'],
gif:['-vf','fps=10,scale=480:-2:flags=lanczos','-an'],
mp3:['-vn','-c:a','libmp3lame','-q:a','4'],
wav:['-vn','-c:a','pcm_s16le'],
ogg:['-vn','-c:a','libvorbis','-q:a','4'],
m4a:['-vn','-c:a','aac','-b:a','160k'],
flac:['-vn','-c:a','flac']
};
var input=document.getElementById('vid-file'),output=document.getElementById('vid-output'),run=document.getElementById('vid-run'),cancel=document.getElementById('vid-cancel'),status=document.getElementById('vid-status'),bar=document.getElementById('vid-progress'),result=document.getElementById('vid-result');
var engine=null,engineUrls=null,cancelled=false,lastLog=[];

function fetchBlob(url,hash,type,onProgress){
return fetch(url,{integrity:hash}).then(function(res){
if(!res.ok)throw new Error(res.status);
var total=+res.headers.get('content-length')||0,reader=res.body.getReader(),chunks=[],got=0;
function pump(){
return reader.read().then(function(step){
if(step.done)return URL.createObjectURL(new Blob(chunks,{type:type}));
chunks.push(step.value);
got+=step.value.length;
if(onProgress)onProgress(got,total);
return pump();
});
}
return pump();
});
}
function loadUrls(){
if(engineUrls)return Promise.resolve(engineUrls);
status.textContent='Downloading the converter (about 32 MB, only needed once)…';
return Promise.all([
fetchBlob(CORE+'ffmpeg-core.js',CORE_JS_HASH,'text/javascript'),
fetchBlob(CORE+'ffmpeg-core.wasm',CORE_WASM_HASH,'application/wasm',function(got){
bar.hidden=false;
bar.max=32232419;
bar.value=got;
status.textContent='Downloading the converter: '+ToolKit.size(got)+' of 32 MB (only needed once)…';
})
]).then(function(urls){
engineUrls={coreURL:urls[0],wasmURL:urls[1]};
return engineUrls;
});
}
function loadEngine(){
if(engine)return Promise.resolve(engine);
return ToolKit.loadScript('lib/ffmpeg.js').then(loadUrls).then(function(urls){
status.textContent='Starting the converter…';
var ffmpeg=new FFmpegWASM.FFmpeg();
ffmpeg.on('log',function(entry){
lastLog.push(entry.message);
if(lastLog.length>30)lastLog.shift();
});
ffmpeg.on('progress',function(entry){
if(entry.progress>=0&&entry.progress<=1){
bar.hidden=false;
bar.max=100;
bar.value=entry.progress*100;
status.textContent='Converting: '+Math.round(entry.progress*100)+'%. Keep this tab open.';
}
});
return ffmpeg.load(urls).then(function(){
engine=ffmpeg;
return ffmpeg;
});
});
}
function reset(){
run.disabled=!input.files[0];
cancel.hidden=true;
bar.hidden=true;
}
function failureText(){
var log=lastLog.join('\n');
if(/Invalid data|could not find codec|Unknown format/i.test(log))return 'This file could not be read. It may be damaged or use an unsupported format.';
if(/does not contain any stream|matches no streams/i.test(log))return 'This file has no audio or video for that format. For example, a silent video can\'t become an MP3.';
return 'This conversion failed. The file may be too large for your device.';
}
input.addEventListener('change',function(){
var file=input.files[0];
result.textContent='';
status.textContent='';
run.disabled=!file;
if(file&&file.size>MAX_BYTES){
status.textContent='This file is over 500 MB, which is too large to convert in a browser.';
run.disabled=true;
}else if(file){
status.textContent=ToolKit.sizeWarning(file.size,200*1048576);
}
});
Object.keys(FORMATS).forEach(function(format){
var option=el('option','',format.toUpperCase());
option.value=format;
output.appendChild(option);
});
run.addEventListener('click',function(){
var file=input.files[0],format=output.value,dot=file.name.lastIndexOf('.'),source='input'+(dot>0?file.name.slice(dot).toLowerCase().replace(/[^.a-z0-9]/g,''):''),target='output.'+format,base=dot>0?file.name.slice(0,dot):file.name;
if(source==='input.'+format)target='output-converted.'+format;
cancelled=false;
lastLog=[];
run.disabled=true;
cancel.hidden=false;
result.textContent='';
loadEngine().then(function(ffmpeg){
if(cancelled)return;
status.textContent='Reading the file…';
return file.arrayBuffer().then(function(buffer){
return ffmpeg.writeFile(source,new Uint8Array(buffer));
}).then(function(){
status.textContent='Converting. Large videos can take many minutes, so keep this tab open.';
return ffmpeg.exec(['-y','-i',source].concat(FORMATS[format],[target]));
}).then(function(code){
if(code!==0)throw new Error('ffmpeg '+code);
return ffmpeg.readFile(target);
}).then(function(data){
if(!data.length)throw new Error('empty');
var blob=new Blob([data.buffer]),name=base+'.'+format,row=el('div','tool-panel tool-result'),info=el('div');
info.appendChild(el('p','tool-result-name',name));
info.appendChild(el('p','tool-note',ToolKit.size(file.size)+' → '+ToolKit.size(blob.size)));
row.appendChild(info);
row.appendChild(ToolKit.saveLink(blob,name,'Download'));
result.appendChild(row);
status.textContent='Done.';
return Promise.all([ffmpeg.deleteFile(source),ffmpeg.deleteFile(target)]);
});
}).catch(function(error){
if(cancelled)return;
if(window.console)console.error(error,lastLog);
if(engine){
status.textContent=failureText();
engine.terminate();
engine=null;
}else{
status.textContent='The converter could not start. Check your connection and try again, or try a different browser.';
}
}).then(reset);
});
cancel.addEventListener('click',function(){
cancelled=true;
if(engine){
engine.terminate();
engine=null;
}
status.textContent='Cancelled.';
reset();
});
})();
