(function(){
var el=ToolKit.el,BEST='typingBest',BATCH=60;
var ENGLISH='the of and to in is it you that he was for on are with as his they be at one have this from or had by but some what there we can out other were all your when up use word how said an each she which do their time if will way about many then them would write like so these her long make thing see him two has look more day could go come did my sound no most number who over know water than call first people may down side been now find any new work part take get place made live where after back little only round man year came show every good me give our under name very through just form much great think say help low line before turn cause same mean differ move right boy old too does tell sentence set three want air well also play small end put home read hand port large spell add even land here must big high such follow act why ask men change went light kind off need house picture try us again animal point mother world near build self earth father head stand own page should country found answer school grow study still learn plant cover food sun four thought let keep eye never last door between city tree cross since hard start might story saw far sea draw left late run while press close night real life few stop open seem together next white children begin got walk example ease paper often always music those both mark book letter until mile river car feet care second group carry took rain eat room friend began idea fish mountain north once base hear horse cut sure watch color face wood main'.split(' ');
var NEPALI='ma mero timi hami ghar baaTo aamaa buwaa daai bahinee bhaai didee saathee kitaab paanee khaanaa bhaat daal chiyaa ramro dherai thorai saano Thulo nayaa puraano raato nilo seto kaalo himaal pahaaD nadee shahar nepal nepali kathmandu pokharaa bhaktapur namaste dhanyabad garnu jaanu aaunu khaanu basnu hernu lekhnu paDhnu sunnu bolnu aaja bholi hijo raati bihaana din mahinaa samaya kaam paisaa bajaar widyaalaya shikshak widyaarthee desh maayaa khushee sapanaa bhaaSaa akshar shabda hajur'.split(' ');
var PARAGRAPHS=[
'Bhaktapur wakes up early. Before the shops open, people walk to the temple with small plates of flowers, and the smell of fresh bread drifts across the square. By noon the old brick streets are full of visitors, children and potters drying their work in the sun.',
'A good habit is built in small steps. If you practise for ten minutes every day, you will improve faster than someone who practises for two hours once a month. Keep your eyes on the screen, trust your fingers, and do not worry about mistakes at the start.',
'The bus to Pokhara left just after sunrise. It climbed slowly past green hills, narrow rivers and tiny villages where farmers were already at work. When the clouds finally opened, the mountains stood white and huge above the lake, and everyone on the bus went quiet.',
'Learning to code feels hard in the first few weeks. A missing bracket can stop a whole program, and the error message may not make any sense. Then one day your small project works, and you understand that every expert once sat in the same confused place.',
'Rain arrived in the afternoon without any warning. The street sellers covered their fruit with plastic sheets, and students ran laughing towards the nearest roof. Twenty minutes later the sun was back, the road was shining, and the air smelled clean and cool.',
'My grandmother keeps her recipes in her head. She never measures the salt or checks the clock, yet her food tastes the same every time. When I ask her how she does it, she smiles and tells me to cook it a hundred times and then ask again.',
'A library is one of the quietest places in any city. You can sit by the window with a book for hours, and nobody will ask you to hurry. Each shelf holds a different world, and the only ticket you need to visit it is a little patience.',
'Tea is more than a drink in Nepal. It is how a neighbour says welcome, how a long meeting begins, and how a cold morning becomes easier. Sit at any small roadside stall, and you may leave with a warm stomach, a new friend and some advice you never asked for.',
'The football match was almost over when the rain began to fall. Both teams were tired, and the score was still level. Then a young player on the left side took one last chance, and the ball rolled slowly past the keeper while the whole field shouted.',
'Saving money is easier when you have a clear reason for it. Write down what you want, work out what it costs, and set aside a small amount each week. After a few months, the number will grow, and you will be surprised at how much those small amounts can do.',
'Night comes quickly in the hills. One moment the valley is gold, and the next it is filled with blue shadows and the sound of distant dogs. Lights appear one by one on the far slopes, until it is hard to tell where the villages end and the stars begin.',
'Every website starts as a blank page. You add a heading, a few lines of text and perhaps a picture, and then you test it on a small phone. Most of the work is in the details, such as clear words, fast loading and buttons that are easy to press.',
'The power went out just as the exam notes were open on my screen. I lit a candle, found a pencil and kept reading from the printed pages. When the lights came back two hours later, I had finished the chapter and learned that paper still has its uses.',
'A small shop near our gate sells almost everything. You can buy rice, soap, a phone recharge and a cold drink in one visit, and the owner knows every family by name. If you are short of money, he simply writes it in his book and smiles.',
'Planting a tree takes only an hour, but caring for it takes years. It needs water in the dry months, a fence to keep the goats away and a little patience when it seems to stop growing. One day, its shade will cool someone you will never meet.',
'The best way to remember something is to teach it to someone else. When you explain an idea in your own words, you quickly notice the parts you do not really understand. Then you go back, read again and try once more until it feels simple.',
'Our village festival begins with drums at dawn. Families gather in their brightest clothes, the elders bless the young, and the smell of sweets fills every lane. By evening, the whole square is dancing, and nobody is in a hurry to go home.',
'A phone can be a great teacher or a great thief of time. The same screen that shows you a lesson can also pull you into an hour of short videos. Turning off a few alerts is one of the easiest ways to take back control of your day.',
'Cycling to college is slower than the bus, but it has its rewards. I see the sunrise over the fields, I wave to the same tea seller every morning, and I arrive with a clear head. On rainy days, though, I am very happy to take the bus.',
'The old map on the wall shows roads that no longer exist. Some villages have new names, and a few rivers have moved over the years. Still, I like looking at it, because it reminds me that every place is always slowly changing.',
'Good questions are often more useful than quick answers. Before you search for a solution, write down exactly what is wrong and what you have already tried. Very often, the act of writing the problem clearly is enough to show you the way forward.',
'The trek to the viewpoint started in thick fog. For three hours we saw only the stones under our feet and the backs of our friends. Then, near the top, the fog fell away, and the whole range of snowy peaks appeared in the morning light.',
'Cooking dal bhat for the first time taught me a lot about timing. The rice was ready too early, the lentils needed more water and the vegetables were nearly burnt. The next time I planned each step, and the meal was finally hot all at once.',
'A clean desk makes it easier to start work. Put away what you do not need, keep a glass of water close and write the one task you want to finish today at the top of a page. Small choices like these can turn a slow morning into a useful one.'
];
var NEPALI_PARAGRAPHS=["mero ghar bhaktapuramaa chha. bihaana aamaa chiyaa banaaunuhunchha ra buwaa bajaar jaanuhunchha. ma kitaab liera widyaalaya jaanchhu.","aaja aakaash nilo chha. TaaDhaa himaal seto dekhinchha. saatheeharuusa~ga pahaaDamaa hi~Dna jaa~daa mana khushee hunchha.","nepal saano desh ho tara yahaa~ dherai bhaaSaa bolinchha. himaal pahaaD ra taraaiimaa pharak pharak chaaD manaainchha.","raati paanee paryo. bihaana baaTo bhijeko thiyo tara hawaa saphaa thiyo. bahineele chhaataa birsee ra haamee dubai haa~syau~.","shikshakale bhannubhayo ki dinahu~ thorai paDhdaa dherai sikinchha. ma aba har din das mineT abhyaas garchhu.","bajaaramaa taajaa tarakaaree paainchha. dideele aaluu ra keraa kinnubhayo. ghar pharkanu aghi haameele pasalamaa chiyaa piyau~.","kampyuTar sikna surumaa kaThin laagchha. euTaa saano galteele puuraa kaam rokinchha. tara dherai abhyaas pachhi sabai kuraa sajilo hunchha.","tihaar aau~daa gharamaa ramaailo hunchha. bachchaaharuuko laagi yo sabai bhandaa ramro chaaD ho. raati sabai gharamaa battee balchha."];
var KEY_ROWS=[
[['Backquote','`','~'],['Digit1','1','!'],['Digit2','2','@'],['Digit3','3','#'],['Digit4','4','$'],['Digit5','5','%'],['Digit6','6','^'],['Digit7','7','&'],['Digit8','8','*'],['Digit9','9','('],['Digit0','0',')'],['Minus','-','_'],['Equal','=','+'],['Backspace','⌫','','wider']],
[['Tab','Tab','','wide'],['KeyQ','q','Q'],['KeyW','w','W'],['KeyE','e','E'],['KeyR','r','R'],['KeyT','t','T'],['KeyY','y','Y'],['KeyU','u','U'],['KeyI','i','I'],['KeyO','o','O'],['KeyP','p','P'],['BracketLeft','[','{'],['BracketRight',']','}'],['Backslash','\\','|','wide']],
[['CapsLock','Caps','','wider'],['KeyA','a','A'],['KeyS','s','S'],['KeyD','d','D'],['KeyF','f','F'],['KeyG','g','G'],['KeyH','h','H'],['KeyJ','j','J'],['KeyK','k','K'],['KeyL','l','L'],['Semicolon',';',':'],['Quote',"'",'"'],['Enter','Enter','','wider']],
[['ShiftLeft','Shift','','wider'],['KeyZ','z','Z'],['KeyX','x','X'],['KeyC','c','C'],['KeyV','v','V'],['KeyB','b','B'],['KeyN','n','N'],['KeyM','m','M'],['Comma',',','<'],['Period','.','>'],['Slash','/','?'],['ShiftRight','Shift','','wider']],
[['ControlLeft','Ctrl','','wide'],['AltLeft','Alt','','wide'],['Space','Space','','space'],['AltRight','Alt','','wide'],['ControlRight','Ctrl','','wide']]
];
var keyboard=document.getElementById('tt-keyboard'),keys={},charKeys={},lastKeydown=0,lastParagraph=-1,missed={};
var box=document.getElementById('tt-words'),input=document.getElementById('tt-input'),language=document.getElementById('tt-language'),seconds=document.getElementById('tt-seconds'),restart=document.getElementById('tt-restart'),timeOut=document.getElementById('tt-time'),liveOut=document.getElementById('tt-live'),results=document.getElementById('tt-results');
var words,current,correctChars,keysRight,keysWrong,wordsRight,wordsWrong,startedAt,timer,finished,total;

function pick(list,before){
var word;
do{word=list[Math.floor(Math.random()*list.length)]}while(word===before);
return word;
}
function nepaliMode(){return language.value==='nepali'||language.value==='nepali-paragraph'}
function buildKeyboard(){
KEY_ROWS.forEach(function(row){
var line=el('div','tt-row');
row.forEach(function(spec){
var key=el('div','tt-key'+(spec[3]?' tt-key-'+spec[3]:''));
if(spec[2]&&!/^[a-z]$/.test(spec[1]))key.appendChild(el('small','',spec[2]));
key.appendChild(el('span','',/^[a-z]$/.test(spec[1])?spec[1].toUpperCase():spec[1]));
line.appendChild(key);
keys[spec[0]]=key;
if(spec[1].length===1)charKeys[spec[1]]={code:spec[0],shift:false};
if(spec[2])charKeys[spec[2]]={code:spec[0],shift:true};
});
keyboard.appendChild(line);
});
charKeys[' ']={code:'Space',shift:false};
}
function clearKeys(name){
Object.keys(keys).forEach(function(code){keys[code].classList.remove(name)});
}
function flash(code,name){
if(!keys[code])return;
keys[code].classList.add(name);
setTimeout(function(){keys[code].classList.remove(name)},140);
}
function showNext(){
clearKeys('tt-key-next');
if(finished)return;
var word=words[current],value=input.value,next;
if(value!==word.text.slice(0,value.length)){
keys.Backspace.classList.add('tt-key-next');
return;
}
next=charKeys[value.length<word.text.length?word.text[value.length]:' '];
if(!next)return;
keys[next.code].classList.add('tt-key-next');
if(next.shift){
keys.ShiftLeft.classList.add('tt-key-next');
keys.ShiftRight.classList.add('tt-key-next');
}
}
function nextParagraph(list){
var index;
do{index=Math.floor(Math.random()*list.length)}while(index===lastParagraph);
lastParagraph=index;
return list[index].split(' ');
}
function addWords(count){
var list=nepaliMode()?NEPALI:ENGLISH,paragraph=language.value==='paragraph'?nextParagraph(PARAGRAPHS):language.value==='nepali-paragraph'?nextParagraph(NEPALI_PARAGRAPHS):null;
if(paragraph)count=paragraph.length;
for(var i=0;i<count;i++){
var text=paragraph?paragraph[i]:pick(list,words.length?words[words.length-1].text:''),node=el('span','tt-word'),letters=el('span','tt-letters'),spans=[];
node.dataset.word=text;
if(nepaliMode()){
var nepali=el('span','tt-nepali',RomanNepali.convert(text,false));
nepali.lang='ne';
node.appendChild(nepali);
}
text.split('').forEach(function(ch){
var span=el('span','',ch);
spans.push(span);
letters.appendChild(span);
});
node.appendChild(letters);
box.appendChild(node);
words.push({text:text,node:node,spans:spans});
}
}
function markCurrent(){
var word=words[current];
word.node.classList.add('tt-current');
box.scrollTop=Math.max(0,word.node.offsetTop-box.offsetTop-8);
showNext();
}
function paint(value){
var word=words[current];
word.spans.forEach(function(span,i){
span.className=i>=value.length?'':value[i]===word.text[i]?'tt-right':'tt-wrong';
});
input.classList.toggle('tt-bad',value!==word.text.slice(0,value.length));
showNext();
}
function matchingStart(value,text){
var i=0;
while(i<value.length&&value[i]===text[i])i++;
return i;
}
function speed(chars,elapsed){return elapsed>0?Math.round(chars/5/(elapsed/60)):0}
function elapsedSeconds(){return Math.min(total,(performance.now()-startedAt)/1000)}
function liveChars(){return correctChars+matchingStart(input.value,words[current].text)}
function bestKey(){return language.value+'-'+total}
function finish(){
clearInterval(timer);
finished=true;
var chars=liveChars();
input.disabled=true;
input.value='';
clearKeys('tt-key-next');
var worst=Object.keys(missed).sort(function(a,b){return missed[b]-missed[a]}).slice(0,3).map(function(ch){return ch===' '?'space':ch}).join('  ')||'None',wpm=speed(chars,total),keys=keysRight+keysWrong,accuracy=keys?Math.round(keysRight/keys*100):0;
var bests=ToolKit.store.get(BEST,{}),old=bests[bestKey()]||0;
if(wpm>old){
bests[bestKey()]=wpm;
ToolKit.store.set(BEST,bests);
}
timeOut.textContent='0';
liveOut.textContent=wpm;
results.textContent='';
[[wpm,'Words per minute'],[accuracy+'%','Accuracy'],[wordsRight,'Correct words'],[wordsWrong,'Wrong words'],[Math.max(wpm,old),'Your best here'],[worst,'Most missed keys']].forEach(function(item){
var stat=el('div','tool-panel stat');
stat.appendChild(el('span','stat-value',item[0]));
stat.appendChild(el('span','stat-label',item[1]));
results.appendChild(stat);
});
results.hidden=false;
restart.focus();
}
function tick(){
var used=elapsedSeconds();
timeOut.textContent=Math.ceil(total-used);
liveOut.textContent=speed(liveChars(),used);
if(used>=total)finish();
}
function reset(){
clearInterval(timer);
total=+seconds.value;
words=[];
current=0;
correctChars=keysRight=keysWrong=wordsRight=wordsWrong=0;
startedAt=0;
finished=false;
missed={};
clearKeys('tt-key-on');
box.textContent='';
box.classList.toggle('tt-with-nepali',nepaliMode());
results.hidden=true;
input.disabled=false;
input.value='';
input.classList.remove('tt-bad');
timeOut.textContent=total;
liveOut.textContent='0';
addWords(BATCH);
markCurrent();
ToolKit.store.set('typingOptions',{language:language.value,seconds:seconds.value});
}
function commit(value){
var word=words[current];
word.node.classList.remove('tt-current');
if(value===word.text){
wordsRight++;
correctChars+=word.text.length+1;
keysRight++;
word.node.classList.add('tt-done');
}else{
wordsWrong++;
keysWrong++;
word.node.classList.add('tt-missed');
}
current++;
if(words.length-current<BATCH/2)addWords(BATCH);
input.value='';
input.classList.remove('tt-bad');
markCurrent();
}
var lastValue='';
document.addEventListener('keydown',function(event){
if(!keys[event.code])return;
lastKeydown=performance.now();
keys[event.code].classList.add('tt-key-on');
});
document.addEventListener('keyup',function(event){
if(keys[event.code])keys[event.code].classList.remove('tt-key-on');
});
window.addEventListener('blur',function(){clearKeys('tt-key-on')});
input.addEventListener('input',function(){
if(finished)return;
var value=input.value;
if(!value&&!lastValue)return;
var typedChar=value.length>lastValue.length?value[value.length-1]:'';
if(typedChar&&performance.now()-lastKeydown>300&&charKeys[typedChar])flash(charKeys[typedChar].code,'tt-key-on');
if(!startedAt&&value.trim()){
startedAt=performance.now();
timer=setInterval(tick,100);
}
if(/\s$/.test(value)){
var typed=value.trim();
if(typed)commit(typed);
else input.value='';
lastValue='';
return;
}
if(value.length===lastValue.length+1&&value.slice(0,-1)===lastValue){
var wanted=words[current].text[value.length-1];
if(typedChar===wanted)keysRight++;
else{
keysWrong++;
if(wanted)missed[wanted]=(missed[wanted]||0)+1;
if(charKeys[typedChar])flash(charKeys[typedChar].code,'tt-key-bad');
}
}
lastValue=value;
paint(value);
});
['paste','drop'].forEach(function(name){
input.addEventListener(name,function(event){event.preventDefault()});
});
function again(){
lastValue='';
reset();
input.focus();
}
restart.addEventListener('click',again);
language.addEventListener('change',again);
seconds.addEventListener('change',again);
var saved=ToolKit.store.get('typingOptions',null);
buildKeyboard();
if(saved){
if([].some.call(language.options,function(option){return option.value===saved.language}))language.value=saved.language;
if([].some.call(seconds.options,function(option){return option.value===saved.seconds}))seconds.value=saved.seconds;
}
reset();
})();
