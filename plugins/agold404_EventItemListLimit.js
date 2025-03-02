"use strict";
/*:
 * @plugindesc limit what item id can be displayed on Window_EventItem
 * @author agold404
 * @help provide 3 APIs
 * $gameSystem.EventItemList_setWhite( array_of_item_ids ); // for white list, ONLY these item will be displayed
 * $gameSystem.EventItemList_setBlack( array_of_item_ids ); // for black list, these item will NOT be displayed
 * $gameSystem.EventItemList_clear(); // clear setting to default. (probably is displaying all item if no other related plugins)
 * 
 * 'array' will not be deep copied. handle it by yourself.
 * calling $gameSystem.EventItemList_setWhite immediately after $gameSystem.EventItemList_setBlack or vice versa OVERWRITES the previous setting.
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

new cfc(Game_System.prototype).
addBase('_EventItemList_container',function(arr){
	let rtv=this._eventItemList;
	if(!rtv) rtv=this._eventItemList={isWhite:false,list:arr||[],};
	return rtv;
}).
addBase('_EventItemList_setList',function(arr,isWhite){
	const c=this._EventItemList_container(arr);
	c.isWhite=isWhite;
	c.list=arr;
}).
addBase('EventItemList_setWhite',function(arr){
	this._EventItemList_setList(arr,true);
}).
addBase('EventItemList_setBlack',function(arr){
	this._EventItemList_setList(arr,false);
}).
addBase('EventItemList_clear',function(){
	this._eventItemList=undefined;
}).
addBase('EventItemList_isPassed',function(item){
	const c=this._EventItemList_container(); if(!c) return true;
	if(!c.list._set) c.list._set=new Set(c.list);
	return c.list._set.has(item&&item.id)^!c.isWhite;
}).
getP;

new cfc(Window_EventItem.prototype).
add('includes',function f(item){
	return $gameSystem.EventItemList_isPassed(item) && f.ori.apply(this,arguments);
}).
getP;


})();
