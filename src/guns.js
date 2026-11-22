export const guns={
 gun:{name:'BANANA GUN',cooldown:.19,speed:360,life:1.8,damage:1,radius:3},
 scatter:{name:'BUNCH BLASTER',cooldown:.5,speed:360,life:.65,damage:1,radius:3,spread:[-.24,-.12,0,.12,.24]},
 heavy:{name:'BIG BANANA',cooldown:.55,speed:270,life:1.8,damage:3,radius:7,heavy:true},
 rail:{name:'PEEL RAILGUN',cooldown:.85,speed:700,life:1.1,damage:2.5,radius:3,pierces:3,color:'#78f4ed'},
 bomber:{name:'BANANA BOMBER',cooldown:.95,speed:220,life:1.15,damage:2,radius:6,explosive:true,color:'#ffac62'}
};
export function gunVolley(id,player,damage,rng=Math.random){const gun=guns[id];return (gun.spread||[0]).map(offset=>{const angle=player.angle+offset+(gun.jitter?(rng()-.5)*gun.jitter*2:0),vx=Math.cos(angle),vy=Math.sin(angle);return {x:player.x+vx*13,y:player.y+vy*13,vx:vx*gun.speed,vy:vy*gun.speed,life:gun.life,angle,damage:damage*gun.damage,radius:gun.radius,heavy:gun.heavy,explosive:gun.explosive,color:gun.color,piercesLeft:gun.pierces||0,hitEnemies:new Set(),kind:id};});}
