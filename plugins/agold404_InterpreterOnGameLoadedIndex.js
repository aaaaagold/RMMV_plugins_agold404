"use strict";
/*:
 * @plugindesc reset `._index` of a Game_Interpreter to the save point when loading the game
 * @author agold404
 * 
 * 
 * @help each interpreter can only have 1 index save point.
 * the save point will also be cleared after calling `.clear()`
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_InterpreterOnGameLoadedIndex";
const params=PluginManager.parameters(pluginName)||{};


t=[
undefined,
params,
window.isTest(),
'_decode',
function f(val,circular,depth){
	const rtv=f.ori.apply(this,arguments);
	if(rtv instanceof Game_Interpreter){
		const idx=rtv.onGameLoadedIndex_get();
		if(idx!=null) rtv._index=idx;
	}
	return rtv;
}, // 4: JsonEx._decode
];


new cfc(Game_Interpreter.prototype).
add('clear',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.onGameLoadedIndex_clear();
	return rtv;
}).
addBase('onGameLoadedIndex_setHere',function (){
	this._onLoadIndex=this._index_cmdStart;
}).
addBase('onGameLoadedIndex_clear',function (){
	this._onLoadIndex=undefined;
}).
addBase('onGameLoadedIndex_get',function (){
	return this._onLoadIndex;
}).
getP;

new cfc(DataManager).
add('loadGame',function f(savefileId){
	const key=f.tbl[3];
	new cfc(JsonEx).add(key,f.tbl[4]);
	const rtv=f.ori.apply(this,arguments);
	JsonEx[key]=JsonEx[key].ori;
	return rtv;
},t).
geP;


})();

