"use strict";
/*:
 * @plugindesc Sets opacity for an event at start
 * @author agold404
 * 
 * 
 * @help
 * example use: <opacity:255> sets the event totally non-transparent
 * if <opacity: ... > does not appear, opacity of the event will NOT be changed
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_EventPageOpacity";
const params=PluginManager.parameters(pluginName)||{};

t=[
undefined,
params, // 1: plugin params
window.isTest(), // 2: isTest
',', // 3: separator
];


new cfc(Game_Event.prototype).
add('setupPageSettings',function f(){
	const page=f.ori.apply(this,arguments);
	this.setOpacityFromEventPageData(page);
	return page;
}).
addBase('setOpacityFromEventPageData',function f(page){
	const meta=this.getMeta();
	const o=meta&&meta.opacity; if(!o||o===true) return;
	const arr=o.split(f.tbl[3]).map(Number); if(isNaN(arr[0])) return;
	this.setOpacity(arr[0],arr[1],arr[2]);
},t).
getP;


})();
