(function(){
document.addEventListener('contextmenu',function(event){
var target=event.target;
if(!(target.closest&&target.closest('input,textarea')))event.preventDefault();
});
document.addEventListener('keydown',function(event){
var key=event.key.toLowerCase(),devTools=(event.ctrlKey&&event.shiftKey)||(event.metaKey&&event.altKey);
if(key==='f12'||(devTools&&['i','j','c'].indexOf(key)>=0)||((event.ctrlKey||event.metaKey)&&key==='u'))event.preventDefault();
});
})();
