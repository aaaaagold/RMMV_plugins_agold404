"use strict";
/*:
 * @plugindesc let player or events can pass in ONLY some regions
 * @author agold404
 * @help .
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

new cfc(Game_CharacterBase.prototype).add('passRegions_is',function f(rid){
	if(!this._passRegions_isNotPassAll) return true;
	const cont=this.passRegions_getCont();
	return cont.uniqueHas(rid);
},undefined,true,true).add('passRegions_setPassAll',function f(val){
	this._passRegions_isNotPassAll=!val;
	return this;
},undefined,true,true).add('passRegions_getCont',function f(){
	let rtv=this._passRegions; if(!rtv) rtv=this._passRegions=[];
	// unique set
	return rtv;
},undefined,true,true).add('passRegions_add',function f(rid){
	const cont=this.passRegions_getCont();
	if(rid&&rid.constructor===Array) for(let x=rid.length;x--;) cont.uniquePush(rid[x]);
	else cont.uniquePush(rid);
	return this;
},undefined,true,true).add('passRegions_clearAll',function f(){
	this.passRegions_setPassAll(true);
	this.passRegions_getCont().clear();
},undefined,true,true).add('isMapPassable',function f(x,y,d){
	const x2 = $gameMap.roundXWithDirection(x,d);
	const y2 = $gameMap.roundYWithDirection(y,d);
	if(!this.passRegions_is($gameMap.regionId(x2,y2))) return false;
	return f.ori.apply(this,arguments);
});

})();
