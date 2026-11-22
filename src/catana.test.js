import test from 'node:test';
import assert from 'node:assert/strict';
import {createSwing,stepSwing,CATANA_REACH,swingDamageMultiplier} from './catana.js';
const player={x:320,y:200};
test('compact blade sweeps both directions, not when stationary or out of reach',()=>{
 assert.equal(CATANA_REACH,52);const near={x:360,y:200,r:8},far={x:390,y:200,r:8},back={x:280,y:200,r:8};
 for(const [from,to] of [[-.6,.6],[.6,-.6]])assert.deepEqual(stepSwing(createSwing(),player,from,to,[near,far,back],[]),[near]);
 assert.deepEqual(stepSwing(createSwing(),player,0,0,[near],[]),[]);
});
test('angle wrap sweeps the short arc and crates stop hits',()=>{
 const left={x:280,y:200,r:8},right={x:360,y:200,r:8};
 assert.deepEqual(stepSwing(createSwing(),player,3,-3,[left,right],[]),[left]);
 assert.deepEqual(stepSwing(createSwing(),player,-.2,.2,[right],[{x:345,y:200}]),[]);
});
test('repeat hits require cooldown and a new sweep',()=>{
 const s=createSwing(),e={x:360,y:200,r:8};
 assert.equal(stepSwing(s,player,-.3,.3,[e],[],.16).length,1);
 assert.equal(stepSwing(s,player,.3,-.3,[e],[],.16).length,0);
 s.clock=.17;assert.equal(stepSwing(s,player,0,0,[e],[],.16).length,0);
 assert.equal(stepSwing(s,player,-.3,.3,[e],[],.16).length,1);
});

test('Goofy blade reaches distant targets while normal blade stays compact',()=>{
 const e={x:470,y:200,r:8};assert.equal(stepSwing(createSwing(),player,-.2,.2,[e],[],.1).length,0);assert.equal(stepSwing(createSwing(),player,-.2,.2,[e],[],.1,180).length,1);
});

test('faster swings increase damage with stable direction, timing and a safe cap',()=>{
 const slow=swingDamageMultiplier(0,1,1),fast=swingDamageMultiplier(0,1,.1);
 assert.equal(slow,1);assert(fast>slow);assert.equal(swingDamageMultiplier(0,1,.001),3);
 assert.equal(swingDamageMultiplier(1,0,.1),fast);
 assert(Math.abs(swingDamageMultiplier(0,.5,.05)-fast)<1e-9);
 assert.equal(swingDamageMultiplier(3.13,-3.13,.1),1);
 assert.equal(swingDamageMultiplier(0,1,0),1);assert.equal(swingDamageMultiplier(0,1,Infinity),1);
});
