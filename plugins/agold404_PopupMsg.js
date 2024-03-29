"use strict";
/*:
 * @plugindesc popup msg
 * @author agold404
 * @help .
 * 
 * This plugin can be renamed as you want.
 */

(()=>{ let k,r,t;

const a=function Window_PopupMsg(){
	this.initialize.apply(this,arguments);
};
a.ori=Window_Help;
t=[a.ori.prototype];
window[a.name]=a;
const p=a.prototype=Object.create(t[0]);
p.constructor=a;
new cfc(p).add('initialize',function f(numLines,opt){
	const rtv=f.tbl[0].initialize.apply(this,arguments);
	this._currFrame=0;
	if(opt){
		// dur = show + fade
		this._showFrame=opt.showFrame;
		this._fadeFrame=opt.fadeFrame;
	}
	if(isNaN(this._showFrame)) this._showFrame=90;
	if(isNaN(this._fadeFrame)) this._fadeFrame=30;
	if(this._fadeFrame<0) this._fadeFrame=0;
	this._isEnded=false;
	return rtv;
},t,false,true);
new cfc(p).add('update',function f(){
	const rtv=f.tbl[0].update.apply(this,arguments);
	++this._currFrame;
	if(this._currFrame>=this._showFrame){
		if(this._currFrame>=this._showFrame+this._fadeFrame){
			this.alpha=0;
			this._isEnded=true;
		}else this.alpha=(this._showFrame+this._fadeFrame-this._currFrame)/this._fadeFrame;
	}
	return rtv;
},t,false,true);

new cfc(Game_Temp.prototype).add('popupMsg',function f(msg,opt){
	// opt = {loc:"LU/LD/RU/RD/UL/DL/UR/DR"}
	opt=opt||f.tbl[0];
	const root=this._popupMsg_getCont(opt); if(!root) return;
	msg+='';
	const lines=msg.split('\n');
	const wnd=new Window_PopupMsg(lines.length,opt);
	wnd.width=root._maxWidth;
	wnd.setText(msg);
	root.addChild(wnd);
	return wnd;
},[
{loc:"UR",},
]).add('_popupMsg_getCont',function f(opt){
	// opt = {loc:"LU/LD/RU/RD/UL/DL/UR/DR"}
	if(!f.tbl[1]){ f.tbl[1]={
		UR:"UR",
		RU:"UR",
		DR:"DR",
		RD:"DR",
		UL:"UL",
		LU:"UL",
		DL:"DL",
		LD:"DL",
	}; }
	const loc=f.tbl[1][opt&&opt.loc]; // false-like: global root
	let rtv=$gameTemp._popupMsgs;
	if(!rtv){
		rtv=$gameTemp._popupMsgs=new Sprite();
		const rmc=f.tbl[0].removeChild; if(rmc) rtv.removeChild=rmc;
	}
	const sc=SceneManager._scene; if(sc && sc!==rtv.parent) sc.addChild(sc._popupMsgs=rtv);
	if(loc){
		if(!rtv[loc]) rtv=rtv[loc]=f.tbl[2][loc](f.tbl,rtv);
		else rtv=rtv[loc];
	}
	return rtv;
},[
{
update:function f(){
	const rtv=Sprite.prototype.update.apply(this,arguments);
	const arr=this.children; if(arr) for(let x=arr.length;x--;) if(arr[x]._isEnded) this.removeChildAt(x);
	return rtv;
},
addChild:function f(c){
	const arr=this.children;
	let len=arr&&arr.length;
	if(this._atBtm){
		if(len&&arr.back.y+arr.back.height<c.height) this.removeChildAt(--len);
		c.y=this._maxHeight-c.height;
		if(len){
			arr[0].y=c.y-arr[0].height; for(let x=1;x!==len;++x) arr[x].y=arr[x-1].y-arr[x].height;
		}
	}else{
		if(len&&c.height+arr.back.y>=this._maxHeight) this.removeChildAt(--len);
		c.y=0;
		if(len){
			arr[0].y=c.height; for(let x=1;x!==len;++x) arr[x].y=arr[x-1].y+arr[x-1].height;
		}
	}
	return Sprite.prototype.addChildAt.call(this,c,0);
},
removeChild:function (c){
	return;
}, // disabled
},
undefined,
{
UR:function(tbl,sp){
	let rtv=sp._UR;
	if(!rtv){
		rtv=sp._UR=new Sprite();
		rtv._atBtm=false;
		for(let k in tbl[0]) rtv[k]=tbl[0][k];
		rtv.x=Graphics.boxWidth>>1;
		rtv.y=0;
		rtv._maxWidth=Graphics.boxWidth>>1;
		rtv._maxHeight=Graphics.boxHeight;
		sp.addChild(rtv);
	}
	return rtv;
},
DR:function(tbl,sp){
	let rtv=sp._DR;
	if(!rtv){
		rtv=sp._DR=new Sprite();
		rtv._atBtm=true;
		for(let k in tbl[0]) rtv[k]=tbl[0][k];
		rtv.x=Graphics.boxWidth>>1;
		rtv.y=0;
		rtv._maxWidth=Graphics.boxWidth>>1;
		rtv._maxHeight=Graphics.boxHeight;
		sp.addChild(rtv);
	}
	return rtv;
},
UL:function(tbl,sp){
	let rtv=sp._UL;
	if(!rtv){
		rtv=sp._UL=new Sprite();
		rtv._atBtm=false;
		for(let k in tbl[0]) rtv[k]=tbl[0][k];
		rtv.x=0;
		rtv.y=0;
		rtv._maxWidth=Graphics.boxWidth>>1;
		rtv._maxHeight=Graphics.boxHeight;
		sp.addChild(rtv);
	}
	return rtv;
},
DL:function(tbl,sp){
	let rtv=sp._DL;
	if(!rtv){
		rtv=sp._DL=new Sprite();
		rtv._atBtm=true;
		for(let k in tbl[0]) rtv[k]=tbl[0][k];
		rtv.x=0;
		rtv.y=0;
		rtv._maxWidth=Graphics.boxWidth>>1;
		rtv._maxHeight=Graphics.boxHeight;
		sp.addChild(rtv);
	}
	return rtv;
},
},
undefined,
]);

new cfc(SceneManager).add('onSceneChange',function f(){
	const rtv=f.ori&&f.ori.apply(this,arguments);
	this.onSceneChange_popupMsgs();
	return rtv;
}).add('onSceneChange_popupMsgs',function f(){
	// addChild
	return $gameTemp&&$gameTemp._popupMsg_getCont();
});

new cfc(Scene_Map.prototype).add('createDisplayObjects',function f(){
	const msgs=this._popupMsgs;
	if(msgs) this.removeChild(msgs);
	const rtv=f.ori.apply(this,arguments);
	if(msgs) this.addChild(msgs);
	return rtv;
});

})();
