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
new cfc(p).
addBase('initialize',function f(){
	f.tbl[0][f._funcName].apply(this,arguments);
	this._depositoryId=$gameTemp._depositoryId;
	this._depositoryOptions=$gameTemp._depositoryOptions;
	this._catIdx={};
	this._prevScene_store();
	{
		const opt=this._depositoryOptions;
		this._capacity=useDefaultIfIsNone(opt&&opt.capacity,undefined);
	}
},t=[
a.ori.prototype,
]).
addBase('create',function f(){
	f.tbl[0][f._funcName].apply(this,arguments);
	this.createWindows();
	this._prevScene_restore();
},t).
addBase('update',function f(){
	this.update_backupSelects();
	this.update_touch();
	return f.tbl[0][f._funcName].apply(this,arguments);
},t).
addBase('update_backupSelects',function f(){
	const dpst=this._window_itemList_depository,pak=this._window_itemList_backpack;
	if(dpst.active) this._catIdx.depository=dpst.index();
	if(pak.active) this._catIdx[pak._category]=pak.index();
}).
addBase('update_touch',function f(){
	const TI=TouchInput; if(!TI.isTriggered()) return;
	if(this.update_touch_testCategoryWindow(TI)) return;
	if(this.update_touch_testDepositoryWindow(TI)) return;
	if(this.update_touch_testBackpackWindow(TI)) return;
}).
addBase('update_touch_testWindowCommon',function f(wnd,globalXy,actFunc){
	// actFunc = function(selectIndex){ ... }
	if(!wnd.hitTest) return;
	const xy=wnd.toLocal(globalXy);
	const idx=wnd.hitTest(xy.x,xy.y);
	if(!(idx>=0)) return;
	if(wnd.active) return -2; // already activated. don't do more.
	this._window_category.deactivate();
	this._window_itemList_depository.deactivate();
	this._window_itemList_backpack.deactivate();
	wnd.activate();
	if(actFunc) actFunc.call(this,idx);
	return idx;
}).
addBase('update_touch_testCategoryWindow',function f(globalXy){
	const wnd=this._window_category;
	return this.update_touch_testWindowCommon(wnd,globalXy,f.tbl[0]);
},[
function f(idx){
	this._window_category.select(idx);
	this.onCategoryOk();
}, // 0: actFunc
]).
addBase('update_touch_testDepositoryWindow',function f(globalXy){
	if(!f.tbl[0].tbl) f.tbl[0].tbl=f.tbl[1];
	return this.update_touch_testWindowCommon(this._window_itemList_depository,globalXy,f.tbl[0]);
},[
function f(idx){
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
}).
addBase('onCommonOk_selectValid',function f(wnd,idx){
	const newIdx=Math.max(Math.min(idx,wnd.maxItems()-1),0);
	if(wnd.index()!==newIdx) wnd.select(newIdx);
}).
addBase('refreshCapacityWindow',function f(){
	const wnd=this._window_itemList_depositoryCapacity; if(!wnd) return;
	wnd.setText($gameParty.depository_getTotalCapacityUsed(this._depositoryId)+' / '+this._capacity);
}).
addBase('onCommonOk_item',function f(wnd,func){
	const item=wnd.item();
	if(item && !(func.call($gameParty,this._depositoryId,item,1,this._capacity)<0)){
		this._window_itemList_backpack.refresh();
		this._window_itemList_depository.refresh();
		this.onCommonOk_selectValid(wnd,wnd.index());
		this.refreshCapacityWindow();
	}else wnd.playBuzzerSound();
	wnd.activate();
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
addBase('onBackpackListCancel',function f(){
	this.onListCancel_common(this._window_itemList_backpack);
}).
addBase('onBackpackListOk',function f(){
	this.onCommonOk_item(
		this._window_itemList_backpack,
		$gameParty.depository_transIn,
	);
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
getP;
}

})();
