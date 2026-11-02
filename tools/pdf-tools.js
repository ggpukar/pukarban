(function(){
var el=ToolKit.el;
var mergeInput=document.getElementById('merge-files'),mergeList=document.getElementById('merge-list'),mergeRun=document.getElementById('merge-run'),mergeStatus=document.getElementById('merge-status'),mergeResult=document.getElementById('merge-result');
var splitInput=document.getElementById('split-file'),splitRanges=document.getElementById('split-ranges'),splitEach=document.getElementById('split-each'),splitRun=document.getElementById('split-run'),splitStatus=document.getElementById('split-status'),splitResult=document.getElementById('split-result');
var files=[],splitDoc=null,splitPages=0;

function friendly(text){var error=new Error(text);error.friendly=true;return error}
function openPdf(file){
return ToolKit.loadScript('lib/pdf-lib.min.js').then(function(){return file.arrayBuffer()}).then(function(bytes){
return PDFLib.PDFDocument.load(bytes);
}).catch(function(error){
if(/encrypted/i.test(error&&error.message))throw friendly(file.name+' is password protected. Remove the password first.');
throw friendly(file.name+' could not be read. It may not be a valid PDF.');
});
}
function resultRow(box,blob,name,detail){
var row=el('div','tool-panel tool-result'),info=el('div');
info.appendChild(el('p','tool-result-name',name));
info.appendChild(el('p','tool-note',detail+' · '+ToolKit.size(blob.size)));
row.appendChild(info);
row.appendChild(ToolKit.saveLink(blob,name,'Download'));
box.textContent='';
box.appendChild(row);
}
function pdfBlob(bytes){return new Blob([bytes],{type:'application/pdf'})}

function renderList(){
mergeList.textContent='';
files.forEach(function(file,i){
var row=el('li','pdf-item');
row.appendChild(el('span','pdf-name',(i+1)+'. '+file.name+' · '+ToolKit.size(file.size)));
[['↑','Move '+file.name+' up',i-1,i===0],['↓','Move '+file.name+' down',i+1,i===files.length-1]].forEach(function(spec){
var button=el('button','pdf-action',spec[0]);
button.type='button';
button.disabled=spec[3];
button.setAttribute('aria-label',spec[1]);
button.addEventListener('click',function(){
files.splice(spec[2],0,files.splice(i,1)[0]);
renderList();
});
row.appendChild(button);
});
var remove=el('button','pdf-action','×');
remove.type='button';
remove.setAttribute('aria-label','Remove '+file.name);
remove.addEventListener('click',function(){
files.splice(i,1);
renderList();
});
row.appendChild(remove);
mergeList.appendChild(row);
});
mergeRun.disabled=files.length<2;
mergeResult.textContent='';
mergeStatus.textContent=files.length===1?'Add at least one more PDF.':ToolKit.sizeWarning(files.reduce(function(sum,file){return sum+file.size},0),150*1048576);
}
mergeInput.addEventListener('change',function(){
files=files.concat([].slice.call(mergeInput.files));
mergeInput.value='';
renderList();
});
mergeRun.addEventListener('click',function(){
mergeRun.disabled=true;
mergeResult.textContent='';
var output,total=0,chain=ToolKit.loadScript('lib/pdf-lib.min.js').then(function(){return PDFLib.PDFDocument.create()}).then(function(doc){output=doc});
files.forEach(function(file,i){
chain=chain.then(function(){
mergeStatus.textContent='Adding '+(i+1)+' of '+files.length+'…';
return openPdf(file);
}).then(function(doc){
return output.copyPages(doc,doc.getPageIndices());
}).then(function(pages){
pages.forEach(function(page){output.addPage(page)});
total+=pages.length;
});
});
chain.then(function(){return output.save()}).then(function(bytes){
mergeStatus.textContent='Done.';
resultRow(mergeResult,pdfBlob(bytes),'merged.pdf',total+(total===1?' page':' pages'));
}).catch(function(error){
mergeStatus.textContent=error.friendly?error.message:'These PDFs could not be merged.';
}).then(function(){
mergeRun.disabled=files.length<2;
});
});

function parseRanges(text){
var groups=[];
text.split(',').forEach(function(part){
part=part.trim();
if(!part)return;
var match=part.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
if(!match)throw friendly('"'+part+'" isn\'t a valid range. Use a format like 1-3, 5, 8-10.');
var from=+match[1],to=match[2]?+match[2]:from;
if(from<1||to>splitPages||from>to)throw friendly('"'+part+'" is outside this PDF, which has '+splitPages+' pages.');
var pages=[];
for(var n=from;n<=to;n++)pages.push(n-1);
groups.push({label:from===to?String(from):from+'-'+to,pages:pages});
});
if(!groups.length)throw friendly('Enter the pages you want, like 1-3, 5, 8-10.');
return groups;
}
function refreshSplit(){
splitRun.disabled=!splitDoc;
splitRanges.disabled=splitEach.checked;
}
splitInput.addEventListener('change',function(){
var file=splitInput.files[0];
splitDoc=null;
splitResult.textContent='';
splitStatus.textContent='';
refreshSplit();
if(!file)return;
splitStatus.textContent='Reading…';
openPdf(file).then(function(doc){
splitDoc=doc;
splitPages=doc.getPageCount();
splitStatus.textContent='This PDF has '+splitPages+(splitPages===1?' page.':' pages.');
refreshSplit();
}).catch(function(error){
splitStatus.textContent=error.message;
});
});
splitEach.addEventListener('change',refreshSplit);
splitRun.addEventListener('click',function(){
var base=splitInput.files[0].name.replace(/\.[^.]+$/,''),groups;
splitResult.textContent='';
try{
if(splitEach.checked){
groups=splitDoc.getPageIndices().map(function(i){return {label:String(i+1),pages:[i]}});
}else{
groups=parseRanges(splitRanges.value);
}
}catch(error){
splitStatus.textContent=error.message;
return;
}
splitRun.disabled=true;
splitStatus.textContent='Splitting…';
var parts=[],chain=Promise.resolve();
groups.forEach(function(group){
chain=chain.then(function(){return PDFLib.PDFDocument.create()}).then(function(doc){
return doc.copyPages(splitDoc,group.pages).then(function(pages){
pages.forEach(function(page){doc.addPage(page)});
return doc.save();
});
}).then(function(bytes){
parts.push({name:base+'-pages-'+group.label+'.pdf',blob:pdfBlob(bytes)});
});
});
chain.then(function(){
if(parts.length===1)return parts[0];
return ToolKit.loadScript('lib/jszip.min.js').then(function(){
var zip=new JSZip();
parts.forEach(function(part){zip.file(part.name,part.blob)});
return zip.generateAsync({type:'blob'});
}).then(function(blob){
return {name:base+'-split.zip',blob:blob};
});
}).then(function(done){
splitStatus.textContent='Done.';
resultRow(splitResult,done.blob,done.name,parts.length+(parts.length===1?' file':' files'));
}).catch(function(){
splitStatus.textContent='This PDF could not be split.';
}).then(refreshSplit);
});
})();
