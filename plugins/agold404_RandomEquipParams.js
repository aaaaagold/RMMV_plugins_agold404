"use strict";
/*:
 * @plugindesc set params of equipments to be randomized when the party gains them.
 * @author agold404
 * 
 * 
 * @param LayeredEquipList
 * @type boolean
 * @text layered equipment list
 * @desc equipment list will group same source equipments
 * @default true
 * 
 * 
 * @help formats:
 * 
 * 
 * format 1
 * 
 * <RandomTotalPointsOnSomeParams>
 * {
 *  "total":[min,max],
 *  "ratio":{
 *    "atk":5
 *  },
 *  "params":["atk","def", ... etc. ]
 * }
 * </RandomTotalPointsOnSomeParams>
 * 
 * this generates points which is a random integer value in range [min,max],
 * and then randomly allocates points to provided "params" list by integer.
 * the content inside <RandomTotalPointsOnSomeParams> ... </RandomTotalPointsOnSomeParams> is JSON format.
 * if min (same as max) is string type, `eval()` is used to parse.
 * available params are: integers in range 0 to 7, or, "mhp" , "mmp" , "atk" , "def" , "mat" , "mdf" , "agi" , "luk"
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_RandomEquipParams";
const params=PluginManager.parameters(pluginName)||{};
params._layeredEquipList=!!JSON.parse(params.LayeredEquipList||"0");


t=[
undefined,
params,
window.isTest(),
undefined, // 3: reserved for kwpts
["<RandomTotalPointsOnSomeParams>","</RandomTotalPointsOnSomeParams>"], // 4: xmlMark for random params
'focusOnLayeredItemWnd', // 5: uiState
(a,b)=>$gameParty.itemOrder_getOrder?$gameParty.itemOrder_getOrder(undefined,a)-$gameParty.itemOrder_getOrder(undefined,b):(a&&a.id)-(b&&b.id), // 6: cmp for sort
];


new cfc(Scene_Boot.prototype).
add('modEquipment1',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.randomEquipParams_format1_evalSetting.apply(this,arguments);
	return rtv;
},t).
addBase('randomEquipParams_format1_evalSetting',function f(dataobj,i,arr){
	const meta=dataobj&&dataobj.meta; if(!meta) return;
	const traits=dataobj.traits||(dataobj.traits=[]);
	
	const obj={};
	const codes=window.getXmlLikeStyleContent(dataobj.note,f.tbl[4]);
	for(let ci=0,cs=codes.length,tmp;ci<cs;++ci){
		const lines=codes[ci];
		const info=JSON.parse(lines.join('\n'));
		Object.assign(obj,info);
	}
	if(obj.total&&obj.params){
		if(!dataobj.params) dataobj.params=[];
		if(!obj.ratio) obj.ratio={};
		dataobj.params.randomEquipParams_format1=obj;
	}
},t).
add('terminate_after',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.randomEquipParams_chkCondAndErr.apply(this,arguments);
	return rtv;
},t).
addBase('randomEquipParams_chkCondAndErr',function f(){
	const errMsgs=[]; for(let arr=f.tbl[0],x=arr.length;x--;) if(!arr[x][0][arr[x][1]]) errMsgs.push(arr[x][2]);
	if(errMsgs.length){
		throw new Error(errMsgs.join('\n'));
	}
},[
[
[Game_System.prototype,"duplicatedArmors_createNew","lacks of Game_System.prototype.duplicatedArmors_createNew \n ( can be found in agold404_Api_duplicatedArmors.js )"], // 0-0
[Game_System.prototype,"duplicatedWeapons_createNew","lacks of Game_System.prototype.duplicatedWeapons_createNew \n ( can be found in agold404_Api_duplicatedWeapons.js )"], // 0-1
], // 0: chk && err msg
]).
getP;


new cfc(Game_Party.prototype).
addBase('randomEquipParams_createNew_format1',function f(item){
	// return newly created obj
	let rtv;
	const paramVals=item.params.slice();
	const info=item.params.randomEquipParams_format1;
	const base=getNumOrEval(info.total[0]);
	const d=getNumOrEval(info.total[1])-base+1;
	const rndPt=Math.random()*d+base;
	let pt=~~rndPt;
	const randResInfo={pt:pt};
	const paramDsts=info.params;
	const ratio=info.ratio;
	if(pt<0){ while(pt++){
		const sel=paramDsts.rnd1();
		const key=useDefaultIfIsNaN(DataManager.paramShortNameToId(sel),sel);
		const ratio1=(sel in ratio)?ratio[sel]:1;
		paramVals[key]-=ratio1;
	} }else{ while(pt--){
		const sel=paramDsts.rnd1();
		const key=useDefaultIfIsNaN(DataManager.paramShortNameToId(sel),sel);
		const ratio1=(sel in ratio)?ratio[sel]:1;
		paramVals[key]+=ratio1;
	} }
	
	const overwriteInfo={
		params:paramVals,
		"randomEquipParams_randRes_format1":randResInfo,
	};
	if(DataManager.isWeapon(item)){
		const res=$gameSystem.duplicatedWeapons_createNew(item.id,overwriteInfo);
		rtv=$dataWeapons[res];
	}else if(DataManager.isArmor(item)){
		const res=$gameSystem.duplicatedArmors_createNew(item.id,overwriteInfo);
		rtv=$dataArmors[res];
	}
	return rtv;
}).
addRoof('gainItem',function f(item,amount,includeEquip){
	if(amount>=1&&item&&item.params&&item.params.randomEquipParams_format1){
		item=arguments[0]=this.randomEquipParams_createNew_format1.apply(this,arguments);
		return f.apply(this,arguments);
	}
	return f.ori.apply(this,arguments);
}).
getP;


new cfc(Window_ItemList.prototype).
addBase('randomEquipParams_isUsingLayeredWindows',function f(){
	return this._layeredItemWindow;
}).
addBase('randomEquipParams_drawItemNumber_num',function f(item,x,y,width,num){
	let totalNum=$gameParty.numItems(item);
	const arr=$gameSystem.duplicatedWeapons_getSrcClonedToDstsList(item);
	for(let x=arr.length;x--;) totalNum+=$gameParty.numItems(arr[x]);
	return totalNum;
}).
addBase('randomEquipParams_setActor',function f(actor){
	const lw=this.randomEquipParams_isUsingLayeredWindows();
	if(lw) lw.setActor.apply(lw,arguments);
}).
addBase('randomEquipParams_setSlotId',function f(slotId){
	const lw=this.randomEquipParams_isUsingLayeredWindows();
	if(lw&&lw!==this) lw.setSlotId.apply(lw,arguments);
	return lw;
}).
addBase('randomEquipParams_onNewSelect',function f(){
	const lw=this.randomEquipParams_isUsingLayeredWindows(); if(!lw) return;
	
	const newIdx=this._index; if(!(newIdx>=0)) return; // deselect, do not interfere with others
	const newItem=this.item();
	this._index=this._indexOld;
	const oldItem=this.item();
	this._index=newIdx;
	const newNull=newItem==null;
	if(this._indexOld!=null&&newNull===(oldItem==null)) return;
	if(newNull){
		this._statusWindow=lw._statusWindow;
		this.updateHelp();
	}else if(this._statusWindow){
		this._statusWindow.setTempActor(null);
		this._statusWindow=undefined;
	}
}).
getP;

new cfc(Window_EquipItem.prototype).
add('updateHelp',function f(){
	const lw=this.randomEquipParams_isUsingLayeredWindows();
	const iw=this._itemWindow;
	const swori=this._statusWindow;
	if(this.item()==null) this._statusWindow=swori||(lw&&lw._statusWindow);
	const rtv=f.ori.apply(this,arguments);
	this._statusWindow=swori;
	return rtv;
}).
addWithBaseIfNotOwn('makeItemList_do',function f(){
	const rtv=f.ori.apply(this,arguments);
	const lw=this.randomEquipParams_isUsingLayeredWindows();
	if(!lw) return rtv;
	const m=lw._layeredItemWindow_layerMap=lw._layeredItemWindow_layerMap||new Map();
	m.clear();
	const dst=this._data;
	const bak=dst.slice();
	dst.length=0;
	let includeNull=false;
	for(let x=0,xs=bak.length;x<xs;++x){
		if(bak[x]==null){ includeNull=true; continue; }
		const srcObj=DataManager.duplicatedDataobj_getSrc(bak[x])||bak[x];
		if(!m.has(srcObj)){
			dst.push(srcObj);
			m.set(srcObj,[]);
		}
		m.get(srcObj).push(bak[x]);
	}
	if(includeNull) dst.push(null);
	return rtv;
},t).
addWithBaseIfNotOwn('setActor',function f(actor){
	this.randomEquipParams_setActor.apply(this,arguments);
	return f.ori.apply(this,arguments);
}).
addWithBaseIfNotOwn('setSlotId',function f(slotId){
	this.randomEquipParams_setSlotId.apply(this,arguments);
	return f.ori.apply(this,arguments);
}).
addWithBaseIfNotOwn('onNewSelect',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.randomEquipParams_onNewSelect.apply(this,arguments);
	return rtv;
}).
getP;

{ const a=class Window_randomEquipParams_EquipLayeredItem extends Window_EquipItem{
//maxCols(){ return 2; }
setRootItem(item){
	this._rootItem=item;
}
includes(item){
	if(!this._rootItem) return false;
	return DataManager.duplicatedDataobj_getSrc(item)===this._rootItem;
}
makeItemList(){
	this._data=[];
	const m=this._layeredItemWindow_layerMap;
	const itemList=m&&m.get(this._rootItem);
	if(itemList) for(let x=0,xs=itemList.length;x<xs;++x) this._data.push(itemList[x]);
	else this._data.push(this._rootItem); // no src
	this._data.push(null);
}
};
window.Window_randomEquipParams_ItemListLayeredItem=a;
window[a.name]=a; }

{ const a=class Window_randomEquipParams_ItemListLayeredItem extends Window_ItemList{
//maxCols(){ return 2; }
setRootItem(item){
	this._rootItem=item;
}
includes(item){
	if(!this._rootItem) return false;
	return DataManager.duplicatedDataobj_getSrc(item)===this._rootItem;
}
makeItemList(){
	this._data=[];
	const m=this._layeredItemWindow_layerMap;
	const itemList=m&&m.get(this._rootItem);
	if(itemList) for(let x=0,xs=itemList.length;x<xs;++x) this._data.push(itemList[x]);
	else this._data.push(this._rootItem); // no src
	if(this._isCanIncludeNull) this._data.push(null);
}
};
window.Window_randomEquipParams_ItemListLayeredItem=a;
window[a.name]=a; }

new cfc(Scene_MenuBase.prototype).
addBase('randomEquipParams_isUsingLayeredWindows',function f(){
	const iw=this._itemWindow;
	const func=iw&&iw.randomEquipParams_isUsingLayeredWindows;
	return func&&func.constructor===Function&&func.apply(iw,arguments);
}).
addBase('randomEquipParams_createLayeredItemWindow_condOk',function f(){
	return f.tbl[1]._layeredEquipList; // init cond
	//return this._itemWindow.randomEquipParams_isUsingLayeredWindows(); // runtime cond
},t).
addBase('randomEquipParams_createLayeredItemWindow_do',function f(ctor){
	const refwnd=this._itemWindow;
	const refx=refwnd.x;
	const refy=refwnd.y;
	const refw=refwnd.width;
	const refh=refwnd.height;
	
	const w=refw-(refw>>2);
	const h=refh;
	const x=refx;
	const y=refy;
	
	const wnd=this._layeredItemWindow=new ctor(x,y,w,h);
	
	wnd._statusWindow=this._itemWindow._statusWindow;
	this._itemWindow._statusWindow=undefined; // don't compare actor params from here
	wnd._helpWindow=this._itemWindow._helpWindow;
	
	wnd.deactivate();
	wnd.openness=0;
	this.addChild(wnd);
	wnd.setHandler(    'ok',this.randomEquipParams_onLayeredItemOk.bind(this));
	wnd.setHandler('cancel',this.randomEquipParams_onLayeredItemCancel.bind(this));
	wnd._itemWindow=this._itemWindow;
	this._itemWindow._layeredItemWindow=wnd;
},t).
addBase('randomEquipParams_createLayeredItemWindow',function f(isCanIncludeNull){
}).
addBase('randomEquipParams_createLayeredItemWindow_ensureExsit',function f(){
}).
addBase('randomEquipParams_refreshActor',function f(){
	if(this._layeredItemWindow) this._layeredItemWindow.setActor(this.actor());
}).
addBase('onItemOk_callOriginal',function f(){
	const bak=this._onItemOk_bypass;
	this._onItemOk_bypass=true;
	const rtv=this.onItemOk.apply(this,arguments);
	this._onItemOk_bypass=bak;
	return rtv;
}).
add('changeUiState_focusOnItemWnd',function f(){
	const rtv=f.ori.apply(this,arguments);
	const lw=this.randomEquipParams_isUsingLayeredWindows(); if(!lw) return rtv;
	lw.deactivate();
	lw.close();
	this.randomEquipParams_onLayeredItemWindowClose();
	return rtv;
}).
addBase('randomEquipParams_onItemOk',function f(){
	// 
	const wnd=this.randomEquipParams_isUsingLayeredWindows();
	if(!wnd||this._itemWindow.item()==null){
		const rtv=this.onItemOk_callOriginal.apply(this,arguments);
		this.changeUiState_focusOnItemWnd();
		if(this._statusWindow) this._statusWindow.refresh();
		return rtv;
	}
	SoundManager.playOk();
	this._itemWindow.deactivate();
	this._layeredItemWindow.setRootItem(this._itemWindow.item());
	const refwnd=this._itemWindow;
	const refw=refwnd.width;
	const w=refw-(refw>>3);
	const h=refwnd.height;
	if(wnd.width!==w) wnd.width=w;
	if(wnd.height!==h) wnd.height=h;
	const refrect=refwnd.itemRect_curr();
	wnd.x=refrect.x<refwnd.x+(refwnd.width>>1)?refwnd.x+refwnd.width-wnd.width:refwnd.x;
	wnd.y=refwnd.y;
	this.changeUiState_focusOnLayeredItemWnd();
}).
addBase('changeUiState_focusOnLayeredItemWnd',function f(bypassRefresh){
	return f.tbl[5];
},t).
addBase('randomEquipParams_onLayeredItemOk',function f(){
}).
addBase('randomEquipParams_onLayeredItemWindowClose',function f(){
	if(this._statusWindow&&this._itemWindow&&this._itemWindow.item()!=null) this._statusWindow.setTempActor(null);
}).
addBase('randomEquipParams_onLayeredItemCancel',function f(){
	SoundManager.playCancel();
	this.changeUiState_focusOnItemWnd();
}).
addBase('update_focusWndFromTouch_do_isPreventingTouchingOthers',function f(){
	const lw=this.randomEquipParams_isUsingLayeredWindows();
	return lw&&(lw.isClosing()||lw.isOpening()||(lw.isOpen()&&lw.containsPoint_global(TouchInput)));
}).
addBase('update_focusWndFromTouch_do_touchWindows',function f(){
	const lw=this.randomEquipParams_isUsingLayeredWindows(); if(!lw) return;
	if(!lw.isOpen()||!lw.containsPoint_global(TouchInput)) return;
	this.changeUiState_focusOnLayeredItemWnd();
}).
getP;

new cfc(Scene_Equip.prototype).
add('createItemWindow',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.randomEquipParams_createLayeredItemWindow(true);
	return rtv;
}).
addBase('randomEquipParams_createLayeredItemWindow',function f(isCanIncludeNull){
	if(this.randomEquipParams_createLayeredItemWindow_condOk()){
		this.randomEquipParams_createLayeredItemWindow_do(Window_randomEquipParams_EquipLayeredItem);
	}
}).
addBase('randomEquipParams_createLayeredItemWindow_ensureExsit',function f(){
	if(!this._layeredItemWindow){
		this.randomEquipParams_createLayeredItemWindow_do(Window_randomEquipParams_EquipLayeredItem);
		this.update();
	}
	return this._layeredItemWindow;
}).
add('refreshActor',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.randomEquipParams_refreshActor();
	return rtv;
}).
addRoof('onItemOk',function f(){
	if(this._onItemOk_bypass) return f.ori.apply(this,arguments);
	if(!this.randomEquipParams_isUsingLayeredWindows()) return f.ori.apply(this,arguments);
	return this.randomEquipParams_onItemOk();
}).
add('changeUiState_focusOnSlotWnd',function f(){
	if(this._onItemOk_bypass) return;
	const rtv=f.ori.apply(this,arguments);
	const lw=this.randomEquipParams_isUsingLayeredWindows(); if(!lw) return rtv;
	lw.deactivate();
	lw.close();
	this.randomEquipParams_onLayeredItemWindowClose();
	return rtv;
}).
add('changeUiState_focusOnCmdWnd',function f(){
	const rtv=f.ori.apply(this,arguments);
	const lw=this.randomEquipParams_isUsingLayeredWindows(); if(!lw) return rtv;
	lw.deactivate();
	lw.close();
	this.randomEquipParams_onLayeredItemWindowClose();
	return rtv;
}).
add('changeUiState_focusOnItemWnd',function f(){
	const rtv=f.ori.apply(this,arguments);
	const lw=this.randomEquipParams_isUsingLayeredWindows(); if(!lw) return rtv;
	lw.deactivate();
	lw.close();
	this.randomEquipParams_onLayeredItemWindowClose();
	return rtv;
}).
addBase('changeUiState_focusOnLayeredItemWnd',function f(bypassRefresh){
	this.setUiState(f.tbl[5]);
	this._commandWindow.deactivate(); // Scene_Equip
	this._slotWindow.deactivate();
	this._itemWindow.deactivate();
	const lw=this.randomEquipParams_createLayeredItemWindow_ensureExsit();
	if(!bypassRefresh) lw.refresh();
	const M=lw.maxItems();
	let currIdx=lw.index();
	if(!(currIdx>=0)) lw.select(currIdx=0);
	else if(!(currIdx<M)) lw.select(currIdx=M-1);
	lw.activate();
	lw.open();
},t).
addBase('randomEquipParams_onLayeredItemOk',function f(){
	const sw=this._slotWindow;
	const eqtype=this._actor&&this._actor.getEquipSlot(sw.index());
	
	const iw=this._itemWindow;
	const lw=this.randomEquipParams_createLayeredItemWindow_ensureExsit();
	const idx=lw.index();
	this._itemWindow=lw;
	this.onItemOk_callOriginal.apply(this,arguments);
	this._itemWindow=iw;
	iw.refresh();
	
	if((this._actor&&this._actor.getEquipSlot(sw.index()))!==eqtype) return this.randomEquipParams_onLayeredItemCancel();
	
	lw.select(idx);
	lw.refresh(); // list might be changed
	this.changeUiState_focusOnLayeredItemWnd(true);
	
}).
add('update_focusWndFromTouch_do',function f(){
	if(this.update_focusWndFromTouch_do_isPreventingTouchingOthers.apply(this,arguments)){
		return this.update_focusWndFromTouch_do_touchWindows.apply(this,arguments);
	}
	return f.ori.apply(this,arguments);
}).
getP;

new cfc(Scene_Item.prototype).
add('createItemWindow',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.randomEquipParams_createItemWindow_modify_itemWindowMethods();
	this.randomEquipParams_createLayeredItemWindow();
	return rtv;
}).
addBase('randomEquipParams_createItemWindow_modify_itemWindowMethods',function f(){
	this._itemWindow.isEnabled=this.randomEquipParams_createItemWindow_method_isEnabled;
	this._itemWindow.isCurrentItemEnabled=this.randomEquipParams_createItemWindow_method_isCurrentItemEnabled;
	this._itemWindow.makeItemList_do=this.randomEquipParams_createItemWindow_method_makeItemList_do;
}).
addBase('randomEquipParams_createItemWindow_method_isEnabled',function f(item){
	// assigned to `_itemWindow.isEnabled`
	return this._canUseItemsSet.has(item);
},t).
addBase('randomEquipParams_createItemWindow_method_isCurrentItemEnabled',function f(item){
	// assigned to `_itemWindow.isCurrentItemEnabled`
	return true;
},t).
addBase('randomEquipParams_createItemWindow_method_makeItemList_do',function f(){
	// assigned to `_itemWindow.makeItemList_do`
	const rtv=this.constructor.prototype.makeItemList_do.apply(this,arguments);
	const lw=this.randomEquipParams_isUsingLayeredWindows();
	if(!lw) return rtv;
	const m=lw._layeredItemWindow_layerMap=lw._layeredItemWindow_layerMap||new Map();
	m.clear();
	const canUseItemsSet=this._canUseItemsSet=this._canUseItemsSet||new Set();
	canUseItemsSet.clear();
	const dst=this._data;
	const bak=dst.slice();
	dst.length=0;
	for(let x=0,xs=bak.length;x<xs;++x){
		if(bak[x]==null) continue;
		const srcObj=DataManager.duplicatedDataobj_getSrc(bak[x])||bak[x];
		if(!m.has(srcObj)){
			dst.push(srcObj);
			m.set(srcObj,[]);
		}
		if(lw.isEnabled(bak[x])) canUseItemsSet.add(srcObj);
		m.get(srcObj).push(bak[x]);
	}
	this._data.sort(f.tbl[6]);
	return rtv;
},t).
addBase('randomEquipParams_createLayeredItemWindow',function f(isCanIncludeNull){
	if(this.randomEquipParams_createLayeredItemWindow_condOk()){
		this.randomEquipParams_createLayeredItemWindow_do(Window_randomEquipParams_ItemListLayeredItem);
	}
}).
addBase('randomEquipParams_createLayeredItemWindow_ensureExsit',function f(){
	if(!this._layeredItemWindow){
		this.randomEquipParams_createLayeredItemWindow_do(Window_randomEquipParams_ItemListLayeredItem);
		this.update();
	}
	return this._layeredItemWindow;
}).
addRoof('onItemOk',function f(){
	if(this._onItemOk_bypass) return f.ori.apply(this,arguments);
	if(!this.randomEquipParams_isUsingLayeredWindows()) return f.ori.apply(this,arguments);
	return this.randomEquipParams_onItemOk();
}).
add('changeUiState_focusOnItemWnd',function f(){
	const rtv=f.ori.apply(this,arguments);
	const lw=this.randomEquipParams_isUsingLayeredWindows(); if(!lw) return rtv;
	lw.deactivate();
	lw.close();
	this.randomEquipParams_onLayeredItemWindowClose();
	return rtv;
}).
addBase('changeUiState_focusOnLayeredItemWnd',function f(bypassRefresh){
	this.setUiState(f.tbl[5]);
	this._categoryWindow.deactivate(); // Scene_Equip
	//this._slotWindow.deactivate();
	this._itemWindow.deactivate();
	const lw=this.randomEquipParams_createLayeredItemWindow_ensureExsit();
	if(!bypassRefresh) lw.refresh();
	const M=lw.maxItems();
	let currIdx=lw.index();
	if(!(currIdx>=0)) lw.select(currIdx=0);
	else if(!(currIdx<M)) lw.select(currIdx=M-1);
	lw.activate();
	lw.open();
},t).
addBase('randomEquipParams_onLayeredItemOk',function f(){
	
	const iw=this._itemWindow;
	const lw=this.randomEquipParams_createLayeredItemWindow_ensureExsit();
	const idx=lw.index();
	this._itemWindow=lw;
	this.onItemOk_callOriginal.apply(this,arguments);
	this._itemWindow=iw;
	iw.refresh();
	
	lw.select(idx);
	lw.refresh(); // list might be changed
	
}).
addWithBaseIfNotOwn('onActorCancel',function f(){
	const rtv=f.ori.apply(this,arguments);
	const lw=this.randomEquipParams_isUsingLayeredWindows(); if(!lw) return rtv;
	const iw=this._itemWindow;
	iw.deactivate();
	lw.activate();
	return rtv;
}).
getP;


})();
