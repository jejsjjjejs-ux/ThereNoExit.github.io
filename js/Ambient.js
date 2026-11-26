// Генеративный эмбиент на Web Audio: без аудиофайлов, не повторяется и не зацикливается.
// Браузеры разрешают звук только после клика, поэтому запускать его нужно из обработчика действия пользователя.
const Ambient=(()=>{
const presets={};
let ctx=null,master=null,timers=[],active=null,token=0;
const rand=(a,b)=>a+Math.random()*(b-a);
const pick=a=>a[Math.floor(Math.random()*a.length)];
const midi=n=>440*Math.pow(2,(n-69)/12);

function noiseBuffer(c,sec){
  const n=Math.floor(c.sampleRate*sec),b=c.createBuffer(2,n,c.sampleRate);
  for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<n;i++)d[i]=Math.random()*2-1}
  return b;
}
function reverbImpulse(c,sec,decay){
  const n=Math.floor(c.sampleRate*sec),b=c.createBuffer(2,n,c.sampleRate);
  for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,decay)}
  return b;
}

// ---------- Алиса: пустая заброшенная школа, гнетущая тишина, далёкий поезд, детская музыкальная шкатулка ----------
presets.alisa={
  title:"Алиса: пустая школа, далёкий поезд",
  build(c,dry,wet,later,srcs){
    const start=o=>{o.start();srcs.push(o)};

    // 1. Низкий гул здания (ля-минор), медленно «дышит»
    const droneLP=c.createBiquadFilter();droneLP.type="lowpass";droneLP.frequency.value=260;droneLP.Q.value=.6;
    const droneG=c.createGain();droneG.gain.value=.05;
    droneLP.connect(droneG);droneG.connect(dry);droneG.connect(wet);
    [[55,"sawtooth",0],[55,"sawtooth",7],[82.41,"sine",-4],[110,"triangle",3]].forEach(([f,type,det])=>{
      const o=c.createOscillator();o.type=type;o.frequency.value=f;o.detune.value=det;o.connect(droneLP);start(o);
    });
    const droneLfo=c.createOscillator();droneLfo.frequency.value=.045;
    const droneLfoG=c.createGain();droneLfoG.gain.value=90;
    droneLfo.connect(droneLfoG);droneLfoG.connect(droneLP.frequency);start(droneLfo);

    // 2. Тонкий «холодный» тон, как гудение лампы в пустом классе
    [[220,.03],[261.63,.05],[329.63,.07]].forEach(([f,rate],i)=>{
      const o=c.createOscillator();o.type="sine";o.frequency.value=f;o.detune.value=rand(-6,6);
      const g=c.createGain();g.gain.value=.012;
      const l=c.createOscillator();l.frequency.value=rate+i*.013;
      const lg=c.createGain();lg.gain.value=.011;
      l.connect(lg);lg.connect(g.gain);
      o.connect(g);g.connect(dry);g.connect(wet);start(o);start(l);
    });

    // 3. Ветер в разбитых окнах
    const wind=c.createBufferSource();wind.buffer=noiseBuffer(c,5);wind.loop=true;
    const windBP=c.createBiquadFilter();windBP.type="bandpass";windBP.frequency.value=480;windBP.Q.value=.7;
    const windG=c.createGain();windG.gain.value=.05;
    const windLfo=c.createOscillator();windLfo.frequency.value=.07;
    const windLfoG=c.createGain();windLfoG.gain.value=220;
    windLfo.connect(windLfoG);windLfoG.connect(windBP.frequency);
    const windLfo2=c.createOscillator();windLfo2.frequency.value=.11;
    const windLfo2G=c.createGain();windLfo2G.gain.value=.03;
    windLfo2.connect(windLfo2G);windLfo2G.connect(windG.gain);
    wind.connect(windBP);windBP.connect(windG);windG.connect(dry);windG.connect(wet);
    start(wind);start(windLfo);start(windLfo2);

    // 4. Поезд где-то вдалеке: изредка проходит, стучит и гудит
    const trainNoise=noiseBuffer(c,3);
    const trainLP=c.createBiquadFilter();trainLP.type="lowpass";trainLP.frequency.value=320;trainLP.Q.value=.5;
    const trainG=c.createGain();trainG.gain.value=0;
    trainLP.connect(trainG);trainG.connect(dry);trainG.connect(wet);
    function chuff(t,strong){
      const s=c.createBufferSource();s.buffer=trainNoise;
      const bp=c.createBiquadFilter();bp.type="bandpass";bp.frequency.value=380;bp.Q.value=.9;
      const g=c.createGain();
      g.gain.setValueAtTime(0,t);
      g.gain.linearRampToValueAtTime(strong?.9:.5,t+.02);
      g.gain.exponentialRampToValueAtTime(.001,t+.17);
      s.connect(bp);bp.connect(g);g.connect(trainLP);
      s.start(t,rand(0,2));s.stop(t+.2);
      if(strong){
        const o=c.createOscillator();o.type="sine";
        o.frequency.setValueAtTime(72,t);o.frequency.exponentialRampToValueAtTime(38,t+.14);
        const og=c.createGain();
        og.gain.setValueAtTime(0,t);og.gain.linearRampToValueAtTime(1,t+.01);og.gain.exponentialRampToValueAtTime(.001,t+.2);
        o.connect(og);og.connect(trainLP);o.start(t);o.stop(t+.22);
      }
    }
    function horn(t){
      [185,220].forEach((f,i)=>{
        const o=c.createOscillator();o.type=i?"triangle":"sine";
        o.frequency.setValueAtTime(f,t);o.frequency.linearRampToValueAtTime(f*.97,t+3.6);
        const g=c.createGain();
        g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.05,t+.5);
        g.gain.setValueAtTime(.05,t+2);g.gain.linearRampToValueAtTime(0,t+4.2);
        const lp=c.createBiquadFilter();lp.type="lowpass";lp.frequency.value=900;
        o.connect(lp);lp.connect(g);g.connect(wet);g.connect(dry);
        o.start(t);o.stop(t+4.4);
      });
    }
    function trainPass(){
      const len=rand(28,40),iv=rand(.36,.46),t0=c.currentTime;
      trainG.gain.cancelScheduledValues(t0);
      trainG.gain.setValueAtTime(0,t0);
      trainG.gain.linearRampToValueAtTime(.4,t0+len*.45);
      trainG.gain.linearRampToValueAtTime(0,t0+len);
      trainLP.frequency.cancelScheduledValues(t0);
      trainLP.frequency.setValueAtTime(260,t0);
      trainLP.frequency.linearRampToValueAtTime(780,t0+len*.45);
      trainLP.frequency.linearRampToValueAtTime(240,t0+len);
      if(Math.random()<.8)later(()=>horn(c.currentTime+.05),rand(4000,9000));
      let i=0;
      const tick=()=>{
        if(c.currentTime-t0>len){later(trainPass,rand(35000,70000));return}
        chuff(c.currentTime+.03,i%4===0);i++;
        later(tick,iv*1000);
      };
      tick();
    }
    later(trainPass,rand(6000,14000));

    // 5. Музыкальная шкатулка: редкие неровные ноты, иногда короткая фраза
    const scale=[69,72,74,76,79,81,84];
    function note(t,m,vel){
      const f=midi(m)*Math.pow(2,rand(-12,12)/1200);
      const g=c.createGain();
      g.gain.setValueAtTime(0,t);
      g.gain.linearRampToValueAtTime(vel,t+.008);
      g.gain.exponentialRampToValueAtTime(.0001,t+rand(2.2,3.4));
      const o1=c.createOscillator();o1.type="sine";o1.frequency.value=f;
      const o2=c.createOscillator();o2.type="sine";o2.frequency.value=f*2.76;
      const g2=c.createGain();g2.gain.value=.18;
      o1.connect(g);o2.connect(g2);g2.connect(g);
      g.connect(dry);g.connect(wet);
      o1.start(t);o2.start(t);o1.stop(t+3.6);o2.stop(t+3.6);
    }
    function phrase(){
      const i0=Math.floor(rand(1,scale.length));
      if(Math.random()<.65)note(c.currentTime+.05,scale[i0],.05);
      else{
        const steps=pick([[0,-1,-2,-1],[0,-2,-1],[0,1,0,-2]]);
        steps.forEach((s,k)=>note(c.currentTime+.05+k*rand(.55,.75),scale[Math.max(0,Math.min(scale.length-1,i0+s))],.045));
      }
      later(phrase,rand(5000,12000));
    }
    later(phrase,rand(3000,6000));
  }
};

