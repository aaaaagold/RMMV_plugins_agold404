"use strict";
/*:
 * @plugindesc manually set screen offset
 * @author agold404
 * @help $gameScreen.getManualOffset(id);
 * $gameScreen.setManualOffset(id,x,y);
 * $gameScreen.getManualOffsetCache();
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

new cfc(Game_Screen.prototype).addBase('_manualOffset_getCont',function f(){
	let rtv=this._manualOffsets; if(!rtv){ rtv=this._manualOffsets=[]; }
	if(!this._manualOffsets_cache) this._manualOffset_refreshCache();
	return rtv;
}).addBase('_manualOffset_refreshCache',function f(){
	const c=this._manualOffsets_cache={x:0,y:0,};
	const cont=this._manualOffsets; if(!cont) return;
	for(let i=cont.length;i--;){
		const xy=cont.kvGetVal(cont.kvGetKey(i));
		c.x+=xy[0];
		c.y+=xy[1];
	}
}).addBase('getManualOffsetCache',function f(){
	if(!this._manualOffsets_cache) this._manualOffset_refreshCache();
	return this._manualOffsets_cache;
}).addBase('setManualOffset',function f(id,x,y){
	const cont=this._manualOffset_getCont();
	x=x-0||0;
	y=y-0||0;
	const cache=this.getManualOffsetCache();
	if(!x&&!y){
		const xy=cont.kvGetVal(id);
		cont.kvPop(id);
		cache.x-=xy&&xy[0]-0||0;
		cache.y-=xy&&xy[1]-0||0;
		return this;
	}
	if(cont.kvHas(id)){
		const xy=cont.kvGetVal(id);
		cache.x+=x-xy[0];
		cache.y+=y-xy[1];
		xy[0]=x;
		xy[1]=y;
	}else{
		cont.kvPush(id,[x,y]);
		cache.x+=x;
		cache.y+=y;
	}
	return this;
});

new cfc(Spriteset_Base.prototype).add('updatePosition',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.updatePosition_manualOffset($gameScreen);
	return rtv;
},undefined,true).addBase('updatePosition_manualOffset',function f(screen){
	const cache=screen.getManualOffsetCache();
	this.x+=Math.round(cache.x);
	this.y+=Math.round(cache.y);
});

})();
