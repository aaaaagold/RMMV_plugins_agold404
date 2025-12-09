"use strict";
/*:
 * @plugindesc state remove-by-recover property
 * @author agold404
 * 
 * @help <removeByRecoverHp> <removeByRecoverMp> 
 * only effective for executeDamage,
 * NOT effective for itemEffectRecover*p.
 * 
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_StateRemoveByRecover";
const params=PluginManager._parameters[pluginName];


new cfc(Scene_Boot.prototype).
add('modData',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.stateRemoveByRecover_evalSetting.apply(this,arguments);
	return rtv;
}).
addBase('stateRemoveByRecover_evalSetting',function f(){
	for(let keys=f.tbl[0],arr=$dataStates,x=arr.length;x--;){
		const o=arr[x];
		const meta=o&&o.meta; if(!meta) continue;
		for(let z=keys.length;z--;) o[keys[z]]=meta[keys[z]];
	}
},[
['removeByRecoverHp','removeByRecoverMp','removeByRecoverTp',], // 0: keys
]).
getP;


new cfc(Game_Action.prototype).
addBase('stateRemoveByRecover_onExecuteDamage',function f(target,value){
	if(!(value<0)) return;
	const arr=[];
	if(this.isHpRecover()){
		arr.uniquePushContainer(target.traitsOpCache_statePropTrue_getUniquesIds('removeByRecoverHp'));
	}
	if(this.isMpRecover()){
		arr.uniquePushContainer(target.traitsOpCache_statePropTrue_getUniquesIds('removeByRecoverMp'));
	}
	for(let x=arr.length;x--;) target.removeState(arr[x]);
}).
add('onExecuteDamage',function f(target,value){
	const rtv=f.ori.apply(this,arguments);
	this.stateRemoveByRecover_onExecuteDamage.apply(this,arguments);
	return rtv;
}).
getP;


})();
