(function(){
var NEPAL_OFFSET=20700000,DAY=86400000;
var BS_START_YEAR=2083,BS_START=Date.UTC(2026,3,14);
var BS_MONTHS=[[31,31,32,31,31,31,30,29,30,29,30,30],[31,31,32,31,31,30,30,30,29,30,30,30],[31,32,31,32,30,31,30,30,29,30,30,30],[30,32,31,32,31,30,30,30,29,30,30,30]];
var BS_NAMES=['बैशाख','जेठ','असार','साउन','भदौ','असोज','कात्तिक','मंसिर','पुष','माघ','फागुन','चैत'];
function el(id){return document.getElementById(id)}
function pad(n){return (n<10?'0':'')+n}
function nepaliDigits(n){return String(n).replace(/\d/g,function(d){return '०१२३४५६७८९'[d]})}
function toBS(dayNumber){
var left=dayNumber-BS_START/DAY;
if(left<0)return null;
for(var y=0;y<BS_MONTHS.length;y++){
for(var m=0;m<12;m++){
if(left<BS_MONTHS[y][m])return {year:BS_START_YEAR+y,month:m,day:left+1};
left-=BS_MONTHS[y][m];
}
}
return null;
}
var shownMinute=-1,shownDay=-1;
function tick(){
var np=new Date(Date.now()+NEPAL_OFFSET),h=np.getUTCHours(),m=np.getUTCMinutes();
if(m!==shownMinute){
shownMinute=m;
el('np-time').textContent=(h%12||12)+':'+pad(m)+' '+(h<12?'AM':'PM');
}
var dayNumber=Math.floor(np.getTime()/DAY);
if(dayNumber!==shownDay){
shownDay=dayNumber;
var bs=toBS(dayNumber);
el('np-bs').textContent=bs?BS_NAMES[bs.month]+' '+nepaliDigits(bs.day)+', '+nepaliDigits(bs.year):'';
}
}
tick();
setInterval(tick,1000);
})();
(function(){
// Weather goes through the site's Cloudflare Worker, which holds the OpenWeather key.
var WEATHER_API='https://prabin-weather.prabinban.workers.dev',API=WEATHER_API+'/data/2.5/';
var BHAKTAPUR={latitude:27.67,longitude:85.43,label:'Bhaktapur, Nepal'},REFRESH_MS=900000,DAY=86400000;
var place=BHAKTAPUR,timer;
function el(id){return document.getElementById(id)}
function icon(code,isDay){
if(code<300)return '⛈️';
if(code<400)return '🌦️';
if(code<600)return '🌧️';
if(code<700)return '🌨️';
if(code<800)return '🌫️';
if(code===800)return isDay?'☀️':'🌙';
if(code===801)return isDay?'🌤️':'🌙';
if(code===802)return '⛅';
return '☁️';
}
function degrees(n){return Math.round(n)+'°'}
function placeName(data){
var country=data.sys.country;
try{country=new Intl.DisplayNames(['en'],{type:'region'}).of(country)}catch(e){}
return data.name?data.name+', '+country:country;
}
function localDays(forecast){
var days=[],byDate={},offset=forecast.city.timezone*1000;
forecast.list.forEach(function(slot){
var local=slot.dt*1000+offset,date=Math.floor(local/DAY),hour=new Date(local).getUTCHours(),day=byDate[date];
if(!day){
day=byDate[date]={date:date,high:-Infinity,low:Infinity,code:slot.weather[0].id,text:slot.weather[0].description,rain:0,noonGap:24};
days.push(day);
}
day.high=Math.max(day.high,slot.main.temp);
day.low=Math.min(day.low,slot.main.temp);
day.rain=Math.max(day.rain,slot.pop||0);
if(Math.abs(hour-12)<day.noonGap){
day.noonGap=Math.abs(hour-12);
day.code=slot.weather[0].id;
day.text=slot.weather[0].description;
}
});
return days;
}
window.siteWeather={api:WEATHER_API,icon:icon,localDays:localDays};
function render(current){
var weather=current.weather[0],chip=el('wx-chip');
el('wx-icon').textContent=icon(weather.id,weather.icon.slice(-1)==='d');
el('wx-temp').textContent=degrees(current.main.temp);
el('wx-now').textContent=weather.description.charAt(0).toUpperCase()+weather.description.slice(1);
chip.title=(place.label||placeName(current))+': '+el('wx-now').textContent+', '+degrees(current.main.temp);
chip.setAttribute('aria-label','Weather in '+chip.title);
window.siteWeather.now={code:weather.id,text:weather.description,time:current.dt,sunrise:current.sys.sunrise,sunset:current.sys.sunset};
document.dispatchEvent(new CustomEvent('siteweather',{detail:window.siteWeather.now}));
}
function get(path,at){
return fetch(API+path+'?lat='+at.latitude+'&lon='+at.longitude+'&units=metric').then(function(res){
if(!res.ok)throw new Error(res.status);
return res.json();
});
}
function load(){
var asked=place;
clearTimeout(timer);
timer=setTimeout(load,REFRESH_MS);
get('weather',asked).then(function(current){
if(asked===place)render(current);
}).catch(function(){
if(asked===place&&!el('wx-temp').textContent)el('wx-chip').hidden=true;
});
}
load();
if(navigator.geolocation){
navigator.geolocation.getCurrentPosition(function(pos){
place={latitude:pos.coords.latitude.toFixed(2),longitude:pos.coords.longitude.toFixed(2)};
load();
},function(){},{maximumAge:REFRESH_MS,timeout:15000});
}
})();
