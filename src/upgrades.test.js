import test from 'node:test';
import assert from 'node:assert/strict';
import {upgrades,freshBuild,draftUpgrades,applyUpgrade,stats,weapons,weaponLevel,weaponPower,upgradeCard} from './upgrades.js';
test('buffed stats stack without changing baseline or weapon ownership',()=>{
 const build=freshBuild();for(const id of ['haste','heart','shield','speed','dash','regen','knockback','heal'])applyUpgrade(build,id);
 const s=stats(build);assert.equal(s.rate,1.35);assert.equal(s.maxHealth,7);assert.equal(s.shields,2);assert.equal(s.speed,1.2);assert.equal(s.dashCooldown,1.3);assert.equal(s.regen,2);assert.equal(s.knockback,1.6);assert.deepEqual(weapons(build),['gun','rang']);
 for(let i=0;i<3;i++)applyUpgrade(build,'dash');assert(Math.abs(stats(build).dashCooldown-.4)<1e-9);assert.equal(applyUpgrade(build,'dash'),false);assert.equal(stats(freshBuild()).maxHealth,4);
});
test('both starting choices include a level-one bananarang with pierce upgrades available',()=>{
 for(const id of ['gun','catana']){const build=freshBuild(id);assert.equal(weaponLevel(build,id),1);assert.equal(weaponLevel(build,'rang'),1);assert.equal(weapons(build).length,2);assert(applyUpgrade(build,'pierce'));assert(applyUpgrade(build,'rang'));assert.equal(weaponLevel(build,'rang'),2);}
});
test('draft always has three distinct eligible options, even in long runs',()=>{
 const build=freshBuild();for(const u of upgrades)if(Number.isFinite(u.max))build[u.id]=u.max;
 for(let i=0;i<100;i++){const draft=draftUpgrades(build);assert.equal(draft.length,3);assert.equal(new Set(draft.map(u=>u.id)).size,3);assert(draft.every(u=>(build[u.id]||0)<u.max));}
});
test('stats stack, weapon levels stack, and a new run resets',()=>{
 const build=freshBuild();applyUpgrade(build,'damage');applyUpgrade(build,'damage');applyUpgrade(build,'heart');applyUpgrade(build,'shield');applyUpgrade(build,'scatter');assert.equal(stats(build).damage,3);assert.equal(stats(build).maxHealth,6);assert.equal(stats(build).shields,2);assert.deepEqual(weapons(build),['gun','rang','scatter']);assert.equal(applyUpgrade(build,'scatter'),true);assert.equal(stats(freshBuild()).damage,1);assert.deepEqual(weapons(freshBuild()),['gun','rang']);
});


test('all weapons level to five, stay unique, and leave the draft at the cap',()=>{
 const build=freshBuild();assert.equal(weaponLevel(build,'gun'),1);
 for(const u of upgrades.filter(u=>u.weapon)){
  assert.equal(upgradeCard(build,u).kind,['gun','rang'].includes(u.id)?'WEAPON LEVEL UP':'NEW WEAPON');
  while(applyUpgrade(build,u.id)){}
  assert.equal(weaponLevel(build,u.id),5);assert.deepEqual(weaponPower(build,u.id),{damage:2,rate:1.4});
  assert.equal(applyUpgrade(build,u.id),false);
 }
 assert.equal(weapons(build).length,8);assert.equal(new Set(weapons(build)).size,8);
 for(let i=0;i<50;i++)assert(draftUpgrades(build).every(u=>!u.weapon));
 assert.equal(weaponLevel(freshBuild(),'gun'),1);assert.equal(weaponLevel(freshBuild(),'rang'),1);
});

test('alternate starters can unlock the pistol and removed SMG is unavailable',()=>{
 const build=freshBuild('rang');assert.deepEqual(weapons(build),['rang']);assert.equal(weaponLevel(build,'gun'),0);assert(applyUpgrade(build,'gun'));assert.equal(weaponLevel(build,'gun'),1);assert.equal(applyUpgrade(build,'smg'),false);assert(!upgrades.some(u=>u.id==='smg'));assert.deepEqual(weapons(freshBuild('smg')),['gun','rang']);
});

test('Golden arsenal starts at five and takes exactly five upgrades to diamond',()=>{const b=freshBuild('gun',false,true);for(const id of weapons(b)){assert.equal(weaponLevel(b,id),5);for(let i=0;i<5;i++)assert(applyUpgrade(b,id));assert.equal(weaponLevel(b,id),10);assert.equal(applyUpgrade(b,id),false);}for(let i=0;i<30;i++)assert(draftUpgrades(b).every(u=>!u.weapon));assert.equal(weaponLevel(freshBuild(),'gun'),1);});