// ---------- Мира: двуличная предательница, холодная тревога, скрытая угроза, фальшивая невинность ----------
presets.mira={
  title:"Мира: холодная тревога, скрытая угроза",
  build(c,dry,wet,later,srcs){
    const start=o=>{o.start();srcs.push(o)};

    // 1. Холодный минорный дрон: безэмоциональная база (недоверие)
    const droneLP=c.createBiquadFilter();droneLP.type="lowpass";droneLP.frequency.value=200;droneLP.Q.value=.5;
    const droneG=c.createGain();droneG.gain.value=.05;
    droneLP.connect(droneG);droneG.connect(dry);droneG.connect(wet);
    [[55,"sawtooth",-2],[55,"sawtooth",8],[65.41,"sine",-5],[82.41,"sine",4]].forEach(([f,type,det])=>{
      const o=c.createOscillator();o.type=type;o.frequency.value=f;o.detune.value=det;o.connect(droneLP);start(o);
    });
    const droneLfo=c.createOscillator();droneLfo.frequency.value=.05;
    const droneLfoG=c.createGain();droneLfoG.gain.value=70;
    droneLfo.connect(droneLfoG);droneLfoG.connect(droneLP.frequency);start(droneLfo);

    // 2. Тревожный пульс: редкие глухие удары (скрытая угроза)
    const thump=c.createOscillator();thump.type="sine";thump.frequency.value=40;
    const thumpG=c.createGain();thumpG.gain.value=0;
    thump.connect(thumpG);thumpG.connect(dry);thumpG.connect(wet);start(thump);
    function pulse(){
      const t=c.currentTime+rand(.2,.8);
      thumpG.gain.cancelScheduledValues(t);
      thumpG.gain.setValueAtTime(0,t);
      thumpG.gain.linearRampToValueAtTime(.09,t+.02);
      thumpG.gain.exponentialRampToValueAtTime(.0001,t+1.4);
      later(pulse,rand(5000,11000));
    }
    later(pulse,rand(3000,7000));

    // 3. Неустойчивый «шёпот»: лёгкий шум, как недосказанность
    const hush=c.createBufferSource();hush.buffer=noiseBuffer(c,5);hush.loop=true;
    const hushBP=c.createBiquadFilter();hushBP.type="bandpass";hushBP.frequency.value=1800;hushBP.Q.value=2.5;
    const hushG=c.createGain();hushG.gain.value=0;
    const hushLfo=c.createOscillator();hushLfo.frequency.value=.09;
    const hushLfoG=c.createGain();hushLfoG.gain.value=.012;
    hushLfo.connect(hushLfoG);hushLfoG.connect(hushG.gain);
    hush.connect(hushBP);hushBP.connect(hushG);hushG.connect(dry);hushG.connect(wet);
    start(hush);start(hushLfo);

    // 4. Фальшивая музыкальная шкатулка: наивные ноты, но расстроенные и с дрейфом высоты (двуличие)
    const scale=[52,55,57,59,60,62,64,67];
    function bell(t,m,vel,drift){
      const f=midi(m)*Math.pow(2,(drift||0));
      const g=c.createGain();
      g.gain.setValueAtTime(0,t);
      g.gain.linearRampToValueAtTime(vel,t+.01);
      g.gain.exponentialRampToValueAtTime(.0001,t+rand(2.6,4));
      const o1=c.createOscillator();o1.type="sine";o1.frequency.value=f;
      const o2=c.createOscillator();o2.type="sine";o2.frequency.value=f*2.72;
      const g2=c.createGain();g2.gain.value=.16;
      o1.connect(g);o2.connect(g2);g2.connect(g);
      g.connect(dry);g.connect(wet);
      o1.start(t);o2.start(t);o1.stop(t+4.2);o2.stop(t+4.2);
    }
    function boxPhrase(){
      // то «невинная» фраза, то неожиданный диссонанс
      const i0=Math.floor(rand(1,scale.length-1));
      if(Math.random()<.6){
        const steps=pick([[0,-2,-1,0],[0,1,-1],[0,-1,-2,1]]);
        steps.forEach((s,k)=>bell(c.currentTime+.06+k*rand(.6,.8),scale[Math.max(0,Math.min(scale.length-1,i0+s))],.045,0));
      }else{
        // фальшивый «сбой»: грязная нота
        const bad=scale[Math.max(0,Math.min(scale.length-1,Math.floor(rand(0,scale.length))))];
        bell(c.currentTime+.05,bad,.06,rand(-28,28));
        later(()=>bell(c.currentTime,bad,0.001,0),rand(150,400));
      }
      later(boxPhrase,rand(7000,16000));
    }
    later(boxPhrase,rand(4000,8000));

    // 5. Резкие «уколы»: редкие внезапные высокие всплески (предательство) — приглушённые
    function sting(){
      const t=c.currentTime+rand(0,.3);
      [1400,1660,2100].forEach((f,k)=>{
        const o=c.createOscillator();o.type="triangle";o.frequency.value=f*(1+rand(-.02,.02));
        const g=c.createGain();
        g.gain.setValueAtTime(0,t+k*.06);
        g.gain.linearRampToValueAtTime(.012,t+k*.06+.005);
        g.gain.exponentialRampToValueAtTime(.0001,t+k*.06+.18);
        o.connect(g);g.connect(wet);o.start(t+k*.06);o.stop(t+k*.06+.2);
      });
      later(sting,rand(18000,32000));
    }
    later(sting,rand(10000,18000));
  }
};

