"use strict";
/*:
 * @plugindesc providing js api to creating a duplicated weapon in database during (game) runtime.
 * @author agold404
 * 
 * 
 * @param DefaultMinGeneratedId
 * @type number
 * @text default min generated id
 * @desc to ensure expanding numbers of equips won't cause much issues. when NaN, use 4040 as value
 * @default 4040
 * 
 * 
 * @help $gameSystem.duplicatedWeapons_createNew(srcWeaponId,variationsInfo,newId) and it will return the id of newly created data
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_Api_duplicatedWeapons";
const params=PluginManager.parameters(pluginName)||{};
params._defaultMinGeneratedId=useDefaultIfIsNaN(params.DefaultMinGeneratedId,4040);


t=[
undefined,
params,
window.isTest(),
"[ERROR] dstWeaponId duplicated", // 3: err msg: dup dstActorId
'_duplicatedWeapons_srcId', // 4: keyName for src id
];


new cfc(Game_System.prototype).
addBase('_duplicatedWeapons_getCont',function f(){
	let cont=this._duplicatedWeapons_createdRecords; if(!cont) cont=this._duplicatedWeapons_createdRecords=[];
	let m=cont._map_dstWeaponId_to_info; if(!m){
		m=cont._map_dstWeaponId_to_info=new Map();
		for(let x=cont.length;x--;) m.set(cont[x].dstWeaponId,cont[x]);
	}
	return cont;
},t).
addBase('_duplicatedWeapons_getClonedCont',function f(){
	return this._duplicatedWeapons_getCont().slice();
},t).
addBase('_duplicatedWeapons_clearCont',function f(){
	const cont=this._duplicatedWeapons_getCont();
	cont.length=0;
	cont._map_dstWeaponId_to_info.clear();
	return this;
},t).
addBase('_duplicatedWeapons_addCreatedRecords',function f(info){
	const cont=this._duplicatedWeapons_getCont();
	const m=cont._map_dstWeaponId_to_info;
	let idx=m.get(info.dstWeaponId)-0;
	if(isNaN(idx)) idx=cont.length;
	else if(f.tbl[2]){ throw new Error(f.tbl[3]+' '+info.dstWeaponId); }
	m.set(info.dstWeaponId,idx);
	cont[idx]=info;
},t).
addBase('_duplicatedWeapons_getCreatedRecords',function f(dstWeaponId){
	return this._duplicatedWeapons_getCont()._map_dstWeaponId_to_info.get(dstWeaponId);
},t).
addBase('duplicatedWeapons_createNew',function f(srcWeaponId,variationsInfo,newId){
	// return newly created dataobj id
	// if variationsInfo is not true-like, return srcWeaponId
	if(!variationsInfo) return srcWeaponId;
	let srcDataobj=$dataWeapons[srcWeaponId];
	const prevInfos=[];
	for(let parentDataobj=$dataWeapons[srcDataobj[f.tbl[4]]];parentDataobj;parentDataobj=$dataWeapons[srcDataobj[f.tbl[4]]]){
		prevInfos.push(this._duplicatedWeapons_getCreatedRecords(srcDataobj.id));
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
	DataManager.dataarr_addDataobj($dataWeapons,dstDataobj,f.tbl[1]._defaultMinGeneratedId,newId);
	newId=dstDataobj.id;
	this._duplicatedWeapons_addCreatedRecords({srcWeaponId:srcWeaponId,variations:finalVariationsInfo,dstWeaponId:newId,});
	return newId;
},t).
addBase('duplicatedWeapons_onAfterLoad',function f(){
	DataManager.dataarr_reset($dataWeapons);
	const data=$gameSystem._duplicatedWeapons_getClonedCont();
	$gameSystem._duplicatedWeapons_clearCont();
	for(let x=0,xs=data.length;x<xs;++x){
if(0){
		if($dataWeapons[data[x].dstWeaponId]){
			const idx=data[x].dstWeaponId;
			data[x].dstWeaponId=undefined;
		}
}
		const res=$gameSystem.duplicatedWeapons_createNew(data[x].srcWeaponId,data[x].variations,data[x].dstWeaponId);
	}
},t).
add('onAfterLoad_main',function f(){
	this.duplicatedWeapons_onAfterLoad();
	return f.ori.apply(this,arguments);
}).
getP;

new cfc(Scene_Boot.prototype).
addBase('duplicatedWeapons_init',function f(){
	DataManager.dataarr_ensureTableInited($dataWeapons);
}).
add('terminate',function f(){
	this.duplicatedWeapons_init();
	return f.ori.apply(this,arguments);
}).
getP;


})();
