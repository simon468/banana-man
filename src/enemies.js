export const specialists={
 coconut:{weapon:'catana',label:'CATANA',name:'Armored Coconut',color:'w',hp:4},
 apple:{weapon:'gun',label:'PISTOL',name:'Iron Apple',color:'r',hp:3},
 pineapple:{weapon:'scatter',label:'BLASTER',name:'Spiked Pineapple',color:'y',hp:5},
 walnut:{weapon:'heavy',label:'CANNON',name:'Iron Walnut',color:'b',hp:6},
 dragonfruit:{weapon:'rail',label:'RAIL',name:'Crystal Dragonfruit',color:'p',hp:5},
 orange:{weapon:'bomber',label:'BOMBER',name:'Blast Orange',color:'h',hp:4}
};
export function enemyKind(wave,roll=Math.random(),ownedWeapons=[],weaponUse={}){
 const owned=Array.isArray(ownedWeapons)?ownedWeapons:ownedWeapons?['catana']:[];const eligible=Object.keys(specialists).filter(kind=>owned.includes(specialists[kind].weapon));
 if(eligible.length){
  const odds=eligible.map(kind=>.16/eligible.length*Math.max(.2,1/(1+Math.max(0,weaponUse[specialists[kind].weapon]||0)/20)));
  const total=odds.reduce((sum,p)=>sum+p,0);let edge=0;
  for(let i=0;i<eligible.length;i++){edge+=odds[i];if(roll<edge)return eligible[i];}
  roll=(roll-total)/(1-total);
 }
 if(wave>=5&&roll<.18)return 'melon';
 if(wave>=3&&roll<.38)return 'cherry';
 if(wave>=2&&roll<.60)return 'lime';
 return wave>=2&&roll>.82?'grape':'tomato';
}
export function makeEnemy(kind,x,y,wave,hasCatana=false,bossRoll=Math.random()){if(kind==='boss'){const kingBanana=wave%20===0,cherryKing=kingBanana&&hasCatana&&bossRoll<.5,hp=(kingBanana?420:240)*Math.pow(1.65,Math.floor(wave/10)-1)*(cherryKing?.5:1);return {kind,kingBanana,cherryKing,name:cherryKing?'CHERRY KING':kingBanana?'KING BANANA':'KING MELON',x,y,r:26,hp,maxHp:hp,speed:kingBanana?38:28,phase:'hunt',timer:1.8,aim:0,attack:0};}const bonus=Math.floor((wave-1)/2)+Math.floor(wave/8);return {kind,x,y,r:specialists[kind]?11:kind==='melon'?14:kind==='seed'?5:kind==='grape'?10:8,hp:(specialists[kind]?.hp||({coconut:4,melon:7,seed:1,lime:2,cherry:3,grape:4,tomato:2}[kind]||2))+bonus,speed:(specialists[kind]?23:({coconut:23,melon:20,seed:36,lime:36,cherry:27,grape:25,tomato:35}[kind]||35))+Math.min(wave*2,35),tough:kind==='grape',phase:'hunt',timer:kind==='cherry'?1.5:1,aim:0};}
export function stepEnemy(e,player,dt,move,shoot){
 const dx=player.x-e.x,dy=player.y-e.y,d=Math.hypot(dx,dy)||1;
 if(e.kind==='boss'){
  e.timer-=dt;const angry=e.hp<e.maxHp*.5,king=e.kingBanana;
  if(e.phase==='windup'){if(e.timer<=0){const attack=e.attack%3;
   if(attack===0){e.phase='charge';e.timer=king?.48:.55;}
   else if(attack===1){const count=king?(angry?18:14):(angry?14:10);for(let i=0;i<count;i++)shoot(e,e.aim+i*Math.PI*2/count);e.ringsLeft=king?2:1;e.ringOffset=0;e.phase='ringFollowup';e.timer=king?.4:.5;}
   else{for(const offset of (king?[-.36,-.24,-.12,0,.12,.24,.36]:[-.24,-.12,0,.12,.24]))shoot(e,e.aim+offset);e.combo=(e.combo||0)+1;if(e.combo<(king?(angry?5:4):(angry?4:3))){e.phase='fanReload';e.timer=.3;}else{e.phase='recover';e.timer=1;}}
  }return;}
  if(e.phase==='ringFollowup'){if(e.timer<=0){const count=king?(angry?18:14):(angry?14:10);for(let i=0;i<count;i++)shoot(e,e.aim+(i+.5+(e.ringOffset||0))*Math.PI*2/count);e.ringOffset=(e.ringOffset||0)+.5;e.ringsLeft--;if(e.ringsLeft>0){e.timer=.4;}else{e.phase='recover';e.timer=1;}}return;}
  if(e.phase==='fanReload'){if(e.timer<=0){e.phase='windup';e.timer=.45;e.aim=Math.atan2(dy,dx);}return;}
  if(e.phase==='charge'){move(e,Math.cos(e.aim)*(king?265:220)*dt,Math.sin(e.aim)*(king?265:220)*dt);if(e.timer<=0){if((e.combo||0)<(king?(angry?2:1):(angry?1:0))){e.combo=(e.combo||0)+1;e.phase='windup';e.timer=.6;e.aim=Math.atan2(player.y-e.y,player.x-e.x);}else{e.phase='recover';e.timer=1;}}return;}
  if(e.phase==='recover'){if(e.timer<=0){e.phase='hunt';e.timer=angry?.7:1.2;e.attack++;}return;}
  if(e.timer<=0){e.phase='windup';e.timer=angry?.7:.95;e.combo=0;e.aim=Math.atan2(dy,dx);return;}
  move(e,dx/d*e.speed*dt,dy/d*e.speed*dt);return;
 }
 if(e.kind==='lime'||e.kind==='seed'){
  e.timer-=dt;
  if(e.phase==='windup'){if(e.timer<=0){e.phase='charge';e.timer=.42;}return;}
  if(e.phase==='charge'){move(e,Math.cos(e.aim)*220*dt,Math.sin(e.aim)*220*dt);if(e.timer<=0){e.phase='recover';e.timer=.7;}return;}
  if(e.phase==='recover'){if(e.timer<=0){e.phase='hunt';e.timer=1.1;}return;}
  if(e.timer<=0&&d<220){e.phase='windup';e.timer=.65;e.aim=Math.atan2(dy,dx);return;}
 }
 if(e.kind==='cherry'){
  e.timer-=dt;
  if(e.phase==='windup'){if(e.timer<=0){shoot(e,e.aim);e.phase='hunt';e.timer=1.9;}return;}
  if(e.timer<=0&&d<300){e.phase='windup';e.timer=.7;e.aim=Math.atan2(dy,dx);return;}
  const direction=d<100?-1:d>165?1:0;move(e,dx/d*e.speed*dt*direction,dy/d*e.speed*dt*direction);return;
 }
 move(e,dx/d*e.speed*dt,dy/d*e.speed*dt);
}
export const enemyPixels={
 cherryBoss:[
 '.......y...y...y.......',
 '.......yy.yyy.yy.......',
 '.......oyyc yyyo.......'.replace(' ',''),
 '........oyyyyo.........',
 '.........gggg..........',
 '.......ggg..ggg........',
 '......gg......gg.......',
 '....ooooo....ooooo.....',
 '...orhhhr o..orhh hro...'.replaceAll(' ',''),
 '..orhhrrrr o orrrhh rro.'.replaceAll(' ',''),
 '.orhhrrrrrroorrrrrhhro..',
 'orrrmmmrrrrrrrmmmrrrro..',
 'orrmowwomrrrrmowwomrro.',
 'orrmoo oomrrrrmoo oomro.'.replaceAll(' ',''),
 'orrrmmmrrrrrrrmmmrrrro..',
 '.orrrrorrrorrrorrrrro...',
 '..orrrroooorroorrrro....',
 '...orrrrryyrrrrrro.....',
 '....oooooyyoooooo......',
 '.....opppppppppo.......',
 '....opppppppppppo......',
 '...ooo..ooo..oooo......'],
 bananaBoss:['.......r...r...r...','.......rr.rrr.rr...','........rrrrrrr....','.........oyhhyo....','........oyhhhyo....','.......oyhhhyo.....','......oyhhhyo......','.....oyhhhyo.......','....oyowwoyo.......','...oyyoooyo........','..oyyyyyyo.........','.oyhhyyyo..........','oyhhhhyyoooooo.....','oyhhhyyyyyyyhyo....','.oyyyyyyyyyhyo.....','..obbbbbbbboo......','...ooooooo.........'],
 boss:['...y...y...y...','...yy.yyy.yy...','...oyyyyyyyo...','..oogdgdgdgoo..','.ogdhhgdghhdgo.','ogdhhhgdghhgdgo','ogdgdgdgdgdgdgo','ogooowgogwooodo','ogdwwogogwwgdgo','ogdooogogooogdo','ogdgdgdgdgdgdgo','.ogdorrorrorgd.','..ogorrrrrogo..','...ogooooogo...','....oogdgoo....','...ooo...ooo...'],
 coconut:['.....wwwww.....','...wwpppppww...','..wppwwwwwppw..','.wppwwwwwwwppw.','owppoooooooppwo','owppowwowwoppwo','owppoooooooppwo','.wpppppppppppw.','..wppwwwwwppw..','...owpppppwo...','..oboowwwoobo..','..ooo.....ooo..'],
 lime:['.....ggg.....','...oggggo....','..oghhgggo...','.oghhhggggo..','oggggggggggo.','ogowwogowwgo.','ogoooogooogo.','.oggggggggo..','..oggooogo...','...oooooo....'],
 cherry:['......gg.....','.....gggg....','....gg..gg...','..ooo....ooo.','.orrrro.orrrro','orhhrrrorhhrrro','orrwwrrorrwwrro','orroorrorroorro','.orrro..orrro.','..ooo....ooo..'],
 melon:['....ooooooo....','..oogdgdgdgoo..','.ogdgdgdgdgdgo.','ogdghghgdgdgdgo','ogdghghgdgdgdgo','ogdgdgdgdgdgdgo','ogwwogdgdgowwgo','ogooogdgdgooogo','ogdgdgdgdgdgdgo','.ogdgdoodgdgo..','..oogdgdgdoo...','....ooooooo....'],
 seed:['..ooo..','.oyyyo.','oywwyyo','oyoooyo','.oyyyo.','..ooo..']
};


