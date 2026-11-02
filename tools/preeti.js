(function(){
var mode=document.getElementById('pr-mode'),source=document.getElementById('pr-source'),result=document.getElementById('pr-result'),swap=document.getElementById('pr-swap'),copy=document.getElementById('pr-copy'),status=document.getElementById('pr-status');
var sourceLabel=document.getElementById('pr-source-label'),resultLabel=document.getElementById('pr-result-label');

function update(){
var toUnicode=mode.value==='unicode';
sourceLabel.textContent=toUnicode?'Preeti text':'Unicode text';
resultLabel.textContent=toUnicode?'Unicode result':'Preeti result';
status.textContent='';
try{
result.value=source.value?(toUnicode?NepaliConverter.convert(source.value,'preeti'):PreetiEncoder.unicodeToPreeti(source.value)):'';
}catch(e){
result.value='';
status.textContent='This text could not be converted.';
}
}
mode.addEventListener('change',update);
source.addEventListener('input',update);
swap.addEventListener('click',function(){
source.value=result.value;
mode.value=mode.value==='unicode'?'preeti':'unicode';
update();
});
copy.addEventListener('click',function(){
if(!result.value)return;
navigator.clipboard.writeText(result.value).then(function(){
status.textContent='Copied.';
}).catch(function(){
result.select();
status.textContent='Press Ctrl+C to copy.';
});
});
update();
})();
