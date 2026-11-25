import * as permanentTools from './permanent.js';
import {createUpgradeSprites} from './upgrade-art.js';
import * as catanaTools from './catana.js';
import * as phoneTools from './phone.js';
import {enemyKind,makeEnemy,stepEnemy,enemyPixels,specialists,coinDropChance,enemyPalette} from './enemies.js';
import {guns,gunVolley} from './guns.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import * as progression from './upgrades.js';
import * as boomerang from './bananarang.js';
import {createMenus,renderBuildIcons} from './menus.js';
import {createWeaponSprites} from './weapon-art.js';
test('wave clear pauses for exactly one choice; weapons, shields and reset work',()=>{
 const drawing=new Proxy({},{get:()=>()=>{}});
 const element=()=>({style:{setProperty(){}},classList:{add(){},remove(){}},getContext:()=>drawing,addEventListener(){},setAttribute(){},append(){},before(){},querySelectorAll:()=>[],querySelector:()=>({focus(){}})});
 const elements=new Map();const document={getElementById:id=>{if(!elements.has(id))elements.set(id,element());return elements.get(id);},createElement:element,addEventListener(){}};
 const sandbox={...permanentTools,createUpgradeSprites,...catanaTools,...phoneTools,enemyKind,makeEnemy,stepEnemy,enemyPixels,specialists,coinDropChance,enemyPalette,guns,gunVolley,createWeaponSprites,createMenus,renderBuildIcons,...progression,...boomerang,document,innerWidth:1280,innerHeight:800,addEventListener(){},matchMedia:()=>({matches:false}),performance:{now:()=>0},requestAnimationFrame(){},localStorage:{getItem:()=>null,setItem(){}},createFunkTrack(){},console};
 vm.createContext(sandbox);vm.runInContext(fs.readFileSync(new URL('./game.js',import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,''),sandbox);
 const run=code=>vm.runInContext(code,sandbox);
 assert.equal(run('mode'),'intro');
 run('frame(0);continueIntro()');assert.equal(run('mode'),'intro');
 run('frame(500)');assert.equal(elements.get('intro-message').style.opacity,'0.5');assert.equal(run('introReady'),false);
 run('frame(999)');assert.equal(run('introReady'),false);
 run('frame(1000)');assert.equal(run('introReady'),true);assert.equal(elements.get('intro-message').hidden,false);
 run('continueIntro()');assert.equal(run('mode'),'intro');assert.equal(run('introStage'),'logo');assert.equal(elements.get('intro-message').hidden,true);assert.equal(elements.get('intro-logo').hidden,false);
 run('continueIntro();frame(1100);frame(1399)');assert.equal(run('introReady'),false);
 run('frame(1400);continueIntro()');assert.equal(run('mode'),'tutorialPrompt');assert.equal(elements.get('intro').style.display,'none');assert.equal(elements.get('game').inert,false);assert.equal(elements.get('overlay').hidden,false);
 elements.get('tutorial-no').onclick();assert.equal(run('mode'),'title');assert.equal(run('tutorial'),null);
 run('sound=false;showTutorialPrompt()');elements.get('tutorial-yes').onclick();assert.equal(run('mode'),'playing');assert.equal(run('tutorial.step'),0);assert.equal(run('runActive'),false);
 run('returnToMenu();sound=true');
 run('musicTrack={setPlaying(value){this.playing=value;}}');
 for(const screen of ['title','playing','paused','upgrade','over','tutorialDone']){run('mode='+JSON.stringify(screen)+';syncMusic()');assert.equal(run('musicTrack.playing'),true);}
 run("mode='intro';introStage='disclaimer';syncMusic()");assert.equal(run('musicTrack.playing'),false);
 run("introStage='logo';syncMusic()");assert.equal(run('musicTrack.playing'),false);
 run("mode='title';musicStartAt=.65;audioContext={currentTime:.64};syncMusic()");assert.equal(run('musicTrack.playing'),false);
 run('audioContext.currentTime=.65;syncMusic()');assert.equal(run('musicTrack.playing'),true);
 run('audioContext=undefined;musicStartAt=0');
 run('musicEnabled=false;syncMusic()');assert.equal(run('musicTrack.playing'),false);
 run('musicEnabled=true;document.hidden=true;syncMusic()');assert.equal(run('musicTrack.playing'),false);
 run('document.hidden=false;sound=false;syncMusic()');assert.equal(run('musicTrack.playing'),false);
 run("sound=false;start();update(.6)");assert.equal(run('wave'),1);assert.equal(run('mode'),'playing');
 run('score=300;pause()');assert.equal(run('mode'),'paused');const frozen=run('enemies[0].x');run('update(1)');assert.equal(run('enemies[0].x'),frozen);run('resume()');assert.equal(run('mode'),'playing');assert.equal(run('score'),300);
 run('remaining=0;enemies.length=0;update(.01)');assert.equal(run('mode'),'upgrade');assert.equal(run('draft.length'),3);
 run('update(10)');assert.equal(run('wave'),1);
 run("coins=2;health=1;build.regen=1");const prior=run('draft.map(u=>u.id).join()');run('rerollUpgrades()');assert.equal(run('coins'),1);assert.equal(run('health'),1);assert.equal(run('wave'),1);assert.notEqual(run('draft.map(u=>u.id).join()'),prior);
 run('rerollUpgrades();rerollUpgrades()');assert.equal(run('coins'),0);assert.equal(run('mode'),'upgrade');
 run("pickups.push({kind:'coin',x:0,y:0,life:Infinity},{kind:'coin',x:1,y:1,life:Infinity});collectWaveCoins()");assert.equal(run('coins'),2);
 
 run("draft=[upgrades.find(u=>u.id==='scatter')];chooseUpgrade(0);chooseUpgrade(0)");assert.equal(run('build.scatter'),1);assert.equal(run('weapon'),'scatter');
 run('update(.9)');assert.equal(run('wave'),2);assert.equal(run('mode'),'playing');
 run("bullets.length=0;fireGun()");assert.equal(run('bullets.length'),5);
 run("applyUpgrade(build,'heavy');selectWeapon('heavy');bullets.length=0;fireGun()");assert.equal(run('bullets[0].damage'),3);
 run("remaining=0;enemies.length=0;update(.01);draft=[upgrades.find(u=>u.id==='shield')];chooseUpgrade(0);update(.9)");assert.equal(run('shield'),2);
 run('start()');assert.equal(run('wave'),0);assert.equal(run('weapons(build).length'),2);assert.equal(run('stats(build).damage'),1);assert.equal(run('shield'),0);
 run('score=1200;pause();returnToMenu()');assert.equal(run('mode'),'title');assert.equal(run('best'),1200);assert.equal(run('enemies.length'),0);run('start()');assert.equal(run('score'),0);assert.equal(run('best'),1200);
 run("applyUpgrade(build,'rail');applyUpgrade(build,'bomber')");
 run("bullets.length=0;enemies.length=0;remaining=1;spawnClock=100;player.x=50;player.y=200;player.angle=0;selectWeapon('rail');for(const x of [100,130,160,190,220])enemies.push({x,y:200,r:8,hp:100,speed:0});fireGun();for(let i=0;i<12;i++)update(.033)");
 assert.equal(run('enemies.filter(e=>e.hp===97.5).length'),4);assert.equal(run('enemies[4].hp'),100);
 run("enemies.length=0;for(const x of [300,320,380])enemies.push({x,y:200,r:8,hp:100,speed:0});explodeBanana({x:300,y:200,damage:2})");assert.equal(run('enemies[0].hp'),98);assert.equal(run('enemies[1].hp'),98);assert.equal(run('enemies[2].hp'),100);
 run('start()');assert.equal(run('weapons(build).length'),2);
 run("wave=5;remaining=0;enemies.length=0;const melon=makeEnemy('melon',300,200,5);enemies.push(melon);damageEnemy(melon,{damage:100,vx:1,vy:0})");assert.equal(run("enemies.filter(e=>e.kind==='seed').length"),2);run('update(.01)');assert.equal(run('mode'),'playing');
 run('health=4;shield=1;invincible=0;enemyShots.push({x:player.x,y:player.y,vx:0,vy:0,life:1});updateEnemyShots(.01)');assert.equal(run('shield'),0);assert.equal(run('health'),4);assert.equal(run('enemyShots.length'),0);
 run("start();sound=false;phone.charge=PHONE_KILLS;enemies.push(makeEnemy('melon',320,200,5),makeEnemy('tomato',320,80,5));activatePhone();pause();update(1)");assert.equal(run('phone.truck.phase'),'warning');run('resume();for(let i=0;i<100;i++)updatePhone(.033)');assert.equal(run('enemies.length'),1);assert.equal(run('enemies[0].y'),80);assert.equal(run('phone.charge'),0);assert.equal(run('health'),4);assert.equal(run('phone.truck'),null);
 for(const id of ['gun','catana']){
  run("startingWeapon='"+id+"';start()");assert.equal(run('weapon'),id);assert.equal(run('weapons(build).length'),2);assert.equal(run('weaponLevel(build,weapon)'),1);
  run('applyUpgrade(build,weapon);start()');assert.equal(run('weaponLevel(build,weapon)'),1);
 }
 run("startingWeapon='rail';start()");assert.equal(run('weapon'),'gun');assert.equal(run('weapons(build).length'),2);
 run("startingWeapon='gun'");
 run('phone.charge=12;start()');assert.equal(run('phone.charge'),0);assert.equal(run('coins'),0);
 run("applyUpgrade(build,'gun');fireGun()");assert.equal(run('bullets[0].damage'),1.25);assert.equal(run('shot'),.19/1.1);
 run("applyUpgrade(build,'rang');selectWeapon('rang');shot=.5;activateBananarang()");assert.equal(run('rang.damage'),1.25);assert.equal(run('rang.speedMultiplier'),1.1);assert.equal(run('weapon'),'gun');assert.equal(run('shot'),.5);assert.equal(run('selectableWeapons().includes("rang")'),false);run('activateBananarang()');assert.equal(run('rang.damage'),1.25);
 run("goldenMode=true;start()");assert.equal(run('build.golden'),undefined);
 run("permanent.levels.goldenMode=1;start();update(.6)");assert.equal(run('build.golden'),true);assert.equal(run('weaponLevel(build,weapon)'),5);assert.equal(run('enemies[0].hp'),run('makeEnemy(enemies[0].kind,0,0,1).hp*2'));assert.equal(run('remaining'),10);
 run("remaining=0;enemies.length=0;update(.01)");assert.equal(run('mode'),'upgrade');run('coins=14;permanent.diamonds=0');const goldBefore=run('permanent.gold');run('returnToMenu();returnToMenu()');assert.equal(run('permanent.diamonds'),2);assert.equal(run('permanent.gold'),goldBefore);
 run("permanent.diamondLevels.heart=1;start()");assert.equal(run('health'),5);run("goldenMode=false;start()");assert.equal(run('health'),4);
 run("goldenMode=false");
 run('start();permanent.gold=0;coins=14;gameOver()');assert.equal(run('permanent.gold'),2);run('returnToMenu()');assert.equal(run('permanent.gold'),2);run('start()');assert.equal(run('coins'),0);
 run('coins=10;start()');assert.equal(run('permanent.gold'),4);run('returnToMenu();returnToMenu()');assert.equal(run('permanent.gold'),4);
 run('start()');assert.equal(run("weaponLevel(build,'gun')"),1);assert.equal(run("weaponLevel(build,'rang')"),1);
 run("goofyMode=true;startingWeapon='catana';start()");assert.equal(run('health'),50);assert.equal(run('shield'),12);assert.equal(run('weapons(build).length'),7);assert(run('weapons(build).every(id=>weaponLevel(build,id)===5)'));
 run('wave=1;remaining=0;enemies.length=0;health=1;waveDelay=.01;update(.02)');assert.equal(run('mode'),'playing');assert.equal(run('wave'),2);assert.equal(run('health'),50);
 run('for(let i=0;i<100;i++)burst(100,100,colors.y,26)');assert(run('particles.length<=350'));
 run("goofyMode=false;startingWeapon='catana';start();enemies.push(makeEnemy('coconut',350,200,1))");
 for(const attack of ["{damage:99,vx:1,vy:0}","{kind:'rail',damage:99,vx:1,vy:0}","{truck:true,damage:999,vx:1,vy:0}"]){run('damageEnemy(enemies[0],'+attack+')');assert.equal(run('enemies[0].hp'),4);}
 run('explodeBanana({x:350,y:200,damage:99})');assert.equal(run('enemies[0].hp'),4);
 run("damageEnemy(enemies[0],{kind:'catana',damage:4,vx:1,vy:0})");assert.equal(run('enemies.length'),0);assert.equal(run('kills'),1);
 for(const [kind,info] of Object.entries(specialists)){
  run("enemies.length=0;enemies.push(makeEnemy('"+kind+"',350,200,1))");const hp=run('enemies[0].hp');
  for(const id of [...progression.weaponIds,'truck'])if(id!==info.weapon){run("damageEnemy(enemies[0],{kind:'"+id+"',damage:999,vx:1,vy:0})");assert.equal(run('enemies[0].hp'),hp);}
  run("damageEnemy(enemies[0],{kind:'"+info.weapon+"',damage:999,vx:1,vy:0})");assert.equal(run('enemies.length'),0);
 }
 run("enemies.push(makeEnemy('orange',350,200,1));explodeBanana({x:350,y:200,damage:99})");assert.equal(run('enemies.length'),0);
 run("goofyMode=false;startingWeapon='gun';start()");assert.equal(run('health'),4);assert.equal(run('shield'),0);assert.equal(run('weapons(build).length'),2);
 run('permanent.gold=99;permanent.diamonds=88;permanent.levels.goldenMode=1;permanent.diamondLevels.heart=5;coins=100;score=5000;best=9000;resetProgress()');
 assert.equal(run('mode'),'title');assert.equal(run('permanent.gold'),0);assert.equal(run('permanent.diamonds'),0);assert.equal(run('best'),0);assert.equal(run('coins'),0);assert.equal(run('runActive'),false);assert(run('Object.values(permanent.levels).every(v=>v===0)'));assert(run('Object.values(permanent.diamondLevels).every(v=>v===0)'));run('start()');assert.equal(run('health'),4);assert.equal(run('permanent.gold'),0);

 run("startingWeapon='catana';start();remaining=1;spawnClock=100;player.x=320;player.y=200;enemyShots.push({x:350,y:200,vx:-135,vy:0,life:4});catanaMoves.push([-.3,.3,.05]);updateCatana(.016)");
 assert.equal(run('enemyShots.length'),0);assert.equal(run('bullets.length'),1);assert.equal(run('bullets[0].batted'),true);assert(run('bullets[0].vx>360'));assert.equal(run('bullets[0].kind'),'catana');
 run("enemies.push(makeEnemy('cherry',390,200,1));for(let i=0;i<10;i++)update(.016)");assert.equal(run('kills'),1);assert.equal(run('health'),4);
 run("start();remaining=1;spawnClock=100;enemyShots.push({x:350,y:200,vx:0,vy:0,life:4});bullets.push({x:340,y:200,vx:360,vy:0,life:1,angle:0,damage:1,radius:3,kind:'gun',hitEnemies:new Set()});update(.03)");assert.equal(run('enemyShots.length'),0);
 run("enemyShots.push({x:350,y:200,vx:0,vy:0,life:4});explodeBanana({x:350,y:200,damage:2})");assert.equal(run('enemyShots.length'),0);

 for(const bossWave of [10,20]){run('start();wave='+ (bossWave-1)+';rewardedWave=wave;remaining=0;waveDelay=0;update(.01)');assert.equal(run('enemies.length'),1);assert.equal(run('enemies[0].kind'),'boss');assert.equal(run('remaining'),0);assert.equal(run('mode'),'playing');run("damageEnemy(enemies[0],{batted:true,damage:99999,vx:0,vy:0});update(.01)");assert.equal(run('mode'),'upgrade');assert.equal(run('coins'),5);}

 run("bossLoadout=['heavy','rail','catana'];startBoss()");assert.equal(run('wave'),10);assert.equal(run('weapon'),'heavy');assert.equal(run('selectableWeapons().length'),3);assert.equal(run('build.rang'),1);assert.equal(run('enemies.length'),1);assert.equal(run('enemies[0].kind'),'boss');assert.equal(run('remaining'),0);
 run("returnToMenu();bossLoadout=['gun'];startBoss()");assert.equal(run('mode'),'title');

 run("selectedSecondary='bombnana';startingWeapon='gun';start();remaining=1;spawnClock=100;activateSecondary()");assert.equal(run('build.rang'),undefined);assert.equal(run('build.bombnana'),1);assert.equal(run('weapon'),'gun');assert.equal(run('selectableWeapons().includes("bombnana")'),false);
 const placedX=run('bombnana.x');run('player.x+=80;updateBombnana(.5)');assert.equal(run('bombnana.x'),placedX);assert.equal(run('bombnana.fuse'),.5);
 run('pause();update(2)');assert.equal(run('bombnana.fuse'),.5);run('resume()');
 run("enemies.push(makeEnemy('tomato',bombnana.x+20,bombnana.y,1),makeEnemy('tomato',bombnana.x+120,bombnana.y,1));activateSecondary();updateBombnana(.5)");assert.equal(run('bombnana'),null);assert.equal(run('enemies.length'),1);assert.equal(run('health'),4);run('activateSecondary()');assert.equal(run('bombnana'),null);
 run('updateBombnana(2);activateSecondary()');assert(run('!!bombnana'));run('start()');assert.equal(run('bombnana'),null);
 for(let i=0;i<20;i++)assert(run('draftUpgrades(build).every(u=>u.id!=="rang"&&u.id!=="pierce")'));
 run("selectedSecondary='rang';start();activateSecondary()");assert(run('!!rang'));assert.equal(run('build.bombnana'),undefined);

 run("start();enemies.push(makeEnemy('coconut',350,200,1));damageEnemy(enemies[0],{kind:'gun',damage:1,vx:0,vy:0})");assert.equal(run('weaponUse.gun'),undefined);
 run("damageEnemy(enemies[0],{kind:'catana',damage:1,vx:0,vy:0})");assert.equal(run('weaponUse.catana'),1);
 run('start()');assert.equal(run('Object.keys(weaponUse).length'),0);

 run("practiceBoss='banana';bossLoadout=['gun','catana','rail'];startBoss()");assert.equal(run('wave'),20);assert(['KING BANANA','CHERRY KING'].includes(run('enemies[0].name')));assert.equal(run('selectableWeapons().length'),3);
 run("practiceBoss='melon';startBoss()");assert.equal(run('wave'),10);assert.equal(run('enemies[0].name'),'KING MELON');

 run("start();enemies.push(makeEnemy('boss',350,200,20,true,0))");const cherryHp=run('enemies[0].hp');
 for(const kind of ['gun','catana','bomber','bombnana','rang']){run("damageEnemy(enemies[0],{kind:'"+kind+"',damage:999,vx:1,vy:0})");assert.equal(run('enemies[0].hp'),cherryHp);}
 run('damageEnemy(enemies[0],{truck:true,damage:99999,vx:1,vy:0})');assert.equal(run('enemies[0].hp'),cherryHp);
 run("damageEnemy(enemies[0],{kind:'catana',batted:true,damage:10,vx:1,vy:0})");assert.equal(run('enemies[0].hp'),cherryHp-10);

 run("practiceBoss='cherry';bossLoadout=['gun','catana','rail'];startBoss()");assert.equal(run('enemies[0].name'),'CHERRY KING');
 run("practiceBoss='banana';startBoss()");assert.equal(run('enemies[0].name'),'KING BANANA');
 run("returnToMenu();practiceBoss='cherry';bossLoadout=['gun','rail','heavy'];startBoss()");assert.equal(run('mode'),'title');

 run("selectedSecondary='rang';startTutorial()");assert.equal(run('tutorial.step'),0);assert.equal(run('runActive'),false);run('player.x+=60;updateTutorial()');assert.equal(run('tutorial.step'),1);
 run('dashing=.1;updateTutorial()');assert.equal(run('tutorial.step'),2);assert.equal(run('enemies[0].training'),true);
 run("damageEnemy(enemies[0],{kind:'gun',damage:1,vx:0,vy:0});updateTutorial();selectWeapon('catana');updateTutorial()");assert.equal(run('tutorial.step'),4);
 run("damageEnemy(enemies[0],{kind:'catana',damage:1,vx:0,vy:0});updateTutorial();activateSecondary();updateTutorial()");assert.equal(run('mode'),'tutorialDone');assert.equal(run('coins'),0);run('returnToMenu()');assert.equal(run('tutorial'),null);

});




