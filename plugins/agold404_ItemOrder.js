"use strict";
/*:
 * @plugindesc Customize item sorting order
 * @author agold404
 * 
 * 
 * @param ItemToCmpValFunc
 * @type note
 * @text itemValFunc
 * @desc define function here. `this` is corresponding the container like $gameParty._items, $gameParty._weapons, $gameParty._armors 
 * @default "(function(item){\n\treturn -this._itemOrder.uniqueGetIdx(item.id);\n})"
 * 
 * @param LogItemGainOrder
 * @type boolean
 * @text enable logging item gain order
 * @desc true: enable ; false: disable
 * @default true
 * 
 * 
 * @help customizing items' sorting order by providing a function that maps an item to it's comparision value.
 * itemValFunc: function(item){ ... return value_for_this_item; }
 *   value_for_this_item is recommended to be 'number' type
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_ItemOrder";
const params=PluginManager.parameters(pluginName)||{};
params._func_itemToCmpVal=EVAL.call(null,JSON.parse(params.ItemToCmpValFunc||"\"\""));
params._isEnableLogItemGainOrder=JSON.parse(params.LogItemGainOrder||"false");

t=[
undefined,
params, // 1: plugin params
window.isTest(), // 2: isTest
function(val,i,a){ return [val,this[i]]; }, // 3: combine value and data
(a,b)=>a[0]-b[0], // 4: cmp
x=>x[1], // 5: map back from f.tbl[3]
function(a,b){
	return this(a)-this(b);
}, // 6: bind cmpValGetterFunc
];


new cfc(Game_Party.prototype).
add('gainItem',function f(item,amount,includeEquip){
	const rtv=f.ori.apply(this,arguments);
	this.itemOrder_appendNew(rtv,item,amount,includeEquip);
	return rtv;
}).
addBase('itemOrder_appendNew',function f(cont,item,amount,includeEquip){
	if(!f.tbl[1]._isEnableLogItemGainOrder||!cont||amount<0) return; // not gain
	const arr=this._itemOrder_getOrderCont(cont);
	const key=this._itemOrder_getItemKey(item,cont);
	if(key) arr.uniquePush(key);
},t).
addBase('_itemOrder_getOrderCont',function f(cont){
	if(!cont) return;
	let rtv=cont._itemOrder;
	if(!rtv){
		rtv=[];
		for(let k in cont) rtv.uniquePush(k-0); // sync typeof with itemOrder_getItemKey
		cont._itemOrder=rtv;
	}
	return rtv;
},t).
addBase('_itemOrder_getItemKey',function f(item,cont){
	return item&&item.id-0; // typeof : 'number'
},t).
add('items',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.itemOrder_reorderList(rtv,this._items);
	return rtv;
}).
add('weapons',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.itemOrder_reorderList(rtv,this._weapons);
	return rtv;
}).
add('armors',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.itemOrder_reorderList(rtv,this._armors);
	return rtv;
}).
addBase('itemOrder_reorderList',function f(src,cont){
	const cmpValGetterFunc=f.tbl[1]._func_itemToCmpVal;
	if(!cmpValGetterFunc) return src;
	//return src.map(cmpValGetterFunc,cont).map(f.tbl[3],src).sort(f.tbl[4]).map(f.tbl[5]);
	return src.sort(f.tbl[6].bind(cmpValGetterFunc.bind(cont)));
},t).
getP;


})();
