export const rarities={common:{name:'COMMON',weight:100},uncommon:{name:'UNCOMMON',weight:60},rare:{name:'RARE',weight:30},epic:{name:'EPIC',weight:12}};
const upgradeRarities={gun:'common',damage:'common',speed:'common',knockback:'common',catana:'uncommon',rang:'uncommon',bombnana:'uncommon',haste:'uncommon',dash:'uncommon',heal:'uncommon',scatter:'rare',heavy:'rare',heart:'rare',pierce:'rare',rail:'epic',bomber:'epic',shield:'epic',regen:'epic'};
export const upgrades=[
 {id:'bombnana',name:'BOMBNANA',weapon:true,kind:'SECONDARY',description:'Place a banana bomb with Shift. Explodes after 1 second. No self-damage.',max:5},
 {id:'catana',name:'BANANA CATANA',weapon:true,kind:'NEW WEAPON',description:'Unlock a compact melee blade. Circle your mouse to slice for 2× damage. Faster swings deal up to 3× extra swing damage.',max:5},
 {id:'gun',name:'BANANA GUN',kind:'NEW WEAPON',weapon:true,description:'Unlock a reliable, quick-firing banana pistol.',max:5},
 {id:'rang',name:'BANANARANG',weapon:true,kind:'NEW WEAPON',description:'Unlock a returning banana that pierces one enemy. Press Shift to throw without switching weapons.',max:5},
 {id:'rail',name:'PEEL RAILGUN',weapon:true,kind:'NEW WEAPON',description:'Unlock a precision railgun. 2.5× damage; pierces 3 enemies before stopping.',max:5},
 {id:'bomber',name:'BANANA BOMBER',weapon:true,kind:'NEW WEAPON',description:'Unlock explosive bananas. Detonate on impact or after a short fuse; 2× damage in a wide blast.',max:5},
 {id:'pierce',requires:'rang',name:'PEEL THROUGH',kind:'BANANARANG',description:'+2 enemy pierces per throw. Pass through more enemies before turning back. Stacks.',max:Infinity},
 {id:'damage',name:'RIPE FOR VIOLENCE',kind:'DAMAGE',description:'+1 damage to every banana round and bananarang hit.',max:Infinity},
 {id:'haste',name:'RAPID RIPENING',kind:'FIRE RATE',description:'+35% firing speed for all guns. Stacks additively.',max:Infinity},
 {id:'heart',name:'HEARTY BUNCH',kind:'SURVIVAL',description:'+2 maximum hearts and restore 3 hearts.',max:5},
 {id:'shield',name:'THICK PEEL',kind:'DEFENSE',description:'Block 2 extra hits each wave. Shields refill before every wave.',max:3},
 {id:'speed',name:'BANANA BOOTS',kind:'MOVEMENT',description:'+20% movement speed. Keep your distance from the fruit.',max:4},
 {id:'dash',name:'SLIPSTREAM',kind:'DASH',description:'Reduce dash cooldown by 0.30 seconds.',max:4},
 {id:'regen',name:'FRESH DELIVERY',kind:'RECOVERY',description:'Restore 2 extra hearts after every cleared wave, including this one.',max:3},
 {id:'scatter',name:'BUNCH BLASTER',weapon:true,kind:'NEW WEAPON',description:'Unlock a five-banana spread gun. Slower shots, devastating up close.',max:5},
 {id:'heavy',name:'BIG BANANA',weapon:true,kind:'NEW WEAPON',description:'Unlock a heavy cannon: huge rounds dealing triple damage.',max:5},
 {id:'knockback',name:'PULP FICTION',kind:'CONTROL',description:'+60% knockback on every weapon hit.',max:4},
 {id:'heal',name:'EMERGENCY SMOOTHIE',kind:'RECOVERY',description:'+1 maximum heart and fully heal. Available again in later drafts.',max:Infinity}
].map(u=>({...u,rarity:upgradeRarities[u.id]}));
export const weaponIds=['gun','rang','scatter','heavy','rail','bomber','catana','bombnana'];
export function freshBuild(startingWeapon='gun',goofy=false,golden=false){if(golden)return {golden:true,...Object.fromEntries(weaponIds.map(id=>[id,5]))};if(goofy)return {goofy:true,...Object.fromEntries(upgrades.map(u=>[u.id,Number.isFinite(u.max)?u.max:10]))};return {rang:1,[weaponIds.includes(startingWeapon)?startingWeapon:'gun']:1};}
export function draftUpgrades(build,rng=Math.random,exclude=[]){let pool=upgrades.filter(u=>(!build.secondary||!['rang','bombnana'].includes(u.id)||u.id===build.secondary)&&(build[u.id]||0)<upgradeMax(build,u)&&(!u.requires||build[u.requires]));const fresh=pool.filter(u=>!exclude.includes(u.id));if(fresh.length>=3)pool=fresh;const choices=[];while(pool.length&&choices.length<3){const total=pool.reduce((sum,u)=>sum+rarities[u.rarity].weight,0);let ticket=rng()*total,index=pool.length-1;for(let i=0;i<pool.length;i++){ticket-=rarities[pool[i].rarity].weight;if(ticket<0){index=i;break;}}choices.push(pool.splice(index,1)[0]);}return choices;}
export function applyUpgrade(build,id){const u=upgrades.find(u=>u.id===id);if(!u||(build[id]||0)>=upgradeMax(build,u)||(u.requires&&!build[u.requires]))return false;build[id]=(build[id]||0)+1;return true;}
export function stats(build){if(build.goofy)return {pierces:21,damage:25,rate:3,maxHealth:50,shields:12,speed:2.4,dashCooldown:.2,regen:50,knockback:4};const result={pierces:1+2*(build.pierce||0),damage:1+(build.damage||0),rate:1+.35*(build.haste||0),maxHealth:4+2*(build.heart||0)+(build.heal||0),shields:2*(build.shield||0),speed:1+.2*(build.speed||0),dashCooldown:1.6-.3*(build.dash||0),regen:2*(build.regen||0),knockback:1+.6*(build.knockback||0)};const p=build.permanent||{};result.maxHealth+=(p.heart||0);result.damage*=1+.1*(p.damage||0);result.rate*=1+.05*(p.haste||0);result.speed+=.05*(p.speed||0);result.shields+=p.shield||0;return result;}
export function weapons(build){return weaponIds.filter(id=>build[id]);}


export function weaponLevel(build,id){return build[id]||0;}
export function weaponPower(build,id){const extra=Math.max(0,weaponLevel(build,id)-1);return {damage:1+.25*extra,rate:1+.1*extra};}
export function upgradeCard(build,u){
 if(!u.weapon)return {...u,label:'LEVEL '+((build[u.id]||0)+1)};
 const level=weaponLevel(build,u.id);
 return {...u,kind:level?'WEAPON LEVEL UP':'NEW WEAPON',label:level?'LEVEL '+level+' → '+(level+1):'UNLOCK · LEVEL 1',description:level?'+25% base weapon damage and +10% base '+(u.id==='rang'?'flight / return speed':u.id==='bombnana'?'recharge speed':u.id==='catana'?'repeat-hit speed':'firing speed')+'. Stacks with your global upgrades. Max level '+upgradeMax(build,u)+'.':u.description};
}

export function upgradeMax(build,u){return u.weapon&&build.golden?10:u.max;}
