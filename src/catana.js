export const CATANA_REACH=52;
export function createSwing(){return {clock:0,hits:new Map(),trail:[],soundClock:0};}
export function bladeReach(player,angle,crates,maxReach=CATANA_REACH){
 for(let d=8;d<=maxReach;d+=2){const x=player.x+Math.cos(angle)*d,y=player.y+Math.sin(angle)*d;if(x<12||x>628||y<12||y>388||crates.some(c=>Math.abs(x-c.x)<19&&Math.abs(y-c.y)<19))return d;}
 return maxReach;
}
export function stepSwing(s,player,from,to,enemies,crates,cooldown=.32,maxReach=CATANA_REACH){
 const delta=Math.atan2(Math.sin(to-from),Math.cos(to-from)),hits=[];
 if(Math.abs(delta)<.003)return hits;
 s.trail.push({from,to:from+delta,life:.12});if(s.trail.length>12)s.trail.shift();
 const steps=Math.max(1,Math.ceil(Math.abs(delta)/.035));
 for(let i=0;i<=steps;i++){const angle=from+delta*i/steps,dx=Math.cos(angle),dy=Math.sin(angle),reach=bladeReach(player,angle,crates,maxReach);
  for(const e of enemies){if((s.hits.get(e)??-Infinity)>s.clock)continue;const x=e.x-player.x,y=e.y-player.y,along=x*dx+y*dy,side=Math.abs(x*dy-y*dx);
   if(along>=0&&along<=reach&&side<e.r+3){s.hits.set(e,s.clock+cooldown);hits.push(e);}
  }
 }
 return hits;
}

// Angular speed makes this independent of pointer distance and render frame rate.
export function swingDamageMultiplier(from,to,seconds){
 if(!Number.isFinite(seconds)||seconds<=0)return 1;
 const speed=Math.abs(Math.atan2(Math.sin(to-from),Math.cos(to-from)))/Math.max(.001,seconds);
 return 1+2*Math.max(0,Math.min(1,(speed-2)/12));
}
