(function(){
var el=ToolKit.el;
var input=document.getElementById('conv-file'),output=document.getElementById('conv-output'),run=document.getElementById('conv-run'),status=document.getElementById('conv-status'),result=document.getElementById('conv-result'),note=document.getElementById('conv-note');
var TEXT_IN=['txt','md','log','json','xml','html','htm'],SHEET_IN=['xlsx','xlsm','xls','ods','csv','tsv'];
var DOC_IN=TEXT_IN.concat(SHEET_IN,['docx','pptx','pdf']),IMAGE_IN=['jpg','jpeg','png','webp','gif','bmp','svg','avif','ico'];
var DOC_OUT=['pdf','docx','pptx','xlsx','xls','ods','csv','txt','html','png','jpg'],IMAGE_OUT=['png','jpg','webp','bmp','pdf','docx','pptx'];
var LEGACY={doc:'Old .doc files can\'t be read in a browser. Open it in Word or Google Docs and save it as .docx first.',ppt:'Old .ppt files can\'t be read in a browser. Open it in PowerPoint or Google Slides and save it as .pptx first.',rtf:'RTF isn\'t supported. Save it as .docx or .txt first.',heic:'HEIC isn\'t supported by most browsers. Save it as JPG first.',tif:'TIFF isn\'t supported by most browsers. Save it as PNG first.',tiff:'TIFF isn\'t supported by most browsers. Save it as PNG first.'};
var MAX_BYTES=104857600,MAX_PAGES=300,PAGE_W=1240,PAGE_H=1754,MARGIN=110;
var FONT="Inter,'Nirmala UI','Noto Sans Devanagari',Mukta,sans-serif";
var MIME={pdf:'application/pdf',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',txt:'text/plain;charset=utf-8',html:'text/html;charset=utf-8',csv:'text/csv;charset=utf-8',xls:'application/vnd.ms-excel',xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',ods:'application/vnd.oasis.opendocument.spreadsheet',png:'image/png',jpg:'image/jpeg',webp:'image/webp',bmp:'image/bmp'};

function extension(file){return file.name.split('.').pop().toLowerCase()}
function baseName(file){return file.name.replace(/\.[^.]+$/,'')||'converted'}
function friendly(text){var error=new Error(text);error.friendly=true;return error}
function cellsToText(row){return row.map(function(cell){return cell===null||cell===undefined?'':String(cell)})}
function joined(row){return row.filter(Boolean).join('  ')}
function hasText(doc){return doc.sections.some(function(section){return section.rows.some(function(row){return joined(row).trim()})})}
function canvasBlob(canvas,type,quality){
return new Promise(function(resolve,reject){
canvas.toBlob(function(blob){blob?resolve(blob):reject(friendly('This image could not be created.'))},type,quality);
});
}

function loadPdfJs(){
return import(new URL('lib/pdf.min.mjs',location.href).href).then(function(pdfjs){
pdfjs.GlobalWorkerOptions.workerSrc=new URL('lib/pdf.worker.min.mjs',location.href).href;
return pdfjs;
});
}
function readPdf(file){
return Promise.all([loadPdfJs(),file.arrayBuffer()]).then(function(values){
return values[0].getDocument({data:values[1],isEvalSupported:false,standardFontDataUrl:new URL('lib/standard_fonts/',location.href).href}).promise;
}).catch(function(error){
if(error&&error.name==='PasswordException')throw friendly('This PDF is password protected. Remove the password first.');
throw friendly('This PDF could not be read. It may be damaged.');
}).then(function(pdf){
var doc={sections:[],pdf:pdf},chain=Promise.resolve();
for(var n=1;n<=pdf.numPages;n++)(function(n){
chain=chain.then(function(){
status.textContent='Reading page '+n+' of '+pdf.numPages+'…';
return pdf.getPage(n).then(function(page){return page.getTextContent()}).then(function(content){
var lines=[];
content.items.forEach(function(item){
if(!item.str||!item.str.trim())return;
var x=item.transform[4],y=item.transform[5],line=lines.filter(function(l){return Math.abs(l.y-y)<3})[0];
if(!line){
line={y:y,items:[]};
lines.push(line);
}
line.items.push({x:x,end:x+item.width,text:item.str});
});
lines.sort(function(a,b){return b.y-a.y});
doc.sections.push({title:'Page '+n,loose:true,rows:lines.map(function(line){
var cells=[],last=null;
line.items.sort(function(a,b){return a.x-b.x}).forEach(function(item){
if(last!==null&&item.x-last<12)cells[cells.length-1]+=item.text;
else cells.push(item.text);
last=item.end;
});
return cells;
})});
});
});
})(n);
return chain.then(function(){return doc});
});
}
function rowsFromHtml(html){
var page=new DOMParser().parseFromString(html,'text/html'),rows=[];
page.querySelectorAll('script,style,noscript,template').forEach(function(node){node.remove()});
function walk(node){
[].forEach.call(node.children,function(child){
var tag=child.tagName;
if(tag==='TR'){
rows.push([].map.call(child.children,function(cell){return cell.textContent.trim()}));
}else if(/^(P|H[1-6]|LI|PRE|BLOCKQUOTE)$/.test(tag)&&!child.querySelector('p,li,table')){
rows.push([child.textContent.trim()]);
}else if(child.children.length){
walk(child);
}else if(child.textContent.trim()){
rows.push([child.textContent.trim()]);
}
});
}
walk(page.body);
if(!rows.length&&page.body.textContent.trim())rows.push([page.body.textContent.trim()]);
return rows;
}
function readDocx(file){
return ToolKit.loadScript('lib/mammoth.browser.min.js').then(function(){return file.arrayBuffer()}).then(function(buffer){
return mammoth.convertToHtml({arrayBuffer:buffer});
}).then(function(out){
return {sections:[{title:'',rows:rowsFromHtml(out.value)}]};
}).catch(function(){
throw friendly('This Word file could not be read. It may be damaged.');
});
}
function readPptx(file){
return ToolKit.loadScript('lib/jszip.min.js').then(function(){return file.arrayBuffer()}).then(function(buffer){
return JSZip.loadAsync(buffer);
}).then(function(zip){
var names=Object.keys(zip.files).filter(function(name){return /^ppt\/slides\/slide\d+\.xml$/.test(name)});
names.sort(function(a,b){return a.match(/\d+/)[0]-b.match(/\d+/)[0]});
if(!names.length)throw new Error('empty');
return Promise.all(names.map(function(name){return zip.file(name).async('string')}));
}).then(function(slides){
return {sections:slides.map(function(xml,i){
var xmlDoc=new DOMParser().parseFromString(xml,'application/xml'),rows=[];
[].forEach.call(xmlDoc.getElementsByTagNameNS('*','p'),function(p){
var text=[].map.call(p.getElementsByTagNameNS('*','t'),function(t){return t.textContent}).join('');
if(text.trim())rows.push([text]);
});
return {title:'Slide '+(i+1),rows:rows};
})};
}).catch(function(){
throw friendly('This PowerPoint file could not be read. It may be damaged.');
});
}
function readSheet(file,ext){
return ToolKit.loadScript('lib/xlsx.full.min.js').then(function(){
if(ext==='csv'||ext==='tsv')return file.text().then(function(text){return XLSX.read(text.replace(/^﻿/,''),{type:'string',raw:true,FS:ext==='tsv'?'\t':undefined})});
return file.arrayBuffer().then(function(buffer){return XLSX.read(buffer,{type:'array'})});
}).then(function(book){
return {sections:book.SheetNames.map(function(name){
return {title:name,table:true,rows:XLSX.utils.sheet_to_json(book.Sheets[name],{header:1,raw:false,blankrows:true,defval:''}).map(cellsToText)};
})};
}).catch(function(){
throw friendly('This spreadsheet could not be read. It may be damaged or password protected.');
});
}
function readText(file,ext){
return file.text().then(function(text){
if(ext==='html'||ext==='htm')return {sections:[{title:'',rows:rowsFromHtml(text)}]};
return {sections:[{title:'',rows:text.replace(/^﻿/,'').split(/\r\n|\r|\n/).map(function(line){return [line]})}]};
});
}
function readImage(file){
return new Promise(function(resolve,reject){
var image=new Image(),url=URL.createObjectURL(file);
image.onload=function(){
var canvas=document.createElement('canvas');
canvas.width=image.naturalWidth||1200;
canvas.height=image.naturalHeight||1200;
canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
URL.revokeObjectURL(url);
resolve({sections:[],image:canvas});
};
image.onerror=function(){
URL.revokeObjectURL(url);
reject(friendly('This image could not be read. Your browser may not support its format.'));
};
image.src=url;
});
}
function read(file,ext){
if(IMAGE_IN.indexOf(ext)>=0)return readImage(file);
if(ext==='pdf')return readPdf(file);
if(ext==='docx')return readDocx(file);
if(ext==='pptx')return readPptx(file);
if(SHEET_IN.indexOf(ext)>=0)return readSheet(file,ext);
return readText(file,ext);
}

function wrap(ctx,text,width){
var lines=[];
String(text).split('\n').forEach(function(paragraph){
var line='';
paragraph.split(/(\s+)/).forEach(function(word){
if(ctx.measureText(line+word).width<=width){
line+=word;
return;
}
if(line.trim())lines.push(line.trim());
line='';
while(ctx.measureText(word).width>width){
var cut=Math.max(1,Math.floor(word.length*width/ctx.measureText(word).width));
lines.push(word.slice(0,cut));
word=word.slice(cut);
}
line=word.trim()?word:'';
});
lines.push(line.trim());
});
return lines;
}
function drawnPages(doc,type,quality){
var pending=[],canvas=document.createElement('canvas'),ctx=canvas.getContext('2d'),y=0,dirty=false;
canvas.width=PAGE_W;
canvas.height=PAGE_H;
function clear(){
ctx.fillStyle='#FFF';
ctx.fillRect(0,0,PAGE_W,PAGE_H);
ctx.textBaseline='top';
y=MARGIN;
dirty=false;
}
function next(height){
if(y+height<=PAGE_H-MARGIN||!dirty)return;
if(pending.length>=MAX_PAGES)throw friendly('This file would need more than '+MAX_PAGES+' pages. Split it into smaller files first.');
pending.push(canvasBlob(canvas,type,quality));
clear();
}
clear();
doc.sections.forEach(function(section){
if(section.title){
next(70);
ctx.font='bold 34px '+FONT;
ctx.fillStyle='#14213D';
ctx.fillText(section.title,MARGIN,y);
y+=64;
dirty=true;
}
section.rows.forEach(function(row){
var cells=section.loose?[joined(row)]:row;
if(cells.length<=1){
ctx.font='26px '+FONT;
ctx.fillStyle='#111';
var lines=wrap(ctx,cells[0]||'',PAGE_W-MARGIN*2);
lines.forEach(function(line){
next(38);
ctx.fillText(line,MARGIN,y);
if(line)dirty=true;
y+=38;
});
return;
}
var size=Math.max(13,Math.min(24,Math.floor(150/cells.length))),cellW=(PAGE_W-MARGIN*2)/cells.length,lineH=size*1.4;
ctx.font=size+'px '+FONT;
var wrapped=cells.map(function(cell){return wrap(ctx,cell,cellW-12)}),tallest=Math.max.apply(null,wrapped.map(function(l){return l.length}));
var height=Math.max(1,tallest)*lineH+10;
next(height);
ctx.font=size+'px '+FONT;
ctx.fillStyle='#111';
ctx.strokeStyle='#BBB';
wrapped.forEach(function(lines,c){
var x=MARGIN+c*cellW;
ctx.strokeRect(x,y,cellW,height);
lines.forEach(function(line,l){ctx.fillText(line,x+6,y+5+l*lineH)});
});
y+=height;
dirty=true;
});
y+=24;
});
pending.push(canvasBlob(canvas,type,quality));
return Promise.all(pending);
}
function pdfPages(doc,type,quality){
var pages=[],chain=Promise.resolve();
for(var n=1;n<=Math.min(doc.pdf.numPages,MAX_PAGES);n++)(function(n){
chain=chain.then(function(){
status.textContent='Rendering page '+n+' of '+doc.pdf.numPages+'…';
return doc.pdf.getPage(n).then(function(page){
var view=page.getViewport({scale:2}),canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
canvas.width=view.width;
canvas.height=view.height;
ctx.fillStyle='#FFF';
ctx.fillRect(0,0,canvas.width,canvas.height);
return page.render({canvasContext:ctx,viewport:view}).promise.then(function(){return canvasBlob(canvas,type,quality)});
}).then(function(blob){pages.push(blob)});
});
})(n);
return chain.then(function(){return pages});
}
function flatCanvas(source){
var canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
canvas.width=source.width;
canvas.height=source.height;
ctx.fillStyle='#FFF';
ctx.fillRect(0,0,canvas.width,canvas.height);
ctx.drawImage(source,0,0);
return canvas;
}
function pageBlobs(doc,type,quality){
if(doc.image)return canvasBlob(flatCanvas(doc.image),type,quality).then(function(blob){return [blob]});
if(doc.pdf)return pdfPages(doc,type,quality);
return document.fonts.load('26px Mukta','क').catch(function(){}).then(function(){return drawnPages(doc,type,quality)});
}
function sizeOf(blob){
return createImageBitmap(blob).then(function(bitmap){
var out={width:bitmap.width,height:bitmap.height};
bitmap.close();
return out;
});
}

function writePdf(doc){
return ToolKit.loadScript('lib/pdf-lib.min.js').then(function(){
return Promise.all([PDFLib.PDFDocument.create(),pageBlobs(doc,'image/jpeg',doc.image||doc.pdf?.88:.7)]);
}).then(function(values){
var out=values[0],chain=Promise.resolve();
values[1].forEach(function(blob){
chain=chain.then(function(){return blob.arrayBuffer()}).then(function(bytes){return out.embedJpg(bytes)}).then(function(image){
var scale=doc.image?.75:595.28/image.width,page=out.addPage([image.width*scale,image.height*scale]);
page.drawImage(image,{x:0,y:0,width:image.width*scale,height:image.height*scale});
});
});
return chain.then(function(){return out.save()});
}).then(function(bytes){
return [{blob:new Blob([bytes],{type:MIME.pdf}),ext:'pdf'}];
});
}
function xml(text){
return String(text).replace(/[^\u0009\u000A\u000D -퟿-�\u{10000}-\u{10FFFF}]/gu,'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function docxParagraph(text,bold){
return '<w:p><w:r>'+(bold?'<w:rPr><w:b/></w:rPr>':'')+'<w:t xml:space="preserve">'+xml(text)+'</w:t></w:r></w:p>';
}
function docxBody(doc){
var body='';
doc.sections.forEach(function(section){
if(section.title)body+=docxParagraph(section.title,true);
var table=[];
function closeTable(){
if(!table.length)return;
var columns=Math.max.apply(null,table.map(function(row){return row.length}));
body+='<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblBorders><w:top w:val="single" w:sz="4" w:color="BBBBBB"/><w:left w:val="single" w:sz="4" w:color="BBBBBB"/><w:bottom w:val="single" w:sz="4" w:color="BBBBBB"/><w:right w:val="single" w:sz="4" w:color="BBBBBB"/><w:insideH w:val="single" w:sz="4" w:color="BBBBBB"/><w:insideV w:val="single" w:sz="4" w:color="BBBBBB"/></w:tblBorders></w:tblPr><w:tblGrid>'+new Array(columns+1).join('<w:gridCol/>')+'</w:tblGrid>';
table.forEach(function(row){
body+='<w:tr>';
for(var c=0;c<columns;c++)body+='<w:tc><w:tcPr/>'+docxParagraph(row[c]||'')+'</w:tc>';
body+='</w:tr>';
});
body+='</w:tbl>'+docxParagraph('');
table=[];
}
section.rows.forEach(function(row){
if(!section.loose&&row.length>1){
table.push(row);
return;
}
closeTable();
body+=docxParagraph(joined(row));
});
closeTable();
});
return body;
}
function writeDocx(doc){
return ToolKit.loadScript('lib/jszip.min.js').then(function(){
var zip=new JSZip(),rels='',body,types='<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>';
function finish(){
zip.file('[Content_Types].xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'+types+'<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
zip.file('_rels/.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
zip.file('word/_rels/document.xml.rels','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+rels+'</Relationships>');
zip.file('word/document.xml','<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:body>'+body+'<w:sectPr/></w:body></w:document>');
return zip.generateAsync({type:'blob',mimeType:MIME.docx}).then(function(blob){return [{blob:blob,ext:'docx'}]});
}
if(!doc.image){
body=docxBody(doc);
return finish();
}
return canvasBlob(flatCanvas(doc.image),'image/jpeg',.92).then(function(blob){
var maxW=5943600,w=doc.image.width*9525,h=doc.image.height*9525,scale=Math.min(1,maxW/w);
w=Math.round(w*scale);
h=Math.round(h*scale);
zip.file('word/media/image1.jpg',blob);
types+='<Default Extension="jpg" ContentType="image/jpeg"/>';
rels='<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image1.jpg"/>';
body='<w:p><w:r><w:drawing><wp:inline><wp:extent cx="'+w+'" cy="'+h+'"/><wp:docPr id="1" name="Image"/><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="1" name="Image"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="'+w+'" cy="'+h+'"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>';
return finish();
});
});
}
function blobToDataUrl(blob){
return new Promise(function(resolve,reject){
var reader=new FileReader();
reader.onload=function(){resolve(reader.result)};
reader.onerror=reject;
reader.readAsDataURL(blob);
});
}
function writePptx(doc){
return ToolKit.loadScript('lib/pptxgen.bundle.js').then(function(){
var deck=new PptxGenJS(),W=10,H=5.625;
deck.layout='LAYOUT_16x9';
function save(){
return deck.write({outputType:'blob'}).then(function(blob){return [{blob:blob,ext:'pptx'}]});
}
if(doc.image||doc.pdf){
return pageBlobs(doc,'image/jpeg',.88).then(function(pages){
var chain=Promise.resolve();
pages.forEach(function(blob){
chain=chain.then(function(){return Promise.all([blobToDataUrl(blob),sizeOf(blob)])}).then(function(values){
var size=values[1],scale=Math.min(W/size.width,H/size.height),w=size.width*scale,h=size.height*scale;
deck.addSlide().addImage({data:values[0],x:(W-w)/2,y:(H-h)/2,w:w,h:h});
});
});
return chain;
}).then(save);
}
doc.sections.forEach(function(section){
var lines=section.rows.map(function(row){return section.table?row.filter(Boolean).join(' | '):joined(row)}).filter(function(line){return line.trim()});
for(var i=0;i<lines.length||i===0;i+=14){
var slide=deck.addSlide();
if(section.title)slide.addText(section.title,{x:.5,y:.25,w:9,h:.6,fontSize:24,bold:true,color:'0B3B3C'});
var part=lines.slice(i,i+14).join('\n');
if(part)slide.addText(part,{x:.5,y:section.title?.95:.4,w:9,h:section.title?4.3:4.8,fontSize:14,color:'111111',valign:'top',fit:'shrink'});
}
});
return save();
});
}
function safeSheetName(title,used,index){
var name=(title||'Sheet'+(index+1)).replace(/[\[\]:*?\/\\]/g,' ').slice(0,31).trim()||'Sheet'+(index+1),candidate=name,n=2;
while(used[candidate.toLowerCase()])candidate=name.slice(0,27)+' '+n++;
used[candidate.toLowerCase()]=true;
return candidate;
}
function writeBook(doc,ext){
return ToolKit.loadScript('lib/xlsx.full.min.js').then(function(){
var book=XLSX.utils.book_new(),used={};
doc.sections.forEach(function(section,i){
var rows=section.rows.map(function(row){return row.map(function(cell){return String(cell).slice(0,32767)})});
XLSX.utils.book_append_sheet(book,XLSX.utils.aoa_to_sheet(rows),safeSheetName(section.title,used,i));
});
if(!book.SheetNames.length)XLSX.utils.book_append_sheet(book,XLSX.utils.aoa_to_sheet([]),'Sheet1');
var bytes=XLSX.write(book,{bookType:ext==='xls'?'biff8':ext,type:'array'});
return [{blob:new Blob([bytes],{type:MIME[ext]}),ext:ext}];
});
}
function csvCell(cell){
cell=String(cell);
return /[",\r\n]/.test(cell)?'"'+cell.replace(/"/g,'""')+'"':cell;
}
function writeCsv(doc){
return doc.sections.map(function(section){
var text='﻿'+section.rows.map(function(row){return row.map(csvCell).join(',')}).join('\r\n');
return {blob:new Blob([text],{type:MIME.csv}),ext:'csv',part:section.title};
});
}
function writeTxt(doc){
var text=doc.sections.map(function(section){
return (section.title&&doc.sections.length>1?section.title+'\n\n':'')+section.rows.map(function(row){return row.join('\t')}).join('\n');
}).join('\n\n');
return [{blob:new Blob([text],{type:MIME.txt}),ext:'txt'}];
}
function html(text){
return String(text).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function writeHtml(doc){
var body='';
doc.sections.forEach(function(section){
if(section.title)body+='<h2>'+html(section.title)+'</h2>\n';
var open=false;
section.rows.forEach(function(row){
if(!section.loose&&row.length>1){
if(!open)body+='<table>\n';
open=true;
body+='<tr>'+row.map(function(cell){return '<td>'+html(cell)+'</td>'}).join('')+'</tr>\n';
return;
}
if(open)body+='</table>\n';
open=false;
body+='<p>'+html(joined(row))+'</p>\n';
});
if(open)body+='</table>\n';
});
var page='<!doctype html>\n<html><head><meta charset="utf-8"><title>Converted document</title><style>body{font-family:sans-serif;max-width:800px;margin:2em auto;padding:0 1em}table{border-collapse:collapse}td{border:1px solid #bbb;padding:4px 8px}</style></head><body>\n'+body+'</body></html>';
return [{blob:new Blob([page],{type:MIME.html}),ext:'html'}];
}
function bmpBlob(canvas){
var ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height,pixels=ctx.getImageData(0,0,w,h).data,stride=Math.ceil(w*3/4)*4,size=54+stride*h,bytes=new Uint8Array(size),view=new DataView(bytes.buffer);
bytes[0]=66;
bytes[1]=77;
view.setUint32(2,size,true);
view.setUint32(10,54,true);
view.setUint32(14,40,true);
view.setInt32(18,w,true);
view.setInt32(22,h,true);
view.setUint16(26,1,true);
view.setUint16(28,24,true);
view.setUint32(34,stride*h,true);
for(var y=0;y<h;y++){
var row=54+(h-1-y)*stride;
for(var x=0;x<w;x++){
var from=(y*w+x)*4,to=row+x*3;
bytes[to]=pixels[from+2];
bytes[to+1]=pixels[from+1];
bytes[to+2]=pixels[from];
}
}
return new Blob([bytes],{type:MIME.bmp});
}
function writeImages(doc,ext){
if(ext==='bmp')return Promise.resolve([{blob:bmpBlob(flatCanvas(doc.image)),ext:'bmp'}]);
var type=MIME[ext];
if(ext==='png'&&doc.image)return canvasBlob(doc.image,type).then(function(blob){return [{blob:blob,ext:ext}]});
return pageBlobs(doc,type,.92).then(function(pages){
return pages.map(function(blob,i){
if(blob.type!==type)throw friendly('Your browser cannot create '+ext.toUpperCase()+' images.');
return {blob:blob,ext:ext,part:pages.length>1?'page-'+(i+1):''};
});
});
}
function write(doc,ext){
if(ext==='pdf')return writePdf(doc);
if(ext==='docx')return writeDocx(doc);
if(ext==='pptx')return writePptx(doc);
if(ext==='xlsx'||ext==='xls'||ext==='ods')return writeBook(doc,ext);
if(ext==='csv')return Promise.resolve(writeCsv(doc));
if(ext==='txt')return Promise.resolve(writeTxt(doc));
if(ext==='html')return Promise.resolve(writeHtml(doc));
return writeImages(doc,ext);
}
function needsText(ext){
return ['docx','xlsx','xls','ods','csv','txt','html'].indexOf(ext)>=0;
}
function packed(files,base){
if(files.length===1)return Promise.resolve({blob:files[0].blob,name:base+'.'+files[0].ext});
return ToolKit.loadScript('lib/jszip.min.js').then(function(){
var zip=new JSZip(),used={};
files.forEach(function(file,i){
var part=(file.part||String(i+1)).replace(/[\\\/:*?"<>|]/g,' ').trim()||String(i+1),name=part+'.'+file.ext;
if(used[name])name=part+'-'+(i+1)+'.'+file.ext;
used[name]=true;
zip.file(name,file.blob);
});
return zip.generateAsync({type:'blob'});
}).then(function(blob){
return {blob:blob,name:base+'-'+files[0].ext+'.zip'};
});
}
function warning(ext,out){
if(IMAGE_IN.indexOf(ext)>=0)return '';
if(['pdf','png','jpg'].indexOf(out)>=0&&ext!=='pdf')return 'Text and tables are kept, but the original layout, fonts and pictures are not. Text in the result can\'t be selected.';
if(ext==='pdf'&&(out==='png'||out==='jpg'))return 'Each page becomes one image.';
if(ext==='pdf'&&out==='pptx')return 'Each page becomes a picture on a slide, so it looks right but can\'t be edited as text.';
if(ext==='pdf')return 'Only the text is converted. Layout and pictures are lost, and scanned PDFs have no text to convert.';
if(out==='xlsx'||out==='xls'||out==='ods'||out==='csv')return ext==='docx'||ext==='pptx'?'Each paragraph becomes a row. Pictures and layout are lost.':'';
return 'Text and tables are kept. Pictures, fonts and layout are lost.';
}
function refresh(){
var file=input.files[0];
output.textContent='';
result.textContent='';
status.textContent='';
note.textContent='';
run.disabled=true;
if(!file)return;
var ext=extension(file);
if(LEGACY[ext]){
status.textContent=LEGACY[ext];
return;
}
var image=IMAGE_IN.indexOf(ext)>=0;
if(!image&&DOC_IN.indexOf(ext)<0){
status.textContent='.'+ext+' files aren\'t supported here. For video and audio, use the video converter.';
return;
}
if(file.size>MAX_BYTES){
status.textContent='This file is over 100 MB, which is too large to convert in a browser.';
return;
}
var same=ext==='jpeg'?'jpg':ext==='htm'?'html':ext;
(image?IMAGE_OUT:DOC_OUT).forEach(function(out){
if(out===same)return;
var option=el('option','',out.toUpperCase());
option.value=out;
output.appendChild(option);
});
run.disabled=false;
note.textContent=warning(ext,output.value);
status.textContent=ToolKit.sizeWarning(file.size,30*1048576);
}
input.addEventListener('change',refresh);
output.addEventListener('change',function(){
result.textContent='';
var file=input.files[0];
note.textContent=file?warning(extension(file),output.value):'';
});
run.addEventListener('click',function(){
var file=input.files[0],out=output.value,ext=extension(file);
run.disabled=true;
result.textContent='';
status.textContent='Converting…';
read(file,ext).then(function(doc){
if(!doc.image&&needsText(out)&&!hasText(doc))throw friendly(ext==='pdf'?'This PDF has no text to convert. It is probably a scan, so try PNG or JPG instead.':'This file has no text to convert.');
status.textContent='Creating '+out.toUpperCase()+'…';
return write(doc,out);
}).then(function(files){
return packed(files,baseName(file));
}).then(function(done){
status.textContent='Done.';
var row=el('div','tool-panel tool-result'),info=el('div');
info.appendChild(el('p','tool-result-name',done.name));
info.appendChild(el('p','tool-note',ToolKit.size(file.size)+' → '+ToolKit.size(done.blob.size)));
row.appendChild(info);
row.appendChild(ToolKit.saveLink(done.blob,done.name,'Download'));
result.appendChild(row);
}).catch(function(error){
status.textContent=error&&error.friendly?error.message:'This conversion failed. The file may be damaged or too large for your device.';
if(window.console)console.error(error);
}).then(function(){
run.disabled=false;
});
});
})();
