"use strict";
/*:
 * @plugindesc edit save name ; load from file ; export a save to a file
 * @author agold404
 *
 * @help this plugin adds 3 options in 'Window_Options':
 * 1. edit a save's name: The save file title will be: "game_title - your_custom_name".
 * 2. load from file: This is used when: you need to test multiple platform, but you don't want to play again to reach the save point.
 * 3. export a save: export a save to a file. This acts as a download.
 * 
 * languages are detected via 'Intl.DateTimeFormat().resolvedOptions().locale'
 * use default if the above fail or current locale is not set in param `locales`
 * 
 * @param DisplayedTexts
 * @text Displayed Texts (default)
 * @desc texts here has no effects
 * 
 * @param renameSaveTag
 * @parent DisplayedTexts
 * @text Rename Save Tag
 * @default Rename Save's Tag
 * @desc leave it blank (no characters) means no such option
 * 
 * @param loadSaveFromFile
 * @parent DisplayedTexts
 * @text Load Save from File
 * @default Load Save from File
 * @desc leave it blank (no characters) means no such option
 * 
 * @param exportSaveToFile
 * @parent DisplayedTexts
 * @text Export Save to File
 * @default Export Save to File
 * @desc leave it blank (no characters) means no such option
 * 
 * @param locales
 * @parent DisplayedTexts
 * @type note[]
 * @text Displayed in Other Languages
 * @desc will replace the values in above options. format: locale \n renameSaveTag \n loadSaveFromFile \n exportSaveToFile
 * @default ["\"zh-TW\\n修改存檔標記\\n讀取檔案\\n匯出存檔\""]
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=(typeof getPluginNameViaSrc==='function')&&getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_SaveManager";
const d=document,ge=i=>d.getElementById(i),ce=t=>d.createElement(t),ga=(e,a)=>e.getAttribute(a);
const ac=(a,c)=>a.appendChild(c)&&a||a,sa=(e,a,v)=>e.setAttribute(a,v)&&e||e,rc=a=>{
	const c=a.childNodes;
	while(c.length) a.removeChild(c[c.length-1]);
	return a;
},atxt=(a,t)=>a.appendChild(d.createTextNode(t))&&a||a,clearInputs=_=>{
	Input.clear(); Input.update();
	TouchInput.clear(); TouchInput.update();
};
let editing=0;

// define a name field
const fieldName='customName';
// - JsonEx.parse(StorageManager.load(0))

// draw player defined names

{ const p=Window_SavefileList.prototype,k='drawGameTitle';
const r=p[k];
p[k]=function(info, x, y, width){
	return (info.title && info[fieldName]) ? this.drawText(info.title+' - '+info[fieldName], x, y, width) : r.apply(this,arguments);
};
}

// opt UI for defining names
const scname="Scene_EdtSaveName",optKey='key-edtSaveName',optLoadLocal='key-loadLocal',optSaveLocal='key-saveLocal';
const ENUM_SCTYPE_EDITNAME=0;
const ENUM_SCTYPE_SAVELOCAL=1;
let sctype=0;

// param getter
new cfc(DataManager).add('agold404_SaveManager_pluginParams_get',function f(){
	let tmp=this._agold404_SaveManager_pluginParams,rtv;
	if(!tmp){
		tmp=this._agold404_SaveManager_pluginParams=Object.assign({},PluginManager.parameters(pluginName));
		try{
			tmp._localesMap=new Map(f.tbl[3](tmp.locales).map(f.tbl[3]).map(f.tbl[4]));
		}catch(e){
			console.warn(pluginName,":","parsing locales as json failed",'\n',tmp.locales);
		}
	}
	const params=tmp;
	const locale=DataManager.getLocale&&DataManager.getLocale()||undefined;
	if(!params._lastRes) params._lastRes={};
	rtv=params._lastRes[locale];
	if(!rtv){
		rtv=params._lastRes[locale]={};
		if(params._localesMap){
			const res=params._localesMap.get(tmp);
			if(res){ for(let x=0,arr=f.tbl[1],xs=arr.length;x!==xs;++x) rtv[arr[x]]=res[x]===undefined?params[arr[x]]:res[x]; }
		}
		for(let x=0,arr=f.tbl[1],xs=arr.length;x!==xs;++x) if(rtv[arr[x]]===undefined) rtv[arr[x]]=f.tbl[0][arr[x]].display;
	}
	return rtv;
},t=[
{
renameTag:{display:"Rename Save's Tag",key:optKey,status:"",},
loadSaveFromFile:{display:"Load Save from File",key:optLoadLocal,status:"",},
exportSaveToFile:{display:"Export Save to File",key:optSaveLocal,status:"",},
}, // 0: infos of options
['renameTag','loadSaveFromFile','exportSaveToFile',], // 1: order of options
undefined, // 2: 'no status text' key set
item=>JSON.parse(item), // 3: JSON.parse
arrRaw=>{ const arr=arrRaw.split('\n'); return [arr[0],arr.slice(1),]; }, // 4: adjust to Map arguments[0]
],false,true).add('agold404_SaveManager_pluginParams_clearParsingCache',function f(){
	const last=this._agold404_SaveManager_pluginParams;
	this._agold404_SaveManager_pluginParams=undefined;
	return last;
},undefined,false,true).add('agold404_SaveManager_pluginParams_clearLastResultsCache',function f(){
	const t=this._agold404_SaveManager_pluginParams; if(!t) return;
	const last=t._lastRes;
	t._lastRes=undefined;
	return last;
},undefined,false,true);

// - Window_Options
{ const p=Window_Options.prototype;

new cfc(p).add('makeCommandList',function f(){
	const rtv=f.ori.apply(this,arguments);
	// edit save file name
	for(let x=0,arr=f.tbl[1],xs=arr.length,dispTbl=DataManager.agold404_SaveManager_pluginParams_get();x!==xs;++x){
		const key=f.tbl[0][arr[x]].key,display=dispTbl[arr[x]];
		if(display) this.addCommand(display, key);
	}
	return rtv;
},t).add('statusText',function f(idx){
	return f.tbl[2].has(this.commandSymbol(idx))?"":f.ori.apply(this,arguments);
},t);
t[2]=new Set(t[1].map(key=>t[0][key].key));
t=undefined;
{ const k='processOk';
const r=p[k];
const input=document.createElement('input'),onload=e=>{
	const self=e.target,backup={
		tmp:$gameTemp,
		sys:$gameSystem,
		scr:$gameScreen,
		tmr:$gameTimer,
		msg:$gameMessage,
		swi:$gameSwitches,
		var:$gameVariables,
		sss:$gameSelfSwitches,
		atr:$gameActors,
		prt:$gameParty,
		trp:$gameTroop,
		map:$gameMap,
		plr:$gamePlayer,
	};
	try{
		DataManager.createGameObjects();
		DataManager.extractSaveContents(JsonEx.parse(LZString.decompressFromBase64(self.result)));
		SoundManager.playLoad();
		SceneManager._scene.fadeOutAll();
		Scene_Load.prototype.reloadMapIfUpdated();
		SceneManager.goto(Scene_Map);
		$gameSystem.onAfterLoad();
	}catch(err){
		e.target._wnd.active=true;
		SoundManager.playBuzzer();
		$gameTemp=backup.tmp;
		$gameSystem=backup.sys;
		$gameScreen=backup.scr;
		$gameTimer=backup.tmr;
		$gameMessage=backup.msg;
		$gameSwitches=backup.swi;
		$gameVariables=backup.var;
		$gameSelfSwitches=backup.sss;
		$gameActors=backup.atr;
		$gameParty=backup.prt;
		$gameTroop=backup.trp;
		$gameMap=backup.map;
		$gamePlayer=backup.plr;
	}
	self.value='';
},onerr=e=>{
	e.target._wnd.active=true;
	SoundManager.playBuzzer();
};
input.setAttribute('type','file');
input.onchange=function(){
	if(!this.files.length){
		this._wnd.active=true;
		return;
	}
	const reader=new FileReader();
	(reader._wnd=this._wnd).active=false;
	reader.onload=onload;
	reader.onerror=onerr;
	reader.readAsText(this.files[0]); // testing beta...
};
(p[k]=function f(){
	switch(this.commandSymbol(this.index())){
	case optKey: SoundManager.playOk(); sctype=ENUM_SCTYPE_EDITNAME; return SceneManager.push(window[scname]);
	case optLoadLocal:
		if(SceneManager.isSceneChanging()) return;
		SoundManager.playOk();
		clearInputs();
		input.value='';
		input.click();
		if(input._wnd) input._wnd.active=false;
		(input._wnd=this).active=true;
		return;
	case optSaveLocal: SoundManager.playOk(); sctype=ENUM_SCTYPE_SAVELOCAL; return SceneManager.push(window[scname]);
	default: return f.ori.apply(this);
	}
}).ori=r;
}
} // END Window_Options

// window[scname]
{
const a=window[scname]=function(){
	this.initialize.apply(this,arguments);
};
const p=a.prototype=Object.create(Scene_File.prototype);
p.constructor=a;
{ const k='create';
const r=p[k];
(p[k]=function f(){
	f.ori.apply(this,arguments);
	this._listWindow.select(DataManager.latestSavefileId()-1);
	this._gi=JSON.parse(StorageManager.load(0)||"[]");
}).ori=r;
}
{ const k='onSavefileOk';
p[k]=function(){
	const id=this.savefileId();
	let succ=1;
	const obj=this._gi[id];
	if(obj){
		const gc=ge('GameCanvas');
		if(gc){
			TouchInput.bypassPreventDefault_touch_stackPushTrue && TouchInput.bypassPreventDefault_touch_stackPushTrue();
			const self=this;
			const stl=ga(gc,'style');
			let div,css;
			{ const id='editSaveName';
			div=ge(id);
			if(div) rc(div).style.display="block";
			else{
				ac(gc.parentNode,sa(div=sa(ce('div'),'style',stl)),'id',id);
				css=div.style;
				css.zIndex=1<<12;
				css.backgroundColor="rgba(255,255,255,0.75)";
				css.fontSize="32px";
			}
			}
			const input=sa(ce('input'),'style',"position:relative;display:block;left:0px;right:0px;font-size:32px;");
			const btnStyle='font-size:32px;';
			const btn_cancel=sa(atxt(ce('button'),'cancel'),'style',btnStyle);
			const btn=sa(atxt(ce('button'),'confirm'),'style',btnStyle),backToLastWindow=_=>{
				++editing;
				btn_cancel.onclick=btn.onclick=null;
				css.display="none";
				TouchInput.bypassPreventDefault_touch_stackPop && TouchInput.bypassPreventDefault_touch_stackPop();
				self.activateListWindow();
			};
			btn_cancel.onclick=backToLastWindow;
			let infostring;
			switch(sctype){
			default: infostring='ERROR. please click "confirm"';
				btn.onclick=backToLastWindow;
			break;
			case ENUM_SCTYPE_EDITNAME:
				infostring="input save name for save "+id;
				input.value=obj[fieldName]||'';
				btn.onclick=function(){
					obj[fieldName]=input.value;
					StorageManager.save(0,JSON.stringify(self._gi));
					backToLastWindow();
					self._listWindow.refresh();
				};
			break;
			case ENUM_SCTYPE_SAVELOCAL:
				infostring='input a file name for download';
				input.value="save-"+id+".rpgsave";
				btn.onclick=function(){
					sa(sa(sa(ce('a'),'download',input.value),'href',"data:application/plain,"+LZString.compressToBase64(StorageManager.load(id))),'target','_blank').click();
					backToLastWindow();
					self._listWindow.refresh();
				};
			break;
			}
			ac(
				div,ac(
					ac(ac(
						ac(
							ce('div'),atxt(ce('div'),infostring)
						),input
					),btn),btn_cancel
				)
			);
			const clear=e=>{ e.preventDefault(); clearInputs(); };
			input.onkeydown=e=>{
				switch(e.keyCode){
				case 13:
					clear(e);
					btn.click();
				break;
				case 27:
					clear(e);
					backToLastWindow();
				break;
				}
			};
			input.focus();
		}else succ=0;
	}else succ=0;
	if(succ) return editing=1;
	SoundManager.playBuzzer();
	this.activateListWindow();
};
}
} // END window[scname]

// preventDefault
new cfc(Input).add('_onKeyDown',function f(){
	return editing?(editing>1?(editing=0):0):f.ori.apply(this,arguments);
}).add('_agold404_SaveManager_getEditing',function f(){
	return editing;
}).add('_agold404_SaveManager_setEditing',function f(val){
	return editing=val;
});

// save count
// DataManager.maxSavefiles


})();
