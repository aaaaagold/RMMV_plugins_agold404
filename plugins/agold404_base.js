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
	if(this._childInterpreter) this._childInterpreter._parentInterpreter=this._childInterpreter;
	return rtv;
});
}
new cfc(Game_System.prototype).add('initialize',function f(){
	const rtv=f.ori.apply(this,arguments);
	this._rndId=LZString.compressToBase64(''+Date.now()+Math.random()+Math.random()).slice(11);
	return rtv;
}).add('saveBgs',function f(){
	this._savedBgs=AudioManager.saveBgs();
},undefined,false,true).add('replayBgs',function f(){
	if(this._savedBgs) AudioManager.replayBgs(this._savedBgs);
},undefined,false,true).add('saveBg',function f(){
	this.saveBgm();
	this.saveBgs();
},undefined,false,true).add('replayBg',function f(immediately){
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
}).add('applyGlobal_javascript',function f(){
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
{ const p=SceneManager;
p.isScene_battle =function(){ const sc=this._scene; return sc && sc.constructor===Scene_Battle; };
p.isScene_map    =function(){ const sc=this._scene; return sc && sc.constructor===Scene_Map;    };
}
//
SceneManager.getScConstructor=function(){ return this._scene && this._scene.constructor; };
// { const p=Window_BattleLog.prototype,k='displayAffectedStatus'; const r=p[k]; (p[k]=function(){}).ori=r; }
new cfc(Graphics).add('_requestFullScreen',function(){
	const element = getTopFrameWindow().document.body;
	if(element.requestFullScreen) element.requestFullScreen();
	else if(element.mozRequestFullScreen) element.mozRequestFullScreen();
	else if(element.webkitRequestFullScreen) element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
	else if(element.msRequestFullscreen) element.msRequestFullscreen();
},undefined,true,true).add('_isFullScreen',function(){
	const d=getTopFrameWindow().document;
	return ( (d.fullScreenElement && d.fullScreenElement !== null) || (!d.mozFullScreen && !d.webkitFullscreenElement && !d.msFullscreenElement) );
},undefined,true,true).add('_cancelFullScreen',function(){
	const d=getTopFrameWindow().document;
	if(d.cancelFullScreen) d.cancelFullScreen();
	else if(d.mozCancelFullScreen) d.mozCancelFullScreen();
	else if(d.webkitCancelFullScreen) d.webkitCancelFullScreen();
	else if(d.msExitFullscreen) d.msExitFullscreen();
},undefined,true,true);
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
}).add('_updateAsGameCanvas',function f(){
	const arr=document.querySelectorAll('.AsGameCanvas');
	for(let x=0,xs=arr.length;x!==xs;++x){
		this._centerElement(arr[x]);
		if((typeof f)===(typeof arr[x]._onCenterElement)) arr[x]._onCenterElement();
	}
}).add('addAsGameCanvas',function f(dom){
	if(!dom || !dom.classList) return;
	dom.classList.add('AsGameCanvas');
	this._centerElement(dom);
});
new cfc(Graphics).add('refGameSystem_get',function(){
	return this._refGameSystem;
}).add('refGameSystem_set',function(ref){
	if(ref===undefined) ref=$gameSystem;
	return this._refGameSystem=ref;
}).add('refGameSystem_isCurrent',function f(){
	return this.refGameSystem_get()===$gameSystem;
});
{ const p=TilingSprite.prototype;
p.isInScreen_local=p.isInScreen_local;
}
new cfc(Sprite.prototype).add('isInScreen_local',function(){
	// calc. local only to reduce calc.

	if(!this.visible || !this.alpha || !this.renderable) return;
	
	const a=this.anchor,s=this.scale;
	const sx=s.x,sy=s.y;
	const xo=this.x,yo=this.y,ws=this.width*sx,hs=this.height*sy;
	let x=xo-ws*a.x,xe=x+ws; if(xe<x){ let t=x; x=xe; xe=t; }
	let y=yo-hs*a.y,ye=y+hs; if(ye<y){ let t=y; y=ye; ye=t; }
	if(x>=Graphics._boxWidth||xe<0||y>=Graphics._boxHeight||ye<0) return; // out-of-bound
	
	return true;
});
new cfc(Graphics).add('isInScreen_rect',function(rect){
	return !(rect.x>=this.boxWidth || rect.x+rect.width<0 || rect.y>=this.boxHeight || rect.y+rect.height<0);
});
new cfc(Sprite_Character.prototype).add('renderWebGL',function f(){
	return this.isInScreen_local()&&f.ori.apply(this,arguments);
}).add('renderCanvas',function f(){
	return this.isInScreen_local()&&f.ori.apply(this,arguments);
});
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
new cfc(Input).add('isTexting_set',function f(){
	this._isTexting=true;
},undefined,false,true).add('isTexting_clear',function f(){
	this._isTexting=false;
},undefined,false,true).add('isTexting',function f(){
	return this._isTexting;
},undefined,false,true).add('_shouldPreventDefault',function f(keyCode){
	if(this.isTexting()) return false;
	return f.ori.apply(this,arguments);
});
t=[
none,
];
new cfc(TouchInput).add('_onTouchStart',function f(event){
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
},undefined,true,true).add('_onWheel',function f(evt){
	if(this.bypassPreventDefault_wheel_get(evt)) evt.preventDefault=f.tbl[0];
	return f.ori.apply(this,arguments);
},t).add('bypassPreventDefault_wheel_get',function f(){
	return this._bypassPreventDefault_wheel||this._bypassPreventDefault_wheel_stackSize;
}).add('bypassPreventDefault_wheel_set',function f(rhs){
	return this._bypassPreventDefault_wheel=rhs;
}).add('bypassPreventDefault_wheel_stackPushTrue',function f(){
	this._bypassPreventDefault_wheel_stackSize|=0;
	return ++this._bypassPreventDefault_wheel_stackSize;
}).add('bypassPreventDefault_wheel_stackPop',function f(){
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
},t).add('bypassPreventDefault_touch_get',function f(){
	return this._bypassPreventDefault_touch||this._bypassPreventDefault_touch_stackSize;
}).add('bypassPreventDefault_touch_set',function f(rhs){
	return this._bypassPreventDefault_touch=rhs;
}).add('bypassPreventDefault_touch_stackPushTrue',function f(){
	this._bypassPreventDefault_touch_stackSize|=0;
	return ++this._bypassPreventDefault_touch_stackSize;
}).add('bypassPreventDefault_touch_stackPop',function f(){
	this._bypassPreventDefault_touch|=0;
	return --this._bypassPreventDefault_touch_stackSize;
});
//
new cfc(AudioManager).add('audioFileExt',function f(){
	return f.tbl[0];
},[
'.ogg',
],true,true).add('createBuffer',function(folder, name) {
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
},undefined,false,true);
//
SceneManager._updateSceneCnt=0|0;
new cfc(SceneManager).add('isMapOrIsBattle',function f(){
	return this._scene&&f.tbl.has(this._scene.constructor);
},new Set([Scene_Map,Scene_Battle])).add('updateMain',function f(){
	if(Utils.isMobileSafari()){
		// this.updateInputData(); // already in .update
		this.changeScene_before();
		this.changeScene();
		this.changeScene_after();
		this.updateScene_before();
		this.updateScene();
		this.updateScene_after();
	}else{
		const newTime=this._getTimeInMsWithoutMobileSafari();
		const fTime=Math.min((newTime-this._currentTime)/1000,f.tbl[0]);
		this._currentTime=newTime;
		this._accumulator+=fTime;
		for(;this._accumulator>=this._deltaTime;this._accumulator-=this._deltaTime){
			this.updateInputData();
			this.changeScene_before();
			this.changeScene();
			this.changeScene_after();
			this.updateScene_before();
			this.updateScene();
			this.updateScene_after();
		}
	}
	this.renderScene_before();
	this.renderScene();
	this.renderScene_after();
	this.requestUpdate();
},[0.25,],true,true).add('additionalUpdate_doArr',function f(arr){
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
]).add('changeScene_before',function f(){
	this.additionalUpdate_doArr(this.additionalUpdate_changeScene_getBefore());
}).add('changeScene_after',function f(){
	this.additionalUpdate_doArr(this.additionalUpdate_changeScene_getAfter());
}).add('additionalUpdate_changeScene_getBefore',function f(){
	let rtv=this._additionalUpdate_changeScene_before; if(!rtv) rtv=this._additionalUpdate_changeScene_before=[];
	return rtv;
}).add('additionalUpdate_changeScene_getAfter',function f(){
	let rtv=this._additionalUpdate_changeScene_after; if(!rtv) rtv=this._additionalUpdate_changeScene_after=[];
	return rtv;
}).add('additionalUpdate_changeScene_add',function f(func,isAfter){
	const arr=isAfter?this.additionalUpdate_changeScene_getAfter():this.additionalUpdate_changeScene_getBefore();
	arr.push(func);
}).add('updateScene_before',function f(){
	this.additionalUpdate_doArr(this.additionalUpdate_updateScene_getBefore());
}).add('updateScene_after',function f(){
	this.additionalUpdate_doArr(this.additionalUpdate_updateScene_getAfter());
}).add('additionalUpdate_updateScene_getBefore',function f(){
	let rtv=this._additionalUpdate_updateScene_before; if(!rtv) rtv=this._additionalUpdate_updateScene_before=[];
	return rtv;
}).add('additionalUpdate_updateScene_getAfter',function f(){
	let rtv=this._additionalUpdate_updateScene_after; if(!rtv) rtv=this._additionalUpdate_updateScene_after=[];
	return rtv;
}).add('additionalUpdate_updateScene_add',function f(func,isAfter){
	const arr=isAfter?this.additionalUpdate_updateScene_getAfter():this.additionalUpdate_updateScene_getBefore();
	arr.push(func);
}).add('renderScene_before',function f(){
	this.additionalUpdate_doArr(this.additionalUpdate_renderScene_getBefore());
}).add('renderScene_after',function f(){
	this.additionalUpdate_doArr(this.additionalUpdate_renderScene_getAfter());
}).add('additionalUpdate_renderScene_getBefore',function f(){
	let rtv=this._additionalUpdate_renderScene_before; if(!rtv) rtv=this._additionalUpdate_renderScene_before=[];
	return rtv;
}).add('additionalUpdate_renderScene_getAfter',function f(){
	let rtv=this._additionalUpdate_renderScene_after; if(!rtv) rtv=this._additionalUpdate_renderScene_after=[];
	return rtv;
}).add('additionalUpdate_renderScene_add',function f(func,isAfter){
	const arr=isAfter?this.additionalUpdate_renderScene_getAfter():this.additionalUpdate_renderScene_getBefore();
	arr.push(func);
}).add('updateScene',function f(){
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
},undefined,false,true);
//
new cfc(Window_Base.prototype).add('positioning',function f(setting,ref){
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
},{}).add('processCStyleStringContent',function f(textState){
	const info=getCStyleStringStartAndEndFromString(textState.text,textState.index);
	if(info.start<info.end){
		textState.index=info.end;
		return JSON.parse(textState.text.slice(info.start,info.end));
	}else return f.tbl[0];
},[''],true,true);
//
new cfc(Window_Selectable.prototype).add('processCursorMove',function f(){
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
		const C=this.maxCols();
		if(idx>=C) this.select(idx%C);
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
}).add('itemRect_curr',function f(){
	return this.itemRect(this.index());
}).add('itemRect_scrollRectInView',function f(rect){
	let scy=this._scrollY;
	const maxH=this.contentsHeight(); if(!(0<maxH)) return; // initialize
	const top=rect.y;
	const btm=rect.y+rect.height;
	const db=maxH-btm;
	if(db<0) scy-=db;
	if(top<0) scy+=top;
	if(scy===this._scrollY) return;
	this._scrollY=scy;
}).add('ensureCursorVisible',function f(){
	if(!(this.index()>=0)) return;
	const rect=this.itemRect_curr(); // origin: scrolled origin
	this.itemRect_scrollRectInView(rect);
	this.refresh();
	this.updateCursor();
}).add('scrollDist',function f(){
	return f.tbl[0];
},[
32,
]).add('scrollDown',function f(){
	if(!(this.index()>=0)) return;
	let scy=this._scrollY;
	const rectEnd=this.itemRect(this.maxItems());
	rectEnd.y+=scy;
	scy+=this.scrollDist();
	const overflowY=this.contentsHeight()-(rectEnd.y-scy);
	if(0<overflowY) scy-=overflowY;
	if(scy<=this._scrollY) return;
	this._scrollY=scy;
	this.refresh();
	this.updateCursor();
},undefined,false,true).add('scrollUp',function f(){
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
},undefined,false,true).add('itemRect',function f(index){
	const rect = new Rectangle();
	const maxCols = this.maxCols();
	rect.width = this.itemWidth();
	rect.height = this.itemHeight();
	rect.x = index % maxCols * (rect.width + this.spacing()) - this._scrollX;
	rect.y = Math.floor(index / maxCols) * (rect.height + this.itemSpacingY()) - this._scrollY;
	return rect;
},undefined,false,true).add('itemSpacingY',function f(){
	return 0;
},undefined,false,true).add('updateArrows',function f(){
	let scy=this._scrollY;
	const rectBeg=this.itemRect(0);
	const rectBtm=this.itemRect(this.maxItems()-this.maxCols());
	this.downArrowVisible=this.contentsHeight()<rectBtm.y+rectBtm.height;
	this.upArrowVisible=rectBeg.y<0;
},undefined,false,true);
t[0].forEach(info=>Input.keyMapper[info[0]]=info[1]);
t=undefined;
//
new cfc(Window_SkillList.prototype).add('item',function f(idx){
	if(idx===undefined) idx=this.index();
	return this._data && idx >= 0 ? this._data[idx] : null;
});
//
new cfc(Window_Base.prototype).add('updateClose',function f(){
	const isClosed=this.isClosed();
	const rtv=f.ori.apply(this,arguments);
	if(!isClosed && this.isClosed()) this.onclosed();
	return rtv;
}).add('onclosed',function f(){
},undefined,false,true);
new cfc(Window_Message.prototype).add('onclosed',function f(){
	Window_Base.prototype.onclosed.apply(this,arguments);
	if(this._positionType!==2 && this._choiceWindow && this._choiceWindow.updatePlacement){ this.updatePlacement(); this._choiceWindow.updatePlacement(); }
},undefined,false,true);
if(Window_Message.prototype.updateClose===Window_Base.prototype.updateClose){
new cfc(Window_Message.prototype).add('updateClose',function f(){
	const rtv=Window_Base.prototype.updateClose.apply(this,arguments);
	return rtv;
},undefined,false,true);
}
//
new cfc(Scene_Base.prototype).add('_prevScene_store',function f(){
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
],true,true).add('_prevScene_restore',function f(){
	// called in 'scene.create', after background created
	if(this._oriStop){
		const sc=this._prevScene; // if this._oriStop!==undefined, sc!==undefined // already stopped 
		if(this._oriStop===sc.constructor.prototype.stop) delete sc.stop;
		else sc.stop=this._oriStop;
	}
	if(this._lastBgBm) SceneManager._backgroundBitmap=this._lastBgBm;
},t,true,true);
//
new cfc(DataManager).add('isSkill',function f(item){
	return item && $dataSkills.uniqueHas(item);
}).add('isItem',function f(item){
	return item && $dataItems.uniqueHas(item);
}).add('isWeapon',function f(item){
	return item && $dataWeapons.uniqueHas(item);
}).add('isArmor',function f(item){
	return item && $dataArmors.uniqueHas(item);
}).add('loadDataFile',function f(name,src,msg,directSrc,mimeType,method,data){
	method=method||'GET';
	mimeType=mimeType||'application/json';
	const xhr=new XMLHttpRequest();
	src=directSrc?src:('data/'+src);
	xhr.open(method,src);
	xhr.overrideMimeType(mimeType);
	xhr.onload = f.tbl[0].bind(xhr,name,src,msg);
	xhr.onerror = this._mapLoader || f.tbl[1].bind(xhr,src);
	window[name] = null;
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
],true,true).add('onLoad',function f(obj,name,src,msg){
	this.onLoad_before.apply(this,arguments);
	const rtv=f.ori.apply(this,arguments);
	this.onLoad_after.apply(this,arguments);
	return rtv;
},undefined,true).add('onLoad_before',function f(obj,name,src,msg){
	const func=f.tbl.get(name);
	return func && func.apply(this,arguments);
},undefined,true).add('onLoad_after',function f(obj,name,src,msg){
	const func=f.tbl.get(name);
	return func && func.apply(this,arguments);
},undefined,true).add('_onLoad_before_map',function f(obj,name,src,msg){
	return this.onLoad_before_map.apply(this,arguments);
},undefined,true,true).add('_onLoad_after_map',function f(obj,name,src,msg){
	return this.onLoad_after_map.apply(this,arguments);
},undefined,true,true).add('onLoad_before_map',function f(obj,name,src,msg){
	// dummy
},undefined,true,true).add('onLoad_after_map',function f(obj,name,src,msg){
	// dummy
},undefined,true,true).add('_onLoad_before_skill',function f(obj,name,src,msg){
	return this.onLoad_before_skill.apply(this,arguments);
},undefined,true,true).add('_onLoad_after_skill',function f(obj,name,src,msg){
	return this.onLoad_after_skill.apply(this,arguments);
},undefined,true,true).add('onLoad_before_skill',function f(obj,name,src,msg){
	// dummy
},undefined,true,true).add('onLoad_after_skill',function f(obj,name,src,msg){
	// dummy
},undefined,true,true).add('_onLoad_before_tileset',function f(obj,name,src,msg){
	return this.onLoad_before_tileset.apply(this,arguments);
},undefined,true,true).add('_onLoad_after_tileset',function f(obj,name,src,msg){
	return this.onLoad_after_tileset.apply(this,arguments);
},undefined,true,true).add('onLoad_before_tileset',function f(obj,name,src,msg){
	// dummy
},undefined,true,true).add('onLoad_after_tileset',function f(obj,name,src,msg){
	// dummy
},undefined,true,true);
{ const p=DataManager;
p.onLoad_before.tbl=new Map([
	['$dataMap',	p._onLoad_before_map],
	['$dataSkills',	p._onLoad_before_skill],
	['$dataTilesets',	p._onLoad_before_tileset],
]);
p.onLoad_after.tbl=new Map([
	['$dataMap',	p._onLoad_after_map],
	['$dataSkills',	p._onLoad_after_skill],
	['$dataTilesets',	p._onLoad_after_tileset],
]);
}
//
new cfc(WebAudio.prototype).add('_load',function f(url,noerr,putCacheOnly){
	if(!WebAudio._context) return;
	const xhr=new XMLHttpRequest();
	xhr._needDecrypt=false;
	if(Decrypter.hasEncryptedAudio && !ImageManager.isDirectPath(url)){
		url=Decrypter.extToEncryptExt(url);
		xhr._needDecrypt=true;
	}
	const cache=this._getCache(url); if(cache) return !(this._putCacheOnly||putCacheOnly)&&this._onXhrLoad(undefined,url,cache.slice());
	xhr.open('GET',url);
	xhr.responseType='arraybuffer';
	xhr.onload=f.tbl[0].bind(this,xhr,url,this._putCacheOnly||putCacheOnly);
	xhr.onerror=(this._noerr||noerr)?none:(this._loader||function(){this._hasError=true;}.bind(this));
	xhr.send();
},[
function(xhr,url,putCacheOnly){ if(xhr.status<400) this._onXhrLoad(xhr,url,undefined,putCacheOnly); },
],false,true).add('_onXhrLoad',function f(xhr,url,arrayBuffer,putCacheOnly){
	let array=arrayBuffer||xhr&&xhr.response;
	if(!arrayBuffer){
		if(xhr._needDecrypt && Decrypter.hasEncryptedAudio && !ImageManager.isDirectPath(url)) array=Decrypter.decryptArrayBuffer(array);
		this._setCache(url,array.slice());
	}
	if(putCacheOnly) return;
	this._readLoopComments(new Uint8Array(array));
	WebAudio._context.decodeAudioData(array,f.tbl[0].bind(this));
	return array;
},[
function(buffer){
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
}
],false,true).add('initialize',function f(url,noerr,putCacheOnly){
	this._noerr=noerr;
	this._putCacheOnly=putCacheOnly;
	return f.ori.apply(this,arguments);
}).add('_setCache',function f(url,arrayBuffer){
	this.getCacheCont().setCache(url,arrayBuffer,arrayBuffer.byteLength);
},undefined,false,true).add('_getCache',function f(url){
	return this.getCacheCont().getCache(url);
},undefined,false,true).add('getCacheCont',function f(){
	//const tw=getTopFrameWindow();
	//if(!WebAudio._cache) WebAudio._cache=tw._webAudioCache=tw._webAudioCache||new LruCache(f.tbl[0],f.tbl[1]);
	// do not cache on top for flexibility of file content changes
	if(!WebAudio._cache) WebAudio._cache=new LruCache(f.tbl[0],f.tbl[1]);
	return WebAudio._cache;
},[404,1<<26],false,true);
//
Decrypter._notFoundCache=new Set();
new cfc(Decrypter).add('decryptImg',function f(url,bitmap){
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
		const arrayBuffer=Decrypter.decryptArrayBuffer(this.response);
		Decrypter._setCache(url,arrayBuffer.slice());
		Decrypter._onXhrLoad(bitmap,arrayBuffer);
	}else this.onerror();
},
function(bitmap){
	if(bitmap._loader) bitmap._loader();
	else bitmap._onError();
},
],false,true).add('_onXhrLoad',function f(bitmap,arrayBuffer){
	bitmap._image.addEventListener('load',bitmap._loadListener=Bitmap.prototype._onLoad.bind(bitmap));
	bitmap._image.addEventListener('error',bitmap._errorListener=bitmap._loader||Bitmap.prototype._onError.bind(bitmap));
	bitmap._image.src=Decrypter.createBlobUrl(arrayBuffer);
},undefined,false,true).add('decryptImg',function f(url,bitmap){
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
]).add('_setCache',function f(url,arrayBuffer){
	this.getCacheCont().setCache(url,arrayBuffer,arrayBuffer.byteLength);
},undefined,false,true).add('_getCache',function f(url){
	return this.getCacheCont().getCache(url);
},undefined,false,true).add('getCacheCont',function f(){
	const tw=getTopFrameWindow();
	if(!this._cache) this._cache=tw._decryptImgCache=tw._decryptImgCache||new LruCache(f.tbl[0],f.tbl[1]);
	return this._cache;
},[404,1<<28],false,true);
new cfc(WebAudio.prototype).add('_load',function f(url){
	if(!Decrypter.hasEncryptedAudio || ImageManager.isDirectPath(url) || Decrypter._notFoundCache.has(url) || getUrlParamVal('disableCustom')) return f.ori.apply(this,arguments);
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
new cfc(Game_Party.prototype).add('partyAbility_sumAll',function f(dataId){
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
		arr.push('AudioManager','BattleManager','ConfigManager','DataManager','ImageManager','SceneManager',);
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

// ---- ---- ---- ---- load other files

new cfc(ImageManager).add('otherFiles_getDataMap',function f(){
	let m=this._otherFiles; if(!m) m=this._otherFiles=new Map();
	return m;
}).add('otherFiles_getPendedSet',function f(){
	let s=this._otherFiles_pended; if(!s) s=this._otherFiles_pended=new Set();
	return s;
}).add('otherFiles_getData',function f(path){
	const m=this.otherFiles_getDataMap();
	return m.get(path);
}).add('otherFiles_delData',function f(path){
	const m=this.otherFiles_getDataMap(),s=this.otherFiles_getPendedSet();
	const rtv=m.get(path);
	m.delete(path);
	s.delete(path);
	return rtv;
}).add('otherFiles_delDataAll',function f(){ // for debug
	const m=this.otherFiles_getDataMap(),s=this.otherFiles_getPendedSet();
	m.forEach(f.tbl[0].bind(m));
	s.forEach(f.tbl[0].bind(s));
},[
function(v,k){this.delete(k);},
]).add('otherFiles_addLoad',function f(path){
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
}).add('otherFiles_isAllLoaded',function f(){
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
				e.message+=getStr_英文不好齁()+f.tbl[1][1];
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
]).add('command355',function f(){
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
			e.message+=getStr_英文不好齁()+f.tbl[1][1];
		}
		e.name+=' in ';
		e.name+=f.tbl[0];
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

new cfc(Game_Action.prototype).add('evalDamageFormula',function f(target){
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
				e.message+=getStr_英文不好齁()+f.tbl[1][1];
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
],true,true);

})(); // js error

// ---- ---- ---- ---- re-unify

(()=>{ let k,r,t;

new cfc(Game_Actor.prototype).add('getData',function f(){
	return this.actor();
},undefined,false,true);

new cfc(Game_Enemy.prototype).add('getData',function f(){
	return this.enemy();
},undefined,false,true);

new cfc(Game_Unit.prototype).add('allMembers',function(){
	return this.members();
},undefined,false,true);

})(); // re-unify

// ---- ---- ---- ---- event page note

(()=>{ let k,r,t;

new cfc(DataManager).add('onLoad_before_map',function f(obj,name,src,msg){
	const rtv=f.ori.apply(this,arguments);
	this.onload_addMapEvtPgNote.apply(this,arguments);
	return rtv;
}).add('onload_addMapEvtPgNote',function f(obj,name,src,msg){
	obj.events.forEach(f.tbl[0]);
},[
evtd=>{ if(!evtd) return;
	for(let pgi=0,pgs=evtd.pages,pgsz=pgs.length;pgi!==pgsz;++pgi){
		const pg=pgs[pgi],noteLines=[];
		for(let isNote=false,li=0,L=pg.list,lsz=L.length;li!==lsz;++li){
			const cmd=L[li];
			if(cmd.code===108){
				if(cmd.parameters[0]==="@NOTE") isNote=true;
			}else if(cmd.code===408){
			}else isNote=false;
			if(isNote) noteLines.push(cmd.parameters[0]);
		}
		pg.note=noteLines.join('\n');
		DataManager.extractMetadata(pg);
	}
},
],false,true);

})(); // event page note

// ---- ---- ---- ---- gameObj2sprite

(()=>{ let k,r,t;

new cfc(Sprite_Character.prototype).add('setCharacter',function f(){
	{ const sc=SceneManager._scene; if(sc){
		if(!sc._chr2sp) sc._chr2sp=new Map();
		sc._chr2sp.set(arguments[0],this);
	} }
	return f.ori.apply(this,arguments);
}).add('updatePosition',function f(){
	const chr=this._character;
	this.position.set(chr.screenX(),chr.screenY());
	this.z=chr.screenZ();
},undefined,false,true);

new cfc(Sprite_Battler.prototype).add('setBattler',function f(){
	const rtv=f.ori.apply(this,arguments);
	const sc=SceneManager._scene;
	if(sc){
		if(!sc._btlr2sp) sc._btlr2sp=new Map();
		sc._btlr2sp.set(this._battler,this);
	}
	return rtv;
}).add('updatePosition',function f(){
	this.position.set( this._homeX+this._offsetX , this._homeY+this._offsetY );
},undefined,false,true);

new cfc(Game_Character.prototype).add('getSprite',function f(){
	const sc=SceneManager._scene;
	const m=sc&&sc._chr2sp;
	return m&&m.get(this);
},undefined,false,true);

new cfc(Game_Battler.prototype).add('getSprite',function f(){
	const sc=SceneManager._scene;
	const m=sc&&sc._btlr2sp;
	return m&&m.get(this);
},undefined,false,true);

})(); // gameObj2sprite

// ---- ---- ---- ---- shorthand

(()=>{ let k,r,t;

new cfc(Game_Character.prototype).add('jumpTo',function f(x,y){
	this.jump(x-this.x,y-this.y);
	return this;
},undefined,true,true).add('frontPos',function f(){
	const d=this.direction();
	return {
		x:$gameMap.roundXWithDirection(this.x,d),
		y:$gameMap.roundYWithDirection(this.y,d),
	};
},undefined,true,true).add('jumpFront',function f(dist){
	let dx=0,dy=0;
	if(0<(dist|=0)){
		const xy=this.frontPos();
		dx+=(xy.x-this.x)*dist;
		dy+=(xy.y-this.y)*dist;
	}
	this.jump(dx,dy);
	return this;
});

new cfc(Game_Event.prototype).add('setChrIdxName',function f(chrIdx,chrName){
	this._characterIndex=chrIdx;
	this._characterName=chrName;
},undefined,true,true).add('setupPageSettings',function f(){
	const rtv=this.page();
	f.ori.apply(this,arguments);
	return rtv;
},undefined,true);

new cfc(Game_Interpreter.prototype).add('getEvt',function f(){
	// map init ensures '_events' be Array
	return $gameMap&&$gameMap._events[this._eventId];
},undefined,true,true).add('getCmd',function f(offset){
	offset|=0;
	return this._list&&this._list[this._index+offset];
},undefined,true,true);

SceneManager.getTilemap=function(){
	const sc=this._scene;
	const sps=sc&&sc._spriteset;
	return sps&&sps._tilemap;
};

})(); // shorthand

// ---- ---- ---- ---- 支援前場景暫存恢復+確保下個場景要預讀(in initialize)的東西好了 // ImageManager.isReady()

(()=>{ let k,r,t;

new cfc(SceneManager).add('push',function f(sceneClass,shouldRecordCurrentScene){
	this._stack.push(this._scene.constructor);
	this.goto(sceneClass,shouldRecordCurrentScene);
	if(shouldRecordCurrentScene && this._nextScene) this._nextScene._prevScene=this._scene;
	return this._nextScene && this._nextScene._prevScene;
},undefined,true,true).add('changeScene',function f(){
	if(this.isSceneChanging() && !this.isCurrentSceneBusy() && ImageManager.isReady()){
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
	}
},[
3, // max call count of 'this.terminate();'
],true,true);

})(); // 支援前場景暫存恢復+確保下個場景要預讀(in initialize)的東西好了 // ImageManager.isReady()

// ---- ---- ---- ---- scene.start before/after

new cfc(Scene_Base.prototype).add('start_after',function f(){
}).add('start_before',function f(){
});

new cfc(Scene_Boot.prototype).add('start_after',function f(){
	return Scene_Base.prototype.start_after.apply(this,arguments);
}).add('start_before',function f(){
	return Scene_Base.prototype.start_before.apply(this,arguments);
});

// ---- ---- ---- ---- scene.terminate before/after + clean scene child

new cfc(Scene_Base.prototype).add('terminate_after',function f(){
	if(this.children){ while(this.children.length){
		const currLen=this.children.length;
		const sp=this.children.back;
		if(sp.destroy) sp.destroy();
		// preventing 'sp.destroy' is modified
		if(this.children.length===currLen) this.removeChildAt(this.children.length-1);
	} }
}).add('terminate_before',function f(){
});

new cfc(Scene_Boot.prototype).add('terminate_after',function f(){
	return Scene_Base.prototype.terminate_after.apply(this,arguments);
}).add('terminate_before',function f(){
	return Scene_Base.prototype.terminate_before.apply(this,arguments);
});

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
sp=>sp.refresh_do(),
]).add('addRefresh',function f(obj,forcePending){
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
],true,true);
}

