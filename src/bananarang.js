export function throwBananarang(player,pierces=1,speedMultiplier=1) {
  return {x:player.x,y:player.y,angle:player.angle,speedMultiplier,age:0,returning:false,
    vx:Math.cos(player.angle)*270*speedMultiplier,vy:Math.sin(player.angle)*270*speedMultiplier,
    piercesLeft:pierces,outwardHits:new Set(),returnHits:new Set(),trail:[]};
}

// Returns true only for a new hit on this leg of the flight.
export function hitBananarangEnemy(r,enemy) {
  const hits=r.returning?r.returnHits:r.outwardHits;
  if(hits.has(enemy))return false;
  hits.add(enemy);
  if(!r.returning){
    if(r.piercesLeft>0)r.piercesLeft--;
    else {r.returning=true;r.returnHits.add(enemy);}
  }
  return true;
}

export function stepBananarang(r,player,dt,crates) {
  r.age+=dt;const speedMultiplier=r.speedMultiplier||1;
  if(r.x<18||r.x>622||r.y<18||r.y>382||crates.some(c=>Math.abs(r.x-c.x)<23&&Math.abs(r.y-c.y)<23))r.returning=true;
  if(r.returning){
    const dx=player.x-r.x,dy=player.y-r.y,d=Math.hypot(dx,dy);
    // Return speed exceeds the player's dash speed, so it can always catch up.
    if(d<14+420*speedMultiplier*dt)return true;
    r.vx=dx/d*420*speedMultiplier;r.vy=dy/d*420*speedMultiplier;
  }else{
    r.vx=Math.cos(r.angle)*270*speedMultiplier;r.vy=Math.sin(r.angle)*270*speedMultiplier;
  }
  r.x+=r.vx*dt;r.y+=r.vy*dt;
  r.trail.push({x:r.x,y:r.y});if(r.trail.length>9)r.trail.shift();
  return false;
}
