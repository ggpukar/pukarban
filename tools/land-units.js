(function(){
var el=ToolKit.el,SQM=1/0.09290304;
var UNITS=[
{id:'ropani',name:'Ropani',feet:5476},
{id:'aana',name:'Aana',feet:342.25},
{id:'paisa',name:'Paisa',feet:85.5625},
{id:'daam',name:'Daam',feet:21.390625},
{id:'bigha',name:'Bigha',feet:72900},
{id:'kattha',name:'Kattha',feet:3645},
{id:'dhur',name:'Dhur',feet:182.25},
{id:'sqft',name:'Square feet',feet:1},
{id:'sqm',name:'Square metres',feet:SQM},
{id:'acre',name:'Acres',feet:43560},
{id:'hectare',name:'Hectares',feet:10000*SQM}
];
var amount=document.getElementById('land-amount'),unit=document.getElementById('land-unit'),body=document.getElementById('land-body'),hill=document.getElementById('land-hill'),terai=document.getElementById('land-terai'),message=document.getElementById('land-message');
var format=new Intl.NumberFormat('en-US',{maximumFractionDigits:4});

function breakdown(feet,parts){
var left=feet,out=[];
parts.forEach(function(part,i){
var last=i===parts.length-1,count=last?Math.round(left/part.feet*100)/100:Math.floor(left/part.feet+1e-9);
left-=count*part.feet;
out.push(format.format(count)+' '+part.name.toLowerCase());
});
return out.join(', ');
}
function update(){
var value=parseFloat(amount.value),chosen=UNITS.filter(function(u){return u.id===unit.value})[0];
body.textContent='';
if(!(value>=0)){
hill.textContent=terai.textContent='';
message.textContent=amount.value?'Enter a number that is 0 or more.':'Enter an area to convert.';
return;
}
message.textContent='';
var feet=value*chosen.feet;
UNITS.forEach(function(u){
var row=el('tr');
row.appendChild(el('th','',u.name));
row.appendChild(el('td','',format.format(feet/u.feet)));
if(u===chosen)row.className='land-chosen';
body.appendChild(row);
});
hill.textContent=breakdown(feet,UNITS.slice(0,4));
terai.textContent=breakdown(feet,UNITS.slice(4,7));
}
UNITS.forEach(function(u){
var option=el('option','',u.name);
option.value=u.id;
unit.appendChild(option);
});
amount.addEventListener('input',update);
unit.addEventListener('change',update);
update();
})();
