(function(){
var FAVOURITES='favouriteTools',RECENT='recentTools';
var search=document.getElementById('tool-search'),count=document.getElementById('tool-count'),empty=document.getElementById('tool-empty'),grids=[document.getElementById('tool-grid'),document.getElementById('tool-more')],recentBox=document.getElementById('tool-recent');
var cards=[].slice.call(document.querySelectorAll('.tool-card'));
var texts=cards.map(function(card){return (card.textContent+' '+card.getAttribute('data-keywords')).toLowerCase()});
var favourites=read(FAVOURITES);

function read(key){
// Older visits saved pages with .html on the end, so it is dropped to match the clean links.
try{var list=JSON.parse(localStorage.getItem(key));return Array.isArray(list)?list.map(function(page){return String(page).replace(/\.html$/,'')}):[]}catch(e){return []}
}
function save(key,list){
try{localStorage.setItem(key,JSON.stringify(list))}catch(e){}
}
function page(card){return card.getAttribute('href')}
function title(card){return card.querySelector('h3').textContent}
// A star cannot sit inside a link, so each card gets a wrapper that holds both.
var items=cards.map(function(card){
var item=document.createElement('div'),star=document.createElement('button'),grid=card.parentNode;
item.className='tool-item';
star.type='button';
star.className='tool-fav';
star.addEventListener('click',function(){
var at=favourites.indexOf(page(card));
if(at<0)favourites.push(page(card));
else favourites.splice(at,1);
save(FAVOURITES,favourites);
order();
});
card.parentNode.insertBefore(item,card);
item.appendChild(card);
item.appendChild(star);
return {item:item,card:card,star:star,grid:grid};
});
function order(){
items.forEach(function(entry,i){
var on=favourites.indexOf(page(entry.card))>=0;
entry.star.textContent=on?'★':'☆';
entry.star.setAttribute('aria-pressed',on);
entry.star.setAttribute('aria-label',(on?'Remove ':'Add ')+title(entry.card)+(on?' from favourites':' to favourites'));
entry.rank=on?i-1000:i;
});
// Favourites move to the front of their own group.
items.slice().sort(function(a,b){return a.rank-b.rank}).forEach(function(entry){entry.grid.appendChild(entry.item)});
}
function showRecent(){
var list=read(RECENT).map(function(href){
return cards.filter(function(card){return page(card)===href})[0];
}).filter(Boolean).slice(0,4);
recentBox.hidden=!list.length;
var links=recentBox.querySelector('.tool-choices');
links.textContent='';
list.forEach(function(card){
var link=document.createElement('a');
link.className='tool-choice';
link.href=page(card);
link.textContent=title(card);
links.appendChild(link);
});
}
function filter(){
var words=search.value.toLowerCase().split(/\s+/).filter(Boolean),shown=0;
items.forEach(function(entry,i){
var match=words.every(function(word){return texts[i].indexOf(word)>=0});
entry.item.hidden=!match;
if(match)shown++;
});
grids.forEach(function(grid){
var any=items.some(function(entry){return entry.grid===grid&&!entry.item.hidden});
grid.hidden=!any;
grid.previousElementSibling.hidden=!any;
});
count.textContent=shown+(shown===1?' tool':' tools');
empty.hidden=shown>0;
}
search.addEventListener('input',filter);
order();
showRecent();
filter();
})();