{ const p=Sprite.prototype;
p.refresh_do=p._refresh;
p._refresh=function f(){ SceneManager.addRefresh(this); };
}

})(); // lazy refresh

// ---- ---- ---- ---- btlr.getParty

new cfc(Game_Battler.prototype).add('getParty',function f(){
	const func=f.tbl[0].get(this.constructor);
	return func&&func();
},[
new Map([
[Game_Enemy,()=>$gameTroop,],
[Game_Actor,()=>$gameParty,],
]), // 0: 
]);

// ---- ---- ---- ---- Tilemap / Spriteset

(()=>{ let k,r,t;

new cfc(Tilemap.prototype).add('initialize',function(margin) {
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
},undefined,false,true);

new cfc(Spriteset_Base.prototype).add('updatePosition',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.updatePosition_CanvasToneChanger();
	return rtv;
}).add('updatePosition_CanvasToneChanger',function f(){
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
}).add('createdPosition3AnimationInTheFrame_reset',function f(){
	Sprite_Animation._createdPosition3AnimationsInTheFrame.clear();
}).add('createdPosition3AnimationInTheFrame_add',function f(dataobj){
	const s=Sprite_Animation._createdPosition3AnimationsInTheFrame;
	const sz=s.size;
	if(dataobj&&dataobj.position===3){
		s.add(dataobj);
		return s.size-sz;
	}
	return -1;
}).add('createdPosition3AnimationInTheFrame_has',function f(dataobj){
	return Sprite_Animation._createdPosition3AnimationsInTheFrame.has(dataobj);
});

new cfc(Sprite_Animation.prototype).add('update',function f(){
	Sprite.prototype.update.call(this);
	this.updateMain();
	this.updateFlash();
	this.updateScreenFlash();
	this.updateHiding();
},undefined,false,true).add('createSprites',function f(){
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
new cfc(Game_System.prototype).add('animationOptions_get',function f(){
	let rtv=this._aniOpt;
	if(!rtv){
		rtv=this._aniOpt={};
		for(let x=0,arr=f.tbl[0],xs=arr.length;x!==xs;++x) rtv[arr[x][0]]=arr[x][1];
	}
	return rtv;
},t,true,true).add('animationOptions_reset',function f(){
	const opt=this.animationOptions_get();
	for(let x=0,arr=f.tbl[0],xs=arr.length;x!==xs;++x) opt[arr[x][0]]=arr[x][1];
	return this;
},t,true,true).add('animationOptions_setRotate',function f(rotate){
	const opt=this.animationOptions_get();
	opt.rotate=rotate;
	return this;
},t,true,true).add('animationOptions_setScaleX',function f(scalex){
	const opt=this.animationOptions_get();
	opt.scalex=scalex;
	return this;
},t,true,true).add('animationOptions_setScaleY',function f(scaley){
	const opt=this.animationOptions_get();
	opt.scaley=scaley;
	return this;
},t,true,true).add('animationOptions_setScale',function f(scale){
	return this.animationOptions_setScaleX(scale).animationOptions_setScaleY(scale);
},t,true,true).add('animationOptions_setDelay',function f(delay){
	const opt=this.animationOptions_get();
	opt.delay=delay;
	return this;
},t,true,true).add('animationOptions_setDRate',function f(drate){
	const opt=this.animationOptions_get();
	opt.drate=drate;
	return this;
},t,true,true).add('animationOptions_setOnTop',function f(onTop){
	const opt=this.animationOptions_get();
	opt.onTop=onTop;
	return this;
},t,true,true).add('animationOptions_set',function f(newOpt){
	const opt=this.animationOptions_get();
	for(let x=0,arr=f.tbl[0],xs=arr.length;x!==xs;++x) if(arr[x][0] in newOpt) opt[arr[x][0]]=newOpt[arr[x][0]];
	return this;
},t,true,true).add('animationOptions_applyTo',function f(opt,carryingOn){
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
},t,true,true);


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
}).add('start_before_aniNote',function f(idx){
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
},t).add('setupRate',none);

new cfc(Game_Character.prototype).add('requestAnimation',function f(aniId,opt){
	const sp=this.getSprite(); if(!sp) return;
	const ani=$dataAnimations&&$dataAnimations[aniId]; if(!ani) return;
	this.startAnimation();
	return sp.startAnimation(ani,false,0,opt);
},undefined,false,true);

new cfc(Sprite_Base.prototype).add('startAnimation',function f(ani,mir,dly,opt){
	opt=opt||{};
	$gameSystem.animationOptions_applyTo(opt,true);
	const sp=new Sprite_Animation();
	sp.setup(this._effectTarget,ani,mir,(opt.delay|0)+(dly|0),opt);
	this.parent.addChild(sp);
	this._animationSprites.push(sp);
	
	// opt other than delay and rate
	this.startAnimation_optOthers(opt,sp);
	
	return sp;
},undefined,false,true).add('startAnimation_optOthers',function f(opt,sp){
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
}).add('setScreenXy',function f(dx,dy,dur,sx,sy,){
	if((dur|=0) && 0<dur){ this._screenXyData={
		src:[
			sx===undefined?this._screenDx:sx-this.screenX(),
			sy===undefined?this._screenDy:sy-this.screenY(),
		],
		dst:[dx,dy],
		dur:0,
		durDst:dur,
	}; }
	this.updateScreenXy();
}).add('updateScreenXy',function f(){
	if(this._screenXyData && this._screenXyData.dur<this._screenXyData.durDst){
		const r=++this._screenXyData.dur/this._screenXyData.durDst;
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
		this._opacityDurDst=dur;
	}
	this.updateOpacity();
	return rtv;
}).add('updateOpacity',function f(){
	if(this._opacityDur<this._opacityDurDst){
		this._opacity=++this._opacityDur/this._opacityDurDst*(this._opacityDst-this._opacitySrc)+this._opacitySrc;
	}else this._opacityDst=this._opacitySrc=this._opacityDur=this._opacityDurDst=undefined;
},undefined,true,true).add('setPosition',function f(x,y){
	this._x = this._realX = x;
	this._y = this._realY = y;
},undefined,true,true);

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

{ const p=ImageManager;
(t=p.isDirectPath=function f(fname){
	return fname && fname.constructor===String && f.tbl.some(p=>fname.match(p));
}).ori=undefined;
t.tbl=[/^(data:|\.\/\/)/,];
p.splitUrlQueryHash=path=>{ if(!path) return ['','',''];
	const idx_sharp=path.indexOf("#");
	const rtv=idx_sharp<0?[path,'','',]:[path.slice(0,idx_sharp),'',path.slice(idx_sharp),];
	const idx_question=rtv[0].indexOf("?");
	if(idx_question>=0){
		rtv[1]=rtv[0].slice(idx_question);
		rtv[0]=rtv[0].slice(0,idx_question);
	}
	return rtv;
}
k='_loadBitmap';
r=p[k]; (p[k]=function(isReserve, folder, filename, hue, smooth, reservationId){
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
}).ori=r;
k='loadBitmap';
r=p[k]; (p[k]=function(folder, filename, hue, smooth){
	return this._loadBitmap(false, folder, filename, hue, smooth);
}).ori=r;
k='reserveBitmap';
r=p[k]; (p[k]=function(folder, filename, hue, smooth, reservationId){
	return this._loadBitmap(true , folder, filename, hue, smooth, reservationId);
}).ori=r;
k='loadNormalBitmap';
r=p[k]; (p[k]=function(path, hue){
	const key = this._generateCacheKey(path, hue);
	let bitmap = this._imageCache.get(key);
	if(!bitmap){
		this._imageCache.add(key, bitmap = Bitmap.load(path));
		bitmap.addLoadListener(()=>bitmap.rotateHue(hue));
	}else if(!bitmap.isReady()) bitmap.decode();
	return bitmap;
}).ori=r;
}

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
new cfc(p).add('render',function f(stage){
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
	}
	this.frameCount+=SceneManager._updateSceneCnt|0; SceneManager._updateSceneCnt=0|0;
},[
function(f){ f.call(this); },
],undefined,false,true).add('_createRenderer',function(){
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
},undefined,false,true).add('_createRenderer_onFail',function f(){
	if(this._rendererType==='auto') addUrlParamVal_qs('canvas');
},undefined,false,true);
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

