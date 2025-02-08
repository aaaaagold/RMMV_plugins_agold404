"use strict";
/*:
 * @plugindesc fast forward
 * @author agold404
 * 
 * @help use ` to trigger
 * 
 * 
 * @param DefaultFastForwardRate
 * @type number
 * @text fast forward rate
 * @desc fast forward rate in integer ratio. the minimum is 1.
 * @default 8
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_FastForward";
const params=PluginManager.parameters(pluginName)||{};
params._defaultFastForwardRate=Math.max((JSON.parse(getPropertyValue(params,'DefaultFastForwardRate',8))-0)|0,1);

t=[
undefined,
params, // 1: plugin params
192, // 2: keyCode
];

new cfc(SceneManager).add('updateMain_data1',function f(isNotToUpdateInputData){
	if(Input.isPressed(f.tbl[2])){ for(let _=f.tbl[1]._defaultFastForwardRate;_--;){
		f.ori.apply(this,arguments);
	} }else return f.ori.apply(this,arguments);
},t);


})();
