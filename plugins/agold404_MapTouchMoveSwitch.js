"use strict";
/*:
 * @plugindesc to enable or disable touch move in Scene_Map
 * @author agold404
 * 
 * 
 * @help APIs:
 *  $gameSystem.setMapTouchMoveSwitch( val );
 *   val:
 *    true-like or undefined: enable
 *    others: disable
 *   return: $gameSystem
 *  $gameSystem.getMapTouchMoveEnabled();
 *   return: if map touch move enabled
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_MapTouchMoveSwitch";
const params=PluginManager.parameters(pluginName)||{};


t=[
undefined,
params,
window.isTest(),
];


new cfc(Game_System.prototype).
addBase('setMapTouchMoveSwitch',function f(val){
	this._mapTouchMoveSwitch=val;
	return this;
}).
addBase('getMapTouchMoveEnabled',function f(){
	return this._mapTouchMoveSwitch||this._mapTouchMoveSwitch===undefined;
}).
getP;

new cfc(Scene_Map.prototype).
add('processMapTouch',function f(){
	return (!$gameSystem||$gameSystem.getMapTouchMoveEnabled())&&f.ori.apply(this,arguments);
}).
getP;


})();

