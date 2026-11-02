(function(){
var el=ToolKit.el,NEPAL='Asia/Kathmandu',KEY='worldClockCities',SEARCH_DELAY=450;
var ALIASES={Bhaktapur:NEPAL,Lalitpur:NEPAL,Pokhara:NEPAL,Delhi:'Asia/Kolkata','New Delhi':'Asia/Kolkata',Mumbai:'Asia/Kolkata',Bengaluru:'Asia/Kolkata',Beijing:'Asia/Shanghai',Doha:'Asia/Qatar','Abu Dhabi':'Asia/Dubai',Washington:'America/New_York',Boston:'America/New_York','San Francisco':'America/Los_Angeles',Seattle:'America/Los_Angeles',Ottawa:'America/Toronto',Melbourne:'Australia/Melbourne',Canberra:'Australia/Sydney',Kyoto:'Asia/Tokyo',Osaka:'Asia/Tokyo',Jeddah:'Asia/Riyadh',Manchester:'Europe/London'};
var DEFAULTS=[{city:'Kathmandu',zone:NEPAL},{city:'London',zone:'Europe/London'},{city:'New York',zone:'America/New_York'},{city:'Dubai',zone:'Asia/Dubai'},{city:'Tokyo',zone:'Asia/Tokyo'},{city:'Sydney',zone:'Australia/Sydney'}];
var search=document.getElementById('city-search'),results=document.getElementById('city-results'),worldResults=document.getElementById('city-world'),list=document.getElementById('clock-list');
var tableBody=document.getElementById('zone-rows'),tableCount=document.getElementById('zone-count');
var cities=ToolKit.store.get(KEY,DEFAULTS).map(function(place){return {city:place.city,country:place.country,zone:place.zone}}),cards=[],rows=[],searchTimer,searchCount=0;
var namer=null;
try{namer=new Intl.DisplayNames(['en'],{type:'region'})}catch(e){}

function countryName(code){
var name=null;
try{name=namer&&namer.of(code)}catch(e){}
return name&&name!==code?name:(TZ_DATA.countries[code]||code);
}
var ZONES=TZ_DATA.zones.map(function(row){
return {zone:row[0],code:row[1],lat:row[2],lon:row[3],city:row[0].split('/').pop().replace(/_/g,' '),country:countryName(row[1])};
});
var byZone={};
ZONES.forEach(function(z){byZone[z.zone]=z});
var places=ZONES.map(function(z){return {city:z.city,country:z.country,zone:z.zone}});
Object.keys(ALIASES).forEach(function(city){
var z=byZone[ALIASES[city]];
places.push({city:city,country:z?z.country:'',zone:ALIASES[city]});
});
places.forEach(function(p){p.text=(p.city+' '+p.country+' '+p.zone).toLowerCase()});
// Clocks saved before countries were shown get theirs from the time zone.
cities.forEach(function(place){
if(!place.country&&byZone[place.zone])place.country=byZone[place.zone].country;
});

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
function utcLabel(zone,now){
var m=offsetMinutes(zone,now),abs=Math.abs(m);
return 'UTC'+(m<0?'−':'+')+Math.floor(abs/60)+(abs%60?':'+String(abs%60).padStart(2,'0'):'');
}
function timeIn(zone,now,seconds){
return new Date(now).toLocaleTimeString('en-US',{timeZone:zone,hour:'numeric',minute:'2-digit',second:seconds?'2-digit':undefined});
}
function label(place){return place.country&&place.country!==place.city?place.city+', '+place.country:place.city}
function save(){ToolKit.store.set(KEY,cities)}
function add(place){
var known=cities.some(function(city){return city.city===place.city&&city.zone===place.zone});
if(!known){
cities.push({city:place.city,country:place.country,zone:place.zone});
save();
build();
}
search.value='';
results.textContent='';
worldResults.textContent='';
filterTable();
search.focus();
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
if(place.country&&place.country!==place.city)card.appendChild(el('p','clock-country',place.country));
card.appendChild(time);
card.appendChild(date);
card.appendChild(gap);
list.appendChild(card);
return {place:place,time:time,date:date,gap:gap};
});
tick();
}
function buildTable(){
var now=Date.now();
rows=ZONES.slice().sort(function(a,b){return a.country.localeCompare(b.country)||a.city.localeCompare(b.city)}).map(function(z){
var tr=el('tr'),time=el('td','zone-time'),button=el('button','tool-choice zone-add','Add');
button.type='button';
button.setAttribute('aria-label','Add '+z.city+', '+z.country);
button.addEventListener('click',function(){add({city:z.city,country:z.country,zone:z.zone})});
tr.appendChild(el('td','',z.country));
tr.appendChild(el('td','',z.city));
tr.appendChild(time);
tr.appendChild(el('td','zone-offset',utcLabel(z.zone,now)));
var cell=el('td');
cell.appendChild(button);
tr.appendChild(cell);
tableBody.appendChild(tr);
return {tr:tr,time:time,zone:z.zone,text:(z.country+' '+z.city+' '+z.zone).toLowerCase()};
});
}
function filterTable(){
var words=search.value.trim().toLowerCase().split(/\s+/).filter(Boolean),shown=0;
rows.forEach(function(row){
var match=words.every(function(w){return row.text.indexOf(w)>=0});
row.tr.hidden=!match;
if(match)shown++;
});
tableCount.textContent=shown===rows.length?rows.length+' time zones in '+Object.keys(TZ_DATA.countries).length+' countries and territories':shown+(shown===1?' time zone matches':' time zones match');
tick();
}
function tick(){
var now=Date.now();
cards.forEach(function(card){
var zone=card.place.zone;
card.time.textContent=timeIn(zone,now,true);
card.date.textContent=new Date(now).toLocaleDateString('en-GB',{timeZone:zone,weekday:'short',day:'numeric',month:'short',year:'numeric'});
card.gap.textContent=difference(zone,now);
});
rows.forEach(function(row){
if(!row.tr.hidden)row.time.textContent=timeIn(row.zone,now,false);
});
}

