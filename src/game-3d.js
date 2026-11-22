import * as THREE from '../vendor/three.module.js';

const $=id=>document.getElementById(id);
const scene=new THREE.Scene();scene.background=new THREE.Color('#123a37');scene.fog=new THREE.Fog('#123a37',38,75);
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas:$('world'),antialias:false});}catch{$('overlay').innerHTML='<h1>OH, PEEL.</h1><p>This game needs a browser with WebGL enabled.</p>';throw new Error('WebGL unavailable');}
renderer.setPixelRatio(1);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.BasicShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;
const camera=new THREE.PerspectiveCamera(42,innerWidth/innerHeight,.1,120);
scene.add(new THREE.HemisphereLight(0xfff4cb,0x274e47,2.6));
const sun=new THREE.DirectionalLight(0xffedb2,3);sun.position.set(-12,23,9);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-30,right:30,top:30,bottom:-30});scene.add(sun);
const ramp=new THREE.DataTexture(new Uint8Array([85,170,255]),3,1,THREE.RedFormat);
ramp.minFilter=ramp.magFilter=THREE.NearestFilter;ramp.needsUpdate=true;
const mat=c=>new THREE.MeshToonMaterial({color:c,gradientMap:ramp});
const palette={yellow:mat('#ffda32'),tip:mat('#51432a'),green:mat('#66aa61'),dark:mat('#193e37'),red:mat('#f16453'),purple:mat('#a583ce'),white:mat('#fff4d2')};
function mesh(geo,material,parent=scene,x=0,y=0,z=0){const m=new THREE.Mesh(geo,material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
const box=(w,h,d,m,p,x,y,z)=>mesh(new THREE.BoxGeometry(w,h,d),m,p,x,y,z);
const sphere=(r,m,p,x,y,z)=>mesh(new THREE.SphereGeometry(r,8,4),m,p,x,y,z);
const floor=box(43,.6,36,mat('#3e7155'),scene,0,-.5,0);
// A repeatable pixel tile, generated locally with a fixed seed.
const tile=document.createElement('canvas');tile.width=tile.height=32;
const pixels=tile.getContext('2d');pixels.fillStyle='#47704b';pixels.fillRect(0,0,32,32);
let seed=73;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
for(let i=0;i<55;i++){pixels.fillStyle=['#527e50','#3d6446','#608651'][i%3];pixels.fillRect(Math.floor(random()*32),Math.floor(random()*32),i%4===0?2:1,1);}
const grass=new THREE.CanvasTexture(tile);grass.magFilter=grass.minFilter=THREE.NearestFilter;grass.wrapS=grass.wrapT=THREE.RepeatWrapping;grass.repeat.set(12,10);grass.colorSpace=THREE.SRGBColorSpace;
floor.material.map=grass;floor.material.color.set('#ffffff');
const edge=mat('#254e3e');box(44,1.2,.6,edge,scene,0,0,-18);box(44,1.2,.6,edge,scene,0,0,18);box(.6,1.2,36,edge,scene,-22,0,0);box(.6,1.2,36,edge,scene,22,0,0);
// Stepped banana silhouette reads clearly in the low-resolution framebuffer.
function banana(parent,scale=1){const g=new THREE.Group();parent.add(g);for(const [x,y] of [[-.6,0],[-.4,.2],[-.2,.3],[0,.3],[.2,.3],[.4,.2],[.6,0]])box(.25,.25,.25,palette.yellow,g,x,y,0);box(.15,.18,.18,palette.tip,g,-.72,-.12,0);box(.15,.18,.18,palette.tip,g,.72,-.12,0);g.scale.setScalar(scale);return g;}
const obstacles=[];
for(const [x,z] of [[-12,-9],[8,-10],[13,7],[-9,8]]){const g=new THREE.Group();scene.add(g);g.position.set(x,0,z);box(2.5,1.7,2.5,mat('#b28a4c'),g,0,.7,0);for(const y of [.1,.8,1.5])box(2.65,.12,2.65,mat('#d6af66'),g,0,y,0);for(let i=0;i<5;i++)sphere(.35,palette.yellow,g,(i%3-1)*.6,1.8,Math.floor(i/3)*.6-.3);obstacles.push({x,z,r:1.8});}
for(let i=0;i<24;i++){const x=(i%2?1:-1)*(23+Math.random()*6),z=Math.random()*42-21;const g=new THREE.Group();scene.add(g);box(.35,3,.35,mat('#836746'),g,x,1,z);const leaves=mesh(new THREE.ConeGeometry(2,4,5),palette.green,g,x,4,z);leaves.rotation.y=i;}
const player=new THREE.Group();scene.add(player);
box(.85,1,.65,palette.green,player,0,.9,0);box(.85,.85,.8,palette.yellow,player,0,1.8,0);
box(.95,.13,.73,palette.dark,player,0,1.85,.1);for(const x of [-.25,.25])box(.17,.1,.04,palette.white,player,x,1.86,.48);
const feet=[box(.28,.35,.55,palette.dark,player,-.28,.15,0),box(.28,.35,.55,palette.dark,player,.28,.15,0)];
box(.25,.25,.8,palette.yellow,player,.6,1.1,.35);const gun=banana(player,.95);gun.position.set(.6,1.15,.9);gun.rotation.y=-Math.PI/2;
const ring=mesh(new THREE.TorusGeometry(.85,.045,6,40),mat('#ffdc42'),player,0,-.12,0);ring.rotation.x=Math.PI/2;
const aim=mesh(new THREE.TorusGeometry(.23,.025,6,24),palette.white);aim.rotation.x=Math.PI/2;aim.position.y=.02;
let mode='title',health=5,score=0,wave=0,kills=0,remaining=0,spawnTimer=0,shotTimer=0,invincible=0,dashCooldown=0,dashTime=0,waveDelay=0,time=0,toastTime=0;
let best=0;try{best=Number(localStorage.getItem('banana-man-best'))||0;}catch{}$('best').textContent=best;
const enemies=[],bullets=[],particles=[],pickups=[],keys=new Set(),pointer=new THREE.Vector2(.4,0),ray=new THREE.Raycaster(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),0),target=new THREE.Vector3(5,0,5);
let firing=false,audioContext,sound=false;
function tone(freq,duration=.06){if(!sound)return;try{audioContext??=new AudioContext();audioContext.resume();const o=audioContext.createOscillator(),g=audioContext.createGain();o.type='triangle';o.frequency.setValueAtTime(freq,audioContext.currentTime);o.frequency.exponentialRampToValueAtTime(freq*.5,audioContext.currentTime+duration);g.gain.setValueAtTime(.045,audioContext.currentTime);g.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+duration);o.connect(g).connect(audioContext.destination);o.start();o.stop(audioContext.currentTime+duration);}catch{}}
$('sound').onclick=()=>{sound=!sound;$('sound').textContent=sound?'SOUND ON':'SOUND OFF';tone(440);};
function toast(s){$('toast').textContent=s;toastTime=2;}
function hud(){$('health').textContent='♥ '.repeat(health)+'♡ '.repeat(5-health);$('wave').textContent=String(wave).padStart(2,'0');$('score').textContent=String(score).padStart(5,'0');}
function remove(list,i){const item=list.splice(i,1)[0];scene.remove(item.mesh);item.mesh.traverse(o=>{if(o.geometry)o.geometry.dispose();});}
function clear(){for(const list of [enemies,bullets,particles,pickups])while(list.length)remove(list,0);}
function start(){clear();health=5;score=0;wave=0;kills=0;remaining=0;waveDelay=.4;shotTimer=0;invincible=0;dashCooldown=0;dashTime=0;player.position.set(0,0,0);player.visible=true;mode='playing';$('overlay').hidden=true;hud();}
function pause(){if(mode==='playing'){mode='paused';firing=false;keys.clear();$('overlay').hidden=false;$('overlay').innerHTML='<div class="eyebrow">TAKE A BREATHER</div><h1>ON<br><em>ICE.</em></h1><p>Your bananas aren’t going anywhere.</p><button id="resume">KEEP PEELING ▶</button>';$('resume').onclick=resume;}else if(mode==='paused')resume();}
function resume(){mode='playing';$('overlay').hidden=true;}
function gameOver(){mode='over';best=Math.max(best,score);try{localStorage.setItem('banana-man-best',best);}catch{}$('overlay').hidden=false;$('overlay').innerHTML=`<div class="eyebrow">THAT’S A WRAP</div><h1>WELL<br><em>PEELED.</em></h1><p>Score ${score} · Wave ${wave}<br>Personal best ${best}</p><button id="restart">ONE MORE BUNCH ▶</button>`;$('restart').onclick=start;}
$('play').onclick=start;
addEventListener('keydown',e=>{if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();keys.add(e.code);if(e.code==='Escape'&&!e.repeat)pause();});addEventListener('keyup',e=>keys.delete(e.code));
addEventListener('blur',()=>{keys.clear();firing=false;if(mode==='playing')pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='playing')pause();});
addEventListener('pointermove',e=>pointer.set(e.clientX/innerWidth*2-1,1-e.clientY/innerHeight*2));$('world').addEventListener('pointerdown',e=>{if(e.button===0&&mode==='playing')firing=true;});addEventListener('pointerup',()=>firing=false);
function spawn(){const g=new THREE.Group();scene.add(g);const tough=wave>=3&&Math.random()<.3;const color=tough?palette.purple:palette.red;sphere(tough?.75:.6,color,g,0,.75,0);box(.13,.35,.13,palette.dark,g,0,1.45,0);const leaf=box(.5,.08,.22,palette.green,g,.2,1.5,0);leaf.rotation.z=.4;for(const x of [-.23,.23]){sphere(.13,palette.white,g,x,.95,.5);sphere(.065,palette.dark,g,x,.95,.6);}const side=Math.floor(Math.random()*4);g.position.set(side<2?(side===0?-20:20):Math.random()*38-19,0,side>=2?(side===2?-16:16):Math.random()*28-14);enemies.push({mesh:g,hp:tough?4:2,r:tough?.85:.65,speed:(tough?1.6:2.3)+Math.min(wave*.15,2)});}
function burst(pos,color,count=9){for(let i=0;i<count;i++){const m=box(.14,.14,.14,color,scene,pos.x,.7,pos.z);particles.push({mesh:m,velocity:new THREE.Vector3((Math.random()-.5)*7,Math.random()*5+2,(Math.random()-.5)*7),life:.5+Math.random()*.3});}}
function move(entity,dx,dz,r){entity.position.x=THREE.MathUtils.clamp(entity.position.x+dx,-20.5,20.5);entity.position.z=THREE.MathUtils.clamp(entity.position.z+dz,-16.5,16.5);for(const o of obstacles){const x=entity.position.x-o.x,z=entity.position.z-o.z,d=Math.hypot(x,z),limit=o.r+r;if(d<limit){entity.position.x=o.x+(d?x/d:1)*limit;entity.position.z=o.z+(d?z/d:0)*limit;}}}
function shoot(){const direction=new THREE.Vector3(Math.sin(player.rotation.y),0,Math.cos(player.rotation.y));const m=new THREE.Group();scene.add(m);banana(m,.45);m.position.copy(player.position).addScaledVector(direction,1.3);m.position.y=1;bullets.push({mesh:m,velocity:direction.multiplyScalar(25),life:1.5});tone(650);gun.position.z=.7;}
function update(dt){time+=dt;toastTime-=dt;if(toastTime<=0)$('toast').textContent='';
 if(mode!=='playing'){if(mode==='title'){player.position.set(7,0,2);player.rotation.y=-.5+Math.sin(time*.5)*.2;}return;}
 invincible-=dt;dashCooldown-=dt;dashTime-=dt;shotTimer-=dt;player.visible=invincible<=0||Math.floor(time*16)%2===0;
 let x=Number(keys.has('KeyD')||keys.has('ArrowRight'))-Number(keys.has('KeyA')||keys.has('ArrowLeft')),z=Number(keys.has('KeyS')||keys.has('ArrowDown'))-Number(keys.has('KeyW')||keys.has('ArrowUp'));const length=Math.hypot(x,z);if(length){x/=length;z/=length;}
 if(keys.has('Space')&&dashCooldown<=0&&length){dashTime=.17;dashCooldown=1.6;invincible=Math.max(invincible,.23);tone(220,.15);burst(player.position,palette.yellow,4);}
 move(player,x*dt*(dashTime>0?24:7),z*dt*(dashTime>0?24:7),.6);feet.forEach((f,i)=>f.position.z=length?Math.sin(time*18+i*Math.PI)*.19:0);
 ray.setFromCamera(pointer,camera);ray.ray.intersectPlane(plane,target);aim.position.set(target.x,.02,target.z);player.rotation.y=Math.atan2(target.x-player.position.x,target.z-player.position.z);
 if(firing&&shotTimer<=0){shoot();shotTimer=.16;}gun.position.z=THREE.MathUtils.lerp(gun.position.z,.9,dt*15);
 $('dash').textContent=dashCooldown<=0?'DASH READY':`DASH ${dashCooldown.toFixed(1)}s`;
 if(remaining===0&&enemies.length===0){waveDelay-=dt;if(waveDelay<=0){wave++;remaining=5+wave*3;spawnTimer=0;waveDelay=2.5;toast(`WAVE ${String(wave).padStart(2,'0')} · FRUIT FRENZY`);hud();}}
 spawnTimer-=dt;if(remaining>0&&spawnTimer<=0){spawn();remaining--;spawnTimer=Math.max(.22,.85-wave*.04);}
 for(let i=bullets.length-1;i>=0;i--){const b=bullets[i];b.mesh.position.addScaledVector(b.velocity,dt);b.mesh.rotation.y+=dt*15;b.life-=dt;let hit=false;for(let j=enemies.length-1;j>=0;j--){const e=enemies[j];if(Math.hypot(e.mesh.position.x-b.mesh.position.x,e.mesh.position.z-b.mesh.position.z)<e.r+.3){hit=true;e.hp--;burst(e.mesh.position,palette.yellow,3);if(e.hp<=0){const pos=e.mesh.position.clone();burst(pos,palette.red);remove(enemies,j);score+=100;kills++;tone(180,.1);if(kills%10===0){const m=mesh(new THREE.OctahedronGeometry(.45),palette.green);m.position.copy(pos);pickups.push({mesh:m,life:15});}hud();}break;}}
 if(hit||b.life<=0||obstacles.some(o=>Math.hypot(o.x-b.mesh.position.x,o.z-b.mesh.position.z)<o.r))remove(bullets,i);}
 for(const e of enemies){const dx=player.position.x-e.mesh.position.x,dz=player.position.z-e.mesh.position.z,d=Math.hypot(dx,dz);if(d>.01)move(e.mesh,dx/d*dt*e.speed,dz/d*dt*e.speed,e.r);e.mesh.rotation.y=Math.atan2(dx,dz);e.mesh.position.y=Math.abs(Math.sin(time*7))* .12;if(d<e.r+.6&&invincible<=0){health--;invincible=1.2;burst(player.position,palette.yellow);tone(90,.2);hud();if(health<=0){gameOver();break;}}}
 for(let i=pickups.length-1;i>=0;i--){const p=pickups[i];p.life-=dt;p.mesh.rotation.y+=dt*2;p.mesh.position.y=.8+Math.sin(time*4)*.2;if(p.mesh.position.distanceTo(player.position)<1.6){health=Math.min(5,health+1);hud();tone(880,.15);remove(pickups,i);}else if(p.life<=0)remove(pickups,i);}
}
function resize(){const pixelScale=Math.max(2,Math.ceil(innerHeight/300));renderer.setSize(Math.ceil(innerWidth/pixelScale),Math.ceil(innerHeight/pixelScale),false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();}addEventListener('resize',resize);resize();
let previous=performance.now();function frame(now){const dt=Math.min((now-previous)/1000,.033);previous=now;update(dt);if(mode!=='paused'){for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life-=dt;p.velocity.y-=dt*18;p.mesh.position.addScaledVector(p.velocity,dt);if(p.life<=0)remove(particles,i);}}const look=mode==='title'?new THREE.Vector3(1,0,0):new THREE.Vector3(player.position.x*.35,0,player.position.z*.3);const height=innerWidth/innerHeight<1.2?39:29;camera.position.lerp(new THREE.Vector3(look.x,height,look.z+height*.72),.08);camera.lookAt(look);renderer.render(scene,camera);requestAnimationFrame(frame);}camera.position.set(1,29,21);requestAnimationFrame(frame);