// ---------- Гордон: добрый человек, упавший в пучину отчаяния. Тёплые воспоминания, тоска, глубокая опустошённость ----------
presets.gordon={
  title:"Гордон: тепло былое, тоска, пучина",
  build(c,dry,wet,later,srcs){
    const start=o=>{o.start();srcs.push(o)};

    // 1. Тёплый мягкий дрон: грусть без злости, доброта поверх скорби (мажор с минорной тягой)
    const droneLP=c.createBiquadFilter();droneLP.type="lowpass";droneLP.frequency.value=300;droneLP.Q.value=.5;
    const droneG=c.createGain();droneG.gain.value=.045;
    droneLP.connect(droneG);droneG.connect(dry);droneG.connect(wet);
    [[65.41,"sine",0],[98,"sine",5],[130.81,"triangle",0],[82.41,"sine",-6]].forEach(([f,type,det])=>{
      const o=c.createOscillator();o.type=type;o.frequency.value=f;o.detune.value=det;o.connect(droneLP);start(o);
    });
    const droneLfo=c.createOscillator();droneLfo.frequency.value=.05;
    const droneLfoG=c.createGain();droneLfoG.gain.value=70;
    droneLfo.connect(droneLfoG);droneLfoG.connect(droneLP.frequency);start(droneLfo);

    // 2. Колыбельная-шарманка: редкие нежные ноты, будто тёплое воспоминание, но медленные и чуть печальные
    const scale=[60,62,64,67,69];
    function lull(t,m,vel){
      const f=midi(m);
      const g=c.createGain();
      g.gain.setValueAtTime(0,t);
      g.gain.linearRampToValueAtTime(vel,t+.02);
      g.gain.exponentialRampToValueAtTime(.00008,t+rand(3,4.6));
      const o1=c.createOscillator();o1.type="sine";o1.frequency.value=f;
      const o2=c.createOscillator();o2.type="sine";o2.frequency.value=f*1.5;
      const g2=c.createGain();g2.gain.value=.28;
      // небольшая расстроенность: намёк на тоску
      o1.detune.value=0;o2.detune.value=rand(-4,2);
      o1.connect(g);o2.connect(g2);g2.connect(g);
      g.connect(dry);g.connect(wet);
      o1.start(t);o2.start(t);o1.stop(t+5);o2.stop(t+5);
    }
    function lullPhrase(){
      const i0=Math.floor(rand(0,scale.length));
      const steps=pick([[0,2,0,-1],[-2,0,-2],[-2,0,2],[0,3,0]]);
      const slow=rand(.8,1.3);
      steps.forEach((s,k)=>{
        const idx=Math.max(0,Math.min(scale.length-1,i0+s));
        lull(c.currentTime+.05+k*slow,scale[idx],.05);
      });
      later(lullPhrase,rand(9000,17000));
    }
    later(lullPhrase,rand(4000,8000));

    // 3. Глубокая пучина: медленный низкий гул, накатывает и спадает (отчаяние)
    const abyss=c.createOscillator();abyss.type="sine";abyss.frequency.value=32;
    const abyssG=c.createGain();abyssG.gain.value=0;
    const abyssLfo=c.createOscillator();abyssLfo.frequency.value=.06;
    const abyssLfoG=c.createGain();abyssLfoG.gain.value=.035;
    abyss.connect(abyssG);abyssG.connect(dry);abyssG.connect(wet);
    abyssLfo.connect(abyssLfoG);abyssLfoG.connect(abyssG.gain);start(abyss);start(abyssLfo);

    // 4. Дыхание-пульс: неторопливые толчки, равномерные, как усталое сердце (без тревожной дроби)
    const pulse=c.createOscillator();pulse.type="sine";pulse.frequency.value=41;
    const pulseG=c.createGain();pulseG.gain.value=0;
    pulse.connect(pulseG);pulseG.connect(dry);pulseG.connect(wet);start(pulse);
    function heartbeat(){
      const t=c.currentTime+rand(.1,.5);
      pulseG.gain.cancelScheduledValues(t);
      pulseG.gain.setValueAtTime(0,t);
      pulseG.gain.linearRampToValueAtTime(.05,t+.04);
      pulseG.gain.exponentialRampToValueAtTime(.0001,t+1.2);
      later(heartbeat,rand(5000,9000));
    }
    later(heartbeat,rand(3000,6000));

    // 5. Лёгкий ветер-память: мягкий шум как течение времени
    const wind=c.createBufferSource();wind.buffer=noiseBuffer(c,5);wind.loop=true;
    const windBP=c.createBiquadFilter();windBP.type="lowpass";windBP.frequency.value=700;windBP.Q.value=.4;
    const windG=c.createGain();windG.gain.value=.018;
    const windLfo=c.createOscillator();windLfo.frequency.value=.05;
    const windLfoG=c.createGain();windLfoG.gain.value=.012;
    windLfo.connect(windLfoG);windLfoG.connect(windG.gain);
    wind.connect(windBP);windBP.connect(windG);windG.connect(dry);windG.connect(wet);
    start(wind);start(windLfo);
  }
};

