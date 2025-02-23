"use strict";
/*:
 * @plugindesc edit battler's params via eval
 * @author agold404
 * 
 * @help original value can be accessed by "value".
 * change the value of "value" directly in eval().
 * "this" will be the battler.
 * 
 * 
 * @param BasicBattlerParametersBase
 * @type note
 * @text base basic battler parameters: mhp,mmp,atk,def,mat,mdf,agi,luk before rate calculation.
 * @desc texts here has no effects
 * 
 * @param BasicBattlerParametersBaseMhp
 * @parent BasicBattlerParametersBase
 * @type note
 * @text eval-ed text for base max hp
 * @desc text here will be put to eval with variable "value" representing original value.
 * 
 * @param BasicBattlerParametersBaseMmp
 * @parent BasicBattlerParametersBase
 * @type note
 * @text eval-ed text for base max mp
 * @desc text here will be put to eval with variable "value" representing original value.
 * 
 * @param BasicBattlerParametersBaseAtk
 * @parent BasicBattlerParametersBase
 * @type note
 * @text eval-ed text for base atk
 * @desc text here will be put to eval with variable "value" representing original value.
 * 
 * @param BasicBattlerParametersBaseDef
 * @parent BasicBattlerParametersBase
 * @type note
 * @text eval-ed text for base def
 * @desc text here will be put to eval with variable "value" representing original value.
 * 
 * @param BasicBattlerParametersBaseMat
 * @parent BasicBattlerParametersBase
 * @type note
 * @text eval-ed text for base mat
 * @desc text here will be put to eval with variable "value" representing original value.
 * 
 * @param BasicBattlerParametersBaseMdf
 * @parent BasicBattlerParametersBase
 * @type note
 * @text eval-ed text for base mdf
 * @desc text here will be put to eval with variable "value" representing original value.
 * 
 * @param BasicBattlerParametersBaseAgi
 * @parent BasicBattlerParametersBase
 * @type note
 * @text eval-ed text for base agi
 * @desc text here will be put to eval with variable "value" representing original value.
 * 
 * @param BasicBattlerParametersBaseLuk
 * @parent BasicBattlerParametersBase
 * @type note
 * @text eval-ed text for base luk
 * @desc text here will be put to eval with variable "value" representing original value.
 * 
 * 
 * @param BasicBattlerParametersReal
 * @type note
 * @text final basic battler parameters: mhp,mmp,atk,def,mat,mdf,agi,luk right before clampped by min and max.
 * @desc texts here has no effects
 * 
 * @param BasicBattlerParametersRealMhp
 * @parent BasicBattlerParametersReal
 * @type note
 * @text eval-ed text for real max hp
 * @desc text here will be put to eval with variable "value" representing original value.
 * 
 * @param BasicBattlerParametersRealMmp
 * @parent BasicBattlerParametersReal
 * @type note
 * @text eval-ed text for real max mp
 * @desc text here will be put to eval with variable "value" representing original value.
 * 
 * @param BasicBattlerParametersRealAtk
 * @parent BasicBattlerParametersReal
 * @type note
 * @text eval-ed text for real atk
 * @desc text here will be put to eval with variable "value" representing original value.
 * 
 * @param BasicBattlerParametersRealDef
 * @parent BasicBattlerParametersReal
 * @type note
 * @text eval-ed text for real def
 * @desc text here will be put to eval with variable "value" representing original value.
 * 
 * @param BasicBattlerParametersRealMat
 * @parent BasicBattlerParametersReal
 * @type note
 * @text eval-ed text for real mat
 * @desc text here will be put to eval with variable "value" representing original value.
 * 
 * @param BasicBattlerParametersRealMdf
 * @parent BasicBattlerParametersReal
 * @type note
 * @text eval-ed text for real mdf
 * @desc text here will be put to eval with variable "value" representing original value.
 * 
 * @param BasicBattlerParametersRealAgi
 * @parent BasicBattlerParametersReal
 * @type note
 * @text eval-ed text for real agi
 * @desc text here will be put to eval with variable "value" representing original value.
 * 
 * @param BasicBattlerParametersRealLuk
 * @parent BasicBattlerParametersReal
 * @type note
 * @text eval-ed text for real luk
 * @desc text here will be put to eval with variable "value" representing original value.
 * 
 * 
 * @param BasicBattlerParametersFinal
 * @type note
 * @text final basic battler parameters: mhp,mmp,atk,def,mat,mdf,agi,luk after final calculation calculation.
 * @desc texts here has no effects
 * 
 * @param BasicBattlerParametersFinalMhp
 * @parent BasicBattlerParametersFinal
 * @type note
 * @text eval-ed text for final max hp
 * @desc text here will be put to eval with variable "value" representing original value.
 * 
 * @param BasicBattlerParametersFinalMmp
 * @parent BasicBattlerParametersFinal
 * @type note
 * @text eval-ed text for final max mp
 * @desc text here will be put to eval with variable "value" representing original value.
 * 
 * @param BasicBattlerParametersFinalAtk
 * @parent BasicBattlerParametersFinal
 * @type note
 * @text eval-ed text for final atk
 * @desc text here will be put to eval with variable "value" representing original value.
 * 
 * @param BasicBattlerParametersFinalDef
 * @parent BasicBattlerParametersFinal
 * @type note
 * @text eval-ed text for final def
 * @desc text here will be put to eval with variable "value" representing original value.
 * 
 * @param BasicBattlerParametersFinalMat
 * @parent BasicBattlerParametersFinal
 * @type note
 * @text eval-ed text for final mat
 * @desc text here will be put to eval with variable "value" representing original value.
 * 
 * @param BasicBattlerParametersFinalMdf
 * @parent BasicBattlerParametersFinal
 * @type note
 * @text eval-ed text for final mdf
 * @desc text here will be put to eval with variable "value" representing original value.
 * 
 * @param BasicBattlerParametersFinalAgi
 * @parent BasicBattlerParametersFinal
 * @type note
 * @text eval-ed text for final agi
 * @desc text here will be put to eval with variable "value" representing original value.
 * 
 * @param BasicBattlerParametersFinalLuk
 * @parent BasicBattlerParametersFinal
 * @type note
 * @text eval-ed text for final luk
 * @desc text here will be put to eval with variable "value" representing original value.
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_CustomAbilityEval";
const params=PluginManager.parameters(pluginName)||{};
const emptyJsonString=JSON.stringify("");
params._base={
mhp:JSON.parse(params.BasicBattlerParametersBaseMhp||emptyJsonString),
mmp:JSON.parse(params.BasicBattlerParametersBaseMmp||emptyJsonString),
atk:JSON.parse(params.BasicBattlerParametersBaseAtk||emptyJsonString),
def:JSON.parse(params.BasicBattlerParametersBaseDef||emptyJsonString),
mat:JSON.parse(params.BasicBattlerParametersBaseMat||emptyJsonString),
mdf:JSON.parse(params.BasicBattlerParametersBaseMdf||emptyJsonString),
agi:JSON.parse(params.BasicBattlerParametersBaseAgi||emptyJsonString),
luk:JSON.parse(params.BasicBattlerParametersBaseLuk||emptyJsonString),
};
params._real={
mhp:JSON.parse(params.BasicBattlerParametersRealMhp||emptyJsonString),
mmp:JSON.parse(params.BasicBattlerParametersRealMmp||emptyJsonString),
atk:JSON.parse(params.BasicBattlerParametersRealAtk||emptyJsonString),
def:JSON.parse(params.BasicBattlerParametersRealDef||emptyJsonString),
mat:JSON.parse(params.BasicBattlerParametersRealMat||emptyJsonString),
mdf:JSON.parse(params.BasicBattlerParametersRealMdf||emptyJsonString),
agi:JSON.parse(params.BasicBattlerParametersRealAgi||emptyJsonString),
luk:JSON.parse(params.BasicBattlerParametersRealLuk||emptyJsonString),
};
params._final={
mhp:JSON.parse(params.BasicBattlerParametersFinalMhp||emptyJsonString),
mmp:JSON.parse(params.BasicBattlerParametersFinalMmp||emptyJsonString),
atk:JSON.parse(params.BasicBattlerParametersFinalAtk||emptyJsonString),
def:JSON.parse(params.BasicBattlerParametersFinalDef||emptyJsonString),
mat:JSON.parse(params.BasicBattlerParametersFinalMat||emptyJsonString),
mdf:JSON.parse(params.BasicBattlerParametersFinalMdf||emptyJsonString),
agi:JSON.parse(params.BasicBattlerParametersFinalAgi||emptyJsonString),
luk:JSON.parse(params.BasicBattlerParametersFinalLuk||emptyJsonString),
};

t=[
undefined, // 0: dev-reserve
params, // 1: plugin params
['mhp','mmp','atk','def','mat','mdf','agi','luk',], // 2: params
Utils.isOptionValid('test')||Utils.isOptionValid('btest')||Utils.isOptionValid('etest'), // 3: isTest
"[ERROR] [CustomAbilityEval] param error: {} {}", // 4: err msg
];


new cfc(Game_BattlerBase.prototype).
add('param',function f(paramId){
	let value=f.ori.apply(this,arguments);
	const s=f.tbl[1]._final[f.tbl[2][paramId]];
	if(s){
		const a=this,user=a;
		let f;
		eval(s);
	}
	if(f.tbl[3]&&s&&isNaN(value)){
		const msg=f.tbl[4].replace("{}","final").replace("{}",f.tbl[2][paramId]);
		console.error(msg);
		alert(msg);
	}
	value=value-0||0;
	return value;
},t).
add('param_real',function f(paramId){
	let value=f.ori.apply(this,arguments);
	const s=f.tbl[1]._real[f.tbl[2][paramId]];
	if(s){
		const a=this,user=a;
		let f;
		eval(s);
	}
	if(f.tbl[3]&&s&&isNaN(value)){
		const msg=f.tbl[4].replace("{}","real").replace("{}",f.tbl[2][paramId]);
		console.error(msg);
		alert(msg);
	}
	value=value-0||0;
	return value;
},t).
add('paramBase',function f(paramId){
	let value=f.ori.apply(this,arguments);
	const s=f.tbl[1]._base[f.tbl[2][paramId]];
	if(s){
		const a=this,user=a;
		let f;
		eval(s);
	}
	if(f.tbl[3]&&s&&isNaN(value)){
		const msg=f.tbl[4].replace("{}","base").replace("{}",f.tbl[2][paramId]);
		console.error(msg);
		alert(msg);
	}
	value=value-0||0;
	return value;
},t).
getP;


t=undefined;

})();
