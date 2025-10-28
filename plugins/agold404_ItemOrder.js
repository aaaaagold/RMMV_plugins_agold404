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
 * @default "(function(item){\n\treturn -this._itemOrder.uniqueGetIdx(item.id); // sync with Game_Party.prototype._itemOrder_getItemKey \n})"
 * 
 * @param LogItemGainOrder
 * @type boolean
 * @text enable logging item gain order
 * @desc true: enable ; false: disable
 * @default true
 * 
 * @param ReordModeBtn
 * @type text
 * @text reorder mode button
 * @desc Input a keyCode number to indicate a button on the keyboard. The others will not be guaranteed to work properly.
 * @default 81
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
params._reordModeBtnKeyCode=params.ReordModeBtn-0||0;

t=[
undefined,
params, // 1: plugin params
window.isTest(), // 2: isTest
function(val,i,a){ return [val,this[i]]; }, // 3: combine value and data
(a,b)=>a[0]-b[0], // 4: cmp
x=>x[1], // 5: map back from f.tbl[3]
function(cont,cmpValGetterFunc,a,b){
	const co=cont._customOrder;
	const valA=co&&a&&(a.id in co)?cont._customOrder[a.id]:(cmpValGetterFunc&&cmpValGetterFunc(a));
	const valB=co&&a&&(b.id in co)?cont._customOrder[b.id]:(cmpValGetterFunc&&cmpValGetterFunc(b));
	if(isNaN(valB)) return isNaN(valA)?0:-1; // put NaN last
	return valA-valB;
}, // 6: bind cmpValGetterFunc
"itemReorderMode", // 7: keyName
[144,144,0,0], // 8: reorder mode cursor color tone
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
	const srcObj=DataManager.duplicatedDataobj_getSrc(item);
	if(srcObj!==item){
		arguments[1]=srcObj;
		f.apply(this,arguments);
		arguments[1]=item;
	}
	const key=this._itemOrder_getItemKey(item,cont);
	if(key) arr.uniquePush(key);
},t).
addBase('_itemOrder_getOrderCont',function f(cont){
	if(!cont) return;
	let rtv=cont._itemOrder;
	if(!rtv){
		rtv=[];
		for(let k in cont){
			k-=0; if(isNaN(k)) continue; // sync typeof with itemOrder_getItemKey
			rtv.uniquePush(k);
		}
		cont._itemOrder=rtv;
	}
	return rtv;
},t).
addBase('_itemOrder_getItemKey',function f(item,cont){
	return (item&&item.id)-0; // typeof : 'number'
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
addBase('itemOrder_getCustomOrderCont',function f(cont,item){
	cont=cont||this.itemContainer(item);
	if(cont){
		let co=cont._customOrder; if(!co) co=cont._customOrder={};
		return co;
	}
}).
addBase('itemOrder_setCustomOrder',function f(cont,item,val){
	const co=this.itemOrder_getCustomOrderCont(cont,item);
	if(co) co[item.id]=val;
}).
addBase('itemOrder_getOrder',function f(cont,item){
	// exceptions -> cont._customOrder -> cmpValGetterFunc -> item.id
	if(!item) return NaN;
	cont=cont||this.itemContainer(item);
	if(cont){
		const co=this.itemOrder_getCustomOrderCont(cont,item);
		if(item.id in co) return co[item.id];
	}
	const cmpValGetterFunc=f.tbl[1]._func_itemToCmpVal;
	if(cmpValGetterFunc) return cmpValGetterFunc.call(cont,item);
	return item.id;
},t).
addBase('itemOrder_reorderList',function f(src,cont){
	const cmpValGetterFunc=f.tbl[1]._func_itemToCmpVal;
	//return src.map(cmpValGetterFunc,cont).map(f.tbl[3],src).sort(f.tbl[4]).map(f.tbl[5]);
	return src.sort(f.tbl[6].bind(this,cont,cmpValGetterFunc&&cmpValGetterFunc.bind(cont)));
},t).
getP;


new cfc(Window_ItemList.prototype).
addWithBaseIfNotOwn('processHandling_do',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.processHandling_reorderMode();
	return rtv;
}).
addBase('processHandling_reorderMode',function f(){
	if(this.isHandled(f.tbl[7]) && Input.isTriggered(f.tbl[7])) this.callHandler(f.tbl[7]);
	else return true;
},t).
addWithBaseIfNotOwn('processCursorMove',function f(){
	if(!this.itemOrder_isReorderMode()) return f.ori.apply(this,arguments);
	const lastIdx=this.index();
	const rtv=f.ori.apply(this,arguments);
	this.itemOrder_arrangeOrder(this.index(),lastIdx);
	return rtv;
}).
addWithBaseIfNotOwn('processTouch',function f(){
	if(!this.itemOrder_isReorderMode()) return f.ori.apply(this,arguments);
	const lastIdx=this.index();
	const rtv=f.ori.apply(this,arguments);
	this.itemOrder_arrangeOrder(this.index(),lastIdx);
	return rtv;
}).
addBase('itemOrder_isReorderMode',function f(){
	return this._isItemOrderReorderMode;
}).
addBase('itemOrder_arrangeOrder',function f(currIdx,lastIdx){
	if(currIdx===lastIdx) return;
	const item1=this._data[currIdx];
	const item2=this._data[lastIdx];
	if(!item1||!item2||item1===item2) return;
	const ord1=$gameParty.itemOrder_getOrder(undefined,item1);
	const ord2=$gameParty.itemOrder_getOrder(undefined,item2);
	$gameParty.itemOrder_setCustomOrder(undefined,item1,ord2);
	$gameParty.itemOrder_setCustomOrder(undefined,item2,ord1);
	this._data[currIdx]=item2;
	this._data[lastIdx]=item1;
	this.redrawItem(lastIdx);
	this.redrawItem(currIdx);
}).
getP;

new cfc(Scene_Item.prototype).
add('createItemWindow',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.itemOrder_setReorderModeHandlers();
	return rtv;
}).
addBase('itemOrder_setReorderModeHandlers',function f(){
	if(!this._itemWindow) return console.warn("[WARNING] 'this._itemWindow' is not created. the following process is skipped");
	this._itemWindow.setHandler(f.tbl[7],this.onReorderOk.bind(this));
},t).
addBase('itemOrder_setReorderMode',function f(val){
	const wnd=this._itemWindow;
	const csp=wnd._windowCursorSprite; if(!csp) return;
	if(val){
		if(!this._bak_itemWindowCursorColorTones){
			const baks=this._bak_itemWindowCursorColorTones=[];
			for(let arr=csp.children,x=arr.length;x--;){
				baks[x]=arr[x]._colorTone;
				arr[x].setColorTone(f.tbl[8]);
			}
		}
	}else{
		if(this._bak_itemWindowCursorColorTones){
			const baks=this._bak_itemWindowCursorColorTones;
			this._bak_itemWindowCursorColorTones=undefined;
			for(let arr=csp.children,x=arr.length;x--;) arr[x].setColorTone(baks[x]);
		}
	}
	wnd._isItemOrderReorderMode=this._isReorderMode=val;
},t).
add('onItemCancel',function f(){
	if(this._isReorderMode){
		this.itemOrder_setReorderMode(false);
		this.onReorderOk_cancelReorderResult(true);
		this._itemWindow.activate();
	}else return f.ori.apply(this,arguments);
}).
add('onItemOk',function f(){
	if(this._isReorderMode){
		this.itemOrder_setReorderMode(false);
		this.onReorderOk_saveReorderResult(true);
		this._itemWindow.activate();
	}else return f.ori.apply(this,arguments);
}).
addBase('onReorderOk',function f(){
	if(this._isReorderMode){
		this.itemOrder_setReorderMode(false);
		this.onReorderOk_saveReorderResult();
	}else{
		this.itemOrder_setReorderMode(true);
		this.onReorderOk_enterReorderMode();
	}
}).
addBase('onReorderOk_cancelReorderResult',function f(isSoundAlreadyPlayed){
	//console.log('cancel');
	if(!isSoundAlreadyPlayed) SoundManager.playCancel();
},t).
addBase('onReorderOk_saveReorderResult',function f(isSoundAlreadyPlayed){
	//console.log('save');
	if(!isSoundAlreadyPlayed) SoundManager.playOk();
},t).
addBase('onReorderOk_enterReorderMode',function f(isSoundAlreadyPlayed){
	//console.log('enter');
	if(!isSoundAlreadyPlayed) SoundManager.playCursor();
},t).
getP;

if(params._reordModeBtnKeyCode) Input.addKeyName(params._reordModeBtnKeyCode,t[7]);


})();
