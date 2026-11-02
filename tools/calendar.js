(function(){
var el=ToolKit.el,DAY=86400000;
var yearSelect=document.getElementById('cal-year'),monthSelect=document.getElementById('cal-month'),body=document.getElementById('cal-body'),title=document.getElementById('cal-title');
var today=BSCalendar.nepalToday(),start=BSCalendar.fromDayNumber(today)||{year:BSCalendar.START_YEAR,month:0},year=start.year,month=start.month;

function option(select,value,text){
var node=el('option','',text);
node.value=value;
select.appendChild(node);
}
for(var y=BSCalendar.START_YEAR;y<=BSCalendar.END_YEAR;y++)option(yearSelect,y,y);
BSCalendar.MONTHS.forEach(function(name,i){option(monthSelect,i,BSCalendar.MONTHS_EN[i]+' · '+name)});

function adLabel(dayNumber,withMonth){
var date=new Date(dayNumber*DAY);
return withMonth||date.getUTCDate()===1?date.toLocaleDateString('en-GB',{timeZone:'UTC',day:'numeric',month:'short'}):String(date.getUTCDate());
}
function render(){
var first=BSCalendar.toDayNumber(year,month,1),total=BSCalendar.monthLength(year,month),blank=new Date(first*DAY).getUTCDay(),row;
yearSelect.value=year;
monthSelect.value=month;
title.textContent=BSCalendar.MONTHS[month]+' '+BSCalendar.digits(year)+' · '+new Date(first*DAY).toLocaleDateString('en-GB',{timeZone:'UTC',month:'short',year:'numeric'})+' – '+new Date((first+total-1)*DAY).toLocaleDateString('en-GB',{timeZone:'UTC',month:'short',year:'numeric'});
body.textContent='';
for(var cell=0;cell<blank+total;cell++){
if(cell%7===0){
row=el('tr');
body.appendChild(row);
}
var td=el('td');
if(cell>=blank){
var number=first+cell-blank;
td.className='cal-day'+(cell%7===6?' cal-saturday':'')+(number===today?' cal-today':'');
if(number===today)td.setAttribute('aria-current','date');
td.appendChild(el('span','cal-bs',BSCalendar.digits(cell-blank+1)));
td.appendChild(el('span','cal-ad',adLabel(number,cell===blank)));
}
row.appendChild(td);
}
while(row.children.length<7)row.appendChild(el('td'));
document.getElementById('cal-prev').disabled=year===BSCalendar.START_YEAR&&month===0;
document.getElementById('cal-next').disabled=year===BSCalendar.END_YEAR&&month===11;
}
function move(step){
var index=year*12+month+step;
year=Math.floor(index/12);
month=index%12;
render();
}
document.getElementById('cal-prev').addEventListener('click',function(){move(-1)});
document.getElementById('cal-next').addEventListener('click',function(){move(1)});
document.getElementById('cal-today').addEventListener('click',function(){
year=start.year;
month=start.month;
render();
});
yearSelect.addEventListener('change',function(){
year=+yearSelect.value;
render();
});
monthSelect.addEventListener('change',function(){
month=+monthSelect.value;
render();
});
render();
})();
