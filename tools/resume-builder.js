(function(){
var el=ToolKit.el,KEY='resumeDraft',PHOTO_W=350,PHOTO_H=450;
var SECTIONS={
experience:{title:'Experience',labels:['Job title','Organisation','Dates','What you did (one point per line)']},
education:{title:'Education',labels:['Degree or course','School or college','Dates','Details (one point per line)']},
projects:{title:'Projects',labels:['Project name','Link or tools used','Dates','What it does (one point per line)']}
};
var ORDER=['experience','education','projects'],BASICS=['name','headline','email','phone','location','website','summary','skills','languages'];
var CONTACT=[['email','Email'],['phone','Phone'],['location','Location'],['website','Website']];
var sheet=document.getElementById('rs-sheet'),status=document.getElementById('rs-status'),result=document.getElementById('rs-result'),clear=document.getElementById('rs-clear');
var photoInput=document.getElementById('rs-photo'),photoRow=document.getElementById('rs-photo-row'),photoThumb=document.getElementById('rs-photo-thumb'),photoNote=document.getElementById('rs-photo-note');
var nextId=1,clearTimer,photo='';

function basic(key){return document.getElementById('rs-'+key)}
function addEntry(key,values){
var box=document.getElementById('rs-'+key+'-list'),row=el('div','rs-entry'),spec=SECTIONS[key];
spec.labels.forEach(function(text,i){
var id='rs-field-'+(nextId++),label=el('label','tool-label',text),field=el(i===3?'textarea':'input','tool-input');
label.htmlFor=id;
field.id=id;
if(i===3)field.rows=3;
field.value=values&&values[i]||'';
field.addEventListener('input',update);
row.appendChild(label);
row.appendChild(field);
});
var remove=el('button','tool-btn tool-btn-quiet','Remove');
remove.type='button';
remove.addEventListener('click',function(){
row.remove();
update();
});
row.appendChild(remove);
box.appendChild(row);
}
function read(){
var data={photo:photo};
BASICS.forEach(function(key){data[key]=basic(key).value.trim()});
ORDER.forEach(function(key){
data[key]=[].map.call(document.getElementById('rs-'+key+'-list').children,function(row){
return [].map.call(row.querySelectorAll('.tool-input'),function(field){return field.value.trim()});
}).filter(function(entry){return entry.some(Boolean)});
});
return data;
}
function points(text){return text.split('\n').map(function(line){return line.replace(/^[-•*]\s*/,'').trim()}).filter(Boolean)}
function items(text){return text.split(/[,\n]/).map(function(item){return item.replace(/^[-•*]\s*/,'').trim()}).filter(Boolean)}
function heading(text){return el('h3','rs-heading',text)}
function isEmpty(data){
return !data.photo&&BASICS.every(function(key){return !data[key]})&&ORDER.every(function(key){return !data[key].length});
}

function update(){
var data=read();
sheet.textContent='';
if(isEmpty(data)){
sheet.appendChild(el('p','rs-empty','Start filling in the form and your resume will appear here.'));
}else{
var aside=el('aside','rs-aside'),main=el('div','rs-main');
if(data.photo){
var img=el('img','rs-photo');
img.src=data.photo;
img.alt='';
aside.appendChild(img);
}
var contacts=CONTACT.filter(function(c){return data[c[0]]});
if(contacts.length){
aside.appendChild(heading('Contact'));
contacts.forEach(function(c){
var item=el('p','rs-contact-item');
item.appendChild(el('span','rs-contact-label',c[1]));
item.appendChild(el('span','',data[c[0]]));
aside.appendChild(item);
});
}
[['Skills',data.skills],['Languages',data.languages]].forEach(function(group){
if(!group[1])return;
aside.appendChild(heading(group[0]));
var list=el('ul','rs-tags');
items(group[1]).forEach(function(item){list.appendChild(el('li','',item))});
aside.appendChild(list);
});
if(data.name)main.appendChild(el('h2','rs-name',data.name));
if(data.headline)main.appendChild(el('p','rs-headline',data.headline));
if(data.summary){
main.appendChild(heading('Profile'));
main.appendChild(el('p','rs-text',data.summary));
}
ORDER.forEach(function(key){
if(!data[key].length)return;
main.appendChild(heading(SECTIONS[key].title));
data[key].forEach(function(entry){
var block=el('div','rs-item'),top=el('div','rs-entry-top');
top.appendChild(el('strong','',entry[0]||entry[1]));
if(entry[2])top.appendChild(el('span','rs-dates',entry[2]));
block.appendChild(top);
if(entry[1]&&entry[0])block.appendChild(el('p','rs-org',entry[1]));
var lines=points(entry[3]);
if(lines.length){
var list=el('ul','rs-points');
lines.forEach(function(line){list.appendChild(el('li','',line))});
block.appendChild(list);
}
main.appendChild(block);
});
});
sheet.appendChild(aside);
sheet.appendChild(main);
}
result.textContent='';
status.textContent='';
ToolKit.store.set(KEY,data);
}

// Crops the middle of the photo to passport shape (35 × 45 mm) and saves it as a small JPEG.
function cropPhoto(file){
return createImageBitmap(file).then(function(image){
var ratio=PHOTO_W/PHOTO_H,sw=image.width,sh=image.height;
if(sw/sh>ratio)sw=sh*ratio;else sh=sw/ratio;
var canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
canvas.width=PHOTO_W;
canvas.height=PHOTO_H;
ctx.fillStyle='#FFF';
ctx.fillRect(0,0,PHOTO_W,PHOTO_H);
ctx.drawImage(image,(image.width-sw)/2,(image.height-sh)/2*.6,sw,sh,0,0,PHOTO_W,PHOTO_H);
image.close();
return canvas.toDataURL('image/jpeg',.88);
});
}
function showPhoto(){
photoRow.hidden=!photo;
if(photo)photoThumb.src=photo;
}

function canEncode(data){
var copy={};
Object.keys(data).forEach(function(key){if(key!=='photo')copy[key]=data[key]});
return /^[\x20-\x7E\n\r\t -ÿ–—‘’“”•…]*$/.test(JSON.stringify(copy).replace(/\\n/g,''));
}
function buildPdf(data){
var lib=PDFLib,W=595.28,H=841.89,M=42,SIDE=184,PAD=22;
var INK=lib.rgb(.08,.13,.24),SOFT=lib.rgb(.29,.33,.47),ACCENT=lib.rgb(0,.22,.58),RED=lib.rgb(.86,.08,.24),TINT=lib.rgb(.93,.95,.98),WHITE=lib.rgb(1,1,1);
var MX=SIDE+28,MW=W-MX-M,SX=PAD,SWID=SIDE-2*PAD;
return lib.PDFDocument.create().then(function(doc){
var fonts=[doc.embedFont(lib.StandardFonts.Helvetica),doc.embedFont(lib.StandardFonts.HelveticaBold)];
if(data.photo)fonts.push(doc.embedJpg(data.photo));
return Promise.all(fonts).then(function(loaded){
var regular=loaded[0],bold=loaded[1],picture=loaded[2],pages=[];
function pageAt(i){
while(pages.length<=i){
var p=doc.addPage([W,H]);
p.drawRectangle({x:0,y:0,width:SIDE,height:H,color:TINT});
pages.push(p);
}
return pages[i];
}
function wrap(text,font,size,width){
var lines=[],line='';
text.split(/\s+/).forEach(function(word){
while(font.widthOfTextAtSize(word,size)>width){
var cut=word.length-1;
while(cut>1&&font.widthOfTextAtSize(word.slice(0,cut),size)>width)cut--;
if(line){lines.push(line);line=''}
lines.push(word.slice(0,cut));
word=word.slice(cut);
}
var next=line?line+' '+word:word;
if(font.widthOfTextAtSize(next,size)>width){lines.push(line);line=word}else line=next;
});
if(line)lines.push(line);
return lines;
}
// Two columns that each move on to the next page when full.
function column(x,width){
var col={index:0,y:H-M};
col.room=function(space){
if(col.y-space<M){col.index++;col.y=H-M}
};
col.text=function(text,font,size,color,gap,indent){
wrap(text,font,size,width-(indent||0)).forEach(function(line){
col.room(size+gap);
col.y-=size;
pageAt(col.index).drawText(line,{x:x+(indent||0),y:col.y,size:size,font:font,color:color});
col.y-=gap;
});
};
col.title=function(text,lineColor){
col.room(48);
col.y-=18;
pageAt(col.index).drawText(text.toUpperCase(),{x:x,y:col.y,size:10.5,font:bold,color:ACCENT});
col.y-=6;
pageAt(col.index).drawLine({start:{x:x,y:col.y},end:{x:x+width,y:col.y},thickness:.8,color:lineColor||ACCENT});
col.y-=9;
};
return col;
}
var side=column(SX,SWID),main=column(MX,MW);
pageAt(0);
if(picture){
var pw=112,ph=144,px=(SIDE-pw)/2,py=H-M-ph;
pages[0].drawRectangle({x:px-3,y:py-3,width:pw+6,height:ph+6,color:WHITE});
pages[0].drawImage(picture,{x:px,y:py,width:pw,height:ph});
side.y=py-10;
}
var contacts=CONTACT.filter(function(c){return data[c[0]]});
if(contacts.length){
side.title('Contact');
contacts.forEach(function(c){
side.text(c[1].toUpperCase(),bold,7.5,SOFT,2);
side.text(data[c[0]],regular,9.5,INK,7);
});
}
[['Skills',data.skills],['Languages',data.languages]].forEach(function(group){
if(!group[1])return;
side.title(group[0]);
items(group[1]).forEach(function(item){
side.room(14);
pageAt(side.index).drawRectangle({x:SX,y:side.y-7.5,width:3,height:3,color:RED});
side.text(item,regular,9.5,INK,4,9);
});
});
if(data.name){
main.text(data.name,bold,25,INK,4);
pageAt(main.index).drawRectangle({x:MX,y:main.y-4,width:46,height:3,color:RED});
main.y-=10;
}
if(data.headline)main.text(data.headline,regular,12.5,ACCENT,4);
if(data.summary){
main.title('Profile');
points(data.summary).forEach(function(line){main.text(line,regular,10.5,INK,4)});
}
ORDER.forEach(function(key){
if(!data[key].length)return;
main.title(SECTIONS[key].title);
data[key].forEach(function(entry,i){
if(i)main.y-=8;
main.room(34);
var dateWidth=entry[2]?regular.widthOfTextAtSize(entry[2],9.5):0;
if(entry[2])pageAt(main.index).drawText(entry[2],{x:MX+MW-dateWidth,y:main.y-11,size:9.5,font:regular,color:SOFT});
var titleLines=wrap(entry[0]||entry[1]||' ',bold,11,MW-(dateWidth?dateWidth+12:0));
titleLines.forEach(function(line){
main.room(14);
main.y-=11;
pageAt(main.index).drawText(line,{x:MX,y:main.y,size:11,font:bold,color:INK});
main.y-=3;
});
if(entry[1]&&entry[0])main.text(entry[1],regular,10,SOFT,3);
points(entry[3]).forEach(function(line){
main.room(14);
pageAt(main.index).drawText('•',{x:MX+2,y:main.y-10.5,size:10.5,font:regular,color:RED});
main.text(line,regular,10.5,INK,3,12);
});
});
});
var title=data.name?data.name+' resume':'Resume';
doc.setTitle(title);
if(data.name)doc.setAuthor(data.name);
doc.setProducer('');
doc.setCreator('');
return doc.save();
});
});
}

photoInput.addEventListener('change',function(){
var file=photoInput.files[0];
photoNote.textContent='';
if(!file)return;
if(!/^image\//.test(file.type)){
photoNote.textContent='Choose a photo file, such as JPG or PNG.';
photoInput.value='';
return;
}
cropPhoto(file).then(function(dataUrl){
photo=dataUrl;
photoInput.value='';
showPhoto();
update();
}).catch(function(){
photoNote.textContent='This photo could not be read. Try a JPG or PNG.';
});
});
document.getElementById('rs-photo-remove').addEventListener('click',function(){
photo='';
showPhoto();
update();
});
document.getElementById('rs-pdf').addEventListener('click',function(){
var data=read();
result.textContent='';
if(!data.name){
status.textContent='Add your name first.';
basic('name').focus();
return;
}
if(!canEncode(data)){
status.textContent='This PDF can only use English letters. For Nepali text, use Print and choose Save as PDF.';
return;
}
status.textContent='Creating your PDF…';
ToolKit.loadScript('lib/pdf-lib.min.js').then(function(){return buildPdf(data)}).then(function(bytes){
var safe=data.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
var name=(safe?safe+'-':'')+'resume.pdf',blob=new Blob([bytes],{type:'application/pdf'});
status.textContent='Your PDF is ready · '+ToolKit.size(blob.size);
result.appendChild(ToolKit.saveLink(blob,name,'Download '+name));
}).catch(function(){
status.textContent='The PDF could not be created. Try again, or use Print and choose Save as PDF.';
});
});
document.getElementById('rs-print').addEventListener('click',function(){window.print()});
clear.addEventListener('click',function(){
if(!clear.dataset.armed){
clear.dataset.armed='1';
clear.textContent='Click again to clear everything';
clearTimer=setTimeout(function(){
delete clear.dataset.armed;
clear.textContent='Clear everything';
},5000);
return;
}
clearTimeout(clearTimer);
delete clear.dataset.armed;
clear.textContent='Clear everything';
BASICS.forEach(function(key){basic(key).value=''});
photo='';
showPhoto();
ORDER.forEach(function(key){
document.getElementById('rs-'+key+'-list').textContent='';
addEntry(key);
});
update();
});
BASICS.forEach(function(key){basic(key).addEventListener('input',update)});
var draft=ToolKit.store.get(KEY,{});
BASICS.forEach(function(key){
if(typeof draft[key]==='string')basic(key).value=draft[key];
});
if(typeof draft.photo==='string'&&draft.photo.indexOf('data:image/jpeg;base64,')===0)photo=draft.photo;
showPhoto();
ORDER.forEach(function(key){
document.getElementById('rs-add-'+key).addEventListener('click',function(){addEntry(key)});
var saved=Array.isArray(draft[key])?draft[key]:[];
if(saved.length)saved.forEach(function(entry){addEntry(key,entry)});
else addEntry(key);
});
update();
})();