new cfc(Graphics).add('_webgl_saveShader',function f(){
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
],true,true).add('_webgl_restoreShader',function f(gl,info){
	if(!info) return;
	gl.useProgram(info.CURRENT_PROGRAM);
	for(let arr=f.tbl[0].bindBuffer,x=arr.length;x--;) gl.bindBuffer(gl[arr[x]], info.getParameter[x], gl.STATIC_DRAW);
	for(let i=0,arrv=info.getVertexAttrib,sz=arrv.length;i!==sz;++i) if(arrv[i]) gl.vertexAttribPointer.apply(gl,arrv[i]);
},t,true,true);

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

// ---- ---- ---- ---- pretending localStorage is ok

(()=>{ let k,r,t;

new cfc(StorageManager).add('pseudoStorage_getCont',function f(){
	let rtv=this._pseudoStorage; if(!rtv) rtv=this._pseudoStorage=new Map();
	return rtv;
}).add('pseudoStorage_save',function f(key,val){
	this.pseudoStorage_getCont().set(key+'',val+'');
}).add('pseudoStorage_load',function f(key){
	return this.pseudoStorage_getCont().get(key+'')||null;
}).add('saveToWebStorage',function f(savefileId,json){
	try{
		return f.ori.apply(this,arguments);
	}catch(e){
		if(e instanceof DOMException){
			const key=this.webStorageKey(savefileId);
			const data=LZString.compressToBase64(json);
			this.pseudoStorage_save(key,data);
		}
	}
}).add('loadFromWebStorage',function f(savefileId){
	try{
		return f.ori.apply(this,arguments);
	}catch(e){
		if(e instanceof DOMException){
			const key=this.webStorageKey(savefileId);
			return LZString.decompressFromBase64(this.pseudoStorage_load(key));
		}
	}
});

})(); // pretending localStorage is ok