// Hand-pixeled armored fruit: individual profiles, material highlights and gear.
export const enemyPalette={m:'#91a6b5',s:'#d6e4e7',k:'#475b70',c:'#68e4eb',f:'#f59b43',t:'#d7ac78',n:'#795035'};
Object.assign(enemyPixels,{
 apple:[
 '........ngg......','.......nggg......','....oooo.oooo....','...orrroorrhro...','..orrhrrrrhhro...','.orrhhrrrrrrrro..','.ormmmmmmmmmrro..','ormssssmssssmro..','ormoowwomwwoomro.','ormkkkkmkkkkmro..','.ormmmmmmymmmro..','.orrrrmmmyrrro...','..orrrrmmrrro....','...orrrrrrro.....','....ookokoo......','....omk.omk......','....ooo.ooo......'],
 pineapple:[
 '....g...g...g....','....gg.ggg.gg....','.....gggdggg.....','.....ogdgdgo.....','....ooyyyyoo.....','...oybybybyyo....','..oybyhyhybyyo...','.boybybybybyyob..','..ommmmmm mmmo...'.replace(' ',''),'.bomowwomwwomob..','..omkkkkkkkkmo...','.boybybybybyyob..','..oybyhyhybyyo...','.boybybybybyyob..','...oybybybyyo....','....ookokoo......','....ok...ko......'],
 walnut:[
 '......ooooo......','....oontntnoo....','...ontntntntno...','..onttnntnnttno..','.onttnnntnnnttno.','ommmmttntttmmmmmo','omssmttntttmssmmo','omkomoowwoomokmmo','omkomoowwoomokmmo','omssmttntttmssmmo','ommmmttntttmmmmmo','.onttnnntnnnttno.','..onttnntnnttno..','...ontntntntno...','....oonnntnoo....','.....okkkko......','....ook..koo.....'],
 dragonfruit:[
 '........c........','...g...csc...g...','...gg..csc..gg...','....ggoocoogg....','...ogpppppppgo...','..ogpphhphhppgo..','.ogpppppppppppgo.','gopppmmsssm mppog'.replace(' ',''),'.opppmowwowmpppo.','.opppmooooompppo.','gopppmmcccmmpppog','.ogppppcscppppgo.','..ogpppcscpppgo..','...ogpppcpppgo...','....ogpppppgo....','.....ookokoo.....','.....ok...ko.....'],
 orange:[
 '.......gn........','......gggn.......','.....oooooooo....','...ooffffffffoo..','..offfhffffhfffo.','.offhhffffhhfffo.','offffffmmmmfffffo','offfffmssssmffffo','offffmowwwomffffo','offffmooooomffffo','offfffmssssmffffo','offffffmmmmfffffo','.offffkffkfffffo.','..offkkffkkfffo..','...offfkkffffo...','....ookkkkoo.....','....ok....ko.....'],
 coconut:[
 '....o.......o....','....om.....mo....','.....ommmmmo.....','....omsssssmo....','...omsssssssmo...','..ommmmmmmmmmmo..','.ontmmrrrrrmmtn o'.replace(' ',''),'.ontmoowwwoom tno'.replace(' ',''),'.ontmkoooookmtno.','.ontnmmmmmmmntno.','.ontntnnnntnttno.','..ontntnnntntno..','...onttnnnttno...','....oontntnoo....','.....okkkko......','....omk.omk......','....ooo.ooo......']
});

export function coinDropChance(enemy){if(specialists[enemy.kind])return .5;return {tomato:.2,seed:.2,lime:.3,cherry:.35,grape:.4,melon:.6}[enemy.kind]??.2;}
