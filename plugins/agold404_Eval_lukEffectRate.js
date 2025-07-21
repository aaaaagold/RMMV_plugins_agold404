"use strict";
/*:
 * @plugindesc custom lukEffectRate formula
 * @author agold404
 * @help .
 * 
 * 
 * @param LuckEffectRateEval
 * @type note
 * @text luck effect rate formula
 * @desc this text will be passed to eval()
 * @default "Math.max(1.0 + (this.subject().luk - target.luk) * 0.001, 0.0)"
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_Eval_lukEffectRate";
const params=PluginManager.parameters(pluginName)||{};
params._luckEffectRateEval=JSON.parse(params.LuckEffectRateEval||"\"1\"");


t=[
undefined,
params,
window.isTest(),
];


new cfc(Game_Action.prototype).
addBase('lukEffectRate',function f(target){
	const _s=f.tbl[1]._luckEffectRateEval;
	{ let f,params,t; {
		return eval(_s);
	} }
},t).
getP;


})();
