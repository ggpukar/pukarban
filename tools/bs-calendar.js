(function(){
var START_YEAR=2000,END_YEAR=2086,DAY=86400000,NEPAL_OFFSET=20700000;
var FIRST_DAY=Date.UTC(1943,3,14)/DAY;
var YEARS=[
"cededcccbcbd",
"ddedddcbcbcc",
"ddeedccbcbcc",
"dededcccbbcd",
"cededcccbcbd",
"ddedddcbcbcc",
"ddeedccbcbcc",
"dededcccbbcd",
"dddeddbccbbd",
"ddedddcbcbcc",
"ddeedccbcbcc",
"dededcccbbcd",
"dddeddbccbcc",
"ddedddcbcbcc",
"ddeedccbcbcc",
"dededcccbbcd",
"dddeddbccbcc",
"ddedddcbcbcc",
"dededccbcbcc",
"dededcccbcbd",
"dddeddcbcbcc",
"ddedddcbcbcc",
"dededcccbbcc",
"dededcccbcbd",
"dddeddcbcbcc",
"ddedddcbcbcc",
"dededcccbbcd",
"cededcccbcbd",
"ddedddcbcbcc",
"ddedeccbcbcc",
"dededcccbbcd",
"cededcccbcbd",
"ddedddcbcbcc",
"ddeedccbcbcc",
"dededcccbbcd",
"cededdbccbbd",
"ddedddcbcbcc",
"ddeedccbcbcc",
"dededcccbbcd",
"dddeddbccbcc",
"ddedddcbcbcc",
"ddeedccbcbcc",
"dededcccbbcd",
"dddeddbccbcc",
"ddedddcbcbcc",
"dededccbcbcc",
"dededcccbbcd",
"dddeddcbcbcc",
"ddedddcbcbcc",
"dededcccbbcc",
"dededcccbcbd",
"dddeddcbcbcc",
"ddedddcbcbcc",
"dededcccbbcc",
"dededcccbcbd",
"ddedddcbcbcc",
"ddedeccbcbcc",
"dededcccbbcd",
"cededcccbcbd",
"ddedddcbcbcc",
"ddeedccbcbcc",
"dededcccbbcd",
"cededdbcbcbd",
"ddedddcbcbcc",
"ddeedccbcbcc",
"dededcccbbcd",
"dddeddbccbbd",
"ddedddcbcbcc",
"ddeedccbcbcc",
"dededcccbbcd",
"dddeddbccbcc",
"ddedddcbcbcc",
"dededccbcbcc",
"dededcccbbcd",
"dddeddcbcbcc",
"ddedddcbcbcc",
"dededcccbbcc",
"dededcccbcbd",
"dddeddcbcbcc",
"ddedddcbcbcc",
"dededcccbbcc",
"dededcccbcbd",
"ddedddcbcbcc",
"ddedddcbcbcc",
"ddeddcccbccc",
"dedecdccbccc",
"cededcccbccc"
];
function monthLength(year,month){return YEARS[year-START_YEAR].charCodeAt(month)-69}
function yearLength(year){
var total=0;
for(var m=0;m<12;m++)total+=monthLength(year,m);
return total;
}
var yearStarts=[FIRST_DAY];
for(var y=START_YEAR;y<=END_YEAR;y++)yearStarts.push(yearStarts[y-START_YEAR]+yearLength(y));
var LAST_DAY=yearStarts[yearStarts.length-1]-1;
function iso(dayNumber){return new Date(dayNumber*DAY).toISOString().slice(0,10)}
window.BSCalendar={
START_YEAR:START_YEAR,
END_YEAR:END_YEAR,
MONTHS:['बैशाख','जेठ','असार','साउन','भदौ','असोज','कात्तिक','मंसिर','पुष','माघ','फागुन','चैत'],
MONTHS_EN:['Baisakh','Jestha','Asar','Saun','Bhadau','Asoj','Kartik','Mangsir','Push','Magh','Fagun','Chait'],
DAYS:['आइतबार','सोमबार','मङ्गलबार','बुधबार','बिहीबार','शुक्रबार','शनिबार'],
monthLength:monthLength,
firstAD:function(){return iso(FIRST_DAY)},
lastAD:function(){return iso(LAST_DAY)},
digits:function(n){return String(n).replace(/\d/g,function(d){return '०१२३४५६७८९'[d]})},
nepalToday:function(){return Math.floor((Date.now()+NEPAL_OFFSET)/DAY)},
toDayNumber:function(year,month,day){
var total=yearStarts[year-START_YEAR]+day-1;
for(var m=0;m<month;m++)total+=monthLength(year,m);
return total;
},
fromDayNumber:function(dayNumber){
if(dayNumber<FIRST_DAY||dayNumber>LAST_DAY)return null;
var year=START_YEAR,left;
while(yearStarts[year-START_YEAR+1]<=dayNumber)year++;
left=dayNumber-yearStarts[year-START_YEAR];
for(var month=0;month<12;month++){
if(left<monthLength(year,month))return {year:year,month:month,day:left+1,weekday:new Date(dayNumber*DAY).getUTCDay()};
left-=monthLength(year,month);
}
return null;
},
format:function(bs){return BSCalendar.DAYS[bs.weekday]+', '+BSCalendar.MONTHS[bs.month]+' '+BSCalendar.digits(bs.day)+', '+BSCalendar.digits(bs.year)}
};
})();
