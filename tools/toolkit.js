(function(){
var loaded={};
// Remembers this tool for the "Recently used" row on the tools home page.
try{
var here=location.pathname.split('/').pop()||'index.html',recent=JSON.parse(localStorage.getItem('recentTools'))||[];
recent=[here].concat(recent.filter(function(page){return page!==here})).slice(0,8);
localStorage.setItem('recentTools',JSON.stringify(recent));
}catch(e){}
window.ToolKit={
el:function(tag,className,text){
var node=document.createElement(tag);
if(className)node.className=className;
if(text!==undefined)node.textContent=text;
return node;
},
size:function(bytes){
if(bytes<1024)return bytes+' B';
if(bytes<1048576)return (bytes/1024).toFixed(1)+' KB';
return (bytes/1048576).toFixed(1)+' MB';
},
saveLink:function(blob,name,label){
var link=ToolKit.el('a','tool-btn',label||'Download');
link.href=URL.createObjectURL(blob);
link.download=name;
return link;
},
// Phones get half the limit, since a browser tab there has far less memory.
sizeWarning:function(bytes,limit){
var phone=(navigator.deviceMemory&&navigator.deviceMemory<=4)||matchMedia('(pointer: coarse)').matches;
if(bytes<=(phone?limit/2:limit))return '';
return 'This is a large file ('+ToolKit.size(bytes)+'), so it may be slow or fail'+(phone?' on a phone. A computer works better.':'. Close other tabs if it stops responding.');
},
loadScript:function(src){
if(!loaded[src])loaded[src]=new Promise(function(resolve,reject){
var script=document.createElement('script');
script.src=src;
script.onload=resolve;
script.onerror=function(){reject(new Error('Could not load '+src))};
document.head.appendChild(script);
});
return loaded[src];
},
store:{
get:function(key,fallback){
try{var value=JSON.parse(localStorage.getItem(key));return value===null?fallback:value}catch(e){return fallback}
},
set:function(key,value){
try{localStorage.setItem(key,JSON.stringify(value))}catch(e){}
}
}
};
})();
