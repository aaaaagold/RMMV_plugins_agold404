"use strict";
/*:
 * @plugindesc set params of equipments to be randomized when the party gains them.
 * @author agold404
 * 
 * 
 * @help formats:
 * 
 * 
 * format 1
 * 
 * <RandomTotalPointsOnSomeParams>
 * {
 *  "total":[min,max],
 *  "params":["atk","def", ... etc. ]
 * }
 * </RandomTotalPointsOnSomeParams>
 * 
 * this generates points which is a random integer value in range [min,max],
 * and then randomly allocates points to provided "params" list by integer.
 * the content inside <RandomTotalPointsOnSomeParams> ... </RandomTotalPointsOnSomeParams> is JSON format.
 * if min (same as max) is string type, `eval()` is used to parse.
 * available params are: integers in range 0 to 7, or, "mhp" , "mmp" , "atk" , "def" , "mat" , "mdf" , "agi" , "luk"
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_RandomEquipParams";
const params=PluginManager.parameters(pluginName)||{};


t=[
undefined,
params,
window.isTest(),
undefined, // 3: reserved for kwpts
["<RandomTotalPointsOnSomeParams>","</RandomTotalPointsOnSomeParams>"], // 4: xmlMark for random params
];


new cfc(Scene_Boot.prototype).
add('modEquipment1',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.randomEquipParams_format1_evalSetting.apply(this,arguments);
	return rtv;
},t).
addBase('randomEquipParams_format1_evalSetting',function f(dataobj,i,arr){
	const meta=dataobj&&dataobj.meta; if(!meta) return;
	const traits=dataobj.traits||(dataobj.traits=[]);
	
	const obj={};
	const codes=window.getXmlLikeStyleContent(dataobj.note,f.tbl[4]);
	for(let ci=0,cs=codes.length,tmp;ci<cs;++ci){
		const lines=codes[ci];
		const info=JSON.parse(lines.join('\n'));
		Object.assign(obj,info);
	}
	if(obj.total&&obj.params){
		if(!dataobj.params) dataobj.params=[];
		dataobj.params.randomEquipParams_format1=obj;
	}
},t).
add('terminate_after',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.randomEquipParams_chkCondAndErr.apply(this,arguments);
	return rtv;
},t).
addBase('randomEquipParams_chkCondAndErr',function f(){
	const errMsgs=[]; for(let arr=f.tbl[0],x=arr.length;x--;) if(!arr[x][0][arr[x][1]]) errMsgs.push(arr[x][2]);
	if(errMsgs.length){
		throw new Error(errMsgs.join('\n'));
	}
},[
[
[Game_System.prototype,"duplicatedArmors_createNew","lacks of Game_System.prototype.duplicatedArmors_createNew \n ( can be found in agold404_Api_duplicatedArmors.js )"], // 0-0
[Game_System.prototype,"duplicatedWeapons_createNew","lacks of Game_System.prototype.duplicatedWeapons_createNew \n ( can be found in agold404_Api_duplicatedWeapons.js )"], // 0-1
], // 0: chk && err msg
]).
getP;


new cfc(Game_Party.prototype).
addBase('randomEquipParams_createNew_format1',function f(item){
	// return newly created obj
	let rtv;
	const paramVals=item.params.slice();
	const info=item.params.randomEquipParams_format1;
	const base=getNumOrEval(info.total[0]);
	const d=getNumOrEval(info.total[1])-base+1;
	const rndPt=Math.random()*d+base;
	let pt=~~rndPt;
	const randResInfo={pt:pt};
	const paramDsts=info.params;
	if(pt<0){ while(pt++){
		const sel=paramDsts.rnd1();
		const key=useDefaultIfIsNaN(DataManager.paramShortNameToId(sel),sel);
		--paramVals[key];
	} }else{ while(pt--){
		const sel=paramDsts.rnd1();
		const key=useDefaultIfIsNaN(DataManager.paramShortNameToId(sel),sel);
		++paramVals[key];
	} }
	
	const overwriteInfo={
		params:paramVals,
		"randomEquipParams_randRes_format1":randResInfo,
	};
	if(DataManager.isWeapon(item)){
		const res=$gameSystem.duplicatedWeapons_createNew(item.id,overwriteInfo);
		rtv=$dataWeapons[res];
	}else if(DataManager.isArmor(item)){
		const res=$gameSystem.duplicatedArmors_createNew(item.id,overwriteInfo);
		rtv=$dataArmors[res];
	}
	return rtv;
}).
add('gainItem',function f(item,amount,includeEquip){
	if(amount>=1&&item&&item.params&&item.params.randomEquipParams_format1){
		item=arguments[0]=this.randomEquipParams_createNew_format1.apply(this,arguments);
		return f.apply(this,arguments);
	}
	return f.ori.apply(this,arguments);
}).
getP;


})();
