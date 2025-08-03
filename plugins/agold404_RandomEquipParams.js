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
	if(pt<0){ while(pt++){
		const sel=paramDsts.rnd1();
		const key=useDefaultIfIsNaN(DataManager.paramShortNameToId(sel),sel);
		--paramVals[key];
	} }else{ while(pt--){
		const sel=paramDsts.rnd1();
		const key=useDefaultIfIsNaN(DataManager.paramShortNameToId(sel),sel);
		++paramVals[key];
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
add('gainItem',function f(item,amount,includeEquip){
	if(amount>=1&&item&&item.params&&item.params.randomEquipParams_format1){
		item=arguments[0]=this.randomEquipParams_createNew_format1.apply(this,arguments);
		return f.apply(this,arguments);
	}
	return f.ori.apply(this,arguments);
}).
getP;


new cfc(Window_EquipItem.prototype).
add('initialize',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.initialize_randomEquipParams();
	return rtv;
}).
addBase('initialize_randomEquipParams',function f(){
	//this._isLayeredWindows=f.tbl[1]._layeredEquipList;
},t).
addBase('randomEquipParams_isUsingLayeredWindows',function f(){
	return this._layeredItemWindow;
}).
add('drawItemNumber_num',function f(item,x,y,width,num){
	if(!this.randomEquipParams_isUsingLayeredWindows()) return f.ori.apply(this,arguments);
	const totalNum=this.randomEquipParams_drawItemNumber_num.apply(this,arguments);
	arguments[4]=num=totalNum;
	return f.ori.apply(this,arguments);
}).
add('randomEquipParams_drawItemNumber_num',function f(item,x,y,width,num){
	let totalNum=$gameParty.numItems(item);
	const arr=$gameSystem.duplicatedWeapons_getSrcClonedToDstsList(item);
	for(let x=arr.length;x--;) totalNum+=$gameParty.numItems(arr[x]);
	return totalNum;
}).
add('makeItemList',function f(){
	const rtv=f.ori.apply(this,arguments);
	const lw=this.randomEquipParams_isUsingLayeredWindows();
	if(!lw) return rtv;
	const m=lw._layeredItemWindow_layerMap=lw._layeredItemWindow_layerMap||new Map();
	m.clear();
	const dst=this._data;
	const bak=dst.slice();
	dst.length=0;
	const added=new Set();
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
add('randomEquipParams_setActor',function f(actor){
	const lw=this.randomEquipParams_isUsingLayeredWindows();
	if(lw) lw.setActor.apply(lw,arguments);
}).
add('setActor',function f(actor){
	this.randomEquipParams_setActor.apply(this,arguments);
	return f.ori.apply(this,arguments);
}).
add('randomEquipParams_setSlotId',function f(slotId){
	const lw=this.randomEquipParams_isUsingLayeredWindows();
	if(lw&&lw!==this) lw.setSlotId.apply(lw,arguments);
	return lw;
}).
add('setSlotId',function f(slotId){
	this.randomEquipParams_setSlotId.apply(this,arguments);
	return f.ori.apply(this,arguments);
}).
add('randomEquipParams_onNewSelect',function f(){
	const lw=this.randomEquipParams_isUsingLayeredWindows(); if(!lw) return;
	
	const newIdx=this._index; if(!(newIdx>=0)) return; // deselect, do not interfere with others
	const newItem=this.item();
	this._index=this._indexOld;
	const oldItem=this.item();
	this._index=newIdx;
	const newNull=newItem==null;
	if(newNull===(oldItem==null)) return;
	if(newNull){
		this._statusWindow=lw._statusWindow;
		this.updateHelp();
	}else if(this._statusWindow){
		this._statusWindow.setTempActor(null);
		this._statusWindow=undefined;
	}
}).
add('onNewSelect',function f(){
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
window[a.name]=a; }

new cfc(Scene_Equip.prototype).
add('createItemWindow',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.randomEquipParams_createLayeredItemWindow();
	return rtv;
}).
addBase('randomEquipParams_createLayeredItemWindow_condOk',function f(){
	return f.tbl[1]._layeredEquipList; // init cond
	//return this._itemWindow.randomEquipParams_isUsingLayeredWindows(); // runtime cond
},t).
addBase('randomEquipParams_createLayeredItemWindow_do',function f(){
	const refwnd=this._itemWindow;
	const refx=refwnd.x;
	const refy=refwnd.y;
	const refw=refwnd.width;
	const refh=refwnd.height;
	
	const w=refw-(refw>>2);
	const h=refh;
	const x=refx;
	const y=refy;
	
	const wnd=this._layeredItemWindow=new Window_randomEquipParams_EquipLayeredItem(x,y,w,h);
	
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
addBase('randomEquipParams_createLayeredItemWindow',function f(){
	if(this.randomEquipParams_createLayeredItemWindow_condOk()) this.randomEquipParams_createLayeredItemWindow_do();
}).
addBase('randomEquipParams_createLayeredItemWindow_ensureExsit',function f(){
	if(!this._layeredItemWindow){
		this.randomEquipParams_createLayeredItemWindow_do();
		this.update();
	}
	return this._layeredItemWindow;
}).
add('refreshActor',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.randomEquipParams_refreshActor();
	return rtv;
}).
addBase('randomEquipParams_refreshActor',function f(){
	if(this._layeredItemWindow) this._layeredItemWindow.setActor(this.actor());
}).
add('onItemOk',function f(){
	if(this._onItemOk_bypass) return f.ori.apply(this,arguments);
	if(!this._itemWindow.randomEquipParams_isUsingLayeredWindows()) return f.ori.apply(this,arguments);
	return this.randomEquipParams_onItemOk();
}).
add('onItemOk_callOriginal',function f(){
	const bak=this._onItemOk_bypass;
	this._onItemOk_bypass=true;
	this.onItemOk.apply(this,arguments);
	this._onItemOk_bypass=bak;
}).
addBase('randomEquipParams_onItemOk',function f(){
	if(this._itemWindow.item()==null) return this.onItemOk_callOriginal.apply(this,arguments);
	SoundManager.playOk();
	this._itemWindow.deactivate();
	this.randomEquipParams_createLayeredItemWindow_ensureExsit();
	this._layeredItemWindow.setRootItem(this._itemWindow.item());
	const refwnd=this._itemWindow;
	const refw=refwnd.width;
	const wnd=this._layeredItemWindow;
	const w=refw-(refw>>2);
	const h=refwnd.height;
	if(wnd.width!==w) wnd.width=w;
	if(wnd.height!==h) wnd.height=h;
	const refrect=refwnd.itemRect_curr();
	wnd.x=refrect.x<refwnd.x+(refwnd.width>>1)?refwnd.x+refwnd.width-wnd.width:refwnd.x;
	wnd.y=refwnd.y;
	wnd.select(0);
	wnd.activate();
	wnd.open();
}).
addBase('randomEquipParams_onLayeredItemOk',function f(){
	const iw=this._itemWindow;
	const lw=this.randomEquipParams_createLayeredItemWindow_ensureExsit();
	const idx=lw.index();
	this._itemWindow=lw;
	this.onItemOk_callOriginal.apply(this,arguments);
	this._itemWindow=iw;
	iw.refresh();
	this._slotWindow.deactivate();
	lw.select(idx);
	lw.activate();
}).
addBase('randomEquipParams_onLayeredItemWindowClose',function f(){
	this._statusWindow.setTempActor(null);
}).
addBase('randomEquipParams_onLayeredItemCancel',function f(){
	SoundManager.playCancel();
	this._layeredItemWindow.deactivate();
	this._layeredItemWindow.close();
	this.randomEquipParams_onLayeredItemWindowClose();
	this._itemWindow.activate();
}).
getP;


})();
