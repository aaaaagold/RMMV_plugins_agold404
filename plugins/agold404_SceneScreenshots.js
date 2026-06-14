"use strict";
/*:
 * @plugindesc Scene_Screenshots
 * @author agold404
 * 
 * 
 * @param Keys
 * @type note[]
 * @text keyCodes to trigger
 * @desc they are eval-ed before treating them as an integer.
 * @default ["\"19\""]
 * 
 * @param HintsSceneCreate
 * @type note
 * @text hint texts - scene create
 * @desc hint texts shown when player enters screenshots scene
 * @default ""
 * 
 * @param CommandTextGetter
 * @type note
 * @text scene enter command text getter
 * @desc a function returning a text, of the command to enter screenshots scene shown in Scene_Options
 * @default "()=>\"see screenshots\""
 * 
 * 
 * @help set key(s) to create screenshots and view them in Scene_Options
 * setting multiple keys means each of them being pressed alone can create a screenshot.
 * 
 * key codes mapping: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
 * 
 * default key is Paause/Break key.
 * 
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;
const pluginName=getPluginNameViaSrc(document.currentScript.getAttribute('src'))||"agold404_SceneScreenshots";
const params=PluginManager.parameters(pluginName)||{};
params._keys=JSON.parse(params.Keys||"[19]");
params._hintsSceneCreate=JSON.parse(params.HintsSceneCreate||'""');
params._commandTextGetter=EVAL.call(null,JSON.parse(params.CommandTextGetter||'"()=>\\"see screenshots\\""'));
if(!(params._commandTextGetter instanceof Function)) params._commandTextGetter=undefined;


t=[
undefined,
params,
window.isTest(),
undefined,
"(no screenshots)",
[
["download","Download",function f(){
	const idx=this._listWindow.index();
	const info=ScreenshotsManager.getI(idx);
	if(!info||!info.url){
		SoundManager.playBuzzer();
		return;
	}
	document.ce('a').sa('href',info.url).sa('download',info.name).click();
	this._itemCmdWindow.activate();
},], // 5- : 
["chNode","Change note",function f(){
	const wnd=this._inputTextWindow;
	const refWnd=this._previewBackgroundWindow;
	const info=wnd._textarea._info=this._listWindow.currentExt();
	wnd.position.set(refWnd.x,refWnd.y);
	wnd.width=refWnd.width;
	wnd._textarea.value=info.name;
	wnd.open();
	//wnd._textarea.focus(); // auto. exec. in `onopened` 
},()=>(typeof Window_InputText!=='undefined'),], // 5- : 
["goback","Go back",function f(){
	this._itemCmdWindow._handlers.cancel();
},], // 5- : 
["delete","Delete",function f(){
	const idx=this._listWindow.index();
	ScreenshotsManager.delI(idx);
	this._listWindow.refresh();
	if(idx&&idx>=this._listWindow._list.length) this._listWindow.select(idx-1);
	else this._listWindow.onNewSelect_updatePreview(idx);
	this._itemCmdWindow._handlers.goback();
},], // 5- : 
], // 5: itemCmds
{
	display:"see screenshots", // f.tbl[1]._commandTextGetter()
	key:"screenshots",
}, // 6: entry
[
{
	updatePolling:undefined,
	cancelCallback:function f(){
		SoundManager.playCancel();
		this._wnd.close();
		//this.blur(); // too early
	},
	escAsCancel:true,
	okCallback:function f(){
		const wnd=this._wnd;
		const self=wnd._scene;
		if(this._info) this._info.name=this.value;
		this._info=undefined;
		SoundManager.playOk();
		wnd.close();
		self._listWindow.refresh();
	},
	enterAsOk:true,
	btns:"left-h",
}, // 7-0: opt
function f(){
	this._scene._itemCmdWindow.activate();
	this._textarea.blur();
	Graphics._canvas.focus();
	Input.isTexting_clear();
}, // 7-1: onclosed
], // 7: Window_InputText setting
];


{ const a=class Window_Screenshots_List extends Window_Command{
};
new cfc(a.prototype).
addBase('makeCommandList',function f(){
	const sz=ScreenshotsManager.size();
	for(let x=0;x<sz;++x){
		const info=ScreenshotsManager.getI(x);
		this.addCommand(info.name,'',undefined,info);
	}
	if(!sz){
		this.addCommand(f.tbl[4],'none',false);
	}
},t).
addBase('windowWidth',function f(){
	return Graphics.boxWidth>>2;
}).
addBase('windowHeight',function f(){
	return Graphics.boxHeight;
}).
addBase('onNewSelect',function f(idx){
	const rtv=f._super[f._funcName].apply(this,arguments);
	this.onNewSelect_updatePreview.apply(this,arguments);
	return rtv;
}).
addBase('onNewSelect_updatePreview',function f(idx){
	const sc=this._scene; if(!sc) return;
	const sp=sc._previewSprite; if(!sp) return;
	const info=sc._listWindow.commandExt(idx);
	if(info&&info.url){
		sp.bitmap=ImageManager.loadNormalBitmap(info.url);
	}else{
		sp.bitmap=ImageManager.loadEmptyBitmap();
	}
	sc.previewSprite_resetPosition();
}).
getP;
window[a.name]=a;
}

{ const a=class Window_Screenshots_ItemCommands extends Window_HorzCommand{
};
new cfc(a.prototype).
addBase('makeCommandList',function f(){
	this.maxCols(); // update enabled items
	for(let arr=f.tbl[5],x=0,xs=arr.length;x<xs;++x){
		if(arr[x][3]!=null) if((arr[x][3] instanceof Function)?!arr[x][3]():!arr[x][3]) continue;
		this.addCommand(arr[x][1],arr[x][0]);
	}
},t).
addBase('windowWidth',function f(){
	return Graphics.boxWidth-Window_Screenshots_List.prototype[f._funcName].call(this);
}).
addBase('maxCols',function f(){
	const tbl5=f.tbl[5];
	if(!tbl5._checked){
		tbl5._checked=true;
		const arr=tbl5.slice();
		tbl5.length=0;
		for(let x=0,xs=arr.length;x!==xs;++x){
			tbl5.push(arr[x]);
		}
	}
	return tbl5.length;
},t).
getP;
window[a.name]=a;
}

{ const a=class Scene_Screenshots extends Scene_MenuBase{
};
new cfc(a.prototype).
addBase('create',function f(){
	const rtv=f._super[f._funcName].apply(this,arguments);
	this.create_do_before.apply(this,arguments);
	this.create_do.apply(this,arguments);
	this.create_do_after.apply(this,arguments);
	return rtv;
}).
addBase('create_do_before',function f(){
	Scene_MenuBase.prototype.createBackground.apply(this,arguments);
	this._allCmdWnds.length=0;
}).
addBase('create_do_after',function f(){
	this._listWindow.select(0);
	if($gameTemp&&$gameTemp.popupMsg&&f.tbl[1]._hintsSceneCreate) $gameTemp.popupMsg(f.tbl[1]._hintsSceneCreate);
},t).
addBase('create_do',function f(){
	this.create_do_listWindow.apply(this,arguments);
	this.create_do_itemCmdWindow.apply(this,arguments);
	this.create_do_previewBackgroundWindow.apply(this,arguments);
	this.create_do_previewSprite.apply(this,arguments);
	this.create_do_inputTextWindow.apply(this,arguments);
}).
addBase('create_do_listWindow',function f(){
	this._listWindow=new Window_Screenshots_List(0,0);
	this.addChild(this._listWindow);
	this._listWindow.select(-1);
	this._listWindow._scene=this;
	this._listWindow.setHandler('cancel',this.popScene.bind(this));
	this._listWindow.setHandler('ok',()=>{
		this.changeUiState_focusOnItemCmdWnd(); return;
		this._listWindow.deactivate();
		this._itemCmdWindow.select(0);
		this._itemCmdWindow.activate();
	});
	
	this._allCmdWnds.push(this._listWindow);
}).
addBase('create_do_itemCmdWindow',function f(){
	this._itemCmdWindow=new Window_Screenshots_ItemCommands(0,0);
	this.addChild(this._itemCmdWindow);
	this._itemCmdWindow.deactivate();
	this._itemCmdWindow.select(-1);
	this._itemCmdWindow._scene=this;
	this._itemCmdWindow.position.set(this._listWindow.width,0);
	this._itemCmdWindow.setHandler('cancel',()=>{
		this.changeUiState_focusOnListWnd(); return;
		this._itemCmdWindow.deactivate();
		this._itemCmdWindow.select(-1);
		this._listWindow.activate();
	});
	this._itemCmdWindow.maxCols(); // update enabled items
	for(let arr=f.tbl[5],x=0,xs=arr.length;x<xs;++x){
		this._itemCmdWindow.setHandler(arr[x][0],arr[x][2].bind(this));
	}
	
	this._allCmdWnds.push(this._itemCmdWindow);
},t).
addBase('create_do_previewBackgroundWindow',function f(){
	this._previewBackgroundWindow=new Window_Base(this._listWindow.width,this._itemCmdWindow.height,Graphics.boxWidth-this._listWindow.width,this._listWindow.height-this._itemCmdWindow.height);
	this.addChild(this._previewBackgroundWindow);
}).
addBase('create_do_previewSprite',function f(){
	this._previewSprite=new Sprite();
	this.addChild(this._previewSprite);
	this.previewSprite_resetPosition.apply(this,arguments);
}).
addBase('create_do_inputTextWindow',function f(){
	this._inputTextWindow=undefined;
	if(typeof Window_InputText==='undefined') return;
	const wnd=this._inputTextWindow=new Window_InputText(0,0,1,1,f.tbl[7][0]);
	this.addChild(wnd);
	wnd._scene=this;
	wnd.height=1+Math.ceil(wnd.standardFontSize()*1.25+wnd.standardPadding()*2);
	wnd.onclosed=f.tbl[7][1];
	wnd.close();
},t).
addBase('previewSprite_resetPosition',function f(){
	this._previewSprite.anchor.set(0.5);
	this._previewSprite.scale.set(0.5);
	this._previewSprite.position.set(
		this._previewBackgroundWindow.x+(this._previewBackgroundWindow.width>>1),
		this._previewBackgroundWindow.y+(this._previewBackgroundWindow.height>>1),
	);
}).
addBase('changeUiState_focusOnListWnd',function f(){
	this.setUiState(f.tbl[0]);
	this._changeUiState_defocusAll();
	this._changeUiState_deselectExcept(new Set([
		this._listWindow,
	]));
	const wnd=this._listWindow;
	wnd.activate();
},[
'focusOnListWnd',
]).
addBase('changeUiState_focusOnItemCmdWnd',function f(){
	this.setUiState(f.tbl[0]);
	this._changeUiState_defocusAll();
	this._changeUiState_deselectExcept(new Set([
		this._listWindow,
		this._itemCmdWindow,
	]));
	const wnd=this._itemCmdWindow;
	wnd.activate();
	if(!(wnd.index()>=0)) wnd.select(0);
},[
'focusOnItemCmdWnd',
]).
getP;
window[a.name]=a;
}


new cfc(Window_Options.prototype).
add('makeCommandList',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.makeCommandList_addScreenshotsCmd.apply(this,arguments);
	return rtv;
}).
addBase('makeCommandList_addScreenshotsCmd',function f(){
	const info=f.tbl[6];
	this.addCommand(
		f.tbl[1]._commandTextGetter?f.tbl[1]._commandTextGetter():info.display,
		info.key,
		undefined,
		{noStatus:true,},
	);
},t).
add('processOk',function f(){
	const info=f.tbl[6];
	if(this.commandSymbol(this.index())===info.key){
		SoundManager.playOk();
		SceneManager.push(Scene_Screenshots,true);
		return;
	}
	return f.ori.apply(this,arguments);
},t).
getP;


const keyName_screenshot='screenshot';
if(params._keys&&params._keys.forEach) params._keys.forEach(x=>{
	x=EVAL(JSON.parse(x)); if(isNaN(x)) return;
	Input.keyMapper[x]=keyName_screenshot;
});
SceneManager.additionalUpdate_renderScene_add(()=>{
	if(Input.isTriggered(keyName_screenshot)) Graphics.createScreenshot(true);
});


})();

