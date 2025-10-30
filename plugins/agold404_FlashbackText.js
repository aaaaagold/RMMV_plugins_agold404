"use strict";
/*:
 * @plugindesc 劇情對話文字回顧 flashbackText
 * @author agold404
 * @help SceneManager.push(Scene_FlashbackText);
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t; const isNone=o=>o==null;

const enableShortcutScenes=new Set([
Scene_Map,
Scene_Battle,
Scene_Menu,
Scene_Item,
Scene_Skill,
Scene_Equip,
Scene_Status,
]);

{
const a=function Scene_FlashbackText(){
	this.initialize.apply(this, arguments);
};
a.ori=Scene_MenuBase;
window[a.name]=a;
const p=a.prototype=Object.create(a.ori.prototype);
p.constructor=a;
k='initialize';
new cfc(p).
addWithBaseIfNotOwn(k,function f(){
	const rtv=f.ori.apply(this,arguments);
	this._prevScene_store();
	return rtv;
},[
k,
a.ori.prototype,
function(){ Scene_Base.prototype.stop.call(this); },
]);
k='create';
new cfc(p).
addWithBaseIfNotOwn(k,function f(){
	const rtv=f.ori.apply(this,arguments);
	this.createWindows();
	this._prevScene_restore();
	return rtv;
},[k,a.ori.prototype]);
new cfc(p).
addBase('updateActor',function f(){
	
}).
addBase('createWindows',function f(){
	this.createCommandWindow();
	this.createFlashbackTextWindow();
	this.loadImgs();
}).
addBase('createCommandWindow',function f(){
	const wc=this._commandWindow=new Window_FlashbackText_command(0,0);
	for(let x=0,arr=wc.makeCommandList.tbl;x!==arr.length;++x) wc.setHandler(arr[x].param[1], arr[x].func.bind(this));
	this.addWindow(wc);
}).
addBase('createFlashbackTextWindow',function f(){
	const wt=this._flashbackTextWindow=new Window_FlashbackText();
	wt.height=wt._windowHeight=Graphics.boxHeight-this._commandWindow.height;
	wt.y=this._commandWindow.height;
	this.addWindow(wt);
}).
addWithBaseIfNotOwn('start',function f(){
	this._seEchoBack=$gameSystem&&$gameSystem.seEcho_opt_get&&$gameSystem.seEcho_opt_get();
	const rtv=f.ori.apply(this,arguments);
	this._flashbackTextWindow.scrollBottom().open();
	return rtv;
}).
addWithBaseIfNotOwn('terminate',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.terminate_restoreSeEcho();
	return rtv;
}).addBase('terminate_restoreSeEcho',function f(){
	if(!$gameSystem||!$gameSystem.seEcho_opt_set) return;
	if(this._seEchoBack) $gameSystem.seEcho_opt_set(this._seEchoBack);
	else $gameSystem.seEcho_opt_clear();
}).
addBase('loadImgs',function f(){
	$gameTemp.flashbackText_getCont().forEach(f.tbl[0]);
},[
info=>{
	const faceName=info&&info.face&&info.face.name;
	if(faceName) ImageManager.loadFace(faceName);
},
]);
new cfc(a).
addBase('enableShortcutScenes_add',function f(...constructors){
	for(let x=0,xs=constructors.length;x!==xs;++x) f.tbl[0].add(constructors[x]);
	return this;
},enableShortcutScenes).
addBase('enableShortcutScenes_del',function f(c){
	for(let x=0,xs=constructors.length;x!==xs;++x) f.tbl[0].delete(constructors[x]);
	return this;
},enableShortcutScenes);
}

{
const a=function Window_FlashbackText_command(){
	this.initialize.apply(this, arguments);
};
a.ori=Window_HorzCommand;
window[a.name]=a;
const p=a.prototype=Object.create(a.ori.prototype);
p.constructor=a;
t=[
{
	param:["使用ESC或按此關閉","cancel",],
	func:function f(){this.popScene();},
},
];
new cfc(p).add('makeCommandList',function f(){
	const wc=this;
	for(let x=0,arr=f.tbl;x!==arr.length;++x){
		wc.addCommand.apply(wc,arr[x].param);
	}
},t,true,true).add('itemWidth',function f(){
	return ~~(this.contentsWidth()/f.tbl.length);
},t,true,true).add('windowWidth',function f(){
	return Graphics.boxWidth;
},undefined,true,true);
t=undefined;
}

{
const a=function Window_FlashbackText(){
	this.initialize();
};
a.ori=Window_Message;
window[a.name]=a;
const p=a.prototype=Object.create(a.ori.prototype);
p.constructor=a;
new cfc(p).
addWithBaseIfNotOwn('initMembers',function f(){
	const rtv=f.ori.apply(this,arguments);
	this._windowPauseSignSprite.visible=false;
	this._lastRedrawFrame=Graphics.frameCount;
	this._scrollTxtY=0;
	this._shouldRedraw=false;
	this._windowHeight=undefined;
	this._scrollTxtY_max=undefined;
	return rtv;
}).
addBase('processSubtext',function f(subtext,textState){
	return Window_Base.prototype.processSubtext.apply(this,arguments);
}).
addBase('getPrevTextInfoStack',function f(textState){
	return Window_Base.prototype.getPrevTextInfoStack.apply(this,arguments);
}).
addBase('update',function f(){
	Window_Base.prototype.update.apply(this,this,arguments);
	this.redrawtxt();
	this.processInputs();
}).
addBase('_update_calcHeights',function f(arr){
	return this._redrawtxt(arr,true);
}).
addBase('windowHeight',function f(){
	return isNaN(this._windowHeight)?Graphics.boxHeight:this._windowHeight;
}).add('updatePlacement',function f(){
	
},undefined,true,true).
addBase('createSubWindows',function f(){
	if(!f.tbl[0]){
		const dummy={y:0,height:0,terminateMessage:none,};
		f.tbl[0]={
			_goldWindow:{open:none,},
			_choiceWindow:none,//new Window_ChoiceList(dummy),
			_numberWindow:none,//new Window_NumberInput(dummy),
			_itemWindow:none,//new Window_EventItem(dummy),
		};
	}
	for(let x=0,arr=f.tbl[1],xs=arr.length;x!==xs;++x) this[arr[x]]=f.tbl[0][arr[x]];
},[
undefined,
['_goldWindow','_choiceWindow','_numberWindow','_itemWindow',],
]).
addBase('subWindows',function f(){
	return f.tbl[0];
},[
[],
]).
addBase('processCharacter_addPrinted',none).
addBase('processNormalCharacter',function f(textState){
	return f._super.processNormalCharacter.apply(this,arguments);
}).
addRoof('processNormalCharacter',function f(textState){
	if(this._flashbackContentXShifted) return f.ori.apply(this,arguments);
	this._flashbackContentXShifted=true;
	textState.x+=this.textPadding();
	const rtv=f.ori.apply(this,arguments);
	textState.x-=this.textPadding();
	this._flashbackContentXShifted=false;
	return rtv;
}).
addBase('_redrawtxt',function f(arr,isCalcH){
	const bak_faceName=$gameMessage._faceName;
	if(!isCalcH) this.contents.clear();
	const fh1=this.fittingHeight(1),lh=this.lineHeight();
	const ch=this.contentsHeight(),yInit=isCalcH?0:-this._scrollTxtY;
	const textState={x:undefined,left:undefined,y:yInit,height:0,isMeasureOnly:isCalcH};
	const tp=this.textPadding();
	let clean=true,dy=0;
	for(let x=0;x!==arr.length;++x){
		if(x){
			textState.y+=this.padding;
			dy+=this.padding;
		}
		if(!isCalcH && textState.y>=ch) break;
		const hasNameField=!isNone(arr[x].nameField);
		const nameFieldHeight=hasNameField?lh:0;
		if(textState.y+arr[x].height<0||(isCalcH&&arr[x].height!==undefined)){
			// skip
			textState.y+=arr[x].height+nameFieldHeight;
			//console.log('skip',arr[x].height,nameFieldHeight); // debug
		}else{
			clean=false;
			const face=arr[x].face;
			$gameMessage._faceName=face.name;
			this.resetFontSettings();
			const y=textState.y+nameFieldHeight;
			if(hasNameField){
				if(!isCalcH){
					let ga,ctx;
					if(ctx=this.contents.context){
						ga=ctx.globalAlpha;
						ctx.globalAlpha=ga*f.tbl[0].nfIconMulAlpha;
						this.drawIcon(f.tbl[0].nfIcon,f.tbl[0].x+f.tbl[0].nfIconDx,y-lh);
						ctx.globalAlpha=ga;
					}
					textState.index=0;
					this.drawTextEx(arr[x].nameField,
						//textState.x=textState.left=tp+f.tbl[0].x+f.tbl[0].nfDx,y-lh,
						textState.x=textState.left=f.tbl[0].x+f.tbl[0].nfDx,y-lh,
						0,0,textState,
					);
				}
				textState.y+=nameFieldHeight;
			}
			if(!isCalcH && face.name) this.drawFace(face.name, face.idx, f.tbl[0].x, y);
			textState.index=0;
			this.drawTextEx(arr[x].txt,
				//textState.x=textState.left=tp+this.newLineX(),y,
				textState.x=textState.left=this.newLineX(),y,
				0,0,textState,
			);
			// calcTextHeight(txt,false) called when '\n' ; returns 1 line height at a time
			arr[x].height=(textState.y+=textState.height)-y;
			if(face.name) textState.y=(arr[x].height=Math.max(arr[x].height,Window_Base._faceHeight))+y;
			//console.log('not skip',arr[x].height,nameFieldHeight); // debug
		}
		//console.log('',textState.y); // debug
		dy+=arr[x].height+nameFieldHeight;
	}
	if(isCalcH && !clean && this.contents) this.contents.clear();
	$gameMessage._faceName=bak_faceName;
	//console.log('isCalcH',isCalcH,yInit,dy); // debug
	return dy;
},[
{x:0,nfDx:16,nfIcon:83,nfIconMulAlpha:0.625,nfIconDx:-16},
]).
addBase('redrawtxt',function f(forced){
	if(( !this._shouldRedraw ||
		this._lastRedrawFrame===Graphics.frameCount ||
		!this.isOpen() || 
		!$gameTemp ||
	false )&&!forced) return;
	this._shouldRedraw=false;
	this._lastRedrawFrame=Graphics.frameCount;
	
	const arr=$gameTemp.flashbackText_getCont();
	this._update_calcHeights(arr);
	const rtv=this._redrawtxt(arr);
	if(this._scrollTxtY_max===undefined) this._scrollTxtY_max=Math.max(rtv-this.contentsHeight(),0);
	return rtv;
}).
addBase('setScrollSound',function f(newY,lastY){
	const delta=newY-lastY;
	if($gameSystem&&$gameSystem.seEcho_opt_set&&$gameSystem.seEcho_echos_clear){
		if(delta){
			if(!this._isSePlayedLastFrame){
				this._isSePlayedLastFrame=true;
				$gameSystem.seEcho_opt_set({delayFrame:f.tbl[0][0],nextVolRate:f.tbl[0][1],affectStaticSe:f.tbl[0][2],});
				SoundManager.playCursor();
			}
		}else{
			$gameSystem.seEcho_echos_clear();
			this._isSePlayedLastFrame=false;
		}
	}else{
		if(delta) SoundManager.playCursor();
	}
},[
[4,0.875,true,], // 0: $gameSystem.seEcho_opt_set
]).
addBase('setScrollBar',function f(y){
	
}).
addBase('setScrollTxtY',function f(val){
	if(val<0) val=0; // not using !(val>=0) for debug
	if(this._scrollTxtY_max<val) val=this._scrollTxtY_max;
	this.setScrollSound(val,this._scrollTxtY);
	if(this._scrollTxtY!==val){
		this._scrollTxtY=val;
		this._shouldRedraw=true;
		this.upArrowVisible=!!val;
		this.downArrowVisible=val!==this._scrollTxtY_max;
		this.setScrollBar(this._scrollTxtY);
	}
}).
addBase('scrollBottom',function f(){
	if(!$gameTemp) return;
	let val=this._update_calcHeights($gameTemp.flashbackText_getCont())-this.contentsHeight();
	if(!(val>=0)) val=0;
	this.setScrollTxtY(val);
	return this;
}).
addWithBaseIfNotOwn('updateOpen',function f(){
	const op=this._opening;
	const rtv=f.ori.apply(this,arguments);
	if(op && !this._opening) this._shouldRedraw=true;
	return rtv;
}).
addBase('processInputs',function f(){
	let delta=TouchInput.wheelY;
	if(TouchInput.isPressed()){
		const dy=TouchInput.y-this._lastTouchedY;
		if(dy) delta-=dy;
		this._lastTouchedY=TouchInput.y;
	}
	if(TouchInput.isReleased()){
		const dy=TouchInput.y-this._lastTouchedY;
		if(dy) delta-=dy;
		this._lastTouchedY=undefined;
	}
	if(Input.isPressed('up'   ) || Input.isTriggered('up'   ) || Input.isLongPressed('up'   )) delta-=f.tbl[0];
	if(Input.isPressed('down' ) || Input.isTriggered('down' ) || Input.isLongPressed('down' )) delta+=f.tbl[0];
	if(Input.isTriggered('pageup'   ) || Input.isLongPressed('pageup'   )) delta-=this.contentsHeight();
	if(Input.isTriggered('pagedown' ) || Input.isLongPressed('pagedown' )) delta+=this.contentsHeight();
	if(Input.isTriggered('home')^Input.isTriggered('end')){
		if(Input.isTriggered('home')) delta=-this._scrollTxtY;
		else delta=this._scrollTxtY_max-this._scrollTxtY||0;
	}
	this.setScrollTxtY(this._scrollTxtY+delta);
},[16,]).
addWithBaseIfNotOwn('processEscapeCharacter',function f(){
	let tmp;
	try{
		return f.ori.apply(this,tmp=arguments);
	}catch(e){
		console.warn(tmp);
		return f.tbl[0];
	}
},['',]);
t=()=>{};
for(let x=0,arr=['_updateCursor','_updatePauseSign',];x!==arr.length;++x) new cfc(p).add(arr[x],t,undefined,true,true);
t=undefined;
new cfc(p).addBase('_processEscapeCharacter_withPictureBehind',none);
}

new cfc(Game_System.prototype).
addBase('flashbackText_savedCont_get',function f(){
	let q=this._flashbackText_savedCont;
	if(!(q instanceof Queue)) q=Object.assign(new Queue(),q);
	this._flashbackText_savedCont=q;
	return q;
});

new cfc(Game_Temp.prototype).
addBase('flashbackText_add',function f(txt,face,fidx,nameField){
	if($gameSystem && $gameSystem._flashbackText_disabled) return;
	if(!f.tbl[0].re) f.tbl[0].re=/(?<!(\\))((\\\\)*)(\\([VPNvpn])\[(\d+)\])/g;
	if(!f.tbl[0].re_discards) f.tbl[0].re_discards=/\f/g;
	const obj={txt:txt.replace(f.tbl[0].re_discards,'').replace(f.tbl[0].re,f.tbl[0]),face:{name:face,idx:fidx},nameField:nameField,y:undefined,height:undefined,_debug:{_mapId:$gameMap&&$gameMap._mapId,},};
	this._flashbackText_getCont().push(obj);
	const q=$gameSystem.flashbackText_savedCont_get();
	q.push(obj); for(let th=f.tbl[1];th<q.length;) q.pop();
},[
function f(){
	if(!f.tbl){
		f.tbl={
			V:n=>$gameVariables.value(n),
			P:Window_Base.prototype.partyMemberName,
			N:Window_Base.prototype.actorName,
		};
		for(let x=0,s="VPN",xs=s.length;x!==xs;++x) f.tbl[s[x].toLowerCase()]=f.tbl[s[x]];
	}
	const slashes=arguments[2]||"",key=arguments[5],val=arguments[6]-0; // to num type
	if(key in f.tbl) return slashes+f.tbl[key](val);
	return arguments[0];
},
10,
]).
addBase('_flashbackText_getCont',function f(){
	let rtv=this._flashbackTexts;
	if(!rtv){
		rtv=this._flashbackTexts=[];
		const saved=$gameSystem&&$gameSystem.flashbackText_savedCont_get();
		if(saved) saved.forEach(f.tbl[0],rtv);
	}
	return rtv;
},[
function(x){ this.push(x); },
]).
addBase('flashbackText_getCont',function f(){
	return this._flashbackText_getCont();
}).
addBase('flashbackText_clearAll',function f(){
	this.flashbackText_getCont().length=0;
	return this;
}).
addBase('_flashbackText_getWindow',function f(){
	const sc=SceneManager._scene;
	let w=sc._window_flashbackText; if(!w) w=sc._window_flashbackText=new Window_FlashbackText(0,0,Graphics.boxWidth,Graphics.boxHeight);
	return w;
}).
addBase('flashbackText_show',function f(){
	return SceneManager.push(Scene_FlashbackText);
	const w=this._flashbackText_getWindow();
	SceneManager._scene.addWindow(w);
	w.open();
	w.scrollBottom()._shouldRedraw=true;
	return w;
}).
addBase('flashbackText_isWindowClosed',function f(){
	return this._flashbackText_getWindow().isClosed();
}).
getP;


new cfc(Window_Message.prototype).
addBase('flashbackText_addPrinted',function f(){
	const textState=this._textState;
	if(textState && $gameTemp && $gameMessage) $gameTemp.flashbackText_add(textState.printed||f.tbl[0],$gameMessage.faceName(),$gameMessage.faceIndex(),$gameMessage._nameField);
},[
"", // 0: default printed
]).
add('onEndOfText',function f(){
	this.flashbackText_addPrinted();
	return f.ori.apply(this,arguments);
}).
addBase('processCharacter_addPrinted',function f(text,textState){
	if(!text||textState.isMeasureOnly) return;
	if(!textState.printed) textState.printed=text;
	else textState.printed+=text;
}).
addRoof('processNormalCharacter',function f(textState){
	this.processCharacter_addPrinted(textState.text[textState.index],textState);
	return f.ori.apply(this,arguments);
}).
addRoof('processNewLine',function f(textState){
	this.processCharacter_addPrinted('\n',textState);
	return f.ori.apply(this,arguments);
}).
addRoof('processNewPage',function f(textState){
	this.processCharacter_addPrinted('\f',textState);
	return f.ori.apply(this,arguments);
}).
addRoof('processEscapeCharacter',function f(code,textState){
	const rtv=f.ori.apply(this,arguments);
	this.processCharacter_addPrinted(rtv,textState);
	return rtv;
}).
addBase('flashbackText_processSubtext',function f(subtext,textState,reason){
	if(!textState||textState.isMeasureOnly) return;
	textState.printed=undefined;
}).
addRoof('processSubtext',function f(subtext,textState,reason){
	const rtv=f.ori.apply(this,arguments);
	this.flashbackText_processSubtext.apply(this,arguments);
	return rtv;
}).
addRoof('cloneTextInfo',function f(textState,reason){
	const rtv=f.ori.apply(this,arguments);
	rtv.printed=textState.printed;
	rtv.reason=reason;
	return rtv;
}).
addBase('flashbackText_setTextInfo',function f(textState,textInfo){
	if(!textInfo) return;
	const reason=textInfo.reason;
	const prefix=reason&&reason.prefix||"";
	const suffix=reason&&reason.suffix||"";
	const arrange=reason&&reason.arrange||f.tbl[0];
	if(textState.printed) textState.printed=(textInfo.printed?textInfo.printed+f.tbl[1]:"")+(prefix+arrange(textState.printed)+suffix);
	else textState.printed=textInfo.printed&&textInfo.printed+f.tbl[1];
},[
filterArg0,
"\\;", // 1: separator to prevent unwanted concatenate since the end of `textInfo.printed` might be escaped.
]).
addRoof('setTextInfo',function f(textState,textInfo){
	this.flashbackText_setTextInfo.apply(this,arguments);
	return f.ori.apply(this,arguments);
}).
getP;

if(!enableShortcutScenes.size) return;
const key='r',keyName='openFlashback';
const f=function(){
	const sc=SceneManager._scene;
	if(sc && sc.isActive() && $gameTemp && Input.isPressed(f.tbl[0]) && f.tbl[1].has(sc.constructor)) $gameTemp.flashbackText_show();
};
f.ori=undefined;
f.tbl=[
keyName,
enableShortcutScenes,
];
Input.addKeyName(key.toUpperCase().charCodeAt(),keyName);
new cfc(Scene_Boot.prototype).
add('terminate_after',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.flashbackText_addKeySensor();
	return rtv;
}).
addBase('flashbackText_addKeySensor',function f(){
	if(f._called) return;
	if(SceneManager.additionalUpdate_renderScene_add) SceneManager.additionalUpdate_renderScene_add(f.tbl[0],true);
	f._called=true;
},[f]).
getP;

})();
