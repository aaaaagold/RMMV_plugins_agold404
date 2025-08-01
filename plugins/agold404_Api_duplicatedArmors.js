"use strict";
/*:
 * @plugindesc providing js api to creating a duplicated armor in database during (game) runtime.
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
 * @help $gameSystem.duplicatedArmors_createNew(srcArmorId,variationsInfo,newId) and it will return the id of newly created data
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_Api_duplicatedArmors";
const params=PluginManager.parameters(pluginName)||{};
params._defaultMinGeneratedId=useDefaultIfIsNaN(params.DefaultMinGeneratedId,4040);


t=[
undefined,
params,
window.isTest(),
"[ERROR] dstArmorId duplicated", // 3: err msg: dup dstActorId
'_duplicatedArmors_srcId', // 4: keyName for src id
];


new cfc(DataManager).
add('duplicatedDataobj_getSrc',function f(dataobj){
	const obj=$dataArmors[dataobj&&dataobj[f.tbl[4]]];
	return obj||f.ori.apply(this,arguments);
},t).
getP;

new cfc(Game_System.prototype).
addBase('_duplicatedArmors_getCont',function f(){
	let cont=this._duplicatedArmors_createdRecords; if(!cont) cont=this._duplicatedArmors_createdRecords=[];
	let m=cont._map_dstArmorId_to_info; if(!m){
		m=cont._map_dstArmorId_to_info=new Map();
		for(let x=cont.length;x--;) m.set(cont[x].dstArmorId,cont[x]);
	}
	m=cont._map_src_to_dsts; if(!m){
		m=cont._map_src_to_dsts=new Map();
		for(let x=cont.length;x--;){
			const src=$dataArmors[cont[x].srcArmorId];
			const dst=$dataArmors[cont[x].dstArmorId];
			if(!src||!dst) continue;
			if(!m.has(src)) m.set(src,[]);
			m.get(src).push(dst);
		}
	}
	return cont;
},t).
addBase('_duplicatedArmors_getClonedCont',function f(){
	return this._duplicatedArmors_getCont().slice();
},t).
addBase('_duplicatedArmors_clearCont',function f(){
	const cont=this._duplicatedArmors_getCont();
	cont.length=0;
	cont._map_dstArmorId_to_info.clear();
	cont._map_src_to_dsts.clear();
	return this;
},t).
addBase('_duplicatedArmors_addCreatedRecords',function f(info){
	const cont=this._duplicatedArmors_getCont();
	const m=cont._map_dstArmorId_to_info;
	let idx=m.get(info.dstArmorId)-0;
	if(isNaN(idx)) idx=cont.length;
	else if(f.tbl[2]){ throw new Error(f.tbl[3]+' '+info.dstArmorId); }
	m.set(info.dstArmorId,idx);
	cont[idx]=info;
	{
		const src=$dataArmors[info.srcArmorId];
		const dst=$dataArmors[info.dstArmorId];
		if(src&&dst){
			const m=cont._map_src_to_dsts;
			if(!m.has(src)) m.set(src,[]);
			m.get(src).push(dst);
		}
	}
},t).
addBase('_duplicatedArmors_getCreatedRecords',function f(dstArmorId){
	return this._duplicatedArmors_getCont()._map_dstArmorId_to_info.get(dstArmorId);
}).
addBase('_duplicatedArmors_getSrcClonedToDstsList',function f(srcDataobj){
	return this._duplicatedArmors_getCont()._map_src_to_dsts.get(srcDataobj);
}).
addBase('duplicatedArmors_getSrcClonedToDstsList',function f(srcDataobj){
	const rtv=this._duplicatedArmors_getSrcClonedToDstsList.apply(this,arguments);
	return rtv?rtv.slice():[];
}).
addBase('duplicatedArmors_createNew',function f(srcArmorId,variationsInfo,newId){
	// return newly created dataobj id
	// if variationsInfo is not true-like, return srcArmorId
	if(!variationsInfo) return srcArmorId;
	let srcDataobj=$dataArmors[srcArmorId];
	const prevInfos=[];
	for(let parentDataobj=$dataArmors[srcDataobj[f.tbl[4]]];parentDataobj;parentDataobj=$dataArmors[srcDataobj[f.tbl[4]]]){
		prevInfos.push(this._duplicatedArmors_getCreatedRecords(srcDataobj.id));
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
	DataManager.dataarr_addDataobj($dataArmors,dstDataobj,f.tbl[1]._defaultMinGeneratedId,newId);
	newId=dstDataobj.id;
	this._duplicatedArmors_addCreatedRecords({srcArmorId:srcArmorId,variations:finalVariationsInfo,dstArmorId:newId,});
	return newId;
},t).
addBase('duplicatedArmors_onAfterLoad',function f(){
	//DataManager.dataarr_reset($dataArmors); // moved to Game_System.prototype.onAfterLoad_before in base
	const data=$gameSystem._duplicatedArmors_getClonedCont();
	$gameSystem._duplicatedArmors_clearCont();
	for(let x=0,xs=data.length;x<xs;++x){
if(0){
		if($dataArmors[data[x].dstArmorId]){
			const idx=data[x].dstArmorId;
			data[x].dstArmorId=undefined;
		}
}
		const res=$gameSystem.duplicatedArmors_createNew(data[x].srcArmorId,data[x].variations,data[x].dstArmorId);
	}
},t).
add('onAfterLoad_main',function f(){
	this.duplicatedArmors_onAfterLoad();
	return f.ori.apply(this,arguments);
}).
getP;


// glue
new cfc(Game_System.prototype).
add('duplicatedDataobj_getSrcClonedToDstsList',function f(srcDataobj){
	const rtv=f.ori.apply(this,arguments);
	const res=this._duplicatedArmors_getSrcClonedToDstsList.apply(this,arguments);
	if(!rtv||!rtv.length) return res&&res.slice();
	if(res) rtv.concat_inplace(res);
	return rtv;
},t).
getP;


})();
