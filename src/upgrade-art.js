// Small original pixel glyphs, cached once like weapon sprites.
export const upgradeArt={
 pierce:['.......y.','......yy.','..o..yyy.','..o.yyy..','..oyyy...','..yyy.o..','.yyy..o..','yyy...o..','.y.......'],
 damage:['....r....','r..rrr..r','.rrrrrrr.','..rrhrr..','.rrhhrrr.','..rrhrr..','.rrrrrrr.','r..rrr..r','....r....'],
 haste:['.....y...','....yy...','...yy....','..yyyyyy.','....yyy..','...yyy...','..yyy....','..yy.....','.y.......'],
 heart:['.rr...rr.','rrrr.rrrr','rrhrrrrrr','rrrrrrrrr','.rrrrrrr.','..rrrrr..','...rrr...','....r....'],
 shield:['.ccccccc.','.chhhhcc.','.chccccc.','.ccccccc.','..ccccc..','..ccccc..','...ccc...','....c....'],
 speed:['...yyy...','...yhy...','...yyy...','...yyy...','.yyyyyyy.','.yhyyyyy.','.yyyyyyy.','.ooooooo.'],
 dash:['y........','.y...c...','..y...c..','yyyy...c.','..y...c..','.y...c...','y........'],
 regen:['....g....','...ggg...','....g....','..ggggg..','.gg...gg.','gg..g..gg','.g.ggg.g.','.g..g..g.','..ggggg..'],
 knockback:['y..rr....','.y.rrr...','..yrrrr..','yyyrrrrrr','..yrrrr..','.y.rrr...','y..rr....'],
 heal:['......c..','.....c...','..wwwww..','..wpppw..','..wphpw..','..wpppw..','...wpw...','...www...']
};
export function createUpgradeSprites(drawSprite,colors){return Object.fromEntries(Object.entries(upgradeArt).map(([id,rows])=>[id,drawSprite(rows,{...colors,c:'#78e4ed'})]));}
