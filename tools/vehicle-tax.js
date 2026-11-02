(function(){
var el=ToolKit.el,$=function(id){return document.getElementById(id)};
var END=Infinity,MAX_FINE_YEARS=5,OFFER_YEARS=4,ASAR=2,CHAITRA=11;
var KINDS={
two_wheeler:{name:'Two wheeler',unit:'CC',label:'Engine (CC)',size:0},
four_wheeler:{name:'Four wheeler',unit:'CC',label:'Engine (CC)',size:1},
electric_two:{name:'Electric two wheeler',unit:'watt',label:'Battery (watt)',size:0},
electric_four:{name:'Electric four wheeler',unit:'kW',label:'Battery (kW)',size:1}
};
// Third-party insurance is set nationally, so every province uses the same table.
var INSURANCE={
two_wheeler:[[149,1715],[250,1941],[END,2167]],
four_wheeler:[[1000,7365],[1600,8495],[END,10747]],
electric_two:[[799,1715],[1199,1945],[END,2167]],
electric_four:[[20,7365],[END,8495]]
};
var DAY_BANDS=[[30,5],[75,10]];
var GANDAKI_BIKE=[[125,3000],[150,5000],[225,6500],[400,11000],[650,20000],[END,30000]];
var GANDAKI_CAR=[[1000,22000],[1500,25000],[2000,27000],[2500,37000],[3000,50000],[3500,60000],[END,65000]];
var KARNALI_EV=[[500,1000],[1000,1500],[1500,2000],[3000,3000],[10000,5000],[20000,7000],[50000,10000],[150000,15000],[200000,20000],[END,30000]];
function ladder(step){return [1,2,3,4,5].map(function(n){return step*n})}
function flat(percent){return [percent,percent,percent,percent,percent]}
var PROVINCES=[
{name:'Koshi',renewal:[200,400],cap:ASAR,within:[],rest:10,after:flat(20),
due:'90 days after the expiry date, and not past the end of Asar',
tax:{two_wheeler:[[125,3100],[150,5100],[200,6500],[250,8000],[400,11000],[END,20000]],four_wheeler:[[1000,23000],[1500,25000],[2000,32000],[2500,38000],[3000,46000],[3500,63000],[END,70000]],electric_two:[[350,1800],[1000,2000],[1500,2500],[2000,3000],[END,4000]],electric_four:[[50,7000],[125,15000],[200,20000],[END,30000]]}},
{name:'Madhesh',renewal:[300,400],within:DAY_BANDS,rest:20,after:ladder(30),evByPrice:true,
due:'3 months after the expiry date',
tax:{two_wheeler:[[125,3000],[160,5000],[250,6500],[400,11000],[END,20000]],four_wheeler:[[1000,22000],[1500,25000],[2000,27000],[2500,37000],[3000,50000],[END,60000]],electric_two:[[250000,2000],[350000,3000],[END,5000]],electric_four:[[3000000,11000],[5000000,15000],[10000000,25000],[END,40000]]}},
{name:'Bagmati',renewal:[300,500],within:[[30,5],[45,10]],rest:20,after:ladder(32),official:true,flatRenewalFine:true,
due:'90 days after the expiry date',
tax:{two_wheeler:[[125,3000],[150,5000],[225,6500],[400,12000],[650,25000],[END,35000]],four_wheeler:[[1000,22000],[1500,25000],[2000,27000],[2500,37000],[3000,50000],[3500,65000],[END,70000]],electric_two:[[50,1000],[350,1500],[1000,2000],[1500,2500],[END,3000]],electric_four:[[50,5000],[125,15000],[200,20000],[END,30000]]}},
{name:'Gandaki',renewal:[300,500],within:DAY_BANDS,rest:20,after:[40,60,80,100,100],
due:'90 days after the expiry date',
tax:{two_wheeler:GANDAKI_BIKE,four_wheeler:GANDAKI_CAR,electric_two:[[50,1000],[350,1500],[1000,2000],[1500,2500],[END,3000]],electric_four:[[50,12000],[100,17000],[150,22000],[200,27000],[END,32000]]}},
{name:'Lumbini',renewal:[300,400],cap:ASAR,within:[],rest:20,after:[40,60,80,100,120],evShare:.8,
due:'90 days after the expiry date or the end of Asar, whichever comes first',
tax:{two_wheeler:GANDAKI_BIKE,four_wheeler:GANDAKI_CAR,electric_two:[[500,0],[1000,2500],[1500,3000],[END,3500]],electric_four:[[50,11000],[125,17000],[225,22000],[END,35000]]}},
{name:'Karnali',renewal:[200,500],capBeforeGrace:CHAITRA,within:[],rest:20,after:flat(30),evInWatts:true,
due:'the expiry date or the end of Chaitra, whichever comes first, plus 90 days',
tax:{two_wheeler:[[125,2700],[150,4300],[250,5500],[400,10000],[650,16000],[END,20000]],four_wheeler:[[1000,21000],[1500,23000],[2000,26000],[2500,35000],[3000,40000],[3500,56000],[END,62000]],electric_two:KARNALI_EV,electric_four:KARNALI_EV}},
{name:'Sudurpashchim',renewal:[300,500],cap:CHAITRA,within:DAY_BANDS,rest:20,after:ladder(30),
due:'90 days after the expiry date or the end of Chaitra, whichever comes first',
tax:{two_wheeler:[[125,2800],[150,5000],[250,6500],[400,11000],[650,20000],[END,30000]],four_wheeler:[[1000,22000],[1500,25000],[2000,27000],[2500,37000],[3000,50000],[3500,65000],[END,70000]],electric_two:[[50,0],[350,1000],[1000,1700],[1500,2500],[END,3500]],electric_four:[[50,12000],[125,18000],[200,24000],[END,35000]]}}
];
var BS=BSCalendar,today=BS.nepalToday(),todayBS=BS.fromDayNumber(today);

function band(table,value){
for(var i=0;i<table.length;i++)if(value<=table[i][0])return table[i][1];
}
function money(value){
return 'Rs '+(Math.round(value*100)/100).toLocaleString('en-IN');
}
function bsText(bs){
return bs.day+' '+BS.MONTHS_EN[bs.month]+' '+bs.year;
}
function fiscalYear(bs){
return bs.month>=3?bs.year:bs.year-1;
}
function addYears(bs,years){
var year=bs.year+years;
return {year:year,month:bs.month,day:Math.min(bs.day,BS.monthLength(year,bs.month))};
}
function dayOf(bs){
return BS.toDayNumber(bs.year,bs.month,bs.day);
}
// The last day of Chaitra or Asar in the fiscal year that the expiry date falls in.
function monthEnd(expiry,month){
var year=fiscalYear(expiry)+(month<3?1:0);
if(year>BS.END_YEAR)return Infinity;
return BS.toDayNumber(year,month,BS.monthLength(year,month));
}
function deadline(province,expiry){
var day=dayOf(expiry);
if(province.capBeforeGrace){
var end=monthEnd(expiry,province.capBeforeGrace);
return (end>=day?Math.min(day,end):day)+90;
}
var due=day+90;
if(province.cap){
var cap=monthEnd(expiry,province.cap);
if(cap>=day)due=Math.min(due,cap);
}
return due;
}
function lateness(province,due){
var late=today-due;
if(late<=0)return {late:0,percent:0,years:0};
var years=fiscalYear(BS.fromDayNumber(today))-fiscalYear(BS.fromDayNumber(due));
if(years>0)return {late:late,percent:province.after[Math.min(years,MAX_FINE_YEARS)-1],years:years};
for(var i=0;i<province.within.length;i++){
if(late<=province.within[i][0])return {late:late,percent:province.within[i][1],years:0};
}
return {late:late,percent:province.rest,years:0};
}
// One row for each year owed: the first runs from the expiry date, then one for every later expiry already reached.
function yearsOwed(province,expiry){
var rows=[],k=0,due=expiry;
while(k===0||dayOf(due)<=today){
var row=lateness(province,deadline(province,due));
row.expiry=due;
rows.push(row);
k++;
if(due.year+1>BS.END_YEAR)break;
due=addYears(expiry,k);
}
return rows;
}
function renewalFor(province,kind,row){
var fee=province.renewal[KINDS[kind].size];
if(!row.late)return fee;
if(province.flatRenewalFine)return fee*2;
return fee*(1+Math.min(row.years+1,5));
}
function evPrice(province,kind){
return province.evByPrice&&(kind==='electric_two'||kind==='electric_four');
}
function taxFor(province,kind,size,price){
if(evPrice(province,kind))return band(province.tax[kind],price);
var value=kind==='electric_four'&&province.evInWatts?size*1000:size;
var tax=band(province.tax[kind],value);
return kind.indexOf('electric')===0&&province.evShare?tax*province.evShare:tax;
}

function fillSelect(select,placeholder,items){
select.textContent='';
if(placeholder){var first=new Option(placeholder,'');first.disabled=true;first.selected=true;select.appendChild(first)}
items.forEach(function(item){select.appendChild(new Option(item[0],String(item[1])))});
}
function range(from,to){
var list=[];
for(var n=from;n<=to;n++)list.push([String(n),n]);
return list;
}
function fillDays(prefix){
var year=$(prefix+'-year').value,month=$(prefix+'-month').value,day=$(prefix+'-day'),chosen=+day.value;
var total=year&&month?BS.monthLength(+year,+month):32;
fillSelect(day,'Day',range(1,total));
if(chosen&&chosen<=total)day.value=String(chosen);
}
function setupDate(prefix){
var years=[];
for(var y=todayBS.year+1;y>=todayBS.year-15;y--)years.push([String(y),y]);
fillSelect($(prefix+'-year'),'Year',years);
fillSelect($(prefix+'-month'),'Month',BS.MONTHS_EN.map(function(name,i){return [name,i]}));
fillDays(prefix);
[$(prefix+'-year'),$(prefix+'-month')].forEach(function(select){select.addEventListener('change',function(){fillDays(prefix)})});
}
function readDate(prefix){
var y=$(prefix+'-year').value,m=$(prefix+'-month').value,d=$(prefix+'-day').value;
return y&&m&&d?{year:+y,month:+m,day:+d}:null;
}
function lakh(rupees){return 'Rs '+(rupees/100000)+' lakh'}
function bandText(table,i,unit){
var low=i?table[i-1][0]+1:0,high=table[i][0],show=unit==='price'?lakh:function(n){return n+' '+unit};
if(unit==='price'&&i)low=table[i-1][0];
if(high===END)return (unit==='price'?'Above ':'')+show(low)+(unit==='price'?'':' and above');
return i?show(low).replace(/ (CC|watt|kW)$/,'')+' to '+show(high):'Up to '+show(high);
}
function addRatesTable(box,title,table,unit,extra){
box.appendChild(el('h3','vt-rate-title',title));
var wrap=el('div','ne-scroll'),t=el('table','ne-table'),body=el('tbody');
table.forEach(function(row,i){
var tr=el('tr');
tr.appendChild(el('td','',bandText(table,i,unit)));
tr.appendChild(el('td','vt-num',row[1]?money(row[1]):'No tax'));
body.appendChild(tr);
});
t.appendChild(body);wrap.appendChild(t);box.appendChild(wrap);
if(extra)box.appendChild(el('p','tool-note',extra));
}
function fineRows(province){
var rows=[],from=1;
province.within.forEach(function(b){rows.push([from===1?'First '+b[0]+' days':'Up to '+b[0]+' days',b[1]+'%']);from=b[0]+1});
rows.push([province.within.length?'Up to the end of the same fiscal year':'Late, same fiscal year',province.rest+'%']);
var after=province.after;
if(after.every(function(p){return p===after[0]})&&province!==PROVINCES[2])rows.push(['Each later fiscal year',after[0]+'%']);
else after.forEach(function(p,i){rows.push([(i+1)+' fiscal year'+(i?'s':'')+' later',p+'%'])});
rows.push(['Renewal charge when late',province.flatRenewalFine?'100%':'100% for each year late, up to 500%']);
return rows;
}
function showRates(){
var province=PROVINCES[$('vt-province').value],box=$('vt-rates');
box.textContent='';
Object.keys(KINDS).forEach(function(kind){
var k=KINDS[kind],panel=el('div','tool-panel'),unit=evPrice(province,kind)?'price':kind==='electric_four'&&province.evInWatts?'watt':k.unit;
panel.appendChild(el('h2','',k.name));
addRatesTable(panel,'Yearly tax'+(unit==='price'?' (by vehicle price)':''),province.tax[kind],unit,(kind.indexOf('electric')===0&&province.evShare?'Private electric vehicles pay '+province.evShare*100+'% of these amounts. ':'')+'Renewal charge: '+money(province.renewal[k.size])+' a year.');
addRatesTable(panel,'Third-party insurance',INSURANCE[kind],k.unit);
box.appendChild(panel);
});
var body=$('vt-fine-rates');
body.textContent='';
fineRows(province).forEach(function(row){
var tr=el('tr');
tr.appendChild(el('td','',row[0]));
tr.appendChild(el('td','vt-num',row[1]));
body.appendChild(tr);
});
$('vt-fine-note').textContent='In '+province.name+', tax is due '+province.due+'. The fine percentage is charged on the tax.';
$('vt-rates-title').textContent=province.name+' rates';
$('vt-source').textContent=province.official?'Bagmati rates follow the list published by Third Wheel for fiscal year 2083/84.':province.name+' rates are estimates from public summaries of its finance act for 2083/84. Check them with your transport office.';
}
function updateFields(){
var province=PROVINCES[$('vt-province').value],kind=$('vt-type').value;
if(kind)$('vt-size-label').textContent=evPrice(province,kind)?KINDS[kind].label+', for insurance':kind==='electric_four'&&province.evInWatts?'Battery (kW)':KINDS[kind].label;
$('vt-price-box').hidden=!(kind&&evPrice(province,kind));
}

function fail(message,field){
$('vt-message').textContent=message;
$('vt-out').hidden=true;
if(field)$(field).focus();
}
function calculate(){
var province=PROVINCES[$('vt-province').value],kind=$('vt-type').value,size=Number($('vt-size').value),built=$('vt-built').value,price=Number($('vt-price').value);
var thisYear=new Date(today*86400000).getUTCFullYear();
if(!kind)return fail('Choose a vehicle type.','vt-type');
if(built&&(!Number.isInteger(+built)||+built<1985||+built>thisYear))return fail('Enter a year of manufacture from 1985 to '+thisYear+'.','vt-built');
if(!$('vt-size').value||!isFinite(size)||size<=0)return fail('Enter a number above 0 for '+KINDS[kind].label.toLowerCase()+'.','vt-size');
if(evPrice(province,kind)&&(!$('vt-price').value||!isFinite(price)||price<=0))return fail('Enter the vehicle price. '+province.name+' taxes electric vehicles by price.','vt-price');
var from=readDate('vt-from'),to=readDate('vt-to');
if(!from)return fail('Choose the full last renew date.','vt-from-year');
if(!to)return fail('Choose the full expiry date.','vt-to-year');
if(dayOf(to)<=dayOf(from))return fail('The expiry date must be after the last renew date.','vt-to-year');
$('vt-message').textContent='';

var rows=yearsOwed(province,to),pending=rows.length,offerBox=$('vt-offer-box');
offerBox.hidden=!(province.official&&pending>OFFER_YEARS);
if(!offerBox.hidden&&$('vt-offer').checked)rows=rows.slice(-OFFER_YEARS);
var tax=taxFor(province,kind,size,price),insurance=$('vt-insurance').checked?band(INSURANCE[kind],size):0;
var totalTax=0,totalFine=0,totalRenewal=0,body=$('vt-years');
body.textContent='';
rows.forEach(function(row){
var fine=tax*row.percent/100,renewal=renewalFor(province,kind,row),tr=el('tr');
totalTax+=tax;totalFine+=fine;totalRenewal+=renewal;
[bsText(row.expiry),row.late?row.late+(row.late===1?' day':' days'):'None',money(tax),money(fine)+(row.percent?' ('+row.percent+'%)':''),money(renewal),money(tax+fine+renewal)].forEach(function(text,i){
tr.appendChild(el('td',i>1?'vt-num':'',text));
});
body.appendChild(tr);
});
if(insurance){
var tr=el('tr'),label=el('td','','Third-party insurance');
label.colSpan=5;
tr.appendChild(label);
tr.appendChild(el('td','vt-num',money(insurance)));
body.appendChild(tr);
}
$('vt-total').textContent=money(totalTax+totalFine+totalRenewal+insurance);
$('vt-tax').textContent=money(totalTax);
$('vt-renewal').textContent=money(totalRenewal);
$('vt-ins').textContent=money(insurance);
$('vt-fine').textContent=money(totalFine);
$('vt-today').textContent='Worked out for today, '+bsText(todayBS)+' BS, using '+province.name+' rules. Tax is due '+province.due+'.';
$('vt-estimate').textContent=province.official?'':province.name+' figures are estimates, not an official bill.';
$('vt-ins-note').textContent=insurance?'':'Third-party insurance is compulsory. Tick the box to add it if yours has run out.';
$('vt-age').textContent=built&&thisYear-built>14?'Vehicles older than about 14 years may pay extra tax. This is not included.':'';
$('vt-lapse').textContent=pending>MAX_FINE_YEARS?'This vehicle has more than five years unpaid, so the registration may have lapsed. Ask your transport office before paying.':'';
$('vt-out').hidden=false;
}

fillSelect($('vt-province'),'',PROVINCES.map(function(p,i){return [p.name+(p.official?'':' (estimate)'),i]}));
$('vt-province').value='2';
fillSelect($('vt-type'),'Choose',Object.keys(KINDS).map(function(key){return [KINDS[key].name,key]}));
setupDate('vt-from');
setupDate('vt-to');
showRates();
$('vt-built').max=new Date(today*86400000).getUTCFullYear();
$('vt-province').addEventListener('change',function(){showRates();updateFields();$('vt-out').hidden=true});
$('vt-type').addEventListener('change',updateFields);
// Choosing a last renew date fills in the usual expiry, one year later.
['year','month','day'].forEach(function(part){
$('vt-from-'+part).addEventListener('change',function(){
var from=readDate('vt-from');
if(!from||from.year+1>BS.END_YEAR)return;
var to=addYears(from,1);
$('vt-to-year').value=String(to.year);
$('vt-to-month').value=String(to.month);
fillDays('vt-to');
$('vt-to-day').value=String(to.day);
});
});
$('vt-form').addEventListener('submit',function(event){
event.preventDefault();
calculate();
if(!$('vt-out').hidden)$('vt-out').scrollIntoView({block:'nearest'});
});
$('vt-offer').addEventListener('change',calculate);
})();
