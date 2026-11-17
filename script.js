(() => {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const body = document.body, curtain = $('#curtain');

  /* ---------- candles ---------- */
  function candles(host, n){
    host.innerHTML='';
    for(let i=0;i<n;i++){
      const c=document.createElement('i'); c.className='candle';
      c.style.left=(i/(n-1)*96+2+(Math.random()*3-1.5))+'%';
      c.style.height=(14+Math.random()*26)+'px';
      c.firstChild; c.style.setProperty('--d',Math.random());
      c.style.animationDelay=(-Math.random())+'s';
      host.appendChild(c);
    }
  }
  candles($('#candlesHero'),22);
  $$('[data-candles]').forEach(b=>candles(b,24));

  /* ---------- rose garland around the arch ---------- */
  const NS='http://www.w3.org/2000/svg';
  function rose(g,x,y,r,hue){
    const grp=document.createElementNS(NS,'g');grp.setAttribute('class','rz');grp.style.setProperty('--i',window.__ri=(window.__ri||0)+1);
    const cols=['#7d0d12','#a3171c','#c42b2b','#8a1015','#d9473a'];
    const base=cols[hue%cols.length];
    const mk=(t,a)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);grp.appendChild(e);return e};
    mk('circle',{cx:x,cy:y,r:r,fill:base});
    mk('circle',{cx:x,cy:y,r:r*.78,fill:'none',stroke:'rgba(0,0,0,.28)','stroke-width':r*.12});
    mk('path',{d:`M${x-r*.55} ${y} a${r*.55} ${r*.55} 0 1 1 ${r*1.1} 0 a${r*.3} ${r*.3} 0 1 1 ${-r*.6} 0`,fill:'none',stroke:'rgba(255,200,180,.55)','stroke-width':r*.1});
    mk('circle',{cx:x,cy:y,r:r*.22,fill:'rgba(30,0,0,.45)'});
    g.appendChild(grp);
  }
  function buildGarland(){
    const svg=$('#garland'), hero=$('#hero'), arch=$('#arch');
    const W=hero.clientWidth,H=hero.clientHeight;
    svg.setAttribute('viewBox',`0 0 ${W} ${H}`); svg.innerHTML='';window.__ri=0;
    const a=arch.getBoundingClientRect(), h=hero.getBoundingClientRect();
    const L=a.left-h.left, R=a.right-h.left, T=a.top-h.top, B=a.bottom-h.top;
    const cx=(L+R)/2, rx=(R-L)/2, ry=(B-T)*.22, topY=T+ry;
    let seed=7; const rnd=()=> (seed=(seed*9301+49297)%233280)/233280;
    const g=document.createElementNS(NS,'g'); svg.appendChild(g);
    // leaves/blooms backing
    const pts=[];
    for(let y=B;y>topY;y-=11) {pts.push([L,y]);pts.push([R,y]);}
    for(let t=Math.PI;t<=2*Math.PI+.001;t+=.07){pts.push([cx+rx*Math.cos(t),topY+ry*Math.sin(t)]);}
    pts.forEach(([x,y],i)=>{
      const r=7+rnd()*8, jx=(rnd()-.5)*16, jy=(rnd()-.5)*10;
      const dark=document.createElementNS(NS,'circle');
      dark.setAttribute('cx',x+jx);dark.setAttribute('cy',y+jy);dark.setAttribute('r',r+3);
      dark.setAttribute('fill','#4c1a0f');dark.setAttribute('opacity','.55');g.appendChild(dark);
    });
    pts.forEach(([x,y],i)=>{
      const r=6+rnd()*9;
      rose(g,x+(rnd()-.5)*18,y+(rnd()-.5)*12,r,Math.floor(rnd()*5));
      if(rnd()<.35){const f=document.createElementNS(NS,'circle');
        f.setAttribute('cx',x+(rnd()-.5)*24);f.setAttribute('cy',y+(rnd()-.5)*14);
        f.setAttribute('r',2.5+rnd()*2.5);f.setAttribute('fill',rnd()<.5?'#e5a73a':'#f1c75e');g.appendChild(f);}
    });
    // hanging strands from the apex
    for(let i=-1;i<=1;i+=2){
      for(let k=0;k<6;k++){
        rose(g,cx+i*(rx*.18+k*2),topY-ry+10+k*12,5-k*.4,k);
      }
    }
  }
  buildGarland(); addEventListener('resize',()=>{buildGarland();sizePetals()});

  /* ---------- particles: petals + gold dust + sparkles ---------- */
  const cv=$('#petals'), ctx=cv.getContext('2d'); let petals=[],sparks=[],dust=[],petalsOn=false;
  function sizePetals(){const d=Math.min(devicePixelRatio||1,2);cv.width=innerWidth*d;cv.height=innerHeight*d;ctx.setTransform(d,0,0,d,0,0)}
  sizePetals();
  const P=()=>({x:Math.random()*innerWidth,y:-20-Math.random()*innerHeight,s:7+Math.random()*12,
    vy:.5+Math.random()*1.1,vx:(Math.random()-.5)*.6,r:Math.random()*6.28,vr:(Math.random()-.5)*.05,
    ph:Math.random()*6.28,c:['#b3141b','#c9222b','#8f0e14','#d4424a','#e07a80'][Math.random()*5|0]});
  const D=()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:.8+Math.random()*2.2,vy:-.15-Math.random()*.4,
    ph:Math.random()*6.28,sp:.02+Math.random()*.05});
  dust=Array.from({length:38},D);
  function burst(x,y,n,spd=6){for(let i=0;i<n;i++){const a=Math.random()*6.28,v=Math.random()*spd+1;
    sparks.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-1,life:1,dec:.008+Math.random()*.02,r:1+Math.random()*2.6,g:.06})}}
  function star(x,y,r,a){ctx.globalAlpha=a;ctx.beginPath();
    for(let i=0;i<8;i++){const rr=i%2?r*.3:r,t=i*Math.PI/4;ctx.lineTo(x+Math.cos(t)*rr,y+Math.sin(t)*rr)}ctx.closePath();ctx.fill()}
  function loop(){
    ctx.clearRect(0,0,innerWidth,innerHeight);
    if(petalsOn)for(const p of petals){
      p.ph+=.03;p.x+=p.vx+Math.sin(p.ph)*.8+wind;p.y+=p.vy;p.r+=p.vr;
      if(p.y>innerHeight+20||p.x>innerWidth+30||p.x<-30){Object.assign(p,P(),{y:-20})}
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.r);ctx.scale(1,.55+.45*Math.abs(Math.sin(p.ph)));
      ctx.fillStyle=p.c;ctx.globalAlpha=.95;ctx.beginPath();
      ctx.moveTo(0,-p.s);ctx.bezierCurveTo(p.s*.9,-p.s*.6,p.s*.8,p.s*.7,0,p.s);
      ctx.bezierCurveTo(-p.s*.8,p.s*.7,-p.s*.9,-p.s*.6,0,-p.s);ctx.fill();
      ctx.restore();
    }
    wind*=.96;
    ctx.fillStyle='#ffd978';
    if(petalsOn)for(const d of dust){d.ph+=d.sp;d.y+=d.vy;d.x+=Math.sin(d.ph)*.3;if(d.y<-10){d.y=innerHeight+10;d.x=Math.random()*innerWidth}
      ctx.shadowColor='#ffcf5a';ctx.shadowBlur=10;star(d.x,d.y,d.r*2.2,.35+.55*Math.abs(Math.sin(d.ph*2)))}
    for(let i=sparks.length-1;i>=0;i--){const s=sparks[i];s.x+=s.vx;s.y+=s.vy;s.vy+=s.g;s.vx*=.985;s.life-=s.dec;
      if(s.life<=0){sparks.splice(i,1);continue}
      ctx.shadowColor='#ffcf5a';ctx.shadowBlur=12;star(s.x,s.y,s.r*2.4,s.life)}
    ctx.shadowBlur=0;ctx.globalAlpha=1;
    requestAnimationFrame(loop);
  }
  let wind=0; loop();
  function startPetals(){petals=Array.from({length:innerWidth<600?24:38},P);petalsOn=true}

  /* sparkle trail on touch / mouse, wind gust on move */
  let lx=0;
  const trail=(x,y)=>{burst(x,y,2,1.8);wind+=Math.max(-.6,Math.min(.6,(x-lx)*.02));lx=x};
  addEventListener('pointermove',e=>trail(e.clientX,e.clientY),{passive:true});
  addEventListener('touchmove',e=>{const t=e.touches[0];trail(t.clientX,t.clientY)},{passive:true});
  addEventListener('pointerdown',e=>burst(e.clientX,e.clientY,26,4.5),{passive:true});

  /* ---------- intro / replay ---------- */
  function play(){
    window.scrollTo(0,0);
    body.classList.add('locked');body.classList.remove('shown');
    curtain.classList.remove('open');void curtain.offsetWidth;
    petalsOn=false;sparks.length=0;
    setTimeout(()=>{curtain.classList.add('open');
      let n=0;const iv=setInterval(()=>{burst(innerWidth/2+(Math.random()-.5)*innerWidth*.8,innerHeight*(.2+Math.random()*.5),22,5);if(++n>9)clearInterval(iv)},260);
      setTimeout(()=>body.classList.add('shown'),1300)},1400);
    setTimeout(()=>{body.classList.remove('locked');startPetals();burst(innerWidth/2,innerHeight*.4,90,9)},4600);
  }
  $('#replay').onclick=play; play();

  /* ---------- scroll: progress + parallax ---------- */
  const prog=$('#progress'),hero=$('#hero');let tk=false;
  function onScroll(){
    if(tk)return;tk=true;requestAnimationFrame(()=>{
      const y=scrollY,max=document.documentElement.scrollHeight-innerHeight;
      prog.style.transform=`scaleX(${max>0?y/max:0})`;
      if(y<innerHeight*1.2)hero.style.setProperty('--sy',y);
      wind+=0;tk=false})}
  addEventListener('scroll',onScroll,{passive:true});

  /* ---------- scroll reveal ---------- */
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.15});
  $$('.card').forEach(c=>[...c.children].forEach((el,i)=>el.style.setProperty('--k',i)));
  $$('.reveal').forEach(el=>io.observe(el));
  /* count-up for the big date */
  new IntersectionObserver((es,o)=>es.forEach(e=>{if(e.isIntersecting){o.unobserve(e.target);let n=0;const t=e.target;
    const iv=setInterval(()=>{n++;t.textContent=n;if(n>=23)clearInterval(iv)},55)}}),{threshold:.6}).observe($('.bigday'));

  /* ---------- scroll button ---------- */
  $('#btnDown').onclick=()=>scrollBy({top:innerHeight*.85,behavior:'smooth'});
  $('#btnLang').onclick=()=>{const d=document.documentElement;d.lang=d.lang==='en'?'ur':'en'};

  /* ---------- countdown (23 Nov 2026, 7pm IST) ---------- */
  const target=new Date('2026-11-23T19:00:00+05:30').getTime();
  const pad=n=>String(n).padStart(2,'0');
  function set(id,v){const e=$(id);v=String(v);if(e.textContent!==v){e.textContent=v;e.classList.remove('flip');void e.offsetWidth;e.classList.add('flip')}}
  function tick(){
    let d=Math.max(0,target-Date.now())/1000;
    set('#cd',Math.floor(d/86400));set('#ch',pad(Math.floor(d%86400/3600)));
    set('#cm',pad(Math.floor(d%3600/60)));set('#cs',pad(Math.floor(d%60)));
  }
  tick();setInterval(tick,1000);

  /* ---------- add to calendar (.ics) ---------- */
  $('#addCal').onclick=e=>{
    e.preventDefault();
    const ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Nikah Invite//EN','BEGIN:VEVENT',
      'UID:nikah-saba-faizan@invite','DTSTAMP:20261117T000000Z',
      'DTSTART:20261123T133000Z','DTEND:20261123T173000Z',
      'SUMMARY:Nikah of Saba & Faizan','LOCATION:Sona Lawn\\, Near Amar Talkies\\, Arabian Darbar lane\\, Chembur(E)\\, Mumbai-400088',
      'DESCRIPTION:Your presence and prayers are requested.','END:VEVENT','END:VCALENDAR'].join('\r\n');
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([ics],{type:'text/calendar'}));
    a.download='nikah-saba-faizan.ics';a.click();
  };

  /* ---------- gentle generated ambient music ---------- */
  let ac,master,on=false;
  function startMusic(){
    ac=ac||new (window.AudioContext||window.webkitAudioContext)();
    master=ac.createGain();master.gain.value=0;master.connect(ac.destination);
    [196,246.9,293.7,392,493.9].forEach((f,i)=>{
      const o=ac.createOscillator(),g=ac.createGain(),l=ac.createOscillator(),lg=ac.createGain();
      o.type='sine';o.frequency.value=f;g.gain.value=.05/(1+i*.3);
      l.frequency.value=.1+i*.07;lg.gain.value=.02;l.connect(lg);lg.connect(g.gain);
      o.connect(g);g.connect(master);o.start();l.start();
    });
    master.gain.linearRampToValueAtTime(.8,ac.currentTime+2);
  }
  $('#btnMusic').onclick=function(){
    on=!on;this.classList.toggle('on',on);
    if(on){ac&&ac.state==='suspended'?ac.resume():(!master&&startMusic());master&&master.gain.linearRampToValueAtTime(.8,ac.currentTime+1)}
    else master&&master.gain.linearRampToValueAtTime(0,ac.currentTime+.6);
  };
})();
