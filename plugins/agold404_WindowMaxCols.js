"use strict";
/*:
 * @plugindesc custom number of columns in several window types
 * @author agold404
 * 
 * 
 * @param MaxColsWindowSkillList
 * @type number
 * @text Window_SkillList
 * @desc set a number for maxCols
 * @default 2
 * 
 * @param MaxColsWindowItemList
 * @type number
 * @text Window_ItemList
 * @desc set a number for maxCols
 * @default 2
 * 
 * 
 * @help .
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_WindowMaxCols";
const params=PluginManager.parameters(pluginName)||{};
params._maxColsWindowSkillList=useDefaultIfIsNaN(params.MaxColsWindowSkillList-0,2);
params._maxColsWindowItemList=useDefaultIfIsNaN(params.MaxColsWindowItemList-0,2);


t=[
undefined,
params,
window.isTest(),
[{}], // 3: dummy info
];


new cfc(Window_SkillList.prototype).
add('maxCols',function f(){
	return useDefaultIfIsNaN(this._maxCols,f.tbl[1]._maxColsWindowSkillList);
},t).
getP;

new cfc(Window_ItemList.prototype).
add('maxCols',function f(){
	return useDefaultIfIsNaN(this._maxCols,f.tbl[1]._maxColsWindowItemList);
},t).
getP;


})();
