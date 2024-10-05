"use strict";
/*:
 * @plugindesc 掃描線換圖
 * @author agold404
 * @help $gameParty.members()[0].getSprite().switchToBmp_hLine(ImageManager.loadNormalBitmap('img/sv_actors/Actor2_4.png'),123,123,-123);
 * $gameTroop.members()[0].getSprite().switchToBmp_vLine(ImageManager.loadNormalBitmap('img/sv_enemies/Bat.png'),123,-234,234);
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

new cfc(Sprite.prototype).add('_switchToBmp_defaultCallback',(self,info)=>{
	if(info.keep) return;
	self.bitmap=info.sp.bitmap;
	info.sp.destroy();
	self.drawMask_clear();
	self._switchToBmp_splitInfo=undefined;
}).add('_switchToBmp',function f(direction,newBmp,dur,from,to,willKeep,callback_this_info){
	if(!this.parent) return;
	if(this._switchToBmp_sp) this._switchToBmp_sp.destroy();
	const info=this._switchToBmp_splitInfo={
		dur:0,
		durMax:dur,
		dir:direction,
		from:from,
		to:to,
		sp:new Sprite(newBmp),
		bmpWH:undefined,
		keep:willKeep,
		callback:callback_this_info||this._switchToBmp_defaultCallback,
	};
	newBmp.addLoadListener(f.tbl[0].bind(info));
	if(this._switchToBmp_spLast) this.removeChild(this._switchToBmp_spLast);
	this.parent.addChild(this._switchToBmp_spLast=info.sp);
	this.switchToBmp_updateNewBitmapSprite(info);
	return info;
},[
function(bmp){ this.bmpWH={W:bmp.width,H:bmp.height,}; }, // 0: tell w,h
]).add('switchToBmp_updateNewBitmapSprite',function f(info){
	for(let x=0,arr=f.tbl[0],xs=arr.length;x!==xs;++x){
		const attr=this[arr[x]];
		info.sp[arr[x]].set(attr.x,attr.y);
	}
	this.switchToBmp_updateFrame(info);
},[
['position','scale','anchor',],
]).add('switchToBmp_updateFrame',function f(info,frm,bmp){
	frm=frm||this._frame;
	bmp=bmp||this.bitmap;
	if(bmp&&info.bmpWH){
		const rx0=frm.x/bmp.width,rx1=(frm.x+frm.width)/bmp.width;
		const ry0=frm.y/bmp.height,ry1=(frm.y+frm.height)/bmp.height;
		const x=info.bmpWH.W*rx0;
		const y=info.bmpWH.H*ry0;
		info.sp.setFrame(x,y,info.bmpWH.W*rx1-x,info.bmpWH.H*ry1-y);
	}else info.sp.setFrame(frm.x,frm.y,frm.width,frm.height);
}).add('switchToBmp_vLine',function f(newBmp,dur,from,to,willKeep,callback){
	return this._switchToBmp('x',newBmp,dur,from,to,willKeep,callback);
}).add('switchToBmp_hLine',function f(newBmp,dur,from,to,willKeep,callback){
	return this._switchToBmp('y',newBmp,dur,from,to,willKeep,callback);
}).add('update',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.update_switchToBmp();
	return rtv;
}).add('update_switchToBmp',function f(){
	const info=this._switchToBmp_splitInfo;
	if(!info||!(++info.dur<info.durMax)) return info&&info.sp&&info.callback&&info.callback(this,info);
	const key=f.tbl[0][info.dir];
	if(key) this[key](info,(info.dur/info.durMax)*(info.to-info.from)+info.from);
	this.switchToBmp_updateNewBitmapSprite(info);
},[
{x:'_update_switchToBmp_x',y:'_update_switchToBmp_y'},
]).add('_update_switchToBmp_x',function f(info,d){
	const x=d;
	const H=Graphics.height;
	if(info.to<info.from){
		info.sp.drawMask_set(x,-H,info.from-x,H<<1);
		this.drawMask_set(info.to,-H,x-info.to,H<<1);
	}else{
		info.sp.drawMask_set(info.from,-H,x-info.from,H<<1);
		this.drawMask_set(x,-H,info.to-x,H<<1);
	}
}).add('_update_switchToBmp_y',function f(info,d){
	const y=d;
	const W=Graphics.width;
	if(info.to<info.from){
		info.sp.drawMask_set(-W,y,W<<1,info.from-y);
		this.drawMask_set(-W,info.to,W<<1,y-info.to);
	}else{
		info.sp.drawMask_set(-W,info.from,W<<1,y-info.from);
		this.drawMask_set(-W,y,W<<1,info.to-y);
	}
});

new cfc(Sprite_Battler.prototype).add('switchToBmp_updateFrame',function f(info){
	const frm=this._effectTarget._frame;
	return Sprite.prototype.switchToBmp_updateFrame.call(this,info,frm,this._effectTarget.bitmap);
}).add('_switchToBmp_defaultCallback',(self,info)=>{
	if(info.keep) return;
	self._effectTarget.bitmap=info.sp.bitmap;
	info.sp.destroy();
	self.drawMask_clear();
	self._switchToBmp_splitInfo=undefined;
});

})();
