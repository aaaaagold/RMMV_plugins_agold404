"use strict";
/*:
 * @plugindesc providing js api to duplicate an actor when added to party
 * @author agold404
 * 
 * 
 * @param DefaultMinGeneratedId
 * @type number
 * @text default min generated id
 * @desc to ensure expanding numbers of actors won't cause much issues. when NaN, use 4040 as value
 * @default 4040
 * 
 * 
 * @help .
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_Api_duplicatedActors";
const params=PluginManager.parameters(pluginName)||{};
params._defaultMinGeneratedId=useDefaultIfIsNaN(params.DefaultMinGeneratedId,4040);


t=[
undefined,
params,
window.isTest(),
"[ERROR] dstActorId duplicated", // 3: err msg: dup dstActorId
'_duplicatedActors_srcId', // 4: keyName for src id
];


new cfc(DataManager).
add('duplicatedDataobj_getSrc',function f(dataobj){
	const obj=$dataActors[dataobj&&dataobj[f.tbl[4]]];
	return obj||f.ori.apply(this,arguments);
},t).
getP;

new cfc(Game_System.prototype).
addBase('_duplicatedActors_getCont',function f(){
	let cont=this._duplicatedActors_createdRecords; if(!cont) cont=this._duplicatedActors_createdRecords=[];
	let m=cont._map_dstActorId_to_info; if(!m){
		m=cont._map_dstActorId_to_info=new Map();
		for(let x=cont.length;x--;) m.set(cont[x].dstActorId,cont[x]);
	}
	m=cont._map_src_to_dsts; if(!m){
		m=cont._map_src_to_dsts=new Map();
		for(let x=cont.length;x--;){
			const src=$dataActors[cont[x].srcActorId];
			const dst=$dataActors[cont[x].dstActorId];
			if(!src||!dst) continue;
			if(!m.has(src)) m.set(src,[]);
			m.get(src).push(dst);
		}
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
	cont._map_src_to_dsts.clear();
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
	{
		const src=$dataActors[info.srcActorId];
		const dst=$dataActors[info.dstActorId];
		if(src&&dst){
			const m=cont._map_src_to_dsts;
			if(!m.has(src)) m.set(src,[]);
			m.get(src).push(dst);
		}
	}
},t).
addBase('_duplicatedActors_getCreatedRecords',function f(dstActorId){
	return this._duplicatedActors_getCont()._map_dstActorId_to_info.get(dstActorId);
},t).
addBase('_duplicatedActors_getSrcClonedToDstsList',function f(srcDataobj){
	return this._duplicatedActors_getCont()._map_src_to_dsts.get(srcDataobj);
}).
addBase('duplicatedActors_getSrcClonedToDstsList',function f(srcDataobj){
	const rtv=this._duplicatedActors_getSrcClonedToDstsList.apply(this,arguments);
	return rtv?rtv.slice():[];
}).
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
	DataManager.dataarr_addDataobj($dataActors,dstDataobj,f.tbl[1]._defaultMinGeneratedId,newId);
	newId=dstDataobj.id;
	this._duplicatedActors_addCreatedRecords({srcActorId:srcActorId,variations:finalVariationsInfo,dstActorId:newId,});
	return newId;
},t).
addBase('duplicatedActors_onAfterLoad',function f(){
	//DataManager.dataarr_reset($dataActors); // moved to Game_System.prototype.onAfterLoad_before in base
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


// glue
new cfc(Game_System.prototype).
add('duplicatedDataobj_getSrcClonedToDstsList',function f(srcDataobj){
	const rtv=f.ori.apply(this,arguments);
	const res=this._duplicatedActors_getSrcClonedToDstsList.apply(this,arguments);
	if(!rtv||!rtv.length) return res&&res.slice();
	if(res) rtv.concat_inplace(res);
	return rtv;
},t).
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
