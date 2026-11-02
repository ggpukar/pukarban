(function(){
var adInput=document.getElementById('ad-date'),adOut=document.getElementById('ad-result');
var bsYear=document.getElementById('bs-year'),bsMonth=document.getElementById('bs-month'),bsDay=document.getElementById('bs-day'),bsOut=document.getElementById('bs-result');
var DAY=86400000;

function fill(select,count,label,value){
select.textContent='';
for(var i=0;i<count;i++){
var option=document.createElement('option');
option.value=value(i);
option.textContent=label(i);
select.appendChild(option);
}
}
function adText(dayNumber){
return new Date(dayNumber*DAY).toLocaleDateString('en-GB',{timeZone:'UTC',weekday:'long',day:'numeric',month:'long',year:'numeric'});
}
function showAD(){
var parts=adInput.value.split('-');
if(parts.length!==3){
adOut.textContent='Choose a date.';
return;
}
var bs=BSCalendar.fromDayNumber(Date.UTC(+parts[0],parts[1]-1,+parts[2])/DAY);
adOut.textContent=bs?BSCalendar.format(bs)+' ('+bs.day+' '+BSCalendar.MONTHS_EN[bs.month]+' '+bs.year+' BS)':'Only dates from '+BSCalendar.START_YEAR+' to '+BSCalendar.END_YEAR+' BS are supported ('+BSCalendar.firstAD()+' to '+BSCalendar.lastAD()+').';
}
function fillDays(){
var chosen=+bsDay.value||1,total=BSCalendar.monthLength(+bsYear.value,+bsMonth.value);
fill(bsDay,total,function(i){return i+1},function(i){return i+1});
bsDay.value=Math.min(chosen,total);
}
function showBS(){
fillDays();
bsOut.textContent=adText(BSCalendar.toDayNumber(+bsYear.value,+bsMonth.value,+bsDay.value));
}
var today=BSCalendar.nepalToday(),todayBS=BSCalendar.fromDayNumber(today);
fill(bsYear,BSCalendar.END_YEAR-BSCalendar.START_YEAR+1,function(i){return BSCalendar.START_YEAR+i},function(i){return BSCalendar.START_YEAR+i});
fill(bsMonth,12,function(i){return BSCalendar.MONTHS_EN[i]+' · '+BSCalendar.MONTHS[i]},function(i){return i});
adInput.min=BSCalendar.firstAD();
adInput.max=BSCalendar.lastAD();
adInput.value=new Date(today*DAY).toISOString().slice(0,10);
if(todayBS){
bsYear.value=todayBS.year;
bsMonth.value=todayBS.month;
fillDays();
bsDay.value=todayBS.day;
}
adInput.addEventListener('input',showAD);
[bsYear,bsMonth,bsDay].forEach(function(select){select.addEventListener('change',showBS)});
showAD();
showBS();
})();
