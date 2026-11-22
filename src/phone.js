export const PHONE_KILLS=50;
export const TRUCK_LANE={top:400/3,bottom:800/3};
export function createPhone(){return {charge:0,truck:null};}
export function chargePhone(phone){phone.charge=Math.min(PHONE_KILLS,phone.charge+1);}
export function callTruck(phone){if(phone.charge<PHONE_KILLS||phone.truck)return false;phone.charge=0;phone.truck={phase:'warning',timer:.9,x:-130};return true;}
export function stepTruck(phone,dt){const t=phone.truck;if(!t)return null;if(t.phase==='warning'){t.timer-=dt;if(t.timer<=0)t.phase='driving';return null;}const from=t.x;t.x+=500*dt;const sweep={from:from-110,to:t.x+45};if(t.x>800)phone.truck=null;return sweep;}
export function inTruckSweep(enemy,sweep){return !!sweep&&enemy.y>=TRUCK_LANE.top&&enemy.y<=TRUCK_LANE.bottom&&enemy.x>=sweep.from&&enemy.x<=sweep.to;}

