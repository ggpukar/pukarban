// Plays the flag sound from YouTube while the hero is on screen, after the first click or key press.
(function(){
var VIDEO='6dJq5W1UXhE',VOLUME=25,btn=document.getElementById('sound');
var player,ready=false,on=false,inHero=true,muted=false;
try{muted=localStorage.getItem('flagSoundMuted')==='1'}catch(e){}
function apply(){
btn.textContent=on?'🔊':'🔇';
btn.title='Turn flag sound '+(on?'off':'on');
btn.setAttribute('aria-pressed',on);
if(!ready)return;
if(on&&inHero&&!document.hidden){
player.setVolume(VOLUME);
player.unMute();
player.playVideo();
}else{
player.pauseVideo();
}
}
function setOn(value){
on=value;
apply();
}
function firstGesture(e){
removeEventListener('click',firstGesture);
removeEventListener('keydown',firstGesture);
if(!muted&&!(e.target.closest&&e.target.closest('#sound')))setOn(true);
}
window.onYouTubeIframeAPIReady=function(){
player=new YT.Player('flag-player',{
host:'https://www.youtube-nocookie.com',
videoId:VIDEO,
width:1,
height:1,
playerVars:{controls:0,disablekb:1,fs:0,playsinline:1,rel:0,origin:location.origin},
events:{
onReady:function(){
ready=true;
apply();
},
onStateChange:function(e){
if(e.data===YT.PlayerState.ENDED&&on){
player.seekTo(0);
player.playVideo();
}
},
onError:function(){
ready=false;
on=false;
apply();
btn.disabled=true;
btn.title='Flag sound unavailable';
}
}
});
};
btn.addEventListener('click',function(){
muted=on;
try{localStorage.setItem('flagSoundMuted',muted?'1':'0')}catch(e){}
setOn(!on);
});
addEventListener('click',firstGesture);
addEventListener('keydown',firstGesture);
document.addEventListener('visibilitychange',apply);
new IntersectionObserver(function(entries){inHero=entries[0].isIntersecting;apply()}).observe(document.getElementById('flags'));
var api=document.createElement('script');
api.src='https://www.youtube.com/iframe_api';
document.head.appendChild(api);
})();
