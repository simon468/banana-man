import test from 'node:test';
import assert from 'node:assert/strict';
import {readPermanent,buyPermanent,buyDiamond,diamondUpgrades,earnedGold} from './permanent.js';
import {freshBuild,stats} from './upgrades.js';
test('gold conversion rounds down and purchases persist with caps',()=>{
 assert.equal(earnedGold(4),0);assert.equal(earnedGold(14),2);
 const meta=readPermanent(null);assert.equal(buyPermanent(meta,'heart'),false);meta.gold=100;
 for(let i=0;i<5;i++)assert(buyPermanent(meta,'heart'));
 assert.equal(meta.gold,70);assert.equal(buyPermanent(meta,'heart'),false);assert.equal(buyPermanent(meta,'missing'),false);
 const loaded=readPermanent(JSON.stringify(meta));assert.deepEqual(loaded,meta);
 for(let i=0;i<2;i++){const build=freshBuild();build.permanent=loaded.levels;assert.equal(stats(build).maxHealth,9);}
 assert.equal(readPermanent('invalid').gold,0);
});

test('Golden Mode costs five once and persists',()=>{const m=readPermanent(null);m.gold=4;assert.equal(buyPermanent(m,'goldenMode'),false);m.gold=5;assert(buyPermanent(m,'goldenMode'));assert.equal(m.gold,0);assert.equal(buyPermanent(m,'goldenMode'),false);assert.equal(readPermanent(JSON.stringify(m)).levels.goldenMode,1);});

test('diamond purchases use a separate saved wallet and enforce level caps',()=>{const m=readPermanent(JSON.stringify({gold:10,levels:{heart:2}}));assert.equal(m.diamonds,0);assert.equal(buyDiamond(m,'heart'),false);m.diamonds=30;for(let i=0;i<5;i++)assert(buyDiamond(m,'heart'));assert.equal(m.diamonds,0);assert.equal(m.gold,10);assert.equal(buyDiamond(m,'heart'),false);assert.equal(buyDiamond(m,'goldenMode'),false);assert.deepEqual(readPermanent(JSON.stringify(m)),m);});
