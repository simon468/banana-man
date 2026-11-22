import test from 'node:test';
import assert from 'node:assert/strict';
import {createMenus} from './menus.js';
test('five consecutive Settings clicks unlock once; interruptions reset the sequence',()=>{
 let unlocked=0,listener;const settings={dataset:{tab:'settings'}},controls={dataset:{tab:'controls'}};
 const panel={classList:{add(){},remove(){}},setAttribute(){},addEventListener(type,fn){listener=fn;},querySelectorAll(q){return q==='[data-tab]'?[settings,controls]:[];},querySelector(){return {focus(){}};}};
 const menu=createMenus({panel,getState:()=>({sound:true,music:true}),actions:{unlockShop(){unlocked++;}}});
 menu.show('main','settings');
 const click=b=>{b.onclick();listener({target:{closest:()=>b===settings?b:null}});};
 for(let i=0;i<4;i++)click(settings);assert.equal(unlocked,0);click(controls);click(settings);assert.equal(unlocked,0);
 for(let i=0;i<4;i++)click(settings);assert.equal(unlocked,1);assert.match(panel.innerHTML,/GOLDEN SECRET/);
 click(settings);menu.show('main','settings');for(let i=0;i<4;i++)click(settings);assert.equal(unlocked,1);
});
