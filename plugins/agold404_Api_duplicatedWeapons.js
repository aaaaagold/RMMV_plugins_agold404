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


new cfc(DataManager).
add('duplicatedDataobj_getSrc',function f(dataobj){
	const obj=$dataWeapons[dataobj&&dataobj[f.tbl[4]]];
	return obj||f.ori.apply(this,arguments);
},t).
getP;

new cfc(Game_System.prototype).
addBase('_duplicatedWeapons_getCont',function f(){
	let cont=this._duplicatedWeapons_createdRecords; if(!cont) cont=this._duplicatedWeapons_createdRecords=[];
	let m=cont._map_dstWeaponId_to_info; if(!m){
		m=cont._map_dstWeaponId_to_info=new Map();
		for(let x=cont.length;x--;) m.set(cont[x].dstWeaponId,cont[x]);
	}
	m=cont._map_src_to_dsts; if(!m){
		m=cont._map_src_to_dsts=new Map();
		for(let x=cont.length;x--;){
			const src=$dataWeapons[cont[x].srcWeaponId];
			const dst=$dataWeapons[cont[x].dstWeaponId];
			if(!src||!dst) continue;
			if(!m.has(src)) m.set(src,[]);
			m.get(src).push(dst);
		}
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
	cont._map_src_to_dsts.clear();
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
	{
		const src=$dataWeapons[info.srcWeaponId];
		const dst=$dataWeapons[info.dstWeaponId];
		if(src&&dst){
			const m=cont._map_src_to_dsts;
			if(!m.has(src)) m.set(src,[]);
			m.get(src).push(dst);
		}
	}
},t).
addBase('_duplicatedWeapons_getCreatedRecords',function f(dstWeaponId){
	return this._duplicatedWeapons_getCont()._map_dstWeaponId_to_info.get(dstWeaponId);
},t).
addBase('_duplicatedWeapons_getSrcClonedToDstsList',function f(srcDataobj){
	return this._duplicatedWeapons_getCont()._map_src_to_dsts.get(srcDataobj);
}).
addBase('duplicatedWeapons_getSrcClonedToDstsList',function f(srcDataobj){
	const rtv=this._duplicatedWeapons_getSrcClonedToDstsList.apply(this,arguments);
	return rtv?rtv.slice():[];
}).
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
	//DataManager.dataarr_reset($dataWeapons); // moved to Game_System.prototype.onAfterLoad_before in base
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


// glue
new cfc(Game_System.prototype).
add('duplicatedDataobj_getSrcClonedToDstsList',function f(srcDataobj){
	const rtv=f.ori.apply(this,arguments);
	const res=this._duplicatedWeapons_getSrcClonedToDstsList.apply(this,arguments);
	if(!rtv||!rtv.length) return res&&res.slice();
	if(res) rtv.concat_inplace(res);
	return rtv;
},t).
getP;


})();