// ---- ---- ---- ----  map evt search table

(()=>{ let k,r,t;

DataManager._def_normalPriority=1;

new cfc(Game_Character.prototype).add('getPosKey',function(dx,dy){
	return $gameMap?$gameMap.getPosKey((dx|0)+(this.x|0),(dy|0)+(this.y|0)):undefined;
},undefined,false,true).add('isCollidedWithEvents',function f(x,y){
	return !!$gameMap.eventsXyNtNp(x,y).length;
},undefined,false,true).add('isNormalPriority',function f(){
	return DataManager._def_normalPriority===this._priorityType;
});

new cfc(Game_Map.prototype).add('getPosKey',function f(x,y){
	return $dataMap&&(0|x)+$dataMap.width*((y<<2)|2);
}).add('update',function f(){
	this.update_locTbl();
	return f.ori.apply(this,arguments);
}).add('update_locTbl',function f(){
	// called once per frame
	
	this._locTbl_updated_fllwrs=false;
	this._locTbl_updated_evts=false;
	
	this.update_locTbl_fllwrs(true);
	this.update_locTbl_evts(true);
	// only call update table when needed. just clean here
}).add('update_locTbl_fllwrs',function f(clearOnly){
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
]).add('update_locTbl_addFllwr',function f(fllwr,coord){
	if(!coord) return;
	const key=fllwr.getPosKey();
	let arr=coord.get(key); if(!arr) coord.set(key,arr=[]);
	return arr.push(fllwr);
}).add('update_locTbl_delFllwr',function f(fllwr,coord,x,y){
	throw new Error('not supported');
}).add('update_locTbl_chkFllwrErr',function f(fllwr){
	const followers=$gamePlayer&&$gamePlayer.followers();
	const fllwrs=followers&&followers._data;
	return !fllwrs||fllwrs._set&&!fllwrs._set.has(fllwr);
}).add('update_locTbl_evts',function f(clearOnly){
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
]).add('update_locTbl_addEvt',function f(evt,coord){
	if(!coord) return;
	const key=evt.getPosKey();
	let cont=coord.get(key); if(!cont) coord.set(key,cont=[]);
	return cont.uniquePush(evt);
}).add('update_locTbl_delEvt',function f(evt,coord,x,y){
	if(!coord) return;
	const key=this.getPosKey(x,y);
	const cont=coord.get(key); if(!cont) return;
	return cont.uniquePop(evt);
}).add('update_locTbl_chkEvtErr',function f(evt){
	return !this._events||this._events._set&&!this._events._set.has(evt);
}).add('update_locTbl_addEvt_overall',function f(evt){
	if(this.update_locTbl_chkEvtErr(evt)) return;
	const coords=this._events.coords; if(!coords) return;
	this.update_locTbl_addEvt(evt,coords[-1]);
	this.update_locTbl_addEvt(evt,coords[evt._priorityType]);
	if(!evt.isThrough()){
		const coordsNt=this._events.coordsNt;
		this.update_locTbl_addEvt(evt,coordsNt[-1]);
		this.update_locTbl_addEvt(evt,coordsNt[evt._priorityType]);
	}
}).add('update_locTbl_delEvt_overall',function f(evt,x,y){
	if(this.update_locTbl_chkEvtErr(evt)) return;
	const coords=this._events.coords; if(!coords) return;
	this.update_locTbl_delEvt(evt,coords[-1],x,y);
	this.update_locTbl_delEvt(evt,coords[evt._priorityType],x,y);
	if(!evt.isThrough()){
		const coordsNt=this._events.coordsNt;
		this.update_locTbl_delEvt(evt,this._events.coordsNt[-1],x,y);
		this.update_locTbl_delEvt(evt,this._events.coordsNt[evt._priorityType],x,y);
	}
}).add('eventsXy',function f(x,y){
	this.update_locTbl_evts();
	const coord=this._events&&this._events.coords&&this._events.coords[-1];
	return coord&&coord.get(this.getPosKey(x,y))||f.tbl[0];
},[
[],
]).add('eventsXyNt',function f(x,y){
	this.update_locTbl_evts();
	const coord=this._events&&this._events.coordsNt&&this._events.coordsNt[-1];
	return coord&&coord.get(this.getPosKey(x,y))||f.tbl[0];
},[
[],
]).add('eventsXyNtNp',function f(x,y){ // normal priority
	this.update_locTbl_evts();
	const coord=this._events&&this._events.coordsNt&&this._events.coordsNt[DataManager._def_normalPriority];
	return coord&&coord.get(this.getPosKey(x,y))||f.tbl[0];
},[
[],
]);

new cfc(Game_Followers.prototype).add('isSomeoneCollided',function f(x,y){
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
}).add('moveFailOn',function f(lastX,lastY,moveDirection){
}).add('moveSuccOn',function f(lastX,lastY,moveDirection){
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

// ---- ---- ---- ----  modify update reload

(()=>{ let k,r,t;

new cfc(Scene_Load.prototype).add('reloadMapIfUpdated',function f(){
	const verId_saved=$gameSystem.versionId();
	if(!verId_saved){ // ignore if it is diff from $dataSystem.versionId
		$gamePlayer.reserveTransfer($gameMap.mapId(), $gamePlayer.x, $gamePlayer.y);
		$gamePlayer.requestMapReload();
	}
});

})(); // modify update reload

// ---- ---- ---- ---- 

(()=>{ let k,r,t;

new cfc(SceneManager).add('run',function f(){
	setTimeout(exposeToTopFrame,f.tbl[0]);
	return f.ori.apply(this,arguments);
},[
1024,
]);

})();

// ---- ---- ---- ---- 

})();
