"use strict";
/*:
 * @plugindesc adjust steps of setting volumes
 * @author agold404
 *
 * @param steps_normal
 * @default 5
 * @desc Setting the value of one step.
 *
 * @param steps_shift
 * @default 25
 * @text step (holding shift key)
 * @desc Setting the value of one step when holding shift key.
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_WindowOptions_volumeOffset";

new cfc(Window_Options.prototype).add('volumeOffset',function f(){
	const param=PluginManager.parameters(pluginName);
	const key=Input.isPressed('shift')?'steps_shift':'steps_normal';
	const val=param[key]-0;
	return isNaN(val)?f.tbl[0][key]:val;
},[
{
steps_normal:5,
steps_shift:25,
}, // 0: default for NaN
],true,true);

})();
