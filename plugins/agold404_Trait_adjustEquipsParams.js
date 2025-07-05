"use strict";
/*:
 * @plugindesc adjust some params of worn equipments
 * @author agold404
 * @help multiply first, then add.
 * 
 * write in trait-available items' note, JSON format:
 * 
 * to multiply params in each worn equipment:
 *  <adjustEquipsParams_mul>
 *   {"paramId1":amount,"paramId2":amount} // JSON here
 *  </adjustEquipsParams_mul>
 * 
 * to    add   params in each worn equipment:
 * <adjustEquipsParams_add>
 *  {"paramId3":amount,"paramId4":amount} // JSON here
 * </adjustEquipsParams_add>
 * 
 * if a paramId is not an integer within the range greater than or equal to zero, that paramId will be ommited.
 * 
 * usable example:
 * <adjustEquipsParams_mul>
 * {
 *  "0":11,
 *  "1":5,
 *  "2":7,
 *  "3":3,
 * "_dummy":""}
 * </adjustEquipsParams_mul>
 * <adjustEquipsParams_add>
 * {
 *  "2":29,
 *  "3":31,
 *  "4":37,
 *  "5":41,
 * "_dummy":""}
 * </adjustEquipsParams_add>
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_Trait_adjustEquipSlots";
const params=PluginManager.parameters(pluginName)||{};


// traitsWithId(code,equipTypeId)->delta_amount


const gbb=Game_BattlerBase;
const kwps=['/adjustEquipsParams_mul','/adjustEquipsParams_add',];
const kwpts=kwps.map(kw=>[kw,'TRAIT_'+kw]);
kwpts._key2content={};
kwpts.forEach((info,i,a)=>{
	if(info[0][0]==='/'){
		// is xml style
		const pure=info[0].slice(1);
		info[1]=info[1].slice(0,info[1].length-info[0].length)+pure;
		info._xmlMark=["<"+pure+">","<"+info[0]+">"];
		info[0]=pure;
	}
	gbb.addEnum(info[1]);
	info.push(gbb[info[1]]); // [2]
	if(info._xmlMark){
		const immKey=info[1]+'-immutable'; // i.e. always being evaluated to the same result
		gbb.addEnum(immKey);
		info.push([gbb[immKey],immKey]);
	}else info.push(undefined);
	a._key2content[info[0]]=info;
});


t=[
undefined,
params, // 1: plugin params
window.isTest(), // 2: isTest
kwpts, // 3: keyNames: [ [note,TRAIT_*,dataCode,[immDataCode,immTRAIT_*]] , ... ]
null,
'string',
jsonKey=>isNaN(jsonKey), // 6: condition to skip a json key 
['_TRAIT_WORNEQUIPCNT',undefined,], // 7: worn equip cnt: [TRAIT_ string,traitCode]
];
gbb.addEnum(t[7][0]);
t[7][1]=gbb[t[7][0]];


new cfc(Scene_Boot.prototype).
add('modEquipment1',function f(dataobj,i,arr){
	const rtv=f.ori.apply(this,arguments);
	this.traitAdjustEquipsParams_addWornEquipCtr.apply(this,arguments);
	return rtv;
}).
addBase('traitAdjustEquipsParams_addWornEquipCtr',function f(dataobj,i,arr){
	const meta=dataobj&&dataobj.meta; if(!meta) return;
	const traits=dataobj.traits||(dataobj.traits=[]);
	if(traits._traitAdjustEquipsParams_wornEquipCtrAdded) return;
	traits._traitAdjustEquipsParams_wornEquipCtrAdded=true;
	const dataCode=f.tbl[7][1];
	traits.push({code:dataCode,dataId:0,value:1,});
},t).
add('modTrait1',function f(dataobj,i,arr){
	const rtv=f.ori.apply(this,arguments);
	this.traitAdjustEquipsParams_evalSetting.apply(this,arguments);
	return rtv;
}).
addBase('traitAdjustEquipsParams_evalSetting',function f(dataobj,i,arr){
	const meta=dataobj&&dataobj.meta; if(!meta) return;
	const traits=dataobj.traits||(dataobj.traits=[]);
	
	for(let arr=f.tbl[3],x=arr.length;x--;){
		const dataCode=arr[x][2];
		const immInfo=arr[x][3];
		const xmlMark=arr[x]._xmlMark;
		if(xmlMark){
			const codes=window.getXmlLikeStyleContent(dataobj.note,xmlMark);
			for(let ci=0,cs=codes.length,tmp;ci<cs;++ci){
				const lines=codes[ci];
				const info=JSON.parse(lines.join('\n'));
				for(let k in info){
					tmp=k-0;
					if(f.tbl[6](tmp)) continue;
					const numKey=~~tmp;
					
					const delta=info[k];
					let trait;
					if(!immInfo||(typeof delta)==='string'){
						trait={code:dataCode,dataId:numKey,value:delta,};
					}else{
						trait={code:immInfo[0],dataId:numKey,value:delta-0||0,};
					}
					if(trait.value) traits.push(trait);	
				}
			}
			continue;
		}
		const noteKey=arr[x][0];
		const metaInfo=meta[noteKey];
	}
	
	return;
},t).
getP;


new cfc(gbb.prototype).
addBase('traitAdjustEquipsParams_getWornEquipCnt',function f(){
	return this.traits(f.tbl[7][1],0).length;
},t).
addBase('traitAdjustEquipsParams_getMul',function f(paramId){
	if(f.tbl[6](paramId)) return;
	let rtv=this.traitsPi(f.tbl[3]._key2content.adjustEquipsParams_mul[3][0],paramId);
	const arr=this.traitsWithId(f.tbl[3]._key2content.adjustEquipsParams_mul[2],paramId);
	for(let x=0,xs=arr.length;x<xs;++x){
		const val=EVAL.call(this,arr[x].value)-0;
		if(!isNaN(val)) rtv*=val;
	}
	return rtv;
},t).
addBase('traitAdjustEquipsParams_getAdd',function f(paramId){
	if(f.tbl[6](paramId)) return;
	let rtv=this.traitsSum(f.tbl[3]._key2content.adjustEquipsParams_add[3][0],paramId);
	const arr=this.traitsWithId(f.tbl[3]._key2content.adjustEquipsParams_add[2],paramId);
	for(let x=0,xs=arr.length;x<xs;++x){
		const val=EVAL.call(this,arr[x].value)-0;
		if(!isNaN(val)) rtv+=val;
	}
	return rtv;
},t).
getP;

new cfc(Game_Actor.prototype).
add('paramPlus_equips',function f(paramId){
	let rtv=f.ori.apply(this,arguments);
	rtv*=this.traitAdjustEquipsParams_getMul(paramId);
	rtv+=this.traitAdjustEquipsParams_getAdd(paramId)*this.traitAdjustEquipsParams_getWornEquipCnt();
	return rtv;
}).
getP;


})();
