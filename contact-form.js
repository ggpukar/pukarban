(function(){
var WEB3FORMS_KEY='22c78cff-8948-442c-8891-a37596d3bd09';
var ENDPOINT='https://api.web3forms.com/submit',TIMEOUT_MS=15000;
var form=document.getElementById('contact-form'),button=document.getElementById('cf-send'),status=document.getElementById('cf-status');
var checks={
name:function(v){return v?'':'Enter your name.'},
email:function(v){return /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[^\s@.]{2,}$/.test(v)?'':'Enter a valid email address.'},
message:function(v){return v?'':'Enter a message.'}
};
function gmailLink(name,email,message){
var body=message+'\n\nFrom: '+name+' <'+email+'>';
return 'https://mail.google.com/mail/?view=cm&fs=1&to=banpukar00@gmail.com&su='+encodeURIComponent('Portfolio message from '+name)+'&body='+encodeURIComponent(body);
}
function showStatus(text,gmail){
status.textContent=text;
if(gmail){
var link=document.createElement('a');
link.href=gmail;
link.target='_blank';
link.rel='noopener';
link.textContent='Send it with Gmail instead';
status.appendChild(document.createTextNode(' '));
status.appendChild(link);
}
}
function send(name,email,message){
var controller=new AbortController(),timer=setTimeout(function(){controller.abort()},TIMEOUT_MS);
button.disabled=true;
button.textContent='Sending…';
showStatus('');
fetch(ENDPOINT,{
method:'POST',
headers:{'Content-Type':'application/json',Accept:'application/json'},
body:JSON.stringify({access_key:WEB3FORMS_KEY,subject:'Portfolio message from '+name,from_name:name,name:name,email:email,message:message}),
signal:controller.signal
}).then(function(res){
return res.json().then(function(data){
if(!res.ok||!data.success)throw new Error(data.message||res.status);
});
}).then(function(){
form.reset();
showStatus('Thanks, your message has been sent. I\'ll reply by email.');
}).catch(function(){
showStatus('Your message couldn\'t be sent.',gmailLink(name,email,message));
}).then(function(){
clearTimeout(timer);
button.disabled=false;
button.textContent='Send Message';
});
}
if(WEB3FORMS_KEY){
button.textContent='Send Message';
status.textContent='';
}
form.addEventListener('submit',function(event){
event.preventDefault();
var first=null;
Object.keys(checks).forEach(function(name){
var input=form[name],error=checks[name](input.value.trim());
document.getElementById(input.id+'-error').textContent=error;
input.setAttribute('aria-invalid',error?'true':'false');
if(error&&!first)first=input;
});
if(first){
first.focus();
return;
}
var name=form.name.value.trim(),email=form.email.value.trim(),message=form.message.value.trim();
if(form.website.value){
form.reset();
showStatus('Thanks, your message has been sent. I\'ll reply by email.');
return;
}
if(WEB3FORMS_KEY){
send(name,email,message);
return;
}
var gmail=gmailLink(name,email,message);
if(!window.open(gmail,'_blank'))location.href=gmail;
});
})();
