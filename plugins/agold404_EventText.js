"use strict";
/*:
 * @plugindesc display texts on events
 * @author agold404
 * @help starting with (at-sign)EVENTTEXT in comment (event command) without leading and tailing spaces
 * the following lines will be the texts displayed on the event
 * 
 * the next (at-sign)EVENTTEXT in comment (event command) in the same event page will be the next lines of texts
 * (at-sign)EVENTTEXT<A>
 *   A can be: L/R/D/O, means align to left/right/down edge or the origin of the event.
 *   e.g. (at-sign)EVENTTEXT<D> to align to down edge of the event.
 *   take the LAST setting in a event page as the final setting of this event page.
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

new cfc(DataManager).add('onLoad_after_map',function f(obj){
	const rtv=f.ori.apply(this,arguments);
	this.onLoad_after_map_setEventTexts(obj);
	return rtv;
}).
addBase('onLoad_after_map_setEventTexts',function f(obj){
	obj.events.forEach(f.tbl[0]);
},t=[
function f(evtd){ if(!evtd) return;
	if(!f._info){ f._info={
		pattern:/^@EVENTTEXT(<(.+)>)?$/,
		aligns:{
			D:"D",
			L:"L",
			O:"O",
			R:"R",
			_:"U",
		},
	}; }
	for(let p=0,pgv=evtd.pages,pe=pgv.length;p!==pe;++p){
		const txtv=pgv[p].textv=[];
		let isTextComment=false;
		let align;
		for(let c=0,cmdv=pgv[p].list,ce=cmdv.length;c!==ce;++c){
			const cmd=cmdv[c];
			const code=cmd.code;
			if(isTextComment){
				if(code===108||code===408) txtv.push(cmd.parameters[0]);
				else isTextComment=false;
			}else if(code===108 && cmd.parameters[0] && cmd.parameters[0].match){
				const m=cmd.parameters[0].match(f._info.pattern);
				if(m){
					align=f._info.aligns[m[2]];
					isTextComment=true;
				}
			}
		}
		align=align||f._info.aligns._;
		txtv._txtalign=align;
	}
},
]).
getP;

new cfc(Game_Character.prototype).
addBase('getTextv',function f(){
	const rtv=this._textv;
	if(rtv) rtv._txtalign=this._texta; // consider saves
	return rtv;
}).
addBase('setTextv',function f(arr,isAutoUpdateSprite){
	this._textv=arr;
	this._texta=arr&&arr._txtalign;
	if(isAutoUpdateSprite){
		const sp=SceneManager.getSprite(this);
		if(sp) sp.setChrTextv(this.getTextv()); // event._erased
	}
	return this;
}).
getP;

new cfc(Sprite_Character.prototype).add('setCharacter',function f(chr){
	const rtv=f.ori.apply(this,arguments);
	this.setChrTextv(chr.getTextv());
	return rtv;
}).
addBase('setChrTextv',function f(arr){
	if(!arr) arr=f.tbl[0];
	this._texta=arr._txtalign;
	return this.setChrTxt(arr.join('\n'));
},[
[], // 0: empty textv
]).
addBase('setChrTxt',function f(txt){
	let wt=this._textWnd;
	if(!wt){
		if(!txt) return this;
		const c=new PIXI.Container();
		c.addChild(wt=this._textWnd=new Window_Text(0,0,1,1));
		wt._character=this._character;
		this.addChild(c);
	}
	wt.setText(txt);
	return this;
}).add('setCharacter',function f(chr){
	const rtv=f.ori.apply(this,arguments);
	if(this._textWnd){
		this._textWnd._character=chr;
		this._textWnd._lastText && this._textWnd.reApplyText(false);
	}
	return rtv;
}).add('update',function f(){
	const rtv=f.ori.apply(this,arguments);
	this.updateText();
	return rtv;
}).
addBase('updateText',function f(){
	const p=this._textWnd&&this._textWnd.parent; if(!p) return;
	const func=f.tbl[0][this._texta]||f.tbl[0]._;
	func.call(this,p);
},[
{
D:function(p){
	p.position.set(0,this.height*(1-this.anchor.y)+this._textWnd.height);
},
L:function(p){
	p.position.set(this.width*-this.anchor.x,0);
},
O:function(p){
	p.position.set(0,this._textWnd.height>>1);
},
R:function(p){
	p.position.set(this.width*(1-this.anchor.x),0);
},
_:function(p){
	// U
	p.position.set(0,this.height*-this.anchor.y);
},
},
]).
addBase('getTextWindow',function f(){
	return this._textWnd;
}).
addBase('reApplyWindowText',function f(){
	const wnd=this.getTextWindow();
	if(wnd) wnd.reApplyText(false);
	return this;
}).
getP;

new cfc(Game_Event.prototype).
add('setupPage',function f(){
	const rtv=f.ori.apply(this,arguments);
	const page=this.page();
	this.setTextv(page&&page.textv&&page.textv.length?page.textv:undefined,true);
	return rtv;
}).
addWithBaseIfNotOwn('getTextv',function f(){
	if(this._erased) return f.tbl[0];
	return f.ori.apply(this,arguments);
},[
[], // 0: empty
]).
getP;

})();
