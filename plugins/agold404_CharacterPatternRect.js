"use strict";
/*:
 * @plugindesc sprite_chr可設定切掉周圍一些
 * @author agold404
 * @help 調整 Game_Character._patternRect (Sprite_Character會去抓) ( [左界,上界,右界,下界] ，原左上界為 (0,0) ，原右下界為 (1,1) ，線性映射 )
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

{ const p=Game_Character.prototype;
k='initMembers';
r=p[k]; (p[k]=function f(){
	const rtv=f.ori.apply(this,arguments);
	this._patternRect=[0,0,1,1]; // 1,1 = ori pw,ph
	return rtv;
}).ori=r;
(p.patternRect=function f(){
	return this._patternRect||f.tbl.slice();
}).tbl=[0,0,1,1];
}

new cfc(Sprite_Character.prototype).add('initMembers',function f(){
	const rtv=f.ori.apply(this,arguments);
	return rtv;
}).add('patternRect',function(){
	return this._character.patternRect();
},undefined,true,true).add('updateCharacterFrame',function f(){
	this.updateHalfBodySprites();
	const pw=this.patternWidth ();
	const ph=this.patternHeight();
	const sx=(this.characterBlockX()+this.characterPatternX())*pw;
	const sy=(this.characterBlockY()+this.characterPatternY())*ph;
	const rect=this.patternRect();
	const x=sx+~~(pw*rect[0]);
	const y=sy+~~(ph*rect[1]);
	const w=~~((rect[2]-rect[0])*pw);
	const h=~~((rect[3]-rect[1])*ph);
	if(0<this._bushDepth){
		const d=this._bushDepth;
		if(d>=h){
			this._upperBody.setFrame(x, y, 0, ph);
			this._lowerBody.setFrame(x, y, w, h);
		}else{
			this._upperBody.setFrame(x, y, w, h - d);
			this._lowerBody.setFrame(x, y + h - d, w, d);
		}
		this.setFrame(sx, sy, 0, ph);
	}else{
		this.setFrame(x, y, w, h);
	}
},undefined,true,true).add('updateTileFrame',function(){
	const pw=this.patternWidth();
	const ph=this.patternHeight();
	const sx=(((this._tileId>>4)&8)+(this._tileId&7))*pw;
	const sy=(((this._tileId>>3)&15))*ph;
	const rect=this.patternRect();
	const x=sx+~~(pw*rect[0]);
	const y=sy+~~(ph*rect[1]);
	const w=~~((rect[2]-rect[0])*pw);
	const h=~~((rect[3]-rect[1])*ph);
	this.setFrame(x, y, w, h);
},undefined,true,true);

})();
