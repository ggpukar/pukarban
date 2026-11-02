// The first home visit in a session starts on the loading screen; search engines skip it.
try{if(!sessionStorage.getItem('namasteSeen')&&!/bot|crawl|spider|slurp/i.test(navigator.userAgent))location.replace('loading')}catch(e){}
