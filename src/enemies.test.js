import test from 'node:test';
import assert from 'node:assert/strict';
import {enemyKind,makeEnemy,stepEnemy,specialists} from './enemies.js';
const move=(e,x,y)=>{e.x+=x;e.y+=y;};
test('seedlings share lime movement and charge phases with less health',()=>{
 for(const wave of [5,8,15]){
  const lime=makeEnemy('lime',100,100,wave),seed=makeEnemy('seed',100,100,wave);
  assert(seed.hp<lime.hp);assert(seed.r<lime.r);assert.equal(seed.speed,lime.speed);
  for(const dt of [1.1,.7,.2,.3,.8]){
   for(const e of [lime,seed])stepEnemy(e,{x:200,y:100},dt,move,()=>assert.fail('Chargers must not shoot'));
   assert.equal(seed.phase,lime.phase);assert.equal(seed.timer,lime.timer);assert.equal(seed.x,lime.x);assert.equal(seed.y,lime.y);
  }
 }
});
test('enemy introductions respect wave gates',()=>{for(let i=0;i<100;i++)assert.equal(enemyKind(1,i/100),'tomato');assert.equal(enemyKind(2,.1),'lime');assert.equal(enemyKind(3,.1),'cherry');assert.equal(enemyKind(5,.1),'melon');});
test('lime telegraphs then charges its locked direction and recovers',()=>{const e=makeEnemy('lime',100,100,2),p={x:200,y:100};e.timer=0;stepEnemy(e,p,.01,move,()=>{});assert.equal(e.phase,'windup');assert.equal(e.x,100);stepEnemy(e,{x:100,y:200},.7,move,()=>{});assert.equal(e.phase,'charge');stepEnemy(e,p,.2,move,()=>{});assert(e.x>100);assert.equal(e.y,100);stepEnemy(e,p,.3,move,()=>{});assert.equal(e.phase,'recover');});
test('cherry keeps distance and warns before firing',()=>{const e=makeEnemy('cherry',100,100,3);let shots=0;stepEnemy(e,{x:120,y:100},.1,move,()=>shots++);assert(e.x<100);e.timer=0;stepEnemy(e,{x:230,y:100},.01,move,()=>shots++);assert.equal(e.phase,'windup');assert.equal(shots,0);stepEnemy(e,{x:230,y:100},.71,move,()=>shots++);assert.equal(shots,1);assert.equal(e.phase,'hunt');});

test('armored coconuts only enter the spawn pool with Catana ownership',()=>{
 for(const wave of [1,5,20])for(let i=0;i<100;i++)assert.notEqual(enemyKind(wave,i/100,false),'coconut');
 assert.equal(enemyKind(1,.1,true),'coconut');assert.equal(enemyKind(1,.8,true),'tomato');assert.equal(makeEnemy('coconut',0,0,1).hp,4);
});

test('each owned weapon enables only its matching specialist',()=>{
 for(const [kind,info] of Object.entries(specialists)){assert.equal(enemyKind(1,.01,[info.weapon]),kind);for(let i=0;i<100;i++){const spawned=enemyKind(20,i/100,[info.weapon]);if(specialists[spawned])assert.equal(specialists[spawned].weapon,info.weapon);}}
 const owned=Object.values(specialists).map(s=>s.weapon);let count=0;for(let i=0;i<1000;i++)if(specialists[enemyKind(20,i/1000,owned)])count++;assert.equal(count,160);
});

test('boss telegraphs charges and bounded volleys, and later bosses grow stronger',()=>{const e=makeEnemy('boss',100,100,10),p={x:300,y:100};let shots=0;e.timer=0;stepEnemy(e,p,.01,move,()=>shots++);assert.equal(e.phase,'windup');stepEnemy(e,p,1,move,()=>shots++);assert.equal(e.phase,'charge');stepEnemy(e,p,.7,move,()=>shots++);assert(e.x>100);stepEnemy(e,p,1,move,()=>shots++);stepEnemy(e,p,2,move,()=>shots++);assert.equal(e.phase,'windup');stepEnemy(e,p,1,move,()=>shots++);assert.equal(shots,10);assert(makeEnemy('boss',0,0,20).hp>e.maxHp);});

