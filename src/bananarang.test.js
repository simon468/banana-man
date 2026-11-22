import test from 'node:test';
import assert from 'node:assert/strict';
import {throwBananarang,hitBananarangEnemy,stepBananarang} from './bananarang.js';
import {freshBuild,applyUpgrade,stats} from './upgrades.js';
const player={x:100,y:200,angle:0};
test('base throw pierces one enemy; repeat overlap does not consume pierces',()=>{
 const r=throwBananarang(player),a={},b={};assert(hitBananarangEnemy(r,a));assert(!r.returning);assert.equal(r.piercesLeft,0);assert(!hitBananarangEnemy(r,a));assert(!r.returning);assert(hitBananarangEnemy(r,b));assert(r.returning);assert(!hitBananarangEnemy(r,b));assert(hitBananarangEnemy(r,a));assert(!hitBananarangEnemy(r,a));
});
test('pierce upgrades stack per throw and reset with a fresh build',()=>{
 const build=freshBuild();applyUpgrade(build,'rang');applyUpgrade(build,'pierce');applyUpgrade(build,'pierce');assert.equal(stats(build).pierces,5);const r=throwBananarang(player,stats(build).pierces);for(let i=0;i<5;i++){assert(hitBananarangEnemy(r,{}));assert(!r.returning);}assert(hitBananarangEnemy(r,{}));assert(r.returning);assert.equal(throwBananarang(player,stats(freshBuild()).pierces).piercesLeft,1);
});
test('walls and crates still return a throw with unused pierces',()=>{
 for(const [x,crates] of [[623,[]],[180,[{x:180,y:200}]]]){const r=throwBananarang(player,5);r.x=x;stepBananarang(r,player,.01,crates);assert(r.returning);assert.equal(r.piercesLeft,5);}
});
