const W=800,H=600,SAVE='startup-run-bogota-lite-v1';
const CABINET_KEYS={
  P1_U:['w'],P1_D:['s'],P1_L:['a'],P1_R:['d'],P1_1:['u'],P1_2:['i'],P1_3:['o'],P1_4:['j'],P1_5:['k'],P1_6:['l'],
  P2_U:['ArrowUp'],P2_D:['ArrowDown'],P2_L:['ArrowLeft'],P2_R:['ArrowRight'],P2_1:['r'],P2_2:['t'],P2_3:['y'],P2_4:['f'],P2_5:['g'],P2_6:['h'],START1:['Enter'],START2:['2'],
};
const K={};for(const [c,a]of Object.entries(CABINET_KEYS))for(const k of a)K[norm(k)]=c;
new Phaser.Game({type:Phaser.AUTO,width:W,height:H,parent:'game-root',backgroundColor:'#8ed8ef',physics:{default:'arcade',arcade:{gravity:{y:1100},debug:false}},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:{create,update}});

function norm(k){return typeof k==='string'?(k===' '?'space':k.toLowerCase()):''}
function newRun(){return {score:0,best:0,speed:220,time:0,spawn:720,step:0}}
function nextSpawn(n){return ['barrier','pothole','bug','bus'][n%4]}
function nextDelay(speed,r){return Math.max(390,speed*1.45)+r*130}
function validScore(v){return Number.isFinite(v)&&v>=0&&v<1e9}
function store(){return window.platanusArcadeStorage||{async get(k){try{const v=localStorage.getItem(k);return {found:v!==null,value:v===null?null:JSON.parse(v)}}catch(_){return {found:false,value:null}}},async set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}}}}
function tone(s,f,d=.08){try{const c=s.sound.context||new AudioContext(),o=c.createOscillator(),g=c.createGain(),t=c.currentTime;o.frequency.value=f;o.type='square';g.gain.setValueAtTime(.07,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+d)}catch(_){}}
function create(){
  const s=this;s.phase='title';s.keys={held:{},pressed:{}};s.run=newRun();s.items=[];s.shots=[];s.deco=[];s.best=0;
  window.addEventListener('keydown',s.down=e=>{const c=K[norm(e.key)];if(c){if(!s.keys.held[c])s.keys.pressed[c]=1;s.keys.held[c]=1}});
  window.addEventListener('keyup',s.up=e=>{const c=K[norm(e.key)];if(c)s.keys.held[c]=0});
  s.events.once('shutdown',()=>{window.removeEventListener('keydown',s.down);window.removeEventListener('keyup',s.up)});
  drawCity(s);buildArt(s);makeUi(s);makePlayers(s);
  store().get(SAVE).then(r=>{if(r.found&&validScore(r.value))s.best=r.value;refresh(s)}).catch(()=>{});
  refresh(s);
}
function drawCity(s){
  s.add.rectangle(400,300,800,600,0x8ed8ef);s.add.circle(690,92,42,0xffe58a);
  const hills=s.add.graphics();hills.fillStyle(0x9dcca8).fillTriangle(0,480,135,245,315,480).fillTriangle(205,480,390,285,565,480).fillTriangle(435,480,625,225,800,480);hills.fillStyle(0xb0dab1).fillTriangle(0,480,70,335,180,480).fillTriangle(520,480,710,305,800,480);
  for(let i=0;i<10;i++){const x=42+i*86,h=68+(i%4)*25;s.add.rectangle(x,510-h/2,76,h,0x9ac9d8);for(let y=0;y<3;y++)for(let j=0;j<3;j++)s.add.rectangle(x-22+j*22,526-h+y*18,9,11,0xccecf3)}
  s.add.rectangle(400,556,800,88,0x33434a);s.add.rectangle(400,514,800,7,0xf1bf58);s.ground=s.add.rectangle(400,566,800,68,0x29343a);s.physics.add.existing(s.ground,true);
  for(let x=70;x<800;x+=170)s.add.rectangle(x,572,85,5,0xe9eef0,.55);
  s.add.text(18,18,'STARTUP RUN: BOGOTÁ',{fontFamily:'monospace',fontStyle:'bold',fontSize:'22px',color:'#16313d'});
}
function texture(s,k,w,h,draw){const g=s.make.graphics({add:false});draw(g);g.generateTexture(k,w,h);g.destroy()}
function buildArt(s){
  for(let i=0;i<3;i++){texture(s,`p1${i}`,48,64,g=>drawRunner(g,0xdfff3f,0,i));texture(s,`p2${i}`,48,64,g=>drawRunner(g,0xf04d9b,1,i))}
  for(const [k,w,h]of [['barrier',58,48],['pothole',72,18],['bug',54,40],['bus',112,48]])texture(s,k,w,h,g=>drawObstacle(g,k));
  texture(s,'banana',24,14,g=>{g.fillStyle(0x59391f).fillRect(2,4,4,5).fillRect(18,7,4,4);g.fillStyle(0xffdc35).fillRect(5,5,14,7).fillRect(8,2,10,5);g.fillStyle(0xfff39a).fillRect(9,3,7,2)});
}
function drawRunner(g,shirt,girl,pose){
  const dark=0x142d38,skin=girl?0xb96948:0xc8794e,hair=girl?0x51261f:0x172631,shoe=girl?0xffffff:0xeff4ea;
  g.fillStyle(dark);
  if(pose===2){g.fillRect(12,45,10,14).fillRect(30,45,10,14).fillRect(7,27,9,19).fillRect(36,27,9,19)}
  else if(pose){g.fillRect(11,47,11,13).fillRect(29,44,10,17).fillRect(5,31,12,9).fillRect(35,24,9,18)}
  else{g.fillRect(14,44,10,17).fillRect(30,48,11,12).fillRect(7,24,9,18).fillRect(35,31,10,9)}
  g.fillStyle(shoe);if(pose===2)g.fillRect(9,57,13,6).fillRect(30,57,13,6);else if(pose)g.fillRect(7,57,15,6).fillRect(29,58,14,5);else g.fillRect(11,58,14,5).fillRect(30,56,14,6);
  g.fillStyle(dark).fillRect(12,23,26,28);g.fillStyle(shirt).fillRect(15,26,20,22).fillRect(9,27,8,10).fillRect(34,27,8,10);
  g.fillStyle(0xffffff).fillRect(23,29,4,12);g.fillStyle(dark).fillRect(23,36,4,4);
  g.fillStyle(dark).fillRect(11,5,28,22);if(girl)g.fillRect(36,8,10,8).fillRect(40,14,7,13);else g.fillRect(8,6,8,9).fillRect(15,2,8,8).fillRect(25,1,9,8).fillRect(34,5,8,9);
  g.fillStyle(skin).fillRect(14,9,22,16);g.fillStyle(hair).fillRect(14,7,22,6).fillRect(14,11,5,7);if(girl)g.fillRect(31,9,5,8);else g.fillRect(28,8,8,5);
  g.fillStyle(dark).fillRect(21,15,3,3).fillRect(30,15,3,3);g.fillStyle(0xffffff).fillRect(23,21,8,2);
  g.fillStyle(skin);if(pose===2)g.fillRect(8,21,7,9).fillRect(37,21,7,9);else if(pose)g.fillRect(4,36,8,7).fillRect(40,19,7,8);else g.fillRect(7,19,7,8).fillRect(40,36,7,7);
}
function drawObstacle(g,k){
  const dark=0x142d38;
  if(k==='barrier'){g.fillStyle(dark).fillRect(3,8,52,29).fillRect(8,35,8,13).fillRect(42,35,8,13);g.fillStyle(0xf26942).fillRect(6,11,46,23);g.fillStyle(0xfff4d2).fillRect(10,11,9,23).fillRect(28,11,9,23).fillRect(46,11,6,23);g.fillStyle(0xffcf3a).fillRect(8,2,9,9).fillRect(41,2,9,9)}
  else if(k==='pothole'){g.fillStyle(0x142d38).fillRect(5,6,62,9).fillRect(14,3,44,12);g.fillStyle(0x090f14).fillRect(15,7,43,8);g.fillStyle(0x53636a).fillRect(6,3,10,5).fillRect(55,2,10,5)}
  else if(k==='bug'){g.fillStyle(dark).fillRect(10,8,34,25).fillRect(3,15,10,7).fillRect(41,15,10,7).fillRect(11,2,7,9).fillRect(36,2,7,9).fillRect(6,31,12,7).fillRect(36,31,12,7);g.fillStyle(0x64d75d).fillRect(14,11,26,18);g.fillStyle(0xbaff79).fillRect(18,14,7,6).fillRect(30,14,7,6);g.fillStyle(0xef4b6c).fillRect(25,24,6,3)}
  else{g.fillStyle(dark).fillRect(2,3,108,39).fillRect(14,39,20,9).fillRect(78,39,20,9);g.fillStyle(0xdc3e32).fillRect(5,6,102,33);g.fillStyle(0x183b52).fillRect(12,10,18,15).fillRect(34,10,18,15).fillRect(56,10,18,15).fillRect(78,10,22,15);g.fillStyle(0xaee7f5).fillRect(15,12,12,5).fillRect(37,12,12,5).fillRect(59,12,12,5).fillRect(81,12,16,5);g.fillStyle(0xf6c943).fillRect(5,29,102,5);g.fillStyle(0x293238).fillRect(17,40,14,6).fillRect(81,40,14,6);g.fillStyle(0xffffff).fillRect(9,28,17,3)}
}
function makeUi(s){
  const t={fontFamily:'monospace',fontStyle:'bold',align:'center'};
  s.hud=s.add.text(400,48,'',{...t,fontSize:'18px',color:'#16313d'}).setOrigin(.5);
  s.msg=s.add.text(400,220,'',{...t,fontSize:'34px',color:'#fff8d4',stroke:'#16313d',strokeThickness:6}).setOrigin(.5);
  s.help=s.add.text(400,285,'',{...t,fontSize:'15px',color:'#16313d',lineSpacing:8}).setOrigin(.5);
  s.flash=s.add.text(400,86,'',{...t,fontSize:'16px',color:'#fff8d4',stroke:'#16313d',strokeThickness:4}).setOrigin(.5);
}
function makePlayers(s){
  s.players=[player(s,290,'p1','P1'),player(s,465,'p2','P2')];
}
function player(s,x,key,label){
  const p=s.physics.add.image(x,500,`${key}0`);p.body.setCollideWorldBounds(true).setSize(26,48).setOffset(11,16);p.hp=2;p.label=label;p.frames=[`${key}0`,`${key}1`,`${key}2`];p.inv=0;p.live=true;s.physics.add.collider(p,s.ground);return p;
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
  s.run=newRun();for(const p of s.players){p.hp=2;p.live=true;p.inv=0;p.setVisible(true);p.body.enable=true;p.setPosition(p.label==='P1'?290:465,500);p.body.setVelocity(0)}s.phase='play';s.msg.setText('');s.help.setText('');s.flash.setText('3 · 2 · 1 · ¡CORRE!');s.time.delayedCall(1100,()=>{if(s.phase==='play')s.flash.setText('')});refresh(s);tone(s,550,.12);
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
  s.players.forEach((p,i)=>{if(!p.live)return;if(p.inv>0){p.inv-=dt;p.alpha=Math.floor(p.inv*18)%2?.35:1}else p.alpha=1;const jump=i?'P2_1':'P1_1',fire=i?'P2_2':'P1_2';p.setTexture(p.body.blocked.down?p.frames[(Math.floor(s.run.time*8)+i)%2]:p.frames[2]);if(pressed(s,jump)&&p.body.blocked.down){p.body.setVelocityY(-510);tone(s,420)}if(pressed(s,fire))shoot(s,p)});
  for(const b of s.deco){b.x-=s.run.speed*dt*.16;if(b.x<-60)b.x+=950}refresh(s);clear(s);
}
function clear(s){s.keys.pressed={}}
function spawn(s,k){
  const y=k==='pothole'?523:k==='bug'?512:508,o=s.physics.add.image(845,y,k);o.kind=k;o.body.allowGravity=false;if(k==='pothole')o.body.setSize(62,10).setOffset(5,7);if(k==='bug')o.body.setSize(48,34).setOffset(3,3);if(k==='bus')o.body.setSize(106,40).setOffset(3,4);s.items.push(o);
}
function hit(s,p,o){
  if(p.inv>0)return;p.hp--;p.inv=1.1;tone(s,120,.2);s.flash.setText(`${p.label} HIT!`);s.time.delayedCall(350,()=>{if(s.phase==='play')s.flash.setText('')});if(!p.hp){p.live=false;p.setVisible(false);p.body.enable=false}if(!s.players.some(x=>x.live))finish(s);refresh(s);
}
function shoot(s,p){const q=s.physics.add.image(p.x+28,p.y,'banana');q.body.allowGravity=false;q.body.setSize(20,10).setOffset(2,2);s.shots.push(q);tone(s,650,.05)}
function finish(s){s.phase='end';s.physics.pause();s.best=Math.max(s.best,s.run.score);store().set(SAVE,s.best);refresh(s);tone(s,90,.35)}
