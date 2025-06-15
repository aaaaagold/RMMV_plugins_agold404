"use strict";
/*:
 * @plugindesc adjust nums of equip slots for each type
 * @author agold404
 * @help fractions of resulting numbers are rounded toward 0 to integer. the minimum result is 0.
 * <adjustEquipSlots>
 * JSON_FORMAT_HERE
 * </adjustEquipSlots>
 * in notes of trait-available objects. e.g. actor, class, weapon, armor, state, enemy.
 * 
 * <adjustEquipSlots> ... </adjustEquipSlots>
 * is called BLOCKs
 * 
 * multiple BLOCKs are accepted. all of them will be effective.
 * <adjustEquipSlots>
 *  // your JSON format information here
 * </adjustEquipSlots>
 * 
 * JSON format information:
 * a dictionary of equipTypeId->increase_or_decrease_amount
 * only valid equipTypeId(s) are taken. other than that are omitted.
 * increase_or_decrease_amount can be a string, which will be pass to `eval()` to get a `Number` type value when needed.
 * 
 * 
 * a simple example of note shown below:
 * <adjustEquipSlots>
 * {"1":1,"2":-3}
 * </adjustEquipSlots>
 * this increase weapon slots by 1, and decrease equipType:2 by 3
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_Trait_adjustEquipSlots";
const params=PluginManager.parameters(pluginName)||{};


// traitsWithId(code,equipTypeId)->delta_amount


const gbb=Game_BattlerBase;
const kwps=['/adjustEquipSlots',];
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
equipTypeId=>(equipTypeId!==~~equipTypeId||!(equipTypeId>=0&&equipTypeId<$dataSystem.equipTypes.length)), // 6: is invalid equipTypeId
];


new cfc(Scene_Boot.prototype).
add('modTrait1',function f(dataobj,i,arr){
	const rtv=f.ori.apply(this,arguments);
	this.traitAdjustEquipSlots_evalSetting.apply(this,arguments);
	return rtv;
}).
addBase('traitAdjustEquipSlots_evalSetting',function f(dataobj,i,arr){
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
					const equipTypeId=~~tmp;
					
					const delta=info[k];
					let trait;
					if(!immInfo||(typeof delta)==='string'){
						trait={code:dataCode,dataId:equipTypeId,value:delta,};
					}else{
						trait={code:immInfo[0],dataId:equipTypeId,value:delta-0||0,};
					}
					if(trait.value) traits.push(trait);	
				}
			}
			continue;
		}
		const noteKey=arr[x][0];
	}
	
	return;
},t).
getP;


new cfc(gbb.prototype).
addBase('traitAdjustEquipSlots_getDelta',function f(equipTypeId){
	if(f.tbl[6](equipTypeId)) return;
	let rtv=this.traitsSum(f.tbl[3]._key2content.adjustEquipSlots[3][0],equipTypeId);
	const arr=this.traitsWithId(f.tbl[3]._key2content.adjustEquipSlots[2],equipTypeId);
	for(let x=0,xs=arr.length;x<xs;++x) rtv+=EVAL.call(this,arr[x].value)-0||0;
	return rtv;
},t).
getP;

new cfc(Game_Actor.prototype).
add('equipSlots',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.traitAdjustEquipSlots_extendEquipSlots(rtv);
	return rtv;
}).
addBase('traitAdjustEquipSlots_extendEquipSlots',function f(slots){
	if(slots._oriLen>=0) return; // already checked
	slots._oriLen=slots.length;
	const deltas=slots._traitAdjustEquipSlots_deltas={};
	const deltav=[];
	for(let i=1,sz=$dataSystem.equipTypes.length;i<sz;++i) deltav.push(deltas[i]=this.traitAdjustEquipSlots_getDelta(i));
	for(let x=0,xs=deltav.length;x<xs;++x){
		for(let c=deltav[x];c-->0;) slots.push(x+1);
	}
}).
addBase('_getEquipSlot',function f(slotId){
	return this.equipSlots()[slotId];
}).
getP;


})();
