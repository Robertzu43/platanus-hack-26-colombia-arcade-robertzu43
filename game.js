const W=800,H=600,SAVE='startup-run-bogota-lite-v1';
const CABINET_KEYS={
  P1_U:['w'],P1_D:['s'],P1_L:['a'],P1_R:['d'],P1_1:['u'],P1_2:['i'],P1_3:['o'],P1_4:['j'],P1_5:['k'],P1_6:['l'],
  P2_U:['ArrowUp'],P2_D:['ArrowDown'],P2_L:['ArrowLeft'],P2_R:['ArrowRight'],P2_1:['r'],P2_2:['t'],P2_3:['y'],P2_4:['f'],P2_5:['g'],P2_6:['h'],START1:['Enter'],START2:['2'],
};
const K={};for(const [c,a]of Object.entries(CABINET_KEYS))for(const k of a)K[norm(k)]=c;
new Phaser.Game({type:Phaser.AUTO,width:W,height:H,parent:'game-root',backgroundColor:'#8ed8ef',physics:{default:'arcade',arcade:{gravity:{y:1100},debug:false}},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:{create,update}});

function norm(k){return typeof k==='string'?(k===' '?'space':k.toLowerCase()):''}
function newRun(){return {score:0,best:0,speed:220,time:0,spawn:720,step:0}}
function nextSpawn(n){return ['token','barrier','bug','gap'][n%4]}
function nextDelay(speed,r){return Math.max(390,speed*1.45)+r*130}
function validScore(v){return Number.isFinite(v)&&v>=0&&v<1e9}
function store(){return window.platanusArcadeStorage||{async get(k){try{const v=localStorage.getItem(k);return {found:v!==null,value:v===null?null:JSON.parse(v)}}catch(_){return {found:false,value:null}}},async set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}}}}
function tone(s,f,d=.08){try{const c=s.sound.context||new AudioContext(),o=c.createOscillator(),g=c.createGain(),t=c.currentTime;o.frequency.value=f;o.type='square';g.gain.setValueAtTime(.07,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+d)}catch(_){}}
function create(){
  const s=this;s.phase='title';s.keys={held:{},pressed:{}};s.run=newRun();s.items=[];s.shots=[];s.deco=[];s.best=0;
  window.addEventListener('keydown',s.down=e=>{const c=K[norm(e.key)];if(c){if(!s.keys.held[c])s.keys.pressed[c]=1;s.keys.held[c]=1}});
  window.addEventListener('keyup',s.up=e=>{const c=K[norm(e.key)];if(c)s.keys.held[c]=0});
  s.events.once('shutdown',()=>{window.removeEventListener('keydown',s.down);window.removeEventListener('keyup',s.up)});
  drawCity(s);makeUi(s);makePlayers(s);
  store().get(SAVE).then(r=>{if(r.found&&validScore(r.value))s.best=r.value;refresh(s)}).catch(()=>{});
  refresh(s);
}
function drawCity(s){
  s.add.rectangle(400,300,800,600,0x8ed8ef);s.add.circle(690,92,42,0xffe58a);
  s.add.rectangle(400,330,800,150,0x6ea885);s.add.rectangle(400,360,800,90,0x4e8668);
  for(let i=0;i<9;i++){const x=i*105+40,h=70+(i%4)*36,b=s.add.rectangle(x,470-h/2,92,h,0x61717b);s.deco.push(b);for(let j=0;j<3;j++)s.add.rectangle(x-25+j*25,450-h+20,13,17,0xb9e6f5)}
  s.add.rectangle(110,349,86,12,0xf7f3dc);s.add.rectangle(110,337,8,30,0xf7f3dc);s.add.rectangle(110,323,4,20,0xf7f3dc);
  for(let i=0;i<5;i++){const x=100+i*190,d=s.add.rectangle(x,484,88,8,0xdc4838);s.deco.push(d)}
  s.add.rectangle(400,548,800,104,0x33434a);s.add.rectangle(400,506,800,6,0xd8b35d);s.ground=s.add.rectangle(400,566,800,68,0x29343a);s.physics.add.existing(s.ground,true);
  s.add.rectangle(400,570,800,4,0x20292e);s.add.text(18,18,'STARTUP RUN: BOGOTÁ',{fontFamily:'monospace',fontStyle:'bold',fontSize:'22px',color:'#16313d'});
}
function makeUi(s){
  const t={fontFamily:'monospace',fontStyle:'bold',align:'center'};
  s.hud=s.add.text(400,48,'',{...t,fontSize:'18px',color:'#16313d'}).setOrigin(.5);
  s.msg=s.add.text(400,220,'',{...t,fontSize:'34px',color:'#fff8d4',stroke:'#16313d',strokeThickness:6}).setOrigin(.5);
  s.help=s.add.text(400,285,'',{...t,fontSize:'15px',color:'#16313d',lineSpacing:8}).setOrigin(.5);
  s.flash=s.add.text(400,86,'',{...t,fontSize:'16px',color:'#fff8d4',stroke:'#16313d',strokeThickness:4}).setOrigin(.5);
}
function makePlayers(s){
  s.players=[player(s,290,0xe9ff41,'P1'),player(s,465,0xff70bb,'P2')];
}
function player(s,x,c,label){
  const p=s.add.rectangle(x,480,30,46,c).setStrokeStyle(4,0x18303a);s.physics.add.existing(p);p.body.setCollideWorldBounds(true);p.body.setSize(24,40);p.hp=2;p.label=label;p.inv=0;p.live=true;s.physics.add.collider(p,s.ground);return p;
}
function refresh(s){
  const h=s.players.map(p=>`${p.label} ${p.live?'♥'.repeat(p.hp):'OUT'}`).join('   ');
  s.hud.setText(s.phase==='play'?`${h}\nTEAM ${Math.floor(s.run.score)}  BEST ${Math.floor(s.best)}`:`BEST TEAM RUN  ${Math.floor(s.best)}`);
  if(s.phase==='title'){s.msg.setText('STARTUP RUN');s.help.setText('BOGOTÁ CO-OP DASH\nP1: U JUMP · I BANANA\nP2: R JUMP · T BANANA\nPRESS START TO RUN');}
  if(s.phase==='pause'){s.msg.setText('PAUSED');s.help.setText('PRESS START TO RESUME');}
  if(s.phase==='end'){s.msg.setText(`RUN OVER  ${Math.floor(s.run.score)}`);s.help.setText('PRESS START TO RUN AGAIN');}
}
function begin(s){
  s.physics.resume();
  for(const a of [s.items,s.shots])while(a.length)a.pop().destroy();
  s.run=newRun();for(const p of s.players){p.hp=2;p.live=true;p.inv=0;p.setVisible(true);p.body.enable=true;p.setPosition(p.label==='P1'?290:465,480);p.body.setVelocity(0)}s.phase='play';s.msg.setText('');s.help.setText('');s.flash.setText('3 · 2 · 1 · ¡CORRE!');s.time.delayedCall(1100,()=>{if(s.phase==='play')s.flash.setText('')});refresh(s);tone(s,550,.12);
}
function pressed(s,...a){for(const k of a)if(s.keys.pressed[k]){delete s.keys.pressed[k];return true}return false}
function update(_,d){
  const s=this,dt=Math.min(d,50)/1000;
  if(s.phase==='title'||s.phase==='end'){if(pressed(s,'START1','START2','P1_1','P2_1'))begin(s);clear(s);return}
  if(s.phase==='pause'){if(pressed(s,'START1','START2')){s.phase='play';s.physics.resume();s.msg.setText('');s.help.setText('');refresh(s)}clear(s);return}
  if(s.phase!=='play')return;
  if(pressed(s,'START1','START2')){s.phase='pause';s.physics.pause();refresh(s);clear(s);return}
  s.run.time+=dt;s.run.score+=s.run.speed*dt/8;s.run.speed=Math.min(390,220+s.run.time*3);s.run.spawn-=s.run.speed*dt;
  if(s.run.spawn<=0){spawn(s,nextSpawn(s.run.step++));s.run.spawn=nextDelay(s.run.speed,Math.random())}
  for(let i=s.items.length-1;i>=0;i--){const o=s.items[i];o.x-=s.run.speed*dt;if(o.x<-60){o.destroy();s.items.splice(i,1);continue}for(const p of s.players)if(p.live&&s.physics.overlap(p,o))hit(s,p,o)}
  for(let i=s.shots.length-1;i>=0;i--){const q=s.shots[i];q.x+=530*dt;if(q.x>850){q.destroy();s.shots.splice(i,1);continue}for(let j=s.items.length-1;j>=0;j--){const o=s.items[j];if(o.kind==='bug'&&s.physics.overlap(q,o)){s.run.score+=100;tone(s,900);q.destroy();o.destroy();s.shots.splice(i,1);s.items.splice(j,1);break}}}
  s.players.forEach((p,i)=>{if(!p.live)return;if(p.inv>0){p.inv-=dt;p.alpha=Math.floor(p.inv*18)%2?.35:1}else p.alpha=1;const jump=i?'P2_1':'P1_1',fire=i?'P2_2':'P1_2';if(pressed(s,jump)&&p.body.blocked.down){p.body.setVelocityY(-510);tone(s,420)}if(pressed(s,fire))shoot(s,p)});
  for(const b of s.deco){b.x-=s.run.speed*dt*.16;if(b.x<-60)b.x+=950}refresh(s);clear(s);
}
function clear(s){s.keys.pressed={}}
function spawn(s,k){
  const y=k==='token'?410:480,c=k==='token'?0xffd84d:k==='bug'?0x70d65c:k==='gap'?0x152126:0xf06a4b,w=k==='gap'?75:k==='barrier'?38:30,h=k==='token'?22:k==='bug'?25:45,o=s.add.rectangle(845,y,w,h,c).setStrokeStyle(3,0x18303a);o.kind=k;s.physics.add.existing(o);o.body.allowGravity=false;s.items.push(o);
}
function hit(s,p,o){
  if(o.kind==='token'){s.run.score+=25;tone(s,760,.05);o.destroy();s.items.splice(s.items.indexOf(o),1);return}
  if(p.inv>0)return;p.hp--;p.inv=1.1;tone(s,120,.2);s.flash.setText(`${p.label} HIT!`);s.time.delayedCall(350,()=>{if(s.phase==='play')s.flash.setText('')});if(!p.hp){p.live=false;p.setVisible(false);p.body.enable=false}if(!s.players.some(x=>x.live))finish(s);refresh(s);
}
function shoot(s,p){const q=s.add.rectangle(p.x+22,p.y,18,8,0xffe45c).setStrokeStyle(2,0x71452b);s.physics.add.existing(q);q.body.allowGravity=false;s.shots.push(q);tone(s,650,.05)}
function finish(s){s.phase='end';s.physics.pause();s.best=Math.max(s.best,s.run.score);store().set(SAVE,s.best);refresh(s);tone(s,90,.35)}
