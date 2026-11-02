(function(){
var NEPAL_OFFSET=20700000,DAY=86400000,TICK_COLORS=['#1F5FA8','#C62828','#2E7D32','#F2C230'];
var BS_START_YEAR=2083,BS_START=Date.UTC(2026,3,14);
var BS_MONTHS=[[31,31,32,31,31,31,30,29,30,29,30,30],[31,31,32,31,31,30,30,30,29,30,30,30],[31,32,31,32,30,31,30,30,29,30,30,30],[30,32,31,32,31,30,30,30,29,30,30,30]];
var BS_NAMES=['बैशाख','जेठ','असार','साउन','भदौ','असोज','कात्तिक','मंसिर','पुष','माघ','फागुन','चैत'];
var BS_DAYS=['आइतबार','सोमबार','मङ्गलबार','बुधबार','बिहीबार','शुक्रबार','शनिबार'];
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
function spin(hand,deg){hand.setAttribute('transform','rotate('+deg+' 60 60)')}
for(var i=0;i<12;i++){
var a=i*Math.PI/6,tick=document.createElementNS('http://www.w3.org/2000/svg','line');
tick.setAttribute('x1',60+50*Math.sin(a));
tick.setAttribute('y1',60-50*Math.cos(a));
tick.setAttribute('x2',60+(i%3?46:42)*Math.sin(a));
tick.setAttribute('y2',60-(i%3?46:42)*Math.cos(a));
tick.setAttribute('stroke',TICK_COLORS[i%4]);
tick.setAttribute('stroke-width',i%3?2:3.5);
el('np-ticks').appendChild(tick);
}
var shownSecond=-1,shownDay=-1;
function frame(){
var np=new Date(Date.now()+NEPAL_OFFSET);
var h=np.getUTCHours(),m=np.getUTCMinutes(),sec=np.getUTCSeconds(),ms=np.getUTCMilliseconds();
spin(el('np-second'),(sec+ms/1000)*6);
spin(el('np-minute'),(m+sec/60)*6);
spin(el('np-hour'),(h%12+m/60)*30);
if(sec!==shownSecond){
shownSecond=sec;
el('np-time').textContent=(h%12||12)+':'+pad(m);
el('np-seconds').textContent=pad(sec)+' '+(h<12?'AM':'PM');
}
var dayNumber=Math.floor(np.getTime()/DAY);
if(dayNumber!==shownDay){
shownDay=dayNumber;
el('np-ad').textContent=np.toLocaleDateString('en-GB',{timeZone:'UTC',weekday:'long',day:'numeric',month:'long',year:'numeric'});
var bs=toBS(dayNumber);
el('np-bs').textContent=bs?BS_DAYS[np.getUTCDay()]+', '+BS_NAMES[bs.month]+' '+nepaliDigits(bs.day)+', '+nepaliDigits(bs.year):'';
}
requestAnimationFrame(frame);
}
frame();
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
function render(current,forecast){
var weather=current.weather[0],temp=current.main.temp,now=(current.dt+current.timezone)*1000;
var today=Math.floor(now/DAY),high=temp,low=temp,days=el('wx-days');
el('wx-place').textContent=place.label||placeName(current);
el('wx-icon').textContent=icon(weather.id,weather.icon.slice(-1)==='d');
el('wx-temp').textContent=degrees(temp);
el('wx-now').textContent=weather.description.charAt(0).toUpperCase()+weather.description.slice(1);
days.textContent='';
localDays(forecast).forEach(function(day){
if(day.date===today){
high=Math.max(high,day.high);
low=Math.min(low,day.low);
}else if(day.date>today&&days.children.length<3){
var box=document.createElement('div');
box.textContent=new Date(day.date*DAY).toLocaleDateString('en-GB',{timeZone:'UTC',weekday:'short'})+' '+icon(day.code,true);
box.appendChild(document.createElement('br'));
box.appendChild(document.createTextNode(degrees(day.high)+' / '+degrees(day.low)));
days.appendChild(box);
}
});
el('wx-range').textContent='High '+degrees(high)+' · Low '+degrees(low);
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
Promise.all([get('weather',asked),get('forecast',asked)]).then(function(results){
if(asked===place)render(results[0],results[1]);
}).catch(function(){
if(asked===place&&!el('wx-temp').textContent)el('wx-now').textContent='Weather unavailable';
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
