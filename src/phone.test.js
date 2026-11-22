import test from 'node:test';
import assert from 'node:assert/strict';
import {createPhone,chargePhone,callTruck,stepTruck,inTruckSweep,PHONE_KILLS,TRUCK_LANE} from './phone.js';
test('phone requires fifty kills, caps charge, and consumes one call',()=>{const p=createPhone();assert(!callTruck(p));for(let i=0;i<PHONE_KILLS+10;i++)chargePhone(p);assert.equal(p.charge,50);assert(callTruck(p));assert.equal(p.charge,0);assert(!callTruck(p));assert.equal(stepTruck(p,.5),null);assert.equal(p.truck.phase,'warning');stepTruck(p,.5);assert.equal(p.truck.phase,'driving');});
test('truck sweeps only the middle third and finishes its pass',()=>{const p=createPhone();p.charge=PHONE_KILLS;callTruck(p);stepTruck(p,1);let hits=0;for(let i=0;i<100;i++){const sweep=stepTruck(p,.033);if(inTruckSweep({x:320,y:200},sweep))hits++;assert(!inTruckSweep({x:320,y:TRUCK_LANE.top-1},sweep));assert(!inTruckSweep({x:320,y:TRUCK_LANE.bottom+1},sweep));}assert(hits>0);assert.equal(p.truck,null);});

