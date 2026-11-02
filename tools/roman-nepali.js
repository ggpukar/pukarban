(function(){
var CONSONANTS={ksh:'क्ष',chh:'छ',kh:'ख',gh:'घ',ng:'ङ',ch:'च',jh:'झ',yn:'ञ',Th:'ठ',Dh:'ढ',th:'थ',dh:'ध',ph:'फ',bh:'भ',sh:'श',gy:'ज्ञ',k:'क',g:'ग',j:'ज',T:'ट',D:'ड',N:'ण',t:'त',d:'द',n:'न',p:'प',f:'फ',b:'ब',m:'म',y:'य',r:'र',l:'ल',v:'व',w:'व',s:'स',S:'ष',h:'ह',x:'क्ष',q:'क',c:'क',z:'ज'};
var VOWELS={aa:['आ','ा'],ai:['ऐ','ै'],au:['औ','ौ'],ou:['औ','ौ'],ee:['ई','ी'],ii:['ई','ी'],oo:['ऊ','ू'],uu:['ऊ','ू'],Ri:['ऋ','ृ'],A:['आ','ा'],I:['ई','ी'],U:['ऊ','ू'],R:['ऋ','ृ'],a:['अ',''],i:['इ','ि'],u:['उ','ु'],e:['ए','े'],o:['ओ','ो']};
var MARKS={M:'ं','~':'ँ',H:'ः'};
var WORDS={ramro:'राम्रो',nepal:'नेपाल',nepali:'नेपाली',kathmandu:'काठमाडौं',dhanyabad:'धन्यवाद',timi:'तिमी',hami:'हामी',malai:'मलाई',tapai:'तपाईं'};
var DIGITS='०१२३४५६७८९';

function longest(table,word,at){
for(var size=3;size>0;size--){
var part=word.substr(at,size);
if(part.length===size&&Object.prototype.hasOwnProperty.call(table,part))return part;
}
return '';
}
function convertWord(word){
if(Object.prototype.hasOwnProperty.call(WORDS,word.toLowerCase()))return WORDS[word.toLowerCase()];
var out='',after=false,i=0;
while(i<word.length){
var vowel=longest(VOWELS,word,i);
if(vowel){
out+=VOWELS[vowel][after?1:0];
after=false;
i+=vowel.length;
continue;
}
var ch=word[i];
if(ch==='_'){
if(after)out+='्';
after=false;
i++;
continue;
}
if(MARKS[ch]){
out+=MARKS[ch];
after=false;
i++;
continue;
}
var consonant=longest(CONSONANTS,word,i);
if(consonant==='ng'&&/^[aeiouAIUh]/.test(word.slice(i+2)))consonant='n';
if(!consonant&&CONSONANTS[ch.toLowerCase()])consonant=ch.toLowerCase();
if(!consonant){
out+=ch;
after=false;
i++;
continue;
}
out+=(after?'्':'')+CONSONANTS[consonant];
after=true;
i+=consonant.length;
}
return out;
}
function convertPlain(text,nepaliDigits){
return text.replace(/[A-Za-z_~]+|\.+|\d/g,function(part,at,all){
if(/\d/.test(part))return nepaliDigits?DIGITS[+part]:part;
if(part[0]==='.'){
if(part==='.'&&/\d/.test(all[at-1]||'')&&/\d/.test(all[at+1]||''))return '.';
return part==='.'?'।':part.slice(1);
}
return convertWord(part);
});
}
window.RomanNepali={
convert:function(text,nepaliDigits){
return text.split(/(\{[^{}]*\})/).map(function(part,i){
return i%2?part.slice(1,-1):convertPlain(part,nepaliDigits);
}).join('');
}
};
})();