// ---------- управление ----------
function start(name){
  const p=presets[name];
  if(!p||typeof window==="undefined")return false;
  if(active===name&&ctx)return true;
  stop(true);
  const AC=window.AudioContext||window.webkitAudioContext;
  if(!AC)return false;
  const my=++token;
  ctx=new AC();
  master=ctx.createGain();master.gain.value=0;
  const comp=ctx.createDynamicsCompressor();
  master.connect(comp);comp.connect(ctx.destination);
  const dry=ctx.createGain();dry.gain.value=.9;dry.connect(master);
  const reverb=ctx.createConvolver();reverb.buffer=reverbImpulse(ctx,4.5,2.6);
  const wetIn=ctx.createGain();wetIn.gain.value=1;
  const wetOut=ctx.createGain();wetOut.gain.value=.7;
  wetIn.connect(reverb);reverb.connect(wetOut);wetOut.connect(master);
  const later=(fn,ms)=>{timers.push(setTimeout(()=>{if(my===token)fn()},ms))};
  p.build(ctx,dry,wetIn,later,[]);
  master.gain.setValueAtTime(0,ctx.currentTime);
  master.gain.linearRampToValueAtTime(.55,ctx.currentTime+5);
  active=name;
  if(ctx.state==="suspended")ctx.resume();
  return true;
}
function stop(immediate){
  token++;
  timers.forEach(clearTimeout);timers=[];
  const c=ctx,m=master;
  ctx=null;master=null;active=null;
  if(!c)return;
  try{
    if(immediate)c.close();
    else{
      m.gain.cancelScheduledValues(c.currentTime);
      m.gain.setValueAtTime(m.gain.value,c.currentTime);
      m.gain.linearRampToValueAtTime(0,c.currentTime+1.2);
      setTimeout(()=>{try{c.close()}catch(e){}},1500);
    }
  }catch(e){}
}
if(typeof document!=="undefined"){
  document.addEventListener("visibilitychange",()=>{
    if(!ctx)return;
    if(document.hidden)ctx.suspend();else ctx.resume();
  });
}
return{
  start,stop,
  isPlaying:()=>!!ctx,
  has:name=>!!presets[name],
  list:()=>Object.keys(presets).map(id=>({id,title:presets[id].title}))
};
})();
