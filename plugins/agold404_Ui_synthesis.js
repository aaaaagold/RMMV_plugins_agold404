"use strict";
/*:
 * @plugindesc UI for synthesis
 * @author agold404
 * 
 * 
 * @param TemplatePath
 * @type text
 * @text path to the template list
 * @desc loading fail or providing an empty string leads the list empty.
 * @default data/synthesis.json
 * 
 * 
 * @param ItemDefaultValues
 * @text default vaules
 * 
 * @param ItemDefaultValueDisplayBlockTitle
 * @parent ItemPropertyStringsRoot
 * @type text
 * @text default title for display
 * @default ==== Item Title ====
 * 
 * @param ItemDefaultValueDisplayBlockHide
 * @parent ItemDefaultValues
 * @type boolean
 * @text true to hide display block by default
 * @default false
 * 
 * @param ItemDefaultValueMaterialsBlockTitle
 * @parent ItemDefaultValues
 * @type text
 * @text default title for materials
 * @default ==== materials ====
 * 
 * @param ItemDefaultValueMaterialsBlockHide
 * @parent ItemDefaultValues
 * @type boolean
 * @text true to hide materials block by default
 * @default false
 * 
 * @param ItemDefaultValueGainsBlockTitle
 * @parent ItemDefaultValues
 * @type text
 * @text default title for gains
 * @default ==== gains ====
 * 
 * @param ItemDefaultValueGainsBlockHide
 * @parent ItemDefaultValues
 * @type boolean
 * @text true to hide gains block by default
 * @default false
 * 
 * 
 * @param ItemPropertyStringsRoot
 * @text change strings used as the property string of an item
 * 
 * @param ItemPropertyStringKey
 * @parent ItemPropertyStringsRoot
 * @type text
 * @text a string used as the property string of item key
 * @default key
 * 
 * @param ItemPropertyStringDisplay
 * @parent ItemPropertyStringsRoot
 * @type text
 * @text a string used as the property string of item displayed name
 * @default display
 * 
 * @param ItemPropertyStringDisplayBlockTitle
 * @parent ItemPropertyStringsRoot
 * @type text
 * @text a string used as the property string of item displayed name
 * @default display_block_title
 * 
 * @param ItemPropertyStringDescription
 * @parent ItemPropertyStringsRoot
 * @type text
 * @text a string used as the property string of item description
 * @default description
 * 
 * @param ItemPropertyStringHead
 * @parent ItemPropertyStringsRoot
 * @type text
 * @text a string used as the property string of item head
 * @default head
 * 
 * @param ItemPropertyStringMaterials
 * @parent ItemPropertyStringsRoot
 * @type text
 * @text a string used as the property string of item materials
 * @default materials
 * 
 * @param ItemPropertyStringMaterialsBlockTitle
 * @parent ItemPropertyStringsRoot
 * @type text
 * @text a string used as the property string of item materials_title
 * @default materials_block_title
 * 
 * @param ItemPropertyStringMaterialsBlockHide
 * @parent ItemPropertyStringsRoot
 * @type text
 * @text a string used as the property string of item materials_hide
 * @default materials_block_hide
 * 
 * @param ItemPropertyStringGains
 * @parent ItemPropertyStringsRoot
 * @type text
 * @text a string used as the property string of item gains
 * @default gains
 * 
 * @param ItemPropertyStringGainsBlockTitle
 * @parent ItemPropertyStringsRoot
 * @type text
 * @text a string used as the property string of item gains_title
 * @default gains_block_title
 * 
 * @param ItemPropertyStringGainsBlockHide
 * @parent ItemPropertyStringsRoot
 * @type text
 * @text a string used as the property string of item gains_hide
 * @default gains_block_hide
 * 
 * @param ItemPropertyStringTail
 * @parent ItemPropertyStringsRoot
 * @type text
 * @text a string used as the property string of item tail
 * @default tail
 * 
 * 
 * @help an UI for synthesis
 * 
 * 
 * default item layout = 
 * {
 *   "key":"...",
 *   "display:"...",
 *   "description":"...",
 *   "materials":[],
 *   "materials_title":"",
 *   "gains":[],
 *   "gains_title":"",
 *   "other customized informations": ANY
 * }
 * 
 * layout of a material or gain =
 * [ type , id_or_other_information , count ]
 *  type:
 *    "i" or "w" or "a" for item, weapon, armor. or,
 *    "g" for golds. or,
 *    "j" for javascript
 *  id_or_other_information:
 *    id of item, weapon, armor when type is "i" , "w" , "a", corresponding. or,
 *    golds' number when type is "g"
 *    javascript when type is "j"
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_Ui_synthesis";
const params=PluginManager.parameters(pluginName)||{};
params._templatePath=params.TemplatePath;
params._itemDefaultValueDisplayBlockTitle=useDefaultIfIsNone(params.ItemDefaultValueDisplayBlockTitle,"==== Item Title ====");
params._itemDefaultValueDisplayBlockHide=JSON.parse(params.ItemDefaultValueDisplayBlockHide||"false");
params._itemDefaultValueMaterialsBlockTitle=useDefaultIfIsNone(params.ItemDefaultValueMaterialsBlockTitle,"==== materials ====");
params._itemDefaultValueMaterialsBlockHide=JSON.parse(params.ItemDefaultValueMaterialsBlockHide||"false");
params._itemDefaultValueGainsBlockTitle=useDefaultIfIsNone(params.ItemDefaultValueGainsBlockTitle,"==== gains ====");
params._itemDefaultValueGainsBlockHide=JSON.parse(params.ItemDefaultValueGainsBlockHide||"false");

params._itemPropertyStringKey=useDefaultIfIsNone(params.ItemPropertyStringKey,"key");
params._itemPropertyStringDisplay=useDefaultIfIsNone(params.ItemPropertyStringDisplay,"display");
params._itemPropertyStringDisplayBlockTitle=useDefaultIfIsNone(params.ItemPropertyStringDisplayBlockTitle,"display_block_title");
params._itemPropertyStringDisplayBlockHide=useDefaultIfIsNone(params.ItemPropertyStringDisplayBlockHide,"display_block_hide");
params._itemPropertyStringDescription=useDefaultIfIsNone(params.ItemPropertyStringDescription,"description");
params._itemPropertyStringHead=useDefaultIfIsNone(params.ItemPropertyStringHead,"head");
params._itemPropertyStringMaterials=useDefaultIfIsNone(params.ItemPropertyStringMaterials,"materials");
params._itemPropertyStringMaterialsBlockTitle=useDefaultIfIsNone(params.ItemPropertyStringMaterialsBlockTitle,"materials_block_title");
params._itemPropertyStringMaterialsBlockHide=useDefaultIfIsNone(params.ItemPropertyStringMaterialsBlockHide,"materials_block_hide");
params._itemPropertyStringGains=useDefaultIfIsNone(params.ItemPropertyStringGains,"gains");
params._itemPropertyStringGainsBlockTitle=useDefaultIfIsNone(params.ItemPropertyStringGainsBlockTitle,"gains_block_title");
params._itemPropertyStringGainsBlockHide=useDefaultIfIsNone(params.ItemPropertyStringGainsBlockHide,"gains_block_hide");
params._itemPropertyStringTail=useDefaultIfIsNone(params.ItemPropertyStringTail,"tail");

t=[
undefined,
params, // 1: plugin params
window.isTest(), // 2: isTest
[
new Set([
	'cancel',
]), // 3-0: reserved property names
function(info){ return info&&(this._itemPropertyStringKey in info); }, // 3-1: filter out infos without key
], // 3: init
[
['_itemPropertyStringMaterials' , '_itemPropertyStringMaterialsBlockHide' , '_itemDefaultValueMaterialsBlockHide' , '_itemPropertyStringMaterialsBlockTitle' , '_itemDefaultValueMaterialsBlockTitle' , ], // 4-0: material
['_itemPropertyStringGains'     , '_itemPropertyStringGainsBlockHide'     , '_itemDefaultValueGainsBlockHide'     , '_itemPropertyStringGainsBlockTitle'     , '_itemDefaultValueGainsBlockTitle'     , ], // 4-1: gain
], // 4: material && gain
({
_defaultTextColor:"#FFFFFF",
insufficientTextColor:"#FF0000",
iconPadding:2,
}), // 5: board displaying settings
];


let ttt;
//const dataPath="data/合成.json";
const dataPath=params._templatePath;
const properties={
key:"名稱",
cost:"材料",
gain:"獲得",
display:"製作名稱",
description:"說明",
hideNameInRequirement:"hideNameInRequirement",
hideGain:"hideGain",
head:"head",
tail:"tail",
};
properties.key=params._itemPropertyStringKey;
properties.display=params._itemPropertyStringDisplay;
properties.description=params._itemPropertyStringDescription;
properties.cost=params._itemPropertyStringMaterials;
properties.gain=params._itemPropertyStringGains;
const itemListWidth=256;
const descriptionsHeight=96;
const descriptionsLineNum=3;
const putDataArrByType=tbl=>{
	if(!tbl.dataArrByType) tbl.dataArrByType={
		i:$dataItems,
		w:$dataWeapons,
		a:$dataArmors,
	};
};

const evaljs=(s,self)=>eval(s);

{
new cfc(Game_System.prototype).
addBase('synthesis_getCont',function f(){
	let rtv=this._synthesis_cont; if(!rtv) rtv=this._synthesis_cont=[];
	if(!rtv._inlineMap) rtv._inlineMap=new Map();
	return rtv;
}).
addBase('synthesis_setEnabled',function f(key){
	const s=this._synthesis_disabledSet;
	if(s) s.delete(key);
}).
addBase('synthesis_setDisabled',function f(key){
	let s=this._synthesis_disabledSet; if(!(s instanceof Set)) s=this._synthesis_disabledSet=new Set();
	s.add(key);
	return s;
}).
addBase('synthesis_clearAll',function f(){
	const cont=this.synthesis_getCont();
	cont.length=0;
	cont._cache=undefined;
	cont._inlineMap.clear();
	this._synthesis_selAll=false;
	this.synthesis_setDisabled().clear();
}).
addBase('synthesis_selectAll',function f(key){
	const cont=this.synthesis_getCont();
	cont._cache=undefined;
	this._synthesis_selAll=true;
}).
addBase('synthesis_addItem',function f(key){
	const cont=this.synthesis_getCont();
	cont._cache=undefined;
	cont.push(['a',key]);
}).
addBase('synthesis_rmItem',function f(key){
	const cont=this.synthesis_getCont();
	cont._cache=undefined;
	if(cont._inlineMap.has(key)) cont._inlineMap.delete(key);
	else cont.push(['r',key]);
}).
addBase('synthesis_addItemInline',function f(key,cost,gain,display){
	const info={key:key,cost:cost,gain:gain}; if(3<arguments.length) info.display=display;
	const cont=this.synthesis_getCont();
	cont._cache=undefined;
	cont.push(['i',key]);
	cont._inlineMap.set(key,info);
}).
addBase('synthesis_getList',function f(){
	const arr=this.synthesis_getCont(),tmp=[],s=new Set();
	if(arr._cache) return arr._cache;
	for(let x=arr.length;x--;){ const key=arr[x][1];
		if(s.has(key)) continue; else s.add(key);
		switch(arr[x][0]){
		case 'a':{
			if(arr._inlineMap.has(key)){ tmp.push(['i',key]); continue; }
			if(this._synthesis_selAll) contiune;
		}break;
		case 'r':{
			if(!this._synthesis_selAll) contiune;
		}break;
		case 'i':{
			if(!arr._inlineMap.has(key)) continue;
		}break;
		}
		tmp.push(arr[x]);
	}
	arr.length=0;
	const rtv=[];
	for(let x=tmp.length;x--;){
		rtv.push(tmp[x]);
		arr.push(tmp[x]);
	}
	rtv._inlineMap=new Map(arr._inlineMap);
	rtv._selAll=this._synthesis_selAll;
	rtv._disabledSet=this._synthesis_disabledSet;
	return arr._cache=rtv;
}).
getP;
new cfc(Game_Temp.prototype).
addBase('synthesis_setCurrList',function f(arr){
	this._synthesis_currList=arr;
}).
addBase('synthesis_open',function f(){
	SceneManager.push(Scene_合成);
}).
addBase('synthesis_simpleTest',function f(){
	$gameSystem.synthesis_selectAll();
	this.synthesis_open();
}).
getP;
}


{
const a=function Window_合成_list(){
	this.initialize.apply(this, arguments);
};
a.ori=Window_Command;
window[a.name]=a;
const p=a.prototype=Object.create(a.ori.prototype);
p.constructor=a;
const tbl=[
a.ori.prototype,
64, // wait start
64, // stop
8, // pad scroll
];
new cfc(p).
addBase('initialize',function f(x,y,allList,selInfo){
	const rtv=f._super.initialize.apply(this,arguments);
	this.initSel(allList,selInfo);
	this._drawTextExStartOffsetXTimer=0;
	this.refresh();
	return rtv;
},tbl).
addBase('initSel',function f(allList,selInfo){
	// (allList=[{},...])._key2info; // from Scene_合成.createAll_parseData
	// selInfo=$gameSystem.synthesis_getList();
	this._data=[];
	if(!selInfo) return;
	const selKey2type=new Map(); for(let x=0,arr=selInfo,xs=arr.length;x<xs;++x) selKey2type.set(arr[x][1],arr[x][0]);
	if(selInfo._selAll){
		for(let x=0,arr=allList,xs=arr.length;x!==xs;++x){
			const key=arr[x][f.tbl[1]._itemPropertyStringKey];
			if(selKey2type.has(key)) continue; // 'r' , 'i'
			this._data.push(arr[x]);
		}
		for(let x=0,arr=selInfo,xs=arr.length;x!==xs;++x){
			if(arr[x][0]!=='i') continue;
			this._data.push(selInfo._inlineMap.get(arr[x][1]));
		}
	}else{
		for(let x=0,arr=selInfo,xs=arr.length;x!==xs;++x){
			if(arr[x][0]==='a') this._data.push(allList._key2info.get(arr[x][1]));
			else this._data.push(selInfo._inlineMap.get(arr[x][1]));
		}
	}
	this._disabledSet=selInfo._disabledSet;
	return this._data;
},t).
addBase('makeCommandList',function f(){
	if(!this._data) return;
	for(let x=0,arr=this._data,xs=arr&&arr.length;x<xs;++x){
		const info=arr[x];
		const enabled=this._disabledSet&&!this._disabledSet.has(info[f.tbl[1]._itemPropertyStringKey]);
		this.addCommand(info[f.tbl[1]._itemPropertyStringDisplay],info[f.tbl[1]._itemPropertyStringKey],enabled);
	}
},t).
addBase('checkCostsEnough',function f(info){
	if(!info) return false;
	const costs=info[f.tbl[1]._itemPropertyStringMaterials]; if(!costs) return true;
	for(let x=0,arr=costs,xs=arr.length;x!==xs;++x){
		const info=arr[x];
		if('g'===info[0]){ if(!($gameParty.gold()>=info[1])) return false; }
		else if('j'===info[0]){ if(useDefaultIfIsNone(EVAL.call(this,info[2]),true)) return false; }
		else{ if(!($gameParty.numItems(DataManager.getItemCont(info[0])[info[1]])>=info[2])) return false; }
	}
	return true;
},t).
addBase('getCurrentInfo',function(index){
	const idx=index===undefined?this._index:index;
	return this._data[idx];
}).
addBase('isCommandEnabled',function f(index){
	const rtv=this._data[index] && f._super.isCommandEnabled.apply(this,arguments);
	return rtv && this.checkCostsEnough(this._data[index]);
}).
addBase('isCurrentItemEnabled',function(index){
	return this.isCommandEnabled(this.index());
}).
addBase('drawItem',function(index){
	if(!(index>=0 && index<this.maxItems())) return;
	const rect=this.itemRectForText(index);
	const align=this.itemTextAlign();
	this.resetTextColor();
	this.changePaintOpacity(this.isCommandEnabled(index));
	const offsetX=this.drawItem_getOffsetX();
	const res=this.drawTextEx(this.commandName(index), rect.x-offsetX, rect.y, rect.width, align);
	this._drawTextExCurrentTextWidth=res+(this.textPadding()<<1);
	this._drawTextExCurrentTextWidthMax=this._drawTextExCurrentTextWidth-this.contentsWidth();
	this._drawTextExLastOffsetX=offsetX;
}).
addBase('drawItem_getOffsetX',function f(){
	return Math.max(Math.min(this._drawTextExCurrentTextWidthMax,this._drawTextExStartOffsetXTimer-f.tbl[1]),0)||0;
},tbl).
addBase('select',function f(idx){
	const idx0=this._index;
	const rtv=f._super.select.apply(this,arguments);
	this._drawTextEx_clearCache();
	const mit=this.maxItems();
	if(idx0>=0) this.redrawItem(idx0); // clear last (disappeared?)
	if(this._index>=0&&this._index<mit){
		this.redrawItem(this._index);
		const info=this._data[this._index]; if(info){
			const rw=this._requirementsWindow;
			if(rw) rw.refreshHelp(info);
			const aw=this._descriptionsWindow;
			if(aw) aw.refreshHelp(info);
		}
	}
	return rtv;
}).
addBase('_drawTextEx_clearCache',function f(){
	this._drawTextExStartOffsetXTimer=0;
	this._drawTextExCurrentTextWidth=undefined;
	this._drawTextExCurrentTextWidthMax=undefined;
	this._drawTextExLastOffsetX=undefined;
	this._drawTextExStartOffsetXLastFc=undefined;
}).
addBase('update',function f(){
	const rtv=f._super.update.apply(this,arguments);
	if(this._drawTextExStartOffsetXLastFc!==Graphics.frameCount){
		this._drawTextExStartOffsetXTimer+=Graphics.frameCount-this._drawTextExStartOffsetXLastFc||0;
		this._drawTextExStartOffsetXLastFc=Graphics.frameCount;
	}
	if(!(this._drawTextExStartOffsetXTimer-f.tbl[1]-f.tbl[2]<this._drawTextExCurrentTextWidthMax)) this._drawTextExStartOffsetXTimer=0;
	if(this.drawItem_getOffsetX()!==this._drawTextExLastOffsetX) this.redrawItem(this._index);
	return rtv;
},tbl).
addBase('refresh',function f(){
	this._drawTextEx_clearCache();
	const rtv=f._super.refresh.apply(this,arguments);
	this._drawTextEx_clearCache();
	return rtv;
},tbl).
getP;
}


{
const a=function Scene_合成(){
	this.initialize.apply(this, arguments);
};
a.ori=Scene_MenuBase;
window[a.name]=a;
const p=a.prototype=Object.create(a.ori.prototype);
p.constructor=a;
ttt=[
a.ori.prototype,
a.ori,
['itemList','amounts',], // 2
{
itemList:{x:0,y:0,w:itemListWidth,h:undefined,align:""},
requirements:{x:itemListWidth,y:0,w:undefined,h:undefined,align:"afterX",},
descriptions:{x:itemListWidth,y:undefined,w:undefined,h:descriptionsHeight,align:"afterY",lineNum:descriptionsLineNum,},
}, // 3
[
dataPath, // 4-0
info=>info&&(properties.key in info), // 4-1
" repeated: ", // 4-2
new Set([
	'cancel',
]), // 4-3
"持有數量/獲得數量", // 4-4
"製作成功：", // 4-5
"\\TXTCENTER:\"未知\"", // 4-6
], // 4
properties, // 5
['cost','gain',], // 6
[2,], // 7: iconPadding,
[
function f(){
	const ori=Window_Base.prototype.standardFontSize.apply(this,arguments);
	return (ori>>1)+(ori>>2);
}, // 8-0
jsInfo=>jsInfo[2], // 8-1
evaljs, // 8-2
], // 8: funcs
[putDataArrByType,], // 9: make tbl
{loc:"DR",}, // 10: opt of popupMsg
{name:"Item3",volume:75,pitch:100}, // 11: success sound effect
[ "#FFFFFF" , "#FF0000" ], // 12: // \TXTCOLOR // [ init req text color , insufficient text color ]
];

new cfc(p).
addBase('initialize',function f(){
	const rtv=f._super.initialize.apply(this,arguments);
	this.init();
	return rtv;
}).
addBase('init',function f(){
	this._state=f.tbl[2][0];
	ImageManager.otherFiles_addLoad(f.tbl[4][0]);
},ttt).
addBase('create',function f(){
	const rtv=f._super.create.apply(this,arguments);
	this.createAll();
	return rtv;
}).
addBase('getRoot',function f(){
	return this._root;
}).
addBase('createAll',function f(){
	this.createAll_parseData();
	this.createAll_root();
	this.createWindow_itemListWindow();
	this.createWindow_requirementsWindow();
	this.createWindow_descriptionsWindow();
	this.createAll_finalTune();
}).
addBase('createAll_parseData',function f(){
	const raw=ImageManager.otherFiles_getData(f.tbl[1]._templatePath);
	ImageManager.otherFiles_delData(f.tbl[1]._templatePath);
	if(!raw){
		this._data=[];
		return;
	}
	const arr=this._data=JSON.parse(raw).filter(f.tbl[3][1],f.tbl[1]);
	const m=this._data._key2info=new Map();
	for(let x=0,xs=arr.length;x!==xs;++x){
		if(!(f.tbl[1]._itemPropertyStringDescription in arr[x])) arr[x][f.tbl[1]._itemPropertyStringDescription]="";
		if(!(f.tbl[1]._itemPropertyStringDisplay     in arr[x])) arr[x][f.tbl[1]._itemPropertyStringDisplay]=arr[x][f.tbl[1]._itemPropertyStringKey];
		const key=arr[x][f.tbl[1]._itemPropertyStringKey];
		if(f.tbl[3][0].has(key)){
			throw new Error("you cannot use "+key+" as internal name.");
		}
		if(m.has(key)){
			throw new Error(f.tbl[1]._itemPropertyStringKey+" repeated: "+key);
		}
		m.set(key,arr[x]);
	}
},t).
addBase('createAll_root',function f(){
	this.addChild(this._root=new Sprite());
}).
addBase('createWindow_itemListWindow',function f(){
	const sp=this._itemListWindow=new Window_合成_list(0,0,this._data,$gameSystem.synthesis_getList());
	const conf=f.tbl[3].itemList; conf.h=Graphics.boxHeight;
	sp.positioning(conf);
	this.getRoot().addChild(sp);
},ttt).
addBase('createWindow_itemListWindow_okHandler',function f(){
	// bind `this` to scene
	const self=this._itemListWindow; if(!self.isCurrentItemEnabled()){ SoundManager.playBuzzer(); return self.activate(); }
	const info=self.getCurrentInfo(); if(!info) return;
	for(let keys=f.tbl[4],z=keys&&keys.length,cw2=self.contentsWidth()>>1;z--;){
		const coef=1-(z<<1);
		for(let i=0,arr=info[f.tbl[1][keys[z][0]]],xs=arr&&arr.length;i<xs;++i){
			const info=arr[i];
			if('g'===info[0]) $gameParty.gainGold(coef*info[1]);
			else if('j'===info[0]) EVAL.call(this,info[1]);
			else{
				const item=DataManager.getItemCont(info[0])[info[1]];
				$gameParty.gainItem(item,coef*info[2]);
				self.refreshItemsEnabled&&self.refreshItemsEnabled();
			}
		}
	}
	if($gameTemp.popupMsg){
		$gameTemp.popupMsg("製作成功："+info[f.tbl[1]._itemPropertyStringDisplay],{loc:"DR",});
		AudioManager.playSe(({name:"Item3",volume:75,pitch:100,}),);
	}
	self.activate();
},t).
addBase('createWindow_requirementsWindow',function f(){
	const sp=this._requirementsWindow=new Window_Base();
	sp.processNormalCharacter=Window_Message.prototype.processNormalCharacter;
	sp.standardFontSize=f.tbl[8][0];
	const conf=f.tbl[3].requirements; conf.w=Graphics.width-f.tbl[3].itemList.w; conf.h=Graphics.boxHeight-f.tbl[3].descriptions.h;
	sp.positioning(conf);
	this.getRoot().addChild(sp);
	if($gameTemp.popupMsg) $gameTemp.popupMsg(f.tbl[4][4],f.tbl[10]);
},ttt).
addBase('createWindow_requirementsWindow_refreshHelp',function f(info){
	f.tbl[9][0](f.tbl);
	// this._requirementsWindow.refreshHelp=this.createWindow_requirementsWindow_refreshHelp;
	this.createContents();
	const lh=this.lineHeight(),x0=this.textPadding();
	let x=x0,y=0,res={};
	if(info[f.tbl[5].head]){ this.drawTextEx(info[f.tbl[5].head],x,y,undefined,undefined,res); y=res.y+lh; }
	if(!info[f.tbl[5].hideNameInRequirement]){
		this.drawTextEx("\\TXTCENTER:"+JSON.stringify(f.tbl[5].display),x,y,undefined,undefined,res); y=res.y+lh;
		this.drawTextEx(info[f.tbl[5].display],x,y,undefined,undefined,res); y=res.y+lh;
	}
	for(let z=0,keys=f.tbl[6],cw2=this.contentsWidth()>>1;z<keys.length;++z){
		x=x0;
		y+=lh;
		this.drawTextEx("\\TXTCENTER:"+JSON.stringify(f.tbl[5][keys[z]]),x,y,undefined,undefined,res); y=res.y+lh;
		if(info[f.tbl[5].hideGain]&&'gain'===keys[z]){
			this.drawTextEx(f.tbl[4][6],x,y,undefined,undefined,res); y=res.y+lh;
			continue;
		}
		for(let i=0,arr=info[f.tbl[5][keys[z]]],xs=arr&&arr.length;i<xs;++i){
			const info=arr[i];
			if('g'===info[0]){
				const usingGoldIcon=this.usingGoldIcon&&this.usingGoldIcon(TextManager.currencyUnit);
				const beRed=!($gameParty.gold()>=info[1]-0);
				const signedNumInfo1='gain'===keys[z]?(info[2]<0?info[2]:"+"+info[2]):(info[1]<0?"+"+info[1]:'-'+info[1]); // cost
				const s=('\\TXTCOLOR"'+f.tbl[12][beRed|0]+'"')+$gameParty.gold()+' \\G'+' / '+signedNumInfo1+' \\G'+('\\TXTCOLOR"'+f.tbl[12][0]+'"');
				if(x>=cw2){
					// detect auto newLine
					if(usingGoldIcon) x+=Window_Base._iconWidth+f.tbl[7][0];
					const mockRes=Object.assign({},res);
					this._is_戰鬥介面選單文字消失=true;
					this.drawTextEx(' ',x,y,undefined,undefined,mockRes);
					const standardY=mockRes.y;
					Object.assign(mockRes,res);
					this.drawTextEx(s,x,y,undefined,undefined,mockRes);
					const resY=mockRes.y;
					this._is_戰鬥介面選單文字消失=false;
					if(standardY!==resY){
						x=x0;
						y=res.y+lh;
					}else if(usingGoldIcon) x-=Window_Base._iconWidth+f.tbl[7][0];
				}
				if(usingGoldIcon){
					this.drawIcon(Yanfly.Icon.Gold, x, y);
					x+=Window_Base._iconWidth+f.tbl[7][0];
				}
				this.drawTextEx(s,x,y,undefined,undefined,res);
				if(usingGoldIcon){
					x-=Window_Base._iconWidth+f.tbl[7][0];
				}
			}else if('j'===info[0]){
				if(info[2]){
					const beRed='cost'===keys[z]&&!f.tbl[8][2](info[1],this);
					this.drawTextEx(('\\TXTCOLOR"'+f.tbl[12][beRed|0]+'"')+info[2],x,y,undefined,undefined,res);
				}
			}else{
				const item=DataManager.getItemCont(info[0])[info[1]];
				const beRed=!('gain'===keys[z]||$gameParty.numItems(item)>=info[2]-0);
				const signedNumInfo2='gain'===keys[z]?(info[2]<0?info[2]:"+"+info[2]):(info[2]<0?"+"+(-info[2]):'-'+info[2]); // cost
				const s=('\\TXTCOLOR"'+f.tbl[12][0]+'"')+item.name+' '+('\\TXTCOLOR"'+f.tbl[12][beRed|0]+'"')+$gameParty.numItems(item)+'/'+signedNumInfo2+('\\TXTCOLOR"'+f.tbl[12][0]+'"');
				if(x>=cw2){
					// detect auto newLine
					if(item.iconIndex) x+=Window_Base._iconWidth+f.tbl[7][0];
					const mockRes=Object.assign({},res);
					this._is_戰鬥介面選單文字消失=true;
					this.drawTextEx(' ',x,y,undefined,undefined,mockRes);
					const standardY=mockRes.y;
					Object.assign(mockRes,res);
					this.drawTextEx(s,x,y,undefined,undefined,mockRes);
					const resY=mockRes.y;
					this._is_戰鬥介面選單文字消失=false;
					if(standardY!==resY){
						x=x0;
						y=res.y+lh;
					}else if(item.iconIndex) x-=Window_Base._iconWidth+f.tbl[7][0];
				}
				if(item.iconIndex){
					this.drawIcon(item.iconIndex,x,y);
					x+=Window_Base._iconWidth+f.tbl[7][0];
				}
				this.drawTextEx(s,x,y,undefined,undefined,res);
				if(item.iconIndex){
					x-=Window_Base._iconWidth+f.tbl[7][0];
				}
			}
			if(res.x<cw2){
				x=cw2;
				y=res.y;
			}else{
				x=x0;
				y=res.y+lh;
			}
		}
	}
	if(info[f.tbl[5].tail]){ this.drawTextEx(info[f.tbl[5].tail],x,y,undefined,undefined,res); y=res.y+lh; }
},ttt).
addBase('createWindow_requirementsWindow_refreshHelp',function f(info){
	// this._requirementsWindow.refreshHelp=this.createWindow_requirementsWindow_refreshHelp;
	this.createContents();
	const lh=this.lineHeight(),x0=this.textPadding();
	let x=x0,y=0,res={};
	if(info[f.tbl[1]._itemPropertyStringHead]){ this.drawTextEx(info[f.tbl[1]._itemPropertyStringHead],x,y,undefined,undefined,res); y=res.y+lh; }
	if(!useDefaultIfIsNaN(info[f.tbl[1]._itemPropertyStringDisplayBlockHide],f.tbl[1]._itemDefaultValueDisplayBlockHide)){
		this.drawTextEx(
			"\\TXTCENTER:"+JSON.stringify(useDefaultIfIsNone(info[f.tbl[1]._itemPropertyStringDisplayBlockTitle],f.tbl[1]._itemDefaultValueDisplayBlockTitle)),
			x,y,undefined,undefined,res,
		); y=res.y+lh;
		this.drawTextEx(info[f.tbl[1]._itemPropertyStringDisplay],x,y,undefined,undefined,res); y=res.y+lh;
	}
	const allColors=[
		("\\TXTCOLOR:"+JSON.stringify(JSON.stringify(f.tbl[5]._defaultTextColor))),
		("\\TXTCOLOR:"+JSON.stringify(JSON.stringify(f.tbl[5].insufficientTextColor))),
	];
	for(let z=0,keys=f.tbl[4],cw2=this.contentsWidth()>>1;z<keys.length;++z){
		const isHidden=useDefaultIfIsNaN(info[f.tbl[1][keys[z][1]]],f.tbl[1][keys[z][2]]); if(isHidden) continue;
		const isGain='_itemPropertyStringGains'===keys[z][0];
		x=x0;
		y+=lh;
		this.drawTextEx(
			"\\TXTCENTER:"+JSON.stringify(useDefaultIfIsNone(info[f.tbl[1][keys[z][3]]],f.tbl[1][keys[z][4]])),
			x,y,undefined,undefined,res,
		); y=res.y+lh;
		for(let i=0,arr=info[f.tbl[1][keys[z][0]]],xs=arr&&arr.length;i<xs;++i){
			const info=arr[i];
			if('g'===info[0]){
				const usingGoldIcon=this.usingGoldIcon&&this.usingGoldIcon(TextManager.currencyUnit);
				const beRed=!isGain&&!($gameParty.gold()>=info[1]-0);
				const signedNumInfo1='_itemPropertyStringGains'===keys[z][0]?(info[2]<0?info[2]:"+"+info[2]):(info[1]<0?"+"+info[1]:'-'+info[1]); // cost
				const s=allColors[beRed|0]+
					$gameParty.gold()+"\\G"+' / '+signedNumInfo1+" \\G"+
					allColors[0]+
					"";
				if(x>=cw2){
					// detect auto newLine
					if(usingGoldIcon) x+=Window_Base._iconWidth+f.tbl[5].iconPadding;
					const mockRes=Object.assign({},res);
					this._is_戰鬥介面選單文字消失=true;
					this.drawTextEx(' ',x,y,undefined,undefined,mockRes);
					const standardY=mockRes.y;
					Object.assign(mockRes,res);
					this.drawTextEx(s,x,y,undefined,undefined,mockRes);
					const resY=mockRes.y;
					this._is_戰鬥介面選單文字消失=false;
					if(standardY!==resY){
						x=x0;
						y=res.y+lh;
					}else if(usingGoldIcon) x-=Window_Base._iconWidth+f.tbl[5].iconPadding;
				}
				if(usingGoldIcon){
					this.drawIcon(Yanfly.Icon.Gold, x, y);
					x+=Window_Base._iconWidth+f.tbl[5].iconPadding;
				}
				this.drawTextEx(s,x,y,undefined,undefined,res);
				if(usingGoldIcon){
					x-=Window_Base._iconWidth+f.tbl[5].iconPadding;
				}
			}else if('j'===info[0]){
				if(info[2]){
					const beRed=!isGain&&!useDefaultIfIsNone(EVAL.call(this,info[2]),true);
					this.drawTextEx(('\\TXTCOLOR"'+f.tbl[12][beRed|0]+'"')+info[2],x,y,undefined,undefined,res);
				}
			}else{
				const item=DataManager.getItemCont(info[0])[info[1]];
				const beRed=!(isGain||$gameParty.numItems(item)>=info[2]-0);
				const signedNumInfo2=isGain?(info[2]<0?info[2]:"+"+info[2]):(info[2]<0?"+"+(-info[2]):'-'+info[2]); // cost
				const s=allColors[0]+item.name+' '+allColors[beRed|0]+$gameParty.numItems(item)+'/'+signedNumInfo2+allColors[beRed|0][0];
				if(x>=cw2){
					// detect auto newLine
					if(item.iconIndex) x+=Window_Base._iconWidth+f.tbl[5].iconPadding;
					const mockRes=Object.assign({},res);
					this._is_戰鬥介面選單文字消失=true;
					this.drawTextEx(' ',x,y,undefined,undefined,mockRes);
					const standardY=mockRes.y;
					Object.assign(mockRes,res);
					this.drawTextEx(s,x,y,undefined,undefined,mockRes);
					const resY=mockRes.y;
					this._is_戰鬥介面選單文字消失=false;
					if(standardY!==resY){
						x=x0;
						y=res.y+lh;
					}else if(item.iconIndex) x-=Window_Base._iconWidth+f.tbl[7][0];
				}
				if(item.iconIndex){
					this.drawIcon(item.iconIndex,x,y);
					x+=Window_Base._iconWidth+f.tbl[7][0];
				}
				this.drawTextEx(s,x,y,undefined,undefined,res);
				if(item.iconIndex){
					x-=Window_Base._iconWidth+f.tbl[7][0];
				}
			}
			if(res.x<cw2){
				x=cw2;
				y=res.y;
			}else{
				x=x0;
				y=res.y+lh;
			}
		}
	}
	if(info[f.tbl[5].tail]){ this.drawTextEx(info[f.tbl[5].tail],x,y,undefined,undefined,res); y=res.y+lh; }
},t).
addBase('createWindow_descriptionsWindow',function f(){
	const sp=this._descriptionsWindow=new Window_Help();
	const fsz0=sp.standardFontSize(),fsz=(fsz0>>1)+(fsz0>>3),LH0=(fsz*3),LH125=LH0>>1; sp.changeFontSize(fsz); sp.standardFontSize=()=>fsz; sp.lineHeight=()=>LH125;
	sp.height=sp.fittingHeight(f.tbl[3].descriptions.lineNum);
	const conf=f.tbl[3].descriptions; conf.y=f.tbl[3].requirements.h; conf.w=f.tbl[3].requirements.w;
	sp.positioning(conf,this._requirementsWindow);
	this.getRoot().addChild(sp);
},ttt).
addBase('createWindow_descriptionsWindow_refreshHelp',function f(info){
	this.setText(info[f.tbl[1]._itemPropertyStringDescription]);
},t).
addBase('createAll_finalTune',function f(){
	// rwd (to font size setting) size
	{
		const h=Math.max(this._descriptionsWindow.fittingHeight(f.tbl[3].descriptions.lineNum),this._descriptionsWindow.height);
		if(h!==this._descriptionsWindow.height){
			this._requirementsWindow.height-=h-this._descriptionsWindow.height;
			this._descriptionsWindow.height=h;
			this._descriptionsWindow.createContents();
		}
	}
	// link
	this._itemListWindow._requirementsWindow=this._requirementsWindow;
	this._itemListWindow._descriptionsWindow=this._descriptionsWindow; // as help window
	this._requirementsWindow.refreshHelp=this.createWindow_requirementsWindow_refreshHelp;
	this._descriptionsWindow.refreshHelp=this.createWindow_descriptionsWindow_refreshHelp;
	// display
	this._itemListWindow.refresh();
	this._itemListWindow.reselect();
	this._descriptionsWindow.deactivate();
	// input
	this._itemListWindow.setHandler('cancel',this.popScene.bind(this));
	this._itemListWindow.setHandler('ok',this.createWindow_itemListWindow_okHandler.bind(this));
	// re-adjust loc
	this._requirementsWindow.y+=this._descriptionsWindow.height;
	this._descriptionsWindow.y=0;
},ttt).
addBase('getInfo',function f(key){
	return this._data._key2info.get(key);
},ttt);
}

})();
