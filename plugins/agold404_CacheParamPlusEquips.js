"use strict";
/*:
 * @plugindesc cache param plus value of equipments
 * @author agold404
 * @help .
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_CacheParamPlusEquips";
const params=PluginManager.parameters(pluginName)||{};


new cfc(Game_Actor.prototype).
addBase('cacheParamPlusEquips_clearCache',function f(){
	return this._cache_paramPlusEquips={};
}).
addBase('cacheParamPlusEquips_getCont',function f(){
	let rtv=this._cache_paramPlusEquips; if(!rtv) rtv=this.cacheParamPlusEquips_clearCache();
	return rtv;
}).
addBase('cacheParamPlusEquips_addKey',function f(paramId){
	const cont=this.cacheParamPlusEquips_getCont();
	if(!cont._keys) cont._keys=[];
	const rtv=paramId+'';
	cont._keys.uniquePush(rtv);
	return rtv;
}).
addBase('_cacheParamPlusEquips_getKeys',function f(){
	const cont=this.cacheParamPlusEquips_getCont();
	if(!cont._keys) cont._keys=[];
	return cont._keys;
}).
addBase('cacheParamPlusEquips_getKeys',function f(){
	return this._cacheParamPlusEquips_getKeys().slice();
}).
addBase('cacheParamPlusEquips_getVal',function f(paramId){
	const cont=this.cacheParamPlusEquips_getCont();
	//this.cacheParamPlusEquips_addKey(paramId); // don't add here
	return cont[paramId];
}).
addBase('cacheParamPlusEquips_setVal',function f(paramId,value,isDelta){
	// only set new when query `paramPlus_equips`
	// other than `paramPlus_equips`, only set when the key exists
	const cont=this.cacheParamPlusEquips_getCont();
	this.cacheParamPlusEquips_addKey(paramId);
	return cont[paramId]=isDelta?(cont[paramId]-0||0)+value-0:value-0;
}).
addBase('cacheParamPlusEquips_updateFromItemChange',function f(itemPre,itemNow){
	const cont=this.cacheParamPlusEquips_getCont();
	const keys=this._cacheParamPlusEquips_getKeys();
	for(let x=keys.length;x--;){
		this.cacheParamPlusEquips_setVal(
			keys[x],
			(DataManager.getItem_paramPlus(itemNow,keys[x])-0||0)-(DataManager.getItem_paramPlus(itemPre,keys[x])-0||0),
			true,
		);
	}
}).
add('initEquips',function f(equips){
	this.cacheParamPlusEquips_clearCache();
	return f.ori.apply(this,arguments);
}).
add('paramPlus_equips',function f(paramId){
	let rtv=this.cacheParamPlusEquips_getVal(paramId);
	if(rtv===undefined){
		rtv=f.ori.apply(this,arguments);
		this.cacheParamPlusEquips_setVal(paramId,rtv);
	}
	return rtv;
}).
add('_setEquip',function f(slotId,item){
	const itemPre=this._getEquip(slotId);
	this.cacheParamPlusEquips_updateFromItemChange(itemPre,item);
	return f.ori.apply(this,arguments);
}).
getP;


// clear cache when onActorChange in Scene_Equip
new cfc(Scene_Equip.prototype).
add('onActorChange',function f(){
	this.cacheParamPlusEquips_clearCurrentCache();
	return f.ori.apply(this,arguments);
}).
addBase('cacheParamPlusEquips_clearCurrentCache',function f(){
	const actor=this.actor();
	if(actor&&actor.cacheParamPlusEquips_clearCache) actor.cacheParamPlusEquips_clearCache();
}).
getP;


})();