test('weapon use reduces only its matching enemy, even with one weapon',()=>{const count=(owned,use)=>{const counts={};for(let i=0;i<10000;i++){const k=enemyKind(5,(i+.5)/10000,owned,use);counts[k]=(counts[k]||0)+1;}return counts;};const base=count(['gun','catana'],{}),used=count(['gun','catana'],{gun:20}),max=count(['gun','catana'],{gun:9999});assert.equal(used.apple,base.apple/2);assert.equal(max.apple,base.apple/5);assert.equal(used.coconut,base.coconut);assert.equal(count(['gun'],{gun:20}).apple,800);});

test('boss has more health and offset double seed rings',()=>{
 const e=makeEnemy('boss',100,100,10),shots=[];assert.equal(e.maxHp,240);e.attack=1;e.phase='windup';e.timer=.1;
 const tick=dt=>stepEnemy(e,{x:250,y:100},dt,move,(_,a)=>shots.push(a));
 tick(.1);assert.equal(shots.length,10);assert.equal(e.phase,'ringFollowup');tick(.49);assert.equal(shots.length,10);tick(.02);assert.equal(shots.length,20);assert.notEqual(shots[0],shots[10]);assert.equal(e.phase,'recover');
});
test('tracking volleys re-aim between warnings and stay bounded',()=>{
 for(const angry of [false,true]){const e=makeEnemy('boss',100,100,10);e.attack=2;e.phase='windup';e.timer=.1;if(angry)e.hp=100;let shots=0;const tick=dt=>stepEnemy(e,{x:100,y:300},dt,move,()=>shots++);
 tick(.1);assert.equal(shots,5);tick(.3);assert.equal(e.phase,'windup');assert.equal(e.aim,Math.PI/2);
 for(let i=0;i<60&&e.phase!=='recover';i++)tick(.1);assert.equal(shots,angry?20:15);assert.equal(e.phase,'recover');}
});
test('enraged boss warns before its second charge then recovers',()=>{
 const e=makeEnemy('boss',100,100,10);e.hp=100;e.phase='charge';e.timer=.1;e.combo=0;
 stepEnemy(e,{x:100,y:300},.1,move,()=>{});assert.equal(e.phase,'windup');assert.equal(e.timer,.6);
 stepEnemy(e,{x:100,y:300},.61,move,()=>{});assert.equal(e.phase,'charge');stepEnemy(e,{x:100,y:300},.56,move,()=>{});assert.equal(e.phase,'recover');
});

test('King Banana alternates and fires three bounded rings',()=>{for(const wave of [10,20,30,40,50,60])assert.equal(makeEnemy('boss',100,100,wave).kingBanana,wave%20===0);const e=makeEnemy('boss',100,100,20);assert.equal(e.hp,693);e.phase='windup';e.attack=1;e.timer=0;let count=0;for(let i=0;i<11;i++)stepEnemy(e,{x:300,y:200},.1,move,()=>count++);assert.equal(count,42);assert.equal(e.phase,'recover');});

test('Cherry King is a Catana-gated fifty-fifty Banana-slot variant with half health',()=>{for(const wave of [20,40,60]){const banana=makeEnemy('boss',0,0,wave,true,.5),cherry=makeEnemy('boss',0,0,wave,true,.499);assert.equal(banana.name,'KING BANANA');assert.equal(cherry.name,'CHERRY KING');assert.equal(cherry.hp,banana.hp/2);assert.equal(makeEnemy('boss',0,0,wave,false,0).cherryKing,false);}assert.equal(makeEnemy('boss',0,0,10,true,0).name,'KING MELON');});
