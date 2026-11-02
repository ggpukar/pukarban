(function(){
var el=ToolKit.el,KEY='resumeDraft';
var SECTIONS={
experience:{title:'Experience',labels:['Job title','Organisation','Dates','What you did (one point per line)']},
education:{title:'Education',labels:['Degree or course','School or college','Dates','Details (one point per line)']},
projects:{title:'Projects',labels:['Project name','Link or tools used','Dates','What it does (one point per line)']}
};
var ORDER=['experience','education','projects'],BASICS=['name','headline','email','phone','location','website','summary','skills','languages'];
var sheet=document.getElementById('rs-sheet'),status=document.getElementById('rs-status'),result=document.getElementById('rs-result'),clear=document.getElementById('rs-clear');
var nextId=1,clearTimer;

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
var data={};
BASICS.forEach(function(key){data[key]=basic(key).value.trim()});
ORDER.forEach(function(key){
data[key]=[].map.call(document.getElementById('rs-'+key+'-list').children,function(row){
return [].map.call(row.querySelectorAll('.tool-input'),function(field){return field.value.trim()});
}).filter(function(entry){return entry.some(Boolean)});
});
return data;
}
function contact(data){return [data.email,data.phone,data.location,data.website].filter(Boolean).join(' · ')}
function points(text){return text.split('\n').map(function(line){return line.replace(/^[-•*]\s*/,'').trim()}).filter(Boolean)}
function heading(text){return el('h3','rs-heading',text)}
function update(){
var data=read();
sheet.textContent='';
sheet.appendChild(el('h2','rs-name',data.name||'Your name'));
if(data.headline)sheet.appendChild(el('p','rs-headline',data.headline));
if(contact(data))sheet.appendChild(el('p','rs-contact',contact(data)));
if(data.summary){
sheet.appendChild(heading('Summary'));
sheet.appendChild(el('p','rs-text',data.summary));
}
ORDER.forEach(function(key){
if(!data[key].length)return;
sheet.appendChild(heading(SECTIONS[key].title));
data[key].forEach(function(entry){
var top=el('div','rs-entry-top');
top.appendChild(el('strong','',entry[0]));
if(entry[2])top.appendChild(el('span','rs-dates',entry[2]));
sheet.appendChild(top);
if(entry[1])sheet.appendChild(el('p','rs-org',entry[1]));
var lines=points(entry[3]);
if(lines.length){
var list=el('ul','rs-points');
lines.forEach(function(line){list.appendChild(el('li','',line))});
sheet.appendChild(list);
}
});
});
[['Skills',data.skills],['Languages',data.languages]].forEach(function(item){
if(!item[1])return;
sheet.appendChild(heading(item[0]));
sheet.appendChild(el('p','rs-text',item[1]));
});
result.textContent='';
status.textContent='';
ToolKit.store.set(KEY,data);
}
function canEncode(data){
return /^[\x20-\x7E\n\r\t -ÿ–—‘’“”•…]*$/.test(JSON.stringify(data).replace(/\\n/g,''));
}
function buildPdf(data){
var lib=PDFLib,W=595.28,H=841.89,M=50,INK=lib.rgb(.08,.13,.24),SOFT=lib.rgb(.29,.33,.47),ACCENT=lib.rgb(0,.22,.58);
return lib.PDFDocument.create().then(function(doc){
return Promise.all([doc.embedFont(lib.StandardFonts.Helvetica),doc.embedFont(lib.StandardFonts.HelveticaBold)]).then(function(fonts){
var regular=fonts[0],bold=fonts[1],page=doc.addPage([W,H]),y=H-M;
function room(space){
if(y-space<M){
page=doc.addPage([W,H]);
y=H-M;
}
}
function wrap(text,font,size,width){
var lines=[],line='';
text.split(/\s+/).forEach(function(word){
while(font.widthOfTextAtSize(word,size)>width){
var cut=word.length-1;
while(cut>1&&font.widthOfTextAtSize(word.slice(0,cut),size)>width)cut--;
if(line){
lines.push(line);
line='';
}
lines.push(word.slice(0,cut));
word=word.slice(cut);
}
var next=line?line+' '+word:word;
if(font.widthOfTextAtSize(next,size)>width){
lines.push(line);
line=word;
}else line=next;
});
if(line)lines.push(line);
return lines;
}
function paragraph(text,font,size,color,x,width,gap){
wrap(text,font,size,width||W-M-(x||M)).forEach(function(line){
room(size+gap);
y-=size;
page.drawText(line,{x:x||M,y:y,size:size,font:font,color:color});
y-=gap;
});
}
function sectionTitle(text){
room(60);
y-=12;
y-=12;
page.drawText(text.toUpperCase(),{x:M,y:y,size:11,font:bold,color:ACCENT});
y-=5;
page.drawLine({start:{x:M,y:y},end:{x:W-M,y:y},thickness:.75,color:ACCENT});
y-=8;
}
paragraph(data.name,bold,24,INK,M,0,5);
if(data.headline)paragraph(data.headline,regular,12.5,ACCENT,M,0,4);
if(contact(data))paragraph(contact(data),regular,10,SOFT,M,0,3);
if(data.summary){
sectionTitle('Summary');
points(data.summary).forEach(function(line){paragraph(line,regular,10.5,INK,M,0,4)});
}
ORDER.forEach(function(key){
if(!data[key].length)return;
sectionTitle(SECTIONS[key].title);
data[key].forEach(function(entry,i){
if(i)y-=7;
room(32);
var dateWidth=entry[2]?regular.widthOfTextAtSize(entry[2],10):0,top=y-11;
if(entry[2])page.drawText(entry[2],{x:W-M-dateWidth,y:top,size:10,font:regular,color:SOFT});
paragraph(entry[0]||entry[1]||' ',bold,11,INK,M,W-2*M-(dateWidth?dateWidth+14:0),3);
if(entry[1]&&entry[0])paragraph(entry[1],regular,10.5,SOFT,M,0,3);
points(entry[3]).forEach(function(line){
room(14);
page.drawText('•',{x:M+3,y:y-10.5,size:10.5,font:regular,color:INK});
paragraph(line,regular,10.5,INK,M+14,W-2*M-14,3);
});
});
});
[['Skills',data.skills],['Languages',data.languages]].forEach(function(item){
if(!item[1])return;
sectionTitle(item[0]);
points(item[1]).forEach(function(line){paragraph(line,regular,10.5,INK,M,0,4)});
});
doc.setTitle(data.name+' resume');
doc.setAuthor(data.name);
doc.setProducer('');
doc.setCreator('');
return doc.save();
});
});
}
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
ORDER.forEach(function(key){
document.getElementById('rs-add-'+key).addEventListener('click',function(){addEntry(key)});
var saved=Array.isArray(draft[key])?draft[key]:[];
if(saved.length)saved.forEach(function(entry){addEntry(key,entry)});
else addEntry(key);
});
update();
})();
