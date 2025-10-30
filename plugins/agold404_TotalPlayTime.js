"use strict";
/*:
 * @plugindesc recording total play time automatically.
 * @author agold404
 * 
 * @help there're some kinds of play time:
 * - in-map
 * - in-battle
 * - total game run (exclude boot)
 * 
 * one can set or clear the values.
 * 
 * the times count globally, ignoring save files loaded.
 * 
 * 
 * @param AutoUpdateInterval
 * @type number
 * @text interval in seconds
 * @desc interval in seconds to save total play times.
 * @default 4
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_TotalPlayTime";
const params=PluginManager.parameters(pluginName)||{};
params._autoUpdateInterval=(JSON.parse(getPropertyValue(params,'AutoUpdateInterval',4))-0)*1e3; if(isNaN(params._autoUpdateInterval)) params._autoUpdateInterval=4e3;

t=[
undefined,
params, // 1: plugin params
];

new cfc(SceneManager).addBase('totalPlayTime_inMap_get',function f(){
	return this._totalPlayTime_inMap-0||0;
}).addBase('totalPlayTime_inMap_set',function f(val){
	return this._totalPlayTime_inMap=val-0||0;
}).addBase('totalPlayTime_inMap_inc',function f(val){
	return this.totalPlayTime_inMap_set(this.totalPlayTime_inMap_get()+(val-0||0));
}).addBase('totalPlayTime_inBattle_get',function f(){
	return this._totalPlayTime_inBattle-0||0;
}).addBase('totalPlayTime_inBattle_set',function f(val){
	return this._totalPlayTime_inBattle=val-0||0;
}).addBase('totalPlayTime_inBattle_inc',function f(val){
	return this.totalPlayTime_inBattle_set(this.totalPlayTime_inBattle_get()+(val-0||0));
}).addBase('totalPlayTime_gameRun_get',function f(){
	return this._totalPlayTime_gameRun-0||0;
}).addBase('totalPlayTime_gameRun_set',function f(val){
	return this._totalPlayTime_gameRun=val-0||0;
}).addBase('totalPlayTime_gameRun_inc',function f(val){
	return this.totalPlayTime_gameRun_set(this.totalPlayTime_gameRun_get()+(val-0||0));
});


new cfc(Scene_Base.prototype).addBase('totalPlayTime_start',function f(val){
	val-=0;
	return this._totalPlayTime_lastRecordedTimestamp=val>=0?val:Date.now();
}).addBase('totalPlayTime_getStart',function f(){
	return this._totalPlayTime_lastRecordedTimestamp;
}).addBase('_totalPlayTime_update',function f(){
	// return time inc ; update "last recorded timestamp"
	const C=SceneManager;
	const last=this.totalPlayTime_getStart(); if(isNaN(last)) return 0; // not inited yet
	const now=this.totalPlayTime_start(Date.now());
	return Math.max(now-last,0)||0; // timer adjusted or calls too soon
});

new cfc(Scene_Map.prototype).
addWithBaseIfNotOwn('start_after',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.totalPlayTime_start();
	return rtv;
}).add('update',function f(){
	this.totalPlayTime_update();
	return f.ori.apply(this,arguments);
}).addBase('totalPlayTime_update',function f(){
	SceneManager.totalPlayTime_inMap_inc(this._totalPlayTime_update());
});

new cfc(Scene_Battle.prototype).
addWithBaseIfNotOwn('start_after',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.totalPlayTime_start();
	return rtv;
}).add('update',function f(){
	this.totalPlayTime_update();
	return f.ori.apply(this,arguments);
}).addBase('totalPlayTime_update',function f(){
	SceneManager.totalPlayTime_inBattle_inc(this._totalPlayTime_update());
});


new cfc(DataManager).add('saveGlobalInfo',function f(info){
	this.totalPlayTime_putToInfo(info);
	return f.ori.apply(this,arguments);
}).addBase('totalPlayTime_saveDisabled_get',function f(){
	return this._totalPlayTime_saveDisabled;
}).addBase('totalPlayTime_saveDisabled_set',function f(val){
	return this._totalPlayTime_saveDisabled=val;
}).addBase('totalPlayTime_removeSaveEnabled_get',function f(){
	return this._totalPlayTime_removeSaveEnabled;
}).addBase('totalPlayTime_removeSaveEnabled_set',function f(val){
	return this._totalPlayTime_removeSaveEnabled=val;
}).addBase('totalPlayTime_putToInfo',function f(info){
	if(!info||this.totalPlayTime_saveDisabled_get()) return info;
	info[0]=info[0]||{};
	if(this.totalPlayTime_removeSaveEnabled_get()) delete info[0].totalPlayTime;
	else info[0].totalPlayTime={
		inMap:SceneManager.totalPlayTime_inMap_get(),
		inBattle:SceneManager.totalPlayTime_inBattle_get(),
		gameRun:SceneManager.totalPlayTime_gameRun_get(),
	};
	return info;
});

new cfc(Scene_Boot.prototype).add('terminate_after',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.totalPlayTime_putTotalPlayTime();
	return rtv;
}).addBase('totalPlayTime_putTotalPlayTime',function f(){
	const g=DataManager.loadGlobalInfo();
	const totalPlayTime=g&&g[0]&&g[0].totalPlayTime||{};
	const C=SceneManager;
	C.totalPlayTime_inMap_set(totalPlayTime.inMap);
	C.totalPlayTime_inBattle_set(totalPlayTime.inBattle);
	C.totalPlayTime_gameRun_set(totalPlayTime.gameRun);
	C._totalPlayTime_lastRecordedTimestamp=Date.now();
});

new cfc(SceneManager).add('update',function f(){
	this.totalPlayTime_updateGameRun();
	return f.ori.apply(this,arguments);
}).addBase('totalPlayTime_updateGameRun',function f(){
	this.totalPlayTime_updateGameRun_do();
	this.totalPlayTime_updateGameRun_save();
}).addBase('totalPlayTime_updateGameRun_do',function f(){
	const C=SceneManager;
	const last=C._totalPlayTime_lastRecordedTimestamp; if(isNaN(last)) return; // not inited yet
	const now=C._totalPlayTime_lastRecordedTimestamp=Date.now(); if(now===last) return; // skip
	C.totalPlayTime_gameRun_inc(now-last);
}).addBase('totalPlayTime_updateGameRun_save',function f(){
	if(this.totalPlayTime_updateGameRun_save_condOk()) this.totalPlayTime_updateGameRun_save_do();
}).addBase('totalPlayTime_updateGameRun_save_condOk',function f(){
	return !(isNaN(this._totalPlayTime_lastRecordedTimestamp)||DataManager.totalPlayTime_saveDisabled_get()||Date.now()<this._totalPlayTime_nextUpdate);
}).addBase('totalPlayTime_updateGameRun_save_do',function f(){
	this._totalPlayTime_nextUpdate=Date.now()+f.tbl[1]._autoUpdateInterval;
	DataManager.saveGlobalInfo(DataManager.loadGlobalInfo());
},t).getP()._totalPlayTime_lastRecordedTimestamp=undefined;


})();
