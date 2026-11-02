(function(){
var ROOT=new URL('.',document.currentScript.src).href;
var ITEMS=[
['Home','Page','./#top','start top hero'],
['Selected work','Page','./#work','projects portfolio'],
['About','Page','./#about','education me bio'],
['Skills','Page','./#skills','languages html css javascript python'],
['Contact','Page','./#contact','email message hire'],
['All tools','Page','tools/','tools list'],
['File converter','Tool','tools/file-converter','pdf word excel powerpoint image convert'],
['Video and audio converter','Tool','tools/video-converter','mp4 mp3 webm gif convert'],
['BS ↔ AD date converter','Tool','tools/date-converter','nepali date miti bikram sambat'],
['Nepali calendar','Tool','tools/calendar','patro bikram sambat month'],
['World clock','Tool','tools/world-clock','time zone city'],
['Weather search','Tool','tools/weather','forecast rain temperature'],
['Image compressor','Tool','tools/image-compressor','photo resize reduce jpg png'],
['QR code generator','Tool','tools/qr-code','qr link scan'],
['Photo to QR code','Tool','tools/qr-code#photo','photo picture image share scan upload'],
['Land unit converter','Tool','tools/land-units','ropani aana bigha kattha'],
['Preeti ↔ Unicode converter','Tool','tools/preeti-unicode','nepali font'],
['PDF merge and split','Tool','tools/pdf-tools','pdf join combine pages'],
['GPA and percentage calculator','Tool','tools/gpa-calculator','grade marks result'],
['Password generator','Tool','tools/password-generator','secure random'],
['Word and character counter','Tool','tools/word-counter','count essay letters'],
['Resume builder','Tool','tools/resume-builder','cv biodata pdf'],
['Nepali typing','Tool','tools/nepali-typing','romanized unicode type'],
['Typing practice','Tool','tools/typing-test','wpm speed test keyboard'],
['Nepal vehicle tax calculator','Tool','tools/vehicle-tax','bluebook renewal bike car'],
['Switch light or dark theme','Action','theme','dark light mode colour']
].map(function(row){return {title:row[0],kind:row[1],target:row[2],text:(row[0]+' '+row[1]+' '+row[3]).toLowerCase()}});
var dialog,input,list,shown=[],active=0,opener;

function el(tag,className,text){
var node=document.createElement(tag);
if(className)node.className=className;
if(text!==undefined)node.textContent=text;
return node;
}
function run(item){
dialog.close();
if(item.target==='theme'){
var toggle=document.getElementById('theme-toggle');
if(toggle)toggle.click();
return;
}
location.href=ROOT+item.target;
}
function render(){
var words=input.value.toLowerCase().split(/\s+/).filter(Boolean);
shown=ITEMS.filter(function(item){return words.every(function(word){return item.text.indexOf(word)>=0})});
active=Math.min(active,Math.max(shown.length-1,0));
list.textContent='';
if(!shown.length){
list.appendChild(el('li','cmd-empty','Nothing found. Try a simpler word.'));
input.removeAttribute('aria-activedescendant');
return;
}
shown.forEach(function(item,i){
var row=el('li','cmd-item');
row.id='cmd-item-'+i;
row.setAttribute('role','option');
row.setAttribute('aria-selected',i===active);
row.appendChild(el('span','cmd-title',item.title));
row.appendChild(el('span','cmd-kind',item.kind));
row.addEventListener('click',function(){run(item)});
row.addEventListener('mousemove',function(){
if(active!==i){active=i;render()}
});
list.appendChild(row);
});
input.setAttribute('aria-activedescendant','cmd-item-'+active);
var current=list.children[active];
if(current&&current.scrollIntoView)current.scrollIntoView({block:'nearest'});
}
function build(){
var link=el('link');
link.rel='stylesheet';
link.href=ROOT+'palette.css';
document.head.appendChild(link);
dialog=el('dialog','cmd');
dialog.setAttribute('aria-label','Search the site');
input=el('input','cmd-input');
input.type='search';
input.placeholder='Search pages and tools…';
input.autocomplete='off';
input.setAttribute('role','combobox');
input.setAttribute('aria-expanded','true');
input.setAttribute('aria-controls','cmd-list');
input.setAttribute('aria-label','Search pages and tools');
list=el('ul','cmd-list');
list.id='cmd-list';
list.setAttribute('role','listbox');
dialog.appendChild(input);
dialog.appendChild(list);
dialog.appendChild(el('p','cmd-hint','↑ ↓ to move · Enter to open · Esc to close'));
input.addEventListener('input',function(){active=0;render()});
input.addEventListener('keydown',function(e){
if(e.key==='ArrowDown'||e.key==='ArrowUp'){
e.preventDefault();
if(shown.length)active=(active+(e.key==='ArrowDown'?1:-1)+shown.length)%shown.length;
render();
}else if(e.key==='Enter'&&shown[active]){
e.preventDefault();
run(shown[active]);
}
});
dialog.addEventListener('click',function(e){if(e.target===dialog)dialog.close()});
dialog.addEventListener('close',function(){if(opener)opener.focus()});
document.body.appendChild(dialog);
}
function open(){
if(!dialog)build();
if(dialog.open)return;
opener=document.activeElement;
input.value='';
active=0;
render();
dialog.showModal();
input.focus();
}
document.addEventListener('keydown',function(e){
if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){
e.preventDefault();
open();
}
});
document.addEventListener('DOMContentLoaded',function(){
var host=document.getElementById('wx');
if(!host)return;
var button=el('button','theme-toggle cmd-open');
button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>';
button.type='button';
button.title='Search the site (Ctrl+K)';
button.setAttribute('aria-label','Search the site');
button.setAttribute('aria-keyshortcuts','Control+K');
button.addEventListener('click',open);
host.appendChild(button);
});
})();
