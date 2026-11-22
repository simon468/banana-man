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
