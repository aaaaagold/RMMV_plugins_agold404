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
const makeDummyWindowProto=t=function f(c,withContents,withCursor){
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
	const maxH=this.contentsHeight();
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
}).add('loadDataFile',function(name,src,directSrc,mimeType,method,data){
	method=method||'GET';
	mimeType=mimeType||'application/json';
	const xhr=new XMLHttpRequest();
	src=directSrc?src:('data/'+src);
	xhr.open(method,src);
	xhr.overrideMimeType(mimeType);
	xhr.onload = function() {
		if (xhr.status < 400) {
			window[name] = JSON.parse(xhr.responseText);
			DataManager.onLoad(window[name],name,src);
		}
	};
	xhr.onerror = this._mapLoader || function() {
		DataManager._errorUrl = DataManager._errorUrl || src;
	};
	window[name] = null;
	xhr.send(data);
	return xhr;
},undefined,true,true).add('onLoad',function f(obj,name,src){
	this.onLoad_before.apply(this,arguments);
	const rtv=f.ori.apply(this,arguments);
	this.onLoad_after.apply(this,arguments);
	return rtv;
},undefined,true).add('onLoad_before',function f(obj,name,src){
	const func=f.tbl.get(name);
	return func && func.apply(this,arguments);
},undefined,true).add('onLoad_after',function f(obj,name,src){
	const func=f.tbl.get(name);
	return func && func.apply(this,arguments);
},undefined,true).add('_onLoad_before_map',function f(obj,name,src){
	return this.onLoad_before_map.apply(this,arguments);
},undefined,true,true).add('_onLoad_after_map',function f(obj,name,src){
	return this.onLoad_after_map.apply(this,arguments);
},undefined,true,true).add('onLoad_before_map',function f(obj){
	// dummy
},undefined,true,true).add('onLoad_after_map',function f(obj){
	// dummy
},undefined,true,true).add('_onLoad_before_skill',function f(obj,name,src){
	return this.onLoad_before_skill.apply(this,arguments);
},undefined,true,true).add('_onLoad_after_skill',function f(obj){
	return this.onLoad_after_skill.apply(this,arguments);
},undefined,true,true).add('onLoad_before_skill',function f(obj,name,src){
	// dummy
},undefined,true,true).add('onLoad_after_skill',function f(obj){
	// dummy
},undefined,true,true).add('_onLoad_before_tileset',function f(obj,name,src){
	return this.onLoad_before_tileset.apply(this,arguments);
},undefined,true,true).add('_onLoad_after_tileset',function f(obj,name,src){
	return this.onLoad_after_tileset.apply(this,arguments);
},undefined,true,true).add('onLoad_before_tileset',function f(obj){
	// dummy
},undefined,true,true).add('onLoad_after_tileset',function f(obj){
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
		arr.forEach(key=>key&&Object.defineProperty(w,key,{ get:function(){ return window[key]; }, configurable: true }));
	}
	{
		const arr=[];
		arr.push('AudioManager','BattleManager','ConfigManager','DataManager','ImageManager','SceneManager',);
		arr.push('Input','TouchInput',);
		arr.push('Graphics','PIXI','Sprite','Bitmap','WebAudio',);
		arr.push('Game_BattlerBase','Game_Battler','Game_Enemy','Game_Actor','Game_Action',);
		arr.push('Game_CharacterBase','Game_Character','Game_Event','Game_Player',);
		arr.push('Game_Interpreter','Game_Picture','Game_System','Game_Screen','Game_Map',);
		arr.push('Window_Base','Window_Message',);
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
}).add('otherFiles_getData',function f(){
	const m=this.otherFiles_getDataMap();
	return m.get(path);
}).add('otherFiles_delData',function f(){
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

new cfc(Game_Interpreter.prototype).add('getEvt',function f(){
	// map init ensures '_events' be Array
	return $gameMap&&$gameMap._events[this._eventId];
}).add('getCmd',function f(offset){
	offset|=0;
	return this._list&&this._list[this._index+offset];
});

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

// ---- ---- ---- ---- 

exposeToTopFrame();

// ---- ---- ---- ---- 

})();
