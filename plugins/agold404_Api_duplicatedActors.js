﻿"use strict";
/*:
 * @plugindesc providing js api to duplicate an actor when added to party
 * @author agold404
 * @help 
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_Api_duplicatedActors";
const params=PluginManager.parameters(pluginName)||{};


t=[
undefined,
params,
window.isTest(),
"[ERROR] dstActorId duplicated", // 3: err msg: dup dstActorId
'_duplicatedActors_srcId', // 4: keyName for src id
];


new cfc(Game_System.prototype).
addBase('_duplicatedActors_getCont',function f(){
	let cont=this._duplicatedActors_createdRecords; if(!cont) cont=this._duplicatedActors_createdRecords=[];
	let m=cont._map_dstActorId_to_info; if(!m){
		m=cont._map_dstActorId_to_info=new Map();
		for(let x=cont.length;x--;) m.set(cont[x].dstActorId,cont[x]);
	}
	return cont;
},t).
addBase('_duplicatedActors_getClonedCont',function f(){
	return this._duplicatedActors_getCont().slice();
},t).
addBase('_duplicatedActors_clearCont',function f(){
	const cont=this._duplicatedActors_getCont();
	cont.length=0;
	cont._map_dstActorId_to_info.clear();
	return this;
},t).
addBase('_duplicatedActors_addCreatedRecords',function f(info){
	const cont=this._duplicatedActors_getCont();
	const m=cont._map_dstActorId_to_info;
	let idx=m.get(info.dstActorId)-0;
	if(isNaN(idx)) idx=cont.length;
	else if(f.tbl[2]){ throw new Error(f.tbl[3]+' '+info.dstActorId); }
	m.set(info.dstActorId,idx);
	cont[idx]=info;
},t).
addBase('_duplicatedActors_getCreatedRecords',function f(dstActorId){
	return this._duplicatedActors_getCont()._map_dstActorId_to_info.get(dstActorId);
},t).
addBase('duplicatedActors_createNew',function f(srcActorId,variationsInfo,newId){
	// return newly created dataobj id
	// if variationsInfo is not true-like, return srcActorId
	if(!variationsInfo) return srcActorId;
	let srcDataobj=$dataActors[srcActorId];
	const prevInfos=[];
	for(let parentDataobj=$dataActors[srcDataobj[f.tbl[4]]];parentDataobj;parentDataobj=$dataActors[srcDataobj[f.tbl[4]]]){
		prevInfos.push(this._duplicatedActors_getCreatedRecords(srcDataobj.id));
		srcDataobj=parentDataobj;
	}
	const finalVariationsInfo={};
	if(prevInfos.length){
		do{
			Object.assign(parentVariationsInfo,prevInfos.pop().variations);
		}while(prevInfos.length);
	}
	Object.assign(finalVariationsInfo,variationsInfo);
	const dstDataobj=Object.assign(Object.assign({},srcDataobj),finalVariationsInfo);
	dstDataobj[f.tbl[4]]=srcDataobj.id;
	DataManager.dataarr_addDataobj($dataActors,dstDataobj,0,newId);
	newId=dstDataobj.id;
	this._duplicatedActors_addCreatedRecords({srcActorId:srcActorId,variations:finalVariationsInfo,dstActorId:newId,});
	return newId;
},t).
addBase('duplicatedActors_onAfterLoad',function f(){
	DataManager.dataarr_reset($dataActors);
	const data=$gameSystem._duplicatedActors_getClonedCont();
	$gameSystem._duplicatedActors_clearCont();
	for(let x=0,xs=data.length;x<xs;++x){
if(0){
		if($dataActors[data[x].dstActorId]){
			const idx=data[x].dstActorId;
			data[x].dstActorId=undefined;
		}
}
		const res=$gameSystem.duplicatedActors_createNew(data[x].srcActorId,data[x].variations,data[x].dstActorId);
	}
},t).
add('onAfterLoad_main',function f(){
	this.duplicatedActors_onAfterLoad();
	return f.ori.apply(this,arguments);
}).
getP;

new cfc(Scene_Boot.prototype).
addBase('duplicatedActors_init',function f(){
	DataManager.dataarr_ensureTableInited($dataActors);
}).
add('terminate',function f(){
	this.duplicatedActors_init();
	return f.ori.apply(this,arguments);
}).
getP;


new cfc(Game_Actors.prototype).
add('actor',function f(actorId,isAnotherActor_variationsInfo){
	if(isAnotherActor_variationsInfo) arguments[0]=actorId=$gameSystem.duplicatedActors_createNew(actorId,isAnotherActor_variationsInfo);
	return f.ori.apply(this,arguments);
}).
getP;

new cfc(Game_Party.prototype).
add('addActor',function f(actorId,isAnotherActor_variationsInfo){
	arguments[0]=actorId=$gameSystem.duplicatedActors_createNew(actorId,isAnotherActor_variationsInfo);
	return f.ori.apply(this,arguments);
}).
getP;


})();
