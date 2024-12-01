"use strict";
/*:
 * @plugindesc set eval() script on game startup
 * @author agold404
 * 
 * @param OnLoad
 * @type note
 * @text onload
 * @desc evaluated (eval()) when script is loaded.
 * @default ""
 * 
 * @param OnBootStart
 * @type note
 * @text onbootStart
 * @desc evaluated (eval()) right before Scene_Boot.prototype.start is called
 * @default ""
 * 
 * @param OnBootTerminate
 * @type note
 * @text onbootTerminate
 * @desc evaluated (eval()) right after Scene_Boot.prototype.terminate is called
 * @default ""
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_StartupEval";
const params=PluginManager.parameters(pluginName);
params._onload=JSON.parse(getPropertyValue(params,'OnLoad','""'));
params._onbootStart=JSON.parse(getPropertyValue(params,'OnBootStart','""'));
params._onbootTerminate=JSON.parse(getPropertyValue(params,'OnBootTerminate','""'));

t=[
undefined,
params, // 1: plugin params
];

new cfc(Scene_Boot.prototype).add('start_before',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.startupEval_start();
	return rtv;
}).add('terminate_after',function f(){
	this.startupEval_terminate();
	return f.ori.apply(this,arguments);
}).addBase('startupEval_start',function f(){
	const s=f.tbl[1]._onbootStart;
	{ let k,r,t,f; { return eval(s); } }
},t).addBase('startupEval_terminate',function f(){
	const s=f.tbl[1]._onbootTerminate;
	{ let k,r,t,f; { return eval(s); } }
},t);

{ const s=params._onload;
{ let k,r,t,f; { return eval(s); } }
}

})();
