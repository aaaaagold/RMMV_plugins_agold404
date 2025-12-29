"use strict";
/*:
 * @plugindesc depository where one can put thing inside.
 *
 * $gameParty.depository_open(depositoryId) // id can only be basic immutable type which can be converted to string type.
 *
 * $gameParty.depository_add(depositoryId,itemData,count) // return itemInfo
 * $gameParty.depository_del(depositoryId,itemData,count) // return -1 if fail
 *
 * $gameParty.depository_transIn(depositoryId,itemData,count) // return -1 if fail
 * $gameParty.depository_transOut(depositoryId,itemData,count) // return -1 if fail
 *
 * write <disableDepository> for disabling an item being put into depository
 * use $gameParty.depository_setItemCanUse(depositoryId,itemData)
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

new cfc(Game_Party.prototype).
addBase('_depository_getContAll',function f(){
	let rtv=this._depositoryCont; if(!rtv) rtv=this._depositoryCont={};
	return rtv;
}).
addBase('_depository_getContById',function f(id){
	const contAll=this._depository_getContAll();
	let rtv=contAll[id]; if(!rtv) rtv=contAll[id]=[];
	return rtv;
}).
addBase('depository_itemInfoToItemKey',function f(itemInfo){
	return itemInfo[0]+f.tbl[0]+itemInfo[1];
},[
":", // 0: sep
]).
addBase('depository_getItemInfo',function f(id,itemData,ensureExists){
	const cont=this._depository_getContById(id); // [  [Game_Item._dataClass,Game_Item._itemId,itemCnt] , ...  ]
	if(!cont._tbl){
		cont._tbl=new Map();
		cont.forEach(f.tbl[0],this);
	}
	const itemKeyInfo=new Game_Item(itemData).getItemKeyInfo();
	const itemKey=this.depository_itemInfoToItemKey(itemKeyInfo);
	let itemInfo=cont._tbl.get(itemKey);
	if(!itemInfo&&ensureExists){
		itemKeyInfo.push(0); // init cnt
		cont._tbl.set(itemKey,itemInfo=itemKeyInfo);
		cont.push(itemInfo);
	}
	return itemInfo;
},[
function(x,i,a){
	a._tbl.set(this.depository_itemInfoToItemKey(x),x);
}, // 0: forEach
]).
addBase('depository_getCnt',function f(id,itemData){
	const itemInfo=this.depository_getItemInfo(id,itemData);
	return itemInfo&&itemInfo[2]-0||0;
}).
addBase('depository_getTotalCnt',function f(id){
	const cont=this._depository_getContById(id);
	if(cont._totalCnt==null) cont._totalCnt=cont.reduce(f.tbl[0],0);
	return cont._totalCnt;
},[
(r,n)=>r+n[2], // 0: reduce
]).
addBase('_depository_getTotalCnt_addDelta',function f(id,dVal){
	this._depository_getContById(id)._totalCnt=this.depository_getTotalCnt(id)+dVal;
}).
addBase('depository_getItemCapacityCost',function f(item){
	return item?1:0;
}).
addBase('depository_getTotalCapacityUsed',function f(id){
	const cont=this._depository_getContById(id);
	if(cont._totalCapUsed==null) cont._totalCapUsed=this.depository_getTotalCnt(id); // TODO
	return cont._totalCapUsed;
}).
addBase('_depository_getTotalCapacityUsed_addDelta',function f(id,dVal){
	this._depository_getContById(id)._totalCapUsed=this.depository_getTotalCapacityUsed(id)+dVal;
}).
addBase('depository_add',function f(id,itemData,cnt,_reserved,_internal_itemInfo){
	cnt=cnt-0||0;
	const itemInfo=this.depository_getItemInfo(id,itemData,true);
	itemInfo[2]+=cnt;
	this._depository_getTotalCnt_addDelta(id,cnt);
	this._depository_getTotalCapacityUsed_addDelta(id,this.depository_getItemCapacityCost(itemData)*cnt);
	const arg4=arguments[4];
	arguments[4]=itemInfo;
	this.depository_onAdd.apply(this,arguments);
	arguments[4]=arg4;
	return itemInfo;
}).
addBase('depository_onAdd',function f(id,itemData,cnt,itemInfo){
	// TODO: notify the things are added
	// override it for other usages, like GC dynamic itemData
}).
addBase('depository_del',function f(id,itemData,cnt,isIgnoringInsufficient,_internal_itemInfo){
	cnt=cnt-0||0;
	const itemInfo=this.depository_getItemInfo(id,itemData); if(!itemInfo||(!isIgnoringInsufficient&&!(itemInfo[2]>=cnt))) return -1;
	const cont=this._depository_getContById(id);
	if(!(0<(itemInfo[2]-=cnt))){
		const idx=cont.indexOf(itemInfo); if(idx>=0) cont.splice(idx,1);
		if(cont._tbl) cont._tbl.delete(this.depository_itemInfoToItemKey(itemInfo));
	}
	this._depository_getTotalCnt_addDelta(id,-cnt);
	this._depository_getTotalCapacityUsed_addDelta(id,this.depository_getItemCapacityCost(itemData)*-cnt);
	const arg4=arguments[4];
	arguments[4]=itemInfo;
	this.depository_onDel.apply(this,arguments);
	arguments[4]=arg4;
}).
addBase('depository_onDel',function f(id,itemData,cnt,isIgnoringInsufficient,itemInfo){
	// TODO: notify the things are added
	// override it for other usages, like GC dynamic itemData
}).
addBase('depository_delCont',function f(id){
	const cont=this._depository_getContAll();
	delete cont[id];
	this.depository_onDelCont.apply(this,arguments);
}).
addBase('depository_onDelCont',function f(id){
	// TODO: notify the things are added
	// override it for other usages, like GC dynamic itemData
}).
addBase('depository_transIn',function f(id,itemData,cnt,totalCapacity){
	// move items into depository
	cnt=cnt-0||0;
	totalCapacity=useDefaultIfIsNone(totalCapacity,undefined);
	if(cnt<0) return this.depository_transOut(id,itemData,-cnt);
	if(totalCapacity<this.depository_getTotalCapacityUsed(id)+this.depository_getItemCapacityCost(itemData)*cnt) return -1;
	if(!(cnt>=0&&this.numItems(itemData)>=cnt)) return -1;
	this.depository_add(id,itemData,cnt);
	this.gainItem(itemData,-cnt);
}).
addBase('depository_transOut',function f(id,itemData,cnt){
	// move items out from depository
	cnt=cnt-0||0;
	if(cnt<0) return this.depository_transIn(id,itemData,-cnt);
	if(!(cnt>=0)||this.depository_del(id,itemData,cnt)<0) return -1;
	this.gainItem(itemData,cnt);
}).
addBase('depository_getItemList',function f(id,isPrintingRawData){
	return isPrintingRawData?this._depository_getContById(id):this._depository_getContById(id).map(f.tbl[1]);
},[
undefined, // 0: tbl
function f(info){
	return Game_Item.itemKeyInfoToDataobj(info);
}, // 1: map
]).
getP;

new cfc(Game_Temp.prototype).
addBase('depository_open',function f(depositoryId,options){
	this._depositoryId=depositoryId;
	this._depositoryOptions=options;
	SceneManager.push(Scene_Depository);
});

{
const a=class Window_Depository_CategoryCommand extends Window_HorzCommand{
makeCommandList_isEnabled_item(){
	return true;
}
makeCommandList_isEnabled_weapon(){
	return true;
}
makeCommandList_isEnabled_armor(){
	return true;
}
makeCommandList_isEnabled_keyItem(){
	return true;
}
makeCommandList_isEnabled_depository(){
	return true;
}
getCategory(){
	return this._category;
}
getListWindow(){
	return this._listWindow;
}
setListWindow(listWnd){
	this._listWindow=listWnd;
}
getDepositoryItemListWindow(){
	this._depositoryItemListWindow;
}
setDepositoryItemListWindow(listWnd){
	this._depositoryItemListWindow=listWnd;
}
};
window[a.name]=a;
a.ori=Window_HorzCommand;
new cfc(a.prototype).
addBase('initialize',function f(x,y,w,_h){
	f.tbl[0][f._funcName].apply(this,arguments);
	this.width=w;
	this.height=this.fittingHeight(1);
	this.refresh();
	this.updateCursor();
},t=[
a.ori.prototype,
]).
addBase('update',function f(){
	const rtv=f.tbl[0][f._funcName].apply(this,arguments);
	this.updateListWindow();
	return rtv;
},t).
addBase('updateListWindow',function f(){
	if(!this._listWindow) return;
	const key=f.tbl[0][this.currentSymbol()];
	if(this[key]) this[key]();
},[
{
item:'updateListWindow_item',
weapon:'updateListWindow_weapon',
armor:'updateListWindow_armor',
keyItem:'updateListWindow_keyItem',
depository:'updateListWindow_depository',
}, // 0: funcName tbl
]).addBase('updateListWindow_basicCommon',r=function f(){
	this.getListWindow().setCategory(this.currentSymbol());
}).
addBase('updateListWindow_item',r).
addBase('updateListWindow_weapon',r).
addBase('updateListWindow_armor',r).
addBase('updateListWindow_keyItem',r).
addBase('updateListWindow_depository',none).
addBase('makeCommandList',function f(){
	let tmp; try{ tmp=Intl.DateTimeFormat().resolvedOptions().locale; }catch(e){}
	if(!f.tbl[0]._default){ f.tbl[0]._default={
		item:TextManager.item,
		weapon:TextManager.weapon,
		armor:TextManager.armor,
		keyItem:TextManager.keyItem,
		depository:'depository',
	}; }
	const txts=f.tbl[0][tmp]||f.tbl[0]._default;
	this.addCommand(txts.depository , 'depository' , this.makeCommandList_isEnabled_depository ());
	this.addCommand(txts.item       , 'item'       , this.makeCommandList_isEnabled_item       ());
	this.addCommand(txts.weapon     , 'weapon'     , this.makeCommandList_isEnabled_weapon     ());
	this.addCommand(txts.armor      , 'armor'      , this.makeCommandList_isEnabled_armor      ());
	this.addCommand(txts.keyItem    , 'keyItem'    , this.makeCommandList_isEnabled_keyItem    ());
},[
{
"zh-TW":{
item:'道具',
weapon:'武器',
armor:'防具',
keyItem:'重要道具',
depository:'倉庫',
},
}, // 0: text by locale
]).
addBase('maxCols',function f(){
	return f.tbl[0];
},[
5,
]).
getP;
}

{
const a=class Window_Depository_Common extends Window_ItemList{
isEnabled(item){ return !!item; }
isCursorMovable(){ return this.active; }
select(idx){
	if(isNaN(idx)) return;
	return Window_ItemList.prototype.select.apply(this,arguments);
}
_onSwitchToWindow(nxt){
}
_switchToWindow(nxt,wrap){
	if(!nxt||!wrap) return;
	this.deactivate();
	this.updateInputData();
	if(!(nxt.index()>=0)) nxt.select(0); // error handle without UX
	const a0=this.alpha;
	const a1=nxt.alpha;
	nxt.alpha=a0;
	this.alpha=a1;
	nxt.activate();
	SoundManager.playCursor();
	this._onSwitchToWindow(nxt);
}
};
window[a.name]=a;
}

{
const a=class Window_Depository_BackpackItemList extends Window_Depository_Common{
initialize(x,y,w,h,opt){
	// opt === from $gameTemp._depositoryOptions
	const rtv=Window_Depository_Common.prototype.initialize.apply(this,arguments);
	this._availableItems=opt&&opt.availableItems&&new Set(opt.availableItems);
	return rtv;
}
includes(item){
	return (!this._availableItems||this._availableItems.has(item)||this._availableItems.has(DataManager.duplicatedDataobj_getSrc(item)))&&Window_Depository_Common.prototype.includes.apply(this,arguments);
}
isEnabled(item){ return !!item; }
setDepositoryItemListWindow(wnd){ this._depositoryItemListWindow=wnd; }
_switchToDepositoryItemListWindow(wrap){
	this._switchToWindow(this._depositoryItemListWindow,wrap);
}
cursorLeft(wrap){
	this._switchToDepositoryItemListWindow(wrap);
}
cursorRight(wrap){
	this._switchToDepositoryItemListWindow(wrap);
}
};
window[a.name]=a;
}

{
const a=class Window_Depository_DepositoryItemList extends Window_Depository_Common{
isEnabled(item){ return !!item; }
setBackpackItemListWindow(wnd){ this._backpackItemListWindow=wnd; }
_switchToBackpackItemListWindow(wrap){
	this._switchToWindow(this._backpackItemListWindow,wrap);
}
cursorLeft(wrap){
	this._switchToBackpackItemListWindow(wrap);
}
cursorRight(wrap){
	this._switchToBackpackItemListWindow(wrap);
}
makeItemList(){
	this._data=$gameParty.depository_getItemList(this._depositoryId);
} // capability
drawItemNumber(item,x,y,width){
	if(this.needsNumber()) this.drawItemNumber_num(item,x,y,width,$gameParty.depository_getCnt(this._depositoryId,item));
}
};
window[a.name]=a;
}

{
const a=function Scene_Depository(){
	this.initialize.apply(this, arguments);
};
a.ori=Scene_MenuBase;
window[a.name]=a;
const p=a.prototype=Object.create(a.ori.prototype);
p.constructor=a;
const activeAlphas=[
0.75, // 0: deactivated window alpha // dpst or pak
1, // 1: activated window alpha // dpst or pak
];
Object.defineProperty(p,'_itemWindow',{
	set:function(rhs){
		return this._window_itemList_backpack=rhs;
	},get:function(){
		return this._window_itemList_backpack;
	},configurable:true,
});
new cfc(p).
addWithBaseIfNotOwn('initialize',function f(){
	f.ori.apply(this,arguments);
	this._depositoryId=$gameTemp._depositoryId;
	this._depositoryOptions=$gameTemp._depositoryOptions;
	this._catIdx={};
	this._prevScene_store();
	{
		const opt=this._depositoryOptions;
		this._capacity=useDefaultIfIsNone(opt&&opt.capacity,undefined);
	}
}).
addWithBaseIfNotOwn('create',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.createWindows();
	this._prevScene_restore();
	this.tryCreateRandomParamsLayeredItemWindow();
	return rtv;
}).
addWithBaseIfNotOwn('update',function f(){
	this.update_backupSelects();
	this.update_touch();
	return f.ori.apply(this,arguments);
}).
addBase('update_backupSelects',function f(){
	const dpst=this._window_itemList_depository,pak=this._window_itemList_backpack;
	if(dpst.active) this._catIdx.depository=dpst.index();
	if(pak.active) this._catIdx[pak._category]=pak.index();
}).
addBase('update_touch',function f(){
	const TI=TouchInput; if(!TI.isTriggered()) return;
	if(this.update_touch_testLayeredItemWindow(TI)) return; // fit RandomParamsEquip
	if(this.update_touch_testCategoryWindow(TI)) return;
	if(this.update_touch_testDepositoryWindow(TI)) return;
	if(this.update_touch_testBackpackWindow(TI)) return;
}).
addBase('update_touch_testLayeredItemWindow',function f(globalXy){
	const func=this.randomEquipParams_isUsingLayeredWindows;
	const lw=func&&func.call(this); if(!lw) return;
	if(!lw.visible||lw.isClosed()) return;
	if(lw.activive) return -2;
	const xy=lw.toLocal(TouchInput);
	if(!lw.containsPoint_local(xy)) return;
	this.update_touch_closeAddons_windowInputText.apply(this,arguments);
	lw.activate();
	return true;
}).
addBase('update_touch_testWindowCommon',function f(wnd,globalXy,actFunc){
	// actFunc = function(selectIndex){ ... }
	if(!wnd.hitTest) return;
	const xy=wnd.toLocal(globalXy);
	if(!wnd.containsPoint_local(xy)) return;
	const idx=wnd.hitTest(xy.x,xy.y);
	if(wnd.active) return -2; // already activated. don't do more.
	this._window_category.deactivate();
	this._window_itemList_depository.deactivate();
	this._window_itemList_backpack.deactivate();
	wnd.activate();
	if(actFunc) actFunc.call(this,idx);
	return true; // avoid 0
}).
addBase('update_touch_closeAddons',function f(){
	this.update_touch_closeAddons_layeredItemWindow.apply(this,arguments);
	this.update_touch_closeAddons_windowInputText.apply(this,arguments);
}).
addBase('update_touch_closeAddons_layeredItemWindow',function f(){
{ const func=this.changeUiState_toCloseLayeredItemWindow; func&&func.call(this); }
}).
addBase('update_touch_closeAddons_windowInputText',function f(){
{ const wnd=this.getWindowInputText(); if(wnd){ wnd._listWindow=undefined; if(wnd.isClosed()){ wnd.open(); wnd.updateOpen(); } wnd.close(); } }
}).
addBase('update_touch_testCategoryWindow',function f(globalXy){
	const wnd=this._window_category;
	return this.update_touch_testWindowCommon(wnd,globalXy,f.tbl[0]);
},[
function f(idx){
	//if(!(idx>=0)) return; // need to execute `this.onCategoryOk();` even idx is not valid
	this.update_touch_closeAddons.apply(this,arguments);
	if(this._window_category.index()!==idx) SoundManager.playCursor(); // temp.
	this._window_category.select(idx);
	this.onCategoryOk();
}, // 0: actFunc
]).
addBase('update_touch_testDepositoryWindow',function f(globalXy){
	if(!f.tbl[0].tbl) f.tbl[0].tbl=f.tbl[1];
	return this.update_touch_testWindowCommon(this._window_itemList_depository,globalXy,f.tbl[0]);
},[
function f(idx){
	this.update_touch_closeAddons.apply(this,arguments);
this._window_itemList_backpack.alpha=f.tbl[0];
this._window_itemList_depository.alpha=f.tbl[1];
if(this._window_itemList_depository.index()===idx) TouchInput.clear();
}, // 0: actFunc
activeAlphas,
]).
addBase('update_touch_testBackpackWindow',function f(globalXy){
	if(!f.tbl[0].tbl) f.tbl[0].tbl=f.tbl[1];
	return this.update_touch_testWindowCommon(this._window_itemList_backpack,globalXy,f.tbl[0]);
},[
function f(idx){
	this.update_touch_closeAddons.apply(this,arguments);
this._window_itemList_depository.alpha=f.tbl[0];
this._window_itemList_backpack.alpha=f.tbl[1];
if(this._window_itemList_backpack.index()===idx) TouchInput.clear();
}, // 0: actFunc
activeAlphas,
]).
addBase('createWindows',function f(){
	let tmpU,tmpD,tmpL,tmpR;
	tmpU=this.createWindow_operationHelp();
	tmpU=this.createWindow_category(tmpU);
	tmpD=this.createWindow_description();
	
	tmpR=this.createWindow_itemList_backpack(tmpU,tmpD,tmpL,tmpR);
	tmpD=this.createWindow_itemList_depositoryCapacity(tmpU,tmpD,tmpL,tmpR);
	this.createWindow_itemList_depository(tmpU,tmpD,tmpL,tmpR);
	
	this.createWindow_END();
}).
addBase('createWindow_operationHelp',function f(wndAbove,wndBelow){
	let rtv;
	this.addChild(rtv=this._window_operationHelp=new Window_Help(f.tbl[0]));
	if(!f.tbl[1].ori) f.tbl[1].ori=rtv.constructor.prototype.standardFontSize;
	rtv.standardFontSize=f.tbl[1];
	rtv.height=rtv.fittingHeight(f.tbl[0]);
	rtv.createContents();
	//rtv.setText(this.createWindow_operationHelp_getDefaultTxt("backpack"));
	return rtv;
},[
1, // 0: line count
function f(){
	return ~~(f.ori.apply(this,arguments)*0.875);
}, // 1: smaller fontSize
]).
addBase('createWindow_operationHelp_getDefaultTxt',function f(state){
	let tmp; try{ tmp=Intl.DateTimeFormat().resolvedOptions().locale; }catch(e){}
	const txts=f.tbl[0][tmp]||f.tbl[0]._default;
	return txts[state]||f.tbl[1];
},[
{
_default:{
"depository":"press \\C[6]ok\\C[0] to set cursor on items in the depository.",
"backpack":"press \\C[6]ok\\C[0] to set cursor on items in the backpack.",
"inDepository":"press \\C[6]ok\\C[0] to retrieve the item. \\C[6]L./R.\\C[0] switch to backpack.",
"inBackpack":"press \\C[6]ok\\C[0] to store the item. \\C[6]L./R.\\C[0] switch to depository.",
},
"zh-TW":{
"depository":"按下\\C[6]確認\\C[0]選取倉庫中的道具。",
"backpack":"按下\\C[6]確認\\C[0]選取背包中的道具。",
"inDepository":"按下\\C[6]確認\\C[0]將道具從倉庫放入背包。\\C[6]左/右\\C[0]切換選取框至背包。",
"inBackpack":"按下\\C[6]確認\\C[0]將道具從背包放入倉庫。\\C[6]左/右\\C[0]切換選取框至倉庫。",
}, // 0-"zh-TW"
}, // 0: txt
"", // 1: empty string
]).
addBase('createWindow_operationHelp_setState',function f(state){
	const wnd=this._window_operationHelp; if(!wnd) return;
	wnd.setText(this.createWindow_operationHelp_getDefaultTxt(state));
}).
addBase('createWindow_category',function f(wndAbove,wndBelow){
	let rtv;
	const y0=wndAbove?wndAbove.y+wndAbove.height:0;
	const y1=wndBelow?wndBelow.y:Graphics.boxHeight;
	this.addChild(rtv=this._window_category=new Window_Depository_CategoryCommand(0,y0,Graphics.boxWidth));
	rtv.onSelect=f.tbl[0].bind(this);
	rtv.setHandler('ok',this.onCategoryOk.bind(this));
	rtv.setHandler('cancel',this.popScene.bind(this));
	return rtv;
},[
function f(){
	this.createWindow_operationHelp_setState(this._window_category.currentSymbol()==='depository'?"depository":"backpack");
},
]).
addBase('createWindow_itemList_backpack',function f(wndAbove,wndBelow,wndLeft,wndRight){
	let rtv;
	const x0=wndLeft?wndLeft.x+wndLeft.width:0;
	const x1=wndRight?wndRight.x:Graphics.boxWidth;
	const y0=wndAbove?wndAbove.y+wndAbove.height:0;
	const y1=wndBelow?wndBelow.y:Graphics.boxHeight;
	const w=f.tbl[0]();
	this.addChild(rtv=this._window_itemList_backpack=new Window_Depository_BackpackItemList(x1-w,y0,w,y1-y0,this._depositoryOptions));
	rtv.maxCols=f.tbl[1];
	rtv._onSwitchToWindow=f.tbl[2].switchToDepository.bind(this);
	rtv.setHandler('ok',this.onBackpackListOk.bind(this));
	rtv.setHandler('cancel',this.onBackpackListCancel.bind(this));
	return rtv;
},t=[
()=>(Graphics.boxWidth>>1)+(Graphics.boxWidth>>3), // 0: get window width
()=>1, // 1: maxCols
{
"switchToBackpack":function f(){
	this.createWindow_operationHelp_setState("inBackpack");
},
"switchToDepository":function f(){
	this.createWindow_operationHelp_setState("inDepository");
},
}, // 2: setOpHelpText
]).
addBase('createWindow_itemList_depositoryCapacity',function f(wndAbove,wndBelow,wndLeft,wndRight){
	if(this._capacity==null) return wndBelow;
	let rtv;
	const x0=wndLeft?wndLeft.x+wndLeft.width:0;
	const x1=wndRight?wndRight.x:Graphics.boxWidth;
	const y0=wndAbove?wndAbove.y+wndAbove.height:0;
	const y1=wndBelow?wndBelow.y:Graphics.boxHeight;
	this.addChild(rtv=this._window_itemList_depositoryCapacity=new Window_Help(1));
	rtv._scene=this;
	rtv.width=x1-x0;
	rtv.position.set(0,y1-rtv.height);
	return rtv;
}).
addBase('createWindow_itemList_depository',function f(wndAbove,wndBelow,wndLeft,wndRight){
	let rtv;
	const x0=wndLeft?wndLeft.x+wndLeft.width:0;
	const x1=wndRight?wndRight.x:Graphics.boxWidth;
	const y0=wndAbove?wndAbove.y+wndAbove.height:0;
	const y1=wndBelow?wndBelow.y:Graphics.boxHeight;
	this.addChild(rtv=this._window_itemList_depository=new Window_Depository_DepositoryItemList(x0,y0,x1-x0,y1-y0));
	rtv.maxCols=f.tbl[1];
	rtv._onSwitchToWindow=f.tbl[2].switchToBackpack.bind(this);
	rtv.makeItemList=this.depository_makeDepositoryItemList.bind(this);
	rtv.drawItemNumber=this.depository_drawDepositoryItemNumber.bind(this);
	rtv.refresh();
	rtv.setHandler('ok',this.onDepositoryListOk.bind(this));
	rtv.setHandler('cancel',this.onDepositoryListCancel.bind(this));
	return rtv;
},t).
addBase('createWindow_description',function f(wndAbove,wndBelow){
	let rtv;
	const y0=wndAbove?wndAbove.y+wndAbove.height:0;
	const y1=wndBelow?wndBelow.y:Graphics.boxHeight;
	this.addChild(rtv=this._window_description=new Window_Help(f.tbl[0]));
	rtv.y=Graphics.boxHeight-rtv.height;
	return rtv;
},[
2, // 0: line count
]).
addBase('createWindow_windowInputText',function f(){
	if(typeof Window_InputText==='undefined') return;
	const wnd=this._windowInputText=new Window_InputText(0,0,1,1,f.tbl[0]);
	this.addChild(wnd);
	wnd._scene=this;
	wnd.height=Math.ceil(wnd.standardFontSize()*1.25+wnd.standardPadding()*2);
	wnd.onclosed=f.tbl[1];
},[
({
line1:"arrowsToAdjustNumber:10",
align:'right',
updatePolling:function(){
	if(!this._listWindow||this._listWindow.isClosing()||this._listWindow.isClosed()) this.close();
},
cancelCallback:function(){
	SoundManager.playCancel();
	this._wnd.close();
	//this.blur(); // too early
},
escAsCancel:true,
okCallback:function(){
	const wnd=this._wnd;
	const self=wnd._scene;
	const val=this.value-0;
	if(self.onCommonOk_item(wnd._listWindow,wnd._selectFunc,this.value)){
		// err
	}else{
		SoundManager.playOk();
		wnd._listWindow.refresh();
		wnd.close();
		//this.blur(); // too early
	}
	wnd.deactivate(); // wait for using `onclosed()` to `activate()`
},
enterAsOk:true,
btns:"left-h",
}), // 0: opt
function(){
	if(this._listWindow) this._listWindow.activate();
	this._textarea.blur();
	Graphics._canvas.focus();
	Input.isTexting_clear();
}, // 1: onclosed
]).
addBase('getWindowInputText',function f(){
	return this._windowInputText;
}).
addBase('createWindow_END',function f(){
	const cat=this._window_category;
	cat.setListWindow(this._window_itemList_backpack);
	cat.setDepositoryItemListWindow(this._window_itemList_depository);
	
	const dpst=this._window_itemList_depository,pak=this._window_itemList_backpack;
	dpst._categoryWindow=cat;
	pak._categoryWindow=cat;
	
	dpst.setBackpackItemListWindow(pak);
	pak.setDepositoryItemListWindow(dpst);
	
	const d=this._window_description;
	dpst.setHelpWindow(d);
	pak.setHelpWindow(d);
	
	cat.select(1); // call for onSelect calling setText
	this.refreshCapacityWindow();
	
	this.createWindow_windowInputText(); // try Window_InputText
	{ const wnd=this.getWindowInputText(); if(wnd){
	wnd.close();
	} }
}).
addBase('onCommonOk_selectValid',function f(wnd,idx){
	const newIdx=Math.max(Math.min(idx,wnd.maxItems()-1),0);
	if(wnd.index()!==newIdx) wnd.select(newIdx);
}).
addBase('refreshCapacityWindow',function f(){
	const wnd=this._window_itemList_depositoryCapacity; if(!wnd) return;
	wnd.setText($gameParty.depository_getTotalCapacityUsed(this._depositoryId)+' / '+this._capacity);
}).
addBase('onCommonOk_item',function f(wnd,func,amount){
	const item=wnd.item();
	if(item && amount===undefined){ const wit=this.getWindowInputText(); if(wit){
		wnd.deactivate();
		wit._listWindow=wnd;
		wit._selectFunc=func;
		wit.width=wnd.width;
		wit.position.set(
			wnd.x,
			wnd.y+wnd.height,
		);
		if(wit.isOpen()){
			// restore so that onopened will be called.
			wit.close();
			wit.updateClose();
		}
		wit.open();
		const ta=wit._textarea;
		ta._btns=wnd.x>=wit.standardFontSize()*2?'left-h':'right-h';
		ta.value=1;
		//ta.focus(); // in onopened
		//Input.isTexting_set(); // too early
		return;
	} }
	let err;
	if(amount===undefined) amount=1;
	if(item && !(func.call($gameParty,this._depositoryId,item,amount,this._capacity)<0)){
		this._window_itemList_backpack.refresh();
		this._window_itemList_depository.refresh();
		this.onCommonOk_selectValid(wnd,wnd.index());
		this.refreshCapacityWindow();
	}else{
		wnd.playBuzzerSound();
		err=1;
	}
	wnd.activate();
	return err;
}).
addBase('onCategoryOk',function f(){
	const cat=this._window_category;
	cat.deactivate();
	if(cat.updateInputData) cat.updateInputData();
	if(cat.updateListWindow) cat.updateListWindow();
	const smbl=cat.currentSymbol(),dpst=this._window_itemList_depository,pak=this._window_itemList_backpack;
	this.onCommonOk_selectValid(dpst,this._catIdx.depository||0);
	this.onCommonOk_selectValid(pak,this._catIdx[pak._category]||0);
	const nxt=smbl==='depository'?dpst:pak;
	if(nxt.updateInputData) nxt.updateInputData();
	dpst.deactivate();
	pak.deactivate();
	dpst.alpha=pak.alpha=f.tbl[0];
	nxt.alpha=f.tbl[1];
	nxt.activate();
	this.createWindow_operationHelp_setState(nxt===pak?"inBackpack":"inDepository");
},t=activeAlphas).
addBase('onListCancel_common',function f(now){
	const nxt=now._categoryWindow;
	now.deactivate();
	
	const dpst=this._window_itemList_depository,pak=this._window_itemList_backpack;
	this._catIdx[pak._category]=pak.index();
	this._catIdx.depository=this._window_itemList_depository.index();
	pak.deselect();
	dpst.deselect();
	dpst.alpha=pak.alpha=f.tbl[1];
	
	//now.deselect();
	nxt.activate();
},t).
addBase('onItemCancel',function f(){
	// fit RandomParamsEquip
	this.onListCancel_common(this._window_itemList_backpack);
}).
addBase('onItemOk',function f(){
	// fit RandomParamsEquip
	this.onCommonOk_item(
		this._window_itemList_backpack,
		$gameParty.depository_transIn,
	);
}).
addBase('onBackpackListCancel',function f(){
	// fit RandomParamsEquip
	this.onItemCancel.apply(this,arguments);
}).
addBase('onBackpackListOk',function f(){
	// fit RandomParamsEquip
	this.onItemOk.apply(this,arguments);
}).
addBase('onDepositoryListCancel',function f(){
	this.onListCancel_common(this._window_itemList_depository);
}).
addBase('onDepositoryListOk',function f(){
	this.onCommonOk_item(
		this._window_itemList_depository,
		$gameParty.depository_transOut,
	);
}).
addBase('depository_makeDepositoryItemList',function f(){
	this._window_itemList_depository._data=$gameParty.depository_getItemList(this._depositoryId);
}).
addBase('depository_drawDepositoryItemNumber',function f(item,x,y,width){
	const wnd=this._window_itemList_depository;
	if(wnd.needsNumber()) wnd.drawItemNumber_num(item,x,y,width,$gameParty.depository_getCnt(this._depositoryId,item));
}).
addBase('tryCreateRandomParamsLayeredItemWindow',function f(){
	{ const func=this.randomEquipParams_createLayeredItemWindow_condOk;
	if(!func||!func.call(this)) return; // not enabled
	}
	this._tryCreateRandomParamsLayeredItemWindow_createClassesIfNotExist();
	
	if(!this.randomEquipParams_createLayeredItemWindow_ensureExsit) return; // no plugin
	const srcP=Scene_Item.prototype;
	
	for(let arr=f.tbl[0],xs=arr.length,x=0;x<xs;++x) this[arr[x]]=srcP[arr[x]];
	new cfc(this).
	addWithBaseIfNotOwn('onItemOk',f.tbl[1]).
	addBase('changeUiState_focusOnItemWnd',function f(){
		this._layeredItemWindow.close();
		return this.changeUiState_focusOnBackpackWnd.apply(this,arguments);
	}).
	getP;
	
	//this.randomEquipParams_createItemWindow_modify_itemWindowMethods();
	this._itemWindow.makeItemList_do=this.randomEquipParams_changeMethods_makeItemList_do;
	this.randomEquipParams_createLayeredItemWindow();
},[
[
//'randomEquipParams_createItemWindow_modify_itemWindowMethods',
//'randomEquipParams_createItemWindow_method_isEnabled',
//'randomEquipParams_createItemWindow_method_isCurrentItemEnabled',
'randomEquipParams_createItemWindow_method_makeItemList_do',
//'randomEquipParams_getLayeredItemWindowConstructor',
//'changeUiState_focusOnCategoryWnd',
//'onItemOk',
//'changeUiState_focusOnItemWnd',
//'changeUiState_focusOnLayeredItemWnd_otherWindowsDeactivate',
'randomEquipParams_onLayeredItemOk',
'randomEquipParams_onLayeredItemWindowClose',
], // 0: method names
function f(){
	if(this._onItemOk_bypass) return f.ori.apply(this,arguments);
	// already ensure existence
	if(!this.randomEquipParams_isUsingLayeredWindows()) return f.ori.apply(this,arguments);
	return this.randomEquipParams_onItemOk();
}, // 1: onItemOk
]).
addBase('_tryCreateRandomParamsLayeredItemWindow_createClassesIfNotExist',function f(){
	if(f.tbl[0]) return f.tbl[0];
	//
const a=class Window_randomEquipParams_DepositoryLayeredItem extends Window_Depository_BackpackItemList{
maxCols(){ return 1; }
makeItemList(){
	this.randomEquipParams_layeredWindow_makeItemList_common.apply(this,arguments);
	if(this._isCanIncludeNull) this._data.push(null);
}
};
	const dstP=a.prototype,srcP=Window_randomEquipParams_ItemListLayeredItem.prototype;
	dstP.setRootItem=srcP.setRootItem;
	dstP.includes=srcP.includes;
	new cfc(dstP).
	addWithBaseIfNotOwn('onclosed',f.tbl[1]).
	addWithBaseIfNotOwn('open',f.tbl[2]).
	getP;
window[a.name]=a;
	//
	return f.tbl[0]=a;
},[
undefined, // 0: class constructor
function f(){
	const rtv=f.ori.apply(this,arguments);
	this.visible=false;
	return rtv;
}, // 1: onclosed
function f(){
	this.visible=true;
	return f.ori.apply(this,arguments);
}, // 2: open
]).
addBase('randomEquipParams_getLayeredItemWindowConstructor',function f(){
	return Window_randomEquipParams_DepositoryLayeredItem;
}).
addBase('changeUiState_focusOnBackpackWnd',function f(){
	this._window_category.deactivate();
	this._window_itemList_depository.deactivate();
	this._window_itemList_backpack.activate();
}).
getP;
}

})();
