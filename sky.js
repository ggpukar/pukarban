(function(){
var NEPAL_OFFSET=20700000,DAWN=45*60,GLOW=60*60;
var hero=document.getElementById('hero'),weather=null;
var fx=document.createElement('div');
fx.className='wx-fx';
fx.setAttribute('aria-hidden','true');
hero.insertBefore(fx,hero.querySelector('.sky').nextSibling);

// Without live weather, use Nepal time with a typical sunrise and sunset.
function fallbackSun(){
var now=Date.now(),day=Math.floor((now+NEPAL_OFFSET)/86400000)*86400000-NEPAL_OFFSET;
return {time:now/1000,sunrise:(day+6*3600000)/1000,sunset:(day+17.75*3600000)/1000};
}
function phase(sun){
var t=Date.now()/1000;
if(t<sun.sunrise-DAWN||t>sun.sunset+DAWN)return 'night';
if(t<sun.sunrise+GLOW)return 'dawn';
if(t>sun.sunset-GLOW)return 'dusk';
return 'day';
}
function kind(code){
if(code<300)return 'storm';
if(code<600)return 'rain';
if(code<700)return 'snow';
if(code<800)return 'mist';
if(code>=802)return 'clouds';
return 'clear';
}
function update(){
var sun=weather||fallbackSun();
hero.dataset.sky=phase(sun);
hero.dataset.weather=weather?kind(weather.code):'clear';
}
document.addEventListener('siteweather',function(event){
weather=event.detail;
update();
});
if(window.siteWeather&&window.siteWeather.now)weather=window.siteWeather.now;
update();
setInterval(update,60000);
})();
