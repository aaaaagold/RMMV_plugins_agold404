"use strict";
/*:
 * @plugindesc Make default of "Always Dash" be on
 * @author agold404
 * 
 * @help .
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_DefaultOn_alwaysDash";
const params=PluginManager.parameters(pluginName)||{};

t=[
undefined,
params, // 1: plugin params
];

new cfc(ConfigManager).add('applyData',function f(config){
	if(config.alwaysDash===undefined) config.alwaysDash=true;
	return f.ori.apply(this,arguments);
});


})();
