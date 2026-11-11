// Лёгкие искры, поднимающиеся над фоном. Выключаются при prefers-reduced-motion.
(function(){
if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;
const cv=document.createElement("canvas");
cv.id="embers";cv.setAttribute("aria-hidden","true");
document.body.prepend(cv);
const cx=cv.getContext("2d");
let W=0,H=0,dpr=1,parts=[],raf=0;
const sprite=document.createElement("canvas");sprite.width=sprite.height=32;
(function(){const g=sprite.getContext("2d"),r=g.createRadialGradient(16,16,0,16,16,16);
r.addColorStop(0,"rgba(255,210,150,1)");r.addColorStop(.25,"rgba(255,110,50,.9)");r.addColorStop(1,"rgba(255,60,20,0)");
g.fillStyle=r;g.fillRect(0,0,32,32)})();
function resize(){
dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;
cv.width=W*dpr;cv.height=H*dpr;cx.setTransform(dpr,0,0,dpr,0,0);
const n=Math.round(Math.min(60,Math.max(18,W*H/26000)));
while(parts.length<n)parts.push(make(true));
parts.length=n;
}
function make(init){
return{x:Math.random()*W,y:init?Math.random()*H:H+20,r:3+Math.random()*9,v:.12+Math.random()*.4,
sw:Math.random()*Math.PI*2,sa:.15+Math.random()*.5,life:Math.random(),a:.25+Math.random()*.6}
}
function frame(t){
cx.clearRect(0,0,W,H);
for(const p of parts){
p.y-=p.v;p.sw+=.012;p.x+=Math.sin(p.sw)*p.sa;
const fade=Math.min(1,(H-p.y)/(H*.25),p.y/(H*.35)+.15);
if(p.y<-20){Object.assign(p,make(false));}
cx.globalAlpha=Math.max(0,p.a*fade*(.7+.3*Math.sin(t/500+p.life*20)));
cx.drawImage(sprite,p.x-p.r,p.y-p.r,p.r*2,p.r*2);
}
raf=requestAnimationFrame(frame);
}
addEventListener("resize",resize);
document.addEventListener("visibilitychange",()=>{cancelAnimationFrame(raf);if(!document.hidden)raf=requestAnimationFrame(frame)});
resize();raf=requestAnimationFrame(frame);
})();
