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

new cfc(Game_Party.prototype).add('_depository_getContAll',function f(){
	let rtv=this._depositoryCont; if(!rtv) rtv=this._depositoryCont={};
	return rtv;
},undefined,true,true).add('_depository_getContById',function f(id){
	const contAll=this._depository_getContAll();
	let rtv=contAll[id]; if(!rtv) rtv=contAll[id]=[];
	return rtv;
},undefined,true,true).add('depository_itemInfoToItemKey',function f(itemInfo){
	return itemInfo[0]+f.tbl[0]+itemInfo[1];
},[
":", // 0: sep
],true,true).add('depository_getItemInfo',function f(id,itemData,ensureExists){
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
],true,true).add('depository_getCnt',function f(id,itemData){
	const itemInfo=this.depository_getItemInfo(id,itemData);
	return itemInfo&&itemInfo[2]-0||0;
},undefined,true,true).add('depository_add',function f(id,itemData,cnt,_reserved,_internal_itemInfo){
	cnt=cnt-0||0;
	const itemInfo=this.depository_getItemInfo(id,itemData,true);
	itemInfo[2]+=cnt;
	const arg4=arguments[4];
	arguments[4]=itemInfo;
	this.depository_onAdd.apply(this,arguments);
	arguments[4]=arg4;
	return itemInfo;
},undefined,true,true).add('depository_onAdd',function f(id,itemData,cnt,itemInfo){
	// TODO: notify the things are added
	// override it for other usages, like GC dynamic itemData
},undefined,true,true).add('depository_del',function f(id,itemData,cnt,isIgnoringInsufficient,_internal_itemInfo){
	cnt=cnt-0||0;
	const itemInfo=this.depository_getItemInfo(id,itemData); if(!itemInfo||(!isIgnoringInsufficient&&!(itemInfo[2]>=cnt))) return -1;
	const cont=this._depository_getContById(id);
	if(!(0<(itemInfo[2]-=cnt))){
		const idx=cont.indexOf(itemInfo); if(idx>=0) cont.splice(idx,1);
		if(cont._tbl) cont._tbl.delete(this.depository_itemInfoToItemKey(itemInfo));
	}
	const arg4=arguments[4];
	arguments[4]=itemInfo;
	this.depository_onDel.apply(this,arguments);
	arguments[4]=arg4;
},undefined,true,true).add('depository_onDel',function f(id,itemData,cnt,itemInfo){
	// TODO: notify the things are added
	// override it for other usages, like GC dynamic itemData
},undefined,true,true).add('depository_transIn',function f(id,itemData,cnt){
	// move items into depository
	cnt=cnt-0||0;
	if(cnt<0) return this.depository_transOut(id,itemData,cnt);
	if(!(cnt>=0&&this.numItems(itemData)>=cnt)) return -1;
	this.depository_add(id,itemData,cnt);
	this.gainItem(itemData,-cnt);
},undefined,true,true).add('depository_transOut',function f(id,itemData,cnt){
	// move items out from depository
	cnt=cnt-0||0;
	if(cnt<0) return this.depository_transIn(id,itemData,cnt);
	if(!(cnt>=0)||this.depository_del(id,itemData,cnt)<0) return -1;
	this.gainItem(itemData,cnt);
},undefined,true,true).add('depository_getItemList',function f(id,isPrintingRawData){
	return isPrintingRawData?this._depository_getContById(id):this._depository_getContById(id).map(f.tbl[1]);
},[
undefined, // 0: tbl
function f(info){
	return Game_Item.itemKeyInfoToDataobj(info);
}, // 1: map
],true,true);

new cfc(Game_Temp.prototype).add('depository_open',function f(depositoryId,options){
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
new cfc(a.prototype).add('initialize',function f(x,y,w,_h){
	f.tbl[0][f._funcName].apply(this,arguments);
	this.width=w;
	this.height=this.fittingHeight(1);
	this.refresh();
	this.updateCursor();
},t=[
a.ori.prototype,
],true,true).add('update',function f(){
	const rtv=f.tbl[0][f._funcName].apply(this,arguments);
	this.updateListWindow();
	return rtv;
},t,true,true).add('updateListWindow',function f(){
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
],true,true).add('updateListWindow_basicCommon',r=function f(){
	this.getListWindow().setCategory(this.currentSymbol());
},undefined,true,true).add('updateListWindow_item',
r,undefined,true,true).add('updateListWindow_weapon',
r,undefined,true,true).add('updateListWindow_armor',
r,undefined,true,true).add('updateListWindow_keyItem',
r,undefined,true,true).add('updateListWindow_depository',
none,undefined,true,true).add('makeCommandList',function f(){
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
],true,true).add('maxCols',function f(){
	return f.tbl[0];
},[
5,
],true,true);
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
	nxt.activate();
	SoundManager.playCursor();
	this._onSwitchToWindow(nxt);
}
};
window[a.name]=a;
}

