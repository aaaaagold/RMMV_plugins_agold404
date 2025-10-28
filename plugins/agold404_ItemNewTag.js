"use strict";
/*:
 * @plugindesc item "NEW" tag
 * @author agold404
 * 
 * 
 * @param NewTagText
 * @type text
 * @text new tag text
 * @desc the text shown when an item is newly gained.
 * @default -NEW!-
 * 
 * @param NewTagFontSize
 * @type number
 * @text new tag font size
 * @desc the font size of the new tag
 * @default 16
 * 
 * @param NewTagFontColor
 * @type text
 * @text new tag font color
 * @desc the font color of the new tag
 * @default rgba(255,255,255,0.9375)
 * 
 * @param NewTagOutlineColor
 * @type text
 * @text new tag font color
 * @desc the font color of the new tag
 * @default rgba(128,128,0,0.75)
 * 
 * 
 * @help add "NEW" hint on newly gained items in backpack.
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_ItemNewTag";
const params=PluginManager.parameters(pluginName)||{};
params._newTagText=params.NewTagText||"-NEW!-";
params._newTagFontSize=Math.max(0,useDefaultIfIsNaN(JSON.parse(params.NewTagFontSize||"16")-0,16));
params._newTagFontColor=params.NewTagFontColor||"rgba(255,255,255,0.9375)";
params._newTagOutlineColor=params.NewTagOutlineColor||"rgba(128,128,0,0.75)";


t=[
undefined,
params, // 1: plugin params
window.isTest(), // 2: isTest
undefined, // 3: keyNames: [ [note,TRAIT_*,dataCode,[immDataCode,immTRAIT_*]] , ... ]
16, // 0: font size
];


new cfc(Game_Party.prototype).
add('gainItem',function f(item,amount,includeEquip){
	const rtv=f.ori.apply(this,arguments);
	if($gameTemp) $gameTemp.itemNewTag_onGainItem.apply($gameTemp,arguments);
	return rtv;
},t,true).
getP;

new cfc(Game_Temp.prototype).
addBase('itemNewTag_onGainItem',function f(item,amount,includeEquip){
	if(!this.itemNewTag_onGainItem_recordCondOk.apply(this,arguments)) return;
	this.itemNewTag_container_add(item);
	return this;
}).
addBase('itemNewTag_onGainItem_recordCondOk',function f(item,amount,includeEquip){
	return item && 0<amount && !(SceneManager._scene instanceof Scene_Equip); // SceneManager.isMapOrIsBattle();
}).
addBase('itemNewTag_container_getCont',function f(){
	let rtv=this._itemNewTag_cont; if(!rtv) rtv=this._itemNewTag_cont=[];
	return rtv;
}).
addBase('itemNewTag_container_clear',function f(item){
	this.itemNewTag_container_getCont().uniqueClear();
	return this;
}).
addBase('itemNewTag_container_add',function f(item){
	const cont=this.itemNewTag_container_getCont();
	for(let x=0,xs=arguments.length;x<xs;++x){
		const item=arguments[x];
		const itemSrc=DataManager.duplicatedDataobj_getSrc(item);
		cont.uniquePush(item,itemSrc);
	}
}).
addBase('itemNewTag_container_has',function f(item){
	return this.itemNewTag_container_getCont().uniqueHas(item);
}).
addBase('itemNewTag_isNewlyGainedItem',function f(item){
	return this.itemNewTag_container_has(item);
}).
getP;


new cfc(Window_ItemList.prototype).
add('drawItemByItemAndRect_main',function f(item,rect){
	const rtv=f.ori.apply(this,arguments);
	this.itemNewTag_drawItemByItemAndRect_drawIsNew.apply(this,arguments);
	return rtv;
}).
addBase('itemNewTag_drawItemByItemAndRect_drawIsNew',function f(item,rect){
	if(!$gameTemp.itemNewTag_isNewlyGainedItem(item)) return;
	const fontSettings=this.cloneFontSettings();
	const outlineColor=this.contents.outlineColor;
	const fsz=f.tbl[1]._newTagFontSize;
	this.changeFontSize(fsz); if(rect.height<this.lineHeight()) this.changeFontSize(fsz*rect.height/this.lineHeight());
	this.changeTextColor(f.tbl[1]._newTagFontColor);
	this.contents.outlineColor=f.tbl[1]._newTagOutlineColor;
	const width=Math.min(
		rect.width,
		Window_Base._iconWidth,
	);
	this.drawText(f.tbl[1]._newTagText,
		rect.x+2,
		rect.y,
		width,'center',({
			//inRectRange:rect,
	}));
	this.contents.outlineColor=outlineColor;
	this.applyFontSettings(fontSettings);
},t).
getP;


new cfc(Scene_MenuBase.prototype).
addWithBaseIfNotOwn('terminate_after',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.itemNewTag_clearRecordsOnTerminate.apply(this,arguments);
	return;
}).
addBase('itemNewTag_clearRecordsOnTerminate',function f(){
	const sc=SceneManager._scene;
	if((sc instanceof Scene_Shop)||!(sc._prevScene?(sc._prevScene instanceof Scene_Map):(SceneManager._nextScene instanceof Scene_Map))) return;
	$gameTemp.itemNewTag_container_clear();
	return;
}).
getP;


})();

