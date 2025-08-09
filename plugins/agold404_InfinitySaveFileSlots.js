"use strict";
/*:
 * @plugindesc make number of save files be infinity
 * @author agold404
 * 
 * 
 * @param InitSaveFileSlots
 * @type number
 * @text init. num. save file slots
 * @desc set initial number of save file slots
 * @default 20
 * 
 * 
 * @param ExtNumSaveFileSlots
 * @type number
 * @text ext. num. from last idx save slot
 * @desc extends number of slots from last index of save slot
 * @default 4
 * 
 * 
 * @help the total number of save slots will be:
 *   max( init. , last save idx. + ext. )
 *   where
 *     init. and ext. are plugin parameters
 *     last save idx. counts from 1
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_InfinitySaveFileSlots";
const params=PluginManager.parameters(pluginName)||{};
params._initSaveFileSlots=useDefaultIfIsNaN(params.InitSaveFileSlots-0,20);
params._extNumSaveFileSlots=useDefaultIfIsNaN(params.ExtNumSaveFileSlots-0,4);


t=[
undefined,
params,
window.isTest(),
[{}], // 3: dummy info
];


new cfc(DataManager).
add('maxSavefiles',function f(dataobj){
	const ori=f.ori&&f.ori.apply(this,arguments)-0||0;
	const jsonStr=DataManager.loadGlobalInfo_loadRaw();
	const gInfo=jsonStr?JSON.parse(jsonStr):f.tbl[3];
	return Math.max((gInfo&&gInfo.length-1||0)+f.tbl[1]._extNumSaveFileSlots||0,f.tbl[1]._initSaveFileSlots,ori);
},t).
getP;


})();