{
const a=class Window_Depository_BackpackItemList extends Window_Depository_Common{
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
}
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
new cfc(p).add('initialize',function f(){
	f.tbl[0][f._funcName].apply(this,arguments);
	this._depositoryId=$gameTemp._depositoryId;
	this._depositoryOptions=$gameTemp._depositoryOptions;
	this._catIdx={};
	this._prevScene_store();
},t=[
a.ori.prototype,
],true,true).add('create',function f(){
	f.tbl[0][f._funcName].apply(this,arguments);
	this.createWindows();
	this._prevScene_restore();
},t,true,true).add('createWindows',function f(){
	let tmpU,tmpD,tmpL,tmpR;
	tmpU=this.createWindow_operationHelp();
	tmpU=this.createWindow_category(tmpU);
	tmpD=this.createWindow_description();
	
	tmpR=this.createWindow_itemList_backpack(tmpU,tmpD,tmpL,tmpR);
	this.createWindow_itemList_depository(tmpU,tmpD,tmpL,tmpR);
	
	this.createWindow_END();
},undefined,true,true).add('createWindow_operationHelp',function f(wndAbove,wndBelow){
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
],true,true).add('createWindow_operationHelp_getDefaultTxt',function f(state){
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
],true,true).add('createWindow_operationHelp_setState',function f(state){
	const wnd=this._window_operationHelp; if(!wnd) return;
	wnd.setText(this.createWindow_operationHelp_getDefaultTxt(state));
},undefined,true,true).add('createWindow_category',function f(wndAbove,wndBelow){
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
],true,true).add('createWindow_itemList_backpack',function f(wndAbove,wndBelow,wndLeft,wndRight){
	let rtv;
	const x0=wndLeft?wndLeft.x+wndLeft.width:0;
	const x1=wndRight?wndRight.x:Graphics.boxWidth;
	const y0=wndAbove?wndAbove.y+wndAbove.height:0;
	const y1=wndBelow?wndBelow.y:Graphics.boxHeight;
	const w=f.tbl[0]();
	this.addChild(rtv=this._window_itemList_backpack=new Window_Depository_BackpackItemList(x1-w,y0,w,y1-y0));
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
],true,true).add('createWindow_itemList_depository',function f(wndAbove,wndBelow,wndLeft,wndRight){
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
},t,true,true).add('createWindow_description',function f(wndAbove,wndBelow){
	let rtv;
	const y0=wndAbove?wndAbove.y+wndAbove.height:0;
	const y1=wndBelow?wndBelow.y:Graphics.boxHeight;
	this.addChild(rtv=this._window_description=new Window_Help(f.tbl[0]));
	rtv.y=Graphics.boxHeight-rtv.height;
	return rtv;
},[
2, // 0: line count
],true,true).add('createWindow_END',function f(){
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
},undefined,true,true).add('onCommonOk_selectValid',function f(wnd,idx){
	const newIdx=Math.max(Math.min(idx,wnd.maxItems()-1),0);
	if(wnd.index()!==newIdx) wnd.select(newIdx);
},undefined,true,true).add('onCommonOk_item',function f(wnd,func){
	const item=wnd.item();
	if(item && !(func.call($gameParty,this._depositoryId,item,1)<0)){
		this._window_itemList_backpack.refresh();
		this._window_itemList_depository.refresh();
		this.onCommonOk_selectValid(wnd,wnd.index());
	}else wnd.playBuzzerSound();
	wnd.activate();
},undefined,true,true).add('onCategoryOk',function f(){
	const cat=this._window_category;
	cat.deactivate();
	if(cat.updateInputData) cat.updateInputData();
	const smbl=cat.currentSymbol(),dpst=this._window_itemList_depository,pak=this._window_itemList_backpack;
	this.onCommonOk_selectValid(dpst,this._catIdx.depository||0);
	this.onCommonOk_selectValid(pak,this._catIdx[pak._category]||0);
	const nxt=smbl==='depository'?dpst:pak;
	if(nxt.updateInputData) nxt.updateInputData();
	nxt.activate();
	this.createWindow_operationHelp_setState(nxt===pak?"inBackpack":"inDepository");
},undefined,true,true).add('onListCancel_common',function f(now){
	const nxt=now._categoryWindow;
	now.deactivate();
	
	const dpst=this._window_itemList_depository,pak=this._window_itemList_backpack;
	this._catIdx[pak._category]=pak.index();
	this._catIdx.depository=this._window_itemList_depository.index();
	pak.deselect();
	dpst.deselect();
	
	//now.deselect();
	nxt.activate();
},undefined,true,true).add('onBackpackListCancel',function f(){
	this.onListCancel_common(this._window_itemList_backpack);
},undefined,true,true).add('onBackpackListOk',function f(){
	this.onCommonOk_item(
		this._window_itemList_backpack,
		$gameParty.depository_transIn,
	);
},undefined,true,true).add('onDepositoryListCancel',function f(){
	this.onListCancel_common(this._window_itemList_depository);
},undefined,true,true).add('onDepositoryListOk',function f(){
	this.onCommonOk_item(
		this._window_itemList_depository,
		$gameParty.depository_transOut,
	);
},undefined,true,true).add('depository_makeDepositoryItemList',function f(){
	this._window_itemList_depository._data=$gameParty.depository_getItemList(this._depositoryId);
},undefined,true,true).add('depository_drawDepositoryItemNumber',function f(item,x,y,width){
	const wnd=this._window_itemList_depository;
	if(wnd.needsNumber()) wnd.drawItemNumber_num(item,x,y,width,$gameParty.depository_getCnt(this._depositoryId,item));
},undefined,true,true);
}

})();
