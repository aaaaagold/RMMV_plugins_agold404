"use strict";
/*:
 * @plugindesc custom categories fields
 * @author agold404
 * 
 * 
 * @param BuiltInTogglesRoot
 * @type boolean
 * @text root built-in toggles
 * @desc set to false to hide all built-in item categories
 * @default true
 * 
 * @param BuiltInTogglesItem
 * @parent BuiltInTogglesRoot
 * @type boolean
 * @text item
 * @desc set to false to hide built-in "item" category
 * @default true
 * 
 * @param BuiltInTogglesWeapon
 * @parent BuiltInTogglesRoot
 * @type boolean
 * @text weapon
 * @desc set to false to hide built-in "weapon" category
 * @default true
 * 
 * @param BuiltInTogglesArmor
 * @parent BuiltInTogglesRoot
 * @type boolean
 * @text armor
 * @desc set to false to hide built-in "armor" category
 * @default true
 * 
 * @param BuiltInTogglesKeyItem
 * @parent BuiltInTogglesRoot
 * @type boolean
 * @text key item
 * @desc set to false to hide built-in "key item" category
 * @default true
 * 
 * @param CustomCategories
 * @type note[]
 * @text custom categories
 * @desc follow the existing example to set new custom categories.
each of the above texts will be parsed by `eval()`.
 * @default ["\"({\\n 'titleFunc':()=>\\\"items 0$\\\",\\n 'filterFunc':item=>item&&item.price===0,\\n 'comment':\\\"all items which is default 0$\\\",\\n})\""]
 * 
 * 
 * @help see default example to set new custom categories
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_SceneShop_CustomItemCategories";
const params=PluginManager.parameters(pluginName)||{};
params._builtInTogglesRoot=JSON.parse(useDefaultIfIsNone(params.BuiltInTogglesRoot,"true"));
params._builtInTogglesItem=JSON.parse(useDefaultIfIsNone(params.BuiltInTogglesItem,"true"));
params._builtInTogglesWeapon=JSON.parse(useDefaultIfIsNone(params.BuiltInTogglesWeapon,"true"));
params._builtInTogglesArmor=JSON.parse(useDefaultIfIsNone(params.BuiltInTogglesArmor,"true"));
params._builtInTogglesKeyItem=JSON.parse(useDefaultIfIsNone(params.BuiltInTogglesKeyItem,"true"));
params._customCategories=JSON.parse(useDefaultIfIsNone(params.CustomCategories,JSON.stringify(
["\"({\\n 'titleFunc':()=>\\\"items 0$\\\",\\n 'filterFunc':item=>item&&item.price===0,\\n 'categoryKey':\\\"0$item\\\",\\n 'comment':\\\"all items which is default 0$\\\", // \\n})\""]
))).map(text=>EVAL(JSON.parse(text)));
params._customCategoriesMap=new Map(params._customCategories.map(info=>[info.categoryKey,info]));


t=[
undefined,
params,
window.isTest(),
];


new cfc(Window_ItemCategory.prototype).
add('makeCommandList',function f(){
	let rtv;
	if(f.tbl[1]._builtInTogglesRoot) rtv=f.ori.apply(this,arguments);
	this.customItemCategories_makeCommandList.apply(this,arguments);
	return rtv;
},t).
add('makeCommandList_item',function f(){
	return f.tbl[1]._builtInTogglesItem&&f.ori.apply(this,arguments);
},t).
add('makeCommandList_weapon',function f(){
	return f.tbl[1]._builtInTogglesWeapon&&f.ori.apply(this,arguments);
},t).
add('makeCommandList_armor',function f(){
	return f.tbl[1]._builtInTogglesArmor&&f.ori.apply(this,arguments);
},t).
add('makeCommandList_keyItem',function f(){
	return f.tbl[1]._builtInTogglesKeyItem&&f.ori.apply(this,arguments);
},t).
addBase('customItemCategories_makeCommandList',function f(){
	for(let arr=f.tbl[1]._customCategories,x=0,xs=arr.length;x<xs;++x){
		const info=arr[x];
		this.addCommand(info.titleFunc.call(this),info.categoryKey);
	}
},t).
getP;

new cfc(Window_ItemList.prototype).
add('includes',function f(item){
	const info=f.tbl[1]._customCategoriesMap.get(this._category);
	return info?info.filterFunc(item):f.ori.apply(this,arguments);
},t).
getP;


})();

