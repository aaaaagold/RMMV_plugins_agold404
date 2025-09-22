"use strict";
/*:
 * @plugindesc all base modifies for agold404
 * @author agold404
 * @help as title
 * 
 * This plugin can be renamed as you want.
 */

(()=>{

// ---- ---- ---- ---- 

{ const f=function getPluginNameViaSrc(src){ if(!src) return '';
	const key='/js/plugins/';
	src='/'+src;
	let idx=src.lastIndexOf(key); if(!(idx>=0)) return '';
	idx+=key.length;
	return src.slice(idx,Math.max(src.indexOf('.js',idx),0));
};
window[f.name]=f;
console.log(getPluginNameViaSrc(document.currentScript.src));
}

window._isTest=getUrlParamVal('test')||Utils.isOptionValid('test')||Utils.isOptionValid('btest')||Utils.isOptionValid('etest');
window.isTest=()=>window._isTest;

new cfc(Decrypter).addBase('checkImgIgnore',function(url){
	return this._ignoreList.uniqueHas(url) || ResourceHandler.isDirectPath(url);
}).add('decryptArrayBuffer',function f(arrayBuffer,refHeader){
	// refHeader = 16B or function(resultArrayBuffer) which generates an expected header16B
	let rtv;
	try{
		rtv=f.ori.apply(this,arguments);
	}catch(e){
		// seems not a encrypted content
		return arrayBuffer;
	}
	if(refHeader instanceof Function) refHeader=refHeader(rtv);
	if(refHeader && (refHeader.byteLength>=16||refHeader.length>=16)){ const Bv=new Uint8Array(rtv); if(refHeader.toString()!==new Uint8Array(rtv).slice(0,16).toString()){
		const bak=$dataSystem.encryptionKey;
		const arr=[]; for(let x=16;x--;) arr[x]=Bv[x]^refHeader[x]^('0x'+this._encryptionKey[x]);
		$dataSystem.encryptionKey=arr.map(f.tbl[0]).join('');
		console.log('use key =',$dataSystem.encryptionKey,'\n ref header =',refHeader);
		rtv=f.ori.apply(this,arguments);
		$dataSystem.encryptionKey=bak;
	} }
	return rtv;
},[
c=>c.toString(16).padStart(2,'0'), // 0: map
]);

new cfc(Game_Variables.prototype).
addBase('value',function f(variableId){
	return this._data[variableId]==null?0:this._data[variableId];
}).
getP;

new cfc(Game_Event.prototype).add('start',function f(triggerer){
	const oriTriggerer=this._triggerer; this._triggerer=triggerer;
	f.ori.apply(this,arguments);
	if(this.isStarting()) this._triggerer=triggerer;
	else this._triggerer=oriTriggerer;
	return this;
}).add('clearStartingFlag',function f(){
	this._triggerer=undefined;
	f.ori.apply(this,arguments);
	return this;
});
new cfc(Game_Map.prototype).addBase('setupStartingMapEvent',function f(){
	for(let arr=this._events,xs=arr.length,x=0;x<xs;++x){
		const evt=arr[x];
		if(evt&&evt.isStarting()){
			return this.setupStartingMapEvent_setup(evt);
		}
	}
	return false;
}).addBase('setupStartingMapEvent_setup',function f(evt){
	this._interpreter.setup(evt.list(),evt.eventId(),evt._triggerer);
	evt.clearStartingFlag();
	return true;
});
{ const a=Game_Interpreter,p=a.prototype;
a.NOP={code:0,indent:0,parameters:[],};
// prevent being slow due to getting non-exists property
for(let x=0,arr=[0,404,];x!==arr.length;++x){
	const key='command'+arr[x];
	p[key]=p[key]||undefined;
}
new cfc(p).add('command111',function f(){
	if(this._params&&this._params[0]===11){
		const func=f.tbl[0][this._params[1]];
		if(func && func()){
			this._branch[this._indent]=true;
			return true;
		}
	}
	return f.ori.apply(this,arguments);
},[
{
ok:()=>TouchInput.isPressed(),
cancel:()=>TouchInput.isCancelled(),
},
]).add('setupChild',function f(){
	const rtv=f.ori.apply(this,arguments);
	if(this._childInterpreter){
		this._childInterpreter._parentInterpreter=this;
		this._childInterpreter._rootInterpreter=this._rootInterpreter||this;
		this._childInterpreter._triggerer=this._triggerer;
	}
	return rtv;
}).addBase('getParentInterpreter',function f(){
	return this._parentInterpreter;
}).addBase('getRootInterpreter',function f(){
	return this._rootInterpreter||this;
}).addBase('getTriggerer',function f(){
	return this.getRootInterpreter()._triggerer||$gamePlayer;
}).addBase('jumpToLabel',function f(label,isRev,start){
	if(start===undefined) start=this._index;
	start=start-0||0;
	for(let cmds=this._list,x=start,dx=isRev?-1:1,xs=cmds?cmds.length:0;x<xs&&x>=0;x+=dx){
		const cmd=cmds[x]; if(cmd.code===118&&cmd.parameters[0]===label){ this._index=x; break; }
	}
	return this._index;
}).addBase('setup',function f(list,eventId,triggerer){
	this.clear();
	this._mapId=$gameMap.mapId();
	this._eventId=eventId||0;
	this._list=list;
	this._triggerer=triggerer;
	//if(isRecurrsiveRequestImages) Game_Interpreter.requestImages(list);
});
}
new cfc(Game_System.prototype).add('initialize',function f(){
	const rtv=f.ori.apply(this,arguments);
	this._rndId=LZString.compressToBase64(''+Date.now()+Math.random()+Math.random()).slice(11);
	return rtv;
}).addBase('saveBgs',function f(){
	this._savedBgs=AudioManager.saveBgs();
}).addBase('replayBgs',function f(){
	if(this._savedBgs) AudioManager.replayBgs(this._savedBgs);
}).addBase('saveBg',function f(){
	this.saveBgm();
	this.saveBgs();
}).addBase('replayBg',function f(immediately){
	const replayFadeTime=AudioManager._replayFadeTime;
	if(immediately) AudioManager._replayFadeTime=0;
	this.replayBgm();
	this.replayBgs();
	AudioManager._replayFadeTime=replayFadeTime;
});
Game_Timer.prototype.onExpire=()=>{}; // not abort battle
Game_Troop.prototype.makeUniqueNames=()=>{}; // not set letter
new cfc(Game_Action.prototype).add('applyGlobal',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.applyGlobal_javascript();
	return rtv;
}).addBase('applyGlobal_javascript',function f(){
	const item=this.item();
	const js=item && item.meta[f.tbl[0]];
	if(js){
		eval(js);
	}
},[
"applyGlobal_javascript",
]);
PIXI.ObservablePoint.prototype.resize=function(n){ return this.set(n,n); };
{ const p=PIXI.Rectangle.prototype;
p.equals=function(rect){ return this.x===rect.x&&this.y===rect.y&&this.width===rect.width&&this.height===rect.height; };
p.overlap=function(rect){ return !(rect.x>=this.x+this.width||rect.y>=this.y+this.height||this.x>=rect.x+rect.width||this.y>=rect.y+rect.height); };
}
ConfigManager.readVolume=function(config, name){ const value=config[name]; return (value===undefined)?50:Number(value).clamp(0, 100); };
{ const p=PIXI.Container.prototype;
p._findChildren_r=function(f,rtv){ if(f(this)) rtv.push(this); for(let x=0,arr=this.children;x!==arr.length;++x) arr[x]._findChild_r(f,rtv); return rtv; };
p.findChildren=function(f){ const rtv=[]; return this._findChild_r(f,rtv); };
}
//
Sprite_Actor.prototype.damageOffsetY=()=>-32; // 角色身上的數字上shift
new cfc(Sprite_Damage.prototype).add('createDigits',function f(baseRow, value){
	while(this.children.length) this.removeChild(this.children.back);
	return f.ori.apply(this,arguments);
});
{ const p=SceneManager;
p.isScene_battle =function(){ const sc=this._scene; return sc && sc.constructor===Scene_Battle; };
p.isScene_map    =function(){ const sc=this._scene; return sc && sc.constructor===Scene_Map;    };
}
//
SceneManager.getScConstructor=function(){ return this._scene && this._scene.constructor; };
// { const p=Window_BattleLog.prototype,k='displayAffectedStatus'; const r=p[k]; (p[k]=function(){}).ori=r; }
new cfc(Graphics).
/*
add('_updateVisibility',function f(videoVisible){
	this._video.style.display=f.tbl[0][1-!videoVisible];
	return f.ori.apply(this,arguments);
},[
["none",""], // 0: [inv,vis]
]).
add('_createVideo',function f(){
	const rtv=f.ori.apply(this,arguments);
	this._updateVisibility(false);
	return rtv;
}).
*/
addBase('_upperCanvas_hide',function f(){
	this._upperCanvas.style.display='none';
}).
addBase('_upperCanvas_show',function f(){
	this._upperCanvas.style.display='';
}).
add('endLoading',function f(){
	const rtv=f.ori.apply(this,arguments);
	this._upperCanvas_hide();
	return rtv;
}).
add('startLoading',function f(){
	const rtv=f.ori.apply(this,arguments);
	this._upperCanvas_show();
	return rtv;
}).
getP;
new cfc(Graphics).addBase('_requestFullScreen',function(){
	const element = getTopFrameWindow().document.body;
	if(element.requestFullScreen) element.requestFullScreen();
	else if(element.mozRequestFullScreen) element.mozRequestFullScreen();
	else if(element.webkitRequestFullScreen) element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
	else if(element.msRequestFullscreen) element.msRequestFullscreen();
}).addBase('_isFullScreen',function(){
	const d=getTopFrameWindow().document;
	return ( (d.fullScreenElement && d.fullScreenElement !== null) || (!d.mozFullScreen && !d.webkitFullscreenElement && !d.msFullscreenElement) );
}).addBase('_cancelFullScreen',function(){
	const d=getTopFrameWindow().document;
	if(d.cancelFullScreen) d.cancelFullScreen();
	else if(d.mozCancelFullScreen) d.mozCancelFullScreen();
	else if(d.webkitCancelFullScreen) d.webkitCancelFullScreen();
	else if(d.msExitFullscreen) d.msExitFullscreen();
});
Scene_Boot.prototype.updateDocumentTitle=()=>{
	getTopFrameWindow().document.title=$dataSystem.gameTitle;
};
Graphics.getScale=function(){
	const c=this._canvas;
	return Math.min(c.scrollWidth/c.width,c.scrollHeight/c.height);
};
new cfc(Graphics).add('_updateAllElements',function f(){
	const rtv=f.ori.apply(this,arguments);
	this._updateAsGameCanvas();
	return rtv;
}).addBase('_updateAsGameCanvas',function f(){
	const arr=document.querySelectorAll('.AsGameCanvas');
	for(let x=0,xs=arr.length;x!==xs;++x){
		this._centerElement(arr[x]);
		if((typeof f)===(typeof arr[x]._onCenterElement)) arr[x]._onCenterElement();
	}
}).addBase('addAsGameCanvas',function f(dom){
	if(!dom || !dom.classList) return;
	if(!dom.classList.contains(f.tbl[0])){
		const c=this._canvas;
		dom.sa('style',c.ga('style'));
		dom.width=c.width;
		dom.height=c.height;
	}
	dom.classList.add(f.tbl[0]);
	this._centerElement(dom);
},[
'AsGameCanvas', // 0: marker
]);
new cfc(Graphics).addBase('refGameSystem_get',function(){
	return this._refGameSystem;
}).addBase('refGameSystem_set',function(ref){
	if(ref===undefined) ref=$gameSystem;
	return this._refGameSystem=ref;
}).addBase('refGameSystem_isCurrent',function f(){
	return this.refGameSystem_get()===$gameSystem;
});
{ const p=TilingSprite.prototype;
p.isInScreen_local=p.isInScreen_local;
}
new cfc(Sprite.prototype).addBase('isInScreen_local',function(){
	// calc. local only to reduce calc.

	if(!this.visible || !this.alpha || !this.renderable) return;
	
	const a=this.anchor,s=this.scale;
	const sx=s.x,sy=s.y;
	const xo=this.x,yo=this.y,ws=this.width*sx,hs=this.height*sy;
	let x=xo-ws*a.x,xe=x+ws; if(xe<x){ let t=x; x=xe; xe=t; }
	let y=yo-hs*a.y,ye=y+hs; if(ye<y){ let t=y; y=ye; ye=t; }
	const ext=this.isInScreen_local_getExt();
	if(ext){
		x-=ext.l; xe+=ext.r;
		y-=ext.u; ye+=ext.d;
	}
	if(x>=Graphics._boxWidth||xe<0||y>=Graphics._boxHeight||ye<0) return; // out-of-bound
	
	return true;
}).addBase('isInScreen_local_getExt',function f(){
	return f.tbl[0];
},[
{
l:0|0,
r:0|0,
u:0|0,
d:0|0,
},
]);
new cfc(PIXI.DisplayObject.prototype).addBase('getRect_local',function f(){
	const a=this.anchor||f.tbl[0];
	const w=this.width,h=this.height;
	return new Rectangle(-a.x*w,-a.y*h,w,h);
},[
{x:0,y:0,}, // 0: default anchor
])
.addBase('containsPoint_local',function f(xy){
	return this.getRect_local().contains(xy.x,xy.y);
}).addBase('containsPoint_global',function f(xy){
	return this.containsPoint_local(this.toLocal(xy,undefined,undefined,true));
}).addBase('isOverlap',function f(obj,oxy){
	// TODO: rotated
	// oxy: origin xy in local view. default = {x:0,y:0}
	const xy0=this.parent?this.parent.toLocal(obj,obj.parent,undefined,true):obj.toGlobal(obj,undefined,true);
	const xy1=this.parent?this.parent.toLocal({x:obj.x+obj.width,y:obj.y+obj.height},obj.parent,undefined,true):obj.toGlobal({x:obj.x+obj.width,y:obj.y+obj.height},undefined,true);
	if(oxy){
		xy0.x-=oxy.x; xy0.y-=oxy.y;
		xy1.x-=oxy.x; xy1.y-=oxy.y;
	}
	if(xy1.x<xy0.x){ const tmp=xy0.x; xy0.x=xy1.x; xy1.x=tmp; }
	if(xy1.y<xy0.y){ const tmp=xy0.y; xy0.y=xy1.y; xy1.y=tmp; }
	return new Rectangle(
		xy0.x,xy0.y,
		xy1.x-xy0.x,xy1.y-xy0.y
	).overlap(this);
});
new cfc(Graphics).addBase('isInScreen_rect',function(rect){
	return !(rect.x>=this.boxWidth || rect.x+rect.width<0 || rect.y>=this.boxHeight || rect.y+rect.height<0);
});
new cfc(Sprite_Character.prototype).add('renderWebGL',function f(){
	return this.isInScreen_local()&&f.ori.apply(this,arguments);
}).add('renderCanvas',function f(){
	return this.isInScreen_local()&&f.ori.apply(this,arguments);
});
//
const _getNumOrEval=window.getNumOrEval=function(input){
	return ((typeof input==='string')?EVAL.call(this,input):input)-0||0;
};
//
let t;
if(Utils.isOptionValid('test')){
const _getUsrname=window.getUsrname=Utils.isOptionValid('test')?(()=>{
	let rtv;
	if(typeof require==='function'){ try{
		rtv=require("os").userInfo().username;
	}catch(e){
	} }
	return rtv;
}):none;
new cfc(Game_System.prototype).add('initialize',function f(){
	const rtv=f.ori.apply(this,arguments);
	if(this._usrname=f.tbl[0]()) this._usrname=btoa(this._usrname);
	return rtv;
},[
_getUsrname,
]);
}
const getStr_英文不好齁=t=function f(){
	return f.tbl[0];
}; t.ori=undef; t.tbl=[
'\n\n給看ㄅ懂英文ㄉ人ㄉ台譯版：',
];
const makeDummyWindowProto=window.makeDummyWindowProto=t=function f(c,withContents,withCursor){
	let tmp;
	if(c.constructor===Function){
		tmp=c.prototype;
	}else{
		tmp=c._downArrowSprite;
		if(tmp){
			c._downArrowSprite=undefined;
			tmp.visible=false;
			if(tmp.parent) tmp.parent.removeChild(tmp);
		}
		tmp=c._upArrowSprite;
		if(tmp){
			c._upArrowSprite=undefined;
			tmp.visible=false;
			if(tmp.parent) tmp.parent.removeChild(tmp);
		}
		tmp=c._rightArrowSprite;
		if(tmp){
			c._rightArrowSprite=undefined;
			tmp.visible=false;
			if(tmp.parent) tmp.parent.removeChild(tmp);
		}
		tmp=c._leftArrowSprite;
		if(tmp){
			c._leftArrowSprite=undefined;
			tmp.visible=false;
			if(tmp.parent) tmp.parent.removeChild(tmp);
		}
		tmp=c._windowPauseSignSprite;
		if(tmp){
			c._windowPauseSignSprite=undefined;
			tmp.visible=false;
			if(tmp.parent) tmp.parent.removeChild(tmp);
		}
		tmp=c;
		//tmp._upArrowVisible=tmp._downArrowVisible=false;
	}
	const p=tmp;
	if(!withContents){
		p._refreshContents=none;
		p._updateContents=none;
	}
	if(withCursor){
		p._createAllParts=f._createAllParts_cursor;
	}else{
		p._createAllParts=f._createAllParts;
		p._refreshCursor=none;
		p._updateCursor=none;
	}
	p._refreshArrows=none;
	p._refreshPauseSign=none;
	p._updateArrows=none;
	p._updatePauseSign=none;
};
t._createAllParts = function(){
	this._windowSpriteContainer = new PIXI.Container();
	this._windowBackSprite = new Sprite();
	//this._windowCursorSprite = new Sprite();
	this._windowFrameSprite = new Sprite();
	this._windowContentsSprite = new Sprite();
	//this._downArrowSprite = new Sprite();
	//this._upArrowSprite = new Sprite();
	//this._windowPauseSignSprite = new Sprite();
	this._windowBackSprite.bitmap = new Bitmap(1, 1);
	this._windowBackSprite.alpha = 192 / 255;
	this.addChild(this._windowSpriteContainer);
	this._windowSpriteContainer.addChild(this._windowBackSprite);
	this._windowSpriteContainer.addChild(this._windowFrameSprite);
	//this.addChild(this._windowCursorSprite);
	this.addChild(this._windowContentsSprite);
	//this.addChild(this._downArrowSprite);
	//this.addChild(this._upArrowSprite);
	//this.addChild(this._windowPauseSignSprite);
};
t._createAllParts_cursor = function(){
	this._windowSpriteContainer = new PIXI.Container();
	this._windowBackSprite = new Sprite();
	this._windowCursorSprite = new Sprite();
	this._windowFrameSprite = new Sprite();
	this._windowContentsSprite = new Sprite();
	//this._downArrowSprite = new Sprite();
	//this._upArrowSprite = new Sprite();
	//this._windowPauseSignSprite = new Sprite();
	this._windowBackSprite.bitmap = new Bitmap(1, 1);
	this._windowBackSprite.alpha = 192 / 255;
	this.addChild(this._windowSpriteContainer);
	this._windowSpriteContainer.addChild(this._windowBackSprite);
	this._windowSpriteContainer.addChild(this._windowFrameSprite);
	this.addChild(this._windowCursorSprite);
	this.addChild(this._windowContentsSprite);
	//this.addChild(this._downArrowSprite);
	//this.addChild(this._upArrowSprite);
	//this.addChild(this._windowPauseSignSprite);
};
//
new cfc(Input).addBase('isTexting_set',function f(){
	this._isTexting=true;
}).addBase('isTexting_clear',function f(){
	this._isTexting=false;
}).addBase('isTexting',function f(){
	return this._isTexting;
}).add('_shouldPreventDefault',function f(keyCode){
	if(this.isTexting()) return false;
	return f.ori.apply(this,arguments);
});
t=[
none,
];
new cfc(TouchInput).
/*
addBase('_onMouseDown_preventDefault_condOk',function f(event){
	const x=Graphics.pageToCanvasX(event.pageX);
	const y=Graphics.pageToCanvasY(event.pageY);
	return Graphics.isInsideCanvas(x,y);
}).
addBase('_onMouseDown_preventDefault_do',function f(event){
	event.preventDefault();
}).
addBase('_onMouseDown_preventDefault',function f(event){
	if(this._onMouseDown_preventDefault_condOk.apply(this,arguments)) this._onMouseDown_preventDefault_do.apply(this,arguments);
}).
add('_onMouseDown',function f(event){
	const rtv=f.ori.apply(this,arguments);
	this._onMouseDown_preventDefault.apply(this,arguments);
	return rtv;
}).
*/
addBase('_onTouchStart',function f(event){
	this._touched=true;
	let preventDefaulted=false;
	for(let i=0;i<event.changedTouches.length;++i){
		const touch=event.changedTouches[i];
		const x=Graphics.pageToCanvasX(touch.pageX);
		const y=Graphics.pageToCanvasY(touch.pageY);
		if (event.touches.length >= 2) {
			this._screenPressed = true;
			this._pressedTime = 0;
			this._onCancel(x, y, event);
			if(!preventDefaulted){ preventDefaulted=true; event.preventDefault(); }
		} else {
			if (Graphics.isInsideCanvas(x, y)) {
				this._screenPressed = true;
				this._pressedTime = 0;
				this._onTrigger(x, y, event);
				if(!preventDefaulted){ preventDefaulted=true; event.preventDefault(); }
			}
		}
	}
	if (window.cordova || window.navigator.standalone) {
		if(!preventDefaulted){ preventDefaulted=true; event.preventDefault(); }
	}
}).add('_onWheel',function f(evt){
	if(this.bypassPreventDefault_wheel_get(evt)) evt.preventDefault=f.tbl[0];
	return f.ori.apply(this,arguments);
},t).addBase('bypassPreventDefault_wheel_get',function f(){
	return this._bypassPreventDefault_wheel||this._bypassPreventDefault_wheel_stackSize;
}).addBase('bypassPreventDefault_wheel_set',function f(rhs){
	return this._bypassPreventDefault_wheel=rhs;
}).addBase('bypassPreventDefault_wheel_stackPushTrue',function f(){
	this._bypassPreventDefault_wheel_stackSize|=0;
	return ++this._bypassPreventDefault_wheel_stackSize;
}).addBase('bypassPreventDefault_wheel_stackPop',function f(){
	this._bypassPreventDefault_wheel_stackSize|=0;
	return --this._bypassPreventDefault_wheel_stackSize;
}).add('_onTouchStart',function f(evt){
	if(this.bypassPreventDefault_touch_get(evt)) evt.preventDefault=f.tbl[0];
	return f.ori.apply(this,arguments);
},t).add('_onTouchMove',function f(evt){
	if(this.bypassPreventDefault_touch_get(evt)) evt.preventDefault=f.tbl[0];
	return f.ori.apply(this,arguments);
},t).add('_onTouchEnd',function f(evt){
	if(this.bypassPreventDefault_touch_get(evt)) evt.preventDefault=f.tbl[0];
	return f.ori.apply(this,arguments);
},t).addBase('bypassPreventDefault_touch_get',function f(){
	return this._bypassPreventDefault_touch||this._bypassPreventDefault_touch_stackSize;
}).addBase('bypassPreventDefault_touch_set',function f(rhs){
	return this._bypassPreventDefault_touch=rhs;
}).addBase('bypassPreventDefault_touch_stackPushTrue',function f(){
	this._bypassPreventDefault_touch_stackSize|=0;
	return ++this._bypassPreventDefault_touch_stackSize;
}).addBase('bypassPreventDefault_touch_stackPop',function f(){
	this._bypassPreventDefault_touch|=0;
	return --this._bypassPreventDefault_touch_stackSize;
}).
addBase('_onMouseMove',function(event) {
	this._onMove(
		Graphics.pageToCanvasX(event.pageX),
		Graphics.pageToCanvasY(event.pageY),
	);
}).
getP;
//
new cfc(AudioManager).addBase('audioFileExt',function f(){
	return f.tbl[0];
},[
'.ogg',
]).addBase('createBuffer',function(folder, name) {
	const ext = this.audioFileExt();
	const url = this._path + folder + '/' + name + ext;
	return new WebAudio(url);
/*
	if(this.shouldUseHtml5Audio() && folder === 'bgm'){
		if(this._blobUrl) Html5Audio.setup(this._blobUrl);
		else Html5Audio.setup(url);
		return Html5Audio;
	}else return new WebAudio(url);
*/
});
//
SceneManager._updateSceneCnt=0|0;
new cfc(SceneManager).addBase('isMapOrIsBattle',function f(){
	return this._scene&&f.tbl.has(this._scene.constructor);
},new Set([Scene_Map,Scene_Battle])).addBase('updateMain',function f(){
	this.updateMain_data();
	this.updateMain_render();
	this.updateMain_final();
}).addBase('updateMain_data',function f(){
	if(Utils.isMobileSafari()){
		// this.updateInputData(); // already in .update
		this.updateMain_data1(true);
	}else{
		const newTime=this._getTimeInMsWithoutMobileSafari();
		const fTime=Math.min((newTime-this._currentTime)/1000.0,f.tbl[0]);
		this._currentTime=newTime;
		this._accumulator+=fTime;
		for(;this._accumulator>=this._deltaTime;this._accumulator-=this._deltaTime){
			this.updateMain_data1(false);
		}
	}
},[0.25,]).addBase('updateMain_data1',function f(isNotToUpdateInputData){
	if(!isNotToUpdateInputData) this.updateInputData();
	this.changeScene_before();
	this.changeScene();
	this.changeScene_after();
	this.updateScene_before();
	this.updateScene();
	this.updateScene_after();
}).addBase('updateMain_render',function f(){
	this.renderScene_before();
	this.renderScene();
	this.renderScene_after();
}).addBase('updateMain_final',function f(){
	this.requestUpdate();
}).addBase('additionalUpdate_doArr',function f(arr){
	const rtv=[],popup=[]; // remained funcs
	const src=arr.slice();
	arr.length=0;
	src.forEach(f.tbl[0],rtv);
	popup.concat_inplace(arr);
	arr.length=0;
	arr.concat_inplace(popup).concat_inplace(rtv);
	return arr;
},[
function(f){ if(!f()) this.push(f); },
]).addBase('changeScene_before',function f(){
	this.additionalUpdate_doArr(this.additionalUpdate_changeScene_getBefore());
}).addBase('changeScene_after',function f(){
	this.additionalUpdate_doArr(this.additionalUpdate_changeScene_getAfter());
}).addBase('additionalUpdate_changeScene_getBefore',function f(){
	let rtv=this._additionalUpdate_changeScene_before; if(!rtv) rtv=this._additionalUpdate_changeScene_before=[];
	return rtv;
}).addBase('additionalUpdate_changeScene_getAfter',function f(){
	let rtv=this._additionalUpdate_changeScene_after; if(!rtv) rtv=this._additionalUpdate_changeScene_after=[];
	return rtv;
}).addBase('additionalUpdate_changeScene_add',function f(func,isAfter){
	const arr=isAfter?this.additionalUpdate_changeScene_getAfter():this.additionalUpdate_changeScene_getBefore();
	arr.push(func);
}).addBase('updateScene_before',function f(){
	this.additionalUpdate_doArr(this.additionalUpdate_updateScene_getBefore());
}).addBase('updateScene_after',function f(){
	this.additionalUpdate_doArr(this.additionalUpdate_updateScene_getAfter());
}).addBase('additionalUpdate_updateScene_getBefore',function f(){
	let rtv=this._additionalUpdate_updateScene_before; if(!rtv) rtv=this._additionalUpdate_updateScene_before=[];
	return rtv;
}).addBase('additionalUpdate_updateScene_getAfter',function f(){
	let rtv=this._additionalUpdate_updateScene_after; if(!rtv) rtv=this._additionalUpdate_updateScene_after=[];
	return rtv;
}).addBase('additionalUpdate_updateScene_add',function f(func,isAfter){
	const arr=isAfter?this.additionalUpdate_updateScene_getAfter():this.additionalUpdate_updateScene_getBefore();
	arr.push(func);
}).addBase('renderScene_before',function f(){
	this.additionalUpdate_doArr(this.additionalUpdate_renderScene_getBefore());
}).addBase('renderScene_after',function f(){
	this.additionalUpdate_doArr(this.additionalUpdate_renderScene_getAfter());
}).addBase('additionalUpdate_renderScene_getBefore',function f(){
	let rtv=this._additionalUpdate_renderScene_before; if(!rtv) rtv=this._additionalUpdate_renderScene_before=[];
	return rtv;
}).addBase('additionalUpdate_renderScene_getAfter',function f(){
	let rtv=this._additionalUpdate_renderScene_after; if(!rtv) rtv=this._additionalUpdate_renderScene_after=[];
	return rtv;
}).addBase('additionalUpdate_renderScene_add',function f(func,isAfter){
	const arr=isAfter?this.additionalUpdate_renderScene_getAfter():this.additionalUpdate_renderScene_getBefore();
	arr.push(func);
}).addBase('updateScene',function f(){
	if(this._scene){
		if(!this._sceneStarted && this._scene.isReady()){
			this._scene.start_before();
			this._scene.start();
			this._scene.start_after();
			this._sceneStarted=true;
			this.onSceneStart();
		}
		if(this.isCurrentSceneStarted()){
			++this._updateSceneCnt; // reset to zero when 'Graphics.frameCount' increase // in 'Graphics.render'
			this._scene.update();
		}
	}
});
// refine Window tone
new cfc(Window.prototype).
addBase('_refreshBack',function f(){
	const m=this._margin;
	const w=this._width-m*2;
	const h=this._height-m*2;
	const bitmap=new Bitmap(w,h);

	this._windowBackSprite.bitmap=bitmap;
	this._windowBackSprite.setFrame(0,0,w,h);
	this._windowBackSprite.move(m,m);

	if(w>0&&h>0&&this._windowskin){
		const p=96;
		bitmap.blt(this._windowskin,0,0,p,p,0,0,w,h);
		for(let y=0;y<h;y+=p){
			for(let x=0;x<w;x+=p){
				bitmap.blt(this._windowskin,0,p,p,p,x,y,p,p);
			}
		}
		this._refreshBack_adjustBmpTone(bitmap);
	}
}).
addBase('_refreshBack_adjustBmpTone',function f(bitmap){
	const tone=this._colorTone;
	bitmap.adjustTone(tone[0],tone[1],tone[2]);
}).
getP;
new cfc(Window_Base.prototype).
add('initialize',function f(x,y,w,h){
	const rtv=f.ori.apply(this,arguments);
	this.selfTone_init.apply(this,arguments);
	return rtv;
}).
addBase('selfTone_init',function f(x,y,w,h,opt){
	this.selfTone_set(opt&&opt.colorTone);
}).
addBase('selfTone_set',function f(toneColorTriple){
	const tone=toneColorTriple;
	if(!this._colorTone_self||!this._colorTone_self.equals(tone)){
		this._colorTone_self=tone&&[tone[0],tone[1],tone[2]];
		this._refreshBack();
	}
	return this._colorTone_self;
}).
addBase('_selfTone_get',function f(){
	return this._colorTone_self||f.tbl[0];
},[0,0,0,0]).
addBase('selfTone_get',function f(){
	return this._selfTone_get().slice();
}).
addBase('_refreshBack_adjustBmpTone',function f(bitmap){
	let r=0,g=0,b=0;
	{ const tone=this._colorTone; if(tone){
		r+=tone[0];
		g+=tone[1];
		b+=tone[2];
	} }
	{ const tone=this._selfTone_get(); if(tone){
		r+=tone[0];
		g+=tone[1];
		b+=tone[2];
	} }
	bitmap.adjustTone(r,g,b);
}).
getP;
// refine Window_Base
new cfc(Window_Base.prototype).addBase('updateTone',function f(){
	const tone=$gameSystem&&$gameSystem.windowTone()||f.tbl[0];
	this.setTone(tone[0], tone[1], tone[2]);
},[0,0,0,0]).addBase('drawTextEx',function f(text, x, y, _3, _4, out_textState){
	// return dx
	const textState=out_textState||{};
	textState.index=useDefaultIfIsNaN(textState.index_start,0); // `textState.index` is related to `text`. must be reset if text is reset
	// use argument if there it is.
	textState.x=useDefaultIfIsNaN(x,textState.x);
	textState.y=useDefaultIfIsNaN(y,textState.y);
	// try existing value
	textState.left=useDefaultIfIsNaN(textState.left,textState.x);
	textState.right=Math.max(textState.right-0||0,textState.left);
	if(!text) return 0;
	textState.text=this.convertEscapeCharacters(text);
	textState.height=this.calcTextHeight(textState,false);
	textState.outOfBound_x=false;
	const fontSettings=textState.isMeasureOnly&&this.cloneFontSettings();
	//const dbg_text=textState.text;
	if(!textState.isMeasureOnly){
		if(textState.fontSettings) this.applyFontSettings(textState.fontSettings);
		else this.resetFontSettings(); // other plugins use this. // it should be called before calling this func. thus it is internal testing and the settings should not be changed.
	}
	if(textState.text.length<textState.index_end) textState.index_end=undefined; // safety first
	for(const len=useDefaultIfIsNaN(textState.index_end,textState.text.length);textState.index<len;) this.processCharacter(textState);
	if(textState.isMeasureOnly) this.applyFontSettings(fontSettings);
	return textState.x-x;
}).
addBase('cloneFontSettings',function f(){
	return ({
		fontFace:this.contents&&this.contents.fontFace,
		fontSize:this.contents&&this.contents.fontSize,
		textColor:this.contents&&this.contents.textColor,
	});
}).
addBase('applyFontSettings',function f(fontSettings){
	if(!fontSettings||!this.contents) return -1;
	this.contents.fontFace=fontSettings.fontFace;
	this.contents.fontSize=fontSettings.fontSize;
	this.contents.textColor=fontSettings.textColor;
}).
addBase('processNormalCharacter',function f(textState){
	const c=textState.text[textState.index++];
	let wRaw=this.textWidth(c);
	const w=wRaw;
	if(!textState.isMeasureOnly) this.contents.drawText(c,textState.x,textState.y,w*2,textState.height,undefined,textState);
	textState.x+=w;
	if(textState.x>=this.contents.width) textState.outOfBound_x=true; // == for some chars might be widen.
	textState.right=Math.max(useDefaultIfIsNaN(textState.right,textState.x),textState.x);
	return w;
}).addBase('measure_drawTextEx',function f(text, x, y, _3, _4, out_textState){
	// reserved for auto-line-break or something automatically changed by window size
	out_textState=out_textState||{};
	out_textState.isMeasureOnly=true;
	return this.drawTextEx.apply(this,arguments);
}).add('drawText',function f(text,x,y,maxWidth,align,opt){
	if(opt&&opt.isMeasureOnly) return;
	return f.ori.apply(this,arguments);
}).
addBase('processDrawIcon',function(iconIndex,textState){
	if(!textState.isMeasureOnly) this.drawIcon(iconIndex,textState.x+2,textState.y+2);
	textState.x+=Window_Base._iconWidth+4;
	return !textState.isMeasureOnly && "\\I["+iconIndex+"]";
}).
getP;
//
new cfc(Window_Base.prototype).addBase('lineHeight',function f(){
	return 3+~~(this.standardFontSize()*1.25); // 3 is a experienced value
}).addBase('positioning',function f(setting,ref){
	setting=setting||f.tbl;
	let x,y,w,h;
	if(ref){
		x=ref.x;
		y=ref.y;
		w=ref.width;
		h=ref.height;
	}
	if('x' in setting) x=setting.x;
	if('y' in setting) y=setting.y;
	if('w' in setting) w=setting.w;
	if('h' in setting) h=setting.h;
	x=x-0||0;
	y=y-0||0;
	w=w-0||0;
	h=h-0||0;
	if(ref&&setting.align){
		if(0){
		}else if(setting.align==='beforeX'){
			y=ref.y;
			x=ref.x-w;
		}else if(setting.align==='beforeY'){
			x=ref.x;
			y=ref.y-h;
		}else if(setting.align==='afterX'){
			y=ref.y;
			x=ref.x+ref.width;
		}else if(setting.align==='afterY'){
			x=ref.x;
			y=ref.y+ref.height;
		}
	}
	this.x=x;
	this.y=y;
	this.width=w;
	this.height=h;
},{}).addBase('processCStyleStringContent',function f(textState){
	const info=getCStyleStringStartAndEndFromString(textState.text,textState.index);
	if(info.start<info.end){
		textState.index=info.end;
		return JSON.parse(textState.text.slice(info.start,info.end));
	}else return f.tbl[0];
},['']);
//
new cfc(Window_Base.prototype).
addBase('drawGauge_defaultAlign',function f(){
	return f.tbl[0];
},[
'btm', // top
]).
addBase('drawGauge_defaultHeight',function f(){
	return f.tbl[0];
},[
6,
]).
addBase('drawGauge_defaultPadding',function f(){
	return f.tbl[0];
},[
2,
]).
addBase('drawGauge_getGaugeY',function f(y,height,align,padding){
	return this[f.tbl[0][align]||f.tbl[0]._default].apply(this,arguments);
},[
{
btm:'drawGauge_getGaugeY_btm',
top:'drawGauge_getGaugeY_top',
_default:'drawGauge_getGaugeY_btm',
}, // 0: mapping
]).
addBase('drawGauge_getGaugeY_btm',function f(y,height,align,padding){
	return y+this.lineHeight()-padding-height;
}).
addBase('drawGauge_getGaugeY_top',function f(y,height,align,padding){
	return y+padding;
}).
addBase('drawGauge',function(x,y,width,height,rate,color1,color2,align,padding){
	align=align||this.drawGauge_defaultAlign();
	height-=0; if(isNaN(height)) height=this.drawGauge_defaultHeight();
	padding-=0; if(isNaN(padding)) padding=this.drawGauge_defaultPadding();
	const fillW=Math.floor(width*rate);
	const gaugeY=this.drawGauge_getGaugeY(y,height,align,padding);
	this.contents.fillRect(x,gaugeY,width,height,this.gaugeBackColor());
	this.contents.gradientFillRect(x,gaugeY,fillW,height,color1,color2);
}).
addBase('drawActorP_defaultWidth',function(valColor,gaugeColor1,gaugeColor2,valRate,txt,valCurr,valMax,actor,x,y,width,sysColor,normalColor){
	return 186;
}).
addBase('drawActorP_defaultTxtWidth',function(valColor,gaugeColor1,gaugeColor2,valRate,txt,valCurr,valMax,actor,x,y,width,sysColor,normalColor){
	return 44;
}).
addBase('drawActorP_common',function(valColor,gaugeColor1,gaugeColor2,valRate,txt,valCurr,valMax,actor,x,y,width,height,align,sysColor,normalColor){
	if(width===undefined) width=this.drawActorP_defaultWidth.apply(this,arguments);
	if(sysColor===undefined) sysColor=this.systemColor();
	if(normalColor===undefined) normalColor=this.normalColor();
	if(1<valRate) valRate=1;
	this.drawGauge(x,y,width,height,valRate,gaugeColor1,gaugeColor2,align);
	this.changeTextColor(sysColor);
	this.drawText(txt,x,y,this.drawActorP_defaultTxtWidth.apply(this,arguments));
	this.drawCurrentAndMax(valCurr,valMax,x,y,width-1,valColor,normalColor);
}).
addBase('isActorHpHidden',function f(actor){
	return false;
}).
addBase('drawActorHp',function(actor,x,y,width,height,align){
	if(this.isActorHpHidden(actor)) return;
	return this.drawActorP_common(
		this.hpColor(actor),
		this.hpGaugeColor1(),this.hpGaugeColor2(),
		actor.hpRate(),TextManager.hpA,actor.hp,actor.mhp,
		actor,x,y,width,height,align,
	);
}).
addBase('isActorMpHidden',function f(actor){
	return false;
}).
addBase('drawActorMp',function(actor,x,y,width,height,align){
	if(this.isActorMpHidden(actor)) return;
	return this.drawActorP_common(
		this.mpColor(actor),
		this.mpGaugeColor1(),this.mpGaugeColor2(),
		actor.mpRate(),TextManager.mpA,actor.mp,actor.mmp,
		actor,x,y,width,height,align,
	);
}).
addBase('isActorTpHidden',function f(actor){
	return false;
}).
addBase('drawActorTp',function(actor,x,y,width,height,align){
	if(this.isActorTpHidden(actor)) return;
	return this.drawActorP_common(
		this.tpColor(actor),
		this.tpGaugeColor1(),this.tpGaugeColor2(),
		actor.tpRate(),TextManager.tpA,actor.tp,actor.mtp,
		actor,x,y,width,height,align,
	);
}).
getP;
Object.defineProperties(Game_BattlerBase.prototype,{
	mtp:{
		get:function(){
			return this.maxTp();
		},configurable:true,
	},
});
//
new cfc(Window_Help.prototype).addBase('setText',function f(text,forceUpdate,out_textState){
	if(this.setText_condOk(text,forceUpdate)) return this.setText_doUpdate(text,out_textState);
}).addBase('setText_condOk',function f(text,forceUpdate){
	return forceUpdate || this._text!==text;
}).addBase('setText_doUpdate',function f(text,out_textState){
	this._text=text;
	return this.refresh(out_textState);
}).addBase('refresh',function f(out_textState){
	this.contents.clear();
	return this.drawTextEx(this._text, this.textPadding(), 0, undefined,undefined,out_textState);
});
//
new cfc(Window_Selectable.prototype).addBase('cursorDown',function(wrap){
	const index=this.index();
	const maxItems=this.maxItems();
	const maxCols=this.maxCols();
	const maxRows=this.maxRows();
	if(maxRows>=2){
		let nextIndex;
		if(index+maxCols<maxItems) nextIndex=index+maxCols;
		else if(this.cursorDown_canLoop(wrap)) nextIndex=index%maxCols;
		if(nextIndex>=0) this.select(nextIndex);
	}
}).addBase('cursorDown_canLoop',t=function f(wrap){
	return !!wrap;
}).addBase('cursorUp',function(wrap){
	const index=this.index();
	const maxItems=this.maxItems();
	const maxCols=this.maxCols();
	const maxRows=this.maxRows();
	if(maxRows>=2){
		let nextIndex;
		if(index>=maxCols) nextIndex=index-maxCols;
		else if(this.cursorUp_canLoop(wrap)){
			const c=index%maxCols;
			const lastC=(maxItems-1)%maxCols;
			nextIndex=(maxRows-1-(lastC<c))*maxCols+c;
		}
		if(nextIndex>=0) this.select(nextIndex);
	}
}).addBase('cursorUp_canLoop',t
).addBase('cursorRight',function(wrap){
	const index=this.index();
	const maxItems=this.maxItems();
	if(this.maxCols()>=2 && (index+1<maxItems||this.cursorRight_canLoop(wrap))) this.select((index+1)%maxItems);
}).addBase('cursorRight_canLoop',t
).addBase('cursorLeft',function f(wrap){
	const index=this.index();
	const maxItems=this.maxItems();
	if(this.maxCols()>=2 && (index>=1||this.cursorLeft_canLoop(wrap))) this.select((index-1+maxItems)%maxItems);
}).addBase('cursorLeft_canLoop',t
).add('processCursorMove',function f(){
	const idx=this.index();
	const rtv=f.ori.apply(this,arguments);
	if(this.isCursorMovable()){
		const idx2=this.index();
		f.tbl[0].forEach(f.tbl[1],this);
		if(idx===idx2){
			f.tbl[2].forEach(f.tbl[3],this);
			if(idx!==this.index()) SoundManager.playCursor();
		}
	}
	return rtv;
},t=[[[35,'end',function(){
	const M=this.maxItems(); // if(!(0<M)) return; // called in 'this.isCursorMovable'
	this.select(M-1);
}],[36,'home',function(){
	const M=this.maxItems(); // if(!(0<M)) return; // called in 'this.isCursorMovable'
	this.select(0);
}],],function(info){
	if(Input.isTriggered(info[1])) info[2].call(this);
},[[33,'pageup',function(){
	this.cursorPageup();
}],[34,'pagedown',function(){
	this.cursorPagedown();
}],],function(info){
	if( !this.isHandled(info[1]) && Input.isRepeated(info[1]) && !Input.isTriggered(info[1]) ) info[2].call(this);
},]).add('cursorPageup',function f(){
	const idx=this.index();
	const rtv=f.ori.apply(this,arguments);
	if(idx>=0 && idx===this.index()){
		// no longer than a page
		const C=this.maxCols();
		if(idx>=C) this.select(idx%C);
		else this.select(0); // hit on top
	}
	return rtv;
}).add('cursorPagedown',function f(){
	const idx=this.index();
	const rtv=f.ori.apply(this,arguments);
	if(idx>=0 && idx===this.index()){
		const M=this.maxItems();
		if(0<M) this.select(M-1);
	}
	return rtv;
}).add('update',function f(){
	const rtv=f.ori.apply(this,arguments);
	if(this.active) this.update_active();
	if(this.isOpenAndActive()) this.update_openAndActive();
	return rtv;
}).addBase('update_active',none
).addBase('update_openAndActive',none
).addBase('itemRect_curr',function f(){
	return this.itemRect(this.index());
}).addBase('itemRect_scrollRectInView',function f(rect){
	let scy=this._scrollY;
	const maxH=this.contentsHeight(); if(!(0<maxH)) return; // initialize
	const top=rect.y;
	const btm=rect.y+rect.height;
	const db=maxH-btm;
	if(db<0) scy-=db;
	if(top<0) scy+=top;
	if(scy===this._scrollY) return;
	this._scrollY=scy;
	this.refresh(); // scrolled, refresh
}).addBase('ensureCursorVisible',function f(){
	if(!(this.index()>=0)) return;
	const rect=this.itemRect_curr(); // origin: scrolled origin
	this.itemRect_scrollRectInView(rect);
	//this.refresh(); // this will call `makeItemList`
	this.updateCursor();
}).addBase('scrollDist',function f(){
	return f.tbl[0];
},[
32,
]).addBase('scrollDown',function f(){
	if(!(this.index()>=0)) return;
	let scy=this._scrollY;
	const maxCols=this.maxCols();
	const rectEnd=this.itemRect(maxCols*~~((this.maxItems()+maxCols-1)/maxCols)); // align to next row
	rectEnd.y+=scy;
	scy+=this.scrollDist();
	const overflowY=this.contentsHeight()-(rectEnd.y-scy);
	if(0<overflowY) scy-=overflowY;
	if(scy<=this._scrollY) return;
	this._scrollY=scy;
	this.refresh();
	this.updateCursor();
}).addBase('scrollUp',function f(){
	if(!(this.index()>=0)) return;
	let scy=this._scrollY;
	const rectBeg=this.itemRect(0);
	rectBeg.y+=scy;
	scy-=this.scrollDist();
	if(!(scy>=0)) scy=0;
	if(scy>=this._scrollY) return;
	this._scrollY=scy;
	this.refresh();
	this.updateCursor();
}).addBase('itemRect',function f(index){
	const rect = new Rectangle();
	const maxCols = this.maxCols();
	rect.width = this.itemWidth();
	rect.height = this.itemHeight();
	rect.x = index % maxCols * (rect.width + this.spacing()) - this._scrollX;
	rect.y = ~~(index / maxCols) * (rect.height + this.itemSpacingY()) - this._scrollY; // it's too much if over int32, so let it bug.
	return rect;
}).addBase('itemSpacingY',function f(){
	return 0;
}).addBase('topRow',function f(){
	return Math.floor(this._scrollY/(this.itemHeight()+this.itemSpacingY()));
}).addBase('updateArrows',function f(){
	let scy=this._scrollY;
	const rectBeg=this.itemRect(0);
	const maxCols=this.maxCols();
	const rectBtm=this.itemRect(maxCols*~~((this.maxItems()+maxCols-1)/maxCols)-maxCols);
	this.downArrowVisible=this.contentsHeight()<rectBtm.y+rectBtm.height;
	this.upArrowVisible=rectBeg.y<0;
}).add('select',function f(idx){
	const oldIdx=this._indexOld=this._index;
	const rtv=f.ori.apply(this,arguments);
	this.onSelect.apply(this,arguments);
	if(oldIdx!==this._index) this.onNewSelect.apply(this,arguments);
	return rtv;
}).
addBase('onSelect',none).
addBase('onNewSelect',none).
getP;
t[0].forEach(info=>Input.keyMapper[info[0]]=info[1]);
t=undefined;
//
new cfc(Window_SkillType.prototype).addBase('makeCommandList',function f(){
	if(this._actor){
		this._actor.addedSkillTypes().sort(cmpFunc_num).forEach(f.tbl[0],this);
	}
},[
function(stypeId){ this.addCommand($dataSystem.skillTypes[stypeId],'skill',true,stypeId); }, // 0: forEach skillType this.addCommand
]).
getP;
//
new cfc(Window_SkillList.prototype).addBase('item',function f(idx){
	if(idx===undefined) idx=this.index();
	return this._data && idx >= 0 ? this._data[idx] : null;
});
//
new cfc(Window_Base.prototype).add('updateClose',function f(){
	const isClosed=this.isClosed();
	const rtv=f.ori.apply(this,arguments);
	if(!isClosed && this.isClosed()) this.onclosed();
	return rtv;
}).addBase('onclosed',none);
new cfc(Window_Message.prototype).addBase('onclosed',function f(){
	Window_Base.prototype.onclosed.apply(this,arguments);
	if(this._positionType!==2 && this._choiceWindow && this._choiceWindow.updatePlacement){ this.updatePlacement(); this._choiceWindow.updatePlacement(); }
});
if(Window_Message.prototype.updateClose===Window_Base.prototype.updateClose){
new cfc(Window_Message.prototype).addBase('updateClose',function f(){
	const rtv=Window_Base.prototype.updateClose.apply(this,arguments);
	return rtv;
});
}
// ==== escapeCode ==== 
new cfc(Window_Base.prototype).addBase('obtainEscapeCode',function f(textState){
	++textState.index; // \ 
	const regExp=this.obtainEscapeCode_getPattern();
	const arr=regExp.exec(textState.text.slice(textState.index));
	if(arr){
		textState.index+=arr[0].length;
		return arr[0];
	}
	return '';
}).addBase('obtainEscapeCode_getPattern',function f(){
	return Window_Base.getEscapeCodePattern();
});
new cfc(Window_Base).addBase('getEscapeCodePattern',function f(){
	return f.tbl[0];
},[
/^[\$\.\|\^!><\{\}\\;]|^[A-Z]+/i, // 0: pattern // to use \n as new line, write \n\;
]);
// ==== escapeCode - wnd base ==== 
new cfc(Window_Base.prototype).
addBase('obtainEscapeParam',function f(textState){
	const m=textState.text.slice(textState.index).match(f.tbl[0]);
	if(!m) return '';
	textState.index+=m[0].length;
	return isNaN(m[1])?m[1]:m[1]-0;
},[
/^\[([^\]\n]+)\]/,
]).
addBase('changeFontSize',function f(fontSizeNum){
	let rtv;
	if(isNaN(fontSizeNum)) rtv=this.contents.fontSize=this.standardFontSize();
	else rtv=this.contents.fontSize=fontSizeNum;
	return rtv;
}).
addBase('processSubtext',function f(subtext,textState,reason){
	const textInfo=this.cloneTextInfo(textState,reason);
	const oriFontSettings=textState.fontSettings;
	const fontSettings=textState.fontSettings=this.cloneFontSettings();
	textState.index_start=undefined;
	textState.index_end=undefined;
	this.drawTextEx(subtext+'',undefined,undefined,undefined,undefined,textState);
	textState.fontSettings=oriFontSettings;
	this.setTextInfo(textState,textInfo);
}).
addBase('setPrevTextInfoStack',function f(textState,stk){
	textState.prevTextInfoStack=stk;
}).
addBase('getPrevTextInfoStack',function f(textState){
	return; // not using it.
}).
addBase('cloneTextInfo',function f(textState,reason){
	return ({
		text:textState.text,
		index:textState.index,
		index_start:textState.index_start,
		index_end:textState.index_end,
		fontSettings:this.cloneFontSettings(),
		reason:reason,
	});
}).
addBase('setTextInfo',function f(textState,textInfo){
	if(!textInfo) return;
	this.applyFontSettings(textInfo.fontSettings);
	textState.index_end=textInfo.index_end;
	textState.index_start=textInfo.index_start;
	textState.index=textInfo.index;
	textState.text=textInfo.text;
}).
addBase('processEscapeCharacter_dataobjName',function f(item,textState){
	if(!item) return;
	return this.processSubtext(item.name,textState);
}).
addBase('processEscapeCharacter_dataobjIcon',function f(item,textState){
	if(!item) return;
	return this.processDrawIcon(item.iconIndex,textState);
}).
addBase('processEscapeCharacter_dataobj',function f(code,textState){
	const m=code.match(f.tbl[0]);
	if(!f.tbl[1]){ if(window.$dataItems) f.tbl[1]=({
		SK:$dataSkills,
		I:$dataItems,
		W:$dataWeapons,
		A:$dataArmors,
		ST:$dataStates,
	}); }
	if(!f.tbl[2]){ f.tbl[2]=({
		I:'processEscapeCharacter_dataobjIcon',
		N:'processEscapeCharacter_dataobjName',
	}); }
	const cont=f.tbl[1][m[1]];
	const func=this[f.tbl[2][m[2]]];
	if(!cont||!func) return;
	let param=this.obtainEscapeParam(textState);
	if(m[3]==="V") param=$gameVariables.value(param);
	const arg0=arguments[0];
	arguments[0]=cont[param];
	const rtv=func.apply(this,arguments);
	arguments[0]=arg0;
	return rtv;
},[
/^(SK|I|W|A|ST)(I|N)(V)?/, // 0: re
undefined, // 1: mapping reserved for creating (SK|I|W|A|ST) -> dataarr
undefined, // 2: mapping reserved for creating (I|N) -> iconIndex or name
]).
addBase('processEscapeCharacter',function(code,textState){
	const func=Window_Base.escapeFunction_get(code);
	if(func instanceof Function) return func.apply(this,arguments);
}).
getP;
new cfc(Window_Base).
addBase('escapeFunction_set',function f(code,func){
	// func. should return a string which can re-produce the effect without referencing other than the string itself.
	if(!(func instanceof Function)||!this.getEscapeCodePattern().exec(code)) return console.warn('invalid code'),this;
	f.tbl[0][code]=func;
	return this;
},t=[
{}, // 0: escape functions [code] => (code,textState){ ... } // see below 'Window_Base.escapeFunction_set' for the content
]).
addBase('escapeFunction_getCont',function f(){
	return f.tbl[0];
},t).
addBase('escapeFunction_get',function f(code){
	return f.tbl[0][code];
},t).
getP;
Window_Base.
escapeFunction_set('TXTFONTSIZE',function f(code,textState){
	if(textState.text[textState.index]!==":") return window.isTest()&&console.warn("expected a ':' immediately after '\\TXTFONTSIZE'");
	const strt=textState.index+1;
	const strPos=getCStyleStringStartAndEndFromString(textState.text,strt);
	if(!(strPos.start>=strt)) return window.isTest()&&console.warn("expected a c-style string after '\\TXTFONTSIZE:'");
	textState.index=strPos.end;
	return this.changeFontSize(EVAL.call(this,JSON.parse(textState.text.slice(strPos.start,strPos.end))));
}).
escapeFunction_set('TXTCOLOR',function f(code,textState){
	if(textState.text[textState.index]!==":") return window.isTest()&&console.warn("expected a ':' immediately after '\\TXTFONTSIZE'");
	const strt=textState.index+1;
	const strPos=getCStyleStringStartAndEndFromString(textState.text,strt);
	if(!(strPos.start>=strt)) return window.isTest()&&console.warn("expected a c-style string after '\\TXTFONTSIZE:'");
	textState.index=strPos.end;
	const color=EVAL.call(this,JSON.parse(textState.text.slice(strPos.start,strPos.end)));
	this.changeTextColor(color);
	return "\\TXTCOLOR:"+JSON.stringify(JSON.stringify(color));
}).
escapeFunction_set('SKNV',function f(code,textState){
	return this.processEscapeCharacter_dataobj.apply(this,arguments);
}).
escapeFunction_set('INV',function f(code,textState){
	return this.processEscapeCharacter_dataobj.apply(this,arguments);
}).
escapeFunction_set('WNV',function f(code,textState){
	return this.processEscapeCharacter_dataobj.apply(this,arguments);
}).
escapeFunction_set('ANV',function f(code,textState){
	return this.processEscapeCharacter_dataobj.apply(this,arguments);
}).
escapeFunction_set('STNV',function f(code,textState){
	return this.processEscapeCharacter_dataobj.apply(this,arguments);
}).
escapeFunction_set('SKIV',function f(code,textState){
	return this.processEscapeCharacter_dataobj.apply(this,arguments);
}).
escapeFunction_set('IIV',function f(code,textState){
	return this.processEscapeCharacter_dataobj.apply(this,arguments);
}).
escapeFunction_set('WIV',function f(code,textState){
	return this.processEscapeCharacter_dataobj.apply(this,arguments);
}).
escapeFunction_set('AIV',function f(code,textState){
	return this.processEscapeCharacter_dataobj.apply(this,arguments);
}).
escapeFunction_set('STIV',function f(code,textState){
	return this.processEscapeCharacter_dataobj.apply(this,arguments);
}).
escapeFunction_set('SKN',function f(code,textState){
	return this.processEscapeCharacter_dataobj.apply(this,arguments);
}).
escapeFunction_set('IN',function f(code,textState){
	return this.processEscapeCharacter_dataobj.apply(this,arguments);
}).
escapeFunction_set('WN',function f(code,textState){
	return this.processEscapeCharacter_dataobj.apply(this,arguments);
}).
escapeFunction_set('AN',function f(code,textState){
	return this.processEscapeCharacter_dataobj.apply(this,arguments);
}).
escapeFunction_set('STN',function f(code,textState){
	return this.processEscapeCharacter_dataobj.apply(this,arguments);
}).
escapeFunction_set('SKI',function f(code,textState){
	return this.processEscapeCharacter_dataobj.apply(this,arguments);
}).
escapeFunction_set('II',function f(code,textState){
	return this.processEscapeCharacter_dataobj.apply(this,arguments);
}).
escapeFunction_set('WI',function f(code,textState){
	return this.processEscapeCharacter_dataobj.apply(this,arguments);
}).
escapeFunction_set('AI',function f(code,textState){
	return this.processEscapeCharacter_dataobj.apply(this,arguments);
}).
escapeFunction_set('STI',function f(code,textState){
	return this.processEscapeCharacter_dataobj.apply(this,arguments);
}).
escapeFunction_set('V',function f(code,textState){
	const param=this.obtainEscapeParam(textState);
	return this.processSubtext($gameVariables.value(param),textState);
}).
escapeFunction_set('P',function f(code,textState){
	const param=this.obtainEscapeParam(textState);
	return this.processSubtext(this.partyMemberName(param),textState);
}).
escapeFunction_set('N',function f(code,textState){
	const param=this.obtainEscapeParam(textState);
	return this.processSubtext(this.actorName(param),textState);
}).
escapeFunction_set('G',function f(code,textState){
	return this.processSubtext(TextManager.currencyUnit,textState);
}).
escapeFunction_set('n',function f(code,textState){
	--textState.index;
	return this.processNewLine(textState);
}).
escapeFunction_set('f',function f(code,textState){
	--textState.index;
	return this.processNewPage(textState);
}).
escapeFunction_set('\\',function f(code,textState){
	--textState.index;
	this.processNormalCharacter(textState);
	return "\\";
}).
escapeFunction_set('C',function f(code,textState){
	const cid=this.obtainEscapeParam(textState);
	this.changeTextColor(this.textColor(cid));
	return "\\C["+cid+"]";
}).
escapeFunction_set('I',function f(code,textState){
	return this.processDrawIcon(this.obtainEscapeParam(textState),textState);
}).
escapeFunction_set('{',function f(code,textState){
	this.makeFontBigger();
	return "\\{";
}).
escapeFunction_set('}',function f(code,textState){
	this.makeFontSmaller();
	return "\\}";
}).
escapeFunction_set(';',none);
// ==== escapeCode - wnd msg ====
new cfc(Window_Message.prototype).addBase('processEscapeCharacter',function(code,textState){
	const func=Window_Message.escapeFunction_get(code);
	if(func instanceof Function) return func.apply(this,arguments);
	return Window_Base.prototype.processEscapeCharacter.apply(this,arguments);
}).
addBase('getPrevTextInfoStack',function f(textState){
	let rtv=textState.prevTextInfoStack; if(!rtv) rtv=textState.prevTextInfoStack=[];
	return rtv;
}).
addBase('popPrevTextInfoStack',function f(textState){
	const stk=this.getPrevTextInfoStack(textState);
	const back=stk.pop();
	if(back){
		this.setTextInfo(textState,back);
	}else{
		textState.index=textState.text.length;
	}
	return back;
}).
addBase('processSubtext',function f(subtext,textState,reason){
	if(textState.isMeasureOnly) return f._super.processSubtext.apply(this,arguments);
	this.getPrevTextInfoStack(textState).push(this.cloneTextInfo(textState,reason));
	textState.index=0;
	textState.index_start=undefined;
	textState.index_end=undefined;
	textState.text=subtext+'';
}).
addBase('isEndOfText',function f(textState){
	return !(textState.index<textState.text.length);
}).
add('isEndOfText',function f(textState){
	do{
		if(!f.ori.apply(this,arguments)) return false;
	}while(this.popPrevTextInfoStack(textState));
	return f.ori.apply(this,arguments);
}).
getP;
new cfc(Window_Message).addBase('getEscapeCodePattern',function f(){
	return Window_Base[f._funcName]();
}).addBase('escapeFunction_set',function f(code,func){
	if(!(func instanceof Function)||!this.getEscapeCodePattern().exec(code)) return console.warn('invalid code'),this;
	f.tbl[0][code]=func;
	return this;
},t=[
{}, // 0: escape functions [code] => (code,textState){ ... } // see below 'Window_Message.escapeFunction_set' for the content
]).addBase('escapeFunction_getCont',function f(){
	return f.tbl[0];
},t).addBase('escapeFunction_get',function f(code){
	return f.tbl[0][code]||Window_Base.escapeFunction_get(code);
},t);
Window_Message.
escapeFunction_set('$',function f(code,textState){
	this._goldWindow.open();
}).
escapeFunction_set('.',function f(code,textState){
	this.startWait(15);
}).
escapeFunction_set('|',function f(code,textState){
	this.startWait(60);
}).
escapeFunction_set('!',function f(code,textState){
	this.startPause();
}).
escapeFunction_set('>',function f(code,textState){
	this._lineShowFast=true;
}).
escapeFunction_set('<',function f(code,textState){
	this._lineShowFast=false;
}).
escapeFunction_set('^',function f(code,textState){
	this._pauseSkip=true;
}).
escapeFunction_set('WAIT',function f(code,textState){
	this.startWait(this.obtainEscapeParam(textState));
});
//
new cfc(Scene_Base.prototype).addBase('_prevScene_store',function f(){
	// called when 'scene.initialize'
	this._lastBgBm=SceneManager.backgroundBitmap();
	this._oriStop=undefined;
	const sc=this._prevScene=SceneManager._scene;
	if(sc){
		if(sc.constructor===Scene_Battle){
			// _fadeSprite
			this._oriStop=sc.stop;
			sc.stop=f.tbl[0];
		}
		SceneManager.snapForBackground();
	}
},[
function(){ Scene_Base.prototype.stop.call(this); },
]).addBase('_prevScene_restore',function f(){
	// called in 'scene.create', after background created
	if(this._oriStop){
		const sc=this._prevScene; // if this._oriStop!==undefined, sc!==undefined // already stopped 
		if(this._oriStop===sc.constructor.prototype.stop) delete sc.stop;
		else sc.stop=this._oriStop;
	}
	if(this._lastBgBm) SceneManager._backgroundBitmap=this._lastBgBm;
},t);
//
// ==== dataArr mgr ====
new cfc(DataManager).
addBase('dataarr_resetTable',function f(dataarr){
	dataarr[f.tbl[0]]=dataarr[f.tbl[0]]||new Map();
	dataarr[f.tbl[0]].clear();
	dataarr.forEach(f.tbl[1],dataarr[f.tbl[0]]);
	return dataarr[f.tbl[0]];
},t=[
'_tbl_hasDataobj', // 0: tblKey for hasDataobj
function f(dataobj,i,arr){
	if(dataobj) this.set(dataobj,i);
}, // 0: forEach:rebuild hasDataobj tbl
]).
addBase('dataarr_ensureTableInited',function f(dataarr){
	return dataarr[f.tbl[0]]||this.dataarr_resetTable(dataarr);
},t).
addBase('dataarr_resetLength',function f(dataarr){
	const baseLength=useDefaultIfIsNaN(dataarr.baseLength,dataarr.length);
	dataarr.length=dataarr.baseLength=baseLength;
	this.dataarr_resetTable(dataarr);
},t).
addBase('dataarr_reset',function f(dataarr){
	this.dataarr_resetLength(dataarr);
},t).
addBase('dataarr_addDataobj',function f(dataarr,dataobj,newIdxMin,putToIdx){
	if(!dataobj) return;
	const m=this.dataarr_ensureTableInited(dataarr);
	newIdxMin-=0; if(!(newIdxMin>=dataarr.length)) newIdxMin=dataarr.length;
	const newId=useDefaultIfIsNaN(putToIdx,newIdxMin);
	const oldObj=dataarr[newId];
	if(oldObj===dataobj) return;
	m.delete(oldObj);
	m.set(dataarr[newId]=dataobj,dataobj.id=newId);
	return oldObj;
}).
addBase('dataarr_hasDataobj',function f(dataarr,dataobj){
	return this.dataarr_ensureTableInited(dataarr).has(dataobj);
}).
addBase('dataarr_getIdxOfDataobj',function f(dataarr,dataobj){
	return this.dataarr_ensureTableInited(dataarr).get(dataobj);
}).
addBase('resetDataarrs',function(){
	this.dataarr_reset($dataActors);
	this.dataarr_reset($dataArmors);
	this.dataarr_reset($dataWeapons);
}).
getP;
// Scene_Boot.prototype.terminate_after is defined later
new cfc(Scene_Title.prototype).
add('commandNewGame',function f(){
	DataManager.resetDataarrs();
	return f.ori.apply(this,arguments);
}).
getP;
//
// DO NOT change _onLoad* which are starting with a '_'
new cfc(DataManager).addBase('isSkill',function f(item){
	return item && this.dataarr_hasDataobj($dataSkills,item);
}).addBase('isItem',function f(item){
	return item && this.dataarr_hasDataobj($dataItems,item);
}).addBase('isWeapon',function f(item){
	return item && this.dataarr_hasDataobj($dataWeapons,item);
}).addBase('isArmor',function f(item){
	return item && this.dataarr_hasDataobj($dataArmors,item);
}).
addBase('arrMapFunc_idToDataobj_skill',  i=>$dataSkills[i]).
addBase('arrMapFunc_idToDataobj_item',   i=>$dataItems[i]).
addBase('arrMapFunc_idToDataobj_weapon', i=>$dataWeapons[i]).
addBase('arrMapFunc_idToDataobj_armor',  i=>$dataArmors[i]).
addBase('arrMapFunc_idToDataobj_state',  i=>$dataStates[i]).
addBase('arrMapFunc_idToSkillType',    i=>$dataSystem.skillTypes[i]).
addBase('arrSortFunc_mostImportantStateAtFirst',function f(stateIdA,stateIdB){
	// cmp3
	const p1=$dataStates[stateIdA].priority;
	const p2=$dataStates[stateIdB].priority;
	// greater priority first
	return p1===p2?stateIdA-stateIdB:p2-p1;
}).
addBase('loadDataFile_getPreloadCont',function f(){
	let rtv=this._loadDataFilePreloadCont; if(!rtv) rtv=this._loadDataFilePreloadCont=new Map();
	return rtv;
}).
addBase('loadDataFile_getPreloadData',function f(cacheKey){
	return this.loadDataFile_getPreloadCont().get(cacheKey);
}).
addBase('loadDataFile_clearPreloadData',function f(cacheKey){
	return this.loadDataFile_getPreloadCont().delete(cacheKey);
}).
addBase('loadDataFile_setPreloadData',function f(cacheKey,data){
	this.loadDataFile_getPreloadCont().set(cacheKey,data);
}).
addBase('loadDataFile_makePreloadKey',function f(doneCallback,src,msg,directSrc,mimeType,method,data){
	return directSrc?src:('data/'+src);
}).
addBase('loadDataFile_preload',function f(doneCallback,src,msg,directSrc,mimeType,method,data){
	if(typeof doneCallback!=='function'){
		throw new Error(f.tbl[1]);
	}
	const cacheKey=this.loadDataFile_makePreloadKey.apply(this,arguments);
	const arg0=arguments[0];
	arguments[0]=f.tbl[0].bind(this,doneCallback,cacheKey);
	this.loadDataFile.apply(this,arguments);
	arguments[0]=arg0;
	return cacheKey;
},[
function(doneCallback,cacheKey,xhr,src,msg,e){
	if(xhr.status===0||xhr.status>=400) this.loadDataFile_setPreloadData(cacheKey,undefined);
	else this.loadDataFile_setPreloadData(cacheKey,JSON.parse(xhr.responseText));
	doneCallback.apply(this,arguments);
}, // 0: onloadFunc
"doneCallback should be a function", // 1: err msg
]).
addBase('loadDataFile_setLoadFromPreloadAbility',function f(setToEnabled){
	this._loadFromPreload=setToEnabled;
}).
addBase('loadDataFile_setLoadFromPreloadEnabledOnce',function f(){
	this.loadDataFile_setLoadFromPreloadAbility(true);
	this._loadFromPreloadOnce=true;
}).
addBase('loadDataFile',function f(name,src,msg,directSrc,mimeType,method,data){
	// name = string or custom callback func
	method=method||'GET';
	mimeType=mimeType||'application/json';
	const nameIsFunc=(typeof name==='function');
	if(!nameIsFunc&&this._loadFromPreload){
		if(this._loadFromPreloadOnce) this._loadFromPreload=this._loadFromPreloadOnce=false;
		const cacheKey=this.loadDataFile_makePreloadKey.apply(this,arguments);
		const data=this.loadDataFile_getPreloadData(cacheKey);
		if(data!==undefined){
			window[name]=JSON.parse(JSON.stringify(data));
			DataManager.onLoad(window[name],name,src,msg);
			return;
		}
	}
	const xhr=new XMLHttpRequest();
	src = directSrc?src:('data/'+src);
	xhr.open(method,src);
	xhr.overrideMimeType(mimeType);
	if(nameIsFunc){
		// should be bound already
		xhr.onload=name.bind(undefined,xhr,src,msg);
		xhr.onerror=name.bind(undefined,xhr,src,msg);
	}else{
		xhr.onload=f.tbl[0].bind(xhr,name,src,msg);
		xhr.onerror=this._mapLoader || f.tbl[1].bind(xhr,src);
		window[name]=null;
	}
	xhr.send(data);
	return xhr;
},[
function(name,src,msg,e) {
	if (this.status < 400) {
		window[name] = JSON.parse(this.responseText);
		DataManager.onLoad(window[name],name,src,msg);
	}
}, // 0: onload
function(src,e) {
	DataManager._errorUrl = DataManager._errorUrl || src;
}, // 1: onerror
]).add('onLoad',function f(obj,name,src,msg){
	this.onLoad_before.apply(this,arguments);
	const rtv=f.ori.apply(this,arguments);
	this.onLoad_after.apply(this,arguments);
	return rtv;
},undefined,true).addBase('onLoad_before',function f(obj,name,src,msg){
	const func=f.tbl.get(name);
	return func && func.apply(this,arguments);
}).addBase('onLoad_after',function f(obj,name,src,msg){
	const func=f.tbl.get(name);
	return func && func.apply(this,arguments);
}).
addBase('_onLoad_before_map',function f(obj,name,src,msg){
	const evtds=obj&&obj.events; if(evtds) evtds._template=evtds[0]=JSON.parse(JSON.stringify(f.tbl[0])); // 'evtds[0]' is restored to 'null' after onLoad
	return this.onLoad_before_map.apply(this,arguments);
},[
{"id":0,"name":"","note":"","pages":[{"conditions":{"actorId":0,"actorValid":false,"itemId":0,"itemValid":false,"selfSwitchCh":"","selfSwitchValid":false,"switch1Id":0,"switch1Valid":false,"switch2Id":0,"switch2Valid":false,"variableId":0,"variableValid":false,"variableValue":0},"directionFix":false,"image":{"characterIndex":0,"characterName":"","direction":2,"pattern":0,"tileId":0},"list":[{"code":0,"indent":0,"parameters":[]}],"moveFrequency":0,"moveRoute":{"list":[{"code":0,"parameters":[]}],"repeat":true,"skippable":true,"wait":false},"moveSpeed":0,"moveType":0,"priorityType":0,"stepAnime":false,"through":true,"trigger":null,"walkAnime":false}],"x":-8,"y":-8}, // 0: evtd template
]).addBase('_onLoad_after_map',function f(obj,name,src,msg){
	const rtv=this.onLoad_after_map.apply(this,arguments);
	const evtds=obj&&obj.events; if(evtds) evtds[0]=null; // restored to 'null'
	return rtv;
}).addBase('onLoad_before_map',function f(obj,name,src,msg){
	// dummy
}).addBase('onLoad_after_map',function f(obj,name,src,msg){
	// dummy
}).
addBase('_onLoad_before_skill',function f(obj,name,src,msg){
	return this.onLoad_before_skill.apply(this,arguments);
}).addBase('_onLoad_after_skill',function f(obj,name,src,msg){
	return this.onLoad_after_skill.apply(this,arguments);
}).addBase('onLoad_before_skill',function f(obj,name,src,msg){
	// dummy
}).addBase('onLoad_after_skill',function f(obj,name,src,msg){
	// dummy
}).
addBase('_onLoad_before_enemy',function f(obj,name,src,msg){
	return this.onLoad_before_enemy.apply(this,arguments);
}).addBase('_onLoad_after_enemy',function f(obj,name,src,msg){
	return this.onLoad_after_enemy.apply(this,arguments);
}).addBase('onLoad_before_enemy',function f(obj,name,src,msg){
	// dummy
}).addBase('onLoad_after_enemy',function f(obj,name,src,msg){
	// dummy
}).
addBase('_onLoad_before_troop',function f(obj,name,src,msg){
	return this.onLoad_before_troop.apply(this,arguments);
}).addBase('_onLoad_after_troop',function f(obj,name,src,msg){
	return this.onLoad_after_troop.apply(this,arguments);
}).addBase('onLoad_before_troop',function f(obj,name,src,msg){
	// dummy
}).addBase('onLoad_after_troop',function f(obj,name,src,msg){
	// dummy
}).
addBase('_onLoad_before_animation',function f(obj,name,src,msg){
	return this.onLoad_before_animation.apply(this,arguments);
}).addBase('_onLoad_after_animation',function f(obj,name,src,msg){
	return this.onLoad_after_animation.apply(this,arguments);
}).addBase('onLoad_before_animation',function f(obj,name,src,msg){
	// dummy
}).addBase('onLoad_after_animation',function f(obj,name,src,msg){
	// dummy
}).
addBase('_onLoad_before_tileset',function f(obj,name,src,msg){
	return this.onLoad_before_tileset.apply(this,arguments);
}).addBase('_onLoad_after_tileset',function f(obj,name,src,msg){
	return this.onLoad_after_tileset.apply(this,arguments);
}).addBase('onLoad_before_tileset',function f(obj,name,src,msg){
	// dummy
}).addBase('onLoad_after_tileset',function f(obj,name,src,msg){
	// dummy
}).
addBase('_onLoad_before_commonEvent',function f(obj,name,src,msg){
	return this.onLoad_before_commonEvent.apply(this,arguments);
}).addBase('_onLoad_after_commonEvent',function f(obj,name,src,msg){
	return this.onLoad_after_commonEvent.apply(this,arguments);
}).addBase('onLoad_before_commonEvent',function f(obj,name,src,msg){
	// dummy
}).addBase('onLoad_after_commonEvent',function f(obj,name,src,msg){
	// dummy
}).
addBase('_onLoad_before_system',function f(obj,name,src,msg){
	return this.onLoad_before_system.apply(this,arguments);
}).addBase('_onLoad_after_system',function f(obj,name,src,msg){
	return this.onLoad_after_system.apply(this,arguments);
}).addBase('onLoad_before_system',function f(obj,name,src,msg){
	// dummy
}).addBase('onLoad_after_system',function f(obj,name,src,msg){
	// dummy
}).
getP;
{ const p=DataManager;
p.onLoad_before.tbl=new Map([
	['$dataMap',	p._onLoad_before_map],
	['$dataSkills',	p._onLoad_before_skill],
	['$dataEnemies',	p._onLoad_before_enemy],
	['$dataTroops',	p._onLoad_before_troop],
	['$dataAnimations',	p._onLoad_before_animation],
	['$dataTilesets',	p._onLoad_before_tileset],
	['$dataCommonEvents',	p._onLoad_before_commonEvent],
	['$dataSystem',	p._onLoad_before_system],
]);
p.onLoad_after.tbl=new Map([
	['$dataMap',	p._onLoad_after_map],
	['$dataSkills',	p._onLoad_after_skill],
	['$dataEnemies',	p._onLoad_after_enemy],
	['$dataTroops',	p._onLoad_after_troop],
	['$dataAnimations',	p._onLoad_after_animation],
	['$dataTilesets',	p._onLoad_after_tileset],
	['$dataCommonEvents',	p._onLoad_after_commonEvent],
	['$dataSystem',	p._onLoad_after_system],
]);
}
//
new cfc(WebAudio.prototype).addBase('_load',function f(url,noerr,putCacheOnly){
	if(!WebAudio._context) return;
	const xhr=new XMLHttpRequest();
	xhr._needDecrypt=false;
	if(Decrypter.hasEncryptedAudio && !ResourceHandler.isDirectPath(url)){
		url=Decrypter.extToEncryptExt(url);
		xhr._needDecrypt=true;
	}
	const cache=this._getCache(url); if(cache) return !(this._putCacheOnly||putCacheOnly)&&this._onXhrLoad(undefined,url,cache);
	xhr.open('GET',url);
	xhr.responseType='arraybuffer';
	xhr.onload=f.tbl[0].bind(this,xhr,url,this._putCacheOnly||putCacheOnly);
	xhr.onerror=(this._noerr||noerr)?none:(this._loader||function(){this._hasError=true;}.bind(this));
	xhr.send();
},[
function(xhr,url,putCacheOnly){ if(xhr.status<400) this._onXhrLoad(xhr,url,undefined,putCacheOnly); },
]).addBase('_onXhrLoad',function f(xhr,url,cache,putCacheOnly){
	const src=cache&&cache[0]||xhr&&xhr.response;
	let array=src;
	const isBlobUrl=ResourceHandler.isBlobUrl(url);
	if(!cache){
		if(xhr._needDecrypt && Decrypter.hasEncryptedAudio && !ResourceHandler.isDirectPath(url)) array=Decrypter.decryptArrayBuffer(src);
		cache=[array.slice(), /* decoded buffer which can be re-used */ ];
		if(!isBlobUrl) this._setCache(url,cache);
	}
	if(putCacheOnly) return;
	if(cache[1]) return f.tbl[0].call(this,undefined,cache[1]),array;
	if(array===src) array=array.slice();
	this._readLoopComments(new Uint8Array(array));
	const func=f.tbl[0].bind(this,cache);
	WebAudio._context.decodeAudioData(
		array,
		func,
		err=>WebAudio._context.decodeAudioData(cache[0]=Decrypter.decryptArrayBuffer(src,f.tbl[1]),func),
	);
	return array;
},[
function(cacheObj,buffer){
	if(cacheObj) cacheObj[1]=buffer;
	this._buffer=buffer;
	this._totalTime=buffer.duration;
	if(this._loopLength>0&&this._sampleRate>0){
		this._loopStart/=this._sampleRate;
		this._loopLength/=this._sampleRate;
	}else{
		this._loopStart=0;
		this._loopLength=this._totalTime;
	}
	this._onLoad();
}, // 0: decode success // bind 'this' to WebAudio instance
arrayBuffer=>{
	if(!arrayBuffer) return;
	const byteData=new Uint8Array(arrayBuffer);
	const pageSize=FILE_FORMATS.ogg.getPageByteSize(arrayBuffer,0,true);
	const guessOffsetBeg=14;
	const guessOffsetEnd=16;
	if(!(pageSize>=guessOffsetEnd)||!(pageSize>=OGG_PAGECHKSUM_PAGEOFFSET+OGG_PAGECHKSUM_BYTESIZE)) return OGG_16B_HEADER;
	const deducedHeader=new Uint8Array(pageSize);
	deducedHeader.set(OGG_16B_HEADER,0);
	deducedHeader.set(new Uint8Array(arrayBuffer,OGG_16B_HEADER.byteLength,pageSize-OGG_16B_HEADER.byteLength),OGG_16B_HEADER.byteLength);
	const currChksum=window.bitRev32(window.bytesToInt(byteData,OGG_PAGECHKSUM_BYTESIZE,OGG_PAGECHKSUM_PAGEOFFSET));
	for(let x=OGG_PAGECHKSUM_BYTESIZE;x--;) deducedHeader[OGG_PAGECHKSUM_PAGEOFFSET+x]=0;
	const Mt=window.pow32gf2(0x00800000,pageSize-guessOffsetEnd,CRC32_POLY_OGG_rev);
	const M0=window.mul32gf2(0x00008000,Mt,CRC32_POLY_OGG_rev);
	for(let x=guessOffsetBeg;x<guessOffsetEnd;++x) deducedHeader[x]=0;
	const baseChksum=
		window.mul32gf2(window.crc32(new Uint8Array(deducedHeader.buffer,0,guessOffsetBeg),CRC32_POLY_OGG_rev,0,0,true),M0,CRC32_POLY_OGG_rev)^
		window.crc32(new Uint8Array(deducedHeader.buffer,guessOffsetEnd,pageSize-guessOffsetEnd),CRC32_POLY_OGG_rev,0,0,true)^
		0;
	//console.log(deducedHeader,printHex32(window.crc32(deducedHeader,CRC32_POLY_OGG_rev,0,0,true)));
	for(let t=65536;t--;){
		const Ct=window.crc32([t&0xFF,t>>>8,],CRC32_POLY_OGG_rev,0,0,true);
		const res=baseChksum^mul32gf2(Ct,Mt,CRC32_POLY_OGG_rev);
		if(res===currChksum){
			deducedHeader[14]=t&0xFF;
			deducedHeader[15]=t>>>8;
			let r=window.bitRev32(res);
			for(let r=window.bitRev32(res),x=0;x<OGG_PAGECHKSUM_BYTESIZE;++x,r>>>=8) deducedHeader[OGG_PAGECHKSUM_PAGEOFFSET+x]=r&0xFF;
			break;
		}
	}
	return deducedHeader;
}, // 1: decode fail, gen header16B in 'Decrypter.decryptArrayBuffer'
]).add('initialize',function f(url,noerr,putCacheOnly){
	this._noerr=noerr;
	this._putCacheOnly=putCacheOnly;
	return f.ori.apply(this,arguments);
}).addBase('_setCache',function f(url,cacheObj){
	// cacheObj = [arrayBuffer,decodedBuffer]
	this.getCacheCont().setCache(url,cacheObj,cacheObj[0].byteLength);
}).addBase('_getCache',function f(url){
	return this.getCacheCont().getCache(url);
}).addBase('getCacheCont',function f(){
	//const tw=getTopFrameWindow();
	//if(!WebAudio._cache) WebAudio._cache=tw._webAudioCache=tw._webAudioCache||new LruCache(f.tbl[0],f.tbl[1]);
	// do not cache on top for flexibility of file content changes
	if(!WebAudio._cache) WebAudio._cache=new LruCache(f.tbl[0],f.tbl[1]);
	return WebAudio._cache;
},[404,1<<26]);
//
new cfc(Bitmap.prototype).add('_onError',function f(){
	const rtv=f.ori.apply(this,arguments);
	if(ResourceHandler.isDirectPath(this._url)&&!this._tryDecrypt){
		// this._tryDecrypt=true; // set in Decrypter.decryptImg
		this._loadingState = 'decrypting';
		Decrypter.decryptImg(this._url, this);
		return true; // has special handling
	}
	return rtv;
});
Decrypter._notFoundCache=new Set();
new cfc(Decrypter).add('readEncryptionkey',function f(){
	if(!$dataSystem.encryptionKey) $dataSystem.encryptionKey=f.tbl[0];
	return f.ori.apply(this,arguments);
},[
'0'.repeat(32), // 0: empty encryptionKey
]).addBase('decryptImg',function f(url,bitmap){
	bitmap._tryDecrypt=true;
	url=this.extToEncryptExt(url);
	const cache=this._getCache(url); if(cache) return this._onXhrLoad(bitmap,cache.slice());
	
	const requestFile=new XMLHttpRequest();
	requestFile.open("GET",url);
	requestFile.responseType='arraybuffer';
	requestFile.send();
	
	requestFile.onload=f.tbl[0].bind(requestFile,bitmap,url);
	
	requestFile.onerror=f.tbl[1].bind(requestFile,bitmap);
},[
function(bitmap,url){
	if(this.status<Decrypter._xhrOk){
		const arrayBuffer=Decrypter.decryptArrayBuffer(this.response,PNG_16B_HEADER);
		Decrypter._setCache(url,arrayBuffer.slice());
		Decrypter._onXhrLoad(bitmap,arrayBuffer);
	}else this.onerror();
},
function(bitmap){
	if(bitmap._loader) bitmap._loader();
	else bitmap._onError();
},
]).addBase('_onXhrLoad',function f(bitmap,arrayBuffer){
	bitmap._image.addEventListener('load',bitmap._loadListener=Bitmap.prototype._onLoad.bind(bitmap));
	bitmap._image.addEventListener('error',bitmap._errorListener=bitmap._loader||Bitmap.prototype._onError.bind(bitmap));
	bitmap._image.src=Decrypter.createBlobUrl(arrayBuffer);
}).add('decryptImg',function f(url,bitmap){
	if(Decrypter._notFoundCache.has(url) || getUrlParamVal('disableCustom')) return f.ori.apply(this,arguments);
	jurl(url,"HEAD",0,0,'arraybuffer',f.tbl[0].bind(this,url,bitmap),f.tbl[1].bind(this,url,bitmap,f.ori,arguments));
},[
function(url,bitmap,resp,xhr){ if(xhr.readyState!==4) return;
	const stat=xhr.status.toString();
	if(stat.length!==3 || stat.slice(0,1)!=='2') return;
	bitmap._image.addEventListener('load', bitmap._loadListener=Bitmap.prototype._onLoad.bind(bitmap));
	bitmap._image.addEventListener('error', bitmap._errorListener=bitmap._loader || Bitmap.prototype._onError.bind(bitmap));
	bitmap._image.src=url;
},
function(url,bitmap,ori,argv,xhr){ if(!(xhr.readyState>=4)) return;
	const stat=xhr.status.toString();
	if(stat==='0' || (stat.length===3 && stat[0]-0>=4)){
		Decrypter._notFoundCache.add(url);
		return ori.apply(this,argv);
	}
},
]).addBase('_setCache',function f(url,arrayBuffer){
	this.getCacheCont().setCache(url,arrayBuffer,arrayBuffer.byteLength);
}).addBase('_getCache',function f(url){
	return this.getCacheCont().getCache(url);
}).addBase('getCacheCont',function f(){
	const tw=getTopFrameWindow();
	if(!this._cache) this._cache=tw._decryptImgCache=tw._decryptImgCache||new LruCache(f.tbl[0],f.tbl[1]);
	return this._cache;
},[404,1<<28]);
new cfc(WebAudio.prototype).add('_load',function f(url){
	if(!Decrypter.hasEncryptedAudio || ResourceHandler.isDirectPath(url) || Decrypter._notFoundCache.has(url) || getUrlParamVal('disableCustom')) return f.ori.apply(this,arguments);
	jurl(url,"HEAD",0,0,'arraybuffer',f.tbl[0].bind(this,url,f.ori,arguments),f.tbl[1].bind(this,url,f.ori,arguments));
},[
function(url,ori,argv,resp,xhr){ if(xhr.readyState!==4) return;
	const stat=xhr.status.toString();
	if(stat.length!==3 || stat.slice(0,1)!=='2') return;
	const e=Decrypter.hasEncryptedAudio;
	Decrypter.hasEncryptedAudio=false;
	const rtv=ori.apply(this,argv);
	Decrypter.hasEncryptedAudio=e;
	return rtv;
},
function(url,ori,argv,xhr){ if(!(xhr.readyState>=4)) return;
	const stat=xhr.status.toString();
	if(stat==='0' || (stat.length===3 && stat[0]-0>=4)){
		Decrypter._notFoundCache.add(url);
		return ori.apply(this,argv);
	}
},
]);
//
new cfc(Game_Party.prototype).addBase('partyAbility_sumAll',function f(dataId){
	return this.members().reduce(f.tbl[0].bind(dataId),0);
},[
function(r,btlr){
	return r+btlr.traitsSum(Game_BattlerBase.TRAIT_PARTY_ABILITY,this);
},
]);
// expose to topFrame
const exposeToTopFrame=window.exposeToTopFrame=function f(){
	const w=getTopFrameWindow(); if(w===window) return;
	w._w=window;
	// dynamicData
	{
		w.exposeToTopFrame=f;
		const arr=f.tbl=f.tbl||getPrefixPropertyNames(window,'$data'); arr.uniquePop('$dataMap');
		arr.uniquePush('$dataMap','$gameTemp','$gameSystem','$gameScreen','$gameTimer','$gameMessage','$gameSwitches','$gameVariables','$gameSelfSwitches','$gameActors','$gameParty','$gameTroop','$gameMap','$gamePlayer',);
		arr.forEach(key=>{ if(!key) return;
			try{
				Object.defineProperty(w,key,{ get:function(){ return window[key]; }, configurable: true });
			}catch(e){
			}
		});
	}
	{
		const arr=[];
		arr.push('AudioManager','BattleManager','ConfigManager','DataManager','ImageManager','SceneManager','SoundManager','PluginManager',);
		arr.push('Input','TouchInput',);
		arr.push('Graphics','PIXI','Sprite','Bitmap','WebAudio',);
		arr.push('Game_BattlerBase','Game_Battler','Game_Enemy','Game_Actor','Game_Action',);
		arr.push('Game_CharacterBase','Game_Character','Game_Event','Game_Player',);
		arr.push('Game_Interpreter','Game_Picture','Game_System','Game_Screen','Game_Map','Game_Party',);
		arr.push('Window_Base','Window_Message',);
		arr.push('Scene_Base','Scene_Map','Scene_Menu','Scene_Item','Scene_Skill','Scene_Options',);
		arr.push('useDefaultIfIsNaN',);
		arr.push('getCStyleStringStartAndEndFromString',);
		arr.push('getPrefixPropertyNames',);
		arr.push('getTopFrameWindow','chTitle',);
		arr.push('copyToClipboard','pasteCanvas',);
		arr.push('listMapParents',);
		for(let x=0,xs=arr.length;x!==xs;++x) w[arr[x]]=w._w[arr[x]];
	}
	for(let x=0,arr=arguments,xs=arr.length;x!==xs;++x) w[arr[x]]=w._w[arr[x]];
};
// Window_Text
{ const a=class Window_Text extends Window_Base{
	_refreshBack(){ if(this._windowBackSprite) Window_Base.prototype._refreshBack.apply(this,arguments); }
	_refreshFrame(){ if(this._windowFrameSprite) Window_Base.prototype._refreshFrame.apply(this,arguments); }
	standardPadding(){ return 0; }
};
window[a.name]=a;
const p=a.prototype;
makeDummyWindowProto(p);
Object.defineProperty(Window.prototype, 'backOpacity', {
	set:function(value){
		const sp=this._windowBackSprite;
		if(sp) sp.alpha=value.clamp(0,255)/255;
		return value;
	},get:function(){
		const sp=this._windowBackSprite;
		return sp?sp.alpha*255:0;
	}, configurable: true
});
new cfc(p).add('_createAllParts',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.windowStyle_adjust();
	return rtv;
}).addBase('windowStyle_adjust',function f(){
	return this.windowStyle_setTextOnly();
}).addBase('windowStyle_setTextOnly',function f(){
	let t,k;
	for(let x=0,arr=f.tbl[0],xs=arr.length;x!==xs;++x){
		// not setting following properties to `undefined` for capability
		t=this[arr[x]];
		t.parent && t.parent.removeChild(t);
	}
},[
[
'_windowFrameSprite',
'_windowBackSprite',
], // 0: keys
]).addBase('setText',function f(styledText,isFixedWindowSize,isAppending,isForcedRedraw){
	// text having something like `\{` , `\}` , ...
	
	// skip if same
	if(!isForcedRedraw && !isAppending && this._lastText===styledText) return;
	
	// modes
	if(isAppending){
		this._lastText+=styledText;
		styledText=this._lastText;
	}else this._lastText=styledText;
	
	// take use of y
	if(styledText) styledText+='\n';
	
	const wt=this;
	// const stdpad=wt.standardPadding(); // is 0
	const txtpad=wt.textPadding(),textState={};
	const measure=wt.measure_drawTextEx(styledText,0,0,undefined,undefined,textState);
	
	const width=Math.max(0,1+~~textState.right);
	const widthp=width+(txtpad<<1);
	if(!isFixedWindowSize){
		wt.width=widthp;
		wt.height=textState.y;
	}
	const w=wt.width;
	const h=wt.height;
	wt.position.set(-(w>>>1),-h);
	wt.createContents();
	wt.drawTextEx(styledText,txtpad,0);
	//console.log(measure,textState); // debug
	return this;
}).addBase('reApplyText',function f(isFixedWindowSize){
	return this.setText(this._lastText,isFixedWindowSize,false,true);
});
}

// ---- ---- ---- ---- refine for future extensions

(()=>{ let k,r,t;


new cfc(DataManager).
addBase('duplicatedDataobj_getSrc',filterArg0).
getP;

new cfc(Game_System.prototype).
addBase('duplicatedDataobj_getSrcClonedToDstsList',function f(srcDataobj){
}).
getP;

new cfc(Game_Party.prototype).
addBase('duplicatedDataobj_numItems',function f(item){
	const arr=$gameSystem&&$gameSystem.duplicatedDataobj_getSrcClonedToDstsList(item);
	if(!arr) return 0;
	let rtv=0;
	for(let x=0,xs=arr.length;x<xs;++x) rtv+=this.numItems(arr[x]);
	return rtv;
}).
add('numItems',function f(item){
	return this.duplicatedDataobj_numItems.apply(this,arguments)+f.ori.apply(this,arguments);
}).
getP;


new cfc(Window_Selectable.prototype).
addBase('makeItemList',function f(){
	if(this.makeItemList_condOk()){
		this.makeItemList_doBefore.apply(this,arguments);
		this.makeItemList_do.apply(this,arguments);
		this.makeItemList_doAfter.apply(this,arguments);
	}
}).
addBase('makeItemList_condOk',function f(){
	return true;
}).
addBase('makeItemList_doBefore',none).
addBase('makeItemList_do',none).
addBase('makeItemList_doAfter',function f(){
	this.onNewSelect(this._indexOld=undefined);
}).
getP;

for(let cv=[Window_ShopBuy,Window_SkillList,Window_ItemList],x=cv.length;x--;){
const p=cv[x].prototype;
new cfc(p).
addBase('makeItemList_do',p.makeItemList).
add('makeItemList_do',function f(){
	Window_Selectable.prototype[f._funcName].apply(this,arguments);
	return f.ori.apply(this,arguments);
}).
getP;
delete p.makeItemList;
}


new cfc(Window_SkillList.prototype).
addBase('setActor_condOk',function(actor){
	return this._actor!==actor;
}).
addBase('setActor_doBefore',none).
addBase('setActor_do',function(actor){
	this._actor=actor;
	this.refresh();
	this.resetScroll();
}).
addBase('setActor_doAfter',none).
addBase('setActor',function(actor){
	if(this.setActor_condOk.apply(this,arguments)){
		this.setActor_doBefore.apply(this,arguments);
		this.setActor_do.apply(this,arguments);
		this.setActor_doAfter.apply(this,arguments);
	}
}).
addBase('setStypeId_condOk',function(stypeId){
	return this._stypeId!==stypeId;
}).
addBase('setStypeId_doBefore',none).
addBase('setStypeId_do',function(stypeId){
	this._stypeId=stypeId;
	this.refresh();
	this.resetScroll();
}).
addBase('setStypeId_doAfter',none).
addBase('setStypeId',function(stypeId){
	if(this.setStypeId_condOk.apply(this,arguments)){
		this.setStypeId_doBefore.apply(this,arguments);
		this.setStypeId_do.apply(this,arguments);
		this.setStypeId_doAfter.apply(this,arguments);
	}
}).
getP;


new cfc(Scene_Equip.prototype).
addBase('setUiState',function f(val){
	return this._uiState=val;
}).
addBase('getUiState',function f(){
	return this._uiState;
}).
addBase('changeUiState_focusOnSlotWnd',function f(){
	this.setUiState(f.tbl[0]);
	if(!(this._slotWindow.index()>=0)) this._slotWindow.select(0);
	this._commandWindow.deactivate();
	this._itemWindow.deselect();
	this._itemWindow.deactivate();
	this._slotWindow.activate();
},[
'focusOnSlotWnd',
]).
addBase('commandEquip',function f(){
	this.changeUiState_focusOnSlotWnd();
}).
addBase('changeUiState_focusOnCmdWnd',function f(){
	this.setUiState(f.tbl[0]);
	this._slotWindow.activate(); // for updating help window => updating status window
	this._slotWindow.deselect();
	this._slotWindow.deactivate();
	this._itemWindow.deactivate(); // prevent updating help window again => prevent updating status window
	this._itemWindow.deselect();
	this._commandWindow.activate();
},[
'focusOnCmdWnd',
]).
addBase('onSlotCancel',function f(){
	this.changeUiState_focusOnCmdWnd();
}).
addBase('changeUiState_focusOnItemWnd',function f(){
	this.setUiState(f.tbl[0]);
	const sw=this._slotWindow;
	{
		sw.deactivate();
	}
	const cw=this._commandWindow;
	{
		cw.deactivate();
	}
	const iw=this._itemWindow;
	{
		iw.activate();
		const M=iw.maxItems();
		let currIdx=iw.index();
		if(!(currIdx>=0)) iw.select(currIdx=0);
		else if(!(currIdx<M)) iw.select(currIdx=M-1);
		iw.activate();
	}
},[
'focusOnItemWnd',
]).
addBase('onSlotOk',function f(){
	this.changeUiState_focusOnItemWnd();
}).
addBase('onItemCancel',function f(){
	this.changeUiState_focusOnSlotWnd();
}).
addBase('getSelectedSlotId',function f(){
	return this._slotWindow.index();
}).
addBase('onItemOk',function f(){
	const slotId=this.getSelectedSlotId();
	const actor=this.actor();
	if(!actor.isEquipChangeOk(slotId)){
		SoundManager.playBuzzer();
		return;
	}
	SoundManager.playEquip();
	actor.changeEquip(slotId, this._itemWindow.item());
	this.changeUiState_focusOnSlotWnd();
	this._slotWindow.refresh();
	this._itemWindow.refresh();
	this._statusWindow.refresh();
}).
add('start',function f(){
	this.changeUiState_focusOnCmdWnd();
	return f.ori.apply(this,arguments);
}).
add('update_focusWndFromTouch_condOk',function f(){
	return TouchInput.isTriggered();
}).
add('update_focusWndFromTouch_do',function f(){
	const cw=this._commandWindow;
	{ const wnd=cw; if(wnd.isOpen()&&wnd.containsPoint_global(TouchInput)){
		this.changeUiState_focusOnCmdWnd();
		return;
	} }
	const sw=this._slotWindow;
	{ const wnd=sw; if(wnd.isOpen()&&wnd.containsPoint_global(TouchInput)){
		this.changeUiState_focusOnSlotWnd();
		return;
	} }
	const iw=this._itemWindow;
	{ const wnd=iw; if(sw.index()>=0&&wnd.isOpen()&&wnd.containsPoint_global(TouchInput)){
		this.changeUiState_focusOnItemWnd();
		return;
	} }
}).
add('update_focusWndFromTouch',function f(){
	if(this.update_focusWndFromTouch_condOk()) this.update_focusWndFromTouch_do();
}).
add('update',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.update_focusWndFromTouch();
	return rtv;
}).
getP;

new cfc(Window_EquipCommand.prototype).
addBase('makeCommandList_optimizingEnabled',function f(){
	return false;
}).
addBase('makeCommandList',function f(){
	this.addCommand(TextManager.equip2,   'equip');
	if(this.makeCommandList_optimizingEnabled()) this.addCommand(TextManager.optimize, 'optimize');
	this.addCommand(TextManager.clear,    'clear');
}).
getP;

new cfc(Window_EquipSlot.prototype).
addBase('processOk',function f(){
	// always ok. block equipment change when okItemOk.
	this.playOkSound();
	this.updateInputData();
	this.deactivate();
	this.callOkHandler();
}).
getP;

new cfc(Window_EquipItem.prototype).
addBase('makeItemList',function f(){
	return f._super[f._funcName].apply(this,arguments);
}).
addBase('drawItemNumber_num',function f(item,x,y,width,num){
	return f._super[f._funcName].apply(this,arguments);
}).
addBase('onNewSelect',function f(){
	return f._super[f._funcName].apply(this,arguments);
}).
getP;


new cfc(Game_Party.prototype).
add('initAllItems',function f(){
	const rtv=f.ori.apply(this,arguments);
	this._items._keys=[];
	this._weapons._keys=[];
	this._armors._keys=[];
	return rtv;
}).
addBase('_canBeAddedToList',function f(cont,key,dataobjarr){
	//return dataobjarr[key]&&0<cont[dataobjarr[key].id];
	return 0<cont[key]; // for switching between databases
}).
addBase('_genItemsList',function f(cont,dataobjarr){
	if(!cont._keys){
		// old save file capability
		const keys=[];
		for(let k in cont){
			const item=dataobjarr[k];
			if(item) keys.push(item.id);
			else keys.push(k); // for switching between databases
		}
		keys._isSorted=true;
		cont._keys=keys;
	}
	const rtv=[],updatedKeys=cont._keys,oldKeys=cont._keys.slice(),s=new Set();
	if(!updatedKeys._isSorted) oldKeys.sort(cmpFunc_num);
	updatedKeys._isSorted=true;
	updatedKeys.uniqueClear();
	for(let x=0,keys=oldKeys,xs=keys.length;x!==xs;++x){
		if(!this._canBeAddedToList(cont,keys[x],dataobjarr)) continue;
		const key=keys[x];
		const item=dataobjarr[key];
		if(item){
			if(!s.has(item.id)){
				s.add(item.id);
				updatedKeys.uniquePush(item.id);
				rtv.push(item);
			}
		}else updatedKeys.uniquePush(key); // for switching between databases
	}
	return rtv;
}).
addBase('items',function f(){
	return this._genItemsList(this._items,$dataItems);
}).
addBase('weapons',function f(){
	return this._genItemsList(this._weapons,$dataWeapons);
}).
addBase('armors',function f(){
	return this._genItemsList(this._armors,$dataArmors);
}).
addBase('minItems',function f(container,item){
	return 0;
}).
addBase('gainItem_onNotGreaterThanZero',function f(container,item){
	if(container._keys) container._keys.uniquePop(item.id); // old save file capability
	delete container[item.id];
}).
addBase('gainItem',function(item,amount,includeEquip){
	amount-=0;
	const container=this.itemContainer(item);
	if(container&&amount){
		if(0<amount) this.setLastGainedItem(item,amount);
		const lastNumber=this.numItems(item);
		const newNumber=lastNumber+amount;
		const minNum=this.minItems(container,item);
		container[item.id]=newNumber.clamp(minNum,this.maxItems(item));
		if(container._keys){
			container._keys._isSorted=false;
			container._keys.uniquePush(item.id);
		}
		if(!(0<container[item.id])) this.gainItem_onNotGreaterThanZero(container,item);
		if(includeEquip && newNumber<minNum) this.discardMembersEquip(item, minNum-newNumber);
		$gameMap.requestRefresh();
	}
	return container;
}).
addBase('setLastGainedItem',function(item,amount){
	$gameTemp._partyLastGainedItem=new Game_Item(item);
	$gameTemp._partyLastGainedItem._amount=amount;
}).
addBase('allItems',function f(){
	return [].concat_inplace(this.items(),this.weapons(),this.armors());
}).
addBase('isAnyMemberEquipped',function f(item){
	const arr=this.members();
	for(let x=arr.length;x--;) if(arr[x].isEquipped(item)) return true;
	return false;
}).
getP;


new cfc(Input).addBase('_getKeyName',function f(event){
	return this._remapKeyName(event.keyCode);
}).addBase('_remapKeyName',function f(keyCode){
	return this.keyMapper[keyCode]||keyCode;
}).
addBase('addKeyName',function f(keyCode,keyName){
	this.keyMapper[keyCode]=keyName;
	return this;
}).addBase('_onKeyUp',function f(event){
	return this._onKeyUp_do.apply(this,arguments);
}).addBase('_onKeyUp_do',function f(event){
	const btnName=this._getKeyName(event);
	this._currentState[btnName]=false;
	if(event.keyCode===0) this.clear(); // it is said that: For QtWebEngine on OS X
}).addBase('_onKeyDown',function f(event){
	return this._onKeyDown_do.apply(this,arguments);
}).addBase('_onKeyDown_do',function f(event){
	if (this._shouldPreventDefault(event.keyCode)) event.preventDefault();
/*
	if(event.keyCode===144){ // Numlock
		this.clear();
		return;
	}
*/
	const btnName=this._getKeyName(event);
	if(this._onKeyDown_okForRetryResource(btnName)) return;
	this._currentState[btnName]=true;
}).addBase('_onKeyDown_okForRetryResource',function f(buttonName){
	const rtv=Graphics._errorShowed&&buttonName==='ok';
	if(rtv){ const s=Graphics._retryResourceBtns; if(s){
		const it0=s.keys().next(); if(!it0.done){ const btn=it0.value; btn.click(); s.delete(btn); }
	} }
	return rtv;
}).addBase('update',function f(){
	this._pollGamepads();
	this._updateLastPressedInfos();
	this._updateDirection();
}).addBase('_updateLastPressedInfos',function f(){
	if(this._currentState[this._latestButton]) this._pressedTime++;
	else this._latestButton=null;
	for(var name in this._currentState){
		if(this._currentState[name] && !this._previousState[name]){
			this._latestButton=name;
			this._pressedTime=0;
			this._date=Date.now();
		}
		this._previousState[name]=this._currentState[name];
	}
}).add('isPressed',function f(keyName){
	arguments[0]=this._remapKeyName(keyName);
	return f.ori.apply(this,arguments);
}).addBase('isTriggered',function f(keyName){
	keyName=this._remapKeyName(keyName);
	if(this._isEscapeCompatible(keyName)) keyName=f.tbl[0];
	return this._latestButton===keyName && this._pressedTime===0;
},t=[
'escape', // 0: key-escape
]).addBase('isRepeated',function f(keyName){
	keyName=this._remapKeyName(keyName);
	if(this._isEscapeCompatible(keyName)) keyName=f.tbl[0];
	return (this._latestButton === keyName && (
		this._pressedTime === 0 || (
			this._pressedTime >= this.keyRepeatWait &&
			this._pressedTime % this.keyRepeatInterval === 0
		)
	));
},t);

new cfc(DataManager).addBase('loadGlobalInfo',function(){
	return this.loadGlobalInfo_parseData(this.loadGlobalInfo_loadRaw());
}).addBase('loadGlobalInfo_loadRaw',function f(){
	try{
		return StorageManager.load(0);
	}catch(e){
		console.error(e);
	}
	// return false-like
}).addBase('loadGlobalInfo_parseData',function f(jsonStr){
	if(jsonStr){
		const globalInfo=JSON.parse(jsonStr),sz=this.maxSavefiles();
		globalInfo[0]=globalInfo[0]||{};
		for(let i=1,shouldDel;i<=sz;++i){
			shouldDel=false;
			if(!globalInfo[i]) shouldDel=true;
			else{
				try{
					if(!StorageManager.exists(i)) shouldDel=true;
				}catch(e){
					shouldDel=true;
				}
			}
			if(shouldDel) delete globalInfo[i];
		}
		return globalInfo;
	}
	return [];
}).add('saveGameWithoutRescue',function f(savefileId){
	if(savefileId==0) throw new Error('savefile id 0 is reserved for global info');
	return f.ori.apply(this,arguments);
});

new cfc(Game_System.prototype).addBase('getLocale',function f(){
	return this._customLocale;
}).addBase('setLocale',function f(locale){
	return this._customLocale=locale;
});
new cfc(DataManager).addBase('getLocale',function f(){
	let rtv=$gameSystem&&$gameSystem.getLocale(); if(rtv) return rtv;
	try{ rtv=Intl.DateTimeFormat().resolvedOptions().locale; }catch(e){ console.warn("get locale failed"); rtv=''; }
	return rtv;
});

new cfc(Game_Interpreter.prototype).addBase('command101',function f(){
	if(!this.command101_condOk()) return false;
	this.command101_conf();
	this.command101_text();
	this.command101_peek();
	this.command101_tail();
	return false;
}).addBase('command101_condOk',function f(){
	return !$gameMessage.isBusy();
}).addBase('command101_conf',function f(){
	$gameMessage.setFaceImage(this._params[0],this._params[1]);
	$gameMessage.setBackground(this._params[2]);
	$gameMessage.setPositionType(this._params[3]);
}).addBase('command101_text',function f(){
	const rtv=[];
	while(this.command101_text_isContinueMessageString()){  // Text data
		this._index++;
		const params=this.currentCommand().parameters;
		$gameMessage.add(params[0]);
		rtv.push(params[0]);
	}
	return rtv;
}).addBase('command101_text_isContinueMessageString',function f(){
	return this.nextEventCode()===401;
}).addBase('command101_peek',function f(){
	const func=Game_Interpreter.cmd101Peek_get(this.nextEventCode());
	if(func){
		this._index++;
		return func.call(this,arguments);
	}
}).addBase('command101_tail',function f(){
	this._index++;
	this.setWaitMode('message');
});
new cfc(Game_Interpreter).addBase('cmd101Peek_getCont',function f(){
	return f.tbl[0];
},[
{}, // 0: container
]).addBase('cmd101Peek_set',function f(code,func){
	this.cmd101Peek_getCont()[code]=func;
	return this;
}).addBase('cmd101Peek_get',function f(code){
	return this.cmd101Peek_getCont()[code];
});
Game_Interpreter.cmd101Peek_set(102,function f(argv){
	this.setupChoices(this.currentCommand().parameters);
}).cmd101Peek_set(103,function f(argv){
	this.setupNumInput(this.currentCommand().parameters);
}).cmd101Peek_set(104,function f(argv){
	this.setupItemChoice(this.currentCommand().parameters);
});

new cfc(Game_Interpreter.prototype).add('setupChoices',function f(params){
	const rtv=f.ori.apply(this,arguments);
	$gameMessage.setChoiceCallback(this.setupChoices_callback.bind(this));
	return rtv;
}).addBase('setupChoices_callback',function f(n){
	this._branch[this._indent]=n;
});


new cfc(Window_Selectable.prototype).
addBase('processHandling',function f(){
	if(this.processHandling_condOk()) this.processHandling_do();
}).
addBase('processHandling_condOk',function f(){
	return this.isOpenAndActive();
}).
addBase('processHandling_do',function f(){
	// return true if doing nothing
	if (this.isOkEnabled() && this.isOkTriggered()) {
		this.processOk();
	} else if (this.isCancelEnabled() && this.isCancelTriggered()) {
		this.processCancel();
	} else if (this.isHandled('pagedown') && Input.isTriggered('pagedown')) {
		this.processPagedown();
	} else if (this.isHandled('pageup') && Input.isTriggered('pageup')) {
		this.processPageup();
	} else return true;
}).
addBase('processTouch_condOk',function f(){
	return this.isOpenAndActive();
}).
addBase('processTouch_do',function f(){
	let rtv=TouchInput.isTriggered();
	if(rtv && this.isTouchedInsideFrame()){
		this._touching=true;
		this.onTouch(true);
	}else if(TouchInput.isCancelled()){
		if(this.isCancelEnabled()){
			rtv=false;
			this.processCancel();
		}
	}
	if(this._touching){
		if(TouchInput.isPressed()) this.onTouch(false);
		else this._touching=false;
	}
	return rtv;
}).
addBase('processTouch',function f(){
	if(this.processTouch_condOk.apply(this,arguments)) return this.processTouch_do.apply(this,arguments);
	else this._touching=false;
}).
getP;


new cfc(Window.prototype).addBase('_updateCursor',function f(){
	const bp=this._updateCursor_getBlinkPeriod();
	const blinkCount=this._animationCount%bp;
	let cursorOpacity=this.contentsOpacity;
	if(this.active) cursorOpacity*=(Math.sin(blinkCount*this._updateCursor_getBlinkTickWeight()/bp*Math.PI*2)+this._updateCursor_getBlinkSineShift())/this._updateCursor_getBlinkAlphaScale();
	else cursorOpacity*=this._updateCursor_getInactiveAlphaScale();
	this._windowCursorSprite.alpha=cursorOpacity/255;
	this._windowCursorSprite.visible=this.isOpen();
}).addBase('_updateCursor_getBlinkPeriod',function f(){
	return f.tbl[0];
},[
~~32,
]).addBase('_updateCursor_getBlinkTickWeight',function f(){
	return f.tbl[0];
},[
~~1,
]).addBase('_updateCursor_getBlinkSineShift',function f(){
	return f.tbl[0];
},[
~~2,
]).addBase('_updateCursor_getBlinkAlphaScale',function f(){
	return f.tbl[0];
},[
~~3,
]).addBase('_updateCursor_getInactiveAlphaScale',function f(){
	return f.tbl[0];
},[
0.5,
]);


new cfc(Window_Selectable.prototype).
addBase('hitTest_condOk',function(x,y){
	return this.isContentsArea(x,y);
}).
addBase('hitTest_toCurrIdxIfCursorAll',function(idx){
	return this._cursorAll&&idx>=0?this.index():idx;
}).
addBase('hitTest_do',function(x,y){
	const cx=x-this.padding;
	const cy=y-this.padding;
	const topIndex=this.topIndex();
	const maxPageItems=this.maxPageItems();
	const idxEnd=this.maxItems();
	for(var i=0;i<=this.maxPageItems();i++){
		const idx=topIndex+i; if(idx>=idxEnd) break;
		if(this.itemRect(idx).contains(cx,cy)) return this.hitTest_toCurrIdxIfCursorAll(idx);
	}
	return -1;
}).
addBase('hitTest',function(x, y){
	let rtv=-1;
	if(this.hitTest_condOk.apply(this,arguments)) rtv=this.hitTest_do.apply(this,arguments);
	return rtv;
}).
getP;


new cfc(Window_SkillStatus.prototype).addBase('refresh',function f(){
	this.contents.clear();
	if(!this._actor) return -1;
	this.refresh_hasActor();
}).addBase('refresh_hasActor',function f(){
	const w = this.width - this.padding * 2;
	const h = this.height - this.padding * 2;
	const y = h / 2 - this.lineHeight() * 1.5;
	const width = w - 162 - this.textPadding();
	this.drawActorFace(this._actor, 0, 0, 144, h);
	this.drawActorSimpleStatus(this._actor, 162, y, width);
});


new cfc(Sprite.prototype).addBase('update',function f(){
	this.update_before();
	this.children.forEach(f.tbl[0]);
	this.update_after();
},[
child=>child.update&&child.update(), // 0: forEach
]).addBase('update_before',none,
).addBase('update_after',none,
);


new cfc(Window_Help.prototype).
addBase('initialize',function f(numLines){
	const x=this.initialX.apply(this,arguments);
	const y=this.initialY.apply(this,arguments);
	const width=this.initialWidth.apply(this,arguments);
	const height=this.initialHeight.apply(this,arguments);
	Window_Base.prototype.initialize.call(this, x, y, width, height);
	this._text = '';
}).
addBase('initialX',function f(){
	return 0;
}).
addBase('initialY',function f(){
	return 0;
}).
addBase('initialWidth',function f(){
	return Graphics.boxWidth;
}).
addBase('initialHeight',function f(numLines){
	return this.fittingHeight(useDefaultIfIsNaN(numLines,this.initialNumLines.apply(this,arguments)));
}).
addBase('initialNumLines',function f(){
	return 2;
}).
getP;


new cfc(Scene_Title.prototype).addBase('drawGameTitle',function f(){
    const x = this.drawGameTitle_getX();
    const y = this.drawGameTitle_getY();
    const maxWidth = this.drawGameTitle_getMaxWidth();
    const text = this.drawGameTitle_getTitle();
    this._gameTitleSprite.bitmap.outlineColor = this.drawGameTitle_getOutlineColor();
    this._gameTitleSprite.bitmap.outlineWidth = this.drawGameTitle_getOutlineWidth();
    this._gameTitleSprite.bitmap.fontSize = this.drawGameTitle_getFontSize();
    this._gameTitleSprite.bitmap.drawText(text, x, y, maxWidth, this.drawGameTitle_getLineHeight(), 'center');
}).addBase('drawGameTitle_getX',function f(){
	return isNaN()?20:f.tbl[0]-0;
},[
undefined,
]).addBase('drawGameTitle_getY',function f(){
	return isNaN(f.tbl[0])?Graphics.height/4:f.tbl[0]-0;
},[
undefined,
]).addBase('drawGameTitle_getMaxWidth',function f(){
	return isNaN(f.tbl[0])?Graphics.width - this.drawGameTitle_getX()*2:f.tbl[0]-0;
},[
undefined,
]).addBase('drawGameTitle_getTitle',function f(){
	return f.tbl[0]==null?$dataSystem.gameTitle:f.tbl[0];
},[
undefined,
]).addBase('drawGameTitle_getOutlineColor',function f(){
	return f.tbl[0];
},[
'black',
]).addBase('drawGameTitle_getOutlineWidth',function f(){
	return f.tbl[0]==null?8:f.tbl[0];
},[
undefined,
]).addBase('drawGameTitle_getFontSize',function f(){
	return isNaN(f.tbl[0])?72:f.tbl[0]-0;
},[
undefined,
]).addBase('drawGameTitle_getLineHeight',function f(){
	return isNaN(f.tbl[0])?48:f.tbl[0]-0;
},[
undefined,
]);


new cfc(ConfigManager).addBase('readFlag',function f(config,name,defaultValue){
	return config[name]===undefined?!!defaultValue:config[name];
});


new cfc(Game_Map.prototype).
addBase('setDisplayX',function f(newDisplayX){
	this._displayX=newDisplayX;
}).
addBase('setDisplayY',function f(newDisplayY){
	this._displayY=newDisplayY;
}).
addBase('setDisplayPos',function f(x,y){
	this.setDisplayPos_x(x,y);
	this.setDisplayPos_y(x,y);
}).
addBase('setDisplayPos_x',function f(x,y){
	const newDisplayX=this.setDisplayPos_getNewDisplayX(x,y);
	this._parallaxX=this.isLoopHorizontal()?x:newDisplayX;
	this.setDisplayX(newDisplayX);
}).
addBase('setDisplayPos_getNewDisplayX',function f(x,y){
	let rtv;
	if(this.isLoopHorizontal()) rtv=(x-0).mod(this.width());
	else{
		const endX=this.width()-this.screenTileX();
		rtv=endX<0?endX/2:(x-0).clamp(0,endX);
	}
	return rtv;
}).
addBase('setDisplayPos_y',function f(x,y){
	const newDisplayY=this.setDisplayPos_getNewDisplayY(x,y);
	this._parallaxY=this.isLoopVertical()?y:newDisplayY;
	this.setDisplayY(newDisplayY);
}).
addBase('setDisplayPos_getNewDisplayY',function f(x,y){
	let rtv;
	if(this.isLoopVertical()) rtv=(y-0).mod(this.height());
	else{
		const endY=this.height()-this.screenTileY();
		rtv=endY<0?endY/2:(y-0).clamp(0,endY);
	}
	return rtv;
}).
addBase('scrollLeft',function f(distance){
	const newDisplayX=this.scrollLeft_getNewDisplayX(distance);
	if(this._parallaxLoopX&&this.isLoopHorizontal()) this._parallaxX-=distance;
	else if(this.width()>=this.screenTileX()) this._parallaxX+=newDisplayX-this._displayX;
	this.setDisplayX(newDisplayX);
}).
addBase('scrollLeft_getNewDisplayX',function(distance){
	let rtv=this._displayX;
	if(this.isLoopHorizontal()){
		rtv+=$dataMap.width-distance;
		rtv%=$dataMap.width;
	}else if(this.width()>=this.screenTileX()) rtv=Math.max(rtv-distance,0);
	return rtv;
}).
addBase('scrollRight',function f(distance){
	const newDisplayX=this.scrollRight_getNewDisplayX(distance);
	if(this._parallaxLoopX&&this.isLoopHorizontal()) this._parallaxX+=distance;
	else if(this.width()>=this.screenTileX()) this._parallaxX+=newDisplayX-this._displayX;
	this.setDisplayX(newDisplayX);
}).
addBase('scrollRight_getNewDisplayX',function(distance){
	let rtv=this._displayX;
	if(this.isLoopHorizontal()){
		rtv+=distance;
		rtv%=$dataMap.width;
	}else if(this.width()>=this.screenTileX()) rtv=Math.min(rtv+distance,this.width()-this.screenTileX());
	return rtv;
}).
addBase('scrollUp',function f(distance){
	const newDisplayY=this.scrollUp_getNewDisplayY(distance);
	if(this._parallaxLoopY&&this.isLoopVertical()) this._parallaxY-=distance;
	else if(this.height()>=this.screenTileY()) this._parallaxY+=newDisplayY-this._displayY;
	this.setDisplayY(newDisplayY);
}).
addBase('scrollUp_getNewDisplayY',function(distance){
	let rtv=this._displayY;
	if(this.isLoopVertical()){
		rtv+=$dataMap.height-distance;
		rtv%=$dataMap.height;
	}else if(this.height()>=this.screenTileY()) rtv=Math.max(rtv-distance,0);
	return rtv;
}).
addBase('scrollDown',function f(distance){
	const newDisplayY=this.scrollDown_getNewDisplayY(distance);
	if(this._parallaxLoopY&&this.isLoopVertical()) this._parallaxY+=distance;
	else if(this.height()>=this.screenTileY()) this._parallaxY+=newDisplayY-this._displayY;
	this.setDisplayY(newDisplayY);
}).
addBase('scrollDown_getNewDisplayY',function(distance){
	let rtv=this._displayY;
	if(this.isLoopVertical()){
		rtv+=distance;
		rtv%=$dataMap.height;
	}else if(this.height()>=this.screenTileY()) rtv=Math.min(rtv+distance,this.height()-this.screenTileY());
	return rtv;
}).
getP;

new cfc(Game_Player.prototype).
addBase('update',function(sceneActive) {
	this.update_saveWasMoving();
	this.update_saveLastScroll();
	
	this.updateDashing();
	if(sceneActive) this.update_sceneActive();
	Game_Character.prototype.update.call(this);
	this.update_callUpdateScroll();
	this.updateVehicle();
	if(!this.isMoving()) this.update_callUpdateNonmoving();
	this.update_updateFollowers();
	
	this.update_clearLastScroll();
	this.update_clearWasMoving();
}).
addBase('update_saveLastScroll',function f(){
	this._lastScrolledX=this.scrolledX();
	this._lastScrolledY=this.scrolledY();
}).
addBase('update_saveWasMoving',function f(){
	this._wasMoving=this.isMoving();
}).
addBase('update_sceneActive',function f(){
	this.moveByInput();
}).
addBase('update_callUpdateScroll',function f(){
	this.updateScroll(this._lastScrolledX,this._lastScrolledY);
}).
addBase('update_callUpdateNonmoving',function f(){
	this.updateNonmoving(this._wasMoving);
}).
addBase('update_updateFollowers',function f(){
	this._followers.update();
}).
addBase('update_clearLastScroll',function f(){
	this._lastScrollY=this._lastScrollX=undefined;
}).
addBase('update_clearWasMoving',function f(){
	this._wasMoving=undefined;
}).
getP;


new cfc(Game_CharacterBase.prototype).
addBase('updateMove',function f(){
	// only called when 'this.isMoving()' is true
	this.updateMove_1stepWork();
	if(!this.isMoving()) this.updateMove_1stepDone();
}).
addBase('updateMove_1stepWork',function f(){
	const dpf=this.distancePerFrame();
	if(this._x<this._realX) this._realX=Math.max(this._realX-dpf,this._x);
	if(this._x>this._realX) this._realX=Math.min(this._realX+dpf,this._x);
	if(this._y<this._realY) this._realY=Math.max(this._realY-dpf,this._y);
	if(this._y>this._realY) this._realY=Math.min(this._realY+dpf,this._y);
}).
addBase('updateMove_1stepDone',function f(){
	this.refreshBushDepth();
}).
addBase('updateJump',function f(){
	// only called when 'this.isJumping()' is true
	this.updateJump_1stepWork();
	this.refreshBushDepth();
	if(!this.isJumping()) this.updateJump_1stepDone();
}).
addBase('updateJump_1stepWork',function f(){
	const d=1.0+--this._jumpCount;
	this._realX=(this._realX*this._jumpCount+this._x)/d;
	this._realY=(this._realY*this._jumpCount+this._y)/d;
}).
addBase('updateJump_1stepDone',function f(){
	this._realX=this._x=$gameMap.roundX(this._x);
	this._realY=this._y=$gameMap.roundY(this._y);
}).
getP;


new cfc(Game_Event.prototype).addBase('lock',function f(){
	if(this.lock_cond()) this.lock_do();
}).
addBase('lock_cond',function f(){
	return !this._locked && !this.lock_isNever();
}).
addBase('lock_do',function f(){
	this._prelockDirection=this.direction();
	if(this.lock_shouldTurnToTriggererOnlock()) this.turnTowardCharacter(this._triggerer||$gamePlayer);
	this._locked=true;
	this.onlock();
}).
addBase('lock_isNever',function f(){
	return this.getMeta()[f.tbl[0]];
},[
'dontLock',
]).
addBase('lock_shouldTurnToTriggererOnlock',function f(){
	return !this.getMeta()[f.tbl[0]];
},[
'dontTurnOnStart',
]).
addBase('onlock',function f(){
}).
getP;


new cfc(Game_BattlerBase.prototype).
addBase('param',function f(paramId){
	return this.param_clamp(this.param_real(paramId),paramId,);
}).
addBase('param_base',function f(paramId){
	return this.paramBase(paramId)+this.paramPlus(paramId);
}).
addBase('param_rate',function f(paramId){
	return this.paramRate(paramId)*this.paramBuffRate(paramId);
}).
addBase('param_real',function f(paramId){
	return this.param_base(paramId)*this.param_rate(paramId);
}).
addBase('param_clamp',function f(value,paramId){
	if(value-0===Infinity) return Infinity;
	return Math.round(value.clamp(
		this.paramMin(paramId),
		this.paramMax(paramId),
	));
}).
getP;

new cfc(Game_BattlerBase.prototype).
addBase('hpRate',function(){
	const maxVal=this.mhp-0;
	if(maxVal===Infinity) return this.hp===Infinity?1:0;
	return this.hp/maxVal;
}).
addBase('mpRate',function(){
	const maxVal=this.mmp-0;
	if(maxVal===Infinity) return this.mp===Infinity?1:0;
	return this.mp/maxVal;
}).
getP;


new cfc(Game_BattlerBase.prototype).
addBase('setHpMpTp',function(hp,mp,tp){
	if(hp!==undefined) this._hp=hp;
	if(mp!==undefined) this._mp=mp;
	if(tp!==undefined) this._tp=tp;
	this.refresh();
}).
getP;


new cfc(Game_Action.prototype).
addBase('isSkill',function f(){
	return DataManager.isSkill(this.item());
}).
addBase('isItem',function f(){
	return DataManager.isItem(this.item());
}).
getP;


{ const p=Game_Actor.prototype,f=p.consumeItem;
new cfc(p).addBase('consumeItem',f);
}
new cfc(Game_Battler.prototype).addBase('consumeItem',none);


new cfc(BattleManager).
addBase('startAction',function f(){
	const subject=this._subject;
	const action=subject.currentAction();
	const targets=action.makeTargets();
	this.startAction_updateManagerState(f.tbl[0],action,targets);
	this.startAction_useItem(subject,action);
	this.refreshStatus();
	this.startAction_updateLogWindow(subject,action,targets);
},[
'action', // 0: new phase
]).
addBase('startAction_updateManagerState',function f(phase,action,targets){
	if(phase!==undefined) this._phase=phase;
	if(action!==undefined) this._action=action;
	if(targets!==undefined) this._targets=targets;
}).
addBase('startAction_useItem',function f(subject,action){
	subject.useItem(action._item.object());
	action.applyGlobal();
}).
addBase('startAction_updateLogWindow',function f(subject,action,targets){
	this._logWindow.startAction(subject,action,targets);
}).
getP;


new cfc(Game_Action.prototype).
addBase('itemEffectAddBuff',function(target,effect){
	const chance=this.itemEffectAddBuff_calChance.apply(this,arguments);
	if(this.itemEffectAddBuff_chanceCondOk(chance,arguments)){
		this.itemEffectAddBuff_onSuccess.apply(this,arguments);
	}
}).
addBase('itemEffectAddBuff_calChance',function(target,effect){
	return 1;
}).
addBase('itemEffectAddBuff_chanceCondOk',function(chance,argv){
	return Math.random()<chance;
}).
addBase('itemEffectAddBuff_onSuccess',function(target,effect){
	target.addBuff(effect.dataId, effect.value1);
	this.makeSuccess(target);
}).
addBase('itemEffectRemoveBuff',function(target,effect){
	if(target.isBuffAffected(effect.dataId)){
		const chance=this.itemEffectRemoveBuff_calChance.apply(this,arguments);
		if(this.itemEffectRemoveBuff_chanceCondOk(chance,arguments)){
			this.itemEffectRemoveBuff_onSuccess.apply(this,arguments);
		}
	}
}).
addBase('itemEffectRemoveBuff_calChance',function(target,effect){
	return 1;
}).
addBase('itemEffectRemoveBuff_chanceCondOk',function(chance,argv){
	return Math.random()<chance;
}).
addBase('itemEffectRemoveBuff_onSuccess',function(target,effect){
	target.removeBuff(effect.dataId);
	this.makeSuccess(target);
}).
getP;

new cfc(Game_Action.prototype).
addBase('itemEffectAddDebuff',function(target,effect){
	const chance=this.itemEffectAddDebuff_calChance.apply(this,arguments);
	if(this.itemEffectAddDebuff_chanceCondOk(chance,arguments)){
		this.itemEffectAddDebuff_onSuccess.apply(this,arguments);
	}
}).
addBase('itemEffectAddDebuff_calChance',function(target, effect){
	return target.debuffRate(effect.dataId)*this.lukEffectRate(target);
}).
addBase('itemEffectAddDebuff_chanceCondOk',function(chance,argv){
	return Math.random()<chance;
}).
addBase('itemEffectAddDebuff_onSuccess',function(target,effect){
	target.addDebuff(effect.dataId, effect.value1);
	this.makeSuccess(target);
}).
addBase('itemEffectRemoveDebuff',function(target,effect){
	if(target.isDebuffAffected(effect.dataId)){
		const chance=this.itemEffectRemoveDebuff_calChance.apply(this,arguments);
		if(this.itemEffectRemoveDebuff_chanceCondOk(chance,arguments)){
			this.itemEffectRemoveDebuff_onSuccess.apply(this,arguments);
		}
	}
}).
addBase('itemEffectRemoveDebuff_calChance',function(target,effect){
	return 1;
}).
addBase('itemEffectRemoveDebuff_chanceCondOk',function(chance,argv){
	return Math.random()<chance;
}).
addBase('itemEffectRemoveDebuff_onSuccess',function(target,effect){
	target.removeBuff(effect.dataId);
	this.makeSuccess(target);
}).
getP;

new cfc(Game_Action.prototype).
addBase('itemEffectAddNormalState',function f(target,effect){
	const chance=this.itemEffectAddNormalState_calChance.apply(this,arguments);
	if(this.itemEffectAddNormalState_chanceCondOk(chance,arguments)){
		this.itemEffectAddNormalState_onSuccess.apply(this,arguments);
	}
}).
addBase('itemEffectAddNormalState_calChance',function f(target,effect){
	let chance=effect.value1;
	if(!this.isCertainHit()){
		chance*=target.stateRate(effect.dataId);
		chance*=this.lukEffectRate(target);
	}
	return chance;
}).
addBase('itemEffectAddNormalState_chanceCondOk',function f(chance,argv){
	return Math.random()<chance;
}).
addBase('itemEffectAddNormalState_onSuccess',function f(target,effect){
	target.addState(effect.dataId);
	this.makeSuccess(target);
}).
addBase('itemEffectRemoveState',function f(target,effect){
	const chance=this.itemEffectRemoveState_calChance.apply(this,arguments);
	if(this.itemEffectRemoveState_chanceCondOk(chance,arguments)){
		this.itemEffectRemoveState_onSuccess.apply(this,arguments);
	}
}).
addBase('itemEffectRemoveState_calChance',function f(target,effect){
	return effect.value1;
}).
addBase('itemEffectRemoveState_chanceCondOk',function f(chance,argv){
	return Math.random()<chance;
}).
addBase('itemEffectRemoveState_onSuccess',function f(target,effect){
	target.removeState(effect.dataId);
	this.makeSuccess(target);
}).
addBase('itemEffectAddAttackState',function f(target,effect){
	this.subject().attackStates().forEach(this.itemEffectAddAttackState1.bind(this,target,effect));
}).
addBase('itemEffectAddAttackState1',function f(target,effect,stateId){
	const chance=this.itemEffectAddAttackState1_calChance.apply(this,arguments);
	if(this.itemEffectAddAttackState1_chanceCondOk(chance,arguments)){
		this.itemEffectAddAttackState1_onSuccess.apply(this,arguments);
	}
}).
addBase('itemEffectAddAttackState1_chanceCondOk',function f(chance,argv){
	return Math.random()<chance;
}).
addBase('itemEffectAddAttackState1_calChance',function f(target,effect,stateId){
	let chance=effect.value1;
	chance*=target.stateRate(stateId);
	chance*=this.subject().attackStatesRate(stateId);
	chance*=this.lukEffectRate(target);
	return chance;
}).
addBase('itemEffectAddAttackState1_onSuccess',function f(target,effect,stateId){
	target.addState(stateId);
	this.makeSuccess(target);
}).
getP;


new cfc(Game_Action.prototype).
addBase('apply',function f(target){
	const result=target.result();
	this.subject().clearResult();
	result.clear();
	this.apply_onBeforeApplying.apply(this,arguments);
	
	result.used=this.testApply(target);
	if(!result.used) this.apply_onNotApplied.apply(this,arguments);
	result.missed=(result.used&&this.apply_calRnd_missed.apply(this,arguments));
	if(result.missed) this.apply_onMiss.apply(this,arguments);
	result.evaded=(result.used&&!result.missed&&this.apply_calRnd_evaded.apply(this,arguments));
	if(result.evaded) this.apply_onEvaded.apply(this,arguments);
	
	result.physical = this.isPhysical();
	result.drain = this.isDrain();
	
	if(result.isHit()) this.apply_onHit.apply(this,arguments);
	else this.apply_onNoHit.apply(this,arguments);
}).
addBase('apply_calRnd_missed',function f(target){
	return Math.random()>=this.itemHit(target);
}).
addBase('apply_calRnd_evaded',function f(target){
	return Math.random()<this.itemEva(target);
}).
addBase('apply_onBeforeApplying',none).
addBase('apply_onNotApplied',none).
addBase('apply_onMiss',none).
addBase('apply_onEvaded',none).
addBase('apply_onNoHit',none).
addBase('apply_onHit',function f(target){
	if(0<this.item().damage.type){
		const result=target.result();
		result.critical=(Math.random()<this.itemCri(target));
		if(result.critical) this.apply_onCritical.apply(this,arguments);
		const value=this.makeDamageValue(target,result.critical);
		this.executeDamage(target,value);
	}
	this._effectsOnTarget=target;
	this.item().effects.forEach(f.tbl[0],this);
	this._effectsOnTarget=undefined;
	this.apply_onEffects.apply(this,arguments);
	this.applyItemUserEffect(target);
},[
function f(effect){
	this.applyItemEffect(this._effectsOnTarget,effect);
}, // 0: forEach Effects
]).
addBase('apply_onCritical',none).
addBase('apply_onEffects',none).
getP;


new cfc(Game_Action.prototype).
addBase('calcElementRate',function(target) {
	const item=this.item();
	if(item.damage.elementId<0){
		return this.elementsMaxRate(target,this.subject().attackElements(item),item);
	}else{
		return target.elementRate(item.damage.elementId,item,this);
	}
}).
getP;


new cfc(Game_BattlerBase.prototype).
addBase('statesContainer_addStateId',function f(stateId){
	this._states.multisetPush(stateId);
}).
addBase('statesContainer_delStateId',function f(stateId){
	this._states.multisetPop(stateId);
}).
addBase('statesContainer_cntStateId',function f(stateId){
	return this._states.multisetGetCnt(stateId);
}).
addBase('statesContainer_hasStateId',function f(stateId){
	return this._states.multisetHas(stateId);
}).
addBase('sortStates',function f(){
	if(f.tbl[2]){
		throw new Error(f.tbl[3]);
	}else console.warn(f.tbl[3]);
},[
undefined,
undefined,
window.isTest(), // 2: is test? align to plugins' position
"due to data structure, DO NOT use `sortStates`", // 3: err msg
]).
addBase('isDeathStateId',function f(stateId){
	return f.tbl[0].has(stateId);
},[
new Set([
1,
]), // 0: death state ids
]).
addBase('onAddDeathState',none).
addBase('addNewState',function(stateId) {
	const isAddingDeathState=this.isDeathStateId(stateId);
	if(isAddingDeathState){
		this.die();
	}
	const restricted=this.isRestricted();
	this.statesContainer_addStateId(stateId);
	//this.sortStates(); // do not use it
	if(!restricted && this.isRestricted()){
		this.onRestrict();
	}
	if(isAddingDeathState) this.onAddDeathState();
}).
addBase('eraseState',function f(stateId){
	this.statesContainer_delStateId(stateId);
	delete this._stateTurns[stateId];
}).
addBase('isStateAffected',function f(stateId){
	return this.statesContainer_hasStateId(stateId);
}).
addBase('sortStates_cmpFunc',(a,b)=>DataManager.arrSortFunc_mostImportantStateAtFirst(a,b)).
addBase('sortStates_cmpFunc_rev',function(a,b){ return -this.sortStates_cmpFunc(a,b); }).
addBase('states',function f(){
	return this._states.slice().sort(this.sortStates_cmpFunc,this).map(DataManager.arrMapFunc_idToDataobj_state);
}).
addBase('getKeepWhenDeadStates',function f(){
	const rtv=[],src=this._stateTurns&&this._states;
	if(src){ for(let x=0,xs=src.length;x<xs;++x){
		const dataobj=$dataStates[src[x]]; if(!dataobj||!dataobj.meta||!dataobj.meta.keepWhenDead) continue;
		rtv.push([src[x],this._stateTurns[src[x]],this._stateSteps&&this._stateSteps[src[x]],]);
	} }
	return rtv;
}).
addBase('die',function f(){
	this._hp=0;
	const arr=this.getKeepWhenDeadStates();
	this.clearStates(); // expected to generate a new []
	arr.forEach(f.tbl[0],this);
	this.clearBuffs();
},[
function(stateInfo){
	this.statesContainer_addStateId(stateInfo[0]);
	this._stateTurns[stateInfo[0]]=stateInfo[1];
	if(this._stateSteps) this._stateSteps[stateInfo[0]]=stateInfo[2];
}, // 0: forEach put back
]).
getP;

new cfc(Game_Battler.prototype).
addBase('addState',function(stateId) {
	if(this.isStateAddable(stateId)){
		// state can be added to refresh stateCounts
		if(this.addNewState_condOk(stateId)){
			this.addNewState(stateId);
			if(this._result) this._result.pushAddedState(stateId);
			this.refresh();
		}
		this.resetStateCounts(stateId);
	}
}).
addBase('addNewState_condOk',function f(stateId){
	return !this.isStateAffected(stateId);
}).
getP;

new cfc(Game_ActionResult.prototype).
addBase('isStateAdded',function f(stateId){
	return this.addedStates.multisetHas(stateId);
}).
addBase('pushAddedState',function f(stateId){
	this.addedStates.multisetPush(stateId);
}).
addBase('isStateRemoved',function f(stateId){
	return this.removedStates.multisetHas(stateId);
}).
addBase('pushRemovedState',function f(stateId){
	this.removedStates.multisetPush(stateId);
}).
addBase('isBuffAdded',function f(stateId){
	return this.addedBuffs.multisetHas(stateId);
}).
addBase('pushAddedBuff',function f(stateId){
	this.addedBuffs.multisetPush(stateId);
}).
addBase('isDebuffAdded',function f(stateId){
	return this.addedDebuffs.multisetHas(stateId);
}).
addBase('pushAddedDebuff',function f(stateId){
	this.addedDebuffs.multisetPush(stateId);
}).
addBase('isBuffRemoved',function f(stateId){
	return this.removedBuffs.multisetHas(stateId);
}).
addBase('pushRemovedBuff',function f(stateId){
	this.removedBuffs.multisetPush(stateId);
}).
getP;


new cfc(Game_Actor.prototype).
addBase('onPlayerWalk_updateStatesSteps',function f(){
	this._states.slice().forEach(f.tbl[0],this);
},[
function(stateId){ const state=$dataStates[stateId]; if(state) this.updateStateSteps(state); }, // 0: forEach
]).
addBase('onPlayerWalk',function(){
	this.clearResult();
	this.checkFloorEffect();
	if($gamePlayer.isNormal()){
		this.turnEndOnMap();
		this.onPlayerWalk_updateStatesSteps();
		this.showAddedStates();
		this.showRemovedStates();
	}
}).
getP;


new cfc(DataManager).
addBase('getItem_paramPlus',function f(item,paramId){
	const params=item&&item.params;
	return params&&params[paramId];
}).
addBase('paramShortNameToId',function f(shortName){
	return (shortName in f.tbl[0])?f.tbl[0][shortName]:undefined;
},[
{
"mhp":0,
"mmp":0,
"atk":2,
"def":3,
"mat":4,
"mdf":5,
"agi":6,
"luk":7,
}, // 0: mapping table for basic params names
]).
getP;

new cfc(Game_Actor.prototype).
addBase('paramPlus',function f(paramId){
	let rtv=Game_Battler.prototype.paramPlus.call(this, paramId);
	rtv+=this.paramPlus_equips(paramId);
	return rtv;
}).
addBase('paramPlus_equips',function f(paramId){
	let rtv=0;
	const arr=this.equips();
	for(let x=0,xs=arr.length;x<xs;++x){ const item=arr[x]; if(item){
		rtv+=DataManager.getItem_paramPlus(item,paramId)-0||0;
	} }
	return rtv;
}).
getP;

new cfc(Game_Actor.prototype).
addBase('_equipsTbl_normalizeItem',function f(item){
	return item==null?null:item; // undefined->null
}).
addBase('_equipsTbl_getCont',function f(){
	const arr=this._equips;
	if(!arr) return [];
	let rtv=arr._equippedTbl;
	if(!rtv){
		rtv=arr._equippedTbl=[];
		for(let x=arr.length;x--;) rtv.multisetPush(this._equipsTbl_normalizeItem(arr[x]&&arr[x].object()));
	}
	return rtv;
}).
addBase('_equipsTbl_add',function f(item){
	return this._equipsTbl_getCont().multisetPush(this._equipsTbl_normalizeItem(item));
}).
addBase('_equipsTbl_del',function f(item){
	return this._equipsTbl_getCont().multisetPop(this._equipsTbl_normalizeItem(item));
}).
addBase('_equipsTbl_has',function f(item){
	return this._equipsTbl_getCont().multisetHas(this._equipsTbl_normalizeItem(item));
}).
addBase('_equipsTbl_cnt',function f(item){
	return this._equipsTbl_getCont().multisetGetCnt(this._equipsTbl_normalizeItem(item));
}).
addBase('_setEquip_getDataarr',function f(slotId,slots){
	return slots[slotId]===1?$dataWeapons:$dataArmors;
}).
addBase('_setEquip',function f(slotId,item){
	// internal api
	const arr=this._equips;
	const gameItem=arr&&arr[slotId];
	if(gameItem){
		const oldItem=gameItem.object();
		this._equipsTbl_del(oldItem);
		this._equipsTbl_add(item);
		gameItem.setObject(item);
	}else if(arr){
		for(let x=arr.length;x<slotId;++x) this._equipsTbl_add(arr[x]&&arr[x].object());
		this._equipsTbl_add(item);
		(arr[slotId]=new Game_Item()).setObject(item);
	}
}).
addBase('_getEquip',function f(slotId){
	// internal api
	const arr=this._equips;
	const gameItem=arr&&arr[slotId];
	return gameItem&&gameItem.object();
}).
addBase('_delEquipOnSlot',function f(slotId){
	const arr=this._equips; if(!arr) return;
	if(arr.constructor===Array) arr[slotId]=0;
	else arr[slotId]=undefined;
}).
addBase('_getEquipSlot',function f(slotId){
	let rtv=(slotId===1&&this.isDualWield())?1:slotId+1;
	return rtv;
}).
addBase('setEquip',function f(slotId,item){
	// external api
	return this._setEquip.apply(this,arguments);
}).
addBase('getEquip',function f(slotId){
	// external api
	return this._getEquip.apply(this,arguments);
}).
addBase('getEquipSlot',function f(slotId){
	return this._getEquipSlot.apply(this,arguments);
}).
addBase('equips',function f(){
	const rtv=[];
	for(let x=0,arr=this._equips,xs=arr.length;x<xs;++x){
		if(arr[x]) rtv.push(arr[x].object());
		else rtv.push(null);
	}
	return rtv;
}).
addBase('initEquips',function f(equips){
	const slots=this.equipSlots();
	const maxSlots=slots.length;
	this._equips=[];
	for(let x=0;x<maxSlots;++x){
		this._equips[x]=new Game_Item();
	}
	for(let x=0,xs=equips.length;x<xs;++x){
		if(!(x<maxSlots)) continue;
		const dataarr=this._setEquip_getDataarr(x,slots);
		this.setEquip(x,dataarr[equips[x]]);
	}
	this.releaseUnequippableItems(true);
	this.refresh();
}).
addBase('changeEquip',function f(slotId,item){
    if(this.changeEquip_condOk.apply(this,arguments)) this.changeEquip_do.apply(this,arguments);
}).
addBase('changeEquip_condOk',function f(slotId,item){
	return this.tradeItemWithParty(item,this._getEquip(slotId)) && (!item||this._getEquipSlot(slotId)===item.etypeId);
}).
addBase('changeEquip_do',function f(slotId,item){
	this.setEquip(slotId,item);
	this.refresh();
}).
addBase('changeEquipById',function f(etypeId,itemId){
	const slotId=etypeId-1;
	const dataarr=this._getEquipSlot(slotId)===1?$dataWeapons:$dataArmors;
	this.changeEquip(slotId, dataarr[itemId]);
}).
addBase('forceChangeEquip',function f(slotId,item){
	this.setEquip(slotId,item);
	this.releaseUnequippableItems(true);
	this.refresh();
}).
addBase('discardEquip',function f(item){
	if(!this.isEquipped(item)) return;
	const slotId=this.equips().indexOf(item);
	this.setEquip(slotId,null);
	return true;
}).
addBase('releaseUnequippableItems',function(forcing){
	let changed=false;
	do{
		this.releaseUnequippableItems_roundStart.apply(this,arguments);
		const slots=this.equipSlots();
		const equips=this.equips();
		changed=false;
		for(let i=0,sz=equips.length;i<sz;++i){
			const item=equips[i];
			if(item && (!this.canEquip(item)||item.etypeId!==slots[i])){
				if(!forcing){
					this.tradeItemWithParty(null, item);
				}
				this.setEquip(i,null);
				changed=true;
			}
		}
	}while(changed);
}).
addBase('releaseUnequippableItems_roundStart',none).
addBase('isEquipChangeOk',function(slotId){
	return !this.isEquipTypeLocked(this._getEquipSlot(slotId)) && !this.isEquipTypeSealed(this._getEquipSlot(slotId)) ;
}).
addBase('equipSlotsLength',function f(){
	return this.equipSlots().length;
}).
addBase('clearEquipments',function f(){
	for(let slotId=this.equipSlotsLength();slotId--;) if(this.isEquipChangeOk(slotId)) this.changeEquip(slotId,null);
}).
addBase('optimizeEquipments',function(){
	this.clearEquipments();
	const slots=this.equipSlots();
	const slotIdEnd=slots.length;
	for(let slotId=slotIdEnd;slotId--;){
		if(this.isEquipChangeOk(slotId)){
			this.changeEquip(slotId,this.bestEquipItem(slots[slotId]));
		}
	}
}).
addBase('bestEquipItem',function f(etypeId){
	const items=$gameParty.equipItems().filter(function(item){
		return item.etypeId===etypeId&&this.canEquip(item);
	},this);
	let bestItem=null;
	let bestPerformance=-1e9;
	for(let i=items.length;i--;){
		const performance=this.calcEquipItemPerformance(items[i]);
		if(performance>bestPerformance){
			bestPerformance=performance;
			bestItem=items[i];
		}
	}
	return bestItem;
}).
getP;

new cfc(Window_EquipSlot.prototype).
addBase('item',function f(){
	return this._actor ? this._actor.getEquip(this.index()) : null;
}).
addBase('drawItem',function f(index){
	if(!this._actor) return;
	const rect=this.itemRectForText(index);
	this.changeTextColor(this.systemColor());
	this.changePaintOpacity(this.isEnabled(index));
	this.drawText(this.slotName(index), rect.x, rect.y, 138, this.lineHeight());
	this.drawItemName(this._actor.getEquip(index), rect.x + 138, rect.y);
	this.changePaintOpacity(true);
}).
addBase('maxItems',function(){
	return this._actor?this._actor.equipSlotsLength():0;
}).
addBase('slotName',function f(index){
	if(!this._actor) return '';
	return $dataSystem.equipTypes[this._actor.getEquipSlot(index)];
}).
getP;

new cfc(Window_EquipItem.prototype).
addBase('includes',function f(item){
	if(item === null) return true;
	if(this._slotId < 0 || item.etypeId !== this._actor.getEquipSlot(this._slotId)){
		return false;
	}
	return this._actor.canEquip(item);
}).
getP;


new cfc(Game_Enemy.prototype).
addBase('enemy',function f(enemyId){
	if(enemyId===undefined) enemyId=this._enemyId;
	return $dataEnemies[enemyId];
}).
getP;

new cfc(Game_Actor.prototype).
addBase('actor',function f(actorId){
	if(actorId===undefined) actorId=this._actorId;
	return $dataActors[actorId];
}).
addBase('currentClass',function f(useThisClassId){
	if(useThisClassId===undefined) useThisClassId=this._classId;
	return $dataClasses[useThisClassId];
}).
getP;


new cfc(Game_BattlerBase.prototype).
addBase('allTraits',function f(){
	const rtv=[];
	return this.traitObjects().reduce(f.tbl[0],rtv);
	return rtv;
},[
(r,n)=>{ for(let arr=n.traits,xs=arr.length,x=0;x<xs;++x) r.push(arr[x]); return r; }, // 0: 
]).
addBase('traitsSumAll',function f(code){
	return this.traits(code).reduce(f.tbl[0],0);
},[
(r,n)=>r+n.value, // 0: reduce
]).
addBase('traitsSet',function f(code){
	return this.traitsAllIds(code);
}).
addBase('traitsAllIds',function f(code){
	const rtv=[];
	this.traits(code).reduce(f.tbl[0],rtv);
	return rtv;
},[
(r,n)=>{ r.push(n.dataId); return r; }, // 0: reduce
]).
addBase('traitsUniqueIds',function f(code){
	const rtv=[];
	this.traits(code).reduce(f.tbl[0],rtv);
	return rtv;
},[
(r,n)=>{ r.uniquePush(n.dataId); return r; }, // 0: reduce
]).
addBase('stateResistSet',function f(){
	return this.traitsUniqueIds(Game_BattlerBase.TRAIT_STATE_RESIST);
}).
addBase('addedSkillTypes',function f(){
	return this.traitsUniqueIds(Game_BattlerBase.TRAIT_STYPE_ADD);
}).
addBase('addedSkills',function f(){
	return this.traitsUniqueIds(Game_BattlerBase.TRAIT_SKILL_ADD);
}).
addBase('traitsMaxId',function f(code){
	return this.traits(code).reduce(f.tbl[0],0);
	return rtv;
},[
(r,n)=>Math.max(r,n.dataId), // 0: reduce
]).
addBase('slotType',function f(){
	return this.traitsMaxId(Game_BattlerBase.TRAIT_SLOT_TYPE);
}).
addBase('collapseType',function f(){
	return this.traitsMaxId(Game_BattlerBase.TRAIT_COLLAPSE_TYPE);
}).
addBase('traitsHasId',function f(code,id){
	return this.traitsSet(code).contains(id);
}).
addBase('isStateResist',function f(stateId){
	return this.traitsHasId(Game_BattlerBase.TRAIT_STATE_RESIST,stateId);
}).
addBase('isSkillTypeSealed',function f(stypeId){
	return this.traitsHasId(Game_BattlerBase.TRAIT_STYPE_SEAL,stypeId);
}).
addBase('isSkillSealed',function f(skillId){
	return this.traitsHasId(Game_BattlerBase.TRAIT_SKILL_SEAL,skillId);
}).
addBase('isEquipWtypeOk',function f(wtypeId){
	return this.traitsHasId(Game_BattlerBase.TRAIT_EQUIP_WTYPE,wtypeId);
}).
addBase('isEquipAtypeOk',function f(atypeId){
	return this.traitsHasId(Game_BattlerBase.TRAIT_EQUIP_ATYPE,atypeId);
}).
addBase('isEquipTypeLocked',function f(etypeId){
	return this.traitsHasId(Game_BattlerBase.TRAIT_EQUIP_LOCK,etypeId);
}).
addBase('isEquipTypeSealed',function f(etypeId){
	return this.traitsHasId(Game_BattlerBase.TRAIT_EQUIP_SEAL,etypeId);
}).
addBase('specialFlag',function(flagId) {
	return this.traitsHasId(Game_BattlerBase.TRAIT_SPECIAL_FLAG,flagId);
}).
addBase('partyAbility',function(abilityId){
	return this.traitsHasId(Game_BattlerBase.TRAIT_PARTY_ABILITY,abilityId);
}).
addBase('actionPlusSet',function f(){
	// originally used by ONLY `makeActionTimes`
	throw new Error('don\'t use `'+f._funcName+'`');
}).
getP;

new cfc(Game_Battler.prototype).
addBase('isStateAddable',function(stateId) {
	return ($dataStates[stateId] && this.isAlive() && 
		!this.isStateResist(stateId) && 
		//!this._result.isStateRemoved(stateId) && // weird
		!this.isStateRestrict(stateId) && 
	true);
}).
addBase('makeActionTimes',function f(){
	const val=1+this.traitsSumAll(Game_BattlerBase.TRAIT_ACTION_PLUS);
	return val+(Math.random()<val%1);
}).
getP;


new cfc(Game_BattlerBase.prototype).
addBase('refresh_resistStates',function f(){
	this.stateResistSet().forEach(f.tbl[0],this);
},[
function(stateId){ this.eraseState(stateId); }, // 0: forEach
]).
addBase('refresh_ps',function f(){
	this._hp=this._hp.clamp(0,this.mhp);
	this._mp=this._mp.clamp(0,this.mmp);
	this._tp=this._tp.clamp(0,this.maxTp());
}).
addBase('refresh',function f(){
	this.refresh_resistStates();
	this.refresh_ps();
}).
getP;

new cfc(Game_Actor.prototype).
addBase('isLearnedSkill',function f(skillId){
	const skills=this._skills; if(!skills) return false;
	let cntTbl=skills._cntTbl; // skills will do `.sort()`
	if(!cntTbl){
		cntTbl=skills._cntTbl=new Map();
		for(let x=skills.length;x--;) cntTbl.set(skills[x],(cntTbl.get(skills[x])|0)+1);
	}
	return cntTbl.has(skillId);
}).
addBase('learnSkill_condOk',function f(skillId){
	return !this.isLearnedSkill(skillId);
}).
addBase('learnSkill_do',function f(skillId){
	this.isLearnedSkill(skillId); // build tbl
	{ const cntTbl=this._skills._cntTbl;
	cntTbl.set(skillId,(cntTbl.get(skillId)|0)+1);
	}
	this._skills.push(skillId);
	this._skills.sort(cmpFunc_num);
}).
addBase('learnSkill',function f(skillId){
	if(this.learnSkill_condOk.apply(this,arguments)) this.learnSkill_do.apply(this,arguments);
}).
addBase('forgetSkill_condOk',function f(skillId){
	return this.isLearnedSkill(skillId);
}).
addBase('forgetSkill_do',function f(skillId){
	this.isLearnedSkill(skillId); // build tbl
	const index=this._skills.indexOf(skillId);
	if(index>=0){
		{ const cntTbl=this._skills._cntTbl;
		const newVal=(cntTbl.get(skillId)|0)-1;
		if(newVal) cntTbl.set(skillId,newVal);
		else cntTbl.delete(skillId);
		}
		this._skills.splice(index,1);
	}
}).
addBase('forgetSkill',function f(skillId){
	if(this.forgetSkill_condOk.apply(this,arguments)) this.forgetSkill_do.apply(this,arguments);
}).
addBase('_skillIds_selfLearned',function f(){
	return this._skills||f.tbl[0];
},[
[], // 0: default
]).
addBase('skillIds_selfLearned',function f(){
	return this._skillIds_selfLearned().slice();
}).
addBase('skillIds_addedByTraits',function f(){
	return this.addedSkills();
}).
addBase('skills',function f(){
	const skillIds=[];
	skillIds.uniquePushContainer(this._skillIds_selfLearned());
	skillIds.uniquePushContainer(this.skillIds_addedByTraits());
	return skillIds.map(DataManager.arrMapFunc_idToDataobj_skill);
}).
addBase('hasSkill_self',function f(skillId){
	return this.isLearnedSkill(skillId);
}).
addBase('hasSkill_trait',function f(skillId){
	return this.skillIds_addedByTraits().uniqueHas(skillId);
}).
addBase('hasSkill',function f(skillId){
	return this.hasSkill_self(skillId)||this.hasSkill_trait(skillId);
}).
getP;


new cfc(Game_Party.prototype).
addBase('_actorsTbl_getCont',function f(){
	const actors=this._actors; if(!actors){ return new Map(); }
	let rtv=actors._actorIdCntTbl; if(!rtv){ rtv=actors._actorIdCntTbl=new Map(); for(let x=actors.length;x--;) rtv.set(actors[x],(rtv.get(actors[x])|0)+1); }
	return rtv;
}).
addBase('_actorsTbl_add',function f(actorId){
	const cont=this._actorsTbl_getCont();
	const newVal=(cont.get(actorId)|0)+1;
	cont.set(actorId,newVal);
	return newVal;
}).
addBase('_actorsTbl_del',function f(actorId){
	const cont=this._actorsTbl_getCont();
	const oldVal=(cont.get(actorId)|0);
	if(!oldVal) return oldVal;
	const newVal=oldVal-1;
	if(!newVal) cont.delete(actorId);
	else cont.set(actorId,newVal);
	return newVal;
}).
addBase('_actorsTbl_cnt',function f(actorId){
	const cont=this._actorsTbl_getCont();
	return cont.get(actorId)|0;
}).
addBase('onActorsChanged_enable',function(){
	this._isDisablingOnActorsChanged=undefined;
}).
addBase('onActorsChanged_disable',function(){
	this._isDisablingOnActorsChanged=true;
}).
addBase('onActorsChanged_isDisabled',function(){
	return this._isDisablingOnActorsChanged;
}).
addBase('onActorsChanged',function f(actorId){
	if(this.onActorsChanged_isDisabled()) return;
	$gamePlayer.refresh();
	$gameMap.requestRefresh();
}).
addBase('addActor_condOk',function f(actorId){
	return this._actorsTbl_cnt(actorId)===0;
}).
addBase('addActor_do',function f(actorId){
	this._actorsTbl_add(actorId);
	this._actors.push(actorId);
}).
addBase('addActor',function f(actorId){
	if(this.addActor_condOk(actorId)){
		this.addActor_do(actorId);
		this.onAddActor(actorId);
	}
}).
addBase('onAddActor',function f(actorId){
	this.onActorsChanged(actorId);
}).
addBase('removeActor_condOk',function(actorId){
	return 0<this._actorsTbl_cnt(actorId);
}).
addBase('removeActor_do',function(actorId){
	this._actorsTbl_del(actorId);
	this._actors.splice(this._actors.indexOf(actorId),1);
}).
addBase('removeActor',function(actorId){
	if(this.removeActor_condOk(actorId)){
		this.removeActor_do(actorId);
		this.onRemoveActor(actorId);
	}
}).
addBase('onRemoveActor',function f(actorId){
	this.onActorsChanged(actorId);
}).
getP;


{ const p=Game_System.prototype;
new cfc(p).
addBase('onAfterLoad_main',p.onAfterLoad).
addBase('onAfterLoad_before',function f(){
	DataManager.resetDataarrs();
}).
addBase('onAfterLoad_after',none).
addBase('onAfterLoad',function f(){
	this.onAfterLoad_before();
	const rtv=this.onAfterLoad_main();
	this.onAfterLoad_after();
	return rtv;
}).
getP;
}


})(); // refine for future extensions

// ---- ---- ---- ---- Scene_HTML_base

(()=>{ let k,r,t;

const a=class Scene_HTML_base extends Scene_Base{
};
window[a.name]=a;
a.ori=Scene_Base;
t=[
a.ori.prototype,
];
new cfc(a.prototype).addBase('initialize',function f(){
	this.fontFace_init();
	const rtv=f.tbl[0][f._funcName].apply(this,arguments);
	this.initialize_initFontFace();
	this._isToExit=false;
	this.initialize_background();
	this.initialize_divRoot();
	return rtv;
},t).addBase('fontFace_get',function f(){
	return this._fontFace;
}).addBase('fontFace_set',function f(ff){
	this._fontFace=ff;
}).addBase('fontFace_init',function f(){
	let bmp=a._template_bmp; if(!bmp){ bmp=new Bitmap(1,1); bmp._makeFontNameText(); }
	return bmp;
}).addBase('initialize_initFontFace',function f(){
	this.fontFace_set(this.fontFace_init().fontFace);
}).addBase('initialize_background',function f(){
	const bmp=this._backgroundBmp=SceneManager.snap();
	bmp.blur();
	return bmp;
}).addBase('initialize_divRoot',function f(){
	if(this._divRoot) return this._divRoot;
	const rtv=this._divRoot=document.ce('div');
	Graphics.addAsGameCanvas(rtv);
	rtv._main=this._divMain=document.ce('div').sa('style',this.divRootCss());
	rtv.appendChild(rtv._main);
	document.body.ac(rtv);
	rtv.style.fontFamily=this.fontFace_get();
	return rtv;
}).addBase('divRootCss',function(){
	return "width:100%;height:100%;background-color:rgba(0,0,0,0.25);color:#EEEEEE";
}).addBase('update',function f(){
	if(this.update_processInput()) return this.popScene();
	return f.tbl[0][f._funcName].apply(this,arguments);
},t).addBase('update_processInput',function f(){
	if(this.update_processInput_isToExit()) return true;
}).addBase('update_processInput_isToExit',function f(){
	return this._isToExit;
}).addBase('create',function f(){
	this.create_background();
	this.create_exitEvents();
	this.create_inputEvents();
	return f.tbl[0][f._funcName].apply(this,arguments);
},t).addBase('create_background',function f(){
	const sp=this._backgroundSprite=new Sprite(this._backgroundBmp);
	this.addChild(sp);
}).addBase('create_exitEvents',function f(){
	// match terminate_removeExitEvents
	document.body.ae(
		'keydown',
		this._exitEventFunction=evt=>{
			if(evt.keyCode!==27) return;
			this._isToExit=true;
		},
	);
}).addBase('create_inputEvents',function f(){
	// terminate_removeInputEvents
	this._keyboardEventFunction_down=this.keyboardEvent_down.bind(this);
	this._keyboardEventFunction_up=this.keyboardEvent_up.bind(this);
	this._keyboardEventFunction_press=this.keyboardEvent_press.bind(this);
	document.body.ae(
		'keydown',
		this._keyboardEventFunction_down,
		this._keyboardEventOption_down,
	).ae(
		'keyup',
		this._keyboardEventOption_up,
		this._keyboardEventOption_up,
	).ae(
		'keypress',
		this._keyboardEventFunction_press,
		this._keyboardEventOption_press,
	);
}).addBase('keyboardEvent_down',function f(evt){
	if(this.constructor===Scene_HTML_base) console.log('kbevt down',evt.keyCode);
}).addBase('keyboardEvent_up',function f(evt){
	if(this.constructor===Scene_HTML_base) console.log('kbevt up',evt.keyCode);
}).addBase('keyboardEvent_press',function f(evt){
	if(this.constructor===Scene_HTML_base) console.log('kbevt press',evt.keyCode);
}).addBase('terminate',function f(){
	this.terminate_removeExitEvents();
	this.terminate_removeInputEvents();
	this.terminate_removeDivRoot();
	return f.tbl[0][f._funcName].apply(this,arguments);
},t).addBase('terminate_removeExitEvents',function f(){
	// match create_exitEvents
	document.body.re('keydown',this._exitEventFunction,);
}).addBase('terminate_removeInputEvents',function f(){
	document.body.re(
		'keydown',
		this._keyboardEventFunction_down,
		this._keyboardEventOption_down,
	).re(
		'keyup',
		this._keyboardEventOption_up,
		this._keyboardEventOption_up,
	).re(
		'keypress',
		this._keyboardEventFunction_press,
		this._keyboardEventOption_press,
	);
}).addBase('terminate_removeDivRoot',function f(){
	const c=this._divRoot;
	const p=c&&c.parentNode;
	if(p) p.removeChild(c);
});

})(); // Scene_HTML_base

// ---- ---- ---- ---- Sprite_FadeOut

(()=>{ let k,r,t;

const a=class Sprite_FadeOut extends Sprite{
};
window[a.name]=a;
a.ori=Sprite;
t=[
a.ori.prototype,
];
new cfc(a.prototype).addBase('initialize',function f(bitmap,fadeOutFrames){
	const rtv=f.tbl[0][f._funcName].apply(this,arguments);
	this._fadeOutFramesMax=fadeOutFrames;
	this._fadeOutFramesRemained=fadeOutFrames;
	return rtv;
},t).addBase('update',function f(){
	const rtv=f.tbl[0][f._funcName].apply(this,arguments);
	if(this._initAlpha===undefined) this._initAlpha=this.alpha;
	this.alpha=this._initAlpha*(--this._fadeOutFramesRemained/this._fadeOutFramesMax);
	if(!(0<this._fadeOutFramesRemained) && this.parent) this.parent.removeChild(this);
	return rtv;
},t);

})(); // Sprite_FadeOut

// ---- ---- ---- ---- PluginManager

(()=>{ let k,r,t;

new cfc(PluginManager).addBase('setParameters',function f(key,params){
	return this._parameters[key]=params;
}).addBase('parameters',function f(key){
	return this._parameters[key] || f.tbl[0][key] || (f.tbl[0][key]={});
},[
{}, // 0: common defaults
]);

PluginManager._parameters={};
window.$pluginsMap=$plugins.map(plugin=>[plugin.name,plugin]);
$plugins.forEach(plugin=>plugin.status&&PluginManager.setParameters(plugin.name, plugin.parameters));

})(); // PluginManager

// ---- ---- ---- ---- load other files

new cfc(ImageManager).addBase('otherFiles_getDataMap',function f(){
	let m=this._otherFiles; if(!m) m=this._otherFiles=new Map();
	return m;
}).addBase('otherFiles_getPendedSet',function f(){
	let s=this._otherFiles_pended; if(!s) s=this._otherFiles_pended=new Set();
	return s;
}).addBase('otherFiles_getData',function f(path){
	const m=this.otherFiles_getDataMap();
	return m.get(path);
}).addBase('otherFiles_delData',function f(path){
	const m=this.otherFiles_getDataMap(),s=this.otherFiles_getPendedSet();
	const rtv=m.get(path);
	m.delete(path);
	s.delete(path);
	return rtv;
}).addBase('otherFiles_delDataAll',function f(){ // for debug
	const m=this.otherFiles_getDataMap(),s=this.otherFiles_getPendedSet();
	m.forEach(f.tbl[0].bind(m));
	s.forEach(f.tbl[0].bind(s));
},[
function(v,k){this.delete(k);},
]).addBase('otherFiles_addLoad',function f(path){
	const m=this.otherFiles_getDataMap();
	if(m.has(path)) return;
	const s=this.otherFiles_getPendedSet();
	if(s.has(path)) return;
	s.add(path);
	window.jurl(path,"GET",0,0,0,resp=>{
		if(s.has(path)){
			m.set(path,resp);
			s.delete(path);
		}else console.warn("canceled: "+path);
	},xhr=>{ if(!(xhr.readyState>=4)) return;
		const stat=xhr.status.toString();
		if(stat==='0' || (stat.length===3 && stat[0]==='4')) s.delete(path); // nw.js: 0 ; web: 404
	});
}).addBase('otherFiles_isAllLoaded',function f(){
	return !this.otherFiles_getPendedSet().size;
}).add('isReady',function f(){
	return this.otherFiles_isAllLoaded()&&f.ori.apply(this,arguments);
});

// ---- ---- ---- ---- 

TouchInput._setupEventHandlers = function() {
	const isSupportPassive=Utils.isSupportPassiveEvent();
	const opt=isSupportPassive?{passive:false}:false;
	document.addEventListener('mousedown', this._onMouseDown.bind(this));
	document.addEventListener('mousemove', this._onMouseMove.bind(this));
	document.addEventListener('mouseup', this._onMouseUp.bind(this));
	document.addEventListener('wheel', this._onWheel.bind(this),opt);
	document.addEventListener('touchstart', this._onTouchStart.bind(this),opt);
	document.addEventListener('touchmove', this._onTouchMove.bind(this),opt);
	document.addEventListener('touchend', this._onTouchEnd.bind(this));
	document.addEventListener('touchcancel', this._onTouchCancel.bind(this));
	document.addEventListener('pointerdown', this._onPointerDown.bind(this));
};

// ---- ---- ---- ---- js error

(()=>{ let k,r,t;

new cfc(DataManager).addBase('getDebugInfo',function f(){
	const sc=SceneManager._scene;
	return ({
		sc:sc,
		scCtor:sc.constructor,
		mapId:$gameMap&&$gameMap._mapId,
		xy:$gamePlayer&&({x:$gamePlayer.x,y:$gamePlayer.y}),
		xyReal:$gamePlayer&&({x:$gamePlayer._realX,y:$gamePlayer._realY}),
		troopId:$gameTroop&&$gameTroop._troopId,
	});
}).addBase('getDebugInfoStr',function f(){
	const res=[];
	const info=this.getDebugInfo();
	const scName=info.scCtor&&info.scCtor.name;
	res.push("scene: "+scName);
	res.push("mapId: "+info.mapId);
	res.push("xy: "+JSON.stringify(info.xy||null));
	res.push("xyReal: "+JSON.stringify(info.xyReal||null));
	res.push("troopId: "+info.troopId);
	return res.join(' ; ');
});

new cfc(Game_Interpreter.prototype).add('command111',function f(){
	// interpreter branch
	if(this._params[0]===12){
		let res;
		try{
			res=!!eval(this._params[1]);
		}catch(e){
			if(this && this._params){
				console.warn(this._params);
				e.message+='\n\nScript:\n'+this._params[1];
				//e.message+=getStr_英文不好齁()+f.tbl[1][1];
				//e.message+='\n\n'+DataManager.getDebugInfoStr()+'\n'; // in _makeErrorHtml
			}
			e.name+=' in Game_Interpreter.prototype.command111';
			e._msgOri=e.message;
			throw e;
		}
		this._branch[this._indent]=res;
		if(!this._branch[this._indent]) this.skipBranch();
		return true;
	}else return f.ori.apply(this,arguments);
},[
0,
[
'',
'條件分歧ㄉ條件打錯ㄌ',
],
]).addBase('command355',function f(){
	let script=this.currentCommand().parameters[0];
	while(f.tbl[0].has(this.nextEventCode())){
		this._index++;
		script+='\n';
		script+=this.currentCommand().parameters[0];
	}
	try{
		eval(script);
	}catch(e){
		console.warn(f.tbl[1][0],'\n',script);
		if(script){
			e.message+='\n\nScript:\n'+script;
			//e.message+=getStr_英文不好齁()+f.tbl[1][1];
			//e.message+='\n\n'+DataManager.getDebugInfoStr()+'\n'; // in _makeErrorHtml
		}
		e.name+=' in ';
		e.name+=f.tbl[1][0];
		e._msgOri=e.message;
		throw e;
	}
	return true;
},[
new Set([355,655,]),
[
'Game_Interpreter.prototype.command355',
' JavaScript 打錯ㄌ',
],
]);

new cfc(Game_Action.prototype).addBase('evalDamageFormula',function f(target){
	try{
		const item=this.item();
		const a=this.subject();
		const b=target;
		const v=$gameVariables._data;
		let sign=f.tbl[0].has(item.damage.type)?-1:1;
		try{
			let value=Math.max(eval(item.damage.formula),0)*sign;
			if(isNaN(value)) throw new Error(f.tbl[1][0]);
			return value;
		}catch(e){
			if(item && item.damage){
				console.warn(item.damage.formula);
				e.message+='\n\nDamage Formula:\n'+item.damage.formula;
				//e.message+=getStr_英文不好齁()+f.tbl[1][1];
				//e.message+='\n\n'+DataManager.getDebugInfoStr()+'\n'; // in _makeErrorHtml
			}
			e.name+=' in damage formula of '+f.tbl[2](item);
			e._msgOri=e.message;
			throw e;
			return 0;
		}
	}catch(e){
		throw e;
		return 0;
	}
},[
new Set([3,4]),
[
'the Damage Formula evaluates an NaN',
'公式打錯ㄌ，是哪ㄍ公式自己往上看',
],
function f(dataobj){
	let rtv;
	if(DataManager.isSkill(dataobj)) rtv='skill';
	else if(DataManager.isItem(dataobj)) rtv='item';
	else return "(WTF is this?)";
	rtv+=' id ';
	rtv+=dataobj.id;
	return rtv;
},
]);

})(); // js error

// ---- ---- ---- ---- re-unify

(()=>{ let k,r,t;

new cfc(Game_Actor.prototype).addBase('getData',function f(){
	return this.actor();
});

new cfc(Game_Enemy.prototype).addBase('getData',function f(){
	return this.enemy();
});

new cfc(Game_Unit.prototype).addBase('allMembers',function(){
	return this.members();
});

})(); // re-unify

// ---- ---- ---- ---- event page note

(()=>{ let k,r,t;

new cfc(DataManager).add('onLoad_after_map',function f(obj,name,src,msg){
	const rtv=f.ori.apply(this,arguments);
	this.onload_addMapEvtPgNote.apply(this,arguments); // needs to copy event.meta to each page.meta
	return rtv;
}).addBase('onload_addMapEvtPgNote',function f(obj,name,src,msg){
	obj.events.forEach(f.tbl[0]);
},[
evtd=>{ if(!evtd) return;
	for(let pgi=0,pgs=evtd.pages,pgsz=pgs.length;pgi!==pgsz;++pgi){
		const pg=pgs[pgi],noteLines=[];
		for(let isNote=false,li=0,L=pg.list,lsz=L.length;li!==lsz;++li){
			const cmd=L[li];
			if(cmd.code===108){ if(cmd.parameters[0]==="@NOTE") isNote=true; }
			else if(cmd.code===408){}
			else isNote=false;
			if(isNote) noteLines.push(cmd.parameters[0]);
		}
		pg.note=noteLines.join('\n');
		DataManager.extractMetadata(pg);
		if(evtd.meta) pg.meta=Object.assign({},evtd.meta,pg.meta,);
	}
},
]);

new cfc(Game_Event.prototype).addBase('page',function f(){
	const evtd=this.event();
	return evtd&&evtd.pages[this._pageIndex];
}).addBase('getMeta',function f(){
	const pg=this.page();
	// do not edit the return value after getting it from calling this function
	return pg&&pg.meta||f.tbl[0];
},[
{}, // 0: default
]);

})(); // event page note

// ---- ---- ---- ---- gameObj2sprite

(()=>{ let k,r,t;

new cfc(Sprite_Character.prototype).add('setCharacter',function f(){
	{ const sc=SceneManager._scene; if(sc){
		if(!sc._chr2sp) sc._chr2sp=new Map();
		sc._chr2sp.set(arguments[0],this);
	} }
	return f.ori.apply(this,arguments);
}).addBase('updatePosition',function f(){
	const chr=this._character;
	this.position.set(chr.screenX(),chr.screenY());
	this.z=chr.screenZ();
});

new cfc(Sprite_Battler.prototype).add('setBattler',function f(){
	const rtv=f.ori.apply(this,arguments);
	const sc=SceneManager._scene;
	if(sc){
		if(!sc._btlr2sp) sc._btlr2sp=new Map();
		sc._btlr2sp.set(this._battler,this);
	}
	return rtv;
}).addBase('updatePosition',function f(){
	this.position.set( this._homeX+this._offsetX , this._homeY+this._offsetY );
});

new cfc(Game_Character.prototype).addBase('getSprite',function f(){
	const sc=SceneManager._scene;
	const m=sc&&sc._chr2sp;
	return m&&m.get(this);
});

new cfc(Game_Battler.prototype).addBase('getSprite',function f(){
	const sc=SceneManager._scene;
	const m=sc&&sc._btlr2sp;
	return m&&m.get(this);
});

new cfc(SceneManager).addBase('getSprite',function f(obj){
	const sc=this._scene;
	const func=f.tbl[0].get(sc&&sc.constructor);
	const m=func&&func(sc);
	return m&&m.get(obj);
},[
new Map([
[Scene_Map,sc=>sc&&sc._chr2sp],
[Scene_Battle,sc=>sc&&sc._btlr2sp],
]), // 0: constructor -> spritesMap
]);

})(); // gameObj2sprite

// ---- ---- ---- ---- performance

(()=>{ let k,r,t;


new cfc(Sprite_Base.prototype).
addBase('updateAnimationSprites',function f(){
	if(this._animationSprites.length){
		const curr=this._animationSprites;
		const isPlayings=[];
		curr.forEach(f.tbl[0],isPlayings);
		if(curr.length!==isPlayings.length) this._animationSprites=isPlayings;
	}
},[
function f(sprite){
	sprite.isPlaying()?this.push(sprite):sprite.remove();
}, // 0: forEach
]).
getP;


new cfc(DataManager).
addRoof('onLoad_after_animation',function f(obj,name,src,msg){
	const rtv=f.ori.apply(this,arguments);
	this.onLoad_trimUnusedAnimationFrames.apply(this,arguments);
	return rtv;
}).
addBase('onLoad_trimUnusedAnimationFrames',function f(obj,name,src,msg){
	obj.forEach(this.onLoad_trimUnusedAnimationFrames1,this);
}).
addBase('onLoad_trimUnusedAnimationFrames1',function f(dataobj,idx,a){
	const frames=dataobj&&dataobj.frames; if(!frames) return;
	let maxAnimationCellsCnt=0;
	for(let x=0,xs=frames.length;x<xs;++x){
		const frame=frames[x];
		const ende=frame.length;
		// trim !(cell[0]>=0)
		let i=0;
		for(let j=0;j<ende;++j){
			if(!(frame[j][0]>=0)) continue;
			frame[i++]=frame[j];
		}
		frame.length=i;
		if(!(maxAnimationCellsCnt>=i)) maxAnimationCellsCnt=i;
	}
	dataobj._maxAnimationCellsCnt=maxAnimationCellsCnt;
	if(!(this._maxAnimationCellsCnt>=maxAnimationCellsCnt)) this._maxAnimationCellsCnt=maxAnimationCellsCnt;
}).
getP;

new cfc(Sprite_Animation.prototype).
addBase('initCellsCnt',function f(){
	// not used
	return DataManager._maxAnimationCellsCnt;
}).
addBase('createCellSprites',function f(cellsCnt){
	const arr=this._cellSprites||(this._cellSprites=[]);
	cellsCnt|=0;
	for(let xs=cellsCnt,x=this._lastUpdatedCellIdxEnd=arr.length;x<xs;++x){
		const sp=new Sprite();
		sp.visible=false;
		sp.anchor.set(0.5);
		arr.push(sp);
		this.addChild(sp);
	}
}).
add('setup',function f(target,ani,mir,dly,opt){
	this._hasFlashSprite=false;
	{ const c=this._screenFlashSprite,p=c&&c.parent; if(p) p.removeChild(c); }
	this.createCellSprites(ani._maxAnimationCellsCnt);
	return f.ori.apply(this,arguments);
}).
addBase('updateAllCellSprites',function f(frame){
	const newIdxEnd=frame.length;
	for(let spv=this._cellSprites,x=Math.max(newIdxEnd,this._lastUpdatedCellIdxEnd);x--;){
		const sp=spv[x];
		if(x<newIdxEnd) this.updateCellSprite(sp, frame[x]);
		else sp.visible=false;
	}
	this._lastUpdatedCellIdxEnd=newIdxEnd;
}).
addBase('createScreenFlashSprite',function f(){
	this._hasFlashSprite=true;
}).
addBase('startScreenFlash',function f(color,duration){
	this._screenFlashDuration=duration;
	if(!this._hasFlashSprite) return;
	if(!this._screenFlashSprite) this.addChild(this._screenFlashSprite=new ScreenSprite());
	this._screenFlashSprite.setColor(color[0],color[1],color[2]);
	this._screenFlashSprite.opacity=color[3];
}).
addBase('processTimingData',function f(timing){
	const func=f.tbl[0][timing.flashScope]; if(func) func.apply(this,arguments);
	if(timing.se) AudioManager.playSe(timing.se);
},[
[
undefined, // 0-0
function f(timing){
	this.startFlash(
		timing.flashColor,
		timing.flashDuration*this._rate,
	);
}, // 0-1
function f(timing){
	this.startScreenFlash(
		timing.flashColor,
		timing.flashDuration*this._rate,
	);
}, // 0-2
function f(timing){
	this.startHiding(
		timing.flashDuration*this._rate,
	);
}, // 0-3
], // 0: cases
]).
addBase('updateFrame_getByFrmIdx',function f(timings){
	let rtv=timings._byFrameIdx;
	if(!rtv){
		rtv=timings._byFrameIdx=[];
		for(let x=timings.length;x--;){
			const tm=timings[x];
			(rtv[tm.frame]||(rtv[tm.frame]=[])).push(tm);
		}
	}
	return rtv;
}).
addBase('updateFrame',function f(){
	if(!(0<this._duration)) return;
	const frameIndex=this.currentFrameIndex();
	this.updateAllCellSprites(this._animation.frames[frameIndex]);
	const arr=this.updateFrame_getByFrmIdx(this._animation.timings)[frameIndex]; // reverse order
	for(let x=arr&&arr.length;x--;) this.processTimingData(arr[x]);
}).
getP;


new cfc(Window.prototype).
addBase('_refreshCursor_borderSize',function f(d){
	return 4;
}).
addBase('_refreshCursor',function f(useThisSprite){
	useThisSprite=useThisSprite||this._windowCursorSprite;
	const pad=this._padding;
	// setting
	const sx=this._cursorRect.x+pad-this.origin.x;
	const sy=this._cursorRect.y+pad-this.origin.y;
	const sw=this._cursorRect.width;
	const sh=this._cursorRect.height;
	const m=this._refreshCursor_borderSize();
	// crop
	const x0=Math.max(sx,pad);
	const y0=Math.max(sy,pad);
	const x1=Math.min(sx+sw,this._width  -pad);
	const y1=Math.min(sy+sh,this._height -pad);
	if(0<sw&&0<sh) useThisSprite.scale.set(1);
	else{
		useThisSprite.scale.set(0);
		return;
	}
	//const bitmap=new Bitmap(sw,sh);
	this._refreshCursor_createBmpIfNotExists(useThisSprite);
	
	const edgeW=useThisSprite._cursorEdgeSizes.left + useThisSprite._cursorEdgeSizes.right;
	const edgeH=useThisSprite._cursorEdgeSizes.top  + useThisSprite._cursorEdgeSizes.bottom;
	const midSprite=useThisSprite._cursorSprites[0];
	if(true||sw>=edgeW){
		const _w=Math.max(sw-edgeW,0)||0;
		const r=_w/midSprite.bitmap.width;
		midSprite.scale.x=r;
		useThisSprite._cursorSprites[4].scale.x=r;
		useThisSprite._cursorSprites[8].scale.x=r;
		
		for(let i=4;--i;) useThisSprite._cursorSprites[i].x=0;
		for(let i=8;i>=0;i-=4) useThisSprite._cursorSprites[i].x=useThisSprite._cursorEdgeSizes.left;
		for(let i=8;--i>=5;) useThisSprite._cursorSprites[i].x=useThisSprite._cursorEdgeSizes.left+_w;
	}else{
		// TODO
	}
	if(true||sh>=edgeH){
		const _h=Math.max(sh-edgeH,0)||0;
		const r=_h/midSprite.bitmap.height;
		midSprite.scale.y=r;
		useThisSprite._cursorSprites[2].scale.y=r;
		useThisSprite._cursorSprites[6].scale.y=r;
		
		for(let arr=f.tbl[0],i=arr.length;i--;) useThisSprite._cursorSprites[arr[i]].y=0;
		for(let arr=f.tbl[1],i=arr.length;i--;) useThisSprite._cursorSprites[arr[i]].y=useThisSprite._cursorEdgeSizes.top;
		for(let i=6;--i>=3;) useThisSprite._cursorSprites[i].y=useThisSprite._cursorEdgeSizes.top+_h;
	}else{
		// TODO
	}
	useThisSprite.setFrame(0,0,sw,sh);
	useThisSprite.move(sx,sy);
	//return;
	const fx1=sx<x0,fx2=x1<sx+sw;
	const fy1=sy<y0,fy2=y1<sy+sh;
	for(let i=9;i--;){
		const sp=useThisSprite._cursorSprites[i];
		sp._x0=sp.x;
		sp._y0=sp.y;
	}
	if(fx1||fx2||fy1||fy2){
		for(let i=9;i--;){
			const sp=useThisSprite._cursorSprites[i];
			const s=sp.scale;
			const bmp=sp.bitmap;
			const x0i=sp._x0+sx,x1i=x0i+Math.round(bmp.width*s.x);
			const y0i=sp._y0+sy,y1i=y0i+Math.round(bmp.height*s.y);
			//let fx=0,fw=bmp.width;
			//let fy=0,fh=bmp.height;
			if(x0i>=x1||x0>=x1i){
				sp.setFrame(0,0,0,bmp.height);
				sp.refresh_do();
				continue;
			}
			if(y0i>=y1||y0>=y1i){
				sp.setFrame(0,0,bmp.width,0);
				sp.refresh_do();
				continue;
			}
			const fx=Math.max(x0-x0i,0);
			const fy=Math.max(y0-y0i,0);
			const dw=(-Math.max(x1i-x1,0)-fx)/s.x;
			const dh=(-Math.max(y1i-y1,0)-fy)/s.y;
			const fw=bmp.width  +Math.round(dw); // seems good
			const fh=bmp.height +Math.round(dh); // seems good
			sp.setFrame(fx,fy,fw,fh);
			sp.move(x0i-sx+fx,y0i-sy+fy);
		}
	}else{
		for(let i=9;i--;){
			const sp=useThisSprite._cursorSprites[i];
			const bmp=sp.bitmap;
			sp.setFrame(0,0,bmp.width,bmp.height);
			sp.move(sp._x0,sp._y0);
		}
	}
},[
[1,7,8], // 0: sh>=edgeH row 0
[2,0,6], // 1: sh>=edgeH row 1
]).
addBase('_refreshCursor_createBmpIfNotExists',function f(cursorSprite){
	const skin=this._windowskin;
	if(cursorSprite._cursorSprites||!skin) return;
	const arr=cursorSprite._cursorSprites=[];
	const edgeSizes=cursorSprite._cursorEdgeSizes={
		top:this._refreshCursor_borderSize('u'),
		left:this._refreshCursor_borderSize('l'),
		right:this._refreshCursor_borderSize('r'),
		bottom:this._refreshCursor_borderSize('d'),
		all:[48,48], // referenced image region size
		offset:[96,96], // referenced image region x,y
	};
	
/*
	1	8	7
	2	0	6
	3	4	5
*/
	const ws=[edgeSizes.left,edgeSizes.all[0],edgeSizes.right]; ws[1]-=ws[0]+ws[2]; // widths of left to right
	const hs=[edgeSizes.top,edgeSizes.all[1],edgeSizes.bottom]; hs[1]-=hs[0]+hs[2]; // heights of top to bottom
	// transform to prefix sum
	for(let i=1,sz=ws.length;i<sz;++i) ws[i]+=ws[i-1];
	for(let i=1,sz=hs.length;i<sz;++i) hs[i]+=hs[i-1];
	const confs=[
		// x,y,w,h
		[ws[0],hs[0],ws[1]-ws[0],hs[1]-hs[0]],  	 // 0
		[0,0,ws[0]-0,hs[0]-0],                  	 // 1
		[0,hs[0],ws[0],hs[1]-hs[0]],            	 // 2
		[0,hs[1],ws[0],hs[2]-hs[1]],            	 // 3
		[ws[0],hs[1],ws[1]-ws[0],hs[2]-hs[1]],  	 // 4
		[ws[1],hs[1],ws[2]-ws[1],hs[2]-hs[1]],  	 // 5
		[ws[1],hs[0],ws[2]-ws[1],hs[1]-hs[0]],  	 // 6
		[ws[1],0,ws[2]-ws[1],hs[0]-0],          	 // 7
		[ws[0],0,ws[1]-ws[0],hs[0]-0],          	 // 8
	];
	
	let sp,bmp,x,y,w,h;
	for(let i=confs.length;i--;){
		x=confs[i][0];
		y=confs[i][1];
		w=confs[i][2];
		h=confs[i][3];
		arr[i]=sp=new Sprite(bmp=new Bitmap(w,h));
		bmp.blt(skin,
			x+edgeSizes.offset[0],y+edgeSizes.offset[1],w,h,
			0,0,w,h,
		);
		cursorSprite.addChild(sp);
		sp.move(x,y);
	}
}).
getP;


new cfc(Window_Base.prototype).
addBase('loadWindowskin',function f(){
	// textColor reads pixel frequently
	const bmp=ImageManager.loadSystem('Window');
	bmp._willReadFrequently=true;
	this.windowskin=bmp;
	return bmp;
}).
getP;

new cfc(Bitmap.prototype).
addBase('getCtxSettings',function f(){
	const rtv={};
	if(this._willReadFrequently) rtv.willReadFrequently=true;
	return rtv;
}).
addBase('_createCanvas',function(width, height){
	this.__canvas  =this.__canvas||document.createElement('canvas');
	this.__context =this.__canvas.getContext('2d',this.getCtxSettings());
	
	this.__canvas.width  = Math.max(width  ||0,1);
	this.__canvas.height = Math.max(height ||0,1);
	
	if(this._image){
		const w=Math.max(this._image.width  ||0,1);
		const h=Math.max(this._image.height ||0,1);
		this.__canvas.width  =w;
		this.__canvas.height =h;
		this._createBaseTexture(this._canvas);

		this.__context.drawImage(this._image,0,0);
	}
	
	this._setDirty();
}).
getP;


if(0){
// since 'this._loadListeners' will not be long enough to reduce performance consumption by this, not using this.
new cfc(Bitmap.prototype).add('initialize',function f(w,h){
	const rtv=f.ori.apply(this,arguments);
	if(!(this._loadListeners instanceof Queue)) this._loadListeners=new Queue(this._loadListeners);
	return rtv;
});
}else{
new cfc(Bitmap.prototype).add('initialize',function f(w,h){
	const rtv=f.ori.apply(this,arguments);
	this._loadListeners_strt=0;
	return rtv;
}).addBase('_callLoadListeners',function f(){
	while(this._loadListeners_strt<this._loadListeners.length){
		const listener=this._loadListeners[this._loadListeners_strt++];
		// for handling while{try..catch}, strt must ++.
		listener(this);
	}
	this._loadListeners.length=this._loadListeners_strt=0;
});
}


new cfc(Window_EquipItem.prototype).
add('updateHelp',function f(){
	return f.ori.apply(this,arguments);
	if(this._lastUpdateHelpInfo_select===this._index&&this._lastUpdateHelpInfo_actor===this._actor) return;
	this._lastUpdateHelpInfo_select=this._index;
	this._lastUpdateHelpInfo_actor=this._actor;
	return f.ori.apply(this,arguments);
}).
getP;


{ const p=Game_Action.prototype;
new cfc(p).
addBase('_itemEffectRecoverHp',function f(target,effect){
	return this.itemEffectRecoverHp.apply(this,arguments);
}).
addBase('_itemEffectRecoverMp',function f(target,effect){
	return this.itemEffectRecoverMp.apply(this,arguments);
}).
addBase('_itemEffectGainTp',function f(target,effect){
	return this.itemEffectGainTp.apply(this,arguments);
}).
addBase('_itemEffectAddState',function f(target,effect){
	return this.itemEffectAddState.apply(this,arguments);
}).
addBase('_itemEffectRemoveState',function f(target,effect){
	return this.itemEffectRemoveState.apply(this,arguments);
}).
addBase('_itemEffectAddBuff',function f(target,effect){
	return this.itemEffectAddBuff.apply(this,arguments);
}).
addBase('_itemEffectAddDebuff',function f(target,effect){
	return this.itemEffectAddDebuff.apply(this,arguments);
}).
addBase('_itemEffectRemoveBuff',function f(target,effect){
	return this.itemEffectRemoveBuff.apply(this,arguments);
}).
addBase('_itemEffectRemoveDebuff',function f(target,effect){
	return this.itemEffectRemoveDebuff.apply(this,arguments);
}).
addBase('_itemEffectSpecial',function f(target,effect){
	return this.itemEffectSpecial.apply(this,arguments);
}).
addBase('_itemEffectGrow',function f(target,effect){
	return this.itemEffectGrow.apply(this,arguments);
}).
addBase('_itemEffectLearnSkill',function f(target,effect){
	return this.itemEffectLearnSkill.apply(this,arguments);
}).
addBase('_itemEffectCommonEvent',function f(target,effect){
	return this.itemEffectCommonEvent.apply(this,arguments);
}).
addBase('applyItemEffect',function f(target,effect){
	if(!effect) return;
	const func=f.tbl[0].get(effect.code);
	if(func) func.apply(this,arguments);
	else if(f.tbl[1]) console.warn("[WARNING] Game_Action.prototype.applyItemEffect: using un-handled effect code");
},t=[
new Map([
	[Game_Action.EFFECT_RECOVER_HP,p._itemEffectRecoverHp],
	[Game_Action.EFFECT_RECOVER_MP,p._itemEffectRecoverMp],
	[Game_Action.EFFECT_GAIN_TP   ,p._itemEffectGainTp   ],
	[Game_Action.EFFECT_ADD_STATE   ,p._itemEffectAddState   ],
	[Game_Action.EFFECT_REMOVE_STATE,p._itemEffectRemoveState],
	[Game_Action.EFFECT_ADD_BUFF     ,p._itemEffectAddBuff     ],
	[Game_Action.EFFECT_ADD_DEBUFF   ,p._itemEffectAddDebuff   ],
	[Game_Action.EFFECT_REMOVE_BUFF  ,p._itemEffectRemoveBuff  ],
	[Game_Action.EFFECT_REMOVE_DEBUFF,p._itemEffectRemoveDebuff],
	[Game_Action.EFFECT_SPECIAL,p._itemEffectSpecial],
	[Game_Action.EFFECT_GROW       ,p._itemEffectGrow      ],
	[Game_Action.EFFECT_LEARN_SKILL,p._itemEffectLearnSkill],
	[Game_Action.EFFECT_COMMON_EVENT,p._itemEffectCommonEvent],
]), // 0: tbl
window.isTest(), // 1: isTest
]).
getP;
}


new cfc(Game_Action.prototype).
addBase('isMagicSkill',function() {
	const item=this.item();
	return $dataSystem.magicSkills.uniqueHas(item&&item.stypeId);
}).
getP;


new cfc(Game_Enemy.prototype).
addBase('makeDropItems',function f(){
	return this.enemy().dropItems.reduce(f.tbl[0].bind(this),[]);
},[
function(r,di){
	if(di.kind>0&&Math.random()*di.denominator<this.dropItemRate()) r.push(this.itemObject(di.kind, di.dataId));
	return r;
}, // 0: reduce
]);


new cfc(Game_Actor.prototype).
addBase('isEquipped',function f(item){
	return this._equipsTbl_has(item);
}).
getP;


})(); // performance

// ---- ---- ---- ---- shorthand

(()=>{ let k,r,t;

window.addEnum=window.addEnum||function(key,isShouldRenew){
	if(!isShouldRenew&&this[key]) return;
	this._enumMax|=0;
	this[key]=++this._enumMax;
	return this;
};
const initAddEnum=obj=>{
	obj._enumMax=obj._enumMax>=404?obj._enumMax:404;
	obj.addEnum=window.addEnum;
};

initAddEnum(Game_BattlerBase);

t=[
({
2:4,
4:8,
8:6,
6:2,
}), // 0: rightPos remap
({
'f':{
2:2,
4:4,
6:6,
8:8,
}, // 1-f
'b':{
2:8,
4:6,
6:4,
8:2,
}, // 1-b
'l':{
2:6,
4:2,
6:8,
8:4,
}, // 1-l
'r':{
2:4,
4:8,
6:2,
8:6,
}, // 1-r
}), // 1: facingAfterJump
];

new cfc(Game_Character.prototype).addBase('jumpTo',function f(x,y,facingAfterJump){
	const d=this.direction();
	this.jump(x-this.x,y-this.y);
	this._jump_remapDir_facingAfterJump(d,facingAfterJump);
	return this;
},t).addBase('frontPos',function f(xy,y,isNoRounded){
	let x;
	if(typeof xy==='number') x=xy;
	else if(xy){ x=xy.x; y=xy.y; }
	else{ x=this.x; y=this.y; }
	const d=this.direction();
	return isNoRounded?({
		x:$gameMap.xWithDirection(x,d),
		y:$gameMap.yWithDirection(y,d),
	}):({
		x:$gameMap.roundXWithDirection(x,d),
		y:$gameMap.roundYWithDirection(y,d),
	});
}).addBase('frontPos_r',function f(){
	const rtv=this.frontPos(this._realX,this._realY);
	rtv._realX=rtv.x;
	rtv._realY=rtv.y;
	return rtv;
}).addBase('rightPos',function f(xy,y,isNoRounded){
	let x;
	if(typeof xy==='number') x=xy;
	else if(xy){ x=xy.x; y=xy.y; }
	else{ x=this.x; y=this.y; }
	const d=this.rightPos_dirRemap(this.direction());
	return isNoRounded?({
		x:$gameMap.xWithDirection(x,d),
		y:$gameMap.yWithDirection(y,d),
	}):({
		x:$gameMap.roundXWithDirection(x,d),
		y:$gameMap.roundYWithDirection(y,d),
	});
}).addBase('rightPos_r',function f(){
	const rtv=this.rightPos(this._realX,this._realY);
	rtv._realX=rtv.x;
	rtv._realY=rtv.y;
	return rtv;
}).addBase('rightPos_dirRemap',function f(d){
	return f.tbl[0][d]||d;
},t).addBase('jumpFront',function f(dist,facingAfterJump){
	let dx=0,dy=0;
	if((dist|=0)){
		const xy=this.frontPos();
		dx+=(xy.x-this.x)*dist;
		dy+=(xy.y-this.y)*dist;
	}
	const d=this.direction();
	this.jump(dx,dy);
	this._jump_remapDir_facingAfterJump(d,facingAfterJump);
	return this;
},t).addBase('jumpFacingRelative',function f(leftRight,backFront,facingAfterJump,refChr){
	// -+ , -+
	let dx=0,dy=0;
	const ref=refChr||this;
	if((leftRight|=0)){
		const xy=ref.rightPos();
		dx+=(xy.x-ref.x)*leftRight;
		dy+=(xy.y-ref.y)*leftRight;
	}
	if((backFront|=0)){
		const xy=ref.frontPos();
		dx+=(xy.x-ref.x)*backFront;
		dy+=(xy.y-ref.y)*backFront;
	}
	const d=this.direction();
	this.jumpTo(dx+ref.x,dy+ref.y);
	this._jump_remapDir_facingAfterJump(d,facingAfterJump);
	return this;
},t).addBase('_jump_remapDir_facingAfterJump',function f(d,facingAfterJump){
	if(facingAfterJump in f.tbl[1]) this._direction=f.tbl[1][facingAfterJump][d];
	else if(facingAfterJump in f.tbl[0]) this._direction=facingAfterJump;
},t);

new cfc(Game_Character.prototype).addBase('getTileIdAt',function f(dx,dy,z){
	dx=dx-0||0;
	dy=dy-0||0;
	z=z-0||0;
	return $gameMap&&$gameMap.tileId(this.x+dx,this.y+dy,z);
}).addBase('getLayeredTilesAt',function f(dx,dy){
	dx=dx-0||0;
	dy=dy-0||0;
	z=z-0||0;
	return $gameMap&&$gameMap.layeredTiles(this.x+dx,this.y+dy);
});

new cfc(Game_CharacterBase.prototype).add('setOpacity',function f(opa){
	f.ori.apply(this,arguments);
	return this;
},undefined,true).add('initMembers',function f(){
	const rtv=f.ori.apply(this,arguments);
	this._characteHue=0;
	return rtv;
}).addBase('characterHue',function f(){
	return this._characterHue||0;
});

t=new cfc(Game_Event.prototype).addBase('setChrIdxName',function f(chrIdx,chrName,hue,isObj){
	this._characterIndex=chrIdx===undefined?this._characterIndex:chrIdx;
	this._characterName=chrName===undefined?this._characterName:chrName;
	this._characterHue=hue||0;
	this._isObjectCharacter=isObj===undefined?ImageManager.isObjectCharacter(this._characterName):isObj;
	return this;
}).add('setupPageSettings',function f(){
	const rtv=this.page();
	f.ori.apply(this,arguments);
	return rtv;
},undefined,true).add('locate',function f(x,y){
	f.ori.apply(this,arguments);
	return this;
},undefined,true).getP();
for(let p=t,arr=['clearPageSettings','clearStartingFlag','erase','refresh','resetPattern','setupPage','start',],x=arr.length;x--;) new cfc(p).add(arr[x],function f(){
	f.ori.apply(this,arguments);
	return this;
},undefined,true);

new cfc(Game_Interpreter.prototype).addBase('getEvt',function f(){
	// map init ensures '_events' be Array
	return $gameMap&&$gameMap._events[this._eventId];
}).addBase('getCmd',function f(offset){
	offset|=0;
	return this._list&&this._list[this._index+offset];
});

SceneManager.getTilemap=function(){
	const sc=this._scene;
	const sps=sc&&sc._spriteset;
	return sps&&sps._tilemap;
};

new cfc(DataManager).addBase('getItemCont',function f(key){
	if(!f.tbl[0]) f.tbl[0]=({
		i:$dataItems,
		w:$dataWeapons,
		a:$dataArmors,
	});
	return f.tbl[0][key];
},[
undefined,
]);

ImageManager.getLoadStates=function f(){
	const rtv=[];
	const cache=this._imageCache; if(!cache) return rtv;
	for(let arr=Object.keys(cache._items),x=arr.length;x--;) rtv.push([arr[x],cache._items[arr[x]].bitmap.isReady(),]);
	return rtv;
};

new cfc(Sprite.prototype).addBase('setFrameIdx',function f(idx,facing,patternIt,isBig){
	if(patternIt===undefined) patternIt=1;
	facing=f.tbl[0][facing]; if(facing===undefined) facing=1;
	
	this.setFrameIdx_info={
		idx:idx,
		patternIt:patternIt,
		facingIdx:facing,
		isBig:isBig,
	};
	this.setFrameIdx_update();
},[
{
2:0,
4:1,
6:2,
8:3,
}, // 0: facing to idx
]).addBase('setFrameIdx_update',function f(){
	this.bitmap.addLoadListener(this.setFrameIdx_do.bind(this));
}).addBase('setFrameIdx_do',function f(bmp){
	const info=this.setFrameIdx_info; if(!info) return;
	//this.setFrameIdx_info=undefined;
	const p=Sprite_Character.prototype;
	const w=p.patternWidth.call(this);
	const h=p.patternHeight.call(this);
	const nSetsEachRow=f.tbl[0][0|!info.isBig];
	const nFramesEachCol=f.tbl[1][0|!info.isBig];
	const nFramesEachRow=nSetsEachRow*f.tbl[2];
	const idxX=(info.idx%nSetsEachRow)*f.tbl[2]+f.tbl[4][info.patternIt|0];
	const idxY=~~(info.idx/nSetsEachRow)*f.tbl[3]+info.facingIdx;
	const px0=~~(bmp.width  * idxX/nFramesEachRow),px1=~~(bmp.width  * (idxX+1)/nFramesEachRow);
	const py0=~~(bmp.height * idxY/nFramesEachCol),py1=~~(bmp.height * (idxY+1)/nFramesEachCol);
	
	this.setFrame(px0,py0,px1-px0,py1-py0);
},t=[
[1,4], // 0: N sets in a row // [isBig,notBig]
[4,8], // 1: N frames each col // [isBig,notBig]
3, // 2: N patterns each set in a row
4, // 3: N dirs in a pattern
[0,1,2,1], // 4: patternIt to patternIdx
]).addBase('setFrameIdx_nextPattern',function f(shouldUpdate){
	const info=this.setFrameIdx_info; if(!info) return;
	info.patternIdx=~~((info.patternIdx+1)%f.tbl[4].length);
	if(shouldUpdate) this.setFrameIdx_update();
	return this;
},t);

new cfc(Sprite_Character.prototype).addBase('updateBitmap',function f(){
	if(this.isImageChanged()) this.updateBitmap_do();
}).addBase('updateBitmap_do',function f(){
	this._tilesetId=$gameMap.tilesetId();
	this._tileId=this._character.tileId();
	this._characterName=this._character.characterName();
	this._characterIndex=this._character.characterIndex();
	this._characterHue=this._character.characterHue();
	if(0<this._tileId) this.setTileBitmap();
	else this.setCharacterBitmap();
}).addBase('setCharacterBitmap',function f(){
	this.bitmap=ImageManager.loadCharacter(this._characterName,this._characterHue);
	this._isBigCharacter=ImageManager.isBigCharacter(this._characterName);
}).addBase('tilesetBitmap',function f(tileId){
	const tileset=$gameMap.tileset();
	const setNumber=5+(tileId>>8);
	return ImageManager.loadTileset(tileset.tilesetNames[setNumber],this._characterHue);
}).add('isImageChanged',function f(){
	return f.ori.apply(this,arguments) || this._characterHue!==this._character.characterHue();
});

new cfc(PIXI.Container.prototype).addBase('containsGlobalPoint',function f(x,y){
	const xy0=this.toGlobal(f.tbl[0]);
	const xy1=this.toGlobal({x:this.width,y:this.height});
	const rect=new Rectangle(xy0.x,xy0.y,xy1.x-xy0.x,xy1.y-xy0.y);
	return rect.contains(x,y);
},[
{x:0,y:0},
]).add('getChildIndex',function f(c,isNoErr,returnEndIdxIfNotFound){
	try{
		return f.ori.apply(this,arguments);
	}catch(e){
		if(!isNoErr) throw e;
	}
	return returnEndIfNotFound?this.children.length:-1;
});

new cfc(PIXI.Container.prototype).add('renderCanvas',function f(renderer){
	const noDraw=this.renderCanvas_retVal_noDraw();
	let rtv;
	if((rtv=this.renderCanvas_clipPoints(f.ori,arguments))!==noDraw) return rtv;
	return f.ori.apply(this,arguments);
}).addBase('renderCanvas_retVal_noDraw',function f(){
	return f.tbl[0];
},[
{}, // 0: ret
]).addBase('renderCanvas_clipPoints',function f(renderFunc,argv){
	const points=this._clipPointExtWidth-0?getWiderPoints(this._clipPoints,this._clipPointExtWidth):this._clipPoints;
	const renderer=argv[0]; if(!renderer||!points||!(points.length>=3)||!this.parent) return this.renderCanvas_retVal_noDraw();
	const ctx=renderer.context;
	const t=ctx.getTransform();
	ctx.save(); // save before clipping
	//ctx.imageSmoothingEnabled=true; // slow
	ctx.setTransform(1,0,0,1,0,0);
	ctx.beginPath();
	for(let i=0,sz=points.length;i<sz;++i){
		const p=this.parent?this.parent.toGlobal({x:points[i][0],y:points[i][1],}):({x:points[i][0],y:points[i][1],});
		if(i) ctx.lineTo(p.x,p.y);
		else ctx.moveTo(p.x,p.y);
	}
	ctx.clip();
	ctx.setTransform(t.a,t.b,t.c,t.d,t.e,t.f);
	const rtv=renderFunc.apply(this,argv);
	ctx.restore(); // restore clipping
	return rtv;
}).addBase('setClipPoints',function f(points,extWidth){
	this._clipPointExtWidth=extWidth-0||0;
	return this._clipPoints=points; // this.parent view
});
new cfc(Sprite.prototype).add('initialize',function f(){
	const rtv=f.ori.apply(this,arguments);
	this._clipPoints=undefined;
	return rtv;
});

new cfc(Game_Item.prototype).addBase('getItemKeyInfo',function f(){
	return [(this._dataClass?this._dataClass[0]:"_"),this._itemId];
}).addBase('getItemKey',function f(){
	return this.getItemKeyInfo().join(f.tbl[0]);
},t=[
":",
]);
new cfc(Game_Item).addBase('itemKeyInfoToDataobj',function f(itemKeyInfo){
	if(!itemKeyInfo) return false;
	if(!f.tbl[0]){ f.tbl[0]={
		i:$dataItems,
		w:$dataWeapons,
		a:$dataArmors,
	}; }
	const cont=f.tbl[0][itemKeyInfo[0]];
	return cont&&cont[itemKeyInfo[1]];
},[
undefined,
]).addBase('itemKeyToDataobj',function f(itemKey){
	return this.itemKeyInfoToDataobj(itemKey&&itemKey.split(f.tbl[0]));
},t);

new cfc(Window_Command.prototype).addBase('commandExt',function f(idx){
	const cmd=this._list&&this._list[idx];
	return cmd&&cmd.ext;
});

new cfc(Window_ItemList.prototype).addBase('drawItemNumber',function f(item, x, y, width){
	if(this.needsNumber()) this.drawItemNumber_num(item,x,y,width,$gameParty.numItems(item));
}).addBase('drawItemNumber_num',function f(item,x,y,width,num){
	const digitsWidth=this.textWidth('0'.repeat(this.drawItemNumber_getReservedDigitsCnt()));
	this.drawText(':',x,y,width-digitsWidth,'right');
	this.drawText(num+'',x+width-digitsWidth,y,digitsWidth,'right');
}).addBase('drawItemNumber_getReservedDigitsCnt',function f(){
	return f.tbl[0];
},[
4,
]).
addBase('numberMaxWidth_getSampleText',function f(){
	if(!f.tbl[0]) f.tbl[0]=":"+'0'.repeat(this.drawItemNumber_getReservedDigitsCnt());
	return f.tbl[0];
},[
undefined, // 0: reserved for text
]).
addBase('numberMaxWidth',function f(item,rect){
	return this.textWidth(this.numberMaxWidth_getSampleText());
}).
addBase('drawItem',function f(idx){
	this.drawItemByIndex(idx);
}).addBase('drawItemByIndex',function f(idx){
	const item=this._data[idx];
	if(item) this.drawItemByItemAndRect(item,this.itemRect(idx));
}).addBase('drawItemByItemAndRect',function f(item,rect){
	const numberWidth=this.numberMaxWidth(item,rect);
	rect.width-=this.textPadding();
	this.changePaintOpacity(this.isEnabled(item));
	this.drawItemName(item, rect.x, rect.y, rect.width - numberWidth);
	this.drawItemNumber(item, rect.x, rect.y, rect.width);
	this.changePaintOpacity(1);
});

new cfc(Game_Battler.prototype).addBase('getParty',function f(){
	const func=f.tbl[0].get(this.constructor);
	return func&&func();
},[
new Map([
[Game_Enemy,()=>$gameTroop,],
[Game_Actor,()=>$gameParty,],
]), // 0: 
]);

new cfc(Bitmap.prototype).addBase('mirror_h',function f(forceRegen){
	if(!this.isReady()) return;
	return this._mirror_h_do(forceRegen);
}).addBase('_mirror_h_do',function f(forceRegen){
	if(!forceRegen&&this._mirrorBmp_h) return this._mirrorBmp_h;
	const rtv=new Bitmap(1,1);
	const w=this.width,h=this.height;
	rtv.resize(w,h);
	rtv.clear();
	rtv.bltImage({width:w,height:h,_image:this._canvas.mirror_h()},0,0,w,h,0,0,w,h);
	rtv._loadingState='loaded';
	return this._mirrorBmp_h=rtv;
}).addBase('mirror_v',function f(forceRegen){
	if(!this.isReady()) return;
	return this._mirror_v_do(forceRegen);
}).addBase('_mirror_v_do',function f(forceRegen){
	if(!forceRegen&&this._mirrorBmp_v) return this._mirrorBmp_v;
	const rtv=new Bitmap(1,1);
	const w=this.width,h=this.height;
	rtv.resize(w,h);
	rtv.clear();
	rtv.bltImage({width:w,height:h,_image:this._canvas.mirror_v()},0,0,w,h,0,0,w,h);
	rtv._loadingState='loaded';
	return this._mirrorBmp_v=rtv;
});


new cfc(Window_Base.prototype).addBase('duplicateTextState',function(textState,assignProperties){
	const rtv=Object.assign({},textState,assignProperties);
	const stk=this.getPrevTextInfoStack(rtv); if(stk&&stk===this.getPrevTextInfoStack(textState)) this.setPrevTextInfoStack(rtv,stk.slice());
	return rtv;
});


})(); // shorthand

// ---- ---- ---- ---- 支援前場景暫存恢復+確保下個場景要預讀(in initialize)的東西好了 // ImageManager.isReady()

(()=>{ let k,r,t;

new cfc(SceneManager).addBase('push',function f(sceneClass,shouldRecordCurrentScene){
	this._stack.push(this._scene.constructor);
	this.goto(sceneClass,shouldRecordCurrentScene);
	if(shouldRecordCurrentScene && this._nextScene) this._nextScene._prevScene=this._scene;
	return this._nextScene && this._nextScene._prevScene;
}).addBase('changeScene',function f(){
	if(this.changeScene_condOk()){
		this.changeScene_do_before();
		this.changeScene_do();
		this.changeScene_do_after();
	}
}).addBase('changeScene_condOk',function f(){
	return this.isSceneChanging() && !this.isCurrentSceneBusy() && ImageManager.isReady();
}).addBase('changeScene_do_before',none,
).addBase('changeScene_do_after',none,
).addBase('changeScene_do',function f(){
	let recordedPrevScene;
	if(this._scene){
		if(!this._nextScene||!this._nextScene._prevScene){
			this._scene.terminate_before();
			this._scene.terminate();
			this._scene.terminate_after();
			this._scene.detachReservation();
		}
		this._previousClass = this._scene.constructor;
		recordedPrevScene = this._scene._prevScene;
	}
	if(recordedPrevScene && this._nextScene && recordedPrevScene.constructor===this._nextScene.constructor){
		this._nextScene = null;
		(this._scene=recordedPrevScene)._active=true;
	}else{
		this._scene = this._nextScene;
		if(this._scene){
			this._scene.attachReservation();
			this._scene.create();
			this._nextScene = null;
			this._sceneStarted = false;
			this.onSceneCreate();
		}
	}
	if(this._exiting){
		if(f.tbl[0]){
			--f.tbl[0];
			this.terminate();
		}
	}
},[
3, // max call count of 'this.terminate();'
]).add('changeScene',function f(){
	const sc=this._scene;
	const rtv=f.ori.apply(this,arguments);
	if(this._scene && sc && this._scene!==sc && this.onSceneChange) this.onSceneChange();
	return rtv;
});

})(); // 支援前場景暫存恢復+確保下個場景要預讀(in initialize)的東西好了 // ImageManager.isReady()

// ---- ---- ---- ---- scene.start before/after

new cfc(Scene_Base.prototype).addBase('start_after',none,
).addBase('start_before',none,
);

new cfc(Scene_Boot.prototype).addBase('start_after',function f(){
	// TBD
	// next scene might be: test battle, test map
	// ALL $data* and its elements should not be changed
	// only creating search tables here
	return Scene_Base.prototype.start_after.apply(this,arguments);
}).addBase('start_before',function f(){
	// TBD
	// change contents of elelments in $data* 
	// change $data* 
	const rtv=Scene_Base.prototype.start_before.apply(this,arguments);
	this.modData();
	this.createSearchTables(true);
	return rtv;
}).addBase('createSearchTables',function f(isRegenAll){
	// consider some data is changed after last call
	// TODO
}).addBase('modData',function f(){
	this.modItems();
	this.modTraits();
	this.modEffects(); // consider passive skill traits referrer to a state 
	this.modEquipments();
	this.modDescriptions();
	this.modAll();
}).addBase('modTraits',function f(){
	// order: editor menu
	$dataActors  .forEach(this.modTrait1.bind(this));
	$dataClasses .forEach(this.modTrait1.bind(this));
	//$dataSkills  .forEach(this.modTrait1.bind(this));
	//$dataItems   .forEach(this.modTrait1.bind(this));
	$dataWeapons .forEach(this.modTrait1.bind(this));
	$dataArmors  .forEach(this.modTrait1.bind(this));
	$dataEnemies .forEach(this.modTrait1.bind(this));
	$dataTroops  .forEach(this.modTrait1.bind(this));
	$dataStates  .forEach(this.modTrait1.bind(this));
}).
addBase('modTrait1',none).
addBase('modEffects',function f(){
	// order: editor menu
	$dataSkills  .forEach(this.modEffect1.bind(this));
	$dataItems   .forEach(this.modEffect1.bind(this));
}).addBase('modEffect1',none).
addBase('modItems',function f(){
	// order: editor menu
	$dataItems   .forEach(this.modItem1.bind(this));
	$dataWeapons .forEach(this.modItem1.bind(this));
	$dataArmors  .forEach(this.modItem1.bind(this));
}).
addBase('modItem1',none).
addBase('modEquipments',function f(){
	// order: editor menu
	$dataWeapons .forEach(this.modEquipment1.bind(this));
	$dataArmors  .forEach(this.modEquipment1.bind(this));
}).
addBase('modEquipment1',none).
addBase('modDescriptions',function f(){
	// order: editor menu
	$dataSkills  .forEach(this.modDescription1.bind(this));
	$dataItems   .forEach(this.modDescription1.bind(this));
	$dataWeapons .forEach(this.modDescription1.bind(this));
	$dataArmors  .forEach(this.modDescription1.bind(this));
}).
addBase('modDescription1',none).
addBase('modAll',function f(){
	// order: editor menu
	$dataActors  .forEach(this.modAll1.bind(this));
	$dataClasses .forEach(this.modAll1.bind(this));
	$dataSkills  .forEach(this.modAll1.bind(this));
	$dataItems   .forEach(this.modAll1.bind(this));
	$dataWeapons .forEach(this.modAll1.bind(this));
	$dataArmors  .forEach(this.modAll1.bind(this));
	$dataEnemies .forEach(this.modAll1.bind(this));
	$dataTroops  .forEach(this.modAll1.bind(this));
	$dataStates  .forEach(this.modAll1.bind(this));
}).
addBase('modAll1',none).
getP;

// ---- ---- ---- ---- scene.terminate before/after + clean scene child

new cfc(Sprite.prototype).add('initialize',function f(){
	const rtv=f.ori.apply(this,arguments);
	this._dontDestroyWhenSceneTerminated=false;
	return rtv;
});

new cfc(Scene_Base.prototype).addBase('terminate_after',function f(){
	if(this.children){ while(this.children.length){
		const currLen=this.children.length;
		const sp=this.children.back;
		if(sp.destroy && !sp._dontDestroyWhenSceneTerminated) sp.destroy();
		// preventing 'sp.destroy' is modified
		if(this.children.back===sp) this.removeChildAt(this.children.length-1);
		else if(this.children.length>=currLen) throw new Error('got new child when terminating');
	} }
}).addBase('terminate_before',none);

new cfc(Scene_Boot.prototype).
addBase('terminate_after',function f(){
	return Scene_Base.prototype.terminate_after.apply(this,arguments);
}).
addBase('terminate_before',function f(){
	return Scene_Base.prototype.terminate_before.apply(this,arguments);
}).
add('terminate_after',function f(){
	DataManager.resetDataarrs();
	return f.ori.apply(this,arguments);
}).
getP;

// ---- ---- ---- ---- refine skill cost

(()=>{ let k,r,t;

const gbb=Game_BattlerBase;
const gbbp=gbb.prototype;

{
const kwStr='hpCostRate';
const kwTrait='TRAIT_'+kwStr;
Game_BattlerBase.addEnum(kwTrait);
Object.defineProperty(gbbp,'hpcr',{
get:function f(){
	return this.traitsPi(kwTrait,0);
},configurable:true,
});
new cfc(Scene_Boot.prototype).add('modTrait1',function f(dataobj,i,arr){
	this.modTrait1_hpCostRate.apply(this,arguments);
	return f.ori.apply(this,arguments);
}).add('modTrait1_hpCostRate',function f(dataobj,i,arr){
	const meta=dataobj&&dataobj.meta,ts=dataobj&&dataobj.traits; if(!meta||!ts) return;
	const n=meta[f.tbl[0]]-0;
	if(!isNaN(n)&&n!==1) ts.push({code:gbb[f.tbl[1]],dataId:0,value:n,});
},[
kwStr,
kwTrait,
]);
}

Object.defineProperty(gbbp,'mpcr',{
get:function f(){
	return this.mcr;
},configurable:true,
});

{
const kwStr='tpCostRate';
const kwTrait='TRAIT_'+kwStr;
Game_BattlerBase.addEnum(kwTrait);
Object.defineProperty(gbbp,'tpcr',{
get:function f(){
	return this.traitsPi(kwTrait,0);
},configurable:true,
});
new cfc(Scene_Boot.prototype).add('modTrait1',function f(dataobj,i,arr){
	this.modTrait1_tpCostRate.apply(this,arguments);
	return f.ori.apply(this,arguments);
}).add('modTrait1_tpCostRate',function f(dataobj,i,arr){
	const meta=dataobj&&dataobj.meta,ts=dataobj&&dataobj.traits; if(!meta||!ts) return;
	const n=meta[f.tbl[0]]-0;
	if(!isNaN(n)&&n!==1) ts.push({code:gbb[f.tbl[1]],dataId:0,value:n,});
},[
kwStr,
kwTrait,
]);
}

new cfc(Game_BattlerBase.prototype).addBase('skillHpCost',function(skill) {
	return ~~(skill.hpCost*this.hpcr);
}).addBase('skillMpCost',function(skill){
	return ~~(skill.mpCost*this.mpcr);
}).addBase('skillTpCost',function(skill){
	return ~~(skill.tpCost*this.tpcr);
});

new cfc(Window_Base.prototype).addBase('hpCostColor',function f(){
	return this.textColor(21);
})

new cfc(Window_SkillList.prototype).addBase('drawSkillCost',function f(skill, x, y, width){
	const actr=this._actor; if(!actr) return;
	const hpCost=actr.skillHpCost(skill);
	const mpCost=actr.skillMpCost(skill);
	const tpCost=actr.skillTpCost(skill);
	const fieldNum=!!hpCost+!!mpCost+!!tpCost; if(!fieldNum) return;
	const sep=Math.ceil(this.textWidth('0'));
	const digitWidth=sep;
	const w=~~((width-(fieldNum-1)*sep)/fieldNum+sep);
	let dx=0;
	if(hpCost){
		this.changeTextColor(this.hpCostColor());
		this.drawText(hpCost, x+dx, y, w-sep, 'right');
		dx+=w;
	}
	if(mpCost){
		this.changeTextColor(this.mpCostColor());
		this.drawText(mpCost, x+dx, y, w-sep, 'right');
		dx+=w;
	}
	if(tpCost){
		this.changeTextColor(this.tpCostColor());
		this.drawText(tpCost, x+dx, y, w-sep, 'right');
		dx+=w;
	}
});

})(); // refine skill cost

// ---- ---- ---- ---- Game_BattlerBase.traitCode2traitKey

new cfc(Scene_Boot.prototype).add('terminate_after',function f(){
	const rtv=f.ori.apply(this,arguments);
	const gbb=Game_BattlerBase;
	let m=Game_BattlerBase.traitCode2traitKey; if(!m) m=Game_BattlerBase.traitCode2traitKey=[];
	for(let x=0,arr=getPrefixPropertyNames(gbb,'TRAIT_'),xs=arr.length;x!==xs;++x) m[Game_BattlerBase[arr[x]]]=arr[x];
	return rtv;
});

// ---- ---- ---- ---- lazy refresh

(()=>{ let k,r,t;

{ const p=SceneManager;
p._needRefreshes_isRefreshing=false;
p.NOT_REFRESHED={};
new cfc(p).add('renderScene',function f(){
	const sc=this._scene;
	const set=sc&&sc._needRefreshes;
	if(set){
		const set2=sc._needRefreshes_notYet=[];
		this._needRefreshes_isRefreshing=true;
		set.slice().forEach(f.tbl[0]);
		this._needRefreshes_isRefreshing=false;
		set.uniqueClear();
		sc._needRefreshes=set2;
	}
	return f.ori.apply(this,arguments);
},[
// sp=>sp.refresh_do()===SceneManager.NOT_REFRESHED && SceneManager._scene._needRefreshes_notYet, // discard if can't refresh
sp=>sp.parent&&sp.refresh_do(),
]).addBase('addRefresh',function f(obj,forcePending){
	if(!obj||(typeof obj.refresh_do!=='function')) return console.warn('got unsupported obj',obj);
	const sc=this._scene; if(!sc) return;
	if(!forcePending&&!f.tbl[0].has(obj.constructor)&&!f.tbl[0].has(obj.parent&&obj.parent.constructor)&&
		// f.tbl[1].has(sc.constructor)
		f.tbl[1]===sc.constructor
		) return obj.refresh_do();
	// added pending during refreshing
	if(this._needRefreshes_isRefreshing) return obj.refresh_do();
	let s=sc._needRefreshes; if(!s) s=sc._needRefreshes=[];
	s.uniquePush(obj);
},[
new Set([
Sprite_Animation,
Sprite_Balloon,
Sprite_Button,
Sprite_Character,
Sprite_Destination,
Sprite_Picture,
Sprite_Timer,
Window_ChoiceList,
Window_EventItem,
Window_Gold,
Window_MapName,
Window_Message,
Window_NumberInput,
Window_ScrollText,
]), // 0: target sprites
Scene_Map, // since only this scene //new Set([Scene_Map,]), // 1: disable pending refresh scenes
]);
}

{ const p=Sprite.prototype;
p.refresh_do=p._refresh;
p._refresh=function f(){ SceneManager.addRefresh(this); };
}

})(); // lazy refresh

// ---- ---- ---- ---- drawMask API

(()=>{ let k,r,t;

(t=function f(){ return this.parent&&f.ori.apply(this,arguments); }).ori=Sprite.prototype.refresh_do;
new cfc(PIXI.Container.prototype).addBase('drawMask_set',function f(x,y,width,height){
	const info={x:x|0,y:y|0,w:width|0,h:height|0};
	const isInvalid=!(info.w>=0)||!(info.h>=0);
	if(Graphics.isWebGL()) return this.drawMask_set_WebGL(info,isInvalid);
	if(isInvalid) return this._drawMask=undefined;
	return this._drawMask=info;
}).addBase('drawMask_set_WebGL',function f(info,isInvalid){
	if(!PIXI.Container._bmp1x1) (PIXI.Container._bmp1x1=new Bitmap(1,1)).fillAll(f.tbl[0]);
	if(this.mask){ this.removeChild(this.mask); this.mask=null; }
	if(this._drawMaskSp) this._drawMaskSp.destroy();
	if(isInvalid) return;
	if(this.parent) this.parent.addChild(this._drawMaskSp=new Sprite(PIXI.Container._bmp1x1));
	const msk=this._drawMaskSp;
	if(this.mask!==msk){
		msk.refresh_do=f.tbl[1];
		this.update_drawMaskSp(msk,info);
		this.mask=msk;
	}
	return this._drawMask=info;
},[
'#FFFFFF',
t,
]).addBase('drawMask_clear',function f(){
	this._drawMask=undefined;
	if(Graphics.isWebGL()) this.drawMask_set_WebGL(undefined,true);
}).add('renderCanvas',function f(renderer){
	return this.renderCanvas_drawMask(f.ori,arguments);
}).addBase('renderCanvas_drawMask',function f(renderFunc,argv){
	const conf=this._drawMask;
	const renderer=argv[0]; if(!renderer||!conf|!this.parent) return renderFunc.apply(this,argv);
	const ctx=renderer.context;
	const p0=this.parent.toGlobal({x:this.x+conf.x,y:this.y+conf.y}),p1=this.parent.toGlobal({x:this.x+conf.x+conf.w,y:this.y+conf.y+conf.h});
	const t=ctx.getTransform();
	ctx.save(); // save before clipping
	ctx.setTransform(1,0,0,1,0,0);
	ctx.beginPath();
	ctx.moveTo(p0.x,p0.y);
	ctx.lineTo(p1.x,p0.y);
	ctx.lineTo(p1.x,p1.y);
	ctx.lineTo(p0.x,p1.y);
	ctx.clip();
	ctx.setTransform(t.a,t.b,t.c,t.d,t.e,t.f);
	const rtv=renderFunc.apply(this,argv);
	ctx.restore(); // restore clipping
	return rtv;
}).addBase('update_drawMaskSp',function f(msk,info){
	msk=msk||this._drawMaskSp;
	info=info||this._drawMask;
	if(!msk||!info) return;
	const anchor=this.anchor;
	const scale=this.scale;
	const W=scale.x*this.width;
	const H=scale.y*this.height;
	msk.position.set(
		this.x+info.x, //-anchor.x*W,
		this.y+info.y, //-anchor.y*H,
	);
	msk.scale.set(
		info.w*scale.x,
		info.h*scale.y,
	);
});
new cfc(Sprite.prototype).add('update',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.update_drawMaskSp();
	return rtv;
}).add('initialize',function f(){
	const rtv=f.ori.apply(this,arguments);
	this._drawMaskSp=undefined;
	return rtv;
});

})(); // drawMask API

// ---- ---- ---- ---- Tilemap / Spriteset

(()=>{ let k,r,t;

new cfc(Tilemap.prototype).addBase('initialize',function(margin) {
	PIXI.Container.call(this);
	
	this._tileWidth = $gameMap?$gameMap.tileWidth():48;
	this._tileHeight = $gameMap?$gameMap.tileHeight():48;
	this._margin = margin||Math.max(this._tileWidth,this._tileHeight)||64;
	this._width = Graphics.width + (this._margin<<1);
	this._height = Graphics.height + (this._margin<<1);
	this._mapWidth = 0;
	this._mapHeight = 0;
	this._mapData = null;
	this._layerWidth = 0;
	this._layerHeight = 0;
	this._lastTiles = [];
	
	/**
	 * The bitmaps used as a tileset.
	 *
	 * @property bitmaps
	 * @type Array
	 */
	this.bitmaps = [];
	
	/**
	 * The origin point of the tilemap for scrolling.
	 *
	 * @property origin
	 * @type Point
	 */
	this.origin = new Point();
	
	/**
	 * The tileset flags.
	 *
	 * @property flags
	 * @type Array
	 */
	this.flags = [];
	
	/**
	 * The animation count for autotiles.
	 *
	 * @property animationCount
	 * @type Number
	 */
	this.animationCount = 0;
	
	/**
	 * Whether the tilemap loops horizontal.
	 *
	 * @property horizontalWrap
	 * @type Boolean
	 */
	this.horizontalWrap = false;
	
	/**
	 * Whether the tilemap loops vertical.
	 *
	 * @property verticalWrap
	 * @type Boolean
	 */
	this.verticalWrap = false;
	
	this._createLayers();
	this.refresh();
});

new cfc(Spriteset_Base.prototype).add('updatePosition',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.updatePosition_CanvasToneChanger();
	return rtv;
}).addBase('updatePosition_CanvasToneChanger',function f(){
	const sp=this._toneSprite; if(sp) sp.position.set(-this.x,-this.y);
});

})(); // Tilemap / Spriteset

// ---- ---- ---- ---- refine Sprite_Animation

(()=>{ let k,r,t;

Sprite_Animation._createdPosition3AnimationsInTheFrame=new Set();

new cfc(SceneManager).add('updateScene',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.createdPosition3AnimationInTheFrame_reset();
	return rtv;
}).addBase('createdPosition3AnimationInTheFrame_reset',function f(){
	Sprite_Animation._createdPosition3AnimationsInTheFrame.clear();
}).addBase('createdPosition3AnimationInTheFrame_add',function f(dataobj){
	if(dataobj&&dataobj.position===3){
		const s=Sprite_Animation._createdPosition3AnimationsInTheFrame;
		const sz=s.size;
		s.add(dataobj);
		return s.size-sz;
	}
	return -1;
}).addBase('createdPosition3AnimationInTheFrame_has',function f(dataobj){
	return Sprite_Animation._createdPosition3AnimationsInTheFrame.has(dataobj);
});

new cfc(Sprite_Animation.prototype).addBase('update',function f(){
	Sprite.prototype.update.call(this);
	this.updateMain();
	this.updateFlash();
	this.updateScreenFlash();
	this.updateHiding();
}).addBase('createSprites',function f(){
	if(SceneManager.createdPosition3AnimationInTheFrame_add(this._animation)){
		this.createCellSprites(); 
		this.createScreenFlashSprite();
	}
	this._duplicated=undefined;
});

})(); // refine Sprite_Animation

// ---- ---- ---- ---- 全域動畫選項

(()=>{ let k,r,t;

t=[
[['rotate',0],['scalex',1],['scaley',1],['delay',0],['drate',0],['onTop',false],],
undefined, // 1: default values // not used
];
t[1]=new Map(t[0]);
new cfc(Game_System.prototype).addBase('animationOptions_get',function f(){
	let rtv=this._aniOpt;
	if(!rtv){
		rtv=this._aniOpt={};
		for(let x=0,arr=f.tbl[0],xs=arr.length;x!==xs;++x) rtv[arr[x][0]]=arr[x][1];
	}
	return rtv;
},t).addBase('animationOptions_reset',function f(){
	const opt=this.animationOptions_get();
	for(let x=0,arr=f.tbl[0],xs=arr.length;x!==xs;++x) opt[arr[x][0]]=arr[x][1];
	return this;
},t).addBase('animationOptions_setRotate',function f(rotate){
	const opt=this.animationOptions_get();
	opt.rotate=rotate;
	return this;
},t).addBase('animationOptions_setScaleX',function f(scalex){
	const opt=this.animationOptions_get();
	opt.scalex=scalex;
	return this;
},t).addBase('animationOptions_setScaleY',function f(scaley){
	const opt=this.animationOptions_get();
	opt.scaley=scaley;
	return this;
},t).addBase('animationOptions_setScale',function f(scale){
	return this.animationOptions_setScaleX(scale).animationOptions_setScaleY(scale);
},t).addBase('animationOptions_setDelay',function f(delay){
	const opt=this.animationOptions_get();
	opt.delay=delay;
	return this;
},t).addBase('animationOptions_setDRate',function f(drate){
	const opt=this.animationOptions_get();
	opt.drate=drate;
	return this;
},t).addBase('animationOptions_setOnTop',function f(onTop){
	const opt=this.animationOptions_get();
	opt.onTop=onTop;
	return this;
},t).addBase('animationOptions_set',function f(newOpt){
	const opt=this.animationOptions_get();
	for(let x=0,arr=f.tbl[0],xs=arr.length;x!==xs;++x) if(arr[x][0] in newOpt) opt[arr[x][0]]=newOpt[arr[x][0]];
	return this;
},t).addBase('animationOptions_applyTo',function f(opt,carryingOn){
	const sysOpt=this.animationOptions_get(),tbl0=f.tbl[0];
	let rotate=0;
	let scalex=1;
	let scaley=1;
	let delay=0;
	let drate=0;
	let onTop=false;
	if((tbl0[0][0] in sysOpt) && sysOpt.rotate!==0) rotate+=sysOpt.rotate;
	if((tbl0[1][0] in sysOpt) && sysOpt.scalex!==1) scalex*=sysOpt.scalex;
	if((tbl0[2][0] in sysOpt) && sysOpt.scaley!==1) scaley*=sysOpt.scaley;
	if((tbl0[3][0] in sysOpt) && sysOpt.delay !==0) delay +=sysOpt.delay;
	if((tbl0[4][0] in sysOpt) && sysOpt.drate !==0) drate +=sysOpt.drate;
	if((tbl0[5][0] in sysOpt) && sysOpt.onTop !==1) onTop  =onTop||sysOpt.onTop;
	if(carryingOn && (tbl0[0][0] in opt)) opt.rotate+=rotate;
	else opt.rotate=rotate;
	if(carryingOn && (tbl0[1][0] in opt)) opt.scalex*=scalex;
	else opt.scalex=scalex;
	if(carryingOn && (tbl0[2][0] in opt)) opt.scaley*=scaley;
	else opt.scaley=scaley;
	if(carryingOn && (tbl0[3][0] in opt)) opt.delay+=delay;
	else opt.delay=delay;
	if(carryingOn && (tbl0[4][0] in opt)) opt.drate+=drate;
	else opt.drate=drate;
	opt.onTop=onTop;
	return this;
},t);


t=[
["custom/Animations/AniNote-",".txt","",],
/^%%%/,
function f(dataobj){ return f.tbl[0][0]+dataobj.id+f.tbl[0][1]; },
function f(dataobj){
	const m=dataobj&&dataobj.name&&dataobj.name.match(f.tbl[1]); if(!m) return;
	ImageManager.otherFiles_addLoad(f.tbl[2](dataobj));
},
function f(dataobj){
	dataobj.note=ImageManager.otherFiles_getData(f.tbl[2](dataobj))||f.tbl[0][2];
	DataManager.extractMetadata(dataobj);
},
['frameRate',], // 5: meta params
];
t.forEach(x=>x&&x.constructor===Function&&(x.tbl=x.ori=t));

new cfc(Scene_Boot.prototype).add('start_before',function f(){
	this.start_before_aniNote();
	return f.ori.apply(this,arguments);
}).addBase('start_before_aniNote',function f(idx){
	if(idx===undefined) $dataAnimations.forEach(f.tbl[3]);
	else if($dataAnimations[idx]) f.tbl[3]($dataAnimations[idx]);
},t);


new cfc(Sprite_Animation.prototype).add('setup',function f(target,ani,mir,dly,opt){
	// delay and rate
	if(ani){
		if(!ani.meta) f.tbl[4](ani);
		arguments[3]=(ani.meta.dly|0)+(dly|0);
		const fr=ani.meta[f.tbl[5][0]]|0;
		if(fr) this._rate=fr;
		this._rate=Math.max(this._rate+(opt.drate|0),1);
	}
	this._opt=opt;
	return f.ori.apply(this,arguments);
},t).addBase('setupRate',none);

new cfc(Game_Character.prototype).addBase('requestAnimation',function f(aniId,opt){
	const sp=this.getSprite(); if(!sp) return;
	const ani=$dataAnimations&&$dataAnimations[aniId]; if(!ani) return;
	this.startAnimation();
	return sp.startAnimation(ani,false,0,opt);
});

new cfc(Sprite_Base.prototype).addBase('startAnimation',function f(ani,mir,dly,opt){
	opt=opt||{};
	$gameSystem.animationOptions_applyTo(opt,true);
	const sp=new Sprite_Animation();
	sp.setup(this._effectTarget,ani,mir,(opt.delay|0)+(dly|0),opt);
	this.parent.addChild(sp);
	this._animationSprites.push(sp);
	
	// opt other than delay and rate
	this.startAnimation_optOthers(opt,sp);
	
	return sp;
}).addBase('startAnimation_optOthers',function f(opt,sp){
	let rotate=0;
	let scalex=1;
	let scaley=1;
	const tbl0=f.tbl[0];
	if(tbl0[0][0] in opt) rotate+=opt.rotate;
	if(tbl0[1][0] in opt) scalex*=opt.scalex;
	if(tbl0[2][0] in opt) scaley*=opt.scaley;
	// fixed effects
	if(rotate) sp.rotation=rotate;
	if(scalex-1||scaley-1) sp.scale.set(scalex,scaley);
	// dynamic effects
},[
Game_System.prototype.animationOptions_get.tbl[0],
]);

})(); // 全域動畫選項

// ---- ---- ---- ---- chr dist

{ const p=Game_Character.prototype;
p.dist1=function(c){
	const dx=this.x-c.x,dy=this.y-c.y;
	return Math.abs(dx)+Math.abs(dy);
};
p.dist1_r=function(c){
	const dx=this._realX-c._realX,dy=this._realY-c._realY;
	return Math.abs(dx)+Math.abs(dy);
};
p.dist2=function(c){
	const dx=this.x-c.x,dy=this.y-c.y;
	return dx*dx+dy*dy;
};
p.dist2_r=function(c){
	const dx=this._realX-c._realX,dy=this._realY-c._realY;
	return dx*dx+dy*dy;
};
} // chr dist

// ---- ---- ---- ---- chr appearance

(()=>{ let k,r,t;

new cfc(Game_CharacterBase.prototype).add('update',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.updateOpacity();
	this.updateScreenXy();
	return rtv;
}).add('initialize',function f(){
	const rtv=f.ori.apply(this,arguments);
	this._screenDx=0;
	this._screenDy=0;
	this._screenDz=0;
	return rtv;
}).add('screenX',function f(){
	return this._screenDx+f.ori.apply(this,arguments);
}).add('screenY',function f(){
	return this._screenDy+f.ori.apply(this,arguments);
}).add('screenZ',function f(){
	return this._screenDz+f.ori.apply(this,arguments);
}).addBase('setScreenXy',function f(dx,dy,dur,sx,sy,){
	if((dur|=0) && 0<dur){ this._screenXyData={
		src:[
			sx===undefined?this._screenDx:sx-this.screenX(),
			sy===undefined?this._screenDy:sy-this.screenY(),
		],
		dst:[dx,dy],
		dur:0,
		durDst:dur,
	}; }else{
		this._screenXyData=undefined;
		this._screenDx=dx|0;
		this._screenDy=dy|0;
	}
	this.updateScreenXy();
}).addBase('updateScreenXy',function f(){
	if(this._screenXyData && this._screenXyData.dur<this._screenXyData.durDst){
		const r=++this._screenXyData.dur/this._screenXyData.durDst; // dur is casted to int32 in 'setScreenXy' 
		this._screenDx=r*(this._screenXyData.dst[0]-this._screenXyData.src[0])+this._screenXyData.src[0];
		this._screenDy=r*(this._screenXyData.dst[1]-this._screenXyData.src[1])+this._screenXyData.src[1];
	}else this._screenXyData=undefined;
}).add('setOpacity',function f(opacity,dur,from){
	const opacity_ori=this._opacity;
	const rtv=f.ori.apply(this,arguments);
	if((dur|=0) && 0<dur){
		this._opacitySrc=from===undefined?opacity_ori:from;
		this._opacityDst=opacity;
		this._opacityDur=0;
	}
	this._opacityDurDst=dur;
	this.updateOpacity();
	return rtv;
}).addBase('updateOpacity',function f(){
	if(this._opacityDur<this._opacityDurDst){
		this._opacity=++this._opacityDur/this._opacityDurDst*(this._opacityDst-this._opacitySrc)+this._opacitySrc; // dur is casted to int32 in 'setOpacity' 
	}else this._opacityDst=this._opacitySrc=this._opacityDur=this._opacityDurDst=undefined;
}).addBase('setPosition',function f(x,y){
	this._x = this._realX = x;
	this._y = this._realY = y;
});

})(); // chr appearance

// ---- ---- ---- ---- ImageManager._loadBitmap

(()=>{ let k,r,t;

{ const p=Game_System.prototype;
k='_bmpRemap_container';
r=p[k]; (p[k]=function f(){
	let arr=this._bmpRemap; if(!arr) arr=this._bmpRemap=[];
	let m=arr._map; if(!m) m=arr._map=new Map(arr.map(f.tbl[0]));
	return arr;
}).ori=r;
p[k].tbl=[
(x,i)=>[x[0],[i,x[1]]],
];
k='bmpRemap_set';
r=p[k]; (p[k]=function f(ori,mapped){
	const arr=this._bmpRemap_container();
	const m=arr._map; // ori -> [idx,mapped,]
	const info=m.get(ori);
	if(mapped){
		// set mapping
		if(info){
			const msg="[WARNING]\n img:\n"+ori+"\n is already mapping to:\n"+(info&&info[1]);
			console.warn(msg);
			alert(msg);
		}
		m.set(ori,[arr.length,mapped,]);
		arr.push([ori,mapped]);
	}else if(info){
		// remove
		if(info[0]!==arr.length){
			// move last to here
			const back=arr[info[0]]=arr.back;
			m.set(back[0],[info[0],back[1],]);
		}
		arr.pop();
		return m.delete(ori);
	}
}).ori=r;
k='bmpRemap_get';
r=p[k]; (p[k]=function f(path){
	const m=this._bmpRemap_container()._map;
	const rtv=m.get(path);
	return rtv&&rtv[1]||path;
}).ori=r;
k='bmpRemap_clear';
r=p[k]; (p[k]=function f(path){
	const arr=this._bmpRemap_container();
	arr.length=0;
	const m=arr._map;
	m.clear();
}).ori=r;
}

{ const p=ResourceHandler;
p._emptyData={
'img':'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII=', // blank_1x1
'audio':'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAIARKwAABCxAgAEABAAZGF0YQAAAAA=', // blank_audio
};
p._reloaders=new Set();
p.exists=function(){ return 0<this._reloaders.size; };
new cfc(p).addBase('retry',function f(){
	Graphics.eraseLoadingError();
	SceneManager.resume();
	const s=new Set(this._reloaders);
	this._reloaders.clear();
	s.forEach(f.tbl[0]);
},[
f=>f(), // 0: forEach
]);
p.reloader_add=function(f){ this._reloaders.add(f); };
p.reloader_del=function(f){ this._reloaders.delete(f); };
p.setLoaderType=function(t){ this._loaderType=t; };
p.getLoaderType=function(){ return this._loaderType; };
p.createLoader=function(url, retryMethod, resignMethod, retryInterval){
	// create re-loader, actually
	retryInterval=retryInterval||this._defaultRetryInterval;
	retryMethod._printNoErr=retryMethod._printNoErr||this._printNoErr;
	retryMethod._loaderType=retryMethod._loaderType||this._loaderType;
	let retryCount=0;
	const opt={};
	const rtv=function loader(){
		if(retryCount<retryInterval.length){
			setTimeout(retryMethod, retryInterval[retryCount]);
			retryCount++;
		}else{
			if(resignMethod) if(resignMethod()) return; // special handling
			if(url){
				ResourceHandler.reloader_del(opt.reloader);
				const f=opt.reloader=isGivingUp=>{
					retryCount=0;
					retryMethod(isGivingUp&&ResourceHandler._emptyData[retryMethod._loaderType]||url);
				};
				if(!loader._div||!loader._div.parentNode){
					loader._div=undefined;
					if(!retryMethod._printNoErr) loader._div=Graphics.printLoadingError(url,opt);
				}
				SceneManager.stop();
				ResourceHandler.reloader_add(f);
			}
		}
	};
	return rtv;
};
(t=p.isDirectPath=function f(fname){
	return fname && fname.constructor===String && f.tbl.some(p=>fname.match(p));
}).ori=undefined;
t.tbl=[/^((blob|data):|\.\/\/)/,];
(t=ResourceHandler.isBlobUrl=function f(url){
	return url && url.constructor===String && url.match(f.tbl[0]);
}).ori=undefined;
t.tbl=[/^blob:/,];
}
new cfc(Bitmap).addBase('giveUpUrl_getCont',function f(){
	let rtv=Bitmap._giveUpUrl; if(!rtv) rtv=Bitmap._giveUpUrl=new Set();
	return rtv;
}).addBase('giveUpUrl_add',function f(url){
	return this.giveUpUrl_getCont().add(url);
}).addBase('giveUpUrl_del',function f(url){
	return this.giveUpUrl_getCont().delete(url);
}).addBase('giveUpUrl_getMod',function f(url){
	return this.giveUpUrl_getCont().has(url)?ResourceHandler._emptyData.img:url;
});
new cfc(Bitmap.prototype).add('_onLoad',function f(){
	{ const div=this._loader&&this._loader._div; if(div) Graphics.currentLoadErrorDivs_clear(div); }
	return f.ori.apply(this,arguments);
}).add('decode',function f(){
	const bakT=ResourceHandler.getLoaderType();
	ResourceHandler.setLoaderType('img');
	const rtv=f.ori.apply(this,arguments);
	ResourceHandler.setLoaderType(bakT);
	return rtv;
}).add('_requestImage',function f(url){
	const bakT=ResourceHandler.getLoaderType();
	ResourceHandler.setLoaderType('img');
	const rtv=f.ori.apply(this,arguments);
	ResourceHandler.setLoaderType(bakT);
	return rtv;
}).add('_requestImage',function f(url,substituteUrl){
	if(substituteUrl!==undefined) arguments[0]=substituteUrl;
	arguments[0]=Bitmap.giveUpUrl_getMod(arguments[0]);
	return f.ori.apply(this,arguments);
});

{ const p=ImageManager;
p.isDirectPath=ResourceHandler.isDirectPath;
p.splitUrlQueryHash=window.splitUrlQueryHash;
new cfc(p).
addBase('_loadBitmap',function(isReserve, folder, filename, hue, smooth, reservationId){
	if(filename){
		let path;
		if(this.isDirectPath(filename)) path=filename;
		else{
			path = folder + filename.replace(/\n/g,'%0A');
			const uqh=this.splitUrlQueryHash(path);
			uqh[0]+='.png'; // 
			if($gameSystem) uqh[0]=$gameSystem.bmpRemap_get(uqh[0]);
			path=uqh.join('');
		}
		const bitmap = isReserve ? this.reserveNormalBitmap(path, hue || 0, reservationId || this._defaultReservationId) : this.loadNormalBitmap(path, hue || 0);
		bitmap.smooth = smooth;
		return bitmap;
	}else return this.loadEmptyBitmap();
}).
addBase('loadBitmap',function(folder, filename, hue, smooth){
	return this._loadBitmap(false, folder, filename, hue, smooth);
}).
addBase('reserveBitmap',function(folder, filename, hue, smooth, reservationId){
	return this._loadBitmap(true , folder, filename, hue, smooth, reservationId);
}).
addBase('loadNormalBitmap',function f(path, hue){
	if(!path) return ImageManager.loadEmptyBitmap();
	const key=this._generateCacheKey(path, hue);
	let bitmap=this._imageCache.get(key);
	if(!bitmap){
		this._imageCache.add(key,bitmap=Bitmap.load(path));
		bitmap._cacheKey=key;
		bitmap._hue=hue;
		bitmap.addLoadListener(f.tbl[0]);
	}else if(!bitmap.isReady()) bitmap.decode();
	return bitmap;
},[
bmp=>bmp.rotateHue(bmp._hue), // 0: bmp onload
]).
addBase('_generateCacheKey',function f(path,hue){
	return hue?path+':'+hue:path;
}).
getP;
}

ImageCache.prototype.del=function f(key){
	delete this._items[key];
};

})(); // ImageManager._loadBitmap

// ---- ---- ---- ---- auto F3

new cfc(Scene_Boot.prototype).add('start',function f(){
	const g=Graphics,gw=g.width,gh=g.height;
if(0){
	g.hideFps();
	g._switchFPSMeter();
	g._switchFPSMeter();
}
	const t=window,w=t.innerWidth,h=t.innerHeight;
	console.log(w,h);
	if(!g._stretchEnabled && ( gw>w || gh>h || (gw+(gw>>1)<w&&gh+(gh>>1)<h) ) ) Graphics._switchStretchMode();
	return f.ori.apply(this,arguments);
});

// ---- ---- ---- ---- rendering

(()=>{ let k,r;

const tuneOpt=function(opt){
	opt=opt||{};
	opt.transparent=opt.alpha=!(opt.preserveDrawingBuffer=opt.premultipliedAlpha=opt.depth=opt.stencil=opt.antialias=false);
	opt.depth=true;
	opt.powerPreference="low-power";
	return opt;
};

{ const p=PIXI.glCore;
p._tuneOpt=tuneOpt;
k='createContext';
r=p[k]; (p[k]=function f(c,opt){
	return f.ori.call(this,c,this._tuneOpt(opt));
}).ori=r;
}

{ const p=Graphics;
p._effectFuncsOnce=p._effectFuncs=undefined; // Array or false-like
p.renderOtherEffects=none;
p._tuneOpt=tuneOpt;
new cfc(p).addBase('render',function f(stage){
	if(this._rendered=--this._skipCount<0){
		const startTime=Date.now();
		if(stage){
			this._renderer.render(stage);
			if(this._renderer.gl&&this._renderer.gl.flush) this._renderer.gl.flush();
		}
		if(this._effectFuncs) this._effectFuncs.slice().forEach(f.tbl[0],this);
		if(this._effectFuncsOnce){
			const arr=this._effectFuncsOnce;
			const funcs=arr.slice();
			arr.length=0;
			funcs.forEach(f.tbl[0],this);
		}
		this.renderOtherEffects(stage);
		this._skipCount=Math.min((Date.now()-startTime)>>4,this._maxSkip);
		this.pasteCanvas();
	}
	this.frameCount+=SceneManager._updateSceneCnt|0; SceneManager._updateSceneCnt=0|0;
},[
function(f){ f.call(this); },
]).
addBase('getSceneFrameCnt',function f(){
	return this.frameCount+(SceneManager._updateSceneCnt|0);
}).
addBase('_createRenderer',function(){
	const log=window.console.log; window.console.log=none;
	
	const width=this._width , height=this._height;
	const options=this._tuneOpt({ view: this._canvas, transparent: true, forceCanvas: this._forceCanvas,
		depth:false,
	});
	try{
		switch(this._rendererType){
		case 'canvas':
			this._renderer=new PIXI.CanvasRenderer(width,height, options);
			break;
		case 'webgl':
			this._renderer=new PIXI.WebGLRenderer(width,height, options);
			break;
		default:
			this._renderer=PIXI.autoDetectRenderer(width,height, options);
			break;
		}
		if(this._renderer && this._renderer.textureGC) this._renderer.textureGC.maxIdle=1;
	}catch(e){ this._renderer=null; }
	
	window.console.log=log;
	if(!this._renderer) this._createRenderer_onFail();
}).addBase('_createRenderer_onFail',function f(){
	if(this._rendererType==='auto') addUrlParamVal_qs('canvas');
});
p.getImageData=function f(x,y,w,h){
	if(x===undefined) x=0;
	if(y===undefined) y=0;
	if(w===undefined) w=this._canvas.width;
	if(h===undefined) h=this._canvas.height;
	if(this.isWebGL()){
		const gl=Graphics._renderer.gl,pixv=new Uint8ClampedArray((w*h)<<2);
		gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,pixv);
		return {data:pixv,width:w,height:h};
	}else return this._canvas.getContext('2d').getImageData(x,y,w,h);
};
p.pasteCanvas=function f(){
	if(!this._createScreenshot) return;
	this._createScreenshot=false;
	pasteCanvas(this._canvas);
};
p.createScreenshot=function f(){
	this._createScreenshot=true;
};
}

{ const p=PIXI.utils;
k='isWebGLSupported';
r=p[k]; (p[k]=function f(){ // PIXI's built-in uses 'failIfMajorPerformanceCaveat' option, which is unreliable
	let renderer;
	{
		const canvas=document.createElement('canvas');
		let gl;
		try{
			gl=canvas.getContext('webgl')||canvas.getContext('experimental-webgl');
		}catch(e){
		}
		if(gl){
			const debugInfo=gl.getExtension('WEBGL_debug_renderer_info');
			//const vendor=gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
			renderer=gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
		}
	}
	return renderer&&renderer.indexOf(f.trgt)<0&&f.ori.apply(this,arguments);
}).ori=r;
p[k].trgt="SwiftShader";
}

new cfc(Graphics).addBase('_webgl_saveShader',function f(){
	const gl=this._renderer&&this._renderer.gl; if(!gl) return;
	const info={
		getParameter:[],getVertexAttrib:[],
		getVertexAttrib:[],
	};
	for(let x=0,arr=f.tbl[0].getParameter,xs=arr.length;x!==xs;++x) info.getParameter.push(gl.getParameter(gl[arr[x]]));
	const prog=info.CURRENT_PROGRAM=gl.getParameter(gl.CURRENT_PROGRAM);
	// get attribute infos
	const cnt=info.ACTIVE_ATTRIBUTES=gl.getProgramParameter(prog,gl.ACTIVE_ATTRIBUTES);
	for(let i=0;i!==cnt;++i){
		const attr=gl.getActiveAttrib(prog,i);
		if(!attr){ info.getVertexAttrib.push(undefined); continue; }
		const vertexAttrs=[],idx=gl.getAttribLocation(prog,attr.name);
		vertexAttrs.push(vertexAttrs._idx=idx);
		for(let x=0,arr=f.tbl[0].getVertexAttrib,xs=arr.length;x!==xs;++x) vertexAttrs.push(gl.getVertexAttrib(idx,gl[arr[x]]));
		vertexAttrs.push(vertexAttrs._offset=gl.getVertexAttribOffset(idx,gl.VERTEX_ATTRIB_ARRAY_POINTER));
		info.getVertexAttrib.push(vertexAttrs);
	}
	return info;
},t=[
{
getVertexAttrib:['VERTEX_ATTRIB_ARRAY_SIZE','VERTEX_ATTRIB_ARRAY_TYPE','VERTEX_ATTRIB_ARRAY_NORMALIZED','VERTEX_ATTRIB_ARRAY_STRIDE',],
bindBuffer:['ARRAY_BUFFER','ELEMENT_ARRAY_BUFFER',],
}, // 0: 
]).addBase('_webgl_restoreShader',function f(gl,info){
	if(!info) return;
	gl.useProgram(info.CURRENT_PROGRAM);
	for(let arr=f.tbl[0].bindBuffer,x=arr.length;x--;) gl.bindBuffer(gl[arr[x]], info.getParameter[x], gl.STATIC_DRAW);
	for(let i=0,arrv=info.getVertexAttrib,sz=arrv.length;i!==sz;++i) if(arrv[i]) gl.vertexAttribPointer.apply(gl,arrv[i]);
},t);

})(); // rendering

// ---- ---- ---- ---- ConfigManager.others

(()=>{ let k,r,t;

new cfc(ConfigManager).add('makeData',function f(){
	const rtv=f.ori.apply(this,arguments);
	rtv.others=this.others;
	return rtv;
}).add('applyData',function f(config){
	const rtv=f.ori.apply(this,arguments);
	this.others=config.others||{};
	return rtv;
});

})(); // ConfigManager.others

// ---- ---- ---- ---- default font

(()=>{ let k,r,t;

new cfc(Bitmap.prototype).add('_makeFontNameText',function f(){
	this.fontFace=f.tbl[0];
	return f.ori.apply(this,arguments);
},[
"MBR刪節號,Consolas,'Courier New',Courier,微軟正黑體,標楷體,monospace,GameFont",
]);

})(); // default font

// ---- ---- ---- ---- save cache (both local and web) + pretending localStorage is ok

(()=>{ let k,r,t;

t=[
"bak-", // 0: pseudoStorage backup key prefix
];

new cfc(StorageManager).addBase('pseudoStorage_getCont',function f(){
	let rtv=this._pseudoStorage; if(!rtv) rtv=this._pseudoStorage=new Map();
	return rtv;
}).addBase('pseudoStorage_save',function f(key,val){
	this.pseudoStorage_getCont().set(key+'',val+'');
}).addBase('pseudoStorage_load',function f(key){
	return this.pseudoStorage_getCont().get(key+'')||null;
}).addBase('pseudoStorage_has',function f(key){
	return this.pseudoStorage_getCont().has(key+'');
}).addBase('pseudoStorage_del',function f(key){
	return this.pseudoStorage_getCont().delete(key+'');
}).add('saveToWebStorage',function f(savefileId,json){
	try{
		return f.ori.apply(this,arguments);
	}catch(e){
		if(e instanceof DOMException){
			const key=this.webStorageKey(savefileId);
			const data=LZString.compressToBase64(json);
			return this.pseudoStorage_save(key,data);
		}
		throw e;
	}
}).add('loadFromWebStorage',function f(savefileId){
	try{
		return f.ori.apply(this,arguments);
	}catch(e){
		if(e instanceof DOMException){
			const key=this.webStorageKey(savefileId);
			return LZString.decompressFromBase64(this.pseudoStorage_load(key));
		}
		throw e;
	}
}).add('webStorageExists',function f(savefileId){
	try{
		return f.ori.apply(this,arguments);
	}catch(e){
		if(e instanceof DOMException){
			const key=this.webStorageKey(savefileId);
			return this.pseudoStorage_has(key);
		}
		throw e;
	}
}).add('removeWebStorage',function f(savefileId){
	try{
		return f.ori.apply(this,arguments);
	}catch(e){
		if(e instanceof DOMException){
			const key=this.webStorageKey(savefileId);
			return this.pseudoStorage_del(key);
		}
		throw e;
	}
}).addBase('saveCache_getCont',function f(){
	let rtv=this._saveCache; if(!rtv) rtv=this._saveCache=new Map();
	return rtv;
}).addBase('saveCache_save',function(savefileId,json){
	return this.saveCache_getCont().set(savefileId,json);
}).addBase('saveCache_load',function(savefileId){
	return this.saveCache_getCont().get(savefileId);
}).addBase('saveCache_has',function(savefileId){
	return this.saveCache_getCont().has(savefileId);
}).addBase('saveCache_del',function(savefileId){
	return this.saveCache_getCont().delete(savefileId);
}).add('save',function f(savefileId,json){
	this.saveCache_save.apply(this,arguments);
	return f.ori.apply(this,arguments);
}).add('load',function f(savefileId){
	if(!this.saveCache_has.apply(this,arguments)) this.saveCache_save(savefileId,f.ori.apply(this,arguments));
	return this.saveCache_load.apply(this,arguments);
}).add('exists',function f(savefileId){
	return this.saveCache_has.apply(this,arguments)||f.ori.apply(this,arguments);
}).add('remove',function f(savefileId){
	this.saveCache_del.apply(this,arguments);
	return f.ori.apply(this,arguments);
}).addBase('backup',function(savefileId){
	if(this.exists(savefileId)) return (this.isLocalMode()?this.backup_fs:this.backup_web).apply(this,arguments);
}).addBase('backup_fs',function f(savefileId){
	const fs=require('fs');
	const dirPath=this.localFileDirectoryPath();
	const filePath=this.localFilePath(savefileId); // full path
	try{
		fs.renameSync(filePath,filePath+".bak");
		return;
	}catch(e){
		const data=this.loadFromLocalFile(savefileId);
		const compressed=LZString.compressToBase64(data);
		this.pseudoStorage_save(f.tbl[0]+savefileId,compressed);
		if(!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);
		fs.writeFileSync(filePath+".bak",compressed);
		return compressed;
	}
},t).addBase('backup_web',function f(savefileId){
	const data=this.loadFromWebStorage(savefileId);
	const compressed=LZString.compressToBase64(data);
	const key=this.webStorageKey(savefileId)+"bak";
	this.pseudoStorage_save(f.tbl[0]+savefileId,compressed);
	localStorage.setItem(key,compressed);
	return compressed;
},t).add('backup',function f(savefileId){
	try{
		return f.ori.apply(this,arguments);
	}catch(e){
		if(e instanceof DOMException) return;
		throw e;
	}
}).add('cleanBackup',function f(savefileId){
	this.pseudoStorage_del(f.tbl[0]+savefileId);
	try{
		return f.ori.apply(this,arguments);
	}catch(e){
	}
},t).addBase('restoreBackup',function f(savefileId){
	if(this.backupExists(savefileId)) return (this.isLocalMode()?this.restoreBackup_fs:this.restoreBackup_web).apply(this,arguments);
}).addBase('restoreBackup_fs',function f(savefileId){
	const fs=require('fs');
	const dirPath=this.localFileDirectoryPath();
	const filePath=this.localFilePath(savefileId);
	if(!fs.existsSync(dirPath)) fs.mkdirSync(dirPath);
	try{
		fs.renameSync(filePath+".bak",filePath);
		return;
	}catch(e){
		const data=this.loadFromLocalBackupFile(savefileId);
		const compressed=LZString.compressToBase64(data);
		fs.writeFileSync(filePath, compressed);
		fs.unlinkSync(filePath+".bak");
	}
}).addBase('restoreBackup_web',function f(savefileId){
	const data=this.loadFromWebStorageBackup(savefileId);
	const compressed=LZString.compressToBase64(data);
	const key=this.webStorageKey(savefileId);
	localStorage.setItem(key,compressed);
	localStorage.removeItem(key+"bak");
}).add('restoreBackup',function f(savefileId){
	try{
		return f.ori.apply(this,arguments);
	}catch(e){
		if(e instanceof DOMException){
			const bakKey=f.tbl[0]+savefileId;
			if(!this.pseudoStorage_has(bakKey)) return;
			const key=this.webStorageKey(savefileId);
			return this.pseudoStorage_save(key,this.pseudoStorage_load(bakKey));
		}
		throw e;
	}
},t);

})(); // save cache (both local and web) + pretending localStorage is ok

// ---- ---- ---- ---- map evt search table

(()=>{ let k,r,t;

DataManager._def_normalPriority=1;

new cfc(Game_Character.prototype).addBase('getPosKey',function(dx,dy){
	return $gameMap?$gameMap.getPosKey((dx|0)+(this.x|0),(dy|0)+(this.y|0)):undefined;
}).addBase('isCollidedWithEvents',function f(x,y){
	const arr=$gameMap.eventsXyNtNp(x,y);
	return !!(arr.uniqueHas(this)?arr.length-1:arr.length);
}).addBase('isNormalPriority',function f(){
	return DataManager._def_normalPriority===this._priorityType;
});

new cfc(Game_Map.prototype).addBase('getPosKey',function f(x,y){
	return $dataMap&&$gameMap.roundX(0|x)+$dataMap.width*(($gameMap.roundY(0|y)<<2)|2);
}).add('posKeyToXy',function f(posKey){
	// x,y in posKey is rounded, so they must be >= 0
	return isNaN(posKey)?undefined:({
		x:~~(posKey%$dataMap.width),
		y:(posKey/$dataMap.width)>>2,
	});
}).add('update',function f(){
	this.update_locTbl();
	return f.ori.apply(this,arguments);
}).addBase('update_locTbl',function f(){
	// called once per frame
	
	this._locTbl_updated_fllwrs=false;
	this._locTbl_updated_evts=false;
	
	this.update_locTbl_fllwrs(true);
	this.update_locTbl_evts(true);
	// only call update table when needed. just clean here
}).addBase('update_locTbl_fllwrs',function f(clearOnly){
	if(this._locTbl_updated_fllwrs) return;
	
	const followers=$gamePlayer&&$gamePlayer.followers();
	const fllwrs=followers&&followers._data; if(!fllwrs) return;
	{ let s=fllwrs._set; if(s) s.clear(); else s=fllwrs._set=new Set(); }
	let ntc=fllwrs.coordsNt,m; if(!ntc) ntc=fllwrs.coordsNt=[]; // [pri] -> Map() // pri=-1 is all pri
	const npval=DataManager._def_normalPriority;
	let setNpval=false;
	for(let p=7;p-->=0;){
		if(npval===p) setNpval=true;
		
		m=ntc[p];
		if(m) m.clear();
		else m=ntc[p]=new Map();
	}
	if(!setNpval){
		m=ntc[npval]; if(m) m.clear(); else m=ntc[npval]=new Map();
	}
	if(clearOnly) return;
	
	this._locTbl_updated_fllwrs=true;
	if($gamePlayer&&!$gamePlayer.isThrough()) fllwrs.forEach(f.tbl[0],this);
},[
function(fllwr,i,a){
	if(!fllwr.isVisible()) return;
	a._set.add(fllwr);
	this.update_locTbl_addFllwr(fllwr,a.coordsNt[-1]);
	this.update_locTbl_addFllwr(fllwr,a.coordsNt[fllwr._priorityType]);
},
]).addBase('update_locTbl_addFllwr',function f(fllwr,coord){
	if(!coord) return;
	const key=fllwr.getPosKey();
	let arr=coord.get(key); if(!arr) coord.set(key,arr=[]);
	return arr.push(fllwr);
}).addBase('update_locTbl_delFllwr',function f(fllwr,coord,x,y){
	throw new Error('not supported');
}).addBase('update_locTbl_chkFllwrErr',function f(fllwr){
	const followers=$gamePlayer&&$gamePlayer.followers();
	const fllwrs=followers&&followers._data;
	return !fllwrs||fllwrs._set&&!fllwrs._set.has(fllwr);
}).addBase('update_locTbl_evts',function f(clearOnly){
	if(this._locTbl_updated_evts) return;
	
	const evts=this._events; if(!evts) return;
	{ let s=evts._set; if(s) s.clear(); else s=evts._set=new Set(); }
	let c=evts.coords,m; if(!c) c=evts.coords=[]; // [pri] -> Map() // pri=-1 is all pri
	let ntc=evts.coordsNt; if(!ntc) ntc=evts.coordsNt=[]; // [pri] -> Map()
	const npval=DataManager._def_normalPriority;
	let setNpval=false;
	for(let p=7;p-->=0;){
		if(npval===p) setNpval=true;
		
		m=c[p];
		if(m) m.clear();
		else m=c[p]=new Map();
		
		m=ntc[p];
		if(m) m.clear();
		else m=ntc[p]=new Map();
	}
	if(!setNpval){
		m=c[npval]; if(m) m.clear(); else m=c[npval]=new Map();
		m=ntc[npval]; if(m) m.clear(); else m=ntc[npval]=new Map();
	}
	if(clearOnly) return;
	
	this._locTbl_updated_evts=true;
	evts.forEach(f.tbl[0],this);
},[
function(evt,i,a){
	if(!evt||!evt.event()) return;
	a._set.add(evt);
	this.update_locTbl_addEvt(evt,a.coords[-1]);
	this.update_locTbl_addEvt(evt,a.coords[evt._priorityType]);
	if(!evt.isThrough()){
		this.update_locTbl_addEvt(evt,a.coordsNt[-1]);
		this.update_locTbl_addEvt(evt,a.coordsNt[evt._priorityType]);
	}
},
]).addBase('update_locTbl_addEvt',function f(evt,coord){
	return this._update_locTbl_addEvt_byKey(evt,coord,evt.getPosKey());
}).addBase('_update_locTbl_addEvt_byKey',function f(evt,coord,key){
	if(!coord) return;
	let cont=coord.get(key); if(!cont) coord.set(key,cont=[]);
	return cont.uniquePush(evt);
}).addBase('update_locTbl_delEvt',function f(evt,coord,x,y){
	return this._update_locTbl_delEvt_byKey(evt,coord,this.getPosKey(x,y));
}).addBase('_update_locTbl_delEvt_byKey',function f(evt,coord,key){
	if(!coord) return;
	const cont=coord.get(key); if(!cont) return;
	return cont.uniquePop(evt);
}).addBase('update_locTbl_chkEvtErr',function f(evt){
	return !this._events||this._events._set&&!this._events._set.has(evt);
}).addBase('update_locTbl_addEvt_overall',function f(evt){
	if(this.update_locTbl_chkEvtErr(evt)) return;
	const coords=this._events.coords; if(!coords) return;
	this.update_locTbl_addEvt(evt,coords[-1]);
	this.update_locTbl_addEvt(evt,coords[evt._priorityType]);
	if(!evt.isThrough()){
		const coordsNt=this._events.coordsNt;
		this.update_locTbl_addEvt(evt,coordsNt[-1]);
		this.update_locTbl_addEvt(evt,coordsNt[evt._priorityType]);
	}
}).addBase('update_locTbl_delEvt_overall',function f(evt,x,y){
	if(this.update_locTbl_chkEvtErr(evt)) return;
	const coords=this._events.coords; if(!coords) return;
	this.update_locTbl_delEvt(evt,coords[-1],x,y);
	this.update_locTbl_delEvt(evt,coords[evt._priorityType],x,y);
	if(!evt.isThrough()){
		const coordsNt=this._events.coordsNt;
		this.update_locTbl_delEvt(evt,this._events.coordsNt[-1],x,y);
		this.update_locTbl_delEvt(evt,this._events.coordsNt[evt._priorityType],x,y);
	}
}).addBase('eventsXy',function f(x,y,p=-1){
	this.update_locTbl_evts();
	const coord=this._events&&this._events.coords&&this._events.coords[p];
	return coord&&coord.get(this.getPosKey(x,y))||f.tbl[0];
},[
[],
]).addBase('eventsXyNt',function f(x,y,p=-1){
	this.update_locTbl_evts();
	const coord=this._events&&this._events.coordsNt&&this._events.coordsNt[p];
	return coord&&coord.get(this.getPosKey(x,y))||f.tbl[0];
},[
[],
]).addBase('eventsXyNtNp',function f(x,y){ // normal priority
	return this.eventsXyNt(x,y,DataManager._def_normalPriority);
},[
[],
]);

new cfc(Game_Followers.prototype).addBase('isSomeoneCollided',function f(x,y){
	$gameMap.update_locTbl_fllwrs();
	const key=$gameMap&&$gameMap.getPosKey(x,y);
	return !!(this._data.coordsNt&&this._data.coordsNt[DataManager._def_normalPriority].get(key)||f.tbl[0]).length;
},[
[],
]);

new cfc(Game_Event.prototype).add('moveStraight',function f(d){
	const x=this.x,y=this.y;
	const rtv=f.ori.apply(this,arguments);
	if(this.isMovementSucceeded()){
		// edit location table of $gameMap
		if($gameMap){
			$gameMap.update_locTbl_delEvt_overall(this,x,y);
			$gameMap.update_locTbl_addEvt_overall(this);
		}
		this.moveSuccOn(x,y,d);
	}else this.moveFailOn(x,y,d);
	return rtv;
}).addBase('moveFailOn',function f(lastX,lastY,moveDirection){
}).addBase('moveSuccOn',function f(lastX,lastY,moveDirection){
}).add('setPriorityType',function f(pri){
	const pri0=this._priorityType,x=this.x,y=this.y;
	const rtv=f.ori.apply(this,arguments);
	if(pri0===this._priorityType||!$gameMap) return rtv;
	const coords=$gameMap._events.coords; if(!coords) return rtv;
	$gameMap.update_locTbl_delEvt(this,coords[pri0],x,y);
	$gameMap.update_locTbl_addEvt(this,coords[this._priorityType]);
	if(!this.isThrough()){
		const coordsNt=$gameMap._events.coordsNt;
		$gameMap.update_locTbl_delEvt(this,coordsNt[pri0],x,y);
		$gameMap.update_locTbl_addEvt(this,coordsNt[this._priorityType]);
	}
	return rtv;
});

})(); // map evt search table

// ---- ---- ---- ---- refine error html

(()=>{ let k,r,t;

new cfc(SceneManager).addBase('catchException',function f(e){
	this.catchException_print(e);
	console.error(e);
	AudioManager.stopAll();
	this.stop();
}).addBase('catchException_print',function f(e,opt){
	if(e) Graphics.printError(e.name,e.message,e,opt);
});

new cfc(Graphics).addBase('_forEachCss',function f(item){
	// bind 'this' to dom.style
	// 'item' = [cssKey , the value]
	this[item[0]]=item[1];
}).addBase('currentLoadErrorDivs_getCont',function f(dontInit){
	let arr=this._currentLoadErrorDivs; if(!arr&&!dontInit) arr=this._currentLoadErrorDivs=[];
	return arr;
}).addBase('currentLoadErrorDivs_getCnt',function f(){
	return this.currentLoadErrorDivs_getCont().length;
}).addBase('currentLoadErrorDivs_add',function f(div){
	if(div instanceof HTMLElement) this.currentLoadErrorDivs_getCont().uniquePush(div);
}).addBase('currentLoadErrorDivs_clear',function f(div){
	const arr=this.currentLoadErrorDivs_getCont(true); if(!arr) return;
	if(div!==undefined){
		f.tbl[0].bind(null)(div);
		f.tbl[1].bind(arr)(div);
		return;
	}
	const delList=[];
	arr.forEach(f.tbl[0],delList);
	delList.forEach(f.tbl[1],arr);
},[
function(div){ if(this&&this!==window) this.push(div); const p=div.parentNode; if(p) p.removeChild(div); }, // 0:
function(div){ this.uniquePop(div); }, // 1:
]).addBase('_makeErrorHtml',function f(name,message,e,opt){
	const d=document;
	let main;
	const rtv=d.ce('div').ac(main=d.ce('div').ac(
		d.ce('pre').sa('style',f.tbl[0][0]).ac(d.ce('b').atxt(name)).ac(d.ce('br'))
	).ac(
		d.ce('pre').sa('style',f.tbl[0][1]).atxt(message).ac(d.ce('br')).ac(d.ce('br')).atxt(DataManager.getDebugInfoStr())
	).sa('style',f.tbl[0][2])).sa('style',f.tbl[0][3]);
	if(e && e.stack) main.ac(
		d.ce('pre').sa('style',f.tbl[0][1]).atxt(e.stack.replaceAll(location.origin,'')).ac(d.ce('br'))
	);
	rtv._main=main;
	return rtv;
},[
['color:yellow;','color:white;','margin:4px;','background-color:rgba(0,0,0,0.25);text-align:left;overflow-x:scroll;font-family:monospace;',], // 0: css
]).addBase('printLoadingError',function f(url,opt){
	if(!this.printLoadingError_can(url,opt)) return false;
	return this.printLoadingError_do(url,opt);
}).addBase('printLoadingError_do',function f(url,opt){
	// can continue
	this._updateErrorPrinter_setShow(true);
	const div=this._makeErrorHtml('Loading Error','Failed to load: '+url,undefined,opt);
	div._opt=opt;
	div._url=url;
	this._errorPrinter.ac(div);
	this.currentLoadErrorDivs_add(div);
	
	const d=document,btns=[];
	if(!f.tbl[2]) d.head.ac(f.tbl[2]=d.ce('style').atxt(f.tbl[3]));
	let s=this._retryResourceBtns; if(!s) s=this._retryResourceBtns=new Set();
	
	{ const btn=d.createElement('button');
	btn.ac(d.ce('div').atxt('Retry all'));
	btn.onclick=f.tbl[1];
	btns.push(btn);
	}
	{ const btn=d.createElement('button');
	btn.ac(d.ce('div').atxt('Retry this'));
	btn.onclick=f.tbl[4];
	s.add(btn);
	btns.push(btn);
	}
	{ const btn=d.createElement('button');
	btn.ac(d.ce('div').atxt('Give up this')).ac(d.ce('div').atxt('(use 1x1 transparent image)'));
	btn.onclick=f.tbl[4];
	btn._isGivingUp=true;
	btns.push(btn);
	}
	{ const btn=d.createElement('button');
	btn.ac(d.ce('div').atxt('Always give up this'));
	btn.onclick=f.tbl[5];
	btn._isGivingUp=true;
	btns.push(btn);
	}
	btns.forEach(f.tbl[0][0],div);
	btns.forEach(f.tbl[0][1],div);
	
	this._loadingCount = -Infinity;
	
	return div;
},[
[
function f(btn){
	// this=ErrorHtml
	const div=this;
	if(!f.tbl) f.tbl=[];
	if(!f.tbl[0]) f.tbl[0]='btn'; // dom.class
	btn.classList.add('btn');
	btn._root=div;
	(div._main?div._main:div).ac(btn);
	div._maxBtnWidth=Math.ceil(Math.max(div._maxBtnWidth||0,btn.scrollWidth));
	div._maxBtnHeight=Math.ceil(Math.max(div._maxBtnHeight||0,btn.scrollHeight));
}, // 0-0: forEach btn - settings without width
function f(btn){
	btn.style.width=this._maxBtnWidth+'px';
	btn.style.height=this._maxBtnHeight+'px';
}, // 0-1: forEach btn - set width
], // 0: forEach btn
function(event){
	ResourceHandler.retry();
	event.stopPropagation();
	Graphics.currentLoadErrorDivs_clear();
	if(!Graphics.currentLoadErrorDivs_getCnt()) Graphics._updateErrorPrinter_setShow(false);
	Graphics._updateErrorPrinter();
	Graphics._retryResourceBtns.clear();
}, // 1: retry all
undefined, // 2: <style />
`
.btn{
color:#FFFFFF;
background-color:rgba(0,0,0,0.75);
float:left;
text-wrap:nowrap;
font-size:16px;
font-family:monospace;
}
.btn:hover{
background-color:rgba(234,234,0,0.25);
}
`, // 3: content of above <style />
function(event){
	event.stopPropagation();
	const root=this._root;
	const opt=root&&root._opt;
	if(!opt||!opt.reloader) return;
	opt.reloader(this._isGivingUp);
	ResourceHandler.reloader_del(opt.reloader);
	if(root) Graphics.currentLoadErrorDivs_clear(root);
	if(!Graphics.currentLoadErrorDivs_getCnt()){
		Graphics._updateErrorPrinter_setShow(false);
		SceneManager.resume();
	}
	Graphics._updateErrorPrinter();
	if(this._isGivingUp && this._root._url && typeof $gameTemp!=='undefined' && $gameTemp && $gameTemp.popupMsg) $gameTemp.popupMsg("give up: \n"+this._root._url+"\nUTC time:\n"+new Date().toISOString(),{loc:"LU",});
}, // 4: retry this / give up this
function(event){
	Bitmap.giveUpUrl_add(this._url);
	event.stopPropagation();
	const root=this._root;
	const opt=root&&root._opt;
	if(!opt||!opt.reloader) return;
	opt.reloader(true);
	ResourceHandler.reloader_del(opt.reloader);
	if(root) Graphics.currentLoadErrorDivs_clear(root);
	if(!Graphics.currentLoadErrorDivs_getCnt()){
		Graphics._updateErrorPrinter_setShow(false);
		SceneManager.resume();
	}
	Graphics._updateErrorPrinter();
	if(this._isGivingUp && this._root._url && typeof $gameTemp!=='undefined' && $gameTemp && $gameTemp.popupMsg) $gameTemp.popupMsg("always give up: \n"+this._root._url+"\nUTC time:\n"+new Date().toISOString(),{loc:"LU",});
}, // 5: always give up this
]).addBase('printLoadingError_can',function f(){
	return this._errorPrinter;
}).addBase('printError',function f(name,message,e,opt){
	// cannot continue
	this._updateErrorPrinter_setShow(true);
	const ep=this._errorPrinter;
	if(ep){
		ep.ac(this._makeErrorHtml(name,message,e,opt));
		this._updateErrorPrinter();
	}
	this._applyCanvasFilter();
	this._clearUpperCanvas();
}).add('_updateErrorPrinter',function f(){
	const rtv=f.ori.apply(this,arguments);
	const ep=this._errorPrinter.ra('height').ra('width');
	f.tbl[0].forEach(this._forEachCss,ep.style);
	this._updateErrorPrinter_setShow();
	return rtv;
},[
[
['width','75%'],
['height','75%'],
], // 0: css
]).add('_createErrorPrinter',function f(){
	const rtv=f.ori.apply(this,arguments);
	f.tbl[0].forEach(this._forEachCss,this._errorPrinter.style);
	return rtv;
},[
[
['backgroundColor','rgba(0,0,0,0.25)'],
['overflow-y','scroll'],
['user-select','all'], // all: select all ; text: normally select ; 
], // 0: css
]).addBase('_updateErrorPrinter_setShow',function f(isShow){
	if(isShow!==undefined) this._errorShowed=!!isShow;
	this._errorPrinter.style.display=f.tbl[0][this._errorShowed|0];
},[
['none','',], // 0: css.display switch by this._errorShowed
]);

})(); // refine error html

// ---- ---- ---- ---- modify update reload

(()=>{ let k,r,t;

new cfc(Scene_Load.prototype).addBase('reloadMapIfUpdated',function f(){
	const verId_saved=$gameSystem.versionId();
	if(!verId_saved){ // ignore if it is diff from $dataSystem.versionId
		$gamePlayer.reserveTransfer($gameMap.mapId(), $gamePlayer.x, $gamePlayer.y);
		$gamePlayer.requestMapReload();
	}
});

})(); // modify update reload

// ---- ---- ---- ---- modify key map

(()=>{ let k,r,t;

Input.keyMapper[18]='alter';
for(let x=96;x<=105;++x) delete Input.keyMapper[x]; // num pad when num lock on

})(); // modify key map

// ---- ---- ---- ---- Window_NumberInput can cancel

(()=>{ let k,r,t;

new cfc(Game_Interpreter.prototype).add('command103',function f(){
	const rtv=f.ori.apply(this,arguments);
	this._isNumInputCancel=false;
	return rtv;
}).add('setupNumInput',function f(){
	const rtv=f.ori.apply(this,arguments);
	$gameMessage._numInputInpterpreter=this;
	return rtv;
});

new cfc(Window_NumberInput.prototype).addBase('isCancelEnabled',function f(){
	return true;
}).add('start',function f(){
	const rtv=f.ori.apply(this,arguments);
	if($gameMessage._numInputInpterpreter) $gameMessage._numInputInpterpreter._isNumInputCancel=false;
	return rtv;
}).addBase('callCancelHandler',function f(){
	SoundManager.playCancel();
	$gameMessage._numInputInpterpreter._isNumInputCancel=true;
	this._messageWindow.terminateMessage();
	this.updateInputData();
	this.deactivate();
	this.close();
	this.terminateNumInput();
}).add('processOk',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.terminateNumInput();
	return rtv;
}).add('terminateNumInput',function f(){
	$gameMessage._numInputInpterpreter=undefined;
});

})(); // Window_NumberInput can cancel

// ---- ---- ---- ---- Window_MenuCommand.prototype.needsCommand

(()=>{ let k,r,t;

new cfc(Window_MenuCommand.prototype).addBase('needsCommand',function f(name){
	const flags=$dataSystem.menuCommands;
	if(flags&&(name in f.tbl[0])) return flags[f.tbl[0][name]];
	return true;
},[
{
'item':0,
'skill':1,
'equip':2,
'status':3,
'formation':4,
'save':5,
}, // 0: name2idx
]).addBase('addMainCommands',function f(){
	f.tbl[0].forEach(f.tbl[1].bind(this,this.areMainCommandsEnabled()));
},[
[
'item',
'skill',
'equip',
'status',
], // 0: cmd keys
function f(partyExists,key){
	if(this.needsCommand(key)) this.addCommand(TextManager[key],key,partyExists&&this.isConfEnabledCommand(key));
}, // 1: forEach
]).addBase('isConfEnabledCommand',function f(name){
	return true;
});

})(); // Window_MenuCommand.prototype.needsCommand

// ---- ---- ---- ---- Game_Interpreter.requestImages

(()=>{ let k,r,t;

new cfc(Game_Interpreter).addBase('requestImages',function f(list,rtv){
	if(list) list.forEach(f.tbl[0].bind(rtv=rtv||{}));
},t=[
function f(command){
	// bind to rtv
	const func=f.tbl[command.code];
	return func&&f.tbl[command.code](command.parameters,this);
}, // 0: forEach
{
101:params=>ImageManager.requestFace(params[0]), // Show Text
117:(params,rtv)=>{
	const commonEvent=$dataCommonEvents[params[0]];
	if(commonEvent){
		if(!rtv.commonEvtIdSet) rtv.commonEvtIdSet=new Set();
		if(!rtv.commonEvtIdSet.has(params[0])){
			rtv.commonEvtIdSet.add(params[0]);
			Game_Interpreter.requestImages(commonEvent.list,rtv);
		}
	}
}, // Common Event
129:params=>{
	const actor=$gameActors.actor(params[0]);
	if(actor && params[1]===0){
		const name=actor.characterName();
		ImageManager.requestCharacter(name);
	}
}, // Change Party Member
205:function f(params){
	if(params[1]) params[1].list.forEach(f.tbl[205]);
}, // Set Movement Route
212:params=>{
	if(params[1]){
		const animation=$dataAnimations[params[1]];
		ImageManager.requestAnimation(animation.animation1Name, animation.animation1Hue);
		ImageManager.requestAnimation(animation.animation2Name, animation.animation2Hue);
	}
}, // 337: // Show Animation, Show Battle Animation
216:function f(params){
	if(params[0]===0) $gamePlayer.followers().forEach(f.tbl[216]);
}, // Change Player Followers
231:params=>ImageManager.requestPicture(params[1]), // Show Picture
282:params=>{
	const tileset=$dataTilesets[params[0]];
	tileset.tilesetNames.forEach(f.tbl[282]);
}, // Change Tileset
283:params=>{
	if(!$gameParty) return;
	if($gameParty.inBattle()){
		ImageManager.requestBattleback1(params[0]);
		ImageManager.requestBattleback2(params[1]);
	}
}, // Change Battle Back
284:params=>($gameParty.inBattle()||ImageManager.requestParallax(params[0])), // Change Parallax
322:params=>{
	ImageManager.requestCharacter(params[1]);
	ImageManager.requestFace(params[3]);
	ImageManager.requestSvActor(params[5]);
}, // Change Actor Images
323:params=>($gameMap.vehicle(params[0])&&ImageManager.requestCharacter(params[1])), // Change Vehicle Image
336:params=>{
	if(!$gameSystem) return;
	const enemy=$dataEnemies[params[1]];
	const imgMgr=ImageManager;
	($gameSystem.isSideView()?imgMgr.requestSvEnemy:imgMgr.requestEnemy).call(imgMgr,enemy.battlerName,enemy.battlerHue);
}, // Enemy Transform
}, // 1: cmd funcs
{
205:command=>(command.code===Game_Character.ROUTE_CHANGE_IMAGE && ImageManager.requestCharacter(command.parameters[0])),
216:follower=>{
	const name=follower.characterName();
	ImageManager.requestCharacter(name);
},
282:tilesetName=>ImageManager.requestTileset(tilesetName),
}, // 2: helpers
]);
t[0].tbl=t[1];
for(let k in t[1]) t[1][k].tbl=t[2];
t[1][337]=t[1][212];

new cfc(DataManager).add('onLoad_after_map',function f(obj){
	const rtv=f.ori&&f.ori.apply(this,arguments);
	this.onLoad_after_map_requestEventsImages();
	return rtv;
}).addBase('onLoad_after_map_requestEventsImages',function f(obj){
	// decided to do it before onLoad is called
	// leaving this function to be a placeholder
	//$dataMap.events.forEach(f.tbl[1],{});
},t=[
function f(page){
	Game_Interpreter.requestImages(page.list,this);
}, // 0: forEach page
function f(evtd){
	if(evtd) evtd.pages.forEach(f.tbl[0],this);
}, // 1: forEach evtd
]).add('onLoad_before_map',function f(obj){
	const rtv=f.ori&&f.ori.apply(this,arguments);
	this.onLoad_before_map_requestEventsImages();
	return rtv;
}).addBase('onLoad_before_map_requestEventsImages',function f(obj){
	$dataMap.events.forEach(f.tbl[1],{});
},t);
t[1].tbl=t;

})(); // Game_Interpreter.requestImages

// ---- ---- ---- ---- fading scene change

(()=>{ let k,r,t;

if(1)new cfc(SceneManager).add('changeScene_do_before',function f(){
	this.changeScene_do_before_fadingSceneChange();
	return f.ori.apply(this,arguments);
}).add('changeScene_do_before_fadingSceneChange',function f(){
	this._fadingSceneChangePreSc=this._scene&&this._scene._prevScene;
	this._fadingSceneChangeBmp=this.snap();
}).add('changeScene_do_after',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.changeScene_do_after_fadingSceneChange();
	return rtv;
}).add('changeScene_do_after_fadingSceneChange',function f(){
	const sc=this._fadingSceneChangePreSc;
	if(!sc||sc!==this._scene) return;
	this.addFadingSceneChangeSprite();
}).add('onSceneStart',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.onSceneStart_fadingSceneChange();
	return rtv;
}).addBase('onSceneStart_fadingSceneChange',function f(){
	this.addFadingSceneChangeSprite();
}).addBase('addFadingSceneChangeSprite',function f(){
	if(!this._fadingSceneChangeBmp) return;
	const n=this.getFadingSceneChangeFrames();
	if(0<n && this._scene) this._scene.addChild(new Sprite_FadeOut(this._fadingSceneChangeBmp,n));
	delete this._fadingSceneChangeBmp;
	delete this._fadingSceneChangePreSc;
}).addBase('getFadingSceneChangeFrames',function f(){
	return getUrlParamVal(f.tbl[0])-0;
},[
'fadingSceneChange', // 0: paramName
]);

})(); // fading scene change

// ---- ---- ---- ---- Scene_Waiting

(()=>{ let k,r,t;

// used between two scene. i.e. hooked in changeScene

const a=class Scene_Waiting extends Scene_Base{
};
window[a.name]=a;
new cfc(a.prototype).addBase('initialize',function f(){
	f._super[f._funcName].apply(this,arguments);
	this._nextScene=SceneManager._nextScene.constructor; // use something global to handling the scene arguments
}).addBase('update',function f(){
	f._super[f._funcName].apply(this,arguments);
	this.update_gotoNextScene();
}).addBase('update_gotoNextScene',function f(){
	SceneManager.goto(this._nextScene);
});

})(); // Scene_Waiting

// ---- ---- ---- ---- extend JsonEx

(()=>{ let k,r,t;

new cfc(JsonEx).
addBase('stringify',function f(obj){
	const circular=[];
	JsonEx._id=1;
	const json=JSON.stringify(this._encode(obj,circular,0));
	this._cleanMetadata(obj);
	this._restoreCircularReference(circular);
	
	return json;
}).
add('_encode',function f(val,circular,depth){
	if(this.isSpecialNumVal(val)) return this._encodeSpeicalNumVal.apply(this,arguments);
	return f.ori.apply(this,arguments);
}).
addBase('isSpecialNumVal',function f(val){
	return f.tbl[0].has(val);
},[
new Set([Infinity,-Infinity,NaN]), // special num vals
]).
addBase('_encodeSpeicalNumVal',function f(val,circular,depth){
	const rtv={};
	rtv[f.tbl[0]]=val.toString();
	return rtv;
},t=[
"@n",
'[object Object]',
]).
add('_decode',function f(val,circular,depth){
	if(Object.prototype.toString.call(val)===f.tbl[1] && (f.tbl[0] in val)){
		return Number(val[f.tbl[0]]);
	}
	return f.ori.apply(this,arguments);
},t).
getP;

})(); // extend JsonEx

// ---- ---- ---- ---- trait calc cache

(()=>{ let k,r,t;

t=[
undefined,
undefined,
window.isTest(), // 2: isTest
new Map([
[        0, 'cntZero' ],
[ Infinity, 'cntInf'  ],
[-Infinity, 'cntNInf' ],
[      NaN, 'cntNan'  ],
]), // 3: pi special value to cache val cnt property name
function(v,k){ this[v]=0; }, // 4: init pi special val cnt
new Set([
'ccc', // same code traits // traits
'wId', // multiset traits  // traitsWithId
'vls', // multiset values  // removeStatesAuto
'sum', // sum              // traitsSum
'sac', // sum all by code  // traitsSumAll
'mul', // multiply         // traitsPi
//'has', // has (c,d)->value // traitsHasValue // NOT USED
'set', // multiset dataId  // traitsSet
'MId', // max id           // traitsMaxId ( slotType collapseType )
]), // 5: planned cacheVal ops. also see `traitsOpCache_addTrait` `traitsOpCache_delTrait`
];


new cfc(Game_BattlerBase.prototype).
// base
addBase('traitsOpCache_genCacheKey',function f(dataCode,dataId,op){
	return dataCode+','+dataId+','+op;
}).
addBase('_traitsOpCache_getContRoot',function f(){
	let rtv=this._traitsOpCache; if(!rtv||rtv._self!==this) (rtv=this._traitsOpCache=[])._self=this; // not put into save file
	// chk _self: for handling JsonEx.makeDeepCopy
	return rtv;
}).
addBase('_traitsOpCache_clearContRoot',function f(){
	delete this._traitsOpCache;
}).
addBase('_traitsOpCache_getContUsedOp',function f(key){
	const root=this._traitsOpCache_getContRoot();
	let rtv=root._usedOp; if(!rtv) rtv=root._usedOp=new Map();
	//let rtv=f.tbl[0];
	if(key!==undefined){
		let tmp=rtv.get(key);
		if(!tmp) rtv.set(key,tmp=[]);
		rtv=tmp;
	}
	return rtv;
},[
new Map(), // 0: usedOp key->ops=[] // NOT USING THIS since using global record cause existing traits will NOT be counted
]).
addBase('traitsOpCache_getContVals',function f(){
	const root=this._traitsOpCache_getContRoot();
	let rtv=root._vals; if(!rtv) rtv=root._vals=new Map();
	return rtv;
}).
addBase('traitsOpCache_getUsedOps',function f(trait){
	const key=this.traitsOpCache_genCacheKey(trait.code,trait.dataId,'');
	const key0=this.traitsOpCache_genCacheKey(trait.code,'',''); // for those only use trait.code to distinguish
	return this._traitsOpCache_getContUsedOp(key0).slice().concat_inplace(this._traitsOpCache_getContUsedOp(key));
}).
addBase('traitsOpCache_addUsedOp',function f(dataCode,dataId,op){
	const key=this.traitsOpCache_genCacheKey(dataCode,dataId,'');
	this._traitsOpCache_getContUsedOp(key).uniquePush(op);
}).
addBase('traitsOpCache_hasUsedOp',function f(dataCode,dataId,op){
	const key=this.traitsOpCache_genCacheKey(dataCode,dataId,'');
	return this._traitsOpCache_getContUsedOp(key).uniqueHas(op);
}).
// ccc
addBase('traitsOpCache_updateVal_ccc_getValObj',function f(dataCode,dataId){
	// `dataId` is not used
	const vals=this.traitsOpCache_getContVals();
	const key=this.traitsOpCache_genCacheKey(dataCode,'','ccc');
	let rtv=vals.get(key); if(!rtv) vals.set(key,rtv=[]);
	return rtv;
}).
addBase('traitsOpCache_updateVal_ccc_add',function f(trait){
	const valObj=this.traitsOpCache_updateVal_ccc_getValObj(trait.code);
	valObj.multisetPush(trait);
}).
addBase('traitsOpCache_updateVal_ccc_del',function f(trait){
	const valObj=this.traitsOpCache_updateVal_ccc_getValObj(trait.code);
	valObj.multisetPop(trait);
}).
addBase('traitsOpCache_getCacheVal_ccc',function f(dataCode,dataId){
	// `dataId` is not used
	// default value = []
	const valObj=this.traitsOpCache_updateVal_ccc_getValObj(dataCode);
	return valObj;
}).
// sum // taken used by sac
addBase('traitsOpCache_updateVal_sum_getValObj',function f(dataCode,dataId){
	const vals=this.traitsOpCache_getContVals();
	const key=this.traitsOpCache_genCacheKey(dataCode,dataId,'sum');
	let rtv=vals.get(key); if(!rtv) vals.set(key,rtv={cnt:0,val:0,});
	return rtv;
}).
addBase('traitsOpCache_updateVal_sum_add',function f(trait){
	const valObj=this.traitsOpCache_updateVal_sum_getValObj(trait.code,trait.dataId);
	if(0===valObj.cnt++) valObj.val=trait.value;
	else valObj.val+=trait.value;
}).
addBase('traitsOpCache_updateVal_sum_del',function f(trait){
	const valObj=this.traitsOpCache_updateVal_sum_getValObj(trait.code,trait.dataId);
	if(0===--valObj.cnt) valObj.val=0;
	else valObj.val-=trait.value;
}).
addBase('traitsOpCache_getCacheVal_sum',function f(dataCode,dataId){
	// default value = {cnt:0,val:0,}
	const valObj=this.traitsOpCache_updateVal_sum_getValObj(dataCode,dataId);
	return valObj.val;
}).
// sac // take use of sum
addBase('traitsOpCache_updateVal_sac_add',function f(trait){
	const valObj=this.traitsOpCache_updateVal_sum_getValObj(trait.code,'');
	if(0===valObj.cnt++) valObj.val=trait.value;
	else valObj.val+=trait.value;
}).
addBase('traitsOpCache_updateVal_sac_del',function f(trait){
	const valObj=this.traitsOpCache_updateVal_sum_getValObj(trait.code,'');
	if(0===--valObj.cnt) valObj.val=0;
	else valObj.val-=trait.value;
}).
addBase('traitsOpCache_getCacheVal_sac',function f(dataCode,dataId){
	// `dataId` is not used
	// default value = {cnt:0,val:0,}
	const valObj=this.traitsOpCache_updateVal_sum_getValObj(dataCode,'');
	return valObj.val;
}).
// mul
addBase('traitsOpCache_updateVal_mul_getValObj',function f(dataCode,dataId){
	const vals=this.traitsOpCache_getContVals();
	const key=this.traitsOpCache_genCacheKey(dataCode,dataId,'mul');
	let rtv=vals.get(key); if(!rtv){
		vals.set(key,rtv=({traitCnt:0,preCal:1,}));
		f.tbl[3].forEach(f.tbl[4].bind(rtv));
	}
	return rtv;
},t).
addBase('traitsOpCache_updateVal_mul_add',function f(trait){
	const valObj=this.traitsOpCache_updateVal_mul_getValObj(trait.code,trait.dataId);
	const traitVal=isNaN(trait.value)?0:trait.value-0;
	const cntName=f.tbl[3].get(traitVal);
	if(0===valObj.traitCnt++) valObj.preCal=1;
	if(cntName===undefined){
		// general values
		valObj.preCal*=traitVal;
	}else{
		// special values
		++valObj[cntName];
	}
},t).
addBase('traitsOpCache_updateVal_mul_del',function f(trait){
	const valObj=this.traitsOpCache_updateVal_mul_getValObj(trait.code,trait.dataId);
	const traitVal=isNaN(trait.value)?NaN:trait.value-0;
	const cntName=f.tbl[3].get(traitVal);
	if(cntName===undefined){
		// general values
		valObj.preCal/=traitVal;
	}else{
		// special values
		--valObj[cntName];
	}
	if(0===--valObj.traitCnt) valObj.preCal=1;
},t).
addBase('traitsOpCache_getCacheVal_mul',function f(dataCode,dataId){
	// default value = 1
	const valObj=this.traitsOpCache_updateVal_mul_getValObj(dataCode,dataId);
	if(0<valObj.cntNan) return NaN;
	if(0<valObj.cntZero) return 0;
	if(0<valObj.cntInf||0<valObj.cntNInf){
		let signedCnt=0;
		signedCnt^=valObj.cntNInf;
		signedCnt^=valObj.preCal<0;
		return signedCnt&1?-Infinity:Infinity;
	}
	return valObj.preCal;
}).
// has // NOT USED
addBase('traitsOpCache_updateVal_has_getValObj',function f(dataCode,dataId){
	// `dataId` is not used
	const vals=this.traitsOpCache_getContVals();
	const key=this.traitsOpCache_genCacheKey(dataCode,dataId,'has');
	let rtv=vals.get(key); if(!rtv) vals.set(key,rtv=[]);
	return rtv;
}).
addBase('traitsOpCache_updateVal_has_add',function f(trait){
	const valObj=this.traitsOpCache_updateVal_has_getValObj(trait.code,trait.dataId);
	valObj.multisetPush(trait.value);
}).
addBase('traitsOpCache_updateVal_has_del',function f(trait){
	const valObj=this.traitsOpCache_updateVal_has_getValObj(trait.code,trait.dataId);
	valObj.multisetPop(trait.value);
}).
addBase('traitsOpCache_getCacheVal_has',function f(dataCode,dataId,value){
	const valObj=this.traitsOpCache_updateVal_has_getValObj(trait.code,trait.dataId);
	return valObj.multisetHas(value);
}).
// set
addBase('traitsOpCache_updateVal_set_getValObj',function f(dataCode,dataId){
	// `dataId` is not used
	const vals=this.traitsOpCache_getContVals();
	const key=this.traitsOpCache_genCacheKey(dataCode,'','set');
	let rtv=vals.get(key); if(!rtv) vals.set(key,rtv=[]);
	return rtv;
}).
addBase('traitsOpCache_updateVal_set_add',function f(trait){
	const valObj=this.traitsOpCache_updateVal_set_getValObj(trait.code);
	valObj.multisetPush(trait.dataId);
}).
addBase('traitsOpCache_updateVal_set_del',function f(trait){
	const valObj=this.traitsOpCache_updateVal_set_getValObj(trait.code);
	valObj.multisetPop(trait.dataId);
}).
addBase('traitsOpCache_getCacheVal_set',function f(dataCode,dataId){
	// `dataId` is not used
	// default value = []
	const valObj=this.traitsOpCache_updateVal_set_getValObj(dataCode);
	return valObj;
}).
// wId
addBase('traitsOpCache_updateVal_wId_getValObj',function f(dataCode,dataId){
	const vals=this.traitsOpCache_getContVals();
	const key=this.traitsOpCache_genCacheKey(dataCode,dataId,'wId');
	let rtv=vals.get(key); if(!rtv) vals.set(key,rtv=[]);
	return rtv;
}).
addBase('traitsOpCache_updateVal_wId_add',function f(trait){
	const valObj=this.traitsOpCache_updateVal_wId_getValObj(trait.code,trait.dataId);
	valObj.multisetPush(trait);
}).
addBase('traitsOpCache_updateVal_wId_del',function f(trait){
	const valObj=this.traitsOpCache_updateVal_wId_getValObj(trait.code,trait.dataId);
	valObj.multisetPop(trait);
}).
addBase('traitsOpCache_getCacheVal_wId',function f(dataCode,dataId){
	// default value = []
	return this.traitsOpCache_updateVal_wId_getValObj(dataCode,dataId);
}).
// vls
addBase('traitsOpCache_updateVal_vls_getValObj',function f(dataCode,dataId){
	const vals=this.traitsOpCache_getContVals();
	const key=this.traitsOpCache_genCacheKey(dataCode,dataId,'vls');
	let rtv=vals.get(key); if(!rtv) vals.set(key,rtv=[]);
	return rtv;
}).
addBase('traitsOpCache_updateVal_vls_add',function f(trait){
	const valObj=this.traitsOpCache_updateVal_vls_getValObj(trait.code,trait.dataId);
	valObj.multisetPush(trait.value);
}).
addBase('traitsOpCache_updateVal_vls_del',function f(trait){
	const valObj=this.traitsOpCache_updateVal_vls_getValObj(trait.code,trait.dataId);
	valObj.multisetPop(trait.value);
}).
addBase('traitsOpCache_getCacheVal_vls',function f(dataCode,dataId){
	// default value = []
	return this.traitsOpCache_updateVal_vls_getValObj(dataCode,dataId);
}).
// MId
addBase('traitsOpCache_updateVal_MId_getValObj',function f(dataCode,dataId,cmp3Func){
	// `dataId` is not used
	const vals=this.traitsOpCache_getContVals();
	const key=this.traitsOpCache_genCacheKey(dataCode,'','MId');
	let rtv=vals.get(key); if(!rtv) vals.set(key,rtv=({h:new Heap(cmp3Func),c:new Map(),}));
	return rtv;
}).
addBase('traitsOpCache_updateVal_MId_genEleVal',function f(traitDataId){
	return (traitDataId instanceof Array)?''+traitDataId:(traitDataId-0||0); // TODO: fully support non-literals
}).
addBase('traitsOpCache_updateVal_MId_add',function f(trait,cmp3Func){
	const valObj=this.traitsOpCache_updateVal_MId_getValObj(trait.code,undefined,cmp3Func);
	const eleVal=this.traitsOpCache_updateVal_MId_genEleVal(trait.dataId);
	const newVal=(valObj.c.get(eleVal)|0)+1;
	if(!newVal) valObj.c.delete(eleVal);
	else valObj.c.set(eleVal,newVal);
	valObj.h.push(trait.dataId);
}).
addBase('traitsOpCache_updateVal_MId_del',function f(trait,cmp3Func){
	const valObj=this.traitsOpCache_updateVal_MId_getValObj(trait.code,undefined,cmp3Func);
	const eleVal=this.traitsOpCache_updateVal_MId_genEleVal(trait.dataId);
	const newVal=(valObj.c.get(eleVal)|0)-1;
	if(!newVal) valObj.c.delete(eleVal);
	else valObj.c.set(eleVal,newVal);
	while(valObj.h.length&&!valObj.c.has(this.traitsOpCache_updateVal_MId_genEleVal(valObj.h.top))) valObj.h.pop();
}).
addBase('traitsOpCache_getCacheVal_MId',function f(dataCode,dataId,cmp3Func){
	// `dataId` is not used
	// default value = undefined (empty Heap .top)
	return this.traitsOpCache_updateVal_MId_getValObj(dataCode,undefined,cmp3Func).h.top;
}).
// change trait
addBase('_traitsOpCache_changeTrait_common',function f(trait,ops,tbl0){
	for(let x=ops.length;x--;){
		const func=tbl0.get(ops[x]);
		if(func) func.call(this,trait);
		else if(f.tbl[2]){ throw new Error('unknown op'); }
	}
},t).
addBase('traitsOpCache_addTrait',function f(trait){
	// not changing usedOps here
	if(!f.tbl[0]){ f.tbl[0]=new Map([
		['ccc', this.traitsOpCache_updateVal_ccc_add ],
		['wId', this.traitsOpCache_updateVal_wId_add ],
		['vls', this.traitsOpCache_updateVal_vls_add ],
		['sum', this.traitsOpCache_updateVal_sum_add ],
		['sac', this.traitsOpCache_updateVal_sac_add ],
		['mul', this.traitsOpCache_updateVal_mul_add ],
		//['has', this.traitsOpCache_updateVal_has_add ], // NOT USED
		['set', this.traitsOpCache_updateVal_set_add ],
		['MId', this.traitsOpCache_updateVal_MId_add ],
	]); }
	this._traitsOpCache_changeTrait_common(trait,
		this.traitsOpCache_getUsedOps(trait),
	f.tbl[0]);
},[
undefined, // op to func
t,
]).
addBase('traitsOpCache_delTrait',function f(trait){
	// not changing usedOps here
	if(!f.tbl[0]){ f.tbl[0]=new Map([
		['ccc', this.traitsOpCache_updateVal_ccc_del ],
		['wId', this.traitsOpCache_updateVal_wId_del ],
		['vls', this.traitsOpCache_updateVal_vls_del ],
		['sum', this.traitsOpCache_updateVal_sum_del ],
		['sac', this.traitsOpCache_updateVal_sac_del ],
		['mul', this.traitsOpCache_updateVal_mul_del ],
		//['has', this.traitsOpCache_updateVal_has_del ], // NOT USED
		['set', this.traitsOpCache_updateVal_set_del ],
		['MId', this.traitsOpCache_updateVal_MId_del ],
	]); }
	this._traitsOpCache_changeTrait_common(trait,
		this.traitsOpCache_getUsedOps(trait),
	f.tbl[0]);
},[
undefined, // op to func
t,
]).
getP;


// add / del traitObj
if(!getUrlParamVal('traitsOpCache-disabled')){ // testing
new cfc(Game_BattlerBase.prototype).
addBase('traitsOpCache_addTraitObj',function f(traitObj){
	const traits=traitObj&&traitObj.traits;
	if(traits) for(let x=traits.length;x--;) this.traitsOpCache_addTrait(traits[x]);
}).
addBase('traitsOpCache_delTraitObj',function f(traitObj){
	const traits=traitObj&&traitObj.traits;
	if(traits) for(let x=traits.length;x--;) this.traitsOpCache_delTrait(traits[x]);
}).
addBase('_traits',function f(code){
	if(!this.traitsOpCache_hasUsedOp(code,'','ccc')){
		this.traitsOpCache_addUsedOp(code,'','ccc');
		const traitObjs=this.traitObjects();
		for(let i=traitObjs.length;i--;){
			const traits=traitObjs[i].traits;
			for(let x=traits.length;x--;){
				const trait=traits[x];
				if(trait.code===code){
					this.traitsOpCache_updateVal_ccc_add(trait);
				}
			}
		}
	}
	return this.traitsOpCache_getCacheVal_ccc(code);
}).
addBase('traits',function f(code){
	return this._traits.apply(this,arguments).slice();
}).
addBase('_traitsSet',function f(code){
	if(!this.traitsOpCache_hasUsedOp(code,'','set')){
		this.traitsOpCache_addUsedOp(code,'','set');
			const traits=this._traits(code);
			for(let x=traits.length;x--;){
				const trait=traits[x];
					this.traitsOpCache_updateVal_set_add(trait);
			}
	}
	return this.traitsOpCache_getCacheVal_set(code);
}).
addBase('traitsSet',function f(code){
	return this._traitsSet.apply(this,arguments).slice();
}).
addBase('traitsHasId',function f(code,dataId){
	return this._traitsSet(code).multisetHas(dataId);
}).
addBase('traitsUniqueIds',function f(code){
	// ONLY used to iterate all unique id once. time overhead of `multisetUniques` is amortized.
	return this._traitsSet(code).multisetUniques();
}).
addBase('_traitsWithId',function f(code,id){
	if(!this.traitsOpCache_hasUsedOp(code,id,'wId')){
		this.traitsOpCache_addUsedOp(code,id,'wId');
			const traits=this._traits(code);
			for(let x=traits.length;x--;){
				const trait=traits[x];
				if(trait.dataId===id){
					this.traitsOpCache_updateVal_wId_add(trait);
				}
			}
	}
	return this.traitsOpCache_getCacheVal_wId(code,id);
}).
addBase('traitsWithId',function f(code,id){
	return this._traitsWithId.apply(this,arguments).slice();
}).
addBase('traitsSum',function f(code,id){
	if(!this.traitsOpCache_hasUsedOp(code,id,'sum')){
		this.traitsOpCache_addUsedOp(code,id,'sum');
		const traits=this._traitsWithId(code,id);
		for(let x=traits.length;x--;){
			this.traitsOpCache_updateVal_sum_add(traits[x]);
		}
	}
	return this.traitsOpCache_getCacheVal_sum(code,id);
}).
addBase('traitsSumAll',function f(code){
	if(!this.traitsOpCache_hasUsedOp(code,'','sac')){
		this.traitsOpCache_addUsedOp(code,'','sac');
			const traits=this._traits(code);
			for(let x=traits.length;x--;){
				const trait=traits[x];
					this.traitsOpCache_updateVal_sac_add(trait);
			}
	}
	return this.traitsOpCache_getCacheVal_sac(code);
}).
addBase('traitsPi',function f(code,id){
	if(!this.traitsOpCache_hasUsedOp(code,id,'mul')){
		this.traitsOpCache_addUsedOp(code,id,'mul');
		const traits=this._traitsWithId(code,id);
		for(let x=traits.length;x--;){
			this.traitsOpCache_updateVal_mul_add(traits[x]);
		}
	}
	return this.traitsOpCache_getCacheVal_mul(code,id);
}).
addBase('traitsMaxId',function f(code){
	if(!this.traitsOpCache_hasUsedOp(code,'','MId')){
		this.traitsOpCache_addUsedOp(code,'','MId');
			const traits=this._traits(code);
			for(let x=traits.length;x--;){
				const trait=traits[x];
					this.traitsOpCache_updateVal_MId_add(trait);
			}
	}
	return this.traitsOpCache_getCacheVal_MId(code)-0||0;
}).
// stateIds with icon
addBase('stateIdsWithIcon_init',function f(){
	// initializing here
	const code=f.tbl[0].code;
	if(!this.traitsOpCache_hasUsedOp(code,'','set')){
		this.traitsOpCache_addUsedOp(code,'','set');
		if(this._states) for(let i=this._states.length;i--;) this.stateIdsWithIcon_add(this._states[i]);
	}
},t=[
{code:"stateIdsWithIconValue",dataId:0,}, // dummy obj for chanceByDamage info
]).
addBase('stateIdsWithIcon_isTargetStateId',function f(stateId){
	// return the state's dataobj if stateId is (one of) the target(s)
	const dataobj=$dataStates[stateId];
	return dataobj&&0<dataobj.iconIndex?dataobj:undefined;
},t).
addBase('stateIdsWithIcon_add',function f(stateId){
	const dataobj=this.stateIdsWithIcon_isTargetStateId(stateId); if(!dataobj) return;
	this.stateIdsWithIcon_init();
	const trait=f.tbl[0];
	trait.dataId=stateId;
	this.traitsOpCache_updateVal_set_add(trait);
},t).
addBase('stateIdsWithIcon_del',function f(stateId){
	const dataobj=this.stateIdsWithIcon_isTargetStateId(stateId); if(!dataobj) return;
	this.stateIdsWithIcon_init();
	const trait=f.tbl[0];
	trait.dataId=stateId;
	this.traitsOpCache_updateVal_set_del(trait);
},t).
addBase('_stateIdsWithIcon_get',function f(){
	this.stateIdsWithIcon_init();
	return this.traitsOpCache_getCacheVal_set(f.tbl[0].code);
},t).
addBase('stateIdsWithIcon_getUniques',function f(){
	return this._stateIdsWithIcon_get().multisetUniques();
}).
addBase('stateIdsWithIcon_getAll',function f(){
	return this._stateIdsWithIcon_get().slice();
}).
addBase('stateIcons',function f(){
	return this.stateIdsWithIcon_getUniques().sort(this.sortStates_cmpFunc,this).map(f.tbl[0]);
},[
stateId=>$dataStates[stateId].iconIndex, // 0: map stateId to iconIndex
]).
// restriction
addBase('restriction_init',function f(){
	// initializing here
	const code=f.tbl[0].code;
	if(!this.traitsOpCache_hasUsedOp(code,'','MId')){
		this.traitsOpCache_addUsedOp(code,'','MId');
		if(this._states) for(let i=this._states.length;i--;) this.restriction_add(this._states[i]);
	}
},t=[
{code:"stateRestrictionValue",dataId:0,}, // dummy obj for restriction info
]).
addBase('restriction_add',function f(stateId){
	const dataobj=$dataStates[stateId]; if(!dataobj) return;
	this.restriction_init();
	const trait=f.tbl[0];
	trait.dataId=dataobj.restriction;
	this.traitsOpCache_updateVal_MId_add(trait);
},t).
addBase('restriction_del',function f(stateId){
	const dataobj=$dataStates[stateId]; if(!dataobj) return;
	this.restriction_init();
	const trait=f.tbl[0];
	trait.dataId=dataobj.restriction;
	this.traitsOpCache_updateVal_MId_del(trait);
},t).
addBase('restriction',function f(){
	// restriction_get
	this.restriction_init();
	return this.traitsOpCache_getCacheVal_MId(f.tbl[0].code)-0||0;
},t).
// cmp3 for heap: most important state on top
addBase('_get_cmp3ForHeap_mostImportantStateOnTop',function f(){
	return this.sortStates_cmpFunc_rev.bind(this);
},[
undefined, // 0: placeholder for Heap cmp3 func
]).
// msg3
addBase('mostImportantStateText_init',function f(){
	// initializing here
	const code=f.tbl[0].code;
	if(!this.traitsOpCache_hasUsedOp(code,'','MId')){
		this.traitsOpCache_addUsedOp(code,'','MId');
		if(this._states) for(let i=this._states.length;i--;) this.mostImportantStateText_add(this._states[i]);
	}
},t=[
{code:"stateMostImportantStateTextValue",dataId:0,}, // dummy obj for first sorted state info
]).
addBase('mostImportantStateText_getCmp3Func',function f(){
	return this._get_cmp3ForHeap_mostImportantStateOnTop();
},t).
addBase('mostImportantStateText_isTargetStateId',function f(stateId){
	// return the state's dataobj if stateId is (one of) the target(s)
	const dataobj=$dataStates[stateId];
	return dataobj&&dataobj.message3?dataobj:undefined;
}).
addBase('mostImportantStateText_add',function f(stateId){
	const dataobj=this.mostImportantStateText_isTargetStateId(stateId); if(!dataobj) return;
	this.mostImportantStateText_init();
	const trait=f.tbl[0];
	trait.dataId=stateId;
	this.traitsOpCache_updateVal_MId_add(trait,this.mostImportantStateText_getCmp3Func());
},t).
addBase('mostImportantStateText_del',function f(stateId){
	const dataobj=this.mostImportantStateText_isTargetStateId(stateId); if(!dataobj) return;
	this.mostImportantStateText_init();
	const trait=f.tbl[0];
	trait.dataId=stateId;
	this.traitsOpCache_updateVal_MId_del(trait,this.mostImportantStateText_getCmp3Func());
},t).
addBase('mostImportantStateText_get',function f(){
	// return first sorted state(with msg3)'s id
	this.mostImportantStateText_init();
	return this.traitsOpCache_getCacheVal_MId(f.tbl[0].code,undefined,this.mostImportantStateText_getCmp3Func());
},t).
addBase('mostImportantStateText',function f(){
	const dataobj=$dataStates[this.mostImportantStateText_get()];
	return dataobj?dataobj.message3:'';
}).
// first sorted state 
addBase('firstSortedState_init',function f(){
	// initializing here
	const code=f.tbl[0].code;
	if(!this.traitsOpCache_hasUsedOp(code,'','MId')){
		this.traitsOpCache_addUsedOp(code,'','MId');
		if(this._states) for(let i=this._states.length;i--;) this.firstSortedState_add(this._states[i]);
	}
},t=[
{code:"stateFirstSortedStateValue",dataId:0,}, // dummy obj for first sorted state info
]).
addBase('firstSortedState_getCmp3Func',function f(){
	return this._get_cmp3ForHeap_mostImportantStateOnTop();
},t).
addBase('firstSortedState_add',function f(stateId){
	const dataobj=$dataStates[stateId]; if(!dataobj) return;
	this.firstSortedState_init();
	const trait=f.tbl[0];
	trait.dataId=stateId;
	this.traitsOpCache_updateVal_MId_add(trait,this.firstSortedState_getCmp3Func());
},t).
addBase('firstSortedState_del',function f(stateId){
	const dataobj=$dataStates[stateId]; if(!dataobj) return;
	this.firstSortedState_init();
	const trait=f.tbl[0];
	trait.dataId=stateId;
	this.traitsOpCache_updateVal_MId_del(trait,this.firstSortedState_getCmp3Func());
},t).
addBase('firstSortedState_get',function f(){
	// return first sorted state's id
	this.firstSortedState_init();
	return this.traitsOpCache_getCacheVal_MId(f.tbl[0].code,undefined,this.firstSortedState_getCmp3Func());
},t).
addBase('stateMotionIndex',function f(){
	const dataobj=$dataStates[this.firstSortedState_get()];
	return dataobj?dataobj.motion:0;
}).
addBase('stateOverlayIndex',function f(){
	const dataobj=$dataStates[this.firstSortedState_get()];
	return dataobj?dataobj.overlay:0;
}).
// placeholders
addBase('removeStatesByTiming_add',none).
addBase('removeStatesByTiming_del',none).
addBase('removeStatesByDamage_add',none).
addBase('removeStatesByDamage_del',none).
addBase('removeStatesByBattleEnd_add',none).
addBase('removeStatesByBattleEnd_del',none).
addBase('removeStatesByRestriction_add',none).
addBase('removeStatesByRestriction_del',none).
addBase('removeStatesBySteps_add',none).
addBase('removeStatesBySteps_del',none).
// state common
addBase('traitsOpCache_addTraitObj_state',function f(stateId){
	// before actually change `this._states`
	const dataobj=$dataStates[stateId]; if(!dataobj) return;
	this.traitsOpCache_addTraitObj(dataobj);
	
	this.stateIdsWithIcon_add(stateId);
	this.restriction_add(stateId);
	this.mostImportantStateText_add(stateId);
	this.firstSortedState_add(stateId);
	this.removeStatesByTiming_add(stateId);
	this.removeStatesByDamage_add(stateId);
	this.removeStatesByBattleEnd_add(stateId);
	this.removeStatesByRestriction_add(stateId);
	this.removeStatesBySteps_add(stateId);
}).
addBase('traitsOpCache_delTraitObj_state',function f(stateId){
	// before actually change `this._states`
	const dataobj=$dataStates[stateId]; if(!dataobj) return;
	if(!this.isStateAffected(stateId)) return;
	this.traitsOpCache_delTraitObj(dataobj);
	
	this.stateIdsWithIcon_del(stateId);
	this.restriction_del(stateId);
	this.mostImportantStateText_del(stateId);
	this.firstSortedState_del(stateId);
	this.removeStatesByTiming_del(stateId);
	this.removeStatesByDamage_del(stateId);
	this.removeStatesByBattleEnd_del(stateId);
	this.removeStatesByRestriction_del(stateId);
	this.removeStatesBySteps_del(stateId);
}).
add('addNewState',function f(stateId){
	this.traitsOpCache_addTraitObj_state(stateId); // before actually change `this._states`
	return f.ori.apply(this,arguments);
}).
add('eraseState',function f(stateId){
	this.traitsOpCache_delTraitObj_state(stateId); // before actually change `this._states`
	return f.ori.apply(this,arguments);
}).
add('clearStates',function f(){
	if(this._states) for(let i=this._states.length;i--;) this.traitsOpCache_delTraitObj_state(this._states[i]);
	return f.ori.apply(this,arguments);
}).
add('die',function f(){
	const rtv=f.ori.apply(this,arguments);
	// due to getKeepWhenDeadStates
	if(this._states) for(let i=this._states.length;i--;) this.traitsOpCache_addTraitObj_state(this._states[i]);
	return rtv;
}).
addBase('traitsOpCache_changeDataobj',function f(oldData,newData){
	// update cache values from old to new
	if(oldData!==newData){
		this.traitsOpCache_delTraitObj(oldData);
		this.traitsOpCache_addTraitObj(newData);
	}
}).
// TODO: (traits|stateResistSet|attackElements|attackStates|addedSkillTypes|addedSkills|actionPlusSet|specialFlag|partyAbility)(?=\()
addBase('_attackElements',function(){
	return this._traitsSet(Game_BattlerBase.TRAIT_ATTACK_ELEMENT);
}).
addBase('attackElements',function(){
	return this._attackElements.apply(this,arguments).slice();
}).
getP;

new cfc(Game_Battler.prototype).
// removeStatesAuto
addBase('removeStatesByTiming_init',function f(){
	// initializing here
	const code=f.tbl[0].code;
	if(!this.traitsOpCache_hasUsedOp(code,'','vls')){
		this.traitsOpCache_addUsedOp(code,'','vls');
		if(this._states) for(let i=this._states.length;i--;) this.removeStatesByTiming_add(this._states[i]);
	}
},t=[
{code:"stateRemoveStatesByTimingValue",dataId:0,value:undefined,}, // dummy obj for removeStatesByTiming info
]).
addBase('removeStatesByTiming_init1',function f(timing){
	const code=f.tbl[0].code;
	if(!this.traitsOpCache_hasUsedOp(code,timing,'vls')){
		this.traitsOpCache_addUsedOp(code,timing,'vls');
	}
},t).
addBase('removeStatesByTiming_isTargetStateId',function f(stateId){
	// return the state's dataobj if stateId is (one of) the target(s)
	const dataobj=$dataStates[stateId];
	return dataobj&&dataobj[f.tbl[0]]?dataobj:undefined;
},[
'autoRemovalTiming', // 0: target key // only query for 1 and 2
]).
addBase('removeStatesByTiming_add',function f(stateId){
	const dataobj=this.removeStatesByTiming_isTargetStateId(stateId); if(!dataobj) return;
	this.removeStatesByTiming_init();
	const trait=f.tbl[0];
	trait.dataId=dataobj.autoRemovalTiming;
	trait.value=stateId;
	this.removeStatesByTiming_init1(trait.dataId);
	this.traitsOpCache_updateVal_vls_add(trait);
},t).
addBase('removeStatesByTiming_del',function f(stateId){
	const dataobj=this.removeStatesByTiming_isTargetStateId(stateId); if(!dataobj) return;
	this.removeStatesByTiming_init();
	const trait=f.tbl[0];
	trait.dataId=dataobj.autoRemovalTiming;
	trait.value=stateId;
	this.removeStatesByTiming_init1(trait.dataId);
	this.traitsOpCache_updateVal_vls_del(trait);
},t).
addBase('removeStatesByTiming_getStateIdsToBeRemoved',function f(timing){
	this.removeStatesByTiming_init();
	return this.traitsOpCache_getCacheVal_vls(f.tbl[0].code,timing).multisetUniques();
},t).
addBase('removeStatesAuto',function f(timing){
	const arr=this.removeStatesByTiming_getStateIdsToBeRemoved(timing);
	for(let x=arr.length;x--;) if(this.isStateExpired(arr[x])) this.removeState(arr[x]);
}).
// removeStatesByDamage
addBase('removeStatesByDamage_init',function f(){
	// initializing here
	const code=f.tbl[0].code;
	if(!this.traitsOpCache_hasUsedOp(code,'','set')){
		this.traitsOpCache_addUsedOp(code,'','set');
		if(this._states) for(let i=this._states.length;i--;) this.removeStatesByDamage_add(this._states[i]);
	}
},t=[
{code:"stateRemoveByDamageChanceValue",dataId:0,}, // dummy obj for chanceByDamage info
]).
addBase('removeStatesByDamage_isTargetStateId',function f(stateId){
	// return the state's dataobj if stateId is (one of) the target(s)
	const dataobj=$dataStates[stateId];
	return dataobj&&dataobj.removeByDamage?dataobj:undefined;
}).
addBase('removeStatesByDamage_add',function f(stateId){
	const dataobj=this.removeStatesByDamage_isTargetStateId(stateId); if(!dataobj) return;
	this.removeStatesByDamage_init();
	const trait=f.tbl[0];
	trait.dataId=stateId;
	this.traitsOpCache_updateVal_set_add(trait);
},t).
addBase('removeStatesByDamage_del',function f(stateId){
	const dataobj=this.removeStatesByDamage_isTargetStateId(stateId); if(!dataobj) return;
	this.removeStatesByDamage_init();
	const trait=f.tbl[0];
	trait.dataId=stateId;
	this.traitsOpCache_updateVal_set_del(trait);
},t).
addBase('removeStatesByDamage_getStateIdsToBeRemoved',function f(){
	// result may differ in each call due to the use of `Math.random()`.
	this.removeStatesByDamage_init();
	const valObj=this.traitsOpCache_getCacheVal_set(f.tbl[0].code);
	const arr=valObj.multisetUniques();
	const rtv=[];
	for(let x=arr.length;x--;){
		const state=$dataStates[arr[x]];
		if(Math.random()*100<state.chanceByDamage) rtv.push(arr[x]);
	}
	return rtv;
},t).
addBase('removeStatesByDamage',function f(){
	const arr=this.removeStatesByDamage_getStateIdsToBeRemoved();
	for(let x=arr.length;x--;) this.removeState(arr[x]);
}).
// removeBattleStates
addBase('removeStatesByBattleEnd_init',function f(){
	// initializing here
	const code=f.tbl[0].code;
	if(!this.traitsOpCache_hasUsedOp(code,'','set')){
		this.traitsOpCache_addUsedOp(code,'','set');
		if(this._states) for(let i=this._states.length;i--;) this.removeStatesByBattleEnd_add(this._states[i]);
	}
},t=[
{code:"stateRemoveStatesByBattleEndValue",dataId:0,}, // dummy obj for removeStatesByBattleEnd
]).
addBase('removeStatesByBattleEnd_isTargetStateId',function f(stateId){
	// return the state's dataobj if stateId is (one of) the target(s)
	const dataobj=$dataStates[stateId];
	return dataobj&&dataobj.removeAtBattleEnd?dataobj:undefined;
}).
addBase('removeStatesByBattleEnd_add',function f(stateId){
	const dataobj=this.removeStatesByBattleEnd_isTargetStateId(stateId); if(!dataobj) return;
	this.removeStatesByBattleEnd_init();
	const trait=f.tbl[0];
	trait.dataId=stateId;
	this.traitsOpCache_updateVal_set_add(trait);
},t).
addBase('removeStatesByBattleEnd_del',function f(stateId){
	const dataobj=this.removeStatesByBattleEnd_isTargetStateId(stateId); if(!dataobj) return;
	this.removeStatesByBattleEnd_init();
	const trait=f.tbl[0];
	trait.dataId=stateId;
	this.traitsOpCache_updateVal_set_del(trait);
},t).
addBase('removeStatesByBattleEnd_getStateIdsToBeRemoved',function f(){
	this.removeStatesByBattleEnd_init();
	return this.traitsOpCache_getCacheVal_set(f.tbl[0].code).slice();
},t).
addBase('removeBattleStates',function f(){
	const arr=this.removeStatesByBattleEnd_getStateIdsToBeRemoved();
	for(let x=arr.length;x--;) this.removeState(arr[x]);
}).
// onRestrict
addBase('removeStatesByRestriction_init',function f(){
	// initializing here
	const code=f.tbl[0].code;
	if(!this.traitsOpCache_hasUsedOp(code,'','set')){
		this.traitsOpCache_addUsedOp(code,'','set');
		if(this._states) for(let i=this._states.length;i--;) this.removeStatesByRestriction_add(this._states[i]);
	}
},t=[
{code:"stateRemoveByRestrictionValue",dataId:0,}, // dummy obj for removeStatesByRestriction info
]).
addBase('removeStatesByRestriction_isTargetStateId',function f(stateId){
	// return the state's dataobj if stateId is (one of) the target(s)
	const dataobj=$dataStates[stateId];
	return dataobj&&dataobj.removeByRestriction?dataobj:undefined;
}).
addBase('removeStatesByRestriction_add',function f(stateId){
	const dataobj=this.removeStatesByRestriction_isTargetStateId(stateId); if(!dataobj) return;
	this.removeStatesByRestriction_init();
	const trait=f.tbl[0];
	trait.dataId=stateId;
	this.traitsOpCache_updateVal_set_add(trait);
},t).
addBase('removeStatesByRestriction_del',function f(stateId){
	const dataobj=this.removeStatesByRestriction_isTargetStateId(stateId); if(!dataobj) return;
	this.removeStatesByRestriction_init();
	const trait=f.tbl[0];
	trait.dataId=stateId;
	this.traitsOpCache_updateVal_set_del(trait);
},t).
addBase('removeStatesByRestriction_getStateIdsToBeRemoved',function f(){
	this.removeStatesByRestriction_init();
	return this.traitsOpCache_getCacheVal_set(f.tbl[0].code).slice();
},t).
addBase('removeStatesByRestriction',function f(){
	const arr=this.removeStatesByRestriction_getStateIdsToBeRemoved();
	for(let x=arr.length;x--;) this.removeState(arr[x]);
}).
addBase('onRestrict',function f(){
	Game_BattlerBase.prototype.onRestrict.call(this);
	this.clearActions();
	this.removeStatesByRestriction();
}).
addBase('hasSkill_trait',function f(skillId){
	return this.traitsHasId(Game_BattlerBase.TRAIT_SKILL_ADD,skillId);
}).
getP;

new cfc(Game_Actor.prototype).
// onPlayerWalk_updateStatesSteps
addBase('removeStatesBySteps_init',function f(){
	// initializing here
	const code=f.tbl[0].code;
	if(!this.traitsOpCache_hasUsedOp(code,'','set')){
		this.traitsOpCache_addUsedOp(code,'','set');
		if(this._states) for(let i=this._states.length;i--;) this.removeStatesBySteps_add(this._states[i]);
	}
},t=[
{code:"stateRemoveStatesByStepsValue",dataId:0,}, // dummy obj for removeStatesBySteps
]).
addBase('removeStatesBySteps_isTargetStateId',function f(stateId){
	// return the state's dataobj if stateId is (one of) the target(s)
	const dataobj=$dataStates[stateId];
	return dataobj&&dataobj.removeByWalking?dataobj:undefined;
}).
addBase('removeStatesBySteps_add',function f(stateId){
	const dataobj=this.removeStatesBySteps_isTargetStateId(stateId); if(!dataobj) return;
	this.removeStatesBySteps_init();
	const trait=f.tbl[0];
	trait.dataId=stateId;
	this.traitsOpCache_updateVal_set_add(trait);
},t).
addBase('removeStatesBySteps_del',function f(stateId){
	const dataobj=this.removeStatesBySteps_isTargetStateId(stateId); if(!dataobj) return;
	this.removeStatesBySteps_init();
	const trait=f.tbl[0];
	trait.dataId=stateId;
	this.traitsOpCache_updateVal_set_del(trait);
},t).
addBase('removeStatesBySteps_getStateIdsToBeTested',function f(){
	this.removeStatesBySteps_init();
	return this.traitsOpCache_getCacheVal_set(f.tbl[0].code).multisetUniques();
},t).
addBase('onPlayerWalk_updateStatesSteps',function f(){
	const arr=this.removeStatesBySteps_getStateIdsToBeTested();
	for(let x=arr.length;x--;) if(!(0<--this._stateSteps[arr[x]])) this.removeState(arr[x]);
}).
getP;

new cfc(Game_Enemy.prototype).
add('transform',function f(enemyId){
	this.traitsOpCache_changeDataobj(
		this.enemy(),
		this.enemy(enemyId)
	);
	return f.ori.apply(this,arguments);
}).
getP;

new cfc(Game_Actor.prototype).
add('changeClass',function f(classId,keepExp){
	this.traitsOpCache_changeDataobj(
		this.currentClass(),
		this.currentClass(classId),
	);
	return f.ori.apply(this,arguments);
}).
add('setEquip',function f(slotId,item){
	this.traitsOpCache_changeDataobj(
		this.getEquip(slotId),
		item,
	);
	return f.ori.apply(this,arguments);
}).
addBase('attackElements',function(){
	let set=Game_Battler.prototype._attackElements.call(this);
	if(this.hasNoWeapons()){
		const bareHandsElementId=this.bareHandsElementId();
		if(!set.multisetHas(bareHandsElementId)){
			set=set.slice();
			set.push(bareHandsElementId);
		}
	}else set=set.slice();
	return set;
}).
getP;
} // if(not disabled by urlParam)


})(); // trait calc cache

// ---- ---- ---- ---- fix bug

(()=>{ let k,r,t;

new cfc(Window_Base.prototype).
addBase('convertEscapeCharacters',function f(text){
	if(f.tbl[0]&&window.isTest()){ console.warn(f.tbl[1]); }
	return text;
},[
false, // 0: enable msg? // too annoying
'this method is deprecated and should not be used', // 0: err msg
]).
addBase('processCharacter',function f(textState){
	const chr=textState.text[textState.index];
	const func=f.tbl[0][chr]||f.tbl[0]._default;
	return func&&func(this,textState);
},[
{
'\n':(self,textState)=>self.processNewLine(textState),
'\f':(self,textState)=>self.processNewPage(textState),
'\\':(self,textState)=>{
	if(textState.text[textState.index+1]==='\\'){ ++textState.index; return self.processNormalCharacter(textState); }
	self.processEscapeCharacter(self.obtainEscapeCode(textState),textState);
},
_default:(self,textState)=>self.processNormalCharacter(textState),
}, // 0: func tbl
]).
getP;


new cfc(Window_Selectable.prototype).addBase('maxPageRows',function(isReturnReal){
	const pageHeight=this.height-this.padding*2;
	return isReturnReal?pageHeight/this.itemHeight():~~(pageHeight/this.itemHeight());
}).addBase('maxPageItems',function f(){
	return Math.ceil(this.maxPageRows(true))*this.maxCols();
}).addBase('isCursorVisible',function f(){
	const rect=this.itemRect_curr();
	const c=this._windowContentsSprite;
	if(!c) return false;
	rect.x+=c.x;
	rect.y+=c.y;
	return rect.overlap(c);
}).add('processCursorMove',function f(){
	const idx=this.index();
	const rtv=f.ori.apply(this,arguments);
	if(isNaN(this.index())) this.select(idx);
	return rtv;
}).addBase('drawAllItems',function f(){
	let rtv=0;
	const idxB=this.topIndex(),sz=this.maxPageItems()+1,cnt=this.maxItems(); // +1 for non-align scrolling
	for(let i=0;i<sz;++i) if(idxB+i<cnt) ++rtv,this.drawItem(idxB+i);
	return rtv;
});

new cfc(Window_ChoiceList.prototype).add('contentsHeight',function f(){
	return Math.max(Math.min(this.windowHeight()-(this.standardPadding()<<1),f.ori.apply(this,arguments)),0)||0;
});

// handling too early refresh on sprites
if(0){
new cfc(Bitmap.prototype).add('_callLoadListeners',function f(){
	let rtv; try{
		rtv=f.ori.apply(this,arguments);
	}catch(e){} return rtv;
});
}else{
new cfc(Bitmap.prototype).add('_callLoadListeners',function f(){
	let rtv;
	while(0<this._loadListeners.length){
		try{
			rtv=f.ori.apply(this,arguments);
		}catch(e){}
	}
	return rtv;
});
}


new cfc(Game_BattlerBase.prototype).
addBase('attackStates',function f(){
	return this.traitsUniqueIds(Game_BattlerBase.TRAIT_ATTACK_STATE);
}).
getP;


// due to built-in API updated

new cfc(Bitmap.prototype).
add('drawText',function f(text, x, y, maxWidth, lineHeight, align){
	if(!f.tbl[0][5][0].has(arguments[5])){
		if(arguments.length<6) arguments.length=6;
		arguments[5]=f.tbl[0][5][1];
	}
	return f.ori.apply(this,arguments);
},[
[
undefined, // 0-0: 
undefined, // 0-1: 
undefined, // 0-2: 
undefined, // 0-3: 
undefined, // 0-4: 
[new Set(['left','center','right',]),'left'], // 0-5: valid align values
], // 0: valid values
]).
getP;


new cfc(Game_Party.prototype).
addBase('battleMembers',function() {
	const maxBattleMembers=this.maxBattleMembers();
	const allMembers=this.allMembers();
	const rtv=[];
	if(rtv.length<allMembers.length){ for(let x=0,xs=allMembers.length;x<xs;++x){
		const actor=allMembers[x];
		if(actor.isAppeared()){
			rtv.push(actor);
			if(rtv.length>=maxBattleMembers) break;
		}
	} }
	return rtv;
}).
getP;


})(); // fix bug



// ---- ---- ---- ---- final tune

(()=>{ let k,r,t;


// for flashbackText
{ const p=Window_Message.prototype,pp=Window_Base.prototype;
const keys=[
'processNormalCharacter',
'processNewLine',
'processNewPage',
'processEscapeCharacter',
'cloneTextInfo',
'setTextInfo',
];
for(let x=keys.length;x--;) if(p[keys[x]]===pp[keys[x]]) new cfc(p).addBase(keys[x],function f(){ return f._super[f._funcName].apply(this,arguments); });
}


})(); // final tune

// ---- ---- ---- ---- 

(()=>{ let k,r,t;


new cfc(SceneManager).add('run',function f(){
	setTimeout(exposeToTopFrame,f.tbl[0]);
	return f.ori.apply(this,arguments);
},[
1024,
]);


new cfc(Graphics).
addBase('showLatencyMeter',function f(){
	// ref: Graphics._switchFPSMeter
	this.showFps();
	this._fpsMeter.showDuration();
	this._fpsMeterToggled=true;
}).
getP;

new cfc(Scene_Boot.prototype).
add('terminate_showDebugInfo_condOk',function f(){
	return window.isTest();
}).
add('terminate_showDebugInfo_do',function f(){
	Graphics.showLatencyMeter();
}).
add('terminate_showDebugInfo',function f(){
	if(this.terminate_showDebugInfo_condOk.apply(this,arguments)) this.terminate_showDebugInfo_do.apply(this,arguments);
}).
add('terminate',function f(){
	this.terminate_showDebugInfo.apply(this,arguments);
	return f.ori.apply(this,arguments);
}).
getP;


})();

// ---- ---- ---- ---- 

})();

