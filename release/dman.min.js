/**
 * DMan - Javascript dependency manager.
 * Copyright (C) 2011 Jakob Kemi <jakob.kemi@gmail.com>
 * Code licensed under the BSD License, see COPYING.
 */
function DM(){this.fin={};this.pen={};this.wai=[];this.tim=null}DM.prototype.onDone=function(c,e,b){var a=true;
for(var d=0;a&&d<e.length;d++){if(!this.fin[e[d]]){a=false}}if(a){b()}else{this.wai.push([e,b]);if(!this.timer){this.chk()
}}};DM.prototype.task=function(b,a){this.pen[b]=a};DM.prototype.markDone=function(a){if(a in this.pen){delete this.pen[a];
this.fin[a]=true;this.chk()}else{this.fin[a]=true}};DM.prototype.onDoneJS=function(c,e,b,a){if((a!=null)&&a()){this.fin[c]=true
}else{var d=this;this.onDone(c,e,function(){if(!(d.fin[c]||d.pen[c])){d.task(c,null);var f=document.createElement("script");
f.src=b;f.type="text/javascript";if(f.onreadystatechange!==undefined){f.onreadystatechange=function(){if(this.readyState=="complete"||this.readyState=="loaded"){d.markDone(c)
}}}f.onload=function(){d.markDone(c)};document.getElementsByTagName("head")[0].appendChild(f)}})}};DM.prototype.taskCSS=function(b,a){var c=this;
this.onDone(b,[],function(){if(!(c.fin[b]||c.pen[b])){c.task(b,null);var d=document.createElement("link");
d.href=a;d.type="text/css";d.rel="stylesheet";document.getElementsByTagName("head")[0].appendChild(d);
c.markDone(b)}})};DM.prototype.chk=function(){var b=false;for(var a in this.pen){if(this.pen[a]!=null){var h=this.pen[a]();
if(h){delete this.pen[a];this.fin[a]=true}else{b=true}}}var i=[];var f;while(f=this.wai.pop()){var c=true;
var l=f[0];for(var e=0;c&&e<l.length;e++){var k=l[e];if(!this.fin[k]){c=false}}if(c){var d=f[1];d()}else{i.push(f)
}}while(f=i.pop()){this.wai.push(f)}if(b){if(!this.tim){var g=this;this.tim=setInterval(function(){g.chk()
},15)}return}if(this.tim){clearInterval(this.tim);this.tim=null}};