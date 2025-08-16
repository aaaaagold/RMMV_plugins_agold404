"use strict";
/*:
 * @plugindesc self locked equipment that will not disturb other same slots
 * @author agold404
 * 
 * 
 * @help it will be the same using built-in method if there's only at most 1 slots per equip type.
 * 
 * to set a common self-locked equipments, write following in note of an equipment:
 * <isSelfLocked>
 * 
 * to set an ability (trait) to be able to un-equip a self-locked equipment, write following in note of trait-available objects (actor, class, equipment, state):
 * <unlockSelfLocked:[['a',armor_id],['w',weapon_id], ... ]>
 * this ability only affects on <isSelfLocked>. built-in locked equipment method will NOT take effect.
 * 
 * to set an ability (trait) to set OTHER equipments self-locked, write following in note of trait-available objects (actor, class, equipment, state):
 * <makeSelfLocked:[['a',armor_id],['w',weapon_id], ... ]>
 * this ability will NOT overcome <unlockSelfLocked>
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_SelfLockedEquipment";
const params=PluginManager.parameters(pluginName)||{};


// these traits actually use dataCode+'-w' or dataCode+'-a' as traitCode


const gbb=Game_BattlerBase;
const kwps=['unlockSelfLocked','makeSelfLocked',];
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
params,
window.isTest(),
kwpts, // 3: keyNames: [ [note,TRAIT_*,dataCode,[immDataCode,immTRAIT_*]] , ... ]
['-a','-w'], // 4: traitCode suffix
];


new cfc(Scene_Boot.prototype).
add('modTrait1',function f(dataobj,i,arr){
	const rtv=f.ori.apply(this,arguments);
	this.selfLockedEquipment_evalSetting.apply(this,arguments);
	return rtv;
}).
addBase('selfLockedEquipment_evalSetting',function f(dataobj,i,arr){
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
		let settings;
		try{
			if(meta[noteKey]) settings=JSON.parse(meta[noteKey]);
		}catch(e){
			console.error('json parsing error on following object with notekey = '+noteKey);
			console.error(dataobj);
			throw e;
		}
		if(!settings) continue;
		for(let arr=settings,x=arr.length;x--;){
			const trait={code:dataCode+'-'+arr[x][0],dataId:arr[x][1],value:1};
			traits.push(trait); // to debug, value is set to 1.
		}
	}
	
	return;
},t).
getP;


new cfc(Game_Actor.prototype).
addBase('selfLockedEquipment_isEquipChangeOk',function f(slotId){
	const equip=DataManager.duplicatedDataobj_getSrc(this.getEquip(slotId));
	if(!equip) return true;
	const traitCodeSuffix=f.tbl[4][(equip.etypeId===1)|0];
	{ const unlockedCode=f.tbl[3]._key2content.unlockSelfLocked[2]+traitCodeSuffix;
	if(this.traitsHasId(unlockedCode,equip.id)) return true;
	}
	if(equip.meta&&equip.meta.isSelfLocked) return false;
	else{
		const lockedCode=f.tbl[3]._key2content.makeSelfLocked[2]+traitCodeSuffix;
		return !this.traitsHasId(lockedCode,equip.id);
	}
},t).
add('isEquipChangeOk',function f(slotId){
	if(!this.selfLockedEquipment_isEquipChangeOk.apply(this,arguments)) return false;
	return f.ori.apply(this,arguments);
},t).
getP;


})();
