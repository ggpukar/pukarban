// Waits for the page to finish loading, since the shared header script defines where photos live.
document.addEventListener('DOMContentLoaded',function(){
var id=new URLSearchParams(location.search).get('id')||'',box=document.getElementById('pv-photo'),status=document.getElementById('pv-status'),links=document.getElementById('pv-links');
if(!/^[A-Za-z0-9]{10}$/.test(id)){
status.textContent='This link is not complete. Scan the QR code again.';
return;
}
status.textContent='Loading photo…';
fetch(siteWeather.api+'/photo/'+id).then(function(res){
if(res.status===404)throw new Error('gone');
if(!res.ok)throw new Error('failed');
var expires=+res.headers.get('X-Photo-Expires');
return res.blob().then(function(blob){return {blob:blob,expires:expires}});
}).then(function(photo){
var img=document.createElement('img');
img.className='pv-img';
img.alt='Shared photo';
img.src=URL.createObjectURL(photo.blob);
box.appendChild(img);
status.textContent=photo.expires?'This photo will be deleted on '+new Date(photo.expires).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})+'.':'';
links.appendChild(ToolKit.saveLink(photo.blob,'shared-photo.'+(photo.blob.type==='image/webp'?'webp':'jpg'),'Save photo'));
}).catch(function(error){
status.textContent=error.message==='gone'?'This photo has expired or the link is wrong. Shared photos are deleted after 7 days.':'The photo could not be loaded. Check your connection and try again.';
});
});
