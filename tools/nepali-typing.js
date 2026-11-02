(function(){
var input=document.getElementById('ne-input'),output=document.getElementById('ne-output'),digits=document.getElementById('ne-digits'),copy=document.getElementById('ne-copy'),clear=document.getElementById('ne-clear'),status=document.getElementById('ne-status');

function update(){
output.value=RomanNepali.convert(input.value,digits.checked);
status.textContent='';
}
input.addEventListener('input',update);
digits.addEventListener('change',update);
clear.addEventListener('click',function(){
input.value='';
update();
input.focus();
});
copy.addEventListener('click',function(){
if(!output.value)return;
navigator.clipboard.writeText(output.value).then(function(){
status.textContent='Copied.';
}).catch(function(){
output.select();
status.textContent='Press Ctrl+C to copy.';
});
});
update();
})();
