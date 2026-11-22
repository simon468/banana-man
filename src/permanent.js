export const permanentUpgrades=[
 {id:'goldenMode',name:'GOLDEN MODE',description:'Unlock harder runs with all golden weapons. Upgrade five more times to diamond.',max:1,cost:5},
 {id:'heart',name:'GOLDEN HEART',description:'+1 maximum heart every run.',max:5,cost:2},
 {id:'damage',name:'GOLDEN MUSCLE',description:'+10% damage with every weapon.',max:5,cost:3},
 {id:'haste',name:'GOLDEN TRIGGER',description:'+5% firing and Catana repeat-hit speed.',max:5,cost:3},
 {id:'speed',name:'GOLDEN BOOTS',description:'+5% movement speed every run.',max:4,cost:2},
 {id:'shield',name:'GOLDEN PEEL',description:'+1 shield at the start of every wave.',max:3,cost:4}
];
export const diamondUpgrades=permanentUpgrades.filter(u=>u.id!=='goldenMode').map(u=>({...u,name:u.name.replace('GOLDEN','DIAMOND'),description:u.description+' Stacks with gold upgrades in Golden Mode.'}));
export function readPermanent(raw){let data;try{data=JSON.parse(raw);}catch{}return {diamonds:Number.isSafeInteger(data?.diamonds)&&data.diamonds>=0?data.diamonds:0,diamondLevels:Object.fromEntries(diamondUpgrades.map(u=>[u.id,Math.max(0,Math.min(u.max,Math.floor(Number(data?.diamondLevels?.[u.id])||0)))])),gold:Number.isSafeInteger(data?.gold)&&data.gold>=0?data.gold:0,levels:Object.fromEntries(permanentUpgrades.map(u=>[u.id,Math.max(0,Math.min(u.max,Math.floor(Number(data?.levels?.[u.id])||0)))]))};}
export function permanentCost(meta,u){return u.cost*(1+(meta.levels[u.id]||0));}
export function buyPermanent(meta,id){const u=permanentUpgrades.find(u=>u.id===id);if(!u||(meta.levels[id]||0)>=u.max)return false;const cost=permanentCost(meta,u);if(meta.gold<cost)return false;meta.gold-=cost;meta.levels[id]=(meta.levels[id]||0)+1;return true;}
export function earnedGold(coins){return Math.floor(Math.max(0,coins)/5);}

export function buyDiamond(meta,id){const u=diamondUpgrades.find(u=>u.id===id);if(!u||(meta.diamondLevels[id]||0)>=u.max)return false;const cost=u.cost*(1+(meta.diamondLevels[id]||0));if(meta.diamonds<cost)return false;meta.diamonds-=cost;meta.diamondLevels[id]=(meta.diamondLevels[id]||0)+1;return true;}
