(function(){
var el=ToolKit.el,KEY='weatherPlace',DAY=86400000,DAYS_SHOWN=5;
var HOST=siteWeather.api;
var BHAKTAPUR={label:'Bhaktapur, Nepal',latitude:27.67,longitude:85.43};
var form=document.getElementById('place-form'),input=document.getElementById('place-search'),results=document.getElementById('place-results'),out=document.getElementById('weather-out'),message=document.getElementById('weather-message');
var request=0;

function degrees(value){return Math.round(value)+'°C'}
function sentence(text){return text.charAt(0).toUpperCase()+text.slice(1)}
function json(url){
return fetch(url).then(function(res){
if(!res.ok)throw new Error(res.status);
return res.json();
});
}
function countryName(code){
try{return new Intl.DisplayNames(['en'],{type:'region'}).of(code)}catch(e){return code}
}
function render(place,current,forecast){
var now=current.weather[0],card=el('div','tool-panel'),today=Math.floor((current.dt+current.timezone)*1000/DAY);
out.textContent='';
card.appendChild(el('h2','weather-place',place.label));
var main=el('div','weather-main');
main.appendChild(el('span','weather-icon',siteWeather.icon(now.id,now.icon.slice(-1)==='d')));
main.appendChild(el('span','weather-temp',degrees(current.main.temp)));
main.appendChild(el('span','weather-state',sentence(now.description)));
card.appendChild(main);
card.appendChild(el('p','tool-note','Feels like '+degrees(current.main.feels_like)+' · Humidity '+current.main.humidity+'% · Wind '+Math.round(current.wind.speed*3.6)+' km/h'));
out.appendChild(card);
var list=siteWeather.localDays(forecast).filter(function(day){return day.date>=today});
if(!list.length||list[0].date!==today)list.unshift({date:today,high:current.main.temp,low:current.main.temp,code:now.id,text:now.description,rain:0});
var first=list[0];
first.high=Math.max(first.high,current.main.temp);
first.low=Math.min(first.low,current.main.temp);
var days=el('div','weather-days');
list.slice(0,DAYS_SHOWN).forEach(function(day){
var box=el('div','tool-panel weather-day');
box.appendChild(el('p','weather-day-name',day.date===today?'Today':new Date(day.date*DAY).toLocaleDateString('en-GB',{timeZone:'UTC',weekday:'short',day:'numeric',month:'short'})));
box.appendChild(el('p','weather-day-icon',siteWeather.icon(day.code,true)));
box.appendChild(el('p','',sentence(day.text)));
box.appendChild(el('p','weather-range',degrees(day.high)+' / '+degrees(day.low)));
box.appendChild(el('p','tool-note','Rain chance '+Math.round(day.rain*100)+'%'));
days.appendChild(box);
});
out.appendChild(days);
}
function show(place){
var mine=++request,at='?lat='+place.latitude+'&lon='+place.longitude+'&units=metric';
message.textContent='Loading weather…';
Promise.all([json(HOST+'/data/2.5/weather'+at),json(HOST+'/data/2.5/forecast'+at)]).then(function(data){
if(mine!==request)return;
message.textContent='';
render(place,data[0],data[1]);
ToolKit.store.set(KEY,place);
}).catch(function(){
if(mine===request)message.textContent='Weather could not be loaded. Check your connection and try again.';
});
}
form.addEventListener('submit',function(event){
event.preventDefault();
var query=input.value.trim(),mine=++request;
results.textContent='';
if(query.length<2){
message.textContent='Enter at least 2 letters.';
return;
}
message.textContent='Searching…';
json(HOST+'/geo/1.0/direct?q='+encodeURIComponent(query)+'&limit=5').then(function(data){
if(mine!==request)return;
message.textContent=data.length?'Choose a place:':'No place found. Check the spelling or try a nearby city.';
var seen={};
data.forEach(function(found){
var label=[found.name,found.state,countryName(found.country)].filter(function(part,i,all){return part&&all.indexOf(part)===i}).join(', ');
if(seen[label])return;
seen[label]=true;
var button=el('button','tool-choice',label);
button.type='button';
button.addEventListener('click',function(){
results.textContent='';
input.value='';
show({label:label,latitude:found.lat,longitude:found.lon});
});
results.appendChild(button);
});
}).catch(function(){
if(mine===request)message.textContent='Search failed. Check your connection and try again.';
});
});
show(ToolKit.store.get(KEY,BHAKTAPUR));
})();
