(function(){
var el=ToolKit.el,GRADES=[['A+',4],['A',3.6],['B+',3.2],['B',2.8],['C+',2.4],['C',2],['D',1.6],['NG',0]];
var rows=document.getElementById('gpa-rows'),add=document.getElementById('gpa-add'),result=document.getElementById('gpa-result'),note=document.getElementById('gpa-note');
var obtained=document.getElementById('pct-obtained'),full=document.getElementById('pct-full'),pct=document.getElementById('pct-result');
var nextId=1;

function field(label,control){
var box=el('div','gpa-field'),id='gpa-'+control.dataset.kind+'-'+nextId;
control.id=id;
var text=el('label','tool-label',label);
text.htmlFor=id;
box.appendChild(text);
box.appendChild(control);
return box;
}
function addRow(){
var row=el('div','gpa-row');
var name=el('input','tool-input');
name.dataset.kind='name';
name.placeholder='Subject (optional)';
var credit=el('input','tool-input gpa-credit');
credit.dataset.kind='credit';
credit.type='number';
credit.min='0';
credit.step='0.25';
credit.inputMode='decimal';
credit.value='4';
var grade=el('select','tool-input gpa-grade');
grade.dataset.kind='grade';
GRADES.forEach(function(entry){
var option=el('option','',entry[0]+' ('+entry[1].toFixed(1)+')');
option.value=entry[1];
option.dataset.letter=entry[0];
grade.appendChild(option);
});
var remove=el('button','pdf-action gpa-remove','×');
remove.type='button';
remove.setAttribute('aria-label','Remove subject');
remove.addEventListener('click',function(){
row.remove();
update();
});
row.appendChild(field('Subject',name));
row.appendChild(field('Credit hours',credit));
row.appendChild(field('Grade',grade));
row.appendChild(remove);
rows.appendChild(row);
nextId++;
credit.addEventListener('input',update);
grade.addEventListener('change',update);
}
function update(){
var totalCredit=0,points=0,hasNg=false,invalid=false;
[].forEach.call(rows.children,function(row){
var credit=parseFloat(row.querySelector('.gpa-credit').value),grade=row.querySelector('.gpa-grade');
if(!(credit>0)){
invalid=true;
return;
}
totalCredit+=credit;
points+=credit*(+grade.value);
if(grade.selectedOptions[0].dataset.letter==='NG')hasNg=true;
});
if(invalid||!totalCredit){
result.textContent='GPA: –';
note.textContent=invalid?'Enter credit hours above 0 for every subject.':'Add a subject to work out your GPA.';
return;
}
result.textContent='GPA: '+(Math.round(points/totalCredit*100)/100).toFixed(2);
note.textContent=(rows.children.length+(rows.children.length===1?' subject · ':' subjects · '))+totalCredit+' credit hours'+(hasNg?'. NG counts as 0 here, but an official result may not give a GPA with an NG subject.':'');
}
function updatePercent(){
var a=parseFloat(obtained.value),b=parseFloat(full.value);
if(obtained.value===''||full.value===''){
pct.textContent='Percentage: –';
return;
}
if(!(a>=0)||!(b>0)||a>b){
pct.textContent='Marks obtained must be between 0 and the full marks.';
return;
}
pct.textContent='Percentage: '+(Math.round(a/b*10000)/100)+'%';
}
add.addEventListener('click',function(){
addRow();
update();
});
obtained.addEventListener('input',updatePercent);
full.addEventListener('input',updatePercent);
for(var i=0;i<4;i++)addRow();
update();
updatePercent();
})();
