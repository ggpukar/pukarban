// Generated list of files to keep for offline use. Rebuild it whenever the site changes.
var VERSION='cb7cc9d4c0',CACHE='site-'+VERSION,FONTS='fonts';
var CORE=["./","index.html","loading.html","offline.html","palette.css","section-bg.css","sidenav.css","site-header.css","skills.css","sky.css","theme.css","contact-form.js","mountains3d.js","palette.js","perf.js","protect.js","pwa.js","section-bg.js","sidenav.js","site-header.js","sky.js","theme.js","tools/calendar.html","tools/date-converter.html","tools/file-converter.html","tools/gpa-calculator.html","tools/image-compressor.html","tools/index.html","tools/land-units.html","tools/nepali-typing.html","tools/password-generator.html","tools/pdf-tools.html","tools/photo-qr.html","tools/photo.html","tools/preeti-unicode.html","tools/qr-code.html","tools/resume-builder.html","tools/typing-test.html","tools/vehicle-tax.html","tools/video-converter.html","tools/weather.html","tools/word-counter.html","tools/world-clock.html","tools/tools.css","tools/bs-calendar.js","tools/calendar.js","tools/date-converter.js","tools/file-converter.js","tools/gpa.js","tools/image-compressor.js","tools/land-units.js","tools/nepali-typing.js","tools/password.js","tools/pdf-tools.js","tools/photo-qr.js","tools/photo-view.js","tools/preeti.js","tools/qr-tabs.js","tools/qr.js","tools/resume-builder.js","tools/roman-nepali.js","tools/toolkit.js","tools/tools.js","tools/typing-test.js","tools/tz-data.js","tools/vehicle-tax.js","tools/video-converter.js","tools/weather.js","tools/word-counter.js","tools/world-clock.js","projects/login.html","projects/whatsapp-demo.html","tools/lib/qrcode.js","tools/lib/nepali-converter.js","tools/lib/unicode-to-preeti.js","assets/prabin.jpg","assets/icon-192.png","assets/icon-512.png","manifest.webmanifest"];
self.addEventListener('install',function(event){
event.waitUntil(caches.open(CACHE).then(function(cache){return cache.addAll(CORE.map(function(url){return new Request(url,{cache:'reload'})}))}).then(function(){return self.skipWaiting()}));
});
self.addEventListener('activate',function(event){
event.waitUntil(caches.keys().then(function(names){
return Promise.all(names.filter(function(name){return name!==CACHE&&name!==FONTS}).map(function(name){return caches.delete(name)}));
}).then(function(){return self.clients.claim()}));
});
function keep(cacheName,request,response){
if(response&&(response.ok||response.type==='opaque')){
var copy=response.clone();
caches.open(cacheName).then(function(cache){cache.put(request,copy)});
}
return response;
}
// Short addresses like /tools/calendar are saved as tools/calendar.html, and folders as their index.html.
function savedCopy(request){
var url=new URL(request.url),options={ignoreSearch:true};
return caches.match(request,options).then(function(hit){
if(hit||request.mode!=='navigate')return hit;
var file=url.pathname.slice(-1)==='/'?url.pathname+'index.html':url.pathname+'.html';
return caches.match(new URL(file,url.origin).href,options);
});
}
self.addEventListener('fetch',function(event){
var request=event.request,url=new URL(request.url);
if(request.method!=='GET')return;
if(url.origin===location.origin){
// Everything tries the network first, so a new page never meets an old stylesheet or script.
// Saved copies are used only when there is no connection.
event.respondWith(fetch(request).then(function(response){return keep(CACHE,request,response)}).catch(function(){
return savedCopy(request).then(function(hit){
return hit||(request.mode==='navigate'?caches.match('offline.html'):Response.error());
});
}));
return;
}
if(url.hostname==='fonts.googleapis.com'||url.hostname==='fonts.gstatic.com'){
event.respondWith(caches.match(request).then(function(hit){
return hit||fetch(request).then(function(response){return keep(FONTS,request,response)}).catch(function(){return Response.error()});
}));
}
});
