(function(){
var SETS={upper:'ABCDEFGHIJKLMNOPQRSTUVWXYZ',lower:'abcdefghijklmnopqrstuvwxyz',digits:'0123456789',symbols:'!@#$%^&*()-_=+[]{};:,.?/'};
var AMBIGUOUS=/[Il1O0o|]/g;
var output=document.getElementById('pw-output'),length=document.getElementById('pw-length'),lengthOut=document.getElementById('pw-length-value'),again=document.getElementById('pw-generate'),copy=document.getElementById('pw-copy'),status=document.getElementById('pw-status'),strength=document.getElementById('pw-strength'),clear=document.getElementById('pw-similar');
var boxes=Object.keys(SETS).map(function(key){return {key:key,box:document.getElementById('pw-'+key)}});

function randomBelow(limit){
var space=Math.floor(4294967296/limit)*limit,value=new Uint32Array(1);
do{crypto.getRandomValues(value)}while(value[0]>=space);
return value[0]%limit;
}
function generate(){
var chosen=boxes.filter(function(item){return item.box.checked}).map(function(item){
return clear.checked?SETS[item.key].replace(AMBIGUOUS,''):SETS[item.key];
});
status.textContent='';
if(!chosen.length){
output.value='';
strength.textContent='';
status.textContent='Choose at least one type of character.';
return;
}
var size=+length.value,pool=chosen.join(''),chars=chosen.map(function(set){return set[randomBelow(set.length)]});
while(chars.length<size)chars.push(pool[randomBelow(pool.length)]);
for(var i=chars.length-1;i>0;i--){
var j=randomBelow(i+1),swap=chars[i];
chars[i]=chars[j];
chars[j]=swap;
}
output.value=chars.join('');
var bits=Math.round(size*Math.log2(pool.length));
strength.textContent=(bits<60?'Weak':bits<80?'Good':'Strong')+' · about '+bits+' bits of randomness';
}
length.addEventListener('input',function(){
lengthOut.textContent=length.value;
generate();
});
boxes.forEach(function(item){item.box.addEventListener('change',generate)});
clear.addEventListener('change',generate);
again.addEventListener('click',generate);
copy.addEventListener('click',function(){
if(!output.value)return;
navigator.clipboard.writeText(output.value).then(function(){
status.textContent='Copied.';
}).catch(function(){
output.select();
status.textContent='Press Ctrl+C to copy.';
});
});
generate();
})();
