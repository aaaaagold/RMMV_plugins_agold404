"use strict";
/*:
 * @plugindesc loop animation effect
 * @author agold404
 * 
 * 
 * @help state's note: <loopAni:animationId>
 * <loopAni:animationId,appear,fixed,map>
 * appear: the effect will not be transparent if the battler disappears
 * fixed: the position of effect is fixed, and will not be moved with the position of the battler
 * map: display on map
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_LoopAni";
const params=PluginManager._parameters[pluginName];


new cfc(Scene_Boot.prototype).
add('modData',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.loopAni_evalSetting.apply(this,arguments);
	return rtv;
}).
addBase('loopAni_evalSetting',function f(){
	for(let keys=f.tbl[0],arr=$dataStates,x=arr.length;x--;){
		const o=arr[x];
		const meta=o&&o.meta; if(!meta) continue;
		for(let z=keys.length;z--;) o[keys[z]]=meta[keys[z]];
		
		if(typeof o.loopAni!=='string'){
			for(let z=keys.length;z--;) o[keys[z]]=undefined;
			continue;
		}
		const info=o.loopAni.split(',');
		info[0]-=0;
		if(isNaN(info[0])){
			for(let z=keys.length;z--;) o[keys[z]]=undefined;
			continue;
		}
		const mirrored=info[0]<0;
		const disappear=!(info.indexOf("appear",1)+1)||info.indexOf("disappear",1)+1,fixed=info.indexOf("fixed",1)+1;
		const map=info.indexOf("map",1)+1;
		o.loopAni={
			stateId:x,
			aniId:info[0],
			mirrored:!!mirrored,
			disappear:!!disappear,
			map:!!map,
		};
		o.loopAni_isCanDisplayOnMap=!!map;
		o.loopAni_isCanDisplayInBattle=true;
	}
},t=[
['loopAni','loopAni_isCanDisplayOnMap','loopAni_isCanDisplayInBattle',], // 0: keys
['map','appear','fixed',], // 1: opts
dataobj=>dataobj&&dataobj.loopAni&&dataobj.loopAni.key,
]).
getP;


new cfc(Sprite_Base.prototype).
addBase('_loopAni_update',function f(btlr,stateProp){
	if(!(btlr instanceof Game_Battler)) return;
	
	const stateIds=btlr.traitsOpCache_statePropTrue_getUniquesIds(stateProp);
	let la=this._loopAnis; if(!la) la=this._loopAnis=[];
	
	const lastXy=new Map();
	{ const delList=[];
	for(let x=0,sz=la.length;x<sz;++x){
		const aniSp=la.kvGetValByIdx(x); if(!aniSp) continue;
		const stateId=la.kvGetKey(x);
		const state=DataManager.arrMapFunc_idToDataobj_state(stateId);
		const disappear=!state||!state.loopAni||state.loopAni.disappear;
		if(aniSp.isPlaying()){
			aniSp.alpha=disappear?this.alpha:1;
		}else{
			lastXy.set(stateId,[aniSp._setx,aniSp._sety,]);
			aniSp.parent.removeChild(aniSp);
			delList.push(stateId);
		}
	}
	for(let x=delList.length;x--;) la.kvPop(delList[x]);
	}
	
	for(let x=0,sz=stateIds.length;x<sz;++x){
		const stateId=stateIds[x];
		const state=DataManager.arrMapFunc_idToDataobj_state(stateId); if(!state) return;
		const loopAni=state.loopAni; if(!loopAni) continue;
		const ani=$dataAnimations[loopAni.aniId]; if(!ani) return;
		const aniSp=la.kvGetVal(stateId); if(aniSp) return;
		this.startAnimation(ani,loopAni.mirrored,0);
		const arr=this._animationSprites;
		const sp=arr.pop();
		sp.z=this.z-1;
		la.kvPush(stateId,sp);
		if(loopAni.fixed){
			let xy=lastXy.get(stateId),x,y;
			if(xy){
				x=xy[0];
				y=xy[1];
			}
			if(x!==undefined){
				sp._setx=sp.x=x; sp._sety=sp.y=y;
			}else{
				sp.updatePosition();
				sp._setx=sp.x; sp._sety=sp.y;
			}
			sp.updatePosition=none;
		}
	}
},t).
getP;

new cfc(Sprite_Battler.prototype).
addBase('loopAni_update',function f(){
	if(!this._battler) return;
	if(!this._battler.isSpriteVisible()) return; // !$gameSystem.isSideView()
	this._loopAni_update(this._battler,f.tbl[0][2]);
},t).
add('update',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.loopAni_update.apply(this,arguments);
	return rtv;
}).
getP;


new cfc(Sprite_Character.prototype).
addBase('loopAni_update',function f(){
	const chr=this._character; if(!chr) return;
	if(!(chr.actor instanceof Function)) return;
	this._loopAni_update(chr.actor(),f.tbl[0][1]);
},t).
add('update',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.loopAni_update.apply(this,arguments);
	return rtv;
}).
getP;


})();

