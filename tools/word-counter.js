(function(){
var text=document.getElementById('wc-text');
var fields={words:'wc-words',chars:'wc-chars',noSpaces:'wc-nospaces',sentences:'wc-sentences',paragraphs:'wc-paragraphs',reading:'wc-reading'};
var wordSegmenter=window.Intl&&Intl.Segmenter?new Intl.Segmenter(undefined,{granularity:'word'}):null;
var letterSegmenter=wordSegmenter?new Intl.Segmenter(undefined,{granularity:'grapheme'}):null;

function countWords(value){
if(!value.trim())return 0;
if(!wordSegmenter)return value.trim().split(/\s+/).length;
var total=0,parts=wordSegmenter.segment(value);
for(var part of parts)if(part.isWordLike)total++;
return total;
}
function countLetters(value){
if(!letterSegmenter)return Array.from(value).length;
var total=0;
for(var part of letterSegmenter.segment(value))total++;
return total;
}
function show(key,value){
document.getElementById(fields[key]).textContent=value;
}
function update(){
var value=text.value,words=countWords(value),minutes=Math.ceil(words/200);
show('words',words.toLocaleString('en-US'));
show('chars',countLetters(value).toLocaleString('en-US'));
show('noSpaces',countLetters(value.replace(/\s/g,'')).toLocaleString('en-US'));
show('sentences',value.split(/[.!?।॥]+(?:\s|$)/).filter(function(s){return s.trim()}).length.toLocaleString('en-US'));
show('paragraphs',value.split(/(?:\r?\n\s*){2,}/).filter(function(p){return p.trim()}).length.toLocaleString('en-US'));
show('reading',words?minutes+' min':'0 min');
}
text.addEventListener('input',update);
update();
})();