// A city anywhere in the world gets a time zone from its own country. Where a country has several,
// the city's current UTC offset (from the weather service) narrows them down before the nearest is chosen.
function nearest(found,zones){
var best=null,bestDistance=Infinity;
zones.forEach(function(z){
var d=Math.pow(z.lat-found.lat,2)+Math.pow((z.lon-found.lon)*Math.cos(found.lat*Math.PI/180),2);
if(d<bestDistance){best=z;bestDistance=d}
});
return best;
}
function zoneFor(found){
var zones=ZONES.filter(function(z){return z.code===found.country});
if(zones.length<2)return Promise.resolve(zones[0]||null);
return fetch(siteWeather.api+'/data/2.5/weather?lat='+found.lat+'&lon='+found.lon).then(function(res){
if(!res.ok)throw new Error(res.status);
return res.json();
}).then(function(data){
var now=Date.now(),offset=Math.round(data.timezone/60);
var same=zones.filter(function(z){return offsetMinutes(z.zone,now)===offset});
return nearest(found,same.length?same:zones);
}).catch(function(){return nearest(found,zones)});
}
function searchWorld(query){
var mine=++searchCount,found;
worldResults.textContent='';
if(query.length<3||!window.siteWeather)return;
worldResults.appendChild(el('p','tool-note','Searching cities worldwide…'));
fetch(siteWeather.api+'/geo/1.0/direct?q='+encodeURIComponent(query)+'&limit=5').then(function(res){
if(!res.ok)throw new Error(res.status);
return res.json();
}).then(function(list){
found=list;
return Promise.all(found.map(zoneFor));
}).then(function(zones){
if(mine!==searchCount)return;
worldResults.textContent='';
var seen={},buttons=[];
found.forEach(function(f,i){
var z=zones[i];
if(!z)return;
var country=countryName(f.country),place={city:f.name,country:country,zone:z.zone};
var text=[f.name,f.state,country].filter(function(part,j,all){return part&&all.indexOf(part)===j}).join(', ');
if(seen[text])return;
seen[text]=true;
var button=el('button','tool-choice',text+' · '+timeIn(z.zone,Date.now(),false));
button.type='button';
button.addEventListener('click',function(){add(place)});
buttons.push(button);
});
if(!buttons.length)return;
worldResults.appendChild(el('p','tool-label','Cities worldwide'));
var box=el('div','tool-choices');
buttons.forEach(function(b){box.appendChild(b)});
worldResults.appendChild(box);
}).catch(function(){
if(mine===searchCount)worldResults.textContent='';
});
}
function showResults(){
var query=search.value.trim(),lower=query.toLowerCase();
results.textContent='';
filterTable();
clearTimeout(searchTimer);
if(!query){
worldResults.textContent='';
searchCount++;
return;
}
var words=lower.split(/\s+/);
var matches=places.filter(function(place){
return words.every(function(w){return place.text.indexOf(w)>=0});
}).slice(0,8);
matches.forEach(function(place){
var button=el('button','tool-choice',label(place)+' · '+timeIn(place.zone,Date.now(),false));
button.type='button';
button.addEventListener('click',function(){add(place)});
results.appendChild(button);
});
if(!matches.length)results.appendChild(el('p','tool-note','No time zone matches. Cities worldwide are searched below.'));
searchTimer=setTimeout(function(){searchWorld(query)},SEARCH_DELAY);
}
search.addEventListener('input',showResults);
build();
buildTable();
filterTable();
setInterval(tick,1000);
})();
