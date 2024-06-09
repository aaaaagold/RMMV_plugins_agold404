"use strict";
/*:
 * @plugindesc setting element rate in note ; thus can be a wierd value
 * @author agold404
 * @help <elementRate:JSON>
 * 
 * JSON = { "elementId": rate , ... }
 * e.g. 
 * <elementRate:{"1":0.5}>
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

const gbb=Game_BattlerBase,kw='elementRate';
const kwt='TRAIT_ELEMENT_RATE'; // built-in

new cfc(Scene_Boot.prototype).add('modTrait1',function f(dataobj,i,arr){
	const rtv=f.ori.apply(this,arguments); if(!dataobj||!dataobj.meta||!dataobj.traits) return rtv;
	const kw=f.tbl[0];
	const meta=dataobj.meta;
	if(meta[kw]){
		const kv=JSON.parse(meta[kw]);
		for(let k in kv){
			let key=k-0;
			const val=kv[k]-0;
			if($dataSystem&&isNaN(key)){
				if(!$dataSystem.elements._ele2idx) $dataSystem.elements._ele2idx=new Map($dataSystem.elements.slice().reverse().map((x,i)=>[x,i]));
				const idx=$dataSystem.elements._ele2idx.get(key);
				if(idx>=0) key=idx;
			}
			if(val!==1) dataobj.traits.push({code:f.tbl[1],dataId:key,value:val});
		}
	}
	return rtv;
},[
kw,
gbb[kwt],
]);

})();
