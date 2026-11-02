(function(){
var el=ToolKit.el,NEPAL='Asia/Kathmandu',KEY='worldClockCities';
var ALIASES={Bhaktapur:NEPAL,Lalitpur:NEPAL,Pokhara:NEPAL,Delhi:'Asia/Kolkata','New Delhi':'Asia/Kolkata',Mumbai:'Asia/Kolkata',Bengaluru:'Asia/Kolkata',Beijing:'Asia/Shanghai',Doha:'Asia/Qatar','Abu Dhabi':'Asia/Dubai',Washington:'America/New_York',Boston:'America/New_York','San Francisco':'America/Los_Angeles',Seattle:'America/Los_Angeles',Ottawa:'America/Toronto',Melbourne:'Australia/Melbourne',Canberra:'Australia/Sydney',Kyoto:'Asia/Tokyo',Osaka:'Asia/Tokyo',Jeddah:'Asia/Riyadh',Manchester:'Europe/London'};
var DEFAULTS=[{city:'Kathmandu',zone:NEPAL},{city:'London',zone:'Europe/London'},{city:'New York',zone:'America/New_York'},{city:'Dubai',zone:'Asia/Dubai'},{city:'Tokyo',zone:'Asia/Tokyo'},{city:'Sydney',zone:'Australia/Sydney'}];
var search=document.getElementById('city-search'),results=document.getElementById('city-results'),list=document.getElementById('clock-list');
var cities=ToolKit.store.get(KEY,DEFAULTS),cards=[];

function allPlaces(){
var zones=Intl.supportedValuesOf?Intl.supportedValuesOf('timeZone'):DEFAULTS.map(function(d){return d.zone});
var places=zones.map(function(zone){
return {city:zone.split('/').pop().replace(/_/g,' '),zone:zone};
});
Object.keys(ALIASES).forEach(function(city){places.push({city:city,zone:ALIASES[city]})});
return places;
}
var places=allPlaces();

function offsetMinutes(zone,now){
var parts={};
new Intl.DateTimeFormat('en-US',{timeZone:zone,hourCycle:'h23',year:'numeric',month:'numeric',day:'numeric',hour:'numeric',minute:'numeric'}).formatToParts(now).forEach(function(part){parts[part.type]=+part.value});
return (Date.UTC(parts.year,parts.month-1,parts.day,parts.hour,parts.minute)-Math.floor(now/60000)*60000)/60000;
}
function difference(zone,now){
var gap=offsetMinutes(zone,now)-offsetMinutes(NEPAL,now);
if(!gap)return 'Same time as Nepal';
var abs=Math.abs(gap),hours=Math.floor(abs/60),minutes=abs%60;
return (hours?hours+'h ':'')+(minutes?minutes+'m ':'')+(gap>0?'ahead of':'behind')+' Nepal';
}
function save(){
ToolKit.store.set(KEY,cities);
}
function build(){
list.textContent='';
cards=cities.map(function(place,index){
var card=el('article','tool-panel clock-card');
var remove=el('button','clock-remove','×');
remove.type='button';
remove.setAttribute('aria-label','Remove '+place.city);
remove.addEventListener('click',function(){
cities.splice(index,1);
save();
build();
});
var time=el('p','clock-time'),date=el('p','clock-date'),gap=el('p','clock-gap');
card.appendChild(remove);
card.appendChild(el('h2','',place.city));
card.appendChild(time);
card.appendChild(date);
card.appendChild(gap);
list.appendChild(card);
return {place:place,time:time,date:date,gap:gap};
});
tick();
}
function tick(){
var now=Date.now();
cards.forEach(function(card){
var zone=card.place.zone;
card.time.textContent=new Date(now).toLocaleTimeString('en-US',{timeZone:zone,hour:'numeric',minute:'2-digit',second:'2-digit'});
card.date.textContent=new Date(now).toLocaleDateString('en-GB',{timeZone:zone,weekday:'short',day:'numeric',month:'short',year:'numeric'});
card.gap.textContent=difference(zone,now);
});
}
function showResults(){
var query=search.value.trim().toLowerCase();
results.textContent='';
if(!query)return;
var matches=places.filter(function(place){
return place.city.toLowerCase().indexOf(query)>=0||place.zone.toLowerCase().indexOf(query)>=0;
}).slice(0,8);
if(!matches.length){
results.appendChild(el('p','tool-note','No city found. Try the nearest large city.'));
return;
}
matches.forEach(function(place){
var button=el('button','tool-choice',place.city+' · '+place.zone.replace(/_/g,' '));
button.type='button';
button.addEventListener('click',function(){
var known=cities.some(function(city){return city.city===place.city&&city.zone===place.zone});
if(!known){
cities.push(place);
save();
build();
}
search.value='';
results.textContent='';
search.focus();
});
results.appendChild(button);
});
}
search.addEventListener('input',showResults);
build();
setInterval(tick,1000);
})();
